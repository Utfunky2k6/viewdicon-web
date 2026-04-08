/**
 * LOVE WORLD — Matches List
 * Banking-grade match listing with realm tokens.
 * Route: /dashboard/love/matches
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav, LWBadge,
  LWAvatar, LWEmpty, LWSkeleton, LWDivider,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const T = REALM.ufe

type MatchStatus = 'ACTIVE' | 'COMPLETED' | 'DECLINED' | 'PENDING'
type StationKey = 'CULTURAL_WALL' | 'GUIDED_CHAT' | 'VIRTUAL_DATES' | 'NONE'

interface MatchItem {
  id: string
  partner: { afroId: string; displayName: string; heritage: string; photoUrl?: string }
  matchScore: number
  status: MatchStatus
  currentStation: StationKey
  stationDeadline?: string
  createdAt: string
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'DECLINED', label: 'Declined' },
]

const STATION_LABEL: Record<StationKey, string> = {
  CULTURAL_WALL: 'Cultural Wall',
  GUIDED_CHAT: 'Guided Chat',
  VIRTUAL_DATES: 'Virtual Dates',
  NONE: 'Pending',
}

function timeRemaining(deadline?: string): string | null {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h left`
  return `${Math.floor(diff / 60_000)}m left`
}

function scoreColor(s: number): string {
  if (s >= 80) return COLOR.success
  if (s >= 60) return T.accent
  return COLOR.danger
}

export default function MatchesListPage() {
  const router = useRouter()
  const [matches, setMatches] = React.useState<MatchItem[]>([])
  const [filter, setFilter] = React.useState('all')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await loveWorldApi.getMatches(filter === 'all' ? undefined : filter)
        if (!cancelled) setMatches(Array.isArray(res) ? res : res?.matches ?? [])
      } catch (e) { logApiFailure('love/matches/list', e); if (!cancelled) setMatches([]) }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [filter])

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter)

  return (
    <RealmProvider realm="ufe">
      <LWNav title="My Matches" backHref="/dashboard/love/ufe" backLabel="UFÈ" right={
        <LWBadge variant="default">{matches.length}</LWBadge>
      } />

      <div style={{ padding: `0 ${SPACE[4]}px ${SPACE[16]}px` }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: SPACE[2], padding: `${SPACE[3]}px 0`, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {FILTERS.map(f => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: `${SPACE[1.5]}px ${SPACE[4]}px`, borderRadius: RADIUS.full,
                  border: `1px solid ${active ? T.accent : COLOR.border}`,
                  background: active ? T.accentMuted : 'transparent',
                  color: active ? T.accent : COLOR.textMuted, cursor: 'pointer',
                  fontFamily: 'inherit', ...TYPE.caption, fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap', transition: `all ${DURATION.fast} ${EASE.default}`,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3], marginTop: SPACE[3] }}>
            {[1, 2, 3].map(i => <LWSkeleton key={i} height={88} radius={RADIUS.xl} />)}
          </div>
        ) : filtered.length === 0 ? (
          <LWEmpty
            title="No matches yet"
            message="Your curated matches will appear here. Complete your profile and verification to receive your first three."
            action={<LWButton variant="secondary" size="sm" onClick={() => router.push('/dashboard/love/ufe')}>Go to UFÈ</LWButton>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2], marginTop: SPACE[2] }}>
            {filtered.map(match => {
              const station = STATION_LABEL[match.currentStation] || 'Pending'
              const remaining = match.status === 'ACTIVE' ? timeRemaining(match.stationDeadline) : null
              const statusVariant = match.status === 'ACTIVE' ? 'success' as const
                : match.status === 'COMPLETED' ? 'accent' as const
                : match.status === 'DECLINED' ? 'danger' as const
                : 'default' as const

              return (
                <LWCard
                  key={match.id}
                  padding={SPACE[4]}
                  hoverable
                  onClick={() => router.push(`/dashboard/love/matches/${match.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
                    <LWAvatar
                      src={match.partner.photoUrl}
                      name={match.partner.displayName}
                      size={48}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2], marginBottom: 2 }}>
                        <LWText scale="body" as="span" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {match.partner.displayName}
                        </LWText>
                        <LWBadge variant={statusVariant}>{match.status}</LWBadge>
                      </div>
                      <LWText scale="caption" color="muted" as="div">{match.partner.heritage || 'Heritage unknown'}</LWText>
                      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[1] }}>
                        <LWBadge variant="default">{station}</LWBadge>
                        {remaining && (
                          <LWText scale="micro" color={remaining === 'Expired' ? 'danger' : 'muted'} as="span">
                            {remaining}
                          </LWText>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <span style={{ ...TYPE.h2, fontWeight: 800, color: scoreColor(match.matchScore) }}>
                        {match.matchScore}%
                      </span>
                      <LWText scale="micro" color="muted" as="div">score</LWText>
                    </div>
                  </div>
                </LWCard>
              )
            })}
          </div>
        )}
      </div>
    </RealmProvider>
  )
}
