'use client'
import * as React from 'react'

const dark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
const C = {
  bg: dark ? '#050a06' : '#faf6f0',
  card: dark ? '#0d1a0e' : '#ffffff',
  border: dark ? '#1a2e1a' : '#e5ddd0',
  text: dark ? '#f0f7f0' : '#1a0f08',
  sub: dark ? '#6b8f6b' : '#78716c',
  muted: dark ? '#0a140b' : '#f5f0e8',
  green: '#22c55e',
  gold: '#d4a017',
}

const CATEGORIES = [
  { key: 'food', label: '🍲 Food' },
  { key: 'clothes', label: '👗 Clothes' },
  { key: 'electronics', label: '📱 Electronics' },
  { key: 'natural', label: '🌿 Natural Products' },
  { key: 'handcraft', label: '🎨 Handcraft' },
  { key: 'health', label: '💊 Health' },
]

interface Listing {
  id: string
  title: string
  price: number
  originalPrice?: number
  quantity: number
  category: string
  vendor: string
  claimed: boolean
  flashDeal: boolean
}

interface NightMarketData {
  listings: Listing[]
  registered: string[]
  notifyMe: boolean
  lastSummary: { totalSales: number; vendors: number; topItem: string }
}

const INITIAL_DATA: NightMarketData = {
  listings: [
    { id: '1', title: 'Mama Titi Jollof Rice (Party Pack)', price: 800, originalPrice: 1800, quantity: 5, category: 'food', vendor: 'NG-YOR-••••-1234', claimed: false, flashDeal: true },
    { id: '2', title: 'Ankara Dress — Eko Style (Size M/L)', price: 1200, quantity: 2, category: 'clothes', vendor: 'GH-TWI-••••-5678', claimed: false, flashDeal: false },
    { id: '3', title: 'Shea Butter 500ml — Pure & Raw', price: 300, originalPrice: 500, quantity: 10, category: 'natural', vendor: 'SN-WOL-••••-9012', claimed: false, flashDeal: true },
    { id: '4', title: 'Handwoven Basket — Kente Pattern', price: 950, quantity: 3, category: 'handcraft', vendor: 'GH-TWI-••••-3456', claimed: false, flashDeal: false },
    { id: '5', title: 'Used Tecno Spark 10 — Good Condition', price: 35000, quantity: 1, category: 'electronics', vendor: 'KE-KIK-••••-7890', claimed: false, flashDeal: false },
    { id: '6', title: 'Black Soap (Dudu Osun) — Bundle x6', price: 600, originalPrice: 1200, quantity: 8, category: 'health', vendor: 'NG-IGO-••••-2345', claimed: false, flashDeal: true },
  ],
  registered: [],
  notifyMe: false,
  lastSummary: { totalSales: 47, vendors: 12, topItem: 'Mama Titi Jollof Rice' },
}

function initData(): NightMarketData {
  if (typeof window === 'undefined') return INITIAL_DATA
  try {
    const s = localStorage.getItem('night_market_listings')
    if (s) return JSON.parse(s)
  } catch {}
  return INITIAL_DATA
}

function getMarketStatus(): 'open' | 'closed' | 'opening_soon' {
  const now = new Date()
  const h = now.getHours()
  if (h >= 18 && h < 24) return 'open'
  if (h >= 17 && h < 18) return 'opening_soon'
  return 'closed'
}

function getTimeUntilOpen(): string {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  if (h >= 18) return ''
  const hoursLeft = 18 - h - 1
  const minsLeft = 60 - m
  return `${hoursLeft}h ${minsLeft}m`
}

function getTimeUntilClose(): string {
  const now = new Date()
  const m = now.getMinutes()
  const s = now.getSeconds()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3600000)
  const min = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${min}m`
}

export default function NightMarket({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [data, setData] = React.useState<NightMarketData>(initData)
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [toast, setToast] = React.useState('')
  const [showSell, setShowSell] = React.useState(false)
  const [sellForm, setSellForm] = React.useState({ title: '', price: '', originalPrice: '', quantity: '1', category: 'food' })
  const [status] = React.useState(getMarketStatus())
  const [tick, setTick] = React.useState(0)
  const myId = 'NG-YOR-••••-ME01'

  React.useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const save = (d: NightMarketData) => {
    setData(d)
    if (typeof window !== 'undefined') localStorage.setItem('night_market_listings', JSON.stringify(d))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const claimItem = (id: string) => {
    if (status !== 'open') return showToast('Market is closed! Come back tonight at 6pm')
    const updated = data.listings.map(l => l.id === id && l.quantity > 0 && !l.claimed ? { ...l, quantity: l.quantity - 1, claimed: l.quantity === 1 } : l)
    save({ ...data, listings: updated })
    showToast('🛒 Item claimed! Contact vendor via Seso Chat to complete')
  }

  const registerSeller = () => {
    if (data.registered.includes(myId)) return showToast('You are already registered for tonight!')
    save({ ...data, registered: [...data.registered, myId] })
    showToast('✅ Registered! You can post listings when market opens at 6pm')
  }

  const postListing = () => {
    if (!sellForm.title || !sellForm.price) return
    if (status !== 'open') return showToast('Can only post when market is open!')
    const isFlash = sellForm.originalPrice ? ((Number(sellForm.originalPrice) - Number(sellForm.price)) / Number(sellForm.originalPrice)) > 0.5 : false
    const listing: Listing = { id: Date.now().toString(), title: sellForm.title, price: Number(sellForm.price), originalPrice: sellForm.originalPrice ? Number(sellForm.originalPrice) : undefined, quantity: Number(sellForm.quantity), category: sellForm.category, vendor: myId, claimed: false, flashDeal: isFlash }
    save({ ...data, listings: [listing, ...data.listings] })
    setShowSell(false)
    setSellForm({ title: '', price: '', originalPrice: '', quantity: '1', category: 'food' })
    showToast('🌙 Your listing is LIVE in Ọjà Alẹ!')
  }

  const toggleNotify = () => {
    save({ ...data, notifyMe: !data.notifyMe })
    showToast(data.notifyMe ? 'Notifications off' : '🔔 We will alert you when market opens tonight!')
  }

  const filtered = activeCategory === 'all' ? data.listings : data.listings.filter(l => l.category === activeCategory)
  const inputStyle: React.CSSProperties = { width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {/* Market Status Banner */}
      <div style={{ borderRadius: 16, padding: 16, marginBottom: 16, background: status === 'open' ? 'linear-gradient(135deg, #16301a, #1a4a20)' : status === 'opening_soon' ? `${C.gold}18` : C.muted, border: `1px solid ${status === 'open' ? '#22c55e40' : status === 'opening_soon' ? C.gold + '40' : C.border}` }}>
        {status === 'open' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.green, marginBottom: 4 }}>OJA ALE IS LIVE 🔥</div>
            <div style={{ fontSize: 12, color: '#86efac' }}>Night market closes in {getTimeUntilClose()}</div>
            <div style={{ fontSize: 10, color: '#86efac', opacity: 0.7, marginTop: 2 }}>{data.listings.length} items available tonight</div>
          </div>
        )}
        {status === 'opening_soon' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.gold, marginBottom: 4 }}>MARKET OPENS IN {getTimeUntilOpen()}</div>
            <div style={{ fontSize: 11, color: C.sub }}>Vendors are setting up — stay close!</div>
          </div>
        )}
        {status === 'closed' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 2 }}>🌙 Ọjà Alẹ is Closed</div>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>Opens tonight at 6:00 PM — {getTimeUntilOpen() || 'soon'}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={toggleNotify} style={{ padding: '7px 14px', borderRadius: 99, background: data.notifyMe ? C.green : C.card, border: `1px solid ${data.notifyMe ? C.green : C.border}`, color: data.notifyMe ? '#fff' : C.text, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {data.notifyMe ? '🔔 Notified' : '🔔 Alert Me When Open'}
              </button>
              <button onClick={registerSeller} style={{ padding: '7px 14px', borderRadius: 99, background: data.registered.includes(myId) ? C.gold + '18' : C.card, border: `1px solid ${data.registered.includes(myId) ? C.gold : C.border}`, color: data.registered.includes(myId) ? C.gold : C.text, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {data.registered.includes(myId) ? '✅ Selling Tonight' : "I'm Selling Tonight"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Last night summary (when closed) */}
      {status === 'closed' && (
        <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 8 }}>📊 LAST NIGHT'S SUMMARY</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{data.lastSummary.totalSales}</div><div style={{ fontSize: 9, color: C.sub }}>Sales</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 800, color: C.gold }}>{data.lastSummary.vendors}</div><div style={{ fontSize: 9, color: C.sub }}>Vendors</div></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: C.sub }}>Top Item</div><div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{data.lastSummary.topItem}</div></div>
          </div>
        </div>
      )}

      {/* Sell Tonight Button */}
      {status === 'open' && (
        <button onClick={() => setShowSell(s => !s)} style={{ width: '100%', padding: 10, borderRadius: 10, background: showSell ? C.muted : C.gold, border: `1px solid ${showSell ? C.border : C.gold}`, color: showSell ? C.sub : '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 14 }}>
          {showSell ? 'Cancel Listing' : '🌙 Sell Something Tonight'}
        </button>
      )}

      {showSell && status === 'open' && (
        <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>New Night Market Listing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={sellForm.title} onChange={e => setSellForm(f => ({ ...f, title: e.target.value }))} placeholder="What are you selling?" style={inputStyle} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={sellForm.price} onChange={e => setSellForm(f => ({ ...f, price: e.target.value }))} placeholder="Price ₡" type="number" style={{ ...inputStyle }} />
              <input value={sellForm.originalPrice} onChange={e => setSellForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="Orig. price (optional)" type="number" style={{ ...inputStyle }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={sellForm.quantity} onChange={e => setSellForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Qty" type="number" style={{ ...inputStyle, width: '30%' }} />
              <select value={sellForm.category} onChange={e => setSellForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, flex: 1 }}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 10, color: C.sub }}>Listing auto-expires at midnight. Contact via Seso Chat only.</div>
            <button onClick={postListing} style={{ padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Post to Night Market</button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
        <button onClick={() => setActiveCategory('all')} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeCategory === 'all' ? C.green : C.muted, color: activeCategory === 'all' ? '#fff' : C.sub, whiteSpace: 'nowrap', flexShrink: 0 }}>All</button>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setActiveCategory(c.key)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeCategory === c.key ? C.green : C.muted, color: activeCategory === c.key ? '#fff' : C.sub, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Listings */}
      {filtered.map(item => (
        <div key={item.id} style={{ background: C.muted, border: `1px solid ${item.flashDeal ? C.gold : C.border}`, borderRadius: 14, padding: 14, marginBottom: 10, opacity: item.quantity === 0 ? 0.5 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{item.title}</div>
            {item.flashDeal && <span style={{ fontSize: 9, fontWeight: 800, background: C.gold + '18', color: C.gold, border: `1px solid ${C.gold}40`, borderRadius: 99, padding: '2px 8px', marginLeft: 8, whiteSpace: 'nowrap' }}>⚡ FLASH</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.green }}>₡{item.price.toLocaleString()}</div>
            {item.originalPrice && <div style={{ fontSize: 11, color: C.sub, textDecoration: 'line-through' }}>₡{item.originalPrice.toLocaleString()}</div>}
            {item.originalPrice && <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>-{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: C.sub }}>Vendor: {item.vendor} · {item.quantity} left · 🌙 Expires midnight</div>
            <button onClick={() => claimItem(item.id)} disabled={item.quantity === 0} style={{ padding: '6px 14px', borderRadius: 8, background: item.quantity === 0 ? C.border : C.green, color: item.quantity === 0 ? C.sub : '#fff', fontWeight: 700, fontSize: 11, border: 'none', cursor: item.quantity === 0 ? 'default' : 'pointer' }}>
              {item.quantity === 0 ? 'Sold Out' : 'Claim'}
            </button>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: C.sub }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌙</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>No items in this category yet</div>
        </div>
      )}
    </div>
  )
}
