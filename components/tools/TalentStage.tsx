'use client'
import React, { useState, useEffect } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Performance { id: string; title: string; category: string; performer: string; village: string; link: string; description: string; votes: number; comments: Comment[]; promoted: boolean; uploadedAt: number }
interface Comment { id: string; afroId: string; text: string; ts: number }
interface JudgeRemark { judgeTitle: string; judgeEmoji: string; remark: string; perfId: string }
type TabKey = 'browse' | 'submit' | 'leaderboard' | 'judges'

const STORAGE_KEY = 'talent_stage_data'
const VOTES_KEY = 'talent_stage_votes'
const MAX_WEEKLY_VOTES = 3
const PROMOTE_THRESHOLD = 50

const CATEGORIES = [
  { key: 'Singing', emoji: '🎤' },
  { key: 'Dancing', emoji: '💃' },
  { key: 'Comedy', emoji: '😂' },
  { key: 'Spoken Word', emoji: '📜' },
  { key: 'Drumming', emoji: '🥁' },
  { key: 'Cultural', emoji: '🎭' },
]

const JUDGES = [
  { title: 'Griot', emoji: '🎭', afroId: 'Griot_Kwame' },
  { title: 'Elder', emoji: '👑', afroId: 'Elder_Amara' },
  { title: 'Youth Voice', emoji: '🌱', afroId: 'YouthVoice_Temi' },
]

const MOCK_PERFS: Performance[] = [
  { id: 'p1', title: 'Oge Uwa — Highlife Medley', category: 'Singing', performer: 'Amara_Voices', village: 'Enugu-Central', link: '', description: 'Traditional highlife woven with contemporary Igbo poetry. Watch the full performance on Jollof TV.', votes: 62, comments: [{ id: 'cc1', afroId: 'Nkechi_Fan', text: 'This brought tears to my eyes! Pure talent 🙏', ts: Date.now() - 3600000 }], promoted: true, uploadedAt: Date.now() - 86400000 * 2 },
  { id: 'p2', title: 'Lagos Street Dancer', category: 'Dancing', performer: 'Dami_Moves', village: 'Lagos-Island', link: '', description: 'Afrobeats + Shaku Shaku + Zanku fusion that shut down the street.', votes: 38, comments: [], promoted: false, uploadedAt: Date.now() - 86400000 * 1 },
  { id: 'p3', title: "My Father's Kente", category: 'Spoken Word', performer: 'Kofi_Words', village: 'Accra-Central', link: '', description: "A poem about heritage, identity, and the cloth passed down generations.", votes: 27, comments: [{ id: 'cc2', afroId: 'Ama_Ghana', text: 'Wallahi this poem deserves a stage. Fire!', ts: Date.now() - 7200000 }], promoted: false, uploadedAt: Date.now() - 86400000 * 3 },
  { id: 'p4', title: 'Calabar Comedy Night', category: 'Comedy', performer: 'Efik_Comedian', village: 'Calabar-South', link: '', description: 'Stand-up about growing up in Calabar — the rice, the masquerades, the confusion.', votes: 44, comments: [], promoted: false, uploadedAt: Date.now() - 86400000 * 1 },
]

const MOCK_REMARKS: JudgeRemark[] = [
  { judgeTitle: 'Griot', judgeEmoji: '🎭', remark: 'This performance carries the spirit of our ancestors. The audience felt it in their bones.', perfId: 'p1' },
  { judgeTitle: 'Elder', judgeEmoji: '👑', remark: 'In forty years of watching talent shows, this is a performance the village will remember.', perfId: 'p1' },
]

export default function TalentStage({ villageId: _v, roleKey: _r }: ToolProps) {
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

  const [tab, setTab] = useState<TabKey>('browse')
  const [perfs, setPerfs] = useState<Performance[]>(() => {
    if (typeof window === 'undefined') return MOCK_PERFS
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : MOCK_PERFS } catch { return MOCK_PERFS }
  })
  const [remarks, setRemarks] = useState<JudgeRemark[]>(MOCK_REMARKS)
  const [votesUsed, setVotesUsed] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    try { return parseInt(localStorage.getItem(VOTES_KEY) || '0') } catch { return 0 }
  })
  const [expandedPerf, setExpandedPerf] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState<Record<string, string>>({})
  const [judgeRemarkInput, setJudgeRemarkInput] = useState('')
  const [judgeTarget, setJudgeTarget] = useState('')
  const [selectedJudge, setSelectedJudge] = useState(0)

  // Submit form
  const [sTitle, setSTitle] = useState('')
  const [sCat, setSCat] = useState('Singing')
  const [sLink, setSLink] = useState('')
  const [sDesc, setSDesc] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(perfs))
      localStorage.setItem(VOTES_KEY, String(votesUsed))
    }
  }, [perfs, votesUsed])

  const voteFor = (id: string) => {
    if (votesUsed >= MAX_WEEKLY_VOTES) return
    setPerfs(ps => ps.map(p => {
      if (p.id !== id) return p
      const newVotes = p.votes + 1
      return { ...p, votes: newVotes, promoted: newVotes >= PROMOTE_THRESHOLD }
    }))
    setVotesUsed(v => v + 1)
  }

  const addComment = (perfId: string) => {
    const text = commentInput[perfId]?.trim()
    if (!text) return
    const c: Comment = { id: String(Date.now()), afroId: 'You', text, ts: Date.now() }
    setPerfs(ps => ps.map(p => p.id === perfId ? { ...p, comments: [...p.comments, c] } : p))
    setCommentInput(ci => ({ ...ci, [perfId]: '' }))
  }

  const submitPerformance = () => {
    if (!sTitle.trim() || !sDesc.trim()) return
    const p: Performance = { id: String(Date.now()), title: sTitle, category: sCat, performer: 'You', village: _v || 'My Village', link: sLink, description: sDesc, votes: 0, comments: [], promoted: false, uploadedAt: Date.now() }
    setPerfs(ps => [p, ...ps])
    setSTitle(''); setSLink(''); setSDesc('')
    setTab('browse')
  }

  const addJudgeRemark = () => {
    if (!judgeRemarkInput.trim() || !judgeTarget) return
    const judge = JUDGES[selectedJudge]
    const r: JudgeRemark = { judgeTitle: judge.title, judgeEmoji: judge.emoji, remark: judgeRemarkInput.trim(), perfId: judgeTarget }
    setRemarks(rs => [r, ...rs])
    setJudgeRemarkInput('')
  }

  const sorted = [...perfs].sort((a, b) => b.votes - a.votes)
  const top5 = sorted.slice(0, 5)
  const catEmoji = (key: string) => CATEGORIES.find(c => c.key === key)?.emoji || '🎭'

  // Days until voting closes (fake: next Sunday)
  const now = new Date()
  const daysLeft = 7 - now.getDay()

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'browse', label: '🎭 Perform' },
    { key: 'submit', label: '📤 Submit' },
    { key: 'leaderboard', label: '🏆 Board' },
    { key: 'judges', label: '👑 Judges' },
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'system-ui,sans-serif', padding: 16, maxWidth: 480 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>🎭 Talent Stage</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Village talent show — Top performer earns <span style={{ color: C.gold, fontWeight: 700 }}>₡500</span></div>
      </div>

      {/* Voting meter */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: C.sub }}>Your weekly votes</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {Array.from({ length: MAX_WEEKLY_VOTES }).map((_, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i < votesUsed ? C.gold : C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                {i < votesUsed ? '⭐' : '○'}
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.sub }}>Voting closes in</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{daysLeft}d</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '7px 2px', border: `1px solid ${tab === t.key ? C.green : C.border}`, borderRadius: 9, background: tab === t.key ? (dark ? '#0a2a0a' : '#e8fbe8') : C.card, color: tab === t.key ? C.green : C.sub, cursor: 'pointer', fontSize: 11, fontWeight: tab === t.key ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* BROWSE */}
      {tab === 'browse' && (
        <div>
          {perfs.map(p => (
            <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1, marginRight: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 16 }}>{catEmoji(p.category)}</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.title}</span>
                    {p.promoted && <span style={{ background: C.gold, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '1px 5px' }}>🌟 JOLLOF TV</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.sub }}>@{p.performer} · {p.village}</div>
                </div>
                <button onClick={() => voteFor(p.id)} disabled={votesUsed >= MAX_WEEKLY_VOTES}
                  style={{ background: votesUsed >= MAX_WEEKLY_VOTES ? C.muted : '#1a1000', border: `1px solid ${votesUsed >= MAX_WEEKLY_VOTES ? C.border : C.gold}`, borderRadius: 8, padding: '6px 10px', color: votesUsed >= MAX_WEEKLY_VOTES ? C.sub : C.gold, cursor: votesUsed >= MAX_WEEKLY_VOTES ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 12, textAlign: 'center', minWidth: 50 }}>
                  ⭐<br /><span style={{ fontSize: 13 }}>{p.votes}</span>
                </button>
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4, marginBottom: 8 }}>{p.description}</div>
              {p.link && (
                <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 8 }}>🔗 {p.link}</div>
              )}
              {/* Vote bar */}
              <div style={{ height: 4, background: C.muted, borderRadius: 2, marginBottom: 8 }}>
                <div style={{ height: '100%', background: p.votes >= PROMOTE_THRESHOLD ? C.gold : C.green, borderRadius: 2, width: `${Math.min(100, (p.votes / PROMOTE_THRESHOLD) * 100)}%`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.sub, marginBottom: 6 }}>
                <span>💬 {p.comments.length} comments</span>
                <span>{p.votes}/{PROMOTE_THRESHOLD} votes to Jollof TV</span>
              </div>

              {/* Expand */}
              <button onClick={() => setExpandedPerf(expandedPerf === p.id ? null : p.id)}
                style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', fontSize: 12, padding: 0 }}>
                {expandedPerf === p.id ? '▲ Hide comments' : '▼ Show comments'}
              </button>

              {expandedPerf === p.id && (
                <div style={{ marginTop: 10 }}>
                  {/* Judge remarks on this perf */}
                  {remarks.filter(r => r.perfId === p.id).map((r, i) => (
                    <div key={i} style={{ background: '#1a1000', border: `1px solid ${C.gold}44`, borderRadius: 8, padding: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 3 }}>{r.judgeEmoji} {r.judgeTitle} Judge</div>
                      <div style={{ fontSize: 12, color: C.text }}>{r.remark}</div>
                    </div>
                  ))}
                  {p.comments.map(c => (
                    <div key={c.id} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{c.afroId}: </span>
                      <span style={{ fontSize: 12 }}>{c.text}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input value={commentInput[p.id] || ''} onChange={e => setCommentInput(ci => ({ ...ci, [p.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addComment(p.id)} placeholder="Drop your support..."
                      style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', color: C.text, fontSize: 13, outline: 'none' }} />
                    <button onClick={() => addComment(p.id)} style={{ padding: '7px 12px', background: C.green, border: 'none', borderRadius: 7, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>→</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT */}
      {tab === 'submit' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📤 Submit Your Performance</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Performance Title *</div>
            <input value={sTitle} onChange={e => setSTitle(e.target.value)} placeholder="e.g. My Afrobeats Original"
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 6 }}>Category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setSCat(c.key)}
                  style={{ padding: '5px 12px', border: `1px solid ${sCat === c.key ? C.green : C.border}`, borderRadius: 20, background: sCat === c.key ? (dark ? '#0a2a0a' : '#e8fbe8') : C.muted, color: sCat === c.key ? C.green : C.sub, cursor: 'pointer', fontSize: 12 }}>
                  {c.emoji} {c.key}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Jollof TV / Soro Soke Link (optional)</div>
            <input value={sLink} onChange={e => setSLink(e.target.value)} placeholder="https://..."
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Describe your performance *</div>
            <textarea value={sDesc} onChange={e => setSDesc(e.target.value)} placeholder="Tell the village what you're bringing to the stage..."
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, minHeight: 80, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={submitPerformance} style={{ width: '100%', padding: 12, background: C.green, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            🎭 Submit to Village Stage
          </button>
          <div style={{ marginTop: 10, padding: 10, background: '#1a1000', border: `1px solid ${C.gold}33`, borderRadius: 8, fontSize: 12, color: C.sub }}>
            Reach {PROMOTE_THRESHOLD} votes and earn the <span style={{ color: C.gold, fontWeight: 700 }}>🌟 Jollof TV</span> badge. Top weekly performer wins <span style={{ color: C.gold, fontWeight: 700 }}>₡500</span> from Village Treasury!
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {tab === 'leaderboard' && (
        <div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>Top 5 by votes this week</div>
          {top5.map((p, i) => (
            <div key={p.id} style={{ background: C.card, border: `1px solid ${i === 0 ? C.gold : C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: i === 0 ? C.gold : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : C.sub, minWidth: 28 }}>#{i + 1}</div>
              <div style={{ fontSize: 24 }}>{catEmoji(p.category)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.title} {p.promoted && '🌟'}</div>
                <div style={{ fontSize: 11, color: C.sub }}>@{p.performer}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: i === 0 ? C.gold : C.green }}>⭐ {p.votes}</div>
                <div style={{ fontSize: 10, color: C.sub }}>votes</div>
              </div>
            </div>
          ))}
          {top5.length > 0 && (
            <div style={{ background: '#1a1000', border: `1px solid ${C.gold}44`, borderRadius: 12, padding: 14, marginTop: 4, textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>🏆</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{top5[0].title}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Leading the village this week</div>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 15, marginTop: 6 }}>Potential prize: ₡500</div>
            </div>
          )}
        </div>
      )}

      {/* JUDGES */}
      {tab === 'judges' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {JUDGES.map((j, i) => (
              <button key={j.title} onClick={() => setSelectedJudge(i)}
                style={{ flex: 1, padding: '10px 6px', border: `1px solid ${selectedJudge === i ? C.gold : C.border}`, borderRadius: 10, background: selectedJudge === i ? '#1a1000' : C.card, color: selectedJudge === i ? C.gold : C.sub, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{j.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{j.title}</div>
              </button>
            ))}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{JUDGES[selectedJudge].emoji} Leave a Judge's Remark</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Select Performance</div>
              <select value={judgeTarget} onChange={e => setJudgeTarget(e.target.value)}
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13 }}>
                <option value="">-- Choose a performance --</option>
                {perfs.map(p => <option key={p.id} value={p.id}>{p.title} (@{p.performer})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <textarea value={judgeRemarkInput} onChange={e => setJudgeRemarkInput(e.target.value)} placeholder="Write your official judge's remarks..."
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, minHeight: 70, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={addJudgeRemark} style={{ width: '100%', padding: 10, background: C.gold, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {JUDGES[selectedJudge].emoji} Submit Judge's Remark
            </button>
          </div>

          <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 8 }}>ALL JUDGE REMARKS</div>
          {remarks.map((r, i) => {
            const perf = perfs.find(p => p.id === r.perfId)
            return (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{r.judgeEmoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>{r.judgeTitle} Judge</span>
                  {perf && <span style={{ fontSize: 11, color: C.sub }}>on "{perf.title}"</span>}
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>"{r.remark}"</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
