'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { loveWorldApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

// ═══════════════════════════════════════════════════════════════════════
// LOVE WORLD — MATCHES LIST
// Route: /dashboard/love/matches
// ═══════════════════════════════════════════════════════════════════════

type MatchStatus = 'ACTIVE' | 'COMPLETED' | 'DECLINED' | 'PENDING'
type StationKey = 'CULTURAL_WALL' | 'GUIDED_CHAT' | 'VIRTUAL_DATES' | 'NONE'

interface MatchPartner {
  afroId: string
  displayName: string
  heritage: string
  photoUrl?: string
}

interface MatchItem {
  id: string
  partner: MatchPartner
  matchScore: number
  status: MatchStatus
  currentStation: StationKey
  stationDeadline?: string
  createdAt: string
  updatedAt: string
}

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'DECLINED', label: 'Declined' },
]

const STATION_CONFIG: Record<StationKey, { label: string; color: string; bg: string }> = {
  CULTURAL_WALL: { label: 'Cultural Wall', color: '#D4AF37', bg: 'rgba(212,175,55,.15)' },
  GUIDED_CHAT:   { label: 'Guided Chat',   color: '#60a5fa', bg: 'rgba(96,165,250,.15)' },
  VIRTUAL_DATES: { label: 'Virtual Dates',  color: '#c084fc', bg: 'rgba(192,132,252,.15)' },
  NONE:          { label: 'Pending',         color: '#888',    bg: 'rgba(136,136,136,.12)' },
}

const STATUS_COLORS: Record<MatchStatus, string> = {
  ACTIVE: '#00C853',
  COMPLETED: '#D4AF37',
  DECLINED: '#FF3B30',
  PENDING: '#888',
}

function getInitial(name: string): string {
  return (name?.[0] ?? '?').toUpperCase()
}

function hashColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 45%)`
}

function timeRemaining(deadline?: string): string | null {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h left`
  const mins = Math.floor(diff / 60_000)
  return `${mins}m left`
}

export default function MatchesListPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [matches, setMatches] = React.useState<MatchItem[]>([])
  const [filter, setFilter] = React.useState('all')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const statusParam = filter === 'all' ? undefined : filter
        const res = await loveWorldApi.getMatches(statusParam)
        if (!cancelled) setMatches(Array.isArray(res) ? res : res?.matches ?? [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load matches')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [filter])

  const filtered = filter === 'all'
    ? matches
    : matches.filter(m => m.status === filter)

  return (
    <div style={{ minHeight: '100dvh', background: '#0A0A0F', color: '#FFFFFF', fontFamily: 'monospace' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        padding: '16px 16px 0',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none', color: '#D4AF37',
            fontSize: 22, cursor: 'pointer', padding: 0, fontFamily: 'monospace',
          }}
        >
          &larr;
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
          My Matches
        </h1>
        <span style={{
          marginLeft: 'auto', fontSize: 12, color: '#888',
          background: '#1A1A25', borderRadius: 12, padding: '4px 10px',
        }}>
          {matches.length}
        </span>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, padding: '14px 16px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {FILTERS.map(f => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                border: active ? '1px solid #D4AF37' : '1px solid #333',
                background: active ? 'rgba(212,175,55,.15)' : '#111118',
                color: active ? '#D4AF37' : '#888',
                fontSize: 13,
                fontFamily: 'monospace',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .2s',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 100px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
            <div style={{
              width: 32, height: 32, border: '3px solid #333',
              borderTopColor: '#D4AF37', borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ fontSize: 13 }}>Loading matches...</div>
          </div>
        )}

        {!loading && error && (
          <div style={{
            textAlign: 'center', padding: 48, color: '#FF3B30',
            background: 'rgba(255,59,48,.08)', borderRadius: 12, marginTop: 8,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>!</div>
            <div style={{ fontSize: 14 }}>{error}</div>
            <button
              onClick={() => setFilter(filter)}
              style={{
                marginTop: 14, padding: '8px 20px', borderRadius: 8,
                border: '1px solid #FF3B30', background: 'none',
                color: '#FF3B30', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: 60, color: '#666',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>&#9829;</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No matches yet
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>
              Check your queue for new match candidates!
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(match => {
              const station = STATION_CONFIG[match.currentStation] ?? STATION_CONFIG.NONE
              const remaining = match.status === 'ACTIVE' ? timeRemaining(match.stationDeadline) : null
              const initial = getInitial(match.partner.displayName)
              const circleColor = hashColor(match.partner.afroId || match.partner.displayName)

              return (
                <button
                  key={match.id}
                  onClick={() => router.push(`/dashboard/love/matches/${match.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 14, borderRadius: 14,
                    background: '#111118', border: '1px solid #222',
                    cursor: 'pointer', textAlign: 'left',
                    width: '100%', fontFamily: 'monospace',
                    transition: 'border-color .2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = '#D4AF37')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = '#222')}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: circleColor, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: '#fff',
                  }}>
                    {initial}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                        {match.partner.displayName}
                      </span>
                      <span style={{
                        fontSize: 11, color: STATUS_COLORS[match.status],
                        fontWeight: 600,
                      }}>
                        {match.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 5 }}>
                      {match.partner.heritage || 'Heritage unknown'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {/* Station badge */}
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 8,
                        background: station.bg, color: station.color, fontWeight: 600,
                      }}>
                        {station.label}
                      </span>
                      {/* Time remaining */}
                      {remaining && (
                        <span style={{
                          fontSize: 11, color: remaining === 'Expired' ? '#FF3B30' : '#888',
                        }}>
                          {remaining}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{
                    flexShrink: 0, textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: 20, fontWeight: 800,
                      color: match.matchScore >= 80 ? '#00C853'
                        : match.matchScore >= 60 ? '#D4AF37'
                        : '#FF3B30',
                    }}>
                      {match.matchScore}%
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>score</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
