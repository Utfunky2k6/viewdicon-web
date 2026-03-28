'use client'
import * as React from 'react'

const DRUM_CSS = `
@keyframes drumFill {
  0%   { transform: scale(0.78); opacity: .6 }
  65%  { transform: scale(1.12) }
  100% { transform: scale(1) }
}
@keyframes drumPulse {
  0%,100% { transform: scaleY(.3); opacity: .45 }
  50%     { transform: scaleY(1); opacity: 1 }
}
@keyframes otpShake {
  0%,100% { transform: translateX(0) }
  18%,54% { transform: translateX(-7px) }
  36%,72% { transform: translateX(7px) }
}
@keyframes otpGlow {
  0%,100% { box-shadow: 0 0 0 0 transparent }
  50%     { box-shadow: 0 0 18px 4px var(--otp-accent) }
}
`

interface DrumOtpBoxesProps {
  value: string
  onChange: (v: string) => void
  onComplete: () => void
  accentColor?: string
  error?: string
  label?: string
  isDark?: boolean
}

export function DrumOtpBoxes({
  value,
  onChange,
  onComplete,
  accentColor = '#1a7c3e',
  error,
  label = '🥁 TALKING DRUM CODE',
  isDark = true,
}: DrumOtpBoxesProps) {
  // Theme-derived colour tokens — keeps dark as default for backwards compat
  const textFilled  = isDark ? '#ffffff'               : '#1a0f08'
  const textEmpty   = isDark ? 'rgba(255,255,255,.22)' : 'rgba(26,15,8,.28)'
  const bgEmpty     = isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)'
  const bgCursor    = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'
  const borderEmpty = isDark ? 'rgba(255,255,255,.1)'  : 'rgba(0,0,0,.13)'
  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ]

  const allFilled = value.length === 6
  const [shake, setShake] = React.useState(false)
  const prevError = React.useRef(error)

  // Auto-focus first box on mount only (not on re-renders)
  React.useEffect(() => {
    const t = setTimeout(() => inputRefs[0].current?.focus(), 150)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fire onComplete when 6 digits are entered
  React.useEffect(() => {
    if (value.length === 6) onComplete()
  }, [value, onComplete])

  // Shake animation when a new error appears
  React.useEffect(() => {
    if (error && error !== prevError.current) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 520)
      return () => clearTimeout(t)
    }
    prevError.current = error
  }, [error])

  // Re-focus first empty box when value is cleared externally
  React.useEffect(() => {
    if (value === '') {
      setTimeout(() => inputRefs[0].current?.focus(), 60)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (i: number, raw: string) => {
    // Accept only single digits
    const digit = raw.replace(/\D/g, '').slice(-1)
    const arr = (value + '      ').split('').slice(0, 6)
    arr[i] = digit
    const next = arr.join('').trimEnd()
    onChange(next)
    if (digit && i < 5) inputRefs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        // Clear current
        const arr = (value + '      ').split('').slice(0, 6)
        arr[i] = ' '
        onChange(arr.join('').trimEnd())
      } else if (i > 0) {
        inputRefs[i - 1].current?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) inputRefs[i - 1].current?.focus()
    if (e.key === 'ArrowRight' && i < 5) inputRefs[i + 1].current?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!digits) return
    onChange(digits)
    // Focus the next empty box or last box
    const focusIdx = Math.min(digits.length, 5)
    setTimeout(() => inputRefs[focusIdx].current?.focus(), 20)
  }

  // Click already-filled box → focus it so user can overwrite
  const handleClick = (i: number) => {
    inputRefs[i].current?.select()
  }

  // Drum bars — height varies per bar for visual rhythm
  const barHeights = [10, 16, 22, 18, 12, 14]
  const barDelays  = ['0s', '0.16s', '0.32s', '0.22s', '0.08s', '0.27s']

  return (
    <div
      style={{
        // CSS custom prop consumed by otpGlow keyframe
        ['--otp-accent' as string]: `${accentColor}80`,
        animation: shake ? 'otpShake .5s ease' : 'none',
      }}
    >
      <style>{DRUM_CSS}</style>

      {/* Label */}
      {label && (
        <div style={{
          fontSize: 10, fontWeight: 800, color: '#d4a017',
          textTransform: 'uppercase', letterSpacing: '0.18em',
          marginBottom: 16, textAlign: 'center',
        }}>
          {label}
        </div>
      )}

      {/* Six digit boxes */}
      <div
        style={{ display: 'flex', gap: 8 }}
        onPaste={handlePaste}
      >
        {inputRefs.map((ref, i) => {
          const filled   = !!value[i]
          const isCursor = value.length === i  // next box to fill

          return (
            <input
              key={i}
              ref={ref}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}  // allow 2 so replace to single-digit works on Android
              value={value[i] ?? ''}
              placeholder="·"
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onClick={() => handleClick(i)}
              style={{
                // Square — flex-grow but capped by aspect-ratio
                flex: 1,
                minWidth: 0,
                aspectRatio: '1 / 1',
                maxWidth: 64,
                borderRadius: 14,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1,
                color: filled ? textFilled : textEmpty,
                background: allFilled
                  ? `linear-gradient(145deg, ${accentColor}45, ${accentColor}22)`
                  : filled
                    ? `linear-gradient(145deg, ${accentColor}30, ${accentColor}14)`
                    : isCursor
                      ? bgCursor
                      : bgEmpty,
                border: `2.5px solid ${
                  allFilled
                    ? accentColor
                    : filled
                      ? `${accentColor}cc`
                      : isCursor
                        ? `${accentColor}55`
                        : borderEmpty
                }`,
                outline: 'none',
                boxShadow: allFilled
                  ? `0 0 22px ${accentColor}55, inset 0 1px 0 rgba(255,255,255,.18)`
                  : filled
                    ? `0 0 14px ${accentColor}35`
                    : 'none',
                animation: filled ? 'drumFill .32s cubic-bezier(.34,1.56,.64,1) both' : 'none',
                transition: 'border-color .15s, background .15s, box-shadow .18s',
                caretColor: 'transparent',
                WebkitAppearance: 'none',
                cursor: 'pointer',
              }}
            />
          )
        })}
      </div>

      {/* Drum-wave bars — one under each box */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1, display: 'flex',
              justifyContent: 'center', alignItems: 'flex-end',
              height: 22,
            }}
          >
            <div
              style={{
                width: 3, height: h, borderRadius: 3,
                background: value[i]
                  ? accentColor
                  : `${accentColor}55`,
                animation: `drumPulse 1.35s ease-in-out ${barDelays[i]} infinite`,
                transition: 'background .2s',
              }}
            />
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          fontSize: 12, color: '#f87171', textAlign: 'center',
          marginTop: 12, padding: '9px 14px',
          background: 'rgba(178,34,34,.12)',
          borderRadius: 10, border: '1px solid rgba(178,34,34,.28)',
          lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
