'use client'
// ============================================================
// PriceHeatBar — Market price comparison bar
// 100 = at market, <100 = below market, >100 = above market
// ============================================================
import * as React from 'react'

interface PriceHeatBarProps {
  marketPricePercent: number // e.g. 92 = 8% below, 108 = 8% above
}

export function PriceHeatBar({ marketPricePercent: pct }: PriceHeatBarProps) {
  // Clamp to 60–140 for display, center at 100
  const clamped = Math.max(60, Math.min(140, pct))
  // Map 60-140 range to 0-100% for the bar position
  const barPosition = ((clamped - 60) / 80) * 100
  const pointerLeft = Math.min(98, Math.max(2, barPosition))

  const diff = Math.round(Math.abs(pct - 100))
  const isBelow = pct < 100
  const isAt = Math.abs(pct - 100) < 2
  const isHigh = pct >= 115

  const message = isAt
    ? 'At market price'
    : isBelow
    ? `${diff}% below market — great deal! 🎉`
    : isHigh
    ? `Overpriced by ${diff}%`
    : `${diff}% above market`

  const msgColor = isAt ? '#d4a017' : isBelow ? '#1a7c3e' : isHigh ? '#ef4444' : '#f97316'
  const dotColor = isBelow ? '#1a7c3e' : isHigh ? '#ef4444' : '#f97316'

  return (
    <div style={{ margin: '8px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: 'rgba(255,255,255,.35)',
        fontFamily: "'Inter', sans-serif", marginBottom: 4,
      }}>
        <span>Below market</span>
        <span>At market</span>
        <span>Above market</span>
      </div>
      {/* Gradient track */}
      <div style={{
        position: 'relative', height: 8, borderRadius: 99,
        background: 'linear-gradient(90deg, #1a7c3e 0%, #d4a017 50%, #ef4444 100%)',
        overflow: 'visible',
      }}>
        {/* Center marker */}
        <div style={{
          position: 'absolute', left: '50%', top: -3,
          width: 1, height: 14, background: 'rgba(255,255,255,.3)',
          transform: 'translateX(-50%)',
        }} />
        {/* Pointer triangle */}
        <div style={{
          position: 'absolute', top: -5, left: `${pointerLeft}%`,
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `7px solid ${dotColor}`,
          filter: `drop-shadow(0 0 4px ${dotColor}88)`,
        }} />
      </div>
      <div style={{
        marginTop: 5, fontSize: 10, fontWeight: 600,
        fontFamily: "'Sora', sans-serif", color: msgColor,
      }}>
        {message}
      </div>
    </div>
  )
}

export default PriceHeatBar
