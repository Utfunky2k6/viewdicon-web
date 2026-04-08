'use client'
import { useState } from 'react'

const COMMODITIES = [
  { name: 'Cocoa', floor: 620000, current: 650000, unit: '₦/64kg bag', safe: true },
  { name: 'Maize', floor: 25000, current: 24200, unit: '₦/50kg bag', safe: false },
  { name: 'Rice (Local)', floor: 38000, current: 42000, unit: '₦/50kg bag', safe: true },
  { name: 'Soybean', floor: 32000, current: 31500, unit: '₦/50kg bag', safe: false },
  { name: 'Palm Oil', floor: 16000, current: 18500, unit: '₦/25L', safe: true },
]

export default function PriceFloorAlert() {
  const [alerts, setAlerts] = useState<string[]>(COMMODITIES.filter(c => !c.safe).map(c => c.name))

  const toggle = (name: string) => setAlerts(a => a.includes(name) ? a.filter(n => n !== name) : [...a, name])

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🔔 Price Floor Alerts</h2>
      {COMMODITIES.map((c, i) => {
        const pct = ((c.current - c.floor) / c.floor * 100)
        const below = c.current < c.floor
        return (
          <div key={i} style={{ background: below ? '#fef2f2' : '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
              {below && <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#ef4444' }}>BELOW FLOOR</span>}
              {!below && <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#1a7c3e' }}>Safe</span>}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Floor: ₦{c.floor.toLocaleString()} · Current: ₦{c.current.toLocaleString()} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)</div>
            <button onClick={() => toggle(c.name)} style={{
              marginTop: 6, background: alerts.includes(c.name) ? '#1a7c3e' : '#e5e7eb', color: alerts.includes(c.name) ? '#fff' : '#666',
              border: 'none', borderRadius: 12, padding: '5px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>{alerts.includes(c.name) ? '🔔 Alert On' : '🔕 Alert Off'}</button>
          </div>
        )
      })}
    </div>
  )
}
