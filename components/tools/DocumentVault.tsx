'use client'
import * as React from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const C = {
  bg: '#060d07', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e', accent: '#4ade80',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)', red: '#f87171',
}

type DocType = 'Contract' | 'Certificate' | 'License' | 'Report' | 'Invoice' | 'Other'
const DOC_TYPES: DocType[] = ['Contract', 'Certificate', 'License', 'Report', 'Invoice', 'Other']
const DOC_ICONS: Record<DocType, string> = { Contract: '📜', Certificate: '🏅', License: '🪪', Report: '📊', Invoice: '🧾', Other: '📄' }
const TYPE_COLOR: Record<DocType, string> = { Contract: '#60a5fa', Certificate: '#d4a017', License: '#a78bfa', Report: '#34d399', Invoice: '#4ade80', Other: '#7da882' }

interface Doc {
  id: string; name: string; type: DocType; date: string; size: string; tags: string[]
}

const INIT_DOCS: Doc[] = [
  { id: 'd1', name: 'Business Registration Certificate',  type: 'Certificate', date: '2026-01-10', size: '340 KB',  tags: ['legal', 'official'] },
  { id: 'd2', name: 'National ID Card (scan)',            type: 'Other',       date: '2025-11-05', size: '1.2 MB',  tags: ['identity'] },
  { id: 'd3', name: 'Lease Agreement 2026',               type: 'Contract',    date: '2026-02-14', size: '520 KB',  tags: ['property', 'legal'] },
  { id: 'd4', name: 'Q1 Financial Statement',             type: 'Report',      date: '2026-03-01', size: '180 KB',  tags: ['finance', 'q1'] },
  { id: 'd5', name: 'Trade License – Agric Products',     type: 'License',     date: '2026-01-22', size: '290 KB',  tags: ['official'] },
  { id: 'd6', name: 'Invoice INV-0041 (Paid)',            type: 'Invoice',     date: '2026-03-26', size: '85 KB',   tags: ['finance'] },
]

export default function DocumentVault({ villageId }: ToolProps) {
  const key = `doc_vault_${villageId || 'default'}`
  const [loading, setLoading] = React.useState(true)
  const [docs, setDocs] = React.useState<Doc[]>(INIT_DOCS)
  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<DocType | 'All'>('All')
  const [tagFilter, setTagFilter] = React.useState('')
  const [showAdd, setShowAdd] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', type: 'Contract' as DocType, tags: '' })
  const [drag, setDrag] = React.useState(false)
  const [toast, setToast] = React.useState('')

  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (stored) { try { setDocs(JSON.parse(stored)) } catch {} }
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [key])

  const persist = (updated: Doc[]) => {
    setDocs(updated)
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(updated))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const addDoc = () => {
    if (!form.name) return
    const newDoc: Doc = {
      id: `d${Date.now()}`, name: form.name, type: form.type,
      date: new Date().toISOString().slice(0, 10), size: `${Math.floor(Math.random() * 900 + 50)} KB`,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    }
    persist([newDoc, ...docs])
    setForm({ name: '', type: 'Contract', tags: '' })
    setShowAdd(false)
    showToast('Document added to vault')
  }

  const deleteDoc = (id: string) => {
    persist(docs.filter(d => d.id !== id))
    showToast('Document deleted')
  }

  const fakeDownload = (name: string) => {
    const blob = new Blob([`Document: ${name}\nVault: ${villageId || 'village'}\nDate: ${new Date().toISOString()}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = name.replace(/\s+/g, '_') + '.txt'
    a.click(); URL.revokeObjectURL(url)
    showToast(`Downloaded: ${name}`)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const files = Array.from(e.dataTransfer.files)
    const newDocs: Doc[] = files.map(f => ({
      id: `d${Date.now()}_${f.name}`, name: f.name, type: 'Other' as DocType,
      date: new Date().toISOString().slice(0, 10), size: `${(f.size / 1024).toFixed(0)} KB`, tags: []
    }))
    persist([...newDocs, ...docs])
    showToast(`${files.length} file(s) uploaded`)
  }

  const allTags = Array.from(new Set(docs.flatMap(d => d.tags)))

  const filtered = docs.filter(d =>
    (typeFilter === 'All' || d.type === typeFilter) &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase())) &&
    (tagFilter === '' || d.tags.includes(tagFilter))
  )

  if (loading) return (
    <div>{[...Array(3)].map((_, i) => <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, height: 72 }} />)}</div>
  )

  return (
    <div style={{ color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{ border: `2px dashed ${drag ? C.accent : C.border}`, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: 14, transition: 'border-color .2s', cursor: 'pointer', background: drag ? 'rgba(74,222,128,.04)' : 'transparent' }}
        onClick={() => setShowAdd(s => !s)}
      >
        <div style={{ fontSize: 24, marginBottom: 4 }}>🔒</div>
        <div style={{ fontSize: 12, fontWeight: 700 }}>Secure Document Vault</div>
        <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>Drag & drop or click to add document</div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Add Document</div>
          <input placeholder="Document name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as DocType }))}
            style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addDoc} style={{ flex: 1, padding: 10, borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Add Document</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '10px 14px', borderRadius: 8, background: C.muted, color: C.text, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
        style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, scrollbarWidth: 'none' }}>
        {(['All', ...DOC_TYPES] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', background: typeFilter === t ? C.green : C.muted, color: typeFilter === t ? '#fff' : C.sub }}>
            {t === 'All' ? 'All' : `${DOC_ICONS[t]} ${t}`}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? '' : tag)} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 9, fontWeight: 700, cursor: 'pointer', border: `1px solid ${tagFilter === tag ? C.accent : C.border}`, background: tagFilter === tag ? 'rgba(74,222,128,.12)' : C.muted, color: tagFilter === tag ? C.accent : C.sub }}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.sub }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>No documents found</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Upload your first document above</div>
        </div>
      ) : filtered.map(doc => (
        <div key={doc.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{DOC_ICONS[doc.type]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{doc.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: TYPE_COLOR[doc.type], background: `${TYPE_COLOR[doc.type]}15`, border: `1px solid ${TYPE_COLOR[doc.type]}30`, borderRadius: 99, padding: '2px 7px' }}>{doc.type}</span>
                <span style={{ fontSize: 9, color: C.sub }}>{doc.date} · {doc.size}</span>
              </div>
              {doc.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {doc.tags.map(tag => <span key={tag} style={{ fontSize: 8, color: C.sub, background: C.muted, borderRadius: 99, padding: '2px 6px' }}>#{tag}</span>)}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => fakeDownload(doc.name)} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 99, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', color: C.accent, cursor: 'pointer', fontWeight: 700 }}>↓ Download</button>
            <button onClick={() => showToast(`Link copied for ${doc.name}`)} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 99, background: C.muted, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', fontWeight: 700 }}>Share</button>
            <button onClick={() => deleteDoc(doc.id)} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 99, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: C.red, cursor: 'pointer', fontWeight: 700, marginLeft: 'auto' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
