'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

const CATS = ['All', 'Contracts', 'IDs', 'Certificates', 'Legal', 'Medical', 'Financial']

const DOCS = [
  { name: 'Business Registration Cert', cat: 'Certificates', date: '2026-01-10', size: '340 KB' },
  { name: 'National ID Card (scan)',    cat: 'IDs',          date: '2025-11-05', size: '1.2 MB' },
  { name: 'Lease Agreement 2026',       cat: 'Contracts',    date: '2026-02-14', size: '520 KB' },
  { name: 'Q1 Financial Statement',     cat: 'Financial',    date: '2026-03-01', size: '180 KB' },
  { name: 'Trade License',              cat: 'Legal',        date: '2026-01-22', size: '290 KB' },
]

export default function DocumentVault() {
  const [cat, setCat] = React.useState('All')
  const [docs, setDocs] = React.useState(DOCS)
  const [toast, setToast] = React.useState('')
  const [drag, setDrag] = React.useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(f => {
      setDocs(prev => [{ name: f.name, cat: 'Contracts', date: new Date().toISOString().slice(0, 10), size: `${(f.size / 1024).toFixed(0)} KB` }, ...prev])
    })
    showToast(`✓ ${files.length} file(s) uploaded`)
  }

  const filtered = docs.filter(d => cat === 'All' || d.cat === cat)

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {/* Upload area */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{ border: `2px dashed ${drag ? '#4ade80' : C.border}`, borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 14, transition: 'border-color .2s', cursor: 'pointer' }}
        onClick={() => showToast('File picker opening...')}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Drag & Drop files here</div>
        <div style={{ fontSize: 10, color: C.sub }}>or click to browse · Encrypted end-to-end</div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', background: cat === c ? C.green : C.muted, color: cat === c ? '#fff' : C.sub }}>
            {c}
          </button>
        ))}
      </div>

      {/* Doc list */}
      {filtered.map((d, i) => (
        <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ fontSize: 22 }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{d.name}</div>
              <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{d.cat} · {d.date} · {d.size}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {['Download', 'Share via AfroID', 'Delete'].map(a => (
              <button key={a} onClick={() => showToast(`✓ ${a}`)} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 99, background: a === 'Delete' ? 'rgba(239,68,68,.1)' : C.muted, border: `1px solid ${a === 'Delete' ? 'rgba(239,68,68,.3)' : C.border}`, color: a === 'Delete' ? '#f87171' : C.sub, cursor: 'pointer', fontWeight: 700 }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
