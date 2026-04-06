'use client'
/**
 * OfflineEngine — Offline-first banking infrastructure.
 *
 * Solves the #1 African e-wallet problem: network unreliability.
 * Every transaction is queued locally first, then synced when online.
 * Balance is always cached — you always know what you have.
 */

import * as React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NetworkStatus {
  online: boolean
  quality: 'fast' | 'slow' | 'offline'
  lastOnline: Date | null
}

export interface OfflineBalance {
  cowrie: number
  afriCoin: number
  held: number
  ubuntuScore: number
}

export interface OfflineBalanceResult {
  balance: OfflineBalance | null
  isStale: boolean
  lastUpdated: Date | null
  refresh: () => Promise<void>
}

export interface QueuedTransaction {
  id: string
  fromAfroId: string
  toAfroId: string
  amount: number
  currency: string
  reason?: string
  queuedAt: string
  status: 'queued' | 'syncing' | 'settled' | 'failed'
  settledAt?: string
  koweHash?: string
  retryCount: number
}

export interface TransactionQueueResult {
  queue: QueuedTransaction[]
  enqueue: (tx: Omit<QueuedTransaction, 'id' | 'queuedAt' | 'status' | 'retryCount'>) => QueuedTransaction
  processQueue: () => Promise<void>
  pendingCount: number
  totalQueued: number
}

export interface LedgerEntry {
  id: string
  afroId: string
  type: string
  label: string
  amount: number
  koweHash: string
  timestamp: string
  eventType: string
}

export interface OfflineLedgerResult {
  entries: LedgerEntry[]
  refresh: () => Promise<void>
  isStale: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STALE_MS = 5 * 60 * 1000 // 5 minutes
const MAX_RETRIES = 3
const MAX_LEDGER_ENTRIES = 50

function getLocalJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function setLocalJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or private mode — silent fail
  }
}

function generateTxId(): string {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase()
  const ts = Date.now().toString(36).toUpperCase()
  return `TX-${ts}-${rand}`
}

// ─── navigator.connection typing ─────────────────────────────────────────────

interface NavigatorConnectionExt extends Navigator {
  connection?: {
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
    downlink?: number
    addEventListener?: (type: string, listener: () => void) => void
    removeEventListener?: (type: string, listener: () => void) => void
  }
}

function detectQuality(): 'fast' | 'slow' | 'offline' {
  if (typeof navigator === 'undefined') return 'offline'
  if (!navigator.onLine) return 'offline'
  const conn = (navigator as NavigatorConnectionExt).connection
  if (!conn) return 'fast' // no Network Information API — assume fine
  const eff = conn.effectiveType
  if (eff === 'slow-2g' || eff === '2g') return 'slow'
  if (eff === '3g') return 'slow'
  return 'fast'
}

// ─── Hook: useNetworkStatus ───────────────────────────────────────────────────

/**
 * Tracks live network status. Listens to online/offline DOM events and
 * reads navigator.connection for quality detection.
 */
export function useNetworkStatus(): NetworkStatus {
  const [online, setOnline] = React.useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [quality, setQuality] = React.useState<'fast' | 'slow' | 'offline'>(detectQuality)
  const [lastOnline, setLastOnline] = React.useState<Date | null>(
    typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null
  )

  React.useEffect(() => {
    function handleOnline() {
      setOnline(true)
      setQuality(detectQuality())
      setLastOnline(new Date())
    }
    function handleOffline() {
      setOnline(false)
      setQuality('offline')
    }
    function handleConnectionChange() {
      if (navigator.onLine) setQuality(detectQuality())
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const conn = (navigator as NavigatorConnectionExt).connection
    if (conn) {
      conn.addEventListener?.('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (conn) {
        conn.removeEventListener?.('change', handleConnectionChange)
      }
    }
  }, [])

  return { online, quality, lastOnline }
}

// ─── Hook: useOfflineBalance ──────────────────────────────────────────────────

interface CachedBalance {
  data: OfflineBalance
  updatedAt: string // ISO
}

/**
 * Caches the user's balance in localStorage.
 * Always returns cached data instantly; fetches fresh when online.
 * isStale = true when the cache is older than 5 minutes.
 */
export function useOfflineBalance(afroId: string): OfflineBalanceResult {
  const storageKey = `afro_balance_${afroId}`
  const { online } = useNetworkStatus()

  const [cached, setCached] = React.useState<CachedBalance | null>(() =>
    getLocalJson<CachedBalance>(storageKey)
  )

  const lastUpdated = cached ? new Date(cached.updatedAt) : null
  const isStale = lastUpdated ? Date.now() - lastUpdated.getTime() > STALE_MS : true

  const refresh = React.useCallback(async () => {
    if (!online) return
    try {
      const res = await fetch(`/api/cowrie/balance?afroId=${encodeURIComponent(afroId)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: OfflineBalance = await res.json()
      const entry: CachedBalance = { data, updatedAt: new Date().toISOString() }
      setCached(entry)
      setLocalJson(storageKey, entry)
    } catch {
      // Network failure — keep cached value, do not throw
    }
  }, [afroId, online, storageKey])

  // Auto-refresh on mount or when coming back online
  React.useEffect(() => {
    if (online && isStale) {
      refresh()
    }
  }, [online]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    balance: cached?.data ?? null,
    isStale,
    lastUpdated,
    refresh,
  }
}

// ─── Hook: useTransactionQueue ────────────────────────────────────────────────

const TX_QUEUE_KEY = 'afro_tx_queue'

/**
 * Manages a persistent offline transaction queue.
 * Transactions are stored in localStorage immediately on enqueue.
 * processQueue() attempts to POST each pending tx to the backend.
 * Auto-processes when the browser comes back online.
 */
export function useTransactionQueue(): TransactionQueueResult {
  const { online } = useNetworkStatus()

  const [queue, setQueue] = React.useState<QueuedTransaction[]>(
    () => getLocalJson<QueuedTransaction[]>(TX_QUEUE_KEY) ?? []
  )

  function persist(next: QueuedTransaction[]) {
    setQueue(next)
    setLocalJson(TX_QUEUE_KEY, next)
  }

  const enqueue = React.useCallback(
    (tx: Omit<QueuedTransaction, 'id' | 'queuedAt' | 'status' | 'retryCount'>): QueuedTransaction => {
      const item: QueuedTransaction = {
        ...tx,
        id: generateTxId(),
        queuedAt: new Date().toISOString(),
        status: 'queued',
        retryCount: 0,
      }
      setQueue(prev => {
        const next = [...prev, item]
        setLocalJson(TX_QUEUE_KEY, next)
        return next
      })
      return item
    },
    []
  )

  const processQueue = React.useCallback(async () => {
    const current: QueuedTransaction[] = getLocalJson<QueuedTransaction[]>(TX_QUEUE_KEY) ?? []
    const pending = current.filter(tx => tx.status === 'queued' || tx.status === 'failed')
    if (pending.length === 0) return

    // Mark all pending as syncing
    const syncing = current.map(tx =>
      pending.find(p => p.id === tx.id) ? { ...tx, status: 'syncing' as const } : tx
    )
    persist(syncing)

    const results = await Promise.allSettled(
      pending.map(async tx => {
        if (tx.retryCount >= MAX_RETRIES) {
          return { id: tx.id, status: 'failed' as const, retryCount: tx.retryCount }
        }
        try {
          const res = await fetch('/api/cowrie/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromAfroId: tx.fromAfroId,
              toAfroId: tx.toAfroId,
              amount: tx.amount,
              currency: tx.currency,
              reason: tx.reason,
              offlineTxId: tx.id,
            }),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          return {
            id: tx.id,
            status: 'settled' as const,
            settledAt: new Date().toISOString(),
            koweHash: data.koweHash ?? undefined,
            retryCount: tx.retryCount,
          }
        } catch {
          return {
            id: tx.id,
            status: 'failed' as const,
            retryCount: tx.retryCount + 1,
          }
        }
      })
    )

    const updates = new Map<string, { id: string; status: 'settled' | 'failed'; retryCount: number; settledAt?: string; koweHash?: string }>()
    for (const r of results) {
      if (r.status === 'fulfilled') updates.set(r.value.id, r.value)
    }

    const fresh: QueuedTransaction[] = getLocalJson<QueuedTransaction[]>(TX_QUEUE_KEY) ?? []
    const resolved = fresh
      .map(tx => {
        const u = updates.get(tx.id)
        if (!u) return tx
        return {
          ...tx,
          status: u.status,
          retryCount: u.retryCount,
          settledAt: u.settledAt,
          koweHash: u.koweHash,
        }
      })
      // Keep settled entries for receipt history; drop only after > 24h
      .filter(tx => {
        if (tx.status !== 'settled') return true
        if (!tx.settledAt) return true
        return Date.now() - new Date(tx.settledAt).getTime() < 24 * 60 * 60 * 1000
      })

    persist(resolved)
  }, [])

  // Auto-process when coming back online
  React.useEffect(() => {
    if (online) {
      processQueue()
    }
  }, [online]) // eslint-disable-line react-hooks/exhaustive-deps

  const pendingCount = queue.filter(tx => tx.status === 'queued' || tx.status === 'syncing').length
  const totalQueued = queue.length

  return { queue, enqueue, processQueue, pendingCount, totalQueued }
}

// ─── Hook: useOfflineLedger ───────────────────────────────────────────────────

interface CachedLedger {
  entries: LedgerEntry[]
  updatedAt: string
}

/**
 * Caches the last 50 ledger entries in localStorage.
 * Returns stale data instantly while fetching fresh data in the background.
 */
export function useOfflineLedger(afroId: string): OfflineLedgerResult {
  const storageKey = `afro_ledger_${afroId}`
  const { online } = useNetworkStatus()

  const [cached, setCached] = React.useState<CachedLedger | null>(
    () => getLocalJson<CachedLedger>(storageKey)
  )

  const lastUpdated = cached ? new Date(cached.updatedAt) : null
  const isStale = lastUpdated ? Date.now() - lastUpdated.getTime() > STALE_MS : true

  const refresh = React.useCallback(async () => {
    if (!online) return
    try {
      const res = await fetch(`/api/cowrie/ledger?afroId=${encodeURIComponent(afroId)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const entries: LedgerEntry[] = (data.entries ?? []).slice(0, MAX_LEDGER_ENTRIES)
      const entry: CachedLedger = { entries, updatedAt: new Date().toISOString() }
      setCached(entry)
      setLocalJson(storageKey, entry)
    } catch {
      // Keep existing cache on failure
    }
  }, [afroId, online, storageKey])

  React.useEffect(() => {
    if (online && isStale) {
      refresh()
    }
  }, [online]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    entries: cached?.entries ?? [],
    refresh,
    isStale,
  }
}
