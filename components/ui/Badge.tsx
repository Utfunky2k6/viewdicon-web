'use client'
// ============================================================
// Badge — village-coded, crest tier, status, skin variants
// Skin colors: Ise(work)=amber, Egbe(social)=green, Idile(clan)=purple
// Status dot: online pulses, offline static grey
// ============================================================
import * as React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'gold'
  | 'fire'
  | 'green'
  | 'amber'
  | 'red'
  | 'purple'
  | 'outline'
  // Village archetypes
  | 'village-healing'
  | 'village-forge'
  | 'village-farm'
  | 'village-griot'
  | 'village-trade'
  // Mask skin variants
  | 'skin-ise'     // Work — amber
  | 'skin-egbe'    // Social — green
  | 'skin-idile'   // Clan — purple
  // Status
  | 'online'
  | 'offline'
  | 'away'

export type BadgeSize = 'xs' | 'sm' | 'md'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  showDot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  default:          { bg: 'var(--bg-raised)',        border: 'var(--border)',        text: 'var(--text-muted)'     },
  gold:             { bg: 'rgba(212,160,23,0.15)',    border: 'rgba(212,160,23,0.4)', text: '#d4a017'               },
  fire:             { bg: 'rgba(232,93,4,0.15)',      border: 'rgba(232,93,4,0.4)',   text: '#E85D04'               },
  green:            { bg: 'rgba(26,124,62,0.15)',     border: 'rgba(26,124,62,0.4)',  text: '#22C55E'               },
  amber:            { bg: 'rgba(224,123,0,0.15)',     border: 'rgba(224,123,0,0.4)',  text: '#e07b00'               },
  red:              { bg: 'rgba(178,34,34,0.15)',     border: 'rgba(178,34,34,0.4)',  text: '#ef4444'               },
  purple:           { bg: 'rgba(91,45,138,0.15)',     border: 'rgba(91,45,138,0.4)',  text: '#A855F7'               },
  outline:          { bg: 'transparent',              border: 'var(--border)',        text: 'var(--text-secondary)' },
  // Village
  'village-healing':{ bg: 'rgba(13,148,136,0.15)',   border: 'rgba(13,148,136,0.4)', text: '#0d9488'               },
  'village-forge':  { bg: 'rgba(99,102,241,0.15)',   border: 'rgba(99,102,241,0.4)', text: '#6366f1'               },
  'village-farm':   { bg: 'rgba(26,124,62,0.15)',    border: 'rgba(26,124,62,0.4)',  text: '#22C55E'               },
  'village-griot':  { bg: 'rgba(212,160,23,0.15)',   border: 'rgba(212,160,23,0.4)', text: '#d4a017'               },
  'village-trade':  { bg: 'rgba(245,158,11,0.15)',   border: 'rgba(245,158,11,0.4)', text: '#F59E0B'               },
  // Skin
  'skin-ise':       { bg: 'rgba(224,123,0,0.15)',    border: 'rgba(224,123,0,0.4)',  text: '#e07b00'               },
  'skin-egbe':      { bg: 'rgba(26,124,62,0.15)',    border: 'rgba(26,124,62,0.4)',  text: '#22C55E'               },
  'skin-idile':     { bg: 'rgba(91,45,138,0.15)',    border: 'rgba(91,45,138,0.4)',  text: '#A855F7'               },
  // Status
  online:           { bg: 'rgba(26,124,62,0.15)',    border: 'rgba(26,124,62,0.4)',  text: '#22C55E'               },
  offline:          { bg: 'rgba(107,114,128,0.15)',  border: 'rgba(107,114,128,0.4)',text: '#6B7280'               },
  away:             { bg: 'rgba(245,158,11,0.15)',   border: 'rgba(245,158,11,0.4)', text: '#F59E0B'               },
}

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded-md',
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
}

const STATUS_DOT_COLORS: Record<string, string> = {
  online:  '#22C55E',
  offline: '#6B7280',
  away:    '#F59E0B',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  showDot,
  className,
  ...props
}: BadgeProps) {
  const s = variantStyles[variant] ?? variantStyles.default
  const isStatus = variant === 'online' || variant === 'offline' || variant === 'away'
  const dotColor = STATUS_DOT_COLORS[variant]

  return (
    <span
      className={cn('inline-flex items-center gap-1 font-medium', sizeStyles[size], className)}
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
      {...props}
    >
      {(showDot || isStatus) && (
        <span
          className={cn('rounded-full flex-shrink-0', isStatus && variant === 'online' ? 'animate-pulse' : '')}
          style={{
            width:      7,
            height:     7,
            background: dotColor ?? s.text,
            display:    'inline-block',
          }}
        />
      )}
      {children}
    </span>
  )
}
