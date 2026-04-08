'use client'
import { useState } from 'react'

const PASSES = [
  { id: 1, name: 'Amara Diallo', outlet: 'Sahel Daily', type: 'Journalist', issued: '2026-03-01', expires: '2027-03-01', status: 'Active' },
  { id: 2, name: 'Kofi Mensah', outlet: 'Accra Tribune', type: 'Photographer', issued: '2026-01-15', expires: '2026-07-15', status: 'Active' },
  { id: 3, name: 'Fatou Camara', outlet: 'Pan-Africa Wire', type: 'Correspondent', issued: '2025-09-10', expires: '2026-03-10', status: 'Expired' },
  { id: 4, name: 'Emeka Obi', outlet: 'Lagos Lens', type: 'Journalist', issued: '2026-02-20', expires: '2027-02-20', status: 'Active' },
  { id: 5, name: 'Ngozi Eze', outlet: 'Nollywood Insider', type: 'Blogger', issued: '2026-04-01', expires: '2026-10-01', status: 'Pending' },
]

const statusColor = (s: string) => s === 'Active' ? '#1a7c3e' : s === 'Expired' ? '#dc2626' : '#d97706'

export default function PressPass() {
  const [passes, setPasses] = useState(PASSES)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? passes : passes.filter(p => p.status === filter)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🪪 Press Credentials</h2>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['All', 'Active', 'Pending', 'Expired'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: filter === s ? '#1a7c3e' : '#f0fdf4', color: filter === s ? '#fff' : '#1a2e1a' }}>{s}</button>
        ))}
      </div>

      {filtered.map(p => (
        <div key={p.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{p.outlet} — {p.type}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#fff', background: statusColor(p.status) }}>{p.status}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Issued: {p.issued} — Expires: {p.expires}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => setPasses(ps => ps.map(x => x.id === p.id ? { ...x, status: 'Active' } : x))} style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#1a7c3e', color: '#fff' }}>Renew</button>
            <button onClick={() => setPasses(ps => ps.filter(x => x.id !== p.id))} style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1.5px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#dc2626' }}>Revoke</button>
          </div>
        </div>
      ))}
    </div>
  )
}
