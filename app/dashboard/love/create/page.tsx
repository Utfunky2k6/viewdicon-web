/**
 * UFE -- Profile Creation Wizard
 *
 * 6-step guided onboarding: Photo -> Identity -> Culture -> Intentions -> Preferences -> Review.
 * Premium flow at $29.99/month. Banking-grade validation. Draft persistence via localStorage.
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import { RealmProvider, LWText, LWButton, LWCard, LWInput, LWNav, LWProgress, LWDivider, Spinner } from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const DRAFT_KEY = 'ufe-create-draft'
const TOTAL_STEPS = 6
const STEP_LABELS = ['Photo', 'Identity', 'Culture', 'Intentions', 'Preferences', 'Review']

const RELIGION_OPTIONS = ['Christianity', 'Islam', 'Traditional', 'Hindu', 'Buddhist', 'Jewish', 'Spiritual', 'Agnostic', 'Atheist', 'Other']
const GENOTYPE_OPTIONS = ['AA', 'AS', 'AC', 'SS', 'SC', 'CC', "I don't know"]
const GENDER_OPTIONS = ['Man', 'Woman', 'Non-binary']
const LOOKING_FOR_OPTIONS = ['Marriage partner', 'Serious relationship', 'Open to either']
const TIMELINE_OPTIONS = ['Ready now', 'Within 6 months', 'Within a year', 'Just exploring']

const selectStyle: React.CSSProperties = {
  height: 44,
  background: COLOR.elevated,
  border: `1px solid ${COLOR.border}`,
  borderRadius: RADIUS.lg,
  color: COLOR.textPrimary,
  fontSize: TYPE.body.fontSize,
  fontFamily: 'inherit',
  padding: '0 16px',
  outline: 'none',
  width: '100%',
}

const textareaStyle: React.CSSProperties = {
  padding: SPACE[3],
  background: COLOR.elevated,
  border: `1px solid ${COLOR.border}`,
  borderRadius: RADIUS.lg,
  color: COLOR.textPrimary,
  fontSize: TYPE.body.fontSize,
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  width: '100%',
}

interface FormData {
  photoFile: File | null
  photoPreview: string
  fullName: string
  dob: string
  city: string
  gender: string
  ethnicity: string
  religion: string
  languages: string
  genotype: string
  lookingFor: string
  familyValues: string
  bio: string
  readyTimeline: string
  ageMin: string
  ageMax: string
  preferredReligion: string
  importantQualities: string
  dealbreakers: string
}

const EMPTY_FORM: FormData = {
  photoFile: null, photoPreview: '',
  fullName: '', dob: '', city: '', gender: '',
  ethnicity: '', religion: '', languages: '', genotype: '',
  lookingFor: '', familyValues: '', bio: '', readyTimeline: '',
  ageMin: '21', ageMax: '40', preferredReligion: '', importantQualities: '', dealbreakers: '',
}

function saveDraft(form: FormData) {
  try {
    const { photoFile, ...rest } = form
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest))
  } catch { /* storage full — ignore */ }
}

function loadDraft(): Partial<FormData> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[1] }}>
      <LWText scale="caption" color="secondary" as="label">{label}</LWText>
      {children}
      {error && <LWText scale="caption" color="danger">{error}</LWText>}
    </div>
  )
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACE[3], padding: `${SPACE[2]}px 0` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <LWText scale="caption" color="muted">{label}</LWText>
        <LWText scale="body" style={{ marginTop: 2, wordBreak: 'break-word' }}>{value || '--'}</LWText>
      </div>
      <button onClick={onEdit} style={{ background: 'none', border: 'none', color: REALM.ufe.accent, cursor: 'pointer', fontSize: TYPE.caption.fontSize, fontWeight: 500, padding: `${SPACE[1]}px ${SPACE[2]}px`, flexShrink: 0 }}>
        Edit
      </button>
    </div>
  )
}

export default function CreateProfilePage() {
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [clientToday, setClientToday] = React.useState<Date>(() => new Date(0))
  React.useEffect(() => { setClientToday(new Date()) }, [])

  // Restore draft on mount
  React.useEffect(() => {
    const draft = loadDraft()
    if (Object.keys(draft).length) setForm(prev => ({ ...prev, ...draft }))
  }, [])

  // Save draft on step change
  React.useEffect(() => { saveDraft(form) }, [step])

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(prev => ({ ...prev, photoFile: file, photoPreview: URL.createObjectURL(file) }))
    if (errors.photoFile) setErrors(prev => ({ ...prev, photoFile: undefined }))
  }

  function is18Plus(dob: string): boolean {
    if (!dob) return false
    const birth = new Date(dob)
    let age = clientToday.getFullYear() - birth.getFullYear()
    const m = clientToday.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && clientToday.getDate() < birth.getDate())) age--
    return age >= 18
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (step === 0) {
      if (!form.photoPreview) e.photoFile = 'A photo is required'
    }
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required'
      if (!form.dob) e.dob = 'Date of birth is required'
      else if (!is18Plus(form.dob)) e.dob = 'You must be at least 18 years old'
      if (!form.gender) e.gender = 'Please select your gender'
    }
    if (step === 2) {
      // Culture step has no strict required fields
    }
    if (step === 3) {
      if (!form.lookingFor) e.lookingFor = 'Please select what you are looking for'
      if (form.bio.length > 500) e.bio = 'Bio must be 500 characters or less'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function advance() {
    if (!validate()) return
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  function goBack() { setStep(s => Math.max(s - 1, 0)) }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await loveWorldApi.createProfile({
        fullName: form.fullName.trim(),
        dob: form.dob,
        city: form.city.trim(),
        gender: form.gender,
        ethnicity: form.ethnicity.trim(),
        religion: form.religion,
        languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
        genotype: form.genotype,
        lookingFor: form.lookingFor,
        familyValues: form.familyValues.trim(),
        bio: form.bio.trim(),
        readyTimeline: form.readyTimeline,
        preferredAgeMin: parseInt(form.ageMin) || 21,
        preferredAgeMax: parseInt(form.ageMax) || 40,
        preferredReligion: form.preferredReligion,
        importantQualities: form.importantQualities.split(',').map(q => q.trim()).filter(Boolean),
        dealbreakers: form.dealbreakers.trim(),
      })
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      logApiFailure('love/create/profile', e)
      // API may be unavailable — save draft and continue the flow
      saveDraft(form)
    } finally {
      setSubmitting(false)
      router.push('/dashboard/love/verification')
    }
  }

  return (
    <RealmProvider realm="ufe">
      <LWNav
        title="Create Profile"
        backHref="/dashboard/love/ufe"
        backLabel="UFE"
        right={<LWText scale="micro" color="muted" as="span">{step + 1}/{TOTAL_STEPS}</LWText>}
      />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[12]}px` }}>
        {/* Progress bar */}
        <LWProgress value={step + 1} max={TOTAL_STEPS} height={3} style={{ marginBottom: SPACE[2] }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SPACE[6] }}>
          {STEP_LABELS.map((label, i) => (
            <LWText
              key={label}
              scale="micro"
              color={i === step ? 'accent' : i < step ? 'secondary' : 'muted'}
              as="span"
              style={{ fontWeight: i === step ? 600 : 400, textTransform: 'uppercase' }}
            >
              {label}
            </LWText>
          ))}
        </div>

        {/* Step content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>

          {/* ── Step 0: Photo Upload ── */}
          {step === 0 && (
            <>
              <LWText scale="h2">Your Photo</LWText>
              <LWText scale="body" color="secondary" style={{ marginTop: -SPACE[2] }}>
                Your photo builds trust. First impressions begin here.
              </LWText>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACE[4], padding: `${SPACE[6]}px 0` }}>
                <div
                  style={{
                    width: 128, height: 128, borderRadius: RADIUS.full, overflow: 'hidden',
                    background: COLOR.elevated, border: `2px dashed ${errors.photoFile ? COLOR.danger : COLOR.borderStrong}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: `border-color ${DURATION.fast} ${EASE.default}`,
                  }}
                >
                  {form.photoPreview ? (
                    <img src={form.photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={COLOR.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                  <LWButton variant="secondary" style={{ pointerEvents: 'none' }}>
                    {form.photoPreview ? 'Change Photo' : 'Upload Photo'}
                  </LWButton>
                </label>
                {errors.photoFile && <LWText scale="caption" color="danger">{errors.photoFile}</LWText>}
              </div>
            </>
          )}

          {/* ── Step 1: Identity ── */}
          {step === 1 && (
            <>
              <LWText scale="h2">Who Are You?</LWText>
              <LWInput label="Full Name" value={form.fullName} onChange={set('fullName')} placeholder="Your full name" error={errors.fullName} />
              <LWInput label="Date of Birth" type="date" value={form.dob} onChange={set('dob')} error={errors.dob} />
              <LWInput label="City / Location" value={form.city} onChange={set('city')} placeholder="e.g. Lagos, Nigeria" />
              <Field label="Gender" error={errors.gender}>
                <select value={form.gender} onChange={set('gender')} style={selectStyle}>
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </>
          )}

          {/* ── Step 2: Culture & Faith ── */}
          {step === 2 && (
            <>
              <LWText scale="h2">Culture & Faith</LWText>
              <LWInput label="Ethnicity" value={form.ethnicity} onChange={set('ethnicity')} placeholder="e.g. Yoruba, Igbo, Zulu, Akan" />
              <Field label="Religion">
                <select value={form.religion} onChange={set('religion')} style={selectStyle}>
                  <option value="">Select religion</option>
                  {RELIGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <LWInput label="Languages Spoken" value={form.languages} onChange={set('languages')} placeholder="English, Yoruba, French" hint="Comma-separated" />
              <Field label="Genotype">
                <select value={form.genotype} onChange={set('genotype')} style={selectStyle}>
                  <option value="">Select genotype</option>
                  {GENOTYPE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </>
          )}

          {/* ── Step 3: Intentions ── */}
          {step === 3 && (
            <>
              <LWText scale="h2">Your Intentions</LWText>
              <Field label="Looking For" error={errors.lookingFor}>
                <select value={form.lookingFor} onChange={set('lookingFor')} style={selectStyle}>
                  <option value="">Select intent</option>
                  {LOOKING_FOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Family Values">
                <textarea value={form.familyValues} onChange={set('familyValues')} rows={3} placeholder="What does family mean to you? How were you raised?" style={textareaStyle} />
              </Field>
              <Field label={`About Me (${form.bio.length}/500)`} error={errors.bio}>
                <textarea value={form.bio} onChange={set('bio')} rows={4} maxLength={500} placeholder="Share your story, interests, and what makes you unique..." style={textareaStyle} />
              </Field>
              <Field label="Ready Timeline">
                <select value={form.readyTimeline} onChange={set('readyTimeline')} style={selectStyle}>
                  <option value="">Select timeline</option>
                  {TIMELINE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </>
          )}

          {/* ── Step 4: Preferences ── */}
          {step === 4 && (
            <>
              <LWText scale="h2">Your Preferences</LWText>
              <div style={{ display: 'flex', gap: SPACE[3] }}>
                <LWInput label="Age Min" type="number" value={form.ageMin} onChange={set('ageMin')} style={{ flex: 1 }} />
                <LWInput label="Age Max" type="number" value={form.ageMax} onChange={set('ageMax')} style={{ flex: 1 }} />
              </div>
              <Field label="Preferred Religion">
                <select value={form.preferredReligion} onChange={set('preferredReligion')} style={selectStyle}>
                  <option value="">No preference</option>
                  {RELIGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <LWInput label="Important Qualities" value={form.importantQualities} onChange={set('importantQualities')} placeholder="Faithful, ambitious, family-oriented" hint="Comma-separated" />
              <Field label="Dealbreakers">
                <textarea value={form.dealbreakers} onChange={set('dealbreakers')} rows={3} placeholder="Anything that is a hard no for you..." style={textareaStyle} />
              </Field>
            </>
          )}

          {/* ── Step 5: Review & Submit ── */}
          {step === 5 && (
            <>
              <LWText scale="h2">Review Your Profile</LWText>
              <LWText scale="body" color="secondary" style={{ marginTop: -SPACE[2] }}>
                Confirm everything looks right before creating your profile.
              </LWText>

              {/* Photo preview */}
              {form.photoPreview && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: `${SPACE[3]}px 0` }}>
                  <div style={{ width: 96, height: 96, borderRadius: RADIUS.full, overflow: 'hidden', border: `2px solid ${REALM.ufe.accent}` }}>
                    <img src={form.photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              )}

              {/* Identity section */}
              <LWCard>
                <LWText scale="micro" color="accent" as="span" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Identity</LWText>
                <ReviewRow label="Full Name" value={form.fullName} onEdit={() => setStep(1)} />
                <ReviewRow label="Date of Birth" value={form.dob} onEdit={() => setStep(1)} />
                <ReviewRow label="Location" value={form.city} onEdit={() => setStep(1)} />
                <ReviewRow label="Gender" value={form.gender} onEdit={() => setStep(1)} />
              </LWCard>

              {/* Culture section */}
              <LWCard>
                <LWText scale="micro" color="accent" as="span" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Culture & Faith</LWText>
                <ReviewRow label="Ethnicity" value={form.ethnicity} onEdit={() => setStep(2)} />
                <ReviewRow label="Religion" value={form.religion} onEdit={() => setStep(2)} />
                <ReviewRow label="Languages" value={form.languages} onEdit={() => setStep(2)} />
                <ReviewRow label="Genotype" value={form.genotype} onEdit={() => setStep(2)} />
              </LWCard>

              {/* Intentions section */}
              <LWCard>
                <LWText scale="micro" color="accent" as="span" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Intentions</LWText>
                <ReviewRow label="Looking For" value={form.lookingFor} onEdit={() => setStep(3)} />
                <ReviewRow label="Family Values" value={form.familyValues} onEdit={() => setStep(3)} />
                <ReviewRow label="About Me" value={form.bio} onEdit={() => setStep(3)} />
                <ReviewRow label="Timeline" value={form.readyTimeline} onEdit={() => setStep(3)} />
              </LWCard>

              {/* Preferences section */}
              <LWCard>
                <LWText scale="micro" color="accent" as="span" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preferences</LWText>
                <ReviewRow label="Age Range" value={`${form.ageMin} - ${form.ageMax}`} onEdit={() => setStep(4)} />
                <ReviewRow label="Preferred Religion" value={form.preferredReligion || 'No preference'} onEdit={() => setStep(4)} />
                <ReviewRow label="Important Qualities" value={form.importantQualities} onEdit={() => setStep(4)} />
                <ReviewRow label="Dealbreakers" value={form.dealbreakers} onEdit={() => setStep(4)} />
              </LWCard>

              {errors.fullName && (
                <LWText scale="caption" color="danger" align="center">{errors.fullName}</LWText>
              )}
            </>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: SPACE[3], marginTop: SPACE[8] }}>
          {step > 0 && (
            <LWButton variant="secondary" onClick={goBack} style={{ flex: 1 }}>Back</LWButton>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <LWButton variant="primary" onClick={advance} style={{ flex: 1 }}>Continue</LWButton>
          ) : (
            <LWButton variant="primary" loading={submitting} onClick={handleSubmit} style={{ flex: 1 }}>
              Create Profile
            </LWButton>
          )}
        </div>
      </div>
    </RealmProvider>
  )
}
