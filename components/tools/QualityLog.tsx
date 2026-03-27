'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
type Result = 'PASS' | 'FAIL' | 'PARTIAL'
interface CriterionState { label: string; result: Result; notes: string }
interface InspectionRecord { batch: string; product: string; date: string; result: string; inspector: string; signedOff: boolean }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', RD = '#c62828', AM = '#e65100'

const CRITERIA_LABELS = [
  'Visual appearance & surface finish',
  'Dimensions within tolerance',
  'Weight / quantity accuracy',
  'Packaging integrity',
  'Labelling completeness',
]

const HISTORY: InspectionRecord[] = [
  { batch: 'BATCH-2026-0312', product: 'Shea Butter 500g',     date: '2026-03-12', result: 'PASSED',           inspector: 'Adaeze Okonkwo',  signedOff: true  },
  { batch: 'BATCH-2026-0308', product: 'Palm Oil 5L',          date: '2026-03-08', result: 'CONDITIONAL PASS', inspector: 'Ngozi Bello',     signedOff: true  },
  { batch: 'BATCH-2026-0302', product: 'Cocoa Beans 25kg',     date: '2026-03-02', result: 'FAILED',           inspector: 'Kwame Asante',    signedOff: false },
  { batch: 'BATCH-2026-0224', product: 'Pepper Grind 250g',    date: '2026-02-24', result: 'PASSED',           inspector: 'Adaeze Okonkwo',  signedOff: true  },
  { batch: 'BATCH-2026-0217', product: 'Groundnut Oil 1L',     date: '2026-02-17', result: 'PASSED',           inspector: 'Fatima Usman',    signedOff: true  },
]

const resultColor = (r: string) => r === 'PASSED' || r === 'PASS' ? GR : r === 'FAILED' || r === 'FAIL' ? RD : AM

export default function QualityLog({ villageId: _v, roleKey: _r }: ToolProps) {
  const [batch, setBatch] = useState('')
  const [product, setProduct] = useState('')
  const [inspector, setInspector] = useState('')
  const [date, setDate] = useState('')
  const [checklist, setChecklist] = useState<CriterionState[]>(
    CRITERIA_LABELS.map(label => ({ label, result: 'PASS', notes: '' }))
  )
  const [correctiveAction, setCorrectiveAction] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const setResult = (i: number, r: Result) =>
    setChecklist(cl => cl.map((c, j) => j === i ? { ...c, result: r } : c))

  const setNotes = (i: number, n: string) =>
    setChecklist(cl => cl.map((c, j) => j === i ? { ...c, notes: n } : c))

  const hasFail = checklist.some(c => c.result === 'FAIL')
  const hasPartial = checklist.some(c => c.result === 'PARTIAL')
  const overall = hasFail ? 'FAILED' : hasPartial ? 'CONDITIONAL PASS' : 'PASSED'
  const overallColor = resultColor(overall)

  const submit = () => {
    if (!batch) return
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2500)
  }

  const RESULTS: Result[] = ['PASS', 'FAIL', 'PARTIAL']

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>✅ Quality Log</h2>
        <span style={{ fontSize: 13, color: MT }}>Pass rate: <span style={{ color: '#a5d6a7', fontWeight: 700 }}>87%</span> this Q</span>
      </div>

      {submitted && (
        <div style={{ background: GR, borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 14, fontWeight: 600 }}>
          ✅ Inspection record saved!
        </div>
      )}

      {/* New Inspection Form */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 12 }}>NEW INSPECTION</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          {[['Batch Number', batch, setBatch, 'BATCH-2026-0326'], ['Product / Item', product, setProduct, 'e.g. Shea Butter 500g'], ['Inspector Name', inspector, setInspector, 'Adaeze Okonkwo'], ['Date', date, setDate, '2026-03-26']].map(([label, val, setter, ph]) => (
            <div key={label as string}>
              <div style={{ fontSize: 11, color: MT, marginBottom: 3 }}>{label as string}</div>
              <input
                value={val as string}
                onChange={e => (setter as (x: string) => void)(e.target.value)}
                placeholder={ph as string}
                style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 8px', color: TX, fontSize: 12, boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 12 }}>INSPECTION CHECKLIST</div>
        {checklist.map((c, i) => (
          <div key={i} style={{ marginBottom: 14, paddingBottom: 12, borderBottom: i < checklist.length - 1 ? `1px solid ${BD}` : 'none' }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>{i + 1}. {c.label}</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              {RESULTS.map(r => (
                <button
                  key={r}
                  onClick={() => setResult(i, r)}
                  style={{
                    flex: 1, padding: '6px 4px', border: `1px solid ${c.result === r ? resultColor(r) : BD}`,
                    borderRadius: 7, background: c.result === r ? resultColor(r) + '22' : 'transparent',
                    color: c.result === r ? resultColor(r) : MT, cursor: 'pointer', fontSize: 11, fontWeight: c.result === r ? 700 : 400
                  }}
                >{r}</button>
              ))}
            </div>
            <input
              value={c.notes}
              onChange={e => setNotes(i, e.target.value)}
              placeholder="Notes (optional)..."
              style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 5, padding: '5px 8px', color: TX, fontSize: 12, boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>

      {/* Result Badge */}
      <div style={{ background: CARD, border: `1px solid ${overallColor}`, borderRadius: 12, padding: 16, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: MT, marginBottom: 6 }}>OVERALL RESULT</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: overallColor }}>{overall}</div>
      </div>

      {/* NCR */}
      {hasFail && (
        <div style={{ background: '#1a0505', border: `1px solid ${RD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#ef9a9a', fontWeight: 700, marginBottom: 8 }}>⚠️ NON-CONFORMANCE REPORT (NCR)</div>
          <div style={{ fontSize: 13, color: TX, marginBottom: 4 }}>
            Failures detected in: {checklist.filter(c => c.result === 'FAIL').map(c => c.label).join(', ')}
          </div>
          <div style={{ fontSize: 11, color: MT, marginBottom: 6 }}>CORRECTIVE ACTION REQUIRED</div>
          <textarea
            value={correctiveAction}
            onChange={e => setCorrectiveAction(e.target.value)}
            rows={3}
            placeholder="Describe corrective action to be taken, responsible person, and deadline..."
            style={{ width: '100%', background: '#050e06', border: `1px solid ${RD}44`, borderRadius: 6, padding: 9, color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <button
        onClick={submit}
        style={{ width: '100%', padding: 13, background: GR, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}
      >
        💾 Save Inspection Record
      </button>

      {/* History */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>INSPECTION HISTORY</div>
        {HISTORY.map((h, i) => (
          <div key={i} style={{ padding: '10px 14px', borderBottom: i < HISTORY.length - 1 ? `1px solid ${BD}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{h.product}</span>
              <span style={{ background: resultColor(h.result), color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{h.result}</span>
            </div>
            <div style={{ fontSize: 11, color: MT }}>{h.batch} · {h.date} · {h.inspector} {h.signedOff ? '✅' : '⏳'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
