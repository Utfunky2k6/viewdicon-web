'use client'
import { useState } from 'react'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const SHIFTS = ['Morning 6am–2pm', 'Afternoon 2pm–10pm', 'Night 10pm–6am']

const STAFF = [
  { name: 'Dr. Amaka Osei', role: 'Doctor', shifts: [0, 0, 1, 0, 0, 2, -1] },
  { name: 'Nurse Fatima Bah', role: 'Nurse', shifts: [1, 1, 0, 1, 1, -1, -1] },
  { name: 'Nurse Emeka', role: 'Nurse', shifts: [-1, 2, 2, 2, -1, 0, 0] },
  { name: 'Dr. Zara Mensah', role: 'Doctor', shifts: [2, -1, -1, 1, 2, 1, 1] },
  { name: 'Nurse Bisi Ola', role: 'Nurse', shifts: [0, 0, 1, -1, 0, -1, 2] },
]

const SHIFT_COLORS = ['#dcfce7', '#dbeafe', '#fce7f3']
const SHIFT_TEXT_COLORS = ['#16a34a', '#1d4ed8', '#be185d']

export default function ShiftPlanner() {
  const [activeDay, setActiveDay] = useState(0)
  const [view, setView] = useState<'week' | 'day'>('week')
  const [showForm, setShowForm] = useState(false)

  const dayStaff = STAFF.filter(s => s.shifts[activeDay] !== -1)
  const coverage = SHIFTS.map((_, si) => STAFF.filter(s => s.shifts[activeDay] === si).length)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>🕐 Shift Planner</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['week','day'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: view === v ? '#1a7c3e' : '#f0f0f0', color: view === v ? '#fff' : '#555' }}>
              {v === 'week' ? '📅 Week' : '📋 Day'}
            </button>
          ))}
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {DAYS.map((d, i) => (
          <button key={d} onClick={() => setActiveDay(i)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer',
              background: activeDay === i ? '#1a7c3e' : '#f3f4f6', color: activeDay === i ? '#fff' : '#555' }}>
            {d}
          </button>
        ))}
      </div>

      {/* Shift coverage summary */}
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 14, border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{DAYS[activeDay]} Coverage</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SHIFTS.map((shift, si) => (
            <div key={shift} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: SHIFT_COLORS[si], border: `1px solid ${SHIFT_TEXT_COLORS[si]}`, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 11, color: '#374151' }}>{shift}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: coverage[si] }).map((_, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: SHIFT_COLORS[si],
                    border: `1px solid ${SHIFT_TEXT_COLORS[si]}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800, color: SHIFT_TEXT_COLORS[si] }}>
                    {i + 1}
                  </div>
                ))}
                {coverage[si] === 0 && (
                  <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 700 }}>⚠ Uncovered</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {view === 'week' ? (
        /* Weekly grid */
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 480 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
              <div />
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#6b7280' }}>{d}</div>
              ))}
            </div>
            {STAFF.map(staff => (
              <div key={staff.name} style={{ display: 'grid', gridTemplateColumns: '120px repeat(7,1fr)', gap: 3, marginBottom: 3 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center' }}>{staff.name.split(' ').slice(-1)[0]}</div>
                {staff.shifts.map((si, di) => (
                  <div key={di} style={{ height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700,
                    background: si === -1 ? '#f3f4f6' : SHIFT_COLORS[si],
                    color: si === -1 ? '#d1d5db' : SHIFT_TEXT_COLORS[si] }}>
                    {si === -1 ? 'OFF' : ['AM','PM','NT'][si]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Day view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dayStaff.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, padding: 24 }}>No staff scheduled for {DAYS[activeDay]}</div>
          ) : dayStaff.map(staff => (
            <div key={staff.name} style={{ background: SHIFT_COLORS[staff.shifts[activeDay]],
              border: `1px solid ${SHIFT_TEXT_COLORS[staff.shifts[activeDay]]}44`,
              borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{staff.name}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>{staff.role}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: SHIFT_TEXT_COLORS[staff.shifts[activeDay]] }}>
                  {SHIFTS[staff.shifts[activeDay]].split(' ')[0]}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{SHIFTS[staff.shifts[activeDay]].split(' ').slice(1).join(' ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setShowForm(!showForm)}
        style={{ width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 12, background: '#1a7c3e',
          color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
        + Schedule Shift
      </button>

      {showForm && (
        <div style={{ marginTop: 12, background: '#f0fdf4', borderRadius: 12, padding: 14, border: '1px solid #86efac' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Add Shift Assignment</div>
          {[['Staff Member','Select staff'],['Day','Select day'],['Shift','Select shift']].map(([l, ph]) => (
            <div key={l as string} style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>{l}</label>
              <select style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12 }}>
                <option>{ph}</option>
              </select>
            </div>
          ))}
          <button style={{ width: '100%', marginTop: 4, padding: '10px 0', borderRadius: 8, background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
            Assign Shift
          </button>
        </div>
      )}
    </div>
  )
}
