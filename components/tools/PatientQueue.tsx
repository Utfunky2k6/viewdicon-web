'use client'
import { useState } from 'react'

const PATIENTS = [
  { id: 1, name: 'Amina Okafor', waitMin: 5, urgency: 'critical', reason: 'Chest pain' },
  { id: 2, name: 'Kwame Asante', waitMin: 12, urgency: 'high', reason: 'High fever' },
  { id: 3, name: 'Fatima Diallo', waitMin: 25, urgency: 'medium', reason: 'Prenatal check' },
  { id: 4, name: 'Tunde Balogun', waitMin: 34, urgency: 'low', reason: 'Follow-up visit' },
  { id: 5, name: 'Ngozi Eze', waitMin: 41, urgency: 'medium', reason: 'Wound dressing' },
]

const URGENCY_COLOR: Record<string, string> = {
  critical: '#dc2626', high: '#f59e0b', medium: '#2563eb', low: '#16a34a',
}

export default function PatientQueue() {
  const [queue, setQueue] = useState(PATIENTS)

  const callNext = () => {
    if (queue.length > 0) setQueue(queue.slice(1))
  }

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🏥 Patient Queue</h2>
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: '1px solid #bbf7d0' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>{queue.length} patients waiting</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {queue.map((p, i) => (
          <div key={p.id} style={{ background: i === 0 ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${i === 0 ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{i === 0 ? '➡️ ' : ''}{p.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: URGENCY_COLOR[p.urgency] + '20', color: URGENCY_COLOR[p.urgency] }}>{p.urgency}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Wait: <b style={{ color: '#374151' }}>{p.waitMin} min</b></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Reason: <b style={{ color: '#374151' }}>{p.reason}</b></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={callNext} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>Call Next Patient</button>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#f0fdf4', color: '#1a7c3e', fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>+ Add Patient</button>
      </div>
    </div>
  )
}
