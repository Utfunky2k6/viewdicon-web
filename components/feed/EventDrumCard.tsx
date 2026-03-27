'use client'
// ============================================================
// EventDrumCard — Event Announcement in the Sòrò Sókè Feed
// Renders when post.type === 'EVENT_DRUM'
// Parses structured JSON from post.content for event details
// ============================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { Post } from './feedTypes'
import { InteractionBar } from './InteractionBar'
import { DrumScopeIndicator } from './DrumScopeIndicator'

interface EventDrumCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
}

interface EventPayload {
  __type: 'event_drum'
  eventId: string
  title: string
  eventType: string
  date: string
  venueName: string
  villageId: string
  village: string
  villageEmoji: string
  villageColor: string
  coverEmoji: string
  drumScope: 'VILLAGE' | 'NATION' | 'JOLLOF_TV'
  tiers: Array<{ name: string; price: number; available: number }>
  isHospitalityTier?: boolean
  description: string
}

const EVENT_TYPE_META: Record<string, { label: string; color: string }> = {
  CONCERT:    { label: 'Concert',    color: '#8b5cf6' },
  FESTIVAL:   { label: 'Festival',   color: '#f59e0b' },
  WEDDING:    { label: 'Wedding',    color: '#ec4899' },
  MARKET:     { label: 'Market',     color: '#d97706' },
  CONFERENCE: { label: 'Conference', color: '#3b82f6' },
  SPORTS:     { label: 'Sports',     color: '#ef4444' },
  CEREMONY:   { label: 'Ceremony',   color: '#a78bfa' },
  COMMUNITY:  { label: 'Community',  color: '#10b981' },
}

const CSS_ID = 'event-drum-card-css'
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800;900&display=swap');
@keyframes edcPulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes edcGlow{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.2)}50%{box-shadow:0 0 18px 4px rgba(74,222,128,.08)}}
.edc-live-blip{animation:edcPulse 1.3s ease-in-out infinite}
.edc-card-glow{animation:edcGlow 3s ease-in-out infinite}
`

function parseEventPayload(content: string): EventPayload | null {
  try {
    const parsed = JSON.parse(content)
    if (parsed.__type === 'event_drum') return parsed as EventPayload
    return null
  } catch {
    return null
  }
}

export function EventDrumCard({ post, onInteract }: EventDrumCardProps) {
  const router = useRouter()
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [kilaCount, setKilaCount] = React.useState(post.kilaCount)
  const [stirCount, setStirCount] = React.useState(post.stirCount)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const ev = parseEventPayload(post.content)
  if (!ev) return null

  const typeMeta  = EVENT_TYPE_META[ev.eventType] ?? { label: ev.eventType, color: '#6b7280' }
  const dateObj   = new Date(ev.date)
  const lowestPrice = Math.min(...ev.tiers.map(t => t.price))
  const totalAvail  = ev.tiers.reduce((s, t) => s + t.available, 0)
  const isSoldOut   = totalAvail === 0

  const scopeLabel = ev.drumScope === 'JOLLOF_TV' ? '📺 Global · Jollof TV'
    : ev.drumScope === 'NATION' ? '🌍 Nation-wide'
    : '🏘 Village'

  return (
    <div
      className="edc-card-glow"
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: 'rgba(255,255,255,.025)',
        border: `1.5px solid ${ev.villageColor}30`,
        marginBottom: 12,
      }}
    >
      {/* ── Drum header ─────────────────────────────────────────── */}
      <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 11,
          background: `${ev.villageColor}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          flexShrink: 0,
        }}>
          {ev.villageEmoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: post.avatarColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.author}
            <span style={{ fontWeight: 400, color: 'rgba(255,255,255,.3)' }}> drummed an event</span>
          </div>
          <div style={{ fontSize: 9, color: `${ev.villageColor}`, fontWeight: 600 }}>{ev.village} · {post.time}</div>
        </div>

        {/* Scope pill */}
        <div style={{
          fontSize: 8, fontWeight: 700, padding: '3px 8px', borderRadius: 99, flexShrink: 0,
          background: ev.drumScope === 'JOLLOF_TV' ? 'rgba(239,68,68,.15)'
            : ev.drumScope === 'NATION' ? 'rgba(74,222,128,.1)' : 'rgba(107,114,128,.12)',
          color: ev.drumScope === 'JOLLOF_TV' ? '#ef4444'
            : ev.drumScope === 'NATION' ? '#4ade80' : '#9ca3af',
          border: `1px solid ${ev.drumScope === 'JOLLOF_TV' ? 'rgba(239,68,68,.25)'
            : ev.drumScope === 'NATION' ? 'rgba(74,222,128,.2)' : 'rgba(107,114,128,.2)'}`,
        }}>
          {scopeLabel}
        </div>
      </div>

      {/* ── Event cover banner ──────────────────────────────────── */}
      <div style={{
        height: 130,
        background: `linear-gradient(135deg, ${ev.villageColor}25, ${ev.villageColor}08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 64, position: 'relative',
        borderTop: `1px solid ${ev.villageColor}20`,
        borderBottom: `1px solid ${ev.villageColor}20`,
      }}>
        {ev.coverEmoji}

        {/* Event type badge */}
        <div style={{
          position: 'absolute', top: 10, left: 12,
          padding: '3px 10px', borderRadius: 99, fontSize: 9, fontWeight: 800,
          background: `${typeMeta.color}20`, color: typeMeta.color,
          border: `1px solid ${typeMeta.color}40`, fontFamily: 'Sora,sans-serif',
        }}>
          {typeMeta.label}
        </div>

        {/* Live badge */}
        <div style={{
          position: 'absolute', top: 10, right: 12,
          padding: '3px 10px', borderRadius: 99, fontSize: 9, fontWeight: 800,
          background: 'rgba(239,68,68,.2)', color: '#ef4444',
          border: '1px solid rgba(239,68,68,.35)',
          display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Sora,sans-serif',
        }}>
          <span className="edc-live-blip" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          LIVE
        </div>

        {/* Hospitality badge */}
        {ev.isHospitalityTier && (
          <div style={{
            position: 'absolute', bottom: 8, right: 12,
            padding: '2px 8px', borderRadius: 99, fontSize: 8, fontWeight: 700,
            background: 'rgba(212,160,23,.15)', color: '#d4a017',
          }}>
            🏛 Hospitality Tier
          </div>
        )}
      </div>

      {/* ── Event body ──────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px' }}>
        {/* Title */}
        <h3 style={{
          fontFamily: 'Sora,sans-serif', fontSize: 16, fontWeight: 900,
          color: '#f0f7f0', margin: '0 0 4px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {ev.title}
        </h3>

        {/* Date + Venue */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>
            📅 {dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>·</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>
            ⏰ {dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>·</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>
            📍 {ev.venueName.split(',')[0]}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.55, margin: '0 0 10px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {ev.description}
        </p>

        {/* Ticket tiers */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
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

        {/* CTA row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => router.push(`/dashboard/events/${ev.eventId}`)}
            style={{
              flex: 2, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: isSoldOut
                ? 'rgba(107,114,128,.15)'
                : `linear-gradient(135deg, ${ev.villageColor}cc, ${ev.villageColor}88)`,
              color: isSoldOut ? '#6b7280' : '#fff',
              fontSize: 12, fontWeight: 800, fontFamily: 'Sora,sans-serif',
            }}
          >
            {isSoldOut
              ? '⏳ Join Waiting Compound'
              : `🎟 Get Tickets — ${lowestPrice === 0 ? 'FREE' : `from 🐚 ${lowestPrice.toLocaleString()}`}`}
          </button>
          <button
            onClick={() => router.push(`/dashboard/events/${ev.eventId}`)}
            style={{
              flex: 1, padding: '11px', borderRadius: 12,
              border: `1px solid ${ev.villageColor}40`,
              background: 'none', color: ev.villageColor,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Info →
          </button>
        </div>
      </div>

      {/* ── Drum scope + interaction bar ────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '8px 10px 4px' }}>
        <DrumScopeIndicator scope={post.drumScope} />
        <InteractionBar
          post={{ ...post, kilaCount, stirCount }}
          kilaed={kilaed}
          stirred={stirred}
          onKila={() => {
            if (kilaed) return
            setKilaed(true); setKilaCount(c => c + 1)
            onInteract?.('kila', post.id)
          }}
          onStir={() => {
            setStirred(true); setStirCount(c => c + 1)
            onInteract?.('stir', post.id)
          }}
          onDrum={() => onInteract?.('drum', post.id)}
          onGriotAsk={() => onInteract?.('griotAsk', post.id)}
        />
      </div>
    </div>
  )
}
