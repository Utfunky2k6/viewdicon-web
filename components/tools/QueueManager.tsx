'use client'
import React, { useState, useEffect } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Patient { id: number; name: string; phone: string; arrival: string; waitMin: number; category: 'ROUTINE' | 'URGENT' | 'EMERGENCY' }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882'
const GR = '#2e7d32', RD = '#b71c1c', AM = '#e65100'

const INITIAL: Patient[] = [
  { id: 1, name: 'Amina Bello',       phone: '+234 802 111 2222', arrival: '08:05', waitMin: 42, category: 'ROUTINE'   },
  { id: 2, name: 'Kwame Asante',      phone: '+234 803 333 4444', arrival: '08:18', waitMin: 29, category: 'URGENT'    },
  { id: 3, name: 'Fatima Al-Hassan',  phone: '+234 804 555 6666', arrival: '08:31', waitMin: 16, category: 'EMERGENCY' },
  { id: 4, name: 'Tunde Adesanya',    phone: '+234 805 777 8888', arrival: '08:40', waitMin: 7,  category: 'ROUTINE'   },
  { id: 5, name: 'Adaeze Nwosu',      phone: '+234 806 999 0000', arrival: '08:47', waitMin: 4,  category: 'URGENT'    },
  { id: 6, name: 'Babajide Okafor',   phone: '+234 807 111 3333', arrival: '08:52', waitMin: 2,  category: 'ROUTINE'   },
  { id: 7, name: 'Chukwu Eze',        phone: '+234 808 444 5555', arrival: '08:55', waitMin: 1,  category: 'ROUTINE'   },
]

export default function QueueManager({ villageId: _v, roleKey: _r }: ToolProps) {
  const [queue, setQueue] = useState<Patient[]>(INITIAL)
  const [serving, setServing] = useState(12)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newReason, setNewReason] = useState('')
  const [newPriority, setNewPriority] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY'>('ROUTINE')
  const [flash, setFlash] = useState(false)
  const [nextId, setNextId] = useState(100)

  useEffect(() => {
    const id = setInterval(() => {
      setQueue(q => q.map(p => ({ ...p, waitMin: p.waitMin + 1 })))
    }, 60000)
    return () => clearInterval(id)
  }, [])

  const callNext = () => {
    if (queue.length === 0) return
    setFlash(true)
    setTimeout(() => {
      setServing(s => s + 1)
      setQueue(q => q.slice(1))
      setFlash(false)
    }, 600)
  }

  const addToQueue = () => {
    if (!newName) return
    const p: Patient = {
      id: nextId,
      name: newName,
      phone: newPhone,
      arrival: new Date().toTimeString().slice(0, 5),
      waitMin: 0,
      category: newPriority,
    }
    setQueue(q =>
      newPriority === 'EMERGENCY'
        ? [p, ...q]
        : newPriority === 'URGENT'
          ? [q[0], p, ...q.slice(1)].filter(Boolean) as Patient[]
          : [...q, p]
    )
    setNextId(n => n + 1)
    setNewName(''); setNewPhone(''); setNewReason('')
  }

  const catColor = (c: string) => c === 'EMERGENCY' ? RD : c === 'URGENT' ? AM : '#1a5c1e'
  const catText  = (c: string) => c === 'EMERGENCY' ? '#ffcdd2' : c === 'URGENT' ? '#ffe0b2' : '#a5d6a7'

  const inp = (v: string, s: (x: string) => void, ph: string) => (
    <input
      value={v} onChange={e => s(e.target.value)} placeholder={ph}
      style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, width: '100%', boxSizing: 'border-box' }}
    />
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>🏥 Queue Manager</h2>

      {/* NOW SERVING */}
      <div style={{
        background: CARD, border: `1px solid ${BD}`, borderRadius: 14, padding: '20px 24px',
        marginBottom: 14, textAlign: 'center',
        boxShadow: flash ? `0 0 24px ${GR}66` : 'none', transition: 'box-shadow 0.3s'
      }}>
        <div style={{ fontSize: 12, color: MT, fontWeight: 700, letterSpacing: 2 }}>NOW SERVING</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#4caf50', fontFamily: 'monospace', lineHeight: 1.1 }}>
          #{String(serving).padStart(3, '0')}
        </div>
        <div style={{ fontSize: 13, color: MT }}>
          <span style={{ background: '#1a3a1e', padding: '3px 12px', borderRadius: 20 }}>
            Waiting: {queue.length} patient{queue.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ fontSize: 12, color: MT, marginTop: 8 }}>⏱ Avg wait: 18 min</div>
      </div>

      <button
        onClick={callNext}
        disabled={queue.length === 0}
        style={{ width: '100%', padding: 13, background: queue.length === 0 ? '#1a2e1b' : GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: queue.length === 0 ? 'default' : 'pointer', marginBottom: 16, opacity: queue.length === 0 ? 0.5 : 1 }}
      >
        📣 Call Next Patient
      </button>

      {/* Queue List */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700, display: 'flex', gap: 8 }}>
          <span style={{ width: 28 }}>#</span>
          <span style={{ flex: 1 }}>PATIENT</span>
          <span style={{ width: 70 }}>ARRIVAL</span>
          <span style={{ width: 55 }}>WAIT</span>
          <span style={{ width: 82 }}>CATEGORY</span>
        </div>
        {queue.length === 0
          ? <div style={{ padding: 20, textAlign: 'center', color: MT, fontSize: 13 }}>Queue is empty</div>
          : queue.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderBottom: i < queue.length - 1 ? `1px solid ${BD}` : 'none',
              background: p.category === 'EMERGENCY' ? '#1a0505' : i === 0 ? '#0a1e0a' : 'transparent',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#1e3a20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: MT }}>{p.phone}</div>
              </div>
              <div style={{ width: 70, fontSize: 12, color: MT }}>{p.arrival}</div>
              <div style={{ width: 55, fontSize: 12, color: p.waitMin > 30 ? '#ef9a9a' : MT }}>{p.waitMin}m</div>
              <div style={{
                width: 82, background: catColor(p.category), color: catText(p.category),
                padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, textAlign: 'center'
              }}>
                {p.category}
              </div>
            </div>
          ))
        }
      </div>

      {/* Add to Queue */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 13, color: MT, fontWeight: 700, marginBottom: 12 }}>ADD TO QUEUE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {inp(newName, setNewName, 'Patient name')}
          {inp(newPhone, setNewPhone, 'Phone number')}
          {inp(newReason, setNewReason, 'Reason for visit')}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['ROUTINE', 'URGENT', 'EMERGENCY'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setNewPriority(cat)}
                style={{
                  flex: 1, padding: '7px 4px', border: `1px solid ${newPriority === cat ? catColor(cat) : BD}`,
                  borderRadius: 8, background: newPriority === cat ? catColor(cat) : 'transparent',
                  color: newPriority === cat ? catText(cat) : MT, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                }}
              >{cat}</button>
            ))}
          </div>
          <button
            onClick={addToQueue}
            style={{ padding: 11, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            + Add Patient
          </button>
        </div>
      </div>
    </div>
  )
}
