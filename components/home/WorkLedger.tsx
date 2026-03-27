'use client'
import * as React from 'react'

type LedgerStatus = 'completed' | 'pending' | 'disputed'

interface LedgerEntry {
  id: string
  type: string
  title: string
  counterparty: string
  villageId: string
  amount: string
  status: LedgerStatus
  createdAt: string
}

const TYPE_EMOJI: Record<string, string> = {
  trade_complete:     '🤝',
  runner_dispatched:  '📦',
  kila_received:      '⭐',
  crest_upgrade:      '🏅',
  escrow_locked:      '🔒',
  dispute_opened:     '⚠️',
  ajo_paid:           '⭕',
  job_completed:      '✅',
}

const STATUS_DOT: Record<LedgerStatus, { color: string; glow: string }> = {
  completed: { color: '#22c55e', glow: '0 0 6px rgba(34,197,94,0.4)' },
  pending:   { color: '#f59e0b', glow: '0 0 6px rgba(245,158,11,0.4)' },
  disputed:  { color: '#ef4444', glow: '0 0 6px rgba(239,68,68,0.4)' },
}

export function WorkLedger({ entries = [] }: { entries?: LedgerEntry[] }) {
  if (!entries?.length) return null;
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>📜 Memory of Hands</span>
        <span style={{ fontSize: 11, color: '#1a7c3e', fontWeight: 600, cursor: 'pointer' }}>Full ledger →</span>
      </div>
      <div className="flex gap-2.5 px-3 pb-1 no-scrollbar snap-x" style={{ overflowX: 'auto' }}>
        {entries.map((entry) => {
          const dot = STATUS_DOT[entry.status] ?? { color: '#6b7280', glow: 'none' }
          return (
            <div
              key={entry.id}
              className="shrink-0 relative card-lift rounded-2xl"
              style={{
                minWidth: 140,
                maxWidth: 160,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                padding: '12px 11px',
              }}
            >
              {/* Status dot */}
              <div
                className="absolute rounded-full"
                style={{ top: 10, right: 10, width: 8, height: 8, background: dot.color, boxShadow: dot.glow }}
              />
              <span style={{ fontSize: 24, marginBottom: 8, display: 'block' }}>{TYPE_EMOJI[entry.type] ?? '📋'}</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 3 }}>{entry.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.35 }}>{entry.counterparty}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a7c3e' }}>{entry.amount}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{entry.createdAt}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}
