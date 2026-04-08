'use client'
import { useState } from 'react'

const SOURCES = [
  { id: 1, alias: 'Insider-Lagos', type: 'Government', reliability: 'High', contacts: 3, lastContact: '2026-04-03', notes: 'Budget allocation leaks confirmed twice' },
  { id: 2, alias: 'MarketWatch-Accra', type: 'Business', reliability: 'Medium', contacts: 7, lastContact: '2026-03-28', notes: 'Commodity pricing intel' },
  { id: 3, alias: 'DocWhisper', type: 'Healthcare', reliability: 'High', contacts: 2, lastContact: '2026-04-01', notes: 'Hospital funding discrepancy reports' },
  { id: 4, alias: 'TechLeaks-Nairobi', type: 'Technology', reliability: 'Low', contacts: 1, lastContact: '2026-03-15', notes: 'Unverified startup acquisition rumor' },
  { id: 5, alias: 'AgriSource', type: 'Agriculture', reliability: 'High', contacts: 5, lastContact: '2026-04-04', notes: 'Crop yield data, verified by ministry' },
]

const reliabilityColor = (r: string) => r === 'High' ? '#1a7c3e' : r === 'Medium' ? '#d97706' : '#dc2626'

export default function SourceLog() {
  const [sources, setSources] = useState(SOURCES)
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>🕵️ Source Log</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1a7c3e' }}>{sources.length}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Total Sources</div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1a7c3e' }}>{sources.filter(s => s.reliability === 'High').length}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>High Trust</div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{sources.reduce((a, s) => a + s.contacts, 0)}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Total Contacts</div>
        </div>
      </div>

      {sources.map(s => (
        <div key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{s.alias}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{s.type} — {s.contacts} contacts — Last: {s.lastContact}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#fff', background: reliabilityColor(s.reliability) }}>{s.reliability}</span>
          </div>
          {expanded === s.id && (
            <div style={{ marginTop: 10, padding: 10, background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#374151' }}>
              <strong>Notes:</strong> {s.notes}
              <div style={{ marginTop: 8 }}>
                <button onClick={e => { e.stopPropagation(); setSources(ss => ss.filter(x => x.id !== s.id)) }} style={{ padding: '5px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#dc2626', color: '#fff' }}>Delete Source</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
