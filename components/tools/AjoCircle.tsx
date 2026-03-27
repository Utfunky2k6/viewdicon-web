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
const grey = '#2a4a2c'

const MEMBERS = [
  { name: 'Adaeze Madu', pos: 1, paid: true, current: false },
  { name: 'Ngozi Okonkwo', pos: 2, paid: true, current: false },
  { name: 'Fatima Diallo', pos: 3, paid: true, current: false },
  { name: 'Kwame Asante', pos: 4, paid: true, current: false },
  { name: 'Amina Bello', pos: 5, paid: true, current: false },
  { name: 'Tunde Adeyemi', pos: 6, paid: true, current: false },
  { name: 'You', pos: 7, paid: false, current: true },
  { name: 'Babajide Coker', pos: 8, paid: false, current: false },
  { name: 'Chukwu Eze', pos: 9, paid: false, current: false },
  { name: 'Emeka Obi', pos: 10, paid: false, current: false },
  { name: 'Yetunde Lawal', pos: 11, paid: false, current: false },
  { name: 'Kemi Adesanya', pos: 12, paid: false, current: false },
]

const HISTORY = [
  { month: 'January', contributed: 50000, received: 0, status: 'PAID' },
  { month: 'February', contributed: 50000, received: 0, status: 'PAID' },
  { month: 'March', contributed: 0, received: 0, status: 'DUE APR 1' },
]

export default function AjoCircle({ villageId, roleKey }: ToolProps) {
  const [autoDeduct, setAutoDeduct] = useState(true)
  const [contributing, setContributing] = useState(false)
  const [contributed, setContributed] = useState(false)
  const [animStep, setAnimStep] = useState(0)

  function contribute() {
    setContributing(true)
    let step = 0
    const iv = setInterval(() => {
      step++
      setAnimStep(step)
      if (step >= 5) {
        clearInterval(iv)
        setContributing(false)
        setContributed(true)
      }
    }, 300)
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: muted, letterSpacing: 1 }}>AJO CIRCLE</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Mama Traders Ajo Circle</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
          <span style={{ color: muted }}>👥 12 members</span>
          <span style={{ color: gold, fontWeight: 700 }}>₡600,000 pot</span>
        </div>
      </div>

      {/* Your position */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: muted, marginBottom: 10 }}>Your Position: #7 of 12</div>
        {/* Member dots strip */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {MEMBERS.map(m => (
            <div
              key={m.pos}
              title={m.name}
              style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: m.current ? gold : m.paid ? green : grey,
                color: m.current ? '#000' : m.paid ? '#000' : muted,
                border: m.current ? `2px solid ${gold}` : '2px solid transparent',
                boxShadow: m.current ? `0 0 8px ${gold}88` : 'none',
              }}
            >{m.pos}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
          {[['Paid', green], ['Your Turn', gold], ['Upcoming', grey]].map(([lbl, col]) => (
            <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: col as string }} />
              <span style={{ color: muted }}>{lbl as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next payout */}
      <div style={{ background: '#0d2e18', border: `1px solid ${green}`, borderRadius: 12, padding: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: muted }}>Next Payout</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Babajide Coker (#8)</div>
          <div style={{ fontSize: 12, color: muted }}>May 1, 2026</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: muted }}>Amount</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: green }}>₡50,000</div>
        </div>
      </div>

      {/* Contribution history */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>Contribution History</div>
        {HISTORY.map(h => (
          <div key={h.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
            <span style={{ fontSize: 14 }}>{h.month}</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {h.contributed > 0 && <span style={{ color: muted, fontSize: 13 }}>-₡{h.contributed.toLocaleString()}</span>}
              {h.received > 0 && <span style={{ color: green, fontSize: 13 }}>+₡{h.received.toLocaleString()}</span>}
              <span style={{ fontSize: 11, color: h.status === 'PAID' ? green : gold, fontWeight: 700 }}>{h.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Circle rules */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>Circle Rules</div>
        <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>📅 Monthly cycle — 1st of each month</div>
          <div>₡50,000 per member per month</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Auto-deduct from Cowrie Wallet</span>
            <div
              onClick={() => setAutoDeduct(a => !a)}
              style={{
                width: 42, height: 22, borderRadius: 11,
                background: autoDeduct ? green : grey,
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2, left: autoDeduct ? 22 : 2, transition: 'left 0.2s',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Cowrie animation */}
      {contributing && (
        <div style={{ textAlign: 'center', padding: '10px 0', marginBottom: 10 }}>
          <div style={{ fontSize: 24 }}>
            {'₡'.repeat(animStep)} → 🫙
          </div>
          <div style={{ fontSize: 12, color: muted }}>Sending contribution...</div>
        </div>
      )}

      {contributed && (
        <div style={{ background: '#0d2e18', border: `1px solid ${green}`, borderRadius: 10, padding: 12, textAlign: 'center', color: green, marginBottom: 12 }}>
          ✅ ₡50,000 contributed — Thank you!
        </div>
      )}

      <button
        onClick={contribute}
        disabled={contributing || contributed}
        style={{
          width: '100%', background: contributed ? grey : gold,
          color: contributed ? muted : '#000', border: 'none',
          borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 800,
          cursor: contributed ? 'default' : 'pointer',
        }}
      >
        {contributed ? '✓ Contributed this month' : contributing ? 'Sending...' : 'Contribute Now 🫙'}
      </button>
    </div>
  )
}
