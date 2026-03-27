'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const red = '#e05a4e'
const blue = '#5b9bd5'
const orange = '#d4813a'

type DStep = 'SEARCHING' | 'ASSIGNED' | 'PICKUP' | 'INTRANSIT' | 'DELIVERED'
const STEPS: DStep[] = ['SEARCHING', 'ASSIGNED', 'PICKUP', 'INTRANSIT', 'DELIVERED']

interface Delivery {
  code: string
  destination: string
  step: number
  runner: string
  eta: string
  progress: number
}

const ACTIVE: Delivery[] = [
  { code: 'DEL-2026-118', destination: '8 Ngozi Close, Awka', step: 3, runner: 'Tunde K.', eta: '18 min', progress: 70 },
  { code: 'DEL-2026-119', destination: 'Onitsha Main Market, Stall 44', step: 1, runner: 'Kwame A.', eta: '42 min', progress: 20 },
  { code: 'DEL-2026-120', destination: '22 Fatima Avenue, Kano', step: 4, runner: 'Babajide C.', eta: '5 min', progress: 90 },
]

const COMPLETED = [
  { code: 'DEL-2026-110', dest: 'Lagos Island', runner: 'Emeka O.', date: 'Mar 25', proof: '✓ POD' },
  { code: 'DEL-2026-111', dest: 'Ikeja GRA', runner: 'Adaeze M.', date: 'Mar 25', proof: '✓ POD' },
  { code: 'DEL-2026-112', dest: 'Surulere, Lagos', runner: 'Tunde K.', date: 'Mar 24', proof: '✓ POD' },
  { code: 'DEL-2026-113', dest: 'Yaba Tech, Lagos', runner: 'Kwame A.', date: 'Mar 24', proof: '✓ POD' },
  { code: 'DEL-2026-114', dest: 'Oshodi, Lagos', runner: 'Emeka O.', date: 'Mar 23', proof: '✓ POD' },
  { code: 'DEL-2026-115', dest: 'Badagry', runner: 'Babajide C.', date: 'Mar 23', proof: '⚠ Disputed' },
  { code: 'DEL-2026-116', dest: 'Mushin, Lagos', runner: 'Adaeze M.', date: 'Mar 22', proof: '✓ POD' },
  { code: 'DEL-2026-117', dest: 'Apapa Port', runner: 'Tunde K.', date: 'Mar 22', proof: '✓ POD' },
]

const stepColor = (idx: number, current: number) =>
  idx < current ? green : idx === current ? gold : border

export default function DeliveryTracker({ villageId, roleKey }: ToolProps) {
  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE')
  const [reported, setReported] = useState<Set<string>>(new Set())

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>DELIVERY TRACKER</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Live Deliveries 📦</div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: card, borderRadius: 10, padding: 4, border: `1px solid ${border}` }}>
        {(['ACTIVE', 'COMPLETED'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: tab === t ? green : 'transparent',
              color: tab === t ? '#000' : muted,
              fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontSize: 13,
            }}
          >{t} {t === 'ACTIVE' ? `(${ACTIVE.length})` : `(${COMPLETED.length})`}</button>
        ))}
      </div>

      {tab === 'ACTIVE' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ACTIVE.map(d => (
            <div key={d.code} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>{d.code}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{d.destination}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: muted }}>ETA</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: gold }}>{d.eta}</div>
                </div>
              </div>

              {/* Step bar */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                {STEPS.map((step, idx) => (
                  <React.Fragment key={step}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: stepColor(idx, d.step),
                        boxShadow: idx === d.step ? `0 0 6px ${gold}` : 'none',
                      }} />
                      <div style={{ fontSize: 8, color: idx <= d.step ? green : muted, marginTop: 3, width: 36, textAlign: 'center' }}>
                        {step.charAt(0) + step.slice(1).toLowerCase()}
                      </div>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: idx < d.step ? green : border, marginBottom: 16 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ background: border, borderRadius: 4, height: 6, marginBottom: 10 }}>
                <div style={{ width: `${d.progress}%`, height: '100%', background: green, borderRadius: 4 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: muted }}>🏃 {d.runner} · {d.progress}% complete</div>
                <button
                  onClick={() => setReported(r => new Set([...r, d.code]))}
                  style={{
                    border: `1px solid ${reported.has(d.code) ? border : red + '66'}`,
                    background: reported.has(d.code) ? 'transparent' : red + '11',
                    color: reported.has(d.code) ? muted : red,
                    borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                  }}
                >
                  {reported.has(d.code) ? '✓ Reported' : 'Report Issue'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0, padding: '8px 16px', borderBottom: `1px solid ${border}` }}>
            {['Code', 'Runner', 'Date', 'POD'].map(h => (
              <div key={h} style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{h}</div>
            ))}
          </div>
          {COMPLETED.map(c => (
            <div key={c.code} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0, padding: '10px 16px', borderBottom: `1px solid ${border}` }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.code}</div>
                <div style={{ fontSize: 10, color: muted }}>{c.dest}</div>
              </div>
              <div style={{ fontSize: 12, color: muted }}>{c.runner}</div>
              <div style={{ fontSize: 12, color: muted }}>{c.date}</div>
              <div style={{ fontSize: 11, color: c.proof.includes('✓') ? green : orange, fontWeight: 700 }}>{c.proof}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
