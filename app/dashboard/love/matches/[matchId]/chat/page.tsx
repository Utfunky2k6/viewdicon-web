/**
 * UFE -- Station 2: Guided Chat
 *
 * Structured conversation between two matched people.
 * iMessage-clean, WhatsApp-focused. AI signals visible but not intrusive.
 *
 * Design tokens only. No inline fetchApi. No local color maps.
 */
'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import { RealmProvider, LWText, LWNav, LWBadge, LWSkeleton } from '@/components/love-world/primitives'
import { usePolling } from '@/components/love-world/hooks'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

/* ─── Constants ─── */

const T = REALM.ufe
const POLL_INTERVAL = 3000

/* ─── Types ─── */

interface ChatMessage {
  id: string
  senderId: string
  content: string
  createdAt: string
  type: 'TEXT' | 'VOICE' | 'SYSTEM' | 'AI_SIGNAL'
}

/* ─── Helpers ─── */

function formatDateSeparator(dateStr: string, now: Date): string {
  const d = new Date(dateStr)
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

/* ─── Main component ─── */

export default function GuidedChatPage() {
  const { matchId } = useParams() as { matchId: string }

  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [input, setInput] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [myId, setMyId] = React.useState('')
  const [partnerName, setPartnerName] = React.useState('')
  const [icebreakers, setIcebreakers] = React.useState<string[]>([])

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [clientNow, setClientNow] = React.useState<Date>(() => new Date(0))

  /* ── Data loading ── */

  const loadMessages = React.useCallback(async () => {
    try {
      const res = await loveWorldApi.getChatMessages(matchId)
      if (res?.messages) setMessages(res.messages)
    } catch (e) { logApiFailure('love/chat/messages', e) }
  }, [matchId])

  const loadInitial = React.useCallback(async () => {
    const [chatRes, matchRes, iceRes] = await Promise.allSettled([
      loveWorldApi.getChatMessages(matchId),
      loveWorldApi.getMatch(matchId),
      loveWorldApi.getIcebreakers(matchId),
    ])

    if (chatRes.status === 'fulfilled' && chatRes.value?.messages) {
      setMessages(chatRes.value.messages)
    }

    if (matchRes.status === 'fulfilled') {
      const m = matchRes.value?.match || matchRes.value
      if (m) {
        setMyId(m.userId || m.myId || '')
        setPartnerName(m.partnerName || m.partner?.name || 'Partner')
      }
    }

    if (iceRes.status === 'fulfilled' && iceRes.value?.icebreakers) {
      setIcebreakers(iceRes.value.icebreakers.slice(0, 3))
    }

    setLoading(false)
  }, [matchId])

  React.useEffect(() => { loadInitial() }, [loadInitial])
  React.useEffect(() => { setClientNow(new Date()) }, [])

  /* ── Real-time polling ── */

  usePolling(loadMessages, POLL_INTERVAL, !loading)

  /* ── Auto-scroll on new messages ── */

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  /* ── Send message ── */

  async function handleSend(text?: string) {
    const content = (text || input).trim()
    if (!content || sending) return

    setSending(true)
    setInput('')

    // Optimistic update
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: myId,
      content,
      createdAt: new Date().toISOString(),
      type: 'TEXT',
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      await loveWorldApi.sendChatMessage(matchId, { content })
      await loadMessages()
    } catch (e) { logApiFailure('love/chat/send', e) }

    setSending(false)
    inputRef.current?.focus()
  }

  function handleIcebreaker(prompt: string) {
    setInput(prompt)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /* ── Loading state ── */

  if (loading) {
    return (
      <RealmProvider realm="ufe">
        <LWNav
          title="Chat"
          backHref={`/dashboard/love/matches/${matchId}`}
          backLabel="Match"
        />
        <div style={{
          padding: SPACE[4],
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[3],
        }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: i % 2 ? 'flex-start' : 'flex-end',
              }}
            >
              <LWSkeleton
                width={i % 3 === 0 ? '45%' : '65%'}
                height={i === 3 ? 64 : 48}
                radius={RADIUS.lg}
              />
            </div>
          ))}
        </div>
      </RealmProvider>
    )
  }

  /* ── Render helpers ── */

  function renderDateSeparator(dateStr: string) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: `${SPACE[3]}px 0`,
      }}>
        <LWText
          scale="micro"
          color="muted"
          as="span"
          style={{
            display: 'inline-block',
            padding: `${SPACE[1]}px ${SPACE[3]}px`,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: RADIUS.full,
          }}
        >
          {formatDateSeparator(dateStr, clientNow)}
        </LWText>
      </div>
    )
  }

  function renderSystemMessage(msg: ChatMessage) {
    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: `${SPACE[2]}px 0`,
        }}
      >
        <LWText
          scale="micro"
          color="muted"
          as="span"
          style={{
            display: 'inline-block',
            padding: `${SPACE[1]}px ${SPACE[3]}px`,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: RADIUS.full,
          }}
        >
          {msg.content}
        </LWText>
      </div>
    )
  }

  function renderAiSignal(msg: ChatMessage) {
    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: `${SPACE[2]}px 0`,
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: SPACE[1.5],
          padding: `${SPACE[1]}px ${SPACE[3]}px`,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${T.accent}20`,
          borderRadius: RADIUS.full,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke={T.accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LWText
            scale="micro"
            as="span"
            style={{ color: T.accent, opacity: 0.85 }}
          >
            {msg.content}
          </LWText>
        </div>
      </div>
    )
  }

  function renderBubble(msg: ChatMessage) {
    const isMine = msg.senderId === myId

    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: isMine ? 'flex-end' : 'flex-start',
          animation: `lw-fade-in ${DURATION.fast} ${EASE.default}`,
        }}
      >
        <div style={{
          maxWidth: '75%',
          padding: `${SPACE[2]}px ${SPACE[3]}px`,
          borderRadius: isMine
            ? `${RADIUS.lg} ${RADIUS.lg} ${RADIUS.sm} ${RADIUS.lg}`
            : `${RADIUS.lg} ${RADIUS.lg} ${RADIUS.lg} ${RADIUS.sm}`,
          background: isMine ? T.accent : COLOR.elevated,
          color: isMine ? COLOR.textInverse : COLOR.textPrimary,
        }}>
          <LWText scale="body" as="span" style={{ color: 'inherit' }}>
            {msg.content}
          </LWText>
          <div style={{
            ...TYPE.micro,
            color: isMine ? 'rgba(0,0,0,0.45)' : COLOR.textMuted,
            textAlign: 'right' as const,
            marginTop: SPACE[0.5],
          }}>
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </div>
    )
  }

  function renderMessages() {
    const elements: React.ReactNode[] = []

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const prev = i > 0 ? messages[i - 1] : null

      // Date separator when crossing day boundary
      if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
        elements.push(
          <React.Fragment key={`sep-${msg.id}`}>
            {renderDateSeparator(msg.createdAt)}
          </React.Fragment>
        )
      }

      // Render by type
      if (msg.type === 'SYSTEM') {
        elements.push(renderSystemMessage(msg))
      } else if (msg.type === 'AI_SIGNAL') {
        elements.push(renderAiSignal(msg))
      } else {
        elements.push(renderBubble(msg))
      }
    }

    return elements
  }

  /* ── Icebreakers (shown when no messages exist) ── */

  function renderIcebreakers() {
    if (messages.length > 0 || icebreakers.length === 0) return null

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: SPACE[3],
        padding: `${SPACE[10]}px ${SPACE[4]}px`,
      }}>
        <LWText scale="caption" color="muted" align="center">
          Start with an icebreaker
        </LWText>
        {icebreakers.map((ib, i) => (
          <button
            key={i}
            onClick={() => handleIcebreaker(ib)}
            style={{
              padding: `${SPACE[2]}px ${SPACE[4]}px`,
              background: T.accentMuted,
              border: `1px solid ${T.accent}20`,
              borderRadius: RADIUS.lg,
              fontFamily: 'inherit',
              cursor: 'pointer',
              ...TYPE.caption,
              color: T.accent,
              textAlign: 'center',
              maxWidth: 280,
              transition: `all ${DURATION.fast} ${EASE.default}`,
            }}
          >
            {ib}
          </button>
        ))}
      </div>
    )
  }

  /* ── Send icon ── */

  const hasText = input.trim().length > 0

  const sendIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  /* ── Main layout ── */

  return (
    <RealmProvider realm="ufe">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
      }}>
        {/* Header */}
        <LWNav
          title={partnerName}
          backHref={`/dashboard/love/matches/${matchId}`}
          backLabel="Match"
          right={<LWBadge variant="accent">Station 2</LWBadge>}
        />

        {/* Messages area */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[2]}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: SPACE[2],
          }}
        >
          {renderIcebreakers()}
          {renderMessages()}
        </div>

        {/* Input bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[2],
          padding: `${SPACE[2]}px ${SPACE[3]}px`,
          borderTop: `1px solid ${COLOR.border}`,
          background: T.surface,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{
              flex: 1,
              height: 40,
              padding: `0 ${SPACE[3]}px`,
              background: COLOR.elevated,
              border: `1px solid ${COLOR.border}`,
              borderRadius: RADIUS.full,
              color: COLOR.textPrimary,
              fontSize: TYPE.body.fontSize,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!hasText || sending}
            style={{
              width: 40,
              height: 40,
              borderRadius: RADIUS.full,
              border: 'none',
              background: hasText ? T.accent : COLOR.borderStrong,
              color: hasText ? COLOR.textInverse : COLOR.textMuted,
              cursor: hasText ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: `all ${DURATION.fast} ${EASE.default}`,
            }}
          >
            {sendIcon}
          </button>
        </div>
      </div>
    </RealmProvider>
  )
}
