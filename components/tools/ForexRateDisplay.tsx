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
const red = '#e05a4e'
const gold = '#c9a84c'

interface Rate {
  flag: string
  pair: string
  rate: number
  rateStr: string
  change: number
  unit: string
  cowrieRate: number
}

const RATES: Rate[] = [
  { flag: '🇺🇸', pair: 'USD/NGN', rate: 1605, rateStr: '₦1,605', change: 0.4, unit: '₦', cowrieRate: 200.4 },
  { flag: '🇬🇧', pair: 'GBP/NGN', rate: 2021, rateStr: '₦2,021', change: -0.8, unit: '₦', cowrieRate: 252.6 },
  { flag: '🇪🇺', pair: 'EUR/NGN', rate: 1742, rateStr: '₦1,742', change: 0.2, unit: '₦', cowrieRate: 217.7 },
  { flag: '🇬🇭', pair: 'GHS/GHC', rate: 9.8, rateStr: 'GHC 9.8', change: -0.3, unit: 'GHC', cowrieRate: 1.22 },
  { flag: '🇰🇪', pair: 'USD/KES', rate: 138, rateStr: 'KSH 138', change: 1.1, unit: 'KSH', cowrieRate: 17.2 },
  { flag: '🇿🇦', pair: 'USD/ZAR', rate: 18.4, rateStr: 'ZAR 18.4', change: -0.5, unit: 'ZAR', cowrieRate: 2.3 },
]

const COWRIE_TO_NGN = 8.02

export default function ForexRateDisplay({ villageId, roleKey }: ToolProps) {
  const [cowrieInput, setCowrieInput] = useState('1000')
  const [alerts, setAlerts] = useState<Record<string, boolean>>({})

  function toggleAlert(pair: string) {
    setAlerts(a => ({ ...a, [pair]: !a[pair] }))
  }

  const amount = parseFloat(cowrieInput) || 0

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: muted, letterSpacing: 1 }}>FOREX DESK</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Live Exchange Rates</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: '#1a3a1a', border: `1px solid ${green}`, borderRadius: 20, padding: '4px 10px', fontSize: 11, color: green }}>
            ● MARKET OPEN
          </div>
          <div style={{ fontSize: 10, color: muted, marginTop: 4 }}>Updated 3 min ago</div>
        </div>
      </div>

      {/* Rate cards 2-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {RATES.map(r => (
          <div key={r.pair} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 20 }}>{r.flag}</div>
              <button
                onClick={() => toggleAlert(r.pair)}
                style={{
                  border: 'none', background: alerts[r.pair] ? gold + '33' : 'transparent',
                  color: alerts[r.pair] ? gold : muted, borderRadius: 6, fontSize: 11,
                  padding: '2px 6px', cursor: 'pointer',
                }}
              >
                {alerts[r.pair] ? '🔔' : '🔕'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>{r.pair}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{r.rateStr}</div>
            <div style={{ fontSize: 12, color: r.change >= 0 ? green : red, marginTop: 2 }}>
              {r.change >= 0 ? '↑' : '↓'} {Math.abs(r.change)}%
            </div>
          </div>
        ))}
      </div>

      {/* Cowrie Converter */}
      <div style={{ background: card, border: `1px solid ${gold}33`, borderRadius: 12, padding: 16, marginBottom: 22 }}>
        <div style={{ fontSize: 13, color: gold, marginBottom: 10 }}>₡ Cowrie Converter</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 18, color: gold }}>₡</span>
          <input
            value={cowrieInput}
            onChange={e => setCowrieInput(e.target.value)}
            type="number"
            style={{
              flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 8,
              padding: '10px 12px', color: text, fontSize: 16, fontWeight: 600,
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: muted, marginBottom: 10 }}>₡1 = ₦{COWRIE_TO_NGN.toFixed(2)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {RATES.map(r => (
            <div key={r.pair} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: muted }}>{r.flag} {r.pair}</span>
              <span style={{ fontWeight: 600 }}>{r.unit} {(amount * r.cowrieRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info row */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: muted }}>Rates sourced from AfroFX API · Next update in <span style={{ color: text }}>3m 12s</span></div>
      </div>
    </div>
  )
}
