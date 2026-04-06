'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { loveWorldApi } from '../../../../lib/api'
import { useAuthStore } from '../../../../stores/authStore'

// ── Constants ─────────────────────────────────────────────────
const BG = '#0A0A0F'
const CARD = '#111118'
const SURFACE = '#1A1A25'
const GOLD = '#D4AF37'
const GREEN = '#00C853'
const WHITE = '#FFFFFF'
const DIM = 'rgba(255,255,255,.4)'
const FONT = 'monospace'

type Step = 1 | 2 | 3 | 4 | 5

const INTENTIONS = [
  { key: 'marriage', icon: '\u{1F48D}', label: 'Marriage', desc: 'Seeking a life partner for matrimony' },
  { key: 'serious', icon: '\u2764\uFE0F', label: 'Serious Relationship', desc: 'Building toward long-term commitment' },
  { key: 'open', icon: '\u{1F31F}', label: 'Open to Either', desc: 'Let destiny reveal the path' },
] as const

const VALUE_SLIDERS: { key: string; label: string; left?: string; right?: string }[] = [
  { key: 'elderRespect', label: 'Elder Respect' },
  { key: 'communalLiving', label: 'Communal Living' },
  { key: 'bridePriceImportance', label: 'Bride Price Importance' },
  { key: 'ceremonyStyle', label: 'Ceremony Style', left: 'Traditional', right: 'Modern' },
  { key: 'tribalMatch', label: 'Tribal Match' },
  { key: 'diasporaOpenness', label: 'Diaspora Openness' },
  { key: 'languageWeight', label: 'Language Weight' },
]

const FAITH_OPTIONS = ['Christianity', 'Islam', 'Traditional African', 'Spiritual', 'Other', 'Prefer not to say']
const FAMILY_PLAN_OPTIONS = ['Want children', 'Have children, want more', 'Have children, done', 'No children preferred', 'Open / flexible']
const EDUCATION_OPTIONS = ['Secondary school', 'Vocational / Trade', 'University degree', 'Postgraduate', 'Doctoral', 'No preference']
const DIETARY_OPTIONS = ['No restrictions', 'Halal', 'Vegetarian', 'Vegan', 'Pescatarian', 'No preference']
const LIFESTYLE_OPTIONS = ['Homebody', 'Social butterfly', 'Adventurer', 'Career-focused', 'Balanced', 'No preference']
const LOVE_LANG_OPTIONS = ['Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 'Quality Time', 'Physical Touch', 'No preference']

const ANIM_CSS = `
@keyframes lw-fade-in { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
@keyframes lw-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(212,175,55,.3) } 50% { box-shadow:0 0 0 10px rgba(212,175,55,0) } }
@keyframes lw-bar { from { width:0 } }
`

// ── Component ─────────────────────────────────────────────────
export default function LoveWorldCreatePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [step, setStep] = React.useState<Step>(1)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  // Step 1
  const [intention, setIntention] = React.useState('')
  // Step 2
  const [values, setValues] = React.useState<Record<string, number>>({
    elderRespect: 50, communalLiving: 50, bridePriceImportance: 50,
    ceremonyStyle: 50, tribalMatch: 50, diasporaOpenness: 50, languageWeight: 50,
  })
  // Step 3
  const [displayName, setDisplayName] = React.useState('')
  const [gender, setGender] = React.useState<'Male' | 'Female' | ''>('')
  const [birthYear, setBirthYear] = React.useState('')
  const [heritage, setHeritage] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [state, setState] = React.useState('')
  const [faithPath, setFaithPath] = React.useState('')
  const [bio, setBio] = React.useState('')
  // Step 4
  const [photos, setPhotos] = React.useState<string[]>(['', '', '', '', '', ''])
  // Step 5
  const [ageMin, setAgeMin] = React.useState(20)
  const [ageMax, setAgeMax] = React.useState(40)
  const [familyPlan, setFamilyPlan] = React.useState('')
  const [education, setEducation] = React.useState('')
  const [dietary, setDietary] = React.useState('')
  const [lifestyle, setLifestyle] = React.useState('')
  const [loveLang, setLoveLang] = React.useState('')
  const [faithImportance, setFaithImportance] = React.useState(50)

  // Inject CSS
  React.useEffect(() => {
    const s = document.createElement('style')
    s.textContent = ANIM_CSS
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  const pct = (step / 5) * 100

  function canNext(): boolean {
    if (step === 1) return !!intention
    if (step === 3) return !!(displayName.trim() && gender && birthYear && heritage.trim() && country.trim())
    return true
  }

  function goNext() {
    if (!canNext()) return
    if (step < 5) setStep((step + 1) as Step)
  }

  function goBack() {
    if (step > 1) setStep((step - 1) as Step)
    else router.push('/dashboard/love')
  }

  async function handleSubmit() {
    if (!canNext()) return
    setSubmitting(true)
    setError('')
    try {
      await loveWorldApi.createProfile({
        intention,
        culturalValues: values,
        displayName: displayName.trim(),
        gender,
        birthYear: parseInt(birthYear),
        heritage: heritage.trim(),
        country: country.trim(),
        state: state.trim(),
        faithPath,
        bio: bio.trim(),
        photos: photos.filter(Boolean),
        preferences: { ageMin, ageMax, familyPlan, education, dietary, lifestyle, loveLang, faithImportance },
      })
      router.push('/dashboard/love')
    } catch (e: any) {
      setError(e?.message || 'Failed to create profile')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Shared Styles ───────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: SURFACE, border: `1px solid rgba(255,255,255,.1)`,
    borderRadius: 10, color: WHITE, fontFamily: FONT, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { color: DIM, fontSize: 11, fontFamily: FONT, marginBottom: 4, display: 'block', letterSpacing: '.5px' }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const, WebkitAppearance: 'none' as const }

  // ── Slider helper ───────────────────────────────────────────
  function Slider({ value, onChange, left, right }: { value: number; onChange: (v: number) => void; left?: string; right?: string }) {
    return (
      <div>
        <input type="range" min={0} max={100} value={value} onChange={e => onChange(+e.target.value)}
          style={{ width: '100%', accentColor: GOLD, cursor: 'pointer' }} />
        {(left || right) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: DIM, fontFamily: FONT, marginTop: 2 }}>
            <span>{left || '0'}</span><span>{right || '100'}</span>
          </div>
        )}
      </div>
    )
  }

  // ── Steps ───────────────────────────────────────────────────
  function renderStep() {
    if (step === 1) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'lw-fade-in .4s ease' }}>
        <h2 style={{ color: GOLD, fontFamily: FONT, fontSize: 18, margin: 0, textAlign: 'center' }}>Your Intention</h2>
        <p style={{ color: DIM, fontFamily: FONT, fontSize: 12, textAlign: 'center', margin: 0 }}>What path calls your heart?</p>
        {INTENTIONS.map(it => {
          const active = intention === it.key
          return (
            <button key={it.key} onClick={() => setIntention(it.key)}
              style={{
                background: active ? 'rgba(212,175,55,.12)' : CARD, border: active ? `2px solid ${GOLD}` : `1px solid rgba(255,255,255,.08)`,
                borderRadius: 14, padding: '20px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                animation: active ? 'lw-pulse 2s infinite' : 'none',
              }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{it.icon}</div>
              <div style={{ color: active ? GOLD : WHITE, fontFamily: FONT, fontSize: 15, fontWeight: 700 }}>{it.label}</div>
              <div style={{ color: DIM, fontFamily: FONT, fontSize: 11, marginTop: 4 }}>{it.desc}</div>
            </button>
          )
        })}
      </div>
    )

    if (step === 2) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'lw-fade-in .4s ease' }}>
        <h2 style={{ color: GOLD, fontFamily: FONT, fontSize: 18, margin: 0, textAlign: 'center' }}>Cultural Values</h2>
        <p style={{ color: DIM, fontFamily: FONT, fontSize: 12, textAlign: 'center', margin: 0 }}>Calibrate what matters to you</p>
        {VALUE_SLIDERS.map(s => (
          <div key={s.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>{s.label}</span>
              <span style={{ color: GOLD, fontFamily: FONT, fontSize: 12, fontWeight: 700 }}>{values[s.key]}</span>
            </div>
            <Slider value={values[s.key]} onChange={v => setValues(p => ({ ...p, [s.key]: v }))}
              left={s.left || 'Low'} right={s.right || 'High'} />
          </div>
        ))}
      </div>
    )

    if (step === 3) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'lw-fade-in .4s ease' }}>
        <h2 style={{ color: GOLD, fontFamily: FONT, fontSize: 18, margin: 0, textAlign: 'center' }}>About You</h2>
        <div>
          <label style={labelStyle}>DISPLAY NAME *</label>
          <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" maxLength={60} />
        </div>
        <div>
          <label style={labelStyle}>GENDER *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['Male', 'Female'] as const).map(g => (
              <button key={g} onClick={() => setGender(g)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10, fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: gender === g ? GOLD : SURFACE, color: gender === g ? BG : WHITE,
                  border: gender === g ? `2px solid ${GOLD}` : `1px solid rgba(255,255,255,.1)`, transition: 'all .2s',
                }}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>BIRTH YEAR *</label>
          <input style={inputStyle} type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)}
            placeholder="e.g. 1995" min={1940} max={2008} />
        </div>
        <div>
          <label style={labelStyle}>HERITAGE *</label>
          <input style={inputStyle} value={heritage} onChange={e => setHeritage(e.target.value)} placeholder="e.g. Yoruba, Igbo, Zulu, Diaspora" />
        </div>
        <div>
          <label style={labelStyle}>COUNTRY *</label>
          <input style={inputStyle} value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Nigeria, Ghana, Kenya" />
        </div>
        <div>
          <label style={labelStyle}>STATE / REGION</label>
          <input style={inputStyle} value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Lagos, Ashanti, Nairobi" />
        </div>
        <div>
          <label style={labelStyle}>FAITH PATH</label>
          <select style={selectStyle} value={faithPath} onChange={e => setFaithPath(e.target.value)}>
            <option value="">Select faith path...</option>
            {FAITH_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>BIO ({bio.length}/500)</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={bio}
            onChange={e => setBio(e.target.value.slice(0, 500))} placeholder="Tell potential matches about yourself..." maxLength={500} />
        </div>
      </div>
    )

    if (step === 4) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'lw-fade-in .4s ease' }}>
        <h2 style={{ color: GOLD, fontFamily: FONT, fontSize: 18, margin: 0, textAlign: 'center' }}>Photos</h2>
        <p style={{ color: DIM, fontFamily: FONT, fontSize: 12, textAlign: 'center', margin: 0 }}>Add up to 6 photos (paste image URLs)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {photos.map((url, i) => (
            <div key={i} style={{
              background: SURFACE, borderRadius: 12, aspectRatio: '3/4', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', border: url ? `2px solid ${GOLD}` : `1px dashed rgba(255,255,255,.15)`,
              overflow: 'hidden', position: 'relative',
            }}>
              {url ? (
                <>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <button onClick={() => { const p = [...photos]; p[i] = ''; setPhotos(p) }}
                    style={{
                      position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(0,0,0,.7)', border: 'none', color: WHITE, fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>x</button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 22, opacity: .3 }}>+</div>
                  <div style={{ color: DIM, fontFamily: FONT, fontSize: 9, marginTop: 2 }}>Slot {i + 1}</div>
                </>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {photos.map((url, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: DIM, fontFamily: FONT, fontSize: 11, minWidth: 16 }}>{i + 1}.</span>
              <input style={{ ...inputStyle, fontSize: 12 }} value={url} placeholder={`Photo ${i + 1} URL`}
                onChange={e => { const p = [...photos]; p[i] = e.target.value; setPhotos(p) }} />
            </div>
          ))}
        </div>
      </div>
    )

    // Step 5
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'lw-fade-in .4s ease' }}>
        <h2 style={{ color: GOLD, fontFamily: FONT, fontSize: 18, margin: 0, textAlign: 'center' }}>Preferences</h2>
        <p style={{ color: DIM, fontFamily: FONT, fontSize: 12, textAlign: 'center', margin: 0 }}>Who are you looking for?</p>
        <div>
          <label style={labelStyle}>AGE RANGE: {ageMin} - {ageMax}</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: DIM, fontFamily: FONT, fontSize: 11 }}>Min</span>
            <input type="range" min={18} max={70} value={ageMin} onChange={e => { const v = +e.target.value; setAgeMin(Math.min(v, ageMax - 1)) }}
              style={{ flex: 1, accentColor: GOLD }} />
            <span style={{ color: GOLD, fontFamily: FONT, fontSize: 13, fontWeight: 700, minWidth: 22 }}>{ageMin}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
            <span style={{ color: DIM, fontFamily: FONT, fontSize: 11 }}>Max</span>
            <input type="range" min={18} max={70} value={ageMax} onChange={e => { const v = +e.target.value; setAgeMax(Math.max(v, ageMin + 1)) }}
              style={{ flex: 1, accentColor: GOLD }} />
            <span style={{ color: GOLD, fontFamily: FONT, fontSize: 13, fontWeight: 700, minWidth: 22 }}>{ageMax}</span>
          </div>
        </div>
        <div>
          <label style={labelStyle}>FAMILY PLAN</label>
          <select style={selectStyle} value={familyPlan} onChange={e => setFamilyPlan(e.target.value)}>
            <option value="">Select...</option>
            {FAMILY_PLAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>EDUCATION</label>
          <select style={selectStyle} value={education} onChange={e => setEducation(e.target.value)}>
            <option value="">Select...</option>
            {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>DIETARY</label>
          <select style={selectStyle} value={dietary} onChange={e => setDietary(e.target.value)}>
            <option value="">Select...</option>
            {DIETARY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>LIFESTYLE</label>
          <select style={selectStyle} value={lifestyle} onChange={e => setLifestyle(e.target.value)}>
            <option value="">Select...</option>
            {LIFESTYLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>LOVE LANGUAGE</label>
          <select style={selectStyle} value={loveLang} onChange={e => setLoveLang(e.target.value)}>
            <option value="">Select...</option>
            {LOVE_LANG_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>FAITH IMPORTANCE</label>
            <span style={{ color: GOLD, fontFamily: FONT, fontSize: 12, fontWeight: 700 }}>{faithImportance}</span>
          </div>
          <Slider value={faithImportance} onChange={setFaithImportance} left="Not important" right="Essential" />
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100dvh', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 0', position: 'sticky', top: 0, background: BG, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: WHITE, fontSize: 15, fontWeight: 700 }}>Create Love Profile</span>
          <span style={{ color: DIM, fontSize: 12 }}>Step {step} of 5</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: SURFACE, borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{
            height: '100%', background: `linear-gradient(90deg, ${GOLD}, #F0D060)`, borderRadius: 2,
            width: `${pct}%`, transition: 'width .4s ease', animation: 'lw-bar .6s ease',
          }} />
        </div>
        {/* Step pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(['Intention', 'Values', 'About', 'Photos', 'Preferences'] as const).map((label, i) => {
            const s = (i + 1) as Step
            const active = step === s
            const done = step > s
            return (
              <div key={label} style={{
                flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: active ? 'rgba(212,175,55,.15)' : done ? 'rgba(0,200,83,.1)' : SURFACE,
                color: active ? GOLD : done ? GREEN : DIM, transition: 'all .3s',
              }}>
                {done ? '\u2713' : ''} {label}
              </div>
            )
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 120px' }}>
        {renderStep()}
        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,50,50,.1)', border: '1px solid rgba(255,50,50,.3)', borderRadius: 10 }}>
            <span style={{ color: '#FF5555', fontFamily: FONT, fontSize: 12 }}>{error}</span>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '14px 18px', paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        background: `linear-gradient(transparent, ${BG} 20%)`, display: 'flex', gap: 12, zIndex: 20,
      }}>
        <button onClick={goBack} style={{
          flex: 1, padding: '14px 0', borderRadius: 12, background: SURFACE, border: `1px solid rgba(255,255,255,.1)`,
          color: WHITE, fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < 5 ? (
          <button onClick={goNext} disabled={!canNext()} style={{
            flex: 2, padding: '14px 0', borderRadius: 12, fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: canNext() ? 'pointer' : 'not-allowed',
            background: canNext() ? `linear-gradient(135deg, ${GOLD}, #C9A030)` : SURFACE,
            color: canNext() ? BG : DIM, border: 'none', transition: 'all .3s',
          }}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} style={{
            flex: 2, padding: '14px 0', borderRadius: 12, fontFamily: FONT, fontSize: 14, fontWeight: 700,
            background: submitting ? SURFACE : `linear-gradient(135deg, ${GREEN}, #00A040)`,
            color: submitting ? DIM : WHITE, border: 'none', cursor: submitting ? 'wait' : 'pointer', transition: 'all .3s',
          }}>
            {submitting ? 'Creating...' : 'Create Profile'}
          </button>
        )}
      </div>
    </div>
  )
}
