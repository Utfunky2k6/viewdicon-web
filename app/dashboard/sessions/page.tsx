'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════════════
// MY SESSIONS — Tool Usage History + Active Business Sessions
// Route: /dashboard/sessions
// ═══════════════════════════════════════════════════════════════════════

type SessionStatus = 'ACTIVE' | 'NEGOTIATING' | 'LOCKED' | 'IN_TRANSIT' | 'COMPLETED' | 'DISPUTED' | 'ABANDONED'
type SessionKind = 'tool_result' | 'business_session'

interface SessionItem {
  id: string
  code: string
  title: string
  toolKey: string
  toolIcon: string
  toolName: string
  villageId: string
  villageName: string
  villageEmoji: string
  kind: SessionKind
  status: SessionStatus
  amount?: string
  counterparty?: string
  createdAt: string
  updatedAt: string
  cowrieFlow: 'earns' | 'spends' | 'neutral'
}

// ── Sessions (initially empty -- fetched from backend) ──────────────────
const INITIAL_SESSIONS: SessionItem[] = []

// ── Status config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:       { label: 'Active',      color: '#4ade80', bg: 'rgba(74,222,128,.1)' },
  NEGOTIATING:  { label: 'Negotiating', color: '#fbbf24', bg: 'rgba(251,191,36,.1)' },
  LOCKED:       { label: 'Locked',      color: '#60a5fa', bg: 'rgba(96,165,250,.1)' },
  IN_TRANSIT:   { label: 'In Transit',  color: '#c084fc', bg: 'rgba(192,132,252,.1)' },
  COMPLETED:    { label: 'Completed',   color: '#4ade80', bg: 'rgba(74,222,128,.06)' },
  DISPUTED:     { label: 'Disputed',    color: '#f87171', bg: 'rgba(248,113,113,.1)' },
  ABANDONED:    { label: 'Abandoned',   color: 'rgba(255,255,255,.3)', bg: 'rgba(255,255,255,.04)' },
}

// ── CSS ───────────────────────────────────────────────────────────────
const CSS = `
@keyframes ssFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes ssPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes ssSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
.ss-fade{animation:ssFade .35s ease both}
.ss-slide{animation:ssSlide .3s ease both}
.ss-pulse{animation:ssPulse 2s infinite}
.ss-card:active{transform:scale(.985);opacity:.9}
.ss-no-sb::-webkit-scrollbar{display:none}.ss-no-sb{scrollbar-width:none}
`

type Tab = 'all' | 'active' | 'completed' | 'business' | 'tools'

function fmt(iso: string, nowMs: number) {
  const d = new Date(iso)
  const diff = Math.floor((nowMs - d.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function SessionsPage() {
  const router = useRouter()
  const [tab, setTab] = React.useState<Tab>('all')
  const [search, setSearch] = React.useState('')
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set())
  const [nowMs, setNowMs] = React.useState(0)
  const vc = '#1a7c3e'

  React.useEffect(() => {
    setNowMs(Date.now())
  }, [])

  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('ss-css')) {
      const s = document.createElement('style'); s.id = 'ss-css'; s.textContent = CSS; document.head.appendChild(s)
    }
  }, [])

  const filtered = React.useMemo(() => {
    let list = INITIAL_SESSIONS.filter(s => !dismissed.has(s.id))
    if (tab === 'active') list = list.filter(s => ['ACTIVE', 'NEGOTIATING', 'LOCKED', 'IN_TRANSIT'].includes(s.status))
    if (tab === 'completed') list = list.filter(s => s.status === 'COMPLETED')
    if (tab === 'business') list = list.filter(s => s.kind === 'business_session')
    if (tab === 'tools') list = list.filter(s => s.kind === 'tool_result')
    if (search.trim()) list = list.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.toolName.toLowerCase().includes(search.toLowerCase()) ||
      s.villageName.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [tab, search, dismissed])

  // Stats
  const totalEarned = INITIAL_SESSIONS.filter(s => s.cowrieFlow === 'earns' && s.status === 'COMPLETED' && s.amount)
    .reduce((sum, s) => sum + parseInt((s.amount || '₡0').replace(/[₡,]/g, '')), 0)
  const active = INITIAL_SESSIONS.filter(s => ['ACTIVE', 'NEGOTIATING', 'IN_TRANSIT', 'LOCKED'].includes(s.status)).length
  const completed = INITIAL_SESSIONS.filter(s => s.status === 'COMPLETED').length

  return (
    <div style={{ minHeight: '100dvh', background: '#050a06', color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        background: 'linear-gradient(180deg,rgba(26,124,62,.08),transparent)',
        position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)',
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, fontFamily: 'Sora, sans-serif' }}>My Sessions</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Tool runs & business sessions</div>
        </div>
        <button
          onClick={() => router.push('/dashboard/villages')}
          style={{
            padding: '8px 14px', borderRadius: 10, border: 'none',
            background: `${vc}20`, color: vc, fontSize: 11, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          🛠 New Tool
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="ss-fade" style={{ display: 'flex', gap: 8, padding: '14px 16px 0' }}>
        {[
          { label: 'Total', value: String(INITIAL_SESSIONS.length), icon: '📋', color: 'rgba(255,255,255,.7)' },
          { label: 'Active', value: String(active), icon: '🔥', color: '#4ade80' },
          { label: 'Done', value: String(completed), icon: '✓', color: '#60a5fa' },
          { label: 'Earned', value: `₡${(totalEarned / 1000).toFixed(0)}K`, icon: '🐚', color: '#fbbf24' },
        ].map((st, i) => (
          <div key={i} style={{
            flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center',
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
          }}>
            <div style={{ fontSize: 14 }}>{st.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: st.color, fontFamily: 'Sora, sans-serif' }}>{st.value}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '12px 16px 0', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-25%)', fontSize: 14, color: 'rgba(255,255,255,.25)', pointerEvents: 'none' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sessions, tools, villages..."
          style={{
            width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, boxSizing: 'border-box',
            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
            color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* ── Tabs ── */}
      <div className="ss-no-sb" style={{ display: 'flex', padding: '10px 16px 0', gap: 6, overflowX: 'auto' }}>
        {([
          { id: 'all', label: 'All', count: INITIAL_SESSIONS.length },
          { id: 'active', label: '🔥 Active', count: active },
          { id: 'completed', label: '✓ Done', count: completed },
          { id: 'business', label: '🤝 Business', count: INITIAL_SESSIONS.filter(s => s.kind === 'business_session').length },
          { id: 'tools', label: '⚡ Tools', count: INITIAL_SESSIONS.filter(s => s.kind === 'tool_result').length },
        ] as { id: Tab; label: string; count: number }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: tab === t.id ? `${vc}20` : 'rgba(255,255,255,.04)',
            color: tab === t.id ? vc : 'rgba(255,255,255,.45)',
            fontSize: 11, fontWeight: 700,
            borderBottom: tab === t.id ? `2px solid ${vc}` : '2px solid transparent',
          }}>
            {t.label} <span style={{ opacity: .6 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* ── Session list ── */}
      <div style={{ padding: '12px 16px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div className="ss-fade" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f7f0', marginBottom: 6 }}>No sessions found</div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>
              {search ? `No results for "${search}"` : 'Start a new tool session from any village.'}
            </p>
            <button onClick={() => router.push('/dashboard/villages')} style={{
              marginTop: 16, padding: '12px 24px', borderRadius: 12, border: 'none',
              background: vc, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            }}>Go to Villages →</button>
          </div>
        )}

        {filtered.map((session, i) => {
          const sc = STATUS_CONFIG[session.status]
          const isActive = ['ACTIVE', 'NEGOTIATING', 'IN_TRANSIT', 'LOCKED'].includes(session.status)
          return (
            <div
              key={session.id}
              className="ss-fade ss-card"
              onClick={() => session.kind === 'business_session' ? router.push(`/dashboard/sessions/${session.id}`) : null}
              style={{
                animationDelay: `${i * 0.04}s`,
                borderRadius: 16, padding: '14px 16px',
                background: isActive
                  ? `linear-gradient(135deg, rgba(26,124,62,.06), rgba(255,255,255,.025))`
                  : 'rgba(255,255,255,.025)',
                border: `1px solid ${isActive ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.06)'}`,
                cursor: session.kind === 'business_session' ? 'pointer' : 'default',
                transition: 'all .15s',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: `rgba(26,124,62,.12)`, border: '1px solid rgba(26,124,62,.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {session.toolIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{session.villageEmoji} {session.villageName}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>·</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{session.toolName}</span>
                    </div>
                  </div>
                </div>
                {/* Status badge */}
                <span style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 800,
                  background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30`,
                  textTransform: 'uppercase', letterSpacing: '.04em', flexShrink: 0,
                }}>
                  {isActive && <span className="ss-pulse" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: sc.color, marginRight: 4, verticalAlign: 'middle' }} />}
                  {sc.label}
                </span>
              </div>

              {/* Middle row — meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                {session.code && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace', letterSpacing: '.05em' }}>{session.code}</span>
                )}
                {session.counterparty && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>👤 {session.counterparty}</span>
                )}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginLeft: 'auto' }}>{fmt(session.updatedAt, nowMs)}</span>
              </div>

              {/* Bottom row — amount + actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <div>
                  {session.amount && (
                    <span style={{ fontSize: 16, fontWeight: 900, color: session.cowrieFlow === 'earns' ? '#4ade80' : session.cowrieFlow === 'spends' ? '#f87171' : '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
                      {session.cowrieFlow === 'earns' ? '↑ ' : session.cowrieFlow === 'spends' ? '↓ ' : ''}{session.amount}
                    </span>
                  )}
                  {!session.amount && (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontStyle: 'italic' }}>
                      {session.kind === 'tool_result' ? 'Tool result' : 'No amount set'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Re-run tool */}
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/dashboard/sessions/new?tool=${session.toolKey}&village=${session.villageId}`) }}
                    style={{
                      padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)',
                      background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.55)',
                      fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    ↩ Re-run
                  </button>
                  {/* Enter session (business only) */}
                  {session.kind === 'business_session' && isActive && (
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/dashboard/sessions/${session.id}`) }}
                      style={{
                        padding: '6px 10px', borderRadius: 8, border: `1px solid ${vc}40`,
                        background: `${vc}15`, color: vc,
                        fontSize: 10, fontWeight: 800, cursor: 'pointer',
                      }}
                    >
                      🔥 Enter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Floating new session button ── */}
      <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 60 }}>
        <button
          onClick={() => router.push('/dashboard/villages')}
          style={{
            width: 54, height: 54, borderRadius: '50%', border: 'none',
            background: `linear-gradient(135deg, ${vc}, #22c55e)`,
            color: '#fff', fontSize: 22, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(26,124,62,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
