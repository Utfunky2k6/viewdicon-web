'use client'
// ═══════════════════════════════════════════════════════════════════
// GoLiveSheet — "Taking the Stage" ceremony
//
// Crest-gated access levels:
//   Crest I  (1+) → Village fire (village only)
//   Crest II (2+) → Nation broadcast
//   Crest III(3+) → Oracle Session (multi-speaker with talking stick)
//   Crest IV (4+) → Paid channel (subscriber-only)
//
// Flow: pick stream type → fill details → WHIP ingest key generated
// → POST /streams (jollof-tv-service) → navigate to StreamerControlPanel
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { VOCAB } from '@/constants/vocabulary'

type StreamType = 'market' | 'healing' | 'craft' | 'farm' | 'knowledge' | 'oracle'
type AccessLevel = 'village' | 'nation' | 'oracle' | 'paid'

interface GoLiveSheetProps {
  hostAfroId:   string
  villageSlug:  string
  villageEmoji: string
  crestTier:    number // 1–7
  onClose:      () => void
}

const STREAM_TYPES: Array<{ type: StreamType; emoji: string; label: string; desc: string }> = [
  { type: 'market',    emoji: '🛒', label: 'Market Fire',   desc: 'Sell products live to your village' },
  { type: 'craft',     emoji: '🎨', label: 'Craft Session', desc: 'Show your craft process in real time' },
  { type: 'farm',      emoji: '🌾', label: 'Harvest Auction', desc: 'Auction fresh produce to buyers' },
  { type: 'knowledge', emoji: '🎓', label: 'Knowledge Fire', desc: 'Teach with multi-language support' },
  { type: 'healing',   emoji: '⚕️', label: 'Healing Circle', desc: 'Verified health consultation' },
  { type: 'oracle',    emoji: '🦅', label: 'Oracle Session', desc: 'Multi-speaker debate with talking stick' },
]

const ACCESS_OPTIONS: Array<{ level: AccessLevel; emoji: string; label: string; minCrest: number; badge: string }> = [
  { level: 'village', emoji: '🏘',  label: VOCAB.geoVillage,   minCrest: 1, badge: 'Crest I' },
  { level: 'nation',  emoji: '🌍',  label: VOCAB.geoCountry,   minCrest: 2, badge: 'Crest II' },
  { level: 'oracle',  emoji: '🦅',  label: 'Oracle',           minCrest: 3, badge: 'Crest III' },
  { level: 'paid',    emoji: '🌳',  label: 'Paid Channel',     minCrest: 4, badge: 'Crest IV' },
]

const JOLLOF_TV_URL = process.env.NEXT_PUBLIC_JOLLOF_TV_URL ?? 'http://localhost:3046'

type Stage = 'pick-type' | 'fill-details' | 'launching' | 'error'

export function GoLiveSheet({ hostAfroId, villageSlug, villageEmoji, crestTier, onClose }: GoLiveSheetProps) {
  const router = useRouter()
  const [stage, setStage]       = React.useState<Stage>('pick-type')
  const [streamType, setStreamType] = React.useState<StreamType>('market')
  const [access, setAccess]     = React.useState<AccessLevel>('village')
  const [title, setTitle]       = React.useState('')
  const [paidPrice, setPaidPrice] = React.useState(500)
  const [errorMsg, setErrorMsg] = React.useState('')

  const handleLaunch = async () => {
    if (!title.trim()) { setErrorMsg('Give your fire a title'); return }
    setStage('launching')
    try {
      const res = await fetch(`/api/jollof/streams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-afro-id': hostAfroId },
        body: JSON.stringify({
          hostId:      hostAfroId,
          villageSlug,
          streamType,
          title:       title.trim(),
          access,
          paidPrice:   access === 'paid' ? paidPrice : undefined,
          status:      'LIVE',
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { id: string }
      router.push(`/dashboard/jollof/${data.id}`)
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start stream')
      setStage('error')
    }
  }

  const selectedTypeConfig = STREAM_TYPES.find(t => t.type === streamType)!

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: 'rgba(0,0,0,.72)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '88dvh', overflowY: 'auto',
          background: '#0d0804',
          border: '1px solid rgba(212,160,23,.25)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 40px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
              🔥 {VOCAB.goLive}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', marginTop: 2 }}>
              {villageEmoji} {villageSlug} · Crest {crestTier}
            </div>
          </div>
          {stage === 'fill-details' && (
            <button
              onClick={() => setStage('pick-type')}
              style={{
                padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)',
                background: 'transparent', color: 'rgba(240,247,240,.5)', fontSize: 11, cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
        </div>

        {/* ── Stage: pick type ──────────────────────────────────── */}
        {stage === 'pick-type' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em', marginBottom: 12 }}>
              CHOOSE YOUR FIRE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {STREAM_TYPES.map(st => (
                <button
                  key={st.type}
                  onClick={() => setStreamType(st.type)}
                  style={{
                    padding: '14px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: streamType === st.type ? 'rgba(212,160,23,.15)' : 'rgba(255,255,255,.04)',
                    outline: streamType === st.type ? '2px solid rgba(212,160,23,.5)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{st.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0', marginBottom: 3 }}>{st.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(240,247,240,.4)', lineHeight: 1.4 }}>{st.desc}</div>
                </button>
              ))}
            </div>

            {/* Access level */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em', marginBottom: 10 }}>
              BROADCAST REACH
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {ACCESS_OPTIONS.map(opt => {
                const locked = crestTier < opt.minCrest
                return (
                  <button
                    key={opt.level}
                    onClick={() => !locked && setAccess(opt.level)}
                    disabled={locked}
                    style={{
                      flex: '1 0 auto', padding: '10px 14px', borderRadius: 12, border: 'none',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      background: access === opt.level ? 'rgba(212,160,23,.18)' : 'rgba(255,255,255,.04)',
                      outline: access === opt.level ? '2px solid rgba(212,160,23,.5)' : 'none',
                      opacity: locked ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{opt.emoji}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#f0f7f0' }}>{opt.label}</div>
                    <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)', marginTop: 2 }}>
                      {locked ? `🔒 ${opt.badge}` : opt.badge}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStage('fill-details')}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #d4a017, #e07b00)',
                color: '#000', fontWeight: 900, fontSize: 15, fontFamily: 'Sora, sans-serif',
              }}
            >
              Next → Set Title
            </button>
          </>
        )}

        {/* ── Stage: fill details ───────────────────────────────── */}
        {stage === 'fill-details' && (
          <>
            {/* Selected type preview */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderRadius: 14, marginBottom: 20,
              background: 'rgba(212,160,23,.08)', border: '1px solid rgba(212,160,23,.2)',
            }}>
              <span style={{ fontSize: 28 }}>{selectedTypeConfig.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0' }}>{selectedTypeConfig.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(240,247,240,.4)' }}>{selectedTypeConfig.desc}</div>
              </div>
            </div>

            {/* Title input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,247,240,.4)', marginBottom: 8 }}>
                FIRE TITLE *
              </div>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={`e.g. Fresh ankara from Kano — today only`}
                maxLength={80}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                  color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Paid price (if paid access) */}
            {access === 'paid' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,247,240,.4)', marginBottom: 8 }}>
                  🌳 ENTRY PRICE (COWRIE)
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[200, 500, 1000, 2000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setPaidPrice(amt)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: paidPrice === amt ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.05)',
                        outline: paidPrice === amt ? '2px solid rgba(212,160,23,.5)' : 'none',
                        color: paidPrice === amt ? '#d4a017' : 'rgba(240,247,240,.5)',
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      ₡{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Oracle session note */}
            {streamType === 'oracle' && (
              <div style={{
                padding: '12px 14px', borderRadius: 12, marginBottom: 16,
                background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.18)',
                fontSize: 11, color: 'rgba(240,247,240,.6)', lineHeight: 1.5,
              }}>
                🪄 <strong style={{ color: '#d4a017' }}>Talking Stick mode:</strong> Up to 8 speakers.
                You hold the stick first — pass it by tapping a speaker avatar.
                Viewers raise hands; you decide who speaks.
              </div>
            )}

            {errorMsg && (
              <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{errorMsg}</div>
            )}

            <button
              onClick={handleLaunch}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #d4a017, #e07b00)',
                color: '#000', fontWeight: 900, fontSize: 15, fontFamily: 'Sora, sans-serif',
              }}
            >
              🔥 {VOCAB.goLive}
            </button>
          </>
        )}

        {/* ── Stage: launching ─────────────────────────────────── */}
        {stage === 'launching' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>
              Lighting the Fire…
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,247,240,.4)' }}>Setting up your stream</div>
          </div>
        )}

        {/* ── Stage: error ─────────────────────────────────────── */}
        {stage === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 16 }}>{errorMsg}</div>
            <button
              onClick={() => { setStage('fill-details'); setErrorMsg('') }}
              style={{
                padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'rgba(212,160,23,.2)', color: '#d4a017', fontWeight: 700, fontSize: 13,
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoLiveSheet
