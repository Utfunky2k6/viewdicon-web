'use client'
/**
 * VirtualCard — 5-tier Pan-African digital card component.
 *
 * Five tiers, each named in an African language:
 *   Cowrie Shell  (🐚)  Free tier — terracotta/gold
 *   Obi Select    (🔑)  Mid tier  — purple/Kente
 *   Midnight Ebony(🖤)  Premium   — obsidian/rose gold
 *   Ancestral Onyx(⚫)  Elite     — jet/pure gold
 *   Compound      (🏛️)  Business  — forest green/copper
 *
 * Features: front/back flip on click, balance display, controls.
 */
import * as React from 'react'
import { CARD_TIERS } from '@/constants/banking'

type CardTierIdType = typeof CARD_TIERS[number]['id']

interface VirtualCardProps {
  tierId: CardTierIdType
  holderName?: string
  cardNumber?: string  // last 4 only, rest masked
  balance?: number
  frozen?: boolean
  expiry?: string      // e.g. "04/29"
  currency?: string
  onTopUp?: () => void
  onFreeze?: () => void
  onSetLimit?: () => void
}

const PATTERN_SVG: Record<string, string> = {
  cowrie_shell: `
    <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
    <circle cx="60" cy="50" r="6" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <circle cx="90" cy="25" r="10" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
    <circle cx="130" cy="60" r="7" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
    <circle cx="180" cy="30" r="9" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    <ellipse cx="40" cy="45" rx="5" ry="8" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <ellipse cx="155" cy="50" rx="4" ry="7" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  `,
  obi_select: `
    <line x1="0" y1="0" x2="210" y2="0" stroke="rgba(255,215,0,0.15)" stroke-width="4"/>
    <line x1="0" y1="10" x2="210" y2="10" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <line x1="0" y1="20" x2="210" y2="20" stroke="rgba(255,215,0,0.1)" stroke-width="4"/>
    <line x1="0" y1="30" x2="210" y2="30" stroke="rgba(255,100,0,0.12)" stroke-width="3"/>
    <line x1="0" y1="40" x2="210" y2="40" stroke="rgba(255,215,0,0.15)" stroke-width="4"/>
    <line x1="0" y1="50" x2="210" y2="50" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <line x1="0" y1="60" x2="210" y2="60" stroke="rgba(255,215,0,0.1)" stroke-width="4"/>
    <line x1="0" y1="70" x2="210" y2="70" stroke="rgba(255,100,0,0.12)" stroke-width="3"/>
  `,
  midnight_ebony: `
    <text x="10" y="25" font-size="18" fill="rgba(205,127,50,0.12)" font-family="serif">⊕</text>
    <text x="50" y="55" font-size="14" fill="rgba(205,127,50,0.1)" font-family="serif">✦</text>
    <text x="85" y="25" font-size="16" fill="rgba(205,127,50,0.08)" font-family="serif">⊛</text>
    <text x="130" y="60" font-size="18" fill="rgba(205,127,50,0.1)" font-family="serif">◈</text>
    <text x="160" y="30" font-size="14" fill="rgba(205,127,50,0.09)" font-family="serif">⊕</text>
    <text x="0" y="70" font-size="15" fill="rgba(205,127,50,0.07)" font-family="serif">✦</text>
    <text x="110" y="15" font-size="12" fill="rgba(205,127,50,0.08)" font-family="serif">⊗</text>
  `,
  ancestral_onyx: `
    <text x="5"   y="30" font-size="12" fill="rgba(201,168,76,0.18)" font-family="serif">𓂀</text>
    <text x="50"  y="20" font-size="10" fill="rgba(201,168,76,0.12)" font-family="serif">𓆙</text>
    <text x="90"  y="35" font-size="14" fill="rgba(201,168,76,0.15)" font-family="serif">◈</text>
    <text x="140" y="25" font-size="11" fill="rgba(201,168,76,0.12)" font-family="serif">𓂀</text>
    <text x="175" y="55" font-size="12" fill="rgba(201,168,76,0.15)" font-family="serif">𓆙</text>
    <text x="20"  y="65" font-size="10" fill="rgba(201,168,76,0.1)"  font-family="serif">◈</text>
    <text x="110" y="70" font-size="13" fill="rgba(201,168,76,0.14)" font-family="serif">𓂀</text>
  `,
  compound: `
    <rect x="5" y="5" width="30" height="20" rx="2" fill="none" stroke="rgba(255,143,0,0.12)" stroke-width="1"/>
    <rect x="45" y="15" width="20" height="30" rx="2" fill="none" stroke="rgba(255,143,0,0.1)" stroke-width="1"/>
    <rect x="80" y="5" width="25" height="25" rx="2" fill="none" stroke="rgba(255,143,0,0.12)" stroke-width="1"/>
    <rect x="120" y="20" width="30" height="20" rx="2" fill="none" stroke="rgba(255,143,0,0.09)" stroke-width="1"/>
    <rect x="160" y="10" width="20" height="30" rx="2" fill="none" stroke="rgba(255,143,0,0.11)" stroke-width="1"/>
    <line x1="35" y1="15" x2="45" y2="30" stroke="rgba(255,143,0,0.07)" stroke-width="1"/>
    <line x1="65" y1="30" x2="80" y2="18" stroke="rgba(255,143,0,0.07)" stroke-width="1"/>
    <line x1="105" y1="18" x2="120" y2="30" stroke="rgba(255,143,0,0.07)" stroke-width="1"/>
    <line x1="150" y1="30" x2="160" y2="25" stroke="rgba(255,143,0,0.07)" stroke-width="1"/>
  `,
}

export default function VirtualCard({
  tierId = 'cowrie_shell',
  holderName = 'CITIZEN',
  cardNumber = '4242',
  balance,
  frozen = false,
  expiry = '12/28',
  currency = 'CWR',
  onTopUp, onFreeze, onSetLimit,
}: VirtualCardProps) {
  const [flipped, setFlipped] = React.useState(false)
  const tier = CARD_TIERS.find(t => t.id === tierId) ?? CARD_TIERS[0]
  const pattern = PATTERN_SVG[tierId] ?? PATTERN_SVG.cowrie_shell

  const displayNumber = `•••• •••• •••• ${cardNumber.slice(-4).padStart(4, '•')}`

  return (
    <div style={{ width: '100%', maxWidth: 340, perspective: 800, margin: '0 auto' }}>
      {/* Card container with 3D flip */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '63%', // 85:54 credit card ratio
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer',
          borderRadius: 16,
        }}
      >
        {/* ─── FRONT ─────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background: frozen ? `${tier.gradient}, repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 8px)` : tier.gradient,
            boxShadow: frozen
              ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px ${tier.chipColor}88`
              : `0 8px 32px rgba(0,0,0,0.45), 0 0 0 2px ${tier.chipColor}`,
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
            filter: frozen ? 'grayscale(0.5) brightness(0.75)' : 'none',
            transition: 'filter 0.3s',
          }}
        >
          {/* SVG pattern overlay */}
          <svg
            viewBox="0 0 210 132"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{ __html: pattern }}
          />

          {/* Shimmer overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 30% 30%, ${tier.shimmer} 0%, transparent 60%)`,
            pointerEvents: 'none',
          }} />

          {/* Frozen ice overlay */}
          {frozen && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(100,140,200,0.12)',
            }}>
              <span style={{ fontSize: 36, opacity: 0.5 }}>🧊</span>
            </div>
          )}

          {/* Card content */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px 18px' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: tier.textColor, fontWeight: 800, fontSize: 13, opacity: 0.95, letterSpacing: 0.5 }}>{tier.emoji} {tier.name}</div>
                <div style={{ color: tier.textColor, fontSize: 9, opacity: 0.6, letterSpacing: 1.5, marginTop: 1 }}>{tier.subtitle}</div>
              </div>
              {/* EMV Chip */}
              <div style={{
                width: 32, height: 24, borderRadius: 4,
                background: `linear-gradient(135deg, ${tier.chipColor} 0%, ${tier.chipColor}88 100%)`,
                border: `1px solid ${tier.chipColor}`,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
                gap: 2, padding: 4,
              }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ background: `${tier.chipColor}66`, borderRadius: 1 }} />
                ))}
              </div>
            </div>

            {/* Balance (middle) */}
            {balance !== undefined && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: tier.textColor, opacity: 0.6, fontSize: 9, letterSpacing: 2 }}>AVAILABLE BALANCE</div>
                <div style={{ color: tier.textColor, fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
                  {balance.toLocaleString()} <span style={{ fontSize: 10, opacity: 0.7 }}>{currency}</span>
                </div>
              </div>
            )}

            {/* Bottom row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ color: tier.textColor, opacity: 0.55, fontSize: 8, letterSpacing: 1.5 }}>CARD HOLDER</div>
                <div style={{ color: tier.textColor, fontWeight: 700, fontSize: 11, letterSpacing: 1, marginTop: 2 }}>{holderName.toUpperCase()}</div>
              </div>
              <div>
                <div style={{ color: tier.textColor, opacity: 0.55, fontSize: 8, letterSpacing: 1.5 }}>VALID THRU</div>
                <div style={{ color: tier.textColor, fontWeight: 700, fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{expiry}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BACK ──────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background: tier.gradient,
            boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 2px ${tier.chipColor}`,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            overflow: 'hidden',
          }}
        >
          {/* Magnetic stripe */}
          <div style={{ background: 'rgba(0,0,0,0.8)', height: 36, marginTop: 20, width: '100%' }} />

          {/* Signature + CVV area */}
          <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 4, height: 28, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
              <span style={{ color: tier.textColor, fontFamily: 'cursive', fontSize: 13, opacity: 0.6 }}>{holderName}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '4px 10px', textAlign: 'center' }}>
              <div style={{ color: tier.textColor, fontSize: 7, opacity: 0.6, letterSpacing: 1 }}>CVV</div>
              <div style={{ color: tier.textColor, fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>•••</div>
            </div>
          </div>

          {/* Card number */}
          <div style={{ padding: '0 18px', textAlign: 'center' }}>
            <div style={{ color: tier.textColor, fontFamily: 'monospace', fontSize: 14, letterSpacing: 3, opacity: 0.8 }}>
              {displayNumber}
            </div>
          </div>

          {/* Network mark */}
          <div style={{ position: 'absolute', bottom: 12, right: 18, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: tier.chipColor, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>AFRIKONNECT</span>
            <span style={{ color: tier.chipColor, fontSize: 14 }}>🐚</span>
          </div>

          {/* Flip hint */}
          <div style={{ position: 'absolute', bottom: 12, left: 18, color: tier.textColor, fontSize: 8, opacity: 0.4 }}>
            Tap to flip
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <div style={{ textAlign: 'center', color: '#555', fontSize: 10, marginTop: 6 }}>
        Tap card to flip {flipped ? '↩ Front' : '↩ Back'}
      </div>

      {/* Controls */}
      {(onTopUp || onFreeze || onSetLimit) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {onTopUp && (
            <button onClick={onTopUp} style={{ flex: 1, background: '#1E1E1E', color: '#C9A84C', border: '1px solid #C9A84C44', borderRadius: 10, padding: '10px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              ➕ Top Up
            </button>
          )}
          {onFreeze && (
            <button onClick={onFreeze} style={{ flex: 1, background: '#1E1E1E', color: frozen ? '#4CAF50' : '#42A5F5', border: `1px solid ${frozen ? '#4CAF5044' : '#42A5F544'}`, borderRadius: 10, padding: '10px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {frozen ? '🔓 Unfreeze' : '🧊 Freeze'}
            </button>
          )}
          {onSetLimit && (
            <button onClick={onSetLimit} style={{ flex: 1, background: '#1E1E1E', color: '#AB47BC', border: '1px solid #AB47BC44', borderRadius: 10, padding: '10px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              ⚖️ Limit
            </button>
          )}
        </div>
      )}
    </div>
  )
}
