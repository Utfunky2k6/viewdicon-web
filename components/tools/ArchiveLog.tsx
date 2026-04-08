'use client'
import { useState } from 'react'

const ARCHIVES = [
  { id: 1, title: 'Pre-Independence Constitution Drafts', category: 'Legal', format: 'PDF', year: 1958, items: 23, size: '145 MB' },
  { id: 2, title: 'Lagos Market Photography 1970s', category: 'Photography', format: 'TIFF', year: 1974, items: 312, size: '2.8 GB' },
  { id: 3, title: 'Oral Histories — Igbo Elders', category: 'Audio', format: 'WAV', year: 2020, items: 48, size: '1.1 GB' },
  { id: 4, title: 'Trade Route Maps — West Africa', category: 'Maps', format: 'SVG', year: 2024, items: 67, size: '340 MB' },
  { id: 5, title: 'Nollywood Film Scripts Archive', category: 'Literature', format: 'PDF', year: 2025, items: 185, size: '890 MB' },
  { id: 6, title: 'Colonial-Era Newspapers Scans', category: 'Press', format: 'JPEG', year: 1945, items: 1204, size: '5.4 GB' },
]

const catIcon = (c: string) => c === 'Legal' ? '⚖️' : c === 'Photography' ? '📸' : c === 'Audio' ? '🎙' : c === 'Maps' ? '🗺️' : c === 'Literature' ? '📚' : '📰'

export default function ArchiveLog() {
  const [archives, setArchives] = useState(ARCHIVES)
  const [search, setSearch] = useState('')

  const filtered = archives.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
  const totalItems = archives.reduce((a, b) => a + b.items, 0)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🏛️ Digital Archive</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1a7c3e' }}>{archives.length}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Collections</div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{totalItems.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Total Items</div>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search archives..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }} />

      {filtered.map(a => (
        <div key={a.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>{catIcon(a.category)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{a.category} — {a.format} — {a.year} — {a.items} items — {a.size}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#1a7c3e', color: '#fff' }}>Browse</button>
            <button onClick={() => setArchives(as2 => as2.filter(x => x.id !== a.id))} style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1.5px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#dc2626' }}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  )
}
