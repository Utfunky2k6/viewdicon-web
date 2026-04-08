/**
 * UFÈ — Station 2: Guided Chat
 * Structured conversations with icebreaker prompts.
 * 5-day window. Deeper truth. Conflict detection.
 */
'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav, LWBadge,
  LWDivider, LWEmpty, Spinner,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const T = REALM.ufe

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  isIcebreaker: boolean
  icebreakerPrompt?: string
  createdAt: string
}

export default function GuidedChatPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get('matchId') || ''

  const [messages, setMessages] = React.useState<Message[]>([])
  const [icebreakers, setIcebreakers] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [input, setInput] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [showIcebreakers, setShowIcebreakers] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const loadData = React.useCallback(async () => {
    if (!matchId) { setLoading(false); return }
    try {
      const [msgRes, ibRes] = await Promise.all([
        loveWorldApi.getChatMessages(matchId).catch((e) => { logApiFailure('love/station2/messages', e); return [] }),
        loveWorldApi.getIcebreakers(matchId).catch((e) => { logApiFailure('love/station2/icebreakers', e); return [] }),
      ])
      setMessages(Array.isArray(msgRes) ? msgRes : msgRes?.messages ?? [])
      setIcebreakers(Array.isArray(ibRes) ? ibRes : ibRes?.icebreakers ?? ibRes?.prompts ?? [])
    } catch (e) { logApiFailure('love/station2/send', e) }
    setLoading(false)
  }, [matchId])

  React.useEffect(() => { loadData() }, [loadData])
  React.useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (text?: string, isIcebreaker = false) => {
    const msg = text || input
    if (!msg.trim() || !matchId) return
    setSending(true)
    try {
      await loveWorldApi.sendChatMessage(matchId, { content: msg.trim(), isIcebreaker })
      setInput('')
      setShowIcebreakers(false)
      loadData()
    } catch (e) { logApiFailure('love/station2/action', e) }
    setSending(false)
  }

  return (
    <RealmProvider realm="ufe">
      <LWNav
        title="Guided Chat"
        backHref={matchId ? `/dashboard/love/matches/${matchId}` : '/dashboard/love/ufe'}
        backLabel="Back"
        right={<LWBadge variant="accent">5 Days</LWBadge>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 57px)' }}>
        {/* Station header */}
        <div style={{ padding: `${SPACE[3]}px ${SPACE[4]}px`, borderBottom: `1px solid ${COLOR.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
            <span style={{ fontSize: 18 }}>💬</span>
            <LWText scale="caption" color="secondary" as="span" style={{ fontWeight: 500 }}>Station 2 — Structured conversations for deeper truth</LWText>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: `${SPACE[4]}px ${SPACE[4]}px`,
          display: 'flex', flexDirection: 'column', gap: SPACE[3],
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: SPACE[10] }}><Spinner size={24} color={T.accent} /></div>
          ) : messages.length === 0 ? (
            <LWEmpty title="Start the conversation" message="Use an icebreaker prompt or send a message to begin your guided chat." />
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === 'me' || msg.senderName === 'You'
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: `${SPACE[3]}px ${SPACE[4]}px`,
                    background: isMe ? T.accentMuted : COLOR.elevated,
                    border: `1px solid ${isMe ? `${T.accent}30` : COLOR.border}`,
                    borderRadius: isMe ? `${RADIUS.xl} ${RADIUS.xl} ${RADIUS.sm} ${RADIUS.xl}` : `${RADIUS.xl} ${RADIUS.xl} ${RADIUS.xl} ${RADIUS.sm}`,
                  }}>
                    {msg.isIcebreaker && msg.icebreakerPrompt && (
                      <LWText scale="micro" color="accent" style={{ marginBottom: SPACE[1], fontStyle: 'italic' }}>
                        💡 {msg.icebreakerPrompt}
                      </LWText>
                    )}
                    <LWText scale="body" color={isMe ? 'primary' : 'secondary'}>{msg.content}</LWText>
                    <LWText scale="micro" color="muted" style={{ marginTop: SPACE[1], textAlign: 'right' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </LWText>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Icebreaker drawer */}
        {showIcebreakers && icebreakers.length > 0 && (
          <div style={{
            padding: `${SPACE[3]}px ${SPACE[4]}px`, borderTop: `1px solid ${COLOR.border}`,
            background: COLOR.elevated, display: 'flex', flexDirection: 'column', gap: SPACE[2], maxHeight: 200, overflowY: 'auto',
          }}>
            <LWText scale="micro" color="muted" transform="uppercase">Icebreaker Prompts</LWText>
            {icebreakers.map((ib, i) => (
              <button
                key={i}
                onClick={() => handleSend(ib, true)}
                style={{
                  padding: `${SPACE[2]}px ${SPACE[3]}px`, background: T.accentMuted,
                  border: `1px solid ${T.accent}30`, borderRadius: RADIUS.lg,
                  color: COLOR.textPrimary, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', fontSize: TYPE.caption.fontSize,
                }}
              >
                💡 {ib}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{
          padding: `${SPACE[3]}px ${SPACE[4]}px`, borderTop: `1px solid ${COLOR.border}`,
          display: 'flex', alignItems: 'center', gap: SPACE[2], background: T.surface,
        }}>
          <button
            onClick={() => setShowIcebreakers(!showIcebreakers)}
            style={{
              width: 36, height: 36, borderRadius: RADIUS.full,
              background: showIcebreakers ? T.accentMuted : 'transparent',
              border: `1px solid ${showIcebreakers ? T.accent : COLOR.border}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: showIcebreakers ? T.accent : COLOR.textMuted, fontSize: 16,
            }}
          >
            💡
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Type a message..."
            style={{
              flex: 1, height: 40, padding: `0 ${SPACE[4]}px`,
              background: COLOR.elevated, border: `1px solid ${COLOR.border}`,
              borderRadius: RADIUS.full, color: COLOR.textPrimary,
              fontSize: TYPE.body.fontSize, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: RADIUS.full,
              background: input.trim() ? T.accent : COLOR.elevated,
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: input.trim() ? 1 : 0.4,
            }}
          >
            {sending ? <Spinner size={16} color="#fff" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={input.trim() ? COLOR.textInverse : COLOR.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </RealmProvider>
  )
}
