'use client'
import * as React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const CEREMONY_CSS = `
@keyframes ringExp{0%{transform:scale(.65);opacity:.9}100%{transform:scale(2.1);opacity:0}}
@keyframes wbBeat{0%,100%{transform:scaleY(.4);opacity:.6}50%{transform:scaleY(1);opacity:1}}
@keyframes sosP{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes confettiFall{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(110vh) rotate(720deg)}}
@keyframes breathScale{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.06);opacity:1}}
`

const STEP_LABELS: Record<string, string> = {
  TERMS: 'Oath of Entry',
  PRIVACY: 'Privacy Consent',
  PHONE: 'Talking Drum',
  OTP: 'Drum Code',
  CIRCLES: 'Three Circles',
  HERITAGE_VERIFY: 'Heritage Verification',
  DEVICE: 'Sovereign Binding',
  FINGERPRINT: 'Fingerprint Bind',
  BIOMETRIC: 'Face Recognition',
  VOICE: 'Voice Registration',
  HERITAGE: 'Heritage Check',
  NAMING: 'Naming Ceremony',
  FAMILY: 'Family Tree',
  VILLAGE: 'Village Gate',
  ROLE: 'Choose Role',
  CONFIRM: 'Confirm Path',
  CORONATION: 'Digital Birth',
  ALLY_CORONATION: 'Ally Coronation',
  ALLY_NAME: 'Your Identity',
}

interface ShellProps {
  children: React.ReactNode
  progress: number
  step: string
  theme: any
  stepIndex: number
  sequenceLength: number
}

export function Shell({ children, progress, step, theme, stepIndex, sequenceLength }: ShellProps) {
  const displayStep = stepIndex + 1

  return (
    <div style={{
      position: 'fixed', inset: 0, background: theme.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      color: theme.text, transition: 'background .3s ease, color .3s ease'
    }}>
      <style>{CEREMONY_CSS}</style>

      {/* Top Bar */}
      <div style={{
        padding: '12px 16px 8px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`,
        background: theme.card, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image
              src="/logo-clean.png"
              alt="Viewdicon"
              width={34}
              height={34}
              style={{ width: 34, height: 34, objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(26,124,62,.4))' }}
            />
          <div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: '-0.02em', color: theme.text }}>VIEWDICON</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: theme.gold, textTransform: 'uppercase', letterSpacing: '.12em', marginTop: -1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Scene {displayStep} of {sequenceLength}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ color: theme.accent }}>{STEP_LABELS[step]}</span>
            </div>
          </div>
        </div>

        {/* Step Identifier Pill */}
        <div style={{ padding: '5px 12px', borderRadius: 20, background: `${theme.accent}12`, border: `1px solid ${theme.accent}25`, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />
          <div style={{ fontSize: 10, fontWeight: 900, color: theme.accent, textTransform: 'uppercase', letterSpacing: '.04em' }}>{step}</div>
        </div>
      </div>

      {/* Progress Line */}
      <div style={{ height: 4, background: theme.muted, position: 'relative', zIndex: 20, overflow: 'hidden' }}>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: progress / 100 }} transition={{ duration: 0.5 }} style={{ height: '100%', background: `linear-gradient(to right, ${theme.accent}, #b22222)`, borderRadius: '0 2px 2px 0', transformOrigin: 'left' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>
        {children}
      </div>

      <div style={{ height: 'env(safe-area-inset-bottom)', background: theme.card }} />
    </div>
  )
}
