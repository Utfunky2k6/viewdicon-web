'use client'
import * as React from 'react'

interface UbuntuRingProps {
  ubuntuScore: number      // 0-100
  crestProgress: number    // 0-100
  crestTier: number
  name: string
  villageName?: string
  nkisiState?: 'GREEN' | 'AMBER' | 'RED'
  heritage?: string
}

const GREET = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function UbuntuRing({
  ubuntuScore, crestProgress, crestTier, name,
  villageName = 'Commerce Village',
  nkisiState = 'GREEN',
  heritage = 'Akan',
}: UbuntuRingProps) {
  const [animated, setAnimated] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [])

  const outerLen = 239
  const outerOffset = animated ? outerLen - (outerLen * ubuntuScore / 100) : outerLen
  const innerLen = 176
  const innerOffset = animated ? innerLen - (innerLen * crestProgress / 100) : innerLen

  const NKISI_COLOR: Record<string, string> = {
    GREEN: '#4ade80', AMBER: '#fbbf24', RED: '#f87171',
  }
  const nkisiColor = NKISI_COLOR[nkisiState] ?? '#4ade80'

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0d1f12 0%, var(--bg) 100%)',
        padding: '20px 16px 16px',
      }}
    >
      {/* Adinkra overlay */}
      <div className="bg-adinkra bg-adinkra-overlay" />

      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -40,
          left: '30%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,124,62,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-[1] flex items-start gap-4 mb-4">
        {/* SVG ring */}
        <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="7" />
            <circle
              cx="45" cy="45" r="38"
              fill="none" stroke="url(#greenGrad)" strokeWidth="7"
              strokeDasharray={outerLen}
              strokeDashoffset={outerOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.25,0.46,0.45,0.94)', filter: 'drop-shadow(0 0 4px rgba(26,124,62,0.4))' }}
            />
            <circle cx="45" cy="45" r="28" fill="none" stroke="rgba(212,160,23,.15)" strokeWidth="4" />
            <circle
              cx="45" cy="45" r="28"
              fill="none" stroke="#d4a017" strokeWidth="4"
              strokeDasharray={innerLen}
              strokeDashoffset={innerOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s', filter: 'drop-shadow(0 0 3px rgba(212,160,23,0.3))' }}
            />
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1a7c3e" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f7f0', lineHeight: 1 }}>{ubuntuScore}</div>
            <div style={{ fontSize: 9, color: '#7da882', fontWeight: 600, textAlign: 'center', marginTop: 1 }}>Ubuntu<br />Score</div>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div style={{ fontSize: 10, fontWeight: 700, color: '#7da882', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>
            {GREET()}, {name.split(' ')[0]}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f0f7f0', lineHeight: 1.1, marginBottom: 6 }}>
            Welcome Home.
          </div>
          <div style={{ fontSize: 12, color: '#a7f3d0', lineHeight: 1.55, marginBottom: 10 }}>
            The village is alive. 3 new opportunities are waiting.
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip bg={`${nkisiColor}18`} border={`${nkisiColor}55`} color={nkisiColor}>🛡 Nkisi {nkisiState}</Chip>
            <Chip bg="rgba(212,160,23,.12)" border="rgba(212,160,23,.4)" color="#fbbf24">✦ Crest {crestTier}</Chip>
            <Chip bg="rgba(255,255,255,.06)" border="rgba(255,255,255,.1)" color="#f0f7f0">🌍 {heritage}</Chip>
          </div>
        </div>
      </div>

      <UbuntuVitalityStrip />
      <TalkingDrum />
    </div>
  )
}

function Chip({ bg, border, color, children }: { bg: string; border: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 99,
      padding: '3px 10px',
      fontSize: 10,
      color,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function UbuntuVitalityStrip() {
  const stats = [
    { num: '147',    label: 'Jobs\nDone',     live: false },
    { num: '₡4.2K',  label: "In Your\nPot",   live: false },
    { num: '52',     label: 'Kíla\nEarned',   live: false },
    { num: '🔴 4',  label: 'Live\nNow',       live: true  },
  ]

  return (
    <div className="relative z-[1] grid grid-cols-4 gap-2 mb-3">
      {stats.map(({ num, label, live }) => (
        <div
          key={label}
          className="rounded-xl text-center"
          style={{
            background: live ? 'rgba(239,68,68,.1)' : 'rgba(255,255,255,.05)',
            border: `1px solid ${live ? 'rgba(239,68,68,.4)' : 'rgba(255,255,255,.08)'}`,
            padding: '10px 4px 8px',
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 800, color: live ? '#f87171' : '#f0f7f0', lineHeight: 1 }}>{num}</div>
          <div style={{ fontSize: 9, color: '#7da882', marginTop: 3, fontWeight: 600, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function TalkingDrum() {
  return (
    <div
      className="relative z-[1] flex items-center gap-2.5 cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        padding: '10px 12px',
        background: 'rgba(255,255,255,.04)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,.08)',
      }}
    >
      <style>{`
        @keyframes dbeat { 0%,100%{transform:scaleY(1);opacity:.6} 50%{transform:scaleY(.4);opacity:1} }
      `}</style>
      <div className="flex items-center gap-[3px]" style={{ height: 20 }}>
        {[{ h: 6, d: '0s' }, { h: 14, d: '.1s' }, { h: 10, d: '.2s' }, { h: 18, d: '.15s' }, { h: 8, d: '.05s' }, { h: 14, d: '.25s' }].map(({ h, d }, i) => (
          <div key={i} style={{ width: 3, height: h, borderRadius: 99, background: '#1a7c3e', animation: `dbeat 0.8s ease-in-out ${d} infinite` }} />
        ))}
      </div>
      <div className="flex-1 min-w-0" style={{ fontSize: 11, color: '#a7f3d0', lineHeight: 1.45 }}>
        <strong>2 Kíla</strong> received · Fatima D. needs a runner · Ajo collects Friday
      </div>
      <div
        className="shrink-0 rounded-full"
        style={{ background: '#1a7c3e', color: '#fff', padding: '3px 10px', fontSize: 10, fontWeight: 700 }}
      >
        5 drums
      </div>
    </div>
  )
}
