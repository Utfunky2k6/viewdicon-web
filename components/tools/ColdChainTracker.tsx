'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type ChainStatus = 'OK' | 'WARNING' | 'BREACH'

interface Shipment {
  id: string; product: string; emoji: string; currentTemp: number; minTemp: number; maxTemp: number; humidity: number; checkpoint: string; status: ChainStatus
}

interface TempLog { time: string; temp: number; humidity: number; checkpoint: string }

const INIT_SHIPMENTS: Shipment[] = [
  { id: 'CC-001', product: 'Frozen Yam Chunks', emoji: '🍠', currentTemp: -18, minTemp: -22, maxTemp: -15, humidity: 85, checkpoint: 'Apapa Cold Store B', status: 'OK' },
  { id: 'CC-002', product: 'Fresh Atlantic Fish', emoji: '🐟', currentTemp: 7.2, minTemp: 0, maxTemp: 4, humidity: 92, checkpoint: 'Victoria Island Hub', status: 'WARNING' },
  { id: 'CC-003', product: 'Vaccine Stock (BCG)', emoji: '💉', currentTemp: 5.5, minTemp: 2, maxTemp: 8, humidity: 60, checkpoint: 'NIMR Dispatch Centre', status: 'OK' },
]

const TEMP_LOGS: TempLog[] = [
  { time: '14:00', temp: 5.5, humidity: 60, checkpoint: 'NIMR Dispatch' },
  { time: '13:00', temp: 5.8, humidity: 62, checkpoint: 'NIMR Dispatch' },
  { time: '12:00', temp: 5.2, humidity: 59, checkpoint: 'Ojodu Checkpoint' },
  { time: '11:00', temp: 6.1, humidity: 63, checkpoint: 'Ojodu Checkpoint' },
  { time: '10:00', temp: 5.9, humidity: 61, checkpoint: 'Ojodu Checkpoint' },
  { time: '09:00', temp: 5.4, humidity: 58, checkpoint: 'Origin: Marina Cold Store' },
  { time: '08:00', temp: 5.2, humidity: 57, checkpoint: 'Origin: Marina Cold Store' },
  { time: '07:00', temp: 5.0, humidity: 56, checkpoint: 'Origin: Marina Cold Store' },
  { time: '06:00', temp: 4.8, humidity: 55, checkpoint: 'Origin: Marina Cold Store' },
  { time: '05:00', temp: 5.0, humidity: 55, checkpoint: 'Origin: Marina Cold Store' },
]

const ALERT_HISTORY = [
  { time: '11:42', severity: 'HIGH', product: 'Fresh Atlantic Fish', detail: 'Temp exceeded 4°C for 38 min', action: 'Refrigeration unit reset' },
  { time: '08:15', severity: 'LOW', product: 'Frozen Yam Chunks', detail: 'Humidity spike: 91%', action: 'Monitoring continued' },
]

const statusColor: Record<ChainStatus, string> = { OK: green, WARNING: amber, BREACH: red }

export default function ColdChainTracker({ villageId, roleKey }: ToolProps) {
  const [shipments, setShipments] = useState<Shipment[]>(INIT_SHIPMENTS)
  const [selected, setSelected] = useState<string>('CC-003')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ product: '', origin: '', destination: '', minTemp: '', maxTemp: '' })
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const breaches = shipments.filter(s => s.status !== 'OK')

  const addShipment = () => {
    if (!addForm.product) return
    const s: Shipment = {
      id: `CC-00${shipments.length + 1}`, product: addForm.product, emoji: '📦',
      currentTemp: Number(addForm.minTemp) + 1, minTemp: Number(addForm.minTemp), maxTemp: Number(addForm.maxTemp),
      humidity: 70, checkpoint: addForm.origin, status: 'OK'
    }
    setShipments(prev => [...prev, s]); setShowAdd(false); setAddForm({ product: '', origin: '', destination: '', minTemp: '', maxTemp: '' })
    flash('Shipment added to cold chain monitor')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Cold Chain Tracker</div>
          <div style={{ color: muted, fontSize: 12 }}>Perishables & medical — temperature monitoring</div>
        </div>
        <button onClick={() => setShowAdd(s => !s)} style={btn(gold)}>+ Add Shipment</button>
      </div>

      {/* Breach alerts */}
      {breaches.length > 0 && (
        <div style={{ background: red + '22', border: `1px solid ${red}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: red, marginBottom: 6 }}>🌡 Temperature Alerts</div>
          {breaches.map(s => (
            <div key={s.id} style={{ fontSize: 12, color: amber, marginBottom: 2 }}>
              {s.emoji} {s.product} — {s.currentTemp}°C (range: {s.minTemp}°C to {s.maxTemp}°C)
            </div>
          ))}
        </div>
      )}

      {/* Shipment cards */}
      {shipments.map(s => (
        <div key={s.id} onClick={() => setSelected(s.id)}
          style={{ background: selected === s.id ? '#0f2015' : card, border: `2px solid ${selected === s.id ? statusColor[s.status] : border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{s.emoji}</span>{s.product}
              </div>
              <div style={{ fontSize: 11, color: muted }}>{s.id} · {s.checkpoint}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[s.status], background: statusColor[s.status] + '22', padding: '3px 8px', borderRadius: 10 }}>{s.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: muted }}>Current Temp</div>
              <div style={{ fontWeight: 700, color: s.status === 'OK' ? green : red, fontSize: 18 }}>{s.currentTemp}°C</div>
              <div style={{ fontSize: 10, color: muted }}>Range: {s.minTemp}°C – {s.maxTemp}°C</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: muted }}>Humidity</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: blue }}>{s.humidity}%</div>
            </div>
          </div>
        </div>
      ))}

      {/* Temp log for selected */}
      {selected && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 11, color: muted, fontWeight: 700 }}>
            TEMPERATURE LOG — {shipments.find(s => s.id === selected)?.product}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 70px 70px 1fr', padding: '6px 14px', fontSize: 10, color: muted, borderBottom: `1px solid ${border}` }}>
            <span>TIME</span><span>TEMP</span><span>HUMID</span><span>CHECKPOINT</span>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {TEMP_LOGS.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 70px 70px 1fr', padding: '6px 14px', borderBottom: `1px solid ${border}`, fontSize: 11 }}>
                <span style={{ color: muted }}>{l.time}</span>
                <span style={{ color: l.temp > 6 ? amber : green }}>{l.temp}°C</span>
                <span style={{ color: blue }}>{l.humidity}%</span>
                <span style={{ color: muted, fontSize: 10 }}>{l.checkpoint}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert history */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 11, color: muted, fontWeight: 700 }}>ALERT HISTORY</div>
        {ALERT_HISTORY.map((a, i) => (
          <div key={i} style={{ padding: '10px 14px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: a.severity === 'HIGH' ? red : amber }}>{a.severity}</span>
              <span style={{ fontSize: 11, color: muted }}>{a.time}</span>
            </div>
            <div style={{ fontSize: 12 }}>{a.product} — {a.detail}</div>
            <div style={{ fontSize: 11, color: green }}>Action: {a.action}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Add Shipment to Monitor</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input placeholder="Product name" value={addForm.product} onChange={e => setAddForm(f => ({ ...f, product: e.target.value }))} style={inp} />
            <input placeholder="Origin" value={addForm.origin} onChange={e => setAddForm(f => ({ ...f, origin: e.target.value }))} style={inp} />
            <input placeholder="Destination" value={addForm.destination} onChange={e => setAddForm(f => ({ ...f, destination: e.target.value }))} style={inp} />
            <div style={{ display: 'flex', gap: 4 }}>
              <input placeholder="Min °C" value={addForm.minTemp} onChange={e => setAddForm(f => ({ ...f, minTemp: e.target.value }))} style={{ ...inp, width: '48%' }} />
              <input placeholder="Max °C" value={addForm.maxTemp} onChange={e => setAddForm(f => ({ ...f, maxTemp: e.target.value }))} style={{ ...inp, width: '48%' }} />
            </div>
          </div>
          <button onClick={addShipment} style={btn(green)}>Add Shipment</button>
        </div>
      )}
    </div>
  )
}
