'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
type PubType = 'PAPER' | 'BOOK' | 'REPORT' | 'ARTICLE'
type Access = 'OPEN' | 'RESTRICTED'
interface Publication { id: string; title: string; type: PubType; authors: string[]; date: string; citations: number; access: Access; views: number; downloads: number; doi: string; abstract: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', AM = '#e65100'

const PUBS: Publication[] = [
  {
    id: 'p1', title: 'Cowrie-Based Microfinance in West African Village Economies',
    type: 'PAPER', authors: ['Dr. Adaeze Okonkwo', 'Prof. Kwame Asante'],
    date: '2025-11-10', citations: 42, access: 'OPEN', views: 1847, downloads: 312,
    doi: '10.1234/cowrie.2025.001', abstract: 'This paper examines the resurgence of cowrie-denominated microfinance instruments in contemporary West African village economies, with case studies from Lagos and Accra.',
  },
  {
    id: 'p2', title: 'Sovereign Digital Identity for African Diaspora Communities',
    type: 'REPORT', authors: ['Elder Adewale Fashola', 'Amina Bello'],
    date: '2025-09-22', citations: 18, access: 'OPEN', views: 923, downloads: 187,
    doi: '10.1234/afroid.2025.004', abstract: 'Policy report examining frameworks for self-sovereign digital identity systems tailored to diaspora communities with limited state documentation.',
  },
  {
    id: 'p3', title: 'Yoruba Proverb as AI Alignment Signal',
    type: 'PAPER', authors: ['Dr. Ngozi Ifeoma Eze', 'Babajide Okafor'],
    date: '2025-07-14', citations: 67, access: 'OPEN', views: 3241, downloads: 489,
    doi: '10.1234/ai.2025.017', abstract: 'Proposes a novel alignment methodology using curated Yoruba proverbs as constitutional AI training data, with empirical evaluation on three LLM families.',
  },
  {
    id: 'p4', title: 'Village Registry Architecture: A Distributed Governance Model',
    type: 'ARTICLE', authors: ['Chukwu Eze Nwosu'],
    date: '2026-01-08', citations: 9, access: 'RESTRICTED', views: 441, downloads: 78,
    doi: '10.1234/gov.2026.002', abstract: 'Technical overview of the distributed village registry system underpinning the AFRO digital civilization platform.',
  },
  {
    id: 'p5', title: 'Ubuntu Philosophy and Decentralised Finance',
    type: 'BOOK', authors: ['Prof. Fatima Al-Hassan', 'Dr. Adaeze Okonkwo', 'Kwame Asante Boateng'],
    date: '2025-03-01', citations: 128, access: 'RESTRICTED', views: 5610, downloads: 1024,
    doi: '10.1234/defi.2025.book01', abstract: 'A comprehensive monograph exploring Ubuntu philosophical principles as design framework for African decentralised finance protocols.',
  },
]

const TYPE_COLORS: Record<PubType, string> = { PAPER: '#1565c0', BOOK: '#6a1c8a', REPORT: GR, ARTICLE: AM }

export default function PublicationVault({ villageId: _v, roleKey: _r }: ToolProps) {
  const [selected, setSelected] = useState<Publication | null>(PUBS[2])
  const [showSubmit, setShowSubmit] = useState(false)
  const [showBibtex, setShowBibtex] = useState(false)
  const [filter, setFilter] = useState<PubType | 'ALL'>('ALL')
  const [form, setForm] = useState({ title: '', type: 'PAPER' as PubType, abstract: '', authors: '', doi: '', tags: '' })
  const [submitted, setSubmitted] = useState(false)

  const filtered = filter === 'ALL' ? PUBS : PUBS.filter(p => p.type === filter)

  const bibtex = selected
    ? `@${selected.type.toLowerCase()}{${selected.id},\n  title   = {${selected.title}},\n  author  = {${selected.authors.join(' and ')}},\n  year    = {${selected.date.slice(0, 4)}},\n  doi     = {${selected.doi}}\n}`
    : ''

  const submit = () => {
    if (!form.title) return
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setShowSubmit(false) }, 2000)
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>📚 Publication Vault</h2>

      {/* Top Cited */}
      <div style={{ background: CARD, border: `1px solid ${GR}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: GR, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>MOST CITED</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{PUBS[4].title}</div>
        <div style={{ fontSize: 12, color: MT, marginBottom: 8 }}>{PUBS[4].authors.join(', ')}</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: '#ffe0b2' }}>⭐ {PUBS[4].citations} citations</span>
          <span style={{ color: MT }}>👁 {PUBS[4].views.toLocaleString()} views</span>
          <span style={{ color: MT }}>⬇️ {PUBS[4].downloads.toLocaleString()} downloads</span>
        </div>
      </div>

      {/* Actions Row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setShowSubmit(v => !v)} style={{ flex: 1, padding: 10, background: GR, border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Submit Publication
        </button>
        <button onClick={() => setShowBibtex(v => !v)} disabled={!selected} style={{ flex: 1, padding: 10, background: CARD, border: `1px solid ${BD}`, borderRadius: 9, color: TX, fontSize: 12, cursor: 'pointer' }}>
          📎 Export Citation
        </button>
      </div>

      {/* BibTeX */}
      {showBibtex && selected && (
        <div style={{ background: '#020705', border: `1px solid ${BD}`, borderRadius: 10, padding: 12, marginBottom: 14, fontFamily: 'monospace', fontSize: 12, color: '#a5d6a7', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {bibtex}
        </div>
      )}

      {/* Submit Form */}
      {showSubmit && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          {submitted
            ? <div style={{ textAlign: 'center', padding: 14, color: '#a5d6a7' }}>✅ Submitted for review!</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>TITLE</div>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Publication title"
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>TYPE</div>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PubType }))}
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }}>
                      {(['PAPER', 'BOOK', 'REPORT', 'ARTICLE'] as PubType[]).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>DOI / URL</div>
                    <input value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.XXXX/..."
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>CO-AUTHORS</div>
                  <input value={form.authors} onChange={e => setForm(f => ({ ...f, authors: e.target.value }))} placeholder="Author 1, Author 2..."
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>ABSTRACT</div>
                  <textarea value={form.abstract} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} rows={3} placeholder="Brief abstract..."
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: 9, color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <button onClick={submit} style={{ padding: 10, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Submit
                </button>
              </div>
            )
          }
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
        {(['ALL', 'PAPER', 'BOOK', 'REPORT', 'ARTICLE'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 12px', border: `1px solid ${filter === f ? GR : BD}`, borderRadius: 8, background: filter === f ? '#0a2a0a' : CARD, color: filter === f ? '#a5d6a7' : MT, cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', fontWeight: filter === f ? 700 : 400 }}>
            {f}
          </button>
        ))}
      </div>

      {/* Publications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setSelected(p === selected ? null : p)}
            style={{ background: CARD, border: `1px solid ${selected?.id === p.id ? GR : BD}`, borderRadius: 12, padding: 14, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <span style={{ background: TYPE_COLORS[p.type], color: '#fff', padding: '1px 7px', borderRadius: 8, fontSize: 10, fontWeight: 700, marginRight: 6 }}>{p.type}</span>
                <span style={{ background: p.access === 'OPEN' ? GR : AM, color: '#fff', padding: '1px 7px', borderRadius: 8, fontSize: 10, fontWeight: 700 }}>{p.access}</span>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 5 }}>{p.title}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: MT, marginBottom: 6 }}>{p.authors.join(', ')} · {p.date}</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
              <span style={{ color: '#ffe0b2' }}>⭐ {p.citations}</span>
              <span style={{ color: MT }}>👁 {p.views.toLocaleString()}</span>
              <span style={{ color: MT }}>⬇️ {p.downloads}</span>
            </div>
            {selected?.id === p.id && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BD}`, fontSize: 12, color: TX, lineHeight: 1.6 }}>
                {p.abstract}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
