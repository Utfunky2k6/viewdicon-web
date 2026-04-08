'use client'
// ============================================================
// /dashboard/upgrade — Platform Membership Tiers
// "Unlock Your Full African Digital Power"
// ============================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  PLATFORM_TIERS,
  COWRIE_DROPS,
  ANNUAL_DISCOUNT_MONTHS,
  type PlatformTier,
} from '@/constants/monetization'
import { useAuthStore } from '@/stores/authStore'
import { logApiFailure } from '@/lib/flags'

// ── Kente SVG divider pattern ──────────────────────────────
function KenteDivider() {
  return (
    <div style={{ width: '100%', height: 12, overflow: 'hidden', opacity: 0.18, margin: '4px 0' }}>
      <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
        <pattern id="kente" width="20" height="12" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="10" height="6" fill="#d4a017" />
          <rect x="10" y="6" width="10" height="6" fill="#d4a017" />
          <rect x="0" y="6" width="10" height="6" fill="#1a7c3e" />
          <rect x="10" y="0" width="10" height="6" fill="#1a7c3e" />
        </pattern>
        <rect width="100%" height="12" fill="url(#kente)" />
      </svg>
    </div>
  )
}

// ── Floating cowrie shells background decoration ───────────
function CowrieRain({ active }: { active: boolean }) {
  const shells = ['🐚', '🌟', '✨', '🐚', '💛', '🐚']
  if (!active) return null
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {shells.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          top: '-40px',
          left: `${10 + i * 15}%`,
          fontSize: 28,
          animation: `cowriefall ${1.2 + i * 0.3}s ease-in forwards`,
          animationDelay: `${i * 0.12}s`,
        }}>{s}</span>
      ))}
      <style>{`
        @keyframes cowriefall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── Single tier card ───────────────────────────────────────
interface TierCardProps {
  tierKey: PlatformTier
  isCurrent: boolean
  onUpgrade: (tier: PlatformTier) => void
  upgrading: boolean
}
function TierCard({ tierKey, isCurrent, onUpgrade, upgrading }: TierCardProps) {
  const tier = PLATFORM_TIERS[tierKey]
  const isOba = tierKey === 'OBA'
  const isOde = tierKey === 'ODE'

  return (
    <div style={{
      minWidth: 240, maxWidth: 260, flexShrink: 0,
      borderRadius: 24,
      background: isOba
        ? 'linear-gradient(145deg, #1a1025 0%, #0d0b1a 100%)'
        : '#111a0d',
      border: `1.5px solid ${isOba ? tier.color + '80' : tier.color + '30'}`,
      boxShadow: isOba
        ? `0 0 40px ${tier.color}25, 0 8px 32px rgba(0,0,0,.5)`
        : '0 4px 20px rgba(0,0,0,.4)',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform .2s, box-shadow .2s',
    }}>
      {/* Gold shimmer for Oba */}
      {isOba && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none',
          background: 'linear-gradient(135deg, rgba(139,92,246,.06) 0%, rgba(212,160,23,.08) 50%, rgba(139,92,246,.06) 100%)',
        }} />
      )}

      {/* Popular badge */}
      {isOde && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: '#000', fontSize: 8, fontWeight: 900,
          padding: '3px 8px', borderRadius: 20, letterSpacing: '.08em',
          textTransform: 'uppercase',
        }}>
          Most Popular
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(74,222,128,.12)', border: '1px solid rgba(74,222,128,.3)',
          color: '#4ade80', fontSize: 8, fontWeight: 700,
          padding: '3px 8px', borderRadius: 20, letterSpacing: '.06em',
        }}>
          Current Plan
        </div>
      )}

      {/* Icon + Name */}
      <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 20 }}>
        <div style={{
          fontSize: 40, marginBottom: 10,
          filter: isOba ? 'drop-shadow(0 0 12px rgba(139,92,246,.5))' : 'none',
        }}>
          {tier.icon}
        </div>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900,
          color: tier.color,
          textShadow: isOba ? `0 0 20px ${tier.color}60` : 'none',
        }}>
          {tier.name}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 2, fontStyle: 'italic' }}>
          {tier.nameEn}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 6, lineHeight: 1.4 }}>
          {tier.description}
        </div>
      </div>

      {/* Price */}
      <div style={{
        textAlign: 'center', marginBottom: 20,
        padding: '12px', borderRadius: 14,
        background: `${tier.color}10`,
        border: `1px solid ${tier.color}20`,
      }}>
        {tier.cowrie === 0 ? (
          <div style={{ fontSize: 26, fontWeight: 900, color: '#4ade80' }}>Free</div>
        ) : (
          <>
            <div style={{ fontSize: 26, fontWeight: 900, color: tier.color }}>
              {tier.cowrie.toLocaleString()} <span style={{ fontSize: 14 }}>COW</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
              /month · ${tier.usd} USD equivalent
            </div>
          </>
        )}
      </div>

      {/* Feature list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tier.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: 'rgba(255,255,255,.7)', lineHeight: 1.4 }}>
            <span style={{ color: tier.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA button */}
      {isCurrent ? (
        <div style={{
          width: '100%', padding: '12px', borderRadius: 14, textAlign: 'center',
          background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.2)',
          color: '#4ade80', fontSize: 12, fontWeight: 700,
        }}>
          Active Plan ✓
        </div>
      ) : tier.cowrie === 0 ? (
        <div style={{
          width: '100%', padding: '12px', borderRadius: 14, textAlign: 'center',
          background: 'rgba(107,114,128,.06)', border: '1px solid rgba(107,114,128,.2)',
          color: 'rgba(255,255,255,.3)', fontSize: 12, fontWeight: 700,
        }}>
          Downgrade
        </div>
      ) : (
        <button
          onClick={() => onUpgrade(tierKey)}
          disabled={upgrading}
          style={{
            width: '100%', padding: '13px', borderRadius: 14, border: 'none',
            cursor: upgrading ? 'wait' : 'pointer', fontSize: 13, fontWeight: 800,
            background: isOba
              ? `linear-gradient(90deg, ${tier.color}, #d4a017)`
              : `linear-gradient(90deg, ${tier.color}cc, ${tier.color})`,
            color: isOba ? '#fff' : '#000',
            boxShadow: `0 4px 16px ${tier.color}40`,
            transition: 'opacity .2s, transform .1s',
            opacity: upgrading ? 0.7 : 1,
            letterSpacing: '.04em',
          }}
        >
          {upgrading ? 'Processing…' : `Upgrade to ${tier.name}`}
        </button>
      )}
    </div>
  )
}

// ── FAQ Item ───────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{
      borderRadius: 14, border: '1px solid rgba(255,255,255,.07)',
      background: '#111a0d', overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', padding: '14px 16px', background: 'none', border: 'none',
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f5ee', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: '#4ade80', fontSize: 16, flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>
          {a}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════
export default function UpgradePage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const accessToken = useAuthStore(s => s.accessToken)

  // Determine current tier from user data (default to OMIDAN)
  const [currentTier, setCurrentTier] = React.useState<PlatformTier>('OMIDAN')
  const [cowrieBalance, setCowrieBalance] = React.useState<number>(0)
  const [upgrading, setUpgrading] = React.useState<PlatformTier | null>(null)
  const [successTier, setSuccessTier] = React.useState<PlatformTier | null>(null)
  const [showRain, setShowRain] = React.useState(false)
  const [annual, setAnnual] = React.useState(false)

  // Fetch Cowrie balance
  React.useEffect(() => {
    const afroIdRaw = (user?.afroId as unknown as { raw?: string })?.raw
      || (user?.afroId as unknown as string) || ''
    if (!afroIdRaw || !accessToken) return
    fetch('/api/cowrie/balance', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.balance !== undefined) setCowrieBalance(Number(d.balance) || 0)
        if (d?.tier) setCurrentTier(d.tier as PlatformTier)
      })
      .catch((e) => logApiFailure('upgrade/balance', e))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.afroId])

  const handleUpgrade = async (tier: PlatformTier) => {
    setUpgrading(tier)
    try {
      const res = await fetch('/api/v1/me/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken || ''}`,
        },
        body: JSON.stringify({ tier }),
      })
      if (res.ok) {
        setCurrentTier(tier)
        setSuccessTier(tier)
        setShowRain(true)
        setTimeout(() => setShowRain(false), 3000)
      }
    } catch (e) { logApiFailure('upgrade/subscription', e) }
    finally { setUpgrading(null) }
  }

  const tierOrder: PlatformTier[] = ['OMIDAN', 'ALAWE', 'ODE', 'OBA']

  // Cowrie progress to next tier
  const nextTierKey = tierOrder[tierOrder.indexOf(currentTier) + 1] as PlatformTier | undefined
  const nextTierCost = nextTierKey ? PLATFORM_TIERS[nextTierKey].cowrie : 0
  const progressPct = nextTierCost > 0 ? Math.min(100, Math.round((cowrieBalance / nextTierCost) * 100)) : 100

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b06', color: '#f0f5ee', paddingBottom: 100 }}>
      <CowrieRain active={showRain} />

      {/* ── Hero ── */}
      <div style={{ padding: '40px 20px 32px', textAlign: 'center', position: 'relative' }}>
        {/* Ambient glow behind title */}
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 150, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(212,160,23,.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 32, marginBottom: 8 }}>🌍</div>
        <h1 style={{
          fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 900,
          background: 'linear-gradient(90deg, #d4a017, #f0c040, #d4a017)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', margin: 0, lineHeight: 1.2, marginBottom: 10,
        }}>
          Unlock Your Full<br />African Digital Power
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: 0, lineHeight: 1.5, maxWidth: 300, marginInline: 'auto' }}>
          Pay with Cowries — the currency of Ubuntu. Earn them by living, sharing and building.
        </p>
      </div>

      {/* ── Cowrie Balance + Progress ── */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          borderRadius: 18, padding: '16px 20px',
          background: 'rgba(212,160,23,.07)', border: '1px solid rgba(212,160,23,.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600, letterSpacing: '.04em' }}>
              YOUR COWRIE BALANCE
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#d4a017' }}>
              🐚 {cowrieBalance.toLocaleString()} COW
            </span>
          </div>
          {nextTierKey && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 6 }}>
                <span>Progress to {PLATFORM_TIERS[nextTierKey].name}</span>
                <span>{progressPct}% · {(nextTierCost - cowrieBalance).toLocaleString()} COW to go</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.08)' }}>
                <div style={{
                  height: '100%', borderRadius: 99, width: `${progressPct}%`,
                  background: `linear-gradient(90deg, #d4a017, ${PLATFORM_TIERS[nextTierKey].color})`,
                  transition: 'width .5s ease',
                }} />
              </div>
            </>
          )}
        </div>
      </div>

      <KenteDivider />

      {/* ── Annual toggle ── */}
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: annual ? 'rgba(255,255,255,.35)' : '#f0f5ee', fontWeight: 600 }}>Monthly</span>
        <button onClick={() => setAnnual(v => !v)} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: annual ? '#22c55e' : 'rgba(255,255,255,.12)',
          position: 'relative', transition: 'background .2s',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3, transition: 'left .2s',
            left: annual ? 22 : 3,
          }} />
        </button>
        <span style={{ fontSize: 12, color: annual ? '#4ade80' : 'rgba(255,255,255,.35)', fontWeight: 600 }}>
          Annual{annual && <span style={{ marginLeft: 6, color: '#4ade80', fontSize: 10, fontWeight: 900 }}>
            🎉 {ANNUAL_DISCOUNT_MONTHS} months FREE
          </span>}
        </span>
      </div>
      {annual && (
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(74,222,128,.6)', margin: '4px 20px 0' }}>
          Pay 10 months, enjoy 12 — {ANNUAL_DISCOUNT_MONTHS} months free with annual billing
        </p>
      )}

      {/* ── Tier Cards (horizontal scroll) ── */}
      <div style={{ overflowX: 'auto', padding: '20px 16px 8px', display: 'flex', gap: 14, scrollbarWidth: 'none' }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {tierOrder.map(key => (
          <TierCard
            key={key}
            tierKey={key}
            isCurrent={currentTier === key}
            onUpgrade={handleUpgrade}
            upgrading={upgrading === key}
          />
        ))}
        {/* trailing spacer */}
        <div style={{ minWidth: 4, flexShrink: 0 }} />
      </div>

      {/* ── Success state ── */}
      {successTier && (
        <div style={{
          margin: '20px 20px 0', borderRadius: 18,
          background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)',
          padding: '16px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🎊</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', marginBottom: 4 }}>
            Welcome to {PLATFORM_TIERS[successTier].name}!
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
            Your {PLATFORM_TIERS[successTier].nameEn} tier is now active. New features are unlocked.
          </div>
        </div>
      )}

      <KenteDivider />

      {/* ── Cowrie Drops ── */}
      <div style={{ padding: '24px 20px 8px' }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#f0f5ee', marginBottom: 4 }}>
          Earn Cowries Free
        </h2>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
          Complete these actions to earn the Cowries needed to upgrade
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {COWRIE_DROPS.map(drop => (
            <div key={drop.id} style={{
              borderRadius: 14, padding: '12px 14px',
              background: '#111a0d', border: '1px solid rgba(255,255,255,.06)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{drop.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#d4a017' }}>+{drop.amount} COW</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', lineHeight: 1.4, marginTop: 2 }}>{drop.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <KenteDivider />

      {/* ── FAQ ── */}
      <div style={{ padding: '24px 20px' }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#f0f5ee', marginBottom: 16 }}>
          Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FaqItem
            q="What are Cowries?"
            a="Cowries (COW) are the internal currency of the Afrikonnect platform — inspired by the cowrie shells used as currency across Africa for millennia. They are earned by being active on the platform and can be used to upgrade your tier, tip creators, participate in circles, and more. 1 COW ≈ $0.01 USD."
          />
          <FaqItem
            q="How do I earn Cowries?"
            a="You earn Cowries by being active: +10 for logging in daily, +50 for your first post, +200 for your first live stream, +100 for joining a village, +150 for completing your profile, +300 for completing the naming ceremony, and +500 per friend you refer who signs up. You can also earn by selling in the marketplace, completing trade sessions, and receiving tips."
          />
          <FaqItem
            q="Can I downgrade my plan?"
            a="Yes — you can downgrade at any time. Your current tier remains active until the end of the billing period. Any Cowries spent on the subscription are non-refundable, but any Cowries in your wallet remain yours forever. You can re-upgrade at any time."
          />
        </div>
      </div>

      {/* ── Back button ── */}
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 14, color: 'rgba(255,255,255,.4)', fontSize: 12,
          padding: '10px 28px', cursor: 'pointer',
        }}>
          ← Back
        </button>
      </div>
    </div>
  )
}
