'use client'
import * as React from 'react'
import { GradBtn } from '../atoms/GradBtn'

interface FingerprintSceneProps {
  onNext: () => void
  theme: any
}

export function FingerprintScene({ onNext, theme }: FingerprintSceneProps) {
  const [pressed, setPressed] = React.useState(false)
  const [complete, setComplete] = React.useState(false)
  const [progress, setProgress] = React.useState(0)

  // Simulation
  React.useEffect(() => {
    if (!pressed || complete) return
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setComplete(true); return 100 }
        return p + 2.5
      })
    }, 40)
    return () => clearInterval(iv)
  }, [pressed, complete])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, background: theme.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🧬</div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 24, fontWeight: 900, color: theme.text, marginBottom: 8 }}>Bloodline Signature</div>
        <div style={{ fontSize: 13, color: theme.subText, lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
          By pressing your print, you bind your biological lineage to the sovereign ledger.
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
          onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}
          style={{
            width: 140, height: 140, borderRadius: '50%', background: theme.card,
            border: `2.5px solid ${complete ? theme.accent : theme.border}`,
            position: 'relative', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transition: 'all .3s ease'
          }}
        >
          {/* Wave ripple */}
          {pressed && !complete && (
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `3px solid ${theme.accent}33`, animation: 'ringExp 1.5s infinite' }} />
          )}

          {/* Progress ring */}
          <svg style={{ position: 'absolute', inset: -4, width: 148, height: 148, transform: 'rotate(-90deg)' }}>
            <circle cx="74" cy="74" r="71" stroke={theme.border} strokeWidth="6" fill="transparent" />
            <circle cx="74" cy="74" r="71" stroke={theme.accent} strokeWidth="6" fill="transparent" strokeDasharray={446} strokeDashoffset={446 - (446 * progress) / 100} style={{ transition: 'stroke-dashoffset .1s linear' }} />
          </svg>

          <div style={{ fontSize: 50, opacity: complete ? 1 : pressed ? 0.8 : 0.4, transform: pressed ? 'scale(.9)' : 'scale(1)', transition: 'all .25s' }}>🧩</div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: complete ? theme.accent : theme.text }}>
            {complete ? 'Signature Captured' : pressed ? 'Capturing Print…' : 'Hold to Sign'}
          </div>
          <div style={{ fontSize: 11, color: theme.subText, marginTop: 4 }}>
            Encryption: SHA-512 Ancestral Hash
          </div>
        </div>
      </div>

      <div style={{ background: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '12px 14px', fontSize: 11, color: theme.subText, lineHeight: 1.6, marginBottom: 20 }}>
        🔒 <b>Zero Knowledge Proof:</b> Your raw biological data never leaves this device. Only a sovereign hash is stored in the village ledger.
      </div>

      <GradBtn onClick={onNext} style={!complete ? { opacity: .4, pointerEvents: 'none' } : { height: 54 }}>
        {complete ? 'My Mark is Set →' : '🧬 Place your thumb'}
      </GradBtn>
    </div>
  )
}
