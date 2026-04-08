'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { kerawaApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const FIRE = { primary: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#0a0a0a', card: '#141414', border: '#1f1f1f' }

const FLAG_TYPES = [
  { key: 'FINANCIAL_SCAM', label: 'Financial Scam', icon: '💸' },
  { key: 'FAKE_IDENTITY', label: 'Fake Identity', icon: '🎭' },
  { key: 'HARASSMENT', label: 'Harassment', icon: '⚠️' },
  { key: 'STALKING', label: 'Stalking', icon: '👁️' },
  { key: 'NON_CONSENT', label: 'Non-Consent Violation', icon: '🚫' },
  { key: 'CATFISH', label: 'Catfish', icon: '🐟' },
  { key: 'AGGRESSION', label: 'Aggression / Threats', icon: '👊' },
  { key: 'SPAM', label: 'Spam / Promotion', icon: '📢' },
]

const SAFETY_TIPS = [
  { title: 'Always meet in public places', desc: 'First meetups should be in busy, well-lit locations. Never go to a private residence until trust is established.' },
  { title: 'Use escrow for meetup deposits', desc: 'Escrow protects both parties. Money only releases when GPS confirms you both arrived and stayed 15 minutes.' },
  { title: 'Share your location with a trusted friend', desc: 'Before any meetup, send your live location to someone you trust. The Kèréwà system can do this automatically.' },
  { title: 'Report suspicious behavior immediately', desc: 'If someone pressures you for money, asks for personal details too fast, or makes you uncomfortable — report them.' },
  { title: 'Trust the AI scam filter warnings', desc: 'Our AI analyzes messages for scam patterns. If you see a warning, take it seriously. Scammers are sophisticated.' },
  { title: 'The Panic Button is always there for you', desc: 'Press and hold for 3 seconds. It captures GPS, alerts safety team, and can notify your emergency contacts.' },
]

export default function KerawaSafetyPage() {
  const r = useRouter()
  const [trustScore, setTrustScore] = useState<any>(null)
  const [flags, setFlags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [reportType, setReportType] = useState('HARASSMENT')
  const [reportTarget, setReportTarget] = useState('')
  const [reportDesc, setReportDesc] = useState('')
  const [panicProgress, setPanicProgress] = useState(0)
  const panicTimer = useRef<any>(null)
  const [expandedTip, setExpandedTip] = useState<number | null>(null)

  useEffect(() => {
    const s = document.createElement('style')
    s.textContent = `@keyframes kpanic{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.6)}50%{box-shadow:0 0 40px 20px rgba(239,68,68,.15)}}@keyframes kring{from{stroke-dashoffset:283}to{stroke-dashoffset:0}}`
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [ts, fl] = await Promise.all([kerawaApi.getTrustScore(), kerawaApi.myFlags()])
        setTrustScore(ts?.score || ts || (USE_MOCKS ? MOCK_TRUST : null))
        setFlags(fl?.flags || fl || [])
      } catch {
        if (USE_MOCKS) setTrustScore(MOCK_TRUST)
        setFlags([])
      }
      setLoading(false)
    })()
  }, [])

  const MOCK_TRUST = {
    overall: 87,
    meetupReliability: 92,
    chatBehavior: 88,
    consentRecord: 95,
    paymentHonesty: 90,
    reportHistory: 78,
  }

  const score = trustScore || (USE_MOCKS ? MOCK_TRUST : { overall: 0 })
  const breakdownItems = [
    { label: 'Meetup Reliability', val: score.meetupReliability, color: '#4ade80' },
    { label: 'Chat Behavior', val: score.chatBehavior, color: '#60a5fa' },
    { label: 'Consent Record', val: score.consentRecord, color: '#a78bfa' },
    { label: 'Payment Honesty', val: score.paymentHonesty, color: '#f59e0b' },
    { label: 'Report History', val: score.reportHistory, color: FIRE.light },
  ]

  function startPanic() {
    setPanicProgress(0)
    panicTimer.current = setInterval(() => {
      setPanicProgress(prev => {
        if (prev >= 100) {
          clearInterval(panicTimer.current)
          triggerPanic()
          return 100
        }
        return prev + 3.33
      })
    }, 100)
  }

  function cancelPanic() {
    clearInterval(panicTimer.current)
    setPanicProgress(0)
  }

  async function triggerPanic() {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }))
      await kerawaApi.triggerPanic({ lat: pos.coords.latitude, lng: pos.coords.longitude, reason: 'USER_TRIGGERED' })
    } catch {
      await kerawaApi.triggerPanic({ lat: 0, lng: 0, reason: 'USER_TRIGGERED_NO_GPS' })
    }
    alert('🚨 SAFETY ALERT SENT\n\nOur team has been notified.\nYour GPS location was captured.\nStay where you are or move to a safe spot.')
    setPanicProgress(0)
  }

  async function submitReport() {
    try {
      await kerawaApi.reportUser({ targetId: reportTarget, type: reportType, description: reportDesc })
      setShowReport(false)
      setReportTarget('')
      setReportDesc('')
      alert('Report submitted. Our team will review within 24 hours.')
    } catch (e) { logApiFailure('kerawa/safety/report', e) }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: FIRE.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'monospace' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: FIRE.bg, color: '#fff', fontFamily: 'monospace', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => r.push('/dashboard/kerawa')} style={{ fontSize: 20, cursor: 'pointer' }}>←</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>🛡️ Safety Center</h1>
        </div>
      </div>

      {/* Trust Score Ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 16px 24px' }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a1a" strokeWidth="8" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={score.overall >= 80 ? '#4ade80' : score.overall >= 50 ? '#f59e0b' : FIRE.primary} strokeWidth="8" strokeLinecap="round" strokeDasharray="314" strokeDashoffset={314 - (314 * (score.overall || 0)) / 100} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: score.overall >= 80 ? '#4ade80' : score.overall >= 50 ? '#f59e0b' : FIRE.primary }}>{score.overall}</span>
            <span style={{ fontSize: 9, color: '#888' }}>Trust Score</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        {breakdownItems.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#aaa', width: 120 }}>{b.label}</span>
            <div style={{ flex: 1, height: 10, background: '#1a1a1a', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${b.val}%`, height: '100%', background: b.color, borderRadius: 5, transition: 'width 1s ease' }} />
            </div>
            <span style={{ fontSize: 11, color: b.color, width: 24, textAlign: 'right', fontWeight: 700 }}>{b.val}</span>
          </div>
        ))}
      </div>

      {/* PANIC BUTTON */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <div style={{ background: '#1a0000', borderRadius: 16, border: `2px solid ${FIRE.dark}`, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: FIRE.light, marginBottom: 12, fontWeight: 700 }}>🚨 EMERGENCY PANIC BUTTON</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>Press and hold for 3 seconds to send a safety alert</div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button onMouseDown={startPanic} onMouseUp={cancelPanic} onMouseLeave={cancelPanic} onTouchStart={startPanic} onTouchEnd={cancelPanic} style={{ width: 100, height: 100, borderRadius: '50%', background: panicProgress > 0 ? FIRE.dark : FIRE.primary, border: `4px solid ${FIRE.light}`, color: '#fff', fontSize: 28, fontWeight: 800, cursor: 'pointer', animation: 'kpanic 1.5s infinite', position: 'relative', zIndex: 2 }}>
              🚨
            </button>
            {panicProgress > 0 && (
              <svg width="116" height="116" style={{ position: 'absolute', top: -8, left: -8, transform: 'rotate(-90deg)', zIndex: 1 }}>
                <circle cx="58" cy="58" r="52" fill="none" stroke={FIRE.light} strokeWidth="4" strokeLinecap="round" strokeDasharray="327" strokeDashoffset={327 - (327 * panicProgress) / 100} />
              </svg>
            )}
          </div>
          {panicProgress > 0 && <div style={{ fontSize: 12, color: FIRE.light, marginTop: 10 }}>Hold... {Math.round(panicProgress)}%</div>}
        </div>
      </div>

      {/* Report Section */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <button onClick={() => setShowReport(!showReport)} style={{ width: '100%', padding: '14px', borderRadius: 10, background: FIRE.card, border: `1px solid ${FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>🚩 Report a User{showReport ? ' ▲' : ' ▼'}</button>

        {showReport && (
          <div style={{ marginTop: 10, padding: 16, background: FIRE.card, borderRadius: 12, border: `1px solid ${FIRE.border}` }}>
            <label style={{ fontSize: 11, color: '#aaa' }}>User Nickname</label>
            <input value={reportTarget} onChange={e => setReportTarget(e.target.value)} placeholder="Enter their display name..." style={{ width: '100%', padding: 12, background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 12, boxSizing: 'border-box' }} />

            <label style={{ fontSize: 11, color: '#aaa' }}>Flag Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 6, marginBottom: 12 }}>
              {FLAG_TYPES.map(ft => (
                <div key={ft.key} onClick={() => setReportType(ft.key)} style={{ padding: '8px 10px', borderRadius: 8, background: reportType === ft.key ? `${FIRE.primary}33` : '#1a1a1a', border: `1px solid ${reportType === ft.key ? FIRE.primary : FIRE.border}`, fontSize: 11, cursor: 'pointer' }}>{ft.icon} {ft.label}</div>
              ))}
            </div>

            <label style={{ fontSize: 11, color: '#aaa' }}>Description</label>
            <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} rows={3} placeholder="Tell us what happened..." style={{ width: '100%', padding: 12, background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 12, resize: 'none', boxSizing: 'border-box' }} />

            <button onClick={submitReport} disabled={!reportTarget} style={{ width: '100%', padding: 12, borderRadius: 8, background: reportTarget ? FIRE.primary : '#333', border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Submit Report</button>
          </div>
        )}
      </div>

      {/* My Flags */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 10px' }}>📋 My Flags</h3>
        {flags.length === 0 ? (
          <div style={{ padding: 20, background: FIRE.card, borderRadius: 10, border: `1px solid ${FIRE.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
            <div style={{ fontSize: 12, color: '#4ade80' }}>No flags on your account. Keep it clean!</div>
          </div>
        ) : (
          flags.map((f: any, i: number) => (
            <div key={i} style={{ padding: 12, background: FIRE.card, borderRadius: 8, border: `1px solid ${FIRE.border}`, marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{FLAG_TYPES.find(t => t.key === f.type)?.icon} {f.type}</span>
                <span style={{ fontSize: 10, color: f.resolved ? '#4ade80' : '#f59e0b' }}>{f.resolved ? 'Resolved' : 'Under Review'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safety Tips */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 10px' }}>💡 Safety Tips</h3>
        {SAFETY_TIPS.map((tip, i) => (
          <div key={i} onClick={() => setExpandedTip(expandedTip === i ? null : i)} style={{ padding: '12px 14px', background: FIRE.card, borderRadius: 10, border: `1px solid ${FIRE.border}`, marginBottom: 6, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{tip.title}</span>
              <span style={{ fontSize: 12, color: '#555' }}>{expandedTip === i ? '▲' : '▼'}</span>
            </div>
            {expandedTip === i && (
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 8, lineHeight: 1.6 }}>{tip.desc}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ padding: '0 16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 10px' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { icon: '🚫', label: 'Block List' },
            { icon: '🔒', label: 'Privacy' },
            { icon: '📞', label: 'Emergency' },
          ].map(q => (
            <div key={q.label} style={{ padding: '14px 10px', background: FIRE.card, borderRadius: 10, border: `1px solid ${FIRE.border}`, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{q.icon}</div>
              <div style={{ fontSize: 10, color: '#aaa' }}>{q.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
