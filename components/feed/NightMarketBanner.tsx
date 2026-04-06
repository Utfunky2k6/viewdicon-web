'use client'
// ============================================================
// NightMarketBanner — 18:00–00:00 sticky deal booster banner
// ============================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'

interface NightMarketBannerProps {
  onDismiss?: () => void
}

const CSS = `
@keyframes nm-lantern{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes nm-glow{0%,100%{box-shadow:0 0 18px rgba(224,123,0,.25)}50%{box-shadow:0 0 32px rgba(224,123,0,.5)}}
@keyframes nm-fade-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes nm-pulse-text{0%,100%{opacity:1}50%{opacity:.7}}
`

function getMidnightCountdown(): string {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function NightMarketBanner({ onDismiss }: NightMarketBannerProps) {
  const router = useRouter()
  const [countdown, setCountdown] = React.useState(getMidnightCountdown())
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('nm-css')) {
      const s = document.createElement('style')
      s.id = 'nm-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  React.useEffect(() => {
    const timer = setInterval(() => setCountdown(getMidnightCountdown()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleBrowse = () => {
    router.push('/dashboard/villages/marketplace')
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 16px',
      background: 'linear-gradient(90deg, rgba(30,14,0,.95) 0%, rgba(56,26,0,.95) 50%, rgba(30,14,0,.95) 100%)',
      borderBottom: '1px solid rgba(224,123,0,.3)',
      animation: 'nm-fade-in .4s ease both, nm-glow 3s ease-in-out infinite',
      position: 'relative',
    }}>
      {/* Lantern icon */}
      <span style={{
        fontSize: 20,
        display: 'inline-block',
        animation: 'nm-lantern 2.5s ease-in-out infinite',
        transformOrigin: 'top center',
        flexShrink: 0,
      }}>
        🏮
      </span>

      {/* Text content — clickable to browse market */}
      <div
        onClick={handleBrowse}
        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
      >
        <div style={{
          fontSize: 12, fontWeight: 800, fontFamily: "'Sora', sans-serif",
          color: '#e07b00', letterSpacing: '.04em',
          animation: 'nm-pulse-text 2s ease-in-out infinite',
        }}>
          Night Market is open
        </div>
        <div style={{
          fontSize: 10, color: 'rgba(224,123,0,.7)',
          fontFamily: "'Inter', sans-serif", marginTop: 1,
        }}>
          Hot deals boosted · Market listings get +15 heat
        </div>
      </div>

      {/* Browse button */}
      <button
        onClick={handleBrowse}
        style={{
          padding: '5px 12px', borderRadius: 99,
          background: 'rgba(224,123,0,.15)', border: '1px solid rgba(224,123,0,.3)',
          color: '#e07b00', fontSize: 10, fontWeight: 700,
          cursor: 'pointer', flexShrink: 0,
          fontFamily: "'Sora', sans-serif",
        }}
      >
        Browse
      </button>

      {/* Countdown */}
      <div style={{
        textAlign: 'right', flexShrink: 0,
      }}>
        <div style={{ fontSize: 9, color: 'rgba(224,123,0,.5)', fontFamily: "'Inter', sans-serif" }}>
          Ends midnight
        </div>
        <div style={{
          fontSize: 13, fontWeight: 800, color: '#d4a017',
          fontFamily: "'Sora', sans-serif",
          fontVariantNumeric: 'tabular-nums',
        }}>
          {countdown}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          marginLeft: 8, padding: '3px 6px', borderRadius: 4,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(224,123,0,.5)', fontSize: 14, lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Dismiss Night Market banner"
      >
        ×
      </button>
    </div>
  )
}

export default NightMarketBanner
