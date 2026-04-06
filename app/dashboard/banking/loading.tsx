export default function Loading() {
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
          fontFamily: "'DM Sans', sans-serif",
          overflowX: 'hidden',
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
            background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)',
            zIndex: 10,
          }}
        />

        {/* 4px green top bar below kente */}
        <div
          style={{
            position: 'fixed',
            top: '4px',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#1a7c3e',
            zIndex: 9,
          }}
        />

        <div
          style={{
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
            <div style={{ ...skeletonStyle, width: '280px', height: '16px' }} />
          </div>

          {/* Market day banner */}
          <div
            style={{
              ...skeletonStyle,
              width: '100%',
              height: '48px',
              borderRadius: '12px',
            }}
          />

          {/* Balance hero — large centered rectangle 200px tall */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                ...skeletonStyle,
                width: '100%',
                height: '200px',
                borderRadius: '20px',
              }}
            />
          </div>

          {/* Section grid — 3×3 skeleton tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px',
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
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
