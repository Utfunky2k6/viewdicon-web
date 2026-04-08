'use client'
// ═══════════════════════════════════════════════════════════════
// GO LIVE — ỌKAN ILU (Heartbeat of the Drum)
// 3-step wizard: Choose Village → Setup Stream → Go Live
// African-first: each village creates a unique streaming experience
// ═══════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { logApiFailure } from '@/lib/flags'

const C = { bg: '#070a04', card: '#0e1510', greenL: '#4ade80', gold: '#d4a017', goldL: '#fbbf24', dim: 'rgba(255,255,255,.35)', dim2: 'rgba(255,255,255,.15)' }

const CSS_ID = 'go-live-css'
const CSS = `
@keyframes glHeartbeat{0%,100%{transform:scale(1)}15%{transform:scale(1.08)}30%{transform:scale(1)}45%{transform:scale(1.05)}}
@keyframes glFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes glPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.6)}70%{box-shadow:0 0 0 20px rgba(239,68,68,0)}}
@keyframes glSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes glChecklist{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
.gl-fade{animation:glFadeIn .35s ease both}
`

const VILLAGE_STREAMS: { id: string; icon: string; name: string; streamName: string; desc: string; color: string }[] = [
  { id: 'commerce',     icon: '🏪', name: 'Commerce',     streamName: 'Soko Live',         desc: 'Sell products live — viewers buy while you stream', color: '#f59e0b' },
  { id: 'health',       icon: '⚕️', name: 'Health',        streamName: 'Iwosan Stream',     desc: 'Telemedicine consultations & wellness talks', color: '#22c55e' },
  { id: 'agriculture',  icon: '🌾', name: 'Agriculture',   streamName: 'Irugbin Auction',   desc: 'Live harvest auctions — farm to buyer direct', color: '#84cc16' },
  { id: 'education',    icon: '📚', name: 'Education',     streamName: 'Ilé-Ìwé Live',      desc: 'Live classrooms with quizzes & certificates', color: '#3b82f6' },
  { id: 'arts',         icon: '🎨', name: 'Arts',          streamName: 'Ọnà Gallery',       desc: 'Gallery streams with live art auctions', color: '#a855f7' },
  { id: 'technology',   icon: '💻', name: 'Technology',    streamName: 'Ìmọ̀ Code',         desc: 'Gaming, coding & tech tutorials', color: '#06b6d4' },
  { id: 'finance',      icon: '💰', name: 'Finance',       streamName: 'Owó Ticker',        desc: 'Market analysis with live charts & alerts', color: '#eab308' },
  { id: 'justice',      icon: '⚖️', name: 'Justice',       streamName: 'Ìgbìmọ̀ Hall',      desc: 'Town halls with live voting & debate', color: '#f97316' },
  { id: 'security',     icon: '🛡', name: 'Security',      streamName: 'Àbò Watch',         desc: 'Community safety broadcasts & alerts', color: '#ef4444' },
  { id: 'spirituality', icon: '🕯', name: 'Spirituality',  streamName: 'Àṣẹ Circle',       desc: 'Sacred gatherings, meditation & blessings', color: '#c084fc' },
  { id: 'fashion',      icon: '👗', name: 'Fashion',       streamName: 'Aṣọ Runway',       desc: 'Fashion shows with instant "Shop This Look"', color: '#ec4899' },
  { id: 'family',       icon: '🌳', name: 'Family',        streamName: 'Ẹbí Gathering',    desc: 'Family reunions, photo walls & memory sharing', color: '#10b981' },
  { id: 'transport',    icon: '🚛', name: 'Transport',     streamName: 'Ọ̀nà Route',        desc: 'Delivery tracking & fleet livestreams', color: '#64748b' },
  { id: 'energy',       icon: '⚡', name: 'Energy',        streamName: 'Àgbára Power',      desc: 'Energy dashboards & sustainability talks', color: '#facc15' },
  { id: 'hospitality',  icon: '🍲', name: 'Hospitality',   streamName: 'Oúnjẹ Kitchen',    desc: 'Live cooking shows with recipe overlays', color: '#f97316' },
  { id: 'government',   icon: '🏛', name: 'Government',    streamName: 'Àpérò Assembly',   desc: 'Assembly streams with live motions & voting', color: '#d97706' },
  { id: 'sports',       icon: '⚽', name: 'Sports',        streamName: 'Eré Arena',         desc: 'Live sports with scoreboard & predictions', color: '#22d3ee' },
  { id: 'media',        icon: '📰', name: 'Media',         streamName: 'Ìròyìn Desk',      desc: 'News broadcasts with fact-check indicators', color: '#6366f1' },
  { id: 'builders',     icon: '🏗', name: 'Builders',      streamName: 'Ilé Blueprint',     desc: 'Construction streams with progress tracking', color: '#78716c' },
  { id: 'holdings',     icon: '🏛', name: 'Holdings',      streamName: 'Àkójọ Suite',      desc: 'Sovereign deal rooms & executive briefings', color: '#a78bfa' },
]

const STREAM_TYPES = [
  { value: 'market',    label: 'Market / Shoppable' },
  { value: 'healing',   label: 'Healing / Wellness' },
  { value: 'craft',     label: 'Craft / Creative' },
  { value: 'farm',      label: 'Farm / Agriculture' },
  { value: 'knowledge', label: 'Knowledge / Education' },
  { value: 'oracle',    label: 'Oracle / Wisdom' },
  { value: 'gaming',    label: 'Gaming / eSports' },
  { value: 'talk',      label: 'Talk Show / Interview' },
]

const MONETIZATION = [
  { value: 'free',   label: 'Free (Cowrie tips enabled)', icon: '🆓' },
  { value: 'ticket', label: 'Ticketed (Set entry price)', icon: '🎟' },
  { value: 'sub',    label: 'Subscribers Only', icon: '⭐' },
]

type Step = 1 | 2 | 3

export default function GoLivePage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [step, setStep] = React.useState<Step>(1)
  const [selectedVillage, setSelectedVillage] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [streamType, setStreamType] = React.useState('market')
  const [monetization, setMonetization] = React.useState('free')
  const [ticketPrice, setTicketPrice] = React.useState(50)
  const [privacy, setPrivacy] = React.useState<'public' | 'village' | 'followers'>('public')
  const [launching, setLaunching] = React.useState(false)
  const [cameraReady, setCameraReady] = React.useState(false)
  const [micReady, setMicReady] = React.useState(false)

  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  // Inject CSS
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById(CSS_ID)) {
      const s = document.createElement('style')
      s.id = CSS_ID
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  // Start camera in step 2
  React.useEffect(() => {
    if (step < 2) return
    let cancelled = false
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640 }, audio: true })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraReady(stream.getVideoTracks().length > 0)
        setMicReady(stream.getAudioTracks().length > 0)
      }).catch(() => { setCameraReady(false); setMicReady(false) })
    return () => { cancelled = true; streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [step])

  const villageInfo = VILLAGE_STREAMS.find(v => v.id === selectedVillage)

  const canGoLive = cameraReady && title.trim().length > 0 && selectedVillage

  const handleGoLive = async () => {
    setLaunching(true)
    try {
      const result = await jollofTvApi.createStream({
        title: title.trim(),
        description: desc.trim(),
        villageId: selectedVillage,
        type: streamType,
        monetization,
        ticketPrice: monetization === 'ticket' ? ticketPrice : undefined,
        privacy,
      }) as { id?: string }
      const id = result?.id || `live-${Date.now()}`
      router.push(`/dashboard/jollof/${id}`)
    } catch (e) {
      logApiFailure('jollof/live/goLive', e)
      router.push(`/dashboard/jollof/live-${Date.now()}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: '#fff', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(212,160,23,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()} style={{
            width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>←</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.goldL }}>Ọkan Ilù</div>
            <div style={{ fontSize: 10, color: C.dim }}>Go Live · Step {step} of 3</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: 32, height: 3, borderRadius: 99,
              background: s <= step ? C.gold : 'rgba(255,255,255,0.08)',
              transition: 'all .3s',
            }} />
          ))}
        </div>
      </div>

      {/* ── STEP 1: Choose Village ── */}
      {step === 1 && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Choose Your Stage</h2>
          <p style={{ fontSize: 12, color: C.dim, marginBottom: 20 }}>Each village creates a unique streaming experience for your audience</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {VILLAGE_STREAMS.map(v => (
              <button
                key={v.id}
                onClick={() => { setSelectedVillage(v.id); setStep(2) }}
                className="gl-fade"
                style={{
                  padding: '14px 12px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                  background: selectedVillage === v.id ? `${v.color}15` : 'rgba(255,255,255,0.02)',
                  border: selectedVillage === v.id ? `1.5px solid ${v.color}50` : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all .2s',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{v.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: v.color, marginBottom: 2 }}>{v.streamName}</div>
                <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.4 }}>{v.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Setup Stream ── */}
      {step === 2 && (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
            {/* Camera Preview */}
            <div style={{
              width: '100%', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden',
              background: '#111', border: `2px solid ${villageInfo?.color || C.gold}30`,
              position: 'relative',
            }}>
              <video ref={videoRef} autoPlay playsInline muted style={{
                width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
              }} />
              {!cameraReady && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8, background: 'rgba(0,0,0,0.8)',
                }}>
                  <div style={{ fontSize: 36 }}>📷</div>
                  <div style={{ fontSize: 12, color: C.dim }}>Requesting camera access...</div>
                </div>
              )}
              {villageInfo && (
                <div style={{
                  position: 'absolute', top: 12, left: 12, padding: '4px 12px', borderRadius: 99,
                  background: `${villageInfo.color}20`, border: `1px solid ${villageInfo.color}40`,
                  fontSize: 10, fontWeight: 700, color: villageInfo.color,
                }}>{villageInfo.icon} {villageInfo.streamName}</div>
              )}
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stream Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you streaming today?"
                style={{
                  width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, fontSize: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff', outline: 'none',
                }} />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell viewers what to expect..."
                rows={2} style={{
                  width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, fontSize: 13,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff', outline: 'none', resize: 'none',
                }} />
            </div>

            {/* Stream Type */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stream Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {STREAM_TYPES.map(t => (
                  <button key={t.value} onClick={() => setStreamType(t.value)} style={{
                    padding: '7px 12px', borderRadius: 99, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    background: streamType === t.value ? `${villageInfo?.color || C.gold}18` : 'rgba(255,255,255,0.03)',
                    border: streamType === t.value ? `1px solid ${villageInfo?.color || C.gold}40` : '1px solid rgba(255,255,255,0.06)',
                    color: streamType === t.value ? (villageInfo?.color || C.goldL) : C.dim,
                  }}>{t.label}</button>
                ))}
              </div>
            </div>

            {/* Monetization */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monetization</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {MONETIZATION.map(m => (
                  <button key={m.value} onClick={() => setMonetization(m.value)} style={{
                    padding: '10px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: monetization === m.value ? 'rgba(212,160,23,0.08)' : 'rgba(255,255,255,0.02)',
                    border: monetization === m.value ? '1px solid rgba(212,160,23,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: monetization === m.value ? C.goldL : C.dim }}>{m.label}</span>
                  </button>
                ))}
              </div>
              {monetization === 'ticket' && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.dim }}>Ticket Price:</span>
                  <input type="number" value={ticketPrice} onChange={e => setTicketPrice(Number(e.target.value))}
                    style={{
                      width: 80, padding: '8px 10px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,160,23,0.2)',
                      color: C.goldL, outline: 'none', textAlign: 'center',
                    }} />
                  <span style={{ fontSize: 11, color: C.goldL, fontWeight: 700 }}>COW</span>
                </div>
              )}
            </div>

            {/* Privacy */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Privacy</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {(['public', 'village', 'followers'] as const).map(p => (
                  <button key={p} onClick={() => setPrivacy(p)} style={{
                    flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    background: privacy === p ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.02)',
                    border: privacy === p ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    color: privacy === p ? C.greenL : C.dim, textTransform: 'capitalize',
                  }}>{p === 'public' ? '🌍 Public' : p === 'village' ? '🏘 Village' : '👥 Followers'}</button>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(3)} disabled={!title.trim()} style={{
              width: '100%', padding: '14px', borderRadius: 14, cursor: title.trim() ? 'pointer' : 'not-allowed',
              background: title.trim() ? `linear-gradient(135deg, ${villageInfo?.color || C.gold}, ${C.gold})` : 'rgba(255,255,255,0.05)',
              border: 'none', color: title.trim() ? '#000' : C.dim2,
              fontSize: 14, fontWeight: 800, marginTop: 8,
            }}>Continue to Pre-Stream Check →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Go Live ── */}
      {step === 3 && (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* Camera preview (small) */}
          <div style={{
            width: 200, height: 260, borderRadius: 20, overflow: 'hidden',
            border: `2px solid ${villageInfo?.color || C.gold}40`,
          }}>
            <video ref={videoRef} autoPlay playsInline muted style={{
              width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
            }} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center' }}>
            Pre-Stream Checklist
          </h2>

          {/* Checklist */}
          <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Camera ready', ok: cameraReady },
              { label: 'Microphone active', ok: micReady },
              { label: 'Title set', ok: !!title.trim() },
              { label: 'Village selected', ok: !!selectedVillage },
            ].map((check, i) => (
              <div key={check.label} className="gl-fade" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                background: check.ok ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${check.ok ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)'}`,
                animation: `glChecklist .3s ease ${i * 0.1}s both`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: check.ok ? C.greenL : '#ef4444',
                  color: '#000', fontSize: 14, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{check.ok ? '✓' : '✗'}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: check.ok ? '#fff' : 'rgba(255,255,255,0.5)' }}>{check.label}</span>
              </div>
            ))}
          </div>

          {/* Stream Summary */}
          <div style={{
            width: '100%', maxWidth: 360, padding: '14px 16px', borderRadius: 14,
            background: 'rgba(212,160,23,0.05)', border: '1px solid rgba(212,160,23,0.12)',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Stream Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.dim }}>Title</span>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.dim }}>Village</span>
                <span style={{ fontSize: 11, color: villageInfo?.color, fontWeight: 600 }}>{villageInfo?.icon} {villageInfo?.streamName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.dim }}>Type</span>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{STREAM_TYPES.find(t => t.value === streamType)?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.dim }}>Revenue</span>
                <span style={{ fontSize: 11, color: C.goldL, fontWeight: 600 }}>{MONETIZATION.find(m => m.value === monetization)?.label}</span>
              </div>
            </div>
          </div>

          {/* GO LIVE BUTTON */}
          <button
            onClick={handleGoLive}
            disabled={!canGoLive || launching}
            style={{
              width: 180, height: 180, borderRadius: '50%', cursor: canGoLive && !launching ? 'pointer' : 'not-allowed',
              background: launching
                ? 'rgba(239,68,68,0.2)'
                : canGoLive
                  ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                  : 'rgba(255,255,255,0.05)',
              border: canGoLive ? '3px solid rgba(239,68,68,0.3)' : '2px solid rgba(255,255,255,0.08)',
              color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              animation: launching ? 'glSpin 2s linear infinite' : canGoLive ? 'glPulse 2s infinite, glHeartbeat 1.2s ease infinite' : 'none',
              boxShadow: canGoLive ? '0 0 60px rgba(239,68,68,0.3)' : 'none',
              transition: 'all .3s',
            }}
          >
            {launching ? (
              <>
                <div style={{ fontSize: 28 }}>☀</div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>Setting up...</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36 }}>🔴</div>
                <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.05em' }}>ỌKAN ILÙ</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>GO LIVE</div>
              </>
            )}
          </button>

          {!launching && (
            <p style={{ fontSize: 10, color: C.dim, textAlign: 'center', maxWidth: 280 }}>
              Ọkan Ilù — The heartbeat of the drum. Your stream begins the moment you tap.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
