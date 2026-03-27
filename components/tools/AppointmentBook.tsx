'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Slot { day: string; time: string; client: string; service: string; fee: string }

const INITIAL: Slot[] = [
  { day: 'Mon', time: '10:00', client: 'Amara Diallo', service: 'Consultation', fee: '₡500' },
  { day: 'Wed', time: '14:30', client: 'Bisi Okafor',  service: 'Follow-up',    fee: '₡250' },
  { day: 'Fri', time: '09:00', client: 'Fatou Camara', service: 'Full Session',  fee: '₡1,200' },
]

export default function AppointmentBook() {
  const [slots, setSlots] = React.useState<Slot[]>(INITIAL)
  const [showModal, setShowModal] = React.useState(false)
  const [form, setForm] = React.useState({ client: '', service: '', day: 'Mon', time: '', fee: '' })
  const [reminders, setReminders] = React.useState(true)
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const book = () => {
    if (!form.client || !form.time) return
    setSlots(p => [...p, { ...form }])
    setForm({ client: '', service: '', day: 'Mon', time: '', fee: '' })
    setShowModal(false)
    showToast('✓ Appointment booked')
  }

  const today = new Date()
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay() + 1)

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#0f1e11', borderRadius: '16px 16px 0 0', padding: 20 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 14, fontSize: 14 }}>Book Appointment</div>
            {['client', 'service', 'time', 'fee'].map(f => (
              <input key={f} placeholder={f === 'fee' ? 'Fee (₡)' : f === 'time' ? 'Time (e.g. 09:00)' : f.charAt(0).toUpperCase() + f.slice(1)} value={(form as Record<string,string>)[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
              />
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: C.sub, fontWeight: 700, display: 'block', marginBottom: 4 }}>Day</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DAYS.map(d => (
                  <button key={d} onClick={() => setForm(p => ({ ...p, day: d }))} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: `1px solid ${form.day === d ? C.green : C.border}`, background: form.day === d ? 'rgba(26,124,62,.2)' : C.muted, color: form.day === d ? '#4ade80' : C.sub, fontWeight: 700 }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={book} style={{ flex: 1, padding: 11, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>Book Slot</button>
              <button onClick={() => setShowModal(false)} style={{ padding: '11px 16px', borderRadius: 10, background: C.muted, color: C.text, fontWeight: 700, fontSize: 13, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Week view */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 14 }}>
        {DAYS.map((d, i) => {
          const daySlots = slots.filter(s => s.day === d)
          const date = new Date(weekStart); date.setDate(weekStart.getDate() + i)
          const isToday = date.toDateString() === today.toDateString()
          return (
            <div key={d} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: C.sub, marginBottom: 3 }}>{d}</div>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: isToday ? 'rgba(26,124,62,.3)' : C.muted, border: `1px solid ${isToday ? C.green : C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? '#4ade80' : C.text }}>{date.getDate()}</div>
                {daySlots.length > 0 && (
                  <div style={{ position: 'absolute', bottom: 3, width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: 11, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', marginBottom: 14 }}>
        + Book Slot
      </button>

      {/* Reminders toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: C.muted, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: C.text }}>Appointment Reminders</span>
        <button onClick={() => setReminders(r => !r)} style={{ width: 40, height: 22, borderRadius: 99, background: reminders ? C.green : C.muted, border: `1px solid ${C.border}`, cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: reminders ? 20 : 2, transition: 'left .2s' }} />
        </button>
      </div>

      {/* Upcoming */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Upcoming Appointments</div>
      {slots.map((s, i) => (
        <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{s.client}</div>
            <div style={{ fontSize: 10, color: C.sub }}>{s.service} · {s.day} {s.time}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{s.fee}</div>
        </div>
      ))}
    </div>
  )
}
