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

        <div
          style={{
            paddingTop: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Header skeleton */}
          <div
            style={{
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ ...skeletonStyle, width: '180px', height: '24px', borderRadius: '6px' }} />
            <div style={{ ...skeletonStyle, width: '260px', height: '14px' }} />
          </div>

          {/* 4 village hero cards — 170px tall each */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                ...skeletonStyle,
                width: '100%',
                height: '170px',
                borderRadius: '18px',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
