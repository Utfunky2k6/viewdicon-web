'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

// ═══════════════════════════════════════════════════════════════════════
// LOVE WORLD — COVENANT JOURNEY MAP (Treasure Timeline)
// Route: /dashboard/love/matches/[matchId]/treasure
// ═══════════════════════════════════════════════════════════════════════

const GOLD = '#D4AF37'
const BG = '#0A0A0F'
const CARD = '#111118'
const CARD2 = '#1A1A25'
const GREEN = '#00C853'
const RED = '#FF3B30'
const BLUE = '#4A90D9'
const PURPLE = '#8B5CF6'
const WHITE = '#FFFFFF'

type MilestoneType =
  | 'FIRST_CONVERSATION'
  | 'FIRST_AGREEMENT'
  | 'FIRST_VISIT'
  | 'FIRST_CONFLICT_RESOLVED'
  | 'PROPOSAL'
  | 'MARRIAGE'

interface Milestone {
  id: string
  type: MilestoneType
  title: string
  description: string
  photoUrl?: string
  location?: string
  achievedAt: string
}

const MILESTONE_DEFS: { type: MilestoneType; icon: string; label: string; order: number }[] = [
  { type: 'FIRST_CONVERSATION', icon: '\uD83D\uDCAC', label: 'First Conversation', order: 1 },
  { type: 'FIRST_AGREEMENT',    icon: '\uD83E\uDD1D', label: 'First Agreement',    order: 2 },
  { type: 'FIRST_VISIT',        icon: '\uD83C\uDFE0', label: 'First Visit',        order: 3 },
  { type: 'FIRST_CONFLICT_RESOLVED', icon: '\uD83D\uDD4A\uFE0F', label: 'First Conflict Resolved', order: 4 },
  { type: 'PROPOSAL',           icon: '\uD83D\uDC8D', label: 'Proposal',           order: 5 },
  { type: 'MARRIAGE',           icon: '\uD83D\uDC51', label: 'Marriage',            order: 6 },
]

const MOCK_MILESTONES: Milestone[] = [
  { id: 'ms-1', type: 'FIRST_CONVERSATION', title: 'Our First Words', description: 'We talked for three hours about heritage and dreams.', location: 'Virtual - Video Call', achievedAt: '2026-01-15T14:30:00Z' },
  { id: 'ms-2', type: 'FIRST_AGREEMENT', title: 'Values Alignment', description: 'We agreed on family structure and spiritual foundations.', location: 'Guided Chat Room', achievedAt: '2026-01-28T18:00:00Z' },
  { id: 'ms-3', type: 'FIRST_VISIT', title: 'Meeting in Lagos', description: 'Visited the family compound. The elders gave their blessing.', photoUrl: '', location: 'Lagos, Nigeria', achievedAt: '2026-02-14T10:00:00Z' },
]

const KEYFRAMES = `
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(212,175,55,0.3); }
  50% { box-shadow: 0 0 20px rgba(212,175,55,0.6); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes lineGrow {
  from { height: 0; }
  to { height: 100%; }
}
`

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('afk-auth')
    const state = stored ? JSON.parse(stored)?.state : null
    return state?.accessToken ?? state?.token ?? null
  } catch { return null }
}

export default function TreasureMapPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add form
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<MilestoneType>('FIRST_CONVERSATION')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPhoto, setFormPhoto] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchMilestones = useCallback(async () => {
    if (!matchId) return
    try {
      const token = getToken()
      const res = await fetch(`/api/love/journey/${matchId}/map`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      const arr = Array.isArray(data) ? data : data?.milestones || data?.data || []
      setMilestones(arr)
      setError(null)
    } catch {
      setMilestones(MOCK_MILESTONES)
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => { fetchMilestones() }, [fetchMilestones])

  useEffect(() => {
    const tag = document.createElement('style')
    tag.textContent = KEYFRAMES
    document.head.appendChild(tag)
    return () => { document.head.removeChild(tag) }
  }, [])

  const handleSubmit = async () => {
    if (!matchId || !formTitle.trim()) return
    setSubmitting(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/love/journey/${matchId}/map`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          title: formTitle.trim(),
          description: formDesc.trim(),
          photoUrl: formPhoto.trim() || undefined,
          location: formLocation.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setShowForm(false)
      setFormTitle('')
      setFormDesc('')
      setFormPhoto('')
      setFormLocation('')
      await fetchMilestones()
    } catch {
      setError('Could not save milestone. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const achievedTypes = new Set(milestones.map(m => m.type))
  const achievedCount = MILESTONE_DEFS.filter(d => achievedTypes.has(d.type)).length
  const progressPct = Math.round((achievedCount / 6) * 100)

  const getMilestone = (type: MilestoneType): Milestone | undefined =>
    milestones.find(m => m.type === type)

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: GOLD, fontFamily: 'monospace', fontSize: 14 }}>Loading Journey Map...</p>
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'monospace', color: WHITE, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${CARD2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 20, cursor: 'pointer', padding: 0, fontFamily: 'monospace' }}>
            &larr;
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, color: GOLD, fontFamily: 'monospace', letterSpacing: 1 }}>
              {'\uD83D\uDDFA\uFE0F'} COVENANT JOURNEY MAP
            </h1>
          </div>
        </div>
      </div>

      {/* Journey Stats Bar */}
      <div style={{ padding: '14px 16px', background: CARD, margin: '12px 16px', borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: WHITE, opacity: 0.8 }}>
            {achievedCount} of 6 milestones reached
          </span>
          <span style={{ fontSize: 13, color: GOLD, fontWeight: 700 }}>{progressPct}%</span>
        </div>
        <div style={{ height: 6, background: CARD2, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPct}%`, borderRadius: 3, transition: 'width 0.5s ease',
            background: `linear-gradient(90deg, ${GOLD}, #F5D76E)`,
          }} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '0 16px 12px', padding: '10px 14px', borderRadius: 10, background: `${RED}22`, color: RED, fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Vertical Timeline */}
      <div style={{ padding: '12px 16px', position: 'relative' }}>
        {MILESTONE_DEFS.map((def, idx) => {
          const ms = getMilestone(def.type)
          const achieved = !!ms
          const isLast = idx === MILESTONE_DEFS.length - 1

          return (
            <div key={def.type} style={{ display: 'flex', gap: 16, marginBottom: isLast ? 0 : 0, position: 'relative' }}>
              {/* Timeline column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                {/* Node */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                  background: achieved ? `${GOLD}22` : 'transparent',
                  border: achieved ? `2px solid ${GOLD}` : `2px dashed #444`,
                  animation: achieved ? 'goldPulse 2s ease-in-out infinite' : 'none',
                }}>
                  {def.icon}
                </div>
                {/* Connecting line */}
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 20,
                    background: achieved && getMilestone(MILESTONE_DEFS[idx + 1]?.type) ? GOLD : '#333',
                    borderStyle: achieved ? 'solid' : 'none',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{
                flex: 1, paddingBottom: isLast ? 0 : 20,
                animation: achieved ? 'fadeSlideUp 0.4s ease forwards' : 'none',
              }}>
                {achieved ? (
                  <div style={{
                    background: CARD, borderRadius: 14, padding: 16,
                    borderLeft: `3px solid ${GOLD}`,
                  }}>
                    <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 }}>
                      {def.label}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 6 }}>
                      {ms.title}
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: WHITE, opacity: 0.7, lineHeight: 1.5 }}>
                      {ms.description}
                    </p>
                    {ms.photoUrl && (
                      <div style={{
                        width: '100%', height: 120, borderRadius: 10, background: CARD2,
                        marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#666', overflow: 'hidden',
                      }}>
                        {ms.photoUrl ? (
                          <img src={ms.photoUrl} alt={ms.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          'Photo placeholder'
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {ms.location && (
                        <span style={{ fontSize: 11, color: BLUE, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {'\uD83D\uDCCD'} {ms.location}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#888' }}>
                        {'\uD83D\uDCC5'} {new Date(ms.achievedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'transparent', borderRadius: 14, padding: '14px 16px',
                    border: `1px dashed #333`,
                  }}>
                    <div style={{ fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 }}>
                      {def.label}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#555', fontStyle: 'italic' }}>
                      Not yet reached
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Milestone Button */}
      <div style={{ padding: '16px 16px 0' }}>
        <button onClick={() => setShowForm(!showForm)} style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: `1px dashed ${GOLD}`, background: showForm ? CARD : 'transparent',
          color: GOLD, fontFamily: 'monospace', fontSize: 14, cursor: 'pointer', fontWeight: 600,
        }}>
          {showForm ? 'Cancel' : '+ Record New Milestone'}
        </button>
      </div>

      {/* Add Milestone Form */}
      {showForm && (
        <div style={{ margin: '12px 16px 0', background: CARD, borderRadius: 14, padding: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: GOLD, fontWeight: 600 }}>Milestone Type</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {MILESTONE_DEFS.map(def => (
              <button key={def.type} onClick={() => setFormType(def.type)} style={{
                padding: '10px 8px', borderRadius: 10,
                border: `1px solid ${formType === def.type ? GOLD : CARD2}`,
                background: formType === def.type ? `${GOLD}22` : CARD2,
                color: WHITE, fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{def.icon}</div>
                {def.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, opacity: 0.6, display: 'block', marginBottom: 4 }}>Title</label>
            <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
              placeholder="Name this milestone..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${CARD2}`,
                background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                boxSizing: 'border-box',
              }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, opacity: 0.6, display: 'block', marginBottom: 4 }}>Description</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
              placeholder="Tell the story of this moment..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${CARD2}`,
                background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                resize: 'none', boxSizing: 'border-box',
              }} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block', marginBottom: 4 }}>Photo URL (optional)</label>
              <input type="url" value={formPhoto} onChange={e => setFormPhoto(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${CARD2}`,
                  background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block', marginBottom: 4 }}>Location (optional)</label>
              <input type="text" value={formLocation} onChange={e => setFormLocation(e.target.value)}
                placeholder="Lagos, Nigeria"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${CARD2}`,
                  background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }} />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting || !formTitle.trim()}
            style={{
              width: '100%', padding: '12px', borderRadius: 10,
              background: `linear-gradient(135deg, ${GOLD}, #F5D76E)`,
              color: BG, border: 'none', fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
              cursor: submitting ? 'wait' : 'pointer',
              opacity: (submitting || !formTitle.trim()) ? 0.5 : 1,
            }}>
            {submitting ? 'Recording...' : 'Record Milestone'}
          </button>
        </div>
      )}
    </div>
  )
}
