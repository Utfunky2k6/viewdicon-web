'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ── Ally Dashboard — Circle 3: Friend of the Motherland ───────
// This is a COMPLETELY SEPARATE dashboard from the main /dashboard.
// Circle 3 users land here after completing their ceremony.
// They do NOT have: Village, Role, Family Tree, Cowrie savings, Blood-Call SOS.
// They DO have: Jollof TV, Marketplace (buyer only), Cultural Exchange, Sponsor a Village.
//
// BACKEND ENGINEER NOTE:
//   - Check user.circle === 3 before serving this page
//   - If circle !== 3, redirect to /dashboard
//   - All Ally-specific API endpoints use the /ally/ namespace
//   - The ALY- prefixed Afro-ID is the primary identifier

const ALLY_CSS = `
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,.2)} 50%{box-shadow:0 0 40px rgba(59,130,246,.4)} }
.ally-fade  { animation: fadeUp .5s ease both }
.ally-fade1 { animation: fadeUp .5s .1s ease both }
.ally-fade2 { animation: fadeUp .5s .2s ease both }
.ally-fade3 { animation: fadeUp .5s .3s ease both }
`

// ── Feature tiles available to Circle 3 users ─────────────────
const ALLY_FEATURES = [
  {
    icon: '📺',
    title: 'Jollof TV',
    desc: 'Watch public African channels, news, and shows',
    href: '/jollof-tv',
    color: '#f97316',
    badge: 'OPEN ACCESS',
  },
  {
    icon: '🛒',
    title: 'Cowrie Marketplace',
    desc: 'Browse and buy African goods — buyer access only',
    href: '/market',
    color: '#d4a017',
    badge: 'BUYER ONLY',
  },
  {
    icon: '🤝',
    title: 'Cultural Exchange',
    desc: 'Ask questions, learn, and connect with African mentors',
    href: '/exchange',
    color: '#3b82f6',
    badge: 'OPEN ACCESS',
  },
  {
    icon: '🏠',
    title: 'Sponsor a Village',
    desc: 'Contribute directly to African village development projects',
    href: '/sponsor',
    color: '#1a7c3e',
    badge: 'GLOBAL GOOD',
  },
  {
    icon: '📰',
    title: 'Soro Soke Feed',
    desc: 'Read community discussions — read-only access',
    href: '/soro-soke',
    color: '#8b5cf6',
    badge: 'READ ONLY',
  },
  {
    icon: '🗺️',
    title: 'Africa Map',
    desc: 'Explore African nations, stories, and cultural regions',
    href: '/map',
    color: '#06b6d4',
    badge: 'EXPLORE',
  },
]

// ── What Allies cannot access ──────────────────────────────────
const LOCKED_FEATURES = [
  { icon: '🏘️', label: 'Village Membership',   reason: 'Reserved for African citizens (Circle 1 & 2)' },
  { icon: '👔', label: 'Professional Role',     reason: 'Village roles require African identity verification' },
  { icon: '🌳', label: 'Family Tree',           reason: 'Kinship network is for African bloodlines' },
  { icon: '₵',  label: 'Cowrie Savings Union',  reason: 'Financial cooperative for verified Africans' },
  { icon: '🆘', label: 'Blood-Call SOS',        reason: 'Emergency network for African community members' },
]

// ── Upgrade path ───────────────────────────────────────────────
function UpgradePath() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(26,124,62,.08), rgba(59,130,246,.06))',
      border: '1.5px solid rgba(26,124,62,.25)',
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
        Path to Circle 2 — Diaspora Status
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.65, marginBottom: 14 }}>
        After 30 days, earn <strong style={{ color: '#f0f7f0' }}>5 endorsements</strong> from verified African citizens (Circle 1 or 2) to apply for Diaspora status. You may then complete Heritage Verification to unlock all platform features.
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 12, background: 'rgba(26,124,62,.1)', border: '1px solid rgba(26,124,62,.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🏅</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>0 / 5 Endorsements</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>from African citizens</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 12, background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.15)', textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>📅</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd' }}>Eligible in 30 days</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>for re-application</div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function AllyDashboard() {
  const router = useRouter()
  const [allyId] = React.useState(() => `ALY-${Date.now().toString(36).toUpperCase().slice(-4)}-2026`)
  const [showLocked, setShowLocked] = React.useState(false)

  React.useEffect(() => {
    // Inject CSS once
    if (document.getElementById('ally-css')) return
    const s = document.createElement('style')
    s.id = 'ally-css'
    s.textContent = ALLY_CSS
    document.head.appendChild(s)
  }, [])

  return (
    <main style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #06081a 0%, #060b07 60%, #06081a 100%)',
      color: '#f0f7f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflowX: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-10%', left: '20%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,124,62,.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '0 16px 60px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 10px' }}>
          <div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 900, letterSpacing: '-0.01em', color: '#f0f7f0' }}>VIEWDICON</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.1em' }}>Ally Portal</div>
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.25)', fontSize: 11, fontWeight: 700, color: '#93c5fd' }}>
            Circle 3 · Friend
          </div>
        </div>

        {/* Ally ID card */}
        <div className="ally-fade" style={{
          background: 'linear-gradient(145deg, rgba(30,64,175,.2), rgba(59,130,246,.08))',
          border: '1.5px solid rgba(59,130,246,.3)',
          borderRadius: 20,
          padding: '18px 20px',
          marginBottom: 20,
          animation: 'pulse 3s ease-in-out infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              🤝
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(147,197,253,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                Friend of the Motherland
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 900, color: '#f0f7f0' }}>
                Your Ally ID
              </div>
            </div>
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 20, fontWeight: 800, color: '#93c5fd', letterSpacing: '.12em', background: 'rgba(0,0,0,.3)', padding: '10px 14px', borderRadius: 10, textAlign: 'center' }}>
            {allyId}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(147,197,253,.4)', marginTop: 8, textAlign: 'center' }}>
            Circle 3 · No Village · No Role · Cultural Ally
          </div>
        </div>

        {/* Upgrade path */}
        <div className="ally-fade1">
          <UpgradePath />
        </div>

        {/* What you can access */}
        <div className="ally-fade2">
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f0f7f0', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
            🌐 Your Ally Access
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {ALLY_FEATURES.map((f) => (
              <Link key={f.title} href={f.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,.04)',
                  border: `1.5px solid rgba(255,255,255,.08)`,
                  borderRadius: 16,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'border-color .2s, background .2s',
                  height: '100%',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', lineHeight: 1.5, marginBottom: 8 }}>{f.desc}</div>
                  <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, background: `${f.color}18`, border: `1px solid ${f.color}40`, fontSize: 9, fontWeight: 800, color: f.color }}>
                    {f.badge}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Locked features toggle */}
        <div className="ally-fade3">
          <button
            onClick={() => setShowLocked(!showLocked)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
          >
            <span>🔒 Features not available for Circle 3</span>
            <span>{showLocked ? '▲' : '▼'}</span>
          </button>

          {showLocked && (
            <div style={{ background: 'rgba(178,34,34,.04)', border: '1px solid rgba(178,34,34,.12)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(178,34,34,.6)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                These features require Circle 1 or 2 status
              </div>
              {LOCKED_FEATURES.map(f => (
                <div key={f.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <span style={{ fontSize: 18, opacity: 0.4 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.4)', textDecoration: 'line-through' }}>{f.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', lineHeight: 1.5, marginTop: 2 }}>{f.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sponsor CTA */}
        <div style={{ background: 'linear-gradient(135deg, rgba(26,124,62,.12), rgba(26,124,62,.06))', border: '1.5px solid rgba(26,124,62,.25)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🌍</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 800, color: '#f0f7f0', marginBottom: 6 }}>Make an Impact</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, marginBottom: 14 }}>Friends of the Motherland can sponsor village projects, fund clean water initiatives, and support African entrepreneurs through the platform.</div>
          <button onClick={() => router.push('/dashboard/villages')} style={{ width: '100%', padding: 14, borderRadius: 14, background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            Explore Sponsorship Opportunities →
          </button>
        </div>

      </div>
    </main>
  )
}
