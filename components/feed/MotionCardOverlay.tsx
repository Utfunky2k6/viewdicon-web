'use client'
import * as React from 'react'
import type { Post } from './feedTypes'

const SKINS: Record<string, { emoji: string; color: string }> = {
  ise:   { emoji: '⚒', color: '#4ade80' },
  egbe:  { emoji: '⭕', color: '#fb923c' },
  idile: { emoji: '🌳', color: '#c084fc' },
}

function heatLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: '🔥 FEAST', color: '#ffd700' }
  if (score >= 65) return { label: '🌊 BOIL', color: '#ff4500' }
  if (score >= 40) return { label: '♨ SIMMER', color: '#e07b00' }
  if (score >= 20) return { label: '🌑 EMBER', color: '#8b4513' }
  return { label: '❄ COLD', color: 'rgba(255,255,255,.3)' }
}

interface MotionCardOverlayProps {
  post: Post
}

export function MotionCardOverlay({ post }: MotionCardOverlayProps) {
  const skin = SKINS[post.skinContext] || SKINS.ise
  const heat = heatLabel(post.heatScore)
  const [expanded, setExpanded] = React.useState(false)

  // Truncate content for overlay
  const maxLen = 120
  const content = post.content || ''
  const truncated = content.length > maxLen && !expanded
  const displayText = truncated ? content.slice(0, maxLen) + '…' : content

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 70, zIndex: 20,
      padding: '16px 14px 24px',
    }}>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>
          {post.author}
        </span>
        {post.crestTier > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 900, padding: '2px 6px',
            borderRadius: 6,
            background: post.crestTier >= 4 ? 'rgba(212,160,23,.25)' : 'rgba(255,255,255,.1)',
            color: post.crestTier >= 4 ? '#fbbf24' : 'rgba(255,255,255,.5)',
            border: `1px solid ${post.crestTier >= 4 ? 'rgba(212,160,23,.4)' : 'rgba(255,255,255,.15)'}`,
          }}>
            {'I'.repeat(post.crestTier)}
          </span>
        )}
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{post.time}</span>
      </div>

      {/* Village · Skin · Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px',
          borderRadius: 8, background: 'rgba(255,255,255,.08)',
          color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.1)',
        }}>
          {post.villageEmoji} {post.village}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '3px 7px',
          borderRadius: 8, background: `${skin.color}18`,
          color: skin.color, border: `1px solid ${skin.color}40`,
        }}>
          {skin.emoji} {post.skinContext.toUpperCase()}
        </span>
        {post.role && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '3px 7px',
            borderRadius: 8, background: 'rgba(255,255,255,.06)',
            color: 'rgba(255,255,255,.45)',
          }}>
            {post.role}
          </span>
        )}
      </div>

      {/* Caption / Content */}
      {displayText && (
        <div style={{ marginBottom: 10 }}>
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,.85)', lineHeight: 1.55,
            margin: 0, textShadow: '0 1px 4px rgba(0,0,0,.5)',
          }}>
            {displayText}
            {truncated && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true) }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginLeft: 4 }}
              >
                more
              </button>
            )}
          </p>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {post.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Heat badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 8,
        background: 'rgba(0,0,0,.4)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${heat.color}40`,
      }}>
        <div style={{
          width: 40, height: 3, borderRadius: 2,
          background: 'rgba(255,255,255,.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${Math.min(post.heatScore, 100)}%`,
            background: heat.color,
          }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: heat.color }}>{heat.label}</span>
      </div>
    </div>
  )
}
