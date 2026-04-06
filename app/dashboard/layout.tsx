'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { MobileShell } from '@/components/layout/MobileShell'

// ── Offline-first: if device is offline and we have cached credentials,
//    skip the network auth check and go straight to dashboard.
//    Prevents users from being locked out while offline.
function useDashboardAuth() {
  const router = useRouter()
  const [checking, setChecking] = React.useState(true)
  const [offlineMode, setOfflineMode] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const state = useAuthStore.getState()
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

      // Offline shortcut — trust cached token, skip network verification
      if (isOffline && state.accessToken && state.ceremonyComplete) {
        setOfflineMode(true)
        setChecking(false)
        return
      }

      if (!state.isAuthenticated || !state.accessToken) {
        router.replace('/login')
        return
      }
      if (!state.ceremonyComplete) {
        router.replace('/ceremony')
        return
      }
      setChecking(false)
    }, 0)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { checking, offlineMode }
}

// ── African boot loading screen shown during auth check ───────────────────
const BOOT_CSS = `
@keyframes afroGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
@keyframes kBar{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}
@keyframes shimBar{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
`

function AfroBootScreen({ offline }: { offline?: boolean }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#050a06', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: BOOT_CSS }} />
      {/* Adinkra overlay */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3Cpath d='M22 22 Q14 14 14 22' stroke-width='0.9'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }} />
      {/* Kente top stripe */}
      <div style={{ height: 4, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)', flexShrink: 0 }} />
      {/* Center content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        {/* Animated Gye Nyame */}
        <div style={{ animation: 'afroGlow 2s ease-in-out infinite', transformOrigin: 'center' }}>
          <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#1a7c3e" strokeLinecap="round">
              <path d="M50 8 L92 50 L50 92 L8 50 Z" strokeWidth="2.5" />
              <path d="M50 22 L78 50 L50 78 L22 50 Z" strokeWidth="1.5" />
              <ellipse cx="50" cy="50" rx="7" ry="11" strokeWidth="2" />
              <circle cx="50" cy="50" r="3" fill="#1a7c3e" stroke="none" />
              <path d="M22 22 Q14 14 14 22" strokeWidth="1.8" />
              <path d="M78 22 Q86 14 86 22" strokeWidth="1.8" />
              <path d="M22 78 Q14 86 14 78" strokeWidth="1.8" />
              <path d="M78 78 Q86 86 86 78" strokeWidth="1.8" />
            </g>
          </svg>
        </div>
        {/* Wordmark */}
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#4ade80,#d4a017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Afrikonnect
        </div>
        {/* Status */}
        <div style={{ fontSize: 11, color: offline ? '#d4a017' : 'rgba(240,247,240,.4)', fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', letterSpacing: '.04em' }}>
          {offline ? '📡 Offline mode — loading from cache' : 'Verifying your AfroID...'}
        </div>
        {/* Loading bar */}
        <div style={{ width: 180, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#1a7c3e,#d4a017)', animation: 'kBar 1.2s ease-out forwards' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)', animation: 'shimBar 1.8s ease-in-out infinite 0.4s' }} />
        </div>
      </div>
      {/* Bottom proverb */}
      <div style={{ textAlign: 'center', padding: '0 24px 32px', fontSize: 10, color: 'rgba(212,160,23,.5)', fontStyle: 'italic', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
        &ldquo;Umuntu ngumuntu ngabantu&rdquo; — Ubuntu
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { checking, offlineMode } = useDashboardAuth()

  if (checking) return <AfroBootScreen />

  return (
    <MobileShell>
      {offlineMode && (
        <div style={{ background: 'rgba(212,160,23,.1)', borderBottom: '1px solid rgba(212,160,23,.2)', padding: '6px 16px', fontSize: 11, color: '#fbbf24', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, zIndex: 50 }}>
          <span>📡</span>
          <span>Offline mode — changes will sync when connection returns</span>
        </div>
      )}
      {children}
    </MobileShell>
  )
}
