'use client'
// ─────────────────────────────────────────────────────────────
// Sidebar — shared between TabletShell (icons only) and
//           DesktopShell (icons + labels).
// Tablet  : variant="icon"  → 72px column
// Desktop : variant="full"  → 240px column
// ─────────────────────────────────────────────────────────────
import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ViewdiconIcon } from '@/components/ui/ViewdiconLogo'
import {
  BaobabTree, DjembeIcon, UbuntuRing, MaskFace, KowrieIcon,
  ToolSigil, FireCircle, AkomaHeart, GyeNyame, HarvestCalendar,
  DrumAlert,
} from '@/components/ui/afro-icons'
import { useNotifStore } from '@/stores/notifStore'

interface SidebarProps {
  variant: 'icon' | 'full'
  onCreateClick: () => void
}

const NAV_ITEMS = [
  { icon: <BaobabTree    size={20} />, label: 'Home',        href: '/dashboard',            exact: true  },
  { icon: <DjembeIcon    size={20} />, label: 'Feed',        href: '/dashboard/feed'                     },
  { icon: <AkomaHeart    size={20} />, label: 'Love World',  href: '/dashboard/love'                             },
  { icon: <FireCircle    size={20} />, label: 'Kèréwà',      href: '/dashboard/kerawa'                   },
  { icon: <KowrieIcon    size={20} />, label: 'UnionPay',    href: '/dashboard/banking'                  },
  { icon: <UbuntuRing    size={20} />, label: 'Seso',        href: '/dashboard/chat'                     },
  { icon: <ToolSigil     size={20} />, label: 'Villages',    href: '/dashboard/villages'                 },
  { icon: <HarvestCalendar size={20} />, label: 'Events',    href: '/dashboard/events'                   },
  { icon: <MaskFace      size={20} />, label: 'Profile',     href: '/dashboard/profile'                  },
]

const BOTTOM_ITEMS = [
  { icon: <DrumAlert     size={20} />, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: <GyeNyame      size={20} color="currentColor" />, label: 'Zeus AI', href: '/dashboard/ai' },
]

const W = { icon: 72, full: 240 }

export function Sidebar({ variant, onCreateClick }: SidebarProps) {
  const pathname  = usePathname()
  const { unreadCount, unreadChat } = useNotifStore()
  const isFull    = variant === 'full'
  const width     = W[variant]

  const isActive  = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const C = {
    on:   '#4ade80',
    off:  'rgba(240,247,240,.40)',
    bg:   'rgba(74,222,128,.09)',
    zeus: '#e2e8f0',
    zOff: 'rgba(226,232,240,.4)',
  }

  const renderItem = (
    item: { icon: React.ReactNode; label: string; href: string; exact?: boolean },
    badge?: number
  ) => {
    const on = isActive(item.href, item.exact)
    const isZeus = item.href === '/dashboard/ai'
    const color = on ? (isZeus ? C.zeus : C.on) : (isZeus ? C.zOff : C.off)

    return (
      <Link
        key={item.href}
        href={item.href}
        title={!isFull ? item.label : undefined}
        style={{
          display: 'flex',
          flexDirection: isFull ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: isFull ? 'flex-start' : 'center',
          gap: isFull ? 10 : 3,
          padding: isFull ? '9px 14px' : '9px 0',
          margin: isFull ? '1px 8px' : '1px 4px',
          borderRadius: 12,
          background: on ? C.bg : 'transparent',
          color,
          textDecoration: 'none',
          transition: 'background .15s, color .15s',
          position: 'relative',
          minHeight: 44,
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {/* Active indicator bar */}
        {on && (
          <span style={{
            position: 'absolute',
            left: isFull ? -8 : -4,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 20,
            borderRadius: '0 3px 3px 0',
            background: isZeus ? C.zeus : C.on,
          }} />
        )}

        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, position: 'relative' }}>
          {item.icon}
          {(badge ?? 0) > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -4,
              minWidth: 14, height: 14, borderRadius: 99,
              background: '#E85D04', color: '#fff',
              fontSize: 8, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
              border: '1.5px solid var(--bg-card)',
            }}>
              {(badge ?? 0) > 9 ? '9+' : badge}
            </span>
          )}
        </span>

        {isFull && (
          <span style={{ fontSize: 12, fontWeight: on ? 700 : 500, letterSpacing: '.01em', color }}>
            {item.label}
          </span>
        )}

        {!isFull && (
          <span style={{ fontSize: 8, fontWeight: on ? 700 : 500, color, letterSpacing: '.02em' }}>
            {item.label}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside style={{
      width,
      height: '100dvh',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: isFull ? 'auto' : 'hidden',
      zIndex: 45,
    }}>
      {/* Logo */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isFull ? 'flex-start' : 'center',
        padding: isFull ? '0 16px' : 0,
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        gap: 10,
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <ViewdiconIcon size={28} />
          {isFull && (
            <span style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', fontFamily: "'Sora', sans-serif", letterSpacing: '.04em' }}>
              AFRIKONNECT
            </span>
          )}
        </Link>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
        {NAV_ITEMS.map(item =>
          renderItem(
            item,
            item.href === '/dashboard/chat' ? unreadChat : undefined
          )
        )}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '8px 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BOTTOM_ITEMS.map(item =>
          renderItem(
            item,
            item.href === '/dashboard/notifications' ? unreadCount : undefined
          )
        )}

        {/* Create button */}
        <button
          onClick={onCreateClick}
          title={!isFull ? 'Create' : undefined}
          style={{
            display: 'flex',
            flexDirection: isFull ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: isFull ? 'flex-start' : 'center',
            gap: isFull ? 10 : 3,
            padding: isFull ? '9px 14px' : '9px 0',
            margin: isFull ? '1px 8px' : '1px 4px',
            borderRadius: 12,
            background: 'rgba(26,124,62,.15)',
            border: '1px solid rgba(26,124,62,.3)',
            color: '#4ade80',
            cursor: 'pointer',
            transition: 'background .15s',
            minHeight: 44,
            fontFamily: "'Sora', sans-serif",
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>❂</span>
          {isFull && <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Create</span>}
          {!isFull && <span style={{ fontSize: 8, fontWeight: 700, color: '#4ade80', letterSpacing: '.02em' }}>Create</span>}
        </button>
      </div>
    </aside>
  )
}
