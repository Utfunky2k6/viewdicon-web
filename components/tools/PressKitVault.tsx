'use client'
import { useState } from 'react'

const KITS = [
  { id: 1, name: 'Company Overview 2026', type: 'PDF', size: '2.4 MB', updated: '2026-03-28', downloads: 34 },
  { id: 2, name: 'Brand Logo Pack', type: 'ZIP', size: '8.1 MB', updated: '2026-03-15', downloads: 89 },
  { id: 3, name: 'Founder Bio & Headshots', type: 'PDF', size: '5.6 MB', updated: '2026-02-10', downloads: 47 },
  { id: 4, name: 'Product Screenshots Q1', type: 'ZIP', size: '12.3 MB', updated: '2026-04-01', downloads: 22 },
  { id: 5, name: 'Press Release — Launch', type: 'DOCX', size: '180 KB', updated: '2026-01-20', downloads: 115 },
]

const typeIcon = (t: string) => t === 'PDF' ? '📕' : t === 'ZIP' ? '📦' : t === 'DOCX' ? '📝' : '📄'

export default function PressKitVault() {
  const [kits, setKits] = useState(KITS)
  const [search, setSearch] = useState('')

  const filtered = kits.filter(k => k.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📂 Press Kit Vault</h2>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search press kits..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }} />

      {filtered.map(k => (
        <div key={k.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>{typeIcon(k.type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{k.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{k.type} — {k.size} — Updated {k.updated}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#f0fdf4', color: '#1a7c3e' }}>{k.downloads} DL</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setKits(ks => ks.map(x => x.id === k.id ? { ...x, downloads: x.downloads + 1 } : x))} style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#1a7c3e', color: '#fff' }}>Download</button>
            <button style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1.5px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#1a2e1a' }}>Share Link</button>
          </div>
        </div>
      ))}
    </div>
  )
}
