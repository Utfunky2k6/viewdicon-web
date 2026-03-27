'use client'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildTodaySchedule, getLiveSlots, TIER_META, SLOT_PRICES, SHOW_CATEGORY_META,
  type TVSlot, type SlotTier, type ShowCategory,
} from '@/lib/tv-schedule'

// ─── CSS ─────────────────────────────────────────────────────
const CSS_ID = 'tv-sked-css'
const CSS = `
@keyframes livePulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}70%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
@keyframes fadIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.tv-fade{animation:fadIn .35s ease both}
.live-pulse{animation:livePulse 1.5s ease-in-out infinite}
.sked-page{min-height:100vh;background:#050a06;color:#f0ede8;font-family:system-ui,sans-serif;padding-bottom:100px}
.sked-hero{background:linear-gradient(180deg,#0a1a0d 0%,#050a06 100%);padding:16px 16px 0;position:relative;overflow:hidden}
.sked-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -20%,rgba(26,124,62,.25),transparent);pointer-events:none}
.hero-title{font-size:24px;font-weight:900;background:linear-gradient(135deg,#4ade80,#d4a017);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:2px}
.hero-sub{font-size:11px;color:rgba(212,160,23,.7);font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}
.hero-stats{display:flex;gap:12px;margin-bottom:14px}
.hero-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px 14px;text-align:center;flex:1}
.hero-stat-num{font-size:18px;font-weight:800}
.hero-stat-label{font-size:9px;color:rgba(240,237,232,.4);font-weight:700;margin-top:2px;text-transform:uppercase;letter-spacing:.06em}
.filter-bar{display:flex;gap:6px;overflow-x:auto;padding:10px 16px;scrollbar-width:none}
.filter-bar::-webkit-scrollbar{display:none}
.filter-chip{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:rgba(240,237,232,.6);padding:7px 14px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0}
.filter-chip.active{color:#f0ede8;border-color:var(--fc,#1a7c3e);background:rgba(var(--fc-r,26),var(--fc-g,124),var(--fc-b,62),.2)}
.section-label{font-size:11px;font-weight:800;color:rgba(240,237,232,.3);text-transform:uppercase;letter-spacing:.1em;padding:0 16px;margin-bottom:8px}
.slot-card{margin:0 12px 10px;border-radius:14px;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s;animation:fadIn .3s ease both}
.slot-card:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,0,0,.4)}
.slot-inner{display:flex;align-items:stretch;background:#10190e;border:1px solid rgba(255,255,255,.06)}
.slot-time-col{width:56px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 0;gap:2px;background:rgba(0,0,0,.3)}
.slot-time{font-size:10px;font-weight:800;color:rgba(240,237,232,.7)}
.slot-end{font-size:9px;color:rgba(240,237,232,.35)}
.slot-body{flex:1;padding:12px 14px;min-width:0}
.slot-village-row{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.slot-village-chip{font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px;display:inline-flex;align-items:center;gap:4px}
.slot-title{font-size:14px;font-weight:800;color:#f0ede8;margin-bottom:3px;line-height:1.3}
.slot-host{font-size:11px;color:rgba(240,237,232,.45);margin-bottom:6px}
.slot-desc{font-size:11px;color:rgba(240,237,232,.5);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.slot-foot{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}
.status-badge{font-size:9px;font-weight:800;padding:3px 8px;border-radius:20px;letter-spacing:.06em}
.tier-badge{font-size:9px;font-weight:700;padding:3px 8px;border-radius:20px}
.viewers-badge{font-size:10px;color:rgba(240,237,232,.4);display:flex;align-items:center;gap:3px}
.slot-action{margin-left:auto;padding:7px 14px;border-radius:10px;border:none;font-size:11px;font-weight:800;cursor:pointer;transition:all .15s;flex-shrink:0}
.slot-action:hover{filter:brightness(1.1)}
.bookable-card{background:linear-gradient(135deg,#0a1a0d,#0f1a12);border:1px solid rgba(74,222,128,.15) !important}
.bookable-stripe{background:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(74,222,128,.03) 8px,rgba(74,222,128,.03) 16px)}
.prime-card .slot-inner{border-color:rgba(212,160,23,.2) !important;background:linear-gradient(135deg,#1a1000,#0f0f00)}
.drawer-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.75);display:flex;flex-direction:column;justify-content:flex-end}
.drawer-panel{background:#0d1a0e;border-radius:24px 24px 0 0;padding:20px;max-height:88vh;overflow-y:auto;padding-bottom:40px}
.drawer-handle{width:40px;height:4px;background:rgba(255,255,255,.15);border-radius:4px;margin:0 auto 20px}
.drawer-title{font-size:18px;font-weight:900;color:#f0ede8;margin-bottom:4px}
.drawer-sub{font-size:12px;color:rgba(240,237,232,.4);margin-bottom:16px}
.price-breakdown{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;margin-bottom:14px}
.price-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,.06)}
.price-row:last-child{border-bottom:none;font-weight:800;font-size:15px;color:#fbbf24;margin-top:4px;padding-top:10px}
.cowrie-btn{width:100%;background:linear-gradient(135deg,#e07b00,#b85c00);color:#fff;border:none;border-radius:14px;padding:16px;font-size:15px;font-weight:900;cursor:pointer;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s}
.cowrie-btn:hover{opacity:.9}
.apply-banner{margin:12px 16px;border-radius:14px;padding:14px 16px;background:linear-gradient(135deg,#5b21b6,#3b0764);border:1px solid rgba(167,139,250,.25);display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .2s}
.apply-banner:hover{border-color:rgba(167,139,250,.5)}
.apply-icon{font-size:28px;flex-shrink:0}
.apply-text h3{font-size:14px;font-weight:800;color:#f0ede8;margin-bottom:2px}
.apply-text p{font-size:11px;color:rgba(240,237,232,.5);line-height:1.4}
.apply-arrow{margin-left:auto;font-size:20px;color:#a78bfa}
.empty-state{text-align:center;padding:48px 20px;color:rgba(240,237,232,.3)}
.success-state{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:20px}
.success-card{background:#0d1a0e;border:1px solid rgba(74,222,128,.3);border-radius:20px;padding:24px;text-align:center;max-width:340px;width:100%}
`

type FilterKey = 'all' | 'live' | 'upcoming' | 'bookable' | 'prime' | string

export default function TVSchedulePage() {
  const router = useRouter()
  const schedule = useMemo(() => buildTodaySchedule(), [])
  const liveCount = useMemo(() => getLiveSlots(schedule).length, [schedule])
  const totalViewers = useMemo(() => schedule.filter(s => s.status === 'LIVE').reduce((a, s) => a + (s.program?.viewers ?? 0), 0), [schedule])
  const bookableCount = useMemo(() => schedule.filter(s => s.isBookable).length, [schedule])

  const [filter, setFilter] = useState<FilterKey>('all')
  const [booking, setBooking]       = useState<TVSlot | null>(null)
  const [booked, setBooked]         = useState<Set<string>>(new Set())
  const [success, setSuccess]       = useState<TVSlot | null>(null)
  const [calAdded, setCalAdded]     = useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all')      return schedule
    if (filter === 'live')     return schedule.filter(s => s.status === 'LIVE')
    if (filter === 'upcoming') return schedule.filter(s => s.status === 'UPCOMING')
    if (filter === 'bookable') return schedule.filter(s => s.isBookable)
    if (filter === 'prime')    return schedule.filter(s => s.tier === 'PRIME')
    // village filter
    return schedule.filter(s => s.villageId === filter)
  }, [schedule, filter])

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleBook(slot: TVSlot) {
    setBooking(slot)
  }

  function confirmBook(slot: TVSlot) {
    setBooked(prev => new Set([...prev, slot.id]))
    setBooking(null)
    setSuccess(slot)
  }

  function addToCalendar(slot: TVSlot) {
    setCalAdded(prev => new Set([...prev, slot.id]))
  }

  const FILTERS: { key: FilterKey; label: string; color?: string }[] = [
    { key: 'all',      label: `🎬 All · ${schedule.length}` },
    { key: 'live',     label: `🔴 Live · ${liveCount}`,     color: '#ef4444' },
    { key: 'upcoming', label: `⏰ Coming Up` },
    { key: 'bookable', label: `🟢 Book a Slot · ${bookableCount}`, color: '#4ade80' },
    { key: 'prime',    label: `⭐ Prime Time`, color: '#fbbf24' },
  ]

  return (
    <div className="sked-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="sked-hero">
        <div className="sked-hero-bg" />
        <div className="hero-title">📺 Village Airwaves</div>
        <div className="hero-sub">{today} · 20 Channels · Live & Bookable</div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: '#ef4444' }}>{liveCount}</div>
            <div className="hero-stat-label">Live Now</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: '#4ade80' }}>{(totalViewers / 1000).toFixed(1)}K</div>
            <div className="hero-stat-label">Watching</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: '#fbbf24' }}>{bookableCount}</div>
            <div className="hero-stat-label">Book a Slot</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: '#a78bfa' }}>40</div>
            <div className="hero-stat-label">Daily Slots</div>
          </div>
        </div>

        {/* Pricing tiers at a glance */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' }}>
          {(Object.entries(TIER_META) as [SlotTier, typeof TIER_META[SlotTier]][]).map(([tier, meta]) => (
            <div key={tier} style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30`, borderRadius: 8, padding: '5px 10px', flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: meta.color }}>{meta.label}</div>
              <div style={{ fontSize: 8, color: 'rgba(240,237,232,.4)', marginTop: 1 }}>{meta.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Apply to Broadcast Banner ──────────────────── */}
      <div className="apply-banner" onClick={() => router.push('/dashboard/tv/apply')}>
        <div className="apply-icon">🎙</div>
        <div className="apply-text">
          <h3>Want to Host a Show?</h3>
          <p>Apply to broadcast on your Village channel — book a slot and light your fire</p>
        </div>
        <div className="apply-arrow">›</div>
      </div>

      {/* ── Filter Bar ────────────────────────────────── */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f.key} className={`filter-chip${filter === f.key ? ' active' : ''}`}
            style={{ '--fc': f.color || '#1a7c3e', '--fc-r': 26, '--fc-g': 124, '--fc-b': 62 } as React.CSSProperties}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.1)', margin: '0 4px', alignSelf: 'center', flexShrink: 0 }} />
        {/* Village quick filters */}
        {['commerce','agriculture','health','education','technology','finance','hospitality','fashion','arts','sports','media','family','spirituality'].map(vid => {
          const meta = schedule.find(s => s.villageId === vid)
          if (!meta) return null
          return (
            <button key={vid} className={`filter-chip${filter === vid ? ' active' : ''}`}
              style={{ '--fc': meta.villageColor } as React.CSSProperties}
              onClick={() => setFilter(vid)}>
              {meta.villageEmoji} {meta.villageName}
            </button>
          )
        })}
      </div>

      {/* ── Schedule List ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>No shows match this filter</div>
        </div>
      ) : (
        <>
          {/* Group by status */}
          {['LIVE', 'UPCOMING', 'BOOKABLE', 'COMPLETED'].map(statusGroup => {
            const group = filtered.filter(s => s.status === statusGroup)
            if (group.length === 0) return null
            const labels: Record<string, string> = {
              LIVE: '🔴 LIVE NOW', UPCOMING: '⏰ COMING UP', BOOKABLE: '🟢 BOOK A SLOT', COMPLETED: '✅ AIRED TODAY',
            }
            return (
              <div key={statusGroup} style={{ marginTop: statusGroup !== 'LIVE' ? 8 : 0 }}>
                <div className="section-label" style={{ marginTop: 12 }}>{labels[statusGroup]}</div>
                {group.map((slot, i) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    index={i}
                    isBooked={booked.has(slot.id)}
                    isCalAdded={calAdded.has(slot.id)}
                    onBook={() => handleBook(slot)}
                    onWatch={() => router.push('/dashboard/tv')}
                    onCalAdd={() => addToCalendar(slot)}
                  />
                ))}
              </div>
            )
          })}
        </>
      )}

      {/* ── Booking Drawer ────────────────────────────── */}
      {booking && (
        <div className="drawer-overlay" onClick={() => setBooking(null)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${booking.villageColor}20`, border: `1px solid ${booking.villageColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {booking.villageEmoji}
              </div>
              <div>
                <div className="drawer-title">Book This Slot</div>
                <div className="drawer-sub">{booking.villageName} Village · {booking.startTime}–{booking.endTime} WAT</div>
              </div>
            </div>

            {/* Slot details */}
            <div style={{ background: `${booking.villageColor}10`, border: `1px solid ${booking.villageColor}25`, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: booking.villageColor, marginBottom: 8 }}>
                {TIER_META[booking.tier].label} Slot · Your Broadcast Window
              </div>
              {[
                ['📺 Channel',    `${booking.villageName} Village Airwaves`],
                ['⏰ Time',       `${booking.startTime} – ${booking.endTime} WAT`],
                ['⏱ Duration',   `${booking.durationHours} hour${booking.durationHours > 1 ? 's' : ''}`],
                ['📅 Date',       'Today (recurring daily option available)'],
                ['👥 Est. Reach', `${Math.floor(Math.random() * 3000 + 500).toLocaleString()} village members`],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 12 }}>
                  <span style={{ color: 'rgba(240,237,232,.45)' }}>{label}</span>
                  <span style={{ color: '#f0ede8', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="price-breakdown">
              <div className="price-row">
                <span style={{ color: 'rgba(240,237,232,.5)' }}>Slot fee ({TIER_META[booking.tier].label})</span>
                <span>{booking.cowriePrice.toLocaleString()} Cowrie</span>
              </div>
              <div className="price-row">
                <span style={{ color: 'rgba(240,237,232,.5)' }}>Village broadcast tax (5%)</span>
                <span>{Math.round(booking.cowriePrice * 0.05).toLocaleString()} Cowrie</span>
              </div>
              <div className="price-row">
                <span>Total</span>
                <span>🌊 {(booking.cowriePrice * 1.05).toLocaleString()} Cowrie</span>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'rgba(240,237,232,.35)', marginBottom: 12, lineHeight: 1.5 }}>
              Your Cowrie will be locked in escrow. If your broadcast is cancelled, you receive a full refund. Village elders must approve your content before going live.
            </div>

            <button className="cowrie-btn" onClick={() => confirmBook(booking)}>
              🌊 Lock {(booking.cowriePrice * 1.05).toLocaleString()} Cowrie · Book Slot
            </button>
            <button onClick={() => { addToCalendar(booking); setBooking(null) }}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(240,237,232,.6)', borderRadius: 12, padding: 12, marginTop: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              📅 Add to Calendar Only (Free)
            </button>
            <button onClick={() => setBooking(null)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(240,237,232,.3)', marginTop: 6, fontSize: 12, cursor: 'pointer', padding: 8 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Success State ─────────────────────────────── */}
      {success && (
        <div className="success-state" onClick={() => setSuccess(null)}>
          <div className="success-card">
            <div style={{ fontSize: 56, marginBottom: 12 }}>🔥</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', marginBottom: 4 }}>Slot Booked!</div>
            <div style={{ fontSize: 13, color: 'rgba(240,237,232,.6)', marginBottom: 16, lineHeight: 1.5 }}>
              Your {success.villageName} Village slot from {success.startTime}–{success.endTime} is locked. A calendar event and Seso chat with the village channel manager will open now.
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <button onClick={() => { setSuccess(null); addToCalendar(success); router.push('/dashboard/calendar') }}
                style={{ background: '#1a7c3e', border: 'none', color: '#fff', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                📅 View in Calendar
              </button>
              <button onClick={() => { setSuccess(null); router.push('/dashboard/chat') }}
                style={{ background: '#1e1a2e', border: '1px solid rgba(167,139,250,.25)', color: '#a78bfa', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                💬 Open Channel Chat
              </button>
              <button onClick={() => setSuccess(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(240,237,232,.3)', fontSize: 12, cursor: 'pointer', padding: 6 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Slot Card Component ──────────────────────────────────────
function SlotCard({ slot, index, isBooked, isCalAdded, onBook, onWatch, onCalAdd }: {
  slot: TVSlot; index: number; isBooked: boolean; isCalAdded: boolean
  onBook: () => void; onWatch: () => void; onCalAdd: () => void
}) {
  const isLive      = slot.status === 'LIVE'
  const isBookable  = slot.isBookable
  const isPrime     = slot.tier === 'PRIME'
  const catMeta     = slot.program?.category ? SHOW_CATEGORY_META[slot.program.category] : null

  return (
    <div
      className={`slot-card tv-fade${isBookable ? ' bookable-card' : ''}${isPrime ? ' prime-card' : ''}`}
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={isLive ? onWatch : isBookable ? onBook : undefined}
    >
      <div className="slot-inner" style={{ borderLeftWidth: 3, borderLeftColor: slot.villageColor, borderLeftStyle: 'solid' }}>
        {/* Time column */}
        <div className="slot-time-col">
          <div className="slot-time">{slot.startTime}</div>
          <div style={{ fontSize: 8, color: slot.villageColor, fontWeight: 700, margin: '2px 0' }}>▼</div>
          <div className="slot-end">{slot.endTime}</div>
          <div style={{ fontSize: 7, color: 'rgba(240,237,232,.3)', marginTop: 4, fontWeight: 700 }}>
            {slot.durationHours}H
          </div>
        </div>

        {/* Body */}
        <div className="slot-body">
          {/* Village chip */}
          <div className="slot-village-row">
            <span className="slot-village-chip" style={{ background: `${slot.villageColor}20`, color: slot.villageColor }}>
              {slot.villageEmoji} {slot.villageName}
            </span>
            {isPrime && <span style={{ fontSize: 8, fontWeight: 800, color: '#fbbf24' }}>⭐ PRIME</span>}
          </div>

          {isBookable ? (
            <>
              <div className="slot-title" style={{ color: '#4ade80' }}>
                🟢 Available Slot
              </div>
              <div className="slot-host" style={{ color: '#4ade80' }}>
                Open to applicants · {slot.applyCount} watching this slot
              </div>
              <div style={{ fontSize: 11, color: 'rgba(240,237,232,.4)', lineHeight: 1.5 }}>
                Book this {slot.durationHours}-hour window on the {slot.villageName} Village channel. Choose your show format and light your fire.
              </div>
            </>
          ) : (
            <>
              <div className="slot-title">{slot.program?.title || 'TBA'}</div>
              <div className="slot-host">🎙 {slot.program?.host}</div>
              {slot.program?.desc && <div className="slot-desc">{slot.program.desc}</div>}
            </>
          )}

          {/* Footer */}
          <div className="slot-foot">
            {isLive && (
              <span className="status-badge live-pulse" style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440' }}>● LIVE</span>
            )}
            {!isLive && !isBookable && (
              <span className="status-badge" style={{ background: `${slot.status === 'UPCOMING' ? '#1a7c3e' : '#374151'}20`, color: slot.status === 'UPCOMING' ? '#4ade80' : '#6b7280' }}>
                {slot.status === 'UPCOMING' ? '⏰ UPCOMING' : '✅ AIRED'}
              </span>
            )}
            {isBookable && (
              <span className="tier-badge" style={{ background: `${TIER_META[slot.tier].color}15`, color: TIER_META[slot.tier].color }}>
                {TIER_META[slot.tier].label}
              </span>
            )}
            {catMeta && (
              <span className="tier-badge" style={{ background: `${catMeta.color}15`, color: catMeta.color }}>
                {catMeta.emoji} {catMeta.label}
              </span>
            )}
            {isLive && slot.program?.viewers && (
              <span className="viewers-badge">👁 {slot.program.viewers.toLocaleString()}</span>
            )}

            {/* Action button */}
            {isLive && (
              <button className="slot-action" style={{ background: '#ef4444', color: '#fff' }} onClick={e => { e.stopPropagation(); onWatch() }}>
                ▶ Watch
              </button>
            )}
            {isBookable && !isBooked && (
              <button className="slot-action" style={{ background: 'linear-gradient(135deg,#e07b00,#b85c00)', color: '#fff' }} onClick={e => { e.stopPropagation(); onBook() }}>
                🌊 {slot.cowriePrice.toLocaleString()}
              </button>
            )}
            {isBooked && (
              <span className="status-badge" style={{ background: '#1a7c3e20', color: '#4ade80', marginLeft: 'auto' }}>✓ Booked</span>
            )}
            {!isBookable && !isLive && !isBooked && (
              <button className="slot-action"
                style={{ background: isCalAdded ? '#1a4a2e' : 'rgba(255,255,255,.06)', color: isCalAdded ? '#4ade80' : 'rgba(240,237,232,.5)', border: '1px solid rgba(255,255,255,.1)' }}
                onClick={e => { e.stopPropagation(); onCalAdd() }}>
                {isCalAdded ? '✓ Added' : '📅 +Cal'}
              </button>
            )}
          </div>

          {/* Bookable price highlight */}
          {isBookable && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#fbbf24' }}>
                🌊 {slot.cowriePrice.toLocaleString()}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(240,237,232,.35)' }}>Cowrie · {slot.durationHours}h block</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
