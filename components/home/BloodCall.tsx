'use client'
import * as React from 'react'

export function BloodCall() {
  const [active, setActive] = React.useState(false)
  const [call, setCall] = React.useState<{ name: string; relationship: string; location: string; minutesAgo: number } | null>(null)

  // Subscribe to ws blood-call events
  React.useEffect(() => {
    // In production: connect to WS /ws/blood-call and listen for blood_call.received
    // For demo: simulate after 4s
    const t = setTimeout(() => {
      setCall({ name: 'Mma Utibe', relationship: 'Your Mother', location: 'Lagos', minutesAgo: 14 })
      setActive(true)
    }, 4000)
    return () => clearTimeout(t)
  }, [])

  if (!active || !call) return null

  return (
    <div
      style={{
        margin: '8px 12px',
        background: 'linear-gradient(135deg, #7f1d1d, #b22222)',
        borderRadius: 14, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        animation: 'sosPulse 2s ease-in-out infinite',
      }}
    >
      <style>{`@keyframes sosPulse{0%,100%{box-shadow:0 0 0 0 rgba(178,34,34,.4)}50%{box-shadow:0 0 0 8px rgba(178,34,34,0)}}`}</style>
      <div style={{ fontSize: 28, flexShrink: 0 }}>🥁</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Blood-Call from {call.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', lineHeight: 1.4 }}>
          {call.relationship} sent a distress signal — {call.minutesAgo} min ago · {call.location}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 99, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
        Respond →
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setActive(false) }}
        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 14, padding: 0 }}
      >✕</button>
    </div>
  )
}
