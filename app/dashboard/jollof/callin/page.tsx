'use client'
// ═══════════════════════════════════════════════════════════════════
// CALL THE FIRE — Phone Voice Call-In System · Jollof TV
// Call from any real phone into a LIVE show. Africa-first.
// Pan-African naming — represents the entire continent
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { jollofTvApi } from '@/lib/api'
import { USE_MOCKS } from '@/lib/flags'
import UnderConstruction from '@/components/ui/UnderConstruction'

const CSS_ID = 'ipe-ohun-css'
const CSS = `
@keyframes ipeFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes ipeRing{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.18);opacity:1}}
@keyframes ipeRingOuter{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(1.35);opacity:.6}}
@keyframes ipeWave{0%,100%{height:8px}50%{height:24px}}
@keyframes ipeSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes ipePulse{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
.ipe-fade{animation:ipeFade .3s ease both}
.ipe-ring{animation:ipeRing 1.2s ease-in-out infinite}
.ipe-ring-outer{animation:ipeRingOuter 1.2s ease-in-out infinite}
.ipe-sheet-up{animation:ipeSheetUp .35s cubic-bezier(.4,0,.2,1) both}
.ipe-pulse{animation:ipePulse .7s ease-in-out infinite}
.ipe-wave-bar{animation:ipeWave var(--d,.8s) ease-in-out infinite;border-radius:4px;background:#4ade80;width:5px}
`

const MOCK_QUEUE = [
  { id:'q1', name:'Kofi Mensah', village:'🌾 Agriculture', message:'I want to discuss the new cocoa prices…', tier:'VIP', wait:'3 min', position:1, avatar:'🌾' },
  { id:'q2', name:'Dr. Ngozi Obi', village:'⚕ Health', message:'Question about children\'s health in farming regions…', tier:'VIP', wait:'7 min', position:2, avatar:'⚕' },
  { id:'q3', name:'Chioma Obi', village:'🧺 Commerce', message:'Market prices have been hurting us for 3 weeks…', tier:'Standard', wait:'14 min', position:3, avatar:'🧺' },
  { id:'q4', name:'Elder Emeka', village:'🏛 Government', message:'The council\'s perspective on this matter…', tier:'Standard', wait:'18 min', position:4, avatar:'🏛' },
  { id:'q5', name:'Ayo Banda', village:'🎨 Arts', message:'An artistic perspective on the African cultural question…', tier:'Standard', wait:'22 min', position:5, avatar:'🎨' },
]

const MOCK_LIVE_SHOWS = [
  { id:'s1', title:'Cultural Arts Weekly LIVE', host:'Prof. Adunola', viewers:891, village:'Arts' },
  { id:'s2', title:'Oracle Session · All Villages', host:'Elder Council', viewers:4821, village:'Government' },
  { id:'s3', title:'Masquerade Stage · LIVE', host:'Elder Mama Ngozi', viewers:2421, village:'Commerce' },
  { id:'s4', title:'Harvest Discussion · Season Update', host:'Farmer Mensah', viewers:334, village:'Agriculture' },
]

const TIERS = [
  { id:'standard', label:'Village Line', emoji:'🟡', price:500, desc:'Join the waiting queue · Avg wait: 18 min', color:'#fbbf24' },
  { id:'vip', label:'Elder Line', emoji:'👑', price:2000, desc:'Avg 10 min wait · Skip ahead in queue', color:'#f97316' },
]

export default function IpeOhunPage() {
  if (!USE_MOCKS) return <UnderConstruction module="Call-In Shows" />
  const router = useRouter()
  const { user } = useAuthStore()

  const [mode, setMode] = React.useState<'caller'|'host'>('caller')
  const [showCallerSheet, setShowCallerSheet] = React.useState(false)
  const [sheet, setSheet] = React.useState(1)
  const [selectedShow, setSelectedShow] = React.useState('')
  const [selectedTier, setSelectedTier] = React.useState<'standard'|'vip'>('standard')
  const [phone, setPhone] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [callSent, setCallSent] = React.useState(false)
  const [queue, setQueue] = React.useState(MOCK_QUEUE)
  const [onAir, setOnAir] = React.useState<{ name:string; village:string; duration:string; tier:string; avatar:string } | null>({ name:'Merchant Musa', village:'🧺 Commerce', duration:'2:34', tier:'VIP', avatar:'🧺' })
  const [hostToast, setHostToast] = React.useState('')
  const [duration, setDuration] = React.useState('2:34')
  const [liveShows, setLiveShows] = React.useState(MOCK_LIVE_SHOWS)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Fetch real live shows from API
  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await jollofTvApi.list({ isLive: 'true' })
        const streams = (res as any)?.data ?? []
        if (Array.isArray(streams) && streams.length > 0) {
          setLiveShows(streams.map((s: any) => ({
            id: s.id,
            title: s.title ?? 'Live Stream',
            host: s.hostName ?? s.hostId ?? 'Host',
            viewers: s.viewerCount ?? 0,
            village: s.villageSlug ?? 'General',
          })))
        }
      } catch { /* keep mock fallback */ }
    })()
  }, [])

  React.useEffect(() => {
    const iv = setInterval(() => {
      setDuration(d => {
        const [m, s] = d.split(':').map(Number)
        const total = m * 60 + s + 1
        return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const [callerMuted, setCallerMuted] = React.useState(false)

  function showToast(msg: string) { setHostToast(msg); setTimeout(() => setHostToast(''), 2500) }

  function acceptCaller(id: string) {
    const caller = queue.find(q => q.id === id)
    if (!caller) return
    setQueue(prev => prev.filter(q => q.id !== id))
    if (caller) setOnAir({ name: caller.name, village: caller.village, duration: '0:00', tier: caller.tier, avatar: caller.avatar })
    showToast(`✅ ${caller.name} accepted — On Air now!`)
  }

  function dropCaller() { setOnAir(null); setCallerMuted(false); showToast('📵 Caller removed · Community notified') }

  function sendCall() {
    if (!phone.trim() || !selectedShow) return
    setCallSent(true)
    setTimeout(() => { setShowCallerSheet(false); setCallSent(false); setSheet(1); setPhone(''); setMessage('') }, 2200)
  }

  const S = {
    page:{ minHeight:'100vh', background:'#07090a', backgroundImage:'radial-gradient(circle,rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize:'24px 24px', paddingBottom:100, fontFamily:'DM Sans,sans-serif' } as React.CSSProperties,
    card:{ background:'#0d1008', border:'1px solid rgba(255,255,255,.07)', borderRadius:16 } as React.CSSProperties,
    overlay:{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:200, backdropFilter:'blur(4px)' } as React.CSSProperties,
    sheet:{ position:'fixed', bottom:0, left:0, right:0, background:'#0d1008', borderRadius:'20px 20px 0 0', border:'1px solid rgba(255,255,255,.1)', zIndex:201, padding:'20px 20px 52px', maxHeight:'92vh', overflowY:'auto' } as React.CSSProperties,
    input:{ width:'100%', padding:'11px 14px', borderRadius:12, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.85)', fontSize:14, outline:'none', boxSizing:'border-box' as const },
  }

  return (
    <div style={S.page}>
      {hostToast && <div style={{ position:'fixed', top:60, left:'50%', transform:'translateX(-50%)', background:'#151e12', border:'1px solid rgba(74,222,128,.2)', borderRadius:12, padding:'8px 18px', fontSize:12, fontWeight:600, color:'#f0f5ee', zIndex:300, whiteSpace:'nowrap' }}>{hostToast}</div>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.07)', background:'rgba(13,16,8,.9)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:100 }}>
        <button onClick={() => router.back()} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,.7)', fontSize:16, flexShrink:0 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:'Sora, sans-serif', background:'linear-gradient(90deg,#f97316,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>📞 Call the Fire</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:1 }}>Call Into Live Shows · Cowrie Powered</div>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ padding:'14px 20px 0', display:'flex', gap:8 }}>
        {(['caller','host'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'10px', borderRadius:12, background:mode===m?'rgba(249,115,22,.15)':'rgba(255,255,255,.05)', border:`1px solid ${mode===m?'rgba(249,115,22,.4)':'rgba(255,255,255,.1)'}`, color:mode===m?'#f97316':'rgba(255,255,255,.5)', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'Sora, sans-serif' }}>
            {m==='caller'?'📞 CALLER':'📺 HOST VIEW'}
          </button>
        ))}
      </div>

      {/* ═══ CALLER MODE ═══ */}
      {mode === 'caller' && (
        <div style={{ padding:'16px 20px' }}>
          {/* Hero */}
          <div style={{ background:'linear-gradient(135deg,rgba(249,115,22,.12),rgba(178,34,34,.08))', border:'1px solid rgba(249,115,22,.22)', borderRadius:20, padding:'20px 18px', marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:8 }}>📞</div>
            <div style={{ fontSize:18, fontWeight:900, fontFamily:'Sora, sans-serif', color:'#f0f5ee', marginBottom:6 }}>Direct Voice Call</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.55)', lineHeight:1.7, marginBottom:16 }}>
              Call from any phone number. Your voice goes LIVE to all viewers — never been done before.
              <br/><span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>Africa's first live call-in system for TV. Powered by Cowrie.</span>
            </div>
            {/* Tier cards */}
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              {TIERS.map(t => (
                <div key={t.id} style={{ flex:1, background:'rgba(255,255,255,.04)', border:`1px solid ${t.color}30`, borderRadius:14, padding:'14px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{t.emoji}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:t.color, fontFamily:'Sora, sans-serif', marginBottom:2 }}>{t.label}</div>
                  <div style={{ fontSize:16, fontWeight:900, color:'#fff', fontFamily:'Sora, sans-serif', marginBottom:4 }}>₡{t.price.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>{t.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowCallerSheet(true)} style={{ width:'100%', padding:'13px', borderRadius:14, background:'linear-gradient(135deg,#f97316,#d4a017)', border:'none', color:'#07090a', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'Sora, sans-serif' }}>
              📞 Call Now · Join Queue
            </button>
          </div>

          {/* How it works */}
          <div style={{ ...S.card, padding:'16px', marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.5)', marginBottom:12, fontFamily:'Sora, sans-serif', letterSpacing:1 }}>HOW IT WORKS</div>
            {[
              { n:'1', t:'Pick a show + enter your phone number', s:'Choose the live show you want to call into', c:'#f97316' },
              { n:'2', t:'Choose your Cowrie tier', s:'Standard ₡500 · VIP ₡2,000 (guaranteed 10 min)', c:'#fbbf24' },
              { n:'3', t:'Our system calls your number', s:'Your phone will ring when your turn is coming', c:'#4ade80' },
              { n:'4', t:'Host accepts you on air', s:'Your voice goes LIVE to the entire community', c:'#c084fc' },
            ].map(step => (
              <div key={step.n} style={{ display:'flex', gap:12, marginBottom:12 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:`${step.c}20`, border:`1px solid ${step.c}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:step.c, flexShrink:0 }}>{step.n}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.85)' }}>{step.t}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>{step.s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Calls Today', value:'47', c:'#4ade80' },
              { label:'Earned Today', value:'₡43,500', c:'#fbbf24' },
              { label:'Wait (Standard)', value:'18 min', c:'#22d3ee' },
              { label:'Wait (VIP)', value:'6 min', c:'#f97316' },
            ].map(st => (
              <div key={st.label} className="ipe-fade" style={{ ...S.card, padding:'14px' }}>
                <div style={{ fontSize:20, fontWeight:800, color:st.c, fontFamily:'Sora, sans-serif' }}>{st.value}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ HOST VIEW ═══ */}
      {mode === 'host' && (
        <div style={{ padding:'16px 20px' }}>
          {/* Currently on air */}
          <div style={{ position:'relative', marginBottom:20 }}>
            <div className="ipe-ring-outer" style={{ position:'absolute', top:'50%', left:28, transform:'translate(-50%,-50%)', width:64, height:64, borderRadius:'50%', border:'2px solid rgba(74,222,128,.3)', zIndex:0 }} />
            <div className="ipe-ring" style={{ position:'absolute', top:'50%', left:28, transform:'translate(-50%,-50%)', width:52, height:52, borderRadius:'50%', border:'2px solid rgba(74,222,128,.5)', zIndex:0 }} />
            <div style={{ ...S.card, padding:'16px', background:'rgba(13,26,13,.9)', border:'1px solid rgba(74,222,128,.25)', position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(74,222,128,.15)', border:'2px solid #4ade80', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{onAir?.avatar ?? '🎙'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:'#f0f5ee', fontFamily:'Sora, sans-serif' }}>{onAir?.name ?? '—'}</div>
                    <span style={{ fontSize:9, background:'rgba(74,222,128,.15)', color:'#4ade80', border:'1px solid rgba(74,222,128,.25)', borderRadius:99, padding:'1px 6px', fontWeight:700 }}>ON AIR</span>
                    {onAir?.tier==='VIP' && <span style={{ fontSize:9, background:'rgba(249,115,22,.15)', color:'#f97316', border:'1px solid rgba(249,115,22,.3)', borderRadius:99, padding:'1px 6px', fontWeight:700 }}>VIP 👑</span>}
                  </div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', marginTop:2 }}>{onAir?.village ?? ''}</div>
                </div>
                <div style={{ fontFamily:'Sora, sans-serif', fontSize:18, fontWeight:800, color:'#4ade80' }}>{duration}</div>
              </div>
              {/* Waveform */}
              <div style={{ display:'flex', alignItems:'center', gap:3, height:32, marginBottom:12, justifyContent:'center' }}>
                {['.6s','.9s','.5s','.7s','.4s','.8s','.6s','.9s','.5s','.7s','.4s','.8s'].map((d,i) => (
                  <div key={i} className="ipe-wave-bar" style={{ '--d':d } as React.CSSProperties} />
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => {setCallerMuted(m=>!m);showToast(callerMuted?'🔊 Caller unmuted':'🔇 Caller muted')}} style={{ flex:1, padding:'9px', borderRadius:10, background:callerMuted?'rgba(239,68,68,.12)':'rgba(255,255,255,.07)', border:`1px solid ${callerMuted?'rgba(239,68,68,.25)':'rgba(255,255,255,.1)'}`, color:callerMuted?'#ef4444':'rgba(255,255,255,.7)', fontSize:11, fontWeight:700, cursor:'pointer' }}>{callerMuted?'🔊 Unmute':'🔇 Mute'}</button>
                <button onClick={dropCaller} style={{ flex:1, padding:'9px', borderRadius:10, background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.25)', color:'#ef4444', fontSize:11, fontWeight:700, cursor:'pointer' }}>📵 Drop</button>
              </div>
            </div>
          </div>

          {/* Queue */}
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.5)', marginBottom:10, fontFamily:'Sora, sans-serif', letterSpacing:1 }}>CALL QUEUE · {queue.length} CALLER{queue.length===1?'':'S'}</div>
          {queue.map((caller, i) => (
            <div key={caller.id} className="ipe-fade" style={{ animationDelay:`${i*.06}s`, ...S.card, padding:'12px 14px', marginBottom:10, display:'flex', gap:10, alignItems:'center', borderLeft:`3px solid ${caller.tier==='VIP'?'#f97316':'rgba(255,255,255,.1)'}` }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{caller.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.9)', fontFamily:'Sora, sans-serif' }}>{caller.name}</span>
                  <span style={{ fontSize:9, background:caller.tier==='VIP'?'rgba(249,115,22,.15)':'rgba(255,255,255,.06)', color:caller.tier==='VIP'?'#f97316':'rgba(255,255,255,.4)', border:`1px solid ${caller.tier==='VIP'?'rgba(249,115,22,.3)':'rgba(255,255,255,.1)'}`, borderRadius:99, padding:'1px 5px', fontWeight:700 }}>
                    {caller.tier==='VIP'?'👑 VIP':'Queue'}
                  </span>
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginBottom:4 }}>{caller.village} · ⏱ {caller.wait}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', fontStyle:'italic', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>"{caller.message}"</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                <button onClick={() => acceptCaller(caller.id)} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(74,222,128,.15)', border:'1px solid rgba(74,222,128,.3)', color:'#4ade80', fontSize:11, fontWeight:700, cursor:'pointer' }}>Accept ✓</button>
                <button onClick={() => setQueue(prev => prev.filter(q => q.id !== caller.id))} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', color:'#f87171', fontSize:11, fontWeight:700, cursor:'pointer' }}>Decline ✗</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ CALLER SHEET ═══ */}
      {showCallerSheet && (
        <>
          <div style={S.overlay} onClick={() => { setShowCallerSheet(false); setSheet(1) }} />
          <div style={S.sheet} className="ipe-sheet-up">
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,.15)', margin:'0 auto 20px' }} />
            {callSent ? (
              <div style={{ textAlign:'center', padding:'30px 0' }}>
                <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:'Sora, sans-serif', color:'#4ade80', marginBottom:8 }}>Call Submitted!</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.55)', lineHeight:1.7 }}>
                  Our system will call your number shortly.<br/>
                  Your position in queue: <strong style={{ color:'#fbbf24' }}>#7</strong>
                </div>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div style={{ display:'flex', gap:6, marginBottom:20, justifyContent:'center' }}>
                  {[1,2,3,4].map(n => (
                    <div key={n} style={{ width:n===sheet?24:8, height:8, borderRadius:4, background:n<=sheet?'#f97316':'rgba(255,255,255,.15)', transition:'all .3s' }} />
                  ))}
                </div>

                {sheet===1 && (
                  <>
                    <div style={{ fontSize:15, fontWeight:800, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', marginBottom:16 }}>1 · Select Live Show</div>
                    {liveShows.map(show => (
                      <div key={show.id} onClick={() => setSelectedShow(show.id)} style={{ ...S.card, padding:'12px 14px', marginBottom:10, cursor:'pointer', border:`1px solid ${selectedShow===show.id?'rgba(249,115,22,.4)':'rgba(255,255,255,.07)'}`, background:selectedShow===show.id?'rgba(249,115,22,.06)':'#0d1008', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.9)', fontFamily:'Sora, sans-serif', marginBottom:2 }}>{show.title}</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,.4)' }}>{show.host} · 👁 {show.viewers.toLocaleString()}</div>
                        </div>
                        {selectedShow===show.id && <span style={{ fontSize:18, color:'#f97316' }}>✓</span>}
                      </div>
                    ))}
                    <button onClick={() => selectedShow && setSheet(2)} disabled={!selectedShow} style={{ width:'100%', padding:13, borderRadius:14, background:selectedShow?'linear-gradient(135deg,#f97316,#d4a017)':'rgba(255,255,255,.08)', border:'none', color:selectedShow?'#07090a':'rgba(255,255,255,.3)', fontWeight:700, fontSize:14, cursor:selectedShow?'pointer':'not-allowed', marginTop:8 }}>Continue →</button>
                  </>
                )}

                {sheet===2 && (
                  <>
                    <div style={{ fontSize:15, fontWeight:800, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', marginBottom:16 }}>2 · Select Cowrie Tier</div>
                    {TIERS.map(t => (
                      <div key={t.id} onClick={() => setSelectedTier(t.id as any)} style={{ ...S.card, padding:'16px', marginBottom:12, cursor:'pointer', border:`1.5px solid ${selectedTier===t.id?t.color+'60':'rgba(255,255,255,.07)'}`, background:selectedTier===t.id?`${t.color}08`:'#0d1008' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:28 }}>{t.emoji}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:800, color:t.color, fontFamily:'Sora, sans-serif' }}>{t.label}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:2 }}>{t.desc}</div>
                          </div>
                          <div style={{ fontSize:18, fontWeight:900, color:'#fff', fontFamily:'Sora, sans-serif' }}>₡{t.price.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display:'flex', gap:10, marginTop:8 }}>
                      <button onClick={() => setSheet(1)} style={{ flex:1, padding:13, borderRadius:14, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', fontWeight:700, fontSize:13, cursor:'pointer' }}>← Back</button>
                      <button onClick={() => setSheet(3)} style={{ flex:2, padding:13, borderRadius:14, background:'linear-gradient(135deg,#f97316,#d4a017)', border:'none', color:'#07090a', fontWeight:700, fontSize:14, cursor:'pointer' }}>Continue →</button>
                    </div>
                  </>
                )}

                {sheet===3 && (
                  <>
                    <div style={{ fontSize:15, fontWeight:800, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', marginBottom:16 }}>3 · Your Phone Number</div>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>PHONE NUMBER</div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 xxx xxx xxxx" style={{ ...S.input, fontSize:16 }} />
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:6 }}>We will call this number when it's your turn.</div>
                    </div>
                    <div style={{ marginBottom:20 }}>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>YOUR MESSAGE TO THE SHOW (max 100)</div>
                      <textarea value={message} onChange={e => setMessage(e.target.value.slice(0,100))} placeholder="What do you want to say on the show…" rows={3} style={{ ...S.input, resize:'none' }} />
                      <div style={{ textAlign:'right', fontSize:10, color:'rgba(255,255,255,.3)', marginTop:3 }}>{message.length}/100</div>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => setSheet(2)} style={{ flex:1, padding:13, borderRadius:14, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', fontWeight:700, fontSize:13, cursor:'pointer' }}>← Back</button>
                      <button onClick={() => phone.trim() && setSheet(4)} disabled={!phone.trim()} style={{ flex:2, padding:13, borderRadius:14, background:phone.trim()?'linear-gradient(135deg,#f97316,#d4a017)':'rgba(255,255,255,.08)', border:'none', color:phone.trim()?'#07090a':'rgba(255,255,255,.3)', fontWeight:700, fontSize:14, cursor:phone.trim()?'pointer':'not-allowed' }}>Continue →</button>
                    </div>
                  </>
                )}

                {sheet===4 && (
                  <>
                    <div style={{ fontSize:15, fontWeight:800, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', marginBottom:16 }}>4 · Confirm</div>
                    <div style={{ ...S.card, padding:'16px', marginBottom:20 }}>
                      {[
                        { l:'Show', v:liveShows.find(s=>s.id===selectedShow)?.title??'—' },
                        { l:'Tier', v:`${TIERS.find(t=>t.id===selectedTier)?.label} · ₡${TIERS.find(t=>t.id===selectedTier)?.price.toLocaleString()}` },
                        { l:'Phone', v:phone },
                        { l:'Message', v:message||'—' },
                      ].map(row => (
                        <div key={row.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                          <span style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>{row.l}</span>
                          <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.85)', maxWidth:'55%', textAlign:'right' }}>{row.v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => setSheet(3)} style={{ flex:1, padding:13, borderRadius:14, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', fontWeight:700, fontSize:13, cursor:'pointer' }}>← Back</button>
                      <button onClick={sendCall} style={{ flex:2, padding:13, borderRadius:14, background:'linear-gradient(135deg,#f97316,#d4a017)', border:'none', color:'#07090a', fontWeight:800, fontSize:14, cursor:'pointer' }}>📞 Submit Call</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
