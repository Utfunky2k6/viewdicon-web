'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

interface Supplier {
  id: string; name: string; verified: boolean; specialty: string[]; location: string; zones: string[]; rating: number; priceRange: string; connected: boolean
}

const INIT_SUPPLIERS: Supplier[] = [
  { id: 'sp1', name: 'Fulani Dairy Cooperative', verified: true, specialty: ['Milk', 'Cheese', 'Yoghurt'], location: 'Plateau, Nigeria', zones: ['Lagos', 'Abuja', 'Kaduna'], rating: 4.9, priceRange: '₡1,200–2,800/L', connected: false },
  { id: 'sp2', name: 'Kumasi Kente Weavers Guild', verified: true, specialty: ['Kente Cloth', 'Ankara', 'Batik'], location: 'Ashanti, Ghana', zones: ['Greater Accra', 'Kumasi', 'Tamale'], rating: 4.7, priceRange: '₡8,000–45,000/roll', connected: false },
  { id: 'sp3', name: 'Ogun Cassava Processors', verified: false, specialty: ['Garri', 'Cassava Flour', 'Tapioca'], location: 'Ogun, Nigeria', zones: ['Lagos', 'Oyo', 'Ogun'], rating: 4.2, priceRange: '₡850–1,400/kg', connected: false },
  { id: 'sp4', name: 'Katutura Leather Works', verified: true, specialty: ['Cow Leather', 'Goat Skin', 'Tanned Hides'], location: 'Windhoek, Namibia', zones: ['Cape Town', 'Johannesburg', 'Harare'], rating: 4.8, priceRange: '₡3,500–12,000/hide', connected: false },
]

interface MySupplier { name: string; lastOrder: string; totalBusiness: number; specialty: string }
const MY_SUPPLIERS: MySupplier[] = [
  { name: 'Kano Groundnut Oil Ltd', lastOrder: '2026-03-14', totalBusiness: 420000, specialty: 'Vegetable Oils' },
  { name: 'Jos Tomato Farms Assoc.', lastOrder: '2026-03-22', totalBusiness: 185000, specialty: 'Fresh Produce' },
]

export default function SupplierConnect({ villageId, roleKey }: ToolProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INIT_SUPPLIERS)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All')
  const [toast, setToast] = useState<string | null>(null)
  const [showQuote, setShowQuote] = useState(false)
  const [quote, setQuote] = useState({ commodity: '', quantity: '', delivLoc: '', deadline: '' })

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const connect = (id: string, name: string) => {
    setSuppliers(s => s.map(x => x.id === id ? { ...x, connected: true } : x))
    flash(`Seso whisper opened with ${name}`)
  }

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.specialty.some(x => x.toLowerCase().includes(q))
    const matchL = location === 'All' || s.location.includes(location)
    return matchQ && matchL
  })

  const sendQuote = () => {
    if (!quote.commodity) return
    flash(`Quote request sent to ${filtered.length} matching suppliers`)
    setShowQuote(false); setQuote({ commodity: '', quantity: '', delivLoc: '', deadline: '' })
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Supplier Connect</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>Discover verified African suppliers</div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="🔍 Search commodity or supplier..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1 }} />
        <select value={location} onChange={e => setLocation(e.target.value)} style={{ ...inp, width: 130 }}>
          <option value="All">All Regions</option>
          <option value="Nigeria">Nigeria</option>
          <option value="Ghana">Ghana</option>
          <option value="Kenya">Kenya</option>
          <option value="Namibia">Namibia</option>
        </select>
      </div>

      {/* Supplier results */}
      <div style={{ marginBottom: 14 }}>
        {filtered.map(s => (
          <div key={s.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {s.name}
                  {s.verified && <span style={{ marginLeft: 6, color: blue, fontSize: 12 }}>✓ Verified</span>}
                </div>
                <div style={{ fontSize: 11, color: muted }}>{s.location}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: gold, fontWeight: 700 }}>⭐ {s.rating}</div>
                <div style={{ fontSize: 11, color: muted }}>{s.priceRange}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {s.specialty.map(sp => (
                <span key={sp} style={{ fontSize: 10, background: '#1e3a20', border: `1px solid ${border}`, borderRadius: 10, padding: '2px 7px', color: muted }}>{sp}</span>
              ))}
            </div>

            <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>
              Delivery zones: {s.zones.join(' · ')}
            </div>

            {s.connected
              ? <span style={{ color: green, fontSize: 12, fontWeight: 700 }}>✓ Whisper opened</span>
              : <button onClick={() => connect(s.id, s.name)} style={btn(blue)}>Connect via Seso</button>
            }
          </div>
        ))}
      </div>

      {/* My suppliers */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>My Suppliers</div>
        {MY_SUPPLIERS.map(s => (
          <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: `1px solid ${border}` }}>
            <div>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: muted }}>{s.specialty} · Last: {s.lastOrder}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: gold }}>₡{s.totalBusiness.toLocaleString()}</div>
              <button onClick={() => flash(`Reorder request sent to ${s.name}`)} style={{ ...btn(green), padding: '3px 10px', marginTop: 4, fontSize: 11 }}>Reorder</button>
            </div>
          </div>
        ))}
      </div>

      {/* Request quote */}
      <button onClick={() => setShowQuote(s => !s)} style={{ ...btn(gold), width: '100%', marginBottom: 10 }}>📋 Request Quote</button>
      {showQuote && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Request for Quote</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input placeholder="Commodity / Product" value={quote.commodity} onChange={e => setQuote(q => ({ ...q, commodity: e.target.value }))} style={inp} />
            <input placeholder="Quantity + unit" value={quote.quantity} onChange={e => setQuote(q => ({ ...q, quantity: e.target.value }))} style={inp} />
            <input placeholder="Delivery location" value={quote.delivLoc} onChange={e => setQuote(q => ({ ...q, delivLoc: e.target.value }))} style={inp} />
            <input type="date" value={quote.deadline} onChange={e => setQuote(q => ({ ...q, deadline: e.target.value }))} style={inp} />
          </div>
          <button onClick={sendQuote} style={btn(gold)}>Send to Matching Suppliers</button>
        </div>
      )}
    </div>
  )
}
