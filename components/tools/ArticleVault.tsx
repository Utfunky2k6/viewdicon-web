'use client'
import React, { useState, useMemo } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type ArticleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED'
type ArticleType = 'NEWS' | 'FEATURE' | 'EDITORIAL' | 'OPINION' | 'INVESTIGATION'
type Filter = 'ALL' | 'DRAFT' | 'PUBLISHED'

interface Article {
  id: string; title: string; type: ArticleType; status: ArticleStatus; wordCount: number; views?: number; date: string; tags: string[]; content: string
}

const INIT_ARTICLES: Article[] = [
  { id: 'a1', title: 'Cowrie Economy Grows 34% in Q1 2026', type: 'NEWS', status: 'PUBLISHED', wordCount: 824, views: 12450, date: '2026-03-24', tags: ['economy', 'cowrie'], content: 'The Cowrie digital economy has seen remarkable growth...' },
  { id: 'a2', title: 'Village Sovereignty: A New Model for Digital Communities', type: 'FEATURE', status: 'PUBLISHED', wordCount: 2100, views: 45200, date: '2026-03-20', tags: ['sovereignty', 'villages', 'analysis'], content: 'In an age of platform monopolies...' },
  { id: 'a3', title: 'Griot AI vs Western AI Models: A Comparison', type: 'EDITORIAL', status: 'REVIEW', wordCount: 1580, date: '2026-03-25', tags: ['ai', 'griot', 'technology'], content: 'The release of Griot AI marks...' },
  { id: 'a4', title: 'Ajo Circles and Traditional Savings Culture', type: 'OPINION', status: 'PUBLISHED', wordCount: 950, views: 8900, date: '2026-03-18', tags: ['ajo', 'savings', 'culture'], content: 'Before mobile banking, communities...' },
  { id: 'a5', title: 'Inside the Cold Chain Crisis in West Africa', type: 'INVESTIGATION', status: 'DRAFT', wordCount: 3200, date: '2026-03-26', tags: ['food', 'infrastructure', 'investigation'], content: 'Tonnes of produce rot every week...' },
]

const typeColor: Record<ArticleType, string> = { NEWS: blue, FEATURE: green, EDITORIAL: gold, OPINION: amber, INVESTIGATION: red }
const statusColor: Record<ArticleStatus, string> = { DRAFT: muted, REVIEW: amber, PUBLISHED: green }

export default function ArticleVault({ villageId, roleKey }: ToolProps) {
  const [articles, setArticles] = useState<Article[]>(INIT_ARTICLES)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'NEWS' as ArticleType, content: '', tags: '' })
  const [tagInput, setTagInput] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [ref, setRef] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const filtered = useMemo(() => articles.filter(a => {
    if (filter === 'DRAFT') return a.status === 'DRAFT'
    if (filter === 'PUBLISHED') return a.status === 'PUBLISHED'
    return true
  }), [articles, filter])

  const totalViews = articles.filter(a => a.views).reduce((s, a) => s + (a.views || 0), 0)
  const published = articles.filter(a => a.status === 'PUBLISHED').length

  const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

  const submitReview = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'REVIEW', date: new Date().toISOString().slice(0, 10) } : a))
    flash('Submitted for editorial review')
  }

  const createArticle = () => {
    if (!form.title) return
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const art: Article = { id: `a${Date.now()}`, title: form.title, type: form.type, status: 'DRAFT', wordCount: wordCount(form.content), date: new Date().toISOString().slice(0, 10), tags, content: form.content }
    setArticles(prev => [...prev, art]); setShowNew(false); setForm({ title: '', type: 'NEWS', content: '', tags: '' })
    flash('Article created as Draft')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Article Vault</div>
          <div style={{ color: muted, fontSize: 12 }}>Chidi Okafor — Senior Correspondent</div>
        </div>
        <button onClick={() => setShowNew(s => !s)} style={btn(gold)}>+ New Article</button>
      </div>

      {/* Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Total Articles', value: articles.length, color: text },
          { label: 'Published', value: published, color: green },
          { label: 'Total Views', value: totalViews.toLocaleString(), color: gold },
        ].map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: muted }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '8px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: muted }}>Avg Read Time</span><span style={{ color: gold }}>4.2 min</span>
        <span style={{ color: muted }}>Review Queue</span><span style={{ color: amber }}>{articles.filter(a => a.status === 'REVIEW').length} articles</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['ALL', 'DRAFT', 'PUBLISHED'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', borderRadius: 20, border: `2px solid ${filter === f ? green : border}`, background: filter === f ? green + '22' : 'none', color: filter === f ? green : muted, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>{f}</button>
        ))}
      </div>

      {/* Articles */}
      {filtered.map(a => (
        <div key={a.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{a.wordCount} words · {a.date} {a.views ? `· ${a.views.toLocaleString()} views` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: typeColor[a.type], background: typeColor[a.type] + '22', padding: '2px 6px', borderRadius: 6 }}>{a.type}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: statusColor[a.status], background: statusColor[a.status] + '22', padding: '2px 6px', borderRadius: 6 }}>{a.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {a.tags.map(t => <span key={t} style={{ fontSize: 9, background: '#1e3a20', borderRadius: 8, padding: '1px 5px', color: muted }}>{t}</span>)}
            </div>
          </div>

          {expanded === a.id && (
            <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${border}` }}>
              <div style={{ fontSize: 12, color: muted, padding: '8px 0', lineHeight: 1.5 }}>{a.content}</div>

              {/* Citation manager */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: muted, fontWeight: 700, marginBottom: 4 }}>CITATION MANAGER</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input placeholder="Add reference (URL, book, source...)" value={ref} onChange={e => setRef(e.target.value)} style={{ ...inp, flex: 1, fontSize: 11 }} />
                  <button onClick={() => { flash('Reference added'); setRef('') }} style={{ ...btn(muted), background: 'none', border: `1px solid ${border}`, color: muted, fontSize: 10 }}>Add</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {a.status === 'DRAFT' && (
                  <button onClick={() => submitReview(a.id)} style={btn(amber)}>Submit for Review</button>
                )}
                {a.status === 'REVIEW' && <span style={{ color: amber, fontSize: 12 }}>⏳ Awaiting editorial review</span>}
                {a.status === 'PUBLISHED' && <span style={{ color: green, fontSize: 12 }}>✓ Published · {a.views?.toLocaleString()} views</span>}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New article form */}
      {showNew && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginTop: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>New Article</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input placeholder="Article title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ArticleType }))} style={inp}>
              {(['NEWS', 'FEATURE', 'EDITORIAL', 'OPINION', 'INVESTIGATION'] as ArticleType[]).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={inp} />
            <div style={{ position: 'relative' }}>
              <textarea placeholder="Write your article..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ ...inp, minHeight: 120, resize: 'vertical', paddingBottom: 24 }} />
              <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 10, color: muted }}>{wordCount(form.content)} words</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={createArticle} style={btn(gold)}>Save as Draft</button>
            <button onClick={() => setShowNew(false)} style={{ ...btn(muted), background: 'none', color: muted, border: `1px solid ${border}` }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
