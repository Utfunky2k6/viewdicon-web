'use client'
import * as React from 'react'

interface FeedProgressBarProps {
  current: number
  total: number
}

export function FeedProgressBar({ current, total }: FeedProgressBarProps) {
  if (total <= 1) return null
  const pct = ((current + 1) / total) * 100

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 70,
      height: 3, background: 'rgba(255,255,255,.06)',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'linear-gradient(90deg,#1a7c3e,#4ade80)',
        borderRadius: '0 2px 2px 0',
        transition: 'width .3s ease',
        boxShadow: '0 0 8px rgba(74,222,128,.3)',
      }} />
    </div>
  )
}
