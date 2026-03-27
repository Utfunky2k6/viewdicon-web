'use client'
import * as React from 'react'
import Link from 'next/link'

interface QuickAction {
  href: string
  emoji: string
  label: string
  badgeCount?: number
  bgColor: string
  borderColor: string
  isLive?: boolean
}

const ACTIONS: QuickAction[] = [
  { href: '/dashboard/notifications', emoji: '💬', label: 'Requests',       badgeCount: 3,  bgColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.3)' },
  { href: '/dashboard/connections',   emoji: '👥', label: 'Community',      badgeCount: 8,  bgColor: 'rgba(26,124,62,0.15)',  borderColor: 'rgba(26,124,62,0.3)' },
  { href: '/dashboard/family-tree',   emoji: '🌳', label: 'Family Tree',    bgColor: 'rgba(212,160,23,0.12)', borderColor: 'rgba(212,160,23,0.3)' },
  { href: '/dashboard/marketplace',   emoji: '🛒', label: 'Market',         bgColor: 'rgba(26,124,62,0.1)',   borderColor: 'rgba(26,124,62,0.2)' },
  { href: '/dashboard/tv',            emoji: '📺', label: 'Jollof TV',      bgColor: 'rgba(239,68,68,0.1)',   borderColor: 'rgba(239,68,68,0.25)', isLive: true },
  { href: '/dashboard/ai',            emoji: '🏛',  label: 'Council',        bgColor: 'rgba(59,130,246,0.1)',  borderColor: 'rgba(59,130,246,0.25)' },
]

const BADGE_COLORS: Record<string, string> = {
  '💬': '#7c3aed',
  '👥': '#1a7c3e',
}

export function QuickActions() {
  return (
    <>
      <div className="px-4 pt-3 pb-1.5">
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quick Actions</span>
      </div>
      <div className="flex gap-2 px-3 pb-1 no-scrollbar snap-x" style={{ overflowX: 'auto' }}>
        <style>{`@keyframes livePip{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}`}</style>
        {ACTIONS.map(({ href, emoji, label, badgeCount, bgColor, borderColor, isLive }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
            style={{ textDecoration: 'none', minWidth: 66 }}
          >
            <div
              className="relative flex items-center justify-center rounded-2xl"
              style={{
                width: 50,
                height: 50,
                fontSize: 22,
                background: bgColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              {emoji}
              {badgeCount !== undefined && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-bold"
                  style={{
                    minWidth: 17,
                    height: 17,
                    fontSize: 9,
                    padding: '0 4px',
                    background: BADGE_COLORS[emoji] ?? '#1a7c3e',
                    border: '2px solid var(--bg)',
                    boxShadow: `0 0 6px ${BADGE_COLORS[emoji] ?? '#1a7c3e'}44`,
                  }}
                >
                  {badgeCount}
                </span>
              )}
              {isLive && (
                <div
                  className="absolute -top-1 -right-1 rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background: '#ef4444',
                    border: '2px solid var(--bg)',
                    animation: 'livePip 0.8s ease-in-out infinite',
                    boxShadow: '0 0 6px rgba(239,68,68,0.5)',
                  }}
                />
              )}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
          </Link>
        ))}
      </div>
    </>
  )
}
