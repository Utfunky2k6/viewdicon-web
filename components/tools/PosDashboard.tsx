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

interface Transaction {
  id: string
  item: string
  amount: number
  time: string
  method: 'CASH' | 'MOBILE' | 'COWRIE'
}

const INITIAL_TXS: Transaction[] = [
  { id: 't1', item: 'Ankara Fabric (2m)', amount: 2400, time: '14:32', method: 'MOBILE' },
  { id: 't2', item: 'Groundnut Oil (5L)', amount: 1850, time: '13:58', method: 'CASH' },
  { id: 't3', item: 'Beads Necklace', amount: 3200, time: '13:15', method: 'COWRIE' },
  { id: 't4', item: 'Smoked Fish (1kg)', amount: 900, time: '12:44', method: 'CASH' },
  { id: 't5', item: 'Shea Butter (500g)', amount: 750, time: '11:20', method: 'MOBILE' },
]

const methodColor: Record<string, string> = {
  CASH: '#4caf7d',
  MOBILE: '#5b9bd5',
  COWRIE: '#c9a84c',
}

export default function PosDashboard({ villageId, roleKey }: ToolProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TXS)
  const [showModal, setShowModal] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newMethod, setNewMethod] = useState<'CASH' | 'MOBILE' | 'COWRIE'>('MOBILE')
  const [flash, setFlash] = useState<string | null>(null)

  const totalSales = transactions.reduce((s, t) => s + t.amount, 0)
  const avgTicket = Math.round(totalSales / transactions.length)
  const cash = transactions.filter(t => t.method === 'CASH').reduce((s, t) => s + t.amount, 0)
  const mobile = transactions.filter(t => t.method === 'MOBILE').reduce((s, t) => s + t.amount, 0)
  const cowrie = transactions.filter(t => t.method === 'COWRIE').reduce((s, t) => s + t.amount, 0)

  function recordSale() {
    if (!newItem.trim() || !newAmount) return
    const now = new Date()
    const tx: Transaction = {
      id: 't' + Date.now(),
      item: newItem.trim(),
      amount: parseInt(newAmount),
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      method: newMethod,
    }
    setTransactions([tx, ...transactions])
    setFlash(tx.id)
    setTimeout(() => setFlash(null), 1200)
    setNewItem('')
    setNewAmount('')
    setShowModal(false)
  }

  const pct = (v: number) => totalSales > 0 ? Math.round((v / totalSales) * 100) : 0

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: muted }}>POS TERMINAL</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Today's Sales</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: green }}>₡{totalSales.toLocaleString()}</div>
          <div style={{ background: '#1a4d2e', color: green, borderRadius: 20, padding: '2px 10px', fontSize: 12, display: 'inline-block' }}>
            ↑ +12.4% vs yesterday
          </div>
        </div>
      </div>

      {/* Stat cards 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Transactions', value: transactions.length.toString() },
          { label: 'Avg Ticket', value: `₡${avgTicket.toLocaleString()}` },
          { label: 'Cash', value: `₡${cash.toLocaleString()}` },
          { label: 'Mobile', value: `₡${mobile.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Payment breakdown bar */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: muted, marginBottom: 10 }}>Payment Breakdown</div>
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 20, marginBottom: 8 }}>
          <div style={{ width: `${pct(cash)}%`, background: '#4caf7d' }} />
          <div style={{ width: `${pct(mobile)}%`, background: '#5b9bd5' }} />
          <div style={{ width: `${pct(cowrie)}%`, background: '#c9a84c' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
          {[['Cash', cash, '#4caf7d'], ['Mobile', mobile, '#5b9bd5'], ['Cowrie', cowrie, '#c9a84c']].map(([lbl, val, col]) => (
            <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col as string }} />
              <span style={{ color: muted }}>{lbl as string}</span>
              <span style={{ color: text, fontWeight: 600 }}>₡{(val as number).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Recent Transactions</div>
        {transactions.slice(0, 5).map(tx => (
          <div
            key={tx.id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: `1px solid ${border}`,
              background: flash === tx.id ? 'rgba(76,175,125,0.08)' : 'transparent',
              transition: 'background 0.5s',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.item}</div>
              <div style={{ fontSize: 11, color: muted }}>{tx.time}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: green }}>₡{tx.amount.toLocaleString()}</div>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                background: methodColor[tx.method] + '22', color: methodColor[tx.method],
              }}>{tx.method}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Sale Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%', background: gold, color: '#000', border: 'none',
          borderRadius: 12, padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}
      >
        + Quick Sale
      </button>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Sale</div>
            <input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="Item name"
              style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
            />
            <input
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              placeholder="Amount (₡)"
              type="number"
              style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['CASH', 'MOBILE', 'COWRIE'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setNewMethod(m)}
                  style={{
                    flex: 1, padding: '8px 0', border: `1px solid ${newMethod === m ? methodColor[m] : border}`,
                    borderRadius: 8, background: newMethod === m ? methodColor[m] + '22' : bg,
                    color: newMethod === m ? methodColor[m] : muted, cursor: 'pointer', fontWeight: 600, fontSize: 12,
                  }}
                >{m}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={recordSale} style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: green, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Record Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
