'use client'

export default function LoveError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh', background: '#0f0800',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❤️</div>
      <h2 style={{
        fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700,
        color: '#d4a017', margin: '0 0 8px',
      }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 13, color: 'rgba(255,235,180,0.55)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 300 }}>
        Love World encountered an unexpected issue. Try again below.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#d4a017', color: '#0f0800', border: 'none', borderRadius: 12,
          padding: '12px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Sora, sans-serif',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
