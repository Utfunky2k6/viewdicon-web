'use client'
import React, { useState, useEffect, useRef } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Session { id: string; streamer: string; game: string; description: string; viewers: number; isLive: boolean; duration: number; cowriesEarned: number; scheduledAt?: string; clips: string[] }
interface ChatMsg { id: string; afroId: string; text: string }
interface Bet { option: string; amount: number; player: string }
type TabKey = 'live' | 'schedule' | 'leaderboard' | 'stream'

const STORAGE_KEY = 'gaming_stream_sessions'

const GAMES = [
  { label: 'FIFA 25', emoji: '⚽' },
  { label: 'Ludo', emoji: '🎲' },
  { label: 'Chess', emoji: '♟️' },
  { label: 'Call of Duty', emoji: '🔫' },
  { label: 'PUBG Mobile', emoji: '📱' },
  { label: 'eFootball', emoji: '🏆' },
  { label: 'GTA V', emoji: '🚗' },
]

const MOCK_SESSIONS: Session[] = [
  { id: 's1', streamer: 'Chukwuemeka_G', game: 'FIFA 25', description: 'Road to FUTCHAMPS — grind with me!', viewers: 234, isLive: true, duration: 4320, cowriesEarned: 8500, clips: ['47:30 — Insane bicycle kick goal!'] },
  { id: 's2', streamer: 'KingKofi_Plays', game: 'PUBG Mobile', description: 'Solo vs Squad challenge', viewers: 89, isLive: true, duration: 1800, cowriesEarned: 3200, clips: [] },
  { id: 's3', streamer: 'Lagos_Chess_Pro', game: 'Chess', description: 'Rated 2200 — teaching African openings', viewers: 45, isLive: false, duration: 0, cowriesEarned: 1100, scheduledAt: '2026-04-06T20:00', clips: [] },
]

const MOCK_CHAT: ChatMsg[] = [
  { id: 'c1', afroId: 'Adewale_99', text: 'Bro this skill level is insane o 🔥' },
  { id: 'c2', afroId: 'Nkechi_Gamer', text: 'How you did that move?? Teach me' },
  { id: 'c3', afroId: 'Kofi_Streams', text: 'W streamer, W game 💪' },
]

export default function GamingStream({ villageId: _v, roleKey: _r }: ToolProps) {
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

  const [tab, setTab] = useState<TabKey>('live')
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window === 'undefined') return MOCK_SESSIONS
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : MOCK_SESSIONS } catch { return MOCK_SESSIONS }
  })
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [chat, setChat] = useState<ChatMsg[]>(MOCK_CHAT)
  const [chatInput, setChatInput] = useState('')
  const [bets, setBets] = useState<Bet[]>([])
  const [betAmount, setBetAmount] = useState('50')
  const [betOption, setBetOption] = useState('Team A')
  const [showGoLive, setShowGoLive] = useState(false)
  const [newGame, setNewGame] = useState(GAMES[0].label)
  const [newDesc, setNewDesc] = useState('')
  const [schedTitle, setSchedTitle] = useState('')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [schedGame, setSchedGame] = useState(GAMES[0].label)
  const [duration, setDuration] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  useEffect(() => {
    if (!activeSession?.isLive) return
    const iv = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(iv)
  }, [activeSession])

  const fmtDuration = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
  }

  const goLive = () => {
    if (!newDesc.trim()) return
    const session: Session = { id: String(Date.now()), streamer: 'You', game: newGame, description: newDesc, viewers: 0, isLive: true, duration: 0, cowriesEarned: 0, clips: [] }
    setSessions(ss => [session, ...ss])
    setActiveSession(session)
    setDuration(0)
    setShowGoLive(false)
    setTab('stream')
  }

  const scheduleStream = () => {
    if (!schedTitle || !schedDate || !schedTime) return
    const session: Session = { id: String(Date.now()), streamer: 'You', game: schedGame, description: schedTitle, viewers: 0, isLive: false, duration: 0, cowriesEarned: 0, scheduledAt: `${schedDate}T${schedTime}`, clips: [] }
    setSessions(ss => [...ss, session])
    setSchedTitle(''); setSchedDate(''); setSchedTime('')
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    setChat(c => [...c, { id: String(Date.now()), afroId: 'You', text: chatInput.trim() }])
    setChatInput('')
  }

  const placeBet = () => {
    const amt = parseInt(betAmount)
    if (!amt || !betOption) return
    setBets(b => [...b, { option: betOption, amount: amt, player: 'You' }])
  }

  const saveClip = () => {
    if (!activeSession) return
    const note = `${fmtDuration(duration)} — Saved moment`
    setSessions(ss => ss.map(s => s.id === activeSession.id ? { ...s, clips: [...s.clips, note] } : s))
    setActiveSession(a => a ? { ...a, clips: [...a.clips, note] } : a)
  }

  const watchSession = (s: Session) => {
    setActiveSession(s)
    setDuration(s.duration)
    setTab('stream')
  }

  const leaderboard = [...sessions].sort((a, b) => b.cowriesEarned - a.cowriesEarned).slice(0, 5)
  const gameEmoji = (name: string) => GAMES.find(g => g.label === name)?.emoji || '🎮'

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'live', label: '🔴 Live' },
    { key: 'stream', label: '🎮 Stream' },
    { key: 'schedule', label: '📅 Schedule' },
    { key: 'leaderboard', label: '🏆 Board' },
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'system-ui,sans-serif', padding: 16, maxWidth: 480 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>🎮 Gaming Stream</div>
          <div style={{ fontSize: 12, color: C.sub }}>Village game stage</div>
        </div>
        <button onClick={() => setShowGoLive(v => !v)}
          style={{ padding: '7px 14px', background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          🔴 Go Live
        </button>
      </div>

      {/* Go Live panel */}
      {showGoLive && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Start Your Stream</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Select Game</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {GAMES.map(g => (
                <button key={g.label} onClick={() => setNewGame(g.label)}
                  style={{ padding: '5px 10px', border: `1px solid ${newGame === g.label ? C.green : C.border}`, borderRadius: 20, background: newGame === g.label ? (dark ? '#0a2a0a' : '#e8fbe8') : C.muted, color: newGame === g.label ? C.green : C.sub, cursor: 'pointer', fontSize: 12 }}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Stream Description</div>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Tell viewers what to expect..."
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={goLive} style={{ width: '100%', padding: 11, background: '#dc2626', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            🔴 Start Streaming Now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '7px 2px', border: `1px solid ${tab === t.key ? C.green : C.border}`, borderRadius: 9, background: tab === t.key ? (dark ? '#0a2a0a' : '#e8fbe8') : C.card, color: tab === t.key ? C.green : C.sub, cursor: 'pointer', fontSize: 11, fontWeight: tab === t.key ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LIVE SESSIONS */}
      {tab === 'live' && (
        <div>
          {sessions.filter(s => s.isLive).map(s => (
            <div key={s.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 7px', marginRight: 6 }}>● LIVE</span>
                  <span style={{ fontSize: 16 }}>{gameEmoji(s.game)}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, marginLeft: 4 }}>{s.game}</span>
                </div>
                <span style={{ fontSize: 12, color: C.sub }}>👁 {s.viewers.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>@{s.streamer}</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>{s.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.gold }}>₡{s.cowriesEarned.toLocaleString()} earned</span>
                <button onClick={() => watchSession(s)} style={{ padding: '6px 16px', background: C.green, border: 'none', borderRadius: 7, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Watch 👁</button>
              </div>
            </div>
          ))}
          {sessions.filter(s => s.isLive).length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: C.sub }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎮</div>
              <div>No streams live right now. Be the first to go live!</div>
            </div>
          )}
        </div>
      )}

      {/* STREAM VIEW */}
      {tab === 'stream' && (
        <div>
          {!activeSession ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.sub }}>Select a stream from Live tab</div>
          ) : (
            <>
              {/* Stream card */}
              <div style={{ background: '#0d0d0d', borderRadius: 12, padding: 16, marginBottom: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 60 }}>{gameEmoji(activeSession.game)}</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{activeSession.game}</div>
                <div style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>@{activeSession.streamer}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
                  {activeSession.isLive && <span style={{ background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '3px 8px' }}>● LIVE {fmtDuration(duration)}</span>}
                  <span style={{ color: '#aaa', fontSize: 12 }}>👁 {activeSession.viewers}</span>
                </div>
              </div>

              {/* Clip button */}
              <button onClick={saveClip} style={{ width: '100%', padding: 10, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, cursor: 'pointer', fontSize: 14, marginBottom: 10 }}>
                📌 Save This Moment
              </button>

              {activeSession.clips.length > 0 && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 6 }}>SAVED CLIPS</div>
                  {activeSession.clips.map((clip, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.text, padding: '4px 0', borderBottom: i < activeSession.clips.length - 1 ? `1px solid ${C.border}` : 'none' }}>📌 {clip}</div>
                  ))}
                </div>
              )}

              {/* Betting */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 8 }}>🎯 PREDICT & BET</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {['Team A', 'Team B', 'Draw'].map(opt => (
                    <button key={opt} onClick={() => setBetOption(opt)}
                      style={{ flex: 1, padding: '7px 4px', border: `1px solid ${betOption === opt ? C.gold : C.border}`, borderRadius: 8, background: betOption === opt ? '#1a1000' : C.muted, color: betOption === opt ? C.gold : C.sub, cursor: 'pointer', fontSize: 12, fontWeight: betOption === opt ? 700 : 400 }}>
                      {opt}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={betAmount} onChange={e => setBetAmount(e.target.value)}
                    style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 8px', color: C.text, fontSize: 13 }}>
                    {[50, 100, 200, 500].map(a => <option key={a} value={a}>₡{a}</option>)}
                  </select>
                  <button onClick={placeBet} style={{ flex: 2, padding: '7px 0', background: C.gold, border: 'none', borderRadius: 7, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Place Bet</button>
                </div>
                {bets.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: C.sub }}>
                    Your bets: {bets.map((b, i) => <span key={i} style={{ marginLeft: 4, color: C.gold }}>{b.option} ₡{b.amount}</span>)}
                  </div>
                )}
              </div>

              {/* Chat */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.sub, fontWeight: 700 }}>STREAM CHAT</div>
                <div style={{ height: 140, overflowY: 'auto', padding: 10 }}>
                  {chat.map(msg => (
                    <div key={msg.id} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{msg.afroId}: </span>
                      <span style={{ fontSize: 13 }}>{msg.text}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: `1px solid ${C.border}` }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Hype up the streamer..."
                    style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', color: C.text, fontSize: 13, outline: 'none' }} />
                  <button onClick={sendChat} style={{ padding: '7px 14px', background: C.green, border: 'none', borderRadius: 7, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>→</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SCHEDULE */}
      {tab === 'schedule' && (
        <div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📅 Schedule a Stream</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Stream Title</div>
              <input value={schedTitle} onChange={e => setSchedTitle(e.target.value)} placeholder="e.g. Friday Night Ludo Tournament"
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Game</div>
              <select value={schedGame} onChange={e => setSchedGame(e.target.value)}
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13 }}>
                {GAMES.map(g => <option key={g.label} value={g.label}>{g.emoji} {g.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Date</div>
                <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Time</div>
                <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={scheduleStream} style={{ width: '100%', padding: 11, background: C.green, border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              📅 Schedule Stream
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 8 }}>UPCOMING STREAMS</div>
          {sessions.filter(s => !s.isLive && s.scheduledAt).map(s => (
            <div key={s.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{gameEmoji(s.game)} {s.game}</span>
                <span style={{ fontSize: 11, color: C.sub }}>{s.scheduledAt?.replace('T', ' ')}</span>
              </div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{s.description} · @{s.streamer}</div>
            </div>
          ))}
        </div>
      )}

      {/* LEADERBOARD */}
      {tab === 'leaderboard' && (
        <div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>Top village streamers by Cowries earned</div>
          {leaderboard.map((s, i) => (
            <div key={s.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? C.gold : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : C.sub, minWidth: 28 }}>#{i + 1}</div>
              <div style={{ fontSize: 24 }}>{gameEmoji(s.game)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>@{s.streamer}</div>
                <div style={{ fontSize: 11, color: C.sub }}>{s.game}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.gold }}>₡{s.cowriesEarned.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: C.sub }}>earned</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
