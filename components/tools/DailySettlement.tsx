'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const red = '#e05a4e'
const orange = '#d4813a'

interface HistoryRow {
  date: string
  gross: number
  fees: number
  net: number
  status: 'COMPLETE' | 'PENDING'
}

const HISTORY: HistoryRow[] = [
  { date: 'Mar 25', gross: 87200, fees: 4360, net: 82840, status: 'COMPLETE' },
  { date: 'Mar 24', gross: 102400, fees: 5120, net: 97280, status: 'COMPLETE' },
  { date: 'Mar 23', gross: 76800, fees: 3840, net: 72960, status: 'COMPLETE' },
]

const BREAKDOWN = [
  { label: 'Cash Collected', amount: 34500, color: green },
  { label: 'Mobile Money', amount: 41200, color: '#5b9bd5' },
  { label: 'Cowrie Wallet', amount: 18800, color: gold },
  { label: 'Discounts', amount: -2750, color: orange },
  { label: 'Returns', amount: -1250, color: red },
]

export default function DailySettlement({ villageId, roleKey }: ToolProps) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  const gross = 94500
  const fees = 4725
  const net = gross - fees
  const computed = BREAKDOWN.reduce((s, b) => s + b.amount, 0)
  const variance = computed - gross

  function runSettlement() {
    if (done || running) return
    setRunning(true)
    setProgress(0)
    let p = 0
    const iv = setInterval(() => {
      p += 6
      setProgress(p)
      if (p >= 100) {
        clearInterval(iv)
        setRunning(false)
        setDone(true)
      }
    }, 80)
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Status banner */}
      <div style={{
        background: done ? '#1a4d2e' : '#1e3a20',
        border: `1px solid ${done ? green : border}`,
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 12, color: muted }}>SETTLEMENT STATUS</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: done ? green : gold }}>
            {done ? '✅ Settlement Complete' : '🕐 Settlement Ready'}
          </div>
        </div>
        <div style={{ fontSize: 11, color: muted }}>Mar 26, 2026 · End of Day</div>
      </div>

      {/* 3 big numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Gross', value: gross, color: text },
          { label: 'Fees (5%)', value: fees, color: red },
          { label: 'Net Payout', value: net, color: green },
        ].map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>₡{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Breakdown table */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Revenue Breakdown</div>
        {BREAKDOWN.map(b => (
          <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
              <span style={{ fontSize: 14 }}>{b.label}</span>
            </div>
            <span style={{ fontWeight: 700, color: b.amount < 0 ? red : text }}>
              {b.amount < 0 ? '-' : ''}₡{Math.abs(b.amount).toLocaleString()}
            </span>
          </div>
        ))}
        {/* Variance row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0 0', fontWeight: 700 }}>
          <span>Variance</span>
          <span style={{ color: variance === 0 ? green : red }}>
            {variance === 0 ? '₡0' : `₡${variance.toLocaleString()}`}
            {variance === 0 ? ' ✓' : ' ⚠'}
          </span>
        </div>
      </div>

      {/* Progress / Run Settlement */}
      {running && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>Processing settlement...</div>
          <div style={{ background: border, borderRadius: 6, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: green, transition: 'width 0.08s linear' }} />
          </div>
          <div style={{ fontSize: 11, color: muted, marginTop: 6, textAlign: 'right' }}>{progress}%</div>
        </div>
      )}

      {done && (
        <div style={{ background: '#0d2e18', border: `1px solid ${green}`, borderRadius: 12, padding: 14, marginBottom: 16, textAlign: 'center', color: green, fontWeight: 600 }}>
          ✅ Settlement Complete — Payout scheduled in 24h
        </div>
      )}

      <button
        onClick={runSettlement}
        disabled={done || running}
        style={{
          width: '100%', background: done ? border : green, color: done ? muted : '#000',
          border: 'none', borderRadius: 12, padding: '14px 0',
          fontSize: 15, fontWeight: 700, cursor: done ? 'default' : 'pointer', marginBottom: 20,
        }}
      >
        {done ? 'Settlement Complete' : running ? 'Running...' : 'Run Settlement'}
      </button>

      {/* History */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Settlement History</div>
        {HISTORY.map(h => (
          <div key={h.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{h.date}</div>
              <div style={{ fontSize: 11, color: muted }}>Gross ₡{h.gross.toLocaleString()} · Fees ₡{h.fees.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: green }}>₡{h.net.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: green }}>● COMPLETE</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
