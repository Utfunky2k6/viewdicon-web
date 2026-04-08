'use client'
import { useState } from 'react'

const PATIENTS = [
  { id: 'PT-001', name: 'Chioma Adeola', age: 34, gender: 'F', blood: 'O+', lastVisit: '2026-04-02', condition: 'Hypertension', status: 'Active' },
  { id: 'PT-002', name: 'Kwame Asante', age: 52, gender: 'M', blood: 'A+', lastVisit: '2026-03-28', condition: 'Diabetes T2', status: 'Monitoring' },
  { id: 'PT-003', name: 'Aminata Diallo', age: 28, gender: 'F', blood: 'B-', lastVisit: '2026-04-05', condition: 'Antenatal 28wk', status: 'Active' },
  { id: 'PT-004', name: 'Emeka Obi', age: 45, gender: 'M', blood: 'AB+', lastVisit: '2026-03-15', condition: 'Malaria recovery', status: 'Discharged' },
]

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Active:     { bg: '#dcfce7', color: '#16a34a' },
  Monitoring: { bg: '#fef9c3', color: '#ca8a04' },
  Discharged: { bg: '#f3f4f6', color: '#6b7280' },
}

export default function PatientRecords() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState<'records' | 'vitals' | 'meds'>('records')

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.includes(search) || p.condition.toLowerCase().includes(search.toLowerCase())
  )
  const patient = PATIENTS.find(p => p.id === selected)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a1a1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>📁 Patient Records</h2>

      {!selected ? (
        <>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, or condition…"
              style={{ width: '100%', padding: '10px 10px 10px 32px', borderRadius: 10, border: '1.5px solid #d1d5db',
                fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Total', value: PATIENTS.length, color: '#1a7c3e' },
              { label: 'Active', value: PATIENTS.filter(p => p.status === 'Active').length, color: '#2563eb' },
              { label: 'Monitoring', value: PATIENTS.filter(p => p.status === 'Monitoring').length, color: '#ca8a04' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f9f9f9', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Patient list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelected(p.id)}
                style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12,
                  padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.gender === 'F' ? '#fce7f3' : '#dbeafe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {p.gender === 'F' ? '👩' : '👨'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{p.id} · {p.age} yrs · {p.blood}</div>
                    <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>{p.condition}</div>
                  </div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 99, padding: '3px 8px', whiteSpace: 'nowrap',
                  ...STATUS_STYLE[p.status] }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>

          <button style={{ width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 12, background: '#1a7c3e',
            color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
            + Register Patient
          </button>
        </>
      ) : patient ? (
        <>
          <button onClick={() => setSelected(null)}
            style={{ background: 'none', border: 'none', color: '#1a7c3e', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
            ← Back to Records
          </button>

          {/* Patient header */}
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: patient.gender === 'F' ? '#fce7f3' : '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {patient.gender === 'F' ? '👩' : '👨'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{patient.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{patient.id} · {patient.age} yrs · Blood {patient.blood}</div>
                <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', marginTop: 4, display: 'inline-block',
                  ...STATUS_STYLE[patient.status] }}>
                  {patient.status}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
            {([['records','📋 Records'],['vitals','❤️ Vitals'],['meds','💊 Meds']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: tab === k ? '#fff' : 'transparent', color: tab === k ? '#1a7c3e' : '#6b7280',
                  boxShadow: tab === k ? '0 1px 4px rgba(0,0,0,.1)' : 'none' }}>
                {l}
              </button>
            ))}
          </div>

          {tab === 'records' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { date: '2026-04-05', type: 'Consultation', note: 'BP 145/92. Adjusted lisinopril dose to 10mg.' },
                { date: '2026-03-22', type: 'Lab Result', note: 'HbA1c 7.2% — Good control. Continue metformin.' },
                { date: '2026-03-10', type: 'Follow-up', note: 'Weight stable. No new symptoms reported.' },
              ].map(r => (
                <div key={r.date} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1a7c3e' }}>{r.type}</span>
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151' }}>{r.note}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'vitals' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Blood Pressure', value: '145/92', unit: 'mmHg', icon: '🩺', alert: true },
                { label: 'Pulse', value: '78', unit: 'bpm', icon: '💓', alert: false },
                { label: 'Temperature', value: '36.8', unit: '°C', icon: '🌡️', alert: false },
                { label: 'Weight', value: '72', unit: 'kg', icon: '⚖️', alert: false },
                { label: 'SpO2', value: '98', unit: '%', icon: '🫁', alert: false },
                { label: 'RBS', value: '126', unit: 'mg/dL', icon: '🩸', alert: false },
              ].map(v => (
                <div key={v.label} style={{ background: v.alert ? '#fff7ed' : '#f9f9f9', border: `1px solid ${v.alert ? '#fed7aa' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 18 }}>{v.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: v.alert ? '#ea580c' : '#1a1a1a', marginTop: 4 }}>{v.value}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af' }}>{v.unit}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{v.label}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'meds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { drug: 'Lisinopril', dose: '10mg', freq: 'Once daily', refill: '2026-04-20' },
                { drug: 'Aspirin', dose: '75mg', freq: 'Once daily', refill: '2026-04-20' },
                { drug: 'Atorvastatin', dose: '20mg', freq: 'Once at night', refill: '2026-05-01' },
              ].map(m => (
                <div key={m.drug} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>💊 {m.drug} {m.dose}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{m.freq}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: '#9ca3af' }}>Refill by</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{m.refill}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button style={{ width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 12, background: '#1a7c3e',
            color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
            + Add Record
          </button>
        </>
      ) : null}
    </div>
  )
}
