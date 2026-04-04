'use client'
// ════════════════════════════════════════════════════════════════════
// PlantRootSheet — Bottom sheet for planting / lifting roots
// Phase 4 · Plant Your Root subscription system
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { VOCAB } from '@/constants/vocabulary'

export interface PlantRootSheetProps {
  targetAfroId: string
  targetName: string
  targetVillage: string
  viewerAfroId: string
  currentRoot?: 'FREE_ROOT' | 'PAID_ROOT' | 'ANCESTRAL_ROOT' | null
  onClose: () => void
  onSuccess?: (tier: string) => void
}

interface TierConfig {
  id: 'FREE_ROOT' | 'PAID_ROOT' | 'ANCESTRAL_ROOT'
  label: string
  emoji: string
  price: string
  cowriePerMonth: number
  color: string
  accent: string
  perks: string[]
}

const TIERS: TierConfig[] = [
  {
    id: 'FREE_ROOT',
    label: VOCAB.freeRoot,
    emoji: '🌱',
    price: 'Free',
    cowriePerMonth: 0,
    color: '#4ade80',
    accent: 'rgba(74,222,128,.12)',
    perks: [
      'Village feed updates from this creator',
      'Appears in their roots count',
      'Access to free public content',
    ],
  },
  {
    id: 'PAID_ROOT',
    label: VOCAB.paidRoot,
    emoji: '🌳',
    price: '₡500/mo',
    cowriePerMonth: 500,
    color: '#d4a017',
    accent: 'rgba(212,160,23,.12)',
    perks: [
      'Everything in Free Root',
      'Full access to creator content library',
      'Paid Root badge on your profile',
      'Early access to new content drops',
    ],
  },
  {
    id: 'ANCESTRAL_ROOT',
    label: VOCAB.ancestralRoot,
    emoji: '🏛',
    price: '₡2,000/mo',
    cowriePerMonth: 2000,
    color: '#a78bfa',
    accent: 'rgba(167,139,250,.12)',
    perks: [
      'Everything in Paid Root',
      'Direct voice access to creator',
      'Priority session booking',
      'Ancestral Root badge (gold-outlined)',
      'Monthly private voice circle',
      '1% revenue share on referred viewers',
    ],
  },
]

type Phase = 'select' | 'confirm' | 'success' | 'lifting'

export function PlantRootSheet({
  targetAfroId,
  targetName,
  targetVillage,
  viewerAfroId,
  currentRoot = null,
  onClose,
  onSuccess,
}: PlantRootSheetProps) {
  const [selected, setSelected] = React.useState<TierConfig['id'] | null>(null)
  const [phase, setPhase] = React.useState<Phase>('select')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const selectedTier = TIERS.find(t => t.id === selected)
  const isLifting = phase === 'lifting'

  const initials = targetName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()

  const handleSelectAndContinue = () => {
    if (!selected) return
    setPhase('confirm')
  }

  const handleLiftRoot = () => {
    setPhase('lifting')
  }

  const handleConfirmLift = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetch(`/api/subscriptions/roots/${targetAfroId}`, {
        method: 'DELETE',
        headers: { 'x-afro-id': viewerAfroId },
      })
      setPhase('success')
      setTimeout(() => { onSuccess?.('NONE'); onClose() }, 1800)
    } catch {
      setError('Could not lift root. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPlant = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscriptions/roots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAfroId, viewerAfroId, tier: selected }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      setPhase('success')
      setTimeout(() => { onSuccess?.(selected); onClose() }, 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, background: '#0d1117',
          borderRadius: '28px 28px 0 0', maxHeight: '92dvh',
          overflowY: 'auto', paddingBottom: 44,
          border: '1px solid rgba(255,255,255,.08)', borderBottom: 'none',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,.15)', margin: '14px auto 0',
        }} />

        {/* Creator card */}
        <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #d4a017, #92660a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#fff',
            border: '2px solid rgba(212,160,23,.4)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f0f5ee', fontFamily: "'Sora', sans-serif" }}>
              {targetName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
              🏘 {targetVillage}
            </div>
          </div>
          {currentRoot && (
            <div style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 9, fontWeight: 800,
              background: 'rgba(212,160,23,.15)', color: '#d4a017',
              border: '1px solid rgba(212,160,23,.3)', letterSpacing: '.06em',
            }}>
              {currentRoot === 'FREE_ROOT' ? VOCAB.freeRoot
                : currentRoot === 'PAID_ROOT' ? VOCAB.paidRoot
                : VOCAB.ancestralRoot}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f0f5ee', fontFamily: "'Sora', sans-serif" }}>
            {phase === 'lifting' ? VOCAB.liftRoot : VOCAB.plantRoot}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>
            {phase === 'lifting'
              ? `Cancel your current subscription to ${targetName}`
              : `Choose your support tier for ${targetName}`}
          </div>
        </div>

        {/* ── Success state ── */}
        {phase === 'success' && (
          <div style={{ padding: '32px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {isLifting ? '🍂' : '🌳'}
            </div>
            <div style={{
              fontSize: 18, fontWeight: 900,
              color: isLifting ? '#f87171' : '#4ade80',
              fontFamily: "'Sora', sans-serif",
            }}>
              {isLifting ? VOCAB.rootLifted : VOCAB.rootPlanted}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 8 }}>
              {isLifting
                ? `Your root with ${targetName} has been lifted.`
                : `Your root is growing in ${targetName}'s village.`}
            </div>
          </div>
        )}

        {/* ── Lift confirm ── */}
        {phase === 'lifting' && (
          <div style={{ padding: '24px 18px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              padding: 16, borderRadius: 16,
              background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.25)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 6 }}>
                🍂 Lift Your Root?
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
                You will lose access to paid creator content immediately. No refund for the current month.
              </div>
            </div>
            {error && (
              <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center' }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPhase('select')}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,.1)',
                  background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.5)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {VOCAB.cancel}
              </button>
              <button
                onClick={handleConfirmLift}
                disabled={loading}
                style={{
                  flex: 2, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: loading ? 'rgba(248,113,113,.3)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#fff', fontSize: 13, fontWeight: 800,
                }}
              >
                {loading ? '…' : VOCAB.liftRoot}
              </button>
            </div>
          </div>
        )}

        {/* ── Tier selection ── */}
        {phase === 'select' && (
          <div style={{ padding: '16px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TIERS.map(tier => {
              const isSelected = selected === tier.id
              const isCurrent = currentRoot === tier.id
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelected(tier.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: 14, borderRadius: 18, cursor: 'pointer',
                    background: isSelected ? tier.accent : 'rgba(255,255,255,.03)',
                    border: `1.5px solid ${isSelected ? tier.color : 'rgba(255,255,255,.07)'}`,
                    transition: 'all .18s',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: isSelected ? `0 0 0 1px ${tier.color}40` : 'none',
                  }}
                >
                  {/* Tier header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: `${tier.color}1a`,
                      border: `1.5px solid ${tier.color}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>
                      {tier.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#f0f5ee' }}>{tier.label}</span>
                        {isCurrent && (
                          <span style={{
                            fontSize: 8, padding: '2px 6px', borderRadius: 99,
                            background: tier.color, color: '#0d1117', fontWeight: 900,
                          }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: tier.color }}>{tier.price}</div>
                      {tier.cowriePerMonth > 0 && (
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Cowrie / month</div>
                      )}
                    </div>
                  </div>

                  {/* Perks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {tier.perks.map(perk => (
                      <div key={perk} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ fontSize: 10, color: tier.color, flexShrink: 0, marginTop: 2 }}>✓</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Platform fee note */}
                  {tier.cowriePerMonth > 0 && (
                    <div style={{
                      marginTop: 10, padding: '5px 10px', borderRadius: 8,
                      background: 'rgba(255,255,255,.04)', fontSize: 9,
                      color: 'rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      🛡 Platform takes 10% · Creator receives ₡{Math.floor(tier.cowriePerMonth * 0.9)}/mo
                    </div>
                  )}
                </button>
              )
            })}

            {/* CTA */}
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={handleSelectAndContinue}
                disabled={!selected}
                style={{
                  width: '100%', padding: '15px 0', borderRadius: 16, border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
                  background: selected
                    ? `linear-gradient(135deg, ${selectedTier?.color ?? '#d4a017'}, ${selectedTier?.color ?? '#d4a017'}bb)`
                    : 'rgba(255,255,255,.07)',
                  color: selected ? '#fff' : 'rgba(255,255,255,.25)',
                  fontSize: 14, fontWeight: 900, fontFamily: "'Sora', sans-serif",
                  transition: 'all .2s',
                }}
              >
                {selected
                  ? `${selectedTier?.emoji ?? '🌳'} ${VOCAB.plantRoot} · ${selectedTier?.price ?? ''}`
                  : 'Select a tier'}
              </button>

              {currentRoot && currentRoot !== 'FREE_ROOT' && (
                <button
                  onClick={handleLiftRoot}
                  style={{
                    width: '100%', padding: '11px 0', borderRadius: 14,
                    border: '1px solid rgba(248,113,113,.2)',
                    background: 'rgba(248,113,113,.06)', color: '#f87171',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {VOCAB.liftRoot}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Confirm phase ── */}
        {phase === 'confirm' && selectedTier && (
          <div style={{ padding: '24px 18px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              padding: 16, borderRadius: 16,
              background: `${selectedTier.color}10`,
              border: `1px solid ${selectedTier.color}40`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{selectedTier.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f5ee' }}>{selectedTier.label}</div>
              {selectedTier.cowriePerMonth > 0 ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 6, lineHeight: 1.6 }}>
                  <strong style={{ color: selectedTier.color }}>₡{selectedTier.cowriePerMonth.toLocaleString()}</strong> will be debited from your Cowrie balance monthly.
                  <br />You can lift your root at any time.
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>
                  Free — no Cowrie required. Lift your root anytime.
                </div>
              )}
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 12, fontSize: 12,
                color: '#f87171', background: 'rgba(248,113,113,.08)',
                border: '1px solid rgba(248,113,113,.2)', textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setPhase('select'); setError(null) }}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,.1)',
                  background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.5)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleConfirmPlant}
                disabled={loading}
                style={{
                  flex: 2, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: loading
                    ? `${selectedTier.color}55`
                    : `linear-gradient(135deg, ${selectedTier.color}, ${selectedTier.color}bb)`,
                  color: '#fff', fontSize: 14, fontWeight: 900,
                }}
              >
                {loading ? '🌱 Planting…' : `${VOCAB.rootPlanted}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
