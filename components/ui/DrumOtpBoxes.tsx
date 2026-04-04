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
@keyframes otpCursorBlink {
  0%,49% { opacity: 1 }
  50%,100% { opacity: 0 }
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
  const textFilled  = isDark ? '#ffffff'               : '#1a0f08'
  const textEmpty   = isDark ? 'rgba(255,255,255,.22)' : 'rgba(26,15,8,.28)'
  const bgEmpty     = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)'
  const bgCursor    = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'
  const borderEmpty = isDark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.13)'

  // Single hidden input — handles ALL keyboard/paste on mobile
  const hiddenRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const allFilled = value.length === 6
  const [shake, setShake] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const prevError = React.useRef(error)

  // Auto-focus on mount
  React.useEffect(() => {
    const t = setTimeout(() => hiddenRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [])

  // Fire onComplete when 6 digits
  React.useEffect(() => {
    if (value.length === 6) onComplete()
  }, [value, onComplete])

  // Shake on new error
  React.useEffect(() => {
    if (error && error !== prevError.current) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 520)
      return () => clearTimeout(t)
    }
    prevError.current = error
  }, [error])

  // Re-focus when value cleared
  React.useEffect(() => {
    if (value === '') {
      setTimeout(() => hiddenRef.current?.focus(), 60)
    }
  }, [value])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
    onChange(digits)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // On backspace with empty value, do nothing special
    if (e.key === 'Backspace' && value.length === 0) {
      e.preventDefault()
    }
  }

  const focusInput = () => {
    hiddenRef.current?.focus()
  }

  // Drum bars
  const barHeights = [10, 16, 22, 18, 12, 14]
  const barDelays  = ['0s', '0.16s', '0.32s', '0.22s', '0.08s', '0.27s']
  const boxes = [0, 1, 2, 3, 4, 5]

  return (
    <div
      style={{
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

      {/* Hidden real input — captures ALL keyboard/paste */}
      <input
        ref={hiddenRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 1,
          height: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Visual boxes — tap anywhere to focus the hidden input */}
      <div
        ref={containerRef}
        onClick={focusInput}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 'clamp(6px, 2.5vw, 12px)',
          cursor: 'text',
        }}
      >
        {boxes.map(i => {
          const digit = value[i]
          const filled = !!digit
          const isCursor = value.length === i && focused

          return (
            <div
              key={i}
              style={{
                position: 'relative',
                height: 'clamp(48px, 14vw, 64px)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(20px, 6vw, 28px)',
                fontWeight: 900,
                color: filled ? textFilled : textEmpty,
                background: allFilled
                  ? `linear-gradient(145deg, ${accentColor}45, ${accentColor}22)`
                  : filled
                    ? `linear-gradient(145deg, ${accentColor}30, ${accentColor}14)`
                    : isCursor
                      ? bgCursor
                      : bgEmpty,
                border: `2px solid ${
                  allFilled
                    ? accentColor
                    : filled
                      ? `${accentColor}cc`
                      : isCursor
                        ? `${accentColor}66`
                        : borderEmpty
                }`,
                boxShadow: allFilled
                  ? `0 0 22px ${accentColor}55, inset 0 1px 0 rgba(255,255,255,.18)`
                  : filled
                    ? `0 0 14px ${accentColor}35`
                    : 'none',
                animation: filled ? 'drumFill .32s cubic-bezier(.34,1.56,.64,1) both' : 'none',
                transition: 'border-color .15s, background .15s, box-shadow .18s',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {digit || ''}
              {/* Blinking cursor */}
              {isCursor && (
                <div style={{
                  position: 'absolute',
                  width: 2,
                  height: '40%',
                  background: accentColor,
                  borderRadius: 2,
                  animation: 'otpCursorBlink 1s ease-in-out infinite',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Drum-wave bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'clamp(6px, 2.5vw, 12px)', marginTop: 10 }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
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
