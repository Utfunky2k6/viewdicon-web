'use client'
// ─────────────────────────────────────────────────────────────
// DesktopShell — 1024px+
// Small Desktop (1024–1439): Sidebar + TopBar + Main Content
// Desktop      (1440–1919): Sidebar + TopBar + Main + Right Panel
// Wide         (1920+):     Same, centered, wider content
//
// Features: Keyboard shortcuts, hover sidebar expand (future),
//           right panel (activity/events/zeus/suggestions)
// ─────────────────────────────────────────────────────────────
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { PinGate } from '@/components/ui/PinGate'
import {
  DjembeIcon, KowrieIcon, AkomaHeart, FireCircle,
  ToolSigil, CouncilHut, NkisiShield, HarvestCalendar,
} from '@/components/ui/afro-icons'
import { useDevice } from '@/hooks/useDevice'

interface DesktopShellProps {
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

// ── Keyboard shortcut map ──────────────────────────────────────
const KB_SHORTCUTS: Record<string, string> = {
  h: '/dashboard',
  f: '/dashboard/feed',
  m: '/dashboard/chat',
  e: '/dashboard/events',
  p: '/dashboard/profile',
  b: '/dashboard/banking',
  v: '/dashboard/villages',
  z: '/dashboard/ai',
  l: '/dashboard/love',
  k: '/dashboard/kerawa',
}

export function DesktopShell({ children, offline }: DesktopShellProps) {
  const router = useRouter()
  const device = useDevice()
  const [showCreate, setShowCreate] = React.useState(false)
  const [kbHeld, setKbHeld] = React.useState(false)
  const [kbToast, setKbToast] = React.useState<string | null>(null)

  // Show right panel on 1440+ screens
  const showRightPanel = device === 'desktop' || device === 'wide'
  const contentMax = device === 'wide' ? 1400 : 900

  // ── Keyboard shortcuts: hold G then press key ───────────────
  React.useEffect(() => {
    let gHeld = false
    let timer: ReturnType<typeof setTimeout>

    function onKeyDown(e: KeyboardEvent) {
      // Skip if focus is in an input/textarea
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'g' || e.key === 'G') {
        gHeld = true
        setKbHeld(true)
        timer = setTimeout(() => { gHeld = false; setKbHeld(false) }, 1500)
        return
      }

      if (gHeld) {
        const dest = KB_SHORTCUTS[e.key.toLowerCase()]
        if (dest) {
          clearTimeout(timer)
          gHeld = false
          setKbHeld(false)
          setKbToast(`Going to ${dest}…`)
          setTimeout(() => { router.push(dest); setKbToast(null) }, 300)
          e.preventDefault()
        }
      }

      // Escape closes create modal
      if (e.key === 'Escape') setShowCreate(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

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
      <div className="bg-adinkra" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none', zIndex: 0 }} />

      {/* Left: Full Sidebar */}
      <Sidebar variant="full" onCreateClick={() => setShowCreate(true)} />

      {/* Center: TopBar + Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1, minWidth: 0 }}>
        <TopBar />

        {offline && (
          <div style={{ background: 'rgba(212,160,23,.1)', borderBottom: '1px solid rgba(212,160,23,.2)', padding: '6px 24px', fontSize: 11, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📡</span><span>Offline mode — changes will sync when connection returns</span>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
          <div style={{ maxWidth: contentMax, margin: '0 auto', padding: '0 32px 32px' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Right Panel — only on 1440px+ */}
      {showRightPanel && <RightPanel width={300} />}

      {/* Quick Create Modal */}
      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111a0d', borderRadius: 24, padding: '28px', width: 540, maxWidth: '90vw', border: '1px solid rgba(74,222,128,.15)' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#f0f5ee', marginBottom: 4 }}>Quick Actions</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 20, letterSpacing: '.04em' }}>WHAT WILL YOU DO?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} onClick={() => { setShowCreate(false); router.push(a.href) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 16, cursor: 'pointer', background: `${a.color}10`, border: `1px solid ${a.color}25`, color: '#f0f5ee', transition: 'background .2s' }}>
                  <span style={{ color: a.color }}>{a.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: '.04em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>
              💡 Keyboard: <strong style={{ color: 'rgba(255,255,255,.5)' }}>G</strong> then <strong style={{ color: 'rgba(255,255,255,.5)' }}>H</strong>=Home · <strong style={{ color: 'rgba(255,255,255,.5)' }}>F</strong>=Feed · <strong style={{ color: 'rgba(255,255,255,.5)' }}>M</strong>=Messages · <strong style={{ color: 'rgba(255,255,255,.5)' }}>Z</strong>=Zeus · <strong style={{ color: 'rgba(255,255,255,.5)' }}>B</strong>=Banking
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcut toast */}
      {kbHeld && !kbToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'rgba(10,20,10,.95)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 12, padding: '10px 20px', fontSize: 11, color: '#4ade80', fontFamily: 'monospace', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
          ⌨ G held — press H·F·M·E·P·B·V·Z·L·K to navigate
        </div>
      )}
      {kbToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'rgba(10,20,10,.95)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 12, padding: '10px 20px', fontSize: 11, color: '#4ade80', fontFamily: 'monospace', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
          {kbToast}
        </div>
      )}

      <PinGate />
    </div>
  )
}
