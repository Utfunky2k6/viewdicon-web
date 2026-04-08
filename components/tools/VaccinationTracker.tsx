'use client'
import { useState } from 'react'

const VACCINES = [
  { id: 1, name: 'BCG', dose: '1 of 1', given: '2026-01-10', next: null, status: 'complete' },
  { id: 2, name: 'OPV (Polio)', dose: '2 of 4', given: '2026-03-15', next: '2026-05-15', status: 'on_track' },
  { id: 3, name: 'Pentavalent', dose: '1 of 3', given: '2026-02-20', next: '2026-04-20', status: 'due_soon' },
  { id: 4, name: 'Measles', dose: '0 of 2', given: null, next: '2026-09-01', status: 'upcoming' },
  { id: 5, name: 'Yellow Fever', dose: '0 of 1', given: null, next: '2026-09-01', status: 'upcoming' },
]

const STATUS_COLOR: Record<string, string> = { complete: '#16a34a', on_track: '#2563eb', due_soon: '#f59e0b', upcoming: '#6b7280' }

export default function VaccinationTracker() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? VACCINES : VACCINES.filter(v => v.status === filter)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>💉 Vaccination Tracker</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['all', 'complete', 'on_track', 'due_soon', 'upcoming'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 12px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer',
              background: filter === f ? '#1a7c3e' : '#f0f7f0', color: filter === f ? '#fff' : '#3a5a3a' }}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(v => (
          <div key={v.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: STATUS_COLOR[v.status] + '20', color: STATUS_COLOR[v.status] }}>{v.status.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Dose: <b style={{ color: '#374151' }}>{v.dose}</b></div>
              {v.given && <div style={{ fontSize: 11, color: '#6b7280' }}>Last: <b style={{ color: '#374151' }}>{v.given}</b></div>}
              {v.next && <div style={{ fontSize: 11, color: '#6b7280' }}>Next: <b style={{ color: '#374151' }}>{v.next}</b></div>}
            </div>
          </div>
        ))}
      </div>
      <button style={{ width: '100%', marginTop: 16, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ Record Vaccination</button>
    </div>
  )
}
