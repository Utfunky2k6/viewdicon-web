'use client'
import * as React from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const C = {
  bg: '#060d07', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e', accent: '#4ade80',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)', red: '#f87171', amber: '#fbbf24',
}

type TxType = 'IN' | 'OUT' | 'COWRIE' | 'TRANSFER'
interface Tx {
  id: string; date: string; description: string; type: TxType
  amount: number; party: string; status: 'Confirmed' | 'Pending' | 'Failed'
}

const BASE_TXNS: Tx[] = [
  { id: 't1',  date: '2026-04-04', description: 'Invoice INV-0048 payment',        type: 'IN',       amount: 3200,  party: 'Amara Diallo',      status: 'Confirmed' },
  { id: 't2',  date: '2026-04-04', description: 'Cowrie top-up via AfroWallet',    type: 'COWRIE',   amount: 5000,  party: 'AfroWallet',         status: 'Confirmed' },
  { id: 't3',  date: '2026-04-03', description: 'Stock purchase – Rice (10 bags)', type: 'OUT',      amount: 1800,  party: 'Kofi Grain Depot',   status: 'Confirmed' },
  { id: 't4',  date: '2026-04-03', description: 'Transfer to Fatou Camara',        type: 'TRANSFER', amount: 600,   party: 'NG-IBO-••••-5678',   status: 'Confirmed' },
  { id: 't5',  date: '2026-04-02', description: 'Service fee – branding project',  type: 'IN',       amount: 4500,  party: 'Bisi Okafor Ltd',    status: 'Confirmed' },
  { id: 't6',  date: '2026-04-02', description: 'Transport – delivery run',        type: 'OUT',      amount: 320,   party: 'Sule Logistics',     status: 'Confirmed' },
  { id: 't7',  date: '2026-04-01', description: 'Invoice INV-0047',                type: 'IN',       amount: 2100,  party: 'GH-TWI-••••-9012',   status: 'Pending'   },
  { id: 't8',  date: '2026-04-01', description: 'Cowrie transfer – Ajo circle',    type: 'COWRIE',   amount: 1000,  party: 'Ajo Circle #4',      status: 'Confirmed' },
  { id: 't9',  date: '2026-03-31', description: 'Supplier payment – Palm Oil',     type: 'OUT',      amount: 950,   party: 'Emeka Supplies',     status: 'Confirmed' },
  { id: 't10', date: '2026-03-31', description: 'Consultation – fintech workshop', type: 'IN',       amount: 1800,  party: 'TechVillage Hub',    status: 'Confirmed' },
  { id: 't11', date: '2026-03-30', description: 'Failed transfer – retry needed',  type: 'TRANSFER', amount: 400,   party: 'KE-KIK-••••-7890',   status: 'Failed'    },
  { id: 't12', date: '2026-03-29', description: 'Project milestone payout',        type: 'IN',       amount: 6000,  party: 'Village Dev Fund',   status: 'Confirmed' },
  { id: 't13', date: '2026-03-28', description: 'Materials – building supplies',   type: 'OUT',      amount: 2200,  party: 'Adeyemi Hardware',   status: 'Confirmed' },
  { id: 't14', date: '2026-03-27', description: 'Cowrie reward – referral bonus',  type: 'COWRIE',   amount: 250,   party: 'Viewdicon Rewards',  status: 'Confirmed' },
  { id: 't15', date: '2026-03-26', description: 'Invoice INV-0041 final payment',  type: 'IN',       amount: 2500,  party: 'NG-YOR-••••-1234',   status: 'Confirmed' },
  { id: 't16', date: '2026-03-25', description: 'Stock purchase – Tomatoes',       type: 'OUT',      amount: 450,   party: 'Market Stall 14',    status: 'Confirmed' },
]

const TYPE_COLOR: Record<TxType, string> = { IN: '#4ade80', OUT: '#f87171', COWRIE: '#d4a017', TRANSFER: '#60a5fa' }
const TYPE_ICON: Record<TxType, string> = { IN: '↓', OUT: '↑', COWRIE: '₡', TRANSFER: '⇄' }

function buildRunningBalance(txns: Tx[]): number[] {
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date))
  let bal = 2000
  const map: Record<string, number> = {}
  sorted.forEach(t => {
    if (t.status === 'Confirmed') {
      bal += (t.type === 'IN' || t.type === 'COWRIE') ? t.amount : -t.amount
    }
    map[t.id] = bal
  })
  return txns.map(t => map[t.id] ?? 0)
}

export default function TransactionLog({ villageId }: ToolProps) {
  const key = `tx_log_${villageId || 'default'}`
  const [loading, setLoading] = React.useState(true)
  const [txns, setTxns] = React.useState<Tx[]>(BASE_TXNS)
  const [typeFilter, setTypeFilter] = React.useState<'All' | TxType>('All')
  const [range, setRange] = React.useState<7 | 30 | 90>(30)
  const [toast, setToast] = React.useState('')

  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (stored) { try { setTxns(JSON.parse(stored)) } catch {} }
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [key])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range)
  const cutStr = cutoff.toISOString().slice(0, 10)

  const filtered = txns.filter(t =>
    (typeFilter === 'All' || t.type === typeFilter) && t.date >= cutStr
  )

  const balances = buildRunningBalance(filtered)

  const totalIn  = txns.filter(t => (t.type === 'IN' || t.type === 'COWRIE') && t.status === 'Confirmed' && t.date >= cutStr).reduce((a, t) => a + t.amount, 0)
  const totalOut = txns.filter(t => (t.type === 'OUT' || t.type === 'TRANSFER') && t.status === 'Confirmed' && t.date >= cutStr).reduce((a, t) => a + t.amount, 0)
  const net = totalIn - totalOut

  const exportCSV = () => {
    const header = 'Date,Description,Type,Amount,Balance,Status\n'
    const rows = filtered.map((t, i) => `${t.date},"${t.description}",${t.type},${t.amount},${balances[i]},${t.status}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `transactions_${villageId || 'village'}_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    showToast('CSV downloaded')
  }

  const statusColor = (s: string) => s === 'Confirmed' ? C.accent : s === 'Pending' ? C.amber : C.red

  if (loading) return (
    <div>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, height: 64 }} />
      ))}
    </div>
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: C.text }}>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Total In',  value: `₡${totalIn.toLocaleString()}`,  color: C.accent },
          { label: 'Total Out', value: `₡${totalOut.toLocaleString()}`, color: C.red },
          { label: 'Net',       value: `₡${Math.abs(net).toLocaleString()}`, color: net >= 0 ? C.accent : C.red },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Date range */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {([7, 30, 90] as const).map(d => (
          <button key={d} onClick={() => setRange(d)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${range === d ? C.accent : C.border}`, background: range === d ? 'rgba(74,222,128,.12)' : C.muted, color: range === d ? C.accent : C.sub }}>
            {d}d
          </button>
        ))}
        <button onClick={exportCSV} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${C.border}`, background: C.muted, color: C.gold }}>
          ↓ CSV
        </button>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['All', 'IN', 'OUT', 'COWRIE', 'TRANSFER'] as const).map(f => (
          <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', background: typeFilter === f ? (f === 'All' ? C.green : `${TYPE_COLOR[f as TxType]}22`) : C.muted, color: typeFilter === f ? (f === 'All' ? '#fff' : TYPE_COLOR[f as TxType]) : C.sub, borderWidth: typeFilter === f ? 0 : 1, borderStyle: 'solid', borderColor: C.border }}>
            {f === 'All' ? 'All' : `${TYPE_ICON[f as TxType]} ${f}`}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.sub }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>No transactions found</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Try changing your filters</div>
        </div>
      ) : (
        filtered.map((tx, i) => (
          <div key={tx.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${TYPE_COLOR[tx.type]}18`, border: `1px solid ${TYPE_COLOR[tx.type]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: TYPE_COLOR[tx.type], flexShrink: 0, fontWeight: 700 }}>
                {TYPE_ICON[tx.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{tx.description}</div>
                <div style={{ fontSize: 9, color: C.sub }}>{tx.party} · {tx.date}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: (tx.type === 'IN' || tx.type === 'COWRIE') ? C.accent : C.red }}>
                  {(tx.type === 'IN' || tx.type === 'COWRIE') ? '+' : '-'}₡{tx.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: C.sub, marginTop: 1 }}>bal ₡{balances[i].toLocaleString()}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: statusColor(tx.status), marginTop: 1 }}>{tx.status}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
