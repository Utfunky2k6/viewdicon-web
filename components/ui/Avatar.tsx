'use client'
// ============================================================
// Avatar — Square form (African square aesthetic, not circular)
// Crest tier ring (0–8). Village color dot bottom-right.
// Initials fallback. Sizes: sm/md/lg/xl.
// ============================================================
import * as React from 'react'
import { cn } from '@/lib/utils'

// Crest tier ring colors (0=unranked → 8=Sage)
const TIER_COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#6B7280',  // grey  — Seed
  2: '#6B7280',
  3: '#22C55E',  // green — Rooted
  4: '#22C55E',
  5: '#F59E0B',  // amber — Elder
  6: '#F59E0B',
  7: '#A855F7',  // purple — Sage
  8: '#D7A85F',  // gold  — Supreme
}

// Village archetype → color
export const VILLAGE_COLORS: Record<string, string> = {
  HEALING_CIRCLE:   '#0d9488',  // teal
  CODE_FORGE:       '#6366f1',  // indigo
  FARM_COLLECTIVE:  '#22C55E',  // green
  GRIOT_HALL:       '#d4a017',  // gold
  TRADE_POST:       '#F59E0B',  // amber
  ANCESTOR_SHRINE:  '#5b2d8a',  // purple
  WAR_COUNCIL:      '#b22222',  // crimson
  MUSIC_COMPOUND:   '#E85D04',  // fire
  SCHOOL_OF_THOUGHT:'#0ea5e9',  // sky
  DIASPORA_BRIDGE:  '#00C2FF',  // bright sky
  CREATION_LAB:     '#f43f5e',  // rose
  GOVERNANCE_HUT:   '#D7A85F',  // kente gold
}

const SIZES: Record<string, { box: string; text: string; ring: number; dot: number; radius: string }> = {
  xs:  { box: 'w-8 h-8',   text: 'text-xs',    ring: 2, dot: 6,  radius: '6px'  },
  sm:  { box: 'w-8 h-8',   text: 'text-xs',    ring: 2, dot: 7,  radius: '7px'  },
  md:  { box: 'w-11 h-11', text: 'text-sm',    ring: 2, dot: 8,  radius: '9px'  },
  lg:  { box: 'w-16 h-16', text: 'text-base',  ring: 3, dot: 10, radius: '12px' },
  xl:  { box: 'w-24 h-24', text: 'text-xl',    ring: 3, dot: 13, radius: '16px' },
  '2xl': { box: 'w-24 h-24', text: 'text-2xl', ring: 4, dot: 14, radius: '18px' },
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')
}

function getBgColor(name: string): string {
  const palette = ['#1a7c3e','#d4a017','#0d9488','#b22222','#5b2d8a','#E85D04','#0ea5e9']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return palette[Math.abs(hash) % palette.length]
}

interface AvatarProps {
  src?: string | null
  name: string
  size?: keyof typeof SIZES
  crestTier?: number     // 0–8
  villageColor?: string  // hex — bottom-right dot
  className?: string
}

export function Avatar({
  src,
  name,
  size = 'md',
  crestTier = 0,
  villageColor,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const s = SIZES[size] ?? SIZES.md
  const ringColor = TIER_COLORS[crestTier] ?? 'transparent'
  const showRing  = crestTier > 0

  const inner = src && !imgError ? (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className="w-full h-full object-cover"
      style={{ borderRadius: s.radius }}
    />
  ) : (
    <div
      className={cn('w-full h-full flex items-center justify-center font-semibold select-none', s.text)}
      style={{ background: getBgColor(name), color: '#fff', borderRadius: s.radius }}
    >
      {getInitials(name)}
    </div>
  )

  return (
    <div
      className={cn('relative flex-shrink-0', s.box, className)}
      style={{
        borderRadius: s.radius,
        outline:      showRing ? `${s.ring}px solid ${ringColor}` : 'none',
        outlineOffset: `${s.ring}px`,
      }}
    >
      {inner}

      {/* Village color dot — bottom-right */}
      {villageColor && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2"
          style={{
            width:       s.dot,
            height:      s.dot,
            background:  villageColor,
            borderColor: 'var(--bg)',
          }}
        />
      )}
    </div>
  )
}
