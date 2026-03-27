'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface VoiceStoryPlayerProps {
  post: {
    id: string
    author: string
    village: string
    villageEmoji: string
    audioDurationSec: number
    waveformBars: number[]
    content: string
  }
  onClose: () => void
}

type LanguageCode = 'en' | 'yo' | 'ig' | 'ha' | 'sw' | 'am' | 'zu' | 'fr'

const LANGUAGES: { code: LanguageCode; flag: string; label: string }[] = [
  { code: 'en', flag: '🌐', label: 'EN' },
  { code: 'yo', flag: '🇳🇬', label: 'YO' },
  { code: 'ig', flag: '🇳🇬', label: 'IG' },
  { code: 'ha', flag: '🇳🇬', label: 'HA' },
  { code: 'sw', flag: '🇰🇪', label: 'SW' },
  { code: 'am', flag: '🇪🇹', label: 'AM' },
  { code: 'zu', flag: '🇿🇦', label: 'ZU' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
]

// Translation placeholders -- populated by Spirit Voice backend
const TRANSLATION_PLACEHOLDERS: Record<LanguageCode, string> = {
  en: '',
  yo: '',
  ig: '',
  ha: '',
  sw: '',
  am: '',
  zu: '',
  fr: '',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase()
}

const NUM_BARS = 40

export default function VoiceStoryPlayer({ post, onClose }: VoiceStoryPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0) // 0–100
  const [activeLang, setActiveLang] = useState<LanguageCode>('en')
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Derive normalised waveform bars (40 bars, heights 20–100)
  const waveformBars = React.useMemo(() => {
    const source =
      post.waveformBars && post.waveformBars.length > 0
        ? post.waveformBars
        : Array.from({ length: NUM_BARS }, () => Math.random() * 80 + 20)

    // Resample to exactly NUM_BARS
    const out: number[] = []
    for (let i = 0; i < NUM_BARS; i++) {
      const idx = Math.round((i / NUM_BARS) * (source.length - 1))
      out.push(Math.max(10, Math.min(100, source[idx] ?? 40)))
    }
    return out
  }, [post.waveformBars])

  // Current elapsed seconds
  const elapsed = Math.floor((playProgress / 100) * post.audioDurationSec)

  // Animate slide-up on mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Inject CSS
  useEffect(() => {
    const CSS_ID = 'voice-player-css'
    if (document.getElementById(CSS_ID)) return

    const style = document.createElement('style')
    style.id = CSS_ID
    style.textContent = `
      @keyframes vp-slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes vp-speakerPulse {
        0%, 100% { box-shadow: 0 0 0 0px rgba(212, 175, 55, 0.6), 0 0 0 8px rgba(212, 175, 55, 0.2); }
        50%       { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0.4), 0 0 0 16px rgba(212, 175, 55, 0.1); }
      }
      @keyframes vp-barBreathe {
        0%, 100% { opacity: 0.55; transform: scaleY(1); }
        50%       { opacity: 1;    transform: scaleY(1.12); }
      }
      .vp-playing-bar {
        animation: vp-barBreathe 1.4s ease-in-out infinite;
      }
      .vp-ring-pulse {
        animation: vp-speakerPulse 2s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)

    return () => {
      // Leave the style tag; multiple player instances may share it
    }
  }, [])

  // Playback tick
  const tick = useCallback(() => {
    setPlayProgress(prev => {
      if (prev >= 100) {
        setIsPlaying(false)
        return 100
      }
      // Each tick = 500ms; total duration in ms = audioDurationSec * 1000
      const step = (500 / (post.audioDurationSec * 1000)) * 100
      return Math.min(100, prev + step)
    })
  }, [post.audioDurationSec])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, tick])

  // Stop interval when unmounting
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const togglePlay = () => {
    if (playProgress >= 100) {
      setPlayProgress(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }

  const rewind = () => {
    const step = (10 / post.audioDurationSec) * 100
    setPlayProgress(prev => Math.max(0, prev - step))
  }

  const forward = () => {
    const step = (10 / post.audioDurationSec) * 100
    setPlayProgress(prev => Math.min(100, prev + step))
  }

  const seekBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setPlayProgress(Math.max(0, Math.min(100, pct)))
  }

  // How many bars are "played"
  const playedBars = Math.round((playProgress / 100) * NUM_BARS)

  // ── Styles ──────────────────────────────────────────────────

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  }

  const panel: React.CSSProperties = {
    width: '100%',
    maxWidth: 480,
    background: 'linear-gradient(180deg, #1a1209 0%, #0d0d0d 100%)',
    borderRadius: '20px 20px 0 0',
    padding: '24px 20px 40px',
    position: 'relative',
    transform: mounted ? 'translateY(0)' : 'translateY(100%)',
    opacity: mounted ? 1 : 0,
    transition: 'transform 0.4s ease, opacity 0.4s ease',
    maxHeight: '95vh',
    overflowY: 'auto',
  }

  const closeBtn: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  }

  const villageBadge: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(212, 175, 55, 0.12)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    color: '#d4af37',
    marginBottom: 20,
    marginTop: 4,
  }

  const avatarWrap: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  }

  const avatarRing: React.CSSProperties = {
    width: 88,
    height: 88,
    borderRadius: '50%',
    padding: 3,
    background: 'linear-gradient(135deg, #d4af37, #b8860b, #8b6914)',
    ...(isPlaying ? {} : {}), // ring pulse applied via className
  }

  const avatarInner: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3d2b1f, #1a0f08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontWeight: 700,
    color: '#d4af37',
  }

  const authorName: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
  }

  const roleText: React.CSSProperties = {
    fontSize: 12,
    color: '#d4af37',
    margin: 0,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }

  const divider: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  }

  const dividerLine: React.CSSProperties = {
    flex: 1,
    height: 1,
    background: 'rgba(212,175,55,0.2)',
  }

  const dividerLabel: React.CSSProperties = {
    fontSize: 10,
    color: 'rgba(212,175,55,0.6)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  }

  const waveformContainer: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    height: 64,
    marginBottom: 12,
    cursor: 'pointer',
    position: 'relative',
  }

  // Gold dot position
  const dotLeftPct = playProgress

  const progressTrack: React.CSSProperties = {
    position: 'relative',
    height: 3,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 6,
    cursor: 'pointer',
  }

  const progressFill: React.CSSProperties = {
    height: '100%',
    width: `${playProgress}%`,
    background: 'linear-gradient(90deg, #d4af37, #f0c040)',
    borderRadius: 4,
    transition: 'width 0.1s linear',
  }

  const scrubberDot: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: `${dotLeftPct}%`,
    transform: 'translate(-50%, -50%)',
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#f0c040',
    boxShadow: '0 0 6px rgba(212,175,55,0.8)',
    transition: 'left 0.1s linear',
    pointerEvents: 'none',
  }

  const timeRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 24,
  }

  const controlRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 28,
  }

  const skipBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: 0,
  }

  const skipLabel: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  }

  const playCircle: React.CSSProperties = {
    width: 68,
    height: 68,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d4af37, #b8860b)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
    transition: 'transform 0.15s ease',
  }

  const langStripLabel: React.CSSProperties = {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 10,
  }

  const langStrip: React.CSSProperties = {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    marginBottom: 16,
    paddingBottom: 4,
  }

  const transcriptBox: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: 12,
    padding: '14px 16px',
    fontSize: 14,
    lineHeight: 1.65,
    color: 'rgba(255,255,255,0.82)',
    fontStyle: 'italic',
  }

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={panel}>
        {/* Close */}
        <button style={closeBtn} onClick={onClose} aria-label="Close player">
          ✕
        </button>

        {/* Village badge */}
        <div style={{ textAlign: 'center' }}>
          <span style={villageBadge}>
            {post.villageEmoji} {post.village}
          </span>
        </div>

        {/* Avatar + author */}
        <div style={avatarWrap}>
          <div
            style={avatarRing}
            className={isPlaying ? 'vp-ring-pulse' : ''}
          >
            <div style={avatarInner}>{getInitial(post.author)}</div>
          </div>
          <p style={authorName}>{post.author}</p>
          <p style={roleText}>Voice Story</p>
        </div>

        {/* Section divider */}
        <div style={divider}>
          <div style={dividerLine} />
          <span style={dividerLabel}>Voice Story</span>
          <div style={dividerLine} />
        </div>

        {/* Waveform */}
        <div style={waveformContainer} onClick={seekBar}>
          {waveformBars.map((h, i) => {
            const isPlayed = i < playedBars
            const isCurrent = i === playedBars
            return (
              <div
                key={i}
                className={isPlaying && isPlayed ? 'vp-playing-bar' : ''}
                style={{
                  width: 4,
                  height: `${h}%`,
                  borderRadius: 2,
                  background: isPlayed
                    ? `linear-gradient(180deg, #f0c040 0%, #d4af37 100%)`
                    : isCurrent
                    ? '#d4af37'
                    : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.1s',
                  transformOrigin: 'bottom',
                  animationDelay: isPlaying ? `${(i % 7) * 0.09}s` : '0s',
                }}
              />
            )
          })}
          {/* Gold position dot over waveform */}
          <div
            style={{
              position: 'absolute',
              bottom: -6,
              left: `${dotLeftPct}%`,
              transform: 'translateX(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f0c040',
              boxShadow: '0 0 6px #d4af37',
              pointerEvents: 'none',
              transition: 'left 0.1s linear',
            }}
          />
        </div>

        {/* Progress bar + scrubber */}
        <div style={progressTrack} onClick={seekBar}>
          <div style={progressFill} />
          <div style={scrubberDot} />
        </div>

        {/* Time */}
        <div style={timeRow}>
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(post.audioDurationSec)}</span>
        </div>

        {/* Controls */}
        <div style={controlRow}>
          {/* Rewind 10s */}
          <button style={skipBtn} onClick={rewind} aria-label="Rewind 10 seconds">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                fill="rgba(255,255,255,0.6)"
              />
              <text x="9" y="15" fontSize="6" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">10</text>
            </svg>
            <span style={skipLabel}>-10s</span>
          </button>

          {/* Play / Pause */}
          <button
            style={playCircle}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              // Pause icon
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" rx="1" fill="#1a0f08" />
                <rect x="14" y="4" width="4" height="16" rx="1" fill="#1a0f08" />
              </svg>
            ) : (
              // Play icon
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M8 5.14v14l11-7-11-7z" fill="#1a0f08" />
              </svg>
            )}
          </button>

          {/* Forward 10s */}
          <button style={skipBtn} onClick={forward} aria-label="Forward 10 seconds">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"
                fill="rgba(255,255,255,0.6)"
              />
              <text x="9" y="15" fontSize="6" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">10</text>
            </svg>
            <span style={skipLabel}>+10s</span>
          </button>
        </div>

        {/* Spirit Voice language strip */}
        <p style={langStripLabel}>Spirit Voice Translation</p>
        <div style={langStrip}>
          {LANGUAGES.map(lang => {
            const isActive = activeLang === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: isActive
                    ? '1px solid rgba(212,175,55,0.7)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isActive
                    ? 'rgba(212,175,55,0.14)'
                    : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 10px rgba(212,175,55,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
                aria-pressed={isActive}
                aria-label={`Switch to ${lang.label}`}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{lang.flag}</span>
                <span
                  style={{
                    fontSize: 9,
                    color: isActive ? '#d4af37' : 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {lang.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active transcript */}
        <div style={transcriptBox}>
          &ldquo;{TRANSLATION_PLACEHOLDERS[activeLang]}&rdquo;
        </div>
      </div>
    </div>
  )
}
