'use client'
// ════════════════════════════════════════════════════════════════════
// BAOBAB 🌳 — The African App Ecosystem
// "Every branch is a world. Every fruit is a tool."
// All village apps live here — Bank, Marketplace, Sessions, etc.
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

// ── CSS ──────────────────────────────────────────────────────────
const CSS_ID = 'baobab-css'
const CSS = `
@keyframes baobabFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes baobabGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(26,124,62,.3))}50%{filter:drop-shadow(0 0 20px rgba(26,124,62,.6))}}
@keyframes leafFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-6px) rotate(3deg)}}
@keyframes trunkPulse{0%,100%{opacity:.6}50%{opacity:1}}
.bb-fade{animation:baobabFade .4s ease both}
.bb-tree{animation:baobabGlow 4s ease-in-out infinite}
.bb-leaf{animation:leafFloat 3s ease-in-out infinite}
.bb-pulse{animation:trunkPulse 3s ease-in-out infinite}
`

// ── App Definitions ──────────────────────────────────────────────
interface BaobabApp {
  id: string
  name: string
  subtitle: string
  emoji: string
  href: string
  accent: string
  badge?: string
  badgeColor?: string
  isNew?: boolean
}

interface BaobabBranch {
  id: string
  name: string
  nameAf: string
  emoji: string
  color: string
  apps: BaobabApp[]
}

const BRANCHES: BaobabBranch[] = [
  {
    id: 'roots',
    name: 'Roots',
    nameAf: 'Gbòǹgbo',
    emoji: '🌱',
    color: '#1a7c3e',
    apps: [
      { id: 'bank',     name: 'Cowrie Treasury',  subtitle: 'Send · Receive · Ajo · Escrow',     emoji: '🏦', href: '/dashboard/banking',       accent: '#22c55e' },
      { id: 'profile',  name: 'Masquerade',       subtitle: '3 skins · Afro-ID · Crest',         emoji: '🎭', href: '/dashboard/profile',       accent: '#d4a017' },
      { id: 'settings', name: 'Settings',          subtitle: 'Account · Privacy · Security · PIN', emoji: '⚙️', href: '/dashboard/settings',      accent: '#6b7280' },
      { id: 'notifs',   name: 'Talking Drum',      subtitle: 'Alerts · Kíla · Village news',      emoji: '🥁', href: '/dashboard/notifications', accent: '#e07b00' },
      { id: 'connect',  name: 'Three Rings',       subtitle: 'Fire · Name · Stand',               emoji: '🔥', href: '/dashboard/connections',   accent: '#ef4444' },
    ],
  },
  {
    id: 'trunk',
    name: 'Trunk',
    nameAf: 'Igi',
    emoji: '🪵',
    color: '#8b5e3c',
    apps: [
      { id: 'market',      name: 'Ọjà Marketplace',   subtitle: 'Digital · Physical · Barter',          emoji: '🛒', href: '/dashboard/marketplace',   accent: '#e07b00' },
      { id: 'sessions',    name: 'Trade Sessions',     subtitle: 'Active trades · History · Re-run',     emoji: '📋', href: '/dashboard/sessions',      accent: '#3b82f6' },
      { id: 'tool-launch', name: 'Tool Launcher',      subtitle: '202 tools · AI-powered · Smart forms', emoji: '🛠', href: '/dashboard/sessions/new',  accent: '#0891b2', isNew: true },
      { id: 'cowrie',      name: 'Cowrie Flow',         subtitle: 'Creator earnings · Sprays · Roots',    emoji: '🐚', href: '/dashboard/cowrie-flow',   accent: '#d4a017' },
      { id: 'work',        name: 'Work Ledger',         subtitle: 'Jobs done · Reputation · Proof',       emoji: '⚒',  href: '/dashboard',              accent: '#64748b' },
    ],
  },
  {
    id: 'branches',
    name: 'Branches',
    nameAf: 'Ẹ̀ka',
    emoji: '🌿',
    color: '#15803d',
    apps: [
      { id: 'villages',  name: 'Village Square',      subtitle: '20 villages · Roles · Tools · AI',  emoji: '🏘', href: '/dashboard/villages',    accent: '#1a7c3e' },
      { id: 'family',    name: 'Family Tree',          subtitle: 'Bloodline · Ancestors · Verify',    emoji: '🌳', href: '/dashboard/family-tree',  accent: '#7c3aed' },
      { id: 'calendar',  name: 'Ìṣẹ̀lẹ̀ Calendar',     subtitle: 'Moon cycles · Market days · Griot', emoji: '📅', href: '/dashboard/calendar',     accent: '#fbbf24', isNew: true },
      { id: 'events',    name: 'Village Events',        subtitle: 'Concerts · Weddings · Ceremonies',  emoji: '🎟', href: '/dashboard/events',       accent: '#ef4444', isNew: true },
      { id: 'ally',      name: 'Ally Portal',           subtitle: 'Circle 3 · Cultural exchange',      emoji: '🌍', href: '/dashboard/ally',         accent: '#3b82f6' },
    ],
  },
  {
    id: 'canopy',
    name: 'Canopy',
    nameAf: 'Àwọ̀n Ewé',
    emoji: '🍃',
    color: '#059669',
    apps: [
      { id: 'seso',     name: 'Seso Messenger',     subtitle: 'Trust tiers · Spirit Voice · Trade', emoji: '💬', href: '/dashboard/chat',         accent: '#8b5cf6' },
      { id: 'feed',     name: 'Sòrò Sókè',           subtitle: 'Drum · Nation · Motion feeds',       emoji: '📢', href: '/dashboard/feed',         accent: '#1a7c3e' },
      { id: 'jollof',   name: 'Jollof TV',            subtitle: 'Live streams · Reels · Commerce',    emoji: '📺', href: '/dashboard/tv',           accent: '#b22222', badge: '4 LIVE', badgeColor: '#ef4444' },
      { id: 'griot',    name: 'Griot 5 AI God',       subtitle: '5 Orisha · Oracle · Wisdom',         emoji: '🦅', href: '/dashboard/ai',           accent: '#fbbf24' },
      { id: 'explore',  name: 'Explore',               subtitle: 'Discover people · Villages · Trends', emoji: '🔍', href: '/dashboard/explore',     accent: '#0ea5e9' },
      { id: 'rooms',    name: 'Village Rooms',        subtitle: 'Live discussion spaces',              emoji: '🏛', href: '/dashboard/rooms',        accent: '#0ea5e9' },
    ],
  },
]

// ── Coming Soon ──────────────────────────────────────────────────
const COMING_SOON = [
  { emoji: '🗳', name: 'Oracle Vote',       desc: 'Village governance · Referendum' },
  { emoji: '📡', name: 'Hawala Rails',       desc: 'Cross-border instant transfer' },
  { emoji: '🛡', name: 'Nkisi Shield',       desc: 'Deepfake · Fraud · Identity guard' },
  { emoji: '🎓', name: 'Sankofa Academy',    desc: 'Learn · Earn · Certify' },
  { emoji: '🏥', name: 'Healing Hut',        desc: 'Telehealth · Blood-Call · First aid' },
  { emoji: '🚚', name: 'Runner Network',     desc: 'Delivery · Logistics · Tracking' },
]

// ── Baobab SVG Tree ─────────────────────────────────────────────
function BaobabTree() {
  return (
    <svg className="bb-tree" viewBox="0 0 200 220" width="160" height="176" style={{ display: 'block', margin: '0 auto' }}>
      {/* Roots */}
      <path d="M72 195 Q60 210 40 215" stroke="#5c3d2e" strokeWidth="3" fill="none" opacity=".5" />
      <path d="M88 200 Q85 215 70 220" stroke="#5c3d2e" strokeWidth="2.5" fill="none" opacity=".4" />
      <path d="M112 200 Q115 215 130 220" stroke="#5c3d2e" strokeWidth="2.5" fill="none" opacity=".4" />
      <path d="M128 195 Q140 210 160 215" stroke="#5c3d2e" strokeWidth="3" fill="none" opacity=".5" />

      {/* Trunk */}
      <path d="M85 195 Q80 160 78 140 Q76 120 82 100 L100 60 L118 100 Q124 120 122 140 Q120 160 115 195 Z"
            fill="url(#trunkGrad)" stroke="#3d2517" strokeWidth="1" />

      {/* Major branches */}
      <path d="M90 90 Q60 70 30 55" stroke="#5c3d2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M110 90 Q140 70 170 55" stroke="#5c3d2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M95 75 Q70 40 45 20" stroke="#5c3d2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M105 75 Q130 40 155 20" stroke="#5c3d2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M100 60 Q100 30 100 10" stroke="#5c3d2e" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Canopy */}
      <ellipse cx="100" cy="48" rx="85" ry="52" fill="url(#canopyGrad)" opacity=".85" />
      <ellipse cx="55"  cy="40" rx="40" ry="30" fill="url(#canopyGrad)" opacity=".6" />
      <ellipse cx="145" cy="40" rx="40" ry="30" fill="url(#canopyGrad)" opacity=".6" />
      <ellipse cx="100" cy="22" rx="50" ry="24" fill="url(#canopyGrad)" opacity=".7" />

      {/* Fruit dots — represent apps */}
      {[[35,42],[55,18],[80,12],[100,8],[120,12],[145,18],[165,42],[130,30],[70,30],[100,35],[50,55],[150,55]].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={3.5}
          fill={['#fbbf24','#ef4444','#22c55e','#3b82f6','#8b5cf6','#e07b00'][i % 6]}
          opacity=".9">
          <animate attributeName="opacity" values=".5;1;.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}

      <defs>
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4226" />
          <stop offset="100%" stopColor="#3d2517" />
        </linearGradient>
        <radialGradient id="canopyGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a7c3e" stopOpacity=".7" />
          <stop offset="100%" stopColor="#0f4d25" stopOpacity=".3" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// ── App Card ─────────────────────────────────────────────────────
function AppCard({ app, index }: { app: BaobabApp; index: number }) {
  const router = useRouter()

  return (
    <div
      className="bb-fade"
      onClick={() => router.push(app.href)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
        background: 'rgba(255,255,255,.03)',
        border: '1px solid rgba(255,255,255,.06)',
        transition: 'all .2s',
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${app.accent}12`
        e.currentTarget.style.borderColor = `${app.accent}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,.03)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(135deg, ${app.accent}20, ${app.accent}08)`,
        border: `1px solid ${app.accent}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        {app.emoji}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
            {app.name}
          </span>
          {app.isNew && (
            <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: 'rgba(74,222,128,.15)', color: '#4ade80', letterSpacing: '.06em' }}>NEW</span>
          )}
          {app.badge && (
            <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: `${app.badgeColor ?? app.accent}20`, color: app.badgeColor ?? app.accent, letterSpacing: '.04em' }}>
              {app.badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(240,247,240,.4)', marginTop: 2, lineHeight: 1.4 }}>
          {app.subtitle}
        </div>
      </div>

      {/* Arrow */}
      <div style={{ fontSize: 14, color: 'rgba(240,247,240,.15)', flexShrink: 0 }}>›</div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
export default function BaobabPage() {
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Filter apps by search
  const filteredBranches = React.useMemo(() => {
    if (!search.trim()) return BRANCHES
    const q = search.toLowerCase()
    return BRANCHES.map(branch => ({
      ...branch,
      apps: branch.apps.filter(a =>
        a.name.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
      ),
    })).filter(b => b.apps.length > 0)
  }, [search])

  return (
    <div style={{
      minHeight: '100dvh', background: '#060d08',
      color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '28px 20px 20px',
        background: 'linear-gradient(180deg, #091608 0%, #0d1f10 60%, #060d08 100%)',
      }}>
        {/* Adinkra pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: .03,
          backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
          backgroundSize: '18px 18px', pointerEvents: 'none',
        }} />

        <BaobabTree />

        <div style={{ textAlign: 'center', marginTop: 12, position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 900,
            background: 'linear-gradient(135deg, #4ade80, #1a7c3e)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.1, marginBottom: 4,
          }}>
            BAOBAB
          </h1>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,.5)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            The Tree of Life · Every Branch, a World
          </div>
        </div>
      </div>

      {/* ── Search ────────────────────────────────────── */}
      <div style={{ padding: '0 14px 8px', position: 'sticky', top: 0, zIndex: 40, background: '#060d08' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 14,
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.08)',
        }}>
          <span style={{ fontSize: 14, opacity: .4 }}>🔍</span>
          <input
            type="text"
            placeholder="Search all apps…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 13, color: '#f0f7f0', fontWeight: 500,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', background: 'none', border: 'none', cursor: 'pointer' }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ── Branches / App Grid ───────────────────────── */}
      <div style={{ padding: '0 14px 16px' }}>
        {filteredBranches.map((branch, bi) => (
          <div key={branch.id} className="bb-fade" style={{ marginBottom: 20, animationDelay: `${bi * 0.1}s` }}>
            {/* Branch header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 4px' }}>
              <span style={{ fontSize: 16 }}>{branch.emoji}</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 900, color: branch.color, fontFamily: 'Sora, sans-serif' }}>
                  {branch.name}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(240,247,240,.25)', marginLeft: 8, fontStyle: 'italic' }}>
                  {branch.nameAf}
                </span>
              </div>
              <div style={{ flex: 1, height: 1, background: `${branch.color}20`, marginLeft: 8 }} />
            </div>

            {/* Apps list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {branch.apps.map((app, ai) => (
                <AppCard key={app.id} app={app} index={bi * 4 + ai} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Coming Soon — Fruits ──────────────────────── */}
      <div style={{ padding: '0 14px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 4px' }}>
          <span style={{ fontSize: 16 }}>🫐</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#8b5cf6', fontFamily: 'Sora, sans-serif' }}>
            Fruits
          </span>
          <span style={{ fontSize: 10, color: 'rgba(240,247,240,.25)', marginLeft: 4, fontStyle: 'italic' }}>
            Èso — Coming Soon
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(139,92,246,.15)', marginLeft: 8 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {COMING_SOON.map((item, i) => (
            <div
              key={item.name}
              className="bb-fade"
              style={{
                padding: '14px 10px', borderRadius: 14, textAlign: 'center',
                background: 'rgba(139,92,246,.04)',
                border: '1px solid rgba(139,92,246,.1)',
                animationDelay: `${0.5 + i * 0.08}s`,
                opacity: .7,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#f0f7f0', marginBottom: 2, fontFamily: 'Sora, sans-serif' }}>
                {item.name}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(240,247,240,.3)', lineHeight: 1.4 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
