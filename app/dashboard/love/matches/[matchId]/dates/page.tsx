/**
 * UFE -- Station 3: Experience Layer
 *
 * Where matched couples plan and go on dates.
 * Virtual (video/voice) and in-person experiences.
 * Schedule, manage, and rate shared moments.
 */
'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav,
  LWBadge, LWSkeleton, LWEmpty, LWSheet, LWInput,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

/* ─── Types ─── */

interface DateEvent {
  id: string
  matchId: string
  dateType: 'VIDEO' | 'VOICE' | 'IN_PERSON'
  scheduledAt: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  venue?: string
  rating?: number
  reflection?: string
  createdAt: string
}

/* ─── Constants ─── */

const T = REALM.ufe

const DATE_TYPES = {
  VIDEO:     { icon: '\uD83C\uDFA5', label: 'Video Call',  description: 'Virtual face-to-face — see each other in real time' },
  VOICE:     { icon: '\uD83C\uDF99\uFE0F', label: 'Voice Call',  description: 'Audio-only conversation — focus on the words' },
  IN_PERSON: { icon: '\uD83E\uDDED', label: 'In-Person',   description: 'Meet at an agreed venue — bring your best self' },
} as const

const STATUS_BADGE: Record<string, { variant: 'default' | 'accent' | 'success' | 'warning' | 'danger'; label: string }> = {
  SCHEDULED:   { variant: 'warning', label: 'Scheduled' },
  CONFIRMED:   { variant: 'accent',  label: 'Confirmed' },
  IN_PROGRESS: { variant: 'success', label: 'In Progress' },
  COMPLETED:   { variant: 'default', label: 'Completed' },
  CANCELLED:   { variant: 'danger',  label: 'Cancelled' },
}

/* ─── Helpers ─── */

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/* ═════════════════════════════════════════════════════════════
   Main Page
   ═════════════════════════════════════════════════════════════ */

export default function DatesPage() {
  const { matchId } = useParams() as { matchId: string }
  const router = useRouter()

  const [dates, setDates] = React.useState<DateEvent[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  /* Schedule sheet state */
  const [showSchedule, setShowSchedule] = React.useState(false)
  const [scheduleType, setScheduleType] = React.useState<'VIDEO' | 'VOICE' | 'IN_PERSON'>('VIDEO')
  const [scheduleAt, setScheduleAt] = React.useState('')
  const [scheduleVenue, setScheduleVenue] = React.useState('')
  const [scheduling, setScheduling] = React.useState(false)

  /* Rating sheet state */
  const [ratingDateId, setRatingDateId] = React.useState<string | null>(null)
  const [ratingValue, setRatingValue] = React.useState(0)
  const [ratingReflection, setRatingReflection] = React.useState('')
  const [submittingRating, setSubmittingRating] = React.useState(false)

  /* ─── Data fetching ─── */

  const load = React.useCallback(async () => {
    try {
      setError(false)
      const res = await loveWorldApi.getDates(matchId)
      if (res?.dates) setDates(res.dates)
      else if (Array.isArray(res)) setDates(res)
      else setDates([])
    } catch (e) {
      logApiFailure('love/dates/fetch', e)
      setDates([]) // treat API failure as no dates yet
    } finally {
      setLoading(false)
    }
  }, [matchId])

  React.useEffect(() => { load() }, [load])

  /* ─── Actions ─── */

  async function handleSchedule() {
    if (!scheduleAt) return
    setScheduling(true)
    try {
      await loveWorldApi.scheduleDate(matchId, {
        dateType: scheduleType,
        scheduledAt: new Date(scheduleAt).toISOString(),
      })
      setShowSchedule(false)
      setScheduleType('VIDEO')
      setScheduleAt('')
      setScheduleVenue('')
      await load()
    } finally {
      setScheduling(false)
    }
  }

  async function handleDateAction(dateId: string, action: 'start' | 'end') {
    await loveWorldApi.updateDate(matchId, dateId, action)
    await load()
  }

  async function handleRate() {
    if (!ratingDateId || ratingValue < 1) return
    setSubmittingRating(true)
    try {
      await loveWorldApi.rateDate(matchId, ratingDateId, {
        rating: ratingValue,
        reflection: ratingReflection.trim() || undefined,
      })
      setRatingDateId(null)
      setRatingValue(0)
      setRatingReflection('')
      await load()
    } finally {
      setSubmittingRating(false)
    }
  }

  function openRating(dateId: string) {
    setRatingDateId(dateId)
    setRatingValue(0)
    setRatingReflection('')
  }

  /* ─── Derived data ─── */

  const upcoming = dates.filter(d =>
    d.status === 'SCHEDULED' || d.status === 'CONFIRMED' || d.status === 'IN_PROGRESS'
  )
  const completed = dates.filter(d => d.status === 'COMPLETED')

  /* ─── Loading ─── */

  if (loading) {
    return (
      <RealmProvider realm="ufe">
        <LWNav
          title="Dates"
          backHref={`/dashboard/love/matches/${matchId}`}
          backLabel="Match"
          right={<LWBadge variant="accent">Station 3</LWBadge>}
        />
        <div style={{ padding: SPACE[4], display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
          {[1, 2, 3].map(i => <LWSkeleton key={i} height={96} radius={RADIUS.xl} />)}
        </div>
      </RealmProvider>
    )
  }

  /* ─── Error ─── */

  if (error) {
    return (
      <RealmProvider realm="ufe">
        <LWNav
          title="Dates"
          backHref={`/dashboard/love/matches/${matchId}`}
          backLabel="Match"
          right={<LWBadge variant="accent">Station 3</LWBadge>}
        />
        <LWEmpty
          title="Something went wrong"
          message="Could not load your dates. Please try again."
          action={
            <LWButton variant="secondary" onClick={() => { setLoading(true); load() }}>
              Retry
            </LWButton>
          }
        />
      </RealmProvider>
    )
  }

  /* ─── Render ─── */

  return (
    <RealmProvider realm="ufe">
      <LWNav
        title="Dates"
        backHref={`/dashboard/love/matches/${matchId}`}
        backLabel="Match"
        right={<LWBadge variant="accent">Station 3</LWBadge>}
      />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[16]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[5] }}>

        {/* ── Date Types Intro (shown when empty) ── */}
        {dates.length === 0 && (
          <>
            <LWText scale="caption" color="muted" align="center">
              Build real connection through shared experiences.
            </LWText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
              {(Object.keys(DATE_TYPES) as Array<keyof typeof DATE_TYPES>).map(key => {
                const dt = DATE_TYPES[key]
                return (
                  <LWCard key={key} padding={SPACE[4]}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: RADIUS.lg,
                        background: T.accentMuted,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', flexShrink: 0,
                      }}>
                        {dt.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <LWText scale="body" as="span" style={{ fontWeight: 500 }}>{dt.label}</LWText>
                        <LWText scale="caption" color="muted" as="div" style={{ marginTop: 2 }}>
                          {dt.description}
                        </LWText>
                      </div>
                    </div>
                  </LWCard>
                )
              })}
            </div>
            <LWEmpty
              title="Plan your first date"
              message="Choose a date type and schedule a time to connect with your match."
              action={
                <LWButton variant="primary" onClick={() => setShowSchedule(true)}>
                  Plan a Date
                </LWButton>
              }
            />
          </>
        )}

        {/* ── Upcoming Dates ── */}
        {upcoming.length > 0 && (
          <section>
            <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Upcoming</LWText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
              {upcoming.map(d => (
                <DateCard
                  key={d.id}
                  date={d}
                  onStart={() => handleDateAction(d.id, 'start')}
                  onEnd={() => handleDateAction(d.id, 'end')}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Completed Dates ── */}
        {completed.length > 0 && (
          <section>
            <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Completed</LWText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
              {completed.map(d => (
                <DateCard
                  key={d.id}
                  date={d}
                  onRate={d.rating == null ? () => openRating(d.id) : undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Plan a Date FAB (shown when has dates) ── */}
        {dates.length > 0 && (
          <div style={{
            position: 'fixed', bottom: SPACE[6],
            left: SPACE[4], right: SPACE[4],
            maxWidth: 448, margin: '0 auto',
          }}>
            <LWButton variant="primary" fullWidth onClick={() => setShowSchedule(true)}>
              Plan a Date
            </LWButton>
          </div>
        )}
      </div>

      {/* ═══ Schedule Sheet ═══ */}
      <LWSheet open={showSchedule} onClose={() => setShowSchedule(false)} title="Plan a Date">
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>

          {/* Date type selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
            <LWText scale="caption" color="secondary">Type</LWText>
            <div style={{ display: 'flex', gap: SPACE[2] }}>
              {(Object.keys(DATE_TYPES) as Array<keyof typeof DATE_TYPES>).map(key => {
                const dt = DATE_TYPES[key]
                const selected = scheduleType === key
                return (
                  <button
                    key={key}
                    onClick={() => setScheduleType(key)}
                    style={{
                      flex: 1, padding: `${SPACE[2]}px ${SPACE[1]}px`,
                      background: selected ? T.accentMuted : COLOR.elevated,
                      border: `1px solid ${selected ? T.accent + '40' : COLOR.border}`,
                      borderRadius: RADIUS.md,
                      fontFamily: 'inherit', cursor: 'pointer',
                      ...TYPE.caption,
                      fontWeight: selected ? 600 : 400,
                      color: selected ? T.accent : COLOR.textSecondary,
                      textAlign: 'center', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: SPACE[1],
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{dt.icon}</span>
                    {dt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date + time picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[1] }}>
            <LWText scale="caption" color="secondary" as="label">Date & Time</LWText>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={e => setScheduleAt(e.target.value)}
              style={{
                height: 44, padding: `0 ${SPACE[3]}px`,
                background: COLOR.elevated,
                border: `1px solid ${COLOR.border}`,
                borderRadius: RADIUS.lg,
                color: COLOR.textPrimary,
                fontSize: TYPE.body.fontSize,
                fontFamily: 'inherit', outline: 'none',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Venue (in-person only) */}
          {scheduleType === 'IN_PERSON' && (
            <LWInput
              label="Venue / Location"
              placeholder="e.g., Jollof Cafe, Victoria Island"
              value={scheduleVenue}
              onChange={e => setScheduleVenue(e.target.value)}
            />
          )}

          <LWButton
            variant="primary"
            fullWidth
            loading={scheduling}
            disabled={!scheduleAt}
            onClick={handleSchedule}
          >
            Schedule
          </LWButton>
        </div>
      </LWSheet>

      {/* ═══ Rating Sheet ═══ */}
      <LWSheet open={!!ratingDateId} onClose={() => setRatingDateId(null)} title="Rate This Date">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACE[4] }}>

          <LWText scale="caption" color="secondary">How was the experience?</LWText>

          {/* Star rating */}
          <div style={{ display: 'flex', gap: SPACE[2] }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRatingValue(n)}
                aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                style={{
                  width: 48, height: 48,
                  borderRadius: RADIUS.full,
                  border: `1.5px solid ${ratingValue >= n ? T.accent : COLOR.border}`,
                  background: ratingValue >= n ? T.accentMuted : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: `all ${DURATION.fast} ${EASE.default}`,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={ratingValue >= n ? T.accent : 'none'} stroke={ratingValue >= n ? T.accent : COLOR.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          {/* Reflection */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: SPACE[1] }}>
            <LWText scale="caption" color="secondary" as="label">Reflection (optional)</LWText>
            <textarea
              value={ratingReflection}
              onChange={e => setRatingReflection(e.target.value)}
              placeholder="What made this date special? What would you do differently?"
              rows={3}
              style={{
                padding: `${SPACE[3]}px ${SPACE[4]}px`,
                background: COLOR.elevated,
                border: `1px solid ${COLOR.border}`,
                borderRadius: RADIUS.lg,
                color: COLOR.textPrimary,
                fontSize: TYPE.body.fontSize,
                lineHeight: TYPE.body.lineHeight,
                fontFamily: 'inherit', outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <LWButton
            variant="primary"
            fullWidth
            loading={submittingRating}
            disabled={ratingValue < 1}
            onClick={handleRate}
          >
            Submit Rating
          </LWButton>
        </div>
      </LWSheet>
    </RealmProvider>
  )
}

/* ═════════════════════════════════════════════════════════════
   DateCard — Renders a single date event
   ═════════════════════════════════════════════════════════════ */

function DateCard({
  date,
  onStart,
  onEnd,
  onRate,
}: {
  date: DateEvent
  onStart?: () => void
  onEnd?: () => void
  onRate?: () => void
}) {
  const dt = DATE_TYPES[date.dateType] || DATE_TYPES.VIDEO
  const badge = STATUS_BADGE[date.status] || STATUS_BADGE.SCHEDULED

  return (
    <LWCard padding={SPACE[4]}>
      {/* Header row: icon + info + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACE[3] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3], flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: RADIUS.md,
            background: T.accentMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', flexShrink: 0,
          }}>
            {dt.icon}
          </div>
          <div>
            <LWText scale="body" as="span" style={{ fontWeight: 500 }}>{dt.label}</LWText>
            <LWText scale="caption" color="muted" as="div" style={{ marginTop: 2 }}>
              {formatDateTime(date.scheduledAt)}
            </LWText>
            {date.venue && (
              <LWText scale="caption" color="secondary" as="div" style={{ marginTop: 2 }}>
                {date.venue}
              </LWText>
            )}
          </div>
        </div>
        <LWBadge variant={badge.variant}>{badge.label}</LWBadge>
      </div>

      {/* Rating display for completed dates */}
      {date.status === 'COMPLETED' && date.rating != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[3] }}>
          <LWText scale="caption" color="muted">Rating:</LWText>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <svg key={n} width="14" height="14" viewBox="0 0 24 24"
                fill={n <= (date.rating || 0) ? T.accent : 'none'}
                stroke={n <= (date.rating || 0) ? T.accent : COLOR.borderStrong}
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          {date.reflection && (
            <LWText scale="caption" color="secondary" as="span" style={{ marginLeft: SPACE[1] }}>
              &mdash; &ldquo;{date.reflection}&rdquo;
            </LWText>
          )}
        </div>
      )}

      {/* Action buttons based on status */}
      <div style={{ display: 'flex', gap: SPACE[2], marginTop: SPACE[3], flexWrap: 'wrap' }}>
        {date.status === 'CONFIRMED' && onStart && (
          <LWButton size="sm" variant="primary" onClick={onStart}>
            {date.dateType === 'VIDEO' ? 'Start Video Call' : date.dateType === 'VOICE' ? 'Start Voice Call' : 'Start Date'}
          </LWButton>
        )}
        {date.status === 'IN_PROGRESS' && onEnd && (
          <LWButton size="sm" variant="secondary" onClick={onEnd}>
            End Date
          </LWButton>
        )}
        {date.status === 'COMPLETED' && date.rating == null && onRate && (
          <LWButton size="sm" variant="secondary" onClick={onRate}>
            Rate This Date
          </LWButton>
        )}
      </div>
    </LWCard>
  )
}
