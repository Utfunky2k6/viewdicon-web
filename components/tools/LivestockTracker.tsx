'use client'
import { useState } from 'react'

const HERD = [
  { id: 'TAG-001', name: 'Bossie', species: 'Cattle', breed: 'Zebu', age: 4, weight: 320, health: 'Healthy', value: 85000, lastVet: '2026-03-10' },
  { id: 'TAG-002', name: 'Ngozi', species: 'Goat', breed: 'West African Dwarf', age: 2, weight: 28, health: 'Healthy', value: 12000, lastVet: '2026-02-20' },
  { id: 'TAG-003', name: 'Rex', species: 'Cattle', breed: 'Fulani', age: 6, weight: 410, health: 'Sick', value: 110000, lastVet: '2026-04-01' },
  { id: 'TAG-004', name: 'Amara', species: 'Sheep', breed: 'Ouda', age: 3, weight: 45, health: 'Healthy', value: 25000, lastVet: '2026-03-25' },
  { id: 'TAG-005', name: 'Kabo', species: 'Goat', breed: 'Sahel', age: 1, weight: 18, health: 'Monitoring', value: 8000, lastVet: '2026-04-02' },
]

const HEALTH_STYLE: Record<string, { bg: string; color: string }> = {
  Healthy:    { bg: '#dcfce7', color: '#16a34a' },
  Sick:       { bg: '#fee2e2', color: '#dc2626' },
  Monitoring: { bg: '#fef9c3', color: '#ca8a04' },
}

const SPECIES_ICON: Record<string, string> = {
  Cattle: '🐄', Goat: '🐐', Sheep: '🐑', Pig: '🐖', Chicken: '🐓',
}

export default function LivestockTracker() {
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<'All' | 'Cattle' | 'Goat' | 'Sheep'>('All')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = HERD.filter(a => filter === 'All' || a.species === filter)
  const totalValue = HERD.reduce((s, a) => s + a.value, 0)
  const sickCount = HERD.filter(a => a.health === 'Sick').length

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a1a1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>🐄 Livestock Tracker</h2>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Total Animals', value: HERD.length, icon: '🐾', color: '#1a7c3e' },
          { label: 'Total Value', value: `₦${(totalValue/1000).toFixed(0)}k`, icon: '💰', color: '#d97706' },
          { label: 'Need Attention', value: sickCount, icon: '🩺', color: sickCount > 0 ? '#dc2626' : '#6b7280' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Species filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
        {(['All','Cattle','Goat','Sheep'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 12px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
              background: filter === f ? '#1a7c3e' : '#f0f0f0', color: filter === f ? '#fff' : '#555' }}>
            {f === 'All' ? 'All' : SPECIES_ICON[f]} {f}
          </button>
        ))}
      </div>

      {/* Animal list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {filtered.map(animal => (
          <div key={animal.id}
            onClick={() => setSelected(selected === animal.id ? null : animal.id)}
            style={{ background: '#fff', border: `1.5px solid ${selected === animal.id ? '#86efac' : '#e5e7eb'}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{SPECIES_ICON[animal.species] ?? '🐾'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{animal.name}</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>{animal.id} · {animal.breed}</div>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '3px 9px',
                ...HEALTH_STYLE[animal.health] }}>
                {animal.health}
              </span>
            </div>
            {selected === animal.id && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    ['Age', `${animal.age} yrs`],
                    ['Weight', `${animal.weight} kg`],
                    ['Est. Value', `₦${animal.value.toLocaleString()}`],
                    ['Last Vet', animal.lastVet],
                  ].map(([k, v]) => (
                    <div key={k as string} style={{ background: '#f9f9f9', borderRadius: 8, padding: '6px 10px' }}>
                      <div style={{ fontSize: 9, color: '#9ca3af' }}>{k}</div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#1a7c3e', color: '#fff', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                    Log Health Event
                  </button>
                  <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                    Request Vet
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => setShowAdd(!showAdd)}
        style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff',
          fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
        + Register Animal
      </button>

      {showAdd && (
        <div style={{ marginTop: 14, background: '#f0fdf4', borderRadius: 12, padding: 14, border: '1px solid #86efac' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Register New Animal</div>
          {[['Tag ID','TAG-006'],['Name',''],['Species','Cattle'],['Breed',''],['Weight (kg','']].map(([label, placeholder]) => (
            <div key={label as string} style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>{label}</label>
              <input placeholder={placeholder as string}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
          ))}
          <button style={{ width: '100%', marginTop: 4, padding: '10px 0', borderRadius: 8, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
            Save Animal
          </button>
        </div>
      )}
    </div>
  )
}
