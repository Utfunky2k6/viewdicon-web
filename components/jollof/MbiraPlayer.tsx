'use client'
// ═══════════════════════════════════════════════════════════════════
// MBIRA PLAYER — Floating persistent mini-player
// Mbira = thumb piano from Zimbabwe
// Persists across navigation via module-scope singleton + DOM events
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'

/* ── Inject-once CSS ── */
const CSS_ID = 'mbira-player-css'
const CSS = `
@keyframes mbiraPulse {
  0%, 100% { opacity: .5; transform: scale(.85); }
  50%       { opacity: 1;  transform: scale(1.1); }
}
@keyframes mbiraEq1 {
  0%,100% { height: 6px;  }
  33%     { height: 14px; }
  66%     { height: 9px;  }
}
@keyframes mbiraEq2 {
  0%,100% { height: 14px; }
  33%     { height: 6px;  }
  66%     { height: 18px; }
}
@keyframes mbiraEq3 {
  0%,100% { height: 9px;  }
  33%     { height: 18px; }
  66%     { height: 6px;  }
}
@keyframes mbiraSlideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes mbiraSlideDown {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(100%); opacity: 0; }
}
.mbira-live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #ef4444;
  animation: mbiraPulse .7s ease-in-out infinite;
  display: inline-block; flex-shrink: 0;
}
.mbira-eq-bar1 { animation: mbiraEq1 .8s ease-in-out infinite; }
.mbira-eq-bar2 { animation: mbiraEq2 .6s ease-in-out infinite .1s; }
.mbira-eq-bar3 { animation: mbiraEq3 1s ease-in-out infinite .2s; }
.mbira-enter   { animation: mbiraSlideUp .3s cubic-bezier(.4,0,.2,1) both; }
`

/* ── Module-scope singleton state ── */
export interface MbiraPlayerState {
  isVisible: boolean
  isPlaying: boolean
  type: 'stream' | 'podcast' | 'radio' | null
  title: string
  subtitle: string
  artworkEmoji: string
  accentColor: string
  currentTime: number
  duration: number
  streamUrl?: string
}

let PLAYER_STATE: MbiraPlayerState = {
  isVisible: false,
  isPlaying: false,
  type: null,
  title: '',
  subtitle: '',
  artworkEmoji: '🎵',
  accentColor: '#4ade80',
  currentTime: 0,
  duration: 0,
}

/* ── Static control functions (export for external pages) ── */
export function mbiraPlay(
  state: Partial<MbiraPlayerState> & { type: 'stream' | 'podcast' | 'radio'; title: string }
) {
  PLAYER_STATE = { ...PLAYER_STATE, ...state, isVisible: true, isPlaying: true }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mbira:update', { detail: { ...PLAYER_STATE } }))
  }
}

export function mbiraPause() {
  PLAYER_STATE = { ...PLAYER_STATE, isPlaying: false }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mbira:update', { detail: { ...PLAYER_STATE } }))
  }
}

export function mbiraClose() {
  PLAYER_STATE = { ...PLAYER_STATE, isVisible: false, isPlaying: false }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mbira:update', { detail: { ...PLAYER_STATE } }))
  }
}

/* ── Helper: format seconds → m:ss ── */
function fmtTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ── Type-specific defaults ── */
function typeDefaults(type: MbiraPlayerState['type']): { accentColor: string; artworkEmoji: string } {
  switch (type) {
    case 'stream':  return { accentColor: '#ef4444', artworkEmoji: '🎥' }
    case 'podcast': return { accentColor: '#4ade80', artworkEmoji: '🎙' }
    case 'radio':   return { accentColor: '#fbbf24', artworkEmoji: '📻' }
    default:        return { accentColor: '#4ade80', artworkEmoji: '🎵' }
  }
}

/* ══════════════════════════════════════════
   MBIRA PLAYER COMPONENT
══════════════════════════════════════════ */
export default function MbiraPlayer() {
  const [state, setState] = React.useState<MbiraPlayerState>({ ...PLAYER_STATE })
  const [expanded, setExpanded] = React.useState(false)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Inject CSS once ── */
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style')
    s.id = CSS_ID
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  /* ── Listen to mbira:update DOM events ── */
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<MbiraPlayerState>).detail
      PLAYER_STATE = { ...detail }
      setState({ ...detail })
    }
    window.addEventListener('mbira:update', handler)
    return () => window.removeEventListener('mbira:update', handler)
  }, [])

  /* ── Tick currentTime for podcasts when playing ── */
  React.useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (state.isPlaying && state.type === 'podcast') {
      intervalRef.current = setInterval(() => {
        PLAYER_STATE = {
          ...PLAYER_STATE,
          currentTime: Math.min(PLAYER_STATE.currentTime + 1, PLAYER_STATE.duration || Infinity),
        }
        setState(s => ({
          ...s,
          currentTime: Math.min(s.currentTime + 1, s.duration || Infinity),
        }))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isPlaying, state.type])

  /* ── Toggle play/pause ── */
  function togglePlay() {
    if (state.isPlaying) {
      mbiraPause()
    } else {
      const next: MbiraPlayerState = { ...PLAYER_STATE, isPlaying: true }
      PLAYER_STATE = next
      window.dispatchEvent(new CustomEvent('mbira:update', { detail: { ...next } }))
    }
  }

  if (!state.isVisible || !state.type) return null

  const defaults = typeDefaults(state.type)
  const accent = state.accentColor || defaults.accentColor
  const artwork = state.artworkEmoji || defaults.artworkEmoji
  const isLive = state.type === 'stream' || state.type === 'radio'
  const progress = (!isLive && state.duration > 0)
    ? (state.currentTime / state.duration) * 100
    : 0

  const containerHeight = expanded ? 140 : 56

  return (
    <div
      className="mbira-enter"
      style={{
        position: 'fixed',
        bottom: 64,
        left: 0,
        right: 0,
        zIndex: 9998,
        height: containerHeight,
        background: 'rgba(13,16,8,.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,.08)',
        transition: 'height .25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* ── Main row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 56,
          flexShrink: 0,
          padding: '0 12px',
          gap: 10,
        }}
      >
        {/* Artwork circle */}
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `${accent}22`,
            border: `1.5px solid ${accent}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, flexShrink: 0,
          }}
        >
          {artwork}
        </div>

        {/* Title + subtitle — tap to expand */}
        <div
          style={{ flex: 1, overflow: 'hidden', cursor: 'pointer', minWidth: 0 }}
          onClick={() => setExpanded(e => !e)}
        >
          <div style={{
            fontSize: 13, fontWeight: 600, fontFamily: 'Sora, sans-serif',
            color: 'rgba(255,255,255,.92)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {state.title}
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,.45)',
            fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: 5,
            marginTop: 1,
          }}>
            {/* Live indicator for stream/radio */}
            {state.type === 'stream' && (
              <>
                <span className="mbira-live-dot" style={{ background: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>LIVE</span>
                <span>·</span>
              </>
            )}
            {state.type === 'radio' && (
              <>
                <span className="mbira-live-dot" style={{ background: '#fbbf24' }} />
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>LIVE</span>
                <span>·</span>
              </>
            )}
            {/* EQ bars for radio */}
            {state.type === 'radio' && state.isPlaying && (
              <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 14, marginRight: 4 }}>
                {[1, 2, 3].map(i => (
                  <span
                    key={i}
                    className={`mbira-eq-bar${i}`}
                    style={{
                      width: 3, borderRadius: 2,
                      background: accent,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </span>
            )}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state.subtitle}
            </span>
          </div>
        </div>

        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `${accent}22`,
            border: `1.5px solid ${accent}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            color: accent, fontSize: 14,
          }}
          aria-label={state.isPlaying ? 'Pause' : 'Play'}
        >
          {state.isPlaying ? '⏸' : '▶'}
        </button>

        {/* Close button */}
        <button
          onClick={mbiraClose}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            color: 'rgba(255,255,255,.4)', fontSize: 12,
          }}
          aria-label="Close player"
        >
          ✕
        </button>
      </div>

      {/* ── Progress bar (non-live) at bottom of collapsed bar ── */}
      {!isLive && !expanded && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2, background: 'rgba(255,255,255,.07)',
        }}>
          <div style={{
            height: '100%', background: accent,
            width: `${progress}%`,
            transition: 'width .5s linear',
            borderRadius: '0 2px 2px 0',
          }} />
        </div>
      )}

      {/* ── Expanded panel ── */}
      {expanded && (
        <div style={{
          flex: 1, padding: '0 16px 12px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Time + seek bar for podcasts */}
          {state.type === 'podcast' && state.duration > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  height: 4, background: 'rgba(255,255,255,.12)',
                  borderRadius: 4, cursor: 'pointer', position: 'relative',
                }}
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                  const ratio = (e.clientX - rect.left) / rect.width
                  const newTime = ratio * state.duration
                  PLAYER_STATE = { ...PLAYER_STATE, currentTime: newTime }
                  setState(s => ({ ...s, currentTime: newTime }))
                }}
              >
                <div style={{
                  height: '100%', background: accent,
                  width: `${progress}%`,
                  borderRadius: 4,
                  transition: 'width .3s linear',
                }} />
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 10, color: 'rgba(255,255,255,.4)',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                <span>{fmtTime(state.currentTime)}</span>
                <span>{fmtTime(state.duration)}</span>
              </div>
            </div>
          )}

          {/* Stream: just LIVE indicator */}
          {state.type === 'stream' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mbira-live-dot" style={{ background: '#ef4444' }} />
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 1 }}>
                BROADCASTING LIVE
              </span>
            </div>
          )}

          {/* Radio: EQ bars */}
          {state.type === 'radio' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {state.isPlaying && (
                <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 3, height: 18 }}>
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      className={`mbira-eq-bar${i}`}
                      style={{
                        width: 4, borderRadius: 2,
                        background: accent,
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </span>
              )}
              <span style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 1 }}>
                ON AIR
              </span>
            </div>
          )}

          {/* Action row: speed (podcast only) + share */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'auto' }}>
            {state.type === 'podcast' && (
              <div style={{
                padding: '3px 10px', borderRadius: 20,
                background: `${accent}18`, border: `1px solid ${accent}40`,
                fontSize: 11, color: accent, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                1× Speed
              </div>
            )}
            <div style={{
              padding: '3px 10px', borderRadius: 20,
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)',
              fontSize: 11, color: 'rgba(255,255,255,.5)', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Share
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontSize: 10, color: 'rgba(255,255,255,.3)',
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
              }}
              onClick={() => setExpanded(false)}
            >
              Collapse ▾
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
