'use client'
import React, { useState, useEffect } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Contributor { afroId: string; role: string; joinedAt: number; weight: number }
interface BoardItem { id: string; type: 'note' | 'link' | 'version' | 'status'; content: string; author: string; ts: number }
interface Project { id: string; title: string; type: string; description: string; maxCollabs: number; contributors: Contributor[]; board: BoardItem[]; status: 'In Progress' | 'Review' | 'Done'; cowriesEarned: number; createdAt: number }
type TabKey = 'board' | 'create' | 'workspace' | 'split'

const STORAGE_KEY = 'co_creation_projects'

const PROJECT_TYPES = [
  { key: 'Music', emoji: '🎵' },
  { key: 'Visual Art', emoji: '🎨' },
  { key: 'Writing', emoji: '✍️' },
  { key: 'Video', emoji: '🎬' },
  { key: 'Podcast', emoji: '🎙️' },
]

const ROLES = ['Vocalist', 'Producer', 'Lyricist', 'Designer', 'Director', 'Editor', 'Writer', 'Illustrator']

const STATUS_COLORS: Record<string, string> = {
  'In Progress': '#3b82f6',
  'Review': '#f59e0b',
  'Done': '#22c55e',
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj1', title: 'Homecoming — EP', type: 'Music', description: 'A 5-track EP celebrating African diaspora identity', maxCollabs: 6,
    contributors: [
      { afroId: 'Amara_Sound', role: 'Producer', joinedAt: Date.now() - 86400000 * 5, weight: 3 },
      { afroId: 'Temi_Vocals', role: 'Vocalist', joinedAt: Date.now() - 86400000 * 4, weight: 3 },
      { afroId: 'Kofi_Lyrics', role: 'Lyricist', joinedAt: Date.now() - 86400000 * 3, weight: 2 },
    ],
    board: [
      { id: 'b1', type: 'note', content: 'Track 1 - "Roots": Highlife opening with kora intro. Lyric draft ready.', author: 'Kofi_Lyrics', ts: Date.now() - 86400000 * 3 },
      { id: 'b2', type: 'version', content: 'Version 2 — Added talking drum section to Track 3. Sounds amazing!', author: 'Amara_Sound', ts: Date.now() - 86400000 * 2 },
      { id: 'b3', type: 'link', content: 'https://drive.google.com/demo-stem-files', author: 'Temi_Vocals', ts: Date.now() - 86400000 * 1 },
      { id: 'b4', type: 'status', content: 'Track 1 & 2 — Done ✓ | Track 3 — In Review | Track 4 & 5 — In Progress', author: 'Amara_Sound', ts: Date.now() - 3600000 },
    ],
    status: 'In Progress', cowriesEarned: 1200, createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'proj2', title: 'Village Portraits Series', type: 'Visual Art', description: 'Digital portrait series of elders from 12 African villages', maxCollabs: 4,
    contributors: [
      { afroId: 'Nkechi_Art', role: 'Illustrator', joinedAt: Date.now() - 86400000 * 7, weight: 4 },
      { afroId: 'Ade_Designer', role: 'Designer', joinedAt: Date.now() - 86400000 * 6, weight: 2 },
    ],
    board: [
      { id: 'bb1', type: 'note', content: 'Reference photos collected from 8 villages so far. Need 4 more.', author: 'Nkechi_Art', ts: Date.now() - 86400000 * 4 },
    ],
    status: 'In Progress', cowriesEarned: 400, createdAt: Date.now() - 86400000 * 7
  },
]

const ITEM_TYPE_ICONS = { note: '📝', link: '🔗', version: '🔄', status: '📊' }
const ITEM_TYPE_LABELS = { note: 'Note / Lyrics', link: 'Reference Link', version: 'Version Note', status: 'Status Update' }

export default function CoCreationStudio({ villageId: _v, roleKey: _r }: ToolProps) {
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

  const [tab, setTab] = useState<TabKey>('board')
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return MOCK_PROJECTS
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : MOCK_PROJECTS } catch { return MOCK_PROJECTS }
  })
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [newItemType, setNewItemType] = useState<'note' | 'link' | 'version' | 'status'>('note')
  const [newItemContent, setNewItemContent] = useState('')
  const [joinRole, setJoinRole] = useState('Vocalist')
  const [copied, setCopied] = useState(false)
  const [cowriesInput, setCowriesInput] = useState('')

  // Create form
  const [cTitle, setCTitle] = useState('')
  const [cType, setCType] = useState('Music')
  const [cDesc, setCDesc] = useState('')
  const [cMax, setCMax] = useState('4')

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  // Keep activeProject in sync
  useEffect(() => {
    if (activeProject) {
      const updated = projects.find(p => p.id === activeProject.id)
      if (updated) setActiveProject(updated)
    }
  }, [projects]) // eslint-disable-line react-hooks/exhaustive-deps

  const createProject = () => {
    if (!cTitle.trim()) return
    const p: Project = {
      id: String(Date.now()), title: cTitle, type: cType, description: cDesc, maxCollabs: parseInt(cMax) || 4,
      contributors: [{ afroId: 'You', role: 'Director', joinedAt: Date.now(), weight: 3 }],
      board: [], status: 'In Progress', cowriesEarned: 0, createdAt: Date.now()
    }
    setProjects(ps => [p, ...ps])
    setCTitle(''); setCDesc('')
    setTab('board')
  }

  const joinProject = (projId: string) => {
    setProjects(ps => ps.map(p => {
      if (p.id !== projId) return p
      if (p.contributors.find(c => c.afroId === 'You')) return p
      if (p.contributors.length >= p.maxCollabs) return p
      return { ...p, contributors: [...p.contributors, { afroId: 'You', role: joinRole, joinedAt: Date.now(), weight: 1 }] }
    }))
  }

  const openWorkspace = (p: Project) => {
    setActiveProject(p)
    setTab('workspace')
  }

  const addBoardItem = () => {
    if (!newItemContent.trim() || !activeProject) return
    const item: BoardItem = { id: String(Date.now()), type: newItemType, content: newItemContent.trim(), author: 'You', ts: Date.now() }
    setProjects(ps => ps.map(p => p.id === activeProject.id ? { ...p, board: [...p.board, item] } : p))
    setNewItemContent('')
  }

  const updateStatus = (projId: string, status: Project['status']) => {
    setProjects(ps => ps.map(p => p.id === projId ? { ...p, status } : p))
  }

  const addCowries = (projId: string) => {
    const amt = parseInt(cowriesInput)
    if (!amt) return
    setProjects(ps => ps.map(p => p.id === projId ? { ...p, cowriesEarned: p.cowriesEarned + amt } : p))
    setCowriesInput('')
  }

  const exportProject = (p: Project) => {
    const text = [
      `=== ${p.title} ===`,
      `Type: ${p.type}`,
      `Description: ${p.description}`,
      `Status: ${p.status}`,
      `Contributors: ${p.contributors.map(c => `${c.afroId} (${c.role})`).join(', ')}`,
      `Cowries Earned: ₡${p.cowriesEarned}`,
      '',
      '--- Board ---',
      ...p.board.map(item => `[${item.type.toUpperCase()}] @${item.author}: ${item.content}`),
    ].join('\n')
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalWeight = (p: Project) => p.contributors.reduce((sum, c) => sum + c.weight, 0)

  const typeEmoji = (type: string) => PROJECT_TYPES.find(t => t.key === type)?.emoji || '🎨'

  const fmtTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'board', label: '🎨 Projects' },
    { key: 'create', label: '➕ Create' },
    { key: 'workspace', label: '🖊️ Studio' },
    { key: 'split', label: '₡ Split' },
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'system-ui,sans-serif', padding: 16, maxWidth: 480 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>🎨 Co-Creation Studio</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Create together, belong to the village</div>
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

      {/* PROJECT BOARD */}
      {tab === 'board' && (
        <div>
          {projects.map(p => (
            <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1, marginRight: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 18 }}>{typeEmoji(p.type)}</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.sub }}>{p.type} · {p.contributors.length}/{p.maxCollabs} contributors</div>
                </div>
                <span style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status], fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>{p.status}</span>
              </div>
              <div style={{ fontSize: 13, color: C.sub, marginBottom: 8, lineHeight: 1.4 }}>{p.description}</div>

              {/* Contributors */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {p.contributors.map(c => (
                  <span key={c.afroId} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 20, padding: '2px 8px', fontSize: 10, color: C.sub }}>
                    {c.afroId} · {c.role}
                  </span>
                ))}
                {p.contributors.length < p.maxCollabs && (
                  <span style={{ background: C.muted, border: `1px dashed ${C.border}`, borderRadius: 20, padding: '2px 8px', fontSize: 10, color: C.sub }}>
                    +{p.maxCollabs - p.contributors.length} open
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {p.contributors.length < p.maxCollabs && !p.contributors.find(c => c.afroId === 'You') && (
                  <button onClick={() => joinProject(p.id)} style={{ flex: 1, padding: '7px 0', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, cursor: 'pointer', fontSize: 12 }}>
                    + Join as {joinRole}
                  </button>
                )}
                <button onClick={() => openWorkspace(p)} style={{ flex: 2, padding: '7px 0', background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  🖊️ Open Studio
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.sub }}>No projects yet. Start creating!</div>}

          {/* Join role selector */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginTop: 4 }}>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 6 }}>JOIN PROJECTS AS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setJoinRole(r)}
                  style={{ padding: '4px 10px', border: `1px solid ${joinRole === r ? C.green : C.border}`, borderRadius: 20, background: joinRole === r ? (dark ? '#0a2a0a' : '#e8fbe8') : C.muted, color: joinRole === r ? C.green : C.sub, cursor: 'pointer', fontSize: 11 }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT */}
      {tab === 'create' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🌱 Start a Collaboration</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Project Title *</div>
            <input value={cTitle} onChange={e => setCTitle(e.target.value)} placeholder="e.g. Our Village Anthem"
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 6 }}>Project Type</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PROJECT_TYPES.map(t => (
                <button key={t.key} onClick={() => setCType(t.key)}
                  style={{ padding: '5px 12px', border: `1px solid ${cType === t.key ? C.green : C.border}`, borderRadius: 20, background: cType === t.key ? (dark ? '#0a2a0a' : '#e8fbe8') : C.muted, color: cType === t.key ? C.green : C.sub, cursor: 'pointer', fontSize: 12 }}>
                  {t.emoji} {t.key}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Description</div>
            <textarea value={cDesc} onChange={e => setCDesc(e.target.value)} placeholder="What is this project about? What's the vision?"
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, minHeight: 70, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>Max Collaborators</div>
            <select value={cMax} onChange={e => setCMax(e.target.value)}
              style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13 }}>
              {[2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} people</option>)}
            </select>
          </div>
          <button onClick={createProject} style={{ width: '100%', padding: 12, background: C.green, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            🎨 Create Project
          </button>
        </div>
      )}

      {/* WORKSPACE */}
      {tab === 'workspace' && (
        <div>
          {!activeProject ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.sub }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🖊️</div>
              <div>Open a project from the Projects tab</div>
            </div>
          ) : (
            <>
              {/* Project header */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{typeEmoji(activeProject.type)} {activeProject.title}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{activeProject.type} · {activeProject.contributors.length} contributors</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['In Progress', 'Review', 'Done'] as const).map(s => (
                      <button key={s} onClick={() => updateStatus(activeProject.id, s)}
                        style={{ padding: '4px 8px', border: `1px solid ${activeProject.status === s ? STATUS_COLORS[s] : C.border}`, borderRadius: 6, background: activeProject.status === s ? STATUS_COLORS[s] + '22' : C.muted, color: activeProject.status === s ? STATUS_COLORS[s] : C.sub, cursor: 'pointer', fontSize: 10, fontWeight: activeProject.status === s ? 700 : 400 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add to board */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 8 }}>ADD TO BOARD</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {(['note', 'link', 'version', 'status'] as const).map(type => (
                    <button key={type} onClick={() => setNewItemType(type)}
                      style={{ flex: 1, padding: '5px 2px', border: `1px solid ${newItemType === type ? C.green : C.border}`, borderRadius: 7, background: newItemType === type ? (dark ? '#0a2a0a' : '#e8fbe8') : C.muted, color: newItemType === type ? C.green : C.sub, cursor: 'pointer', fontSize: 11 }}>
                      {ITEM_TYPE_ICONS[type]}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>{ITEM_TYPE_ICONS[newItemType]} {ITEM_TYPE_LABELS[newItemType]}</div>
                <textarea value={newItemContent} onChange={e => setNewItemContent(e.target.value)} placeholder={`Add a ${ITEM_TYPE_LABELS[newItemType].toLowerCase()}...`}
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 10px', color: C.text, fontSize: 13, minHeight: 60, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
                <button onClick={addBoardItem} style={{ width: '100%', padding: 9, background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  + Add to Board
                </button>
              </div>

              {/* Board items */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.sub, fontWeight: 700 }}>CONTRIBUTION LOG ({activeProject.board.length})</div>
                {activeProject.board.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: C.sub, fontSize: 13 }}>No contributions yet. Be the first!</div>
                )}
                {[...activeProject.board].reverse().map((item, i) => (
                  <div key={item.id} style={{ padding: '12px 14px', borderBottom: i < activeProject.board.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{ITEM_TYPE_ICONS[item.type]}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>@{item.author}</span>
                      <span style={{ fontSize: 10, color: C.sub, marginLeft: 'auto' }}>{fmtTime(item.ts)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{item.content}</div>
                  </div>
                ))}
              </div>

              {/* Export */}
              <button onClick={() => exportProject(activeProject)}
                style={{ width: '100%', padding: 10, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, cursor: 'pointer', fontSize: 13 }}>
                {copied ? '✓ Copied to clipboard!' : '📋 Export Full Project Notes'}
              </button>

              {/* Complete ceremony */}
              {activeProject.status === 'Done' && (
                <div style={{ background: '#1a1000', border: `1px solid ${C.gold}`, borderRadius: 12, padding: 16, marginTop: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 40 }}>🌍</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.gold, marginTop: 8 }}>This Creation Belongs to the Village</div>
                  <div style={{ fontSize: 13, color: C.sub, marginTop: 4, marginBottom: 10 }}>{activeProject.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {activeProject.contributors.map(c => (
                      <span key={c.afroId} style={{ background: C.gold + '22', border: `1px solid ${C.gold}44`, borderRadius: 20, padding: '3px 10px', fontSize: 11, color: C.gold }}>
                        {c.afroId} · {c.role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* COWRIE SPLIT */}
      {tab === 'split' && (
        <div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10 }}>Calculate Cowrie splits for your projects</div>
          {projects.map(p => {
            const tw = totalWeight(p)
            return (
              <div key={p.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{typeEmoji(p.type)} {p.title}</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.sub }}>Cowries earned:</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.gold }}>₡{p.cowriesEarned.toLocaleString()}</span>
                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    <input value={cowriesInput} onChange={e => setCowriesInput(e.target.value)} placeholder="Add ₡" style={{ width: 70, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 8px', color: C.text, fontSize: 12, outline: 'none' }} />
                    <button onClick={() => addCowries(p.id)} style={{ padding: '5px 10px', background: C.gold, border: 'none', borderRadius: 6, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>+</button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 6 }}>SPLIT BY CONTRIBUTION WEIGHT</div>
                {p.contributors.map(c => {
                  const share = tw > 0 ? Math.round((c.weight / tw) * p.cowriesEarned) : 0
                  const pct = tw > 0 ? Math.round((c.weight / tw) * 100) : 0
                  return (
                    <div key={c.afroId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.afroId} <span style={{ color: C.sub, fontWeight: 400 }}>· {c.role}</span></div>
                        <div style={{ height: 4, background: C.muted, borderRadius: 2, marginTop: 3 }}>
                          <div style={{ height: '100%', background: C.green, borderRadius: 2, width: `${pct}%` }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 70 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>₡{share.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: C.sub }}>{pct}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
