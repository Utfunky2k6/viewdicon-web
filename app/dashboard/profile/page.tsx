'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSkinStore, SKIN_META } from '@/stores/skinStore'
import { useAuthStore } from '@/stores/authStore'
import { SkinSwitcher } from '@/components/ui/SkinSwitcher'
import { IseProfile } from './IseProfile'
import { EgbeProfile } from './EgbeProfile'
import { IdileProfile } from './IdileProfile'
import { HonorRankScreen } from '@/components/profile/HonorRankScreen'
import { RootPlantingScreen } from '@/components/profile/RootPlantingScreen'
import { KumbukaTimeline } from '@/components/profile/KumbukaTimeline'
import { getRankFromXP, getXPProgress } from '@/constants/ranks'
import { authApi } from '@/lib/api'
import { ALL_VILLAGES } from '@/lib/villages-data'

// ── Skin banner style configurations (no hardcoded user data) ──────────────
const SKIN_BANNER: Record<string, {
  gradient: string
  pattern: string
  avatarBg: string
  avatarBorder: string
}> = {
  WORK: {
    gradient: 'linear-gradient(160deg, #041a08 0%, #0a2a12 40%, #1a7c3e 100%)',
    pattern: 'repeating-linear-gradient(45deg,rgba(26,124,62,.08) 0,rgba(26,124,62,.08) 1px,transparent 0,transparent 50%)',
    avatarBg: '#1a7c3e',
    avatarBorder: '#4ade80',
  },
  SOCIAL: {
    gradient: 'linear-gradient(160deg, #1a0800 0%, #3d1c00 40%, #d97706 100%)',
    pattern: 'repeating-linear-gradient(-45deg,rgba(217,119,6,.07) 0,rgba(217,119,6,.07) 1px,transparent 0,transparent 50%)',
    avatarBg: 'linear-gradient(135deg,#d97706,#92400e)',
    avatarBorder: '#fbbf24',
  },
  CLAN: {
    gradient: 'linear-gradient(160deg, #0a0118 0%, #1e0645 40%, #7c3aed 100%)',
    pattern: 'repeating-linear-gradient(30deg,rgba(124,58,237,.06) 0,rgba(124,58,237,.06) 1px,transparent 0,transparent 50%)',
    avatarBg: '#7c3aed',
    avatarBorder: '#a78bfa',
  },
}

// ── Rank ring around avatar ────────────────────────────────────────────────
function RankRing({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <svg
      width={size + 12}
      height={size + 12}
      style={{ position: 'absolute', top: -(6), left: -(6), pointerEvents: 'none' }}
    >
      <circle
        cx={(size + 12) / 2}
        cy={(size + 12) / 2}
        r={size / 2 + 4}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray="6 4"
        opacity="0.8"
      >
        <animateTransform attributeName="transform" attributeType="XML" type="rotate" from={`0 ${(size+12)/2} ${(size+12)/2}`} to={`360 ${(size+12)/2} ${(size+12)/2}`} dur="8s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// ── Afro-ID Card ──────────────────────────────────────────────────────────
function AfroIdCard() {
  const { user } = useAuthStore()
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // user === null means still loading from store; user present but no afroId = truly missing
  const isLoading = user === null
  const hasAfroId = !!user?.afroId?.raw

  const raw     = user?.afroId?.raw     ?? ''
  const masked  = isLoading ? '••••-••••-••••' : hasAfroId ? (user?.afroId?.masked ?? '••••-••••-••••') : '—'
  const country = user?.afroId?.country ?? ''
  const tribe   = user?.afroId?.tribe   ?? ''
  const numeric = user?.afroId?.numeric ?? ''

  const handleCopy = () => {
    navigator.clipboard?.writeText(raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ margin: '0 12px 20px', background: '#0a1a0e', border: '1px solid rgba(26,124,62,.35)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(26,124,62,.2), rgba(26,124,62,.08))', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(26,124,62,.2)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(26,124,62,.25)', border: '1px solid rgba(26,124,62,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🛡</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', letterSpacing: '.06em' }}>Sovereign Identity (Afro-ID)</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Private · Never share publicly</div>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: isLoading ? 14 : 18, fontWeight: 800,
          color: isLoading ? 'rgba(74,222,128,.25)' : revealed ? '#4ade80' : 'rgba(74,222,128,.5)',
          letterSpacing: '.12em', textAlign: 'center',
          background: 'rgba(0,0,0,.3)', borderRadius: 10,
          padding: '10px 0', marginBottom: 10,
          transition: 'color .3s',
          animation: isLoading ? 'pulse 1.5s ease-in-out infinite' : undefined,
        }}>
          {isLoading ? 'Loading...' : revealed ? raw : masked}
        </div>
        {revealed && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {([['Country', country], ['Tribe', tribe], ['Numeric', numeric]] as [string,string][]).map(([label, val]) => (
              <div key={label} style={{ flex: 1, background: 'rgba(26,124,62,.08)', border: '1px solid rgba(26,124,62,.18)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 700, color: '#f0f7f0' }}>{val}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { if (!isLoading && hasAfroId) setRevealed(r => !r) }}
            disabled={isLoading || !hasAfroId}
            style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: isLoading || !hasAfroId ? 'rgba(255,255,255,.25)' : '#f0f7f0', fontSize: 11, fontWeight: 700, cursor: isLoading || !hasAfroId ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Loading...' : !hasAfroId ? 'AfroID not assigned' : revealed ? '🙈 Hide ID' : '👁 Reveal Full ID'}
          </button>
          {revealed && (
            <button onClick={handleCopy} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', background: copied ? '#166534' : '#1a7c3e', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background .2s' }}>
              {copied ? '✓ Copied!' : '📋 Copy ID'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Naming Ceremony Identity Card ─────────────────────────────────────────
function CeremonyCard() {
  const { user } = useAuthStore()
  const rows: { emoji: string; label: string; value?: string }[] = [
    { emoji: '📿', label: 'Heritage', value: user?.heritage },
    { emoji: '🌍', label: 'Ancestral Nation', value: user?.ancestralNation },
    { emoji: '🪘', label: 'Ethnic Group', value: user?.ethnicGroup },
    { emoji: '🔗', label: 'Clan / Lineage', value: user?.clanLineage },
    { emoji: '🌳', label: 'State / Region', value: user?.originState },
    { emoji: '🛖', label: 'Origin Village', value: user?.originVillage },
    { emoji: '🌱', label: 'Birth Season', value: user?.birthSeason },
    { emoji: '👩', label: "Mother's Name", value: user?.motherName },
    { emoji: '👨', label: "Father's Name", value: user?.fatherName },
    { emoji: '🦁', label: 'Totem Animal', value: user?.totemAnimal },
    { emoji: '🌍', label: 'Country', value: user?.residenceCountry },
    { emoji: '🏙', label: 'City', value: user?.residenceCity },
    { emoji: '🛠', label: 'Occupation', value: user?.occupation },
  ].filter(r => r.value)

  if (rows.length === 0) return null

  return (
    <div style={{ margin: '0 12px 20px', background: '#0a1a0e', border: '1px solid rgba(212,160,23,.35)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(212,160,23,.2), rgba(212,160,23,.08))', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(212,160,23,.2)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(212,160,23,.25)', border: '1px solid rgba(212,160,23,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📿</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#d4a017', letterSpacing: '.06em' }}>Naming Ceremony Identity</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Your roots, your people, your path</div>
        </div>
      </div>
      <div style={{ padding: '8px 14px 12px' }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
            <span style={{ fontSize: 14, width: 22, textAlign: 'center', flexShrink: 0 }}>{r.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', minWidth: 90, flexShrink: 0 }}>{r.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f0f7f0', textAlign: 'right', flex: 1 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Profile Page ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { activeSkin, skinColors } = useSkinStore()
  const { user, setUser } = useAuthStore()
  const router = useRouter()
  const [showRank,  setShowRank]  = React.useState(false)
  const [showRoots, setShowRoots] = React.useState(false)

  // Real XP from user's ubuntu/honor score
  const xp = user?.ubuntuScore ?? user?.honorXp ?? 0

  // Fetch real user data from backend — merge with existing (don't overwrite ceremony data)
  React.useEffect(() => {
    async function fetchMe() {
      try {
        const me = await authApi.me()
        if (me && typeof me === 'object') {
          const prev = useAuthStore.getState().user
          if (!prev) { setUser(me); return }
          const merged: Record<string, unknown> = { ...prev }
          for (const [k, v] of Object.entries(me as Record<string, unknown>)) {
            if (v !== null && v !== undefined && v !== '') merged[k] = v
          }
          setUser(merged)
        }
      } catch {
        // Backend offline or not authenticated — use cached store data
      }
    }
    fetchMe()
  }, [setUser])

  const rank = getRankFromXP(xp)
  const { progress } = getXPProgress(xp)

  const skinKey  = activeSkin === 'CLAN' ? 'CLAN' : activeSkin === 'SOCIAL' ? 'SOCIAL' : 'WORK'
  const meta     = SKIN_META[activeSkin]
  const banner   = SKIN_BANNER[skinKey]
  const isGhost  = activeSkin === 'CLAN'

  // Dynamic user data — real from auth store, graceful fallback
  const displayName = isGhost
    ? '■■■■■■■■'
    : (user?.displayName || user?.handle || 'Sovereign')

  const displayHandle = isGhost
    ? 'Hidden from the world · Clan only'
    : user?.handle
      ? `@${user.handle.replace(/^@/, '')}`
      : '@citizen'

  const heritageLabel = user?.heritageCircle === 'WEST_AFRICA' ? '🌍 Circle I · Continental'
    : user?.heritageCircle === 'DIASPORA' ? '🗺 Circle II · Diaspora'
    : user?.heritageCircle ? '🤝 Circle III · Ally'
    : null

  // Resolve village name and role label from village data
  const userVillage = user?.villageId ? ALL_VILLAGES.find(v => v.id === user.villageId) : null
  const userRoleLabel = userVillage && user?.roleKey
    ? userVillage.roles.find(r => r.key === user.roleKey)?.name ?? user.roleKey
    : null

  const displayTags = isGhost
    ? ['🪘 Clan Member', '🔮 Elder Standing', '🌫 Ghost Active']
    : [
        heritageLabel,
        userVillage ? `${userVillage.emoji} ${userVillage.name}` : null,
        userRoleLabel ? `🪘 ${userRoleLabel}` : null,
        user?.heritage ? `📿 ${user.heritage}` : null,
        user?.tribe ? `🌿 ${user.tribe}` : null,
        user?.occupation ? `🛠 ${user.occupation}` : null,
        `🛡 Nkisi ${user?.nkisiState || 'GREEN'}`,
      ].filter(Boolean) as string[]

  // Stats: always real zeros until backend provides data (no fake numbers)
  const workStats: { v: string; l: string; tappable?: boolean }[] = [
    { v: '0',  l: 'Jobs Done' },
    { v: String(user?.ringCounts?.ring1 ?? 0), l: 'Roots', tappable: true },
    { v: String(user?.ubuntuScore ?? 0),  l: 'Honour' },
    { v: '₡0', l: 'Earned' },
  ]
  const socialStats: { v: string; l: string; tappable?: boolean }[] = [
    { v: String(user?.ringCounts?.ring1 ?? 0), l: '🔥 Ìdílé\nHearth' },
    { v: String(user?.ringCounts?.ring2 ?? 0), l: '🤝 Ẹgbẹ́\nAge-Set' },
    { v: String(user?.ringCounts?.ring3 ?? 0), l: '🏘 Ìlú\nVillage' },
    { v: String(user?.ringCounts?.ring4 ?? 0), l: '🌍 Ìjọba\nNation' },
  ]
  const clanStats: { v: string; l: string; tappable?: boolean }[] = [
    { v: '0',      l: 'Family\nCircle' },
    { v: '—',      l: 'Quorum\nActive' },
    { v: 'Secure', l: 'Vault\nStatus' },
  ]
  const displayStats = skinKey === 'SOCIAL' ? socialStats : skinKey === 'CLAN' ? clanStats : workStats

  // Avatar: first letter of display name, or emoji for social/clan
  const avatarContent = activeSkin === 'WORK'
    ? (user?.displayName?.[0]?.toUpperCase() || 'S')
    : activeSkin === 'SOCIAL' ? '🎭'
    : '🏛'

  const handleLogout = async () => {
    // 1. Call backend to invalidate refresh token
    try { await authApi.logout() } catch { /* ok if fails */ }
    // 2. Clear zustand store (in-memory + persisted)
    useAuthStore.getState().logout()
    // 3. Clear all localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('afk-auth')
      localStorage.removeItem('afk_token')
      localStorage.removeItem('afk-ceremony-state')
      localStorage.removeItem('village-store')
    }
    // 4. Clear all auth cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'afk_token=; Max-Age=0; path=/'
      document.cookie = 'afk_ceremony_done=; Max-Age=0; path=/'
    }
    router.push('/login')
  }

  return (
    <div className="animate-fade-in">
      {/* ── Pan-African Kente top stripe ── */}
      <div aria-hidden="true" style={{ height: 4, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)', flexShrink: 0 }} />

      {/* ── Adinkra Pattern Banner + Avatar ───────────────────────────────── */}
      <div style={{ position: 'relative', background: banner.gradient, overflow: 'hidden', paddingBottom: 8 }}>
        {/* Adinkra Gye Nyame overlay */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.045, backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3Cpath d='M22 22 Q14 14 14 22' stroke-width='0.9'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }} />
        {/* Diagonal stripe accent (skin-specific) */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: banner.pattern, backgroundSize: '18px 18px', pointerEvents: 'none', zIndex: 0 }} />
        {/* Decorative circle */}
        <div style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', width: 170, height: 170, borderRadius: '50%', background: `${meta.color}08`, border: `1px solid ${meta.color}18`, pointerEvents: 'none' }} />

        {/* Skin switcher pill */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-end', padding: '10px 14px 0' }}>
          <SkinSwitcher variant="compact" />
        </div>

        {/* Avatar row */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', gap: 14, padding: '8px 16px 14px' }}>
          {/* Avatar + rank ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff',
              background: banner.avatarBg,
              border: `2.5px solid ${banner.avatarBorder}`,
              filter: isGhost ? 'blur(2px) brightness(.7)' : undefined,
              position: 'relative',
            }}>
          {activeSkin === 'WORK' ? avatarContent : activeSkin === 'SOCIAL' ? '🪘' : '🛖'}
              {/* Crest badge — from user data */}
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#000', background: '#d4a017', border: '2px solid #0a0a14', zIndex: 2 }}>{user?.crestLevel ? 'I'.repeat(Math.min(user.crestLevel, 5)) : 'I'}</div>
            </div>
            <RankRing color={rank.color} size={68} />
          </div>

          {/* Name + handle + tags */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isGhost && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.4)', borderRadius: 99, padding: '2px 8px', fontSize: 9, color: '#a78bfa', fontWeight: 700, marginBottom: 4, letterSpacing: '.04em' }}>🌫 Ghost Power Active</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: isGhost ? 'rgba(255,255,255,.4)' : '#f0f7f0', filter: isGhost ? 'blur(0.5px)' : undefined, lineHeight: 1.2, fontFamily: 'Sora, sans-serif' }}>{displayName}</div>
              {!isGhost && (
                <button
                  onClick={() => setShowRank(true)}
                  style={{ padding: '2px 9px', borderRadius: 99, background: `${rank.color}22`, border: `1px solid ${rank.color}55`, color: rank.color, fontSize: 10, fontWeight: 800, cursor: 'pointer', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3, lineHeight: 1.6 }}
                >
                  {rank.emoji} {rank.name}
                </button>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>{displayHandle}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {displayTags.map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 99, padding: '2px 9px', fontSize: 10, color: '#fff', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 0, padding: '0 12px 0', marginBottom: 10 }}>
          {displayStats.map(({ v, l, tappable }) => (
            <button
              key={l}
              onClick={() => { if (tappable && l === 'Roots') setShowRoots(true) }}
              style={{
                flex: 1, textAlign: 'center', padding: '10px 2px',
                background: tappable ? 'rgba(255,255,255,.06)' : 'transparent',
                border: tappable ? '1px solid rgba(255,255,255,.1)' : 'none',
                borderRadius: tappable ? 10 : 0,
                cursor: tappable ? 'pointer' : 'default',
                margin: tappable ? '0 2px' : 0,
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f0f7f0', lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', marginTop: 3, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{l}{tappable ? ' →' : ''}</div>
            </button>
          ))}
        </div>
        {/* Kente divider — bottom of banner */}
        <div aria-hidden="true" style={{ height: 3, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)', position: 'relative', zIndex: 1 }} />
      </div>

      {/* ── Honor Rank block ─────────────────────────────────────────────── */}
      {activeSkin !== 'CLAN' && (
        <button
          onClick={() => setShowRank(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            margin: '8px 0 0', padding: '12px 16px',
            background: `linear-gradient(135deg, ${rank.color}14, ${rank.color}06)`,
            border: `1px solid ${rank.color}30`,
            borderRadius: 0, cursor: 'pointer', textAlign: 'left',
            transition: 'background .2s',
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${rank.color}20`, border: `1.5px solid ${rank.color}66`, flexShrink: 0 }}>{rank.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: rank.color }}>Level {rank.level}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{rank.name}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontStyle: 'italic' }}>{rank.subtitle}</span>
            </div>
            {/* XP progress bar */}
            <div style={{ height: 5, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${rank.color}, ${rank.color}bb)`, width: `${progress * 100}%`, borderRadius: 99, transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 3 }}>✓ {rank.perk}</div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', flexShrink: 0 }}>›</div>
        </button>
      )}

      {/* ── Skin-specific profile content ────────────────────────────────── */}
      {activeSkin === 'WORK'   && <IseProfile />}
      {activeSkin === 'SOCIAL' && <EgbeProfile />}
      {activeSkin === 'CLAN'   && <IdileProfile />}

      {/* ── Kumbuka Memory Timeline — visible across all skins ───────────── */}
      <KumbukaTimeline userId={user?.id ?? ''} />

      {/* ── Account Section ──────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 0' }}>
        <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Account
        </div>
        <AfroIdCard />
        <CeremonyCard />

        {/* ── Village Badge + Cowries ────────────────────────────────── */}
        {(userVillage || true) && (() => {
          const cowrieBalance: number = (() => {
            try { return Number(localStorage.getItem('cowrie_balance') ?? 0) || 0 } catch { return 0 }
          })()
          return (
            <div style={{ margin: '0 12px 16px', display: 'flex', gap: 8 }}>
              {/* Village badge */}
              <div style={{
                flex: 1, background: userVillage ? `${userVillage.color}10` : 'rgba(255,255,255,.04)',
                border: `1px solid ${userVillage ? userVillage.color + '35' : 'rgba(255,255,255,.12)'}`,
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 22 }}>{userVillage?.emoji || '🏘'}</span>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Village</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: userVillage?.color || '#f0f7f0', marginTop: 1, fontFamily: '"Cinzel","Palatino",serif' }}>
                    {userVillage ? (userVillage.ancientName || userVillage.name) : 'No village yet'}
                  </div>
                  {userRoleLabel && (
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{userRoleLabel}</div>
                  )}
                </div>
              </div>
              {/* Cowries */}
              <div style={{
                flex: 1, background: 'rgba(212,160,23,.08)', border: '1px solid rgba(212,160,23,.25)',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 22 }}>🐚</span>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(212,160,23,.5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Cowries</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#fbbf24', fontFamily: 'DM Mono, monospace', marginTop: 1 }}>
                    ₡{cowrieBalance.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Recent Tools Used ─────────────────────────────────────────── */}
        {(() => {
          const recentTools: { toolKey: string; toolName: string; icon: string; ts: number }[] = (() => {
            try {
              const raw = localStorage.getItem('tool_sessions_log')
              if (!raw) return []
              const arr = JSON.parse(raw)
              return Array.isArray(arr) ? arr.slice(0, 5) : []
            } catch { return [] }
          })()
          if (recentTools.length === 0) return null
          return (
            <div style={{ margin: '0 12px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                🛠 Recent Tools
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
                {recentTools.map((t, i) => (
                  <div key={`${t.toolKey}-${i}`} style={{
                    flexShrink: 0, background: '#0a1a0e', border: '1px solid rgba(26,124,62,.25)',
                    borderRadius: 12, padding: '8px 10px', textAlign: 'center', minWidth: 60,
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon || '🛠'}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.5)', lineHeight: 1.3, whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.toolName || t.toolKey}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Village Transfer link ─────────────────────────────────────── */}
        {userVillage && (
          <div style={{ margin: '0 12px 12px', textAlign: 'center' }}>
            <button
              onClick={() => router.push('/dashboard/villages/transfer')}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 10, cursor: 'pointer', padding: '8px 20px',
                color: 'rgba(255,255,255,.35)', fontSize: 11, fontWeight: 600,
                transition: 'color .2s',
              }}
            >
              🔄 Transfer Village
            </button>
          </div>
        )}

        {/* ── Odin · Wisdom Oracle ── */}
        <div style={{ margin: '20px 16px', padding: '20px', borderRadius: 20, background: 'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(76,29,149,0.08))', border: '1px solid rgba(167,139,250,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>👁️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#a78bfa', fontFamily: "'Space Grotesk',sans-serif" }}>Odin · All-Father</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>Wisdom · Heritage · Career Oracle</div>
            </div>
            <a href="/dashboard/ai/odin" style={{ marginLeft: 'auto', fontSize: 10, color: '#a78bfa', textDecoration: 'none', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>Full Oracle →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { icon: '🗺️', label: 'Career Path' },
              { icon: '📿', label: 'Daily Proverb' },
              { icon: '🧬', label: 'Heritage DNA' },
              { icon: '🔍', label: 'Skill Gaps' },
            ].map(p => (
              <a key={p.label} href="/dashboard/ai" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', textDecoration: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: "'Space Grotesk',sans-serif" }}>{p.label}</span>
              </a>
            ))}
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.1)', fontStyle: 'italic', fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
            "The one who tells the stories rules the world." — African Proverb · <span style={{ fontSize: 9, color: 'rgba(167,139,250,0.6)' }}>Odin's Wisdom of the Day</span>
          </div>
        </div>

        {/* Quick access rows */}
        <div style={{ margin: '0 12px 16px', background: '#0a1a0e', border: '1px solid rgba(26,124,62,.35)', borderRadius: 14, overflow: 'hidden' }}>
          {[
            { icon: '⚙️', label: 'Settings', sub: 'Privacy, security, appearance, language', href: '/dashboard/settings' },
            { icon: '📋', label: 'My Sessions', sub: 'Tool sessions and business history', href: '/dashboard/sessions' },
            { icon: '📅', label: 'Calendar', sub: 'Moon cycles, family events & market days', href: '/dashboard/calendar' },
          ].map((item, i) => (
            <button key={i} onClick={() => router.push(item.href)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', width: '100%', cursor: 'pointer',
              background: 'transparent', border: 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.04)' : 'none', textAlign: 'left',
            }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{item.sub}</div>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,.15)' }}>›</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <div style={{ margin: '0 12px 24px' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: 'rgba(239,68,68,.06)', border: '1.5px solid rgba(239,68,68,.2)',
            color: '#ef4444', fontSize: 14, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'Sora, Inter, system-ui, sans-serif',
          }}>
            🚪 Log Out
          </button>
        </div>

        {/* Delete Account — subtle link */}
        <div style={{ margin: '0 12px 32px', textAlign: 'center' }}>
          <button
            onClick={() => router.push('/dashboard/settings?section=account')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(239,68,68,.5)', fontSize: 11, fontWeight: 600,
              padding: '8px 16px', transition: 'color .2s',
            }}
          >
            Delete or Deactivate Account
          </button>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.15)', marginTop: 4 }}>
            Manage your account in Settings
          </div>
        </div>
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      {showRank  && <HonorRankScreen xp={xp} onClose={() => setShowRank(false)} />}
      {showRoots && <RootPlantingScreen onClose={() => setShowRoots(false)} />}
    </div>
  )
}
