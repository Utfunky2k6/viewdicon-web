'use client'
// ══════════════════════════════════════════════════════════════════════
// EVENTS — Browse all village events + search + filter by type
// ══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
@keyframes evFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.ev-fade{animation:evFade .3s ease both}
@keyframes liveBlip{0%,100%{opacity:1}50%{opacity:.3}}
.live-blip{animation:liveBlip 1.2s ease-in-out infinite}
`
const CSS_ID = 'events-browse-css'

const EVENT_TYPES = [
  { id:'ALL',        label:'All',        emoji:'🌍' },
  { id:'CONCERT',    label:'Concert',    emoji:'🎵' },
  { id:'FESTIVAL',   label:'Festival',   emoji:'🥁' },
  { id:'WEDDING',    label:'Wedding',    emoji:'💍' },
  { id:'MARKET',     label:'Market',     emoji:'🧺' },
  { id:'CONFERENCE', label:'Conference', emoji:'🎙' },
  { id:'SPORTS',     label:'Sports',     emoji:'⚽' },
  { id:'CEREMONY',   label:'Ceremony',   emoji:'🕯' },
  { id:'COMMUNITY',  label:'Community',  emoji:'🌳' },
]

const STATUS_COLORS: Record<string, string> = {
  LIVE: '#ef4444', DRAFT: '#6b7280', SOLD_OUT: '#f59e0b', COMPLETED: '#374151', CANCELLED: '#991b1b',
}

export interface VillageEvent {
  id: string
  title: string
  eventType: string
  date: string
  venueName: string
  villageId: string
  status: string
  coverEmoji: string
  villageEmoji: string
  villageColor: string
  village: string
  tiers: { name: string; price: number; available: number }[]
  isHospitalityTier: boolean
  drumScope: string
  description: string
}

function EventCard({ ev, onClick }: { ev: VillageEvent; onClick: () => void }) {
  const lowestPrice = Math.min(...ev.tiers.map(t => t.price))
  const totalAvail  = ev.tiers.reduce((s, t) => s + t.available, 0)
  const dateObj     = new Date(ev.date)
  const isSoldOut   = totalAvail === 0

  return (
    <div
      onClick={onClick}
      className="ev-fade"
      style={{
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
        transition: 'border-color .2s, transform .15s', marginBottom: 12,
      }}
    >
      {/* Cover */}
      <div style={{
        height: 120, background: `linear-gradient(135deg, ${ev.villageColor}22, ${ev.villageColor}08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56,
        position: 'relative', borderBottom: '1px solid rgba(255,255,255,.05)',
      }}>
        {ev.coverEmoji}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '3px 10px', borderRadius: 99, fontSize: 9, fontWeight: 800,
          background: `${STATUS_COLORS[ev.status]}25`, color: STATUS_COLORS[ev.status],
          border: `1px solid ${STATUS_COLORS[ev.status]}40`,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {ev.status === 'LIVE' && <span className="live-blip" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />}
          {ev.status}
        </div>
        {ev.drumScope === 'JOLLOF_TV' && (
          <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700, background: 'rgba(239,68,68,.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,.3)' }}>
            📺 JOLLOF TV
          </div>
        )}
        {ev.isHospitalityTier && (
          <div style={{ position: 'absolute', bottom: 8, right: 10, padding: '2px 8px', borderRadius: 99, fontSize: 8, fontWeight: 700, background: 'rgba(212,160,23,.15)', color: '#d4a017' }}>
            🏛 Hospitality Tier
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `${ev.villageColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            {ev.villageEmoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora,sans-serif', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ev.title}
            </div>
            <div style={{ fontSize: 10, color: `${ev.villageColor}` }}>{ev.village}</div>
          </div>
        </div>

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {ev.description}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
            📅 {dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>·</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>⏰ {dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>·</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }} title={ev.venueName}>📍 {ev.venueName.split(',')[0]}</span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {ev.tiers.map(t => (
            <span key={t.name} style={{
              fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
              background: t.available === 0 ? 'rgba(107,114,128,.12)' : 'rgba(74,222,128,.08)',
              color:      t.available === 0 ? '#6b7280'              : '#4ade80',
              border:     `1px solid ${t.available === 0 ? 'rgba(107,114,128,.2)' : 'rgba(74,222,128,.2)'}`,
            }}>
              {t.name}: {t.price === 0 ? 'FREE' : `🐚 ${t.price.toLocaleString()}`}
              {t.available === 0 ? ' · SOLD OUT' : ` · ${t.available} left`}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 14px 12px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: isSoldOut ? '#6b7280' : '#4ade80' }}>
          {isSoldOut ? '🎟 Sold Out — Join Waiting Compound' : `🐚 From ${lowestPrice === 0 ? 'FREE' : lowestPrice.toLocaleString()}`}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: ev.villageColor }}>View →</span>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const router = useRouter()
  const [typeFilter, setTypeFilter] = React.useState('ALL')
  const [search,     setSearch]     = React.useState('')
  const [events,     setEvents]     = React.useState<VillageEvent[]>([])
  const [loading,    setLoading]    = React.useState(true)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/events?limit=50')
        if (res.ok) {
          const data = await res.json()
          setEvents(Array.isArray(data) ? data : (data.events ?? []))
        }
      } catch {
        // backend not running — show empty state
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = events.filter(ev => {
    const matchType   = typeFilter === 'ALL' || ev.eventType === typeFilter
    const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) || ev.village.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const live   = filtered.filter(e => e.status === 'LIVE').length
  const nation = filtered.filter(e => e.drumScope === 'NATION' || e.drumScope === 'JOLLOF_TV').length

  return (
    <div style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', paddingBottom: 100 }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg,#091608 0%,#060d08 100%)', padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 900, margin: 0, background: 'linear-gradient(135deg,#4ade80,#1a7c3e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎟 Village Events
            </h1>
            <p style={{ fontSize: 11, color: 'rgba(74,222,128,.5)', margin: 0 }}>
              {loading ? 'Loading…' : `${live} live now · ${nation} nation-wide`}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/events/create')}
            style={{ padding: '10px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Sora,sans-serif', cursor: 'pointer' }}
          >
            + Create Event
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'rgba(255,255,255,.3)' }}>🔍</span>
          <input
            type="text" placeholder="Search events, villages, venues…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {EVENT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                background: typeFilter === t.id ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${typeFilter === t.id ? '#4ade80' : 'rgba(255,255,255,.08)'}`,
                color:  typeFilter === t.id ? '#4ade80' : 'rgba(255,255,255,.45)',
                transition: 'all .15s',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div style={{ padding: '12px 14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(74,222,128,.3)', borderTopColor: '#4ade80', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Loading events…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,.25)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎟</div>
            <div style={{ fontSize: 14, marginBottom: 6 }}>No events yet</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.18)' }}>Events created in villages will appear here</div>
            <button
              onClick={() => router.push('/dashboard/events/create')}
              style={{ marginTop: 16, padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(74,222,128,.3)', background: 'rgba(74,222,128,.08)', color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              + Create the First Event
            </button>
          </div>
        ) : (
          filtered.map(ev => (
            <EventCard
              key={ev.id}
              ev={ev}
              onClick={() => router.push(`/dashboard/events/${ev.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
