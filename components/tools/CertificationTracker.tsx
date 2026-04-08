'use client'
import { useState } from 'react'

const CERTS = [
  { name: 'Organic Certification', body: 'NAFDAC Organic', status: 'active', expires: '2026-11-15', progress: 100, color: '#1a7c3e' },
  { name: 'Fair Trade', body: 'Fairtrade International', status: 'pending', expires: '—', progress: 65, color: '#f59e0b' },
  { name: 'GlobalG.A.P.', body: 'GlobalG.A.P. Council', status: 'active', expires: '2027-03-01', progress: 100, color: '#1a7c3e' },
  { name: 'Rainforest Alliance', body: 'RA Certification', status: 'expired', expires: '2026-01-30', progress: 0, color: '#ef4444' },
  { name: 'USDA Organic Export', body: 'USDA via NAQS', status: 'in_review', expires: '—', progress: 85, color: '#3b82f6' },
]

export default function CertificationTracker() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? CERTS : CERTS.filter(c => c.status === filter)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📜 Certification Tracker</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {['all', 'active', 'pending', 'in_review', 'expired'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 11,
            background: filter === f ? '#1a7c3e' : '#e5e7eb', color: filter === f ? '#fff' : '#1a2e1a', cursor: 'pointer'
          }}>{f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</button>
        ))}
      </div>
      {filtered.map((c, i) => (
        <div key={i} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
            <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: c.color + '22', color: c.color }}>{c.status.replace('_', ' ')}</span>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{c.body} · Expires: {c.expires}</div>
          <div style={{ background: '#e5e7eb', borderRadius: 99, height: 6 }}>
            <div style={{ background: c.color, borderRadius: 99, height: 6, width: `${c.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
