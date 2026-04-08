'use client'
import { useState } from 'react'

const UNITS = [
  { from: 'kg', to: 'lb', factor: 2.20462 },
  { from: 'lb', to: 'kg', factor: 0.453592 },
  { from: 'kg', to: 'oz', factor: 35.274 },
  { from: 'g', to: 'kg', factor: 0.001 },
  { from: 'ton', to: 'kg', factor: 1000 },
]

export default function WeightCalculator() {
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState(0)
  const conv = UNITS[selected]
  const result = value ? (parseFloat(value) * conv.factor).toFixed(3) : '—'
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>⚖️ Weight Calculator</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {UNITS.map((u, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{ padding: '6px 14px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 12, background: selected === i ? '#1a7c3e' : '#e5e7eb', color: selected === i ? '#fff' : '#1a2e1a', cursor: 'pointer' }}>{u.from} → {u.to}</button>
        ))}
      </div>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Enter {conv.from}</label>
        <input value={value} onChange={e => setValue(e.target.value)} type="number" placeholder="0.00" style={{ display: 'block', width: '100%', fontSize: 28, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none', color: '#1a2e1a', marginTop: 4 }} />
      </div>
      <div style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Result in {conv.to}</p>
        <p style={{ fontSize: 32, fontWeight: 800, margin: '8px 0 0', color: '#1a7c3e' }}>{result}</p>
      </div>
    </div>
  )
}
