'use client'
// ═══════════════════════════════════════════════════════════════════════════
// FAN ECONOMY HUB — Streaming-as-Equity + Fan Ownership Economy
// Viewers become micro-investors in African content
// Tabs: Discover | My Portfolio | Governance
// ═══════════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/* ── inject-once CSS ── */
const CSS_ID = 'fan-invest-css'
const CSS = `
@keyframes fiFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fiPulse{0%,100%{opacity:.6;transform:scale(.9)}50%{opacity:1;transform:scale(1.05)}}
@keyframes fiSlideIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fiShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes fiGlow{0%,100%{box-shadow:0 0 8px rgba(212,160,23,.2)}50%{box-shadow:0 0 20px rgba(212,160,23,.5)}}
@keyframes fiBarFill{from{width:0}to{width:var(--target)}}
@keyframes fiCoinDrop{0%{opacity:1;transform:translateY(0) scale(1)}60%{opacity:.8;transform:translateY(-60px) scale(1.2)}100%{opacity:0;transform:translateY(-120px) scale(.5)}}
@keyframes fiPillSlide{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
.fi-fade{animation:fiFade .35s ease both}
.fi-slide-in{animation:fiSlideIn .4s ease both}
.fi-glow{animation:fiGlow 2s ease-in-out infinite}
.fi-pill{animation:fiPillSlide .25s ease both}
.fi-bar-fill{animation:fiBarFill .8s ease both}
.fi-shimmer{background:linear-gradient(90deg,rgba(212,160,23,.05) 25%,rgba(212,160,23,.15) 50%,rgba(212,160,23,.05) 75%);background-size:200% 100%;animation:fiShimmer 2s linear infinite}
.fi-coin{animation:fiCoinDrop 1.6s ease-out forwards;position:absolute;pointer-events:none;font-size:18px}
`

function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
const S = { font: 'DM Sans, sans-serif', head: 'Sora, sans-serif' }

function Card({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,.04)', borderRadius: 14, padding: 16,
      border: '1px solid rgba(255,255,255,.08)',
      cursor: onClick ? 'pointer' : undefined, ...style,
    }}>{children}</div>
  )
}

function Btn({ label, onClick, variant = 'ghost', disabled, style }: {
  label: string; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger' | 'gold'; disabled?: boolean; style?: React.CSSProperties
}) {
  const bg = variant === 'primary' ? '#18a05e' : variant === 'danger' ? '#c94040'
    : variant === 'gold' ? '#d4a017' : 'rgba(255,255,255,.08)'
  const clr = variant === 'gold' ? '#0d0804' : '#fff'
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '8px 18px', borderRadius: 10, border: 'none',
      background: disabled ? 'rgba(255,255,255,.04)' : bg,
      color: disabled ? 'rgba(255,255,255,.25)' : clr,
      fontSize: 13, fontWeight: 700, fontFamily: S.font,
      cursor: disabled ? 'not-allowed' : 'pointer', ...style,
    }}>{label}</button>
  )
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="fi-pill" style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      background: bg, color, fontSize: 10, fontWeight: 700, fontFamily: S.font,
    }}>{label}</span>
  )
}

function ProgressBar({ pct, color = '#d4a017', height = 6 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ width: '100%', background: 'rgba(255,255,255,.06)', borderRadius: height, height, overflow: 'hidden' }}>
      <div className="fi-bar-fill" style={{
        '--target': `${Math.min(pct, 100)}%`, height: '100%',
        background: color, borderRadius: height,
      } as React.CSSProperties} />
    </div>
  )
}

// ─── Currency ─────────────────────────────────────────────────────────────────
type Currency = 'COW' | 'USD' | 'NGN'
const FX: Record<Currency, number> = { COW: 1, USD: 0.00067, NGN: 1.05 }
const SYM: Record<Currency, string> = { COW: '₡', USD: '$', NGN: '₦' }
function fmt(cowrie: number, cur: Currency): string {
  const v = cowrie * FX[cur]
  if (cur === 'COW') return `₡${v.toLocaleString()}`
  if (cur === 'USD') return `$${v.toFixed(2)}`
  return `₦${v.toLocaleString()}`
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
interface ContentProject {
  id: string; title: string; type: 'film' | 'music' | 'doc' | 'series' | 'podcast' | 'animation'
  creator: string; country: string; poster: string; goal: number; raised: number
  minBuyIn: number; roiLow: number; roiHigh: number; roiMonths: number
  investors: number; tags: string[]; description: string
}

const PROJECTS: ContentProject[] = [
  {
    id: 'p1', title: 'Blood of the Covenant', type: 'film',
    creator: 'Chukwuma Okafor', country: 'Nigeria',
    poster: '🎬', goal: 500000, raised: 335000, minBuyIn: 100,
    roiLow: 8, roiHigh: 22, roiMonths: 12, investors: 1247,
    tags: ['Hot', 'Creator Verified'],
    description: 'Nollywood thriller about a Lagos lawyer uncovering a secret society. Shooting begins May 2026.',
  },
  {
    id: 'p2', title: 'Afro Galaxy', type: 'music',
    creator: 'Kwame Asante', country: 'Ghana',
    poster: '🎵', goal: 200000, raised: 178000, minBuyIn: 50,
    roiLow: 12, roiHigh: 35, roiMonths: 8, investors: 2891,
    tags: ['Early Bird Bonus', 'Hot'],
    description: 'Afrobeats album blending highlife and amapiano. Features 3 continental collabs.',
  },
  {
    id: 'p3', title: 'Lagos to Nairobi', type: 'doc',
    creator: 'Amina Wanjiku', country: 'Kenya',
    poster: '🎥', goal: 350000, raised: 112000, minBuyIn: 100,
    roiLow: 5, roiHigh: 15, roiMonths: 18, investors: 489,
    tags: ['Creator Verified'],
    description: 'Pan-African documentary tracing the Cowrie trade route from Lagos through Kinshasa to Nairobi.',
  },
  {
    id: 'p4', title: 'Compound Kids', type: 'series',
    creator: 'Yemi Adeyemi', country: 'Nigeria',
    poster: '📺', goal: 800000, raised: 624000, minBuyIn: 200,
    roiLow: 10, roiHigh: 28, roiMonths: 14, investors: 3156,
    tags: ['Hot', 'Creator Verified', 'Early Bird Bonus'],
    description: 'Animated series about 5 kids from different African villages solving mysteries using ancestral wisdom.',
  },
  {
    id: 'p5', title: 'Drums of Ashanti', type: 'film',
    creator: 'Nana Akua Mensah', country: 'Ghana',
    poster: '🥁', goal: 450000, raised: 67500, minBuyIn: 100,
    roiLow: 6, roiHigh: 18, roiMonths: 16, investors: 321,
    tags: ['Early Bird Bonus'],
    description: 'Historical epic about the Ashanti Empire resistance. Pre-production phase.',
  },
  {
    id: 'p6', title: 'Silicon Savannah', type: 'doc',
    creator: 'Brian Otieno', country: 'Kenya',
    poster: '💻', goal: 180000, raised: 162000, minBuyIn: 50,
    roiLow: 9, roiHigh: 20, roiMonths: 10, investors: 1834,
    tags: ['Hot', 'Creator Verified'],
    description: 'Documentary on Kenya tech startup scene. Post-production nearly complete.',
  },
  {
    id: 'p7', title: 'Motherland Frequencies', type: 'podcast',
    creator: 'Fatima Diallo', country: 'Senegal',
    poster: '🎙️', goal: 120000, raised: 84000, minBuyIn: 25,
    roiLow: 4, roiHigh: 12, roiMonths: 12, investors: 972,
    tags: ['Creator Verified'],
    description: 'Weekly podcast exploring music production across Africa. Season 3 expansion to video.',
  },
  {
    id: 'p8', title: 'Anansi Protocol', type: 'animation',
    creator: 'Kofi Boateng', country: 'Ghana',
    poster: '🕷️', goal: 600000, raised: 390000, minBuyIn: 150,
    roiLow: 15, roiHigh: 40, roiMonths: 10, investors: 2103,
    tags: ['Hot', 'Early Bird Bonus', 'Creator Verified'],
    description: 'Cyberpunk animation. Anansi the spider-god navigates a futuristic Accra. Major streaming deal pending.',
  },
  {
    id: 'p9', title: 'Jollof Wars', type: 'series',
    creator: 'Ngozi Eze', country: 'Nigeria',
    poster: '🍲', goal: 300000, raised: 255000, minBuyIn: 75,
    roiLow: 11, roiHigh: 30, roiMonths: 9, investors: 1567,
    tags: ['Hot'],
    description: 'Comedy series. Chefs from Nigeria, Ghana, and Senegal battle for Jollof supremacy.',
  },
  {
    id: 'p10', title: 'Griot Chronicles', type: 'podcast',
    creator: 'Moussa Traore', country: 'Mali',
    poster: '📖', goal: 90000, raised: 45000, minBuyIn: 25,
    roiLow: 3, roiHigh: 10, roiMonths: 12, investors: 634,
    tags: ['Creator Verified'],
    description: 'Audio documentary series preserving oral histories from West African griots.',
  },
]

// ─── My Investments (mock) ────────────────────────────────────────────────────
interface MyInvestment {
  projectId: string; title: string; poster: string; invested: number
  currentValue: number; returns: number; status: 'Funding' | 'Live' | 'Completed'
  revenuePerView: number; earnedThisWeek: number; earnedAllTime: number
}

const MY_INVESTMENTS: MyInvestment[] = [
  { projectId: 'p1', title: 'Blood of the Covenant', poster: '🎬', invested: 5000, currentValue: 5340, returns: 340, status: 'Funding', revenuePerView: 0.15, earnedThisWeek: 0, earnedAllTime: 0 },
  { projectId: 'p2', title: 'Afro Galaxy', poster: '🎵', invested: 2000, currentValue: 2680, returns: 680, status: 'Live', revenuePerView: 0.10, earnedThisWeek: 42.5, earnedAllTime: 680 },
  { projectId: 'p4', title: 'Compound Kids', poster: '📺', invested: 10000, currentValue: 12100, returns: 2100, status: 'Live', revenuePerView: 0.25, earnedThisWeek: 187.3, earnedAllTime: 2100 },
  { projectId: 'p6', title: 'Silicon Savannah', poster: '💻', invested: 1500, currentValue: 1890, returns: 390, status: 'Completed', revenuePerView: 0.08, earnedThisWeek: 12.1, earnedAllTime: 390 },
  { projectId: 'p8', title: 'Anansi Protocol', poster: '🕷️', invested: 50000, currentValue: 58500, returns: 8500, status: 'Funding', revenuePerView: 0.50, earnedThisWeek: 0, earnedAllTime: 0 },
]

// ─── Governance Polls (mock) ──────────────────────────────────────────────────
interface Poll {
  id: string; projectTitle: string; question: string
  options: { label: string; votes: number }[]
  totalVotes: number; endsIn: string; myVote?: string
}

const POLLS: Poll[] = [
  {
    id: 'v1', projectTitle: 'Compound Kids', question: 'Should Season 2 filming move to Ghana?',
    options: [{ label: 'Yes, film in Accra', votes: 1842 }, { label: 'Stay in Lagos', votes: 1314 }],
    totalVotes: 3156, endsIn: '3 days',
  },
  {
    id: 'v2', projectTitle: 'Blood of the Covenant', question: 'Choose the lead actress for the sequel',
    options: [
      { label: 'Genevieve Nnaji', votes: 589 },
      { label: 'Nse Ikpe-Etim', votes: 412 },
      { label: 'Adesua Etomi-Wellington', votes: 246 },
    ],
    totalVotes: 1247, endsIn: '5 days',
  },
  {
    id: 'v3', projectTitle: 'Anansi Protocol', question: 'Which language should the dub release prioritize?',
    options: [
      { label: 'Twi (Akan)', votes: 876 },
      { label: 'Yoruba', votes: 654 },
      { label: 'Swahili', votes: 573 },
    ],
    totalVotes: 2103, endsIn: '7 days',
  },
  {
    id: 'v4', projectTitle: 'Jollof Wars', question: 'Guest judge for Episode 6?',
    options: [
      { label: 'DJ Cuppy', votes: 723 },
      { label: 'Sarkodie', votes: 512 },
      { label: 'Tiwa Savage', votes: 332 },
    ],
    totalVotes: 1567, endsIn: '2 days',
  },
]

// ─── Revenue Feed (mock) ──────────────────────────────────────────────────────
interface RevenueEvent {
  id: string; emoji: string; project: string; metric: string; earned: number; ts: number
}

function generateRevenueFeed(): RevenueEvent[] {
  const now = Date.now()
  const items: RevenueEvent[] = [
    { id: 'rf1', emoji: '🎵', project: 'Afro Galaxy', metric: '12 streams', earned: 1.20, ts: now - 4000 },
    { id: 'rf2', emoji: '📺', project: 'Compound Kids', metric: '8 views', earned: 2.00, ts: now - 12000 },
    { id: 'rf3', emoji: '🎬', project: 'Blood of the Covenant', metric: '3 views', earned: 0.45, ts: now - 25000 },
    { id: 'rf4', emoji: '💻', project: 'Silicon Savannah', metric: '5 views', earned: 0.40, ts: now - 38000 },
    { id: 'rf5', emoji: '🎵', project: 'Afro Galaxy', metric: '25 streams', earned: 2.50, ts: now - 55000 },
    { id: 'rf6', emoji: '📺', project: 'Compound Kids', metric: '14 views', earned: 3.50, ts: now - 72000 },
    { id: 'rf7', emoji: '🕷️', project: 'Anansi Protocol', metric: 'trailer · 200 views', earned: 5.00, ts: now - 90000 },
    { id: 'rf8', emoji: '🎵', project: 'Afro Galaxy', metric: '6 streams', earned: 0.60, ts: now - 110000 },
  ]
  return items
}

// ─── Equity Tiers ─────────────────────────────────────────────────────────────
const EQUITY_TIERS = [
  { name: 'Bronze', range: '₡100 – ₡999', equity: '0.01%', color: '#cd7f32', icon: '🥉', perks: 'Revenue share + name in credits' },
  { name: 'Silver', range: '₡1,000 – ₡9,999', equity: '0.1%', color: '#c0c0c0', icon: '🥈', perks: 'Revenue share + behind-the-scenes access' },
  { name: 'Gold', range: '₡10,000 – ₡49,999', equity: '1%', color: '#d4a017', icon: '🥇', perks: 'Revenue share + premiere invites + creator chat' },
  { name: 'Diamond', range: '₡50,000+', equity: '5%', color: '#b9f2ff', icon: '💎', perks: 'All above + voting rights + executive producer credit' },
]

function getTier(amount: number) {
  if (amount >= 50000) return EQUITY_TIERS[3]
  if (amount >= 10000) return EQUITY_TIERS[2]
  if (amount >= 1000) return EQUITY_TIERS[1]
  return EQUITY_TIERS[0]
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
type Tab = 'discover' | 'portfolio' | 'governance'

export default function FanInvestPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [tab, setTab] = React.useState<Tab>('discover')
  const [cur, setCur] = React.useState<Currency>('COW')
  const [investSheet, setInvestSheet] = React.useState<ContentProject | null>(null)
  const [investAmount, setInvestAmount] = React.useState('')
  const [revFeed, setRevFeed] = React.useState<RevenueEvent[]>([])
  const [myVotes, setMyVotes] = React.useState<Record<string, string>>({})
  const [sortBy, setSortBy] = React.useState<'hot' | 'newest' | 'ending'>('hot')

  React.useEffect(() => { injectCSS() }, [])

  // Simulate live revenue feed
  React.useEffect(() => {
    setRevFeed(generateRevenueFeed())
    const iv = setInterval(() => {
      setRevFeed(prev => {
        const projects = ['Afro Galaxy', 'Compound Kids', 'Blood of the Covenant', 'Silicon Savannah', 'Anansi Protocol']
        const emojis = ['🎵', '📺', '🎬', '💻', '🕷️']
        const idx = Math.floor(Math.random() * projects.length)
        const views = Math.floor(Math.random() * 20) + 1
        const earned = +(views * (Math.random() * 0.15 + 0.05)).toFixed(2)
        const nw: RevenueEvent = {
          id: `rf_${Date.now()}`, emoji: emojis[idx], project: projects[idx],
          metric: `${views} ${idx === 0 ? 'streams' : 'views'}`, earned, ts: Date.now(),
        }
        return [nw, ...prev].slice(0, 20)
      })
    }, 6000)
    return () => clearInterval(iv)
  }, [])

  // ── Portfolio Calculations ──
  const totalInvested = MY_INVESTMENTS.reduce((s, i) => s + i.invested, 0)
  const totalCurrentValue = MY_INVESTMENTS.reduce((s, i) => s + i.currentValue, 0)
  const totalReturns = MY_INVESTMENTS.reduce((s, i) => s + i.returns, 0)
  const roiPct = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested * 100) : 0
  const earnedThisWeek = MY_INVESTMENTS.reduce((s, i) => s + i.earnedThisWeek, 0)
  const activeCount = MY_INVESTMENTS.filter(i => i.status !== 'Completed').length
  const isDiamond = MY_INVESTMENTS.some(i => i.invested >= 50000)

  // ── Investment Sheet Logic ──
  const investNum = parseFloat(investAmount) || 0
  const selectedTier = getTier(investNum)
  const computedEquity = investNum >= 50000 ? 5 : investNum >= 10000 ? 1 : investNum >= 1000 ? 0.1 : 0.01
  const expectedReturnLow = investSheet ? investNum * (investSheet.roiLow / 100) : 0
  const expectedReturnHigh = investSheet ? investNum * (investSheet.roiHigh / 100) : 0

  const sortedProjects = React.useMemo(() => {
    const arr = [...PROJECTS]
    if (sortBy === 'hot') arr.sort((a, b) => b.investors - a.investors)
    else if (sortBy === 'newest') arr.sort((a, b) => a.raised / a.goal - b.raised / b.goal)
    else arr.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal))
    return arr
  }, [sortBy])

  const statusColor = (s: string) => s === 'Live' ? '#4ade80' : s === 'Completed' ? '#60a5fa' : '#d4a017'

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: '100dvh', background: '#0d0804', color: '#f0f7f0',
      fontFamily: S.font, paddingBottom: 100,
    }}>
      {/* ── Header ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: '#f0f7f0', fontSize: 20, cursor: 'pointer',
          }}>&#8592;</button>
          <div>
            <h1 style={{
              fontSize: 20, fontWeight: 800, fontFamily: S.head, margin: 0,
              background: 'linear-gradient(90deg, #d4a017, #f5d76e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Fan Economy Hub</h1>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
              Streaming-as-Equity -- Own the content you love
            </div>
          </div>
        </div>

        {/* ── Portfolio Hero ── */}
        <Card style={{
          background: 'linear-gradient(135deg, rgba(212,160,23,.12), rgba(212,160,23,.03))',
          border: '1px solid rgba(212,160,23,.2)', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>MY PORTFOLIO</div>
            {/* Currency toggle */}
            <div style={{
              display: 'flex', background: 'rgba(0,0,0,.3)', borderRadius: 8, overflow: 'hidden',
            }}>
              {(['COW', 'USD', 'NGN'] as Currency[]).map(c => (
                <button key={c} onClick={() => setCur(c)} style={{
                  padding: '4px 12px', border: 'none', fontSize: 11, fontWeight: 700,
                  fontFamily: S.font, cursor: 'pointer',
                  background: cur === c ? '#d4a017' : 'transparent',
                  color: cur === c ? '#0d0804' : 'rgba(255,255,255,.4)',
                }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Total Invested</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: S.head, color: '#d4a017' }}>
                {fmt(totalInvested, cur)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Total Returns</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: S.head, color: '#4ade80' }}>
                +{fmt(totalReturns, cur)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Active Investments</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f7f0' }}>{activeCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>ROI</div>
              <div style={{
                fontSize: 18, fontWeight: 700,
                color: roiPct >= 0 ? '#4ade80' : '#ef4444',
              }}>{roiPct >= 0 ? '+' : ''}{roiPct.toFixed(1)}%</div>
            </div>
          </div>
          {/* Earned this week strip */}
          <div style={{
            marginTop: 10, padding: '6px 10px', borderRadius: 8,
            background: 'rgba(74,222,128,.08)', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Earned this week</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>+{fmt(earnedThisWeek, cur)}</span>
          </div>
        </Card>

        {/* ── Tab Bar ── */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,.04)', borderRadius: 10,
          padding: 3, marginBottom: 14,
        }}>
          {([
            { key: 'discover' as Tab, label: 'Discover', icon: '🔍' },
            { key: 'portfolio' as Tab, label: 'My Portfolio', icon: '💼' },
            { key: 'governance' as Tab, label: 'Governance', icon: '🗳️' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: tab === t.key ? 'rgba(212,160,23,.15)' : 'transparent',
              color: tab === t.key ? '#d4a017' : 'rgba(255,255,255,.4)',
              fontSize: 12, fontWeight: 700, fontFamily: S.font, cursor: 'pointer',
              transition: 'all .2s',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB: DISCOVER
      ═══════════════════════════════════════════════════════════════════ */}
      {tab === 'discover' && (
        <div className="fi-fade" style={{ padding: '0 16px' }}>
          {/* Sort pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {([
              { key: 'hot' as const, label: '🔥 Hottest' },
              { key: 'newest' as const, label: '🌱 Newest' },
              { key: 'ending' as const, label: '⏳ Closing Soon' },
            ]).map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)} style={{
                padding: '5px 14px', borderRadius: 20, border: 'none',
                background: sortBy === s.key ? 'rgba(212,160,23,.15)' : 'rgba(255,255,255,.04)',
                color: sortBy === s.key ? '#d4a017' : 'rgba(255,255,255,.4)',
                fontSize: 11, fontWeight: 700, fontFamily: S.font, cursor: 'pointer',
              }}>{s.label}</button>
            ))}
          </div>

          {/* Project Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedProjects.map((p, i) => {
              const pct = Math.round(p.raised / p.goal * 100)
              const typeIcon = p.type === 'film' ? '🎬' : p.type === 'music' ? '🎵'
                : p.type === 'doc' ? '🎥' : p.type === 'series' ? '📺'
                : p.type === 'podcast' ? '🎙️' : '🎨'
              return (
                <Card key={p.id} style={{ animationDelay: `${i * 0.05}s` }} onClick={() => setInvestSheet(p)}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* Poster placeholder */}
                    <div style={{
                      width: 72, height: 96, borderRadius: 10, flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(212,160,23,.1), rgba(212,160,23,.03))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, border: '1px solid rgba(212,160,23,.15)',
                    }}>{p.poster}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                        {p.tags.map(t => (
                          <Pill key={t} label={t}
                            color={t === 'Hot' ? '#ef4444' : t === 'Early Bird Bonus' ? '#d4a017' : '#4ade80'}
                            bg={t === 'Hot' ? 'rgba(239,68,68,.15)' : t === 'Early Bird Bonus' ? 'rgba(212,160,23,.15)' : 'rgba(74,222,128,.12)'}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: S.head, color: '#f0f7f0', marginBottom: 2 }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>
                        {typeIcon} {p.type.charAt(0).toUpperCase() + p.type.slice(1)} -- {p.creator} ({p.country})
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', lineHeight: 1.4, marginBottom: 8 }}>
                        {p.description}
                      </div>
                      {/* Progress */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                          {fmt(p.raised, cur)} / {fmt(p.goal, cur)}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: pct >= 80 ? '#4ade80' : '#d4a017' }}>
                          {pct}%
                        </span>
                      </div>
                      <ProgressBar pct={pct} color={pct >= 80 ? '#4ade80' : '#d4a017'} />
                      {/* Bottom stats */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
                          <span>Min: {fmt(p.minBuyIn, cur)}</span>
                          <span>{p.investors.toLocaleString()} investors</span>
                        </div>
                        <div style={{
                          fontSize: 10, fontWeight: 700, color: '#4ade80',
                          background: 'rgba(74,222,128,.08)', padding: '2px 8px', borderRadius: 6,
                        }}>
                          {p.roiLow}-{p.roiHigh}% / {p.roiMonths}mo
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB: MY PORTFOLIO
      ═══════════════════════════════════════════════════════════════════ */}
      {tab === 'portfolio' && (
        <div className="fi-fade" style={{ padding: '0 16px' }}>
          {/* Revenue Feed */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, fontFamily: S.head,
              color: 'rgba(255,255,255,.6)', marginBottom: 8,
            }}>Live Revenue Feed</div>
            <Card style={{
              maxHeight: 180, overflowY: 'auto', padding: 10,
              background: 'rgba(74,222,128,.03)', border: '1px solid rgba(74,222,128,.1)',
            }}>
              {revFeed.slice(0, 8).map((r, i) => (
                <div key={r.id} className={i === 0 ? 'fi-slide-in' : ''} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '5px 0', borderBottom: i < 7 ? '1px solid rgba(255,255,255,.04)' : 'none',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                    {r.emoji} {r.project} -- {r.metric}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', flexShrink: 0 }}>
                    +{fmt(r.earned, cur)}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* My Investment Cards */}
          <div style={{
            fontSize: 13, fontWeight: 700, fontFamily: S.head,
            color: 'rgba(255,255,255,.6)', marginBottom: 8,
          }}>My Investments ({MY_INVESTMENTS.length})</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MY_INVESTMENTS.map((inv, i) => (
              <Card key={inv.projectId} style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{inv.poster}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: S.head }}>{inv.title}</div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: statusColor(inv.status),
                        background: `${statusColor(inv.status)}15`, padding: '1px 8px',
                        borderRadius: 6, display: 'inline-block', marginTop: 2,
                      }}>{inv.status}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Current Value</div>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: S.head, color: '#d4a017' }}>
                      {fmt(inv.currentValue, cur)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Invested</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{fmt(inv.invested, cur)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Returns</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>+{fmt(inv.returns, cur)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Per View</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{fmt(inv.revenuePerView, cur)}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,.03)',
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                    This week: <span style={{ color: '#4ade80', fontWeight: 700 }}>+{fmt(inv.earnedThisWeek, cur)}</span>
                    {' '} | All-time: <span style={{ color: '#d4a017', fontWeight: 700 }}>{fmt(inv.earnedAllTime, cur)}</span>
                  </div>
                  {inv.status !== 'Funding' && (
                    <Btn label="Withdraw" variant="ghost" style={{ padding: '4px 10px', fontSize: 10 }} />
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Total Portfolio Summary */}
          <Card style={{
            marginTop: 14, background: 'linear-gradient(135deg, rgba(212,160,23,.08), rgba(74,222,128,.05))',
            border: '1px solid rgba(212,160,23,.15)',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)',
              marginBottom: 8, fontFamily: S.head,
            }}>PORTFOLIO SUMMARY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Total Value</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: S.head, color: '#d4a017' }}>
                  {fmt(totalCurrentValue, cur)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Net Profit</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: S.head, color: '#4ade80' }}>
                  +{fmt(totalReturns, cur)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Btn label="Withdraw All Returns" variant="gold" style={{ width: '100%', padding: '10px 0' }} />
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB: GOVERNANCE
      ═══════════════════════════════════════════════════════════════════ */}
      {tab === 'governance' && (
        <div className="fi-fade" style={{ padding: '0 16px' }}>
          {/* Diamond gate */}
          {!isDiamond && (
            <Card style={{
              background: 'rgba(185,242,255,.05)', border: '1px solid rgba(185,242,255,.15)',
              marginBottom: 14, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>💎</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: S.head, color: '#b9f2ff' }}>
                Diamond Tier Required
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4, lineHeight: 1.5 }}>
                Invest ₡50,000+ in any project to unlock voting rights. You currently have Diamond access
                on Anansi Protocol.
              </div>
            </Card>
          )}

          <div style={{
            fontSize: 13, fontWeight: 700, fontFamily: S.head,
            color: 'rgba(255,255,255,.6)', marginBottom: 10,
          }}>Active Polls ({POLLS.length})</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {POLLS.map((poll, pi) => {
              const canVote = isDiamond || MY_INVESTMENTS.some(
                inv => inv.invested >= 50000 && PROJECTS.find(p => p.id === inv.projectId)?.title === poll.projectTitle
              )
              const hasVoted = !!myVotes[poll.id]

              return (
                <Card key={poll.id} style={{
                  border: canVote ? '1px solid rgba(185,242,255,.12)' : '1px solid rgba(255,255,255,.06)',
                  animationDelay: `${pi * 0.05}s`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Pill label={poll.projectTitle}
                      color="#d4a017" bg="rgba(212,160,23,.12)" />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>
                      Ends in {poll.endsIn}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: S.head, marginBottom: 10, color: '#f0f7f0' }}>
                    {poll.question}
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {poll.options.map(opt => {
                      const optPct = Math.round(opt.votes / poll.totalVotes * 100)
                      const isMyVote = myVotes[poll.id] === opt.label
                      return (
                        <button key={opt.label}
                          disabled={!canVote || hasVoted}
                          onClick={() => {
                            if (canVote && !hasVoted) {
                              setMyVotes(prev => ({ ...prev, [poll.id]: opt.label }))
                            }
                          }}
                          style={{
                            position: 'relative', overflow: 'hidden', textAlign: 'left',
                            padding: '8px 12px', borderRadius: 8, border: 'none',
                            background: isMyVote ? 'rgba(185,242,255,.1)' : 'rgba(255,255,255,.04)',
                            cursor: canVote && !hasVoted ? 'pointer' : 'default',
                          }}
                        >
                          {/* Fill bar */}
                          <div style={{
                            position: 'absolute', top: 0, left: 0, bottom: 0,
                            width: `${optPct}%`, background: isMyVote
                              ? 'rgba(185,242,255,.12)' : 'rgba(212,160,23,.06)',
                            borderRadius: 8, transition: 'width .4s ease',
                          }} />
                          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: 12, fontWeight: isMyVote ? 700 : 500,
                              color: isMyVote ? '#b9f2ff' : 'rgba(255,255,255,.6)',
                            }}>
                              {isMyVote && '✓ '}{opt.label}
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: isMyVote ? '#b9f2ff' : 'rgba(255,255,255,.35)',
                            }}>{optPct}%</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,.25)' }}>
                    {poll.totalVotes.toLocaleString()} votes cast -- Voting power proportional to stake
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Governance Info */}
          <Card style={{ marginTop: 14, background: 'rgba(212,160,23,.04)' }}>
            <div style={{
              fontSize: 12, fontWeight: 700, fontFamily: S.head,
              color: '#d4a017', marginBottom: 6,
            }}>How Governance Works</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>
              Diamond-tier investors (₡50,000+) receive voting rights on creative decisions for their
              invested projects. Your voting power is proportional to your stake. Polls are binding --
              creators commit to implementing the winning option. One Cowrie, one voice.
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          INVESTMENT BOTTOM SHEET
      ═══════════════════════════════════════════════════════════════════ */}
      {investSheet && (
        <>
          {/* Backdrop */}
          <div onClick={() => { setInvestSheet(null); setInvestAmount('') }} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
            zIndex: 900, backdropFilter: 'blur(4px)',
          }} />
          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#1a1209', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px', zIndex: 901,
            maxHeight: '85dvh', overflowY: 'auto',
            border: '1px solid rgba(212,160,23,.2)',
            animation: 'fiFade .3s ease',
          }}>
            {/* Handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)',
              margin: '0 auto 16px',
            }} />

            {/* Project Header */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 72, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(212,160,23,.1), rgba(212,160,23,.03))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, border: '1px solid rgba(212,160,23,.15)',
              }}>{investSheet.poster}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: S.head, color: '#f0f7f0' }}>
                  {investSheet.title}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                  {investSheet.creator} ({investSheet.country})
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {investSheet.tags.map(t => (
                    <Pill key={t} label={t}
                      color={t === 'Hot' ? '#ef4444' : t === 'Early Bird Bonus' ? '#d4a017' : '#4ade80'}
                      bg={t === 'Hot' ? 'rgba(239,68,68,.15)' : t === 'Early Bird Bonus' ? 'rgba(212,160,23,.15)' : 'rgba(74,222,128,.12)'}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Funding Progress */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                  {fmt(investSheet.raised, cur)} raised of {fmt(investSheet.goal, cur)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#d4a017' }}>
                  {Math.round(investSheet.raised / investSheet.goal * 100)}%
                </span>
              </div>
              <ProgressBar pct={investSheet.raised / investSheet.goal * 100} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
                {investSheet.investors.toLocaleString()} investors -- Projected ROI: {investSheet.roiLow}-{investSheet.roiHigh}% over {investSheet.roiMonths} months
              </div>
            </div>

            {/* Investment Amount */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>
                Investment Amount
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 16, fontWeight: 800, color: '#d4a017',
                }}>₡</span>
                <input
                  type="number"
                  value={investAmount}
                  onChange={e => setInvestAmount(e.target.value)}
                  placeholder={`Min ${investSheet.minBuyIn.toLocaleString()}`}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,.06)',
                    border: '1px solid rgba(212,160,23,.2)', borderRadius: 12,
                    padding: '12px 14px 12px 32px', color: '#f0f7f0',
                    fontSize: 18, fontWeight: 700, fontFamily: S.head,
                    boxSizing: 'border-box', outline: 'none',
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
                Balance: ₡125,000 -- Min: {fmt(investSheet.minBuyIn, cur)}
              </div>
            </div>

            {/* Equity Tier Breakdown */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>
                Equity Tiers
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {EQUITY_TIERS.map(tier => {
                  const isActive = investNum >= 100 && selectedTier.name === tier.name
                  return (
                    <div key={tier.name} style={{
                      padding: '8px 10px', borderRadius: 10,
                      background: isActive ? `${tier.color}15` : 'rgba(255,255,255,.03)',
                      border: `1px solid ${isActive ? `${tier.color}40` : 'rgba(255,255,255,.06)'}`,
                      transition: 'all .2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        <span style={{ fontSize: 14 }}>{tier.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tier.color }}>{tier.name}</span>
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{tier.range}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: isActive ? tier.color : 'rgba(255,255,255,.5)', marginTop: 2 }}>
                        {tier.equity} equity
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', marginTop: 2 }}>{tier.perks}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Expected Returns Calculator */}
            {investNum >= investSheet.minBuyIn && (
              <Card style={{
                marginBottom: 14, background: 'rgba(74,222,128,.04)',
                border: '1px solid rgba(74,222,128,.12)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>
                  EXPECTED RETURNS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Your Equity</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: selectedTier.color }}>
                      {computedEquity}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Low Estimate</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#4ade80' }}>
                      +{fmt(expectedReturnLow, cur)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>High Estimate</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#4ade80' }}>
                      +{fmt(expectedReturnHigh, cur)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 6 }}>
                  Over {investSheet.roiMonths} months. Revenue split: you earn per stream/view of this content.
                </div>
              </Card>
            )}

            {/* Risk Disclaimer */}
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.1)',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(239,68,68,.7)', lineHeight: 1.5 }}>
                Content investments carry risk. Returns are projected, not guaranteed. Revenue depends on
                viewership and market performance. Past performance does not indicate future results. You may
                lose some or all of your investment. By proceeding you agree to the Fan Economy terms.
              </div>
            </div>

            {/* CTA */}
            <Btn
              label={investNum < investSheet.minBuyIn
                ? `Minimum ₡${investSheet.minBuyIn.toLocaleString()}`
                : `Fund This Project -- ${fmt(investNum, 'COW')}`}
              variant="gold"
              disabled={investNum < investSheet.minBuyIn}
              style={{ width: '100%', padding: '14px 0', fontSize: 15, borderRadius: 14 }}
              onClick={() => {
                setInvestSheet(null)
                setInvestAmount('')
              }}
            />

            {/* Close */}
            <button onClick={() => { setInvestSheet(null); setInvestAmount('') }} style={{
              width: '100%', padding: '10px 0', marginTop: 8, background: 'none',
              border: 'none', color: 'rgba(255,255,255,.3)', fontSize: 12,
              fontFamily: S.font, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </>
      )}
    </div>
  )
}
