'use client'
// ============================================================
// OfflineBanner — amber slide-down when offline
// Green "Connection restored" for 2s then slides back up.
// navigator.onLine + online/offline events.
// ============================================================
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SilentDrum, DjembeIcon } from '@/components/ui/afro-icons'

function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [justReconnected, setJustReconnected] = React.useState(false)

  React.useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  setJustReconnected(true)  }
    const handleOffline = () => { setIsOnline(false); setJustReconnected(false) }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-dismiss "reconnected" banner after 2s
  React.useEffect(() => {
    if (!justReconnected) return
    const t = setTimeout(() => setJustReconnected(false), 2000)
    return () => clearTimeout(t)
  }, [justReconnected])

  return { isOnline, justReconnected }
}

export function OfflineBanner() {
  const { isOnline, justReconnected } = useNetworkStatus()
  const show = !isOnline || justReconnected

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={isOnline ? 'online' : 'offline'}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0,       opacity: 1 }}
          exit={{    y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          style={{
            position:    'fixed',
            top:          0,
            left:         0,
            right:        0,
            zIndex:       9999,
            padding:      '10px 16px',
            display:      'flex',
            alignItems:   'center',
            gap:           8,
            fontSize:      13,
            fontWeight:    500,
            fontFamily:   'var(--font-body)',
            background:   isOnline ? '#1a7c3e' : '#e07b00',
            color:        '#fff',
          }}
          role="alert"
          aria-live="polite"
        >
          {isOnline
            ? <DjembeIcon size={15} />
            : <SilentDrum size={15} />
          }
          {isOnline
            ? 'The drum speaks again — connection restored'
            : 'The drum is silent — showing last known data'
          }
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Re-export hook for use elsewhere
export { useNetworkStatus }
