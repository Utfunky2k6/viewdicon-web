'use client'
import * as React from 'react'
import { GradBtn } from '../atoms/GradBtn'

interface PrivacySceneProps {
  onNext: () => void
  theme: any
}

export function PrivacyScene({ onNext, theme }: PrivacySceneProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, background: theme.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 26, fontWeight: 900, color: theme.text, marginBottom: 10 }}>Privacy Consent</div>
        <p style={{ fontSize: 14, color: theme.subText, lineHeight: 1.6 }}>Your data is encrypted using the Nkisi Shield protocols.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 'auto' }}>
        {[
          { icon: '👁️', title: 'Zero Knowledge', desc: 'We never see your biometric keys.' },
          { icon: '📡', title: 'Local Processing', desc: 'Your voice stays on your device.' },
          { icon: '🧊', title: 'Cold Storage', desc: 'Inactive identities are frozen for safety.' }
        ].map(item => (
          <div key={item.title} style={{ display: 'flex', gap: 16, padding: 16, borderRadius: 16, background: theme.card, border: `1.5px solid ${theme.border}` }}>
            <div style={{ fontSize: 24 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{item.title}</div>
              <div style={{ fontSize: 12, color: theme.subText }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <GradBtn onClick={onNext} style={{ height: 56 }}>Accept & Shield Identity →</GradBtn>
      </div>
    </div>
  )
}
