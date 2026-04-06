'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { sorosokeApi } from '@/lib/api'

interface KumbukaTimelineProps {
  userId: string
}

const MOCK_MEMORIES = [
  { id: 'km1', month: 'March 2026',    post: "The market women of Lagos know something the economists don't...", type: 'oracle',   heat: 'FEAST',     gbo: 847  },
  { id: 'km2', month: 'February 2026', post: 'Just sealed my 5th trade. Village Trust Seal minted. This is what we built for.', type: 'village',  heat: 'Boiling',   gbo: 412  },
  { id: 'km3', month: 'January 2026',  post: 'First sunrise of the new harvest. The farm speaks.',               type: 'personal', heat: 'Simmering', gbo: 189  },
  { id: 'km4', month: 'December 2025', post: 'The kente pattern my grandmother taught me — now verified on-chain.', type: 'village', heat: 'Boiling',   gbo: 523  },
  { id: 'km5', month: 'November 2025', post: "Why Africa's informal economy is actually its greatest strength.", type: 'oracle',   heat: 'FEAST',     gbo: 1204 },
  { id: 'km6', month: 'October 2025',  post: 'First day in the Commerce village. Three trades in 24 hours. 🌾', type: 'village',  heat: 'Ember',     gbo: 67   },
]

const MILESTONES = [
  { icon: '🌱', label: 'First Village Post', date: 'Oct 2025' },
  { icon: '🔏', label: 'Trade Seal Earned',  date: 'Feb 2026' },
  { icon: '🔥', label: 'First FEAST Post',   date: 'Nov 2025' },
  { icon: '🌳', label: 'Crest III Achieved', date: 'Jan 2026' },
]

const TYPE_COLORS: Record<string, string> = {
  oracle:   '#dc2626',
  village:  '#2563eb',
  personal: '#1a7c3e',
}

const HEAT_COLORS: Record<string, string> = {
  FEAST:     '#d97706',
  Boiling:   '#ef4444',
  Simmering: '#f59e0b',
  Ember:     '#6b7280',
}

export function KumbukaTimeline({ userId }: KumbukaTimelineProps) {
  const router = useRouter()
  const today = new Date()
  const showAncestralEcho = today.getDate() >= 15
  const [memories, setMemories] = React.useState(MOCK_MEMORIES)

  React.useEffect(() => {
    if (!userId) return
    sorosokeApi.userPosts(userId)
      .then(data => {
        const posts = (Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? []) as Array<{id:string; content?:string; type?:string; heatScore?:number; kilaCount?:number; createdAt?:string}>
        if (posts.length === 0) return
        const mapped = posts.slice(0, 6).map(p => {
          const d = p.createdAt ? new Date(p.createdAt) : new Date()
          return {
            id: p.id ?? '',
            month: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            post: p.content ?? '',
            type: p.type === 'ORACLE_SESSION' ? 'oracle' : p.type === 'VILLAGE_NOTICE' ? 'village' : 'personal',
            heat: (p.heatScore ?? 0) >= 80 ? 'FEAST' : (p.heatScore ?? 0) >= 60 ? 'Boiling' : (p.heatScore ?? 0) >= 40 ? 'Simmering' : 'Ember',
            gbo: p.kilaCount ?? 0,
          }
        })
        setMemories(mapped)
      })
      .catch(() => {}) // keep MOCK_MEMORIES on failure
  }, [userId])

  return (
    <div style={{ margin: '16px 0 0', borderTop: '1px solid rgba(255,255,255,.06)' }}>
      {/* ── Header ── */}
      <div style={{ padding: '14px 14px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(212,160,23,.15)', border: '1px solid rgba(212,160,23,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⭐</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#d4a017', letterSpacing: '.02em' }}>Kumbuka — Your Living Archive</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Your journey, one harvest at a time</div>
        </div>
      </div>

      {/* ── Ancestral Echo card (only if day >= 15) ── */}
      {showAncestralEcho && (
        <div style={{ margin: '10px 12px', background: 'linear-gradient(135deg, rgba(212,160,23,.14), rgba(212,160,23,.05))', border: '1px solid rgba(212,160,23,.35)', borderRadius: 14, padding: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: .05, pointerEvents: 'none' }}>⭐</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#d4a017', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Ancestral Echo</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>One harvest ago, on this day...</div>
          <div style={{ fontSize: 13, color: '#f5e6c0', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>
            "Why Africa's informal economy is actually its greatest strength."
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#d97706', background: 'rgba(217,119,6,.12)', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(217,119,6,.3)' }}>FEAST</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>⭐ 1,204 voices heard</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginLeft: 'auto' }}>April 2025</span>
          </div>
        </div>
      )}

      {/* ── Monthly Timeline ── */}
      <div style={{ padding: '4px 14px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.25)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          Monthly Highlights
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        {memories.map((mem, i) => {
          const typeColor = TYPE_COLORS[mem.type] ?? '#6b7280'
          const heatColor = HEAT_COLORS[mem.heat] ?? '#6b7280'
          const isLast    = i === memories.length - 1

          return (
            <div key={mem.month} style={{ display: 'flex', gap: 0, position: 'relative' }}>
              {/* Timeline line + dot column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: typeColor, border: `2px solid ${typeColor}44`, flexShrink: 0, marginTop: 12, zIndex: 1 }} />
                {!isLast && <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,.07)', minHeight: 20 }} />}
              </div>

              {/* Card */}
              <div style={{ flex: 1, marginLeft: 8, marginBottom: isLast ? 0 : 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 4, letterSpacing: '.03em' }}>{mem.month}</div>
                <div style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${typeColor}22`, borderRadius: 12, padding: '10px 12px' }}>
                  {/* Post text */}
                  <div style={{
                    fontSize: 13, color: 'rgba(255,255,255,.82)', lineHeight: 1.55,
                    marginBottom: 8,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {mem.post}
                  </div>

                  {/* Badges row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {/* Type badge */}
                    <span style={{ fontSize: 9, fontWeight: 700, color: typeColor, background: `${typeColor}14`, padding: '2px 8px', borderRadius: 99, border: `1px solid ${typeColor}33`, textTransform: 'capitalize' }}>
                      {mem.type === 'oracle' ? '🗣 Oracle' : mem.type === 'village' ? '🏘 Village' : '💬 Personal'}
                    </span>

                    {/* Heat badge */}
                    <span style={{ fontSize: 9, fontWeight: 700, color: heatColor, background: `${heatColor}12`, padding: '2px 8px', borderRadius: 99, border: `1px solid ${heatColor}2e` }}>
                      {mem.heat === 'FEAST' ? '🔥' : mem.heat === 'Boiling' ? '♨' : mem.heat === 'Simmering' ? '🌡' : '🕯'} {mem.heat}
                    </span>

                    {/* GBO count */}
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginLeft: 'auto' }}>
                      ⭐ {mem.gbo.toLocaleString()} voices heard
                    </span>
                  </div>

                  {/* View Post link */}
                  <button
                    onClick={() => router.push(`/dashboard/feed?highlight=${mem.id}`)}
                    style={{ marginTop: 8, fontSize: 9, fontWeight: 700, color: typeColor, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', opacity: .65 }}>
                    View Post →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Milestones ── */}
      <div style={{ padding: '14px 14px 4px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.25)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          Milestones
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '0 12px 20px', overflowX: 'auto' }}>
        {MILESTONES.map((ms) => (
          <div key={ms.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '10px 14px', flexShrink: 0, minWidth: 100 }}>
            <span style={{ fontSize: 22 }}>{ms.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f0f7f0', textAlign: 'center', lineHeight: 1.3 }}>{ms.label}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{ms.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
