'use client'
// ════════════════════════════════════════════════════════════════
// EXPLORE — Discover people, villages, trending content, spotlight
// Search · Trending · People · Villages · Live · Tags · Spotlight · Hall of Fame
// ════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { sorosokeApi, jollofTvApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const CSS_ID = 'explore-css'
const CSS = `
@keyframes exFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes exPulse{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes goldGlow{0%,100%{box-shadow:0 0 8px rgba(255,215,0,.3)}50%{box-shadow:0 0 20px rgba(255,215,0,.6)}}
.ex-fade{animation:exFade .35s ease both}
.ex-pulse{animation:exPulse 2s ease-in-out infinite}
.gold-glow{animation:goldGlow 2.5s ease-in-out infinite}
`

// ── Fallback mock data (shown only when API returns nothing) ──
const MOCK_TRENDING = [
  { id: 't1', authorName: 'Kofi Mensah', villageIcon: '🧺', villageName: 'Commerce', body: 'Lagos-to-Accra trade completed — escrow closed in 4 minutes!', kilaCount: 234, stirCount: 45, heatScore: 94, villageColor: '#1a7c3e' },
  { id: 't2', authorName: 'Amara Okafor', villageIcon: '🎨', villageName: 'Arts', body: 'New voice story — 92 seconds on proverbs for business 🎙', kilaCount: 178, stirCount: 31, heatScore: 88, villageColor: '#7c3aed' },
  { id: 't3', authorName: 'Elder Ade', villageIcon: '⚕', villageName: 'Health', body: '"Àgbà kì í wà lọ́jà kí orí ọmọ títún wọ́" — An elder does not stand in the market...', kilaCount: 445, stirCount: 12, heatScore: 91, villageColor: '#0369a1' },
  { id: 't4', authorName: 'Tech Council', villageIcon: '💰', villageName: 'Finance', body: 'Sprint complete! Hackathon — 12 teams, ₵50K prize. Results inside 🏆', kilaCount: 567, stirCount: 89, heatScore: 96, villageColor: '#16a34a' },
]

const MOCK_PEOPLE = [
  { authorId: 'p1', authorName: 'Kofi Mensah', authorHandle: 'village.kofi', latestVillageId: 'commerce', latestCrestTier: 3, postCount: 24 },
  { authorId: 'p2', authorName: 'Amara Okafor', authorHandle: 'village.amara', latestVillageId: 'arts', latestCrestTier: 2, postCount: 18 },
  { authorId: 'p3', authorName: 'Elder Adewale', authorHandle: 'village.elder', latestVillageId: 'health', latestCrestTier: 5, postCount: 12 },
  { authorId: 'p4', authorName: 'Zara Mensah', authorHandle: 'village.zara', latestVillageId: 'finance', latestCrestTier: 1, postCount: 9 },
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

const CREST_LABELS: Record<number, string> = { 0: '—', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' }
const VILLAGE_EMOJI: Record<string, string> = { commerce: '🛒', technology: '💻', family: '🏡', health: '🏥', arts: '🎨', finance: '₵', education: '📚', agriculture: '🌾', builders: '🏗', media: '📰' }

type ExploreTab = 'trending' | 'people' | 'villages' | 'live' | 'tags' | 'spotlight' | 'fame'

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

  // ── Real API data ──────────────────────────────
  const [trendingPosts, setTrendingPosts] = React.useState<any[]>([])
  const [spotlightPosts, setSpotlightPosts] = React.useState<any[]>([])
  const [peopleSuggestions, setPeopleSuggestions] = React.useState<any[]>([])
  const [liveData, setLiveData] = React.useState<{ oracles: any[]; stories: any[] }>({ oracles: [], stories: [] })
  const [hallOfFame, setHallOfFame] = React.useState<any>(null)
  const [liveStreams, setLiveStreams] = React.useState<any[]>([])

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // ── Fetch real data from backend ─────────────────
  React.useEffect(() => {
    // Trending posts
    sorosokeApi.discoverTrending()
      .then((r: any) => { if (r?.data?.length) setTrendingPosts(r.data) })
      .catch((e) => logApiFailure('explore/trending', e))

    // Spotlight (FEAST posts)
    sorosokeApi.discoverSpotlight()
      .then((r: any) => { if (r?.data?.length) setSpotlightPosts(r.data) })
      .catch((e) => logApiFailure('explore/spotlight', e))

    // People suggestions
    sorosokeApi.discoverPeople()
      .then((r: any) => { if (r?.data?.length) setPeopleSuggestions(r.data) })
      .catch((e) => logApiFailure('explore/people', e))

    // Live sessions
    sorosokeApi.discoverLive()
      .then((r: any) => { if (r?.data) setLiveData(r.data) })
      .catch((e) => logApiFailure('explore/live', e))

    // Hall of Fame (current month)
    sorosokeApi.hallOfFame()
      .then((r: any) => { if (r?.data) setHallOfFame(r.data) })
      .catch((e) => logApiFailure('explore/hallOfFame', e))

    // Live Jollof TV streams
    jollofTvApi.list({ isLive: 'true' })
      .then((r: any) => { if (r?.data?.length) setLiveStreams(r.data) })
      .catch((e) => logApiFailure('explore/liveStreams', e))
  }, [])

  // ── Fetch real villages from village-registry ────
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
      .catch((e) => logApiFailure('explore/villages', e))
  }, [])

  // ── Fetch trending hashtags from soro-soke ───────
  React.useEffect(() => {
    sorosokeApi.trending()
      .then((d: any) => {
        const list = d?.data ?? d?.tags ?? (Array.isArray(d) ? d : null)
        if (!list || list.length === 0) return
        setLiveTags(list.map((t: any) => ({
          tag: t.tag?.startsWith('#') ? t.tag : `#${t.tag}`,
          posts: t.postCount ?? t.posts ?? 0,
          heat: Math.min(99, Math.round((t.postCount ?? t.posts ?? 0) / 30)),
        })))
      })
      .catch((e) => logApiFailure('explore/trendingTags', e))
  }, [])

  const toggleInvite = (id: string) => {
    setInvitedPeople(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // Use real data with mock fallbacks (only when USE_MOCKS enabled)
  const trending = trendingPosts.length > 0 ? trendingPosts : (USE_MOCKS ? MOCK_TRENDING : [])
  const people = peopleSuggestions.length > 0 ? peopleSuggestions : (USE_MOCKS ? MOCK_PEOPLE : [])
  const displayTags = liveTags.length > 0 ? liveTags : (USE_MOCKS ? TRENDING_TAGS : [])

  const TABS: { key: ExploreTab; emoji: string; label: string }[] = [
    { key: 'trending', emoji: '🔥', label: 'Trending' },
    { key: 'spotlight', emoji: '⭐', label: 'Spotlight' },
    { key: 'people', emoji: '👥', label: 'People' },
    { key: 'villages', emoji: '🏘', label: 'Villages' },
    { key: 'live', emoji: '🔴', label: 'Live Now' },
    { key: 'tags', emoji: '#', label: 'Tags' },
    { key: 'fame', emoji: '🏆', label: 'Hall of Fame' },
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
            {/* ── Africa-First Features Row ── */}
            <div style={{ padding: '8px 14px 4px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 8 }}>
                ✨ Africa-First Features
              </div>
              <div style={{ display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 4 }}>
                {[
                  { icon: '⚔️', label: 'Proverb Battle', desc: '12 languages', color: '#d4a017', href: '/dashboard/discover/proverb-battle' },
                  { icon: '🎙', label: 'Voice Burst', desc: '90s voices', color: '#7c3aed', href: '/dashboard/feed/voice-burst' },
                  { icon: '🏺', label: 'Nkisi Trust', desc: 'Fact-checking', color: '#0369a1', href: '/dashboard/discover/nkisi-trust' },
                  { icon: '🟡', label: 'Market Day', desc: 'Eke · Orie · Afo · Nkwo', color: '#d4a017', href: '/dashboard/feed' },
                  { icon: '🏆', label: 'Hall of Fame', desc: 'Best of Month', color: '#ffd700', href: undefined as undefined },
                ].map((f, i) => (
                  <div
                    key={f.label}
                    onClick={() => f.href ? router.push(f.href) : setTab('fame')}
                    className="ex-fade"
                    style={{
                      flexShrink: 0, width: 100, padding: '10px 12px', borderRadius: 14, cursor: 'pointer',
                      background: `linear-gradient(135deg, ${f.color}18, ${f.color}08)`,
                      border: `1px solid ${f.color}25`, animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 5 }}>{f.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: f.color, fontFamily: 'Sora, sans-serif', lineHeight: 1.3 }}>{f.label}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '8px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
                🔥 Heating up right now
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {trending.filter((p: any) => !search || p.body?.toLowerCase().includes(search.toLowerCase()) || p.authorName?.toLowerCase().includes(search.toLowerCase())).map((p: any, i: number) => {
                  const color = p.villageColor || '#1a7c3e'
                  return (
                    <div key={p.id} className="ex-fade" style={{
                      borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                      background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                      border: `1px solid ${color}25`,
                      position: 'relative', minHeight: i % 3 === 0 ? 200 : 160,
                      animationDelay: `${i * 0.08}s`,
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    }}>
                      <div style={{ padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 16 }}>{p.villageIcon || VILLAGE_EMOJI[p.villageId] || '🏘'}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.9)' }}>{p.authorName}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                          {p.body || p.preview}
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,.5)' }}>
                          <span>⭐ {p.kilaCount ?? p.kila}</span>
                          <span>🫧 {p.stirCount ?? p.stir}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 9, padding: '1px 6px', borderRadius: 99, background: 'rgba(255,255,255,.15)', fontWeight: 700 }}>🔥 {Math.round(p.heatScore ?? p.heat)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── SPOTLIGHT TAB ── (FEAST posts — the hottest content) */}
        {tab === 'spotlight' && (
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,215,0,.5)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
              ⭐ The Feast — Posts that reached FIRE
            </div>
            {spotlightPosts.length === 0 && trending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍲</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>The Pot is Simmering</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>No posts have reached FEAST stage yet. Keep stirring!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(spotlightPosts.length > 0 ? spotlightPosts : trending.slice(0, 4)).map((p: any, i: number) => (
                  <div key={p.id} className="ex-fade gold-glow" style={{
                    padding: '16px', borderRadius: 18, cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(255,215,0,.06), rgba(255,140,0,.03))',
                    border: '1.5px solid rgba(255,215,0,.2)',
                    animationDelay: `${i * 0.1}s`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        {p.villageIcon || VILLAGE_EMOJI[p.villageId] || '🔥'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#ffd700' }}>{p.authorName}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{p.villageName || p.villageId} · 🔥 {Math.round(p.heatScore ?? p.heat)}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 9, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,215,0,.15)', color: '#ffd700', fontWeight: 800 }}>
                        🍽 FEAST
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {p.body || p.preview}
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 10, color: 'rgba(255,215,0,.5)' }}>
                      <span>⭐ {p.kilaCount ?? p.kila} Kíla</span>
                      <span>🫧 {p.stirCount ?? p.stir} Stir</span>
                      <span>💬 {p.commentCount ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PEOPLE TAB ── */}
        {tab === 'people' && (
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
              👥 Most active voices this week
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {people.filter((p: any) =>
                !search || p.authorName?.toLowerCase().includes(search.toLowerCase()) || p.authorHandle?.toLowerCase().includes(search.toLowerCase())
              ).map((p: any, i: number) => {
                const isInvited = invitedPeople.has(p.authorId || p.id)
                const emoji = VILLAGE_EMOJI[p.latestVillageId] || '🏘'
                const crest = CREST_LABELS[p.latestCrestTier ?? 0] || '—'
                return (
                  <div key={p.authorId || p.id} className="ex-fade" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                    animationDelay: `${i * 0.06}s`,
                  }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f5ee' }}>{p.authorName || p.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 99, background: 'rgba(212,160,23,.15)', color: '#fbbf24' }}>{crest}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>@{p.authorHandle || p.handle} · {p.latestVillageId || p.village} · {p.postCount} posts</div>
                    </div>
                    <button onClick={() => toggleInvite(p.authorId || p.id)} style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      background: isInvited ? 'rgba(255,255,255,.08)' : 'rgba(26,124,62,.2)',
                      border: `1px solid ${isInvited ? 'rgba(255,255,255,.15)' : 'rgba(26,124,62,.4)'}`,
                      color: isInvited ? 'rgba(255,255,255,.5)' : '#4ade80',
                    }}>
                      {isInvited ? '🤫 Whisper Sent' : '🏘 Invite'}
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
              🔴 Live now across the village
            </div>

            {/* Real live streams from Jollof TV */}
            {liveStreams.map((s: any, i: number) => (
              <div key={s.id} className="ex-fade" onClick={() => router.push(`/dashboard/jollof/stream/${s.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16, cursor: 'pointer',
                background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)', marginBottom: 10,
                animationDelay: `${i * 0.08}s`,
              }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, position: 'relative' }}>
                  📺
                  <div className="ex-pulse" style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#ef4444', border: '2px solid #07090a' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f5ee', marginBottom: 2 }}>{s.title || 'Live Stream'}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{s.hostName || 'Host'} · {s.villageId || 'Village'}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span className="ex-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                    LIVE
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>👁 {s.viewerCount ?? s.viewers ?? 0}</div>
                </div>
              </div>
            ))}

            {/* Live Oracle Sessions */}
            {liveData.oracles.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '14px 0 8px' }}>
                  🗣 Live Oracle Sessions
                </div>
                {liveData.oracles.map((o: any, i: number) => (
                  <div key={o.id} className="ex-fade" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 16,
                    background: 'rgba(168,85,247,.04)', border: '1px solid rgba(168,85,247,.12)', marginBottom: 8,
                    animationDelay: `${i * 0.08}s`,
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(168,85,247,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔮</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>{o.topic}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>🗣 {o.speakerCount} speakers · 👁 {o.listenerCount} listeners</div>
                    </div>
                    <div className="ex-pulse" style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: 'rgba(168,85,247,.15)', color: '#c084fc', fontWeight: 700 }}>LIVE</div>
                  </div>
                ))}
              </>
            )}

            {/* Live Voice Stories */}
            {liveData.stories.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', margin: '14px 0 8px' }}>
                  🎙 Active Voice Stories
                </div>
                {liveData.stories.map((s: any, i: number) => (
                  <div key={s.id} className="ex-fade" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 14,
                    background: 'rgba(59,130,246,.04)', border: '1px solid rgba(59,130,246,.12)', marginBottom: 8,
                    animationDelay: `${i * 0.06}s`,
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.authorAvatarEmoji || '🎙'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd' }}>{s.authorName || 'Anonymous'}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{s.duration ?? 0}s · {s.villageId}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {liveStreams.length === 0 && liveData.oracles.length === 0 && liveData.stories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🌙</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>The Village is Quiet</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>No live sessions right now. Be the first to go live!</div>
              </div>
            )}

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
            {displayTags
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

        {/* ── HALL OF FAME TAB ── */}
        {tab === 'fame' && (
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,215,0,.5)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 10 }}>
              🏆 Best of the Month
            </div>

            {hallOfFame?.stats && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Posts', value: hallOfFame.stats.totalPosts, color: '#4ade80' },
                  { label: 'Total Kíla', value: hallOfFame.stats.totalKilas, color: '#fbbf24' },
                  { label: 'Top Village', value: hallOfFame.stats.topVillage || '—', color: '#c084fc' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: 'Sora, sans-serif' }}>
                      {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.15)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 8 }}>
              🍽 {hallOfFame?.month || 'This Month'} — Top Posts
            </div>

            {(hallOfFame?.posts ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📜</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>The Archives Await</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>No hall of fame entries yet. Post something worthy!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(hallOfFame?.posts ?? []).map((p: any, i: number) => (
                  <div key={p.id} className="ex-fade" style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                    borderRadius: 16,
                    background: i === 0 ? 'linear-gradient(135deg, rgba(255,215,0,.08), rgba(255,140,0,.03))' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${i === 0 ? 'rgba(255,215,0,.2)' : 'rgba(255,255,255,.06)'}`,
                    animationDelay: `${i * 0.06}s`,
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,.2)', width: 28, textAlign: 'center', flexShrink: 0, paddingTop: 2 }}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? '#ffd700' : '#f0f5ee' }}>{p.authorName}</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{p.villageName}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {p.body}
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 9, color: 'rgba(255,255,255,.4)' }}>
                        <span>⭐ {p.kilaCount}</span>
                        <span>🫧 {p.stirCount}</span>
                        <span>🔥 {Math.round(p.heatScore)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
