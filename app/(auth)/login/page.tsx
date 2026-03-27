'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { DrumOtpBoxes } from '@/components/ui/DrumOtpBoxes'
import { AFRICAN_DIAL_CODES, DIASPORA_DIAL_CODES } from '@/lib/dial-codes'

// ── Keyframes (module-level — parsed once, never on re-render) ──
const CSS = `
@keyframes spin { to { transform: rotate(360deg) } }
@keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
@keyframes glow { 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:1; transform:scale(1.08) } }
@keyframes drumPulse { 0%,100% { transform:scaleY(.35); opacity:.6 } 50% { transform:scaleY(1); opacity:1 } }
@keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
@keyframes dotPop { 0% { transform:scale(0) } 70% { transform:scale(1.2) } 100% { transform:scale(1) } }
`

// ── Drum animation ─────────────────────────────────────────────
function Drum() {
  const bars = [.45,.7,1,.85,.6,.5,.75,.4]
  const delays = ['0s','0.1s','0.2s','0.15s','0.3s','0.1s','0.25s','0.05s']
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:22 }}>
      {bars.map((h,i) => (
        <div key={i} style={{ width:3, height:`${h*20}px`, borderRadius:2, background:'#4ade80', animation:`drumPulse 1.2s ease-in-out ${delays[i]} infinite` }} />
      ))}
    </div>
  )
}

// ── Vi Logo ────────────────────────────────────────────────────
function ViLogo({ size = 80 }: { size?: number }) {
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      {/* Outer spinning ring */}
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid transparent`, borderTopColor:'#1a7c3e', borderRightColor:'#d4a017', animation:'spin 3s linear infinite', opacity:.8 }} />
      {/* Middle pulsing ring */}
      <div style={{ position:'absolute', inset:6, borderRadius:'50%', border:`1.5px solid rgba(178,34,34,.4)`, animation:'glow 2.5s ease infinite' }} />
      {/* Inner core */}
      <div style={{ position:'absolute', inset:12, borderRadius:'50%', background:'linear-gradient(135deg,rgba(26,124,62,.2),rgba(10,15,7,.9))', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'Sora,sans-serif', fontWeight:900, lineHeight:1 }}>
          <span style={{ color:'#4ade80', fontSize:size*0.28 }}>v</span>
          <span style={{ color:'#ef4444', fontSize:size*0.28 }}>i</span>
        </span>
      </div>
      {/* Glow */}
      <div style={{ position:'absolute', inset:-8, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,124,62,.18) 0%,transparent 70%)', filter:'blur(8px)', pointerEvents:'none' }} />
    </div>
  )
}

// ── Country Picker ─────────────────────────────────────────────
// Merged list — stable reference, computed once at module load
const ALL_CODES = [...AFRICAN_DIAL_CODES, ...DIASPORA_DIAL_CODES]

function CountryPicker({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const current = ALL_CODES.find(c => c.dial === value) ?? AFRICAN_DIAL_CODES[0]

  // useMemo so filter only runs when search actually changes
  const sl = search.toLowerCase()
  const filteredAf = React.useMemo(
    () => !sl ? AFRICAN_DIAL_CODES : AFRICAN_DIAL_CODES.filter(c => c.name.toLowerCase().includes(sl) || c.dial.includes(search)),
    [sl, search]
  )
  const filteredDi = React.useMemo(
    () => !sl ? DIASPORA_DIAL_CODES : DIASPORA_DIAL_CODES.filter(c => c.name.toLowerCase().includes(sl) || c.dial.includes(search)),
    [sl, search]
  )

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'14px 12px', borderRadius:14, background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(255,255,255,.14)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
        <span style={{ fontSize:18 }}>{current.flag}</span>
        <span style={{ color:'rgba(255,255,255,.6)' }}>{current.dial}</span>
        <span style={{ fontSize:10, color:'rgba(255,255,255,.3)' }}>▾</span>
      </button>

      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'#060b07', display:'flex', flexDirection:'column' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.06)', borderRadius:12, padding:'10px 14px', border:'1.5px solid rgba(255,255,255,.1)' }}>
              <span style={{ fontSize:14, opacity:.4 }}>🔍</span>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search country or dial code…" style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:14, outline:'none' }} />
            </div>
            <button onClick={() => { setOpen(false); setSearch('') }} style={{ width:40, height:40, borderRadius:12, background:'rgba(178,34,34,.15)', border:'1px solid rgba(178,34,34,.3)', color:'#f87171', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          {/* List */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {filteredAf.length > 0 && <>
              <div style={{ padding:'12px 16px 6px', fontSize:9, fontWeight:900, color:'#4ade80', textTransform:'uppercase', letterSpacing:'.14em', display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }} /> African Nations · {filteredAf.length}
              </div>
              {filteredAf.map(c => (
                <button key={c.dial+c.name} type="button" onClick={() => { onChange(c.dial); setOpen(false); setSearch('') }} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background: c.dial===value ? 'rgba(26,124,62,.15)' : 'transparent', border:'none', color:'#fff', cursor:'pointer', textAlign:'left' }}>
                  <span style={{ fontSize:22 }}>{c.flag}</span>
                  <span style={{ flex:1, fontSize:14, fontWeight:600 }}>{c.name}</span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,.35)', fontFamily:'monospace' }}>{c.dial}</span>
                  {c.dial === value && <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', flexShrink:0 }} />}
                </button>
              ))}
            </>}
            {filteredDi.length > 0 && <>
              <div style={{ padding:'14px 16px 6px', fontSize:9, fontWeight:900, color:'#e07b00', textTransform:'uppercase', letterSpacing:'.14em', display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#e07b00' }} /> Diaspora Nations · {filteredDi.length}
              </div>
              {filteredDi.map(c => (
                <button key={c.dial+c.name} type="button" onClick={() => { onChange(c.dial); setOpen(false); setSearch('') }} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background: c.dial===value ? 'rgba(26,124,62,.15)' : 'transparent', border:'none', color:'#fff', cursor:'pointer', textAlign:'left' }}>
                  <span style={{ fontSize:22 }}>{c.flag}</span>
                  <span style={{ flex:1, fontSize:14, fontWeight:600 }}>{c.name}</span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,.35)', fontFamily:'monospace' }}>{c.dial}</span>
                  {c.dial === value && <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', flexShrink:0 }} />}
                </button>
              ))}
            </>}
            {filteredAf.length === 0 && filteredDi.length === 0 && (
              <div style={{ padding:'40px 16px', textAlign:'center', color:'rgba(255,255,255,.25)', fontSize:13 }}>No nation matches &ldquo;{search}&rdquo;</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// OtpBoxes replaced by DrumOtpBoxes (imported from @/components/ui/DrumOtpBoxes)

// ── Main ───────────────────────────────────────────────────────
type Step = 'INPUT' | 'OTP'

export default function LoginPage() {
  const router = useRouter()
  const { setTokens, setUser, setCeremonyComplete } = useAuthStore()
  const [method, setMethod] = React.useState<'PHONE'|'AFROID'>('PHONE')
  const [step, setStep] = React.useState<Step>('INPUT')
  const [dialCode, setDialCode] = React.useState('+234')
  const [phone, setPhone] = React.useState('')
  const [afroId, setAfroId] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const [error, setError] = React.useState('')
  const [countdown, setCountdown] = React.useState(0)

  React.useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const identifier = method === 'PHONE' ? `${dialCode}${phone}` : afroId

  const handleSend = async () => {
    if (method === 'PHONE' && phone.length < 7) { setError('Enter a valid phone number'); return }
    if (method === 'AFROID' && afroId.length < 14) { setError('Enter your full Afro-ID'); return }
    setError(''); setLoading(true)
    try { await authApi.sendOtp(identifier, 'en') } catch { /* ok — still show OTP screen */ }
    finally { setLoading(false); setStep('OTP'); setCountdown(60) }
  }

  const handleOtpComplete = () => {
    if (verifying || verified) return
    setVerifying(true); setError('')
    setTimeout(async () => {
      try {
        const res = await authApi.verifyOtp({ phone: identifier, otp, platform: 'web' })
        setTokens(res.accessToken, res.refreshToken)
        setUser(res.user)
        setCeremonyComplete(true)
        if (typeof document !== 'undefined') {
          document.cookie = `afk_token=${res.accessToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        }
        setVerified(true)
        setTimeout(() => router.push('/dashboard'), 700)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Verification failed — check the code and try again'
        setError(msg)
        setOtp('')
        setVerified(false)
      } finally { setVerifying(false) }
    }, 400)
  }


  return (
    <>
      {/* Font links — outside <style> so browser can preload without cascade blocking */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{CSS}</style>
      <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:'linear-gradient(180deg,#050f07 0%,#070e08 60%,#030603 100%)', position:'relative', overflow:'hidden' }}>

        {/* Background glow orbs — pure radial-gradient, zero GPU cost (no blur filter) */}
        <div style={{ position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(26,124,62,.14) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-5%', right:'-10%', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(178,34,34,.09) 0%,transparent 65%)', pointerEvents:'none' }} />

        {/* Adinkra grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(26,124,62,.06)' strokeWidth='1'%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Cpath d='M30 18 L30 42 M18 30 L42 30'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize:'60px 60px', pointerEvents:'none' }} />

        {/* Scroll container */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px', position:'relative', zIndex:10 }}>
          <div style={{ width:'100%', maxWidth:400, animation:'fadeUp .5s ease both' }}>

            {step === 'INPUT' ? (
              <>
                {/* ── Logo + Hero ── */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
                  <ViLogo size={88} />
                  <div style={{ marginTop:20, textAlign:'center' }}>
                    <div style={{ fontFamily:'Sora,sans-serif', fontSize:28, fontWeight:900, color:'#f0f7f0', lineHeight:1.2, marginBottom:8 }}>
                      Welcome back,<br /><span style={{ background:'linear-gradient(135deg,#4ade80,#d4a017)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Traveller.</span>
                    </div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', lineHeight:1.65, maxWidth:300, margin:'0 auto' }}>
                      The Motherland remembers your oath.<br />Sign in with your phone or Afro-ID.
                    </div>
                  </div>
                </div>

                {/* ── Method Toggle ── */}
                <div style={{ display:'flex', background:'rgba(255,255,255,.04)', border:'1.5px solid rgba(255,255,255,.08)', borderRadius:16, padding:4, marginBottom:20, gap:4 }}>
                  {(['PHONE','AFROID'] as const).map(m => (
                    <button key={m} onClick={() => { setMethod(m); setError('') }} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px 0', borderRadius:13, border:'none', background: method===m ? 'linear-gradient(135deg,#1a7c3e,#145f30)' : 'transparent', color: method===m ? '#fff' : 'rgba(255,255,255,.35)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s', boxShadow: method===m ? '0 4px 14px rgba(26,124,62,.3)' : 'none' }}>
                      <span>{m==='PHONE' ? '📵' : '🛡'}</span>
                      <span>{m==='PHONE' ? 'Phone Number' : 'Afro-ID'}</span>
                    </button>
                  ))}
                </div>

                {/* ── Input Card ── */}
                <div style={{ background:'rgba(255,255,255,.035)', border:'1px solid rgba(255,255,255,.09)', borderRadius:22, padding:20, marginBottom:14 }}>
                  {method === 'PHONE' ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>Your Phone Number</div>
                        <div style={{ display:'flex', gap:8 }}>
                          <CountryPicker value={dialCode} onChange={setDialCode} />
                          <input type="tel" inputMode="numeric" autoFocus placeholder="800 000 0000"
                            value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                            style={{ flex:1, padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', fontSize:16, fontWeight:600, outline:'none', letterSpacing:'.04em' }}
                          />
                        </div>
                      </div>
                      {/* Drum info */}
                      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, background:'rgba(26,124,62,.08)', border:'1px solid rgba(26,124,62,.2)' }}>
                        <Drum />
                        <div style={{ fontSize:11, color:'rgba(74,222,128,.75)', lineHeight:1.6 }}>
                          A Talking Drum <strong style={{ color:'#4ade80' }}>(6-digit OTP)</strong> will be sent via SMS in your chosen language. No password. Your phone is your key.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>Your Afro-ID</div>
                        <input type="text" autoFocus placeholder="AKN-NG-G1-2026-XXXX"
                          value={afroId} onChange={e => setAfroId(e.target.value.toUpperCase())} maxLength={18}
                          style={{ width:'100%', padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', fontSize:16, fontWeight:700, outline:'none', fontFamily:'monospace', letterSpacing:'.12em' }}
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

                {error && <div style={{ fontSize:12, color:'#f87171', textAlign:'center', marginBottom:10, padding:'8px 14px', background:'rgba(178,34,34,.1)', borderRadius:10, border:'1px solid rgba(178,34,34,.2)' }}>{error}</div>}

                {/* ── Send CTA ── */}
                <button onClick={handleSend} disabled={loading} style={{ width:'100%', height:56, borderRadius:16, background: loading ? 'rgba(26,124,62,.4)' : 'linear-gradient(135deg,#1a7c3e 0%,#145f30 50%,#b22222 100%)', border:'none', color:'#fff', fontSize:16, fontWeight:800, cursor: loading ? 'wait' : 'pointer', boxShadow:'0 6px 24px rgba(26,124,62,.35)', letterSpacing:'.02em', transition:'all .2s', marginBottom:20 }}>
                  {loading ? '⏳ Sending Drum…' : '🥁 Send My Drum Code'}
                </button>

                {/* ── Footer ── */}
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,.35)', marginBottom:10 }}>
                    No Afro-ID yet?{' '}
                    <Link href="/ceremony" style={{ color:'#d4a017', fontWeight:800, textDecoration:'none' }}>Begin your Naming Ceremony →</Link>
                  </div>
                  <Link href="/" style={{ fontSize:11, color:'rgba(255,255,255,.2)', textDecoration:'none' }}>← Return to the Gate</Link>
                </div>

                {/* ── Proverb ── */}
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
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:28 }}>
                  <ViLogo size={72} />
                  <div style={{ marginTop:18, textAlign:'center' }}>
                    <div style={{ fontFamily:'Sora,sans-serif', fontSize:22, fontWeight:900, color:'#f0f7f0', marginBottom:6 }}>
                      {verified ? '✅ Verified!' : verifying ? '⏳ Verifying…' : 'Enter the Drum Code'}
                    </div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.6 }}>
                      We sent a 6-digit code to<br />
                      <strong style={{ color:'rgba(255,255,255,.7)', fontFamily:'monospace' }}>{identifier}</strong>
                    </div>
                  </div>
                </div>

                {/* OTP card */}
                <div style={{ background:'rgba(255,255,255,.035)', border:'1px solid rgba(255,255,255,.09)', borderRadius:22, padding:24, marginBottom:16 }}>
                  <DrumOtpBoxes value={otp} onChange={setOtp} onComplete={handleOtpComplete} accentColor="#1a7c3e" error={error} />

                  {/* Status bar */}
                  <div style={{ marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
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
                      <button onClick={() => { setStep('INPUT'); setOtp('') }} style={{ fontSize:12, color:'#4ade80', fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:0 }}>
                        ← Resend or change number
                      </button>
                    )}
                  </div>
                </div>

                {/* Resend row */}
                {!verifying && !verified && countdown === 0 && (
                  <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                    {[['📱','Resend SMS'],['📞','Voice Call']].map(([icon,label]) => (
                      <button key={label} onClick={() => { setCountdown(60) }} style={{ flex:1, padding:'11px 0', borderRadius:14, background:'rgba(255,255,255,.04)', border:'1.5px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.55)', fontSize:12, fontWeight:700, cursor:'pointer' }}>{icon} {label}</button>
                    ))}
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
