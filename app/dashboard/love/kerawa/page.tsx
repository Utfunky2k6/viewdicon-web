/**
 * KÈRÉWÀ — Casual Connections Home
 *
 * Fast. Lightweight. Privacy-first.
 * Minimal identity exposure. Ephemeral interactions.
 * 24h expiry on connections. Escrow-protected meetups.
 *
 * Design: Energetic but controlled. Red/coral palette.
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWNav, LWText, LWButton, LWCard,
  LWBadge, LWAvatar, LWSkeleton, LWEmpty,
} from '@/components/love-world/primitives'
import { kerawaApi } from '@/lib/api'

const T = REALM.kerawa

/* ─── Types ─── */

interface KerawaProfile {
  exists: boolean
  displayName?: string
  photo?: string | null
  identityLevel: 'SHADOW' | 'SILHOUETTE' | 'PARTIAL' | 'VERIFIED' | 'OPEN'
  trustScore: number
}

interface KerawaMatch {
  id: string
  name: string
  photo?: string | null
  expiresAt: string
  unread: number
  lastMessage?: string
}

interface Zone {
  id: string
  name: string
  tagline: string
  color: string
  members: number
}

const ZONES: Zone[] = [
  { id: 'night-market', name: 'Night Market', tagline: 'After-hours connections', color: '#8B5CF6', members: 0 },
  { id: 'masquerade', name: 'Masquerade', tagline: 'Anonymous encounters', color: '#EC4899', members: 0 },
  { id: 'drum-circle', name: 'Drum Circle', tagline: 'Group energy', color: '#F97316', members: 0 },
  { id: 'linked-up', name: 'LinkedUp', tagline: 'Verified connections', color: '#06B6D4', members: 0 },
  { id: 'global-village', name: 'Global Village', tagline: 'Cross-border', color: '#10B981', members: 0 },
]

const IDENTITY_LEVELS: Record<string, { label: string; description: string }> = {
  SHADOW: { label: 'Shadow', description: 'Fully anonymous' },
  SILHOUETTE: { label: 'Silhouette', description: 'Blurred profile' },
  PARTIAL: { label: 'Partial', description: 'Selected details visible' },
  VERIFIED: { label: 'Verified', description: 'Identity confirmed' },
  OPEN: { label: 'Open', description: 'Full profile visible' },
}

export default function KerawaHome() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [profile, setProfile] = React.useState<KerawaProfile | null>(null)
  const [matches, setMatches] = React.useState<KerawaMatch[]>([])
  const [clientNow, setClientNow] = React.useState(0)

  React.useEffect(() => { loadData() }, [])
  React.useEffect(() => { setClientNow(Date.now()) }, [])

  async function loadData() {
    const [profileRes, matchesRes] = await Promise.allSettled([
      kerawaApi.getMyProfile(),
      kerawaApi.getMatches(),
    ])
    const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null
    const matchesData = matchesRes.status === 'fulfilled' ? matchesRes.value : null
    if (profileData?.profile) {
      const p = profileData.profile
      setProfile({
        exists: true,
        displayName: p.displayName || p.name,
        photo: p.photo,
        identityLevel: p.identityLevel || 'SHADOW',
        trustScore: p.trustScore || 50,
      })
    } else {
      setProfile({ exists: false, identityLevel: 'SHADOW', trustScore: 0 })
    }
    if (matchesData?.matches) {
      setMatches(matchesData.matches.map((m: any) => ({
        id: m.id || m.matchId,
        name: m.partnerName || m.name || 'Anonymous',
        photo: m.partnerPhoto || m.photo,
        expiresAt: m.expiresAt || '',
        unread: m.unread || 0,
        lastMessage: m.lastMessage,
      })))
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <RealmProvider realm="kerawa">
        <LWNav title="KÈRÉWÀ" backHref="/dashboard/love" backLabel="Realms" />
        <div style={{ padding: `${SPACE[5]}px ${SPACE[4]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
          <LWSkeleton height={80} radius={RADIUS.xl} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACE[3] }}>
            {[1, 2, 3, 4].map(i => <LWSkeleton key={i} height={80} radius={RADIUS.lg} />)}
          </div>
          <LWSkeleton height={160} radius={RADIUS.xl} />
        </div>
      </RealmProvider>
    )
  }

  const hasProfile = profile?.exists
  const activeMatches = matches.filter(m => new Date(m.expiresAt).getTime() > clientNow)

  return (
    <RealmProvider realm="kerawa">
      <LWNav
        title="KÈRÉWÀ"
        backHref="/dashboard/love"
        backLabel="Realms"
        right={
          <button
            onClick={() => router.push('/dashboard/kerawa/safety')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLOR.danger, fontFamily: 'inherit', ...TYPE.caption, fontWeight: 600 }}
          >
            Safety
          </button>
        }
      />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[12]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[5] }}>
        {/* Identity Status */}
        {hasProfile ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
            padding: `${SPACE[3]}px ${SPACE[4]}px`,
            background: T.accentMuted,
            borderRadius: RADIUS.lg,
            border: `1px solid ${T.accent}18`,
          }}>
            <LWAvatar src={profile?.photo} name={profile?.displayName} size={36} />
            <div style={{ flex: 1 }}>
              <LWText scale="body" as="span" style={{ fontWeight: 500 }}>{profile?.displayName || 'Anonymous'}</LWText>
              <LWText scale="micro" color="muted" as="div" style={{ marginTop: 1 }}>
                {IDENTITY_LEVELS[profile?.identityLevel || 'SHADOW']?.label} mode · Trust: {profile?.trustScore}
              </LWText>
            </div>
            <LWBadge variant="accent">{profile?.identityLevel}</LWBadge>
          </div>
        ) : (
          <LWCard padding={SPACE[5]} style={{ background: T.accentMuted, borderColor: `${T.accent}20` }}>
            <LWText scale="h3" style={{ marginBottom: SPACE[2] }}>Enter the Zone</LWText>
            <LWText scale="caption" color="secondary" style={{ marginBottom: SPACE[4] }}>
              Create a profile to explore. You control exactly how much you reveal.
            </LWText>
            <LWButton variant="primary" onClick={() => router.push('/dashboard/kerawa/create')}>
              Create Profile
            </LWButton>
          </LWCard>
        )}

        {/* Safety notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[2],
          padding: `${SPACE[2]}px ${SPACE[3]}px`,
          background: 'rgba(239,68,68,0.06)',
          borderRadius: RADIUS.md,
          border: `1px solid rgba(239,68,68,0.12)`,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: COLOR.danger, flexShrink: 0 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <LWText scale="caption" color="muted">
            All connections expire in 24 hours. Escrow-protected meetups available.
          </LWText>
        </div>

        {/* Zones */}
        <section>
          <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Zones</LWText>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACE[3] }}>
            {ZONES.map((zone, i) => (
              <button
                key={zone.id}
                onClick={() => router.push(`/dashboard/kerawa/zones?zone=${zone.id}`)}
                className="lw-card-hover"
                style={{
                  textAlign: 'left',
                  padding: SPACE[4],
                  background: T.card,
                  border: `1px solid ${COLOR.border}`,
                  borderRadius: RADIUS.lg,
                  borderTop: `2px solid ${zone.color}`,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  color: COLOR.textPrimary,
                  gridColumn: i === ZONES.length - 1 && ZONES.length % 2 ? 'span 2' : undefined,
                  animation: `lw-card-enter ${DURATION.slow} ${EASE.default} both`,
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <LWText scale="body" as="div" style={{ fontWeight: 500 }}>{zone.name}</LWText>
                <LWText scale="caption" color="muted" as="div" style={{ marginTop: 2 }}>{zone.tagline}</LWText>
              </button>
            ))}
          </div>
        </section>

        {/* Active Connections */}
        {hasProfile && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[3] }}>
              <LWText scale="h3" as="h3">Active Beats</LWText>
              {activeMatches.length > 0 && (
                <LWText scale="caption" color="muted">{activeMatches.length} active</LWText>
              )}
            </div>

            {activeMatches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
                {activeMatches.map(m => (
                  <ConnectionCard key={m.id} match={m} onClick={() => router.push(`/dashboard/kerawa/matches/${m.id}`)} now={clientNow} />
                ))}
              </div>
            ) : (
              <LWCard padding={SPACE[4]} style={{ textAlign: 'center' }}>
                <LWText scale="caption" color="muted">No active connections. Explore a zone to begin.</LWText>
              </LWCard>
            )}
          </section>
        )}

        {/* Quick Actions */}
        {hasProfile && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: SPACE[2] }}>
            <QuickAction label="Rooms" onClick={() => router.push('/dashboard/kerawa/rooms')} />
            <QuickAction label="Content" onClick={() => router.push('/dashboard/kerawa/content')} />
            <QuickAction label="Escrow" onClick={() => router.push('/dashboard/kerawa/safety')} />
          </div>
        )}

        {/* Discover */}
        {hasProfile && (
          <LWButton
            variant="primary"
            fullWidth
            onClick={() => router.push('/dashboard/kerawa/zones')}
          >
            Discover Connections
          </LWButton>
        )}
      </div>
    </RealmProvider>
  )
}

function ConnectionCard({ match, onClick, now }: { match: KerawaMatch; onClick: () => void; now: number }) {
  const timeLeft = formatTimeLeft(match.expiresAt, now)
  const urgent = new Date(match.expiresAt).getTime() - now < 3600000

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[3],
        padding: SPACE[3],
        background: REALM.kerawa.card,
        border: `1px solid ${urgent ? COLOR.danger + '30' : COLOR.border}`,
        borderRadius: RADIUS.lg,
        fontFamily: 'inherit',
        cursor: 'pointer',
        color: COLOR.textPrimary,
      }}
    >
      <LWAvatar src={match.photo} name={match.name} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LWText scale="body" as="span" style={{ fontWeight: 500 }}>{match.name}</LWText>
          {match.unread > 0 && (
            <span style={{
              width: 18, height: 18, borderRadius: RADIUS.full,
              background: REALM.kerawa.accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...TYPE.micro, fontWeight: 700,
            }}>
              {match.unread}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <LWText scale="caption" color="muted" as="span" style={{
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%',
          }}>
            {match.lastMessage || 'New connection'}
          </LWText>
          <LWText scale="micro" style={{ color: urgent ? COLOR.danger : COLOR.textMuted }}>{timeLeft}</LWText>
        </div>
      </div>
    </button>
  )
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 40,
        borderRadius: RADIUS.md,
        background: COLOR.elevated,
        border: `1px solid ${COLOR.border}`,
        fontFamily: 'inherit',
        cursor: 'pointer',
        ...TYPE.caption,
        color: COLOR.textSecondary,
        fontWeight: 500,
      }}
    >
      {label}
    </button>
  )
}

function formatTimeLeft(iso: string, now: number): string {
  const ms = new Date(iso).getTime() - now
  if (ms <= 0) return 'Expired'
  const h = Math.floor(ms / 3600000)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
