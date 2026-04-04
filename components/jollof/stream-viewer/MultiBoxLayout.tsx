'use client'
// ═══════════════════════════════════════════════════════════════════
// MultiBoxLayout — Oracle Session multi-speaker video grid
//
// Renders speaker slots in the correct PiP/grid layout based on
// how many active speakers there are. Mirrors pip-compositor.ts
// server-side layout logic on the client.
//
// Layout modes:
//   single  (1)   → full screen
//   pip     (2)   → full + small overlay
//   split2  (2-4) → side by side halves
//   grid4   (4)   → 2×2
//   grid8   (5-8) → 4×2
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'

export interface SpeakerSlot {
  afroId:       string
  name:         string
  color:        string
  isSpeaking:   boolean
  isMuted:      boolean
  isCameraOff:  boolean
  isStickHolder?: boolean
}

interface MultiBoxLayoutProps {
  speakers:    SpeakerSlot[]
  stickHolder: string | null  // afroId
  onPassStick?: (toAfroId: string) => void
  isHost:      boolean
  hostAfroId:  string
}

type LayoutMode = 'single' | 'pip' | 'split2' | 'grid4' | 'grid8'

interface SlotGeometry { x: number; y: number; w: number; h: number }

function resolveLayout(count: number): LayoutMode {
  if (count <= 1) return 'single'
  if (count === 2) return 'pip'
  if (count <= 4) return 'grid4'
  return 'grid8'
}

function slotGeometry(mode: LayoutMode, position: number): SlotGeometry {
  switch (mode) {
    case 'single':
      return { x: 0, y: 0, w: 100, h: 100 }

    case 'pip':
      if (position === 0) return { x: 0, y: 0, w: 100, h: 100 }
      return { x: 69, y: 69, w: 29, h: 29 }

    case 'split2':
      return position === 0
        ? { x: 0, y: 0, w: 50, h: 100 }
        : { x: 50, y: 0, w: 50, h: 100 }

    case 'grid4': {
      const col = position % 2
      const row = Math.floor(position / 2)
      return { x: col * 50, y: row * 50, w: 50, h: 50 }
    }

    case 'grid8': {
      const col = position % 4
      const row = Math.floor(position / 4)
      return { x: col * 25, y: row * 50, w: 25, h: 50 }
    }
  }
}

const PULSE_CSS = `
@keyframes speakerGlow{0%{box-shadow:0 0 0 0 rgba(212,160,23,.5)}100%{box-shadow:0 0 0 8px rgba(212,160,23,0)}}
@keyframes stickFloat{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
`

export function MultiBoxLayout({
  speakers, stickHolder, onPassStick, isHost, hostAfroId,
}: MultiBoxLayoutProps) {
  const mode   = resolveLayout(speakers.length)
  const isPip  = mode === 'pip'

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('mbl-css')) {
      const s = document.createElement('style')
      s.id = 'mbl-css'
      s.textContent = PULSE_CSS
      document.head.appendChild(s)
    }
  }, [])

  if (speakers.length === 0) {
    return (
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,.3)',
      }}>
        <div style={{ fontSize: 12, color: 'rgba(240,247,240,.3)', fontFamily: 'Sora, sans-serif' }}>
          No speakers yet
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {speakers.map((sp, idx) => {
        const geo      = slotGeometry(mode, idx)
        const isHolder = sp.afroId === stickHolder
        const canPass  = isHost && isHolder && sp.afroId !== hostAfroId

        return (
          <div
            key={sp.afroId}
            style={{
              position: 'absolute',
              left:   `${geo.x}%`,
              top:    `${geo.y}%`,
              width:  `${geo.w}%`,
              height: `${geo.h}%`,
              padding: isPip && idx > 0 ? 0 : 2,
            }}
          >
            <div style={{
              width: '100%', height: '100%', borderRadius: isPip && idx > 0 ? 10 : 8,
              background: sp.isCameraOff
                ? 'rgba(0,0,0,.6)'
                : `linear-gradient(135deg, ${sp.color}40, ${sp.color}18)`,
              border: isHolder
                ? '2px solid rgba(212,160,23,.7)'
                : sp.isSpeaking
                  ? `2px solid ${sp.color}`
                  : '2px solid rgba(255,255,255,.1)',
              animation: sp.isSpeaking ? 'speakerGlow 1.2s ease-in-out infinite' : 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative',
            }}>
              {/* Avatar */}
              <div style={{
                width: isPip && idx > 0 ? 28 : Math.min(64, geo.w * 0.4),
                height: isPip && idx > 0 ? 28 : Math.min(64, geo.w * 0.4),
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${sp.color}, ${sp.color}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isPip && idx > 0 ? 12 : Math.min(24, geo.w * 0.15),
                fontWeight: 900, color: '#fff',
                marginBottom: isPip && idx > 0 ? 0 : 6,
              }}>
                {sp.name.charAt(0).toUpperCase()}
              </div>

              {/* Name (hidden in small pip) */}
              {!(isPip && idx > 0) && (
                <div style={{
                  fontSize: Math.max(8, Math.min(11, geo.w * 0.08)),
                  fontWeight: 700, color: 'rgba(240,247,240,.8)',
                  maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}>
                  {sp.name}
                </div>
              )}

              {/* Talking stick indicator */}
              {isHolder && (
                <div style={{
                  position: 'absolute', top: 4, left: 4,
                  fontSize: isPip && idx > 0 ? 10 : 14,
                  animation: 'stickFloat 2s ease-in-out infinite',
                }}>
                  🪄
                </div>
              )}

              {/* Mute indicator */}
              {sp.isMuted && (
                <div style={{
                  position: 'absolute', bottom: 4, right: 4,
                  fontSize: 10, background: 'rgba(239,68,68,.25)',
                  borderRadius: 4, padding: '1px 4px',
                }}>
                  🔇
                </div>
              )}

              {/* Pass stick button (host only, on stick holder) */}
              {canPass && onPassStick && (
                <button
                  onClick={() => onPassStick(sp.afroId)}
                  style={{
                    position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                    padding: '3px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(212,160,23,.3)', color: '#d4a017',
                    fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap',
                  }}
                >
                  🪄 Pass
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MultiBoxLayout
