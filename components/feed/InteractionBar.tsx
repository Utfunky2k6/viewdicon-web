'use client'
// ============================================================
// InteractionBar — 7 African Interaction Buttons
// Kíla · Stir · Ubuntu · Drum · Spray · Trade · Griot Ask
// ============================================================
import * as React from 'react'
import type { Post } from './feedTypes'
import { VOCAB } from '@/constants/vocabulary'

interface InteractionBarProps {
  post: Post
  onKila?: () => void
  onStir?: () => void
  onUbuntu?: () => void
  onDrum?: () => void
  onSpray?: () => void
  onTrade?: () => void
  onGriotAsk?: () => void
  onComment?: () => void
  onShare?: () => void
  onBookmark?: () => void
  kilaed?: boolean
  stirred?: boolean
  ubuntud?: boolean
  bookmarked?: boolean
}

const CSS = `
@keyframes ib-kila-burst{0%{transform:scale(1)}30%{transform:scale(1.35)}60%{transform:scale(.9)}100%{transform:scale(1)}}
@keyframes ib-star-fly{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}}
@keyframes ib-drum-pulse{0%,100%{box-shadow:0 0 0 0 rgba(26,124,62,.4)}50%{box-shadow:0 0 0 6px rgba(26,124,62,0)}}
@keyframes ib-spray-shine{0%,100%{opacity:.6}50%{opacity:1}}
`

export function InteractionBar({
  post, onKila, onStir, onUbuntu, onDrum, onSpray, onTrade, onGriotAsk,
  onComment, onShare, onBookmark,
  kilaed = false, stirred = false, ubuntud = false, bookmarked = false,
}: InteractionBarProps) {
  const [kilaBurst, setKilaBurst] = React.useState(false)
  const [sparkles, setSparkles] = React.useState<Array<{ id: number; dx: number; dy: number }>>([])
  const [kilaLeft] = React.useState(3)
  const [tradeOpen, setTradeOpen] = React.useState(false)
  const [griotAsked, setGriotAsked] = React.useState(false)
  const [drummed, setDrummed] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('ib-css')) {
      const s = document.createElement('style')
      s.id = 'ib-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  const handleKila = () => {
    if (kilaed) return
    setKilaBurst(true)
    // spawn 3 sparkles
    const newSparkles = [
      { id: Date.now(),     dx: -22, dy: -28 },
      { id: Date.now() + 1, dx: 18,  dy: -32 },
      { id: Date.now() + 2, dx: 2,   dy: -38 },
    ]
    setSparkles(newSparkles)
    setTimeout(() => { setKilaBurst(false); setSparkles([]) }, 800)
    onKila?.()
  }

  const handleDrum = () => { setDrummed(true); onDrum?.() }
  const handleTrade = () => { setTradeOpen(true); onTrade?.() }
  const handleGriot = () => { setGriotAsked(true); onGriotAsk?.() }

  const isMarket = post.type === 'MARKET_LISTING'
  const isVoice  = post.type === 'VOICE_STORY'
  const canSpray = isVoice || isMarket || post.type === 'TEXT_DRUM'
  const isVillageScope = post.drumScope === 1

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '5px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Sora', sans-serif",
    transition: 'all .15s', lineHeight: 1, border: '1px solid',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Kíla sparkles */}
      {sparkles.map(sp => (
        <span key={sp.id} style={{
          position: 'absolute', top: 0, left: 24,
          fontSize: 14, pointerEvents: 'none', zIndex: 10,
          '--dx': `${sp.dx}px`, '--dy': `${sp.dy}px`,
          animation: 'ib-star-fly .7s ease-out forwards',
        } as React.CSSProperties}>
          ⭐
        </span>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        {/* ⭐ Kíla */}
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <button onClick={handleKila} style={{
            ...btnBase,
            color: kilaed ? '#d4a017' : 'rgba(212,160,23,.6)',
            background: kilaed ? 'rgba(212,160,23,.18)' : 'rgba(212,160,23,.06)',
            borderColor: kilaed ? 'rgba(212,160,23,.5)' : 'rgba(212,160,23,.2)',
            animation: kilaBurst ? 'ib-kila-burst .5s ease' : 'none',
          }}>
            ⭐ {post.kilaCount > 0 && post.kilaCount}
          </button>
          {!kilaed && (
            <span style={{
              position: 'absolute', top: -8, right: -8,
              fontSize: 8, fontWeight: 800, color: '#d4a017',
              background: 'rgba(212,160,23,.2)', border: '1px solid rgba(212,160,23,.3)',
              borderRadius: 99, padding: '1px 4px', whiteSpace: 'nowrap',
            }}>
              {kilaLeft} left
            </span>
          )}
        </div>

        {/* 🔥 Stir */}
        <button onClick={onStir} style={{
          ...btnBase,
          color: stirred ? '#f97316' : 'rgba(249,115,22,.55)',
          background: stirred ? 'rgba(249,115,22,.18)' : 'rgba(249,115,22,.06)',
          borderColor: stirred ? 'rgba(249,115,22,.45)' : 'rgba(249,115,22,.2)',
        }}>
          🔥 {post.stirCount > 0 && post.stirCount}
        </button>

        {/* 🤝 Ubuntu */}
        <button onClick={onUbuntu} style={{
          ...btnBase,
          color: ubuntud ? '#0ea5e9' : 'rgba(14,165,233,.55)',
          background: ubuntud ? 'rgba(14,165,233,.18)' : 'rgba(14,165,233,.06)',
          borderColor: ubuntud ? 'rgba(14,165,233,.45)' : 'rgba(14,165,233,.2)',
        }}>
          🤝 {post.ubuntuCount > 0 && post.ubuntuCount}
        </button>

        {/* 🥁 Drum — only for village scope */}
        {isVillageScope && (
          <button onClick={handleDrum} style={{
            ...btnBase,
            color: drummed ? '#1a7c3e' : 'rgba(26,124,62,.55)',
            background: drummed ? 'rgba(26,124,62,.18)' : 'rgba(26,124,62,.06)',
            borderColor: drummed ? 'rgba(26,124,62,.45)' : 'rgba(26,124,62,.2)',
            animation: !drummed ? 'ib-drum-pulse 2.5s ease-in-out infinite' : 'none',
          }}>
            🥁 {drummed ? 'Drummed ✓' : 'Drum to Region'}
          </button>
        )}

        {/* 💸 Spray — voice + market */}
        {canSpray && (
          <button onClick={onSpray} style={{
            ...btnBase,
            color: 'rgba(212,160,23,.7)',
            background: 'rgba(212,160,23,.07)',
            borderColor: 'rgba(212,160,23,.25)',
            animation: 'ib-spray-shine 2s ease-in-out infinite',
          }}>
            {VOCAB.tip}
          </button>
        )}

        {/* 🛒 Trade — market only */}
        {isMarket && (
          <button onClick={handleTrade} style={{
            ...btnBase,
            color: tradeOpen ? '#e07b00' : 'rgba(224,123,0,.6)',
            background: tradeOpen ? 'rgba(224,123,0,.22)' : 'rgba(224,123,0,.07)',
            borderColor: tradeOpen ? 'rgba(224,123,0,.5)' : 'rgba(224,123,0,.25)',
          }}>
            🛒 {tradeOpen ? 'Session Open' : 'Open Trade'}
          </button>
        )}

        {/* 🦅 Griot Ask */}
        <button onClick={handleGriot} style={{
          ...btnBase,
          color: griotAsked ? '#1a7c3e' : 'rgba(26,124,62,.5)',
          background: griotAsked ? 'rgba(26,124,62,.16)' : 'rgba(26,124,62,.05)',
          borderColor: griotAsked ? 'rgba(26,124,62,.4)' : 'rgba(26,124,62,.18)',
        }}>
          {griotAsked ? '🦅 Listening…' : VOCAB.askGriot}
        </button>

        {/* ── Second row: Comment · Share · Bookmark ── */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* 💬 Comment */}
          <button onClick={onComment} style={{
            ...btnBase,
            color: 'rgba(255,255,255,.45)',
            background: 'rgba(255,255,255,.04)',
            borderColor: 'rgba(255,255,255,.1)',
            fontSize: 10,
          }}>
            💬 {post.commentCount > 0 ? post.commentCount : 'Comment'}
          </button>

          {/* ↗ Share */}
          <button onClick={onShare} style={{
            ...btnBase,
            color: 'rgba(255,255,255,.35)',
            background: 'rgba(255,255,255,.03)',
            borderColor: 'rgba(255,255,255,.08)',
            padding: '5px 7px',
          }}>
            ↗
          </button>

          {/* 🔖 Bookmark */}
          <button onClick={onBookmark} style={{
            ...btnBase,
            color: bookmarked ? '#fbbf24' : 'rgba(255,255,255,.3)',
            background: bookmarked ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.03)',
            borderColor: bookmarked ? 'rgba(251,191,36,.35)' : 'rgba(255,255,255,.08)',
            padding: '5px 7px',
          }}>
            {bookmarked ? '🔖' : '🏷'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InteractionBar
