'use client'

import { useEffect, useRef, useState } from 'react'

export function ServiceWorkerRegistrar() {
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const regRef = useRef<ServiceWorkerRegistration | null>(null)

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000)
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    let mounted = true

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (!mounted) return
        regRef.current = reg

        // ── Periodic background sync (if available) ──────────────────────
        if ('periodicSync' in reg) {
          try {
            const status = await navigator.permissions.query({
              name: 'periodic-background-sync' as PermissionName,
            })
            if (status.state === 'granted') {
              await (reg as ServiceWorkerRegistration & {
                periodicSync: { register(tag: string, opts: { minInterval: number }): Promise<void> }
              }).periodicSync.register('afro-content-sync', {
                minInterval: 24 * 60 * 60 * 1000, // 24 hours
              })
            }
          } catch {
            // Periodic sync not supported or permission denied — silent fail
          }
        }
      } catch (err) {
        console.warn('[SW] Registration failed:', err)
      }
    }

    register()

    // ── Listen for messages from the service worker ───────────────────────
    function onSWMessage(event: MessageEvent) {
      if (!event.data) return
      if (event.data.type === 'SYNC_COMPLETE') {
        showToast(event.data.message ?? 'Sync complete')
      }
    }

    navigator.serviceWorker.addEventListener('message', onSWMessage)

    // ── Trigger banking sync when network comes back online ───────────────
    function onOnline() {
      const reg = regRef.current
      if (!reg) return
      if ('sync' in reg) {
        ;(reg as ServiceWorkerRegistration & {
          sync: { register(tag: string): Promise<void> }
        }).sync.register('afro-banking-sync').catch(() => {})
      }
    }

    window.addEventListener('online', onOnline)

    return () => {
      mounted = false
      navigator.serviceWorker.removeEventListener('message', onSWMessage)
      window.removeEventListener('online', onOnline)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  if (!toastMsg) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position:     'fixed',
        bottom:       '24px',
        left:         '50%',
        transform:    'translateX(-50%)',
        background:   '#1a7c3e',
        color:        '#fff',
        fontSize:     '12px',
        fontWeight:   600,
        padding:      '8px 16px',
        borderRadius: '9999px',
        boxShadow:    '0 4px 16px rgba(0,0,0,0.35)',
        whiteSpace:   'nowrap',
        zIndex:       9999,
        animation:    'sw-toast-in 0.2s ease',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes sw-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      {toastMsg}
    </div>
  )
}
