'use client'
import { useState } from 'react'

const CONTACTS = [
  { id: 1, type: 'ambulance', name: 'Lagos State Ambulance', phone: '+234-800-AMBU', eta: '8 min', status: 'available' },
  { id: 2, type: 'hospital', name: 'General Hospital Ikeja', phone: '+234-1-555-0100', eta: '12 min', status: 'available' },
  { id: 3, type: 'fire', name: 'Fire Service HQ', phone: '+234-1-555-0199', eta: '15 min', status: 'busy' },
  { id: 4, type: 'blood_bank', name: 'National Blood Service', phone: '+234-1-555-0200', eta: '25 min', status: 'available' },
  { id: 5, type: 'poison', name: 'Poison Control Centre', phone: '+234-1-555-0300', eta: null, status: 'available' },
]

const STATUS_COLOR: Record<string, string> = { available: '#16a34a', busy: '#dc2626' }
const TYPE_ICON: Record<string, string> = { ambulance: '🚑', hospital: '🏥', fire: '🚒', blood_bank: '🩸', poison: '☠️' }

export default function EmergencyConnect() {
  const [dispatching, setDispatching] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🚨 Emergency Connect</h2>
      <div style={{ background: '#fef2f2', borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: '1px solid #fecaca' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>Tap any service to dispatch</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CONTACTS.map(c => (
          <div key={c.id} onClick={() => setDispatching(c.id)}
            style={{ background: dispatching === c.id ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${dispatching === c.id ? '#86efac' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{TYPE_ICON[c.type]} {c.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', background: STATUS_COLOR[c.status] + '20', color: STATUS_COLOR[c.status] }}>{c.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Phone: <b style={{ color: '#374151' }}>{c.phone}</b></div>
              {c.eta && <div style={{ fontSize: 11, color: '#6b7280' }}>ETA: <b style={{ color: '#374151' }}>{c.eta}</b></div>}
            </div>
          </div>
        ))}
      </div>
      <button style={{ width: '100%', marginTop: 16, padding: '11px 0', borderRadius: 12, background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>🚨 SOS — Dispatch All</button>
    </div>
  )
}
