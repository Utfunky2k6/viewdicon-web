'use client'
import Image from 'next/image'

const LOGO_CSS_ID = 'vi-logo-fx'
const LOGO_CSS = `
@keyframes viGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(26,124,62,.5))}50%{filter:drop-shadow(0 0 14px rgba(26,124,62,.8))}}
@keyframes viRingSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes viPulse{0%,100%{opacity:.6;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
`

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById(LOGO_CSS_ID)) {
    const s = document.createElement('style')
    s.id = LOGO_CSS_ID
    s.textContent = LOGO_CSS
    document.head.appendChild(s)
  }
}

/** Full logo with animated glow + wordmark */
export function ViewdiconLogo({ size = 76 }: { size?: number }) {
  if (typeof window !== 'undefined') injectCSS()
  const ringW = Math.max(2, size * 0.03)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Outer spinning ring */}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `${ringW}px solid transparent`,
          borderTopColor: '#1a7c3e', borderRightColor: '#d4a017', borderBottomColor: '#b22222',
          animation: 'viRingSpin 4s linear infinite',
          opacity: 0.7,
        }} />
        {/* Subtle pulse ring */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '1px solid rgba(26,124,62,.15)',
          animation: 'viPulse 3s ease-in-out infinite',
        }} />
        {/* Logo image — transparent PNG, no white */}
        <Image
          src="/logo-clean.png"
          alt="Viewdicon"
          width={size}
          height={size}
          priority
          style={{
            width: size, height: size, objectFit: 'contain',
            animation: 'viGlow 3s ease-in-out infinite',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: Math.max(10, size * 0.16),
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'lowercase',
          marginTop: 8,
          background: 'linear-gradient(to right, #1a7c3e, #d4a017, #b22222)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        viewdicon
      </div>
    </div>
  )
}

/** Mini logo — icon + wordmark inline */
export function ViewdiconMini({ size = 26 }: { size?: number }) {
  if (typeof window !== 'undefined') injectCSS()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Image
        src="/logo-clean.png"
        alt="Vi"
        width={size}
        height={size}
        style={{
          width: size, height: size, objectFit: 'contain',
          filter: 'drop-shadow(0 0 4px rgba(26,124,62,.4))',
        }}
      />
      <span style={{
        fontSize: 12, fontWeight: 800, color: '#1a7c3e',
        fontFamily: "'Sora', sans-serif", letterSpacing: '0.08em',
      }}>viewdicon</span>
    </div>
  )
}

/** Tiny icon for TopBar / nav — with subtle glow */
export function ViewdiconIcon({ size = 28 }: { size?: number }) {
  if (typeof window !== 'undefined') injectCSS()
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Thin spinning accent ring */}
      <div style={{
        position: 'absolute', inset: -2, borderRadius: '50%',
        border: '1.5px solid transparent',
        borderTopColor: '#1a7c3e', borderRightColor: '#d4a017', borderBottomColor: '#b22222',
        animation: 'viRingSpin 4s linear infinite',
        opacity: 0.5,
      }} />
      <Image
        src="/logo-clean.png"
        alt="Vi"
        width={size}
        height={size}
        priority
        style={{
          width: size, height: size, objectFit: 'contain',
          filter: 'drop-shadow(0 0 3px rgba(26,124,62,.35))',
        }}
      />
    </div>
  )
}
