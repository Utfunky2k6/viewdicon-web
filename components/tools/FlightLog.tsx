'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Flight { date: string; route: string; duration: string; aircraft: string; status: 'COMPLETED' | 'DELAYED' | 'DIVERTED'; notes: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882'
const GR = '#2e7d32', AM = '#e65100', RD = '#c62828'

const FLIGHTS: Flight[] = [
  { date: '2026-03-24', route: 'LOS → ABV', duration: '1h 10m', aircraft: '5N-MAS', status: 'COMPLETED', notes: 'Smooth flight, no incidents' },
  { date: '2026-03-21', route: 'ABV → KAN', duration: '0h 55m', aircraft: '5N-MAS', status: 'COMPLETED', notes: 'Minor turbulence over Kaduna' },
  { date: '2026-03-18', route: 'LOS → PHC', duration: '1h 25m', aircraft: '5N-JBX', status: 'DELAYED',   notes: 'Delayed 40 min due to ATC' },
  { date: '2026-03-14', route: 'PHC → LOS', duration: '1h 20m', aircraft: '5N-JBX', status: 'COMPLETED', notes: 'All clear' },
  { date: '2026-03-10', route: 'KAN → ABV', duration: '0h 50m', aircraft: '5N-MAS', status: 'DIVERTED',  notes: 'Diverted to Kaduna due to visibility' },
]

const statusColor = (s: string) => s === 'COMPLETED' ? GR : s === 'DELAYED' ? AM : RD
const statusBg    = (s: string) => s === 'COMPLETED' ? '#0a2a0a' : s === 'DELAYED' ? '#2a1500' : '#1a0505'

export default function FlightLog({ villageId: _v, roleKey: _r }: ToolProps) {
  const [showForm, setShowForm] = useState(false)
  const [flights, setFlights] = useState<Flight[]>(FLIGHTS)
  const [form, setForm] = useState({ flightNo: '', aircraft: '', depCode: '', depTime: '', arrCode: '', arrTime: '', hours: '', notes: '' })
  const [crew, setCrew] = useState<string[]>(['Capt. Adewale Osei', 'F/O Babajide Nwachukwu'])
  const [newCrew, setNewCrew] = useState('')
  const [logged, setLogged] = useState(false)

  const totalHours = 47
  const totalMinutes = 20
  const annualLimit = 1000

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const logFlight = () => {
    if (!form.depCode || !form.arrCode) return
    const f: Flight = {
      date: new Date().toISOString().slice(0, 10),
      route: `${form.depCode.toUpperCase()} → ${form.arrCode.toUpperCase()}`,
      duration: form.hours || '1h 00m',
      aircraft: form.aircraft || '5N-MAS',
      status: 'COMPLETED',
      notes: form.notes,
    }
    setFlights(prev => [f, ...prev])
    setLogged(true)
    setTimeout(() => { setLogged(false); setShowForm(false) }, 2000)
  }

  const addCrew = () => { if (newCrew.trim()) { setCrew(c => [...c, newCrew.trim()]); setNewCrew('') } }

  const inp = (label: string, key: keyof typeof form, ph: string) => (
    <div>
      <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>{label}</div>
      <input
        value={form[key]}
        onChange={upd(key)}
        placeholder={ph}
        style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }}
      />
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>✈️ Flight Logbook</h2>

      {/* Currency Tracker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#a5d6a7' }}>{totalHours}h {totalMinutes}m</div>
          <div style={{ fontSize: 11, color: MT, marginTop: 4 }}>FLIGHT HRS THIS MONTH</div>
          <div style={{ height: 5, background: '#1a2e1b', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${(totalHours / annualLimit) * 100}%`, height: '100%', background: GR, borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ffe0b2' }}>{annualLimit - totalHours}h</div>
          <div style={{ fontSize: 11, color: MT, marginTop: 4 }}>REMAINING TO ANNUAL LIMIT</div>
          <div style={{ fontSize: 12, color: MT, marginTop: 6 }}>Limit: {annualLimit}h/year</div>
        </div>
      </div>

      {/* Log Flight Button */}
      <button
        onClick={() => setShowForm(f => !f)}
        style={{ width: '100%', padding: 12, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}
      >
        {showForm ? '✕ Cancel' : '+ Log Flight'}
      </button>

      {/* Log Form */}
      {showForm && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          {logged
            ? <div style={{ textAlign: 'center', padding: 20, color: '#a5d6a7', fontSize: 15 }}>✅ Flight logged!</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {inp('Flight Number', 'flightNo', 'VW-4291')}
                  {inp('Aircraft Reg', 'aircraft', '5N-MAS')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {inp('Departure (IATA)', 'depCode', 'LOS')}
                  {inp('Dep. Time', 'depTime', '08:30')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {inp('Arrival (IATA)', 'arrCode', 'ABV')}
                  {inp('Arr. Time', 'arrTime', '09:40')}
                </div>
                {inp('Flight Hours', 'hours', '1h 10m')}

                {/* Crew */}
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 6 }}>CREW</div>
                  {crew.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${BD}`, fontSize: 13 }}>
                      <span>👤 {c}</span>
                      <button onClick={() => setCrew(cr => cr.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: MT, cursor: 'pointer', fontSize: 14 }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <input
                      value={newCrew}
                      onChange={e => setNewCrew(e.target.value)}
                      placeholder="Add crew member"
                      style={{ flex: 1, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '6px 10px', color: TX, fontSize: 13 }}
                    />
                    <button onClick={addCrew} style={{ background: GR, border: 'none', borderRadius: 6, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  </div>
                </div>

                {/* Safety Notes */}
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>SAFETY NOTES</div>
                  <textarea
                    value={form.notes}
                    onChange={upd('notes')}
                    placeholder="Any incidents, unusual observations..."
                    rows={3}
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: 8, color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                <button onClick={logFlight} style={{ padding: 11, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  ✈️ Save to Logbook
                </button>
              </div>
            )
          }
        </div>
      )}

      {/* Recent Flights */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700, display: 'flex', gap: 8 }}>
          <span style={{ width: 80 }}>DATE</span>
          <span style={{ flex: 1 }}>ROUTE</span>
          <span style={{ width: 60 }}>DURATION</span>
          <span style={{ width: 60 }}>AIRCRAFT</span>
          <span style={{ width: 75 }}>STATUS</span>
        </div>
        {flights.slice(0, 5).map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: i < Math.min(flights.length, 5) - 1 ? `1px solid ${BD}` : 'none', background: statusBg(f.status) }}>
            <span style={{ width: 80, fontSize: 12, color: MT }}>{f.date}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{f.route}</span>
            <span style={{ width: 60, fontSize: 12, color: MT }}>{f.duration}</span>
            <span style={{ width: 60, fontSize: 12, color: MT }}>{f.aircraft}</span>
            <span style={{ width: 75, background: statusColor(f.status), color: '#fff', padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{f.status}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { const csv = 'Date,Route,Duration,Aircraft,Status\n' + flights.map(f => `${f.date},${f.route},${f.duration},${f.aircraft},${f.status}`).join('\n'); const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'flight-log.csv'; a.click() }} style={{ width: '100%', padding: 11, background: CARD, border: `1px solid ${BD}`, borderRadius: 10, color: TX, fontSize: 13, cursor: 'pointer' }}>
        📄 Generate Logbook PDF
      </button>
    </div>
  )
}
