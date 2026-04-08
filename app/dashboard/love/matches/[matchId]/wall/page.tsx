/**
 * UFE — Station 1: Cultural Wall
 *
 * Shared space where two people express themselves through
 * text, photos, voice, and video. Conversation-like layout
 * with 72h countdown timer and prompt suggestions.
 */
'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav,
  LWBadge, LWSkeleton, LWEmpty, LWSheet, LWTextarea, LWAvatar,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'
import { useAuthStore } from '@/stores/authStore'

/* ─── Types ─── */

interface WallPost {
  id: string
  authorId: string
  authorName?: string
  authorAvatar?: string
  mediaType: 'TEXT' | 'PHOTO' | 'VOICE' | 'VIDEO'
  content?: string
  mediaUrl?: string
  promptId?: string
  promptText?: string
  kilaCount: number
  kilaByMe: boolean
  createdAt: string
}

interface Prompt {
  id: string
  text: string
}

type MediaType = 'TEXT' | 'PHOTO' | 'VOICE' | 'VIDEO'

const MEDIA_ICONS: Record<MediaType, { label: string; icon: string }> = {
  TEXT:  { label: 'Text',  icon: 'Aa' },
  PHOTO: { label: 'Photo', icon: '\uD83D\uDDBC' },
  VOICE: { label: 'Voice', icon: '\uD83C\uDF99' },
  VIDEO: { label: 'Video', icon: '\uD83C\uDFA5' },
}

/* ─── Helpers ─── */

function timeLeft(iso: string, now: number): { label: string; urgent: boolean } {
  const ms = new Date(iso).getTime() - now
  if (ms <= 0) return { label: 'Expired', urgent: true }
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(h / 24)
  const label = d > 0 ? `${d}d ${h % 24}h remaining` : `${h}h remaining`
  return { label, urgent: h < 6 }
}

function formatTs(iso: string, now: number): string {
  const d = new Date(iso)
  const diffMs = now - d.getTime()
  if (diffMs < 60000) return 'Just now'
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/* ─── Page ─── */

export default function CulturalWallPage() {
  const { matchId } = useParams() as { matchId: string }
  const userId = useAuthStore((s) => s.user?.id)

  const [posts, setPosts] = React.useState<WallPost[]>([])
  const [prompts, setPrompts] = React.useState<Prompt[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null)

  // Create sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [mediaType, setMediaType] = React.useState<MediaType>('TEXT')
  const [textContent, setTextContent] = React.useState('')
  const [filePreview, setFilePreview] = React.useState<string | null>(null)
  const [activePrompt, setActivePrompt] = React.useState<Prompt | null>(null)
  const [sending, setSending] = React.useState(false)

  const fileRef = React.useRef<HTMLInputElement>(null)
  const feedEndRef = React.useRef<HTMLDivElement>(null)
  const [clientNow, setClientNow] = React.useState(0)
  React.useEffect(() => { setClientNow(Date.now()) }, [])

  /* ─── Load data ─── */

  React.useEffect(() => { load() }, [matchId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const [wallRes, promptsRes, stationRes] = await Promise.allSettled([
      loveWorldApi.getWallPosts(matchId),
      loveWorldApi.getWallPrompts(matchId),
      loveWorldApi.getStationStatus(matchId),
    ])
    if (wallRes.status === 'fulfilled' && wallRes.value?.posts) {
      setPosts(mapPosts(wallRes.value.posts))
    }
    if (promptsRes.status === 'fulfilled' && promptsRes.value?.prompts) {
      setPrompts(promptsRes.value.prompts)
    }
    if (stationRes.status === 'fulfilled') {
      const exp = stationRes.value?.station1?.expiresAt || stationRes.value?.expiresAt
      if (exp) setExpiresAt(exp)
    }
    setLoading(false)
  }

  function mapPosts(raw: any[]): WallPost[] {
    return raw.map((r: any) => ({
      id: r.id || String(Math.random()),
      authorId: r.authorId || r.author?.id || '',
      authorName: r.authorName || r.author?.name || r.author?.displayName || 'Unknown',
      authorAvatar: r.authorAvatar || r.author?.avatarUrl || null,
      mediaType: r.mediaType || r.type || 'TEXT',
      content: r.content || r.text || '',
      mediaUrl: r.mediaUrl || null,
      promptId: r.promptId || null,
      promptText: r.promptText || r.prompt?.text || null,
      kilaCount: r.kilaCount ?? r.kilas ?? r.likes ?? 0,
      kilaByMe: r.kilaByMe ?? false,
      createdAt: r.createdAt || new Date().toISOString(),
    }))
  }

  /* ─── Actions ─── */

  async function handleSubmit() {
    if (mediaType === 'TEXT' && !textContent.trim()) return
    setSending(true)
    const payload: any = { mediaType, content: textContent.trim() || undefined }
    if (activePrompt) payload.promptId = activePrompt.id
    if (filePreview && mediaType !== 'TEXT') payload.mediaUrl = filePreview

    // Optimistic insert
    const optimistic: WallPost = {
      id: `opt-${Date.now()}`,
      authorId: userId || '',
      authorName: 'You',
      mediaType,
      content: payload.content,
      mediaUrl: payload.mediaUrl,
      promptId: activePrompt?.id,
      promptText: activePrompt?.text,
      kilaCount: 0,
      kilaByMe: false,
      createdAt: new Date().toISOString(),
    }
    setPosts((prev) => [...prev, optimistic])
    resetSheet()

    try {
      await loveWorldApi.createWallPost(matchId, payload)
      await load()
    } catch (e) { logApiFailure('love/wall/post', e) }
    setSending(false)
    setTimeout(() => feedEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function handleKila(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, kilaByMe: !p.kilaByMe, kilaCount: p.kilaCount + (p.kilaByMe ? -1 : 1) }
          : p
      )
    )
    try { await loveWorldApi.kilaWallPost(matchId, postId) } catch (e) { logApiFailure('love/wall/kila', e) }
  }

  function openPrompt(p: Prompt) {
    setActivePrompt(p)
    setMediaType('TEXT')
    setTextContent('')
    setFilePreview(null)
    setSheetOpen(true)
  }

  function resetSheet() {
    setSheetOpen(false)
    setTextContent('')
    setFilePreview(null)
    setActivePrompt(null)
    setMediaType('TEXT')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setFilePreview(url)
  }

  /* ─── Timer ─── */

  const timer = expiresAt ? timeLeft(expiresAt, clientNow) : null

  /* ─── Loading state ─── */

  if (loading) {
    return (
      <RealmProvider realm="ufe">
        <LWNav title="Cultural Wall" backHref={`/dashboard/love/matches/${matchId}`} backLabel="Match"
          right={<LWBadge variant="accent">Station 1</LWBadge>} />
        <div style={{ padding: `${SPACE[6]}px ${SPACE[4]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
          <LWSkeleton height={20} width="40%" />
          <div style={{ display: 'flex', gap: SPACE[2] }}>
            {[1, 2, 3].map((i) => <LWSkeleton key={i} height={36} width={140} radius={RADIUS.full} />)}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: i % 2 === 0 ? 'row-reverse' : 'row' }}>
              <LWSkeleton height={100} width="75%" radius={RADIUS.xl} />
            </div>
          ))}
        </div>
      </RealmProvider>
    )
  }

  /* ─── Render ─── */

  return (
    <RealmProvider realm="ufe">
      <LWNav
        title="Cultural Wall"
        backHref={`/dashboard/love/matches/${matchId}`}
        backLabel="Match"
        right={<LWBadge variant="accent">Station 1</LWBadge>}
      />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[20]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>

        {/* Expiry timer */}
        {timer && (
          <div style={{ textAlign: 'center', padding: `${SPACE[2]}px 0` }}>
            <LWText scale="h3" color={timer.urgent ? 'danger' : 'accent'} align="center">
              {timer.label}
            </LWText>
            <LWText scale="caption" color="muted" align="center" style={{ marginTop: SPACE[1] }}>
              Share meaningful moments to advance
            </LWText>
          </div>
        )}

        {/* Prompt suggestions */}
        {prompts.length > 0 && (
          <div style={{
            display: 'flex', gap: SPACE[2], overflowX: 'auto',
            paddingBottom: SPACE[1], scrollbarWidth: 'none',
          }}>
            {prompts.slice(0, 6).map((p) => (
              <button
                key={p.id}
                onClick={() => openPrompt(p)}
                style={{
                  flexShrink: 0,
                  padding: `${SPACE[2]}px ${SPACE[3]}px`,
                  background: REALM.ufe.accentMuted,
                  border: `1px solid ${REALM.ufe.accent}20`,
                  borderRadius: RADIUS.full,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  ...TYPE.caption,
                  color: REALM.ufe.accent,
                  whiteSpace: 'nowrap',
                  transition: `all ${DURATION.fast} ${EASE.default}`,
                }}
              >
                {p.text.length > 38 ? p.text.slice(0, 38) + '...' : p.text}
              </button>
            ))}
          </div>
        )}

        {/* Post feed */}
        {posts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
            {posts.map((post) => {
              const isMine = post.authorId === userId
              return (
                <div
                  key={post.id}
                  style={{
                    display: 'flex',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    gap: SPACE[2],
                    maxWidth: '85%',
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <LWAvatar src={post.authorAvatar} name={post.authorName} size={32} />
                  <div style={{
                    background: isMine ? REALM.ufe.accentMuted : COLOR.elevated,
                    borderRadius: RADIUS.xl,
                    padding: SPACE[3],
                    border: `1px solid ${isMine ? `${REALM.ufe.accent}30` : COLOR.border}`,
                    minWidth: 0,
                    flex: 1,
                  }}>
                    {/* Author + timestamp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[1] }}>
                      <LWText scale="micro" color={isMine ? 'accent' : 'secondary'} as="span" style={{ fontWeight: 600 }}>
                        {isMine ? 'You' : post.authorName}
                      </LWText>
                      <LWText scale="micro" color="muted" as="span">{formatTs(post.createdAt, clientNow)}</LWText>
                    </div>

                    {/* Prompt context */}
                    {post.promptText && (
                      <LWText scale="caption" color="muted" style={{
                        fontStyle: 'italic', marginBottom: SPACE[2],
                        paddingBottom: SPACE[1], borderBottom: `1px solid ${COLOR.border}`,
                      }}>
                        {post.promptText}
                      </LWText>
                    )}

                    {/* Content by media type */}
                    {post.mediaType === 'TEXT' && post.content && (
                      <LWText scale="body">{post.content}</LWText>
                    )}
                    {post.mediaType === 'PHOTO' && post.mediaUrl && (
                      <img
                        src={post.mediaUrl}
                        alt="Shared photo"
                        style={{ width: '100%', borderRadius: RADIUS.lg, marginTop: SPACE[1] }}
                      />
                    )}
                    {post.mediaType === 'VOICE' && (
                      <div style={{ marginTop: SPACE[1] }}>
                        <audio controls src={post.mediaUrl} style={{ width: '100%', height: 36 }} />
                        {post.content && <LWText scale="caption" color="secondary" style={{ marginTop: SPACE[1] }}>{post.content}</LWText>}
                      </div>
                    )}
                    {post.mediaType === 'VIDEO' && post.mediaUrl && (
                      <video
                        controls
                        src={post.mediaUrl}
                        poster={undefined}
                        style={{ width: '100%', borderRadius: RADIUS.lg, marginTop: SPACE[1] }}
                      />
                    )}

                    {/* Kila button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[1], marginTop: SPACE[2] }}>
                      <button
                        onClick={() => handleKila(post.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: SPACE[1],
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', ...TYPE.caption,
                          color: post.kilaByMe ? REALM.ufe.accent : COLOR.textMuted,
                          transition: `color ${DURATION.fast} ${EASE.default}`,
                          padding: 0,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={post.kilaByMe ? REALM.ufe.accent : 'none'}>
                          <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            stroke={post.kilaByMe ? REALM.ufe.accent : 'currentColor'}
                            strokeWidth="1.5"
                          />
                        </svg>
                        {post.kilaCount > 0 && <span>{post.kilaCount}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={feedEndRef} />
          </div>
        ) : (
          <LWEmpty
            title="Start your cultural exchange"
            message="Share a story, tradition, photo, or voice note to begin."
            action={<LWButton variant="primary" onClick={() => setSheetOpen(true)}>Share first post</LWButton>}
          />
        )}
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setSheetOpen(true)}
        style={{
          position: 'fixed',
          bottom: SPACE[8],
          right: SPACE[4],
          width: 56,
          height: 56,
          borderRadius: RADIUS.full,
          background: REALM.ufe.accent,
          color: COLOR.textInverse,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 700,
          boxShadow: `0 4px 20px ${REALM.ufe.accent}40`,
          transition: `transform ${DURATION.fast} ${EASE.spring}`,
          zIndex: 10,
        }}
        aria-label="Create post"
      >
        +
      </button>

      {/* Create sheet */}
      <LWSheet open={sheetOpen} onClose={resetSheet} title="Share on Wall">
        {/* Active prompt */}
        {activePrompt && (
          <div style={{
            padding: `${SPACE[2]}px ${SPACE[3]}px`,
            background: REALM.ufe.accentMuted,
            borderRadius: RADIUS.lg,
            marginBottom: SPACE[3],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <LWText scale="caption" color="accent" style={{ fontStyle: 'italic', flex: 1 }}>
              {activePrompt.text}
            </LWText>
            <button
              onClick={() => setActivePrompt(null)}
              style={{ background: 'none', border: 'none', color: COLOR.textMuted, cursor: 'pointer', padding: SPACE[1], fontSize: '1rem' }}
            >
              x
            </button>
          </div>
        )}

        {/* Media type picker */}
        <div style={{ display: 'flex', gap: SPACE[2], marginBottom: SPACE[4] }}>
          {(Object.keys(MEDIA_ICONS) as MediaType[]).map((mt) => (
            <button
              key={mt}
              onClick={() => { setMediaType(mt); setFilePreview(null) }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: SPACE[1],
                padding: `${SPACE[2]}px 0`,
                background: mt === mediaType ? REALM.ufe.accentMuted : 'transparent',
                border: `1px solid ${mt === mediaType ? REALM.ufe.accent : COLOR.border}`,
                borderRadius: RADIUS.lg,
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: mt === mediaType ? REALM.ufe.accent : COLOR.textSecondary,
                transition: `all ${DURATION.fast} ${EASE.default}`,
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{MEDIA_ICONS[mt].icon}</span>
              <span style={{ ...TYPE.micro }}>{MEDIA_ICONS[mt].label}</span>
            </button>
          ))}
        </div>

        {/* Input area */}
        {mediaType === 'TEXT' && (
          <LWTextarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Share a story, tradition, or value..."
            rows={4}
            maxChars={500}
          />
        )}

        {mediaType === 'PHOTO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
            {filePreview ? (
              <div style={{ position: 'relative' }}>
                <img src={filePreview} alt="Preview" style={{ width: '100%', borderRadius: RADIUS.lg, maxHeight: 240, objectFit: 'cover' }} />
                <button
                  onClick={() => { setFilePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  style={{ position: 'absolute', top: SPACE[2], right: SPACE[2], width: 28, height: 28, borderRadius: RADIUS.full, background: COLOR.overlay, color: COLOR.textPrimary, border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  x
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  height: 120, borderRadius: RADIUS.lg, border: `2px dashed ${COLOR.border}`,
                  background: 'transparent', color: COLOR.textMuted, cursor: 'pointer',
                  fontFamily: 'inherit', ...TYPE.caption, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                Tap to select a photo
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <LWTextarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Add a caption (optional)..."
              rows={2}
            />
          </div>
        )}

        {mediaType === 'VOICE' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACE[3], padding: `${SPACE[4]}px 0` }}>
            <button
              style={{
                width: 72, height: 72, borderRadius: RADIUS.full,
                background: REALM.ufe.accentMuted, border: `2px solid ${REALM.ufe.accent}`,
                color: REALM.ufe.accent, cursor: 'pointer', fontSize: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {'\uD83C\uDF99'}
            </button>
            <LWText scale="caption" color="muted">Tap to record a voice note</LWText>
            <LWTextarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Add a description (optional)..."
              rows={2}
            />
          </div>
        )}

        {mediaType === 'VIDEO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
            {filePreview ? (
              <div style={{ position: 'relative' }}>
                <video src={filePreview} controls style={{ width: '100%', borderRadius: RADIUS.lg, maxHeight: 240 }} />
                <button
                  onClick={() => { setFilePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  style={{ position: 'absolute', top: SPACE[2], right: SPACE[2], width: 28, height: 28, borderRadius: RADIUS.full, background: COLOR.overlay, color: COLOR.textPrimary, border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  x
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  height: 120, borderRadius: RADIUS.lg, border: `2px dashed ${COLOR.border}`,
                  background: 'transparent', color: COLOR.textMuted, cursor: 'pointer',
                  fontFamily: 'inherit', ...TYPE.caption, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                Tap to select a video
              </button>
            )}
            <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <LWTextarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Add a caption (optional)..."
              rows={2}
            />
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: SPACE[4] }}>
          <LWButton
            variant="primary"
            fullWidth
            loading={sending}
            disabled={mediaType === 'TEXT' ? !textContent.trim() : (!filePreview && mediaType !== 'VOICE')}
            onClick={handleSubmit}
          >
            Share
          </LWButton>
        </div>
      </LWSheet>
    </RealmProvider>
  )
}
