'use client'
// ============================================================
// SectionHeader — title + optional action button
// Replaces local SectionHead/SectionLabel patterns
// ============================================================

interface SectionHeaderProps {
  title: string
  action?: string
  onAction?: () => void
  accentColor?: string
  className?: string
}

export function SectionHeader({
  title,
  action,
  onAction,
  accentColor,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}
    >
      <span style={{
        fontSize: 'var(--text-xs)',
        color: accentColor ?? 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        letterSpacing: '1.6px',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        {title}
      </span>
      {action && (
        <button
          onClick={onAction}
          style={{
            background: 'transparent',
            border: `1px solid ${accentColor ?? 'var(--border)'}30`,
            color: accentColor ?? 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 12px',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
