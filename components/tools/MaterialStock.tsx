'use client'
import { useState } from 'react'

const MATERIALS = [
  { id: 1, name: 'Portland Cement (50kg)', qty: 240, reorder: 50, unit: 'bags', price: 5800 },
  { id: 2, name: '12mm Iron Rod', qty: 18, reorder: 30, unit: 'tons', price: 420000 },
  { id: 3, name: 'Granite (20-ton)', qty: 5, reorder: 3, unit: 'trips', price: 280000 },
  { id: 4, name: 'Roofing Sheet (0.55mm)', qty: 150, reorder: 40, unit: 'pcs', price: 7500 },
  { id: 5, name: 'POP Ceiling Board', qty: 85, reorder: 20, unit: 'pcs', price: 3200 },
]

export default function MaterialStock() {
  const [items, setItems] = useState(MATERIALS)
  const restock = (id: number) => setItems(ms => ms.map(m => m.id === id ? { ...m, qty: m.qty + 50 } : m))
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🧱 Material Stock</h2>
      {items.map(m => {
        const low = m.qty < m.reorder
        return (
          <div key={m.id} style={{ background: low ? '#fef2f2' : '#fafafa', border: `1.5px solid ${low ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</span>
              {low && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#dc2626', padding: '2px 10px', borderRadius: 99 }}>LOW</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: 18 }}>{m.qty}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}> {m.unit} — ₦{m.price.toLocaleString()} ea</span>
              </div>
              <button onClick={() => restock(m.id)} style={{ padding: '4px 12px', borderRadius: 12, border: 'none', background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Restock</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
