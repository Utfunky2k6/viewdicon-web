'use client'
// ═══════════════════════════════════════════════════════════════════
// INSIDE THE HUT — Individual Audio Room
// Live listening with speaker circles, talking stick & hand-raise
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

// ── Inject-once CSS ───────────────────────────────────────────────
const CSS_ID = 'inside-hut-css'
const CSS = `
@keyframes hutFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes talkingStickGlow { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.6)} 50%{box-shadow:0 0 0 18px rgba(212,160,23,0)} }
@keyframes speakingRing { 0%{box-shadow:0 0 0 0 rgba(34,211,238,.55)} 70%{box-shadow:0 0 0 12px rgba(34,211,238,0)} 100%{box-shadow:0 0 0 0 rgba(34,211,238,0)} }
@keyframes hostRing { 0%{box-shadow:0 0 0 0 rgba(74,222,128,.5)} 70%{box-shadow:0 0 0 14px rgba(74,222,128,0)} 100%{box-shadow:0 0 0 0 rgba(74,222,128,0)} }
@keyframes msgIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
@keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:.25} }
@keyframes handRaisePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes queueSlide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
.hut-fade { animation: hutFade .4s ease both }
.hut-talking-stick { animation: talkingStickGlow 1.4s ease-in-out infinite }
.hut-speaking { animation: speakingRing 1.3s ease-in-out infinite }
.hut-host-ring { animation: hostRing 1.6s ease-in-out infinite }
.hut-msg { animation: msgIn .25s ease both }
.hut-dot { animation: dotBlink .9s ease-in-out infinite }
.hut-hand-raise { animation: handRaisePulse 2s ease-in-out infinite }
.hut-queue { animation: queueSlide .3s ease both }
`

// ── Types ──────────────────────────────────────────────────────────
interface Participant {
  userId: string
  role: 'HOST' | 'SPEAKER' | 'LISTENER'
  isMuted: boolean
  handRaised?: boolean
}
interface ChatLine {
  id: string
  userId: string
  text: string
  ts: number
}
interface Room {
  id: string
  title: string
  hostId: string
  topic: string
  villageId: string
  isLive: boolean
  listenerCount: number
  participants: Participant[]
  createdAt?: string
}

// ── Mock Fallback Room ─────────────────────────────────────────────
const MOCK_ROOM: Room = {
  id: 'rm1', title: 'Pan-African Unity Debate', hostId: 'elder_kofi',
  topic: 'Politics & Governance', villageId: 'government', isLive: true,
  listenerCount: 342,
  createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  participants: [
    { userId: 'elder_kofi', role: 'HOST', isMuted: false },
    { userId: 'activist_a', role: 'SPEAKER', isMuted: false },
    { userId: 'voices_b', role: 'SPEAKER', isMuted: true },
    { userId: 'listener_c', role: 'LISTENER', isMuted: true },
    { userId: 'listener_d', role: 'LISTENER', isMuted: true },
    { userId: 'listener_e', role: 'LISTENER', isMuted: true },
  ],
}

const MOCK_CHAT: ChatLine[] = [
  { id: 'c1', userId: 'activist_a', text: 'This is a crucial conversation 🙌', ts: Date.now() - 30000 },
  { id: 'c2', userId: 'listener_c', text: 'Elder Kofi speaks wisdom', ts: Date.now() - 20000 },
  { id: 'c3', userId: 'listener_d', text: '💯 Pan-Africa united!', ts: Date.now() - 10000 },
]

// ── Helpers ────────────────────────────────────────────────────────
const VILLAGE_COLORS: Record<string, string> = {
  government: '#6366f1', agriculture: '#22c55e', technology: '#22d3ee',
  health: '#3b82f6', finance: '#f59e0b', arts: '#c084fc',
  education: '#f97316', fashion: '#ec4899', commerce: '#84cc16',
  spirituality: '#a78bfa', security: '#ef4444', family: '#fb923c',
}

function getInitials(userId: string) {
  const parts = userId.replace(/_/g, ' ').split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return userId.slice(0, 2).toUpperCase()
}
function villageColor(id: string) { return VILLAGE_COLORS[id] || '#4ade80' }
function formatMinutesAgo(iso?: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just started'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ${m % 60}m ago`
}

// ── Participant Circle ─────────────────────────────────────────────
function ParticipantCircle({
  participant, size, isTalkingStick, villageId,
}: {
  participant: Participant
  size: number
  isTalkingStick: boolean
  villageId: string
}) {
  const vc = villageColor(villageId)
  const isHost = participant.role === 'HOST'
  const isSpeaker = participant.role === 'SPEAKER'
  const borderColor = isHost ? '#4ade80' : isSpeaker ? '#22d3ee' : 'rgba(255,255,255,.18)'
  const bg = isHost
    ? 'linear-gradient(135deg,#1a7c3e 0%,#4ade80 100%)'
    : isSpeaker
    ? 'linear-gradient(135deg,#0369a1 0%,#22d3ee 100%)'
    : `linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)`

  const animClass = isTalkingStick ? 'hut-talking-stick' : isHost ? 'hut-host-ring' : isSpeaker && !participant.isMuted ? 'hut-speaking' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        className={animClass}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: bg,
          border: `2.5px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.3, fontWeight: 800, color: '#fff',
          position: 'relative',
        }}
      >
        {getInitials(participant.userId)}
        {/* Muted indicator */}
        {participant.isMuted && (isHost || isSpeaker) && (
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: size * 0.32, height: size * 0.32, borderRadius: '50%',
            background: '#ef4444', border: '2px solid #07090a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.14,
          }}>
            🔇
          </div>
        )}
        {/* Hand raised */}
        {participant.handRaised && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 20, height: 20, borderRadius: '50%',
            background: '#fbbf24', border: '2px solid #07090a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11,
          }}>
            ✋
          </div>
        )}
      </div>
      <div style={{
        fontSize: Math.max(9, size * 0.13), color: isHost ? '#4ade80' : isSpeaker ? '#22d3ee' : 'rgba(255,255,255,.35)',
        fontWeight: isHost || isSpeaker ? 600 : 400,
        fontFamily: 'DM Sans, sans-serif', textAlign: 'center', maxWidth: size + 16,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {isHost ? '🎙 HOST' : isSpeaker ? (participant.isMuted ? '🔇 MUTED' : '🎙 SPEAKING') : participant.userId.slice(0, 8)}
      </div>
    </div>
  )
}

// ── Chat Strip ─────────────────────────────────────────────────────
function ChatStrip({ lines }: { lines: ChatLine[] }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [lines])

  return (
    <div
      ref={ref}
      style={{
        height: 90, overflowY: 'auto', scrollbarWidth: 'none',
        display: 'flex', flexDirection: 'column', gap: 4,
        padding: '4px 0',
      } as React.CSSProperties}
    >
      {lines.slice(-12).map(l => (
        <div key={l.id} className="hut-msg" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee', flexShrink: 0 }}>
            {getInitials(l.userId)}:
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', lineHeight: 1.4 }}>
            {l.text}
          </span>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function InsideHutPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const roomId = (params as any).roomId as string
  const user = useAuthStore(s => s.user)
  const userId = user?.id || 'demo-user'

  const [room, setRoom] = React.useState<Room | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [chatLines, setChatLines] = React.useState<ChatLine[]>(MOCK_CHAT)
  const [chatInput, setChatInput] = React.useState('')
  const [handRaised, setHandRaised] = React.useState(false)
  const [talkingStickHolder, setTalkingStickHolder] = React.useState<string | null>(null)
  const [queue, setQueue] = React.useState<string[]>([])
  const [isMuted, setIsMuted] = React.useState(false)

  // Inject CSS
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Fetch room + join
  React.useEffect(() => {
    if (!roomId) return
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await jollofTvApi.audioRoom(roomId)
        const r = (data as any)?.room ?? (data as any)?.data ?? data
        if (mounted) {
          setRoom(r && r.id ? r : MOCK_ROOM)
          const host = (r?.participants ?? MOCK_ROOM.participants).find((p: Participant) => p.role === 'HOST')
          if (host) setTalkingStickHolder(host.userId)
        }
      } catch {
        if (mounted) {
          setRoom(MOCK_ROOM)
          setTalkingStickHolder(MOCK_ROOM.hostId)
        }
      } finally {
        if (mounted) setLoading(false)
      }
      // Join room
      try {
        await jollofTvApi.joinAudioRoom(roomId, userId)
      } catch {
        // silent — room still shown with mock
      }
    }
    load()
    return () => { mounted = false }
  }, [roomId, userId])

  // Simulate incoming chat
  React.useEffect(() => {
    const SAMPLE = [
      'This discussion is fire! 🔥', 'Thank you for having us Elder 🙏',
      'Pan-Africa shall be free!', '👂 Listening carefully...',
      'Great point about the AU framework', 'Unity is strength 🌍',
    ]
    const t = setInterval(() => {
      setChatLines(prev => [
        ...prev,
        {
          id: `auto-${Date.now()}`,
          userId: `user${Math.floor(Math.random() * 100)}`,
          text: SAMPLE[Math.floor(Math.random() * SAMPLE.length)],
          ts: Date.now(),
        },
      ].slice(-30))
    }, 8000)
    return () => clearInterval(t)
  }, [])

  function handleSendChat() {
    const text = chatInput.trim()
    if (!text) return
    setChatLines(prev => [
      ...prev,
      { id: `my-${Date.now()}`, userId, text, ts: Date.now() },
    ].slice(-30))
    setChatInput('')
  }

  function handleRaiseHand() {
    if (handRaised) {
      setHandRaised(false)
      setQueue(q => q.filter(u => u !== userId))
    } else {
      setHandRaised(true)
      setQueue(q => [...q, userId])
    }
  }

  function handlePassStick(toUserId: string) {
    setTalkingStickHolder(toUserId)
    setQueue(q => q.filter(u => u !== toUserId))
  }

  async function handleEndRoom() {
    try { await jollofTvApi.endAudioRoom(roomId) } catch { /* ignore */ }
    router.back()
  }

  if (loading || !room) {
    return (
      <div style={{
        minHeight: '100vh', background: '#07090a', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,.4)',
        flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 36 }}>🏛</div>
        <div>Entering the Hut...</div>
      </div>
    )
  }

  const participants = room.participants || []
  const host = participants.find(p => p.role === 'HOST')
  const speakers = participants.filter(p => p.role === 'SPEAKER')
  const listeners = participants.filter(p => p.role === 'LISTENER')
  const vc = villageColor(room.villageId)

  const userParticipant = participants.find(p => p.userId === userId)
  const userIsHost = userId === room.hostId || userParticipant?.role === 'HOST'
  const userIsSpeaker = userParticipant?.role === 'SPEAKER'

  return (
    <div style={{
      minHeight: '100vh', background: '#07090a',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.022) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      fontFamily: 'DM Sans, sans-serif',
      paddingBottom: 110,
    }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,9,10,.94)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {room.title}
          </div>
        </div>
        {/* LIVE badge + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(74,222,128,.12)', borderRadius: 20,
            padding: '3px 9px', border: '1px solid rgba(74,222,128,.3)',
          }}>
            <span className="hut-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '.05em' }}>LIVE</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
            🎧 {room.listenerCount.toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        {/* Topic + Created */}
        <div style={{ textAlign: 'center', padding: '22px 0 16px' }} className="hut-fade">
          <div style={{
            fontSize: 13, fontWeight: 700, color: vc,
            background: `${vc}18`, borderRadius: 20,
            padding: '4px 16px', display: 'inline-block', marginBottom: 8,
          }}>
            {room.topic}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
            Started {formatMinutesAgo(room.createdAt)}
          </div>
        </div>

        {/* Talking Stick Indicator */}
        {talkingStickHolder && (
          <div style={{
            textAlign: 'center', marginBottom: 14,
            fontSize: 12, fontWeight: 700,
            color: '#d4a017', letterSpacing: '.04em',
          }}>
            🎋 Talking Stick: {talkingStickHolder.replace(/_/g, ' ')}
          </div>
        )}

        {/* Hand-raise Queue strip */}
        {queue.length > 0 && (
          <div className="hut-queue" style={{
            background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)',
            borderRadius: 10, padding: '8px 14px', marginBottom: 14, textAlign: 'center',
          }}>
            <span style={{ fontSize: 12, color: '#fbbf24' }}>
              ✋ Next up: {queue.map(u => u.replace(/_/g, ' ')).join(', ')}
            </span>
          </div>
        )}

        {/* Speaker Circle Stage */}
        <div style={{
          background: 'rgba(255,255,255,.02)', borderRadius: 20,
          border: '1px solid rgba(255,255,255,.07)',
          padding: '28px 16px 24px', marginBottom: 14,
        }}>
          {/* HOST — center */}
          {host && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <ParticipantCircle
                participant={host}
                size={82}
                isTalkingStick={talkingStickHolder === host.userId}
                villageId={room.villageId}
              />
            </div>
          )}

          {/* SPEAKERS — semi-circle */}
          {speakers.length > 0 && (
            <>
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)',
                textAlign: 'center', letterSpacing: '.08em', marginBottom: 16,
                textTransform: 'uppercase',
              }}>
                Speakers
              </div>
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap',
                marginBottom: 24,
              }}>
                {speakers.map(p => (
                  <ParticipantCircle
                    key={p.userId}
                    participant={p}
                    size={62}
                    isTalkingStick={talkingStickHolder === p.userId}
                    villageId={room.villageId}
                  />
                ))}
              </div>
            </>
          )}

          {/* LISTENERS */}
          {listeners.length > 0 && (
            <>
              <div style={{
                width: '100%', height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 16,
              }} />
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.25)',
                textAlign: 'center', letterSpacing: '.08em', marginBottom: 14,
                textTransform: 'uppercase',
              }}>
                {listeners.length} Listening
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                {listeners.map(p => (
                  <ParticipantCircle
                    key={p.userId}
                    participant={p}
                    size={46}
                    isTalkingStick={false}
                    villageId={room.villageId}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Host Controls */}
        {userIsHost && (
          <div style={{
            background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.15)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, letterSpacing: '.06em' }}>
              HOST CONTROLS
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {queue.length > 0 && (
                <button
                  onClick={() => handlePassStick(queue[0])}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10,
                    background: 'rgba(212,160,23,.12)', border: '1px solid rgba(212,160,23,.3)',
                    color: '#d4a017', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  🎋 Pass Stick to {queue[0].replace(/_/g, ' ')}
                </button>
              )}
              <button
                onClick={handleEndRoom}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 10,
                  background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                  color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                End Room
              </button>
            </div>
          </div>
        )}

        {/* Speaker Controls */}
        {userIsSpeaker && !userIsHost && (
          <div style={{
            display: 'flex', gap: 10, marginBottom: 14,
          }}>
            <button
              onClick={() => setIsMuted(m => !m)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: isMuted ? 'rgba(239,68,68,.1)' : 'rgba(34,211,238,.1)',
                border: `1px solid ${isMuted ? 'rgba(239,68,68,.3)' : 'rgba(34,211,238,.3)'}`,
                color: isMuted ? '#ef4444' : '#22d3ee',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {isMuted ? '🔇 Unmute' : '🎙 Mute'}
            </button>
            <button
              onClick={() => router.back()}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Leave
            </button>
          </div>
        )}

        {/* Hand Raise (listeners only) */}
        {!userIsHost && !userIsSpeaker && (
          <div style={{ marginBottom: 14, textAlign: 'center' }}>
            <button
              onClick={handleRaiseHand}
              className={handRaised ? 'hut-hand-raise' : ''}
              style={{
                padding: '11px 36px', borderRadius: 24,
                background: handRaised ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${handRaised ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.12)'}`,
                color: handRaised ? '#fbbf24' : 'rgba(255,255,255,.6)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {handRaised ? '✋ Hand Raised — Tap to Lower' : '✋ Raise Hand'}
            </button>
          </div>
        )}

        {/* Chat Strip */}
        <div style={{
          background: 'rgba(255,255,255,.02)', borderRadius: 14,
          border: '1px solid rgba(255,255,255,.06)',
          padding: '12px 14px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)',
            letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Chat
          </div>
          <ChatStrip lines={chatLines} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendChat() }}
              placeholder="Say something..."
              style={{
                flex: 1, padding: '8px 12px',
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)',
                borderRadius: 20, color: '#fff', fontSize: 12,
                fontFamily: 'DM Sans, sans-serif', outline: 'none',
              }}
            />
            <button
              onClick={handleSendChat}
              style={{
                padding: '8px 14px', borderRadius: 20,
                background: '#4ade80', border: 'none',
                color: '#07090a', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Leave Room link (all users) */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,.3)', fontSize: 13,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              textDecoration: 'underline',
            }}
          >
            Leave Hut quietly
          </button>
        </div>
      </div>
    </div>
  )
}
