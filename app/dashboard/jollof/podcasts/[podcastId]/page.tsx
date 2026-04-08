'use client'
// ═══════════════════════════════════════════════════════════════════
// ITAN EPISODE PLAYER — Individual Podcast Page
// Stories of Africa · Jollof TV Platform
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

/* ── inject-once CSS ── */
const CSS_ID = 'itan-ep-css'
const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes skelPulse{0%,100%{opacity:.18}50%{opacity:.38}}
.iep-fade{animation:fadeUp .3s ease both}
.iep-skel{animation:skelPulse 1.6s ease infinite;background:rgba(255,255,255,.08);border-radius:8px}
`

const MOCK_PODCAST = {
  id: 'p1', title: 'Culture Weekly', creatorId: 'griot1', category: 'CULTURE',
  villageId: 'arts', coverUrl: null,
  description: 'Pan-African cultural conversations every week. Diving deep into tradition, identity, language, and the future of Africa — one story at a time.',
  _count: { episodes: 24, subscribers: 1840 },
}

const MOCK_EPISODES = [
  { id: 'e1', episodeNum: 1, title: 'Origins: Where Pan-Africanism Began', duration: 2340, publishDate: '2024-01-15', audioUrl: '' },
  { id: 'e2', episodeNum: 2, title: 'The Griot Tradition — Keepers of Memory', duration: 1980, publishDate: '2024-01-22', audioUrl: '' },
  { id: 'e3', episodeNum: 3, title: 'Ubuntu Philosophy in Modern Business', duration: 2760, publishDate: '2024-01-29', audioUrl: '' },
  { id: 'e4', episodeNum: 4, title: 'Cowrie Shells: Ancient African Currency', duration: 2100, publishDate: '2024-02-05', audioUrl: '' },
  { id: 'e5', episodeNum: 5, title: 'The Future of African Tech', duration: 3120, publishDate: '2024-02-12', audioUrl: '' },
]

const CAT_GRADIENT: Record<string, [string, string]> = {
  CULTURE:     ['#7c3aed', '#a855f7'],
  EDUCATION:   ['#1a7c3e', '#4ade80'],
  BUSINESS:    ['#d4a017', '#fbbf24'],
  HEALTH:      ['#0891b2', '#22d3ee'],
  POLITICS:    ['#dc2626', '#ef4444'],
  MUSIC:       ['#db2777', '#f472b6'],
  SPIRITUALITY:['#7c3aed', '#c084fc'],
  default:     ['#374151', '#6b7280'],
}
const CAT_EMOJI: Record<string, string> = {
  CULTURE: '🥁', EDUCATION: '📚', BUSINESS: '💼', HEALTH: '🌿',
  POLITICS: '⚖️', MUSIC: '🎵', SPIRITUALITY: '🕯', default: '🎙',
}

function getCatGradient(cat: string): string {
  const [a, b] = CAT_GRADIENT[cat] ?? CAT_GRADIENT.default
  return `linear-gradient(135deg, ${a}, ${b})`
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function fmtDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

function daysAgo(dateStr: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return `${diff} days ago`
  } catch { return '' }
}

const SPEEDS = [0.5, 1, 1.25, 1.5, 2]

/* ── Skeleton ── */
function SkeletonEpisode() {
  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div className="iep-skel" style={{ height: 12, width: '75%', marginBottom: 8 }} />
        <div className="iep-skel" style={{ height: 10, width: '40%' }} />
      </div>
      <div className="iep-skel" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
    </div>
  )
}

export default function PodcastDetailPage() {
  const router = useRouter()
  const params = useParams()
  const podcastId = params?.podcastId as string
  const { user } = useAuthStore()
  const userId = (user as any)?.id ?? 'guest'

  const [podcast, setPodcast] = React.useState<any>(null)
  const [episodes, setEpisodes] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [subscribed, setSubscribed] = React.useState(false)
  const [descExpanded, setDescExpanded] = React.useState(false)

  // Audio player state
  const [currentEp, setCurrentEp] = React.useState<any>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0) // 0-100
  const [speedIdx, setSpeedIdx] = React.useState(1) // index into SPEEDS
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const progressTimer = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const [epProgress, setEpProgress] = React.useState<Record<string, number>>({}) // per-ep progress

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    if (!podcastId) return
    setLoading(true)
    Promise.all([
      jollofTvApi.podcast(podcastId).catch((e) => { logApiFailure('podcast/detail', e); return USE_MOCKS ? MOCK_PODCAST : null }),
      jollofTvApi.podcastEpisodes(podcastId).catch((e) => { logApiFailure('podcast/episodes', e); return USE_MOCKS ? { episodes: MOCK_EPISODES } : { episodes: [] } }),
    ]).then(([podRes, epRes]) => {
      const p = (podRes as any)?.data ?? podRes ?? (USE_MOCKS ? MOCK_PODCAST : null)
      const eps = (epRes as any)?.episodes ?? (USE_MOCKS ? MOCK_EPISODES : [])
      setPodcast(p)
      setEpisodes(eps.length ? eps : (USE_MOCKS ? MOCK_EPISODES : []))
      setLoading(false)
    }).catch((e) => {
      logApiFailure('podcast/load', e)
      if (USE_MOCKS) {
        setPodcast(MOCK_PODCAST)
        setEpisodes(MOCK_EPISODES)
      }
      setLoading(false)
    })
  }, [podcastId])

  // Sync audio playback with state
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentEp) return
    if (currentEp.audioUrl) {
      audio.src = currentEp.audioUrl
      audio.playbackRate = SPEEDS[speedIdx]
    }
    if (isPlaying && currentEp.audioUrl) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [currentEp?.id, isPlaying])

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[speedIdx]
  }, [speedIdx])

  // Simulated progress timer (for episodes without a real audioUrl)
  React.useEffect(() => {
    if (progressTimer.current) clearInterval(progressTimer.current)
    if (isPlaying && currentEp) {
      const duration = currentEp.duration ?? 1800
      const tickMs = 500
      const step = (tickMs / (duration * 1000)) * 100
      progressTimer.current = setInterval(() => {
        setProgress(p => {
          const next = Math.min(100, p + step)
          setEpProgress(prev => ({ ...prev, [currentEp.id]: next }))
          if (next >= 100) {
            setIsPlaying(false)
            return 100
          }
          return next
        })
      }, tickMs)
    }
    return () => { if (progressTimer.current) clearInterval(progressTimer.current) }
  }, [isPlaying, currentEp?.id])

  function playEpisode(ep: any) {
    if (currentEp?.id === ep.id) {
      setIsPlaying(p => !p)
    } else {
      setCurrentEp(ep)
      setProgress(epProgress[ep.id] ?? 0)
      setIsPlaying(true)
    }
  }

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setProgress(pct)
    if (currentEp) setEpProgress(prev => ({ ...prev, [currentEp.id]: pct }))
    if (audioRef.current && currentEp?.audioUrl) {
      audioRef.current.currentTime = (pct / 100) * (currentEp.duration ?? 0)
    }
  }

  const cat = podcast?.category ?? 'CULTURE'
  const timeRemaining = currentEp ? Math.round((1 - progress / 100) * (currentEp.duration ?? 0)) : 0
  const latestEp = episodes[episodes.length - 1]

  const page: React.CSSProperties = {
    minHeight: '100vh',
    background: '#07090a',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.022) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    paddingBottom: currentEp ? 164 : 100,
    fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div style={page}>
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Header overlay */}
      <div style={{ position: 'relative' }}>
        {/* Banner */}
        <div style={{ height: 140, background: podcast ? getCatGradient(cat) : 'rgba(255,255,255,.05)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 20px 16px' }}>
          {!loading && podcast && (
            <>
              <div style={{ fontSize: 44, marginRight: 12, lineHeight: 1 }}>{CAT_EMOJI[cat] ?? '🎙'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{podcast.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>@{podcast.creatorId}</div>
              </div>
            </>
          )}
        </div>

        {/* Back button */}
        <button onClick={() => router.back()} style={{ position: 'absolute', top: 14, left: 16, background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'rgba(255,255,255,.9)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>‹</button>
      </div>

      {loading ? (
        <div>
          <div style={{ padding: '14px 20px', display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div className="iep-skel" style={{ height: 13, width: '40%' }} />
            <div className="iep-skel" style={{ height: 13, width: '25%' }} />
            <div className="iep-skel" style={{ height: 13, width: '25%' }} />
          </div>
          <SkeletonEpisode /><SkeletonEpisode /><SkeletonEpisode />
        </div>
      ) : (
        <>
          {/* Category badge + Subscribe */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <span style={{ fontSize: 9, padding: '3px 9px', borderRadius: 10, background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>{cat}</span>
            <button onClick={() => setSubscribed(s => !s)} style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif', border: subscribed ? '1px solid rgba(255,255,255,.15)' : '1px solid #4ade80', background: subscribed ? 'rgba(255,255,255,.04)' : 'rgba(74,222,128,.12)', color: subscribed ? 'rgba(255,255,255,.5)' : '#4ade80' }}>
              {subscribed ? '✓ Following' : '+ Subscribe'}
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,.85)', fontFamily: 'Sora, sans-serif' }}>{podcast?._count?.episodes ?? episodes.length}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Episodes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,.85)', fontFamily: 'Sora, sans-serif' }}>{(podcast?._count?.subscribers ?? 1840).toLocaleString()}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Subscribers</div>
            </div>
            {latestEp && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)', fontFamily: 'Sora, sans-serif' }}>{daysAgo(latestEp.publishDate)}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Latest</div>
              </div>
            )}
          </div>

          {/* About section */}
          <div style={{ margin: '16px 20px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, overflow: 'hidden' }}>
            <button onClick={() => setDescExpanded(d => !d)} style={{ width: '100%', background: 'none', border: 'none', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', fontFamily: 'Sora, sans-serif' }}>About this Podcast</span>
              <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 14, transition: 'transform .2s', display: 'inline-block', transform: descExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>
            {descExpanded && (
              <div style={{ padding: '0 14px 14px', fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>{podcast?.description ?? ''}</div>
            )}
          </div>

          {/* Episode list */}
          <div style={{ padding: '0 20px 8px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 10, fontFamily: 'Sora, sans-serif' }}>Episodes</div>
          </div>

          {episodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎙</div>
              No episodes yet
            </div>
          ) : (
            <div>
              {episodes.map((ep, i) => {
                const isSelected = currentEp?.id === ep.id
                const epProg = epProgress[ep.id] ?? 0
                const playing = isSelected && isPlaying
                return (
                  <div key={ep.id} className="iep-fade" style={{ animationDelay: `${i * 0.05}s`, borderLeft: isSelected ? '3px solid #4ade80' : '3px solid transparent', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, background: isSelected ? 'rgba(74,222,128,.04)' : 'transparent' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#4ade80' : 'rgba(255,255,255,.85)', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>{ep.title}</div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{fmtDate(ep.publishDate)}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>·</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{fmtDuration(ep.duration)}</span>
                      </div>
                      {epProg > 0 && epProg < 100 && (
                        <div style={{ height: 2, background: 'rgba(255,255,255,.1)', borderRadius: 1, marginTop: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#4ade80', width: `${epProg}%`, borderRadius: 1, transition: 'width .5s linear' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,.1)', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>#{ep.episodeNum}</div>
                      <button onClick={() => playEpisode(ep)} style={{ width: 36, height: 36, borderRadius: '50%', border: isSelected ? '2px solid #4ade80' : '1px solid rgba(255,255,255,.15)', background: isSelected ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: isSelected ? '#4ade80' : 'rgba(255,255,255,.7)', flexShrink: 0 }}>
                        {playing ? '⏸' : '▶'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Audio Player Bar */}
      {currentEp && (
        <div style={{ position: 'fixed', bottom: 64, left: 0, right: 0, background: 'rgba(13,16,8,.97)', borderTop: '1px solid rgba(255,255,255,.08)', padding: '10px 16px 12px', zIndex: 50, backdropFilter: 'blur(12px)' }}>
          {/* Progress bar */}
          <div onClick={seekTo} style={{ height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2, marginBottom: 10, cursor: 'pointer', position: 'relative' }}>
            <div style={{ height: '100%', background: '#4ade80', width: `${progress}%`, borderRadius: 2, transition: 'width .5s linear' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Sora, sans-serif' }}>{currentEp.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>−{fmtDuration(timeRemaining)}</div>
            </div>
            <button onClick={() => setSpeedIdx(i => (i + 1) % SPEEDS.length)} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 7, padding: '4px 8px', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>{SPEEDS[speedIdx]}×</button>
            <button onClick={() => setIsPlaying(p => !p)} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #4ade80', background: 'rgba(74,222,128,.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#4ade80', flexShrink: 0 }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
