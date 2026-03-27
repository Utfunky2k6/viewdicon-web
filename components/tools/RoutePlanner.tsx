'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Stop { id: number; label: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882'
const GR = '#2e7d32'

const INITIAL_STOPS: Stop[] = [
  { id: 1, label: 'Lagos Island (Start)' },
  { id: 2, label: 'Yaba Market' },
  { id: 3, label: 'Ikeja GRA' },
  { id: 4, label: 'Ojota Bus Terminal' },
  { id: 5, label: 'Ikorodu Town (End)' },
]

const WARNINGS = [
  { icon: '🚦', text: 'Traffic expected on Third Mainland Bridge 7–9 AM' },
  { icon: '🌧', text: 'Light rain expected near Ojota 11 AM–1 PM' },
  { icon: '🚧', text: 'Road works on Lagos-Ibadan Expressway after Ikeja' },
]

export default function RoutePlanner({ villageId: _v, roleKey: _r }: ToolProps) {
  const [stops, setStops] = useState<Stop[]>(INITIAL_STOPS)
  const [newStop, setNewStop] = useState('')
  const [nextId, setNextId] = useState(10)
  const [optimized, setOptimized] = useState(false)
  const [saved, setSaved] = useState<null | { km: number; min: number }>(null)
  const [copied, setCopied] = useState(false)

  const baseDistance = 47
  const baseTime = 83

  const distance = optimized ? baseDistance - (saved?.km ?? 0) : baseDistance
  const timeMin  = optimized ? baseTime   - (saved?.min ?? 0) : baseTime
  const fuelCost = Math.round(distance * 59.6)

  const addStop = () => {
    if (!newStop.trim()) return
    const entry: Stop = { id: nextId, label: newStop.trim() }
    setStops(s => [...s.slice(0, s.length - 1), entry, s[s.length - 1]])
    setNextId(n => n + 1)
    setNewStop('')
    setSaved(null)
    setOptimized(false)
  }

  const removeStop = (id: number) => {
    setStops(s => s.filter(st => st.id !== id))
    setSaved(null)
    setOptimized(false)
  }

  const optimize = () => {
    const kmSaved = 12
    const minSaved = 18
    setSaved({ km: kmSaved, min: minSaved })
    setOptimized(true)
    // simple mock reorder: move middle stops
    setStops(s => {
      const first = s[0]
      const last = s[s.length - 1]
      const middle = [...s.slice(1, -1)].reverse()
      return [first, ...middle, last]
    })
  }

  const fmt = (m: number) => `${Math.floor(m / 60)}h ${m % 60}min`

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>🗺 Route Planner</h2>

      {/* Route Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Distance', value: `${distance} km`, color: TX },
          { label: 'Est. Time', value: fmt(timeMin), color: TX },
          { label: 'Fuel Cost', value: `₡${fuelCost.toLocaleString()}`, color: '#a5d6a7' },
        ].map(stat => (
          <div key={stat.label} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: MT, marginTop: 3 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {optimized && saved && (
        <div style={{ background: '#0a2a0a', border: `1px solid ${GR}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#a5d6a7', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          Route optimised — saved {saved.km} km and {saved.min} minutes!
        </div>
      )}

      {/* Stops */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>ROUTE STOPS</div>
        {stops.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < stops.length - 1 ? `1px solid ${BD}` : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? GR : i === stops.length - 1 ? '#c62828' : '#1e3a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
              {i === 0 ? 'S' : i === stops.length - 1 ? 'E' : i}
            </div>
            <div style={{ flex: 1, fontSize: 14 }}>{s.label}</div>
            {i !== 0 && i !== stops.length - 1 && (
              <button
                onClick={() => removeStop(s.id)}
                style={{ background: 'transparent', border: 'none', color: MT, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
              >✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Add Stop */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newStop}
          onChange={e => setNewStop(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addStop()}
          placeholder="Add a stop (e.g. Surulere)"
          style={{ flex: 1, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 8, padding: '9px 12px', color: TX, fontSize: 14 }}
        />
        <button
          onClick={addStop}
          style={{ padding: '9px 16px', background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}
        >+</button>
      </div>

      {/* Optimize */}
      <button
        onClick={optimize}
        disabled={optimized}
        style={{ width: '100%', padding: 13, background: optimized ? '#1a3a1e' : GR, border: `1px solid ${GR}`, borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: optimized ? 'default' : 'pointer', marginBottom: 16 }}
      >
        {optimized ? '✅ Route Optimised' : '⚡ Optimise Route'}
      </button>

      {/* Warnings */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>ROAD CONDITIONS</div>
        {WARNINGS.map((w, i) => (
          <div key={i} style={{ padding: '10px 14px', borderBottom: i < WARNINGS.length - 1 ? `1px solid ${BD}` : 'none', fontSize: 13, display: 'flex', gap: 10 }}>
            <span>{w.icon}</span>
            <span style={{ color: '#ffe0b2' }}>{w.text}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ flex: 1, padding: 11, background: CARD, border: `1px solid ${BD}`, borderRadius: 8, color: TX, fontSize: 13, cursor: 'pointer' }}
        >
          {copied ? '✅ Copied!' : '📋 Copy Route'}
        </button>
        <button style={{ flex: 1, padding: 11, background: CARD, border: `1px solid ${BD}`, borderRadius: 8, color: TX, fontSize: 13, cursor: 'pointer' }}>
          💬 Share to Seso Chat
        </button>
      </div>
    </div>
  )
}
