'use client'
import * as React from 'react'

type PotStage = 'FEAST' | 'BOIL' | 'SIMMER' | 'EMBER'

interface FirePost {
  id: string
  villageName: string
  villageEmoji: string
  content: string
  heatScore: number
  heatStage: PotStage
}

const STAGE_GRADIENT: Record<PotStage, string> = {
  FEAST:   'linear-gradient(135deg, #7f1d1d 0%, #b22222 100%)',
  BOIL:    'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
  SIMMER:  'linear-gradient(135deg, #713f12 0%, #d97706 100%)',
  EMBER:   'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
}

const STAGE_LABEL: Record<PotStage, string> = {
  FEAST:   '🔥 FIRE',
  BOIL:    '♨ Boiling',
  SIMMER:  '🌡 Simmering',
  EMBER:   '❄ Cold',
}

// Fires (initially empty -- populated by backend data)
const DEFAULT_FIRES: FirePost[] = []

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{title}</span>
      {action && <span style={{ fontSize: 11, color: '#1a7c3e', fontWeight: 600, cursor: 'pointer' }}>{action}</span>}
    </div>
  )
}

export function NationFires({ posts = DEFAULT_FIRES }: { posts?: FirePost[] }) {
  return (
    <>
      <SectionHeader title="🔥 Nation's Fires" action="See all →" />
      <div className="flex gap-2.5 px-3 pb-1 no-scrollbar snap-x" style={{ overflowX: 'auto' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            className="shrink-0 cursor-pointer card-lift rounded-2xl"
            style={{
              minWidth: 140,
              maxWidth: 160,
              borderRadius: 16,
              padding: '14px 12px',
              background: STAGE_GRADIENT[post.heatStage],
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle glow */}
            <div className="absolute pointer-events-none" style={{ top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(20px)' }} />

            <span style={{ fontSize: 28, marginBottom: 8, display: 'block' }}>{post.villageEmoji}</span>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.65)', marginBottom: 3 }}>{post.villageName}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{STAGE_LABEL[post.heatStage]} · {post.heatScore}°</div>
            <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,.15)' }}>
              <div className="rounded-full h-full" style={{ background: 'rgba(255,255,255,.75)', width: `${post.heatScore}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
