'use client'
// ============================================================
// Card — Framer Motion hover spring. Border not shadow.
// 3 padding variants. Adapts to dark/light via CSS vars.
// ============================================================
import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
  onClick?: () => void
}

const paddings = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
}

export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const isInteractive = hover || !!onClick

  return (
    <motion.div
      onClick={onClick}
      whileHover={isInteractive ? { scale: 1.01 } : undefined}
      whileTap={isInteractive  ? { scale: 0.99 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'rounded-2xl overflow-hidden transition-colors duration-150',
        isInteractive && 'cursor-pointer',
        paddings[padding],
        className
      )}
      style={{
        background: 'var(--bg-card)',
        border:     '1px solid var(--border)',
        // No box-shadow — border only for clarity on low-end screens
      }}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('px-4 py-3', className)}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('px-4 py-3', className)}
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}
