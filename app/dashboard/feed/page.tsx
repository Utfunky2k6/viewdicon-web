'use client'
// ═══════════════════════════════════════════════════════════════════
// SÒRÒ SÓKÈ — The Voice of the Village
// 4-Drum Architecture: SORO SOKE · ORIKI · AWORÀN · ÌDÍLÉ CIRCLE
// 3 Skins · Dual Toggle · 9 Sub-Tabs · 3 Sort Modes · Live API
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import StoriesRow from '@/components/feed/StoriesRow'
import { sorosokeApi } from '@/lib/api'
import { MotionFeed } from '@/components/feed/MotionFeed'
import type { Post as CanonicalPost } from '@/components/feed/feedTypes'
import { mapBackendPost } from '@/components/feed/feedTypes'
import { MOCK_POSTS, MOCK_MOTION_POSTS, MOCK_GALLERY_POSTS, MOCK_DISCOVER_POSTS } from '@/components/feed/mockPosts'
import { FeedPostCard, VillageSquare, GriotCard, SKINS, toDisplay } from '@/components/feed/FeedPostCard'
import type { Skin, ViewMode } from '@/components/feed/FeedPostCard'
import { CreateSheet } from '@/components/feed/CreateSheet'

/* ── inject-once CSS ── */
const INJECT_ID = 'soro-styles'
const STYLES = `
@keyframes ssFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes adinkra{0%,100%{opacity:.025}50%{opacity:.04}}
@keyframes nmBreathe{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.1)}50%{box-shadow:0 0 20px 3px rgba(212,160,23,.08)}}
@keyframes wvBar{0%,100%{scaleY:.4}50%{scaleY:1}}
@keyframes shellFly{0%{opacity:1;transform:translateY(0) rotate(0deg) scale(1)}70%{opacity:.9;transform:translateY(-280px) rotate(180deg) scale(1.3)}100%{opacity:0;transform:translateY(-420px) rotate(360deg) scale(.3)}}
@keyframes cfIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes iOrb{0%,100%{box-shadow:0 0 0 0 rgba(255,215,0,.2)}50%{box-shadow:0 0 14px 3px rgba(255,215,0,.12)}}
@keyframes drumToggle{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
.ss-fade{animation:ssFade .35s ease both}
.nm-banner{animation:nmBreathe 3s ease-in-out infinite}
.shell-fly{position:absolute;font-size:22px;animation:shellFly 2s ease-out forwards;pointer-events:none}
.wv-bar{border-radius:2px;transition:height .1s;flex:1;max-width:4px}
.cf-in{animation:cfIn .25s ease}
.drum-anim{animation:drumToggle .2s ease both}
`

/* ── page-local types ── */
type DrumMode   = 'soro_soke' | 'circle'
type GeoScope   = 'village' | 'state' | 'country' | 'continent' | 'global'
type SoroTab    = 'village' | 'discover' | 'motion'
type CircleTab  = 'family' | 'elders' | 'ceremonies'
type SubTab     = SoroTab | CircleTab
type SortMode   = 'hot' | 'fresh' | 'ready'

/* ── geo scope config — the 5-level geographic lens from the blueprint ── */
const GEO_TABS: { key: GeoScope; label: string }[] = [
  { key:'village',   label:'🏘 My Village' },
  { key:'state',     label:'🏙 My State'   },
  { key:'country',   label:'🌍 Nigeria'    },
  { key:'continent', label:'🌐 Africa'     },
  { key:'global',    label:'⭐ Global'     },
]
/* which geoMin values are visible at each geo scope */
const GEO_ALLOW: Record<GeoScope, string[]> = {
  village:   ['village'],
  state:     ['village','state'],
  country:   ['village','state','country'],
  continent: ['village','state','country','continent'],
  global:    ['village','state','country','continent','global'],
}

/* ── drum channel + sub-tab config ── */
const SORO_TABS: { key: SoroTab; label: string }[] = [
  { key:'village',  label:'🏘 Village'  },
  { key:'discover', label:'🌍 Discover' },
  { key:'motion',   label:'📺 Motion'   },
]
const CIRCLE_TABS: { key: CircleTab; label: string }[] = [
  { key:'family',     label:'🌳 Family'     },
  { key:'elders',     label:'👑 Elders'     },
  { key:'ceremonies', label:'🪘 Ceremonies' },
]

/* ════════════════════════════════════════
   MAIN PAGE — 4-DRUM ARCHITECTURE
════════════════════════════════════════ */
export default function SoroFeedPage() {
  const [skin,     setSkin]     = React.useState<Skin>('ise')
  const [geo,      setGeo]      = React.useState<GeoScope>('village')
  const [drumMode, setDrumMode] = React.useState<DrumMode>('soro_soke')
  const [subTab,   setSubTab]   = React.useState<SubTab>('village')
  const [sort,     setSort]     = React.useState<SortMode>('hot')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [feedLive, setFeedLive] = React.useState(false)
  const [livePosts, setLivePosts] = React.useState<CanonicalPost[]>(MOCK_POSTS)

  /* ── CSS inject ── */
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(INJECT_ID)) return
    const s = document.createElement('style'); s.id = INJECT_ID; s.textContent = STYLES
    document.head.appendChild(s)
  }, [])

  /* ── Fetch live posts from soro-soke-feed ── */
  React.useEffect(() => {
    let villageId: string | null = null
    try {
      const vs = typeof window !== 'undefined' ? localStorage.getItem('afk-village') : null
      villageId = vs ? JSON.parse(vs)?.state?.activeVillageId ?? null : null
    } catch {}

    const sortParam = sort === 'fresh' ? 'fresh' : 'hot'
    sorosokeApi.villageFeed(skin, villageId, undefined, sortParam)
      .then(r => {
        const rows = (r as { data?: unknown[] })?.data
        if (!Array.isArray(rows) || rows.length === 0) return
        const mapped = rows.map(p => mapBackendPost(p as Record<string, unknown>))
        const liveIds = new Set(mapped.map(p => p.id))
        setLivePosts([...mapped, ...MOCK_POSTS.filter(p => !liveIds.has(p.id))])
        setFeedLive(true)
      })
      .catch(() => {})
  }, [skin, sort, geo])

  /* ── Filter + sort — geo-scoped; gallery/voice/spotlight render inline by post type ── */
  const filteredPosts = React.useMemo(() => {
    // DISCOVER: cross-village, all skins, all geos — react-only layer
    if (subTab === 'discover') {
      const liveIds = new Set(livePosts.map(p => p.id))
      const extras = MOCK_DISCOVER_POSTS.filter(p => !liveIds.has(p.id))
      return [...livePosts, ...extras].sort((a, b) => b.heatScore - a.heatScore)
    }

    let ps = livePosts.filter(p => p.skinContext === skin)

    // Always inject gallery mocks (IMAGE_JOURNAL) into the main feed pool
    const existingIds = new Set(ps.map(p => p.id))
    const galleryMocks = MOCK_GALLERY_POSTS.filter(p => !existingIds.has(p.id))
    ps = [...ps, ...galleryMocks]

    // Apply geographic scope filter — posts must match the active geo lens
    const allowedGeos = GEO_ALLOW[geo]
    ps = ps.filter(p => allowedGeos.includes(String((p as unknown as Record<string, unknown>).geoMin ?? 'village')))

    if (drumMode === 'circle') {
      if (subTab === 'family')     ps = ps.filter(p => p.skinContext === 'idile' || p.drum === 'idile_circle')
      if (subTab === 'elders')     ps = ps.filter(p => p.crestTier >= 4)
      if (subTab === 'ceremonies') ps = ps.filter(p => p.type === 'VILLAGE_NOTICE' || p.type === 'EVENT_DRUM')
    } else {
      if (subTab === 'village') ps = ps.filter(p => p.drumScope === 1)
    }

    if (sort === 'hot' || sort === 'ready') ps = [...ps].sort((a, b) => b.heatScore - a.heatScore)
    if (sort === 'ready') ps = ps.filter(p => p.stage === 'FEAST' || p.stage === 'BOIL')

    return ps
  }, [livePosts, skin, geo, drumMode, subTab, sort])

  /* derive display posts — viewMode is determined by post type, not tab */
  const displayPostsWithMode = React.useMemo(() => filteredPosts.map(p => {
    const d = toDisplay(p)
    let vm: ViewMode = 'default'
    if (subTab === 'discover')                              vm = 'discover'
    else if (d.type === 'gallery' || d.type === 'market')  vm = 'gallery'
    else if (d.type === 'voice')                           vm = 'voice'
    else if (d.heat >= 78)                                 vm = 'spotlight'
    return { post: d, viewMode: vm }
  }), [filteredPosts, subTab])

  const hour = new Date().getHours()
  const isNightMarket = hour >= 18
  const skinCfg = SKINS[skin]

  const switchDrumMode = (mode: DrumMode) => {
    setDrumMode(mode)
    setSubTab(mode === 'soro_soke' ? 'village' : 'family')
  }

  const currentTabs = drumMode === 'circle' ? CIRCLE_TABS : SORO_TABS

  return (
    <div style={{ minHeight:'100dvh',background:'#07090a',color:'#f0f5ee',fontFamily:'DM Sans,sans-serif',display:'flex',flexDirection:'column' }}>

      {/* Adinkra bg */}
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:0,opacity:.025,backgroundImage:'repeating-linear-gradient(45deg,#d4a017 0px,#d4a017 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px' }} />

      {/* ── Sticky Header ── */}
      <div style={{ position:'sticky',top:0,zIndex:40,background:'#0c1009',flexShrink:0 }}>

        {/* top row */}
        <div style={{ padding:'10px 16px 6px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:900,background:'linear-gradient(135deg,#4ade80,#d4a017)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Sòrò Sókè</div>
            {feedLive && <span style={{ fontSize:9,padding:'2px 6px',background:'rgba(74,222,128,.12)',border:'1px solid rgba(74,222,128,.25)',borderRadius:20,color:'#4ade80',fontWeight:700 }}>● LIVE</span>}
            <div style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginTop:-2,fontStyle:'italic' }}>The Voice of the Village</div>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <div onClick={() => setCreateOpen(true)} style={{ padding:'5px 10px',borderRadius:20,background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',display:'flex',alignItems:'center',gap:4,cursor:'pointer' }}>
              <span style={{ fontSize:10 }}>🔴</span>
              <span style={{ fontSize:10,fontWeight:700,color:'#f87171' }}>LIVE</span>
            </div>
            {['✏','🔔','🔍'].map((ico, i) => (
              <div key={i} onClick={i === 0 ? () => setCreateOpen(true) : undefined} style={{ width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,cursor:'pointer' }}>{ico}</div>
            ))}
          </div>
        </div>

        {/* skin bar */}
        <div style={{ padding:'6px 16px',display:'flex',alignItems:'center',gap:7 }}>
          <span style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.07em' }}>Skin:</span>
          <div style={{ display:'flex',gap:5 }}>
            {(['ise','egbe','idile'] as Skin[]).map(s => (
              <div key={s} onClick={() => setSkin(s)} style={{ padding:'4px 11px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:`1px solid ${skin===s ? SKINS[s].border : 'transparent'}`,background:skin===s ? SKINS[s].bg : 'rgba(255,255,255,.05)',color:skin===s ? SKINS[s].light : 'rgba(255,255,255,.4)',transition:'all .22s' }}>{SKINS[s].label}</div>
            ))}
          </div>
        </div>

        {/* ── Geo Bar — 5-level geographic scope lens ── */}
        <div style={{ display:'flex',overflowX:'auto',padding:'4px 14px 6px',gap:5,borderBottom:'1px solid rgba(255,255,255,.06)',scrollbarWidth:'none' }}>
          {GEO_TABS.map(({ key, label }) => (
            <div key={key} onClick={() => setGeo(key)} style={{
              flexShrink:0,padding:'5px 13px',borderRadius:99,fontSize:9,fontWeight:700,
              cursor:'pointer',whiteSpace:'nowrap',transition:'all .2s',
              background: geo===key ? 'rgba(212,160,23,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${geo===key ? 'rgba(212,160,23,.4)' : 'rgba(255,255,255,.07)'}`,
              color: geo===key ? '#fbbf24' : 'rgba(255,255,255,.3)',
            }}>{label}</div>
          ))}
        </div>

        {/* ── Dual drum toggle ── */}
        <div style={{ padding:'8px 16px 6px',display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ flex:1,display:'flex',background:'rgba(255,255,255,.05)',borderRadius:99,padding:3,border:'1px solid rgba(255,255,255,.08)',position:'relative',overflow:'hidden' }}>
            {/* Sliding pill */}
            <div style={{
              position:'absolute', top:3, bottom:3,
              left: drumMode === 'soro_soke' ? 3 : 'calc(50% + 1px)',
              width: 'calc(50% - 4px)',
              borderRadius: 99,
              background: drumMode === 'soro_soke' ? '#1a7c3e' : '#7c3aed',
              boxShadow: drumMode === 'soro_soke' ? '0 2px 12px rgba(26,124,62,.5)' : '0 2px 12px rgba(124,58,237,.5)',
              transition: 'left .25s cubic-bezier(.4,0,.2,1), background .25s ease, box-shadow .25s ease',
              pointerEvents: 'none',
            }} />
            <div onClick={() => switchDrumMode('soro_soke')} style={{ flex:1,padding:'7px 12px',borderRadius:99,textAlign:'center',fontSize:11,fontWeight:800,cursor:'pointer',position:'relative',zIndex:1,color:drumMode==='soro_soke' ? '#fff' : 'rgba(255,255,255,.4)',transition:'color .25s ease' }}>
              🥁 SORO SOKE
            </div>
            <div onClick={() => switchDrumMode('circle')} style={{ flex:1,padding:'7px 12px',borderRadius:99,textAlign:'center',fontSize:11,fontWeight:800,cursor:'pointer',position:'relative',zIndex:1,color:drumMode==='circle' ? '#fff' : 'rgba(255,255,255,.4)',transition:'color .25s ease' }}>
              🌳 CIRCLE
            </div>
          </div>
        </div>

        {/* ── Sub-tabs ── */}
        <div style={{ display:'flex',overflowX:'auto',padding:'0 14px 2px',borderBottom:'1px solid rgba(255,255,255,.06)',scrollbarWidth:'none' }}>
          {currentTabs.map(({ key, label }) => (
            <div key={key} onClick={() => setSubTab(key)} style={{ padding:'7px 12px',fontSize:10,fontWeight:700,color:subTab===key ? (drumMode==='circle' ? '#c084fc' : '#4ade80') : 'rgba(255,255,255,.3)',cursor:'pointer',whiteSpace:'nowrap',borderBottom:`2px solid ${subTab===key ? (drumMode==='circle' ? '#7c3aed' : '#1a7c3e') : 'transparent'}`,transition:'all .2s' }}>{label}</div>
          ))}
        </div>

        {/* ── Sort pills (only in non-motion tabs) ── */}
        {subTab !== 'motion' && (
          <div style={{ display:'flex',gap:6,padding:'6px 16px 6px',overflowX:'auto',scrollbarWidth:'none' }}>
            {([['hot','🔥 Hottest Pots'],['fresh','⚡ Fresh Pots'],['ready','🍽 Ready Dishes']] as [SortMode,string][]).map(([k, l]) => (
              <div key={k} onClick={() => setSort(k)} style={{ flexShrink:0,padding:'4px 12px',borderRadius:99,fontSize:9,fontWeight:700,cursor:'pointer',border:`1px solid ${sort===k ? 'rgba(212,160,23,.4)' : 'rgba(255,255,255,.08)'}`,background:sort===k ? 'rgba(212,160,23,.15)' : 'rgba(255,255,255,.04)',color:sort===k ? '#fbbf24' : 'rgba(255,255,255,.3)',transition:'all .2s' }}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {/* ── Stories Row ── */}
      {subTab !== 'motion' && <StoriesRow />}

      {/* ── Motion feed ── */}
      {subTab === 'motion' && (
        <div style={{ flex:1 }}>
          <MotionFeed posts={MOCK_MOTION_POSTS} onInteract={(type, id) => {
            const actions: Record<string, ((id: string) => Promise<unknown>) | undefined> = {
              kila:   (id) => sorosokeApi.kila(id),
              stir:   (id) => sorosokeApi.stir(id),
              drum:   (id) => sorosokeApi.drum(id, { content: '' }),
              ubuntu: (id) => sorosokeApi.ubuntu(id),
              spray:  (id) => sorosokeApi.spray(id, { amount: 0 }),
            }
            actions[type]?.(id)?.catch(() => {})
          }} />
        </div>
      )}

      {/* ── Main feed ── */}
      {subTab !== 'motion' && (
        <div style={{ flex:1,overflowY:'auto',position:'relative',zIndex:5 }}>
          {/* Night market banner */}
          {isNightMarket && drumMode === 'soro_soke' && (
            <div className="nm-banner" style={{ margin:'8px 12px',background:'linear-gradient(135deg,#2a1a00,#1a1000)',border:'1px solid rgba(212,160,23,.3)',borderRadius:14,padding:'11px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
              <span style={{ fontSize:26,flexShrink:0 }}>🏮</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:800,color:'#fbbf24' }}>Night Market Open</div>
                <div style={{ fontSize:10,color:'rgba(212,160,23,.6)',marginTop:2 }}>Commerce posts get +15 heat · Until midnight</div>
              </div>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:18,fontWeight:900,color:'#fbbf24',flexShrink:0 }}>{23 - new Date().getHours()}h left</div>
            </div>
          )}

          {/* Context widgets by sub-tab */}
          {subTab === 'village' && <VillageSquare />}
          {subTab === 'elders' && <GriotCard />}

          {/* Discover header banner */}
          {subTab === 'discover' && (
            <div style={{ margin:'8px 12px',background:'linear-gradient(135deg,rgba(26,124,62,.08),rgba(74,222,128,.04))',border:'1px solid rgba(74,222,128,.15)',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ fontSize:26,flexShrink:0 }}>🌍</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:800,color:'#4ade80' }}>Discover · Connecting 20 Villages</div>
                <div style={{ fontSize:10,color:'rgba(74,222,128,.55)',marginTop:2 }}>You are browsing cross-village content · React with Ubuntu, Spray or Share · You cannot post here</div>
              </div>
              <div style={{ fontSize:9,fontWeight:700,color:'rgba(74,222,128,.4)',border:'1px solid rgba(74,222,128,.15)',borderRadius:6,padding:'2px 7px',flexShrink:0 }}>React Only</div>
            </div>
          )}

          {/* Section label */}
          <div style={{ padding:'6px 16px',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:'.09em',display:'flex',alignItems:'center',gap:8 }}>
            <span>{subTab === 'discover' ? `${displayPostsWithMode.length} posts · 🌍 ALL VILLAGES` : `${displayPostsWithMode.length} posts · ${skinCfg.label.toUpperCase()} · ${GEO_TABS.find(g => g.key === geo)?.label ?? geo} · ${sort.toUpperCase()}`}</span>
            <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }} />
            <span style={{ fontSize:8,color:'rgba(212,160,23,.5)' }}>{subTab === 'discover' ? 'Ubuntu ↑' : 'Jollof Score ↑'}</span>
          </div>

          {/* Empty state */}
          {displayPostsWithMode.length === 0 && (
            <div style={{ padding:'32px 24px',textAlign:'center' }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🥁</div>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'rgba(255,255,255,.6)',marginBottom:6 }}>No posts here yet</div>
              <div style={{ fontSize:12,color:'rgba(255,255,255,.3)' }}>Switch skin, try a different tab, or drum the first post!</div>
            </div>
          )}

          {/* Posts — pass per-card viewMode */}
          {displayPostsWithMode.map(({ post, viewMode }) => (
            <FeedPostCard key={post.id} post={post} viewMode={viewMode} />
          ))}

          <div style={{ height:100 }} />
        </div>
      )}

      {/* FAB — hidden in Discover (react-only layer) */}
      {subTab !== 'discover' && (
        <button onClick={() => setCreateOpen(true)} style={{ position:'fixed',bottom:90,right:18,zIndex:100,width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#1a7c3e,#0f5028)',border:'none',cursor:'pointer',fontSize:24,boxShadow:'0 4px 20px rgba(26,124,62,.5)',display:'flex',alignItems:'center',justifyContent:'center' }}>✏</button>
      )}

      {/* Create Sheet */}
      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} currentSkin={skin} />
    </div>
  )
}
