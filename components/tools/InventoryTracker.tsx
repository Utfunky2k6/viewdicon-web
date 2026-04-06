'use client'
import * as React from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const C = {
  bg: '#060d07', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e', accent: '#4ade80',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)', red: '#f87171', amber: '#fbbf24',
}

type Unit = 'kg' | 'pieces' | 'liters' | 'boxes' | 'bags' | 'drums' | 'crates'
interface InventoryItem {
  id: string; name: string; category: string; quantity: number; unit: Unit
  reorderPoint: number; costPrice: number; sellingPrice: number
}

const CATEGORIES = ['All', 'Grains', 'Oils', 'Produce', 'Dry Goods', 'Beverages', 'Other']

const INIT_ITEMS: InventoryItem[] = [
  { id: 'i1',  name: 'White Rice (50kg)',    category: 'Grains',    quantity: 12, unit: 'bags',   reorderPoint: 5,  costPrice: 1800, sellingPrice: 2100 },
  { id: 'i2',  name: 'Palm Oil',             category: 'Oils',      quantity: 3,  unit: 'drums',  reorderPoint: 4,  costPrice: 950,  sellingPrice: 1150 },
  { id: 'i3',  name: 'Onions (25kg bag)',    category: 'Produce',   quantity: 8,  unit: 'bags',   reorderPoint: 3,  costPrice: 380,  sellingPrice: 450  },
  { id: 'i4',  name: 'Tomato Paste',         category: 'Dry Goods', quantity: 0,  unit: 'crates', reorderPoint: 2,  costPrice: 220,  sellingPrice: 280  },
  { id: 'i5',  name: 'Spaghetti (carton)',   category: 'Dry Goods', quantity: 18, unit: 'boxes',  reorderPoint: 6,  costPrice: 480,  sellingPrice: 580  },
  { id: 'i6',  name: 'Groundnut Oil (25L)',  category: 'Oils',      quantity: 2,  unit: 'drums',  reorderPoint: 3,  costPrice: 1200, sellingPrice: 1450 },
  { id: 'i7',  name: 'Maize (90kg)',         category: 'Grains',    quantity: 6,  unit: 'bags',   reorderPoint: 4,  costPrice: 560,  sellingPrice: 680  },
  { id: 'i8',  name: 'Malt Beverage (ctn)', category: 'Beverages', quantity: 24, unit: 'boxes',  reorderPoint: 10, costPrice: 800,  sellingPrice: 960  },
  { id: 'i9',  name: 'Semolina (10kg)',      category: 'Grains',    quantity: 5,  unit: 'bags',   reorderPoint: 5,  costPrice: 310,  sellingPrice: 380  },
  { id: 'i10', name: 'Dried Fish (bowl)',    category: 'Dry Goods', quantity: 1,  unit: 'crates', reorderPoint: 2,  costPrice: 420,  sellingPrice: 520  },
]

function stockStatus(qty: number, reorder: number) {
  if (qty === 0) return { label: 'OUT', color: C.red }
  if (qty <= reorder) return { label: 'LOW', color: C.amber }
  return { label: 'OK', color: C.accent }
}

export default function InventoryTracker({ villageId }: ToolProps) {
  const key = `inventory_${villageId || 'default'}`
  const [loading, setLoading] = React.useState(true)
  const [items, setItems] = React.useState<InventoryItem[]>(INIT_ITEMS)
  const [search, setSearch] = React.useState('')
  const [catFilter, setCatFilter] = React.useState('All')
  const [showAdd, setShowAdd] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', category: 'Grains', quantity: '', unit: 'bags' as Unit, reorderPoint: '', costPrice: '', sellingPrice: '' })
  const [toast, setToast] = React.useState('')

  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (stored) { try { setItems(JSON.parse(stored)) } catch {} }
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [key])

  const persist = (updated: InventoryItem[]) => {
    setItems(updated)
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(updated))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const addItem = () => {
    if (!form.name || !form.quantity) return
    const newItem: InventoryItem = {
      id: `i${Date.now()}`, name: form.name, category: form.category,
      quantity: Number(form.quantity), unit: form.unit,
      reorderPoint: Number(form.reorderPoint) || 2,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
    }
    persist([...items, newItem])
    setForm({ name: '', category: 'Grains', quantity: '', unit: 'bags', reorderPoint: '', costPrice: '', sellingPrice: '' })
    setShowAdd(false)
    showToast('Item added to inventory')
  }

  const adjust = (id: string, delta: number) => {
    persist(items.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
  }

  const filtered = items.filter(i =>
    (catFilter === 'All' || i.category === catFilter) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.reorderPoint)
  const outOfStock = items.filter(i => i.quantity === 0)
  const totalValue = items.reduce((acc, i) => acc + i.quantity * i.costPrice, 0)
  const totalRetailValue = items.reduce((acc, i) => acc + i.quantity * i.sellingPrice, 0)

  if (loading) return (
    <div>{[...Array(4)].map((_, i) => <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, height: 64 }} />)}</div>
  )

  return (
    <div style={{ color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {/* Value summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>₡{totalValue.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>Cost Value</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>₡{totalRetailValue.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>Retail Value</div>
        </div>
      </div>

      {/* Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, marginBottom: 6 }}>⚠ Stock Alerts</div>
          {outOfStock.map(i => <div key={i.id} style={{ fontSize: 10, color: C.red, marginBottom: 2 }}>• {i.name} — OUT OF STOCK</div>)}
          {lowStock.map(i => <div key={i.id} style={{ fontSize: 10, color: C.amber, marginBottom: 2 }}>• {i.name} — Low ({i.quantity} {i.unit} remaining)</div>)}
        </div>
      )}

      {/* Search + add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..."
          style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none' }} />
        <button onClick={() => setShowAdd(s => !s)} style={{ padding: '9px 14px', borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>+ Add</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Add Inventory Item</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input placeholder="Item name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{ gridColumn: '1/-1', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none' }}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value as Unit }))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none' }}>
              {(['kg', 'pieces', 'liters', 'boxes', 'bags', 'drums', 'crates'] as Unit[]).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {[['quantity', 'Quantity'], ['reorderPoint', 'Reorder Point'], ['costPrice', 'Cost Price (₡)'], ['sellingPrice', 'Selling Price (₡)']].map(([f, p]) => (
              <input key={f} type="number" placeholder={p} value={(form as Record<string, string>)[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addItem} style={{ flex: 1, padding: 10, borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Add Item</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '10px 14px', borderRadius: 8, background: C.muted, color: C.text, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', background: catFilter === c ? C.green : C.muted, color: catFilter === c ? '#fff' : C.sub }}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.sub }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>No items found</div>
        </div>
      ) : filtered.map(item => {
        const st = stockStatus(item.quantity, item.reorderPoint)
        const margin = item.sellingPrice > 0 ? Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100) : 0
        return (
          <div key={item.id} style={{ background: C.card, border: `1px solid ${st.label !== 'OK' ? `${st.color}40` : C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{item.category} · {item.unit}</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}40`, borderRadius: 99, padding: '3px 10px' }}>{st.label}</span>
            </div>
            {/* Stock level bar */}
            <div style={{ height: 4, borderRadius: 99, background: C.muted, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.min(100, (item.quantity / Math.max(item.reorderPoint * 2, 1)) * 100)}%`, background: st.label === 'OK' ? C.accent : st.color, borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{item.quantity}</div>
                  <div style={{ fontSize: 8, color: C.sub }}>In stock</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>₡{item.sellingPrice}</div>
                  <div style={{ fontSize: 8, color: C.sub }}>Price</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>{margin}%</div>
                  <div style={{ fontSize: 8, color: C.sub }}>Margin</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => adjust(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 6, background: C.muted, border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>−</button>
                <button onClick={() => adjust(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(26,124,62,.2)', border: `1px solid rgba(74,222,128,.3)`, color: C.accent, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>+</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
