'use client'
import { useState } from 'react'

const ALERTS = [
  { id: 1, type: 'Storm', severity: 'high', region: 'Lagos Basin', message: 'Heavy rainfall expected 40-60mm, secure crops and drainage', time: '2h ago', color: '#ef4444' },
  { id: 2, type: 'Heat Wave', severity: 'medium', region: 'Northern Savanna', message: 'Temperatures exceeding 42°C for next 3 days', time: '5h ago', color: '#f97316' },
  { id: 3, type: 'Dry Spell', severity: 'medium', region: 'Middle Belt', message: 'No rain forecast for 12 days, irrigate early crops', time: '1d ago', color: '#f59e0b' },
  { id: 4, type: 'Favorable', severity: 'low', region: 'Coastal West', message: 'Ideal planting conditions next 5 days, moderate rain expected', time: '1d ago', color: '#1a7c3e' },
]

export default function WeatherAlert() {
  const [dismissed, setDismissed] = useState<number[]>([])

  const active = ALERTS.filter(a => !dismissed.includes(a.id))

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>⛈️ Weather Alerts</h2>
      {active.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>All clear — no active alerts</div>}
      {active.map(a => (
        <div key={a.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ background: a.color, color: '#fff', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{a.type}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{a.time}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{a.region}</div>
          <div style={{ fontSize: 13, color: '#444', marginBottom: 8 }}>{a.message}</div>
          <button onClick={() => setDismissed([...dismissed, a.id])} style={{
            background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '4px 12px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#666'
          }}>Dismiss</button>
        </div>
      ))}
    </div>
  )
}
