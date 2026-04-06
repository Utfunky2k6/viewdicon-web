'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { loveWorldApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const FAMILY_PLANS = ['Want children', 'Open to children', 'Do not want children', 'Already have children', 'Prefer not to say']
const EDUCATION = ['High school', 'Undergraduate', 'Graduate', 'Postgraduate', 'Trade/Vocational', 'Self-taught']
const DIETARY = ['No preference', 'Halal', 'Vegetarian', 'Vegan', 'Pescatarian', 'Kosher']
const LIFESTYLE = ['Homebody', 'Adventurer', 'Balanced', 'Night owl', 'Early riser', 'Traveler']
const LOVE_LANGS = ['Words of Affirmation', 'Quality Time', 'Acts of Service', 'Physical Touch', 'Receiving Gifts']

export default function LoveSettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [paused, setPaused] = React.useState(false)
  const [ageMin, setAgeMin] = React.useState(21)
  const [ageMax, setAgeMax] = React.useState(40)
  const [faith, setFaith] = React.useState(50)
  const [familyPlan, setFamilyPlan] = React.useState(FAMILY_PLANS[0])
  const [education, setEducation] = React.useState(EDUCATION[0])
  const [dietary, setDietary] = React.useState(DIETARY[0])
  const [lifestyle, setLifestyle] = React.useState(LIFESTYLE[0])
  const [loveLang, setLoveLang] = React.useState(LOVE_LANGS[0])
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [showDeactivate, setShowDeactivate] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loveWorldApi.getMyProfile().then(p => {
      if (!p) return
      setPaused(p.paused || false)
      if (p.ageMin) setAgeMin(p.ageMin)
      if (p.ageMax) setAgeMax(p.ageMax)
      if (p.faithImportance != null) setFaith(p.faithImportance)
      if (p.familyPlan) setFamilyPlan(p.familyPlan)
      if (p.education) setEducation(p.education)
      if (p.dietary) setDietary(p.dietary)
      if (p.lifestyle) setLifestyle(p.lifestyle)
      if (p.loveLang) setLoveLang(p.loveLang)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const togglePause = async () => {
    try {
      if (paused) await loveWorldApi.resumeProfile()
      else await loveWorldApi.pauseProfile()
      setPaused(!paused)
    } catch {}
  }

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      await loveWorldApi.updateProfile({ ageMin, ageMax, faithImportance: faith, familyPlan, education, dietary, lifestyle, loveLang })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  const box: React.CSSProperties = { background: '#111118', borderRadius: 12, padding: 16, marginBottom: 14 }
  const label: React.CSSProperties = { fontSize: 13, color: '#aaa', marginBottom: 6, display: 'block' }
  const sel: React.CSSProperties = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #333', background: '#1A1A25', color: '#fff', fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box' as const }

  if (loading) return <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push('/dashboard/love')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: 22, cursor: 'pointer' }}>&#8592;</button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Love Settings</h1>
      </div>

      {/* Visibility toggle */}
      <div style={{ ...box, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>Profile Visibility</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{paused ? 'Paused — hidden from matches' : 'Active — visible to matches'}</div>
        </div>
        <button onClick={togglePause} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: paused ? '#FF3B30' : '#00C853', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Age range */}
      <div style={box}>
        <span style={label}>Age Range: {ageMin} — {ageMax}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="range" min={18} max={60} value={ageMin} onChange={e => setAgeMin(Math.min(+e.target.value, ageMax - 1))} style={{ flex: 1, accentColor: '#D4AF37' }} />
          <input type="range" min={18} max={60} value={ageMax} onChange={e => setAgeMax(Math.max(+e.target.value, ageMin + 1))} style={{ flex: 1, accentColor: '#D4AF37' }} />
        </div>
      </div>

      {/* Faith importance */}
      <div style={box}>
        <span style={label}>Faith Importance: {faith}%</span>
        <input type="range" min={0} max={100} value={faith} onChange={e => setFaith(+e.target.value)} style={{ width: '100%', accentColor: '#D4AF37' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666', marginTop: 4 }}>
          <span>Not important</span><span>Very important</span>
        </div>
      </div>

      {/* Dropdowns */}
      {[
        { lbl: 'Family Plan', val: familyPlan, set: setFamilyPlan, opts: FAMILY_PLANS },
        { lbl: 'Education', val: education, set: setEducation, opts: EDUCATION },
        { lbl: 'Dietary', val: dietary, set: setDietary, opts: DIETARY },
        { lbl: 'Lifestyle', val: lifestyle, set: setLifestyle, opts: LIFESTYLE },
        { lbl: 'Love Language', val: loveLang, set: setLoveLang, opts: LOVE_LANGS },
      ].map(d => (
        <div key={d.lbl} style={box}>
          <span style={label}>{d.lbl}</span>
          <select value={d.val} onChange={e => d.set(e.target.value)} style={sel}>
            {d.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}

      {/* Save */}
      <button onClick={save} disabled={saving} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: '#D4AF37', color: '#0A0A0F', fontFamily: 'monospace', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 20 }}>
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
      </button>

      {/* Danger zone */}
      <div style={{ ...box, border: '1px solid #FF3B3044' }}>
        <div style={{ fontWeight: 700, color: '#FF3B30', marginBottom: 8 }}>Danger Zone</div>
        {!showDeactivate ? (
          <button onClick={() => setShowDeactivate(true)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #FF3B30', background: 'transparent', color: '#FF3B30', fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }}>Deactivate Profile</button>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: '#FF3B30', marginBottom: 10 }}>This will hide your profile and remove you from all match queues. You can re-activate later.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { loveWorldApi.pauseProfile(); router.push('/dashboard/love') }} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#FF3B30', color: '#fff', fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
              <button onClick={() => setShowDeactivate(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#fff', fontFamily: 'monospace', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Back link */}
      <button onClick={() => router.push('/dashboard/love')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontFamily: 'monospace', fontSize: 14, cursor: 'pointer', marginTop: 10, padding: 0 }}>&#8592; Back to Love World</button>
    </div>
  )
}
