'use client'
// ════════════════════════════════════════════════════════════════════
// Cowrie Flow — Creator Monetization Dashboard  (Phase 4)
// Shows: Balance · Revenue Breakdown · Weekly Payout Timeline
//        Root Planters · Spray Leaderboard · Pot History · Withdraw
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cowrieFlowApi, rootApi } from '@/lib/api'
import { VOCAB } from '@/constants/vocabulary'
import { useAuthStore } from '@/stores/authStore'

// ── Mock summary data (replaced by live fetch when backend is up) ──
const MOCK_SUMMARY = {
  balance:        12500,
  rootCommission:  4200,
  sprayRevenue:    3100,
  potCommission:    890,
  channelAds:       410,
  weeklyPayouts:  [1200, 1800, 900, 2100, 3400, 2600],
}

// ── Empty initial data (fetched from backend) ──────────────────────
const INITIAL_STATS = {
  spraysToday: 0,
  rootCommission: 0,
  activeRoots: 0,
  channelAds: 0,
  balance: 0,
}

const INITIAL_ROOTS = {
  free: 0, paid: 0, ancestral: 0,
  planters: [] as { id: string; name: string; tier: string; avatar: string; since: string; cowrie: number }[],
}

const INITIAL_SPRAYS: { rank: number; name: string; avatar: string; amount: number; stream: string }[] = []

const INITIAL_POT_HISTORY: { id: string; buyer: string; product: string; amount: number; status: string; time: string }[] = []

const ROOT_TIER_CONFIG = {
  FREE_ROOT:      { label: '🌱 Free Root', color: '#6b7280', bg: 'rgba(107,114,128,.15)' },
  PAID_ROOT:      { label: '🌳 Paid Root', color: '#1a7c3e', bg: 'rgba(26,124,62,.15)'  },
  ANCESTRAL_ROOT: { label: '🏛 Ancestral', color: '#d4a017', bg: 'rgba(212,160,23,.15)' },
}

const STATUS_CONFIG = {
  OPEN:      { label: '🔓 Open',      color: '#f59e0b' },
  SEALED:    { label: '🔒 Sealed',    color: '#1a7c3e' },
  DELIVERED: { label: '✅ Delivered', color: '#6b7280' },
}

// ════════════════════════════════════════════════════════════════════
export default function CowrieFlowPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const afroId = (user as any)?.afroId || 'demo-user'
  const [stats, setStats] = React.useState(INITIAL_STATS)
  const [roots, setRoots] = React.useState(INITIAL_ROOTS)
  const [summary, setSummary] = React.useState(MOCK_SUMMARY)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [withdrawAmt, setWithdrawAmt] = React.useState('')
  const [withdrawDone, setWithdrawDone] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'sprays' | 'roots' | 'pots'>('roots')

  // Fetch live data — fall back to mock gracefully
  React.useEffect(() => {
    cowrieFlowApi.stats(afroId).then(res => {
      if (res?.data) setStats(res.data as typeof INITIAL_STATS)
    }).catch(() => {/* use mock */})

    rootApi.rootsInMe().then(res => {
      if (res?.data) {
        const d = res.data
        setRoots(prev => ({ ...prev, free: d.free ?? prev.free, paid: d.paid ?? prev.paid, ancestral: d.ancestral ?? prev.ancestral }))
      }
    }).catch(() => {/* use mock */})

    // Fetch cowrie-flow summary (Phase 4 backend)
    fetch('/api/cowrie-flow/summary/me')
      .then(r => r.json())
      .then((d: typeof MOCK_SUMMARY) => { if (d?.balance !== undefined) setSummary(d) })
      .catch(() => {/* keep mock */})
  }, [])

  const handleWithdraw = () => {
    const amount = Number(withdrawAmt)
    if (!amount || amount > summary.balance) return
    cowrieFlowApi.withdraw(amount).catch(() => {/* offline */})
    setSummary(prev => ({ ...prev, balance: prev.balance - amount }))
    setWithdrawDone(true)
    setTimeout(() => { setWithdrawOpen(false); setWithdrawDone(false); setWithdrawAmt('') }, 1800)
  }

  const totalEarnings = stats.spraysToday + stats.rootCommission + stats.channelAds

  return (
    <div style={{
      minHeight: '100dvh', background: '#080c08',
      color: '#f0f5ee', fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
      paddingBottom: 90,
    }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(8,12,8,.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212,160,23,.12)', padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={() => router.back()} style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,.06)', color: '#f0f5ee', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 17, fontWeight: 900, fontFamily: "'Sora', sans-serif",
            background: 'linear-gradient(90deg, #fbbf24, #d4a017)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            🌊 {VOCAB.cowrieFlow}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em' }}>
            CREATOR MONETIZATION DASHBOARD
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/jollof/create')}
          style={{
            padding: '6px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(26,124,62,.2)', color: '#4ade80',
            fontSize: 11, fontWeight: 700,
          }}
        >
          {VOCAB.goLive}
        </button>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Balance Card ────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2a1a, #0d1a0d)',
          border: '1px solid rgba(212,160,23,.25)', borderRadius: 20, padding: 18,
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '.08em', marginBottom: 6 }}>
            {VOCAB.balance.toUpperCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Sora', sans-serif", color: '#fbbf24' }}>
              🐚 {summary.balance.toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>Cowrie</span>
          </div>
          <button
            onClick={() => setWithdrawOpen(true)}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #d4a017, #b8860b)',
              color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '.02em',
            }}
          >
            {VOCAB.withdraw} 🏧
          </button>
        </div>

        {/* ── Revenue Breakdown (2×2 grid + ad row) ────────────── */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em', marginBottom: 8 }}>
            THIS MONTH · REVENUE BREAKDOWN
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {([
              { label: VOCAB.rootCommission, value: summary.rootCommission,  color: '#1a7c3e', icon: '🌳' },
              { label: VOCAB.sprayRevenue,   value: summary.sprayRevenue,    color: '#7c3aed', icon: '💸' },
              { label: VOCAB.potCommission,  value: summary.potCommission,   color: '#d4a017', icon: '🫙' },
              { label: VOCAB.channelAds,     value: summary.channelAds,      color: '#0369a1', icon: '📢' },
            ] as { label: string; value: number; color: string; icon: string }[]).map(card => (
              <div key={card.label} style={{
                padding: '14px 14px',
                background: `${card.color}12`,
                border: `1px solid ${card.color}28`,
                borderRadius: 16,
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{card.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: card.color }}>
                  🐚 {card.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.38)', fontWeight: 700, marginTop: 3, letterSpacing: '.04em' }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Ad Revenue CTA ── */}
          <button
            onClick={() => router.push('/dashboard/ads')}
            style={{
              marginTop: 10, width: '100%', padding: '14px 0',
              borderRadius: 14, border: '1px solid rgba(212,160,23,.25)',
              background: 'linear-gradient(135deg,rgba(212,160,23,.08),rgba(212,160,23,.02))',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>🥁</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24', fontFamily: "'Sora', sans-serif" }}>
              Manage Market Cries
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
              {'\u2192'}
            </span>
          </button>
        </div>

        {/* ── Weekly Payout Timeline (div-based bar chart) ─────── */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em', marginBottom: 10 }}>
            {VOCAB.weeklyPayout.toUpperCase()} · LAST 6 WEEKS
          </div>
          <div style={{
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 16, padding: '14px 12px',
          }}>
            {(() => {
              const max = Math.max(...summary.weeklyPayouts, 1)
              const weekLabels = ['W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'This\nWeek']
              return (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
                  {summary.weeklyPayouts.map((val, i) => {
                    const pct = (val / max) * 100
                    const isLatest = i === summary.weeklyPayouts.length - 1
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ fontSize: 8, color: '#d4a017', fontWeight: 800, whiteSpace: 'nowrap', opacity: isLatest ? 1 : 0.6 }}>
                          {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
                        </div>
                        <div style={{
                          width: '100%',
                          height: `${pct}%`,
                          minHeight: 6,
                          borderRadius: '4px 4px 2px 2px',
                          background: isLatest
                            ? 'linear-gradient(180deg, #fbbf24, #d4a017)'
                            : 'rgba(212,160,23,.3)',
                          border: isLatest ? '1px solid rgba(212,160,23,.5)' : 'none',
                          transition: 'height .4s ease',
                        }} />
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                          {weekLabels[i]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        {/* ── Today at a Glance ────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em', marginBottom: 8 }}>
            TODAY AT A GLANCE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: VOCAB.sprayRevenue, value: `🐚 ${stats.spraysToday.toLocaleString()}`, color: '#7c3aed', icon: '💸' },
              { label: VOCAB.rootCommission, value: `🐚 ${stats.rootCommission.toLocaleString()}`, color: '#1a7c3e', icon: '🌳' },
              { label: 'Active Roots', value: stats.activeRoots.toLocaleString(), color: '#d4a017', icon: '🌱' },
              { label: VOCAB.channelAds, value: `🐚 ${stats.channelAds.toLocaleString()}`, color: '#0369a1', icon: '📢' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: `${stat.color}10`,
                border: `1px solid ${stat.color}25`,
                borderRadius: 14, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 8, padding: '10px 14px',
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Total earned today</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#fbbf24' }}>🐚 {totalEarnings.toLocaleString()}</span>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {([
            { key: 'roots' as const, label: '🌳 Root Planters' },
            { key: 'sprays' as const, label: '💸 Spray Board' },
            { key: 'pots' as const, label: '🫙 Pot History' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '9px 4px', border: 'none', cursor: 'pointer',
                background: 'transparent', fontSize: 10, fontWeight: 700,
                color: activeTab === tab.key ? '#fbbf24' : 'rgba(255,255,255,.3)',
                borderBottom: activeTab === tab.key ? '2px solid #d4a017' : '2px solid transparent',
                transition: 'all .2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Root Planters Tab ─────────────────────────────────── */}
        {activeTab === 'roots' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Tier totals */}
            <div style={{ display: 'flex', gap: 6 }}>
              {([
                { tier: 'FREE_ROOT' as const, count: roots.free },
                { tier: 'PAID_ROOT' as const, count: roots.paid },
                { tier: 'ANCESTRAL_ROOT' as const, count: roots.ancestral },
              ]).map(({ tier, count }) => {
                const cfg = ROOT_TIER_CONFIG[tier]
                return (
                  <div key={tier} style={{
                    flex: 1, padding: '8px 6px', borderRadius: 10,
                    background: cfg.bg, border: `1px solid ${cfg.color}30`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: cfg.color }}>{count}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{cfg.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Recent planters list */}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', marginTop: 4 }}>
              RECENT PLANTERS
            </div>
            {roots.planters.map(planter => {
              const cfg = ROOT_TIER_CONFIG[planter.tier as keyof typeof ROOT_TIER_CONFIG]
              return (
                <div key={planter.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)',
                }}>
                  <span style={{ fontSize: 24 }}>{planter.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{planter.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>
                      {cfg.label} · {planter.since}
                    </div>
                  </div>
                  {planter.cowrie > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24' }}>
                      🐚 {planter.cowrie.toLocaleString()}
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', textAlign: 'right' }}>/month</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Spray Leaderboard Tab ─────────────────────────────── */}
        {activeTab === 'sprays' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em' }}>
              TOP SPRAYERS THIS WEEK
            </div>
            {INITIAL_SPRAYS.map(sprayer => (
              <div key={sprayer.rank} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12,
                background: sprayer.rank === 1 ? 'rgba(212,160,23,.08)' : 'rgba(255,255,255,.03)',
                border: sprayer.rank === 1 ? '1px solid rgba(212,160,23,.25)' : '1px solid rgba(255,255,255,.05)',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: sprayer.rank === 1 ? '#d4a017' : sprayer.rank === 2 ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900,
                  color: sprayer.rank === 1 ? '#0a0f0b' : '#fff',
                }}>
                  {sprayer.rank}
                </span>
                <span style={{ fontSize: 22 }}>{sprayer.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{sprayer.name}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{sprayer.stream}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#7c3aed' }}>
                  💸 {sprayer.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pot History Tab ───────────────────────────────────── */}
        {activeTab === 'pots' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em' }}>
              COMMERCE FROM STREAM
            </div>
            {INITIAL_POT_HISTORY.map(pot => {
              const statusCfg = STATUS_CONFIG[pot.status as keyof typeof STATUS_CONFIG]
              return (
                <div key={pot.id} style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{pot.product}</div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                      color: statusCfg.color, background: `${statusCfg.color}18`,
                    }}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                      Buyer: {pot.buyer} · {pot.time}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#fbbf24' }}>
                      🐚 {pot.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Withdraw Modal ─────────────────────────────────────── */}
      {withdrawOpen && (
        <div
          onClick={() => setWithdrawOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111a11', borderRadius: '28px 28px 0 0',
              padding: '24px 20px 40px', maxWidth: 480, width: '100%', margin: '0 auto',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>
              🏧 {VOCAB.withdraw}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>
              Available: 🐚 {summary.balance.toLocaleString()}
            </div>

            {withdrawDone ? (
              <div style={{
                padding: 20, borderRadius: 14, textAlign: 'center',
                background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.3)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>
                  Cowrie is flowing!
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
                  Transfer initiated within 24–48 hours.
                </div>
              </div>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Amount (Cowrie)"
                  value={withdrawAmt}
                  onChange={e => setWithdrawAmt(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 14, marginBottom: 12,
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                    color: '#f0f5ee', fontSize: 16, fontWeight: 700,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[1000, 2500, 5000, 10000].map(preset => (
                    <button key={preset} onClick={() => setWithdrawAmt(String(preset))} style={{
                      flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.6)',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {(preset / 1000).toFixed(preset < 1000 ? 0 : 0)}K
                    </button>
                  ))}
                </div>
                <button onClick={handleWithdraw} style={{
                  width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                  color: '#fff', fontSize: 14, fontWeight: 800,
                }}>
                  {VOCAB.withdrawConfirm}
                </button>
                <button onClick={() => setWithdrawOpen(false)} style={{
                  width: '100%', padding: '10px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'transparent', color: 'rgba(255,255,255,.35)', fontSize: 12, marginTop: 4,
                }}>
                  {VOCAB.withdrawCancel}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
