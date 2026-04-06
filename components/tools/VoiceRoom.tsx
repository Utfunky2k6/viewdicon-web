'use client'
import * as React from 'react'

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

const LANGUAGES = ['Yoruba', 'Igbo', 'Hausa', 'Swahili', 'French', 'English', 'Amharic', 'Zulu']
const REACTIONS = ['👏', '🔥', '❤️', '😂', '🙌']
const TOPICS = ['Community', 'Music', 'Politics', 'Farming', 'Business', 'Sports', 'Religion', 'Culture']

interface Room {
  id: string
  title: string
  topic: string
  language: string
  host: string
  maxSpeakers: number
  speakers: string[]
  listeners: string[]
  rules: string
  scheduledAt?: string
  live: boolean
  createdAt: string
}

interface FloatReact { id: string; emoji: string; x: number }

function initRooms(): Room[] {
  if (typeof window === 'undefined') return []
  try {
    const s = localStorage.getItem('voice_room_sessions')
    if (s) return JSON.parse(s)
  } catch {}
  return [
    { id: '1', title: 'Morning Gist with the Village', topic: 'Community', language: 'Yoruba', host: 'NG-YOR-••••-1234', maxSpeakers: 10, speakers: ['NG-YOR-••••-1234', 'GH-TWI-••••-5678'], listeners: ['KE-KIK-••••-9012', 'SN-WOL-••••-3456', 'ET-AMH-••••-7890', 'NG-IGO-••••-2345'], rules: 'Speak with respect. No insults. Keep Yoruba proverbs flowing 🌿', live: true, createdAt: new Date().toISOString() },
    { id: '2', title: 'Afrobeats vs Highlife Debate', topic: 'Music', language: 'English', host: 'GH-TWI-••••-5678', maxSpeakers: 5, speakers: ['GH-TWI-••••-5678'], listeners: ['NG-YOR-••••-4567', 'TZ-SWA-••••-8901'], rules: 'Music lovers only. Bring your hottest takes.', live: true, createdAt: new Date().toISOString() },
  ]
}

export default function VoiceRoom({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [rooms, setRooms] = React.useState<Room[]>(initRooms)
  const [view, setView] = React.useState<'list' | 'room' | 'create' | 'schedule'>('list')
  const [activeRoom, setActiveRoom] = React.useState<Room | null>(null)
  const [muted, setMuted] = React.useState(false)
  const [handRaised, setHandRaised] = React.useState(false)
  const [floats, setFloats] = React.useState<FloatReact[]>([])
  const [toast, setToast] = React.useState('')
  const [speaking, setSpeaking] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ title: '', topic: TOPICS[0], language: 'Yoruba', maxSpeakers: 10, rules: '' })
  const [schedForm, setSchedForm] = React.useState({ title: '', topic: TOPICS[0], language: 'English', scheduledAt: '' })
  const myId = 'NG-YOR-••••-ME01'

  const save = (r: Room[]) => {
    setRooms(r)
    if (typeof window !== 'undefined') localStorage.setItem('voice_room_sessions', JSON.stringify(r))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const createRoom = () => {
    if (!form.title) return
    const room: Room = { id: Date.now().toString(), title: form.title, topic: form.topic, language: form.language, host: myId, maxSpeakers: form.maxSpeakers, speakers: [myId], listeners: [], rules: form.rules || 'Be respectful. Speak your truth.', live: true, createdAt: new Date().toISOString() }
    save([room, ...rooms])
    setActiveRoom(room)
    setView('room')
    showToast('🎙️ Room created! You are now on stage')
  }

  const joinRoom = (room: Room) => {
    const updated = rooms.map(r => r.id === room.id ? { ...r, listeners: [...r.listeners.filter(l => l !== myId), myId] } : r)
    save(updated)
    setActiveRoom(updated.find(r => r.id === room.id) || room)
    setView('room')
  }

  const react = (emoji: string) => {
    const id = Date.now().toString()
    const x = Math.random() * 80
    setFloats(f => [...f, { id, emoji, x }])
    setTimeout(() => setFloats(f => f.filter(fl => fl.id !== id)), 2000)
  }

  const tip = (amount: number) => showToast(`₡${amount} Cowries tipped to host! Ẹ jẹ ki a gbe e soke 🙌`)

  const scheduleRoom = () => {
    if (!schedForm.title || !schedForm.scheduledAt) return
    const room: Room = { id: Date.now().toString(), title: schedForm.title, topic: schedForm.topic, language: schedForm.language, host: myId, maxSpeakers: 10, speakers: [], listeners: [], rules: 'TBD', live: false, scheduledAt: schedForm.scheduledAt, createdAt: new Date().toISOString() }
    save([...rooms, room])
    setView('list')
    showToast('📅 Room scheduled! Village will be notified')
  }

  React.useEffect(() => {
    const t = setInterval(() => {
      if (activeRoom && activeRoom.speakers.length > 0) {
        const spk = activeRoom.speakers[Math.floor(Math.random() * activeRoom.speakers.length)]
        setSpeaking(spk)
        setTimeout(() => setSpeaking(null), 1200)
      }
    }, 2000)
    return () => clearInterval(t)
  }, [activeRoom])

  const inputStyle: React.CSSProperties = { width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }
  const btnStyle: React.CSSProperties = { width: '100%', padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }

  if (view === 'room' && activeRoom) {
    const isHost = activeRoom.host === myId
    const isSpeaker = activeRoom.speakers.includes(myId)
    return (
      <div style={{ position: 'relative', minHeight: 400 }}>
        {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}
        {floats.map(fl => (
          <div key={fl.id} style={{ position: 'absolute', bottom: 120, left: `${fl.x}%`, fontSize: 24, animation: 'floatUp 2s ease-out forwards', pointerEvents: 'none', zIndex: 50 }}>
            <style>{`@keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-80px)} }`}</style>
            {fl.emoji}
          </div>
        ))}

        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: C.sub, fontSize: 12, cursor: 'pointer', marginBottom: 10, padding: 0 }}>← Back to rooms</button>

        <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeRoom.live ? C.green : C.gold, display: 'inline-block' }}></span>
            <span style={{ fontSize: 10, fontWeight: 700, color: activeRoom.live ? C.green : C.gold }}>{activeRoom.live ? 'LIVE' : 'SCHEDULED'}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>{activeRoom.title}</div>
          <div style={{ fontSize: 11, color: C.sub }}>{activeRoom.topic} · {activeRoom.language} · Host: {activeRoom.host}</div>
          <div style={{ fontSize: 10, color: C.sub, marginTop: 4 }}>{activeRoom.listeners.length + activeRoom.speakers.length} / {activeRoom.maxSpeakers + 30} in room</div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 12px', marginBottom: 12, borderLeft: `3px solid ${C.gold}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.gold, marginBottom: 4 }}>📌 ROOM RULES</div>
          <div style={{ fontSize: 11, color: C.sub }}>{activeRoom.rules}</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 8 }}>🎙️ ON STAGE ({activeRoom.speakers.length}/{activeRoom.maxSpeakers})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {activeRoom.speakers.map((spk, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.muted, border: `3px solid ${speaking === spk ? C.green : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: C.text, transition: 'border-color 0.2s', boxShadow: speaking === spk ? `0 0 12px ${C.green}60` : 'none' }}>
                {spk.slice(-4)}
              </div>
              {spk === activeRoom.host && <span style={{ fontSize: 8, color: C.gold, fontWeight: 700 }}>HOST</span>}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 8 }}>👥 AUDIENCE ({activeRoom.listeners.length})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {activeRoom.listeners.map((l, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.sub }}>
              {l.slice(-2)}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
          {REACTIONS.map(e => (
            <button key={e} onClick={() => react(e)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>{e}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {isSpeaker && (
            <button onClick={() => setMuted(m => !m)} style={{ flex: 1, padding: 10, borderRadius: 10, background: muted ? '#ef4444' : C.muted, border: `1px solid ${muted ? '#ef444440' : C.border}`, color: muted ? '#fff' : C.text, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {muted ? '🔇 Unmute' : '🎙️ Mute'}
            </button>
          )}
          {!isSpeaker && (
            <button onClick={() => { setHandRaised(h => !h); showToast(handRaised ? 'Hand lowered' : '✋ Hand raised! Host will notice') }} style={{ flex: 1, padding: 10, borderRadius: 10, background: handRaised ? C.gold + '20' : C.muted, border: `1px solid ${handRaised ? C.gold : C.border}`, color: handRaised ? C.gold : C.text, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {handRaised ? '✋ Hand Raised' : '✋ Raise Hand'}
            </button>
          )}
          <button onClick={() => setView('list')} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#ef444418', border: '1px solid #ef444430', color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Leave Room
          </button>
        </div>

        <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, marginBottom: 8 }}>💰 TIP JAR — Support the Host</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[20, 50, 100].map(a => (
              <button key={a} onClick={() => tip(a)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, background: C.card, border: `1px solid ${C.gold}40`, color: C.gold, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>₡{a}</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'create') {
    return (
      <div>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: C.sub, fontSize: 12, cursor: 'pointer', marginBottom: 12, padding: 0 }}>← Back</button>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 16 }}>🎙️ Create a Voice Room</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Room title (e.g. Eko Night Gist)" style={inputStyle} />
          <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} style={{ ...inputStyle }}>
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} style={{ ...inputStyle }}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={form.maxSpeakers} onChange={e => setForm(f => ({ ...f, maxSpeakers: Number(e.target.value) }))} style={{ ...inputStyle }}>
            {[5, 10, 20].map(n => <option key={n} value={n}>{n} max speakers</option>)}
          </select>
          <textarea value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} placeholder="Room rules (optional)..." rows={2} style={{ ...inputStyle, resize: 'none' }} />
          <button onClick={createRoom} style={btnStyle}>Start Room Now</button>
        </div>
      </div>
    )
  }

  if (view === 'schedule') {
    return (
      <div>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: C.sub, fontSize: 12, cursor: 'pointer', marginBottom: 12, padding: 0 }}>← Back</button>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 16 }}>📅 Schedule a Future Room</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={schedForm.title} onChange={e => setSchedForm(f => ({ ...f, title: e.target.value }))} placeholder="Room title..." style={inputStyle} />
          <select value={schedForm.topic} onChange={e => setSchedForm(f => ({ ...f, topic: e.target.value }))} style={{ ...inputStyle }}>
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={schedForm.language} onChange={e => setSchedForm(f => ({ ...f, language: e.target.value }))} style={{ ...inputStyle }}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
          <input type="datetime-local" value={schedForm.scheduledAt} onChange={e => setSchedForm(f => ({ ...f, scheduledAt: e.target.value }))} style={inputStyle} />
          <button onClick={scheduleRoom} style={btnStyle}>Schedule Room</button>
        </div>
      </div>
    )
  }

  const liveRooms = rooms.filter(r => r.live)
  const scheduledRooms = rooms.filter(r => !r.live)

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setView('create')} style={{ flex: 1, padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>🎙️ Start a Room</button>
        <button onClick={() => setView('schedule')} style={{ flex: 1, padding: 10, borderRadius: 10, background: C.muted, border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>📅 Schedule</button>
      </div>

      {liveRooms.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>🔴 Live Now</div>
          {liveRooms.map(room => (
            <div key={room.id} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{room.title}</div>
                <span style={{ fontSize: 9, background: '#ef444418', color: '#ef4444', border: '1px solid #ef444430', borderRadius: 99, padding: '2px 8px', fontWeight: 700, marginLeft: 8 }}>LIVE</span>
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 8 }}>{room.topic} · {room.language} · Host: {room.host}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: C.sub }}>🎙️ {room.speakers.length} speakers · 👥 {room.listeners.length} listeners</div>
                <button onClick={() => joinRoom(room)} style={{ padding: '6px 14px', borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>Join</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {scheduledRooms.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, marginTop: 8 }}>📅 Upcoming Rooms</div>
          {scheduledRooms.map(room => (
            <div key={room.id} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{room.title}</div>
              <div style={{ fontSize: 11, color: C.sub }}>{room.topic} · {room.language}</div>
              <div style={{ fontSize: 10, color: C.gold, marginTop: 4 }}>🕐 {room.scheduledAt ? new Date(room.scheduledAt).toLocaleString() : 'TBD'}</div>
            </div>
          ))}
        </div>
      )}

      {liveRooms.length === 0 && scheduledRooms.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.sub }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>No rooms yet</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Be the first to open a voice room in the village!</div>
        </div>
      )}
    </div>
  )
}
