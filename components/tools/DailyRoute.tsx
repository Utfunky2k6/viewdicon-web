'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type StopStatus = 'PENDING' | 'ARRIVED' | 'COMPLETED'

interface DeliveryStop {
  id: number; customer: string; address: string; service: string; status: StopStatus
}

const INIT_STOPS: DeliveryStop[] = [
  { id: 1, customer: 'Mama Adunola', address: '12 Bode Thomas St, Surulere', service: 'Egusi (5kg) + Stockfish', status: 'COMPLETED' },
  { id: 2, customer: 'Mr. Emeka Okafor', address: '4 Adetokunbo Ademola, V/I', service: 'Electronics package × 3', status: 'COMPLETED' },
  { id: 3, customer: 'Iya Oge Store', address: '88 Allen Ave, Ikeja', service: 'Ankara fabric rolls × 4', status: 'ARRIVED' },
  { id: 4, customer: 'Bro. Nnamdi', address: '21 Eric Moore Rd, Ojuelegba', service: 'Herbal medicine pack', status: 'PENDING' },
  { id: 5, customer: 'Sister Fatima', address: '3 Abebe Village Rd, Apapa', service: 'Food supplies × 8 items', status: 'PENDING' },
  { id: 6, customer: 'Chief Adeleke', address: '7 Bourdillon Rd, Ikoyi', service: 'Premium palm wine (50L)', status: 'PENDING' },
]

const statusColor: Record<StopStatus, string> = { PENDING: muted, ARRIVED: amber, COMPLETED: green }
const statusLabel: Record<StopStatus, string> = { PENDING: 'Pending', ARRIVED: 'Arrived', COMPLETED: 'Completed' }
const NEXT_STATUS: Record<StopStatus, StopStatus | null> = { PENDING: 'ARRIVED', ARRIVED: 'COMPLETED', COMPLETED: null }

export default function DailyRoute({ villageId, roleKey }: ToolProps) {
  const [stops, setStops] = useState<DeliveryStop[]>(INIT_STOPS)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const completed = stops.filter(s => s.status === 'COMPLETED').length
  const total = stops.length
  const earnings = completed * 2100

  const updateStop = (id: number) => {
    setStops(prev => prev.map(s => {
      if (s.id !== id) return s
      const next = NEXT_STATUS[s.status]
      if (!next) return s
      flash(next === 'ARRIVED' ? `Arrived at stop #${id}` : `Stop #${id} completed! +₡2,100`)
      return { ...s, status: next }
    }))
  }

  const openMaps = (address: string) => flash(`Opening Maps: ${address}`)

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Today's Route</div>
        <div style={{ color: muted, fontSize: 12 }}>March 26, 2026 · Shift Start: 07:30 · Okonkwo Express Logistics</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: green }}>{completed}/{total}</div>
          <div style={{ fontSize: 10, color: muted }}>Stops Done</div>
        </div>
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: gold }}>₡{earnings.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: muted }}>Earned Today</div>
        </div>
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: amber }}>12 min</div>
          <div style={{ fontSize: 10, color: muted }}>ETA Next Stop</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: muted, marginBottom: 4 }}>
          <span>{completed} of {total} stops completed</span>
          <span>{Math.round((completed / total) * 100)}%</span>
        </div>
        <div style={{ height: 8, background: '#1a3a20', borderRadius: 4 }}>
          <div style={{ width: `${(completed / total) * 100}%`, height: '100%', background: green, borderRadius: 4, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Map placeholder */}
      <div style={{ background: '#0a150c', border: `1px solid ${border}`, borderRadius: 12, height: 140, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', opacity: 0.15 }}>
          {Array.from({ length: 24 }).map((_, i) => <div key={i} style={{ border: `1px solid ${green}` }} />)}
        </div>
        {stops.map((s, i) => {
          const positions = [{ x: 15, y: 20 }, { x: 75, y: 35 }, { x: 45, y: 55 }, { x: 25, y: 70 }, { x: 65, y: 70 }, { x: 80, y: 85 }]
          const pos = positions[i] || { x: 50, y: 50 }
          return (
            <div key={s.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, width: 22, height: 22, borderRadius: 11, background: statusColor[s.status], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000', transform: 'translate(-50%, -50%)', border: '2px solid #000' }}>
              {s.id}
            </div>
          )
        })}
        <span style={{ color: muted, fontSize: 11, position: 'absolute', bottom: 6, right: 10 }}>Route Map</span>
      </div>

      {/* Stop list */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        {stops.map(s => (
          <div key={s.id} style={{ padding: '12px 14px', borderBottom: `1px solid ${border}`, opacity: s.status === 'COMPLETED' ? 0.6 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: statusColor[s.status], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>{s.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.customer}</div>
                <div style={{ fontSize: 11, color: muted }}>{s.address}</div>
                <div style={{ fontSize: 12, color: text, marginTop: 2 }}>{s.service}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[s.status], background: statusColor[s.status] + '22', padding: '2px 7px', borderRadius: 8 }}>{statusLabel[s.status]}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingLeft: 36 }}>
              <button onClick={() => openMaps(s.address)} style={{ ...btn(muted), background: 'none', border: `1px solid ${border}`, color: muted, fontSize: 11 }}>📍 Open in Maps</button>
              {NEXT_STATUS[s.status] && (
                <button onClick={() => updateStop(s.id)} style={{ ...btn(statusColor[NEXT_STATUS[s.status]!]), fontSize: 11 }}>
                  {NEXT_STATUS[s.status] === 'ARRIVED' ? '📍 Mark Arrived' : '✓ Mark Complete'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
