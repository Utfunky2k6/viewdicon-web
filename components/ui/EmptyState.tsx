'use client'

/** Reusable empty-state component for pages with no data yet. */
export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
  onAction,
}: {
  icon: string
  title: string
  subtitle: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
      minHeight: 240,
    }}>
      <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>{icon}</div>
      <div style={{
        fontSize: 17,
        fontWeight: 800,
        color: 'var(--text, #f0f7f0)',
        marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontSize: 13,
        color: 'var(--sub-text, rgba(240,247,240,.45))',
        maxWidth: 280,
        lineHeight: 1.5,
      }}>{subtitle}</div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: 20,
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent, #4ade80)',
            color: '#000',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
