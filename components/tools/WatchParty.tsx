'use client'
import React, { useState, useEffect, useRef } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Room { id: string; code: string; title: string; url: string; host: string; attendees: string[]; createdAt: number; isLive: boolean; tips: number }
interface ChatMsg { id: string; afroId: string; text: string; ts: number }
interface Reaction { id: string; emoji: string; x: number }
type TabKey = 'lobby' | 'watch' | 'create'

const STORAGE_KEY = 'watch_party_rooms'
const MOCK_ROOMS: Room[] = [
  { id: 'r1', code: 'AFRO-7X2K', title: 'Lionheart (2018)', url: '', host: 'Adaeze_Obi', attendees: ['Adaeze_Obi', 'Emeka_Dike', 'Ngozi_Chukwu', 'Tunde_Balogun', 'Kemi_Ade'], createdAt: Date.now() - 300000, isLive: true, tips: 2350 },
  { id: 'r2', code: 'AFRO-9M4P', title: 'King of Boys 2', url: '', host: 'Balogun_IV', attendees: ['Balogun_IV', 'Sade_Rivers'], createdAt: Date.now() - 600000, isLive: false, tips: 500 },
]
const MOCK_CHAT: ChatMsg[] = [
  { id: 'c1', afroId: 'Emeka_Dike', text: 'Omo this film dey burst brain!', ts: Date.now() - 60000 },
  { id: 'c2', afroId: 'Ngozi_Chukwu', text: 'Genevieve acting too good abeg 🙌', ts: Date.now() - 40000 },
  { id: 'c3', afroId: 'Tunde_Balogun', text: 'Reload am make I catch up o', ts: Date.now() - 20000 },
  { id: 'c4', afroId: 'Kemi_Ade', text: 'This scene ehn... 😂😂😂', ts: Date.now() - 5000 },
]

export default function WatchParty({ villageId: _v, roleKey: _r }: ToolProps) {
  const dark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  const C = {
    bg: dark ? '#050a06' : '#faf6f0',
    card: dark ? '#0d1a0e' : '#ffffff',
    border: dark ? '#1a2e1a' : '#e5ddd0',
    text: dark ? '#f0f7f0' : '#1a0f08',
    sub: dark ? '#6b8f6b' : '#78716c',
    muted: dark ? '#0a140b' : '#f5f0e8',
    green: '#22c55e',
    gold: '#d4a017',
  }

  const [tab, setTab] = useState<TabKey>('lobby')
  const [rooms, setRooms] = useState<Room[]>(() => {
    if (typeof window === 'undefined') return MOCK_ROOMS
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : MOCK_ROOMS } catch { return MOCK_ROOMS }
  })
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [chat, setChat] = useState<ChatMsg[]>(MOCK_CHAT)
  const [chatInput, setChatInput] = useState('')
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [progress, setProgress] = useState(34)
  const [isPlaying, setIsPlaying] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  useEffect(() => {
    if (isPlaying && activeRoom) {
      tickRef.current = setInterval(() => setProgress(p => Math.min(100, p + 0.1)), 500)
    } else {
      if (tickRef.current) clearInterval(tickRef.current)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [isPlaying, activeRoom])

  const spawnReaction = (emoji: string) => {
    const id = String(Date.now())
    const x = 20 + Math.random() * 60
    setReactions(r => [...r, { id, emoji, x }])
    setTimeout(() => setReactions(r => r.filter(rr => rr.id !== id)), 1800)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg: ChatMsg = { id: String(Date.now()), afroId: 'You', text: chatInput.trim(), ts: Date.now() }
    setChat(c => [...c, msg])
    setChatInput('')
  }

  const startCountdown = () => {
    setCountdown(3)
    let n = 3
    const iv = setInterval(() => {
      n--
      if (n <= 0) { clearInterval(iv); setCountdown(null); setIsPlaying(true) }
      else setCountdown(n)
    }, 1000)
  }

  const joinRoom = (room: Room) => {
    setActiveRoom(room)
    setTab('watch')
    startCountdown()
  }

  const createRoom = () => {
    if (!newTitle.trim()) return
    const code = 'AFRO-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    const room: Room = { id: String(Date.now()), code, title: newTitle, url: newUrl, host: 'You', attendees: ['You'], createdAt: Date.now(), isLive: false, tips: 0 }
    setRooms(r => [room, ...r])
    setNewTitle(''); setNewUrl('')
    setTab('lobby')
  }

  const sprayTip = (amt: number) => {
    if (!activeRoom) return
    setRooms(rs => rs.map(r => r.id === activeRoom.id ? { ...r, tips: r.tips + amt } : r))
    setActiveRoom(ar => ar ? { ...ar, tips: ar.tips + amt } : ar)
    spawnReaction('💰')
  }

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'lobby', label: '🏠 Lobby' },
    { key: 'watch', label: '📺 Watch' },
    { key: 'create', label: '➕ Create' },
  ]

  const REACTION_EMOJIS = ['🔥', '😂', '👏', '💃', '🎺', '🙌']

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'system-ui,sans-serif', padding: 16, maxWidth: 480 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>📺 Watch Party</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Co-watch with your village</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '8px 4px', border: `1px solid ${tab === t.key ? C.green : C.border}`, borderRadius: 9, background: tab === t.key ? (dark ? '#0a2a0a' : '#e8fbe8') : C.card, color: tab === t.key ? C.green : C.sub, cursor: 'pointer', fontSize: 12, fontWeight: tab === t.key ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LOBBY */}
      {tab === 'lobby' && (
        <div>
          {rooms.map(room => (
            <div key={room.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{room.title}</div>
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>Host: {room.host}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {room.isLive && <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>● LIVE</span>}
                  <span style={{ fontSize: 11, color: C.sub }}>👁 {room.attendees.length} watching</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {room.attendees.slice(0, 5).map(a => (
                  <span key={a} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 20, padding: '2px 8px', fontSize: 11, color: C.sub }}>{a}</span>
                ))}
                {room.attendees.length > 5 && <span style={{ fontSize: 11, color: C.sub }}>+{room.attendees.length - 5}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', fontSize: 12, color: C.sub, fontFamily: 'monospace' }}>{room.code}</div>
                <button onClick={() => copyCode(room.code)} style={{ padding: '5px 10px', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, color: C.sub, cursor: 'pointer', fontSize: 12 }}>{copied ? '✓' : '📋'}</button>
                <button onClick={() => joinRoom(room)} style={{ padding: '6px 16px', background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Join</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: C.gold }}>₡{room.tips.toLocaleString()} sprayed tonight</div>
            </div>
          ))}
          {rooms.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.sub, fontSize: 14 }}>No active parties. Create one!</div>}
        </div>
      )}

      {/* WATCH */}
      {tab === 'watch' && (
        <div>
          {!activeRoom ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.sub }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📺</div>
              <div>Join a room from the Lobby first</div>
            </div>
          ) : (
            <>
              {/* Room badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '3px 7px' }}>● LIVE</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.sub }}>{activeRoom.code}</span>
                </div>
                <span style={{ fontSize: 12, color: C.sub }}>👁 {activeRoom.attendees.length}</span>
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div style={{ background: C.card, border: `2px solid ${C.green}`, borderRadius: 12, padding: 30, textAlign: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 60, fontWeight: 900, color: C.green }}>{countdown}</div>
                  <div style={{ fontSize: 14, color: C.sub }}>Film starts soon...</div>
                </div>
              )}

              {/* Video card */}
              <div style={{ background: '#0d0d0d', borderRadius: 12, overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
                <div style={{ height: 180, background: 'linear-gradient(135deg, #1a0a00 0%, #0d1a0e 50%, #0a0a1a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 48 }}>🎬</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginTop: 8 }}>{activeRoom.title}</div>
                  <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Host: {activeRoom.host}</div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: '#333' }}>
                  <div style={{ height: '100%', background: C.green, width: `${progress}%`, transition: 'width 0.5s linear' }} />
                </div>
                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                  <span style={{ color: '#aaa', fontSize: 12 }}>{Math.floor(progress * 1.2)}m / 120m</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setIsPlaying(p => !p)} style={{ background: C.green, border: 'none', borderRadius: 6, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>{isPlaying ? '⏸' : '▶'}</button>
                    <button onClick={startCountdown} style={{ background: '#1a2e1a', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', color: C.text, cursor: 'pointer', fontSize: 13 }}>🔄 Sync</button>
                  </div>
                </div>
              </div>

              {/* Reactions */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 8 }}>VILLAGE REACTIONS</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-around' }}>
                  {REACTION_EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => spawnReaction(emoji)}
                      style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', fontSize: 20, cursor: 'pointer', transition: 'transform 0.1s' }}>
                      {emoji}
                    </button>
                  ))}
                </div>
                {/* Floating reactions */}
                {reactions.map(r => (
                  <div key={r.id} style={{ position: 'absolute', bottom: 10, left: `${r.x}%`, fontSize: 24, animation: 'none', pointerEvents: 'none',
                    transform: 'translateY(0)', transition: 'transform 1.8s ease-out, opacity 1.8s', opacity: 0 }}>
                    <span style={{ fontSize: 24, display: 'block', animation: 'float-up 1.8s ease-out forwards' }}>{r.emoji}</span>
                  </div>
                ))}
              </div>

              {/* Spray Cowries */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 8 }}>💰 SPRAY THE ENTERTAINER</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[50, 100, 500].map(amt => (
                    <button key={amt} onClick={() => sprayTip(amt)}
                      style={{ flex: 1, padding: '10px 4px', background: '#1a1000', border: `1px solid ${C.gold}`, borderRadius: 10, color: C.gold, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                      ₡{amt}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: C.sub }}>Total sprayed: <span style={{ color: C.gold, fontWeight: 700 }}>₡{activeRoom.tips.toLocaleString()}</span></div>
              </div>

              {/* Chat */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.sub, fontWeight: 700 }}>VILLAGE CHAT</div>
                <div style={{ height: 160, overflowY: 'auto', padding: 10 }}>
                  {chat.map(msg => (
                    <div key={msg.id} style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{msg.afroId}: </span>
                      <span style={{ fontSize: 13, color: C.text }}>{msg.text}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: `1px solid ${C.border}` }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Say something..."
                    style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', color: C.text, fontSize: 13, outline: 'none' }} />
                  <button onClick={sendChat} style={{ padding: '7px 14px', background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>→</button>
                </div>
              </div>

              {/* Rate film */}
              <button onClick={() => setShowReview(v => !v)}
                style={{ width: '100%', padding: 10, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, cursor: 'pointer', fontSize: 14, marginBottom: 8 }}>
                ⭐ Rate This Film
              </button>
              {showReview && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 8 }}>YOUR RATING</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setRating(s)}
                        style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', filter: s <= rating ? 'none' : 'grayscale(1)' }}>⭐</button>
                    ))}
                  </div>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your thoughts with the village..."
                    style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, minHeight: 70, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                  <button onClick={() => {
                    if (rating === 0) return
                    setReviewSubmitted(true)
                    setTimeout(() => { setShowReview(false); setReviewSubmitted(false); setRating(0); setReviewText('') }, 2000)
                  }} style={{ width: '100%', marginTop: 8, padding: 10, background: reviewSubmitted ? '#065f46' : C.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>{reviewSubmitted ? '✓ Review Submitted!' : 'Submit Review'}</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* CREATE */}
      {tab === 'create' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🎬 Host a Watch Party</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Film / Show Title *</div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Lionheart (2018)"
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Video URL (optional)</div>
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..."
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={createRoom} style={{ width: '100%', padding: 12, background: C.green, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            🎉 Create Party Room
          </button>
          <div style={{ marginTop: 12, padding: 12, background: C.muted, borderRadius: 8, fontSize: 12, color: C.sub }}>
            A unique room code will be generated. Share it with your village to join the party!
          </div>
        </div>
      )}
    </div>
  )
}
