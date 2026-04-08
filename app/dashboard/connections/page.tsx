'use client'
import * as React from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { NkisiShield } from '@/components/ui/NkisiShield'
import { deriveNkisiState } from '@/lib/nkisi'
import type { ConnectionRing, NkisiState } from '@/types'
import { logApiFailure } from '@/lib/flags'

// Three Rings model
const RINGS: { id: ConnectionRing; emoji: string; label: string; desc: string; color: string }[] = [
  { id: 'SIT_AT_MY_FIRE', emoji: '🔥', label: 'Sit At My Fire',   desc: 'Inner circle',        color: '#EF4444' },
  { id: 'KEEP_MY_NAME',   emoji: '🤲', label: 'Keep My Name',     desc: 'Trusted network',     color: '#F59E0B' },
  { id: 'STAND_BESIDE_ME',emoji: '🌿', label: 'Stand Beside Me',  desc: 'Extended village',    color: '#22C55E' },
]

interface MockConnection {
  id: string
  displayName: string
  username: string
  ring: ConnectionRing
  tribe: string
  ubuntuScore: number
  nkisiState: NkisiState
  mutualFires: number
}

const RING_META: Record<ConnectionRing, { emoji: string; color: string; label: string }> = {
  SIT_AT_MY_FIRE:  { emoji: '🔥', color: '#EF4444', label: 'Inner Fire' },
  KEEP_MY_NAME:    { emoji: '🤲', color: '#F59E0B', label: 'Trusted'    },
  STAND_BESIDE_ME: { emoji: '🌿', color: '#22C55E', label: 'Village'    },
}

export default function ConnectionsPage() {
  const [activeRing, setActiveRing] = React.useState<ConnectionRing | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [connections, setConnections] = React.useState<MockConnection[]>([])
  const [, setSearchResults] = React.useState<MockConnection[]>([])

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/v1/me/connections')
        if (res.ok) {
          const data = await res.json()
          setConnections(Array.isArray(data) ? data : (data.connections ?? []))
        }
      } catch (e) { logApiFailure('connections/fetch', e) }
    })()
  }, [])

  const filtered = connections.filter((c) => {
    if (activeRing !== 'ALL' && c.ring !== activeRing) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return c.displayName.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
    }
    return true
  })

  const ringCounts = connections.reduce((acc, c) => {
    acc[c.ring] = (acc[c.ring] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h1 className="text-lg font-bold">Your Circles</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {connections.length} people in your three rings
        </p>
      </div>

      {/* Ring selector */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveRing('ALL')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              activeRing === 'ALL'
                ? 'border-kente-gold bg-kente-gold/10 text-kente-gold'
                : 'border-border text-gray-400 hover:border-border-strong'
            }`}
          >
          All ({connections.length})
          </button>
          {RINGS.map(({ id, emoji, label }) => (
            <button
              key={id}
              onClick={() => setActiveRing(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all`}
              style={activeRing === id
                ? { borderColor: RING_META[id].color, background: `${RING_META[id].color}15`, color: RING_META[id].color }
                : { borderColor: '#363A3F', color: '#9CA3AF' }
              }
            >
              {emoji} {label.split(' ')[0]} ({ringCounts[id] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <Input
          placeholder="Search by name or AfroID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<span className="text-sm">🔍</span>}
        />
      </div>

      {/* Ring explanation (when ALL and no search) */}
      {activeRing === 'ALL' && !searchQuery && (
        <div className="px-4 py-3 border-b border-border">
          <div className="grid grid-cols-3 gap-2">
            {RINGS.map(({ id, emoji, label, desc, color }) => (
              <button
                key={id}
                onClick={() => setActiveRing(id)}
                className="flex flex-col items-center gap-1 p-3 bg-bg-elevated rounded-xl border border-border hover:border-border-strong transition-all text-center"
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[10px] font-medium text-white leading-tight">{label}</span>
                <span className="text-[9px] text-gray-500">{desc}</span>
                <span className="text-xs font-bold mt-0.5" style={{ color }}>
                  {ringCounts[id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Connection list */}
      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <span className="text-3xl">🌍</span>
            <p className="text-sm text-gray-400">
              {searchQuery ? 'No one matches your search' : 'This ring is empty'}
            </p>
            <Button variant="secondary" size="sm">
              Discover People
            </Button>
          </div>
        ) : (
          filtered.map((conn) => {
            const ringInfo = RING_META[conn.ring]
            const nkisi    = deriveNkisiState(conn.ubuntuScore)
            return (
              <div key={conn.id} className="px-4 py-3 flex items-center gap-3">
                <NkisiShield state={nkisi} size="md">
                  <Avatar name={conn.displayName} size="md" />
                </NkisiShield>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {conn.displayName}
                    </span>
                    <span className="text-[10px]" style={{ color: ringInfo.color }}>
                      {ringInfo.emoji}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500">@{conn.username}</span>
                    {conn.mutualFires > 0 && (
                      <span className="text-[10px] text-gray-600">
                        · {conn.mutualFires} mutual 🔥
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    size="sm"
                    variant={conn.ring === 'SIT_AT_MY_FIRE' ? 'fire' : conn.ring === 'KEEP_MY_NAME' ? 'amber' : 'green'}
                  >
                    {ringInfo.label}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add new */}
      <div className="px-4 py-4 border-t border-border">
        <Button variant="secondary" className="w-full" size="md">
          🌍 Discover & Connect
        </Button>
      </div>
    </div>
  )
}
