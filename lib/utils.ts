import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatCowries(amount: number): string {
  if (amount >= 1_000_000) return `₵${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₵${(amount / 1_000).toFixed(1)}K`
  return `₵${amount.toLocaleString()}`
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)

  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24)   return `${hours}h ago`
  if (days < 7)     return `${days}d ago`
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}
