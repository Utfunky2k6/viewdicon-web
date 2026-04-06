'use client'
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

export function MobileShell({ children, hideTopBar, hideBottomNav }: MobileShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div
      className="relative flex flex-col"
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Adinkra Gye Nyame — body-level sovereign pattern (3% opacity) */}
      <div
        className="bg-adinkra bg-adinkra-overlay"
        aria-hidden="true"
      />

      {!hideTopBar && <TopBar />}
      <main
        className="flex-1 no-scrollbar max-w-md mx-auto w-full"
        style={{
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: hideBottomNav ? 16 : 'calc(72px + env(safe-area-inset-bottom, 0px))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </main>
      {!hideBottomNav && (
        <>
          {/* Kente divider — 4-colour Pan-African strip above bottom nav */}
          <div className="kente-divider max-w-md mx-auto w-full" />
          <BottomNav />
        </>
      )}

      {/* Zeus FAB — only show when not already on AI gods page */}
      {pathname !== '/dashboard/ai' && (
        <div style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <style>{`@keyframes zeusGlow{0%,100%{box-shadow:0 0 20px rgba(226,232,240,0.15),0 4px 20px rgba(0,0,0,0.5)}50%{box-shadow:0 0 32px rgba(226,232,240,0.35),0 4px 28px rgba(0,0,0,0.6)}}`}</style>
          <button
            onClick={() => router.push('/dashboard/ai')}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '2px solid rgba(226,232,240,0.4)',
              boxShadow: '0 0 20px rgba(226,232,240,0.15), 0 4px 20px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 22,
              animation: 'zeusGlow 3s ease-in-out infinite',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          ><GyeNyame size={26} color="rgba(226,232,240,0.9)" /></button>
          <span style={{ fontSize: 8, color: 'rgba(226,232,240,0.5)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>ZEUS</span>
        </div>
      )}

      <PinGate />
    </div>
  )
}
