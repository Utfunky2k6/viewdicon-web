'use client'
// ═══════════════════════════════════════════════════════════════════
// AddToPotSheet — Commerce Bridge: Live Stream → Business Chat
//
// Flow:
//   1. Viewer taps "🫙 Add to Pot" on a pinned product card
//   2. Sheet rises with product details + escrow explainer
//   3. Confirm → POST /streams/:id/add-to-pot → receive sessionId
//   4. Navigate to /dashboard/sessions/:sessionId (Business Chat)
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { VOCAB } from '@/constants/vocabulary'

export interface PinnedProduct {
  id:            string
  name:          string
  price:         number
  imageUrl?:     string
  soldCount:     number
  marketPercent: number
}

interface AddToPotSheetProps {
  streamId:     string
  product:      PinnedProduct
  streamerName: string
  buyerAfroId:  string
  onClose:      () => void
}

type Stage = 'idle' | 'confirming' | 'success' | 'error'

export function AddToPotSheet({
  streamId, product, streamerName, buyerAfroId, onClose,
}: AddToPotSheetProps) {
  const router = useRouter()
  const [stage, setStage]     = React.useState<Stage>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')
  const [sessionId, setSessionId] = React.useState('')

  const handleConfirm = async () => {
    setStage('confirming')
    setErrorMsg('')
    try {
      const res = await fetch(`/api/jollof/streams/${streamId}/add-to-pot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, buyerId: buyerAfroId }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as { sessionId: string; chatId: string }
      setSessionId(data.sessionId)
      setStage('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStage('error')
    }
  }

  const handleGoToChat = () => {
    router.push(`/dashboard/sessions/${sessionId}`)
    onClose()
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(0,0,0,.65)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      {/* Sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '80dvh', overflowY: 'auto',
          background: '#12100a',
          border: '1px solid rgba(224,123,0,.25)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 36px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,.15)',
          margin: '0 auto 20px',
        }} />

        {/* ── Product card ───────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 14, alignItems: 'flex-start',
          marginBottom: 20, padding: '14px 16px', borderRadius: 16,
          background: 'rgba(224,123,0,.06)', border: '1px solid rgba(224,123,0,.18)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 14, flexShrink: 0,
            background: product.imageUrl
              ? `url(${product.imageUrl}) center/cover`
              : 'linear-gradient(135deg, #e07b00, #d4a017)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {!product.imageUrl && '🛒'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f7f0', marginBottom: 4, fontFamily: 'Sora, sans-serif' }}>
              {product.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                ₡{product.price.toLocaleString()}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                background: product.marketPercent < 100
                  ? 'rgba(34,197,94,.12)' : 'rgba(255,255,255,.06)',
                color: product.marketPercent < 100 ? '#4ade80' : 'rgba(240,247,240,.4)',
              }}>
                {product.marketPercent}% of market price
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(240,247,240,.4)' }}>
              {product.soldCount} sold · from {streamerName}
            </div>
          </div>
        </div>

        {/* ── Escrow explainer ──────────────────────────────────── */}
        <div style={{
          padding: '14px 16px', borderRadius: 14, marginBottom: 20,
          background: 'rgba(26,124,62,.06)', border: '1px solid rgba(26,124,62,.18)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', marginBottom: 10, letterSpacing: '.04em' }}>
            🔒 NKISI ESCROW PROTECTION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🫙', text: 'Your Cowries are locked — seller cannot touch them until delivery.' },
              { icon: '🚚', text: 'A verified Runner collects and delivers your item.' },
              { icon: '✅', text: 'You confirm receipt before Cowries are released to seller.' },
              { icon: '🛡', text: 'If there is a dispute, Elders arbitrate.' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <span style={{ fontSize: 11, color: 'rgba(240,247,240,.65)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Runner dispatch notice ─────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          borderRadius: 12, marginBottom: 22,
          background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.18)',
        }}>
          <span style={{ fontSize: 22 }}>🏍️</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#d4a017', marginBottom: 2 }}>
              RUNNER WILL BE DISPATCHED
            </div>
            <div style={{ fontSize: 10, color: 'rgba(240,247,240,.5)' }}>
              Once the seller confirms, the nearest available Runner is assigned automatically.
            </div>
          </div>
        </div>

        {/* ── Action area ───────────────────────────────────────── */}
        {stage === 'idle' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,.06)',
                color: 'rgba(240,247,240,.6)', fontWeight: 700, fontSize: 14,
              }}
            >
              {VOCAB.cancel}
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 2, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #e07b00, #d4a017)',
                color: '#000', fontWeight: 900, fontSize: 15, fontFamily: 'Sora, sans-serif',
              }}
            >
              {VOCAB.buyNow} · ₡{product.price.toLocaleString()}
            </button>
          </div>
        )}

        {stage === 'confirming' && (
          <div style={{ textAlign: 'center', padding: '14px 0', color: 'rgba(240,247,240,.5)', fontSize: 13 }}>
            <span style={{ display: 'block', fontSize: 28, marginBottom: 8, animation: 'spin 1s linear infinite' }}>🐚</span>
            Locking Escrow…
          </div>
        )}

        {stage === 'success' && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
              Pot Sealed!
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', marginBottom: 18 }}>
              Business Chat opened with {streamerName}. Discuss delivery details.
            </div>
            <button
              onClick={handleGoToChat}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #1a7c3e, #22c55e)',
                color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'Sora, sans-serif',
              }}
            >
              💬 Go to Business Chat →
            </button>
          </div>
        )}

        {stage === 'error' && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 16 }}>{errorMsg}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'rgba(255,255,255,.06)', color: 'rgba(240,247,240,.5)', fontWeight: 700, fontSize: 13,
                }}
              >
                {VOCAB.cancel}
              </button>
              <button
                onClick={() => { setStage('idle'); setErrorMsg('') }}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'rgba(224,123,0,.2)', color: '#e07b00', fontWeight: 700, fontSize: 13,
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddToPotSheet
