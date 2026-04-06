'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { loveWorldApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const TIERS = [
  { key: 'unverified', label: 'Unverified', icon: '\u25CB', desc: 'No verification yet', reqs: 'Create a Love World profile', benefits: 'Basic access to match queue', color: '#666' },
  { key: 'phone', label: 'Phone', icon: '\u260E', desc: 'Phone number verified via OTP', reqs: 'Verified automatically during signup', benefits: 'Appear in match results, send messages', color: '#aaa' },
  { key: 'photo', label: 'Photo', icon: '\uD83D\uDCF7', desc: 'Real selfie confirmed by AI', reqs: 'Submit a clear front-facing photo', benefits: 'Gold badge on profile, +20% visibility', color: '#D4AF37' },
  { key: 'video', label: 'Video', icon: '\uD83C\uDFA5', desc: 'Live video verification', reqs: 'Complete a 10-second video prompt', benefits: 'Priority in queue, trust score boost', color: '#00C853' },
  { key: 'village_vouch', label: 'Village Vouch', icon: '\uD83D\uDC51', desc: 'Vouched for by village elders', reqs: '3 village members confirm your identity', benefits: 'Purple crown, max trust, elder visibility', color: '#9C27B0' },
] as const

type TierKey = typeof TIERS[number]['key']
const TIER_ORDER: TierKey[] = ['unverified', 'phone', 'photo', 'video', 'village_vouch']

export default function VerificationPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentTier, setCurrentTier] = React.useState<TierKey>('unverified')
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState<string | null>(null)

  React.useEffect(() => {
    loveWorldApi.getVerification().then(v => {
      if (v?.tier) setCurrentTier(v.tier)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const tierIdx = TIER_ORDER.indexOf(currentTier)

  const upgrade = async (tier: TierKey) => {
    setActing(tier)
    try {
      if (tier === 'photo') await loveWorldApi.verifyPhoto('selfie://capture')
      else if (tier === 'video') await loveWorldApi.verifyVideo()
      else if (tier === 'village_vouch') await loveWorldApi.verifyVillageVouch()
      setCurrentTier(tier)
    } catch {}
    setActing(null)
  }

  const box: React.CSSProperties = { background: '#111118', borderRadius: 12, padding: 16, marginBottom: 14 }

  if (loading) return <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push('/dashboard/love')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: 22, cursor: 'pointer' }}>&#8592;</button>
        <span style={{ fontSize: 24 }}>&#128737;</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Verification Tiers</h1>
      </div>

      {/* Progress bar */}
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          {TIERS.map((t, i) => {
            const done = i <= tierIdx
            const active = i === tierIdx
            return (
              <React.Fragment key={t.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? t.color : '#1A1A25', border: active ? `2px solid ${t.color}` : '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: done ? '#fff' : '#555', transition: 'all .3s' }}>
                    {done && i < tierIdx ? '\u2713' : (i + 1)}
                  </div>
                  <span style={{ fontSize: 9, color: done ? t.color : '#555', textAlign: 'center', maxWidth: 50 }}>{t.label}</span>
                </div>
                {i < TIERS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < tierIdx ? TIERS[i + 1].color : '#333', margin: '0 2px', marginBottom: 18 }} />
                )}
              </React.Fragment>
            )
          })}
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: '#aaa' }}>
          Current: <span style={{ color: TIERS[tierIdx].color, fontWeight: 700 }}>{TIERS[tierIdx].label}</span>
        </div>
      </div>

      {/* Tier cards */}
      {TIERS.map((t, i) => {
        const done = i <= tierIdx
        const isNext = i === tierIdx + 1
        const canUpgrade = i > tierIdx && i >= 2 // phone is auto, photo+ are manual
        return (
          <div key={t.key} style={{ ...box, border: done ? `1px solid ${t.color}44` : isNext ? `1px solid ${t.color}88` : '1px solid #222', opacity: i > tierIdx + 1 ? 0.5 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: done ? t.color : '#fff' }}>{t.label}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{t.desc}</div>
              </div>
              {done && <span style={{ color: t.color, fontWeight: 800, fontSize: 13 }}>&#10003; Done</span>}
            </div>

            <div style={{ fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#888' }}>Requires: </span><span style={{ color: '#ccc' }}>{t.reqs}</span>
            </div>
            <div style={{ fontSize: 12, marginBottom: 10 }}>
              <span style={{ color: '#888' }}>Benefits: </span><span style={{ color: t.color }}>{t.benefits}</span>
            </div>

            {canUpgrade && (
              <button onClick={() => upgrade(t.key)} disabled={acting !== null} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: isNext ? t.color : '#1A1A25', color: isNext ? '#0A0A0F' : '#888', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, cursor: isNext ? 'pointer' : 'default' }}>
                {acting === t.key ? 'Verifying...' : `Upgrade to ${t.label}`}
              </button>
            )}
          </div>
        )
      })}

      {/* Benefits summary */}
      <div style={{ ...box, border: '1px solid #D4AF3744' }}>
        <div style={{ fontWeight: 700, color: '#D4AF37', marginBottom: 10 }}>Tier Benefits</div>
        {TIERS.slice(2).map(t => (
          <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{ fontWeight: 700, color: t.color, minWidth: 95 }}>{t.label}</span>
            <span style={{ color: '#aaa' }}>{t.benefits}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
