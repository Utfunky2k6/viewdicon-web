'use client'

export default function AjoConnectError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh', background: '#060D06',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
      <h2 style={{
        fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 700,
        color: '#22c55e', margin: '0 0 8px',
      }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 13, color: 'rgba(167,243,160,0.5)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 300 }}>
        ÀJỌ Connect encountered an unexpected issue. Try again below.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#22c55e', color: '#060D06', border: 'none', borderRadius: 12,
          padding: '12px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Sora, sans-serif',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
