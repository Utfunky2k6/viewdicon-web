'use client'
import { useState } from 'react'

const ITEMS = [
  { name: 'Maize: Apply top dressing now', status: 'urgent', value: 'Week 6-8' },
  { name: 'Tomato: Watch for blight', status: 'advisory', value: 'Rainy season' },
  { name: 'Cassava: Optimal planting window', status: 'info', value: 'Next 2 weeks' },
  { name: 'Rice: Flood paddy fields', status: 'advisory', value: 'Transplant stage' },
]

const SC: Record<string,string> = {"urgent":"#ef4444","advisory":"#3b82f6","info":"#3b82f6"}

export default function CropAdvisory() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📡 Crop Advisory</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ITEMS.map((item, i) => (
          <div key={i} onClick={() => setSelected(selected === i ? null : i)}
            style={{ background: selected === i ? '#f0fdf4' : '#fafafa',
              border: `1.5px solid ${selected === i ? '#86efac' : '#e5e7eb'}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px',
                background: (SC[item.status] || '#6b7280') + '20', color: SC[item.status] || '#6b7280' }}>
                {item.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{item.value}</div>
            {selected === i && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: '#f0fdf4', borderRadius: 8,
                fontSize: 11, color: '#374151', border: '1px solid #bbf7d0' }}>
                Tap to view full details, update status, or take action on this item.
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff',
          fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          + Add New
        </button>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#f0fdf4', color: '#1a7c3e',
          fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>
          Export Report
        </button>
      </div>
    </div>
  )
}
