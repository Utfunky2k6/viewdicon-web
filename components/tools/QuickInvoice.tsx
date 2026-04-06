'use client'
import * as React from 'react'

const C = {
  bg: '#060d07', card: '#0f1e11', border: '#1e3a20',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

interface Invoice {
  id: string
  client: string
  service: string
  amount: string
  due: string
  notes: string
  date: string
}


export default function QuickInvoice({ villageId, roleKey }: { villageId: string; roleKey: string }) {
  const [client, setClient] = React.useState('')
  const [service, setService] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [due, setDue] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [preview, setPreview] = React.useState(false)
  const [toast, setToast] = React.useState('')
  const [invoices] = React.useState<Invoice[]>([])
  const invNum = `INV-${String(Math.floor(Math.random() * 9000) + 1000)}`

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const inp = (label: string, val: string, set: (v: string) => void, placeholder: string, type = 'text') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
      <input
        type={type}
        value={val}
        onChange={e => set(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  )

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#1a7c3e', color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {!preview ? (
        <div>
          {inp('Client Name', client, setClient, 'e.g. Amara Diallo')}
          {inp('Service / Product', service, setService, 'e.g. Web Design Package')}
          {inp('Amount (₡)', amount, setAmount, 'e.g. 2500')}
          {inp('Due Date', due, setDue, '', 'date')}
          {inp('Notes (optional)', notes, setNotes, 'e.g. 50% upfront required')}
          <button
            onClick={() => { if (client && service && amount) setPreview(true) }}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: C.green, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 16 }}
          >
            Generate Invoice →
          </button>

          {/* History */}
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Recent Invoices</div>
          {invoices.map(inv => (
            <div key={inv.id} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{inv.client}</div>
                <div style={{ fontSize: 10, color: C.sub }}>{inv.service} · {inv.date}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{inv.amount}</div>
                <div style={{ fontSize: 9, color: '#4ade80', textAlign: 'right' }}>{inv.id}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Invoice Preview */}
          <div style={{ background: 'linear-gradient(135deg, #0f1e11, #091608)', border: `1px solid ${C.green}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#4ade80' }}>INVOICE</div>
                <div style={{ fontSize: 10, color: C.sub }}>{invNum}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: C.sub }}>AfroID Stamp</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.gold }}>NG-YOR-••••-••••</div>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 2 }}>BILLED TO</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{client}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: C.sub }}>{service}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>₡{amount}</span>
              </div>
              {notes && <div style={{ fontSize: 10, color: C.sub, marginTop: 6 }}>{notes}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.sub }}>
              <span>Issued: {new Date().toLocaleDateString()}</span>
              <span>Due: {due || 'On receipt'}</span>
            </div>
            <div style={{ marginTop: 12, padding: '6px 10px', background: 'rgba(26,124,62,.1)', border: '1px solid rgba(26,124,62,.3)', borderRadius: 8, fontSize: 9, color: '#4ade80', textAlign: 'center', fontWeight: 700 }}>
              🌍 Viewdicon Verified · {villageId.toUpperCase()} VILLAGE
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => showToast('✓ Invoice sent via Seso Chat')}
              style={{ flex: 1, padding: '11px', borderRadius: 10, background: C.green, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Send to Client
            </button>
            <button
              onClick={() => setPreview(false)}
              style={{ padding: '11px 16px', borderRadius: 10, background: C.muted, color: C.text, fontSize: 12, fontWeight: 700, border: `1px solid ${C.border}`, cursor: 'pointer' }}
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
