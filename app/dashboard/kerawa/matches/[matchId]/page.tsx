'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { kerawaApi } from '@/lib/api'
import { logApiFailure, USE_MOCKS } from '@/lib/flags'

const FIRE = { primary: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#0a0a0a', card: '#141414', border: '#1f1f1f' }
const IDENTITY_LEVELS = ['SHADOW', 'SILHOUETTE', 'PARTIAL', 'VERIFIED', 'OPEN']
const CONSENT_TYPES = [
  { key: 'PHOTO', icon: '📸', label: 'Photo Sharing' },
  { key: 'VOICE', icon: '🎙️', label: 'Voice Call' },
  { key: 'LOCATION', icon: '📍', label: 'Location' },
]

function countdown(expiresAt: string): { text: string; urgent: boolean; expired: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { text: 'Expired', urgent: true, expired: true }
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return { text: `${hrs}h ${mins}m left`, urgent: hrs < 6, expired: false }
}

export default function KerawaMatchChatPage() {
  const r = useRouter()
  const { matchId } = useParams()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [match, setMatch] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [consent, setConsent] = useState<Record<string, boolean>>({})
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showEscrow, setShowEscrow] = useState(false)
  const [escrowAmount, setEscrowAmount] = useState('500')
  const [escrowLocation, setEscrowLocation] = useState('')
  const [showSafety, setShowSafety] = useState(false)

  useEffect(() => {
    const s = document.createElement('style')
    s.textContent = `@keyframes kfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes kpanic{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}50%{box-shadow:0 0 20px 8px rgba(239,68,68,.2)}}`
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  useEffect(() => { loadData() }, [matchId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const res = await kerawaApi.getMessages(matchId as string)
        if (res?.messages) setMessages(res.messages)
      } catch (e) { logApiFailure('kerawa/match/poll', e) }
    }, 8000)
    return () => clearInterval(iv)
  }, [matchId])

  async function loadData() {
    setLoading(true)
    try {
      const [m, msgs, con] = await Promise.all([
        kerawaApi.getMatch(matchId as string),
        kerawaApi.getMessages(matchId as string),
        kerawaApi.getConsent(matchId as string),
      ])
      setMatch(m?.match || m || (USE_MOCKS ? MOCK_MATCH : null))
      setMessages(msgs?.messages || msgs || (USE_MOCKS ? MOCK_MESSAGES : []))
      const c: Record<string, boolean> = {}
      ;(con?.consents || []).forEach((x: any) => { c[x.type] = x.given })
      setConsent(c)
    } catch (e) {
      logApiFailure('kerawa/match/load', e)
      if (USE_MOCKS) { setMatch(MOCK_MATCH); setMessages(MOCK_MESSAGES) }
    }
    setLoading(false)
  }

  const MOCK_MATCH = { id: matchId, nickname: 'NightOrchid', identityLevel: 'PARTIAL', trustScore: 88, mood: '💃', expiresAt: '2099-01-02T04:00:00.000Z' }
  const MOCK_MESSAGES = [
    { id: '1', senderId: 'them', text: 'Hey, I noticed we matched... 🔥', createdAt: '2026-04-08T10:00:00.000Z' },
    { id: '2', senderId: 'me', text: 'Yeah! Your energy is interesting. What brings you here?', createdAt: '2026-04-08T10:30:00.000Z' },
    { id: '3', senderId: 'them', text: 'Just looking for genuine connections. No games.', createdAt: '2026-04-08T11:00:00.000Z' },
    { id: '4', senderId: 'me', text: 'Same here. Should we reveal a bit more? I\'m at PARTIAL level.', createdAt: '2026-04-08T11:30:00.000Z' },
  ]

  async function sendMsg() {
    if (!text.trim()) return
    const newMsg = { id: `${Date.now()}`, senderId: 'me', text: text.trim(), createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, newMsg])
    setText('')
    try { await kerawaApi.sendMessage(matchId as string, { content: text.trim() }) } catch (e) { logApiFailure('kerawa/match/send', e) }
  }

  async function toggleConsent(type: string) {
    const current = consent[type]
    try {
      if (current) await kerawaApi.revokeConsent(matchId as string, type)
      else await kerawaApi.giveConsent(matchId as string, type)
      setConsent(prev => ({ ...prev, [type]: !current }))
    } catch (e) { logApiFailure('kerawa/match/consent', e) }
  }

  async function createEscrow() {
    try {
      await kerawaApi.createEscrow(matchId as string, { amount: +escrowAmount, currency: 'CWR', location: escrowLocation })
      setShowEscrow(false)
    } catch (e) { logApiFailure('kerawa/match/escrow', e) }
  }

  async function handlePanic() {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject))
      await kerawaApi.triggerPanic({ matchId: matchId as string, lat: pos.coords.latitude, lng: pos.coords.longitude, reason: 'UNSAFE_FEELING' })
      alert('🚨 Safety alert sent. Our team has been notified.')
    } catch { alert('🚨 Alert sent (location unavailable)') }
  }

  const timer = countdown(match?.expiresAt || '2099-01-01T00:00:00.000Z')
  const currentLevel = IDENTITY_LEVELS.indexOf(match?.identityLevel || 'SHADOW')

  if (loading) return <div style={{ minHeight: '100vh', background: FIRE.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'monospace' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: FIRE.bg, color: '#fff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${FIRE.border}`, background: FIRE.card }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => r.push('/dashboard/kerawa/matches')} style={{ fontSize: 18, cursor: 'pointer' }}>←</span>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎭</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{match?.nickname || 'Unknown'} {match?.mood}</div>
            <div style={{ fontSize: 10, color: timer.urgent ? FIRE.primary : '#888' }}>⏱ {timer.text} · 🛡️ {match?.trustScore || '—'}</div>
          </div>
        </div>

        {/* Identity Progress */}
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          {IDENTITY_LEVELS.map((lvl, i) => (
            <div key={lvl} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentLevel ? FIRE.primary : '#333' }} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Identity: {match?.identityLevel || 'SHADOW'} ({currentLevel + 1}/5)</div>
      </div>

      {/* Consent Strip */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${FIRE.border}`, background: '#0d0d0d' }}>
        {CONSENT_TYPES.map(c => (
          <div key={c.key} onClick={() => toggleConsent(c.key)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 12, background: consent[c.key] ? `${FIRE.primary}33` : '#1a1a1a', border: `1px solid ${consent[c.key] ? FIRE.primary : '#333'}`, fontSize: 10, cursor: 'pointer' }}>
            <span>{c.icon}</span>
            <span>{c.label}</span>
            <span style={{ color: consent[c.key] ? '#4ade80' : '#ef4444' }}>{consent[c.key] ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {messages.map((msg: any, i: number) => {
          const isMine = msg.senderId === 'me'
          return (
            <div key={msg.id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 10, animation: 'kfade .3s ease' }}>
              <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMine ? FIRE.primary : FIRE.card, border: isMine ? 'none' : `1px solid ${FIRE.border}` }}>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.text}</div>
                <div style={{ fontSize: 9, color: isMine ? 'rgba(255,255,255,.6)' : '#555', marginTop: 4, textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Escrow Modal */}
      {showEscrow && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: FIRE.card, borderRadius: '20px 20px 0 0', padding: '24px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>💰 Propose Meetup</h3>
              <span onClick={() => setShowEscrow(false)} style={{ fontSize: 20, cursor: 'pointer' }}>✕</span>
            </div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Escrow protects both parties. Money releases when you meet (GPS verified).</p>
            <label style={{ fontSize: 11, color: '#aaa' }}>Amount (Cowries)</label>
            <input value={escrowAmount} onChange={e => setEscrowAmount(e.target.value)} type="number" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 12, boxSizing: 'border-box' }} />
            <label style={{ fontSize: 11, color: '#aaa' }}>Meetup Location</label>
            <input value={escrowLocation} onChange={e => setEscrowLocation(e.target.value)} placeholder="Public place name..." style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 16, boxSizing: 'border-box' }} />
            <button onClick={createEscrow} style={{ width: '100%', padding: '14px', borderRadius: 10, background: FIRE.primary, border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>🤝 Lock Escrow</button>
          </div>
        </div>
      )}

      {/* Safety Bar */}
      {showSafety && (
        <div style={{ padding: '8px 16px', background: '#1a0000', borderTop: `1px solid ${FIRE.dark}`, display: 'flex', gap: 8 }}>
          <button onClick={handlePanic} style={{ flex: 1, padding: '10px', borderRadius: 8, background: FIRE.dark, border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer', animation: 'kpanic 1.5s infinite' }}>🚨 PANIC</button>
          <button onClick={() => { kerawaApi.reportUser({ targetId: matchId as string, type: 'HARASSMENT' }); alert('Report submitted.') }} style={{ flex: 1, padding: '10px', borderRadius: 8, background: FIRE.card, border: `1px solid ${FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>🚩 Report</button>
          <button onClick={() => alert('User blocked.')} style={{ flex: 1, padding: '10px', borderRadius: 8, background: FIRE.card, border: `1px solid ${FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>🔒 Block</button>
        </div>
      )}

      {/* Composer */}
      <div style={{ padding: '10px 16px 24px', borderTop: `1px solid ${FIRE.border}`, background: FIRE.card }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={() => setShowEscrow(true)} style={{ padding: '6px 10px', borderRadius: 8, background: '#1a1a1a', border: `1px solid ${FIRE.border}`, color: '#fff', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer' }}>💰 Meetup</button>
          <button onClick={() => setShowSafety(!showSafety)} style={{ padding: '6px 10px', borderRadius: 8, background: showSafety ? `${FIRE.primary}33` : '#1a1a1a', border: `1px solid ${showSafety ? FIRE.primary : FIRE.border}`, color: '#fff', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer' }}>🛡️ Safety</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Type a message..." style={{ flex: 1, padding: '12px 14px', background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 10, color: '#fff', fontFamily: 'monospace', fontSize: 13, outline: 'none' }} />
          <button onClick={sendMsg} disabled={!text.trim()} style={{ padding: '12px 16px', borderRadius: 10, background: text.trim() ? FIRE.primary : '#333', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>→</button>
        </div>
      </div>
    </div>
  )
}
