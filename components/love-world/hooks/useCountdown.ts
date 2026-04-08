'use client'
import * as React from 'react'

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
  label: string
}

export function useCountdown(targetDate: Date | string | null): Countdown {
  const target = React.useMemo(() => (
    targetDate ? new Date(targetDate).getTime() : 0
  ), [targetDate])

  const calc = React.useCallback((): Countdown => {
    if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, label: 'Expired' }
    const diff = target - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, label: 'Expired' }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    const parts: string[] = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (parts.length === 0) parts.push(`${seconds}s`)
    return { days, hours, minutes, seconds, expired: false, label: parts.join(' ') }
  }, [target])

  const [countdown, setCountdown] = React.useState(calc)

  React.useEffect(() => {
    if (!target) return
    setCountdown(calc())
    const id = setInterval(() => setCountdown(calc()), 1000)
    return () => clearInterval(id)
  }, [target, calc])

  return countdown
}
