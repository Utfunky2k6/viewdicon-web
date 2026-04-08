'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { USE_MOCKS } from '@/lib/flags'
import UnderConstruction from '@/components/ui/UnderConstruction'

/* ── types ── */
type CampaignType = 'market_cry' | 'drum_announcement' | 'billboard' | 'night_market' | 'heat_boost' | 'tv_commercial' | 'griot_story' | 'tool_sponsor'
type CampaignStatus = 'active' | 'scheduled' | 'completed' | 'paused'

interface Campaign {
  id: string; name: string; type: CampaignType; status: CampaignStatus
  budget: number; spent: number; reach: number; taps: number; conversions: number
  startDate: string; endDate: string; villages: string[]; skin: string
}

const TYPE_CFG: Record<CampaignType, { emoji: string; label: string; color: string }> = {
  market_cry:       { emoji: '🥁', label: 'Market Cry',       color: '#d4a017' },
  drum_announcement:{ emoji: '📢', label: 'Drum Announcement', color: '#ef4444' },
  billboard:        { emoji: '🏗', label: 'Village Billboard', color: '#8b5cf6' },
  night_market:     { emoji: '🏮', label: 'Night Market',     color: '#f59e0b' },
  heat_boost:       { emoji: '🔥', label: 'Heat Boost',       color: '#f97316' },
  tv_commercial:    { emoji: '📺', label: 'TV Commercial',    color: '#06b6d4' },
  griot_story:      { emoji: '🎙', label: 'Griot Story',      color: '#10b981' },
  tool_sponsor:     { emoji: '🛠', label: 'Tool Sponsorship', color: '#6366f1' },
}

const STATUS_CFG: Record<CampaignStatus, { emoji: string; label: string; color: string }> = {
  active:    { emoji: '🟢', label: 'Active',    color: '#4ade80' },
  scheduled: { emoji: '🕐', label: 'Scheduled', color: '#fbbf24' },
  completed: { emoji: '✅', label: 'Completed', color: 'rgba(255,255,255,.4)' },
  paused:    { emoji: '⏸', label: 'Paused',    color: '#f87171' },
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id:'mc1', name:'Premium Palm Oil — Lagos Market', type:'market_cry', status:'active', budget:5000, spent:2340, reach:4200, taps:890, conversions:142, startDate:'2026-03-28', endDate:'2026-04-10', villages:['commerce','agriculture'], skin:'ise' },
  { id:'mc2', name:'Health Village Billboard', type:'billboard', status:'active', budget:8000, spent:8000, reach:12000, taps:2100, conversions:0, startDate:'2026-04-01', endDate:'2026-04-07', villages:['health'], skin:'all' },
  { id:'mc3', name:'Night Market — Ankara Collection', type:'night_market', status:'scheduled', budget:1200, spent:0, reach:0, taps:0, conversions:0, startDate:'2026-04-05', endDate:'2026-04-12', villages:['fashion','arts'], skin:'egbe' },
  { id:'mc4', name:'Drum Announcement — AfriTech Summit', type:'drum_announcement', status:'completed', budget:1000, spent:1000, reach:18500, taps:3200, conversions:890, startDate:'2026-03-20', endDate:'2026-03-20', villages:['technology'], skin:'ise' },
  { id:'mc5', name:'Heat Boost — My Farm Post', type:'heat_boost', status:'active', budget:500, spent:500, reach:2100, taps:450, conversions:67, startDate:'2026-04-03', endDate:'2026-04-04', villages:['agriculture'], skin:'ise' },
  { id:'mc6', name:'Griot Story — Traditional Medicine', type:'griot_story', status:'completed', budget:2000, spent:2000, reach:9800, taps:1560, conversions:234, startDate:'2026-03-15', endDate:'2026-03-22', villages:['health','spirituality'], skin:'idile' },
]

type FilterTab = 'all' | 'active' | 'scheduled' | 'completed'

export default function AdManagerPage() {
  if (!USE_MOCKS) return <UnderConstruction module="Ads Marketplace" />
  const router = useRouter()
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const [paused, setPaused] = React.useState<Set<string>>(new Set())

  const filtered = filter === 'all' ? MOCK_CAMPAIGNS : MOCK_CAMPAIGNS.filter(c => c.status === filter)

  const totalReach = MOCK_CAMPAIGNS.reduce((s, c) => s + c.reach, 0)
  const totalTaps = MOCK_CAMPAIGNS.reduce((s, c) => s + c.taps, 0)
  const totalConversions = MOCK_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0)
  const totalSpent = MOCK_CAMPAIGNS.reduce((s, c) => s + c.spent, 0)

  const STATS = [
    { emoji: '🌱', label: 'Seeds Planted', value: totalReach.toLocaleString(), sub: 'Total impressions' },
    { emoji: '🌾', label: 'Ears Reached', value: Math.round(totalReach * 0.66).toLocaleString(), sub: 'Unique viewers' },
    { emoji: '🍲', label: 'Pot Taps', value: totalTaps.toLocaleString(), sub: 'Interactions' },
    { emoji: '🫙', label: 'Pots Filled', value: totalConversions.toLocaleString(), sub: 'Conversions' },
  ]

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All Campaigns' },
    { key: 'active', label: '🟢 Active' },
    { key: 'scheduled', label: '🕐 Scheduled' },
    { key: 'completed', label: '✅ Completed' },
  ]

  const QUICK_ACTIONS = [
    { emoji: '🥁', label: 'New Market Cry', desc: 'Appear in feeds', href: '/dashboard/ads/create?type=market_cry' },
    { emoji: '🔥', label: 'Boost a Post', desc: 'Increase heat score', href: '/dashboard/ads/create?type=heat_boost' },
    { emoji: '🏗', label: 'Bid for Billboard', desc: 'Village top banner', href: '/dashboard/ads/create?type=billboard' },
    { emoji: '📺', label: 'TV Commercial', desc: 'Jollof TV break', href: '/dashboard/ads/create?type=tv_commercial' },
  ]

  return (
    <div style={{ minHeight:'100dvh', background:'#07090a', color:'#f0f5ee', fontFamily:'DM Sans,sans-serif' }}>
      {/* Adinkra bg */}
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:0,opacity:.02,backgroundImage:'repeating-linear-gradient(45deg,#d4a017 0px,#d4a017 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px' }} />

      <div style={{ position:'relative',zIndex:1,padding:'16px 16px 100px' }}>
        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:22,fontWeight:900,background:'linear-gradient(135deg,#d4a017,#fbbf24)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>🥁 Market Cry Manager</div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginTop:2 }}>Your Drum Campaigns · Reach Every Village</div>
          </div>
          <button onClick={() => router.push('/dashboard/ads/create')} style={{ padding:'10px 18px',borderRadius:12,background:'linear-gradient(135deg,#1a7c3e,#0f5028)',border:'none',cursor:'pointer',fontSize:12,fontWeight:800,color:'#fff',boxShadow:'0 4px 16px rgba(26,124,62,.4)' }}>+ Create Campaign</button>
        </div>

        {/* Harvest Report Stats */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8 }}>🌾 Harvest Report · All Time</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'14px 12px' }}>
                <div style={{ fontSize:22,marginBottom:2 }}>{s.emoji}</div>
                <div style={{ fontSize:20,fontWeight:900,color:'#fbbf24',fontFamily:'Sora, sans-serif' }}>{s.value}</div>
                <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.5)',marginTop:2 }}>{s.label}</div>
                <div style={{ fontSize:9,color:'rgba(255,255,255,.25)',marginTop:1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cowrie Summary */}
        <div style={{ background:'linear-gradient(135deg,rgba(212,160,23,.08),rgba(212,160,23,.03))',border:'1px solid rgba(212,160,23,.2)',borderRadius:14,padding:'14px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(212,160,23,.6)',textTransform:'uppercase' }}>Total Cowrie Invested</div>
            <div style={{ fontSize:24,fontWeight:900,color:'#fbbf24',fontFamily:'DM Mono,monospace' }}>₡{totalSpent.toLocaleString()}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(74,222,128,.6)' }}>ROI</div>
            <div style={{ fontSize:20,fontWeight:900,color:'#4ade80',fontFamily:'Sora, sans-serif' }}>{totalSpent > 0 ? ((totalConversions / totalSpent) * 100).toFixed(1) : 0}%</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex',gap:6,overflowX:'auto',scrollbarWidth:'none',marginBottom:14 }}>
          {FILTER_TABS.map(t => (
            <div key={t.key} onClick={() => setFilter(t.key)} style={{ flexShrink:0,padding:'6px 14px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',transition:'all .2s',background:filter===t.key?'rgba(212,160,23,.15)':'rgba(255,255,255,.04)',border:`1px solid ${filter===t.key?'rgba(212,160,23,.4)':'rgba(255,255,255,.07)'}`,color:filter===t.key?'#fbbf24':'rgba(255,255,255,.35)' }}>{t.label}</div>
          ))}
        </div>

        {/* Campaign cards */}
        <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
          {filtered.map(c => {
            const tc = TYPE_CFG[c.type]; const sc = STATUS_CFG[c.status]
            const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0
            return (
              <div key={c.id} style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,padding:'14px',position:'relative',overflow:'hidden' }}>
                {/* Accent line */}
                <div style={{ position:'absolute',top:0,left:0,width:4,height:'100%',background:tc.color,borderRadius:'4px 0 0 4px' }} />
                {/* Header */}
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                  <span style={{ padding:'3px 8px',borderRadius:6,fontSize:9,fontWeight:800,background:`${tc.color}20`,color:tc.color }}>{tc.emoji} {tc.label}</span>
                  <span style={{ padding:'3px 8px',borderRadius:6,fontSize:9,fontWeight:700,background:`${sc.color}15`,color:sc.color }}>{sc.emoji} {sc.label}</span>
                  <span style={{ marginLeft:'auto',fontSize:9,color:'rgba(255,255,255,.3)' }}>{c.startDate} → {c.endDate}</span>
                </div>
                {/* Name */}
                <div style={{ fontSize:14,fontWeight:800,color:'#f0f5ee',marginBottom:8,fontFamily:'Sora, sans-serif' }}>{c.name}</div>
                {/* Budget bar */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',marginBottom:4 }}>
                    <span>Cowrie Purse: ₡{c.spent.toLocaleString()} / ₡{c.budget.toLocaleString()}</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height:6,borderRadius:99,background:'rgba(255,255,255,.08)',overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${pct}%`,borderRadius:99,background:`linear-gradient(90deg,${tc.color},${tc.color}88)`,transition:'width .5s ease' }} />
                  </div>
                </div>
                {/* Stats row */}
                <div style={{ display:'flex',gap:12,marginBottom:8 }}>
                  <div><div style={{ fontSize:14,fontWeight:900,color:'#fbbf24',fontFamily:'DM Mono,monospace' }}>{c.reach.toLocaleString()}</div><div style={{ fontSize:8,color:'rgba(255,255,255,.3)' }}>Ears Reached</div></div>
                  <div><div style={{ fontSize:14,fontWeight:900,color:'#f97316',fontFamily:'DM Mono,monospace' }}>{c.taps.toLocaleString()}</div><div style={{ fontSize:8,color:'rgba(255,255,255,.3)' }}>Pot Taps</div></div>
                  <div><div style={{ fontSize:14,fontWeight:900,color:'#4ade80',fontFamily:'DM Mono,monospace' }}>{c.conversions.toLocaleString()}</div><div style={{ fontSize:8,color:'rgba(255,255,255,.3)' }}>Pots Filled</div></div>
                </div>
                {/* Targets */}
                <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:10 }}>
                  {c.villages.map(v => <span key={v} style={{ padding:'2px 7px',borderRadius:6,fontSize:8,fontWeight:700,background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.4)' }}>{v}</span>)}
                  <span style={{ padding:'2px 7px',borderRadius:6,fontSize:8,fontWeight:700,background:'rgba(26,124,62,.12)',color:'#4ade80' }}>Skin: {c.skin}</span>
                </div>
                {/* Actions */}
                <div style={{ display:'flex',gap:8 }}>
                  <button onClick={() => router.push(`/dashboard/ads/${c.id}/report`)} style={{ flex:1,padding:'8px',borderRadius:10,border:'1px solid rgba(212,160,23,.3)',background:'rgba(212,160,23,.08)',color:'#fbbf24',fontSize:10,fontWeight:700,cursor:'pointer' }}>📊 Harvest Report</button>
                  {c.status === 'active' && <button onClick={() => setPaused(p => { const n = new Set(p); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n })} style={{ padding:'8px 14px',borderRadius:10,border:'1px solid rgba(248,113,113,.3)',background: paused.has(c.id) ? 'rgba(74,222,128,.08)' : 'rgba(248,113,113,.08)',color: paused.has(c.id) ? '#4ade80' : '#f87171',fontSize:10,fontWeight:700,cursor:'pointer' }}>{paused.has(c.id) ? '▶ Resume' : '⏸ Pause'}</button>}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding:'32px',textAlign:'center' }}>
              <div style={{ fontSize:40,marginBottom:10 }}>🥁</div>
              <div style={{ fontSize:14,fontWeight:700,color:'rgba(255,255,255,.5)' }}>No campaigns here</div>
              <div style={{ fontSize:11,color:'rgba(255,255,255,.3)',marginTop:4 }}>Create your first Drum Campaign to start reaching villages</div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8 }}>⚡ Quick Actions</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {QUICK_ACTIONS.map(a => (
              <div key={a.label} onClick={() => router.push(a.href)} style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:14,padding:'14px 12px',cursor:'pointer',transition:'all .2s' }}>
                <div style={{ fontSize:24,marginBottom:6 }}>{a.emoji}</div>
                <div style={{ fontSize:12,fontWeight:800,color:'#f0f5ee' }}>{a.label}</div>
                <div style={{ fontSize:9,color:'rgba(255,255,255,.35)',marginTop:2 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
