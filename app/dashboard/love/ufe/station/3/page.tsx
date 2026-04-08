/**
 * UFÈ — Station 3: Experience Layer
 * Virtual + real-world integration. Date scheduling and reflection.
 * 14-day window. Final 80 questions. Family & future planning.
 */
'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav, LWBadge,
  LWDivider, LWEmpty, LWSheet, LWInput, Spinner,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const T = REALM.ufe

const DATE_TYPES = [
  { key: 'video_call', icon: '📹', label: 'Video Call', desc: 'Face-to-face virtual date' },
  { key: 'virtual_tour', icon: '🌍', label: 'Virtual Tour', desc: 'Explore a location together online' },
  { key: 'cooking', icon: '🍳', label: 'Cook Together', desc: 'Prepare a meal together virtually' },
  { key: 'game_night', icon: '🎮', label: 'Game Night', desc: 'Play games and have fun' },
  { key: 'prayer', icon: '🕊️', label: 'Prayer Together', desc: 'Share spiritual time together' },
  { key: 'real_world', icon: '☕', label: 'Real-World Date', desc: 'Meet in person at a safe location' },
]

interface ScheduledDate {
  id: string
  dateType: string
  scheduledAt: string
  status: 'SCHEDULED' | 'STARTED' | 'COMPLETED' | 'CANCELLED'
  rating?: number
  reflection?: string
}

export default function ExperienceLayerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('matchId') || ''

  const [dates, setDates] = React.useState<ScheduledDate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showSchedule, setShowSchedule] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string | null>(null)
  const [dateTime, setDateTime] = React.useState('')
  const [scheduling, setScheduling] = React.useState(false)
  const [showRate, setShowRate] = React.useState<ScheduledDate | null>(null)
  const [rating, setRating] = React.useState(0)
  const [reflection, setReflection] = React.useState('')

  const loadDates = React.useCallback(async () => {
    if (!matchId) { setLoading(false); return }
    try {
      const res = await loveWorldApi.getDates(matchId)
      setDates(Array.isArray(res) ? res : res?.dates ?? [])
    } catch (e) { logApiFailure('love/station3/dates', e); setDates([]) }
    setLoading(false)
  }, [matchId])

  React.useEffect(() => { loadDates() }, [loadDates])

  const handleSchedule = async () => {
    if (!selectedType || !dateTime || !matchId) return
    setScheduling(true)
    try {
      await loveWorldApi.scheduleDate(matchId, { dateType: selectedType, scheduledAt: new Date(dateTime).toISOString() })
      setShowSchedule(false)
      setSelectedType(null)
      setDateTime('')
      loadDates()
    } catch (e) { logApiFailure('love/station3/schedule', e) }
    setScheduling(false)
  }

  const handleRate = async () => {
    if (!showRate || !matchId || rating === 0) return
    try {
      await loveWorldApi.rateDate(matchId, showRate.id, { rating, reflection })
      setShowRate(null)
      setRating(0)
      setReflection('')
      loadDates()
    } catch (e) { logApiFailure('love/station3/rate', e) }
  }

  const completedCount = dates.filter(d => d.status === 'COMPLETED').length
  const scheduledCount = dates.filter(d => d.status === 'SCHEDULED').length

  return (
    <RealmProvider realm="ufe">
      <LWNav title="Experience Layer" backHref={matchId ? `/dashboard/love/matches/${matchId}` : '/dashboard/love/ufe'} backLabel="Back" />
      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[16]}px`, maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>

        {/* Station header */}
        <LWCard padding={SPACE[4]} style={{ borderColor: `${T.accent}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
            <div style={{ width: 40, height: 40, borderRadius: RADIUS.full, background: T.accentMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💍</div>
            <div style={{ flex: 1 }}>
              <LWText scale="h3" as="h2">Station 3: Experience Layer</LWText>
              <LWText scale="caption" color="muted">Virtual dates, real-world meets, reflection.</LWText>
            </div>
            <LWBadge variant="accent">14 Days</LWBadge>
          </div>
        </LWCard>

        {/* Stats */}
        <div style={{ display: 'flex', gap: SPACE[3] }}>
          <LWCard padding={SPACE[3]} style={{ flex: 1, textAlign: 'center' }}>
            <LWText scale="h2" color="accent" as="div">{completedCount}</LWText>
            <LWText scale="micro" color="muted">Completed</LWText>
          </LWCard>
          <LWCard padding={SPACE[3]} style={{ flex: 1, textAlign: 'center' }}>
            <LWText scale="h2" as="div">{scheduledCount}</LWText>
            <LWText scale="micro" color="muted">Upcoming</LWText>
          </LWCard>
          <LWCard padding={SPACE[3]} style={{ flex: 1, textAlign: 'center' }}>
            <LWText scale="h2" color="secondary" as="div">{dates.length}</LWText>
            <LWText scale="micro" color="muted">Total</LWText>
          </LWCard>
        </div>

        {/* Schedule button */}
        <LWButton variant="primary" fullWidth onClick={() => setShowSchedule(true)}>
          Schedule a Date
        </LWButton>

        {/* Dates list */}
        <section>
          <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Your Dates</LWText>
          {loading ? (
            <div style={{ textAlign: 'center', padding: SPACE[8] }}><Spinner size={24} color={T.accent} /></div>
          ) : dates.length === 0 ? (
            <LWEmpty title="No dates yet" message="Schedule your first virtual or real-world date to deepen your connection." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
              {dates.map(d => {
                const typeInfo = DATE_TYPES.find(t => t.key === d.dateType)
                const statusVariant = d.status === 'COMPLETED' ? 'success' as const
                  : d.status === 'STARTED' ? 'accent' as const
                  : d.status === 'CANCELLED' ? 'danger' as const
                  : 'default' as const
                return (
                  <LWCard key={d.id} padding={SPACE[4]}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
                      <span style={{ fontSize: 24 }}>{typeInfo?.icon || '📅'}</span>
                      <div style={{ flex: 1 }}>
                        <LWText scale="body" as="span" style={{ fontWeight: 500 }}>{typeInfo?.label || d.dateType}</LWText>
                        <LWText scale="caption" color="muted" as="div" style={{ marginTop: 2 }}>
                          {new Date(d.scheduledAt).toLocaleDateString()} at {new Date(d.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </LWText>
                      </div>
                      <LWBadge variant={statusVariant}>{d.status}</LWBadge>
                    </div>
                    {d.status === 'COMPLETED' && !d.rating && (
                      <LWButton variant="secondary" size="sm" style={{ marginTop: SPACE[3] }} onClick={() => setShowRate(d)}>
                        Rate & Reflect
                      </LWButton>
                    )}
                    {d.rating && (
                      <div style={{ marginTop: SPACE[2], display: 'flex', alignItems: 'center', gap: SPACE[1] }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ fontSize: 16, opacity: i < d.rating! ? 1 : 0.2 }}>⭐</span>
                        ))}
                      </div>
                    )}
                  </LWCard>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Schedule sheet */}
      <LWSheet open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule a Date">
        <LWText scale="caption" color="secondary" style={{ marginBottom: SPACE[3] }}>Choose a date type</LWText>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACE[2], marginBottom: SPACE[4] }}>
          {DATE_TYPES.map(dt => (
            <button
              key={dt.key}
              onClick={() => setSelectedType(dt.key)}
              style={{
                padding: SPACE[3], background: selectedType === dt.key ? T.accentMuted : COLOR.card,
                border: `1px solid ${selectedType === dt.key ? T.accent : COLOR.border}`,
                borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 20 }}>{dt.icon}</span>
              <LWText scale="caption" as="div" style={{ fontWeight: 500, marginTop: SPACE[1] }}>{dt.label}</LWText>
              <LWText scale="micro" color="muted" as="div">{dt.desc}</LWText>
            </button>
          ))}
        </div>
        <LWInput label="Date & Time" type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />
        <div style={{ display: 'flex', gap: SPACE[2], marginTop: SPACE[4] }}>
          <LWButton variant="ghost" fullWidth onClick={() => setShowSchedule(false)}>Cancel</LWButton>
          <LWButton variant="primary" fullWidth loading={scheduling} disabled={!selectedType || !dateTime} onClick={handleSchedule}>Schedule</LWButton>
        </div>
      </LWSheet>

      {/* Rate sheet */}
      <LWSheet open={!!showRate} onClose={() => setShowRate(null)} title="Rate Your Date">
        <LWText scale="caption" color="secondary" style={{ marginBottom: SPACE[3] }}>How was the experience?</LWText>
        <div style={{ display: 'flex', justifyContent: 'center', gap: SPACE[2], marginBottom: SPACE[4] }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, opacity: star <= rating ? 1 : 0.2, transition: `opacity ${DURATION.fast}` }}
            >⭐</button>
          ))}
        </div>
        <LWInput label="Reflection (optional)" placeholder="What did you learn about each other?" value={reflection} onChange={e => setReflection(e.target.value)} />
        <LWButton variant="primary" fullWidth style={{ marginTop: SPACE[4] }} disabled={rating === 0} onClick={handleRate}>Submit</LWButton>
      </LWSheet>
    </RealmProvider>
  )
}
