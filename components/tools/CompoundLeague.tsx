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

const SPORT_TYPES = [
  { label: 'Football', icon: '⚽' },
  { label: 'Basketball', icon: '🏀' },
  { label: 'Table Tennis', icon: '🏓' },
  { label: 'Chess', icon: '♟️' },
  { label: 'Ludo', icon: '🎲' },
  { label: 'Athletics', icon: '🏃' },
  { label: 'Wrestling', icon: '💪' },
]

const FORMATS = ['League', 'Knockout', 'Group+Knockout']
const JERSEY_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

interface TeamEntry { name: string; captain: string; jerseyColor: string; players: string[] }

interface Match {
  id: string
  home: string
  away: string
  homeScore?: number
  awayScore?: number
  played: boolean
  round: number
}

interface League {
  id: string
  name: string
  sport: string
  format: string
  seasonStart: string
  seasonEnd: string
  entryFee: number
  teams: TeamEntry[]
  matches: Match[]
  finished: boolean
  createdAt: string
}

interface StandingRow { team: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; points: number }

interface CompoundData {
  leagues: League[]
  activeLeagueId: string | null
}

function generateFixtures(teams: TeamEntry[]): Match[] {
  const matches: Match[] = []
  let id = 1
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ id: String(id++), home: teams[i].name, away: teams[j].name, played: false, round: Math.floor(id / 2) })
    }
  }
  return matches
}

function computeStandings(teams: TeamEntry[], matches: Match[]): StandingRow[] {
  const map: Record<string, StandingRow> = {}
  teams.forEach(t => { map[t.name] = { team: t.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 } })
  matches.forEach(m => {
    if (!m.played || m.homeScore === undefined || m.awayScore === undefined) return
    const h = map[m.home]; const a = map[m.away]
    if (!h || !a) return
    h.played++; a.played++
    h.gf += m.homeScore; h.ga += m.awayScore
    a.gf += m.awayScore; a.ga += m.homeScore
    if (m.homeScore > m.awayScore) { h.won++; h.points += 3; a.lost++ }
    else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++ }
    else { h.drawn++; a.drawn++; h.points++; a.points++ }
  })
  return Object.values(map).sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga))
}

const INITIAL_DATA: CompoundData = {
  leagues: [
    {
      id: '1', name: 'Compound Cup 2026', sport: 'Football', format: 'League', seasonStart: '2026-03-01', seasonEnd: '2026-05-31', entryFee: 500,
      teams: [
        { name: 'Lagos Lions', captain: 'NG-YOR-••••-1234', jerseyColor: '#ef4444', players: ['Chukwu', 'Emeka', 'Bola', 'Tunde'] },
        { name: 'Abuja Eagles', captain: 'NG-HAU-••••-5678', jerseyColor: '#3b82f6', players: ['Yusuf', 'Ibrahim', 'Musa', 'Ali'] },
        { name: 'Port Harcourt Kings', captain: 'NG-IGO-••••-9012', jerseyColor: '#22c55e', players: ['Chidi', 'Eze', 'Obi', 'Nna'] },
      ],
      matches: [
        { id: '1', home: 'Lagos Lions', away: 'Abuja Eagles', homeScore: 2, awayScore: 1, played: true, round: 1 },
        { id: '2', home: 'Lagos Lions', away: 'Port Harcourt Kings', played: false, round: 2 },
        { id: '3', home: 'Abuja Eagles', away: 'Port Harcourt Kings', played: false, round: 2 },
      ],
      finished: false, createdAt: new Date().toISOString(),
    }
  ],
  activeLeagueId: '1',
}

function initData(): CompoundData {
  if (typeof window === 'undefined') return INITIAL_DATA
  try {
    const s = localStorage.getItem('compound_league_data')
    if (s) return JSON.parse(s)
  } catch {}
  return INITIAL_DATA
}

export default function CompoundLeague({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [data, setData] = React.useState<CompoundData>(initData)
  const [tab, setTab] = React.useState<'overview' | 'standings' | 'fixtures' | 'register' | 'create' | 'result'>('overview')
  const [toast, setToast] = React.useState('')
  const [showTrophy, setShowTrophy] = React.useState(false)
  const myId = 'NG-YOR-••••-ME01'

  const [teamForm, setTeamForm] = React.useState({ name: '', jerseyColor: JERSEY_COLORS[0], players: ['', '', '', ''] })
  const [createForm, setCreateForm] = React.useState({ name: '', sport: 'Football', format: 'League', seasonStart: '', seasonEnd: '', entryFee: 500 })
  const [resultForm, setResultForm] = React.useState({ matchId: '', homeScore: '', awayScore: '' })

  const save = (d: CompoundData) => {
    setData(d)
    if (typeof window !== 'undefined') localStorage.setItem('compound_league_data', JSON.stringify(d))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const activeLeague = data.leagues.find(l => l.id === data.activeLeagueId) || data.leagues[0]

  const sportIcon = (s: string) => SPORT_TYPES.find(st => st.label === s)?.icon ?? '🏅'

  const createLeague = () => {
    if (!createForm.name || !createForm.seasonStart) return
    const l: League = { id: Date.now().toString(), name: createForm.name, sport: createForm.sport, format: createForm.format, seasonStart: createForm.seasonStart, seasonEnd: createForm.seasonEnd, entryFee: createForm.entryFee, teams: [], matches: [], finished: false, createdAt: new Date().toISOString() }
    save({ ...data, leagues: [...data.leagues, l], activeLeagueId: l.id })
    setTab('overview')
    showToast('🏆 League created! Register teams to begin')
  }

  const registerTeam = () => {
    if (!teamForm.name || !activeLeague) return
    if (activeLeague.teams.find(t => t.name === teamForm.name)) return showToast('Team name already taken!')
    const players = teamForm.players.filter(p => p.trim())
    const team: TeamEntry = { name: teamForm.name, captain: myId, jerseyColor: teamForm.jerseyColor, players }
    const updatedTeams = [...activeLeague.teams, team]
    const updatedMatches = generateFixtures(updatedTeams)
    const updated = data.leagues.map(l => l.id === activeLeague.id ? { ...l, teams: updatedTeams, matches: updatedMatches } : l)
    save({ ...data, leagues: updated })
    setTeamForm({ name: '', jerseyColor: JERSEY_COLORS[0], players: ['', '', '', ''] })
    showToast(`⚽ ${team.name} registered! Fixtures updated`)
  }

  const enterResult = () => {
    if (!resultForm.matchId || resultForm.homeScore === '' || resultForm.awayScore === '') return
    const updated = data.leagues.map(l => {
      if (l.id !== activeLeague.id) return l
      const matches = l.matches.map(m => m.id === resultForm.matchId ? { ...m, homeScore: Number(resultForm.homeScore), awayScore: Number(resultForm.awayScore), played: true } : m)
      const allPlayed = matches.every(m => m.played)
      if (allPlayed && !l.finished) { setShowTrophy(true); setTimeout(() => setShowTrophy(false), 5000) }
      return { ...l, matches, finished: allPlayed }
    })
    save({ ...data, leagues: updated })
    setResultForm({ matchId: '', homeScore: '', awayScore: '' })
    showToast('✅ Result recorded!')
  }

  const standings = activeLeague ? computeStandings(activeLeague.teams, activeLeague.matches) : []
  const unplayed = activeLeague ? activeLeague.matches.filter(m => !m.played) : []
  const played = activeLeague ? activeLeague.matches.filter(m => m.played) : []
  const totalPot = activeLeague ? activeLeague.entryFee * activeLeague.teams.length : 0

  const inputStyle: React.CSSProperties = { width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }
  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'standings', label: 'Table' },
    { key: 'fixtures', label: 'Fixtures' },
    { key: 'result', label: 'Results' },
    { key: 'register', label: 'Register' },
    { key: 'create', label: '+ League' },
  ]

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {showTrophy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, flexDirection: 'column' }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: 'none' }}>🏆</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>{standings[0]?.team}</div>
          <div style={{ fontSize: 14, color: '#fff', marginTop: 8 }}>Are Champions!</div>
          <button onClick={() => setShowTrophy(false)} style={{ marginTop: 24, padding: '10px 28px', borderRadius: 99, background: C.gold, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>Celebrate!</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: tab === t.key ? C.green : C.muted, color: tab === t.key ? '#fff' : C.sub, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && activeLeague && (
        <div>
          <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>{sportIcon(activeLeague.sport)}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{activeLeague.name}</div>
                <div style={{ fontSize: 11, color: C.sub }}>{activeLeague.format} · {activeLeague.sport}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{activeLeague.teams.length}</div><div style={{ fontSize: 9, color: C.sub }}>Teams</div></div>
              <div><div style={{ fontSize: 18, fontWeight: 800, color: C.gold }}>₡{totalPot.toLocaleString()}</div><div style={{ fontSize: 9, color: C.sub }}>Prize Pot</div></div>
              <div><div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{played.length}/{activeLeague.matches.length}</div><div style={{ fontSize: 9, color: C.sub }}>Matches</div></div>
            </div>
            {activeLeague.finished && standings[0] && (
              <div style={{ marginTop: 12, background: C.gold + '18', border: `1px solid ${C.gold}40`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>CHAMPIONS</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{standings[0].team}</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 8 }}>Registered Teams</div>
          {activeLeague.teams.map((t, i) => (
            <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.jerseyColor, flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t.name}</div>
                <div style={{ fontSize: 10, color: C.sub }}>Captain: {t.captain} · {t.players.length} players</div>
              </div>
            </div>
          ))}
          {activeLeague.teams.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: C.sub, fontSize: 12 }}>No teams yet — register your team!</div>}

          {data.leagues.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 8 }}>All Leagues</div>
              {data.leagues.map(l => (
                <button key={l.id} onClick={() => { save({ ...data, activeLeagueId: l.id }); setTab('overview') }} style={{ width: '100%', background: l.id === data.activeLeagueId ? C.green + '18' : C.muted, border: `1px solid ${l.id === data.activeLeagueId ? C.green : C.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{sportIcon(l.sport)} {l.name}</span>
                  <span style={{ fontSize: 10, color: C.sub }}>{l.teams.length} teams</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'standings' && activeLeague && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 12 }}>{sportIcon(activeLeague.sport)} {activeLeague.name} — Standings</div>
          <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5rem 2.5rem 2.5rem 2.5rem 2.5rem 3rem', gap: 4, padding: '8px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 9, fontWeight: 700, color: C.sub, textTransform: 'uppercase' }}>
              <span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span>
            </div>
            {standings.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2.5rem 2.5rem 2.5rem 2.5rem 2.5rem 3rem', gap: 4, padding: '10px 12px', borderBottom: i < standings.length - 1 ? `1px solid ${C.border}` : 'none', background: i === 0 ? C.gold + '0d' : 'transparent' }}>
                <span style={{ fontSize: 12, fontWeight: i === 0 ? 800 : 600, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={{ width: 16, textAlign: 'center', color: C.sub, fontSize: 10 }}>{i + 1}</span>}
                  {s.team}
                </span>
                <span style={{ fontSize: 11, color: C.sub, textAlign: 'center' }}>{s.played}</span>
                <span style={{ fontSize: 11, color: C.green, fontWeight: 700, textAlign: 'center' }}>{s.won}</span>
                <span style={{ fontSize: 11, color: C.sub, textAlign: 'center' }}>{s.drawn}</span>
                <span style={{ fontSize: 11, color: '#ef4444', textAlign: 'center' }}>{s.lost}</span>
                <span style={{ fontSize: 11, color: C.sub, textAlign: 'center' }}>{s.gf - s.ga > 0 ? '+' : ''}{s.gf - s.ga}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.gold, textAlign: 'center' }}>{s.points}</span>
              </div>
            ))}
            {standings.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: C.sub, fontSize: 12 }}>No teams yet</div>}
          </div>
        </div>
      )}

      {tab === 'fixtures' && activeLeague && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 12 }}>Match Schedule</div>
          {unplayed.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 8, textTransform: 'uppercase' }}>Upcoming</div>
              {unplayed.map(m => (
                <div key={m.id} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1 }}>{m.home}</span>
                  <span style={{ fontSize: 10, color: C.sub, padding: '0 10px' }}>vs</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1, textAlign: 'right' }}>{m.away}</span>
                </div>
              ))}
            </div>
          )}
          {played.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 8, textTransform: 'uppercase' }}>Results</div>
              {played.map(m => (
                <div key={m.id} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.homeScore! > m.awayScore! ? C.green : C.text, flex: 1 }}>{m.home}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: C.text, padding: '0 10px', letterSpacing: 2 }}>{m.homeScore} — {m.awayScore}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.awayScore! > m.homeScore! ? C.green : C.text, flex: 1, textAlign: 'right' }}>{m.away}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'result' && activeLeague && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>Enter Match Result</div>
          {unplayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: C.sub, fontSize: 12 }}>All matches have been played!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select value={resultForm.matchId} onChange={e => setResultForm(f => ({ ...f, matchId: e.target.value }))} style={inputStyle}>
                <option value="">Select a match...</option>
                {unplayed.map(m => <option key={m.id} value={m.id}>{m.home} vs {m.away}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={resultForm.homeScore} onChange={e => setResultForm(f => ({ ...f, homeScore: e.target.value }))} placeholder="Home score" type="number" min="0" style={{ ...inputStyle }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: C.sub, flexShrink: 0 }}>—</span>
                <input value={resultForm.awayScore} onChange={e => setResultForm(f => ({ ...f, awayScore: e.target.value }))} placeholder="Away score" type="number" min="0" style={{ ...inputStyle }} />
              </div>
              <button onClick={enterResult} style={{ padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Confirm Result</button>
            </div>
          )}
        </div>
      )}

      {tab === 'register' && activeLeague && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>Register Your Team</div>
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 12 }}>Entry fee: ₡{activeLeague.entryFee} per team</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} placeholder="Team name (e.g. Lagos Lions)" style={inputStyle} />
            <div>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>Jersey Color</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {JERSEY_COLORS.map(color => (
                  <button key={color} onClick={() => setTeamForm(f => ({ ...f, jerseyColor: color }))} style={{ width: 28, height: 28, borderRadius: '50%', background: color, border: `3px solid ${teamForm.jerseyColor === color ? '#fff' : 'transparent'}`, cursor: 'pointer', outline: teamForm.jerseyColor === color ? `2px solid ${color}` : 'none' }} />
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.sub }}>Players (up to 15)</div>
            {teamForm.players.map((p, i) => (
              <input key={i} value={p} onChange={e => { const pl = [...teamForm.players]; pl[i] = e.target.value; setTeamForm(f => ({ ...f, players: pl })) }} placeholder={`Player ${i + 1} name`} style={inputStyle} />
            ))}
            <button onClick={() => setTeamForm(f => ({ ...f, players: [...f.players, ''] }))} style={{ padding: '8px', borderRadius: 8, background: C.muted, border: `1px solid ${C.border}`, color: C.sub, fontSize: 12, cursor: 'pointer' }}>+ Add Player</button>
            <button onClick={registerTeam} style={{ padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Register Team — ₡{activeLeague.entryFee}</button>
          </div>
        </div>
      )}

      {tab === 'create' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>Create New League</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="League name (e.g. Compound Cup 2026)" style={inputStyle} />
            <select value={createForm.sport} onChange={e => setCreateForm(f => ({ ...f, sport: e.target.value }))} style={{ ...inputStyle }}>
              {SPORT_TYPES.map(s => <option key={s.label}>{s.label}</option>)}
            </select>
            <select value={createForm.format} onChange={e => setCreateForm(f => ({ ...f, format: e.target.value }))} style={{ ...inputStyle }}>
              {FORMATS.map(f => <option key={f}>{f}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>Season Start</div>
                <input type="date" value={createForm.seasonStart} onChange={e => setCreateForm(f => ({ ...f, seasonStart: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>Season End</div>
                <input type="date" value={createForm.seasonEnd} onChange={e => setCreateForm(f => ({ ...f, seasonEnd: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: C.sub }}>Entry fee:</span>
              {[200, 500, 1000, 2000].map(n => (
                <button key={n} onClick={() => setCreateForm(f => ({ ...f, entryFee: n }))} style={{ padding: '6px 10px', borderRadius: 8, background: createForm.entryFee === n ? C.gold : C.muted, border: `1px solid ${createForm.entryFee === n ? C.gold : C.border}`, color: createForm.entryFee === n ? '#fff' : C.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>₡{n}</button>
              ))}
            </div>
            <button onClick={createLeague} style={{ padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Create League</button>
          </div>
        </div>
      )}
    </div>
  )
}
