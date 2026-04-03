'use client'
import { ThemeMode, t, SectionLabel } from './shared'
import * as React from 'react'

interface AjoMember { id: string; initial: string; color: string }
interface AjoCircleData {
  circleId: string
  name: string
  members: AjoMember[]
  collectionDay: string
  myPayout: string
  paidCount: number
  totalCount: number
  totalCollected: string
  totalTarget: string
  daysUntilCollection: number
  unpaidCount: number
}

export default function AjoCard({ mode }: { mode: ThemeMode }) {
  const isDark = mode === 'dark'
  const [circle, setCircle] = React.useState<AjoCircleData | null>(null)
  const [isOffline, setIsOffline] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/v1/ajo/my-circle')
      .then(async res => {
        if (res.status === 503) {
          setIsOffline(true)
          return null
        }
        return res.ok ? res.json() : null
      })
      .then(data => { 
        if (data?.error?.code === 'STABILIZED_OFFLINE_MODE') {
          setIsOffline(true)
        } else if (data?.circleId) {
          setCircle(data) 
        }
      })
      .catch(() => setIsOffline(true))
  }, [])

  if (isOffline) {
    return (
      <>
        <SectionLabel label="⭕ Your Ajo Circle" mode={mode} />
        <div style={{ margin: '8px 12px', borderRadius: 14, padding: '16px 20px', background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.6 }}>⭕️</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa', marginBottom: 4 }}>Resonance Stabilization</div>
          <div style={{ fontSize: 10, color: 'rgba(167,139,250,.6)', lineHeight: 1.5 }}>The banking core is currently synchronizing. Ajo tools will be back online shortly.</div>
        </div>
      </>
    )
  }

  if (!circle) {
    return (
      <>
        <SectionLabel label="⭕ Your Ajo Circle" more="View all circles" mode={mode} />
        <div style={{ margin: '8px 12px', borderRadius: 14, padding: 16, background: t('card', mode), border: `1px solid ${t('border', mode)}`, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⭕</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t('text', mode), marginBottom: 4 }}>No active circle</div>
          <div style={{ fontSize: 11, color: t('sub', mode) }}>Join or create an Ajo savings circle to get started.</div>
        </div>
      </>
    )
  }

  const health = circle.totalCount > 0 ? Math.round((circle.paidCount / circle.totalCount) * 100) : 0

  return (
    <>
      <SectionLabel label="⭕ Your Ajo Circle" more="View all circles" mode={mode} />
      <div style={{ margin: '8px 12px', borderRadius: 14, padding: 13, position: 'relative', overflow: 'hidden', background: t('card', mode), border: `1px solid ${t('border', mode)}` }}>
        <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', width: 70, height: 70, borderRadius: '50%', background: 'rgba(124,58,237,.08)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#5b21b6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⭕</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t('text', mode) }}>{circle.name}</div>
            <div style={{ fontSize: 10, color: t('sub', mode) }}>{circle.totalCount} members · Collects this {circle.collectionDay}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>{circle.myPayout}</div>
        </div>

        <div style={{ height: 7, borderRadius: 99, overflow: 'hidden', marginBottom: 5, background: isDark ? '#1e1030' : '#f0e8ff' }}>
          <div style={{ height: '100%', width: `${health}%`, borderRadius: 99, background: 'linear-gradient(to right,#7c3aed,#a78bfa)', transition: 'width 0.5s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 10, color: t('sub', mode) }}>
          <span>{circle.paidCount} of {circle.totalCount} paid</span>
          <span>{circle.totalCollected} of {circle.totalTarget}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex' }}>
            {(circle.members ?? []).slice(0, 5).map((m, i) => (
              <div key={m.id} style={{ width: 26, height: 26, borderRadius: '50%', background: m.color, border: `2px solid ${isDark ? '#0a1a0b' : '#fff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', marginRight: -8, zIndex: 10 - i }}>
                {m.initial}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, marginLeft: 16, lineHeight: 1.4, color: t('sub', mode) }}>
            {circle.unpaidCount > 0
              ? <>{circle.unpaidCount} member{circle.unpaidCount > 1 ? 's' : ''} haven&apos;t contributed · collects in <strong style={{ color: t('text', mode) }}>{circle.daysUntilCollection} days</strong></>
              : <>All paid up · collects in <strong style={{ color: t('text', mode) }}>{circle.daysUntilCollection} days</strong></>}
          </div>
        </div>

        <button style={{ width: '100%', padding: 10, border: 'none', borderRadius: 99, background: 'linear-gradient(to right,#7c3aed,#5b21b6)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          View Circle & Send Reminder
        </button>
      </div>
    </>
  )
}
