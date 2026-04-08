'use client'
// ════════════════════════════════════════════════════════════════════
// Village-Specific Live Stream Overlay System
// Each village gets a unique interactive overlay on top of live streams
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'

// ── Inject-once CSS ─────────────────────────────────────────────────
const CSS_ID = 'village-overlay-css'
const CSS = `
@keyframes voTicker{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
@keyframes voPulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes voFlame{0%{text-shadow:0 0 4px #f97316}50%{text-shadow:0 0 12px #f97316,0 0 20px #ea580c}100%{text-shadow:0 0 4px #f97316}}
@keyframes voCountdown{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@keyframes voSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes voRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes voGauge{0%{stroke-dashoffset:283}100%{stroke-dashoffset:0}}
.vo-tick{animation:voTicker 18s linear infinite}
.vo-pulse{animation:voPulse 2s ease-in-out infinite}
.vo-flame{animation:voFlame 1.5s ease-in-out infinite}
.vo-slide{animation:voSlideUp .3s ease both}
.vo-rotate{animation:voRotate 8s linear infinite}
`

// ── Village overlay config ──────────────────────────────────────────
interface OverlayConfig {
  label: string
  accent: string
  icon: string
  features: string[]
  layout: 'sidebar' | 'bottom' | 'fullwrap' | 'split'
}

const VILLAGE_OVERLAY: Record<string, OverlayConfig> = {
  commerce:     { label: 'Soko Live',         accent: '#e07b00', icon: '🧺', features: ['product-rail', 'cart', 'revenue-ticker', 'buy-cta'],           layout: 'sidebar' },
  health:       { label: 'Iwosan Stream',     accent: '#0369a1', icon: '⚕️',  features: ['book-consult', 'symptom-queue', 'ask-healer', 'vitals'],       layout: 'bottom' },
  agriculture:  { label: 'Irugbin Auction',   accent: '#16a34a', icon: '🌾', features: ['bid-panel', 'crop-price', 'weather', 'harvest-stars'],          layout: 'sidebar' },
  education:    { label: 'Ile-Iwe Live',      accent: '#7c3aed', icon: '🎓', features: ['chapters', 'quiz', 'raise-hand', 'progress'],                  layout: 'sidebar' },
  arts:         { label: 'Ona Gallery',        accent: '#b45309', icon: '🎨', features: ['artwork-carousel', 'commission', 'auction-timer', 'signature'], layout: 'bottom' },
  technology:   { label: 'Imo Code',           accent: '#4f46e5', icon: '💻', features: ['code-area', 'copy', 'bug-report', 'stack-badges'],             layout: 'split' },
  finance:      { label: 'Owo Ticker',         accent: '#059669', icon: '📈', features: ['price-ticker', 'mini-chart', 'alerts', 'portfolio'],           layout: 'bottom' },
  justice:      { label: 'Igbimo Hall',        accent: '#0369a1', icon: '⚖️',  features: ['poll', 'speaker-queue', 'turn-timer', 'verdict'],              layout: 'bottom' },
  security:     { label: 'Abo Watch',          accent: '#7f1d1d', icon: '🛡️',  features: ['status-led', 'incident-report', 'watch-count', 'tips'],       layout: 'bottom' },
  spirituality: { label: 'Ase Circle',         accent: '#6d28d9', icon: '🕯️',  features: ['flame-border', 'prayer-queue', 'offering', 'meditation'],     layout: 'fullwrap' },
  fashion:      { label: 'Aso Runway',         accent: '#be185d', icon: '👗', features: ['outfit-carousel', 'shop-look', 'style-vote', 'lookbook'],      layout: 'bottom' },
  family:       { label: 'Ebi Gathering',      accent: '#0f766e', icon: '👨‍👩‍👧', features: ['watching-sidebar', 'memory-photo', 'libation', 'story-queue'], layout: 'sidebar' },
  transport:    { label: 'Ona Route',          accent: '#0891b2', icon: '🚛', features: ['route-progress', 'eta', 'cargo-status', 'delivery-confirm'],   layout: 'bottom' },
  energy:       { label: 'Agbara Power',       accent: '#b91c1c', icon: '⚡', features: ['solar-gauge', 'grid-led', 'savings', 'carbon-badge'],          layout: 'bottom' },
  hospitality:  { label: 'Ounje Kitchen',      accent: '#c2410c', icon: '🍳', features: ['recipe-overlay', 'order-btn', 'rating', 'step-mode'],         layout: 'bottom' },
  government:   { label: 'Apero Assembly',     accent: '#1d4ed8', icon: '🏛️',  features: ['motion-banner', 'vote-tally', 'speaker-timer', 'transcript'], layout: 'bottom' },
  sports:       { label: 'Ere Arena',          accent: '#0f4c21', icon: '⚽', features: ['scoreboard', 'stats', 'prediction', 'highlight'],              layout: 'bottom' },
  media:        { label: 'Iroyin Desk',        accent: '#d97706', icon: '📰', features: ['news-ticker', 'credibility', 'fact-check', 'poll'],            layout: 'bottom' },
  builders:     { label: 'Ile Blueprint',      accent: '#92400e', icon: '🏗️',  features: ['construction-bar', 'material-list', 'blueprint', 'measure'],  layout: 'sidebar' },
  holdings:     { label: 'Akojo Suite',        accent: '#d4a017', icon: '🏛️',  features: ['multi-asset', 'deal-status', 'nda', 'due-diligence'],        layout: 'sidebar' },
}

// ── Shared style helpers ────────────────────────────────────────────
const glass = (accent: string, alpha = 0.12): React.CSSProperties => ({
  background: `rgba(0,0,0,.65)`,
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: `1px solid ${accent}33`,
  borderRadius: 14,
})

const pill = (accent: string, active: boolean): React.CSSProperties => ({
  padding: '5px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
  background: active ? `${accent}30` : 'rgba(255,255,255,.06)',
  color: active ? accent : 'rgba(255,255,255,.5)',
  fontSize: 10, fontWeight: 700, fontFamily: 'DM Sans,sans-serif',
  transition: 'all .18s',
})

const cta = (accent: string): React.CSSProperties => ({
  padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
  color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: 'Sora,sans-serif',
})

const label: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.4)',
  textTransform: 'uppercase' as const, letterSpacing: '.06em',
}

const bigNum = (accent: string): React.CSSProperties => ({
  fontSize: 18, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace',
})

// ── Per-village overlay renderers ───────────────────────────────────

function CommerceOverlay({ accent }: { accent: string }) {
  const [cart, setCart] = React.useState(0)
  const [revenue, setRevenue] = React.useState(24800)
  const PRODUCTS = [
    { name: 'Palm Oil 5L', price: 4200, img: '🫒' },
    { name: 'Shea Butter', price: 1800, img: '🧴' },
    { name: 'Ankara Bundle', price: 6500, img: '🧵' },
    { name: 'Dried Pepper 2kg', price: 3100, img: '🌶️' },
  ]
  return (
    <div style={{ position: 'absolute', top: 60, right: 0, bottom: 80, width: 160, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 6px', overflowY: 'auto', scrollbarWidth: 'none' }}>
      {/* Cart counter */}
      <div style={{ ...glass(accent), padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 700 }}>🛒 Kapu</span>
        <span style={{ ...bigNum(accent), fontSize: 14 }}>{cart}</span>
      </div>
      {/* Revenue */}
      <div style={{ ...glass(accent), padding: '5px 10px', textAlign: 'center' }}>
        <div style={label}>Owo Earned</div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#4ade80', fontFamily: 'DM Mono,monospace' }}>₡{revenue.toLocaleString()}</div>
      </div>
      {/* Product cards */}
      {PRODUCTS.map((p, i) => (
        <div key={i} className="vo-slide" style={{ ...glass(accent), padding: '8px', display: 'flex', flexDirection: 'column', gap: 5, animationDelay: `${i * 80}ms` }}>
          <div style={{ fontSize: 22, textAlign: 'center' }}>{p.img}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee', lineHeight: 1.2 }}>{p.name}</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>₡{p.price.toLocaleString()}</div>
          <button onClick={() => { setCart(c => c + 1); setRevenue(r => r + p.price) }} style={{ ...cta(accent), width: '100%', fontSize: 10, padding: '6px' }}>
            Ra (Buy)
          </button>
        </div>
      ))}
    </div>
  )
}

function HealthOverlay({ accent }: { accent: string }) {
  const [queue, setQueue] = React.useState(12)
  const [asked, setAsked] = React.useState(false)
  const [question, setQuestion] = React.useState('')
  const [showInput, setShowInput] = React.useState(false)
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Vitals strip */}
      <div style={{ ...glass(accent), padding: '8px 12px', display: 'flex', gap: 12, justifyContent: 'space-around' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16 }}>💓</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#ef4444' }}>72 bpm</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16 }}>🩸</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: accent }}>120/80</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16 }}>🌡️</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#22c55e' }}>36.5C</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={label}>Queue</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: accent }}>{queue}</div>
        </div>
      </div>
      {/* Action row */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setShowInput(v => !v)} style={{ ...cta(accent), flex: 1 }}>
          {showInput ? 'Pada (Close)' : 'Bere (Ask Healer)'}
        </button>
        <button onClick={() => { if (!asked) { setAsked(true); setQueue(q => q + 1) } }} style={{ ...cta('#22c55e'), flex: 1, opacity: asked ? 0.5 : 1 }}>
          {asked ? 'Booked' : 'Ipade (Consult)'}
        </button>
      </div>
      {/* Question input */}
      {showInput && (
        <div className="vo-slide" style={{ ...glass(accent), padding: '8px', display: 'flex', gap: 6 }}>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Describe symptoms..." style={{ flex: 1, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f5ee', fontSize: 11, outline: 'none' }} />
          <button onClick={() => { setQuestion(''); setShowInput(false); setQueue(q => q + 1) }} style={cta(accent)}>Firan</button>
        </div>
      )}
    </div>
  )
}

function AgricultureOverlay({ accent }: { accent: string }) {
  const [bid, setBid] = React.useState('')
  const [topBid, setTopBid] = React.useState(18500)
  const [bags, setBags] = React.useState(42)
  const [stars] = React.useState(4)
  return (
    <div style={{ position: 'absolute', top: 60, right: 0, bottom: 80, width: 165, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 6px' }}>
      {/* Crop header */}
      <div style={{ ...glass(accent), padding: '8px 10px' }}>
        <div style={label}>Irugbin Live Auction</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f5ee', marginTop: 2 }}>Cocoa Beans</div>
        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ fontSize: 12, opacity: i < stars ? 1 : 0.2 }}>⭐</span>)}</div>
      </div>
      {/* Current price */}
      <div style={{ ...glass(accent), padding: '10px', textAlign: 'center' }}>
        <div style={label}>Top Bid</div>
        <div style={bigNum(accent)}>₡{topBid.toLocaleString()}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{bags} bags available</div>
      </div>
      {/* Weather mini */}
      <div style={{ ...glass(accent), padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>☀️</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f0f5ee' }}>32C</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>Clear skies</div>
        </div>
      </div>
      {/* Bid input */}
      <div style={{ ...glass(accent), padding: '8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input value={bid} onChange={e => setBid(e.target.value)} placeholder="Your bid (₡)" style={{ width: '100%', padding: '7px 8px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: `1px solid ${accent}44`, color: '#f0f5ee', fontSize: 11, outline: 'none', boxSizing: 'border-box' }} />
        <button onClick={() => { const n = parseInt(bid); if (n > topBid) { setTopBid(n); setBid('') } }} style={{ ...cta(accent), width: '100%', textAlign: 'center' }}>
          Buwolu (Place Bid)
        </button>
      </div>
    </div>
  )
}

function EducationOverlay({ accent }: { accent: string }) {
  const [handUp, setHandUp] = React.useState(false)
  const [showNotes, setShowNotes] = React.useState(false)
  const [progress] = React.useState(45)
  const [students] = React.useState(187)
  const CHAPTERS = ['1. Intro', '2. History', '3. Practice', '4. Review']
  const [chapter, setChapter] = React.useState(0)
  return (
    <div style={{ position: 'absolute', top: 60, right: 0, bottom: 80, width: 160, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 6px', overflowY: 'auto', scrollbarWidth: 'none' }}>
      {/* Progress bar */}
      <div style={{ ...glass(accent), padding: '8px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={label}>Ilana (Progress)</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: accent }}>{progress}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, ${accent}88)`, borderRadius: 99 }} />
        </div>
      </div>
      {/* Students badge */}
      <div style={{ ...glass(accent), padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>👥</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#f0f5ee' }}>{students} Akeko</span>
        <span style={{ fontSize: 13, marginLeft: 'auto' }}>🎓</span>
      </div>
      {/* Chapters */}
      <div style={{ ...glass(accent), padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={label}>Ori-Iwe (Chapters)</div>
        {CHAPTERS.map((ch, i) => (
          <button key={i} onClick={() => setChapter(i)} style={{ ...pill(accent, chapter === i), fontSize: 9, textAlign: 'left', width: '100%' }}>{ch}</button>
        ))}
      </div>
      {/* Actions */}
      <button onClick={() => setHandUp(!handUp)} style={{ ...cta(handUp ? '#22c55e' : accent), width: '100%', textAlign: 'center' }}>
        {handUp ? '✋ Owo Ti Gbe' : '✋ Gbe Owo (Raise Hand)'}
      </button>
      <button onClick={() => setShowNotes(!showNotes)} style={{ ...cta(accent), width: '100%', textAlign: 'center', opacity: 0.8 }}>
        {showNotes ? 'Pa Akosile' : '📝 Akosile (Notes)'}
      </button>
      <button style={{ ...cta('#f59e0b'), width: '100%', textAlign: 'center' }}>
        Idanwo (Quiz)
      </button>
    </div>
  )
}

function ArtsOverlay({ accent }: { accent: string }) {
  const [auctionSec, setAuctionSec] = React.useState(347)
  const [selected, setSelected] = React.useState(0)
  const WORKS = [
    { title: 'Adire Indigo', price: 12000, emoji: '🎨' },
    { title: 'Bronze Head', price: 45000, emoji: '🏺' },
    { title: 'Kente Weave', price: 8700, emoji: '🧵' },
    { title: 'Beaded Crown', price: 22000, emoji: '👑' },
  ]
  React.useEffect(() => { const iv = setInterval(() => setAuctionSec(s => Math.max(0, s - 1)), 1000); return () => clearInterval(iv) }, [])
  const mm = Math.floor(auctionSec / 60); const ss = auctionSec % 60
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Auction timer */}
      <div style={{ ...glass(accent), padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={label}>Titaja (Auction)</span>
        <span className="vo-pulse" style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>{mm}:{ss.toString().padStart(2, '0')}</span>
        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${accent}22`, color: accent, fontWeight: 700 }}>Ona Master</span>
      </div>
      {/* Carousel */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '2px 0' }}>
        {WORKS.map((w, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{ ...glass(accent), flexShrink: 0, width: 110, padding: '8px', cursor: 'pointer', border: selected === i ? `2px solid ${accent}` : '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 4 }}>{w.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee' }}>{w.title}</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>₡{w.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
      {/* CTA */}
      <button style={{ ...cta(accent), width: '100%', textAlign: 'center' }}>
        Pase Ise (Commission) — {WORKS[selected].title}
      </button>
    </div>
  )
}

function TechnologyOverlay({ accent }: { accent: string }) {
  const [copied, setCopied] = React.useState(false)
  const [bugs, setBugs] = React.useState(3)
  const STACKS = ['React', 'Node', 'Rust', 'TS', 'Go']
  const CODE = `async function transfer(from, to, amt) {\n  const tx = await chain.send({\n    from, to, amount: amt,\n    currency: 'COW'\n  });\n  return tx.hash;\n}`
  return (
    <div style={{ position: 'absolute', top: 60, right: 0, bottom: 80, width: 185, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 6px' }}>
      {/* Stack badges */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {STACKS.map(s => (
          <span key={s} style={{ padding: '3px 7px', borderRadius: 6, background: `${accent}22`, color: accent, fontSize: 9, fontWeight: 700 }}>{s}</span>
        ))}
      </div>
      {/* Code block */}
      <div style={{ ...glass(accent), padding: '8px', fontFamily: 'DM Mono,monospace', fontSize: 9, color: '#a5f3fc', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 140, overflowY: 'auto', scrollbarWidth: 'none', background: 'rgba(0,0,0,.8)' }}>
        {CODE}
      </div>
      {/* Copy */}
      <button onClick={() => { navigator.clipboard?.writeText(CODE).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ ...cta(accent), width: '100%', textAlign: 'center' }}>
        {copied ? 'Daakope!' : 'Daako (Copy)'}
      </button>
      {/* Bug report */}
      <button onClick={() => setBugs(b => b + 1)} style={{ ...glass(accent), padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: `1px solid ${accent}33`, background: 'rgba(239,68,68,.08)' } as React.CSSProperties}>
        <span style={{ fontSize: 13 }}>🐛</span>
        <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700 }}>Asiloju (Bug) Report</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: '#f87171' }}>{bugs}</span>
      </button>
      {/* Terminal */}
      <div style={{ ...glass(accent), padding: '6px 8px', background: 'rgba(0,0,0,.8)' }}>
        <div style={{ fontSize: 8, color: '#22c55e', fontFamily: 'DM Mono,monospace' }}>$ npm run build</div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)', fontFamily: 'DM Mono,monospace' }}>compiled successfully in 4.2s</div>
      </div>
    </div>
  )
}

function FinanceOverlay({ accent }: { accent: string }) {
  const [alertOn, setAlertOn] = React.useState(false)
  const [showConvert, setShowConvert] = React.useState(false)
  const TICKERS = [
    { sym: 'COW', price: '1.00', chg: '+0.0%' },
    { sym: 'NGN', price: '0.0006', chg: '-0.2%' },
    { sym: 'USD', price: '1.12', chg: '+0.1%' },
    { sym: 'KES', price: '0.008', chg: '+0.3%' },
    { sym: 'GHS', price: '0.07', chg: '-0.1%' },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Scrolling ticker */}
      <div style={{ ...glass(accent), padding: '5px 0', overflow: 'hidden' }}>
        <div className="vo-tick" style={{ display: 'flex', gap: 16, whiteSpace: 'nowrap' }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700 }}>
              <span style={{ color: accent }}>{t.sym}</span>
              <span style={{ color: '#f0f5ee', marginLeft: 4 }}>{t.price}</span>
              <span style={{ color: t.chg.startsWith('+') ? '#4ade80' : '#f87171', marginLeft: 3 }}>{t.chg}</span>
            </span>
          ))}
        </div>
      </div>
      {/* Mini chart area */}
      <div style={{ ...glass(accent), padding: '8px 12px', display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
        {[35, 42, 38, 50, 45, 55, 52, 60, 48, 62, 58, 65].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(180deg, ${accent}, ${accent}44)`, borderRadius: '2px 2px 0 0' }} />
        ))}
      </div>
      {/* Portfolio summary */}
      <div style={{ ...glass(accent), padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={label}>Apo Owo (Portfolio)</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', fontFamily: 'DM Mono,monospace' }}>₡142,800</div>
        </div>
        <button onClick={() => setAlertOn(!alertOn)} style={{ ...pill(accent, alertOn), fontSize: 14, padding: '4px 8px' }}>
          {alertOn ? '🔔' : '🔕'}
        </button>
        <button onClick={() => setShowConvert(!showConvert)} style={cta(accent)}>Paaroo (Convert)</button>
      </div>
      {/* Converter */}
      {showConvert && (
        <div className="vo-slide" style={{ ...glass(accent), padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>1 COW =</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: accent }}>₦1,650</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: accent }}>$1.12</span>
        </div>
      )}
    </div>
  )
}

function JusticeOverlay({ accent }: { accent: string }) {
  const [yay, setYay] = React.useState(64)
  const [timer, setTimer] = React.useState(120)
  const [seconded, setSeconded] = React.useState(false)
  const SPEAKERS = ['Elder Kwame', 'Adv. Nkechi', 'Hon. Obasi']
  React.useEffect(() => { const iv = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000); return () => clearInterval(iv) }, [])
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Vote bar */}
      <div style={{ ...glass(accent), padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80' }}>Gba {yay}%</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>Ko {100 - yay}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'rgba(239,68,68,.2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${yay}%`, background: 'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius: 99, transition: 'width .4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button onClick={() => setYay(Math.min(99, yay + 2))} style={{ ...cta('#22c55e'), flex: 1, textAlign: 'center' }}>Gba (Agree)</button>
          <button onClick={() => setYay(Math.max(1, yay - 2))} style={{ ...cta('#ef4444'), flex: 1, textAlign: 'center' }}>Ko (Oppose)</button>
        </div>
      </div>
      {/* Speaker queue + timer */}
      <div style={{ ...glass(accent), padding: '8px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={label}>Alagbawi (Speaker)</div>
          {SPEAKERS.map((s, i) => (
            <div key={i} style={{ fontSize: 10, color: i === 0 ? '#f0f5ee' : 'rgba(255,255,255,.35)', fontWeight: i === 0 ? 800 : 400, marginTop: 2 }}>
              {i === 0 ? '🎙️ ' : `${i + 1}. `}{s}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={label}>Akoko</div>
          <div className="vo-pulse" style={{ fontSize: 18, fontWeight: 900, color: timer < 30 ? '#ef4444' : accent, fontFamily: 'DM Mono,monospace' }}>
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      {/* Second motion */}
      <button onClick={() => setSeconded(true)} style={{ ...cta(seconded ? '#22c55e' : accent), width: '100%', textAlign: 'center', opacity: seconded ? 0.6 : 1 }}>
        {seconded ? 'Ero Ti Gba Atileyin' : 'Atileyin Ero (Second Motion)'}
      </button>
    </div>
  )
}

function SecurityOverlay({ accent }: { accent: string }) {
  const [level, setLevel] = React.useState<'green' | 'amber' | 'red'>('green')
  const [incidents, setIncidents] = React.useState(0)
  const [watchers] = React.useState(842)
  const TIPS = ['Lock doors at night', 'Report suspicious activity', 'Keep emergency contacts ready', 'Walk in well-lit areas']
  const [tipIdx, setTipIdx] = React.useState(0)
  React.useEffect(() => { const iv = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 4000); return () => clearInterval(iv) }, [])
  const LED_COLOR = { green: '#22c55e', amber: '#eab308', red: '#ef4444' }
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Status */}
      <div style={{ ...glass(accent), padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="vo-pulse" style={{ width: 14, height: 14, borderRadius: '50%', background: LED_COLOR[level], boxShadow: `0 0 10px ${LED_COLOR[level]}` }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f0f5ee' }}>Ipo Abo: {level.toUpperCase()}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>Community Status</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 13 }}>👁️</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f0f5ee' }}>{watchers}</span>
        </div>
      </div>
      {/* Alert levels toggle */}
      <div style={{ display: 'flex', gap: 4 }}>
        {(['green', 'amber', 'red'] as const).map(l => (
          <button key={l} onClick={() => setLevel(l)} style={{ ...pill(LED_COLOR[l], level === l), flex: 1, textAlign: 'center' }}>{l.toUpperCase()}</button>
        ))}
      </div>
      {/* Report */}
      <button onClick={() => setIncidents(i => i + 1)} style={{ ...cta('#ef4444'), width: '100%', textAlign: 'center' }}>
        Iroyin Iwa-Ipa (Report Incident) [{incidents}]
      </button>
      {/* Tips */}
      <div style={{ ...glass(accent), padding: '6px 10px', fontSize: 10, color: 'rgba(255,255,255,.6)' }}>
        Imoran: {TIPS[tipIdx]}
      </div>
    </div>
  )
}

function SpiritualityOverlay({ accent }: { accent: string }) {
  const [prayers, setPrayers] = React.useState(7)
  const [blessings, setBlessings] = React.useState(142)
  const [medSec, setMedSec] = React.useState(0)
  const [meditating, setMeditating] = React.useState(false)
  React.useEffect(() => { if (!meditating) return; const iv = setInterval(() => setMedSec(s => s + 1), 1000); return () => clearInterval(iv) }, [meditating])
  const mm = Math.floor(medSec / 60); const ss = medSec % 60
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Flame border effect */}
      <div className="vo-flame" style={{ position: 'absolute', inset: 0, border: `2px solid ${accent}55`, borderRadius: 0, pointerEvents: 'none' }} />
      {/* Sacred symbol */}
      <div className="vo-rotate" style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', fontSize: 28, opacity: 0.15, pointerEvents: 'none' }}>
        ☥
      </div>
      {/* Bottom panel */}
      <div style={{ padding: '0 8px 88px', display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'auto' }}>
        {/* Blessings + meditation */}
        <div style={{ ...glass(accent), padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14 }}>🕯️</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: accent }}>{blessings}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>Ibukun</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14 }}>🙏</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#f0f5ee' }}>{prayers}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>Adura Queue</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14 }}>🧘</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: meditating ? '#22c55e' : 'rgba(255,255,255,.4)', fontFamily: 'DM Mono,monospace' }}>
              {mm}:{ss.toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>Ifarabalero</div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setPrayers(p => p + 1) }} style={{ ...cta(accent), flex: 1, textAlign: 'center' }}>
            Adura (Prayer)
          </button>
          <button onClick={() => setBlessings(b => b + 1)} style={{ ...cta('#d4a017'), flex: 1, textAlign: 'center' }}>
            Ebo (Offering) 🐚
          </button>
          <button onClick={() => setMeditating(!meditating)} style={{ ...cta(meditating ? '#22c55e' : accent), flex: 1, textAlign: 'center' }}>
            {meditating ? 'Duro' : 'Simi'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FashionOverlay({ accent }: { accent: string }) {
  const [selected, setSelected] = React.useState(0)
  const [votes, setVotes] = React.useState<Record<number, 'hot' | 'cold' | null>>({})
  const [showGrid, setShowGrid] = React.useState(false)
  const LOOKS = [
    { name: 'Agbada Royal', price: 28000, emoji: '👘' },
    { name: 'Ankara Mini', price: 8500, emoji: '👗' },
    { name: 'Kente Duo', price: 15000, emoji: '🧣' },
    { name: 'Adire Gown', price: 12000, emoji: '👔' },
    { name: 'Coral Set', price: 35000, emoji: '💎' },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Outfit carousel */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '2px 0' }}>
        {LOOKS.map((l, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{ ...glass(accent), flexShrink: 0, width: 95, padding: '8px', cursor: 'pointer', border: selected === i ? `2px solid ${accent}` : '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ fontSize: 26, textAlign: 'center' }}>{l.emoji}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#f0f5ee', marginTop: 2 }}>{l.name}</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>₡{l.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
      {/* Actions row */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setVotes(v => ({ ...v, [selected]: 'hot' }))} style={{ ...pill(accent, votes[selected] === 'hot'), flex: 1, textAlign: 'center', fontSize: 14 }}>
          🔥
        </button>
        <button onClick={() => setVotes(v => ({ ...v, [selected]: 'cold' }))} style={{ ...pill('#38bdf8', votes[selected] === 'cold'), flex: 1, textAlign: 'center', fontSize: 14 }}>
          ❄️
        </button>
        <button style={{ ...cta(accent), flex: 3 }}>
          Ra Iru Yi (Shop This Look)
        </button>
        <button onClick={() => setShowGrid(!showGrid)} style={{ ...pill(accent, showGrid), padding: '5px 8px' }}>
          {showGrid ? '✕' : '📷'}
        </button>
      </div>
      {/* Color palette */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {['#8B4513', '#DAA520', '#2E8B57', '#B22222', '#4B0082', '#f5f5dc'].map((c, i) => (
          <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,.2)', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  )
}

function FamilyOverlay({ accent }: { accent: string }) {
  const [libation, setLibation] = React.useState(false)
  const [storyQueue] = React.useState(5)
  const [showWall, setShowWall] = React.useState(false)
  const WATCHERS = ['Mama Ade', 'Uncle Kojo', 'Aunty Nneka', 'Grandpa Obi', 'Cousin Amina']
  return (
    <div style={{ position: 'absolute', top: 60, right: 0, bottom: 80, width: 150, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 6px', overflowY: 'auto', scrollbarWidth: 'none' }}>
      {/* Who's watching */}
      <div style={{ ...glass(accent), padding: '8px 10px' }}>
        <div style={label}>Ebi Ti Nwo (Watching)</div>
        {WATCHERS.map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#f0f5ee' }}>{w.charAt(0)}</div>
            <span style={{ fontSize: 10, color: '#f0f5ee', fontWeight: 600 }}>{w}</span>
          </div>
        ))}
      </div>
      {/* Story queue */}
      <div style={{ ...glass(accent), padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>📖</span>
        <span style={{ fontSize: 10, color: '#f0f5ee', fontWeight: 700 }}>{storyQueue} Itan Ninu Ila</span>
      </div>
      {/* Actions */}
      <button onClick={() => setLibation(!libation)} style={{ ...cta(libation ? '#22c55e' : accent), width: '100%', textAlign: 'center' }}>
        {libation ? '🍶 Ase!' : '🍶 Tu Omi (Libation)'}
      </button>
      <button onClick={() => setShowWall(!showWall)} style={{ ...cta(accent), width: '100%', textAlign: 'center', opacity: 0.8 }}>
        📸 {showWall ? 'Pa Odi' : 'Aworan Iranti'}
      </button>
      {showWall && (
        <div className="vo-slide" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {['🌅', '🏠', '👨‍👩‍👧‍👦', '🎉'].map((e, i) => (
            <div key={i} style={{ ...glass(accent), height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{e}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function TransportOverlay({ accent }: { accent: string }) {
  const [progress] = React.useState(62)
  const [eta] = React.useState(47)
  const [confirmed, setConfirmed] = React.useState(false)
  const CARGO = [
    { name: 'Cocoa 20T', status: 'in-transit', emoji: '📦' },
    { name: 'Fabric Bales', status: 'loaded', emoji: '🧶' },
    { name: 'Electronics', status: 'pending', emoji: '📱' },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Route progress */}
      <div style={{ ...glass(accent), padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={label}>Ipa-Ajo (Route)</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: accent }}>{progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #22c55e)`, borderRadius: 99 }} />
          <div style={{ position: 'absolute', left: `${progress}%`, top: -4, fontSize: 12, transform: 'translateX(-50%)' }}>🚛</div>
        </div>
      </div>
      {/* ETA */}
      <div style={{ ...glass(accent), padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={label}>ETA</span>
        <span className="vo-pulse" style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>{eta} min</span>
      </div>
      {/* Cargo items */}
      <div style={{ ...glass(accent), padding: '6px 10px' }}>
        <div style={label}>Eru (Cargo)</div>
        {CARGO.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 14 }}>{c.emoji}</span>
            <span style={{ fontSize: 10, color: '#f0f5ee', fontWeight: 600, flex: 1 }}>{c.name}</span>
            <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: c.status === 'in-transit' ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)', color: c.status === 'in-transit' ? '#4ade80' : 'rgba(255,255,255,.4)', fontWeight: 700 }}>{c.status}</span>
          </div>
        ))}
      </div>
      {/* Confirm */}
      <button onClick={() => setConfirmed(true)} style={{ ...cta(confirmed ? '#22c55e' : accent), width: '100%', textAlign: 'center', opacity: confirmed ? 0.6 : 1 }}>
        {confirmed ? 'Ti Gba Nkan' : 'Jeri Gbigba (Confirm Delivery)'}
      </button>
    </div>
  )
}

function EnergyOverlay({ accent }: { accent: string }) {
  const [power] = React.useState(73)
  const [savings] = React.useState(1240)
  const [credits] = React.useState(8)
  const gridOk = power > 50
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Gauge */}
      <div style={{ ...glass(accent), padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width="60" height="60" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={accent} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 42 * power / 100} ${2 * Math.PI * 42 * (1 - power / 100)}`}
            strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray .6s' }} />
          <text x="50" y="48" textAnchor="middle" style={{ fontSize: 18, fontWeight: 900, fill: accent }}>{power}%</text>
          <text x="50" y="63" textAnchor="middle" style={{ fontSize: 9, fill: 'rgba(255,255,255,.4)' }}>Agbara</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div className="vo-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: gridOk ? '#22c55e' : '#ef4444' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: gridOk ? '#22c55e' : '#ef4444' }}>Grid {gridOk ? 'Stable' : 'Unstable'}</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>Ifowopamo (Savings)</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#4ade80', fontFamily: 'DM Mono,monospace' }}>₡{savings.toLocaleString()}</div>
        </div>
      </div>
      {/* Carbon + source */}
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ ...glass(accent), flex: 1, padding: '6px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 14 }}>☀️</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>Solar</div>
        </div>
        <div style={{ ...glass(accent), flex: 1, padding: '6px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 14 }}>🌬️</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>Wind</div>
        </div>
        <div style={{ ...glass(accent), flex: 2, padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 12 }}>🌱</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#22c55e' }}>{credits} Carbon Credits</span>
        </div>
      </div>
    </div>
  )
}

function HospitalityOverlay({ accent }: { accent: string }) {
  const [stepMode, setStepMode] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const [rating, setRating] = React.useState(0)
  const [ordered, setOrdered] = React.useState(false)
  const INGREDIENTS = ['Tomatoes', 'Scotch Bonnet', 'Palm Oil', 'Crayfish', 'Onions']
  const STEPS = ['Blend tomatoes', 'Heat palm oil', 'Fry base', 'Add protein', 'Simmer 20min']
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Recipe / Steps */}
      <div style={{ ...glass(accent), padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ ...label, fontSize: 10, color: accent }}>{stepMode ? 'Ona-Ise (Steps)' : 'Ohun-Elo (Ingredients)'}</span>
          <button onClick={() => { setStepMode(!stepMode); setStep(0) }} style={{ ...pill(accent, true), fontSize: 9 }}>{stepMode ? 'Ohun-Elo' : 'Igbese'}</button>
        </div>
        {!stepMode ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {INGREDIENTS.map((ing, i) => (
              <span key={i} style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,.06)', fontSize: 10, color: '#f0f5ee' }}>{ing}</span>
            ))}
          </div>
        ) : (
          <div>
            {STEPS.map((s, i) => (
              <div key={i} onClick={() => setStep(i)} style={{ padding: '4px 0', fontSize: 10, color: i === step ? accent : i < step ? '#22c55e' : 'rgba(255,255,255,.35)', fontWeight: i === step ? 800 : 400, cursor: 'pointer' }}>
                {i < step ? '✓ ' : i === step ? '▸ ' : `${i + 1}. `}{s}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Rating + actions */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <span key={s} onClick={() => setRating(s)} style={{ fontSize: 16, cursor: 'pointer', opacity: s <= rating ? 1 : 0.25 }}>⭐</span>
          ))}
        </div>
        <button onClick={() => setOrdered(true)} style={{ ...cta(accent), flex: 1, opacity: ordered ? 0.5 : 1 }}>
          {ordered ? 'Ti Pase!' : 'Pase (Order)'}
        </button>
        <button style={{ ...cta('#d4a017') }}>Iwe Onje</button>
      </div>
    </div>
  )
}

function GovernmentOverlay({ accent }: { accent: string }) {
  const [yay, setYay] = React.useState(54)
  const [timer, setTimer] = React.useState(300)
  const [showTranscript, setShowTranscript] = React.useState(false)
  React.useEffect(() => { const iv = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000); return () => clearInterval(iv) }, [])
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Motion banner */}
      <div style={{ ...glass(accent), padding: '8px 12px' }}>
        <div style={label}>Ero Igbimoja (Motion #47)</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f5ee', marginTop: 2 }}>
          "Allocation of Village Infrastructure Fund for Q3"
        </div>
      </div>
      {/* Vote tally */}
      <div style={{ ...glass(accent), padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80' }}>Bee-ni {yay}%</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>Bee-ko {100 - yay}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'rgba(239,68,68,.2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${yay}%`, background: 'linear-gradient(90deg,#1d4ed8,#60a5fa)', borderRadius: 99, transition: 'width .4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button onClick={() => setYay(Math.min(99, yay + 2))} style={{ ...cta('#22c55e'), flex: 1, textAlign: 'center' }}>Bee-ni</button>
          <button onClick={() => setYay(Math.max(1, yay - 2))} style={{ ...cta('#ef4444'), flex: 1, textAlign: 'center' }}>Bee-ko</button>
        </div>
      </div>
      {/* Speaker timer + constituency */}
      <div style={{ ...glass(accent), padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${accent}22`, color: accent, fontWeight: 700 }}>Adugbo: Lagos-Central</span>
        <span className="vo-pulse" style={{ fontSize: 14, fontWeight: 900, color: timer < 60 ? '#ef4444' : accent, fontFamily: 'DM Mono,monospace' }}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </span>
      </div>
      {/* Transcript toggle */}
      <button onClick={() => setShowTranscript(!showTranscript)} style={{ ...cta(accent), width: '100%', textAlign: 'center' }}>
        {showTranscript ? 'Pa Akosile' : 'Wo Akosile (Transcript)'}
      </button>
    </div>
  )
}

function SportsOverlay({ accent }: { accent: string }) {
  const [scoreA, setScoreA] = React.useState(2)
  const [scoreB, setScoreB] = React.useState(1)
  const [showStats, setShowStats] = React.useState(false)
  const [prediction, setPrediction] = React.useState<'A' | 'B' | null>(null)
  const [chants, setChants] = React.useState(847)
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Scoreboard */}
      <div style={{ ...glass(accent), padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee' }}>Eagles</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>{scoreA}</div>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 800 }}>VS</div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee' }}>Lions</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#f87171', fontFamily: 'DM Mono,monospace' }}>{scoreB}</div>
        </div>
      </div>
      {/* Predictions + chant */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setPrediction('A')} style={{ ...pill(accent, prediction === 'A'), flex: 1, textAlign: 'center' }}>Asotele: Eagles</button>
        <button onClick={() => setPrediction('B')} style={{ ...pill('#f87171', prediction === 'B'), flex: 1, textAlign: 'center' }}>Asotele: Lions</button>
        <button onClick={() => setChants(c => c + 1)} style={{ ...cta(accent), display: 'flex', alignItems: 'center', gap: 3 }}>
          <span>📣</span><span>{chants}</span>
        </button>
      </div>
      {/* Stats toggle + Highlight */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setShowStats(!showStats)} style={{ ...cta(accent), flex: 1, textAlign: 'center' }}>
          {showStats ? 'Pa Alaye' : 'Alaye (Stats)'}
        </button>
        <button style={{ ...cta('#d4a017'), flex: 1, textAlign: 'center' }}>
          Gige (Highlight)
        </button>
      </div>
      {showStats && (
        <div className="vo-slide" style={{ ...glass(accent), padding: '8px 10px' }}>
          {[['Possession', '58%', '42%'], ['Shots', '12', '7'], ['Fouls', '3', '5']].map(([s, a, b], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: i ? 3 : 0 }}>
              <span style={{ color: accent, fontWeight: 700 }}>{a}</span>
              <span style={{ color: 'rgba(255,255,255,.4)' }}>{s}</span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MediaOverlay({ accent }: { accent: string }) {
  const [pollVote, setPollVote] = React.useState<'A' | 'B' | null>(null)
  const [factOk] = React.useState(true)
  const HEADLINES = ['BREAKING: Pan-African Trade Bloc reaches 500M users', 'Cowrie hits record high against USD', 'Jollof TV surpasses 1M concurrent viewers', 'New village launched: Deep Tech Innovation Hub']
  return (
    <div style={{ position: 'absolute', bottom: 80, left: 8, right: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* News ticker */}
      <div style={{ ...glass(accent), padding: '5px 0', overflow: 'hidden' }}>
        <div className="vo-tick" style={{ display: 'flex', gap: 24, whiteSpace: 'nowrap' }}>
          {[...HEADLINES, ...HEADLINES].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee' }}>
              <span style={{ color: accent, marginRight: 6 }}>BREAKING</span>{h}
              <span style={{ margin: '0 12px', color: 'rgba(255,255,255,.15)' }}>|</span>
            </span>
          ))}
        </div>
      </div>
      {/* Credibility + Fact check */}
      <div style={{ ...glass(accent), padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,.15)', color: '#22c55e', fontWeight: 700 }}>Igbagbo: 94%</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: factOk ? '#22c55e' : '#ef4444' }}>{factOk ? '✓ Otito (Verified)' : '✗ Iro (Disputed)'}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,.3)' }}>NkisiGuard</span>
      </div>
      {/* Poll */}
      <div style={{ ...glass(accent), padding: '8px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee', marginBottom: 6 }}>Ibo: Should Africa adopt single digital currency?</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setPollVote('A')} style={{ ...cta(pollVote === 'A' ? '#22c55e' : accent), flex: 1, textAlign: 'center', opacity: pollVote === 'B' ? 0.4 : 1 }}>
            Bee-ni (Yes)
          </button>
          <button onClick={() => setPollVote('B')} style={{ ...cta(pollVote === 'B' ? '#ef4444' : accent), flex: 1, textAlign: 'center', opacity: pollVote === 'A' ? 0.4 : 1 }}>
            Bee-ko (No)
          </button>
        </div>
      </div>
    </div>
  )
}

function BuildersOverlay({ accent }: { accent: string }) {
  const [progress] = React.useState(38)
  const [showPlan, setShowPlan] = React.useState(false)
  const [comparison, setComparison] = React.useState(false)
  const MATERIALS = [
    { name: 'Cement 50kg', qty: 120, status: 'ok' },
    { name: 'Iron Rods', qty: 45, status: 'low' },
    { name: 'Sand (trips)', qty: 8, status: 'ok' },
    { name: 'Blocks', qty: 2400, status: 'ok' },
  ]
  return (
    <div style={{ position: 'absolute', top: 60, right: 0, bottom: 80, width: 165, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 6px', overflowY: 'auto', scrollbarWidth: 'none' }}>
      {/* Construction progress */}
      <div style={{ ...glass(accent), padding: '8px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={label}>Ile-Ise (Build)</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: accent }}>{progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #d4a017)`, borderRadius: 99 }} />
        </div>
      </div>
      {/* Materials */}
      <div style={{ ...glass(accent), padding: '6px 10px' }}>
        <div style={label}>Ohun-Elo (Materials)</div>
        {MATERIALS.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 10 }}>
            <span style={{ color: '#f0f5ee', flex: 1, fontWeight: 600 }}>{m.name}</span>
            <span style={{ fontWeight: 800, color: m.status === 'low' ? '#ef4444' : accent }}>{m.qty}</span>
            {m.status === 'low' && <span style={{ fontSize: 8, color: '#ef4444' }}>!</span>}
          </div>
        ))}
      </div>
      {/* Measurement */}
      <div style={{ ...glass(accent), padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>📐</span>
        <span style={{ fontSize: 10, color: '#f0f5ee', fontWeight: 700 }}>12m x 15m x 4.2m</span>
      </div>
      {/* Actions */}
      <button onClick={() => setShowPlan(!showPlan)} style={{ ...cta(accent), width: '100%', textAlign: 'center' }}>
        {showPlan ? 'Pa Apata' : '📋 Apata (Blueprint)'}
      </button>
      {showPlan && (
        <div className="vo-slide" style={{ ...glass(accent), height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
          [Floor Plan Sketch]
        </div>
      )}
      <button onClick={() => setComparison(!comparison)} style={{ ...cta(accent), width: '100%', textAlign: 'center', opacity: 0.8 }}>
        {comparison ? 'Pa Ifiwera' : 'Ifiwera (Before/After)'}
      </button>
    </div>
  )
}

function HoldingsOverlay({ accent }: { accent: string }) {
  const [showDd, setShowDd] = React.useState(false)
  const ASSETS = [
    { name: 'Lagos Tower Fund', value: 2400000, status: 'active' },
    { name: 'Accra Tech Hub', value: 850000, status: 'due-diligence' },
    { name: 'Nairobi Solar', value: 1200000, status: 'term-sheet' },
  ]
  const DD_ITEMS = ['Financials reviewed', 'Legal cleared', 'Market analysis', 'Risk assessment', 'Board approval']
  const [checked, setChecked] = React.useState<Record<number, boolean>>({})
  return (
    <div style={{ position: 'absolute', top: 60, right: 0, bottom: 80, width: 175, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 6px', overflowY: 'auto', scrollbarWidth: 'none' }}>
      {/* NDA badge */}
      <div style={{ ...glass(accent), padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11 }}>🔒</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: accent }}>NDA Active</span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', marginLeft: 'auto' }}>Tier IV</span>
      </div>
      {/* Asset cards */}
      {ASSETS.map((a, i) => (
        <div key={i} style={{ ...glass(accent), padding: '8px 10px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee' }}>{a.name}</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>₡{(a.value / 1000).toFixed(0)}K</div>
          <div style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: a.status === 'active' ? 'rgba(34,197,94,.12)' : `${accent}22`, color: a.status === 'active' ? '#22c55e' : accent, fontWeight: 700, display: 'inline-block', marginTop: 3 }}>
            {a.status.replace(/-/g, ' ').toUpperCase()}
          </div>
        </div>
      ))}
      {/* Due diligence */}
      <button onClick={() => setShowDd(!showDd)} style={{ ...cta(accent), width: '100%', textAlign: 'center' }}>
        {showDd ? 'Pa Atunyewo' : 'Atunyewo (Due Diligence)'}
      </button>
      {showDd && (
        <div className="vo-slide" style={{ ...glass(accent), padding: '8px 10px' }}>
          {DD_ITEMS.map((d, i) => (
            <div key={i} onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: i ? 4 : 0, cursor: 'pointer' }}>
              <span style={{ fontSize: 12 }}>{checked[i] ? '✅' : '⬜'}</span>
              <span style={{ fontSize: 10, color: checked[i] ? '#22c55e' : '#f0f5ee', fontWeight: 600 }}>{d}</span>
            </div>
          ))}
        </div>
      )}
      {/* Executive panel */}
      <div style={{ ...glass(accent), padding: '6px 10px', textAlign: 'center' }}>
        <div style={label}>Iye Adehun (Term Sheet)</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: accent, fontFamily: 'DM Mono,monospace' }}>₡4.45M</div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────
export function VillageStreamOverlay({ villageId, stream }: { villageId: string; stream: any }) {
  const cfg = VILLAGE_OVERLAY[villageId]

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style')
    s.id = CSS_ID
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  if (!cfg) return null

  const accent = cfg.accent

  // Village label badge (always shown)
  const badgeEl = (
    <div style={{
      position: 'absolute', top: 56, left: 8, zIndex: 5,
      ...glass(accent),
      padding: '4px 10px',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      <span style={{ fontSize: 12 }}>{cfg.icon}</span>
      <span style={{ fontSize: 10, fontWeight: 800, color: accent, fontFamily: 'Sora,sans-serif' }}>{cfg.label}</span>
    </div>
  )

  const overlayMap: Record<string, React.ReactNode> = {
    commerce:     <CommerceOverlay accent={accent} />,
    health:       <HealthOverlay accent={accent} />,
    agriculture:  <AgricultureOverlay accent={accent} />,
    education:    <EducationOverlay accent={accent} />,
    arts:         <ArtsOverlay accent={accent} />,
    technology:   <TechnologyOverlay accent={accent} />,
    finance:      <FinanceOverlay accent={accent} />,
    justice:      <JusticeOverlay accent={accent} />,
    security:     <SecurityOverlay accent={accent} />,
    spirituality: <SpiritualityOverlay accent={accent} />,
    fashion:      <FashionOverlay accent={accent} />,
    family:       <FamilyOverlay accent={accent} />,
    transport:    <TransportOverlay accent={accent} />,
    energy:       <EnergyOverlay accent={accent} />,
    hospitality:  <HospitalityOverlay accent={accent} />,
    government:   <GovernmentOverlay accent={accent} />,
    sports:       <SportsOverlay accent={accent} />,
    media:        <MediaOverlay accent={accent} />,
    builders:     <BuildersOverlay accent={accent} />,
    holdings:     <HoldingsOverlay accent={accent} />,
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>{badgeEl}</div>
      <div style={{ pointerEvents: 'auto' }}>{overlayMap[villageId] ?? null}</div>
    </div>
  )
}

export default VillageStreamOverlay
