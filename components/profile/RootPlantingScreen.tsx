// DEPRECATED: Use PlantRootSheet.tsx — this component has inconsistent tier pricing
'use client'
import * as React from 'react'
import { rootApi } from '@/lib/api'

interface RootTier {
  id: 'FREE' | 'STRONG' | 'ELDER'
  emoji: string
  name: string              // "Free Root", "Strong Root", "Elder Root"
  yoruba: string
  price: string             // "Free" | "₡200/mo" | "₡500/mo"
  cowriePerMonth: number    // 0, 200, 500
  color: string
  perks: string[]
}

const ROOT_TIERS: RootTier[] = [
  {
    id: 'FREE',
    emoji: '🌱',
    name: 'Free Root',
    yoruba: 'Ìrèsì Tuntun',
    price: 'Free',
    cowriePerMonth: 0,
    color: '#1a7c3e',
    perks: [
      'Get notified when they go live',
      'Access free content on their channel',
      'Appear in their Roots count',
    ],
  },
  {
    id: 'STRONG',
    emoji: '🌿',
    name: 'Strong Root',
    yoruba: 'Ìrèsì Àgbára',
    price: '₡200/mo',
    cowriePerMonth: 200,
    color: '#d97706',
    perks: [
      'Everything in Free Root',
      'Exclusive Strong-Root-only posts',
      'Direct message access (consent-gated)',
      'Strong Root badge — visible on your profile',
      'Early access to new content drops',
    ],
  },
  {
    id: 'ELDER',
    emoji: '🌳',
    name: 'Elder Root',
    yoruba: 'Ìrèsì Àgbà',
    price: '₡500/mo',
    cowriePerMonth: 500,
    color: '#7c3aed',
    perks: [
      'Everything in Strong Root',
      'Elder Root badge — rare, gold-outlined',
      'Co-host live sessions',
      'Revenue share on your referred viewers (1%)',
      'Ancestral Vault shared access (optional)',
      'Monthly private voice circle with creator',
    ],
  },
]

const RECENT_PLANTERS = [
  { handle: '@KwameAsante',  tier: 'ELDER',  emoji: '🌳', avatar: 'K', bg: '#7c3aed', when: '2h ago' },
  { handle: '@FatimaD',      tier: 'STRONG', emoji: '🌿', avatar: 'F', bg: '#d97706', when: '5h ago' },
  { handle: '@TumiAkos',     tier: 'FREE',   emoji: '🌱', avatar: 'T', bg: '#1a7c3e', when: '1d ago' },
  { handle: '@AminaOkafor',  tier: 'STRONG', emoji: '🌿', avatar: 'A', bg: '#d97706', when: '2d ago' },
  { handle: '@ChukwuTech',   tier: 'FREE',   emoji: '🌱', avatar: 'C', bg: '#1a7c3e', when: '3d ago' },
]

const TIER_COLORS: Record<string, string> = { FREE: '#1a7c3e', STRONG: '#d97706', ELDER: '#7c3aed' }

interface RootPlantingScreenProps {
  /** Creator being subscribed to */
  creatorHandle?: string
  creatorName?: string
  /** Creator's AfroID — needed for the rootApi call */
  creatorAfroId?: string
  /** Roots already planted in this creator */
  currentTier?: 'FREE' | 'STRONG' | 'ELDER' | null
  /** Total roots count */
  rootCount?: number
  onClose: () => void
  onSuccess?: (tier: string) => void
}

export function RootPlantingScreen({
  creatorHandle = '@MarketKing',
  creatorName = 'Umoh Utibe',
  creatorAfroId,
  currentTier = null,
  rootCount = 204,
  onClose,
  onSuccess,
}: RootPlantingScreenProps) {
  const [selected, setSelected] = React.useState<RootTier['id'] | null>(currentTier)
  const [confirming, setConfirming] = React.useState(false)
  const [planted, setPlanted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Map legacy tier IDs to rootApi tier IDs
  const TIER_API_MAP: Record<string, 'FREE_ROOT' | 'PAID_ROOT' | 'ANCESTRAL_ROOT'> = {
    FREE: 'FREE_ROOT',
    STRONG: 'PAID_ROOT',
    ELDER: 'ANCESTRAL_ROOT',
  }

  const handlePlant = async () => {
    if (!selected) return
    if (!confirming) { setConfirming(true); return }

    setLoading(true)
    setError(null)
    try {
      if (creatorAfroId) {
        const tier = ROOT_TIERS.find(t => t.id === selected)
        await rootApi.plant(creatorAfroId, TIER_API_MAP[selected], tier?.cowriePerMonth)
      }
      setPlanted(true)
      onSuccess?.(selected)
      setTimeout(onClose, 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not plant root. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedTier = ROOT_TIERS.find(t => t.id === selected)

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#0d0d1a', borderRadius: '24px 24px 0 0', maxHeight: '94dvh', overflowY: 'auto', paddingBottom: 40 }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>🌳 Plant Your Root</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Support {creatorName} · {creatorHandle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f7f0' }}>{rootCount.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>Total Roots</div>
          </div>
        </div>

        {/* Tier cards */}
        <div style={{ padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROOT_TIERS.map(tier => {
            const isSelected = selected === tier.id
            const isCurrent = currentTier === tier.id
            return (
              <button
                key={tier.id}
                onClick={() => { setSelected(tier.id); setConfirming(false) }}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 0,
                  padding: 14, borderRadius: 16,
                  background: isSelected ? `${tier.color}18` : 'rgba(255,255,255,.03)',
                  border: `1.5px solid ${isSelected ? tier.color : 'rgba(255,255,255,.08)'}`,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all .2s',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: `${tier.color}22`, border: `1.5px solid ${tier.color}66`, flexShrink: 0 }}>{tier.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0' }}>{tier.name}</span>
                      {isCurrent && <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 99, background: tier.color, color: '#000', fontWeight: 900 }}>ACTIVE</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{tier.yoruba}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: tier.color }}>{tier.price}</div>
                    {tier.cowriePerMonth > 0 && <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Cowrie / month</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {tier.perks.map(perk => (
                    <div key={perk} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ fontSize: 10, color: tier.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{perk}</span>
                    </div>
                  ))}
                </div>
                {tier.cowriePerMonth > 0 && (
                  <div style={{ marginTop: 8, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,.04)', fontSize: 9, color: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    🛡 Platform takes 10% · Creator receives 90% of ₡{Math.floor(tier.cowriePerMonth * 0.9)}/mo
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Recent planters */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>Recent Planters</div>
          {RECENT_PLANTERS.map(planter => (
            <div key={planter.handle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', background: planter.bg, flexShrink: 0 }}>{planter.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{planter.handle}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{planter.when}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: `${TIER_COLORS[planter.tier]}18`, border: `1px solid ${TIER_COLORS[planter.tier]}44` }}>
                <span style={{ fontSize: 11 }}>{planter.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: TIER_COLORS[planter.tier] }}>{planter.tier}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: 14, marginTop: 6 }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, fontSize: 12,
              color: '#f87171', background: 'rgba(248,113,113,.08)',
              border: '1px solid rgba(248,113,113,.2)', textAlign: 'center',
              marginBottom: 10,
            }}>
              {error}
            </div>
          )}
          {planted ? (
            <div style={{ width: '100%', padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, #0a2a16, #1a7c3e)', border: '1px solid #4ade80', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🌳</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#4ade80' }}>Root Planted!</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>Your root is growing in {creatorName}'s village</div>
            </div>
          ) : confirming && selectedTier ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: 12, borderRadius: 12, background: `${selectedTier.color}12`, border: `1px solid ${selectedTier.color}44`, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0', marginBottom: 3 }}>Confirm: {selectedTier.name}</div>
                {selectedTier.cowriePerMonth > 0 ? (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>₡{selectedTier.cowriePerMonth} will be deducted from your Cowrie Pot monthly. You can lift your root anytime.</div>
                ) : (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Free — no Cowrie required. You can lift your root anytime.</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setConfirming(false); setError(null) }} style={{ flex: 1, padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Back</button>
                <button onClick={handlePlant} disabled={loading} style={{ flex: 2, padding: 14, borderRadius: 14, border: 'none', background: loading ? `${selectedTier.color}55` : `linear-gradient(135deg, ${selectedTier.color}, ${selectedTier.color}aa)`, color: '#fff', fontSize: 14, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '🌱 Planting…' : `${selectedTier.emoji} Confirm Root`}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handlePlant}
              disabled={!selected}
              style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', fontSize: 15, fontWeight: 900, cursor: selected ? 'pointer' : 'not-allowed', background: selected ? `linear-gradient(135deg, ${selectedTier?.color ?? '#1a7c3e'}, ${selectedTier?.color ?? '#1a7c3e'}aa)` : 'rgba(255,255,255,.06)', color: selected ? '#fff' : 'rgba(255,255,255,.3)', transition: 'all .2s', fontFamily: 'Sora, sans-serif' }}
            >
              {selected ? `${selectedTier?.emoji} Plant ${selectedTier?.name}` : 'Select a root tier'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
