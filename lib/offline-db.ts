/**
 * offline-db.ts — IndexedDB wrapper for offline-first queue management
 *
 * Stores queued transactions, posts, and cached API responses so the app
 * works fully offline and syncs automatically when connectivity returns.
 */

const DB_NAME = 'afro-offline-db'
const DB_VERSION = 1

export interface QueuedBankingTx {
  id: string
  type: 'P2P_TRANSFER' | 'REQUEST_MONEY' | 'LOAN_APPLY' | 'AJO_CONTRIBUTE' | 'HARAMBEE_CONTRIBUTE' | 'GENERIC'
  endpoint: string
  method: 'POST' | 'PATCH' | 'PUT'
  payload: Record<string, unknown>
  ts: number
  retries: number
}

export interface QueuedPost {
  id: string
  type: 'POST' | 'COMMENT' | 'REACTION'
  endpoint: string
  payload: Record<string, unknown>
  ts: number
  retries: number
}

export interface CachedApiResponse {
  url: string
  data: unknown
  cachedAt: number
  ttl: number // ms
}

// ── Open database ─────────────────────────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('SSR')); return }
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('banking-queue')) {
        db.createObjectStore('banking-queue', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('post-queue')) {
        db.createObjectStore('post-queue', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('api-cache')) {
        const store = db.createObjectStore('api-cache', { keyPath: 'url' })
        store.createIndex('cachedAt', 'cachedAt', { unique: false })
      }
    }

    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error)
  })
}

function idbPut<T>(storeName: string, item: T): Promise<void> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

function idbGetAll<T>(storeName: string): Promise<T[]> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  }))
}

function idbDelete(storeName: string, key: string): Promise<void> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

function idbGet<T>(storeName: string, key: string): Promise<T | undefined> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  }))
}

// ── Banking Queue ─────────────────────────────────────────────────────────────

export async function enqueueBankingTx(
  type: QueuedBankingTx['type'],
  endpoint: string,
  payload: Record<string, unknown>
): Promise<string> {
  const tx: QueuedBankingTx = {
    id: `btx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    endpoint,
    method: 'POST',
    payload,
    ts: Date.now(),
    retries: 0,
  }
  await idbPut('banking-queue', tx)

  // Request background sync if SW available
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(reg => reg.sync?.register('afro-banking-sync'))
      .catch(() => {})
  }

  return tx.id
}

export const bankingQueue = {
  enqueue: enqueueBankingTx,
  getAll: () => idbGetAll<QueuedBankingTx>('banking-queue'),
  remove: (id: string) => idbDelete('banking-queue', id),

  /** Replay all queued transactions. Call when coming back online. */
  async flush(): Promise<{ succeeded: number; failed: number }> {
    const items = await idbGetAll<QueuedBankingTx>('banking-queue')
    let succeeded = 0
    let failed = 0

    for (const item of items) {
      try {
        const token = (() => {
          try {
            const stored = localStorage.getItem('afk-auth')
            return JSON.parse(stored ?? '{}')?.state?.accessToken ?? null
          } catch { return null }
        })()

        const res = await fetch(item.endpoint, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(item.payload),
        })

        if (res.ok) {
          await idbDelete('banking-queue', item.id)
          succeeded++
        } else if (res.status >= 400 && res.status < 500) {
          // Client error — not retryable, remove it
          await idbDelete('banking-queue', item.id)
          failed++
        } else {
          // Server error — increment retry count
          await idbPut('banking-queue', { ...item, retries: item.retries + 1 })
          failed++
        }
      } catch {
        await idbPut('banking-queue', { ...item, retries: item.retries + 1 })
        failed++
      }
    }

    return { succeeded, failed }
  },
}

// ── Post Queue ────────────────────────────────────────────────────────────────

export const postQueue = {
  enqueue: async (
    type: QueuedPost['type'],
    endpoint: string,
    payload: Record<string, unknown>
  ): Promise<string> => {
    const item: QueuedPost = {
      id: `pq_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type, endpoint, payload, ts: Date.now(), retries: 0,
    }
    await idbPut('post-queue', item)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(reg => reg.sync?.register('afro-post-sync'))
        .catch(() => {})
    }
    return item.id
  },
  getAll: () => idbGetAll<QueuedPost>('post-queue'),
  remove: (id: string) => idbDelete('post-queue', id),
}

// ── API Response Cache ────────────────────────────────────────────────────────

export const apiCache = {
  set: (url: string, data: unknown, ttlMs = 5 * 60 * 1000) =>
    idbPut<CachedApiResponse>('api-cache', { url, data, cachedAt: Date.now(), ttl: ttlMs }),

  get: async (url: string): Promise<unknown | null> => {
    const entry = await idbGet<CachedApiResponse>('api-cache', url)
    if (!entry) return null
    if (Date.now() - entry.cachedAt > entry.ttl) {
      await idbDelete('api-cache', url)
      return null
    }
    return entry.data
  },

  /** Fetch with IDB cache fallback — works offline */
  fetchWithCache: async (url: string, init?: RequestInit, ttlMs = 5 * 60 * 1000): Promise<unknown> => {
    try {
      const res = await fetch(url, init)
      if (res.ok) {
        const data = await res.json()
        await apiCache.set(url, data, ttlMs)
        return data
      }
      throw new Error(`HTTP ${res.status}`)
    } catch {
      const cached = await apiCache.get(url)
      if (cached !== null) return cached
      throw new Error('offline_no_cache')
    }
  },
}

// ── Offline detection hook (client only) ─────────────────────────────────────

export function getIsOffline(): boolean {
  if (typeof navigator === 'undefined') return false
  return !navigator.onLine
}

// ── Auto-sync on reconnect (call once at app root) ────────────────────────────

export function setupAutoSync(onSynced?: (result: { banking: { succeeded: number; failed: number } }) => void) {
  if (typeof window === 'undefined') return

  const handler = async () => {
    const banking = await bankingQueue.flush().catch(() => ({ succeeded: 0, failed: 0 }))
    onSynced?.({ banking })
  }

  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}
