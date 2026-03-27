'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

const TYPES = ['System', 'Threshold', 'Reminder', 'Emergency']
const SEVERITIES = ['INFO', 'WARN', 'CRITICAL']
const SEV_COLORS: Record<string, string> = { INFO: '#3b82f6', WARN: '#fbbf24', CRITICAL: '#ef4444' }

interface Alert { type: string; severity: string; message: string; time: string; active: boolean }

const INITIAL: Alert[] = [
  { type: 'Threshold', severity: 'WARN',     message: 'Palm Oil stock below reorder threshold (3 drums)', time: '1h ago',  active: true },
  { type: 'System',    severity: 'INFO',     message: 'Daily settlement completed successfully',             time: '6h ago',  active: false },
  { type: 'Emergency', severity: 'CRITICAL', message: 'Blood-Call received from family circle',              time: '2d ago',  active: false },
  { type: 'Reminder',  severity: 'INFO',     message: 'Ajo collection due this Saturday',                   time: '12h ago', active: true },
]

export default function AlertSystem() {
  const [alerts, setAlerts] = React.useState<Alert[]>(INITIAL)
  const [showCreate, setShowCreate] = React.useState(false)
  const [form, setForm] = React.useState({ type: 'System', severity: 'INFO', message: '', threshold: '', via: 'Dashboard' })
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const createAlert = () => {
    if (!form.message) return
    setAlerts(p => [{ type: form.type, severity: form.severity, message: form.message, time: 'now', active: true }, ...p])
    setForm({ type: 'System', severity: 'INFO', message: '', threshold: '', via: 'Dashboard' })
    setShowCreate(false)
    showToast('✓ Alert created')
  }

  const active = alerts.filter(a => a.active)
  const history = alerts.filter(a => !a.active)

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {showCreate && (
        <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Create Alert</div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 10, color: C.sub, fontWeight: 700, display: 'block', marginBottom: 4 }}>Type</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', background: form.type === t ? C.green : C.muted, color: form.type === t ? '#fff' : C.sub }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 10, color: C.sub, fontWeight: 700, display: 'block', marginBottom: 4 }}>Severity</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {SEVERITIES.map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, severity: s }))} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${form.severity === s ? SEV_COLORS[s] : C.border}`, background: form.severity === s ? `${SEV_COLORS[s]}20` : C.muted, color: form.severity === s ? SEV_COLORS[s] : C.sub }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <input value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Alert message..." style={{ width: '100%', background: '#060d07', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createAlert} style={{ flex: 1, padding: 10, borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Create</button>
            <button onClick={() => setShowCreate(false)} style={{ padding: '10px 14px', borderRadius: 8, background: C.muted, color: C.text, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <button onClick={() => setShowCreate(s => !s)} style={{ width: '100%', padding: 11, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', marginBottom: 14 }}>
        + Create Alert
      </button>

      {active.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>🔴 Active Alerts</div>
          {active.map((a, i) => {
            const sc = SEV_COLORS[a.severity]
            return (
              <div key={i} style={{ background: `${sc}0d`, border: `1px solid ${sc}40`, borderRadius: 12, padding: '10px 14px', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: sc, background: `${sc}18`, border: `1px solid ${sc}40`, borderRadius: 99, padding: '3px 8px', whiteSpace: 'nowrap', marginTop: 2 }}>{a.severity}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{a.message}</div>
                  <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{a.type} · {a.time}</div>
                </div>
                <button onClick={() => setAlerts(prev => prev.map((al, j) => j === i ? { ...al, active: false } : al))} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: C.muted, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', whiteSpace: 'nowrap' }}>Dismiss</button>
              </div>
            )
          })}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>History</div>
          {history.map((a, i) => (
            <div key={i} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 14px', marginBottom: 6, opacity: 0.6, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: SEV_COLORS[a.severity] }}>{a.severity}</span>
              <div style={{ flex: 1, fontSize: 11, color: C.text }}>{a.message}</div>
              <div style={{ fontSize: 9, color: C.sub }}>{a.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
