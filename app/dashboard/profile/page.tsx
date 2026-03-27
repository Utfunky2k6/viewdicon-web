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
import { getRankFromXP, getXPProgress } from '@/constants/ranks'
import { authApi } from '@/lib/api'

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

  const raw     = user?.afroId?.raw     ?? 'NG-YOR-2764-8937'
  const masked  = user?.afroId?.masked  ?? 'NG-YOR-••••-••••'
  const country = user?.afroId?.country ?? 'NG'
  const tribe   = user?.afroId?.tribe   ?? 'YOR'
  const numeric = user?.afroId?.numeric ?? '2764-8937'

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
          fontSize: 18, fontWeight: 800,
          color: revealed ? '#4ade80' : 'rgba(74,222,128,.5)',
          letterSpacing: '.12em', textAlign: 'center',
          background: 'rgba(0,0,0,.3)', borderRadius: 10,
          padding: '10px 0', marginBottom: 10,
          transition: 'color .3s',
        }}>
          {revealed ? raw : masked}
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
          <button onClick={() => setRevealed(r => !r)} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: '#f0f7f0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            {revealed ? '🙈 Hide ID' : '👁 Reveal Full ID'}
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

// ── Profile Page ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { activeSkin, skinColors } = useSkinStore()
  const { user, setUser } = useAuthStore()
  const router = useRouter()
  const [showRank,  setShowRank]  = React.useState(false)
  const [showRoots, setShowRoots] = React.useState(false)
  const [xp, setXp] = React.useState(0)

  // Fetch real user data from backend on mount
  React.useEffect(() => {
    async function fetchMe() {
      try {
        const me = await authApi.me(true)
        setUser(me)
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

  const displayTags = isGhost
    ? ['🏛 Clan Member', '🔮 Elder Standing', '🌫 Ghost Active']
    : [
        heritageLabel,
        user?.tribe ? `🌿 ${user.tribe}` : null,
        `🛡 Nkisi ${user?.nkisiState || 'GREEN'}`,
      ].filter(Boolean) as string[]

  // Stats: always real zeros until backend provides data (no fake numbers)
  const workStats: { v: string; l: string; tappable?: boolean }[] = [
    { v: '0',  l: 'Jobs Done' },
    { v: String(user?.ringCounts?.ring1 ?? 0), l: 'Roots', tappable: true },
    { v: '—',  l: 'Honour' },
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

  const handleLogout = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('afk-auth')
      localStorage.removeItem('afk_token')
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'afk_token=; Max-Age=0; path=/'
    }
    router.push('/login')
  }

  return (
    <div className="animate-fade-in">
      {/* ── Adinkra Pattern Banner + Avatar ───────────────────────────────── */}
      <div style={{ position: 'relative', background: banner.gradient, overflow: 'hidden', paddingBottom: 8 }}>
        {/* Adinkra pattern overlay */}
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
          {activeSkin === 'WORK' ? avatarContent : activeSkin === 'SOCIAL' ? '🎭' : '🏛'}
              {/* Crest badge */}
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#000', background: '#d4a017', border: '2px solid #0a0a14', zIndex: 2 }}>III</div>
            </div>
            <RankRing color={rank.color} size={68} />
          </div>

          {/* Name + handle + tags */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isGhost && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.4)', borderRadius: 99, padding: '2px 8px', fontSize: 9, color: '#a78bfa', fontWeight: 700, marginBottom: 4, letterSpacing: '.04em' }}>🌫 Ghost Power Active</span>
            )}
            <div style={{ fontSize: 19, fontWeight: 900, color: isGhost ? 'rgba(255,255,255,.4)' : '#f0f7f0', filter: isGhost ? 'blur(0.5px)' : undefined, lineHeight: 1.2, fontFamily: 'Sora,sans-serif', marginBottom: 2 }}>{displayName}</div>
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

      {/* ── Account Section ──────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 0' }}>
        <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Account
        </div>
        <AfroIdCard />

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
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      {showRank  && <HonorRankScreen xp={xp} onClose={() => setShowRank(false)} />}
      {showRoots && <RootPlantingScreen onClose={() => setShowRoots(false)} />}
    </div>
  )
}
