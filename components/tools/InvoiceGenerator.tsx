'use client'
import { useState } from 'react'

export default function InvoiceGenerator() {
  const [client, setClient] = useState('')
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0 }])
  const addItem = () => setItems(p => [...p, { desc: '', qty: 1, price: 0 }])
  const update = (i: number, field: string, val: string | number) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [field]: val } : it))
  const total = items.reduce((s, it) => s + it.qty * it.price, 0)
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🧾 Invoice Generator</h2>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Client Name</label>
        <input value={client} onChange={e => setClient(e.target.value)} placeholder="Enter client name" style={{ display: 'block', width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, marginTop: 4 }} />
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 8 }}>
          <input value={it.desc} onChange={e => update(i, 'desc', e.target.value)} placeholder="Item description" style={{ width: '100%', padding: 6, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" value={it.qty} onChange={e => update(i, 'qty', +e.target.value)} style={{ flex: 1, padding: 6, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} placeholder="Qty" />
            <input type="number" value={it.price || ''} onChange={e => update(i, 'price', +e.target.value)} style={{ flex: 1, padding: 6, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} placeholder="Price (₦)" />
          </div>
        </div>
      ))}
      <button onClick={addItem} style={{ width: '100%', padding: 10, borderRadius: 12, border: '1.5px dashed #1a7c3e', background: 'transparent', color: '#1a7c3e', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>+ Add Item</button>
      <div style={{ background: '#1a7c3e', borderRadius: 12, padding: 14, textAlign: 'center' }}>
        <p style={{ color: '#bbf7d0', fontSize: 12, margin: 0 }}>Total</p>
        <p style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '4px 0 0' }}>₦{total.toLocaleString()}</p>
      </div>
    </div>
  )
}
