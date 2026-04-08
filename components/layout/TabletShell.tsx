'use client'
// ─────────────────────────────────────────────────────────────
// TabletShell — 768px–1023px
// Layout: [Icon Sidebar 72px] [TopBar + Main Content]
// Mobile shell is NOT used here — completely separate layout.
// ─────────────────────────────────────────────────────────────
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { PinGate } from '@/components/ui/PinGate'
import { GyeNyame } from '@/components/ui/afro-icons'
import {
  DjembeIcon, KowrieIcon, AkomaHeart, FireCircle, ToolSigil, CouncilHut,
  NkisiShield, HarvestCalendar,
} from '@/components/ui/afro-icons'

interface TabletShellProps {
  children: React.ReactNode
  offline?: boolean
}

const QUICK_ACTIONS = [
  { icon: <DjembeIcon    size={26} />, label: 'New Post',    href: '/dashboard/feed',          color: '#1a7c3e' },
  { icon: <KowrieIcon    size={26} />, label: 'UnionPay',    href: '/dashboard/banking',       color: '#d4a017' },
  { icon: <AkomaHeart    size={26} />, label: 'Love World',  href: '/dashboard/love',          color: '#D4AF37' },
  { icon: <FireCircle    size={26} />, label: 'Kèréwà',      href: '/dashboard/kerawa',        color: '#FF3B30' },
  { icon: <ToolSigil     size={26} />, label: 'Launch Tool', href: '/dashboard/villages',      color: '#7c3aed' },
  { icon: <CouncilHut    size={26} />, label: 'My Sessions', href: '/dashboard/sessions',      color: '#374151' },
  { icon: <NkisiShield   size={26} />, label: 'Market Cry',  href: '/dashboard/ads',           color: '#c0392b' },
  { icon: <HarvestCalendar size={26} />, label: 'Events',    href: '/dashboard/events/create', color: '#b45309' },
]

export function TabletShell({ children, offline }: TabletShellProps) {
  const router = useRouter()
  const [showCreate, setShowCreate] = React.useState(false)

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Adinkra background texture */}
      <div className="bg-adinkra" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', zIndex: 0 }} />

      {/* Left: Icon Sidebar */}
      <Sidebar variant="icon" onCreateClick={() => setShowCreate(true)} />

      {/* Right: TopBar + Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <TopBar />

        {offline && (
          <div style={{ background: 'rgba(212,160,23,.1)', borderBottom: '1px solid rgba(212,160,23,.2)', padding: '6px 16px', fontSize: 11, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📡</span><span>Offline mode — changes will sync when connection returns</span>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 24px' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Quick Create Modal */}
      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111a0d', borderRadius: 20, padding: '24px', width: 480, maxWidth: '90vw' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#f0f5ee', marginBottom: 4 }}>Quick Actions</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 16, letterSpacing: '.04em' }}>WHAT WILL YOU DO?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} onClick={() => { setShowCreate(false); router.push(a.href) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', borderRadius: 14, cursor: 'pointer', background: `${a.color}10`, border: `1px solid ${a.color}25`, color: '#f0f5ee' }}>
                  <span style={{ color: a.color }}>{a.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: '.04em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <PinGate />
    </div>
  )
}
