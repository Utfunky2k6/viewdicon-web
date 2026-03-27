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
const orange = '#d4813a'

type InvoiceStatus = 'PAID' | 'PARTIAL' | 'OVERDUE' | 'DRAFT'

interface Invoice {
  id: string
  client: string
  amount: number
  status: InvoiceStatus
  due: string
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-041', client: 'Ngozi Okonkwo Stores', amount: 87000, status: 'PAID', due: 'Mar 20' },
  { id: 'INV-2026-042', client: 'Chukwu Eze Holdings', amount: 54000, status: 'PARTIAL', due: 'Mar 25' },
  { id: 'INV-2026-043', client: 'Fatima Diallo Trading', amount: 32000, status: 'OVERDUE', due: 'Mar 15' },
  { id: 'INV-2026-044', client: 'Kwame Asante Arts', amount: 18200, status: 'OVERDUE', due: 'Mar 10' },
  { id: 'INV-2026-045', client: 'Amina Bello Events', amount: 29800, status: 'DRAFT', due: 'Apr 1' },
]

const statusColor: Record<InvoiceStatus, string> = {
  PAID: green,
  PARTIAL: gold,
  OVERDUE: red,
  DRAFT: muted,
}

export default function BillingDashboard({ villageId, roleKey }: ToolProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES)
  const [showNew, setShowNew] = useState(false)
  const [newClient, setNewClient] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [reminded, setReminded] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  function sendReminder(id: string) {
    setReminded(r => new Set([...r, id]))
    setToast('Reminder sent via Seso Chat')
    setTimeout(() => setToast(null), 2500)
  }

  function createInvoice() {
    if (!newClient || !newAmount) return
    const inv: Invoice = {
      id: 'INV-2026-0' + (46 + invoices.length),
      client: newClient,
      amount: parseInt(newAmount),
      status: 'DRAFT',
      due: 'Apr 15',
    }
    setInvoices(prev => [inv, ...prev])
    setShowNew(false)
    setNewClient('')
    setNewAmount('')
  }

  const total = 340000
  const collected = 287500
  const outstanding = total - collected
  const overdue = 18200

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>BILLING OVERVIEW</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Invoice Dashboard</div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Billed', value: total, color: text },
          { label: 'Collected', value: collected, color: green },
          { label: 'Outstanding', value: outstanding, color: gold },
          { label: 'Overdue', value: overdue, color: red },
        ].map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 12px' }}>
            <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>₡{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Aged receivables heat bar */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: muted, marginBottom: 10 }}>Aged Receivables</div>
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 14, marginBottom: 8 }}>
          <div style={{ width: '55%', background: green }} title="0-30 days" />
          <div style={{ width: '25%', background: gold }} title="31-60 days" />
          <div style={{ width: '12%', background: orange }} title="61-90 days" />
          <div style={{ width: '8%', background: red }} title="90+ days" />
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
          {[['0-30 days', green, '55%'], ['31-60 days', gold, '25%'], ['61-90 days', orange, '12%'], ['90+ days', red, '8%']].map(([lbl, col, pct]) => (
            <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col as string }} />
              <span style={{ color: muted }}>{lbl as string}</span>
              <span style={{ color: text }}>{pct as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Invoices</div>
        {invoices.map(inv => (
          <div key={inv.id} style={{ padding: '10px 0', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 11, color: muted }}>{inv.id}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{inv.client}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>₡{inv.amount.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: statusColor[inv.status], fontWeight: 700 }}>{inv.status}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: muted }}>Due: {inv.due}</span>
              {inv.status === 'OVERDUE' && (
                <button
                  onClick={() => sendReminder(inv.id)}
                  disabled={reminded.has(inv.id)}
                  style={{
                    border: `1px solid ${reminded.has(inv.id) ? border : red}`,
                    background: reminded.has(inv.id) ? border : red + '22',
                    color: reminded.has(inv.id) ? muted : red,
                    borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: reminded.has(inv.id) ? 'default' : 'pointer',
                  }}
                >
                  {reminded.has(inv.id) ? '✓ Sent' : 'Send Reminder'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowNew(true)}
        style={{ width: '100%', background: green, color: '#000', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
        + New Invoice
      </button>

      {/* New invoice modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Invoice</div>
            <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="Client name" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
            <input value={newAmount} onChange={e => setNewAmount(e.target.value)} type="number" placeholder="Amount (₡)" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: 12, border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createInvoice} style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: green, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#1a4d2e', border: `1px solid ${green}`, borderRadius: 20, padding: '10px 20px', fontSize: 13, color: green, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
