'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loveWorldApi } from '../../../../../../lib/api'
import { useAuthStore } from '../../../../../../stores/authStore'

interface ChatMessage {
  id: string; senderAfroId: string; senderName?: string; content: string
  isIcebreaker?: boolean; icebreakerPrompt?: string
  flagResult?: { type: string; message: string } | null
  createdAt: string
}
interface Icebreaker { id: string; prompt: string; category?: string }

const GOLD = '#D4AF37'
const BG = '#0A0A0F'
const CARD = '#111118'
const CARD2 = '#1A1A25'
const GREEN = '#00C853'
const RED = '#FF3B30'
const WHITE = '#FFFFFF'
const BLUE = '#4A90D9'

export default function GuidedChatPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const myAfroId = user?.afroId || ''

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [icebreakers, setIcebreakers] = useState<Icebreaker[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [selectedIce, setSelectedIce] = useState<Icebreaker | null>(null)
  const [iceOpen, setIceOpen] = useState(false)
  const [dayNum, setDayNum] = useState(1)
  const [flagBanner, setFlagBanner] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const iceUsedCount = messages.filter(m => m.senderAfroId === myAfroId && m.isIcebreaker).length

  const fetchData = useCallback(async () => {
    if (!matchId) return
    try {
      const [msgRes, iceRes] = await Promise.all([
        loveWorldApi.getChatMessages(matchId).catch(() => ({ data: [] })),
        loveWorldApi.getIcebreakers(matchId).catch(() => ({ data: [] })),
      ])
      const msgArr = Array.isArray(msgRes) ? msgRes : msgRes?.data || []
      setMessages(msgArr.sort((a: ChatMessage, b: ChatMessage) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
      setIcebreakers(Array.isArray(iceRes) ? iceRes : iceRes?.data || [])
      if (msgRes?.dayNumber) setDayNum(msgRes.dayNumber)
      // Check last messages for flags
      const flagged = msgArr.find((m: ChatMessage) => m.flagResult)
      if (flagged?.flagResult) setFlagBanner(flagged.flagResult.message)
    } catch { /* silent */ } finally { setLoading(false) }
  }, [matchId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!matchId || !text.trim()) return
    setSending(true)
    setFlagBanner(null)
    try {
      const res = await loveWorldApi.sendChatMessage(matchId, {
        content: text.trim(),
        isIcebreaker: !!selectedIce,
        icebreakerPrompt: selectedIce?.prompt,
      })
      setText('')
      setSelectedIce(null)
      // If the response contains a flag
      if (res?.flagResult) setFlagBanner(res.flagResult.message)
      await fetchData()
    } catch { /* silent */ } finally { setSending(false) }
  }

  const pickIcebreaker = (ice: Icebreaker) => {
    setSelectedIce(ice)
    setText(ice.prompt)
    setIceOpen(false)
  }

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: GOLD, fontFamily: 'monospace', fontSize: 14 }}>Loading Guided Chat...</p>
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'monospace', color: WHITE, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 10px', borderBottom: `1px solid ${CARD2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 20, cursor: 'pointer', padding: 0 }}>
            &larr;
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, color: GOLD, fontFamily: 'monospace' }}>Guided Chat</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: WHITE, opacity: 0.6 }}>Day {dayNum}/5</span>
            <span style={{ background: CARD2, padding: '4px 10px', borderRadius: 8, fontSize: 11, color: BLUE }}>
              Icebreakers: {iceUsedCount}
            </span>
          </div>
        </div>

        {/* Day progress bar */}
        <div style={{ marginTop: 10, height: 4, background: CARD2, borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${(dayNum / 5) * 100}%`, background: GOLD, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Flag banner */}
      {flagBanner && (
        <div style={{ padding: '10px 16px', background: RED, color: WHITE, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>&#9888;</span>
          <span style={{ flex: 1 }}>{flagBanner}</span>
          <button onClick={() => setFlagBanner(null)} style={{ background: 'none', border: 'none', color: WHITE, fontSize: 16, cursor: 'pointer' }}>x</button>
        </div>
      )}

      {/* Icebreaker strip (collapsible) */}
      {icebreakers.length > 0 && (
        <div style={{ borderBottom: `1px solid ${CARD2}` }}>
          <button onClick={() => setIceOpen(!iceOpen)}
            style={{
              width: '100%', background: CARD, border: 'none', padding: '10px 16px',
              color: BLUE, fontFamily: 'monospace', fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
            }}>
            <span>&#9733;</span>
            <span style={{ flex: 1 }}>Icebreaker Prompts ({icebreakers.length})</span>
            <span style={{ transform: iceOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>&#9660;</span>
          </button>
          {iceOpen && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px 12px', overflowX: 'auto' }}>
              {icebreakers.map(ice => (
                <button key={ice.id} onClick={() => pickIcebreaker(ice)}
                  style={{
                    flex: '0 0 auto', maxWidth: 200, padding: '8px 12px', borderRadius: 10,
                    background: CARD2, border: `1px solid ${BLUE}33`, color: WHITE,
                    fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', textAlign: 'left', lineHeight: 1.4,
                  }}>
                  <span style={{ color: BLUE, marginRight: 4 }}>&#9733;</span>{ice.prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>&#128172;</p>
            <p style={{ fontSize: 13 }}>Start the conversation! Try an icebreaker above.</p>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.senderAfroId === myAfroId
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 14,
                background: isMine ? GOLD : CARD,
                color: isMine ? BG : WHITE,
                borderBottomRightRadius: isMine ? 4 : 14,
                borderBottomLeftRadius: isMine ? 14 : 4,
                border: msg.isIcebreaker ? `1px solid ${BLUE}` : 'none',
              }}>
                {!isMine && msg.senderName && (
                  <div style={{ fontSize: 10, color: BLUE, marginBottom: 4, fontWeight: 600 }}>{msg.senderName}</div>
                )}
                {msg.isIcebreaker && (
                  <div style={{ fontSize: 10, color: isMine ? BG : BLUE, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8 }}>
                    <span>&#9733;</span> Icebreaker
                  </div>
                )}
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
                <div style={{ fontSize: 9, opacity: 0.5, marginTop: 4, textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer */}
      <div style={{ borderTop: `1px solid ${CARD2}`, padding: 14, background: CARD }}>
        {selectedIce && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            background: `${BLUE}22`, padding: '6px 10px', borderRadius: 8, fontSize: 11, color: BLUE,
          }}>
            <span>&#9733;</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedIce.prompt}
            </span>
            <button onClick={() => { setSelectedIce(null); setText('') }}
              style={{ background: 'none', border: 'none', color: RED, fontSize: 14, cursor: 'pointer', padding: 0 }}>x</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${CARD2}`,
              background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
            }} />
          <button onClick={handleSend} disabled={sending || !text.trim()}
            style={{
              padding: '10px 18px', borderRadius: 10, background: GOLD, color: BG,
              border: 'none', fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
              cursor: sending ? 'wait' : 'pointer', opacity: (sending || !text.trim()) ? 0.5 : 1,
            }}>
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
