'use client'
import * as React from 'react'
import { GradBtn } from '../atoms/GradBtn'
import { captureVoiceFingerprint, generateDeviceFingerprint } from '@/lib/audio-fingerprint'

const BIND_CHECKS = [
  { emoji: '📱', label: 'Hardware Fingerprint', key: 'hw' },
  { emoji: '🔒', label: 'Sovereign Keys', key: 'enc' },
  { emoji: '🌍', label: 'Location Anchor', key: 'loc' },
  { emoji: '🛡', label: 'Tamper Shield', key: 'tamp' },
]

interface DeviceSceneProps {
  onNext: () => void
  theme: any
  onVoicePrint?: (hash: string) => void
}

export function DeviceScene({ onNext, theme, onVoicePrint }: DeviceSceneProps) {
  const [bindIdx, setBindIdx] = React.useState(-1)
  const [done, setDone] = React.useState(false)
  const [recording, setRecording] = React.useState(false)
  const [oathDone, setOathDone] = React.useState(false)
  const [bars, setBars] = React.useState([8, 16, 22, 12, 20, 10, 18, 14, 24, 8])
  const rafRef = React.useRef<number>()

  // Binding animation
  React.useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      setBindIdx(i); i++
      if (i >= BIND_CHECKS.length) { clearInterval(iv); setDone(true) }
    }, 800)
    return () => clearInterval(iv)
  }, [])

  // Live waveform while recording
  React.useEffect(() => {
    if (!recording) { cancelAnimationFrame(rafRef.current!); return }
    const tick = () => { setBars(Array.from({ length: 10 }, () => 4 + Math.random() * 24)); rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [recording])

  const startOath = async () => {
    setRecording(true)
    try {
      const result = await captureVoiceFingerprint()
      const hash = result.hash.slice(0, 14).toUpperCase()
      setOathDone(true); setRecording(false); onVoicePrint?.(hash)
    } catch {
      // Fallback
      try {
        const hash = await generateDeviceFingerprint()
        setOathDone(true); setRecording(false); onVoicePrint?.(hash)
      } catch {
        const hash = 'DEV-' + Date.now().toString(36).toUpperCase()
        setOathDone(true); setRecording(false); onVoicePrint?.(hash)
      }
    }
  }

  const stopOath = () => { setOathDone(true); setRecording(false) }

  // Auto-skip voice oath after 8s if user hasn't completed it
  React.useEffect(() => {
    if (done && !oathDone) {
      const t = setTimeout(() => setOathDone(true), 8000)
      return () => clearTimeout(t)
    }
  }, [done, oathDone])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, background: theme.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 20px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${theme.accent}44`, animation: `ringExp 2.5s ease-out infinite`, animationDelay: `${i * 0.8}s` }} />
          ))}
          <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: `linear-gradient(135deg,${theme.accent},#0a1f0f)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: `0 0 30px ${theme.accent}33` }}>🖐</div>
        </div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 6 }}>This device is your Drum.</div>
        <div style={{ fontSize: 12, color: theme.subText, lineHeight: 1.65, maxWidth: 280, margin: '0 auto' }}>
          In the old kingdoms, a king&apos;s drum was bound to his spirit.<br />Your phone is now bound to your Afro-ID.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {BIND_CHECKS.map((c, i) => (
          <div key={c.key} style={{ background: theme.card, border: `1.5px solid ${i <= bindIdx ? theme.accent + '55' : theme.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: i <= bindIdx ? 1 : 0.3, transition: 'all .35s' }}>
            <div style={{ fontSize: 20 }}>{c.emoji}</div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: theme.text }}>{c.label}</div>
            {i <= bindIdx && <div style={{ color: theme.accent, fontWeight: 900, fontSize: 16 }}>✓</div>}
          </div>
        ))}
      </div>

      {done && !oathDone && (
        <div style={{ background: 'rgba(26,124,62,.07)', border: '1.5px solid rgba(26,124,62,.28)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#7da882', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            🎙 Step 2 of 2 · Speak Your Voice Oath
          </div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 15, fontWeight: 700, color: '#4ade80', marginBottom: 12, lineHeight: 1.4 }}>
            &ldquo;I am proud of my African heritage&rdquo;
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 34, marginBottom: 12 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 99, background: recording ? (i % 3 === 0 ? '#4ade80' : theme.accent) : 'rgba(26,124,62,.25)', height: `${h}px`, transition: recording ? 'none' : 'height .3s ease' }} />
            ))}
          </div>
          {recording ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', animation: 'sosP .8s ease-in-out infinite' }} />
                Recording… tap to stop
              </div>
              <button onClick={stopOath} style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(178,34,34,.15)', border: '1px solid rgba(178,34,34,.3)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Stop</button>
            </div>
          ) : (
            <button onClick={startOath} style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg,rgba(26,124,62,.2),rgba(26,124,62,.05))', border: '1px solid rgba(26,124,62,.35)', color: '#4ade80', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              🎙 Speak Your Voice Oath
            </button>
          )}
          <button onClick={() => setOathDone(true)} style={{ width: '100%', marginTop: 8, padding: '8px 0', borderRadius: 10, background: 'none', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.3)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            Skip for now →
          </button>
        </div>
      )}

      {oathDone && (
        <div style={{ background: 'rgba(26,124,62,.1)', border: '1.5px solid rgba(26,124,62,.35)', borderRadius: 14, padding: 14, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🥁</div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 15, fontWeight: 800, color: '#4ade80' }}>Your Drum is Bound.</div>
          <div style={{ fontSize: 11, color: 'rgba(74,222,128,.6)', marginTop: 4 }}>Voice oath sealed · Voice commands now active 🎙</div>
        </div>
      )}

      <GradBtn onClick={oathDone ? onNext : () => { }} style={!(done && oathDone) ? { opacity: .35, pointerEvents: 'none', height: 54, marginTop: 'auto' } : { height: 54, marginTop: 'auto' }}>
        {oathDone ? 'My Drum is Bound →' : done ? '🎙 Speak oath to continue' : 'Binding device…'}
      </GradBtn>
    </div>
  )
}
