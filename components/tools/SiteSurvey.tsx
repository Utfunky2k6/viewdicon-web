'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Measurement { name: string; value: string; unit: string }
interface Hazard { text: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32'

const STAR = '★'
const EMPTY_STAR = '☆'

export default function SiteSurvey({ villageId: _v, roleKey: _r }: ToolProps) {
  const [location, setLocation] = useState({ lat: '', lng: '', fetching: false })
  const [siteName, setSiteName] = useState('')
  const [propType, setPropType] = useState('Residential')
  const [plotSize, setPlotSize] = useState('')
  const [rating, setRating] = useState(0)
  const [findings, setFindings] = useState('')
  const [measurements, setMeasurements] = useState<Measurement[]>([
    { name: 'Frontage',    value: '18.5', unit: 'm' },
    { name: 'Depth',       value: '30.0', unit: 'm' },
    { name: 'Side (left)', value: '28.8', unit: 'm' },
  ])
  const [newMeasName, setNewMeasName] = useState('')
  const [newMeasValue, setNewMeasValue] = useState('')
  const [newMeasUnit, setNewMeasUnit] = useState('m')
  const [hazards, setHazards] = useState<Hazard[]>([
    { text: 'Overhead power lines along northern boundary' },
    { text: 'Unstable soil near south-east corner' },
  ])
  const [newHazard, setNewHazard] = useState('')
  const [photos] = useState([null, null, null])
  const [saved, setSaved] = useState(false)

  const fetchLocation = () => {
    setLocation(l => ({ ...l, fetching: true }))
    setTimeout(() => {
      setLocation({ lat: '6.5244', lng: '3.3792', fetching: false })
    }, 1200)
  }

  const addMeasurement = () => {
    if (!newMeasName) return
    setMeasurements(m => [...m, { name: newMeasName, value: newMeasValue, unit: newMeasUnit }])
    setNewMeasName(''); setNewMeasValue(''); setNewMeasUnit('m')
  }

  const addHazard = () => {
    if (!newHazard) return
    setHazards(h => [...h, { text: newHazard }])
    setNewHazard('')
  }

  const inp = (v: string, s: (x: string) => void, ph: string) => (
    <input value={v} onChange={e => s(e.target.value)} placeholder={ph}
      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>📍 Site Survey Tool</h2>

      {/* Location */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>GPS LOCATION</div>
        <button
          onClick={fetchLocation}
          disabled={location.fetching}
          style={{ padding: '9px 16px', background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', marginBottom: 10, fontWeight: 600 }}
        >
          {location.fetching ? '⏳ Fetching...' : '📍 Use Current Location'}
        </button>
        {location.lat && (
          <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
            <span style={{ color: '#a5d6a7' }}>Lat: {location.lat}°N</span>
            <span style={{ color: '#a5d6a7' }}>Lng: {location.lng}°E</span>
          </div>
        )}
        {!location.lat && <div style={{ fontSize: 12, color: MT }}>No location captured</div>}
      </div>

      {/* Survey Form */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 12 }}>SURVEY DETAILS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>SITE NAME</div>
            {inp(siteName, setSiteName, 'e.g. Lot 7 Lekki Phase 2')}
          </div>
          <div>
            <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>PROPERTY TYPE</div>
            <select
              value={propType}
              onChange={e => setPropType(e.target.value)}
              style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }}
            >
              {['Residential', 'Commercial', 'Industrial', 'Agricultural'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>PLOT SIZE (m²)</div>
            {inp(plotSize, setPlotSize, '600')}
          </div>
          <div>
            <div style={{ fontSize: 11, color: MT, marginBottom: 8 }}>CONDITION RATING</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  onClick={() => setRating(n)}
                  style={{ fontSize: 26, cursor: 'pointer', color: n <= rating ? '#fbc02d' : MT }}
                >
                  {n <= rating ? STAR : EMPTY_STAR}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>KEY FINDINGS</div>
            <textarea
              value={findings}
              onChange={e => setFindings(e.target.value)}
              rows={3}
              placeholder="Describe key site findings, access conditions, boundary markers..."
              style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: 9, color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Photo Evidence */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>PHOTO EVIDENCE</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {photos.map((_, i) => (
            <div key={i} style={{ flex: 1, aspectRatio: '1', border: `2px dashed ${BD}`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: MT, gap: 4 }}>
              <span style={{ fontSize: 24 }}>+</span>
              <span style={{ fontSize: 10 }}>Photo {i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Measurements */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>MEASUREMENTS</div>
        <div style={{ marginBottom: 10 }}>
          {measurements.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: `1px solid ${BD}`, fontSize: 13 }}>
              <span style={{ flex: 2, color: MT }}>{m.name}</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{m.value}</span>
              <span style={{ color: MT }}>{m.unit}</span>
              <button onClick={() => setMeasurements(ms => ms.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', color: MT, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={newMeasName} onChange={e => setNewMeasName(e.target.value)} placeholder="Dimension"
            style={{ flex: 2, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '6px 8px', color: TX, fontSize: 12, minWidth: 0 }} />
          <input value={newMeasValue} onChange={e => setNewMeasValue(e.target.value)} placeholder="Value"
            style={{ flex: 1, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '6px 8px', color: TX, fontSize: 12, minWidth: 0 }} />
          <input value={newMeasUnit} onChange={e => setNewMeasUnit(e.target.value)} placeholder="Unit"
            style={{ width: 48, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '6px 6px', color: TX, fontSize: 12 }} />
          <button onClick={addMeasurement} style={{ background: GR, border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>+</button>
        </div>
      </div>

      {/* Hazards */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>⚠️ HAZARDS IDENTIFIED</div>
        {hazards.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${BD}`, fontSize: 13 }}>
            <span style={{ color: '#ffe0b2' }}>• {h.text}</span>
            <button onClick={() => setHazards(hs => hs.filter((_, j) => j !== i))}
              style={{ background: 'none', border: 'none', color: MT, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input value={newHazard} onChange={e => setNewHazard(e.target.value)} placeholder="Describe hazard..."
            style={{ flex: 1, background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }} />
          <button onClick={addHazard} style={{ background: '#c62828', border: 'none', borderRadius: 6, padding: '7px 14px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>+</button>
        </div>
      </div>

      <button
        onClick={() => setSaved(true)}
        style={{ width: '100%', padding: 13, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
        {saved ? '✅ Report Generated' : '📄 Generate Survey Report PDF'}
      </button>
    </div>
  )
}
