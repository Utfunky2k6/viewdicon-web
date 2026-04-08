'use client'
import { useState } from 'react'

const C = {
  bg: '#060d07', card: '#0f1e11', border: '#1e3a20',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
  orange: '#f97316', blue: '#60a5fa', red: '#f87171',
}

const CATEGORIES = [
  { name: 'Staff Salaries', budget: 450000, spent: 390000, icon: '👥' },
  { name: 'Equipment & Supplies', budget: 120000, spent: 87000, icon: '🔧' },
  { name: 'Marketing', budget: 80000, spent: 72000, icon: '📢' },
  { name: 'Utilities', budget: 35000, spent: 28000, icon: '⚡' },
  { name: 'Rent / Lease', budget: 150000, spent: 150000, icon: '🏢' },
  { name: 'Miscellaneous', budget: 40000, spent: 18000, icon: '📦' },
]

const MONTH_DATA = [280, 310, 390, 250, 420, 380, 460, 395]
const MONTH_LABELS = ['Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr']

const inp = (label: string, ph: string, type = 'text') => (
  <div style={{ marginBottom: 10 }}>
    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
    <input type={type} placeholder={ph} style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
  </div>
)

export default function BudgetTracker({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly')
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')

  const totalBudget = CATEGORIES.reduce((s, c) => s + c.budget, 0)
  const totalSpent  = CATEGORIES.reduce((s, c) => s + c.spent, 0)
  const remaining   = totalBudget - totalSpent
  const pct         = Math.round((totalSpent / totalBudget) * 100)
  const maxSpend    = Math.max(...MONTH_DATA)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', color: C.text }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['monthly','quarterly','annual'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${period === p ? C.green : C.border}`, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: period === p ? `${C.green}30` : C.muted, color: period === p ? '#4ade80' : C.sub }}>
            {p === 'monthly' ? 'Monthly' : p === 'quarterly' ? 'Quarterly' : 'Annual'}
          </button>
        ))}
      </div>

      {/* Overview card */}
      <div style={{ background: pct > 90 ? 'rgba(248,113,113,.08)' : `${C.green}15`, border: `1px solid ${pct > 90 ? 'rgba(248,113,113,.3)' : `${C.green}40`}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: C.sub, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Budget Utilisation</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: pct > 90 ? C.red : '#4ade80', marginBottom: 8 }}>{pct}%</div>
        <div style={{ height: 8, background: C.muted, borderRadius: 99, marginBottom: 8 }}>
          <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: pct > 90 ? C.red : pct > 75 ? C.gold : '#4ade80', transition: 'width .5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: C.red, fontWeight: 700 }}>Spent: ₦{(totalSpent/1000).toFixed(0)}k</span>
          <span style={{ color: '#4ade80', fontWeight: 700 }}>Left: ₦{(remaining/1000).toFixed(0)}k</span>
        </div>
        <div style={{ fontSize: 10, color: C.sub, marginTop: 4, textAlign: 'center' }}>of ₦{(totalBudget/1000).toFixed(0)}k total budget</div>
      </div>

      {/* Spend trend chart */}
      <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 10 }}>Spend Trend (₦k)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
          {MONTH_DATA.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${(v / maxSpend) * 48}px`,
                background: i === MONTH_DATA.length - 1 ? C.green : `${C.green}50` }} />
              <div style={{ fontSize: 7, color: C.sub }}>{MONTH_LABELS[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Category Breakdown</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {CATEGORIES.map(cat => {
          const catPct = Math.round((cat.spent / cat.budget) * 100)
          const over = cat.spent >= cat.budget
          return (
            <div key={cat.name} style={{ background: C.muted, border: `1px solid ${over ? 'rgba(248,113,113,.3)' : C.border}`, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{cat.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{cat.name}</span>
                  {over && <span style={{ fontSize: 9, color: C.red, fontWeight: 700 }}>OVER</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: over ? C.red : C.text }}>₦{(cat.spent/1000).toFixed(0)}k</span>
                  <span style={{ fontSize: 10, color: C.sub }}> / ₦{(cat.budget/1000).toFixed(0)}k</span>
                </div>
              </div>
              <div style={{ height: 4, background: `${C.border}`, borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(catPct, 100)}%`,
                  background: over ? C.red : catPct > 80 ? C.gold : '#4ade80' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          + Add Expense
        </button>
        <button onClick={() => showToast('✓ Report exported')}
          style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: C.muted, color: '#4ade80', fontWeight: 700, fontSize: 13, border: `1px solid ${C.green}50`, cursor: 'pointer' }}>
          Export
        </button>
      </div>

      {showAdd && (
        <div style={{ marginTop: 12, background: C.card, border: `1px solid ${C.green}40`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Log Expense</div>
          {inp('Description', 'e.g. Office supplies')}
          {inp('Amount (₦)', '0', 'number')}
          {inp('Category', '')}
          <button onClick={() => { setShowAdd(false); showToast('✓ Expense logged') }}
            style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
            Save Expense
          </button>
        </div>
      )}
    </div>
  )
}
