'use client'
import { useState } from 'react'

const PROJECTS = [
  { id: 1, title: 'Annual Report — Yoruba', from: 'English', to: 'Yoruba', words: 12400, progress: 85, translator: 'Bola Akinwumi', deadline: '2026-04-10' },
  { id: 2, title: 'App UI Strings', from: 'English', to: 'Swahili', words: 3200, progress: 100, translator: 'Amani Mwangi', deadline: '2026-03-30' },
  { id: 3, title: 'Legal Contract — French', from: 'French', to: 'English', words: 5800, progress: 40, translator: 'Jean-Paul Mbeki', deadline: '2026-04-15' },
  { id: 4, title: 'Marketing Brochure', from: 'English', to: 'Hausa', words: 1800, progress: 60, translator: 'Fatima Bello', deadline: '2026-04-08' },
  { id: 5, title: 'Podcast Transcript S2E14', from: 'Pidgin', to: 'English', words: 8200, progress: 20, translator: 'Unassigned', deadline: '2026-04-20' },
]

const progressColor = (p: number) => p === 100 ? '#1a7c3e' : p >= 60 ? '#d97706' : '#dc2626'

export default function TranslationLog() {
  const [projects, setProjects] = useState(PROJECTS)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🌍 Translation Log</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1a7c3e' }}>{projects.filter(p => p.progress === 100).length}/{projects.length}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Completed</div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{projects.reduce((a, p) => a + p.words, 0).toLocaleString()}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Total Words</div>
        </div>
      </div>

      {projects.map(p => (
        <div key={p.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>{p.from} → {p.to} — {p.words.toLocaleString()} words — {p.translator}</div>
          <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ width: `${p.progress}%`, height: '100%', background: progressColor(p.progress), borderRadius: 99, transition: 'width .3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Due: {p.deadline}</span>
            <button onClick={() => setProjects(ps => ps.map(x => x.id === p.id ? { ...x, progress: Math.min(100, x.progress + 10) } : x))} style={{ padding: '5px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#1a7c3e', color: '#fff' }}>
              {p.progress === 100 ? 'Done' : `${p.progress}% — Update`}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
