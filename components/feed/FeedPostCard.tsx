'use client'
import * as React from 'react'
import { CommentSheet } from '@/components/feed/CommentSheet'
import { sorosokeApi } from '@/lib/api'
import type { Post as CanonicalPost } from '@/components/feed/feedTypes'

/* ── shared skin config ── */
export type Skin = 'ise' | 'egbe' | 'idile'
export const SKINS = {
  ise:   { label:'⚒ ISE',    color:'#1a7c3e', light:'#4ade80', bg:'rgba(26,124,62,.15)',  border:'rgba(26,124,62,.4)',  pill:'⚒ ISE',    pillBg:'rgba(26,124,62,.2)',  pillC:'#4ade80', pillBorder:'rgba(26,124,62,.35)' },
  egbe:  { label:'⭕ EGBE',   color:'#e07b00', light:'#fb923c', bg:'rgba(224,123,0,.15)',  border:'rgba(224,123,0,.4)',  pill:'⭕ EGBE',   pillBg:'rgba(224,123,0,.2)',  pillC:'#fb923c', pillBorder:'rgba(224,123,0,.35)' },
  idile: { label:'🌳 ÌDÍLÉ', color:'#7c3aed', light:'#c084fc', bg:'rgba(124,58,237,.15)', border:'rgba(124,58,237,.4)', pill:'🌳 ÌDÍLÉ', pillBg:'rgba(124,58,237,.2)', pillC:'#c084fc', pillBorder:'rgba(124,58,237,.35)' },
}

/* ── local display type (PostCard rendering) ── */
type PostT = 'text'|'voice'|'market'|'proverb'|'oracle'|'proof'|'notice'|'event'|'gallery'
export type ViewMode = 'default'|'gallery'|'voice'|'spotlight'|'discover'
export interface DisplayPost {
  id:string; type:PostT; skin:Skin
  authorName:string; village:string; av:string; avBg:string; avBorder:string
  crest?:string; verified?:boolean; time:string; heat:number
  content?:string; duration?:string; translation?:string
  productName?:string; price?:string; priceNum?:number; productEmoji?:string; pricePos?:number
  marketLow?:string; marketMid?:string; marketHigh?:string; marketPercent?:number; location?:string
  imageCount?:number
  mediaCount?:number
  proverbRoot?:string; proverbLang?:string
  oracleContent?:string; oracleAgree?:number
  tradeProduct?:string; tradeLocation?:string; tradeAmount?:string; tradeBuyer?:string; tradeSeller?:string
  noticeContent?:string; eventPayload?:string
  kila:number; stir:number; drum:number; ubuntu?:number; spray?:number
  scope:'village'|'region'|'nation'; geoMin:'village'|'state'|'country'|'continent'|'global'
}

const CREST_LABELS = ['', 'I', 'II', 'III', 'IV', 'V']

export function toDisplay(p: CanonicalPost): DisplayPost {
  return {
    id: p.id,
    type: p.type === 'TEXT_DRUM'      ? 'text'
        : p.type === 'VOICE_STORY'    ? 'voice'
        : p.type === 'AUDIO_LETTER'   ? 'voice'
        : p.type === 'MARKET_LISTING' ? 'market'
        : p.type === 'IMAGE_JOURNAL'  ? 'gallery'
        : p.type === 'PROVERB_CHAIN'  ? 'proverb'
        : p.type === 'ORACLE_SESSION' ? 'oracle'
        : p.type === 'TRADE_PROOF'    ? 'proof'
        : p.type === 'VILLAGE_NOTICE' ? 'notice'
        : p.type === 'EVENT_DRUM'     ? 'event'
        : 'text',
    skin: p.skinContext,
    authorName: p.author,
    village: `${p.villageEmoji} ${p.village}`,
    av: p.villageEmoji,
    avBg: p.avatarColor,
    avBorder: p.avatarColor.replace(/[\d.]+\)$/, '.4)'),
    crest: p.crestTier > 0 ? CREST_LABELS[Math.min(5, p.crestTier)] : undefined,
    verified: p.nkisi === 'GREEN',
    time: p.time,
    heat: p.heatScore,
    content: p.content,
    duration: p.duration ?? (p.audioDurationSec ? `${Math.floor(p.audioDurationSec / 60)}:${String(p.audioDurationSec % 60).padStart(2, '0')}` : undefined),
    translation: p.translation,
    productName: p.productName,
    price: p.productPrice != null ? `₡ ${p.productPrice.toLocaleString()}` : undefined,
    priceNum: p.productPrice,
    productEmoji: p.productImageEmoji,
    location: p.location,
    proverbRoot: p.proverbOrigin,
    proverbLang: p.proverbLang,
    oracleContent: p.oracleTopic,
    oracleAgree: p.oracleAgree,
    tradeProduct: p.content,
    tradeLocation: p.location,
    tradeAmount: p.tradeAmount != null ? p.tradeAmount.toLocaleString() : undefined,
    tradeBuyer: p.tradePartner,
    tradeSeller: undefined,
    noticeContent: (p.noticeContent ?? p.content) || '',
    eventPayload: p.eventPayload,
    imageCount: p.imageUrls?.length,
    mediaCount: (p as unknown as Record<string,unknown>).mediaCount as number ?? 6,
    marketPercent: p.marketPricePercent,
    kila: p.kilaCount,
    stir: p.stirCount,
    drum: 0,
    ubuntu: p.ubuntuCount,
    spray: p.sprayTotal,
    scope: p.scope ?? 'village',
    geoMin: p.geoMin ?? 'village',
  }
}

/* ── heat ── */
type Heat = 'COLD'|'EMBER'|'SIMMER'|'BOIL'|'FEAST'
const HEAT_STAGES: Record<Heat, { label:string; color:string; fill:string }> = {
  COLD:   { label:'❄ COLD',    color:'rgba(255,255,255,.3)', fill:'rgba(255,255,255,.1)' },
  EMBER:  { label:'🌑 EMBER',  color:'#8b4513',              fill:'linear-gradient(to right,#2a1a08,#8b4513)' },
  SIMMER: { label:'♨ SIMMER', color:'#e07b00',              fill:'linear-gradient(to right,#8b4513,#e07b00)' },
  BOIL:   { label:'🌊 BOIL',   color:'#ff4500',              fill:'linear-gradient(to right,#e07b00,#ff4500)' },
  FEAST:  { label:'🔥 FEAST',  color:'#ffd700',              fill:'linear-gradient(to right,#ff4500,#ffd700)' },
}
function heatFromPct(p: number): Heat {
  return p >= 85 ? 'FEAST' : p >= 65 ? 'BOIL' : p >= 40 ? 'SIMMER' : p >= 20 ? 'EMBER' : 'COLD'
}

const WAVE_HEIGHTS = [12,24,36,20,44,16,32,28,12,36,20,28,24,40,18,32,14,28,36,22,30,16,42,24,18,34,20,26,38,14]

function Waveform({ playing, expanded }: { playing:boolean; expanded?:boolean }) {
  const color = expanded ? '#818cf8' : '#6366f1'
  return (
    <div style={{ display:'flex',alignItems:'center',gap:2,height:44,flex:1 }}>
      {WAVE_HEIGHTS.map((h,i) => (
        <div key={i} className="wv-bar" style={{
          height: playing ? h : h * 0.4,
          background: color,
          opacity: playing ? 0.7 : 0.35,
          borderRadius: 2,
          transition: `height ${0.1 + i * 0.02}s ease`,
          animationDelay: `${i * 0.05}s`,
        }} />
      ))}
    </div>
  )
}

function HeatBar({ pct }: { pct:number }) {
  const stage = heatFromPct(pct)
  const cfg = HEAT_STAGES[stage]
  return (
    <div style={{ padding:'7px 14px 0' }}>
      <div style={{ display:'flex',alignItems:'center',gap:9 }}>
        <div style={{ flex:1 }}>
          <div style={{ height:5,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${pct}%`,background:cfg.fill,borderRadius:99,transition:'width .5s ease' }} />
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',marginTop:2 }}>
            {(['Cold','Ember','Simmer','Boil','FEAST'] as const).map(l => (
              <span key={l} style={{ fontSize:7,color:'rgba(255,255,255,.2)' }}>{l}</span>
            ))}
          </div>
        </div>
        <span style={{ fontSize:10,fontWeight:700,color:cfg.color,flexShrink:0 }}>{cfg.label}</span>
      </div>
    </div>
  )
}

/* ── village square ── */
const VSQ_TABS = ['📯 Notices','🛒 Market','🥁 Drum','🏛 Wisdom'] as const
export function VillageSquare() {
  const [tab, setTab] = React.useState(0)
  const content = [
    [
      { ico:'📯', txt:'Elder Ngozi: Friday market at 7AM. Traders confirm stock Thursday.', val:'👑 Official', vc:'#fbbf24' },
      { ico:'🔒', txt:'New rule: All trades above ₡50,000 require Runner service.', val:'Crest V', vc:'#fbbf24' },
    ],
    [
      { ico:'🍅', txt:'Tomatoes · 5 bags · ₡2,400 · Oshodi', val:'₡2,400', vc:'#4ade80' },
      { ico:'👗', txt:'Ankara Fabric · 6 yards · ₡4,500 · Island', val:'₡4,500', vc:'#4ade80' },
    ],
    'drum' as const,
    [
      { ico:'🏛', txt:'"Agbado tí a bá jẹ papọ̀" — reached FEAST stage. Now Village History.', val:'FEAST ✓', vc:'#fbbf24' },
    ],
  ]
  return (
    <div style={{ margin:'8px 12px',borderRadius:14,overflow:'hidden',border:'1px solid rgba(26,124,62,.2)' }}>
      <div style={{ background:'linear-gradient(135deg,#0e2a14,#162810)',padding:'10px 14px',display:'flex',alignItems:'center',gap:8 }}>
        <span style={{ fontSize:18 }}>🏛</span>
        <span style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:800,color:'#4ade80',flex:1 }}>Village Square · Ìlú Oníṣòwò</span>
        <span style={{ fontSize:9,color:'rgba(74,222,128,.5)' }}>● Live</span>
      </div>
      <div style={{ display:'flex',background:'rgba(0,0,0,.3)' }}>
        {VSQ_TABS.map((t, i) => (
          <div key={i} onClick={() => setTab(i)} style={{ flex:1,padding:'6px 3px',textAlign:'center',fontSize:9,fontWeight:700,cursor:'pointer',color:tab===i?'#4ade80':'rgba(255,255,255,.3)',borderBottom:`2px solid ${tab===i?'#1a7c3e':'transparent'}`,transition:'all .2s' }}>{t}</div>
        ))}
      </div>
      <div style={{ background:'rgba(0,0,0,.2)',padding:'10px 14px',minHeight:60 }}>
        {tab === 2 ? (
          <div>
            <div style={{ fontSize:11,color:'rgba(74,222,128,.7)',fontStyle:'italic',marginBottom:4 }}><span style={{ color:'#4ade80',fontStyle:'normal',fontWeight:700 }}>Mama Ngozi</span> posted a Voice Story</div>
            <div style={{ fontSize:11,color:'rgba(74,222,128,.7)',fontStyle:'italic',marginBottom:4 }}>Trade sealed: <span style={{ color:'#4ade80',fontStyle:'normal',fontWeight:700 }}>Kwame → Chioma</span> ₡120,000</div>
            <div style={{ fontSize:11,color:'rgba(74,222,128,.7)',fontStyle:'italic' }}><span style={{ color:'#4ade80',fontStyle:'normal',fontWeight:700 }}>3 new members</span> joined today</div>
          </div>
        ) : (
          (content[tab] as { ico:string; txt:string; val:string; vc:string }[]).map((item, i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:i < (content[tab] as unknown[]).length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
              <span style={{ fontSize:16 }}>{item.ico}</span>
              <span style={{ fontSize:11,color:'rgba(240,245,238,.8)',flex:1,lineHeight:1.5 }}>{item.txt}</span>
              <span style={{ fontSize:10,fontWeight:700,color:item.vc,flexShrink:0 }}>{item.val}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ── griot card ── */
export function GriotCard() {
  return (
    <div style={{ margin:'8px 12px',background:'linear-gradient(135deg,#1a1400,#2a2000)',border:'1px solid rgba(212,160,23,.2)',borderRadius:14,overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderBottom:'1px solid rgba(212,160,23,.1)' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(212,160,23,.15)',border:'1.5px solid rgba(212,160,23,.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>🦅</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:800,color:'#fbbf24' }}>Griot Orunmila · Village Elder AI</div>
          <div style={{ fontSize:9,color:'rgba(212,160,23,.5)',marginTop:2 }}>🤖 AI-generated · Position 1 in Discover</div>
        </div>
      </div>
      <div style={{ padding:'12px 14px',fontSize:12,color:'rgba(212,160,23,.85)',lineHeight:1.7,fontStyle:'italic' }}>
        "Good morning, children of the village. The cocoa price floor debate reached FEAST stage — 450 Kíla in 30 days. Mama Adaeze's Jollof TV stream broke 1,400 viewers with 23 trade sessions opened. The village is alive and trading."
      </div>
      <div style={{ padding:'8px 14px',borderTop:'1px solid rgba(212,160,23,.1)',fontSize:10,color:'rgba(212,160,23,.45)',fontStyle:'italic' }}>
        ✦ "Ẹni tó bá sunwọ̀n gba àṣà, àṣà á tún padà sí i" — Yoruba
      </div>
    </div>
  )
}

/* ── post card ── */
const SV_LANGS = ['EN','YO','IG','HA','FR','SW']
const SV_TRANS: Record<string, string> = {
  EN: '"I tell you today the story of the first market at Ile-Ife — where Oduduwa planted the first yam."',
  YO: '"Mo ń sọ ìtàn ọjà àkọ́kọ́ ní Ilé-Ifẹ̀ fún yín lónìí."',
  IG: '"Echefu m ụmụ nne na nna, akụkọ ihe mere ụka mbụ na Ile-Ife."',
  HA: '"Ina gaya muku labarin kasuwar farko a Ile-Ife."',
  FR: '"Je vous raconte aujourd\'hui l\'histoire du premier marché à Ile-Ife."',
  SW: '"Ninawaambia leo hadithi ya soko la kwanza Ile-Ife."',
}
const scopeLabel: Record<string, string> = { village:'🏘 Village', region:'🏙 Region', nation:'🌍 Nation' }
const typeTag: Partial<Record<PostT, string>> = { proverb:'PROVERB', oracle:'ORACLE', proof:'TRADE PROOF', notice:'NOTICE', event:'EVENT', gallery:'GALLERY' }
const geoReachLabel: Record<string, string> = { village:'Village', state:'State', country:'National', continent:'Africa', global:'Global' }
const GEO_ACCENT: Record<string, string> = { village:'#4ade80', state:'#fb923c', country:'#34d399', continent:'#60a5fa', global:'#fbbf24' }

/* ── Gallery image placeholder grid ── */
function GalleryPlaceholder({ post }: { post: DisplayPost }) {
  // Generate 6 color swatches from post id (deterministic per post)
  const colors = [
    ['#2d5a1b','#1a7c3e'], ['#7c3aed','#5b21b6'], ['#d97706','#b45309'],
    ['#0369a1','#0284c7'], ['#9f1239','#be123c'], ['#065f46','#047857'],
    ['#581c87','#7c3aed'], ['#92400e','#d97706'], ['#1e3a5f','#1d4ed8'],
  ]
  const seed = post.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const getColor = (i: number) => colors[(seed + i) % colors.length]

  const photoCount = post.mediaCount ?? 6
  const emojis = ['🌿','🎨','🌾','🏙','🌍','✨','🔥','💎','🌊','🎭']
  const postEmoji = emojis[seed % emojis.length]

  return (
    <div style={{ margin: '8px 0', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
      {/* 3-column grid: first item spans 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '110px 90px', gap: 2 }}>
        {/* Hero cell: spans 2 rows */}
        <div style={{
          gridRow: '1 / 3', gridColumn: '1',
          background: `linear-gradient(135deg, ${getColor(0)[0]}, ${getColor(0)[1]})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, position: 'relative', overflow: 'hidden',
        }}>
          <span style={{ opacity: .7 }}>{postEmoji}</span>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,.1), rgba(0,0,0,.3))' }} />
        </div>
        {/* 4 smaller cells */}
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${getColor(i)[0]}, ${getColor(i)[1]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, opacity: 0.85, overflow: 'hidden', position: 'relative',
          }}>
            <span style={{ opacity: .5 }}>{emojis[(seed + i + 3) % emojis.length]}</span>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.15)' }} />
          </div>
        ))}
      </div>
      {/* Bottom overlay: caption + photo count */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(0deg, rgba(0,0,0,.75) 0%, transparent 100%)',
        padding: '28px 12px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.85)', lineHeight: 1.4, maxWidth: '70%' }}>
          {post.content?.slice(0, 40) ?? ''}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(0,0,0,.5)', borderRadius: 99, padding: '3px 8px',
        }}>
          <span style={{ fontSize: 10 }}>🖼</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{photoCount}</span>
        </div>
      </div>
    </div>
  )
}

/* ── hashtag / mention highlight ── */
function HighlightedContent({ text }: { text: string }) {
  const parts = text.split(/(\s+)/)
  return (
    <span>
      {parts.map((word, i) =>
        /^#\w+/.test(word)
          ? <span key={i} style={{ color: '#4ade80', fontWeight: 700 }}>{word}</span>
          : /^@\w+/.test(word)
          ? <span key={i} style={{ color: '#60a5fa', fontWeight: 700 }}>{word}</span>
          : word
      )}
    </span>
  )
}

export function FeedPostCard({ post, viewMode = 'default' }: { post:DisplayPost; viewMode?: ViewMode }) {
  const [kilaLit, setKilaLit] = React.useState(false)
  const [kilaN, setKilaN] = React.useState(post.kila)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [svLang, setSvLang] = React.useState('EN')
  const [bookmarked, setBookmarked] = React.useState(false)
  const [commentOpen, setCommentOpen] = React.useState(false)
  const [agree, setAgree] = React.useState(post.oracleAgree ?? 65)
  const [toast, setToast] = React.useState<string | null>(null)
  const [shellPos, setShellPos] = React.useState<{ x:number; y:number } | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }
  const handleKila = (e: React.MouseEvent) => {
    setKilaLit(k => !k)
    setKilaN(n => kilaLit ? n - 1 : n + 1)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setShellPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setShellPos(null), 2100)
    if (!kilaLit) sorosokeApi.kila(post.id).catch(() => {})
  }
  const handlePlay = () => {
    if (playing) {
      setPlaying(false)
      clearInterval(timerRef.current!)
    } else {
      setPlaying(true)
      timerRef.current = setInterval(() => {
        setProgress(p => { if (p >= 100) { setPlaying(false); clearInterval(timerRef.current!); return 0 } return p + 0.5 })
      }, 150)
    }
  }
  React.useEffect(() => () => clearInterval(timerRef.current!), [])
  const handleSpray = () => {
    sorosokeApi.spray(post.id, { amount: 50 }).catch(() => {})
    showToast('💸 Spray sent — ₡50 to author!')
  }
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: post.authorName, text: post.content ?? '', url: window.location.href }).catch(() => {})
    else showToast('🔗 Link copied!')
  }
  const handleBookmark = () => { setBookmarked(b => !b); showToast(bookmarked ? '🏷 Removed from saved' : '🔖 Saved to your shelf') }

  const accentColor = GEO_ACCENT[post.geoMin] ?? '#4ade80'

  /* view-mode flags */
  const isSpotlight = viewMode === 'spotlight' && post.heat >= 78
  const isDiscover  = viewMode === 'discover'
  const isVoiceExp  = viewMode === 'voice' && post.type === 'voice'

  return (
    <div className="ss-fade" style={{ position:'relative', margin:'8px 12px', background: isSpotlight ? 'rgba(255,215,0,.04)' : 'rgba(255,255,255,.035)', borderRadius:18, overflow:'hidden', border: isSpotlight ? '1px solid rgba(255,215,0,.25)' : isDiscover ? '1px solid rgba(74,222,128,.12)' : '1px solid rgba(255,255,255,.07)', boxShadow: isSpotlight ? '0 0 24px rgba(255,215,0,.07)' : undefined }}>
      {toast && <div style={{ position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',zIndex:50,background:'rgba(0,0,0,.85)',border:'1px solid rgba(255,255,255,.15)',borderRadius:20,padding:'5px 14px',fontSize:11,fontWeight:700,color:'#f0f5ee',whiteSpace:'nowrap',backdropFilter:'blur(8px)' }}>{toast}</div>}
      {shellPos && <div className="shell-fly" style={{ left:shellPos.x,top:shellPos.y }}>🐚</div>}

      {/* 🔥 Spotlight banner — FEAST-stage posts */}
      {isSpotlight && (
        <div style={{ background:'linear-gradient(90deg,rgba(255,69,0,.12),rgba(255,215,0,.1))', padding:'5px 14px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(255,215,0,.12)' }}>
          <span style={{ fontSize:15 }}>🔥</span>
          <span style={{ fontFamily:'Sora,sans-serif', fontSize:10, fontWeight:900, color:'#fbbf24', letterSpacing:'.06em' }}>SPOTLIGHT · ON FIRE</span>
          <span style={{ flex:1 }} />
          <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,215,0,.45)', border:'1px solid rgba(255,215,0,.2)', borderRadius:6, padding:'1px 6px' }}>FEAST</span>
        </div>
      )}

      {/* skin stripe */}
      <div style={{ height:3,background:SKINS[post.skin].color,opacity:.6 }} />

      {/* 🌍 Discover origin strip */}
      {isDiscover && (
        <div style={{ background:'rgba(74,222,128,.05)', padding:'4px 14px', display:'flex', alignItems:'center', gap:6, borderBottom:'1px solid rgba(74,222,128,.08)' }}>
          <span style={{ fontSize:9, fontWeight:700, color:'rgba(74,222,128,.6)', textTransform:'uppercase', letterSpacing:'.08em' }}>🌍 Discover</span>
          <span style={{ fontSize:9, color:'rgba(240,245,238,.2)' }}>·</span>
          <span style={{ fontSize:9, color:'rgba(240,245,238,.35)', fontWeight:600 }}>{post.village}</span>
          <span style={{ flex:1 }} />
          <span style={{ fontSize:8, fontWeight:700, color:'rgba(74,222,128,.35)', border:'1px solid rgba(74,222,128,.15)', borderRadius:5, padding:'1px 5px' }}>React Only</span>
        </div>
      )}

      {/* header */}
      <div style={{ padding:'11px 14px 0',display:'flex',alignItems:'flex-start',gap:10 }}>
        <div style={{ width:42,height:42,borderRadius:'50%',background:post.avBg,border:`2px solid ${post.avBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0,position:'relative' }}>
          {post.av}
          {post.crest && <div style={{ position:'absolute',bottom:-2,right:-2,fontSize:9,background:'#0c1009',borderRadius:'50%',width:16,height:16,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.1)' }}>{post.crest}</div>}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:700,color:'#f0f5ee',display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',lineHeight:1.3 }}>
            {post.authorName}
            {post.verified && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(74,222,128,.1)',color:'#4ade80',border:'1px solid rgba(74,222,128,.2)' }}>🛡 GREEN</span>}
            {typeTag[post.type] && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(212,160,23,.1)',color:'#fbbf24',border:'1px solid rgba(212,160,23,.2)' }}>👑 {typeTag[post.type]}</span>}
            {post.type === 'proof' && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(74,222,128,.1)',color:'#4ade80',border:'1px solid rgba(74,222,128,.2)' }}>✓ SEALED</span>}
          </div>
          <div style={{ fontSize:10,color:'rgba(240,245,238,.45)',marginTop:3,display:'flex',alignItems:'center',gap:5 }}>
            <span>{post.village}</span><span>·</span><span>{post.time}</span>
            <span>·</span>
            <span style={{ fontSize:9,fontWeight:700,color:accentColor,opacity:.7 }}>{geoReachLabel[post.geoMin]}</span>
          </div>
        </div>
        <div style={{ fontSize:18,color:'rgba(255,255,255,.3)',cursor:'pointer',padding:'0 4px',flexShrink:0 }}>⋮</div>
      </div>

      {/* TEXT */}
      {post.type === 'text' && <div style={{ padding:'10px 14px 0',fontSize:13,lineHeight:1.65,color:'rgba(240,245,238,.9)' }}>{post.content ? <HighlightedContent text={post.content} /> : null}</div>}

      {/* 🖼 GALLERY — photo grid with placeholder tiles */}
      {post.type === 'gallery' && (
        <GalleryPlaceholder post={post} />
      )}

      {/* 🎙 VOICE */}
      {post.type === 'voice' && (
        <div style={{ margin: '8px 0' }}>
          {/* Voice post gradient card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,.12), rgba(139,92,246,.08))',
            border: '1px solid rgba(139,92,246,.2)',
            borderRadius: 16, padding: '14px 14px 12px', position: 'relative', overflow: 'hidden',
          }}>
            {/* Background pulse glow */}
            {playing && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,.15) 0%, transparent 70%)',
                pointerEvents: 'none', transition: 'opacity .3s',
              }} />
            )}
            {/* Type badge */}
            <div style={{ fontSize: 9, fontWeight: 800, color: '#a78bfa', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🎙</span> VOICE STORY · {post.duration ?? '2:34'}
            </div>
            {/* Waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 44, position: 'relative' }}>
              {/* Progress fill behind bars */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: 'rgba(139,92,246,.15)', borderRadius: 4, transition: 'width .1s linear', pointerEvents: 'none' }} />
              {Array.from({ length: 28 }).map((_, i) => {
                const frac = i / 28
                const h = 8 + Math.abs(Math.sin(i * 0.8 + (progress / 100) * Math.PI * 2)) * 28
                const isPast = frac < progress / 100
                return (
                  <div key={i} className="wv-bar" style={{
                    height: playing ? h : (8 + Math.abs(Math.sin(i * 0.6)) * 22),
                    background: isPast
                      ? 'linear-gradient(180deg, #a78bfa, #7c3aed)'
                      : 'rgba(255,255,255,.18)',
                    borderRadius: 2, flex: 1, maxWidth: 4,
                    transition: playing ? 'height .08s ease' : 'none',
                  }} />
                )
              })}
            </div>
            {/* Progress bar */}
            <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,.08)', margin: '10px 0 8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', transition: 'width .1s linear' }} />
            </div>
            {/* Play controls row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={handlePlay} style={{
                width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                background: playing ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'rgba(139,92,246,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: playing ? '0 0 16px rgba(124,58,237,.5)' : 'none',
                transition: 'all .2s',
              }}>
                <span style={{ fontSize: 16 }}>{playing ? '⏸' : '▶'}</span>
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
                  {playing ? 'Playing…' : 'Tap to listen'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>
                  {post.village} · {post.skin === 'egbe' ? 'Social' : post.skin === 'ise' ? 'Work' : 'Clan'} voice
                </div>
              </div>
              {/* Spirit Voice language strip */}
              <div style={{ display: 'flex', gap: 3 }}>
                {['EN','YO','IG','HA'].map(lang => (
                  <div key={lang} onClick={() => setSvLang(lang)} style={{
                    fontSize: 8, fontWeight: 700, padding: '3px 6px', borderRadius: 4, cursor: 'pointer',
                    background: svLang === lang ? 'rgba(139,92,246,.3)' : 'rgba(255,255,255,.06)',
                    color: svLang === lang ? '#a78bfa' : 'rgba(255,255,255,.3)',
                    border: `1px solid ${svLang === lang ? 'rgba(139,92,246,.4)' : 'transparent'}`,
                    transition: 'all .15s',
                  }}>{lang}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MARKET */}
      {post.type === 'market' && (
        <div>
          <div style={{ height:180,background:'linear-gradient(135deg,#1a2808,#2a2000)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60,position:'relative' }}>
            {post.productEmoji}
            <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'8px 12px',background:'linear-gradient(transparent,rgba(0,0,0,.8))' }}>
              <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(224,123,0,.2)',color:'#fb923c',border:'1px solid rgba(224,123,0,.3)' }}>🧺 {post.location}</span>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:22,fontWeight:900,color:'#fbbf24',marginTop:2 }}>₡ {post.price?.replace('₡ ', '')}</div>
              <div style={{ fontSize:10,color:'rgba(212,160,23,.6)' }}>{post.productName}</div>
            </div>
          </div>
          <div style={{ padding:'8px 14px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.05em' }}>
              <span>Price vs Market</span>
              <span style={{ color:(post.pricePos ?? 45) < 40 ? '#4ade80' : '#f87171' }}>{(post.pricePos ?? 45) < 40 ? 'Below market ✓' : 'Fair market'}</span>
            </div>
            <div style={{ height:8,borderRadius:99,background:'linear-gradient(to right,#1a7c3e,#d4a017,#b22222)',position:'relative',marginBottom:4 }}>
              <div style={{ position:'absolute',top:-3,left:`${post.pricePos ?? 45}%`,transform:'translateX(-50%)',width:3,height:14,background:'#fff',borderRadius:99,boxShadow:'0 0 6px rgba(255,255,255,.6)' }} />
            </div>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:9 }}>
              <span style={{ color:'#4ade80' }}>Below ₡{post.marketLow}</span>
              <span style={{ color:'#fbbf24' }}>Market ₡{post.marketMid}</span>
              <span style={{ color:'#f87171' }}>Above ₡{post.marketHigh}</span>
            </div>
          </div>
          <div style={{ display:'flex',gap:6,padding:'0 14px 10px' }}>
            <button onClick={() => showToast('🤝 Opening Trade Session...')} style={{ flex:1,padding:11,borderRadius:11,background:'#1a7c3e',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif' }}>🤝 Open Trade Session</button>
            <button onClick={() => showToast('🦅 Griot is reading this post...')} style={{ flex:1,padding:11,borderRadius:11,background:'rgba(212,160,23,.15)',border:'1px solid rgba(212,160,23,.25)',color:'#fbbf24',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif' }}>🦅 Ask Griot</button>
          </div>
        </div>
      )}

      {/* PROVERB CHAIN */}
      {post.type === 'proverb' && (
        <div>
          <div style={{ padding:'12px 14px',background:'rgba(212,160,23,.05)',borderLeft:'3px solid #d4a017',margin:'10px 14px 0' }}>
            <div style={{ fontSize:13,fontStyle:'italic',color:'rgba(240,245,238,.9)',lineHeight:1.7,marginBottom:4 }}>{post.proverbRoot}</div>
            <div style={{ fontSize:10,color:'#fbbf24',fontWeight:700 }}>{post.proverbLang}</div>
          </div>
          <div style={{ padding:'8px 14px 0' }}>
            {[
              { flag:'🇬🇭', wisdom:'"Biribi wo soro na ema" — There is something above us all', lang:'Twi · Akan', hot:true },
              { flag:'🇰🇪', wisdom:'"Mkono mmoja haulei mwana" — One hand cannot raise a child', lang:'Swahili', hot:false },
              { flag:'🇿🇦', wisdom:'"Umuntu ngumuntu ngabantu" — A person is a person through others', lang:'Zulu', hot:false },
            ].map((c, i) => (
              <div key={i} style={{ display:'flex',gap:8,marginBottom:8,paddingLeft:16,borderLeft:`1px solid ${c.hot ? '#fbbf24' : 'rgba(255,255,255,.08)'}` }}>
                <span style={{ fontSize:14,flexShrink:0,marginTop:2 }}>{c.flag}</span>
                <div>
                  <div style={{ fontSize:11,fontStyle:'italic',color:c.hot ? '#fbbf24' : 'rgba(200,220,190,.8)',lineHeight:1.6 }}>{c.wisdom}</div>
                  <div style={{ fontSize:9,color:'#fbbf24',fontWeight:700,marginTop:2 }}>{c.lang}{c.hot ? ' · 🌟 Most Kíla\'d' : ''}</div>
                </div>
              </div>
            ))}
            <div onClick={() => showToast('📿 Adding your proverb to the chain...')} style={{ padding:'9px 14px',background:'rgba(212,160,23,.08)',border:'1px dashed rgba(212,160,23,.2)',borderRadius:10,textAlign:'center',fontSize:11,fontWeight:700,color:'rgba(212,160,23,.6)',cursor:'pointer',marginBottom:8 }}>
              + Chain Your Wisdom
            </div>
          </div>
        </div>
      )}

      {/* ORACLE */}
      {post.type === 'oracle' && (
        <div style={{ padding:'10px 14px 0' }}>
          <div style={{ display:'flex',gap:8,marginBottom:8,overflowX:'auto',paddingBottom:4 }}>
            {[{ av:'👤',name:'Ayo Abara',speaking:true },{ av:'👤',name:'Fatima D.',speaking:false },{ av:'👤',name:'Kwame B.',speaking:false },{ av:'🤚',name:'+312',speaking:false }].map((s, i) => (
              <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0 }}>
                <div style={{ width:44,height:44,borderRadius:'50%',background:'rgba(212,160,23,.1)',border:`2px solid ${s.speaking ? '#4ade80' : 'rgba(255,255,255,.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,boxShadow:s.speaking ? '0 0 12px rgba(74,222,128,.4)' : 'none' }}>{s.av}</div>
                <span style={{ fontSize:9,color:'rgba(255,255,255,.5)',textAlign:'center',maxWidth:50,lineHeight:1.2 }}>{s.name}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize:13,color:'rgba(240,245,238,.8)',lineHeight:1.6,marginBottom:8,fontStyle:'italic' }}>"{post.oracleContent}"</div>
          <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',marginBottom:6 }}>Audience Pulse · 4.8K listening</div>
          <div style={{ height:10,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden',display:'flex',marginBottom:4 }}>
            <div style={{ width:`${agree}%`,background:'#4ade80',borderRadius:99,transition:'width .5s ease' }} />
            <div style={{ flex:1,background:'#f87171',borderRadius:99 }} />
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:700,marginBottom:8 }}>
            <span style={{ color:'#4ade80' }}>Agree {agree}%</span>
            <span style={{ color:'#f87171' }}>Disagree {100 - agree}%</span>
          </div>
          <div style={{ display:'flex',gap:6,marginBottom:8 }}>
            {[['🤚 Raise Hand','rgba(26,124,62,.2)','#4ade80','rgba(26,124,62,.3)'],['✓ Agree','rgba(212,160,23,.15)','#fbbf24','rgba(212,160,23,.25)'],['✗ Disagree','rgba(224,123,0,.15)','#fb923c','rgba(224,123,0,.25)']].map(([l, bg, c, b], i) => (
              <button key={i} onClick={() => { if (i === 1) setAgree(a => Math.min(95, a+2)); if (i === 2) setAgree(a => Math.max(5, a-2)); showToast(i === 0 ? '🤚 Hand raised — queue: 4' : i === 1 ? `✓ Agree — ${agree+2}%` : `✗ Disagree — ${agree-2}% agree`) }} style={{ flex:1,padding:9,borderRadius:10,border:`1px solid ${b}`,background:bg,color:c,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* TRADE PROOF */}
      {post.type === 'proof' && (
        <div style={{ padding:'12px 14px',textAlign:'center' }}>
          <div style={{ fontSize:36,marginBottom:6 }}>🎉</div>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:800,color:'#4ade80',marginBottom:4 }}>Trade Sealed Successfully!</div>
          <div style={{ fontSize:12,color:'rgba(255,255,255,.6)',lineHeight:1.6 }}>{post.tradeProduct} · {post.tradeLocation}</div>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:900,color:'#fbbf24',margin:'6px 0' }}>₡ {post.tradeAmount} ✓</div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:8 }}>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:20 }}>🧺</div><div style={{ fontSize:11,fontWeight:700,color:'#f0f5ee' }}>{post.tradeBuyer}</div><div style={{ fontSize:9,color:'rgba(255,255,255,.4)' }}>Buyer</div></div>
            <span style={{ fontSize:20,color:'rgba(74,222,128,.4)' }}>→</span>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:20 }}>🌾</div><div style={{ fontSize:11,fontWeight:700,color:'#f0f5ee' }}>{post.tradeSeller ?? 'Seller'}</div><div style={{ fontSize:9,color:'rgba(255,255,255,.4)' }}>Seller</div></div>
          </div>
        </div>
      )}

      {/* NOTICE */}
      {post.type === 'notice' && (
        <div>
          <div style={{ background:'linear-gradient(135deg,#2a2000,#1a1800)',padding:'10px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(212,160,23,.15)' }}>
            <span style={{ fontSize:22 }}>📯</span>
            <div>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:11,fontWeight:700,color:'#fbbf24',textTransform:'uppercase',letterSpacing:'.06em' }}>Village Notice</div>
              <div style={{ fontSize:10,color:'rgba(212,160,23,.6)',marginTop:1 }}>From {post.authorName} · Crest {post.crest}</div>
            </div>
          </div>
          <div style={{ padding:'10px 14px 0',fontSize:13,lineHeight:1.65,color:'rgba(240,245,238,.85)' }}>{post.noticeContent}</div>
        </div>
      )}

      {/* EVENT DRUM */}
      {post.type === 'event' && (() => {
        let ev: Record<string, unknown> | null = null
        try { ev = post.eventPayload ? JSON.parse(post.eventPayload) : null } catch {}
        if (!ev) return null
        const tiers = (ev.tiers as { name:string; price:number; available:number }[]) ?? []
        const lowestPrice = tiers.length ? Math.min(...tiers.map(t => t.price)) : 0
        const totalAvail  = tiers.reduce((s, t) => s + t.available, 0)
        const isSoldOut   = totalAvail === 0
        const dateObj     = new Date(ev.date as string)
        const vcol        = ev.villageColor as string ?? '#4ade80'
        return (
          <div>
            <div style={{ height:130,background:`linear-gradient(135deg,${vcol}25,${vcol}08)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:58,position:'relative',borderTop:'1px solid rgba(255,255,255,.04)' }}>
              {ev.coverEmoji as string}
              <div style={{ position:'absolute',top:9,left:11,padding:'3px 9px',borderRadius:99,fontSize:9,fontWeight:800,background:'rgba(239,68,68,.18)',color:'#ef4444',border:'1px solid rgba(239,68,68,.3)',display:'flex',alignItems:'center',gap:4 }}>
                <span style={{ width:5,height:5,borderRadius:'50%',background:'#ef4444',display:'inline-block' }} />LIVE
              </div>
              {ev.drumScope === 'JOLLOF_TV' && <div style={{ position:'absolute',top:9,right:11,padding:'3px 8px',borderRadius:99,fontSize:9,fontWeight:700,background:'rgba(239,68,68,.15)',color:'#ef4444',border:'1px solid rgba(239,68,68,.25)' }}>📺 JOLLOF TV</div>}
              {ev.drumScope === 'NATION' && <div style={{ position:'absolute',top:9,right:11,padding:'3px 8px',borderRadius:99,fontSize:9,fontWeight:700,background:'rgba(74,222,128,.12)',color:'#4ade80',border:'1px solid rgba(74,222,128,.2)' }}>🌍 Nation-wide</div>}
            </div>
            <div style={{ padding:'12px 14px 6px' }}>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:900,color:'#f0f7f0',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ev.title as string}</div>
              <div style={{ display:'flex',gap:8,fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:8,flexWrap:'wrap' }}>
                <span>📅 {dateObj.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                <span style={{ color:'rgba(255,255,255,.2)' }}>·</span>
                <span>📍 {(ev.venueName as string)?.split(',')[0]}</span>
                <span style={{ color:'rgba(255,255,255,.2)' }}>·</span>
                <span style={{ color:vcol }}>{ev.villageEmoji as string} {ev.village as string}</span>
              </div>
              <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:10 }}>
                {tiers.map(t => (
                  <span key={t.name} style={{ fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:99,background:t.available === 0 ? 'rgba(107,114,128,.12)' : 'rgba(74,222,128,.08)',color:t.available === 0 ? '#6b7280' : '#4ade80',border:`1px solid ${t.available === 0 ? 'rgba(107,114,128,.2)' : 'rgba(74,222,128,.2)'}` }}>
                    {t.name}: {t.price === 0 ? 'FREE' : `🐚 ${t.price.toLocaleString()}`}{t.available === 0 ? ' · SOLD OUT' : ` · ${t.available} left`}
                  </span>
                ))}
              </div>
              <div style={{ display:'flex',gap:7,marginBottom:4 }}>
                <button onClick={() => { if (typeof window !== 'undefined') window.location.href = `/dashboard/events/${ev.eventId}` }} style={{ flex:2,padding:'10px',borderRadius:11,border:'none',cursor:'pointer',background:isSoldOut ? 'rgba(107,114,128,.15)' : `linear-gradient(135deg,${vcol}cc,${vcol}88)`,color:isSoldOut ? '#6b7280' : '#fff',fontSize:11,fontWeight:800,fontFamily:'Sora,sans-serif' }}>
                  {isSoldOut ? '⏳ Join Waiting Compound' : `🎟 Get Tickets — ${lowestPrice === 0 ? 'FREE' : `from 🐚 ${lowestPrice.toLocaleString()}`}`}
                </button>
                <button onClick={() => { if (typeof window !== 'undefined') window.location.href = `/dashboard/events/${ev.eventId}` }} style={{ flex:1,padding:'10px',borderRadius:11,border:`1px solid ${vcol}35`,background:'none',color:vcol,fontSize:11,fontWeight:700,cursor:'pointer' }}>Info →</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* heat bar */}
      <HeatBar pct={post.heat} />

      {/* scope */}
      <div style={{ display:'flex',alignItems:'center',gap:5,padding:'4px 14px 8px',fontSize:10,color:'rgba(255,255,255,.4)' }}>
        <span>Reach:</span>
        <span style={{ fontWeight:700,color:'#fbbf24',background:'rgba(212,160,23,.1)',borderRadius:99,padding:'2px 8px' }}>{scopeLabel[post.scope]}</span>
      </div>

      {/* 🌍 DISCOVER interactions — ubuntu is primary, no drum/create */}
      {isDiscover ? (
        <div style={{ padding:'8px 14px 10px' }}>
          {/* Ubuntu primary CTA */}
          <button
            onClick={() => { sorosokeApi.ubuntu(post.id).catch(()=>{}); showToast('🤝 Ubuntu — "I am because we are"') }}
            style={{ width:'100%', padding:'10px', borderRadius:12, border:'1px solid rgba(74,222,128,.2)', background:'linear-gradient(135deg,rgba(26,124,62,.2),rgba(74,222,128,.08))', color:'#4ade80', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'DM Sans,sans-serif', marginBottom:7, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
          >
            <span style={{ fontSize:16 }}>🤝</span>
            Ubuntu · {post.ubuntu ?? 0} — "I am because we are"
          </button>
          {/* Secondary row */}
          <div style={{ display:'flex', gap:5 }}>
            {[
              { label:`⭐ Kíla ${kilaN}`,    lit:kilaLit, litBg:'rgba(255,215,0,.12)', litC:'#fbbf24', litBorder:'rgba(255,215,0,.25)', action:handleKila },
              { label:`🔥 Stir ${post.stir}`, lit:false, action:() => { sorosokeApi.stir(post.id).catch(()=>{}); showToast('🔥 Stirred!') } },
              { label:'💸 Spray',              lit:false, action:handleSpray },
              { label:'↗ Share',               lit:false, action:handleShare },
            ].map(({ label, lit, litBg, litC, litBorder, action }, i) => (
              <button key={i} onClick={action as React.MouseEventHandler} style={{ flex:1, padding:'6px 4px', borderRadius:99, fontSize:9, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', border:`1px solid ${lit && litBorder ? litBorder : 'rgba(255,255,255,.08)'}`, background:lit && litBg ? litBg : 'rgba(255,255,255,.03)', color:lit && litC ? litC : 'rgba(255,255,255,.4)', fontFamily:'DM Sans,sans-serif', textAlign:'center' }}>{label}</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 5 interactions */}
          <div style={{ display:'flex',gap:4,padding:'0 14px 8px',overflowX:'auto',flexWrap:'nowrap' }}>
            {[
              { key:'kila',   label:`⭐ Kíla ${kilaN}`,          lit:kilaLit, litBg:'rgba(255,215,0,.12)',   litC:'#fbbf24', litBorder:'rgba(255,215,0,.25)',    action:handleKila },
              { key:'stir',   label:`🔥 Stir ${post.stir}`,      lit:false,   action:() => { sorosokeApi.stir(post.id).catch(()=>{}); showToast('🔥 Stirred! Heat rising.') } },
              { key:'drum',   label:`🥁 Drum ${post.drum}`,      lit:false,   action:() => { sorosokeApi.drum(post.id, { content:'' }).catch(()=>{}); showToast('🥁 Drum sent! Author must approve.') } },
              { key:'ubuntu', label:'🤝 Ubuntu',                  lit:false,   action:() => { sorosokeApi.ubuntu(post.id).catch(()=>{}); showToast('🤝 Ubuntu — "I am because we are"') } },
              { key:'spray',  label:`💸 Spray ${post.spray ?? 0}`,lit:false,  action:handleSpray },
            ].map(({ key, label, lit, litBg, litC, litBorder, action }) => (
              <button key={key} onClick={action as React.MouseEventHandler} style={{
                display:'flex', alignItems:'center', gap:4, padding:'6px 9px', borderRadius:99,
                fontSize:10, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
                border:`1px solid ${lit && litBorder ? litBorder : 'rgba(255,255,255,.08)'}`,
                background: lit && litBg ? litBg : 'rgba(255,255,255,.03)',
                color: lit && litC ? litC : 'rgba(255,255,255,.45)',
                fontFamily:'DM Sans,sans-serif',
              }}>{label}</button>
            ))}
          </div>

          {/* secondary row */}
          <div style={{ display:'flex',gap:8,padding:'0 14px 12px',borderTop:'1px solid rgba(255,255,255,.04)',paddingTop:8 }}>
            <button onClick={() => setCommentOpen(true)} style={{ display:'flex',alignItems:'center',gap:3,padding:'5px 8px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'rgba(255,255,255,.35)' }}>
              💬 Comment
            </button>
            <button onClick={handleShare} style={{ display:'flex',alignItems:'center',gap:3,padding:'5px 8px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'rgba(255,255,255,.35)' }}>
              ↗ Share
            </button>
            <button onClick={handleBookmark} style={{ display:'flex',alignItems:'center',gap:3,padding:'5px 8px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:`1px solid ${bookmarked ? 'rgba(251,191,36,.35)' : 'rgba(255,255,255,.08)'}`,background:bookmarked ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.03)',color:bookmarked ? '#fbbf24' : 'rgba(255,255,255,.3)' }}>
              {bookmarked ? '🔖 Saved' : '🏷 Save'}
            </button>
            <span style={{ marginLeft:'auto',fontSize:9,color:'rgba(255,255,255,.2)' }}>🔥 {post.heat}</span>
          </div>
        </>
      )}
      <CommentSheet open={commentOpen} onClose={() => setCommentOpen(false)} postId={post.id} postPreview={post.content ?? post.proverbRoot ?? post.noticeContent} />
    </div>
  )
}
