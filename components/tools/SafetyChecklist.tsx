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

type CheckStatus = 'PASS' | 'FAIL' | 'NA'

interface CheckItem {
  id: string
  label: string
  status: CheckStatus
  section: string
}

const INITIAL_ITEMS: CheckItem[] = [
  // PPE
  { id: 'c1', label: 'Hard hat worn and in good condition', status: 'PASS', section: 'A' },
  { id: 'c2', label: 'Safety boots worn on site', status: 'PASS', section: 'A' },
  { id: 'c3', label: 'High-visibility vest in use', status: 'PASS', section: 'A' },
  { id: 'c4', label: 'Safety goggles available', status: 'FAIL', section: 'A' },
  { id: 'c5', label: 'Gloves provided for all workers', status: 'PASS', section: 'A' },
  // Site Conditions
  { id: 'c6', label: 'Site perimeter clearly marked', status: 'PASS', section: 'B' },
  { id: 'c7', label: 'No loose materials at heights', status: 'PASS', section: 'B' },
  { id: 'c8', label: 'Scaffolding inspected today', status: 'FAIL', section: 'B' },
  { id: 'c9', label: 'Electrical panels guarded', status: 'PASS', section: 'B' },
  { id: 'c10', label: 'Fire extinguisher on site', status: 'PASS', section: 'B' },
  // Emergency
  { id: 'c11', label: 'Emergency exits clearly marked', status: 'PASS', section: 'C' },
  { id: 'c12', label: 'First aid kit stocked', status: 'PASS', section: 'C' },
  { id: 'c13', label: 'Emergency contacts posted', status: 'PASS', section: 'C' },
  { id: 'c14', label: 'Muster point identified', status: 'PASS', section: 'C' },
  { id: 'c15', label: 'Incident reporting log on site', status: 'NA', section: 'C' },
]

const SECTIONS: Record<string, string> = {
  A: 'Section A: Personal Protective Equipment (PPE)',
  B: 'Section B: Site Conditions',
  C: 'Section C: Emergency Procedures',
}

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
const severityColor: Record<Severity, string> = { LOW: muted, MEDIUM: gold, HIGH: orange, CRITICAL: red }

const ISSUES: { label: string; severity: Severity }[] = [
  { label: 'Safety goggles not present — PPE incomplete', severity: 'MEDIUM' },
  { label: 'Scaffolding uninspected — work above 3m restricted', severity: 'HIGH' },
]

export default function SafetyChecklist({ villageId, roleKey }: ToolProps) {
  const [items, setItems] = useState<CheckItem[]>(INITIAL_ITEMS)
  const [signed, setSigned] = useState(false)

  function cycle(id: string) {
    if (signed) return
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const next: CheckStatus = item.status === 'PASS' ? 'FAIL' : item.status === 'FAIL' ? 'NA' : 'PASS'
      return { ...item, status: next }
    }))
  }

  const passes = items.filter(i => i.status === 'PASS').length
  const fails = items.filter(i => i.status === 'FAIL').length
  const total = items.filter(i => i.status !== 'NA').length
  const scoreLabel = passes >= total * 0.9 ? 'Satisfactory' : passes >= total * 0.7 ? 'Needs Review' : 'Unsatisfactory'
  const scoreColor = passes >= total * 0.9 ? green : passes >= total * 0.7 ? gold : red

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: muted, letterSpacing: 1 }}>SAFETY AUDIT</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Pre-Work Checklist</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Site: Onitsha Construction Blk 3 · Supervisor: Chukwu Eze · Mar 26</div>
        </div>
        <div style={{ background: scoreColor + '22', border: `1px solid ${scoreColor}`, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor }}>{passes}/{total}</div>
          <div style={{ fontSize: 10, color: scoreColor }}>{scoreLabel}</div>
        </div>
      </div>

      {/* Issues Found */}
      {!signed && ISSUES.length > 0 && (
        <div style={{ background: '#1f0f0a', border: `1px solid ${orange}55`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: orange, fontWeight: 700, marginBottom: 8 }}>⚠ Issues Found ({ISSUES.length})</div>
          {ISSUES.map((iss, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: severityColor[iss.severity], background: severityColor[iss.severity] + '22', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>{iss.severity}</div>
              <div style={{ fontSize: 12, color: text }}>{iss.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Checklist sections */}
      {(['A', 'B', 'C'] as const).map(sec => (
        <div key={sec} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: gold, fontWeight: 700, marginBottom: 10 }}>{SECTIONS[sec]}</div>
          {items.filter(i => i.section === sec).map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={item.status === 'PASS'}
                  onChange={() => cycle(item.id)}
                  style={{ width: 16, height: 16, accentColor: green, cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: item.status === 'NA' ? muted : text }}>{item.label}</span>
              </div>
              <button
                onClick={() => cycle(item.id)}
                style={{
                  border: `1px solid ${item.status === 'PASS' ? green : item.status === 'FAIL' ? red : border}`,
                  background: item.status === 'PASS' ? green + '22' : item.status === 'FAIL' ? red + '22' : bg,
                  color: item.status === 'PASS' ? green : item.status === 'FAIL' ? red : muted,
                  borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: signed ? 'default' : 'pointer', flexShrink: 0, marginLeft: 8,
                }}
              >
                {item.status === 'PASS' ? '✅ PASS' : item.status === 'FAIL' ? '❌ FAIL' : 'N/A'}
              </button>
            </div>
          ))}
        </div>
      ))}

      {/* Signature */}
      {!signed ? (
        <>
          <div style={{ background: card, border: `2px dashed ${border}`, borderRadius: 10, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: muted }}>Tap below to sign off</span>
          </div>
          <button
            onClick={() => setSigned(true)}
            style={{ width: '100%', background: green, color: '#000', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Sign Off & Submit
          </button>
        </>
      ) : (
        <div style={{ background: '#0d2e18', border: `1px solid ${green}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 16, color: green, fontWeight: 700 }}>✅ Checklist Submitted</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 6 }}>Signed off by Chukwu Eze · {new Date().toLocaleTimeString()}</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Score: {passes}/{total} — {scoreLabel}</div>
        </div>
      )}
    </div>
  )
}
