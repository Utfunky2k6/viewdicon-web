'use client'
import { useState } from 'react'

const INVOICES = [
  { id: 'SCN-001', vendor: 'Ade Textiles Ltd', amount: 245000, status: 'scanned', date: '2026-04-05' },
  { id: 'SCN-002', vendor: 'Lagos Fresh Produce', amount: 87500, status: 'verified', date: '2026-04-04' },
  { id: 'SCN-003', vendor: 'Kigali Tech Supply', amount: 520000, status: 'pending', date: '2026-04-03' },
  { id: 'SCN-004', vendor: 'Nairobi Auto Parts', amount: 163000, status: 'scanned', date: '2026-04-02' },
]

const STATUS_COLORS: Record<string, string> = { scanned: '#3b82f6', verified: '#16a34a', pending: '#f59e0b' }

export default function InvoiceScanner() {
  const [items, setItems] = useState(INVOICES)
  const verify = (id: string) => setItems(is => is.map(inv => inv.id === id ? { ...inv, status: 'verified' } : inv))
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📸 Invoice Scanner</h2>
      <button style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px dashed #1a7c3e', background: '#f0fdf4', color: '#1a7c3e', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 14 }}>📷 Scan New Invoice</button>
      {items.map(inv => (
        <div key={inv.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{inv.id}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: STATUS_COLORS[inv.status] || '#6b7280', padding: '2px 10px', borderRadius: 99 }}>{inv.status}</span>
          </div>
          <p style={{ fontSize: 13, margin: '2px 0', color: '#374151' }}>{inv.vendor}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>₦{inv.amount.toLocaleString()}</span>
            {inv.status !== 'verified' && <button onClick={() => verify(inv.id)} style={{ padding: '4px 12px', borderRadius: 12, border: 'none', background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Verify</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
