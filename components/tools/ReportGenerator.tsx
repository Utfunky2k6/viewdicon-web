'use client'
import * as React from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const C = {
  bg: '#060d07', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e', accent: '#4ade80',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)', red: '#f87171', blue: '#60a5fa',
}

type ReportType = 'Weekly Summary' | 'Monthly Performance' | 'Village Activity' | 'Cowrie Flow' | 'Tool Usage'

const REPORT_TYPES: ReportType[] = ['Weekly Summary', 'Monthly Performance', 'Village Activity', 'Cowrie Flow', 'Tool Usage']

const REPORT_ICON: Record<ReportType, string> = {
  'Weekly Summary': '📅',
  'Monthly Performance': '📈',
  'Village Activity': '🏘️',
  'Cowrie Flow': '₡',
  'Tool Usage': '🛠️',
}

const REPORT_DATA: Record<ReportType, { stats: { label: string; value: string; color: string }[]; summary: string }> = {
  'Weekly Summary': {
    stats: [
      { label: 'Revenue',       value: '₡14,250',  color: C.accent },
      { label: 'Expenses',      value: '₡3,890',   color: C.red },
      { label: 'Net Profit',    value: '₡10,360',  color: C.accent },
      { label: 'New Clients',   value: '3',         color: C.blue },
      { label: 'Invoices Sent', value: '7',         color: C.gold },
    ],
    summary: 'This week showed a 14% increase in revenue compared to last week. Invoice collection improved significantly with only 1 pending invoice. Palm Oil stock remains low — reorder recommended before next market day.',
  },
  'Monthly Performance': {
    stats: [
      { label: 'Total Revenue',  value: '₡58,400',  color: C.accent },
      { label: 'Total Expenses', value: '₡18,200',  color: C.red },
      { label: 'Gross Margin',   value: '68.8%',     color: C.gold },
      { label: 'Clients Served', value: '24',        color: C.blue },
      { label: 'Avg Daily Rev',  value: '₡1,947',   color: C.accent },
    ],
    summary: 'Monthly performance is up 22% versus prior month. The Commerce village continues to be the top revenue contributor. 3 overdue invoices totalling ₡4,200 need immediate follow-up. Inventory turnover ratio improved to 2.4x.',
  },
  'Village Activity': {
    stats: [
      { label: 'Active Members',   value: '142',       color: C.accent },
      { label: 'Posts on Board',   value: '38',        color: C.blue },
      { label: 'Events This Month', value: '5',         color: C.gold },
      { label: 'Ajo Participants', value: '28',        color: C.accent },
      { label: 'New Registrations', value: '7',        color: C.sub },
    ],
    summary: 'Village activity increased by 31% this period. The Community Board saw strong engagement with the Ajo collection post receiving 42 reactions. Weekly market gatherings are consistently well attended. Recommend adding a Village Events calendar for better coordination.',
  },
  'Cowrie Flow': {
    stats: [
      { label: 'Cowrie Earned',    value: '₡6,250',   color: C.gold },
      { label: 'Cowrie Spent',     value: '₡1,850',   color: C.red },
      { label: 'Cowrie Balance',   value: '₡4,400',   color: C.gold },
      { label: 'Transfers Out',    value: '₡1,000',   color: C.blue },
      { label: 'Referral Rewards', value: '₡250',     color: C.accent },
    ],
    summary: 'Cowrie flow is healthy with a positive net balance of ₡4,400. Referral rewards contributed ₡250 this period — encourage more member referrals to boost passive Cowrie income. Top-up transactions are trending upward indicating growing trust in the Cowrie ecosystem.',
  },
  'Tool Usage': {
    stats: [
      { label: 'Total Tool Opens', value: '284',       color: C.accent },
      { label: 'Most Used',        value: 'Invoicing', color: C.blue },
      { label: 'Inventory Updates', value: '47',       color: C.gold },
      { label: 'Reports Generated', value: '12',       color: C.accent },
      { label: 'Avg Session Length', value: '4.2 min', color: C.sub },
    ],
    summary: 'Tool engagement is strong across the village. Quick Invoice remains the most-used tool (89 opens). The Inventory Tracker saw a 3x increase in usage after the low-stock alerts were introduced. Consider adopting the Client Tracker — currently under-utilised relative to your client base size.',
  },
}

export default function ReportGenerator({ villageId }: ToolProps) {
  const [loading, setLoading] = React.useState(true)
  const [reportType, setReportType] = React.useState<ReportType>('Weekly Summary')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [preview, setPreview] = React.useState(false)
  const [toast, setToast] = React.useState('')

  React.useEffect(() => {
    const to = new Date()
    const from = new Date(); from.setDate(from.getDate() - 7)
    setDateTo(to.toISOString().slice(0, 10))
    setDateFrom(from.toISOString().slice(0, 10))
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const data = REPORT_DATA[reportType]

  if (loading) return (
    <div>{[...Array(3)].map((_, i) => <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, height: 52 }} />)}</div>
  )

  return (
    <div style={{ color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {!preview ? (
        <div>
          {/* Report type selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Report Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {REPORT_TYPES.map(t => (
                <button key={t} onClick={() => setReportType(t)} style={{ padding: '11px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: `1px solid ${reportType === t ? 'rgba(74,222,128,.4)' : C.border}`, background: reportType === t ? 'rgba(74,222,128,.08)' : C.card, color: reportType === t ? C.accent : C.text, fontSize: 13, fontWeight: reportType === t ? 700 : 400, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{REPORT_ICON[t]}</span>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[['From', dateFrom, setDateFrom], ['To', dateTo, setDateTo]].map(([lbl, val, setter]) => (
              <div key={String(lbl)}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 4 }}>{String(lbl)}</label>
                <input type="date" value={String(val)} onChange={e => (setter as (v: string) => void)(e.target.value)}
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 10px', color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
              </div>
            ))}
          </div>

          <button onClick={() => setPreview(true)} style={{ width: '100%', padding: 13, borderRadius: 10, background: 'linear-gradient(90deg, #1a7c3e, #065f46)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            ✦ Generate Report
          </button>
        </div>
      ) : (
        <div>
          {/* Report header */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{REPORT_ICON[reportType]}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{reportType}</div>
                <div style={{ fontSize: 10, color: C.sub }}>{dateFrom} → {dateTo} · Village: {villageId || 'Default'}</div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {data.stats.map(s => (
                <div key={s.label} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: C.sub, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>AI Summary</div>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>{data.summary}</p>
            </div>

            <div style={{ marginTop: 10, fontSize: 9, color: C.sub }}>Generated by Griot AI · Viewdicon Platform · Sealed with AfroID: NG-YOR-••••-••••</div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => showToast('Report downloaded as PDF')} style={{ flex: 1, padding: 11, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>↓ Download PDF</button>
            <button onClick={() => showToast('Report link copied')} style={{ flex: 1, padding: 11, borderRadius: 10, background: C.muted, color: C.text, fontWeight: 700, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>Share</button>
            <button onClick={() => setPreview(false)} style={{ padding: '11px 14px', borderRadius: 10, background: C.muted, color: C.sub, fontSize: 12, border: `1px solid ${C.border}`, cursor: 'pointer' }}>← Edit</button>
          </div>
        </div>
      )}
    </div>
  )
}
