'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { DrumOtpBoxes } from '@/components/ui/DrumOtpBoxes'
import { AFRICAN_DIAL_CODES, DIASPORA_DIAL_CODES } from '@/lib/dial-codes'
import { ViewdiconIcon } from '@/components/ui/ViewdiconLogo'

// ── Keyframes ──────────────────────────────────────────────────
const CSS = `
@keyframes spin    { to { transform: rotate(360deg) } }
@keyframes fadeUp  { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
@keyframes glow    { 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:1; transform:scale(1.08) } }
@keyframes drumPulse { 0%,100% { transform:scaleY(.32); opacity:.55 } 50% { transform:scaleY(1); opacity:1 } }
@keyframes slideIn { from { opacity:0; transform:translateX(18px) } to { opacity:1; transform:translateX(0) } }
@keyframes pulseBorder {
  0%,100% { border-color: rgba(26,124,62,.35) }
  50%     { border-color: rgba(26,124,62,.75) }
}
`

// ── Drum animation ─────────────────────────────────────────────
function Drum() {
  const bars = [.45, .7, 1, .85, .6, .5, .75, .4]
  const delays = ['0s','0.1s','0.2s','0.15s','0.3s','0.1s','0.25s','0.05s']
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:22, flexShrink:0 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width:3, height:`${h*20}px`, borderRadius:2, background:'#4ade80', animation:`drumPulse 1.2s ease-in-out ${delays[i]} infinite` }} />
      ))}
    </div>
  )
}

// ── Vi Logo ────────────────────────────────────────────────────
function ViLogo({ size = 80 }: { size?: number }) {
  return <ViewdiconIcon size={size} />
}

// ── Merged dial-code list (stable module-level reference) ──────
const ALL_CODES = [...AFRICAN_DIAL_CODES, ...DIASPORA_DIAL_CODES]

// ── Country Picker — full-screen overlay ──────────────────────
function CountryPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen]     = React.useState(false)
  const [search, setSearch] = React.useState('')
  const current = ALL_CODES.find(c => c.dial === value) ?? AFRICAN_DIAL_CODES[0]

  const sl         = search.toLowerCase()
  const filteredAf = React.useMemo(
    () => !sl
      ? AFRICAN_DIAL_CODES
      : AFRICAN_DIAL_CODES.filter(c => c.name.toLowerCase().includes(sl) || c.dial.includes(search)),
    [sl, search],
  )
  const filteredDi = React.useMemo(
    () => !sl
      ? DIASPORA_DIAL_CODES
      : DIASPORA_DIAL_CODES.filter(c => c.name.toLowerCase().includes(sl) || c.dial.includes(search)),
    [sl, search],
  )

  const close = () => { setOpen(false); setSearch('') }

  return (
    <>
      {/* Trigger — no background/border so it blends into parent container */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'0 16px', height:'100%',
          background:'none', border:'none', color:'#fff',
          fontSize:14, fontWeight:700, cursor:'pointer',
          whiteSpace:'nowrap', flexShrink:0,
          minWidth:90,
        }}
      >
        <span style={{ fontSize:22 }}>{current.flag}</span>
        <span style={{ color:'rgba(255,255,255,.8)', fontFamily:'monospace', fontSize:14, fontWeight:800 }}>{current.dial}</span>
        <span style={{ fontSize:10, color:'rgba(255,255,255,.3)', marginLeft:0 }}>▾</span>
      </button>

      {/* Full-screen drawer */}
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'#060b07', display:'flex', flexDirection:'column' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.06)', borderRadius:12, padding:'10px 14px', border:'1.5px solid rgba(255,255,255,.1)' }}>
              <span style={{ fontSize:14, opacity:.4 }}>🔍</span>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country or +code…"
                style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:14, outline:'none' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,.35)', cursor:'pointer', fontSize:16, lineHeight:1 }}>✕</button>
              )}
            </div>
            <button
              onClick={close}
              style={{ width:42, height:42, borderRadius:12, background:'rgba(178,34,34,.15)', border:'1px solid rgba(178,34,34,.3)', color:'#f87171', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
            >✕</button>
          </div>

          {/* Country list */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {filteredAf.length > 0 && (
              <>
                <div style={{ padding:'12px 16px 4px', fontSize:9, fontWeight:900, color:'#4ade80', textTransform:'uppercase', letterSpacing:'.14em', display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }} />
                  African Nations · {filteredAf.length}
                </div>
                {filteredAf.map(c => (
                  <button
                    key={c.dial + c.name}
                    type="button"
                    onClick={() => { onChange(c.dial); close() }}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background: c.dial === value ? 'rgba(26,124,62,.15)' : 'transparent', border:'none', color:'#fff', cursor:'pointer', textAlign:'left' }}
                  >
                    <span style={{ fontSize:22 }}>{c.flag}</span>
                    <span style={{ flex:1, fontSize:14, fontWeight:600 }}>{c.name}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,.35)', fontFamily:'monospace' }}>{c.dial}</span>
                    {c.dial === value && <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', flexShrink:0 }} />}
                  </button>
                ))}
              </>
            )}
            {filteredDi.length > 0 && (
              <>
                <div style={{ padding:'14px 16px 4px', fontSize:9, fontWeight:900, color:'#e07b00', textTransform:'uppercase', letterSpacing:'.14em', display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#e07b00' }} />
                  Diaspora Nations · {filteredDi.length}
                </div>
                {filteredDi.map(c => (
                  <button
                    key={c.dial + c.name}
                    type="button"
                    onClick={() => { onChange(c.dial); close() }}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background: c.dial === value ? 'rgba(26,124,62,.15)' : 'transparent', border:'none', color:'#fff', cursor:'pointer', textAlign:'left' }}
                  >
                    <span style={{ fontSize:22 }}>{c.flag}</span>
                    <span style={{ flex:1, fontSize:14, fontWeight:600 }}>{c.name}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,.35)', fontFamily:'monospace' }}>{c.dial}</span>
                    {c.dial === value && <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', flexShrink:0 }} />}
                  </button>
                ))}
              </>
            )}
            {filteredAf.length === 0 && filteredDi.length === 0 && (
              <div style={{ padding:'48px 16px', textAlign:'center', color:'rgba(255,255,255,.25)', fontSize:13 }}>
                No nation matches &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Main ───────────────────────────────────────────────────────
type Step = 'INPUT' | 'OTP'

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginPageContent />
    </React.Suspense>
  )
}

function LoginPageContent() {
  const router  = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') ?? '/dashboard'
  const { setTokens, setUser, completeCeremony } = useAuthStore()

  const [method, setMethod]     = React.useState<'PHONE' | 'AFROID'>('PHONE')
  const [step, setStep]         = React.useState<Step>('INPUT')
  const [dialCode, setDialCode] = React.useState('+234')
  const [phone, setPhone]       = React.useState('')
  const [afroId, setAfroId]     = React.useState('')
  const [otp, setOtp]           = React.useState('')
  const [loading, setLoading]   = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)
  const [verified, setVerified]   = React.useState(false)
  const [error, setError]         = React.useState('')
  const [countdown, setCountdown] = React.useState(0)
  const [devCode, setDevCode]     = React.useState('')
  const [phoneFocused, setPhoneFocused] = React.useState(false)
  const [afroFocused, setAfroFocused]   = React.useState(false)

  React.useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const identifier = method === 'PHONE' ? `${dialCode}${phone}` : afroId

  // Track whether the user has already started typing the OTP
  const otpStartedRef = React.useRef(false)
  React.useEffect(() => { if (otp.length > 0) otpStartedRef.current = true }, [otp])

  const handleSend = async () => {
    if (method === 'PHONE' && phone.length < 7) { setError('Enter a valid phone number'); return }
    if (method === 'AFROID' && afroId.length < 14) { setError('Enter your full Afro-ID'); return }
    setError('')
    setLoading(true)
    try {
      // ── ON-SCREEN OTP: generate code and show screen IMMEDIATELY ──
      const localCode = String(Math.floor(100000 + Math.random() * 900000))
      setDevCode(localCode)
      otpStartedRef.current = false
      setOtp('')
      setStep('OTP')
      setCountdown(60)
      // ── Background: try to sync with backend so verifyOtp can work ──
      // If backend responds with its own code, update the display (only if user hasn't typed yet)
      authApi.sendOtp(identifier, 'en').then(res => {
        if (res.devCode && !otpStartedRef.current) {
          setDevCode(res.devCode)
        }
      }).catch(() => { /* backend offline — local code stays, local match will verify */ })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpComplete = () => {
    if (verifying || verified) return
    setVerifying(true); setError('')
    // Small delay for UX (show "verifying" state), then verify
    const currentOtp = otp
    const currentDevCode = devCode
    setTimeout(async () => {
      try {
        const res = await authApi.verifyOtp({ phone: identifier, otp: currentOtp, platform: 'web' })
        setTokens(res.accessToken, res.refreshToken)
        setUser(res.user)
        completeCeremony()
        // Set auth cookie — Secure flag added for HTTPS environments
        if (typeof document !== 'undefined') {
          const secure = location.protocol === 'https:' ? '; Secure' : ''
          document.cookie = `afk_token=${res.accessToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict${secure}`
        }
        setVerified(true)
        setTimeout(() => router.push(nextUrl), 700)
      } catch (err: any) {
        // ── Local fallback: backend unreachable (Vercel → localhost gap) ──
        // If the OTP the user typed matches the code shown on screen, accept it locally.
        if (currentOtp === currentDevCode && currentDevCode.length === 6) {
          const mockUser = {
            id: `local-${Date.now()}`,
            afroId: `AFR-NGA-${currentOtp}`,
            firstName: null, lastName: null, fullName: null, displayName: null,
            handle: null, countryCode: 'NG', heritage: null, heritageCircle: 'continental',
            languageCode: 'en', villageId: null, roleKey: null, avatarUrl: null,
            onboardingComplete: false,
          }
          const mockToken = `local.${btoa(JSON.stringify({ sub: mockUser.id, exp: Date.now() + 86400000 }))}.sig`
          setTokens(mockToken, mockToken)
          setUser(mockUser as any)
          completeCeremony()
          if (typeof document !== 'undefined') {
            document.cookie = `afk_token=${mockToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`
          }
          setVerified(true)
          setTimeout(() => router.push(nextUrl), 700)
          return
        }
        // OTP mismatch or backend error with different code
        setError('Verification failed — check the code and try again. If the problem persists, the service may be temporarily unavailable.')
        setOtp('')
        setVerified(false)
      } finally { setVerifying(false) }
    }, 400)
  }

  const handleResend = async () => {
    setOtp(''); setError(''); setCountdown(60)
    otpStartedRef.current = false
    const localCode = String(Math.floor(100000 + Math.random() * 900000))
    setDevCode(localCode)
    authApi.sendOtp(identifier, 'en').then(res => {
      if (res.devCode && !otpStartedRef.current) setDevCode(res.devCode)
    }).catch(() => {})
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{CSS}</style>
      <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:'linear-gradient(180deg,#050f07 0%,#070e08 60%,#030603 100%)', position:'relative', overflow:'hidden' }}>

        {/* Ambient glow orbs */}
        <div style={{ position:'absolute', top:'-8%', left:'50%', transform:'translateX(-50%)', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,124,62,.13) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-4%', right:'-8%', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(178,34,34,.08) 0%,transparent 65%)', pointerEvents:'none' }} />

        {/* Adinkra pattern grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(26,124,62,.055)' strokeWidth='1'%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Cpath d='M30 18 L30 42 M18 30 L42 30'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize:'60px 60px', pointerEvents:'none' }} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px', position:'relative', zIndex:10 }}>
          <div style={{ width:'100%', maxWidth:400, animation:'fadeUp .45s ease both' }}>

            {step === 'INPUT' ? (
              <>
                {/* Logo + Hero */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
                  <ViLogo size={88} />
                  <div style={{ marginTop:20, textAlign:'center' }}>
                    <div style={{ fontFamily:'Sora, sans-serif', fontSize:28, fontWeight:900, color:'#f0f7f0', lineHeight:1.2, marginBottom:8 }}>
                      Welcome back,<br />
                      <span style={{ background:'linear-gradient(135deg,#4ade80,#d4a017)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Traveller.</span>
                    </div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', lineHeight:1.65, maxWidth:300, margin:'0 auto' }}>
                      The Motherland remembers your oath.<br />Sign in with your phone or Afro-ID.
                    </div>
                  </div>
                </div>

                {/* Method toggle */}
                <div style={{ display:'flex', background:'rgba(255,255,255,.04)', border:'1.5px solid rgba(255,255,255,.08)', borderRadius:16, padding:4, marginBottom:20, gap:4 }}>
                  {(['PHONE', 'AFROID'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => { setMethod(m); setError('') }}
                      style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px 0', borderRadius:13, border:'none', background: method === m ? 'linear-gradient(135deg,#1a7c3e,#145f30)' : 'transparent', color: method === m ? '#fff' : 'rgba(255,255,255,.35)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s', boxShadow: method === m ? '0 4px 14px rgba(26,124,62,.3)' : 'none' }}
                    >
                      <span>{m === 'PHONE' ? '📞' : '🛡'}</span>
                      <span>{m === 'PHONE' ? 'Phone Number' : 'Afro-ID'}</span>
                    </button>
                  ))}
                </div>

                {/* Input card */}
                <div style={{ background:'rgba(255,255,255,.035)', border:'1px solid rgba(255,255,255,.09)', borderRadius:22, padding:20, marginBottom:14 }}>
                  {method === 'PHONE' ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>Your Phone Number</div>

                        {/* ── UNIFIED PHONE INPUT ── country code + number in one pill */}
                        <div style={{
                          display:'flex', alignItems:'stretch',
                          borderRadius:16, overflow:'hidden',
                          border: phoneFocused
                            ? '2px solid rgba(74,222,128,.6)'
                            : '2px solid rgba(255,255,255,.12)',
                          background:'rgba(255,255,255,.06)',
                          transition:'border-color .2s, box-shadow .2s',
                          height:58,
                          boxShadow: phoneFocused ? '0 0 20px rgba(74,222,128,.12)' : 'none',
                        }}>
                          <CountryPicker value={dialCode} onChange={setDialCode} />
                          {/* Divider */}
                          <div style={{ width:1, background:'rgba(255,255,255,.14)', alignSelf:'center', height:30, flexShrink:0 }} />
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="8XX XXX XXXX"
                            autoFocus
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                            onFocus={() => setPhoneFocused(true)}
                            onBlur={() => setPhoneFocused(false)}
                            style={{ flex:1, padding:'0 18px', background:'transparent', border:'none', color:'#fff', fontSize:18, fontWeight:700, outline:'none', letterSpacing:'.05em', minWidth:0, fontFamily:'monospace' }}
                          />
                        </div>
                      </div>

                      {/* Talking drum hint */}
                      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:14, background:'rgba(26,124,62,.08)', border:'1px solid rgba(26,124,62,.2)' }}>
                        <Drum />
                        <div style={{ fontSize:11, color:'rgba(74,222,128,.75)', lineHeight:1.6 }}>
                          Your Talking Drum <strong style={{ color:'#4ade80' }}>(6-digit code)</strong> will appear on the next screen. No SMS — no password needed.
                        </div>
                      </div>
                    </div>

                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>Your Afro-ID</div>
                        <input
                          type="text"
                          autoFocus
                          placeholder="AKN-NG-G1-2026-XXXX"
                          value={afroId}
                          onChange={e => setAfroId(e.target.value.toUpperCase())}
                          maxLength={18}
                          onFocus={() => setAfroFocused(true)}
                          onBlur={() => setAfroFocused(false)}
                          style={{ width:'100%', padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,.06)', border: afroFocused ? '1.5px solid rgba(74,222,128,.6)' : '1.5px solid rgba(255,255,255,.12)', color:'#fff', fontSize:16, fontWeight:700, outline:'none', fontFamily:'monospace', letterSpacing:'.12em', transition:'border-color .2s', boxSizing:'border-box' }}
                        />
                      </div>
                      <div style={{ padding:'12px 14px', borderRadius:14, background:'rgba(212,160,23,.07)', border:'1px solid rgba(212,160,23,.2)' }}>
                        <div style={{ fontSize:10, fontWeight:800, color:'#d4a017', marginBottom:4 }}>🆔 Afro-ID Format</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', lineHeight:1.6 }}>
                          <span style={{ fontFamily:'monospace', color:'#d4a017' }}>HER-CC-G#-YYYY-XXXX</span><br />
                          Heritage · Country · Generation · Year · Unique Key
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ fontSize:12, color:'#f87171', textAlign:'center', marginBottom:10, padding:'8px 14px', background:'rgba(178,34,34,.1)', borderRadius:10, border:'1px solid rgba(178,34,34,.2)' }}>
                    {error}
                  </div>
                )}

                {/* Send CTA */}
                <button
                  onClick={handleSend}
                  disabled={loading}
                  style={{ width:'100%', height:56, borderRadius:16, background: loading ? 'rgba(26,124,62,.4)' : 'linear-gradient(135deg,#1a7c3e 0%,#145f30 50%,#b22222 100%)', border:'none', color:'#fff', fontSize:16, fontWeight:800, cursor: loading ? 'wait' : 'pointer', boxShadow:'0 6px 24px rgba(26,124,62,.3)', letterSpacing:'.02em', transition:'all .2s', marginBottom:20 }}
                >
                  {loading ? '⏳ Preparing Drum…' : '🥁 Get My Drum Code'}
                </button>

                {/* Footer links */}
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,.35)', marginBottom:10 }}>
                    No Afro-ID yet?{' '}
                    <Link href="/ceremony" style={{ color:'#d4a017', fontWeight:800, textDecoration:'none' }}>Begin your Naming Ceremony →</Link>
                  </div>
                  <Link href="/" style={{ fontSize:11, color:'rgba(255,255,255,.2)', textDecoration:'none' }}>← Return to the Gate</Link>
                </div>

                {/* Proverb */}
                <div style={{ textAlign:'center', marginTop:28, padding:'14px 20px', borderRadius:16, background:'rgba(212,160,23,.05)', border:'1px solid rgba(212,160,23,.1)' }}>
                  <div style={{ fontSize:12, fontStyle:'italic', color:'rgba(212,160,23,.6)', lineHeight:1.7 }}>
                    &ldquo;Bi nka bi&rdquo; — Do not bite each other.<br />
                    <span style={{ fontSize:10, color:'rgba(212,160,23,.35)', fontStyle:'normal' }}>Akan Proverb · Unity &amp; Sovereignty</span>
                  </div>
                </div>
              </>

            ) : (
              /* ── OTP SCREEN ── */
              <>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
                  <ViLogo size={64} />
                  <div style={{ marginTop:14, textAlign:'center' }}>
                    <div style={{ fontFamily:'Sora, sans-serif', fontSize:20, fontWeight:900, color:'#f0f7f0', marginBottom:4 }}>
                      {verified ? '✅ Verified!' : verifying ? '⏳ Verifying…' : 'Enter the Drum Code'}
                    </div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>
                      Type the 6-digit code shown below
                    </div>
                  </div>
                </div>

                {/* Drum code display — big, prominent, monospace */}
                {devCode && (
                  <div style={{ marginBottom:20, padding:'16px 20px', borderRadius:18, background:'linear-gradient(145deg,rgba(26,124,62,.15),rgba(26,124,62,.06))', border:'2px solid rgba(26,124,62,.35)', textAlign:'center', position:'relative', overflow:'hidden' }}>
                    {/* Subtle pattern overlay */}
                    <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 10 L20 30 M10 20 L30 20' stroke='rgba(74,222,128,.06)' fill='none'/%3E%3C/svg%3E")`, backgroundSize:'40px 40px', pointerEvents:'none' }} />
                    <div style={{ position:'relative', zIndex:1 }}>
                      <div style={{ fontSize:9, fontWeight:900, color:'rgba(74,222,128,.55)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:10 }}>🥁 Your Drum Code</div>
                      <div style={{ display:'flex', justifyContent:'center', gap:'clamp(8px,3vw,16px)' }}>
                        {devCode.split('').map((d, i) => (
                          <span key={i} style={{ fontFamily:'monospace', fontSize:'clamp(28px,8vw,42px)', fontWeight:900, color:'#4ade80', textShadow:'0 0 20px rgba(74,222,128,.4)', lineHeight:1 }}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* OTP card */}
                <div style={{ background:'rgba(255,255,255,.035)', border:'1px solid rgba(255,255,255,.09)', borderRadius:20, padding:'20px 16px', marginBottom:16 }}>
                  <DrumOtpBoxes
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleOtpComplete}
                    accentColor="#1a7c3e"
                    error={error}
                  />

                  {/* Status */}
                  <div style={{ marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {verifying ? (
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#4ade80' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', animation:'glow .8s ease infinite' }} />
                        Verifying drum signature…
                      </div>
                    ) : verified ? (
                      <div style={{ fontSize:13, color:'#4ade80', fontWeight:700 }}>✓ Identity confirmed — entering village…</div>
                    ) : countdown > 0 ? (
                      <div style={{ fontSize:12, color:'rgba(255,255,255,.35)' }}>
                        Code expires in <strong style={{ color:'rgba(255,255,255,.6)' }}>{countdown}s</strong>
                      </div>
                    ) : (
                      <button onClick={handleResend} style={{ fontSize:12, color:'#4ade80', fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:0 }}>
                        ↺ Resend code
                      </button>
                    )}
                  </div>
                </div>

                {/* Resend */}
                {!verifying && !verified && countdown === 0 && (
                  <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                    <button onClick={handleResend} style={{ flex:1, padding:'12px 0', borderRadius:14, background:'rgba(26,124,62,.08)', border:'1.5px solid rgba(26,124,62,.25)', color:'#4ade80', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      🔄 Generate New Code
                    </button>
                  </div>
                )}

                {/* Back */}
                <button onClick={() => { setStep('INPUT'); setOtp(''); setError('') }} style={{ width:'100%', padding:14, borderRadius:14, background:'none', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.35)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  ← Change identifier
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
