'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const red = '#e05a4e'
const orange = '#d4813a'
const blue = '#5b9bd5'

type Priority = 'STANDARD' | 'URGENT' | 'CRITICAL'
type WOStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'

const priorityColor: Record<Priority, string> = { STANDARD: muted, URGENT: gold, CRITICAL: red }
const statusColor: Record<WOStatus, string> = { DRAFT: muted, APPROVED: blue, IN_PROGRESS: gold, REVIEW: orange, COMPLETED: green }

const PIPELINE: WOStatus[] = ['DRAFT', 'APPROVED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']

interface WorkOrderItem {
  id: string
  title: string
  client: string
  status: WOStatus
  progress: number
  deadline: string
  priority: Priority
}

interface Material {
  name: string
  qty: string
}

const ACTIVE_WOS: WorkOrderItem[] = [
  { id: 'WO-2026-012', title: 'Market Stall Renovation', client: 'Ngozi Okonkwo', status: 'IN_PROGRESS', progress: 65, deadline: 'Apr 2', priority: 'URGENT' },
  { id: 'WO-2026-013', title: 'Office Electrical Fit-out', client: 'Chukwu Eze Holdings', status: 'APPROVED', progress: 10, deadline: 'Apr 10', priority: 'STANDARD' },
  { id: 'WO-2026-014', title: 'Borehole Installation', client: 'Fatima Diallo NGO', status: 'REVIEW', progress: 90, deadline: 'Mar 30', priority: 'CRITICAL' },
  { id: 'WO-2026-015', title: 'Roof Waterproofing', client: 'Kwame Asante Arts', status: 'DRAFT', progress: 0, deadline: 'Apr 20', priority: 'STANDARD' },
]

const WORKERS = [
  { initials: 'TK', name: 'Tunde Kelechi' },
  { initials: 'AB', name: 'Amina Bello' },
  { initials: 'EC', name: 'Emeka Chidi' },
  { initials: 'YL', name: 'Yetunde Lawal' },
  { initials: 'KO', name: 'Kofi Owusu' },
]

export default function WorkOrder({ villageId, roleKey }: ToolProps) {
  const [wos, setWos] = useState<WorkOrderItem[]>(ACTIVE_WOS)
  const [showNew, setShowNew] = useState(false)
  const [showAssign, setShowAssign] = useState<string | null>(null)
  const [assigned, setAssigned] = useState<Record<string, Set<string>>>({})

  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [address, setAddress] = useState('')
  const [desc, setDesc] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [priority, setPriority] = useState<Priority>('STANDARD')
  const [materials, setMaterials] = useState<Material[]>([{ name: '', qty: '' }])
  const [cost, setCost] = useState('')

  function addMaterial() {
    setMaterials(m => [...m, { name: '', qty: '' }])
  }

  function updateMaterial(i: number, field: keyof Material, val: string) {
    setMaterials(m => m.map((mat, idx) => idx === i ? { ...mat, [field]: val } : mat))
  }

  function removeMaterial(i: number) {
    setMaterials(m => m.filter((_, idx) => idx !== i))
  }

  function createWO() {
    if (!title || !client) return
    const wo: WorkOrderItem = {
      id: 'WO-2026-0' + (16 + wos.length),
      title, client, status: 'DRAFT', progress: 0,
      deadline: endDate || 'TBD', priority,
    }
    setWos(prev => [wo, ...prev])
    setShowNew(false)
    setTitle(''); setClient(''); setAddress(''); setDesc(''); setStartDate(''); setEndDate(''); setCost(''); setMaterials([{ name: '', qty: '' }])
  }

  function toggleWorker(woId: string, workerName: string) {
    setAssigned(prev => {
      const current = new Set(prev[woId] || [])
      if (current.has(workerName)) current.delete(workerName)
      else current.add(workerName)
      return { ...prev, [woId]: current }
    })
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>WORK ORDERS</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Job Management</div>

      {/* Pipeline strip */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>Status Pipeline</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {PIPELINE.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 9, color: statusColor[s], fontWeight: 700 }}>{s.replace('_', ' ')}</div>
              </div>
              {i < PIPELINE.length - 1 && <div style={{ fontSize: 12, color: border }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Work order cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {wos.map(wo => (
          <div key={wo.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 11, color: muted }}>{wo.id}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{wo.title}</div>
                <div style={{ fontSize: 12, color: muted }}>{wo.client}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: priorityColor[wo.priority], background: priorityColor[wo.priority] + '22', borderRadius: 6, padding: '2px 8px' }}>{wo.priority}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: statusColor[wo.status] }}>{wo.status.replace('_', ' ')}</div>
              </div>
            </div>

            {/* Progress bar */}
            {wo.progress > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11, color: muted }}>
                  <span>Progress</span>
                  <span style={{ color: text }}>{wo.progress}%</span>
                </div>
                <div style={{ background: border, borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${wo.progress}%`, height: '100%', background: statusColor[wo.status], borderRadius: 4 }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: muted }}>📅 Due: {wo.deadline}</div>
              <button
                onClick={() => setShowAssign(wo.id)}
                style={{ border: `1px solid ${border}`, background: 'transparent', color: muted, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
              >
                {assigned[wo.id]?.size ? `👥 ${assigned[wo.id].size} assigned` : 'Assign Team'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowNew(true)} style={{ width: '100%', background: green, color: '#000', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        + New Work Order
      </button>

      {/* Assign team modal */}
      {showAssign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Assign Team</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {WORKERS.map(w => {
                const sel = assigned[showAssign]?.has(w.name)
                return (
                  <div
                    key={w.name}
                    onClick={() => toggleWorker(showAssign, w.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      border: `1px solid ${sel ? green : border}`,
                      background: sel ? green + '22' : bg,
                      borderRadius: 20, cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4caf7d,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>{w.initials}</div>
                    <span style={{ fontSize: 13, color: sel ? green : text }}>{w.name}</span>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowAssign(null)} style={{ width: '100%', padding: 12, border: 'none', borderRadius: 10, background: green, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}

      {/* New WO modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, overflowY: 'auto' }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Work Order</div>
            {[
              { label: 'Job Title', val: title, set: setTitle, ph: 'e.g. Market Stall Renovation' },
              { label: 'Client Name', val: client, set: setClient, ph: 'e.g. Ngozi Okonkwo' },
              { label: 'Site Address', val: address, set: setAddress, ph: 'e.g. Onitsha Main Market' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>{f.label}</div>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>Work Description</div>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the work to be done..." rows={2} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 14, resize: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>Start Date</div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>End Date</div>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>Priority</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['STANDARD', 'URGENT', 'CRITICAL'] as Priority[]).map(p => (
                  <button key={p} onClick={() => setPriority(p)} style={{ flex: 1, padding: '7px 0', border: `1px solid ${priority === p ? priorityColor[p] : border}`, borderRadius: 8, background: priority === p ? priorityColor[p] + '22' : bg, color: priority === p ? priorityColor[p] : muted, cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>{p}</button>
                ))}
              </div>
            </div>
            {/* Materials */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>Materials</div>
              {materials.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input value={m.name} onChange={e => updateMaterial(i, 'name', e.target.value)} placeholder="Item" style={{ flex: 3, background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '7px 10px', color: text, fontSize: 13 }} />
                  <input value={m.qty} onChange={e => updateMaterial(i, 'qty', e.target.value)} placeholder="Qty" style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '7px 8px', color: text, fontSize: 13 }} />
                  <button onClick={() => removeMaterial(i)} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: 6, color: red, padding: '0 8px', cursor: 'pointer' }}>×</button>
                </div>
              ))}
              <button onClick={addMaterial} style={{ background: 'transparent', border: `1px dashed ${border}`, borderRadius: 6, color: muted, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>+ Add material</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>Estimated Cost (₡)</div>
              <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. 450000" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: 12, border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createWO} style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: green, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Create Work Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
