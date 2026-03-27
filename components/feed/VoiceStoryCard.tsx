'use client'
// ============================================================
// VoiceStoryCard — Audio post · The griot speaks
// Waveform visualization + Spirit Voice language strip
// ============================================================
import * as React from 'react'
import type { Post } from './feedTypes'
import { InteractionBar } from './InteractionBar'
import { DrumScopeIndicator } from './DrumScopeIndicator'

interface VoiceStoryCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
  onOpenPlayer?: (post: Post) => void
}

const CSS_ID = 'voice-card-css'
const CSS = `
@keyframes wavePlay{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.6)}}
@keyframes progressSweep{from{width:0}to{width:100%}}
@keyframes langGlow{0%,100%{box-shadow:0 0 4px rgba(26,124,62,.2)}50%{box-shadow:0 0 10px rgba(26,124,62,.5)}}
`

const SPIRIT_LANGS = [
  { code: 'en', flag: '🌐', label: 'EN', name: 'English' },
  { code: 'yo', flag: '🇳🇬', label: 'YO', name: 'Yorùbá' },
  { code: 'ig', flag: '🇳🇬', label: 'IG', name: 'Igbo' },
  { code: 'ha', flag: '🇳🇬', label: 'HA', name: 'Hausa' },
  { code: 'sw', flag: '🇰🇪', label: 'SW', name: 'Kiswahili' },
  { code: 'am', flag: '🇪🇹', label: 'AM', name: 'Amharic' },
  { code: 'zu', flag: '🇿🇦', label: 'ZU', name: 'Zulu' },
  { code: 'fr', flag: '🇫🇷', label: 'FR', name: 'Français' },
]

// Translation placeholders -- populated by Spirit Voice backend
const TRANSLATION_PLACEHOLDERS: Record<string, string> = {
  en: '',
  yo: '',
  ig: '',
  ha: '',
  sw: '',
  am: '',
  zu: '',
  fr: '',
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function VoiceStoryCard({ post, onInteract, onOpenPlayer }: VoiceStoryCardProps) {
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [activeLang, setActiveLang] = React.useState('en')
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [ubuntud, setUbuntud] = React.useState(false)
  const [kilaCount, setKilaCount] = React.useState(post.kilaCount)
  const [stirCount, setStirCount] = React.useState(post.stirCount)
  const [ubuntuCount, setUbuntuCount] = React.useState(post.ubuntuCount)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const totalSecs = post.audioDurationSec ?? 90

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 0 }
        return p + (100 / totalSecs / 2)
      })
    }, 500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, totalSecs])

  // Waveform bars – stable random heights seeded from post id
  const bars = React.useMemo(() => {
    const count = 40
    const seed = post.id.charCodeAt(0) + post.id.charCodeAt(1)
    return Array.from({ length: count }, (_, i) => {
      const v = post.waveformBars?.[i] ?? ((Math.sin(i * 0.8 + seed) * 0.5 + 0.5) * 80 + 20)
      return Math.round(v)
    })
  }, [post.id, post.waveformBars])

  const barsPassed = Math.floor((progress / 100) * bars.length)

  return (
    <div style={{
      background: 'rgba(255,255,255,.025)',
      border: '1.5px solid rgba(139,92,246,.2)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${post.avatarColor}, #7c3aed)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff',
            boxShadow: playing ? '0 0 0 3px rgba(139,92,246,.35)' : 'none',
            transition: 'box-shadow .3s',
          }}>
            {post.author.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
              {post.author}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>
              {post.villageEmoji} {post.village} · {post.time}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{
              fontSize: 8, fontWeight: 800, color: '#a78bfa',
              padding: '2px 6px', borderRadius: 5,
              background: 'rgba(139,92,246,.12)',
            }}>🎙 VOICE STORY</span>
            <DrumScopeIndicator scope={post.drumScope} />
          </div>
        </div>

        {/* Caption */}
        {post.content && (
          <p style={{ fontSize: 13, color: '#c0d0c0', lineHeight: 1.5, marginBottom: 10 }}>
            {post.content}
          </p>
        )}

        {/* Player */}
        <div
          onClick={() => onOpenPlayer ? onOpenPlayer(post) : setPlaying(!playing)}
          style={{
            background: 'rgba(0,0,0,.35)', borderRadius: 12, padding: '12px 14px',
            marginBottom: 10, cursor: 'pointer',
          }}
        >
          {/* Waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 48, marginBottom: 10 }}>
            {/* Play button */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginRight: 6,
              background: playing ? '#7c3aed' : 'rgba(139,92,246,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#fff', transition: 'background .2s',
            }}>
              {playing ? '⏸' : '▶'}
            </div>
            {/* Bars */}
            {bars.map((height, i) => (
              <div
                key={i}
                style={{
                  flex: 1, borderRadius: 1, minWidth: 2,
                  height: `${height}%`,
                  background: i < barsPassed ? '#7c3aed' : 'rgba(255,255,255,.12)',
                  transition: 'background .1s',
                  animation: playing && Math.abs(i - barsPassed) < 3 ? 'wavePlay .3s ease-in-out infinite' : 'none',
                  animationDelay: `${(i % 3) * 0.08}s`,
                }}
              />
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ position: 'relative' }}>
            <div style={{ height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                borderRadius: 2, transition: 'width .5s linear',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
                {formatDuration(Math.floor(totalSecs * progress / 100))}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
                {formatDuration(totalSecs)}
              </span>
            </div>
          </div>
        </div>

        {/* Spirit Voice language strip */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(240,247,240,.35)', marginBottom: 6, letterSpacing: '.05em' }}>
            🌍 SPIRIT VOICE — SELECT LANGUAGE
          </div>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
            {SPIRIT_LANGS.map(lang => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={activeLang === lang.code ? 'lang-active' : ''}
                style={{
                  flexShrink: 0, padding: '4px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeLang === lang.code ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.04)',
                  color: activeLang === lang.code ? '#4ade80' : 'rgba(240,247,240,.4)',
                  fontSize: 10, fontWeight: 700,
                  outline: activeLang === lang.code ? '1px solid rgba(26,124,62,.3)' : 'none',
                  animation: activeLang === lang.code ? 'langGlow 2s ease-in-out infinite' : 'none',
                }}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
          {/* Transcript */}
          <div style={{
            marginTop: 8, padding: '8px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
            fontSize: 11, color: 'rgba(240,247,240,.6)', lineHeight: 1.6, fontStyle: 'italic',
          }}>
            "{TRANSLATION_PLACEHOLDERS[activeLang]}"
          </div>
        </div>

        {/* Interactions */}
        <InteractionBar
          post={{ ...post, kilaCount, stirCount, ubuntuCount }}
          onKila={() => { if (!kilaed) { setKilaed(true); setKilaCount(n => n + 1) } }}
          onStir={() => { setStirred(!stirred); setStirCount(n => stirred ? n - 1 : n + 1) }}
          onUbuntu={() => { setUbuntud(!ubuntud); setUbuntuCount(n => ubuntud ? n - 1 : n + 1) }}
          kilaed={kilaed} stirred={stirred} ubuntud={ubuntud}
          onGriotAsk={() => onInteract?.('griot', post.id)}
          onDrum={() => onInteract?.('drum', post.id)}
        />
      </div>
    </div>
  )
}
