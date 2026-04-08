'use client'
import { useState } from 'react'

const PRESCRIPTIONS = [
  { id: 1, drug: 'Amoxicillin 500mg', dose: '1 capsule', frequency: '3x daily', days: 7, status: 'active' },
  { id: 2, drug: 'Paracetamol 500mg', dose: '2 tablets', frequency: '4x daily', days: 5, status: 'active' },
  { id: 3, drug: 'Artemether/Lumefantrine', dose: '4 tablets', frequency: '2x daily', days: 3, status: 'completed' },
  { id: 4, drug: 'Metformin 850mg', dose: '1 tablet', frequency: '2x daily', days: 90, status: 'active' },
  { id: 5, drug: 'Ibuprofen 400mg', dose: '1 tablet', frequency: 'As needed', days: 10, status: 'paused' },
]

const STATUS_COLOR: Record<string, string> = { active: '#16a34a', completed: '#6b7280', paused: '#f59e0b' }

export default function PrescriptionTool() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>💊 Prescriptions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PRESCRIPTIONS.map(rx => (
          <div key={rx.id} onClick={() => setSelected(selected === rx.id ? null : rx.id)}
            style={{ background: selected === rx.id ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${selected === rx.id ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{rx.drug}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: STATUS_COLOR[rx.status] + '20', color: STATUS_COLOR[rx.status] }}>{rx.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Dose: <b style={{ color: '#374151' }}>{rx.dose}</b></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Freq: <b style={{ color: '#374151' }}>{rx.frequency}</b></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Days: <b style={{ color: '#374151' }}>{rx.days}</b></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ New Prescription</button>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#f0fdf4', color: '#1a7c3e', fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>Print All</button>
      </div>
    </div>
  )
}
