'use client'
// =====================================================================
// JOLLOF TV MARKETPLACE -- Shoppable Content Commerce
// In-video commerce: viewers buy products featured in content.
// Automatic revenue splits to content creators.
// =====================================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/* -- inject-once CSS (mk- prefix) -- */
const CSS_ID = 'mk-css'
const CSS = `
@keyframes mkFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes mkSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes mkPulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes mkShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes mkCartBounce{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes mkGlow{0%,100%{box-shadow:0 0 8px rgba(212,160,23,.3)}50%{box-shadow:0 0 20px rgba(212,160,23,.6)}}
.mk-fade{animation:mkFade .35s ease both}
.mk-slide{animation:mkSlide .3s ease both}
.mk-pulse{animation:mkPulse 1.4s ease-in-out infinite}
.mk-shimmer{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:mkShimmer 1.8s infinite}
.mk-cart-bounce{animation:mkCartBounce .35s ease}
.mk-glow{animation:mkGlow 2s ease-in-out infinite}
.mk-live-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;animation:mkPulse .7s ease-in-out infinite;display:inline-block;flex-shrink:0}
`

function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

/* -- constants -- */
const GOLD = '#d4a017'
const BG = '#0d0804'
const TEXT = '#f0f7f0'
const CARD_BG = 'rgba(255,255,255,.04)'
const CARD_BORDER = '1px solid rgba(255,255,255,.08)'
const HEAD_FONT = 'Sora, sans-serif'
const BODY_FONT = 'Inter, system-ui, sans-serif'

/* -- data -- */
type Tab = 'shop' | 'orders' | 'store'
type Category = 'All' | 'Fashion' | 'Food' | 'Music' | 'Art' | 'Beauty' | 'Tech' | 'Home' | 'Wellness'
type SortMode = 'trending' | 'newest' | 'price_asc' | 'price_desc' | 'rated'
type OrderStatus = 'Delivered' | 'Shipped' | 'Processing' | 'Returned'
type ShippingType = 'Local' | 'National' | 'Pan-African' | 'Digital'

interface Product {
  id: string
  name: string
  price: number
  emoji: string
  gradient: string
  contentTitle: string
  creator: string
  creatorSplit: number
  vendorSplit: number
  platformSplit: number
  villageSplit: number
  rating: number
  reviews: number
  category: Category
  desc: string
}

interface CartItem {
  product: Product
  qty: number
}

interface Order {
  id: string
  product: string
  emoji: string
  date: string
  price: number
  status: OrderStatus
  statusIcon: string
  deliveryEst: string
  trackingId: string
}

interface MyProduct {
  id: string
  name: string
  emoji: string
  price: number
  sold: number
  revenue: number
  rating: number
  active: boolean
}

const CATEGORIES: Category[] = ['All','Fashion','Food','Music','Art','Beauty','Tech','Home','Wellness']

const PRODUCTS: Product[] = [
  { id:'p1', name:'Ankara Print Set', price:2500, emoji:'👗', gradient:'linear-gradient(135deg,#e07b00,#d4a017)', contentTitle:'Blood of Lagos', creator:'Mama Adaeze', creatorSplit:15, vendorSplit:60, platformSplit:10, villageSplit:15, rating:4.8, reviews:342, category:'Fashion', desc:'Authentic 6-yard Ankara fabric with contemporary West African prints. Each set comes with matching headwrap material.' },
  { id:'p2', name:'Shea Butter Cream', price:800, emoji:'🧴', gradient:'linear-gradient(135deg,#8b5cf6,#a78bfa)', contentTitle:'Motherland Beauty', creator:'Ayo Beauty', creatorSplit:12, vendorSplit:65, platformSplit:10, villageSplit:13, rating:4.6, reviews:189, category:'Beauty', desc:'Pure unrefined shea butter from northern Ghana. Handcrafted by women cooperatives.' },
  { id:'p3', name:'Suya Spice Kit', price:450, emoji:'🌶', gradient:'linear-gradient(135deg,#ef4444,#f97316)', contentTitle:'Jollof Wars', creator:'Chef Kwame', creatorSplit:18, vendorSplit:55, platformSplit:12, villageSplit:15, rating:4.9, reviews:567, category:'Food', desc:'Authentic suya spice blend with groundnut powder, ginger, and cayenne. Makes 50+ servings.' },
  { id:'p4', name:'Kente Clutch Bag', price:3200, emoji:'👜', gradient:'linear-gradient(135deg,#d4a017,#fbbf24)', contentTitle:'Gold Coast Stories', creator:'Kofi Weaves', creatorSplit:20, vendorSplit:55, platformSplit:10, villageSplit:15, rating:4.7, reviews:98, category:'Fashion', desc:'Handwoven Kente fabric clutch bag. Each piece takes 3 days to craft. Unique pattern guaranteed.' },
  { id:'p5', name:'Cowrie Shell Earrings', price:1200, emoji:'🐚', gradient:'linear-gradient(135deg,#06b6d4,#22d3ee)', contentTitle:'Jewels of the Niger', creator:'Amara Crafts', creatorSplit:15, vendorSplit:60, platformSplit:10, villageSplit:15, rating:4.5, reviews:213, category:'Art', desc:'Sterling silver earrings adorned with genuine cowrie shells. Symbol of wealth and divine femininity.' },
  { id:'p6', name:'African Drum Mini', price:4500, emoji:'🥁', gradient:'linear-gradient(135deg,#92400e,#b45309)', contentTitle:'Drums of Destiny', creator:'Drum Master Sekou', creatorSplit:22, vendorSplit:50, platformSplit:10, villageSplit:18, rating:4.9, reviews:76, category:'Music', desc:'Hand-carved djembe drum, 12-inch. Goatskin head with rope tuning. Made in Guinea.' },
  { id:'p7', name:'Dashiki Collection', price:5000, emoji:'👔', gradient:'linear-gradient(135deg,#7c3aed,#a855f7)', contentTitle:'Fashion Forward Africa', creator:'Lagos Couture', creatorSplit:18, vendorSplit:55, platformSplit:12, villageSplit:15, rating:4.8, reviews:445, category:'Fashion', desc:'3-piece dashiki set: embroidered top, matching trousers, and kufi cap. Premium cotton blend.' },
  { id:'p8', name:'Moringa Tea Box', price:600, emoji:'🍵', gradient:'linear-gradient(135deg,#16a34a,#4ade80)', contentTitle:'Heal Africa', creator:'Dr. Ngozi Naturals', creatorSplit:14, vendorSplit:62, platformSplit:10, villageSplit:14, rating:4.4, reviews:321, category:'Wellness', desc:'30-day supply of organic moringa leaf tea. Sourced from smallholder farms in northern Nigeria.' },
  { id:'p9', name:'Afrobeats Vinyl', price:2800, emoji:'🎵', gradient:'linear-gradient(135deg,#ec4899,#f472b6)', contentTitle:'Motherland Frequencies', creator:'DJ Ancestral', creatorSplit:25, vendorSplit:45, platformSplit:15, villageSplit:15, rating:4.7, reviews:156, category:'Music', desc:'Limited edition vinyl pressing. 12 tracks from emerging Pan-African artists. 180g audiophile pressing.' },
  { id:'p10', name:'Calabash Art Set', price:1500, emoji:'🎨', gradient:'linear-gradient(135deg,#f59e0b,#fbbf24)', contentTitle:'The Art Workshop', creator:'Baba Calabash', creatorSplit:20, vendorSplit:55, platformSplit:10, villageSplit:15, rating:4.6, reviews:88, category:'Art', desc:'Set of 3 hand-carved calabash bowls with pyrography art. Each tells a different ancestral story.' },
  { id:'p11', name:'Smart Beads Bracelet', price:3800, emoji:'📿', gradient:'linear-gradient(135deg,#0ea5e9,#38bdf8)', contentTitle:'Silicon Savannah', creator:'AfroTech Labs', creatorSplit:15, vendorSplit:58, platformSplit:12, villageSplit:15, rating:4.3, reviews:201, category:'Tech', desc:'NFC-enabled smart bracelet with traditional bead design. Stores your AfroID, makes Cowrie payments.' },
  { id:'p12', name:'Baobab Oil Set', price:900, emoji:'🌿', gradient:'linear-gradient(135deg,#84cc16,#a3e635)', contentTitle:"Nature's Pharmacy", creator:'Sahel Organics', creatorSplit:14, vendorSplit:62, platformSplit:10, villageSplit:14, rating:4.5, reviews:278, category:'Wellness', desc:'Cold-pressed baobab oil trio: hair, face, and body. Rich in vitamins A, D, E, and omega fatty acids.' },
]

const LIVE_STREAMS = [
  { id:'ls1', title:'Fashion Week Lagos LIVE', host:'Mama Adaeze', viewers:1421, emoji:'👗', products:3, color:'#e07b00' },
  { id:'ls2', title:'Suya Cook-Along', host:'Chef Kwame', viewers:892, emoji:'🍖', products:5, color:'#ef4444' },
  { id:'ls3', title:'Kente Master Class', host:'Kofi Weaves', viewers:2147, emoji:'🧵', products:2, color:'#d4a017' },
]

const ORDERS: Order[] = [
  { id:'ORD-7829', product:'Ankara Print Set', emoji:'👗', date:'2026-04-02', price:2500, status:'Delivered', statusIcon:'delivered', deliveryEst:'Apr 5', trackingId:'TRK-AF-99281' },
  { id:'ORD-7845', product:'Suya Spice Kit', emoji:'🌶', date:'2026-04-03', price:450, status:'Delivered', statusIcon:'delivered', deliveryEst:'Apr 6', trackingId:'TRK-AF-99304' },
  { id:'ORD-7901', product:'African Drum Mini', emoji:'🥁', date:'2026-04-05', price:4500, status:'Shipped', statusIcon:'shipped', deliveryEst:'Apr 10', trackingId:'TRK-AF-99412' },
  { id:'ORD-7923', product:'Moringa Tea Box', emoji:'🍵', date:'2026-04-06', price:600, status:'Processing', statusIcon:'processing', deliveryEst:'Apr 12', trackingId:'TRK-AF-99455' },
  { id:'ORD-7950', product:'Smart Beads Bracelet', emoji:'📿', date:'2026-04-06', price:3800, status:'Processing', statusIcon:'processing', deliveryEst:'Apr 14', trackingId:'TRK-AF-99488' },
  { id:'ORD-7112', product:'Cowrie Shell Earrings', emoji:'🐚', date:'2026-03-20', price:1200, status:'Returned', statusIcon:'returned', deliveryEst:'--', trackingId:'TRK-AF-98001' },
]

const MY_PRODUCTS: MyProduct[] = [
  { id:'mp1', name:'Handmade Leather Sandals', emoji:'👡', price:1800, sold:34, revenue:61200, rating:4.7, active:true },
  { id:'mp2', name:'Ankara Phone Case', emoji:'📱', price:650, sold:128, revenue:83200, rating:4.5, active:true },
  { id:'mp3', name:'Shea Lip Balm Pack', emoji:'💋', price:350, sold:89, revenue:31150, rating:4.8, active:true },
  { id:'mp4', name:'Cowrie Pendant Necklace', emoji:'📿', price:2200, sold:12, revenue:26400, rating:4.6, active:false },
]

const STATUS_MAP: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  Delivered: { label:'Delivered', bg:'rgba(34,197,94,.15)', color:'#4ade80' },
  Shipped:   { label:'Shipped', bg:'rgba(59,130,246,.15)', color:'#60a5fa' },
  Processing:{ label:'Processing', bg:'rgba(251,191,36,.15)', color:'#fbbf24' },
  Returned:  { label:'Returned', bg:'rgba(239,68,68,.15)', color:'#f87171' },
}

/* -- helpers -- */
const fmt = (n: number) => n.toLocaleString()

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.3
  return (
    <span style={{ fontSize: 11, color: '#fbbf24', letterSpacing: 1 }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: 'rgba(255,255,255,.4)', marginLeft: 4, fontSize: 10 }}>{rating}</span>
    </span>
  )
}

function SplitBar({ creator, vendor, platform, village }: { creator: number; vendor: number; platform: number; village: number }) {
  return (
    <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', height: 6, width: '100%', marginTop: 4 }}>
      <div style={{ width: `${creator}%`, background: '#4ade80' }} title={`Creator ${creator}%`} />
      <div style={{ width: `${vendor}%`, background: '#60a5fa' }} title={`Vendor ${vendor}%`} />
      <div style={{ width: `${platform}%`, background: '#a78bfa' }} title={`Platform ${platform}%`} />
      <div style={{ width: `${village}%`, background: GOLD }} title={`Village ${village}%`} />
    </div>
  )
}

function SplitLegend({ small }: { small?: boolean }) {
  const items = [
    { label: 'Creator', color: '#4ade80' },
    { label: 'Vendor', color: '#60a5fa' },
    { label: 'Platform', color: '#a78bfa' },
    { label: 'Village', color: GOLD },
  ]
  return (
    <div style={{ display: 'flex', gap: small ? 8 : 12, flexWrap: 'wrap' }}>
      {items.map(i => (
        <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: small ? 6 : 8, height: small ? 6 : 8, borderRadius: '50%', background: i.color }} />
          <span style={{ fontSize: small ? 9 : 10, color: 'rgba(255,255,255,.5)', fontFamily: BODY_FONT }}>{i.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ===================================================================
   MAIN PAGE
=================================================================== */
export default function JollofMarketplacePage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  const [tab, setTab] = React.useState<Tab>('shop')
  const [category, setCategory] = React.useState<Category>('All')
  const [sort, setSort] = React.useState<SortMode>('trending')
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = React.useState(false)
  const [quickView, setQuickView] = React.useState<Product | null>(null)
  const [cartBounce, setCartBounce] = React.useState(false)
  const [storeForm, setStoreForm] = React.useState(false)

  React.useEffect(() => { injectCSS() }, [])

  /* cart helpers */
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)
  const cartTotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0)

  function addToCart(p: Product) {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === p.id)
      if (existing) return prev.map(c => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { product: p, qty: 1 }]
    })
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 400)
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.product.id !== id))
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(c => {
      if (c.product.id !== id) return c
      const next = c.qty + delta
      return next < 1 ? c : { ...c, qty: next }
    }).filter(c => c.qty > 0))
  }

  /* filter + sort products */
  const filtered = React.useMemo(() => {
    let list = category === 'All' ? [...PRODUCTS] : PRODUCTS.filter(p => p.category === category)
    switch (sort) {
      case 'newest': list.reverse(); break
      case 'price_asc': list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      case 'rated': list.sort((a, b) => b.rating - a.rating); break
      default: break
    }
    return list
  }, [category, sort])

  /* order stats */
  const orderTotal = ORDERS.length
  const orderSpent = ORDERS.reduce((s, o) => s + o.price, 0)
  const activeDeliveries = ORDERS.filter(o => o.status === 'Shipped' || o.status === 'Processing').length

  /* store stats */
  const totalListed = MY_PRODUCTS.length
  const totalSold = MY_PRODUCTS.reduce((s, p) => s + p.sold, 0)
  const totalRevenue = MY_PRODUCTS.reduce((s, p) => s + p.revenue, 0)
  const avgRating = (MY_PRODUCTS.reduce((s, p) => s + p.rating, 0) / MY_PRODUCTS.length).toFixed(1)

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: TEXT, fontFamily: BODY_FONT, paddingBottom: 100 }}>
      {/* ─── Fixed Header ─── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'linear-gradient(180deg,#0d0804 60%,transparent)', backdropFilter: 'blur(12px)', padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>
            <span>&#8592;</span>
          </div>
          <div>
            <h1 style={{ fontFamily: HEAD_FONT, fontSize: 18, fontWeight: 700, margin: 0, color: TEXT }}>Marketplace</h1>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: BODY_FONT }}>Shop What You Watch</span>
          </div>
        </div>
        {/* Cart Icon */}
        <div
          onClick={() => setCartOpen(true)}
          className={cartBounce ? 'mk-cart-bounce' : ''}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', fontSize: 18 }}
        >
          <span>&#128722;</span>
          {cartCount > 0 && (
            <div style={{ position: 'absolute', top: -2, right: -2, background: GOLD, color: '#000', fontSize: 9, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cartCount}
            </div>
          )}
        </div>
      </div>

      {/* ─── Tab Bar ─── */}
      <div style={{ display: 'flex', gap: 0, margin: '0 16px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, overflow: 'hidden' }}>
        {(['shop', 'orders', 'store'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
              fontFamily: HEAD_FONT, fontSize: 13, fontWeight: 600,
              background: tab === t ? GOLD : 'transparent',
              color: tab === t ? '#000' : 'rgba(255,255,255,.5)',
              transition: 'all .2s',
            }}
          >
            {t === 'shop' ? 'Shop' : t === 'orders' ? 'My Orders' : 'My Store'}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      {tab === 'shop' && <ShopTab products={filtered} category={category} setCategory={setCategory} sort={sort} setSort={setSort} addToCart={addToCart} onQuickView={setQuickView} />}
      {tab === 'orders' && <OrdersTab orders={ORDERS} orderTotal={orderTotal} orderSpent={orderSpent} activeDeliveries={activeDeliveries} />}
      {tab === 'store' && <StoreTab products={MY_PRODUCTS} totalListed={totalListed} totalSold={totalSold} totalRevenue={totalRevenue} avgRating={avgRating} storeForm={storeForm} setStoreForm={setStoreForm} />}

      {/* ─── Cart Drawer ─── */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={() => setCartOpen(false)}>
          <div className="mk-slide" onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '80vh', background: '#1a1408', borderRadius: '18px 18px 0 0', padding: '20px 16px 32px', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: HEAD_FONT, fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: TEXT }}>Your Cart ({cartCount})</h3>
            {cart.length === 0 && <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>Your cart is empty</p>}
            {cart.map(c => (
              <div key={c.product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: c.product.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{c.product.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.product.name}</div>
                  <div style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>{'\u20A1'}{fmt(c.product.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => updateQty(c.product.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,.08)', color: TEXT, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: 'center' }}>{c.qty}</span>
                  <button onClick={() => updateQty(c.product.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,.08)', color: TEXT, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button onClick={() => removeFromCart(c.product.id)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,.15)', color: '#f87171', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
              </div>
            ))}
            {cart.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 8px' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Subtotal</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: GOLD, fontFamily: HEAD_FONT }}>{'\u20A1'}{fmt(cartTotal)}</span>
                </div>
                <button style={{ width: '100%', padding: '14px 0', border: 'none', borderRadius: 12, background: `linear-gradient(135deg,${GOLD},#b8860b)`, color: '#000', fontFamily: HEAD_FONT, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                  Checkout {'\u20A1'}{fmt(cartTotal)}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Quick View Sheet ─── */}
      {quickView && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={() => setQuickView(null)}>
          <div className="mk-slide" onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85vh', background: '#1a1408', borderRadius: '18px 18px 0 0', padding: '20px 16px 32px', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
            {/* Product Hero */}
            <div style={{ width: '100%', height: 180, borderRadius: 14, background: quickView.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, marginBottom: 16 }}>
              {quickView.emoji}
            </div>
            <h3 style={{ fontFamily: HEAD_FONT, fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{quickView.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>{'\u20A1'}{fmt(quickView.price)}</span>
              <Stars rating={quickView.rating} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>({quickView.reviews} reviews)</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>
              From: <span style={{ color: '#60a5fa' }}>{quickView.contentTitle}</span> by <span style={{ color: '#4ade80' }}>{quickView.creator}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', margin: '0 0 16px' }}>{quickView.desc}</p>

            {/* Revenue Split */}
            <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontFamily: HEAD_FONT }}>Revenue Split</div>
              <SplitBar creator={quickView.creatorSplit} vendor={quickView.vendorSplit} platform={quickView.platformSplit} village={quickView.villageSplit} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,.45)' }}>
                <span>Creator {quickView.creatorSplit}%</span>
                <span>Vendor {quickView.vendorSplit}%</span>
                <span>Platform {quickView.platformSplit}%</span>
                <span>Village {quickView.villageSplit}%</span>
              </div>
            </div>

            {/* Mock reviews */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, fontFamily: HEAD_FONT }}>Recent Reviews</div>
              {[
                { name: 'Amina K.', text: 'Absolutely beautiful quality! Arrived faster than expected.', stars: 5 },
                { name: 'Kofi M.', text: 'Great product, exactly as shown in the video.', stars: 4 },
              ].map((r, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '8px 10px', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: 10, color: '#fbbf24' }}>{'★'.repeat(r.stars)}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', margin: 0, lineHeight: 1.4 }}>{r.text}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { addToCart(quickView); setQuickView(null) }}
                style={{ flex: 1, padding: '13px 0', border: CARD_BORDER, borderRadius: 12, background: 'rgba(255,255,255,.06)', color: TEXT, fontFamily: HEAD_FONT, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Add to Cart
              </button>
              <button
                onClick={() => { addToCart(quickView); setQuickView(null); setCartOpen(true) }}
                style={{ flex: 1, padding: '13px 0', border: 'none', borderRadius: 12, background: `linear-gradient(135deg,${GOLD},#b8860b)`, color: '#000', fontFamily: HEAD_FONT, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===================================================================
   SHOP TAB
=================================================================== */
function ShopTab({ products, category, setCategory, sort, setSort, addToCart, onQuickView }: {
  products: Product[]
  category: Category
  setCategory: (c: Category) => void
  sort: SortMode
  setSort: (s: SortMode) => void
  addToCart: (p: Product) => void
  onQuickView: (p: Product) => void
}) {
  return (
    <div className="mk-fade" style={{ padding: '0 16px' }}>
      {/* Featured Banner */}
      <div style={{ background: `linear-gradient(135deg,rgba(212,160,23,.15),rgba(212,160,23,.05))`, border: `1px solid rgba(212,160,23,.2)`, borderRadius: 16, padding: '20px 16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle,rgba(212,160,23,.12),transparent)`, borderRadius: '50%' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4, fontFamily: HEAD_FONT }}>Jollof TV Commerce</div>
        <h2 style={{ fontFamily: HEAD_FONT, fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: TEXT }}>Shop What You Watch</h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', margin: '0 0 10px', lineHeight: 1.5 }}>
          Every product featured in Jollof TV content is available here. Creators earn royalties on every sale.
        </p>
        <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
          <span style={{ color: '#4ade80' }}>{PRODUCTS.length} Products</span>
          <span style={{ color: '#60a5fa' }}>8 Categories</span>
          <span style={{ color: GOLD }}>Auto Revenue Splits</span>
        </div>
      </div>

      {/* Sort Pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {([
          { key: 'trending' as SortMode, label: 'Trending' },
          { key: 'newest' as SortMode, label: 'Newest' },
          { key: 'price_asc' as SortMode, label: 'Price \u2191' },
          { key: 'price_desc' as SortMode, label: 'Price \u2193' },
          { key: 'rated' as SortMode, label: 'Best Rated' },
        ]).map(s => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: sort === s.key ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.04)',
              color: sort === s.key ? GOLD : 'rgba(255,255,255,.45)',
              fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: BODY_FONT,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: category === c ? GOLD : 'rgba(255,255,255,.06)',
              color: category === c ? '#000' : 'rgba(255,255,255,.5)',
              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: BODY_FONT,
              transition: 'all .2s',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
        {products.map(p => (
          <div key={p.id} className="mk-fade" style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }} onClick={() => onQuickView(p)}>
            {/* Product Image */}
            <div style={{ height: 110, background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, position: 'relative' }}>
              {p.emoji}
              <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.5)', borderRadius: 6, padding: '2px 6px', fontSize: 9, color: '#4ade80', fontWeight: 600 }}>
                Creator gets {p.creatorSplit}%
              </div>
            </div>
            {/* Info */}
            <div style={{ padding: '10px 10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: GOLD, marginBottom: 3 }}>{'\u20A1'}{fmt(p.price)}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                From: {p.contentTitle}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 6 }}>by {p.creator}</div>
              <Stars rating={p.rating} />
              <SplitBar creator={p.creatorSplit} vendor={p.vendorSplit} platform={p.platformSplit} village={p.villageSplit} />
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(p) }}
                style={{
                  width: '100%', padding: '8px 0', border: 'none', borderRadius: 8, marginTop: 8,
                  background: `linear-gradient(135deg,${GOLD},#b8860b)`, color: '#000',
                  fontFamily: HEAD_FONT, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Commerce Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="mk-live-dot" />
          <h3 style={{ fontFamily: HEAD_FONT, fontSize: 15, fontWeight: 700, margin: 0 }}>Currently Selling LIVE</h3>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
          {LIVE_STREAMS.map(ls => (
            <div key={ls.id} className="mk-glow" style={{ minWidth: 240, background: CARD_BG, border: CARD_BORDER, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ height: 100, background: `linear-gradient(135deg,${ls.color}33,${ls.color}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, position: 'relative' }}>
                {ls.emoji}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,.2)', borderRadius: 6, padding: '2px 8px' }}>
                  <span className="mk-live-dot" />
                  <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700 }}>LIVE</span>
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.5)', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: 'rgba(255,255,255,.7)' }}>
                  {fmt(ls.viewers)} watching
                </div>
              </div>
              <div style={{ padding: '10px 12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ls.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>{ls.host} -- {ls.products} products</div>
                <button style={{ width: '100%', padding: '8px 0', border: 'none', borderRadius: 8, background: '#ef4444', color: '#fff', fontFamily: HEAD_FONT, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Split Legend */}
      <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 14, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, fontFamily: HEAD_FONT }}>How Revenue Splits Work</div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.5, margin: '0 0 10px' }}>
          Every product sold through Jollof TV automatically distributes revenue to the content creator, vendor, platform, and the creator's village treasury.
        </p>
        <SplitLegend />
      </div>
    </div>
  )
}

/* ===================================================================
   ORDERS TAB
=================================================================== */
function OrdersTab({ orders, orderTotal, orderSpent, activeDeliveries }: {
  orders: Order[]
  orderTotal: number
  orderSpent: number
  activeDeliveries: number
}) {
  return (
    <div className="mk-fade" style={{ padding: '0 16px' }}>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Orders', value: String(orderTotal), color: '#60a5fa' },
          { label: 'Total Spent', value: `\u20A1${fmt(orderSpent)}`, color: GOLD },
          { label: 'Active Deliveries', value: String(activeDeliveries), color: '#4ade80' },
        ].map(s => (
          <div key={s.label} style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: HEAD_FONT }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Order List */}
      <h3 style={{ fontFamily: HEAD_FONT, fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Order History</h3>
      {orders.map(o => {
        const st = STATUS_MAP[o.status]
        return (
          <div key={o.id} style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{o.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{o.product}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{'\u20A1'}{fmt(o.price)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{o.id}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{o.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: st.bg, color: st.color, fontWeight: 600 }}>
                    {o.status === 'Delivered' && '\u2705 '}{o.status === 'Shipped' && '\uD83D\uDCE6 '}{o.status === 'Processing' && '\u23F3 '}{o.status === 'Returned' && '\u21A9 '}{st.label}
                  </span>
                  {o.deliveryEst !== '--' && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Est: {o.deliveryEst}</span>}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>Tracking: {o.trackingId}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ padding: '6px 14px', borderRadius: 8, border: CARD_BORDER, background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reorder</button>
                  {o.status === 'Delivered' && <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'rgba(212,160,23,.15)', color: GOLD, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Review</button>}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Returns & Disputes */}
      <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 16 }}>
        <h3 style={{ fontFamily: HEAD_FONT, fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>Returns & Disputes</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, margin: '0 0 12px' }}>
          Have an issue with an order? Jollof Marketplace uses escrow-backed transactions. Returns are processed within 7 days to your Cowrie wallet.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: CARD_BORDER, background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.6)', fontFamily: HEAD_FONT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Request Return
          </button>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,.12)', color: '#f87171', fontFamily: HEAD_FONT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Open Dispute
          </button>
        </div>
        {/* Active return */}
        <div style={{ marginTop: 12, background: 'rgba(239,68,68,.06)', borderRadius: 10, padding: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Cowrie Shell Earrings</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Return initiated Mar 28 -- Refund pending</div>
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(251,191,36,.15)', color: '#fbbf24', fontWeight: 600 }}>Pending</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===================================================================
   STORE TAB
=================================================================== */
function StoreTab({ products, totalListed, totalSold, totalRevenue, avgRating, storeForm, setStoreForm }: {
  products: MyProduct[]
  totalListed: number
  totalSold: number
  totalRevenue: number
  avgRating: string
  storeForm: boolean
  setStoreForm: (v: boolean) => void
}) {
  const [formName, setFormName] = React.useState('')
  const [formDesc, setFormDesc] = React.useState('')
  const [formPrice, setFormPrice] = React.useState('')
  const [formCategory, setFormCategory] = React.useState<Category>('Fashion')
  const [formContent, setFormContent] = React.useState('')
  const [formStock, setFormStock] = React.useState('')
  const [formShipping, setFormShipping] = React.useState<ShippingType>('Local')
  const [localProducts, setLocalProducts] = React.useState<MyProduct[]>(products)

  function toggleActive(id: string) {
    setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10, border: CARD_BORDER,
    background: 'rgba(255,255,255,.04)', color: TEXT, fontSize: 13,
    fontFamily: BODY_FONT, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div className="mk-fade" style={{ padding: '0 16px' }}>
      {/* Store Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Products Listed', value: String(totalListed), color: '#60a5fa' },
          { label: 'Total Sales', value: String(totalSold), color: '#4ade80' },
          { label: 'Revenue This Month', value: `\u20A1${fmt(totalRevenue)}`, color: GOLD },
          { label: 'Avg. Rating', value: avgRating, color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: HEAD_FONT }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Split Breakdown */}
      <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, fontFamily: HEAD_FONT }}>Revenue Split Breakdown</div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', margin: '0 0 10px', lineHeight: 1.5 }}>
          Each sale from your products is automatically distributed based on your content royalty agreement.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Your Vendor Share', pct: 60, color: '#60a5fa' },
            { label: 'Content Creator Royalty', pct: 15, color: '#4ade80' },
            { label: 'Village Treasury', pct: 15, color: GOLD },
            { label: 'Platform Fee', pct: 10, color: '#a78bfa' },
          ].map(row => (
            <div key={row.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'rgba(255,255,255,.55)' }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: 700 }}>{row.pct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                <div style={{ width: `${row.pct}%`, height: '100%', borderRadius: 3, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <SplitLegend small />
        </div>
      </div>

      {/* My Products */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontFamily: HEAD_FONT, fontSize: 14, fontWeight: 700, margin: 0 }}>My Products</h3>
        <button onClick={() => setStoreForm(true)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: GOLD, color: '#000', fontFamily: HEAD_FONT, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          + Add Product
        </button>
      </div>

      {localProducts.map(p => (
        <div key={p.id} style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 12, padding: 14, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{p.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{'\u20A1'}{fmt(p.price)}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>
                <span>{p.sold} sold</span>
                <span>{'\u20A1'}{fmt(p.revenue)} revenue</span>
                <span>{'★'.repeat(Math.floor(p.rating))} {p.rating}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => toggleActive(p.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    background: p.active ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
                    color: p.active ? '#4ade80' : '#f87171',
                  }}
                >
                  {p.active ? 'Active' : 'Paused'}
                </button>
                <button style={{ padding: '4px 10px', borderRadius: 6, border: CARD_BORDER, background: 'transparent', color: 'rgba(255,255,255,.4)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                <button style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,.1)', color: '#f87171', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Product Bottom Sheet */}
      {storeForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={() => setStoreForm(false)}>
          <div className="mk-slide" onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '88vh', background: '#1a1408', borderRadius: '18px 18px 0 0', padding: '20px 16px 32px', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: HEAD_FONT, fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: TEXT }}>List a New Product</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Product Name */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, display: 'block' }}>Product Name</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Hand-carved Mask" style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, display: 'block' }}>Description</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Describe your product..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Price */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, display: 'block' }}>Price ({'\u20A1'})</label>
                <input value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0" type="number" style={inputStyle} />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, display: 'block' }}>Category</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <button
                      key={c}
                      onClick={() => setFormCategory(c)}
                      style={{
                        padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: formCategory === c ? GOLD : 'rgba(255,255,255,.06)',
                        color: formCategory === c ? '#000' : 'rgba(255,255,255,.4)',
                        fontSize: 11, fontWeight: 600,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to Content */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, display: 'block' }}>Link to Content</label>
                <select value={formContent} onChange={e => setFormContent(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="">Select your content...</option>
                  <option value="v1">My Fashion Lookbook (12K views)</option>
                  <option value="v2">Cooking with Spices (8K views)</option>
                  <option value="v3">Art Studio Tour (5K views)</option>
                  <option value="v4">Music Production Vlog (15K views)</option>
                </select>
              </div>

              {/* Creator Royalty */}
              <div style={{ background: 'rgba(212,160,23,.08)', borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>Creator Royalty: 15% (auto-filled from content split)</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>This is automatically set based on your content's royalty configuration.</div>
              </div>

              {/* Stock */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, display: 'block' }}>Stock Quantity</label>
                <input value={formStock} onChange={e => setFormStock(e.target.value)} placeholder="e.g. 50" type="number" style={inputStyle} />
              </div>

              {/* Shipping */}
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, display: 'block' }}>Shipping</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['Local', 'National', 'Pan-African', 'Digital'] as ShippingType[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setFormShipping(s)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: formShipping === s ? GOLD : 'rgba(255,255,255,.06)',
                        color: formShipping === s ? '#000' : 'rgba(255,255,255,.4)',
                        fontSize: 11, fontWeight: 600,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={() => setStoreForm(false)}
                style={{
                  width: '100%', padding: '14px 0', border: 'none', borderRadius: 12, marginTop: 4,
                  background: `linear-gradient(135deg,${GOLD},#b8860b)`, color: '#000',
                  fontFamily: HEAD_FONT, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}
              >
                List Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
