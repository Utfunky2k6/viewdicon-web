'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5', purple = '#9b59b6'

type Tone = 'BOLD' | 'ELEGANT' | 'MINIMAL' | 'PLAYFUL' | 'TRADITIONAL'
type BudgetRange = '<₡50K' | '₡50K-200K' | '>₡200K'

const DELIVERABLES = ['Logo', 'Brand Guidelines', 'Packaging', 'Social Media Kit', 'Print Materials', 'Web Design', 'Motion Graphics']
const TONES: Tone[] = ['BOLD', 'ELEGANT', 'MINIMAL', 'PLAYFUL', 'TRADITIONAL']
const BUDGETS: BudgetRange[] = ['<₡50K', '₡50K-200K', '>₡200K']

const PALETTE_COLORS = ['#c9a84c', '#4caf7d', '#5b9bd5', '#e07b39', '#9b59b6', '#c0392b', '#2ecc71', '#1abc9c', '#f39c12', '#e74c3c', '#3498db', '#8e44ad']

interface Milestone { label: string; date: string }

export default function DesignBrief({ villageId, roleKey }: ToolProps) {
  const [client, setClient] = useState({ name: '', company: '', contact: '' })
  const [project, setProject] = useState({ name: '', objective: '', audience: '', message: '' })
  const [tone, setTone] = useState<Tone>('BOLD')
  const [deliverables, setDeliverables] = useState<string[]>(['Logo', 'Brand Guidelines'])
  const [moodboard, setMoodboard] = useState<string[]>(['#c9a84c', '#4caf7d', '#060d07', '#f0f7f0', '#1e3a20', '#9b59b6'])
  const [budget, setBudget] = useState<BudgetRange>('₡50K-200K')
  const [startDate, setStartDate] = useState('2026-04-01')
  const [milestones, setMilestones] = useState<Milestone[]>([
    { label: 'Concept Presentation', date: '2026-04-15' },
    { label: 'Client Revisions Due', date: '2026-04-22' },
    { label: 'Final Delivery', date: '2026-05-01' },
  ])
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const toggleDeliverable = (d: string) => setDeliverables(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  const swapColor = (idx: number) => {
    const available = PALETTE_COLORS.filter(c => !moodboard.includes(c))
    if (!available.length) return
    const newColor = available[Math.floor(Math.random() * available.length)]
    setMoodboard(prev => prev.map((c, i) => i === idx ? newColor : c))
  }
  const addMilestone = () => setMilestones(prev => [...prev, { label: '', date: '' }])
  const removeMilestone = (i: number) => setMilestones(prev => prev.filter((_, idx) => idx !== i))
  const updateMilestone = (i: number, field: keyof Milestone, val: string) => setMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Design Brief Builder</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 16 }}>Creative project brief — Adire Creative Studio</div>

      {/* Client details */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>CLIENT DETAILS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="Client name" value={client.name} onChange={e => setClient(c => ({ ...c, name: e.target.value }))} style={inp} />
          <input placeholder="Company / Brand" value={client.company} onChange={e => setClient(c => ({ ...c, company: e.target.value }))} style={inp} />
          <input placeholder="Contact (phone/email)" value={client.contact} onChange={e => setClient(c => ({ ...c, contact: e.target.value }))} style={{ ...inp, gridColumn: 'span 2' }} />
        </div>
      </div>

      {/* Project brief */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>PROJECT BRIEF</div>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Project name" value={project.name} onChange={e => setProject(p => ({ ...p, name: e.target.value }))} style={inp} />
          <textarea placeholder="Project objective..." value={project.objective} onChange={e => setProject(p => ({ ...p, objective: e.target.value }))} style={{ ...inp, minHeight: 70, resize: 'none' }} />
          <input placeholder="Target audience" value={project.audience} onChange={e => setProject(p => ({ ...p, audience: e.target.value }))} style={inp} />
          <input placeholder="Key message" value={project.message} onChange={e => setProject(p => ({ ...p, message: e.target.value }))} style={inp} />
        </div>
      </div>

      {/* Tone */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>TONE & STYLE</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TONES.map(t => (
            <button key={t} onClick={() => setTone(t)} style={{ padding: '6px 14px', borderRadius: 20, border: `2px solid ${tone === t ? gold : border}`, background: tone === t ? gold + '22' : 'none', color: tone === t ? gold : muted, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Deliverables */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>DELIVERABLES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {DELIVERABLES.map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => toggleDeliverable(d)}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${deliverables.includes(d) ? green : border}`, background: deliverables.includes(d) ? green : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {deliverables.includes(d) && <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: deliverables.includes(d) ? text : muted }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood board */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>MOOD BOARD (tap to change colour)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {moodboard.map((color, i) => (
            <div key={i} onClick={() => swapColor(i)}
              style={{ height: 48, borderRadius: 8, background: color, cursor: 'pointer', border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>BUDGET RANGE</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {BUDGETS.map(b => (
            <button key={b} onClick={() => setBudget(b)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `2px solid ${budget === b ? gold : border}`, background: budget === b ? gold + '22' : 'none', color: budget === b ? gold : muted, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>TIMELINE</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: muted }}>Start:</span>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inp, width: 160 }} />
        </div>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <input placeholder="Milestone" value={m.label} onChange={e => updateMilestone(i, 'label', e.target.value)} style={{ ...inp, flex: 1 }} />
            <input type="date" value={m.date} onChange={e => updateMilestone(i, 'date', e.target.value)} style={{ ...inp, width: 150 }} />
            <button onClick={() => removeMilestone(i)} style={{ background: red + '22', border: `1px solid ${red}`, borderRadius: 4, color: red, cursor: 'pointer', padding: '0 6px' }}>✕</button>
          </div>
        ))}
        <button onClick={addMilestone} style={{ background: 'none', border: `1px dashed ${border}`, borderRadius: 6, padding: '4px 12px', color: muted, cursor: 'pointer', fontSize: 11 }}>+ Add Milestone</button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => flash('Brief PDF generated — ready to download')} style={{ ...btn(gold), flex: 1 }}>📄 Generate PDF</button>
        <button onClick={() => flash(`Brief sent to ${client.name || 'client'} via Seso`)} style={{ ...btn(blue), flex: 1 }}>📨 Send to Client</button>
      </div>
    </div>
  )
}
