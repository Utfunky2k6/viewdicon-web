'use client'
import { useState } from 'react'

const ZONES = [
  { zone: 'Zone A — Tomato Field', crop: 'Tomatoes', nextWater: 'Today 6:00 AM', duration: '45 min', method: 'Drip', status: 'due' },
  { zone: 'Zone B — Maize Plot', crop: 'Maize', nextWater: 'Tomorrow 5:30 AM', duration: '60 min', method: 'Sprinkler', status: 'ok' },
  { zone: 'Zone C — Pepper Beds', crop: 'Pepper', nextWater: 'Today 5:00 PM', duration: '30 min', method: 'Drip', status: 'due' },
  { zone: 'Zone D — Rice Paddy', crop: 'Rice', nextWater: 'Wed 6:00 AM', duration: '120 min', method: 'Flood', status: 'ok' },
]

export default function IrrigationSchedule() {
  const [completed, setCompleted] = useState<number[]>([])

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>💧 Irrigation Schedule</h2>
      {ZONES.map((z, i) => (
        <div key={i} style={{ background: completed.includes(i) ? '#f0fdf4' : '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10, opacity: completed.includes(i) ? 0.6 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{z.zone}</span>
            <span style={{
              padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: completed.includes(i) ? '#dcfce7' : z.status === 'due' ? '#fef3c7' : '#f3f4f6',
              color: completed.includes(i) ? '#1a7c3e' : z.status === 'due' ? '#a16207' : '#888'
            }}>{completed.includes(i) ? 'Done' : z.status === 'due' ? 'Due' : 'Scheduled'}</span>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>{z.method} · {z.duration} · Next: {z.nextWater}</div>
          {!completed.includes(i) && (
            <button onClick={() => setCompleted([...completed, i])} style={{
              marginTop: 8, background: '#1a7c3e', color: '#fff', border: 'none', borderRadius: 12,
              padding: '6px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>Mark Watered</button>
          )}
        </div>
      ))}
    </div>
  )
}
