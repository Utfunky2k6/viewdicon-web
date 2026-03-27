'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
type AppStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEW' | 'AWARDED' | 'REJECTED'
interface GrantOpportunity { id: string; funder: string; amount: string; deadline: string; tags: string[] }
interface Application { id: string; grant: string; funder: string; requested: number; status: AppStatus; deadline: string; notes: string }
interface AwardedGrant { name: string; funder: string; amount: number; year: number }
interface Milestone { id: string; grantId: string; name: string; dueDate: string; submitted: boolean }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', AM = '#e65100', RD = '#c62828'

const OPPORTUNITIES: GrantOpportunity[] = [
  { id: 'g1', funder: 'Tony Elumelu Foundation', amount: '₡500K – ₡1.2M', deadline: '2026-04-30', tags: ['Agriculture', 'SME', 'Youth'] },
  { id: 'g2', funder: 'AfDB Women Fund',          amount: '₡800K – ₡3M',  deadline: '2026-05-15', tags: ['Women', 'Business', 'Health'] },
  { id: 'g3', funder: 'USAID West Africa',         amount: '₡2M – ₡8M',   deadline: '2026-06-01', tags: ['Community', 'Education', 'Tech'] },
]

const INIT_APPS: Application[] = [
  { id: 'a1', grant: 'Tony Elumelu Foundation Grant', funder: 'Tony Elumelu Foundation', requested: 900000, status: 'REVIEW',     deadline: '2026-04-30', notes: 'Shortlisted — interview scheduled Apr 8' },
  { id: 'a2', grant: 'NDDC Rural Development Fund',   funder: 'NDDC',                   requested: 1500000, status: 'SUBMITTED', deadline: '2026-04-10', notes: 'Submitted Mar 12, awaiting acknowledgement' },
]

const AWARDED: AwardedGrant[] = [
  { name: 'NASS Community Grant',      funder: 'National Assembly',     amount: 800000,  year: 2026 },
  { name: 'State Skills Upgrade Fund', funder: 'State Government',      amount: 600000,  year: 2025 },
  { name: 'CBN SME Boost',             funder: 'Central Bank Nigeria',  amount: 1000000, year: 2025 },
]

const INIT_MILESTONES: Milestone[] = [
  { id: 'm1', grantId: 'NASS', name: 'Community needs assessment report', dueDate: '2026-04-01', submitted: true  },
  { id: 'm2', grantId: 'NASS', name: 'Quarterly beneficiary count update',  dueDate: '2026-04-15', submitted: false },
  { id: 'm3', grantId: 'CBN',  name: 'Business registration verification', dueDate: '2026-04-20', submitted: false },
]

const statusColor = (s: AppStatus) => {
  const map: Record<AppStatus, string> = { DRAFT: MT, SUBMITTED: '#1565c0', REVIEW: AM, AWARDED: GR, REJECTED: RD }
  return map[s]
}

export default function GrantTracker({ villageId: _v, roleKey: _r }: ToolProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(INIT_MILESTONES)
  const [applications, setApplications] = useState<Application[]>(INIT_APPS)
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'awarded'>('available')

  const totalAwarded = AWARDED.reduce((s, g) => s + g.amount, 0)

  const toggleMilestone = (id: string) =>
    setMilestones(ms => ms.map(m => m.id === id ? { ...m, submitted: !m.submitted } : m))

  const applyFor = (opp: GrantOpportunity) => {
    const exists = applications.find(a => a.grant.includes(opp.funder))
    if (exists) return
    setApplications(apps => [...apps, {
      id: `app${Date.now()}`,
      grant: `${opp.funder} Grant`,
      funder: opp.funder,
      requested: 500000,
      status: 'DRAFT',
      deadline: opp.deadline,
      notes: 'Draft created — complete and submit before deadline',
    }])
    setActiveTab('active')
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>💰 Grant Tracker</h2>
      <div style={{ fontSize: 13, color: MT, marginBottom: 18 }}>Total received this year: <span style={{ color: '#a5d6a7', fontWeight: 700 }}>₡{totalAwarded.toLocaleString()}</span></div>

      {/* Upcoming Deadline Alert */}
      <div style={{ background: '#2a1500', border: `1px solid ${AM}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>⚠️</span>
        <span style={{ color: '#ffe0b2' }}>NDDC Rural Development Fund report due in <strong>15 days</strong> (Apr 10)</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([['available', 'Available'], ['active', 'Applications'], ['awarded', 'Awarded']] as [typeof activeTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{ flex: 1, padding: '8px', border: `1px solid ${activeTab === key ? GR : BD}`, borderRadius: 8, background: activeTab === key ? '#0a2a0a' : CARD, color: activeTab === key ? '#a5d6a7' : MT, cursor: 'pointer', fontSize: 12, fontWeight: activeTab === key ? 700 : 400 }}
          >{label}</button>
        ))}
      </div>

      {/* Available Grants */}
      {activeTab === 'available' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPPORTUNITIES.map(opp => (
            <div key={opp.id} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{opp.funder}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#a5d6a7', marginLeft: 8, flexShrink: 0 }}>{opp.amount}</div>
              </div>
              <div style={{ fontSize: 12, color: AM, marginBottom: 8 }}>Deadline: {opp.deadline}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                {opp.tags.map(t => (
                  <span key={t} style={{ background: '#1e3a20', color: MT, padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{t}</span>
                ))}
              </div>
              <button
                onClick={() => applyFor(opp)}
                disabled={applications.some(a => a.grant.includes(opp.funder))}
                style={{ width: '100%', padding: 9, background: applications.some(a => a.grant.includes(opp.funder)) ? '#1a2e1b' : GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, cursor: applications.some(a => a.grant.includes(opp.funder)) ? 'default' : 'pointer', fontWeight: 600 }}
              >
                {applications.some(a => a.grant.includes(opp.funder)) ? '✅ Applied' : 'Apply Now →'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Applications */}
      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.map(app => (
            <div key={app.id} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{app.grant}</div>
                <span style={{ background: statusColor(app.status), color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{app.status}</span>
              </div>
              <div style={{ fontSize: 13, color: MT, marginBottom: 4 }}>Requested: <span style={{ color: '#a5d6a7' }}>₡{app.requested.toLocaleString()}</span></div>
              <div style={{ fontSize: 12, color: AM, marginBottom: 6 }}>Deadline: {app.deadline}</div>
              <div style={{ fontSize: 12, color: TX }}>{app.notes}</div>
            </div>
          ))}
        </div>
      )}

      {/* Awarded */}
      {activeTab === 'awarded' && (
        <>
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            {AWARDED.map((a, i) => (
              <div key={i} style={{ padding: '11px 14px', borderBottom: i < AWARDED.length - 1 ? `1px solid ${BD}` : 'none', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: MT }}>{a.funder} · {a.year}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#a5d6a7' }}>₡{a.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>MILESTONE TRACKING</div>
            {milestones.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${BD}` }}>
                <div
                  onClick={() => toggleMilestone(m.id)}
                  style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${m.submitted ? GR : BD}`, background: m.submitted ? GR : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  {m.submitted && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: MT }}>{m.grantId} · Due: {m.dueDate}</div>
                </div>
                <span style={{ fontSize: 11, color: m.submitted ? GR : AM }}>{m.submitted ? 'DONE' : 'PENDING'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
