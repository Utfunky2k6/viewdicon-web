'use client'
import { useState } from 'react'

const DRUGS = [
  { id: 1, name: 'Amoxicillin 500mg', stock: 240, min: 100, expiry: '2027-03-15', status: 'ok' },
  { id: 2, name: 'Paracetamol 500mg', stock: 45, min: 200, expiry: '2026-12-01', status: 'low' },
  { id: 3, name: 'Artemether/Lumef.', stock: 180, min: 50, expiry: '2026-08-20', status: 'ok' },
  { id: 4, name: 'Metformin 850mg', stock: 12, min: 100, expiry: '2026-05-01', status: 'critical' },
  { id: 5, name: 'ORS Sachets', stock: 500, min: 200, expiry: '2027-06-30', status: 'ok' },
  { id: 6, name: 'Ibuprofen 400mg', stock: 88, min: 100, expiry: '2026-04-30', status: 'expiring' },
]

const STATUS_COLOR: Record<string, string> = { ok: '#16a34a', low: '#f59e0b', critical: '#dc2626', expiring: '#9333ea' }

export default function DrugStock() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? DRUGS : DRUGS.filter(d => d.status === filter)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🏪 Drug Stock</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['all', 'ok', 'low', 'critical', 'expiring'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 12px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer',
              background: filter === f ? '#1a7c3e' : '#f0f7f0', color: filter === f ? '#fff' : '#3a5a3a' }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(d => (
          <div key={d.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: STATUS_COLOR[d.status] + '20', color: STATUS_COLOR[d.status] }}>{d.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Stock: <b style={{ color: d.stock < d.min ? '#dc2626' : '#374151' }}>{d.stock}</b></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Min: <b style={{ color: '#374151' }}>{d.min}</b></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Exp: <b style={{ color: '#374151' }}>{d.expiry}</b></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ Restock Order</button>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#f0fdf4', color: '#1a7c3e', fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>Export Report</button>
      </div>
    </div>
  )
}
