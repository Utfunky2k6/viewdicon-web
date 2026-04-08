'use client'

// ============================================================
// LoadingState — Reusable full-viewport loading component
// Animated African drum bars: 5 bars, each bouncing at
// staggered phases to mimic the talking drum rhythm.
// ============================================================

export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  const keyframes = `
    @keyframes db {
      0%, 100% { transform: scaleY(.4); opacity: .5; }
      50%       { transform: scaleY(1);  opacity: 1;  }
    }
  `

  const bars = [
    { delay: '0s',    height: 36 },
    { delay: '0.12s', height: 52 },
    { delay: '0.24s', height: 44 },
    { delay: '0.36s', height: 60 },
    { delay: '0.48s', height: 40 },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        role="status"
        aria-label={text}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#070e07',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          zIndex: 9999,
        }}
      >
        {/* Drum bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            height: '64px',
          }}
        >
          {bars.map((bar, i) => (
            <div
              key={i}
              style={{
                width: '10px',
                height: `${bar.height}px`,
                borderRadius: '4px 4px 2px 2px',
                background: i % 2 === 0 ? '#1a7c3e' : '#d4a017',
                transformOrigin: 'bottom',
                animation: `db 0.8s ease-in-out infinite`,
                animationDelay: bar.delay,
              }}
            />
          ))}
        </div>

        {/* Label */}
        <p
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '13px',
            color: 'rgba(240,247,240,0.4)',
            margin: 0,
            letterSpacing: '0.04em',
          }}
        >
          {text}
        </p>
      </div>
    </>
  )
}
