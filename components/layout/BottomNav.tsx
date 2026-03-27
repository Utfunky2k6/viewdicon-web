'use client'
// ============================================================
// BottomNav — 6 slots: Home · Calendar · Feed · Create(+) · Chat · Profile
// Center Create button is elevated with golden accent.
// Calendar is a direct permanent tab for full discoverability.
// ============================================================
import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Tab { path: string; emoji: string; label: string; exact?: boolean }

const LEFT_TABS: Tab[] = [
  { path: '/dashboard',          emoji: '🏠', label: 'Home',     exact: true },
  { path: '/dashboard/calendar', emoji: '📅', label: 'Calendar'             },
]

const RIGHT_TABS: Tab[] = [
  { path: '/dashboard/feed',    emoji: '🥁', label: 'Drum'               },
  { path: '/dashboard/chat',    emoji: '💬', label: 'Seso'               },
  { path: '/dashboard/profile', emoji: '🎭', label: 'Profile'            },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showSheet, setShowSheet] = React.useState(false)

  const isActive = (t: Tab) =>
    t.exact ? pathname === t.path : pathname.startsWith(t.path)

  const TAB_COLOR = '#4ade80'
  const GOLD = '#fbbf24'

  const QUICK_ACTIONS = [
    { emoji: '🛠', label: 'Launch Tool',     href: '/dashboard/villages' },
    { emoji: '📋', label: 'My Sessions',     href: '/dashboard/sessions' },
    { emoji: '🥁', label: 'Text Drum',      href: '/dashboard/feed' },
    { emoji: '🎙', label: 'Voice Story',     href: '/dashboard/feed' },
    { emoji: '📅', label: 'Calendar',          href: '/dashboard/calendar' },
    { emoji: '💬', label: 'New Message',      href: '/dashboard/chat' },
  ]

  const renderTab = (tab: Tab) => {
    const on = isActive(tab)
    return (
      <Link key={tab.path} href={tab.path} style={{
        textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        padding: '4px 6px', borderRadius: 12,
        background: on ? 'rgba(74,222,128,.08)' : 'transparent',
        minWidth: 48, position: 'relative',
      }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.emoji}</span>
        <span style={{ fontSize: 8, fontWeight: on ? 700 : 500, color: on ? TAB_COLOR : 'rgba(240,247,240,.38)', letterSpacing: on ? '.02em' : 0 }}>{tab.label}</span>
        {on && <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: TAB_COLOR, boxShadow: `0 0 5px ${TAB_COLOR}` }} />}
      </Link>
    )
  }

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#0c1009',
        borderTop: '1px solid rgba(255,255,255,.06)',
        paddingTop: 6,
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', maxWidth: 480, margin: '0 auto', position: 'relative' }}>

          {/* LEFT: Home + Calendar */}
          {LEFT_TABS.map(renderTab)}

          {/* CENTER: Create (+) Orb — elevated */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: -2 }}>
            <button onClick={() => setShowSheet(true)} style={{
              width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#1a7c3e,#0f5028)',
              boxShadow: '0 4px 20px rgba(26,124,62,.4), 0 -4px 12px rgba(0,0,0,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: -20, transition: 'all .25s',
              fontSize: 26, color: '#fff',
            }}>
              ✚
            </button>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(74,222,128,.5)', letterSpacing: '.04em', marginTop: 3 }}>Create</span>
          </div>

          {/* RIGHT: Drum + Seso + Profile */}
          {RIGHT_TABS.map(renderTab)}
        </div>
      </nav>

      {/* ── Quick Create Sheet ── */}
      {showSheet && (
        <div onClick={() => setShowSheet(false)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#111a0d', borderRadius: '28px 28px 0 0', padding: '16px 16px 40px',
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.2)', margin: '0 auto 16px' }} />
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 900, color: '#f0f5ee', marginBottom: 14, paddingLeft: 4 }}>
              What do you want to create?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} onClick={() => { setShowSheet(false); router.push(a.href) }} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '16px 8px', borderRadius: 16, cursor: 'pointer',
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                  color: '#f0f5ee', fontSize: 12, fontWeight: 600,
                }}>
                  <span style={{ fontSize: 28 }}>{a.emoji}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
