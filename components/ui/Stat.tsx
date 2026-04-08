'use client'
// ============================================================
// Stat — compact stat card with value + label
// Used in dashboard home, Love, Ajo Connect, etc.
// ============================================================
import { cn } from '@/lib/utils'

interface StatProps {
  label: string
  value: string | number
  sub?: string
  subColor?: string
  loading?: boolean
  accentColor?: string
  className?: string
}

export function Stat({
  label,
  value,
  sub,
  subColor,
  loading = false,
  accentColor,
  className,
}: StatProps) {
  return (
    <div
      className={cn('flex-1 text-center', className)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 12px',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{
        fontFamily: 'Sora, var(--font-body)',
        fontSize: 'var(--text-lg)',
        fontWeight: 700,
        color: accentColor ?? 'var(--text-primary)',
      }}>
        {loading ? (
          <span className="animate-realm-shimmer" style={{
            display: 'inline-block',
            width: 32,
            height: 18,
            borderRadius: 4,
          }} />
        ) : value}
      </div>
      {sub && !loading && (
        <div style={{
          fontSize: 10,
          color: subColor ?? 'var(--text-secondary)',
          fontWeight: 600,
          marginTop: 2,
        }}>
          {sub}
        </div>
      )}
      <div style={{
        fontSize: 10,
        color: 'var(--text-muted)',
        marginTop: 4,
        letterSpacing: '0.02em',
      }}>
        {label}
      </div>
    </div>
  )
}
