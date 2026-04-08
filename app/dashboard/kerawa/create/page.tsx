'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { kerawaApi } from '@/lib/api'

const FIRE = { primary: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#0a0a0a', card: '#141414', border: '#1f1f1f' }
const IDENTITY_LEVELS = [
  { key: 'SHADOW', icon: '👤', label: 'Shadow', desc: 'Fully anonymous — no photos, no name clues' },
  { key: 'SILHOUETTE', icon: '🌑', label: 'Silhouette', desc: 'Blurred shape only, voice distorted' },
  { key: 'PARTIAL', icon: '🎭', label: 'Partial', desc: 'Selected features visible, nickname shown' },
  { key: 'VERIFIED', icon: '✅', label: 'Verified', desc: 'Face visible, verified identity' },
  { key: 'OPEN', icon: '🔓', label: 'Open', desc: 'Full identity — name, photos, bio' },
] as const

const INTENTS = [
  { key: 'CHAT_ONLY', icon: '💬', label: 'Chat Only' },
  { key: 'MEETUP', icon: '🍽️', label: 'Meetup' },
  { key: 'DATE', icon: '💃', label: 'Date' },
  { key: 'ADVENTURE', icon: '🔥', label: 'Adventure' },
  { key: 'VIP_EXPERIENCE', icon: '💎', label: 'VIP Experience' },
]

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const ZONE_PREFS = ['NIGHTLIFE', 'CAMPUS', 'BEACH', 'MARKET', 'EVENT', 'LOUNGE', 'RESIDENTIAL']

export default function KerawaCreatePage() {
  const r = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [identityLevel, setIdentityLevel] = useState('SHADOW')
  const [photos, setPhotos] = useState<string[]>([])
  const [mood, setMood] = useState('ADVENTUROUS')
  const [intent, setIntent] = useState('CHAT_ONLY')
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(35)
  const [distance, setDistance] = useState(10)
  const [genderPref, setGenderPref] = useState('All')
  const [zonePref, setZonePref] = useState<string[]>([])
  const [agreedTerms, setAgreedTerms] = useState(false)

  useEffect(() => {
    const s = document.createElement('style')
    s.textContent = `@keyframes kpulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 20px 10px rgba(239,68,68,.1)}}`
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  const STEPS = ['Identity', 'Photos', 'Intent', 'Preferences', 'Agreement']

  async function handleSubmit() {
    setLoading(true); setErr('')
    try {
      await kerawaApi.createProfile({
        displayName, bio, identityLevel, photos, mood, intent,
        preferences: { ageMin, ageMax, distance, genderPref, zoneTypes: zonePref },
      })
      r.push('/dashboard/kerawa')
    } catch (e: any) { setErr(e?.message || 'Failed to create profile') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: FIRE.bg, color: '#fff', fontFamily: 'monospace', padding: '0 0 100px' }}>
      {/* Progress */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? FIRE.primary : FIRE.border, transition: 'background .3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {STEPS.map((s, i) => (
            <span key={s} style={{ fontSize: 10, color: i <= step ? FIRE.primary : '#666' }}>{s}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>🔥 Create Kèréwà Identity</h1>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 24px' }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

        {/* STEP 0: Identity */}
        {step === 0 && (
          <div>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>Display Name (no real names)</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="FireSoul_237" style={{ width: '100%', padding: '12px 14px', background: FIRE.card, border: `1px solid ${FIRE.border}`, borderRadius: 10, color: '#fff', fontFamily: 'monospace', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />

            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginTop: 16, marginBottom: 6 }}>Bio (keep it mysterious)</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell them just enough..." rows={3} style={{ width: '100%', padding: '12px 14px', background: FIRE.card, border: `1px solid ${FIRE.border}`, borderRadius: 10, color: '#fff', fontFamily: 'monospace', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />

            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginTop: 20, marginBottom: 10 }}>Identity Level</label>
            {IDENTITY_LEVELS.map(lvl => (
              <div key={lvl.key} onClick={() => setIdentityLevel(lvl.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: identityLevel === lvl.key ? `${FIRE.primary}22` : FIRE.card, border: `1px solid ${identityLevel === lvl.key ? FIRE.primary : FIRE.border}`, borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{lvl.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{lvl.label}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{lvl.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Photos */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>Upload up to 6 photos. Blur level depends on your identity level.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: FIRE.card, borderRadius: 12, border: `1px dashed ${photos[i] ? FIRE.primary : FIRE.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#555', cursor: 'pointer' }} onClick={() => {
                  const mockUrl = `https://placeholder.co/300x300/1a1a1a/ef4444?text=Photo${i + 1}`
                  if (!photos[i]) setPhotos([...photos, mockUrl])
                }}>
                  {photos[i] ? '✅' : '+'}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', background: `${FIRE.primary}11`, borderRadius: 10, border: `1px solid ${FIRE.border}` }}>
              <div style={{ fontSize: 12, color: FIRE.light }}>🔒 Identity Level: <strong>{identityLevel}</strong></div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                {identityLevel === 'SHADOW' && 'Photos will be fully obscured — silhouette only'}
                {identityLevel === 'SILHOUETTE' && 'Photos will show blurred body shape'}
                {identityLevel === 'PARTIAL' && 'Photos lightly blurred — features visible'}
                {identityLevel === 'VERIFIED' && 'Photos clear — face verified'}
                {identityLevel === 'OPEN' && 'Full unblurred photos visible to matches'}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Intent */}
        {step === 2 && (
          <div>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 12 }}>What are you looking for?</label>
            {INTENTS.map(it => (
              <div key={it.key} onClick={() => setIntent(it.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: intent === it.key ? `${FIRE.primary}22` : FIRE.card, border: `1px solid ${intent === it.key ? FIRE.primary : FIRE.border}`, borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{it.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{it.label}</span>
              </div>
            ))}

            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginTop: 20, marginBottom: 12 }}>Current Mood</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['🔥 Adventurous', '💃 Social', '🎭 Mystery', '💎 VIP', '🌙 Chill', '⚡ Intense'].map(m => {
                const key = m.split(' ')[1].toUpperCase()
                return (
                  <div key={key} onClick={() => setMood(key)} style={{ padding: '8px 14px', borderRadius: 20, background: mood === key ? FIRE.primary : FIRE.card, border: `1px solid ${mood === key ? FIRE.primary : FIRE.border}`, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{m}</div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Preferences */}
        {step === 3 && (
          <div>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>Age Range: {ageMin} — {ageMax}</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <input type="range" min={18} max={60} value={ageMin} onChange={e => setAgeMin(+e.target.value)} style={{ flex: 1, accentColor: FIRE.primary }} />
              <input type="range" min={18} max={60} value={ageMax} onChange={e => setAgeMax(+e.target.value)} style={{ flex: 1, accentColor: FIRE.primary }} />
            </div>

            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 6 }}>Distance: {distance} km</label>
            <input type="range" min={1} max={50} value={distance} onChange={e => setDistance(+e.target.value)} style={{ width: '100%', accentColor: FIRE.primary, marginBottom: 16 }} />

            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 8 }}>Show me</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {['All', ...GENDER_OPTIONS].map(g => (
                <div key={g} onClick={() => setGenderPref(g)} style={{ padding: '8px 14px', borderRadius: 20, background: genderPref === g ? FIRE.primary : FIRE.card, border: `1px solid ${genderPref === g ? FIRE.primary : FIRE.border}`, fontSize: 12, cursor: 'pointer' }}>{g}</div>
              ))}
            </div>

            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 8 }}>Preferred Zone Types</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ZONE_PREFS.map(z => (
                <div key={z} onClick={() => setZonePref(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z])} style={{ padding: '8px 14px', borderRadius: 20, background: zonePref.includes(z) ? FIRE.primary : FIRE.card, border: `1px solid ${zonePref.includes(z) ? FIRE.primary : FIRE.border}`, fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>{z.toLowerCase()}</div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Agreement */}
        {step === 4 && (
          <div>
            <div style={{ padding: 16, background: FIRE.card, borderRadius: 12, border: `1px solid ${FIRE.border}`, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: FIRE.light }}>🛡️ Kèréwà Safety Covenant</h3>
              {[
                'I understand all chats expire in 48 hours unless both parties extend',
                'I will use the Panic Button if I ever feel unsafe — no judgement',
                'I consent to escrow-based meetups for financial safety',
                'I will not screenshot, record, or share private content',
                'I accept that violating consent rules results in permanent ban',
                'I understand trust scores are public and based on my behavior',
              ].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: FIRE.primary, fontSize: 14, marginTop: 1 }}>✦</span>
                  <span style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5 }}>{rule}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: 16, background: `${FIRE.primary}11`, borderRadius: 12, border: `1px solid ${FIRE.dark}`, marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 10px' }}>🚨 Panic Button Tutorial</h4>
              <p style={{ fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.6 }}>
                If you ever feel unsafe during a chat or meetup, press and hold the red panic button for 3 seconds.
                This will: capture your GPS, alert our safety team, optionally notify your emergency contacts,
                and freeze the other user&apos;s account pending review.
              </p>
            </div>

            <div onClick={() => setAgreedTerms(!agreedTerms)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', background: FIRE.card, borderRadius: 10, border: `1px solid ${agreedTerms ? FIRE.primary : FIRE.border}`, cursor: 'pointer' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: agreedTerms ? FIRE.primary : 'transparent', border: `2px solid ${agreedTerms ? FIRE.primary : '#555'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{agreedTerms ? '✓' : ''}</div>
              <span style={{ fontSize: 13 }}>I agree to the Kèréwà Safety Covenant</span>
            </div>

            {err && <div style={{ color: FIRE.primary, fontSize: 12, marginTop: 12 }}>{err}</div>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, #0a0a0a 30%)', display: 'flex', gap: 12 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '14px', borderRadius: 10, background: FIRE.card, border: `1px solid ${FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Back</button>
        )}
        {step < 4 ? (
          <button onClick={() => setStep(step + 1)} disabled={step === 0 && !displayName} style={{ flex: 2, padding: '14px', borderRadius: 10, background: (step === 0 && !displayName) ? '#333' : FIRE.primary, border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Next →</button>
        ) : (
          <button onClick={handleSubmit} disabled={!agreedTerms || loading} style={{ flex: 2, padding: '14px', borderRadius: 10, background: agreedTerms ? FIRE.primary : '#333', border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer', animation: agreedTerms ? 'kpulse 2s infinite' : 'none' }}>{loading ? 'Creating...' : '🔥 Enter the Zone'}</button>
        )}
      </div>
    </div>
  )
}
