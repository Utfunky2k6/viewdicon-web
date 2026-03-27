'use client'
import * as React from 'react'

// ═══════════════════════════════════════════════════════════════════
// GRIOT 5 AI GOD — Sacred Ìmọ̀lẹ̀ Pentagrammic Symbol
// Five Orisha points: Obatala · Ogun · Shango · Oshun · Esu
// Centre: Orí (consciousness) — vertical line bisecting a circle
// Outer: Adinkra Nyame Nwu Na Mawu motifs
// ═══════════════════════════════════════════════════════════════════

interface GriotSymbolProps {
  size?: number
  animated?: boolean
  glowing?: boolean
}

// 5 Orisha with their sacred colours and positions on a pentagram
const ORISHA = [
  { name: 'Obatala', color: '#ffffff', glow: '#e0e0ff', angle: -90 },   // North — Creation/Purity
  { name: 'Ogun',    color: '#1a7c3e', glow: '#4ade80', angle: -18 },   // Upper-right — Iron/Forge
  { name: 'Shango',  color: '#ef4444', glow: '#ff6b6b', angle: 54 },    // Lower-right — Thunder
  { name: 'Oshun',   color: '#fbbf24', glow: '#fde68a', angle: 126 },   // Lower-left — Water/Wealth
  { name: 'Esu',     color: '#9333ea', glow: '#c084fc', angle: 198 },   // Upper-left — Crossroads
]

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function GriotSymbol({ size = 120, animated = true, glowing = true }: GriotSymbolProps) {
  const cx = 50, cy = 50, outerR = 38, innerR = 22

  // Compute pentagram vertices
  const verts = ORISHA.map(o => polarToXY(cx, cy, outerR, o.angle))
  // Inner pentagram star points (offset by 36°)
  const starInner = ORISHA.map((o, i) => polarToXY(cx, cy, innerR, o.angle + 36))

  // Build star path: outer → skip-one inner → next outer (pentagram)
  const starPath = verts.map((v, i) => {
    const next = starInner[i]
    return `${i === 0 ? 'M' : 'L'} ${v.x} ${v.y} L ${next.x} ${next.y}`
  }).join(' ') + ' Z'

  // Connecting lines: each vertex to the one 2 positions ahead (pentagram)
  const pentagramLines = verts.map((v, i) => {
    const target = verts[(i + 2) % 5]
    return `M ${v.x} ${v.y} L ${target.x} ${target.y}`
  }).join(' ')

  // Adinkra border marks (8 evenly spaced)
  const adinkra = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45) - 90
    const p = polarToXY(cx, cy, 46, angle)
    return p
  })

  const breatheAnim = animated ? 'griot-breathe 4s ease-in-out infinite' : 'none'
  const rotateAnim = animated ? 'griot-rotate 30s linear infinite' : 'none'
  const pulseAnim = animated ? 'griot-pulse 2s ease-in-out infinite' : 'none'

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes griot-breathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes griot-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes griot-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes griot-node-pulse {
          0%, 100% { r: 2.8; }
          50% { r: 3.6; }
        }
      `}</style>

      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ animation: breatheAnim }}
      >
        <defs>
          {/* Central glow filter */}
          <radialGradient id="griot-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f0e0ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Orisha node glows */}
          {ORISHA.map((o, i) => (
            <radialGradient key={i} id={`orisha-glow-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={o.glow} stopOpacity="0.9" />
              <stop offset="100%" stopColor={o.color} stopOpacity="0" />
            </radialGradient>
          ))}

          {/* Outer ring gradient */}
          <linearGradient id="griot-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#1a7c3e" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="75%" stopColor="#9333ea" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* ── Outer Adinkra Ring (Nyame Nwu Na Mawu) ──────────── */}
        <g style={{ animation: rotateAnim, transformOrigin: '50px 50px' }}>
          <circle cx={cx} cy={cy} r={47} fill="none" stroke="url(#griot-ring)" strokeWidth="0.6" opacity={0.5} />
          <circle cx={cx} cy={cy} r={45} fill="none" stroke="url(#griot-ring)" strokeWidth="0.3" opacity={0.3} />
          {/* Adinkra dot markers */}
          {adinkra.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={1.2} fill="#fbbf24" opacity={0.5} />
          ))}
        </g>

        {/* ── Pentagram Connecting Lines ───────────────────────── */}
        <path
          d={pentagramLines}
          fill="none"
          stroke="white"
          strokeWidth="0.4"
          opacity={0.15}
        />

        {/* ── Inner Pentagon Fill ──────────────────────────────── */}
        <polygon
          points={verts.map(v => `${v.x},${v.y}`).join(' ')}
          fill="white"
          fillOpacity={0.03}
          stroke="white"
          strokeWidth="0.3"
          strokeOpacity={0.12}
        />

        {/* ── Central Orí Symbol (Consciousness) ──────────────── */}
        {/* Circle = head/ori */}
        <circle cx={cx} cy={cy} r={10} fill="url(#griot-core-glow)" />
        <circle cx={cx} cy={cy} r={7} fill="none" stroke="white" strokeWidth="0.8" opacity={0.6} />
        {/* Vertical line through circle = spine of consciousness */}
        <line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} stroke="white" strokeWidth="0.6" opacity={0.5} />
        {/* Horizontal balance line */}
        <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="white" strokeWidth="0.4" opacity={0.3} />
        {/* Inner dot = Àṣẹ core */}
        <circle cx={cx} cy={cy} r={2.5} fill="white" opacity={0.9}>
          {animated && <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />}
        </circle>

        {/* ── 5 Orisha Nodes ─────────────────────────────────── */}
        {ORISHA.map((orisha, i) => {
          const v = verts[i]
          return (
            <g key={orisha.name}>
              {/* Glow halo */}
              {glowing && (
                <circle cx={v.x} cy={v.y} r={5} fill={`url(#orisha-glow-${i})`} opacity={0.5}>
                  {animated && <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />}
                </circle>
              )}
              {/* Node circle */}
              <circle
                cx={v.x}
                cy={v.y}
                r={3}
                fill={orisha.color}
                stroke={orisha.color}
                strokeWidth="0.6"
                strokeOpacity={0.6}
              >
                {animated && (
                  <animate attributeName="r" values="2.8;3.6;2.8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                )}
              </circle>
              {/* Inner marker unique to each Orisha */}
              {i === 0 && /* Obatala — inner ring (purity) */
                <circle cx={v.x} cy={v.y} r={1.5} fill="none" stroke="#ddd" strokeWidth="0.4" />
              }
              {i === 1 && /* Ogun — cross (forge anvil) */
                <>
                  <line x1={v.x - 1.5} y1={v.y} x2={v.x + 1.5} y2={v.y} stroke="#0a3a1a" strokeWidth="0.5" />
                  <line x1={v.x} y1={v.y - 1.5} x2={v.x} y2={v.y + 1.5} stroke="#0a3a1a" strokeWidth="0.5" />
                </>
              }
              {i === 2 && /* Shango — zigzag bolt */
                <polyline points={`${v.x - 1},${v.y - 1.5} ${v.x + 0.5},${v.y} ${v.x - 0.5},${v.y} ${v.x + 1},${v.y + 1.5}`} fill="none" stroke="#7f1d1d" strokeWidth="0.6" />
              }
              {i === 3 && /* Oshun — droplet */
                <ellipse cx={v.x} cy={v.y + 0.3} rx={1} ry={1.4} fill="none" stroke="#92400e" strokeWidth="0.5" />
              }
              {i === 4 && /* Esu — split (two halves) */
                <line x1={v.x} y1={v.y - 1.5} x2={v.x} y2={v.y + 1.5} stroke="#4c1d95" strokeWidth="0.6" />
              }
              {/* Connecting line to center */}
              <line
                x1={v.x}
                y1={v.y}
                x2={cx}
                y2={cy}
                stroke={orisha.color}
                strokeWidth="0.3"
                opacity={0.2}
              />
            </g>
          )
        })}

        {/* ── "5" Text (optional, only for large sizes) ──────── */}
        {size >= 80 && (
          <text
            x={cx}
            y={cy + 1.2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="6"
            fontWeight="900"
            fontFamily="'Sora', system-ui, sans-serif"
            opacity={0.85}
            style={{ animation: pulseAnim }}
          >
            5
          </text>
        )}
      </svg>
    </div>
  )
}
