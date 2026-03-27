'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type ActivityType = 'PLANTING' | 'TREATMENT' | 'WATER_MANAGEMENT' | 'SOIL_TEST' | 'BIODIVERSITY_COUNT'

interface Activity {
  id: string; date: string; type: ActivityType; area: number; notes: string; weather: string; outcome: string
}

interface SoilMetric { label: string; value: number; unit: string; status: 'GOOD' | 'LOW' | 'HIGH' }

const typeEmoji: Record<ActivityType, string> = { PLANTING: '🌱', TREATMENT: '💊', WATER_MANAGEMENT: '💧', SOIL_TEST: '🧪', BIODIVERSITY_COUNT: '🦋' }
const typeColor: Record<ActivityType, string> = { PLANTING: green, TREATMENT: amber, WATER_MANAGEMENT: blue, SOIL_TEST: gold, BIODIVERSITY_COUNT: '#9b59b6' }

const INIT_ACTIVITIES: Activity[] = [
  { id: 'ac1', date: '2026-03-20', type: 'PLANTING', area: 3.5, notes: 'Cassava intercropped with cowpea', weather: 'Partly cloudy, 28°C', outcome: 'Good germination rate expected' },
  { id: 'ac2', date: '2026-03-22', type: 'SOIL_TEST', area: 5.0, notes: 'Quarterly pH and NPK analysis', weather: 'Sunny, 31°C', outcome: 'pH 6.2 — within optimal range' },
  { id: 'ac3', date: '2026-03-24', type: 'WATER_MANAGEMENT', area: 8.0, notes: 'Drip irrigation system calibrated', weather: 'Hot, 34°C', outcome: 'Water usage reduced by 22%' },
  { id: 'ac4', date: '2026-03-25', type: 'BIODIVERSITY_COUNT', area: 12.0, notes: 'Pollinator census — bees and butterflies', weather: 'Cloudy, 26°C', outcome: 'Species count: 14 pollinators observed' },
]

const SOIL_METRICS: SoilMetric[] = [
  { label: 'pH Level', value: 6.2, unit: '', status: 'GOOD' },
  { label: 'Nitrogen (N)', value: 42, unit: 'ppm', status: 'LOW' },
  { label: 'Phosphorus (P)', value: 28, unit: 'ppm', status: 'GOOD' },
  { label: 'Potassium (K)', value: 185, unit: 'ppm', status: 'GOOD' },
]

const BIODIVERSITY = [
  { season: 'Dry Season 2025', species: 8 },
  { season: 'Rainy Season 2025', species: 19 },
  { season: 'Dry Season 2026', species: 14 },
]

const statusColor = { GOOD: green, LOW: red, HIGH: amber }

export default function ConservationLog({ villageId, roleKey }: ToolProps) {
  const [activities, setActivities] = useState<Activity[]>(INIT_ACTIVITIES)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ date: '', type: 'PLANTING' as ActivityType, area: '', notes: '', weather: '', outcome: '' })
  const [toast, setToast] = useState<string | null>(null)
  const [certDate, setCertDate] = useState('2027-03-20')

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const addActivity = () => {
    if (!form.date || !form.notes) return
    const act: Activity = { id: `ac${Date.now()}`, ...form, area: Number(form.area) || 0 }
    setActivities(prev => [...prev, act])
    setForm({ date: '', type: 'PLANTING', area: '', notes: '', weather: '', outcome: '' })
    setShowAdd(false); flash('Activity logged')
  }

  const totalArea = activities.reduce((s, a) => s + a.area, 0)

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Conservation Log</div>
          <div style={{ color: muted, fontSize: 12 }}>Adaeze's Regenerative Farm — Enugu State</div>
        </div>
        <button onClick={() => setShowAdd(s => !s)} style={btn(green)}>+ Add Activity</button>
      </div>

      {/* Farm details */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 20 }}>
        <div><div style={{ fontSize: 10, color: muted }}>Location</div><div style={{ fontWeight: 700 }}>Nsukka, Enugu State</div></div>
        <div><div style={{ fontSize: 10, color: muted }}>Total Area</div><div style={{ fontWeight: 700, color: gold }}>{totalArea.toFixed(1)} ha logged</div></div>
        <div><div style={{ fontSize: 10, color: muted }}>Activities</div><div style={{ fontWeight: 700, color: green }}>{activities.length}</div></div>
      </div>

      {/* Activity log */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Activity Log</div>
        {[...activities].reverse().map(a => (
          <div key={a.id} style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{typeEmoji[a.type]}</span>
                <div>
                  <div style={{ fontWeight: 700, color: typeColor[a.type] }}>{a.type.replace('_', ' ')}</div>
                  <div style={{ fontSize: 10, color: muted }}>{a.date} · {a.area} ha · {a.weather}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: text, paddingLeft: 26 }}>{a.notes}</div>
            {a.outcome && <div style={{ fontSize: 11, color: green, paddingLeft: 26, marginTop: 2 }}>→ {a.outcome}</div>}
          </div>
        ))}
      </div>

      {/* Biodiversity tracker */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Biodiversity Tracker</div>
        {BIODIVERSITY.map(b => (
          <div key={b.season} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: muted }}>{b.season}</span>
              <span style={{ color: gold }}>{b.species} species</span>
            </div>
            <div style={{ height: 5, background: '#1a3a20', borderRadius: 3 }}>
              <div style={{ width: `${(b.species / 25) * 100}%`, height: '100%', background: '#9b59b6', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Soil health */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Soil Health Indicators</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SOIL_METRICS.map(m => (
            <div key={m.label} style={{ background: '#0a1a0c', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: muted }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: statusColor[m.status] }}>{m.value}{m.unit}</div>
              <span style={{ fontSize: 9, fontWeight: 700, color: statusColor[m.status], background: statusColor[m.status] + '22', padding: '1px 5px', borderRadius: 6 }}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certification */}
      <div style={{ background: card, border: `1px solid ${green}`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: green }}>✓ Organic Certification Active</div>
            <div style={{ fontSize: 11, color: muted }}>NAFDAC Organic Standard · Cert# OC-2024-NGN-0441</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: muted }}>Compliance Date</div>
            <input type="date" value={certDate} onChange={e => setCertDate(e.target.value)} style={{ background: 'none', border: 'none', color: gold, fontSize: 12, fontWeight: 700, outline: 'none', textAlign: 'right' }} />
          </div>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Log New Activity</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ActivityType }))} style={inp}>
              {(['PLANTING', 'TREATMENT', 'WATER_MANAGEMENT', 'SOIL_TEST', 'BIODIVERSITY_COUNT'] as ActivityType[]).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <input placeholder="Area (ha)" type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} style={inp} />
            <input placeholder="Weather conditions" value={form.weather} onChange={e => setForm(f => ({ ...f, weather: e.target.value }))} style={inp} />
            <textarea placeholder="Activity description..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, gridColumn: 'span 2', minHeight: 60, resize: 'none' }} />
            <input placeholder="Outcome (optional)" value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} style={{ ...inp, gridColumn: 'span 2' }} />
          </div>
          <button onClick={addActivity} style={btn(green)}>Log Activity</button>
        </div>
      )}
    </div>
  )
}
