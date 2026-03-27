'use client'
import * as React from 'react'
import { useSkinStore } from '@/stores/skinStore'

export function PinGate() {
  const { requiresPin, confirmSkin, cancelPinGate } = useSkinStore()
  const [pin, setPin] = React.useState('')

  // Reset PIN when gate opens
  React.useEffect(() => {
    if (requiresPin) setPin('')
  }, [requiresPin])

  const handleKey = (digit: number) => {
    if (pin.length >= 4) return
    const next = pin + String(digit)
    setPin(next)

    if (next.length === 4) {
      // Accept any 4 digits for now — in production, verify against backend
      setTimeout(() => {
        confirmSkin('pin-token-placeholder')
        setPin('')
      }, 300)
    }
  }

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1))
  }

  const handleCancel = () => {
    setPin('')
    cancelPinGate()
  }

  if (!requiresPin) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: 56, marginBottom: 12 }}>🏛</div>

      {/* Title */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
        Enter Your Clan Space
      </h2>

      {/* Subtitle */}
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24, textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
        Your ancestral mask requires a Palm Mark to wear. Enter your secret PIN to enter Idile.
      </p>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 14, height: 14, borderRadius: '50%',
              border: `2px solid ${i < pin.length ? '#7c3aed' : '#444'}`,
              background: i < pin.length ? '#7c3aed' : 'transparent',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Number pad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: 200 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleKey(n)}
            style={{
              padding: 14, borderRadius: 12, background: '#1a1a1a',
              border: '1px solid #333', fontSize: 18, fontWeight: 700,
              color: '#fff', textAlign: 'center', cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleCancel}
          style={{
            padding: 14, borderRadius: 12, background: '#1a1a1a',
            border: '1px solid #333', fontSize: 12, fontWeight: 700,
            color: '#fff', textAlign: 'center', cursor: 'pointer',
          }}
        >
          ✕ Cancel
        </button>
        <button
          onClick={() => handleKey(0)}
          style={{
            padding: 14, borderRadius: 12, background: '#1a1a1a',
            border: '1px solid #333', fontSize: 18, fontWeight: 700,
            color: '#fff', textAlign: 'center', cursor: 'pointer',
          }}
        >
          0
        </button>
        <button
          onClick={handleDelete}
          style={{
            padding: 14, borderRadius: 12, background: '#1a1a1a',
            border: '1px solid #333', fontSize: 18, fontWeight: 700,
            color: '#fff', textAlign: 'center', cursor: 'pointer',
          }}
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
