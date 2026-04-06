'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

const FEATURED = [
  { emoji: '🌾', title: 'Morning Farm Report',         tag: 'Agriculture',  color: '#1a7c3e' },
  { emoji: '🎉', title: 'The Real Village — S2E8',     tag: 'Reality',      color: '#d4a017' },
  { emoji: '⚕',  title: 'Community Health Q&A',        tag: 'Health',       color: '#0369a1' },
  { emoji: '🎓', title: 'Swahili Language School',     tag: 'Education',    color: '#7c3aed' },
  { emoji: '🌍', title: 'Oracle Session — All Villages',tag: 'Nation',      color: '#b22222' },
  { emoji: '🤖', title: 'Griot Orunmila: Wisdom Hour', tag: 'AI Griot',     color: '#4f46e5' },
]

const CSS_ID = 'afroflix-css'
const CSS = `
@keyframes aflFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes aflPulse{0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:1;transform:scale(1.1)}}
@keyframes aflShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.afl-fade{animation:aflFade .4s ease both}
.afl-card:hover{transform:translateY(-3px) scale(1.01);box-shadow:0 10px 36px rgba(212,160,23,.14) !important}
.afl-card{transition:transform .2s ease, box-shadow .2s ease;cursor:pointer}
.live-dot{width:8px;height:8px;border-radius:50%;background:#ef4444;animation:aflPulse .8s ease-in-out infinite;display:inline-block}
`
function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style')
  s.id = CSS_ID
  s.textContent = CSS
  document.head.appendChild(s)
}

export default function AfroFlixTVPage() {
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* Header */}
        <div style={{ padding: '24px 0 20px', borderBottom: '1px solid rgba(255,255,255,.07)', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Live Now
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, lineHeight: 1.15 }}>
            🔥 AfroFlix TV
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#9ca3af', lineHeight: 1.5 }}>
            Pan-African broadcast — 24/7 · Villages · Live Streams · Wisdom
          </p>
        </div>

        {/* Hero CTA */}
        <div
          className="afl-fade"
          style={{
            background: 'linear-gradient(135deg, rgba(26,124,62,.25) 0%, rgba(212,160,23,.15) 100%)',
            border: '1px solid rgba(212,160,23,.25)',
            borderRadius: 20,
            padding: '28px 24px',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📺</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
            Enter the Full Broadcast Experience
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#9ca3af' }}>
            Guide · Station A (Reality) · Station B (Reels) · Station C (Broadcast)
          </p>
          <button
            onClick={() => router.push('/dashboard/jollof')}
            style={{
              padding: '13px 36px',
              background: '#22c55e',
              border: 'none',
              borderRadius: 12,
              color: '#07090a',
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
              letterSpacing: '.02em',
            }}
          >
            Open Jollof TV →
          </button>
        </div>

        {/* Featured Shows */}
        <section className="afl-fade" style={{ animationDelay: '100ms' }}>
          <h2 style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#d4a017',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
            margin: '0 0 16px',
          }}>
            Featured Shows
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {FEATURED.map((show, i) => (
              <div
                key={show.title}
                className="afl-card afl-fade"
                style={{
                  background: 'rgba(255,255,255,.035)',
                  border: `1px solid ${show.color}33`,
                  borderRadius: 14,
                  padding: '16px 14px',
                  animationDelay: `${120 + i * 60}ms`,
                }}
                onClick={() => router.push('/dashboard/jollof')}
              >
                <div style={{ fontSize: 26, marginBottom: 8 }}>{show.emoji}</div>
                <div style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: show.color,
                  background: `${show.color}18`,
                  border: `1px solid ${show.color}40`,
                  borderRadius: 20,
                  padding: '2px 8px',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                }}>
                  {show.tag}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f7f0', lineHeight: 1.4 }}>
                  {show.title}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div
          className="kente-divider"
          style={{ margin: '32px 0', height: 4, borderRadius: 2, opacity: 0.6 }}
        />

        {/* Info strip */}
        <div
          className="afl-fade"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            animationDelay: '400ms',
          }}
        >
          {[
            { icon: '🌍', label: '20 Villages' },
            { icon: '🎙', label: '24/7 Live' },
            { icon: '🤖', label: 'AI Griot' },
            { icon: '🪙', label: 'Cowrie Commerce' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                flex: '1 1 120px',
                background: 'rgba(255,255,255,.03)',
                border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 12,
                padding: '14px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
