'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

interface Client { name: string; phone: string; village: string; lastContact: string; sessions: number; value: number }

const INITIAL: Client[] = [
  { name: 'Amara Diallo',   phone: '+221 77 123 4567', village: 'Commerce',   lastContact: '2026-03-24', sessions: 7,  value: 12500 },
  { name: 'Bisi Okafor',    phone: '+234 81 456 7890', village: 'Technology', lastContact: '2026-03-20', sessions: 4,  value: 4800  },
  { name: 'Fatou Camara',   phone: '+224 62 789 0123', village: 'Fashion',    lastContact: '2026-03-18', sessions: 12, value: 23400 },
  { name: 'Kofi Mensah',    phone: '+233 24 234 5678', village: 'Commerce',   lastContact: '2026-03-15', sessions: 2,  value: 1200  },
]

export default function ClientTracker() {
  const [clients, setClients] = React.useState<Client[]>(INITIAL)
  const [showAdd, setShowAdd] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', phone: '', village: '', afroid: '' })
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const addClient = () => {
    if (!form.name) return
    setClients(p => [{ name: form.name, phone: form.phone, village: form.village || 'Unknown', lastContact: new Date().toISOString().slice(0, 10), sessions: 0, value: 0 }, ...p])
    setForm({ name: '', phone: '', village: '', afroid: '' })
    setShowAdd(false)
    showToast('✓ Client added')
  }

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {showAdd && (
        <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Add New Client</div>
          {['name', 'phone', 'village', 'afroid'].map(f => (
            <input key={f} placeholder={f === 'afroid' ? 'AfroID (optional)' : f.charAt(0).toUpperCase() + f.slice(1)} value={(form as Record<string,string>)[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
              style={{ width: '100%', background: '#060d07', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
            />
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addClient} style={{ flex: 1, padding: 10, borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Add Client</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '10px 14px', borderRadius: 8, background: C.muted, color: C.text, fontWeight: 700, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <button onClick={() => setShowAdd(s => !s)} style={{ width: '100%', padding: 11, borderRadius: 10, background: showAdd ? C.muted : C.green, color: showAdd ? C.text : '#fff', fontWeight: 700, fontSize: 12, border: `1px solid ${showAdd ? C.border : 'transparent'}`, cursor: 'pointer', marginBottom: 14 }}>
        {showAdd ? 'Cancel' : '+ Add Client'}
      </button>

      {clients.map((cl, i) => (
        <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {cl.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cl.name}</div>
              <div style={{ fontSize: 10, color: C.sub }}>{cl.village} · Last: {cl.lastContact}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>₡{cl.value.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: C.sub }}>{cl.sessions} sessions</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Call via Seso', 'Invoice', 'Notes'].map(a => (
              <button key={a} onClick={() => showToast(`✓ ${a}: ${cl.name}`)} style={{ fontSize: 10, padding: '5px 10px', borderRadius: 99, background: a === 'Invoice' ? 'rgba(26,124,62,.15)' : C.muted, border: `1px solid ${a === 'Invoice' ? 'rgba(26,124,62,.3)' : C.border}`, color: a === 'Invoice' ? '#4ade80' : C.sub, cursor: 'pointer', fontWeight: 700 }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
