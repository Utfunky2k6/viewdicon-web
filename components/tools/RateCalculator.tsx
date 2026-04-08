'use client'
import { useState } from 'react'

const PRESETS = [
  { label: 'Hourly', rate: 5000, unit: 'hr' },
  { label: 'Daily', rate: 35000, unit: 'day' },
  { label: 'Per Item', rate: 1500, unit: 'item' },
  { label: 'Per KG', rate: 800, unit: 'kg' },
]

export default function RateCalculator() {
  const [selected, setSelected] = useState(0)
  const [qty, setQty] = useState('')
  const preset = PRESETS[selected]
  const total = qty ? parseFloat(qty) * preset.rate : 0
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🧮 Rate Calculator</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{ padding: '6px 14px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 12, background: selected === i ? '#1a7c3e' : '#e5e7eb', color: selected === i ? '#fff' : '#1a2e1a', cursor: 'pointer' }}>{p.label} — ₦{p.rate.toLocaleString()}/{p.unit}</button>
        ))}
      </div>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Quantity ({preset.unit}s)</label>
        <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="0" style={{ display: 'block', width: '100%', fontSize: 28, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none', color: '#1a2e1a', marginTop: 4 }} />
      </div>
      <div style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{qty || 0} {preset.unit}(s) x ₦{preset.rate.toLocaleString()}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#1a7c3e' }}>₦{total.toLocaleString()}</span>
      </div>
    </div>
  )
}
