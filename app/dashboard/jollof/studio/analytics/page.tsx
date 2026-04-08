'use client'
// ═══════════════════════════════════════════════════════════════════════
// CREATOR STUDIO PRO ANALYTICS — Deep analytics for Jollof TV creators
// Revenue tracking across 7 sources, audience insights, content
// performance, Revenue Guarantee Pool, AI growth insights, milestones
// ═══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/* ── Inject-once CSS (prefix sa-) ── */
const CSS_ID = 'sa-analytics-css'
const CSS = `
@keyframes saFade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes saCountUp {
  from { opacity: 0; transform: scale(.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes saBarFill {
  from { width: 0; }
  to   { width: var(--w); }
}
@keyframes saSlide {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes saShimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes saGlow {
  0%,100% { box-shadow: 0 0 8px rgba(212,160,23,.25); }
  50%     { box-shadow: 0 0 20px rgba(212,160,23,.5); }
}
@keyframes saPulse {
  0%,100% { opacity: .6; }
  50%     { opacity: 1; }
}
.sa-fade   { animation: saFade .4s ease both; }
.sa-count  { animation: saCountUp .5s cubic-bezier(.4,0,.2,1) both; }
.sa-bar    { animation: saBarFill .8s cubic-bezier(.4,0,.2,1) both; }
.sa-slide  { animation: saSlide .4s ease both; }
.sa-shimmer {
  background: linear-gradient(90deg, rgba(212,160,23,.05) 25%, rgba(212,160,23,.15) 50%, rgba(212,160,23,.05) 75%);
  background-size: 200% 100%;
  animation: saShimmer 2s linear infinite;
}
.sa-glow   { animation: saGlow 2s ease-in-out infinite; }
.sa-pulse  { animation: saPulse 1.5s ease-in-out infinite; }
`

/* ── Theme ── */
const T = {
  bg: '#0d0804',
  surface: 'rgba(255,255,255,.04)',
  border: 'rgba(255,255,255,.08)',
  text: '#f0f7f0',
  dim: 'rgba(240,247,240,.5)',
  gold: '#d4a017',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  radius: 14,
  headFont: 'Sora, sans-serif',
  bodyFont: 'Inter, system-ui, sans-serif',
} as const

/* ── Currency helpers ── */
type Currency = 'COW' | 'USD' | 'NGN'
const RATES: Record<Currency, number> = { COW: 1, USD: 0.0012, NGN: 1.85 }
const SYMBOLS: Record<Currency, string> = { COW: '\u20A1', USD: '$', NGN: '\u20A6' }
function fmt(cowrie: number, cur: Currency): string {
  const v = cowrie * RATES[cur]
  return `${SYMBOLS[cur]}${v >= 1000 ? v.toLocaleString('en', { maximumFractionDigits: cur === 'USD' ? 2 : 0 }) : v.toFixed(cur === 'USD' ? 2 : 0)}`
}

/* ── Card wrapper ── */
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className }) => (
  <div className={className} style={{
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
    padding: 20, ...style,
  }}>{children}</div>
)

/* ── Section heading ── */
const SectionHead: React.FC<{ icon: string; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ fontFamily: T.headFont, fontSize: 20, fontWeight: 700, color: T.text, margin: 0 }}>
      {icon} {title}
    </h2>
    {sub && <p style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.dim, margin: '4px 0 0' }}>{sub}</p>}
  </div>
)

/* ── Revenue Source data (7 sources) ── */
const REVENUE_SOURCES = [
  { icon: '\uD83C\uDFAC', label: 'Streaming Views',        amount: 312000, pct: 36.8, trend: +4.2 },
  { icon: '\uD83D\uDED2', label: 'Marketplace Sales',       amount: 156000, pct: 18.4, trend: +2.1 },
  { icon: '\uD83D\uDCC8', label: 'Exchange Dividends',      amount: 134000, pct: 15.8, trend: -1.3 },
  { icon: '\uD83C\uDFAB', label: 'Premiere Tickets',        amount: 98000,  pct: 11.6, trend: +6.8 },
  { icon: '\uD83D\uDCB0', label: 'Subscriptions',           amount: 78000,  pct: 9.2,  trend: +1.9 },
  { icon: '\uD83C\uDF0D', label: 'Distribution Licensing',  amount: 45000,  pct: 5.3,  trend: +0.7 },
  { icon: '\uD83C\uDF81', label: 'Tips & Sprays',           amount: 24200,  pct: 2.9,  trend: +3.4 },
]

/* ── Content Performance data (8 items) ── */
const CONTENT_DATA = [
  { title: 'Lagos After Dark',       type: 'Film',        views: 184200, revenue: 98400,  engagement: 94, status: 'Live' as const },
  { title: 'Jollof Wars S2E4',       type: 'Series',      views: 127800, revenue: 67200,  engagement: 91, status: 'Live' as const },
  { title: 'Accra to Nairobi',       type: 'Documentary', views: 98400,  revenue: 52100,  engagement: 87, status: 'Live' as const },
  { title: 'Afrobeats Origin Story', type: 'Music Doc',   views: 76500,  revenue: 41800,  engagement: 85, status: 'Live' as const },
  { title: 'Village Chronicles',     type: 'Reality',     views: 65200,  revenue: 34500,  engagement: 82, status: 'Live' as const },
  { title: 'Compound Cooking',       type: 'Lifestyle',   views: 52100,  revenue: 28900,  engagement: 79, status: 'Live' as const },
  { title: 'Pan-African Beats',      type: 'Music',       views: 41300,  revenue: 22600,  engagement: 76, status: 'Premiere' as const },
  { title: 'Heritage Untold',        type: 'Documentary', views: 0,      revenue: 0,      engagement: 0,  status: 'Draft' as const },
]

/* ── Geo heatmap — 20 African countries ── */
const GEO_COUNTRIES = [
  { code: 'NG', flag: '\uD83C\uDDF3\uD83C\uDDEC', name: 'Nigeria',       pct: 42,   viewers: 89200 },
  { code: 'GH', flag: '\uD83C\uDDEC\uD83C\uDDED', name: 'Ghana',          pct: 18,   viewers: 38200 },
  { code: 'KE', flag: '\uD83C\uDDF0\uD83C\uDDEA', name: 'Kenya',          pct: 12,   viewers: 25500 },
  { code: 'ZA', flag: '\uD83C\uDDFF\uD83C\uDDE6', name: 'South Africa',   pct: 9,    viewers: 19100 },
  { code: 'SN', flag: '\uD83C\uDDF8\uD83C\uDDF3', name: 'Senegal',        pct: 6,    viewers: 12700 },
  { code: 'TZ', flag: '\uD83C\uDDF9\uD83C\uDDFF', name: 'Tanzania',       pct: 3,    viewers: 6400 },
  { code: 'ET', flag: '\uD83C\uDDEA\uD83C\uDDF9', name: 'Ethiopia',       pct: 2.5,  viewers: 5300 },
  { code: 'CI', flag: '\uD83C\uDDE8\uD83C\uDDEE', name: "Cote d'Ivoire",  pct: 1.8,  viewers: 3800 },
  { code: 'CM', flag: '\uD83C\uDDE8\uD83C\uDDF2', name: 'Cameroon',       pct: 1.5,  viewers: 3200 },
  { code: 'RW', flag: '\uD83C\uDDF7\uD83C\uDDFC', name: 'Rwanda',         pct: 1.2,  viewers: 2500 },
  { code: 'UG', flag: '\uD83C\uDDFA\uD83C\uDDEC', name: 'Uganda',         pct: 0.8,  viewers: 1700 },
  { code: 'EG', flag: '\uD83C\uDDEA\uD83C\uDDEC', name: 'Egypt',          pct: 0.5,  viewers: 1100 },
  { code: 'MA', flag: '\uD83C\uDDF2\uD83C\uDDE6', name: 'Morocco',        pct: 0.4,  viewers: 850 },
  { code: 'ML', flag: '\uD83C\uDDF2\uD83C\uDDF1', name: 'Mali',           pct: 0.3,  viewers: 640 },
  { code: 'BF', flag: '\uD83C\uDDE7\uD83C\uDDEB', name: 'Burkina Faso',   pct: 0.2,  viewers: 420 },
  { code: 'NE', flag: '\uD83C\uDDF3\uD83C\uDDEA', name: 'Niger',          pct: 0.2,  viewers: 400 },
  { code: 'CD', flag: '\uD83C\uDDE8\uD83C\uDDE9', name: 'DR Congo',       pct: 0.2,  viewers: 380 },
  { code: 'MZ', flag: '\uD83C\uDDF2\uD83C\uDDFF', name: 'Mozambique',     pct: 0.15, viewers: 320 },
  { code: 'AO', flag: '\uD83C\uDDE6\uD83C\uDDF4', name: 'Angola',         pct: 0.1,  viewers: 210 },
  { code: 'GM', flag: '\uD83C\uDDEC\uD83C\uDDF2', name: 'Gambia',         pct: 0.05, viewers: 100 },
]

/* ── Demographics ── */
const AGE_BRACKETS = [
  { label: '18-24', pct: 35, color: '#22d3ee' },
  { label: '25-34', pct: 40, color: '#d4a017' },
  { label: '35-44', pct: 15, color: '#a78bfa' },
  { label: '45+',   pct: 10, color: '#f97316' },
]

const DEVICE_SPLIT = [
  { label: 'Mobile',         pct: 72, icon: '\uD83D\uDCF1', color: '#22c55e' },
  { label: 'Desktop',        pct: 18, icon: '\uD83D\uDCBB', color: '#3b82f6' },
  { label: 'Village Screen', pct: 7,  icon: '\uD83D\uDCFA', color: '#fbbf24' },
  { label: 'Smart TV',       pct: 3,  icon: '\uD83D\uDDA5',  color: '#c084fc' },
]

/* ── Peak hours (0-23, intensity 0-100) ── */
const PEAK_HOURS = [
  5, 3, 2, 1, 1, 2, 8, 15, 22, 18, 14, 12,
  16, 20, 25, 30, 38, 55, 78, 95, 100, 88, 60, 25,
]

/* ── Payout history (10 entries) ── */
const PAYOUTS = [
  { date: 'Apr 3, 2026',  amount: 12400, source: 'Streaming',     status: 'paid' as const },
  { date: 'Mar 27, 2026', amount: 8900,  source: 'Marketplace',   status: 'paid' as const },
  { date: 'Mar 20, 2026', amount: 15200, source: 'Mixed',         status: 'paid' as const },
  { date: 'Mar 13, 2026', amount: 6700,  source: 'Subscriptions', status: 'paid' as const },
  { date: 'Mar 6, 2026',  amount: 11300, source: 'Streaming',     status: 'paid' as const },
  { date: 'Feb 27, 2026', amount: 9800,  source: 'Premiere',      status: 'paid' as const },
  { date: 'Feb 20, 2026', amount: 7400,  source: 'Licensing',     status: 'paid' as const },
  { date: 'Apr 10, 2026', amount: 12400, source: 'Mixed',         status: 'scheduled' as const },
  { date: 'Apr 7, 2026',  amount: 4850,  source: 'Tips & Spray',  status: 'processing' as const },
  { date: 'Apr 17, 2026', amount: 14200, source: 'Streaming',     status: 'scheduled' as const },
]

/* ── Milestones ── */
const MILESTONES = [
  { title: 'First \u20A1100K',       icon: '\uD83D\uDCB0', desc: 'Earned \u20A1100,000 lifetime revenue',           done: true,  progress: 100 },
  { title: '10K Subscribers',         icon: '\uD83D\uDC65', desc: 'Reached 10,000 channel subscribers',              done: true,  progress: 100 },
  { title: 'Pan-African Reach',       icon: '\uD83C\uDF0D', desc: 'Viewers from 5+ African countries',               done: true,  progress: 100 },
  { title: 'Culture Badge',           icon: '\uD83C\uDFC6', desc: 'Cultural Guardian certification earned',          done: true,  progress: 100 },
  { title: 'IPO Graduate',            icon: '\uD83D\uDCC8', desc: 'Content valued at \u20A11,000,000+ on exchange',  done: false, progress: 72 },
]

/* ── AI Insights from Amaterasu ── */
const AI_INSIGHTS = [
  { text: 'Your Yoruba-language content gets 3.2x more engagement than English. Consider more Yoruba projects.', icon: '\uD83D\uDDE3' },
  { text: 'Peak upload time for your audience: Thursdays at 7 PM WAT', icon: '\u23F0' },
  { text: "Collaboration opportunity: Chef Amara's cooking content has 40% audience overlap with yours", icon: '\uD83E\uDD1D' },
  { text: 'Your premiere conversion rate (ticket purchases) is 28% \u2014 above platform average of 19%', icon: '\uD83C\uDFAB' },
]

/* ── Revenue Guarantee Pool eligibility ── */
const ELIGIBILITY = [
  { label: '100+ uploads',                              met: true },
  { label: '10,000+ total views',                       met: true },
  { label: 'Cultural Guardian certification or higher',  met: true },
  { label: '6+ months continuous activity',              met: false },
  { label: 'No community strikes',                      met: false },
]

/* ── Returning viewers funnel ── */
const FUNNEL_STEPS = [
  { label: 'First Visit',        pct: 100, count: '212,400' },
  { label: 'Watched 1+ min',     pct: 82,  count: '174,200' },
  { label: 'Completed Content',  pct: 58,  count: '123,200' },
  { label: 'Returned (7 days)',  pct: 67,  count: '82,500' },
  { label: 'Subscribed',         pct: 34,  count: '41,800' },
]

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function StudioAnalyticsPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [currency, setCurrency] = React.useState<Currency>('COW')
  const [sortCol, setSortCol] = React.useState<string>('revenue')
  const [sortAsc, setSortAsc] = React.useState(false)
  const [griotQ, setGriotQ] = React.useState('')
  const [griotAnswer, setGriotAnswer] = React.useState('')

  /* inject CSS once */
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById(CSS_ID)) {
      const s = document.createElement('style')
      s.id = CSS_ID
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  /* sorted content */
  const sortedContent = React.useMemo(() => {
    const arr = [...CONTENT_DATA]
    arr.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortCol] ?? 0
      const bv = (b as Record<string, unknown>)[sortCol] ?? 0
      if (typeof av === 'string' && typeof bv === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return arr
  }, [sortCol, sortAsc])

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(false) }
  }

  const sortArrow = (col: string) => sortCol === col ? (sortAsc ? ' \u25B2' : ' \u25BC') : ''

  const handleGriotAsk = () => {
    if (!griotQ.trim()) return
    setGriotAnswer(`Amaterasu is analyzing: "${griotQ}"... In full deployment this queries /api/v1/ai/gods/query with godId=amaterasu.`)
    setGriotQ('')
  }

  /* ── StatPill sub-component ── */
  const StatPill: React.FC<{ label: string; value: number; change?: number }> = ({ label, value, change }) => (
    <div className="sa-count" style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '14px 18px', flex: '1 1 140px', minWidth: 140,
    }}>
      <div style={{ fontFamily: T.bodyFont, fontSize: 12, color: T.dim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.headFont, fontSize: 22, fontWeight: 700, color: T.gold }}>
        {fmt(value, currency)}
      </div>
      {change !== undefined && (
        <div style={{ fontSize: 12, color: change >= 0 ? T.green : T.red, marginTop: 2 }}>
          {change >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(change)}% from last period
        </div>
      )}
    </div>
  )

  /* ── HBar sub-component ── */
  const HBar: React.FC<{ pct: number; color: string; label: string; sub?: string; delay?: number }> = ({ pct, color, label, sub, delay = 0 }) => (
    <div className="sa-slide" style={{ marginBottom: 10, animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
        <span style={{ color: T.text }}>{label}</span>
        <span style={{ color: T.dim }}>{sub || `${pct}%`}</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,.06)' }}>
        <div className="sa-bar" style={{ '--w': `${pct}%`, height: '100%', borderRadius: 5, background: color } as React.CSSProperties} />
      </div>
    </div>
  )

  /* ── Payout status badge helpers ── */
  const statusBadge = (status: 'paid' | 'processing' | 'scheduled') => {
    const map = {
      paid:       { bg: 'rgba(34,197,94,.12)',  color: T.green, label: '\u2705 Paid' },
      processing: { bg: 'rgba(59,130,246,.12)', color: T.blue,  label: '\u23F3 Processing' },
      scheduled:  { bg: 'rgba(255,255,255,.06)', color: T.dim,  label: '\uD83D\uDCC5 Scheduled' },
    }
    const m = map[status]
    return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
        background: m.bg, color: m.color,
      }}>{m.label}</span>
    )
  }

  return (
    <div style={{
      minHeight: '100dvh', background: T.bg, color: T.text,
      fontFamily: T.bodyFont, paddingBottom: 100,
    }}>
      {/* ── Header ── */}
      <div className="sa-fade" style={{
        padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: T.text, fontSize: 22, cursor: 'pointer', padding: 4,
        }}>{'\u2190'}</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: T.headFont, fontSize: 22, fontWeight: 700, margin: 0 }}>
            Creator Studio Analytics
          </h1>
          <p style={{ fontSize: 13, color: T.dim, margin: '2px 0 0' }}>
            Pro analytics for {user?.displayName || 'Creator'}
          </p>
        </div>
        {/* Currency toggle */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
          display: 'flex', overflow: 'hidden',
        }}>
          {(['COW', 'USD', 'NGN'] as Currency[]).map((c) => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              background: currency === c ? T.gold : 'transparent',
              color: currency === c ? '#000' : T.dim,
              border: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all .2s',
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ===================================================================
            1. REVENUE HERO
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28 }}>
          <SectionHead icon={'\uD83D\uDC8E'} title="Revenue Overview" sub="Lifetime creator earnings" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <StatPill label="Lifetime" value={847200} />
            <StatPill label="This Month" value={124500} change={18} />
            <StatPill label="This Week" value={31200} change={7.4} />
            <StatPill label="Today" value={4850} change={12.3} />
          </div>
        </section>

        {/* ===================================================================
            2. REVENUE BY SOURCE (7 sources)
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28, animationDelay: '100ms' }}>
          <SectionHead icon={'\uD83D\uDCCA'} title="Revenue by Source" sub="Breakdown across 7 income streams" />
          <Card>
            {REVENUE_SOURCES.map((s, i) => (
              <div key={s.label} className="sa-slide" style={{ marginBottom: i < REVENUE_SOURCES.length - 1 ? 14 : 0, animationDelay: `${i * 60}ms` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{s.icon} {s.label}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.gold }}>{fmt(s.amount, currency)}</span>
                    <span style={{ fontSize: 11, color: s.trend >= 0 ? T.green : T.red }}>
                      {s.trend >= 0 ? '\u25B2' : '\u25BC'}{Math.abs(s.trend)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.06)' }}>
                  <div className="sa-bar" style={{
                    '--w': `${s.pct}%`, height: '100%', borderRadius: 4,
                    background: `linear-gradient(90deg, ${T.gold}, rgba(212,160,23,.5))`,
                  } as React.CSSProperties} />
                </div>
                <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{s.pct}% of total</div>
              </div>
            ))}
          </Card>
        </section>

        {/* ===================================================================
            3. CONTENT PERFORMANCE TABLE
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28, animationDelay: '200ms' }}>
          <SectionHead icon={'\uD83C\uDFAC'} title="Content Performance" sub="Sortable breakdown of all your content" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: T.bodyFont }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {[
                      { key: 'title', label: 'Content' },
                      { key: 'type', label: 'Type' },
                      { key: 'views', label: 'Views' },
                      { key: 'revenue', label: 'Revenue' },
                      { key: 'engagement', label: 'Engage %' },
                      { key: 'status', label: 'Status' },
                    ].map((col) => (
                      <th key={col.key} onClick={() => toggleSort(col.key)} style={{
                        padding: '12px 10px', textAlign: 'left', color: T.dim, fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
                        background: sortCol === col.key ? 'rgba(212,160,23,.06)' : 'transparent',
                      }}>
                        {col.label}{sortArrow(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedContent.map((c, i) => (
                    <tr key={c.title} className="sa-slide" style={{
                      borderBottom: `1px solid ${T.border}`, animationDelay: `${i * 40}ms`,
                    }}>
                      <td style={{ padding: '10px', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: 'rgba(212,160,23,.12)', color: T.gold, borderRadius: 6,
                          padding: '2px 8px', fontSize: 11, fontWeight: 600,
                        }}>{c.type}</span>
                      </td>
                      <td style={{ padding: '10px', fontVariantNumeric: 'tabular-nums' }}>
                        {c.views > 0 ? c.views.toLocaleString() : '\u2014'}
                      </td>
                      <td style={{ padding: '10px', color: T.gold, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {c.revenue > 0 ? fmt(c.revenue, currency) : '\u2014'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {c.engagement > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 48, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)' }}>
                              <div style={{ width: `${c.engagement}%`, height: '100%', borderRadius: 3, background: c.engagement > 85 ? T.green : c.engagement > 70 ? T.gold : T.red }} />
                            </div>
                            <span style={{ fontSize: 11, color: T.dim }}>{c.engagement}%</span>
                          </div>
                        ) : '\u2014'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                          background: c.status === 'Live' ? 'rgba(34,197,94,.15)' : c.status === 'Premiere' ? 'rgba(212,160,23,.15)' : 'rgba(255,255,255,.06)',
                          color: c.status === 'Live' ? T.green : c.status === 'Premiere' ? T.gold : T.dim,
                        }}>{c.status === 'Live' && '\u25CF '}{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ===================================================================
            4. AUDIENCE ANALYTICS
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28, animationDelay: '300ms' }}>
          <SectionHead icon={'\uD83D\uDC65'} title="Audience Analytics" sub="Who watches, where, and when" />

          {/* 4a. Geo Heatmap — 20 African countries */}
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: T.gold }}>
              {'\uD83C\uDF0D'} Geographic Heatmap {'\u2014'} 20 African Markets
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
              {GEO_COUNTRIES.map((c, i) => {
                const intensity = Math.min(c.pct / 42, 1)
                return (
                  <div key={c.code} className="sa-slide" style={{
                    animationDelay: `${i * 30}ms`,
                    background: `rgba(212,160,23,${(0.04 + intensity * 0.2).toFixed(3)})`,
                    border: `1px solid rgba(212,160,23,${(0.08 + intensity * 0.3).toFixed(3)})`,
                    borderRadius: 8, padding: '8px 10px',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{c.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: T.dim }}>{c.pct}% {'\u00B7'} {c.viewers.toLocaleString()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 4b. Demographics + Device split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Age Demographics</div>
              {AGE_BRACKETS.map((a, i) => (
                <HBar key={a.label} pct={a.pct} color={a.color} label={a.label} delay={i * 80} />
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Device Split</div>
              {DEVICE_SPLIT.map((d, i) => (
                <HBar key={d.label} pct={d.pct} color={d.color} label={`${d.icon} ${d.label}`} delay={i * 80} />
              ))}
            </Card>
          </div>

          {/* 4c. Peak Hours — 24-hour strip */}
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Peak Viewing Hours (WAT)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 70 }}>
              {PEAK_HOURS.map((v, h) => (
                <div key={h} title={`${h.toString().padStart(2, '0')}:00 \u2014 ${v}% activity`} style={{
                  flex: 1, borderRadius: '3px 3px 0 0',
                  height: `${Math.max(v, 3)}%`,
                  background: v >= 80 ? T.gold : v >= 50 ? 'rgba(212,160,23,.5)' : 'rgba(255,255,255,.12)',
                  transition: 'height .4s ease',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.dim, marginTop: 4 }}>
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
            </div>
            <div style={{ fontSize: 11, color: T.dim, marginTop: 6, textAlign: 'center' }}>
              Peak: <span style={{ color: T.gold, fontWeight: 600 }}>19:00 - 22:00 WAT</span>
            </div>
          </Card>

          {/* 4d. Returning Viewers Funnel */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Returning Viewers Funnel</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {FUNNEL_STEPS.map((step, i) => (
                <div key={step.label} className="sa-slide" style={{ animationDelay: `${i * 60}ms` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                    <span>{step.label}</span>
                    <span style={{ color: T.dim }}>{step.count} ({step.pct}%)</span>
                  </div>
                  <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,.04)', overflow: 'hidden' }}>
                    <div className="sa-bar" style={{
                      '--w': `${step.pct}%`, height: '100%', borderRadius: 7,
                      background: `linear-gradient(90deg, ${T.gold}, rgba(212,160,23,${(0.3 + (step.pct / 200)).toFixed(2)}))`,
                    } as React.CSSProperties} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 10, textAlign: 'center', fontSize: 13, fontWeight: 600, color: T.green,
            }}>
              67% retention rate
            </div>
          </Card>
        </section>

        {/* ===================================================================
            5. REVENUE GUARANTEE POOL
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28, animationDelay: '400ms' }}>
          <SectionHead icon={'\uD83D\uDEE1'} title="Revenue Guarantee Pool" sub="Insurance layer for top creators" />
          <Card className="sa-glow">
            {/* Pool stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{
                background: 'rgba(212,160,23,.08)', borderRadius: 10, padding: 14, textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, color: T.dim, marginBottom: 4 }}>Pool Balance</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: T.gold, fontFamily: T.headFont }}>
                  {fmt(2400000, currency)}
                </div>
                <div style={{ fontSize: 11, color: T.dim }}>from 2% platform fee</div>
              </div>
              <div style={{
                background: 'rgba(34,197,94,.08)', borderRadius: 10, padding: 14, textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, color: T.dim, marginBottom: 4 }}>Your Guaranteed Min.</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: T.green, fontFamily: T.headFont }}>
                  {fmt(15000, currency)}<span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span>
                </div>
                <div style={{ fontSize: 11, color: T.dim }}>if all criteria met</div>
              </div>
            </div>

            {/* Eligibility checklist */}
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Eligibility Checklist</div>
            {ELIGIBILITY.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: e.met ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)',
                  color: e.met ? T.green : T.dim, fontSize: 14, fontWeight: 700,
                }}>{e.met ? '\u2713' : ' '}</span>
                <span style={{ color: e.met ? T.text : T.dim }}>{e.label}</span>
              </div>
            ))}

            {/* Explainer */}
            <div style={{
              marginTop: 14, padding: 12, borderRadius: 10,
              background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.15)',
              fontSize: 12, color: T.dim, lineHeight: 1.5,
            }}>
              <strong style={{ color: T.gold }}>How it works:</strong> Top creators are guaranteed minimum monthly revenue from the community pool, funded by 2% of all platform transactions. If your monthly earnings fall below the guaranteed minimum, the pool automatically tops up the difference.
            </div>

            {/* CTA */}
            <button style={{
              marginTop: 14, width: '100%', padding: '14px 0',
              background: `linear-gradient(135deg, ${T.gold}, #b8860b)`,
              color: '#000', fontWeight: 700, fontSize: 15, fontFamily: T.headFont,
              border: 'none', borderRadius: 10, cursor: 'pointer',
              opacity: ELIGIBILITY.every(e => e.met) ? 1 : 0.5,
            }}>
              {ELIGIBILITY.every(e => e.met) ? 'Apply to Revenue Pool' : 'Complete All Criteria to Apply'}
            </button>
          </Card>
        </section>

        {/* ===================================================================
            6. AI GROWTH INSIGHTS (Griot Intelligence / Amaterasu)
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28, animationDelay: '500ms' }}>
          <SectionHead icon={'\u2600\uFE0F'} title="AI Growth Insights" sub="Powered by Amaterasu \u2014 Griot Intelligence" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {AI_INSIGHTS.map((ins, i) => (
              <Card key={i} className="sa-slide" style={{ animationDelay: `${i * 80}ms`, padding: 14 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{ins.icon}</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: T.text, margin: 0 }}>{ins.text}</p>
              </Card>
            ))}
          </div>

          {/* Ask Amaterasu input */}
          <Card style={{ display: 'flex', gap: 8, padding: 10 }}>
            <input
              value={griotQ}
              onChange={(e) => setGriotQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGriotAsk()}
              placeholder="Ask Amaterasu anything about your content..."
              style={{
                flex: 1, background: 'rgba(255,255,255,.06)', border: `1px solid ${T.border}`,
                borderRadius: 8, padding: '10px 14px', color: T.text, fontSize: 13,
                fontFamily: T.bodyFont, outline: 'none',
              }}
            />
            <button onClick={handleGriotAsk} style={{
              background: T.gold, color: '#000', fontWeight: 700, fontSize: 13,
              border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer',
              fontFamily: T.headFont,
            }}>Ask</button>
          </Card>
          {griotAnswer && (
            <Card className="sa-fade" style={{ marginTop: 10, borderColor: 'rgba(212,160,23,.2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }}>{'\u2600\uFE0F'}</span>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, color: T.text }}>{griotAnswer}</p>
              </div>
            </Card>
          )}
        </section>

        {/* ===================================================================
            7. PAYOUT HISTORY
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28, animationDelay: '600ms' }}>
          <SectionHead icon={'\uD83D\uDCB3'} title="Payout History" sub="All payouts and scheduled distributions" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: T.bodyFont }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: T.dim, fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: T.dim, fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: T.dim, fontWeight: 600 }}>Source</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', color: T.dim, fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...PAYOUTS].sort((a, b) => {
                    const order: Record<string, number> = { processing: 0, scheduled: 1, paid: 2 }
                    return order[a.status] - order[b.status]
                  }).map((p, i) => (
                    <tr key={i} className="sa-slide" style={{
                      borderBottom: `1px solid ${T.border}`, animationDelay: `${i * 40}ms`,
                    }}>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{p.date}</td>
                      <td style={{ padding: '10px', color: T.gold, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(p.amount, currency)}
                      </td>
                      <td style={{ padding: '10px' }}>{p.source}</td>
                      <td style={{ padding: '10px' }}>{statusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Next payout + manual request */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Card style={{ flex: 1, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: T.dim, marginBottom: 4 }}>Next Scheduled Payout</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.gold, fontFamily: T.headFont }}>April 10, 2026</div>
              <div style={{ fontSize: 13, color: T.green, marginTop: 2 }}>{fmt(12400, currency)}</div>
            </Card>
            <button style={{
              flex: 1, background: T.surface, border: `1px solid ${T.gold}`,
              borderRadius: T.radius, color: T.gold, fontSize: 14, fontWeight: 600,
              fontFamily: T.headFont, cursor: 'pointer', padding: 14,
            }}>
              Request Manual Payout
            </button>
          </div>
        </section>

        {/* ===================================================================
            8. MILESTONES
            =================================================================== */}
        <section className="sa-fade" style={{ marginBottom: 28, animationDelay: '700ms' }}>
          <SectionHead icon={'\uD83C\uDFC5'} title="Milestones" sub="Your creator journey achievements" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MILESTONES.map((m, i) => (
              <Card key={m.title} className="sa-slide" style={{
                animationDelay: `${i * 80}ms`, padding: 14,
                borderColor: m.done ? 'rgba(212,160,23,.2)' : T.border,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: m.done ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    border: m.done ? '1px solid rgba(212,160,23,.3)' : `1px solid ${T.border}`,
                  }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: m.done ? T.gold : T.text }}>{m.title}</span>
                      {m.done && <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Achieved</span>}
                    </div>
                    <div style={{ fontSize: 12, color: T.dim, marginBottom: 6 }}>{m.desc}</div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)' }}>
                      <div className="sa-bar" style={{
                        '--w': `${m.progress}%`, height: '100%', borderRadius: 3,
                        background: m.done
                          ? `linear-gradient(90deg, ${T.gold}, #b8860b)`
                          : `linear-gradient(90deg, ${T.blue}, rgba(59,130,246,.4))`,
                      } as React.CSSProperties} />
                    </div>
                    {!m.done && (
                      <div style={{ fontSize: 11, color: T.dim, marginTop: 3 }}>{m.progress}% complete</div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Next milestone spotlight */}
          <Card className="sa-shimmer" style={{ marginTop: 12, textAlign: 'center', padding: 18 }}>
            <div style={{ fontSize: 13, color: T.dim, marginBottom: 4 }}>Next Milestone</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: T.headFont, color: T.gold }}>
              {'\uD83D\uDCC8'} IPO Graduate
            </div>
            <div style={{ fontSize: 12, color: T.dim, margin: '4px 0 10px' }}>
              Content valued at {'\u20A1'}1,000,000+ on exchange
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <div style={{ width: 120, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.06)' }}>
                <div className="sa-bar" style={{
                  '--w': '72%', height: '100%', borderRadius: 4,
                  background: `linear-gradient(90deg, ${T.blue}, ${T.gold})`,
                } as React.CSSProperties} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.gold }}>72%</span>
            </div>
            <div style={{ fontSize: 11, color: T.dim, marginTop: 6 }}>
              Current valuation: {'\u20A1'}720,000 / {'\u20A1'}1,000,000
            </div>
          </Card>
        </section>

      </div>
    </div>
  )
}
