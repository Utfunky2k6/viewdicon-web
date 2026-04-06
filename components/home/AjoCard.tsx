'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

interface AjoCircle {
  circleId: string
  name: string
  members: { id: string; initial: string; color: string }[]
  collectionDay: string
  myPayout: string
  paidCount: number
  totalCount: number
  totalCollected: string
  totalTarget: string
  daysUntilCollection: number
  unpaidCount: number
}

export function AjoCard({ circle }: { circle: AjoCircle }) {
  if (!circle) return null;
  const router = useRouter()
  const pctPaid = circle.totalCount > 0 ? Math.round((circle.paidCount / circle.totalCount) * 100) : 0

  return (
    <>
      <div className="px-4 pt-3 pb-1.5">
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>⭕ Your Ajo Circle</span>
      </div>
      <div
        className="mx-3 rounded-2xl relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '16px 14px',
        }}
      >
        {/* Watermark */}
        <div className="absolute pointer-events-none" style={{ right: -14, top: '50%', transform: 'translateY(-50%)', fontSize: 80, opacity: 0.04 }}>⭕</div>

        {/* Top row */}
        <div className="flex items-center gap-3 mb-3.5 relative">
          <div
            className="shrink-0 rounded-full flex items-center justify-center"
            style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', fontSize: 18, boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}
          >
            ⭕
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{circle.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{circle.totalCount} members · Collects {circle.collectionDay}</div>
          </div>
          <div className="shrink-0" style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{circle.myPayout}</div>
        </div>

        {/* Progress bar */}
        <div className="rounded-full overflow-hidden mb-1.5" style={{ height: 6, background: 'var(--bg-raised)' }}>
          <div
            className="rounded-full h-full"
            style={{ background: 'linear-gradient(to right, #7c3aed, #a78bfa)', width: `${pctPaid}%`, transition: 'width 0.8s ease', boxShadow: '0 0 8px rgba(124,58,237,0.3)' }}
          />
        </div>
        <div className="flex justify-between mb-3" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          <span>{circle.paidCount} of {circle.totalCount} paid</span>
          <span>{circle.totalCollected} of {circle.totalTarget}</span>
        </div>

        {/* Members + info */}
        <div className="flex items-center gap-2 mb-3.5">
          <div className="flex items-center">
            {(circle.members ?? []).map((m, i) => (
              <div
                key={m.id}
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  border: '2px solid var(--bg-card)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  background: m.color,
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: circle.members.length - i,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {m.initial}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0" style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.45 }}>
            {circle.unpaidCount} haven&apos;t contributed · collects in <strong style={{ color: 'var(--text-primary)' }}>{circle.daysUntilCollection} days</strong>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/dashboard/banking')}
          className="w-full rounded-full active:scale-[0.97] transition-transform"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: '#fff',
            border: 'none',
            padding: '11px 18px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}
        >
          View Circle &amp; Send Reminder
        </button>
      </div>
    </>
  )
}
