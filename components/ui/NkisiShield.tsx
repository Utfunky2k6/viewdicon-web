'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { deriveNkisiState } from '@/lib/nkisi'
import { NKISI_META } from '@/lib/nkisi'
import type { NkisiState } from '@/types'

interface NkisiShieldProps {
  state: NkisiState
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showLabel?: boolean
  className?: string
}

const ringWidth: Record<string, string> = {
  sm:  'ring-1',
  md:  'ring-2',
  lg:  'ring-2',
  xl:  'ring-[3px]',
  '2xl': 'ring-[3px]',
}

const ringOffset: Record<string, string> = {
  sm:  'ring-offset-1',
  md:  'ring-offset-2',
  lg:  'ring-offset-2',
  xl:  'ring-offset-2',
  '2xl': 'ring-offset-3',
}

export function NkisiShield({ state, children, size = 'md', showLabel = false, className }: NkisiShieldProps) {
  const meta = NKISI_META[state]

  const ringColor: Record<NkisiState, string> = {
    GREEN: 'ring-green-500',
    AMBER: 'ring-yellow-500',
    RED:   'ring-red-500',
  }

  return (
    <div className={cn('relative inline-flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-full ring-offset-bg-default',
          ringWidth[size],
          ringOffset[size],
          ringColor[state]
        )}
        title={`Nkisi Shield: ${meta.label}`}
      >
        {children}
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium" style={{ color: meta.color }}>
          {meta.emoji} {meta.label}
        </span>
      )}
    </div>
  )
}

export { deriveNkisiState }
