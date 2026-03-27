'use client'
import * as React from 'react'
import { useSkinStore, SKIN_META } from '@/stores/skinStore'
import type { ActiveSkin } from '@/types'

interface SkinSwitcherProps {
  variant?: 'compact' | 'full'
  className?: string
}

const SKINS: ActiveSkin[] = ['WORK', 'SOCIAL', 'CLAN']

const FLASH_COLORS: Record<ActiveSkin, string> = {
  WORK:   'rgba(26,124,62,.6)',
  SOCIAL: 'rgba(217,119,6,.6)',
  CLAN:   'rgba(124,58,237,.6)',
}

// ── PIN Gate Overlay ─────────────────────────────────────────────────
function PinGate({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [pin, setPin] = React.useState('')
  const [error, setError] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const STORED_PIN = '1234' // In production, from encrypted store

  React.useEffect(() => { inputRef.current?.focus() }, [])

  const handleChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4)
    setPin(cleaned)
    setError(false)
    if (cleaned.length === 4) {
      if (cleaned === STORED_PIN) {
        onConfirm()
      } else {
        setError(true)
        setTimeout(() => { setPin(''); setError(false) }, 800)
      }
    }
  }

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: 320, padding: '0 20px' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🏛</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#c084fc', marginBottom: 4 }}>
          IDILE · Sacred Space
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 24, lineHeight: 1.5 }}>
          Enter your Palm Mark to access your clan
        </div>

        {/* PIN dots */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16, position: 'relative' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 48, height: 56, borderRadius: 14,
              background: pin[i] ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.04)',
              border: `2px solid ${error ? '#ef4444' : pin[i] ? '#7c3aed' : 'rgba(255,255,255,.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 900, color: error ? '#ef4444' : '#c084fc',
              transition: 'all .2s',
              animation: error ? 'stShake .3s ease' : 'none',
            }}
            onClick={() => inputRef.current?.focus()}
            >
              {pin[i] ? '●' : ''}
            </div>
          ))}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={e => handleChange(e.target.value)}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'text' }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, marginBottom: 8 }}>
            Wrong PIN — try again
          </div>
        )}

        <button onClick={onCancel} style={{
          padding: '10px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)',
          background: 'none', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          marginTop: 8,
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export function SkinSwitcher({ variant = 'compact', className }: SkinSwitcherProps) {
  const { activeSkin, requiresPin, requestSkin, confirmSkin, cancelPinGate } = useSkinStore()
  const [flash, setFlash] = React.useState<string | null>(null)

  const handleSwitch = (skin: ActiveSkin) => {
    if (skin === activeSkin) return
    setFlash(FLASH_COLORS[skin])
    setTimeout(() => setFlash(null), 500)
    requestSkin(skin)
  }

  const handlePinConfirm = () => {
    setFlash(FLASH_COLORS.CLAN)
    setTimeout(() => setFlash(null), 500)
    confirmSkin()
  }

  if (variant === 'compact') {
    const meta = SKIN_META[activeSkin]
    return (
      <>
        <button
          onClick={() => {
            const idx = SKINS.indexOf(activeSkin)
            const next = SKINS[(idx + 1) % SKINS.length]
            handleSwitch(next)
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium border transition-all select-none"
          style={{
            color: meta.color,
            borderColor: `${meta.color}44`,
            background: `${meta.color}11`,
          }}
          aria-label={`Active skin: ${meta.label}. Tap to switch.`}
        >
          <span>{meta.emoji}</span>
          <span className="hidden sm:block">{meta.label}</span>
        </button>
        {/* Color flash overlay */}
        {flash && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 998, pointerEvents: 'none',
              background: flash, animation: 'skinFlash 0.5s ease-out forwards',
            }}
          />
        )}
        {/* PIN Gate */}
        {requiresPin && <PinGate onConfirm={handlePinConfirm} onCancel={cancelPinGate} />}
      </>
    )
  }

  // Full variant — 3-pill bar
  return (
    <>
      <div className={`flex gap-2.5 ${className ?? ''}`}>
        {SKINS.map((skin) => {
          const meta = SKIN_META[skin]
          const isActive = activeSkin === skin

          return (
            <button
              key={skin}
              onClick={() => handleSwitch(skin)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 transition-all"
              style={{
                borderColor: isActive ? meta.color : '#333',
                background: isActive ? `${meta.color}22` : '#1a1a1a',
              }}
            >
              <span className="text-xl">{meta.emoji}</span>
              <span
                className="text-[11px] font-bold"
                style={{ color: isActive ? meta.color : '#666' }}
              >
                {meta.label}
              </span>
              <span
                className="text-[10px]"
                style={{ color: isActive ? `${meta.color}bb` : '#444' }}
              >
                {meta.tagline}
              </span>
              {skin === 'CLAN' && !isActive && (
                <span style={{ fontSize: 8, color: '#7c3aed', fontWeight: 700, marginTop: 2 }}>🔒 PIN</span>
              )}
            </button>
          )
        })}
      </div>
      {/* Color flash overlay */}
      {flash && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 998, pointerEvents: 'none',
            background: flash, animation: 'skinFlash 0.5s ease-out forwards',
          }}
        />
      )}
      {/* PIN Gate */}
      {requiresPin && <PinGate onConfirm={handlePinConfirm} onCancel={cancelPinGate} />}
    </>
  )
}
