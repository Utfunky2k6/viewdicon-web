'use client'
import { useState, useEffect, useRef } from 'react'

const ENTRIES = [
  { id: 1, task: 'Client consultation — ABC Traders', project: 'ABC Traders', start: '09:00', end: '10:30', billable: true, rate: 5000, status: 'completed' },
  { id: 2, task: 'Website design review', project: 'Nkiru Creatives', start: '11:00', end: '12:45', billable: true, rate: 3500, status: 'completed' },
  { id: 3, task: 'Report writing', project: 'Internal', start: '14:00', end: '15:30', billable: false, rate: 0, status: 'completed' },
]

function toMins(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function duration(start: string, end: string) {
  const d = toMins(end) - toMins(start)
  return `${Math.floor(d / 60)}h ${d % 60}m`
}

function billableTotal(entries: typeof ENTRIES) {
  return entries.filter(e => e.billable).reduce((sum, e) => {
    const mins = toMins(e.end) - toMins(e.start)
    return sum + (mins / 60) * e.rate
  }, 0)
}

export default function TimeTracker() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [task, setTask] = useState('')
  const [project, setProject] = useState('')
  const [billable, setBillable] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const fmtElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0')
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const totalBillable = billableTotal(ENTRIES)
  const totalHours = ENTRIES.reduce((sum, e) => sum + (toMins(e.end) - toMins(e.start)) / 60, 0)

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a1a1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>⏱ Time Tracker</h2>

      {/* Live timer */}
      <div style={{ background: running ? '#f0fdf4' : '#f9f9f9', border: `2px solid ${running ? '#86efac' : '#e5e7eb'}`,
        borderRadius: 16, padding: 16, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: 2,
          color: running ? '#16a34a' : '#374151', marginBottom: 10 }}>
          {fmtElapsed(elapsed)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <input value={task} onChange={e => setTask(e.target.value)}
            placeholder="What are you working on?"
            style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 13 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={project} onChange={e => setProject(e.target.value)}
              placeholder="Project"
              style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 13 }} />
            <button onClick={() => setBillable(!billable)}
              style={{ padding: '9px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
                background: billable ? '#dcfce7' : '#f3f4f6', color: billable ? '#16a34a' : '#6b7280' }}>
              {billable ? '₡ Billable' : 'Internal'}
            </button>
          </div>
        </div>
        <button
          onClick={() => { setRunning(!running); if (!running) setElapsed(0) }}
          style={{ padding: '12px 32px', borderRadius: 99, fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer',
            background: running ? '#dc2626' : '#1a7c3e', color: '#fff' }}>
          {running ? '⏹ Stop' : '▶ Start Timer'}
        </button>
      </div>

      {/* Today summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Hours Today', value: `${totalHours.toFixed(1)}h`, color: '#1d4ed8' },
          { label: 'Billable', value: `${ENTRIES.filter(e => e.billable).length} tasks`, color: '#16a34a' },
          { label: 'Revenue', value: `₦${(totalBillable/1000).toFixed(1)}k`, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#9ca3af' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Time log */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Today's Log</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ENTRIES.map(entry => (
          <div key={entry.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{entry.task}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{entry.project} · {entry.start}–{entry.end}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{duration(entry.start, entry.end)}</div>
              {entry.billable ? (
                <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>₡ Billable</span>
              ) : (
                <span style={{ fontSize: 9, color: '#9ca3af' }}>Internal</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button style={{ width: '100%', marginTop: 14, padding: '11px 0', borderRadius: 12, background: '#f0fdf4',
        color: '#1a7c3e', fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>
        Export Timesheet
      </button>
    </div>
  )
}
