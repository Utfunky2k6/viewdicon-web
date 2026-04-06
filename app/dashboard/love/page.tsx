'use client'
// ═══════════════════════════════════════════════════════════════════
// UFE REALM — Love World Hub
// Profile summary, Match Queue, Active Matches, Bottom Actions
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { loveWorldApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/* ── inject-once CSS ── */
const CSS_ID = 'ufe-realm-css'
const CSS = `
@keyframes ufeFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes ufeGlow{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.15)}50%{box-shadow:0 0 22px 4px rgba(212,175,55,.10)}}
@keyframes ufePulse{0%,100%{opacity:.6;transform:scale(.92)}50%{opacity:1;transform:scale(1.05)}}
@keyframes ufeHeart{0%,100%{transform:scale(1)}14%{transform:scale(1.15)}28%{transform:scale(1)}42%{transform:scale(1.08)}70%{transform:scale(1)}}
.ufe-fade{animation:ufeFade .35s ease both}
.ufe-glow{animation:ufeGlow 3s ease-in-out infinite}
.ufe-pulse{animation:ufePulse 1.4s ease-in-out infinite}
.ufe-heart{animation:ufeHeart 1.6s ease-in-out infinite}
.ufe-card{transition:transform .18s ease,box-shadow .18s ease}
.ufe-card:active{transform:scale(.985)}
.ufe-scroll::-webkit-scrollbar{display:none}
.ufe-scroll{-ms-overflow-style:none;scrollbar-width:none}
`
function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS; document.head.appendChild(s)
}

/* ── design tokens ── */
const T = {
  bg: '#0A0A0F', card: '#111118', card2: '#1A1A25', border: 'rgba(255,255,255,.07)',
  gold: '#D4AF37', goldDim: 'rgba(212,175,55,.12)', green: '#00C853', red: '#FF3B30',
  pink: '#F472B6', pinkDim: 'rgba(244,114,182,.12)', white: '#FFFFFF',
  dim: 'rgba(255,255,255,.45)', dim2: 'rgba(255,255,255,.22)',
}

/* ── badge lookups ── */
const TIERS: Record<string, { label: string; color: string; bg: string }> = {
  PHOTO: { label: 'Photo', color: '#60a5fa', bg: 'rgba(96,165,250,.12)' },
  VIDEO: { label: 'Video', color: '#a78bfa', bg: 'rgba(167,139,250,.12)' },
  VILLAGE_VOUCH: { label: 'Village Vouch', color: T.gold, bg: T.goldDim },
  FULL: { label: 'Fully Verified', color: T.green, bg: 'rgba(0,200,83,.12)' },
}
const STATIONS: Record<string, { label: string; color: string; bg: string; slug: string }> = {
  CULTURAL_WALL: { label: 'Cultural Wall', color: T.gold, bg: T.goldDim, slug: 'wall' },
  GUIDED_CHAT: { label: 'Guided Chat', color: '#60a5fa', bg: 'rgba(96,165,250,.12)', slug: 'chat' },
  VIRTUAL_DATE: { label: 'Virtual Date', color: T.pink, bg: T.pinkDim, slug: 'dates' },
  COURTSHIP: { label: 'Courtship', color: T.green, bg: 'rgba(0,200,83,.12)', slug: 'courtship' },
}

/* ── mock fallback data ── */
const MOCK_QUEUE = [
  { afroId: 'AFR-NGA-HLT-101', displayName: 'Zawadi Mwangi', heritage: 'Kikuyu', country: 'Kenya', compatibilityScore: 94, verificationTier: 'FULL', photos: [] as string[] },
  { afroId: 'AFR-GHA-ART-202', displayName: 'Kofi Asante', heritage: 'Ashanti', country: 'Ghana', compatibilityScore: 87, verificationTier: 'VIDEO', photos: [] as string[] },
  { afroId: 'AFR-SEN-EDU-303', displayName: 'Fatou Sow', heritage: 'Wolof', country: 'Senegal', compatibilityScore: 82, verificationTier: 'PHOTO', photos: [] as string[] },
  { afroId: 'AFR-KEN-TEC-404', displayName: 'Jabari Odongo', heritage: 'Luo', country: 'Kenya', compatibilityScore: 79, verificationTier: 'VILLAGE_VOUCH', photos: [] as string[] },
  { afroId: 'AFR-NGA-FIN-505', displayName: 'Nneka Eze', heritage: 'Igbo', country: 'Nigeria', compatibilityScore: 76, verificationTier: 'PHOTO', photos: [] as string[] },
]
const MOCK_MATCHES = [
  { id: 'm1', partnerName: 'Zawadi Mwangi', currentStation: 'CULTURAL_WALL', expiresAt: new Date(Date.now() + 5 * 864e5).toISOString(), status: 'ACTIVE' },
  { id: 'm2', partnerName: 'Kofi Asante', currentStation: 'GUIDED_CHAT', expiresAt: new Date(Date.now() + 12 * 864e5).toISOString(), status: 'ACTIVE' },
]

/* ── helpers ── */
function timeLeft(iso: string) {
  const d = new Date(iso).getTime() - Date.now()
  if (d <= 0) return 'Expired'
  const days = Math.floor(d / 864e5), hrs = Math.floor((d % 864e5) / 36e5)
  return days > 0 ? `${days}d ${hrs}h left` : `${hrs}h left`
}
function scColor(s: number) { return s >= 90 ? T.green : s >= 75 ? T.gold : T.pink }
const tBadge = (t: string) => TIERS[t] || TIERS.PHOTO
const sBadge = (s: string) => STATIONS[s] || STATIONS.CULTURAL_WALL

/* ── reusable inline sub-components ── */
function Badge({ color, bg, label, sz = 10 }: { color: string; bg: string; label: string; sz?: number }) {
  return <span style={{ display: 'inline-block', fontSize: sz, fontWeight: 600, color, background: bg, borderRadius: 6, padding: '2px 8px', letterSpacing: 0.4 }}>{label}</span>
}
function Avi({ size, photo, border }: { size: number; photo?: string; border: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${border}22, ${border}44)`, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45, flexShrink: 0, overflow: 'hidden' }}>
      {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '\u2764\uFE0F'}
    </div>
  )
}

/* ════════════════════════════════════════ MAIN PAGE ════════════════════════════════════════ */
export default function LoveWorldHub() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [profile, setProfile] = React.useState<any>(null)
  const [hasProfile, setHasProfile] = React.useState(false)
  const [queue, setQueue] = React.useState<any[]>([])
  const [matches, setMatches] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [accepting, setAccepting] = React.useState<string | null>(null)
  const [declined, setDeclined] = React.useState<Set<string>>(new Set())

  React.useEffect(() => { injectCSS() }, [])

  /* ── load data ── */
  React.useEffect(() => {
    let dead = false
    ;(async () => {
      setLoading(true); setError('')
      try {
        try { const p = await loveWorldApi.getMyProfile(); if (!dead && p) { setProfile(p); setHasProfile(true) } }
        catch { if (!dead) setHasProfile(false) }
        try { const q = await loveWorldApi.getMatchQueue(); if (!dead) setQueue(Array.isArray(q) ? q.slice(0, 5) : MOCK_QUEUE) }
        catch { if (!dead) setQueue(MOCK_QUEUE) }
        try {
          const m = await loveWorldApi.getMatches()
          if (!dead) setMatches(Array.isArray(m) ? m.filter((x: any) => x.status !== 'DECLINED' && x.status !== 'EXPIRED') : MOCK_MATCHES)
        } catch { if (!dead) setMatches(MOCK_MATCHES) }
      } catch (e: any) { if (!dead) setError(e?.message || 'Failed to load') }
      finally { if (!dead) setLoading(false) }
    })()
    return () => { dead = true }
  }, [])

  async function handleAccept(afroId: string) {
    setAccepting(afroId)
    try { await loveWorldApi.acceptMatch(afroId); setQueue(p => p.filter(c => c.afroId !== afroId)) }
    catch { /* card stays */ }
    finally { setAccepting(null) }
  }

  const visibleQueue = queue.filter(c => !declined.has(c.afroId))
  const btnBase = { fontFamily: 'monospace' as const, cursor: 'pointer' as const, border: 'none' as const }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'monospace', color: T.white, paddingBottom: 100 }}>

      {/* ═══ GRADIENT HEADER ═══ */}
      <div style={{ background: 'linear-gradient(135deg,#1A0A2E 0%,#16213E 40%,#0F3460 70%,#1A1A25 100%)', padding: '48px 20px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 30%,rgba(212,175,55,.04) 0%,transparent 50%),radial-gradient(circle at 80% 70%,rgba(244,114,182,.03) 0%,transparent 50%)', pointerEvents: 'none' }} />
        <div className="ufe-heart" style={{ fontSize: 36, marginBottom: 8 }}>{'\u2764\uFE0F'}</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, margin: 0 }}>UFE REALM</h1>
        <p style={{ fontSize: 12, color: T.gold, letterSpacing: 2, marginTop: 6, fontWeight: 600 }}>WHERE HERITAGE MEETS HEART</p>
      </div>

      {/* ═══ LOADING ═══ */}
      {loading && (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="ufe-pulse" style={{ fontSize: 32, marginBottom: 12 }}>{'\u2764\uFE0F'}</div>
          <p style={{ color: T.dim, fontSize: 13 }}>Loading your love realm...</p>
        </div>
      )}

      {/* ═══ ERROR ═══ */}
      {!loading && error && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: T.red, fontSize: 14, marginBottom: 12 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ ...btnBase, background: 'rgba(255,59,48,.12)', border: `1px solid ${T.red}`, color: T.red, borderRadius: 8, padding: '10px 24px', fontSize: 13 }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ padding: '16px 16px 0' }}>

          {/* ═══ PROFILE CARD / CTA ═══ */}
          {hasProfile && profile ? (
            <div className="ufe-fade ufe-glow" style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${T.gold},${T.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                {profile.photos?.[0] ? <img src={profile.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '\u2764\uFE0F'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{profile.displayName || user?.handle || 'Your Profile'}</div>
                <div style={{ fontSize: 12, color: T.dim, marginBottom: 4 }}>{profile.heritage || 'Heritage not set'}</div>
                {profile.verificationTier && <Badge {...tBadge(profile.verificationTier)} />}
              </div>
              <div onClick={() => router.push('/dashboard/love/settings')} style={{ color: T.dim, fontSize: 18, cursor: 'pointer', padding: 4 }}>{'\u2699\uFE0F'}</div>
            </div>
          ) : (
            <div className="ufe-fade" style={{ background: 'linear-gradient(135deg,rgba(212,175,55,.08),rgba(244,114,182,.06))', border: `1px dashed ${T.gold}`, borderRadius: 16, padding: '28px 20px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{'\u2764\uFE0F\u200D\uD83D\uDD25'}</div>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Begin Your Love Journey</p>
              <p style={{ fontSize: 12, color: T.dim, marginBottom: 16, lineHeight: 1.5 }}>Create your love profile to enter the Ufe Realm</p>
              <button onClick={() => router.push('/dashboard/love/create')} style={{ ...btnBase, background: `linear-gradient(135deg,${T.gold},#B8941F)`, borderRadius: 10, padding: '12px 28px', color: '#000', fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
                Create Your Love Profile
              </button>
            </div>
          )}

          {/* ═══ MATCH QUEUE ═══ */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: 1 }}>MATCH QUEUE</h2>
              <span style={{ fontSize: 11, color: T.dim }}>{visibleQueue.length} candidate{visibleQueue.length !== 1 ? 's' : ''}</span>
            </div>
            {visibleQueue.length === 0 ? (
              <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{'\uD83D\uDD0D'}</div>
                <p style={{ color: T.dim, fontSize: 13, margin: 0 }}>No candidates right now. Check back soon.</p>
              </div>
            ) : (
              <div className="ufe-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                {visibleQueue.map((c, i) => {
                  const sc = scColor(c.compatibilityScore || 0), t = tBadge(c.verificationTier || 'PHOTO')
                  return (
                    <div key={c.afroId} className="ufe-fade ufe-card" style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: 14, minWidth: 200, maxWidth: 220, flexShrink: 0, animationDelay: `${i * 0.08}s` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Avi size={40} photo={c.photos?.[0]} border={sc} />
                        <div style={{ fontSize: 22, fontWeight: 800, color: sc, letterSpacing: -0.5 }}>{c.compatibilityScore || 0}%</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{c.displayName || 'Anonymous'}</div>
                      <div style={{ fontSize: 11, color: T.dim, marginBottom: 4 }}>{c.heritage || 'Unknown'}{c.country ? ` \u00B7 ${c.country}` : ''}</div>
                      <div style={{ marginBottom: 10 }}><Badge {...t} sz={9} /></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleAccept(c.afroId)} disabled={accepting === c.afroId} style={{ ...btnBase, flex: 1, background: T.green, borderRadius: 8, padding: '8px 0', color: '#000', fontSize: 12, fontWeight: 700, opacity: accepting === c.afroId ? 0.6 : 1 }}>
                          {accepting === c.afroId ? '...' : 'Accept'}
                        </button>
                        <button onClick={() => setDeclined(p => new Set(p).add(c.afroId))} style={{ flex: 1, background: 'rgba(255,59,48,.10)', border: '1px solid rgba(255,59,48,.25)', borderRadius: 8, padding: '8px 0', color: T.red, fontFamily: 'monospace', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Decline
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ═══ ACTIVE MATCHES ═══ */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: 1 }}>ACTIVE MATCHES</h2>
              <span style={{ fontSize: 11, color: T.dim }}>{matches.length} active</span>
            </div>
            {matches.length === 0 ? (
              <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{'\uD83E\uDD1D'}</div>
                <p style={{ color: T.dim, fontSize: 13, margin: 0 }}>No active matches yet. Accept someone from your queue!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matches.map((m, i) => {
                  const s = sBadge(m.currentStation), remaining = m.expiresAt ? timeLeft(m.expiresAt) : ''
                  return (
                    <div key={m.id} className="ufe-fade ufe-card" onClick={() => router.push(`/dashboard/love/matches/${m.id}/${s.slug}`)} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: 14, cursor: 'pointer', animationDelay: `${i * 0.06}s` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avi size={44} border={s.color} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{m.partnerName || 'Match'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Badge color={s.color} bg={s.bg} label={s.label} />
                            {remaining && <span style={{ fontSize: 10, color: T.dim }}>{remaining}</span>}
                          </div>
                        </div>
                        <div style={{ color: T.dim2, fontSize: 16 }}>{'\u203A'}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ═══ BOTTOM ACTION STRIP ═══ */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {[
              { label: 'Genotype', icon: '\uD83E\uDDEC', route: '/dashboard/love/genotype' },
              { label: 'Settings', icon: '\u2699\uFE0F', route: '/dashboard/love/settings' },
            ].map(a => (
              <button key={a.label} onClick={() => router.push(a.route)} style={{ flex: 1, background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 0', color: T.white, fontFamily: 'monospace', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
