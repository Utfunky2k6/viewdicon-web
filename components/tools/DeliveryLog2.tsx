'use client'
import { useState } from 'react'

const DELIVERIES = [
  { id: 1, mother: 'Aisha Bello', baby: 'Baby Boy Bello', weight: '3.4 kg', time: '2026-04-06 02:15', type: 'SVD', apgar: '8/9' },
  { id: 2, mother: 'Ngozi Eze', baby: 'Baby Girl Eze', weight: '2.9 kg', time: '2026-04-05 18:30', type: 'C-Section', apgar: '7/9' },
  { id: 3, mother: 'Fatima Diallo', baby: 'Baby Boy Diallo', weight: '3.1 kg', time: '2026-04-04 10:45', type: 'SVD', apgar: '9/10' },
  { id: 4, mother: 'Adama Traore', baby: 'Baby Girl Traore', weight: '2.6 kg', time: '2026-04-03 23:00', type: 'Assisted', apgar: '6/8' },
  { id: 5, mother: 'Zainab Musa', baby: 'Twins Musa', weight: '2.3/2.5 kg', time: '2026-04-02 14:20', type: 'C-Section', apgar: '7/8' },
]

const TYPE_COLOR: Record<string, string> = { SVD: '#16a34a', 'C-Section': '#f59e0b', Assisted: '#2563eb' }

export default function DeliveryLog2() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>👶 Delivery Log</h2>
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: '1px solid #bbf7d0' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>{DELIVERIES.length} deliveries this week</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DELIVERIES.map(d => (
          <div key={d.id} onClick={() => setExpanded(expanded === d.id ? null : d.id)}
            style={{ background: expanded === d.id ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${expanded === d.id ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{d.mother}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: TYPE_COLOR[d.type] + '20', color: TYPE_COLOR[d.type] }}>{d.type}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{d.baby} &middot; {d.weight}</div>
            {expanded === d.id && (
              <div style={{ display: 'flex', gap: 16, marginTop: 8, padding: '8px 10px', background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Time: <b>{d.time}</b></div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>APGAR: <b>{d.apgar}</b></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button style={{ width: '100%', marginTop: 16, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>+ Record Delivery</button>
    </div>
  )
}
