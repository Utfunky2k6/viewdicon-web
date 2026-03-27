'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Vehicle { id: string; name: string; plate: string; emoji: string; fuelPct: number; lastFill: string; kmL: number; costPerKm: number }
interface LogEntry { date: string; vehicle: string; litres: number; pricePerL: number; odometer: number; station: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882'
const GR = '#2e7d32', RD = '#c62828', AM = '#e65100'

const VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Toyota RAV4',     plate: 'LAG-312-XK', emoji: '🚙', fuelPct: 14, lastFill: 'Mar 18',  kmL: 9.2,  costPerKm: 87  },
  { id: 'v2', name: 'Mercedes C180',   plate: 'ABA-078-GM', emoji: '🚗', fuelPct: 72, lastFill: 'Mar 22',  kmL: 11.4, costPerKm: 70  },
  { id: 'v3', name: 'Kia Sorento',     plate: 'PHC-554-JT', emoji: '🚕', fuelPct: 45, lastFill: 'Mar 20',  kmL: 10.1, costPerKm: 79  },
  { id: 'v4', name: 'Hyundai Tucson',  plate: 'KAN-201-BF', emoji: '🛻', fuelPct: 88, lastFill: 'Mar 24',  kmL: 12.3, costPerKm: 65  },
]

const MONTHLY = [
  { month: 'Oct', spend: 52400 },
  { month: 'Nov', spend: 67800 },
  { month: 'Dec', spend: 91200 },
  { month: 'Jan', spend: 74500 },
  { month: 'Feb', spend: 68900 },
  { month: 'Mar', spend: 84200 },
]

const MAX_SPEND = Math.max(...MONTHLY.map(m => m.spend))

export default function FuelTracker({ villageId: _v, roleKey: _r }: ToolProps) {
  const [logs, setLogs] = useState<LogEntry[]>([
    { date: '2026-03-22', vehicle: 'Mercedes C180',  litres: 40, pricePerL: 897, odometer: 84720, station: 'Total Energies Ikeja' },
    { date: '2026-03-20', vehicle: 'Kia Sorento',    litres: 35, pricePerL: 897, odometer: 61230, station: 'Mobil Apapa' },
    { date: '2026-03-18', vehicle: 'Toyota RAV4',    litres: 50, pricePerL: 897, odometer: 102480, station: 'Ardova VI' },
  ])
  const [selVehicle, setSelVehicle] = useState('v2')
  const [litres, setLitres] = useState('')
  const [priceL, setPriceL] = useState('')
  const [odo, setOdo] = useState('')
  const [station, setStation] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [logged, setLogged] = useState(false)

  const logFill = () => {
    if (!litres) return
    const veh = VEHICLES.find(v => v.id === selVehicle)
    if (!veh) return
    const entry: LogEntry = {
      date: new Date().toISOString().slice(0, 10),
      vehicle: veh.name,
      litres: parseFloat(litres),
      pricePerL: parseFloat(priceL) || 897,
      odometer: parseInt(odo) || 0,
      station: station || 'Unknown',
    }
    setLogs(l => [entry, ...l])
    setLitres(''); setPriceL(''); setOdo(''); setStation('')
    setLogged(true)
    setTimeout(() => { setLogged(false); setShowForm(false) }, 2000)
  }

  const fuelBarColor = (pct: number) => pct < 20 ? RD : pct < 40 ? AM : GR

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>⛽ Fuel Tracker</h2>
        <span style={{ background: CARD, border: `1px solid ${BD}`, padding: '4px 12px', borderRadius: 20, fontSize: 12, color: MT }}>
          Fleet: 4 vehicles
        </span>
      </div>

      {/* Alert */}
      <div style={{ background: '#1a0505', border: `1px solid ${RD}`, borderRadius: 10, padding: '9px 14px', marginBottom: 14, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>🔴</span>
        <span style={{ color: '#ef9a9a' }}>Toyota RAV4 fuel at 14% — refuel soon (plate: LAG-312-XK)</span>
      </div>

      {/* Vehicle Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {VEHICLES.map(v => (
          <div key={v.id} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{v.emoji}</span>
              {v.fuelPct < 20 && <span style={{ fontSize: 10, background: RD, color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>LOW</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
            <div style={{ fontSize: 11, color: MT, marginBottom: 8 }}>{v.plate}</div>
            <div style={{ height: 6, background: '#1a2e1b', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ width: `${v.fuelPct}%`, height: '100%', background: fuelBarColor(v.fuelPct), borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MT }}>
              <span>{v.fuelPct}% fuel</span>
              <span>Last fill: {v.lastFill}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Efficiency Table */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700, display: 'flex', gap: 8 }}>
          <span style={{ flex: 2 }}>VEHICLE</span>
          <span style={{ flex: 1, textAlign: 'right' }}>KM/L</span>
          <span style={{ flex: 1, textAlign: 'right' }}>₡/KM</span>
        </div>
        {VEHICLES.map((v, i) => (
          <div key={v.id} style={{ display: 'flex', gap: 8, padding: '9px 14px', borderBottom: i < VEHICLES.length - 1 ? `1px solid ${BD}` : 'none', fontSize: 13 }}>
            <span style={{ flex: 2 }}>{v.emoji} {v.name}</span>
            <span style={{ flex: 1, textAlign: 'right', color: '#a5d6a7' }}>{v.kmL}</span>
            <span style={{ flex: 1, textAlign: 'right', color: MT }}>₡{v.costPerKm}</span>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: MT, fontWeight: 700 }}>MONTHLY FLEET SPEND</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a5d6a7' }}>₡84,200 this month</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {MONTHLY.map((m, i) => (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, color: MT }}>₡{Math.round(m.spend / 1000)}k</div>
              <div style={{ width: '100%', background: i === MONTHLY.length - 1 ? GR : '#1e3a20', height: Math.round((m.spend / MAX_SPEND) * 54), borderRadius: '4px 4px 0 0' }} />
              <div style={{ fontSize: 10, color: MT }}>{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Fill-Up */}
      <button
        onClick={() => setShowForm(f => !f)}
        style={{ width: '100%', padding: 12, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}
      >
        {showForm ? '✕ Cancel' : '+ Log Fill-Up'}
      </button>

      {showForm && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          {logged
            ? <div style={{ textAlign: 'center', padding: 16, color: '#a5d6a7', fontSize: 15 }}>✅ Fill-up logged!</div>
            : <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div>
                  <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>VEHICLE</div>
                  <select
                    value={selVehicle}
                    onChange={e => setSelVehicle(e.target.value)}
                    style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }}
                  >
                    {VEHICLES.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                  </select>
                </div>
                {[['Litres filled', litres, setLitres, '45.0'], ['Price per litre (₡)', priceL, setPriceL, '897'], ['Odometer (km)', odo, setOdo, '84720'], ['Station name', station, setStation, 'Total Energies Ikeja']].map(([label, val, setter, ph]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>{label as string}</div>
                    <input
                      value={val as string}
                      onChange={e => (setter as (x: string) => void)(e.target.value)}
                      placeholder={ph as string}
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <button
                  onClick={logFill}
                  style={{ padding: 11, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  ⛽ Log Fill-Up
                </button>
              </div>
            </>
          }
        </div>
      )}

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>RECENT FILL-UPS</div>
          {logs.slice(0, 5).map((l, i) => (
            <div key={i} style={{ padding: '10px 14px', borderBottom: i < Math.min(logs.length, 5) - 1 ? `1px solid ${BD}` : 'none', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{l.vehicle}</span>
                <span style={{ color: '#a5d6a7' }}>₡{(l.litres * l.pricePerL).toLocaleString()}</span>
              </div>
              <div style={{ color: MT, marginTop: 2 }}>{l.litres}L @ ₡{l.pricePerL}/L · {l.station} · {l.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
