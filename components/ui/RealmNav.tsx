'use client'
// ============================================================
// RealmNav — Standardized sticky nav bar for realm pages
// Used by Love, Kerawa, Ajo Connect, Banking
// ============================================================
import { useRouter } from 'next/navigation'

interface RealmNavProps {
  realmName: string
  realmIcon: string
  accentColor: string
  backHref?: string
  rightAction?: React.ReactNode
}

export function RealmNav({
  realmName,
  realmIcon,
  accentColor,
  backHref = '/dashboard/baobab',
  rightAction,
}: RealmNavProps) {
  const router = useRouter()

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10,10,12,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${accentColor}1F`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left — back */}
      <button
        onClick={() => router.push(backHref)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 0',
          color: accentColor,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 19l-7-7 7-7" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.04em',
        }}>
          BAOBAB
        </span>
      </button>

      {/* Center — realm identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 17 }}>{realmIcon}</span>
        <span style={{
          fontSize: 14,
          fontWeight: 800,
          color: accentColor,
          fontFamily: 'Sora, var(--font-body)',
          letterSpacing: '0.08em',
        }}>
          {realmName}
        </span>
      </div>

      {/* Right — optional action or spacer */}
      {rightAction ?? <div style={{ width: 60 }} />}
    </nav>
  )
}
