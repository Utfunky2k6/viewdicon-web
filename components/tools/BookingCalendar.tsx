'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const blue = '#5b9bd5'
const red = '#e05a4e'

interface Booking {
  time: string
  client: string
  service: string
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED'
  amount: number
}

const TODAY_BOOKINGS: Booking[] = [
  { time: '09:00am', client: 'Ngozi Okonkwo', service: 'Hair Braiding (Full)', status: 'COMPLETED', amount: 8500 },
  { time: '11:30am', client: 'Fatima Diallo', service: 'Gele Tying', status: 'CONFIRMED', amount: 4200 },
  { time: '02:00pm', client: 'Amina Bello', service: 'Makeup + Gele', status: 'CONFIRMED', amount: 12000 },
  { time: '04:30pm', client: 'Adaeze Madu', service: 'Hair Braiding (Half)', status: 'PENDING', amount: 5500 },
]

const SERVICES = ['Hair Braiding (Full)', 'Hair Braiding (Half)', 'Gele Tying', 'Makeup + Gele', 'Aso-Oke Styling', 'Head Wrap Styling']

const AVAILABLE_SLOTS = ['08:00am', '10:00am', '01:00pm', '03:00pm', '05:30pm']

const statusColor: Record<string, string> = { CONFIRMED: green, PENDING: gold, COMPLETED: muted }

// Build a 35-cell month grid (5 weeks × 7 days), March 2026 starts on Sunday
const MARCH_2026_START_DAY = 0 // Sunday
const DAYS_IN_MARCH = 31
const BOOKED_DATES = new Set([3, 7, 8, 12, 15, 18, 19, 22, 26, 27])
const TODAY_DATE = 26

export default function BookingCalendar({ villageId, roleKey }: ToolProps) {
  const [bookings, setBookings] = useState<Booking[]>(TODAY_BOOKINGS)
  const [showNew, setShowNew] = useState(false)
  const [newClient, setNewClient] = useState('')
  const [newService, setNewService] = useState(SERVICES[0])
  const [newTime, setNewTime] = useState('')
  const [newDeposit, setNewDeposit] = useState('')
  const [bookedSlot, setBookedSlot] = useState<string | null>(null)

  function createBooking() {
    if (!newClient || !newTime) return
    setBookings(prev => [{
      time: newTime, client: newClient, service: newService,
      status: 'PENDING', amount: parseInt(newDeposit) || 5000,
    }, ...prev])
    setBookedSlot(newTime)
    setShowNew(false)
    setNewClient('')
    setNewDeposit('')
  }

  // Build calendar cells
  const cells: (number | null)[] = []
  for (let i = 0; i < MARCH_2026_START_DAY; i++) cells.push(null)
  for (let d = 1; d <= DAYS_IN_MARCH; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>BOOKING SYSTEM</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>March 2026</div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['Bookings', '18'], ['Revenue', '₡94,500'], ['Occupancy', '92%']].map(([l, v]) => (
          <div key={l} style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: muted }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: l === 'Revenue' ? gold : text }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 14, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, color: muted, padding: '2px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((day, i) => (
            <div
              key={i}
              style={{
                height: 32, borderRadius: 8, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: day === TODAY_DATE ? green : 'transparent',
                border: day === TODAY_DATE ? 'none' : `1px solid transparent`,
              }}
            >
              {day && (
                <>
                  <div style={{
                    fontSize: 12, fontWeight: day === TODAY_DATE ? 800 : 400,
                    color: day === TODAY_DATE ? '#000' : day ? text : 'transparent',
                  }}>{day}</div>
                  {day && BOOKED_DATES.has(day) && day !== TODAY_DATE && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: gold }} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today's bookings */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>Today's Bookings</div>
        {bookings.map((b, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 48, fontSize: 11, color: gold, fontWeight: 700 }}>{b.time}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.client}</div>
                <div style={{ fontSize: 11, color: muted }}>{b.service}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>₡{b.amount.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: statusColor[b.status] }}>{b.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Available slots */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>Available Slots</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AVAILABLE_SLOTS.map(slot => (
            <button
              key={slot}
              onClick={() => { setNewTime(slot); setShowNew(true) }}
              style={{
                padding: '7px 14px', borderRadius: 20,
                border: `1px solid ${bookedSlot === slot ? gold : border}`,
                background: bookedSlot === slot ? gold + '22' : bg,
                color: bookedSlot === slot ? gold : text,
                cursor: 'pointer', fontSize: 13,
              }}
            >{slot}</button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowNew(true)}
        style={{ width: '100%', background: green, color: '#000', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
        + New Booking
      </button>

      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Booking</div>
            <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="Client name" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
            <select value={newService} onChange={e => setNewService(e.target.value)} style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="Time (e.g. 10:00am)" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
            <input value={newDeposit} onChange={e => setNewDeposit(e.target.value)} type="number" placeholder="Deposit amount (₡)" style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: 12, border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createBooking} style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: green, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
