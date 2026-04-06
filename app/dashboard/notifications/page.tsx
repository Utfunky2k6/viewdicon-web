'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime } from '@/lib/utils'

// Notification types (Talking Drum system)
// TALKING_DRUM  — broadcast alerts (urgent)
// GRIOT_WHISPER — soft mention/tag
// KOLANUT_CALL  — connection request/invitation

type NotifType =
  | 'TALKING_DRUM'
  | 'GRIOT_WHISPER'
  | 'KOLANUT_CALL'
  | 'KILA'
  | 'MWANGA'
  | 'KALABASH'
  | 'VILLAGE_INVITE'
  | 'RANK_UP'

interface Notif {
  id: string
  type: NotifType
  actor: string
  content: string
  at: string
  isRead: boolean
  href?: string
}

// Mock notifications shown while backend is loading or unavailable
const MOCK_NOTIFS: Notif[] = [
  { id: 'm1', type: 'KILA',          actor: 'Adaeze Okonkwo',    content: 'gave you 25 Kíla for your post in Commerce Village.',       at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),   isRead: false },
  { id: 'm2', type: 'GRIOT_WHISPER', actor: 'Kwame Asante',      content: 'mentioned you in a post: "@you should see this market!"',  at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),  isRead: false },
  { id: 'm3', type: 'TALKING_DRUM',  actor: 'Village Council',   content: 'announced a new market day — tomorrow at dawn.',            at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),  isRead: false },
  { id: 'm4', type: 'KOLANUT_CALL',  actor: 'Fatima Al-Rashid',  content: 'sent you a connection request.',                            at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), isRead: false },
  { id: 'm5', type: 'RANK_UP',       actor: 'Your Village',      content: 'Your crest has advanced to Crest II. New tools unlocked.', at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), isRead: true },
  { id: 'm6', type: 'MWANGA',        actor: 'Blessing Okafor',   content: 'planted a Paid Root in your Jollof TV channel.',           at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), isRead: true },
  { id: 'm7', type: 'KALABASH',      actor: 'Sipho Dlamini',     content: 'sprayed 200 Cowrie on your live stream.',                  at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), isRead: true },
  { id: 'm8', type: 'VILLAGE_INVITE', actor: 'Technology Village', content: 'invited you to join as a Founding Member.',              at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), isRead: true },
]

const NOTIF_META: Record<NotifType, { emoji: string; color: string; label: string }> = {
  TALKING_DRUM:  { emoji: '🥁',  color: '#E85D04', label: 'Talking Drum'  },
  GRIOT_WHISPER: { emoji: '📖',  color: '#A855F7', label: 'Griot Whisper' },
  KOLANUT_CALL:  { emoji: '🌰',  color: '#D7A85F', label: 'Kolanut Call'  },
  KILA:          { emoji: '🤝',  color: '#F59E0B', label: 'Kíla'          },
  MWANGA:        { emoji: '✨',  color: '#A855F7', label: 'Mwanga'        },
  KALABASH:      { emoji: '🥥',  color: '#22C55E', label: 'Kalabash'      },
  VILLAGE_INVITE:{ emoji: '🏘️', color: '#00C2FF', label: 'Village Invite' },
  RANK_UP:       { emoji: '🌟',  color: '#D7A85F', label: 'Rank Up'       },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = React.useState<Notif[]>([])
  const [filter, setFilter] = React.useState<'ALL' | 'UNREAD'>('ALL')
  const [loading, setLoading] = React.useState(true)

  // Fetch notifications — fall back to mocks gracefully
  React.useEffect(() => {
    let cancelled = false
    fetch('/api/v1/notifications')
      .then(r => r.ok ? r.json() : null)
      .then((d) => {
        if (cancelled) return
        const items: Notif[] = Array.isArray(d?.data) ? d.data : (Array.isArray(d) ? d : null)
        setNotifs(items && items.length > 0 ? items : MOCK_NOTIFS)
      })
      .catch(() => {
        if (!cancelled) setNotifs(MOCK_NOTIFS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
  const markRead    = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
  const dismiss     = (id: string) => setNotifs((prev) => prev.filter((n) => n.id !== id))

  const unreadCount = notifs.filter((n) => !n.isRead).length
  const filtered    = filter === 'UNREAD' ? notifs.filter((n) => !n.isRead) : notifs

  return (
    <div className="animate-fade-in" style={{ minHeight: '100dvh', background: '#07090a', color: '#f0f5ee' }}>

      {/* ── Header with back button ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(7,9,10,.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.06)', color: '#f0f5ee', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#f0f5ee', fontFamily: "'Sora', sans-serif" }}>
            🥁 Drums &amp; Alerts
          </div>
          {unreadCount > 0 && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>
              {unreadCount} unread
            </div>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(212,160,23,.3)',
              background: 'rgba(212,160,23,.08)', color: '#fbbf24', fontSize: 11, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        {(['ALL', 'UNREAD'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '12px 0', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              color: filter === f ? '#fbbf24' : 'rgba(255,255,255,.35)',
              borderBottom: `2px solid ${filter === f ? '#d4a017' : 'transparent'}`,
              transition: 'all .2s',
            }}
          >
            {f === 'ALL' ? `All (${notifs.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* ── Notification list ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 28 }}>🥁</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 36 }}>🔇</span>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>All quiet in the village</p>
        </div>
      ) : (
        <div>
          {filtered.map((notif) => {
            const meta = NOTIF_META[notif.type]
            return (
              <div
                key={notif.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 14px',
                  background: !notif.isRead ? 'rgba(255,255,255,.03)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,.05)',
                  cursor: 'pointer',
                  transition: 'background .15s',
                }}
                onClick={() => {
                  markRead(notif.id)
                  if (notif.href) router.push(notif.href)
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}30`,
                  }}
                >
                  {meta.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: '#f0f5ee', lineHeight: 1.5, margin: 0 }}>
                    <span style={{ fontWeight: 700 }}>{notif.actor}</span>{' '}
                    {notif.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                    <Badge
                      size="sm"
                      style={{
                        color: meta.color,
                        borderColor: `${meta.color}40`,
                        background: `${meta.color}10`,
                      } as React.CSSProperties}
                    >
                      {meta.label}
                    </Badge>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
                      {formatRelativeTime(notif.at)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
                  )}
                  {/* Dismiss button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
                    title="Dismiss"
                    style={{
                      width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.35)',
                      fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1, flexShrink: 0,
                    }}
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
