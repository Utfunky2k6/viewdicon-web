'use client'
// ============================================================
// UpgradeModal — Bottom-sheet shown when a user tries to
// access a gated feature. Compact, informative, actionable.
// ============================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { PLATFORM_TIERS, COWRIE_DROPS, type PlatformTier } from '@/constants/monetization'

export interface UpgradeModalProps {
  /** Human-readable feature name e.g. "Go Live streaming" */
  feature: string
  /** The tier key that unlocks this feature e.g. "ODE" */
  requiredTierKey: PlatformTier
  onClose: () => void
  /** Optional override — default navigates to /dashboard/upgrade */
  onUpgrade?: () => void
}

// Picks the top 3 most rewarding drops to show as quick earn tips
const TOP_DROPS = COWRIE_DROPS
  .slice()
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 3)

export function UpgradeModal({
  feature,
  requiredTierKey,
  onClose,
  onUpgrade,
}: UpgradeModalProps) {
  const router = useRouter()
  const tier = PLATFORM_TIERS[requiredTierKey]
  const [showEarn, setShowEarn] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Trigger slide-up animation after mount
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      router.push('/dashboard/upgrade')
    }
    onClose()
  }

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 800,
          background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* ── Sheet ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 801,
        background: '#111a0d',
        borderRadius: '28px 28px 0 0',
        padding: '20px 20px max(32px, env(safe-area-inset-bottom))',
        maxWidth: 480, marginInline: 'auto',
        transform: mounted ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .3s cubic-bezier(.2, .9, .4, 1)',
        boxShadow: '0 -8px 48px rgba(0,0,0,.6)',
      }}>
        {/* Handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 99,
          background: 'rgba(255,255,255,.15)', margin: '0 auto 20px',
        }} />

        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,.06)', border: 'none',
          borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
          color: 'rgba(255,255,255,.4)', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          ×
        </button>

        {/* Lock icon with golden glow animation */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: '50%',
            background: `radial-gradient(circle, ${tier.color}18 0%, transparent 70%)`,
            border: `2px solid ${tier.color}30`,
            fontSize: 28,
            animation: 'lockGlow 2s ease-in-out infinite',
          }}>
            🔒
          </div>
          <style>{`
            @keyframes lockGlow {
              0%, 100% { box-shadow: 0 0 0 0 ${tier.color}00; }
              50%       { box-shadow: 0 0 20px 4px ${tier.color}40; }
            }
          `}</style>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            This feature requires
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{tier.icon}</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: tier.color, fontFamily: 'Sora, sans-serif' }}>
              {tier.name}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>({tier.nameEn})</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>or higher</span>
          </div>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px', borderRadius: 20,
            background: `${tier.color}15`, border: `1px solid ${tier.color}30`,
            fontSize: 13, fontWeight: 800, color: tier.color,
          }}>
            {feature}
          </div>
        </div>

        {/* Cost pill */}
        <div style={{
          borderRadius: 14, padding: '12px 16px', marginBottom: 16,
          background: 'rgba(212,160,23,.07)', border: '1px solid rgba(212,160,23,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.04em' }}>REQUIRED TIER</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#d4a017', marginTop: 2 }}>
              🐚 {tier.cowrie.toLocaleString()} COW/month
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>USD</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>~${tier.usd}/mo</div>
          </div>
        </div>

        {/* Quick earn tips panel */}
        {showEarn && (
          <div style={{
            borderRadius: 16, padding: '14px 16px', marginBottom: 16,
            background: '#0d1409', border: '1px solid rgba(74,222,128,.12)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, letterSpacing: '.04em' }}>
              EARN COWRIES FREE
            </div>
            {TOP_DROPS.map(d => (
              <div key={d.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBlock: 6, borderBottom: '1px solid rgba(255,255,255,.04)',
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
                  {d.icon} {d.description}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#d4a017', flexShrink: 0, marginLeft: 8 }}>
                  +{d.amount}
                </span>
              </div>
            ))}
            <button
              onClick={handleUpgrade}
              style={{
                marginTop: 12, width: '100%', padding: '10px', borderRadius: 12,
                background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)',
                color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              View all earn options →
            </button>
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleUpgrade}
            style={{
              width: '100%', padding: '14px', borderRadius: 16, border: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 800,
              background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)`,
              color: tier.color === '#8b5cf6' ? '#fff' : '#000',
              boxShadow: `0 6px 20px ${tier.color}35`,
              letterSpacing: '.02em',
            }}
          >
            💎 Upgrade to {tier.name} ({tier.nameEn})
          </button>

          <button
            onClick={() => setShowEarn(v => !v)}
            style={{
              width: '100%', padding: '12px', borderRadius: 16,
              background: 'rgba(212,160,23,.07)', border: '1px solid rgba(212,160,23,.2)',
              color: '#d4a017', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            🐚 Earn Cowries Instead
          </button>
        </div>
      </div>
    </>
  )
}

// ── Hook for convenient usage ──────────────────────────────
export function useUpgradeModal() {
  const [modal, setModal] = React.useState<{ feature: string; tier: PlatformTier } | null>(null)

  const requireTier = React.useCallback((feature: string, tier: PlatformTier) => {
    setModal({ feature, tier })
  }, [])

  const close = React.useCallback(() => setModal(null), [])

  const element = modal ? (
    <UpgradeModal
      feature={modal.feature}
      requiredTierKey={modal.tier}
      onClose={close}
    />
  ) : null

  return { requireTier, close, element }
}
