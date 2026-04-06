'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loveWorldApi } from '../../../../../../lib/api'
import { useAuthStore } from '../../../../../../stores/authStore'

interface WallPrompt { id: string; text: string; category?: string }
interface WallPost {
  id: string; authorAfroId: string; authorName?: string; authorAvatar?: string
  content?: string; mediaUrl?: string; mediaType: 'TEXT' | 'PHOTO'
  promptId?: string; promptText?: string; kilaCount: number; kilad?: boolean
  createdAt: string
}

const GOLD = '#D4AF37'
const BG = '#0A0A0F'
const CARD = '#111118'
const CARD2 = '#1A1A25'
const GREEN = '#00C853'
const RED = '#FF3B30'
const WHITE = '#FFFFFF'
const BLUE = '#4A90D9'

export default function CulturalWallPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const myAfroId = user?.afroId || ''

  const [prompts, setPrompts] = useState<WallPrompt[]>([])
  const [posts, setPosts] = useState<WallPost[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Composer state
  const [content, setContent] = useState('')
  const [mediaType, setMediaType] = useState<'TEXT' | 'PHOTO'>('TEXT')
  const [selectedPrompt, setSelectedPrompt] = useState<WallPrompt | null>(null)

  // Countdown timer — assumes wall expires 48h from first post or match start
  const [remaining, setRemaining] = useState(48 * 3600)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0')
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const fetchData = useCallback(async () => {
    if (!matchId) return
    try {
      const [promptRes, postRes] = await Promise.all([
        loveWorldApi.getWallPrompts(matchId).catch(() => ({ data: [] })),
        loveWorldApi.getWallPosts(matchId).catch(() => ({ data: [] })),
      ])
      setPrompts(Array.isArray(promptRes) ? promptRes : promptRes?.data || [])
      const postArr = Array.isArray(postRes) ? postRes : postRes?.data || []
      setPosts(postArr.sort((a: WallPost, b: WallPost) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      // If API returns remaining seconds, use it
      if (postRes?.remaining) setRemaining(postRes.remaining)
    } catch { /* silent */ } finally { setLoading(false) }
  }, [matchId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining(r => (r > 0 ? r - 1 : 0))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleSubmit = async () => {
    if (!matchId || (!content.trim() && mediaType === 'TEXT')) return
    setSubmitting(true)
    try {
      await loveWorldApi.createWallPost(matchId, {
        mediaType,
        content: content.trim() || undefined,
        promptId: selectedPrompt?.id,
      })
      setContent('')
      setSelectedPrompt(null)
      await fetchData()
    } catch { /* silent */ } finally { setSubmitting(false) }
  }

  const handleKila = async (postId: string) => {
    if (!matchId) return
    try {
      await loveWorldApi.kilaWallPost(matchId, postId)
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, kilaCount: p.kilaCount + 1, kilad: true } : p))
    } catch { /* silent */ }
  }

  const promptStrip = useRef<HTMLDivElement>(null)

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: GOLD, fontFamily: 'monospace', fontSize: 14 }}>Loading Cultural Wall...</p>
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'monospace', color: WHITE, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${CARD2}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 20, cursor: 'pointer', padding: 0 }}>
          &larr;
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, color: GOLD, fontFamily: 'monospace' }}>Cultural Wall</h1>
        </div>
        <div style={{ background: remaining < 3600 ? RED : CARD2, padding: '6px 12px', borderRadius: 8, fontSize: 13, color: remaining < 3600 ? WHITE : GOLD }}>
          {formatTime(remaining)}
        </div>
      </div>

      {/* Prompts Strip */}
      {prompts.length > 0 && (
        <div ref={promptStrip} style={{ display: 'flex', gap: 10, padding: '12px 16px', overflowX: 'auto', borderBottom: `1px solid ${CARD2}` }}>
          {prompts.map(pr => (
            <button key={pr.id} onClick={() => setSelectedPrompt(selectedPrompt?.id === pr.id ? null : pr)}
              style={{
                flex: '0 0 auto', maxWidth: 220, padding: '10px 14px', borderRadius: 12,
                background: selectedPrompt?.id === pr.id ? GOLD : CARD,
                color: selectedPrompt?.id === pr.id ? BG : WHITE,
                border: `1px solid ${selectedPrompt?.id === pr.id ? GOLD : CARD2}`,
                fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', textAlign: 'left', lineHeight: 1.4,
              }}>
              {pr.category && <span style={{ fontSize: 10, opacity: 0.6, display: 'block', marginBottom: 4 }}>{pr.category}</span>}
              {pr.text}
            </button>
          ))}
        </div>
      )}

      {/* Post Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>&#127912;</p>
            <p style={{ fontSize: 13 }}>No posts yet. Share something about your culture!</p>
          </div>
        )}
        {posts.map(post => {
          const isMine = post.authorAfroId === myAfroId
          return (
            <div key={post.id} style={{
              background: CARD, borderRadius: 14, padding: 14, marginBottom: 12,
              borderLeft: `3px solid ${isMine ? GOLD : BLUE}`,
            }}>
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: isMine ? GOLD : BLUE,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: BG, fontWeight: 700,
                  overflow: 'hidden',
                }}>
                  {post.authorAvatar
                    ? <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (post.authorName || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isMine ? GOLD : BLUE }}>
                    {isMine ? 'You' : post.authorName || 'Partner'}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>{new Date(post.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Prompt reference */}
              {post.promptText && (
                <div style={{ fontSize: 11, color: GOLD, opacity: 0.7, marginBottom: 6, fontStyle: 'italic' }}>
                  Prompt: {post.promptText}
                </div>
              )}

              {/* Content */}
              {post.content && <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.5 }}>{post.content}</p>}
              {post.mediaUrl && post.mediaType === 'PHOTO' && (
                <img src={post.mediaUrl} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 8 }} />
              )}

              {/* Kila row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => handleKila(post.id)} disabled={post.kilad}
                  style={{
                    background: post.kilad ? GOLD : 'transparent', border: `1px solid ${GOLD}`,
                    color: post.kilad ? BG : GOLD, borderRadius: 20, padding: '4px 14px',
                    fontSize: 12, fontFamily: 'monospace', cursor: post.kilad ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, opacity: post.kilad ? 0.7 : 1,
                  }}>
                  &#10084; Kila
                </button>
                <span style={{ fontSize: 12, opacity: 0.6 }}>{post.kilaCount}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer */}
      <div style={{ borderTop: `1px solid ${CARD2}`, padding: 14, background: CARD }}>
        {selectedPrompt && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            background: CARD2, padding: '6px 10px', borderRadius: 8, fontSize: 11, color: GOLD,
          }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Replying to: {selectedPrompt.text}
            </span>
            <button onClick={() => setSelectedPrompt(null)}
              style={{ background: 'none', border: 'none', color: RED, fontSize: 14, cursor: 'pointer', padding: 0 }}>
              x
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {(['TEXT', 'PHOTO'] as const).map(t => (
            <button key={t} onClick={() => setMediaType(t)}
              style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer',
                background: mediaType === t ? GOLD : CARD2, color: mediaType === t ? BG : WHITE, border: 'none',
              }}>
              {t === 'TEXT' ? 'Aa Text' : 'Photo'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={content} onChange={e => setContent(e.target.value)}
            placeholder={mediaType === 'TEXT' ? 'Share your culture...' : 'Paste image URL...'}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${CARD2}`,
              background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
            }} />
          <button onClick={handleSubmit} disabled={submitting || (!content.trim() && mediaType === 'TEXT')}
            style={{
              padding: '10px 20px', borderRadius: 10, background: GOLD, color: BG,
              border: 'none', fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
              cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.6 : 1,
            }}>
            {submitting ? '...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
