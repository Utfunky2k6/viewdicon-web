/**
 * ÀJỌ CONNECT — Professional Network Home
 *
 * Structured marketplace. Professional clarity.
 * Service-based UI. Trust and verification visible.
 * Transaction flows clean and predictable.
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWNav, LWText, LWButton, LWCard,
  LWBadge, LWAvatar, LWSkeleton,
} from '@/components/love-world/primitives'
import { ajoConnectApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const T = REALM.ajo

/* ─── Types ─── */
interface AjoProfile {
  exists: boolean
  displayName?: string
  photo?: string | null
  verified: boolean
  skills: string[]
  rating: number
  completedSessions: number
}
interface Mentor {
  id: string
  name: string
  photo?: string | null
  verified: boolean
  specialty: string
  rating: number
  reviews: number
}
interface Booking {
  id: string
  providerName: string
  service: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  scheduledFor?: string
}
interface Circle {
  id: string
  name: string
  members: number
  category: string
  joined: boolean
}

/* ─── Stars ─── */
function Stars({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width="10" height="10" viewBox="0 0 24 24"
          fill={n <= Math.round(value) ? T.accent : 'none'}
          stroke={T.accent} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

/* ─── Mentor Card ─── */
function MentorCard({ mentor, onBook }: { mentor: Mentor; onBook: () => void }) {
  return (
    <div style={{
      flexShrink: 0, width: 196, padding: SPACE[4],
      background: T.card, border: `1px solid ${COLOR.border}`,
      borderRadius: RADIUS.xl, display: 'flex', flexDirection: 'column', gap: SPACE[2],
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
        <LWAvatar src={mentor.photo} name={mentor.name} size={40} verified={mentor.verified} />
        <div style={{ minWidth: 0 }}>
          <LWText scale="caption" as="div" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mentor.name}
          </LWText>
          <Stars value={mentor.rating} />
        </div>
      </div>
      <LWText scale="caption" color="secondary">{mentor.specialty}</LWText>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACE[1] }}>
        <LWText scale="micro" color="muted">{mentor.reviews} reviews</LWText>
        <button onClick={onBook} style={{
          background: T.accentMuted, border: 'none', borderRadius: RADIUS.md,
          padding: `${SPACE[1]}px ${SPACE[2]}px`, cursor: 'pointer',
          fontFamily: 'inherit', ...TYPE.micro, color: T.accent, fontWeight: 600,
        }}>
          Book
        </button>
      </div>
    </div>
  )
}

const BOOKING_VARIANT: Record<string, 'success' | 'accent' | 'warning' | 'default'> = {
  CONFIRMED: 'success', PENDING: 'warning', COMPLETED: 'accent', CANCELLED: 'default',
}

/* ─── Mock fallbacks ─── */
const MOCK_MENTORS: Mentor[] = [
  { id: '1', name: 'Chinelo Adaeze', photo: null, verified: true, specialty: 'Product Management', rating: 4.9, reviews: 142 },
  { id: '2', name: 'Kwame Mensah', photo: null, verified: true, specialty: 'Software Engineering', rating: 4.8, reviews: 98 },
  { id: '3', name: 'Fatima Diallo', photo: null, verified: true, specialty: 'Business Strategy', rating: 4.7, reviews: 87 },
]

const MOCK_CIRCLES: Circle[] = [
  { id: '1', name: 'Lagos Devs Pod', members: 312, category: 'Technology', joined: false },
  { id: '2', name: 'Nairobi Creatives', members: 184, category: 'Creative', joined: false },
  { id: '3', name: 'Accra Founders', members: 243, category: 'Startups', joined: true },
]

/* ─── Main Page ─── */
export default function AjoConnectHome() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [profile, setProfile] = React.useState<AjoProfile | null>(null)
  const [mentors, setMentors] = React.useState<Mentor[]>([])
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [circles, setCircles] = React.useState<Circle[]>([])

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    const [profileRes, mentorsRes, bookingsRes, circlesRes] = await Promise.allSettled([
      ajoConnectApi.getProfile(),
      ajoConnectApi.getMentors(),
      ajoConnectApi.myClientBookings(),
      ajoConnectApi.getCircles(),
    ])

    const prof = profileRes.status === 'fulfilled' ? profileRes.value : null
    const ments = mentorsRes.status === 'fulfilled' ? mentorsRes.value : null
    const books = bookingsRes.status === 'fulfilled' ? bookingsRes.value : null
    const circs = circlesRes.status === 'fulfilled' ? circlesRes.value : null

    const p = prof?.profile || prof
    setProfile(p ? {
      exists: true,
      displayName: p.displayName || p.name,
      photo: p.photo,
      verified: p.verified || false,
      skills: p.skills || [],
      rating: p.rating || 0,
      completedSessions: p.completedSessions || 0,
    } : { exists: false, verified: false, skills: [], rating: 0, completedSessions: 0 })

    setMentors(ments?.mentors?.slice(0, 6).map((m: Record<string, unknown>) => ({
      id: m.id as string,
      name: (m.displayName || m.name) as string,
      photo: m.photo as string | null,
      verified: (m.verified || false) as boolean,
      specialty: (m.specialty || (m.skills as string[])?.[0] || 'Mentor') as string,
      rating: (m.rating || 4.8) as number,
      reviews: (m.reviewCount || m.reviews || 0) as number,
    })) || (USE_MOCKS ? MOCK_MENTORS : []))

    setBookings(books?.bookings?.map((b: Record<string, unknown>) => ({
      id: b.id as string,
      providerName: (b.providerName || (b.provider as Record<string, unknown>)?.name || 'Provider') as string,
      service: (b.service || b.title || 'Session') as string,
      status: b.status as Booking['status'],
      scheduledFor: b.scheduledFor as string | undefined,
    })) || [])

    setCircles(circs?.circles?.slice(0, 4).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: c.name as string,
      members: (c.memberCount || c.members || 0) as number,
      category: (c.category || 'General') as string,
      joined: (c.joined || false) as boolean,
    })) || (USE_MOCKS ? MOCK_CIRCLES : []))

    setLoading(false)
  }

  if (loading) {
    return (
      <RealmProvider realm="ajo">
        <LWNav title="ÀJỌ CONNECT" backHref="/dashboard/love" backLabel="Realms" />
        <div style={{ padding: `${SPACE[5]}px ${SPACE[4]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
          <LWSkeleton height={84} radius={RADIUS.xl} />
          <LWSkeleton height={44} radius={RADIUS.lg} />
          <div style={{ display: 'flex', gap: SPACE[3] }}>
            {[1, 2].map(i => <LWSkeleton key={i} width={196} height={130} radius={RADIUS.xl} style={{ flexShrink: 0 }} />)}
          </div>
        </div>
      </RealmProvider>
    )
  }

  const hasProfile = profile?.exists
  const activeBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED')

  return (
    <RealmProvider realm="ajo">
      <LWNav title="ÀJỌ CONNECT" backHref="/dashboard/love" backLabel="Realms" />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[12]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[6] }}>

        {/* Profile Summary */}
        {hasProfile ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: SPACE[3],
            padding: SPACE[4], background: T.card,
            border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.xl,
          }}>
            <LWAvatar src={profile?.photo} name={profile?.displayName} size={52} verified={profile?.verified} />
            <div style={{ flex: 1 }}>
              <LWText scale="h3">{profile?.displayName}</LWText>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[1] }}>
                <Stars value={profile?.rating || 0} />
                <LWText scale="caption" color="muted">{profile?.completedSessions} sessions</LWText>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE[1], marginTop: SPACE[2] }}>
                {(profile?.skills || []).slice(0, 3).map(s => <LWBadge key={s} variant="accent">{s}</LWBadge>)}
              </div>
            </div>
          </div>
        ) : (
          <LWCard padding={SPACE[5]} style={{ background: T.accentMuted, borderColor: `${T.accent}20` }}>
            <LWText scale="h3" style={{ marginBottom: SPACE[2] }}>Build Your Professional Profile</LWText>
            <LWText scale="caption" color="secondary" style={{ marginBottom: SPACE[4] }}>
              Offer your expertise or find verified mentors across Africa.
            </LWText>
            <LWButton variant="primary" onClick={() => router.push('/dashboard/love/ajo/create')}>
              Create Profile
            </LWButton>
          </LWCard>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: SPACE[3] }}>
          {[
            { label: 'Find Services', icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z', to: '/dashboard/love/ajo/create' },
            { label: 'My Bookings', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2', to: '/dashboard/love/ajo' },
            { label: 'Circles', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', to: '/dashboard/love/ajo' },
          ].map(a => (
            <button key={a.label} onClick={() => router.push(a.to)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACE[2],
              padding: `${SPACE[3]}px ${SPACE[2]}px`, background: COLOR.elevated,
              border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.lg,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={a.icon} />
              </svg>
              <LWText scale="micro" color="secondary" as="span" style={{ textAlign: 'center', fontWeight: 500 }}>{a.label}</LWText>
            </button>
          ))}
        </div>

        {/* Mentors */}
        <section>
          <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Top Mentors</LWText>
          <div style={{ display: 'flex', gap: SPACE[3], overflowX: 'auto', paddingBottom: SPACE[1], scrollbarWidth: 'none' }}>
            {mentors.map(m => (
              <MentorCard key={m.id} mentor={m} onBook={() => {}} />
            ))}
          </div>
        </section>

        {/* Active Bookings */}
        {activeBookings.length > 0 && (
          <section>
            <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Active Bookings</LWText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
              {activeBookings.map((b, i) => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: SPACE[3],
                  padding: SPACE[3], background: T.card,
                  border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.lg,
                }}>
                  <div style={{ flex: 1 }}>
                    <LWText scale="body" style={{ fontWeight: 500 }}>{b.service}</LWText>
                    <LWText scale="caption" color="muted" as="div" style={{ marginTop: 2 }}>
                      {b.providerName}
                      {b.scheduledFor ? ` · ${new Date(b.scheduledFor).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                    </LWText>
                  </div>
                  <LWBadge variant={BOOKING_VARIANT[b.status] || 'default'}>{b.status}</LWBadge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Circles */}
        <section>
          <LWText scale="h3" as="h3" style={{ marginBottom: SPACE[3] }}>Circles</LWText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
            {circles.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: SPACE[3],
                padding: SPACE[3], background: T.card,
                border: `1px solid ${COLOR.border}`, borderRadius: RADIUS.lg,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: RADIUS.md,
                  background: T.accentMuted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <LWText scale="h3" as="span" style={{ color: T.accent }}>◆</LWText>
                </div>
                <div style={{ flex: 1 }}>
                  <LWText scale="body" style={{ fontWeight: 500 }}>{c.name}</LWText>
                  <LWText scale="caption" color="muted" as="div" style={{ marginTop: 2 }}>
                    {c.members.toLocaleString()} members · {c.category}
                  </LWText>
                </div>
                {c.joined ? (
                  <LWBadge variant="success">Joined</LWBadge>
                ) : (
                  <button style={{
                    background: T.accentMuted, border: 'none', borderRadius: RADIUS.md,
                    padding: `${SPACE[1]}px ${SPACE[3]}px`, cursor: 'pointer',
                    fontFamily: 'inherit', ...TYPE.caption, color: T.accent, fontWeight: 500,
                  }}>
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </RealmProvider>
  )
}
