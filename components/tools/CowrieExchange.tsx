'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
type Currency = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD' | 'EUR'
type ExchangeStatus = 'IDLE' | 'PENDING' | 'PROCESSING' | 'COMPLETE'
interface HistoryEntry { amount: number; from: string; to: Currency; rate: string; status: 'COMPLETE' | 'PENDING' }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', AM = '#e65100'

const RATES: Record<Currency, { symbol: string; rate: number; name: string }> = {
  NGN: { symbol: '₦',   rate: 8.02,   name: 'Nigerian Naira'    },
  GHS: { symbol: 'GH₵', rate: 0.61,   name: 'Ghanaian Cedi'     },
  KES: { symbol: 'KSh', rate: 1.30,   name: 'Kenyan Shilling'   },
  ZAR: { symbol: 'R',   rate: 0.18,   name: 'South African Rand' },
  USD: { symbol: '$',   rate: 0.0055, name: 'US Dollar'          },
  EUR: { symbol: '€',   rate: 0.0051, name: 'Euro'               },
}

const INIT_HISTORY: HistoryEntry[] = [
  { amount: 50000,  from: 'Cowrie', to: 'NGN', rate: '₡1 = ₦8.02',   status: 'COMPLETE' },
  { amount: 10000,  from: 'Cowrie', to: 'GHS', rate: '₡1 = GH₵0.61', status: 'COMPLETE' },
  { amount: 25000,  from: 'Cowrie', to: 'USD', rate: '₡1 = $0.0055', status: 'COMPLETE' },
  { amount: 100000, from: 'Cowrie', to: 'NGN', rate: '₡1 = ₦7.98',   status: 'COMPLETE' },
  { amount: 5000,   from: 'Cowrie', to: 'EUR', rate: '₡1 = €0.0050', status: 'COMPLETE' },
]

const SENTIMENTS: Record<Currency, { text: string; pct: string; positive: boolean }> = {
  NGN: { text: 'Cowrie strengthened 2.3% vs NGN this week', pct: '+2.3%', positive: true  },
  GHS: { text: 'Cowrie weakened 0.8% vs GHS this week',     pct: '-0.8%', positive: false },
  KES: { text: 'Cowrie stable vs KES, ±0.1% this week',     pct: '±0.1%', positive: true  },
  ZAR: { text: 'Cowrie strengthened 1.1% vs ZAR this week', pct: '+1.1%', positive: true  },
  USD: { text: 'Cowrie weakened 0.3% vs USD this week',     pct: '-0.3%', positive: false },
  EUR: { text: 'Cowrie stable vs EUR, +0.2% this week',     pct: '+0.2%', positive: true  },
}

const STATUS_STEPS: ExchangeStatus[] = ['PENDING', 'PROCESSING', 'COMPLETE']

export default function CowrieExchange({ villageId: _v, roleKey: _r }: ToolProps) {
  const [amount, setAmount] = useState('')
  const [targetCurrency, setTargetCurrency] = useState<Currency>('NGN')
  const [status, setStatus] = useState<ExchangeStatus>('IDLE')
  const [history, setHistory] = useState<HistoryEntry[]>(INIT_HISTORY)

  const cowrieAmt = parseFloat(amount) || 0
  const rate = RATES[targetCurrency]
  const converted = (cowrieAmt * rate.rate).toFixed(
    targetCurrency === 'USD' || targetCurrency === 'EUR' ? 4 : 2
  )
  const fee = cowrieAmt * 0.005
  const netAmount = cowrieAmt - fee
  const sentiment = SENTIMENTS[targetCurrency]

  const initiateExchange = () => {
    if (!cowrieAmt) return
    setStatus('PENDING')
    setTimeout(() => setStatus('PROCESSING'), 1200)
    setTimeout(() => {
      setStatus('COMPLETE')
      setHistory(h => [{
        amount: cowrieAmt,
        from: 'Cowrie',
        to: targetCurrency,
        rate: `₡1 = ${rate.symbol}${rate.rate}`,
        status: 'COMPLETE',
      }, ...h])
    }, 3000)
    setTimeout(() => setStatus('IDLE'), 5000)
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>🌊 Cowrie Exchange</h2>

      {/* Rate Banner */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: MT, fontWeight: 700 }}>LIVE RATES</span>
          <span style={{ fontSize: 10, color: MT }}>Updated 2 min ago</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {(Object.entries(RATES) as [Currency, typeof RATES[Currency]][]).map(([cur, info]) => (
            <div
              key={cur}
              onClick={() => setTargetCurrency(cur)}
              style={{ background: targetCurrency === cur ? '#0a2a0a' : '#050e06', border: `1px solid ${targetCurrency === cur ? GR : BD}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: 11, color: MT }}>{cur}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: targetCurrency === cur ? '#a5d6a7' : TX }}>
                  {info.symbol}{info.rate}
                </div>
              </div>
              {targetCurrency === cur && <span style={{ fontSize: 16 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Market Sentiment */}
      <div style={{ background: sentiment.positive ? '#0a2a0a' : '#1a0505', border: `1px solid ${sentiment.positive ? GR : '#c62828'}`, borderRadius: 10, padding: '9px 14px', marginBottom: 14, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{sentiment.positive ? '📈' : '📉'}</span>
        <span style={{ color: sentiment.positive ? '#a5d6a7' : '#ef9a9a' }}>
          {sentiment.text}
        </span>
        <span style={{ background: sentiment.positive ? GR : '#c62828', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, marginLeft: 'auto', flexShrink: 0 }}>
          {sentiment.pct}
        </span>
      </div>

      {/* Converter */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 12 }}>CURRENCY CONVERTER</div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>COWRIE AMOUNT (₡)</div>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Enter amount e.g. 10000"
            style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 8, padding: '10px 12px', color: TX, fontSize: 16, fontWeight: 600, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>TARGET CURRENCY</div>
          <select
            value={targetCurrency}
            onChange={e => setTargetCurrency(e.target.value as Currency)}
            style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 8, padding: '9px 12px', color: TX, fontSize: 14 }}
          >
            {(Object.entries(RATES) as [Currency, typeof RATES[Currency]][]).map(([cur, info]) => (
              <option key={cur} value={cur}>{cur} — {info.name} ({info.symbol})</option>
            ))}
          </select>
        </div>

        {cowrieAmt > 0 && (
          <div style={{ background: '#050e06', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: MT }}>You send</span>
              <span style={{ fontWeight: 700 }}>₡{cowrieAmt.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: MT }}>Platform fee (0.5%)</span>
              <span style={{ color: '#ef9a9a' }}>-₡{fee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: MT }}>Rate</span>
              <span>₡1 = {rate.symbol}{rate.rate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${BD}`, fontSize: 15, fontWeight: 700 }}>
              <span>You receive</span>
              <span style={{ color: '#a5d6a7' }}>
                {rate.symbol}{(netAmount * rate.rate).toFixed(targetCurrency === 'USD' || targetCurrency === 'EUR' ? 4 : 2)}
              </span>
            </div>
          </div>
        )}

        {status === 'IDLE' ? (
          <button
            onClick={initiateExchange}
            disabled={!cowrieAmt}
            style={{ width: '100%', padding: 12, background: cowrieAmt ? GR : '#1a2e1b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: cowrieAmt ? 'pointer' : 'default', opacity: cowrieAmt ? 1 : 0.6 }}
          >
            Initiate Exchange →
          </button>
        ) : (
          <div style={{ background: '#050e06', border: `1px solid ${BD}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>EXCHANGE IN PROGRESS</div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {STATUS_STEPS.map(step => {
                const done = STATUS_STEPS.indexOf(step) <= STATUS_STEPS.indexOf(status as 'PENDING' | 'PROCESSING' | 'COMPLETE')
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? GR : '#1a2e1b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background 0.3s' }}>
                      {done ? '✓' : '○'}
                    </div>
                    <div style={{ fontSize: 10, color: done ? MT : '#1e3a20', fontWeight: done ? 600 : 400 }}>{step}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>EXCHANGE HISTORY</div>
        {history.slice(0, 5).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: i < Math.min(history.length, 5) - 1 ? `1px solid ${BD}` : 'none', fontSize: 13 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e3a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              {RATES[h.to].symbol}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>₡{h.amount.toLocaleString()} → {h.to}</div>
              <div style={{ fontSize: 11, color: MT }}>{h.rate}</div>
            </div>
            <span style={{ fontSize: 10, background: GR, color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
