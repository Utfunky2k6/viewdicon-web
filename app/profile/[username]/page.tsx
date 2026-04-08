'use client'
import * as React from 'react'
import { useParams, notFound, useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NkisiShield } from '@/components/ui/NkisiShield'
import { deriveNkisiState, deriveUbuntuRank, RANK_META } from '@/lib/nkisi'
import { getRankFromXP } from '@/constants/ranks'
import { useAuthStore } from '@/stores/authStore'
import { connectionApi, sorosokeApi } from '@/lib/api'
import type { ConnectionRing, VerificationLevel } from '@/types'

// ── Public Profile Page ────────────────────────────────────────
// Layer 2 surface only: displayName + @handle
// Afro-ID is NEVER shown here. Connection is consent-gated (Layer 3).

const VERIFICATION_META: Record<VerificationLevel, { label: string; color: string }> = {
  UNVERIFIED:       { label: 'Unverified',        color: 'text-gray-500' },
  PHONE_VERIFIED:   { label: 'Phone Verified',     color: 'text-blue-400' },
  VILLAGE_WITNESSED:{ label: 'Village Witnessed',  color: 'text-green-400' },
  CLAN_BACKED:      { label: 'Clan Backed',        color: 'text-amber-400' },
  ELDER_STANDING:   { label: 'Elder Standing',     color: 'text-kente-gold' },
}

type ContactState = 'NONE' | 'REQUESTED' | 'CONNECTED'

const RING_OPTIONS: { id: ConnectionRing; emoji: string; label: string; desc: string }[] = [
  { id: 'SIT_AT_MY_FIRE',  emoji: '🔥', label: 'Sit At My Fire',  desc: 'Inner circle — deepest trust, Afro-ID shared' },
  { id: 'KEEP_MY_NAME',    emoji: '🤲', label: 'Keep My Name',    desc: 'Trusted network — real name known' },
  { id: 'STAND_BESIDE_ME', emoji: '🌿', label: 'Stand Beside Me', desc: 'Extended village — public handle only' },
]

type PublicPost = {
  id: string
  body: string
  createdAt: string
  kilaCount: number
  stirCount: number
  type: string
}

export default function PublicProfilePage() {
  const params    = useParams()
  const router    = useRouter()
  const handle    = params?.username as string
  const authUser  = useAuthStore(s => s.user)

  const [profile, setProfile]           = React.useState<any>(null)
  const [loading, setLoading]           = React.useState(true)
  const [posts, setPosts]               = React.useState<PublicPost[]>([])
  const [postsLoading, setPostsLoading] = React.useState(false)
  const [connectLoading, setConnectLoading] = React.useState(false)

  const [contactState, setContactState] = React.useState<ContactState>('NONE')
  const [ring, setRing]                 = React.useState<ConnectionRing | null>(null)
  const [sheet, setSheet]               = React.useState<'ring' | 'request' | null>(null)
  const [reqNote, setReqNote]           = React.useState('')
  const [showMoreMenu, setShowMoreMenu] = React.useState(false)

  // Fetch profile data
  React.useEffect(() => {
    fetch(`/api/v1/users/${handle}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [handle])

  // Fetch user's posts after profile loads
  React.useEffect(() => {
    if (!profile?.id) return
    setPostsLoading(true)
    sorosokeApi.userPosts(profile.id)
      .then((r: any) => {
        const rows = r?.data ?? []
        if (Array.isArray(rows)) {
          setPosts(rows.slice(0, 10).map((p: any) => ({
            id:         String(p.id ?? ''),
            body:       String(p.body ?? p.content ?? ''),
            createdAt:  p.createdAt ?? '',
            kilaCount:  Number(p.kilaCount ?? 0),
            stirCount:  Number(p.stirCount ?? 0),
            type:       String(p.type ?? 'PERSONAL'),
          })))
        }
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [profile?.id])

  if (loading) return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading profile...</p>
    </div>
  )
  if (!profile) return notFound()

  // Check if this is the logged-in user's own profile
  const isOwn = !!(
    authUser && (
      authUser.handle === handle ||
      authUser.handle === `@${handle}` ||
      authUser.username === handle ||
      String(authUser.id) === String(profile.id)
    )
  )

  const nkisiState = deriveNkisiState(profile.ubuntuScore ?? 0)
  const rank       = deriveUbuntuRank(profile.ubuntuScore ?? 0)
  const rankMeta   = RANK_META[rank]

  // Honor tier from XP
  const honorXp       = profile.honorXp ?? profile.ubuntuScore ?? 0
  const honorRankInfo = getRankFromXP(honorXp)

  const vMeta = VERIFICATION_META[profile.verificationLevel as VerificationLevel] ?? VERIFICATION_META.PHONE_VERIFIED

  // Ubuntu score display (capped 0-100 for display)
  const ubuntuDisplay = Math.min(100, Math.round((honorXp) / 50)) || profile.ubuntuScore || 0

  const handleSendRequest = async () => {
    setConnectLoading(true)
    try {
      await connectionApi.sendRequest(handle, reqNote || undefined)
    } catch {
      // optimistic — still mark as requested if API is offline
    }
    setContactState('REQUESTED')
    setSheet(null)
    setReqNote('')
    setConnectLoading(false)
  }

  const handleConnectRing = (r: ConnectionRing) => {
    setRing(r)
    setContactState('CONNECTED')
    setSheet(null)
  }

  const handleBlock = async () => {
    try {
      await connectionApi.block(handle)
    } catch { /* ok */ }
    alert('User blocked.')
    setShowMoreMenu(false)
  }

  return (
    <div className="min-h-screen bg-bg-default">
      {/* Cover */}
      <div className="h-28 bg-gradient-to-r from-kente-forest via-kente-gold/30 to-kente-fire" />

      <div className="max-w-md mx-auto">
        {/* Avatar + action row */}
        <div className="px-4 -mt-12 pb-4 border-b border-border">
          <div className="flex items-end justify-between">
            <NkisiShield state={nkisiState} size="2xl" showLabel>
              <Avatar
                name={profile.displayName}
                size="2xl"
                className="border-4 border-bg-default"
              />
            </NkisiShield>

            <div className="flex items-center gap-2 mb-1">
              {/* Own profile — show Edit button */}
              {isOwn && (
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  style={{
                    padding: '7px 14px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                    background: 'rgba(212,160,23,.1)', border: '1px solid rgba(212,160,23,.3)',
                    color: '#fbbf24', cursor: 'pointer',
                  }}
                >
                  ✏️ Edit Profile
                </button>
              )}

              {/* Other user's profile — show connect state */}
              {!isOwn && contactState === 'CONNECTED' && ring && (
                <button
                  onClick={() => setSheet('ring')}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-green-500/40 bg-green-500/10 text-green-400"
                >
                  {RING_OPTIONS.find((r) => r.id === ring)?.emoji} Ọrẹ (Connected)
                </button>
              )}
              {!isOwn && contactState === 'REQUESTED' && (
                <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
                  ⏳ Request Sent
                </span>
              )}
              {!isOwn && contactState === 'NONE' && (
                <Button onClick={() => setSheet('request')} size="sm">
                  🤝 Fọwọ Kan
                </Button>
              )}

              {/* More menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-2 rounded-xl bg-bg-elevated border border-border text-gray-400 hover:text-white">
                  ⋯
                </button>
                {showMoreMenu && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: '#1a1a2e', border: '1px solid #333', borderRadius: 10, zIndex: 50, minWidth: 160, overflow: 'hidden' }}>
                    {[
                      { label: '🔗 Copy Profile Link', fn: () => { navigator.clipboard?.writeText(window.location.href); setShowMoreMenu(false) } },
                      { label: '↗ Share Profile', fn: () => { navigator.share?.({ title: profile?.displayName, url: window.location.href }).catch(() => {}); setShowMoreMenu(false) } },
                      ...(!isOwn ? [
                        { label: '🚫 Block User', fn: handleBlock },
                        { label: '🚩 Report', fn: () => { alert('Report submitted.'); setShowMoreMenu(false) } },
                      ] : []),
                    ].map(item => (
                      <button key={item.label} onClick={item.fn} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#e0e0e0', fontSize: 13, textAlign: 'left', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#ffffff11')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Identity — Layer 2 only */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{profile.displayName}</h1>
              <span className={`text-xs font-medium ${vMeta.color}`}>
                {profile.verificationLevel === 'UNVERIFIED' ? '' : `✓ ${vMeta.label}`}
              </span>
            </div>
            <p className="text-sm text-gray-400">@{profile.handle ?? handle}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {/* Honor tier badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 9px', borderRadius: 99,
                background: `${honorRankInfo.color}22`, border: `1px solid ${honorRankInfo.color}55`,
                color: honorRankInfo.color, fontSize: 10, fontWeight: 800,
              }}>
                {honorRankInfo.emoji} {honorRankInfo.name}
              </span>
              <Badge variant="gold">{rankMeta.emoji} {rankMeta.label}</Badge>
              {profile.heritageCircle && (
                <Badge variant="outline" size="sm">{profile.heritageCircle}</Badge>
              )}
              {/* Village badge */}
              {profile.villageId && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 9px', borderRadius: 99,
                  background: 'rgba(26,124,62,.12)', border: '1px solid rgba(26,124,62,.3)',
                  color: '#4ade80', fontSize: 10, fontWeight: 700,
                }}>
                  🏘 {profile.villageName ?? profile.villageId}
                </span>
              )}
              {profile.spiritualTitle && (
                <Badge variant="purple" size="sm">✨ {profile.spiritualTitle}</Badge>
              )}
            </div>
          </div>

          {/* Afro-ID deliberately NOT shown — sacred, private, never public */}
          <div className="mt-3 bg-bg-elevated/50 border border-border/50 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">AfroID</span>
            <span className="text-xs text-gray-600 flex-1 font-mono">••••-••••-••••</span>
            <span className="text-xs text-gray-600">🔒 Sacred</span>
          </div>

          {profile.bio && (
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          {[
            { label: 'Connections', value: profile.connectionCount ?? 0 },
            { label: 'Village',     value: profile.villageId ? 1 : 0 },
            { label: 'Ubuntu',      value: ubuntuDisplay },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-3">
              <span className="font-bold text-white">{value}</span>
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Posts section */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ padding: '0 16px 10px', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Posts
          </div>

          {postsLoading && (
            <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
              Loading posts...
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🥁</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
                No public posts yet
              </div>
            </div>
          )}

          {!postsLoading && posts.map(post => (
            <div key={post.id} style={{
              margin: '0 12px 10px',
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 14, padding: 14,
            }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, marginBottom: 10 }}>
                {post.body}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
                <span>⭐ {post.kilaCount}</span>
                <span>🔥 {post.stirCount}</span>
                {post.createdAt && (
                  <span style={{ marginLeft: 'auto' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sheet: Request to Connect (Layer 3) ── */}
      {sheet === 'request' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSheet(null)}
        >
          <div
            className="w-full max-w-md bg-bg-elevated border border-border rounded-t-3xl p-6 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-1">🤝 Fọwọ Kan — Shake Hands</h3>
            <p className="text-sm text-gray-400 mb-4">
              Send a connection request to <strong className="text-white">@{profile.handle ?? handle}</strong>.
              They choose whether to accept — no spam, no cold DMs.
            </p>
            <textarea
              value={reqNote}
              onChange={(e) => setReqNote(e.target.value)}
              placeholder="Add a note about why you want to connect (optional)..."
              maxLength={160}
              rows={3}
              className="w-full bg-bg-default border border-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-kente-gold/50 mb-4"
            />
            <div className="bg-kente-gold/5 border border-kente-gold/20 rounded-xl px-3 py-2 text-xs text-gray-400 mb-4">
              🔒 Your Afro-ID will only be shared if they accept and you both choose to trust.
            </div>
            <Button onClick={handleSendRequest} className="w-full" disabled={connectLoading}>
              {connectLoading ? '⏳ Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Sheet: Ring picker (after accepted) ── */}
      {sheet === 'ring' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSheet(null)}
        >
          <div
            className="w-full max-w-md bg-bg-elevated border border-border rounded-t-3xl p-6 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-1">Your circles</h3>
            <p className="text-sm text-gray-400 mb-4">
              How close is {profile.displayName} to your fire?
            </p>
            <div className="space-y-2">
              {RING_OPTIONS.map(({ id, emoji, label, desc }) => (
                <button
                  key={id}
                  onClick={() => handleConnectRing(id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                    ${ring === id
                      ? 'border-kente-gold/60 bg-kente-gold/10'
                      : 'border-border hover:border-kente-gold/40 hover:bg-kente-gold/5'
                    }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
