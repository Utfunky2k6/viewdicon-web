'use client'
import * as React from 'react'
import { GradBtn } from '../atoms/GradBtn'

interface TermsSceneProps {
  onNext: () => void
  theme: any
}

export function TermsScene({ onNext, theme }: TermsSceneProps) {
  const [agreed, setAgreed] = React.useState(false)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, background: theme.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 26, fontWeight: 900, color: theme.text, marginBottom: 10 }}>Oath of Entry</div>
        <p style={{ fontSize: 14, color: theme.subText, lineHeight: 1.6 }}>By entering the Motherland, you swear to uphold the principles of Ubuntu, sovereignty, and kinship.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 13, lineHeight: 1.8, color: theme.text }}>
          <p style={{ marginBottom: 16 }}><strong>1. Sovereignty:</strong> You own your data. We do not sell, rent, or trade your spirit to outsiders.</p>
          <p style={{ marginBottom: 16 }}><strong>2. Ubuntu:</strong> Your identity is linked to your community. To harm one is to harm all.</p>
          <p style={{ marginBottom: 0 }}><strong>3. The Guard:</strong> Your Afro-ID is your key. If lost, only your verified family can restore it.</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          border: `2px solid ${agreed ? theme.accent : theme.border}`,
          background: agreed ? theme.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', transition: 'all .2s'
        }}>
          {agreed && '✓'}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>I swear my oath</span>
      </div>

      <GradBtn onClick={onNext} style={!agreed ? { opacity: 0.4, pointerEvents: 'none' } : { height: 56 }}>Enter the Gates →</GradBtn>
    </div>
  )
}
