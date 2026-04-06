'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ALL_VILLAGES, VILLAGE_BY_ID } from '@/lib/villages-data'
import {
  TRANSFER_RULES,
  REPORT_QUESTIONS,
  CREST_TRANSFER_BONUS,
  type TransferReason,
  type TransferRule,
  getTransferRule,
  calculateCooldown,
} from '@/constants/village-transfer'
import { useAuthStore } from '@/stores/authStore'

// ── Types ────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5

interface ReportAnswers {
  [key: string]: string
}

interface TransferApp {
  id: string
  fromVillageId: string
  toVillageId: string
  reason: string
  submittedAt: number
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'COOLING' | 'APPROVED' | 'DENIED'
  cooldownDays: number
  decisionAt?: number
}

// ── Progress step labels (African-themed) ────────────────────
const STEP_LABELS: { step: Step; emoji: string; label: string }[] = [
  { step: 1, emoji: '\u{1F3D8}', label: 'Destination' },
  { step: 2, emoji: '\u{1F4DC}', label: 'Reason' },
  { step: 3, emoji: '\u270D\uFE0F', label: 'Report' },
  { step: 4, emoji: '\u{1F441}', label: 'Review' },
  { step: 5, emoji: '\u2705',    label: 'Done' },
]

// ── Helpers ──────────────────────────────────────────────────
function formatWait(days: number): string {
  if (days === 0) return 'Immediate'
  if (days <= 7) return `${days} Sunsets`
  if (days <= 30) return '1 Moon'
  return `${Math.ceil(days / 30)} Moons`
}

function futureDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function generateTransferId(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `TR-${num}`
}

// ── Suspense wrapper (Next.js 14 requires this for useSearchParams) ──
export default function VillageTransferPageWrapper() {
  return (
    <React.Suspense fallback={
      <div style={{ background: '#050a06', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, fontWeight: 600 }}>Loading transfer...</div>
      </div>
    }>
      <VillageTransferPage />
    </React.Suspense>
  )
}

// ── Main page component ──────────────────────────────────────
function VillageTransferPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const CURRENT_CREST = (user as any)?.crestTier || 'I'
  const CURRENT_VILLAGE = (user as any)?.villageId || ''

  // Pre-fill from query params (?from=commerce&to=technology)
  const qFrom = searchParams.get('from') || CURRENT_VILLAGE
  const qTo = searchParams.get('to') || ''

  const [step, setStep] = React.useState<Step>(1)
  const [fromVillageId] = React.useState(qFrom)
  const [toVillageId, setToVillageId] = React.useState(qTo)
  const [selectedReason, setSelectedReason] = React.useState<TransferReason | null>(null)
  const [reportAnswers, setReportAnswers] = React.useState<ReportAnswers>({})
  const [expedited, setExpedited] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [transferId, setTransferId] = React.useState('')

  const fromVillage = VILLAGE_BY_ID[fromVillageId]
  const toVillage = toVillageId ? VILLAGE_BY_ID[toVillageId] : null
  const destinations = ALL_VILLAGES.filter((v) => v.id !== fromVillageId && !v.holding)

  const rule: TransferRule | null = selectedReason ? getTransferRule(selectedReason) : null
  const cooldown = selectedReason
    ? calculateCooldown(selectedReason, CURRENT_CREST, expedited)
    : null

  // ── Validation ─────────────────────────────────────────────
  const canProceedFromStep = (s: Step): boolean => {
    switch (s) {
      case 1:
        return !!toVillageId
      case 2:
        return !!selectedReason
      case 3: {
        if (!rule) return false
        if (!rule.requiresReport) return true
        return REPORT_QUESTIONS.every((q) => {
          if (!q.required) return true
          const val = (reportAnswers[q.key] || '').trim()
          return val.length >= q.minLength
        })
      }
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (step === 4) {
      setSubmitting(true)
      try {
        // Get user afroId from auth store
        const userAfroId = (user as any)?.afroId || ''
        const reportNote = Object.entries(reportAnswers)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')

        const res = await fetch('/api/v1/village-transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAfroId,
            fromVillageId,
            toVillageId,
            reason: selectedReason,
            note: reportNote || undefined,
          }),
        })

        const data = await res.json()
        if (res.ok && data.data?.id) {
          // Auto-confirm for now (MULTI_VILLAGE and circle-1 users)
          await fetch(`/api/v1/village-transfers/${data.data.id}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          setTransferId(data.data.id.slice(0, 8).toUpperCase())
        } else {
          setTransferId(generateTransferId())
        }
      } catch {
        setTransferId(generateTransferId())
      }
      setSubmitting(false)

      // Save transfer application to localStorage for My Applications page
      try {
        const savedCooldown = cooldown || { days: 0, label: 'Immediate' }
        const savedCooldownDays = savedCooldown.days
        const appId = transferId || generateTransferId()
        const existingRaw = localStorage.getItem('village_transfer_apps')
        const existing: TransferApp[] = existingRaw ? JSON.parse(existingRaw) : []
        const newApp: TransferApp = {
          id: appId,
          fromVillageId,
          toVillageId,
          reason: (selectedReason as string) ?? '',
          submittedAt: Date.now(),
          status: savedCooldownDays === 0 ? 'APPROVED' : rule?.requiresElder ? 'UNDER_REVIEW' : 'COOLING',
          cooldownDays: savedCooldownDays,
        }
        existing.unshift(newApp)
        localStorage.setItem('village_transfer_apps', JSON.stringify(existing))
      } catch { /* ignore localStorage errors */ }

      setStep(5)
      return
    }
    // If reason is GRIOT_GUIDANCE and no report needed, skip step 3
    if (step === 2 && rule && !rule.requiresReport) {
      setStep(4)
      return
    }
    setStep(((step + 1) as Step))
  }

  const handleBack = () => {
    if (step === 1) {
      router.back()
      return
    }
    // If on review and reason skipped report, go back to reason
    if (step === 4 && rule && !rule.requiresReport) {
      setStep(2)
      return
    }
    setStep(((step - 1) as Step))
  }

  // ── Progress bar ───────────────────────────────────────────
  const renderProgress = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, padding: '16px 12px 8px', overflowX: 'auto',
    }}>
      {STEP_LABELS.map((sl, i) => {
        const isActive = sl.step === step
        const isDone = sl.step < step
        return (
          <React.Fragment key={sl.step}>
            {i > 0 && (
              <div style={{
                width: 24, height: 2, flexShrink: 0,
                background: isDone ? '#1a7c3e' : 'rgba(255,255,255,.1)',
                borderRadius: 1,
              }} />
            )}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, flexShrink: 0, minWidth: 52,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 99,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
                background: isDone
                  ? 'rgba(26,124,62,.25)'
                  : isActive
                    ? 'rgba(26,124,62,.4)'
                    : 'rgba(255,255,255,.05)',
                border: isActive
                  ? '2px solid #1a7c3e'
                  : isDone
                    ? '2px solid rgba(26,124,62,.5)'
                    : '2px solid rgba(255,255,255,.08)',
                transition: 'all .2s',
              }}>
                {isDone ? '\u2713' : sl.emoji}
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '.04em',
                color: isActive ? '#4ade80' : isDone ? 'rgba(74,222,128,.6)' : 'rgba(255,255,255,.25)',
                textTransform: 'uppercase',
              }}>
                {sl.label}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )

  // ── Step 1: Select Destination ─────────────────────────────
  const renderStep1 = () => (
    <div style={{ padding: '0 14px' }}>
      {/* Current village banner */}
      {fromVillage && (
        <div style={{
          borderRadius: 16, padding: '14px 16px', marginBottom: 18,
          background: `linear-gradient(135deg, ${fromVillage.color}22, ${fromVillage.color}08)`,
          border: `1.5px solid ${fromVillage.color}35`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${fromVillage.color}cc, ${fromVillage.color}55)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>
            {fromVillage.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Your Current Village
            </div>
            <div style={{ fontFamily: '"Cinzel","Palatino",serif', fontSize: 15, fontWeight: 800, color: fromVillage.color, marginTop: 2, letterSpacing: '0.04em' }}>
              {fromVillage.ancientName}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontWeight: 600, marginTop: 1 }}>
              {fromVillage.nationFull?.split('·')[0]?.trim() || fromVillage.category}
            </div>
          </div>
        </div>
      )}

      <div style={{
        fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)',
        marginBottom: 12, paddingLeft: 2,
      }}>
        Where does your path lead? Select your new village:
      </div>

      {/* Destination grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
      }}>
        {destinations.map((v) => {
          const isSelected = v.id === toVillageId
          return (
            <button
              key={v.id}
              onClick={() => setToVillageId(v.id)}
              style={{
                padding: '12px 6px', borderRadius: 14, cursor: 'pointer',
                border: isSelected
                  ? `2px solid ${v.color}`
                  : '2px solid rgba(255,255,255,.06)',
                background: isSelected
                  ? `linear-gradient(160deg, ${v.color}20, ${v.color}08)`
                  : 'rgba(255,255,255,.025)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 5, transition: 'all .15s',
                boxShadow: isSelected ? `0 0 20px ${v.color}22` : 'none',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `linear-gradient(135deg, ${v.color}bb, ${v.color}44)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                boxShadow: isSelected ? `0 4px 12px ${v.color}33` : 'none',
              }}>
                {v.emoji}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: isSelected ? '#f0f7f0' : 'rgba(255,255,255,.5)',
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {v.name.replace(' Village', '')}
              </div>
              {isSelected && (
                <div style={{
                  fontSize: 8, fontWeight: 800, color: v.color,
                  textTransform: 'uppercase', letterSpacing: '.08em',
                }}>
                  Selected
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Step 2: Select Reason ──────────────────────────────────
  const renderStep2 = () => (
    <div style={{ padding: '0 14px' }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)',
        marginBottom: 14, paddingLeft: 2,
      }}>
        Why are you leaving{' '}
        <span style={{ color: fromVillage?.color || '#fff' }}>
          {fromVillage?.name || 'your village'}
        </span>
        ?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TRANSFER_RULES.map((r) => {
          const isSelected = selectedReason === r.reason
          const waitLabel = formatWait(r.minWaitDays)
          return (
            <button
              key={r.reason}
              onClick={() => setSelectedReason(r.reason)}
              style={{
                padding: '14px 14px', borderRadius: 14, cursor: 'pointer',
                border: isSelected
                  ? '2px solid #1a7c3e'
                  : '2px solid rgba(255,255,255,.06)',
                background: isSelected
                  ? 'rgba(26,124,62,.12)'
                  : 'rgba(255,255,255,.025)',
                textAlign: 'left', transition: 'all .15s',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: isSelected
                  ? 'rgba(26,124,62,.25)'
                  : 'rgba(255,255,255,.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {r.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 800,
                    color: isSelected ? '#4ade80' : 'rgba(255,255,255,.8)',
                  }}>
                    {r.label}
                  </span>
                  {r.reason === 'EDUCATION' && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 99,
                      background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)',
                      color: '#4ade80', textTransform: 'uppercase', letterSpacing: '.06em',
                    }}>
                      Instant
                    </span>
                  )}
                  {r.requiresElder && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 99,
                      background: 'rgba(212,160,23,.12)', border: '1px solid rgba(212,160,23,.25)',
                      color: '#d4a017', textTransform: 'uppercase', letterSpacing: '.06em',
                    }}>
                      Elder Review
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.5,
                  marginTop: 4,
                }}>
                  {r.description}
                </div>
                <div style={{
                  fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 6,
                  display: 'flex', gap: 12,
                }}>
                  <span>Wait: <span style={{ color: r.minWaitDays === 0 ? '#4ade80' : 'rgba(255,255,255,.5)', fontWeight: 700 }}>{waitLabel}</span></span>
                  {r.expeditedDays > 0 && r.expeditedDays < r.minWaitDays && (
                    <span>Fast-track: <span style={{ color: '#d4a017', fontWeight: 700 }}>{formatWait(r.expeditedDays)}</span></span>
                  )}
                </div>
              </div>
              {isSelected && (
                <div style={{
                  width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                  background: '#1a7c3e', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, color: '#fff', marginTop: 2,
                }}>
                  {'\u2713'}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Step 3: Write Report ───────────────────────────────────
  const renderStep3 = () => (
    <div style={{ padding: '0 14px' }}>
      {/* Header with transfer summary */}
      <div style={{
        borderRadius: 14, padding: '12px 14px', marginBottom: 16,
        background: 'rgba(255,255,255,.025)',
        border: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>{fromVillage?.emoji || '\u{1F3D8}'}</span>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,.3)' }}>{'\u2192'}</span>
        <span style={{ fontSize: 20 }}>{toVillage?.emoji || '\u{1F3D8}'}</span>
        <div style={{ flex: 1, marginLeft: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>
            {rule?.emoji} {rule?.label}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
            Tell the elders your story. Honest words carry weight.
          </div>
        </div>
      </div>

      {/* Report questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {REPORT_QUESTIONS.map((q) => {
          const value = reportAnswers[q.key] || ''
          const charCount = value.trim().length
          const meetsMin = !q.required || charCount >= q.minLength
          return (
            <div key={q.key}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700,
                color: 'rgba(255,255,255,.7)', marginBottom: 6,
              }}>
                {q.label}
                {q.required && (
                  <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>
                )}
              </label>
              <textarea
                value={value}
                onChange={(e) =>
                  setReportAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
                }
                placeholder={q.placeholder}
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 12,
                  background: 'rgba(255,255,255,.04)',
                  border: `1.5px solid ${
                    value.length > 0 && !meetsMin
                      ? 'rgba(239,68,68,.4)'
                      : meetsMin && value.length > 0
                        ? 'rgba(74,222,128,.25)'
                        : 'rgba(255,255,255,.08)'
                  }`,
                  color: '#f0f7f0', fontSize: 12, lineHeight: 1.6,
                  resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 4, padding: '0 2px',
              }}>
                {q.required && q.minLength > 0 && (
                  <span style={{
                    fontSize: 9, color: meetsMin ? 'rgba(74,222,128,.5)' : 'rgba(239,68,68,.5)',
                    fontWeight: 600,
                  }}>
                    {meetsMin ? '\u2713 Meets minimum' : `Min ${q.minLength} characters`}
                  </span>
                )}
                {!q.required && <span />}
                <span style={{
                  fontSize: 9, color: 'rgba(255,255,255,.2)', fontWeight: 600,
                }}>
                  {charCount} chars
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Griot AI helper */}
      <button
        onClick={() => {
          setReportAnswers({
            current_experience:
              `In my time with ${fromVillage?.name || 'my current village'}, I have worked across multiple tools and sessions, building skills in collaboration, trade, and service delivery. I contributed to village activity through sessions, marketplace tools, and peer mentoring.`,
            reason_detail:
              `${toVillage?.name || 'The new village'} aligns closely with my evolving path. My daily work now involves activities that fall squarely within this village's purpose, and I believe I can contribute more meaningfully here than in my current placement.`,
            skills_transfer:
              `I bring cross-village perspective and operational skills from ${fromVillage?.name || 'my current village'} that will enrich the new community.`,
            commitment:
              `I plan to take on an active role, participate in at least 3 sessions per week, and use the village tools to build value for the community.`,
          })
        }}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 12, marginTop: 18,
          background: 'linear-gradient(135deg, rgba(212,160,23,.1), rgba(212,160,23,.04))',
          border: '1px solid rgba(212,160,23,.25)',
          color: '#d4a017', fontSize: 11, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
        }}
      >
        {'\u{1F985}'} Ask the Griot to help write your report
      </button>
    </div>
  )

  // ── Step 4: Review & Submit ────────────────────────────────
  const renderStep4 = () => {
    const canExpedite = rule && rule.expeditedDays > 0 && rule.expeditedDays < rule.minWaitDays
    const currentCooldown = cooldown || { days: 0, label: 'Immediate' }
    const crestBonus = CREST_TRANSFER_BONUS[CURRENT_CREST] || CREST_TRANSFER_BONUS['I']

    return (
      <div style={{ padding: '0 14px' }}>
        {/* Transfer summary card */}
        <div style={{
          borderRadius: 18, overflow: 'hidden', marginBottom: 16,
          background: 'rgba(255,255,255,.03)',
          border: '1.5px solid rgba(255,255,255,.08)',
        }}>
          {/* From -> To header */}
          <div style={{
            padding: '18px 16px',
            background: `linear-gradient(135deg, ${fromVillage?.color || '#333'}15, ${toVillage?.color || '#333'}15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto',
                background: `linear-gradient(135deg, ${fromVillage?.color || '#555'}cc, ${fromVillage?.color || '#555'}55)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                boxShadow: `0 4px 16px ${fromVillage?.color || '#555'}33`,
              }}>
                {fromVillage?.emoji || '\u{1F3D8}'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: fromVillage?.color || '#aaa', marginTop: 6 }}>
                {fromVillage?.name?.replace(' Village', '') || 'Current'}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 99,
                background: 'rgba(26,124,62,.15)',
                border: '2px solid rgba(26,124,62,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: '#4ade80',
              }}>
                {'\u2192'}
              </div>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', fontWeight: 700 }}>
                TRANSFER
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto',
                background: `linear-gradient(135deg, ${toVillage?.color || '#555'}cc, ${toVillage?.color || '#555'}55)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                boxShadow: `0 4px 16px ${toVillage?.color || '#555'}33`,
              }}>
                {toVillage?.emoji || '\u{1F3D8}'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: toVillage?.color || '#aaa', marginTop: 6 }}>
                {toVillage?.name?.replace(' Village', '') || 'Destination'}
              </div>
            </div>
          </div>

          {/* Details rows */}
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Reason */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Reason</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>
                {rule?.emoji} {rule?.label}
              </span>
            </div>

            {/* Crest level */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Your Crest</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#d4a017' }}>
                Crest {CURRENT_CREST}
                {crestBonus.reduceDays > 0 && (
                  <span style={{ color: '#4ade80', marginLeft: 6, fontSize: 10 }}>
                    (-{crestBonus.reduceDays}d bonus)
                  </span>
                )}
              </span>
            </div>

            {/* Cooling period */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderTop: '1px solid rgba(255,255,255,.06)',
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Cooling Period</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  color: currentCooldown.days === 0 ? '#4ade80' : '#f0f7f0',
                }}>
                  {currentCooldown.label}
                </span>
                {currentCooldown.days > 0 && (
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
                    ~{futureDate(currentCooldown.days)}
                  </div>
                )}
              </div>
            </div>

            {/* Elder review notice */}
            {rule?.requiresElder && (
              <div style={{
                padding: '8px 12px', borderRadius: 10,
                background: 'rgba(212,160,23,.08)',
                border: '1px solid rgba(212,160,23,.2)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>{'\u{1F9D3}'}</span>
                <span style={{ fontSize: 10, color: '#d4a017', fontWeight: 600, lineHeight: 1.4 }}>
                  This transfer requires Elder review. A village elder from{' '}
                  <span style={{ fontWeight: 800 }}>{toVillage?.name || 'the destination'}</span>{' '}
                  will review your report before approval.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expedited toggle */}
        {canExpedite && (
          <div style={{
            borderRadius: 14, padding: '12px 14px', marginBottom: 16,
            background: expedited
              ? 'rgba(212,160,23,.08)'
              : 'rgba(255,255,255,.025)',
            border: `1.5px solid ${expedited ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.06)'}`,
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
            onClick={() => setExpedited((p) => !p)}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              border: `2px solid ${expedited ? '#d4a017' : 'rgba(255,255,255,.2)'}`,
              background: expedited ? '#d4a017' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}>
              {expedited && (
                <span style={{ color: '#0a0a0a', fontSize: 12, fontWeight: 900 }}>{'\u2713'}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: expedited ? '#d4a017' : 'rgba(255,255,255,.6)' }}>
                Request Expedited Transfer
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
                Fast-track to{' '}
                <span style={{ fontWeight: 700 }}>
                  {formatWait(rule ? rule.expeditedDays - (CREST_TRANSFER_BONUS[CURRENT_CREST]?.reduceDays || 0) : 0)}
                </span>{' '}
                instead of{' '}
                <span style={{ fontWeight: 700 }}>
                  {formatWait(rule ? rule.minWaitDays - (CREST_TRANSFER_BONUS[CURRENT_CREST]?.reduceDays || 0) : 0)}
                </span>
                . Elder approval may be required.
              </div>
            </div>
          </div>
        )}

        {/* Report preview */}
        {rule?.requiresReport && (
          <div style={{
            borderRadius: 14, padding: '14px 14px', marginBottom: 16,
            background: 'rgba(255,255,255,.025)',
            border: '1px solid rgba(255,255,255,.06)',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)',
              marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em',
            }}>
              {'\u{1F4DC}'} Your Report
            </div>
            {REPORT_QUESTIONS.filter((q) => (reportAnswers[q.key] || '').trim().length > 0).map((q) => (
              <div key={q.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 3 }}>
                  {q.label}
                </div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,.65)', lineHeight: 1.5,
                  padding: '6px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,.02)',
                  borderLeft: '3px solid rgba(26,124,62,.3)',
                }}>
                  {reportAnswers[q.key]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Step 5: Confirmation ───────────────────────────────────
  const renderStep5 = () => {
    const finalCooldown = cooldown || { days: 0, label: 'Immediate' }
    const statusText = finalCooldown.days === 0
      ? 'COMPLETED'
      : rule?.requiresElder
        ? 'UNDER_REVIEW'
        : 'COOLING'

    const statusColor = statusText === 'COMPLETED'
      ? '#4ade80'
      : statusText === 'UNDER_REVIEW'
        ? '#d4a017'
        : '#0891b2'

    return (
      <div style={{ padding: '0 14px', textAlign: 'center' }}>
        {/* Success animation area */}
        <div style={{
          width: 100, height: 100, borderRadius: 99, margin: '20px auto 18px',
          background: `linear-gradient(135deg, ${toVillage?.color || '#1a7c3e'}30, ${toVillage?.color || '#1a7c3e'}10)`,
          border: `3px solid ${toVillage?.color || '#1a7c3e'}60`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44,
          animation: 'none',
        }}>
          {statusText === 'COMPLETED' ? '\u2713' : toVillage?.emoji || '\u{1F3D8}'}
        </div>

        <h2 style={{
          fontSize: 20, fontWeight: 900, color: '#f0f7f0', margin: '0 0 6px',
        }}>
          {statusText === 'COMPLETED'
            ? 'Transfer Complete!'
            : 'Transfer Submitted!'}
        </h2>
        <p style={{
          fontSize: 12, color: 'rgba(255,255,255,.45)', margin: '0 0 24px',
          lineHeight: 1.5, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {statusText === 'COMPLETED'
            ? `Welcome to ${toVillage?.name || 'your new village'}. Your journey continues here.`
            : statusText === 'UNDER_REVIEW'
              ? 'The village elder will review your path. Walk with patience \u2014 the ancestors watch over your transition.'
              : `Your cooling period begins now. ${finalCooldown.label} of reflection before your new village welcomes you home.`}
        </p>

        {/* Details card */}
        <div style={{
          borderRadius: 16, padding: '16px 18px', textAlign: 'left',
          background: 'rgba(255,255,255,.03)',
          border: '1.5px solid rgba(255,255,255,.08)',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Transfer ID</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#f0f7f0', fontFamily: 'monospace' }}>
                {transferId}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Status</span>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                background: `${statusColor}18`,
                border: `1px solid ${statusColor}40`,
                color: statusColor,
                textTransform: 'uppercase', letterSpacing: '.06em',
              }}>
                {statusText.replace('_', ' ')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>From</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: fromVillage?.color || '#aaa' }}>
                {fromVillage?.emoji} {fromVillage?.name || 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>To</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: toVillage?.color || '#aaa' }}>
                {toVillage?.emoji} {toVillage?.name || 'Unknown'}
              </span>
            </div>
            {finalCooldown.days > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Expected Completion</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>
                  {futureDate(finalCooldown.days)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Proverb */}
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(212,160,23,.06), rgba(26,124,62,.04))',
          border: '1px solid rgba(212,160,23,.15)',
        }}>
          <div style={{ fontSize: 11, color: '#d4a017', fontStyle: 'italic', lineHeight: 1.5 }}>
            &ldquo;A tree that grows in one forest may spread its roots into another,
            but it never forgets where it first drank water.&rdquo;
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 4 }}>
            \u2014 Pan-African proverb
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => router.push('/dashboard/villages')}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: 'linear-gradient(135deg, #1a7c3e, #145f30)',
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {'\u{1F3D8}\uFE0F'} Return to Villages
        </button>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ background: '#050a06', minHeight: '100dvh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        padding: '16px 14px 10px',
        background: 'linear-gradient(180deg, rgba(26,124,62,.1) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleBack}
            style={{
              width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,.1)',
              background: 'rgba(255,255,255,.04)', color: '#f0f7f0',
              fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {'\u2190'}
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#f0f7f0', margin: 0 }}>
              {'\u{1F985}'} Village Transfer
            </h1>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', margin: '2px 0 0' }}>
              {step < 5
                ? 'Your path between villages begins here'
                : 'Transfer submitted successfully'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      {renderProgress()}

      {/* Step content */}
      <div style={{ paddingTop: 10, paddingBottom: 20 }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>

      {/* Bottom action bar (hidden on step 5) */}
      {step < 5 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 14px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          background: 'linear-gradient(180deg, transparent 0%, #050a06 20%)',
          zIndex: 50,
        }}>
          <button
            onClick={handleNext}
            disabled={!canProceedFromStep(step) || submitting}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 14,
              background: canProceedFromStep(step)
                ? step === 4
                  ? 'linear-gradient(135deg, #1a7c3e, #0f5c2a)'
                  : 'linear-gradient(135deg, #1a7c3e, #145f30)'
                : 'rgba(255,255,255,.06)',
              border: canProceedFromStep(step) ? 'none' : '1px solid rgba(255,255,255,.08)',
              color: canProceedFromStep(step) ? '#fff' : 'rgba(255,255,255,.2)',
              fontSize: 14, fontWeight: 800, cursor: canProceedFromStep(step) ? 'pointer' : 'default',
              transition: 'all .15s',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting
              ? 'Submitting to the Elders\u2026'
              : step === 4
                ? '\u{1F985} Submit Transfer Request'
                : `Continue \u2192`}
          </button>
        </div>
      )}
    </div>
  )
}
