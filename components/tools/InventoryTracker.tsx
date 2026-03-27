'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

interface Item { name: string; qty: number; unit: string; threshold: number; price: number }

const INITIAL: Item[] = [
  { name: 'White Rice (bags)', qty: 12, unit: 'bag', threshold: 5, price: 1800 },
  { name: 'Palm Oil',          qty: 3,  unit: 'drum', threshold: 4, price: 950 },
  { name: 'Onions',            qty: 8,  unit: 'bag',  threshold: 3, price: 380 },
  { name: 'Tomato Paste',      qty: 0,  unit: 'case', threshold: 2, price: 220 },
]

function getStatus(qty: number, th: number): { label: string; color: string } {
  if (qty === 0) return { label: 'OUT', color: '#ef4444' }
  if (qty <= th) return { label: 'LOW', color: '#fbbf24' }
  return { label: 'OK', color: '#4ade80' }
}

export default function InventoryTracker() {
  const [items, setItems] = React.useState<Item[]>(INITIAL)
  const [showModal, setShowModal] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [form, setForm] = React.useState({ name: '', qty: '', unit: '', threshold: '', price: '' })
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const addItem = () => {
    if (!form.name || !form.qty) return
    setItems(prev => [...prev, { name: form.name, qty: Number(form.qty), unit: form.unit || 'unit', threshold: Number(form.threshold) || 2, price: Number(form.price) || 0 }])
    setForm({ name: '', qty: '', unit: '', threshold: '', price: '' })
    setShowModal(false)
    showToast('✓ Item added')
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#0f1e11', borderRadius: '16px 16px 0 0', padding: 20 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 14, fontSize: 14 }}>Add Inventory Item</div>
            {['name', 'qty', 'unit', 'threshold', 'price'].map(f => (
              <input key={f} placeholder={f === 'qty' ? 'Quantity' : f === 'threshold' ? 'Reorder threshold' : f === 'price' ? 'Price (₡)' : f.charAt(0).toUpperCase() + f.slice(1)} value={(form as Record<string,string>)[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
              />
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={addItem} style={{ flex: 1, padding: 11, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>Add Item</button>
              <button onClick={() => setShowModal(false)} style={{ padding: '11px 16px', borderRadius: 10, background: C.muted, color: C.text, fontWeight: 700, fontSize: 13, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none' }} />
        <button onClick={() => setShowModal(true)} style={{ padding: '9px 14px', borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>+ Add</button>
      </div>

      {filtered.map((item, i) => {
        const st = getStatus(item.qty, item.threshold)
        return (
          <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.name}</div>
              <div style={{ fontSize: 10, color: C.sub }}>{item.qty} {item.unit}s · ₡{item.price.toLocaleString()} each</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}40`, borderRadius: 99, padding: '3px 10px' }}>{st.label}</span>
          </div>
        )
      })}

      <button onClick={() => showToast('✓ Report exported')} style={{ width: '100%', marginTop: 8, padding: 11, borderRadius: 10, background: C.muted, color: C.sub, fontWeight: 700, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
        Export Report
      </button>
    </div>
  )
}
