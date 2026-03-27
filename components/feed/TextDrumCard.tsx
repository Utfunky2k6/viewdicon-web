'use client'
// ============================================================
// TextDrumCard — Text Post · The Talking Drum · African Village Voice
// Handles: TEXT_DRUM · BLOOD_CALL · GRIOT_WISDOM · VILLAGE_NOTICE · KILA_MOMENT
// ============================================================
import * as React from 'react'
import type { Post } from './feedTypes'
import { HeatBar } from './HeatBar'
import { InteractionBar } from './InteractionBar'
import { DrumScopeIndicator } from './DrumScopeIndicator'

interface TextDrumCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
}

const CSS_ID = 'text-drum-card-css'
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
@keyframes bloodPulse{0%,100%{box-shadow:0 0 0 0 rgba(185,28,28,.4)}50%{box-shadow:0 0 0 8px rgba(185,28,28,0)}}
@keyframes starBurst{0%{transform:scale(0) rotate(0deg);opacity:1}100%{transform:scale(2.5) rotate(180deg);opacity:0}}
@keyframes kilaShimmer{0%,100%{background-position:200% center}50%{background-position:-200% center}}
.blood-pulse{animation:bloodPulse 1.5s ease-in-out infinite}
.kila-shimmer{background:linear-gradient(90deg,#d4a017,#f59e0b,#d4a017);background-size:200% auto;animation:kilaShimmer 2s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent}
`

function NkisiShield({ nkisi }: { nkisi: 'GREEN' | 'AMBER' | 'RED' }) {
  const color = nkisi === 'GREEN' ? '#22c55e' : nkisi === 'AMBER' ? '#f59e0b' : '#ef4444'
  const label = nkisi === 'GREEN' ? '🛡' : nkisi === 'AMBER' ? '⚠️' : '🚫'
  return (
    <span style={{
      fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 2,
      color, fontWeight: 700,
    }} title={`Nkisi ${nkisi}`}>{label}</span>
  )
}

function CrestBadge({ tier }: { tier: number }) {
  if (!tier) return null
  const stars = '✦'.repeat(Math.min(tier, 5))
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, color: '#d4a017',
      padding: '1px 5px', borderRadius: 4,
      background: 'rgba(212,160,23,.12)', border: '1px solid rgba(212,160,23,.2)',
    }}>{stars} Crest {tier}</span>
  )
}

export function TextDrumCard({ post, onInteract }: TextDrumCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [ubuntud, setUbuntud] = React.useState(false)
  const [kilaCount, setKilaCount] = React.useState(post.kilaCount)
  const [stirCount, setStirCount] = React.useState(post.stirCount)
  const [ubuntuCount, setUbuntuCount] = React.useState(post.ubuntuCount)
  const [showStar, setShowStar] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const isBloodCall = post.type === 'BLOOD_CALL'
  const isGriot = post.type === 'GRIOT_WISDOM'
  const isNotice = post.type === 'VILLAGE_NOTICE'
  const isKila = post.type === 'KILA_MOMENT'

  const cardBorder = isBloodCall
    ? '2px solid rgba(185,28,28,.5)'
    : isGriot ? '1.5px solid rgba(99,102,241,.25)'
    : isNotice ? '1.5px solid rgba(212,160,23,.25)'
    : isKila ? '1.5px solid rgba(212,160,23,.35)'
    : '1px solid rgba(255,255,255,.06)'

  const cardBg = isBloodCall
    ? 'rgba(185,28,28,.08)'
    : isGriot ? 'rgba(99,102,241,.05)'
    : isNotice ? 'rgba(212,160,23,.04)'
    : isKila ? 'rgba(212,160,23,.06)'
    : 'rgba(255,255,255,.02)'

  const BODY_LIMIT = 180
  const bodyText = post.content
  const isTruncatable = bodyText.length > BODY_LIMIT

  const handleKila = () => {
    if (kilaed) return
    setKilaed(true); setKilaCount(n => n + 1)
    setShowStar(true); setTimeout(() => setShowStar(false), 800)
    onInteract?.('kila', post.id)
  }
  const handleStir = () => {
    setStirred(!stirred)
    setStirCount(n => stirred ? n - 1 : n + 1)
    onInteract?.('stir', post.id)
  }
  const handleUbuntu = () => {
    setUbuntud(!ubuntud)
    setUbuntuCount(n => ubuntud ? n - 1 : n + 1)
    onInteract?.('ubuntu', post.id)
  }

  return (
    <div
      className={isBloodCall ? 'blood-pulse' : ''}
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: 16,
        padding: '14px 14px 10px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Kíla star burst */}
      {showStar && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 36, zIndex: 10, pointerEvents: 'none',
          animation: 'starBurst .8s ease forwards',
        }}>⭐</div>
      )}

      {/* Type badge */}
      {isBloodCall && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
          padding: '6px 10px', borderRadius: 8,
          background: 'rgba(185,28,28,.15)', border: '1px solid rgba(185,28,28,.25)',
        }}>
          <span style={{ fontSize: 14 }}>🚨</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', letterSpacing: '.04em' }}>
            BLOOD CALL — {post.bloodCallType ?? 'URGENT'}
          </span>
        </div>
      )}
      {isGriot && (
        <div style={{
          fontSize: 9, fontWeight: 700, color: '#818cf8',
          letterSpacing: '.1em', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>🦅</span> AI GRIOT — GENERATED CONTENT
        </div>
      )}
      {isNotice && (
        <div style={{
          fontSize: 9, fontWeight: 700, color: '#d4a017',
          letterSpacing: '.1em', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>📯</span> VILLAGE NOTICE
        </div>
      )}
      {isKila && (
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '.08em', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span className="kila-shimmer">⭐ KÍLA MILESTONE</span>
        </div>
      )}

      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${post.avatarColor}, ${post.avatarColor}aa)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: 'Sora, sans-serif',
        }}>
          {post.author.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
              {post.author}
            </span>
            <NkisiShield nkisi={post.nkisi} />
            <CrestBadge tier={post.crestTier} />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(240,247,240,.4)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{post.villageEmoji} {post.village}</span>
            <span style={{ opacity: .4 }}>·</span>
            <span>{post.role}</span>
            <span style={{ opacity: .4 }}>·</span>
            <span>{post.time}</span>
          </div>
        </div>
        <DrumScopeIndicator scope={post.drumScope} />
      </div>

      {/* Body */}
      <div style={{ marginBottom: 10 }}>
        <p style={{
          fontSize: 14, lineHeight: 1.6, color: '#e5f0e5',
          margin: 0, wordBreak: 'break-word',
          display: '-webkit-box',
          WebkitLineClamp: expanded || !isTruncatable ? 999 : 3,
          WebkitBoxOrient: 'vertical',
          overflow: expanded || !isTruncatable ? 'visible' : 'hidden',
        }}>
          {bodyText}
        </p>
        {isTruncatable && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color: '#e07b00', marginTop: 4,
            }}
          >
            {expanded ? '↑ Show less' : '↓ Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 700, color: '#e07b00',
              padding: '2px 7px', borderRadius: 6,
              background: 'rgba(224,123,0,.1)', border: '1px solid rgba(224,123,0,.15)',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Heat */}
      <div style={{ marginBottom: 10 }}>
        <HeatBar heatScore={post.heatScore} compact />
      </div>

      {/* Interactions */}
      <InteractionBar
        post={{ ...post, kilaCount, stirCount, ubuntuCount }}
        onKila={handleKila} onStir={handleStir} onUbuntu={handleUbuntu}
        kilaed={kilaed} stirred={stirred} ubuntud={ubuntud}
        onGriotAsk={() => onInteract?.('griot', post.id)}
        onDrum={() => onInteract?.('drum', post.id)}
      />
    </div>
  )
}
