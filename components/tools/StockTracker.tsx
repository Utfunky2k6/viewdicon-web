'use client'
import React, { useState, useMemo } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type StockStatus = 'IN_STOCK' | 'LOW' | 'OUT'
type AdjType = 'ADD' | 'REMOVE' | 'CORRECTION'

interface StockItem {
  id: string; name: string; category: string; qty: number; unit: string; reorderLevel: number; lastUpdated: string
}

const INIT_STOCK: StockItem[] = [
  { id: 's1', name: 'Palm Oil', category: 'Oils & Fats', qty: 48, unit: 'litres', reorderLevel: 20, lastUpdated: '10:15' },
  { id: 's2', name: 'Egusi Seeds', category: 'Spices', qty: 12, unit: 'kg', reorderLevel: 15, lastUpdated: '09:40' },
  { id: 's3', name: 'Stockfish', category: 'Seafood', qty: 0, unit: 'kg', reorderLevel: 5, lastUpdated: '08:30' },
  { id: 's4', name: 'Ankara Fabric', category: 'Textiles', qty: 3, unit: 'rolls', reorderLevel: 5, lastUpdated: '11:00' },
  { id: 's5', name: 'Shea Butter', category: 'Beauty', qty: 85, unit: 'g pots', reorderLevel: 30, lastUpdated: '09:15' },
  { id: 's6', name: 'Groundnut Oil', category: 'Oils & Fats', qty: 22, unit: 'litres', reorderLevel: 25, lastUpdated: '10:50' },
  { id: 's7', name: 'Crayfish', category: 'Spices', qty: 7, unit: 'kg', reorderLevel: 10, lastUpdated: '08:00' },
  { id: 's8', name: 'Fresh Yam', category: 'Tubers', qty: 150, unit: 'kg', reorderLevel: 50, lastUpdated: '12:00' },
]

const CATS = ['All', 'Oils & Fats', 'Spices', 'Seafood', 'Textiles', 'Beauty', 'Tubers']

const getStatus = (item: StockItem): StockStatus => {
  if (item.qty === 0) return 'OUT'
  if (item.qty <= item.reorderLevel) return 'LOW'
  return 'IN_STOCK'
}

const statusColor: Record<StockStatus, string> = { IN_STOCK: green, LOW: amber, OUT: red }
const statusLabel: Record<StockStatus, string> = { IN_STOCK: 'In Stock', LOW: 'Low', OUT: 'Out of Stock' }

export default function StockTracker({ villageId, roleKey }: ToolProps) {
  const [stock, setStock] = useState<StockItem[]>(INIT_STOCK)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [adjItem, setAdjItem] = useState(INIT_STOCK[0].id)
  const [adjType, setAdjType] = useState<AdjType>('ADD')
  const [adjQty, setAdjQty] = useState('')
  const [adjReason, setAdjReason] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const filtered = useMemo(() => stock.filter(i => {
    const matchCat = cat === 'All' || i.category === cat
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  }), [stock, search, cat])

  const lowItems = stock.filter(i => getStatus(i) !== 'IN_STOCK')

  const applyAdj = () => {
    if (!adjQty) return
    setStock(s => s.map(i => {
      if (i.id !== adjItem) return i
      let newQty = i.qty
      const n = Number(adjQty)
      if (adjType === 'ADD') newQty += n
      else if (adjType === 'REMOVE') newQty = Math.max(0, newQty - n)
      else newQty = n
      return { ...i, qty: newQty, lastUpdated: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }
    }))
    setAdjQty(''); setAdjReason('')
    flash('Stock adjusted successfully')
  }

  const exportCSV = () => {
    const rows = ['Name,Category,Qty,Unit,Reorder Level,Status', ...stock.map(i => `${i.name},${i.category},${i.qty},${i.unit},${i.reorderLevel},${getStatus(i)}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'stock.csv'; a.click()
    flash('CSV exported')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 16px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Stock Tracker</div>
          <div style={{ color: muted, fontSize: 12 }}>Adaeze Supplies — Nnewi Market</div>
        </div>
        <button onClick={exportCSV} style={btn(gold)}>⬇ Export CSV</button>
      </div>

      {/* Low stock alerts */}
      {lowItems.length > 0 && (
        <div style={{ background: '#2a1010', border: `1px solid ${red}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: red, marginBottom: 6, fontSize: 13 }}>⚠ Low Stock Alerts ({lowItems.length})</div>
          {lowItems.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: `1px solid ${border}` }}>
              <span>{i.name}</span>
              <span style={{ color: statusColor[getStatus(i)] }}>{i.qty} {i.unit} — {statusLabel[getStatus(i)]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input placeholder="🔍 Search stock..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1 }} />
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inp, width: 140 }}>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 70px 80px 70px', padding: '8px 12px', borderBottom: `1px solid ${border}`, fontSize: 11, color: muted, fontWeight: 700 }}>
          <span>ITEM</span><span>CATEGORY</span><span>QTY</span><span>REORDER</span><span>STATUS</span>
        </div>
        {filtered.map(item => {
          const st = getStatus(item)
          return (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 70px 80px 70px', padding: '10px 12px', borderBottom: `1px solid ${border}`, fontSize: 13, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 10, color: muted }}>Updated {item.lastUpdated}</div>
              </div>
              <span style={{ fontSize: 11, color: muted }}>{item.category}</span>
              <span style={{ fontWeight: 700, color: st === 'OUT' ? red : text }}>{item.qty} <span style={{ fontSize: 10, color: muted }}>{item.unit}</span></span>
              <span style={{ fontSize: 11, color: muted }}>{item.reorderLevel}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[st], background: statusColor[st] + '22', padding: '2px 6px', borderRadius: 10 }}>{statusLabel[st]}</span>
            </div>
          )
        })}
      </div>

      {/* Adjust stock */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Adjust Stock</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <select value={adjItem} onChange={e => setAdjItem(e.target.value)} style={inp}>
            {stock.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select value={adjType} onChange={e => setAdjType(e.target.value as AdjType)} style={inp}>
            <option value="ADD">ADD</option>
            <option value="REMOVE">REMOVE</option>
            <option value="CORRECTION">CORRECTION</option>
          </select>
          <input placeholder="Quantity" type="number" value={adjQty} onChange={e => setAdjQty(e.target.value)} style={inp} />
          <input placeholder="Reason (optional)" value={adjReason} onChange={e => setAdjReason(e.target.value)} style={inp} />
        </div>
        <button onClick={applyAdj} style={btn(green)}>Apply Adjustment</button>
      </div>
    </div>
  )
}
