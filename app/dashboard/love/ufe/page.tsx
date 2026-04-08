/**
 * UFÈ HOME — Premium Sacred Matchmaking Hub
 *
 * Banking-grade UX applied to matchmaking.
 * Clean hierarchy: identity -> counter -> matches -> journey -> questions -> counsel.
 * No swipe. Deliberate selection. Analytical compatibility.
 *
 * Design reference: Revolut home, Stripe dashboard, Apple Wallet.
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider,
  LWText,
  LWButton,
  LWCard,
  LWNav,
  LWBadge,
  LWProgress,
  LWDivider,
  LWSkeleton,
  LWAvatar,
  LWEmpty,
} from '@/components/love-world/primitives'
import { useApi } from '@/components/love-world/hooks'
import { loveWorldApi } from '@/lib/api'

const T = REALM.ufe

/* ─── Station definitions ─── */

const STATIONS = [
  { id: 1, name: 'Cultural Wall', duration: '72h', icon: 'M3 21h18M3 10h18M3 3l9 7 9-7' },
  { id: 2, name: 'Guided Chat', duration: 'Unlimited', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { id: 3, name: 'Experience Layer', duration: 'Dates', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
] as const

/* ─── Settings Gear Icon ─── */

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

/* ─── Loading Skeleton ─── */

function UfeLoadingSkeleton() {
  return (
    <RealmProvider realm="ufe">
      <LWNav title="UFE" backHref="/dashboard/love" backLabel="Realms" />
      <div style={{ padding: `${SPACE[6]}px ${SPACE[4]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[5] }}>
        {/* Identity banner skeleton */}
        <LWCard padding={SPACE[5]}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
            <LWSkeleton width={56} height={56} radius={RADIUS.full} />
            <div style={{ flex: 1 }}>
              <LWSkeleton width={140} height={20} />
              <LWSkeleton width={100} height={14} style={{ marginTop: 8 }} />
            </div>
            <LWSkeleton width={64} height={24} radius={RADIUS.full} />
          </div>
        </LWCard>
        {/* Weekly counter skeleton */}
        <LWCard padding={SPACE[4]}>
          <LWSkeleton width={220} height={16} />
          <LWSkeleton height={6} radius={RADIUS.full} style={{ marginTop: 12 }} />
        </LWCard>
        {/* Matches skeleton */}
        <LWSkeleton height={140} radius={RADIUS.xl} />
        {/* Journey skeleton */}
        <LWSkeleton height={200} radius={RADIUS.xl} />
      </div>
    </RealmProvider>
  )
}

/* ─── Error State ─── */

function UfeError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <RealmProvider realm="ufe">
      <LWNav title="UFE" backHref="/dashboard/love" backLabel="Realms" />
      <LWEmpty
        title="Something went wrong"
        message={message}
        action={<LWButton variant="secondary" size="sm" onClick={onRetry}>Retry</LWButton>}
      />
    </RealmProvider>
  )
}

/* ═════════════════════════════════════════════════════════════
   Main Page
   ═════════════════════════════════════════════════════════════ */

export default function UfeHome() {
  const router = useRouter()

  const profile = useApi(() => loveWorldApi.getMyProfile(), [])
  const matches = useApi(() => loveWorldApi.getMatches(), [])
  const queue = useApi(() => loveWorldApi.getMatchQueue(), [])
  const verification = useApi(() => loveWorldApi.getVerification(), [])
  const intent = useApi(() => loveWorldApi.getMyIntentScore(), [])
  const eligibility = useApi(() => loveWorldApi.getMatchEligibility(), [])

  const loading = profile.loading || matches.loading
  // 404 = no profile/matches yet — show the page in empty state, not error screen
  const hasRealError = (e: string | null) => !!e && !e.includes('404') && !e.includes('Not Found')
  const error = hasRealError(profile.error) ? profile.error : null

  if (loading) return <UfeLoadingSkeleton />
  if (error) return <UfeError message={error} onRetry={() => { profile.refetch(); matches.refetch() }} />

  /* ─── Extract data ─── */
  const p = profile.data?.profile ?? profile.data ?? null
  const hasProfile = !!p
  const userName = p?.displayName || p?.name || 'You'
  const userPhoto = p?.photo || p?.avatar || null
  const isVerified = p?.verified ?? false
  const verificationLevel = verification.data?.level ?? verification.data?.verificationLevel ?? 0
  const questionsAnswered = p?.questionsAnswered ?? 0
  const subscriptionActive = p?.subscriptionStatus === 'active' || p?.subscriptionActive

  const matchList: any[] = matches.data?.matches ?? (Array.isArray(matches.data) ? matches.data : [])
  const queueList: any[] = queue.data?.matches ?? queue.data?.queue ?? (Array.isArray(queue.data) ? queue.data : [])
  const matchesUsed = queueList.length
  const matchesTotal = eligibility.data?.weeklyLimit ?? 3
  const matchesRemaining = Math.max(0, matchesTotal - matchesUsed)

  const intentScore = intent.data?.score ?? intent.data?.intentScore ?? 0
  const activeStation = matchList.length > 0 ? (matchList[0].currentStation ?? matchList[0].station ?? 1) : 0

  return (
    <RealmProvider realm="ufe">
      <LWNav
        title="UFE"
        backHref="/dashboard/love"
        backLabel="Realms"
        right={
          <button
            onClick={() => router.push('/dashboard/love/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: SPACE[1], color: COLOR.textMuted }}
            aria-label="Settings"
          >
            <GearIcon />
          </button>
        }
      />

      <div style={{
        padding: `${SPACE[5]}px ${SPACE[4]}px ${SPACE[12]}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE[5],
      }}>

        {/* ─── 1. Identity Banner ─── */}
        {hasProfile ? (
          <LWCard padding={SPACE[5]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
              <LWAvatar src={userPhoto} name={userName} size={56} verified={isVerified} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
                  <LWText scale="h2" as="h2" style={{ margin: 0 }}>{userName}</LWText>
                  {isVerified && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={T.accent}>
                      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" />
                    </svg>
                  )}
                </div>
                <LWText scale="caption" color="muted" style={{ marginTop: 2 }}>
                  Intent Score: {intentScore}
                </LWText>
              </div>
              <LWBadge variant={subscriptionActive ? 'success' : 'accent'}>
                {subscriptionActive ? 'Active' : 'Trial'}
              </LWBadge>
            </div>
            <div style={{ display: 'flex', gap: SPACE[3], marginTop: SPACE[4] }}>
              <LWButton
                variant="secondary"
                size="sm"
                onClick={() => router.push('/dashboard/love/create')}
              >
                View Profile
              </LWButton>
              <LWButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/love/create')}
              >
                Edit Profile
              </LWButton>
            </div>
          </LWCard>
        ) : (
          <LWCard padding={SPACE[5]} style={{ background: T.accentMuted, borderColor: `${T.accent}20` }}>
            <LWText scale="h3" style={{ marginBottom: SPACE[2] }}>Begin Your Journey</LWText>
            <LWText scale="caption" color="secondary" style={{ marginBottom: SPACE[4] }}>
              Create your profile to receive curated matches based on cultural depth, values, and intent.
            </LWText>
            <LWButton variant="primary" onClick={() => router.push('/dashboard/love/create')}>
              Create Profile
            </LWButton>
          </LWCard>
        )}

        {/* ─── 2. Weekly Counter ─── */}
        {hasProfile && (
          <LWCard padding={SPACE[4]}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[3] }}>
              <LWText scale="body" as="span" style={{ fontWeight: 500 }}>
                {matchesRemaining} of {matchesTotal} matches remaining
              </LWText>
              <LWText scale="micro" color="muted" as="span">This week</LWText>
            </div>
            <LWProgress value={matchesTotal - matchesRemaining} max={matchesTotal} height={4} />
            <LWText scale="caption" color="muted" style={{ marginTop: SPACE[2] }}>
              Resets Monday
            </LWText>
          </LWCard>
        )}

        {/* ─── 3. Active Matches ─── */}
        {hasProfile && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
                <LWText scale="h3" as="h3">Your Matches</LWText>
                {matchList.length > 0 && (
                  <LWBadge variant="accent">{matchList.length}</LWBadge>
                )}
              </div>
            </div>

            {matchList.length > 0 ? (
              <div style={{
                display: 'flex',
                gap: SPACE[3],
                overflowX: 'auto',
                paddingBottom: SPACE[2],
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
              }}>
                {matchList.map((m: any) => {
                  const matchId = m.id || m.matchId
                  const name = m.partnerName || m.displayName || m.name || 'Unknown'
                  const photo = m.partnerPhoto || m.photo || m.avatar || null
                  const verified = m.partnerVerified ?? m.verified ?? false
                  const compat = m.compatibilityScore ?? m.compatibility ?? m.score ?? 0
                  const station = m.currentStation ?? m.station ?? 1
                  const stationName = STATIONS[station - 1]?.name ?? `Station ${station}`

                  return (
                    <div
                      key={matchId}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/dashboard/love/matches/${matchId}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/dashboard/love/matches/${matchId}`) }}
                      style={{
                        flexShrink: 0,
                        width: 160,
                        padding: SPACE[4],
                        background: T.card,
                        border: `1px solid ${COLOR.border}`,
                        borderRadius: RADIUS.xl,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: SPACE[2],
                        textAlign: 'center',
                        scrollSnapAlign: 'start',
                        transition: `border-color ${DURATION.fast} ${EASE.default}`,
                      }}
                    >
                      <LWAvatar src={photo} name={name} size={48} verified={verified} />
                      <LWText scale="body" as="span" style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {name}
                      </LWText>
                      <LWText scale="h3" color="accent" as="span" style={{ fontWeight: 700 }}>
                        {compat}%
                      </LWText>
                      <LWBadge variant="default">{stationName}</LWBadge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <LWEmpty
                title="No matches yet"
                message="Your curated matches will appear here. Complete your profile and verification to receive your first three."
              />
            )}
          </section>
        )}

        {/* ─── 4. Journey Overview ─── */}
        {hasProfile && (
          <section>
            <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Your Journey</LWText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
              {STATIONS.map((s) => {
                const isActive = activeStation === s.id
                const isCompleted = activeStation > s.id
                const isLocked = activeStation < s.id

                return (
                  <LWCard
                    key={s.id}
                    padding={SPACE[4]}
                    style={{
                      opacity: isLocked ? 0.5 : 1,
                      borderColor: isActive ? T.accent : COLOR.border,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: RADIUS.full,
                        background: isCompleted ? `${COLOR.success}18` : isActive ? T.accentMuted : 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isCompleted ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke={COLOR.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : isLocked ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="11" width="18" height="11" rx="2" stroke={COLOR.textMuted} strokeWidth="1.5" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={COLOR.textMuted} strokeWidth="1.5" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d={s.icon} stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
                          <LWText scale="body" as="span" style={{ fontWeight: 500 }}>
                            Station {s.id}: {s.name}
                          </LWText>
                          {isActive && <LWBadge variant="accent">Active</LWBadge>}
                          {isCompleted && <LWBadge variant="success">Done</LWBadge>}
                          {isLocked && <LWBadge variant="default">Locked</LWBadge>}
                        </div>
                        <LWText scale="caption" color="muted" style={{ marginTop: 2 }}>
                          {s.duration}
                        </LWText>
                      </div>
                    </div>
                  </LWCard>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── 5. Questions Progress ─── */}
        {hasProfile && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[3] }}>
              <LWText scale="h3" as="h3">200 Questions</LWText>
              <LWBadge variant={questionsAnswered >= 200 ? 'success' : 'accent'}>
                {questionsAnswered >= 200 ? 'Complete' : `${Math.round((questionsAnswered / 200) * 100)}%`}
              </LWBadge>
            </div>
            <LWCard padding={SPACE[4]}>
              <LWProgress value={questionsAnswered} max={200} height={6} />
              <LWText scale="caption" color="secondary" style={{ marginTop: SPACE[2] }}>
                {questionsAnswered} of 200 answered
              </LWText>
              <LWDivider spacing={SPACE[3]} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
                {STATIONS.map((s) => {
                  const stationQs = s.id === 1 ? 40 : 80
                  const stationStart = s.id === 1 ? 0 : s.id === 2 ? 40 : 120
                  const stationAnswered = Math.min(stationQs, Math.max(0, questionsAnswered - stationStart))
                  const pct = Math.round((stationAnswered / stationQs) * 100)
                  return (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <LWText scale="caption" as="span" color="secondary">
                        Station {s.id}: {s.name}
                      </LWText>
                      <LWText scale="micro" as="span" color={pct >= 100 ? 'success' : 'muted'}>
                        {stationAnswered}/{stationQs}
                      </LWText>
                    </div>
                  )
                })}
              </div>
              {questionsAnswered < 200 && (
                <LWButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    const station = questionsAnswered < 40 ? 1 : questionsAnswered < 120 ? 2 : 3
                    router.push(`/dashboard/love/ufe/questions?station=${station}`)
                  }}
                  style={{ marginTop: SPACE[3] }}
                >
                  Continue Answering
                </LWButton>
              )}
            </LWCard>
          </section>
        )}

        {/* ─── 6. AI Counselor Quick Access ─── */}
        {hasProfile && (
          <section>
            <LWCard
              padding={SPACE[4]}
              hoverable
              onClick={() => router.push('/dashboard/ai')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: RADIUS.full,
                  background: T.accentMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      stroke={T.accent}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <LWText scale="body" as="span" style={{ fontWeight: 500 }}>
                    Speak to your AI Counselor
                  </LWText>
                  <LWText scale="caption" color="muted" as="div" style={{ marginTop: 2 }}>
                    Guidance on your matchmaking journey
                  </LWText>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: COLOR.textMuted, flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </LWCard>
          </section>
        )}
      </div>
    </RealmProvider>
  )
}
