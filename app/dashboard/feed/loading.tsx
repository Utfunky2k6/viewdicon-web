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
          {/* Top bar: avatar + title row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '12px',
            }}
          >
            <div
              style={{
                ...skeletonStyle,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ ...skeletonStyle, width: '140px', height: '14px' }} />
              <div style={{ ...skeletonStyle, width: '90px', height: '12px' }} />
            </div>
          </div>

          {/* Stories row — 5 circles 48px */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  ...skeletonStyle,
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* 3 post card skeletons */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'rgba(255,255,255,.025)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Avatar + name row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    ...skeletonStyle,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ ...skeletonStyle, width: '120px', height: '13px' }} />
                  <div style={{ ...skeletonStyle, width: '80px', height: '11px' }} />
                </div>
              </div>

              {/* 3 text lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ ...skeletonStyle, width: '100%', height: '13px' }} />
                <div style={{ ...skeletonStyle, width: '85%', height: '13px' }} />
                <div style={{ ...skeletonStyle, width: '65%', height: '13px' }} />
              </div>

              {/* Action bar */}
              <div style={{ display: 'flex', gap: '16px', paddingTop: '4px' }}>
                {[0, 1, 2].map((j) => (
                  <div key={j} style={{ ...skeletonStyle, width: '48px', height: '28px', borderRadius: '6px' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
