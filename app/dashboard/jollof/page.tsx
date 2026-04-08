'use client'
// ═══════════════════════════════════════════════════════════════════
// JOLLOF TV — African Broadcast Network · 24/7
// Faithful React implementation of the prototype HTML
// Guide · Station A (Reality) · Station B (Reels) · Station C (Broadcast)
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'
import { useAuthStore } from '@/stores/authStore'
import TVControlPanel from '@/components/jollof/TVControlPanel'

/* ── inject-once CSS ── */
const CSS_ID = 'jollof-css'
const CSS = `
@keyframes jfFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes livePulse{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes shine{0%{left:-100%}100%{left:200%}}
@keyframes cowFloat{0%{opacity:1;transform:translateY(0) rotate(0deg) scale(1)}70%{opacity:.9;transform:translateY(-280px) rotate(180deg) scale(1.3)}100%{opacity:0;transform:translateY(-420px) rotate(360deg) scale(.3)}}
@keyframes cfIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes progFill{from{width:0}to{width:var(--target)}}
.jf-fade{animation:jfFade .35s ease both}
.live-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;animation:livePulse .7s ease-in-out infinite;display:inline-block;flex-shrink:0}
.live-dot-g{background:#4ade80 !important}
.ticker-inner{display:flex;animation:ticker 26s linear infinite;white-space:nowrap}
.cow-shell{position:absolute;font-size:22px;animation:cowFloat 2s ease-out forwards;pointer-events:none}
.cf-in{animation:cfIn .3s ease}
`

type StationView = 'guide'|'stationA'|'stationB'|'stationC'

/* ═══════════════════════════════════════════════════════════════════
   SCHEDULE DATA
═══════════════════════════════════════════════════════════════════ */
const SCHEDULE = [
  { time:'06:00', village:'🌾 Agriculture', title:'Morning Farm Report', type:'broadcast', ai:true,  dur:'30m' },
  { time:'06:30', village:'🌾 Agriculture', title:'Live Auction — Tomatoes & Cocoa', type:'live', ai:false, dur:'90m' },
  { time:'08:00', village:'🧺 Commerce',    title:'Market Watch — Weekly Price Index', type:'broadcast', ai:true, dur:'60m' },
  { time:'09:00', village:'🧺 Commerce',    title:'Mama Adaeze: Fashion Live Stream', type:'live', ai:false, dur:'60m' },
  { time:'10:00', village:'⚕ Health',       title:'Dr. Ngozi: Understanding Malaria [YO/IG/HA]', type:'broadcast', ai:false, dur:'60m' },
  { time:'11:00', village:'⚕ Health',       title:'Community Health Q&A', type:'live', ai:false, dur:'60m' },
  { time:'12:00', village:'🎓 Education',   title:'African Mathematics: The Yoruba System', type:'broadcast', ai:true, dur:'60m' },
  { time:'13:00', village:'🎓 Education',   title:'Swahili Language School', type:'broadcast', ai:true, dur:'60m' },
  { time:'14:00', village:'🎨 Arts',        title:'Kente Weaving Live — Commission Open', type:'live', ai:false, dur:'120m' },
  { time:'16:00', village:'🏛 Government',  title:'Village Council Debate — Cocoa Price Floor', type:'broadcast', ai:false, dur:'60m' },
  { time:'17:00', village:'💰 Finance',     title:'Cowrie Wallet Tips: Growing Your Ubuntu Score', type:'broadcast', ai:true, dur:'60m' },
  { time:'18:00', village:'🌍 Nation Square',title:'PRIME TIME: Oracle Session — All 20 Villages', type:'live', ai:false, dur:'120m' },
  { time:'20:00', village:'🎉 Reality',     title:'The Real Village — Reality Show S2E8', type:'broadcast', ai:false, dur:'120m' },
  { time:'22:00', village:'🌙 Night Market',title:'Night Commerce Stream: Traders & Buyers', type:'live', ai:false, dur:'120m' },
  { time:'00:00', village:'🤖 AI Griot',    title:'Griot Orunmila: African History & Wisdom', type:'broadcast', ai:true, dur:'120m' },
]

const REELS = [
  { id:'r1', type:'market',    emoji:'👗', color:'#e07b00', colorBg:'rgba(224,123,0,.15)',   streamer:'Mama Adaeze', village:'🧺 Commerce', viewers:'1,421', label:'🧺 Commerce · Station B', desc:'Live fashion show — Ankara collection 2026. 10 yards at ₡4,500 NOW.', product:'Ankara Fabric · 6 yards', price:'₡ 4,500', kila:234, spray:89, drum:45 },
  { id:'r2', type:'farm',      emoji:'🌾', color:'#1a7c3e', colorBg:'rgba(26,124,62,.15)',    streamer:'Kofi Mensah · Mwea Farm', village:'🌾 Agriculture', viewers:'334', label:'🌾 Agriculture · Station B', desc:'Live harvest auction — 850 bags of maize. Market price showing NOW.', kila:67, spray:22, drum:31 },
  { id:'r3', type:'health',    emoji:'⚕',  color:'#0369a1', colorBg:'rgba(3,105,161,.15)',    streamer:'Dr. Ngozi Eze', village:'⚕ Health', viewers:'892', label:'⚕ Health · Station B', desc:'Understanding malaria in children under 5. LIVE translation in 5 languages.', sv:'Spirit Voice: Auto-translating to YO · IG · HA · SW', kila:445, spray:0, drum:167 },
  { id:'r4', type:'oracle',    emoji:'⚡', color:'#d4a017', colorBg:'rgba(212,160,23,.15)',   streamer:'Oracle Council · All Villages', village:'🏛 Government', viewers:'4,821', label:'🏛 Nation · Station B', desc:'LIVE: Should agriculture villages set cocoa price floors across West Africa?', topic:'"West Africa Cocoa Price Floor"', agree:68, kila:890, spray:340, drum:445 },
  { id:'r5', type:'craft',     emoji:'🧵', color:'#7c3aed', colorBg:'rgba(124,58,237,.15)',   streamer:'Kofi the Kente Master', village:'🎨 Arts', viewers:'2,147', label:'🎨 Arts · Station B', desc:'Kente cloth weaving — 78% complete. Commission this piece or order yours.', progress:78, kila:1200, spray:567, drum:234 },
  { id:'r6', type:'knowledge', emoji:'📚', color:'#4f46e5', colorBg:'rgba(79,70,229,.15)',    streamer:'Prof. Amara Osei', village:'🎓 Education', viewers:'2,100', label:'🎓 Education · Station B', desc:'African Mathematics: Yoruba counting predates Roman numerals by 1,000 years.', sv:'80 in Yoruba (4×20). The vigesimal system of ancient Africa.', kila:678, spray:89, drum:312 },
]

const VILLAGE_BLOCKS = [
  { village:'🌾 Agriculture Village', time:'06:00–08:00', slots:[{title:'Morning Farm Report',type:'broadcast',ai:true,dur:'30m'},{title:'Live Harvest Auction',type:'live',ai:false,dur:'90m'}] },
  { village:'🧺 Commerce Village', time:'08:00–10:00', slots:[{title:'Market Price Watch',type:'broadcast',ai:true,dur:'60m'},{title:'Fashion Live — Mama Adaeze',type:'live',ai:false,dur:'60m'}] },
  { village:'⚕ Health Village', time:'10:00–12:00', slots:[{title:'Dr. Ngozi: Malaria Q&A [5 languages]',type:'broadcast',ai:false,dur:'60m'},{title:'Community Health Helpline LIVE',type:'live',ai:false,dur:'60m'}] },
  { village:'🎓 Education Village', time:'12:00–14:00', slots:[{title:'African Mathematics: The Yoruba System',type:'broadcast',ai:true,dur:'60m'},{title:'Swahili Language School',type:'broadcast',ai:true,dur:'60m'}] },
  { village:'🌍 Nation Square', time:'18:00–20:00', slots:[{title:'PRIME TIME: Oracle Session',type:'live',ai:false,dur:'120m'}] },
  { village:'🎉 Reality Village', time:'20:00–22:00', slots:[{title:'The Real Village — S2E8',type:'broadcast',ai:false,dur:'120m'}] },
  { village:'🤖 AI Griot Hour', time:'00:00–02:00', slots:[{title:'Griot Orunmila: African Wisdom',type:'broadcast',ai:true,dur:'120m'}] },
]

function injectCSS() {
  if(typeof document==='undefined' || document.getElementById(CSS_ID)) return
  const s=document.createElement('style'); s.id=CSS_ID; s.textContent=CSS
  document.head.appendChild(s)
}

/* ── shared live ticker strip ── */
function LiveTicker({ onBack, label, color }: { onBack?:()=>void; label:string; color:string }) {
  const text = '📡 NOW LIVE  ·  Mama Adaeze Fashion 1,421 viewers  ·  Dr. Ngozi Health Talk 892  ·  Kente Weaving Commission Open  ·  Oracle Session 4.8K  ·  Night Market Commerce  ·  AI Griot Wisdom 2AM  ·  '
  return (
    <div style={{ background:'linear-gradient(90deg,#1a0500,#1a1000,#1a0500)',borderBottom:'1px solid rgba(212,160,23,.15)',padding:'8px 14px',display:'flex',alignItems:'center',gap:8,flexShrink:0,overflow:'hidden' }}>
      {onBack && <div onClick={onBack} style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,cursor:'pointer',flexShrink:0 }}>←</div>}
      <span style={{ fontSize:10,fontWeight:700,color:'#fbbf24',textTransform:'uppercase',letterSpacing:'.08em',flexShrink:0 }}>{label}</span>
      <div style={{ width:1,height:14,background:'rgba(212,160,23,.2)',flexShrink:0 }} />
      <div style={{ flex:1,overflow:'hidden',position:'relative' }}>
        <div className="ticker-inner" style={{ fontSize:11,color:'rgba(255,255,255,.55)',gap:0 }}>{text}{text}</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   GUIDE SCREEN
═══════════════════════════════════════════════════════════════════ */
function GuideScreen({ onStation, schedule, channels }: { onStation:(s:StationView)=>void; schedule?: any[]; channels?: any[] }) {
  const router = useRouter()
  const [reminders, setReminders] = React.useState<Record<number,boolean>>({})
  const displaySchedule = React.useMemo(() => {
    if (!schedule || schedule.length === 0) return SCHEDULE
    return schedule.map((s: any) => ({
      time: s.startTime ? new Date(s.startTime).toISOString().slice(11,16) : (s.time ?? '00:00'),
      village: s.villageName ?? s.channelName ?? '🌍 Village',
      title: s.programTitle ?? s.title ?? 'Programme',
      type: s.isLive ? 'live' : (s.type ?? 'broadcast'),
      ai: s.isAiGenerated ?? s.ai ?? false,
      dur: s.durationMinutes ? `${s.durationMinutes}m` : (s.dur ?? '60m'),
    }))
  }, [schedule])

  // Channel browser — group by master vs village
  const masterChannels = React.useMemo(() => (channels ?? []).filter((c: any) => c.type !== 'VILLAGE'), [channels])
  const villageChannels = React.useMemo(() => (channels ?? []).filter((c: any) => c.type === 'VILLAGE'), [channels])

  const CH_EMOJI: Record<string, string> = {
    MAIN:'📺',REALITY:'🎭',BUSINESS:'🧺',EDUCATION:'🎓',GOVERNMENT:'🏛',
    ENTERTAINMENT:'🎉',SPORTS:'⚽',NEWS:'📡',DOCUMENTARY:'🎬',KIDS:'🧸',
    MUSIC:'🎵',RELIGION:'🕯',VILLAGE:'🏘',EVENT:'🎪',
  }
  const V_EMO: Record<string,string> = {
    health:'⚕',agriculture:'🌾',education:'🎓',justice:'⚖️',finance:'💰',builders:'🏗',
    technology:'💻',arts:'🎨',media:'📡',commerce:'🧺',security:'🛡',spirituality:'🕯',
    fashion:'👗',family:'👨‍👩‍👧‍👦',transport:'🚌',energy:'⚡',hospitality:'🏨',government:'🏛',sports:'⚽',holdings:'👑',
  }
  const CH_COLOR: Record<string,string> = {
    MAIN:'#4ade80',REALITY:'#c084fc',BUSINESS:'#fb923c',EDUCATION:'#60a5fa',
    GOVERNMENT:'#a78bfa',ENTERTAINMENT:'#f472b6',SPORTS:'#34d399',NEWS:'#ef4444',
    DOCUMENTARY:'#a3e635',KIDS:'#fcd34d',MUSIC:'#e879f9',RELIGION:'#fde68a',VILLAGE:'#fbbf24',EVENT:'#38bdf8',
  }

  const STATIONS = [
    { id:'stationA' as StationView, emoji:'🎭', num:'Station A', name:'Masquerade Square', now:'The Real Village · S2 E8', viewers:'2.4K', color:'#e07b00' },
    { id:'stationB' as StationView, emoji:'📡', num:'Station B',  name:'LIVE',              now:'6 live streams now',       viewers:'6.8K', color:'#b22222' },
    { id:'stationC' as StationView, emoji:'📺', num:'Station C',  name:'Village Broadcast', now:'Oracle Session LIVE',      viewers:'1.2K', color:'#d4a017' },
  ]

  return (
    <div style={{ flex:1,overflowY:'auto' }}>
      {/* 3 station cards */}
      <div style={{ padding:'10px 14px 0' }}>
        <div style={{ fontFamily:'Sora, sans-serif',fontSize:13,fontWeight:800,color:'#f0f5ee',marginBottom:8,display:'flex',alignItems:'center',gap:6 }}>
          Three Stations <em style={{ fontStyle:'normal',fontSize:10,fontWeight:600,color:'rgba(255,255,255,.4)' }}>Tap to watch</em>
        </div>
        <div style={{ display:'flex',gap:8,marginBottom:12 }}>
          {STATIONS.map(st=>(
            <div key={st.id} className="jf-fade" onClick={()=>onStation(st.id)} style={{ flex:1,borderRadius:14,border:`1.5px solid ${st.color}33`,background:`${st.color}0a`,cursor:'pointer',overflow:'hidden',transition:'all .22s' }}>
              <div style={{ height:90,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:`linear-gradient(135deg,${st.color}28,transparent)` }}>
                <span style={{ fontSize:40,position:'relative',zIndex:1 }}>{st.emoji}</span>
                <div style={{ position:'absolute',top:6,left:6,display:'flex',alignItems:'center',gap:3,background:'rgba(0,0,0,.7)',padding:'3px 7px',borderRadius:99 }}>
                  <span className="live-dot" style={{ width:5,height:5 }} /><span style={{ fontSize:8,fontWeight:700,color:'#fff' }}>LIVE</span>
                </div>
                <div style={{ position:'absolute',top:6,right:6,fontSize:8,fontWeight:700,color:'rgba(255,255,255,.7)',background:'rgba(0,0,0,.6)',padding:'2px 6px',borderRadius:99 }}>👁 {st.viewers}</div>
              </div>
              <div style={{ padding:'8px 10px' }}>
                <div style={{ fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:st.color,marginBottom:2 }}>{st.num}</div>
                <div style={{ fontFamily:'Sora, sans-serif',fontSize:11,fontWeight:800,color:'#f0f5ee',lineHeight:1.3 }}>{st.name}</div>
                <div style={{ fontSize:9,color:'rgba(255,255,255,.45)',marginTop:2 }}>{st.now}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* quick actions */}
      <div style={{ display:'flex',gap:6,padding:'0 14px',marginBottom:12 }}>
        <button onClick={()=>onStation('stationB')} style={{ flex:1,padding:'11px',borderRadius:11,background:'#b22222',border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif' }}>▶ Watch Live Now</button>
        <button onClick={()=>onStation('stationC')} style={{ flex:1,padding:'11px',borderRadius:11,background:'rgba(212,160,23,.15)',border:'1px solid rgba(212,160,23,.25)',color:'#fbbf24',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif' }}>📋 Today's Schedule</button>
      </div>

      {/* ── Channel Browser ── */}
      {(channels ?? []).length > 0 && (
        <>
          {/* Master Channels */}
          <div style={{ padding:'6px 14px 4px',fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:700,color:'rgba(255,255,255,.4)',display:'flex',alignItems:'center',gap:6,textTransform:'uppercase',letterSpacing:'.07em' }}>
            📺 Master Channels · {masterChannels.length} <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }} />
          </div>
          <div style={{ display:'flex',gap:6,padding:'4px 14px 8px',overflowX:'auto',scrollbarWidth:'none' }}>
            {masterChannels.map((ch: any)=>{
              const clr = CH_COLOR[ch.type] || '#94a3b8'
              const emo = CH_EMOJI[ch.type] || '📻'
              return (
                <div key={ch.id} onClick={()=>router.push(`/dashboard/jollof/guide`)} style={{ minWidth:100,padding:'10px 12px',borderRadius:12,border:`1px solid ${clr}33`,background:`${clr}0a`,cursor:'pointer',textAlign:'center',flexShrink:0 }}>
                  <div style={{ fontSize:24,marginBottom:4 }}>{emo}</div>
                  <div style={{ fontSize:10,fontWeight:700,color:clr,marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{ch.name.replace(/_/g,' ')}</div>
                  <div style={{ fontSize:8,color:'rgba(255,255,255,.35)' }}>{ch.type}</div>
                  {ch.isLive && <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:3,marginTop:4 }}><span className="live-dot" style={{ width:5,height:5 }} /><span style={{ fontSize:8,fontWeight:700,color:'#ef4444' }}>LIVE</span></div>}
                </div>
              )
            })}
          </div>

          {/* Village Channels */}
          <div style={{ padding:'6px 14px 4px',fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:700,color:'rgba(255,255,255,.4)',display:'flex',alignItems:'center',gap:6,textTransform:'uppercase',letterSpacing:'.07em' }}>
            🏘 Village Channels · {villageChannels.length} <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }} />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:6,padding:'4px 14px 12px' }}>
            {villageChannels.map((ch: any)=>{
              const vEmoji = V_EMO[ch.villageId] || '🏘'
              return (
                <div key={ch.id} onClick={()=>router.push(`/dashboard/jollof/guide`)} style={{ padding:'8px 6px',borderRadius:10,border:'1px solid rgba(251,191,36,.15)',background:'rgba(251,191,36,.04)',cursor:'pointer',textAlign:'center' }}>
                  <div style={{ fontSize:18,marginBottom:2 }}>{vEmoji}</div>
                  <div style={{ fontSize:8,fontWeight:700,color:'#fbbf24',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{(ch.villageId || ch.name).replace('VILLAGE_','').replace(/_/g,' ')}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* 24hr schedule */}
      <div style={{ padding:'6px 14px',fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:700,color:'rgba(255,255,255,.4)',display:'flex',alignItems:'center',gap:6,textTransform:'uppercase',letterSpacing:'.07em' }}>
        Today's Programme · All 20 Villages  <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }} />
      </div>
      {displaySchedule.map((p,i)=>{
        const isNow = i===3
        const stC = p.type==='live'?'#b22222':p.ai?'#7c3aed':'#d4a017'
        return (
          <div key={i} onClick={()=>router.push('/dashboard/jollof/guide')} style={{ display:'flex',gap:8,padding:'4px 14px',borderBottom:'1px solid rgba(255,255,255,.04)',cursor:'pointer',transition:'background .15s' }}>
            <span style={{ fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,.4)',width:46,flexShrink:0,paddingTop:8 }}>{p.time}</span>
            <div style={{ width:3,borderRadius:99,background:stC,flexShrink:0,alignSelf:'stretch',margin:'4px 0' }} />
            <div style={{ flex:1,padding:'6px 0' }}>
              <div style={{ fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:700,color:'#f0f5ee',lineHeight:1.3 }}>{p.title}</div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,.4)',marginTop:2 }}>{p.village} · {p.dur}</div>
              <div style={{ display:'flex',gap:4,marginTop:4,flexWrap:'wrap' }}>
                {isNow && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(239,68,68,.12)',color:'#f87171',border:'1px solid rgba(239,68,68,.2)' }}>● NOW LIVE</span>}
                {p.type==='live' && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(239,68,68,.12)',color:'#f87171',border:'1px solid rgba(239,68,68,.2)' }}>📡 LIVE</span>}
                {p.ai && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(124,58,237,.12)',color:'#c084fc',border:'1px solid rgba(124,58,237,.2)' }}>🤖 AI Generated</span>}
                {!p.type.includes('live') && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(26,124,62,.1)',color:'#4ade80',border:'1px solid rgba(26,124,62,.2)' }}>📺 Broadcast</span>}
              </div>
            </div>
            <div style={{ flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,paddingTop:6 }}>
              {isNow ? <span style={{ fontSize:8,fontWeight:700,background:'#ef4444',color:'#fff',borderRadius:99,padding:'2px 7px' }}>ON AIR</span> : <span onClick={(e)=>{e.stopPropagation();setReminders(r=>({...r,[i]:!r[i]}))}} style={{ fontSize:10,color:reminders[i]?'#4ade80':'rgba(255,255,255,.3)',cursor:'pointer' }}>{reminders[i]?'✅':'🔔'}</span>}
              {p.ai && <span style={{ fontSize:8,fontWeight:700,background:'rgba(124,58,237,.15)',color:'#c084fc',borderRadius:99,padding:'2px 7px' }}>AI</span>}
            </div>
          </div>
        )
      })}
      <div style={{ height:20 }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   STATION A — VILLAGE REALITY
═══════════════════════════════════════════════════════════════════ */
const CHAT_POOL = [
  {av:'🧺',c:'#fb923c',name:'Chioma',msg:'This is peak African TV!! 🙌'},
  {av:'🌾',c:'#4ade80',name:'Kofi',msg:'Real village things — we need this every night!'},
  {av:'⚕',c:'#7dd3fc',name:'Dr.Ngozi',msg:'Mama Ngozi speaking facts as always'},
  {av:'🎨',c:'#c084fc',name:'Ayo',spray:'₡ 500'},
  {av:'🧔',c:'#fbbf24',name:'Papa Emeka',msg:'This is real African culture, not Hollywood'},
  {av:'🌍',c:'#4ade80',name:'Amara',msg:'Broadcasting from Nairobi 🇰🇪'},
  {av:'👑',c:'#fb923c',name:'Fatima',spray:'₡ 200'},
  {av:'🧺',c:'#fb923c',name:'Chioma',msg:'Real village things! No scripts here'},
]

function StationA({ onBack, activeShow, leaderboard: showLeaderboard }: { onBack:()=>void; activeShow?: any; leaderboard?: any[] }) {
  const router = useRouter()
  type ChatMsg = { id:number; av:string; c:string; name:string; msg?:string; spray?:string }
  const [chat,setChat] = React.useState<ChatMsg[]>([
    {id:1,av:'🧺',c:'#fb923c',name:'Chioma',msg:'Mama Ngozi just said that! 😂'},
    {id:2,av:'🌾',c:'#4ade80',name:'Kofi',msg:'Real village things! No scripts here'},
    {id:3,av:'⚕',c:'#7dd3fc',name:'Dr.Ngozi',msg:'I know these people 😭'},
    {id:4,av:'🎨',c:'#c084fc',name:'Ayo',spray:'₡ 500'},
    {id:5,av:'🧔',c:'#fbbf24',name:'Papa Emeka',msg:'This is authentic African living'},
  ])
  const [sprays,setSprays] = React.useState<{id:number;x:number}[]>([])
  const [viewers,setViewers] = React.useState(2421)
  const [toast,setToast] = React.useState('')
  const [joinRequested,setJoinRequested] = React.useState(false)
  const [voted,setVoted] = React.useState(false)
  const [drummed,setDrummed] = React.useState(false)

  React.useEffect(()=>{
    const iv = setInterval(()=>{
      const c = CHAT_POOL[Math.floor(Math.random()*CHAT_POOL.length)]
      setChat(prev=>[{...c,id:Date.now()},...prev].slice(0,8))
      setViewers(v=>v+Math.floor(Math.random()*5-1))
    },2800)
    return ()=>clearInterval(iv)
  },[])

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2500)}

  const doSpray=()=>{
    const showId = activeShow?.id
    if (showId) jollofTvApi.spray(showId, 500).catch((e)=>logApiFailure('jollof/spray',e))
    setSprays(Array.from({length:7},(_,i)=>({id:Date.now()+i,x:10+Math.random()*80})))
    setTimeout(()=>setSprays([]),2200)
    showToast('💸 ₡500 Sprayed! Golden cowrie shells flying 🪙')
  }

  const doVote=()=>{
    if (voted) return
    setVoted(true)
    if (activeShow?.id) {
      jollofTvApi.realityVote(activeShow.id, { contestantId: 'current', voterId: 'me' }).catch((e)=>logApiFailure('jollof/vote',e))
    }
    showToast('✓ Voted — 69% now agree')
  }

  const doJoinStage=()=>{
    if (joinRequested) return
    setJoinRequested(true)
    showToast('🤚 Join request sent — queue: 4')
  }

  const doDrum=()=>{
    if (drummed) return
    setDrummed(true)
    if (activeShow?.id) jollofTvApi.kila(activeShow.id).catch((e)=>logApiFailure('jollof/kila',e))
    showToast('🥁 Drummed to Village!')
    setTimeout(()=>setDrummed(false),5000)
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',flex:1,overflow:'hidden',background:'#070900' }}>
      {toast && <div style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:'#151e12',border:'1px solid rgba(74,222,128,.2)',borderRadius:12,padding:'8px 16px',fontSize:12,fontWeight:600,color:'#f0f5ee',zIndex:300,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.6)' }}>{toast}</div>}
      {/* prog bar */}
      <div style={{ background:'#111a0d',padding:'6px 14px',flexShrink:0 }}>
        <div style={{ background:'rgba(255,255,255,.04)',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontSize:16 }}>🎭</span>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:700,color:'#f0f5ee',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{activeShow?.title ?? 'The Real Village — Season 2, Episode 8'}</div>
            <div style={{ fontSize:10,color:'rgba(255,255,255,.4)',marginTop:1 }}>{activeShow?.description ? `Live Reality Show · ${activeShow.description}` : 'Live Reality Show · Commerce Village · 2h 14min remaining'}</div>
          </div>
          <span style={{ fontSize:9,fontWeight:700,color:'#fbbf24',border:'1px solid rgba(212,160,23,.2)',borderRadius:99,padding:'2px 8px',flexShrink:0 }}>NEXT: Farm Life S3</span>
        </div>
      </div>
      {/* video stage */}
      <div style={{ position:'relative',background:'#000',flexShrink:0 }}>
        <div style={{ height:220,background:'linear-gradient(135deg,#2a1500,#1a0d00)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden' }}>
          {/* spray container */}
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:10 }}>
            {sprays.map(s=><div key={s.id} className="cow-shell" style={{ left:`${s.x}%`,bottom:40 }}>🪙</div>)}
          </div>
          <span style={{ fontSize:80,opacity:.15 }}>🎭</span>
          {/* host */}
          <div style={{ position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',textAlign:'center' }}>
            <span style={{ fontSize:80,filter:'drop-shadow(0 0 20px rgba(212,160,23,.3))' }}>👑</span>
          </div>
          {/* PiP self */}
          <div style={{ position:'absolute',bottom:8,right:8,width:72,height:90,borderRadius:10,background:'rgba(26,124,62,.3)',border:'2px solid #4ade80',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,zIndex:5 }}>
            <span style={{ fontSize:28 }}>👤</span><span style={{ fontSize:7,fontWeight:700,color:'#4ade80',background:'rgba(0,0,0,.6)',padding:'1px 5px',borderRadius:99 }}>You · Live</span>
          </div>
          {/* overlays */}
          <div style={{ position:'absolute',top:8,left:8,display:'flex',alignItems:'center',gap:5,background:'rgba(0,0,0,.7)',borderRadius:8,padding:'5px 9px' }}>
            <span className="live-dot" style={{ width:6,height:6 }} /><span style={{ fontSize:9,fontWeight:700,color:'#fb923c' }}>Station A · Reality</span>
          </div>
          <div style={{ position:'absolute',top:8,right:8,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.7)',background:'rgba(0,0,0,.6)',padding:'4px 9px',borderRadius:99 }}>👁 {viewers.toLocaleString()}</div>
          {/* host name lower third */}
          <div style={{ position:'absolute',bottom:0,left:0,right:82 }}>
            <div style={{ background:'linear-gradient(90deg,rgba(224,123,0,.95),rgba(180,80,0,.95))',padding:'5px 12px' }}>
              <div style={{ fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:900,color:'#fff' }}>Elder Mama Ngozi</div>
              <div style={{ fontSize:9,color:'rgba(255,255,255,.8)' }}>Host · Commerce Village Elder · Crest V</div>
            </div>
          </div>
        </div>
        {/* guests row */}
        <div style={{ display:'flex',gap:4,padding:'6px 8px',background:'rgba(0,0,0,.85)' }}>
          {[{av:'🧺',n:'Chioma Obi',speaking:true},{av:'🌾',n:'Kofi Mensah',speaking:false},{av:'🎨',n:'Ayo Arts',speaking:false}].map((g,i)=>(
            <div key={i} style={{ flex:1,height:60,borderRadius:8,background:'rgba(255,255,255,.05)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,position:'relative' }}>
              <span style={{ fontSize:22 }}>{g.av}</span>
              <span style={{ fontSize:8,fontWeight:700,color:'rgba(255,255,255,.7)',textAlign:'center',lineHeight:1.2,padding:'0 4px' }}>{g.n}</span>
              <div style={{ position:'absolute',bottom:4,right:4,width:8,height:8,borderRadius:'50%',background:g.speaking?'#4ade80':'rgba(255,255,255,.2)',boxShadow:g.speaking?'0 0 8px #4ade80':'none' }} />
            </div>
          ))}
          <div onClick={()=>{if(!joinRequested){setJoinRequested(true);showToast('🤚 Join request sent to Mama Ngozi — queue: 4')}}} style={{ flex:1,height:60,borderRadius:8,border:`1.5px dashed ${joinRequested?'rgba(74,222,128,.3)':'rgba(255,255,255,.1)'}`,background:joinRequested?'rgba(74,222,128,.06)':'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,cursor:joinRequested?'default':'pointer' }}>
            <span style={{ fontSize:18 }}>{joinRequested?'✅':'🤚'}</span><span style={{ fontSize:8,fontWeight:700,color:joinRequested?'#4ade80':'rgba(255,255,255,.4)',textAlign:'center' }}>{joinRequested?'Request Sent':'Request to Join'}</span>
          </div>
        </div>
      </div>
      {/* live ticker */}
      <div style={{ background:'linear-gradient(90deg,rgba(224,123,0,.95),rgba(180,80,0,.95))',padding:'5px 12px',display:'flex',alignItems:'center',gap:8,flexShrink:0,overflow:'hidden' }}>
        <span style={{ fontFamily:'Sora, sans-serif',fontSize:9,fontWeight:900,color:'#fff',letterSpacing:'.08em',textTransform:'uppercase',flexShrink:0 }}>Reality TV</span>
        <div style={{ width:1,height:12,background:'rgba(255,255,255,.3)' }} />
        <div style={{ fontSize:11,color:'#fff',overflow:'hidden',whiteSpace:'nowrap',flex:1 }}>{activeShow?.title ?? 'The Real Village S2E8'} · Tonight: Chioma and Kofi debate market price floor · Oracle vote: 68% agree · Spray Cowrie to support your favourite!</div>
      </div>
      {/* live chat */}
      <div style={{ flex:1,overflowY:'auto',padding:'6px 12px 4px' }}>
        <div style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6 }}>Live Chat</div>
        {chat.map(m=>(
          <div key={m.id} className="cf-in" style={{ display:'flex',gap:7,marginBottom:7 }}>
            <div style={{ width:24,height:24,borderRadius:'50%',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.07)',flexShrink:0 }}>{m.av}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10,fontWeight:700,marginBottom:1,color:m.c }}>{m.name}</div>
              {m.spray ? <div style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(212,160,23,.1)',border:'1px solid rgba(212,160,23,.2)',borderRadius:99,padding:'2px 9px',fontSize:10,fontWeight:700,color:'#fbbf24' }}>💸 Sprayed {m.spray}</div>
                : <div style={{ fontSize:12,color:'rgba(255,255,255,.7)',lineHeight:1.5 }}>{m.msg}</div>}
            </div>
          </div>
        ))}
        {/* ad slot */}
        <div style={{ margin:'8px 0',background:'linear-gradient(135deg,#1a1800,#1a1200)',border:'1px solid rgba(212,160,23,.2)',borderRadius:12,overflow:'hidden' }}>
          <div style={{ background:'rgba(212,160,23,.15)',padding:'4px 12px',fontSize:9,fontWeight:700,color:'#fbbf24',letterSpacing:'.08em',textTransform:'uppercase' }}>📢 Sponsored · Village Commerce</div>
          <div style={{ padding:'10px 12px',display:'flex',gap:10,alignItems:'center' }}>
            <span style={{ fontSize:32,flexShrink:0 }}>🏦</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Sora, sans-serif',fontSize:13,fontWeight:700,color:'#f0f5ee',marginBottom:2 }}>Access Bank · Village Loans</div>
              <div style={{ fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.5 }}>Business loan funded by your Nkisi score. No paperwork. 48 hours.</div>
              <button onClick={()=>router.push('/dashboard/jollof/ads')} style={{ marginTop:8,padding:'7px 14px',background:'#d4a017',border:'none',borderRadius:8,fontSize:11,fontWeight:700,color:'#111',cursor:'pointer',fontFamily:'Sora, sans-serif' }}>Apply via Viewdicon →</button>
            </div>
          </div>
        </div>
        <div onClick={()=>router.push('/dashboard/jollof/ads')} style={{ textAlign:'center',fontSize:10,color:'rgba(212,160,23,.4)',cursor:'pointer',padding:'6px 0' }}>📢 Want to advertise here? Book a TV slot →</div>
      </div>
      {/* react strip */}
      <div style={{ display:'flex',gap:6,padding:'8px 12px',background:'rgba(0,0,0,.85)',borderTop:'1px solid rgba(255,255,255,.05)',flexShrink:0 }}>
        {[['💸 Spray ₡','rgba(212,160,23,.2)','#fbbf24','rgba(212,160,23,.3)',doSpray],['✓ Vote',voted?'rgba(26,124,62,.3)':'rgba(26,124,62,.15)',voted?'#fff':'#4ade80','rgba(26,124,62,.25)',doVote],['🤚 Join Stage',joinRequested?'rgba(224,123,0,.3)':'#e07b00',joinRequested?'rgba(255,255,255,.6)':'#fff',joinRequested?'rgba(224,123,0,.4)':'#e07b00',doJoinStage],['🥁','rgba(255,255,255,.07)','rgba(255,255,255,.5)','rgba(255,255,255,.1)',doDrum]].map(([l,bg,c,b,fn],i)=>(
          <button key={i} onClick={fn as ()=>void} style={{ flex:i===3?0:1,padding:10,borderRadius:11,border:`1px solid ${b}`,background:bg as string,color:c as string,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:4,minWidth:i===3?40:undefined }}>{l as string}</button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   STATION B — LIVE REELS
═══════════════════════════════════════════════════════════════════ */
function StationB({ onBack, liveStreams }: { onBack:()=>void; liveStreams?: any[] }) {
  const router = useRouter()
  const displayReels: any[] = React.useMemo(() => {
    if (!liveStreams || liveStreams.length === 0) return REELS
    return liveStreams.map((s: any, i: number) => ({
      id: s.id ?? `stream-${i}`,
      type: s.streamType ?? 'market',
      emoji: '📡',
      color: '#b22222',
      colorBg: 'rgba(178,34,34,.15)',
      streamer: s.streamerName ?? s.title ?? 'Live Stream',
      village: s.villageName ?? '🌍 Village',
      viewers: s.viewerCount != null ? String(s.viewerCount) : '0',
      label: `📡 ${s.villageName ?? 'Live'} · Station B`,
      desc: s.description ?? 'Live stream in progress.',
      kila: s.kilaCount ?? 0,
      spray: s.sprayCount ?? 0,
      drum: s.drumCount ?? 0,
    }))
  }, [liveStreams])

  const [activeReel, setActiveReel] = React.useState(0)
  const [agree, setAgree] = React.useState(68)
  const [sprays, setSprays] = React.useState<{id:number;x:number;reel:string}[]>([])
  const [toast, setToast] = React.useState('')
  const [kilaGiven, setKilaGiven] = React.useState<Record<string,boolean>>({})
  const [drumGiven, setDrumGiven] = React.useState<Record<string,boolean>>({})
  const [handRaised, setHandRaised] = React.useState(false)

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2500)}

  const doSpray=(reelId:string)=>{
    jollofTvApi.spray(reelId, 500).catch((e)=>logApiFailure('jollof/spray',e))
    setSprays(prev=>[...prev,...Array.from({length:7},(_,i)=>({id:Date.now()+i,x:10+Math.random()*80,reel:reelId}))])
    setTimeout(()=>setSprays([]),2200)
    showToast('💸 ₡500 Sprayed! 🪙')
  }

  const doKila=(reelId:string)=>{
    if (kilaGiven[reelId]) return
    setKilaGiven(prev=>({...prev,[reelId]:true}))
    jollofTvApi.kila(reelId).catch((e)=>logApiFailure('jollof/kila',e))
    showToast('⭐ Kila given!')
  }

  const doDrumReel=(reelId:string)=>{
    if (drumGiven[reelId]) return
    setDrumGiven(prev=>({...prev,[reelId]:true}))
    jollofTvApi.kila(reelId).catch((e)=>logApiFailure('jollof/kila',e))
    showToast('🥁 Drummed to Village!')
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',flex:1,overflow:'hidden',background:'#0a0300' }}>
      {toast && <div style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:'#151e12',border:'1px solid rgba(74,222,128,.2)',borderRadius:12,padding:'8px 16px',fontSize:12,fontWeight:600,color:'#f0f5ee',zIndex:300,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.6)' }}>{toast}</div>}

      <div style={{ flex:1,overflowY:'auto',scrollSnapType:'y mandatory' }}>
        {displayReels.map((reel,idx)=>{
          const isActive = activeReel===idx
          return (
            <div key={reel.id} onClick={()=>setActiveReel(idx)} style={{ height:'calc(100dvh - 130px)',scrollSnapAlign:'start',position:'relative',overflow:'hidden',background:`linear-gradient(160deg,${reel.colorBg},#070900 60%)`,flexShrink:0,cursor:'pointer' }}>
              {/* spray container */}
              <div style={{ position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:20 }}>
                {sprays.filter(s=>s.reel===reel.id).map(s=><div key={s.id} className="cow-shell" style={{ left:`${s.x}%`,bottom:200 }}>🪙</div>)}
              </div>
              {/* adinkra bg */}
              <div style={{ position:'absolute',inset:0,pointerEvents:'none',opacity:.04,backgroundImage:'repeating-linear-gradient(45deg,#d4a017 0px,#d4a017 1px,transparent 0,transparent 50%)',backgroundSize:'18px 18px' }} />
              {/* type color top bar */}
              <div style={{ position:'absolute',top:0,left:0,right:0,height:4,background:reel.color,zIndex:10 }} />
              {/* bg emoji */}
              <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:120,opacity:.12 }}>{reel.emoji}</div>
              {/* top bar */}
              <div style={{ position:'absolute',top:10,left:12,right:12,display:'flex',alignItems:'center',gap:8,zIndex:10 }}>
                <span onClick={e=>{e.stopPropagation();onBack()}} style={{ background:'rgba(0,0,0,.5)',width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,cursor:'pointer',flexShrink:0 }}>←</span>
                <span style={{ fontSize:9,fontWeight:700,borderRadius:99,padding:'3px 9px',border:`1px solid ${reel.color}44`,background:'rgba(0,0,0,.6)',color:reel.color }}>{reel.label}</span>
                <div style={{ display:'flex',alignItems:'center',gap:4,background:'rgba(178,34,34,.8)',padding:'4px 9px',borderRadius:99,marginLeft:'auto' }}>
                  <span className="live-dot" style={{ width:6,height:6,background:'#fff' }} /><span style={{ fontSize:10,fontWeight:700,color:'#fff' }}>LIVE</span>
                </div>
                <span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,.8)',background:'rgba(0,0,0,.5)',padding:'3px 9px',borderRadius:99 }}>👁 {reel.viewers}</span>
              </div>
              {/* right actions */}
              <div style={{ position:'absolute',right:12,bottom:180,display:'flex',flexDirection:'column',gap:14,zIndex:10 }}>
                {[['⭐',reel.kila.toString(),'Kila'],['💸',reel.spray.toString(),'Spray'],['🥁',reel.drum.toString(),'Drum'],['💬','Ask','Chat'],['↗','Share','']].map(([ico,cnt,lbl],i)=>(
                  <div key={i} onClick={e=>{e.stopPropagation(); if(i===0)doKila(reel.id); else if(i===1)doSpray(reel.id); else if(i===2)doDrumReel(reel.id); else if(i===3)router.push('/dashboard/chat'); else router.push(`/dashboard/jollof`)}} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer' }}>
                    <div style={{ width:42,height:42,borderRadius:'50%',background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:'1.5px solid rgba(255,255,255,.15)' }}>{ico}</div>
                    <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.8)' }}>{cnt}</span>
                  </div>
                ))}
              </div>
              {/* reel dot indicators */}
              <div style={{ position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:4,paddingRight:4,zIndex:10 }}>
                {displayReels.map((_,j)=><div key={j} style={{ width:3,height:j===idx?28:16,borderRadius:99,background:j===idx?'#fff':'rgba(255,255,255,.2)',transition:'all .2s' }} />)}
              </div>
              {/* bottom content */}
              <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'12px 14px 14px',background:'linear-gradient(transparent,rgba(0,0,0,.92)',zIndex:5 }}>
                {/* market content */}
                {reel.type==='market' && reel.product && (
                  <div style={{ background:'rgba(0,0,0,.85)',borderRadius:12,padding:'10px 12px',marginBottom:8 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
                      <span style={{ fontFamily:'Sora, sans-serif',fontSize:14,fontWeight:700,color:'#fff',flex:1 }}>{reel.product}</span>
                      <span style={{ fontFamily:'Sora, sans-serif',fontSize:18,fontWeight:900,color:'#fbbf24' }}>{reel.price}</span>
                    </div>
                    <div style={{ fontSize:10,color:'rgba(224,123,0,.6)',marginBottom:8 }}>38% below market · 14 sold this stream</div>
                    <div style={{ display:'flex',gap:6 }}>
                      <button onClick={e=>{e.stopPropagation();jollofTvApi.addToPot(reel.id,reel.product ?? 'default').then(res=>{const sid=(res as any)?.sessionId;if(sid)router.push(`/dashboard/sessions/${sid}`);else showToast('🫙 Added to Pot — Business Session opening!')}).catch(()=>showToast('🫙 Added to Pot — Business Session opening!'))}} style={{ flex:1,padding:9,borderRadius:9,background:'linear-gradient(135deg,#e07b00,#d4a017)',border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif' }}>🫙 Add to Pot</button>
                    </div>
                  </div>
                )}
                {/* farm auction */}
                {reel.type==='farm' && (
                  <div style={{ background:'rgba(0,0,0,.85)',borderRadius:12,padding:'10px 12px',marginBottom:8 }}>
                    <div style={{ fontSize:11,fontWeight:700,color:'#4ade80',marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em' }}>🏆 Live Auction · Maize 850 bags</div>
                    {[['🥇','Trader Mugo','₡3,200/bag','#fbbf24'],['🥈','Agro Co.','₡3,000/bag','rgba(255,255,255,.6)'],['🥉','Open bid...','Place yours','rgba(255,255,255,.3)']].map(([r,n,a,c],i)=>(
                      <div key={i} style={{ display:'flex',alignItems:'center',gap:7,fontSize:12,marginBottom:5 }}>
                        <span style={{ width:20,textAlign:'center',flexShrink:0 }}>{r}</span>
                        <span style={{ color:'rgba(255,255,255,.7)',flex:1 }}>{n}</span>
                        <span style={{ fontWeight:700,fontFamily:'Sora, sans-serif',color:c }}>{a}</span>
                      </div>
                    ))}
                    <button onClick={e=>{e.stopPropagation();router.push(`/dashboard/jollof/live/${reel.id}`)}} style={{ width:'100%',padding:10,background:'linear-gradient(135deg,#1a7c3e,#0f5028)',border:'none',borderRadius:9,fontSize:12,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'Sora, sans-serif',marginTop:4 }}>🌾 Place Your Bid</button>
                  </div>
                )}
                {/* oracle vote */}
                {reel.type==='oracle' && reel.topic && (
                  <div style={{ background:'rgba(0,0,0,.85)',borderRadius:12,padding:'10px 12px',marginBottom:8 }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'#f0f5ee',marginBottom:6 }}>{reel.topic}</div>
                    <div style={{ height:8,background:'rgba(255,255,255,.07)',borderRadius:99,overflow:'hidden',display:'flex',marginBottom:4 }}>
                      <div style={{ width:`${agree}%`,background:'linear-gradient(to right,#4ade80,#1a7c3e)',borderRadius:99,transition:'width .5s ease' }} />
                      <div style={{ flex:1,background:'linear-gradient(to right,#b22222,#7f1d1d)',borderRadius:99 }} />
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:700,marginBottom:8 }}>
                      <span style={{ color:'#4ade80' }}>Agree {agree}%</span><span style={{ color:'#f87171' }}>Disagree {100-agree}%</span>
                    </div>
                    <div style={{ display:'flex',gap:5 }}>
                      <button onClick={e=>{e.stopPropagation();setAgree(a=>Math.min(95,a+3))}} style={{ flex:1,padding:8,borderRadius:9,border:'1px solid rgba(26,124,62,.3)',background:'rgba(26,124,62,.2)',color:'#4ade80',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif' }}>✓ Agree</button>
                      <button onClick={e=>{e.stopPropagation();setAgree(a=>Math.max(5,a-3))}} style={{ flex:1,padding:8,borderRadius:9,border:'1px solid rgba(178,34,34,.25)',background:'rgba(178,34,34,.15)',color:'#f87171',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif' }}>✗ Disagree</button>
                      <button onClick={e=>{e.stopPropagation();if(!handRaised){setHandRaised(true);showToast('🤚 Hand raised — waiting for host')}}} style={{ flex:1,padding:8,borderRadius:9,border:`1px solid ${handRaised?'rgba(74,222,128,.3)':'rgba(212,160,23,.25)'}`,background:handRaised?'rgba(74,222,128,.15)':'rgba(212,160,23,.15)',color:handRaised?'#4ade80':'#fbbf24',fontSize:11,fontWeight:700,cursor:handRaised?'default':'pointer',fontFamily:'Sora, sans-serif' }}>{handRaised?'✅ Raised':'🤚 Speak'}</button>
                    </div>
                  </div>
                )}
                {/* craft progress */}
                {reel.type==='craft' && reel.progress && (
                  <div style={{ background:'rgba(0,0,0,.85)',borderRadius:12,padding:'10px 12px',marginBottom:8 }}>
                    <div style={{ fontSize:11,fontWeight:700,color:'#c084fc',marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em' }}>🧵 Craft Progress · {reel.progress}% Complete</div>
                    <div style={{ height:8,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden',marginBottom:8 }}>
                      <div style={{ height:'100%',width:`${reel.progress}%`,background:'linear-gradient(to right,#7c3aed,#c084fc)',borderRadius:99 }} />
                    </div>
                    <button onClick={e=>{e.stopPropagation();router.push('/dashboard/chat')}} style={{ width:'100%',padding:10,background:'linear-gradient(135deg,#7c3aed,#5b21b6)',border:'none',borderRadius:9,fontSize:12,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'Sora, sans-serif' }}>🧵 Commission This Piece</button>
                  </div>
                )}
                {/* spirit voice */}
                {reel.sv && reel.type!=='oracle' && (
                  <div style={{ background:'rgba(0,0,0,.7)',borderRadius:99,padding:'5px 12px',display:'inline-flex',alignItems:'center',gap:7,marginBottom:8 }}>
                    <span className="live-dot live-dot-g" style={{ width:5,height:5 }} />
                    <span style={{ fontSize:11,color:'rgba(255,255,255,.8)',fontStyle:'italic' }}>{reel.sv}</span>
                  </div>
                )}
                {/* streamer info */}
                <div style={{ display:'flex',alignItems:'center',gap:9,marginBottom:8 }}>
                  <div style={{ width:40,height:40,borderRadius:'50%',border:`2px solid ${reel.color}`,background:reel.colorBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0 }}>{reel.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Sora, sans-serif',fontSize:14,fontWeight:800,color:'#fff' }}>{reel.streamer}</div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,.6)',marginTop:2 }}>{reel.village}</div>
                  </div>
                  <div onClick={e=>{e.stopPropagation();router.push('/dashboard/chat')}} style={{ padding:'6px 14px',borderRadius:99,border:'1.5px solid #fff',fontSize:10,fontWeight:700,color:'#fff',cursor:'pointer',flexShrink:0 }}>🤫 Whisper</div>
                </div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,.8)',lineHeight:1.6 }}>{reel.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   STATION C — JOLLOF BROADCAST
═══════════════════════════════════════════════════════════════════ */
function StationC({ onBack, audioRooms, podcasts, channels }: { onBack:()=>void; audioRooms?: any[]; podcasts?: any[]; channels?: any[] }) {
  const router = useRouter()
  const villageChannels = React.useMemo(() => (channels ?? []).filter((c: any) => c.type === 'VILLAGE'), [channels])
  const V_EMO: Record<string,string> = {
    health:'⚕',agriculture:'🌾',education:'🎓',justice:'⚖️',finance:'💰',builders:'🏗',
    technology:'💻',arts:'🎨',media:'📡',commerce:'🧺',security:'🛡',spirituality:'🕯',
    fashion:'👗',family:'👨‍👩‍👧‍👦',transport:'🚌',energy:'⚡',hospitality:'🏨',government:'🏛',sports:'⚽',holdings:'👑',
  }
  const displayBlocks = React.useMemo(() => {
    if (!audioRooms || audioRooms.length === 0) return VILLAGE_BLOCKS
    return audioRooms.map((r: any) => ({
      village: r.villageName ?? r.title ?? '🎤 Audio Room',
      time: r.scheduledTime ?? 'Live Now',
      slots: [{
        title: r.topic ?? r.title ?? 'Audio Discussion',
        type: 'live' as const,
        ai: r.isAiGenerated ?? false,
        dur: r.durationMinutes ? `${r.durationMinutes}m` : '60m',
      }],
    }))
  }, [audioRooms])

  const [tier,setTier] = React.useState(0)
  const [booked,setBooked] = React.useState(false)
  const [toast,setToast] = React.useState('')

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2500)}

  const TIERS=[
    {name:'Village Spot',price:'₡ 5,000',desc:'30s · 1 village · 1 day'},
    {name:'Regional Spot',price:'₡ 25,000',desc:'2min · 5 villages'},
    {name:'Nation Sponsor',price:'₡ 100,000',desc:'Full hour · All 20'},
    {name:'Reality Partner',price:'₡ 500,000',desc:'Season sponsor'},
  ]

  return (
    <div style={{ display:'flex',flexDirection:'column',flex:1,overflow:'hidden',background:'#07090a' }}>
      {toast && <div style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:'#151e12',border:'1px solid rgba(74,222,128,.2)',borderRadius:12,padding:'8px 16px',fontSize:12,fontWeight:600,color:'#f0f5ee',zIndex:300,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.6)' }}>{toast}</div>}
      {/* on-air banner */}
      <div style={{ background:'linear-gradient(90deg,#1a0a00,#2a1500,#1a0a00)',padding:'8px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:'2px solid rgba(212,160,23,.3)',position:'relative',overflow:'hidden',flexShrink:0 }}>
        <div style={{ position:'absolute',top:0,left:'-100%',width:'50%',height:'100%',background:'linear-gradient(90deg,transparent,rgba(212,160,23,.08),transparent)',animation:'shine 3s ease-in-out infinite' }} />
        <div style={{ display:'flex',alignItems:'center',gap:5,background:'rgba(212,160,23,.2)',border:'1px solid rgba(212,160,23,.4)',borderRadius:99,padding:'5px 12px',flexShrink:0 }}>
          <span className="live-dot" style={{ background:'#d4a017',width:7,height:7 }} /><span style={{ fontFamily:'Sora, sans-serif',fontSize:11,fontWeight:900,color:'#fbbf24',letterSpacing:'.1em' }}>ON AIR</span>
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontFamily:'Sora, sans-serif',fontSize:13,fontWeight:700,color:'#f0f5ee',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>Oracle Session — All 20 Villages</div>
          <div style={{ fontSize:10,color:'rgba(212,160,23,.6)',marginTop:1 }}>Station C · Jollof Broadcast · 18:00–20:00</div>
        </div>
        <div onClick={onBack} style={{ width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,cursor:'pointer',flexShrink:0 }}>←</div>
      </div>
      {/* video window */}
      <div style={{ height:210,background:'#000',position:'relative',flexShrink:0,overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:90,opacity:.1 }}>⚡</div>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(transparent 30%,rgba(0,0,0,.9))' }} />
        <div style={{ position:'absolute',bottom:8,right:8,width:70,height:88,borderRadius:10,background:'rgba(26,124,62,.25)',border:'2px solid #4ade80',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2 }}>
          <span style={{ fontSize:28 }}>👤</span><span style={{ fontSize:7,fontWeight:700,color:'#4ade80',background:'rgba(0,0,0,.7)',padding:'1px 5px',borderRadius:99 }}>You</span>
        </div>
        <div style={{ position:'absolute',bottom:12,left:12,right:90 }}>
          <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:4 }}>
            <span style={{ background:'rgba(212,160,23,.85)',fontSize:8,fontWeight:700,padding:'2px 8px',borderRadius:4,color:'#111',fontFamily:'Sora, sans-serif' }}>● ON AIR · STATION C</span>
            <span style={{ fontSize:10,color:'rgba(255,255,255,.6)',background:'rgba(0,0,0,.5)',padding:'2px 8px',borderRadius:99 }}>👁 1,247 watching</span>
          </div>
          <div style={{ fontFamily:'Sora, sans-serif',fontSize:16,fontWeight:900,color:'#fff',textShadow:'0 2px 12px rgba(0,0,0,.8)',marginBottom:3 }}>Oracle Session: Cocoa Price Floor Debate</div>
          <div style={{ fontSize:11,color:'rgba(255,255,255,.7)',display:'flex',alignItems:'center',gap:6 }}><span>🏛</span> Hosted by Elder Council · All 20 Villages <span style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:8,fontWeight:700,background:'rgba(124,58,237,.15)',color:'#c084fc',borderRadius:99,padding:'2px 8px',border:'1px solid rgba(124,58,237,.2)' }}>🤖 Spirit Voice LIVE</span></div>
        </div>
      </div>
      {/* breaking ticker */}
      <div style={{ background:'#d4a017',padding:'5px 12px',display:'flex',alignItems:'center',gap:8,flexShrink:0,overflow:'hidden' }}>
        <span style={{ fontSize:9,fontWeight:900,letterSpacing:'.09em',background:'#111',color:'#d4a017',padding:'2px 8px',borderRadius:4,flexShrink:0 }}>LIVE</span>
        <div style={{ fontSize:11,color:'#111',fontWeight:600,overflow:'hidden',whiteSpace:'nowrap',flex:1,animation:'ticker 18s linear infinite' }}>ORACLE SESSION · "Should Agriculture Villages set a cocoa price floor?" · Agree: 68% · Disagree: 32% · 4,821 village members voting · Next: The Real Village Reality Show 20:00 · Station A</div>
      </div>
      {/* schedule + booking */}
      <div style={{ flex:1,overflowY:'auto' }}>
        <div style={{ padding:'10px 14px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em' }}>
          <span>24-Hour Village Programme</span>
          <span style={{ fontSize:10,color:'#fbbf24',fontWeight:700 }}>Today · All 20 Villages</span>
        </div>
        {/* AI notice */}
        <div style={{ margin:'0 12px 8px',padding:'7px 12px',background:'rgba(124,58,237,.07)',border:'1px solid rgba(124,58,237,.15)',borderRadius:8,fontSize:10,color:'rgba(192,132,252,.7)',display:'flex',alignItems:'center',gap:6 }}>
          🤖 AI-labelled content generated by Griot Orunmila AI. Always clearly marked. Never presented as human-created.
        </div>
        {displayBlocks.map((vb,i)=>(
          <div key={i} onClick={()=>router.push('/dashboard/jollof/guide')} style={{ margin:'4px 12px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,overflow:'hidden',cursor:'pointer',marginBottom:6 }}>
            <div style={{ padding:'10px 12px',display:'flex',alignItems:'center',gap:8,borderBottom:'1px solid rgba(255,255,255,.06)' }}>
              <span style={{ fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:700,color:'#f0f5ee',flex:1 }}>{vb.village}</span>
              <span style={{ fontFamily:'DM Mono,monospace',fontSize:10,color:'rgba(255,255,255,.4)' }}>⏰ {vb.time}</span>
            </div>
            <div style={{ padding:'8px 12px',display:'flex',flexDirection:'column',gap:6 }}>
              {vb.slots.map((sl,j)=>(
                <div key={j} style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <div style={{ width:4,height:4,borderRadius:'50%',background:sl.type==='live'?'#ef4444':sl.ai?'#7c3aed':'#d4a017',flexShrink:0 }} />
                  <span style={{ fontSize:11,color:'rgba(255,255,255,.7)',flex:1 }}>{sl.title}</span>
                  <span style={{ fontFamily:'DM Mono,monospace',fontSize:10,color:'rgba(255,255,255,.4)' }}>{sl.dur}</span>
                  {sl.ai && <span style={{ fontSize:8,fontWeight:700,color:'#c084fc',background:'rgba(124,58,237,.1)',borderRadius:99,padding:'1px 6px' }}>AI</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* ── Village Channel Grid ── */}
        {villageChannels.length > 0 && (
          <>
            <div style={{ padding:'10px 12px 6px',fontFamily:'Sora, sans-serif',fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em',display:'flex',alignItems:'center',gap:6 }}>
              🏘 Village TV Channels · {villageChannels.length} <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }} />
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:6,padding:'4px 12px 12px' }}>
              {villageChannels.map((ch: any)=>{
                const vEmoji = V_EMO[ch.villageId] || '🏘'
                return (
                  <div key={ch.id} onClick={()=>router.push('/dashboard/villages/' + (ch.villageId || ''))} style={{ padding:'10px 6px',borderRadius:10,border:'1px solid rgba(251,191,36,.15)',background:'rgba(251,191,36,.04)',cursor:'pointer',textAlign:'center' }}>
                    <div style={{ fontSize:20,marginBottom:3 }}>{vEmoji}</div>
                    <div style={{ fontSize:8,fontWeight:700,color:'#fbbf24',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{(ch.villageId || '').charAt(0).toUpperCase() + (ch.villageId || '').slice(1)}</div>
                    <div style={{ fontSize:7,color:'rgba(255,255,255,.3)',marginTop:1 }}>{ch.description?.slice(0, 30) ?? 'Village TV'}...</div>
                  </div>
                )
              })}
            </div>
          </>
        )}
        {/* booking section */}
        {!booked ? (
          <div style={{ margin:'8px 12px 24px',background:'linear-gradient(135deg,rgba(212,160,23,.08),rgba(180,80,0,.05))',border:'1px solid rgba(212,160,23,.2)',borderRadius:14,overflow:'hidden' }}>
            <div style={{ padding:'10px 14px',background:'rgba(212,160,23,.1)',borderBottom:'1px solid rgba(212,160,23,.15)',display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontSize:22 }}>📢</span>
              <div>
                <div style={{ fontFamily:'Sora, sans-serif',fontSize:13,fontWeight:700,color:'#fbbf24' }}>Book a TV Slot — Companies & Creators</div>
                <div style={{ fontSize:10,color:'rgba(212,160,23,.55)',marginTop:1 }}>Advertise to all 20 villages · Request a programme slot</div>
              </div>
            </div>
            <div style={{ padding:'12px 14px' }}>
              <div style={{ display:'flex',gap:8,marginBottom:8 }}>
                <input placeholder="Company or Creator name" style={{ flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'9px 12px',fontSize:12,color:'#f0f5ee',outline:'none',fontFamily:'DM Sans,sans-serif' }} />
                <input placeholder="Contact email / Afro-ID" style={{ flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'9px 12px',fontSize:12,color:'#f0f5ee',outline:'none',fontFamily:'DM Sans,sans-serif' }} />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10 }}>
                {TIERS.map((t,i)=>(
                  <div key={i} onClick={()=>setTier(i)} style={{ padding:8,borderRadius:10,border:`1.5px solid ${tier===i?'#d4a017':'rgba(255,255,255,.08)'}`,background:tier===i?'rgba(212,160,23,.1)':'rgba(255,255,255,.03)',cursor:'pointer',textAlign:'center',transition:'all .2s' }}>
                    <div style={{ fontSize:10,fontWeight:700,color:'#f0f5ee',marginBottom:2 }}>{t.name}</div>
                    <div style={{ fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:800,color:'#fbbf24' }}>{t.price}</div>
                    <div style={{ fontSize:9,color:'rgba(255,255,255,.4)',marginTop:2 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setBooked(true);showToast('📺 Booking submitted! Ref: JTV-2026-'+Math.floor(Math.random()*9000+1000))}} style={{ width:'100%',padding:12,background:'linear-gradient(135deg,#d4a017,#e07b00)',border:'none',borderRadius:11,fontSize:13,fontWeight:700,color:'#111',cursor:'pointer',fontFamily:'Sora, sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
                📺 Submit Booking Request →
              </button>
            </div>
          </div>
        ) : (
          <div className="jf-fade" style={{ margin:'8px 12px 24px',background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.3)',borderRadius:14,padding:20,textAlign:'center' }}>
            <div style={{ fontSize:36,marginBottom:8 }}>✅</div>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:15,fontWeight:800,color:'#4ade80',marginBottom:4 }}>Booking Submitted!</div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,.6)',marginBottom:4 }}>Jollof TV team will contact you within 24 hours.</div>
            <div style={{ fontSize:10,color:'rgba(74,222,128,.6)' }}>Tier: {TIERS[tier].name} · {TIERS[tier].price}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function JollofPage() {
  const router = useRouter()
  const [view, setView] = React.useState<StationView>('guide')
  const [showPanel, setShowPanel] = React.useState(false)
  const user = useAuthStore(s => s.user)
  const userCrestTier = 1 // Default crest tier; in prod, derive from user profile
  const goLiveLocked = userCrestTier < 1

  // ── API state ─────────────────────────────────────────────────
  const [channels, setChannels] = React.useState<any[]>([])
  const [mainChannelId, setMainChannelId] = React.useState<string>('')
  const [mainTvSchedule, setMainTvSchedule] = React.useState<any[]>([])
  const [liveStreams, setLiveStreams] = React.useState<any[]>([])
  const [activeShow, setActiveShow] = React.useState<any>(null)
  const [leaderboard, setLeaderboard] = React.useState<any[]>([])
  const [audioRooms, setAudioRooms] = React.useState<any[]>([])
  const [podcasts, setPodcasts] = React.useState<any[]>([])

  // ── Fetch channels on mount ───────────────────────────────────
  React.useEffect(() => {
    jollofTvApi.channels().then(data => setChannels(data.channels ?? [])).catch((e) => logApiFailure('jollof/channels', e))
  }, [])

  // ── Set mainChannelId when channels load ──────────────────────
  React.useEffect(() => {
    if (channels.length > 0) {
      const mainTv = channels.find((c: any) => c.name === 'MAIN_TV')
      if (mainTv) setMainChannelId(mainTv.id)
    }
  }, [channels])

  // ── Fetch channel schedule when mainChannelId is set ─────────
  React.useEffect(() => {
    if (mainChannelId) {
      jollofTvApi.channelSchedule(mainChannelId).then(d => setMainTvSchedule(d.schedules ?? [])).catch((e) => logApiFailure('jollof/channelSchedule', e))
    }
  }, [mainChannelId])

  // ── Fetch live streams on mount ───────────────────────────────
  React.useEffect(() => {
    jollofTvApi.list({ status: 'LIVE' }).then(data => setLiveStreams((data as any).streams ?? (data as any).data ?? [])).catch((e) => logApiFailure('jollof/liveStreams', e))
  }, [])

  // ── Fetch active reality show on mount ────────────────────────
  React.useEffect(() => {
    jollofTvApi.realityShows({ isActive: true }).then(data => {
      if (data.shows?.length > 0) setActiveShow(data.shows[0])
    }).catch((e) => logApiFailure('jollof/realityShows', e))
  }, [])

  // ── Fetch leaderboard when activeShow loads ───────────────────
  React.useEffect(() => {
    if (!activeShow?.id) return
    jollofTvApi.realityLeaderboard(activeShow.id).then(data => setLeaderboard(data.leaderboard ?? [])).catch((e) => logApiFailure('jollof/realityLeaderboard', e))
  }, [activeShow?.id])

  // ── Fetch audio rooms + podcasts on mount ─────────────────────
  React.useEffect(() => {
    jollofTvApi.audioRooms({ isLive: true }).then(data => setAudioRooms(data.rooms ?? [])).catch((e) => logApiFailure('jollof/audioRooms', e))
    jollofTvApi.podcasts().then(data => setPodcasts(data.podcasts ?? [])).catch((e) => logApiFailure('jollof/podcasts', e))
  }, [])

  React.useEffect(()=>{ injectCSS() },[])

  const SB_LABEL: Record<StationView,string> = {
    guide:'📡 LIVE', stationA:'🎭 Station A', stationB:'📡 Station B', stationC:'📺 Station C',
  }

  return (
    <div style={{ height:'100dvh',background:'#07090a',color:'#f0f5ee',fontFamily:'DM Sans,sans-serif',display:'flex',flexDirection:'column',overflow:'hidden' }}>
      <TVControlPanel isOpen={showPanel} onClose={()=>setShowPanel(false)} />
      {/* header */}
      <div style={{ background:'#0c1009',padding:'10px 14px 0',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:22,fontWeight:900,letterSpacing:'-.5px',background:'linear-gradient(135deg,#fbbf24,#e07b00,#d4a017)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Jollof TV</div>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:-2 }}>African Broadcast Network · 24/7</div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:5 }}>
            <span className="live-dot" /><span style={{ fontSize:9,fontWeight:700,color:'#ef4444',letterSpacing:'.06em' }}>ON AIR</span>
          </div>
          <div style={{ display:'flex',gap:6 }}>
            <div onClick={()=>router.push('/dashboard/settings')} style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,cursor:'pointer' }}>🔔</div>
            <div onClick={()=>setShowPanel(true)} title="Platform Menu" style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,cursor:'pointer' }}>⚙</div>
            <div
              onClick={() => !goLiveLocked && router.push('/dashboard/jollof/studio')}
              title={goLiveLocked ? 'Reach Crest I to unlock live streaming' : 'Go Live'}
              style={{
                height:32, padding:'0 12px', borderRadius:16,
                background: goLiveLocked ? 'rgba(107,114,128,.15)' : 'linear-gradient(135deg,#d4a017,#e07b00)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                cursor: goLiveLocked ? 'not-allowed' : 'pointer', opacity: goLiveLocked ? 0.5 : 1,
                border: goLiveLocked ? '1px solid rgba(107,114,128,.2)' : 'none',
              }}
            >
              {goLiveLocked && <span style={{ fontSize:10 }}>&#128274;</span>}
              <span style={{ fontSize:10, fontWeight:800, color: goLiveLocked ? '#6b7280' : '#000', letterSpacing:'.04em' }}>
                &#128293; LIVE
              </span>
            </div>
          </div>
        </div>
        {/* station tabs on guide */}
        {view==='guide' && (
          <div style={{ display:'flex',gap:5,paddingBottom:8 }}>
            {([
              ['stationA','🎭 Station A'],
              ['stationB','📡 Station B'],
              ['stationC','📺 Station C'],
            ] as [StationView,string][]).map(([s,label])=>(
              <button key={s} onClick={()=>setView(s)} style={{ padding:'5px 10px',borderRadius:8,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',fontSize:9,fontWeight:700,color:'#f87171',cursor:'pointer' }}>{label}</button>
            ))}
          </div>
        )}
      </div>
      {/* live ticker */}
      <LiveTicker onBack={view!=='guide'?()=>setView('guide'):undefined} label={SB_LABEL[view]} color="#d4a017" />
      {/* views */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
        {view==='guide' && <GuideScreen onStation={setView} schedule={mainTvSchedule} channels={channels} />}
        {view==='stationA' && <StationA onBack={()=>setView('guide')} activeShow={activeShow} leaderboard={leaderboard} />}
        {view==='stationB' && <StationB onBack={()=>setView('guide')} liveStreams={liveStreams} />}
        {view==='stationC' && <StationC onBack={()=>setView('guide')} audioRooms={audioRooms} podcasts={podcasts} channels={channels} />}
      </div>
    </div>
  )
}
