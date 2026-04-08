'use client'
import { useRef, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { PinGate } from '@/components/ui/PinGate'
import { GyeNyame } from '@/components/ui/afro-icons'

interface MobileShellProps {
  children: React.ReactNode
  hideTopBar?: boolean
  hideBottomNav?: boolean
}

// Pages that are full "realm" experiences — hide main chrome
const REALM_PATHS = [
  '/dashboard/banking',
  '/dashboard/love',
  '/dashboard/kerawa',
  '/dashboard/ajo-connect',
  '/dashboard/ai',
]

function isRealmPage(path: string) {
  return REALM_PATHS.some(p => path === p || path.startsWith(p + '/'))
}

export function MobileShell({ children, hideTopBar, hideBottomNav }: MobileShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [fabVisible, setFabVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const inRealm = isRealmPage(pathname)
  const hideChrome = inRealm || hideBottomNav

  // Auto-fade FABs on scroll — no state in deps, uses ref for timer
  useEffect(() => {
    function onScroll() {
      setFabVisible(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setFabVisible(true), 1400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const showBankFab = pathname !== '/dashboard/banking'
  const showZeusFab = pathname !== '/dashboard/ai'

  return (
    <div
      className="relative flex flex-col"
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Adinkra Gye Nyame — body-level sovereign pattern */}
      <div className="bg-adinkra bg-adinkra-overlay" aria-hidden="true" />

      {!hideTopBar && !inRealm && <TopBar />}

      <main
        className="flex-1 no-scrollbar max-w-md mx-auto w-full"
        style={{
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: hideChrome ? 16 : 'calc(72px + env(safe-area-inset-bottom, 0px))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </main>

      {!hideChrome && (
        <>
          <div className="kente-divider max-w-md mx-auto w-full" />
          <BottomNav />
        </>
      )}

      {/* ── Floating Quick-Access — stacked right, auto-fade on scroll ── */}
      {(showBankFab || showZeusFab) && (
        <>
          <style>{`
            @keyframes fabPulse{0%,100%{box-shadow:0 0 14px rgba(26,124,62,0.18),0 2px 10px rgba(0,0,0,0.3)}50%{box-shadow:0 0 22px rgba(26,124,62,0.32),0 2px 14px rgba(0,0,0,0.4)}}
            @keyframes fabPulseZ{0%,100%{box-shadow:0 0 14px rgba(226,232,240,0.1),0 2px 10px rgba(0,0,0,0.3)}50%{box-shadow:0 0 22px rgba(226,232,240,0.22),0 2px 14px rgba(0,0,0,0.4)}}
          `}</style>
          <div style={{
            position: 'fixed',
            bottom: hideChrome ? 20 : 82,
            right: 14,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            opacity: fabVisible ? 0.9 : 0.12,
            transition: 'opacity 0.5s ease',
          }}>
            {showZeusFab && (
              <button
                onClick={() => router.push('/dashboard/ai')}
                aria-label="AI Gods"
                style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  border: '1.5px solid rgba(226,232,240,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  animation: 'fabPulseZ 4s ease-in-out infinite',
                }}
              >
                <GyeNyame size={20} color="rgba(226,232,240,0.8)" />
              </button>
            )}
            {showBankFab && (
              <button
                onClick={() => router.push('/dashboard/banking')}
                aria-label="Bank"
                style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0b2e1a, #0f4025)',
                  border: '1.5px solid rgba(74,222,128,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  animation: 'fabPulse 4s ease-in-out infinite',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v2h20V7L12 2z" fill="rgba(74,222,128,0.8)"/>
                  <path d="M4 11v6h2v-6H4zm4 0v6h2v-6H8zm4 0v6h2v-6h-2zm4 0v6h2v-6h-2z" fill="rgba(74,222,128,0.6)"/>
                  <path d="M2 19v2h20v-2H2z" fill="rgba(74,222,128,0.8)"/>
                </svg>
              </button>
            )}
          </div>
        </>
      )}

      <PinGate />
    </div>
  )
}
