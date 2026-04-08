'use client'
import { useState } from 'react'

const READINGS = [
  { station: 'Ikeja AWS', temp: 33, humidity: 72, wind: 12, rain24h: 2.1, updated: '15 min ago' },
  { station: 'Kano Agro', temp: 39, humidity: 28, wind: 18, rain24h: 0, updated: '20 min ago' },
  { station: 'Jos Plateau', temp: 24, humidity: 65, wind: 8, rain24h: 14.3, updated: '10 min ago' },
  { station: 'Enugu East', temp: 31, humidity: 78, wind: 6, rain24h: 8.7, updated: '25 min ago' },
]

export default function WeatherStation() {
  const [selected, setSelected] = useState(0)
  const r = READINGS[selected]

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🌡️ Weather Station</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {READINGS.map((s, i) => (
          <button key={s.station} onClick={() => setSelected(i)} style={{
            padding: '6px 12px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 12,
            background: selected === i ? '#1a7c3e' : '#e5e7eb', color: selected === i ? '#fff' : '#1a2e1a', cursor: 'pointer'
          }}>{s.station}</button>
        ))}
      </div>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{r.station}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1a7c3e' }}>{r.temp}°C</div>
            <div style={{ fontSize: 11, color: '#888' }}>Temperature</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{r.humidity}%</div>
            <div style={{ fontSize: 11, color: '#888' }}>Humidity</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>{r.wind} km/h</div>
            <div style={{ fontSize: 11, color: '#888' }}>Wind Speed</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0ea5e9' }}>{r.rain24h} mm</div>
            <div style={{ fontSize: 11, color: '#888' }}>Rain (24h)</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 8, textAlign: 'right' }}>Updated {r.updated}</div>
      </div>
    </div>
  )
}
