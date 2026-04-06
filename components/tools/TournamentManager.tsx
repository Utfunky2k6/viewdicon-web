'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Team { id: string; name: string; emoji: string; played: number; won: number; lost: number; drawn: number }
interface Match { id: string; t1: string; t2: string; date: string; venue: string; score1: number | null; score2: number | null }
type TabKey = 'bracket' | 'schedule' | 'standings'

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', AM = '#e65100'

const INIT_TEAMS: Team[] = [
  { id: 't1', name: 'Lagos Lions',      emoji: '🦁', played: 2, won: 2, lost: 0, drawn: 0 },
  { id: 't2', name: 'Abuja Eagles',     emoji: '🦅', played: 2, won: 1, lost: 1, drawn: 0 },
  { id: 't3', name: 'Kano Stallions',   emoji: '🐎', played: 2, won: 1, lost: 0, drawn: 1 },
  { id: 't4', name: 'Enugu Tigers',     emoji: '🐯', played: 2, won: 0, lost: 1, drawn: 1 },
  { id: 't5', name: 'PHC Warriors',     emoji: '⚔️',  played: 2, won: 2, lost: 0, drawn: 0 },
  { id: 't6', name: 'Ibadan United',    emoji: '🌿', played: 2, won: 0, lost: 2, drawn: 0 },
  { id: 't7', name: 'Calabar FC',       emoji: '🦋', played: 2, won: 1, lost: 1, drawn: 0 },
  { id: 't8', name: 'Accra Stars',      emoji: '⭐', played: 2, won: 0, lost: 1, drawn: 1 },
]

const INIT_MATCHES: Match[] = [
  { id: 'm1', t1: 'Lagos Lions',   t2: 'Accra Stars',    date: '2026-03-28', venue: 'National Stadium',   score1: null, score2: null },
  { id: 'm2', t1: 'PHC Warriors',  t2: 'Enugu Tigers',   date: '2026-03-28', venue: 'Teslim Balogun',     score1: null, score2: null },
  { id: 'm3', t1: 'Kano Stallions',t2: 'Calabar FC',     date: '2026-03-29', venue: 'Ahmadu Bello Stad.', score1: null, score2: null },
  { id: 'm4', t1: 'Abuja Eagles',  t2: 'Ibadan United',  date: '2026-03-29', venue: 'Moshood Abiola Stad.',score1: null, score2: null },
]

export default function TournamentManager({ villageId: _v, roleKey: _r }: ToolProps) {
  const [tab, setTab] = useState<TabKey>('bracket')
  const [teams, setTeams] = useState<Team[]>(INIT_TEAMS)
  const [matches, setMatches] = useState<Match[]>(INIT_MATCHES)
  const [newTeam, setNewTeam] = useState('')
  const [tournamentName, setTournamentName] = useState('Viewdicon Cup 2026')
  const [sport, setSport] = useState('Football')
  const [prize, setPrize] = useState('500000')
  const [showAward, setShowAward] = useState(false)
  const [scoreInputs, setScoreInputs] = useState<Record<string, { s1: string; s2: string }>>({})

  const addTeam = () => {
    if (!newTeam.trim() || teams.length >= 16) return
    setTeams(ts => [...ts, { id: `t${Date.now()}`, name: newTeam.trim(), emoji: '🏆', played: 0, won: 0, lost: 0, drawn: 0 }])
    setNewTeam('')
  }

  const removeTeam = (id: string) => setTeams(ts => ts.filter(t => t.id !== id))

  const recordScore = (id: string) => {
    const inp = scoreInputs[id]
    if (!inp) return
    const s1 = parseInt(inp.s1)
    const s2 = parseInt(inp.s2)
    if (isNaN(s1) || isNaN(s2)) return
    setMatches(ms => ms.map(m => m.id === id ? { ...m, score1: s1, score2: s2 } : m))
    setScoreInputs(si => { const n = { ...si }; delete n[id]; return n })
  }

  const standings = [...teams].sort((a, b) => {
    const ptA = a.won * 3 + a.drawn
    const ptB = b.won * 3 + b.drawn
    return ptB - ptA
  })

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'bracket', label: '🏆 Bracket' },
    { key: 'schedule', label: '📅 Schedule' },
    { key: 'standings', label: '📊 Standings' },
  ]

  // Bracket: QF teams (top 8) → SF (top 4) → Final (top 2)
  const qfPairs = [[0,1],[2,3],[4,5],[6,7]].map(([a,b]) => [teams[a]?.name ?? '?', teams[b]?.name ?? '?'])
  const sfPairs = [['QF1 Winner', 'QF2 Winner'], ['QF3 Winner', 'QF4 Winner']]
  const prizePool = parseInt(prize) || 500000

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      {/* Tournament Header */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <input
          value={tournamentName}
          onChange={e => setTournamentName(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: TX, fontSize: 18, fontWeight: 700, width: '100%', outline: 'none', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
          <div>
            <select value={sport} onChange={e => setSport(e.target.value)}
              style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '4px 8px', color: TX, fontSize: 12 }}>
              {['Football', 'Basketball', 'Athletics', 'Chess', 'Wrestling', 'Volleyball'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: MT, fontSize: 12 }}>Ògbó Pot: ₡</span>
            <input value={prize} onChange={e => setPrize(e.target.value)} style={{ width: 80, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '4px 8px', color: '#a5d6a7', fontSize: 12 }} />
          </div>
        </div>
      </div>

      {/* Teams */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>PARTICIPANTS</span>
          <span>{teams.length}/16</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {teams.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 8, padding: '4px 10px', fontSize: 12 }}>
              <span>{t.emoji}</span>
              <span>{t.name}</span>
              <button onClick={() => removeTeam(t.id)} style={{ background: 'none', border: 'none', color: MT, cursor: 'pointer', fontSize: 12, padding: 0, marginLeft: 2 }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newTeam} onChange={e => setNewTeam(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTeam()} placeholder="Add team name..."
            style={{ flex: 1, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 7, padding: '7px 10px', color: TX, fontSize: 13 }} />
          <button onClick={addTeam} style={{ padding: '7px 16px', background: GR, border: 'none', borderRadius: 7, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>+</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '8px 4px', border: `1px solid ${tab === t.key ? GR : BD}`, borderRadius: 9, background: tab === t.key ? '#0a2a0a' : CARD, color: tab === t.key ? '#a5d6a7' : MT, cursor: 'pointer', fontSize: 12, fontWeight: tab === t.key ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Bracket View */}
      {tab === 'bracket' && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 14 }}>KNOCKOUT BRACKET</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', overflowX: 'auto' }}>
            {/* QF */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: MT, marginBottom: 2, textAlign: 'center' }}>QUARTER FINALS</div>
              {qfPairs.map(([t1, t2], i) => (
                <div key={i} style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 8, padding: 8, width: 120 }}>
                  <div style={{ fontSize: 11, padding: '3px 0', borderBottom: `1px solid ${BD}`, color: TX }}>{t1}</div>
                  <div style={{ fontSize: 11, padding: '3px 0', color: TX }}>{t2}</div>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div style={{ color: MT, fontSize: 18, flexShrink: 0 }}>→</div>

            {/* SF */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 48, flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: MT, marginBottom: 2, textAlign: 'center' }}>SEMI FINALS</div>
              {sfPairs.map(([t1, t2], i) => (
                <div key={i} style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 8, padding: 8, width: 120 }}>
                  <div style={{ fontSize: 11, padding: '3px 0', borderBottom: `1px solid ${BD}`, color: MT }}>{t1}</div>
                  <div style={{ fontSize: 11, padding: '3px 0', color: MT }}>{t2}</div>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div style={{ color: MT, fontSize: 18, flexShrink: 0 }}>→</div>

            {/* Final */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: '#ffe0b2', marginBottom: 8, textAlign: 'center', fontWeight: 700 }}>FINAL</div>
              <div style={{ background: '#1a1000', border: `2px solid ${AM}`, borderRadius: 8, padding: 10, width: 120 }}>
                <div style={{ fontSize: 11, padding: '4px 0', borderBottom: `1px solid ${AM}44`, color: '#ffe0b2' }}>SF1 Winner</div>
                <div style={{ fontSize: 11, padding: '4px 0', color: '#ffe0b2' }}>SF2 Winner</div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 18 }}>🏆</div>
                <div style={{ fontSize: 10, color: '#ffe0b2', fontWeight: 700 }}>₡{prizePool.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule */}
      {tab === 'schedule' && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          {matches.map((m, i) => {
            const inp = scoreInputs[m.id] ?? { s1: '', s2: '' }
            return (
              <div key={m.id} style={{ padding: '12px 14px', borderBottom: i < matches.length - 1 ? `1px solid ${BD}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: MT }}>{m.date}</span>
                  <span style={{ fontSize: 11, color: MT }}>{m.venue}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{m.t1}</span>
                  {m.score1 !== null
                    ? <span style={{ fontSize: 16, fontWeight: 700, color: '#a5d6a7', minWidth: 40, textAlign: 'center' }}>{m.score1}–{m.score2}</span>
                    : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 90, justifyContent: 'center' }}>
                        <input value={inp.s1} onChange={e => setScoreInputs(si => ({ ...si, [m.id]: { ...inp, s1: e.target.value } }))} placeholder="0"
                          style={{ width: 28, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 4, padding: '4px 6px', color: TX, fontSize: 12, textAlign: 'center' }} />
                        <span style={{ color: MT }}>–</span>
                        <input value={inp.s2} onChange={e => setScoreInputs(si => ({ ...si, [m.id]: { ...inp, s2: e.target.value } }))} placeholder="0"
                          style={{ width: 28, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 4, padding: '4px 6px', color: TX, fontSize: 12, textAlign: 'center' }} />
                        <button onClick={() => recordScore(m.id)} style={{ background: GR, border: 'none', borderRadius: 4, padding: '4px 6px', color: '#fff', cursor: 'pointer', fontSize: 11 }}>✓</button>
                      </div>
                    )
                  }
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{m.t2}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Standings */}
      {tab === 'standings' && (
        <>
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '9px 14px', borderBottom: `1px solid ${BD}`, fontSize: 10, color: MT, fontWeight: 700, display: 'flex', gap: 6 }}>
              <span style={{ width: 22 }}>#</span>
              <span style={{ flex: 1 }}>TEAM</span>
              <span style={{ width: 28, textAlign: 'center' }}>P</span>
              <span style={{ width: 28, textAlign: 'center' }}>W</span>
              <span style={{ width: 28, textAlign: 'center' }}>L</span>
              <span style={{ width: 28, textAlign: 'center' }}>D</span>
              <span style={{ width: 32, textAlign: 'center' }}>PTS</span>
            </div>
            {standings.map((t, i) => {
              const pts = t.won * 3 + t.drawn
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderBottom: i < standings.length - 1 ? `1px solid ${BD}` : 'none', background: i < 2 ? '#0a1a0a' : 'transparent' }}>
                  <span style={{ width: 22, fontSize: 12, color: i < 2 ? '#a5d6a7' : MT, fontWeight: i < 2 ? 700 : 400 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{t.emoji} {t.name}</span>
                  <span style={{ width: 28, textAlign: 'center', fontSize: 12, color: MT }}>{t.played}</span>
                  <span style={{ width: 28, textAlign: 'center', fontSize: 12, color: '#a5d6a7' }}>{t.won}</span>
                  <span style={{ width: 28, textAlign: 'center', fontSize: 12, color: '#ef9a9a' }}>{t.lost}</span>
                  <span style={{ width: 28, textAlign: 'center', fontSize: 12, color: MT }}>{t.drawn}</span>
                  <span style={{ width: 32, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#ffe0b2' }}>{pts}</span>
                </div>
              )
            })}
          </div>

          <button onClick={() => setShowAward(v => !v)}
            style={{ width: '100%', padding: 12, background: AM, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            🏆 Award Prizes
          </button>
          {showAward && (
            <div style={{ background: '#1a1000', border: `1px solid ${AM}`, borderRadius: 12, padding: 14, marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#ffe0b2', fontWeight: 700, marginBottom: 10 }}>PRIZE BREAKDOWN</div>
              {[['🥇 1st Place', 0.5], ['🥈 2nd Place', 0.25], ['🥉 3rd Place', 0.15], ['4th Place', 0.1]].map(([label, pct]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${AM}33`, fontSize: 13 }}>
                  <span>{label as string}</span>
                  <span style={{ color: '#ffe0b2', fontWeight: 700 }}>₡{Math.round(prizePool * (pct as number)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
