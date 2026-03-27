'use client'
// ============================================================
// HeatBar — 5-stage African Pot heat indicator
// COLD · EMBER · SIMMER · BOIL · FEAST
// ============================================================
import * as React from 'react'
import { VOCAB } from '@/constants/vocabulary'

interface HeatBarProps {
  heatScore: number
  compact?: boolean
}

type HeatStage = 'COLD' | 'EMBER' | 'SIMMER' | 'BOIL' | 'FEAST'

function getStage(score: number): HeatStage {
  if (score >= 90) return 'FEAST'
  if (score >= 60) return 'BOIL'
  if (score >= 30) return 'SIMMER'
  if (score >= 10) return 'EMBER'
  return 'COLD'
}

const STAGE_CONFIG: Record<HeatStage, {
  label: string; color: string; bg: string;
  barColor: string; icon: string; glow: string
}> = {
  COLD:   { label: VOCAB.stageCold,   color: '#6b7280', bg: 'rgba(107,114,128,.1)',  barColor: '#6b7280', icon: '❄️', glow: 'none' },
  EMBER:  { label: VOCAB.stageEmber,  color: '#d97706', bg: 'rgba(217,119,6,.1)',    barColor: '#d97706', icon: '🌡', glow: 'none' },
  SIMMER: { label: VOCAB.stageSimmer, color: '#f97316', bg: 'rgba(249,115,22,.12)',  barColor: '#f97316', icon: '🔥', glow: '0 0 8px rgba(249,115,22,.35)' },
  BOIL:   { label: VOCAB.stageBoil,   color: '#ef4444', bg: 'rgba(239,68,68,.12)',   barColor: '#ef4444', icon: '🔥', glow: '0 0 12px rgba(239,68,68,.45)' },
  FEAST:  { label: VOCAB.stageFeast,  color: '#b22222', bg: 'rgba(178,34,34,.18)',   barColor: 'linear-gradient(90deg,#ef4444,#d4a017,#b22222)', icon: '🔥', glow: '0 0 18px rgba(178,34,34,.6)' },
}

const CSS = `
@keyframes hb-pulse{0%,100%{opacity:1}50%{opacity:.65}}
@keyframes hb-feast-pulse{0%,100%{box-shadow:0 0 10px rgba(178,34,34,.4)}50%{box-shadow:0 0 22px rgba(212,160,23,.7)}}
@keyframes hb-ring{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.08);opacity:1}}
`

export function HeatBar({ heatScore, compact = false }: HeatBarProps) {
  const stage = getStage(heatScore)
  const cfg = STAGE_CONFIG[stage]
  const isFeast = stage === 'FEAST'
  const isBoil  = stage === 'BOIL'

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('hb-css')) {
      const s = document.createElement('style')
      s.id = 'hb-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
        fontFamily: "'Sora', sans-serif",
        color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`,
        animation: (isBoil || isFeast) ? 'hb-pulse 2s ease-in-out infinite' : 'none',
        boxShadow: cfg.glow,
      }}>
        {cfg.icon} {cfg.label} {heatScore}°
      </span>
    )
  }

  // Full bar mode
  const pct = Math.min(heatScore, 100)
  return (
    <div style={{ margin: '6px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, fontFamily: "'Sora', sans-serif",
          color: cfg.color,
          animation: (isBoil || isFeast) ? 'hb-pulse 1.8s ease-in-out infinite' : 'none',
        }}>
          {cfg.icon} {cfg.label}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: "'Inter', sans-serif" }}>
          {heatScore}°
        </span>
      </div>
      {/* Track */}
      <div style={{
        position: 'relative', height: 6, borderRadius: 99,
        background: 'rgba(255,255,255,.07)', overflow: 'hidden',
        boxShadow: isFeast ? '0 0 8px rgba(178,34,34,.4)' : 'none',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: isFeast
            ? 'linear-gradient(90deg,#ef4444,#d4a017,#b22222)'
            : cfg.barColor,
          transition: 'width .45s ease',
          animation: isFeast ? 'hb-feast-pulse 2s ease-in-out infinite' : 'none',
        }} />
        {/* Position dot */}
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%,-50%)',
          width: 9, height: 9, borderRadius: '50%',
          background: cfg.color,
          border: '1.5px solid #0a0f0b',
          boxShadow: cfg.glow,
          animation: isFeast ? 'hb-ring 1.4s ease-in-out infinite' : 'none',
        }} />
      </div>
      {isFeast && (
        <div style={{
          marginTop: 4, fontSize: 10, color: '#d4a017',
          fontFamily: "'Inter', sans-serif", fontStyle: 'italic',
        }}>
          {VOCAB.stageFeast} — {VOCAB.drumToNation}?
        </div>
      )}
    </div>
  )
}

export default HeatBar
