'use client'
// ============================================================
// MarketListingCard — Commerce-First Social Post
// The village market brought into the feed
// ============================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { Post } from './feedTypes'
import { PriceHeatBar } from './PriceHeatBar'
import { InteractionBar } from './InteractionBar'
import { DrumScopeIndicator } from './DrumScopeIndicator'

interface MarketListingCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
  isNightMarket?: boolean
}

const CSS_ID = 'market-card-css'
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
@keyframes nightGlow{0%,100%{box-shadow:0 0 10px rgba(224,123,0,.2)}50%{box-shadow:0 0 24px rgba(224,123,0,.5)}}
@keyframes priceShimmer{0%{background-position:0% center}100%{background-position:200% center}}
.mkt-night{animation:nightGlow 2s ease-in-out infinite}
`

// Product image area — uses emoji with coloured backdrop
function ProductDisplay({ emoji, name }: { emoji?: string; name?: string }) {
  const productColors = ['#1a0a00', '#0a1a00', '#00101a', '#0f001a']
  const bg = productColors[Math.abs((name ?? '').charCodeAt(0) ?? 0) % productColors.length]
  return (
    <div style={{
      width: '100%', height: 160, borderRadius: 12,
      background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 10, position: 'relative', overflow: 'hidden',
    }}>
      {/* Adinkra subtle pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg,rgba(212,160,23,.03) 0,rgba(212,160,23,.03) 1px,transparent 0,transparent 50%)',
        backgroundSize: '20px 20px',
      }} />
      <span style={{ fontSize: 56, position: 'relative' }}>{emoji ?? '📦'}</span>
      {name && (
        <span style={{
          position: 'absolute', bottom: 8, left: 10, right: 10,
          fontSize: 10, color: 'rgba(255,255,255,.5)', textAlign: 'center',
        }}>{name}</span>
      )}
    </div>
  )
}

export function MarketListingCard({ post, onInteract, isNightMarket = false }: MarketListingCardProps) {
  const router = useRouter()
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [ubuntud, setUbuntud] = React.useState(false)
  const [kilaCount, setKilaCount] = React.useState(post.kilaCount)
  const [stirCount, setStirCount] = React.useState(post.stirCount)
  const [ubuntuCount, setUbuntuCount] = React.useState(post.ubuntuCount)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const handleTrade = () => {
    const params = new URLSearchParams({
      tool: 'quick_invoice',
      product: post.productName ?? '',
      price: String(post.productPrice ?? 0),
      seller: post.afroId,
    })
    router.push(`/dashboard/sessions/new?${params}`)
  }

  const pct = post.marketPricePercent ?? 100
  const dealLabel = pct < 93
    ? `🎉 ${(100 - pct).toFixed(0)}% below market — great deal!`
    : pct > 110
    ? `⚠️ ${(pct - 100).toFixed(0)}% above market`
    : '✓ At market price'
  const dealColor = pct < 93 ? '#22c55e' : pct > 110 ? '#f59e0b' : '#94a3b8'

  return (
    <div
      className={isNightMarket ? 'mkt-night' : ''}
      style={{
        background: 'rgba(255,255,255,.025)',
        border: '1.5px solid rgba(224,123,0,.2)',
        borderRadius: 16, overflow: 'hidden',
      }}
    >
      {/* Night Market badge */}
      {isNightMarket && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(224,123,0,.15), rgba(224,123,0,.05))',
          padding: '6px 14px',
          display: 'flex', alignItems: 'center', gap: 6,
          borderBottom: '1px solid rgba(224,123,0,.1)',
        }}>
          <span style={{ fontSize: 12 }}>🏮</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#e07b00', letterSpacing: '.08em' }}>
            NIGHT MARKET — boosted listing
          </span>
        </div>
      )}

      <div style={{ padding: '12px 14px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${post.avatarColor}, #e07b00)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, color: '#fff',
          }}>
            {post.author.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
              {post.author}
              <span style={{ fontSize: 10, color: '#22c55e', marginLeft: 4 }}>🛡</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>
              {post.villageEmoji} {post.village} · {post.role} · {post.time}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{
              fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 5,
              background: 'rgba(224,123,0,.15)', color: '#e07b00',
              letterSpacing: '.06em',
            }}>🛒 MARKET</span>
            <DrumScopeIndicator scope={post.drumScope} />
          </div>
        </div>

        {/* Product image */}
        <ProductDisplay emoji={post.productImageEmoji} name={post.productName} />

        {/* Product details */}
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 16, fontWeight: 900, fontFamily: 'Sora, sans-serif',
            color: '#f0f7f0', marginBottom: 4,
          }}>
            {post.productName ?? post.content}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: 22, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: '#4ade80',
            }}>
              ₡{post.productPrice?.toLocaleString() ?? '—'}
            </span>
            {post.tags[0] && (
              <span style={{ fontSize: 10, color: 'rgba(240,247,240,.4)' }}>
                📍 {post.tags[0]}
              </span>
            )}
          </div>
        </div>

        {/* Price Heat Bar */}
        <div style={{ marginBottom: 12 }}>
          <PriceHeatBar marketPricePercent={pct} />
          <div style={{ fontSize: 10, fontWeight: 700, color: dealColor, marginTop: 4 }}>
            {dealLabel}
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button
            onClick={handleTrade}
            style={{
              flex: 2, padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1a7c3e, #22c55e)',
              fontSize: 12, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif',
            }}
          >
            🤝 Open Trade Session
          </button>
          <button
            onClick={() => onInteract?.('griot', post.id)}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 12,
              background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)',
              fontSize: 11, fontWeight: 700, color: '#818cf8', cursor: 'pointer',
            }}
          >
            🦅 Ask Griot
          </button>
          <button
            onClick={() => { setKilaed(true); setKilaCount(n => n + 1) }}
            disabled={kilaed}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', cursor: kilaed ? 'default' : 'pointer',
              background: kilaed ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.06)',
              fontSize: 16,
            }}
          >
            ⭐
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'rgba(240,247,240,.4)' }}>
          <span>🔥 {stirCount} Stir</span>
          <span>⭐ {kilaCount} Kíla</span>
          <span>🥁 {post.drumScope > 1 ? 'Drummed' : '0 Drum'}</span>
          <span>💬 {post.commentCount}</span>
        </div>
      </div>
    </div>
  )
}
