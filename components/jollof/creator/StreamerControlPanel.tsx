'use client'
// ═══════════════════════════════════════════════════════════════════
// StreamerControlPanel — Live broadcaster HUD
//
// Features:
//   - Live viewer count + Cowrie spray total
//   - Talking stick queue (Oracle mode)
//   - Pin/unpin product
//   - End stream confirmation
//   - Quick-action strip (mute, camera, spray total)
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { VOCAB } from '@/constants/vocabulary'

interface Speaker {
  afroId: string
  name:   string
  avatar: string
  isHandRaised: boolean
}

interface PinnedProduct {
  id:    string
  name:  string
  price: number
  soldCount: number
}

interface StreamerControlPanelProps {
  streamId:         string
  streamType:       'market' | 'healing' | 'craft' | 'farm' | 'knowledge' | 'oracle'
  viewerCount:      number
  sprayCowrieTotal: number
  speakers?:        Speaker[]
  pinnedProduct?:   PinnedProduct
  isOracleMode?:    boolean
  onEndStream:      () => void
  onPassStick?:     (toAfroId: string) => void
  onAdmitSpeaker?:  (afroId: string) => void
  onPinProduct?:    (productId: string) => void
}

const ACCENT_MAP: Record<string, string> = {
  market:    '#e07b00',
  healing:   '#0369a1',
  craft:     '#7c3aed',
  farm:      '#1a7c3e',
  knowledge: '#4f46e5',
  oracle:    '#d4a017',
}

export function StreamerControlPanel({
  streamId, streamType, viewerCount, sprayCowrieTotal,
  speakers = [], pinnedProduct, isOracleMode = false,
  onEndStream, onPassStick, onAdmitSpeaker,
}: StreamerControlPanelProps) {
  const [muted, setMuted]           = React.useState(false)
  const [cameraOff, setCameraOff]   = React.useState(false)
  const [showEndConfirm, setShowEndConfirm] = React.useState(false)
  const [showStickMenu, setShowStickMenu]   = React.useState(false)
  const [elapsedSecs, setElapsedSecs] = React.useState(0)

  const accent = ACCENT_MAP[streamType] ?? '#d4a017'

  React.useEffect(() => {
    const t = setInterval(() => setElapsedSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const elapsed = (() => {
    const h = Math.floor(elapsedSecs / 3600)
    const m = Math.floor((elapsedSecs % 3600) / 60)
    const s = elapsedSecs % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })()

  const raisedHands = speakers.filter(sp => sp.isHandRaised)

  return (
    <>
      {/* ── Compact HUD bar at top ────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(12px)',
        borderRadius: 14,
      }}>
        {/* LIVE badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 8,
          background: 'rgba(239,68,68,.2)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: '#ef4444',
            animation: 'liveBlink 1s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444' }}>LIVE</span>
        </div>

        {/* Duration */}
        <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
          {elapsed}
        </span>

        <div style={{ flex: 1 }} />

        {/* Viewers */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,.08)',
        }}>
          <span style={{ fontSize: 12 }}>👁</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>
            {viewerCount.toLocaleString()}
          </span>
        </div>

        {/* Spray total */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 8, background: 'rgba(212,160,23,.12)',
        }}>
          <span style={{ fontSize: 12 }}>🐚</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#d4a017' }}>
            ₡{sprayCowrieTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Oracle talking-stick queue ────────────────────────── */}
      {isOracleMode && raisedHands.length > 0 && (
        <div style={{
          marginTop: 10, padding: '12px 14px',
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
          borderRadius: 14, border: `1px solid ${accent}30`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em', marginBottom: 10 }}>
            🪄 TALKING STICK QUEUE — {raisedHands.length} raised hand{raisedHands.length > 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {raisedHands.map(sp => (
              <div key={sp.afroId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff',
                }}>
                  {sp.name.charAt(0)}
                </div>
                <span style={{ flex: 1, fontSize: 12, color: '#f0f7f0', fontWeight: 600 }}>{sp.name}</span>
                <button
                  onClick={() => onAdmitSpeaker?.(sp.afroId)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: `${accent}20`, color: accent, fontSize: 11, fontWeight: 700,
                  }}
                >
                  {VOCAB.talkingStick} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Control buttons ───────────────────────────────────── */}
      <div style={{
        marginTop: 12, display: 'flex', gap: 10, alignItems: 'center',
        padding: '10px 14px',
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
        borderRadius: 14,
      }}>
        {/* Mute */}
        <button
          onClick={() => setMuted(m => !m)}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: muted ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.06)',
            color: muted ? '#ef4444' : 'rgba(240,247,240,.6)',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          {muted ? '🔇' : '🎙'}
        </button>

        {/* Camera */}
        <button
          onClick={() => setCameraOff(c => !c)}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: cameraOff ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.06)',
            color: cameraOff ? '#ef4444' : 'rgba(240,247,240,.6)',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {cameraOff ? '📷' : '📸'}
        </button>

        {/* Pinned product indicator */}
        {pinnedProduct && (
          <div style={{
            flex: 2, padding: '8px 12px', borderRadius: 12,
            background: 'rgba(224,123,0,.12)', border: '1px solid rgba(224,123,0,.25)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>🛒</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#e07b00', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {pinnedProduct.name}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>
                ₡{pinnedProduct.price.toLocaleString()} · {pinnedProduct.soldCount} sold
              </div>
            </div>
          </div>
        )}

        {/* End stream */}
        <button
          onClick={() => setShowEndConfirm(true)}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(239,68,68,.15)', color: '#ef4444',
            fontSize: 11, fontWeight: 800,
          }}
        >
          🕯 End
        </button>
      </div>

      {/* ── End stream confirm modal ──────────────────────────── */}
      {showEndConfirm && (
        <div
          onClick={() => setShowEndConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 360,
              background: '#1a1005', borderRadius: 20,
              border: '1px solid rgba(239,68,68,.25)',
              padding: '28px 24px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🕯</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f0f7f0', fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>
                {VOCAB.endStream}?
              </div>
              <div style={{ fontSize: 12, color: 'rgba(240,247,240,.4)' }}>
                {viewerCount.toLocaleString()} viewers are watching. Your stream will be saved as a reel.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'rgba(255,255,255,.06)', color: '#f0f7f0', fontWeight: 700, fontSize: 13,
                }}
              >
                {VOCAB.cancel}
              </button>
              <button
                onClick={() => { setShowEndConfirm(false); onEndStream() }}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'rgba(239,68,68,.25)', color: '#ef4444', fontWeight: 800, fontSize: 13,
                }}
              >
                🕯 End Fire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suppress unused variable warning */}
      {showStickMenu && null}
    </>
  )
}

export default StreamerControlPanel
