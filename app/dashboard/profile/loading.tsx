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

        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {/* Banner skeleton — 200px tall */}
          <div
            style={{
              ...skeletonStyle,
              width: '100%',
              height: '200px',
              borderRadius: 0,
              position: 'relative',
            }}
          />

          <div
            style={{
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Avatar circle — overlapping the banner */}
            <div
              style={{
                marginTop: '-40px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '12px',
              }}
            >
              <div
                style={{
                  ...skeletonStyle,
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  border: '3px solid #050a06',
                }}
              />
            </div>

            {/* Name + handle lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ ...skeletonStyle, width: '160px', height: '20px' }} />
              <div style={{ ...skeletonStyle, width: '110px', height: '14px' }} />
            </div>

            {/* Stats row — 3 numbers */}
            <div style={{ display: 'flex', gap: '24px' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ ...skeletonStyle, width: '48px', height: '20px' }} />
                  <div style={{ ...skeletonStyle, width: '56px', height: '12px' }} />
                </div>
              ))}
            </div>

            {/* Skin tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid rgba(255,255,255,.06)',
                paddingBottom: '12px',
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    ...skeletonStyle,
                    width: i === 0 ? '72px' : '60px',
                    height: '32px',
                    borderRadius: '20px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
