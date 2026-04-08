'use client'
import * as React from 'react'
import { logApiFailure } from '@/lib/flags'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface MockRoom {
  id: string
  title: string
  type: 'VOICE' | 'CO_CREATE' | 'FIRE_CIRCLE'
  participantCount: number
  maxParticipants: number
  speakers: string[]
  isLive: boolean
  topic: string
  village?: string
}

const ROOM_ICONS: Record<string, string> = {
  VOICE:       '🎙️',
  CO_CREATE:   '🎨',
  FIRE_CIRCLE: '🔥',
}

const ROOM_COLORS: Record<string, string> = {
  VOICE:       '#00C2FF',
  CO_CREATE:   '#A855F7',
  FIRE_CIRCLE: '#E85D04',
}

export default function RoomsPage() {
  const [rooms, setRooms] = React.useState<MockRoom[]>([])

  React.useEffect(() => {
    fetch('/api/events/rooms')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch((e) => logApiFailure('rooms/fetch', e))
  }, [])

  const liveRooms     = rooms.filter((r) => r.isLive)
  const upcomingRooms = rooms.filter((r) => !r.isLive)

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">🔥 Fire Circles</h1>
          <p className="text-xs text-gray-400 mt-0.5">{liveRooms.length} rooms live now</p>
        </div>
        <Button variant="primary" size="sm">+ Start Room</Button>
      </div>

      {/* Room type legend */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-4">
          {Object.entries(ROOM_ICONS).map(([type, icon]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span>{icon}</span>
              <span className="text-[10px] text-gray-400">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live rooms */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-gray-400 mb-3">🔴 LIVE NOW</p>
        <div className="space-y-3">
          {liveRooms.map((room) => (
            <div
              key={room.id}
              className="bg-bg-elevated border border-border rounded-2xl p-4 hover:border-border-strong transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${ROOM_COLORS[room.type]}15`, border: `1px solid ${ROOM_COLORS[room.type]}30` }}
                >
                  {ROOM_ICONS[room.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{room.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{room.topic}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs text-gray-400">{room.participantCount}</span>
                    </div>
                  </div>

                  {/* Speakers */}
                  {room.speakers.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-1.5">
                        {room.speakers.slice(0, 3).map((s) => (
                          <Avatar key={s} name={s} size="xs" className="border border-bg-elevated" />
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {room.speakers.join(', ')} speaking
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {room.village && (
                      <Badge variant="outline" size="sm">{room.village}</Badge>
                    )}
                    <Button
                      size="sm"
                      className="ml-auto"
                      style={{ background: `${ROOM_COLORS[room.type]}22`, borderColor: ROOM_COLORS[room.type], color: ROOM_COLORS[room.type] } as React.CSSProperties}
                      variant="secondary"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      {upcomingRooms.length > 0 && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs font-medium text-gray-400 mb-3">⏰ UPCOMING</p>
          <div className="space-y-2">
            {upcomingRooms.map((room) => (
              <div key={room.id} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-xl flex-shrink-0">
                  {ROOM_ICONS[room.type]}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{room.title}</p>
                  <p className="text-xs text-gray-500">{room.topic}</p>
                </div>
                <Button variant="secondary" size="sm">Remind</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sit By The Fire CTA */}
      <div className="px-4 py-4 border-t border-border">
        <div className="bg-kente-fire/10 border border-kente-fire/30 rounded-2xl p-4 text-center space-y-3">
          <p className="text-sm font-medium text-white">🔥 Sit By The Fire</p>
          <p className="text-xs text-gray-400">
            Request a seat at someone&apos;s fire or start your own circle
          </p>
          <Button variant="primary" className="w-full">
            Start a Fire Circle
          </Button>
        </div>
      </div>
    </div>
  )
}
