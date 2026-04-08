'use client'
// ═══════════════════════════════════════════════════════════════════
// GLOBAL AFRO MEDIA EXCHANGE — Content Traded Like Assets
// Stock-exchange-style platform for African content creators & fans
// Tabs: Exchange | IPO | Leaderboard
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/* ── inject-once CSS (gx- prefix) ── */
const CSS_ID = 'gx-css'
const CSS = `
@keyframes gxFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes gxTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes gxPulse{0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:1;transform:scale(1.05)}}
@keyframes gxSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes gxShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes gxGlow{0%,100%{box-shadow:0 0 6px rgba(212,160,23,.25)}50%{box-shadow:0 0 20px rgba(212,160,23,.55)}}
@keyframes gxChartBar{from{height:0}to{height:var(--bh)}}
@keyframes gxCountdown{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes gxSparkUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-18px) scale(.6)}}
.gx-fade{animation:gxFade .35s ease both}
.gx-ticker{display:flex;animation:gxTicker 28s linear infinite;white-space:nowrap}
.gx-pulse{animation:gxPulse 1.4s ease-in-out infinite}
.gx-slide{animation:gxSlide .35s cubic-bezier(.4,0,.2,1) both}
.gx-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.06) 50%,transparent 100%);background-size:200% 100%;animation:gxShimmer 2s linear infinite}
.gx-glow{animation:gxGlow 2.8s ease-in-out infinite}
.gx-chart-bar{animation:gxChartBar .6s cubic-bezier(.4,0,.2,1) both}
.gx-countdown{animation:gxCountdown .3s ease both}
.gx-spark{animation:gxSparkUp .7s ease-out forwards;position:absolute;pointer-events:none}
.gx-ticker-strip::-webkit-scrollbar{display:none}
.gx-ticker-strip{-ms-overflow-style:none;scrollbar-width:none}
`

function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════════ */

type TickerItem = { sym: string; price: number; change: number }
const TICKER_DATA: TickerItem[] = [
  { sym: 'BOL', price: 24.50, change: 12.3 },
  { sym: 'MF3', price: 18.20, change: -2.1 },
  { sym: 'SSV', price: 31.00, change: 5.7 },
  { sym: 'DOD', price: 15.80, change: -0.4 },
  { sym: 'TOP', price: 22.10, change: 8.9 },
  { sym: 'MIN', price: 9.50, change: 15.2 },
  { sym: 'JNR', price: 42.30, change: -1.8 },
  { sym: 'ABA', price: 28.70, change: 3.4 },
]

type ContentAsset = {
  sym: string; title: string; creator: string; village: string; price: number
  change: number; volume: string; marketCap: string; type: string
  history: number[]; high24: number; low24: number; shares: number
}
const CONTENT_ASSETS: ContentAsset[] = [
  { sym: 'BOL', title: 'Blood of Lagos', creator: 'Emeka Obi', village: 'Arts', price: 24.50, change: 12.3, volume: '₡42.3K', marketCap: '₡1.2M', type: 'Series', history: [18, 19, 21, 20, 23, 22, 24.5], high24: 25.10, low24: 21.80, shares: 50000 },
  { sym: 'MF3', title: 'Mama Fola S3', creator: 'Yetunde Bakare', village: 'Media', price: 18.20, change: -2.1, volume: '₡18.9K', marketCap: '₡728K', type: 'Reality', history: [20, 19.5, 19, 18.8, 19.2, 18.5, 18.2], high24: 19.40, low24: 17.90, shares: 40000 },
  { sym: 'SSV', title: 'Sahel Sonic Vol.2', creator: 'Amadou Diallo', village: 'Arts', price: 31.00, change: 5.7, volume: '₡31.5K', marketCap: '₡930K', type: 'Music', history: [26, 27, 28, 27.5, 29, 30, 31], high24: 31.50, low24: 28.20, shares: 30000 },
  { sym: 'DOD', title: 'Drums of Destiny', creator: 'Kwame Asante', village: 'Arts', price: 15.80, change: -0.4, volume: '₡12.1K', marketCap: '₡474K', type: 'Film', history: [16, 15.8, 16.1, 15.9, 16, 15.7, 15.8], high24: 16.30, low24: 15.50, shares: 30000 },
  { sym: 'TOP', title: 'The Oracle Podcast', creator: 'Nia Achebe', village: 'Education', price: 22.10, change: 8.9, volume: '₡28.7K', marketCap: '₡884K', type: 'Podcast', history: [17, 18, 19, 18.5, 20, 21, 22.1], high24: 22.80, low24: 19.50, shares: 40000 },
  { sym: 'MIN', title: 'Minding Nigeria', creator: 'Chidi Eze', village: 'Government', price: 9.50, change: 15.2, volume: '₡15.2K', marketCap: '₡285K', type: 'Docu', history: [6, 6.5, 7, 7.8, 8.2, 8.8, 9.5], high24: 10.10, low24: 8.20, shares: 30000 },
  { sym: 'JNR', title: 'Jollof Nation Radio', creator: 'DJ Akua', village: 'Media', price: 42.30, change: -1.8, volume: '₡56.1K', marketCap: '₡2.1M', type: 'Radio', history: [44, 43.5, 43, 42.8, 43.2, 42.5, 42.3], high24: 44.10, low24: 41.80, shares: 50000 },
  { sym: 'ABA', title: 'Aba Market Live', creator: 'Ngozi Ikemba', village: 'Commerce', price: 28.70, change: 3.4, volume: '₡22.4K', marketCap: '₡861K', type: 'Live', history: [25, 26, 26.5, 27, 27.8, 28, 28.7], high24: 29.20, low24: 26.50, shares: 30000 },
]

type IPOData = {
  title: string; creator: string; country: string; ipoPrice: number
  totalShares: number; raised: number; goal: number; endsIn: string
  type: string; gradient: string; bonus?: string
}
const ACTIVE_IPOS: IPOData[] = [
  { title: 'Compound Kids S3', creator: 'Adaeze Nwosu', country: 'Nigeria', ipoPrice: 10, totalShares: 10000, raised: 78000, goal: 100000, endsIn: '3d 14h', type: 'Reality', gradient: 'linear-gradient(135deg,#ef4444,#f97316)', bonus: 'Early Bird: +5% bonus shares' },
  { title: 'Sahel Rising', creator: 'Ibrahim Toure', country: 'Mali', ipoPrice: 5, totalShares: 20000, raised: 45000, goal: 100000, endsIn: '5d 8h', type: 'Documentary', gradient: 'linear-gradient(135deg,#d4a017,#f59e0b)' },
  { title: 'Habesha Beats Vol.1', creator: 'Tigist Bekele', country: 'Ethiopia', ipoPrice: 15, totalShares: 5000, raised: 62000, goal: 75000, endsIn: '1d 2h', type: 'Music', gradient: 'linear-gradient(135deg,#818cf8,#a78bfa)', bonus: 'Almost Funded! +10% bonus' },
  { title: 'Pan-African Cooking Show', creator: 'Chef Amara', country: 'Senegal', ipoPrice: 8, totalShares: 15000, raised: 24000, goal: 120000, endsIn: '12d 0h', type: 'Food', gradient: 'linear-gradient(135deg,#4ade80,#22d3ee)' },
]

const UPCOMING_IPOS = [
  { title: 'Afro Galaxy Episode 11', creator: 'Studio Wakanda', date: 'Apr 15, 2026', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { title: 'Lagos After Dark', creator: 'Nollywood Prime', date: 'Apr 22, 2026', gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  { title: 'Kilimanjaro Diaries', creator: 'Safari Studios', date: 'May 1, 2026', gradient: 'linear-gradient(135deg,#14b8a6,#06b6d4)' },
]

type OrderEntry = { price: number; qty: number; total: number }
const BUY_ORDERS: OrderEntry[] = [
  { price: 24.40, qty: 120, total: 2928 },
  { price: 24.30, qty: 250, total: 6075 },
  { price: 24.20, qty: 80, total: 1936 },
  { price: 24.10, qty: 340, total: 8194 },
  { price: 24.00, qty: 500, total: 12000 },
]
const SELL_ORDERS: OrderEntry[] = [
  { price: 24.60, qty: 90, total: 2214 },
  { price: 24.70, qty: 180, total: 4446 },
  { price: 24.80, qty: 60, total: 1488 },
  { price: 24.90, qty: 220, total: 5478 },
  { price: 25.00, qty: 400, total: 10000 },
]

type TradeRecord = { buyer: string; seller: string; sym: string; qty: number; price: number; time: string }
const RECENT_TRADES: TradeRecord[] = [
  { buyer: 'Ade_Trader', seller: 'NiaFan99', sym: 'BOL', qty: 50, price: 24.50, time: '2m ago' },
  { buyer: 'KwasiInvest', seller: 'MamaG', sym: 'SSV', qty: 120, price: 31.00, time: '5m ago' },
  { buyer: 'DiasporaDan', seller: 'LagosBull', sym: 'JNR', qty: 30, price: 42.30, time: '8m ago' },
  { buyer: 'FemiXP', seller: 'ContentKing', sym: 'TOP', qty: 200, price: 22.10, time: '12m ago' },
  { buyer: 'AkuaArts', seller: 'TradeBot_3', sym: 'MIN', qty: 80, price: 9.50, time: '15m ago' },
  { buyer: 'NgoziCap', seller: 'Ade_Trader', sym: 'ABA', qty: 45, price: 28.70, time: '18m ago' },
  { buyer: 'MamaG', seller: 'KwasiInvest', sym: 'MF3', qty: 60, price: 18.20, time: '22m ago' },
  { buyer: 'LagosBull', seller: 'DiasporaDan', sym: 'DOD', qty: 150, price: 15.80, time: '28m ago' },
  { buyer: 'ContentKing', seller: 'FemiXP', sym: 'BOL', qty: 90, price: 24.48, time: '33m ago' },
  { buyer: 'TradeBot_3', seller: 'AkuaArts', sym: 'SSV', qty: 40, price: 30.85, time: '41m ago' },
]

const LB_CONTENT = [
  { rank: 1, sym: 'JNR', title: 'Jollof Nation Radio', cap: '₡2.1M', price: 42.30, change: -1.8, creator: 'DJ Akua' },
  { rank: 2, sym: 'BOL', title: 'Blood of Lagos', cap: '₡1.2M', price: 24.50, change: 12.3, creator: 'Emeka Obi' },
  { rank: 3, sym: 'SSV', title: 'Sahel Sonic Vol.2', cap: '₡930K', price: 31.00, change: 5.7, creator: 'Amadou Diallo' },
  { rank: 4, sym: 'TOP', title: 'The Oracle Podcast', cap: '₡884K', price: 22.10, change: 8.9, creator: 'Nia Achebe' },
  { rank: 5, sym: 'ABA', title: 'Aba Market Live', cap: '₡861K', price: 28.70, change: 3.4, creator: 'Ngozi Ikemba' },
  { rank: 6, sym: 'MF3', title: 'Mama Fola S3', cap: '₡728K', price: 18.20, change: -2.1, creator: 'Yetunde Bakare' },
  { rank: 7, sym: 'DOD', title: 'Drums of Destiny', cap: '₡474K', price: 15.80, change: -0.4, creator: 'Kwame Asante' },
  { rank: 8, sym: 'AGX', title: 'Afro Galaxy', cap: '₡410K', price: 20.50, change: 6.1, creator: 'Studio Wakanda' },
  { rank: 9, sym: 'MIN', title: 'Minding Nigeria', cap: '₡285K', price: 9.50, change: 15.2, creator: 'Chidi Eze' },
  { rank: 10, sym: 'KDR', title: 'Kilimanjaro Diaries', cap: '₡195K', price: 13.00, change: 2.8, creator: 'Safari Studios' },
]

const LB_CREATORS = [
  { rank: 1, name: 'DJ Akua', village: 'Media', value: '₡2.4M', count: 3, roi: '+42%' },
  { rank: 2, name: 'Emeka Obi', village: 'Arts', value: '₡1.8M', count: 5, roi: '+38%' },
  { rank: 3, name: 'Amadou Diallo', village: 'Arts', value: '₡1.1M', count: 2, roi: '+31%' },
  { rank: 4, name: 'Nia Achebe', village: 'Education', value: '₡950K', count: 4, roi: '+27%' },
  { rank: 5, name: 'Ngozi Ikemba', village: 'Commerce', value: '₡880K', count: 2, roi: '+24%' },
  { rank: 6, name: 'Yetunde Bakare', village: 'Media', value: '₡740K', count: 3, roi: '+19%' },
  { rank: 7, name: 'Kwame Asante', village: 'Arts', value: '₡520K', count: 2, roi: '+15%' },
  { rank: 8, name: 'Studio Wakanda', village: 'Arts', value: '₡460K', count: 1, roi: '+61%' },
  { rank: 9, name: 'Chidi Eze', village: 'Government', value: '₡310K', count: 1, roi: '+52%' },
  { rank: 10, name: 'Chef Amara', village: 'Hospitality', value: '₡280K', count: 2, roi: '+11%' },
]

const LB_INVESTORS = [
  { rank: 1, name: 'DiasporaDan', invested: '₡120K', returns: '₡198K', roi: '+65%', badge: 'Diamond Hands' },
  { rank: 2, name: 'LagosBull', invested: '₡95K', returns: '₡148K', roi: '+56%', badge: 'Wall Street Wolf' },
  { rank: 3, name: 'KwasiInvest', invested: '₡88K', returns: '₡132K', roi: '+50%', badge: 'IPO Pioneer' },
  { rank: 4, name: 'Ade_Trader', invested: '₡75K', returns: '₡108K', roi: '+44%', badge: 'Wall Street Wolf' },
  { rank: 5, name: 'NgoziCap', invested: '₡62K', returns: '₡86K', roi: '+39%', badge: 'Diamond Hands' },
  { rank: 6, name: 'FemiXP', invested: '₡55K', returns: '₡74K', roi: '+35%', badge: 'IPO Pioneer' },
  { rank: 7, name: 'AkuaArts', invested: '₡48K', returns: '₡62K', roi: '+29%', badge: 'Content Mogul' },
  { rank: 8, name: 'MamaG', invested: '₡40K', returns: '₡50K', roi: '+25%', badge: 'Diamond Hands' },
  { rank: 9, name: 'ContentKing', invested: '₡35K', returns: '₡42K', roi: '+20%', badge: 'Wall Street Wolf' },
  { rank: 10, name: 'NiaFan99', invested: '₡28K', returns: '₡32K', roi: '+14%', badge: 'IPO Pioneer' },
]

const BADGES = [
  { name: 'Wall Street Wolf', emoji: '🐺', desc: 'Traded ₡100K+ total volume', color: '#d4a017' },
  { name: 'Diamond Hands', emoji: '💎', desc: 'Held content shares 6+ months', color: '#818cf8' },
  { name: 'IPO Pioneer', emoji: '🚀', desc: 'Invested in 10+ IPOs', color: '#4ade80' },
  { name: 'Content Mogul', emoji: '👑', desc: '5+ content listings on Exchange', color: '#f97316' },
  { name: 'Early Bird', emoji: '🐦', desc: 'Participated in first 24h of any IPO', color: '#22d3ee' },
  { name: 'Whale Alert', emoji: '🐋', desc: 'Single trade exceeding ₡10K', color: '#ef4444' },
]

/* ═══════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════ */
const S = {
  page: { minHeight: '100dvh', background: '#0d0804', color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 } as React.CSSProperties,
  heading: { fontFamily: 'Sora, sans-serif', fontWeight: 700 } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 16 } as React.CSSProperties,
  gold: '#d4a017',
  green: '#4ade80',
  red: '#ef4444',
  muted: 'rgba(255,255,255,.45)',
  mutedBorder: 'rgba(255,255,255,.08)',
  pill: (active: boolean) => ({
    padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 600, fontFamily: 'Sora, sans-serif',
    cursor: 'pointer', border: 'none', transition: 'all .2s',
    background: active ? '#d4a017' : 'rgba(255,255,255,.06)',
    color: active ? '#0d0804' : 'rgba(255,255,255,.5)',
  }) as React.CSSProperties,
  goldBtn: { background: 'linear-gradient(135deg,#d4a017,#b8860b)', color: '#0d0804', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontFamily: 'Sora, sans-serif', fontSize: 14, cursor: 'pointer', width: '100%' } as React.CSSProperties,
  input: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 14px', color: '#f0f7f0', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', width: '100%' } as React.CSSProperties,
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
type Tab = 'exchange' | 'ipo' | 'leaderboard'
type OrderType = 'market' | 'limit' | 'stop'
type TradeSide = 'buy' | 'sell'

export default function GlobalAfroMediaExchange() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [tab, setTab] = React.useState<Tab>('exchange')
  const [selectedAsset, setSelectedAsset] = React.useState<ContentAsset>(CONTENT_ASSETS[0])
  const [tradeSide, setTradeSide] = React.useState<TradeSide>('buy')
  const [orderType, setOrderType] = React.useState<OrderType>('market')
  const [shares, setShares] = React.useState(10)
  const [limitPrice, setLimitPrice] = React.useState('')
  const [searchQ, setSearchQ] = React.useState('')
  const [showIPOSheet, setShowIPOSheet] = React.useState(false)
  const [ipoForm, setIpoForm] = React.useState({ price: '', totalShares: '', goal: '', duration: '14' })
  const [sparkKey, setSparkKey] = React.useState(0)

  React.useEffect(() => { injectCSS() }, [])

  const filteredAssets = CONTENT_ASSETS.filter(a =>
    a.sym.toLowerCase().includes(searchQ.toLowerCase()) ||
    a.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    a.creator.toLowerCase().includes(searchQ.toLowerCase())
  )

  const totalCost = tradeSide === 'buy'
    ? shares * (orderType === 'market' ? selectedAsset.price : (parseFloat(limitPrice) || selectedAsset.price))
    : shares * (orderType === 'market' ? selectedAsset.price : (parseFloat(limitPrice) || selectedAsset.price))

  const handleTrade = () => {
    setSparkKey(k => k + 1)
    // In production: POST to exchange API
  }

  /* ── Ticker Strip ── */
  const TickerStrip = () => {
    const items = [...TICKER_DATA, ...TICKER_DATA]
    return (
      <div style={{ overflow: 'hidden', background: 'rgba(0,0,0,.4)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '8px 0' }} className="gx-ticker-strip">
        <div className="gx-ticker" style={{ gap: 0 }}>
          {items.map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px', fontSize: 13, fontWeight: 600, fontFamily: 'Sora, sans-serif' }}>
              <span style={{ color: '#d4a017' }}>{t.sym}</span>
              <span style={{ color: '#f0f7f0' }}>₡{t.price.toFixed(2)}</span>
              <span style={{ color: t.change >= 0 ? '#4ade80' : '#ef4444' }}>
                {t.change >= 0 ? '▲' : '▼'}{t.change >= 0 ? '+' : ''}{t.change.toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    )
  }

  /* ── Market Overview Cards ── */
  const MarketOverview = () => {
    const stats = [
      { label: 'Total Market Cap', value: '₡8.4M', icon: '📊' },
      { label: '24h Volume', value: '₡342K', icon: '📈' },
      { label: 'Active Listings', value: '156', icon: '📋' },
      { label: 'Avg. Daily Return', value: '+4.2%', icon: '🔥' },
    ]
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '0 16px' }}>
        {stats.map((s, i) => (
          <div key={i} className="gx-fade" style={{ ...S.card, textAlign: 'center', animationDelay: `${i * .08}s`, padding: 12 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: '#d4a017' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Mini Sparkline (CSS gradient) ── */
  const Sparkline = ({ data, up }: { data: number[]; up: boolean }) => {
    const min = Math.min(...data); const max = Math.max(...data)
    const range = max - min || 1
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 }}>
        {data.map((v, i) => (
          <div key={i} style={{
            width: 4, borderRadius: 2,
            background: up ? 'linear-gradient(to top,rgba(74,222,128,.3),#4ade80)' : 'linear-gradient(to top,rgba(239,68,68,.3),#ef4444)',
            height: `${((v - min) / range) * 100}%`, minHeight: 3,
          }} />
        ))}
      </div>
    )
  }

  /* ── Top Movers ── */
  const TopMovers = () => (
    <div style={{ padding: '0 16px' }}>
      <h3 style={{ ...S.heading, fontSize: 15, marginBottom: 10 }}>Top Movers</h3>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }} className="gx-ticker-strip">
        {CONTENT_ASSETS.map((a, i) => {
          const up = a.change >= 0
          return (
            <div key={a.sym} className="gx-fade" onClick={() => { setSelectedAsset(a); setTab('exchange') }}
              style={{
                ...S.card, minWidth: 150, cursor: 'pointer', animationDelay: `${i * .06}s`,
                background: up ? 'rgba(74,222,128,.06)' : 'rgba(239,68,68,.06)',
                borderColor: up ? 'rgba(74,222,128,.15)' : 'rgba(239,68,68,.15)',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: '#d4a017' }}>{a.sym}</span>
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 6, background: 'rgba(255,255,255,.08)', color: S.muted }}>{a.type}</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
              <Sparkline data={a.history} up={up} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>₡{a.price.toFixed(2)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: up ? '#4ade80' : '#ef4444' }}>
                  {up ? '▲' : '▼'}{up ? '+' : ''}{a.change.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  /* ── 7-Day Bar Chart ── */
  const PriceChart = ({ asset }: { asset: ContentAsset }) => {
    const max = Math.max(...asset.history); const min = Math.min(...asset.history)
    const range = max - min || 1
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return (
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: S.muted, marginBottom: 10, fontFamily: 'Sora, sans-serif' }}>7-Day Price History</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
          {asset.history.map((v, i) => {
            const h = ((v - min) / range) * 80 + 20
            const up = i > 0 ? v >= asset.history[i - 1] : true
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 9, color: S.muted }}>₡{v.toFixed(1)}</span>
                <div className="gx-chart-bar" style={{
                  '--bh': `${h}%`, width: '100%', borderRadius: '4px 4px 0 0',
                  background: up ? 'linear-gradient(to top,rgba(74,222,128,.2),#4ade80)' : 'linear-gradient(to top,rgba(239,68,68,.2),#ef4444)',
                  animationDelay: `${i * .08}s`,
                } as React.CSSProperties} />
                <span style={{ fontSize: 9, color: S.muted }}>{days[i]}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ── Order Book ── */
  const OrderBook = () => (
    <div style={{ ...S.card, marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: S.muted, marginBottom: 10, fontFamily: 'Sora, sans-serif' }}>Order Book</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 6 }}>
            {['Price', 'Qty', 'Total'].map(h => (
              <span key={h} style={{ fontSize: 9, color: S.muted, fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          {BUY_ORDERS.map((o, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '3px 0', background: `linear-gradient(to right, rgba(74,222,128,${.08 + i * .03}), transparent)`, borderRadius: 4, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>₡{o.price.toFixed(2)}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{o.qty}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>₡{o.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 6 }}>
            {['Price', 'Qty', 'Total'].map(h => (
              <span key={h} style={{ fontSize: 9, color: S.muted, fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          {SELL_ORDERS.map((o, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '3px 0', background: `linear-gradient(to right, rgba(239,68,68,${.08 + i * .03}), transparent)`, borderRadius: 4, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>₡{o.price.toFixed(2)}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{o.qty}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>₡{o.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── Recent Trades Feed ── */
  const RecentTrades = () => (
    <div style={{ ...S.card }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: S.muted, marginBottom: 10, fontFamily: 'Sora, sans-serif' }}>Recent Trades</div>
      {RECENT_TRADES.map((t, i) => (
        <div key={i} className="gx-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < RECENT_TRADES.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none', animationDelay: `${i * .04}s` }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>{t.buyer}</span>
            <span style={{ fontSize: 10, color: S.muted, margin: '0 4px' }}>bought from</span>
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{t.seller}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#d4a017', fontWeight: 700 }}>{t.sym}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{t.qty} @ ₡{t.price.toFixed(2)}</span>
            <span style={{ fontSize: 10, color: S.muted }}>{t.time}</span>
          </div>
        </div>
      ))}
    </div>
  )

  /* ── Trading Panel ── */
  const TradingPanel = () => (
    <div style={{ padding: '0 16px' }}>
      <h3 style={{ ...S.heading, fontSize: 15, marginBottom: 10 }}>Trading Floor</h3>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search content by symbol, title, or creator..."
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          style={{ ...S.input, marginBottom: 8 }}
        />
        {searchQ && (
          <div style={{ ...S.card, padding: 8, maxHeight: 180, overflowY: 'auto' }}>
            {filteredAssets.map(a => (
              <div key={a.sym} onClick={() => { setSelectedAsset(a); setSearchQ('') }}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', cursor: 'pointer', borderRadius: 8, background: selectedAsset.sym === a.sym ? 'rgba(212,160,23,.12)' : 'transparent' }}>
                <span style={{ fontSize: 13 }}><b style={{ color: '#d4a017' }}>{a.sym}</b> {a.title}</span>
                <span style={{ fontSize: 13, color: a.change >= 0 ? '#4ade80' : '#ef4444' }}>₡{a.price.toFixed(2)}</span>
              </div>
            ))}
            {filteredAssets.length === 0 && <div style={{ fontSize: 12, color: S.muted, padding: 8 }}>No content found</div>}
          </div>
        )}
      </div>

      {/* Selected Asset Detail */}
      <div style={{ ...S.card, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
        {sparkKey > 0 && <span key={sparkKey} className="gx-spark" style={{ top: 10, right: 16, fontSize: 18 }}>+₡</span>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#d4a017' }}>{selectedAsset.sym}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,.08)', color: S.muted }}>{selectedAsset.type}</span>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{selectedAsset.title}</div>
            <div style={{ fontSize: 11, color: S.muted }}>by {selectedAsset.creator} | {selectedAsset.village}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>₡{selectedAsset.price.toFixed(2)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: selectedAsset.change >= 0 ? '#4ade80' : '#ef4444' }}>
              {selectedAsset.change >= 0 ? '▲' : '▼'}{selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change.toFixed(1)}%
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { l: '24h High', v: `₡${selectedAsset.high24.toFixed(2)}` },
            { l: '24h Low', v: `₡${selectedAsset.low24.toFixed(2)}` },
            { l: 'Volume', v: selectedAsset.volume },
            { l: 'Mkt Cap', v: selectedAsset.marketCap },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: S.muted }}>{s.l}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      <PriceChart asset={selectedAsset} />

      {/* Buy / Sell Toggle + Form */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        {/* Buy/Sell toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
          <button onClick={() => setTradeSide('buy')} style={{
            flex: 1, padding: '10px 0', border: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif', cursor: 'pointer',
            background: tradeSide === 'buy' ? 'rgba(74,222,128,.15)' : 'transparent',
            color: tradeSide === 'buy' ? '#4ade80' : S.muted,
            borderBottom: tradeSide === 'buy' ? '2px solid #4ade80' : '2px solid transparent',
          }}>BUY</button>
          <button onClick={() => setTradeSide('sell')} style={{
            flex: 1, padding: '10px 0', border: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif', cursor: 'pointer',
            background: tradeSide === 'sell' ? 'rgba(239,68,68,.15)' : 'transparent',
            color: tradeSide === 'sell' ? '#ef4444' : S.muted,
            borderBottom: tradeSide === 'sell' ? '2px solid #ef4444' : '2px solid transparent',
          }}>SELL</button>
        </div>

        {/* Order type pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['market', 'limit', 'stop'] as OrderType[]).map(ot => (
            <button key={ot} onClick={() => setOrderType(ot)} style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: orderType === ot ? '#d4a017' : 'rgba(255,255,255,.1)',
              background: orderType === ot ? 'rgba(212,160,23,.12)' : 'transparent',
              color: orderType === ot ? '#d4a017' : S.muted,
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
              textTransform: 'capitalize',
            }}>{ot === 'stop' ? 'Stop-Loss' : ot.charAt(0).toUpperCase() + ot.slice(1)}</button>
          ))}
        </div>

        {/* Shares input */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 4 }}>Shares</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={1} max={500} value={shares} onChange={e => setShares(+e.target.value)}
              style={{ flex: 1, accentColor: '#d4a017' }} />
            <input type="number" min={1} max={500} value={shares} onChange={e => setShares(Math.max(1, +e.target.value))}
              style={{ ...S.input, width: 70, textAlign: 'center', padding: '8px 6px' }} />
          </div>
        </div>

        {/* Limit price (if not market) */}
        {orderType !== 'market' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 4 }}>
              {orderType === 'limit' ? 'Limit Price' : 'Stop Price'} (₡)
            </label>
            <input type="number" step="0.01" placeholder={selectedAsset.price.toFixed(2)}
              value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
              style={S.input} />
          </div>
        )}

        {/* Total preview */}
        <div style={{ background: 'rgba(212,160,23,.08)', borderRadius: 10, padding: 12, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: S.muted }}>
            {tradeSide === 'buy' ? 'Total Cost' : 'Total Proceeds'}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#d4a017' }}>
            ₡{totalCost.toFixed(2)}
          </span>
        </div>

        {/* Execute */}
        <button onClick={handleTrade} style={{
          ...S.goldBtn,
          background: tradeSide === 'buy'
            ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
          color: '#fff',
        }}>
          {tradeSide === 'buy' ? 'Buy' : 'Sell'} {shares} {selectedAsset.sym} @ ₡{(orderType === 'market' ? selectedAsset.price : (parseFloat(limitPrice) || selectedAsset.price)).toFixed(2)}
        </button>

        {/* My Position */}
        <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontSize: 11, color: S.muted, fontWeight: 600, fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>My Position in {selectedAsset.sym}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div><div style={{ fontSize: 9, color: S.muted }}>Shares Owned</div><div style={{ fontSize: 13, fontWeight: 700 }}>25</div></div>
            <div><div style={{ fontSize: 9, color: S.muted }}>Avg. Price</div><div style={{ fontSize: 13, fontWeight: 700 }}>₡21.30</div></div>
            <div><div style={{ fontSize: 9, color: S.muted }}>P&L</div><div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>+₡80.00 (+15%)</div></div>
          </div>
        </div>
      </div>

      {/* Order Book + Recent Trades */}
      <OrderBook />
      <RecentTrades />
    </div>
  )

  /* ── IPO Tab ── */
  const IPOTab = () => (
    <div style={{ padding: '0 16px' }}>
      <h3 style={{ ...S.heading, fontSize: 15, marginBottom: 4 }}>Active IPOs</h3>
      <p style={{ fontSize: 11, color: S.muted, marginBottom: 14 }}>Content Initial Public Offerings -- invest in African content before it lists on the Exchange</p>

      {ACTIVE_IPOS.map((ipo, i) => {
        const pct = Math.round((ipo.raised / ipo.goal) * 100)
        return (
          <div key={i} className="gx-fade" style={{ ...S.card, marginBottom: 12, animationDelay: `${i * .08}s`, position: 'relative', overflow: 'hidden' }}>
            {ipo.bonus && (
              <div style={{ position: 'absolute', top: 10, right: -28, background: '#d4a017', color: '#0d0804', fontSize: 9, fontWeight: 700, padding: '3px 32px', transform: 'rotate(35deg)', fontFamily: 'Sora, sans-serif' }}>
                BONUS
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              {/* Creator avatar */}
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: ipo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#fff', flexShrink: 0 }}>
                {ipo.creator.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{ipo.title}</div>
                <div style={{ fontSize: 11, color: S.muted }}>{ipo.creator} ({ipo.country})</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{ipo.type}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="gx-countdown" style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: '#d4a017' }}>{ipo.endsIn}</div>
                <div style={{ fontSize: 9, color: S.muted }}>remaining</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: S.muted }}>IPO Price</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#d4a017' }}>₡{ipo.ipoPrice}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: S.muted }}>Total Shares</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{ipo.totalShares.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: S.muted }}>Raised</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>₡{(ipo.raised / 1000).toFixed(0)}K</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: S.muted }}>₡{ipo.raised.toLocaleString()} / ₡{ipo.goal.toLocaleString()}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: pct >= 75 ? '#4ade80' : '#d4a017' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: pct >= 75 ? 'linear-gradient(90deg,#4ade80,#22c55e)' : 'linear-gradient(90deg,#d4a017,#f59e0b)', transition: 'width .6s ease' }} />
              </div>
            </div>

            {ipo.bonus && <div style={{ fontSize: 10, color: '#d4a017', marginBottom: 8, fontWeight: 600 }}>{ipo.bonus}</div>}

            <button style={S.goldBtn}>Invest Now</button>
          </div>
        )
      })}

      {/* Upcoming IPOs */}
      <h3 style={{ ...S.heading, fontSize: 15, marginTop: 20, marginBottom: 10 }}>Upcoming IPOs</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {UPCOMING_IPOS.map((u, i) => (
          <div key={i} className="gx-fade" style={{ ...S.card, textAlign: 'center', animationDelay: `${i * .08}s`, position: 'relative', overflow: 'hidden' }}>
            <div className="gx-shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 14 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: u.gradient, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>?</div>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>{u.title}</div>
              <div style={{ fontSize: 10, color: S.muted, marginBottom: 2 }}>{u.creator}</div>
              <div style={{ fontSize: 10, color: '#d4a017', fontWeight: 600, marginBottom: 8 }}>{u.date}</div>
              <button style={{ ...S.goldBtn, padding: '8px 12px', fontSize: 11 }}>Notify Me</button>
            </div>
          </div>
        ))}
      </div>

      {/* Launch Your IPO CTA */}
      <div className="gx-glow" style={{ ...S.card, textAlign: 'center', borderColor: 'rgba(212,160,23,.2)', marginBottom: 12 }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🚀</div>
        <div style={{ ...S.heading, fontSize: 17, marginBottom: 4 }}>Launch Your Content IPO</div>
        <div style={{ fontSize: 12, color: S.muted, marginBottom: 12 }}>Turn your content into a tradeable asset. Let fans invest in your work.</div>
        <button onClick={() => setShowIPOSheet(true)} style={S.goldBtn}>Start IPO Application</button>
      </div>

      {/* IPO Bottom Sheet */}
      {showIPOSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowIPOSheet(false)}>
          <div className="gx-slide" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '85vh', background: '#1a1410', borderRadius: '20px 20px 0 0', padding: 20, overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
            <h3 style={{ ...S.heading, fontSize: 18, marginBottom: 4 }}>Launch Your IPO</h3>
            <p style={{ fontSize: 11, color: S.muted, marginBottom: 16 }}>Listing fee: ₡500. Your content will be reviewed before going live.</p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 4 }}>Content (from your uploads)</label>
              <select style={{ ...S.input, appearance: 'auto' }}>
                <option>Select content...</option>
                <option>My Series - Episode 1-12</option>
                <option>Music Album - Afrobeats Vol.3</option>
                <option>Documentary - Village Life</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 4 }}>IPO Price per Share (₡)</label>
                <input type="number" placeholder="e.g. 10" value={ipoForm.price} onChange={e => setIpoForm({ ...ipoForm, price: e.target.value })} style={S.input} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 4 }}>Total Shares to Issue</label>
                <input type="number" placeholder="e.g. 10000" value={ipoForm.totalShares} onChange={e => setIpoForm({ ...ipoForm, totalShares: e.target.value })} style={S.input} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 4 }}>Funding Goal (₡)</label>
                <input type="number" placeholder="e.g. 100000" value={ipoForm.goal} onChange={e => setIpoForm({ ...ipoForm, goal: e.target.value })} style={S.input} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 4 }}>Campaign Duration</label>
                <select value={ipoForm.duration} onChange={e => setIpoForm({ ...ipoForm, duration: e.target.value })} style={{ ...S.input, appearance: 'auto' }}>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                </select>
              </div>
            </div>

            {/* Perks */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: S.muted, display: 'block', marginBottom: 8, fontWeight: 600 }}>Investor Perks</label>
              {[
                { tier: '10+ shares', perk: 'Early access to episodes + behind-the-scenes' },
                { tier: '100+ shares', perk: 'Name in credits + exclusive Q&A with creator' },
                { tier: '1,000+ shares', perk: 'Executive Producer credit + revenue share' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'rgba(212,160,23,.06)', borderRadius: 8, marginBottom: 6, border: '1px solid rgba(212,160,23,.12)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#d4a017', minWidth: 80 }}>{p.tier}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{p.perk}</span>
                </div>
              ))}
            </div>

            {/* Cost summary */}
            {ipoForm.price && ipoForm.totalShares && (
              <div style={{ background: 'rgba(212,160,23,.08)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: S.muted }}>Max Raise</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#d4a017' }}>₡{(parseFloat(ipoForm.price) * parseFloat(ipoForm.totalShares)).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: S.muted }}>Listing Fee</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>₡500</span>
                </div>
              </div>
            )}

            <button onClick={() => setShowIPOSheet(false)} style={S.goldBtn}>Submit for Review (₡500 listing fee)</button>
            <button onClick={() => setShowIPOSheet(false)} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 12, width: '100%', marginTop: 10, cursor: 'pointer', padding: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )

  /* ── Leaderboard Tab ── */
  const LeaderboardTab = () => {
    const [lbTab, setLbTab] = React.useState<'content' | 'creators' | 'investors'>('content')

    return (
      <div style={{ padding: '0 16px' }}>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }} className="gx-ticker-strip">
          {(['content', 'creators', 'investors'] as const).map(t => (
            <button key={t} onClick={() => setLbTab(t)} style={S.pill(lbTab === t)}>
              {t === 'content' ? 'Top Content' : t === 'creators' ? 'Top Creators' : 'Top Investors'}
            </button>
          ))}
        </div>

        {/* Top Content */}
        {lbTab === 'content' && (
          <div>
            <h3 style={{ ...S.heading, fontSize: 14, marginBottom: 10 }}>Top Content by Market Cap</h3>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '28px 44px 1fr 70px 68px 56px', gap: 6, padding: '6px 8px', marginBottom: 4 }}>
              {['#', 'Sym', 'Title', 'Mkt Cap', 'Price', '24h'].map(h => (
                <span key={h} style={{ fontSize: 9, color: S.muted, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{h}</span>
              ))}
            </div>
            {LB_CONTENT.map((c, i) => (
              <div key={i} className="gx-fade" style={{
                display: 'grid', gridTemplateColumns: '28px 44px 1fr 70px 68px 56px', gap: 6,
                padding: '10px 8px', borderRadius: 10, marginBottom: 4, alignItems: 'center',
                background: i < 3 ? 'rgba(212,160,23,.05)' : 'transparent',
                borderLeft: i < 3 ? '2px solid #d4a017' : '2px solid transparent',
                animationDelay: `${i * .04}s`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: i < 3 ? '#d4a017' : S.muted, fontFamily: 'Sora, sans-serif' }}>{c.rank}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#d4a017' }}>{c.sym}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: S.muted }}>{c.creator}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{c.cap}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>₡{c.price.toFixed(2)}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.change >= 0 ? '#4ade80' : '#ef4444' }}>
                  {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Top Creators */}
        {lbTab === 'creators' && (
          <div>
            <h3 style={{ ...S.heading, fontSize: 14, marginBottom: 10 }}>Top Creators by Portfolio Value</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 68px 50px 52px', gap: 6, padding: '6px 8px', marginBottom: 4 }}>
              {['#', 'Creator', 'Village', 'Value', 'Count', 'ROI'].map(h => (
                <span key={h} style={{ fontSize: 9, color: S.muted, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{h}</span>
              ))}
            </div>
            {LB_CREATORS.map((c, i) => (
              <div key={i} className="gx-fade" style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 70px 68px 50px 52px', gap: 6,
                padding: '10px 8px', borderRadius: 10, marginBottom: 4, alignItems: 'center',
                background: i < 3 ? 'rgba(212,160,23,.05)' : 'transparent',
                borderLeft: i < 3 ? '2px solid #d4a017' : '2px solid transparent',
                animationDelay: `${i * .04}s`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: i < 3 ? '#d4a017' : S.muted, fontFamily: 'Sora, sans-serif' }}>{c.rank}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 10, color: S.muted }}>{c.village}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{c.value}</span>
                <span style={{ fontSize: 12 }}>{c.count}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>{c.roi}</span>
              </div>
            ))}
          </div>
        )}

        {/* Top Investors */}
        {lbTab === 'investors' && (
          <div>
            <h3 style={{ ...S.heading, fontSize: 14, marginBottom: 10 }}>Top Investors by Returns</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 68px 68px 48px 90px', gap: 6, padding: '6px 8px', marginBottom: 4 }}>
              {['#', 'Investor', 'Invested', 'Returns', 'ROI', 'Badge'].map(h => (
                <span key={h} style={{ fontSize: 9, color: S.muted, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{h}</span>
              ))}
            </div>
            {LB_INVESTORS.map((inv, i) => (
              <div key={i} className="gx-fade" style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 68px 68px 48px 90px', gap: 6,
                padding: '10px 8px', borderRadius: 10, marginBottom: 4, alignItems: 'center',
                background: i < 3 ? 'rgba(212,160,23,.05)' : 'transparent',
                borderLeft: i < 3 ? '2px solid #d4a017' : '2px solid transparent',
                animationDelay: `${i * .04}s`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: i < 3 ? '#d4a017' : S.muted, fontFamily: 'Sora, sans-serif' }}>{inv.rank}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{inv.name}</span>
                <span style={{ fontSize: 11 }}>{inv.invested}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>{inv.returns}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>{inv.roi}</span>
                <span style={{ fontSize: 9, padding: '3px 6px', borderRadius: 6, background: 'rgba(212,160,23,.12)', color: '#d4a017', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inv.badge}</span>
              </div>
            ))}
          </div>
        )}

        {/* Market Stats */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ ...S.heading, fontSize: 15, marginBottom: 12 }}>Market Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'All-Time Total Traded', value: '₡24.6M', icon: '🏦' },
              { label: 'Most Traded Content', value: '"Blood of Lagos" (₡2.1M vol)', icon: '🔥' },
              { label: 'Biggest Single-Day Gain', value: '"Afro Galaxy" +87%', icon: '📈' },
              { label: 'Biggest IPO', value: '"Drums of Destiny" ₡500K in 48h', icon: '🚀' },
            ].map((s, i) => (
              <div key={i} className="gx-fade" style={{ ...S.card, animationDelay: `${i * .06}s` }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 10, color: S.muted, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: '#d4a017' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ ...S.heading, fontSize: 15, marginBottom: 12 }}>Achievement Badges</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {BADGES.map((b, i) => (
              <div key={i} className="gx-fade" style={{ ...S.card, textAlign: 'center', animationDelay: `${i * .06}s`, borderColor: `${b.color}22` }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{b.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: b.color, marginBottom: 2 }}>{b.name}</div>
                <div style={{ fontSize: 9, color: S.muted, lineHeight: 1.3 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#f0f7f0', fontSize: 20, cursor: 'pointer', padding: 0 }}>&#8592;</button>
          <div>
            <h1 style={{ ...S.heading, fontSize: 20, margin: 0 }}>
              <span style={{ color: '#d4a017' }}>AFRO</span> Media Exchange
            </h1>
            <div style={{ fontSize: 10, color: S.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Content Traded Like Assets</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 8 }}>
          <div className="gx-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 600 }}>MARKET OPEN</span>
          <span style={{ fontSize: 10, color: S.muted, marginLeft: 'auto' }}>Vol: ₡342K | Cap: ₡8.4M</span>
        </div>
      </div>

      {/* Ticker */}
      <TickerStrip />

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 0, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        {([
          { key: 'exchange' as Tab, label: 'Exchange', icon: '📊' },
          { key: 'ipo' as Tab, label: 'IPO', icon: '🚀' },
          { key: 'leaderboard' as Tab, label: 'Leaderboard', icon: '🏆' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === t.key ? '2px solid #d4a017' : '2px solid transparent',
            color: tab === t.key ? '#d4a017' : S.muted,
            fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif', transition: 'all .2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ paddingTop: 16 }}>
        {tab === 'exchange' && (
          <div className="gx-fade">
            <MarketOverview />
            <div style={{ height: 16 }} />
            <TopMovers />
            <div style={{ height: 16 }} />
            <TradingPanel />
          </div>
        )}
        {tab === 'ipo' && (
          <div className="gx-fade">
            <IPOTab />
          </div>
        )}
        {tab === 'leaderboard' && (
          <div className="gx-fade">
            <LeaderboardTab />
          </div>
        )}
      </div>
    </div>
  )
}
