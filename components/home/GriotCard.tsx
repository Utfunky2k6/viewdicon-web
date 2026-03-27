'use client'
import * as React from 'react'
import { Skeleton } from '@/components/ui'

interface GriotCardProps {
  message?: string
  chips?: { label: string; action: string }[]
  isLoading?: boolean
}

const DEFAULT_CHIPS = [
  { label: '🌾 View grain prices', action: '/dashboard/marketplace' },
  { label: '🤝 See buyer requests', action: '/dashboard/marketplace' },
  { label: '💬 Ask Griot',          action: '/dashboard/ai' },
]

export function GriotCard({ message, chips, isLoading }: GriotCardProps) {
  const now = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="mx-3 my-3 rounded-2xl overflow-hidden relative cursor-pointer card-lift"
      style={{
        background: 'linear-gradient(135deg, #0f5028 0%, #1a7c3e 60%, #145f30 100%)',
        padding: '16px 14px',
      }}
    >
      {/* Eagle watermark */}
      <div className="absolute pointer-events-none" style={{ right: -12, bottom: -12, fontSize: 72, opacity: 0.08, transform: 'scaleX(-1)' }}>🦅</div>

      {/* Subtle inner glow */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: 0, width: '60%', height: '60%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 relative">
        <div
          className="shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            background: 'rgba(255,255,255,.12)',
            border: '1.5px solid rgba(255,255,255,.2)',
            fontSize: 17,
            backdropFilter: 'blur(4px)',
          }}
        >
          🦅
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.85)', letterSpacing: '.04em' }}>Griot · Your AI Elder</div>
        </div>
        <div className="ml-auto" style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{now}</div>
      </div>

      {/* Message */}
      {isLoading ? (
        <div className="mb-3">
          <Skeleton style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
          <Skeleton style={{ height: 14, borderRadius: 4, marginBottom: 6, width: '85%' }} />
          <Skeleton style={{ height: 14, borderRadius: 4, width: '60%' }} />
        </div>
      ) : (
        <div className="relative" style={{ fontSize: 13, color: '#d1fae5', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>
          &ldquo;{message ?? 'Umoh, grain prices are up 12% in Lagos market this morning. Two Agriculture Village buyers are looking for a Market Vendor with your Crest tier. Your Ajo circle collects this Friday — ₡800 coming to you. A good morning to trade.'}&rdquo;
        </div>
      )}

      {/* Action chips */}
      <div className="flex gap-1.5 flex-wrap relative">
        {(chips ?? DEFAULT_CHIPS).map(({ label }) => (
          <span
            key={label}
            className="rounded-full cursor-pointer active:scale-95 transition-transform"
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.18)',
              padding: '5px 12px',
              fontSize: 10,
              color: '#fff',
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
