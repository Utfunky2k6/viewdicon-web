'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const blue = '#5b9bd5'
const purple = '#9b7fd4'
const red = '#e05a4e'

type WorkType = 'All' | 'Visual' | 'Music' | 'Design' | 'Video' | 'Fashion'

interface PortfolioItem {
  id: string
  title: string
  client: string
  type: Exclude<WorkType, 'All'>
  views: number
  gradient: string
  featured?: boolean
}

const typeColor: Record<Exclude<WorkType, 'All'>, string> = {
  Visual:  green,
  Music:   gold,
  Design:  blue,
  Video:   red,
  Fashion: purple,
}

const ITEMS: PortfolioItem[] = [
  { id: 'p1', title: 'Adire Collection Lookbook',    client: 'Ngozi Fabrics',       type: 'Fashion', views: 2847, gradient: 'linear-gradient(135deg,#4caf7d,#c9a84c)', featured: true },
  { id: 'p2', title: 'Village Market Documentary',   client: 'Onitsha Council',     type: 'Video',   views: 1940, gradient: 'linear-gradient(135deg,#e05a4e,#c9a84c)' },
  { id: 'p3', title: 'Harvest Festival Beats',       client: 'Self',                type: 'Music',   views: 3210, gradient: 'linear-gradient(135deg,#c9a84c,#9b7fd4)' },
  { id: 'p4', title: 'AfroFin Brand Identity',       client: 'AfroFin Ltd',         type: 'Design',  views: 892,  gradient: 'linear-gradient(135deg,#5b9bd5,#4caf7d)' },
  { id: 'p5', title: 'Kente Weave Photography',      client: 'Kwame Arts',          type: 'Visual',  views: 1540, gradient: 'linear-gradient(135deg,#9b7fd4,#e05a4e)' },
  { id: 'p6', title: 'Talking Drum x Piano EP',      client: 'Self',                type: 'Music',   views: 4120, gradient: 'linear-gradient(135deg,#c9a84c,#e05a4e)' },
  { id: 'p7', title: 'Village App UI Kit',           client: 'Viewdicon',           type: 'Design',  views: 720,  gradient: 'linear-gradient(135deg,#5b9bd5,#9b7fd4)' },
  { id: 'p8', title: 'Ankara Street Style Reel',     client: 'Fatima Diallo',       type: 'Fashion', views: 2200, gradient: 'linear-gradient(135deg,#4caf7d,#5b9bd5)' },
  { id: 'p9', title: 'Sunset Compound Series',       client: 'Self',                type: 'Visual',  views: 1080, gradient: 'linear-gradient(135deg,#e05a4e,#9b7fd4)' },
  { id: 'p10', title: 'Market Day Mini-Doc',         client: 'Amina Bello Events',  type: 'Video',   views: 860,  gradient: 'linear-gradient(135deg,#c9a84c,#4caf7d)' },
]

export default function Portfolio({ villageId, roleKey }: ToolProps) {
  const [filter, setFilter] = useState<WorkType>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [items, setItems] = useState<PortfolioItem[]>(ITEMS)
  const [copied, setCopied] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newClient, setNewClient] = useState('')
  const [newType, setNewType] = useState<Exclude<WorkType, 'All'>>('Visual')
  const [newDesc, setNewDesc] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const visible = filter === 'All' ? items : items.filter(i => i.type === filter)
  const featured = items.find(i => i.featured) || items[0]
  const totalViews = items.reduce((s, i) => s + i.views, 0)

  function addItem() {
    if (!newTitle) return
    const gradients = [
      'linear-gradient(135deg,#4caf7d,#c9a84c)',
      'linear-gradient(135deg,#5b9bd5,#9b7fd4)',
      'linear-gradient(135deg,#e05a4e,#4caf7d)',
    ]
    setItems(prev => [{
      id: 'p' + Date.now(),
      title: newTitle,
      client: newClient || 'Self',
      type: newType,
      views: 0,
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    }, ...prev])
    setShowAdd(false)
    setNewTitle(''); setNewClient(''); setNewDesc(''); setNewUrl('')
  }

  function copyUrl() {
    navigator.clipboard?.writeText('https://viewdicon.com/@adaeze.creates').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>CREATIVE PORTFOLIO</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>My Work</div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['Items', items.length.toString()], ['Total Views', totalViews.toLocaleString()], ['Inquiries', '34']].map(([l, v]) => (
          <div key={l} style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: muted }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: l === 'Inquiries' ? gold : text }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Public URL */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: muted }}>viewdicon.com/<span style={{ color: green }}>@adaeze.creates</span></span>
        <button onClick={copyUrl} style={{ border: 'none', background: copied ? green + '33' : border, color: copied ? green : muted, borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
        {(['All', 'Visual', 'Music', 'Design', 'Video', 'Fashion'] as WorkType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${filter === f ? (typeColor[f as Exclude<WorkType, 'All'>] || green) : border}`,
              background: filter === f ? (typeColor[f as Exclude<WorkType, 'All'>] || green) + '22' : bg,
              color: filter === f ? (typeColor[f as Exclude<WorkType, 'All'>] || green) : muted,
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >{f}</button>
        ))}
      </div>

      {/* Featured work */}
      {filter === 'All' && featured && (
        <div style={{ background: card, border: `1px solid ${gold}44`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: gold, marginBottom: 8 }}>⭐ Featured Work</div>
          <div style={{ height: 120, borderRadius: 10, background: featured.gradient, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 36 }}>🎨</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{featured.title}</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Client: {featured.client}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ fontSize: 11, color: typeColor[featured.type], fontWeight: 700 }}>{featured.type}</div>
            <div style={{ fontSize: 12, color: muted }}>{featured.views.toLocaleString()} views</div>
          </div>
        </div>
      )}

      {/* Portfolio grid 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {visible.filter(i => !i.featured || filter !== 'All').map(item => (
          <div key={item.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 80, background: item.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {item.type === 'Music' ? '🎵' : item.type === 'Video' ? '🎬' : item.type === 'Fashion' ? '👗' : item.type === 'Design' ? '🎨' : '📷'}
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
              <div style={{ fontSize: 10, color: muted, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.client}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: typeColor[item.type], background: typeColor[item.type] + '22', borderRadius: 6, padding: '2px 6px' }}>{item.type}</div>
                <div style={{ fontSize: 10, color: muted }}>{item.views.toLocaleString()} views</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowAdd(true)} style={{ width: '100%', background: green, color: '#000', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        + Add Work
      </button>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Work</div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
            <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="Client (or Self)" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {(['Visual', 'Music', 'Design', 'Video', 'Fashion'] as Exclude<WorkType, 'All'>[]).map(t => (
                <button key={t} onClick={() => setNewType(t)} style={{ padding: '6px 12px', border: `1px solid ${newType === t ? typeColor[t] : border}`, borderRadius: 20, background: newType === t ? typeColor[t] + '22' : 'transparent', color: newType === t ? typeColor[t] : muted, cursor: 'pointer', fontSize: 12 }}>{t}</button>
              ))}
            </div>
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brief description" rows={2} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 10px', color: text, fontSize: 13, resize: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Work URL (optional)" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px', color: text, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12, border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={addItem} style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: green, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Add to Portfolio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
