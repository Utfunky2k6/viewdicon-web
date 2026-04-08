/**
 * LOVE WORLD — Realm Selector
 *
 * First screen after login. Three controlled environments.
 * No cross-noise. Each realm feels like a distinct mode.
 * Design reference: Apple Wallet card selection, Notion workspace picker.
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM, SUBSCRIPTION, formatPrice, type RealmId, type RealmTheme } from '@/components/love-world/tokens'

/* ─── Active realm persistence ─── */
const STORAGE_KEY = 'lw:active-realm'

function getStoredRealm(): RealmId | null {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(STORAGE_KEY) as RealmId) || null
}

/* ─── Realm Entry Card ─── */

function RealmCard({
  realm,
  index,
  onSelect,
}: {
  realm: RealmTheme
  index: number
  onSelect: () => void
}) {
  const sub = SUBSCRIPTION[realm.id]
  const [pressed, setPressed] = React.useState(false)

  return (
    <button
      onClick={onSelect}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="lw-card-hover"
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE[3],
        padding: `${SPACE[5]}px ${SPACE[5]}px`,
        background: realm.card,
        border: `1px solid ${pressed ? realm.accent : COLOR.border}`,
        borderRadius: RADIUS.xl,
        borderLeft: `3px solid ${realm.accent}`,
        fontFamily: 'inherit',
        color: COLOR.textPrimary,
        overflow: 'hidden',
        animation: `lw-card-enter ${DURATION.slow} ${EASE.default} both`,
        animationDelay: `${index * 80 + 100}ms`,
        transition: `border-color ${DURATION.fast} ${EASE.default}`,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
          <span style={{
            ...TYPE.h1,
            color: realm.accent,
            lineHeight: '1',
          }}>
            {realm.symbol}
          </span>
          <div>
            <p style={{
              ...TYPE.h2,
              margin: 0,
              color: COLOR.textPrimary,
            }}>
              {realm.name}
            </p>
            <p style={{
              ...TYPE.micro,
              margin: 0,
              color: realm.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginTop: 2,
            }}>
              {realm.description}
            </p>
          </div>
        </div>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          style={{ color: COLOR.textMuted, flexShrink: 0 }}
        >
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Description */}
      <p style={{
        ...TYPE.caption,
        color: COLOR.textSecondary,
        margin: 0,
        lineHeight: '1.5',
      }}>
        {realm.description}
      </p>

      {/* Price indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[2],
        marginTop: SPACE[0.5],
      }}>
        <span style={{
          ...TYPE.micro,
          display: 'inline-flex',
          alignItems: 'center',
          height: 22,
          padding: `0 ${SPACE[2]}px`,
          borderRadius: RADIUS.full,
          background: realm.accentMuted,
          color: realm.accent,
          textTransform: 'uppercase',
        }}>
          {formatPrice(sub.priceUSD)}/{sub.period}
        </span>
      </div>

      {/* Subtle accent glow at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${realm.accent}22 50%, transparent 100%)`,
        }}
      />
    </button>
  )
}

/* ─── Main Page ─── */

export default function LoveWorldRealmSelector() {
  const router = useRouter()
  const [entering, setEntering] = React.useState<RealmId | null>(null)

  // If user already has an active realm, offer quick resume
  const stored = React.useMemo(() => getStoredRealm(), [])

  const handleSelect = (id: RealmId) => {
    setEntering(id)
    localStorage.setItem(STORAGE_KEY, id)
    const routes: Record<RealmId, string> = {
      ufe: '/dashboard/love/ufe',
      kerawa: '/dashboard/love/kerawa',
      ajo: '/dashboard/love/ajo',
    }
    setTimeout(() => router.push(routes[id]), 200)
  }

  const realms = [REALM.ufe, REALM.kerawa, REALM.ajo]

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: COLOR.bg,
        color: COLOR.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        opacity: entering ? 0 : 1,
        transition: `opacity ${DURATION.normal} ${EASE.default}`,
      }}
    >
      {/* Back to Baobab */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 56,
          padding: `0 ${SPACE[4]}px`,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[1],
            color: COLOR.textMuted,
            textDecoration: 'none',
            ...TYPE.caption,
            fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Baobab
        </Link>
      </nav>

      {/* Header */}
      <header
        style={{
          padding: `${SPACE[8]}px ${SPACE[5]}px ${SPACE[6]}px`,
          animation: `lw-fade-in ${DURATION.slow} ${EASE.default}`,
        }}
      >
        <h1 style={{
          ...TYPE.display,
          margin: 0,
          color: COLOR.textPrimary,
        }}>
          Love World
        </h1>
        <p style={{
          ...TYPE.body,
          margin: 0,
          marginTop: SPACE[2],
          color: COLOR.textSecondary,
          maxWidth: 300,
        }}>
          Choose your path. Three realms, one journey.
        </p>
      </header>

      {/* Realm Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[3],
          padding: `0 ${SPACE[4]}px`,
          flex: 1,
        }}
      >
        {realms.map((r, i) => (
          <RealmCard
            key={r.id}
            realm={r}
            index={i}
            onSelect={() => handleSelect(r.id)}
          />
        ))}
      </div>

      {/* Quick resume hint */}
      {stored && (
        <div
          style={{
            padding: `${SPACE[6]}px ${SPACE[4]}px`,
            textAlign: 'center',
            animation: `lw-fade-in ${DURATION.slow} ${EASE.default}`,
            animationDelay: '400ms',
            animationFillMode: 'both',
          }}
        >
          <button
            onClick={() => handleSelect(stored)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              ...TYPE.caption,
              color: COLOR.textMuted,
            }}
          >
            Continue in <span style={{ color: REALM[stored].accent, fontWeight: 600 }}>{REALM[stored].name}</span> →
          </button>
        </div>
      )}

      {/* Bottom spacing */}
      <div style={{ height: SPACE[10] }} />
    </div>
  )
}
