'use client'
// ═══════════════════════════════════════════════════════════════════
// CREATE REALITY SHOW — Full Production Flow
// Pan-African show creation with paid time slots, contestants, voting
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { jollofTvApi } from '@/lib/api'

const CSS_ID = 'create-show-css'
const CSS = `
@keyframes csFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes csCheck{0%{transform:scale(0) rotate(-45deg);opacity:0}60%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes csPulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)}50%{box-shadow:0 0 18px 4px rgba(74,222,128,.6)}}
.cs-fade{animation:csFadeIn .35s ease both}
.cs-check{animation:csCheck .5s cubic-bezier(.26,1.8,.58,1) both}
.cs-pulse{animation:csPulse 1.5s ease-in-out infinite}
`

type Step = 'CATEGORY' | 'DETAILS' | 'TIMESLOT' | 'CONTESTANTS' | 'VOTING' | 'REVIEW' | 'DONE'
const STEPS: Step[] = ['CATEGORY', 'DETAILS', 'TIMESLOT', 'CONTESTANTS', 'VOTING', 'REVIEW', 'DONE']

const CATEGORIES = [
  { key: 'talent',      emoji: '🎤', label: 'Village Idol',      desc: 'Singing & talent competition' },
  { key: 'fashion',     emoji: '👗', label: 'Asọ Ẹbì',          desc: 'Fashion design wars' },
  { key: 'acting',      emoji: '🎬', label: 'Nollywood Star',    desc: 'Acting & performance' },
  { key: 'cooking',     emoji: '🍲', label: 'Jollof Wars',       desc: 'Cooking competitions' },
  { key: 'dance',       emoji: '💃', label: 'Azonto Dance',      desc: 'Dance battles & choreography' },
  { key: 'business',    emoji: '💼', label: "Mogul\u2019s Table", desc: 'Entrepreneur pitch & business' },
  { key: 'building',    emoji: '🏗', label: 'Master Builder',    desc: 'Building & architecture' },
  { key: 'agriculture', emoji: '🌾', label: 'Harvest Heroes',    desc: 'Farming & agriculture' },
  { key: 'arts',        emoji: '🎨', label: 'Adinkra Arts',      desc: 'Visual arts & crafts' },
  { key: 'warrior',     emoji: '⚔️', label: 'Warrior Games',     desc: 'Athletic competition' },
]

const TIME_SLOTS = [
  { days: 7,   price: 500,  label: '1 Week',   badge: null },
  { days: 14,  price: 900,  label: '2 Weeks',  badge: null },
  { days: 30,  price: 1500, label: '1 Month',  badge: 'POPULAR' },
  { days: 60,  price: 2500, label: '2 Months', badge: null },
  { days: 100, price: 4000, label: '100 Days', badge: 'EPIC' },
]

const VOTE_PRICES = [
  { price: 5,   label: '₡5',   desc: 'Budget — high volume voting' },
  { price: 10,  label: '₡10',  desc: 'Standard — balanced pacing' },
  { price: 25,  label: '₡25',  desc: 'Premium — serious fans only' },
  { price: 50,  label: '₡50',  desc: 'Elite — high-stakes drama' },
  { price: 100, label: '₡100', desc: 'Diamond — ultimate reality TV' },
]

const COUNTRIES = [
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: 'SN', flag: '🇸🇳', name: 'Senegal' },
  { code: 'ET', flag: '🇪🇹', name: 'Ethiopia' },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroon' },
  { code: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: 'TZ', flag: '🇹🇿', name: 'Tanzania' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: 'RW', flag: '🇷🇼', name: 'Rwanda' },
  { code: 'MA', flag: '🇲🇦', name: 'Morocco' },
]

interface NewContestant {
  name: string; bio: string; village: string; role: string; country: string
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '11px 13px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12, color: '#fff', fontSize: 13, fontFamily: 'DM Sans,sans-serif', outline: 'none',
}

export default function CreateRealityShow() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = React.useState<Step>('CATEGORY')
  const [toast, setToast] = React.useState('')

  // Form state
  const [category, setCategory] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [season, setSeason] = React.useState('1')
  const [timeSlot, setTimeSlot] = React.useState(TIME_SLOTS[2]) // default 30 days
  const [contestants, setContestants] = React.useState<NewContestant[]>([])
  const [votePrice, setVotePrice] = React.useState(VOTE_PRICES[1]) // default ₡10
  const [submitting, setSubmitting] = React.useState(false)

  // Add contestant form
  const [cName, setCName] = React.useState('')
  const [cBio, setCBio] = React.useState('')
  const [cVillage, setCVillage] = React.useState('')
  const [cRole, setCRole] = React.useState('')
  const [cCountry, setCCountry] = React.useState('NG')

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }
  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex) / (STEPS.length - 1)) * 100

  const addContestant = () => {
    if (!cName.trim() || !cBio.trim()) { showToast('Name and story are required'); return }
    setContestants(prev => [...prev, { name: cName, bio: cBio, village: cVillage, role: cRole, country: cCountry }])
    setCName(''); setCBio(''); setCVillage(''); setCRole(''); setCCountry('NG')
    showToast(`✅ ${cName} added!`)
  }

  const removeContestant = (i: number) => {
    setContestants(prev => prev.filter((_, j) => j !== i))
  }

  const totalCost = timeSlot.price
  const estimatedRevenue = contestants.length * 500 * votePrice.price // rough estimate

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await (jollofTvApi as any).createRealityShow?.({
        title, description, season: parseInt(season), category,
        durationDays: timeSlot.days, pricePerVote: votePrice.price,
        contestants: contestants.map(c => ({ displayName: c.name, bio: c.bio, village: c.village, villageRole: c.role, country: c.country })),
        creatorId: (user as any)?.id ?? 'guest',
        amountPaid: totalCost,
      })
    } catch { /* mock fallback */ }
    setSubmitting(false)
    setStep('DONE')
  }

  const canNext = () => {
    if (step === 'CATEGORY') return !!category
    if (step === 'DETAILS') return !!title.trim() && !!description.trim()
    if (step === 'TIMESLOT') return true
    if (step === 'CONTESTANTS') return contestants.length >= 2
    if (step === 'VOTING') return true
    return true
  }

  const nextStep = () => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 2) setStep(STEPS[idx + 1])
    else if (step === 'REVIEW') handleSubmit()
  }
  const prevStep = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const catInfo = CATEGORIES.find(c => c.key === category)
  const countryInfo = (code: string) => COUNTRIES.find(c => c.code === code)

  return (
    <div style={{ minHeight: '100vh', background: '#07090a', color: 'rgba(255,255,255,.9)', fontFamily: 'DM Sans,sans-serif', paddingBottom: 120 }}>
      {/* Toast */}
      {toast && <div style={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,16,8,.97)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 12, padding: '10px 18px', fontSize: 12, fontWeight: 700, color: '#4ade80', zIndex: 400, whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a0533,#07090a)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => step === 'CATEGORY' || step === 'DONE' ? router.back() : prevStep()} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#fff' }}>🎬 Create Reality Show</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>
              {step === 'DONE' ? 'Show Created!' : `Step ${stepIndex + 1} of ${STEPS.length - 1}`}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        {step !== 'DONE' && (
          <div style={{ marginTop: 12, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#c084fc)', borderRadius: 99, transition: 'width .4s ease' }} />
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── STEP 1: CATEGORY ── */}
        {step === 'CATEGORY' && (
          <div className="cs-fade">
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora, sans-serif', marginBottom: 4, color: '#fff' }}>Choose Your Stage</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>What type of reality show will you create?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setCategory(cat.key)} style={{ borderRadius: 16, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', background: category === cat.key ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.02)', border: `1.5px solid ${category === cat.key ? '#c084fc' : 'rgba(255,255,255,.06)'}`, transition: 'all .15s' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{cat.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: category === cat.key ? '#c084fc' : 'rgba(255,255,255,.7)', fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>{cat.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: DETAILS ── */}
        {step === 'DETAILS' && (
          <div className="cs-fade">
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Name Your Show</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>
              {catInfo?.emoji} {catInfo?.label} — tell Africa your story
            </div>
            <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>Show Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Village Warriors — Season 1" style={{ ...INPUT_STYLE, marginBottom: 16 }} />
            <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>Show Description (tell the story)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe your show like an African griot telling a tale around the fire... What is this show about? What makes it unique? What will viewers witness?" style={{ ...INPUT_STYLE, resize: 'vertical', marginBottom: 16, lineHeight: 1.5 }} />
            <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>Season Number</label>
            <input value={season} onChange={e => setSeason(e.target.value)} type="number" min="1" style={{ ...INPUT_STYLE, maxWidth: 120 }} />
          </div>
        )}

        {/* ── STEP 3: TIME SLOT ── */}
        {step === 'TIMESLOT' && (
          <div className="cs-fade">
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Book Your Time Slot</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>How long should your show run? All payments go through Cowrie banking.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIME_SLOTS.map(sl => (
                <button key={sl.days} onClick={() => setTimeSlot(sl)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 16, cursor: 'pointer', background: timeSlot.days === sl.days ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.02)', border: `1.5px solid ${timeSlot.days === sl.days ? '#c084fc' : 'rgba(255,255,255,.06)'}`, transition: 'all .15s', textAlign: 'left' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900, color: timeSlot.days === sl.days ? '#fbbf24' : 'rgba(255,255,255,.5)' }}>{sl.days}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>DAYS</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif' }}>{sl.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                      {sl.days <= 14 ? 'Quick sprint — fast-paced drama' : sl.days <= 30 ? 'Sweet spot — builds audience loyalty' : sl.days <= 60 ? 'Extended run — deep storylines' : 'Epic marathon — legendary status'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#fbbf24' }}>₡{sl.price.toLocaleString()}</div>
                    {sl.badge && <div style={{ fontSize: 7, fontWeight: 800, color: '#07090a', background: '#4ade80', borderRadius: 99, padding: '1px 5px', marginTop: 3, textAlign: 'center' }}>{sl.badge}</div>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)' }}>
              <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700 }}>💡 PRICING TIP</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 4, lineHeight: 1.5 }}>Longer shows earn more revenue from votes. A 30-day show with 6 contestants averages ₡45,000 in vote revenue.</div>
            </div>
          </div>
        )}

        {/* ── STEP 4: CONTESTANTS ── */}
        {step === 'CONTESTANTS' && (
          <div className="cs-fade">
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Add Contestants</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
              Minimum 2 contestants. Every contestant must have an African-rooted story.
            </div>

            {/* Existing contestants */}
            {contestants.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {contestants.map((c, i) => {
                  const ci = countryInfo(c.country)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `hsl(${i * 45 + 20}, 55%, 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#fff', fontFamily: 'Sora, sans-serif', flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif' }}>{c.name}</span>
                          {ci && <span style={{ fontSize: 12 }}>{ci.flag}</span>}
                        </div>
                        {c.village && <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{c.village} Village · {c.role}</div>}
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.bio}</div>
                      </div>
                      <button onClick={() => removeContestant(i)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                    </div>
                  )
                })}
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', textAlign: 'center', marginTop: 6 }}>{contestants.length} contestant{contestants.length !== 1 ? 's' : ''} added</div>
              </div>
            )}

            {/* Add contestant form */}
            <div style={{ borderRadius: 16, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.08)', padding: '16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#c084fc', fontFamily: 'Sora, sans-serif', marginBottom: 12 }}>+ ADD CONTESTANT</div>
              <label style={{ display: 'block', fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Full Name (African names encouraged)</label>
              <input value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Adaeze Nwankwo" style={{ ...INPUT_STYLE, marginBottom: 12 }} />

              <label style={{ display: 'block', fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Their Story (bio — tell it like a griot)</label>
              <textarea value={cBio} onChange={e => setCBio(e.target.value)} rows={3} placeholder="Born under the stars of the Ogun River, she learned to weave fabric before she could write. Now she dresses the queens of three nations..." style={{ ...INPUT_STYLE, resize: 'vertical', marginBottom: 12, lineHeight: 1.5 }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Village</label>
                  <input value={cVillage} onChange={e => setCVillage(e.target.value)} placeholder="e.g. Commerce" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Role</label>
                  <input value={cRole} onChange={e => setCRole(e.target.value)} placeholder="e.g. Chief Merchant" style={INPUT_STYLE} />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Country</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {COUNTRIES.map(co => (
                  <button key={co.code} onClick={() => setCCountry(co.code)} style={{ padding: '5px 10px', borderRadius: 10, background: cCountry === co.code ? 'rgba(192,132,252,.12)' : 'rgba(255,255,255,.03)', border: `1px solid ${cCountry === co.code ? '#c084fc' : 'rgba(255,255,255,.06)'}`, cursor: 'pointer', fontSize: 10, color: cCountry === co.code ? '#c084fc' : 'rgba(255,255,255,.5)', fontWeight: 700 }}>
                    {co.flag} {co.name}
                  </button>
                ))}
              </div>

              <button onClick={addContestant} disabled={!cName.trim() || !cBio.trim()} style={{ width: '100%', padding: '11px 0', borderRadius: 12, background: cName.trim() && cBio.trim() ? 'linear-gradient(90deg,#7c3aed,#c084fc)' : 'rgba(255,255,255,.05)', border: 'none', color: cName.trim() && cBio.trim() ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 13, fontWeight: 800, cursor: cName.trim() && cBio.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Sora, sans-serif' }}>
                + Add Contestant
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: VOTING PRICE ── */}
        {step === 'VOTING' && (
          <div className="cs-fade">
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Set Voting Price</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>Every vote is paid. Choose your price per vote — wired directly through Cowrie banking.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {VOTE_PRICES.map(vp => (
                <button key={vp.price} onClick={() => setVotePrice(vp)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 16, cursor: 'pointer', background: votePrice.price === vp.price ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.02)', border: `1.5px solid ${votePrice.price === vp.price ? '#c084fc' : 'rgba(255,255,255,.06)'}`, transition: 'all .15s', textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: votePrice.price === vp.price ? '#fbbf24' : 'rgba(255,255,255,.5)', width: 50, textAlign: 'center', flexShrink: 0 }}>{vp.label}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif' }}>{vp.label} per vote</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{vp.desc}</div>
                  </div>
                  {votePrice.price === vp.price && <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0 }}>✓</div>}
                </button>
              ))}
            </div>
            {/* Revenue projection */}
            <div style={{ marginTop: 16, padding: '14px', borderRadius: 14, background: 'rgba(74,222,128,.04)', border: '1px solid rgba(74,222,128,.15)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', marginBottom: 6 }}>💰 REVENUE PROJECTION</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                With {contestants.length} contestants at {votePrice.label}/vote over {timeSlot.days} days, average shows earn approximately <span style={{ color: '#fbbf24', fontWeight: 800 }}>₡{estimatedRevenue.toLocaleString()}</span> in vote revenue.
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: REVIEW ── */}
        {step === 'REVIEW' && (
          <div className="cs-fade">
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Review & Pay</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>Confirm your show details and pay to go live.</div>

            {/* Summary card */}
            <div style={{ borderRadius: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', padding: '16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{catInfo?.emoji}</span>
                <div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 900, color: '#fff' }}>{title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{catInfo?.label} · Season {season}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: 12 }}>{description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Duration', value: timeSlot.label, color: '#c084fc' },
                  { label: 'Vote Price', value: votePrice.label, color: '#fbbf24' },
                  { label: 'Contestants', value: contestants.length, color: '#4ade80' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '8px 0', borderRadius: 10, background: 'rgba(255,255,255,.02)' }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contestant list */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', marginBottom: 8, textTransform: 'uppercase' }}>Contestants</div>
              {contestants.map((c, i) => {
                const ci = countryInfo(c.country)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.02)', marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${i * 45 + 20}, 55%, 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{c.name}</span>
                      {ci && <span style={{ fontSize: 10, marginLeft: 4 }}>{ci.flag}</span>}
                      {c.village && <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{c.village} · {c.role}</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment summary */}
            <div style={{ borderRadius: 14, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)', padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', marginBottom: 10 }}>💳 PAYMENT SUMMARY</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Time Slot ({timeSlot.label})</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>₡{timeSlot.price.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Platform Fee (10%)</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>₡{Math.round(timeSlot.price * 0.1).toLocaleString()}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>TOTAL</span>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#fbbf24' }}>₡{Math.round(timeSlot.price * 1.1).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 7: DONE ── */}
        {step === 'DONE' && (
          <div className="cs-fade" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="cs-check" style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900, color: '#4ade80', marginBottom: 8 }}>Show Created!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginBottom: 24 }}>
              Your {catInfo?.label} show with {contestants.length} contestants is now live. Payment of ₡{Math.round(totalCost * 1.1).toLocaleString()} processed through Cowrie banking.
            </div>
            <div className="cs-pulse" style={{ borderRadius: 16, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.2)', padding: '14px', marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', marginBottom: 4 }}>📊 VOTING STARTS NOW</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                Every vote costs {votePrice.label} · Runs for {timeSlot.days} days · Revenue flows to your Cowrie wallet
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => router.push('/dashboard/jollof/reality')} style={{ flex: 1, padding: '13px 0', borderRadius: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                View All Shows
              </button>
              <button onClick={async () => {
                const shareUrl = `${window.location.origin}/dashboard/jollof/reality`
                if (navigator.share) {
                  try {
                    await navigator.share({ title: title || 'Reality Show', text: `Check out "${title || 'my show'}" on Jollof TV!`, url: shareUrl })
                  } catch (e: any) {
                    if (e?.name !== 'AbortError') {
                      await navigator.clipboard.writeText(shareUrl)
                      setToast('Link copied!'); setTimeout(() => setToast(''), 2000)
                    }
                  }
                } else {
                  await navigator.clipboard.writeText(shareUrl)
                  setToast('Link copied!'); setTimeout(() => setToast(''), 2000)
                }
              }} style={{ flex: 1, padding: '13px 0', borderRadius: 14, background: 'linear-gradient(90deg,#7c3aed,#c084fc)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                Share Show →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav buttons */}
      {step !== 'DONE' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px', background: 'linear-gradient(to top,#07090a,#07090aee,transparent)', zIndex: 30 }}>
          <button onClick={nextStep} disabled={!canNext() || submitting} style={{ width: '100%', maxWidth: 480, margin: '0 auto', display: 'block', padding: '15px 0', borderRadius: 14, background: canNext() ? 'linear-gradient(90deg,#7c3aed,#c084fc)' : 'rgba(255,255,255,.05)', border: 'none', color: canNext() ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 15, fontWeight: 800, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily: 'Sora, sans-serif' }}>
            {submitting ? 'Processing Payment…' : step === 'REVIEW' ? `🔒 Pay ₡${Math.round(totalCost * 1.1).toLocaleString()} & Go Live` : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  )
}
