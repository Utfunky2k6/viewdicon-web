'use client'
// ═══════════════════════════════════════════════════════════════════════════
// 💕 LOVE WORLD — World-Class Public Landing
// Cowrie-coin luxury aesthetic · Sign up + subscribe before entering
// Three Realms: Ufè · Kèréwà · Àjọ Connect
// ═══════════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

// ── Inject CSS once ────────────────────────────────────────────────────────
const CSS_ID = 'lw-land-css'
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap');
@keyframes coinFloat{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:.18}50%{transform:translateY(-38px) rotate(180deg) scale(1.08);opacity:.32}100%{transform:translateY(0) rotate(360deg) scale(1);opacity:.18}}
@keyframes coinSpin{0%{transform:rotateY(0deg)}100%{transform:rotateY(360deg)}}
@keyframes lw-fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes lw-glow{0%,100%{box-shadow:0 0 30px 0 rgba(212,175,55,.12)}50%{box-shadow:0 0 60px 12px rgba(212,175,55,.22)}}
@keyframes lw-fire{0%,100%{box-shadow:0 0 30px 0 rgba(239,68,68,.12)}50%{box-shadow:0 0 60px 12px rgba(239,68,68,.22)}}
@keyframes lw-blue{0%,100%{box-shadow:0 0 30px 0 rgba(59,130,246,.12)}50%{box-shadow:0 0 60px 12px rgba(59,130,246,.22)}}
@keyframes lw-heart{0%,100%{transform:scale(1)}14%{transform:scale(1.22)}28%{transform:scale(1)}42%{transform:scale(1.1)}70%{transform:scale(1)}}
@keyframes lw-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes lw-ring{0%{transform:scale(.8);opacity:0}50%{opacity:.2}100%{transform:scale(2.2);opacity:0}}
@keyframes lw-slide{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes lw-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.lw-fade-up{animation:lw-fade-up .55s ease both}
.lw-heart-beat{animation:lw-heart 2s ease-in-out infinite}
.lw-glow-gold{animation:lw-glow 3s ease-in-out infinite}
.lw-glow-fire{animation:lw-fire 3s ease-in-out infinite}
.lw-glow-blue{animation:lw-blue 3s ease-in-out infinite}
.lw-slide{animation:lw-slide .4s ease both}
.lw-shimmer-text{background:linear-gradient(90deg,#D4AF37,#fff5cc,#c9a227,#ffe97a,#D4AF37);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:lw-shimmer 4s linear infinite}
.lw-glass{backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.coin-bg div{position:absolute;font-size:28px;animation:coinFloat var(--d,8s) ease-in-out var(--delay,0s) infinite}
`
function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: '#04040C',
  bg2: '#070712',
  card: 'rgba(255,255,255,.036)',
  cardHover: 'rgba(255,255,255,.055)',
  border: 'rgba(255,255,255,.09)',
  borderGold: 'rgba(212,175,55,.3)',
  gold: '#D4AF37',
  goldLight: '#FFE97A',
  goldDim: 'rgba(212,175,55,.14)',
  fire: '#EF4444',
  fireDim: 'rgba(239,68,68,.14)',
  blue: '#3B82F6',
  blueDim: 'rgba(59,130,246,.14)',
  white: '#FFFFFF',
  dim: 'rgba(255,255,255,.55)',
  dim2: 'rgba(255,255,255,.28)',
  dim3: 'rgba(255,255,255,.14)',
}

// ── Floating coins background ──────────────────────────────────────────────
function CoinField() {
  const coins = React.useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    left: `${5 + (i * 5.3) % 92}%`,
    top: `${3 + (i * 7.1) % 94}%`,
    delay: `${(i * 0.7) % 6}s`,
    duration: `${6 + (i * 1.1) % 6}s`,
    size: 16 + (i * 3) % 20,
  })), [])
  return (
    <div className="coin-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {coins.map((c, i) => (
        <div key={i} style={{
          left: c.left, top: c.top, fontSize: c.size,
          '--d': c.duration, '--delay': c.delay,
        } as any}>🐚</div>
      ))}
    </div>
  )
}

// ── Realm data ─────────────────────────────────────────────────────────────
const REALMS = [
  {
    id: 'ufe',
    emoji: '💛',
    coin: '🐚',
    name: 'Ufè Realm',
    nameLocal: '"Ufè" · Love in Idoma · Nigeria',
    tagline: 'The True Love Kingdom',
    accent: '#D4AF37',
    accentDim: 'rgba(212,175,55,.14)',
    gradient: 'linear-gradient(145deg, rgba(212,175,55,.08) 0%, rgba(4,4,12,0) 60%)',
    glowClass: 'lw-glow-gold',
    badge: 'MARRIAGE-TRACK',
    price: '29,990 CWR',
    period: '/month',
    priceLabel: 'Premium',
    features: [
      '3 ultra-compatible matches weekly',
      '21-day 3-station courtship journey',
      'AI cultural compatibility score',
      'Genotype safety check (AA/AS/SS)',
      'Elder endorsement system',
      'Wedding planner module',
    ],
    href: '/dashboard/love/ufe',
    ctaText: 'Enter Ufè Realm',
    ctaIcon: '💛',
  },
  {
    id: 'kerawa',
    emoji: '🔥',
    coin: '🐚',
    name: 'Kèréwà Zone',
    nameLocal: '"Kèréwà" · Casual · Nigerian Pidgin',
    tagline: 'Encrypted Casual Connections',
    accent: '#EF4444',
    accentDim: 'rgba(239,68,68,.14)',
    gradient: 'linear-gradient(145deg, rgba(239,68,68,.08) 0%, rgba(4,4,12,0) 60%)',
    glowClass: 'lw-glow-fire',
    badge: 'PRIVATE',
    price: '9,990 CWR',
    period: '/month',
    priceLabel: 'Paid',
    features: [
      '10 location-based matches/day',
      '48-hour encrypted chats',
      '5-level disappearing identity',
      'Escrow GPS meetup verification',
      'Private content vault',
      'Panic button & safety center',
    ],
    href: '/dashboard/love/kerawa',
    ctaText: 'Enter Kèréwà Zone',
    ctaIcon: '🔥',
  },
  {
    id: 'ajo',
    emoji: '💼',
    coin: '🐚',
    name: 'Àjọ Connect',
    nameLocal: '"Àjọ" · Contribution · Yoruba',
    tagline: 'Professional Companion Network',
    accent: '#3B82F6',
    accentDim: 'rgba(59,130,246,.14)',
    gradient: 'linear-gradient(145deg, rgba(59,130,246,.08) 0%, rgba(4,4,12,0) 60%)',
    glowClass: 'lw-glow-blue',
    badge: 'PROFESSIONAL',
    price: '4,990 CWR',
    period: '/month',
    priceLabel: 'Freemium',
    features: [
      'Event companions & hosts',
      'Cultural travel guides',
      'Business networking',
      'Skill exchange & mentoring',
      'Escrow payment protection',
      'Background verification',
    ],
    href: '/dashboard/love/ajo',
    ctaText: 'Enter Àjọ Connect',
    ctaIcon: '💼',
  },
]

const FAMILY_PKG = {
  price: '49,990 CWR',
  period: '/month',
  features: ['All 3 realms for up to 4 family members', 'Elder advisory access', 'Family matching panel', 'Shared wedding planner', 'Priority Cowrie escrow'],
}

// ── Subscription plan flow states ─────────────────────────────────────────
type FlowState = 'landing' | 'signup' | 'subscribe' | 'complete'

interface AuthState {
  phone: string
  otp: string
  otpSent: boolean
  loading: boolean
  selectedRealm: string | null
  selectedPlan: string
  flowState: FlowState
}

// ── RealmCard ─────────────────────────────────────────────────────────────
function RealmCard({ realm, index, onSubscribe }: { realm: typeof REALMS[0]; index: number; onSubscribe: (id: string) => void }) {
  const [expanded, setExpanded] = React.useState(false)
  const [hover, setHover] = React.useState(false)

  return (
    <div
      className={`lw-fade-up lw-glass ${realm.glowClass}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 24,
        border: `1px solid ${hover ? realm.accent + '50' : T.border}`,
        background: `${realm.gradient}, ${hover ? T.cardHover : T.card}`,
        padding: '28px 24px',
        marginBottom: 20,
        transition: 'all .3s ease',
        animationDelay: `${0.1 + index * 0.15}s`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${realm.accent}, transparent)`, opacity: hover ? 1 : 0.4, transition: 'opacity .3s' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: realm.accentDim, border: `1.5px solid ${realm.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, position: 'relative' }}>
          {realm.emoji}
          <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 14 }}>🐚</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: realm.accent, fontFamily: 'monospace', letterSpacing: '-.01em' }}>{realm.name}</h3>
            <span style={{ padding: '2px 10px', borderRadius: 99, background: realm.accentDim, color: realm.accent, fontSize: 9, fontWeight: 800, letterSpacing: '.1em' }}>{realm.badge}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.white, marginBottom: 2 }}>{realm.tagline}</div>
          <div style={{ fontSize: 10, color: T.dim2, fontStyle: 'italic' }}>{realm.nameLocal}</div>
        </div>
        {/* Price pill */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: realm.accent, lineHeight: 1.1 }}>{realm.price}</div>
          <div style={{ fontSize: 10, color: T.dim2 }}>{realm.period}</div>
          <div style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: realm.accentDim, color: realm.accent, marginTop: 4, fontWeight: 700 }}>{realm.priceLabel}</div>
        </div>
      </div>

      {/* Cowrie price display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: realm.accentDim, borderRadius: 12, border: `1px solid ${realm.accent}25` }}>
        <span style={{ fontSize: 18 }}>🐚</span>
        <span style={{ fontSize: 11, color: realm.accent, fontWeight: 700 }}>Pay in Cowrie coins (CWR)</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: T.dim2 }}>{realm.id === 'ufe' ? '29,990' : realm.id === 'kerawa' ? '9,990' : '4,990'} CWR/mo</span>
      </div>

      {/* Features toggle */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ fontSize: 11, color: realm.accent, fontWeight: 700, cursor: 'pointer', marginBottom: expanded ? 12 : 0, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {expanded ? '▲ Hide features' : '▼ What\'s included'}
      </div>

      {expanded && (
        <div style={{ marginBottom: 16 }} className="lw-slide">
          {realm.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ color: realm.accent, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 12, color: T.dim, lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => onSubscribe(realm.id)}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 14,
          background: `linear-gradient(135deg, ${realm.accent}cc, ${realm.accent})`,
          border: 'none',
          color: realm.id === 'ufe' ? '#000' : '#fff',
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: 14,
          cursor: 'pointer',
          letterSpacing: '.04em',
          transition: 'opacity .2s, transform .2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onMouseEnter={e => { (e.currentTarget as any).style.opacity = '.88'; (e.currentTarget as any).style.transform = 'scale(1.01)' }}
        onMouseLeave={e => { (e.currentTarget as any).style.opacity = '1'; (e.currentTarget as any).style.transform = 'scale(1)' }}
      >
        <span>{realm.ctaIcon}</span>
        <span>{realm.ctaText}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, opacity: .7 }}>🐚 {realm.price}</span>
      </button>
    </div>
  )
}

// ── SignUp / OTP Modal ─────────────────────────────────────────────────────
function AuthModal({ realmId, realms, onClose, onSuccess }: {
  realmId: string | null
  realms: typeof REALMS
  onClose: () => void
  onSuccess: (realmId: string, plan: string) => void
}) {
  const realm = realms.find(r => r.id === realmId) || realms[0]
  const [step, setStep] = React.useState<'phone' | 'otp' | 'plan'>('phone')
  const [phone, setPhone] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [selectedPlan, setSelectedPlan] = React.useState(realmId || 'ufe')
  const [loading, setLoading] = React.useState(false)

  async function sendOtp() {
    if (!phone.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setStep('otp')
  }

  async function verifyOtp() {
    if (otp.length < 4) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setStep('plan')
  }

  async function completeSub() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    onSuccess(selectedPlan, selectedPlan)
  }

  const plans = [
    ...REALMS.map(r => ({ id: r.id, name: r.name, price: r.price, emoji: r.emoji, accent: r.accent, priceLabel: r.priceLabel })),
    { id: 'family', name: 'Family Package', price: FAMILY_PKG.price, emoji: '👨‍👩‍👧‍👦', accent: '#a78bfa', priceLabel: 'All realms' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div
        className="lw-glass"
        style={{ width: '100%', maxWidth: 560, margin: '0 auto', background: 'rgba(10,10,20,.97)', borderRadius: '28px 28px 0 0', border: `1px solid ${T.border}`, borderBottom: 'none', padding: '32px 24px 48px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 44, height: 4, borderRadius: 2, background: T.dim3, margin: '0 auto 24px' }} />

        {step === 'phone' && (
          <div className="lw-fade-up">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="lw-heart-beat" style={{ fontSize: 44, marginBottom: 10, display: 'inline-block' }}>🐚</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px', color: T.gold }}>Join Love World</h2>
              <p style={{ fontSize: 12, color: T.dim2, margin: 0 }}>Enter your phone number to sign up or log in</p>
            </div>
            <label style={{ fontSize: 11, color: T.dim, display: 'block', marginBottom: 6 }}>Phone Number</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <div style={{ padding: '14px 16px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, color: T.dim, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>🌍 +</div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="234 800 000 0000"
                style={{ flex: 1, padding: '14px 16px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, color: T.white, fontFamily: 'monospace', fontSize: 14, outline: 'none' }}
                autoFocus
              />
            </div>
            <button onClick={sendOtp} disabled={loading || !phone.trim()} style={{ width: '100%', padding: '16px', borderRadius: 14, background: phone.trim() ? `linear-gradient(135deg, ${T.gold}cc, ${T.gold})` : T.dim3, border: 'none', color: '#000', fontFamily: 'monospace', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
              {loading ? 'Sending...' : '🐚 Send OTP Code'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="lw-fade-up">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📱</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px', color: T.gold }}>Verify Your Number</h2>
              <p style={{ fontSize: 12, color: T.dim2, margin: 0 }}>Enter the 6-digit code sent to {phone}</p>
            </div>
            <label style={{ fontSize: 11, color: T.dim, display: 'block', marginBottom: 6 }}>Verification Code</label>
            <input
              type="number"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              style={{ width: '100%', padding: '16px', background: T.card, border: `1px solid ${T.borderGold}`, borderRadius: 12, color: T.gold, fontFamily: 'monospace', fontSize: 24, textAlign: 'center', letterSpacing: '0.3em', marginBottom: 20, boxSizing: 'border-box', outline: 'none' }}
              autoFocus
            />
            <button onClick={verifyOtp} disabled={loading || otp.length < 4} style={{ width: '100%', padding: '16px', borderRadius: 14, background: otp.length >= 4 ? `linear-gradient(135deg, ${T.gold}cc, ${T.gold})` : T.dim3, border: 'none', color: '#000', fontFamily: 'monospace', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
              {loading ? 'Verifying...' : '✓ Verify & Continue'}
            </button>
            <div onClick={() => setStep('phone')} style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: T.dim2, cursor: 'pointer' }}>← Change number</div>
          </div>
        )}

        {step === 'plan' && (
          <div className="lw-fade-up">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🐚</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px', color: T.gold }}>Choose Your Realm</h2>
              <p style={{ fontSize: 12, color: T.dim2, margin: 0 }}>Subscribe with Cowrie coins (CWR)</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              {plans.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14, marginBottom: 8,
                    background: selectedPlan === p.id ? `rgba(212,175,55,.1)` : T.card,
                    border: `1.5px solid ${selectedPlan === p.id ? T.gold : T.border}`,
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: selectedPlan === p.id ? T.gold : T.white }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: T.dim2 }}>{p.priceLabel}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: selectedPlan === p.id ? T.gold : T.white }}>{p.price}</div>
                    <div style={{ fontSize: 9, color: T.dim2 }}>/month</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedPlan === p.id ? T.gold : T.dim3}`, background: selectedPlan === p.id ? T.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#000', flexShrink: 0 }}>{selectedPlan === p.id ? '✓' : ''}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 14px', background: T.goldDim, borderRadius: 12, border: `1px solid ${T.borderGold}`, marginBottom: 20, fontSize: 11, color: T.gold, lineHeight: 1.6 }}>
              🐚 Pay with Cowrie coins (CWR). Cancel anytime.
            </div>
            <button onClick={completeSub} disabled={loading} style={{ width: '100%', padding: '18px', borderRadius: 14, background: `linear-gradient(135deg, ${T.gold}bb, ${T.goldLight}, ${T.gold})`, border: 'none', color: '#000', fontFamily: 'monospace', fontWeight: 900, fontSize: 15, cursor: 'pointer', letterSpacing: '.04em' }}>
              {loading ? 'Processing...' : `🐚 Subscribe & Enter Love World`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LoveWorldLandingPage() {
  const router = useRouter()
  const [showAuth, setShowAuth] = React.useState(false)
  const [selectedRealm, setSelectedRealm] = React.useState<string | null>(null)

  React.useEffect(() => { injectCSS() }, [])

  function handleSubscribe(realmId: string) {
    setSelectedRealm(realmId)
    setShowAuth(true)
  }

  function handleAuthSuccess(realmId: string) {
    setShowAuth(false)
    const realm = REALMS.find(r => r.id === realmId)
    if (realm) router.push(realm.href)
    else router.push('/dashboard/love')
  }

  return (
    <div style={{ minHeight: '100dvh', background: `linear-gradient(180deg, #08060F 0%, #04040C 30%, #020208 100%)`, color: T.white, fontFamily: 'monospace', paddingBottom: 80, position: 'relative', overflowX: 'hidden' }}>

      {/* Floating Cowrie coins background */}
      <CoinField />

      {/* Deep radial glow at top */}
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 500, background: 'radial-gradient(ellipse, rgba(212,175,55,.06) 0%, rgba(139,69,19,.03) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐚</span>
          <span style={{ fontSize: 15, fontWeight: 900, color: T.gold, letterSpacing: '.06em' }}>LOVE WORLD</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setSelectedRealm(null); setShowAuth(true) }} style={{ padding: '9px 18px', borderRadius: 10, background: T.dim3, border: `1px solid ${T.border}`, color: T.white, fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Log In</button>
          <button onClick={() => { setSelectedRealm(null); setShowAuth(true) }} style={{ padding: '9px 18px', borderRadius: 10, background: `linear-gradient(135deg, ${T.gold}cc, ${T.gold})`, border: 'none', color: '#000', fontFamily: 'monospace', fontWeight: 900, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🐚</span> Sign Up
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '64px 24px 48px' }}>
        {/* Animated heart */}
        <div className="lw-heart-beat" style={{ fontSize: 64, marginBottom: 16, display: 'inline-block', filter: 'drop-shadow(0 0 24px rgba(212,175,55,.4))' }}>💕</div>

        <h1 className="lw-shimmer-text lw-fade-up" style={{ fontSize: 'clamp(40px, 10vw, 72px)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1, letterSpacing: '-.02em' }}>
          LOVE WORLD
        </h1>

        <p className="lw-fade-up" style={{ fontSize: 'clamp(13px, 3vw, 16px)', color: T.dim2, margin: '0 0 6px', letterSpacing: '.12em', textTransform: 'uppercase', animationDelay: '.1s' }}>
          THE AFRICAN DATING REVOLUTION
        </p>

        <p className="lw-fade-up" style={{ fontSize: 14, color: T.dim, maxWidth: 460, margin: '16px auto 0', lineHeight: 1.7, animationDelay: '.2s' }}>
          Cultural-first AI matching · Elder-endorsed · Family-integrated<br />
          <em style={{ color: T.goldLight }}>Honor ancestral wisdom. Build modern love.</em>
        </p>

        {/* Cowrie coin strip */}
        <div className="lw-fade-up" style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 28, flexWrap: 'wrap', animationDelay: '.3s' }}>
          {['🐚 Cowrie-Powered', '🧬 Genotype Safe', '👴 Elder-Endorsed', '🔐 Privacy-First', '🌍 Pan-African'].map(tag => (
            <span key={tag} style={{ padding: '6px 14px', borderRadius: 20, background: T.goldDim, border: `1px solid ${T.borderGold}`, fontSize: 11, color: T.gold, fontWeight: 700 }}>{tag}</span>
          ))}
        </div>

        {/* Hero CTA */}
        <div className="lw-fade-up" style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '.4s' }}>
          <button
            onClick={() => { setSelectedRealm(null); setShowAuth(true) }}
            style={{ padding: '18px 36px', borderRadius: 16, background: `linear-gradient(135deg, #b8932a, ${T.gold}, #ffe680, ${T.gold})`, border: 'none', color: '#000', fontFamily: 'monospace', fontWeight: 900, fontSize: 16, cursor: 'pointer', letterSpacing: '.04em', boxShadow: '0 8px 32px rgba(212,175,55,.3)' }}
          >
            🐚 Begin Your Journey
          </button>
          <button
            onClick={() => document.getElementById('realms')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '18px 28px', borderRadius: 16, background: T.card, border: `1px solid ${T.border}`, color: T.white, fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Explore Realms ↓
          </button>
        </div>
      </header>

      {/* ── GLOBAL STATS ─────────────────────────────────────── */}
      <section className="lw-fade-up" style={{ position: 'relative', zIndex: 1, padding: '0 24px 40px', animationDelay: '.5s' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxWidth: 560, margin: '0 auto' }}>
          {[
            { val: '3', label: 'Realms', color: T.gold },
            { val: '200', label: 'Questions', color: '#a78bfa' },
            { val: '3', label: 'Stations', color: '#4ade80' },
            { val: '21d', label: 'Journey', color: '#f472b6' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '16px 8px', background: T.card, borderRadius: 16, border: `1px solid ${T.border}` }} className="lw-glass">
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: T.dim2, marginTop: 4, letterSpacing: '.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THREE REALMS ─────────────────────────────────────── */}
      <section id="realms" style={{ position: 'relative', zIndex: 1, padding: '0 20px 40px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: T.dim2, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8 }}>Choose Your Path</div>
            <h2 className="lw-shimmer-text" style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Three Sacred Realms</h2>
          </div>

          {REALMS.map((realm, i) => (
            <RealmCard key={realm.id} realm={realm} index={i} onSubscribe={handleSubscribe} />
          ))}

          {/* Family package */}
          <div className="lw-glass lw-fade-up" style={{ borderRadius: 24, border: `1px solid rgba(167,139,250,.3)`, background: 'linear-gradient(145deg, rgba(167,139,250,.08) 0%, rgba(4,4,12,0) 60%), rgba(255,255,255,.036)', padding: '24px', animationDelay: '.6s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(167,139,250,.15)', border: '1.5px solid rgba(167,139,250,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👨‍👩‍👧‍👦</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#a78bfa', fontFamily: 'monospace' }}>Family Package</h3>
                  <span style={{ padding: '2px 10px', borderRadius: 99, background: 'rgba(167,139,250,.15)', color: '#a78bfa', fontSize: 9, fontWeight: 800 }}>BEST VALUE</span>
                </div>
                <div style={{ fontSize: 11, color: T.dim2 }}>All 3 realms · Up to 4 family members</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#a78bfa' }}>{FAMILY_PKG.price}</div>
                <div style={{ fontSize: 10, color: T.dim2 }}>{FAMILY_PKG.period}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
              {FAMILY_PKG.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, color: T.dim, alignItems: 'flex-start' }}>
                  <span style={{ color: '#a78bfa', flexShrink: 0 }}>✦</span>{f}
                </div>
              ))}
            </div>
            <button onClick={() => handleSubscribe('family')} style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>🐚</span> Subscribe Family — {FAMILY_PKG.price}/mo
            </button>
          </div>
        </div>
      </section>

      {/* ── JOURNEY OVERVIEW ─────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 20px 40px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px', color: T.gold }}>💛 The Ufè 3-Station Journey</h2>
            <p style={{ fontSize: 11, color: T.dim2, margin: 0 }}>A 21-day courtship that mirrors traditional African rituals</p>
          </div>
          {[
            { num: 1, name: 'Cultural Discovery Wall', time: '72 Hours', desc: 'Share culture, music, food, customs. AI scores authentic connection.', color: T.gold },
            { num: 2, name: 'Guided Interaction', time: '5 Days', desc: '200 deep questions. AI monitors trust, consistency + red flags.', color: '#60a5fa' },
            { num: 3, name: 'Virtual & Real Experiences', time: '14 Days', desc: 'Cook together. Virtual dates. Cultural treasure map. Meet in person.', color: '#f472b6' },
          ].map((st, i) => (
            <div key={st.num} className="lw-glass lw-fade-up" style={{ display: 'flex', gap: 16, padding: '18px 20px', background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, marginBottom: 12, animationDelay: `${0.1 + i * 0.1}s` }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${st.color}22`, border: `2px solid ${st.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: st.color, flexShrink: 0 }}>{st.num}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{st.name}</div>
                <div style={{ fontSize: 11, color: st.color, fontWeight: 700, marginBottom: 4 }}>⏱ {st.time}</div>
                <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.6 }}>{st.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Compatibility ──────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 20px 40px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px', background: T.card, borderRadius: 24, border: `1px solid ${T.border}` }} className="lw-glass">
          <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 20px', textAlign: 'center', color: T.gold }}>🧠 AI Compatibility Engine</h3>
          {[
            { label: 'Cultural Alignment', pct: 40, color: T.gold },
            { label: 'Genotype Safety', pct: 25, color: '#4ade80' },
            { label: 'Family Values', pct: 20, color: '#f472b6' },
            { label: 'Spiritual / Religious', pct: 10, color: '#a78bfa' },
            { label: 'Personality Chemistry', pct: 5, color: '#60a5fa' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: T.dim, width: 160, flexShrink: 0 }}>{d.label}</span>
              <div style={{ flex: 1, height: 10, background: '#1a1a1a', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${d.pct}%`, height: '100%', background: `linear-gradient(90deg, ${d.color}66, ${d.color})`, borderRadius: 5, transition: 'width 1s ease' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: d.color, width: 30, textAlign: 'right', flexShrink: 0 }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Safety ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 20px 64px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ padding: '24px', background: T.card, borderRadius: 24, border: `1px solid ${T.border}` }} className="lw-glass">
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 20px', textAlign: 'center' }}>🛡️ Safety Architecture</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '🪪', label: 'Government ID' },
                { icon: '🧬', label: 'Genotype Verify' },
                { icon: '🤖', label: 'AI Scam Filter' },
                { icon: '🚨', label: 'Panic Button' },
                { icon: '👁️', label: 'Identity Levels' },
                { icon: '🐚', label: 'Escrow Meetups' },
                { icon: '👴', label: 'Elder Advisory' },
                { icon: '📍', label: 'GPS Verification' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, color: T.dim }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 20px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="lw-heart-beat" style={{ fontSize: 48, marginBottom: 16, display: 'inline-block' }}>🐚</div>
          <h2 className="lw-shimmer-text" style={{ fontSize: 28, fontWeight: 900, margin: '0 0 12px' }}>Ready to Find Your Person?</h2>
          <p style={{ fontSize: 13, color: T.dim2, margin: '0 0 28px', lineHeight: 1.7 }}>
            Join thousands of Africans finding authentic connection through culture, family, and ancestral wisdom.
          </p>
          <button onClick={() => { setSelectedRealm(null); setShowAuth(true) }} style={{ padding: '20px 48px', borderRadius: 16, background: `linear-gradient(135deg, #b8932a, ${T.gold}, #ffe680, ${T.gold})`, border: 'none', color: '#000', fontFamily: 'monospace', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '0 12px 40px rgba(212,175,55,.3)', letterSpacing: '.04em' }}>
            🐚 Start My Journey — Free Sign Up
          </button>
          <div style={{ marginTop: 14, fontSize: 11, color: T.dim2 }}>Free sign up · Cancel anytime · Cowrie coin payments</div>
        </div>
      </section>

      {/* Auth / Subscribe modal */}
      {showAuth && (
        <AuthModal
          realmId={selectedRealm}
          realms={REALMS}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}
