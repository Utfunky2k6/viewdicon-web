'use client'
import * as React from 'react'
import {
  RANK_TIERS, RANK_GROUP_META, XP_SOURCES, FEATURE_UNLOCKS,
  VILLAGE_LIFE_CONDITIONS, GO_LIVE_TYPES, NAMING_MILESTONES, VIOLATION_CONSEQUENCES,
  getRankFromXP, getXPProgress, getTiersByGroup,
  type RankGroup,
} from '@/constants/ranks'

const GROUPS: RankGroup[] = ['Seed', 'Sprout', 'Trader', 'Warrior', 'Elder', 'Chief', 'Oba', 'Orisha', 'Legend', 'Ancestor', 'Eternal']

// ── Floating-emoji animation keyframes injected once ─────────────────────────
const CSS = `
@keyframes floatUp{0%{opacity:0;transform:translateY(0) scale(.6)}50%{opacity:1;transform:translateY(-40px) scale(1.1)}100%{opacity:0;transform:translateY(-80px) scale(.8)}}
@keyframes xpPulse{0%,100%{opacity:.8}50%{opacity:1}}
@keyframes rankGlow{0%,100%{box-shadow:0 0 16px 4px var(--rank-clr,.7c3aed)}50%{box-shadow:0 0 32px 8px var(--rank-clr,.7c3aed)}}
.float-emoji{position:absolute;pointer-events:none;font-size:22px;animation:floatUp 1.6s ease forwards}
`

type Section = 'ladder' | 'unlocks' | 'xp' | 'conditions'

interface HonorRankScreenProps {
  xp?: number
  onClose: () => void
}

export function HonorRankScreen({ xp = 0, onClose }: HonorRankScreenProps) {
  const [activeGroup, setActiveGroup] = React.useState<RankGroup | null>(null)
  const [section, setSection] = React.useState<Section>('ladder')
  const [floaters, setFloaters] = React.useState<{ id: number; x: number; emoji: string }[]>([])
  const floaterRef = React.useRef(0)

  const { current, next, progress, xpNeeded } = getXPProgress(xp)
  const activePerks = RANK_TIERS.filter(r => r.level <= current.level && r.perk).slice(-5)
  const unlockedFeatures = FEATURE_UNLOCKS.filter(f => f.level <= current.level)
  const lockedFeatures = FEATURE_UNLOCKS.filter(f => f.level > current.level).slice(0, 5)

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
    setTimeout(() => setFloaters(f => f.filter(fx => fx.id !== id)), 1700)
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
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>500-Tier Pan-African System</div>
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
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{xpNeeded.toLocaleString()} XP to Level {next.level} · {next.name}</span>
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

          {/* Naming milestone check */}
          {NAMING_MILESTONES.some(m => m.level === current.level) && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: `${current.color}15`, border: `1px solid ${current.color}33`, borderRadius: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: current.color }}>
                🎉 {NAMING_MILESTONES.find(m => m.level === current.level)?.event}
              </div>
            </div>
          )}
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '0 14px', marginBottom: 12, overflowX: 'auto' }}>
          {([
            { id: 'ladder' as const, label: 'Tier Ladder', emoji: '📊' },
            { id: 'unlocks' as const, label: 'Unlocks', emoji: '🔓' },
            { id: 'xp' as const, label: 'Earn XP', emoji: '⚡' },
            { id: 'conditions' as const, label: 'Village Life', emoji: '🏛' },
          ]).map(s => (
            <button key={s.id}
              onClick={() => setSection(s.id)}
              style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${section === s.id ? current.color : 'rgba(255,255,255,.1)'}`, background: section === s.id ? `${current.color}22` : 'transparent', color: section === s.id ? current.color : 'rgba(255,255,255,.4)', transition: 'all .2s' }}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* ── SECTION: Tier Ladder ───────────────────────────────────────────── */}
        {section === 'ladder' && (
          <>
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

            {/* Group selector */}
            <div style={{ padding: '0 14px 10px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>All 500 Tiers · 11 Groups</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
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

            {/* Tier ladder — show anchor tiers only when viewing all, full when filtered */}
            <div style={{ padding: '0 14px' }}>
              {(activeGroup ? [activeGroup] : GROUPS).map(group => {
                const meta = RANK_GROUP_META[group]
                const tiers = getTiersByGroup(group)
                // When showing all groups, only show every Nth tier to keep it scannable
                const displayTiers = activeGroup ? tiers : tiers.filter((_, i) => i === 0 || i === tiers.length - 1 || i % Math.max(1, Math.floor(tiers.length / 5)) === 0)
                return (
                  <div key={group} style={{ marginBottom: 18 }}>
                    <div
                      onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 12px', background: `${meta.color}12`, borderRadius: 10, border: `1px solid ${meta.color}25`, cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: meta.color }}>{group}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{meta.description}</div>
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 700 }}>Lv {tiers[0].level}–{tiers[tiers.length-1].level}</span>
                      {!activeGroup && <span style={{ fontSize: 12, color: 'rgba(255,255,255,.2)' }}>›</span>}
                    </div>
                    {displayTiers.map(tier => {
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
                              <div style={{ fontSize: 8, color: '#4ade80' }}>✓</div>
                            ) : (
                              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.2)' }}>{tier.xpRequired.toLocaleString()} XP</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {!activeGroup && tiers.length > displayTiers.length && (
                      <button
                        onClick={() => setActiveGroup(group)}
                        style={{ width: '100%', padding: '6px', borderRadius: 8, border: `1px solid ${meta.color}22`, background: 'transparent', color: meta.color, fontSize: 10, fontWeight: 700, cursor: 'pointer', marginBottom: 4 }}
                      >
                        View all {tiers.length} {group} tiers →
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── SECTION: Feature Unlocks ──────────────────────────────────────── */}
        {section === 'unlocks' && (
          <div style={{ padding: '0 14px' }}>
            {/* Unlocked features */}
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Unlocked ({unlockedFeatures.length} / {FEATURE_UNLOCKS.length})
            </div>
            {unlockedFeatures.slice().reverse().map(f => (
              <div key={`${f.level}-${f.name}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, marginBottom: 4, background: 'rgba(74,222,128,.04)', border: '1px solid rgba(74,222,128,.12)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'rgba(74,222,128,.12)', flexShrink: 0 }}>{f.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>{f.name}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{f.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#4ade80' }}>Lv {f.level}</div>
                  <div style={{ fontSize: 8, color: '#4ade80' }}>✓</div>
                </div>
              </div>
            ))}

            {/* Next unlocks */}
            {lockedFeatures.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 16, marginBottom: 10 }}>Coming Next</div>
                {lockedFeatures.map(f => (
                  <div key={`${f.level}-${f.name}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, marginBottom: 4, opacity: 0.4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>{f.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>{f.name}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{f.description}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)' }}>Lv {f.level}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.2)' }}>🔒</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Go Live types */}
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 16, marginBottom: 10 }}>Go Live Stream Types</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {GO_LIVE_TYPES.map(t => {
                const unlocked = current.level >= t.minLevel
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 99, background: unlocked ? 'rgba(74,222,128,.08)' : 'rgba(255,255,255,.03)', border: `1px solid ${unlocked ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.06)'}`, opacity: unlocked ? 1 : 0.4 }}>
                    <span style={{ fontSize: 13 }}>{t.emoji}</span>
                    <span style={{ fontSize: 10, color: unlocked ? '#f0f7f0' : 'rgba(255,255,255,.4)', fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: 9, color: unlocked ? '#4ade80' : 'rgba(255,255,255,.2)', fontWeight: 700 }}>{unlocked ? '✓' : `Lv ${t.minLevel}`}</span>
                  </div>
                )
              })}
            </div>

            {/* Naming milestones */}
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 16, marginBottom: 10 }}>Naming Ceremony Milestones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAMING_MILESTONES.map(m => {
                const reached = current.level >= m.level
                return (
                  <div key={m.level} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: reached ? 'rgba(74,222,128,.04)' : 'transparent', border: reached ? '1px solid rgba(74,222,128,.12)' : '1px solid transparent', opacity: reached ? 1 : 0.35 }}>
                    <span style={{ fontSize: 14 }}>{m.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: reached ? '#f0f7f0' : 'rgba(255,255,255,.4)' }}>{m.event}</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: reached ? '#4ade80' : 'rgba(255,255,255,.2)' }}>Lv {m.level}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ height: 16 }} />
          </div>
        )}

        {/* ── SECTION: Earn XP ──────────────────────────────────────────────── */}
        {section === 'xp' && (
          <div style={{ padding: '0 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>How to Earn XP</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {XP_SOURCES.map(s => (
                <div key={s.action} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.15)', flexShrink: 0 }}>{s.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{s.action}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{s.category}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#fbbf24' }}>+{s.xp}</div>
                </div>
              ))}
            </div>

            {/* Violations */}
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 16, marginBottom: 10 }}>Violation Consequences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {VIOLATION_CONSEQUENCES.map(v => (
                <div key={v.violation} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: v.severity === 'critical' ? 'rgba(239,68,68,.08)' : v.severity === 'major' ? 'rgba(239,68,68,.04)' : 'rgba(255,255,255,.02)', border: `1px solid ${v.severity === 'critical' ? 'rgba(239,68,68,.2)' : v.severity === 'major' ? 'rgba(239,68,68,.1)' : 'rgba(255,255,255,.06)'}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: v.severity === 'critical' ? '#ef4444' : '#f0f7f0' }}>{v.violation}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{v.penalty}</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: v.severity === 'critical' ? '#ef444422' : v.severity === 'major' ? '#ef444411' : 'rgba(255,255,255,.06)', color: v.severity === 'critical' ? '#ef4444' : v.severity === 'major' ? '#f87171' : 'rgba(255,255,255,.4)' }}>{v.severity.toUpperCase()}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 16 }} />
          </div>
        )}

        {/* ── SECTION: Village Life Conditions ──────────────────────────────── */}
        {section === 'conditions' && (
          <div style={{ padding: '0 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>Village Life Conditions</div>
            <div style={{ marginBottom: 8, fontSize: 10, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>
              These conditions govern village membership. Violations reduce your Honor rank.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {VILLAGE_LIFE_CONDITIONS.map((c, i) => {
                const meetsLevel = !('minLevel' in c) || current.level >= (c as any).minLevel
                return (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 12, background: meetsLevel ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.01)', border: `1px solid ${meetsLevel ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.04)'}`, opacity: meetsLevel ? 1 : 0.4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{c.emoji}</span>
                      <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>{c.condition}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 24 }}>
                      <span style={{ fontSize: 9, color: '#f87171', fontWeight: 700 }}>Penalty: {c.violationPenalty}</span>
                      {'minLevel' in c && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>· Requires Lv {(c as any).minLevel}+</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ height: 16 }} />
          </div>
        )}
      </div>
    </div>
  )
}
