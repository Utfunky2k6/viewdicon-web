'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { eventsApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'
import type { PlatformEvent, EventSponsor } from '@/types'
import { calcPlatformFee, TIER_CONFIG } from '@/types'

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: '#070414', card: '#0d0618', card2: '#120820', border: '#1a0a2e',
  purple: '#7c3aed', purpleL: '#a78bfa', purpleD: '#4c1d95',
  green: '#4ade80', greenD: '#14532d',
  gold: '#fbbf24', goldD: '#78350f',
  red: '#ef4444', redD: '#7f1d1d',
  blue: '#60a5fa', blueD: '#1e3a5f',
  orange: '#fb923c', cyan: '#22d3ee', pink: '#f472b6',
  muted: '#6b7280', text: '#e2e8f0', dim: '#94a3b8',
}

// ── Sponsor tier config ───────────────────────────────────────────────────
const SPONSOR_TIERS = {
  TITLE:   { label: 'Title Sponsor',   color: C.gold,   bg: '#78350f22', emoji: '👑', minAmount: 2000000, exposure: 100 },
  GOLD:    { label: 'Gold Sponsor',    color: '#fcd34d', bg: '#78350f18', emoji: '🥇', minAmount: 500000,  exposure: 60  },
  SILVER:  { label: 'Silver Sponsor',  color: '#94a3b8', bg: '#1e293b33', emoji: '🥈', minAmount: 200000,  exposure: 30  },
  BRONZE:  { label: 'Bronze Sponsor',  color: '#c2885b', bg: '#1c100633', emoji: '🥉', minAmount: 50000,   exposure: 15  },
}

const BANNER_TYPES = [
  { id: 'TICKER',      label: 'Ticker Crawl',    icon: '📰', desc: 'Text scrolls across bottom of stream continuously', secs: 6   },
  { id: 'LOWER_THIRD', label: 'Lower Third',      icon: '📺', desc: 'Logo + name overlaid in lower 1/3 of screen, 30s each', secs: 30  },
  { id: 'CORNER_BUG',  label: 'Corner Bug',       icon: '🔵', desc: 'Persistent small logo pinned to top-right corner', secs: 999 },
  { id: 'FULL_BANNER', label: 'Full Banner',      icon: '🖼',  desc: 'Full-width banner break between segments, 15s', secs: 15  },
]

// ── Platform revenue model (all 20 streams) ───────────────────────────────
interface PlatformRevStream {
  id: string; category: string; label: string; icon: string
  platformEarns: number; organizerEarns: number; note: string
}

function buildPlatformRevStreams(event: PlatformEvent): PlatformRevStream[] {
  const r = event.revenue!
  const tiers = event.tiers
  const totalTicketGross = tiers.reduce((a, t) => a + (t.price * (t.sold || 0)), 0)
  const streamTier = tiers.find(t => t.type === 'STREAM')
  const streamGross = streamTier ? streamTier.price * (streamTier.sold || 0) : 0
  const resaleVolume   = Math.round(totalTicketGross * 0.08)
  const boostFees      = 150000
  const vendorBoothFees = event.vendors?.reduce((a, v) => a + v.boothFee, 0) ?? 0
  const vendorSalesCut  = event.vendors?.reduce((a, v) => a + v.platformCut, 0) ?? 0
  const adSplit        = Math.round(streamGross * 0.4)
  const merchandisePF  = 80000
  const foodPF         = 120000
  const parkingPF      = 30000
  const shuttlePF      = 20000
  const analyticsFees  = 50000
  const insuranceFees  = 200000
  const financingFees  = 100000
  const equipmentFees  = 75000
  const staffMrktFees  = 60000
  const venueFees      = 175000
  const donationFees   = Math.round((r.donations ?? 0) * 0.02)
  const streamSvcFee   = Math.round(streamGross * 0.10)
  const premiumToolsSub = 25000

  return [
    { id: 'ticket_fees',    category: 'Tickets',   label: 'Ticket Platform Fee',         icon: '🎫', platformEarns: r.platformFees,     organizerEarns: r.organizerNet,   note: event.tierLevel === 'STANDARD' ? '5% of gross' : '10% of gross' },
    { id: 'resale_fees',    category: 'Tickets',   label: 'Resale Marketplace (15%)',     icon: '🔄', platformEarns: Math.round(resaleVolume * 0.15), organizerEarns: Math.round(resaleVolume * 0.85), note: '15% of all secondary market sales' },
    { id: 'stream_svc',     category: 'Streaming', label: 'Streaming Service Fee',        icon: '📡', platformEarns: streamSvcFee,       organizerEarns: streamGross - streamSvcFee, note: '10% of stream ticket revenue' },
    { id: 'ad_split',       category: 'Streaming', label: 'Ad Revenue Split (40%)',       icon: '📢', platformEarns: adSplit,            organizerEarns: Math.round(streamGross * 0.6), note: '40% platform / 60% organizer' },
    { id: 'boost_promo',    category: 'Promotion', label: 'Event Boost & Promotion',      icon: '🚀', platformEarns: boostFees,          organizerEarns: 0, note: 'Fixed fee for algorithmic boost in feed' },
    { id: 'vendor_booth',   category: 'Vendors',   label: 'Vendor Booth Upfront Fee',     icon: '🏪', platformEarns: vendorBoothFees,    organizerEarns: 0, note: 'Platform processes & takes 100% of booth fee' },
    { id: 'vendor_sales',   category: 'Vendors',   label: 'Vendor Sales Cut (10%)',       icon: '💳', platformEarns: vendorSalesCut,     organizerEarns: 0, note: '10% of all in-event vendor transactions' },
    { id: 'merch_cut',      category: 'Vendors',   label: 'Merchandise Cut (10%)',        icon: '🛍', platformEarns: merchandisePF,      organizerEarns: 720000, note: '10% of merch GMV via platform payments' },
    { id: 'food_cut',       category: 'Vendors',   label: 'Food & Drinks Cut (10%)',      icon: '🍲', platformEarns: foodPF,             organizerEarns: 0, note: '10% of food vendor transactions' },
    { id: 'parking_cut',    category: 'Logistics', label: 'Parking Booking Fee',          icon: '🅿️', platformEarns: parkingPF,         organizerEarns: 0, note: 'Flat % of parking ticket revenue' },
    { id: 'shuttle_cut',    category: 'Logistics', label: 'Shuttle Coordination Fee',     icon: '🚌', platformEarns: shuttlePF,          organizerEarns: 0, note: 'Per-seat processing fee on shuttle bookings' },
    { id: 'analytics',      category: 'Data',      label: 'Analytics Report (Premium)',   icon: '📊', platformEarns: analyticsFees,      organizerEarns: 0, note: 'Full post-event analytics dashboard export' },
    { id: 'insurance',      category: 'Risk',      label: 'Event Insurance Processing',   icon: '🔐', platformEarns: insuranceFees,      organizerEarns: 0, note: 'Platform acts as insurance distributor' },
    { id: 'financing',      category: 'Finance',   label: 'Event Financing Interest',     icon: '🏦', platformEarns: financingFees,      organizerEarns: 0, note: 'Interest on organizer pre-event cash advances' },
    { id: 'equipment',      category: 'Logistics', label: 'Equipment Rental Commission',  icon: '🎛', platformEarns: equipmentFees,      organizerEarns: 0, note: 'Commission on sound, lighting, AV rentals' },
    { id: 'staffing_mkt',   category: 'HR',        label: 'Staff Marketplace Fee (5%)',   icon: '👥', platformEarns: staffMrktFees,      organizerEarns: 0, note: '5% of contracted staff fees via platform' },
    { id: 'venue_booking',  category: 'Venue',     label: 'Venue Booking Commission',     icon: '🏛', platformEarns: venueFees,          organizerEarns: 0, note: '% of venue booking made through platform' },
    { id: 'premium_tools',  category: 'SaaS',      label: 'Premium Organizer Tools',      icon: '🛠', platformEarns: premiumToolsSub,    organizerEarns: 0, note: 'Monthly subscription for advanced organizer features' },
    { id: 'donation_proc',  category: 'Finance',   label: 'Donation Processing (2%)',     icon: '🤲', platformEarns: donationFees,       organizerEarns: Math.round((r.donations ?? 0) * 0.98), note: '2% payment processing on community donations' },
    { id: 'sponsor_banner', category: 'Streaming', label: 'Sponsor Banner Impressions',   icon: '🖼', platformEarns: 200000,             organizerEarns: 0, note: 'CPM-based sponsor banner placement revenue' },
  ]
}

// ── Utilities ─────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. REVENUE TAB (with full platform profit calculator)
// ─────────────────────────────────────────────────────────────────────────────
function RevenueTab({ event }: { event: PlatformEvent }) {
  const [showPlatformCalc, setShowPlatformCalc] = useState(false)
  const r = event.revenue!
  const tc = TIER_CONFIG[event.tierLevel]
  const feeRate = event.tierLevel === 'COMMUNITY' ? '0%' : event.tierLevel === 'STANDARD' ? '5%' : '10%'
  const streams = buildPlatformRevStreams(event)
  const totalPlatformProfit = streams.reduce((a, s) => a + s.platformEarns, 0)
  const categoryTotals = streams.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + s.platformEarns
    return acc
  }, {} as Record<string, number>)
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  const escrowSteps = [
    { label: 'Ticket Sold', done: true, icon: '🎫', desc: 'Buyer pays' },
    { label: 'Escrow Lock', done: true, icon: '🔒', desc: 'Funds held' },
    { label: 'Event Held', done: false, icon: '🎵', desc: 'Verified live' },
    { label: '48h Window', done: false, icon: '⏳', desc: 'Dispute period' },
    { label: 'Released',   done: false, icon: '✅', desc: 'Funds free' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { label: 'Gross Revenue', val: fmt(r.gross), sub: 'All ticket sales', color: C.green, icon: '📈' },
          { label: 'Platform Fees', val: fmt(r.platformFees), sub: `${feeRate} of gross`, color: C.red, icon: '🏦' },
          { label: 'Your Net', val: fmt(r.organizerNet), sub: 'After platform fees', color: C.purple, icon: '💜' },
          { label: 'Sponsorships', val: fmt(r.sponsorships), sub: 'Direct to you', color: C.gold, icon: '🤝' },
        ].map(c => (
          <div key={c.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 11, color: C.muted }}>{c.label}</div>
              <div style={{ fontSize: 16 }}>{c.icon}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color, marginTop: 4 }}>{c.val}</div>
            <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Escrow pipeline */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Escrow Pipeline</div>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{fmt(r.escrowHeld)} held</div>
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 14 }}>Releases 48h after event verification. No disputes = full release.</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto' }}>
          {escrowSteps.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 52 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: s.done ? C.greenD : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, border: `2px solid ${s.done ? C.green : C.muted}` }}>{s.icon}</div>
                <div style={{ fontSize: 9, color: s.done ? C.green : C.muted, marginTop: 4, textAlign: 'center', lineHeight: 1.3 }}>{s.label}</div>
                <div style={{ fontSize: 8, color: C.muted, textAlign: 'center' }}>{s.desc}</div>
              </div>
              {i < escrowSteps.length - 1 && (
                <div style={{ height: 2, flex: 1, background: s.done ? C.green : C.border, marginTop: 18, minWidth: 4 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier breakdown table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Revenue by Tier</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Tier', 'Sold', 'Gross', `Fee (${feeRate})`, 'You Get'].map(h => (
                  <th key={h} style={{ padding: '4px 6px', color: C.muted, fontWeight: 600, textAlign: 'left', fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {event.tiers.map(tier => {
                const gross = tier.price * (tier.sold || 0)
                const fee   = calcPlatformFee(tier.price, event.tierLevel) * (tier.sold || 0)
                return (
                  <tr key={tier.id} style={{ borderBottom: `1px solid ${C.border}33` }}>
                    <td style={{ padding: '9px 6px', color: C.text, fontWeight: 600 }}>{tier.name}</td>
                    <td style={{ padding: '9px 6px', color: C.dim }}>{tier.sold ?? 0}</td>
                    <td style={{ padding: '9px 6px', color: C.green }}>{fmt(gross)}</td>
                    <td style={{ padding: '9px 6px', color: C.red }}>{fmt(fee)}</td>
                    <td style={{ padding: '9px 6px', color: C.purple, fontWeight: 700 }}>{fmt(gross - fee)}</td>
                  </tr>
                )
              })}
              <tr style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: '8px 6px', color: C.text, fontWeight: 800 }}>TOTAL</td>
                <td style={{ padding: '8px 6px', color: C.dim, fontWeight: 700 }}>{event.tiers.reduce((a, t) => a + (t.sold ?? 0), 0)}</td>
                <td style={{ padding: '8px 6px', color: C.green, fontWeight: 800 }}>{fmt(r.gross)}</td>
                <td style={{ padding: '8px 6px', color: C.red, fontWeight: 800 }}>{fmt(r.platformFees)}</td>
                <td style={{ padding: '8px 6px', color: C.purple, fontWeight: 800 }}>{fmt(r.organizerNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor + Sponsor income */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Vendor Booth Fees</div>
          {event.vendors?.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ fontSize: 10, color: C.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{v.name}</div>
              <div style={{ fontSize: 10, color: C.gold, fontWeight: 600 }}>{fmt(v.boothFee)}</div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 7, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, color: C.text, fontWeight: 700 }}>Booth Total</div>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 800 }}>{fmt(event.vendors?.reduce((a, v) => a + v.boothFee, 0) ?? 0)}</div>
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Sponsorships</div>
          {event.sponsors?.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <div>
                <div style={{ fontSize: 10, color: C.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>{s.name}</div>
                <div style={{ fontSize: 8, color: SPONSOR_TIERS[s.tier as keyof typeof SPONSOR_TIERS]?.color ?? C.muted }}>{s.tier}</div>
              </div>
              <div style={{ fontSize: 10, color: C.cyan, fontWeight: 600 }}>{fmt(s.amount)}</div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 7, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, color: C.text, fontWeight: 700 }}>Sponsors Total</div>
            <div style={{ fontSize: 11, color: C.cyan, fontWeight: 800 }}>{fmt(event.sponsors?.reduce((a, s) => a + s.amount, 0) ?? 0)}</div>
          </div>
        </div>
      </div>

      {/* Withdrawal */}
      <div style={{ background: C.card, border: `1px solid ${C.gold}33`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 4 }}>💰 Withdrawal</div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 12 }}>Sponsors & booth fees available now. Ticket escrow releases post-event + 48h.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{ background: '#0d1a0d', border: `1px solid ${C.green}33`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: C.muted }}>Available Now</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.green }}>{fmt(r.sponsorships + (event.vendors?.reduce((a, v) => a + v.boothFee, 0) ?? 0))}</div>
            <div style={{ fontSize: 9, color: C.dim }}>Sponsors + booths</div>
          </div>
          <div style={{ background: '#1a0f00', border: `1px solid ${C.gold}33`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: C.muted }}>In Escrow</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.gold }}>{fmt(r.escrowHeld)}</div>
            <div style={{ fontSize: 9, color: C.dim }}>Releases post-event</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => { window.location.href = '/dashboard/banking' }} style={{ padding: '11px 0', borderRadius: 10, background: C.green, color: '#000', fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer' }}>💸 Withdraw Now</button>
          <button style={{ padding: '11px 0', borderRadius: 10, background: C.border, color: C.muted, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'default' }}>🔒 Escrow Pending</button>
        </div>
      </div>

      {/* Platform profit calculator toggle */}
      <button
        onClick={() => setShowPlatformCalc(v => !v)}
        style={{ width: '100%', padding: '12px', borderRadius: 12, background: C.card, border: `1px solid ${C.purple}44`, color: C.purpleL, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <div style={{ textAlign: 'left' }}>
            <div>Platform Profit Calculator</div>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 400 }}>See what Viewdicon earns across all 20 revenue streams</div>
          </div>
        </div>
        <span style={{ fontSize: 18, transition: 'transform .2s', transform: showPlatformCalc ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {showPlatformCalc && (
        <div style={{ background: C.card2, border: `1px solid ${C.purple}44`, borderRadius: 12, padding: 16 }}>
          {/* Summary banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ background: `${C.purple}22`, border: `1px solid ${C.purple}44`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: C.dim }}>Platform Earns</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.purpleL }}>{fmt(totalPlatformProfit)}</div>
              <div style={{ fontSize: 8, color: C.muted }}>across 20 streams</div>
            </div>
            <div style={{ background: `${C.green}11`, border: `1px solid ${C.green}33`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: C.dim }}>Top Source</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.green, lineHeight: 1.2 }}>{topCategory?.[0] ?? '—'}</div>
              <div style={{ fontSize: 8, color: C.muted }}>{fmt(topCategory?.[1] ?? 0)}</div>
            </div>
            <div style={{ background: `${C.gold}11`, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: C.dim }}>Take Rate</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>
                {r.gross > 0 ? `${((totalPlatformProfit / (r.gross + r.sponsorships)) * 100).toFixed(1)}%` : '—'}
              </div>
              <div style={{ fontSize: 8, color: C.muted }}>of total GMV</div>
            </div>
          </div>

          {/* Category headers with details */}
          {Array.from(new Set(streams.map(s => s.category))).map(cat => {
            const catStreams = streams.filter(s => s.category === cat)
            const catTotal  = catStreams.reduce((a, s) => a + s.platformEarns, 0)
            if (catTotal === 0) return null
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.purpleL, textTransform: 'uppercase', letterSpacing: '.08em' }}>{cat}</div>
                  <div style={{ fontSize: 10, color: C.purpleL, fontWeight: 700 }}>{fmt(catTotal)}</div>
                </div>
                {catStreams.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 4px', borderBottom: `1px solid ${C.border}22` }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{s.note}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: C.purpleL, fontWeight: 700 }}>{fmt(s.platformEarns)}</div>
                      {s.organizerEarns > 0 && (
                        <div style={{ fontSize: 8, color: C.dim }}>you: {fmt(s.organizerEarns)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          {/* Grand total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${C.purple}44`, paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.purpleL }}>🏆 Viewdicon Total Profit</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.purpleL }}>{fmt(totalPlatformProfit)}</div>
          </div>
          <div style={{ fontSize: 9, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
            This breakdown shows all platform revenues generated by your event. Organizer net pay-outs are calculated after deducting platform fees from gross sales.
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TICKETS TAB
// ─────────────────────────────────────────────────────────────────────────────
function TicketsTab({ event }: { event: PlatformEvent }) {
  const totalSold   = event.tiers.reduce((a, t) => a + (t.sold ?? 0), 0)
  const totalSupply = event.tiers.reduce((a, t) => a + t.supply, 0)
  const MOCK_BUYS = [
    { id: 'p1', buyer: 'Kemi Adeyemi',  tier: 'VIP',       amount: 30000, fee: 3000, net: 27000, time: '2 min ago' },
    { id: 'p2', buyer: 'Tunde Ojo',     tier: 'General',   amount: 20000, fee: 2000, net: 18000, time: '8 min ago' },
    { id: 'p3', buyer: 'Ngozi Eze',     tier: 'Livestream', amount: 1000, fee: 100,  net: 900,   time: '15 min ago' },
    { id: 'p4', buyer: 'Ibrahim Musa',  tier: 'Backstage', amount: 50000, fee: 5000, net: 45000, time: '1h ago' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Sold', val: totalSold.toString(), color: C.green },
          { label: 'Available',  val: (totalSupply - totalSold).toString(), color: C.gold },
          { label: 'Capacity %', val: totalSupply > 0 ? `${Math.round((totalSold / totalSupply) * 100)}%` : '0%', color: C.purple },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Tier Performance</div>
        {event.tiers.map(tier => {
          const pctSold = tier.supply === 0 ? 0 : Math.round(((tier.sold ?? 0) / tier.supply) * 100)
          const col = tier.type === 'BACKSTAGE' ? C.purple : tier.type === 'VIP' ? C.gold : tier.type === 'STREAM' ? C.blue : C.green
          return (
            <div key={tier.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{tier.name}</span>
                  <span style={{ fontSize: 9, color: col, background: `${col}22`, padding: '2px 5px', borderRadius: 4 }}>{tier.type}</span>
                </div>
                <span style={{ fontSize: 11, color: C.dim }}>{tier.sold ?? 0}/{tier.supply} · <span style={{ color: col, fontWeight: 700 }}>{pctSold}%</span></span>
              </div>
              <div style={{ height: 7, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pctSold}%`, background: col, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 9, color: C.dim }}>₦{tier.price.toLocaleString()} ea</span>
                <span style={{ fontSize: 9, color: C.muted }}>{(tier.available ?? tier.supply - (tier.sold ?? 0))} remaining</span>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Recent Purchases</div>
        {USE_MOCKS && MOCK_BUYS.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${C.border}33` }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: C.text }}>{p.buyer}</div><div style={{ fontSize: 9, color: C.muted }}>{p.tier} · {p.time}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: C.green }}>{fmt(p.amount)}</div><div style={{ fontSize: 9, color: C.red }}>-{fmt(p.fee)} fee</div></div>
          </div>
        ))}
        <button onClick={() => {
          const rows = [['Buyer','Tier','Time','Amount','Fee'],...((event.revenue as any)?.recentPurchases ?? []).map((p: any) => [p.buyer, p.tier, p.time, p.amount, p.fee])]
          const csv = rows.map(r => r.join(',')).join('\n')
          const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = `tickets-${event.id}.csv`; a.click()
        }} style={{ marginTop: 12, width: '100%', padding: '9px 0', background: C.border, color: C.text, border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>Export All as CSV →</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SPONSORS TAB — multi-logo upload, subscript banner scheduler
// ─────────────────────────────────────────────────────────────────────────────
interface LocalSponsor extends EventSponsor {
  logos: { id: string; variant: string; url: string; file?: File }[]
  bannerType: string
  tickerText: string
  exposureMinutes: number
  active: boolean
  website: string
  contactName: string
  contactEmail: string
}

const LOGO_VARIANTS = ['Horizontal Color', 'Horizontal White', 'Square Icon', 'Dark Version']

function SponsorsTab({ event }: { event: PlatformEvent }) {
  const [sponsors, setSponsors] = useState<LocalSponsor[]>(() =>
    (event.sponsors ?? []).map(s => ({
      ...s,
      logos: [],
      bannerType: 'LOWER_THIRD',
      tickerText: `Proudly sponsored by ${s.name}`,
      exposureMinutes: SPONSOR_TIERS[s.tier as keyof typeof SPONSOR_TIERS]?.exposure ?? 30,
      active: true,
      website: '',
      contactName: '',
      contactEmail: '',
    }))
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [previewSubscript, setPreviewSubscript] = useState(false)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // form state
  const [fName, setFName]       = useState('')
  const [fTier, setFTier]       = useState<keyof typeof SPONSOR_TIERS>('GOLD')
  const [fAmount, setFAmount]   = useState(500000)
  const [fBanner, setFBanner]   = useState('LOWER_THIRD')
  const [fTicker, setFTicker]   = useState('')
  const [fWebsite, setFWebsite] = useState('')
  const [fContact, setFContact] = useState('')
  const [fEmail, setFEmail]     = useState('')

  const totalSponsorValue = sponsors.reduce((a, s) => a + s.amount, 0)
  const totalExposure     = sponsors.reduce((a, s) => a + s.exposureMinutes, 0)
  const totalPlatformCPM  = Math.round(totalSponsorValue / Math.max(1, (event.streamViewerCount ?? 5000) / 1000))

  const handleLogoUpload = (sponsorId: string, variant: string, file: File) => {
    const url = URL.createObjectURL(file)
    setSponsors(prev => prev.map(s => {
      if (s.id !== sponsorId) return s
      const existing = s.logos.findIndex(l => l.variant === variant)
      const newLogo = { id: `${sponsorId}-${variant}`, variant, url, file }
      if (existing >= 0) {
        const logos = [...s.logos]; logos[existing] = newLogo; return { ...s, logos }
      }
      return { ...s, logos: [...s.logos, newLogo] }
    }))
  }

  const addSponsor = () => {
    const newS: LocalSponsor = {
      id: `sp_${Date.now()}`, name: fName, tier: fTier, amount: fAmount,
      logos: [], bannerType: fBanner, tickerText: fTicker || `Proudly sponsored by ${fName}`,
      exposureMinutes: SPONSOR_TIERS[fTier].exposure, active: true,
      website: fWebsite, contactName: fContact, contactEmail: fEmail,
    }
    setSponsors(prev => [...prev, newS])
    setShowAddForm(false)
    setFName(''); setFAmount(500000); setFWebsite(''); setFContact(''); setFEmail('')
  }

  const removeSponsor = (id: string) => setSponsors(prev => prev.filter(s => s.id !== id))
  const toggleActive  = (id: string) => setSponsors(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Value', val: fmt(totalSponsorValue), color: C.gold },
          { label: 'Sponsors', val: sponsors.length.toString(), color: C.cyan },
          { label: 'Avg CPM', val: `₦${totalPlatformCPM.toLocaleString()}`, color: C.purple },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subscript preview */}
      <button onClick={() => setPreviewSubscript(v => !v)} style={{ width: '100%', padding: '10px', borderRadius: 10, background: C.card, border: `1px solid ${C.cyan}44`, color: C.cyan, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
        {previewSubscript ? '✕ Close Preview' : '📺 Preview Subscript Banners on Stream'}
      </button>

      {previewSubscript && (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          {/* fake video feed */}
          <div style={{ background: '#000', aspectRatio: '16/9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: 200 }}>
            <div style={{ color: '#555', fontSize: 12 }}>🎵 LIVE: {event.title}</div>
            {/* corner bug */}
            {sponsors.filter(s => s.bannerType === 'CORNER_BUG' && s.active)[0] && (
              <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.7)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                {sponsors.find(s => s.bannerType === 'CORNER_BUG' && s.active)?.logos[0]?.url
                  ? <img src={sponsors.find(s => s.bannerType === 'CORNER_BUG' && s.active)!.logos[0].url} style={{ height: 16, borderRadius: 2 }} alt="" />
                  : <span style={{ fontSize: 10 }}>🏢</span>}
                <span style={{ fontSize: 8, color: '#fff' }}>{sponsors.find(s => s.bannerType === 'CORNER_BUG' && s.active)?.name}</span>
              </div>
            )}
            {/* lower third */}
            {sponsors.filter(s => s.bannerType === 'LOWER_THIRD' && s.active)[0] && (
              <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.85),rgba(0,0,0,.4))', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                {sponsors.find(s => s.bannerType === 'LOWER_THIRD' && s.active)?.logos[0]?.url
                  ? <img src={sponsors.find(s => s.bannerType === 'LOWER_THIRD' && s.active)!.logos[0].url} style={{ height: 24, borderRadius: 3 }} alt="" />
                  : <div style={{ width: 36, height: 24, background: C.gold + '44', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🏢</div>}
                <div>
                  <div style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{sponsors.find(s => s.bannerType === 'LOWER_THIRD' && s.active)?.name}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,.6)' }}>Official {sponsors.find(s => s.bannerType === 'LOWER_THIRD' && s.active)?.tier} Sponsor</div>
                </div>
              </div>
            )}
            {/* ticker crawl */}
            {sponsors.filter(s => s.bannerType === 'TICKER' && s.active).length > 0 && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.85)', borderTop: `1px solid ${C.gold}44`, padding: '3px 0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 40, animation: 'tickerScroll 8s linear infinite', whiteSpace: 'nowrap', fontSize: 8, color: C.gold }}>
                  {sponsors.filter(s => s.bannerType === 'TICKER' && s.active).map(s => (
                    <span key={s.id}>🏢 {s.tickerText}</span>
                  ))}
                  {sponsors.filter(s => s.bannerType === 'TICKER' && s.active).map(s => (
                    <span key={s.id + '_dup'}>🏢 {s.tickerText}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <style>{`@keyframes tickerScroll{from{transform:translateX(100%)}to{transform:translateX(-100%)}}`}</style>
          <div style={{ background: C.card, padding: 10 }}>
            <div style={{ fontSize: 10, color: C.dim }}>
              Preview shows how sponsor banners appear on the live stream.
              Assign "Corner Bug" for persistent, "Lower Third" for intermittent, "Ticker" for continuous crawl.
            </div>
          </div>
        </div>
      )}

      {/* Add Sponsor */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Sponsors ({sponsors.length})</div>
        <button onClick={() => setShowAddForm(v => !v)} style={{ padding: '7px 14px', background: C.gold, color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Add Sponsor
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: C.card2, border: `1px solid ${C.gold}44`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 12 }}>New Sponsor</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Company / Brand name" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select value={fTier} onChange={e => setFTier(e.target.value as keyof typeof SPONSOR_TIERS)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}>
                {Object.entries(SPONSOR_TIERS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px' }}>
                <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>₦</span>
                <input type="number" value={fAmount} onChange={e => setFAmount(Number(e.target.value))} style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: 12, outline: 'none', padding: '9px 0' }} />
              </div>
            </div>
            <input value={fWebsite} onChange={e => setFWebsite(e.target.value)} placeholder="Website (optional)" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={fContact} onChange={e => setFContact(e.target.value)} placeholder="Contact name" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              <input value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="Contact email" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, marginTop: 4 }}>Subscript Banner Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {BANNER_TYPES.map(b => (
                <button key={b.id} onClick={() => setFBanner(b.id)} style={{ padding: '9px 8px', borderRadius: 8, border: `1px solid ${fBanner === b.id ? C.cyan : C.border}`, background: fBanner === b.id ? `${C.cyan}22` : 'transparent', color: fBanner === b.id ? C.cyan : C.dim, fontSize: 10, cursor: 'pointer', fontWeight: fBanner === b.id ? 700 : 400 }}>
                  {b.icon} {b.label}<br /><span style={{ fontSize: 8, opacity: 0.7 }}>{b.desc.slice(0, 36)}…</span>
                </button>
              ))}
            </div>
            <input value={fTicker} onChange={e => setFTicker(e.target.value)} placeholder={`Ticker text (default: "Proudly sponsored by ${fName || '…'}")`} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              <button onClick={addSponsor} disabled={!fName} style={{ padding: '11px 0', background: fName ? C.gold : C.border, color: fName ? '#000' : C.muted, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: fName ? 'pointer' : 'default' }}>Add Sponsor</button>
              <button onClick={() => setShowAddForm(false)} style={{ padding: '11px 0', background: C.border, color: C.dim, border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sponsor cards */}
      {sponsors.map(sp => {
        const tc = SPONSOR_TIERS[sp.tier as keyof typeof SPONSOR_TIERS] ?? SPONSOR_TIERS.BRONZE
        const isEditing = editId === sp.id
        return (
          <div key={sp.id} style={{ background: C.card, border: `1px solid ${sp.active ? tc.color + '44' : C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: tc.bg, border: `1px solid ${tc.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {sp.logos[0]?.url
                  ? <img src={sp.logos[0].url} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain' }} alt="" />
                  : tc.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{sp.name}</span>
                  <span style={{ fontSize: 9, color: tc.color, background: tc.bg, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{tc.emoji} {sp.tier}</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                  {fmt(sp.amount)} · {BANNER_TYPES.find(b => b.id === sp.bannerType)?.icon} {BANNER_TYPES.find(b => b.id === sp.bannerType)?.label} · {sp.exposureMinutes}min
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleActive(sp.id)} style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: sp.active ? `${C.green}22` : C.border, color: sp.active ? C.green : C.muted, fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>
                  {sp.active ? '● Live' : '○ Off'}
                </button>
                <button onClick={() => setEditId(isEditing ? null : sp.id)} style={{ padding: '5px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.dim, fontSize: 11, cursor: 'pointer' }}>
                  {isEditing ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Expanded: logo upload + banner config */}
            {isEditing && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px' }}>
                {/* Multi-logo upload */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.purpleL, marginBottom: 10 }}>📁 Logo Assets ({sp.logos.length}/{LOGO_VARIANTS.length} uploaded)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 14 }}>
                  {LOGO_VARIANTS.map(variant => {
                    const uploaded = sp.logos.find(l => l.variant === variant)
                    return (
                      <div key={variant} style={{ border: `1px dashed ${uploaded ? C.green : C.border}`, borderRadius: 8, padding: '10px', textAlign: 'center', background: uploaded ? `${C.green}08` : 'transparent', position: 'relative' }}>
                        {uploaded ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <img src={uploaded.url} alt="" style={{ height: 36, maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }} />
                            <div style={{ fontSize: 8, color: C.green, fontWeight: 700 }}>✓ {variant}</div>
                            <div style={{ fontSize: 8, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{uploaded.file?.name ?? 'uploaded'}</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>📤</div>
                            <div style={{ fontSize: 9, color: C.muted }}>{variant}</div>
                          </div>
                        )}
                        <input
                          ref={el => { fileRefs.current[`${sp.id}-${variant}`] = el }}
                          type="file"
                          accept="image/*"
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleLogoUpload(sp.id, variant, file)
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Banner type selector */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.purpleL, marginBottom: 8 }}>📺 Subscript Banner Type</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
                  {BANNER_TYPES.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSponsors(prev => prev.map(s => s.id === sp.id ? { ...s, bannerType: b.id, exposureMinutes: tc.exposure } : s))}
                      style={{ padding: '8px', borderRadius: 8, border: `1px solid ${sp.bannerType === b.id ? C.cyan : C.border}`, background: sp.bannerType === b.id ? `${C.cyan}22` : 'transparent', color: sp.bannerType === b.id ? C.cyan : C.dim, fontSize: 10, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ fontWeight: 700 }}>{b.icon} {b.label}</div>
                      <div style={{ fontSize: 8, opacity: 0.7, marginTop: 2 }}>{b.desc.slice(0, 48)}</div>
                    </button>
                  ))}
                </div>

                {/* Ticker text */}
                {sp.bannerType === 'TICKER' && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: C.dim, marginBottom: 4 }}>Ticker crawl text</div>
                    <input
                      value={sp.tickerText}
                      onChange={e => setSponsors(prev => prev.map(s => s.id === sp.id ? { ...s, tickerText: e.target.value } : s))}
                      style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                {/* Exposure time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>Screen Time (minutes)</div>
                    <div style={{ fontSize: 9, color: C.muted }}>Min for {sp.tier}: {tc.exposure}min</div>
                  </div>
                  <input
                    type="number" value={sp.exposureMinutes} min={tc.exposure}
                    onChange={e => setSponsors(prev => prev.map(s => s.id === sp.id ? { ...s, exposureMinutes: Number(e.target.value) } : s))}
                    style={{ width: 70, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', color: C.text, fontSize: 13, fontWeight: 700, outline: 'none', textAlign: 'center' }}
                  />
                </div>

                {/* CPM value calc */}
                <div style={{ background: `${C.purple}11`, border: `1px solid ${C.purple}33`, borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: C.dim }}>Est. impressions (5,000 viewers)</span>
                    <span style={{ color: C.purpleL, fontWeight: 700 }}>{(5000 * (sp.exposureMinutes / Math.max(totalExposure, 1))).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                    <span style={{ color: C.dim }}>CPM value</span>
                    <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(sp.amount / Math.max((5000 / 1000), 1))} per 1K</span>
                  </div>
                </div>

                <button onClick={() => removeSponsor(sp.id)} style={{ width: '100%', padding: '9px 0', background: `${C.red}22`, color: C.red, border: `1px solid ${C.red}44`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  🗑 Remove Sponsor
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Banner schedule */}
      {sponsors.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>📅 Subscript Banner Schedule</div>
          <div style={{ fontSize: 10, color: C.dim, marginBottom: 12 }}>Estimated on-screen schedule for a 4-hour event broadcast</div>
          {sponsors.filter(s => s.active).map((s, i) => {
            const pct = totalExposure > 0 ? (s.exposureMinutes / totalExposure) * 100 : 0
            const tc2 = SPONSOR_TIERS[s.tier as keyof typeof SPONSOR_TIERS] ?? SPONSOR_TIERS.BRONZE
            return (
              <div key={s.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s.logos[0]?.url ? <img src={s.logos[0].url} style={{ height: 16, borderRadius: 2 }} alt="" /> : <span style={{ fontSize: 14 }}>🏢</span>}
                    <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: 8, color: tc2.color }}>{BANNER_TYPES.find(b => b.id === s.bannerType)?.icon} {BANNER_TYPES.find(b => b.id === s.bannerType)?.label}</span>
                  </div>
                  <span style={{ fontSize: 10, color: C.dim }}>{s.exposureMinutes} min · {pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: 10, background: C.border, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: tc2.color, borderRadius: 5, transition: 'width .3s' }} />
                </div>
              </div>
            )
          })}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: C.dim }}>Total committed screen time</span>
            <span style={{ color: C.purpleL, fontWeight: 700 }}>{totalExposure} min</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STAFF TAB
// ─────────────────────────────────────────────────────────────────────────────
function StaffTab({ event }: { event: PlatformEvent }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [broadcast, setBroadcast] = useState('')
  const [sName, setSName] = useState(''); const [sRole, setSRole] = useState('GATE_STAFF'); const [sPhone, setSPhone] = useState('')
  const ROLES = ['EVENT_MANAGER', 'GATE_SUPERVISOR', 'GATE_STAFF', 'SECURITY_LEAD', 'SECURITY_OFFICER', 'VENDOR_COORD', 'VIP_HOST', 'BACKSTAGE_COORD', 'MEDIA_CREW', 'MEDICAL_STAFF']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Staff ({event.staff?.length ?? 0})</div>
          <button onClick={() => setShowAddForm(v => !v)} style={{ padding: '7px 14px', background: C.purple, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Staff</button>
        </div>
        {showAddForm && (
          <div style={{ background: C.bg, border: `1px solid ${C.purple}44`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={sName} onChange={e => setSName(e.target.value)} placeholder="Full name" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <select value={sRole} onChange={e => setSRole(e.target.value)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
              <input value={sPhone} onChange={e => setSPhone(e.target.value)} placeholder="Phone number" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button style={{ padding: '10px 0', background: C.purple, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setShowAddForm(false)}>Send Invite</button>
                <button onClick={() => setShowAddForm(false)} style={{ padding: '10px 0', background: C.border, color: C.dim, border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {event.staff?.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: C.bg, borderRadius: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${C.purple}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.name}</div><div style={{ fontSize: 9, color: C.muted }}>{s.role.replace(/_/g, ' ')} · {s.phone}</div></div>
            <div style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: s.status === 'CONFIRMED' ? `${C.green}22` : `${C.gold}22`, color: s.status === 'CONFIRMED' ? C.green : C.gold }}>{s.status}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>📢 Staff Broadcast</div>
        <textarea value={broadcast} onChange={e => setBroadcast(e.target.value)} placeholder="Message all staff…" rows={3} style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, fontSize: 12, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
        <button onClick={() => { if (broadcast.trim()) { setBroadcast(''); } }} style={{ marginTop: 10, width: '100%', padding: '10px 0', background: broadcast.trim() ? C.orange : C.border, color: broadcast.trim() ? '#000' : C.muted, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: broadcast.trim() ? 'pointer' : 'default' }}>📣 {broadcast.trim() ? 'Send Broadcast to All Staff' : 'Type a message above first'}</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. VENDORS TAB
// ─────────────────────────────────────────────────────────────────────────────
function VendorsTab({ event }: { event: PlatformEvent }) {
  const [showAdd, setShowAdd] = useState(false)
  const [vName, setVName] = useState(''); const [vCat, setVCat] = useState('FOOD'); const [vFee, setVFee] = useState(50000)
  const CATS = ['FOOD', 'DRINKS', 'MERCHANDISE', 'PARKING', 'SHUTTLE', 'PHOTOGRAPHY', 'DECORATION', 'EQUIPMENT', 'BEAUTY', 'OTHER']
  const totalBooth = event.vendors?.reduce((a, v) => a + v.boothFee, 0) ?? 0
  const totalGMV   = event.vendors?.reduce((a, v) => a + v.expectedRevenue, 0) ?? 0
  const totalCut   = event.vendors?.reduce((a, v) => a + v.platformCut, 0) ?? 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[{ label: 'Booth Fees', val: fmt(totalBooth), color: C.gold }, { label: 'Est GMV', val: fmt(totalGMV), color: C.green }, { label: 'Platform 10%', val: fmt(totalCut), color: C.purple }].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.val}</div><div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Vendors ({event.vendors?.length ?? 0})</div>
          <button onClick={() => setShowAdd(v => !v)} style={{ padding: '7px 14px', background: C.gold, color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Vendor</button>
        </div>
        {showAdd && (
          <div style={{ background: C.bg, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={vName} onChange={e => setVName(e.target.value)} placeholder="Business name" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select value={vCat} onChange={e => setVCat(e.target.value)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input type="number" value={vFee} onChange={e => setVFee(Number(e.target.value))} placeholder="Booth fee" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>Platform takes 10% of vendor sales. Booth fee is upfront.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button style={{ padding: '10px 0', background: C.gold, color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setShowAdd(false)}>Register</button>
                <button onClick={() => setShowAdd(false)} style={{ padding: '10px 0', background: C.border, color: C.dim, border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {event.vendors?.map(v => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px', background: C.bg, borderRadius: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: `${C.gold}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {v.category === 'FOOD' ? '🍲' : v.category === 'DRINKS' ? '🍹' : v.category === 'MERCHANDISE' ? '🛍' : v.category === 'PARKING' ? '🅿️' : '🏪'}
            </div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{v.name}</div><div style={{ fontSize: 9, color: C.muted }}>{v.category} · Booth: {fmt(v.boothFee)}</div></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: C.green }}>{fmt(v.expectedRevenue)}</div>
              <div style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: v.status === 'CONFIRMED' ? `${C.green}22` : `${C.gold}22`, color: v.status === 'CONFIRMED' ? C.green : C.gold }}>{v.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. STREAM TAB
// ─────────────────────────────────────────────────────────────────────────────
function StreamTab({ event }: { event: PlatformEvent }) {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(event.isStreaming)
  const [replayPrice, setReplayPrice] = useState('')
  const [showReplayInput, setShowReplayInput] = useState(false)
  const streamKey = `sk_${event.id}_live_2026`
  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val).then(() => { setCopied(label); setTimeout(() => setCopied(null), 1500) })
  }
  if (event.tierLevel !== 'ADVANCED') return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48 }}>📺</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.dim, marginTop: 12 }}>Livestreaming is an Advanced feature</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Upgrade your event tier to unlock Jollof TV broadcast</div>
    </div>
  )
  const streamTier = event.tiers.find(t => t.type === 'STREAM')
  const streamRev  = streamTier ? streamTier.price * (streamTier.sold ?? 0) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${streaming ? C.red : C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Stream Status</div>
            <div style={{ fontSize: 11, color: streaming ? C.red : C.muted, marginTop: 2 }}>{streaming ? '🔴 LIVE NOW' : '⭕ Offline · Push stream to go live'}</div>
          </div>
          <button onClick={() => setStreaming(s => !s)} style={{ padding: '9px 18px', background: streaming ? C.red : C.green, color: streaming ? '#fff' : '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {streaming ? '⏹ End Stream' : '▶ Go Live'}
          </button>
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>RTMP Configuration</div>
        {[{ label: 'RTMP URL', val: 'rtmp://stream.viewdicon.com/live' }, { label: 'Stream Key', val: streamKey }].map(f => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{f.label}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11, color: C.dim, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.label === 'Stream Key' ? '••••••••••••••••' : f.val}
              </div>
              <button onClick={() => copy(f.val, f.label)} style={{ padding: '8px 12px', background: C.purple, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                {copied === f.label ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Stream Tickets', val: (streamTier?.sold ?? 0).toString(), color: C.blue },
          { label: 'Stream Revenue', val: fmt(streamRev), color: C.green },
          { label: 'Peak Viewers', val: (event.streamViewerCount ?? 0).toString(), color: C.purple },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div><div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
          💡 Platform takes 10% of streaming ticket revenue.<br />
          Ads revenue: 60% you / 40% platform.<br />
          Replay tickets available 48h after stream ends.
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.purple}33`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.purpleL, marginBottom: 10 }}>📺 Jollof TV Broadcast</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => router.push('/dashboard/jollof/studio')} style={{ padding: '11px 0', background: C.purple, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📡 Push to Jollof TV</button>
          <button onClick={() => setShowReplayInput(v => !v)} style={{ padding: '11px 0', background: C.border, color: C.dim, border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>🎬 Set Replay Price</button>
        </div>
        {showReplayInput && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={replayPrice} onChange={e => setReplayPrice(e.target.value)} placeholder="Replay price in ₡" type="number" style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none' }} />
            <button onClick={() => setShowReplayInput(false)} style={{ padding: '8px 16px', background: C.gold, color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Set</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
type OrgTab = 'revenue' | 'tickets' | 'sponsors' | 'staff' | 'vendors' | 'stream'

const MOCK_EVENT: PlatformEvent = {
  id: 'evt_001', title: 'Afrobeats Night 2026', description: 'The biggest night in Lagos',
  tierLevel: 'ADVANCED', eventType: 'LARGE_CONCERT', status: 'PUBLISHED', coverEmoji: '🎵',
  organizerAfroId: 'organizer_001', villageId: 'arts', villageName: 'Arts Village',
  startDate: '2026-05-10T20:00:00Z', endDate: '2026-05-10T23:59:00Z',
  venueName: 'Eko Convention Centre', venueCoords: { lat: 6.4281, lng: 3.4219 }, capacity: 2000,
  tiers: [
    { id: 't1', name: 'General',   type: 'GENERAL',   price: 5000,  supply: 1200, sold: 980,  available: 220, perks: ['Stage access'], gateLayer: 'QR',   resaleAllowed: true },
    { id: 't2', name: 'VIP',       type: 'VIP',       price: 15000, supply: 500,  sold: 420,  available: 80,  perks: ['VIP lounge'],   gateLayer: 'NFC',  resaleAllowed: true },
    { id: 't3', name: 'Backstage', type: 'BACKSTAGE', price: 50000, supply: 50,   sold: 45,   available: 5,   perks: ['Artist meet'],  gateLayer: 'FACE', resaleAllowed: false },
    { id: 't4', name: 'Livestream',type: 'STREAM',    price: 1000,  supply: 10000,sold: 3200, available: 6800,perks: ['HD stream'],    gateLayer: 'QR',   resaleAllowed: false },
  ],
  staff: [
    { id: 's1', name: 'Emeka Obi',    role: 'EVENT_MANAGER',  afroId: 'emeka_001',  status: 'CONFIRMED', phone: '+234 803 000 0001' },
    { id: 's2', name: 'Ama Asante',   role: 'GATE_SUPERVISOR',afroId: 'ama_001',    status: 'CONFIRMED', phone: '+234 803 000 0002' },
    { id: 's3', name: 'Chidi Nwosu',  role: 'SECURITY_LEAD',  afroId: 'chidi_001',  status: 'PENDING',   phone: '+234 803 000 0003' },
    { id: 's4', name: 'Fatima Diallo',role: 'VENDOR_COORD',   afroId: 'fatima_001', status: 'CONFIRMED', phone: '+234 803 000 0004' },
  ],
  vendors: [
    { id: 'v1', name: 'Mama Titi Kitchen', category: 'FOOD',        boothFee: 50000, status: 'CONFIRMED', expectedRevenue: 500000, platformCut: 50000 },
    { id: 'v2', name: 'Lagos Merch Co',    category: 'MERCHANDISE',  boothFee: 30000, status: 'CONFIRMED', expectedRevenue: 300000, platformCut: 30000 },
    { id: 'v3', name: 'AfroBar Premium',   category: 'DRINKS',       boothFee: 80000, status: 'CONFIRMED', expectedRevenue: 800000, platformCut: 80000 },
    { id: 'v4', name: 'CoolPark Parking',  category: 'PARKING',      boothFee: 20000, status: 'PENDING',  expectedRevenue: 200000, platformCut: 20000 },
  ],
  sponsors: [
    { id: 'sp1', name: 'Dangote Group', tier: 'TITLE',  amount: 5000000 },
    { id: 'sp2', name: 'MTN Nigeria',   tier: 'GOLD',   amount: 2000000 },
    { id: 'sp3', name: 'Paystack',      tier: 'SILVER', amount: 1000000 },
    { id: 'sp4', name: 'Pepsi Nigeria', tier: 'BRONZE', amount: 300000  },
  ],
  escrowStatus: 'COLLECTING', escrowBalance: 12250000,
  streamUrl: 'rtmp://stream.viewdicon.com/live/evt_001', isStreaming: false, streamViewerCount: 0,
  revenue: {
    gross: 13720000, platformFees: 1372000, organizerNet: 12348000,
    vendorFees: 180000, sponsorships: 8300000, donations: 0, escrowHeld: 12250000, withdrawn: 0,
  },
  createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z',
}

export default function OrganizerPage() {
  const params  = useParams()
  const router  = useRouter()
  const eventId = params.eventId as string
  const [event, setEvent]   = useState<PlatformEvent | null>(USE_MOCKS ? MOCK_EVENT : null)
  const [tab, setTab]       = useState<OrgTab>('revenue')

  useEffect(() => {
    eventsApi.get(eventId)
      .then(res => { const r = res as unknown as { event: PlatformEvent }; if (r?.event) setEvent(r.event) })
      .catch((e) => logApiFailure('events/organizer/fetch', e))
  }, [eventId])

  if (!event) return null

  const tc   = TIER_CONFIG[event.tierLevel]
  const TABS: { id: OrgTab; label: string; icon: string; advOnly?: boolean }[] = [
    { id: 'revenue',  label: 'Revenue',  icon: '💰' },
    { id: 'tickets',  label: 'Tickets',  icon: '🎫' },
    { id: 'sponsors', label: 'Sponsors', icon: '🤝', advOnly: true },
    { id: 'staff',    label: 'Staff',    icon: '👥' },
    { id: 'vendors',  label: 'Vendors',  icon: '🏪' },
    { id: 'stream',   label: 'Stream',   icon: '📺', advOnly: true },
  ]
  const visibleTabs = TABS.filter(t => !t.advOnly || event.tierLevel === 'ADVANCED')

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Sora','Inter',sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: C.dim, fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{event.coverEmoji}</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <div style={{ fontSize: 10, color: tc.color, background: `${tc.color}22`, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{tc.emoji} {tc.label}</div>
              <div style={{ fontSize: 10, color: C.muted }}>Organizer Dashboard</div>
            </div>
          </div>
          <button onClick={() => router.push(`/dashboard/events/${eventId}/gate`)} style={{ padding: '7px 12px', background: C.red, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>🚪 Gate</button>
        </div>
      </div>

      {/* Event KPI strip */}
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '10px 0', background: C.card, borderBottom: `1px solid ${C.border}` }}>
        {[
          { label: 'Gross',  val: fmt(event.revenue?.gross ?? 0),         color: C.green  },
          { label: 'Net',    val: fmt(event.revenue?.organizerNet ?? 0),  color: C.purple },
          { label: 'Escrow', val: fmt(event.revenue?.escrowHeld ?? 0),    color: C.gold   },
          { label: 'Sold',   val: event.tiers.reduce((a, t) => a + (t.sold ?? 0), 0).toString(), color: C.blue },
          { label: 'Sponsors',val: fmt(event.sponsors?.reduce((a, s) => a + s.amount, 0) ?? 0), color: C.cyan },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ flex: 1, minWidth: 64, textAlign: 'center', padding: '0 8px', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 8, color: C.muted, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {visibleTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 13px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0, fontWeight: 600, fontSize: 11, background: tab === t.id ? C.purple : C.card, color: tab === t.id ? '#fff' : C.dim }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {tab === 'revenue'  && <RevenueTab event={event} />}
        {tab === 'tickets'  && <TicketsTab event={event} />}
        {tab === 'sponsors' && <SponsorsTab event={event} />}
        {tab === 'staff'    && <StaffTab event={event} />}
        {tab === 'vendors'  && <VendorsTab event={event} />}
        {tab === 'stream'   && <StreamTab event={event} />}
      </div>
    </div>
  )
}
