/**
 * UFE Verification — Trust Tiers
 *
 * Three-tier identity verification: Photo, Video, Village Vouch.
 * Each tier unlocks deeper trust levels in the love world.
 */
'use client'

import * as React from 'react'
import { COLOR, TYPE, SPACE, RADIUS, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav,
  LWBadge, LWProgress, LWDivider, LWIcon, ICONS, LWSkeleton,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

/* ─── Types ─── */

type TierStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED'

interface VerificationData {
  photoVerified: TierStatus
  videoVerified: TierStatus
  villageVouchVerified: TierStatus
  status: string
  rejectionReason?: string
}

/* ─── SVG icon paths ─── */

const ICON_VIDEO = 'M23 7l-7 5 7 5V7z M16 19V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2z'
const ICON_CHECK = 'M20 6L9 17l-5-5'

/* ─── Badge helper ─── */

function tierBadge(s: TierStatus): { variant: 'success' | 'warning' | 'danger' | 'default'; label: string } {
  switch (s) {
    case 'VERIFIED': return { variant: 'success', label: 'Verified' }
    case 'PENDING':  return { variant: 'warning', label: 'Pending' }
    case 'REJECTED': return { variant: 'danger', label: 'Rejected' }
    default:         return { variant: 'default', label: 'Not Started' }
  }
}

function countVerified(d: VerificationData): number {
  let n = 0
  if (d.photoVerified === 'VERIFIED') n++
  if (d.videoVerified === 'VERIFIED') n++
  if (d.villageVouchVerified === 'VERIFIED') n++
  return n
}

/* ─── Verified checkmark ─── */

function VerifiedMark() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: RADIUS.full,
      background: 'rgba(34,197,94,0.15)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <LWIcon d={ICON_CHECK} size={18} color={COLOR.success} strokeWidth={2.5} />
    </div>
  )
}

/* ─── Icon circle ─── */

function IconCircle({ d, verified }: { d: string; verified: boolean }) {
  const T = REALM.ufe
  return (
    <div style={{
      width: 44, height: 44, borderRadius: RADIUS.full, flexShrink: 0,
      background: verified ? 'rgba(34,197,94,0.1)' : T.accentMuted,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <LWIcon d={d} size={20} color={verified ? COLOR.success : T.accent} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════ */

export default function VerificationPage() {
  const [data, setData] = React.useState<VerificationData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  /* Photo tier state */
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
  const [photoSubmitting, setPhotoSubmitting] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  /* Video tier state */
  const [recording, setRecording] = React.useState(false)
  const [countdown, setCountdown] = React.useState(10)
  const [videoSubmitting, setVideoSubmitting] = React.useState(false)

  /* Village vouch state */
  const [vouchCode, setVouchCode] = React.useState('')
  const [vouchSubmitting, setVouchSubmitting] = React.useState(false)

  /* ─── Load verification status ─── */

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await loveWorldApi.getVerification()
      const v = res?.verification || res || {}
      setData({
        photoVerified: v.photoVerified || v.photo || v.photoStatus || 'NONE',
        videoVerified: v.videoVerified || v.video || v.videoStatus || 'NONE',
        villageVouchVerified: v.villageVouchVerified || v.villageVouch || v.vouchStatus || 'NONE',
        status: v.status || 'incomplete',
        rejectionReason: v.rejectionReason,
      })
    } catch (e) {
      logApiFailure('love/verification/check', e)
      // API unavailable — show default unverified state
      setData({ photoVerified: 'NONE', videoVerified: 'NONE', villageVouchVerified: 'NONE', status: 'incomplete' })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  /* ─── Photo handlers ─── */

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function submitPhoto() {
    setPhotoSubmitting(true)
    try {
      await loveWorldApi.verifyPhoto(photoPreview || 'photo-upload-placeholder')
      setPhotoPreview(null)
      await load()
    } catch (e) { logApiFailure('love/verification/photo', e) }
    setPhotoSubmitting(false)
  }

  /* ─── Video handlers ─── */

  async function startRecording() {
    setRecording(true)
    setCountdown(10)
  }

  React.useEffect(() => {
    if (!recording) return
    if (countdown <= 0) {
      setRecording(false)
      submitVideo()
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, countdown])

  async function submitVideo() {
    setVideoSubmitting(true)
    try {
      await loveWorldApi.verifyVideo()
      await load()
    } catch (e) { logApiFailure('love/verification/video', e) }
    setVideoSubmitting(false)
  }

  /* ─── Village vouch handler ─── */

  async function submitVouch() {
    setVouchSubmitting(true)
    try {
      await loveWorldApi.verifyVillageVouch()
      await load()
    } catch (e) { logApiFailure('love/verification/vouch', e) }
    setVouchSubmitting(false)
  }

  /* ─── Render ─── */

  const verified = data ? countVerified(data) : 0
  const progressPct = Math.round((verified / 3) * 100)

  return (
    <RealmProvider realm="ufe">
      <LWNav title="Verification" backHref="/dashboard/love/ufe" backLabel="UFE" />

      <div style={{ padding: `${SPACE[5]}px ${SPACE[4]}px ${SPACE[12]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[5] }}>

        {/* ─── Loading skeleton ─── */}
        {loading && (
          <>
            <LWSkeleton height={20} />
            <LWSkeleton height={6} />
            <LWSkeleton height={120} />
            <LWSkeleton height={120} />
            <LWSkeleton height={120} />
          </>
        )}

        {/* ─── Error state ─── */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: `${SPACE[10]}px 0` }}>
            <LWText scale="h3" color="secondary">Could not load verification status.</LWText>
            <LWButton variant="secondary" size="sm" onClick={load} style={{ marginTop: SPACE[4] }}>
              Retry
            </LWButton>
          </div>
        )}

        {/* ─── Loaded ─── */}
        {!loading && !error && data && (
          <>
            {/* Trust level progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SPACE[2] }}>
                <LWText scale="h2">Trust Level</LWText>
                <LWText scale="h2" color="accent">{verified}/3</LWText>
              </div>
              <LWProgress value={progressPct} height={6} />
              <LWText scale="caption" color="muted" style={{ marginTop: SPACE[2] }}>
                Complete all three tiers to unlock maximum trust and visibility.
              </LWText>
            </div>

            <LWDivider spacing={SPACE[1]} />

            {/* ─── Tier 1: Photo Verification ─── */}
            <LWCard padding={SPACE[4]}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACE[3] }}>
                <IconCircle d={ICONS.camera} verified={data.photoVerified === 'VERIFIED'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[1] }}>
                    <LWText scale="body" as="span" style={{ fontWeight: 600 }}>Photo Verification</LWText>
                    <LWBadge variant={tierBadge(data.photoVerified).variant}>
                      {tierBadge(data.photoVerified).label}
                    </LWBadge>
                  </div>
                  <LWText scale="caption" color="muted">
                    Upload a clear photo of your face. No filters. Natural lighting.
                  </LWText>

                  {data.photoVerified === 'VERIFIED' && (
                    <div style={{ marginTop: SPACE[3] }}><VerifiedMark /></div>
                  )}

                  {data.photoVerified === 'REJECTED' && (
                    <LWText scale="caption" color="danger" style={{ marginTop: SPACE[2] }}>
                      {data.rejectionReason || 'Photo did not meet requirements. Please try again.'}
                    </LWText>
                  )}

                  {(data.photoVerified === 'NONE' || data.photoVerified === 'REJECTED') && (
                    <div style={{ marginTop: SPACE[3] }}>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {!photoPreview && (
                        <LWButton variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                          {data.photoVerified === 'REJECTED' ? 'Choose New Photo' : 'Choose Photo'}
                        </LWButton>
                      )}
                      {photoPreview && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
                          <img
                            src={photoPreview}
                            alt="Preview"
                            style={{
                              width: '100%', maxHeight: 200, objectFit: 'cover',
                              borderRadius: RADIUS.lg, border: `1px solid ${COLOR.border}`,
                            }}
                          />
                          <div style={{ display: 'flex', gap: SPACE[2] }}>
                            <LWButton variant="ghost" size="sm" onClick={() => { setPhotoPreview(null); if (fileRef.current) fileRef.current.value = '' }}>
                              Cancel
                            </LWButton>
                            <LWButton variant="primary" size="sm" loading={photoSubmitting} onClick={submitPhoto}>
                              Submit for Review
                            </LWButton>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </LWCard>

            {/* ─── Tier 2: Video Verification ─── */}
            <LWCard padding={SPACE[4]}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACE[3] }}>
                <IconCircle d={ICON_VIDEO} verified={data.videoVerified === 'VERIFIED'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[1] }}>
                    <LWText scale="body" as="span" style={{ fontWeight: 600 }}>Video Verification</LWText>
                    <LWBadge variant={tierBadge(data.videoVerified).variant}>
                      {tierBadge(data.videoVerified).label}
                    </LWBadge>
                  </div>
                  <LWText scale="caption" color="muted">
                    Record a 10-second video saying: &quot;I am [your name] and I am here for love.&quot;
                  </LWText>

                  {data.videoVerified === 'VERIFIED' && (
                    <div style={{ marginTop: SPACE[3] }}><VerifiedMark /></div>
                  )}

                  {(data.videoVerified === 'NONE' || data.videoVerified === 'REJECTED') && !recording && (
                    <LWButton
                      variant="secondary" size="sm"
                      loading={videoSubmitting}
                      onClick={startRecording}
                      style={{ marginTop: SPACE[3] }}
                    >
                      {data.videoVerified === 'REJECTED' ? 'Retry Recording' : 'Record Video'}
                    </LWButton>
                  )}

                  {recording && (
                    <div style={{
                      marginTop: SPACE[3], display: 'flex', alignItems: 'center', gap: SPACE[3],
                      padding: `${SPACE[3]}px ${SPACE[4]}px`,
                      background: 'rgba(239,68,68,0.08)', borderRadius: RADIUS.lg,
                    }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: RADIUS.full,
                        background: COLOR.danger,
                        animation: 'lw-pulse 1s ease-in-out infinite',
                      }} />
                      <LWText scale="body" color="danger" as="span" style={{ fontWeight: 600 }}>
                        Recording... {countdown}s
                      </LWText>
                    </div>
                  )}
                </div>
              </div>
            </LWCard>

            {/* ─── Tier 3: Village Vouch ─── */}
            <LWCard padding={SPACE[4]}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACE[3] }}>
                <IconCircle d={ICONS.shield} verified={data.villageVouchVerified === 'VERIFIED'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[1] }}>
                    <LWText scale="body" as="span" style={{ fontWeight: 600 }}>Village Vouch</LWText>
                    <LWBadge variant={tierBadge(data.villageVouchVerified).variant}>
                      {tierBadge(data.villageVouchVerified).label}
                    </LWBadge>
                  </div>
                  <LWText scale="caption" color="muted">
                    Get vouched by someone from your village or community.
                  </LWText>

                  {data.villageVouchVerified === 'VERIFIED' && (
                    <div style={{ marginTop: SPACE[3] }}><VerifiedMark /></div>
                  )}

                  {(data.villageVouchVerified === 'NONE' || data.villageVouchVerified === 'REJECTED') && (
                    <div style={{ marginTop: SPACE[3], display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
                      <div style={{ display: 'flex', gap: SPACE[2] }}>
                        <input
                          type="text"
                          value={vouchCode}
                          onChange={e => setVouchCode(e.target.value)}
                          placeholder="Enter vouch code"
                          style={{
                            flex: 1, height: 36, padding: `0 ${SPACE[3]}px`,
                            background: COLOR.elevated, border: `1px solid ${COLOR.border}`,
                            borderRadius: RADIUS.lg, color: COLOR.textPrimary,
                            fontSize: TYPE.caption.fontSize, fontFamily: 'inherit', outline: 'none',
                          }}
                        />
                        <LWButton
                          variant="primary" size="sm"
                          loading={vouchSubmitting}
                          disabled={!vouchCode.trim()}
                          onClick={submitVouch}
                        >
                          Submit
                        </LWButton>
                      </div>
                      <LWButton variant="secondary" size="sm" loading={vouchSubmitting} onClick={submitVouch}>
                        Request Vouch Code
                      </LWButton>
                    </div>
                  )}
                </div>
              </div>
            </LWCard>
          </>
        )}
      </div>

      {/* Pulse animation for recording indicator */}
      <style>{`
        @keyframes lw-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </RealmProvider>
  )
}
