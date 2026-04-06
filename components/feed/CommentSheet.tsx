'use client'
// ════════════════════════════════════════════════════════════════
// CommentSheet — World-class comment system
// Features: nested replies · voice comments · emoji reactions
//           like on comments · @mentions · translate · pin
// ════════════════════════════════════════════════════════════════
import * as React from 'react'

const CSS_ID = 'comments-css'
const CSS = `
@keyframes cmtSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes recPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 10px rgba(239,68,68,0)}}
@keyframes likeHeart{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
.cmt-in{animation:cmtSlide .25s ease both}
.rec-active{animation:recPulse 1.5s ease-in-out infinite}
.like-pop{animation:likeHeart .3s ease}
`

// ── Types ─────────────────────────────────────────────────────
interface Comment {
  id: string
  author: string
  avatar: string
  handle: string
  text?: string
  voiceSec?: number
  time: string
  likes: number
  liked: boolean
  pinned?: boolean
  reactions: Record<string, number>  // emoji → count
  replies: Reply[]
  translated?: string
}

interface Reply {
  id: string
  author: string
  avatar: string
  handle: string
  text?: string
  voiceSec?: number
  time: string
  likes: number
  liked: boolean
  atMention?: string
  reactions: Record<string, number>
}

const QUICK_REACTIONS = ['❤️','🔥','😂','👏','🤔','💯']

// ── Comments (initially empty -- fetched from soro-soke-feed backend) ──
const INITIAL_COMMENTS: Comment[] = []

// ── VoiceCommentPlayer ─────────────────────────────────────────
function VoiceCommentPlayer({ sec, author }: { sec: number; author: string }) {
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const toggle = () => {
    if (playing) {
      setPlaying(false)
      clearInterval(intervalRef.current!)
    } else {
      setPlaying(true)
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setPlaying(false); clearInterval(intervalRef.current!); return 0 }
          return p + (100 / (sec * 10))
        })
      }, 100)
    }
  }

  const BAR_HEIGHTS = [8, 14, 10, 18, 12, 22, 8, 16, 20, 10, 14, 18, 8, 12, 22, 16, 10, 18, 14, 8]
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      borderRadius: 12, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.15)',
      marginTop: 4,
    }}>
      <button onClick={toggle} style={{
        width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: playing ? 'rgba(239,68,68,.15)' : 'rgba(26,124,62,.15)',
        color: playing ? '#f87171' : '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
      }}>
        {playing ? '⏸' : '▶'}
      </button>
      {/* waveform */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 28, position: 'relative' }}>
        {BAR_HEIGHTS.map((h, i) => {
          const pct = (i / BAR_HEIGHTS.length) * 100
          const active = pct <= progress
          return (
            <div key={i} style={{
              width: 3, height: h, borderRadius: 2,
              background: active ? '#4ade80' : 'rgba(255,255,255,.15)',
              transition: 'background .1s',
              flexShrink: 0,
            }} />
          )
        })}
      </div>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', flexShrink: 0, fontWeight: 600 }}>
        {playing ? fmt(Math.round(sec * progress / 100)) : fmt(sec)}
      </span>
      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: 'rgba(74,222,128,.1)', color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>🎙 Voice</span>
    </div>
  )
}

// ── CommentCard ────────────────────────────────────────────────
function CommentCard({
  comment, indent = false, onReply, onLike,
}: {
  comment: Comment | Reply
  indent?: boolean
  onReply: (handle: string) => void
  onLike: (id: string) => void
}) {
  const [showReactions, setShowReactions] = React.useState(false)
  const [localLiked, setLocalLiked] = React.useState(comment.liked)
  const [localLikes, setLocalLikes] = React.useState(comment.likes)
  const [reactionCounts, setReactionCounts] = React.useState({ ...(comment.reactions || {}) })
  const [translated, setTranslated] = React.useState(false)

  const handleLike = () => {
    const wasLiked = localLiked
    setLocalLiked(!wasLiked)
    setLocalLikes(c => wasLiked ? c - 1 : c + 1)
    onLike(comment.id)
  }

  const addReaction = (emoji: string) => {
    setReactionCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
    setShowReactions(false)
  }

  return (
    <div className="cmt-in" style={{
      display: 'flex', gap: 10, padding: indent ? '8px 0 8px 44px' : '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,.04)',
    }}>
      {/* Avatar */}
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: indent ? 18 : 20, flexShrink: 0, border: '1.5px solid rgba(255,255,255,.1)' }}>
        {comment.avatar}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f5ee' }}>{comment.author}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{comment.handle}</span>
          {'pinned' in comment && comment.pinned && (
            <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: 'rgba(212,160,23,.15)', color: '#fbbf24' }}>📌 PINNED</span>
          )}
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginLeft: 'auto' }}>{comment.time}</span>
        </div>

        {/* Content */}
        {comment.voiceSec ? (
          <VoiceCommentPlayer sec={comment.voiceSec} author={comment.author} />
        ) : (
          <p style={{ fontSize: 13, color: '#d0d9d0', lineHeight: 1.55, margin: 0 }}>
            {'atMention' in comment && comment.atMention && (
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{comment.atMention} </span>
            )}
            {translated ? (comment as Comment).translated || comment.text : comment.text}
          </p>
        )}

        {/* Reactions row */}
        {Object.keys(reactionCounts).length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span key={emoji} onClick={() => addReaction(emoji)} style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 99, cursor: 'pointer',
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                color: '#f0f5ee', display: 'flex', alignItems: 'center', gap: 3,
              }}>
                {emoji} {count}
              </span>
            ))}
          </div>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <button onClick={handleLike} style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            color: localLiked ? '#f87171' : 'rgba(255,255,255,.35)', fontSize: 11, fontWeight: 600, padding: 0,
          }}>
            {localLiked ? '❤️' : '🤍'} {localLikes}
          </button>

          <button onClick={() => setShowReactions(r => !r)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,.35)', fontSize: 11, fontWeight: 600, padding: 0,
          }}>
            😊 React
          </button>

          {!indent && (
            <button onClick={() => onReply(comment.handle)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.35)', fontSize: 11, fontWeight: 600, padding: 0,
            }}>
              ↩ Reply
            </button>
          )}

          {!comment.voiceSec && !indent && (
            <button onClick={() => setTranslated(t => !t)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.25)', fontSize: 10, padding: 0,
            }}>
              🌍 {translated ? 'Original' : 'Translate'}
            </button>
          )}
        </div>

        {/* Quick reaction picker */}
        {showReactions && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, padding: '6px 10px', borderRadius: 20, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', width: 'fit-content' }}>
            {QUICK_REACTIONS.map(r => (
              <span key={r} onClick={() => addReaction(r)} style={{ fontSize: 18, cursor: 'pointer', transition: 'transform .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >{r}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main CommentSheet ──────────────────────────────────────────
export function CommentSheet({
  open, onClose, postId, postPreview,
}: {
  open: boolean
  onClose: () => void
  postId: string
  postPreview?: string
}) {
  const [comments, setComments] = React.useState<Comment[]>(INITIAL_COMMENTS)
  const [input, setInput] = React.useState('')
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [recSecs, setRecSecs] = React.useState(0)
  const [filterMode, setFilterMode] = React.useState<'top' | 'newest'>('top')
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const recRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const handleLike = (id: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
      return { ...c, replies: c.replies.map(r => r.id === id ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) }
    }))
  }

  const setReplyHandler = (handle: string) => {
    setReplyTo(handle)
    setInput(`${handle} `)
    inputRef.current?.focus()
  }

  const submitComment = () => {
    if (!input.trim() && !isRecording) return
    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: 'You', avatar: '🫵', handle: '@me',
      text: input.trim() || undefined,
      time: 'just now', likes: 0, liked: false, pinned: false,
      reactions: {}, replies: [],
    }

    if (replyTo) {
      // Add as reply to first matching comment
      setComments(prev => prev.map(c => {
        if (c.replies.some(r => r.handle === replyTo) || c.handle === replyTo) {
          const newReply: Reply = { id: `r${Date.now()}`, author: 'You', avatar: '🫵', handle: '@me', text: input.trim(), time: 'just now', likes: 0, liked: false, atMention: replyTo, reactions: {} }
          return { ...c, replies: [...c.replies, newReply] }
        }
        return c
      }))
    } else {
      setComments(prev => [newComment, ...prev])
    }

    setInput(''); setReplyTo(null); setIsRecording(false)
    setRecSecs(0); clearInterval(recRef.current!)
  }

  const toggleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      clearInterval(recRef.current!)
      // Submit voice comment
      const voiceComment: Comment = {
        id: `c${Date.now()}`, author: 'You', avatar: '🫵', handle: '@me',
        voiceSec: Math.max(recSecs, 5), time: 'just now', likes: 0, liked: false,
        pinned: false, reactions: {}, replies: [],
      }
      setComments(prev => [voiceComment, ...prev])
      setRecSecs(0)
    } else {
      setIsRecording(true)
      recRef.current = setInterval(() => setRecSecs(s => s + 1), 1000)
    }
  }

  const sorted = [...comments].sort((a, b) =>
    filterMode === 'top' ? b.likes - a.likes : 0
  )

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`

  if (!open) return null

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.6)',
      backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
    }}>
      {/* Top spacer — tap to close */}
      <div style={{ flex: 1, minHeight: '20%' }} />

      <div onClick={e => e.stopPropagation()} style={{
        background: '#0c1009', borderRadius: '24px 24px 0 0',
        display: 'flex', flexDirection: 'column', maxHeight: '84dvh',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.2)', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 8px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 800, color: '#f0f5ee' }}>Village Voices</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{comments.length} voices · {comments.reduce((a, c) => a + c.replies.length, 0)} replies</div>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.05)', borderRadius: 99, padding: 3 }}>
            {(['top','newest'] as const).map(f => (
              <button key={f} onClick={() => setFilterMode(f)} style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 9, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: filterMode === f ? '#1a7c3e' : 'transparent',
                color: filterMode === f ? '#fff' : 'rgba(255,255,255,.4)',
              }}>
                {f === 'top' ? '🔥 Top' : '🕐 New'}
              </button>
            ))}
          </div>
        </div>

        {/* Post preview snippet */}
        {postPreview && (
          <div style={{ margin: '8px 16px 0', padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderLeft: '3px solid #1a7c3e' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{postPreview}</p>
          </div>
        )}

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {sorted.map(c => (
            <div key={c.id}>
              <CommentCard comment={c} onReply={setReplyHandler} onLike={handleLike} />
              {/* Replies */}
              {c.replies.map(r => (
                <CommentCard key={r.id} comment={r} indent onReply={setReplyHandler} onLike={handleLike} />
              ))}
            </div>
          ))}
          <div style={{ height: 16 }} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          padding: '10px 12px',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
          background: '#0c1009',
        }}>
          {/* Reply indicator */}
          {replyTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '5px 10px', borderRadius: 8, background: 'rgba(26,124,62,.1)', border: '1px solid rgba(26,124,62,.2)' }}>
              <span style={{ fontSize: 10, color: '#4ade80' }}>↩ Replying to {replyTo}</span>
              <button onClick={() => { setReplyTo(null); setInput('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', marginLeft: 'auto', fontSize: 12 }}>✕</button>
            </div>
          )}

          {/* Voice recording indicator */}
          {isRecording && (
            <div className="rec-active" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Recording voice comment · {fmt(recSecs)}</span>
              <button onClick={toggleVoiceRecord} style={{ marginLeft: 'auto', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>Stop & Post</button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Avatar */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              🫵
            </div>

            {/* Text input */}
            {!isRecording && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '6px 12px' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitComment()}
                  placeholder="Add your voice to this..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#f0f5ee' }}
                />
                <button onClick={() => setShowEmojiPicker(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>😊</button>
              </div>
            )}

            {/* Voice record button */}
            <button onClick={toggleVoiceRecord} style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
              background: isRecording ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.06)',
              color: isRecording ? '#f87171' : 'rgba(255,255,255,.5)', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              🎙
            </button>

            {/* Send */}
            {!isRecording && input.trim() && (
              <button onClick={submitComment} style={{
                width: 36, height: 36, borderRadius: '50%', background: '#1a7c3e', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 2px 12px rgba(26,124,62,.4)',
              }}>
                ↑
              </button>
            )}
          </div>

          {/* Quick emoji row */}
          {showEmojiPicker && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 0 0', overflowX: 'auto' }}>
              {['😂','❤️','🔥','💯','😍','🙏','👏','🤣','😭','💪','🌍','🎉','🫙','🌾','💸'].map(e => (
                <span key={e} onClick={() => { setInput(i => i + e); setShowEmojiPicker(false) }} style={{ fontSize: 22, cursor: 'pointer', flexShrink: 0 }}>{e}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
