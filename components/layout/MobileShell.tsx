'use client'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { PinGate } from '@/components/ui/PinGate'

interface MobileShellProps {
  children: React.ReactNode
  hideTopBar?: boolean
  hideBottomNav?: boolean
}

export function MobileShell({ children, hideTopBar, hideBottomNav }: MobileShellProps) {

  return (
    <div
      className="relative flex flex-col"
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      {!hideTopBar && <TopBar />}
      <main
        className="flex-1 no-scrollbar max-w-md mx-auto w-full"
        style={{
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: hideBottomNav ? 16 : 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
      <PinGate />
    </div>
  )
}
