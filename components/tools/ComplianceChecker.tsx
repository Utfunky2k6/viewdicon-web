'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'IN_REVIEW'
interface CheckItem { text: string; status: ComplianceStatus }
interface Law { key: string; name: string; items: CheckItem[] }
interface Violation { severity: 'HIGH' | 'MEDIUM'; description: string; dueDate: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', RD = '#c62828', AM = '#e65100'

const LAWS: Law[] = [
  {
    key: 'caws', name: 'CAWS Trade Law',
    items: [
      { text: 'Business registration certificate valid',            status: 'COMPLIANT'     },
      { text: 'Trade licence renewed for current year',            status: 'COMPLIANT'     },
      { text: 'Product labelling meets CAWS standards',            status: 'IN_REVIEW'     },
      { text: 'Consumer protection policy displayed',              status: 'COMPLIANT'     },
      { text: 'Weights and measures calibration current',          status: 'NON_COMPLIANT' },
      { text: 'Staff trade training certificates on file',         status: 'COMPLIANT'     },
      { text: 'Complaints register maintained',                    status: 'COMPLIANT'     },
      { text: 'Annual trade returns submitted',                    status: 'COMPLIANT'     },
    ],
  },
  {
    key: 'tax', name: 'Tax Compliance',
    items: [
      { text: 'TIN registered with FIRS',                        status: 'COMPLIANT'     },
      { text: 'VAT returns filed (current quarter)',              status: 'COMPLIANT'     },
      { text: 'WHT deductions remitted',                         status: 'NON_COMPLIANT' },
      { text: 'Annual income tax returns submitted',             status: 'IN_REVIEW'     },
      { text: 'PAYE deducted and remitted for all staff',        status: 'COMPLIANT'     },
      { text: 'Business premises levy paid',                     status: 'COMPLIANT'     },
      { text: 'Capital gains tax paid where applicable',         status: 'COMPLIANT'     },
      { text: 'Tax audit documentation available',               status: 'COMPLIANT'     },
    ],
  },
  {
    key: 'health', name: 'Health & Safety',
    items: [
      { text: 'Fire extinguishers installed and tested',         status: 'COMPLIANT'     },
      { text: 'Emergency exits clearly marked',                  status: 'COMPLIANT'     },
      { text: 'Staff health certificates current',              status: 'NON_COMPLIANT' },
      { text: 'Food handling licences valid (if applicable)',   status: 'COMPLIANT'     },
      { text: 'First aid kit stocked and accessible',           status: 'COMPLIANT'     },
      { text: 'Incident log maintained',                        status: 'IN_REVIEW'     },
      { text: 'OSHA training records on file',                  status: 'COMPLIANT'     },
      { text: 'Building safety certificate valid',              status: 'COMPLIANT'     },
    ],
  },
  {
    key: 'data', name: 'Data Protection',
    items: [
      { text: 'Privacy policy published and accessible',        status: 'COMPLIANT'     },
      { text: 'Customer data processing records maintained',    status: 'COMPLIANT'     },
      { text: 'Data breach response plan documented',           status: 'IN_REVIEW'     },
      { text: 'NDPC registration completed',                    status: 'COMPLIANT'     },
      { text: 'Staff data protection training current',        status: 'NON_COMPLIANT' },
      { text: 'Data retention policy implemented',              status: 'COMPLIANT'     },
      { text: 'Third-party data sharing agreements in place',  status: 'COMPLIANT'     },
      { text: 'Cookie consent implemented on digital assets',  status: 'COMPLIANT'     },
    ],
  },
  {
    key: 'env', name: 'Environmental',
    items: [
      { text: 'Waste disposal licence current',                 status: 'COMPLIANT'     },
      { text: 'Noise levels within permissible limits',         status: 'COMPLIANT'     },
      { text: 'Effluent treatment system operational',          status: 'IN_REVIEW'     },
      { text: 'Environmental impact assessment on file',        status: 'COMPLIANT'     },
      { text: 'Recycling programme implemented',               status: 'NON_COMPLIANT' },
      { text: 'Carbon emission records maintained',             status: 'COMPLIANT'     },
      { text: 'NESREA compliance certificate valid',            status: 'COMPLIANT'     },
      { text: 'Hazardous materials storage registered',         status: 'COMPLIANT'     },
    ],
  },
]

const VIOLATIONS: Violation[] = [
  { severity: 'HIGH',   description: 'Withholding Tax deductions not remitted for Q4 2025',   dueDate: '2026-04-15' },
  { severity: 'MEDIUM', description: 'Weights and measures calibration certificate expired',   dueDate: '2026-04-30' },
]

const statusIcon  = (s: ComplianceStatus) => s === 'COMPLIANT' ? '✅' : s === 'NON_COMPLIANT' ? '❌' : '🔄'
const statusColor = (s: ComplianceStatus) => s === 'COMPLIANT' ? GR : s === 'NON_COMPLIANT' ? RD : AM

export default function ComplianceChecker({ villageId: _v, roleKey: _r }: ToolProps) {
  const [lawKey, setLawKey] = useState('caws')
  const [laws, setLaws] = useState<Law[]>(LAWS)

  const law = laws.find(l => l.key === lawKey) ?? laws[0]
  const compliant = law.items.filter(i => i.status === 'COMPLIANT').length
  const score = Math.round((compliant / law.items.length) * 100)

  const toggle = (index: number) => {
    const cycle: ComplianceStatus[] = ['COMPLIANT', 'NON_COMPLIANT', 'IN_REVIEW']
    setLaws(ls => ls.map(l => l.key !== lawKey ? l : {
      ...l,
      items: l.items.map((item, i) =>
        i !== index ? item : { ...item, status: cycle[(cycle.indexOf(item.status) + 1) % cycle.length] }
      )
    }))
  }

  const overallScore = Math.round(
    laws.flatMap(l => l.items).filter(i => i.status === 'COMPLIANT').length /
    laws.flatMap(l => l.items).length * 100
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>📋 Compliance Checker</h2>

      {/* Overall Score */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: MT }}>OVERALL COMPLIANCE SCORE</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: overallScore >= 90 ? '#a5d6a7' : overallScore >= 70 ? '#ffe0b2' : '#ef9a9a' }}>
              {overallScore}/100
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: MT }}>
            <div>Last audit: Jan 15, 2026</div>
            <div>Next: Apr 15, 2026</div>
          </div>
        </div>
        <div style={{ height: 10, background: '#1a2e1b', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${overallScore}%`, height: '100%', background: overallScore >= 90 ? GR : overallScore >= 70 ? AM : RD, borderRadius: 5, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Violations */}
      {VIOLATIONS.length > 0 && (
        <div style={{ background: '#1a0505', border: `1px solid ${RD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#ef9a9a', fontWeight: 700, marginBottom: 10 }}>⚠️ OUTSTANDING VIOLATIONS ({VIOLATIONS.length})</div>
          {VIOLATIONS.map((v, i) => (
            <div key={i} style={{ paddingBottom: i < VIOLATIONS.length - 1 ? 10 : 0, borderBottom: i < VIOLATIONS.length - 1 ? `1px solid ${RD}33` : 'none', marginBottom: i < VIOLATIONS.length - 1 ? 10 : 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ background: v.severity === 'HIGH' ? RD : AM, color: '#fff', padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{v.severity}</span>
                <div>
                  <div style={{ fontSize: 13, color: TX }}>{v.description}</div>
                  <div style={{ fontSize: 11, color: '#ef9a9a', marginTop: 2 }}>Remediation due: {v.dueDate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Law Selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {LAWS.map(l => (
          <button
            key={l.key}
            onClick={() => setLawKey(l.key)}
            style={{
              padding: '7px 12px', border: `1px solid ${lawKey === l.key ? GR : BD}`,
              borderRadius: 8, background: lawKey === l.key ? '#0a2a0a' : CARD,
              color: lawKey === l.key ? '#a5d6a7' : MT, cursor: 'pointer', fontSize: 11,
              whiteSpace: 'nowrap', fontWeight: lawKey === l.key ? 700 : 400
            }}
          >{l.name}</button>
        ))}
      </div>

      {/* Checklist */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: MT, fontWeight: 700 }}>{law.name.toUpperCase()}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: score >= 80 ? '#a5d6a7' : '#ef9a9a' }}>{score}% compliant</div>
        </div>
        <div style={{ height: 6, background: '#1a2e1b', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ width: `${score}%`, height: '100%', background: score >= 80 ? GR : score >= 60 ? AM : RD, borderRadius: 3 }} />
        </div>
        {law.items.map((item, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < law.items.length - 1 ? `1px solid ${BD}` : 'none', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{statusIcon(item.status)}</span>
            <span style={{ flex: 1, fontSize: 13, color: item.status === 'NON_COMPLIANT' ? '#ef9a9a' : TX }}>{item.text}</span>
            <span style={{ fontSize: 10, color: statusColor(item.status), background: statusColor(item.status) + '22', padding: '2px 7px', borderRadius: 10, fontWeight: 700, flexShrink: 0 }}>
              {item.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>

      <button
        disabled={overallScore < 90}
        style={{ width: '100%', padding: 13, background: overallScore >= 90 ? GR : '#1a2e1b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: overallScore >= 90 ? 'pointer' : 'default', opacity: overallScore < 90 ? 0.6 : 1 }}
      >
        {overallScore >= 90 ? '🏆 Generate Compliance Certificate' : `🔒 Score ${90 - overallScore} more points to unlock certificate`}
      </button>
    </div>
  )
}
