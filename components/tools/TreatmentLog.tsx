'use client'
import { useState } from 'react'

const TREATMENTS = [
  { id: 1, date: '2026-04-06', patient: 'Amina Okafor', diagnosis: 'Malaria (P. falciparum)', procedure: 'ACT therapy', outcome: 'resolved' },
  { id: 2, date: '2026-04-05', patient: 'Kwame Asante', diagnosis: 'Pneumonia', procedure: 'IV Antibiotics + O₂', outcome: 'improving' },
  { id: 3, date: '2026-04-04', patient: 'Fatima Diallo', diagnosis: 'Type 2 Diabetes', procedure: 'Metformin started', outcome: 'monitoring' },
  { id: 4, date: '2026-04-03', patient: 'Emeka Nwosu', diagnosis: 'Fracture (L radius)', procedure: 'Closed reduction + cast', outcome: 'resolved' },
  { id: 5, date: '2026-04-02', patient: 'Aisha Bello', diagnosis: 'Gastritis', procedure: 'PPI + diet plan', outcome: 'improving' },
]

const OUTCOME_COLOR: Record<string, string> = { resolved: '#16a34a', improving: '#2563eb', monitoring: '#f59e0b' }

export default function TreatmentLog() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📋 Treatment Log</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TREATMENTS.map(t => (
          <div key={t.id} onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            style={{ background: expanded === t.id ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${expanded === t.id ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.patient}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: OUTCOME_COLOR[t.outcome] + '20', color: OUTCOME_COLOR[t.outcome] }}>{t.outcome}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{t.date} &middot; {t.diagnosis}</div>
            {expanded === t.id && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Procedure: <b style={{ color: '#374151' }}>{t.procedure}</b></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ New Entry</button>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#f0fdf4', color: '#1a7c3e', fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>Export Log</button>
      </div>
    </div>
  )
}
