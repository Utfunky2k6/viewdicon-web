'use client'

/**
 * CowrieCoin — Pan-African dual-currency coin visual.
 *
 * CWR (Cowrie Shell): Warm terracotta/gold — authentic cowrie shell body,
 *   central ridge slit with teeth, diamond rim knurling.
 * AFC (AfriCoin): Deep forest-green/gold — Africa continent silhouette,
 *   Adinkra Gye Nyame pattern background, radiant sun rays.
 *
 * Designed to stand as equals to Bitcoin/Ethereum coin visuals.
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
const STYLE_ID = '__cowrie-coin-anim'

function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    @keyframes coinGlow {
      0%,100% { filter: drop-shadow(0 0 3px rgba(201,168,76,0.25)) drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }
      50%      { filter: drop-shadow(0 0 10px rgba(201,168,76,0.55)) drop-shadow(0 2px 12px rgba(0,0,0,0.6)); }
    }
    @keyframes coinGlowGreen {
      0%,100% { filter: drop-shadow(0 0 3px rgba(74,222,128,0.2)) drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }
      50%      { filter: drop-shadow(0 0 10px rgba(74,222,128,0.45)) drop-shadow(0 2px 12px rgba(0,0,0,0.6)); }
    }
    @keyframes coinSpin {
      0%   { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
  `
  document.head.appendChild(style)
}

/* ── Knurled rim — 24 ridge marks ───────────────────────────── */
function KnurledRim({ count = 24 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI
        const r1 = 47.2, r2 = 49.2
        const x1 = 50 + r1 * Math.cos(angle), y1 = 50 + r1 * Math.sin(angle)
        const x2 = 50 + r2 * Math.cos(angle), y2 = 50 + r2 * Math.sin(angle)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A84C" strokeWidth="1.2" opacity={0.55} />
      })}
    </>
  )
}

/* ── Cowrie Shell face (CWR) ─────────────────────────────────── */
function CwrFace() {
  return (
    <g>
      {/* Gye Nyame mini pattern — background texture at low opacity */}
      <g opacity="0.07" fill="#C9A84C">
        {[[-6,-6],[6,-6],[-6,6],[6,6]].map(([dx,dy],i)=>(
          <g key={i} transform={`translate(${50+dx},${50+dy})`}>
            <ellipse rx="2.5" ry="1.4"/><ellipse ry="2.5" rx="1.4"/>
            <circle r="0.7" cy="-3.2"/><circle r="0.7" cy="3.2"/>
          </g>
        ))}
      </g>

      {/* Inner decorative ring */}
      <circle cx="50" cy="50" r="38" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#C9A84C" strokeWidth="0.25" opacity="0.18" />

      {/* Main cowrie shell body */}
      <ellipse cx="50" cy="50" rx="15" ry="21" fill="url(#cwr-shell)" />

      {/* Shell 3D highlight — top sheen */}
      <ellipse cx="44" cy="42" rx="7" ry="9" fill="white" opacity="0.10" transform="rotate(-12, 44, 42)" />

      {/* Central ridge / slit */}
      <ellipse cx="50" cy="50" rx="4" ry="16.5" fill="none" stroke="#3D1A06" strokeWidth="2.2" />
      <ellipse cx="50" cy="50" rx="2.6" ry="14.5" fill="none" stroke="#6B3A18" strokeWidth="0.8" opacity="0.6" />

      {/* Cowrie teeth — 7 serrations */}
      {Array.from({length:7}).map((_,i) => {
        const y = 50 + (i - 3) * 4.2
        return <line key={i} x1={46.5} y1={y} x2={53.5} y2={y} stroke="#5C2A0A" strokeWidth="0.8" opacity={0.55} />
      })}

      {/* Shell end caps */}
      <ellipse cx="50" cy="31.5" rx="3.2" ry="2" fill="#C9A84C" opacity="0.7" />
      <ellipse cx="50" cy="68.5" rx="3.2" ry="2" fill="#C9A84C" opacity="0.7" />

      {/* Dotted ornamental border */}
      {Array.from({length:20}).map((_,i)=>{
        const a = (i/20)*2*Math.PI
        return <circle key={i} cx={50+31*Math.cos(a)} cy={50+31*Math.sin(a)} r="0.9" fill="#C9A84C" opacity={0.22} />
      })}

      {/* "COWRIE" arced at top */}
      <defs>
        <path id="cwr-arc-t" d="M 14,50 A 36,36 0 0,1 86,50" fill="none" />
        <path id="cwr-arc-b" d="M 86,50 A 36,36 0 0,1 14,50" fill="none" />
      </defs>
      <text fontFamily="'Georgia',serif" fontSize="6.2" fontWeight="bold" fill="#FFE082" letterSpacing="2.5">
        <textPath href="#cwr-arc-t" startOffset="50%" textAnchor="middle">COWRIE SHELL</textPath>
      </text>
      <text fontFamily="'Georgia',serif" fontSize="7" fontWeight="bold" fill="#FFE082" letterSpacing="3">
        <textPath href="#cwr-arc-b" startOffset="50%" textAnchor="middle">₡ · CWR</textPath>
      </text>
    </g>
  )
}

/* ── AfriCoin face (AFC) ─────────────────────────────────────── */
function AfcFace() {
  /* Constellation dots */
  const stars = [
    {x:20,y:22,r:1.0},{x:78,y:20,r:0.7},{x:13,y:42,r:0.6},{x:87,y:38,r:0.9},
    {x:16,y:62,r:0.7},{x:83,y:60,r:0.8},{x:24,y:78,r:0.6},{x:75,y:76,r:0.7},
    {x:31,y:30,r:0.5},{x:69,y:28,r:0.5},{x:14,y:50,r:0.7},{x:86,y:52,r:0.6},
    {x:26,y:68,r:0.5},{x:73,y:67,r:0.5},{x:36,y:84,r:0.6},{x:64,y:82,r:0.5},
    {x:42,y:17,r:0.4},{x:58,y:85,r:0.4},{x:11,y:32,r:0.5},{x:89,y:72,r:0.5},
  ]

  /* Africa continent — clean accurate path */
  const africa = [
    'M48,24', 'Q52,22 57,25',   // N Morocco → Tunisia
    'L61,28', 'L63,34',           // Libya
    'L65,39', 'Q66,44 64,47',    // Horn approach
    'L62,51', 'L63,57',           // East coast
    'L60,62', 'L56,67',           // Mozambique
    'Q52,72 50,74',               // Cape of Good Hope
    'Q48,72 44,67',               // West of Cape
    'L40,62', 'L37,56',           // Angola/Namibia
    'L36,50', 'L35,44',           // Congo/Gabon
    'Q34,39 36,35',               // West Africa bulge
    'L39,30', 'L44,26',           // Mauritania/Senegal
    'Z',
  ].join(' ')

  return (
    <g>
      {/* Star field */}
      {stars.map((s,i)=>(
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFE082" opacity={0.15+(i%5)*0.05} />
      ))}

      {/* Adinkra Gye Nyame watermark behind continent */}
      <g opacity="0.08" fill="#4ade80">
        <ellipse cx="50" cy="50" rx="9" ry="5"/><ellipse cx="50" cy="50" rx="5" ry="9"/>
        <circle cx="50" cy="40" r="1.5"/><circle cx="50" cy="60" r="1.5"/>
        <circle cx="40" cy="50" r="1.5"/><circle cx="60" cy="50" r="1.5"/>
        <circle cx="50" cy="50" r="3.5" fill="none" stroke="#4ade80" strokeWidth="1"/>
      </g>

      {/* Radiant sun rays — 16 rays */}
      {Array.from({length:16}).map((_,i)=>{
        const a = (i/16)*2*Math.PI
        const x1=50+14*Math.cos(a), y1=50+14*Math.sin(a)
        const x2=50+30*Math.cos(a), y2=50+30*Math.sin(a)
        const thick = i%4===0
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A84C" strokeWidth={thick?2.2:1.1} opacity={thick?0.5:0.25} strokeLinecap="round"/>
      })}

      {/* Sun halo */}
      <circle cx="50" cy="50" r="11" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.2"/>
      <circle cx="50" cy="50" r="7" fill="#C9A84C" opacity="0.10"/>

      {/* Africa continent */}
      <path d={africa} fill="url(#afc-gold)" opacity="0.96"/>

      {/* Continent edge glow */}
      <path d={africa} fill="none" stroke="#FFE082" strokeWidth="0.8" opacity="0.5"/>

      {/* Inner decorative ring */}
      <circle cx="50" cy="50" r="38" fill="none" stroke="#4ade80" strokeWidth="0.5" opacity="0.2"/>

      {/* "AFRICOIN" arc text */}
      <defs>
        <path id="afc-arc-t" d="M 13,50 A 37,37 0 0,1 87,50" fill="none"/>
        <path id="afc-arc-b" d="M 87,50 A 37,37 0 0,1 13,50" fill="none"/>
      </defs>
      <text fontFamily="'Georgia',serif" fontSize="6.2" fontWeight="bold" fill="#FFE082" letterSpacing="2">
        <textPath href="#afc-arc-t" startOffset="50%" textAnchor="middle">AFRICOIN · AFC</textPath>
      </text>
      <text fontFamily="'Georgia',serif" fontSize="7" fontWeight="bold" fill="#4ade80" letterSpacing="3">
        <textPath href="#afc-arc-b" startOffset="50%" textAnchor="middle">₳ · SOVEREIGN</textPath>
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
        animation: animated ? `${isCWR ? 'coinGlow' : 'coinGlowGreen'} 3s ease-in-out infinite` : 'none',
        ...style,
      }}
    >
      <defs>
        {/* ── CWR gradients ──────────────────────────── */}
        <radialGradient id="cwr-bg" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#C47A3A" />
          <stop offset="35%" stopColor="#8B4513" />
          <stop offset="75%" stopColor="#5C2A0A" />
          <stop offset="100%" stopColor="#3A1505" />
        </radialGradient>

        <radialGradient id="cwr-shell" cx="40%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#F8E4A0" />
          <stop offset="40%" stopColor="#D4A84C" />
          <stop offset="80%" stopColor="#96681A" />
          <stop offset="100%" stopColor="#6B4614" />
        </radialGradient>

        {/* ── AFC gradients ──────────────────────────── */}
        <radialGradient id="afc-bg" cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#1A5C30" />
          <stop offset="40%" stopColor="#0D3B1E" />
          <stop offset="75%" stopColor="#071A0E" />
          <stop offset="100%" stopColor="#020C06" />
        </radialGradient>

        <radialGradient id="afc-gold" cx="45%" cy="40%" r="58%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="55%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </radialGradient>

        {/* ── Shared outer rim ───────────────────────── */}
        <linearGradient id="rim-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FFE082" stopOpacity="1.0" />
          <stop offset="25%"  stopColor="#C9A84C" stopOpacity="0.8" />
          <stop offset="55%"  stopColor="#7A5A18" stopOpacity="0.5" />
          <stop offset="80%"  stopColor="#C9A84C" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFE082" stopOpacity="0.9" />
        </linearGradient>

        {/* ── Top specular ───────────────────────────── */}
        <radialGradient id="top-sheen" cx="35%" cy="25%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Outer rim (gold band) ────────────────────── */}
      <circle cx="50" cy="50" r="49.5" fill="url(#rim-gold)" />

      {/* ── Knurled edge marks ───────────────────────── */}
      <KnurledRim count={36} />

      {/* ── Main coin body ───────────────────────────── */}
      <circle cx="50" cy="50" r="46" fill={isCWR ? 'url(#cwr-bg)' : 'url(#afc-bg)'} />

      {/* ── Inner rim line ───────────────────────────── */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="#C9A84C" strokeWidth="0.6" strokeOpacity="0.35" />

      {/* ── Currency face ────────────────────────────── */}
      {isCWR ? <CwrFace /> : <AfcFace />}

      {/* ── Top specular highlight (3D sheen) ────────── */}
      <ellipse cx="38" cy="33" rx="16" ry="9" fill="url(#top-sheen)" transform="rotate(-18, 38, 33)" />

      {/* ── Bottom shadow (depth) ────────────────────── */}
      <ellipse cx="60" cy="70" rx="14" ry="7" fill="rgba(0,0,0,0.18)" transform="rotate(-18, 60, 70)" />
    </svg>
  )
}
