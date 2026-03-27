'use client'
// ============================================================
// TradeProofCard — Sealed trade celebration · System-generated
// Auto-emitted by god-bus when an Ogbo Ụtụ session seals
// ============================================================
import * as React from 'react'
import type { Post } from './feedTypes'
import { InteractionBar } from './InteractionBar'

interface TradeProofCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
}

const CSS_ID = 'trade-proof-css'
const CSS = `
@keyframes sealStamp{0%{transform:scale(0) rotate(-15deg);opacity:0}60%{transform:scale(1.15) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes goldShimmerBorder{0%,100%{border-color:rgba(212,160,23,.25)}50%{border-color:rgba(212,160,23,.6)}}
@keyframes confettiRain{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(40px) rotate(360deg);opacity:0}}
.trade-seal{animation:sealStamp .6s ease both}
.trade-border{animation:goldShimmerBorder 2.5s ease-in-out infinite}
`

export function TradeProofCard({ post, onInteract }: TradeProofCardProps) {
  const [ubuntud, setUbuntud] = React.useState(false)
  const [kilaed, setKilaed] = React.useState(false)
  const [ubuntuCount, setUbuntuCount] = React.useState(post.ubuntuCount)
  const [kilaCount, setKilaCount] = React.useState(post.kilaCount)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const confettiColors = ['#d4a017', '#22c55e', '#b22222', '#3b82f6', '#f5c542', '#a78bfa']

  return (
    <div
      className="trade-border"
      style={{
        background: 'rgba(212,160,23,.04)',
        border: '1.5px solid rgba(212,160,23,.25)',
        borderRadius: 16, overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Confetti particles */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, overflow: 'hidden', pointerEvents: 'none' }}>
        {confettiColors.map((color, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', width: 6, height: 6, borderRadius: '50%',
              background: color, left: `${14 + i * 12}%`, top: 0,
              animation: mounted ? `confettiRain ${1.2 + i * 0.15}s ease-out ${i * 0.1}s both` : 'none',
            }}
          />
        ))}
      </div>

      <div style={{ padding: '14px 14px 10px' }}>
        {/* System generated label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
          fontSize: 9, fontWeight: 700, color: 'rgba(212,160,23,.6)', letterSpacing: '.08em',
        }}>
          <span>🏛</span> SEALED TRADE · System Record · Nkisi Verified
        </div>

        {/* Seal stamp */}
        <div className={mounted ? 'trade-seal' : ''} style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 10px',
            background: 'linear-gradient(135deg, rgba(212,160,23,.2), rgba(212,160,23,.08))',
            border: '2px solid rgba(212,160,23,.4)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 24 }}>✓</div>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#d4a017', letterSpacing: '.05em' }}>SEALED</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: '#f0f7f0', marginBottom: 4 }}>
            Trade Complete
          </div>
          <div style={{ fontSize: 11, color: 'rgba(240,247,240,.5)' }}>
            {post.content}
          </div>
        </div>

        {/* Trade details */}
        <div style={{
          background: 'rgba(0,0,0,.3)', borderRadius: 12, padding: '10px 12px', marginBottom: 10,
        }}>
          {post.productName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(240,247,240,.4)' }}>Product</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>{post.productName}</span>
            </div>
          )}
          {post.tradeAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(240,247,240,.4)' }}>Amount</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                ₡{post.tradeAmount.toLocaleString()}
              </span>
            </div>
          )}

          {/* Participants */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: `linear-gradient(135deg, ${post.avatarColor}, #1a7c3e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff',
            }}>{post.author.charAt(0)}</div>
            <div style={{ flex: 1, fontSize: 10, color: 'rgba(240,247,240,.5)' }}>
              <span style={{ color: '#f0f7f0', fontWeight: 700 }}>{post.author}</span> ↔ <span style={{ color: '#f0f7f0', fontWeight: 700 }}>{post.tradePartner ?? 'Counterparty'}</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#1a7c3e', padding: '2px 6px', borderRadius: 5, background: 'rgba(26,124,62,.1)' }}>
              🛡 ESCROWED
            </div>
          </div>

          {/* Village + Runner */}
          <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 9, color: 'rgba(240,247,240,.35)' }}>
            <span>{post.villageEmoji} {post.village}</span>
            <span>·</span>
            <span>🚚 Runner dispatched</span>
            <span>·</span>
            <span>{post.time}</span>
          </div>
        </div>

        <InteractionBar
          post={{ ...post, kilaCount, ubuntuCount }}
          onKila={() => { if (!kilaed) { setKilaed(true); setKilaCount(n => n + 1) } }}
          onUbuntu={() => { setUbuntud(!ubuntud); setUbuntuCount(n => ubuntud ? n - 1 : n + 1) }}
          kilaed={kilaed} ubuntud={ubuntud}
          onGriotAsk={() => onInteract?.('griot', post.id)}
          onDrum={() => {}}
        />
      </div>
    </div>
  )
}
