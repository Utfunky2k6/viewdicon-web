/**
 * UFÈ — Settings
 * Every setting wired to a real action or sheet.
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import { RealmProvider, LWNav, LWText, LWCard, LWButton, LWSheet, LWInput, LWDivider } from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const T = REALM.ufe

interface SettingRow {
  label: string
  description?: string
  action: () => void
  destructive?: boolean
  toggle?: boolean
  toggleValue?: boolean
}

export default function UfeSettings() {
  const router = useRouter()
  const [pauseSheet, setPauseSheet] = React.useState(false)
  const [deleteSheet, setDeleteSheet] = React.useState(false)
  const [prefsSheet, setPrefsSheet] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [pauseLoading, setPauseLoading] = React.useState(false)

  // Preference state
  const [ageMin, setAgeMin] = React.useState('21')
  const [ageMax, setAgeMax] = React.useState('40')
  const [prefReligion, setPrefReligion] = React.useState('No preference')
  const [savingPrefs, setSavingPrefs] = React.useState(false)

  async function handlePause() {
    setPauseLoading(true)
    try {
      if (paused) {
        await loveWorldApi.resumeProfile()
        setPaused(false)
      } else {
        await loveWorldApi.pauseProfile()
        setPaused(true)
      }
    } catch (e) { logApiFailure('love/settings/pause', e) }
    setPauseLoading(false)
    setPauseSheet(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await loveWorldApi.updateProfile({ deleted: true })
      router.push('/dashboard/love')
    } catch (e) { logApiFailure('love/settings/delete', e) }
    setDeleting(false)
  }

  async function handleSavePrefs() {
    setSavingPrefs(true)
    try {
      await loveWorldApi.updateProfile({
        preferences: {
          ageMin: parseInt(ageMin),
          ageMax: parseInt(ageMax),
          religion: prefReligion === 'No preference' ? null : prefReligion,
        },
      })
    } catch (e) { logApiFailure('love/settings/prefs', e) }
    setSavingPrefs(false)
    setPrefsSheet(false)
  }

  const selectStyle: React.CSSProperties = {
    height: 44,
    padding: `0 ${SPACE[4]}px`,
    background: COLOR.elevated,
    border: `1px solid ${COLOR.border}`,
    borderRadius: RADIUS.lg,
    color: COLOR.textPrimary,
    fontSize: TYPE.body.fontSize,
    fontFamily: 'inherit',
    width: '100%',
  }

  const sections: { title: string; rows: SettingRow[] }[] = [
    {
      title: 'Profile',
      rows: [
        { label: 'Edit Profile', description: 'Update your information', action: () => router.push('/dashboard/love/create') },
        { label: 'Verification', description: 'Complete identity checks', action: () => router.push('/dashboard/love/verification') },
      ],
    },
    {
      title: 'Matching',
      rows: [
        { label: 'Match Preferences', description: 'Age, religion, values filters', action: () => setPrefsSheet(true) },
        { label: 'Blocked Users', description: 'Manage blocked profiles', action: () => router.push('/dashboard/love/settings/blocked') },
      ],
    },
    {
      title: 'Account',
      rows: [
        { label: 'Subscription', description: 'Manage your UFÈ Premium plan', action: () => router.push('/dashboard/upgrade') },
        { label: paused ? 'Resume Profile' : 'Pause Profile', description: paused ? 'Make your profile visible again' : 'Temporarily hide from matches', action: () => setPauseSheet(true) },
        { label: 'Delete Account', description: 'Permanently remove your Love World data', action: () => setDeleteSheet(true), destructive: true },
      ],
    },
  ]

  return (
    <RealmProvider realm="ufe">
      <LWNav title="Settings" backHref="/dashboard/love/ufe" backLabel="UFÈ" />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[12]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[5] }}>
        {sections.map(section => (
          <section key={section.title}>
            <LWText scale="micro" color="muted" as="h3" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: SPACE[3], padding: `0 ${SPACE[1]}px` }}>
              {section.title}
            </LWText>
            <LWCard padding={0}>
              {section.rows.map((row, i) => (
                <React.Fragment key={row.label}>
                  {i > 0 && <hr style={{ border: 'none', borderTop: `1px solid ${COLOR.border}`, margin: `0 ${SPACE[4]}px` }} />}
                  <button
                    onClick={row.action}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${SPACE[3]}px ${SPACE[4]}px`,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minHeight: 48,
                    }}
                  >
                    <div>
                      <LWText scale="body" as="span" style={{ fontWeight: 400, color: row.destructive ? COLOR.danger : COLOR.textPrimary }}>
                        {row.label}
                      </LWText>
                      {row.description && (
                        <LWText scale="caption" color="muted" as="div" style={{ marginTop: 1 }}>
                          {row.description}
                        </LWText>
                      )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: COLOR.textMuted, flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </React.Fragment>
              ))}
            </LWCard>
          </section>
        ))}
      </div>

      {/* Match Preferences Sheet */}
      <LWSheet open={prefsSheet} onClose={() => setPrefsSheet(false)} title="Match Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
          <div style={{ display: 'flex', gap: SPACE[3] }}>
            <div style={{ flex: 1 }}>
              <LWText scale="caption" color="secondary" as="label" style={{ marginBottom: SPACE[1], display: 'block' }}>Min Age</LWText>
              <LWInput type="number" value={ageMin} onChange={e => setAgeMin(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <LWText scale="caption" color="secondary" as="label" style={{ marginBottom: SPACE[1], display: 'block' }}>Max Age</LWText>
              <LWInput type="number" value={ageMax} onChange={e => setAgeMax(e.target.value)} />
            </div>
          </div>
          <div>
            <LWText scale="caption" color="secondary" as="label" style={{ marginBottom: SPACE[1], display: 'block' }}>Preferred Religion</LWText>
            <select value={prefReligion} onChange={e => setPrefReligion(e.target.value)} style={selectStyle}>
              <option>No preference</option>
              <option>Christianity</option>
              <option>Islam</option>
              <option>Traditional</option>
              <option>Hindu</option>
              <option>Buddhist</option>
              <option>Jewish</option>
              <option>Spiritual</option>
            </select>
          </div>
          <LWButton fullWidth loading={savingPrefs} onClick={handleSavePrefs}>
            Save Preferences
          </LWButton>
        </div>
      </LWSheet>

      {/* Pause Profile Sheet */}
      <LWSheet open={pauseSheet} onClose={() => setPauseSheet(false)} title={paused ? 'Resume Profile' : 'Pause Profile'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
          <LWText scale="body" color="secondary">
            {paused
              ? 'Your profile is currently hidden. Resume to start receiving matches again.'
              : 'Pausing your profile will hide you from all match queues. Your existing matches and conversations will be preserved.'
            }
          </LWText>
          <LWButton fullWidth variant={paused ? 'primary' : 'secondary'} loading={pauseLoading} onClick={handlePause}>
            {paused ? 'Resume Profile' : 'Pause My Profile'}
          </LWButton>
        </div>
      </LWSheet>

      {/* Delete Account Sheet */}
      <LWSheet open={deleteSheet} onClose={() => setDeleteSheet(false)} title="Delete Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
          <LWText scale="body" color="secondary">
            This will permanently delete your Love World profile, all matches, conversations, and history. This action cannot be undone.
          </LWText>
          <LWButton fullWidth variant="danger" loading={deleting} onClick={handleDelete}>
            Delete My Account Permanently
          </LWButton>
          <LWButton fullWidth variant="ghost" onClick={() => setDeleteSheet(false)}>
            Cancel
          </LWButton>
        </div>
      </LWSheet>
    </RealmProvider>
  )
}
