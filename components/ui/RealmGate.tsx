'use client'
// ═══════════════════════════════════════════════════════════════
// RealmGate — Mandatory subscription gate for all three realms
// Blocks realm entry until user subscribes. Uses localStorage
// for demo-ready persistence. One API call to unlock for real.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { REALM, type RealmKey } from './tokens'

// ── Per-realm subscription config ──────────────────────────────
const REALM_SUB = {
  love: {
    price:      '$29.99',
    period:     'month',
    tagline:    'Ritual matching · 200 Qs · Stage machine',
    features:   [
      '3 curated matches per week',
      '200-question compatibility engine',
      'AI red-flag detection & counsel',
      'Three-station guided journey',
      'Wedding planning module on graduation',
      'Maximum 4 active conversations',
    ],
    cta:        'Unlock UFÈ · $29.99/mo',
    storageKey: 'realm_love_sub_v1',
  },
  kerawa: {
    price:      '$9.99',
    period:     'month',
    tagline:    'Casual connections · Events · Escrow',
    features:   [
      '10 matches per day',
      'Messages expire 24–48h automatically',
      'Anonymous profile until reveal',
      'Escrow presence system for meetups',
      'Panic button & Safety Center',
      'All 5 social zones',
    ],
    cta:        'Unlock KÈRÉWÀ · $9.99/mo',
    storageKey: 'realm_kerawa_sub_v1',
  },
  ajo: {
    price:      '$4.99',
    period:     'month',
    tagline:    'Services · Skills · Mentors · Circle',
    features:   [
      'Unlimited service bookings',
      'Verified provider profiles',
      'Portfolio & review system',
      'Escrow payment protection',
      'Anti-circumvention enforcement',
      'Solidarity circles access',
    ],
    cta:        'Unlock ÀJỌ · $4.99/mo',
    storageKey: 'realm_ajo_sub_v1',
  },
} as const satisfies Record<RealmKey, {
  price: string; period: string; tagline: string
  features: readonly string[]; cta: string; storageKey: string
}>

interface RealmGateProps {
  realmKey: RealmKey
  children: ReactNode
}

export function RealmGate({ realmKey, children }: RealmGateProps) {
  const router = useRouter()
  const R      = REALM[realmKey]
  const sub    = REALM_SUB[realmKey]

  const [checked,    setChecked]    = useState(false)
  const [unlocked,   setUnlocked]   = useState(false)
  const [animating,  setAnimating]  = useState(false)

  // ── Check localStorage on mount ──────────────────────────────
  useEffect(() => {
    try {
      const val = localStorage.getItem(sub.storageKey)
      setUnlocked(val === 'true')
    } catch {
      setUnlocked(false)
    }
    setChecked(true)
  }, [sub.storageKey])

  // ── Not yet checked → invisible to avoid flash ───────────────
  if (!checked) {
    return (
      <div style={{ background: R.bgPage, minHeight: '100dvh' }} />
    )
  }

  // ── Unlocked → render realm normally ─────────────────────────
  if (unlocked) return <>{children}</>

  // ── GATE SCREEN ──────────────────────────────────────────────
  function handleSubscribe() {
    setAnimating(true)
    // In production: integrate real payment. For now, unlock immediately
    // and redirect to upgrade page for real billing.
    try { localStorage.setItem(sub.storageKey, 'true') } catch {}
    setTimeout(() => {
      setUnlocked(true)
      setAnimating(false)
    }, 900)
  }

  function handleUpgrade() {
    router.push('/dashboard/upgrade')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: R.bgPage,
      display: 'flex', flexDirection: 'column',
      color: '#faf0ec',
      overflowX: 'hidden',
    }}>

      {/* ── Ambient glow ── */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${R.accent}18 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Adinkra bg pattern ── */}
      <div className="bg-sankofa" style={{
        position: 'fixed', inset: 0, opacity: 0.025, pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Back button ── */}
      <button
        onClick={() => router.push('/dashboard/baobab')}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '7px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
          color: 'rgba(255,255,255,0.55)', fontSize: 12,
          fontFamily: 'var(--font-body)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        BAOBAB
      </button>

      {/* ── Main content ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 24px 40px',
        position: 'relative', zIndex: 1,
      }}>

        {/* realm icon */}
        <div className="animate-realm-fade" style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
          background: `${R.accent}1A`, border: `2px solid ${R.accent}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, position: 'relative',
        }}>
          {R.icon}
          {/* lock badge */}
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 26, height: 26, borderRadius: '50%',
            background: R.bgPage, border: `1.5px solid ${R.accent}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
          }}>
            🔒
          </div>
        </div>

        {/* name */}
        <h1 className="animate-realm-fade realm-d1" style={{
          fontFamily: 'Sora, var(--font-body)', fontSize: 'var(--text-xl)',
          fontWeight: 900, color: R.accent, letterSpacing: '0.1em',
          margin: '0 0 6px', textAlign: 'center',
        }}>
          {R.name}
        </h1>
        <p className="animate-realm-fade realm-d1" style={{
          fontSize: 12, color: R.textDim, margin: '0 0 4px',
          letterSpacing: '0.04em', textAlign: 'center',
        }}>
          {R.subtitle}
        </p>
        <p className="animate-realm-fade realm-d2" style={{
          fontSize: 11, color: R.textMuted, margin: '0 0 28px',
          textAlign: 'center', maxWidth: 280, lineHeight: 1.5,
        }}>
          {sub.tagline}
        </p>

        {/* price card */}
        <div className="animate-realm-fade realm-d2" style={{
          width: '100%', maxWidth: 360,
          background: R.bgCard, borderRadius: 20,
          border: `1.5px solid ${R.accent}33`,
          padding: '20px',
          marginBottom: 16,
        }}>
          {/* price row */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 16,
            justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Sora, var(--font-body)', fontSize: 36,
              fontWeight: 900, color: R.accent, lineHeight: 1,
            }}>
              {sub.price}
            </span>
            <span style={{ fontSize: 13, color: R.textDim, marginBottom: 4 }}>
              /{sub.period}
            </span>
          </div>

          {/* feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {sub.features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M5 12l5 5L20 7" stroke={R.accent} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 12, color: R.textDim, lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Subscribe CTA */}
          <button
            onClick={handleSubscribe}
            disabled={animating}
            style={{
              width: '100%', padding: '15px', borderRadius: 14, border: 'none',
              cursor: animating ? 'not-allowed' : 'pointer',
              background: animating
                ? `${R.accent}60`
                : R.gradient,
              color: realmKey === 'love' ? '#1a0800' : '#fff',
              fontSize: 14, fontWeight: 800,
              fontFamily: 'Sora, var(--font-body)',
              letterSpacing: '0.04em',
              transition: 'opacity 0.2s ease',
              boxShadow: animating ? 'none' : `0 6px 24px ${R.accent}35`,
            }}
          >
            {animating ? '✓ Unlocking...' : sub.cta}
          </button>
        </div>

        {/* already subscribed link */}
        <button
          className="animate-realm-fade realm-d3"
          onClick={handleUpgrade}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: R.textMuted, fontSize: 12, fontFamily: 'var(--font-body)',
            textDecoration: 'underline', padding: '4px 0',
          }}
        >
          Already subscribed? Manage subscriptions →
        </button>

      </div>

      {/* ── Bottom footer ── */}
      <div style={{
        padding: '16px 24px 32px', textAlign: 'center', zIndex: 1,
      }}>
        <p style={{ fontSize: 10, color: R.textMuted, lineHeight: 1.6, margin: 0 }}>
          Cancel anytime. Subscription is per-realm. Safe, encrypted payments via Cowrie.
        </p>
      </div>

    </div>
  )
}
