/**
 * UFÈ — Compatibility Radar Chart
 * Financial-analytics style compatibility visualization.
 * SVG-based radar with 6 axes.
 */
'use client'

import * as React from 'react'
import { COLOR, TYPE, SPACE, RADIUS, REALM } from '../tokens'
import { LWText, LWBadge } from '../primitives'

const T = REALM.ufe

interface RadarData {
  cultural: number
  family: number
  genotype: number
  spiritual: number
  economic: number
  personality: number
}

const AXES = [
  { key: 'cultural', label: 'Cultural', angle: -90 },
  { key: 'family', label: 'Family', angle: -30 },
  { key: 'genotype', label: 'Genotype', angle: 30 },
  { key: 'spiritual', label: 'Spiritual', angle: 90 },
  { key: 'economic', label: 'Economic', angle: 150 },
  { key: 'personality', label: 'Personality', angle: 210 },
] as const

function polarToCart(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

function riskColor(v: number): string {
  if (v >= 80) return COLOR.success
  if (v >= 60) return T.accent
  if (v >= 40) return COLOR.warning
  return COLOR.danger
}

export function CompatibilityRadar({
  data,
  size = 240,
  overall,
  recommendation,
}: {
  data: RadarData
  size?: number
  overall: number
  recommendation?: 'PROCEED' | 'CONDITIONAL' | 'STOP'
}) {
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.38
  const rings = [25, 50, 75, 100]

  // Build polygon points for the data
  const points = AXES.map(axis => {
    const value = data[axis.key as keyof RadarData] || 0
    const r = (value / 100) * maxR
    return polarToCart(axis.angle, r, cx, cy)
  })
  const polyStr = points.map(p => `${p.x},${p.y}`).join(' ')

  const recLabel = recommendation === 'STOP' ? 'Not Recommended'
    : recommendation === 'CONDITIONAL' ? 'Review Required'
    : 'Compatible'

  const recVariant = recommendation === 'STOP' ? 'danger' as const
    : recommendation === 'CONDITIONAL' ? 'warning' as const
    : 'success' as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACE[3] }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric rings */}
        {rings.map(pct => {
          const r = (pct / 100) * maxR
          const ringPoints = AXES.map(a => polarToCart(a.angle, r, cx, cy))
          const d = ringPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
          return <path key={pct} d={d} fill="none" stroke={COLOR.border} strokeWidth={0.5} opacity={0.5} />
        })}

        {/* Axis lines */}
        {AXES.map(axis => {
          const end = polarToCart(axis.angle, maxR, cx, cy)
          return <line key={axis.key} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={COLOR.border} strokeWidth={0.5} opacity={0.3} />
        })}

        {/* Data polygon */}
        <polygon points={polyStr} fill={`${T.accent}20`} stroke={T.accent} strokeWidth={2} />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={T.accent} stroke={T.card} strokeWidth={2} />
        ))}

        {/* Labels */}
        {AXES.map(axis => {
          const labelR = maxR + 18
          const pos = polarToCart(axis.angle, labelR, cx, cy)
          const value = data[axis.key as keyof RadarData] || 0
          return (
            <text
              key={axis.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ ...TYPE.micro, fill: riskColor(value) }}
            >
              {axis.label}
            </text>
          )
        })}

        {/* Center score */}
        <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.h1, fill: overall >= 75 ? T.accent : COLOR.textSecondary, fontWeight: 700 }}>
          {overall}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" style={{ ...TYPE.micro, fill: COLOR.textMuted }}>
          OVERALL
        </text>
      </svg>

      {recommendation && <LWBadge variant={recVariant}>{recLabel}</LWBadge>}

      {/* Breakdown list */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: SPACE[1.5] }}>
        {AXES.map(axis => {
          const value = data[axis.key as keyof RadarData] || 0
          return (
            <div key={axis.key} style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
              <span style={{ ...TYPE.micro, color: COLOR.textMuted, width: 72, textTransform: 'uppercase', flexShrink: 0 }}>
                {axis.label}
              </span>
              <div style={{ flex: 1, height: 4, borderRadius: RADIUS.full, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${value}%`, borderRadius: RADIUS.full, background: riskColor(value), transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ ...TYPE.micro, color: riskColor(value), width: 28, textAlign: 'right' }}>{value}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Genotype Safety Card */
export function GenotypeCard({
  genotypeA,
  genotypeB,
  compatible,
  risk,
  message,
}: {
  genotypeA: string
  genotypeB: string
  compatible: boolean
  risk: 'NONE' | 'LOW' | 'HIGH'
  message: string
}) {
  const riskVariant = risk === 'NONE' ? 'success' as const : risk === 'LOW' ? 'warning' as const : 'danger' as const
  return (
    <div style={{
      padding: SPACE[4],
      background: compatible ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
      border: `1px solid ${compatible ? `${COLOR.success}30` : `${COLOR.danger}30`}`,
      borderRadius: RADIUS.xl,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[2] }}>
        <LWText scale="caption" color="secondary" as="span" style={{ fontWeight: 600 }}>Genotype Safety</LWText>
        <LWBadge variant={riskVariant}>{risk} RISK</LWBadge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3], marginBottom: SPACE[2] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
          <span style={{ ...TYPE.h2, color: COLOR.textPrimary, fontWeight: 700 }}>{genotypeA}</span>
          <span style={{ ...TYPE.caption, color: COLOR.textMuted }}>×</span>
          <span style={{ ...TYPE.h2, color: COLOR.textPrimary, fontWeight: 700 }}>{genotypeB}</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          {compatible ? (
            <path d="M20 6L9 17l-5-5" stroke={COLOR.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <circle cx="12" cy="12" r="10" stroke={COLOR.danger} strokeWidth="2" />
              <path d="M15 9l-6 6M9 9l6 6" stroke={COLOR.danger} strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>
      <LWText scale="caption" color="muted">{message}</LWText>
    </div>
  )
}
