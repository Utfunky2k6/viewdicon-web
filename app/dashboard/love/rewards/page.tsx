'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

// ═══════════════════════════════════════════════════════════════════════
// LOVE WORLD — COVENANT REWARDS (Post-Marriage)
// Route: /dashboard/love/rewards
// ═══════════════════════════════════════════════════════════════════════

const GOLD = '#D4AF37'
const BG = '#0A0A0F'
const CARD = '#111118'
const CARD2 = '#1A1A25'
const GREEN = '#00C853'
const RED = '#FF3B30'
const BLUE = '#4A90D9'
const PURPLE = '#8B5CF6'
const WHITE = '#FFFFFF'

interface JourneySummary {
  questionsAnswered: number
  daysOfJourney: number
  compatibilityScore: number
  milestonesAchieved: number
}

interface RewardItem {
  key: string; icon: string; title: string; description: string
  status: 'AVAILABLE' | 'CLAIMED' | 'UNLOCKED'
  route?: string; buttonLabel?: string
}

const MOCK_SUMMARY: JourneySummary = {
  questionsAnswered: 42,
  daysOfJourney: 87,
  compatibilityScore: 94,
  milestonesAchieved: 6,
}

const REWARDS: RewardItem[] = [
  {
    key: 'cowrie_bonus', icon: '\uD83E\uDE99', title: 'Cowrie Bonus',
    description: '10,000 Cowrie wedding bonus credited to your joint wallet',
    status: 'AVAILABLE',
  },
  {
    key: 'couple_badge', icon: '\uD83D\uDC9B', title: 'Couple Badge',
    description: 'Verified Sacred Union badge on your profile',
    status: 'UNLOCKED',
  },
  {
    key: 'family_realm', icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66', title: 'Family Realm Access',
    description: 'Unlock the Family Realm for your new household',
    status: 'UNLOCKED', route: '/dashboard/family', buttonLabel: 'Enter Family Realm',
  },
  {
    key: 'joint_wallet', icon: '\uD83D\uDCB0', title: 'Joint Wallet',
    description: 'Special joint wallet with couple perks and shared savings',
    status: 'UNLOCKED', route: '/dashboard/banking', buttonLabel: 'Open Joint Wallet',
  },
]

const KEYFRAMES = `
@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes ringPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.1); }
  50% { box-shadow: 0 0 30px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.2); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
`

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('afk-auth')
    const state = stored ? JSON.parse(stored)?.state : null
    return state?.accessToken ?? state?.token ?? null
  } catch { return null }
}

export default function CovenantRewardsPage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  const [loading, setLoading] = useState(true)
  const [rewards, setRewards] = useState<RewardItem[]>(REWARDS)
  const [summary, setSummary] = useState<JourneySummary>(MOCK_SUMMARY)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const initials = user?.displayName
    ? user.displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'SU'

  const fetchRewards = useCallback(async () => {
    try {
      const token = getToken()
      const res = await fetch('/api/love/rewards', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data.rewards?.length) setRewards(data.rewards)
      if (data.summary) setSummary(data.summary)
    } catch {
      // Keep mock data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRewards() }, [fetchRewards])

  useEffect(() => {
    const tag = document.createElement('style')
    tag.textContent = KEYFRAMES
    document.head.appendChild(tag)
    return () => { document.head.removeChild(tag) }
  }, [])

  const handleClaim = async (rewardKey: string) => {
    setClaiming(rewardKey)
    try {
      const token = getToken()
      await fetch('/api/love/rewards/claim', {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardKey }),
      })
      setRewards(prev => prev.map(r => r.key === rewardKey ? { ...r, status: 'CLAIMED' as const } : r))
    } catch {
      setRewards(prev => prev.map(r => r.key === rewardKey ? { ...r, status: 'CLAIMED' as const } : r))
    } finally {
      setClaiming(null)
    }
  }

  const handleShare = () => {
    setToastMsg('Your union has been announced to your village!')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  const statusColor = (s: string) => s === 'CLAIMED' ? GREEN : s === 'UNLOCKED' ? GOLD : BLUE
  const statusLabel = (s: string) => s === 'CLAIMED' ? 'Claimed' : s === 'UNLOCKED' ? 'Unlocked' : 'Available'

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: GOLD, fontFamily: 'monospace', fontSize: 14 }}>Loading Rewards...</p>
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'monospace', color: WHITE, paddingBottom: 100 }}>
      {/* Header with radial gradient */}
      <div style={{
        padding: '20px 16px 24px', textAlign: 'center',
        background: `radial-gradient(ellipse at center top, ${GOLD}18 0%, ${BG} 70%)`,
        borderBottom: `1px solid ${CARD2}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: GOLD, fontSize: 20, cursor: 'pointer', padding: 0, fontFamily: 'monospace',
          }}>
            &larr;
          </button>
          <h1 style={{ margin: 0, fontSize: 18, color: GOLD, fontFamily: 'monospace', letterSpacing: 1, flex: 1, textAlign: 'center' }}>
            {'\uD83D\uDC51'} COVENANT REWARDS
          </h1>
          <div style={{ width: 20 }} />
        </div>

        {/* Union Badge */}
        <div style={{
          width: 120, height: 120, borderRadius: '50%', margin: '0 auto',
          border: `4px solid ${GOLD}`,
          background: `linear-gradient(135deg, ${CARD} 0%, ${CARD2} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          animation: 'ringPulse 3s ease-in-out infinite',
        }}>
          {/* Rotating ring */}
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: `2px dashed ${GOLD}55`,
            animation: 'ringRotate 12s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, letterSpacing: 2 }}>{initials}</div>
            <div style={{ fontSize: 9, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Sacred Union</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: GREEN, fontWeight: 700 }}>
          {'\u2713'} Verified Sacred Union
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Rewards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {rewards.map((reward, idx) => {
            const sc = statusColor(reward.status)
            return (
              <div key={reward.key} style={{
                background: CARD, borderRadius: 14, padding: 16, position: 'relative',
                border: `1px solid ${sc}33`,
                animation: `fadeSlideUp 0.4s ease ${idx * 0.1}s both`,
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Status badge */}
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                  background: `${sc}22`, color: sc, textTransform: 'uppercase',
                }}>
                  {statusLabel(reward.status)}
                </div>

                <div style={{ fontSize: 36, marginBottom: 10, textAlign: 'center' }}>{reward.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: WHITE, marginBottom: 6, textAlign: 'center' }}>
                  {reward.title}
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 11, color: '#888', lineHeight: 1.5, textAlign: 'center', flex: 1 }}>
                  {reward.description}
                </p>

                {/* Action */}
                {reward.status === 'AVAILABLE' && (
                  <button onClick={() => handleClaim(reward.key)}
                    disabled={claiming === reward.key}
                    style={{
                      width: '100%', padding: '8px 0', borderRadius: 8,
                      background: `linear-gradient(135deg, ${GOLD}, #F5D76E)`,
                      color: BG, border: 'none', fontFamily: 'monospace', fontSize: 11,
                      fontWeight: 700, cursor: claiming === reward.key ? 'wait' : 'pointer',
                      opacity: claiming === reward.key ? 0.6 : 1,
                    }}>
                    {claiming === reward.key ? 'Claiming...' : 'Claim Reward'}
                  </button>
                )}
                {reward.status === 'UNLOCKED' && reward.route && (
                  <button onClick={() => router.push(reward.route!)} style={{
                    width: '100%', padding: '8px 0', borderRadius: 8,
                    background: `${sc}22`, border: `1px solid ${sc}`,
                    color: sc, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>
                    {reward.buttonLabel || 'Open'}
                  </button>
                )}
                {reward.status === 'CLAIMED' && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: GREEN, fontWeight: 700 }}>
                    {'\u2713'} Claimed
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Journey Summary */}
        <div style={{ background: CARD, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 14, textAlign: 'center' }}>
            JOURNEY SUMMARY
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Questions Answered', value: summary.questionsAnswered, icon: '\uD83D\uDCAC', color: BLUE },
              { label: 'Days of Journey', value: summary.daysOfJourney, icon: '\uD83D\uDCC5', color: PURPLE },
              { label: 'Compatibility', value: `${summary.compatibilityScore}%`, icon: '\u2764\uFE0F', color: RED },
              { label: 'Milestones', value: `${summary.milestonesAchieved}/6`, icon: '\uD83C\uDFC6', color: GOLD },
            ].map(stat => (
              <div key={stat.label} style={{
                background: CARD2, borderRadius: 10, padding: '12px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Union Button */}
        <button onClick={handleShare} style={{
          width: '100%', padding: '14px 0', borderRadius: 12,
          background: `linear-gradient(135deg, ${GOLD}, #F5D76E, ${GOLD})`,
          backgroundSize: '200% auto',
          animation: 'shimmer 3s linear infinite',
          color: BG, border: 'none', fontFamily: 'monospace', fontSize: 15, fontWeight: 800,
          cursor: 'pointer', letterSpacing: 1,
        }}>
          Announce Your Union to the Village
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 12, background: GREEN, color: BG,
          fontFamily: 'monospace', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
          animation: 'toastIn 0.3s ease', zIndex: 999,
          boxShadow: `0 4px 20px rgba(0,200,83,0.3)`,
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
