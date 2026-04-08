'use client'
// ═══════════════════════════════════════════════════════════════════
// ÌTÀN CAST — Audio + Video Podcast Hub
// Ìtàn = Story/History — Pan-African podcasting platform
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const CSS_ID = 'itan-cast-css'
const CSS = `
@keyframes icFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes icPulse{0%,100%{opacity:.4}50%{opacity:.7}}
@keyframes icLive{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 12px 4px rgba(239,68,68,.7)}}
@keyframes icWave{0%{height:6px}25%{height:18px}50%{height:10px}75%{height:22px}100%{height:6px}}
.ic-fade{animation:icFade .35s ease both}
.ic-skel{animation:icPulse 1.5s ease infinite;background:rgba(255,255,255,.06);border-radius:8px}
.ic-live{animation:icLive 1.5s ease-in-out infinite}
`

type Format = 'all' | 'audio' | 'video' | 'live'

const FORMATS: { key: Format; emoji: string; label: string; color: string }[] = [
  { key: 'all',   emoji: '🎙', label: 'All',   color: '#fff' },
  { key: 'audio', emoji: '🎧', label: 'Audio',  color: '#60a5fa' },
  { key: 'video', emoji: '📹', label: 'Video',  color: '#c084fc' },
  { key: 'live',  emoji: '🔴', label: 'Live',   color: '#ef4444' },
]

const CATEGORIES = ['ALL', 'CULTURE', 'POLITICS', 'BUSINESS', 'HEALTH', 'EDUCATION', 'SPIRITUALITY', 'MUSIC', 'COMEDY', 'SPORTS']
const CAT_EMOJI: Record<string, string> = { CULTURE: '🥁', EDUCATION: '📚', BUSINESS: '💼', HEALTH: '🌿', POLITICS: '⚖️', MUSIC: '🎵', SPIRITUALITY: '🕯', COMEDY: '😂', SPORTS: '🏆', ALL: '🎙' }
const CAT_GRADIENT: Record<string, [string, string]> = {
  CULTURE: ['#7c3aed', '#a855f7'], EDUCATION: ['#1a7c3e', '#4ade80'], BUSINESS: ['#d4a017', '#fbbf24'],
  HEALTH: ['#0891b2', '#22d3ee'], POLITICS: ['#dc2626', '#ef4444'], MUSIC: ['#db2777', '#f472b6'],
  SPIRITUALITY: ['#7c3aed', '#c084fc'], COMEDY: ['#d97706', '#fbbf24'], SPORTS: ['#059669', '#34d399'],
  default: ['#374151', '#6b7280'],
}

// African podcast type names
const PODCAST_TYPES = [
  { key: 'griot_cast',    emoji: '🗣', label: 'Griot Cast',     desc: 'Storytelling — one voice, ancestral wisdom' },
  { key: 'ọrọ_session',  emoji: '🎙', label: 'Ọrọ Session',   desc: 'Talk show — deep conversation on African life' },
  { key: 'fire_circle',   emoji: '🔥', label: 'Fire Circle',    desc: 'Multi-host debate — up to 5 voices around the fire' },
  { key: 'ìmọ̀_pod',      emoji: '📚', label: 'Ìmọ̀ Pod',       desc: 'Knowledge — education with chapters' },
  { key: 'ìtàn_vision',  emoji: '📹', label: 'Ìtàn Vision',    desc: 'Video documentary — visual storytelling' },
  { key: 'àṣà_live',     emoji: '🔴', label: 'Àṣà Live',      desc: 'Live broadcast — real-time audio or video' },
]

const COUNTRY_FLAGS: Record<string, string> = { NG: '🇳🇬', GH: '🇬🇭', KE: '🇰🇪', ZA: '🇿🇦', SN: '🇸🇳', ET: '🇪🇹', CM: '🇨🇲', CI: '🇨🇮', TZ: '🇹🇿', EG: '🇪🇬', RW: '🇷🇼', MA: '🇲🇦' }

const MOCK_PODCASTS = [
  { id: 'p1', title: 'Culture Weekly', creatorId: 'griot1', creatorName: 'Mama Ngozi', category: 'CULTURE', format: 'audio' as const, podType: 'griot_cast', villageId: 'arts', country: 'NG', coverUrl: null, description: 'Pan-African cultural conversations — a Griot Cast telling the week\'s stories through ancestral wisdom.', _count: { episodes: 24 }, listeners: 12400, duration: '45 min avg' },
  { id: 'p2', title: 'Harvest Wisdom', creatorId: 'farmer1', creatorName: 'Elder Kofi', category: 'EDUCATION', format: 'video' as const, podType: 'ìtàn_vision', villageId: 'agriculture', country: 'GH', coverUrl: null, description: 'Video documentary series on modern African permaculture, food forests, and regenerative farming across the continent.', _count: { episodes: 18 }, listeners: 8200, duration: '28 min avg' },
  { id: 'p3', title: 'Cowrie Code', creatorId: 'dev1', creatorName: 'Chidi Tech', category: 'BUSINESS', format: 'video' as const, podType: 'fire_circle', villageId: 'technology', country: 'NG', coverUrl: null, description: 'Fire Circle with 4 African tech founders — building the future of Pan-African software, one sprint at a time.', _count: { episodes: 31 }, listeners: 34500, duration: '62 min avg' },
  { id: 'p4', title: 'Healing Roots', creatorId: 'healer1', creatorName: 'Dr. Amara', category: 'HEALTH', format: 'audio' as const, podType: 'ọrọ_session', villageId: 'health', country: 'KE', coverUrl: null, description: 'Ọrọ Session on traditional medicine meets modern science — a deep conversation on African healing.', _count: { episodes: 15 }, listeners: 6800, duration: '35 min avg' },
  { id: 'p5', title: 'Youth Palaver', creatorId: 'youth1', creatorName: 'Tunde Voice', category: 'POLITICS', format: 'live' as const, podType: 'àṣà_live', villageId: 'government', country: 'NG', coverUrl: null, description: 'Live Àṣà broadcast every Tuesday — young Africans debate governance, justice, and continental unity.', _count: { episodes: 42 }, listeners: 28900, isLive: true, duration: 'LIVE NOW' },
  { id: 'p6', title: 'Kora Sessions', creatorId: 'music1', creatorName: 'Baba Strings', category: 'MUSIC', format: 'audio' as const, podType: 'griot_cast', villageId: 'arts', country: 'SN', coverUrl: null, description: 'Live Kora performances and artist conversations from Dakar to Lagos — the soundtrack of Africa.', _count: { episodes: 8 }, listeners: 5400, duration: '52 min avg' },
  { id: 'p7', title: 'Adinkra Code', creatorId: 'art1', creatorName: 'Nana Kunst', category: 'CULTURE', format: 'video' as const, podType: 'ìmọ̀_pod', villageId: 'arts', country: 'GH', coverUrl: null, description: 'Ìmọ̀ Pod — 12-chapter video series decoding Adinkra symbols and their meaning for modern African identity.', _count: { episodes: 12 }, listeners: 9100, duration: '20 min avg' },
  { id: 'p8', title: 'Lagos Laughs', creatorId: 'comic1', creatorName: 'MC Àgbà', category: 'COMEDY', format: 'audio' as const, podType: 'fire_circle', villageId: 'media', country: 'NG', coverUrl: null, description: 'Fire Circle of 3 comedians roasting daily African life — no topic is sacred around this Fire.', _count: { episodes: 56 }, listeners: 41200, duration: '40 min avg' },
]

function formatNum(n: number) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toLocaleString() }
function getCatGrad(cat: string) { const [a, b] = CAT_GRADIENT[cat] ?? CAT_GRADIENT.default; return `linear-gradient(135deg,${a},${b})` }

function FormatBadge({ format, isLive }: { format: string; isLive?: boolean }) {
  const cfg = format === 'video' ? { emoji: '📹', label: 'VIDEO', color: '#c084fc', bg: 'rgba(192,132,252,.12)' }
    : format === 'live' || isLive ? { emoji: '🔴', label: 'LIVE', color: '#ef4444', bg: 'rgba(239,68,68,.12)' }
    : { emoji: '🎧', label: 'AUDIO', color: '#60a5fa', bg: 'rgba(96,165,250,.12)' }
  return (
    <span className={isLive ? 'ic-live' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.color}40`, fontSize: 8, fontWeight: 800, color: cfg.color }}>
      {cfg.emoji} {cfg.label}
    </span>
  )
}

function AudioWaveform() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
      {[0, .15, .3, .1, .25, .05, .2, .35, .12, .28, .08, .22].map((d, i) => (
        <div key={i} style={{ width: 3, borderRadius: 99, background: 'rgba(96,165,250,.6)', animation: `icWave .8s ease-in-out ${d}s infinite alternate`, minHeight: 4 }} />
      ))}
    </div>
  )
}

// Create sheet
function CreateSheet({ onClose, onCreated }: { onClose: () => void; onCreated: (p: any) => void }) {
  const [title, setTitle] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [category, setCategory] = React.useState('CULTURE')
  const [format, setFormat] = React.useState<'audio' | 'video' | 'live'>('audio')
  const [podType, setPodType] = React.useState('griot_cast')
  const [saving, setSaving] = React.useState(false)
  const input: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await jollofTvApi.createPodcast({ title, description: desc, category, villageId: 'arts', coverUrl: null })
      onCreated(res)
    } catch (e) {
      logApiFailure('jollof/podcasts/create', e)
      onCreated({ id: `p${Date.now()}`, title, category, format, podType, villageId: 'arts', coverUrl: null, description: desc, _count: { episodes: 0 }, listeners: 0 })
    } finally { setSaving(false); onClose() }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#0d1008', borderRadius: '20px 20px 0 0', padding: '24px 20px 48px', border: '1px solid rgba(255,255,255,.1)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, margin: '0 auto 18px' }} />
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif', marginBottom: 18 }}>🎙 Create Your Ìtàn Cast</div>

        <label style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name your podcast…" style={{ ...input, marginBottom: 14 }} />

        <label style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Description (tell Africa your story)</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="What is your podcast about? Tell it like a griot…" style={{ ...input, resize: 'vertical', marginBottom: 14, lineHeight: 1.5 }} />

        <label style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Format</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['audio', 'video', 'live'] as const).map(f => {
            const cfg = f === 'audio' ? { emoji: '🎧', color: '#60a5fa' } : f === 'video' ? { emoji: '📹', color: '#c084fc' } : { emoji: '🔴', color: '#ef4444' }
            return (
              <button key={f} onClick={() => setFormat(f)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: format === f ? `${cfg.color}15` : 'rgba(255,255,255,.03)', border: `1.5px solid ${format === f ? cfg.color : 'rgba(255,255,255,.06)'}` }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{cfg.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: format === f ? cfg.color : 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>{f}</div>
              </button>
            )
          })}
        </div>

        <label style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Podcast Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
          {PODCAST_TYPES.map(pt => (
            <button key={pt.key} onClick={() => setPodType(pt.key)} style={{ padding: '10px 8px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', background: podType === pt.key ? 'rgba(74,222,128,.08)' : 'rgba(255,255,255,.02)', border: `1px solid ${podType === pt.key ? '#4ade80' : 'rgba(255,255,255,.06)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 12 }}>{pt.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: podType === pt.key ? '#4ade80' : 'rgba(255,255,255,.6)' }}>{pt.label}</span>
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>{pt.desc}</div>
            </button>
          ))}
        </div>

        <label style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {CATEGORIES.filter(c => c !== 'ALL').map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 10, cursor: 'pointer', border: category === c ? '1px solid #4ade80' : '1px solid rgba(255,255,255,.1)', background: category === c ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.03)', color: category === c ? '#4ade80' : 'rgba(255,255,255,.5)' }}>
              {CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>

        <button onClick={submit} disabled={saving || !title.trim()} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: title.trim() ? 'linear-gradient(90deg,#1a7c3e,#4ade80)' : 'rgba(255,255,255,.05)', border: 'none', color: title.trim() ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 14, fontWeight: 800, cursor: title.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Sora, sans-serif' }}>
          {saving ? 'Launching…' : '🎙 Launch Your Ìtàn Cast'}
        </button>
      </div>
    </div>
  )
}

export default function ItanCastPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const userId = (user as any)?.id ?? 'guest'

  const [podcasts, setPodcasts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [category, setCategory] = React.useState('ALL')
  const [format, setFormat] = React.useState<Format>('all')
  const [subscribed, setSubscribed] = React.useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = React.useState(false)
  const [nowPlaying, setNowPlaying] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (category !== 'ALL') params.category = category
    jollofTvApi.podcasts(params)
      .then(res => { const d = (res as any)?.podcasts ?? []; setPodcasts(d.length ? d : (USE_MOCKS ? MOCK_PODCASTS : [])) })
      .catch((e) => { logApiFailure('podcasts/list', e); if (USE_MOCKS) setPodcasts(MOCK_PODCASTS) })
      .finally(() => setLoading(false))
  }, [category])

  const filtered = React.useMemo(() => {
    let list = podcasts
    if (format !== 'all') list = list.filter((p: any) => p.format === format || (format === 'live' && p.isLive))
    return list
  }, [podcasts, format])

  const featured = filtered.find((p: any) => p.isLive) ?? filtered[0] ?? null
  const totalListeners = podcasts.reduce((s: number, p: any) => s + (p.listeners ?? 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#07090a', backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize: '24px 24px', fontFamily: 'DM Sans,sans-serif', paddingBottom: 110 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0d2818,#07090a)', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#fff' }}>🎙 Ìtàn Cast</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Audio · Video · Live — Stories of Africa</div>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ background: 'rgba(74,222,128,.12)', border: '1px solid #4ade80', borderRadius: 10, padding: '7px 14px', color: '#4ade80', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>+ Create</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
        {[
          { label: 'PODCASTS', value: podcasts.length, color: '#4ade80' },
          { label: 'LISTENERS', value: formatNum(totalListeners), color: '#60a5fa' },
          { label: 'LIVE NOW', value: podcasts.filter((p: any) => p.isLive).length, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,.3)', letterSpacing: '.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Format tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 16px', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
        {FORMATS.map(f => (
          <button key={f.key} onClick={() => setFormat(f.key)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', background: format === f.key ? `${f.color}18` : 'rgba(255,255,255,.03)', border: `1px solid ${format === f.key ? f.color + '60' : 'rgba(255,255,255,.06)'}`, color: format === f.key ? f.color : 'rgba(255,255,255,.4)', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            <span style={{ fontSize: 11 }}>{f.emoji}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 16px 14px', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 9, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, border: category === c ? '1px solid #4ade80' : '1px solid rgba(255,255,255,.06)', background: category === c ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.02)', color: category === c ? '#4ade80' : 'rgba(255,255,255,.4)', fontWeight: 700 }}>
            {CAT_EMOJI[c] ?? '🎙'} {c}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,.02)' }}>
                <div className="ic-skel" style={{ width: 80, height: 80, flexShrink: 0 }} />
                <div style={{ flex: 1 }}><div className="ic-skel" style={{ height: 13, width: '70%', marginBottom: 8 }} /><div className="ic-skel" style={{ height: 10, width: '50%', marginBottom: 8 }} /><div className="ic-skel" style={{ height: 10, width: '40%' }} /></div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Featured */}
            {featured && (
              <div className="ic-fade" onClick={() => router.push('/dashboard/jollof/podcasts/' + featured.id)} style={{ borderRadius: 18, overflow: 'hidden', cursor: 'pointer', marginBottom: 20, background: getCatGrad(featured.category), position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.7))' }} />
                <div style={{ position: 'relative', padding: '20px 16px 18px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <FormatBadge format={featured.format} isLive={featured.isLive} />
                    {featured.podType && (() => { const pt = PODCAST_TYPES.find(t => t.key === featured.podType); return pt ? <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.1)', borderRadius: 99, padding: '2px 7px' }}>{pt.emoji} {pt.label}</span> : null })()}
                    <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.4)', background: 'rgba(0,0,0,.3)', borderRadius: 99, padding: '2px 7px' }}>FEATURED</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: '#fff', marginBottom: 4 }}>{featured.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>by {featured.creatorName ?? featured.creatorId} {featured.country ? COUNTRY_FLAGS[featured.country] ?? '' : ''}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.5, marginBottom: 14, maxHeight: 44, overflow: 'hidden' }}>{featured.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{featured._count?.episodes ?? 0} episodes · {formatNum(featured.listeners ?? 0)} listeners</span>
                    <button onClick={e => { e.stopPropagation(); setNowPlaying(featured.id) }} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 10, background: featured.format === 'video' ? 'linear-gradient(90deg,#7c3aed,#c084fc)' : 'linear-gradient(90deg,#1a7c3e,#4ade80)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                      {featured.format === 'video' ? '📹 Watch' : featured.isLive ? '🔴 Join Live' : '🎧 Listen'} →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Podcast Types banner */}
            <div style={{ borderRadius: 14, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', padding: '12px', marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', marginBottom: 8 }}>AFRICAN PODCAST FORMATS</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
                {PODCAST_TYPES.map(pt => (
                  <div key={pt.key} style={{ minWidth: 80, padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{pt.emoji}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{pt.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Podcast grid */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', marginBottom: 12, textTransform: 'uppercase' }}>
              {format === 'all' ? 'All Casts' : format === 'audio' ? '🎧 Audio Casts' : format === 'video' ? '📹 Video Casts' : '🔴 Live Casts'} ({filtered.length})
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎙</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>No casts found</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 4 }}>Be the first to start an Ìtàn Cast</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {filtered.filter(p => p.id !== featured?.id).map((p: any, i: number) => {
                  const pt = PODCAST_TYPES.find(t => t.key === p.podType)
                  const isPlaying = nowPlaying === p.id
                  return (
                    <div key={p.id} className="ic-fade" style={{ animationDelay: `${i * .05}s`, borderRadius: 16, background: 'rgba(255,255,255,.03)', border: `1px solid ${isPlaying ? '#4ade8040' : 'rgba(255,255,255,.06)'}`, overflow: 'hidden', cursor: 'pointer' }} onClick={() => router.push('/dashboard/jollof/podcasts/' + p.id)}>
                      <div style={{ display: 'flex', gap: 12, padding: '12px' }}>
                        {/* Cover */}
                        <div style={{ width: 72, height: 72, borderRadius: 12, background: getCatGrad(p.category), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, position: 'relative' }}>
                          {CAT_EMOJI[p.category] ?? '🎙'}
                          {p.format === 'video' && <div style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>▶</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                            <FormatBadge format={p.format} isLive={p.isLive} />
                            {pt && <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,.3)' }}>{pt.emoji} {pt.label}</span>}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>
                            {p.creatorName ?? p.creatorId} {p.country ? COUNTRY_FLAGS[p.country] ?? '' : ''} · {p._count?.episodes ?? 0} eps · {formatNum(p.listeners ?? 0)} listeners
                          </div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                          {isPlaying && <div style={{ marginTop: 6 }}><AudioWaveform /></div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }}>
                          <button onClick={e => { e.stopPropagation(); setNowPlaying(isPlaying ? null : p.id) }} style={{ width: 36, height: 36, borderRadius: '50%', background: isPlaying ? 'rgba(239,68,68,.15)' : p.format === 'video' ? 'rgba(192,132,252,.15)' : 'rgba(96,165,250,.15)', border: `1px solid ${isPlaying ? '#ef4444' : p.format === 'video' ? '#c084fc' : '#60a5fa'}40`, color: isPlaying ? '#ef4444' : p.format === 'video' ? '#c084fc' : '#60a5fa', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isPlaying ? '⏸' : '▶'}
                          </button>
                          <span style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>{p.duration ?? ''}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Create CTA */}
            <div style={{ borderRadius: 16, background: 'linear-gradient(135deg,rgba(26,124,62,.15),rgba(74,222,128,.08))', border: '1px solid rgba(74,222,128,.25)', padding: '20px 18px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎙</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>Start Your Ìtàn Cast</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>Audio or Video — share your story with Africa. Choose your format and podcast type.</div>
              <button onClick={() => setShowCreate(true)} style={{ padding: '11px 24px', borderRadius: 12, background: 'linear-gradient(90deg,#1a7c3e,#4ade80)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                🎙 Create Ìtàn Cast
              </button>
            </div>
          </>
        )}
      </div>

      {showCreate && <CreateSheet onClose={() => setShowCreate(false)} onCreated={p => setPodcasts(prev => [p, ...prev])} />}

      {/* Now Playing Mini Bar */}
      {nowPlaying && (() => {
        const pod = podcasts.find((p: any) => p.id === nowPlaying)
        if (!pod) return null
        return (
          <div style={{ position: 'fixed', bottom: 80, left: 12, right: 12, borderRadius: 16, background: 'rgba(13,16,8,.97)', border: '1px solid rgba(255,255,255,.1)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 50, boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: getCatGrad(pod.category), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{CAT_EMOJI[pod.category] ?? '🎙'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pod.title}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{pod.format === 'video' ? '📹 Video' : '🎧 Audio'} · {pod.creatorName ?? pod.creatorId}</div>
            </div>
            <AudioWaveform />
            <button onClick={() => setNowPlaying(null)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>
        )
      })()}
    </div>
  )
}
