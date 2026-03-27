'use client'

const GRAD = 'linear-gradient(to right, #1a7c3e, #b22222)'

/** Full animated logo with spinning tri-color ring + vi letters + wordmark */
export function ViewdiconLogo({ size = 76 }: { size?: number }) {
  const inner = size * 0.79 // inset ratio
  const fontSize = size * 0.37
  const dotSize = Math.max(5, size * 0.09)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Spinning tri-color ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: `${Math.max(2, size * 0.033)}px solid transparent`,
            borderTopColor: '#1a7c3e',
            borderRightColor: '#d4a017',
            borderBottomColor: '#b22222',
            animationDuration: '3s',
          }}
        />
        {/* Inner circle with vi letters */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            inset: size - inner > 0 ? (size - inner) / 2 : 6,
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex items-center gap-px font-black leading-none" style={{ fontSize }}>
            <span style={{ color: '#1a7c3e' }}>v</span>
            <span className="relative" style={{ color: '#b22222' }}>
              i
              <div
                className="absolute rounded-full"
                style={{
                  top: -dotSize * 0.7,
                  right: -dotSize * 0.4,
                  width: dotSize,
                  height: dotSize,
                  background: '#d4a017',
                }}
              />
            </span>
          </div>
        </div>
      </div>
      <div
        className="font-extrabold lowercase mt-1.5"
        style={{
          fontSize: Math.max(10, size * 0.16),
          letterSpacing: '0.1em',
          background: GRAD,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        viewdicon
      </div>
    </div>
  )
}

/** Mini logo used in headers and step screens (icon + wordmark inline) */
export function ViewdiconMini() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[11px] font-black text-white"
        style={{ background: GRAD }}
      >
        vi
      </div>
      <span className="text-xs font-extrabold" style={{ color: '#1a7c3e' }}>viewdicon</span>
    </div>
  )
}

/** Tiny icon-only logo for TopBar / nav (no wordmark) */
export function ViewdiconIcon({ size = 28 }: { size?: number }) {
  const dotSize = Math.max(3, size * 0.15)
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          border: '1.5px solid transparent',
          borderTopColor: '#1a7c3e',
          borderRightColor: '#d4a017',
          borderBottomColor: '#b22222',
          animationDuration: '3s',
        }}
      />
      <div className="flex items-center gap-px font-black leading-none" style={{ fontSize: size * 0.4 }}>
        <span style={{ color: '#1a7c3e' }}>v</span>
        <span className="relative" style={{ color: '#b22222' }}>
          i
          <div
            className="absolute rounded-full"
            style={{
              top: -dotSize * 0.5,
              right: -dotSize * 0.3,
              width: dotSize,
              height: dotSize,
              background: '#d4a017',
            }}
          />
        </span>
      </div>
    </div>
  )
}
