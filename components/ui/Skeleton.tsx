'use client'
// ============================================================
// Skeleton — shimmer placeholders. ZERO blank screens ever.
// Dark mode: dark shimmer. Light mode: light shimmer.
// All via CSS vars — no hardcoded colors.
// ============================================================
import * as React from 'react'
import { cn } from '@/lib/utils'

// Base shimmer div
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-lg', className)}
      style={style}
      aria-hidden="true"
    />
  )
}

// ── SkeletonCard ──────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      aria-label="Loading content…"
      role="status"
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-2" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  )
}

// ── SkeletonPost ──────────────────────────────────────────────
export function SkeletonPost() {
  return (
    <div
      className="px-4 py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
      aria-label="Loading post…"
      role="status"
    >
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-14 rounded-lg" />
      </div>
      {/* Content */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      {/* Heat bar */}
      <Skeleton className="h-2 w-full rounded-full mb-3" />
      {/* Actions */}
      <div className="flex gap-4">
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-14 rounded-lg" />
      </div>
    </div>
  )
}

// ── SkeletonProfile ───────────────────────────────────────────
export function SkeletonProfile() {
  return (
    <div aria-label="Loading profile…" role="status">
      {/* Cover */}
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="px-4 -mt-8 pb-4">
        <div className="flex items-end justify-between mb-3">
          <Skeleton className="w-20 h-20 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl mt-8" />
        </div>
        <Skeleton className="h-5 w-40 mb-1.5" />
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// ── SkeletonVillage ───────────────────────────────────────────
export function SkeletonVillage() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      aria-label="Loading village…"
      role="status"
    >
      <Skeleton className="h-20 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
