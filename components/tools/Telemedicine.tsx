'use client'
import React, { useState, useEffect } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Med { drug: string; dose: string; freq: string; days: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882'
const GR = '#2e7d32', RD = '#c62828', AM = '#e65100'

export default function Telemedicine({ villageId: _v, roleKey: _r }: ToolProps) {
  const [view, setView] = useState<'waiting' | 'live' | 'done'>('waiting')
  const [t, setT] = useState(0)
  const [bp, setBp] = useState('')
  const [pulse, setPulse] = useState('')
  const [temp, setTemp] = useState('')
  const [spo2, setSpo2] = useState('')
  const [soap, setSoap] = useState('')
  const [meds, setMeds] = useState<Med[]>([])
  const [drug, setDrug] = useState('')
  const [dose, setDose] = useState('')
  const [freq, setFreq] = useState('')
  const [days, setDays] = useState('')

  useEffect(() => {
    if (view !== 'live') return
    const id = setInterval(() => setT(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [view])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const addMed = () => {
    if (!drug) return
    setMeds(m => [...m, { drug, dose, freq, days }])
    setDrug(''); setDose(''); setFreq(''); setDays('')
  }

  const inp = (val: string, set: (x: string) => void, ph: string) => (
    <input
      value={val}
      onChange={e => set(e.target.value)}
      placeholder={ph}
      style={{
        background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6,
        padding: '7px 10px', color: TX, fontSize: 13, width: '100%', boxSizing: 'border-box'
      }}
    />
  )

  const statusBg = view === 'live' ? GR : view === 'done' ? MT : AM

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>🩺 Telemedicine Console</h2>
        <span style={{ background: statusBg, color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
          {view === 'live' ? 'ACTIVE' : view === 'done' ? 'COMPLETED' : 'WAITING'}
        </span>
      </div>

      {/* Patient Card */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1e3a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          👩🏾
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Ngozi Adaeze Okonkwo</div>
          <div style={{ color: MT, fontSize: 12 }}>Age 34 · Female · +234 801 234 5678</div>
          <div style={{ color: '#ef9a9a', fontSize: 12, marginTop: 3 }}>
            📋 Persistent headache and dizziness for 3 days
          </div>
        </div>
      </div>

      {/* Waiting state */}
      {view === 'waiting' && (
        <button
          onClick={() => { setView('live'); setT(0) }}
          style={{ width: '100%', padding: 14, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}
        >
          📹 Join Consultation
        </button>
      )}

      {/* Live state */}
      {view === 'live' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 180, background: '#020705', border: `1px solid ${BD}`, borderRadius: 10, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#4caf50' }} />
                <span style={{ color: '#4caf50', fontSize: 12, fontWeight: 700 }}>LIVE</span>
              </div>
              <span style={{ fontSize: 28 }}>🎥</span>
              <span style={{ fontSize: 20, fontFamily: 'monospace', color: '#4caf50' }}>⏱ {fmt(t)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 130, background: CARD, border: `1px solid ${BD}`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: MT, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>PATIENT INFO</div>
              <div style={{ fontSize: 12 }}>Age: 34 · Female</div>
              <div style={{ fontSize: 12, marginTop: 6, color: '#ef9a9a', lineHeight: 1.5 }}>
                Chief complaint: headache + dizziness × 3 days
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>VITAL SIGNS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><div style={{ fontSize: 11, color: MT, marginBottom: 3 }}>BP (mmHg)</div>{inp(bp, setBp, '120/80')}</div>
              <div><div style={{ fontSize: 11, color: MT, marginBottom: 3 }}>Pulse (bpm)</div>{inp(pulse, setPulse, '72')}</div>
              <div><div style={{ fontSize: 11, color: MT, marginBottom: 3 }}>Temp (°C)</div>{inp(temp, setTemp, '36.6')}</div>
              <div><div style={{ fontSize: 11, color: MT, marginBottom: 3 }}>SpO2 (%)</div>{inp(spo2, setSpo2, '98')}</div>
            </div>
          </div>

          {/* SOAP Notes */}
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 8 }}>SOAP NOTES</div>
            <textarea
              value={soap}
              onChange={e => setSoap(e.target.value)}
              rows={4}
              placeholder={'S: Patient reports...\nO: On examination...\nA: Assessment...\nP: Plan...'}
              style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: 10, color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Prescription */}
          <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>PRESCRIPTION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 6, marginBottom: 10 }}>
              {([['Drug name', drug, setDrug], ['Dose', dose, setDose], ['Freq', freq, setFreq], ['Days', days, setDays]] as [string, string, (v: string) => void][]).map(([ph, val, setter]) => (
                <input
                  key={ph}
                  placeholder={ph}
                  value={val}
                  onChange={e => setter(e.target.value)}
                  style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '6px 8px', color: TX, fontSize: 12, minWidth: 0 }}
                />
              ))}
              <button
                onClick={addMed}
                style={{ background: GR, border: 'none', borderRadius: 6, padding: '0 12px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 18 }}
              >+</button>
            </div>
            {meds.length === 0
              ? <div style={{ color: MT, fontSize: 12, textAlign: 'center', padding: '6px 0' }}>No medications added</div>
              : meds.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, padding: '5px 0', borderBottom: `1px solid ${BD}` }}>
                  <span style={{ flex: 2 }}>💊 {m.drug}</span>
                  <span style={{ flex: 1, color: MT }}>{m.dose}</span>
                  <span style={{ flex: 1, color: MT }}>{m.freq}</span>
                  <span style={{ flex: 1, color: MT }}>{m.days}d</span>
                </div>
              ))
            }
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setView('done')}
              style={{ flex: 1, padding: 12, background: RD, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              🔴 End &amp; Save Notes
            </button>
            <button style={{ flex: 1, padding: 12, background: CARD, border: `1px solid ${BD}`, borderRadius: 10, color: TX, fontSize: 14, cursor: 'pointer' }}>
              📄 Generate PDF
            </button>
          </div>
        </>
      )}

      {/* Done state */}
      {view === 'done' && (
        <div style={{ background: CARD, border: `1px solid ${GR}`, borderRadius: 12, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>Consultation Complete</div>
          <div style={{ color: MT, fontSize: 13, marginTop: 6 }}>Duration: {fmt(t)} · Notes &amp; prescription saved</div>
          <button
            onClick={() => { setView('waiting'); setT(0) }}
            style={{ marginTop: 18, padding: '10px 28px', background: GR, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            + New Patient
          </button>
        </div>
      )}

      {/* Session info */}
      <div style={{ marginTop: 20, padding: 10, background: CARD, border: `1px solid ${BD}`, borderRadius: 8, fontSize: 11, color: MT, display: 'flex', gap: 16 }}>
        <span>Village: {_v ?? 'health'}</span>
        <span>Role: {_r ?? 'doctor'}</span>
        <span>Session timer: {fmt(t)}</span>
      </div>
    </div>
  )
}
