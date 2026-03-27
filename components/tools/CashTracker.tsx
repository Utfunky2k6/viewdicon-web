'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type EntryType = 'CASH_IN' | 'CASH_OUT'
interface CashEntry { id: string; type: EntryType; amount: number; description: string; time: string }

const DENOMS = [1000, 500, 200, 100, 50, 20, 10, 5]

const INIT_ENTRIES: CashEntry[] = [
  { id: 'e1', type: 'CASH_IN', amount: 5000, description: 'Morning sales — fabric', time: '08:15' },
  { id: 'e2', type: 'CASH_OUT', amount: 1200, description: 'Transport expenses', time: '09:30' },
  { id: 'e3', type: 'CASH_IN', amount: 8400, description: 'Yam sales', time: '10:45' },
  { id: 'e4', type: 'CASH_OUT', amount: 3000, description: 'Supplier payment — Aliyu', time: '11:20' },
  { id: 'e5', type: 'CASH_IN', amount: 2750, description: 'Fish sales', time: '12:00' },
]

export default function CashTracker({ villageId, roleKey }: ToolProps) {
  const [started, setStarted] = useState(false)
  const [openingBalance, setOpeningBalance] = useState('25000')
  const [entries, setEntries] = useState<CashEntry[]>(INIT_ENTRIES)
  const [entryType, setEntryType] = useState<EntryType>('CASH_IN')
  const [entryAmount, setEntryAmount] = useState('')
  const [entryDesc, setEntryDesc] = useState('')
  const [denoms, setDenoms] = useState<Record<number, number>>(Object.fromEntries(DENOMS.map(d => [d, 0])))
  const [reconciled, setReconciled] = useState(false)
  const [dayEnded, setDayEnded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const opening = Number(openingBalance) || 0
  const totalIn = entries.filter(e => e.type === 'CASH_IN').reduce((s, e) => s + e.amount, 0)
  const totalOut = entries.filter(e => e.type === 'CASH_OUT').reduce((s, e) => s + e.amount, 0)
  const runningBalance = opening + totalIn - totalOut
  const physicalCount = DENOMS.reduce((s, d) => s + d * (denoms[d] || 0), 0)
  const variance = physicalCount - runningBalance

  const addEntry = () => {
    if (!entryAmount || !entryDesc) return
    const entry: CashEntry = {
      id: `e${Date.now()}`, type: entryType, amount: Number(entryAmount),
      description: entryDesc, time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    }
    setEntries(e => [...e, entry]); setEntryAmount(''); setEntryDesc('')
    flash(`${entryType === 'CASH_IN' ? '+' : '-'}₡${Number(entryAmount).toLocaleString()} logged`)
  }

  const reconcile = () => { setReconciled(true); flash(Math.abs(variance) < 100 ? '✓ Reconciled — accounts balance!' : `⚠ Variance of ₡${Math.abs(variance).toLocaleString()} detected`) }
  const closeDay = () => { setDayEnded(true); flash('Day closed — settlement sent to ledger') }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 16px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  if (!started) {
    return (
      <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 24 }}>💰</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Cash Tracker</div>
        <div style={{ color: muted, fontSize: 13, marginBottom: 20 }}>Start your trading day</div>
        <div style={{ width: '100%', maxWidth: 300 }}>
          <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Opening Cash Balance (₡)</div>
          <input type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} style={{ ...inp, marginBottom: 12, fontSize: 18, textAlign: 'center' }} />
          <button onClick={() => setStarted(true)} style={{ ...btn(green), width: '100%', fontSize: 15 }}>Start Day</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Cash Tracker</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>March 26, 2026 · Shift started</div>

      {/* Running balance */}
      <div style={{ background: '#0a1e0c', border: `2px solid ${green}`, borderRadius: 14, padding: 16, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>RUNNING BALANCE</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: green }}>₡{runningBalance.toLocaleString()}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
          <div style={{ fontSize: 12 }}><span style={{ color: muted }}>Opening: </span><span style={{ color: '#5b9bd5' }}>₡{opening.toLocaleString()}</span></div>
          <div style={{ fontSize: 12 }}><span style={{ color: muted }}>In: </span><span style={{ color: green }}>+₡{totalIn.toLocaleString()}</span></div>
          <div style={{ fontSize: 12 }}><span style={{ color: muted }}>Out: </span><span style={{ color: red }}>-₡{totalOut.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Cash log */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden', maxHeight: 240, overflowY: 'auto' }}>
        <div style={{ padding: '8px 12px', borderBottom: `1px solid ${border}`, fontSize: 11, color: muted, fontWeight: 700 }}>CASH LOG</div>
        {[...entries].reverse().map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: e.type === 'CASH_IN' ? green : red }} />
              <div>
                <div style={{ fontSize: 13 }}>{e.description}</div>
                <div style={{ fontSize: 10, color: muted }}>{e.time}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, color: e.type === 'CASH_IN' ? green : red }}>{e.type === 'CASH_IN' ? '+' : '-'}₡{e.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Add entry */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {(['CASH_IN', 'CASH_OUT'] as EntryType[]).map(t => (
            <button key={t} onClick={() => setEntryType(t)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `2px solid ${entryType === t ? (t === 'CASH_IN' ? green : red) : border}`, background: entryType === t ? (t === 'CASH_IN' ? green + '22' : red + '22') : 'none', color: entryType === t ? (t === 'CASH_IN' ? green : red) : muted, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
              {t === 'CASH_IN' ? '+ CASH IN' : '- CASH OUT'}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input placeholder="Amount (₡)" type="number" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} style={inp} />
          <input placeholder="Description" value={entryDesc} onChange={e => setEntryDesc(e.target.value)} style={inp} />
        </div>
        <button onClick={addEntry} style={btn(entryType === 'CASH_IN' ? green : red)}>Log Entry</button>
      </div>

      {/* Denomination counter */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Denomination Counter</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {DENOMS.map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: muted, fontSize: 12, width: 50 }}>₦{d}</span>
              <input type="number" min={0} value={denoms[d] || ''} placeholder="0" onChange={e => setDenoms(prev => ({ ...prev, [d]: Number(e.target.value) }))} style={{ ...inp, width: 60, textAlign: 'center' }} />
              <span style={{ color: gold, fontSize: 11 }}>= ₡{(d * (denoms[d] || 0)).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: muted }}>Physical Total:</span>
          <span style={{ fontWeight: 700, color: gold, fontSize: 18 }}>₡{physicalCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Reconcile */}
      <button onClick={reconcile} style={{ ...btn(amber), width: '100%', marginBottom: 8 }}>Reconcile</button>
      {reconciled && (
        <div style={{ background: Math.abs(variance) < 100 ? '#0a1e0c' : '#1e0a0a', border: `1px solid ${Math.abs(variance) < 100 ? green : red}`, borderRadius: 10, padding: 12, marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: Math.abs(variance) < 100 ? green : red, fontSize: 14 }}>
            {Math.abs(variance) < 100 ? '✓ Balanced' : `⚠ Variance: ₡${variance.toLocaleString()}`}
          </div>
          <div style={{ fontSize: 12, color: muted }}>Ledger: ₡{runningBalance.toLocaleString()} · Physical: ₡{physicalCount.toLocaleString()}</div>
        </div>
      )}
      {!dayEnded && <button onClick={closeDay} style={{ ...btn(red), width: '100%' }}>Close Day</button>}
      {dayEnded && <div style={{ textAlign: 'center', color: muted, fontSize: 13, padding: 10 }}>✓ Day closed · Final balance: ₡{runningBalance.toLocaleString()}</div>}
    </div>
  )
}
