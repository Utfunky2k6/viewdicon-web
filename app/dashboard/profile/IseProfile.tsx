'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { getRankFromXP, getXPProgress } from '@/constants/ranks'
import { HonorRankScreen } from '@/components/profile/HonorRankScreen'
import { sessionsApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const ISE_TABS = ['Work', 'Trade Proof', 'Tools', 'Villages'] as const
type IseTab = typeof ISE_TABS[number]

// Mock tools — in production, fetched from GET /api/v1/villages/:villageId/tools
const COMMERCE_TOOLS = [
  { id: '1', name: 'Quick Invoice',       icon: '📋', desc: 'Generate and send professional invoices in 30 seconds', requiredCrest: 1, locked: false },
  { id: '2', name: 'Market Price Checker', icon: '💰', desc: 'Live prices for 50 common market items',              requiredCrest: 0, locked: false },
  { id: '3', name: 'Stock Tracker',        icon: '📦', desc: 'Inventory management with low-stock alerts',           requiredCrest: 2, locked: false },
  { id: '4', name: 'Business Session',     icon: '🤝', desc: 'Open a sealed trade room with escrow',                requiredCrest: 1, locked: false },
  { id: '5', name: 'Call a Runner',        icon: '🚚', desc: 'Dispatch nearest village rider to your location',      requiredCrest: 0, locked: false },
  { id: '6', name: 'Bulk Buyer Board',     icon: '🔒', desc: 'Post bulk supply requests to the village',             requiredCrest: 4, locked: true  },
]

const JOINABLE_VILLAGES = [
  { id: 'agriculture', ancientName: 'NOK',       name: 'Agriculture Village', emoji: '🌾', color: '#1a7c3e', roles: 8, nation: 'Nigeria · Cameroon · Benin' },
  { id: 'arts',        ancientName: 'BIDA',      name: 'Arts Village',        emoji: '🎨', color: '#7c3aed', roles: 8, nation: 'Nupe Kingdom · Nigeria' },
  { id: 'health',      ancientName: 'WABET',     name: 'Health Village',      emoji: '⚕',  color: '#0369a1', roles: 8, nation: 'Ancient Egypt · Nubia' },
  { id: 'energy',      ancientName: 'INGA',      name: 'Energy Village',      emoji: '⚡', color: '#b45309', roles: 8, nation: 'DR Congo · Central Africa' },
]

// Recent work log
const RECENT_JOBS = [
  { id: '1', title: 'Bulk rice order — Mama Agbeke',   status: 'SEALED',    cowrie: '₡850',  time: '2h ago',  emoji: '🌾' },
  { id: '2', title: 'Invoice for 12 fabric rolls',      status: 'DELIVERED', cowrie: '₡1,200', time: '1d ago',  emoji: '📋' },
  { id: '3', title: 'Price check — groundnut oil',       status: 'DONE',     cowrie: '₡0',    time: '2d ago',  emoji: '💰' },
  { id: '4', title: 'Runner dispatch — warehouse run',   status: 'DELIVERED', cowrie: '₡300',  time: '3d ago',  emoji: '🚚' },
  { id: '5', title: 'Stock audit — monthly inventory',   status: 'DONE',     cowrie: '₡0',    time: '5d ago',  emoji: '📦' },
]

const JOB_STATUS_COLORS: Record<string, string> = {
  SEALED: '#d97706', DELIVERED: '#1a7c3e', DONE: '#374151', OPEN: '#2563eb',
}

export function IseProfile() {
  const user = useAuthStore(s => s.user)
  const USER_XP = user?.ubuntuScore ?? user?.honorXp ?? 0
  const [tab, setTab] = React.useState<IseTab>('Work')
  const [showRank, setShowRank] = React.useState(false)

  return (
    <>
      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {ISE_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '9px 4px', fontSize: 10, fontWeight: 700,
              textAlign: 'center', cursor: 'pointer',
              color: tab === t ? '#1a7c3e' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid #1a7c3e' : '2px solid transparent',
              background: 'transparent', transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Work'        && <IseWorkTab xp={USER_XP} onShowRank={() => setShowRank(true)} />}
      {tab === 'Trade Proof' && <IseTradeProofTab />}
      {tab === 'Tools'       && <IseToolsTab />}
      {tab === 'Villages'    && <IseVillagesTab />}

      {showRank && <HonorRankScreen xp={USER_XP} onClose={() => setShowRank(false)} />}
    </>
  )
}

// ── Work tab ─────────────────────────────────────────────────────────────────
function IseWorkTab({ xp, onShowRank }: { xp: number; onShowRank: () => void }) {
  const rank = getRankFromXP(xp)
  const { progress, next } = getXPProgress(xp)
  const router = useRouter()
  const user   = useAuthStore(s => s.user)

  type RealJob = { id:string; title:string; status:string; cowrie:string; time:string; emoji:string }
  const [jobs,       setJobs]       = React.useState<RealJob[]>([])
  const [stats,      setStats]      = React.useState({ completed:0, earned:0, disputes:0 })
  const [loadingJobs, setLoadingJobs] = React.useState(true)

  React.useEffect(() => {
    const SESSION_EMOJI: Record<string, string> = {
      GOODS_SALE:'🌾', SERVICE_DELIVERY:'🤝', DELIVERY_ONLY:'🚚',
      CONSULTING:'💡', DEFAULT:'📋',
    }
    Promise.all([
      sessionsApi.myCompleted().catch((e) => { logApiFailure('profile/ise/completed', e); return { sessions: [], summary: undefined } }),
      sessionsApi.myActive().catch((e) => { logApiFailure('profile/ise/active', e); return { sessions: [] } }),
    ]).then(([completed, active]) => {
      const allCompleted = (completed.sessions ?? []) as Record<string,unknown>[]
      const allActive    = (active.sessions ?? []) as Record<string,unknown>[]

      const totalEarned = allCompleted.reduce((sum, s) => sum + Number(s.cowrieAmount ?? 0), 0)
      const disputes    = allActive.filter(s => s.status === 'DISPUTED').length

      setStats({ completed: allCompleted.length, earned: totalEarned, disputes })

      const recent = [...allActive, ...allCompleted].slice(0, 8).map(s => ({
        id:     String(s.id ?? ''),
        title:  String(s.title ?? s.sessionType ?? 'Business Session'),
        status: String(s.status ?? 'OPEN'),
        cowrie: s.cowrieAmount ? `₡${Number(s.cowrieAmount).toLocaleString()}` : '₡0',
        time:   s.updatedAt ? new Date(s.updatedAt as string).toLocaleDateString() : 'recent',
        emoji:  SESSION_EMOJI[(s.sessionType as string) ?? 'DEFAULT'] ?? '📋',
      }))
      setJobs(recent)
    }).finally(() => setLoadingJobs(false))
  }, [])

  const jobsToShow = jobs.length > 0 ? jobs : RECENT_JOBS

  return (
    <>
      {/* What others see */}
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your Work Identity</div>
      <div style={{ margin: '0 12px 8px', background: '#0d1f12', border: '1px solid #1a7c3e', borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, marginBottom: 6 }}>👁 What Others See in KAZI Mode</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>Your real name, village role, crest tier, job history, and Honour Score. Your social life and clan matters are completely hidden. This is your professional passport.</div>
      </div>

      {/* Honor Rank block */}
      <button
        onClick={onShowRank}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', background: `${rank.color}0a`, border: 'none', borderBottom: '1px solid rgba(255,255,255,.05)', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${rank.color}18`, border: `1.5px solid ${rank.color}44`, flexShrink: 0 }}>{rank.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: rank.color }}>Lv {rank.level} · {rank.name}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontStyle: 'italic' }}>{rank.subtitle}</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden', marginBottom: 3 }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${rank.color}, ${rank.color}aa)`, width: `${progress * 100}%`, borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
            {next ? `${(next.xpRequired - xp).toLocaleString()} XP to Lv ${next.level} · ${next.name}` : 'MAX LEVEL ✦'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10, color: 'rgba(255,255,255,.2)', flexShrink: 0 }}>
          <span>›</span>
          <span style={{ fontSize: 8, color: rank.color, fontWeight: 700, marginTop: 2 }}>Full Ladder</span>
        </div>
      </button>

      {/* Work Record — stat cards (real data) */}
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Work Record</div>
      <div style={{ display: 'flex', gap: 8, padding: '0 12px', overflowX: 'auto' }}>
        {[
          { v: loadingJobs ? '…' : String(stats.completed),                       l: 'Completed\nJobs',  color: '#1a7c3e' },
          { v: loadingJobs ? '…' : String(stats.disputes),                         l: 'Open\nDisputes',   color: '#f87171' },
          { v: loadingJobs ? '…' : `₡${stats.earned.toLocaleString()}`,            l: 'Total\nEarned',    color: '#d4a017' },
          { v: String(user?.ubuntuScore ?? xp ?? 0),                               l: 'Honour\nScore',    color: '#a78bfa' },
        ].map(({ v, l, color }) => (
          <div key={l} style={{ minWidth: 88, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 8px', flexShrink: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{v}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Recent work log */}
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Recent Activity</div>
      <div style={{ padding: '0 12px' }}>
        {loadingJobs && <div style={{ textAlign:'center', padding:'16px', fontSize:12, color:'rgba(255,255,255,.3)' }}>⏳ Loading sessions…</div>}
        {!loadingJobs && jobsToShow.length === 0 && (
          <div style={{ textAlign:'center', padding:'20px 0', fontSize:12, color:'rgba(255,255,255,.3)' }}>No sessions yet — start a trade to build your work record</div>
        )}
        {jobsToShow.map((job) => (
          <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'rgba(26,124,62,.1)', border: '1px solid rgba(26,124,62,.2)', flexShrink: 0 }}>{job.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{job.time}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1a7c3e' }}>{job.cowrie}</div>
              <div style={{ fontSize: 8, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: `${JOB_STATUS_COLORS[job.status] ?? '#374151'}18`, color: JOB_STATUS_COLORS[job.status] ?? '#9ca3af', border: `1px solid ${JOB_STATUS_COLORS[job.status] ?? '#374151'}33`, marginTop: 2, display: 'inline-block' }}>{job.status}</div>
            </div>
          </div>
        ))}
        <button
          onClick={() => router.push('/dashboard/sessions')}
          style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid rgba(26,124,62,.2)', background: 'rgba(26,124,62,.05)', color: '#4ade80', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}
        >
          📋 View All Sessions →
        </button>
      </div>
    </>
  )
}

// ── Routes for each unlocked tool ────────────────────────────────────────────
const TOOL_ROUTES: Record<string, string> = {
  '1': '/dashboard/chat',
  '2': '/dashboard/feed',
  '3': '/dashboard/sessions',
  '4': '/dashboard/chat',
  '5': '/dashboard/chat',
}

// ── Trade Proof tab ───────────────────────────────────────────────────────────
function IseTradeProofTab() {
  const PROOFS = [
    { id:'1', title:'Bulk rice order confirmed', village:'Commerce', date:'Mar 2026', cowrie:'₡850', verified: true, emoji:'🌾' },
    { id:'2', title:'12 fabric rolls delivered', village:'Fashion', date:'Mar 2026', cowrie:'₡1,200', verified: true, emoji:'🧵' },
    { id:'3', title:'Equipment repair — workshop', village:'Builders', date:'Feb 2026', cowrie:'₡400', verified: false, emoji:'🔧' },
    { id:'4', title:'Market price consultation', village:'Commerce', date:'Feb 2026', cowrie:'₡150', verified: true, emoji:'💰' },
  ]
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 12 }}>
        Verified Trade History
      </div>
      {PROOFS.map(p => (
        <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
          <div style={{ width:34,height:34,borderRadius:9,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0 }}>{p.emoji}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#f0f5ee', marginBottom:2 }}>{p.title}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.3)' }}>📍 {p.village} · {p.date}</div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0 }}>
            <span style={{ fontSize:11, fontWeight:800, color:'#4ade80' }}>{p.cowrie}</span>
            <span style={{ fontSize:8, padding:'1px 6px', borderRadius:5, background: p.verified ? 'rgba(74,222,128,.1)': 'rgba(251,191,36,.1)', color: p.verified ? '#4ade80':'#fbbf24', fontWeight:700 }}>
              {p.verified ? '✓ Verified' : '⏳ Pending'}
            </span>
          </div>
        </div>
      ))}
      <div style={{ textAlign:'center', padding:'16px 0 4px', fontSize:10, color:'rgba(255,255,255,.2)' }}>
        Trade proofs are sealed on-chain · Cannot be altered
      </div>
    </div>
  )
}

function IseToolsTab() {
  const router = useRouter()
  const [toastId, setToastId] = React.useState<string|null>(null)
  const handleTool = (tool: typeof COMMERCE_TOOLS[number]) => {
    if (tool.locked) { setToastId(tool.id); setTimeout(() => setToastId(null), 2500); return }
    const href = TOOL_ROUTES[tool.id]
    if (href) router.push(href)
  }
  return (
    <>
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your Village Tools · Commerce</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 12px' }}>
        {COMMERCE_TOOLS.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleTool(tool)}
            style={{
              background: toastId === tool.id ? 'rgba(239,68,68,.08)' : 'var(--bg-card)',
              border: `1px ${tool.locked ? 'dashed #333' : 'solid var(--border)'}`,
              borderRadius: 12, padding: 12,
              cursor: tool.locked ? 'default' : 'pointer',
              opacity: tool.locked ? 0.5 : 1,
              transition: 'all 0.15s',
              transform: toastId === tool.id ? 'scale(0.97)' : 'scale(1)',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: tool.locked ? '#1a1a1a' : '#0d1f12', marginBottom: 8 }}>{tool.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{tool.name}</div>
            <div style={{ fontSize: 10, color: toastId === tool.id ? '#ef4444' : 'var(--text-muted)', lineHeight: 1.4 }}>{toastId === tool.id ? `🔒 Requires Crest ${tool.requiredCrest}` : tool.desc}</div>
            <span style={{ display: 'inline-flex', background: tool.locked ? '#555' : '#1a7c3e', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 9, fontWeight: 700, marginTop: 4 }}>
              {tool.locked ? `Crest ${tool.requiredCrest}` : tool.requiredCrest === 0 ? 'Free' : `Crest ${tool.requiredCrest}+`}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height: 16 }} />
    </>
  )
}

function IseVillagesTab() {
  const router = useRouter()
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set())
  const handleJoin = (id: string) => {
    setJoinedIds(prev => new Set([...prev, id]))
    setTimeout(() => router.push('/dashboard/villages'), 800)
  }
  return (
    <>
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your Primary Village</div>
      <div style={{ padding: '0 12px' }}>
        <div style={{ background: '#0d1f12', border: '1px solid #1a7c3e', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: '#e07b00', flexShrink: 0 }}>🧺</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Commerce Village</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Market Vendor · Ìlú Oníṣòwò · Crest III</div>
          </div>
          <div style={{ fontSize: 10, color: '#1a7c3e', fontWeight: 700, padding: '4px 10px', background: 'rgba(26,124,62,.15)', borderRadius: 99 }}>Active</div>
        </div>
      </div>

      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Villages You Can Join</div>
      <div style={{ padding: '0 12px' }}>
        {JOINABLE_VILLAGES.map((v) => (
          <div key={v.id} style={{ background: 'var(--bg)', border: `1px solid ${joinedIds.has(v.id) ? v.color : 'var(--border)'}`, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, opacity: joinedIds.has(v.id) ? 1 : 0.6, transition: 'all .3s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: v.color, flexShrink: 0 }}>{v.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"Cinzel","Palatino",serif', fontSize: 12, fontWeight: 700, color: v.color, letterSpacing: '0.04em' }}>{v.ancientName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.nation} · {v.roles} roles available</div>
            </div>
            <button
              onClick={() => handleJoin(v.id)}
              style={{ fontSize: 10, color: joinedIds.has(v.id) ? '#4ade80' : 'var(--text-muted)', fontWeight: 700, padding: '3px 8px', border: `1px solid ${joinedIds.has(v.id) ? '#4ade8066' : 'var(--border)'}`, borderRadius: 99, background: joinedIds.has(v.id) ? 'rgba(74,222,128,.08)' : 'transparent', cursor: 'pointer', transition: 'all .3s', flexShrink: 0 }}>
              {joinedIds.has(v.id) ? '✓ Joined' : 'Join'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ margin: '8px 12px 16px', background: '#0a1f0f', border: '1px solid #1a7c3e', borderRadius: 10, padding: 10 }}>
        <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, marginBottom: 3 }}>ℹ Village Rule</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>You have one primary village for your work identity. You can visit other villages but your crest and tools belong to your primary village.</div>
      </div>
    </>
  )
}
