'use client'
import { useState } from 'react'

const CROPS = [
  { name: 'Maize', emoji: '🌽', yieldPerAcre: 2.8, unit: 'tonnes', season: 'Mar–Jul' },
  { name: 'Cassava', emoji: '🥔', yieldPerAcre: 12.5, unit: 'tonnes', season: 'Apr–Dec' },
  { name: 'Rice', emoji: '🍚', yieldPerAcre: 3.2, unit: 'tonnes', season: 'Jun–Oct' },
  { name: 'Cocoa', emoji: '🍫', yieldPerAcre: 0.45, unit: 'tonnes', season: 'Sep–Mar' },
  { name: 'Sorghum', emoji: '🌾', yieldPerAcre: 1.8, unit: 'tonnes', season: 'May–Sep' },
]

export default function HarvestCalculator() {
  const [acres, setAcres] = useState('1')
  const [selected, setSelected] = useState(0)

  const crop = CROPS[selected]
  const est = (parseFloat(acres) || 0) * crop.yieldPerAcre

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🌾 Harvest Calculator</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {CROPS.map((c, i) => (
          <button key={c.name} onClick={() => setSelected(i)} style={{
            padding: '6px 14px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 13,
            background: selected === i ? '#1a7c3e' : '#e5e7eb', color: selected === i ? '#fff' : '#1a2e1a', cursor: 'pointer'
          }}>{c.emoji} {c.name}</button>
        ))}
      </div>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Acres</label>
        <input value={acres} onChange={e => setAcres(e.target.value)} type="number" min="0" style={{
          display: 'block', width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb',
          fontSize: 15, marginTop: 6, boxSizing: 'border-box'
        }} />
      </div>
      <div style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#666' }}>Estimated Yield for {crop.emoji} {crop.name}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#1a7c3e', margin: '6px 0' }}>{est.toFixed(1)} {crop.unit}</div>
        <div style={{ fontSize: 12, color: '#888' }}>Season: {crop.season} · {crop.yieldPerAcre} {crop.unit}/acre avg</div>
      </div>
    </div>
  )
}
