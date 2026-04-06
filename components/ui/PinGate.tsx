'use client'
import * as React from 'react'
import { useSkinStore } from '@/stores/skinStore'
import { masqueradeApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const PIN_KEY = 'vd-clan-pin'   // localStorage key for hashed PIN
const ATTEMPTS_KEY = 'vd-pin-attempts'

/** Simple hash — not crypto, just obfuscation for localStorage */
function hashPin(pin: string, salt: string): string {
  let h = 0
  for (let i = 0; i < (pin + salt).length; i++) {
    h = Math.imul(31, h) + (pin + salt).charCodeAt(i) | 0
  }
  return Math.abs(h).toString(36)
}

type GateMode = 'enter' | 'create' | 'confirm' | 'reset' | 'locked'

export function PinGate() {
  const { requiresPin, confirmSkin, cancelPinGate } = useSkinStore()
  const user = useAuthStore(s => s.user)
  const salt = user?.id ?? 'afro-clan'

  const [mode, setMode] = React.useState<GateMode>('enter')
  const [pin, setPin] = React.useState('')
  const [confirmPin, setConfirmPin] = React.useState('')
  const [error, setError] = React.useState('')
  const [shake, setShake] = React.useState(false)
  const [resetInput, setResetInput] = React.useState('')

  const hasPin = typeof window !== 'undefined' && !!localStorage.getItem(PIN_KEY)

  // Determine entry mode when gate opens
  React.useEffect(() => {
    if (!requiresPin) return
    setPin('')
    setConfirmPin('')
    setError('')
    setResetInput('')
    const attempts = Number(typeof window !== 'undefined' ? localStorage.getItem(ATTEMPTS_KEY) ?? '0' : 0)
    if (attempts >= 5) { setMode('locked'); return }
    const storedPin = typeof window !== 'undefined' ? localStorage.getItem(PIN_KEY) : null
    setMode(storedPin ? 'enter' : 'create')
  }, [requiresPin])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleKey = (digit: number) => {
    const active = mode === 'confirm' ? confirmPin : pin
    const setActive = mode === 'confirm' ? setConfirmPin : setPin
    if (active.length >= 4) return
    const next = active + String(digit)
    setActive(next)
    if (next.length < 4) return

    // --- CREATE MODE: first entry ---
    if (mode === 'create') {
      setTimeout(() => { setPin(next); setMode('confirm'); setConfirmPin('') }, 200)
      return
    }

    // --- CONFIRM MODE: verify match ---
    if (mode === 'confirm') {
      if (next === pin) {
        localStorage.setItem(PIN_KEY, hashPin(pin, salt))
        localStorage.removeItem(ATTEMPTS_KEY)
        setTimeout(() => { confirmSkin('pin-token-local'); setPin(''); setConfirmPin('') }, 300)
      } else {
        triggerShake()
        setError("PINs don't match — try again")
        setTimeout(() => { setConfirmPin(''); setError('') }, 600)
      }
      return
    }

    // --- ENTER MODE: verify stored PIN ---
    if (mode === 'enter') {
      const stored = localStorage.getItem(PIN_KEY)
      if (stored === hashPin(next, salt)) {
        localStorage.removeItem(ATTEMPTS_KEY)
        masqueradeApi.verifyPin(next)
          .then((res: unknown) => {
            const r = res as { ok?: boolean; data?: { pinToken?: string } }
            confirmSkin(r?.data?.pinToken ?? 'pin-token-local')
          })
          .catch(() => confirmSkin('pin-token-local'))
        setPin('')
      } else {
        const attempts = Number(localStorage.getItem(ATTEMPTS_KEY) ?? '0') + 1
        localStorage.setItem(ATTEMPTS_KEY, String(attempts))
        triggerShake()
        setError(attempts >= 5 ? 'Too many attempts — locked for 15 minutes' : `Wrong PIN (${5 - attempts} attempts left)`)
        if (attempts >= 5) setMode('locked')
        setTimeout(() => { setPin(''); setError('') }, 600)
      }
    }
  }

  const handleDelete = () => {
    if (mode === 'confirm') setConfirmPin(p => p.slice(0, -1))
    else setPin(p => p.slice(0, -1))
  }

  const handleCancel = () => {
    setPin(''); setConfirmPin(''); setError('')
    cancelPinGate()
  }

  const handleReset = () => {
    const stored = localStorage.getItem(PIN_KEY)
    const userAfroId = user?.afroId?.raw ?? ''
    // Verify AfroID as secondary factor
    if (!resetInput.trim()) { setError('Enter your AfroID to reset'); return }
    if (stored && userAfroId && resetInput.trim().toUpperCase() !== userAfroId.toUpperCase()) {
      setError('AfroID does not match — cannot reset')
      triggerShake()
      return
    }
    // AfroID matches (or no stored pin): allow reset
    localStorage.removeItem(PIN_KEY)
    localStorage.removeItem(ATTEMPTS_KEY)
    setError('')
    setResetInput('')
    setPin('')
    setMode('create')
  }

  if (!requiresPin) return null

  const activePin = mode === 'confirm' ? confirmPin : pin
  const PURPLE = '#7c3aed'
  const LIGHT = '#a78bfa'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Clan emblem */}
      <div style={{ fontSize: 56, marginBottom: 10, filter: mode === 'locked' ? 'grayscale(1)' : 'none' }}>🏛</div>

      {/* ── LOCKED mode ── */}
      {mode === 'locked' && (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', marginBottom: 8, textAlign: 'center' }}>Clan Space Locked</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 20, textAlign: 'center', lineHeight: 1.6, maxWidth: 260 }}>
            Too many failed attempts. Wait 15 minutes or reset your PIN using your AfroID.
          </p>
          <button onClick={() => setMode('reset')} style={{ background: PURPLE, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
            Reset with AfroID
          </button>
          <button onClick={handleCancel} style={{ background: 'transparent', color: '#666', border: 'none', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
        </>
      )}

      {/* ── RESET mode ── */}
      {mode === 'reset' && (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6, textAlign: 'center' }}>Reset Your Palm Mark</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 18, textAlign: 'center', lineHeight: 1.6, maxWidth: 260 }}>
            Enter your AfroID to verify your identity and reset your PIN.
          </p>
          <div style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 12, padding: 12, marginBottom: 16, width: '100%', maxWidth: 280 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: LIGHT, letterSpacing: '.08em', marginBottom: 6 }}>YOUR AFRO-ID</div>
            <input
              type="text"
              value={resetInput}
              onChange={e => setResetInput(e.target.value)}
              placeholder="e.g. AFR-NGA-COM-001234"
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#f0f5ee', fontSize: 14, fontFamily: 'monospace', outline: 'none', letterSpacing: '.05em', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{error}</p>}
          <button onClick={handleReset} style={{ background: PURPLE, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 10, width: 200 }}>
            Verify & Reset
          </button>
          <button onClick={() => { setMode(hasPin ? 'enter' : 'create'); setError(''); setResetInput('') }} style={{ background: 'transparent', color: '#666', border: 'none', fontSize: 12, cursor: 'pointer' }}>
            ← Back
          </button>
        </>
      )}

      {/* ── CREATE + CONFIRM + ENTER modes ── */}
      {(mode === 'create' || mode === 'confirm' || mode === 'enter') && (
        <>
          {/* Header */}
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
            {mode === 'create'  ? 'Create Your Palm Mark' :
             mode === 'confirm' ? 'Confirm Your Palm Mark' :
                                  'Enter Your Clan Space'}
          </h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 22, textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
            {mode === 'create'  ? 'Choose a 4-digit secret PIN to protect your ancestral clan space.' :
             mode === 'confirm' ? 'Enter the same 4 digits again to confirm.' :
                                  'Your ancestral mask requires a Palm Mark to wear. Enter your secret PIN to enter UKOO.'}
          </p>

          {/* PIN dots */}
          <div style={{
            display: 'flex', gap: 14, marginBottom: 6,
            animation: shake ? 'pinShake 0.4s ease' : 'none',
          }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2.5px solid ${i < activePin.length ? PURPLE : '#333'}`,
                background: i < activePin.length ? PURPLE : 'transparent',
                transition: 'all 0.15s',
                boxShadow: i < activePin.length ? `0 0 8px ${PURPLE}88` : 'none',
              }} />
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 10, textAlign: 'center', minHeight: 16 }}>{error}</p>
          )}
          {!error && <div style={{ marginBottom: 16 }} />}

          {/* Numpad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: 220 }}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => handleKey(n)} style={{
                padding: '16px 0', borderRadius: 14,
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                fontSize: 20, fontWeight: 700, color: '#fff',
                cursor: 'pointer', transition: 'background .1s',
              }}>{n}</button>
            ))}
            {/* ✕ Cancel */}
            <button onClick={handleCancel} style={{
              padding: '12px 0', borderRadius: 14,
              background: 'rgba(239,68,68,.1)',
              border: '1px solid rgba(239,68,68,.2)',
              fontSize: 11, fontWeight: 700, color: '#ef4444',
              cursor: 'pointer',
            }}>✕</button>
            {/* 0 */}
            <button onClick={() => handleKey(0)} style={{
              padding: '16px 0', borderRadius: 14,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.1)',
              fontSize: 20, fontWeight: 700, color: '#fff',
              cursor: 'pointer',
            }}>0</button>
            {/* ⌫ */}
            <button onClick={handleDelete} style={{
              padding: '12px 0', borderRadius: 14,
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
              fontSize: 18, color: '#aaa',
              cursor: 'pointer',
            }}>⌫</button>
          </div>

          {/* Forgot PIN link (enter mode only) */}
          {mode === 'enter' && (
            <button
              onClick={() => { setMode('reset'); setPin(''); setError('') }}
              style={{ marginTop: 18, background: 'transparent', border: 'none', color: LIGHT, fontSize: 11, cursor: 'pointer', opacity: .7 }}
            >
              Forgot PIN? Reset with AfroID →
            </button>
          )}

          {/* Step indicator for create flow */}
          {(mode === 'create' || mode === 'confirm') && (
            <div style={{ marginTop: 18, display: 'flex', gap: 6 }}>
              <div style={{ width: 24, height: 4, borderRadius: 99, background: PURPLE }} />
              <div style={{ width: 24, height: 4, borderRadius: 99, background: mode === 'confirm' ? PURPLE : 'rgba(255,255,255,.15)' }} />
            </div>
          )}
        </>
      )}

      {/* Shake keyframes injected once */}
      <style>{`@keyframes pinShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  )
}
