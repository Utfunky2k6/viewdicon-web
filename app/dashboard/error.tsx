'use client'

import Link from 'next/link'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const keyframes = `
    @keyframes adinkraSpin {
      0%   { transform: rotate(0deg);   opacity: .6; }
      50%  { transform: rotate(180deg); opacity: 1;  }
      100% { transform: rotate(360deg); opacity: .6; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#070e07',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif",
          padding: '32px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Kente stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg,#1a7c3e 25%,#d4a017 50%,#b22222 75%,#1a1a1a 100%)',
          }}
        />

        {/* Subtle background Adinkra watermark */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' strokeLinecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '80px 80px',
            opacity: 0.025,
            pointerEvents: 'none',
          }}
        />

        {/* Adinkra Dwennimmen symbol — ram's horns (strength & humility) */}
        <svg
          width="90"
          height="90"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: 'adinkraSpin 6s linear infinite', marginBottom: '28px' }}
          aria-hidden="true"
        >
          <g fill="none" stroke="#1a7c3e" strokeLinecap="round">
            {/* Outer ring */}
            <circle cx="50" cy="50" r="42" strokeWidth="1.4" stroke="#1a7c3e" />
            {/* Four Dwennimmen ram horns — rotational symmetry */}
            <path d="M50 8 C62 8 70 18 68 30 C66 40 56 44 50 44" strokeWidth="1.8" stroke="#d4a017" />
            <path d="M92 50 C92 62 82 70 70 68 C60 66 56 56 56 50" strokeWidth="1.8" stroke="#d4a017" />
            <path d="M50 92 C38 92 30 82 32 70 C34 60 44 56 50 56" strokeWidth="1.8" stroke="#d4a017" />
            <path d="M8 50 C8 38 18 30 30 32 C40 34 44 44 44 50" strokeWidth="1.8" stroke="#d4a017" />
            {/* Centre — Gyebi inner circle */}
            <circle cx="50" cy="50" r="10" strokeWidth="1.2" stroke="#1a7c3e" />
            <circle cx="50" cy="50" r="4" fill="#1a7c3e" stroke="none" />
            {/* Diagonal cross lines */}
            <line x1="44" y1="44" x2="56" y2="56" strokeWidth="0.8" stroke="#d4a017" />
            <line x1="56" y1="44" x2="44" y2="56" strokeWidth="0.8" stroke="#d4a017" />
          </g>
        </svg>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: '24px',
            color: '#f0f7f0',
            margin: '0 0 10px',
            letterSpacing: '-0.3px',
            animation: 'fadeUp 0.5s ease both',
          }}
        >
          Village Path Blocked
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(240,247,240,0.6)',
            maxWidth: '360px',
            lineHeight: 1.65,
            marginBottom: '10px',
            animation: 'fadeUp 0.55s ease both',
          }}
        >
          Something went wrong in this section of the platform.
        </p>

        {/* Dev error message */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <p
            style={{
              fontSize: '11px',
              color: '#b22222',
              maxWidth: '400px',
              lineHeight: 1.5,
              marginBottom: '10px',
              fontFamily: 'monospace',
              background: 'rgba(178,34,34,0.08)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(178,34,34,0.2)',
            }}
          >
            {error.message}
          </p>
        )}

        {/* African proverb */}
        <p
          style={{
            fontSize: '12px',
            color: '#d4a017',
            fontStyle: 'italic',
            maxWidth: '320px',
            lineHeight: 1.55,
            marginBottom: '32px',
            animation: 'fadeUp 0.6s ease both',
            opacity: 0.8,
          }}
        >
          &ldquo;A road that is not traveled becomes overgrown.&rdquo;
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              color: 'rgba(212,160,23,0.55)',
              fontStyle: 'normal',
              marginTop: '4px',
            }}
          >
            — Swahili Proverb
          </span>
        </p>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            animation: 'fadeUp 0.65s ease both',
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: '11px 28px',
              borderRadius: '12px',
              border: '1.5px solid #1a7c3e',
              background: 'transparent',
              color: '#4ade80',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = '#1a7c3e'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#4ade80'
            }}
          >
            Try Again
          </button>

          <Link
            href="/dashboard"
            style={{
              padding: '11px 28px',
              borderRadius: '12px',
              background: '#d4a017',
              color: '#070e07',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  )
}
