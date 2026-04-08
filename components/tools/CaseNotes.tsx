'use client'
import { useState } from 'react'

const NOTES = [
  { id: 1, date: '2026-04-06', patient: 'Amina Okafor', diagnosis: 'Acute malaria', doctor: 'Dr. Adeyemi', notes: 'RDT positive. Started ACT regime. Review in 3 days.' },
  { id: 2, date: '2026-04-05', patient: 'Kwame Asante', diagnosis: 'Community-acquired pneumonia', doctor: 'Dr. Mensah', notes: 'CXR shows consolidation RLL. IV ceftriaxone started.' },
  { id: 3, date: '2026-04-04', patient: 'Fatima Diallo', diagnosis: 'Gestational diabetes', doctor: 'Dr. Obi', notes: 'OGTT abnormal. Diet counselling done. Start metformin if no improvement in 2 weeks.' },
  { id: 4, date: '2026-04-03', patient: 'Emeka Nwosu', diagnosis: 'Hypertension Stage 2', doctor: 'Dr. Adeyemi', notes: 'BP 160/100. Started amlodipine 5mg OD. Lifestyle modifications discussed.' },
]

export default function CaseNotes() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📝 Case Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NOTES.map(n => (
          <div key={n.id} onClick={() => setExpanded(expanded === n.id ? null : n.id)}
            style={{ background: expanded === n.id ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${expanded === n.id ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{n.patient}</div>
              <span style={{ fontSize: 10, color: '#6b7280' }}>{n.date}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{n.diagnosis} &middot; {n.doctor}</div>
            {expanded === n.id && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                {n.notes}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ New Case Note</button>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#f0fdf4', color: '#1a7c3e', fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>Search Notes</button>
      </div>
    </div>
  )
}
