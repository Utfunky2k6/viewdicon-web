'use client'
import { useState } from 'react'

const SUPPLIERS = [
  { name: 'AgroMall Nigeria', type: 'Seeds & Fertilizer', location: 'Ibadan', rating: 4.8, delivery: 'Free >₦50k', verified: true },
  { name: 'Notore Agro', type: 'Fertilizer', location: 'Lagos', rating: 4.6, delivery: '₦2,500 flat', verified: true },
  { name: 'SeedCo West Africa', type: 'Hybrid Seeds', location: 'Accra', rating: 4.5, delivery: '₦5,000 cross-border', verified: true },
  { name: 'KemFert Supplies', type: 'Pesticides & Herbicides', location: 'Kano', rating: 4.2, delivery: '₦3,000', verified: false },
  { name: 'Green Thumb Co-op', type: 'Organic Inputs', location: 'Jos', rating: 4.7, delivery: 'Free >₦30k', verified: true },
]

export default function InputSupplier() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'verified' ? SUPPLIERS.filter(s => s.verified) : SUPPLIERS

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🌱 Input Suppliers</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['all', 'verified'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 13,
            background: filter === f ? '#1a7c3e' : '#e5e7eb', color: filter === f ? '#fff' : '#1a2e1a', cursor: 'pointer'
          }}>{f === 'all' ? 'All' : '✓ Verified'}</button>
        ))}
      </div>
      {filtered.map((s, i) => (
        <div key={i} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{s.name} {s.verified && '✅'}</span>
            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>★ {s.rating}</span>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{s.type} · {s.location}</div>
          <div style={{ fontSize: 12, color: '#888' }}>Delivery: {s.delivery}</div>
          <button style={{ marginTop: 8, background: '#1a7c3e', color: '#fff', border: 'none', borderRadius: 12, padding: '6px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Contact</button>
        </div>
      ))}
    </div>
  )
}
