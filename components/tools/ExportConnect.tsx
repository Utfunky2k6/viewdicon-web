'use client'
import { useState } from 'react'

const MARKETS = [
  { destination: 'EU (Netherlands)', commodity: 'Cocoa Beans', minQty: '20 tonnes', pricePerKg: '$3.20', demand: 'High', season: 'Oct–Mar' },
  { destination: 'China', commodity: 'Sesame Seeds', minQty: '15 tonnes', pricePerKg: '$2.80', demand: 'High', season: 'Year-round' },
  { destination: 'India', commodity: 'Cashew Nuts', minQty: '10 tonnes', pricePerKg: '$5.50', demand: 'Medium', season: 'Feb–Jun' },
  { destination: 'USA', commodity: 'Shea Butter', minQty: '5 tonnes', pricePerKg: '$4.10', demand: 'Medium', season: 'Year-round' },
  { destination: 'Middle East', commodity: 'Hibiscus (Zobo)', minQty: '8 tonnes', pricePerKg: '$1.90', demand: 'Very High', season: 'Nov–Apr' },
]

export default function ExportConnect() {
  const [applied, setApplied] = useState<number[]>([])

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🚢 Export Connect</h2>
      {MARKETS.map((m, i) => (
        <div key={i} style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{m.commodity}</span>
            <span style={{
              padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: m.demand === 'Very High' ? '#dcfce7' : m.demand === 'High' ? '#fef9c3' : '#f3f4f6',
              color: m.demand === 'Very High' ? '#1a7c3e' : m.demand === 'High' ? '#a16207' : '#666'
            }}>{m.demand} demand</span>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>🌍 {m.destination} · Min: {m.minQty}</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>💰 {m.pricePerKg}/kg · Season: {m.season}</div>
          <button onClick={() => !applied.includes(i) && setApplied([...applied, i])} style={{
            marginTop: 8, background: applied.includes(i) ? '#e5e7eb' : '#1a7c3e', color: applied.includes(i) ? '#666' : '#fff',
            border: 'none', borderRadius: 12, padding: '6px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
          }}>{applied.includes(i) ? 'Applied ✓' : 'Apply to Export'}</button>
        </div>
      ))}
    </div>
  )
}
