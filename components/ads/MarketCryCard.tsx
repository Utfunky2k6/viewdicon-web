'use client'
import * as React from 'react'

export interface MarketCry {
  id: string
  headline: string
  body: string
  cta: string
  ctaHref: string
  advertiser: string
  advertiserCrest: number
  type: 'market_cry' | 'night_market' | 'griot_story' | 'drum_announcement'
  accent: string
  village?: string
  earnReward?: number // cowrie earned for engaging
}

const TYPE_BADGE: Record<string, { emoji: string; label: string; color: string }> = {
  market_cry:       { emoji: '🥁', label: 'MARKET CRY',       color: '#d4a017' },
  night_market:     { emoji: '🏮', label: 'NIGHT MARKET',     color: '#f59e0b' },
  griot_story:      { emoji: '🎙', label: 'GRIOT STORY',      color: '#10b981' },
  drum_announcement:{ emoji: '📢', label: 'DRUM ANNOUNCEMENT', color: '#ef4444' },
}

const CREST = ['', '🌱', '🌿', '🌳', '\u2B50', '👑', '🏛', '🦅']

export const MOCK_MARKET_CRIES: MarketCry[] = [
  {
    id: 'ad1', headline: 'Premium Palm Oil \u2014 Direct from Lagos',
    body: 'Fresh from the farm to your pot. Our 5L cold-pressed palm oil is trusted by 200+ families. Taste the difference this harvest season.',
    cta: '🫘 Add to Pot', ctaHref: '/dashboard/jollof', advertiser: 'Mama Aduke Market', advertiserCrest: 3,
    type: 'market_cry', accent: '#d4a017', village: 'commerce', earnReward: 10,
  },
  {
    id: 'ad2', headline: 'AfriTech Summit 2026 \u2014 Register Now',
    body: 'The continent\'s biggest tech gathering returns. 50+ speakers, 20 workshops, 1 African mission. Early drums get 30% Cowrie discount.',
    cta: '🔥 Join the Fire', ctaHref: '/dashboard/villages/technology', advertiser: 'AfriTech Foundation', advertiserCrest: 5,
    type: 'drum_announcement', accent: '#ef4444', village: 'technology', earnReward: 25,
  },
  {
    id: 'ad3', headline: 'Ankara Collection \u2014 Midnight Drop',
    body: 'Exclusive Night Market release. 12 new designs from West African artisans. Available 6pm\u201Cmidnight only. First 50 buyers get free delivery.',
    cta: '🏮 Shop Now', ctaHref: '/dashboard/jollof', advertiser: 'Kente & Thread Co.', advertiserCrest: 4,
    type: 'night_market', accent: '#f59e0b', village: 'fashion', earnReward: 15,
  },
  {
    id: 'ad4', headline: 'The Story of the Iroko Tree',
    body: 'The elders say: even the mightiest Iroko started as a seed. Plant your savings today with AfriVest \u2014 where small seeds grow into forests. 🌳',
    cta: '🌳 Plant Your Root', ctaHref: '/dashboard/cowrie-flow', advertiser: 'AfriVest Savings', advertiserCrest: 6,
    type: 'griot_story', accent: '#10b981', village: 'finance', earnReward: 20,
  },
]

export function MarketCryCard({ ad }: { ad: MarketCry }) {
  const [earned, setEarned] = React.useState(false)
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [viewTime, setViewTime] = React.useState(0)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const badge = TYPE_BADGE[ad.type] ?? TYPE_BADGE.market_cry

  // Track view time for cowrie reward
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !earned) {
          const timer = setInterval(() => {
            setViewTime(prev => {
              if (prev >= 5 && !earned) {
                setEarned(true)
                clearInterval(timer)
              }
              return prev + 1
            })
          }, 1000)
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.5 }
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [earned])

  return (
    <div ref={cardRef} style={{
      margin: '6px 10px',
      background: 'rgba(255,255,255,.04)',
      borderRadius: 18,
      border: `1px solid ${badge.color}30`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Golden top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${badge.color}, ${badge.color}44, ${badge.color})` }} />

      {/* Sponsored badge row */}
      <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 8, fontWeight: 800, background: `${badge.color}20`, color: badge.color, letterSpacing: '.04em' }}>{badge.emoji} {badge.label}</span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,.2)' }}>Sponsored</span>
        </div>
        {ad.earnReward && !earned && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)' }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#4ade80' }}>🐚 Earn {'\u20A1'}{ad.earnReward}</span>
            <div style={{ width: 20, height: 3, borderRadius: 2, background: 'rgba(74,222,128,.15)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(viewTime, 5) * 20}%`, height: '100%', background: '#4ade80', borderRadius: 2, transition: 'width 1s linear' }} />
            </div>
          </div>
        )}
        {earned && (
          <div style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(74,222,128,.1)', fontSize: 8, fontWeight: 800, color: '#4ade80' }}>🐚 +{'\u20A1'}{ad.earnReward} earned!</div>
        )}
      </div>

      {/* Advertiser row */}
      <div style={{ padding: '8px 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${badge.color}60, ${badge.color}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff' }}>{ad.advertiser.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f5ee' }}>
            {CREST[ad.advertiserCrest] ?? ''} {ad.advertiser}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
            {ad.village && <span style={{ textTransform: 'capitalize' }}>📍 {ad.village}</span>}
            {ad.advertiserCrest >= 4 && <span style={{ marginLeft: 6, color: '#d4a017' }}>👑 Elder&apos;s Choice</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f5ee', fontFamily: 'Sora, sans-serif', lineHeight: 1.4, marginBottom: 6 }}>{ad.headline}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{ad.body}</div>
      </div>

      {/* CTA button */}
      <div style={{ padding: '0 14px 10px' }}>
        <button onClick={() => { window.location.href = ad.ctaHref }} style={{
          width: '100%', padding: '12px', borderRadius: 12,
          background: `linear-gradient(135deg, ${badge.color}, ${badge.color}aa)`,
          border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif',
          boxShadow: `0 4px 16px ${badge.color}30`,
        }}>{ad.cta}</button>
      </div>

      {/* Interaction row */}
      <div style={{ padding: '6px 14px 12px', display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <button onClick={() => setKilaed(!kilaed)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: kilaed ? '#d4a017' : 'rgba(255,255,255,.3)', fontSize: 11, fontWeight: 700 }}>
          {'\u2B50'} {kilaed ? 'K\u00edla\'d' : 'K\u00edla'}
        </button>
        <button onClick={() => setStirred(!stirred)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: stirred ? '#ef4444' : 'rgba(255,255,255,.3)', fontSize: 11, fontWeight: 700 }}>
          🔥 {stirred ? 'Stirred' : 'Stir'}
        </button>
        <button onClick={() => navigator.share?.({ title: ad.headline, text: ad.body, url: window.location.href }).catch(() => {})} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', fontSize: 11, fontWeight: 700 }}>
          {'\u2197'} Share
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,.15)' }}>Ad {'\u00B7'} Dismiss</div>
      </div>
    </div>
  )
}
