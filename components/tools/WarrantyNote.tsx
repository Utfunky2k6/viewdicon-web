'use client'
import { useState } from 'react'

const WARRANTIES = [
  { id: 'W-1001', product: 'Solar Panel Kit 500W', customer: 'Chidi Okafor', expires: '2027-06-15', status: 'active' },
  { id: 'W-1002', product: 'Water Pump Motor', customer: 'Amina Bello', expires: '2026-12-01', status: 'active' },
  { id: 'W-1003', product: 'Generator 3.5KVA', customer: 'Kwame Asante', expires: '2026-02-20', status: 'expired' },
  { id: 'W-1004', product: 'Inverter Battery 200Ah', customer: 'Fatou Diallo', expires: '2027-09-30', status: 'active' },
]

const COLORS: Record<string, string> = { active: '#16a34a', expired: '#dc2626' }

export default function WarrantyNote() {
  const [items, setItems] = useState(WARRANTIES)
  const extend = (id: string) => setItems(ws => ws.map(w => w.id === id ? { ...w, expires: '2028-01-01', status: 'active' } : w))
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🛡️ Warranty Notes</h2>
      {items.map(w => (
        <div key={w.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{w.product}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: COLORS[w.status], padding: '2px 10px', borderRadius: 99 }}>{w.status}</span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0' }}>{w.customer} — {w.id}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: '#374151' }}>Expires: {w.expires}</span>
            {w.status === 'expired' && <button onClick={() => extend(w.id)} style={{ padding: '4px 12px', borderRadius: 12, border: 'none', background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Extend</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
