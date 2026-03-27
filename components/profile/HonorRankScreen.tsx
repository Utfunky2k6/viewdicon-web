'use client'
import * as React from 'react'
import {
  RANK_TIERS, RANK_GROUP_META, XP_SOURCES,
  getRankFromXP, getXPProgress, getTiersByGroup,
  type RankGroup,
} from '@/constants/ranks'

const GROUPS: RankGroup[] = ['Seed', 'Trader', 'Warrior', 'Elder', 'Chief', 'Oba', 'Orisha', 'Legend', 'Eternal']

// ── Floating-emoji animation keyframes injected once ─────────────────────────
const CSS = `
@keyframes floatUp{0%{opacity:0;transform:translateY(0) scale(.6)}50%{opacity:1;transform:translateY(-40px) scale(1.1)}100%{opacity:0;transform:translateY(-80px) scale(.8)}}
@keyframes xpPulse{0%,100%{opacity:.8}50%{opacity:1}}
@keyframes rankGlow{0%,100%{box-shadow:0 0 16px 4px var(--rank-clr,.7c3aed)}50%{box-shadow:0 0 32px 8px var(--rank-clr,.7c3aed)}}
.float-emoji{position:absolute;pointer-events:none;font-size:22px;animation:floatUp 1.6s ease forwards}
`

interface HonorRankScreenProps {
  /** Current user XP (0+) */
  xp?: number
  onClose: () => void
}

export function HonorRankScreen({ xp = 4800, onClose }: HonorRankScreenProps) {
  const [activeGroup, setActiveGroup] = React.useState<RankGroup | null>(null)
  const [floaters, setFloaters] = React.useState<{ id: number; x: number; emoji: string }[]>([])
  const floaterRef = React.useRef(0)

  const { current, next, progress, xpNeeded } = getXPProgress(xp)
  const activePerks = RANK_TIERS.filter(r => r.level <= current.level && r.perk).slice(-5)

  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('hra-css')) {
      const s = document.createElement('style'); s.id = 'hra-css'; s.textContent = CSS; document.head.appendChild(s)
    }
  }, [])

  const spawnFloat = (e: React.MouseEvent, emoji: string) => {
    const id = ++floaterRef.current
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    setFloaters(f => [...f, { id, x, emoji }])
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1700)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.92)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 480, width: '100%', margin: '0 auto', minHeight: '100dvh', background: '#0a0a14', position: 'relative', paddingBottom: 60 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${current.color}33` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: current.color }}>✦ Honor Rank</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Your standing in the village</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >×</button>
        </div>

        {/* Current rank hero */}
        <div
          style={{ margin: '12px 14px', borderRadius: 16, padding: 16, background: `linear-gradient(135deg, ${current.color}22, ${current.color}08)`, border: `1.5px solid ${current.color}55`, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
          onClick={e => spawnFloat(e, current.emoji)}
        >
          {floaters.map(f => (
            <div key={f.id} className="float-emoji" style={{ left: f.x }}>{f.emoji}</div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
              background: `${current.color}22`, border: `2px solid ${current.color}`,
              boxShadow: `0 0 20px ${current.color}55`, flexShrink: 0 }}>
              {current.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em' }}>LEVEL {current.level}</span>
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: `${current.color}22`, color: current.color, fontWeight: 700 }}>{current.group}</span>
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#f0f7f0', lineHeight: 1.1 }}>{current.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{current.subtitle}</div>
              <div style={{ fontSize: 10, color: current.color, fontWeight: 600, marginTop: 4 }}>✓ {current.perk}</div>
            </div>
          </div>

          {/* XP bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>XP Progress</span>
              {next ? (
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{(xpNeeded).toLocaleString()} XP to Level {next.level} · {next.name}</span>
              ) : (
                <span style={{ fontSize: 9, color: current.color, fontWeight: 700 }}>MAX LEVEL ✦</span>
              )}
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${current.color}, ${current.color}bb)`, width: `${progress * 100}%`, transition: 'width .6s ease', animation: 'xpPulse 3s ease-in-out infinite' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: current.color, fontWeight: 700 }}>{xp.toLocaleString()} XP</span>
              {next && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{next.xpRequired.toLocaleString()} XP</span>}
            </div>
          </div>
        </div>

        {/* Active perks */}
        <div style={{ padding: '0 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Active Perks Unlocked</div>
          {activePerks.reverse().map(perk => (
            <div key={perk.level} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: `${perk.color}18`, border: `1px solid ${perk.color}44`, flexShrink: 0 }}>{perk.emoji}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#f0f7f0' }}>{perk.perk}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginLeft: 6 }}>Lvl {perk.level}</span>
              </div>
              <span style={{ fontSize: 9, color: '#4ade80', fontWeight: 700 }}>✓</span>
            </div>
          ))}
        </div>

        {/* XP Earning guide */}
        <div style={{ margin: '0 14px 14px', padding: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>How to Earn XP</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {XP_SOURCES.map(s => (
              <div key={s.action} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                <span style={{ fontSize: 12 }}>{s.emoji}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>{s.action}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24' }}>+{s.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Group selector */}
        <div style={{ padding: '0 14px 10px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>All 100 Tiers</div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
            <button
              onClick={() => setActiveGroup(null)}
              style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${activeGroup === null ? '#fff' : 'rgba(255,255,255,.12)'}`, background: activeGroup === null ? 'rgba(255,255,255,.12)' : 'transparent', color: activeGroup === null ? '#fff' : 'rgba(255,255,255,.4)', transition: 'all .2s' }}
            >All</button>
            {GROUPS.map(g => {
              const meta = RANK_GROUP_META[g]
              const isActive = activeGroup === g
              return (
                <button key={g}
                  onClick={() => setActiveGroup(isActive ? null : g)}
                  style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${isActive ? meta.color : 'rgba(255,255,255,.1)'}`, background: isActive ? `${meta.color}22` : 'transparent', color: isActive ? meta.color : 'rgba(255,255,255,.4)', transition: 'all .2s' }}
                >
                  {meta.emoji} {g}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tier ladder */}
        <div style={{ padding: '0 14px' }}>
          {(activeGroup ? [activeGroup] : GROUPS).map(group => {
            const meta = RANK_GROUP_META[group]
            const tiers = getTiersByGroup(group)
            return (
              <div key={group} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 12px', background: `${meta.color}12`, borderRadius: 10, border: `1px solid ${meta.color}25` }}>
                  <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: meta.color }}>{group}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{meta.description}</div>
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 700 }}>Lv {tiers[0].level}–{tiers[tiers.length-1].level}</span>
                </div>
                {tiers.map(tier => {
                  const isCurrentTier = tier.level === current.level
                  const isUnlocked = tier.level <= current.level
                  return (
                    <div key={tier.level} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 10, marginBottom: 4,
                      background: isCurrentTier ? `${tier.color}18` : isUnlocked ? 'rgba(255,255,255,.03)' : 'transparent',
                      border: `1px solid ${isCurrentTier ? tier.color : isUnlocked ? 'rgba(255,255,255,.07)' : 'transparent'}`,
                      opacity: isUnlocked ? 1 : 0.35,
                      transition: 'all .2s',
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: isCurrentTier ? `${tier.color}25` : 'rgba(255,255,255,.04)', border: `1px solid ${isCurrentTier ? tier.color : 'rgba(255,255,255,.08)'}`, flexShrink: 0 }}>{tier.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isCurrentTier ? tier.color : '#f0f7f0', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tier.name}</span>
                          {isCurrentTier && <span style={{ fontSize: 8, fontWeight: 900, padding: '1px 5px', borderRadius: 99, background: tier.color, color: '#000', letterSpacing: '.06em' }}>YOU</span>}
                        </div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tier.subtitle}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: isUnlocked ? '#4ade80' : 'rgba(255,255,255,.2)' }}>Lv {tier.level}</div>
                        {isUnlocked ? (
                          <div style={{ fontSize: 8, color: '#4ade80' }}>✓ Unlocked</div>
                        ) : (
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,.2)' }}>{tier.xpRequired.toLocaleString()} XP</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
