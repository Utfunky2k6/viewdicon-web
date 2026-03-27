'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const red = '#e05a4e'
const blue = '#5b9bd5'
const purple = '#9b7fd4'

type TxFilter = 'ALL' | 'IN' | 'OUT' | 'ESCROW' | 'COWRIE'

interface TxRow {
  id: string
  direction: 'IN' | 'OUT'
  type: TxFilter
  party: string
  label: string
  amount: number
  time: string
  status: 'CONFIRMED' | 'PENDING' | 'REVERSED'
}

const LEDGER: TxRow[] = [
  { id: 'tx001', direction: 'IN', type: 'IN', party: 'NG-LAG-4872', label: 'Invoice Payment #INV-041', amount: 87000, time: '14:32 Mar 26', status: 'CONFIRMED' },
  { id: 'tx002', direction: 'OUT', type: 'COWRIE', party: 'NG-ABJ-2210', label: 'Cowrie Spray — Griot Amina', amount: 2500, time: '13:58 Mar 26', status: 'CONFIRMED' },
  { id: 'tx003', direction: 'OUT', type: 'OUT', party: 'NG-PH-7743', label: 'Runner Fee — DEL-2026-118', amount: 1200, time: '13:15 Mar 26', status: 'CONFIRMED' },
  { id: 'tx004', direction: 'IN', type: 'IN', party: 'GH-ACC-1093', label: 'Ajo Contribution Return #7', amount: 50000, time: '12:00 Mar 26', status: 'CONFIRMED' },
  { id: 'tx005', direction: 'IN', type: 'IN', party: 'NG-LAG-5521', label: 'Product Sale — Ankara Fabric', amount: 13500, time: '11:20 Mar 26', status: 'CONFIRMED' },
  { id: 'tx006', direction: 'OUT', type: 'ESCROW', party: 'ESCROW-4490', label: 'Escrow Lock — Order #ORD-006', amount: 7200, time: '10:45 Mar 26', status: 'PENDING' },
  { id: 'tx007', direction: 'IN', type: 'IN', party: 'NG-KN-8823', label: 'Invoice Payment #INV-039', amount: 54000, time: '09:30 Mar 26', status: 'CONFIRMED' },
  { id: 'tx008', direction: 'OUT', type: 'OUT', party: 'NG-LAG-3319', label: 'Supplier Payment — Palm Oil', amount: 28000, time: '08:00 Mar 26', status: 'CONFIRMED' },
  { id: 'tx009', direction: 'IN', type: 'COWRIE', party: 'COWRIE-BUS', label: 'Cowrie Village Bonus', amount: 5000, time: '07:00 Mar 26', status: 'CONFIRMED' },
  { id: 'tx010', direction: 'OUT', type: 'OUT', party: 'NG-LAG-0041', label: 'Ajo Circle Contribution', amount: 50000, time: '01:00 Mar 26', status: 'CONFIRMED' },
  { id: 'tx011', direction: 'OUT', type: 'ESCROW', party: 'ESCROW-4401', label: 'Escrow Lock — TV Slot', amount: 1500, time: '22:00 Mar 25', status: 'CONFIRMED' },
  { id: 'tx012', direction: 'IN', type: 'IN', party: 'NG-LAG-7782', label: 'Product Sale — Beads Set', amount: 5600, time: '19:45 Mar 25', status: 'REVERSED' },
]

const typeColor: Record<string, string> = {
  IN: green,
  OUT: red,
  ESCROW: blue,
  COWRIE: gold,
}

const statusColor: Record<string, string> = {
  CONFIRMED: green,
  PENDING: gold,
  REVERSED: red,
}

export default function FinanceLedger({ villageId, roleKey }: ToolProps) {
  const [filter, setFilter] = useState<TxFilter>('ALL')

  const balance = LEDGER.filter(t => t.status !== 'REVERSED')
    .reduce((s, t) => s + (t.direction === 'IN' ? t.amount : -t.amount), 0)

  const visible = filter === 'ALL'
    ? LEDGER
    : LEDGER.filter(t => t.type === filter)

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Balance header */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>CURRENT BALANCE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: green }}>₡{balance.toLocaleString()}</div>
          <div style={{ background: '#1a4d2e', border: `1px solid ${green}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, color: green, fontWeight: 700 }}>
            ✓ VERIFIED
          </div>
        </div>
        <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>Immutable ledger · {LEDGER.length} entries · Last update: 14:32 today</div>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
        {(['ALL', 'IN', 'OUT', 'ESCROW', 'COWRIE'] as TxFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${filter === f ? typeColor[f] || green : border}`,
              background: filter === f ? (typeColor[f] || green) + '22' : bg,
              color: filter === f ? (typeColor[f] || green) : muted,
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >{f}</button>
        ))}
      </div>

      {/* Transaction rows */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        {visible.map((tx, idx) => (
          <div key={tx.id} style={{ padding: '12px 16px', borderBottom: idx < visible.length - 1 ? `1px solid ${border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Arrow icon */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: (tx.direction === 'IN' ? green : red) + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: tx.direction === 'IN' ? green : red,
            }}>
              {tx.direction === 'IN' ? '↓' : '↑'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.label}</div>
              <div style={{ fontSize: 11, color: muted }}>{tx.party} · {tx.time}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, color: tx.status === 'REVERSED' ? muted : (tx.direction === 'IN' ? green : red), textDecoration: tx.status === 'REVERSED' ? 'line-through' : 'none' }}>
                {tx.direction === 'IN' ? '+' : '-'}₡{tx.amount.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: statusColor[tx.status] }}>{tx.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
