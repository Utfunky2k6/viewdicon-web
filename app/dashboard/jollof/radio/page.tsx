'use client'
// ═══════════════════════════════════════════════════════════════════
// ORITA RADIO — Live Radio Station Browser & Player
// Live from the Crossroads · Jollof TV Platform
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/* ── inject-once CSS ── */
const CSS_ID = 'orita-radio-css'
const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes skelPulse{0%,100%{opacity:.18}50%{opacity:.38}}
@keyframes livePulse{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
@keyframes bar1{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes bar2{0%,100%{transform:scaleY(.7)}50%{transform:scaleY(.2)}}
@keyframes bar3{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(.9)}}
@keyframes bar4{0%,100%{transform:scaleY(.9)}50%{transform:scaleY(.4)}}
@keyframes bar5{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(.8)}}
.or-fade{animation:fadeUp .3s ease both}
.or-skel{animation:skelPulse 1.6s ease infinite;background:rgba(255,255,255,.08);border-radius:8px}
.live-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;animation:livePulse .7s ease-in-out infinite;display:inline-block}
.eq-bar{display:inline-block;width:3px;margin:0 1px;border-radius:2px;transform-origin:bottom;background:currentColor}
.eq-bar.playing:nth-child(1){animation:bar1 .8s ease infinite}
.eq-bar.playing:nth-child(2){animation:bar2 .6s ease infinite}
.eq-bar.playing:nth-child(3){animation:bar3 .9s ease infinite}
.eq-bar.playing:nth-child(4){animation:bar4 .7s ease infinite}
.eq-bar.playing:nth-child(5){animation:bar5 .5s ease infinite}
`

/* ── Mock data ── */
const MOCK_RADIO = [
  { id: 'r1', title: 'Culture FM', hostId: 'host1', description: 'The heartbeat of African culture', genre: 'AFROBEAT', villageId: 'arts', isLive: true, listenerCount: 2847, currentShow: 'Morning Highlife Hour' },
  { id: 'r2', title: 'Harvest Radio', hostId: 'host2', description: 'Farming, nature, and community', genre: 'TRADITIONAL', villageId: 'agriculture', isLive: true, listenerCount: 1203, currentShow: 'Field Songs & Wisdom' },
  { id: 'r3', title: 'Cowrie Tech FM', hostId: 'host3', description: 'Tech news and startup stories', genre: 'TALK', villageId: 'technology', isLive: false, listenerCount: 892, currentShow: 'AfriTech Weekly' },
  { id: 'r4', title: 'Healer Grove Radio', hostId: 'host4', description: 'Health, wellness, traditional medicine', genre: 'CULTURAL', villageId: 'health', isLive: true, listenerCount: 654, currentShow: 'Herb & Heal' },
  { id: 'r5', title: 'Justice Waves', hostId: 'host5', description: 'Legal rights and civic education', genre: 'NEWS', villageId: 'justice', isLive: false, listenerCount: 1456, currentShow: 'Rights & Remedies' },
  { id: 'r6', title: 'Youth Gospel FM', hostId: 'host6', description: 'Uplifting gospel and praise', genre: 'GOSPEL', villageId: 'spirituality', isLive: true, listenerCount: 3201, currentShow: 'Sunday Praise Live' },
]

const MOCK_SCHEDULE = [
  { time: '10:00', title: 'The Griot Hour', genre: 'CULTURAL', station: 'Culture FM' },
  { time: '11:30', title: 'Market News', genre: 'NEWS', station: 'Justice Waves' },
  { time: '12:00', title: 'Midday Beats', genre: 'AFROBEAT', station: 'Culture FM' },
  { time: '14:00', title: 'Farm Talk Live', genre: 'TALK', station: 'Harvest Radio' },
  { time: '16:00', title: 'Evening Praise', genre: 'GOSPEL', station: 'Youth Gospel FM' },
  { time: '18:00', title: 'Tech Roundtable', genre: 'TALK', station: 'Cowrie Tech FM' },
]

const GENRES = ['ALL', 'AFROBEAT', 'HIGHLIFE', 'GOSPEL', 'JAZZ', 'HIP-HOP', 'TRADITIONAL', 'TALK', 'NEWS', 'CULTURAL']

const GENRE_COLOR: Record<string, string> = {
  AFROBEAT:    '#d4a017',
  HIGHLIFE:    '#e67e22',
  GOSPEL:      '#7c3aed',
  JAZZ:        '#0891b2',
  'HIP-HOP':   '#dc2626',
  TRADITIONAL: '#1a7c3e',
  TALK:        '#374151',
  NEWS:        '#60a5fa',
  CULTURAL:    '#c084fc',
  default:     '#4ade80',
}

const GENRE_EMOJI: Record<string, string> = {
  AFROBEAT: '🥁', HIGHLIFE: '🎷', GOSPEL: '🙏', JAZZ: '🎺',
  'HIP-HOP': '🎤', TRADITIONAL: '🪘', TALK: '💬', NEWS: '📰',
  CULTURAL: '🌍', ALL: '📻',
}

function getGenreColor(genre: string): string {
  return GENRE_COLOR[genre] ?? GENRE_COLOR.default
}

function fmtListeners(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/* ── EQ Bars component ── */
function EQBars({ playing, color, count = 5 }: { playing: boolean; color: string; count?: number }) {
  const heights = [14, 10, 16, 12, 8]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', height: 16, color, gap: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`eq-bar${playing ? ' playing' : ''}`}
          style={{ height: playing ? 16 : heights[i % heights.length], opacity: playing ? 1 : 0.45 }}
        />
      ))}
    </div>
  )
}

/* ── Village Radio Grid ── */
const VILLAGE_RADIO = [
  { id: 'vr1', title: 'Health Radio', village: 'Health', genre: 'CULTURAL', icon: '🌿' },
  { id: 'vr2', title: 'Farmers FM', village: 'Agriculture', genre: 'TRADITIONAL', icon: '🌾' },
  { id: 'vr3', title: 'Tech Talk Radio', village: 'Technology', genre: 'TALK', icon: '💻' },
  { id: 'vr4', title: 'Medicine Grove FM', village: 'Health', genre: 'CULTURAL', icon: '🍃' },
  { id: 'vr5', title: 'Justice Waves', village: 'Justice', genre: 'NEWS', icon: '⚖️' },
  { id: 'vr6', title: 'Education FM', village: 'Education', genre: 'TALK', icon: '📚' },
]

/* ── Create Radio Sheet ── */
function CreateRadioSheet({ onClose, onCreated }: { onClose: () => void; onCreated: (r: any) => void }) {
  const [title, setTitle] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [genre, setGenre] = React.useState('AFROBEAT')
  const [villageId, setVillageId] = React.useState('arts')
  const [streamUrl, setStreamUrl] = React.useState('')
  const [goLive, setGoLive] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await jollofTvApi.createRadio({ title, description: desc, genre, villageId, streamUrl, isLive: goLive })
      onCreated(res)
    } catch {
      onCreated({ id: `r${Date.now()}`, title, genre, villageId, description: desc, isLive: goLive, listenerCount: 0, currentShow: 'New Show' })
    } finally {
      setSaving(false)
      onClose()
    }
  }

  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }
  const sheet: React.CSSProperties = { width: '100%', maxWidth: 480, margin: '0 auto', background: '#0d1008', borderRadius: '20px 20px 0 0', padding: '24px 20px 48px', border: '1px solid rgba(255,255,255,.1)' }
  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 14px', color: 'rgba(255,255,255,.9)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: 11, color: 'rgba(255,255,255,.45)', marginBottom: 6, display: 'block', fontFamily: 'DM Sans, sans-serif' }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={sheet}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,.9)', fontFamily: 'Sora, sans-serif' }}>📻 Create Radio Stream</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <label style={lbl}>Station Name</label>
        <input style={{ ...inp, marginBottom: 14 }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Your station name…" />

        <label style={lbl}>Description</label>
        <textarea style={{ ...inp, height: 60, resize: 'none', marginBottom: 14 }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does your station broadcast?" />

        <label style={lbl}>Genre</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {GENRES.filter(g => g !== 'ALL').map(g => (
            <button key={g} onClick={() => setGenre(g)} style={{ padding: '5px 11px', borderRadius: 20, fontSize: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: genre === g ? `1px solid ${getGenreColor(g)}` : '1px solid rgba(255,255,255,.1)', background: genre === g ? `${getGenreColor(g)}22` : 'rgba(255,255,255,.04)', color: genre === g ? getGenreColor(g) : 'rgba(255,255,255,.55)' }}>
              {GENRE_EMOJI[g] ?? '🎵'} {g}
            </button>
          ))}
        </div>

        <label style={lbl}>Stream URL (optional)</label>
        <input style={{ ...inp, marginBottom: 14 }} value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://stream.example.com/live" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontFamily: 'DM Sans, sans-serif' }}>Go Live immediately</span>
          <div onClick={() => setGoLive(l => !l)} style={{ width: 44, height: 24, borderRadius: 12, background: goLive ? '#4ade80' : 'rgba(255,255,255,.15)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
            <div style={{ position: 'absolute', top: 3, left: goLive ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
          </div>
        </div>

        <button onClick={submit} disabled={saving || !title.trim()} style={{ width: '100%', padding: '13px 0', borderRadius: 12, background: saving ? 'rgba(74,222,128,.3)' : 'rgba(74,222,128,.15)', border: '1px solid #4ade80', color: '#4ade80', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif' }}>
          {saving ? 'Starting…' : goLive ? '🔴 Go Live Now' : '📻 Create Station'}
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function OritaRadioPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const _userId = (user as any)?.id ?? 'guest'

  const [stations, setStations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [genre, setGenre] = React.useState('ALL')
  const [activeStation, setActiveStation] = React.useState<any>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (genre !== 'ALL') params.genre = genre
    jollofTvApi.radioStreams(params as any)
      .then(res => {
        const data = (res as any)?.streams ?? []
        setStations(data.length ? data : MOCK_RADIO)
        setLoading(false)
      })
      .catch(() => {
        setStations(MOCK_RADIO)
        setLoading(false)
      })
  }, [genre])

  function tuneIn(station: any) {
    if (activeStation?.id === station.id) {
      setIsPlaying(p => !p)
    } else {
      setActiveStation(station)
      setIsPlaying(true)
    }
  }

  const liveStations = stations.filter(s => s.isLive)
  const filteredStations = genre === 'ALL' ? stations : stations.filter(s => s.genre === genre)

  const page: React.CSSProperties = {
    minHeight: '100vh',
    background: '#07090a',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.022) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    paddingBottom: activeStation ? 144 : 100,
    fontFamily: 'DM Sans, sans-serif',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 12px',
    borderBottom: '1px solid rgba(255,255,255,.07)',
  }

  return (
    <div style={page}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'rgba(255,255,255,.7)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>‹</button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,.9)', fontFamily: 'Sora, sans-serif' }}>📻 Continental Radio</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Live Stations Across Africa</div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="or-skel" style={{ flexShrink: 0, width: 160, height: 100, borderRadius: 14 }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* LIVE NOW section */}
          {liveStations.length > 0 && (
            <div style={{ padding: '16px 0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px 10px' }}>
                <span className="live-dot" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', fontFamily: 'Sora, sans-serif' }}>LIVE NOW</span>
              </div>
              <div style={{ overflowX: 'auto', display: 'flex', gap: 12, padding: '0 20px 8px', scrollbarWidth: 'none' }}>
                {liveStations.map((station, i) => {
                  const gc = getGenreColor(station.genre)
                  const isActive = activeStation?.id === station.id
                  const playing = isActive && isPlaying
                  return (
                    <div key={station.id} className="or-fade" style={{ animationDelay: `${i * 0.07}s`, flexShrink: 0, width: 160, height: 100, borderRadius: 14, background: `linear-gradient(135deg, ${gc}33, ${gc}11)`, border: isActive ? `2px solid ${gc}` : `1px solid ${gc}44`, padding: '12px 14px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => tuneIn(station)}>
                      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% 20%, ${gc}18, transparent 60%)` }} />
                      <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span className="live-dot" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700 }}>LIVE</span>
                          <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,.5)' }}>👂 {fmtListeners(station.listenerCount)}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Sora, sans-serif', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{station.title}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{station.currentShow ?? station.description}</div>
                        <EQBars playing={playing} color={gc} count={5} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Genre filter */}
          <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '10px 20px', scrollbarWidth: 'none' }}>
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: genre === g ? `1px solid ${getGenreColor(g)}` : '1px solid rgba(255,255,255,.1)', background: genre === g ? `${getGenreColor(g)}22` : 'rgba(255,255,255,.04)', color: genre === g ? getGenreColor(g) : 'rgba(255,255,255,.6)', transition: 'all .2s' }}>
                {GENRE_EMOJI[g] ?? '🎵'} {g}
              </button>
            ))}
          </div>

          {/* Village Radio grid */}
          <div style={{ padding: '16px 20px 8px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12, fontFamily: 'Sora, sans-serif' }}>Village Stations</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {VILLAGE_RADIO.map((vr, i) => {
                const gc = getGenreColor(vr.genre)
                return (
                  <div key={vr.id} className="or-fade" style={{ animationDelay: `${i * 0.05}s`, background: 'rgba(255,255,255,.03)', border: `1px solid rgba(255,255,255,.07)`, borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 22 }}>{vr.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: 'Sora, sans-serif' }}>{vr.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{vr.village} Village</div>
                    <button onClick={() => tuneIn({ id: vr.id, title: vr.title, genre: vr.genre, isLive: false, listenerCount: 0, currentShow: vr.title, description: '' })} style={{ marginTop: 4, padding: '5px 0', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif', border: `1px solid ${gc}66`, background: `${gc}11`, color: gc }}>
                      📻 Listen
                    </button>
                  </div>
                )
              })}
            </div>

            {/* All Stations list */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12, fontFamily: 'Sora, sans-serif' }}>All Stations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {filteredStations.map((station, i) => {
                const gc = getGenreColor(station.genre)
                const isActive = activeStation?.id === station.id
                const playing = isActive && isPlaying
                return (
                  <div key={station.id} className="or-fade" style={{ animationDelay: `${i * 0.05}s`, background: isActive ? `${gc}0d` : 'rgba(255,255,255,.03)', border: isActive ? `1px solid ${gc}55` : '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => tuneIn(station)}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${gc}44, ${gc}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {GENRE_EMOJI[station.genre] ?? '📻'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: 'Sora, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{station.title}</span>
                        {station.isLive && <span className="live-dot" style={{ flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{station.currentShow ?? station.description}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, background: `${gc}22`, color: gc, fontWeight: 600 }}>{station.genre}</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>👂 {fmtListeners(station.listenerCount)}</span>
                        {playing && <EQBars playing={true} color={gc} count={4} />}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); tuneIn(station) }} style={{ width: 36, height: 36, borderRadius: '50%', border: isActive ? `2px solid ${gc}` : '1px solid rgba(255,255,255,.15)', background: isActive ? `${gc}22` : 'rgba(255,255,255,.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: isActive ? gc : 'rgba(255,255,255,.7)', flexShrink: 0 }}>
                      {playing ? '⏸' : '▶'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Schedule Coming Up */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12, fontFamily: 'Sora, sans-serif' }}>Coming Up</div>
            <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
              {MOCK_SCHEDULE.map((show, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < MOCK_SCHEDULE.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.35)', fontFamily: 'Sora, sans-serif', width: 38, flexShrink: 0 }}>{show.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>{show.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{show.station}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, background: `${getGenreColor(show.genre)}22`, color: getGenreColor(show.genre), fontWeight: 600, flexShrink: 0 }}>{show.genre}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* FAB — only shown when no player */}
      {!activeStation && (
        <button onClick={() => setShowCreate(true)} style={{ position: 'fixed', bottom: 80, right: 20, width: 52, height: 52, borderRadius: '50%', background: 'rgba(74,222,128,.15)', border: '2px solid #4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, zIndex: 40, backdropFilter: 'blur(8px)' }}>📻</button>
      )}

      {/* Player Bar */}
      {activeStation && (
        <div style={{ position: 'fixed', bottom: 64, left: 0, right: 0, background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,.08)', padding: '10px 16px 12px', zIndex: 50, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 44, borderRadius: 2, background: `linear-gradient(180deg, ${getGenreColor(activeStation.genre)}, ${getGenreColor(activeStation.genre)}55)`, flexShrink: 0 }} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Sora, sans-serif' }}>{activeStation.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeStation.currentShow ?? activeStation.description}</span>
              {isPlaying && <EQBars playing={true} color={getGenreColor(activeStation.genre)} count={4} />}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button onClick={() => {
              const idx = stations.findIndex(s => s.id === activeStation.id)
              const prev = stations[(idx - 1 + stations.length) % stations.length]
              setActiveStation(prev); setIsPlaying(true)
            }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏮</button>
            <button onClick={() => setIsPlaying(p => !p)} style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${getGenreColor(activeStation.genre)}`, background: `${getGenreColor(activeStation.genre)}22`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: getGenreColor(activeStation.genre) }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={() => {
              const idx = stations.findIndex(s => s.id === activeStation.id)
              const next = stations[(idx + 1) % stations.length]
              setActiveStation(next); setIsPlaying(true)
            }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏭</button>
            <button onClick={() => setIsMuted(m => !m)} style={{ background: 'none', border: 'none', color: isMuted ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.4)', fontSize: 18, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isMuted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}</button>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateRadioSheet
          onClose={() => setShowCreate(false)}
          onCreated={r => setStations(prev => [r, ...prev])}
        />
      )}
    </div>
  )
}
