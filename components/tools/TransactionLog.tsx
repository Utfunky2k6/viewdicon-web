'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

interface Tx { date: string; type: 'IN' | 'OUT'; amount: number; party: string; status: string; desc: string }

const TXNS: Tx[] = [
  { date: '2026-03-26', type: 'IN',  amount: 2500, party: 'NG-YOR-••••-1234', status: 'Confirmed', desc: 'Invoice payment INV-0041' },
  { date: '2026-03-25', type: 'OUT', amount: 450,  party: 'NG-IBO-••••-5678', status: 'Confirmed', desc: 'Stock purchase - Rice' },
  { date: '2026-03-24', type: 'IN',  amount: 800,  party: 'GH-TWI-••••-9012', status: 'Confirmed', desc: 'Service fee' },
  { date: '2026-03-23', type: 'OUT', amount: 200,  party: 'SN-WOL-••••-3456', status: 'Pending',   desc: 'Transport cost' },
  { date: '2026-03-22', type: 'IN',  amount: 4200, party: 'KE-KIK-••••-7890', status: 'Confirmed', desc: 'Invoice INV-0039' },
  { date: '2026-03-21', type: 'OUT', amount: 1200, party: 'NG-HAU-••••-1357', status: 'Confirmed', desc: 'Supplier payment' },
  { date: '2026-03-20', type: 'IN',  amount: 650,  party: 'GH-EWE-••••-2468', status: 'Confirmed', desc: 'Consultation fee' },
  { date: '2026-03-19', type: 'OUT', amount: 300,  party: 'TZ-SUK-••••-1111', status: 'Failed',    desc: 'Transfer attempt' },
  { date: '2026-03-18', type: 'IN',  amount: 3800, party: 'NG-YOR-••••-2222', status: 'Confirmed', desc: 'Project milestone' },
  { date: '2026-03-17', type: 'OUT', amount: 750,  party: 'CI-BAO-••••-3333', status: 'Confirmed', desc: 'Materials' },
]

export default function TransactionLog() {
  const [typeFilter, setTypeFilter] = React.useState<'All' | 'IN' | 'OUT'>('All')
  const [statusFilter, setStatusFilter] = React.useState('All')

  const filtered = TXNS.filter(t =>
    (typeFilter === 'All' || t.type === typeFilter) &&
    (statusFilter === 'All' || t.status === statusFilter)
  )

  const totalIn  = TXNS.filter(t => t.type === 'IN').reduce((a, t) => a + t.amount, 0)
  const totalOut = TXNS.filter(t => t.type === 'OUT').reduce((a, t) => a + t.amount, 0)
  const net      = totalIn - totalOut

  const statusColor = (s: string) => s === 'Confirmed' ? '#4ade80' : s === 'Pending' ? '#fbbf24' : '#f87171'

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[['Total In', `₡${totalIn.toLocaleString()}`, '#4ade80'], ['Total Out', `₡${totalOut.toLocaleString()}`, '#f87171'], ['Net', `₡${net.toLocaleString()}`, net >= 0 ? '#4ade80' : '#f87171']].map(([l, v, col]) => (
          <div key={String(l)} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: String(col) }}>{String(v)}</div>
            <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{String(l)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['All', 'IN', 'OUT'] as const).map(f => (
          <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: typeFilter === f ? C.green : C.muted, color: typeFilter === f ? '#fff' : C.sub }}>
            {f}
          </button>
        ))}
        {['All', 'Confirmed', 'Pending', 'Failed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: statusFilter === s ? '#1e3a5f' : C.muted, color: statusFilter === s ? '#60a5fa' : C.sub }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.map((tx, i) => (
        <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{tx.desc}</div>
              <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{tx.party} · {tx.date}</div>
            </div>
            <div style={{ textAlign: 'right', marginLeft: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: tx.type === 'IN' ? '#4ade80' : '#f87171' }}>
                {tx.type === 'IN' ? '+' : '-'}₡{tx.amount.toLocaleString()}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: statusColor(tx.status) }}>{tx.status}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
