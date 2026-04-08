'use client'
// ═══════════════════════════════════════════════════════════════
// CALL OVERLAY — Ipe Fidio (Video) & Ipe Ohùn (Voice) Calls
// Full-screen call UI with real camera/mic via getUserMedia
// ═══════════════════════════════════════════════════════════════
import * as React from 'react'

const CSS_ID = 'call-overlay-css'
const CSS = `
@keyframes callPulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.15);opacity:1}}
@keyframes callRing{0%{transform:scale(.9);opacity:.7}50%{transform:scale(1.3);opacity:0}100%{transform:scale(.9);opacity:0}}
@keyframes callFadeIn{from{opacity:0}to{opacity:1}}
@keyframes callSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes callEndFade{from{opacity:1}to{opacity:0}}
@keyframes timerTick{from{opacity:.6}to{opacity:1}}
@keyframes endPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
`

interface CallOverlayProps {
  contact: { name: string; avatar?: string; afroId?: string }
  mode: 'voice' | 'video'
  onEnd: () => void
}

type Phase = 'calling' | 'connected' | 'ending'

export function CallOverlay({ contact, mode, onEnd }: CallOverlayProps) {
  const [phase, setPhase] = React.useState<Phase>('calling')
  const [seconds, setSeconds] = React.useState(0)
  const [muted, setMuted] = React.useState(false)
  const [cameraOff, setCameraOff] = React.useState(mode === 'voice')
  const [speakerOn, setSpeakerOn] = React.useState(true)
  const [showParticipants, setShowParticipants] = React.useState(false)

  const localVideoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const oscRef = React.useRef<OscillatorNode | null>(null)
  const audioCtxRef = React.useRef<AudioContext | null>(null)

  // Inject CSS
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById(CSS_ID)) {
      const s = document.createElement('style')
      s.id = CSS_ID
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  // Start camera/mic
  React.useEffect(() => {
    let cancelled = false
    const constraints = mode === 'video'
      ? { video: { facingMode: 'user', width: 320, height: 480 }, audio: true }
      : { audio: true }

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      if (localVideoRef.current && mode === 'video') {
        localVideoRef.current.srcObject = stream
      }
    }).catch(() => { /* camera denied — continue with no video */ })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [mode])

  // Ringtone during calling phase
  React.useEffect(() => {
    if (phase !== 'calling') return
    try {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 440
      gain.gain.value = 0.08
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      oscRef.current = osc

      // Ring pattern: 1s on, 2s off
      const ringInterval = setInterval(() => {
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime + 1)
      }, 3000)

      return () => {
        clearInterval(ringInterval)
        try { osc.stop() } catch {}
        try { ctx.close() } catch {}
      }
    } catch { return }
  }, [phase])

  // Auto-connect after 4 seconds
  React.useEffect(() => {
    if (phase !== 'calling') return
    const t = setTimeout(() => setPhase('connected'), 4000)
    return () => clearTimeout(t)
  }, [phase])

  // Call timer
  React.useEffect(() => {
    if (phase !== 'connected') return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  // End call
  const endCall = React.useCallback(() => {
    setPhase('ending')
    streamRef.current?.getTracks().forEach(t => t.stop())
    try { oscRef.current?.stop() } catch {}
    try { audioCtxRef.current?.close() } catch {}
    setTimeout(onEnd, 1200)
  }, [onEnd])

  // Toggle mute
  const toggleMute = () => {
    setMuted(m => {
      const next = !m
      streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !next })
      return next
    })
  }

  // Toggle camera
  const toggleCamera = () => {
    setCameraOff(c => {
      const next = !c
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !next })
      return next
    })
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const initials = contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const isVideo = mode === 'video'
  const label = isVideo ? 'Ipe Fidio' : 'Ipe Ohùn'

  // Mock family members for "Add to Call"
  const FAMILY = [
    { name: 'Mama Aduke', afroId: 'AFR-NGA-COM-001' },
    { name: 'Baba Tunde', afroId: 'AFR-NGA-COM-002' },
    { name: 'Sister Ngozi', afroId: 'AFR-NGA-EDU-003' },
    { name: 'Brother Kwame', afroId: 'AFR-GHA-ART-004' },
    { name: 'Elder Makini', afroId: 'AFR-KEN-FIN-005' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0a',
      animation: phase === 'ending' ? 'callEndFade 1.2s ease forwards' : 'callFadeIn 0.3s ease',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.5)', zIndex: 2,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#d4a017', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {phase === 'calling' ? 'Connecting...' : phase === 'connected' ? formatTime(seconds) : 'Call ended'}
          </div>
        </div>
        {contact.afroId && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{contact.afroId}</div>
        )}
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

        {/* Remote participant placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            {phase === 'calling' && <>
              <div style={{
                position: 'absolute', inset: -20, borderRadius: '50%',
                border: '2px solid rgba(212,160,23,0.3)',
                animation: 'callRing 2s ease-out infinite',
              }} />
              <div style={{
                position: 'absolute', inset: -35, borderRadius: '50%',
                border: '2px solid rgba(212,160,23,0.15)',
                animation: 'callRing 2s ease-out infinite 0.5s',
              }} />
            </>}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'linear-gradient(135deg, #92400e, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, fontWeight: 800, color: '#fff',
              animation: phase === 'calling' ? 'callPulse 2s ease-in-out infinite' : 'none',
              border: '3px solid rgba(212,160,23,0.3)',
            }}>
              {contact.avatar || initials}
            </div>
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{contact.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {phase === 'calling' ? 'Ringing...' : phase === 'connected' ? `${label} · Connected` : 'Ọ dàbọ̀ — Farewell'}
            </div>
          </div>

          {/* Connected indicator */}
          {phase === 'connected' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 99,
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>SECURED</span>
            </div>
          )}
        </div>

        {/* Local video pip (video mode only) */}
        {isVideo && !cameraOff && phase === 'connected' && (
          <div style={{
            position: 'absolute', bottom: 20, right: 20,
            width: 110, height: 160, borderRadius: 16, overflow: 'hidden',
            border: '2px solid rgba(212,160,23,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            animation: 'callSlideUp 0.4s ease',
          }}>
            <video
              ref={localVideoRef}
              autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          </div>
        )}
      </div>

      {/* ── Participants panel ── */}
      {showParticipants && (
        <div style={{
          position: 'absolute', bottom: 120, left: 20, right: 20,
          background: 'rgba(15,15,10,0.95)', borderRadius: 20,
          border: '1px solid rgba(212,160,23,0.15)',
          padding: '16px', zIndex: 5,
          animation: 'callSlideUp 0.3s ease',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#d4a017', marginBottom: 12 }}>
            Ẹbí — Add Family Member
          </div>
          {FAMILY.map(f => (
            <div key={f.afroId} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #92400e80, #d9770680)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fbbf24',
                }}>{f.name.split(' ').map(w => w[0]).join('')}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{f.name}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{f.afroId}</div>
                </div>
              </div>
              <button style={{
                padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
                background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.3)',
                color: '#d4a017', fontSize: 10, fontWeight: 800,
              }}>Invite</button>
            </div>
          ))}
          <button
            onClick={() => setShowParticipants(false)}
            style={{
              width: '100%', marginTop: 12, padding: '10px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >Close</button>
        </div>
      )}

      {/* ── Control bar ── */}
      {phase !== 'ending' && (
        <div style={{
          padding: '20px 30px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
          animation: 'callSlideUp 0.4s ease 0.2s both',
        }}>
          {/* Mute */}
          <button onClick={toggleMute} style={{
            width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', border: 'none',
            background: muted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
            color: muted ? '#ef4444' : '#fff', fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s',
          }}>
            {muted ? '🔇' : '🎤'}
          </button>

          {/* Camera toggle (video only) */}
          {isVideo && (
            <button onClick={toggleCamera} style={{
              width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', border: 'none',
              background: cameraOff ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
              color: cameraOff ? '#ef4444' : '#fff', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cameraOff ? '📷' : '📹'}
            </button>
          )}

          {/* Speaker */}
          <button onClick={() => setSpeakerOn(s => !s)} style={{
            width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', border: 'none',
            background: 'rgba(255,255,255,0.08)',
            color: speakerOn ? '#fff' : '#ef4444', fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {speakerOn ? '🔊' : '🔈'}
          </button>

          {/* Add participant */}
          {phase === 'connected' && (
            <button onClick={() => setShowParticipants(p => !p)} style={{
              width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', border: 'none',
              background: 'rgba(212,160,23,0.12)',
              color: '#d4a017', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>➕</button>
          )}

          {/* End call */}
          <button onClick={endCall} style={{
            width: 68, height: 68, borderRadius: '50%', cursor: 'pointer', border: 'none',
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: '#fff', fontSize: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(239,68,68,0.4)',
          }}>📞</button>
        </div>
      )}

      {/* Ending screen */}
      {phase === 'ending' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          animation: 'endPulse 1.2s ease',
        }}>
          <div style={{ fontSize: 48 }}>🙏</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#d4a017' }}>Ọ dàbọ̀</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Call ended · {formatTime(seconds)}
          </div>
        </div>
      )}
    </div>
  )
}

export default CallOverlay
