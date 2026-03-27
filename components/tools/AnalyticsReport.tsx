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
const blue = '#5b9bd5'
const purple = '#9b7fd4'
const orange = '#d4813a'

type Period = 'Today' | 'This Week' | 'This Month' | 'All Time'

const PERIOD_DATA: Record<Period, { views: number; engagement: number; audience: number; revenue: number }> = {
  'Today':      { views: 2847,  engagement: 8.1, audience: 34,  revenue: 9400 },
  'This Week':  { views: 12847, engagement: 7.3, audience: 284, revenue: 47200 },
  'This Month': { views: 54200, engagement: 6.8, audience: 1240, revenue: 183000 },
  'All Time':   { views: 248000, engagement: 7.1, audience: 5800, revenue: 824000 },
}

const TOP_CONTENT = [
  { title: 'Live Q&A: Village Markets', type: '🔴 LIVE',    views: 3847, eng: '9.2%', color: '#e05a4e' },
  { title: 'Ankara Fabric Drop Reel',  type: '🎬 REEL',    views: 2910, eng: '8.7%', color: gold },
  { title: 'Monday Market Drum',       type: '🥁 DRUM',    views: 2140, eng: '7.4%', color: gold },
  { title: 'Griot Trade Digest',       type: '🗣 ORACLE',  views: 1820, eng: '6.9%', color: purple },
  { title: 'Adire Styling Guide',      type: '📝 ARTICLE', views: 1340, eng: '5.8%', color: blue },
]

const AGE_GROUPS = [
  { label: '18–24', pct: 28, color: green },
  { label: '25–34', pct: 42, color: gold },
  { label: '35–44', pct: 20, color: blue },
  { label: '45+',   pct: 10, color: purple },
]

const VILLAGES = [
  { name: 'Commerce',   pct: 34 },
  { name: 'Fashion',    pct: 26 },
  { name: 'Media',      pct: 18 },
  { name: 'Arts',       pct: 12 },
  { name: 'Technology', pct: 10 },
]

export default function AnalyticsReport({ villageId, roleKey }: ToolProps) {
  const [period, setPeriod] = useState<Period>('This Week')
  const [toast, setToast] = useState(false)
  const d = PERIOD_DATA[period]

  function exportReport() {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>ANALYTICS</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Engagement Report</div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto' }}>
        {(['Today', 'This Week', 'This Month', 'All Time'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${period === p ? green : border}`,
              background: period === p ? green + '22' : bg,
              color: period === p ? green : muted,
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >{p}</button>
        ))}
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Views',     value: d.views.toLocaleString(),         color: text },
          { label: 'Engagement Rate', value: d.engagement + '%',               color: green },
          { label: 'New Audience',    value: '+' + d.audience.toLocaleString(), color: gold },
          { label: 'Revenue',         value: '₡' + d.revenue.toLocaleString(), color: '#5b9bd5' },
        ].map(m => (
          <div key={m.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 14px' }}>
            <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Top content */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Top Content</div>
        {TOP_CONTENT.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${border}` }}>
            {/* Thumbnail placeholder */}
            <div style={{ width: 44, height: 36, borderRadius: 6, background: c.color + '33', border: `1px solid ${c.color}44`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              {c.type.split(' ')[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
              <div style={{ fontSize: 10, color: c.color }}>{c.type}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.views.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: green }}>{c.eng}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Audience breakdown */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Audience Age Groups</div>
        {AGE_GROUPS.map(a => (
          <div key={a.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{a.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.pct}%</span>
            </div>
            <div style={{ background: border, borderRadius: 4, height: 8 }}>
              <div style={{ width: `${a.pct}%`, height: '100%', background: a.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Village breakdown */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Top Engaging Villages</div>
        {VILLAGES.map(v => (
          <div key={v.name} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{v.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: gold }}>{v.pct}%</span>
            </div>
            <div style={{ background: border, borderRadius: 4, height: 6 }}>
              <div style={{ width: `${v.pct}%`, height: '100%', background: gold, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={exportReport}
        style={{ width: '100%', background: '#1a4d2e', color: green, border: `1px solid ${green}`, borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
      >
        Export Report →
      </button>

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#1a4d2e', border: `1px solid ${green}`, borderRadius: 20, padding: '10px 20px', fontSize: 13, color: green, zIndex: 200 }}>
          ✅ Report exported to Document Vault
        </div>
      )}
    </div>
  )
}
