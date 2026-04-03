'use client'
// ════════════════════════════════════════════════════════════════════
// Jollof TV — Full-screen Stream Viewer
// Immersive live stream with type-specific overlays + commerce
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────
type StreamType = 'market' | 'healing' | 'craft' | 'farm' | 'knowledge' | 'oracle'
type NkisiLevel = 'GREEN' | 'AMBER' | 'RED'

interface Speaker {
  name: string
  speaking: boolean
  color: string
}

interface ChatMessage {
  id: string
  author: string
  crestTier: number
  text: string
  isSpray?: boolean
  sprayAmount?: number
  time: string
}

interface StreamData {
  id: string; type: StreamType; isLive: boolean
  viewerCount: number; title: string
  streamerName: string; streamerRole: string
  village: string; villageEmoji: string
  city: string; country: string
  kilaCount: number; stirCount: number
  sprayCount: number; sprayCowrieTotal: number
  nkisi: NkisiLevel
  pinnedProduct?: { name: string; price: number; soldCount: number; marketPercent: number }
  craftProgress?: number; craftTitle?: string
  agreePercent?: number; speakers?: Speaker[]
  harvestCrop?: string; harvestBags?: number
  topBid?: number; marketPrice?: number
  lessonTitle?: string; availableLangs?: string[]
  questionCount?: number; appointmentCount?: number
}

// ── CSS Keyframes ────────────────────────────────────────────────
const CSS_ID = 'jollof-viewer-css'
const CSS = `
@keyframes liveBlink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes cowrieUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(1.3);opacity:0}}
@keyframes messageIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes speakerPulse{0%{box-shadow:0 0 0 0 rgba(212,160,23,.5)}100%{box-shadow:0 0 0 10px rgba(212,160,23,0)}}
@keyframes bidEnter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes progressGlow{0%,100%{box-shadow:0 0 6px rgba(124,58,237,.3)}50%{box-shadow:0 0 14px rgba(124,58,237,.6)}}
@keyframes knotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes heartFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-50px) scale(1.4)}}
.jv-live{animation:liveBlink 1s ease-in-out infinite}
.jv-msg{animation:messageIn .25s ease both}
.jv-speaker{animation:speakerPulse 1.2s ease infinite}
.jv-bid{animation:bidEnter .3s ease both}
.jv-progress{animation:progressGlow 2s ease-in-out infinite}
.jv-knot{animation:knotPulse 2s ease-in-out infinite}
`

// ── Type Config ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<StreamType, { label: string; emoji: string; accent: string; bgGrad: string }> = {
  market:    { label: 'Market',    emoji: '🛒', accent: '#e07b00', bgGrad: 'linear-gradient(170deg, #1a1005 0%, #0d0804 100%)' },
  healing:   { label: 'Healing',   emoji: '⚕️', accent: '#0369a1', bgGrad: 'linear-gradient(170deg, #04121a 0%, #0d0804 100%)' },
  craft:     { label: 'Craft',     emoji: '🎨', accent: '#7c3aed', bgGrad: 'linear-gradient(170deg, #120a1f 0%, #0d0804 100%)' },
  farm:      { label: 'Farm',      emoji: '🌾', accent: '#1a7c3e', bgGrad: 'linear-gradient(170deg, #071a0e 0%, #0d0804 100%)' },
  knowledge: { label: 'Knowledge', emoji: '🎓', accent: '#4f46e5', bgGrad: 'linear-gradient(170deg, #0a0a1f 0%, #0d0804 100%)' },
  oracle:    { label: 'Oracle',    emoji: '🦅', accent: '#d4a017', bgGrad: 'linear-gradient(170deg, #1a1505 0%, #0d0804 100%)' },
}

// ── Stream Data (initially empty -- fetched from jollof-tv backend) ──
const STREAM_CACHE: Record<string, StreamData> = {}

const INITIAL_CHAT: ChatMessage[] = []

// ── Crest tiers (compact) ───────────────────────────────────────
const CREST = ['', '🌱', '🌿', '🌳', '⭐', '👑', '🏛', '🦅']

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════
export default function JollofStreamViewer() {
  const router = useRouter()
  const params = useParams()
  const streamId = params.streamId as string
  const stream = STREAM_CACHE[streamId]

  const [showChat, setShowChat] = React.useState(true)
  const [showSpraySheet, setShowSpraySheet] = React.useState(false)
  const [sprayAmount, setSprayAmount] = React.useState(200)
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>(INITIAL_CHAT)
  const [chatInput, setChatInput] = React.useState('')
  const [kilaed, setKilaed] = React.useState(false)
  const [hearts, setHearts] = React.useState<Array<{ id: number; x: number }>>([])
  const [agreeVote, setAgreeVote] = React.useState<'agree' | 'disagree' | null>(null)
  const [handRaised, setHandRaised] = React.useState(false)
  const [showProductSheet, setShowProductSheet] = React.useState(false)
  const [bidAmount, setBidAmount] = React.useState('')
  const [activeLang, setActiveLang] = React.useState('EN')
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  if (!stream) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0d0804', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f7f0', fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>
            Stream Not Found
          </div>
          <div style={{ fontSize: 12, color: 'rgba(240,247,240,.4)', marginBottom: 24 }}>
            This fire has gone cold. Return to the village.
          </div>
          <button
            onClick={() => router.push('/dashboard/jollof')}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #d4a017, #e07b00)',
              color: '#000', fontWeight: 800, fontSize: 13, fontFamily: 'Sora, sans-serif',
            }}
          >
            Back to Jollof TV
          </button>
        </div>
      </div>
    )
  }

  const tc = TYPE_CONFIG[stream.type]

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const msg: ChatMessage = {
      id: `c-${Date.now()}`, author: 'You', crestTier: 3,
      text: chatInput, time: 'now',
    }
    setChatMessages(prev => [...prev, msg])
    setChatInput('')
  }

  const handleSpray = () => {
    const msg: ChatMessage = {
      id: `sp-${Date.now()}`, author: 'You', crestTier: 3,
      text: '', isSpray: true, sprayAmount, time: 'now',
    }
    setChatMessages(prev => [...prev, msg])
    setShowSpraySheet(false)
  }

  const handleKila = () => {
    if (kilaed) return
    setKilaed(true)
    const newHeart = { id: Date.now(), x: 20 + Math.random() * 60 }
    setHearts(prev => [...prev, newHeart])
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 2000)
  }

  // ── Type-specific overlay ─────────────────────────────────────
  const renderTypeOverlay = () => {
    switch (stream.type) {
      case 'market':
        return stream.pinnedProduct ? (
          <div
            onClick={() => setShowProductSheet(true)}
            style={{
              position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
              background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
              borderRadius: 14, padding: '10px 12px',
              border: '1px solid rgba(224,123,0,.3)', cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'linear-gradient(135deg, #e07b00, #d4a017)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>🛒</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
                  {stream.pinnedProduct.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                    ₡{stream.pinnedProduct.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>
                    {stream.pinnedProduct.soldCount} sold
                  </span>
                </div>
              </div>
              <div style={{
                padding: '8px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #e07b00, #d4a017)',
                color: '#000', fontSize: 11, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              }}>
                🫙 Add to Pot
              </div>
            </div>
          </div>
        ) : null

      case 'craft':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(124,58,237,.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em' }}>
                🎨 CRAFT PROGRESS — {stream.craftTitle}
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#a78bfa', fontFamily: 'Sora, sans-serif' }}>
                {stream.craftProgress}%
              </div>
            </div>
            <div className="jv-progress" style={{
              height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${stream.craftProgress}%`, borderRadius: 4,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                transition: 'width .5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button style={{
                flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'rgba(124,58,237,.15)', color: '#a78bfa', fontSize: 11, fontWeight: 700,
              }}>
                🎨 Commission Similar
              </button>
              <button
                onClick={handleKila}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: kilaed ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.06)',
                  color: kilaed ? '#d4a017' : 'rgba(240,247,240,.6)', fontSize: 11, fontWeight: 700,
                }}
              >
                ⭐ Kíla
              </button>
            </div>
          </div>
        )

      case 'farm':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(26,124,62,.3)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em', marginBottom: 8 }}>
              🌾 LIVE AUCTION — {stream.harvestCrop} · {stream.harvestBags} bags
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Top Bid</div>
                <div className="jv-bid" style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                  ₡{(stream.topBid ?? 0).toLocaleString()}
                </div>
              </div>
              <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.08)' }} />
              <div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Market Price</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(240,247,240,.5)' }}>
                  ₡{(stream.marketPrice ?? 0).toLocaleString()}
                </div>
              </div>
              <div style={{
                marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: (stream.topBid ?? 0) > (stream.marketPrice ?? 0) ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
                color: (stream.topBid ?? 0) > (stream.marketPrice ?? 0) ? '#22c55e' : '#ef4444',
              }}>
                {(stream.topBid ?? 0) > (stream.marketPrice ?? 0) ? '↑ Above market' : '↓ Below market'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder="Your bid (₡)"
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: 10,
                  border: '1px solid rgba(26,124,62,.3)', background: 'rgba(255,255,255,.04)',
                  color: '#f0f7f0', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button style={{
                padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #1a7c3e, #22c55e)',
                color: '#fff', fontWeight: 800, fontSize: 12,
              }}>
                🗣 Raise Voice
              </button>
            </div>
          </div>
        )

      case 'oracle':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
          }}>
            {/* Speaker circles */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
              background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
              borderRadius: 14, padding: '10px 14px',
            }}>
              {(stream.speakers ?? []).map((sp, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    className={sp.speaking ? 'jv-speaker' : ''}
                    style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${sp.color}, ${sp.color}88)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: '#fff',
                      border: sp.speaking ? `2px solid ${sp.color}` : '2px solid transparent',
                    }}
                  >
                    {sp.name.charAt(0)}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(240,247,240,.5)' }}>{sp.name}</div>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Talking Stick</div>
                <div className="jv-knot" style={{ fontSize: 18 }}>🪵</div>
              </div>
            </div>
            {/* Pulse vote */}
            <div style={{
              background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
              borderRadius: 14, padding: '10px 14px',
              border: '1px solid rgba(212,160,23,.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#22c55e' }}>{stream.agreePercent}%</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${stream.agreePercent}%`,
                    background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                    borderRadius: 3, transition: 'width .4s',
                  }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#ef4444' }}>{100 - (stream.agreePercent ?? 50)}%</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setAgreeVote('agree')}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: agreeVote === 'agree' ? 'rgba(34,197,94,.25)' : 'rgba(255,255,255,.06)',
                    color: agreeVote === 'agree' ? '#22c55e' : 'rgba(240,247,240,.5)',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  ✓ Agree
                </button>
                <button
                  onClick={() => setAgreeVote('disagree')}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: agreeVote === 'disagree' ? 'rgba(239,68,68,.25)' : 'rgba(255,255,255,.06)',
                    color: agreeVote === 'disagree' ? '#ef4444' : 'rgba(240,247,240,.5)',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  ✗ Disagree
                </button>
                <button
                  onClick={() => setHandRaised(!handRaised)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: handRaised ? 'rgba(212,160,23,.25)' : 'rgba(255,255,255,.06)',
                    color: handRaised ? '#d4a017' : 'rgba(240,247,240,.5)',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  {handRaised ? '🤚' : '✋'} Raise
                </button>
              </div>
            </div>
          </div>
        )

      case 'knowledge':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(79,70,229,.3)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em', marginBottom: 6 }}>
              🎓 {stream.lessonTitle}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(240,247,240,.3)', marginBottom: 8 }}>
              🌍 SPIRIT VOICE — SELECT LANGUAGE
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(stream.availableLangs ?? ['EN']).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: activeLang === lang ? 'rgba(79,70,229,.25)' : 'rgba(255,255,255,.05)',
                    color: activeLang === lang ? '#818cf8' : 'rgba(240,247,240,.4)',
                    fontSize: 11, fontWeight: 700,
                    outline: activeLang === lang ? '1px solid rgba(79,70,229,.4)' : 'none',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )

      case 'healing':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(3,105,161,.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)' }}>
                ⚕️ HEALTH SESSION
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, color: '#22c55e', padding: '2px 6px', borderRadius: 5,
                background: 'rgba(34,197,94,.12)',
              }}>
                🛡 NKISI VERIFIED
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{
                flex: 1, padding: '8px 10px', borderRadius: 10,
                background: 'rgba(3,105,161,.1)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#38bdf8', fontFamily: 'Sora, sans-serif' }}>
                  {stream.questionCount ?? 0}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Questions</div>
              </div>
              <div style={{
                flex: 1, padding: '8px 10px', borderRadius: 10,
                background: 'rgba(34,197,94,.08)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                  {stream.appointmentCount ?? 0}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Appointments</div>
              </div>
            </div>
            <button style={{
              width: '100%', padding: '8px 0', marginTop: 10, borderRadius: 10,
              background: 'rgba(3,105,161,.15)', border: '1px solid rgba(3,105,161,.3)',
              color: '#38bdf8', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              ❓ Ask a Question
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: tc.bgGrad,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Adinkra pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(45deg, ${tc.accent} 0px, transparent 1px, transparent 20px, ${tc.accent} 21px)`,
        backgroundSize: '28px 28px',
      }} />

      {/* ── Top HUD ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
        padding: '12px 14px', paddingTop: 'max(env(safe-area-inset-top), 12px)',
        background: 'linear-gradient(180deg, rgba(0,0,0,.7) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Back */}
          <button
            onClick={() => router.push('/dashboard/jollof')}
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ←
          </button>

          {/* Streamer info */}
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${tc.accent}, ${tc.accent}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff',
          }}>
            {stream.streamerName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
              {stream.streamerName}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(240,247,240,.5)' }}>
              {stream.streamerRole} · {stream.villageEmoji} {stream.village}
            </div>
          </div>

          {/* LIVE badge */}
          {stream.isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,.2)' }}>
              <div className="jv-live" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444' }}>LIVE</span>
            </div>
          )}

          {/* Viewer count */}
          <div style={{
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,.1)',
            fontSize: 10, fontWeight: 700, color: '#f0f7f0',
          }}>
            👁 {stream.viewerCount.toLocaleString()}
          </div>
        </div>

        {/* Title */}
        <div style={{
          marginTop: 8, fontSize: 14, fontWeight: 700, color: '#f0f7f0',
          fontFamily: 'Sora, sans-serif', lineHeight: 1.4,
        }}>
          {stream.title}
        </div>

        {/* Type badge + nkisi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 800,
            background: `${tc.accent}20`, color: tc.accent,
          }}>
            {tc.emoji} {tc.label.toUpperCase()}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
            background: stream.nkisi === 'GREEN' ? 'rgba(34,197,94,.12)' : 'rgba(234,179,8,.12)',
            color: stream.nkisi === 'GREEN' ? '#22c55e' : '#eab308',
          }}>
            🛡 {stream.nkisi}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(240,247,240,.35)', marginLeft: 'auto' }}>
            {stream.city}, {stream.country}
          </span>
        </div>
      </div>

      {/* ── Video Area (placeholder) ──────────────────────────── */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 48, color: 'rgba(255,255,255,.08)',
          fontFamily: 'Sora, sans-serif', fontWeight: 900,
        }}>
          {tc.emoji}
        </div>

        {/* Floating hearts */}
        {hearts.map(h => (
          <div
            key={h.id}
            style={{
              position: 'absolute', bottom: '50%', left: `${h.x}%`,
              fontSize: 24, animation: 'heartFloat 2s ease-out forwards',
              pointerEvents: 'none',
            }}
          >
            ⭐
          </div>
        ))}

        {/* ── Type overlay ────────────────────────────────────── */}
        {renderTypeOverlay()}
      </div>

      {/* ── Side action bar ───────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: 12, bottom: showChat ? 360 : 200,
        display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', zIndex: 10,
      }}>
        {/* Kíla */}
        <button
          onClick={handleKila}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: kilaed ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: kilaed ? '#d4a017' : 'rgba(255,255,255,.6)' }}>
            {stream.kilaCount}
          </span>
        </button>

        {/* Stir */}
        <button style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
          border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{stream.stirCount}</span>
        </button>

        {/* Spray */}
        <button
          onClick={() => setShowSpraySheet(true)}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(212,160,23,.2)', backdropFilter: 'blur(8px)',
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18 }}>🐚</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: '#d4a017' }}>{stream.sprayCount}</span>
        </button>

        {/* Chat toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: showChat ? `${tc.accent}30` : 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}
        >
          💬
        </button>
      </div>

      {/* ── Live Chat Panel ───────────────────────────────────── */}
      {showChat && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 280, zIndex: 6,
          background: 'linear-gradient(0deg, rgba(0,0,0,.85) 70%, transparent 100%)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '40px 14px 8px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {chatMessages.map(msg => (
              <div key={msg.id} className="jv-msg" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                {msg.isSpray ? (
                  <div style={{ fontSize: 12, color: '#d4a017', fontWeight: 700 }}>
                    <span style={{ color: '#f0f7f0', fontWeight: 800 }}>{msg.author}</span>
                    <span style={{ marginLeft: 4 }}>sprayed 🐚 ₡{msg.sprayAmount}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    <span style={{ color: tc.accent, fontWeight: 800 }}>
                      {CREST[msg.crestTier] ?? ''} {msg.author}
                    </span>
                    <span style={{ color: 'rgba(240,247,240,.7)', marginLeft: 5 }}>{msg.text}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 14px', paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
            display: 'flex', gap: 6,
          }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder="Say something..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
                color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSendChat}
              style={{
                padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: `${tc.accent}30`, color: tc.accent, fontWeight: 800, fontSize: 13,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* ── Spray Amount Sheet ────────────────────────────────── */}
      {showSpraySheet && (
        <div
          onClick={() => setShowSpraySheet(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,.6)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: '#1a1005',
              border: '1px solid rgba(212,160,23,.2)',
              borderRadius: '24px 24px 0 0', padding: '20px 20px 32px',
            }}
          >
            <div style={{
              width: 40, height: 4, borderRadius: 2, margin: '0 auto 16px',
              background: 'rgba(255,255,255,.15)',
            }} />
            <div style={{
              fontSize: 16, fontWeight: 900, color: '#f0f7f0', textAlign: 'center',
              fontFamily: 'Sora, sans-serif', marginBottom: 4,
            }}>
              🐚 Spray Cowries
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', textAlign: 'center', marginBottom: 16 }}>
              Show appreciation to {stream.streamerName}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[50, 200, 500, 1000].map(amt => (
                <button
                  key={amt} onClick={() => setSprayAmount(amt)}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: sprayAmount === amt ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.05)',
                    outline: sprayAmount === amt ? '2px solid rgba(212,160,23,.5)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>🐚</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: sprayAmount === amt ? '#d4a017' : '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
                    ₡{amt}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleSpray}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #d4a017, #e07b00)',
                color: '#000', fontWeight: 900, fontSize: 15, fontFamily: 'Sora, sans-serif',
              }}
            >
              Spray ₡{sprayAmount}
            </button>
          </div>
        </div>
      )}

      {/* ── Product Sheet (Market type) ───────────────────────── */}
      {showProductSheet && stream.pinnedProduct && (
        <div
          onClick={() => setShowProductSheet(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,.6)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: '#1a1005',
              border: '1px solid rgba(224,123,0,.2)',
              borderRadius: '24px 24px 0 0', padding: '20px 20px 32px',
            }}
          >
            <div style={{
              width: 40, height: 4, borderRadius: 2, margin: '0 auto 20px',
              background: 'rgba(255,255,255,.15)',
            }} />
            <div style={{
              width: 80, height: 80, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #e07b00, #d4a017)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36,
            }}>🛒</div>
            <div style={{
              fontSize: 18, fontWeight: 900, color: '#f0f7f0', textAlign: 'center',
              fontFamily: 'Sora, sans-serif', marginBottom: 4,
            }}>
              {stream.pinnedProduct.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(240,247,240,.4)', textAlign: 'center', marginBottom: 12 }}>
              {stream.pinnedProduct.soldCount} sold · {stream.pinnedProduct.marketPercent}% of market price
            </div>
            <div style={{
              fontSize: 28, fontWeight: 900, color: '#4ade80', textAlign: 'center',
              fontFamily: 'Sora, sans-serif', marginBottom: 20,
            }}>
              ₡{stream.pinnedProduct.price.toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowProductSheet(false)}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'rgba(255,255,255,.06)', color: '#f0f7f0', fontWeight: 700, fontSize: 14,
                }}
              >
                Back
              </button>
              <button style={{
                flex: 2, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #e07b00, #d4a017)',
                color: '#000', fontWeight: 900, fontSize: 15, fontFamily: 'Sora, sans-serif',
              }}>
                🫙 Add to Pot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
