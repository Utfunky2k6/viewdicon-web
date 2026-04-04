'use client'
import * as React from 'react'
import type { Post } from './feedTypes'
import { MotionActionStrip } from './MotionActionStrip'
import { MotionCardOverlay } from './MotionCardOverlay'
import { useCardVisibility } from '@/hooks/useCardVisibility'

const BG_GRADIENTS = [
  'linear-gradient(160deg,#0a1a0e,#0d2818,#061208)',
  'linear-gradient(160deg,#1a0f08,#2a1500,#120a04)',
  'linear-gradient(160deg,#0a0e1a,#0c1830,#06081a)',
  'linear-gradient(160deg,#1a0a18,#2a0828,#12040e)',
  'linear-gradient(160deg,#0a1a14,#082e20,#041210)',
]

interface MotionPostCardProps {
  post: Post
  isActive: boolean
  onInteract?: (type: string, postId: string) => void
}

export function MotionPostCard({ post, isActive, onInteract }: MotionPostCardProps) {
  const { ref, isVisible } = useCardVisibility(0.6)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = React.useState(true)
  const [playing, setPlaying] = React.useState(false)
  const [imageIdx, setImageIdx] = React.useState(0)
  const [audioProgress, setAudioProgress] = React.useState(0)

  // Autoplay/pause video when visible
  React.useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    if (isVisible && isActive) {
      vid.play().catch(() => {})
      setPlaying(true)
    } else {
      vid.pause()
      setPlaying(false)
    }
  }, [isVisible, isActive])

  // Autoplay/pause audio when visible
  React.useEffect(() => {
    const aud = audioRef.current
    if (!aud) return
    if (isVisible && isActive) {
      aud.play().catch(() => {})
    } else {
      aud.pause()
    }
  }, [isVisible, isActive])

  // Audio progress
  React.useEffect(() => {
    const aud = audioRef.current
    if (!aud) return
    const handler = () => {
      if (aud.duration) setAudioProgress(aud.currentTime / aud.duration)
    }
    aud.addEventListener('timeupdate', handler)
    return () => aud.removeEventListener('timeupdate', handler)
  }, [])

  // Stable bg for each post
  const bgGrad = BG_GRADIENTS[post.id.charCodeAt(0) % BG_GRADIENTS.length]

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
    if (audioRef.current) {
      audioRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  // Image swipe for IMAGE_JOURNAL
  const images = post.imageUrls || []
  const handleSwipeImage = (dir: 'left' | 'right') => {
    if (dir === 'left' && imageIdx < images.length - 1) setImageIdx(i => i + 1)
    if (dir === 'right' && imageIdx > 0) setImageIdx(i => i - 1)
  }
  const touchStartX = React.useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) handleSwipeImage(dx < 0 ? 'left' : 'right')
  }

  return (
    <div ref={ref} className="motion-card-snap" style={{ background: bgGrad }}>
      {/* ── VIDEO_STORY ── */}
      {post.type === 'VIDEO_STORY' && post.videoUrl && (
        <video
          ref={videoRef}
          src={post.videoUrl}
          loop
          muted={muted}
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* ── VIDEO_STORY without url — thumbnail + content overlay ── */}
      {post.type === 'VIDEO_STORY' && !post.videoUrl && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 72, opacity: 0.2 }}>🎬</div>
        </div>
      )}

      {/* ── IMAGE_JOURNAL ── */}
      {post.type === 'IMAGE_JOURNAL' && images.length > 0 && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ position: 'absolute', inset: 0 }}
        >
          {images.map((url, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: i === imageIdx ? 1 : 0,
                transition: 'opacity .4s ease',
              }}
            />
          ))}
          {/* Dot indicators */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 20 }}>
              {images.map((_, i) => (
                <div key={i} style={{
                  width: i === imageIdx ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === imageIdx ? '#fff' : 'rgba(255,255,255,.4)',
                  transition: 'all .2s',
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── IMAGE_JOURNAL without urls — Adinkra pattern ── */}
      {post.type === 'IMAGE_JOURNAL' && images.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 72, opacity: 0.2 }}>📸</div>
        </div>
      )}

      {/* ── AUDIO_LETTER ── */}
      {post.type === 'AUDIO_LETTER' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          {post.audioUrl && <audio ref={audioRef} src={post.audioUrl} muted={muted} />}
          {/* Visualizer rings */}
          <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 32 }}>
            {[0, 1, 2].map(ring => (
              <div key={ring} style={{
                position: 'absolute', inset: ring * 20,
                borderRadius: '50%',
                border: `2px solid rgba(74,222,128,${isActive ? 0.4 - ring * 0.1 : 0.1})`,
                animation: isActive ? `motionRing 2s ease-in-out ${ring * 0.3}s infinite` : 'none',
              }} />
            ))}
            <div style={{
              position: 'absolute', inset: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,rgba(26,124,62,.3),rgba(26,124,62,.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36,
            }}>
              {post.spiritVoiceEnabled ? '🗣' : '🎙'}
            </div>
          </div>

          {/* Waveform bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40, width: '80%' }}>
            {Array.from({ length: 32 }).map((_, i) => {
              const h = 10 + Math.sin(i * 0.8) * 20 + Math.random() * 10
              const filled = i / 32 < audioProgress
              return (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: 2,
                  background: filled ? '#4ade80' : 'rgba(255,255,255,.15)',
                  transition: 'background .1s',
                }} />
              )
            })}
          </div>

          {/* Duration */}
          {post.audioDurationSec && (
            <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,.5)', fontFamily: 'monospace' }}>
              {Math.floor((post.audioDurationSec * audioProgress) / 60)}:{String(Math.floor((post.audioDurationSec * audioProgress) % 60)).padStart(2, '0')} / {Math.floor(post.audioDurationSec / 60)}:{String(post.audioDurationSec % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      )}

      {/* ── TEXT posts in motion mode — stylized full-screen ── */}
      {!['VIDEO_STORY', 'IMAGE_JOURNAL', 'AUDIO_LETTER'].includes(post.type) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 28px' }}>
          {/* Adinkra pattern background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(74,222,128,.04)' strokeWidth='1'%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Cpath d='M30 18 L30 42 M18 30 L42 30'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
          <p style={{
            position: 'relative', zIndex: 1,
            fontSize: 'clamp(18px,5vw,28px)', fontWeight: 700,
            color: '#fff', lineHeight: 1.6, textAlign: 'center',
            textShadow: '0 2px 12px rgba(0,0,0,.5)',
            maxWidth: 340,
          }}>
            {post.content}
          </p>
        </div>
      )}

      {/* Gradient overlays — top and bottom */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(180deg,rgba(0,0,0,.6) 0%,transparent 100%)', pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(0deg,rgba(0,0,0,.7) 0%,transparent 100%)', pointerEvents: 'none', zIndex: 10 }} />

      {/* Mute toggle — top right */}
      {(post.type === 'VIDEO_STORY' || post.type === 'AUDIO_LETTER') && (
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 30,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)',
            color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}

      {/* Action strip — right side, TikTok layout */}
      <MotionActionStrip post={post} onInteract={onInteract} />

      {/* Bottom overlay — author, caption, heat */}
      <MotionCardOverlay post={post} />

      {/* Ring animation keyframe */}
      <style>{`@keyframes motionRing{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.12);opacity:.15}}`}</style>
    </div>
  )
}
