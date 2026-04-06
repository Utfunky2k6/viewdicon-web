export default function Loading() {
  const gyeNyameSvg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`;

  const keyframes = `
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
  `;

  const skeletonStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(255,255,255,.03) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.03) 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#050a06',
          position: 'relative',
          fontFamily: "'DM Sans', sans-serif",
          overflowX: 'hidden',
        }}
      >
        {/* Adinkra overlay */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: gyeNyameSvg,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px',
            opacity: 0.03,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Kente stripe */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)',
            zIndex: 10,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            paddingTop: '24px',
            paddingLeft: '16px',
            paddingRight: '16px',
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Status bar skeleton */}
          <div style={{ paddingTop: '12px' }}>
            <div
              style={{
                ...skeletonStyle,
                width: '280px',
                height: '16px',
              }}
            />
          </div>

          {/* Welcome card skeleton */}
          <div
            style={{
              ...skeletonStyle,
              width: '100%',
              height: '120px',
              borderRadius: '16px',
            }}
          />

          {/* Village row — 3 skeleton tiles */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  ...skeletonStyle,
                  flex: 1,
                  height: '90px',
                  borderRadius: '12px',
                }}
              />
            ))}
          </div>

          {/* Quick actions — 4 skeleton tiles in a 2×2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  ...skeletonStyle,
                  height: '72px',
                  borderRadius: '12px',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
