'use client'
import * as React from 'react'
import { motion } from 'framer-motion'
import { GradBtn } from '../atoms/GradBtn'
import { type UserCircle } from '@/lib/dial-codes'

const CIRC_DEF = [
  { id: 0, title: 'Child of the Soil', sub: 'Born in Africa or to African parents', icon: '🧬', color: '#1a7c3e', quote: '"Roots deep in the motherland."' },
  { id: 1, title: 'Child of the Diaspora', sub: 'African heritage living abroad', icon: '🌍', color: '#e07b00', quote: '"Branches reaching across oceans."' },
  { id: 2, title: 'Friend of the Motherland', sub: 'Cultural ally building for Africa', icon: '🤝', color: '#3b82f6', quote: '"Heart beating for Africa\'s rise."' },
]

interface CirclesSceneProps {
  geoResult: any
  geoLoading: boolean
  onNext: (c: number) => void
  theme: any
}

export function CirclesScene({ geoResult, geoLoading, onNext, theme }: CirclesSceneProps) {
  const [sel, setSel] = React.useState(geoResult?.circle ? geoResult.circle - 1 : 0)

  // LAW 2: Non-African users only see Circles 2 & 3 (ids 1 and 2)
  const visibleCircles = React.useMemo(() => {
    return geoResult?.isAfrican === false ? CIRC_DEF.filter(c => c.id > 0) : CIRC_DEF
  }, [geoResult?.isAfrican])

  // Auto-select first visible circle for non-African if defaulted to 0
  React.useEffect(() => {
    if (geoResult?.isAfrican === false && sel === 0) setSel(1)
  }, [geoResult?.isAfrican, sel])

  const selectedCircle = CIRC_DEF.find(c => c.id === sel) || CIRC_DEF[0]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, background: theme.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚪</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 6 }}>The Three Circles</div>
        <div style={{ fontSize: 13, color: theme.subText, lineHeight: 1.5 }}>Africa is more than a map; it is a lineage. Choose your point of entry.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {visibleCircles.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSel(c.id)}
            style={{
              background: sel === c.id ? `${c.color}10` : theme.card,
              border: `2px solid ${sel === c.id ? c.color : theme.border}`,
              borderRadius: 20, padding: 18, cursor: 'pointer', position: 'relative',
              transition: 'all .3s ease'
            }}
          >
            {geoResult?.circle - 1 === c.id && (
              <div style={{
                position: 'absolute', top: -10, right: 16, background: theme.accent,
                color: '#fff', fontSize: 8, fontWeight: 900, padding: '3px 10px',
                borderRadius: 99, letterSpacing: '.05em'
              }}>AUTO-DETECTED 🛡</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                fontSize: 32, background: theme.muted, width: 54, height: 54,
                borderRadius: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: theme.text }}>{c.title}</div>
                <div style={{ fontSize: 11, color: theme.subText, marginTop: 2, lineHeight: 1.4 }}>{c.sub}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {geoLoading && (
        <div style={{ marginBottom: 20, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.accent, animation: 'sosP .8s infinite' }} />
          <div style={{ fontSize: 11, color: theme.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>Griot detecting heritage...</div>
        </div>
      )}

      {geoResult && !geoLoading && (
        <div style={{ background: theme.muted, borderRadius: 16, padding: 12, marginBottom: 20, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>GEO-INTELLIGENCE REPORT</div>
          <div style={{ fontSize: 11, color: theme.subText, lineHeight: 1.4 }}>
            {geoResult.isAfrican ? 'Native SIM detected on African soil. Sovereign entry cleared.' : geoResult.recommendation}
          </div>
        </div>
      )}

      <div style={{ background: theme.muted, borderRadius: 16, padding: 14, fontSize: 11, color: theme.subText, fontStyle: 'italic', textAlign: 'center', marginBottom: 'auto' }}>
        {selectedCircle.quote}
      </div>

      <GradBtn onClick={() => onNext(sel)} style={{ height: 56 }}>I am a {selectedCircle.title} →</GradBtn>
    </div>
  )
}
