'use client'
import * as React from 'react'

interface ProverbData {
  proverb: string
  translation: string
  origin: string
}

// Proverb placeholder -- replaced by backend data when available
const DEFAULT_PROVERB: ProverbData = {
  proverb: '',
  translation: '',
  origin: '',
}

export function DailyProverb() {
  const { proverb, translation, origin } = DEFAULT_PROVERB

  return (
    <div
      className="mx-3 mt-2 mb-4 rounded-2xl relative overflow-hidden cursor-pointer card-lift"
      style={{
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1500 60%, #1a0a00 100%)',
        padding: '16px 14px',
      }}
    >
      {/* Leaf watermark */}
      <div className="absolute pointer-events-none" style={{ right: -8, bottom: -8, fontSize: 72, opacity: 0.07 }}>🌿</div>

      {/* Ambient gold glow */}
      <div className="absolute pointer-events-none" style={{ top: -20, left: '20%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)' }} />

      <div className="flex items-center gap-2 mb-3" style={{ fontSize: 10, fontWeight: 700, color: '#d4a017', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        <span style={{ fontSize: 14 }}>✦</span>
        Daily Wisdom — shared by the Griot
      </div>
      <div className="relative" style={{ fontSize: 15, fontStyle: 'italic', color: '#d4a017', lineHeight: 1.7, marginBottom: 8, fontWeight: 600 }}>
        {proverb}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(212,160,23,.55)', marginBottom: 10 }}>{translation} {origin}</div>
      <div
        className="inline-flex items-center gap-1.5 rounded-full active:scale-95 transition-transform"
        style={{
          background: 'rgba(212,160,23,.12)',
          border: '1px solid rgba(212,160,23,.25)',
          padding: '6px 12px',
          fontSize: 10,
          color: '#d4a017',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        🥁 Drum this proverb to your village
      </div>
    </div>
  )
}
