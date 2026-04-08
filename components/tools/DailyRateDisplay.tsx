'use client'
import { useState } from 'react'

const RATES = [
  { pair: 'USD / NGN', rate: 1580.25, change: +2.15, flag: '🇺🇸🇳🇬' },
  { pair: 'GBP / NGN', rate: 2015.80, change: -0.45, flag: '🇬🇧🇳🇬' },
  { pair: 'EUR / NGN', rate: 1720.60, change: +1.30, flag: '🇪🇺🇳🇬' },
  { pair: 'COW / NGN', rate: 450.00, change: +5.20, flag: '🪙🇳🇬' },
  { pair: 'KES / NGN', rate: 11.20, change: -0.10, flag: '🇰🇪🇳🇬' },
]

export default function DailyRateDisplay() {
  const [base, setBase] = useState('NGN')
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>💱 Daily Exchange Rates</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['NGN', 'USD', 'COW'].map(c => (
          <button key={c} onClick={() => setBase(c)} style={{ padding: '6px 16px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 13, background: base === c ? '#1a7c3e' : '#e5e7eb', color: base === c ? '#fff' : '#1a2e1a', cursor: 'pointer' }}>{c}</button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Base: {base} — Updated 09:41 WAT</p>
      {RATES.map((r, i) => (
        <div key={i} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>{r.flag}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{r.pair}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{r.rate.toLocaleString()}</div>
            <span style={{ fontSize: 12, color: r.change >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{r.change >= 0 ? '+' : ''}{r.change}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
