'use client'
import { useState } from 'react'

const CONTACTS = [
  { id: 1, name: 'Adaeze Okonkwo', outlet: 'NaijaReport', role: 'Editor-in-Chief', email: 'adaeze@naijareport.ng', beat: 'Politics', lastPitch: '2026-04-01' },
  { id: 2, name: 'Kwame Boateng', outlet: 'Ghana Times', role: 'Tech Correspondent', email: 'kwame@ghanatimes.gh', beat: 'Technology', lastPitch: '2026-03-22' },
  { id: 3, name: 'Fatima Bello', outlet: 'Al Jazeera Africa', role: 'Producer', email: 'f.bello@aljazeera.com', beat: 'Culture', lastPitch: '2026-03-10' },
  { id: 4, name: 'Jean-Paul Mbeki', outlet: 'Jeune Afrique', role: 'Senior Reporter', email: 'jp@jeuneafrique.com', beat: 'Business', lastPitch: '2026-02-28' },
  { id: 5, name: 'Amina Traore', outlet: 'Africa24 TV', role: 'Anchor', email: 'amina@africa24.tv', beat: 'General', lastPitch: '' },
]

const beatColor = (b: string) => b === 'Politics' ? '#7c3aed' : b === 'Technology' ? '#0891b2' : b === 'Culture' ? '#db2777' : b === 'Business' ? '#d97706' : '#6b7280'

export default function MediaList() {
  const [contacts, setContacts] = useState(CONTACTS)
  const [search, setSearch] = useState('')

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.outlet.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📇 Media Contact Database</h2>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts or outlets..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }} />

      {filtered.map(c => (
        <div key={c.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{c.role} — {c.outlet}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#fff', background: beatColor(c.beat) }}>{c.beat}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{c.email}{c.lastPitch ? ` — Last pitch: ${c.lastPitch}` : ''}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#1a7c3e', color: '#fff' }}>Send Pitch</button>
            <button onClick={() => setContacts(cs => cs.filter(x => x.id !== c.id))} style={{ padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1.5px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#dc2626' }}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  )
}
