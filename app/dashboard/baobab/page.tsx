'use client'
// ════════════════════════════════════════════════════════════════════
// BAOBAB — African Digital Civilization · App Ecosystem
// Complete redesign: immersive, premium, Africa-first
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

// ── Inject keyframes once ────────────────────────────────────────
const ANIM = `
@keyframes bbFadeUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
@keyframes bbGlow     { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes bbPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
@keyframes bbOrbit    { from{transform:rotate(0deg) translateX(28px) rotate(0deg)} to{transform:rotate(360deg) translateX(28px) rotate(-360deg)} }
@keyframes bbShimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
@keyframes bbFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes bbHeartbeat{ 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} 70%{transform:scale(1)} }
`

// ── Data ─────────────────────────────────────────────────────────
interface BaseApp { id:string; name:string; subtitle:string; href:string; isNew?:boolean; badge?:string; badgeColor?:string }
interface GridApp  extends BaseApp { emoji:string; accent:string }

const GRID_BRANCHES: { id:string; name:string; nameAf:string; icon:string; color:string; apps:GridApp[] }[] = [
  {
    id:'roots', name:'Roots', nameAf:'Gbòǹgbo', icon:'🌱', color:'#22c55e',
    apps:[
      { id:'bank',     name:'Cowrie Treasury',  subtitle:'Send · Receive · Ajo · Escrow',      emoji:'🏦', href:'/dashboard/banking',       accent:'#22c55e' },
      { id:'profile',  name:'Masquerade',       subtitle:'3 skins · Afro‑ID · Crest',          emoji:'🎭', href:'/dashboard/profile',       accent:'#d4a017' },
      { id:'settings', name:'Settings',         subtitle:'Account · Privacy · PIN',             emoji:'⚙️', href:'/dashboard/settings',      accent:'#6b7280' },
      { id:'notifs',   name:'Talking Drum',     subtitle:'Alerts · Kíla · News',               emoji:'🥁', href:'/dashboard/notifications', accent:'#e07b00' },
      { id:'connect',  name:'Three Rings',      subtitle:'Fire · Name · Stand',                emoji:'🔥', href:'/dashboard/connections',   accent:'#ef4444' },
    ],
  },
  {
    id:'trunk', name:'Trunk', nameAf:'Igi', icon:'🪵', color:'#b45309',
    apps:[
      { id:'market',   name:'Ọjà Marketplace',  subtitle:'Digital · Physical · Barter',        emoji:'🛒', href:'/dashboard/marketplace',   accent:'#e07b00' },
      { id:'sessions', name:'Trade Sessions',   subtitle:'Active trades · History',            emoji:'📋', href:'/dashboard/sessions',      accent:'#3b82f6' },
      { id:'tools',    name:'Tool Launcher',    subtitle:'202 tools · AI‑powered',            emoji:'🛠', href:'/dashboard/sessions/new',  accent:'#0891b2', isNew:true },
      { id:'cowrie',   name:'Cowrie Flow',      subtitle:'Creator earnings · Sprays',          emoji:'🐚', href:'/dashboard/cowrie-flow',   accent:'#d4a017' },
      { id:'work',     name:'Work Ledger',      subtitle:'Jobs done · Reputation · Proof',     emoji:'⚒',  href:'/dashboard',               accent:'#64748b' },
    ],
  },
  {
    id:'branches', name:'Branches', nameAf:'Ẹ̀ka', icon:'🌿', color:'#15803d',
    apps:[
      { id:'villages', name:'Village Square',   subtitle:'20 villages · Roles · Tools · AI',  emoji:'🏘', href:'/dashboard/villages',      accent:'#1a7c3e' },
      { id:'family',   name:'Family Tree',      subtitle:'Bloodline · Ancestors · Verify',     emoji:'🌳', href:'/dashboard/family-tree',   accent:'#7c3aed' },
      { id:'calendar', name:'Ìṣẹ̀lẹ̀ Calendar', subtitle:'Moon cycles · Market days',         emoji:'📅', href:'/dashboard/calendar',      accent:'#fbbf24', isNew:true },
      { id:'events',   name:'Village Events',   subtitle:'Concerts · Weddings · Ceremonies',   emoji:'🎟', href:'/dashboard/events',        accent:'#ef4444', isNew:true },
      { id:'ally',     name:'Ally Portal',      subtitle:'Circle 3 · Cultural exchange',       emoji:'🌍', href:'/dashboard/ally',          accent:'#3b82f6' },
    ],
  },
  {
    id:'canopy', name:'Canopy', nameAf:'Àwọ̀n Ewé', icon:'🍃', color:'#059669',
    apps:[
      { id:'seso',    name:'Seso Messenger',    subtitle:'Trust tiers · Spirit Voice · Trade', emoji:'💬', href:'/dashboard/chat',         accent:'#8b5cf6' },
      { id:'feed',    name:'Sòrò Sókè',         subtitle:'Drum · Nation · Motion feeds',       emoji:'📢', href:'/dashboard/feed',         accent:'#1a7c3e' },
      { id:'jollof',  name:'Jollof TV',         subtitle:'Live streams · Reels · Commerce',    emoji:'📺', href:'/dashboard/tv',           accent:'#b22222', badge:'LIVE', badgeColor:'#ef4444' },
      { id:'griot',   name:'Griot 5 AI God',    subtitle:'5 Orisha · Oracle · Wisdom',         emoji:'🦅', href:'/dashboard/ai',           accent:'#fbbf24' },
      { id:'explore', name:'Explore',           subtitle:'Discover people · Villages',         emoji:'🔍', href:'/dashboard/explore',      accent:'#0ea5e9' },
      { id:'rooms',   name:'Village Rooms',     subtitle:'Live discussion spaces',             emoji:'🏛', href:'/dashboard/rooms',        accent:'#0ea5e9' },
    ],
  },
]

const COMING_SOON = [
  { emoji:'🗳', name:'Oracle Vote',     desc:'Village governance' },
  { emoji:'📡', name:'Hawala Rails',    desc:'Instant cross-border' },
  { emoji:'🛡', name:'Nkisi Shield',   desc:'Fraud & identity guard' },
  { emoji:'🎓', name:'Sankofa',        desc:'Learn · Earn · Certify' },
  { emoji:'🏥', name:'Healing Hut',    desc:'Telehealth · First aid' },
  { emoji:'🚚', name:'Runner Net',     desc:'Delivery · Logistics' },
]

const REALMS = [
  {
    id: 'ufe',
    icon: '💛',
    name: 'UFÈ',
    subtitle: 'Love World',
    tagline: 'Ritual matching · 200 Qs · Stage machine',
    price: '$29.99/mo',
    href: '/dashboard/love/ufe',
    accent: '#c9a55c',
    bg: 'linear-gradient(135deg, rgba(201,165,92,.18) 0%, rgba(201,165,92,.06) 100%)',
    border: 'rgba(201,165,92,.25)',
  },
  {
    id: 'kerawa',
    icon: '🔥',
    name: 'KÈRÉWÀ',
    subtitle: 'Social Zone',
    tagline: 'Casual connections · Events · Escrow',
    price: '$9.99/mo',
    href: '/dashboard/love/kerawa',
    accent: '#e8627a',
    bg: 'linear-gradient(135deg, rgba(232,98,122,.18) 0%, rgba(232,98,122,.06) 100%)',
    border: 'rgba(232,98,122,.25)',
  },
  {
    id: 'ajo',
    icon: '🤝',
    name: 'ÀJỌ',
    subtitle: 'Connect',
    tagline: 'Services · Skills · Mentors · Circle',
    price: '$4.99/mo',
    href: '/dashboard/love/ajo',
    accent: '#4ade80',
    bg: 'linear-gradient(135deg, rgba(74,222,128,.15) 0%, rgba(74,222,128,.04) 100%)',
    border: 'rgba(74,222,128,.2)',
  },
]

// ── Realm Card (Heart & Soul section) ────────────────────────────
function RealmCard({ realm, delay = 0 }: { realm: typeof REALMS[0]; delay?: number }) {
  const router = useRouter()
  const [pressed, setPressed] = React.useState(false)
  return (
    <div
      onClick={() => router.push(realm.href)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        padding:'16px 18px',
        borderRadius:18,
        cursor:'pointer',
        background: pressed ? `${realm.accent}22` : realm.bg,
        border:`1px solid ${pressed ? realm.accent + '45' : realm.border}`,
        display:'flex', alignItems:'center', gap:16,
        transition:'all .15s ease',
        animation:`bbFadeUp .4s ease ${delay}s both`,
        transform: pressed ? 'scale(.98)' : 'scale(1)',
        position:'relative', overflow:'hidden',
      }}
    >
      {/* Left icon */}
      <div style={{
        width:52, height:52, borderRadius:16, flexShrink:0,
        background:`${realm.accent}15`,
        border:`1.5px solid ${realm.accent}30`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:26,
      }}>
        {realm.icon}
      </div>

      {/* Text */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:3 }}>
          <span style={{ fontSize:16, fontWeight:900, color:realm.accent, fontFamily:'Sora, sans-serif', letterSpacing:'.01em' }}>
            {realm.name}
          </span>
          <span style={{ fontSize:11, fontWeight:600, color:'rgba(240,247,240,.5)' }}>
            {realm.subtitle}
          </span>
        </div>
        <div style={{ fontSize:11, color:'rgba(240,247,240,.45)', lineHeight:1.4 }}>
          {realm.tagline}
        </div>
      </div>

      {/* Right: price + arrow */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
        <span style={{ fontSize:11, fontWeight:700, color:realm.accent, opacity:.75 }}>{realm.price}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={realm.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:.5 }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </div>
  )
}

// ── Grid App Tile ────────────────────────────────────────────────
function GridTile({ app, delay = 0 }: { app: GridApp; delay?: number }) {
  const router = useRouter()
  const [pressed, setPressed] = React.useState(false)
  return (
    <div
      onClick={() => router.push(app.href)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        padding:'14px 12px', borderRadius:18, cursor:'pointer',
        background: pressed ? `${app.accent}18` : 'rgba(255,255,255,.03)',
        border:`1px solid ${pressed ? app.accent + '35' : 'rgba(255,255,255,.06)'}`,
        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
        textAlign:'center', transition:'all .15s ease',
        animation:`bbFadeUp .4s ease ${delay}s both`,
        transform: pressed ? 'scale(.96)' : 'scale(1)',
        position:'relative', overflow:'hidden',
      }}
    >
      {/* Shimmer on press */}
      {pressed && <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg,transparent,${app.accent}15,transparent)`, animation:'bbShimmer .4s ease', pointerEvents:'none' }} />}

      {/* Icon */}
      <div style={{
        width:46, height:46, borderRadius:14,
        background:`linear-gradient(135deg,${app.accent}25,${app.accent}08)`,
        border:`1px solid ${app.accent}20`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22, flexShrink:0, position:'relative',
      }}>
        {app.emoji}
        {app.isNew && (
          <div style={{
            position:'absolute', top:-4, right:-4,
            fontSize:7, fontWeight:900, padding:'2px 5px', borderRadius:99,
            background:'#4ade80', color:'#000', letterSpacing:'.04em',
          }}>✦</div>
        )}
        {app.badge && (
          <div style={{
            position:'absolute', top:-5, right:-5,
            fontSize:7, fontWeight:900, padding:'2px 5px', borderRadius:99,
            background: app.badgeColor ?? app.accent, color:'#fff',
          }}>{app.badge}</div>
        )}
      </div>

      {/* Name */}
      <div style={{ fontSize:11, fontWeight:800, color:'rgba(240,247,240,.85)', lineHeight:1.2, wordBreak:'break-word' }}>
        {app.name}
      </div>
    </div>
  )
}

// ── Branch Section ────────────────────────────────────────────────
function BranchSection({ branch, baseDelay }: { branch: typeof GRID_BRANCHES[0]; baseDelay: number }) {
  return (
    <div style={{ marginBottom:28 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, padding:'0 2px' }}>
        <div style={{
          width:28, height:28, borderRadius:8, flexShrink:0,
          background:`${branch.color}15`, border:`1px solid ${branch.color}30`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
        }}>
          {branch.icon}
        </div>
        <div>
          <span style={{ fontSize:13, fontWeight:900, color:branch.color, fontFamily:'Sora, sans-serif', letterSpacing:'.02em' }}>
            {branch.name}
          </span>
          <span style={{ fontSize:9, color:'rgba(240,247,240,.2)', marginLeft:7, fontStyle:'italic' }}>
            {branch.nameAf}
          </span>
        </div>
        <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${branch.color}20,transparent)`, marginLeft:4 }} />
        <span style={{ fontSize:10, color:'rgba(255,255,255,.15)', fontWeight:600 }}>{branch.apps.length}</span>
      </div>

      {/* 3-column grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {branch.apps.map((app, i) => (
          <GridTile key={app.id} app={app} delay={baseDelay + i * 0.04} />
        ))}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────
export default function BaobabPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (typeof document === 'undefined') return
    const id = 'bb-anim'
    if (document.getElementById(id)) return
    const s = document.createElement('style'); s.id = id; s.textContent = ANIM
    document.head.appendChild(s)
  }, [])

  // ── Search filter ──────────────────────────────────────────────
  const filteredGridBranches = React.useMemo(() => {
    if (!search.trim()) return GRID_BRANCHES
    const q = search.toLowerCase()
    return GRID_BRANCHES.map(b => ({
      ...b,
      apps: b.apps.filter(a => a.name.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)),
    })).filter(b => b.apps.length > 0)
  }, [search])

  if (!mounted) return null

  return (
    <div style={{
      minHeight:'100dvh',
      background:'radial-gradient(ellipse at 50% 0%, #0d1f10 0%, #060c07 40%, #040805 100%)',
      color:'#f0f7f0',
      fontFamily:'Inter, system-ui, sans-serif',
      overscrollBehavior:'none',
    }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{
        position:'relative', overflow:'hidden',
        padding:'32px 20px 24px',
        background:'linear-gradient(180deg, #091608 0%, #060d08 100%)',
      }}>
        {/* Kente grid pattern */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:`
            repeating-linear-gradient(0deg,rgba(26,124,62,.05) 0px,rgba(26,124,62,.05) 1px,transparent 1px,transparent 40px),
            repeating-linear-gradient(90deg,rgba(26,124,62,.05) 0px,rgba(26,124,62,.05) 1px,transparent 1px,transparent 40px)
          `,
          pointerEvents:'none',
        }} />

        {/* Glow orbs */}
        <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,124,62,.12),transparent 70%)', pointerEvents:'none' }} />

        {/* BAOBAB SVG — simplified, premium */}
        <svg viewBox="0 0 240 140" style={{ display:'block', margin:'0 auto', width:200, height:116 }}>
          {/* Roots */}
          <path d="M108 128 Q95 138 75 140" stroke="#3d2517" strokeWidth="2.5" fill="none" opacity=".6"/>
          <path d="M118 130 Q120 140 110 142" stroke="#3d2517" strokeWidth="2" fill="none" opacity=".5"/>
          <path d="M132 128 Q145 138 165 140" stroke="#3d2517" strokeWidth="2.5" fill="none" opacity=".6"/>
          {/* Trunk */}
          <path d="M103 128 Q98 100 96 82 Q94 64 100 44 L120 8 L140 44 Q146 64 144 82 Q142 100 137 128Z" fill="url(#tg)" />
          {/* Branches */}
          <path d="M108 56 Q80 38 50 28" stroke="#5c3d2e" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M132 56 Q160 38 190 28" stroke="#5c3d2e" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M112 44 Q88 16 60 6" stroke="#5c3d2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M128 44 Q152 16 180 6" stroke="#5c3d2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M120 28 L120 4" stroke="#5c3d2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Canopy */}
          <ellipse cx="120" cy="42" rx="95" ry="46" fill="url(#cg)" opacity=".75"/>
          <ellipse cx="68"  cy="34" rx="45" ry="28" fill="url(#cg)" opacity=".55"/>
          <ellipse cx="172" cy="34" rx="45" ry="28" fill="url(#cg)" opacity=".55"/>
          {/* Animated fruits */}
          {[[42,28],[65,12],[90,6],[120,4],[150,6],[175,12],[198,28],[145,22],[95,22],[120,28],[55,45],[185,45]].map(([cx,cy],i)=>(
            <circle key={i} cx={cx} cy={cy} r={3.5}
              fill={['#fbbf24','#ef4444','#22c55e','#3b82f6','#8b5cf6','#D4AF37'][i%6]} opacity=".85">
              <animate attributeName="r" values="2.5;4;2.5" dur={`${2+i*0.25}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          <defs>
            <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7a4f2e"/>
              <stop offset="100%" stopColor="#3d2517"/>
            </linearGradient>
            <radialGradient id="cg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a7c3e" stopOpacity=".65"/>
              <stop offset="100%" stopColor="#0a3d1e" stopOpacity=".15"/>
            </radialGradient>
          </defs>
        </svg>

        <div style={{ textAlign:'center', marginTop:10, position:'relative', zIndex:1 }}>
          <h1 style={{
            fontFamily:'Sora, sans-serif', fontSize:30, fontWeight:900, letterSpacing:'.06em',
            background:'linear-gradient(135deg,#4ade80 0%,#1a7c3e 60%,#22c55e 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            lineHeight:1, margin:0,
          }}>BAOBAB</h1>
          <p style={{ fontSize:10, fontWeight:700, color:'rgba(74,222,128,.4)', letterSpacing:'.14em', textTransform:'uppercase', margin:'6px 0 0', fontFamily:'Sora, sans-serif' }}>
            THE TREE OF LIFE · EVERY BRANCH A WORLD
          </p>
        </div>
      </div>

      {/* ── SEARCH ───────────────────────────────────────────── */}
      <div style={{ padding:'12px 16px 4px', position:'sticky', top:0, zIndex:40, background:'rgba(6,12,7,.95)', backdropFilter:'blur(12px)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 14px', borderRadius:14,
          background:'rgba(255,255,255,.04)',
          border:'1px solid rgba(255,255,255,.07)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,247,240,.3)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text" placeholder="Search all apps…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:13, color:'#f0f7f0', fontWeight:500 }}
          />
          {search && <button onClick={() => setSearch('')} style={{ fontSize:11, color:'rgba(240,247,240,.3)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>✕</button>}
        </div>
      </div>

      <div style={{ padding:'16px 14px 120px' }}>

        {/* ── HEART & SOUL ──────────────────────────────────── */}
        {!search && (
          <div style={{ marginBottom:32 }}>
            {/* Section header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'0 2px' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'rgba(201,165,92,.15)', border:'1px solid rgba(201,165,92,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>💛</div>
              <div>
                <span style={{ fontSize:13, fontWeight:900, color:'#c9a55c', fontFamily:'Sora, sans-serif', letterSpacing:'.02em' }}>Heart & Soul</span>
                <span style={{ fontSize:9, color:'rgba(240,247,240,.2)', marginLeft:7, fontStyle:'italic' }}>Ọkàn àti Ẹmí</span>
              </div>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(201,165,92,.25),transparent)', marginLeft:4 }} />
            </div>

            {/* Realm cards — stacked column for premium feel */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {REALMS.map((realm, i) => (
                <RealmCard key={realm.id} realm={realm} delay={i * 0.06} />
              ))}
            </div>
          </div>
        )}

        {/* ── GRID BRANCHES ─────────────────────────────────── */}
        {filteredGridBranches.map((branch, bi) => (
          <BranchSection key={branch.id} branch={branch} baseDelay={bi * 0.06} />
        ))}

        {/* ── COMING SOON ───────────────────────────────────── */}
        {!search && (
          <div style={{ marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'0 2px' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'rgba(139,92,246,.12)', border:'1px solid rgba(139,92,246,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🫐</div>
              <span style={{ fontSize:13, fontWeight:900, color:'#8b5cf6', fontFamily:'Sora, sans-serif', letterSpacing:'.02em' }}>Fruits</span>
              <span style={{ fontSize:9, color:'rgba(240,247,240,.2)', fontStyle:'italic' }}>Èso — Coming Soon</span>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(139,92,246,.2),transparent)', marginLeft:4 }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {COMING_SOON.map((item, i) => (
                <div key={item.name} style={{
                  padding:'14px 8px', borderRadius:14, textAlign:'center',
                  background:'rgba(139,92,246,.04)', border:'1px solid rgba(139,92,246,.09)',
                  animation:`bbFadeUp .4s ease ${0.4 + i * 0.06}s both`, opacity:.65,
                }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{item.emoji}</div>
                  <div style={{ fontSize:10, fontWeight:800, color:'rgba(240,247,240,.7)', marginBottom:2, fontFamily:'Sora, sans-serif' }}>{item.name}</div>
                  <div style={{ fontSize:8, color:'rgba(240,247,240,.25)', lineHeight:1.4 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
