'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

const EGBE_TABS = ['Profile', 'Posts', 'Connections', 'Kinsmen'] as const
type EgbeTab = typeof EGBE_TABS[number]

type PostType = 'PERSONAL' | 'VILLAGE' | 'ORACLE'

interface EgbePost {
  id: string
  type: PostType
  text: string
  time: string
  heat: string
  stir: number
  kila: number
  hasImage?: boolean
  // VILLAGE specific
  villageId?: string
  villageName?: string
  villageEmoji?: string
  toolKey?: string
  toolName?: string
  // ORACLE specific
  agreePct?: number
  disagreePct?: number
  heatStage?: string
  stirCount?: number
}

// Posts (initially empty -- fetched from soro-soke-feed backend)
const INITIAL_EGBE_POSTS: EgbePost[] = []

const POST_TYPE_TABS: { key: PostType; label: string; color: string; emoji: string }[] = [
  { key: 'PERSONAL', label: 'Personal',   color: '#1a7c3e', emoji: '💬' },
  { key: 'VILLAGE',  label: 'Village',    color: '#2563eb', emoji: '🏘' },
  { key: 'ORACLE',   label: 'Issues',     color: '#dc2626', emoji: '🗣' },
]

// Connections (initially empty -- fetched from backend)
const INITIAL_CONNECTIONS: { handle: string; name: string; village: string; bg: string; border: string; initial: string }[] = []

const CSS = `
@keyframes pulse-bar{0%,100%{opacity:.7}50%{opacity:1}}
.agree-bar{animation:pulse-bar 2s ease-in-out infinite}
`

export function EgbeProfile() {
  const [tab, setTab] = React.useState<EgbeTab>('Profile')
  const [editOpen, setEditOpen] = React.useState(false)

  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('egbe-css')) {
      const s = document.createElement('style'); s.id = 'egbe-css'; s.textContent = CSS; document.head.appendChild(s)
    }
  }, [])

  return (
    <>
      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {EGBE_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '9px 4px', fontSize: 10, fontWeight: 700,
              textAlign: 'center', cursor: 'pointer',
              color: tab === t ? '#d97706' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid #d97706' : '2px solid transparent',
              background: 'transparent', transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profile' && <EgbeProfileTab />}
      {tab === 'Posts' && <EgbePostsTab />}
      {tab === 'Connections' && <EgbeConnectionsTab />}
      {tab === 'Kinsmen' && <KinsmenTab />}

      {/* Edit button */}
      <div style={{ padding: '8px 12px 16px' }}>
        <button onClick={() => setEditOpen(true)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #d97706', background: 'rgba(217,119,6,.08)', color: '#fbbf24', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          ✏️ Edit EGBE Profile
        </button>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  )
}

function EgbeProfileTab() {
  return (
    <>
      {/* What others see */}
      <div style={{ margin: '8px 12px', background: '#1a0f00', border: '1px solid #d97706', borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, marginBottom: 6 }}>👁 What Others See in EGBE Mode</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>Your social handle, personality, posts, and connections. Your work history, village role, and clan matters are completely hidden. This is your public creative face.</div>
      </div>

      {/* 3 post type explainer */}
      <div style={{ padding: '8px 12px 0' }}>
        {POST_TYPE_TABS.map(pt => (
          <div key={pt.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, marginBottom: 6, background: `${pt.color}0a`, border: `1px solid ${pt.color}22` }}>
            <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 99, background: pt.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: pt.color }}>{pt.emoji} {pt.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {pt.key === 'PERSONAL' && 'Your personal voice. No village context. Just you.'}
                {pt.key === 'VILLAGE'  && 'Village-tagged posts. Carries your guild + tool chip.'}
                {pt.key === 'ORACLE'   && 'Issue/debate posts. Live agree vs disagree pulse bar.'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connections strip */}
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your Connections</div>
      <div style={{ display: 'flex', gap: 10, padding: '4px 12px', overflowX: 'auto' }}>
        {INITIAL_CONNECTIONS.map((c) => (
          <div key={c.handle} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', background: c.bg }}>{c.initial}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>{c.handle}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 16 }} />
    </>
  )
}

// ── Posts tab with 3-type filter ──────────────────────────────────────────
function EgbePostsTab() {
  const [activeType, setActiveType] = React.useState<PostType | 'ALL'>('ALL')
  const [stirs, setStirs]   = React.useState<Record<string, number>>(Object.fromEntries(INITIAL_EGBE_POSTS.map(p => [p.id, p.stir])))
  const [kila, setKila]     = React.useState<Set<string>>(new Set())
  const [drummed, setDrummed] = React.useState<Set<string>>(new Set())
  const [agree, setAgree]   = React.useState<Record<string, boolean>>({})
  const [disagree, setDisagree] = React.useState<Record<string, boolean>>({})

  const filtered = activeType === 'ALL' ? INITIAL_EGBE_POSTS : INITIAL_EGBE_POSTS.filter(p => p.type === activeType)

  return (
    <>
      {/* Post-type filter tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px 8px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveType('ALL')}
          style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${activeType === 'ALL' ? '#d97706' : 'rgba(255,255,255,.12)'}`, background: activeType === 'ALL' ? 'rgba(217,119,6,.15)' : 'transparent', color: activeType === 'ALL' ? '#fbbf24' : 'rgba(255,255,255,.4)' }}
        >All</button>
        {POST_TYPE_TABS.map(pt => (
          <button key={pt.key}
            onClick={() => setActiveType(pt.key)}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${activeType === pt.key ? pt.color : 'rgba(255,255,255,.1)'}`, background: activeType === pt.key ? `${pt.color}18` : 'transparent', color: activeType === pt.key ? pt.color : 'rgba(255,255,255,.4)' }}
          >
            <span>{pt.emoji}</span>
            <span>{pt.label}</span>
          </button>
        ))}
      </div>

      {/* Post cards */}
      {filtered.map(post => {
        const typeMeta = POST_TYPE_TABS.find(t => t.key === post.type)!
        const isKila = kila.has(post.id)
        const isDrummed = drummed.has(post.id)
        const isAgree = agree[post.id]
        const isDisagree = disagree[post.id]

        return (
          <div key={post.id} style={{ background: 'var(--bg-card)', margin: '0 12px 10px', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Type accent bar */}
            <div style={{ height: 3, background: typeMeta.color }} />

            <div style={{ padding: 12 }}>
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#d97706,#92400e)', flexShrink: 0 }}>🎭</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>@LionHeart247</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: typeMeta.color }}>{typeMeta.emoji} {typeMeta.label}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>· {post.time}</span>
                  </div>
                </div>
                {post.heat === 'Simmering' && <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', padding: '2px 7px', borderRadius: 99, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)' }}>🔥 {post.heat}</span>}
              </div>

              {/* Village chip — VILLAGE posts */}
              {post.type === 'VILLAGE' && post.villageName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.25)', borderRadius: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13 }}>{post.villageEmoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa' }}>{post.villageName}</span>
                  {post.toolName && (
                    <>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)' }}>·</span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#93c5fd', padding: '1px 6px', borderRadius: 99, background: 'rgba(37,99,235,.15)', border: '1px solid rgba(37,99,235,.2)' }}>⚒ {post.toolName}</span>
                    </>
                  )}
                </div>
              )}

              {/* Image placeholder */}
              {post.hasImage && (
                <div style={{ height: 100, background: 'linear-gradient(135deg,#1a0f00,#d97706)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 8 }}>🌅</div>
              )}

              {/* Post text */}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{post.text}</div>

              {/* Oracle live pulse bar */}
              {post.type === 'ORACLE' && post.agreePct !== undefined && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80' }}>✅ Agree {post.agreePct}%</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>🗣 {post.stirCount?.toLocaleString()} voices</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>{post.disagreePct}% Disagree ❌</span>
                  </div>
                  <div style={{ height: 10, background: 'rgba(239,68,68,.3)', borderRadius: 99, overflow: 'hidden' }}>
                    <div className="agree-bar" style={{ height: '100%', background: 'linear-gradient(90deg, #4ade80, #1a7c3e)', width: `${post.agreePct}%`, borderRadius: 99 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => { setAgree(a => ({ ...a, [post.id]: !a[post.id] })); setDisagree(d => ({ ...d, [post.id]: false })) }}
                      style={{ flex: 1, padding: '7px 0', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${isAgree ? '#4ade80' : 'rgba(74,222,128,.3)'}`, background: isAgree ? 'rgba(74,222,128,.12)' : 'rgba(74,222,128,.04)', color: '#4ade80', transition: 'all .2s' }}>
                      ✅ {isAgree ? 'Agreed' : 'Agree'}
                    </button>
                    <button onClick={() => { setDisagree(d => ({ ...d, [post.id]: !d[post.id] })); setAgree(a => ({ ...a, [post.id]: false })) }}
                      style={{ flex: 1, padding: '7px 0', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${isDisagree ? '#ef4444' : 'rgba(239,68,68,.3)'}`, background: isDisagree ? 'rgba(239,68,68,.12)' : 'rgba(239,68,68,.04)', color: '#ef4444', transition: 'all .2s' }}>
                      ❌ {isDisagree ? 'Disagreed' : 'Disagree'}
                    </button>
                  </div>
                </div>
              )}

              {/* Interaction bar */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => setStirs(s => ({ ...s, [post.id]: s[post.id] + 1 }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#1a0f00', border: '1px solid #92400e', color: '#fbbf24', cursor: 'pointer' }}>🔥 {stirs[post.id]}</button>
                {post.type !== 'ORACLE' && (
                  <button onClick={() => setKila(k => { const n = new Set(k); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n })}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: isKila ? '#0d2a18' : '#0a1f0f', border: `1px solid ${isKila ? '#4ade80' : '#1a7c3e'}`, color: '#4ade80', cursor: 'pointer' }}>⭐ {isKila ? 'Kíla!' : 'Kíla'}</button>
                )}
                <button onClick={() => setDrummed(d => { const n = new Set(d); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n })}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: isDrummed ? '#2d1700' : '#1a0f00', border: `1px solid ${isDrummed ? '#fbbf24' : '#d97706'}`, color: '#d97706', marginLeft: 'auto', cursor: 'pointer' }}>🥁 {isDrummed ? 'Drummed!' : 'Drum'}</button>
              </div>
            </div>
          </div>
        )
      })}
      <div style={{ height: 16 }} />
    </>
  )
}

function EgbeConnectionsTab() {
  const router = useRouter()
  const [whispered, setWhispered] = React.useState<Set<string>>(new Set())
  return (
    <>
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your Social Connections</div>
      {INITIAL_CONNECTIONS.map((c) => (
        <div key={c.handle} onClick={() => router.push('/dashboard/chat')}
          style={{ background: 'var(--bg-card)', margin: '8px 12px', borderRadius: 12, border: '1px solid var(--border)', padding: 12, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', background: c.bg, flexShrink: 0 }}>{c.initial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.handle}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.name} · {c.village}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setWhispered(w => { const n = new Set(w); n.has(c.handle) ? n.delete(c.handle) : n.add(c.handle); return n }) }}
            style={{ fontSize: 10, color: whispered.has(c.handle) ? '#4ade80' : '#d97706', fontWeight: 700, padding: '4px 10px', background: whispered.has(c.handle) ? 'rgba(74,222,128,.08)' : '#1a0f00', border: `1px solid ${whispered.has(c.handle) ? '#4ade8066' : '#92400e'}`, borderRadius: 99, cursor: 'pointer', transition: 'all .25s', flexShrink: 0 }}>
            {whispered.has(c.handle) ? '✓ Sent' : 'Sitting by Fire'}
          </button>
        </div>
      ))}
      <div style={{ height: 16 }} />
    </>
  )
}

// ── Kinsmen Tab — Rings of Belonging ──────────────────────────────────────

const RINGS_META = [
  { level: 1, key: 'IDILE', yoruba: 'Ìdílé', sub: 'The Hearth', emoji: '🔥', color: '#D97706', desc: 'Family that shares your fire' },
  { level: 2, key: 'EGBE',  yoruba: 'Ẹgbẹ́',  sub: 'The Age-Set', emoji: '🤝', color: '#7C3AED', desc: 'Peers who began the journey together' },
  { level: 3, key: 'ILU',   yoruba: 'Ìlú',   sub: 'The Village', emoji: '🏘', color: '#1a7c3e', desc: 'The town that knows your name' },
  { level: 4, key: 'IJOBA', yoruba: 'Ìjọba', sub: 'The Nation',  emoji: '🌍', color: '#6b7280', desc: 'People who share the land' },
]

// Kinsmen (initially empty -- fetched from backend)
const INITIAL_KINSMEN: { handle: string; name: string; avatar: string; village: string; crest: string; ring: number; ringKey: string; since: string }[] = []

const RING_COUNTS = { ring1: 0, ring2: 0, ring3: 0, ring4: 0 }

function KinsmenTab() {
  const [activeRing, setActiveRing] = React.useState<number | null>(null)
  const [expandedKin, setExpandedKin] = React.useState<string | null>(null)

  const filtered = activeRing ? INITIAL_KINSMEN.filter(k => k.ring === activeRing) : INITIAL_KINSMEN

  return (
    <>
      {/* Ring counts header */}
      <div style={{ padding: '10px 12px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Rings of Belonging</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {RINGS_META.map(r => {
            const count = [RING_COUNTS.ring1, RING_COUNTS.ring2, RING_COUNTS.ring3, RING_COUNTS.ring4][r.level - 1]
            const isActive = activeRing === r.level
            return (
              <button key={r.key} onClick={() => setActiveRing(isActive ? null : r.level)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                  background: isActive ? `${r.color}18` : 'rgba(255,255,255,.03)',
                  border: `1.5px solid ${isActive ? r.color : 'rgba(255,255,255,.06)'}`,
                  transition: 'all .2s',
                }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{count >= 1000 ? `${(count/1000).toFixed(1)}K` : count}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: r.color, opacity: .7, marginTop: 1 }}>{r.emoji} {r.yoruba}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>{r.sub}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Ring explainer (shows on filter) */}
      {activeRing && (() => {
        const meta = RINGS_META[activeRing - 1]
        return (
          <div style={{ margin: '8px 12px', padding: 10, borderRadius: 10, background: `${meta.color}08`, border: `1px solid ${meta.color}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 14 }}>{meta.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: meta.color }}>{meta.yoruba} — {meta.sub}</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>{meta.desc}</div>
          </div>
        )
      })()}

      {/* Kinsmen list */}
      <div style={{ padding: '8px 0' }}>
        {filtered.map(k => {
          const ringMeta = RINGS_META[k.ring - 1]
          return (
            <div key={k.handle} onClick={() => setExpandedKin(expandedKin === k.handle ? null : k.handle)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `2px solid ${ringMeta.color}44` }}>{k.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{k.name}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 99, background: 'rgba(212,160,23,.15)', color: '#fbbf24' }}>{k.crest}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{k.handle} · {k.village}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: `${ringMeta.color}12`, border: `1px solid ${ringMeta.color}33`, flexShrink: 0 }}>
                <span style={{ fontSize: 10 }}>{ringMeta.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: ringMeta.color }}>{ringMeta.yoruba}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Philosophy footer */}
      <div style={{ margin: '8px 12px 16px', padding: 10, borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', lineHeight: 1.6, fontStyle: 'italic' }}>
          "We do not pray to have more money but to have more kinsmen." — Achebe
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', marginTop: 4 }}>
          Kinsmen are not equal — they have roles, obligations, and proximity that change over time based on what you do together. You earn your way into inner rings through action.
        </div>
      </div>
    </>
  )
}

// ── Edit Profile Modal ────────────────────────────────────────────────────

function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [displayName, setDisplayName] = React.useState('Lion of the Market')
  const [handle, setHandle] = React.useState('LionHeart247')
  const [bio, setBio] = React.useState('Commerce Village elder in training. Trade runs in my blood.')
  const [toast, setToast] = React.useState('')

  if (!open) return null

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1 }} />
      <div onClick={e => e.stopPropagation()} style={{ background:'#111', borderRadius:'24px 24px 0 0', padding:'0 16px 40px', maxHeight:'85dvh', overflow:'auto' }}>
        <div style={{ width:40, height:4, borderRadius:99, background:'rgba(255,255,255,.2)', margin:'12px auto 16px' }} />
        <p style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:16 }}>✏️ Edit Social Profile</p>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#d97706,#92400e)', border:'3px solid #fbbf24', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, position:'relative', cursor:'pointer' }}>
            🎭
            <div style={{ position:'absolute', bottom:-2, right:-2, width:26, height:26, borderRadius:'50%', background:'#d97706', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, border:'2px solid #111' }}>📷</div>
          </div>
        </div>
        <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Social Name</p>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,.05)', border:'1.5px solid rgba(255,255,255,.1)', borderRadius:10, fontSize:14, color:'#fff', outline:'none', boxSizing:'border-box', marginBottom:12 }} />
        <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Handle</p>
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:12 }}>
          <span style={{ padding:'10px 8px 10px 12px', background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.1)', borderRight:'none', borderRadius:'10px 0 0 10px', fontSize:14, color:'rgba(255,255,255,.4)' }}>@</span>
          <input value={handle} onChange={e => setHandle(e.target.value)} style={{ flex:1, padding:'10px 12px', background:'rgba(255,255,255,.05)', border:'1.5px solid rgba(255,255,255,.1)', borderLeft:'none', borderRadius:'0 10px 10px 0', fontSize:14, color:'#fff', outline:'none', boxSizing:'border-box' }} />
        </div>
        <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Bio</p>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={150} style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,.05)', border:'1.5px solid rgba(255,255,255,.1)', borderRadius:10, fontSize:13, color:'#fff', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:4 }} />
        <p style={{ fontSize:9, color:'rgba(255,255,255,.25)', textAlign:'right', marginBottom:14 }}>{bio.length}/150</p>
        <button onClick={() => { setToast('✅ Profile updated!'); setTimeout(() => { setToast(''); onClose() }, 1200) }} style={{ width:'100%', padding:14, borderRadius:14, border:'none', background:'linear-gradient(135deg,#d97706,#92400e)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Save Changes
        </button>
        {toast && <p style={{ textAlign:'center', fontSize:12, color:'#4ade80', marginTop:8, fontWeight:600 }}>{toast}</p>}
      </div>
    </div>
  )
}
