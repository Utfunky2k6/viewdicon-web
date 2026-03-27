'use client'
import * as React from 'react'
import { useParams, notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NkisiShield } from '@/components/ui/NkisiShield'
import { deriveNkisiState, deriveUbuntuRank, RANK_META } from '@/lib/nkisi'
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

export default function PublicProfilePage() {
  const params    = useParams()
  const handle    = params?.username as string
  const [profile, setProfile]           = React.useState<any>(null)
  const [loading, setLoading]           = React.useState(true)

  const [contactState, setContactState] = React.useState<ContactState>('NONE')
  const [ring, setRing]                 = React.useState<ConnectionRing | null>(null)
  const [sheet, setSheet]               = React.useState<'ring' | 'request' | null>(null)
  const [reqNote, setReqNote]           = React.useState('')

  React.useEffect(() => {
    fetch(`/api/v1/users/${handle}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [handle])

  if (loading) return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading profile...</p>
    </div>
  )
  if (!profile) return notFound()

  const nkisiState = deriveNkisiState(profile.ubuntuScore)
  const rank       = deriveUbuntuRank(profile.ubuntuScore)
  const rankMeta   = RANK_META[rank]
  const vMeta      = VERIFICATION_META[profile.verificationLevel as VerificationLevel] ?? VERIFICATION_META.PHONE_VERIFIED

  const handleSendRequest = () => {
    // TODO: call connectionApi.sendRequest(handle, reqNote)
    setContactState('REQUESTED')
    setSheet(null)
    setReqNote('')
  }

  const handleConnectRing = (r: ConnectionRing) => {
    setRing(r)
    setContactState('CONNECTED')
    setSheet(null)
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
              {contactState === 'CONNECTED' && ring && (
                <button
                  onClick={() => setSheet('ring')}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-green-500/40 bg-green-500/10 text-green-400"
                >
                  {RING_OPTIONS.find((r) => r.id === ring)?.emoji} Connected
                </button>
              )}
              {contactState === 'REQUESTED' && (
                <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
                  ⏳ Request Sent
                </span>
              )}
              {contactState === 'NONE' && (
                <Button onClick={() => setSheet('request')} size="sm">
                  Request to Connect
                </Button>
              )}
              <button className="p-2 rounded-xl bg-bg-elevated border border-border text-gray-400 hover:text-white">
                ⋯
              </button>
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
            <p className="text-sm text-gray-400">@{profile.handle}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="gold">{rankMeta.emoji} {rankMeta.label}</Badge>
              <Badge variant="outline" size="sm">{profile.heritageCircle}</Badge>
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
            { label: 'Connections', value: profile.connectionCount },
            { label: 'Villages',    value: profile.villageCount },
            { label: 'Ubuntu',      value: profile.ubuntuScore },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-3">
              <span className="font-bold text-white">{value}</span>
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Posts placeholder */}
        <div className="px-4 py-8 text-center text-gray-500 text-sm">
          Public posts will appear here.
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
            <h3 className="text-lg font-bold mb-1">Request to Connect</h3>
            <p className="text-sm text-gray-400 mb-4">
              Send a request to <strong className="text-white">@{profile.handle}</strong>.
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
            <Button onClick={handleSendRequest} className="w-full">
              Send Request
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
