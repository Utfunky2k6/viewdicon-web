'use client'
import * as React from 'react'
import { Avatar } from '@/components/ui/Avatar'
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

// Notifications fetched from backend (initially empty)
const INITIAL_NOTIFS: Notif[] = []

const NOTIF_META: Record<NotifType, { emoji: string; color: string; label: string }> = {
  TALKING_DRUM:  { emoji:'🥁',  color:'#E85D04', label:'Talking Drum' },
  GRIOT_WHISPER: { emoji:'📖',  color:'#A855F7', label:'Griot Whisper' },
  KOLANUT_CALL:  { emoji:'🌰',  color:'#D7A85F', label:'Kolanut Call' },
  KILA:          { emoji:'🤝',  color:'#F59E0B', label:'Kíla' },
  MWANGA:        { emoji:'✨',  color:'#A855F7', label:'Mwanga' },
  KALABASH:      { emoji:'🥥',  color:'#22C55E', label:'Kalabash' },
  VILLAGE_INVITE:{ emoji:'🏘️', color:'#00C2FF', label:'Village Invite' },
  RANK_UP:       { emoji:'🌟',  color:'#D7A85F', label:'Rank Up' },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = React.useState<Notif[]>(INITIAL_NOTIFS)
  const [filter, setFilter] = React.useState<'ALL' | 'UNREAD'>('ALL')

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
  const markRead    = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))

  const unreadCount = notifs.filter((n) => !n.isRead).length
  const filtered    = filter === 'UNREAD' ? notifs.filter((n) => !n.isRead) : notifs

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-kente-gold hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex border-b border-border">
        {(['ALL', 'UNREAD'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-all ${
              filter === f
                ? 'border-kente-gold text-kente-gold'
                : 'border-transparent text-gray-500'
            }`}
          >
            {f === 'ALL' ? `All (${notifs.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notif list */}
      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <span className="text-3xl">🔇</span>
            <p className="text-sm text-gray-400">All quiet in the village</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const meta = NOTIF_META[notif.type]
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${
                  !notif.isRead ? 'bg-bg-elevated' : 'hover:bg-bg-elevated/50'
                }`}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                >
                  {meta.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-white leading-relaxed">
                        <span className="font-medium">{notif.actor}</span>{' '}
                        {notif.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm" style={{ color: meta.color, borderColor: `${meta.color}40`, background: `${meta.color}10` } as React.CSSProperties}>
                          {meta.label}
                        </Badge>
                        <span className="text-[10px] text-gray-500">
                          {formatRelativeTime(notif.at)}
                        </span>
                      </div>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-kente-gold flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
