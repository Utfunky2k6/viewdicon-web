'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

type ChannelType = 'UMOJA_1' | 'AFRI_REALITY' | 'OPEN_RIVER'

interface TVChannel {
  id: string; name: string; type: ChannelType; isLive: boolean
  viewers: number; host: string; topic: string; thumbnail: string
}

// Channels (initially empty — fetched from jollof-tv backend)
const INITIAL_CHANNELS: TVChannel[] = []

const CHANNEL_META: Record<ChannelType, { label: string; color: string; desc: string }> = {
  UMOJA_1:      { label: 'Umoja-1',     color: '#D7A85F', desc: 'Flagship programming' },
  AFRI_REALITY: { label: 'AfriReality', color: '#E85D04', desc: 'Real stories, real Africa' },
  OPEN_RIVER:   { label: 'Open River',  color: '#22C55E', desc: 'Open community streams' },
}

const STREAM_TYPES = [
  { id:'market',   emoji:'🧺', label:'Market Day',    desc:'Sell goods live to your village' },
  { id:'healing',  emoji:'🌿', label:'Healing Circle', desc:'Wellness, herbs, traditional medicine' },
  { id:'craft',    emoji:'🎨', label:'Craft Session',  desc:'Live craft, art, or fashion show' },
  { id:'farm',     emoji:'🌾', label:'Farm Update',    desc:'Field-to-table, crop reports' },
  { id:'knowledge',emoji:'📚', label:'Knowledge Fire', desc:'Teach, lecture, workshop' },
  { id:'oracle',   emoji:'🦅', label:'Oracle Session', desc:'Griot wisdom, elder stories' },
]

// ── GoLive Sheet ─────────────────────────────────────────────────
function GoLiveSheet({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = React.useState<'type'|'config'|'check'|'live'>('type')
  const [streamType, setStreamType] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [checklist, setChecklist] = React.useState({ lighting: false, audio: false, background: false, attire: false })
  const rtmpKey = 'UMOJA-' + Math.random().toString(36).slice(2, 10).toUpperCase()

  const allChecked = Object.values(checklist).every(Boolean)

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ flex:1, background:'rgba(0,0,0,.7)', backdropFilter:'blur(6px)' }} />
      <div style={{ background:'#080f09', border:'1px solid rgba(26,124,62,.2)', borderRadius:'24px 24px 0 0', padding:'0 0 40px', maxHeight:'85vh', overflowY:'auto' }}>

        {/* Handle + header */}
        <div style={{ padding:'12px 20px 10px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          <div style={{ width:40, height:4, borderRadius:99, background:'rgba(255,255,255,.15)', margin:'0 auto 14px' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:16, fontWeight:900, color:'#f0f7f0', fontFamily:'Sora,sans-serif' }}>
              {phase==='type' && '🔴 Choose Your Stream Type'}
              {phase==='config' && '⚙️ Configure Stream'}
              {phase==='check' && '✅ Pre-Stream Checklist'}
              {phase==='live' && '🔴 You Are Live!'}
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,.08)', border:'none', borderRadius:8, width:30, height:30, color:'rgba(255,255,255,.5)', fontSize:14, cursor:'pointer' }}>✕</button>
          </div>
          {/* Step dots */}
          <div style={{ display:'flex', gap:6, marginTop:10 }}>
            {(['type','config','check','live'] as const).map(p => (
              <div key={p} style={{ height:3, flex:1, borderRadius:99, background: phase===p||['config','check','live'].indexOf(p)<=(['type','config','check','live'].indexOf(phase)) ? '#1a7c3e' : 'rgba(255,255,255,.1)', transition:'background .3s' }} />
            ))}
          </div>
        </div>

        <div style={{ padding:'20px' }}>
          {/* Phase 1: Type */}
          {phase === 'type' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {STREAM_TYPES.map(t => (
                <button key={t.id} onClick={() => setStreamType(t.id)}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, border:`1.5px solid ${streamType===t.id ? '#1a7c3e' : 'rgba(255,255,255,.08)'}`, background:streamType===t.id ? 'rgba(26,124,62,.12)' : 'rgba(255,255,255,.03)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}>
                  <span style={{ fontSize:26 }}>{t.emoji}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#f0f7f0' }}>{t.label}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>{t.desc}</div>
                  </div>
                  {streamType===t.id && <span style={{ marginLeft:'auto', color:'#4ade80', fontSize:16 }}>✓</span>}
                </button>
              ))}
              <button onClick={() => streamType && setPhase('config')} disabled={!streamType}
                style={{ marginTop:8, padding:'14px 0', borderRadius:14, border:'none', background:streamType ? 'linear-gradient(135deg,#1a7c3e,#0f5028)' : 'rgba(255,255,255,.06)', color:streamType ? '#fff' : 'rgba(255,255,255,.25)', fontSize:14, fontWeight:800, cursor:streamType ? 'pointer' : 'not-allowed', transition:'all .2s' }}>
                Continue →
              </button>
            </div>
          )}

          {/* Phase 2: Config */}
          {phase === 'config' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Stream Title</div>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Describe what you're showing today…"
                  style={{ width:'100%', padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(255,255,255,.1)', color:'#fff', fontSize:14, outline:'none', fontFamily:'inherit' }} />
              </div>
              <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(212,160,23,.08)', border:'1px solid rgba(212,160,23,.2)' }}>
                <div style={{ fontSize:11, color:'#d4a017', fontWeight:700, marginBottom:4 }}>Cowrie Spray enabled</div>
                <div style={{ fontSize:10, color:'rgba(212,160,23,.6)' }}>Viewers can spray Cowrie during your stream. You keep 85%, 15% to village treasury.</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setPhase('type')} style={{ flex:1, padding:'12px 0', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', cursor:'pointer', fontSize:13 }}>← Back</button>
                <button onClick={() => title.trim() && setPhase('check')} disabled={!title.trim()}
                  style={{ flex:2, padding:'12px 0', borderRadius:12, background:title.trim() ? 'linear-gradient(135deg,#1a7c3e,#0f5028)' : 'rgba(255,255,255,.06)', border:'none', color:title.trim() ? '#fff' : 'rgba(255,255,255,.25)', cursor:title.trim() ? 'pointer' : 'not-allowed', fontSize:13, fontWeight:800, transition:'all .2s' }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Phase 3: Checklist */}
          {phase === 'check' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[['lighting','💡','Good lighting on your face'],['audio','🎤','Microphone or speaker clear'],['background','🏡','Background is clean or on-brand'],['attire','👘','Attire fits your stream type']].map(([key,icon,label]) => (
                <div key={key} onClick={() => setChecklist(c => ({ ...c, [key]: !c[key as keyof typeof c] }))}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 14px', borderRadius:12, border:`1.5px solid ${checklist[key as keyof typeof checklist] ? '#1a7c3e' : 'rgba(255,255,255,.08)'}`, background:checklist[key as keyof typeof checklist] ? 'rgba(26,124,62,.1)' : 'rgba(255,255,255,.03)', cursor:'pointer', transition:'all .15s' }}>
                  <span style={{ fontSize:22 }}>{icon}</span>
                  <span style={{ flex:1, fontSize:13, color:'#f0f7f0' }}>{label}</span>
                  <div style={{ width:24, height:24, borderRadius:8, border:`2px solid ${checklist[key as keyof typeof checklist] ? '#1a7c3e' : 'rgba(255,255,255,.2)'}`, background:checklist[key as keyof typeof checklist] ? '#1a7c3e' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, transition:'all .2s' }}>
                    {checklist[key as keyof typeof checklist] && '✓'}
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button onClick={() => setPhase('config')} style={{ flex:1, padding:'12px 0', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', cursor:'pointer', fontSize:13 }}>← Back</button>
                <button onClick={() => allChecked && setPhase('live')} disabled={!allChecked}
                  style={{ flex:2, padding:'12px 0', borderRadius:12, background:allChecked ? 'linear-gradient(135deg,#b22222,#7f1d1d)' : 'rgba(255,255,255,.06)', border:'none', color:allChecked ? '#fff' : 'rgba(255,255,255,.25)', cursor:allChecked ? 'pointer' : 'not-allowed', fontSize:13, fontWeight:800, transition:'all .2s' }}>
                  {allChecked ? '🔴 Go Live Now' : `Check all ${Object.values(checklist).filter(Boolean).length}/4 items`}
                </button>
              </div>
            </div>
          )}

          {/* Phase 4: Live */}
          {phase === 'live' && (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:64, marginBottom:16 }}>🔴</div>
              <div style={{ fontSize:20, fontWeight:900, color:'#f0f7f0', fontFamily:'Sora,sans-serif', marginBottom:8 }}>You Are Live!</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:24 }}>{title}</div>
              <div style={{ padding:'14px', borderRadius:14, background:'rgba(26,124,62,.08)', border:'1px solid rgba(26,124,62,.2)', marginBottom:20 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>🔑 Your RTMP Stream Key</div>
                <div style={{ fontFamily:'monospace', fontSize:13, color:'#4ade80', letterSpacing:'.06em', wordBreak:'break-all' }}>{rtmpKey}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', marginTop:6 }}>Use this key in OBS, StreamYard, or UMOJA Studio</div>
              </div>
              <button onClick={onClose} style={{ width:'100%', padding:'14px 0', borderRadius:14, background:'rgba(178,34,34,.15)', border:'1px solid rgba(178,34,34,.4)', color:'#f87171', fontSize:13, fontWeight:800, cursor:'pointer' }}>⏹ End Stream</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Stream Viewer Overlay ─────────────────────────────────────────
function StreamViewer({ channel, onClose }: { channel: TVChannel; onClose: () => void }) {
  const [spraying, setSpraying] = React.useState(false)
  const [kila, setKila] = React.useState(0)
  const [chatMsg, setChatMsg] = React.useState('')
  const [chatLog, setChatLog] = React.useState<string[]>(['🌍 Stream started', '🥁 Amina: Great energy!'])

  const handleSpray = () => { setSpraying(true); setTimeout(() => setSpraying(false), 2000) }
  const handleSend = () => {
    if (!chatMsg.trim()) return
    setChatLog(prev => [...prev, `You: ${chatMsg}`])
    setChatMsg('')
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'#000', display:'flex', flexDirection:'column' }}>
      {/* Stream area */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, position:'relative', background:'linear-gradient(135deg,#060b07,#1a2d1b)' }}>
        {channel.thumbnail}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.8) 0%,transparent 50%)' }} />

        {/* LIVE badge */}
        <div style={{ position:'absolute', top:16, left:16, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ background:'#ef4444', color:'#fff', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff', animation:'pulse 1s ease-in-out infinite' }} />LIVE
          </span>
          <span style={{ background:'rgba(0,0,0,.6)', color:'#fff', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600 }}>
            👁 {(channel.viewers + kila * 3).toLocaleString()}
          </span>
        </div>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,.5)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', fontSize:16, cursor:'pointer' }}>✕</button>

        {/* Cowrie spray */}
        {spraying && (
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            {Array.from({length:12}).map((_,i) => (
              <span key={i} style={{ position:'absolute', fontSize:22, left:`${20+Math.random()*60}%`, bottom:0, animation:`cowrie-float ${1.5+Math.random()}s ease-out forwards`, animationDelay:`${Math.random()*0.5}s`, opacity:0 }}>🐚</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ position:'absolute', right:16, bottom:120, display:'flex', flexDirection:'column', gap:14, alignItems:'center' }}>
          {[
            { emoji:'🏺', label:'Spray', action:handleSpray },
            { emoji:'⭐', label:`${kila>0 ? kila : 'Kíla'}`, action:() => setKila(k => k+1) },
            { emoji:'🥁', label:'Drum',  action:() => {} },
          ].map(a => (
            <div key={a.label} onClick={a.action} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, transition:'all .2s' }}>{a.emoji}</div>
              <span style={{ fontSize:9, color:'rgba(255,255,255,.8)', fontWeight:700 }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom info */}
        <div style={{ position:'absolute', left:0, right:60, bottom:100, padding:'0 16px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:2 }}>{channel.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>{channel.host} · {channel.topic}</div>
        </div>
      </div>

      {/* Live chat */}
      <div style={{ height:180, background:'#0d1a0e', borderTop:'1px solid rgba(255,255,255,.06)', display:'flex', flexDirection:'column' }}>
        <div style={{ flex:1, overflowY:'auto', padding:'8px 14px', display:'flex', flexDirection:'column', gap:4 }}>
          {chatLog.map((m, i) => (
            <div key={i} style={{ fontSize:11, color: m.startsWith('You:') ? '#4ade80' : 'rgba(255,255,255,.7)' }}>{m}</div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, padding:'8px 14px 16px' }}>
          <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()}
            placeholder="Say something to the village…"
            style={{ flex:1, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', color:'#fff', fontSize:13, outline:'none', fontFamily:'inherit' }} />
          <button onClick={handleSend} style={{ padding:'10px 16px', borderRadius:12, background:'#1a7c3e', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>🥁</button>
        </div>
      </div>
    </div>
  )
}

export default function TVPage() {
  const router = useRouter()
  const [activeChannel, setActiveChannel] = React.useState<ChannelType | 'ALL'>('ALL')
  const [showGoLive, setShowGoLive] = React.useState(false)
  const [watchingChannel, setWatchingChannel] = React.useState<TVChannel | null>(null)
  const [remindedIds, setRemindedIds] = React.useState<Set<string>>(new Set())

  const liveChannels = INITIAL_CHANNELS.filter((c) => c.isLive)

  const filtered = activeChannel === 'ALL'
    ? INITIAL_CHANNELS
    : INITIAL_CHANNELS.filter((c) => c.type === activeChannel)

  const handleRemind = (id: string) => {
    setRemindedIds(prev => { const next = new Set(prev); next.add(id); return next })
  }

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">📺 UMOJA-FIRE</h1>
          <p className="text-xs text-gray-400 mt-0.5">{liveChannels.length} live now</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowGoLive(true)}>🔴 Go Live</Button>
      </div>

      {/* Channel type tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {[['ALL', '🌍', 'All'], ...Object.entries(CHANNEL_META).map(([k, v]) => [k, '📺', v.label])].map(([id, emoji, label]) => (
          <button
            key={id}
            onClick={() => setActiveChannel(id as ChannelType | 'ALL')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium flex-shrink-0 border-b-2 transition-all ${
              activeChannel === id ? 'border-kente-gold text-kente-gold' : 'border-transparent text-gray-500'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Live now */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-gray-400 mb-3">🔴 LIVE NOW</p>
        <div className="space-y-3">
          {filtered.filter((c) => c.isLive).map((ch) => {
            const meta = CHANNEL_META[ch.type]
            return (
              <div key={ch.id} onClick={() => setWatchingChannel(ch)}
                className="bg-bg-elevated border border-border rounded-2xl overflow-hidden hover:border-border-strong transition-all cursor-pointer">
                {/* Thumbnail */}
                <div className="h-36 bg-gradient-to-br from-bg-overlay to-bg-surface flex items-center justify-center text-5xl relative">
                  {ch.thumbnail}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>
                    <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">👁 {ch.viewers.toLocaleString()}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge size="sm" style={{ background: `${meta.color}22`, borderColor: meta.color, color: meta.color } as React.CSSProperties}>{meta.label}</Badge>
                  </div>
                </div>
                {/* Info */}
                <div className="px-3 py-3 flex items-start gap-2">
                  <Avatar name={ch.host} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ch.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ch.host} · {ch.topic}</p>
                  </div>
                  <Button size="sm" variant="primary" onClick={e => { e.stopPropagation(); setWatchingChannel(ch) }}>Watch</Button>
                </div>
              </div>
            )
          })}

          {filtered.filter((c) => c.isLive).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No live streams in this channel right now</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming */}
      {filtered.filter((c) => !c.isLive).length > 0 && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs font-medium text-gray-400 mb-3">⏰ UPCOMING</p>
          <div className="space-y-2">
            {filtered.filter((c) => !c.isLive).map((ch) => (
              <div key={ch.id} className="flex items-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-xl flex-shrink-0">{ch.thumbnail}</div>
                <div className="flex-1">
                  <p className="text-sm text-white">{ch.name}</p>
                  <p className="text-xs text-gray-500">{ch.host} · {ch.topic}</p>
                </div>
                <Button variant={remindedIds.has(ch.id) ? 'primary' : 'secondary'} size="sm"
                  onClick={() => handleRemind(ch.id)}>
                  {remindedIds.has(ch.id) ? '✓ Reminded' : 'Remind'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time-Gourds (schedule) */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs font-medium text-gray-400 mb-2">⏳ Time-Gourds (Today&apos;s Schedule)</p>
        <div className="space-y-1">
          {[
            { time: '18:00 WAT', show: 'Sòrò Sókè Hour',         host: 'Community',   channel: 'UMOJA_1' },
            { time: '19:00 WAT', show: 'Pan-African Music',        host: 'Zara Diallo', channel: 'UMOJA_1' },
            { time: '20:30 WAT', show: 'Kumbuka-Cycle: History',   host: 'Elder Adisa', channel: 'OPEN_RIVER' },
          ].map(({ time, show, host }) => (
            <div key={time} className="flex items-center gap-3 py-1.5 text-xs">
              <span className="text-gray-500 w-20 flex-shrink-0">{time}</span>
              <span className="text-white flex-1">{show}</span>
              <span className="text-gray-500">{host}</span>
            </div>
          ))}
        </div>
        {/* Schedule + Apply CTAs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => router.push('/dashboard/tv/schedule')}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            📅 Full Schedule
          </button>
          <button
            onClick={() => router.push('/dashboard/tv/apply')}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(74,222,128,.25)', background: 'rgba(74,222,128,.08)', color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            🎙 Apply to Broadcast
          </button>
        </div>
      </div>

      {/* GoLive Sheet */}
      {showGoLive && <GoLiveSheet onClose={() => setShowGoLive(false)} />}

      {/* Stream Viewer */}
      {watchingChannel && <StreamViewer channel={watchingChannel} onClose={() => setWatchingChannel(null)} />}
    </div>
  )
}
