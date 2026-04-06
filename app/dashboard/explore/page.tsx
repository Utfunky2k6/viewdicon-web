'use client'
// ════════════════════════════════════════════════════════════════
// EXPLORE — Discover people, villages, trending content
// Search · Trending · People · Villages · Tags
// ════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

const CSS_ID = 'explore-css'
const CSS = `
@keyframes exFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes exPulse{0%,100%{opacity:.7}50%{opacity:1}}
.ex-fade{animation:exFade .35s ease both}
.ex-pulse{animation:exPulse 2s ease-in-out infinite}
`

// ── Mock Data ──────────────────────────────────────
const TRENDING_TAGS = [
  { tag: '#TomatoPrice', posts: 1240, heat: 94 },
  { tag: '#NightMarket', posts: 890, heat: 88 },
  { tag: '#KenteWeave', posts: 672, heat: 82 },
  { tag: '#JollofWars', posts: 2100, heat: 97 },
  { tag: '#CowrieFlow', posts: 445, heat: 71 },
  { tag: '#PlantYourRoot', posts: 334, heat: 68 },
  { tag: '#VillageDrum', posts: 1567, heat: 91 },
  { tag: '#AfroTech', posts: 987, heat: 85 },
]

const TRENDING_POSTS = [
  { id: 't1', author: 'Kofi Mensah', avatar: '👨🏾‍💼', village: 'Commerce', preview: 'Lagos-to-Accra trade completed — escrow closed in 4 minutes!', kila: 234, stir: 45, heat: 94, bg: 'linear-gradient(135deg,#1a7c3e,#0f2d14)' },
  { id: 't2', author: 'Amara Okafor', avatar: '👩🏾‍🎤', village: 'Arts', preview: 'New voice story — 92 seconds on Yoruba proverbs for business 🎙', kila: 178, stir: 31, heat: 88, bg: 'linear-gradient(135deg,#7c3aed,#4c1d95)' },
  { id: 't3', author: 'Elder Ade', avatar: '👴🏾', village: 'Spirituality', preview: '"Àgbà kì í wà lọ́jà kí orí ọmọ títún wọ́" — An elder does not stand in the market...', kila: 445, stir: 12, heat: 91, bg: 'linear-gradient(135deg,#0369a1,#0c4a6e)' },
  { id: 't4', author: 'Tech Council', avatar: '💻', village: 'Technology', preview: 'Sprint complete! Hackathon — 12 teams, ₵50K prize. Results inside 🏆', kila: 567, stir: 89, heat: 96, bg: 'linear-gradient(135deg,#16a34a,#15803d)' },
  { id: 't5', author: 'Zara Mensah', avatar: '👩🏾‍🎨', village: 'Fashion', preview: 'Hand-woven Kente · 50 yards. Trust escrow accepted ₵15,000', kila: 122, stir: 18, heat: 79, bg: 'linear-gradient(135deg,#e07b00,#92400e)' },
  { id: 't6', author: 'Mama Ngozi', avatar: '🧺', village: 'Commerce', preview: 'Tomato price alert: ₡3,200/bag at Mile 12. Farm gate ₡2,400 — move fast!', kila: 312, stir: 67, heat: 92, bg: 'linear-gradient(135deg,#d4a017,#8b6914)' },
]

const SUGGESTED_PEOPLE = [
  { id: 'p1', name: 'Kofi Mensah', handle: '@kofi.akn', avatar: '👨🏾‍💼', village: 'Commerce', crest: 'III', ring: '🏘 Ìlú' },
  { id: 'p2', name: 'Amara Okafor', handle: '@amara.yor', avatar: '👩🏾‍🎤', village: 'Arts', crest: 'II', ring: '🤝 Ẹgbẹ́' },
  { id: 'p3', name: 'Elder Adewale', handle: '@elder.ade', avatar: '👴🏾', village: 'Spirituality', crest: 'V', ring: '🌍 Ìjọba' },
  { id: 'p4', name: 'Zara Mensah', handle: '@zara.ewe', avatar: '👩🏾‍🎨', village: 'Fashion', crest: 'I', ring: '🌍 Ìjọba' },
  { id: 'p5', name: 'Tunde Bakare', handle: '@tunde.tech', avatar: '👨🏾‍💻', village: 'Technology', crest: 'IV', ring: '🏘 Ìlú' },
  { id: 'p6', name: 'Adaeze Obi', handle: '@adaeze.hlth', avatar: '👩🏾‍⚕️', village: 'Health', crest: 'III', ring: '🤝 Ẹgbẹ́' },
  { id: 'p7', name: 'Kwame Asante', handle: '@kwame.agr', avatar: '👨🏾‍🌾', village: 'Agriculture', crest: 'II', ring: '🏘 Ìlú' },
  { id: 'p8', name: 'Fatima Hassan', handle: '@fatima.edu', avatar: '👩🏾‍🏫', village: 'Education', crest: 'III', ring: '🌍 Ìjọba' },
]

const LIVE_STREAMS = [
  { id: 'l1', title: 'Night Market Live — Trade Floor', host: 'Mama Ngozi', avatar: '🧺', viewers: 342, village: 'Commerce' },
  { id: 'l2', title: 'Kente Weaving Masterclass', host: 'Zara Mensah', avatar: '👩🏾‍🎨', viewers: 128, village: 'Fashion' },
  { id: 'l3', title: 'Tech Village Hackathon Day 2', host: 'Tech Council', avatar: '💻', viewers: 891, village: 'Technology' },
]

const VILLAGES_PREVIEW = [
  { id: 'commerce', name: 'Commerce', emoji: '🛒', members: '7.8k', color: '#eab308' },
  { id: 'technology', name: 'Technology', emoji: '💻', members: '6.1k', color: '#06b6d4' },
  { id: 'family', name: 'Family', emoji: '🏡', members: '8.9k', color: '#f97316' },
  { id: 'health', name: 'Health', emoji: '🏥', members: '2.8k', color: '#10b981' },
  { id: 'arts', name: 'Arts', emoji: '🎨', members: '2.9k', color: '#ec4899' },
  { id: 'finance', name: 'Finance', emoji: '₵', members: '5.7k', color: '#f59e0b' },
  { id: 'education', name: 'Education', emoji: '📚', members: '4.2k', color: '#3b82f6' },
  { id: 'agriculture', name: 'Agriculture', emoji: '🌾', members: '3.1k', color: '#84cc16' },
]

type ExploreTab = 'trending' | 'people' | 'villages' | 'live' | 'tags'

interface LiveVillage {
  id: string; name: string; emoji: string; members: string; color: string
  ancientName?: string; meaning?: string
}
interface LiveTag { tag: string; posts: number; heat: number }

export default function ExplorePage() {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [tab, setTab] = React.useState<ExploreTab>('trending')
  const [invitedPeople, setInvitedPeople] = React.useState<Set<string>>(new Set())
  const [liveVillages, setLiveVillages] = React.useState<LiveVillage[]>([])
  const [liveTags, setLiveTags] = React.useState<LiveTag[]>([])

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // ── Fetch real villages from village-registry ────────────
  React.useEffect(() => {
    fetch('/api/v1/villages?limit=20')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = d?.data ?? d?.villages ?? (Array.isArray(d) ? d : null)
        if (!list || list.length === 0) return
        setLiveVillages(list.map((v: any) => ({
          id: v.id ?? v.slug,
          name: v.name,
          emoji: v.emoji ?? v.badgeEmoji ?? '🏘',
          members: v._count?.memberships != null ? `${v._count.memberships.toLocaleString()}` : v.memberCount != null ? `${Number(v.memberCount).toLocaleString()}` : '—',
          color: v.brandColor ?? '#1a7c3e',
          ancientName: v.ancientName ?? undefined,
          meaning: v.meaning ?? undefined,
        })))
      })
      .catch(() => {})
  }, [])

  // ── Fetch trending hashtags from soro-soke ───────────────
  React.useEffect(() => {
    let token: string | null = null
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('afk-auth') : null
      token = stored ? JSON.parse(stored)?.state?.accessToken ?? null : null
    } catch {}
    if (!token) return
    fetch('/api/posts/hashtags/trending', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = d?.data ?? d?.tags ?? (Array.isArray(d) ? d : null)
        if (!list || list.length === 0) return
        setLiveTags(list.map((t: any) => ({
          tag: t.tag ?? `#${t.name}`,
          posts: t.postCount ?? t.posts ?? 0,
          heat: Math.min(99, Math.round((t.postCount ?? t.posts ?? 0) / 30)),
        })))
      })
      .catch(() => {})
  }, [])

  const toggleInvite = (id: string) => {
    setInvitedPeople(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const TABS: { key: ExploreTab; emoji: string; label: string }[] = [
    { key: 'trending', emoji: '🔥', label: 'Trending' },
    { key: 'people', emoji: '👥', label: 'People' },
    { key: 'villages', emoji: '🏘', label: 'Villages' },
    { key: 'live', emoji: '🔴', label: 'Live Now' },
    { key: 'tags', emoji: '#', label: 'Tags' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#07090a', color: '#f0f5ee', fontFamily: 'DM Sans, sans-serif', position: 'relative' }}>
      {/* ── Adinkra Gye Nyame overlay ── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.022, backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }} />
      {/* ── Pan-African Kente top stripe ── */}
      <div aria-hidden="true" style={{ height: 3, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)', flexShrink: 0, position: 'relative', zIndex: 1 }} />

      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 3, zIndex: 40, background: '#0c1009' }}>
        <div style={{ padding: '14px 16px 8px' }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg,#4ade80,#d4a017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Explore
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: -1, fontStyle: 'italic' }}>
            Discover voices across the village
          </div>
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 14px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ fontSize: 14, opacity: .4 }}>🔍</span>
            <input
              type="text" placeholder="Search people, villages, tags..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#f0f5ee', fontWeight: 500 }}
            />
            {search && <button onClick={() => setSearch('')} style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', overflowX: 'auto', padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 2 }}>
          {TABS.map(t => (
            <div key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              color: tab === t.key ? '#4ade80' : 'rgba(255,255,255,.3)',
              borderBottom: `2px solid ${tab === t.key ? '#1a7c3e' : 'transparent'}`,
              transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 12 }}>{t.emoji}</span>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '8px 0 100px' }}>

        {/* ── TRENDING TAB ── */}
        {tab === 'trending' && (
          <div>
            {/* Trending grid — staggered cards */}
            <div style={{ padding: '8px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
                🔥 Heating up right now
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {TRENDING_POSTS.map((p, i) => (
                  <div key={p.id} className="ex-fade" style={{
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    background: p.bg, position: 'relative', minHeight: i % 3 === 0 ? 200 : 160,
                    animationDelay: `${i * 0.08}s`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  }}>
                    <div style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>{p.avatar}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.9)' }}>{p.author}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {p.preview}
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,.5)' }}>
                        <span>⭐ {p.kila}</span>
                        <span>🫧 {p.stir}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 9, padding: '1px 6px', borderRadius: 99, background: 'rgba(255,255,255,.15)', fontWeight: 700 }}>🔥 {p.heat}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PEOPLE TAB ── */}
        {tab === 'people' && (
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
              👥 Village kinsmen near you
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTED_PEOPLE.filter(p =>
                !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.handle.toLowerCase().includes(search.toLowerCase())
              ).map((p, i) => {
                const isInvited = invitedPeople.has(p.id)
                return (
                  <div key={p.id} className="ex-fade" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                    animationDelay: `${i * 0.06}s`,
                  }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {p.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f5ee' }}>{p.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 99, background: 'rgba(212,160,23,.15)', color: '#fbbf24' }}>{p.crest}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{p.handle} · {p.village} · {p.ring}</div>
                    </div>
                    <button onClick={() => toggleInvite(p.id)} style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      background: isInvited ? 'rgba(255,255,255,.08)' : 'rgba(26,124,62,.2)',
                      border: `1px solid ${isInvited ? 'rgba(255,255,255,.15)' : 'rgba(26,124,62,.4)'}`,
                      color: isInvited ? 'rgba(255,255,255,.5)' : '#4ade80',
                    }}>
                      {isInvited ? '🤫 Whisper Sent' : '🏘 Invite to Village'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── VILLAGES TAB ── */}
        {tab === 'villages' && (
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
              🏘 Discover villages
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(liveVillages.length > 0 ? liveVillages : VILLAGES_PREVIEW).filter((v: LiveVillage) =>
                !search || v.name.toLowerCase().includes(search.toLowerCase()) || (v.ancientName ?? '').toLowerCase().includes(search.toLowerCase())
              ).map((v: LiveVillage, i: number) => (
                <div key={v.id} className="ex-fade" onClick={() => router.push(`/dashboard/villages/${v.id}`)} style={{
                  padding: '16px 14px', borderRadius: 16, cursor: 'pointer',
                  background: `linear-gradient(135deg, ${v.color}15, ${v.color}05)`,
                  border: `1px solid ${v.color}25`,
                  animationDelay: `${i * 0.06}s`,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{v.emoji}</div>
                  {v.ancientName && <div style={{ fontSize: 8, fontWeight: 900, color: `${v.color}99`, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>{v.ancientName}</div>}
                  <div style={{ fontSize: 13, fontWeight: 800, color: v.color, fontFamily: 'Sora, sans-serif' }}>{v.name}</div>
                  {v.meaning && <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 1, fontStyle: 'italic' }}>{v.meaning}</div>}
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{v.members} members</div>
                  <button onClick={e => { e.stopPropagation(); router.push(`/dashboard/villages/${v.id}`) }} style={{
                    marginTop: 8, padding: '5px 12px', borderRadius: 99, fontSize: 9, fontWeight: 700,
                    background: `${v.color}15`, border: `1px solid ${v.color}30`, color: v.color, cursor: 'pointer',
                  }}>
                    Visit Village →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIVE TAB ── */}
        {tab === 'live' && (
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
              🔴 Streaming now
            </div>
            {LIVE_STREAMS.map((s, i) => (
              <div key={s.id} className="ex-fade" onClick={() => router.push('/dashboard/jollof')} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16, cursor: 'pointer',
                background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)', marginBottom: 10,
                animationDelay: `${i * 0.08}s`,
              }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, position: 'relative' }}>
                  {s.avatar}
                  <div className="ex-pulse" style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#ef4444', border: '2px solid #07090a' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f5ee', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{s.host} · {s.village}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span className="ex-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                    LIVE
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>👁 {s.viewers}</div>
                </div>
              </div>
            ))}

            {/* Go Live CTA */}
            <div style={{ padding: '20px', textAlign: 'center', borderRadius: 16, border: '1px dashed rgba(239,68,68,.2)', background: 'rgba(239,68,68,.03)', marginTop: 8 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔥</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f87171', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Light Your Fire</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Go live to your village — share your craft, trade, teach</div>
              <button onClick={() => router.push('/dashboard/jollof')} style={{
                padding: '10px 24px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(239,68,68,.15)', border: '1.5px solid rgba(239,68,68,.3)', color: '#f87171',
              }}>
                🔴 Go Live Now
              </button>
            </div>
          </div>
        )}

        {/* ── TAGS TAB ── */}
        {tab === 'tags' && (
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
              # Trending tags
            </div>
            {(liveTags.length > 0 ? liveTags : TRENDING_TAGS)
              .filter(t => !search || t.tag.toLowerCase().includes(search.toLowerCase()))
              .sort((a, b) => b.heat - a.heat)
              .map((t, i) => (
              <div key={t.tag} className="ex-fade" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderRadius: 14, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                marginBottom: 8, cursor: 'pointer', animationDelay: `${i * 0.05}s`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', width: 20, textAlign: 'center' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>{t.tag}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{t.posts.toLocaleString()} posts</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 40, height: 6, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${t.heat}%`, background: t.heat >= 90 ? 'linear-gradient(to right,#ff4500,#ffd700)' : t.heat >= 70 ? 'linear-gradient(to right,#e07b00,#ff4500)' : 'linear-gradient(to right,#8b4513,#e07b00)', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: t.heat >= 90 ? '#ffd700' : t.heat >= 70 ? '#ff4500' : '#e07b00' }}>🔥 {t.heat}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
