'use client'
// ============================================================
// Stars — Rating display (1-5 stars)
// Extracted from ajo-connect for shared use
// ============================================================

interface StarsProps {
  rating: number
  size?: number
  className?: string
}

export function Stars({ rating, size = 12, className }: StarsProps) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5

  return (
    <span className={className} style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={
            i < full
              ? '#fbbf24'
              : i === full && half
                ? 'url(#halfStar)'
                : 'rgba(255,255,255,.08)'
          }
        >
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="rgba(255,255,255,.08)" />
            </linearGradient>
          </defs>
          <path d="M10 1l2.47 5.01L18 6.9l-4 3.9.94 5.5L10 13.77 5.06 16.3 6 10.8 2 6.9l5.53-.89L10 1z" />
        </svg>
      ))}
    </span>
  )
}
