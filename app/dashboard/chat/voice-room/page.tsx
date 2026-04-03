'use client'
// ═══════════════════════════════════════════════════════════════════
// SESO VOICE ROOM — Talking Drum Audio Space
// Inspired by Twitter Spaces + Clubhouse but Africa-first
// Features: Speakers stage, listeners, raise hand, Spirit Voice,
// village-gated, elder moderation, proverb of the hour
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const STYLES = `
@keyframes vr-wave{0%,100%{height:4px}50%{height:var(--wh,18px)}}
@keyframes vr-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.15)}}
@keyframes vr-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}
@keyframes vr-fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes vr-hand{0%,100%{transform:rotate(0deg)}20%{transform:rotate(-20deg)}40%{transform:rotate(20deg)}60%{transform:rotate(-10deg)}80%{transform:rotate(10deg)}}
@keyframes vr-slide-up{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes vr-live{0%,100%{opacity:1}50%{opacity:.4}}
.vr-pulse{animation:vr-pulse 2s ease-in-out infinite}
.vr-ring{animation:vr-ring 1.5s ease-out infinite}
.vr-fade{animation:vr-fade .35s ease both}
.vr-hand{animation:vr-hand .8s ease infinite}
.vr-slide-up{animation:vr-slide-up .4s cubic-bezier(.16,1,.3,1) both}
.vr-live{animation:vr-live 1.2s ease infinite}
.vr-no-scroll::-webkit-scrollbar{display:none}
.vr-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

const C = {
  bg: '#050a06', bgDeep: '#030704', bgCard: '#0a140c',
  green: '#1a7c3e', greenL: '#4ade80',
  gold: '#d4a017', goldL: '#fbbf24',
  purple: '#7c3aed', purpleL: '#c084fc',
  red: '#b22222', redL: '#ef4444',
  amber: '#e07b00', amberL: '#f59e0b',
  text: '#f0f7f0', textDim: 'rgba(255,255,255,.45)', textDim2: 'rgba(255,255,255,.25)',
  border: 'rgba(255,255,255,.07)',
}

interface Participant {
  id: string; name: string; emoji: string; role: 'host' | 'elder' | 'speaker' | 'listener'
  speaking: boolean; muted: boolean; handRaised: boolean; village: string; crest: string
  lang: string
}

const PARTICIPANTS: Participant[] = [
  { id: 'host',  name: 'Umoh Okonkwo',   emoji: '✦',  role: 'host',     speaking: true,  muted: false, handRaised: false, village: 'Commerce',    crest: 'III', lang: 'EN' },
  { id: 'e1',    name: 'Chief Adewale',   emoji: '👴', role: 'elder',    speaking: false, muted: false, handRaised: false, village: 'Governance',  crest: 'V',   lang: 'YO' },
  { id: 's1',    name: 'Chioma Adeyemi',  emoji: '🧺', role: 'speaker',  speaking: true,  muted: false, handRaised: false, village: 'Commerce',    crest: 'II',  lang: 'IG' },
  { id: 's2',    name: 'Kofi Brong',      emoji: '🌾', role: 'speaker',  speaking: false, muted: true,  handRaised: false, village: 'Agriculture', crest: 'II',  lang: 'AK' },
  { id: 'l1',    name: 'Dr. Ngozi Eze',   emoji: '⚕',  role: 'listener', speaking: false, muted: true,  handRaised: true,  village: 'Health',      crest: 'III', lang: 'EN' },
  { id: 'l2',    name: 'Kwame Asante',    emoji: '🌾', role: 'listener', speaking: false, muted: true,  handRaised: false, village: 'Agriculture', crest: 'I',   lang: 'HA' },
  { id: 'l3',    name: 'Amara Eze',       emoji: '🎓', role: 'listener', speaking: false, muted: true,  handRaised: false, village: 'Education',   crest: 'II',  lang: 'EN' },
  { id: 'l4',    name: 'Bello Musa',      emoji: '🏃', role: 'listener', speaking: false, muted: true,  handRaised: true,  village: 'Commerce',    crest: 'I',   lang: 'HA' },
  { id: 'l5',    name: 'Fatima Hassan',   emoji: '⚖',  role: 'listener', speaking: false, muted: true,  handRaised: false, village: 'Justice',     crest: 'III', lang: 'AR' },
  { id: 'l6',    name: 'Nnamdi Okafor',   emoji: '💻', role: 'listener', speaking: false, muted: true,  handRaised: false, village: 'Technology',  crest: 'I',   lang: 'IG' },
  { id: 'l7',    name: 'Mama Adaeze',     emoji: '👩', role: 'listener', speaking: false, muted: true,  handRaised: false, village: 'Family',      crest: 'IV',  lang: 'IG' },
  { id: 'l8',    name: 'Olu Fashola',     emoji: '🏗',  role: 'listener', speaking: false, muted: true,  handRaised: false, village: 'Builders',    crest: 'II',  lang: 'YO' },
]

const PROVERBS = [
  '"If you want to go fast, go alone. If you want to go far, go together." — Yoruba',
  '"Until the lion learns to write, every story will glorify the hunter." — African',
  '"A child who is not embraced by the village will burn it down to feel its warmth." — African',
  '"Knowledge is like a garden: if it is not cultivated, it cannot be harvested." — Mandinka',
  '"Rain does not fall on one roof alone." — Cameroonian',
]

function SpeakerBubble({ p, isMe, onClick }: { p: Participant; isMe?: boolean; onClick?: () => void }) {
  const roleColor = p.role === 'host' ? C.goldL : p.role === 'elder' ? C.purpleL : C.greenL
  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: onClick ? 'pointer' : 'default', width: 72 }}>
      <div style={{ position: 'relative' }}>
        {/* Speaking ring */}
        {p.speaking && !p.muted && (
          <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid ${roleColor}`, opacity: 0.6 }} className="vr-ring" />
        )}
        <div style={{
          width: 58, height: 58, borderRadius: '50%',
          background: p.speaking && !p.muted ? `${roleColor}18` : 'rgba(255,255,255,.06)',
          border: `2.5px solid ${p.speaking && !p.muted ? roleColor : 'rgba(255,255,255,.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, transition: 'all .3s', position: 'relative',
          boxShadow: p.speaking && !p.muted ? `0 0 20px ${roleColor}44` : 'none',
        }}>
          {p.emoji}
          {isMe && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2.5px solid ${C.goldL}` }} className="vr-pulse" />
          )}
        </div>
        {/* Mute indicator */}
        {p.muted && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: '#dc2626', border: `2px solid ${C.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>🔇</div>}
        {/* Hand raised */}
        {p.handRaised && <div style={{ position: 'absolute', top: -4, right: -4, fontSize: 16 }} className="vr-hand">✋</div>}
        {/* Role badge */}
        {(p.role === 'host' || p.role === 'elder') && (
          <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderRadius: '50%', background: p.role === 'host' ? C.gold : C.purple, border: `2px solid ${C.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
            {p.role === 'host' ? '👑' : '🧓'}
          </div>
        )}
      </div>
      {/* Audio waveform when speaking */}
      {p.speaking && !p.muted && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
          {[6, 12, 8, 14, 10, 7, 13].map((h, i) => (
            <div key={i} style={{ width: 2.5, borderRadius: 99, background: roleColor, height: h, animation: `vr-wave ${0.6 + i * 0.07}s ease-in-out infinite`, animationDelay: `${i * 0.08}s` } as React.CSSProperties} />
          ))}
        </div>
      )}
      <div style={{ fontSize: 10, fontWeight: 700, color: p.speaking && !p.muted ? C.text : C.textDim, textAlign: 'center', lineHeight: 1.3, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.name.split(' ')[0]}
      </div>
      <div style={{ fontSize: 8, color: C.textDim2, textAlign: 'center' }}>{p.lang}</div>
    </div>
  )
}

export default function VoiceRoomPage() {
  const router = useRouter()
  const [participants, setParticipants] = React.useState(PARTICIPANTS)
  const [myMuted, setMyMuted] = React.useState(false)
  const [handRaised, setHandRaised] = React.useState(false)
  const [showInvite, setShowInvite] = React.useState(false)
  const [showLeave, setShowLeave] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [activeLang, setActiveLang] = React.useState('EN')
  const [listenerView, setListenerView] = React.useState<'grid' | 'list'>('grid')
  const [proverbIdx, setProverbIdx] = React.useState(0)
  const [showProverb, setShowProverb] = React.useState(true)
  const [toast, setToast] = React.useState<string | null>(null)

  const speakers = participants.filter(p => p.role === 'host' || p.role === 'elder' || p.role === 'speaker')
  const listeners = participants.filter(p => p.role === 'listener')
  const raisedHands = listeners.filter(p => p.handRaised)

  // Inject CSS
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('vr-styles')) {
      const s = document.createElement('style'); s.id = 'vr-styles'; s.textContent = STYLES
      document.head.appendChild(s)
    }
  }, [])

  // Call timer
  React.useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Rotate proverb
  React.useEffect(() => {
    const t = setInterval(() => {
      setShowProverb(false)
      setTimeout(() => { setProverbIdx(i => (i + 1) % PROVERBS.length); setShowProverb(true) }, 400)
    }, 15000)
    return () => clearInterval(t)
  }, [])

  // Simulate speaking activity
  React.useEffect(() => {
    const t = setInterval(() => {
      setParticipants(prev => prev.map(p => {
        if (p.id === 'host') return { ...p, speaking: !myMuted }
        if (p.role === 'speaker' && !p.muted) return { ...p, speaking: Math.random() > 0.5 }
        return p
      }))
    }, 2500)
    return () => clearInterval(t)
  }, [myMuted])

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  return (
    <div className="vr-no-scroll" style={{ height: '100vh', background: C.bgDeep, color: C.text, fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', overflow: 'hidden' }}>

      {/* ── HEADER ── */}
      <div style={{ padding: '14px 18px 10px', background: 'rgba(0,0,0,.3)', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setShowLeave(true)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div className="vr-live" style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontFamily: 'Sora,sans-serif', fontSize: 15, fontWeight: 900, color: C.text }}>🥁 Talking Drum</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(220,38,38,.12)', border: '1px solid rgba(220,38,38,.2)', color: '#ef4444' }}>LIVE</span>
            </div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>Commerce Village · {participants.length} in room · {fmt(duration)}</div>
          </div>
          <button onClick={() => setShowInvite(true)} style={{ padding: '7px 12px', borderRadius: 10, background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.3)', color: C.greenL, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            + Invite
          </button>
        </div>

        {/* Proverb ticker */}
        {showProverb && (
          <div className="vr-fade" style={{ margin: '10px 0 0', padding: '8px 12px', borderRadius: 10, background: 'rgba(212,160,23,.05)', border: '1px solid rgba(212,160,23,.12)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: C.goldL, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>🤲 Proverb of the Hour</div>
            <div style={{ fontSize: 10, color: 'rgba(212,160,23,.8)', fontStyle: 'italic', lineHeight: 1.5 }}>{PROVERBS[proverbIdx]}</div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="vr-no-scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Spirit Voice language strip */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 18px', overflowX: 'auto' }} className="vr-no-scroll">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, padding: '4px 10px', borderRadius: 99, background: 'rgba(26,124,62,.12)', border: '1px solid rgba(26,124,62,.25)' }}>
            <span className="vr-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenL, display: 'inline-block' }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: C.greenL, letterSpacing: '.08em' }}>SPIRIT VOICE</span>
          </div>
          {['EN','YO','IG','HA','SW','ZU','AR','AK'].map(l => (
            <button key={l} onClick={() => setActiveLang(l)} style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: activeLang === l ? C.green : 'rgba(255,255,255,.05)', color: activeLang === l ? '#fff' : C.textDim, border: activeLang === l ? `1px solid ${C.greenL}` : `1px solid ${C.border}`, transition: 'all .2s' }}>{l}</button>
          ))}
        </div>

        {/* ── SPEAKERS STAGE ── */}
        <div style={{ padding: '8px 18px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            🎙 Speakers ({speakers.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {speakers.map(p => (
              <SpeakerBubble key={p.id} p={p} isMe={p.id === 'host'} />
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: C.border, margin: '0 18px' }} />

        {/* ── RAISED HANDS ── */}
        {raisedHands.length > 0 && (
          <>
            <div style={{ padding: '12px 18px 8px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.amberL, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                ✋ Raised Hands ({raisedHands.length})
              </div>
              {raisedHands.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>{p.village} · {p.lang}</div>
                  </div>
                  <button onClick={() => { setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, role: 'speaker', handRaised: false } : x)); flash(`${p.name.split(' ')[0]} moved to stage`) }} style={{ padding: '6px 12px', borderRadius: 9, background: C.green, border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Invite Up
                  </button>
                  <button onClick={() => flash('Hand acknowledged')} style={{ padding: '6px 10px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Dismiss</button>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: C.border, margin: '0 18px' }} />
          </>
        )}

        {/* ── LISTENERS ── */}
        <div style={{ padding: '12px 18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              👥 Listeners ({listeners.length})
            </div>
            <button onClick={() => setListenerView(v => v === 'grid' ? 'list' : 'grid')} style={{ fontSize: 10, color: C.textDim, background: 'none', border: 'none', cursor: 'pointer' }}>
              {listenerView === 'grid' ? '≡ List' : '⊞ Grid'}
            </button>
          </div>

          {listenerView === 'grid' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {listeners.map(p => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 56 }}>
                  <div style={{ position: 'relative', width: 46, height: 46, borderRadius: 13, background: p.handRaised ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,.04)', border: `1.5px solid ${p.handRaised ? C.amberL : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {p.emoji}
                    {p.handRaised && <div style={{ position: 'absolute', top: -5, right: -5, fontSize: 13 }} className="vr-hand">✋</div>}
                  </div>
                  <span style={{ fontSize: 9, color: C.textDim2, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 52 }}>{p.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {listeners.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid rgba(255,255,255,.03)` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.04)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>{p.village} · {p.lang}</div>
                  </div>
                  {p.handRaised && <span className="vr-hand" style={{ fontSize: 16 }}>✋</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom padding for controls */}
        <div style={{ height: 120 }} />
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(5,10,6,.95)', borderTop: `1px solid ${C.border}`, padding: '14px 20px 24px', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Mute */}
          <button onClick={() => { setMyMuted(!myMuted); flash(myMuted ? 'Mic on' : 'Muted') }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: myMuted ? 'rgba(220,38,38,.15)' : 'rgba(26,124,62,.15)', border: `1.5px solid ${myMuted ? '#dc2626' : C.greenL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {myMuted ? '🔇' : '🎙'}
            </div>
            <span style={{ fontSize: 10, color: myMuted ? '#f87171' : C.greenL, fontWeight: 700 }}>{myMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Raise Hand */}
          <button onClick={() => { setHandRaised(!handRaised); flash(handRaised ? 'Hand lowered' : '✋ Hand raised') }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: handRaised ? 'rgba(245,158,11,.15)' : 'rgba(255,255,255,.05)', border: `1.5px solid ${handRaised ? C.amberL : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }} className={handRaised ? 'vr-hand' : ''}>✋</div>
            <span style={{ fontSize: 10, color: handRaised ? C.amberL : C.textDim, fontWeight: 700 }}>{handRaised ? 'Lower' : 'Raise'}</span>
          </button>

          {/* Share */}
          <button onClick={() => flash('🔗 Room link copied')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,.05)', border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔗</div>
            <span style={{ fontSize: 10, color: C.textDim, fontWeight: 700 }}>Share</span>
          </button>

          {/* Spirit Voice */}
          <button onClick={() => flash(`🎙 Translating to ${activeLang}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(26,124,62,.12)', border: `1.5px solid rgba(26,124,62,.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }} className="vr-pulse">🌍</div>
            <span style={{ fontSize: 10, color: C.greenL, fontWeight: 700 }}>{activeLang}</span>
          </button>

          {/* Leave */}
          <button onClick={() => setShowLeave(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(220,38,38,.15)', border: '1.5px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🚪</div>
            <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700 }}>Leave</span>
          </button>
        </div>
      </div>

      {/* ── INVITE SHEET ── */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end', zIndex: 60 }} onClick={() => setShowInvite(false)}>
          <div className="vr-slide-up" style={{ width: '100%', background: C.bgCard, borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxWidth: 480, margin: '0 auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)', margin: '0 auto 18px' }} />
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 17, fontWeight: 900, color: C.text, marginBottom: 16 }}>Invite to Room</div>
            {[
              { icon: '🔗', label: 'Copy room link', sub: 'Share anywhere' },
              { icon: '💬', label: 'Invite via Seso Chat', sub: 'Send to contacts' },
              { icon: '🏘', label: 'Post to Village Feed', sub: 'Announce in Commerce Village' },
              { icon: '📱', label: 'Share to phone', sub: 'WhatsApp, SMS, any app' },
            ].map((item, i) => (
              <button key={i} onClick={() => { flash(`${item.label} done`); setShowInvite(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,.03)', border: `1px solid ${C.border}`, marginBottom: 8, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LEAVE CONFIRMATION ── */}
      {showLeave && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 24 }}>
          <div style={{ background: C.bgCard, borderRadius: 20, padding: 24, maxWidth: 320, width: '100%', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 10 }}>🚪</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 16, fontWeight: 900, color: C.text, textAlign: 'center', marginBottom: 6 }}>Leave the Room?</div>
            <div style={{ fontSize: 12, color: C.textDim, textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>The Talking Drum will continue without you. You can rejoin anytime.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLeave(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Stay</button>
              <button onClick={() => router.back()} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: '#dc2626', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', borderRadius: 12, background: 'rgba(10,20,12,.96)', border: `1px solid ${C.greenL}`, color: C.text, fontSize: 13, fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,.5)', whiteSpace: 'nowrap', zIndex: 80 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
