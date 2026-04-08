/**
 * UFÈ — Station 1: Cultural Wall
 * Content-first discovery. Identity sharing via cultural artifacts.
 * 72-hour window. Banking-grade layout.
 */
'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav, LWBadge,
  LWProgress, LWDivider, LWEmpty, LWTextarea, LWSheet, Spinner,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const T = REALM.ufe

const PROMPTS = [
  { id: 'heritage', icon: '🏛', title: 'My Heritage', description: 'Share your cultural background, traditions, and ancestry.' },
  { id: 'values', icon: '⚖️', title: 'Core Values', description: 'What principles guide your life decisions?' },
  { id: 'family', icon: '👨‍👩‍👧‍👦', title: 'Family Dynamics', description: 'Describe your family structure and your role in it.' },
  { id: 'faith', icon: '🕊️', title: 'Spiritual Life', description: 'Share your spiritual beliefs and practices.' },
  { id: 'ambition', icon: '🎯', title: 'Life Ambitions', description: 'Where do you see yourself in 5-10 years?' },
  { id: 'deal', icon: '🚫', title: 'Non-Negotiables', description: 'What are your absolute non-negotiables in a partner?' },
]

interface WallPost {
  id: string
  authorId: string
  authorName: string
  promptId?: string
  content: string
  mediaUrl?: string
  mediaType?: string
  kilas: number
  createdAt: string
}

export default function CulturalWallPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('matchId') || ''

  const [posts, setPosts] = React.useState<WallPost[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCompose, setShowCompose] = React.useState(false)
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>(null)
  const [content, setContent] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const loadPosts = React.useCallback(async () => {
    if (!matchId) { setLoading(false); return }
    try {
      const res = await loveWorldApi.getWallPosts(matchId)
      setPosts(Array.isArray(res) ? res : res?.posts ?? [])
    } catch (e) { logApiFailure('love/ufe/wall/posts', e); setPosts([]) }
    setLoading(false)
  }, [matchId])

  React.useEffect(() => { loadPosts() }, [loadPosts])

  const handleSubmitPost = async () => {
    if (!content.trim() || !matchId) return
    setSubmitting(true)
    try {
      await loveWorldApi.createWallPost(matchId, {
        content: content.trim(),
        promptId: selectedPrompt || undefined,
      })
      setContent('')
      setSelectedPrompt(null)
      setShowCompose(false)
      loadPosts()
    } catch (e) { logApiFailure('love/station1/post', e) }
    setSubmitting(false)
  }

  return (
    <RealmProvider realm="ufe">
      <LWNav title="Cultural Wall" backHref={matchId ? `/dashboard/love/matches/${matchId}` : '/dashboard/love/ufe'} backLabel="Back" />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[16]}px`, maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
        {/* Station header */}
        <LWCard padding={SPACE[4]} style={{ borderColor: `${T.accent}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
            <div style={{ width: 40, height: 40, borderRadius: RADIUS.full, background: T.accentMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏛</div>
            <div style={{ flex: 1 }}>
              <LWText scale="h3" as="h2">Station 1: Cultural Wall</LWText>
              <LWText scale="caption" color="muted">Share cultural artifacts. Content-first discovery.</LWText>
            </div>
            <LWBadge variant="accent">72h</LWBadge>
          </div>
        </LWCard>

        {/* Prompts grid */}
        <section>
          <LWText scale="caption" color="secondary" transform="uppercase" style={{ marginBottom: SPACE[2], letterSpacing: '0.06em' }}>
            Cultural Prompts
          </LWText>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACE[2] }}>
            {PROMPTS.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedPrompt(p.id); setShowCompose(true) }}
                style={{
                  padding: SPACE[3], background: selectedPrompt === p.id ? T.accentMuted : COLOR.card,
                  border: `1px solid ${selectedPrompt === p.id ? T.accent : COLOR.border}`,
                  borderRadius: RADIUS.lg, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  transition: `all ${DURATION.fast} ${EASE.default}`,
                }}
              >
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <LWText scale="caption" as="div" style={{ fontWeight: 500, marginTop: SPACE[1] }}>{p.title}</LWText>
              </button>
            ))}
          </div>
        </section>

        {/* Posts feed */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACE[3] }}>
            <LWText scale="h3" as="h3">Wall Posts</LWText>
            <LWButton variant="secondary" size="sm" onClick={() => setShowCompose(true)}>+ Post</LWButton>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: SPACE[8] }}><Spinner size={24} color={T.accent} /></div>
          ) : posts.length === 0 ? (
            <LWEmpty title="No posts yet" message="Start sharing your cultural identity by selecting a prompt above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
              {posts.map(post => {
                const prompt = PROMPTS.find(p => p.id === post.promptId)
                return (
                  <LWCard key={post.id} padding={SPACE[4]}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2], marginBottom: SPACE[2] }}>
                      {prompt && <span style={{ fontSize: 14 }}>{prompt.icon}</span>}
                      <LWText scale="caption" color="accent" as="span" style={{ fontWeight: 500 }}>{post.authorName}</LWText>
                      <LWText scale="micro" color="muted" as="span" style={{ marginLeft: 'auto' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </LWText>
                    </div>
                    {prompt && <LWText scale="micro" color="muted" style={{ marginBottom: SPACE[1] }}>{prompt.title}</LWText>}
                    <LWText scale="body" color="secondary">{post.content}</LWText>
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[3] }}>
                      <button
                        onClick={async () => { try { await loveWorldApi.kilaWallPost(matchId, post.id); loadPosts() } catch (e) { logApiFailure('love/station1/kila', e) } }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLOR.textMuted, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', fontSize: TYPE.micro.fontSize }}
                      >
                        💛 {post.kilas || 0}
                      </button>
                    </div>
                  </LWCard>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Compose sheet */}
      <LWSheet open={showCompose} onClose={() => setShowCompose(false)} title="Share on Cultural Wall">
        {selectedPrompt && (
          <LWCard padding={SPACE[3]} style={{ marginBottom: SPACE[3], background: T.accentMuted, borderColor: `${T.accent}20` }}>
            <LWText scale="caption" color="accent">{PROMPTS.find(p => p.id === selectedPrompt)?.description}</LWText>
          </LWCard>
        )}
        <LWTextarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your story..."
          maxChars={1000}
          style={{ minHeight: 120 }}
        />
        <div style={{ display: 'flex', gap: SPACE[2], marginTop: SPACE[3] }}>
          <LWButton variant="ghost" fullWidth onClick={() => setShowCompose(false)}>Cancel</LWButton>
          <LWButton variant="primary" fullWidth loading={submitting} disabled={!content.trim()} onClick={handleSubmitPost}>Post</LWButton>
        </div>
      </LWSheet>
    </RealmProvider>
  )
}
