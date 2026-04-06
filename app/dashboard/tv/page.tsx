'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

const CHANNELS = [
  { emoji: '🔥', name: 'Jollof TV',     desc: 'African Broadcast Network · 24/7', href: '/dashboard/jollof',    color: '#d4a017', tag: 'LIVE' },
  { emoji: '🌍', name: 'Nation Square', desc: 'Oracle Sessions & Village Council', href: '/dashboard/jollof',    color: '#22c55e', tag: 'LIVE' },
  { emoji: '🎉', name: 'Reality Village',desc: 'The Real Village — Season 2',      href: '/dashboard/jollof',    color: '#b22222', tag: 'SERIES' },
  { emoji: '🤖', name: 'AI Griot Hour', desc: 'African Wisdom & History · 00:00',  href: '/dashboard/jollof',    color: '#4f46e5', tag: 'NIGHTLY' },
]

const CSS_ID = 'tv-hub-css'
const CSS = `
@keyframes tvFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes tvPulse{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
.tv-fade{animation:tvFade .38s ease both}
.tv-ch:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.3) !important}
.tv-ch{transition:transform .2s ease, box-shadow .2s ease;cursor:pointer}
.live-dot{width:8px;height:8px;border-radius:50%;background:#ef4444;animation:tvPulse .8s ease-in-out infinite;display:inline-block}
`
function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style')
  s.id = CSS_ID
  s.textContent = CSS
  document.head.appendChild(s)
}

export default function TVHubPage() {
  const router = useRouter()

  React.useEffect(() => { injectCSS() }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#07090a',
      color: '#f0f7f0',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Adinkra overlay */}
      <div
        className="bg-adinkra"
        style={{ position: 'fixed', inset: 0, opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* Header */}
        <div style={{ padding: '24px 0 20px', borderBottom: '1px solid rgba(255,255,255,.07)', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Broadcasting Now
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>📺 AfroTV Hub</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#9ca3af' }}>
            All African broadcast channels in one place
          </p>
        </div>

        {/* Main CTA */}
        <div
          className="tv-fade"
          style={{
            background: 'linear-gradient(135deg, rgba(178,34,34,.2) 0%, rgba(212,160,23,.15) 100%)',
            border: '1px solid rgba(212,160,23,.2)',
            borderRadius: 20,
            padding: '28px 24px',
            marginBottom: 28,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>📡</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
            Pan-African Broadcast Network
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#9ca3af', lineHeight: 1.5 }}>
            20 villages · Commerce · Health · Education · Reality · Wisdom
          </p>
          <button
            onClick={() => router.push('/dashboard/jollof')}
            style={{
              padding: '13px 36px',
              background: '#d4a017',
              border: 'none',
              borderRadius: 12,
              color: '#07090a',
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Watch Jollof TV →
          </button>
        </div>

        {/* Channels */}
        <section>
          <h2 style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#d4a017',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
            margin: '0 0 14px',
          }}>
            Channels
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHANNELS.map((ch, i) => (
              <div
                key={ch.name}
                className="tv-ch tv-fade"
                style={{
                  background: 'rgba(255,255,255,.035)',
                  border: `1px solid ${ch.color}30`,
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  animationDelay: `${i * 70}ms`,
                }}
                onClick={() => router.push(ch.href)}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${ch.color}18`,
                  border: `1px solid ${ch.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}>
                  {ch.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#f0f7f0' }}>{ch.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ch.desc}
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: ch.color,
                  background: `${ch.color}18`,
                  border: `1px solid ${ch.color}40`,
                  borderRadius: 20,
                  padding: '3px 9px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  letterSpacing: '.06em',
                }}>
                  {ch.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Kente divider */}
        <div
          className="kente-divider"
          style={{ margin: '32px 0', height: 4, borderRadius: 2, opacity: 0.6 }}
        />

        {/* AfroFlix link */}
        <div
          className="tv-fade"
          style={{ textAlign: 'center', animationDelay: '350ms' }}
        >
          <button
            onClick={() => router.push('/dashboard/jollof-tv')}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 12,
              color: '#9ca3af',
              fontSize: 13,
              padding: '10px 20px',
              cursor: 'pointer',
            }}
          >
            Also see AfroFlix TV →
          </button>
        </div>
      </div>
    </div>
  )
}
