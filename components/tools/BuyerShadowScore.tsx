'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

interface TradeRecord { date: string; amount: number; completed: boolean; description: string }

interface BuyerResult {
  id: string
  score: number
  components: { label: string; pct: number; color: string; inverse: boolean }[]
  flags: string[]
  trades: TradeRecord[]
}


export default function BuyerShadowScore({ villageId, roleKey }: ToolProps) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<BuyerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [decision, setDecision] = useState<'ACCEPTED' | 'DECLINED' | null>(null)
  const [maxBid, setMaxBid] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const checkBuyer = () => {
    if (!query.trim()) return
    setLoading(true); setDecision(null)
    setTimeout(() => { setResult(null); setLoading(false) }, 1200)
  }

  const scoreColor = (s: number) => s >= 75 ? green : s >= 55 ? amber : red
  const scoreLabel = (s: number) => s >= 75 ? 'TRUSTWORTHY' : s >= 55 ? 'CAUTION' : 'HIGH RISK'

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Buyer Shadow Score</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 16 }}>Anonymous buyer trust verification — privacy-first</div>

      {/* Search */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Enter AfroID or phone number</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="e.g. AFR-82847 or 0803..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkBuyer()} style={{ ...inp, flex: 1 }} />
          <button onClick={checkBuyer} style={btn(blue)}>{loading ? '...' : 'Check'}</button>
        </div>
        <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>Identity is masked — only trust signals are revealed</div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: muted }}>🔍 Looking up trust signals...</div>
      )}

      {result && !loading && (
        <>
          {/* Score display */}
          <div style={{ background: card, border: `2px solid ${scoreColor(result.score)}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: muted }}>MASKED IDENTITY</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{result.id}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: scoreColor(result.score), lineHeight: 1 }}>{result.score}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(result.score), background: scoreColor(result.score) + '22', padding: '3px 10px', borderRadius: 10 }}>{scoreLabel(result.score)}</span>
              </div>
            </div>

            {/* Score meter */}
            <div style={{ height: 10, background: '#1a3a20', borderRadius: 5, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '33%', height: '100%', background: red, position: 'absolute', left: 0 }} />
              <div style={{ width: '22%', height: '100%', background: amber, position: 'absolute', left: '33%' }} />
              <div style={{ width: '45%', height: '100%', background: green, position: 'absolute', left: '55%' }} />
              <div style={{ position: 'absolute', left: `${result.score}%`, top: -2, height: 14, width: 4, background: text, borderRadius: 2, transform: 'translateX(-2px)' }} />
            </div>

            {/* Score components */}
            {result.components.map(c => (
              <div key={c.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: muted }}>{c.label}</span>
                  <span style={{ color: c.color, fontWeight: 700 }}>{c.pct}%{c.inverse ? ' (low = good)' : ''}</span>
                </div>
                <div style={{ height: 4, background: '#1a3a20', borderRadius: 2 }}>
                  <div style={{ width: `${c.inverse ? 100 - c.pct : c.pct}%`, height: '100%', background: c.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Flags */}
          {result.flags.map(f => (
            <div key={f} style={{ background: amber + '22', border: `1px solid ${amber}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: amber }}>{f}</div>
          ))}

          {/* Trade history */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 11, color: muted, fontWeight: 700 }}>LAST 5 TRANSACTIONS (ANONYMIZED)</div>
            {result.trades.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: `1px solid ${border}` }}>
                <div>
                  <div style={{ fontSize: 12 }}>{t.description}</div>
                  <div style={{ fontSize: 10, color: muted }}>{t.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>₡{t.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: t.completed ? green : red }}>{t.completed ? '✓ Completed' : '⚠ Disputed'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Decision */}
          {!decision ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setDecision('ACCEPTED'); flash('Trade accepted — Seso chat opening...') }} style={{ ...btn(green), flex: 1, fontSize: 14, padding: '10px 0' }}>✓ Accept Trade</button>
              <button onClick={() => { setDecision('DECLINED'); flash('Trade declined') }} style={{ flex: 1, background: red + '22', border: `2px solid ${red}`, borderRadius: 8, padding: '10px 0', color: red, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>✕ Decline Trade</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 12, fontSize: 15, fontWeight: 700, color: decision === 'ACCEPTED' ? green : red }}>
              {decision === 'ACCEPTED' ? '✓ Trade Accepted' : '✕ Trade Declined'}
            </div>
          )}
        </>
      )}
    </div>
  )
}
