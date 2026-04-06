'use client'
// ═══════════════════════════════════════════════════════════════════
// Live Streamer Page — Creator POV
// Route: /dashboard/jollof/live/[streamId]
//
// Full-screen broadcaster view with:
//   - Camera preview (placeholder until WebRTC integrated)
//   - StreamerControlPanel (HUD, mute, talking stick queue)
//   - MultiBoxLayout (Oracle mode: multi-speaker grid)
//   - Live viewer + spray counters via polling
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StreamerControlPanel } from '@/components/jollof/creator/StreamerControlPanel'
import { MultiBoxLayout, type SpeakerSlot } from '@/components/jollof/stream-viewer/MultiBoxLayout'
import { VOCAB } from '@/constants/vocabulary'
import { jollofTvApi } from '@/lib/api'

type StreamType = 'market' | 'healing' | 'craft' | 'farm' | 'knowledge' | 'oracle'

interface LiveStreamData {
  id:              string
  type:            StreamType
  title:           string
  hostId:          string
  villageSlug:     string
  viewerCount:     number
  sprayTotal:      number
  kilaCount:       number
  pinnedProduct?:  { id: string; name: string; price: number; soldCount: number } | null
}

const CSS_ID = 'live-streamer-css'
const CSS = `
@keyframes liveBlink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`

// Accent per stream type
const ACCENT: Record<StreamType, string> = {
  market:    '#e07b00',
  healing:   '#0369a1',
  craft:     '#7c3aed',
  farm:      '#1a7c3e',
  knowledge: '#4f46e5',
  oracle:    '#d4a017',
}

const BG_GRAD: Record<StreamType, string> = {
  market:    'linear-gradient(170deg, #1a1005 0%, #0d0804 100%)',
  healing:   'linear-gradient(170deg, #04121a 0%, #0d0804 100%)',
  craft:     'linear-gradient(170deg, #120a1f 0%, #0d0804 100%)',
  farm:      'linear-gradient(170deg, #071a0e 0%, #0d0804 100%)',
  knowledge: 'linear-gradient(170deg, #0a0a1f 0%, #0d0804 100%)',
  oracle:    'linear-gradient(170deg, #1a1505 0%, #0d0804 100%)',
}

// Demo oracle speakers for UI preview
const DEMO_ORACLE_SPEAKERS: SpeakerSlot[] = [
  { afroId: 'host',   name: 'Amaka',   color: '#d4a017', isSpeaking: true,  isMuted: false, isCameraOff: false, isStickHolder: true },
  { afroId: 'sp2',    name: 'Emeka',   color: '#22c55e', isSpeaking: false, isMuted: false, isCameraOff: false },
  { afroId: 'sp3',    name: 'Fatima',  color: '#3b82f6', isSpeaking: false, isMuted: true,  isCameraOff: false },
  { afroId: 'sp4',    name: 'Kwame',   color: '#a78bfa', isSpeaking: false, isMuted: false, isCameraOff: true },
]

export default function LiveStreamerPage() {
  const router   = useRouter()
  const params   = useParams()
  const streamId = params.streamId as string

  const [streamData, setStreamData]   = React.useState<LiveStreamData | null>(null)
  const [loading, setLoading]         = React.useState(true)
  const [viewerCount, setViewerCount] = React.useState(0)
  const [sprayTotal, setSprayTotal]   = React.useState(0)
  const [stickHolder, setStickHolder] = React.useState<string | null>('host')
  const [isEnding, setIsEnding]       = React.useState(false)
  const [ended, setEnded]             = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById(CSS_ID)) {
      const s = document.createElement('style')
      s.id = CSS_ID
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  // Fetch stream data via jollofTvApi (proxied through Next.js rewrites → port 3046)
  React.useEffect(() => {
    const fetchStream = async () => {
      try {
        const res = await jollofTvApi.get(streamId)
        const data = (res as any)?.data ?? res
        setStreamData(data as LiveStreamData)
        setViewerCount((data as any).viewerCount ?? 0)
        setSprayTotal((data as any).sprayTotal ?? 0)
      } catch {
        // Stream not in DB yet (just created) — use URL-based defaults
        setStreamData({
          id:          streamId,
          type:        'market',
          title:       'Live Stream',
          hostId:      'me',
          villageSlug: 'commerce',
          viewerCount: 0,
          sprayTotal:  0,
          kilaCount:   0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStream()
  }, [streamId])

  // Poll viewer count every 15s
  React.useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await jollofTvApi.get(streamId)
        const data = (res as any)?.data ?? res
        setViewerCount((data as any).viewerCount ?? 0)
        setSprayTotal((data as any).sprayTotal ?? 0)
      } catch { /* non-fatal */ }
    }, 15_000)
    return () => clearInterval(t)
  }, [streamId])

  const handleEndStream = async () => {
    setIsEnding(true)
    try {
      await jollofTvApi.endStream(streamId)
    } catch { /* non-fatal */ }
    setEnded(true)
    setTimeout(() => router.push('/dashboard/jollof'), 2500)
  }

  const handlePassStick = async (toAfroId: string) => {
    setStickHolder(toAfroId)
    try {
      await fetch(`/api/jollof/streams/${streamId}/oracle/pass-stick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: streamData?.hostId ?? 'me', to: toAfroId }),
      })
    } catch { /* non-fatal */ }
  }

  // ── Ended screen ─────────────────────────────────────────────
  if (ended) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#0d0804',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center', animation: 'fadeUp .4s ease both' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🕯</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f0f7f0', fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>
            {VOCAB.endStream}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(240,247,240,.4)', marginBottom: 6 }}>
            Your fire was seen by {viewerCount.toLocaleString()} villagers
          </div>
          <div style={{ fontSize: 13, color: '#d4a017', fontWeight: 700 }}>
            🐚 ₡{sprayTotal.toLocaleString()} sprayed
          </div>
          <div style={{ marginTop: 20, fontSize: 11, color: 'rgba(240,247,240,.3)' }}>
            Returning to Jollof TV…
          </div>
        </div>
      </div>
    )
  }

  if (loading || !streamData) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#0d0804',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 32 }}>🔥</div>
      </div>
    )
  }

  const accent  = ACCENT[streamData.type]
  const bgGrad  = BG_GRAD[streamData.type]
  const isOracle = streamData.type === 'oracle'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: bgGrad,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Adinkra background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: .03, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0px, transparent 1px, transparent 20px, ${accent} 21px)`,
        backgroundSize: '28px 28px',
      }} />

      {/* ── Camera preview area ─────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isOracle ? (
          /* Oracle mode: multi-box layout */
          <MultiBoxLayout
            speakers={DEMO_ORACLE_SPEAKERS}
            stickHolder={stickHolder}
            onPassStick={handlePassStick}
            isHost={true}
            hostAfroId={streamData.hostId}
          />
        ) : (
          /* Single creator: camera placeholder */
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: `linear-gradient(135deg, ${accent}, ${accent}66)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 44, fontWeight: 900, color: '#fff',
              boxShadow: `0 0 40px ${accent}40`,
            }}>
              {streamData.title.charAt(0)}
            </div>
          </div>
        )}

        {/* ── Control panel overlay ──────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 16, left: 12, right: 12, zIndex: 10,
        }}>
          <StreamerControlPanel
            streamId={streamId}
            streamType={streamData.type}
            viewerCount={viewerCount}
            sprayCowrieTotal={sprayTotal}
            speakers={isOracle ? DEMO_ORACLE_SPEAKERS.filter(s => s.afroId !== streamData.hostId).map(s => ({ afroId: s.afroId, name: s.name, avatar: s.name.charAt(0), isHandRaised: false })) : []}
            pinnedProduct={streamData.pinnedProduct ?? undefined}
            isOracleMode={isOracle}
            onEndStream={handleEndStream}
            onPassStick={handlePassStick}
            onAdmitSpeaker={(afroId) => setStickHolder(afroId)}
          />
        </div>
      </div>

      {/* ── Stream title bar ────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
        padding: '12px 14px', paddingTop: 'max(env(safe-area-inset-top), 12px)',
        background: 'linear-gradient(180deg, rgba(0,0,0,.6) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* LIVE badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,.2)',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#ef4444',
              animation: 'liveBlink 1s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', letterSpacing: '.05em' }}>LIVE</span>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#f0f7f0',
              fontFamily: 'Sora, sans-serif',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {streamData.title}
            </div>
          </div>

          {/* Kila count */}
          <div style={{
            padding: '4px 10px', borderRadius: 8, background: 'rgba(212,160,23,.12)',
            fontSize: 11, fontWeight: 700, color: '#d4a017',
          }}>
            ⭐ {streamData.kilaCount}
          </div>

          {/* End stream quick button */}
          {isEnding && (
            <div style={{
              padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,.15)',
              fontSize: 10, fontWeight: 700, color: '#ef4444',
            }}>
              Ending…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
