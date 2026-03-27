'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5', purple = '#9b59b6'

type ProjectStatus = 'ACTIVE' | 'STAGING' | 'PRODUCTION'

interface Project {
  id: string; name: string; stack: string[]; completion: number; status: ProjectStatus; lastCommit: string; openIssues: number; logs: string[]
}

interface PR { id: number; title: string; status: 'REVIEW' | 'APPROVED' | 'MERGED'; branch: string }

const INIT_PROJECTS: Project[] = [
  { id: 'p1', name: 'Cowrie Payment Gateway', stack: ['Node.js', 'TypeScript', 'PostgreSQL'], completion: 78, status: 'ACTIVE', lastCommit: '14 min ago', openIssues: 3, logs: ['[14:22] Build passed ✓', '[14:20] Tests: 142/145 passed', '[13:55] Deploy to staging initiated', '[13:40] PR #47 merged', '[12:00] Linter warnings resolved'] },
  { id: 'p2', name: 'Village Registry UI', stack: ['React', 'Next.js', 'Tailwind'], completion: 95, status: 'STAGING', lastCommit: '2 hours ago', openIssues: 1, logs: ['[12:10] QA approved', '[11:45] Performance audit: 94/100', '[10:30] a11y issues fixed', '[09:15] Mobile responsiveness done', '[08:00] Review comments addressed'] },
  { id: 'p3', name: 'Griot AI Inference Engine', stack: ['Python', 'FastAPI', 'PyTorch'], completion: 62, status: 'ACTIVE', lastCommit: '1 hour ago', openIssues: 7, logs: ['[13:30] Model fine-tuning epoch 12/20', '[12:45] VRAM OOM fixed', '[11:00] Yoruba tokeniser added', '[10:15] Benchmarks: 340ms avg', '[09:00] Data pipeline fixed'] },
]

const INIT_PRS: PR[] = [
  { id: 47, title: 'feat: Add USSD fallback for Cowrie payments', status: 'APPROVED', branch: 'feat/ussd-cowrie' },
  { id: 48, title: 'fix: Village ID collision on concurrent create', status: 'REVIEW', branch: 'fix/village-id-race' },
]

const DEPLOYMENTS = [
  { project: 'Cowrie Payment Gateway', env: 'staging', version: 'v2.4.1', uptime: '99.7%' },
  { project: 'Village Registry UI', env: 'staging', version: 'v1.8.0', uptime: '100%' },
  { project: 'Griot AI Inference Engine', env: 'dev', version: 'v0.6.0-beta', uptime: '94.2%' },
]

const statusColor: Record<ProjectStatus, string> = { ACTIVE: green, STAGING: gold, PRODUCTION: blue }
const prStatusColor = { REVIEW: amber, APPROVED: green, MERGED: purple }

export default function CodeProject({ villageId, roleKey }: ToolProps) {
  const [projects] = useState<Project[]>(INIT_PROJECTS)
  const [prs, setPRs] = useState<PR[]>(INIT_PRS)
  const [logsId, setLogsId] = useState<string | null>(null)
  const [commitProject, setCommitProject] = useState(INIT_PROJECTS[0].id)
  const [commitMsg, setCommitMsg] = useState('')
  const [branch, setBranch] = useState('main')
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const quickCommit = () => {
    if (!commitMsg.trim()) return
    flash(`Committed: "${commitMsg}" → ${branch}`)
    setCommitMsg('')
  }

  const mergePR = (id: number) => {
    setPRs(prev => prev.map(p => p.id === id ? { ...p, status: 'MERGED' } : p))
    flash(`PR #${id} merged successfully`)
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Code Projects</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>Developer workspace — Tunde Olu Dev Studio</div>

      {/* Projects */}
      {projects.map(p => (
        <div key={p.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: muted }}>Last commit {p.lastCommit} · {p.openIssues} open issues</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[p.status], background: statusColor[p.status] + '22', padding: '3px 8px', borderRadius: 8 }}>{p.status}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {p.stack.map(s => <span key={s} style={{ fontSize: 10, background: '#1e3a20', border: `1px solid ${border}`, borderRadius: 10, padding: '2px 7px', color: muted }}>{s}</span>)}
          </div>

          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
              <span style={{ color: muted }}>Completion</span>
              <span style={{ color: gold }}>{p.completion}%</span>
            </div>
            <div style={{ height: 5, background: '#1a3a20', borderRadius: 3 }}>
              <div style={{ width: `${p.completion}%`, height: '100%', background: green, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>

          <button onClick={() => setLogsId(logsId === p.id ? null : p.id)} style={{ ...btn(muted), background: 'none', border: `1px solid ${border}`, color: muted, fontSize: 11 }}>
            {logsId === p.id ? 'Hide Logs' : 'View Logs'}
          </button>

          {logsId === p.id && (
            <div style={{ marginTop: 8, background: '#050c06', borderRadius: 8, padding: '8px 10px', fontFamily: 'monospace', fontSize: 11, color: green }}>
              {p.logs.map((l, i) => <div key={i} style={{ marginBottom: 2, color: i === 0 ? green : muted }}>{l}</div>)}
            </div>
          )}
        </div>
      ))}

      {/* Quick commit */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Commit</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8, marginBottom: 8 }}>
          <select value={commitProject} onChange={e => setCommitProject(e.target.value)} style={inp}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={branch} onChange={e => setBranch(e.target.value)} style={inp}>
            <option value="main">main</option>
            <option value="dev">dev</option>
            <option value="feat/new">feat/new</option>
          </select>
          <input placeholder="Commit message..." value={commitMsg} onChange={e => setCommitMsg(e.target.value)} style={{ ...inp, gridColumn: 'span 2' }} />
        </div>
        <button onClick={quickCommit} style={btn(green)}>💾 Commit</button>
      </div>

      {/* PRs */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Active Pull Requests</div>
        {prs.map(pr => (
          <div key={pr.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${border}` }}>
            <span style={{ fontSize: 11, color: muted, fontFamily: 'monospace' }}>#{pr.id}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{pr.title}</div>
              <div style={{ fontSize: 10, color: muted }}>{pr.branch}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: (prStatusColor as any)[pr.status], background: (prStatusColor as any)[pr.status] + '22', padding: '2px 7px', borderRadius: 8 }}>{pr.status}</span>
            {pr.status === 'APPROVED' && <button onClick={() => mergePR(pr.id)} style={btn(purple)}>Merge</button>}
          </div>
        ))}
      </div>

      {/* Deployments */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Deployments</div>
        {DEPLOYMENTS.map(d => (
          <div key={d.project} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: `1px solid ${border}` }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{d.project}</div>
              <div style={{ fontSize: 10, color: muted }}>{d.env} · {d.version}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: Number(d.uptime.replace('%', '')) >= 99 ? green : amber }}>{d.uptime} uptime</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
