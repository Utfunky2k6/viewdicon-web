'use client'
// ════════════════════════════════════════════════════════════════════
// Sòrò Sókè — Social Feed Page
// Routes to /dashboard/social (alternate entry for the full feed).
// Uses the complete component library from components/feed/.
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { Post } from '@/components/feed/feedTypes'
import { PostCard } from '@/components/feed/PostCard'
import { VillageSquare } from '@/components/feed/VillageSquare'
import { NightMarketBanner } from '@/components/feed/NightMarketBanner'
import { CreatePostSheet } from '@/components/feed/CreatePostSheet'
import VoiceStoryPlayer from '@/components/feed/VoiceStoryPlayer'
import { VOCAB } from '@/constants/vocabulary'

// ── Types ────────────────────────────────────────────────────────
type Skin = 'ise' | 'egbe' | 'idile'
type Layer = 'drum' | 'nation' | 'motion'
type SortMode = 'hot' | 'fresh' | 'ready'

// ── Skin colours ──────────────────────────────────────────────────
const SKIN_CONFIG: Record<Skin, { label: string; emoji: string; color: string }> = {
  ise:   { label: VOCAB.skinIse,   emoji: '⚒',  color: '#1a7c3e' },
  egbe:  { label: VOCAB.skinEgbe,  emoji: '⭕', color: '#d97706' },
  idile: { label: VOCAB.skinIdile, emoji: '🌳', color: '#7c3aed' },
}

// ── Posts (empty initial — fetched from soro-soke-feed backend) ──
const INITIAL_POSTS: Post[] = []

function isNightMarketTime(): boolean {
  const h = new Date().getHours()
  return h >= 18 || h < 6
}

// ════════════════════════════════════════════════════════════════════
export default function SoroSokePage() {
  const router = useRouter()
  const [skin, setSkin] = React.useState<Skin>('ise')
  const [layer, setLayer] = React.useState<Layer>('drum')
  const [sortMode, setSortMode] = React.useState<SortMode>('hot')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [voicePost, setVoicePost] = React.useState<Post | null>(null)
  const [nightDismissed, setNightDismissed] = React.useState(false)
  const isNight = isNightMarketTime()

  const skinCfg = SKIN_CONFIG[skin]

  // Filter & sort posts by layer
  const posts = React.useMemo(() => {
    let result = [...INITIAL_POSTS]
    if (layer === 'nation') result = result.filter(p => p.drumScope >= 2)
    if (sortMode === 'hot') result.sort((a, b) => b.heatScore - a.heatScore)
    else if (sortMode === 'fresh') result.sort((a, b) => a.time.localeCompare(b.time))
    // Blood calls always first
    const blood = result.filter(p => p.type === 'BLOOD_CALL')
    const rest = result.filter(p => p.type !== 'BLOOD_CALL')
    return [...blood, ...rest]
  }, [layer, sortMode])

  const handleInteract = (type: string, postId: string) => {
    if (type === 'griot') router.push(`/dashboard/ai?context=${postId}`)
    if (type === 'voice-play') {
      const p = INITIAL_POSTS.find(pp => pp.id === postId)
      if (p) setVoicePost(p)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#050805',
      color: '#f0f5ee', fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
      position: 'relative', paddingBottom: 80,
    }}>
      {/* ── Sticky Header ──────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(10,15,11,.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(26,124,62,.12)',
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 18, fontWeight: 900, fontFamily: "'Sora', sans-serif",
              background: 'linear-gradient(90deg, #4ade80, #d4a017)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Sòrò Sókè
            </div>
            <div style={{ fontSize: 9, color: 'rgba(240,247,240,.35)', fontWeight: 600, letterSpacing: '.08em', marginTop: 1 }}>
              SPEAK UP · THE VILLAGE IS LISTENING
            </div>
          </div>
          <button onClick={() => setCreateOpen(true)} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.05)', color: '#f0f5ee', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✏</button>
          <button onClick={() => router.push('/dashboard/notifications')} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.05)', color: '#f0f5ee', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            🔔
            <div style={{
              position: 'absolute', top: 2, right: 2, width: 7, height: 7,
              borderRadius: '50%', background: '#ef4444',
            }} />
          </button>
        </div>

        {/* Skin switcher row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px 6px',
          borderBottom: '1px solid rgba(255,255,255,.04)',
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Skin:
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            {(Object.entries(SKIN_CONFIG) as [Skin, typeof skinCfg][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSkin(key)}
                style={{
                  padding: '3px 10px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 700,
                  background: skin === key ? `${cfg.color}25` : 'rgba(255,255,255,.04)',
                  color: skin === key ? cfg.color : 'rgba(255,255,255,.35)',
                  outline: skin === key ? `1.5px solid ${cfg.color}50` : 'none',
                  transition: 'all .2s',
                }}
              >
                {cfg.emoji} {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Layer tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          {(['drum', 'nation', 'motion'] as Layer[]).map(l => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                background: 'transparent', fontSize: 11, fontWeight: 700,
                color: layer === l ? '#4ade80' : 'rgba(255,255,255,.3)',
                borderBottom: layer === l ? '2px solid #1a7c3e' : '2px solid transparent',
                transition: 'all .2s',
              }}
            >
              {l === 'drum' ? VOCAB.drumTab : l === 'nation' ? VOCAB.nationTab : VOCAB.motionTab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed Content ──────────────────────────────────── */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Night Market Banner */}
        {isNight && !nightDismissed && (
          <NightMarketBanner onDismiss={() => setNightDismissed(true)} />
        )}

        {/* Village Square — only on Drum tab */}
        {layer === 'drum' && <VillageSquare />}

        {/* Sort row */}
        {layer !== 'motion' && (
          <div style={{ display: 'flex', gap: 6, padding: '2px 2px' }}>
            {([
              { key: 'hot' as SortMode, label: VOCAB.sortHot },
              { key: 'fresh' as SortMode, label: VOCAB.sortFresh },
              { key: 'ready' as SortMode, label: VOCAB.sortReady },
            ]).map(s => (
              <button
                key={s.key}
                onClick={() => setSortMode(s.key)}
                style={{
                  padding: '4px 10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 700,
                  background: sortMode === s.key ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.04)',
                  color: sortMode === s.key ? '#4ade80' : 'rgba(255,255,255,.35)',
                  transition: 'all .2s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Motion layer — live stream cards */}
        {layer === 'motion' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'v1', title: 'Ankara Live Sale', author: 'Chioma Obi', viewers: 247, type: 'market', color: '#e07b00', emoji: '🛒' },
              { id: 'v2', title: 'Kente Weaving — Live Commission', author: 'Kofi Mensah', viewers: 1400, type: 'craft', color: '#7c3aed', emoji: '🎨' },
              { id: 'v3', title: 'Malaria Prevention Talk', author: 'Dr. Ngozi', viewers: 892, type: 'healing', color: '#0369a1', emoji: '⚕️' },
              { id: 'v4', title: 'Maize Harvest Auction', author: 'Mugo Kamau', viewers: 334, type: 'farm', color: '#1a7c3e', emoji: '🌾' },
            ].map(stream => (
              <button
                key={stream.id}
                onClick={() => router.push(`/dashboard/jollof/${stream.id}`)}
                style={{
                  background: `linear-gradient(135deg, ${stream.color}15, ${stream.color}08)`,
                  border: `1px solid ${stream.color}30`,
                  borderRadius: 16, padding: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  color: '#f0f5ee', textAlign: 'left', width: '100%',
                }}
              >
                <span style={{
                  fontSize: 28, width: 48, height: 48, borderRadius: 12,
                  background: `${stream.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{stream.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{stream.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{stream.author}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 8,
                    background: 'rgba(239,68,68,.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)',
                  }}>
                    {VOCAB.live}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
                    {stream.viewers.toLocaleString()} watching
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Drum / Nation — post cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {posts.map(post => (
              <PostCard key={post.id} post={post} onInteract={handleInteract} />
            ))}
          </div>
        )}
      </div>

      {/* ── FAB: Drum to Village ──────────────────────────── */}
      <button
        onClick={() => setCreateOpen(true)}
        style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 45,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #1a7c3e, #0d5a2a)',
          color: '#fff', fontSize: 22, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(26,124,62,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        🥁
      </button>

      {/* ── Create Post Sheet ──────────────────────────────── */}
      {createOpen && <CreatePostSheet onClose={() => setCreateOpen(false)} />}

      {/* ── Voice Story Player Overlay ──────────────────────── */}
      {voicePost && (
        <VoiceStoryPlayer
          post={{
            id: voicePost.id,
            author: voicePost.author,
            village: voicePost.village,
            villageEmoji: voicePost.villageEmoji,
            audioDurationSec: voicePost.audioDurationSec ?? 120,
            waveformBars: voicePost.waveformBars ?? Array.from({ length: 40 }, () => Math.random() * 80 + 20),
            content: voicePost.content,
          }}
          onClose={() => setVoicePost(null)}
        />
      )}
    </div>
  )
}
