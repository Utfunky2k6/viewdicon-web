'use client'
// ═══════════════════════════════════════════════════════════════════
// JOLLOF TV — Creator Subscription Channels
// Patreon-level creator control for African content
// Tabs: Subscriptions | Browse | My Channel
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS } from '@/lib/flags'
import UnderConstruction from '@/components/ui/UnderConstruction'

/* ── inject-once CSS ── */
const CSS_ID = 'jollof-channels-css'
const CSS = `
@keyframes chFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes chPulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes chShine{0%{left:-100%}100%{left:200%}}
@keyframes chGrow{from{width:0}to{width:var(--target)}}
@keyframes chSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes tierGlow{0%,100%{box-shadow:0 0 8px rgba(212,160,23,.15)}50%{box-shadow:0 0 18px rgba(212,160,23,.35)}}
@keyframes badgePop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
.ch-fade{animation:chFade .35s ease both}
.ch-slide{animation:chSlide .3s ease both}
.ch-pulse{animation:chPulse 1.6s ease-in-out infinite}
.tier-glow{animation:tierGlow 2.4s ease-in-out infinite}
.badge-pop{animation:badgePop .4s ease both}
.ch-bar{animation:chGrow .8s ease both}
`

function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */
type Tab = 'subscriptions' | 'browse' | 'my_channel'
type ContentType = 'Video' | 'Audio' | 'Text' | 'Gallery' | 'Live' | 'File'
type TierKey = 'follower' | 'planter' | 'ancestral'
type BrowseCategory = 'All' | 'Film' | 'Music' | 'Education' | 'Tech' | 'News' | 'Comedy' | 'Cooking' | 'Spiritual' | 'Sports' | 'Fashion'

interface CreatorChannel {
  id: string
  name: string
  handle: string
  village: string
  villageBadge: string
  category: BrowseCategory
  subscribers: number
  monthlyPrice: number
  yearlyPrice: number
  thumbnails: string[]
  description: string
  exclusivePosts: number
  liveStreams: number
  earlyAccess: number
  tier: TierKey
  avatar: string
  verified: boolean
}

interface ExclusiveContent {
  id: string
  title: string
  type: ContentType
  tier: TierKey
  views: number
  earnings: number
  date: string
}

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA — 12 African Creator Channels
═══════════════════════════════════════════════════════════════════ */
const MOCK_CHANNELS: CreatorChannel[] = [
  { id:'ch1', name:'Mama Adaeze', handle:'@mama_adaeze', village:'Commerce', villageBadge:'🧺', category:'Fashion', subscribers:14200, monthlyPrice:500, yearlyPrice:4800, thumbnails:['Ankara Masterclass','Lagos Runway BTS','Fabric Sourcing Trip'], description:'West Africa\'s #1 fashion creator. Ankara design tutorials, live fabric auctions, and behind-the-scenes from Lagos Fashion Week.', exclusivePosts:87, liveStreams:24, earlyAccess:12, tier:'planter', avatar:'MA', verified:true },
  { id:'ch2', name:'Dr. Ngozi Eze', handle:'@dr_ngozi', village:'Health', villageBadge:'⚕', category:'Education', subscribers:28400, monthlyPrice:800, yearlyPrice:7200, thumbnails:['Malaria Prevention','Traditional Remedies','Community Health'], description:'Public health physician. Breaking down African health topics in Yoruba, Igbo, and Hausa. 5-language auto-translation.', exclusivePosts:134, liveStreams:52, earlyAccess:28, tier:'ancestral', avatar:'NE', verified:true },
  { id:'ch3', name:'Kofi the Kente Master', handle:'@kente_kofi', village:'Arts', villageBadge:'🎨', category:'Film', subscribers:9800, monthlyPrice:600, yearlyPrice:5400, thumbnails:['Weaving Process','Custom Orders','History of Kente'], description:'3rd-generation Kente weaver from Bonwire, Ghana. Live weaving sessions, commission open, cultural deep dives.', exclusivePosts:65, liveStreams:38, earlyAccess:8, tier:'planter', avatar:'KK', verified:true },
  { id:'ch4', name:'Prof. Amara Osei', handle:'@prof_amara', village:'Education', villageBadge:'🎓', category:'Education', subscribers:42100, monthlyPrice:400, yearlyPrice:3600, thumbnails:['Yoruba Math System','Ancient Geometry','Pan-African Science'], description:'Professor of African Mathematics at University of Ghana. Making ancestral knowledge accessible to the digital generation.', exclusivePosts:210, liveStreams:16, earlyAccess:45, tier:'ancestral', avatar:'AO', verified:true },
  { id:'ch5', name:'DJ Spinall Lagos', handle:'@spinall_jollof', village:'Arts', villageBadge:'🎨', category:'Music', subscribers:67000, monthlyPrice:300, yearlyPrice:2400, thumbnails:['Afrobeats Mix','Studio Session','Festival Recap'], description:'Afrobeats DJ and producer. Exclusive mixes, production breakdowns, and backstage passes to major African festivals.', exclusivePosts:48, liveStreams:62, earlyAccess:15, tier:'planter', avatar:'DS', verified:true },
  { id:'ch6', name:'Ama Serwaa Kitchen', handle:'@ama_kitchen', village:'Hospitality', villageBadge:'🍽', category:'Cooking', subscribers:31500, monthlyPrice:350, yearlyPrice:3000, thumbnails:['Jollof Wars','Palm Wine Recipes','Street Food Tour'], description:'Ghanaian chef redefining Pan-African cuisine. Recipe exclusives, live cook-alongs, and the eternal Jollof debate.', exclusivePosts:156, liveStreams:44, earlyAccess:22, tier:'ancestral', avatar:'AS', verified:true },
  { id:'ch7', name:'Kwame Tech', handle:'@kwame_tech', village:'Technology', villageBadge:'💻', category:'Tech', subscribers:19700, monthlyPrice:700, yearlyPrice:6600, thumbnails:['Build in Africa','Startup Teardown','Blockchain 101'], description:'Software engineer building Africa\'s tech future. Tutorials on blockchain, AI, and mobile-first development for the continent.', exclusivePosts:92, liveStreams:30, earlyAccess:18, tier:'planter', avatar:'KT', verified:true },
  { id:'ch8', name:'Elder Makamba Wisdom', handle:'@elder_makamba', village:'Spirituality', villageBadge:'🕯', category:'Spiritual', subscribers:8300, monthlyPrice:500, yearlyPrice:4800, thumbnails:['Morning Divination','Ancestral Stories','Sacred Rituals'], description:'Pan-African elder and wisdom keeper. Daily ancestral readings, spiritual practices from all 54 nations, and ancient wisdom for the modern African.', exclusivePosts:245, liveStreams:90, earlyAccess:0, tier:'ancestral', avatar:'EM', verified:true },
  { id:'ch9', name:'Naija Comedy Central', handle:'@naija_laughs', village:'Arts', villageBadge:'🎨', category:'Comedy', subscribers:53200, monthlyPrice:250, yearlyPrice:2000, thumbnails:['Skit Marathon','Improv Night','Fan Challenge'], description:'Nigeria\'s biggest comedy collective. Daily skits, improv live shows, and community comedy challenges with Cowrie prizes.', exclusivePosts:320, liveStreams:78, earlyAccess:35, tier:'planter', avatar:'NC', verified:false },
  { id:'ch10', name:'Amandla Sports', handle:'@amandla_sports', village:'Sports', villageBadge:'⚽', category:'Sports', subscribers:22800, monthlyPrice:450, yearlyPrice:4200, thumbnails:['AFCON Analysis','Youth Academy','Training Drills'], description:'Pan-African sports analysis, youth academy spotlights, and training programs. Covering football, basketball, and athletics.', exclusivePosts:178, liveStreams:56, earlyAccess:40, tier:'planter', avatar:'AM', verified:true },
  { id:'ch11', name:'Wanjiku Reports', handle:'@wanjiku_news', village:'Media', villageBadge:'📰', category:'News', subscribers:37600, monthlyPrice:350, yearlyPrice:3000, thumbnails:['Breaking Africa','Investigative Docs','Citizen Reports'], description:'Independent African journalism. Investigative documentaries, citizen reporting, and news analysis free from external influence.', exclusivePosts:89, liveStreams:12, earlyAccess:6, tier:'planter', avatar:'WR', verified:true },
  { id:'ch12', name:'Nollywood Insider', handle:'@nolly_insider', village:'Arts', villageBadge:'🎨', category:'Film', subscribers:45300, monthlyPrice:600, yearlyPrice:5400, thumbnails:['Set Visits','Actor Interviews','Script Workshop'], description:'Behind-the-scenes of Nollywood. Exclusive set visits, actor interviews, script writing workshops, and early movie screenings.', exclusivePosts:167, liveStreams:34, earlyAccess:52, tier:'ancestral', avatar:'NI', verified:true },
]

const MY_SUBSCRIPTIONS = ['ch1','ch2','ch4','ch6','ch10']

const MOCK_EXCLUSIVE_CONTENT: ExclusiveContent[] = [
  { id:'ex1', title:'Behind the Lens: Aso-Oke Documentary', type:'Video', tier:'ancestral', views:4200, earnings:126000, date:'2026-04-05' },
  { id:'ex2', title:'Unreleased Afrobeats Mix Vol. 7', type:'Audio', tier:'planter', views:8900, earnings:44500, date:'2026-04-03' },
  { id:'ex3', title:'The Economics of Cowrie Shells — Research Paper', type:'Text', tier:'planter', views:2300, earnings:11500, date:'2026-04-01' },
  { id:'ex4', title:'Kente Weaving Process — Full Gallery', type:'Gallery', tier:'follower', views:12400, earnings:0, date:'2026-03-28' },
  { id:'ex5', title:'Private Q&A: African Spirituality', type:'Live', tier:'ancestral', views:1800, earnings:90000, date:'2026-03-25' },
  { id:'ex6', title:'Business Plan Template — African Startup', type:'File', tier:'planter', views:3400, earnings:17000, date:'2026-03-20' },
  { id:'ex7', title:'Live Cooking Masterclass: 10 Regional Jollof', type:'Live', tier:'ancestral', views:6200, earnings:186000, date:'2026-04-06' },
  { id:'ex8', title:'Youth Football Scouting Report Q1', type:'File', tier:'planter', views:1900, earnings:9500, date:'2026-03-15' },
]

const TIER_META: Record<TierKey, { label:string; color:string; icon:string; price:string; features:string[] }> = {
  follower: { label:'Follower', color:'#6b7280', icon:'👁', price:'Free', features:['Public content','Ad-supported viewing','Community comments','Basic feed access'] },
  planter:  { label:'Planter', color:'#22c55e', icon:'🌱', price:'₡500/mo', features:['Ad-free experience','Early access (48hr)','Exclusive behind-the-scenes','Planter badge on profile','Priority live chat'] },
  ancestral:{ label:'Ancestral', color:'#d4a017', icon:'👑', price:'₡2,000/mo', features:['Everything in Planter','Private live streams','Direct chat with creator','Production credits','Custom content requests','Ancestral badge + gold border'] },
}

const BROWSE_CATEGORIES: BrowseCategory[] = ['All','Film','Music','Education','Tech','News','Comedy','Cooking','Spiritual','Sports','Fashion']

const CONTENT_TYPE_META: Record<ContentType, { icon:string; color:string }> = {
  Video:   { icon:'🎬', color:'#ef4444' },
  Audio:   { icon:'🎵', color:'#8b5cf6' },
  Text:    { icon:'📝', color:'#3b82f6' },
  Gallery: { icon:'🖼', color:'#f59e0b' },
  Live:    { icon:'📡', color:'#22c55e' },
  File:    { icon:'📁', color:'#6366f1' },
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
═══════════════════════════════════════════════════════════════════ */
const BG = '#0d0804'
const CARD_BG = 'rgba(255,255,255,.04)'
const CARD_BORDER = 'rgba(255,255,255,.08)'
const TEXT = '#f0f7f0'
const TEXT_DIM = 'rgba(255,255,255,.5)'
const GOLD = '#d4a017'
const GREEN = '#22c55e'
const HEADING: React.CSSProperties = { fontFamily:'Sora, sans-serif', fontWeight:700, color:TEXT, margin:0 }

/* ═══════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
═══════════════════════════════════════════════════════════════════ */
function Avatar({ initials, size=40, color=GOLD }: { initials:string; size?:number; color?:string }) {
  return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:`linear-gradient(135deg,${color},${color}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.35,fontWeight:700,color:'#0d0804',flexShrink:0,border:`2px solid ${color}44` }}>
      {initials}
    </div>
  )
}

function Badge({ text, color, icon }: { text:string; color:string; icon?:string }) {
  return (
    <span className="badge-pop" style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:10,background:`${color}22`,color,fontSize:10,fontWeight:600,border:`1px solid ${color}44` }}>
      {icon && <span>{icon}</span>}{text}
    </span>
  )
}

function BarChart({ items, maxVal }: { items:{ label:string; value:number; color:string }[]; maxVal:number }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
      {items.map((it,i) => (
        <div key={i}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:11,color:TEXT_DIM }}>
            <span>{it.label}</span>
            <span style={{ color:it.color,fontWeight:600 }}>₡{it.value.toLocaleString()}</span>
          </div>
          <div style={{ height:8,borderRadius:4,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
            <div className="ch-bar" style={{ '--target':`${Math.min((it.value/maxVal)*100,100)}%`,height:'100%',borderRadius:4,background:`linear-gradient(90deg,${it.color},${it.color}88)` } as React.CSSProperties} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Toggle({ on, onToggle, label }: { on:boolean; onToggle:()=>void; label:string }) {
  return (
    <div onClick={onToggle} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:CARD_BG,borderRadius:10,border:`1px solid ${CARD_BORDER}`,cursor:'pointer',transition:'all .2s' }}>
      <span style={{ fontSize:13,color:TEXT }}>{label}</span>
      <div style={{ width:40,height:22,borderRadius:11,background:on?GREEN:'rgba(255,255,255,.12)',transition:'background .2s',position:'relative' }}>
        <div style={{ width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:2,left:on?20:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.3)' }} />
      </div>
    </div>
  )
}

function StatBox({ label, value, sub, color=GOLD }: { label:string; value:string; sub?:string; color?:string }) {
  return (
    <div style={{ flex:1,background:CARD_BG,borderRadius:12,padding:'12px 14px',border:`1px solid ${CARD_BORDER}`,minWidth:0 }}>
      <div style={{ fontSize:10,color:TEXT_DIM,marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em' }}>{label}</div>
      <div style={{ fontSize:20,fontWeight:700,color,fontFamily:'Sora, sans-serif' }}>{value}</div>
      {sub && <div style={{ fontSize:10,color:TEXT_DIM,marginTop:2 }}>{sub}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 1 — MY SUBSCRIPTIONS (Viewer Side)
═══════════════════════════════════════════════════════════════════ */
function SubscriptionsTab() {
  const subs = MOCK_CHANNELS.filter(c => MY_SUBSCRIPTIONS.includes(c.id))
  const [expandedId, setExpandedId] = React.useState<string|null>(null)

  return (
    <div className="ch-fade" style={{ display:'flex',flexDirection:'column',gap:12 }}>
      {/* summary row */}
      <div style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:4 }}>
        <StatBox label="Active Subs" value={String(subs.length)} sub={`of ${MOCK_CHANNELS.length} channels`} />
        <StatBox label="Monthly Spend" value={`₡${subs.reduce((s,c)=>s+c.monthlyPrice,0).toLocaleString()}`} sub="auto-renew enabled" color={GREEN} />
        <StatBox label="Exclusive Access" value={String(subs.reduce((s,c)=>s+c.exclusivePosts,0))} sub="posts unlocked" color="#8b5cf6" />
      </div>

      {subs.length === 0 && (
        <div style={{ textAlign:'center',padding:40,color:TEXT_DIM,fontSize:14 }}>
          No active subscriptions. Browse channels to find creators you love.
        </div>
      )}

      {subs.map((ch,idx) => {
        const expanded = expandedId === ch.id
        const tierMeta = TIER_META[ch.tier]
        return (
          <div key={ch.id} className="ch-slide" style={{ animationDelay:`${idx*60}ms`,background:CARD_BG,borderRadius:14,border:`1px solid ${CARD_BORDER}`,overflow:'hidden',transition:'all .2s' }}>
            {/* card header */}
            <div onClick={() => setExpandedId(expanded ? null : ch.id)} style={{ padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer' }}>
              <Avatar initials={ch.avatar} size={44} color={tierMeta.color} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                  <span style={{ fontSize:14,fontWeight:600,color:TEXT }}>{ch.name}</span>
                  {ch.verified && <span style={{ fontSize:12 }}>✓</span>}
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:3,flexWrap:'wrap' }}>
                  <Badge text={ch.village} color={GOLD} icon={ch.villageBadge} />
                  <Badge text={tierMeta.label} color={tierMeta.color} icon={tierMeta.icon} />
                </div>
              </div>
              <div style={{ textAlign:'right',flexShrink:0 }}>
                <div style={{ fontSize:15,fontWeight:700,color:GOLD,fontFamily:'Sora, sans-serif' }}>₡{ch.monthlyPrice.toLocaleString()}</div>
                <div style={{ fontSize:10,color:TEXT_DIM }}>/month</div>
              </div>
            </div>

            {/* expanded details */}
            {expanded && (
              <div style={{ padding:'0 16px 14px',borderTop:`1px solid ${CARD_BORDER}` }}>
                <div style={{ padding:'12px 0',fontSize:12,color:TEXT_DIM,lineHeight:1.5 }}>{ch.description}</div>

                {/* content summary */}
                <div style={{ display:'flex',gap:8,marginBottom:12,flexWrap:'wrap' }}>
                  <div style={{ background:'rgba(212,160,23,.08)',borderRadius:8,padding:'6px 10px',fontSize:11,color:GOLD }}>
                    📝 {ch.exclusivePosts} exclusive posts
                  </div>
                  <div style={{ background:'rgba(34,197,94,.08)',borderRadius:8,padding:'6px 10px',fontSize:11,color:GREEN }}>
                    📡 {ch.liveStreams} live streams
                  </div>
                  <div style={{ background:'rgba(139,92,246,.08)',borderRadius:8,padding:'6px 10px',fontSize:11,color:'#8b5cf6' }}>
                    ⏩ {ch.earlyAccess} early access
                  </div>
                </div>

                {/* billing info */}
                <div style={{ background:'rgba(255,255,255,.03)',borderRadius:10,padding:12,marginBottom:12,border:`1px solid ${CARD_BORDER}` }}>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:TEXT_DIM,marginBottom:6 }}>
                    <span>Next billing</span>
                    <span style={{ color:TEXT }}>May 7, 2026</span>
                  </div>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:TEXT_DIM }}>
                    <span>Annual option</span>
                    <span style={{ color:GREEN }}>₡{ch.yearlyPrice.toLocaleString()}/yr (save {Math.round((1 - ch.yearlyPrice/(ch.monthlyPrice*12))*100)}%)</span>
                  </div>
                </div>

                {/* actions */}
                <div style={{ display:'flex',gap:8 }}>
                  <button style={{ flex:1,padding:'10px 0',borderRadius:10,border:`1px solid ${GREEN}`,background:'transparent',color:GREEN,fontSize:12,fontWeight:600,cursor:'pointer' }}>
                    Renew Now
                  </button>
                  <button style={{ flex:1,padding:'10px 0',borderRadius:10,border:`1px solid ${GOLD}`,background:'transparent',color:GOLD,fontSize:12,fontWeight:600,cursor:'pointer' }}>
                    Upgrade Tier
                  </button>
                  <button style={{ flex:1,padding:'10px 0',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',background:'transparent',color:TEXT_DIM,fontSize:12,fontWeight:600,cursor:'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* recommendation */}
      <div style={{ background:'linear-gradient(135deg,rgba(212,160,23,.08),rgba(34,197,94,.05))',borderRadius:14,padding:16,border:`1px solid rgba(212,160,23,.15)`,marginTop:4 }}>
        <div style={{ fontSize:13,fontWeight:600,color:GOLD,marginBottom:6,fontFamily:'Sora, sans-serif' }}>Discover More Creators</div>
        <div style={{ fontSize:12,color:TEXT_DIM,lineHeight:1.5 }}>Based on your subscriptions, you might enjoy channels in Education, Cooking, and Film. Switch to the Browse tab to explore.</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2 — BROWSE CHANNELS
═══════════════════════════════════════════════════════════════════ */
function BrowseTab() {
  const [category, setCategory] = React.useState<BrowseCategory>('All')
  const [tierSelect, setTierSelect] = React.useState<Record<string, TierKey>>({})
  const [subscribed, setSubscribed] = React.useState<Set<string>>(new Set(MY_SUBSCRIPTIONS))

  const filtered = category === 'All' ? MOCK_CHANNELS : MOCK_CHANNELS.filter(c => c.category === category)

  function handleSubscribe(chId: string) {
    setSubscribed(prev => {
      const next = new Set(prev)
      if (next.has(chId)) next.delete(chId)
      else next.add(chId)
      return next
    })
  }

  return (
    <div className="ch-fade" style={{ display:'flex',flexDirection:'column',gap:14 }}>
      {/* category pills */}
      <div style={{ display:'flex',gap:6,overflowX:'auto',paddingBottom:4,flexShrink:0 }}>
        {BROWSE_CATEGORIES.map(cat => {
          const active = category === cat
          return (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding:'6px 14px',borderRadius:20,border:active?`1px solid ${GOLD}`:'1px solid rgba(255,255,255,.1)',background:active?`${GOLD}18`:'transparent',color:active?GOLD:TEXT_DIM,fontSize:12,fontWeight:active?600:400,cursor:'pointer',whiteSpace:'nowrap',transition:'all .2s' }}>
              {cat}
            </button>
          )
        })}
      </div>

      {/* top channels header */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <span style={{ ...HEADING,fontSize:15 }}>
          {category === 'All' ? 'Top Channels' : `${category} Channels`}
        </span>
        <span style={{ fontSize:11,color:TEXT_DIM }}>{filtered.length} channels</span>
      </div>

      {/* channel grid */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12 }}>
        {filtered.map((ch, idx) => {
          const isSub = subscribed.has(ch.id)
          const selectedTier = tierSelect[ch.id] || 'planter'
          const tierMeta = TIER_META[selectedTier]
          return (
            <div key={ch.id} className="ch-slide" style={{ animationDelay:`${idx*50}ms`,background:CARD_BG,borderRadius:14,border:`1px solid ${CARD_BORDER}`,overflow:'hidden',transition:'all .2s' }}>
              {/* thumbnails preview */}
              <div style={{ display:'flex',gap:2,height:72,overflow:'hidden' }}>
                {ch.thumbnails.map((t,i) => (
                  <div key={i} style={{ flex:1,background:`linear-gradient(135deg,rgba(212,160,23,${.06+i*.04}),rgba(255,255,255,.02))`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:TEXT_DIM,padding:6,textAlign:'center',lineHeight:1.3 }}>
                    {t}
                  </div>
                ))}
              </div>

              {/* channel info */}
              <div style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                  <Avatar initials={ch.avatar} size={36} />
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                      <span style={{ fontSize:13,fontWeight:600,color:TEXT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ch.name}</span>
                      {ch.verified && <span style={{ fontSize:11,color:GOLD }}>✓</span>}
                    </div>
                    <div style={{ fontSize:11,color:TEXT_DIM }}>{ch.handle}</div>
                  </div>
                  <Badge text={ch.village} color={GOLD} icon={ch.villageBadge} />
                </div>

                {/* stats row */}
                <div style={{ display:'flex',gap:12,marginBottom:10,fontSize:11,color:TEXT_DIM }}>
                  <span><strong style={{ color:TEXT }}>{ch.subscribers.toLocaleString()}</strong> subscribers</span>
                  <span><strong style={{ color:GOLD }}>₡{ch.monthlyPrice}</strong>/mo</span>
                </div>

                {/* description */}
                <div style={{ fontSize:11,color:TEXT_DIM,lineHeight:1.5,marginBottom:12,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                  {ch.description}
                </div>

                {/* tier selector */}
                <div style={{ display:'flex',gap:4,marginBottom:10 }}>
                  {(Object.keys(TIER_META) as TierKey[]).map(tk => {
                    const tm = TIER_META[tk]
                    const active = selectedTier === tk
                    return (
                      <button key={tk} onClick={() => setTierSelect(p => ({...p,[ch.id]:tk}))} style={{ flex:1,padding:'5px 0',borderRadius:8,border:active?`1px solid ${tm.color}`:`1px solid rgba(255,255,255,.08)`,background:active?`${tm.color}15`:'transparent',color:active?tm.color:TEXT_DIM,fontSize:10,fontWeight:active?600:400,cursor:'pointer',transition:'all .2s' }}>
                        {tm.icon} {tm.label}
                      </button>
                    )
                  })}
                </div>

                {/* subscribe button */}
                <button onClick={() => handleSubscribe(ch.id)} style={{ width:'100%',padding:'10px 0',borderRadius:10,border:isSub?`1px solid ${GREEN}`:`1px solid ${GOLD}`,background:isSub?`${GREEN}12`:`linear-gradient(135deg,${GOLD}22,${GOLD}08)`,color:isSub?GREEN:GOLD,fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .2s',fontFamily:'Sora, sans-serif' }}>
                  {isSub ? '✓ Subscribed' : `Subscribe — ${tierMeta.price}`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3 — MY CHANNEL (Creator Side)
═══════════════════════════════════════════════════════════════════ */
function MyChannelTab() {
  const { user } = useAuthStore()
  const [section, setSection] = React.useState<'tiers'|'drm'|'content'|'revenue'>('tiers')
  const [drmScreenshot, setDrmScreenshot] = React.useState(true)
  const [drmEncryption, setDrmEncryption] = React.useState(false)
  const [drmWatermark, setDrmWatermark] = React.useState(true)
  const [drmConcurrent, setDrmConcurrent] = React.useState(true)
  const [tierNames, setTierNames] = React.useState({ follower:'Follower', planter:'Planter', ancestral:'Ancestral' })
  const [editingTierName, setEditingTierName] = React.useState<TierKey|null>(null)

  const myStats = {
    totalSubs: 2847,
    followerSubs: 1920,
    planterSubs: 714,
    ancestralSubs: 213,
    monthlyRevenue: 714200,
    subscriptionRevenue: 546000,
    tipsRevenue: 98200,
    ppvRevenue: 70000,
    churnRate: 3.2,
    growthData: [
      { month:'Nov', subs:1840 },
      { month:'Dec', subs:2100 },
      { month:'Jan', subs:2290 },
      { month:'Feb', subs:2480 },
      { month:'Mar', subs:2650 },
      { month:'Apr', subs:2847 },
    ],
  }

  const SECTIONS: { key:typeof section; label:string; icon:string }[] = [
    { key:'tiers', label:'Tiers', icon:'🏛' },
    { key:'drm', label:'DRM', icon:'🛡' },
    { key:'content', label:'Content', icon:'📦' },
    { key:'revenue', label:'Revenue', icon:'💰' },
  ]

  return (
    <div className="ch-fade" style={{ display:'flex',flexDirection:'column',gap:14 }}>
      {/* creator header */}
      <div style={{ background:'linear-gradient(135deg,rgba(212,160,23,.1),rgba(212,160,23,.03))',borderRadius:14,padding:16,border:`1px solid rgba(212,160,23,.15)`,display:'flex',alignItems:'center',gap:14 }}>
        <Avatar initials={user?.displayName?.slice(0,2).toUpperCase() || 'ME'} size={52} color={GOLD} />
        <div style={{ flex:1 }}>
          <div style={{ ...HEADING,fontSize:16 }}>{user?.displayName || 'My Channel'}</div>
          <div style={{ fontSize:12,color:TEXT_DIM,marginTop:2 }}>Creator since March 2026</div>
          <div style={{ display:'flex',gap:6,marginTop:6 }}>
            <Badge text={`${myStats.totalSubs.toLocaleString()} subscribers`} color={GREEN} icon="👥" />
            <Badge text="Verified Creator" color={GOLD} icon="✓" />
          </div>
        </div>
      </div>

      {/* quick stats */}
      <div style={{ display:'flex',gap:8,overflowX:'auto' }}>
        <StatBox label="Total Subs" value={myStats.totalSubs.toLocaleString()} sub={`+${myStats.totalSubs - myStats.growthData[myStats.growthData.length-2].subs} this month`} />
        <StatBox label="Revenue" value={`₡${(myStats.monthlyRevenue/1000).toFixed(0)}K`} sub="this month" color={GREEN} />
        <StatBox label="Churn" value={`${myStats.churnRate}%`} sub="monthly" color={myStats.churnRate < 5 ? GREEN : '#ef4444'} />
      </div>

      {/* section nav */}
      <div style={{ display:'flex',gap:4,background:'rgba(255,255,255,.03)',borderRadius:12,padding:3 }}>
        {SECTIONS.map(s => {
          const active = section === s.key
          return (
            <button key={s.key} onClick={() => setSection(s.key)} style={{ flex:1,padding:'8px 0',borderRadius:10,border:'none',background:active?`${GOLD}18`:'transparent',color:active?GOLD:TEXT_DIM,fontSize:12,fontWeight:active?600:400,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}>
              <span>{s.icon}</span>{s.label}
            </button>
          )
        })}
      </div>

      {/* ── TIERS SECTION ── */}
      {section === 'tiers' && (
        <div className="ch-fade" style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ ...HEADING,fontSize:14 }}>Subscription Tiers</div>

          {(Object.keys(TIER_META) as TierKey[]).map((tk) => {
            const tm = TIER_META[tk]
            const subCount = tk === 'follower' ? myStats.followerSubs : tk === 'planter' ? myStats.planterSubs : myStats.ancestralSubs
            const editing = editingTierName === tk
            return (
              <div key={tk} className={tk === 'ancestral' ? 'tier-glow' : ''} style={{ background:CARD_BG,borderRadius:14,border:`1px solid ${tm.color}33`,overflow:'hidden' }}>
                {/* tier header */}
                <div style={{ padding:'14px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${CARD_BORDER}` }}>
                  <div style={{ width:40,height:40,borderRadius:10,background:`${tm.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{tm.icon}</div>
                  <div style={{ flex:1 }}>
                    {editing ? (
                      <input
                        autoFocus
                        value={tierNames[tk]}
                        onChange={e => setTierNames(p => ({...p,[tk]:e.target.value}))}
                        onBlur={() => setEditingTierName(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditingTierName(null)}
                        style={{ background:'rgba(255,255,255,.08)',border:`1px solid ${tm.color}44`,borderRadius:6,padding:'4px 8px',color:TEXT,fontSize:14,fontWeight:600,outline:'none',width:'100%',fontFamily:'Sora, sans-serif' }}
                      />
                    ) : (
                      <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                        <span style={{ fontSize:14,fontWeight:600,color:tm.color,fontFamily:'Sora, sans-serif' }}>{tierNames[tk]}</span>
                        <span onClick={() => setEditingTierName(tk)} style={{ fontSize:10,color:TEXT_DIM,cursor:'pointer',textDecoration:'underline' }}>rename</span>
                      </div>
                    )}
                    <div style={{ fontSize:12,color:TEXT_DIM,marginTop:2 }}>{subCount.toLocaleString()} subscribers</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:16,fontWeight:700,color:tm.color,fontFamily:'Sora, sans-serif' }}>{tm.price}</div>
                  </div>
                </div>

                {/* features */}
                <div style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    {tm.features.map((f,i) => (
                      <div key={i} style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:TEXT_DIM }}>
                        <span style={{ color:tm.color,fontSize:10 }}>●</span>
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* content gating toggle */}
                  <div style={{ marginTop:12,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'rgba(255,255,255,.03)',borderRadius:8,border:`1px solid ${CARD_BORDER}` }}>
                    <span style={{ fontSize:11,color:TEXT_DIM }}>Content gating active</span>
                    <div style={{ width:8,height:8,borderRadius:'50%',background:GREEN }} />
                  </div>
                </div>
              </div>
            )
          })}

          {/* subscriber growth chart */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ ...HEADING,fontSize:13,marginBottom:12 }}>Subscriber Growth</div>
            <div style={{ display:'flex',alignItems:'flex-end',gap:6,height:100 }}>
              {myStats.growthData.map((d,i) => {
                const maxSubs = Math.max(...myStats.growthData.map(g => g.subs))
                const pct = (d.subs / maxSubs) * 100
                const isLatest = i === myStats.growthData.length - 1
                return (
                  <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
                    <span style={{ fontSize:9,color:isLatest?GOLD:TEXT_DIM,fontWeight:isLatest?600:400 }}>{d.subs.toLocaleString()}</span>
                    <div className="ch-bar" style={{ '--target':`${pct}%`,width:'100%',height:`${pct}%`,borderRadius:'6px 6px 0 0',background:isLatest?`linear-gradient(180deg,${GOLD},${GOLD}66)`:'linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.04))',transition:'height .6s ease',minHeight:4 } as React.CSSProperties} />
                    <span style={{ fontSize:9,color:TEXT_DIM }}>{d.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* by-tier breakdown */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ ...HEADING,fontSize:13,marginBottom:12 }}>Subscribers by Tier</div>
            <BarChart
              maxVal={myStats.followerSubs}
              items={[
                { label:`${tierNames.follower} (Free)`, value:myStats.followerSubs, color:'#6b7280' },
                { label:`${tierNames.planter} (₡500/mo)`, value:myStats.planterSubs, color:'#22c55e' },
                { label:`${tierNames.ancestral} (₡2,000/mo)`, value:myStats.ancestralSubs, color:'#d4a017' },
              ]}
            />
          </div>
        </div>
      )}

      {/* ── DRM SECTION ── */}
      {section === 'drm' && (
        <div className="ch-fade" style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ ...HEADING,fontSize:14 }}>Content DRM Protection</div>
          <div style={{ fontSize:12,color:TEXT_DIM,lineHeight:1.5 }}>
            Protect your exclusive content from unauthorized distribution. All protections apply to Planter and Ancestral tier content.
          </div>

          <Toggle on={drmScreenshot} onToggle={() => setDrmScreenshot(!drmScreenshot)} label="Enable screenshot protection" />
          <Toggle on={drmEncryption} onToggle={() => setDrmEncryption(!drmEncryption)} label="Session-based encryption" />
          <Toggle on={drmWatermark} onToggle={() => setDrmWatermark(!drmWatermark)} label="Watermark viewer AfroID on screen" />
          <Toggle on={drmConcurrent} onToggle={() => setDrmConcurrent(!drmConcurrent)} label="Limit concurrent streams per account" />

          {/* active protections summary */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ ...HEADING,fontSize:13,marginBottom:12 }}>Active Protections</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
              {[
                { label:'Screenshot Block', on:drmScreenshot, icon:'📸' },
                { label:'Session Encryption', on:drmEncryption, icon:'🔐' },
                { label:'AfroID Watermark', on:drmWatermark, icon:'💧' },
                { label:'Stream Limit (2 devices)', on:drmConcurrent, icon:'📱' },
              ].map((p,i) => (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,background:p.on?`${GREEN}12`:'rgba(255,255,255,.03)',border:`1px solid ${p.on?`${GREEN}33`:CARD_BORDER}` }}>
                  <span>{p.icon}</span>
                  <span style={{ fontSize:11,color:p.on?GREEN:TEXT_DIM,fontWeight:p.on?600:400 }}>{p.label}</span>
                  <span style={{ width:6,height:6,borderRadius:'50%',background:p.on?GREEN:'rgba(255,255,255,.15)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* DRM info card */}
          <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,.08),rgba(139,92,246,.02))',borderRadius:14,padding:16,border:'1px solid rgba(139,92,246,.15)' }}>
            <div style={{ fontSize:12,fontWeight:600,color:'#8b5cf6',marginBottom:6,fontFamily:'Sora, sans-serif' }}>How DRM Works on Jollof TV</div>
            <div style={{ fontSize:11,color:TEXT_DIM,lineHeight:1.6 }}>
              Screenshot protection uses CSS overlay + DOM event blocking. Session encryption ties playback tokens to the viewer's active session; if they share the link, it expires. AfroID watermarking renders a semi-transparent overlay with the viewer's unique identifier, making leaked content traceable. Concurrent stream limits enforce a maximum of 2 simultaneous devices per subscriber account.
            </div>
          </div>
        </div>
      )}

      {/* ── EXCLUSIVE CONTENT SECTION ── */}
      {section === 'content' && (
        <div className="ch-fade" style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div style={{ ...HEADING,fontSize:14 }}>Exclusive Content Manager</div>
            <button style={{ padding:'8px 16px',borderRadius:10,border:`1px solid ${GOLD}`,background:`${GOLD}12`,color:GOLD,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Sora, sans-serif' }}>
              + Post Exclusive
            </button>
          </div>

          {/* content type filter */}
          <div style={{ display:'flex',gap:6,overflowX:'auto',paddingBottom:2 }}>
            {(['All' as const, ...Object.keys(CONTENT_TYPE_META) as ContentType[]]).map(ct => (
              <button key={ct} style={{ padding:'4px 12px',borderRadius:16,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:TEXT_DIM,fontSize:11,cursor:'pointer',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4 }}>
                {ct !== 'All' && <span>{CONTENT_TYPE_META[ct as ContentType].icon}</span>}
                {ct}
              </button>
            ))}
          </div>

          {/* content list */}
          {MOCK_EXCLUSIVE_CONTENT.map((item, idx) => {
            const ctm = CONTENT_TYPE_META[item.type]
            const tierMeta = TIER_META[item.tier]
            return (
              <div key={item.id} className="ch-slide" style={{ animationDelay:`${idx*40}ms`,background:CARD_BG,borderRadius:12,border:`1px solid ${CARD_BORDER}`,padding:'12px 14px' }}>
                <div style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:8,background:`${ctm.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>
                    {ctm.icon}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:TEXT,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.title}</div>
                    <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                      <Badge text={item.type} color={ctm.color} icon={ctm.icon} />
                      <Badge text={`${tierMeta.icon} ${tierMeta.label} required`} color={tierMeta.color} />
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex',justifyContent:'space-between',marginTop:10,paddingTop:8,borderTop:`1px solid ${CARD_BORDER}` }}>
                  <div style={{ display:'flex',gap:14 }}>
                    <span style={{ fontSize:11,color:TEXT_DIM }}>👁 <strong style={{ color:TEXT }}>{item.views.toLocaleString()}</strong> views</span>
                    <span style={{ fontSize:11,color:TEXT_DIM }}>💰 <strong style={{ color:GOLD }}>₡{item.earnings.toLocaleString()}</strong></span>
                  </div>
                  <span style={{ fontSize:10,color:TEXT_DIM }}>{item.date}</span>
                </div>
              </div>
            )
          })}

          {/* total content stats */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ ...HEADING,fontSize:13,marginBottom:10 }}>Content Summary</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
              {(Object.keys(CONTENT_TYPE_META) as ContentType[]).map(ct => {
                const ctm = CONTENT_TYPE_META[ct]
                const count = MOCK_EXCLUSIVE_CONTENT.filter(e => e.type === ct).length
                return (
                  <div key={ct} style={{ textAlign:'center',padding:10,borderRadius:10,background:`${ctm.color}08`,border:`1px solid ${ctm.color}22` }}>
                    <div style={{ fontSize:16,marginBottom:4 }}>{ctm.icon}</div>
                    <div style={{ fontSize:14,fontWeight:700,color:ctm.color }}>{count}</div>
                    <div style={{ fontSize:9,color:TEXT_DIM }}>{ct}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE SECTION ── */}
      {section === 'revenue' && (
        <div className="ch-fade" style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ ...HEADING,fontSize:14 }}>Revenue Breakdown</div>

          {/* revenue summary */}
          <div style={{ display:'flex',gap:8 }}>
            <StatBox label="Subscriptions" value={`₡${(myStats.subscriptionRevenue/1000).toFixed(0)}K`} sub={`${Math.round(myStats.subscriptionRevenue/myStats.monthlyRevenue*100)}% of total`} color={GREEN} />
            <StatBox label="Tips" value={`₡${(myStats.tipsRevenue/1000).toFixed(0)}K`} sub={`${Math.round(myStats.tipsRevenue/myStats.monthlyRevenue*100)}% of total`} color="#f59e0b" />
            <StatBox label="Pay-Per-View" value={`₡${(myStats.ppvRevenue/1000).toFixed(0)}K`} sub={`${Math.round(myStats.ppvRevenue/myStats.monthlyRevenue*100)}% of total`} color="#8b5cf6" />
          </div>

          {/* total */}
          <div style={{ background:'linear-gradient(135deg,rgba(212,160,23,.12),rgba(212,160,23,.04))',borderRadius:14,padding:16,border:`1px solid rgba(212,160,23,.2)`,textAlign:'center' }}>
            <div style={{ fontSize:11,color:TEXT_DIM,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4 }}>Total Revenue This Month</div>
            <div style={{ fontSize:28,fontWeight:700,color:GOLD,fontFamily:'Sora, sans-serif' }}>₡{myStats.monthlyRevenue.toLocaleString()}</div>
            <div style={{ fontSize:11,color:GREEN,marginTop:4 }}>+12.4% from last month</div>
          </div>

          {/* per-tier revenue bars */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ ...HEADING,fontSize:13,marginBottom:12 }}>Revenue by Tier</div>
            <BarChart
              maxVal={426000}
              items={[
                { label:`${tierNames.ancestral} (213 subs x ₡2,000)`, value:426000, color:GOLD },
                { label:`${tierNames.planter} (714 subs x ₡500)`, value:357000, color:GREEN },
                { label:`${tierNames.follower} (ad revenue)`, value:48000, color:'#6b7280' },
              ]}
            />
          </div>

          {/* top performing content */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ ...HEADING,fontSize:13,marginBottom:12 }}>Top Performing Exclusives</div>
            {[...MOCK_EXCLUSIVE_CONTENT].sort((a,b)=>b.earnings-a.earnings).slice(0,5).map((item,i) => {
              const ctm = CONTENT_TYPE_META[item.type]
              return (
                <div key={item.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<4?`1px solid ${CARD_BORDER}`:'none' }}>
                  <span style={{ fontSize:12,fontWeight:700,color:TEXT_DIM,width:18,textAlign:'center' }}>{i+1}</span>
                  <span style={{ fontSize:14 }}>{ctm.icon}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,color:TEXT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.title}</div>
                    <div style={{ fontSize:10,color:TEXT_DIM }}>{item.views.toLocaleString()} views</div>
                  </div>
                  <span style={{ fontSize:13,fontWeight:700,color:GOLD,fontFamily:'Sora, sans-serif' }}>₡{item.earnings.toLocaleString()}</span>
                </div>
              )
            })}
          </div>

          {/* churn indicator */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
              <div style={{ ...HEADING,fontSize:13 }}>Churn Rate</div>
              <Badge text={myStats.churnRate < 5 ? 'Healthy' : 'Needs Attention'} color={myStats.churnRate < 5 ? GREEN : '#ef4444'} icon={myStats.churnRate < 5 ? '✓' : '!'} />
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ fontSize:32,fontWeight:700,color:myStats.churnRate<5?GREEN:'#ef4444',fontFamily:'Sora, sans-serif' }}>{myStats.churnRate}%</div>
              <div style={{ flex:1 }}>
                <div style={{ height:8,borderRadius:4,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
                  <div style={{ width:`${myStats.churnRate*10}%`,height:'100%',borderRadius:4,background:myStats.churnRate<5?GREEN:'#ef4444',transition:'width .6s' }} />
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',marginTop:4,fontSize:9,color:TEXT_DIM }}>
                  <span>0% (perfect)</span>
                  <span>5% (avg)</span>
                  <span>10% (high)</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize:11,color:TEXT_DIM,marginTop:10,lineHeight:1.5 }}>
              Your churn rate is below the platform average of 5%. Top retention factors: consistent content schedule, active community engagement, and high exclusive content value.
            </div>
          </div>

          {/* monthly trend */}
          <div style={{ background:CARD_BG,borderRadius:14,padding:16,border:`1px solid ${CARD_BORDER}` }}>
            <div style={{ ...HEADING,fontSize:13,marginBottom:12 }}>Monthly Revenue Trend</div>
            <div style={{ display:'flex',alignItems:'flex-end',gap:6,height:110 }}>
              {[
                { month:'Nov', rev:480000 },
                { month:'Dec', rev:520000 },
                { month:'Jan', rev:590000 },
                { month:'Feb', rev:630000 },
                { month:'Mar', rev:670000 },
                { month:'Apr', rev:714200 },
              ].map((d,i,arr) => {
                const maxRev = Math.max(...arr.map(a => a.rev))
                const pct = (d.rev / maxRev) * 100
                const isLatest = i === arr.length - 1
                return (
                  <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
                    <span style={{ fontSize:8,color:isLatest?GOLD:TEXT_DIM,fontWeight:isLatest?600:400 }}>₡{(d.rev/1000).toFixed(0)}K</span>
                    <div style={{ width:'100%',height:`${pct}%`,borderRadius:'6px 6px 0 0',background:isLatest?`linear-gradient(180deg,${GOLD},${GOLD}66)`:'linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.04))',transition:'height .6s',minHeight:4 }} />
                    <span style={{ fontSize:9,color:TEXT_DIM }}>{d.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* withdraw button */}
          <button style={{ width:'100%',padding:'14px 0',borderRadius:12,border:'none',background:`linear-gradient(135deg,${GOLD},#b8860b)`,color:'#0d0804',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif',letterSpacing:'.02em' }}>
            Withdraw to UnionPay  ₡{myStats.monthlyRevenue.toLocaleString()}
          </button>

          {/* payout info */}
          <div style={{ textAlign:'center',fontSize:10,color:TEXT_DIM,lineHeight:1.6 }}>
            Payouts processed within 24 hours to your UnionPay wallet.<br />
            Platform fee: 8% on subscriptions, 5% on tips, 12% on PPV.<br />
            Minimum withdrawal: ₡5,000
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function JollofChannelsPage() {
  if (!USE_MOCKS) return <UnderConstruction module="Creator Channels" />
  const router = useRouter()
  const [tab, setTab] = React.useState<Tab>('subscriptions')

  React.useEffect(() => { injectCSS() }, [])

  const TABS: { key:Tab; label:string; icon:string }[] = [
    { key:'subscriptions', label:'Subscriptions', icon:'📺' },
    { key:'browse', label:'Browse', icon:'🔍' },
    { key:'my_channel', label:'My Channel', icon:'🎬' },
  ]

  return (
    <div style={{ minHeight:'100dvh',background:BG,color:TEXT,fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif' }}>
      {/* header */}
      <div style={{ padding:'14px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${CARD_BORDER}`,background:'rgba(13,8,4,.95)',position:'sticky',top:0,zIndex:20,backdropFilter:'blur(12px)' }}>
        <div onClick={() => router.push('/dashboard/jollof')} style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14 }}>
          ←
        </div>
        <div style={{ flex:1 }}>
          <div style={{ ...HEADING,fontSize:16 }}>Creator Channels</div>
          <div style={{ fontSize:10,color:GOLD,marginTop:1,letterSpacing:'.06em' }}>JOLLOF TV SUBSCRIPTIONS</div>
        </div>
        <div className="ch-pulse" style={{ width:8,height:8,borderRadius:'50%',background:GREEN }} />
      </div>

      {/* tab bar */}
      <div style={{ display:'flex',gap:0,padding:'8px 12px',background:'rgba(255,255,255,.02)',borderBottom:`1px solid ${CARD_BORDER}`,position:'sticky',top:60,zIndex:19,backdropFilter:'blur(12px)' }}>
        {TABS.map(t => {
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex:1,padding:'10px 0',border:'none',borderBottom:active?`2px solid ${GOLD}`:'2px solid transparent',background:'transparent',color:active?GOLD:TEXT_DIM,fontSize:12,fontWeight:active?700:400,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontFamily:active?'Sora, sans-serif':'inherit' }}>
              <span>{t.icon}</span>{t.label}
            </button>
          )
        })}
      </div>

      {/* content */}
      <div style={{ padding:'16px 12px 100px' }}>
        {tab === 'subscriptions' && <SubscriptionsTab />}
        {tab === 'browse' && <BrowseTab />}
        {tab === 'my_channel' && <MyChannelTab />}
      </div>
    </div>
  )
}
