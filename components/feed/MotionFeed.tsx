'use client'
import * as React from 'react'
import type { Post } from './feedTypes'
import { MotionPostCard } from './MotionPostCard'

const MOTION_CSS = `
@keyframes motionFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes heartBurst{0%{transform:scale(0);opacity:1}50%{transform:scale(1.6);opacity:.9}100%{transform:scale(0);opacity:0}}
.motion-container{
  scroll-snap-type:y mandatory;
  -webkit-overflow-scrolling:touch;
  overflow-y:auto;
  height:100dvh;
  scroll-behavior:smooth;
}
.motion-container::-webkit-scrollbar{display:none}
.motion-card-snap{
  scroll-snap-align:start;
  scroll-snap-stop:always;
  height:100dvh;
  position:relative;
  overflow:hidden;
}
.motion-heart-burst{
  position:absolute;pointer-events:none;z-index:50;
  font-size:64px;animation:heartBurst .8s ease-out forwards;
}
`

interface MotionFeedProps {
  posts: Post[]
  onInteract?: (type: string, postId: string) => void
}

export function MotionFeed({ posts, onInteract }: MotionFeedProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [hearts, setHearts] = React.useState<Array<{ id: number; x: number; y: number }>>([])

  // Style injection
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('motion-feed-css')) {
      const s = document.createElement('style')
      s.id = 'motion-feed-css'
      s.textContent = MOTION_CSS
      document.head.appendChild(s)
    }
  }, [])

  // Track active card via scroll
  const handleScroll = React.useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const h = el.clientHeight
    if (h > 0) setActiveIdx(Math.round(el.scrollTop / h))
  }, [])

  // Double-tap heart explosion
  const lastTap = React.useRef(0)
  const handleDoubleTap = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // Double tap detected
      const rect = containerRef.current?.getBoundingClientRect()
      let x = 0, y = 0
      if ('changedTouches' in e && e.changedTouches.length > 0) {
        x = e.changedTouches[0].clientX - (rect?.left ?? 0)
        y = e.changedTouches[0].clientY - (rect?.top ?? 0)
      } else if ('clientX' in e) {
        x = e.clientX - (rect?.left ?? 0)
        y = e.clientY - (rect?.top ?? 0)
      }
      const id = Date.now()
      setHearts(prev => [...prev, { id, x: x - 32, y: y - 32 }])
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 900)
      // Fire kila interaction
      if (posts[activeIdx]) {
        onInteract?.('kila', posts[activeIdx].id)
      }
    }
    lastTap.current = now
  }, [activeIdx, posts, onInteract])

  if (posts.length === 0) {
    return (
      <div style={{ height: '60dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📺</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>No Motion Posts Yet</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textAlign: 'center', lineHeight: 1.6 }}>Video stories, image journals, and audio letters from your village will appear here in a full-screen feed.</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="motion-container"
      onScroll={handleScroll}
      onClick={handleDoubleTap}
      onTouchEnd={handleDoubleTap}
      style={{ position: 'relative' }}
    >
      {/* Progress dots — right side */}
      <div style={{
        position: 'fixed', right: 6, top: '50%', transform: 'translateY(-50%)',
        zIndex: 60, display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {posts.slice(0, 20).map((_, i) => (
          <div key={i} style={{
            width: activeIdx === i ? 4 : 3,
            height: activeIdx === i ? 14 : 6,
            borderRadius: 3,
            background: activeIdx === i ? '#4ade80' : 'rgba(255,255,255,.25)',
            transition: 'all .2s',
          }} />
        ))}
      </div>

      {/* Heart explosions */}
      {hearts.map(h => (
        <div key={h.id} className="motion-heart-burst" style={{ left: h.x, top: h.y + (activeIdx * (containerRef.current?.clientHeight ?? 0)) }}>
          ⭐
        </div>
      ))}

      {/* Cards */}
      {posts.map((post, i) => (
        <MotionPostCard
          key={post.id}
          post={post}
          isActive={i === activeIdx}
          onInteract={onInteract}
        />
      ))}
    </div>
  )
}
