'use client'
import * as React from 'react'

export function usePolling(
  callback: () => Promise<void> | void,
  intervalMs = 3000,
  enabled = true,
) {
  const savedCallback = React.useRef(callback)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => { savedCallback.current = callback })

  React.useEffect(() => {
    const handleVisibility = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  React.useEffect(() => {
    if (!enabled || !visible) return
    const id = setInterval(() => savedCallback.current(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled, visible])
}
