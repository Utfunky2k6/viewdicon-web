'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Zone { id: string; name: string; color: string; coverage: number; members: number; status: 'ACTIVE' | 'PARTIAL' | 'INACTIVE'; x: number; y: number; w: number; h: number }
interface Assignment { member: string; zone: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32'

const INIT_ZONES: Zone[] = [
  { id: 'z1', name: 'Zone A — Market Centre',     color: '#2e7d32', coverage: 94, members: 487, status: 'ACTIVE',   x: 10, y: 15, w: 35, h: 40 },
  { id: 'z2', name: 'Zone B — Residential North',  color: '#1565c0', coverage: 71, members: 312, status: 'PARTIAL',  x: 52, y: 10, w: 40, h: 35 },
  { id: 'z3', name: 'Zone C — Industrial East',    color: '#6a1c8a', coverage: 55, members: 148, status: 'ACTIVE',   x: 30, y: 60, w: 40, h: 30 },
]

const INIT_ASSIGNMENTS: Assignment[] = [
  { member: 'Elder Adewale Fashola',   zone: 'Zone A — Market Centre'     },
  { member: 'Amina Bello Musa',        zone: 'Zone B — Residential North'  },
  { member: 'Kwame Asante-Osei',       zone: 'Zone C — Industrial East'    },
  { member: 'Chukwu Eze Nwosu',        zone: 'Zone A — Market Centre'     },
]

export default function TerritoryMap({ villageId: _v, roleKey: _r }: ToolProps) {
  const [zones, setZones] = useState<Zone[]>(INIT_ZONES)
  const [assignments] = useState<Assignment[]>(INIT_ASSIGNMENTS)
  const [heatMap, setHeatMap] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#e65100')
  const [newDesc, setNewDesc] = useState('')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const addZone = () => {
    if (!newName) return
    const z: Zone = {
      id: `z${Date.now()}`,
      name: newName,
      color: newColor,
      coverage: Math.floor(Math.random() * 50) + 30,
      members: Math.floor(Math.random() * 200) + 50,
      status: 'PARTIAL',
      x: Math.floor(Math.random() * 50) + 5,
      y: Math.floor(Math.random() * 50) + 5,
      w: 25,
      h: 20,
    }
    setZones(zs => [...zs, z])
    setNewName(''); setNewDesc('')
    setShowAdd(false)
  }

  const statusColor = (s: string) => s === 'ACTIVE' ? GR : s === 'PARTIAL' ? '#e65100' : '#546e7a'

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>🗺 Territory Map</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setHeatMap(v => !v)}
            style={{ padding: '6px 12px', background: heatMap ? '#1a3a1e' : CARD, border: `1px solid ${BD}`, borderRadius: 8, color: heatMap ? '#a5d6a7' : MT, fontSize: 12, cursor: 'pointer' }}
          >
            {heatMap ? '🔥 Heat' : '🗺 Normal'}
          </button>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{ padding: '6px 12px', background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
          >
            + Zone
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div style={{ background: '#040c05', border: `1px solid ${BD}`, borderRadius: 12, height: 240, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        {/* Grid lines */}
        {[0,20,40,60,80].map(x => (
          <div key={`vl${x}`} style={{ position: 'absolute', left: `${x}%`, top: 0, bottom: 0, borderLeft: '1px solid #0f1e11', pointerEvents: 'none' }} />
        ))}
        {[0,25,50,75].map(y => (
          <div key={`hl${y}`} style={{ position: 'absolute', top: `${y}%`, left: 0, right: 0, borderTop: '1px solid #0f1e11', pointerEvents: 'none' }} />
        ))}

        {/* Zone overlays */}
        {zones.map(z => (
          <div
            key={z.id}
            onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
            style={{
              position: 'absolute',
              left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%`,
              background: z.color + (heatMap ? Math.round(z.coverage * 2).toString(16).padStart(2, '0') : '33'),
              border: `2px solid ${z.color}${selectedZone === z.id ? 'ff' : '88'}`,
              borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s',
            }}
          >
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 700, textShadow: '0 1px 3px #000', textAlign: 'center', padding: '0 4px' }}>
              {z.name.split('—')[0].trim()}
            </span>
          </div>
        ))}

        {/* Markers */}
        <div style={{ position: 'absolute', left: '28%', top: '35%', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #000' }} />
        <div style={{ position: 'absolute', left: '62%', top: '25%', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #000' }} />
        <div style={{ position: 'absolute', left: '48%', top: '68%', width: 10, height: 10, borderRadius: '50%', background: '#fff', border: '2px solid #000' }} />

        <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 10, color: MT }}>
          {heatMap ? '🔥 Density view' : '📌 Coverage view'}
        </div>
      </div>

      {/* Zone List */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>ZONES</div>
        {zones.map((z, i) => (
          <div
            key={z.id}
            onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
            style={{ padding: '11px 14px', borderBottom: i < zones.length - 1 ? `1px solid ${BD}` : 'none', cursor: 'pointer', background: selectedZone === z.id ? '#0a1e0a' : 'transparent' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: z.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{z.name}</div>
                  <div style={{ fontSize: 11, color: MT }}>{z.members} members</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#a5d6a7' }}>{z.coverage}%</div>
                <span style={{ fontSize: 10, background: statusColor(z.status), color: '#fff', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{z.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Form */}
      {showAdd && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>ADD NEW ZONE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Zone name"
              style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }} />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description"
              style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13 }} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: MT }}>Zone color:</span>
              {['#2e7d32', '#1565c0', '#6a1c8a', '#e65100', '#c62828'].map(c => (
                <div key={c} onClick={() => setNewColor(c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: newColor === c ? '2px solid #fff' : '2px solid transparent' }} />
              ))}
            </div>
            <button onClick={addZone} style={{ padding: 11, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              + Add Zone
            </button>
          </div>
        </div>
      )}

      {/* Assignment Table */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>TEAM ASSIGNMENTS</div>
        {assignments.map((a, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < assignments.length - 1 ? `1px solid ${BD}` : 'none', fontSize: 13 }}>
            <span>👤 {a.member}</span>
            <span style={{ color: MT, fontSize: 12 }}>{a.zone.split('—')[1]?.trim() ?? a.zone}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
