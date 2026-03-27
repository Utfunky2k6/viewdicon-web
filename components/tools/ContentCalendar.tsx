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
const red = '#e05a4e'
const blue = '#5b9bd5'
const purple = '#9b7fd4'
const orange = '#d4813a'

type PostType = 'DRUM' | 'REEL' | 'ARTICLE' | 'ORACLE' | 'LIVE' | null

const TYPE_META: Record<Exclude<PostType, null>, { emoji: string; label: string; color: string }> = {
  DRUM:    { emoji: '🥁', label: 'Drum',    color: gold },
  REEL:    { emoji: '🎬', label: 'Reel',    color: '#e05a4e' },
  ARTICLE: { emoji: '📝', label: 'Article', color: blue },
  ORACLE:  { emoji: '🗣', label: 'Oracle',  color: purple },
  LIVE:    { emoji: '🔴', label: 'Live',    color: red },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['Morning', 'Afternoon', 'Evening']

interface Slot {
  type: PostType
  title?: string
}

const INITIAL_GRID: Record<string, Slot> = {
  'Mon-Morning':    { type: 'DRUM',    title: 'Market Monday Recap' },
  'Mon-Evening':    { type: 'LIVE',    title: 'Live Q&A Session' },
  'Tue-Afternoon':  { type: 'ARTICLE', title: 'Village Trade Guide' },
  'Wed-Morning':    { type: 'REEL',    title: 'Product Showcase Reel' },
  'Wed-Evening':    { type: 'DRUM',    title: 'Wednesday Wisdom' },
  'Thu-Afternoon':  { type: 'ORACLE',  title: 'Griot AI Digest' },
  'Thu-Evening':    { type: 'LIVE',    title: 'Prime Time Live' },
  'Fri-Morning':    { type: 'REEL',    title: 'Friday Fashion Drop' },
  'Fri-Evening':    { type: 'ORACLE',  title: 'End of Week Oracle' },
  'Sat-Morning':    { type: 'ARTICLE', title: 'Weekend Deep Dive' },
  'Sat-Afternoon':  { type: 'REEL',    title: 'Market Showcase' },
  'Sun-Evening':    { type: 'DRUM',    title: 'Sunday Reflections' },
}

export default function ContentCalendar({ villageId, roleKey }: ToolProps) {
  const [grid, setGrid] = useState<Record<string, Slot>>(INITIAL_GRID)
  const [showAdd, setShowAdd] = useState(false)
  const [addDay, setAddDay] = useState(DAYS[0])
  const [addSlot, setAddSlot] = useState(SLOTS[0])
  const [addType, setAddType] = useState<Exclude<PostType, null>>('DRUM')
  const [addCaption, setAddCaption] = useState('')

  const published = Object.values(grid).filter(s => s.type).length
  const scheduled = published

  function addPost() {
    const key = `${addDay}-${addSlot}`
    setGrid(g => ({ ...g, [key]: { type: addType, title: addCaption || `${TYPE_META[addType].label} Post` } }))
    setShowAdd(false)
    setAddCaption('')
  }

  const topPost = { title: 'Live Q&A Session', type: 'LIVE', views: 1847, engagement: '9.2%' }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>CONTENT CALENDAR</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>This Week's Schedule</div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: muted }}>Scheduled</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{scheduled}</div>
        </div>
        <div style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: muted }}>Published</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: green }}>8</div>
        </div>
        <div style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: muted }}>Drafts</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: gold }}>3</div>
        </div>
      </div>

      {/* Week grid */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 12, marginBottom: 20, overflowX: 'auto' }}>
        <div style={{ minWidth: 420 }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            <div />
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: muted, fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          {/* Slot rows */}
          {SLOTS.map(slot => (
            <div key={slot} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: muted, display: 'flex', alignItems: 'center', paddingRight: 4 }}>{slot}</div>
              {DAYS.map(day => {
                const key = `${day}-${slot}`
                const s = grid[key]
                const meta = s?.type ? TYPE_META[s.type] : null
                return (
                  <div
                    key={key}
                    onClick={() => { setAddDay(day); setAddSlot(slot); setShowAdd(true) }}
                    style={{
                      minHeight: 36, borderRadius: 6, cursor: 'pointer',
                      background: meta ? meta.color + '22' : border + '44',
                      border: `1px solid ${meta ? meta.color + '55' : border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '2px 3px',
                    }}
                    title={s?.title || 'Empty slot — click to add'}
                  >
                    {meta ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12 }}>{meta.emoji}</div>
                        <div style={{ fontSize: 8, color: meta.color }}>{meta.label}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: border }}>+</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Top post this week */}
      <div style={{ background: card, border: `1px solid ${gold}44`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: gold, marginBottom: 6 }}>🏆 Top Post This Week</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{topPost.title}</div>
            <div style={{ fontSize: 12, color: muted }}>🔴 Live Stream · Thursday Evening</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: gold }}>{topPost.views.toLocaleString()} views</div>
            <div style={{ fontSize: 12, color: green }}>{topPost.engagement} engagement</div>
          </div>
        </div>
      </div>

      {/* AI suggestion */}
      <div style={{ background: '#0f1a1f', border: `1px solid ${blue}44`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: blue }}>🦅 Griot AI Insight</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Best time to post: <strong>Thursday 7–9pm</strong> — your audience is most active (+47% vs average)</div>
      </div>

      <button
        onClick={() => setShowAdd(true)}
        style={{ width: '100%', background: green, color: '#000', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
        + Add Post
      </button>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Content</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setAddDay(d)} style={{ flex: 1, padding: '5px 0', border: `1px solid ${addDay === d ? green : border}`, borderRadius: 6, background: addDay === d ? green + '22' : 'transparent', color: addDay === d ? green : muted, cursor: 'pointer', fontSize: 10 }}>{d}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {SLOTS.map(s => (
                <button key={s} onClick={() => setAddSlot(s)} style={{ flex: 1, padding: '7px 0', border: `1px solid ${addSlot === s ? gold : border}`, borderRadius: 6, background: addSlot === s ? gold + '22' : 'transparent', color: addSlot === s ? gold : muted, cursor: 'pointer', fontSize: 11 }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {(Object.keys(TYPE_META) as Exclude<PostType, null>[]).map(t => {
                const m = TYPE_META[t]
                return (
                  <button key={t} onClick={() => setAddType(t)} style={{ padding: '6px 12px', border: `1px solid ${addType === t ? m.color : border}`, borderRadius: 20, background: addType === t ? m.color + '22' : 'transparent', color: addType === t ? m.color : muted, cursor: 'pointer', fontSize: 12 }}>{m.emoji} {m.label}</button>
                )
              })}
            </div>
            <textarea value={addCaption} onChange={e => setAddCaption(e.target.value)} placeholder="Caption / title" rows={2} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 10px', color: text, fontSize: 13, resize: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12, border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={addPost} style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: green, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Schedule Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
