'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type CreditStatus = 'GOOD' | 'OVERDUE' | 'PAID'

interface CreditEntry {
  id: string; name: string; phone: string; limit: number; balance: number; lastPayment: string; dueDate: string; status: CreditStatus
}

const INIT_CREDITS: CreditEntry[] = [
  { id: 'c1', name: 'Emeka Okafor', phone: '08031234567', limit: 50000, balance: 15200, lastPayment: '2026-03-18', dueDate: '2026-03-30', status: 'GOOD' },
  { id: 'c2', name: 'Fatima Aliyu', phone: '08059876543', limit: 30000, balance: 12200, lastPayment: '2026-02-28', dueDate: '2026-03-10', status: 'OVERDUE' },
  { id: 'c3', name: 'Taiwo Adeyemi', phone: '08071112222', limit: 80000, balance: 22500, lastPayment: '2026-03-20', dueDate: '2026-04-05', status: 'GOOD' },
  { id: 'c4', name: 'Ngozi Eze', phone: '09012223333', limit: 25000, balance: 0, lastPayment: '2026-03-25', dueDate: '2026-03-25', status: 'PAID' },
  { id: 'c5', name: 'Abdullahi Musa', phone: '09021234567', limit: 40000, balance: 7600, lastPayment: '2026-02-15', dueDate: '2026-03-01', status: 'OVERDUE' },
]

const statusColor: Record<CreditStatus, string> = { GOOD: green, OVERDUE: red, PAID: muted }

export default function CreditBook({ villageId, roleKey }: ToolProps) {
  const [credits, setCredits] = useState<CreditEntry[]>(INIT_CREDITS)
  const [showEntry, setShowEntry] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [entryForm, setEntryForm] = useState({ customer: '', amount: '', dueDate: '', item: '' })
  const [payForm, setPayForm] = useState({ customerId: INIT_CREDITS[0].id, amount: '', date: '' })
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const totalExtended = credits.reduce((s, c) => s + c.limit, 0)
  const totalOutstanding = credits.reduce((s, c) => s + c.balance, 0)
  const totalCollected = totalExtended - totalOutstanding
  const totalOverdue = credits.filter(c => c.status === 'OVERDUE').reduce((s, c) => s + c.balance, 0)

  const addCredit = () => {
    if (!entryForm.customer || !entryForm.amount) return
    const newEntry: CreditEntry = {
      id: `c${Date.now()}`, name: entryForm.customer, phone: '—', limit: Number(entryForm.amount),
      balance: Number(entryForm.amount), lastPayment: '—', dueDate: entryForm.dueDate, status: 'GOOD'
    }
    setCredits(c => [...c, newEntry])
    setEntryForm({ customer: '', amount: '', dueDate: '', item: '' })
    setShowEntry(false); flash('Credit entry recorded')
  }

  const recordPayment = () => {
    if (!payForm.amount) return
    setCredits(prev => prev.map(c => {
      if (c.id !== payForm.customerId) return c
      const newBal = Math.max(0, c.balance - Number(payForm.amount))
      return { ...c, balance: newBal, lastPayment: payForm.date || new Date().toISOString().slice(0, 10), status: newBal === 0 ? 'PAID' : c.status }
    }))
    setPayForm({ customerId: credits[0].id, amount: '', date: '' })
    setShowPayment(false); flash('Payment recorded')
  }

  const sendReminder = (name: string) => flash(`Reminder sent to ${name} via SMS`)

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 16px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Credit Book</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>Bello Merchandise — Customer Ledger</div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Total Extended', value: totalExtended, color: '#5b9bd5' },
          { label: 'Collected', value: totalCollected, color: green },
          { label: 'Outstanding', value: totalOutstanding, color: amber },
          { label: 'Overdue', value: totalOverdue, color: red },
        ].map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: muted }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>₡{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Customer list */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        {credits.map(c => (
          <div key={c.id} style={{ padding: '12px 14px', borderBottom: `1px solid ${border}`, background: c.status === 'OVERDUE' ? '#1e0a0a' : 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: muted }}>Last payment: {c.lastPayment} · Due: {c.dueDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.balance > 0 ? gold : muted }}>₡{c.balance.toLocaleString()}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[c.status], background: statusColor[c.status] + '22', padding: '2px 8px', borderRadius: 10 }}>{c.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, background: '#1a3a20', borderRadius: 2 }}>
                <div style={{ width: `${Math.round((c.balance / c.limit) * 100)}%`, height: '100%', background: c.status === 'OVERDUE' ? red : gold, borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, color: muted }}>{Math.round((c.balance / c.limit) * 100)}% used</span>
              {c.status === 'OVERDUE' && (
                <button onClick={() => sendReminder(c.name)} style={{ background: 'none', border: `1px solid ${amber}`, borderRadius: 6, padding: '3px 8px', color: amber, fontSize: 11, cursor: 'pointer' }}>Send Reminder</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={() => setShowEntry(s => !s)} style={{ ...btn(gold), flex: 1 }}>+ Credit Entry</button>
        <button onClick={() => setShowPayment(s => !s)} style={{ ...btn(green), flex: 1 }}>✓ Record Payment</button>
      </div>

      {showEntry && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>New Credit Entry</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input placeholder="Customer name" value={entryForm.customer} onChange={e => setEntryForm(f => ({ ...f, customer: e.target.value }))} style={inp} />
            <input placeholder="Credit amount (₡)" type="number" value={entryForm.amount} onChange={e => setEntryForm(f => ({ ...f, amount: e.target.value }))} style={inp} />
            <input type="date" value={entryForm.dueDate} onChange={e => setEntryForm(f => ({ ...f, dueDate: e.target.value }))} style={inp} />
            <input placeholder="Item / Service" value={entryForm.item} onChange={e => setEntryForm(f => ({ ...f, item: e.target.value }))} style={inp} />
          </div>
          <button onClick={addCredit} style={btn(gold)}>Record Credit</button>
        </div>
      )}

      {showPayment && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Record Payment</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <select value={payForm.customerId} onChange={e => setPayForm(f => ({ ...f, customerId: e.target.value }))} style={inp}>
              {credits.filter(c => c.balance > 0).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Payment amount (₡)" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} style={inp} />
            <input type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, gridColumn: 'span 2' }} />
          </div>
          <button onClick={recordPayment} style={btn(green)}>Record Payment</button>
        </div>
      )}
    </div>
  )
}
