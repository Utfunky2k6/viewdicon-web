'use client'
import { useState } from 'react'

const PATIENTS_ANC = [
  { id: 1, name: 'Fatima Diallo', weeks: 32, weight: '74 kg', bp: '118/76', nextAppt: '2026-04-13', risk: 'low' },
  { id: 2, name: 'Ngozi Eze', weeks: 24, weight: '68 kg', bp: '130/85', nextAppt: '2026-04-10', risk: 'medium' },
  { id: 3, name: 'Aisha Bello', weeks: 38, weight: '82 kg', bp: '140/92', nextAppt: '2026-04-07', risk: 'high' },
  { id: 4, name: 'Adama Traore', weeks: 16, weight: '62 kg', bp: '110/70', nextAppt: '2026-04-20', risk: 'low' },
  { id: 5, name: 'Zainab Musa', weeks: 28, weight: '71 kg', bp: '125/80', nextAppt: '2026-04-15', risk: 'low' },
]

const RISK_COLOR: Record<string, string> = { low: '#16a34a', medium: '#f59e0b', high: '#dc2626' }

export default function AntenatalTracker() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🤰 Antenatal Tracker</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PATIENTS_ANC.map(p => (
          <div key={p.id} onClick={() => setSelected(selected === p.id ? null : p.id)}
            style={{ background: selected === p.id ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${selected === p.id ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: RISK_COLOR[p.risk] + '20', color: RISK_COLOR[p.risk] }}>{p.risk} risk</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Week: <b style={{ color: '#374151' }}>{p.weeks}</b></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Weight: <b style={{ color: '#374151' }}>{p.weight}</b></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>BP: <b style={{ color: '#374151' }}>{p.bp}</b></div>
            </div>
            {selected === p.id && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(p.weeks / 40) * 100}%`, background: '#1a7c3e' }} />
                </div>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{p.weeks}/40 weeks &middot; Next: {p.nextAppt}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button style={{ width: '100%', marginTop: 16, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ Register Patient</button>
    </div>
  )
}
