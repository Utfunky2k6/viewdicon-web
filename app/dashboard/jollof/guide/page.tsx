'use client'
// ═══════════════════════════════════════════════════════════════════
// CHANNEL GUIDE — Electronic Program Guide for Jollof TV
// Pan-African naming — represents the entire continent
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

// ── Inject-once CSS ───────────────────────────────────────────────
const CSS_ID = 'odu-guide-css'
const CSS = `
@keyframes oduFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes liveBlink{0%,100%{opacity:.5;transform:scale(.82)}50%{opacity:1;transform:scale(1.1)}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes oduShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes nowBar{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
.odu-fade{animation:oduFade .38s ease both}
.odu-live-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;display:inline-block;flex-shrink:0;animation:liveBlink .75s ease-in-out infinite}
.odu-sheet{animation:slideUp .32s cubic-bezier(.16,1,.3,1) both}
.odu-skel{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:oduShimmer 1.5s infinite}
.odu-now-bar{animation:nowBar 2s ease-in-out infinite}
`

// ── Types ─────────────────────────────────────────────────────────
interface Program {
  id: string
  title: string
  hostId?: string
  description?: string
}

interface Schedule {
  id: string
  startTime: string   // "HH:MM"
  endTime: string     // "HH:MM"
  programId?: string
  program?: Program | null
  isAdSlot?: boolean
}

// ── Channel config (type → visual style) ─────────────────────────
const TYPE_STYLES: Record<string, { emoji: string; color: string; glow: string; gradStart: string }> = {
  MAIN:          { emoji: '📺', color: '#4ade80', glow: 'rgba(74,222,128,.25)', gradStart: 'rgba(74,222,128,.12)' },
  VILLAGE:       { emoji: '🏘',  color: '#fbbf24', glow: 'rgba(251,191,36,.22)', gradStart: 'rgba(251,191,36,.10)' },
  REALITY:       { emoji: '🎭', color: '#c084fc', glow: 'rgba(192,132,252,.22)', gradStart: 'rgba(192,132,252,.10)' },
  BUSINESS:      { emoji: '🧺', color: '#fb923c', glow: 'rgba(251,146,60,.22)', gradStart: 'rgba(251,146,60,.10)' },
  EDUCATION:     { emoji: '🎓', color: '#60a5fa', glow: 'rgba(96,165,250,.22)', gradStart: 'rgba(96,165,250,.10)' },
  GOVERNMENT:    { emoji: '🏛',  color: '#a78bfa', glow: 'rgba(167,139,250,.22)', gradStart: 'rgba(167,139,250,.10)' },
  ENTERTAINMENT: { emoji: '🎉', color: '#f472b6', glow: 'rgba(244,114,182,.22)', gradStart: 'rgba(244,114,182,.10)' },
  SPORTS:        { emoji: '⚽', color: '#34d399', glow: 'rgba(52,211,153,.22)', gradStart: 'rgba(52,211,153,.10)' },
  NEWS:          { emoji: '📡', color: '#ef4444', glow: 'rgba(239,68,68,.22)', gradStart: 'rgba(239,68,68,.10)' },
  DOCUMENTARY:   { emoji: '🎬', color: '#a3e635', glow: 'rgba(163,230,53,.22)', gradStart: 'rgba(163,230,53,.10)' },
  KIDS:          { emoji: '🧸', color: '#fcd34d', glow: 'rgba(252,211,77,.22)', gradStart: 'rgba(252,211,77,.10)' },
  MUSIC:         { emoji: '🎵', color: '#e879f9', glow: 'rgba(232,121,249,.22)', gradStart: 'rgba(232,121,249,.10)' },
  RELIGION:      { emoji: '🕯',  color: '#fde68a', glow: 'rgba(253,230,138,.22)', gradStart: 'rgba(253,230,138,.10)' },
  EVENT:         { emoji: '🎪', color: '#38bdf8', glow: 'rgba(56,189,248,.22)', gradStart: 'rgba(56,189,248,.10)' },
}
const DEFAULT_STYLE = { emoji: '📻', color: '#94a3b8', glow: 'rgba(148,163,184,.22)', gradStart: 'rgba(148,163,184,.10)' }

interface ChannelData { id: string; name: string; slug: string; type: string; villageId?: string | null; description?: string; isLive?: boolean }
function cfgFor(ch: ChannelData) { return TYPE_STYLES[ch.type] ?? DEFAULT_STYLE }

// village emoji map for village channels
const V_EMOJI: Record<string, string> = {
  health:'⚕',agriculture:'🌾',education:'🎓',justice:'⚖️',finance:'💰',builders:'🏗',
  technology:'💻',arts:'🎨',media:'📡',commerce:'🧺',security:'🛡',spirituality:'🕯',
  fashion:'👗',family:'👨‍👩‍👧‍👦',transport:'🚌',energy:'⚡',hospitality:'🏨',government:'🏛',sports:'⚽',holdings:'👑',
}

// Legacy compat map for the 3 original channel keys used in MOCK_SCHEDULE
const LEGACY_CONFIGS: Record<string, { label: string; emoji: string; color: string; glow: string; gradStart: string }> = {
  MAIN_TV:          { label: 'Main TV',    ...TYPE_STYLES.MAIN },
  REALITY_TV:       { label: 'Reality TV', ...TYPE_STYLES.REALITY },
  VILLAGE_TV_RADIO: { label: 'Village TV', ...TYPE_STYLES.VILLAGE },
}
const LEGACY_ORDER = ['MAIN_TV', 'REALITY_TV', 'VILLAGE_TV_RADIO']

// ── Mock schedule data ────────────────────────────────────────────
const pad = (n: number) => n.toString().padStart(2, '0')
const t   = (h: number, m = 0) => `${pad(h)}:${pad(m)}`

const MOCK_SCHEDULE: Record<string, Schedule[]> = {
  MAIN_TV: [
    { id: 's1', startTime: t(6),  endTime: t(7),  program: { id: 'p1', title: 'Morning Drum Circle',      hostId: 'griot1'  } },
    { id: 's2', startTime: t(7),  endTime: t(8),  program: { id: 'p2', title: 'African News Roundup',     hostId: 'anchor1' } },
    { id: 's3', startTime: t(8),  endTime: t(10), isAdSlot: true, program: null },
    { id: 's4', startTime: t(10), endTime: t(12), program: { id: 'p4', title: 'Cowrie Economy Show',      hostId: 'fin1'    } },
    { id: 's5', startTime: t(12), endTime: t(13), program: { id: 'p5', title: 'Village Marketplace Live', hostId: 'market1' } },
    { id: 's6', startTime: t(14), endTime: t(16), program: { id: 'p6', title: 'Tech Innovation Hour',     hostId: 'tech1'   } },
    { id: 's7', startTime: t(19), endTime: t(21), program: { id: 'p7', title: 'The Pan-African Summit',   hostId: 'summit1' } },
    { id: 's8', startTime: t(21), endTime: t(23), program: { id: 'p8', title: 'Night Fire Stories',       hostId: 'story1'  } },
  ],
  REALITY_TV: [
    { id: 'r1', startTime: t(8),     endTime: t(9),      program: { id: 'rp1', title: 'Masquerade Rising — Ep 3',  hostId: 'mc1'    } },
    { id: 'r2', startTime: t(9),     endTime: t(12),     program: { id: 'rp2', title: 'Village Idol Auditions',    hostId: 'simon1' } },
    { id: 'r3', startTime: t(12),    endTime: t(13, 30), isAdSlot: true, program: null },
    { id: 'r4', startTime: t(14),    endTime: t(16),     program: { id: 'rp4', title: 'Culture Challenge Day 7',       hostId: 'host2'  } },
    { id: 'r5', startTime: t(20),    endTime: t(22),     program: { id: 'rp5', title: 'Elimination Night LIVE',    hostId: 'host3'  } },
    { id: 'r6', startTime: t(22),    endTime: t(23, 30), program: { id: 'rp6', title: 'Vote Results — Live',       hostId: 'host3'  } },
  ],
  VILLAGE_TV_RADIO: [
    { id: 'v1', startTime: t(5),  endTime: t(7),  program: { id: 'vp1', title: 'Morning Prayers & Meditation', hostId: 'spirit1'  } },
    { id: 'v2', startTime: t(7),  endTime: t(9),  program: { id: 'vp2', title: 'Harvest FM — Farming Tips',    hostId: 'farm1'    } },
    { id: 'v3', startTime: t(9),  endTime: t(11), program: { id: 'vp3', title: 'Youth Town Hall',               hostId: 'youth1'   } },
    { id: 'v4', startTime: t(11), endTime: t(12), program: { id: 'vp4', title: 'Market Announcements',          hostId: 'market1'  } },
    { id: 'v5', startTime: t(15), endTime: t(17), program: { id: 'vp5', title: 'Culture & Heritage Hour',       hostId: 'culture1' } },
    { id: 'v6', startTime: t(17), endTime: t(19), program: { id: 'vp6', title: 'Itan Pod: Stories Live',        hostId: 'pod1'     } },
    { id: 'v7', startTime: t(19), endTime: t(21), program: { id: 'vp7', title: 'Village Night Fire',            hostId: 'elder1'   } },
  ],
}

// ── Time helpers ──────────────────────────────────────────────────
const PX_PER_MIN = 3  // 60 min = 180px, 24h = 4320px

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function minutesToPx(mins: number): number {
  return mins * PX_PER_MIN
}

function durationMins(start: string, end: string): number {
  let d = timeToMinutes(end) - timeToMinutes(start)
  if (d <= 0) d += 24 * 60
  return d
}

function isCurrentlyAiring(startTime: string, endTime: string, now: Date): boolean {
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const s = timeToMinutes(startTime)
  const e = timeToMinutes(endTime)
  if (e > s) return nowMins >= s && nowMins < e
  // overnight wrap
  return nowMins >= s || nowMins < e
}

function getCurrentProgram(schedules: Schedule[], now: Date): Schedule | null {
  return schedules.find(
    s => !!s.program && isCurrentlyAiring(s.startTime, s.endTime, now)
  ) ?? null
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

// ── NOW Card ──────────────────────────────────────────────────────
function NowCard({
  channelKey,
  channel,
  schedules,
  now,
  onClick,
}: {
  channelKey: string
  channel?: ChannelData | null
  schedules: Schedule[]
  now: Date
  onClick: () => void
}) {
  const cfg = channel ? { label: channel.name.replace(/_/g, ' ').replace(/VILLAGE\s/, ''), ...cfgFor(channel) } : (LEGACY_CONFIGS[channelKey] ?? { label: channelKey, ...DEFAULT_STYLE })
  if (channel?.villageId && V_EMOJI[channel.villageId]) cfg.emoji = V_EMOJI[channel.villageId]
  const cur = getCurrentProgram(schedules, now)

  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        background: '#0d1008',
        border: `1px solid ${cfg.color}33`,
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: `0 0 14px ${cfg.glow}`,
        transition: 'border-color .2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={{ fontSize: 13 }}>{cfg.emoji}</span>
        <span style={{
          fontSize: 9,
          fontFamily: 'Sora, sans-serif',
          color: cfg.color,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {cfg.label}
        </span>
        {cur && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span className="odu-live-dot" />
            <span style={{ fontSize: 8, color: '#ef4444', fontWeight: 700 }}>LIVE</span>
          </div>
        )}
      </div>
      <div style={{
        fontSize: 11,
        color: 'rgba(255,255,255,.85)',
        fontFamily: 'DM Sans,sans-serif',
        fontWeight: 600,
        lineHeight: 1.35,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {cur?.program?.title ?? 'Nothing scheduled'}
      </div>
      {cur && (
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.38)', marginTop: 3 }}>
          {cur.startTime} – {cur.endTime}
        </div>
      )}
    </button>
  )
}

// ── Program Block ─────────────────────────────────────────────────
function ProgramBlock({
  schedule,
  channelKey,
  channel,
  now,
  onSelect,
}: {
  schedule: Schedule
  channelKey: string
  channel?: ChannelData | null
  now: Date
  onSelect: (s: Schedule) => void
}) {
  const cfg = channel ? { label: channel.name.replace(/_/g, ' '), ...cfgFor(channel) } : (LEGACY_CONFIGS[channelKey] ?? { label: channelKey, ...DEFAULT_STYLE })
  const dur   = durationMins(schedule.startTime, schedule.endTime)
  const width = Math.max(120, minutesToPx(dur)) - 4

  // Ad slot block
  if (schedule.isAdSlot) {
    return (
      <div
        onClick={() => onSelect(schedule)}
        style={{
          width,
          minWidth: 90,
          height: 56,
          flexShrink: 0,
          background: 'rgba(239,68,68,.08)',
          border: '1px solid rgba(239,68,68,.28)',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>📢 Ad Slot</div>
        <div style={{ fontSize: 8, color: 'rgba(239,68,68,.55)' }}>{schedule.startTime} – {schedule.endTime}</div>
      </div>
    )
  }

  // Empty / bookable slot
  if (!schedule.program) {
    return (
      <div
        onClick={() => onSelect(schedule)}
        style={{
          width,
          minWidth: 90,
          height: 56,
          flexShrink: 0,
          background: 'rgba(255,255,255,.016)',
          border: '1px dashed rgba(255,255,255,.1)',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.22)', textAlign: 'center' }}>+ Book This Slot</div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.14)', textAlign: 'center' }}>{schedule.startTime}</div>
      </div>
    )
  }

  const live = isCurrentlyAiring(schedule.startTime, schedule.endTime, now)

  return (
    <div
      onClick={() => onSelect(schedule)}
      style={{
        width,
        minWidth: 120,
        height: 56,
        flexShrink: 0,
        background: live
          ? `linear-gradient(135deg, ${cfg.gradStart}, rgba(255,255,255,.025))`
          : 'linear-gradient(135deg, rgba(255,255,255,.045), rgba(255,255,255,.018))',
        border: live ? `1px solid ${cfg.color}55` : '1px solid rgba(255,255,255,.07)',
        borderRadius: 8,
        padding: '6px 10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
        boxShadow: live ? `0 0 10px ${cfg.glow}` : 'none',
        transition: 'box-shadow .2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {live && <span className="odu-live-dot" />}
        <div style={{
          fontSize: 11,
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          color: live ? cfg.color : 'rgba(255,255,255,.82)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {schedule.program.title}
        </div>
        {live && (
          <span style={{
            fontSize: 8,
            background: '#ef4444',
            color: '#fff',
            borderRadius: 3,
            padding: '1px 4px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            LIVE
          </span>
        )}
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
        {schedule.startTime} – {schedule.endTime}
      </div>
    </div>
  )
}

// ── Detail Panel (slide-up sheet) ─────────────────────────────────
function DetailPanel({
  schedule,
  channelKey,
  channel,
  now,
  onClose,
}: {
  schedule: Schedule
  channelKey: string
  channel?: ChannelData | null
  now: Date
  onClose: () => void
}) {
  const router  = useRouter()
  const cfg     = channel ? { label: channel.name.replace(/_/g, ' '), ...cfgFor(channel) } : (LEGACY_CONFIGS[channelKey] ?? { label: channelKey, ...DEFAULT_STYLE })
  const live    = schedule.program
    ? isCurrentlyAiring(schedule.startTime, schedule.endTime, now)
    : false
  const dur = durationMins(schedule.startTime, schedule.endTime)

  const [reminded, setReminded] = React.useState(false)

  React.useEffect(() => {
    if (!schedule.id) return
    try {
      setReminded(!!localStorage.getItem(`odu-remind-${schedule.id}`))
    } catch { /* noop */ }
  }, [schedule.id])

  function toggleReminder() {
    try {
      const key = `odu-remind-${schedule.id}`
      if (reminded) {
        localStorage.removeItem(key)
        setReminded(false)
      } else {
        localStorage.setItem(key, '1')
        setReminded(true)
      }
    } catch { /* noop */ }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.62)',
          zIndex: 50,
        }}
      />

      {/* Sheet */}
      <div
        className="odu-sheet"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 51,
          background: '#0d1008',
          borderTop: `2px solid ${cfg.color}44`,
          borderRadius: '16px 16px 0 0',
          padding: '20px 20px 48px',
          maxHeight: '72vh',
          overflowY: 'auto',
          boxShadow: `0 -10px 40px ${cfg.glow}`,
          fontFamily: 'DM Sans,sans-serif',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 38,
          height: 4,
          background: 'rgba(255,255,255,.14)',
          borderRadius: 99,
          margin: '0 auto 18px',
        }} />

        {/* AD SLOT */}
        {schedule.isAdSlot && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 22 }}>📢</span>
              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'Sora, sans-serif',
                  color: '#ef4444',
                }}>
                  Ad Slot Available
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                  {cfg.label}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,.5)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}>
              {schedule.startTime} – {schedule.endTime} · {formatDuration(dur)}
            </div>

            <button
              onClick={() => router.push('/dashboard/jollof/ads')}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
              }}
            >
              📢 Book This Ad Slot →
            </button>
          </>
        )}

        {/* REAL PROGRAM */}
        {!schedule.isAdSlot && schedule.program && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{cfg.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 17,
                  fontWeight: 700,
                  fontFamily: 'Sora, sans-serif',
                  color: 'rgba(255,255,255,.9)',
                  lineHeight: 1.3,
                }}>
                  {schedule.program.title}
                </div>
                <div style={{ fontSize: 11, color: cfg.color, marginTop: 4 }}>
                  {cfg.label}
                </div>
              </div>
              {live && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 4,
                  padding: '3px 8px',
                  flexShrink: 0,
                }}>
                  ● LIVE
                </span>
              )}
            </div>

            {schedule.program.hostId && (
              <div style={{
                fontSize: 12,
                color: 'rgba(255,255,255,.42)',
                marginBottom: 8,
              }}>
                Hosted by{' '}
                <span style={{ color: 'rgba(255,255,255,.72)' }}>
                  @{schedule.program.hostId}
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: 12,
              marginBottom: 22,
            }}>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,.45)',
              }}>
                {schedule.startTime} – {schedule.endTime}
              </div>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,.32)',
              }}>
                {formatDuration(dur)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {live && (
                <button
                  onClick={() => router.push('/dashboard/jollof')}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: 10,
                    border: 'none',
                    background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)`,
                    color: '#07090a',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif',
                  }}
                >
                  Watch Now →
                </button>
              )}
              <button
                onClick={toggleReminder}
                style={{
                  flex: live ? 'none' : 1,
                  padding: '13px 18px',
                  borderRadius: 10,
                  border: `1px solid ${reminded ? cfg.color : 'rgba(255,255,255,.14)'}`,
                  background: reminded ? `${cfg.color}1a` : 'transparent',
                  color: reminded ? cfg.color : 'rgba(255,255,255,.55)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                  transition: 'all .2s',
                }}
              >
                {reminded ? '🔔 Reminder Set' : '🔕 Remind Me'}
              </button>
            </div>
          </>
        )}

        {/* EMPTY / BOOKABLE SLOT */}
        {!schedule.isAdSlot && !schedule.program && (
          <>
            <div style={{
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Sora, sans-serif',
              color: 'rgba(255,255,255,.6)',
              marginBottom: 8,
            }}>
              Empty Time Slot
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,.38)',
              marginBottom: 22,
              lineHeight: 1.5,
            }}>
              {schedule.startTime} – {schedule.endTime} · {formatDuration(dur)} · {cfg.label}
            </div>
            <button
              onClick={() => router.push('/dashboard/jollof/ads')}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}99)`,
                color: '#07090a',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
              }}
            >
              + Book This Slot
            </button>
          </>
        )}
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function OduGuidePage() {
  const router = useRouter()

  const [allChannels, setAllChannels]         = React.useState<ChannelData[]>([])
  const [channelFilter, setChannelFilter]     = React.useState<string>('ALL')
  const [schedules, setSchedules]             = React.useState<Record<string, Schedule[]>>({})
  const [loading, setLoading]                 = React.useState(true)
  const [dateOffset, setDateOffset]           = React.useState(0)
  const [nowTime, setNowTime]                 = React.useState(new Date())
  const [selected, setSelected]               = React.useState<{ schedule: Schedule; channelKey: string } | null>(null)

  // One scrollLeft reference shared across time strip + all channel rows
  const timeStripRef                          = React.useRef<HTMLDivElement>(null)
  const channelScrollRefs                     = React.useRef<Record<string, HTMLDivElement | null>>({})
  const syncScrollInProgress                  = React.useRef(false)

  // Inject CSS once
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style')
    s.id = CSS_ID
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Clock — update every 30 seconds
  React.useEffect(() => {
    const iv = setInterval(() => setNowTime(new Date()), 30_000)
    return () => clearInterval(iv)
  }, [])

  // Load all channels from API
  React.useEffect(() => {
    jollofTvApi.channels().then(data => {
      const chs: ChannelData[] = data.channels ?? []
      // Sort: master channels first, then village channels alphabetical by name
      chs.sort((a, b) => {
        if (a.type !== 'VILLAGE' && b.type === 'VILLAGE') return -1
        if (a.type === 'VILLAGE' && b.type !== 'VILLAGE') return 1
        return a.name.localeCompare(b.name)
      })
      setAllChannels(chs)
    }).catch((e) => {
      logApiFailure('guide/channels', e)
      // fallback: use legacy 3 channels
      setAllChannels([])
    })
  }, [])

  // Derive displayed channels based on filter
  const displayChannels = React.useMemo(() => {
    if (allChannels.length === 0) return LEGACY_ORDER // fallback
    if (channelFilter === 'ALL') return allChannels.map(c => c.name)
    if (channelFilter === 'MASTER') return allChannels.filter(c => c.type !== 'VILLAGE').map(c => c.name)
    if (channelFilter === 'VILLAGE') return allChannels.filter(c => c.type === 'VILLAGE').map(c => c.name)
    return allChannels.filter(c => c.type === channelFilter).map(c => c.name)
  }, [allChannels, channelFilter])

  const channelMap = React.useMemo(() => {
    const m = new Map<string, ChannelData>()
    for (const c of allChannels) m.set(c.name, c)
    return m
  }, [allChannels])

  // Load schedules for displayed channels
  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const result: Record<string, Schedule[]> = {}

      // Load schedules for displayed channels (use channel ID for API, name as key)
      const toLoad = displayChannels.slice(0, 20) // cap at 20 to avoid too many requests
      await Promise.all(toLoad.map(async (key) => {
        const ch = channelMap.get(key)
        const id = ch?.id ?? key
        try {
          const res = await jollofTvApi.channelSchedule(id)
          result[key] = res.schedules?.length ? res.schedules : (USE_MOCKS ? MOCK_SCHEDULE[key] ?? [] : [])
        } catch (e) {
          logApiFailure('guide/channel-schedule', e)
          result[key] = USE_MOCKS ? MOCK_SCHEDULE[key] ?? [] : []
        }
      }))

      if (!cancelled) {
        setSchedules(result)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [displayChannels, channelMap, dateOffset])

  // Auto-scroll to current time after load
  React.useEffect(() => {
    if (loading) return

    const nowMins = nowTime.getHours() * 60 + nowTime.getMinutes()
    const scrollTo = Math.max(0, minutesToPx(nowMins) - 120) // 120px left of NOW

    const apply = () => {
      if (timeStripRef.current) timeStripRef.current.scrollLeft = scrollTo
      Object.values(channelScrollRefs.current).forEach(el => {
        if (el) el.scrollLeft = scrollTo
      })
    }

    // Small RAF delay to ensure DOM is ready
    requestAnimationFrame(apply)
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronised horizontal scroll handler
  function handleRowScroll(sourceKey: string, scrollLeft: number) {
    if (syncScrollInProgress.current) return
    syncScrollInProgress.current = true

    if (timeStripRef.current) timeStripRef.current.scrollLeft = scrollLeft
    displayChannels.forEach(k => {
      if (k !== sourceKey && channelScrollRefs.current[k]) {
        channelScrollRefs.current[k]!.scrollLeft = scrollLeft
      }
    })

    requestAnimationFrame(() => { syncScrollInProgress.current = false })
  }

  function handleTimeStripScroll(scrollLeft: number) {
    if (syncScrollInProgress.current) return
    syncScrollInProgress.current = true

    displayChannels.forEach(k => {
      if (channelScrollRefs.current[k]) {
        channelScrollRefs.current[k]!.scrollLeft = scrollLeft
      }
    })

    requestAnimationFrame(() => { syncScrollInProgress.current = false })
  }

  function scrollToChannel(key: string) {
    const el = document.getElementById(`epg-row-${key}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const TOTAL_TIMELINE_PX = minutesToPx(24 * 60) + 48
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const nowMins = nowTime.getHours() * 60 + nowTime.getMinutes()
  const nowPx   = minutesToPx(nowMins)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090a',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.022) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        fontFamily: 'DM Sans,sans-serif',
        paddingBottom: 100,
        overflowX: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          background: 'rgba(7,9,10,.92)',
          backdropFilter: 'blur(14px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.55)',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: 20,
            lineHeight: 1,
            borderRadius: 6,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 17,
            fontWeight: 700,
            fontFamily: 'Sora, sans-serif',
            color: 'rgba(255,255,255,.92)',
          }}>
            📡 Channel Guide
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 1 }}>
            {allChannels.length || 3} Channels · Today's Schedule
          </div>
        </div>
        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,.4)',
          fontFamily: 'Sora, sans-serif',
        }}>
          {pad(nowTime.getHours())}:{pad(nowTime.getMinutes())}
        </div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>
        {/* ── Filter pills ── */}
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          marginBottom: 10,
          paddingBottom: 2,
        }}>
          {[
            { key: 'ALL',     label: '📺 All Channels' },
            { key: 'MASTER',  label: '⭐ Master' },
            { key: 'VILLAGE', label: '🏘 Village' },
            { key: 'REALITY', label: '🎭 Reality' },
            { key: 'NEWS',    label: '📡 News' },
            { key: 'SPORTS',  label: '⚽ Sports' },
            { key: 'MUSIC',   label: '🎵 Music' },
            { key: 'EDUCATION', label: '🎓 Edu' },
          ].map(f => {
            const active = channelFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setChannelFilter(f.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  flexShrink: 0,
                  background: active ? '#4ade80' : 'rgba(255,255,255,.05)',
                  border: active ? 'none' : '1px solid rgba(255,255,255,.1)',
                  color: active ? '#07090a' : 'rgba(255,255,255,.55)',
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                  transition: 'background .18s, color .18s',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* ── On Now strip (show first 6 channels) ── */}
        <div style={{
          fontSize: 10,
          color: 'rgba(255,255,255,.38)',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.08em',
          marginBottom: 8,
        }}>
          On Now
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {displayChannels.slice(0, 6).map(key => (
            <NowCard
              key={key}
              channelKey={key}
              channel={channelMap.get(key)}
              schedules={schedules[key] ?? []}
              now={nowTime}
              onClick={() => scrollToChannel(key)}
            />
          ))}
        </div>

        {/* ── Date navigation ── */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          marginBottom: 4,
          paddingBottom: 2,
        }}>
          {(['← Yesterday', 'Today', 'Tomorrow →'] as const).map((label, i) => {
            const offset = i - 1
            const active = offset === dateOffset
            return (
              <button
                key={label}
                onClick={() => setDateOffset(offset)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  flexShrink: 0,
                  background: active ? '#4ade80' : 'rgba(255,255,255,.05)',
                  border: active ? 'none' : '1px solid rgba(255,255,255,.1)',
                  color: active ? '#07090a' : 'rgba(255,255,255,.55)',
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                  transition: 'background .18s, color .18s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── EPG Grid ── */}
      {loading ? (
        <div style={{ padding: '16px 14px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div
                className="odu-skel"
                style={{ height: 76, borderRadius: 10 }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Time Strip header */}
          <div
            ref={timeStripRef}
            onScroll={e => handleTimeStripScroll((e.target as HTMLDivElement).scrollLeft)}
            style={{
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              display: 'flex',
              alignItems: 'center',
              background: '#07090a',
              borderBottom: '1px solid rgba(255,255,255,.06)',
              paddingLeft: 96,
              scrollbarWidth: 'none',
              position: 'sticky',
              top: 62, // below header
              zIndex: 20,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: TOTAL_TIMELINE_PX,
                height: 30,
                flexShrink: 0,
              }}
            >
              {hours.map(h => (
                <div
                  key={h}
                  style={{
                    position: 'absolute',
                    left: minutesToPx(h * 60),
                    top: 0,
                    bottom: 0,
                    width: 180,
                    padding: '6px 0 6px 6px',
                    fontSize: 10,
                    fontFamily: 'Sora, sans-serif',
                    color: h === nowTime.getHours() ? '#4ade80' : 'rgba(255,255,255,.35)',
                    borderLeft: '1px solid rgba(255,255,255,.06)',
                    fontWeight: h === nowTime.getHours() ? 700 : 400,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {pad(h)}:00
                  {h === nowTime.getHours() && (
                    <span style={{ fontSize: 7, color: '#ef4444', fontWeight: 700 }}>NOW</span>
                  )}
                </div>
              ))}
              {/* NOW position marker on time strip */}
              {dateOffset === 0 && (
                <div
                  className="odu-now-bar"
                  style={{
                    position: 'absolute',
                    left: nowPx,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: '#ef4444',
                    zIndex: 5,
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
            <div style={{ minWidth: 24, flexShrink: 0 }} />
          </div>

          {/* Channel Rows */}
          {displayChannels.map(key => {
            const ch   = channelMap.get(key)
            const cfg  = ch ? { label: ch.name.replace(/_/g, ' '), ...cfgFor(ch) } : (LEGACY_CONFIGS[key] ?? { label: key, ...DEFAULT_STYLE })
            if (ch?.villageId && V_EMOJI[ch.villageId]) cfg.emoji = V_EMOJI[ch.villageId]
            const rows = schedules[key] ?? []

            return (
              <div
                key={key}
                id={`epg-row-${key}`}
                className="odu-fade"
                style={{
                  display: 'flex',
                  borderBottom: '1px solid rgba(255,255,255,.046)',
                  minHeight: 76,
                }}
              >
                {/* Sticky channel label */}
                <div
                  style={{
                    width: 96,
                    minWidth: 96,
                    flexShrink: 0,
                    background: '#0d1008',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 6px',
                    borderRight: '1px solid rgba(255,255,255,.07)',
                    boxShadow: `inset 0 0 14px ${cfg.glow}`,
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
                  <span style={{
                    fontSize: 8,
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 700,
                    color: cfg.color,
                    textAlign: 'center',
                    marginTop: 4,
                    lineHeight: 1.25,
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}>
                    {cfg.label}
                  </span>
                </div>

                {/* Scrollable program timeline */}
                <div
                  ref={el => { channelScrollRefs.current[key] = el }}
                  onScroll={e => handleRowScroll(key, (e.target as HTMLDivElement).scrollLeft)}
                  style={{
                    flex: 1,
                    overflowX: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 0',
                    scrollbarWidth: 'none',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: TOTAL_TIMELINE_PX,
                      height: 68,
                      flexShrink: 0,
                    }}
                  >
                    {/* Hourly grid lines */}
                    {hours.map(h => (
                      <div
                        key={h}
                        style={{
                          position: 'absolute',
                          left: minutesToPx(h * 60),
                          top: 0,
                          bottom: 0,
                          width: 1,
                          background: 'rgba(255,255,255,.04)',
                          pointerEvents: 'none',
                        }}
                      />
                    ))}

                    {/* NOW position red line */}
                    {dateOffset === 0 && (
                      <div
                        className="odu-now-bar"
                        style={{
                          position: 'absolute',
                          left: nowPx,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          background: '#ef4444',
                          zIndex: 8,
                          borderRadius: 1,
                          boxShadow: '0 0 8px rgba(239,68,68,.5)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}

                    {/* Program blocks */}
                    {rows.map(s => (
                      <div
                        key={s.id}
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: minutesToPx(timeToMinutes(s.startTime)),
                        }}
                      >
                        <ProgramBlock
                          schedule={s}
                          channelKey={key}
                          channel={channelMap.get(key)}
                          now={nowTime}
                          onSelect={sel => setSelected({ schedule: sel, channelKey: key })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Detail Panel ── */}
      {selected && (
        <DetailPanel
          schedule={selected.schedule}
          channelKey={selected.channelKey}
          channel={channelMap.get(selected.channelKey)}
          now={nowTime}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
