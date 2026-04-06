'use client'
// ============================================================
// BottomNav — 6 slots: Home · Calendar · Feed · Create(+) · Chat · Profile
// Center Create button is elevated with golden accent.
// Calendar is a direct permanent tab for full discoverability.
// ============================================================
import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BaobabTree, DjembeIcon, UbuntuRing, MaskFace, KowrieIcon,
  ToolSigil, CouncilHut, FireCircle, NkisiShield,
  AkomaHeart, HarvestCalendar,
} from '@/components/ui/afro-icons'

interface Tab { path: string; icon: React.ReactNode; label: string; exact?: boolean }

const LEFT_TABS: Tab[] = [
  { path: '/dashboard',          icon: <BaobabTree size={22} />,  label: 'Home',    exact: true },
  { path: '/dashboard/feed',     icon: <DjembeIcon size={22} />,  label: 'Drum'                 },
]

const RIGHT_TABS: Tab[] = [
  { path: '/dashboard/chat',     icon: <UbuntuRing size={22} />,  label: 'Seso'               },
  { path: '/dashboard/profile',  icon: <MaskFace   size={22} />,  label: 'Profile'            },
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
    { icon: <DjembeIcon    size={28} />, label: 'New Post',      href: '/dashboard/feed',           color: '#1a7c3e' },
    { icon: <KowrieIcon    size={28} />, label: 'UnionPay',      href: '/dashboard/banking',        color: '#d4a017' },
    { icon: <AkomaHeart    size={28} />, label: 'Union Path',    href: '/dashboard/love',           color: '#D4AF37' },
    { icon: <FireCircle    size={28} />, label: 'Kèréwà',        href: '/dashboard/kerawa',         color: '#FF3B30' },
    { icon: <ToolSigil     size={28} />, label: 'Launch Tool',   href: '/dashboard/villages',       color: '#7c3aed' },
    { icon: <CouncilHut    size={28} />, label: 'My Sessions',   href: '/dashboard/sessions',       color: '#374151' },
    { icon: <NkisiShield   size={28} />, label: 'Market Cry',    href: '/dashboard/ads',            color: '#c0392b' },
    { icon: <HarvestCalendar size={28} />, label: 'Create Event', href: '/dashboard/events/create', color: '#b45309' },
  ]

  const renderTab = (tab: Tab) => {
    const on = isActive(tab)
    return (
      <Link key={tab.path} href={tab.path} style={{
        textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        padding: '4px 6px', borderRadius: 12,
        background: on ? 'rgba(74,222,128,.08)' : 'transparent',
        minWidth: 48, position: 'relative',
        color: on ? TAB_COLOR : 'rgba(240,247,240,.38)',
      }}>
        {tab.icon}
        <span style={{ fontSize: 8, fontWeight: on ? 700 : 500, color: 'inherit', letterSpacing: on ? '.02em' : 0 }}>{tab.label}</span>
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
              ❂
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
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#f0f5ee', marginBottom: 4, paddingLeft: 4 }}>
              Quick Actions
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', paddingLeft: 4, marginBottom: 12, letterSpacing: '.04em' }}>WHAT WILL YOU DO?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} onClick={() => { setShowSheet(false); router.push(a.href) }} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 8px', borderRadius: 18, cursor: 'pointer',
                  background: `${a.color}10`, border: `1px solid ${a.color}25`,
                  color: '#f0f5ee', transition: 'all .2s',
                }}>
                  <div style={{ color: a.color }}>{a.icon}</div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: '.04em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
