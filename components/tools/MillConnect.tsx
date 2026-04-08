'use client'
import { useState } from 'react'

const MILLS = [
  { name: 'Dangote Flour Mill', type: 'Grain Milling', location: 'Apapa, Lagos', distance: '12 km', capacity: '500 tonnes/day', status: 'open' },
  { name: 'Olam Rice Mill', type: 'Rice Processing', location: 'Nasarawa', distance: '45 km', capacity: '200 tonnes/day', status: 'open' },
  { name: 'Okomu Oil Mill', type: 'Palm Oil Processing', location: 'Edo State', distance: '8 km', capacity: '150 tonnes/day', status: 'busy' },
  { name: 'Abubakar Cassava Mill', type: 'Cassava → Garri', location: 'Benue', distance: '22 km', capacity: '80 tonnes/day', status: 'open' },
  { name: 'Shonga Sugar Mill', type: 'Sugar Processing', location: 'Kwara', distance: '60 km', capacity: '300 tonnes/day', status: 'closed' },
]

export default function MillConnect() {
  const [booked, setBooked] = useState<number[]>([])

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🏭 Mill Connect</h2>
      {MILLS.map((m, i) => (
        <div key={i} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</span>
            <span style={{
              padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: m.status === 'open' ? '#dcfce7' : m.status === 'busy' ? '#fef3c7' : '#fee2e2',
              color: m.status === 'open' ? '#1a7c3e' : m.status === 'busy' ? '#a16207' : '#ef4444'
            }}>{m.status}</span>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>{m.type} · {m.location} · {m.distance}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Capacity: {m.capacity}</div>
          {m.status !== 'closed' && (
            <button onClick={() => !booked.includes(i) && setBooked([...booked, i])} style={{
              marginTop: 8, background: booked.includes(i) ? '#e5e7eb' : '#1a7c3e', color: booked.includes(i) ? '#666' : '#fff',
              border: 'none', borderRadius: 12, padding: '6px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>{booked.includes(i) ? 'Booking Sent ✓' : 'Book Slot'}</button>
          )}
        </div>
      ))}
    </div>
  )
}
