'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

/* ─── Types ─────────────────────────────────────────────── */
interface Profile {
  id: string
  name: string
  handle: string
  tribe: string
  country: string
  score: number
  emoji: string
}

/* ─── Mock fallback data ────────────────────────────────── */
const MOCK_PROFILES: Profile[] = [
  { id: '1', name: 'Amara Diallo',   handle: 'amara_d',   tribe: 'Mandinka', country: 'Senegal',       score: 847, emoji: '🌿' },
  { id: '2', name: 'Zawadi Mwangi',  handle: 'zawadi_m',  tribe: 'Kikuyu',   country: 'Kenya',         score: 921, emoji: '🌅' },
  { id: '3', name: 'Yaw Mensah',     handle: 'yaw_m',     tribe: 'Akan',     country: 'Ghana',         score: 763, emoji: '🥁' },
  { id: '4', name: 'Naledi Dlamini', handle: 'naledi_d',  tribe: 'Zulu',     country: 'South Africa',  score: 889, emoji: '🦁' },
  { id: '5', name: 'Khadija Al-Amin',handle: 'khadija_a', tribe: 'Amazigh',  country: 'Morocco',       score: 702, emoji: '🏔️' },
  { id: '6', name: 'Emeka Osei',     handle: 'emeka_o',   tribe: 'Igbo',     country: 'Nigeria',       score: 834, emoji: '🌺' },
]

const TRIBES = ['Swahili', 'Akan', 'Amharic', 'Zulu', 'Yoruba', 'Igbo', 'Wolof', 'Hausa']

/* ─── Inject CSS once ───────────────────────────────────── */
const CSS_ID = 'social-discover-css'
const CSS = `
@keyframes sdFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes sdPulse{0%,100%{opacity:.6}50%{opacity:1}}
.sd-fade{animation:sdFade .35s ease both}
.sd-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(34,197,94,.12) !important}
.sd-card{transition:transform .2s ease, box-shadow .2s ease}
.sd-chip:hover{background:rgba(34,197,94,.18) !important;border-color:#22c55e !important}
.sd-chip{transition:background .15s, border-color .15s, color .15s, transform .1s}
.sd-chip:active{transform:scale(.96)}
.sd-connect:disabled{opacity:.65;cursor:default}
.sd-connect:hover:not(:disabled){background:#16a34a !important}
.sd-connect{transition:background .15s, transform .1s}
.sd-connect:active:not(:disabled){transform:scale(.97)}
`
function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style')
  s.id = CSS_ID
  s.textContent = CSS
  document.head.appendChild(s)
}

/* ─── Person Card ───────────────────────────────────────── */
function PersonCard({ profile, sent, onConnect }: {
  profile: Profile
  sent: boolean
  onConnect: (id: string) => void
}) {
  return (
    <div
      className="sd-card sd-fade"
      style={{
        background: 'rgba(255,255,255,.035)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 16,
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Avatar row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#1a7c3e,#d4a017)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}>
          {profile.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#f0f7f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            @{profile.handle} · {profile.country}
          </div>
        </div>
      </div>

      {/* Tribe + Ubuntu score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#d4a017',
          background: 'rgba(212,160,23,.12)',
          border: '1px solid rgba(212,160,23,.3)',
          borderRadius: 20,
          padding: '3px 10px',
        }}>
          {profile.tribe}
        </span>
        <span style={{
          fontSize: 11,
          color: '#22c55e',
          background: 'rgba(34,197,94,.08)',
          border: '1px solid rgba(34,197,94,.2)',
          borderRadius: 20,
          padding: '3px 10px',
          fontWeight: 600,
        }}>
          ✦ Ubuntu {profile.score}
        </span>
      </div>

      {/* Connect button */}
      <button
        className="sd-connect"
        disabled={sent}
        onClick={() => onConnect(profile.id)}
        style={{
          width: '100%',
          padding: '9px 0',
          borderRadius: 10,
          border: 'none',
          background: sent ? 'rgba(34,197,94,.15)' : '#22c55e',
          color: sent ? '#22c55e' : '#07090a',
          fontWeight: 700,
          fontSize: 13,
          cursor: sent ? 'default' : 'pointer',
        }}
      >
        {sent ? 'Request Sent ✓' : 'Connect'}
      </button>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function DiscoverPeoplePage() {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const [profiles, setProfiles] = React.useState<Profile[]>(USE_MOCKS ? MOCK_PROFILES : [])
  const [loading, setLoading] = React.useState(false)
  const [sentIds, setSentIds] = React.useState<Set<string>>(new Set())
  const [activeTribes, setActiveTribes] = React.useState<Set<string>>(new Set())
  const [searchResults, setSearchResults] = React.useState<Profile[] | null>(null)
  const [searchLoading, setSearchLoading] = React.useState(false)

  React.useEffect(() => {
    injectCSS()

    // Attempt to fetch suggestions from API
    setLoading(true)
    fetch('/api/v1/connections/suggestions')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: Profile[]) => {
        if (Array.isArray(data) && data.length > 0) setProfiles(data)
      })
      .catch((e) => { logApiFailure('social/suggestions', e) })
      .finally(() => setLoading(false))
  }, [])

  /* Search handler */
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  function handleSearch(val: string) {
    setQuery(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!val.trim()) { setSearchResults(null); return }
    setSearchLoading(true)
    searchTimeout.current = setTimeout(() => {
      fetch(`/api/v1/users/search?q=${encodeURIComponent(val.trim())}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then((data: Profile[]) => setSearchResults(Array.isArray(data) ? data : []))
        .catch((e) => {
          logApiFailure('social/search', e)
          if (USE_MOCKS) {
            const q = val.toLowerCase()
            setSearchResults(MOCK_PROFILES.filter(p =>
              p.name.toLowerCase().includes(q) ||
              p.handle.toLowerCase().includes(q) ||
              p.tribe.toLowerCase().includes(q)
            ))
          }
        })
        .finally(() => setSearchLoading(false))
    }, 400)
  }

  /* Connect handler */
  function handleConnect(id: string) {
    setSentIds(prev => new Set(prev).add(id))
    fetch('/api/v1/connections/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    }).catch((e) => { logApiFailure('social/connect', e) })
  }

  /* Tribe filter toggle */
  function toggleTribe(tribe: string) {
    setActiveTribes(prev => {
      const next = new Set(prev)
      next.has(tribe) ? next.delete(tribe) : next.add(tribe)
      return next
    })
  }

  /* Displayed profiles (apply tribe filter) */
  const displayed = React.useMemo(() => {
    const base = searchResults ?? profiles
    if (activeTribes.size === 0) return base
    return base.filter(p => activeTribes.has(p.tribe))
  }, [searchResults, profiles, activeTribes])

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#07090a',
      color: '#f0f7f0',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Adinkra overlay 3% */}
      <div
        className="bg-adinkra"
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '20px 0 16px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          marginBottom: 20,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 10,
              color: '#f0f7f0',
              fontSize: 18,
              width: 38,
              height: 38,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
              🌍 Discover People
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              Connect with Africans across the diaspora
            </p>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <span style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 16,
            pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            type="search"
            placeholder="Search by name, handle or tribe…"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '13px 16px 13px 42px',
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 12,
              color: '#f0f7f0',
              fontSize: 14,
              outline: 'none',
            }}
          />
          {searchLoading && (
            <span style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 13,
              color: '#6b7280',
              animation: 'sdPulse 1s infinite',
            }}>
              …
            </span>
          )}
        </div>

        {/* ── Explore Tribes ── */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#d4a017', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 12px' }}>
            Explore Tribes
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRIBES.map(tribe => {
              const active = activeTribes.has(tribe)
              return (
                <button
                  key={tribe}
                  className="sd-chip"
                  onClick={() => toggleTribe(tribe)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    border: `1px solid ${active ? '#22c55e' : 'rgba(255,255,255,.12)'}`,
                    background: active ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.04)',
                    color: active ? '#22c55e' : '#a3a3a3',
                    fontSize: 13,
                    fontWeight: active ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {tribe}
                </button>
              )
            })}
          </div>
          {activeTribes.size > 0 && (
            <button
              onClick={() => setActiveTribes(new Set())}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: 12,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Clear filters ×
            </button>
          )}
        </section>

        {/* ── People You May Know / Results ── */}
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#d4a017', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 16px' }}>
            {searchResults !== null ? `Search Results (${displayed.length})` : 'People You May Know'}
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: 14, animation: 'sdPulse 1s infinite' }}>
              Finding connections…
            </div>
          )}

          {!loading && displayed.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: 14 }}>
              {searchResults !== null ? 'No people found for that search.' : 'No suggestions right now. Check back soon.'}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
          }}>
            {displayed.map((profile, i) => (
              <div key={profile.id} style={{ animationDelay: `${i * 60}ms` }}>
                <PersonCard
                  profile={profile}
                  sent={sentIds.has(profile.id)}
                  onConnect={handleConnect}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
