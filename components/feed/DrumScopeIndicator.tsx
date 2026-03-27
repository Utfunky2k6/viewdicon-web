'use client'
// ============================================================
// DrumScopeIndicator — Village / Region / Nation pill
// Shows the broadcast scope of a post
// ============================================================
import * as React from 'react'

interface DrumScopeIndicatorProps {
  scope: 1 | 2 | 3
  animated?: boolean
}

const SCOPE_CONFIG = {
  1: { icon: '🏘', label: 'Village', color: '#1a7c3e', bg: 'rgba(26,124,62,.15)', border: 'rgba(26,124,62,.35)' },
  2: { icon: '🌍', label: 'Region',  color: '#3b82f6', bg: 'rgba(59,130,246,.15)', border: 'rgba(59,130,246,.35)' },
  3: { icon: '📡', label: 'Nation',  color: '#b22222', bg: 'rgba(178,34,34,.15)',  border: 'rgba(178,34,34,.35)'  },
} as const

const CSS = `
@keyframes dsi-pulse{0%,100%{box-shadow:0 0 0 0 rgba(178,34,34,.35)}50%{box-shadow:0 0 0 5px rgba(178,34,34,0)}}
@keyframes dsi-pulse-blue{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.35)}50%{box-shadow:0 0 0 5px rgba(59,130,246,0)}}
`

export function DrumScopeIndicator({ scope, animated = false }: DrumScopeIndicatorProps) {
  const cfg = SCOPE_CONFIG[scope]

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('dsi-css')) {
      const s = document.createElement('style')
      s.id = 'dsi-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  const pulseAnim =
    animated && scope === 3 ? 'dsi-pulse 2s ease-in-out infinite' :
    animated && scope === 2 ? 'dsi-pulse-blue 2.5s ease-in-out infinite' :
    'none'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 9px',
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "'Sora', sans-serif",
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      animation: pulseAnim,
      whiteSpace: 'nowrap',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

export default DrumScopeIndicator
