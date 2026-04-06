'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loveWorldApi } from '../../../../../../lib/api'
import { useAuthStore } from '../../../../../../stores/authStore'

interface VirtualDate {
  id: string; dateType: string; scheduledAt: string; status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  rating?: number; reflection?: string; partnerRating?: number; createdAt: string
}

const DATE_TYPES = [
  { key: 'VIDEO_CALL', label: 'Video Call', icon: '\uD83D\uDCF9' },
  { key: 'COOKING_TOGETHER', label: 'Cooking Together', icon: '\uD83C\uDF73' },
  { key: 'CULTURAL_QUIZ', label: 'Cultural Quiz', icon: '\uD83C\uDFAD' },
  { key: 'MOVIE_WATCH', label: 'Movie Watch', icon: '\uD83C\uDFAC' },
  { key: 'PRAYER_MEDITATION', label: 'Prayer / Meditation', icon: '\uD83D\uDE4F' },
  { key: 'CUSTOM', label: 'Custom', icon: '\u2728' },
] as const

const GOLD = '#D4AF37'
const BG = '#0A0A0F'
const CARD = '#111118'
const CARD2 = '#1A1A25'
const GREEN = '#00C853'
const RED = '#FF3B30'
const WHITE = '#FFFFFF'
const BLUE = '#4A90D9'

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: BLUE,
  IN_PROGRESS: GREEN,
  COMPLETED: GOLD,
}

export default function VirtualDatesPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  const [dates, setDates] = useState<VirtualDate[]>([])
  const [loading, setLoading] = useState(true)
  const [dayNum, setDayNum] = useState(1)

  // Schedule form
  const [showSchedule, setShowSchedule] = useState(false)
  const [schedType, setSchedType] = useState('VIDEO_CALL')
  const [schedDate, setSchedDate] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [scheduling, setScheduling] = useState(false)

  // Rating form
  const [ratingDateId, setRatingDateId] = useState<string | null>(null)
  const [ratingStars, setRatingStars] = useState(0)
  const [ratingText, setRatingText] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

  const fetchData = useCallback(async () => {
    if (!matchId) return
    try {
      const res = await loveWorldApi.getDates(matchId).catch(() => ({ data: [] }))
      const arr = Array.isArray(res) ? res : res?.data || []
      setDates(arr.sort((a: VirtualDate, b: VirtualDate) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()))
      if (res?.dayNumber) setDayNum(res.dayNumber)
    } catch { /* silent */ } finally { setLoading(false) }
  }, [matchId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSchedule = async () => {
    if (!matchId || !schedDate || !schedTime) return
    setScheduling(true)
    try {
      const scheduledAt = new Date(`${schedDate}T${schedTime}`).toISOString()
      await loveWorldApi.scheduleDate(matchId, { dateType: schedType, scheduledAt })
      setShowSchedule(false)
      setSchedDate('')
      setSchedTime('')
      await fetchData()
    } catch { /* silent */ } finally { setScheduling(false) }
  }

  const handleAction = async (dateId: string, action: 'start' | 'end') => {
    if (!matchId) return
    try {
      await loveWorldApi.updateDate(matchId, dateId, action)
      await fetchData()
      if (action === 'end') setRatingDateId(dateId)
    } catch { /* silent */ }
  }

  const handleRate = async () => {
    if (!matchId || !ratingDateId || ratingStars === 0) return
    setSubmittingRating(true)
    try {
      await loveWorldApi.rateDate(matchId, ratingDateId, {
        rating: ratingStars,
        reflection: ratingText.trim() || undefined,
      })
      setRatingDateId(null)
      setRatingStars(0)
      setRatingText('')
      await fetchData()
    } catch { /* silent */ } finally { setSubmittingRating(false) }
  }

  const typeInfo = (key: string) => DATE_TYPES.find(d => d.key === key) || { key, label: key, icon: '\u2728' }

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: GOLD, fontFamily: 'monospace', fontSize: 14 }}>Loading Virtual Dates...</p>
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'monospace', color: WHITE, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${CARD2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 20, cursor: 'pointer', padding: 0 }}>
            &larr;
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, color: GOLD, fontFamily: 'monospace' }}>Virtual Dates</h1>
          </div>
          <span style={{ fontSize: 11, color: WHITE, opacity: 0.6 }}>Day {dayNum}/14</span>
        </div>
        <div style={{ marginTop: 10, height: 4, background: CARD2, borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${(dayNum / 14) * 100}%`, background: GOLD, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Schedule Button */}
      <div style={{ padding: '12px 16px' }}>
        <button onClick={() => setShowSchedule(!showSchedule)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px dashed ${GOLD}`,
            background: showSchedule ? CARD : 'transparent', color: GOLD,
            fontFamily: 'monospace', fontSize: 14, cursor: 'pointer', fontWeight: 600,
          }}>
          {showSchedule ? 'Cancel' : '+ Schedule New Date'}
        </button>
      </div>

      {/* Schedule Form */}
      {showSchedule && (
        <div style={{ margin: '0 16px 16px', background: CARD, borderRadius: 14, padding: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: GOLD, fontWeight: 600 }}>Choose Date Type</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {DATE_TYPES.map(dt => (
              <button key={dt.key} onClick={() => setSchedType(dt.key)}
                style={{
                  padding: '10px 8px', borderRadius: 10, border: `1px solid ${schedType === dt.key ? GOLD : CARD2}`,
                  background: schedType === dt.key ? `${GOLD}22` : CARD2, color: WHITE,
                  fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', textAlign: 'center',
                }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{dt.icon}</div>
                {dt.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block', marginBottom: 4 }}>Date</label>
              <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${CARD2}`,
                  background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block', marginBottom: 4 }}>Time</label>
              <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${CARD2}`,
                  background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }} />
            </div>
          </div>

          <button onClick={handleSchedule} disabled={scheduling || !schedDate || !schedTime}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, background: GOLD, color: BG,
              border: 'none', fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
              cursor: scheduling ? 'wait' : 'pointer', opacity: (scheduling || !schedDate || !schedTime) ? 0.5 : 1,
            }}>
            {scheduling ? 'Scheduling...' : 'Schedule Date'}
          </button>
        </div>
      )}

      {/* Rating Modal */}
      {ratingDateId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: CARD, borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: GOLD, fontFamily: 'monospace' }}>Rate Your Date</h3>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRatingStars(star)}
                  style={{
                    background: 'none', border: 'none', fontSize: 32, cursor: 'pointer',
                    color: star <= ratingStars ? GOLD : CARD2, transition: 'color 0.15s',
                  }}>
                  &#9733;
                </button>
              ))}
            </div>
            <textarea value={ratingText} onChange={e => setRatingText(e.target.value)}
              placeholder="Share your reflection... (optional)"
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${CARD2}`,
                background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                resize: 'none', marginBottom: 14, boxSizing: 'border-box',
              }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setRatingDateId(null); setRatingStars(0); setRatingText('') }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, background: CARD2, color: WHITE,
                  border: 'none', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
                }}>
                Skip
              </button>
              <button onClick={handleRate} disabled={submittingRating || ratingStars === 0}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, background: GOLD, color: BG,
                  border: 'none', fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
                  cursor: submittingRating ? 'wait' : 'pointer', opacity: (submittingRating || ratingStars === 0) ? 0.5 : 1,
                }}>
                {submittingRating ? '...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dates List */}
      <div style={{ padding: '0 16px' }}>
        {dates.length === 0 && !showSchedule && (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>&#128197;</p>
            <p style={{ fontSize: 13 }}>No dates yet. Schedule your first virtual date!</p>
          </div>
        )}
        {dates.map(d => {
          const info = typeInfo(d.dateType)
          const statusColor = STATUS_COLORS[d.status] || BLUE
          return (
            <div key={d.id} style={{
              background: CARD, borderRadius: 14, padding: 14, marginBottom: 12,
              borderLeft: `3px solid ${statusColor}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{info.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{info.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                    {new Date(d.scheduledAt).toLocaleDateString()} at {new Date(d.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                  background: `${statusColor}22`, color: statusColor, textTransform: 'uppercase',
                }}>
                  {d.status.replace('_', ' ')}
                </span>
              </div>

              {/* Rating display */}
              {d.status === 'COMPLETED' && d.rating && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ fontSize: 14, color: s <= d.rating! ? GOLD : CARD2 }}>&#9733;</span>
                    ))}
                    {d.partnerRating != null && (
                      <span style={{ fontSize: 10, color: WHITE, opacity: 0.5, marginLeft: 8, alignSelf: 'center' }}>
                        Partner: {d.partnerRating}/5
                      </span>
                    )}
                  </div>
                  {d.reflection && <p style={{ margin: 0, fontSize: 12, opacity: 0.7, fontStyle: 'italic' }}>{d.reflection}</p>}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {d.status === 'SCHEDULED' && (
                  <button onClick={() => handleAction(d.id, 'start')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, background: GREEN, color: BG,
                      border: 'none', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>
                    Start Date
                  </button>
                )}
                {d.status === 'IN_PROGRESS' && (
                  <button onClick={() => handleAction(d.id, 'end')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, background: RED, color: WHITE,
                      border: 'none', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>
                    End Date
                  </button>
                )}
                {d.status === 'COMPLETED' && !d.rating && (
                  <button onClick={() => setRatingDateId(d.id)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, background: GOLD, color: BG,
                      border: 'none', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>
                    Rate This Date
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
