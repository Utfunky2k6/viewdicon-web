'use client'
import * as React from 'react'

const C = {
  bg: '#060d07', card: '#0f1e11', border: '#1e3a20',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

const CATEGORIES = ['All', 'Food', 'Electronics', 'Clothing', 'Services', 'Agricultural']

const ITEMS = [
  { name: 'White Rice (50kg)', cat: 'Food',        price: 1800, ngn: 28000, trend: 'up',   updated: '2h ago' },
  { name: 'Yam (tuber)',        cat: 'Agricultural', price: 120,  ngn: 1850,  trend: 'down', updated: '1h ago' },
  { name: 'Cassava (bag)',      cat: 'Agricultural', price: 450,  ngn: 7000,  trend: 'up',   updated: '3h ago' },
  { name: 'Tomato (basket)',    cat: 'Food',        price: 680,  ngn: 10500, trend: 'up',   updated: '30m ago' },
  { name: 'Palm Oil (25L)',     cat: 'Food',        price: 950,  ngn: 14700, trend: 'down', updated: '2h ago' },
  { name: 'Onions (bag 25kg)', cat: 'Food',        price: 380,  ngn: 5900,  trend: 'up',   updated: '1h ago' },
  { name: 'Groundnut Oil (5L)',cat: 'Food',        price: 320,  ngn: 4950,  trend: 'down', updated: '4h ago' },
  { name: 'Maize (90kg bag)',  cat: 'Agricultural', price: 560,  ngn: 8650,  trend: 'up',   updated: '2h ago' },
  { name: 'Android Phone (mid)',cat:'Electronics',  price: 4200, ngn: 65000, trend: 'down', updated: '6h ago' },
  { name: 'Solar Panel (100W)',cat: 'Electronics',  price: 1500, ngn: 23200, trend: 'down', updated: '5h ago' },
  { name: 'Ankara Fabric (6y)',cat: 'Clothing',    price: 280,  ngn: 4330,  trend: 'up',   updated: '1d ago' },
  { name: 'Buba & Sokoto Set', cat: 'Clothing',    price: 520,  ngn: 8050,  trend: 'down', updated: '1d ago' },
  { name: 'Tailoring (dress)', cat: 'Services',    price: 180,  ngn: 2780,  trend: 'up',   updated: '3h ago' },
  { name: 'Bricklaying (m²)',  cat: 'Services',    price: 90,   ngn: 1390,  trend: 'up',   updated: '12h ago' },
  { name: 'Motorbike Repair',  cat: 'Services',    price: 150,  ngn: 2320,  trend: 'down', updated: '4h ago' },
  { name: 'Eggs (crate 30)',   cat: 'Food',        price: 185,  ngn: 2860,  trend: 'up',   updated: '1h ago' },
  { name: 'Dried Fish (bowl)', cat: 'Food',        price: 420,  ngn: 6500,  trend: 'up',   updated: '2h ago' },
  { name: 'Pepper (kg)',       cat: 'Food',        price: 65,   ngn: 1005,  trend: 'up',   updated: '30m ago' },
  { name: 'Sorghum (50kg)',    cat: 'Agricultural', price: 420,  ngn: 6500,  trend: 'down', updated: '6h ago' },
  { name: 'Laptop (entry)',    cat: 'Electronics',  price: 8500, ngn: 131500,trend: 'down', updated: '1d ago' },
]

export default function PriceChecker() {
  const [query, setQuery] = React.useState('')
  const [cat, setCat] = React.useState('All')
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 3000)
  }

  const filtered = ITEMS.filter(i =>
    (cat === 'All' || i.cat === cat) &&
    (query === '' || i.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}
      {/* Search */}
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search commodity..."
        style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
      />
      {/* Category pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', background: cat === c ? C.green : C.muted, color: cat === c ? '#fff' : C.sub }}
          >
            {c}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {filtered.map(item => (
          <div key={item.name} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>₡{item.price.toLocaleString()}</span>
              <span style={{ fontSize: 12, color: item.trend === 'up' ? '#ef4444' : '#4ade80' }}>
                {item.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
            <div style={{ fontSize: 9, color: C.sub, marginBottom: 6 }}>
              ₦{item.ngn.toLocaleString()} · {item.updated}
            </div>
            <button
              onClick={() => showToast(`✓ Alert set for ${item.name}`)}
              style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.3)', color: '#4ade80', cursor: 'pointer', fontWeight: 700 }}
            >
              Set Alert
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
