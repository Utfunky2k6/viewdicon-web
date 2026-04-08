'use client'
// ─────────────────────────────────────────────────────────────
// RightPanel — Desktop only (1440px+)
// Widgets: Zeus AI quick chat · Activity · Upcoming Events ·
//          Village Suggestions · Messages preview
// ─────────────────────────────────────────────────────────────
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GyeNyame } from '@/components/ui/afro-icons'
import { useAuthStore } from '@/stores/authStore'

// ── Mini Zeus Chat ─────────────────────────────────────────────
function ZeusWidget() {
  const router = useRouter()
  const [msg, setMsg] = React.useState('')
  const [reply, setReply] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function ask() {
    if (!msg.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setReply(`⚡ "${msg}" — I see your intent. Visit the full oracle for deeper counsel.`)
    setMsg('')
    setLoading(false)
  }

  return (
    <div style={{ padding: '14px 16px', background: 'rgba(226,232,240,.04)', borderRadius: 16, border: '1px solid rgba(226,232,240,.1)', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1.5px solid rgba(226,232,240,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GyeNyame size={14} color="rgba(226,232,240,.9)" />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0', fontFamily: "'Sora',sans-serif" }}>Zeus AI</span>
        <button onClick={() => router.push('/dashboard/ai')} style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(226,232,240,.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>Full Oracle →</button>
      </div>
      {reply && (
        <div style={{ fontSize: 11, color: 'rgba(226,232,240,.7)', lineHeight: 1.6, marginBottom: 8, padding: '8px 10px', background: 'rgba(226,232,240,.05)', borderRadius: 10 }}>
          {reply}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Ask Zeus anything…"
          style={{
            flex: 1, padding: '7px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            color: '#f0f7f0', fontSize: 11, fontFamily: 'monospace', outline: 'none',
          }}
        />
        <button onClick={ask} disabled={loading || !msg.trim()} style={{ padding: '7px 10px', borderRadius: 8, background: loading ? 'rgba(226,232,240,.1)' : 'rgba(226,232,240,.15)', border: '1px solid rgba(226,232,240,.2)', color: '#e2e8f0', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace' }}>
          {loading ? '…' : '⚡'}
        </button>
      </div>
    </div>
  )
}

// ── Activity feed ──────────────────────────────────────────────
const ACTIVITY = [
  { icon: '🥁', text: 'Your post got 12 stirs',    time: '2m ago',  color: '#4ade80' },
  { icon: '💛', text: 'New Ufè match unlocked',     time: '18m ago', color: '#D4AF37' },
  { icon: '🔔', text: 'Village council vote open',  time: '1h ago',  color: '#f97316' },
  { icon: '💬', text: 'Chidi sent you a message',   time: '2h ago',  color: '#60a5fa' },
  { icon: '🐚', text: '250 CWR earned from tools',  time: '3h ago',  color: '#a78bfa' },
]

function ActivityWidget() {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Recent Activity</div>
      {ACTIVITY.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
          <span style={{ fontSize: 11, color: 'rgba(240,247,240,.65)', flex: 1, lineHeight: 1.4 }}>{a.text}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', flexShrink: 0 }}>{a.time}</span>
        </div>
      ))}
    </div>
  )
}

// ── Upcoming Events ────────────────────────────────────────────
const EVENTS = [
  { emoji: '🌍', title: 'Pan-Africa Summit', date: 'Today 18:00',   color: '#4ade80' },
  { emoji: '🎵', title: 'Afrobeats Night',   date: 'Tomorrow 20:00', color: '#f97316' },
  { emoji: '🏺', title: 'Heritage Ceremony', date: 'Sat 14:00',      color: '#D4AF37' },
]

function EventsWidget() {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Upcoming Events</div>
        <Link href="/dashboard/events" style={{ fontSize: 9, color: '#4ade80', textDecoration: 'none', fontFamily: 'monospace' }}>See all →</Link>
      </div>
      {EVENTS.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: `${e.color}08`, borderRadius: 10, marginBottom: 6, border: `1px solid ${e.color}20` }}>
          <span style={{ fontSize: 18 }}>{e.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,247,240,.85)' }}>{e.title}</div>
            <div style={{ fontSize: 9, color: e.color, marginTop: 1 }}>{e.date}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Village suggestions ────────────────────────────────────────
const SUGGESTIONS = [
  { emoji: '💻', name: 'Technology',  members: '4.2k', color: '#60a5fa' },
  { emoji: '🏥', name: 'Health',      members: '3.1k', color: '#4ade80' },
  { emoji: '🎨', name: 'Arts',        members: '2.8k', color: '#f472b6' },
]

function SuggestionsWidget() {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Suggested Villages</div>
      {SUGGESTIONS.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>{s.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,247,240,.85)' }}>{s.name}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{s.members} members</div>
          </div>
          <Link href={`/dashboard/villages`} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 8, background: `${s.color}15`, color: s.color, textDecoration: 'none', fontWeight: 700, border: `1px solid ${s.color}30` }}>Join</Link>
        </div>
      ))}
    </div>
  )
}

// ── Main RightPanel ────────────────────────────────────────────
export function RightPanel({ width = 280 }: { width?: number }) {
  return (
    <aside style={{
      width,
      height: '100dvh',
      background: 'var(--bg-card)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(240,247,240,.6)', fontFamily: "'Sora',sans-serif", letterSpacing: '.06em', textTransform: 'uppercase' }}>Activity</span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', scrollbarWidth: 'none' }}>
        <ZeusWidget />
        <ActivityWidget />
        <EventsWidget />
        <SuggestionsWidget />

        {/* Footer */}
        <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
            {['Privacy', 'Terms', 'About', 'Help'].map(l => (
              <span key={l} style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.15)', marginTop: 6 }}>© 2026 Afrikonnect</div>
        </div>
      </div>
    </aside>
  )
}
