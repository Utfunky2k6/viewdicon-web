'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

interface Entry { time: string; amount: number; note: string }

export default function DailyTargetTracker() {
  const [target, setTarget] = React.useState('5000')
  const [earned, setEarned] = React.useState(2300)
  const [streak] = React.useState(7)
  const [log, setLog] = React.useState<Entry[]>([
    { time: '09:12', amount: 1500, note: 'Morning invoice' },
    { time: '11:45', amount: 800,  note: 'Client payment' },
  ])
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const add = (amt: number) => {
    setEarned(e => e + amt)
    setLog(l => [{ time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }), amount: amt, note: 'Quick add' }, ...l])
    showToast(`+₡${amt.toLocaleString()} added`)
  }

  const pct = Math.min(100, Math.round((earned / Number(target || 1)) * 100))

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {/* Streak */}
      <div style={{ background: 'rgba(212,160,23,.08)', border: '1px solid rgba(212,160,23,.2)', borderRadius: 10, padding: '8px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>🔥</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{streak} day streak!</span>
        <span style={{ fontSize: 10, color: C.sub }}>Keep going!</span>
      </div>

      {/* Target */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Today's Target (₡)</label>
        <input
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.sub }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: pct >= 100 ? '#4ade80' : C.gold }}>₡{earned.toLocaleString()} / ₡{Number(target).toLocaleString()}</span>
        </div>
        <div style={{ height: 12, borderRadius: 99, background: C.muted, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#4ade80' : 'linear-gradient(90deg,#1a7c3e,#4ade80)', borderRadius: 99, transition: 'width .4s' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, fontWeight: 700, color: pct >= 100 ? '#4ade80' : C.gold }}>{pct}% achieved</div>
      </div>

      {/* Quick add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[500, 1000, 2000].map(amt => (
          <button
            key={amt}
            onClick={() => add(amt)}
            style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.3)', color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            +₡{amt.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Today', val: `₡${earned.toLocaleString()}` },
          { label: 'Yesterday', val: '₡3,800' },
          { label: 'Wk Avg', val: '₡3,200' },
        ].map(s => (
          <div key={s.label} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{s.val}</div>
            <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Activity Log</div>
      {log.map((e, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: C.muted, marginBottom: 6 }}>
          <div>
            <span style={{ fontSize: 11, color: C.text }}>{e.note}</span>
            <span style={{ fontSize: 10, color: C.sub, marginLeft: 8 }}>{e.time}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>+₡{e.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
