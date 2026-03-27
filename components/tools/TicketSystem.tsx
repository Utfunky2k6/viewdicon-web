'use client'
import React, { useState, useMemo } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
type Priority = 'P1' | 'P2' | 'P3'
type Category = 'BUG' | 'FEATURE' | 'SUPPORT'

interface Ticket {
  id: string; title: string; priority: Priority; category: Category; assignee: string; createdAt: string; tags: string[]; status: TicketStatus; description: string; slaHours: number; comment?: string
}

const INIT_TICKETS: Ticket[] = [
  { id: 'TKT-2026-001', title: 'Cowrie payment fails on USSD bridge', priority: 'P1', category: 'BUG', assignee: 'Tunde Olu', createdAt: '2026-03-26 08:15', tags: ['payment', 'ussd', 'critical'], status: 'IN_PROGRESS', description: 'Users on 2G networks receive error code 504 when initiating Cowrie payment via USSD.', slaHours: 4, comment: '' },
  { id: 'TKT-2026-002', title: 'Village feed shows duplicate posts after refresh', priority: 'P2', category: 'BUG', assignee: 'Amaka Osei', createdAt: '2026-03-26 09:30', tags: ['feed', 'frontend'], status: 'OPEN', description: 'Refreshing the soro-soke feed in Chrome 121 causes duplicate post cards.', slaHours: 8, comment: '' },
  { id: 'TKT-2026-003', title: 'Add bulk invite to Ajo Circle', priority: 'P2', category: 'FEATURE', assignee: 'Ibrahim Lawal', createdAt: '2026-03-26 10:00', tags: ['ajo', 'feature'], status: 'OPEN', description: 'Allow circle admins to invite up to 50 members at once via CSV upload.', slaHours: 24, comment: '' },
  { id: 'TKT-2026-004', title: 'Griot AI response timeout after 10s', priority: 'P1', category: 'BUG', assignee: 'Tunde Olu', createdAt: '2026-03-26 07:00', tags: ['griot', 'ai', 'performance'], status: 'OPEN', description: 'AI responses time out when model inference exceeds 10 seconds.', slaHours: 4, comment: '' },
  { id: 'TKT-2026-005', title: 'Support: User locked out after OTP expire', priority: 'P3', category: 'SUPPORT', assignee: 'Ngozi Okeke', createdAt: '2026-03-26 11:00', tags: ['auth', 'otp'], status: 'OPEN', description: 'User report: OTP expired but no re-send option shown.', slaHours: 48, comment: '' },
  { id: 'TKT-2026-006', title: 'Implement dark/light theme toggle', priority: 'P3', category: 'FEATURE', assignee: 'Fatima Bello', createdAt: '2026-03-25 14:00', tags: ['ui', 'feature'], status: 'OPEN', description: 'Add a theme switcher to settings page.', slaHours: 72, comment: '' },
  { id: 'TKT-2026-007', title: 'Session summary report empty for new users', priority: 'P2', category: 'BUG', assignee: 'Amaka Osei', createdAt: '2026-03-25 16:00', tags: ['sessions', 'report'], status: 'IN_PROGRESS', description: 'New user accounts show blank session report dashboard.', slaHours: 8, comment: '' },
  { id: 'TKT-2026-008', title: 'Cold chain alert not dispatching SMS', priority: 'P1', category: 'BUG', assignee: 'Ibrahim Lawal', createdAt: '2026-03-26 06:00', tags: ['cold-chain', 'sms'], status: 'OPEN', description: 'Temperature breach alerts not sending SMS to field agents.', slaHours: 2, comment: '' },
]

const priorityColor: Record<Priority, string> = { P1: red, P2: amber, P3: blue }
const statusTabColor: Record<TicketStatus | 'ALL', string> = { ALL: muted, OPEN: amber, IN_PROGRESS: blue, RESOLVED: green }

export default function TicketSystem({ villageId, roleKey }: ToolProps) {
  const [tickets, setTickets] = useState<Ticket[]>(INIT_TICKETS)
  const [tab, setTab] = useState<'ALL' | TicketStatus>('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'P2' as Priority, category: 'BUG' as Category, assignee: '' })
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const filtered = useMemo(() => tab === 'ALL' ? tickets : tickets.filter(t => t.status === tab), [tickets, tab])

  const counts = { OPEN: tickets.filter(t => t.status === 'OPEN').length, IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length, RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length }

  const getSLARemaining = (t: Ticket): number => {
    const created = new Date(t.createdAt).getTime()
    const elapsed = (Date.now() - created) / 3600000
    return Math.max(0, t.slaHours - elapsed)
  }

  const resolve = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t))
    setExpanded(null); flash('Ticket resolved')
  }

  const addComment = (id: string, comment: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, comment } : t))
    flash('Comment added')
  }

  const createTicket = () => {
    if (!form.title) return
    const t: Ticket = { id: `TKT-2026-0${tickets.length + 10}`, ...form, tags: [], status: 'OPEN', createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), slaHours: form.priority === 'P1' ? 4 : form.priority === 'P2' ? 8 : 48, comment: '' }
    setTickets(prev => [...prev, t]); setShowNew(false); setForm({ title: '', description: '', priority: 'P2', category: 'BUG', assignee: '' })
    flash('Ticket created')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })
  const resolutionRate = Math.round((counts.RESOLVED / Math.max(1, tickets.length)) * 100)

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Issue Tracker</div>
          <div style={{ color: muted, fontSize: 12 }}>Viewdicon Engineering — Support Queue</div>
        </div>
        <button onClick={() => setShowNew(s => !s)} style={btn(gold)}>+ New Ticket</button>
      </div>

      {/* Resolution rate */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
          <span style={{ color: muted }}>Resolution Rate (this week)</span>
          <span style={{ color: green, fontWeight: 700 }}>{resolutionRate}%</span>
        </div>
        <div style={{ height: 6, background: '#1a3a20', borderRadius: 3 }}>
          <div style={{ width: `${resolutionRate}%`, height: '100%', background: green, borderRadius: 3 }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 12px', borderRadius: 20, border: `2px solid ${tab === t ? statusTabColor[t] : border}`, background: tab === t ? statusTabColor[t] + '22' : 'none', color: tab === t ? statusTabColor[t] : muted, fontWeight: 700, cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap' }}>
            {t.replace('_', ' ')} {t !== 'ALL' ? `(${counts[t as TicketStatus] || 0})` : `(${tickets.length})`}
          </button>
        ))}
      </div>

      {/* Tickets */}
      {filtered.map(t => {
        const slaLeft = getSLARemaining(t)
        const slaBreached = slaLeft <= 0 && t.status !== 'RESOLVED'
        return (
          <div key={t.id} style={{ background: card, border: `2px solid ${slaBreached ? red + '55' : border}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: muted, marginTop: 2 }}>{t.id} · {t.assignee} · {t.createdAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: priorityColor[t.priority], background: priorityColor[t.priority] + '22', padding: '2px 6px', borderRadius: 6 }}>{t.priority}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusTabColor[t.status], background: statusTabColor[t.status] + '22', padding: '2px 6px', borderRadius: 6 }}>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {t.tags.map(tag => <span key={tag} style={{ fontSize: 9, background: '#1e3a20', borderRadius: 8, padding: '1px 5px', color: muted }}>{tag}</span>)}
                {slaBreached && <span style={{ fontSize: 9, background: red + '22', borderRadius: 8, padding: '1px 5px', color: red, fontWeight: 700 }}>SLA BREACHED</span>}
                {!slaBreached && t.status !== 'RESOLVED' && <span style={{ fontSize: 9, color: slaLeft < 2 ? amber : muted }}>{slaLeft.toFixed(1)}h SLA remaining</span>}
              </div>
            </div>

            {expanded === t.id && (
              <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${border}` }}>
                <div style={{ fontSize: 13, color: muted, padding: '10px 0', lineHeight: 1.5 }}>{t.description}</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: muted, marginBottom: 4, fontWeight: 700 }}>ADD COMMENT</div>
                  <CommentInput defaultVal={t.comment || ''} onSave={c => addComment(t.id, c)} />
                </div>
                {t.status !== 'RESOLVED' && (
                  <button onClick={() => resolve(t.id)} style={btn(green)}>✓ Mark Resolved</button>
                )}
                {t.status === 'RESOLVED' && <span style={{ color: green, fontSize: 12 }}>✓ Resolved</span>}
              </div>
            )}
          </div>
        )
      })}

      {/* New ticket form */}
      {showNew && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginTop: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>New Ticket</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ ...inp, gridColumn: 'span 2' }} />
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} style={inp}>
              <option value="P1">P1 — Critical</option><option value="P2">P2 — High</option><option value="P3">P3 — Normal</option>
            </select>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))} style={inp}>
              <option value="BUG">Bug</option><option value="FEATURE">Feature</option><option value="SUPPORT">Support</option>
            </select>
            <input placeholder="Assign to..." value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} style={inp} />
            <textarea placeholder="Description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inp, gridColumn: 'span 2', minHeight: 60, resize: 'none' }} />
          </div>
          <button onClick={createTicket} style={btn(gold)}>Create Ticket</button>
        </div>
      )}
    </div>
  )
}

function CommentInput({ defaultVal, onSave }: { defaultVal: string; onSave: (c: string) => void }) {
  const [val, setVal] = useState(defaultVal)
  const inp = { background: '#0a1a0c', border: `1px solid #1e3a20`, borderRadius: 6, padding: '6px 10px', color: '#f0f7f0', fontSize: 13, outline: 'none', width: '100%' }
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="Add a comment..." style={{ ...inp, flex: 1, minHeight: 50, resize: 'none' }} />
      <button onClick={() => onSave(val)} style={{ background: '#4caf7d', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12, alignSelf: 'flex-end' }}>Save</button>
    </div>
  )
}
