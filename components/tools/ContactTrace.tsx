'use client'
import { useState } from 'react'

const ITEMS = [
  { name: 'Case #CT-01 → 8 contacts', status: 'tracing', value: '5 reached' },
  { name: 'Case #CT-02 → 12 contacts', status: 'complete', value: '12 reached' },
  { name: 'Case #CT-03 → 3 contacts', status: 'tracing', value: '1 reached' },
  { name: 'Case #CT-04 → 6 contacts', status: 'pending', value: '0 reached' },
]

const SC: Record<string,string> = {"tracing":"#f59e0b","complete":"#16a34a","pending":"#f59e0b"}

export default function ContactTrace() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🔗 Contact Trace</h2>

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
