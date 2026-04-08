'use client'
// ═══════════════════════════════════════════════════════════════════════════
// 💼 ÀJỌ CONNECT — Profile Creation
// 4-step wizard: Profile Type → Core Info → Skills & Rates → Portfolio
// ═══════════════════════════════════════════════════════════════════════════

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ajoConnectApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

// ── Design tokens ─────────────────────────────────────────────────────────
const T = {
  bg: '#07090a', card: '#0d1117', card2: '#111820',
  border: 'rgba(255,255,255,.07)',
  blue: '#3B82F6', blueLight: '#60a5fa',
  blueDim: 'rgba(59,130,246,.12)',
  gold: '#D4AF37', green: '#22C55E', purple: '#a78bfa',
  white: '#FFFFFF', dim: 'rgba(255,255,255,.55)', dim2: 'rgba(255,255,255,.28)', dim3: 'rgba(255,255,255,.10)',
}

// ── Step meta ─────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Profile Type', icon: '🏷' },
  { label: 'Core Info',    icon: '👤' },
  { label: 'Skills & Rates', icon: '💰' },
  { label: 'Portfolio',    icon: '🗂' },
]

// ── Profile Types ─────────────────────────────────────────────────────────
const PROFILE_TYPES = [
  { key: 'EVENT_HOST',       icon: '🎪', label: 'Event Host/Hostess',        color: '#f472b6', desc: 'Luxury event MC, host, or hostess for corporate and social events' },
  { key: 'TRAVEL_GUIDE',     icon: '🗺', label: 'Travel & Cultural Guide',    color: '#60a5fa', desc: 'Heritage site tours, city orientation, travel companion' },
  { key: 'INTERPRETER',      icon: '🗣', label: 'Interpreter & Translator',   color: T.gold,   desc: 'Real-time interpretation, document translation, dialect coaching' },
  { key: 'BUSINESS_CONNECTOR',icon: '🤝',label: 'Business Connector',         color: '#a78bfa', desc: 'Professional introductions, investor access, deal facilitation' },
  { key: 'MENTOR',           icon: '🎓', label: 'Career Mentor',              color: T.green,  desc: 'Career guidance, industry coaching, mentorship programs' },
  { key: 'CULTURAL_EDUCATOR',icon: '🏛', label: 'Cultural Educator',          color: '#f97316', desc: 'Teach African languages, traditions, customs, and history' },
  { key: 'SKILL_TRAINER',    icon: '🛠', label: 'Skill Trainer',              color: '#e879f9', desc: 'Hands-on craft, technical, or artisan skill transfer' },
  { key: 'NETWORKING_AGENT', icon: '🌐', label: 'Networking Agent',           color: '#22d3ee', desc: 'Build professional circles, facilitate introductions and collaborations' },
  { key: 'DIASPORA_GUIDE',   icon: '✈️', label: 'Diaspora Return Guide',      color: '#4ade80', desc: 'Specialist in helping diaspora Africans relocate and reintegrate' },
  { key: 'WELLNESS_GUIDE',   icon: '🌿', label: 'Wellness & Lifestyle Guide', color: '#86efac', desc: 'Traditional healing, fitness culture, wellness tourism guides' },
  { key: 'CREATIVE_PARTNER', icon: '🎨', label: 'Creative Collaborator',      color: '#fb923c', desc: 'Film, music, photography, or fashion industry collaborations' },
  { key: 'PROTOCOL_OFFICER', icon: '🎖', label: 'Protocol & Etiquette Officer',color: T.gold,  desc: 'State/corporate event protocol, diplomatic etiquette coaching' },
  { key: 'SPORTS_COMPANION', icon: '⚽', label: 'Sports & Adventure Companion',color: '#22c55e', desc: 'African sports tourism, adventure tours, athlete networking' },
  { key: 'FOOD_GUIDE',       icon: '🍲', label: 'Culinary & Food Guide',      color: '#f59e0b', desc: 'Restaurant curation, street food tours, cooking tutors' },
  { key: 'FASHION_STYLIST',  icon: '👗', label: 'Fashion & Style Consultant', color: '#ec4899', desc: 'African fashion styling, wardrobe curation, fabric sourcing' },
  { key: 'LEGAL_COMPANION',  icon: '⚖️', label: 'Legal & Notary Companion',   color: '#94a3b8', desc: 'Navigate local legal procedures, document witnessing, notary services' },
]

// ── Industry options ───────────────────────────────────────────────────────
const INDUSTRIES = [
  'Finance & Banking', 'Technology', 'Media & Entertainment', 'Health & Wellness',
  'Agriculture', 'Government & Policy', 'Education', 'Fashion & Textiles',
  'Tourism & Hospitality', 'Energy', 'Legal', 'Real Estate', 'Sports',
  'Creative Arts', 'Diaspora Services', 'Trade & Commerce',
]

// ── Availability options ───────────────────────────────────────────────────
const AVAILABILITY = [
  { key: 'FULL_TIME', label: 'Full-time Available' },
  { key: 'WEEKDAYS',  label: 'Weekdays Only'       },
  { key: 'WEEKENDS',  label: 'Weekends Only'       },
  { key: 'EVENINGS',  label: 'Evenings Only'       },
  { key: 'BY_REQUEST',label: 'By Request Only'     },
]

// ── Price types ────────────────────────────────────────────────────────────
const PRICE_TYPES = [
  { key: 'HOURLY',      label: 'Per Hour',    icon: '⏱' },
  { key: 'DAILY',       label: 'Per Day',     icon: '📅' },
  { key: 'PER_EVENT',   label: 'Per Event',   icon: '🎪' },
  { key: 'PER_SESSION', label: 'Per Session', icon: '🎓' },
  { key: 'FREE',        label: 'Free / Exchange', icon: '🤝' },
]

// ── Tag bank ───────────────────────────────────────────────────────────────
const ALL_TAGS = [
  'bilingual', 'trilingual', 'luxury', 'corporate', 'diaspora',
  'female-only', 'male-only', 'senior-friendly', 'student-friendly',
  'government-protocol', 'vip', 'overnight-trips', 'day-trips',
  'group-sessions', 'one-on-one', 'virtual-ok', 'in-person-only',
]

// ── Input component ────────────────────────────────────────────────────────
function Input({
  label, value, onChange, placeholder = '', type = 'text', rows,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; rows?: number
}) {
  const style: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10,
    color: T.white, fontFamily: 'monospace', fontSize: 12,
    boxSizing: 'border-box', outline: 'none',
    ...(rows ? {} : {}),
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 6 }}>{label}</label>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...style, resize: 'none' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={style}
        />
      )}
    </div>
  )
}

// ── Select component ───────────────────────────────────────────────────────
function Select({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '12px 14px',
          background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10,
          color: T.white, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box',
        }}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function AjoCreateProfilePage() {
  const router = useRouter()

  // wizard state
  const [step,     setStep]     = React.useState(0)
  const [loading,  setLoading]  = React.useState(false)
  const [error,    setError]    = React.useState('')

  // Step 1 — Profile Type
  const [profileType, setProfileType] = React.useState('')

  // Step 2 — Core Info
  const [displayName,   setDisplayName]   = React.useState('')
  const [bio,           setBio]           = React.useState('')
  const [location,      setLocation]      = React.useState('')
  const [country,       setCountry]       = React.useState('')
  const [availability,  setAvailability]  = React.useState('')
  const [languages,     setLanguages]     = React.useState('')

  // Step 3 — Skills & Rates
  const [primarySkill,    setPrimarySkill]    = React.useState('')
  const [secondarySkill,  setSecondarySkill]  = React.useState('')
  const [industry,        setIndustry]        = React.useState('')
  const [yearsExperience, setYearsExperience] = React.useState('')
  const [priceType,       setPriceType]       = React.useState('HOURLY')
  const [hourlyRate,      setHourlyRate]      = React.useState('')
  const [dailyRate,       setDailyRate]       = React.useState('')
  const [selectedTags,    setSelectedTags]    = React.useState<string[]>([])

  // Step 4 — Portfolio
  const [portfolio, setPortfolio] = React.useState(['', '', ''])
  const [ack,       setAck]       = React.useState(false)

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const selectedType = PROFILE_TYPES.find(pt => pt.key === profileType)

  function canAdvance(): boolean {
    if (step === 0) return !!profileType
    if (step === 1) return !!displayName.trim() && !!bio.trim() && !!location.trim() && !!availability
    if (step === 2) return !!primarySkill.trim() && !!industry && !!yearsExperience && (priceType === 'FREE' || !!hourlyRate)
    if (step === 3) return ack
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      await ajoConnectApi.createProfile({
        profileType,
        displayName,
        bio,
        location,
        country,
        availability,
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
        primarySkill,
        secondarySkill,
        industry,
        yearsExperience: parseInt(yearsExperience, 10) || 0,
        priceType,
        hourlyRate:  priceType === 'FREE' ? 0 : parseInt(hourlyRate, 10) || 0,
        dailyRate:   priceType === 'FREE' ? 0 : parseInt(dailyRate, 10)  || 0,
        tags: selectedTags,
        portfolioLinks: portfolio.filter(Boolean),
      })
      router.push('/dashboard/love/ajo')
    } catch (e) {
      logApiFailure('love/ajo/create', e)
      // Offline or service not running — redirect anyway for demo
      router.push('/dashboard/love/ajo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.white, fontFamily: 'monospace', paddingBottom: 120 }}>

      {/* ── Progress header ──────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 0', background: 'linear-gradient(180deg, #050c1a 0%, #07090a 80%)', borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => step > 0 ? setStep(step - 1) : router.push('/dashboard/love/ajo')}
            style={{ background: 'none', border: 'none', color: T.dim, fontSize: 18, cursor: 'pointer', padding: '4px 2px' }}
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 2px', color: T.blue }}>💼 Create Profile</h1>
            <div style={{ fontSize: 10, color: T.dim2 }}>Step {step + 1} of {STEPS.length} · {STEPS[step].label}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i < step ? T.green : i === step ? T.blue : T.dim3,
                transition: 'background .3s',
              }}
            />
          ))}
        </div>

        {/* Step labels */}
        <div style={{ display: 'flex', marginTop: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
                color: i < step ? T.green : i === step ? T.blue : T.dim2,
              }}>
                {s.icon} {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Step Content ─────────────────────────────────────────── */}
      <div style={{ padding: '24px 16px' }}>

        {/* ── STEP 0: Profile Type ──────────────────────────────── */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 6px' }}>Choose your profile type</h2>
              <p style={{ fontSize: 12, color: T.dim, margin: 0, lineHeight: 1.6 }}>
                Select the service category that best describes your professional offering on Àjọ Connect.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PROFILE_TYPES.map((pt, i) => (
                <div
                  key={pt.key}
                  onClick={() => setProfileType(pt.key)}
                  style={{
                    padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
                    background: profileType === pt.key ? `${pt.color}15` : T.card,
                    border: `1.5px solid ${profileType === pt.key ? pt.color : T.border}`,
                    transition: 'all .2s',
                    animationDelay: `${i * .03}s`,
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{pt.icon}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 800, marginBottom: 4,
                    color: profileType === pt.key ? pt.color : T.white,
                    lineHeight: 1.3,
                  }}>
                    {pt.label}
                  </div>
                  <div style={{ fontSize: 9, color: T.dim2, lineHeight: 1.4 }}>{pt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Core Info ───────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 6px' }}>Tell clients about you</h2>
              <p style={{ fontSize: 12, color: T.dim, margin: 0, lineHeight: 1.6 }}>
                This is your public professional profile. Be precise and authentic.
              </p>
            </div>

            {selectedType && (
              <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: `${selectedType.color}10`, borderRadius: 12, border: `1px solid ${selectedType.color}25`, marginBottom: 20 }}>
                <span style={{ fontSize: 20 }}>{selectedType.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: selectedType.color }}>{selectedType.label}</div>
                  <div style={{ fontSize: 10, color: T.dim2 }}>Profile type selected</div>
                </div>
              </div>
            )}

            <Input label="Display Name (professional handle)" value={displayName} onChange={setDisplayName} placeholder="e.g. Kamara_Events, EmekaTours_Abuja" />
            <Input label="Professional Bio" value={bio} onChange={setBio} placeholder="I am a certified event host specializing in..." rows={4} />
            <Input label="City & Country" value={location} onChange={setLocation} placeholder="e.g. Lagos, Nigeria" />
            <Input label="Country (ISO code)" value={country} onChange={setCountry} placeholder="e.g. NG, KE, GH, ZA" />
            <Input label="Languages spoken (comma-separated)" value={languages} onChange={setLanguages} placeholder="e.g. Yoruba, Hausa, English, French" />

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 8 }}>Availability</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {AVAILABILITY.map(av => (
                  <div
                    key={av.key}
                    onClick={() => setAvailability(av.key)}
                    style={{
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      background: availability === av.key ? T.blueDim : T.card2,
                      border: `1px solid ${availability === av.key ? T.blue : T.border}`,
                      fontSize: 11, fontWeight: 700, color: availability === av.key ? T.blue : T.dim,
                      transition: 'all .15s',
                    }}
                  >
                    {av.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Skills & Rates ─────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 6px' }}>Skills & pricing</h2>
              <p style={{ fontSize: 12, color: T.dim, margin: 0, lineHeight: 1.6 }}>
                Set your expertise and rates. Transparent pricing builds trust and drives more bookings.
              </p>
            </div>

            <Input label="Primary Skill" value={primarySkill} onChange={setPrimarySkill} placeholder="e.g. Luxury Event Hosting" />
            <Input label="Secondary Skill (optional)" value={secondarySkill} onChange={setSecondarySkill} placeholder="e.g. Bilingual MC / Cultural Orientation" />

            <Select
              label="Industry"
              value={industry}
              onChange={setIndustry}
              options={INDUSTRIES.map(i => ({ value: i, label: i }))}
            />

            <Select
              label="Years of Experience"
              value={yearsExperience}
              onChange={setYearsExperience}
              options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '20', '25+'].map(y => ({ value: y, label: `${y} year${y === '1' ? '' : 's'}` }))}
            />

            {/* Price type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 8 }}>Pricing Model</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {PRICE_TYPES.map(pt => (
                  <div
                    key={pt.key}
                    onClick={() => setPriceType(pt.key)}
                    style={{
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      background: priceType === pt.key ? T.blueDim : T.card2,
                      border: `1px solid ${priceType === pt.key ? T.blue : T.border}`,
                      fontSize: 10, fontWeight: 700, color: priceType === pt.key ? T.blue : T.dim,
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{pt.icon}</div>
                    {pt.label}
                  </div>
                ))}
              </div>
            </div>

            {priceType !== 'FREE' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 6 }}>
                    {priceType === 'DAILY' ? 'Daily' : priceType === 'PER_EVENT' ? 'Per Event' : priceType === 'PER_SESSION' ? 'Per Session' : 'Hourly'} Rate (CWR)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    placeholder="e.g. 5000"
                    style={{ width: '100%', padding: '12px 14px', background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }}
                  />
                </div>
                {priceType === 'HOURLY' && (
                  <div>
                    <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 6 }}>Daily Rate (CWR, optional)</label>
                    <input
                      type="number"
                      value={dailyRate}
                      onChange={e => setDailyRate(e.target.value)}
                      placeholder="e.g. 30000"
                      style={{ width: '100%', padding: '12px 14px', background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 8 }}>Service Tags (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                      background: selectedTags.includes(tag) ? T.blue : T.card2,
                      border: `1px solid ${selectedTags.includes(tag) ? T.blue : T.border}`,
                      color: selectedTags.includes(tag) ? T.white : T.dim,
                      fontFamily: 'monospace', fontSize: 10, fontWeight: 600,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Portfolio & Review ─────────────────────────── */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 6px' }}>Portfolio & confirm</h2>
              <p style={{ fontSize: 12, color: T.dim, margin: 0, lineHeight: 1.6 }}>
                Add up to 3 portfolio links — LinkedIn, Instagram, personal website, or showcase video. Then review your profile.
              </p>
            </div>

            {/* Portfolio links */}
            {portfolio.map((link, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: T.dim2, display: 'block', marginBottom: 6 }}>
                  Portfolio Link {i + 1} {i === 0 ? '(required if available)' : '(optional)'}
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={e => {
                    const updated = [...portfolio]
                    updated[i] = e.target.value
                    setPortfolio(updated)
                  }}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '12px 14px', background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }}
                />
              </div>
            ))}

            {/* Profile summary */}
            <div style={{ padding: '16px', background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, marginTop: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.blue, marginBottom: 14 }}>Profile Summary</div>
              {[
                { label: 'Profile Type',  value: PROFILE_TYPES.find(p => p.key === profileType)?.label ?? '—' },
                { label: 'Display Name',  value: displayName || '—' },
                { label: 'Location',      value: location || '—' },
                { label: 'Industry',      value: industry || '—' },
                { label: 'Primary Skill', value: primarySkill || '—' },
                { label: 'Experience',    value: yearsExperience ? `${yearsExperience} years` : '—' },
                { label: 'Rate',          value: priceType === 'FREE' ? 'Free / Exchange' : hourlyRate ? `${parseInt(hourlyRate).toLocaleString()} CWR / ${PRICE_TYPES.find(p => p.key === priceType)?.label}` : '—' },
                { label: 'Availability',  value: AVAILABILITY.find(a => a.key === availability)?.label ?? '—' },
                { label: 'Languages',     value: languages || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                  <span style={{ fontSize: 11, color: T.dim2, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.white, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Trust info */}
            <div style={{ padding: '12px 14px', background: `${T.blue}0A`, borderRadius: 12, border: `1px solid ${T.blue}18`, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.blue, marginBottom: 6 }}>🔷 Trust & Verification</div>
              <div style={{ fontSize: 10, color: T.dim2, lineHeight: 1.7 }}>
                You will start at <strong style={{ color: T.white }}>NEW</strong> trust level. To advance:
                <br />• Complete your first booking → VERIFIED
                <br />• Earn 5+ reviews averaging 4.5+ → TRUSTED
                <br />• 20+ bookings + background check → PROFESSIONAL
                <br />• Platform endorsement + insurance → ELITE
              </div>
            </div>

            {/* Confirmation checkbox */}
            <div
              onClick={() => setAck(!ack)}
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 8 }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                border: `2px solid ${ack ? T.blue : T.dim3}`,
                background: ack ? T.blue : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, transition: 'all .15s',
              }}>
                {ack ? '✓' : ''}
              </div>
              <span style={{ fontSize: 11, color: T.dim, lineHeight: 1.6 }}>
                I confirm this is a legitimate professional service. I will deliver as described, comply with Àjọ Connect standards, and accept escrow payment terms. Àjọ Connect may verify my credentials at any time.
              </span>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,.1)', borderRadius: 10, border: '1px solid rgba(239,68,68,.2)', fontSize: 11, color: '#ef4444', marginTop: 10 }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed navigation ──────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 16px 32px',
        background: 'linear-gradient(transparent, #07090a 30%)',
        display: 'flex', gap: 10,
      }}>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              flex: 1, padding: 14, borderRadius: 12, background: T.card,
              border: `1px solid ${T.border}`, color: T.white,
              fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            style={{
              flex: 2, padding: 14, borderRadius: 12,
              background: canAdvance() ? `linear-gradient(135deg, ${T.blue}, #2563eb)` : T.card2,
              border: canAdvance() ? 'none' : `1px solid ${T.border}`,
              color: canAdvance() ? T.white : T.dim2,
              fontFamily: 'monospace', fontWeight: 800, fontSize: 14,
              cursor: canAdvance() ? 'pointer' : 'not-allowed',
            }}
          >
            {STEPS[step + 1].icon} Next: {STEPS[step + 1].label} →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canAdvance() || loading}
            style={{
              flex: 2, padding: 14, borderRadius: 12,
              background: (canAdvance() && !loading) ? `linear-gradient(135deg, ${T.green}, #16a34a)` : T.card2,
              border: 'none',
              color: (canAdvance() && !loading) ? '#000' : T.dim2,
              fontFamily: 'monospace', fontWeight: 800, fontSize: 14,
              cursor: (canAdvance() && !loading) ? 'pointer' : 'not-allowed',
              letterSpacing: '.02em',
            }}
          >
            {loading ? '⏳ Creating Profile...' : '💼 Launch My Profile'}
          </button>
        )}
      </div>
    </div>
  )
}
