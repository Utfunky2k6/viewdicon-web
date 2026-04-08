'use client'
import { useState } from 'react'

const TARGETS = [
  { id: 1, name: 'Weekly Cowrie Sales', target: 500000, current: 372000, unit: 'COW' },
  { id: 2, name: 'Monthly Revenue', target: 2000000, current: 1450000, unit: 'NGN' },
  { id: 3, name: 'New Customers', target: 50, current: 38, unit: '' },
  { id: 4, name: 'Repeat Orders', target: 120, current: 95, unit: '' },
]

export default function SalesTargetTracker() {
  const [targets, setTargets] = useState(TARGETS)
  const bump = (id: number) => setTargets(ts => ts.map(t => t.id === id ? { ...t, current: Math.min(t.current + Math.round(t.target * 0.05), t.target) } : t))
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🎯 Sales Targets</h2>
      {targets.map(t => {
        const pct = Math.round((t.current / t.target) * 100)
        return (
          <div key={t.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? '#16a34a' : '#f59e0b' }}>{pct}%</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 99, height: 10, marginBottom: 6 }}>
              <div style={{ background: pct >= 100 ? '#16a34a' : '#1a7c3e', height: 10, borderRadius: 99, width: `${Math.min(pct, 100)}%`, transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{t.current.toLocaleString()} / {t.target.toLocaleString()} {t.unit}</span>
              <button onClick={() => bump(t.id)} style={{ padding: '4px 12px', borderRadius: 12, border: 'none', background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+ Log Sale</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
