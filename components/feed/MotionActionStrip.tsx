'use client'
import * as React from 'react'
import type { Post } from './feedTypes'

const STRIP_CSS = `
@keyframes stripKilaBurst{0%{transform:scale(1)}30%{transform:scale(1.4)}60%{transform:scale(.85)}100%{transform:scale(1)}}
@keyframes stripStirRipple{0%{transform:scale(.5);opacity:.8}100%{transform:scale(2.5);opacity:0}}
@keyframes stripSprayRain{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(60px)}}
@keyframes stripUbuntuPulse{0%{transform:scale(.8);opacity:.6}50%{transform:scale(1.4);opacity:.3}100%{transform:scale(2);opacity:0}}
.strip-btn{
  display:flex;flex-direction:column;align-items:center;gap:4px;
  background:none;border:none;color:#fff;cursor:pointer;padding:6px;
  -webkit-tap-highlight-color:transparent;position:relative;
}
.strip-btn:active{transform:scale(.9)}
`

interface MotionActionStripProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
}

export function MotionActionStrip({ post, onInteract }: MotionActionStripProps) {
  const [kilaBurst, setKilaBurst] = React.useState(false)
  const [stirRipple, setStirRipple] = React.useState(false)
  const [ubuntuPulse, setUbuntuPulse] = React.useState(false)
  const [spraying, setSpraying] = React.useState(false)
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [ubuntud, setUbuntud] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('strip-css')) {
      const s = document.createElement('style')
      s.id = 'strip-css'
      s.textContent = STRIP_CSS
      document.head.appendChild(s)
    }
  }, [])

  const handleKila = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (kilaed) return
    setKilaed(true)
    setKilaBurst(true)
    setTimeout(() => setKilaBurst(false), 600)
    onInteract?.('kila', post.id)
  }

  const handleStir = (e: React.MouseEvent) => {
    e.stopPropagation()
    setStirred(true)
    setStirRipple(true)
    setTimeout(() => setStirRipple(false), 700)
    onInteract?.('stir', post.id)
  }

  const handleUbuntu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUbuntud(true)
    setUbuntuPulse(true)
    setTimeout(() => setUbuntuPulse(false), 700)
    onInteract?.('ubuntu', post.id)
  }

  const handleSpray = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSpraying(true)
    setTimeout(() => setSpraying(false), 1200)
    onInteract?.('spray', post.id)
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    onInteract?.('comment', post.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onInteract?.('drum', post.id)
  }

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return (
    <div style={{
      position: 'absolute', right: 10, bottom: 160, zIndex: 30,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
    }}>
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: post.avatarColor || 'rgba(26,124,62,.3)',
        border: '2px solid #4ade80',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, position: 'relative',
      }}>
        {post.village ? post.villageEmoji : '👤'}
        {/* + follow badge */}
        <div style={{
          position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
          width: 18, height: 18, borderRadius: '50%',
          background: '#b22222', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color: '#fff',
        }}>+</div>
      </div>

      {/* Kila */}
      <button className="strip-btn" onClick={handleKila}>
        <div style={{
          fontSize: 28,
          animation: kilaBurst ? 'stripKilaBurst .5s ease' : 'none',
          filter: kilaed ? 'drop-shadow(0 0 8px rgba(212,160,23,.5))' : 'none',
        }}>
          ⭐
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: kilaed ? '#fbbf24' : 'rgba(255,255,255,.7)' }}>
          {fmt(post.kilaCount + (kilaed ? 1 : 0))}
        </span>
      </button>

      {/* Stir */}
      <button className="strip-btn" onClick={handleStir}>
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: 28 }}>🔥</span>
          {stirRipple && (
            <div style={{
              position: 'absolute', inset: -4,
              border: '2px solid rgba(249,115,22,.6)',
              borderRadius: '50%',
              animation: 'stripStirRipple .7s ease-out forwards',
            }} />
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: stirred ? '#f97316' : 'rgba(255,255,255,.7)' }}>
          {fmt(post.stirCount + (stirred ? 1 : 0))}
        </span>
      </button>

      {/* Ubuntu */}
      <button className="strip-btn" onClick={handleUbuntu}>
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: 28 }}>🤝</span>
          {ubuntuPulse && (
            <>
              {[0, 1, 2].map(ring => (
                <div key={ring} style={{
                  position: 'absolute', inset: -4,
                  border: '2px solid rgba(14,165,233,.5)',
                  borderRadius: '50%',
                  animation: `stripUbuntuPulse .7s ease-out ${ring * 0.15}s forwards`,
                }} />
              ))}
            </>
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: ubuntud ? '#0ea5e9' : 'rgba(255,255,255,.7)' }}>
          {fmt(post.ubuntuCount + (ubuntud ? 1 : 0))}
        </span>
      </button>

      {/* Spray */}
      <button className="strip-btn" onClick={handleSpray}>
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: 28 }}>💸</span>
          {spraying && (
            <div style={{ position: 'absolute', inset: -20, pointerEvents: 'none' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{
                  position: 'absolute',
                  left: `${20 + Math.random() * 40}%`,
                  top: 0,
                  fontSize: 14,
                  animation: `stripSprayRain 1s ease-out ${i * 0.1}s forwards`,
                }}>🪙</span>
              ))}
            </div>
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(212,160,23,.8)' }}>Spray</span>
      </button>

      {/* Comment */}
      <button className="strip-btn" onClick={handleComment}>
        <span style={{ fontSize: 28 }}>💬</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
          {fmt(post.commentCount)}
        </span>
      </button>

      {/* Drum / Share */}
      <button className="strip-btn" onClick={handleShare}>
        <span style={{ fontSize: 28 }}>🥁</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>Share</span>
      </button>
    </div>
  )
}
