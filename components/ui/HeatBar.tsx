'use client'
// ============================================================
// HeatBar — social temperature indicator
// Cold → Simmering → Boiling → FIRE
// At 78+ the bar slowly pulses (on FIRE).
// heatScore formula: (kila*2.5)+(comments*4)+(drumScope*10)+(crestTier*1.5)-(hoursSincePost*0.8)
// ============================================================
import { motion } from 'framer-motion'

interface HeatState {
  label: string
  color: string
  glow:  boolean
}

function getHeatState(score: number): HeatState {
  if (score >= 78) return { label: 'FIRE 🔥', color: '#ffffff', glow: true  }
  if (score >= 40) return { label: 'Boiling',  color: '#ef4444', glow: false }
  if (score >= 10) return { label: 'Simmering',color: '#f97316', glow: false }
  return               { label: 'Cold',      color: '#60a5fa', glow: false }
}

interface HeatBarProps {
  score: number   // 0–100
  showLabel?: boolean
  compact?: boolean
}

export function HeatBar({ score, showLabel = true, compact = false }: HeatBarProps) {
  const clamped = Math.max(0, Math.min(100, score))
  const { label, color, glow } = getHeatState(clamped)

  return (
    <div style={{ margin: compact ? '4px 0' : '8px 0' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color, fontSize: 12, fontWeight: 700 }}>{label}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{clamped}°</span>
        </div>
      )}

      {/* Track */}
      <div
        style={{
          height:       compact ? 4 : 6,
          background:   'var(--border)',
          borderRadius: 99,
          overflow:     'hidden',
        }}
      >
        {/* Fill bar */}
        <motion.div
          style={{ height: '100%', background: color, borderRadius: 99, originX: 0 }}
          animate={{
            width:   `${clamped}%`,
            ...(glow ? { opacity: [1, 0.55, 1] } : {}),
          }}
          transition={
            glow
              ? {
                  width:   { duration: 0.4 },
                  opacity: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
                }
              : { duration: 0.4, ease: 'easeOut' }
          }
        />
      </div>
    </div>
  )
}
