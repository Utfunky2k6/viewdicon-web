'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type SettleStatus = 'PENDING' | 'RUNNING' | 'SETTLED' | 'FAILED'
type Method = 'SWIFT' | 'SEPA' | 'COWRIE' | 'AFROMONEY'

interface Settlement {
  id: string; counterparty: string; amount: number; currency: string; method: Method; expectedDate: string; status: SettleStatus
}

const INIT_SETTLEMENTS: Settlement[] = [
  { id: 'STL-001', counterparty: 'Dangote Group Lagos', amount: 1240000, currency: 'NGN', method: 'COWRIE', expectedDate: '2026-03-27', status: 'PENDING' },
  { id: 'STL-002', counterparty: 'Accra Gold Exchange', amount: 450000, currency: 'GHS', method: 'SWIFT', expectedDate: '2026-03-28', status: 'PENDING' },
  { id: 'STL-003', counterparty: 'Nairobi Grain Council', amount: 890000, currency: 'KES', method: 'AFROMONEY', expectedDate: '2026-03-26', status: 'PENDING' },
]

const methodColor: Record<Method, string> = { SWIFT: blue, SEPA: '#9b59b6', COWRIE: gold, AFROMONEY: green }

const NEXT_DATES = [
  { label: 'COWRIE Settlement', date: 'Daily 18:00', highlight: true },
  { label: 'SWIFT Batch', date: '2026-03-28', highlight: false },
  { label: 'Month-End Reconciliation', date: '2026-03-31', highlight: false },
  { label: 'Quarterly SEPA Run', date: '2026-04-01', highlight: false },
]

export default function SettlementManager({ villageId, roleKey }: ToolProps) {
  const [settlements, setSettlements] = useState<Settlement[]>(INIT_SETTLEMENTS)
  const [toast, setToast] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const runSettlement = (id: string) => {
    setSettlements(s => s.map(x => x.id === id ? { ...x, status: 'RUNNING' } : x))
    setTimeout(() => {
      setSettlements(s => s.map(x => x.id === id ? { ...x, status: 'SETTLED' } : x))
      flash('Settlement completed successfully')
    }, 2200)
  }

  const settledToday = settlements.filter(s => s.status === 'SETTLED').reduce((a, b) => a + b.amount, 0)
  const pendingTotal = settlements.filter(s => s.status === 'PENDING').reduce((a, b) => a + b.amount, 0)

  const statusColor: Record<SettleStatus, string> = { PENDING: amber, RUNNING: blue, SETTLED: green, FAILED: red }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Settlement Manager</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>Multi-currency reconciliation — AfriSettle Network</div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: card, border: `1px solid ${green}`, borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: muted }}>Settled Today</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: green }}>₡{(settledToday / 1000).toFixed(1)}K</div>
        </div>
        <div style={{ background: card, border: `1px solid ${amber}`, borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: muted }}>Pending</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: amber }}>₡{(pendingTotal / 1000).toFixed(1)}K</div>
        </div>
      </div>

      {/* Settlement queue */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Settlement Queue</div>
        {settlements.map(s => (
          <div key={s.id} style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.counterparty}</div>
                <div style={{ fontSize: 11, color: muted }}>Expected: {s.expectedDate} · {s.id}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[s.status], background: statusColor[s.status] + '22', padding: '3px 8px', borderRadius: 10 }}>{s.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: gold }}>₡{s.amount.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: muted }}>{s.currency}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: methodColor[s.method], background: methodColor[s.method] + '22', padding: '2px 6px', borderRadius: 6 }}>{s.method}</span>
              {s.status === 'RUNNING' && (
                <div style={{ flex: 1, height: 4, background: '#1a3a20', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: blue, borderRadius: 2, animation: 'none', width: '60%' }} />
                </div>
              )}
              {s.status === 'PENDING' && (
                <button onClick={() => runSettlement(s.id)} style={{ ...btn(blue), marginLeft: 'auto' }}>Run Settlement</button>
              )}
              {s.status === 'SETTLED' && <span style={{ marginLeft: 'auto', color: green, fontSize: 12 }}>✓ Settled</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation report */}
      <button onClick={() => setShowReport(s => !s)} style={{ ...btn(gold), marginBottom: 10, width: '100%' }}>
        {showReport ? 'Hide' : 'View'} Reconciliation Report
      </button>
      {showReport && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Reconciliation Report — March 26</div>
          {[
            { label: 'Opened', count: 12, color: muted },
            { label: 'Matched', count: 9, color: green },
            { label: 'Unmatched', count: 3, color: red },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}`, fontSize: 13 }}>
              <span style={{ color: muted }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: r.color }}>{r.count}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 12, color: muted }}>3 unmatched items sent to manual review queue</div>
        </div>
      )}

      {/* Calendar */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Settlement Calendar</div>
        {NEXT_DATES.map(d => (
          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: `1px solid ${border}`, background: d.highlight ? green + '11' : 'transparent' }}>
            <span style={{ fontSize: 13, color: d.highlight ? green : text }}>{d.highlight ? '● ' : ''}{d.label}</span>
            <span style={{ fontSize: 12, color: d.highlight ? green : muted, fontWeight: d.highlight ? 700 : 400 }}>{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
