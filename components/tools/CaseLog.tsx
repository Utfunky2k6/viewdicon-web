'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
type CaseType = 'CIVIL' | 'CRIMINAL' | 'FAMILY' | 'COMMERCIAL'
type CaseStatus = 'OPEN' | 'IN_HEARING' | 'CLOSED'
interface Case { id: string; client: string; caseNo: string; type: CaseType; status: CaseStatus; nextHearing: string; opposing: string; hoursBilled: number; totalFees: number; paid: number }
interface TimelineEvent { date: string; event: string }
type FilterTab = 'ALL' | 'ACTIVE' | 'HEARING' | 'CLOSED'

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', AM = '#e65100', RD = '#c62828'

const CASES: Case[] = [
  { id: 'c1', client: 'Adaeze Nwosu-Okorie',   caseNo: 'CASE-2026-001', type: 'COMMERCIAL', status: 'IN_HEARING', nextHearing: '2026-04-03', opposing: 'Lagos Supplies Ltd',     hoursBilled: 24, totalFees: 480000, paid: 320000 },
  { id: 'c2', client: 'Elder Adewale Fashola',  caseNo: 'CASE-2026-002', type: 'FAMILY',     status: 'OPEN',       nextHearing: '2026-04-15', opposing: 'Estate of I. Fashola',   hoursBilled: 8,  totalFees: 160000, paid: 80000  },
  { id: 'c3', client: 'Kwame Asante Boateng',   caseNo: 'CASE-2026-003', type: 'CIVIL',      status: 'IN_HEARING', nextHearing: '2026-04-08', opposing: 'Asante Property Dev.',  hoursBilled: 18, totalFees: 360000, paid: 360000 },
  { id: 'c4', client: 'Amina Bello Enterprises', caseNo: 'CASE-2025-089', type: 'COMMERCIAL', status: 'CLOSED',    nextHearing: '—',          opposing: 'FG Tax Authority',       hoursBilled: 40, totalFees: 800000, paid: 800000 },
  { id: 'c5', client: 'Fatima Usman-Aliyu',      caseNo: 'CASE-2025-094', type: 'CRIMINAL',   status: 'CLOSED',   nextHearing: '—',          opposing: 'State Prosecutor',       hoursBilled: 32, totalFees: 640000, paid: 640000 },
]

const TIMELINES: Record<string, TimelineEvent[]> = {
  c1: [
    { date: '2026-01-14', event: 'Case filed at Lagos High Court — Commercial Division' },
    { date: '2026-02-08', event: 'First mention — court granted extension for respondent' },
    { date: '2026-03-05', event: 'First hearing — claimant\'s counsel presented pleadings' },
    { date: '2026-04-03', event: 'Second hearing scheduled — cross-examination of respondent' },
  ],
  c2: [
    { date: '2026-02-20', event: 'Probate petition filed at Federal High Court' },
    { date: '2026-03-11', event: 'Objection filed by opposing party' },
    { date: '2026-04-15', event: 'First hearing scheduled' },
  ],
  c3: [
    { date: '2026-01-30', event: 'Writ of summons issued' },
    { date: '2026-02-24', event: 'Settlement conference — failed, proceeding to hearing' },
    { date: '2026-03-18', event: 'First hearing — witness testimonies commenced' },
    { date: '2026-04-08', event: 'Second hearing — continuation of testimonies' },
  ],
}

const typeColor = (t: CaseType) => ({ CIVIL: '#1565c0', CRIMINAL: RD, FAMILY: '#6a1c8a', COMMERCIAL: GR }[t])
const statusColor = (s: CaseStatus) => s === 'IN_HEARING' ? AM : s === 'OPEN' ? '#1565c0' : MT

export default function CaseLog({ villageId: _v, roleKey: _r }: ToolProps) {
  const [filter, setFilter] = useState<FilterTab>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>('c1')
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ client: '', type: 'CIVIL' as CaseType, description: '' })
  const [created, setCreated] = useState(false)

  const filtered = CASES.filter(c => {
    if (filter === 'ALL') return true
    if (filter === 'ACTIVE') return c.status !== 'CLOSED'
    if (filter === 'HEARING') return c.status === 'IN_HEARING'
    if (filter === 'CLOSED') return c.status === 'CLOSED'
    return true
  })

  const selectedCase = CASES.find(c => c.id === selectedId)
  const timeline = selectedId ? TIMELINES[selectedId] ?? [] : []

  const createCase = () => {
    if (!newForm.client) return
    setCreated(true)
    setTimeout(() => { setCreated(false); setShowNew(false) }, 2000)
  }

  const FILTER_TABS: FilterTab[] = ['ALL', 'ACTIVE', 'HEARING', 'CLOSED']

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>⚖️ Case Log</h2>
        <button onClick={() => setShowNew(v => !v)} style={{ padding: '7px 14px', background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
          {showNew ? '✕' : '+ New Case'}
        </button>
      </div>

      {/* New Case Form */}
      {showNew && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          {created
            ? <div style={{ textAlign: 'center', padding: 14, color: '#a5d6a7' }}>✅ Case created!</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>CLIENT NAME</div>
                  <input value={newForm.client} onChange={e => setNewForm(f => ({ ...f, client: e.target.value }))} placeholder="Client full name"
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>CASE TYPE</div>
                  <select value={newForm.type} onChange={e => setNewForm(f => ({ ...f, type: e.target.value as CaseType }))}
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }}>
                    {(['CIVIL', 'CRIMINAL', 'FAMILY', 'COMMERCIAL'] as CaseType[]).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>CASE DESCRIPTION</div>
                  <textarea value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    placeholder="Describe parties, dispute, and relevant background..."
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: 9, color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div style={{ padding: 10, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 12, color: MT }}>
                  📎 Evidence upload placeholder — attach files in full version
                </div>
                <button onClick={createCase} style={{ padding: 10, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Open Case File
                </button>
              </div>
            )
          }
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{ flex: 1, padding: '7px 4px', border: `1px solid ${filter === tab ? GR : BD}`, borderRadius: 8, background: filter === tab ? '#0a2a0a' : CARD, color: filter === tab ? '#a5d6a7' : MT, cursor: 'pointer', fontSize: 11, fontWeight: filter === tab ? 700 : 400 }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Case List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {filtered.map(c => (
          <div
            key={c.id}
            onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
            style={{ background: CARD, border: `1px solid ${selectedId === c.id ? GR : BD}`, borderRadius: 12, padding: 13, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 10, background: typeColor(c.type), color: '#fff', padding: '1px 7px', borderRadius: 8, fontWeight: 700, marginRight: 6 }}>{c.type}</span>
                <span style={{ fontSize: 12, color: MT }}>{c.caseNo}</span>
              </div>
              <span style={{ fontSize: 10, background: statusColor(c.status), color: '#fff', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>{c.status.replace('_', ' ')}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{c.client}</div>
            <div style={{ fontSize: 12, color: MT }}>vs {c.opposing}</div>
            {c.status !== 'CLOSED' && <div style={{ fontSize: 11, color: AM, marginTop: 4 }}>Next hearing: {c.nextHearing}</div>}
          </div>
        ))}
      </div>

      {/* Selected Case Detail */}
      {selectedCase && (
        <>
          {/* Timeline */}
          {timeline.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 12 }}>CASE TIMELINE — {selectedCase.caseNo}</div>
              {timeline.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === timeline.length - 1 ? AM : GR, flexShrink: 0 }} />
                    {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: BD, marginTop: 3, minHeight: 20 }} />}
                  </div>
                  <div style={{ paddingBottom: 6 }}>
                    <div style={{ fontSize: 11, color: MT }}>{ev.date}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{ev.event}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Billing */}
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>BILLING — {selectedCase.client}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Hours Billed', `${selectedCase.hoursBilled}h`], ['Total Fees', `₡${selectedCase.totalFees.toLocaleString()}`], ['Paid', `₡${selectedCase.paid.toLocaleString()}`], ['Outstanding', `₡${(selectedCase.totalFees - selectedCase.paid).toLocaleString()}`]].map(([label, value]) => (
                <div key={label} style={{ background: '#050e06', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: label === 'Outstanding' && selectedCase.totalFees > selectedCase.paid ? '#ef9a9a' : '#a5d6a7' }}>{value}</div>
                  <div style={{ fontSize: 10, color: MT, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
