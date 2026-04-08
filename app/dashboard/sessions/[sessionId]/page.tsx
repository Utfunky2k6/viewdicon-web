'use client'
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'

// ════════════════════════════════════════════════════════════════════
// Ogbo Ụtụ — Live Business Session Chat
// Route: /dashboard/sessions/[sessionId]
// The sovereign trade room. Every Cowrie is sealed by trust.
// ════════════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────────
type SessionStatus = 'PROPOSED' | 'NEGOTIATING' | 'LOCKED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'DISPUTED' | 'ABANDONED' | 'SEALED'
type SessionType = 'GOODS_SALE' | 'SERVICE_DELIVERY' | 'DELIVERY_ONLY' | 'PROFESSIONAL' | 'COMMUNITY'
type MessageType = 'TEXT' | 'PRICE_PROPOSAL' | 'PHOTO' | 'VOICE' | 'LOCATION_PIN' | 'SYSTEM_EVENT' | 'DISPUTE_RAISE'
type UserRole = 'initiator' | 'counterparty' | 'runner'

interface SessionMessage {
  id: string
  sessionId: string
  senderAfroId: string
  content: string
  messageType: MessageType
  metadata: any
  sentAt: string
}

interface RunnerInfo {
  afroId: string
  displayName: string
  vehicleType: string
  lat: number
  lng: number
  status: 'heading_to_pickup' | 'at_pickup' | 'in_transit' | 'at_dropoff'
}

interface SessionData {
  id: string
  sessionCode: string
  initiatorAfroId: string
  counterpartyAfroId: string | null
  runnerAfroId: string | null
  sessionType: SessionType
  title: string
  description: string | null
  status: SessionStatus
  agreedAmount: number | null
  escrowLocked: boolean
  deliveryRequired: boolean
  deliveryAddress: string | null
  proposedAt: string
  negotiatingAt: string | null
  lockedAt: string | null
  inTransitAt: string | null
  deliveredAt: string | null
  completedAt: string | null
  sealedAt: string | null
  messages: SessionMessage[]
}

// ── Status Config ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; emoji: string; bg: string }> = {
  PROPOSED:    { label: 'Proposed',    color: '#64748b', emoji: '📨', bg: 'rgba(100,116,139,.15)' },
  NEGOTIATING: { label: 'Negotiating', color: '#e07b00', emoji: '🤝', bg: 'rgba(224,123,0,.12)' },
  LOCKED:      { label: 'Escrow Locked', color: '#1a7c3e', emoji: '🔒', bg: 'rgba(26,124,62,.15)' },
  IN_TRANSIT:  { label: 'In Transit', color: '#3b82f6', emoji: '🚚', bg: 'rgba(59,130,246,.12)' },
  DELIVERED:   { label: 'Delivered',   color: '#8b5cf6', emoji: '📦', bg: 'rgba(139,92,246,.12)' },
  COMPLETED:   { label: 'Completed',   color: '#22c55e', emoji: '✅', bg: 'rgba(34,197,94,.12)' },
  DISPUTED:    { label: 'Disputed',    color: '#ef4444', emoji: '⚖️', bg: 'rgba(239,68,68,.12)' },
  ABANDONED:   { label: 'Abandoned',   color: '#6b7280', emoji: '💨', bg: 'rgba(107,114,128,.12)' },
  SEALED:      { label: 'Sealed',      color: '#f5c542', emoji: '🏛', bg: 'rgba(245,197,66,.12)' },
}

// ── Escrow Steps ───────────────────────────────────────────────────
const ESCROW_STEPS = [
  { key: 'agree',     label: 'Price Agreed',     emoji: '🤝' },
  { key: 'lock',      label: 'Escrow Locked',    emoji: '🔒' },
  { key: 'transit',   label: 'In Transit',       emoji: '🚚' },
  { key: 'delivered', label: 'Delivered',         emoji: '📦' },
  { key: 'sealed',    label: 'Sealed',            emoji: '🏛'  },
]

function escrowStepIndex(status: SessionStatus, agreedAmount: number | null): number {
  if (status === 'SEALED' || status === 'COMPLETED') return 4
  if (status === 'DELIVERED') return 3
  if (status === 'IN_TRANSIT') return 2
  if (status === 'LOCKED') return 1
  if (agreedAmount !== null && agreedAmount > 0) return 0
  return -1
}

// ── Mock Session Data ──────────────────────────────────────────────
const MY_AFRO_ID = 'NG-LAG-0001-0001'

// ── CSS ────────────────────────────────────────────────────────────
const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 6px rgba(26,124,62,.3)}50%{box-shadow:0 0 20px rgba(26,124,62,.6)}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes truckBounce{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
@keyframes sealStamp{0%{transform:scale(0) rotate(-15deg);opacity:0}60%{transform:scale(1.2) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
.ss-fade{animation:fadeUp .35s ease both}
.ss-sheet{animation:slideUp .3s ease both}
.ss-glow{animation:pulseGlow 2s ease-in-out infinite}
.ss-truck{animation:truckBounce 1.5s ease infinite}
.ss-seal{animation:sealStamp .6s ease both}
`

// ── Helper ─────────────────────────────────────────────────────────
function timeAgo(iso: string, nowMs: number): string {
  const diff = nowMs - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

function formatCowrie(n: number): string {
  return `₡${n.toLocaleString()}`
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function LiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  // ── State ──────────────────────────────────────────────────────
  const [session, setSession] = React.useState<SessionData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [input, setInput] = React.useState('')
  const [showPriceSheet, setShowPriceSheet] = React.useState(false)
  const [priceInput, setPriceInput] = React.useState('')
  const [showDisputeSheet, setShowDisputeSheet] = React.useState(false)
  const [disputeReason, setDisputeReason] = React.useState('')
  const [showRunnerTracker, setShowRunnerTracker] = React.useState(false)
  const [callingRunner, setCallingRunner] = React.useState(false)
  const [showEscrowExpanded, setShowEscrowExpanded] = React.useState(false)
  const [playingMsg, setPlayingMsg] = React.useState<string | null>(null)
  const [nowMs, setNowMs] = React.useState(0)
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setNowMs(Date.now())
  }, [])

  const fetchSession = async () => {
    try {
      const resp = await fetch(`http://localhost:3006/sessions/${sessionId}`, {
        headers: { 'x-afro-id': MY_AFRO_ID }
      })
      if (resp.ok) {
        const { session: data } = await resp.json()
        setSession(data)
      }
    } catch (err) {
      console.error('Failed to fetch session:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and polling
  React.useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, 3000)
    return () => clearInterval(interval)
  }, [sessionId])

  // CSS injection
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('live-sess-css')) {
      const s = document.createElement('style')
      s.id = 'live-sess-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (session?.messages) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [session?.messages.length])

  // ── Mutation helpers ───────────────────────────────────────────
  const addMessage = (msg: Omit<SessionMessage, 'id' | 'sentAt'>) => {
    if (!session) return
    const newMsg: SessionMessage = {
      ...msg,
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sentAt: new Date().toISOString(),
    }
    setSession(s => s ? ({ ...s, messages: [...s.messages, newMsg] }) : null)
  }

  const addSystemEvent = (content: string, eventType?: string) => {
    if (!session) return
    addMessage({
      sessionId: session.id,
      messageType: 'SYSTEM_EVENT',
      senderAfroId: 'system',
      content,
      metadata: { eventType },
    })
  }

  // ── Actions ────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim()
    if (!text || !session) return
    try {
      await fetch(`http://localhost:3006/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-afro-id': MY_AFRO_ID,
        },
        body: JSON.stringify({ content: text }),
      })
      setInput('')
      fetchSession()
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleProposePrice = async () => {
    const amount = parseFloat(priceInput)
    if (isNaN(amount) || amount <= 0 || !session) return
    try {
      await fetch(`http://localhost:3006/sessions/${sessionId}/propose-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-afro-id': MY_AFRO_ID,
        },
        body: JSON.stringify({ amount, currency: 'cowrie' }),
      })
      setShowPriceSheet(false)
      setPriceInput('')
      fetchSession()
    } catch (err) {
      console.error('Failed to propose price:', err)
    }
  }

  const handleAcceptPrice = async () => {
    if (!session) return
    try {
      await fetch(`http://localhost:3006/sessions/${sessionId}/accept-price`, {
        method: 'POST',
        headers: {
          'x-afro-id': MY_AFRO_ID,
        },
      })
      fetchSession()
    } catch (err) {
      console.error('Failed to accept price:', err)
    }
  }

  const handleCounterPrice = (originalAmount: number) => {
    setPriceInput(String(Math.round(originalAmount * 0.9)))
    setShowPriceSheet(true)
  }

  const handleLockEscrow = async () => {
    if (!session?.agreedAmount) return
    try {
      await fetch(`http://localhost:3006/sessions/${sessionId}/lock-escrow`, {
        method: 'POST',
        headers: {
          'x-afro-id': MY_AFRO_ID,
        },
      })
      fetchSession()
    } catch (err) {
      console.error('Failed to lock escrow:', err)
    }
  }

  const handleCallRunner = async () => {
    if (!session) return
    setCallingRunner(true)
    try {
      await fetch(`http://localhost:3006/sessions/${sessionId}/call-runner`, {
        method: 'POST',
        headers: {
          'x-afro-id': MY_AFRO_ID,
        },
      })
      fetchSession()
    } catch (err) {
      console.error('Failed to call runner:', err)
    } finally {
      setCallingRunner(false)
    }
  }

  const handleMarkDelivered = async () => {
    if (!session) return
    try {
      await fetch(`http://localhost:3006/sessions/${sessionId}/mark-delivered`, {
        method: 'POST',
        headers: {
          'x-afro-id': MY_AFRO_ID,
        },
      })
      fetchSession()
    } catch (err) {
      console.error('Failed to mark delivered:', err)
    }
  }

  const handleConfirmReceipt = async () => {
    if (!session) return
    try {
      // Simulate double verification signature for demo
      // In a real app, either the peer provides the code or signature is derived from local secret + fingerprint
      const deviceFingerprint = 'DEV-DEMO-123'
      const signature = 'SIGNATURE_SIMULATED'

      await fetch(`http://localhost:3006/sessions/${sessionId}/confirm-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-afro-id': MY_AFRO_ID,
        },
        body: JSON.stringify({ deviceFingerprint, signature }),
      })
      fetchSession()
    } catch (err) {
      console.error('Failed to confirm receipt:', err)
    }
  }

  const handleRaiseDispute = async () => {
    if (!disputeReason.trim() || !session) return
    try {
      await fetch(`http://localhost:3006/sessions/${sessionId}/raise-dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-afro-id': MY_AFRO_ID,
        },
        body: JSON.stringify({ reason: disputeReason.trim() }),
      })
      setShowDisputeSheet(false)
      setDisputeReason('')
      fetchSession()
    } catch (err) {
      console.error('Failed to raise dispute:', err)
    }
  }

  // ── Derived ────────────────────────────────────────────────────
  const sc = session ? STATUS_CONFIG[session.status] : STATUS_CONFIG.PROPOSED
  const escrowStep = session ? escrowStepIndex(session.status, session.agreedAmount) : -1
  const isMe = (afroId: string) => afroId === MY_AFRO_ID
  const isTerminal = session ? (session.status === 'SEALED' || session.status === 'ABANDONED') : false

  if (loading || !session) {
    return (
      <div style={{ minHeight: '100dvh', background: '#050a06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(26,124,62,.3)', borderTopColor: '#1a7c3e', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100dvh', maxHeight: '100dvh',
      background: '#050a06', color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(26,124,62,.15)',
        background: 'rgba(5,10,6,.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, cursor: 'pointer', color: '#f0f7f0', flexShrink: 0,
            }}
          >←</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
                {session.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                background: sc.bg, color: sc.color, letterSpacing: '.03em',
              }}>
                {sc.emoji} {sc.label}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(240,247,240,.35)', fontWeight: 600 }}>
                {session.sessionCode}
              </span>
            </div>
          </div>
          {/* Counterparty avatar */}
          {session.counterpartyAfroId && (
            <div style={{
              width: 34, height: 34, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #1a7c3e, #e07b00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff',
            }}>
              {session.counterpartyAfroId.charAt(0)}
            </div>
          )}
        </div>

        {/* ── Escrow Progress Bar ─────────────────────────────── */}
        {session.agreedAmount !== null && (
          <div
            onClick={() => setShowEscrowExpanded(!showEscrowExpanded)}
            style={{ cursor: 'pointer', padding: '6px 0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(240,247,240,.45)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Escrow {session.escrowLocked ? '🔒' : '⏳'}
              </span>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#4ade80' }}>
                {formatCowrie(session.agreedAmount)}
              </span>
            </div>
            {/* Step dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {ESCROW_STEPS.map((step, i) => (
                <React.Fragment key={step.key}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: i <= escrowStep
                      ? 'linear-gradient(135deg, #1a7c3e, #22c55e)'
                      : 'rgba(255,255,255,.08)',
                    border: i <= escrowStep ? 'none' : '1.5px solid rgba(255,255,255,.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, transition: 'all .3s',
                  }}>
                    {i <= escrowStep ? '✓' : ''}
                  </div>
                  {i < ESCROW_STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2,
                      background: i < escrowStep
                        ? 'linear-gradient(90deg, #1a7c3e, #22c55e)'
                        : 'rgba(255,255,255,.08)',
                      transition: 'background .5s',
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Expanded labels */}
            {showEscrowExpanded && (
              <div className="ss-fade" style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 6,
              }}>
                {ESCROW_STEPS.map((step, i) => (
                  <div key={step.key} style={{
                    fontSize: 8, textAlign: 'center', lineHeight: 1.2, flex: 1,
                    color: i <= escrowStep ? '#4ade80' : 'rgba(240,247,240,.3)',
                    fontWeight: i <= escrowStep ? 700 : 400,
                  }}>
                    {step.emoji}<br />{step.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Runner Tracker ─────────────────────────────────────── */}
      {session.runnerAfroId && session.status === 'IN_TRANSIT' && (
        <div
          className="ss-fade"
          onClick={() => setShowRunnerTracker(!showRunnerTracker)}
          style={{
            padding: '8px 14px', cursor: 'pointer',
            background: 'rgba(59,130,246,.08)', borderBottom: '1px solid rgba(59,130,246,.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ss-truck" style={{ fontSize: 18 }}>🚚</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd' }}>
                Runner assigned — Tracking Live
              </div>
              <div style={{ fontSize: 9, color: 'rgba(147,197,253,.5)', marginTop: 1 }}>
                Live updates active
              </div>
            </div>
            <div style={{
              fontSize: 8, fontWeight: 700, color: '#3b82f6', padding: '3px 8px',
              borderRadius: 6, background: 'rgba(59,130,246,.15)',
            }}>
              LIVE
            </div>
          </div>
          {showRunnerTracker && (
            <div className="ss-fade" style={{
              marginTop: 8, padding: 10, borderRadius: 10,
              background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.1)',
            }}>
              <div style={{
                height: 80, borderRadius: 8, background: 'rgba(0,0,0,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'rgba(147,197,253,.4)', marginBottom: 8,
              }}>
                Map view active for {session.runnerAfroId}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(147,197,253,.5)' }}>
                Delivery to: {session.deliveryAddress}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Messages Area ──────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex',
        flexDirection: 'column', gap: 8,
      }}>
        {session.messages.map((msg) => {
          const mine = isMe(msg.senderAfroId)
          const isSystem = msg.messageType === 'SYSTEM_EVENT'

          // System events
          if (isSystem) {
            return (
              <div key={msg.id} className="ss-fade" style={{
                display: 'flex', justifyContent: 'center', padding: '4px 0',
              }}>
                <div style={{
                  fontSize: 10, color: 'rgba(240,247,240,.4)', fontWeight: 600,
                  padding: '5px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)',
                  textAlign: 'center', maxWidth: '85%', lineHeight: 1.5,
                }}>
                  {msg.content}
                </div>
              </div>
            )
          }

          // Price Proposal
          if (msg.messageType === 'PRICE_PROPOSAL' && msg.metadata?.amount) {
            return (
              <div key={msg.id} className="ss-fade" style={{
                display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', borderRadius: 16,
                  background: mine
                    ? 'linear-gradient(135deg, rgba(26,124,62,.2), rgba(26,124,62,.08))'
                    : 'linear-gradient(135deg, rgba(224,123,0,.15), rgba(224,123,0,.06))',
                  border: mine
                    ? '1.5px solid rgba(26,124,62,.3)'
                    : '1.5px solid rgba(224,123,0,.25)',
                  padding: '12px 14px',
                  borderBottomRightRadius: mine ? 4 : 16,
                  borderBottomLeftRadius: mine ? 16 : 4,
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700, marginBottom: 4,
                    color: mine ? 'rgba(74,222,128,.7)' : 'rgba(224,123,0,.7)',
                    textTransform: 'uppercase', letterSpacing: '.08em',
                  }}>
                    {mine ? 'Your Proposal' : 'Proposal'}
                  </div>
                  <div style={{
                    fontSize: 22, fontWeight: 900, fontFamily: 'Sora, sans-serif',
                    color: mine ? '#4ade80' : '#f5c542',
                    marginBottom: 4,
                  }}>
                    {formatCowrie(msg.metadata.amount)}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(240,247,240,.5)', lineHeight: 1.4, marginBottom: 8 }}>
                    {msg.content}
                  </div>
                  {/* Accept / Counter buttons (only for proposals from OTHER party, and only while NEGOTIATING) */}
                  {!mine && session.status === 'NEGOTIATING' && session.agreedAmount === null && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleAcceptPrice()}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
                          background: 'linear-gradient(135deg, #1a7c3e, #22c55e)', color: '#fff',
                          fontSize: 11, fontWeight: 800, cursor: 'pointer',
                        }}
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleCounterPrice(msg.metadata!.amount!)}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 10,
                          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                          color: '#f0f7f0', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        ↩ Counter
                      </button>
                    </div>
                  )}
                  <div style={{ fontSize: 8, color: 'rgba(240,247,240,.25)', marginTop: 6, textAlign: 'right' }}>
                    {timeAgo(msg.sentAt, nowMs)}
                  </div>
                </div>
              </div>
            )
          }

          // Dispute
          if (msg.messageType === 'DISPUTE_RAISE') {
            return (
              <div key={msg.id} className="ss-fade" style={{
                display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', borderRadius: 16, padding: '12px 14px',
                  background: 'rgba(239,68,68,.1)', border: '1.5px solid rgba(239,68,68,.25)',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(239,68,68,.7)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                    ⚖️ Dispute Raised
                  </div>
                  <div style={{ fontSize: 12, color: '#f0f7f0', lineHeight: 1.5, marginBottom: 4 }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(239,68,68,.5)' }}>
                    Village Elders will review this dispute
                  </div>
                </div>
              </div>
            )
          }

          // Location Pin
          if (msg.messageType === 'LOCATION_PIN') {
            return (
              <div key={msg.id} className="ss-fade" style={{
                display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '75%', borderRadius: 16, overflow: 'hidden',
                  border: mine ? '1.5px solid rgba(26,124,62,.25)' : '1.5px solid rgba(255,255,255,.1)',
                }}>
                  <div style={{
                    height: 80, background: 'rgba(59,130,246,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>📍</div>
                  <div style={{
                    padding: '8px 12px',
                    background: mine ? 'rgba(26,124,62,.08)' : 'rgba(255,255,255,.04)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f0f7f0' }}>
                      {msg.metadata?.locationLabel || 'Shared Location'}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(240,247,240,.35)', marginTop: 2 }}>
                      {msg.metadata?.lat?.toFixed(4)}, {msg.metadata?.lng?.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Regular text / photo / voice
          return (
            <div key={msg.id} className="ss-fade" style={{
              display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end', gap: 6,
            }}>
              {!mine && (
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, #e07b00, #b45309)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: '#fff',
                }}>
                  {msg.senderAfroId.charAt(0)}
                </div>
              )}
              <div style={{ maxWidth: '75%' }}>
                {!mine && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(240,247,240,.35)', marginBottom: 2, paddingLeft: 2 }}>
                    Participant {msg.senderAfroId.slice(-4)}
                  </div>
                )}
                <div style={{
                  padding: '9px 12px', borderRadius: 14,
                  background: mine ? 'rgba(26,124,62,.15)' : 'rgba(255,255,255,.05)',
                  border: mine ? '1px solid rgba(26,124,62,.25)' : '1px solid rgba(255,255,255,.07)',
                  borderBottomRightRadius: mine ? 4 : 14,
                  borderBottomLeftRadius: mine ? 14 : 4,
                }}>
                  {msg.messageType === 'VOICE' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => { setPlayingMsg(p => p === msg.id ? null : msg.id); if (playingMsg !== msg.id) setTimeout(() => setPlayingMsg(null), 8000) }} style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, border: 'none',
                        background: mine ? '#1a7c3e' : 'rgba(255,255,255,.1)',
                        color: '#fff', fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{playingMsg === msg.id ? '⏸' : '▶'}</button>
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 1, height: 20,
                      }}>
                        {[65,42,88,35,72,55,90,28,78,45,62,85,38,95,50,70,32,80,58,43,75,92,47,68].map((h, i) => (
                          <div key={i} style={{
                            width: 2, borderRadius: 1, flex: 1,
                            height: `${h}%`,
                            background: mine ? 'rgba(74,222,128,.4)' : 'rgba(255,255,255,.2)',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 9, color: 'rgba(240,247,240,.35)', flexShrink: 0 }}>0:12</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: '#f0f7f0', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 8, color: 'rgba(240,247,240,.2)', marginTop: 2,
                  textAlign: mine ? 'right' : 'left', paddingLeft: 2, paddingRight: 2,
                }}>
                  {timeAgo(msg.sentAt, nowMs)}
                </div>
              </div>
            </div>
          )
        })}

        {/* Sealed stamp */}
        {session.status === 'SEALED' && (
          <div className="ss-seal" style={{
            display: 'flex', justifyContent: 'center', padding: '20px 0',
          }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              border: '4px solid rgba(245,197,66,.4)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(245,197,66,.08)',
            }}>
              <div style={{ fontSize: 32 }}>🏛</div>
              <div style={{ fontSize: 11, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: '#f5c542', marginTop: 4 }}>
                SEALED
              </div>
              <div style={{ fontSize: 8, color: 'rgba(245,197,66,.5)', marginTop: 2 }}>
                Ogbo Ụtụ Complete
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ── Action Bar ─────────────────────────────────────────── */}
      {!isTerminal && (
        <div style={{
          borderTop: '1px solid rgba(26,124,62,.12)',
          background: 'rgba(5,10,6,.97)', backdropFilter: 'blur(12px)',
        }}>
          {/* Status-specific action buttons */}
          <div style={{ padding: '8px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {/* NEGOTIATING — Lock escrow */}
            {session.status === 'NEGOTIATING' && session.agreedAmount !== null && (
              <button
                onClick={handleLockEscrow}
                className="ss-glow"
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #1a7c3e, #22c55e)',
                  color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  cursor: 'pointer',
                }}
              >
                🔒 Lock Escrow — {formatCowrie(session.agreedAmount)}
              </button>
            )}

            {/* NEGOTIATING — Propose price */}
            {session.status === 'NEGOTIATING' && session.agreedAmount === null && (
              <button
                onClick={() => setShowPriceSheet(true)}
                style={{
                  padding: '8px 14px', borderRadius: 10, border: 'none',
                  background: 'rgba(224,123,0,.15)', color: '#e07b00',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                💰 Propose Price
              </button>
            )}

            {/* LOCKED — Call runner */}
            {session.status === 'LOCKED' && session.deliveryRequired && !session.runnerAfroId && (
              <button
                onClick={handleCallRunner}
                disabled={callingRunner}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background: callingRunner ? 'rgba(59,130,246,.15)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  cursor: callingRunner ? 'not-allowed' : 'pointer', opacity: callingRunner ? 0.7 : 1,
                }}
              >
                {callingRunner ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)',
                      borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                      animation: 'spin .8s linear infinite',
                    }} />
                    Calling Runners...
                  </span>
                ) : '🚚 Call Runner'}
              </button>
            )}

            {/* LOCKED (no delivery) — Mark complete */}
            {session.status === 'LOCKED' && !session.deliveryRequired && (
              <button
                onClick={handleConfirmReceipt}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  cursor: 'pointer',
                }}
              >
                ✅ Confirm Service Complete
              </button>
            )}

            {/* IN_TRANSIT — runner mark delivered (simulating runner action) */}
            {session.status === 'IN_TRANSIT' && (
              <button
                onClick={handleMarkDelivered}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  cursor: 'pointer',
                }}
              >
                📦 Confirm Delivery (Runner)
              </button>
            )}

            {/* DELIVERED — confirm receipt */}
            {session.status === 'DELIVERED' && (
              <button
                onClick={handleConfirmReceipt}
                className="ss-glow"
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  cursor: 'pointer',
                }}
              >
                ✅ Confirm Receipt — Release Escrow
              </button>
            )}

            {/* DISPUTED indicator */}
            {session.status === 'DISPUTED' && (
              <div style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)',
                textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#ef4444',
              }}>
                ⚖️ Under Elder Review — Escrow is held
              </div>
            )}

            {/* Dispute button (available in LOCKED, IN_TRANSIT, DELIVERED) */}
            {['LOCKED', 'IN_TRANSIT', 'DELIVERED'].includes(session.status) && (
              <button
                onClick={() => setShowDisputeSheet(true)}
                style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)',
                  color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ⚖️
              </button>
            )}
          </div>

          {/* Message input */}
          {session.status !== 'DISPUTED' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 14px 12px',
            }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 0,
                background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)',
                borderRadius: 14, overflow: 'hidden',
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={
                    session.status === 'PROPOSED' ? 'Waiting for counterparty...' :
                    session.status === 'NEGOTIATING' ? 'Discuss terms...' :
                    session.status === 'LOCKED' ? 'Escrow locked — arrange delivery...' :
                    'Type a message...'
                  }
                  style={{
                    flex: 1, padding: '11px 14px', background: 'transparent',
                    border: 'none', outline: 'none', color: '#f0f7f0', fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: 'none', flexShrink: 0,
                  background: input.trim()
                    ? 'linear-gradient(135deg, #1a7c3e, #22c55e)'
                    : 'rgba(255,255,255,.06)',
                  color: '#fff', fontSize: 16, cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s',
                }}
              >
                ↑
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sealed footer */}
      {isTerminal && (
        <div style={{
          padding: '14px', borderTop: '1px solid rgba(245,197,66,.15)',
          background: 'rgba(245,197,66,.04)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f5c542', marginBottom: 6 }}>
            This session has been sealed
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,.06)', color: '#f0f7f0',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Return to Dashboard
          </button>
        </div>
      )}

      {/* ── Price Proposal Sheet ───────────────────────────────── */}
      {showPriceSheet && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowPriceSheet(false)}>
          <div
            className="ss-sheet"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: '#0a1a0e', borderRadius: '20px 20px 0 0',
              border: '1px solid rgba(26,124,62,.2)', borderBottom: 'none',
              padding: '20px 16px 32px',
            }}
          >
            <div style={{
              width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.12)',
              margin: '0 auto 16px',
            }} />
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
              💰 Propose a Price
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', marginBottom: 16, lineHeight: 1.5 }}>
              Your counterparty can accept, counter, or decline.
            </div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: 20, fontWeight: 900, color: '#4ade80',
              }}>₡</span>
              <input
                value={priceInput}
                onChange={e => setPriceInput(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                inputMode="decimal"
                autoFocus
                style={{
                  width: '100%', padding: '16px 14px 16px 40px', borderRadius: 14,
                  background: 'rgba(255,255,255,.05)', border: '2px solid rgba(26,124,62,.3)',
                  color: '#4ade80', fontSize: 28, fontWeight: 900, fontFamily: 'Sora, sans-serif',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[1000, 2500, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setPriceInput(String(amt))}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 10,
                    background: priceInput === String(amt) ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.04)',
                    border: priceInput === String(amt) ? '1px solid rgba(26,124,62,.4)' : '1px solid rgba(255,255,255,.08)',
                    color: '#f0f7f0', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {formatCowrie(amt)}
                </button>
              ))}
            </div>
            <button
              onClick={handleProposePrice}
              disabled={!priceInput || parseFloat(priceInput) <= 0}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                background: priceInput && parseFloat(priceInput) > 0
                  ? 'linear-gradient(135deg, #1a7c3e, #22c55e)'
                  : 'rgba(255,255,255,.08)',
                color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                cursor: priceInput && parseFloat(priceInput) > 0 ? 'pointer' : 'not-allowed',
                opacity: priceInput && parseFloat(priceInput) > 0 ? 1 : 0.4,
              }}
            >
              Send Proposal
            </button>
          </div>
        </div>
      )}

      {/* ── Dispute Sheet ──────────────────────────────────────── */}
      {showDisputeSheet && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowDisputeSheet(false)}>
          <div
            className="ss-sheet"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: '#0a1a0e', borderRadius: '20px 20px 0 0',
              border: '1px solid rgba(239,68,68,.2)', borderBottom: 'none',
              padding: '20px 16px 32px',
            }}
          >
            <div style={{
              width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.12)',
              margin: '0 auto 16px',
            }} />
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#ef4444', marginBottom: 4 }}>
              ⚖️ Raise a Dispute
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', marginBottom: 16, lineHeight: 1.5 }}>
              Escrow will be held until Village Elders resolve this. Use disputes only for genuine issues.
            </div>
            {/* Quick reasons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {[
                'Goods not as described',
                'Goods damaged during transit',
                'Seller is unresponsive',
                'Runner did not deliver',
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => setDisputeReason(reason)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                    background: disputeReason === reason ? 'rgba(239,68,68,.12)' : 'rgba(255,255,255,.03)',
                    border: disputeReason === reason ? '1px solid rgba(239,68,68,.3)' : '1px solid rgba(255,255,255,.06)',
                    color: '#f0f7f0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Or describe the issue in your own words..."
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(255,255,255,.08)',
                color: '#f0f7f0', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                resize: 'none', lineHeight: 1.5, marginBottom: 16, boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleRaiseDispute}
              disabled={!disputeReason.trim()}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                background: disputeReason.trim()
                  ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                  : 'rgba(255,255,255,.08)',
                color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                cursor: disputeReason.trim() ? 'pointer' : 'not-allowed',
                opacity: disputeReason.trim() ? 1 : 0.4,
              }}
            >
              Raise Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
