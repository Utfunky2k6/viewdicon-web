'use client'
import * as React from 'react'
import { authApi } from '@/lib/api'
import { DrumOtpBoxes } from '@/components/ui/DrumOtpBoxes'

interface OtpSceneProps {
  onNext: () => void
  theme: any
  phone: string
  devOtp?: string
}

export function OtpScene({ onNext, theme, phone, devOtp }: OtpSceneProps) {
  const [otp, setOtp] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const [error, setError] = React.useState('')
  const [countdown, setCountdown] = React.useState(60)

  React.useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  React.useEffect(() => {
    if (otp.length === 6 && !verifying && !verified) {
      setVerifying(true)
      setError('')
      ;(async () => {
        try {
          await authApi.verifyPhone({ phone, otp })
          setVerified(true)
          setVerifying(false)
          setTimeout(onNext, 600)
        } catch {
          // Backend down or OTP mismatch — try local match
          if (devOtp && otp === devOtp) {
            setVerified(true)
            setVerifying(false)
            setTimeout(onNext, 600)
          } else {
            setVerifying(false)
            setOtp('')
            setError('Invalid code — try again')
          }
        }
      })()
    }
  }, [otp, verifying, verified, onNext, phone, devOtp])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, background: theme.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>⚡</div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 24, fontWeight: 900, color: theme.text, marginBottom: 6 }}>
          {verified ? '✅ Drum Sealed!' : verifying ? '⏳ Sealing Drum…' : 'Seal the Drum'}
        </div>
        <div style={{ fontSize: 13, color: theme.subText, lineHeight: 1.5 }}>Enter the 6-digit code to seal your identity.</div>
      </div>

      {devOtp && !verified && (
        <div
          onClick={() => { navigator.clipboard?.writeText(devOtp).catch(() => { }) }}
          style={{
            background: 'linear-gradient(135deg, rgba(26,124,62,.15), rgba(74,222,128,.1))',
            border: `2px solid ${theme.accent}80`,
            borderRadius: 16,
            padding: '14px 16px',
            marginBottom: 14,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 6 }}>Your Drum Code</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '0.3em', fontFamily: 'monospace' }}>{devOtp}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>Tap to copy</div>
        </div>
      )}

      {/* DrumOtpBoxes */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <DrumOtpBoxes value={otp} onChange={setOtp} onComplete={() => { }} accentColor={theme.accent} error={error} />

        {/* Status */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {verifying ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.accent }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, animation: 'sosP .8s ease infinite' }} />
              Verifying drum signature…
            </div>
          ) : verified ? (
            <div style={{ fontSize: 13, color: theme.accent, fontWeight: 700 }}>✓ Code sealed — proceeding…</div>
          ) : countdown > 0 ? (
            <div style={{ fontSize: 12, color: theme.subText }}>
              Code expires in <strong style={{ color: theme.text }}>{countdown}s</strong>
            </div>
          ) : (
            <button onClick={() => setCountdown(60)} style={{ fontSize: 12, color: theme.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Resend Drum Code
            </button>
          )}
        </div>
      </div>

      {/* Drum animation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: `${theme.accent}08`, border: `1px solid ${theme.accent}22`, marginBottom: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 22 }}>
          {[0.45, 0.7, 1, 0.85, 0.6, 0.5, 0.75, 0.4].map((h, i) => (
            <div key={i} style={{
              width: 3, height: `${h * 20}px`, borderRadius: 2, background: theme.accent,
              animation: `wbBeat 1.2s ease-in-out ${i * 0.1}s infinite`
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: `${theme.accent}cc`, lineHeight: 1.6 }}>
          A Talking Drum <strong style={{ color: theme.accent }}>(6-digit OTP)</strong> is generated. No passwords needed. Your phone is your key.
        </div>
      </div>

      {!verifying && !verified && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[['📱', 'Resend SMS'], ['📞', 'Voice Call']].map(([icon, label]) => (
            <button key={label} onClick={() => setCountdown(60)} disabled={countdown > 0}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 14, background: theme.muted,
                border: `1.5px solid ${theme.border}`, color: countdown > 0 ? theme.subText : theme.text,
                fontSize: 12, fontWeight: 700, cursor: countdown > 0 ? 'default' : 'pointer', opacity: countdown > 0 ? .4 : 1
              }}>
              {icon} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
