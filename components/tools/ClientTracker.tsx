'use client'
import * as React from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const C = {
  bg: '#060d07', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e', accent: '#4ade80',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)', red: '#f87171',
}

type Status = 'ACTIVE' | 'INACTIVE' | 'PROSPECT'
interface Client {
  id: string; name: string; phone: string; village: string
  status: Status; lastContact: string; totalSpend: number
  history: { date: string; note: string; amount: number }[]
}

const INIT_CLIENTS: Client[] = [
  { id: 'c1', name: 'Amara Diallo',   phone: '+221 77 123 4567', village: 'Commerce',   status: 'ACTIVE',   lastContact: '2026-04-03', totalSpend: 12500, history: [{ date: '2026-04-03', note: 'Invoice INV-0048', amount: 3200 }, { date: '2026-03-15', note: 'Service contract', amount: 9300 }] },
  { id: 'c2', name: 'Bisi Okafor',    phone: '+234 81 456 7890', village: 'Technology', status: 'ACTIVE',   lastContact: '2026-04-01', totalSpend: 4800,  history: [{ date: '2026-04-01', note: 'Branding project', amount: 4800 }] },
  { id: 'c3', name: 'Fatou Camara',   phone: '+224 62 789 0123', village: 'Fashion',    status: 'ACTIVE',   lastContact: '2026-03-28', totalSpend: 23400, history: [{ date: '2026-03-28', note: 'Clothing design x5', amount: 8500 }, { date: '2026-02-10', note: 'Bulk order', amount: 14900 }] },
  { id: 'c4', name: 'Kofi Mensah',    phone: '+233 24 234 5678', village: 'Commerce',   status: 'INACTIVE', lastContact: '2026-02-20', totalSpend: 1200,  history: [{ date: '2026-02-20', note: 'One-time purchase', amount: 1200 }] },
  { id: 'c5', name: 'Ngozi Adeyemi',  phone: '+234 90 345 6789', village: 'Agriculture',status: 'PROSPECT', lastContact: '2026-04-04', totalSpend: 0,     history: [] },
  { id: 'c6', name: 'Sule Ibrahim',   phone: '+234 70 456 7890', village: 'Logistics',  status: 'ACTIVE',   lastContact: '2026-04-02', totalSpend: 7600,  history: [{ date: '2026-04-02', note: 'Transport x4', amount: 7600 }] },
  { id: 'c7', name: 'Ama Asante',     phone: '+233 55 567 8901', village: 'Health',     status: 'PROSPECT', lastContact: '2026-03-30', totalSpend: 0,     history: [] },
  { id: 'c8', name: 'Emeka Okafor',   phone: '+234 80 678 9012', village: 'Commerce',   status: 'INACTIVE', lastContact: '2026-01-15', totalSpend: 3300,  history: [{ date: '2026-01-15', note: 'Invoice paid', amount: 3300 }] },
]

const STATUS_COLOR: Record<Status, string> = { ACTIVE: '#4ade80', INACTIVE: '#6b7280', PROSPECT: '#fbbf24' }

export default function ClientTracker({ villageId }: ToolProps) {
  const key = `clients_${villageId || 'default'}`
  const [loading, setLoading] = React.useState(true)
  const [clients, setClients] = React.useState<Client[]>(INIT_CLIENTS)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | Status>('ALL')
  const [showAdd, setShowAdd] = React.useState(false)
  const [selected, setSelected] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ name: '', phone: '', village: '', status: 'PROSPECT' as Status })
  const [toast, setToast] = React.useState('')

  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (stored) { try { setClients(JSON.parse(stored)) } catch {} }
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [key])

  const persist = (updated: Client[]) => {
    setClients(updated)
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(updated))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const addClient = () => {
    if (!form.name) return
    const newClient: Client = {
      id: `c${Date.now()}`, name: form.name, phone: form.phone, village: form.village || 'Unknown',
      status: form.status, lastContact: new Date().toISOString().slice(0, 10), totalSpend: 0, history: []
    }
    persist([newClient, ...clients])
    setForm({ name: '', phone: '', village: '', status: 'PROSPECT' })
    setShowAdd(false)
    showToast('Client added')
  }

  const filtered = clients.filter(c =>
    (statusFilter === 'ALL' || c.status === statusFilter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedClient = clients.find(c => c.id === selected)

  if (loading) return (
    <div>{[...Array(3)].map((_, i) => <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 10, height: 72 }} />)}</div>
  )

  if (selectedClient) return (
    <div style={{ color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      <button onClick={() => setSelected(null)} style={{ fontSize: 12, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>← Back to clients</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>
          {selectedClient.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedClient.name}</div>
          <div style={{ fontSize: 11, color: C.sub }}>{selectedClient.phone} · {selectedClient.village}</div>
          <span style={{ fontSize: 9, fontWeight: 700, color: STATUS_COLOR[selectedClient.status], background: `${STATUS_COLOR[selectedClient.status]}18`, border: `1px solid ${STATUS_COLOR[selectedClient.status]}40`, borderRadius: 99, padding: '2px 8px', display: 'inline-block', marginTop: 4 }}>{selectedClient.status}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>₡{selectedClient.totalSpend.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>Total Spend</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.accent }}>{selectedClient.history.length}</div>
          <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>Transactions</div>
        </div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Transaction History</div>
      {selectedClient.history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: C.sub, fontSize: 12 }}>No transactions yet</div>
      ) : (
        selectedClient.history.map((h, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: C.text }}>{h.note}</div>
              <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{h.date}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.accent }}>₡{h.amount.toLocaleString()}</div>
          </div>
        ))
      )}
      <button onClick={() => showToast(`Message sent to ${selectedClient.name}`)} style={{ width: '100%', marginTop: 12, padding: 12, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
        Send Message
      </button>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}
    </div>
  )

  return (
    <div style={{ color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {/* Add form */}
      {showAdd && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>New Client</div>
          {(['name', 'phone', 'village'] as const).map(f => (
            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
              style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          ))}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {(['PROSPECT', 'ACTIVE', 'INACTIVE'] as Status[]).map(s => (
              <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))} style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${form.status === s ? STATUS_COLOR[s] : C.border}`, background: form.status === s ? `${STATUS_COLOR[s]}18` : C.muted, color: form.status === s ? STATUS_COLOR[s] : C.sub }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addClient} style={{ flex: 1, padding: 10, borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Add Client</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '10px 14px', borderRadius: 8, background: C.muted, color: C.text, fontWeight: 700, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ flex: 1, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none' }} />
        <button onClick={() => setShowAdd(s => !s)} style={{ padding: '9px 14px', borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>+ Add</button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['ALL', 'ACTIVE', 'INACTIVE', 'PROSPECT'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ flex: 1, padding: '5px 0', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', background: statusFilter === s ? C.green : C.muted, color: statusFilter === s ? '#fff' : C.sub }}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.sub }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>No clients found</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Add your first client above</div>
        </div>
      ) : filtered.map(cl => (
        <div key={cl.id} onClick={() => setSelected(cl.id)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 10, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {cl.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{cl.name}</div>
              <div style={{ fontSize: 9, color: C.sub }}>{cl.phone} · {cl.village}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>₡{cl.totalSpend.toLocaleString()}</div>
              <span style={{ fontSize: 8, fontWeight: 700, color: STATUS_COLOR[cl.status], background: `${STATUS_COLOR[cl.status]}18`, border: `1px solid ${STATUS_COLOR[cl.status]}40`, borderRadius: 99, padding: '2px 7px', display: 'inline-block', marginTop: 2 }}>{cl.status}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ fontSize: 9, color: C.sub, flex: 1 }}>Last contact: {cl.lastContact}</div>
            <button onClick={e => { e.stopPropagation(); showToast(`Message sent to ${cl.name}`) }} style={{ fontSize: 9, padding: '4px 10px', borderRadius: 99, background: 'rgba(26,124,62,.12)', border: '1px solid rgba(26,124,62,.3)', color: C.accent, cursor: 'pointer', fontWeight: 700 }}>
              Message
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
