'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { VILLAGE_BY_ID } from '@/lib/villages-data'

// ── Types ────────────────────────────────────────────────────
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

// ── Status colours ────────────────────────────────────────────
const STATUS_META: Record<TransferApp['status'], { color: string; bg: string; label: string; emoji: string }> = {
  SUBMITTED:    { color: '#3b82f6', bg: 'rgba(59,130,246,.12)',  label: 'Submitted',    emoji: '📨' },
  UNDER_REVIEW: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  label: 'Under Review', emoji: '🔍' },
  COOLING:      { color: '#d4a017', bg: 'rgba(212,160,23,.12)',  label: 'Cooling',      emoji: '🌊' },
  APPROVED:     { color: '#4ade80', bg: 'rgba(74,222,128,.12)',  label: 'Approved',     emoji: '✅' },
  DENIED:       { color: '#ef4444', bg: 'rgba(239,68,68,.12)',   label: 'Denied',       emoji: '❌' },
}

function daysAgo(ts: number, now: number): string {
  if (!now) return ''
  const diff = Math.floor((now - ts) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  return `${diff} days ago`
}

function daysRemaining(submittedAt: number, cooldownDays: number, now: number): number {
  if (!now) return cooldownDays
  const elapsed = Math.floor((now - submittedAt) / 86_400_000)
  return Math.max(0, cooldownDays - elapsed)
}

// ── Page ──────────────────────────────────────────────────────
export default function TransferApplicationsPage() {
  const router = useRouter()
  const [apps, setApps] = React.useState<TransferApp[]>([])
  const [now, setNow] = React.useState(0)

  React.useEffect(() => {
    setNow(Date.now())
  }, [])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('village_transfer_apps')
      if (raw) setApps(JSON.parse(raw))
    } catch {}
  }, [])

  return (
    <div style={{
      minHeight: '100dvh', background: '#05080a', color: '#f0f7f0',
      fontFamily: 'DM Sans, Inter, sans-serif', maxWidth: 480, margin: '0 auto',
      borderLeft: '1px solid rgba(255,255,255,.04)',
      borderRight: '1px solid rgba(255,255,255,.04)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        background: 'linear-gradient(180deg, rgba(26,124,62,.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={() => router.push('/dashboard/villages')}
          style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            color: '#f0f7f0', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >←</button>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#f0f7f0', lineHeight: 1.2 }}>
            📋 Your Village Transfer Applications
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
            Track the status of your village transfer requests
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        margin: '14px 14px 0',
        padding: '12px 14px', borderRadius: 12,
        background: 'rgba(212,160,23,.05)', border: '1px solid rgba(212,160,23,.18)',
        fontSize: 10, color: '#d4a017', lineHeight: 1.55,
      }}>
        <span style={{ fontWeight: 800 }}>90–180 day review process.</span>{' '}
        Village transfers require elder review and a cooling period. Denied applications may be resubmitted after 60 days.
      </div>

      {/* List */}
      <div style={{ padding: '14px 14px 100px' }}>
        {apps.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 18, marginTop: 8,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f7f0', marginBottom: 6, fontFamily: 'Sora, sans-serif' }}>
              No Applications Yet
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto 20px' }}>
              Changing villages requires a formal application. Transfers involve a 90–180 day review period and elder approval.
            </div>
            <button
              onClick={() => router.push('/dashboard/villages/transfer')}
              style={{
                padding: '12px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #1a7c3e, #145f30)',
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}
            >
              Start a Transfer Application
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {apps.map(app => {
              const meta = STATUS_META[app.status]
              const fromVillage = VILLAGE_BY_ID[app.fromVillageId]
              const toVillage   = VILLAGE_BY_ID[app.toVillageId]
              const remaining   = daysRemaining(app.submittedAt, app.cooldownDays, now)
              const isActive    = app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' || app.status === 'COOLING'

              return (
                <div
                  key={app.id}
                  style={{
                    borderRadius: 16, overflow: 'hidden',
                    background: 'rgba(255,255,255,.025)',
                    border: `1.5px solid ${isActive ? meta.color + '30' : 'rgba(255,255,255,.06)'}`,
                  }}
                >
                  {/* Card header */}
                  <div style={{
                    padding: '12px 14px',
                    background: isActive ? meta.bg : 'rgba(255,255,255,.02)',
                    borderBottom: '1px solid rgba(255,255,255,.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: meta.color }}>
                        {app.id}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                      background: meta.bg, border: `1px solid ${meta.color}40`, color: meta.color,
                      textTransform: 'uppercase', letterSpacing: '.06em',
                    }}>
                      {meta.emoji} {meta.label}
                    </span>
                  </div>

                  {/* Villages */}
                  <div style={{
                    padding: '14px 14px 10px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    {/* From */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, margin: '0 auto 6px',
                        background: fromVillage ? `${fromVillage.color}30` : 'rgba(255,255,255,.08)',
                        border: fromVillage ? `1.5px solid ${fromVillage.color}50` : '1.5px solid rgba(255,255,255,.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}>
                        {fromVillage?.emoji || '🏘'}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: fromVillage?.color || '#aaa' }}>
                        {fromVillage?.name?.replace(' Village', '') || app.fromVillageId}
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>From</div>
                    </div>

                    {/* Arrow */}
                    <div style={{ fontSize: 18, color: 'rgba(255,255,255,.2)' }}>→</div>

                    {/* To */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, margin: '0 auto 6px',
                        background: toVillage ? `${toVillage.color}30` : 'rgba(255,255,255,.08)',
                        border: toVillage ? `1.5px solid ${toVillage.color}50` : '1.5px solid rgba(255,255,255,.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}>
                        {toVillage?.emoji || '🏘'}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: toVillage?.color || '#aaa' }}>
                        {toVillage?.name?.replace(' Village', '') || app.toVillageId}
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>To</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Reason */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Reason</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#f0f7f0', maxWidth: 200, textAlign: 'right' }}>
                        {app.reason.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Submitted */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Submitted</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#f0f7f0' }}>
                        {daysAgo(app.submittedAt, now)}
                        {' · '}
                        {new Date(app.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Decision date if decided */}
                    {app.decisionAt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Decision</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#f0f7f0' }}>
                          {new Date(app.decisionAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {/* Countdown */}
                    {isActive && app.cooldownDays > 0 && (
                      <div style={{
                        marginTop: 4, padding: '10px 12px', borderRadius: 10,
                        background: meta.bg, border: `1px solid ${meta.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <span style={{ fontSize: 10, color: meta.color, fontWeight: 700 }}>
                          {app.status === 'COOLING' ? '⏳ Cooling remaining' : '⏳ Est. decision in'}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: meta.color, fontFamily: 'DM Mono, monospace' }}>
                          {remaining === 0 ? 'Due soon' : `${remaining}d`}
                        </span>
                      </div>
                    )}

                    {/* Immediate / approved note */}
                    {app.status === 'APPROVED' && app.cooldownDays === 0 && (
                      <div style={{
                        marginTop: 4, padding: '8px 12px', borderRadius: 10,
                        background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)',
                        fontSize: 10, color: '#4ade80', fontWeight: 600,
                      }}>
                        ✅ Transfer completed immediately.
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Start new application */}
            <button
              onClick={() => router.push('/dashboard/villages/transfer')}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, marginTop: 4,
                background: 'rgba(255,255,255,.04)', border: '1.5px dashed rgba(255,255,255,.15)',
                color: 'rgba(255,255,255,.45)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              + Start New Transfer Application
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
