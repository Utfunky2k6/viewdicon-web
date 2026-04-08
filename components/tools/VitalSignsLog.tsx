'use client'
import { useState } from 'react'

const VITALS = [
  { id: 1, date: '2026-04-06 09:00', bp: '120/80', hr: 72, temp: 36.6, o2: 98 },
  { id: 2, date: '2026-04-06 06:00', bp: '118/76', hr: 68, temp: 36.5, o2: 99 },
  { id: 3, date: '2026-04-05 21:00', bp: '135/88', hr: 84, temp: 37.2, o2: 96 },
  { id: 4, date: '2026-04-05 15:00', bp: '122/82', hr: 76, temp: 36.8, o2: 97 },
  { id: 5, date: '2026-04-05 09:00', bp: '140/92', hr: 90, temp: 38.1, o2: 94 },
]

export default function VitalSignsLog() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const flagColor = (o2: number) => o2 >= 97 ? '#16a34a' : o2 >= 95 ? '#f59e0b' : '#dc2626'

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🫀 Vital Signs Log</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[['BP', VITALS[0].bp, '🩺'], ['HR', `${VITALS[0].hr} bpm`, '❤️'], ['Temp', `${VITALS[0].temp}°C`, '🌡️'], ['O₂', `${VITALS[0].o2}%`, '🫁']].map(([label, val, icon]) => (
          <div key={label as string} style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: 16 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1a7c3e' }}>{val}</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {VITALS.map(v => (
          <div key={v.id} onClick={() => setExpanded(expanded === v.id ? null : v.id)}
            style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{v.date}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: flagColor(v.o2) + '20', color: flagColor(v.o2) }}>O₂ {v.o2}%</span>
            </div>
            {expanded === v.id && (
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>BP: <b>{v.bp}</b></div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>HR: <b>{v.hr}</b></div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Temp: <b>{v.temp}°C</b></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button style={{ width: '100%', marginTop: 16, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ Record Vitals</button>
    </div>
  )
}
