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
const blue = '#5b9bd5'
const red = '#e05a4e'

type RunnerStatus = 'SEARCHING' | 'ASSIGNED' | 'PICKUP' | 'INTRANSIT' | 'DELIVERED'

const STEPS: RunnerStatus[] = ['SEARCHING', 'ASSIGNED', 'PICKUP', 'INTRANSIT', 'DELIVERED']
const STEP_LABELS: Record<RunnerStatus, string> = {
  SEARCHING: 'Searching',
  ASSIGNED: 'Assigned',
  PICKUP: 'Picking Up',
  INTRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
}

export default function RunnerDispatch({ villageId, roleKey }: ToolProps) {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [description, setDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [urgency, setUrgency] = useState<'STANDARD' | 'EXPRESS'>('STANDARD')
  const [dispatched, setDispatched] = useState(false)
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus>('SEARCHING')
  const [eta, setEta] = useState(38)

  function dispatch() {
    if (!pickup || !dropoff) return
    setDispatched(true)
    let stepIdx = 0
    const iv = setInterval(() => {
      stepIdx++
      if (stepIdx < STEPS.length) {
        setRunnerStatus(STEPS[stepIdx])
        setEta(prev => Math.max(5, prev - 8))
      } else {
        clearInterval(iv)
      }
    }, 2500)
  }

  const distKm = 4.7
  const fee = urgency === 'EXPRESS' ? 1200 : 850

  const currentStepIdx = STEPS.indexOf(runnerStatus)

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>RUNNER DISPATCH</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Request a Runner 🏃</div>

      {!dispatched ? (
        <>
          {/* Form */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Pickup Address</div>
              <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="e.g. 14 Eze Street, Onitsha Market" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Dropoff Address</div>
              <input value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="e.g. 8 Ngozi Close, Awka" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Package Description</div>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Fabric bundle" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Weight (kg)</div>
                <input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="2.5" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>Urgency</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['STANDARD', 'EXPRESS'] as const).map(u => (
                  <button key={u} onClick={() => setUrgency(u)} style={{
                    flex: 1, padding: '9px 0', border: `1px solid ${urgency === u ? (u === 'EXPRESS' ? gold : green) : border}`,
                    borderRadius: 8, background: urgency === u ? (u === 'EXPRESS' ? gold + '22' : green + '22') : bg,
                    color: urgency === u ? (u === 'EXPRESS' ? gold : green) : muted, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  }}>{u}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Fee estimate */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: muted, marginBottom: 10 }}>Fee Estimate</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: muted, fontSize: 13 }}>Distance</span>
              <span style={{ fontWeight: 600 }}>{distKm} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: muted, fontSize: 13 }}>Estimated Fee</span>
              <span style={{ fontWeight: 700, color: gold }}>₡{fee.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: muted, fontSize: 13 }}>ETA</span>
              <span style={{ fontWeight: 600 }}>{urgency === 'EXPRESS' ? '25 min' : '45 min'}</span>
            </div>
          </div>

          <button
            onClick={dispatch}
            style={{
              width: '100%', background: green, color: '#000', border: 'none',
              borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            }}
          >
            Dispatch Runner 🏃
          </button>
        </>
      ) : (
        <>
          {/* Tracking card */}
          <div style={{ background: card, border: `1px solid ${green}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg,#4caf7d,#c9a84c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#000', fontWeight: 800,
              }}>TK</div>
              <div>
                <div style={{ fontWeight: 700 }}>Tunde Kelechi</div>
                <div style={{ fontSize: 12, color: muted }}>Runner #RN-4472 · ⭐ 4.9</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: muted }}>ETA</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: gold }}>{eta}m</div>
              </div>
            </div>

            {/* Status steps */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              {STEPS.map((step, idx) => (
                <React.Fragment key={step}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: idx <= currentStepIdx ? green : border,
                      border: `2px solid ${idx === currentStepIdx ? gold : (idx < currentStepIdx ? green : border)}`,
                      boxShadow: idx === currentStepIdx ? `0 0 8px ${gold}` : 'none',
                    }} />
                    <div style={{ fontSize: 9, color: idx <= currentStepIdx ? green : muted, marginTop: 4, textAlign: 'center', width: 44 }}>
                      {STEP_LABELS[step]}
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div style={{ height: 2, flex: 1, background: idx < currentStepIdx ? green : border, marginBottom: 16 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Map placeholder */}
            <div style={{
              background: '#0a1f0c', border: `1px solid ${border}`, borderRadius: 8,
              height: 110, position: 'relative', overflow: 'hidden',
            }}>
              {/* Route line */}
              <svg style={{ position: 'absolute', inset: 0 }} width="100%" height="110">
                <line x1="20" y1="90" x2="80" y2="60" stroke={green} strokeWidth="2" strokeDasharray="4,3" />
                <line x1="80" y1="60" x2="160" y2="40" stroke={green} strokeWidth="2" strokeDasharray="4,3" />
                <line x1="160" y1="40" x2="240" y2="20" stroke={gold} strokeWidth="2.5" />
                <circle cx="20" cy="90" r="5" fill={green} />
                <circle cx="240" cy="20" r="5" fill={gold} />
              </svg>
              <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 10, color: green }}>📍 Pickup</div>
              <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 10, color: gold }}>📦 Dropoff</div>
              <div style={{ position: 'absolute', top: '50%', left: '55%', transform: 'translate(-50%,-50%)', fontSize: 18 }}>🏃</div>
            </div>
          </div>

          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: muted }}>Tracking: <span style={{ color: text, fontWeight: 700 }}>DEL-2026-{Math.floor(Math.random() * 900 + 100)}</span></div>
            <div style={{ fontSize: 12, color: green, marginTop: 4 }}>● {runnerStatus.replace('_', ' ')}</div>
          </div>
        </>
      )}
    </div>
  )
}
