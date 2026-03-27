'use client'
import React, { useState, useEffect } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type JobStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'SCHEDULED'

interface BackupJob {
  id: string; name: string; schedule: string; lastRun: string; size: string; status: JobStatus
}

const INIT_JOBS: BackupJob[] = [
  { id: 'bj1', name: 'PostgreSQL Full Backup', schedule: 'Daily 02:00', lastRun: '2026-03-26 02:01', size: '2.4 GB', status: 'SUCCESS' },
  { id: 'bj2', name: 'Media Assets Sync', schedule: 'Daily 03:30', lastRun: '2026-03-26 03:30', size: '8.1 GB', status: 'FAILED' },
  { id: 'bj3', name: 'Blockchain Snapshot', schedule: 'Weekly Sun 00:00', lastRun: '2026-03-22 00:03', size: '512 MB', status: 'SUCCESS' },
]

const RETENTION = [
  { label: 'Daily backups kept', value: '7 days' },
  { label: 'Weekly backups kept', value: '4 weeks' },
  { label: 'Monthly backups kept', value: '12 months' },
]

const statusColor: Record<JobStatus, string> = { SUCCESS: green, FAILED: red, RUNNING: blue, SCHEDULED: muted }

export default function BackupMonitor({ villageId, roleKey }: ToolProps) {
  const [jobs, setJobs] = useState<BackupJob[]>(INIT_JOBS)
  const [manualRunning, setManualRunning] = useState(false)
  const [manualProgress, setManualProgress] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const used = 23.4 // GB
  const total = 50 // GB
  const pct = Math.round((used / total) * 100)

  const retryJob = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'RUNNING' } : j))
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'SUCCESS', lastRun: new Date().toISOString().slice(0, 16).replace('T', ' ') } : j))
      flash('Backup job completed successfully')
    }, 3000)
  }

  const runManual = () => {
    setManualRunning(true); setManualProgress(0)
    const interval = setInterval(() => {
      setManualProgress(p => {
        if (p >= 100) { clearInterval(interval); setManualRunning(false); flash('Manual backup completed!'); return 100 }
        return p + Math.round(Math.random() * 8 + 4)
      })
    }, 200)
  }

  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Backup Monitor</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>System backup management — Viewdicon Infrastructure</div>

      {/* Last backup status */}
      <div style={{ background: '#0a1e0c', border: `2px solid ${green}`, borderRadius: 14, padding: 16, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 36 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: green }}>Last Backup: 2h 34min ago</div>
        <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>PostgreSQL Full Backup · 02:01 · 2.4 GB</div>
      </div>

      {/* Storage usage */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Backup Storage</div>
          <span style={{ fontSize: 13, color: pct > 80 ? red : pct > 60 ? amber : muted }}>{used} GB / {total} GB ({pct}%)</span>
        </div>
        <div style={{ height: 10, background: '#1a3a20', borderRadius: 5 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? red : pct > 60 ? amber : green, borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: muted }}>
          <span>{(total - used).toFixed(1)} GB free</span>
          <span>Next cleanup: 3 days</span>
        </div>
      </div>

      {/* Backup jobs */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Backup Jobs</div>
        {jobs.map(job => (
          <div key={job.id} style={{ padding: '12px 14px', borderBottom: `1px solid ${border}`, background: job.status === 'FAILED' ? red + '11' : 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{job.name}</div>
                <div style={{ fontSize: 11, color: muted }}>{job.schedule} · Last: {job.lastRun}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: statusColor[job.status], background: statusColor[job.status] + '22', padding: '3px 8px', borderRadius: 8 }}>{job.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: muted }}>Size: {job.size}</span>
              {job.status === 'FAILED' && (
                <button onClick={() => retryJob(job.id)} style={btn(red)}>↻ Retry Now</button>
              )}
              {job.status === 'RUNNING' && (
                <div style={{ flex: 1, height: 4, background: '#1a3a20', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: blue, borderRadius: 2 }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual backup */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Manual Backup</div>
        {manualRunning ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted, marginBottom: 4 }}>
              <span>Backup in progress...</span>
              <span style={{ color: blue }}>{Math.min(100, manualProgress)}%</span>
            </div>
            <div style={{ height: 8, background: '#1a3a20', borderRadius: 4 }}>
              <div style={{ width: `${Math.min(100, manualProgress)}%`, height: '100%', background: blue, borderRadius: 4, transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : (
          <button onClick={runManual} style={{ ...btn(blue), width: '100%' }}>🗄 Run Manual Backup Now</button>
        )}
      </div>

      {/* Retention policy */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Retention Policy</div>
        {RETENTION.map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 13 }}>
            <span style={{ color: muted }}>{r.label}</span>
            <span style={{ color: gold, fontWeight: 700 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
