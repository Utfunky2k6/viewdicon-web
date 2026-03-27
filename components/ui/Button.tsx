'use client'
// ============================================================
// Button — 4 variants, 3 sizes, DrumPulse loading state
// Min touch target: 44×44px always (mobile-first)
// ============================================================
import * as React from 'react'
import { cn } from '@/lib/utils'
import { DrumPulseInline } from './DrumPulse'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'kente'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const variants: Record<string, string> = {
  primary:   'bg-[#1a7c3e] text-white font-semibold hover:bg-[#0f5028] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#1a7c3e]',
  secondary: 'bg-transparent border-2 border-[#1a7c3e] text-[#1a7c3e] font-semibold hover:bg-[#1a7c3e] hover:text-white active:scale-95',
  ghost:     'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] active:scale-95',
  danger:    'bg-[#b22222] text-white font-semibold hover:bg-[#8B0000] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#b22222]',
  kente:     'bg-[#D7A85F] text-[#0d1117] font-semibold hover:bg-[#c49a4a] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#D7A85F]',
}

const sizes: Record<string, string> = {
  sm:   'px-3 py-2 text-sm rounded-lg min-h-[44px]',
  md:   'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg:   'px-6 py-3 text-base rounded-2xl min-h-[44px]',
  icon: 'p-2.5 rounded-xl min-h-[44px] min-w-[44px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <DrumPulseInline speed="fast" />}
      {children}
    </button>
  )
}

export const buttonVariants = variants
