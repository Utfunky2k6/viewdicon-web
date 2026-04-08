'use client'
// ════════════════════════════════════════════════════════════════
// VOICE BURST — 90-second voices from the village
// TikTok-style voice notes · Kíla · Stir · Comment
// ════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { USE_MOCKS } from '@/lib/flags'
import UnderConstruction from '@/components/ui/UnderConstruction'

const INJECT_ID = 'voice-burst-css'
const CSS = `
@keyframes waveBar{0%,100%{height:4px}50%{height:18px}}
@keyframes vbFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes vbGlow{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.15)}50%{box-shadow:0 0 18px 4px rgba(212,160,23,.1)}}
@keyframes recBlink{0%,100%{opacity:1}50%{opacity:.3}}
.vb-fade{animation:vbFade .4s ease both}
.vb-glow{animation:vbGlow 3s ease-in-out infinite}
.wave-bar{border-radius:3px;width:4px;background:linear-gradient(to top,#d4a017,#1a7c3e);display:inline-block;margin:0 2px;animation:waveBar 1.1s ease-in-out infinite}
.rec-blink{animation:recBlink 1s ease-in-out infinite}
`

const KENTE = ['#d4a017','#1a7c3e','#b22222','#d4a017','#1a7c3e','#b22222','#d4a017','#1a7c3e']

const MOCK_VOICES = [
  { id:'v1', authorEmoji:'👩🏾', authorName:'Adaeze Okafor',  villageName:'Health',      villageIcon:'⚕',  villageColor:'#10b981', duration:'0:47', kilaCount:312, stirCount:48,  commentCount:27, heatScore:92, caption:'Morning herbs for immune strength — what our grandmothers always knew' },
  { id:'v2', authorEmoji:'👨🏿', authorName:'Kwame Asante',   villageName:'Commerce',    villageIcon:'🛒', villageColor:'#eab308', duration:'1:21', kilaCount:198, stirCount:34,  commentCount:19, heatScore:87, caption:'Trade route Lagos → Accra under 72 hours — full breakdown of my experience' },
  { id:'v3', authorEmoji:'👩🏽', authorName:'Fatima Diallo',  villageName:'Agriculture', villageIcon:'🌾', villageColor:'#84cc16', duration:'0:58', kilaCount:445, stirCount:67,  commentCount:41, heatScore:96, caption:'Rainy season prep — 3 crops that triple yield with local compost alone' },
  { id:'v4', authorEmoji:'👴🏿', authorName:'Elder Babatunde', villageName:'Arts',       villageIcon:'🎨', villageColor:'#ec4899', duration:'1:30', kilaCount:678, stirCount:112, commentCount:88, heatScore:99, caption:'The Kente weave holds the history of a thousand battles — listen to understand' },
  { id:'v5', authorEmoji:'👩🏾', authorName:'Amara Bangura',  villageName:'Education',   villageIcon:'📚', villageColor:'#3b82f6', duration:'0:34', kilaCount:87,  stirCount:12,  commentCount:8,  heatScore:74, caption:'Free coding lessons tonight in the square — bring your children, all welcome' },
  { id:'v6', authorEmoji:'🧑🏽', authorName:'Seun Adeyemi',   villageName:'Finance',     villageIcon:'₵',  villageColor:'#f59e0b', duration:'1:08', kilaCount:234, stirCount:56,  commentCount:31, heatScore:89, caption:'Cowrie circle payout this Friday — 14 members received ₵3,200 each' },
  { id:'v7', authorEmoji:'👩🏿', authorName:'Nkechi Eze',     villageName:'Family',      villageIcon:'🏡', villageColor:'#f97316', duration:'0:52', kilaCount:156, stirCount:22,  commentCount:14, heatScore:81, caption:"My grandmother's naming ceremony story — 40 years ago today, the village danced" },
  { id:'v8', authorEmoji:'👨🏾', authorName:'Tunde Adefope',  villageName:'Technology',  villageIcon:'💻', villageColor:'#06b6d4', duration:'1:15', kilaCount:321, stirCount:78,  commentCount:45, heatScore:93, caption:'Built a market price scanner using a ₦3,000 phone — here is exactly how' },
]

const WAVE_DELAYS = ['0s','0.18s','0.36s','0.09s','0.27s','0.45s']

function WaveViz({ active }: { active: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', height:24, gap:1, flex:1 }}>
      {WAVE_DELAYS.map((d, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{ animationDelay:d, animationPlayState:active?'running':'paused', opacity:active?1:0.35 }}
        />
      ))}
    </div>
  )
}

function heatColor(score: number): string {
  if (score >= 95) return '#ef4444'
  if (score >= 85) return '#f97316'
  if (score >= 70) return '#d4a017'
  return '#6b7280'
}

function VoiceCard({ v, playing, onPlay, kilaed, onKila }: any) {
  return (
    <div
      className="vb-fade vb-glow"
      style={{
        background:'#101418',
        border:`1px solid ${playing ? '#d4a01744' : '#1e2630'}`,
        borderRadius:14,
        padding:'14px 16px',
        marginBottom:12,
        transition:'border-color .2s',
      }}
    >
      {/* Author row */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <span style={{ fontSize:32, lineHeight:1 }}>{v.authorEmoji}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'#f0ece4', fontWeight:600, fontSize:14, marginBottom:4 }}>{v.authorName}</div>
          <span style={{ background:v.villageColor+'22', color:v.villageColor, borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:600 }}>
            {v.villageIcon} {v.villageName}
          </span>
        </div>
        <span style={{ background:`${heatColor(v.heatScore)}22`, color:heatColor(v.heatScore), borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:700, flexShrink:0 }}>
          🔥 {v.heatScore}
        </span>
      </div>

      {/* Caption */}
      <p style={{ color:'#9aa3b0', fontSize:13, margin:'0 0 12px', lineHeight:1.55 }}>{v.caption}</p>

      {/* Visualizer + play row */}
      <div style={{ display:'flex', alignItems:'center', gap:12, background:'#0a0d10', borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
        <button
          onClick={() => onPlay(v.id)}
          style={{
            background:playing ? '#d4a017' : '#1a7c3e',
            border:'none',
            borderRadius:'50%',
            width:36,
            height:36,
            cursor:'pointer',
            fontSize:15,
            flexShrink:0,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            transition:'background .2s',
          }}
        >
          {playing ? '⏸' : '▶️'}
        </button>
        <WaveViz active={playing} />
        <span style={{ color:'#6b7280', fontSize:12, flexShrink:0, fontWeight:500 }}>{v.duration}</span>
      </div>

      {/* Controls row */}
      <div style={{ display:'flex', gap:20, alignItems:'center' }}>
        <button
          onClick={() => onKila(v.id)}
          style={{
            background:'none',
            border:'none',
            cursor:'pointer',
            color:kilaed ? '#d4a017' : '#6b7280',
            fontSize:13,
            display:'flex',
            alignItems:'center',
            gap:5,
            padding:0,
            fontFamily:'Sora,sans-serif',
            fontWeight:kilaed ? 700 : 400,
          }}
        >
          ⭐ {kilaed ? v.kilaCount + 1 : v.kilaCount}
        </button>
        <span style={{ color:'#6b7280', fontSize:13, display:'flex', alignItems:'center', gap:5 }}>🫧 {v.stirCount}</span>
        <span style={{ color:'#6b7280', fontSize:13, display:'flex', alignItems:'center', gap:5 }}>💬 {v.commentCount}</span>
      </div>
    </div>
  )
}

export default function VoiceBurstPage() {
  if (!USE_MOCKS) return <UnderConstruction module="Voice Burst" />
  const router = useRouter()
  const [playing, setPlaying] = React.useState<string | null>(null)
  const [kilaed, setKilaed] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (document.getElementById(INJECT_ID)) return
    const s = document.createElement('style')
    s.id = INJECT_ID
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  function togglePlay(id: string) {
    setPlaying(p => (p === id ? null : id))
  }

  function toggleKila(id: string) {
    setKilaed(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <div style={{ background:'#07090a', minHeight:'100vh', color:'#f0ece4', fontFamily:'Sora,sans-serif', paddingBottom:88 }}>

      {/* Kente stripe */}
      <div style={{ height:6, display:'flex' }}>
        {KENTE.map((c, i) => <div key={i} style={{ flex:1, background:c }} />)}
      </div>

      {/* Header */}
      <div style={{ padding:'14px 16px 0' }}>
        <button
          onClick={() => router.back()}
          style={{ background:'none', border:'none', color:'#9aa3b0', cursor:'pointer', fontSize:13, marginBottom:10, padding:0, fontFamily:'Sora,sans-serif' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 2px', letterSpacing:'-0.3px' }}>Voice Burst 🎙</h1>
        <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 18px' }}>90-second voices from the village</p>
      </div>

      {/* Voice cards */}
      <div style={{ padding:'0 16px' }}>
        {MOCK_VOICES.map((v, i) => (
          <div key={v.id} style={{ animationDelay:`${i * 0.06}s` }}>
            <VoiceCard
              v={v}
              playing={playing === v.id}
              onPlay={togglePlay}
              kilaed={kilaed.has(v.id)}
              onKila={toggleKila}
            />
          </div>
        ))}
      </div>

      {/* Record CTA — fixed bottom */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#07090a', borderTop:'1px solid #1e2630', padding:'12px 16px' }}>
        <button
          onClick={() => router.push('/dashboard/feed?createOpen=voice')}
          style={{
            width:'100%',
            background:'linear-gradient(135deg,#1a7c3e,#d4a017)',
            border:'none',
            borderRadius:12,
            padding:'14px',
            color:'#07090a',
            fontWeight:700,
            fontSize:15,
            cursor:'pointer',
            fontFamily:'Sora,sans-serif',
            letterSpacing:'0.2px',
          }}
        >
          🎙 Record Your Voice Burst
        </button>
      </div>

    </div>
  )
}
