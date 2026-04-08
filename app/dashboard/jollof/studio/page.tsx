'use client'
// ═══════════════════════════════════════════════════════════════════
// GRIOT CREATOR STUDIO — Creator Dashboard for Jollof TV
// Griot = storyteller / historian of West Africa
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

/* ── Inject-once CSS ── */
const CSS_ID = 'griot-studio-css'
const CSS = `
@keyframes griotFade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes griotSheetUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
@keyframes griotBarGrow {
  from { width: 0; }
  to   { width: var(--w); }
}
@keyframes griotPulse {
  0%,100% { opacity: .7; transform: scale(.9); }
  50%     { opacity: 1;  transform: scale(1);  }
}
.griot-fade { animation: griotFade .35s ease both; }
.griot-sheet-up { animation: griotSheetUp .35s cubic-bezier(.4,0,.2,1) both; }
.griot-bar-grow { animation: griotBarGrow .8s cubic-bezier(.4,0,.2,1) both; }
.griot-live-dot { animation: griotPulse .7s ease-in-out infinite; }
`

/* ── Constants ── */
const FALLBACK_CHANNELS: Record<string, { label: string; color: string }> = {
  MAIN_TV:          { label: '📺 Main TV',       color: '#ef4444' },
  REALITY_TV:       { label: '🎭 Reality TV',     color: '#c084fc' },
  VILLAGE_TV_RADIO: { label: '📻 Village Radio',  color: '#fbbf24' },
}

const TYPE_COLORS: Record<string, string> = {
  MAIN: '#ef4444', REALITY: '#c084fc', VILLAGE: '#fbbf24', NEWS: '#3b82f6',
  SPORTS: '#22c55e', MUSIC: '#ec4899', EDUCATION: '#06b6d4', DOCUMENTARY: '#84cc16',
  KIDS: '#f97316', GOVERNMENT: '#6366f1', BUSINESS: '#14b8a6', RELIGION: '#a78bfa',
  ENTERTAINMENT: '#f43f5e',
}

const TYPE_EMOJI: Record<string, string> = {
  MAIN: '📺', REALITY: '🎭', VILLAGE: '📻', NEWS: '📰', SPORTS: '⚽',
  MUSIC: '🎵', EDUCATION: '📚', DOCUMENTARY: '🎬', KIDS: '🧒', GOVERNMENT: '🏛',
  BUSINESS: '💼', RELIGION: '🕌', ENTERTAINMENT: '🎪',
}

const GEO_DIST = [
  { flag: '🇳🇬', label: 'Nigeria',        pct: 42, color: '#4ade80' },
  { flag: '🇬🇭', label: 'Ghana',           pct: 18, color: '#22d3ee' },
  { flag: '🇰🇪', label: 'Kenya',           pct: 15, color: '#fbbf24' },
  { flag: '🌍', label: 'Rest of Africa',   pct: 25, color: '#c084fc' },
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEK_VIEWS = [840, 1720, 2100, 3200, 2800, 4600, 3900]

const CREATOR_STATS = {
  totalStreams: 47,
  totalPrograms: 12,
  cowrieEarned: 125400,
  rootSubscribers: 892,
}

const MOCK_AUDIENCE = [
  { id: 'r1', name: 'Adaeze Okonkwo',  initials: 'AO', tier: 'ANCESTRAL', plantedDate: '2025-01-12', color: '#4ade80'  },
  { id: 'r2', name: 'Kwame Asante',    initials: 'KA', tier: 'PAID',      plantedDate: '2025-02-04', color: '#22d3ee'  },
  { id: 'r3', name: 'Fatima Al-Amin',  initials: 'FA', tier: 'PAID',      plantedDate: '2025-03-17', color: '#22d3ee'  },
  { id: 'r4', name: 'Chidi Nwosu',     initials: 'CN', tier: 'FREE',      plantedDate: '2025-03-29', color: '#fbbf24'  },
  { id: 'r5', name: 'Naledi Dlamini',  initials: 'ND', tier: 'ANCESTRAL', plantedDate: '2025-04-01', color: '#4ade80'  },
]

const TIER_CONFIG = {
  FREE:      { emoji: '👀', label: 'Followers',  color: '#fbbf24', count: 621 },
  PAID:      { emoji: '🌱', label: 'Planters',   color: '#22d3ee', count: 247 },
  ANCESTRAL: { emoji: '🌳', label: 'Ancestral',  color: '#4ade80', count: 24  },
}

const TOP_PROGRAMS = [
  { name: 'Tech Africa Weekly',      views: 12400, cowrie: 34200 },
  { name: 'Creator Challenge S2',    views: 9800,  cowrie: 28700 },
  { name: 'Cowrie Code Podcast Live',views: 7300,  cowrie: 18900 },
  { name: 'AfroBeats Fridays',       views: 5100,  cowrie: 12400 },
  { name: 'Village News Hour',       views: 3200,  cowrie: 7800  },
]

/* ── Calendar helpers ── */
function getDayStrip(today: Date): { date: Date; label: string; dayNum: number }[] {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const label = i === 0 ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' })
    return { date: d, label, dayNum: d.getDate() }
  })
}

/* ── Styles ── */
const S = {
  page: {
    minHeight: '100vh',
    background: '#07090a',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.022) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    fontFamily: 'DM Sans, sans-serif',
    paddingBottom: 100,
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    background: 'rgba(13,16,8,.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  } as React.CSSProperties,

  backBtn: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'rgba(255,255,255,.7)',
    fontSize: 16, flexShrink: 0,
  } as React.CSSProperties,

  card: {
    background: '#0d1008',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: 16,
  } as React.CSSProperties,

  input: {
    width: '100%', padding: '10px 12px', borderRadius: 12,
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    color: 'rgba(255,255,255,.8)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'DM Sans, sans-serif',
  } as React.CSSProperties,

  pill: (active: boolean, color = '#4ade80'): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 20, flexShrink: 0,
    background: active ? `${color}22` : 'rgba(255,255,255,.05)',
    border: `1px solid ${active ? color + '50' : 'rgba(255,255,255,.1)'}`,
    color: active ? color : 'rgba(255,255,255,.5)',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    letterSpacing: .5,
    transition: 'all .2s',
  }),

  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,.7)',
    zIndex: 200,
    backdropFilter: 'blur(4px)',
  } as React.CSSProperties,

  sheet: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: '#0d1008',
    borderRadius: '20px 20px 0 0',
    border: '1px solid rgba(255,255,255,.1)',
    zIndex: 201,
    padding: '20px 20px 40px',
    maxHeight: '92vh',
    overflowY: 'auto',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
    color: 'rgba(255,255,255,.35)',
    fontFamily: 'Sora, sans-serif',
    marginBottom: 10,
  } as React.CSSProperties,
}

/* ═══════════════════════════════════
   GRIOT CREATOR STUDIO PAGE
═══════════════════════════════════ */
export default function GriotCreatorStudio() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const userId = user?.id || ''
  const displayName = user?.displayName || 'Creator'
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const joinedAt = user?.joinedAt ? new Date(user.joinedAt).getFullYear() : 2024

  /* ── State ── */
  const [tab, setTab] = React.useState<'programs' | 'schedule' | 'analytics' | 'audience'>('programs')
  const [programs, setPrograms] = React.useState<any[]>([])
  const [analyticsRange, setAnalyticsRange] = React.useState<'7D' | '30D' | '90D' | 'ALL'>('7D')
  const [selectedDay, setSelectedDay] = React.useState(0)
  const [showCreateProgram, setShowCreateProgram] = React.useState(false)
  const [showBookSchedule, setShowBookSchedule] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [programLoading, setProgramLoading] = React.useState(false)
  const [allChannels, setAllChannels] = React.useState<any[]>([])
  const [clientNow, setClientNow] = React.useState<Date>(new Date(0))

  /* ── Dynamic channel map (API-backed, fallback to 3 legacy) ── */
  const CHANNELS_MAP = React.useMemo(() => {
    if (allChannels.length === 0) return FALLBACK_CHANNELS
    const map: Record<string, { label: string; color: string }> = {}
    for (const ch of allChannels) {
      const emoji = TYPE_EMOJI[ch.type] ?? '📡'
      map[ch.id] = { label: `${emoji} ${ch.name}`, color: TYPE_COLORS[ch.type] ?? '#888' }
    }
    return map
  }, [allChannels])
  const CHANNEL_IDS = React.useMemo(() => Object.keys(CHANNELS_MAP), [CHANNELS_MAP])

  /* ── Schedule slot mock ── */
  type ScheduleSlot = { time: string; program: string; channel: string; available: boolean }
  const SCHEDULE_DAYS: ScheduleSlot[][] = getDayStrip(clientNow).map((_, di) => {
    const isToday = di === 0
    return [
      { time: '07:00', program: isToday ? 'Morning Oracle Hour' : '', channel: 'MAIN_TV',   available: !isToday },
      { time: '10:00', program: '',                                     channel: 'MAIN_TV',   available: true    },
      { time: '12:00', program: isToday ? 'Midday Markets Show'  : '', channel: 'REALITY_TV',available: di < 2  },
      { time: '15:00', program: '',                                     channel: 'REALITY_TV',available: true    },
      { time: '19:00', program: isToday ? 'Prime Time Stream'    : '', channel: 'MAIN_TV',   available: false   },
      { time: '21:00', program: '',                                     channel: 'VILLAGE_TV_RADIO', available: true },
    ]
  })

  /* ── Create forms ── */
  const [progForm, setProgForm] = React.useState({
    title: '', description: '', channelId: 'MAIN_TV',
    startTime: '', endTime: '',
  })

  const [schedForm, setSchedForm] = React.useState({
    channelId: 'MAIN_TV',
    programId: '',
    startTime: '', endTime: '',
    price: '',
  })

  /* ── Inject CSS ── */
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style')
    s.id = CSS_ID
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => { setClientNow(new Date()) }, [])

  /* ── Fetch channels ── */
  React.useEffect(() => {
    jollofTvApi.channels()
      .then(r => {
        const list = (r as any)?.channels ?? []
        if (Array.isArray(list) && list.length > 0) setAllChannels(list)
      })
      .catch((e) => logApiFailure('studio/channels', e))
  }, [])

  /* ── Fetch programs ── */
  React.useEffect(() => {
    setProgramLoading(true)
    jollofTvApi.programs({ hostId: userId })
      .then(r => {
        if (r?.programs?.length) {
          setPrograms(r.programs)
        } else {
          // Mock fallback
          setPrograms([
            { id: 'pr1', channelId: 'MAIN_TV',          title: 'Tech Africa Weekly',       hostId: userId, startTime: '2025-04-10T10:00:00Z', endTime: '2025-04-10T11:00:00Z' },
            { id: 'pr2', channelId: 'REALITY_TV',        title: 'Creator Challenge S2',     hostId: userId, startTime: '2025-04-12T20:00:00Z', endTime: '2025-04-12T22:00:00Z' },
            { id: 'pr3', channelId: 'VILLAGE_TV_RADIO',  title: 'Cowrie Code Podcast Live', hostId: userId, startTime: null, endTime: null },
          ])
        }
      })
      .catch((e) => {
        logApiFailure('studio/programs', e)
        if (USE_MOCKS) setPrograms([
          { id: 'pr1', channelId: 'MAIN_TV',          title: 'Tech Africa Weekly',       hostId: userId, startTime: '2025-04-10T10:00:00Z', endTime: '2025-04-10T11:00:00Z' },
          { id: 'pr2', channelId: 'REALITY_TV',        title: 'Creator Challenge S2',     hostId: userId, startTime: '2025-04-12T20:00:00Z', endTime: '2025-04-12T22:00:00Z' },
          { id: 'pr3', channelId: 'VILLAGE_TV_RADIO',  title: 'Cowrie Code Podcast Live', hostId: userId, startTime: null, endTime: null },
        ])
      })
      .finally(() => setProgramLoading(false))
  }, [userId])

  /* ── Create program ── */
  async function handleCreateProgram() {
    if (!progForm.title) return
    setLoading(true)
    try {
      const result = await jollofTvApi.createProgram({
        channelId: progForm.channelId,
        title: progForm.title,
        description: progForm.description,
        hostId: userId,
        startTime: progForm.startTime || null,
        endTime: progForm.endTime || null,
      })
      setPrograms(prev => [result, ...prev])
    } catch (e) {
      logApiFailure('studio/program/create', e)
      const fallback = {
        id: `pr_${Date.now()}`,
        channelId: progForm.channelId,
        title: progForm.title,
        description: progForm.description,
        hostId: userId,
        startTime: progForm.startTime || null,
        endTime: progForm.endTime || null,
      }
      setPrograms(prev => [fallback, ...prev])
    }
    setLoading(false)
    setShowCreateProgram(false)
    setProgForm({ title: '', description: '', channelId: 'MAIN_TV', startTime: '', endTime: '' })
  }

  /* ── Book schedule slot ── */
  async function handleBookSchedule() {
    if (!schedForm.startTime || !schedForm.endTime) return
    setLoading(true)
    try {
      await jollofTvApi.bookSchedule({
        channelId: schedForm.channelId,
        programId: schedForm.programId || undefined,
        startTime: schedForm.startTime,
        endTime: schedForm.endTime,
        price: schedForm.price ? parseInt(schedForm.price) : undefined,
        bookedBy: userId,
      })
    } catch (e) { logApiFailure('studio/schedule/book', e) }
    setLoading(false)
    setShowBookSchedule(false)
    setSchedForm({ channelId: 'MAIN_TV', programId: '', startTime: '', endTime: '', price: '' })
  }

  const dayStrip = getDayStrip(clientNow)

  /* ── Chart data based on range ── */
  const analyticsViews = analyticsRange === '7D'
    ? WEEK_VIEWS
    : analyticsRange === '30D'
    ? [2100, 3400, 2800, 4600, 3900, 5200, 4100]
    : WEEK_VIEWS.map(v => Math.floor(v * 3.1))

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => router.back()}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif',
            background: 'linear-gradient(90deg, #c084fc, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            🎙 Griot Creator Studio
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>
            Your Broadcasting Headquarters
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/jollof/create')}
          style={{
            padding: '8px 14px', borderRadius: 20,
            background: '#ef4444',
            border: 'none', color: '#fff',
            fontWeight: 700, fontSize: 12, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          GO LIVE
        </button>
      </div>

      {/* Creator profile strip */}
      <div style={{
        ...S.card,
        margin: '16px 16px 8px',
        padding: '16px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c084fc, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#fff',
          fontFamily: 'Sora, sans-serif', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 16, fontWeight: 800, fontFamily: 'Sora, sans-serif',
            color: 'rgba(255,255,255,.92)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {displayName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              padding: '2px 10px', borderRadius: 20,
              background: 'rgba(192,132,252,.15)',
              border: '1px solid rgba(192,132,252,.3)',
              color: '#c084fc', fontSize: 11, fontWeight: 700,
            }}>
              🎙 Griot
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
              Creator since {joinedAt}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
              · {CREATOR_STATS.totalStreams} streams
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid 2×2 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10, margin: '8px 16px',
      }}>
        {[
          { label: 'Total Streams',    value: CREATOR_STATS.totalStreams,                    icon: '📡', color: '#ef4444' },
          { label: 'Programs',         value: CREATOR_STATS.totalPrograms,                   icon: '📋', color: '#c084fc' },
          { label: 'Cowrie Earned',    value: `₡${CREATOR_STATS.cowrieEarned.toLocaleString()}`, icon: '🌊', color: '#fbbf24' },
          { label: 'Root Subscribers', value: CREATOR_STATS.rootSubscribers,                 icon: '🌳', color: '#4ade80' },
        ].map(stat => (
          <div key={stat.label} style={{ ...S.card, padding: '16px' }} className="griot-fade">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
              <span style={{ fontSize: 11, color: '#4ade80' }}>↑</span>
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              color: stat.color,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions row */}
      <div style={{ overflowX: 'auto', padding: '8px 16px 4px' }}>
        <div style={{ display: 'flex', gap: 16, paddingBottom: 4 }}>
          {[
            { icon: '🔴', label: 'Go Live',          color: '#ef4444', action: () => router.push('/dashboard/jollof/create') },
            { icon: '📅', label: 'Schedule',         color: '#22d3ee', action: () => setTab('schedule') },
            { icon: '🎙', label: 'New Podcast',      color: '#c084fc', action: () => router.push('/dashboard/jollof/podcasts') },
            { icon: '📻', label: 'Start Radio',      color: '#fbbf24', action: () => router.push('/dashboard/jollof/radio') },
            { icon: '📊', label: 'Analytics',        color: '#4ade80', action: () => setTab('analytics') },
          ].map(a => (
            <button
              key={a.label}
              onClick={a.action}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: `${a.color}18`,
                border: `1.5px solid ${a.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                transition: 'background .2s',
              }}>
                {a.icon}
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 600, letterSpacing: .3 }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {([
          ['programs', 'MY PROGRAMS'],
          ['schedule', 'SCHEDULE'],
          ['analytics', 'ANALYTICS'],
          ['audience', 'AUDIENCE'],
        ] as const).map(([t, label]) => (
          <button key={t} style={S.pill(tab === t, '#c084fc')} onClick={() => setTab(t)}>
            {label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────
          MY PROGRAMS
      ───────────────────────────────────── */}
      {tab === 'programs' && (
        <div style={{ padding: '12px 16px' }} className="griot-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={S.sectionTitle}>YOUR PROGRAMS</div>
            <button
              onClick={() => setShowCreateProgram(true)}
              style={{
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(192,132,252,.15)',
                border: '1px solid rgba(192,132,252,.3)',
                color: '#c084fc', fontWeight: 700, fontSize: 12,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              + New Program
            </button>
          </div>

          {programLoading ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: '30px 0' }}>
              Loading programs…
            </div>
          ) : programs.length === 0 ? (
            <div style={{
              ...S.card, padding: '40px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎙</div>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                No programs yet.<br />Schedule your first broadcast!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {programs.map(prog => {
                const ch = CHANNELS_MAP[prog.channelId] ?? { label: prog.channelId, color: '#fff' }
                const isLiveNow = !prog.startTime || (new Date(prog.startTime) <= clientNow && (!prog.endTime || new Date(prog.endTime) >= clientNow))
                return (
                  <div key={prog.id} style={{ ...S.card, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                        }}>
                          {isLiveNow && (
                            <span style={{
                              padding: '2px 8px', borderRadius: 20,
                              background: 'rgba(239,68,68,.2)',
                              border: '1px solid rgba(239,68,68,.4)',
                              color: '#ef4444', fontSize: 10, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              <span
                                className="griot-live-dot"
                                style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}
                              />
                              LIVE NOW
                            </span>
                          )}
                          <span style={{
                            padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                            background: `${ch.color}18`,
                            border: `1px solid ${ch.color}40`,
                            color: ch.color,
                          }}>
                            {ch.label}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                          color: 'rgba(255,255,255,.9)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {prog.title}
                        </div>
                        {prog.startTime && (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>
                            {new Date(prog.startTime).toLocaleDateString('en', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                            {prog.endTime && ` → ${new Date(prog.endTime).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`}
                          </div>
                        )}
                        {!prog.startTime && (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
                            No schedule yet
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setTab('schedule')}
                        style={{
                          padding: '6px 12px', borderRadius: 20, fontSize: 11,
                          background: 'rgba(255,255,255,.06)',
                          border: '1px solid rgba(255,255,255,.1)',
                          color: 'rgba(255,255,255,.5)', cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif', fontWeight: 600, flexShrink: 0,
                        }}
                      >
                        Edit →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────
          SCHEDULE
      ───────────────────────────────────── */}
      {tab === 'schedule' && (
        <div style={{ padding: '12px 16px' }} className="griot-fade">
          {/* 7-day date strip */}
          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
              {dayStrip.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    flexShrink: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 14,
                    background: selectedDay === i ? 'rgba(192,132,252,.18)' : 'rgba(255,255,255,.04)',
                    border: `1px solid ${selectedDay === i ? 'rgba(192,132,252,.4)' : 'rgba(255,255,255,.08)'}`,
                    cursor: 'pointer', gap: 4,
                    transition: 'all .2s',
                  }}
                >
                  <span style={{ fontSize: 10, color: selectedDay === i ? '#c084fc' : 'rgba(255,255,255,.4)', fontWeight: 600, letterSpacing: .5 }}>
                    {day.label}
                  </span>
                  <span style={{
                    fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                    color: selectedDay === i ? '#c084fc' : 'rgba(255,255,255,.7)',
                  }}>
                    {day.dayNum}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule slots for selected day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SCHEDULE_DAYS[selectedDay]?.map((slot, i) => {
              const ch = CHANNELS_MAP[slot.channel] ?? { label: slot.channel, color: '#fff' }
              return (
                <div key={i} style={{
                  ...S.card,
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  opacity: !slot.available && !slot.program ? .45 : 1,
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                    color: 'rgba(255,255,255,.6)', flexShrink: 0, minWidth: 44,
                  }}>
                    {slot.time}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: slot.program ? 700 : 400,
                      color: slot.program ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.3)',
                      fontFamily: slot.program ? 'Sora, sans-serif' : 'DM Sans, sans-serif',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {slot.program || 'Empty Slot (Available)'}
                    </div>
                    <div style={{ fontSize: 10, color: ch.color, marginTop: 2, fontWeight: 600 }}>
                      {ch.label}
                    </div>
                  </div>
                  {slot.available && (
                    <button
                      onClick={() => {
                        setSchedForm(prev => ({
                          ...prev,
                          channelId: slot.channel,
                          startTime: `${dayStrip[selectedDay].date.toISOString().slice(0, 10)}T${slot.time}:00`,
                        }))
                        setShowBookSchedule(true)
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 11,
                        background: 'rgba(192,132,252,.12)',
                        border: '1px solid rgba(192,132,252,.3)',
                        color: '#c084fc', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      Book →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────
          ANALYTICS
      ───────────────────────────────────── */}
      {tab === 'analytics' && (
        <div style={{ padding: '12px 16px' }} className="griot-fade">
          {/* Time range selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['7D', '30D', '90D', 'ALL'] as const).map(r => (
              <button
                key={r}
                onClick={() => setAnalyticsRange(r)}
                style={S.pill(analyticsRange === r, '#4ade80')}
              >
                {r === 'ALL' ? 'ALL TIME' : r}
              </button>
            ))}
          </div>

          {/* Daily viewers bar chart */}
          <div style={{ ...S.card, padding: '20px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'rgba(255,255,255,.7)', marginBottom: 16 }}>
              Daily Viewers
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
              {analyticsViews.map((v, i) => {
                const pct = (v / Math.max(...analyticsViews)) * 100
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 700 }}>
                      {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                    </div>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      height: `${pct}%`,
                      background: 'linear-gradient(180deg, #4ade80 0%, #1a7c3e 100%)',
                      minHeight: 4,
                    }} />
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
                      {WEEK_DAYS[i]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top programs horizontal bars */}
          <div style={{ ...S.card, padding: '20px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'rgba(255,255,255,.7)', marginBottom: 14 }}>
              Top Programs by Views
            </div>
            {TOP_PROGRAMS.map((p, i) => {
              const maxViews = Math.max(...TOP_PROGRAMS.map(x => x.views))
              const barPct = (p.views / maxViews) * 100
              return (
                <div key={p.name} style={{ marginBottom: 12 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 11, marginBottom: 5, gap: 8,
                  }}>
                    <span style={{
                      color: 'rgba(255,255,255,.7)', fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      flex: 1,
                    }}>
                      {i + 1}. {p.name}
                    </span>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>
                      {p.views.toLocaleString()} views
                    </span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255,255,255,.07)', borderRadius: 4 }}>
                    <div
                      className="griot-bar-grow"
                      style={{
                        height: '100%', borderRadius: 4,
                        width: `${barPct}%`,
                        '--w': `${barPct}%`,
                        background: i === 0
                          ? 'linear-gradient(90deg, #4ade80, #1a7c3e)'
                          : `linear-gradient(90deg, rgba(74,222,128,${.8 - i * .12}), rgba(26,124,62,${.8 - i * .12}))`,
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Top earning streams */}
          <div style={{ ...S.card, padding: '16px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'rgba(255,255,255,.7)', marginBottom: 12 }}>
              Top Earning Streams
            </div>
            {TOP_PROGRAMS.slice(0, 3).map((p, i) => (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(251,191,36,.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fbbf24',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>
                  ₡{p.cowrie.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Geo distribution */}
          <div style={{ ...S.card, padding: '16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'rgba(255,255,255,.7)', marginBottom: 14 }}>
              Audience Geography
            </div>
            {GEO_DIST.map(geo => (
              <div key={geo.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: 'rgba(255,255,255,.7)' }}>
                    {geo.flag} {geo.label}
                  </span>
                  <span style={{ color: geo.color, fontWeight: 700 }}>{geo.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.07)', borderRadius: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: `${geo.pct}%`,
                    background: geo.color,
                    transition: 'width .6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────
          AUDIENCE
      ───────────────────────────────────── */}
      {tab === 'audience' && (
        <div style={{ padding: '12px 16px' }} className="griot-fade">
          {/* Root tiers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
              <div key={tier} style={{
                ...S.card, padding: '16px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `${cfg.color}18`,
                  border: `1.5px solid ${cfg.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {cfg.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                    color: 'rgba(255,255,255,.85)',
                  }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                    {tier === 'FREE' ? 'Follow only' : tier === 'PAID' ? 'Monthly Cowrie subscription' : 'Crest IV+ ancestral bond'}
                  </div>
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  color: cfg.color,
                }}>
                  {cfg.count}
                </div>
              </div>
            ))}
          </div>

          {/* Cowrie from roots */}
          <div style={{
            ...S.card, padding: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(34,211,238,.06), rgba(34,211,238,.02))',
            border: '1px solid rgba(34,211,238,.15)',
          }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Root subscriptions this month</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: '#22d3ee', marginTop: 4 }}>
                ₡18,450
              </div>
            </div>
            <span style={{ fontSize: 32 }}>🌊</span>
          </div>

          {/* Recent root planters */}
          <div style={{ ...S.sectionTitle }}>RECENT PLANTERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {USE_MOCKS && MOCK_AUDIENCE.map(planter => {
              const tierCfg = TIER_CONFIG[planter.tier as keyof typeof TIER_CONFIG]
              return (
                <div key={planter.id} style={{
                  ...S.card, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `${planter.color}22`,
                    border: `1.5px solid ${planter.color}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: planter.color,
                    fontFamily: 'Sora, sans-serif', flexShrink: 0,
                  }}>
                    {planter.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: 'rgba(255,255,255,.85)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {planter.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                      Planted {new Date(planter.plantedDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: `${tierCfg.color}18`,
                    border: `1px solid ${tierCfg.color}40`,
                    color: tierCfg.color, flexShrink: 0,
                  }}>
                    {tierCfg.emoji} {tierCfg.label.slice(0, -1)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Grow your audience tips */}
          <div style={{
            ...S.card, padding: '16px', marginTop: 16,
            background: 'linear-gradient(135deg, rgba(192,132,252,.06), rgba(124,58,237,.03))',
            border: '1px solid rgba(192,132,252,.12)',
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, fontFamily: 'Sora, sans-serif',
              color: '#c084fc', marginBottom: 10,
            }}>
              🌱 Grow Your Audience
            </div>
            {[
              'Go live consistently — even 30 min 3× a week boosts discovery',
              'Offer exclusive Ancestral content to reward loyal planters',
              'Use village events to drive traffic to your Jollof TV channel',
              'Engage via Seso Chat — reply to whispers from new planters',
            ].map((tip, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, marginBottom: i < 3 ? 10 : 0,
                fontSize: 12, color: 'rgba(255,255,255,.55)',
                lineHeight: 1.5,
              }}>
                <span style={{ color: '#c084fc', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          CREATE PROGRAM SHEET
      ═══════════════════════════════════ */}
      {showCreateProgram && (
        <>
          <div style={S.overlay} onClick={() => setShowCreateProgram(false)} />
          <div style={S.sheet} className="griot-sheet-up">
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,.15)',
              margin: '0 auto 20px',
            }} />
            <div style={{
              fontSize: 17, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              color: 'rgba(255,255,255,.9)', marginBottom: 20,
            }}>
              🎬 New Program
            </div>

            {[
              { label: 'Program Title', key: 'title', placeholder: 'e.g. Tech Africa Weekly', type: 'text' },
              { label: 'Description',   key: 'description', placeholder: 'What is this program about?', type: 'text' },
              { label: 'Start Time',    key: 'startTime', placeholder: '', type: 'datetime-local' },
              { label: 'End Time',      key: 'endTime',   placeholder: '', type: 'datetime-local' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontWeight: 600, letterSpacing: .5 }}>
                  {f.label}
                </div>
                <input
                  type={f.type}
                  value={progForm[f.key as keyof typeof progForm]}
                  onChange={e => setProgForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={S.input}
                />
              </div>
            ))}

            {/* Channel picker */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 8, fontWeight: 600, letterSpacing: .5 }}>
                CHANNEL
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {CHANNEL_IDS.map(chId => {
                  const ch = CHANNELS_MAP[chId]
                  return (
                    <button
                      key={chId}
                      onClick={() => setProgForm(prev => ({ ...prev, channelId: chId }))}
                      style={{
                        padding: '7px 12px', borderRadius: 12, fontSize: 11,
                        background: progForm.channelId === chId ? `${ch.color}18` : 'rgba(255,255,255,.04)',
                        border: `1px solid ${progForm.channelId === chId ? ch.color + '40' : 'rgba(255,255,255,.1)'}`,
                        color: progForm.channelId === chId ? ch.color : 'rgba(255,255,255,.4)',
                        cursor: 'pointer', fontWeight: 600, flexShrink: 0,
                      }}
                    >
                      {ch.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Host auto-fill indicator */}
            <div style={{
              padding: '10px 14px', borderRadius: 12,
              background: 'rgba(74,222,128,.06)',
              border: '1px solid rgba(74,222,128,.15)',
              fontSize: 12, color: 'rgba(74,222,128,.7)',
              marginBottom: 20,
            }}>
              🎙 Host: <strong>{displayName}</strong> (auto-filled)
            </div>

            <button
              onClick={handleCreateProgram}
              disabled={!progForm.title || loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: progForm.title
                  ? 'linear-gradient(135deg, #c084fc, #7c3aed)'
                  : 'rgba(255,255,255,.08)',
                border: 'none',
                color: progForm.title ? '#fff' : 'rgba(255,255,255,.3)',
                fontWeight: 700, fontSize: 15, cursor: progForm.title ? 'pointer' : 'not-allowed',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {loading ? 'Creating…' : '🎬 Create Program'}
            </button>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════
          BOOK SCHEDULE SHEET
      ═══════════════════════════════════ */}
      {showBookSchedule && (
        <>
          <div style={S.overlay} onClick={() => setShowBookSchedule(false)} />
          <div style={S.sheet} className="griot-sheet-up">
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,.15)',
              margin: '0 auto 20px',
            }} />
            <div style={{
              fontSize: 17, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              color: 'rgba(255,255,255,.9)', marginBottom: 20,
            }}>
              📅 Book Broadcast Slot
            </div>

            {/* Channel */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 8, fontWeight: 600, letterSpacing: .5 }}>CHANNEL</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CHANNEL_IDS.map(chId => {
                  const ch = CHANNELS_MAP[chId]
                  return (
                    <button
                      key={chId}
                      onClick={() => setSchedForm(prev => ({ ...prev, channelId: chId }))}
                      style={{
                        padding: '7px 12px', borderRadius: 12, fontSize: 11,
                        background: schedForm.channelId === chId ? `${ch.color}18` : 'rgba(255,255,255,.04)',
                        border: `1px solid ${schedForm.channelId === chId ? ch.color + '40' : 'rgba(255,255,255,.1)'}`,
                        color: schedForm.channelId === chId ? ch.color : 'rgba(255,255,255,.4)',
                        cursor: 'pointer', fontWeight: 600, flexShrink: 0,
                      }}
                    >
                      {ch.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Link to program (optional) */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontWeight: 600, letterSpacing: .5 }}>
                LINK TO PROGRAM (optional)
              </div>
              <select
                value={schedForm.programId}
                onChange={e => setSchedForm(prev => ({ ...prev, programId: e.target.value }))}
                style={{ ...S.input }}
              >
                <option value="">— No program linked —</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Time range */}
            {[
              { label: 'Start Time', key: 'startTime' },
              { label: 'End Time',   key: 'endTime'   },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontWeight: 600, letterSpacing: .5 }}>
                  {f.label}
                </div>
                <input
                  type="datetime-local"
                  value={schedForm[f.key as 'startTime' | 'endTime']}
                  onChange={e => setSchedForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={S.input}
                />
              </div>
            ))}

            {/* Price (optional) */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontWeight: 600, letterSpacing: .5 }}>
                TICKET PRICE ₡ (optional — leave blank for free)
              </div>
              <input
                type="number"
                value={schedForm.price}
                onChange={e => setSchedForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                style={S.input}
              />
            </div>

            <button
              onClick={handleBookSchedule}
              disabled={!schedForm.startTime || !schedForm.endTime || loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: (schedForm.startTime && schedForm.endTime)
                  ? 'linear-gradient(135deg, #22d3ee, #0891b2)'
                  : 'rgba(255,255,255,.08)',
                border: 'none',
                color: (schedForm.startTime && schedForm.endTime) ? '#07090a' : 'rgba(255,255,255,.3)',
                fontWeight: 700, fontSize: 15,
                cursor: (schedForm.startTime && schedForm.endTime) ? 'pointer' : 'not-allowed',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {loading ? 'Booking…' : '📅 Book This Slot'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
