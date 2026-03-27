'use client'
import * as React from 'react'

const DRUM_CSS = `
@keyframes drumFill { 0% { transform:scale(0.85) } 60% { transform:scale(1.08) } 100% { transform:scale(1) } }
@keyframes drumPulse { 0%,100% { transform:scaleY(.35); opacity:.6 } 50% { transform:scaleY(1); opacity:1 } }
`

export function DrumOtpBoxes({
  value,
  onChange,
  onComplete,
  accentColor = '#1a7c3e',
  error,
}: {
  value: string
  onChange: (v: string) => void
  onComplete: () => void
  accentColor?: string
  error?: string
}) {
  const r0 = React.useRef<HTMLInputElement>(null)
  const r1 = React.useRef<HTMLInputElement>(null)
  const r2 = React.useRef<HTMLInputElement>(null)
  const r3 = React.useRef<HTMLInputElement>(null)
  const r4 = React.useRef<HTMLInputElement>(null)
  const r5 = React.useRef<HTMLInputElement>(null)
  const refs = [r0, r1, r2, r3, r4, r5]

  const allFilled = value.length === 6

  React.useEffect(() => {
    if (value.length === 6) onComplete()
  }, [value, onComplete])

  const handle = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const arr = (value + '      ').split('').slice(0, 6)
    arr[i] = v
    onChange(arr.join('').trimEnd())
    if (v && i < 5) refs[i + 1].current?.focus()
  }

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs[i - 1].current?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (t) onChange(t)
  }

  const drumBarHeights = [8, 14, 20, 16, 10, 12]
  const drumDelays = ['0s', '0.18s', '0.36s', '0.24s', '0.06s', '0.3s']

  return (
    <div>
      <style>{DRUM_CSS}</style>
      {/* Label row */}
      <div style={{ fontSize: 10, fontWeight: 800, color: '#d4a017', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12, textAlign: 'center' }}>
        🥁 TALKING DRUM CODE
      </div>

      {/* Boxes */}
      <div style={{ display: 'flex', gap: 8 }} onPaste={handlePaste}>
        {refs.map((ref, i) => {
          const filled = !!value[i]
          return (
            <input
              key={i}
              ref={ref}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[i] ?? ''}
              placeholder="•"
              onChange={e => handle(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              autoFocus={i === 0}
              style={{
                flex: 1,
                height: 68,
                borderRadius: 16,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 900,
                color: filled ? '#fff' : 'rgba(255,255,255,.22)',
                background: filled
                  ? `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`
                  : 'rgba(255,255,255,.04)',
                border: filled
                  ? `2.5px solid ${accentColor}`
                  : '2px solid rgba(255,255,255,.1)',
                outline: 'none',
                boxShadow: allFilled
                  ? `0 0 28px ${accentColor}70, 0 0 10px ${accentColor}50`
                  : filled
                    ? `0 0 20px ${accentColor}50`
                    : 'none',
                animation: filled ? 'drumFill .35s ease both' : 'none',
                transition: 'border-color .15s, background .15s, box-shadow .15s',
              }}
            />
          )
        })}
      </div>

      {/* Mini drum wave bars */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {drumBarHeights.map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 3,
                height: h,
                borderRadius: 2,
                background: `${accentColor}99`,
                animation: `drumPulse 1.3s ease-in-out ${drumDelays[i]} infinite`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Inline error */}
      {error && (
        <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: 10, padding: '8px 14px', background: 'rgba(178,34,34,.1)', borderRadius: 10, border: '1px solid rgba(178,34,34,.2)' }}>
          {error}
        </div>
      )}
    </div>
  )
}
