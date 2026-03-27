'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
type Objective = 'AWARENESS' | 'SALES' | 'ENGAGEMENT' | 'EVENT'
interface Campaign { id: string; name: string; objective: Objective; budgetTotal: number; budgetSpent: number; reach: number; engRate: number; active: boolean }
interface ContentItem { id: string; campaignId: string; platform: string; dateTime: string; preview: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', AM = '#e65100'

const INIT_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Harvest Festival Promo',  objective: 'EVENT',     budgetTotal: 120000, budgetSpent: 74500,  reach: 12847, engRate: 8.4,  active: true  },
  { id: 'c2', name: 'Market Vendor Growth',    objective: 'SALES',     budgetTotal: 80000,  budgetSpent: 62100,  reach: 7430,  engRate: 11.2, active: true  },
]

const INIT_QUEUE: ContentItem[] = [
  { id: 'q1', campaignId: 'c1', platform: 'Sòrò Sókè Feed',  dateTime: 'Today 10:00',   preview: 'Join us at the Harvest Festival! Gates open 8 AM…'     },
  { id: 'q2', campaignId: 'c1', platform: 'Village Notice',   dateTime: 'Today 14:00',   preview: '🌾 3 days left to the biggest harvest celebration…'      },
  { id: 'q3', campaignId: 'c2', platform: 'Sòrò Sókè Feed',  dateTime: 'Tomorrow 09:00', preview: 'Expand your market stall! Limited registration slots…'  },
  { id: 'q4', campaignId: 'c2', platform: 'Community Alert',  dateTime: 'Fri 08:00',      preview: '📣 Market vendor training programme — register now'     },
]

const OBJ_COLORS: Record<Objective, string> = { AWARENESS: '#1565c0', SALES: GR, ENGAGEMENT: '#6a1c8a', EVENT: AM }

export default function CampaignManager({ villageId: _v, roleKey: _r }: ToolProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INIT_CAMPAIGNS)
  const [queue] = useState<ContentItem[]>(INIT_QUEUE)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', objective: 'AWARENESS' as Objective, budget: '', startDate: '', endDate: '', village: _v ?? '', role: _r ?? '' })
  const [saved, setSaved] = useState(false)

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const saveCampaign = () => {
    if (!form.name) return
    const c: Campaign = {
      id: `c${Date.now()}`,
      name: form.name,
      objective: form.objective,
      budgetTotal: parseFloat(form.budget) || 50000,
      budgetSpent: 0,
      reach: 0,
      engRate: 0,
      active: true,
    }
    setCampaigns(cs => [...cs, c])
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowForm(false) }, 2000)
  }

  const toggleCampaign = (id: string) =>
    setCampaigns(cs => cs.map(c => c.id === id ? { ...c, active: !c.active } : c))

  const roi = (c: Campaign) => {
    const earned = Math.round(c.budgetSpent * 1.42)
    return { spent: c.budgetSpent, earned, rate: ((earned - c.budgetSpent) / c.budgetSpent * 100).toFixed(1) }
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>📣 Campaign Manager</h2>

      {/* Create Button */}
      <button
        onClick={() => setShowForm(v => !v)}
        style={{ width: '100%', padding: 12, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}
      >
        {showForm ? '✕ Cancel' : '+ Create Campaign'}
      </button>

      {/* Create Form */}
      {showForm && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
          {saved
            ? <div style={{ textAlign: 'center', padding: 16, color: '#a5d6a7' }}>✅ Campaign created!</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>CAMPAIGN NAME</div>
                  <input value={form.name} onChange={upd('name')} placeholder="e.g. Ramadan Market Drive"
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>OBJECTIVE</div>
                    <select value={form.objective} onChange={upd('objective')}
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }}>
                      {(['AWARENESS', 'SALES', 'ENGAGEMENT', 'EVENT'] as Objective[]).map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>BUDGET (₡)</div>
                    <input value={form.budget} onChange={upd('budget')} placeholder="80000"
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>START DATE</div>
                    <input type="date" value={form.startDate} onChange={upd('startDate')}
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>END DATE</div>
                    <input type="date" value={form.endDate} onChange={upd('endDate')}
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <button onClick={saveCampaign} style={{ padding: 11, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Launch Campaign
                </button>
              </div>
            )
          }
        </div>
      )}

      {/* Active Campaigns */}
      <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>ACTIVE CAMPAIGNS</div>
      {campaigns.map(c => {
        const pct = Math.round((c.budgetSpent / c.budgetTotal) * 100)
        const r = roi(c)
        return (
          <div key={c.id} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                <span style={{ background: OBJ_COLORS[c.objective], color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{c.objective}</span>
              </div>
              <div
                onClick={() => toggleCampaign(c.id)}
                style={{ width: 40, height: 22, borderRadius: 11, background: c.active ? GR : '#1a2e1b', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: c.active ? 21 : 3, transition: 'left 0.2s' }} />
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: MT }}>Budget used</span>
                <span>₡{c.budgetSpent.toLocaleString()} / ₡{c.budgetTotal.toLocaleString()}</span>
              </div>
              <div style={{ height: 6, background: '#1a2e1b', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: GR, borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <div style={{ background: '#050e06', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#a5d6a7' }}>{c.reach.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: MT }}>Reach</div>
              </div>
              <div style={{ background: '#050e06', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#a5d6a7' }}>{c.engRate}%</div>
                <div style={{ fontSize: 10, color: MT }}>Engagement</div>
              </div>
              <div style={{ background: '#050e06', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffe0b2' }}>+{r.rate}%</div>
                <div style={{ fontSize: 10, color: MT }}>ROI</div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Content Queue */}
      <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10, marginTop: 6 }}>CONTENT QUEUE</div>
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
        {queue.map((q, i) => (
          <div key={q.id} style={{ padding: '10px 14px', borderBottom: i < queue.length - 1 ? `1px solid ${BD}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: MT, background: '#1a2e1b', padding: '2px 8px', borderRadius: 10 }}>{q.platform}</span>
              <span style={{ fontSize: 11, color: MT }}>{q.dateTime}</span>
            </div>
            <div style={{ fontSize: 13, color: TX, marginTop: 4 }}>{q.preview}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
