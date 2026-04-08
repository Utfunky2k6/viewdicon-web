'use client'
import { useState } from 'react'

const EPISODES = [
  { id: 1, title: 'The Roots of AfroTech', show: 'Village Voices', ep: 'S2E14', date: '2026-04-02', duration: '42 min', status: 'Published' },
  { id: 2, title: 'Women in Nollywood', show: 'Culture Beats', ep: 'S1E08', date: '2026-03-30', duration: '38 min', status: 'Published' },
  { id: 3, title: 'Cowrie Economy Deep Dive', show: 'Village Voices', ep: 'S2E15', date: '2026-04-06', duration: '51 min', status: 'Recording' },
  { id: 4, title: 'Jollof Wars: The Finale', show: 'Food & Fire', ep: 'S3E20', date: '2026-04-10', duration: '—', status: 'Scheduled' },
  { id: 5, title: 'Diaspora Connections', show: 'Culture Beats', ep: 'S1E09', date: '2026-04-12', duration: '—', status: 'Scheduled' },
]

const statusColor = (s: string) => s === 'Published' ? '#1a7c3e' : s === 'Recording' ? '#d97706' : '#6b7280'

export default function EpisodeTracker() {
  const [episodes, setEpisodes] = useState(EPISODES)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? episodes : episodes.filter(e => e.status === filter)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🎙 Episode Tracker</h2>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['All', 'Published', 'Recording', 'Scheduled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: filter === s ? '#1a7c3e' : '#f0fdf4', color: filter === s ? '#fff' : '#1a2e1a' }}>{s}</button>
        ))}
      </div>

      {filtered.map(ep => (
        <div key={ep.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ep.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{ep.show} — {ep.ep} — {ep.duration}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#fff', background: statusColor(ep.status) }}>{ep.status}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Date: {ep.date}</div>
          <button onClick={() => setEpisodes(es => es.map(x => x.id === ep.id ? { ...x, status: 'Published' } : x))} style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#1a7c3e', color: '#fff' }}>
            {ep.status === 'Published' ? 'View Analytics' : 'Mark Published'}
          </button>
        </div>
      ))}
    </div>
  )
}
