'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          textAlign: 'center',
          gap: '20px',
        }}
      >
        {/* Kente stripe */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg,#1a7c3e 25%,#d4a017 50%,#b22222 75%,#1a1a1a 100%)',
          }}
        />

        {/* Wordmark */}
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(212,160,23,0.5)',
            margin: 0,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Afrikonnect 360
        </p>

        {/* Main message */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#d4a017',
            margin: 0,
            maxWidth: '420px',
            lineHeight: 1.4,
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.35)',
            maxWidth: '320px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          A critical error occurred. Please reload the page to continue.
        </p>

        {/* Reload button */}
        <button
          onClick={reset}
          style={{
            padding: '12px 32px',
            borderRadius: '12px',
            border: 'none',
            background: '#1a7c3e',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          Reload
        </button>
      </body>
    </html>
  )
}
