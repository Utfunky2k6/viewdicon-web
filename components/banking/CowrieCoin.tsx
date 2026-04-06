'use client'

/**
 * CowrieCoin — Pan-African dual-currency coin visual.
 *
 * CWR (Cowrie Shell): Terracotta/gold gradient, stylised cowrie shell
 *   with central ridge slit and diamond rim pattern.
 * AFC (AfriCoin): Deep cosmic blue/gold gradient, African continent
 *   silhouette with sun rays and constellation dots.
 *
 * Pure SVG. Zero dependencies. Scalable at any size.
 */

import React from 'react'

interface CowrieCoinProps {
  currency: 'CWR' | 'AFC'
  size?: number
  animated?: boolean
  style?: React.CSSProperties
}

/* ── Keyframe animation injected once ────────────────────────── */
const STYLE_ID = '__cowrie-coin-glow'

function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    @keyframes cowrieCoinGlow {
      0%   { filter: drop-shadow(0 0 4px rgba(201,168,76,0.30)); }
      50%  { filter: drop-shadow(0 0 12px rgba(201,168,76,0.65)); }
      100% { filter: drop-shadow(0 0 4px rgba(201,168,76,0.30)); }
    }
  `
  document.head.appendChild(style)
}

/* ── Cowrie shell face ───────────────────────────────────────── */
function CwrFace() {
  return (
    <g>
      {/* Diamond rim pattern — 16 diamonds evenly spaced */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180
        const cx = 50 + 41 * Math.cos(angle)
        const cy = 50 + 41 * Math.sin(angle)
        return (
          <polygon
            key={i}
            points={`${cx},${cy - 2.8} ${cx + 1.6},${cy} ${cx},${cy + 2.8} ${cx - 1.6},${cy}`}
            fill="#C9A84C"
            opacity={0.65}
          />
        )
      })}

      {/* Inner decorative ring */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="#C9A84C" strokeWidth="0.4" opacity="0.35" />

      {/* Main cowrie shell body — the smooth oval shape */}
      <ellipse cx="50" cy="50" rx="17" ry="23" fill="url(#cwr-shell)" />

      {/* Shell body highlight — top-left sheen */}
      <ellipse
        cx="44"
        cy="42"
        rx="8"
        ry="10"
        fill="white"
        opacity="0.08"
        transform="rotate(-15, 44, 42)"
      />

      {/* Central ridge / slit — the natural cowrie opening */}
      <ellipse cx="50" cy="50" rx="4.5" ry="17" fill="none" stroke="#5C2A0A" strokeWidth="2" />

      {/* Inner ridge shadow for depth */}
      <ellipse cx="50" cy="50" rx="3" ry="15" fill="none" stroke="#8B4513" strokeWidth="0.6" opacity="0.5" />

      {/* Cowrie teeth — serrations along the slit opening */}
      {[-4, -2.5, -1, 0.5, 2, 3.5].map((offset, i) => (
        <line
          key={i}
          x1={50 - 4}
          y1={50 + offset * 3.2}
          x2={50 + 4}
          y2={50 + offset * 3.2}
          stroke="#6B4226"
          strokeWidth="0.7"
          opacity="0.6"
        />
      ))}

      {/* Shell tip accents — natural cowrie has rounded ends */}
      <ellipse cx="50" cy="29" rx="3" ry="1.8" fill="#C9A84C" opacity="0.6" />
      <ellipse cx="50" cy="71" rx="3" ry="1.8" fill="#C9A84C" opacity="0.6" />

      {/* "COWRIE" arced at top */}
      <defs>
        <path id="cwr-arc-top" d="M 15,50 A 35,35 0 0,1 85,50" fill="none" />
      </defs>
      <text
        fontFamily="'Georgia', serif"
        fontSize="6.5"
        fontWeight="bold"
        fill="#FFE082"
        letterSpacing="3"
      >
        <textPath href="#cwr-arc-top" startOffset="50%" textAnchor="middle">
          COWRIE
        </textPath>
      </text>

      {/* "CWR" at bottom center */}
      <text
        x="50"
        y="90"
        textAnchor="middle"
        fontFamily="'Georgia', serif"
        fontSize="10"
        fontWeight="bold"
        fill="#FFE082"
        letterSpacing="2.5"
      >
        CWR
      </text>
    </g>
  )
}

/* ── AfriCoin face ───────────────────────────────────────────── */
function AfcFace() {
  /* Constellation star positions — scattered organically */
  const stars = [
    { x: 22, y: 24, r: 1.1 }, { x: 78, y: 22, r: 0.8 }, { x: 14, y: 40, r: 0.6 },
    { x: 86, y: 38, r: 1.0 }, { x: 18, y: 60, r: 0.7 }, { x: 82, y: 58, r: 0.9 },
    { x: 25, y: 76, r: 0.6 }, { x: 76, y: 75, r: 0.7 }, { x: 30, y: 32, r: 0.5 },
    { x: 70, y: 30, r: 0.5 }, { x: 15, y: 50, r: 0.8 }, { x: 85, y: 50, r: 0.6 },
    { x: 28, y: 68, r: 0.5 }, { x: 72, y: 66, r: 0.6 }, { x: 35, y: 82, r: 0.7 },
    { x: 65, y: 80, r: 0.5 }, { x: 20, y: 34, r: 0.4 }, { x: 80, y: 44, r: 0.4 },
    { x: 32, y: 22, r: 0.6 }, { x: 68, y: 78, r: 0.5 }, { x: 40, y: 18, r: 0.4 },
    { x: 60, y: 84, r: 0.4 }, { x: 12, y: 30, r: 0.5 }, { x: 88, y: 70, r: 0.5 },
  ]

  return (
    <g>
      {/* Constellation dots */}
      {stars.map((s, i) => (
        <circle
          key={`star-${i}`}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#FFE082"
          opacity={0.2 + (i % 4) * 0.12}
        />
      ))}

      {/* Sun rays emanating from behind continent */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x1 = 50 + 12 * Math.cos(angle)
        const y1 = 50 + 12 * Math.sin(angle)
        const x2 = 50 + 30 * Math.cos(angle)
        const y2 = 50 + 30 * Math.sin(angle)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#C9A84C"
            strokeWidth={i % 3 === 0 ? '1.8' : '1'}
            opacity={i % 3 === 0 ? 0.5 : 0.3}
            strokeLinecap="round"
          />
        )
      })}

      {/* Sun glow core behind continent */}
      <circle cx="50" cy="48" r="10" fill="#C9A84C" opacity="0.12" />
      <circle cx="50" cy="48" r="6" fill="#FFE082" opacity="0.08" />

      {/* African continent silhouette — refined shape */}
      <path
        d={[
          'M 48,26',            // NW coast (Morocco)
          'Q 52,24 56,26',     // N coast (Tunisia)
          'L 59,28',            // NE (Libya)
          'L 61,32',            // Suez area
          'L 63,37',            // Horn of Africa approach
          'Q 64,41 63,44',     // Horn of Africa tip
          'L 61,47',            // East coast (Somalia/Kenya)
          'L 62,51',            // Tanzania
          'L 60,56',            // Mozambique
          'L 57,61',            // Madagascar channel
          'L 54,66',            // South Africa east
          'Q 51,71 50,73',     // Cape of Good Hope
          'Q 49,71 46,66',     // South Africa west
          'L 43,61',            // Namibia
          'L 40,56',            // Angola
          'L 38,51',            // Congo coast
          'L 37,47',            // Gabon
          'L 37,43',            // Nigeria
          'Q 36,39 37,36',     // West African bulge
          'L 39,32',            // Senegal/Mauritania
          'L 42,28',            // Western Sahara
          'Z',
        ].join(' ')}
        fill="url(#afc-gold)"
        opacity="0.92"
      />

      {/* Continent edge glow */}
      <path
        d={[
          'M 48,26',
          'Q 52,24 56,26',
          'L 59,28', 'L 61,32', 'L 63,37',
          'Q 64,41 63,44',
          'L 61,47', 'L 62,51', 'L 60,56', 'L 57,61', 'L 54,66',
          'Q 51,71 50,73',
          'Q 49,71 46,66',
          'L 43,61', 'L 40,56', 'L 38,51', 'L 37,47', 'L 37,43',
          'Q 36,39 37,36',
          'L 39,32', 'L 42,28', 'Z',
        ].join(' ')}
        fill="none"
        stroke="#FFE082"
        strokeWidth="0.6"
        opacity="0.55"
      />

      {/* "AFRICOIN" arced at top */}
      <defs>
        <path id="afc-arc-top" d="M 13,50 A 37,37 0 0,1 87,50" fill="none" />
      </defs>
      <text
        fontFamily="'Georgia', serif"
        fontSize="6"
        fontWeight="bold"
        fill="#FFE082"
        letterSpacing="2"
      >
        <textPath href="#afc-arc-top" startOffset="50%" textAnchor="middle">
          AFRICOIN
        </textPath>
      </text>

      {/* "AFC" at bottom center */}
      <text
        x="50"
        y="90"
        textAnchor="middle"
        fontFamily="'Georgia', serif"
        fontSize="10"
        fontWeight="bold"
        fill="#FFE082"
        letterSpacing="2.5"
      >
        AFC
      </text>
    </g>
  )
}

/* ── Main component ──────────────────────────────────────────── */
export default function CowrieCoin({
  currency,
  size = 80,
  animated = true,
  style,
}: CowrieCoinProps) {
  const isCWR = currency === 'CWR'

  React.useEffect(() => {
    if (animated) ensureKeyframes()
  }, [animated])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        display: 'block',
        animation: animated ? 'cowrieCoinGlow 2.8s ease-in-out infinite' : 'none',
        ...style,
      }}
    >
      <defs>
        {/* ── CWR gradients ──────────────────────────── */}
        <radialGradient id="cwr-bg" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#D2691E" />
          <stop offset="40%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#4A1E06" />
        </radialGradient>

        <radialGradient id="cwr-shell" cx="45%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#F5D78E" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>

        {/* ── AFC gradients ──────────────────────────── */}
        <radialGradient id="afc-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#283593" />
          <stop offset="50%" stopColor="#1A237E" />
          <stop offset="100%" stopColor="#0A0F3C" />
        </radialGradient>

        <radialGradient id="afc-gold" cx="48%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="60%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#9A7B2F" />
        </radialGradient>

        {/* ── Shared rim gradient ────────────────────── */}
        <linearGradient id="rim-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#C9A84C" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#8B6914" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.6" />
        </linearGradient>

        {/* ── Edge bevel gradient ────────────────────── */}
        <linearGradient id="rim-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#8B6914" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFE082" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* ── Outer rim ring ───────────────────────────── */}
      <circle cx="50" cy="50" r="49.5" fill="url(#rim-shine)" />

      {/* ── Rim bevel (edge depth) ───────────────────── */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#rim-bevel)" strokeWidth="1.2" />

      {/* ── Main coin body ───────────────────────────── */}
      <circle cx="50" cy="50" r="46" fill={isCWR ? 'url(#cwr-bg)' : 'url(#afc-bg)'} />

      {/* ── Inner rim line ───────────────────────────── */}
      <circle
        cx="50"
        cy="50"
        r="44.5"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />

      {/* ── Currency face ────────────────────────────── */}
      {isCWR ? <CwrFace /> : <AfcFace />}

      {/* ── Top specular highlight (3D sheen) ────────── */}
      <ellipse
        cx="40"
        cy="35"
        rx="14"
        ry="8"
        fill="white"
        opacity="0.055"
        transform="rotate(-20, 40, 35)"
      />
    </svg>
  )
}
