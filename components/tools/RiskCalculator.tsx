'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type RiskCategory = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
type IncomeStability = 'STABLE' | 'VARIABLE' | 'SEASONAL' | 'UNEMPLOYED'

interface RiskFactors {
  creditHistory: number; incomeStability: IncomeStability; dtiRatio: number; hasCollateral: boolean; collateralValue: number; tradeSessions: number
}

const categoryColor: Record<RiskCategory, string> = {
  VERY_LOW: '#4caf7d', LOW: '#82c995', MODERATE: '#d4a017', HIGH: '#e07b39', VERY_HIGH: '#c0392b'
}

const categoryLabel: Record<RiskCategory, string> = {
  VERY_LOW: 'Very Low Risk', LOW: 'Low Risk', MODERATE: 'Moderate Risk', HIGH: 'High Risk', VERY_HIGH: 'Very High Risk'
}

const getRecommendation = (score: number): string => {
  if (score >= 80) return 'Extend credit up to ₡500,000 with standard terms'
  if (score >= 65) return 'Extend credit up to ₡150,000 with monthly review'
  if (score >= 50) return 'Extend credit up to ₡50,000 with collateral required'
  if (score >= 35) return 'Extend credit up to ₡20,000 — short-term only'
  return 'Do not extend credit at this time — high default risk'
}

const getCategory = (score: number): RiskCategory => {
  if (score >= 80) return 'VERY_LOW'
  if (score >= 65) return 'LOW'
  if (score >= 50) return 'MODERATE'
  if (score >= 35) return 'HIGH'
  return 'VERY_HIGH'
}

export default function RiskCalculator({ villageId, roleKey }: ToolProps) {
  const [subject, setSubject] = useState('')
  const [factors, setFactors] = useState<RiskFactors>({
    creditHistory: 7, incomeStability: 'STABLE', dtiRatio: 35, hasCollateral: true, collateralValue: 200000, tradeSessions: 12
  })
  const [score, setScore] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<{ label: string; points: number; max: number }[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const calculate = () => {
    if (!subject.trim()) { flash('Enter a subject name or AfroID'); return }
    const incomePoints = { STABLE: 20, VARIABLE: 12, SEASONAL: 8, UNEMPLOYED: 0 }
    const creditPoints = Math.round((factors.creditHistory / 10) * 25)
    const dtiPoints = factors.dtiRatio <= 30 ? 20 : factors.dtiRatio <= 50 ? 10 : 0
    const collateralPoints = factors.hasCollateral ? Math.min(20, Math.round((factors.collateralValue / 500000) * 20)) : 0
    const tradePoints = Math.min(15, Math.round((factors.tradeSessions / 20) * 15))

    const bd = [
      { label: 'Credit History', points: creditPoints, max: 25 },
      { label: 'Income Stability', points: incomePoints[factors.incomeStability], max: 20 },
      { label: 'Debt-to-Income Ratio', points: dtiPoints, max: 20 },
      { label: 'Collateral', points: collateralPoints, max: 20 },
      { label: 'Trade History', points: tradePoints, max: 15 },
    ]
    const total = bd.reduce((s, b) => s + b.points, 0)
    setBreakdown(bd); setScore(total)
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '8px 18px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 14 })
  const category = score !== null ? getCategory(score) : null

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: amber, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Risk Calculator</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 16 }}>Credit & trade risk scoring — Ụtụ Assessment Engine</div>

      {/* Subject */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 8 }}>RISK SUBJECT</div>
        <input placeholder="Full name, business name, or AfroID..." value={subject} onChange={e => setSubject(e.target.value)} style={inp} />
      </div>

      {/* Factors */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12, fontWeight: 700 }}>RISK FACTORS</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13 }}>Credit History</span>
            <span style={{ color: gold, fontWeight: 700 }}>{factors.creditHistory}/10</span>
          </div>
          <input type="range" min={1} max={10} value={factors.creditHistory} onChange={e => setFactors(f => ({ ...f, creditHistory: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: gold }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Income Stability</div>
            <select value={factors.incomeStability} onChange={e => setFactors(f => ({ ...f, incomeStability: e.target.value as IncomeStability }))} style={inp}>
              <option value="STABLE">Stable (Salaried)</option>
              <option value="VARIABLE">Variable (Business)</option>
              <option value="SEASONAL">Seasonal (Farming)</option>
              <option value="UNEMPLOYED">Unemployed</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Debt-to-Income (%)</div>
            <input type="number" min={0} max={100} value={factors.dtiRatio} onChange={e => setFactors(f => ({ ...f, dtiRatio: Number(e.target.value) }))} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <button onClick={() => setFactors(f => ({ ...f, hasCollateral: !f.hasCollateral }))}
              style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${factors.hasCollateral ? green : border}`, background: factors.hasCollateral ? green : 'none', cursor: 'pointer' }}>
              {factors.hasCollateral && <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>✓</span>}
            </button>
            <span style={{ fontSize: 13 }}>Has Collateral</span>
          </div>
          {factors.hasCollateral && (
            <input type="number" placeholder="Collateral value (₡)" value={factors.collateralValue} onChange={e => setFactors(f => ({ ...f, collateralValue: Number(e.target.value) }))} style={inp} />
          )}
        </div>

        <div>
          <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>Trade History Sessions</div>
          <input type="number" min={0} value={factors.tradeSessions} onChange={e => setFactors(f => ({ ...f, tradeSessions: Number(e.target.value) }))} style={inp} />
        </div>
      </div>

      <button onClick={calculate} style={{ ...btn(gold), width: '100%', marginBottom: 16, fontSize: 15 }}>Calculate Risk Score</button>

      {/* Score display */}
      {score !== null && category && (
        <div style={{ background: card, border: `2px solid ${categoryColor[category]}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700, color: categoryColor[category] }}>{score}</div>
              <div style={{ fontSize: 11, color: muted }}>out of 100</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: categoryColor[category], background: categoryColor[category] + '22', padding: '6px 16px', borderRadius: 20, border: `1px solid ${categoryColor[category]}` }}>{categoryLabel[category]}</span>
          </div>

          {/* Meter */}
          <div style={{ height: 10, background: '#1a3a20', borderRadius: 5, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${red}, ${amber}, ${green})`, transition: 'width 0.5s' }} />
            <div style={{ position: 'absolute', left: `${score}%`, top: -2, height: 14, width: 3, background: text, borderRadius: 2 }} />
          </div>

          {/* Breakdown */}
          <div style={{ marginBottom: 14 }}>
            {breakdown.map(b => (
              <div key={b.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
                  <span style={{ color: muted }}>{b.label}</span>
                  <span style={{ color: gold }}>{b.points}/{b.max}</span>
                </div>
                <div style={{ height: 4, background: '#1a3a20', borderRadius: 2 }}>
                  <div style={{ width: `${(b.points / b.max) * 100}%`, height: '100%', background: categoryColor[category], borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div style={{ background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ color: muted, fontSize: 11, fontWeight: 700 }}>RECOMMENDATION — </span>
            <span>{getRecommendation(score)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
