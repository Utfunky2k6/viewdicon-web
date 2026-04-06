'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { sorosokeApi } from '@/lib/api'
import type { Skin } from '@/components/feed/FeedPostCard'
import { SKINS } from '@/components/feed/FeedPostCard'

type CreatePostT = 'text'|'voice'|'market'|'proverb'|'golive'
export const CREATE_TYPE_MAP: Record<CreatePostT, string> = {
  text: 'TEXT_DRUM', voice: 'VOICE_STORY', market: 'MARKET_LISTING', proverb: 'PROVERB_CHAIN', golive: 'TEXT_DRUM',
}

export function CreateSheet({ open, onClose, currentSkin }: { open:boolean; onClose:()=>void; currentSkin:Skin }) {
  const createRouter = useRouter()
  const [postType, setPostType] = React.useState<CreatePostT>('text')
  const [text, setText] = React.useState('')
  const [scope, setScope] = React.useState<'village'|'region'|'nation'>('village')
  const [isRecording, setIsRecording] = React.useState(false)
  const [recSecs, setRecSecs] = React.useState(0)
  const [posting, setPosting] = React.useState(false)
  const [streamTitle, setStreamTitle] = React.useState('')
  const [streamMode, setStreamMode] = React.useState<'camera'|'audio'|'screen'>('camera')
  const recRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const heatPct = Math.min(90, 20 + text.length * 0.8)

  const toggleRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      clearInterval(recRef.current!)
    } else {
      setIsRecording(true)
      recRef.current = setInterval(() => setRecSecs(s => {
        if (s >= 179) { setIsRecording(false); clearInterval(recRef.current!); return s }
        return s + 1
      }), 1000)
    }
  }
  const fmtRec = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  const POST_TYPES: { t:CreatePostT; emoji:string; label:string }[] = [
    { t:'text', emoji:'🥁', label:'Text Drum' },
    { t:'voice', emoji:'🎙', label:'Voice Story' },
    { t:'market', emoji:'🛒', label:'Market Listing' },
    { t:'proverb', emoji:'📿', label:'Proverb Chain' },
    { t:'golive', emoji:'🔴', label:'Go Live' },
  ]

  const handlePost = async () => {
    if (posting) return
    if (postType === 'golive') {
      // Navigate to Jollof TV stream creation with pre-filled params
      const params = new URLSearchParams()
      if (streamTitle.trim()) params.set('title', streamTitle.trim())
      params.set('mode', streamMode)
      createRouter.push(`/dashboard/jollof/live?${params}`)
      onClose()
      return
    }
    setPosting(true)
    try {
      let villageId: string | null = null
      try {
        const vs = localStorage.getItem('afk-village')
        villageId = vs ? JSON.parse(vs)?.state?.activeVillageId ?? null : null
      } catch {}
      if (villageId && text.trim()) {
        await sorosokeApi.createPost({
          body: text.trim(),
          villageId,
          skinContext: currentSkin,
          type: CREATE_TYPE_MAP[postType],
        })
      }
    } catch {}
    finally { setPosting(false) }
    setText('')
    onClose()
  }

  if (!open) return null
  return (
    <div style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)',display:'flex',flexDirection:'column' }} onClick={onClose}>
      <div style={{ flex:1 }} />
      <div onClick={e => e.stopPropagation()} style={{ background:'#111a0d',borderRadius:'28px 28px 0 0',padding:'0 0 40px',transform:open ? 'translateY(0)' : 'translateY(100%)',transition:'transform .35s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ width:40,height:4,borderRadius:99,background:'rgba(255,255,255,.2)',margin:'12px auto 16px' }} />
        <div style={{ padding:'0 16px 10px',fontFamily:'Sora, sans-serif',fontSize:20,fontWeight:900,color:'#f0f5ee',display:'flex',alignItems:'center',gap:10 }}>
          What do you want to say?
          <span style={{ fontSize:13,color:'rgba(255,255,255,.4)',fontWeight:400 }}>{SKINS[currentSkin].pill}</span>
        </div>
        <div style={{ display:'flex',gap:10,overflowX:'auto',padding:'0 16px 12px',borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          {POST_TYPES.map(({ t, emoji, label }) => (
            <div key={t} onClick={() => setPostType(t)} style={{ flexShrink:0,width:80,background:postType===t ? 'rgba(74,222,128,.07)' : 'rgba(255,255,255,.04)',border:`1.5px solid ${postType===t ? '#4ade80' : 'rgba(255,255,255,.08)'}`,borderRadius:14,padding:'12px 8px',textAlign:'center',cursor:'pointer' }}>
              <div style={{ fontSize:24,marginBottom:6 }}>{emoji}</div>
              <div style={{ fontSize:10,fontWeight:700,color:postType===t ? '#4ade80' : 'rgba(255,255,255,.4)',lineHeight:1.3 }}>{label}</div>
            </div>
          ))}
        </div>
        {postType === 'voice' ? (
          <div style={{ padding:'20px 16px' }}>
            <div onClick={toggleRecord} style={{ width:80,height:80,borderRadius:'50%',background:isRecording ? 'rgba(178,34,34,.2)' : 'rgba(26,124,62,.2)',border:`2px solid ${isRecording ? 'rgba(178,34,34,.5)' : 'rgba(26,124,62,.4)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,cursor:'pointer',margin:'0 auto 12px',transition:'all .3s' }}>{isRecording ? '⏹' : '🎙'}</div>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:24,fontWeight:900,textAlign:'center',color:'#f0f5ee' }}>{fmtRec(recSecs)}</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,.4)',textAlign:'center',marginTop:6 }}>{isRecording ? 'Recording... tap to stop' : 'Tap to record (max 3:00)'}</div>
          </div>
        ) : postType === 'golive' ? (
          <div style={{ padding:'20px 16px',textAlign:'center' }}>
            <div style={{ width:88,height:88,borderRadius:'50%',background:'radial-gradient(circle,rgba(239,68,68,.25),rgba(239,68,68,.05))',border:'3px solid rgba(239,68,68,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 14px',boxShadow:'0 0 30px rgba(239,68,68,.2)' }}>🔴</div>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:18,fontWeight:900,color:'#f87171',marginBottom:6 }}>Light the Fire</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:14 }}>Go live to your village — your stream will appear in Jollof TV and the Village Drum feed</div>
            <input value={streamTitle} onChange={e => setStreamTitle(e.target.value)} placeholder="Stream title — e.g. Market Talk, Cooking Show..." style={{ width:'100%',background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:12,padding:'12px 16px',fontSize:13,color:'#f0f5ee',outline:'none',marginBottom:10,boxSizing:'border-box' }} />
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={() => setStreamMode('camera')} style={{ flex:1,padding:10,background:streamMode === 'camera' ? 'rgba(239,68,68,.2)' : 'rgba(239,68,68,.08)',border:`1.5px solid ${streamMode === 'camera' ? 'rgba(239,68,68,.5)' : 'rgba(239,68,68,.2)'}`,borderRadius:10,fontSize:11,fontWeight:700,color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>📹 Camera</button>
              <button onClick={() => setStreamMode('audio')} style={{ flex:1,padding:10,background:streamMode === 'audio' ? 'rgba(74,222,128,.15)' : 'rgba(74,222,128,.06)',border:`1.5px solid ${streamMode === 'audio' ? 'rgba(74,222,128,.5)' : 'rgba(74,222,128,.2)'}`,borderRadius:10,fontSize:11,fontWeight:700,color:'#4ade80',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>🎙 Audio Only</button>
              <button onClick={() => setStreamMode('screen')} style={{ flex:1,padding:10,background:streamMode === 'screen' ? 'rgba(96,165,250,.15)' : 'rgba(96,165,250,.06)',border:`1.5px solid ${streamMode === 'screen' ? 'rgba(96,165,250,.5)' : 'rgba(96,165,250,.2)'}`,borderRadius:10,fontSize:11,fontWeight:700,color:'#60a5fa',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>🖥 Screen</button>
            </div>
          </div>
        ) : (
          <div style={{ padding:'12px 16px' }}>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder={postType === 'market' ? 'Describe your product — quantity, quality, location...' : 'What do you want to say to your village?'} style={{ width:'100%',background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.08)',borderRadius:14,padding:'14px 16px',fontSize:14,color:'#f0f5ee',outline:'none',fontFamily:'DM Sans,sans-serif',resize:'none',minHeight:100,lineHeight:1.6,boxSizing:'border-box' }} />
            <div style={{ marginTop:10,padding:'10px 14px',background:'rgba(0,0,0,.3)',borderRadius:10 }}>
              <div style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6 }}>Heat Prediction</div>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <div style={{ flex:1,height:6,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
                  <div style={{ height:'100%',width:`${heatPct}%`,background:'linear-gradient(to right,#2a1a08,#d4a017,#ff4500)',borderRadius:99,transition:'width .5s ease' }} />
                </div>
                <span style={{ fontSize:11,fontWeight:700,color:'#fbbf24',flexShrink:0 }}>{Math.round(heatPct)}%</span>
              </div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,.4)',marginTop:4,fontStyle:'italic' }}>{heatPct < 30 ? 'Village only — write more to earn wider reach' : heatPct < 50 ? 'Could reach Region if Drummed' : 'Strong post — may earn Nation scope!'}</div>
            </div>
          </div>
        )}
        <div style={{ display:'flex',gap:7,margin:'0 16px 12px' }}>
          {(['village','region','nation'] as const).map(s => (
            <div key={s} onClick={() => setScope(s)} style={{ flex:1,padding:9,borderRadius:10,border:`1px solid ${scope===s ? 'rgba(26,124,62,.3)' : 'rgba(255,255,255,.08)'}`,background:scope===s ? 'rgba(26,124,62,.15)' : 'rgba(255,255,255,.03)',textAlign:'center',cursor:'pointer' }}>
              <div style={{ fontSize:16,marginBottom:4 }}>{s === 'village' ? '🏘' : s === 'region' ? '🏙' : '🌍'}</div>
              <div style={{ fontSize:9,fontWeight:700,color:scope===s ? '#4ade80' : 'rgba(255,255,255,.4)',textTransform:'capitalize' }}>{s}{s === 'nation' ? ' *' : ''}</div>
            </div>
          ))}
        </div>
        <button
          disabled={posting || (postType !== 'voice' && postType !== 'golive' && text.trim().length < 3)}
          onClick={handlePost}
          style={{ margin:'0 16px',width:'calc(100% - 32px)',padding:14,background:posting ? 'rgba(26,124,62,.4)' : postType === 'golive' ? '#b91c1c' : '#1a7c3e',border:'none',borderRadius:14,fontSize:14,fontWeight:700,color:'#fff',cursor:posting ? 'wait' : 'pointer',fontFamily:'Sora, sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
        >
          {posting ? '⏳ Drumming…' : postType === 'golive' ? '🔴 Go Live Now' : '🥁 Drum This to Your Village'}
        </button>
      </div>
    </div>
  )
}
