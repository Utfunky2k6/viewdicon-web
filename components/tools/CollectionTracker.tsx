'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type CollectionStatus = 'SCHEDULED' | 'ENROUTE' | 'COLLECTED'
type Grade = 'A' | 'B' | 'C'

interface Collection {
  id: string; farmer: string; location: string; commodity: string; expectedQty: number; unit: string; time: string; status: CollectionStatus; actualQty?: number; grade?: Grade
}

const INIT_COLLECTIONS: Collection[] = [
  { id: 'col1', farmer: 'Alhaji Musa Garba', location: 'Kaduna South Farm', commodity: 'Tomatoes', expectedQty: 500, unit: 'kg', time: '07:00', status: 'COLLECTED', actualQty: 485, grade: 'A' },
  { id: 'col2', farmer: 'Mama Chidinma', location: 'Abia State, Aba', commodity: 'Cassava', expectedQty: 1200, unit: 'kg', time: '09:00', status: 'COLLECTED', actualQty: 1180, grade: 'B' },
  { id: 'col3', farmer: 'Ibrahim Tanko', location: 'Katsina Rural Zone', commodity: 'Groundnuts', expectedQty: 800, unit: 'kg', time: '11:00', status: 'ENROUTE', actualQty: undefined, grade: undefined },
  { id: 'col4', farmer: 'Adaeze Nwosu', location: 'Enugu North', commodity: 'Yam Tubers', expectedQty: 2000, unit: 'kg', time: '13:30', status: 'SCHEDULED', actualQty: undefined, grade: undefined },
]

const MARKET_PRICES: Record<string, number> = { Tomatoes: 320, Cassava: 180, Groundnuts: 850, 'Yam Tubers': 420 }
const statusColor: Record<CollectionStatus, string> = { SCHEDULED: muted, ENROUTE: amber, COLLECTED: green }
const gradeColor: Record<Grade, string> = { A: green, B: amber, C: red }

export default function CollectionTracker({ villageId, roleKey }: ToolProps) {
  const [collections, setCollections] = useState<Collection[]>(INIT_COLLECTIONS)
  const [logId, setLogId] = useState<string | null>(null)
  const [logQty, setLogQty] = useState('')
  const [logGrade, setLogGrade] = useState<Grade>('A')
  const [logNotes, setLogNotes] = useState('')
  const [signed, setSigned] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const collected = collections.filter(c => c.status === 'COLLECTED')
  const summaryMap: Record<string, number> = {}
  collected.forEach(c => { summaryMap[c.commodity] = (summaryMap[c.commodity] || 0) + (c.actualQty || 0) })

  const totalPayout = collected.reduce((s, c) => s + (c.actualQty || 0) * (MARKET_PRICES[c.commodity] || 0), 0)

  const logCollection = () => {
    if (!logId || !logQty) return
    setCollections(prev => prev.map(c => c.id !== logId ? c : { ...c, actualQty: Number(logQty), grade: logGrade, status: 'COLLECTED' }))
    setLogId(null); setLogQty(''); setLogNotes(''); setSigned(false)
    flash('Collection logged! Payment calculated.')
  }

  const markEnroute = (id: string) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, status: 'ENROUTE' } : c))
    flash('Status updated: En Route')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Collection Tracker</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>Farm-gate pickups — March 26, 2026</div>

      {/* Map overview placeholder */}
      <div style={{ background: '#0a150c', border: `1px solid ${border}`, borderRadius: 12, height: 100, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {collections.map((c, i) => {
          const positions = [{ x: 20, y: 35 }, { x: 60, y: 60 }, { x: 40, y: 75 }, { x: 75, y: 40 }]
          const pos = positions[i] || { x: 50, y: 50 }
          return (
            <div key={c.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, width: 18, height: 18, borderRadius: 9, background: statusColor[c.status], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#000', transform: 'translate(-50%,-50%)', border: '1px solid #000' }}>
              {i + 1}
            </div>
          )
        })}
        <span style={{ fontSize: 11, color: muted }}>Collection Zone Map</span>
      </div>

      {/* Today's collections */}
      {collections.map(c => (
        <div key={c.id} style={{ background: card, border: `2px solid ${c.status === 'COLLECTED' ? green + '55' : border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{c.farmer}</div>
              <div style={{ fontSize: 11, color: muted }}>{c.location} · {c.time}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[c.status], background: statusColor[c.status] + '22', padding: '3px 8px', borderRadius: 8 }}>{c.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: gold }}>{c.commodity}</span>
            <span style={{ color: muted }}>Expected: {c.expectedQty.toLocaleString()} {c.unit}</span>
            {c.actualQty !== undefined && <span style={{ color: green }}>Actual: {c.actualQty.toLocaleString()} {c.unit}</span>}
            {c.grade && <span style={{ color: gradeColor[c.grade], fontWeight: 700 }}>Grade {c.grade}</span>}
          </div>
          {c.status === 'COLLECTED' && (
            <div style={{ fontSize: 12, color: green, marginTop: 4 }}>
              Payment due: ₡{((c.actualQty || 0) * (MARKET_PRICES[c.commodity] || 0)).toLocaleString()}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {c.status === 'SCHEDULED' && <button onClick={() => markEnroute(c.id)} style={btn(amber)}>Mark En Route</button>}
            {c.status === 'ENROUTE' && <button onClick={() => setLogId(c.id)} style={btn(green)}>Log Collection</button>}
          </div>
        </div>
      ))}

      {/* Log collection form */}
      {logId && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Log Collection — {collections.find(c => c.id === logId)?.farmer}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input placeholder="Actual quantity" type="number" value={logQty} onChange={e => setLogQty(e.target.value)} style={inp} />
            <select value={logGrade} onChange={e => setLogGrade(e.target.value as Grade)} style={inp}>
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Below Std)</option>
            </select>
            <input placeholder="Notes (optional)" value={logNotes} onChange={e => setLogNotes(e.target.value)} style={{ ...inp, gridColumn: 'span 2' }} />
          </div>
          <div style={{ border: `2px dashed ${border}`, borderRadius: 8, padding: '14px 0', textAlign: 'center', marginBottom: 10, cursor: 'pointer' }}
            onClick={() => setSigned(true)}>
            <div style={{ color: signed ? green : muted, fontSize: 13 }}>{signed ? '✓ Signature captured' : '✍ Tap to capture farmer signature'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={logCollection} style={btn(green)}>Submit Collection</button>
            <button onClick={() => setLogId(null)} style={{ ...btn(muted), background: 'none', color: muted, border: `1px solid ${border}` }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Weekly summary */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Weekly Summary</div>
        {Object.entries(summaryMap).map(([commodity, qty]) => (
          <div key={commodity} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 13 }}>
            <span>{commodity}</span>
            <span style={{ color: gold }}>{qty.toLocaleString()} kg</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', fontWeight: 700 }}>
          <span style={{ color: muted }}>Total Farmer Payments Due</span>
          <span style={{ color: green, fontSize: 16 }}>₡{totalPayout.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
