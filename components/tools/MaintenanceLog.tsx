'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface ServiceRecord { date: string; type: string; work: string; parts: string; cost: number; tech: string }
interface Asset { id: string; name: string; serial: string; lastService: string; nextServiceDate: string; daysUntil: number }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', RD = '#c62828', AM = '#e65100'

const ASSETS: Asset[] = [
  { id: 'a1', name: 'Toyota HiAce Bus',       serial: 'THL-2024-0078', lastService: '2025-12-14', nextServiceDate: '2026-03-28', daysUntil: 2  },
  { id: 'a2', name: 'Perkins 100kVA Generator',serial: 'PKG-2022-1134', lastService: '2026-01-20', nextServiceDate: '2026-04-20', daysUntil: 25 },
  { id: 'a3', name: 'Caterpillar Excavator',   serial: 'CAT-2020-7712', lastService: '2026-02-10', nextServiceDate: '2026-05-10', daysUntil: 45 },
]

const HISTORY: ServiceRecord[] = [
  { date: '2025-12-14', type: 'Full Service',       work: 'Engine oil, filters, brake pads replaced',       parts: 'Oil, filters, brake pads',   cost: 18500, tech: 'Kwame Asante'     },
  { date: '2025-09-20', type: 'Oil Change',          work: 'Engine oil and oil filter replaced',              parts: 'Oil, filter',                cost: 6800,  tech: 'Tunde Adesanya'  },
  { date: '2025-06-05', type: 'Tyre Replacement',   work: 'Four tyres replaced, alignment done',             parts: '4× Bridgestone tyres',        cost: 32000, tech: 'Kwame Asante'     },
  { date: '2025-03-11', type: 'Full Service',       work: 'Major overhaul, gearbox flush',                   parts: 'Multiple parts',              cost: 24600, tech: 'Babajide Okafor'  },
  { date: '2024-12-02', type: 'Battery Replacement', work: 'Battery and alternator belt replaced',           parts: 'Battery, belt',              cost: 9200,  tech: 'Tunde Adesanya'  },
]

export default function MaintenanceLog({ villageId: _v, roleKey: _r }: ToolProps) {
  const [selectedId, setSelectedId] = useState('a1')
  const [alertEnabled, setAlertEnabled] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [logged, setLogged] = useState(false)
  const [form, setForm] = useState({ date: '', serviceType: '', work: '', parts: '', cost: '', tech: '' })

  const asset = ASSETS.find(a => a.id === selectedId) ?? ASSETS[0]
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const saveLog = () => {
    if (!form.serviceType) return
    setLogged(true)
    setTimeout(() => { setLogged(false); setShowForm(false) }, 2000)
  }

  const urgentColor = asset.daysUntil < 7 ? RD : asset.daysUntil < 30 ? AM : GR
  const totalQ = HISTORY.reduce((s, r) => s + r.cost, 0)

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>🔧 Maintenance Log</h2>

      {/* Asset Selector */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 8 }}>SELECT ASSET</div>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '9px 10px', color: TX, fontSize: 14 }}
        >
          {ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Asset Details */}
      <div style={{ background: CARD, border: `1px solid ${urgentColor}44`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{asset.name}</div>
          <span style={{ background: urgentColor, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {asset.daysUntil <= 0 ? 'OVERDUE' : `${asset.daysUntil}d`}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          <div><span style={{ color: MT }}>Serial: </span>{asset.serial}</div>
          <div><span style={{ color: MT }}>Last service: </span>{asset.lastService}</div>
          <div style={{ gridColumn: '1/-1' }}>
            <span style={{ color: MT }}>Next service: </span>
            <span style={{ color: urgentColor, fontWeight: 600 }}>{asset.nextServiceDate} ({asset.daysUntil <= 0 ? 'OVERDUE' : `${asset.daysUntil} days`})</span>
          </div>
        </div>

        {/* Alert Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${BD}` }}>
          <span style={{ fontSize: 13, color: MT }}>🔔 Notify me 30 days before next service</span>
          <div
            onClick={() => setAlertEnabled(v => !v)}
            style={{ width: 44, height: 24, borderRadius: 12, background: alertEnabled ? GR : '#1a2e1b', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
          >
            <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff', top: 3, left: alertEnabled ? 23 : 3, transition: 'left 0.2s' }} />
          </div>
        </div>
      </div>

      {/* Add Log */}
      <button
        onClick={() => setShowForm(f => !f)}
        style={{ width: '100%', padding: 12, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}
      >
        {showForm ? '✕ Cancel' : '+ Log Service Entry'}
      </button>

      {showForm && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          {logged
            ? <div style={{ textAlign: 'center', padding: 16, color: '#a5d6a7' }}>✅ Service entry saved!</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>SERVICE TYPE</div>
                  <select value={form.serviceType} onChange={upd('serviceType')}
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }}>
                    <option value="">Select type...</option>
                    {['Oil Change', 'Full Service', 'Tyre Replacement', 'Brake Service', 'Electrical', 'Body Work', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {[['Date', 'date', '2026-03-26', 'input'], ['Work Done', 'work', 'Describe work performed...', 'textarea'], ['Parts Replaced', 'parts', 'List parts used...', 'input'], ['Cost (₡)', 'cost', '15000', 'input'], ['Technician', 'tech', 'Name of technician', 'input']].map(([label, key, ph, type]) => (
                  <div key={key as string}>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>{label as string}</div>
                    {type === 'textarea'
                      ? <textarea value={form[key as keyof typeof form]} onChange={upd(key as keyof typeof form)} placeholder={ph as string} rows={2}
                          style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                      : <input value={form[key as keyof typeof form]} onChange={upd(key as keyof typeof form)} placeholder={ph as string}
                          style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                    }
                  </div>
                ))}
                <button onClick={saveLog} style={{ padding: 11, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  💾 Save Entry
                </button>
              </div>
            )
          }
        </div>
      )}

      {/* History Table */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
          <span>SERVICE HISTORY</span>
          <span style={{ color: '#a5d6a7' }}>Q1 total: ₡{totalQ.toLocaleString()}</span>
        </div>
        {HISTORY.map((r, i) => (
          <div key={i} style={{ padding: '10px 14px', borderBottom: i < HISTORY.length - 1 ? `1px solid ${BD}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.type}</span>
              <span style={{ fontSize: 13, color: '#a5d6a7' }}>₡{r.cost.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 12, color: MT }}>{r.date} · {r.tech}</div>
            <div style={{ fontSize: 12, color: TX, marginTop: 2 }}>{r.work}</div>
          </div>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: MT }}>Total maintenance spend this quarter</span>
        <span style={{ color: '#a5d6a7', fontWeight: 700 }}>₡47,800</span>
      </div>
    </div>
  )
}
