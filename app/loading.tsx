export default function Loading() {
  const gyeNyameSvg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`;

  const keyframes = `
    @keyframes glow {
      0%, 100% { opacity: .6; }
      50% { opacity: 1; }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#050a06',
          backgroundImage: gyeNyameSvg,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px',
          backgroundBlendMode: 'normal',
          opacity: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Adinkra overlay at 3% opacity */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: gyeNyameSvg,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px',
            opacity: 0.03,
            pointerEvents: 'none',
          }}
        />

        {/* 4-colour Kente stripe at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)',
          }}
        />

        {/* Centered content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            zIndex: 1,
          }}
        >
          {/* Animated Gye Nyame SVG — 80px */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: 'glow 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 12px #1a7c3e)',
            }}
          >
            <g fill="none" stroke="#4ade80" strokeLinecap="round">
              <path d="M50 8 L92 50 L50 92 L8 50 Z" strokeWidth="1.8" />
              <path d="M50 22 L78 50 L50 78 L22 50 Z" strokeWidth="1.2" />
              <ellipse cx="50" cy="50" rx="7" ry="11" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="3" fill="#4ade80" stroke="none" />
              {/* Corner hooks — Gye Nyame detail */}
              <path d="M50 8 Q58 2 66 8 Q58 14 50 8 Z" strokeWidth="1" fill="none" />
              <path d="M92 50 Q98 42 92 34 Q86 42 92 50 Z" strokeWidth="1" fill="none" />
              <path d="M50 92 Q42 98 34 92 Q42 86 50 92 Z" strokeWidth="1" fill="none" />
              <path d="M8 50 Q2 58 8 66 Q14 58 8 50 Z" strokeWidth="1" fill="none" />
            </g>
          </svg>

          {/* Afrikonnect wordmark */}
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 900,
              fontSize: '28px',
              background: 'linear-gradient(135deg, #4ade80, #d4a017)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px',
            }}
          >
            Afrikonnect
          </span>

          {/* Subtitle */}
          <span
            style={{
              fontSize: '12px',
              color: '#d4a017',
              fontStyle: 'italic',
              opacity: 0.9,
            }}
          >
            Loading the Motherland...
          </span>

          {/* Loading bar */}
          <div
            style={{
              width: '200px',
              height: '6px',
              backgroundColor: 'rgba(255,255,255,.06)',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, #1a7c3e, #d4a017)',
                borderRadius: '999px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer shine strip */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '40%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  animation: 'shimmer 1.4s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* Rotating proverb — index 0 */}
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(240,247,240,0.45)',
              fontStyle: 'italic',
              maxWidth: '260px',
              textAlign: 'center',
              marginTop: '4px',
            }}
          >
            &ldquo;Umuntu ngumuntu ngabantu — Ubuntu&rdquo;
          </span>
        </div>
      </div>
    </>
  );
}
