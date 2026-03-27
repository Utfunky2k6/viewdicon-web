'use client'
import { ThemeMode, t, SectionLabel } from './shared'
import * as React from 'react'

interface LedgerEntry {
  id: string
  type: string
  title: string
  counterparty: string
  villageId: string
  amount: string
  status: string
  createdAt: string
}

const TYPE_ICON: Record<string, string> = {
  trade_complete:    '🤝',
  runner_dispatched: '📦',
  kila_received:     '⭐',
  crest_upgrade:     '🏅',
  ajo_paid:          '⭕',
  escrow_locked:     '🔒',
  dispute_opened:    '⚠️',
  job_completed:     '✅',
}

const STATUS_COLOR: Record<string, string> = {
  completed: '#22c55e',
  pending:   '#f59e0b',
  disputed:  '#ef4444',
}

export default function WorkLedger({ mode }: { mode: ThemeMode }) {
  const [ledger, setLedger] = React.useState<LedgerEntry[]>([])

  React.useEffect(() => {
    fetch('/api/v1/work-ledger/recent?limit=8')
      .then(res => (res.ok ? res.json() : []))
      .then(data => { if (Array.isArray(data)) setLedger(data) })
      .catch(() => {})
  }, [])

  if (ledger.length === 0) {
    return (
      <>
        <SectionLabel label="📜 Memory of Hands" more="Full ledger" mode={mode} />
        <div style={{ padding: '12px 16px', color: t('sub', mode), fontSize: 12 }}>
          No recent activity yet.
        </div>
      </>
    )
  }

  return (
    <>
      <SectionLabel label="📜 Memory of Hands" more="Full ledger" mode={mode} />
      <div style={{ display:'flex', gap:7, padding:'0 12px', overflowX:'auto', scrollbarWidth: 'none' }}>
        {ledger.map((item) => (
          <div key={item.id} style={{ minWidth:118, borderRadius:12, padding:10, flexShrink:0, cursor:'pointer', position:'relative', background:t('card',mode), border:`1px solid ${t('border',mode)}` }}>
            <div style={{ position:'absolute', top:8, right:8, width:7, height:7, borderRadius:'50%', background: STATUS_COLOR[item.status] ?? '#6b7280' }} />
            <span style={{ fontSize:20, marginBottom:5, display:'block' }}>{TYPE_ICON[item.type] ?? '📋'}</span>
            <div style={{ fontSize:11, fontWeight:700, color:t('text',mode), lineHeight:1.3, marginBottom:1 }}>{item.title}</div>
            <div style={{ fontSize:10, marginBottom:5, lineHeight:1.3, color:t('sub',mode) }}>{item.counterparty}</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#1a7c3e' }}>{item.amount}</div>
            <div style={{ fontSize:9, marginTop:2, color: mode === 'dark' ? '#2d4a2e' : '#bbb' }}>{item.createdAt}</div>
          </div>
        ))}
      </div>
    </>
  )
}
