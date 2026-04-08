'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { kerawaApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const FIRE = { primary: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#0a0a0a', card: '#141414', border: '#1f1f1f' }
const TABS = ['Active', 'Pending', 'Expired'] as const
const IDENTITY_ICONS: Record<string, string> = { SHADOW: '👤', SILHOUETTE: '🌑', PARTIAL: '🎭', VERIFIED: '✅', OPEN: '🔓' }

function countdown(expiresAt: string): { text: string; urgent: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { text: 'Expired', urgent: true }
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return { text: `${hrs}h ${mins}m`, urgent: hrs < 6 }
}

export default function KerawaMatchesPage() {
  const r = useRouter()
  const [tab, setTab] = useState<typeof TABS[number]>('Active')
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [tab])

  async function loadMatches() {
    setLoading(true)
    try {
      const status = tab === 'Active' ? 'ACTIVE' : tab === 'Pending' ? 'PENDING' : 'EXPIRED'
      const res = await kerawaApi.getMatches(status)
      setMatches(res?.matches || res || [])
    } catch (e) { logApiFailure('kerawa/matches/list', e); setMatches([]) }
    setLoading(false)
  }

  const MOCK_MATCHES = tab === 'Active' ? [
    { id: 'm1', nickname: 'GhostFlame_09', identityLevel: 'SHADOW', mood: '🔥', lastMessage: 'Are you coming tonight?', expiresAt: '2099-01-01T14:00:00.000Z', trustScore: 82 },
    { id: 'm2', nickname: 'NightOrchid', identityLevel: 'PARTIAL', mood: '💃', lastMessage: 'I like the vibe...', expiresAt: '2099-01-02T14:00:00.000Z', trustScore: 91 },
    { id: 'm3', nickname: 'CosmicKing', identityLevel: 'VERIFIED', mood: '💎', lastMessage: 'Let me propose a meetup', expiresAt: '2099-01-01T05:00:00.000Z', trustScore: 76 },
  ] : tab === 'Pending' ? [
    { id: 'm4', nickname: 'VelvetSoul', identityLevel: 'SILHOUETTE', mood: '🌙', lastMessage: null, expiresAt: '2099-01-02T22:00:00.000Z', trustScore: 88 },
  ] : [
    { id: 'm5', nickname: 'LostStar_X', identityLevel: 'SHADOW', mood: '🎭', lastMessage: 'We never met...', expiresAt: '2020-01-01T00:00:00.000Z', trustScore: 65 },
  ]

  const allMatches = matches.length ? matches : (USE_MOCKS ? MOCK_MATCHES : [])

  return (
    <div style={{ minHeight: '100vh', background: FIRE.bg, color: '#fff', fontFamily: 'monospace', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => r.push('/dashboard/kerawa')} style={{ fontSize: 20, cursor: 'pointer' }}>←</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>🔥 Matches</h1>
        </div>
        <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>All connections expire in 48 hours</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: tab === t ? FIRE.primary : FIRE.card, border: `1px solid ${tab === t ? FIRE.primary : FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{t}</button>
        ))}
      </div>

      {/* Match List */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>Loading...</div>
        ) : allMatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === 'Active' ? '🔥' : tab === 'Pending' ? '⏳' : '💨'}</div>
            <div style={{ color: '#666', fontSize: 13 }}>
              {tab === 'Active' && 'No active matches yet. Start discovering!'}
              {tab === 'Pending' && 'No pending matches. Your queue awaits.'}
              {tab === 'Expired' && 'No expired matches. Time is on your side.'}
            </div>
          </div>
        ) : (
          allMatches.map((m: any) => {
            const timer = countdown(m.expiresAt || new Date().toISOString())
            const expired = tab === 'Expired'
            return (
              <div key={m.id} onClick={() => !expired && r.push(`/dashboard/kerawa/matches/${m.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: FIRE.card, borderRadius: 12, border: `1px solid ${FIRE.border}`, marginBottom: 10, cursor: expired ? 'default' : 'pointer', opacity: expired ? 0.5 : 1 }}>
                {/* Avatar */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, filter: expired ? 'grayscale(1)' : 'none' }}>
                  {IDENTITY_ICONS[m.identityLevel] || '👤'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{m.nickname}</span>
                    <span style={{ fontSize: 14 }}>{m.mood}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.lastMessage || 'No messages yet'}
                  </div>
                </div>

                {/* Timer + Trust */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: expired ? '#555' : timer.urgent ? FIRE.primary : FIRE.light }}>{expired ? '⏱ Expired' : `⏱ ${timer.text}`}</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>🛡️ {m.trustScore || '—'}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
