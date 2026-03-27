'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

interface Task { label: string; done: boolean; assignee: string; due: string }
interface Project { name: string; progress: number; due: string; team: string[]; status: string; tasks: Task[] }

const INITIAL: Project[] = [
  { name: 'Village Market App', progress: 65, due: '2026-04-15', team: ['A', 'B', 'F'], status: 'In Progress', tasks: [
    { label: 'Design mockups', done: true, assignee: 'A', due: '2026-03-20' },
    { label: 'Build product listings', done: true, assignee: 'B', due: '2026-03-28' },
    { label: 'Payment integration', done: false, assignee: 'F', due: '2026-04-05' },
    { label: 'Testing & launch', done: false, assignee: 'A', due: '2026-04-15' },
  ]},
  { name: 'Ajo Circle Tracker', progress: 30, due: '2026-05-01', team: ['K', 'O'], status: 'Planning', tasks: [
    { label: 'Requirements gathering', done: true, assignee: 'K', due: '2026-03-25' },
    { label: 'Wireframes', done: false, assignee: 'O', due: '2026-04-10' },
  ]},
]

export default function ProjectTracker() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL)
  const [expanded, setExpanded] = React.useState<number | null>(0)
  const [showNew, setShowNew] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const toggleTask = (pi: number, ti: number) => {
    setProjects(prev => prev.map((p, i) => i !== pi ? p : {
      ...p,
      tasks: p.tasks.map((t, j) => j !== ti ? t : { ...t, done: !t.done }),
      progress: Math.round(((p.tasks.filter((t, j) => j === ti ? !t.done : t.done).length) / p.tasks.length) * 100),
    }))
  }

  const addProject = () => {
    if (!newName) return
    setProjects(p => [...p, { name: newName, progress: 0, due: '', team: ['U'], status: 'Planning', tasks: [] }])
    setNewName(''); setShowNew(false)
    showToast('✓ Project created')
  }

  const statusColor = (s: string) => s === 'In Progress' ? '#4ade80' : s === 'Planning' ? '#fbbf24' : '#3b82f6'

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {showNew && (
        <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project name..." style={{ width: '100%', background: '#060d07', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addProject} style={{ flex: 1, padding: 10, borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Create</button>
            <button onClick={() => setShowNew(false)} style={{ padding: '10px 14px', borderRadius: 8, background: C.muted, color: C.text, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <button onClick={() => setShowNew(s => !s)} style={{ width: '100%', padding: 11, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', marginBottom: 14 }}>
        + New Project
      </button>

      {projects.map((p, pi) => (
        <div key={pi} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
          <div onClick={() => setExpanded(expanded === pi ? null : pi)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.name}</div>
              <span style={{ fontSize: 9, fontWeight: 700, color: statusColor(p.status), background: `${statusColor(p.status)}18`, border: `1px solid ${statusColor(p.status)}40`, borderRadius: 99, padding: '2px 8px' }}>{p.status}</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,.08)', overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${p.progress}%`, background: 'linear-gradient(90deg,#1a7c3e,#4ade80)', borderRadius: 99, transition: 'width .4s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: -4 }}>
                {p.team.map((m, mi) => (
                  <div key={mi} style={{ width: 22, height: 22, borderRadius: '50%', background: C.green, border: `2px solid #060d07`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', marginLeft: mi > 0 ? -6 : 0 }}>
                    {m}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.sub }}>{p.progress}% · Due {p.due || 'TBD'}</div>
            </div>
          </div>

          {expanded === pi && p.tasks.length > 0 && (
            <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
              {p.tasks.map((task, ti) => (
                <div key={ti} onClick={() => toggleTask(pi, ti)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.done ? C.green : C.border}`, background: task.done ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {task.done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: task.done ? C.sub : C.text, textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</div>
                  <div style={{ fontSize: 9, color: C.sub }}>{task.assignee} · {task.due}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
