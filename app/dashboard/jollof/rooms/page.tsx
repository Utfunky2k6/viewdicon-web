'use client'
// ═══════════════════════════════════════════════════════════════════
// PALAVER HUT — Audio Rooms Browser
// West African community meeting place for live audio conversations
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

// ── Inject-once CSS ───────────────────────────────────────────────
const CSS_ID = 'palaver-hut-css'
const CSS = `
@keyframes phFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes phLivePulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.45)} 70%{box-shadow:0 0 0 7px rgba(74,222,128,0)} }
@keyframes phDotBlink { 0%,100%{opacity:1} 50%{opacity:.25} }
@keyframes phSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes phSkeletonPulse { 0%,100%{opacity:.35} 50%{opacity:.6} }
.ph-fade { animation: phFadeIn .35s ease both }
.ph-live-badge { animation: phLivePulse 1.6s ease-in-out infinite }
.ph-dot { animation: phDotBlink .9s ease-in-out infinite }
.ph-sheet { animation: phSheetUp .32s cubic-bezier(.16,1,.3,1) both }
.ph-skeleton { animation: phSkeletonPulse 1.5s ease-in-out infinite; background: rgba(255,255,255,.06); border-radius: 10px }
`

// ── Types ──────────────────────────────────────────────────────────
interface Participant {
  userId: string
  role: 'HOST' | 'SPEAKER' | 'LISTENER'
  isMuted: boolean
}
interface Room {
  id: string
  title: string
  hostId: string
  topic: string
  villageId: string
  isLive: boolean
  listenerCount: number
  participants: Participant[]
  scheduledAt?: string
}

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_ROOMS: Room[] = [
  {
    id: 'rm1', title: 'Pan-African Unity Debate', hostId: 'elder_kofi',
    topic: 'Politics & Governance', villageId: 'government', isLive: true, listenerCount: 342,
    participants: [
      { userId: 'elder_kofi', role: 'HOST', isMuted: false },
      { userId: 'activist_a', role: 'SPEAKER', isMuted: false },
      { userId: 'voices_b', role: 'SPEAKER', isMuted: true },
      { userId: 'listener_c', role: 'LISTENER', isMuted: true },
    ],
  },
  {
    id: 'rm2', title: 'Farming Innovations 2025', hostId: 'farmer_seun',
    topic: 'Agriculture & Food', villageId: 'agriculture', isLive: true, listenerCount: 87,
    participants: [
      { userId: 'farmer_seun', role: 'HOST', isMuted: false },
      { userId: 'agro_tech', role: 'SPEAKER', isMuted: false },
    ],
  },
  {
    id: 'rm3', title: 'Tech Founders Roundtable', hostId: 'dev_amaka',
    topic: 'Technology & Startups', villageId: 'technology', isLive: false, listenerCount: 0,
    participants: [],
    scheduledAt: '2026-04-09T03:00:00.000Z',
  },
  {
    id: 'rm4', title: 'Healing Through Ubuntu', hostId: 'nurse_fatou',
    topic: 'Health & Wellness', villageId: 'health', isLive: true, listenerCount: 156,
    participants: [
      { userId: 'nurse_fatou', role: 'HOST', isMuted: false },
      { userId: 'healer_bode', role: 'SPEAKER', isMuted: false },
      { userId: 'listener_1', role: 'LISTENER', isMuted: true },
      { userId: 'listener_2', role: 'LISTENER', isMuted: true },
    ],
  },
  {
    id: 'rm5', title: 'African Fashion Week Recap', hostId: 'designer_olu',
    topic: 'Fashion & Style', villageId: 'fashion', isLive: false, listenerCount: 0,
    participants: [],
    scheduledAt: '2026-04-09T05:00:00.000Z',
  },
  {
    id: 'rm6', title: 'Cowrie Finance Masterclass', hostId: 'fin_kolade',
    topic: 'Personal Finance', villageId: 'finance', isLive: true, listenerCount: 211,
    participants: [
      { userId: 'fin_kolade', role: 'HOST', isMuted: false },
      { userId: 'analyst_zara', role: 'SPEAKER', isMuted: false },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────
const VILLAGE_COLORS: Record<string, string> = {
  government: '#6366f1', agriculture: '#22c55e', technology: '#22d3ee',
  health: '#3b82f6', finance: '#f59e0b', arts: '#c084fc',
  education: '#f97316', fashion: '#ec4899', commerce: '#84cc16',
  spirituality: '#a78bfa', security: '#ef4444', family: '#fb923c',
}
const VILLAGE_LABELS: Record<string, string> = {
  all: 'ALL', government: 'Government', agriculture: 'Agriculture',
  technology: 'Technology', health: 'Health', finance: 'Finance', arts: 'Arts',
}
const VILLAGE_FILTERS = ['all', 'health', 'agriculture', 'education', 'technology', 'arts', 'finance']

function getInitials(userId: string) {
  const parts = userId.replace(/_/g, ' ').split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return userId.slice(0, 2).toUpperCase()
}
function villageColor(id: string) { return VILLAGE_COLORS[id] || '#4ade80' }
function formatCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Starting soon'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`
}

// ── Speaker Avatars Row ────────────────────────────────────────────
function SpeakerAvatars({ participants, max = 4 }: { participants: Participant[]; max?: number }) {
  const speakers = participants.filter(p => p.role === 'HOST' || p.role === 'SPEAKER')
  const shown = speakers.slice(0, max)
  const extra = speakers.length - max
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((p, i) => (
        <div
          key={p.userId}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: p.role === 'HOST'
              ? 'linear-gradient(135deg,#1a7c3e,#4ade80)'
              : 'linear-gradient(135deg,#0369a1,#22d3ee)',
            border: '2px solid #07090a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
            marginLeft: i > 0 ? -9 : 0, flexShrink: 0, zIndex: max - i,
            position: 'relative',
          }}
        >
          {getInitials(p.userId)}
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,.1)', border: '2px solid #07090a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: 'rgba(255,255,255,.55)', marginLeft: -9, position: 'relative',
        }}>
          +{extra}
        </div>
      )}
    </div>
  )
}

// ── Live Room Horizontal Scroll Card ──────────────────────────────
function LiveRoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const vc = villageColor(room.villageId)
  return (
    <div
      onClick={onClick}
      style={{
        width: 180, minHeight: 114, flexShrink: 0,
        background: '#0d1008', border: `1px solid ${vc}30`,
        borderRadius: 14, padding: '12px 14px',
        cursor: 'pointer', position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}
    >
      {/* LIVE badge */}
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <div
          className="ph-live-badge"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(74,222,128,.12)', borderRadius: 20,
            padding: '2px 8px', border: '1px solid rgba(74,222,128,.3)',
          }}
        >
          <span
            className="ph-dot"
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }}
          />
          <span style={{ fontSize: 9, fontWeight: 700, color: '#4ade80', letterSpacing: '.05em' }}>LIVE</span>
        </div>
      </div>

      <div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.9)',
          fontFamily: 'Sora, sans-serif', marginBottom: 5, paddingRight: 48, lineHeight: 1.3,
        }}>
          {room.title}
        </div>
        <div style={{
          fontSize: 10, color: vc, background: `${vc}18`, borderRadius: 10,
          padding: '2px 7px', display: 'inline-block',
        }}>
          {room.topic}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <SpeakerAvatars participants={room.participants} max={3} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: 'DM Sans, sans-serif' }}>
          🎧 {room.listenerCount.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

// ── Room Grid Card ─────────────────────────────────────────────────
function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const vc = villageColor(room.villageId)
  const [reminded, setReminded] = React.useState(false)
  return (
    <div
      className="ph-fade"
      style={{
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
        borderRadius: 14, padding: 14, cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <div style={{
        fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif',
        color: 'rgba(255,255,255,.9)', marginBottom: 6, lineHeight: 1.35,
      }}>
        {room.title}
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={{
          fontSize: 10, color: vc, background: `${vc}18`,
          borderRadius: 10, padding: '2px 8px', border: `1px solid ${vc}28`,
        }}>
          {room.topic}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SpeakerAvatars participants={room.participants} max={4} />
        {room.isLive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              className="ph-dot"
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }}
            />
            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>
              {room.listenerCount.toLocaleString()}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
            ⏰ {room.scheduledAt ? formatCountdown(room.scheduledAt) : 'Soon'}
          </span>
        )}
      </div>

      {room.isLive ? (
        <button
          onClick={e => { e.stopPropagation(); onClick() }}
          style={{
            width: '100%', padding: '7px 0', borderRadius: 8,
            background: 'transparent', border: '1px solid #4ade80',
            color: '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Enter
        </button>
      ) : (
        <button
          onClick={e => { e.stopPropagation(); if (!reminded) setReminded(true) }}
          disabled={reminded}
          style={{
            width: '100%', padding: '7px 0', borderRadius: 8,
            background: reminded ? 'rgba(74,222,128,.07)' : 'rgba(251,191,36,.07)',
            border: `1px solid ${reminded ? 'rgba(74,222,128,.25)' : 'rgba(251,191,36,.25)'}`,
            color: reminded ? '#4ade80' : '#fbbf24', fontSize: 12, fontWeight: 600,
            cursor: reminded ? 'default' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {reminded ? 'Reminder Set \u2705' : 'Set Reminder'}
        </button>
      )}
    </div>
  )
}

// ── Skeleton Card ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,.02)', borderRadius: 14, padding: 14, minHeight: 120 }}>
      <div className="ph-skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
      <div className="ph-skeleton" style={{ height: 10, width: '50%', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="ph-skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
        ))}
      </div>
    </div>
  )
}

// ── Create Room Bottom Sheet ───────────────────────────────────────
function CreateRoomSheet({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [title, setTitle] = React.useState('')
  const [topic, setTopic] = React.useState('')
  const [villageId, setVillageId] = React.useState('')
  const [startNow, setStartNow] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const villages = ['health', 'agriculture', 'education', 'technology', 'arts', 'finance', 'government', 'commerce']

  async function handleSubmit() {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await jollofTvApi.createAudioRoom({
        title,
        hostId: userId,
        villageId: villageId || undefined,
        topic: topic || undefined,
      })
      setDone(true)
      setTimeout(onClose, 1400)
    } catch (e) {
      logApiFailure('jollof/rooms/create', e)
      setDone(true)
      setTimeout(onClose, 1400)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', marginBottom: 14,
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        className="ph-sheet"
        style={{
          width: '100%', maxWidth: 480, background: '#0d1008',
          borderRadius: '20px 20px 0 0', padding: '24px 20px 44px',
          border: '1px solid rgba(255,255,255,.09)', borderBottom: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, margin: '0 auto 22px' }} />
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#fff', marginBottom: 22 }}>
          🏛 Open a Palaver Hut
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '28px 0', fontSize: 16, color: '#4ade80', fontWeight: 700 }}>
            ✅ Your Hut is open!
          </div>
        ) : (
          <>
            <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 5, letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Room Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Pan-African Energy Discussion"
              style={inputStyle}
            />

            <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 5, letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Topic
            </label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Renewable Energy in Africa"
              style={inputStyle}
            />

            <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 8, letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Village (optional)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {villages.map(v => (
                <button
                  key={v}
                  onClick={() => setVillageId(villageId === v ? '' : v)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: villageId === v ? `${villageColor(v)}1f` : 'transparent',
                    border: `1px solid ${villageId === v ? villageColor(v) : 'rgba(255,255,255,.1)'}`,
                    color: villageId === v ? villageColor(v) : 'rgba(255,255,255,.45)',
                    fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
              {([true, false] as const).map(v => (
                <button
                  key={String(v)}
                  onClick={() => setStartNow(v)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 13,
                    fontWeight: 600, cursor: 'pointer',
                    background: startNow === v ? 'rgba(74,222,128,.1)' : 'transparent',
                    border: `1px solid ${startNow === v ? '#4ade80' : 'rgba(255,255,255,.1)'}`,
                    color: startNow === v ? '#4ade80' : 'rgba(255,255,255,.4)',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {v ? '▶ Start Immediately' : '🗓 Schedule'}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim()}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12,
                background: 'linear-gradient(90deg,#1a7c3e,#4ade80)',
                border: 'none', color: '#07090a', fontSize: 15, fontWeight: 800,
                fontFamily: 'Sora, sans-serif',
                cursor: submitting || !title.trim() ? 'not-allowed' : 'pointer',
                opacity: !title.trim() ? .5 : 1,
              }}
            >
              {submitting ? '⏳ Opening...' : '🏛 Open the Hut'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function PalaverHutPage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const userId = user?.id || ''

  const [rooms, setRooms] = React.useState<Room[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all')
  const [showCreate, setShowCreate] = React.useState(false)
  const [remindedIds, setRemindedIds] = React.useState<Set<string>>(new Set())

  // Inject CSS
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Fetch rooms
  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await jollofTvApi.audioRooms()
        const data = (res as any)?.rooms || []
        if (mounted) setRooms(data.length > 0 ? data : (USE_MOCKS ? MOCK_ROOMS : []))
      } catch (e) {
        logApiFailure('jollof/rooms/list', e)
        if (mounted) setRooms(USE_MOCKS ? MOCK_ROOMS : [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.villageId === filter)
  const liveRooms = filtered.filter(r => r.isLive)
  const scheduledRooms = filtered.filter(r => !r.isLive)

  return (
    <div style={{
      minHeight: '100vh', background: '#07090a',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.022) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      fontFamily: 'DM Sans, sans-serif',
      paddingBottom: 110,
    }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,9,10,.92)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#fff', lineHeight: 1.2 }}>
            🏛 Palaver Hut
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
            Live Audio Rooms
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Village Filter Pills */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 0 10px',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        } as React.CSSProperties}>
          {VILLAGE_FILTERS.map(v => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer',
                background: filter === v ? '#4ade80' : 'rgba(255,255,255,.04)',
                border: `1px solid ${filter === v ? '#4ade80' : 'rgba(255,255,255,.09)'}`,
                color: filter === v ? '#07090a' : 'rgba(255,255,255,.55)',
                fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                textTransform: 'capitalize', flexShrink: 0,
              }}
            >
              {VILLAGE_LABELS[v] || v}
            </button>
          ))}
        </div>

        {/* LIVE NOW Section */}
        {(loading || liveRooms.length > 0) && (
          <div style={{ marginBottom: 26 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)',
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span className="ph-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              LIVE NOW
            </div>
            <div style={{
              display: 'flex', gap: 12, overflowX: 'auto',
              scrollbarWidth: 'none', paddingBottom: 4,
            } as React.CSSProperties}>
              {loading
                ? [0, 1, 2].map(i => (
                    <div key={i} className="ph-skeleton" style={{ width: 180, height: 114, flexShrink: 0, borderRadius: 14 }} />
                  ))
                : liveRooms.map(r => (
                    <LiveRoomCard
                      key={r.id}
                      room={r}
                      onClick={() => router.push(`/dashboard/jollof/rooms/${r.id}`)}
                    />
                  ))
              }
            </div>
          </div>
        )}

        {/* Scheduled Section */}
        {(loading || scheduledRooms.length > 0) && (
          <div style={{ marginBottom: 26 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)',
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              🗓 SCHEDULED
            </div>
            {loading
              ? [0, 1].map(i => (
                  <div key={i} className="ph-skeleton" style={{ height: 56, marginBottom: 8, borderRadius: 12 }} />
                ))
              : scheduledRooms.map(r => (
                  <div
                    key={r.id}
                    style={{
                      background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 12, padding: '12px 14px', marginBottom: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: 'Sora, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>
                        ⏰ {r.scheduledAt ? formatCountdown(r.scheduledAt) : 'Soon'}
                        {r.topic && (
                          <span style={{ marginLeft: 8, color: villageColor(r.villageId) }}>
                            · {r.topic}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setRemindedIds(prev => new Set(prev).add(r.id))}
                      disabled={remindedIds.has(r.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                        background: remindedIds.has(r.id) ? 'rgba(74,222,128,.07)' : 'rgba(251,191,36,.07)',
                        border: `1px solid ${remindedIds.has(r.id) ? 'rgba(74,222,128,.25)' : 'rgba(251,191,36,.25)'}`,
                        color: remindedIds.has(r.id) ? '#4ade80' : '#fbbf24',
                        cursor: remindedIds.has(r.id) ? 'default' : 'pointer', whiteSpace: 'nowrap',
                        fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
                      }}
                    >
                      {remindedIds.has(r.id) ? 'Reminder Set \u2705' : 'Set Reminder'}
                    </button>
                  </div>
                ))
            }
          </div>
        )}

        {/* All Rooms Grid */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)',
          letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12,
        }}>
          ALL ROOMS
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🏛</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>
              No rooms right now.
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', marginBottom: 22 }}>
              Start a Palaver!
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '11px 28px', borderRadius: 24, background: '#4ade80',
                border: 'none', color: '#07090a', fontWeight: 700, cursor: 'pointer',
                fontSize: 14, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              + Create Room
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map(r => (
              <RoomCard
                key={r.id}
                room={r}
                onClick={() => router.push(`/dashboard/jollof/rooms/${r.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB — Create Room */}
      <button
        onClick={() => setShowCreate(true)}
        style={{
          position: 'fixed', bottom: 96, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg,#1a7c3e,#4ade80)',
          border: 'none', color: '#07090a', fontSize: 24, fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 4px 24px rgba(74,222,128,.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40,
        }}
        aria-label="Create Room"
      >
        +
      </button>

      {/* Create Room Sheet */}
      {showCreate && (
        <CreateRoomSheet onClose={() => setShowCreate(false)} userId={userId} />
      )}
    </div>
  )
}
