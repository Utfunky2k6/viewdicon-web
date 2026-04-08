'use client'
// =====================================================================
// JOLLOF TV — Pan-African Distribution + Offline Sync + Premiere Ticketing
// The content distribution engine that eliminates middlemen
// and brings African content to every village.
// Tabs: Channels | Offline | Premiere
// =====================================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/* ── inject-once CSS (ds- prefix) ── */
const CSS_ID = 'ds-distribute-css'
const CSS = `
@keyframes dsFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes dsSlide{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
@keyframes dsPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
@keyframes dsShimmer{0%{left:-120%}100%{left:220%}}
@keyframes dsCountdown{0%{opacity:.7}50%{opacity:1}100%{opacity:.7}}
@keyframes dsGlow{0%,100%{box-shadow:0 0 8px rgba(212,160,23,.25)}50%{box-shadow:0 0 22px rgba(212,160,23,.6)}}
@keyframes dsBarGrow{from{width:0}to{width:var(--bar-w)}}
.ds-fade{animation:dsFade .35s ease both}
.ds-slide{animation:dsSlide .35s ease both}
.ds-pulse{animation:dsPulse 2s ease-in-out infinite}
.ds-shimmer{position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);animation:dsShimmer 3.5s ease-in-out infinite;pointer-events:none}
.ds-countdown{animation:dsCountdown 1.2s ease-in-out infinite}
.ds-glow{animation:dsGlow 2.5s ease-in-out infinite}
.ds-bar-grow{animation:dsBarGrow .8s ease both}
`

function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

/* ── types ── */
type MainTab = 'channels' | 'offline' | 'premiere'

interface Channel {
  key: string; icon: string; name: string; desc: string
  enabled: boolean; views: string; revenue: number; partners: string
}

interface OfflinePackage {
  id: string; title: string; items: number; itemType: string
  price: number; free: boolean; downloads: number; drm: string; region: string
}

interface Premiere {
  id: string; title: string; date: string; venue: string
  tiers: { name: string; price: number; sold: number; cap: number; color: string }[]
  totalRevenue: number
}

interface TVStation {
  name: string; country: string; flag: string
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Airing'
  terms: string
}

/* ── data ── */
const CHANNELS: Channel[] = [
  { key: 'platform', icon: '\uD83D\uDCFA', name: 'Jollof TV (Platform)', desc: 'Default in-app streaming. Always on.', enabled: true, views: '2.4M', revenue: 142000, partners: 'Built-in' },
  { key: 'kiosk', icon: '\uD83D\uDCF1', name: 'Mobile Kiosks', desc: 'Content for rural areas with limited internet. Offline USB distribution.', enabled: true, views: '890K', revenue: 67000, partners: '450 kiosks across 12 countries' },
  { key: 'village-screen', icon: '\uD83D\uDCE1', name: 'Village Screens', desc: 'Community projection events. Schedule screenings for gatherings.', enabled: true, views: '340K', revenue: 38000, partners: '200 registered screens' },
  { key: 'radio', icon: '\uD83D\uDCFB', name: 'Radio Companion', desc: 'Audio track extracted for radio broadcast.', enabled: false, views: '1.1M', revenue: 24000, partners: '35 partner stations' },
  { key: 'satellite', icon: '\uD83D\uDEF0\uFE0F', name: 'Satellite TV', desc: 'Partner stations: AfroStar TV, Pan-Africa Network, Ubuntu Broadcasting', enabled: false, views: '4.6M', revenue: 210000, partners: '3 satellite networks' },
  { key: 'embed', icon: '\uD83C\uDF10', name: 'Web Embed', desc: 'Embeddable player for external sites. Generate embed code.', enabled: true, views: '520K', revenue: 18000, partners: '1,200 embed sites' },
  { key: 'night-market', icon: '\uD83C\uDFEA', name: 'Night Market Stalls', desc: 'Pop-up screening at markets. Book stall, set pricing, share revenue.', enabled: true, views: '180K', revenue: 12000, partners: '85 market stalls' },
]

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', viewers: 4200, x: 32, y: 52 },
  { code: 'GH', name: 'Ghana', viewers: 1800, x: 27, y: 54 },
  { code: 'KE', name: 'Kenya', viewers: 2100, x: 68, y: 58 },
  { code: 'ZA', name: 'South Africa', viewers: 1400, x: 55, y: 88 },
  { code: 'EG', name: 'Egypt', viewers: 900, x: 55, y: 22 },
  { code: 'CM', name: 'Cameroon', viewers: 650, x: 38, y: 58 },
  { code: 'TZ', name: 'Tanzania', viewers: 780, x: 65, y: 68 },
  { code: 'SN', name: 'Senegal', viewers: 520, x: 14, y: 46 },
  { code: 'ET', name: 'Ethiopia', viewers: 1100, x: 70, y: 45 },
  { code: 'CD', name: 'DR Congo', viewers: 440, x: 50, y: 62 },
  { code: 'UG', name: 'Uganda', viewers: 610, x: 62, y: 56 },
  { code: 'RW', name: 'Rwanda', viewers: 380, x: 60, y: 62 },
  { code: 'CI', name: "Cote d'Ivoire", viewers: 290, x: 22, y: 54 },
  { code: 'MA', name: 'Morocco', viewers: 340, x: 25, y: 28 },
  { code: 'MZ', name: 'Mozambique', viewers: 210, x: 66, y: 80 },
  { code: 'AO', name: 'Angola', viewers: 160, x: 42, y: 74 },
  { code: 'SD', name: 'Sudan', viewers: 120, x: 58, y: 38 },
  { code: 'ML', name: 'Mali', viewers: 95, x: 24, y: 42 },
  { code: 'ZM', name: 'Zambia', viewers: 180, x: 56, y: 76 },
  { code: 'BF', name: 'Burkina Faso', viewers: 85, x: 26, y: 48 },
]

const OFFLINE_PACKAGES: OfflinePackage[] = [
  { id: 'op1', title: 'Best of Nollywood Q1 2026', items: 12, itemType: 'films', price: 5000, free: false, downloads: 3400, drm: 'Watermark', region: 'West Africa' },
  { id: 'op2', title: 'Afrobeats Essentials', items: 50, itemType: 'tracks', price: 1200, free: false, downloads: 8900, drm: 'None', region: 'Pan-African' },
  { id: 'op3', title: 'Kids Educational Pack', items: 20, itemType: 'episodes', price: 0, free: true, downloads: 15200, drm: 'None', region: 'East Africa' },
  { id: 'op4', title: 'Village Cinema Weekend', items: 5, itemType: 'films', price: 2000, free: false, downloads: 1100, drm: 'Encrypted', region: 'Southern Africa' },
]

const PREMIERES: Premiere[] = [
  {
    id: 'p1', title: 'Blood of Lagos 2: The Return', date: '2026-04-15T20:00:00',
    venue: 'Virtual + Lagos Island Screen',
    tiers: [
      { name: 'Standard', price: 50, sold: 500, cap: 2000, color: '#6b7280' },
      { name: 'Premium', price: 200, sold: 200, cap: 500, color: '#d4a017' },
      { name: 'VIP', price: 500, sold: 50, cap: 100, color: '#a855f7' },
      { name: 'Village Chief', price: 2000, sold: 10, cap: 25, color: '#22c55e' },
    ],
    totalRevenue: 98000,
  },
  {
    id: 'p2', title: 'Drums of Destiny: Director\'s Cut', date: '2026-04-20T19:00:00',
    venue: 'Virtual + Accra National Theatre Screen',
    tiers: [
      { name: 'Standard', price: 50, sold: 310, cap: 1500, color: '#6b7280' },
      { name: 'Premium', price: 200, sold: 85, cap: 300, color: '#d4a017' },
      { name: 'VIP', price: 500, sold: 20, cap: 60, color: '#a855f7' },
      { name: 'Village Chief', price: 2000, sold: 5, cap: 15, color: '#22c55e' },
    ],
    totalRevenue: 42500,
  },
  {
    id: 'p3', title: 'Afrobeats Academy Live Concert', date: '2026-05-01T21:00:00',
    venue: 'Virtual + Nairobi Village Screen',
    tiers: [
      { name: 'Standard', price: 50, sold: 1200, cap: 5000, color: '#6b7280' },
      { name: 'Premium', price: 200, sold: 340, cap: 1000, color: '#d4a017' },
      { name: 'VIP', price: 500, sold: 78, cap: 200, color: '#a855f7' },
      { name: 'Village Chief', price: 2000, sold: 12, cap: 50, color: '#22c55e' },
    ],
    totalRevenue: 191000,
  },
]

const TV_STATIONS: TVStation[] = [
  { name: 'NTA', country: 'Nigeria', flag: '\uD83C\uDDF3\uD83C\uDDEC', status: 'Airing', terms: '55/45 rev share, 6-month exclusive' },
  { name: 'GBC', country: 'Ghana', flag: '\uD83C\uDDEC\uD83C\uDDED', status: 'Under Review', terms: '60/40, non-exclusive' },
  { name: 'KBC', country: 'Kenya', flag: '\uD83C\uDDF0\uD83C\uDDEA', status: 'Accepted', terms: '50/50, 3-month trial' },
  { name: 'SABC', country: 'South Africa', flag: '\uD83C\uDDFF\uD83C\uDDE6', status: 'Submitted', terms: 'Pending negotiation' },
  { name: 'RTS', country: 'Senegal', flag: '\uD83C\uDDF8\uD83C\uDDF3', status: 'Under Review', terms: '55/45, Francophone package' },
]

/* ── helpers ── */
function fmt(n: number) { return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(n) }
function fmtCowrie(n: number) { return '\u20A1 ' + n.toLocaleString() }

function useCountdown(target: string) {
  const [left, setLeft] = React.useState({ d: 0, h: 0, m: 0, s: 0 })
  React.useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now())
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [target])
  return left
}

/* ── styles ── */
const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', background: '#0d0804', color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 },
  header: { padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { background: 'none', border: 'none', color: '#d4a017', fontSize: 22, cursor: 'pointer', padding: 4 },
  title: { fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700, color: '#d4a017' },
  tabBar: { display: 'flex', gap: 0, margin: '14px 16px 0', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' },
  tabBtn: { flex: 1, padding: '11px 0', textAlign: 'center' as const, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .2s' },
  tabActive: { background: '#d4a017', color: '#0d0804' },
  tabInactive: { background: 'rgba(255,255,255,.04)', color: '#a0a0a0' },
  section: { margin: '16px 16px 0' },
  sectionTitle: { fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: '#f0f7f0', marginBottom: 10 },
  card: { background: 'rgba(255,255,255,.04)', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid rgba(255,255,255,.08)' },
  gold: { color: '#d4a017' },
  green: { color: '#4ade80' },
  dim: { color: '#777', fontSize: 12 },
  row: { display: 'flex', alignItems: 'center', gap: 10 },
  badge: { fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, lineHeight: '16px' },
  toggle: { width: 40, height: 22, borderRadius: 12, cursor: 'pointer', position: 'relative' as const, transition: 'background .2s', flexShrink: 0 },
  toggleKnob: { width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute' as const, top: 2, transition: 'left .2s' },
  statRow: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 14 },
  statCard: { flex: '1 1 45%', background: 'rgba(255,255,255,.03)', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,.06)', textAlign: 'center' as const },
  statNum: { fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: '#d4a017' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  progBar: { height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden', flex: 1 },
  progFill: { height: '100%', borderRadius: 3, transition: 'width .6s ease' },
  input: { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '8px 12px', color: '#f0f7f0', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'Inter, system-ui, sans-serif' },
  btn: { padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .2s' },
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function DistributePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [tab, setTab] = React.useState<MainTab>('channels')
  const [channels, setChannels] = React.useState(CHANNELS)
  const [showSubmitForm, setShowSubmitForm] = React.useState(false)
  const [showPackageBuilder, setShowPackageBuilder] = React.useState(false)
  const [showCreatePremiere, setShowCreatePremiere] = React.useState(false)
  const [expandedPremiere, setExpandedPremiere] = React.useState<string | null>('p1')
  const [submitStation, setSubmitStation] = React.useState<string | null>(null)

  React.useEffect(() => { injectCSS() }, [])

  const toggleChannel = (key: string) => {
    setChannels(prev => prev.map(ch => ch.key === key ? { ...ch, enabled: !ch.enabled } : ch))
  }

  const totalReach = '10.2M'
  const activeChannels = channels.filter(c => c.enabled).length
  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0)
  const maxRevenue = Math.max(...channels.map(c => c.revenue))

  const TABS: { key: MainTab; label: string; icon: string }[] = [
    { key: 'channels', label: 'Channels', icon: '\uD83D\uDCE1' },
    { key: 'offline', label: 'Offline', icon: '\uD83D\uDCE5' },
    { key: 'premiere', label: 'Premiere', icon: '\uD83C\uDFAC' },
  ]

  /* ── Tab 1: Channels ── */
  const renderChannels = () => (
    <div style={S.section} className="ds-fade">
      {/* Distribution Stats Hero */}
      <div style={S.statRow}>
        <div style={S.statCard}><div style={S.statNum}>{totalReach}</div><div style={S.statLabel}>Total Reach</div></div>
        <div style={S.statCard}><div style={S.statNum}>{activeChannels}</div><div style={S.statLabel}>Active Channels</div></div>
        <div style={S.statCard}><div style={S.statNum}>20</div><div style={S.statLabel}>Countries</div></div>
        <div style={S.statCard}><div style={S.statNum}>{fmtCowrie(totalRevenue)}</div><div style={S.statLabel}>Revenue (30d)</div></div>
      </div>

      {/* 7 Distribution Channels */}
      <div style={S.sectionTitle}>Distribution Channels</div>
      {channels.map((ch, i) => (
        <div key={ch.key} style={{ ...S.card, opacity: ch.enabled ? 1 : 0.55 }} className="ds-slide" >
          <div style={{ ...S.row, justifyContent: 'space-between' }}>
            <div style={{ ...S.row, flex: 1 }}>
              <span style={{ fontSize: 26 }}>{ch.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Sora, sans-serif' }}>{ch.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{ch.desc}</div>
              </div>
            </div>
            {ch.key !== 'platform' && (
              <div style={{ ...S.toggle, background: ch.enabled ? '#4ade80' : '#333' }} onClick={() => toggleChannel(ch.key)}>
                <div style={{ ...S.toggleKnob, left: ch.enabled ? 20 : 2 }} />
              </div>
            )}
            {ch.key === 'platform' && (
              <span style={{ ...S.badge, background: 'rgba(74,222,128,.12)', color: '#4ade80' }}>Always On</span>
            )}
          </div>
          <div style={{ ...S.row, marginTop: 8, gap: 16, flexWrap: 'wrap' as const }}>
            <span style={{ fontSize: 11, color: '#4ade80' }}>Views: {ch.views}</span>
            <span style={{ fontSize: 11, color: '#d4a017' }}>Revenue: {fmtCowrie(ch.revenue)}</span>
            <span style={{ fontSize: 11, color: '#888' }}>Partners: {ch.partners}</span>
          </div>
        </div>
      ))}

      {/* Revenue Per Channel Bar Chart */}
      <div style={{ ...S.sectionTitle, marginTop: 16 }}>Revenue Per Channel</div>
      <div style={S.card}>
        {channels.map(ch => {
          const pct = maxRevenue > 0 ? (ch.revenue / maxRevenue) * 100 : 0
          return (
            <div key={ch.key} style={{ marginBottom: 10 }}>
              <div style={{ ...S.row, justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{ch.icon} {ch.name}</span>
                <span style={{ fontSize: 12, color: '#d4a017', fontWeight: 700 }}>{fmtCowrie(ch.revenue)}</span>
              </div>
              <div style={S.progBar}>
                <div className="ds-bar-grow" style={{ ...S.progFill, width: `${pct}%`, background: ch.enabled ? 'linear-gradient(90deg,#d4a017,#f59e0b)' : '#555', ['--bar-w' as any]: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Geo Reach Map — 20 Countries */}
      <div style={{ ...S.sectionTitle, marginTop: 16 }}>Geo Reach Map</div>
      <div style={{ ...S.card, position: 'relative' as const, overflow: 'hidden' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: 220 }}>
          <ellipse cx="45" cy="55" rx="38" ry="42" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth=".5" />
          {COUNTRIES.map(c => {
            const maxV = Math.max(...COUNTRIES.map(cc => cc.viewers))
            const intensity = c.viewers / maxV
            const r = 1.5 + intensity * 3
            return (
              <g key={c.code}>
                <circle cx={c.x} cy={c.y} r={r + 2} fill={`rgba(212,160,23,${0.08 + intensity * 0.2})`} className="ds-pulse" />
                <circle cx={c.x} cy={c.y} r={r} fill={`rgba(212,160,23,${0.4 + intensity * 0.6})`} />
                <text x={c.x} y={c.y - r - 2} fill="#a0a0a0" fontSize="2.5" textAnchor="middle">{c.name}</text>
                <text x={c.x} y={c.y + r + 4} fill="#d4a017" fontSize="2.2" textAnchor="middle" fontWeight="700">{fmt(c.viewers)}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Country Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
        {COUNTRIES.slice(0, 20).map(c => {
          const maxV = Math.max(...COUNTRIES.map(cc => cc.viewers))
          const intensity = c.viewers / maxV
          return (
            <div key={c.code} style={{
              background: `rgba(212,160,23,${0.04 + intensity * 0.12})`,
              borderRadius: 8, padding: '8px 4px', textAlign: 'center' as const,
              border: `1px solid rgba(212,160,23,${0.1 + intensity * 0.2})`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f7f0' }}>{c.code}</div>
              <div style={{ fontSize: 10, color: '#d4a017', fontWeight: 600 }}>{fmt(c.viewers)}</div>
            </div>
          )
        })}
      </div>

      {/* Submit to New Channel */}
      <div style={{ ...S.sectionTitle, marginTop: 16 }}>Submit to New Channel</div>
      <div style={{ ...S.card, borderStyle: 'dashed', borderColor: 'rgba(212,160,23,.3)' }}>
        {!showSubmitForm ? (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>Apply to distribute your content on a new channel</div>
            <button style={{ ...S.btn, background: '#d4a017', color: '#0d0804' }} onClick={() => setShowSubmitForm(true)}>
              + Submit Application
            </button>
          </div>
        ) : (
          <div className="ds-fade">
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: '#d4a017', marginBottom: 10 }}>Channel Application</div>
            <select style={{ ...S.input, marginBottom: 8 }}>
              <option value="">Select target channel...</option>
              <option>Mobile Kiosks</option><option>Village Screens</option>
              <option>Radio Companion</option><option>Satellite TV</option>
              <option>Web Embed</option><option>Night Market Stalls</option>
            </select>
            <input style={{ ...S.input, marginBottom: 8 }} placeholder="Content title or series name..." />
            <textarea style={{ ...S.input, height: 60, resize: 'none' as const, marginBottom: 8 }} placeholder="Why this channel suits your content..." />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#ccc', marginBottom: 10 }}>
              <input type="checkbox" /> I accept the distribution terms and revenue split agreement
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btn, background: '#333', color: '#f0f7f0', fontSize: 12 }} onClick={() => setShowSubmitForm(false)}>Cancel</button>
              <button style={{ ...S.btn, background: '#d4a017', color: '#0d0804', fontSize: 12 }} onClick={() => setShowSubmitForm(false)}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  /* ── Tab 2: Offline ── */
  const renderOffline = () => (
    <div style={S.section} className="ds-fade">
      {/* Offline Strategy */}
      <div style={{ ...S.card, background: 'linear-gradient(135deg,rgba(212,160,23,.08),rgba(255,255,255,.03))', borderColor: 'rgba(212,160,23,.2)' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 800, color: '#d4a017', marginBottom: 4 }}>
          Reach Millions Without Internet
        </div>
        <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5 }}>
          Create offline content bundles for USB/SD card distribution. Bring African stories to every corner of the continent, even where the network does not reach.
        </div>
      </div>

      {/* Sync Dashboard Stats */}
      <div style={{ ...S.sectionTitle, marginTop: 14 }}>Sync Dashboard</div>
      <div style={S.statRow}>
        <div style={S.statCard}><div style={S.statNum}>28.6K</div><div style={S.statLabel}>Total Downloads</div></div>
        <div style={S.statCard}><div style={S.statNum}>4</div><div style={S.statLabel}>Active Packages</div></div>
        <div style={S.statCard}><div style={S.statNum}>{fmtCowrie(34200)}</div><div style={S.statLabel}>Offline Revenue</div></div>
        <div style={S.statCard}><div style={S.statNum}>West Africa</div><div style={S.statLabel}>Top Region</div></div>
      </div>

      {/* Package Builder */}
      <div style={{ ...S.sectionTitle, marginTop: 14 }}>Offline Packages</div>
      <div style={{ ...S.card, borderStyle: 'dashed', borderColor: 'rgba(212,160,23,.3)' }}>
        {!showPackageBuilder ? (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{'\uD83D\uDCE6'}</div>
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 4 }}>Create a new offline package</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Bundle content for USB/SD card distribution</div>
            <button style={{ ...S.btn, background: '#d4a017', color: '#0d0804' }} onClick={() => setShowPackageBuilder(true)}>
              + Build Package
            </button>
          </div>
        ) : (
          <div className="ds-fade">
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: '#d4a017', marginBottom: 10 }}>Package Builder</div>
            <input style={{ ...S.input, marginBottom: 8 }} placeholder="Package name..." />
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Number of items..." type="number" />
              <select style={{ ...S.input, flex: 1 }}>
                <option>Films</option><option>Episodes</option><option>Tracks</option><option>Documentaries</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Price ({'\u20A1'})</label>
                <input style={S.input} placeholder="0 for free..." type="number" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Expiry Date</label>
                <input style={S.input} type="date" />
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Target Region</label>
              <select style={S.input}>
                <option>Pan-African</option><option>West Africa</option><option>East Africa</option>
                <option>Southern Africa</option><option>North Africa</option><option>Central Africa</option>
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>DRM Level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['None', 'Watermark', 'Encrypted'].map(drm => (
                  <label key={drm} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ccc', cursor: 'pointer' }}>
                    <input type="radio" name="drm" defaultChecked={drm === 'None'} /> {drm}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btn, background: '#333', color: '#f0f7f0', fontSize: 12 }} onClick={() => setShowPackageBuilder(false)}>Cancel</button>
              <button style={{ ...S.btn, background: '#d4a017', color: '#0d0804', fontSize: 12 }} onClick={() => setShowPackageBuilder(false)}>Create Package</button>
            </div>
          </div>
        )}
      </div>

      {/* Active Offline Packages */}
      <div style={{ ...S.sectionTitle, marginTop: 14 }}>Active Packages</div>
      {OFFLINE_PACKAGES.map(pkg => (
        <div key={pkg.id} style={{ ...S.card, position: 'relative' as const, overflow: 'hidden' }} className="ds-slide">
          <div className="ds-shimmer" />
          <div style={{ ...S.row, justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Sora, sans-serif' }}>{pkg.title}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                {pkg.items} {pkg.itemType} &middot; {pkg.region} &middot; DRM: {pkg.drm}
              </div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: pkg.free ? '#4ade80' : '#d4a017' }}>
                {pkg.free ? 'FREE' : fmtCowrie(pkg.price)}
              </div>
            </div>
          </div>
          <div style={{ ...S.row, marginTop: 10, justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 12, color: '#4ade80' }}>{'\u2B07'} {pkg.downloads.toLocaleString()} downloads</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ ...S.btn, background: 'rgba(255,255,255,.06)', color: '#f0f7f0', fontSize: 11, padding: '5px 12px' }}>QR Code</button>
              <button style={{ ...S.btn, background: 'rgba(212,160,23,.15)', color: '#d4a017', fontSize: 11, padding: '5px 12px' }}>Download Link</button>
            </div>
          </div>
        </div>
      ))}

      {/* Kiosk Partner Program */}
      <div style={{ ...S.sectionTitle, marginTop: 18 }}>Kiosk Partner Program</div>
      <div style={{ ...S.card, background: 'linear-gradient(135deg,rgba(74,222,128,.06),rgba(255,255,255,.03))', borderColor: 'rgba(74,222,128,.15)' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>
          Become an Offline Distributor
        </div>
        <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5, marginBottom: 12 }}>
          Set up a kiosk in your market or village. Load content onto USB drives and SD cards. Earn 30% commission on every sale. Creators and platform split the remaining 70% per royalty contract.
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' as const }}>
          {[
            { label: 'Your Commission', value: '30%', color: '#4ade80' },
            { label: 'Creator Share', value: '49%', color: '#d4a017' },
            { label: 'Platform Fee', value: '21%', color: '#888' },
          ].map(item => (
            <div key={item.label} style={{ flex: '1 1 28%', background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 10, textAlign: 'center' as const }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...S.btn, flex: 1, background: '#4ade80', color: '#0d0804', fontSize: 13 }}>Apply as Kiosk Partner</button>
          <button style={{ ...S.btn, flex: 1, background: 'rgba(255,255,255,.06)', color: '#f0f7f0', fontSize: 13 }}>Learn More</button>
        </div>
      </div>
    </div>
  )

  /* ── Countdown component ── */
  function CountdownBlock({ target }: { target: string }) {
    const left = useCountdown(target)
    const blocks = [
      { val: left.d, label: 'DAYS' },
      { val: left.h, label: 'HRS' },
      { val: left.m, label: 'MIN' },
      { val: left.s, label: 'SEC' },
    ]
    return (
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {blocks.map((b, i) => (
          <div key={i} style={{
            flex: 1, background: 'rgba(212,160,23,.08)', borderRadius: 8, padding: '6px 0',
            textAlign: 'center' as const, border: '1px solid rgba(212,160,23,.15)',
          }}>
            <div className="ds-countdown" style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: '#d4a017' }}>
              {String(b.val).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 9, color: '#888', letterSpacing: '.08em' }}>{b.label}</div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Tab 3: Premiere ── */
  const renderPremiere = () => (
    <div style={S.section} className="ds-fade">
      {/* Active Premieres */}
      <div style={S.sectionTitle}>Active Premieres</div>
      {PREMIERES.map(prem => {
        const expanded = expandedPremiere === prem.id
        const totalSold = prem.tiers.reduce((s, t) => s + t.sold, 0)
        return (
          <div key={prem.id} style={{ ...S.card, position: 'relative' as const, overflow: 'hidden', borderColor: expanded ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.08)' }} className="ds-slide">
            <div className="ds-shimmer" />
            <div
              style={{ cursor: 'pointer', position: 'relative', zIndex: 1 }}
              onClick={() => setExpandedPremiere(expanded ? null : prem.id)}
            >
              <div style={{ ...S.row, justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 800, color: '#f0f7f0' }}>{prem.title}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    {new Date(prem.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} &middot; {prem.venue}
                  </div>
                </div>
                <div style={{ fontSize: 16, color: '#d4a017', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>{'\u25BC'}</div>
              </div>
              <CountdownBlock target={prem.date} />
              <div style={{ ...S.row, marginTop: 8, gap: 16 }}>
                <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>{totalSold} tickets sold</span>
                <span style={{ fontSize: 12, color: '#d4a017', fontWeight: 700 }}>{fmtCowrie(prem.totalRevenue)} revenue</span>
              </div>
            </div>

            {expanded && (
              <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }} className="ds-fade">
                {/* Ticket Tiers */}
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700, color: '#d4a017', marginBottom: 8 }}>Ticket Tiers</div>
                {prem.tiers.map(tier => {
                  const pct = tier.cap > 0 ? (tier.sold / tier.cap) * 100 : 0
                  return (
                    <div key={tier.name} style={{ marginBottom: 10 }}>
                      <div style={{ ...S.row, justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.name} — {fmtCowrie(tier.price)}</span>
                        <span style={{ fontSize: 11, color: '#888' }}>{tier.sold}/{tier.cap} sold</span>
                      </div>
                      <div style={S.progBar}>
                        <div style={{ ...S.progFill, width: `${pct}%`, background: tier.color }} />
                      </div>
                    </div>
                  )
                })}

                {/* Revenue by tier */}
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700, color: '#d4a017', marginTop: 12, marginBottom: 8 }}>Revenue by Tier</div>
                {prem.tiers.map(tier => {
                  const rev = tier.sold * tier.price
                  const pct = prem.totalRevenue > 0 ? (rev / prem.totalRevenue) * 100 : 0
                  return (
                    <div key={tier.name} style={{ marginBottom: 8 }}>
                      <div style={{ ...S.row, justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: '#ccc' }}>{tier.name}</span>
                        <span style={{ fontSize: 11, color: '#d4a017', fontWeight: 700 }}>{fmtCowrie(rev)}</span>
                      </div>
                      <div style={S.progBar}>
                        <div className="ds-bar-grow" style={{ ...S.progFill, width: `${pct}%`, background: tier.color, ['--bar-w' as any]: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}

                {/* Geographic distribution */}
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700, color: '#d4a017', marginTop: 12, marginBottom: 8 }}>Attendee Geography</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                  {[
                    { country: 'Nigeria', pct: 42 }, { country: 'Ghana', pct: 18 },
                    { country: 'Kenya', pct: 15 }, { country: 'South Africa', pct: 12 },
                    { country: 'Diaspora', pct: 13 },
                  ].map(g => (
                    <div key={g.country} style={{ flex: '1 1 30%', background: 'rgba(212,160,23,.06)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#d4a017' }}>{g.pct}%</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{g.country}</div>
                    </div>
                  ))}
                </div>

                {/* Chat engagement */}
                <div style={{ ...S.row, marginTop: 12, gap: 12, flexWrap: 'wrap' as const }}>
                  {[
                    { label: 'Chat Messages', val: '2,847' },
                    { label: 'Peak Concurrent', val: '1,203' },
                    { label: 'Avg. Engagement', val: '73%' },
                  ].map(m => (
                    <div key={m.label} style={{ flex: '1 1 28%', background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: 8, textAlign: 'center' as const }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f7f0' }}>{m.val}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Create Premiere Form */}
      <div style={{ ...S.sectionTitle, marginTop: 18 }}>Create Premiere</div>
      <div style={{ ...S.card, borderStyle: 'dashed', borderColor: 'rgba(212,160,23,.3)' }}>
        {!showCreatePremiere ? (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{'\uD83C\uDFAC'}</div>
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 10 }}>Launch a premiere event with tiered ticketing</div>
            <button style={{ ...S.btn, background: '#d4a017', color: '#0d0804' }} onClick={() => setShowCreatePremiere(true)}>
              + Create Premiere
            </button>
          </div>
        ) : (
          <div className="ds-fade">
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: '#d4a017', marginBottom: 10 }}>New Premiere Event</div>
            <input style={{ ...S.input, marginBottom: 8 }} placeholder="Content title..." />
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Event Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Virtual', 'Hybrid', 'Village Screen'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ccc', cursor: 'pointer' }}>
                    <input type="radio" name="eventType" defaultChecked={t === 'Virtual'} /> {t}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Date</label>
                <input type="date" style={S.input} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>Time (WAT)</label>
                <input type="time" style={S.input} defaultValue="20:00" />
              </div>
            </div>

            {/* 4-Tier Pricing */}
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700, color: '#d4a017', marginTop: 6, marginBottom: 8 }}>Tier Pricing</div>
            {[
              { name: 'Standard', suggested: 50 },
              { name: 'Premium', suggested: 200 },
              { name: 'VIP', suggested: 500 },
              { name: 'Village Chief', suggested: 2000 },
            ].map(tier => (
              <div key={tier.name} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#ccc', width: 90 }}>{tier.name}</span>
                <input style={{ ...S.input, flex: 1 }} placeholder={`${'\u20A1'} ${tier.suggested}`} type="number" />
                <input style={{ ...S.input, width: 70 }} placeholder="Cap" type="number" />
              </div>
            ))}

            {/* Red Carpet Features */}
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700, color: '#d4a017', marginTop: 10, marginBottom: 8 }}>Red Carpet Features</div>
            {[
              { label: 'Live Chat', checked: true },
              { label: 'Q&A with Cast', checked: false },
              { label: 'Behind-the-Scenes', checked: false },
              { label: 'After-Party (Virtual Lounge)', checked: false },
            ].map((feat, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#ccc', marginBottom: 6, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={feat.checked} /> {feat.label}
              </label>
            ))}

            {/* Promo Code */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 10 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Promo code (optional)..." />
              <button style={{ ...S.btn, background: 'rgba(255,255,255,.06)', color: '#d4a017', fontSize: 11, padding: '5px 12px' }}>Generate</button>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btn, background: '#333', color: '#f0f7f0', fontSize: 12 }} onClick={() => setShowCreatePremiere(false)}>Cancel</button>
              <button style={{ ...S.btn, background: '#d4a017', color: '#0d0804', fontSize: 12 }} onClick={() => setShowCreatePremiere(false)}>Launch Premiere</button>
            </div>
          </div>
        )}
      </div>

      {/* Premiere Analytics */}
      <div style={{ ...S.sectionTitle, marginTop: 18 }}>Premiere Analytics</div>
      <div style={S.statRow}>
        <div style={S.statCard}><div style={S.statNum}>2,860</div><div style={S.statLabel}>Tickets Sold (All)</div></div>
        <div style={S.statCard}><div style={S.statNum}>{fmtCowrie(331500)}</div><div style={S.statLabel}>Total Revenue</div></div>
        <div style={S.statCard}><div style={S.statNum}>87%</div><div style={S.statLabel}>Sell-through Rate</div></div>
        <div style={S.statCard}><div style={S.statNum}>3</div><div style={S.statLabel}>Upcoming Events</div></div>
      </div>

      {/* TV Station Submissions */}
      <div style={{ ...S.sectionTitle, marginTop: 18 }}>TV Station Submissions</div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Submit content to traditional TV stations for broadcast syndication across Africa.</div>
      {TV_STATIONS.map(st => {
        const statusColor = st.status === 'Airing' ? '#4ade80' : st.status === 'Accepted' ? '#22d3ee' : st.status === 'Under Review' ? '#d4a017' : '#6b7280'
        const steps = ['Submitted', 'Under Review', 'Accepted', 'Airing']
        const currentIdx = steps.indexOf(st.status)
        return (
          <div key={st.name} style={S.card} className="ds-slide">
            <div style={{ ...S.row, justifyContent: 'space-between' }}>
              <div style={S.row}>
                <span style={{ fontSize: 22 }}>{st.flag}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{st.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{st.country}</div>
                </div>
              </div>
              <span style={{ ...S.badge, background: `${statusColor}18`, color: statusColor }}>{st.status}</span>
            </div>
            {/* Progress pipeline */}
            <div style={{ ...S.row, marginTop: 10, gap: 4 }}>
              {steps.map((step, si) => (
                <React.Fragment key={step}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: si <= currentIdx ? statusColor : 'rgba(255,255,255,.08)',
                    color: si <= currentIdx ? '#0d0804' : '#666',
                  }}>
                    {si <= currentIdx ? '\u2713' : si + 1}
                  </div>
                  {si < 3 && (
                    <div style={{ flex: 1, height: 2, background: si < currentIdx ? statusColor : 'rgba(255,255,255,.08)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ ...S.row, marginTop: 6, justifyContent: 'space-between', fontSize: 9, color: '#666' }}>
              {steps.map(s => <span key={s}>{s}</span>)}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 8, fontStyle: 'italic' }}>Terms: {st.terms}</div>
            {st.status === 'Submitted' && (
              <button
                style={{ ...S.btn, marginTop: 8, background: 'rgba(212,160,23,.15)', color: '#d4a017', width: '100%', fontSize: 12 }}
                onClick={() => setSubmitStation(submitStation === st.name ? null : st.name)}
              >
                Edit Submission
              </button>
            )}
            {submitStation === st.name && (
              <div style={{ marginTop: 8, padding: 10, background: 'rgba(255,255,255,.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }} className="ds-fade">
                <input style={{ ...S.input, marginBottom: 6 }} placeholder="Content title..." />
                <textarea style={{ ...S.input, height: 50, resize: 'none' as const, marginBottom: 6 }} placeholder="Additional notes for the station..." />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button style={{ ...S.btn, background: '#333', color: '#f0f7f0', fontSize: 11 }} onClick={() => setSubmitStation(null)}>Cancel</button>
                  <button style={{ ...S.btn, background: '#d4a017', color: '#0d0804', fontSize: 11 }} onClick={() => setSubmitStation(null)}>Update</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  /* ── render ── */
  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => router.back()}>{'\u2190'}</button>
        <div>
          <div style={S.title}>Distribution Engine</div>
          <div style={{ fontSize: 11, color: '#888' }}>Pan-African Distribution + Offline Sync + Premiere Ticketing</div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...S.tabBtn, ...(tab === t.key ? S.tabActive : S.tabInactive) }}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'channels' && renderChannels()}
      {tab === 'offline' && renderOffline()}
      {tab === 'premiere' && renderPremiere()}
    </div>
  )
}
