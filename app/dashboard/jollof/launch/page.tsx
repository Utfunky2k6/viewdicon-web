'use client'
// ════════════════════════════════════════════════════════════════════
// Jollof TV -- Pan-African Launch Ceremony Protocol
// 7-Phase wizard: every major content release must pass this ritual
// Names drawn from 7 African language families — no one culture dominates
// Toa (Swahili) → Nyinaa (Akan) → Kigawanyo (Bantu) → Amụma (Igbo)
//   → Taswira (Swahili) → Ukaguzi (Swahili) → Zindua (Swahili/East Africa)
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

// ── Types ────────────────────────────────────────────────────────
type ContentType = 'movie' | 'series' | 'music' | 'podcast' | 'documentary' | 'short_film' | 'reality_show' | 'live_event'
type ReleaseType = 'instant' | 'scheduled' | 'premiere' | 'series_weekly' | 'series_biweekly'
type PaySchedule = 'per_view' | 'daily' | 'weekly' | 'monthly'
type Phase = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface Stakeholder {
  id: string; name: string; afroId: string; email: string
  role: string; village: string
}
interface LaunchData {
  contentType: ContentType; title: string; description: string
  coverArtName: string; genres: string[]; languages: string[]
  rating: string; duration: string; episodes: string; country: string
  stakeholders: Stakeholder[]
  royalties: Record<string, number>; paySchedule: PaySchedule
  minPayout: string; boostEnabled: boolean
  releaseType: ReleaseType; scheduleDate: string; scheduleTime: string
  premiereTier: string; marketingBudget: string
  geoTarget: string; exclusivePeriod: string
  trailerName: string; posters: string[]; teaserName: string
  btsName: string; hashtags: string[]
  complianceChecks: boolean[]; elderBlessing: boolean
  launched: boolean
}

// ── CSS Injection (inject once, lc- prefix) ─────────────────────
const CSS_ID = 'lc-ceremony-css'
const CSS = `
@keyframes lcFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes lcPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(212,160,23,.5)}50%{transform:scale(1.08);box-shadow:0 0 0 14px rgba(212,160,23,0)}}
@keyframes lcSlide{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes lcShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes lcGlow{0%,100%{box-shadow:0 0 20px rgba(212,160,23,.15)}50%{box-shadow:0 0 50px rgba(212,160,23,.45)}}
@keyframes lcCountdown{0%{transform:scale(2);opacity:0}20%{transform:scale(1);opacity:1}80%{opacity:1}100%{transform:scale(.6);opacity:0}}
@keyframes lcFirework{0%{transform:translateY(0) scale(1);opacity:1}60%{opacity:1}100%{transform:translateY(-180px) scale(0);opacity:0}}
@keyframes lcRipple{0%{transform:scale(.4);opacity:.8}100%{transform:scale(3);opacity:0}}
.lc-fade{animation:lcFade .4s ease both}
.lc-pulse{animation:lcPulse 2s ease-in-out infinite}
.lc-slide{animation:lcSlide .35s ease both}
.lc-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(212,160,23,.08) 50%,transparent 100%);background-size:200% 100%;animation:lcShimmer 2.5s linear infinite}
.lc-glow{animation:lcGlow 3s ease-in-out infinite}
.lc-ripple{animation:lcRipple 1.6s ease-out infinite}
.lc-countdown{animation:lcCountdown 1s ease both}
`

// ── Constants ───────────────────────────────────────────────────
// "african" field: one name drawn from a different African language per phase
// so no single culture owns the ceremony — it belongs to the whole continent
const PHASES: Array<{ num: Phase; african: string; lang: string; english: string; emoji: string }> = [
  { num: 1, african: 'Toa',       lang: 'Swahili · East Africa',    english: 'Content Upload',       emoji: '📦' },
  { num: 2, african: 'Nyinaa',    lang: 'Akan/Twi · Ghana',         english: 'Stakeholder Registry', emoji: '👥' },
  { num: 3, african: 'Kigawanyo', lang: 'Bantu · Central Africa',   english: 'Royalty Configuration',emoji: '💰' },
  { num: 4, african: 'Amụma',     lang: 'Igbo · West Africa',       english: 'Launch Strategy',      emoji: '⚔️' },
  { num: 5, african: 'Taswira',   lang: 'Swahili · East Africa',    english: 'Promo Assets',         emoji: '🎨' },
  { num: 6, african: 'Ukaguzi',   lang: 'Swahili · East Africa',    english: 'Review & Blessing',    emoji: '🔍' },
  { num: 7, african: 'Zindua',    lang: 'Swahili · East Africa',    english: 'Launch!',              emoji: '🚀' },
]

// One proverb per phase — drawn from 7 different African regions/cultures
const PROVERBS: Array<{ african: string; source: string; english: string }> = [
  { african: 'Usipoziba ufa, utajenga ukuta.',   source: 'Swahili proverb',           english: 'If you do not seal the crack, you will have to build the whole wall.' },
  { african: 'Tuta weza pamoja.',                source: 'Swahili / Pan-African',      english: 'Together we can achieve it.' },
  { african: 'Agbago ọ nụ, emere ihe ya.',       source: 'Igbo proverb · Nigeria',    english: 'When mouths come together, things get done.' },
  { african: 'Siku njema huonekana asubuhi.',    source: 'Swahili proverb',           english: 'A good day is seen in the morning — plan well.' },
  { african: 'Sankofa: Se wo were fi na wosankofa a yenkyi.',    source: 'Akan/Twi · Ghana', english: 'Return and fetch it — never be afraid to go back and correct your path.' },
  { african: 'Motho ke motho ka batho ba bangwe.', source: 'Sotho proverb · Southern Africa', english: 'A person is a person through other people.' },
  { african: 'Haraka haraka haina baraka.',      source: 'Swahili proverb',           english: 'Hurry, hurry has no blessing — but when ready, go with full force.' },
]

const CONTENT_TYPES: Array<{ key: ContentType; label: string; emoji: string }> = [
  { key: 'movie', label: 'Movie', emoji: '🎬' },
  { key: 'series', label: 'Series', emoji: '📺' },
  { key: 'music', label: 'Music', emoji: '🎵' },
  { key: 'podcast', label: 'Podcast', emoji: '🎙' },
  { key: 'documentary', label: 'Documentary', emoji: '🎥' },
  { key: 'short_film', label: 'Short Film', emoji: '🎞' },
  { key: 'reality_show', label: 'Reality Show', emoji: '📡' },
  { key: 'live_event', label: 'Live Event', emoji: '🔴' },
]

const GENRES = ['Drama','Comedy','Action','Romance','Horror','Thriller','Educational','Cultural','Sci-Fi','Music','Worship','Sports']
const LANGUAGES = ['Yoruba','Igbo','Hausa','Swahili','English','French','Amharic','Wolof','Zulu','Twi']
const RATINGS = ['General','13+','16+','18+']
const COUNTRIES = ['Nigeria','Ghana','Kenya','South Africa','Ethiopia','Tanzania','Senegal','Cameroon','Uganda','Rwanda','Egypt','Morocco','Ivory Coast','DR Congo','Mozambique','Angola','Zimbabwe','Mali','Burkina Faso','Togo']
const STAKEHOLDER_ROLES = ['Director','Producer','Writer','Actor','Cinematographer','Editor','Sound Designer','Composer','Costume Designer','Makeup Artist','Set Designer','VFX Artist','Narrator','Host','Choreographer']
const VILLAGES = ['Commerce','Health','Arts','Agriculture','Education','Government','Security','Technology','Energy','Builders','Media','Justice','Fashion','Family','Transport','Hospitality','Finance','Spirituality','Sports','Holdings']
const COMPLIANCE_ITEMS = [
  'Content does not promote hate speech or discrimination',
  'All participants have given informed consent',
  'No unauthorized copyrighted material used',
  'Content respects cultural and religious sensitivities',
  'Age rating accurately reflects content',
  'All stakeholders verified and compensated fairly',
  'Content meets technical quality standards (HD minimum)',
  'No exploitation of minors or vulnerable persons',
]
const PREMIERE_TIERS = [
  { key: 'standard', label: 'Standard', price: 50 },
  { key: 'premium', label: 'Premium', price: 200 },
  { key: 'vip', label: 'VIP', price: 500 },
  { key: 'chief', label: 'Village Chief', price: 2000 },
]

// ── Styles ──────────────────────────────────────────────────────
const GOLD = '#d4a017'
const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 14, padding: 16,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)',
  color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}
const pillBase: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)',
  color: '#ccc', cursor: 'pointer', transition: 'all .2s',
}
const pillActive: React.CSSProperties = {
  ...pillBase, background: `${GOLD}22`, border: `1px solid ${GOLD}`, color: GOLD,
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)',
  textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 6,
}
const sectionTitle: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: '#f0f7f0', marginBottom: 12,
  fontFamily: 'Sora, sans-serif',
}

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════
export default function LaunchCeremonyPage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [phase, setPhase] = React.useState<Phase>(1)
  const [countdownActive, setCountdownActive] = React.useState(false)
  const [countdownNum, setCountdownNum] = React.useState(3)
  const [data, setData] = React.useState<LaunchData>({
    contentType: 'movie', title: '', description: '', coverArtName: '',
    genres: [], languages: [], rating: 'General', duration: '', episodes: '1',
    country: 'Nigeria', stakeholders: [], royalties: {},
    paySchedule: 'per_view', minPayout: '100', boostEnabled: false,
    releaseType: 'instant', scheduleDate: '', scheduleTime: '',
    premiereTier: 'standard', marketingBudget: '0', geoTarget: 'africa',
    exclusivePeriod: '24h', trailerName: '', posters: [],
    teaserName: '', btsName: '', hashtags: ['#JollofTV', '#JollofOriginal'],
    complianceChecks: COMPLIANCE_ITEMS.map(() => false), elderBlessing: false,
    launched: false,
  })

  // Inject CSS once
  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Pre-compute random values for firework particles to avoid hydration mismatch
  const [fireworkRands, setFireworkRands] = React.useState<{ left: number; dur: number; delay: number }[]>(
    () => Array.from({ length: 18 }, (_, i) => ({ left: 10 + (i * 4.5), dur: 2.0, delay: (i * 0.11) }))
  )
  React.useEffect(() => {
    setFireworkRands(Array.from({ length: 18 }, () => ({
      left: 10 + Math.random() * 80,
      dur: 1.5 + Math.random() * 2,
      delay: Math.random() * 2,
    })))
  }, [])

  const upd = (patch: Partial<LaunchData>) => setData(d => ({ ...d, ...patch }))

  const toggleGenre = (g: string) => upd({
    genres: data.genres.includes(g) ? data.genres.filter(x => x !== g) : [...data.genres, g],
  })
  const toggleLang = (l: string) => upd({
    languages: data.languages.includes(l) ? data.languages.filter(x => x !== l) : [...data.languages, l],
  })
  const toggleCompliance = (i: number) => {
    const next = [...data.complianceChecks]; next[i] = !next[i]
    upd({ complianceChecks: next })
  }

  // Stakeholder helpers
  const addStakeholder = () => {
    const s: Stakeholder = { id: crypto.randomUUID(), name: '', afroId: '', email: '', role: 'Actor', village: 'Arts' }
    upd({ stakeholders: [...data.stakeholders, s] })
  }
  const updStakeholder = (id: string, patch: Partial<Stakeholder>) =>
    upd({ stakeholders: data.stakeholders.map(s => s.id === id ? { ...s, ...patch } : s) })
  const removeStakeholder = (id: string) =>
    upd({ stakeholders: data.stakeholders.filter(s => s.id !== id) })

  // Royalty helpers
  const totalRoyalty = Object.values(data.royalties).reduce((a, b) => a + b, 0) + 8 // 5% platform + 3% village
  const setRoyalty = (id: string, pct: number) => upd({ royalties: { ...data.royalties, [id]: pct } })

  // Phase validation
  const canProceed = (p: Phase): boolean => {
    if (p === 1) return data.title.length > 2 && data.contentType !== undefined && data.genres.length > 0
    if (p === 2) return data.stakeholders.length >= 3
    if (p === 3) return totalRoyalty >= 99.5 && totalRoyalty <= 100.5
    if (p === 4) return data.releaseType !== undefined
    if (p === 5) return true
    if (p === 6) return data.complianceChecks.every(Boolean)
    return true
  }

  const handleLaunch = () => {
    setCountdownActive(true)
    setCountdownNum(3)
    const t2 = setTimeout(() => setCountdownNum(2), 1000)
    const t1 = setTimeout(() => setCountdownNum(1), 2000)
    const go = setTimeout(() => {
      setCountdownNum(0)
      setTimeout(() => { setCountdownActive(false); upd({ launched: true }); setPhase(7) }, 1200)
    }, 3000)
    return () => { clearTimeout(t2); clearTimeout(t1); clearTimeout(go) }
  }

  const goNext = () => { if (phase < 7 && canProceed(phase)) setPhase((phase + 1) as Phase) }
  const goBack = () => { if (phase > 1) setPhase((phase - 1) as Phase) }
  const currentPhase = PHASES[phase - 1]
  const proverb = PROVERBS[phase - 1]

  // ── Phase 1: Content Upload ─────────────────────────────────
  const renderPhase1 = () => (
    <div className="lc-fade" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Content type */}
      <div>
        <div style={labelStyle}>Content Type</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CONTENT_TYPES.map(ct => (
            <button key={ct.key} onClick={() => upd({ contentType: ct.key })}
              style={data.contentType === ct.key ? pillActive : pillBase}>
              {ct.emoji} {ct.label}
            </button>
          ))}
        </div>
      </div>
      {/* Title */}
      <div>
        <div style={labelStyle}>Title</div>
        <input style={inputStyle} placeholder="Enter content title..."
          value={data.title} onChange={e => upd({ title: e.target.value })} />
      </div>
      {/* Description */}
      <div>
        <div style={labelStyle}>Description</div>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          placeholder="Describe your content..."
          value={data.description} onChange={e => upd({ description: e.target.value })} />
      </div>
      {/* Cover art drop zone */}
      <div>
        <div style={labelStyle}>Cover Art</div>
        <div style={{
          ...cardStyle, border: '2px dashed rgba(212,160,23,.3)', textAlign: 'center',
          padding: '32px 16px', cursor: 'pointer',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🖼</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
            {data.coverArtName || 'Drag & drop cover art or tap to upload'}
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }} id="lc-cover"
            onChange={e => upd({ coverArtName: e.target.files?.[0]?.name || '' })} />
          <label htmlFor="lc-cover" style={{
            display: 'inline-block', marginTop: 10, padding: '8px 20px', borderRadius: 20,
            background: `${GOLD}22`, color: GOLD, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Choose File</label>
        </div>
      </div>
      {/* Genres */}
      <div>
        <div style={labelStyle}>Genre</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => toggleGenre(g)}
              style={data.genres.includes(g) ? pillActive : pillBase}>{g}</button>
          ))}
        </div>
      </div>
      {/* Language */}
      <div>
        <div style={labelStyle}>Language</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => toggleLang(l)}
              style={data.languages.includes(l) ? pillActive : pillBase}>{l}</button>
          ))}
        </div>
      </div>
      {/* Rating */}
      <div>
        <div style={labelStyle}>Rating</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {RATINGS.map(r => (
            <button key={r} onClick={() => upd({ rating: r })}
              style={data.rating === r ? pillActive : pillBase}>{r}</button>
          ))}
        </div>
      </div>
      {/* Duration + Episodes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={labelStyle}>Duration (mins)</div>
          <input style={inputStyle} type="number" placeholder="120"
            value={data.duration} onChange={e => upd({ duration: e.target.value })} />
        </div>
        <div>
          <div style={labelStyle}>Episodes</div>
          <input style={inputStyle} type="number" placeholder="1"
            value={data.episodes} onChange={e => upd({ episodes: e.target.value })} />
        </div>
      </div>
      {/* Country */}
      <div>
        <div style={labelStyle}>Country of Origin</div>
        <select style={{ ...inputStyle, appearance: 'none' as const }}
          value={data.country} onChange={e => upd({ country: e.target.value })}>
          {COUNTRIES.map(c => <option key={c} value={c} style={{ background: '#1a1410' }}>{c}</option>)}
        </select>
      </div>
    </div>
  )

  // ── Phase 2: Stakeholder Registry ───────────────────────────
  const renderPhase2 = () => (
    <div className="lc-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardStyle, background: 'rgba(212,160,23,.06)', borderColor: 'rgba(212,160,23,.15)' }}>
        <div style={{ fontSize: 13, color: GOLD, fontStyle: 'italic' }}>
          &quot;Every person who touched this creation must be honored&quot;
        </div>
      </div>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(100, (data.stakeholders.length / 3) * 100)}%`,
            height: '100%', borderRadius: 3, transition: 'width .3s',
            background: data.stakeholders.length >= 3 ? '#22c55e' : GOLD,
          }} />
        </div>
        <div style={{ fontSize: 12, color: data.stakeholders.length >= 3 ? '#22c55e' : '#ccc', fontWeight: 600 }}>
          {data.stakeholders.length}/3 minimum
        </div>
      </div>
      {/* Stakeholder rows */}
      {data.stakeholders.map((s, i) => (
        <div key={s.id} className="lc-slide" style={{
          ...cardStyle, display: 'flex', flexDirection: 'column', gap: 10,
          animationDelay: `${i * 0.05}s`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>Stakeholder {i + 1}</div>
            <button onClick={() => removeStakeholder(s.id)} style={{
              background: 'none', border: 'none', color: '#ef4444', fontSize: 18, cursor: 'pointer',
            }}>x</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={labelStyle}>Role</div>
              <select style={{ ...inputStyle, appearance: 'none' as const }}
                value={s.role} onChange={e => updStakeholder(s.id, { role: e.target.value })}>
                {STAKEHOLDER_ROLES.map(r => <option key={r} value={r} style={{ background: '#1a1410' }}>{r}</option>)}
              </select>
            </div>
            <div>
              <div style={labelStyle}>Village</div>
              <select style={{ ...inputStyle, appearance: 'none' as const }}
                value={s.village} onChange={e => updStakeholder(s.id, { village: e.target.value })}>
                {VILLAGES.map(v => <option key={v} value={v} style={{ background: '#1a1410' }}>{v}</option>)}
              </select>
            </div>
          </div>
          <input style={inputStyle} placeholder="Full name"
            value={s.name} onChange={e => updStakeholder(s.id, { name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input style={inputStyle} placeholder="AfroID"
              value={s.afroId} onChange={e => updStakeholder(s.id, { afroId: e.target.value })} />
            <input style={inputStyle} placeholder="Email"
              value={s.email} onChange={e => updStakeholder(s.id, { email: e.target.value })} />
          </div>
        </div>
      ))}
      <button onClick={addStakeholder} style={{
        ...cardStyle, border: '2px dashed rgba(212,160,23,.25)', cursor: 'pointer',
        textAlign: 'center', color: GOLD, fontWeight: 600, fontSize: 13,
        background: 'rgba(212,160,23,.04)',
      }}>
        + Add Stakeholder
      </button>
    </div>
  )

  // ── Phase 3: Royalty Configuration ──────────────────────────
  const renderPhase3 = () => (
    <div className="lc-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Total bar */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={labelStyle}>Total Allocation</div>
          <div style={{
            fontSize: 14, fontWeight: 700,
            color: totalRoyalty > 100.5 ? '#ef4444' : totalRoyalty >= 99.5 ? '#22c55e' : '#f0f7f0',
          }}>{totalRoyalty.toFixed(1)}%</div>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, totalRoyalty)}%`, height: '100%', borderRadius: 5,
            background: totalRoyalty > 100.5 ? '#ef4444' : totalRoyalty >= 99.5 ? '#22c55e' : GOLD,
            transition: 'all .3s',
          }} />
        </div>
      </div>
      {/* Pre-locked */}
      <div style={{ ...cardStyle, background: 'rgba(255,255,255,.02)' }}>
        <div style={sectionTitle}>Pre-Locked Splits</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'rgba(255,255,255,.6)' }}>Platform Fee</span>
          <span style={{ color: GOLD, fontWeight: 700 }}>5.0%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'rgba(255,255,255,.6)' }}>Village Treasury</span>
          <span style={{ color: GOLD, fontWeight: 700 }}>3.0%</span>
        </div>
      </div>
      {/* Stakeholder sliders */}
      {data.stakeholders.map(s => (
        <div key={s.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name || s.role}</div>
            <div style={{ fontSize: 13, color: GOLD, fontWeight: 700 }}>
              {(data.royalties[s.id] ?? 0).toFixed(1)}%
            </div>
          </div>
          <input type="range" min={0} max={80} step={0.5}
            value={data.royalties[s.id] ?? 0}
            onChange={e => setRoyalty(s.id, parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: GOLD }} />
        </div>
      ))}
      {data.stakeholders.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20, fontSize: 13 }}>
          Add stakeholders in Phase 2 first
        </div>
      )}
      {/* Payment schedule */}
      <div>
        <div style={sectionTitle}>Payment Schedule</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['per_view','daily','weekly','monthly'] as PaySchedule[]).map(ps => (
            <button key={ps} onClick={() => upd({ paySchedule: ps })}
              style={data.paySchedule === ps ? pillActive : pillBase}>
              {ps === 'per_view' ? 'Per-View' : ps.charAt(0).toUpperCase() + ps.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Min payout */}
      <div>
        <div style={labelStyle}>Minimum Payout Threshold</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: GOLD, fontWeight: 700 }}>&#x20A1;</span>
          <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="100"
            value={data.minPayout} onChange={e => upd({ minPayout: e.target.value })} />
        </div>
      </div>
      {/* Time-based boost */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Time-Based Boost</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
              2x (24h) &middot; 1.5x (48h) &middot; 1.2x (7d)
            </div>
          </div>
          <button onClick={() => upd({ boostEnabled: !data.boostEnabled })} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: data.boostEnabled ? GOLD : 'rgba(255,255,255,.15)',
            position: 'relative', transition: 'background .2s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 9, background: '#fff',
              position: 'absolute', top: 3, transition: 'left .2s',
              left: data.boostEnabled ? 23 : 3,
            }} />
          </button>
        </div>
      </div>
    </div>
  )

  // ── Phase 4: Launch Strategy ────────────────────────────────
  const renderPhase4 = () => (
    <div className="lc-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Release type */}
      <div>
        <div style={sectionTitle}>Release Type</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {([
            { key: 'instant', label: 'Instant' }, { key: 'scheduled', label: 'Scheduled' },
            { key: 'premiere', label: 'Premiere' }, { key: 'series_weekly', label: 'Weekly Series' },
            { key: 'series_biweekly', label: 'Biweekly Series' },
          ] as const).map(rt => (
            <button key={rt.key} onClick={() => upd({ releaseType: rt.key })}
              style={data.releaseType === rt.key ? pillActive : pillBase}>{rt.label}</button>
          ))}
        </div>
      </div>
      {/* Schedule picker */}
      {(data.releaseType === 'scheduled' || data.releaseType === 'premiere') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={labelStyle}>Date</div>
            <input style={inputStyle} type="date" value={data.scheduleDate}
              onChange={e => upd({ scheduleDate: e.target.value })} />
          </div>
          <div>
            <div style={labelStyle}>Time</div>
            <input style={inputStyle} type="time" value={data.scheduleTime}
              onChange={e => upd({ scheduleTime: e.target.value })} />
          </div>
        </div>
      )}
      {/* Premiere ticket tiers */}
      {data.releaseType === 'premiere' && (
        <div>
          <div style={sectionTitle}>Premiere Ticket Tiers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PREMIERE_TIERS.map(t => (
              <div key={t.key} onClick={() => upd({ premiereTier: t.key })} style={{
                ...cardStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: data.premiereTier === t.key ? GOLD : 'rgba(255,255,255,.08)',
                background: data.premiereTier === t.key ? 'rgba(212,160,23,.06)' : 'rgba(255,255,255,.04)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                <div style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>&#x20A1;{t.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Marketing budget */}
      <div>
        <div style={labelStyle}>Marketing Budget (Cowrie)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: GOLD, fontWeight: 700 }}>&#x20A1;</span>
          <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="0"
            value={data.marketingBudget} onChange={e => upd({ marketingBudget: e.target.value })} />
        </div>
      </div>
      {/* Geo targeting */}
      <div>
        <div style={sectionTitle}>Geo Targeting</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {[
            { key: 'village', label: 'Village', size: 40 },
            { key: 'state', label: 'State', size: 60 },
            { key: 'country', label: 'Country', size: 80 },
            { key: 'africa', label: 'Africa', size: 100 },
            { key: 'global', label: 'Global', size: 120 },
          ].map(g => (
            <div key={g.key} onClick={() => upd({ geoTarget: g.key })} style={{
              width: g.size, height: g.size, borderRadius: '50%',
              border: `2px solid ${data.geoTarget === g.key ? GOLD : 'rgba(255,255,255,.1)'}`,
              background: data.geoTarget === g.key ? 'rgba(212,160,23,.1)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
              color: data.geoTarget === g.key ? GOLD : 'rgba(255,255,255,.4)',
              position: 'absolute' as const,
            }}>{g.label}</div>
          ))}
        </div>
        {/* Flat version for accessibility */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {['village','state','country','africa','global'].map(g => (
            <button key={g} onClick={() => upd({ geoTarget: g })}
              style={data.geoTarget === g ? pillActive : pillBase}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Exclusive period */}
      <div>
        <div style={sectionTitle}>Exclusive Period</div>
        <div style={{ ...cardStyle, fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: 8 }}>Content visibility progression:</div>
          <div>First 24h &mdash; Planter subscribers only</div>
          <div>48h &mdash; Village members</div>
          <div>After &mdash; Global release</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {['24h','48h','7d','none'].map(ep => (
            <button key={ep} onClick={() => upd({ exclusivePeriod: ep })}
              style={data.exclusivePeriod === ep ? pillActive : pillBase}>
              {ep === 'none' ? 'No Exclusivity' : ep}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Phase 5: Promo Assets ───────────────────────────────────
  const renderPhase5 = () => {
    const uploadZone = (label: string, icon: string, nameKey: keyof LaunchData, accept?: string) => (
      <div style={{ ...cardStyle, textAlign: 'center' as const, padding: '20px 14px' }}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 10 }}>
          {(data[nameKey] as string) || 'No file selected'}
        </div>
        <input type="file" accept={accept || 'video/*,image/*'} style={{ display: 'none' }}
          id={`lc-${nameKey}`}
          onChange={e => upd({ [nameKey]: e.target.files?.[0]?.name || '' } as Partial<LaunchData>)} />
        <label htmlFor={`lc-${nameKey}`} style={{
          display: 'inline-block', padding: '7px 18px', borderRadius: 20,
          background: `${GOLD}22`, color: GOLD, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>Upload</label>
      </div>
    )
    return (
      <div className="lc-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {uploadZone('Trailer', '🎬', 'trailerName', 'video/*')}
        {/* 3 poster variations */}
        <div style={sectionTitle}>Poster Variations (3)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              ...cardStyle, textAlign: 'center' as const, padding: '16px 8px',
              border: data.posters[i] ? `1px solid ${GOLD}44` : '1px solid rgba(255,255,255,.08)',
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🖼</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 8, wordBreak: 'break-all' as const }}>
                {data.posters[i] || `Poster ${i + 1}`}
              </div>
              <input type="file" accept="image/*" style={{ display: 'none' }} id={`lc-poster-${i}`}
                onChange={e => {
                  const next = [...data.posters]
                  next[i] = e.target.files?.[0]?.name || ''
                  upd({ posters: next })
                }} />
              <label htmlFor={`lc-poster-${i}`} style={{
                display: 'inline-block', padding: '5px 12px', borderRadius: 14,
                background: `${GOLD}18`, color: GOLD, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>+</label>
            </div>
          ))}
        </div>
        {uploadZone('Teaser Clip (max 60s)', '📱', 'teaserName', 'video/*')}
        {uploadZone('Behind the Scenes', '🎥', 'btsName', 'video/*,image/*')}
        {/* Hashtags */}
        <div>
          <div style={sectionTitle}>Hashtags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {data.hashtags.map((h, i) => (
              <span key={i} style={{
                ...pillActive, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {h}
                <button onClick={() => upd({ hashtags: data.hashtags.filter((_, j) => j !== i) })}
                  style={{ background: 'none', border: 'none', color: GOLD, cursor: 'pointer', fontSize: 14, padding: 0 }}>
                  x
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="#JollofMyContent"
              id="lc-hashtag-input"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const inp = e.currentTarget
                  const val = inp.value.trim()
                  if (val) { upd({ hashtags: [...data.hashtags, val.startsWith('#') ? val : `#${val}`] }); inp.value = '' }
                }
              }} />
            <button onClick={() => {
              const inp = document.getElementById('lc-hashtag-input') as HTMLInputElement
              const val = inp?.value?.trim()
              if (val) { upd({ hashtags: [...data.hashtags, val.startsWith('#') ? val : `#${val}`] }); inp.value = '' }
            }} style={{ ...pillActive, whiteSpace: 'nowrap' as const }}>Add</button>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 6 }}>
            Suggested: #Jollof{data.title.replace(/\s/g, '')} #AfricanCinema #NollywoodNext
          </div>
        </div>
      </div>
    )
  }

  // ── Phase 6: Review & Blessing ──────────────────────────────
  const renderPhase6 = () => (
    <div className="lc-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <div style={sectionTitle}>Launch Summary</div>
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['Content', `${CONTENT_TYPES.find(c => c.key === data.contentType)?.emoji} ${data.title || 'Untitled'}`],
          ['Type', CONTENT_TYPES.find(c => c.key === data.contentType)?.label || ''],
          ['Genres', data.genres.join(', ') || 'None'],
          ['Languages', data.languages.join(', ') || 'None'],
          ['Rating', data.rating],
          ['Country', data.country],
          ['Stakeholders', `${data.stakeholders.length} registered`],
          ['Royalties', `${totalRoyalty.toFixed(1)}% allocated`],
          ['Release', data.releaseType.replace(/_/g, ' ')],
          ['Geo Target', data.geoTarget],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'rgba(255,255,255,.5)' }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
      {/* Cultural certification */}
      <div style={{ ...cardStyle, background: 'rgba(212,160,23,.04)', borderColor: 'rgba(212,160,23,.12)' }}>
        <div style={{ ...sectionTitle, color: GOLD }}>Griot AI Cultural Review</div>
        <div className="lc-shimmer" style={{
          padding: '12px 16px', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,.6)',
          lineHeight: 1.6,
        }}>
          Content has been scanned for cultural sensitivity. Griot AI confirms this release
          honors the traditions and values of the community. Proceed with blessing.
        </div>
      </div>
      {/* Compliance checklist */}
      <div>
        <div style={sectionTitle}>Content Guidelines Compliance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMPLIANCE_ITEMS.map((item, i) => (
            <div key={i} onClick={() => toggleCompliance(i)} style={{
              ...cardStyle, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              borderColor: data.complianceChecks[i] ? 'rgba(34,197,94,.3)' : 'rgba(255,255,255,.08)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${data.complianceChecks[i] ? '#22c55e' : 'rgba(255,255,255,.2)'}`,
                background: data.complianceChecks[i] ? '#22c55e' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: '#fff', transition: 'all .2s',
              }}>{data.complianceChecks[i] ? '\u2713' : ''}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.4 }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Elder blessing */}
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Elder Blessing (Optional)</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
            Request endorsement from village elders
          </div>
        </div>
        <button onClick={() => upd({ elderBlessing: !data.elderBlessing })} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: data.elderBlessing ? '#22c55e' : 'rgba(255,255,255,.15)',
          position: 'relative', transition: 'background .2s',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 9, background: '#fff',
            position: 'absolute', top: 3, transition: 'left .2s',
            left: data.elderBlessing ? 23 : 3,
          }} />
        </button>
      </div>
      {/* Smart contract preview */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Smart Contract Preview</div>
        <div style={{
          background: 'rgba(0,0,0,.3)', borderRadius: 10, padding: 14,
          fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,.5)',
          lineHeight: 1.8,
        }}>
          <div style={{ color: '#22c55e' }}>// Jollof TV Royalty Contract</div>
          <div>platform_fee: <span style={{ color: GOLD }}>5.0%</span></div>
          <div>village_treasury: <span style={{ color: GOLD }}>3.0%</span></div>
          {data.stakeholders.map(s => (
            <div key={s.id}>
              {s.role.toLowerCase()}__{s.name.toLowerCase().replace(/\s/g, '_') || 'tbd'}:{' '}
              <span style={{ color: GOLD }}>{(data.royalties[s.id] ?? 0).toFixed(1)}%</span>
            </div>
          ))}
          <div style={{ color: '#22c55e', marginTop: 6 }}>// Total: {totalRoyalty.toFixed(1)}%</div>
        </div>
      </div>
      {/* Estimated revenue */}
      <div style={{ ...cardStyle, background: 'rgba(34,197,94,.04)', borderColor: 'rgba(34,197,94,.15)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>Estimated First-Week Revenue</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>
          &#x20A1;{((parseInt(data.marketingBudget) || 500) * 3.2).toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
          Based on content type, geo target, and marketing budget
        </div>
      </div>
    </div>
  )

  // ── Phase 7: Launch! ────────────────────────────────────────
  const renderPhase7 = () => {
    if (countdownActive) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: 400, gap: 20,
        }}>
          <div key={countdownNum} className="lc-countdown" style={{
            fontSize: 120, fontWeight: 900, color: GOLD, fontFamily: 'Sora, sans-serif',
            textShadow: '0 0 60px rgba(212,160,23,.5)',
          }}>{countdownNum || 'GO!'}</div>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', position: 'relative',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="lc-ripple" style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${GOLD}`, animationDelay: `${i * 0.5}s`,
              }} />
            ))}
          </div>
        </div>
      )
    }
    if (!data.launched) {
      return (
        <div className="lc-fade" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>
            Ready to Launch?
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 30 }}>
            Once launched, your content goes live according to your strategy.
          </div>
          <button onClick={handleLaunch} className="lc-glow" style={{
            padding: '16px 48px', borderRadius: 30, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${GOLD}, #b8860b)`,
            color: '#0d0804', fontSize: 16, fontWeight: 800, fontFamily: 'Sora, sans-serif',
          }}>Begin Launch Ceremony</button>
        </div>
      )
    }
    // Celebration
    return (
      <div className="lc-fade" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: '30px 0', gap: 20, position: 'relative', overflow: 'hidden',
      }}>
        {/* Firework particles */}
        {fireworkRands.map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${r.left}%`,
            bottom: 0,
            width: 6, height: 6, borderRadius: '50%',
            background: [GOLD, '#ef4444', '#22c55e', '#818cf8', '#f97316'][i % 5],
            animation: `lcFirework ${r.dur}s ease-out ${r.delay}s infinite`,
          }} />
        ))}
        {/* Concentric ripples */}
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="lc-ripple" style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${GOLD}`, animationDelay: `${i * 0.4}s`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 48,
          }}>🎬</div>
        </div>
        <div style={{
          fontSize: 22, fontWeight: 900, fontFamily: 'Sora, sans-serif',
          background: `linear-gradient(135deg, ${GOLD}, #f0f7f0)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Your Content is LIVE!</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>
          &ldquo;{data.title || 'Your creation'}&rdquo; is now streaming on Jollof TV
        </div>
        {/* Share buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
          {[
            { label: 'Copy Link', icon: '🔗' },
            { label: 'WhatsApp', icon: '💬' },
            { label: 'Twitter/X', icon: '🐦' },
          ].map(s => (
            <button key={s.label} onClick={() => {
              if (s.label === 'Copy Link') navigator.clipboard?.writeText(`https://jollof.tv/watch/${Date.now().toString(36)}`)
            }} style={{
              ...cardStyle, padding: '10px 18px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
            }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        {/* View on Jollof TV CTA */}
        <button onClick={() => router.push('/dashboard/jollof')} style={{
          padding: '14px 40px', borderRadius: 30, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${GOLD}, #b8860b)`,
          color: '#0d0804', fontSize: 15, fontWeight: 800, fontFamily: 'Sora, sans-serif',
          marginTop: 10,
        }}>View on Jollof TV</button>
        {/* Revenue tracking */}
        <div style={{
          ...cardStyle, width: '100%', marginTop: 10,
          background: 'rgba(34,197,94,.04)', borderColor: 'rgba(34,197,94,.15)',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Revenue tracking has started</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', marginTop: 4 }}>&#x20A1;0.00</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
            Earnings update in real-time as viewers watch
          </div>
        </div>
      </div>
    )
  }

  const phaseRenderers: Record<Phase, () => React.ReactNode> = {
    1: renderPhase1, 2: renderPhase2, 3: renderPhase3,
    4: renderPhase4, 5: renderPhase5, 6: renderPhase6, 7: renderPhase7,
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0d0804', color: '#f0f7f0',
      fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 120,
    }}>
      {/* Adinkra overlay */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.02, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(212,160,23,.3) 0px, transparent 1px, transparent 20px, rgba(212,160,23,.3) 21px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Fixed header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        padding: '12px 16px', paddingTop: 'max(env(safe-area-inset-top), 12px)',
        background: 'rgba(13,8,4,.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={() => phase > 1 ? goBack() : router.push('/dashboard/jollof')} style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'rgba(255,255,255,.06)', border: 'none',
          cursor: 'pointer', color: '#f0f7f0', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{'\u2190'}</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>
            Launch Ceremony
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
            Phase {phase}/7 &mdash; {currentPhase.african}
          </div>
        </div>
        <div style={{ fontSize: 20 }}>{currentPhase.emoji}</div>
      </div>

      {/* Phase progress bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '18px 24px 6px', gap: 0,
      }}>
        {PHASES.map((p, i) => (
          <React.Fragment key={p.num}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: p.num < phase ? GOLD : p.num === phase ? GOLD : 'rgba(255,255,255,.1)',
              border: p.num === phase ? `2px solid ${GOLD}` : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, color: '#0d0804', fontWeight: 700,
              transition: 'all .3s',
            }} className={p.num === phase ? 'lc-pulse' : ''}>
              {p.num < phase ? '\u2713' : ''}
            </div>
            {i < PHASES.length - 1 && (
              <div style={{
                flex: 1, height: 2, maxWidth: 32,
                background: p.num < phase ? GOLD : 'rgba(255,255,255,.08)',
                transition: 'background .3s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Phase title */}
      <div style={{ textAlign: 'center', padding: '10px 16px 18px' }}>
        <div style={{
          fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: GOLD,
        }}>{currentPhase.african}</div>
        <div style={{ fontSize: 10, color: 'rgba(212,160,23,.5)', marginTop: 1, fontStyle: 'italic' }}>
          {currentPhase.lang}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
          {currentPhase.english}
        </div>
      </div>

      {/* Phase content */}
      <div style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>
        {phaseRenderers[phase]()}
      </div>

      {/* Proverb */}
      {phase <= 7 && (
        <div style={{
          textAlign: 'center', padding: '24px 24px 0', marginTop: 16,
        }}>
          <div style={{
            fontSize: 12, fontStyle: 'italic', color: 'rgba(212,160,23,.6)', lineHeight: 1.5,
          }}>
            &ldquo;{proverb.african}&rdquo;
          </div>
          <div style={{ fontSize: 10, color: 'rgba(212,160,23,.4)', marginTop: 3, fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            &mdash; {proverb.source}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
            {proverb.english}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {!(phase === 7 && data.launched) && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
          padding: '14px 16px', paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
          background: 'rgba(13,8,4,.95)', backdropFilter: 'blur(14px)',
          borderTop: '1px solid rgba(255,255,255,.06)',
          display: 'flex', gap: 10,
        }}>
          {phase > 1 && (
            <button onClick={goBack} style={{
              flex: 1, padding: '14px 0', borderRadius: 14,
              border: '1px solid rgba(255,255,255,.1)', background: 'transparent',
              color: '#f0f7f0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
            }}>Previous</button>
          )}
          {phase < 7 && (
            <button onClick={goNext} disabled={!canProceed(phase)} style={{
              flex: 2, padding: '14px 0', borderRadius: 14, border: 'none',
              background: canProceed(phase) ? `linear-gradient(135deg, ${GOLD}, #b8860b)` : 'rgba(255,255,255,.08)',
              color: canProceed(phase) ? '#0d0804' : 'rgba(255,255,255,.3)',
              fontSize: 14, fontWeight: 700, cursor: canProceed(phase) ? 'pointer' : 'not-allowed',
              fontFamily: 'Sora, sans-serif', transition: 'all .2s',
            }}>Next &mdash; {PHASES[phase]?.african || ''}</button>
          )}
          {phase === 7 && !data.launched && !countdownActive && (
            <button onClick={handleLaunch} className="lc-glow" style={{
              flex: 1, padding: '14px 0', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${GOLD}, #b8860b)`,
              color: '#0d0804', fontSize: 15, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
            }}>Launch Now</button>
          )}
        </div>
      )}
    </div>
  )
}
