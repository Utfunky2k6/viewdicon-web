'use client'
// ═══════════════════════════════════════════════════════════════════
// ASAFO GUARD — TV Chat Overlay Component
// Asafo = warrior company in Akan tradition
// Reusable chat panel for live TV channels and stream pages
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { jollofTvApi } from '@/lib/api'

// ── Inject-once CSS ───────────────────────────────────────────────
const CSS_ID = 'asafo-guard-css'
const CSS = `
@keyframes asafoMsgIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes asafoFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes asafoPinBounce{0%,100%{transform:scale(1)}40%{transform:scale(1.14)}}
@keyframes asafoGlow{0%,100%{opacity:.5}50%{opacity:1}}
.asafo-msg{animation:asafoMsgIn .25s ease both}
.asafo-fade{animation:asafoFadeIn .28s ease both}
.asafo-pin{animation:asafoPinBounce .45s ease 1}
.asafo-glow{animation:asafoGlow 2s ease-in-out infinite}
`

// ── Public prop types ─────────────────────────────────────────────
export interface TVChatOverlayProps {
  /** Channel ID to send / receive messages for */
  channelId: string
  /** Current user's AfroID */
  userId: string
  /** 'sidebar' = full panel (default) | 'overlay' = transparent float on video */
  mode?: 'sidebar' | 'overlay'
  /** Container height — default '100%' */
  height?: number | string
  /** Show tier selection UI — default true */
  showTiers?: boolean
}

// ── Internal types ────────────────────────────────────────────────
type ChatTier = 'FREE' | 'PAID_HIGHLIGHT' | 'PREMIUM_ONSCREEN' | 'SPONSORED_PINNED'

interface ChatMessage {
  id: string
  userId: string
  message: string
  type: ChatTier
  amountPaid: number
  isPinned: boolean
  createdAt: string
}

// ── Tier configuration ────────────────────────────────────────────
const TIER_CONFIG: Record<ChatTier, {
  label: string
  cost: number
  color: string
  dimColor: string
  badge: string
  description: string
}> = {
  FREE: {
    label: 'FREE',
    cost: 0,
    color: 'rgba(255,255,255,.65)',
    dimColor: 'rgba(255,255,255,.25)',
    badge: '',
    description: 'Free message',
  },
  PAID_HIGHLIGHT: {
    label: 'HIGHLIGHT',
    cost: 50,
    color: '#fbbf24',
    dimColor: 'rgba(251,191,36,.45)',
    badge: '🟡',
    description: 'Gold highlight with border',
  },
  PREMIUM_ONSCREEN: {
    label: 'ON AIR',
    cost: 200,
    color: '#c084fc',
    dimColor: 'rgba(192,132,252,.45)',
    badge: '📺',
    description: 'Full-width on-air banner',
  },
  SPONSORED_PINNED: {
    label: 'SPONSORED',
    cost: 1000,
    color: '#fbbf24',
    dimColor: 'rgba(251,191,36,.45)',
    badge: '📌',
    description: 'Pinned at top permanently',
  },
}

// ── Mock data fallback ────────────────────────────────────────────
const MOCK_CHATS: ChatMessage[] = [
  {
    id: 'm1',
    userId: 'user1',
    message: 'This show is incredible! 🔥',
    type: 'FREE',
    amountPaid: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 300_000).toISOString(),
  },
  {
    id: 'm2',
    userId: 'mama_africa',
    message: 'Watching from Lagos! Represent! 🇳🇬',
    type: 'PAID_HIGHLIGHT',
    amountPaid: 50,
    isPinned: false,
    createdAt: new Date(Date.now() - 240_000).toISOString(),
  },
  {
    id: 'm3',
    userId: 'griot_speaks',
    message: '🎙 MTN Nigeria sponsors this program — connecting Africa one call at a time',
    type: 'SPONSORED_PINNED',
    amountPaid: 1000,
    isPinned: true,
    createdAt: new Date(Date.now() - 180_000).toISOString(),
  },
  {
    id: 'm4',
    userId: 'tech_warrior',
    message: 'The algorithm needs to be open source!',
    type: 'FREE',
    amountPaid: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    id: 'm5',
    userId: 'cowrie_queen',
    message: '📺 BIG ANNOUNCEMENT: New episode drops next Friday!',
    type: 'PREMIUM_ONSCREEN',
    amountPaid: 200,
    isPinned: false,
    createdAt: new Date(Date.now() - 60_000).toISOString(),
  },
  {
    id: 'm6',
    userId: 'afro_dev',
    message: 'Can we get an API?? 😂',
    type: 'FREE',
    amountPaid: 0,
    isPinned: false,
    createdAt: new Date(Date.now() - 30_000).toISOString(),
  },
]

// ── Utility helpers ───────────────────────────────────────────────
function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  } catch {
    return ''
  }
}

function getInitials(userId: string): string {
  return (userId || 'U').slice(0, 2).toUpperCase()
}

// ── PREMIUM_ONSCREEN message ──────────────────────────────────────
function OnAirMessage({ msg, mode }: { msg: ChatMessage; mode: 'sidebar' | 'overlay' }) {
  return (
    <div
      className="asafo-msg"
      style={{
        width: '100%',
        marginBottom: 6,
        background: 'rgba(124,58,237,.14)',
        border: '1px solid rgba(192,132,252,.38)',
        borderRadius: 8,
        padding: '8px 10px',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 9,
          background: '#7c3aed',
          color: '#fff',
          borderRadius: 3,
          padding: '2px 6px',
          fontWeight: 700,
          fontFamily: 'Sora, sans-serif',
          flexShrink: 0,
        }}>
          📺 ON AIR
        </span>
        <span style={{
          fontSize: 10,
          color: '#c084fc',
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          @{msg.userId}
        </span>
        <span style={{
          fontSize: 8,
          color: 'rgba(255,255,255,.28)',
          marginLeft: 'auto',
          flexShrink: 0,
        }}>
          {formatTime(msg.createdAt)}
        </span>
      </div>
      <div style={{
        fontSize: mode === 'overlay' ? 11 : 12,
        color: 'rgba(255,255,255,.9)',
        fontFamily: 'DM Sans,sans-serif',
        lineHeight: 1.4,
        textShadow: mode === 'overlay' ? '0 1px 4px rgba(0,0,0,.85)' : 'none',
      }}>
        {msg.message}
      </div>
    </div>
  )
}

// ── PAID_HIGHLIGHT message ────────────────────────────────────────
function HighlightMessage({ msg, mode }: { msg: ChatMessage; mode: 'sidebar' | 'overlay' }) {
  return (
    <div
      className="asafo-msg"
      style={{
        display: 'flex',
        gap: 8,
        marginBottom: 5,
        borderLeft: '3px solid #fbbf24',
        background: 'rgba(251,191,36,.055)',
        borderRadius: '0 7px 7px 0',
        padding: '5px 8px 5px 6px',
      }}
    >
      <div style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fbbf24, #d4a017)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 8,
        fontWeight: 700,
        color: '#07090a',
        flexShrink: 0,
        marginTop: 1,
      }}>
        {getInitials(msg.userId)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700 }}>
          @{msg.userId}
        </span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,.28)', marginLeft: 6 }}>
          {formatTime(msg.createdAt)}
        </span>
        <div style={{
          fontSize: mode === 'overlay' ? 11 : 12,
          color: 'rgba(255,255,255,.85)',
          fontFamily: 'DM Sans,sans-serif',
          marginTop: 2,
          lineHeight: 1.4,
          textShadow: mode === 'overlay' ? '0 1px 3px rgba(0,0,0,.85)' : 'none',
        }}>
          {msg.message}
        </div>
      </div>
    </div>
  )
}

// ── FREE message ──────────────────────────────────────────────────
function FreeMessage({ msg, mode }: { msg: ChatMessage; mode: 'sidebar' | 'overlay' }) {
  return (
    <div
      className="asafo-msg"
      style={{
        display: 'flex',
        gap: 6,
        marginBottom: 3,
        alignItems: 'flex-start',
      }}
    >
      {mode === 'sidebar' && (
        <div style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 7,
          fontWeight: 700,
          color: 'rgba(255,255,255,.45)',
          flexShrink: 0,
          marginTop: 2,
        }}>
          {getInitials(msg.userId)}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.38)' }}>
          @{msg.userId}
        </span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,.2)', marginLeft: 5 }}>
          {formatTime(msg.createdAt)}
        </span>
        <div style={{
          fontSize: mode === 'overlay' ? 11 : 12,
          color: mode === 'overlay' ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.72)',
          fontFamily: 'DM Sans,sans-serif',
          marginTop: 1,
          lineHeight: 1.4,
          textShadow: mode === 'overlay'
            ? '0 1px 5px rgba(0,0,0,.9), 0 0 10px rgba(0,0,0,.6)'
            : 'none',
        }}>
          {msg.message}
        </div>
      </div>
    </div>
  )
}

// ── MessageBubble dispatcher ──────────────────────────────────────
function MessageBubble({ msg, mode }: { msg: ChatMessage; mode: 'sidebar' | 'overlay' }) {
  if (msg.type === 'PREMIUM_ONSCREEN') return <OnAirMessage msg={msg} mode={mode} />
  if (msg.type === 'PAID_HIGHLIGHT')   return <HighlightMessage msg={msg} mode={mode} />
  return <FreeMessage msg={msg} mode={mode} />
}

// ── Pinned sponsor banner (always at top) ─────────────────────────
function PinnedBanner({ msg }: { msg: ChatMessage }) {
  return (
    <div
      className="asafo-pin"
      style={{
        padding: '8px 12px',
        background: 'rgba(251,191,36,.07)',
        borderBottom: '1px solid rgba(251,191,36,.18)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>📌</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 3,
        }}>
          <span style={{
            fontSize: 8,
            background: '#d4a017',
            color: '#07090a',
            borderRadius: 3,
            padding: '1px 5px',
            fontWeight: 700,
            fontFamily: 'Sora, sans-serif',
          }}>
            SPONSOR
          </span>
          <span style={{ fontSize: 9, color: '#fbbf24', fontWeight: 600 }}>
            @{msg.userId}
          </span>
        </div>
        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,.8)',
          fontFamily: 'DM Sans,sans-serif',
          lineHeight: 1.4,
        }}>
          {msg.message}
        </div>
      </div>
    </div>
  )
}

// ── Tier selector pills ───────────────────────────────────────────
function TierSelector({
  selectedTier,
  onSelect,
}: {
  selectedTier: ChatTier
  onSelect: (t: ChatTier) => void
}) {
  const tiers: ChatTier[] = ['FREE', 'PAID_HIGHLIGHT', 'PREMIUM_ONSCREEN', 'SPONSORED_PINNED']

  return (
    <div style={{
      display: 'flex',
      gap: 5,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      paddingBottom: 1,
    }}>
      {tiers.map(tier => {
        const cfg    = TIER_CONFIG[tier]
        const active = selectedTier === tier
        return (
          <button
            key={tier}
            onClick={() => onSelect(tier)}
            style={{
              padding: '4px 10px',
              borderRadius: 16,
              flexShrink: 0,
              background: active ? `${cfg.color}1e` : 'rgba(255,255,255,.04)',
              border: active ? `1px solid ${cfg.color}` : '1px solid rgba(255,255,255,.08)',
              color: active ? cfg.color : 'rgba(255,255,255,.42)',
              fontSize: 10,
              fontWeight: active ? 700 : 400,
              cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif',
              transition: 'all .18s',
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.badge && <span style={{ marginRight: 3 }}>{cfg.badge}</span>}
            {cfg.label}
            {cfg.cost > 0 && (
              <span style={{ marginLeft: 4, opacity: .65 }}>{cfg.cost}₡</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Send confirmation row ─────────────────────────────────────────
function ConfirmRow({
  tier,
  onConfirm,
  onCancel,
}: {
  tier: ChatTier
  onConfirm: () => void
  onCancel: () => void
}) {
  const cfg = TIER_CONFIG[tier]
  return (
    <div
      className="asafo-fade"
      style={{
        marginTop: 7,
        padding: '8px 10px',
        background: `${cfg.color}0e`,
        border: `1px solid ${cfg.color}2a`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', flex: 1 }}>
        {cfg.badge} Send for <strong style={{ color: cfg.color }}>{cfg.cost}₡</strong>?
      </span>
      <button
        onClick={onConfirm}
        style={{
          padding: '4px 12px',
          borderRadius: 6,
          border: 'none',
          background: cfg.color,
          color: '#07090a',
          fontWeight: 700,
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: 'Sora, sans-serif',
        }}
      >
        Yes
      </button>
      <button
        onClick={onCancel}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,.14)',
          background: 'transparent',
          color: 'rgba(255,255,255,.5)',
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        No
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function TVChatOverlay({
  channelId,
  userId,
  mode = 'sidebar',
  height = '100%',
  showTiers = true,
}: TVChatOverlayProps) {
  const [messages, setMessages]         = React.useState<ChatMessage[]>(MOCK_CHATS)
  const [inputText, setInputText]       = React.useState('')
  const [selectedTier, setSelectedTier] = React.useState<ChatTier>('FREE')
  const [confirmSend, setConfirmSend]   = React.useState(false)
  const [sending, setSending]           = React.useState(false)
  const [overlayOpen, setOverlayOpen]   = React.useState(false)
  const [userScrolled, setUserScrolled] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const listRef        = React.useRef<HTMLDivElement>(null)

  // Inject CSS once
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style')
    s.id = CSS_ID
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Poll for new messages every 5 seconds
  React.useEffect(() => {
    let cancelled = false

    async function fetchMessages() {
      try {
        const res = await jollofTvApi.channelChat(channelId, 50)
        if (!cancelled && Array.isArray(res.chats) && res.chats.length > 0) {
          setMessages(res.chats as ChatMessage[])
        }
      } catch {
        // Keep current messages (mock or previous)
      }
    }

    fetchMessages()
    const iv = setInterval(fetchMessages, 5_000)
    return () => {
      cancelled = true
      clearInterval(iv)
    }
  }, [channelId])

  // Auto-scroll to newest message unless user has scrolled up
  React.useEffect(() => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, userScrolled])

  function handleListScroll() {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    setUserScrolled(scrollHeight - scrollTop - clientHeight > 42)
  }

  // Handle tier selection — reset confirmation
  function handleTierSelect(tier: ChatTier) {
    setSelectedTier(tier)
    setConfirmSend(false)
  }

  // Send message flow
  async function handleSend() {
    const text = inputText.trim()
    if (!text || sending) return

    const tierCfg = TIER_CONFIG[selectedTier]

    // Paid tiers require confirmation step
    if (tierCfg.cost > 0 && !confirmSend) {
      setConfirmSend(true)
      return
    }

    setSending(true)
    setConfirmSend(false)

    // Optimistic update
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      userId,
      message: text,
      type: selectedTier,
      amountPaid: tierCfg.cost,
      isPinned: selectedTier === 'SPONSORED_PINNED',
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setInputText('')
    setUserScrolled(false)

    try {
      await jollofTvApi.sendChat(channelId, {
        userId,
        message: text,
        type: selectedTier,
        amountPaid: tierCfg.cost,
      })
    } catch {
      // Optimistic message already visible; server will sync on next poll
    } finally {
      setSending(false)
    }
  }

  // Partition messages
  const pinnedMessages    = messages.filter(m => m.isPinned || m.type === 'SPONSORED_PINNED')
  const unpinnedMessages  = messages.filter(m => !m.isPinned && m.type !== 'SPONSORED_PINNED')
  const displayMessages   = mode === 'overlay' ? unpinnedMessages.slice(-8) : unpinnedMessages

  // ── OVERLAY MODE ────────────────────────────────────────────────
  if (mode === 'overlay') {
    return (
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 12,
        width: 280,
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        {/* Floating messages */}
        <div style={{
          maxHeight: 200,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 2,
          marginBottom: 10,
          pointerEvents: 'none',
        }}>
          {displayMessages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} mode="overlay" />
          ))}
        </div>

        {/* Controls row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            pointerEvents: 'auto',
          }}
        >
          {/* Chat toggle bubble */}
          <button
            onClick={() => setOverlayOpen(v => !v)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(0,0,0,.68)',
              border: '1px solid rgba(255,255,255,.18)',
              color: 'rgba(255,255,255,.85)',
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              flexShrink: 0,
            }}
          >
            💬
          </button>

          {overlayOpen && (
            <div
              className="asafo-fade"
              style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}
            >
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value.slice(0, 160))}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend()
                }}
                placeholder="Say something…"
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 20,
                  background: 'rgba(0,0,0,.72)',
                  border: '1px solid rgba(255,255,255,.18)',
                  color: 'rgba(255,255,255,.92)',
                  fontSize: 12,
                  fontFamily: 'DM Sans,sans-serif',
                  outline: 'none',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  background: inputText.trim() && !sending ? '#4ade80' : 'rgba(255,255,255,.14)',
                  color: inputText.trim() && !sending ? '#07090a' : 'rgba(255,255,255,.3)',
                  cursor: inputText.trim() && !sending ? 'pointer' : 'default',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background .18s, color .18s',
                }}
              >
                {sending ? '…' : '➤'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── SIDEBAR MODE ────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        background: '#0d1008',
        border: '1px solid rgba(255,255,255,.07)',
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: 'DM Sans,sans-serif',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          background: 'rgba(255,255,255,.018)',
        }}
      >
        <span style={{ fontSize: 14 }}>💬</span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'Sora, sans-serif',
          color: 'rgba(255,255,255,.86)',
          flex: 1,
        }}>
          Village Chat
        </span>
        <div
          className="asafo-glow"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 7px rgba(74,222,128,.6)',
          }}
        />
      </div>

      {/* Pinned sponsor messages — always at top */}
      {pinnedMessages.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          {pinnedMessages.map(m => (
            <PinnedBanner key={m.id} msg={m} />
          ))}
        </div>
      )}

      {/* Message list */}
      <div
        ref={listRef}
        onScroll={handleListScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 10px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,.07) transparent',
        }}
      >
        {displayMessages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} mode="sidebar" />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom nudge */}
      {userScrolled && (
        <button
          onClick={() => {
            setUserScrolled(false)
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
          style={{
            position: 'relative',
            margin: '0 10px',
            padding: '5px',
            borderRadius: 6,
            background: 'rgba(74,222,128,.12)',
            border: '1px solid rgba(74,222,128,.25)',
            color: '#4ade80',
            fontSize: 10,
            cursor: 'pointer',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          ↓ New messages
        </button>
      )}

      {/* Tier selector */}
      {showTiers && (
        <div style={{
          flexShrink: 0,
          padding: '8px 10px 0',
          borderTop: '1px solid rgba(255,255,255,.05)',
        }}>
          <TierSelector selectedTier={selectedTier} onSelect={handleTierSelect} />

          {/* Cost confirmation */}
          {confirmSend && TIER_CONFIG[selectedTier].cost > 0 && (
            <ConfirmRow
              tier={selectedTier}
              onConfirm={handleSend}
              onCancel={() => setConfirmSend(false)}
            />
          )}
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: '8px 10px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Text field with char counter */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={inputText}
              onChange={e => {
                setInputText(e.target.value.slice(0, 160))
                if (confirmSend) setConfirmSend(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) handleSend()
              }}
              placeholder="Speak to the village…"
              style={{
                width: '100%',
                padding: '9px 38px 9px 12px',
                borderRadius: 20,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.9)',
                fontSize: 12,
                fontFamily: 'DM Sans,sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .18s',
              }}
            />
            {inputText.length > 0 && (
              <span style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 8,
                color: inputText.length > 140 ? '#ef4444' : 'rgba(255,255,255,.28)',
                pointerEvents: 'none',
                fontFamily: 'Sora, sans-serif',
              }}>
                {160 - inputText.length}
              </span>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              flexShrink: 0,
              background: inputText.trim() && !sending ? '#4ade80' : 'rgba(255,255,255,.07)',
              color: inputText.trim() && !sending ? '#07090a' : 'rgba(255,255,255,.28)',
              cursor: inputText.trim() && !sending ? 'pointer' : 'default',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .2s, color .2s',
              fontWeight: 700,
            }}
          >
            {sending ? '…' : '➤'}
          </button>
        </div>

        {/* Selected tier cost hint */}
        {showTiers && TIER_CONFIG[selectedTier].cost > 0 && !confirmSend && (
          <div style={{
            marginTop: 5,
            fontSize: 9,
            color: TIER_CONFIG[selectedTier].dimColor,
            textAlign: 'center',
            fontFamily: 'DM Sans,sans-serif',
          }}>
            {TIER_CONFIG[selectedTier].badge} {TIER_CONFIG[selectedTier].description} · {TIER_CONFIG[selectedTier].cost}₡ per message
          </div>
        )}
      </div>
    </div>
  )
}
