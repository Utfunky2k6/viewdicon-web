'use client'
import { useState } from 'react'

const RECORDINGS = [
  { id: 1, title: 'Interview — Minister of Trade', type: 'Audio', duration: '34:12', date: '2026-04-03', size: '28 MB', tags: ['interview', 'government'] },
  { id: 2, title: 'Village Market B-Roll', type: 'Video', duration: '12:45', date: '2026-04-01', size: '480 MB', tags: ['b-roll', 'market'] },
  { id: 3, title: 'Protest Coverage — Accra', type: 'Video', duration: '1:02:30', date: '2026-03-28', size: '1.2 GB', tags: ['live', 'protest'] },
  { id: 4, title: 'Podcast Recording S2E15', type: 'Audio', duration: '51:00', date: '2026-03-25', size: '42 MB', tags: ['podcast'] },
  { id: 5, title: 'Community Forum Nairobi', type: 'Audio', duration: '1:28:00', date: '2026-03-20', size: '96 MB', tags: ['community', 'forum'] },
]

export default function RecordingVault() {
  const [recordings, setRecordings] = useState(RECORDINGS)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? recordings : recordings.filter(r => r.type === filter)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🎬 Recording Vault</h2>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['All', 'Audio', 'Video'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: filter === t ? '#1a7c3e' : '#f0fdf4', color: filter === t ? '#fff' : '#1a2e1a' }}>{t}</button>
        ))}
      </div>

      {filtered.map(r => (
        <div key={r.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>{r.type === 'Audio' ? '🎵' : '🎥'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{r.duration} — {r.size} — {r.date}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {r.tags.map(t => <span key={t} style={{ padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700, background: '#f0fdf4', color: '#1a7c3e', border: '1px solid #d1fae5' }}>#{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#1a7c3e', color: '#fff' }}>Play</button>
            <button onClick={() => setRecordings(rs => rs.filter(x => x.id !== r.id))} style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1.5px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#dc2626' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
