'use client'
import * as React from 'react'
import { RINGS, EMPTY_RING_COUNTS, type RingCounts, type RingMeta } from '@/constants/rings'

const CSS = `
@keyframes ring-pulse-1{0%,100%{opacity:.65}50%{opacity:1}}
@keyframes ring-pulse-2{0%,100%{opacity:.5}50%{opacity:.85}}
@keyframes ring-pulse-3{0%,100%{opacity:.35}50%{opacity:.6}}
@keyframes ring-pulse-4{0%,100%{opacity:.25}50%{opacity:.45}}
`

interface RingDisplayProps {
  counts?: RingCounts
  /** Show details sheet on tap */
  onTapRing?: (ring: RingMeta) => void
  /** Compact inline mode (just counts in a row) */
  variant?: 'full' | 'compact' | 'stats'
}

export function RingDisplay({ counts = EMPTY_RING_COUNTS, onTapRing, variant = 'stats' }: RingDisplayProps) {
  const [expandedRing, setExpandedRing] = React.useState<RingMeta | null>(null)

  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('ring-css')) {
      const s = document.createElement('style'); s.id = 'ring-css'; s.textContent = CSS; document.head.appendChild(s)
    }
  }, [])

  const ringValues = [counts.ring1, counts.ring2, counts.ring3, counts.ring4]

  if (variant === 'stats') {
    return (
      <>
        <div style={{ display: 'flex', gap: 0 }}>
          {RINGS.map((ring, i) => (
            <button
              key={ring.key}
              onClick={() => { setExpandedRing(expandedRing?.key === ring.key ? null : ring); onTapRing?.(ring) }}
              style={{
                flex: 1, textAlign: 'center', padding: '10px 2px',
                background: expandedRing?.key === ring.key ? `${ring.color}15` : 'transparent',
                border: expandedRing?.key === ring.key ? `1px solid ${ring.color}33` : '1px solid transparent',
                borderRadius: expandedRing?.key === ring.key ? 10 : 0,
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: ring.color, lineHeight: 1 }}>{ringValues[i].toLocaleString()}</div>
              <div style={{ fontSize: 8, fontWeight: 700, color: ring.color, opacity: 0.7, marginTop: 2, letterSpacing: '.04em' }}>{ring.yoruba}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{ring.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Expanded ring detail */}
        {expandedRing && (
          <div style={{
            margin: '4px 12px 0', padding: 10, borderRadius: 10,
            background: `${expandedRing.color}08`, border: `1px solid ${expandedRing.color}22`,
            transition: 'all .2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{expandedRing.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: expandedRing.color }}>{expandedRing.yoruba} — {expandedRing.subtitle}</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', lineHeight: 1.5, marginBottom: 4 }}>{expandedRing.description}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>
              <strong style={{ color: expandedRing.color }}>See:</strong> {expandedRing.whatTheySee}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              <strong style={{ color: expandedRing.color }}>Can:</strong> {expandedRing.whatTheyCanDo}
            </div>
          </div>
        )}
      </>
    )
  }

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {RINGS.map((ring, i) => (
          <div key={ring.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11 }}>{ring.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: ring.color }}>{ringValues[i]}</span>
          </div>
        ))}
      </div>
    )
  }

  // Full concentric ring visualization
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
      {/* Concentric circles */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        {/* Ring 4 — outermost */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${RINGS[3].color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ring-pulse-4 4s ease-in-out infinite' }} />
        {/* Ring 3 */}
        <div style={{ position: 'absolute', inset: 24, borderRadius: '50%', border: `2px solid ${RINGS[2].color}77`, animation: 'ring-pulse-3 3.5s ease-in-out infinite' }} />
        {/* Ring 2 */}
        <div style={{ position: 'absolute', inset: 48, borderRadius: '50%', border: `2.5px solid ${RINGS[1].color}99`, animation: 'ring-pulse-2 3s ease-in-out infinite' }} />
        {/* Ring 1 — innermost */}
        <div style={{ position: 'absolute', inset: 72, borderRadius: '50%', border: `3px solid ${RINGS[0].color}`, background: `${RINGS[0].color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ring-pulse-1 2s ease-in-out infinite' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: RINGS[0].color }}>{counts.ring1}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.5)' }}>Ìdílé</div>
          </div>
        </div>

        {/* Ring labels positioned around */}
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: RINGS[3].color }}>{counts.ring4.toLocaleString()}</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,.35)' }}>Ìjọba</div>
        </div>
        <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: RINGS[2].color }}>{counts.ring3}</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,.35)' }}>Ìlú</div>
        </div>
        <div style={{ position: 'absolute', top: 54, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: RINGS[1].color }}>{counts.ring2}</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,.35)' }}>Ẹgbẹ́</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {RINGS.map((ring, i) => (
          <div key={ring.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ring.color }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>{ring.emoji} {ring.yoruba} ({ringValues[i]})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Single ring count chip — for inline use */
export function RingChip({ ring, count }: { ring: RingMeta; count: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99,
      background: `${ring.color}12`, border: `1px solid ${ring.color}33`,
      fontSize: 10, fontWeight: 700, color: ring.color,
    }}>
      {ring.emoji} {count} {ring.yoruba}
    </span>
  )
}

/** Invite to Ring button — replaces "Follow" */
export function InviteToRingButton({
  currentRing,
  onInvite,
  style: overrideStyle,
}: {
  currentRing?: RingMeta | null
  onInvite: () => void
  style?: React.CSSProperties
}) {
  if (currentRing) {
    return (
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700,
        background: `${currentRing.color}15`, border: `1px solid ${currentRing.color}44`,
        color: currentRing.color, cursor: 'default',
        ...overrideStyle,
      }}>
        {currentRing.emoji} {currentRing.yoruba} · {currentRing.subtitle}
      </button>
    )
  }

  return (
    <button onClick={onInvite} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700,
      background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.4)',
      color: '#4ade80', cursor: 'pointer', transition: 'all .2s',
      ...overrideStyle,
    }}>
      🏘 Invite to Village
    </button>
  )
}
