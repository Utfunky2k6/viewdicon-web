'use client'
// ============================================================
// DrumPulse — the Viewdicon loading indicator
// The Talking Drum: oldest long-distance comms in West Africa.
// Fast 4G = fast beat. Slow 2G = slow beat.
// NOT a spinner. A djembe that breathes at the pace of the net.
// ============================================================
import { motion } from 'framer-motion'

export type DrumSpeed = 'fast' | 'medium' | 'slow' | number

// Map named speeds to duration in seconds
const SPEED_MAP: Record<string, number> = {
  fast:   0.25,   // 4G
  medium: 0.5,    // 3G
  slow:   0.9,    // 2G / EDGE
}

interface DrumPulseProps {
  speed?: DrumSpeed
  size?: number
  className?: string
}

export function DrumPulse({ speed = 'medium', size = 32, className }: DrumPulseProps) {
  const dur = typeof speed === 'number' ? speed : SPEED_MAP[speed] ?? 0.5

  return (
    <motion.div
      aria-label="Loading…"
      role="status"
      className={className}
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        background:     'var(--bg-subtle)',
        border:         '2px solid var(--green-primary)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}
      animate={{
        scale:       [1, 1.15, 1],
        borderColor: ['#1a7c3e', '#22c55e', '#1a7c3e'],
        boxShadow: [
          '0 0 0 0px rgba(26,124,62,0.4)',
          '0 0 0 6px rgba(26,124,62,0)',
          '0 0 0 0px rgba(26,124,62,0)',
        ],
      }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Inner djembe core */}
      <motion.div
        style={{
          width:        size * 0.35,
          height:       size * 0.35,
          borderRadius: '50%',
          background:   '#1a7c3e',
        }}
        animate={{ scale: [1, 0.6, 1] }}
        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

// ── Full-screen loading overlay ─────────────────────────────────
export function DrumPulseScreen({ label = 'Loading…', speed = 'medium' }: {
  label?: string
  speed?: DrumSpeed
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg)' }}
    >
      <DrumPulse speed={speed} size={56} />
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>
        {label}
      </p>
    </div>
  )
}

// ── Inline loading state for buttons ───────────────────────────
export function DrumPulseInline({ speed = 'fast' }: { speed?: DrumSpeed }) {
  return <DrumPulse speed={speed} size={18} />
}
