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

const EVENT_TYPES = [
  { label: 'Football', icon: '⚽' },
  { label: 'Boxing', icon: '🥊' },
  { label: 'Racing', icon: '🏎️' },
  { label: 'Politics', icon: '🗳️' },
  { label: 'Village Tournament', icon: '🏆' },
  { label: 'Custom', icon: '🎯' },
]

interface PredEvent {
  id: string
  title: string
  type: string
  options: string[]
  deadline: string
  entryFee: number
  totalPot: number
  participants: { user: string; pick: number; stake: number }[]
  winner?: number
  closed: boolean
  createdAt: string
}

interface MyBet { eventId: string; pick: number; stake: number; outcome?: 'win' | 'loss' }

interface PredData {
  events: PredEvent[]
  myBets: MyBet[]
  leaderboard: { user: string; correct: number; total: number; streak: number }[]
}

const INITIAL_DATA: PredData = {
  events: [
    { id: '1', title: 'Man United vs Arsenal', type: 'Football', options: ['Man United Win', 'Draw', 'Arsenal Win'], deadline: new Date(Date.now() + 86400000 * 2).toISOString(), entryFee: 50, totalPot: 2400, participants: [{ user: 'NG-YOR-••••-1234', pick: 2, stake: 50 }, { user: 'GH-TWI-••••-5678', pick: 0, stake: 50 }], closed: false, createdAt: new Date().toISOString() },
    { id: '2', title: 'Village Council Election 2026', type: 'Politics', options: ['Chief Adeyemi', 'Elder Okafor', 'Madam Diallo', 'Abstain'], deadline: new Date(Date.now() + 86400000 * 7).toISOString(), entryFee: 20, totalPot: 800, participants: [], closed: false, createdAt: new Date().toISOString() },
    { id: '3', title: 'AFCON Final: Nigeria vs Morocco', type: 'Football', options: ['Nigeria', 'Draw', 'Morocco'], deadline: new Date(Date.now() - 86400000).toISOString(), entryFee: 100, totalPot: 5000, participants: [{ user: 'NG-YOR-••••-1234', pick: 0, stake: 100 }], winner: 0, closed: true, createdAt: new Date().toISOString() },
  ],
  myBets: [{ eventId: '3', pick: 0, stake: 100, outcome: 'win' }],
  leaderboard: [
    { user: 'NG-YOR-••••-1234', correct: 7, total: 9, streak: 3 },
    { user: 'GH-TWI-••••-5678', correct: 5, total: 8, streak: 1 },
    { user: 'KE-KIK-••••-9012', correct: 4, total: 6, streak: 0 },
  ],
}

function initData(): PredData {
  if (typeof window === 'undefined') return INITIAL_DATA
  try {
    const s = localStorage.getItem('prediction_pot_data')
    if (s) return JSON.parse(s)
  } catch {}
  return INITIAL_DATA
}

export default function PredictionPot({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [data, setData] = React.useState<PredData>(initData)
  const [tab, setTab] = React.useState<'open' | 'create' | 'leaderboard' | 'mybets' | 'results'>('open')
  const [toast, setToast] = React.useState('')
  const [selectedEvent, setSelectedEvent] = React.useState<PredEvent | null>(null)
  const [selectedPick, setSelectedPick] = React.useState<number | null>(null)
  const myId = 'NG-YOR-••••-ME01'

  const [form, setForm] = React.useState({
    title: '', type: 'Football', options: ['', '', '', ''], deadline: '', entryFee: 50,
  })

  const save = (d: PredData) => {
    setData(d)
    if (typeof window !== 'undefined') localStorage.setItem('prediction_pot_data', JSON.stringify(d))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const createEvent = () => {
    if (!form.title || !form.deadline) return
    const opts = form.options.filter(o => o.trim())
    if (opts.length < 2) return showToast('Add at least 2 options')
    const ev: PredEvent = { id: Date.now().toString(), title: form.title, type: form.type, options: opts, deadline: form.deadline, entryFee: form.entryFee, totalPot: 0, participants: [], closed: false, createdAt: new Date().toISOString() }
    save({ ...data, events: [ev, ...data.events] })
    setTab('open')
    showToast('🎯 Prediction pot created! Let the people speak')
  }

  const placeBet = () => {
    if (!selectedEvent || selectedPick === null) return
    const already = data.myBets.find(b => b.eventId === selectedEvent.id)
    if (already) return showToast('You already placed a bet on this event!')
    const updated = data.events.map(e => e.id === selectedEvent.id ? {
      ...e, totalPot: e.totalPot + e.entryFee, participants: [...e.participants, { user: myId, pick: selectedPick, stake: e.entryFee }]
    } : e)
    const myBets = [...data.myBets, { eventId: selectedEvent.id, pick: selectedPick, stake: selectedEvent.entryFee }]
    save({ ...data, events: updated, myBets })
    setSelectedEvent(null)
    setSelectedPick(null)
    showToast(`₡${selectedEvent.entryFee} staked! May the Oracle bless your prediction 🔮`)
  }

  const getOdds = (ev: PredEvent, pick: number) => {
    const total = ev.participants.length || 1
    const forPick = ev.participants.filter(p => p.pick === pick).length
    const ratio = total / Math.max(forPick, 1)
    return ratio.toFixed(2)
  }

  const timeLeft = (deadline: string) => {
    const ms = new Date(deadline).getTime() - Date.now()
    if (ms < 0) return 'Expired'
    const h = Math.floor(ms / 3600000)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ${h % 24}h left`
    return `${h}h left`
  }

  const inputStyle: React.CSSProperties = { width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }
  const openEvents = data.events.filter(e => !e.closed)
  const closedEvents = data.events.filter(e => e.closed)
  const typeIcon = (t: string) => EVENT_TYPES.find(et => et.label === t)?.icon ?? '🎯'

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'open', label: 'Open' },
    { key: 'create', label: 'Create' },
    { key: 'leaderboard', label: 'Top' },
    { key: 'mybets', label: 'My Bets' },
    { key: 'results', label: 'Results' },
  ]

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelectedEvent(null) }} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === t.key ? C.green : C.muted, color: tab === t.key ? '#fff' : C.sub, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {t.label}
          </button>
        ))}
      </div>

      {selectedEvent && (
        <div style={{ background: C.card, border: `1px solid ${C.gold}40`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>{typeIcon(selectedEvent.type)} {selectedEvent.title}</div>
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 12 }}>Entry: ₡{selectedEvent.entryFee} · Pot: ₡{selectedEvent.totalPot} · {timeLeft(selectedEvent.deadline)}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 8 }}>Pick your prediction:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {selectedEvent.options.map((opt, i) => (
              <button key={i} onClick={() => setSelectedPick(i)} style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${selectedPick === i ? C.gold : C.border}`, background: selectedPick === i ? C.gold + '18' : C.muted, color: selectedPick === i ? C.gold : C.text, fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span>{opt}</span>
                <span style={{ color: C.sub, fontSize: 10 }}>{getOdds(selectedEvent, i)}x odds</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={placeBet} style={{ flex: 1, padding: 10, borderRadius: 10, background: selectedPick !== null ? C.gold : C.border, color: selectedPick !== null ? '#fff' : C.sub, fontWeight: 700, fontSize: 12, border: 'none', cursor: selectedPick !== null ? 'pointer' : 'default' }}>
              Confirm Stake ₡{selectedEvent.entryFee}
            </button>
            <button onClick={() => setSelectedEvent(null)} style={{ padding: '10px 16px', borderRadius: 10, background: C.muted, border: `1px solid ${C.border}`, color: C.sub, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 'open' && !selectedEvent && (
        <div>
          {openEvents.length === 0 && <div style={{ textAlign: 'center', padding: '30px 0', color: C.sub, fontSize: 13 }}>No open predictions. Create one! 🔮</div>}
          {openEvents.map(ev => (
            <div key={ev.id} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{typeIcon(ev.type)} {ev.title}</div>
                <span style={{ fontSize: 9, color: C.gold, fontWeight: 700 }}>{timeLeft(ev.deadline)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {ev.options.map((opt, i) => (
                  <span key={i} style={{ fontSize: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 8px', color: C.sub }}>{opt}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: C.sub }}>🏺 Pot: ₡{ev.totalPot} · {ev.participants.length} players · Entry: ₡{ev.entryFee}</div>
                <button onClick={() => { setSelectedEvent(ev); setSelectedPick(null) }} style={{ padding: '6px 14px', borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>Predict</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'create' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>🔮 Create Prediction Pot</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder='Event title (e.g. "Man United vs Arsenal")' style={inputStyle} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle }}>
              {EVENT_TYPES.map(t => <option key={t.label}>{t.label}</option>)}
            </select>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>Options (up to 4)</div>
            {form.options.map((opt, i) => (
              <input key={i} value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm(f => ({ ...f, options: o })) }} placeholder={`Option ${i + 1}...`} style={inputStyle} />
            ))}
            <input type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: C.sub }}>Entry fee:</span>
              {[20, 50, 100, 200].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, entryFee: n }))} style={{ padding: '6px 12px', borderRadius: 8, background: form.entryFee === n ? C.gold : C.muted, border: `1px solid ${form.entryFee === n ? C.gold : C.border}`, color: form.entryFee === n ? '#fff' : C.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>₡{n}</button>
              ))}
            </div>
            <button onClick={createEvent} style={{ padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Create Prediction Pot</button>
          </div>
        </div>
      )}

      {tab === 'leaderboard' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>🏆 Oracle Leaderboard</div>
          {data.leaderboard.map((l, i) => (
            <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? C.gold : C.sub, width: 28 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{l.user}</div>
                <div style={{ fontSize: 10, color: C.sub }}>{l.correct}/{l.total} correct · {l.streak > 0 ? `🔥 ${l.streak} streak` : 'No streak'}</div>
              </div>
              {l.streak >= 5 && <span style={{ fontSize: 10, background: C.gold + '20', color: C.gold, border: `1px solid ${C.gold}40`, borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>ORACLE</span>}
              <div style={{ fontSize: 13, fontWeight: 800, color: C.green }}>{Math.round((l.correct / l.total) * 100)}%</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'mybets' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>My Predictions</div>
          {data.myBets.length === 0 && <div style={{ textAlign: 'center', padding: '30px 0', color: C.sub, fontSize: 13 }}>You haven't placed any bets yet.</div>}
          {data.myBets.map((b, i) => {
            const ev = data.events.find(e => e.id === b.eventId)
            if (!ev) return null
            return (
              <div key={i} style={{ background: C.muted, border: `1px solid ${b.outcome === 'win' ? C.green : b.outcome === 'loss' ? '#ef4444' : C.border}`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{typeIcon(ev.type)} {ev.title}</div>
                <div style={{ fontSize: 11, color: C.sub }}>Your pick: <strong style={{ color: C.text }}>{ev.options[b.pick]}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: C.sub }}>Staked: ₡{b.stake}</span>
                  {b.outcome === 'win' && <span style={{ fontSize: 10, fontWeight: 700, color: C.green }}>WON ✓</span>}
                  {b.outcome === 'loss' && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>LOST</span>}
                  {!b.outcome && <span style={{ fontSize: 10, color: C.gold }}>Pending...</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'results' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>Completed Predictions</div>
          {closedEvents.length === 0 && <div style={{ textAlign: 'center', padding: '30px 0', color: C.sub, fontSize: 13 }}>No completed events yet.</div>}
          {closedEvents.map(ev => (
            <div key={ev.id} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{typeIcon(ev.type)} {ev.title}</div>
              {ev.winner !== undefined && (
                <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 6 }}>✅ Winner: {ev.options[ev.winner]}</div>
              )}
              <div style={{ fontSize: 11, color: C.sub }}>Total pot: ₡{ev.totalPot} · {ev.participants.length} participants</div>
              <div style={{ fontSize: 10, color: C.sub, marginTop: 4 }}>Village tax: ₡{Math.round(ev.totalPot * 0.1)} → Treasury | Winners: ₡{Math.round(ev.totalPot * 0.9)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
