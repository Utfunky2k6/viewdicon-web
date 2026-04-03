'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ViewdiconLogo } from '@/components/ui/ViewdiconLogo'

// ── CSS injected once ────────────────────────────────────────
const SPLASH_CSS = `

@keyframes orbit  { to { transform: rotate(360deg) } }
@keyframes levitate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(26,124,62,.25)} 50%{box-shadow:0 0 50px rgba(26,124,62,.5)} }
@keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes scale-in { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }

.vi-a1 { animation: fade-up .6s ease both }
.vi-a2 { animation: fade-up .6s .15s ease both }
.vi-a3 { animation: fade-up .6s .28s ease both }
.vi-a4 { animation: fade-up .6s .40s ease both }
.vi-a5 { animation: fade-up .6s .52s ease both }
.vi-a6 { animation: scale-in .5s ease both }

.btn-grad-main {
  width:100%; padding:17px; border:none; border-radius:18px;
  background:linear-gradient(135deg,#1a7c3e,#b22222);
  color:#fff; font-family:'Sora',sans-serif; font-size:16px; font-weight:800;
  cursor:pointer; position:relative; overflow:hidden; letter-spacing:.02em;
  box-shadow:0 6px 24px rgba(26,124,62,.35);
  transition:transform .15s, box-shadow .15s;
}
.btn-grad-main::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(to bottom,rgba(255,255,255,.18),transparent);
  pointer-events:none;
}
.btn-grad-main:active { transform:scale(.97); box-shadow:0 3px 12px rgba(26,124,62,.25) }

.btn-ghost-main {
  width:100%; padding:15px; border-radius:18px;
  border:1.5px solid rgba(255,255,255,.15);
  background:rgba(255,255,255,.04);
  color:#f0f7f0; font-family:'Sora',sans-serif; font-size:15px; font-weight:700;
  cursor:pointer; transition:border-color .2s, background .2s;
  backdrop-filter:blur(6px);
}
.btn-ghost-main:hover { border-color:rgba(255,255,255,.3); background:rgba(255,255,255,.07) }
.btn-ghost-main:active { transform:scale(.97) }
`

function injectCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('vi-splash-css')) return
  const s = document.createElement('style')
  s.id = 'vi-splash-css'
  s.textContent = SPLASH_CSS
  document.head.appendChild(s)
}

// ── Helpers ──────────────────────────────────────────────────
function getTimeData(): { icon: string; word: string; verse: string } {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return { icon: '🌅', word: 'Good Morning',   verse: 'The sun rises on the Motherland' }
  if (h >= 12 && h < 17) return { icon: '☀️',  word: 'Good Afternoon', verse: 'The sun shines bright on our journey' }
  if (h >= 17 && h < 21) return { icon: '🌇', word: 'Good Evening',   verse: 'The day has been fruitful in the village' }
  return                        { icon: '🌙', word: 'Good Night',      verse: 'The Motherland never sleeps' }
}

// ── Logo ─────────────────────────────────────────────────────
function ViLogo() {
  return (
    <div className="vi-a6" style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
      <ViewdiconLogo size={96} />
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter()
  const { icon, word, verse } = getTimeData()

  React.useEffect(() => {
    injectCSS()
    // Redirect authenticated users based on ceremony status
    if (typeof document !== 'undefined') {
      const cookies = document.cookie
      const hasCeremonyDone = cookies.includes('afk_ceremony_done=true') || cookies.includes('afk_ceremony_done=1')
      // Robust token check — cookie name present (not just 'ey' prefix assumption)
      const hasToken = cookies.split(';').some(c => c.trim().startsWith('afk_token=') && c.trim().length > 'afk_token='.length + 5)
      if (hasToken && hasCeremonyDone) {
        router.replace('/dashboard')
      } else if (hasToken && !hasCeremonyDone) {
        // Has a token but hasn't finished ceremony — send back to finish
        router.replace('/ceremony')
      }
    }
  }, [router])

  return (
    <main style={{
      minHeight:'100dvh',
      background:'linear-gradient(180deg, #0a1f0f 0%, #060b07 55%, #0a0a0a 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'10px 6px 40px',
      position:'relative', overflow:'hidden',
    }}>

      {/* Adinkra texture overlay */}
      <div style={{
        position:'fixed', inset:0,
        opacity:.035,
        backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
        backgroundSize:'22px 22px',
        pointerEvents:'none',
      }} />

      {/* Ambient glow */}
      <div style={{
        position:'fixed', top:'-15%', left:'50%', transform:'translateX(-50%)',
        width:480, height:480, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(26,124,62,.18) 0%, transparent 68%)',
        filter:'blur(70px)', pointerEvents:'none', zIndex:0,
      }} />
      <div style={{
        position:'fixed', bottom:'10%', right:'-10%',
        width:280, height:280, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(178,34,34,.1) 0%, transparent 70%)',
        filter:'blur(60px)', pointerEvents:'none', zIndex:0,
      }} />

      {/* Phone-width card */}
      <div style={{
        position:'relative', zIndex:1,
        width:'100%', maxWidth:375,
        display:'flex', flexDirection:'column',
        alignItems:'center', gap:0,
        paddingTop:32,
      }}>
        {/* Logo */}
        <ViLogo />

        {/* Time greeting */}
        <div className="vi-a1" style={{
          fontSize:52, textAlign:'center', marginBottom:8,
          animation:'levitate 4s ease-in-out infinite',
          lineHeight:1,
        }}>
          {icon}
        </div>
        <div className="vi-a1" style={{
          fontFamily:"'Sora',sans-serif",
          fontSize:30, fontWeight:900, color:'#f0f7f0',
          textAlign:'center', lineHeight:1.1, marginBottom:4,
        }}>
          {word}
        </div>
        <div className="vi-a1" style={{
          fontSize:12, color:'#7da882', textAlign:'center',
          fontStyle:'italic', marginBottom:12,
        }}>
          {verse}
        </div>

        {/* Tagline */}
        <div className="vi-a2" style={{
          fontSize:15, fontWeight:700, color:'#f0f7f0',
          textAlign:'center', lineHeight:1.55, marginBottom:18,
          padding:'0 16px',
        }}>
          Where African identity meets{' '}
          <span style={{
            background:'linear-gradient(to right, #1a7c3e, #b22222)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            fontWeight:900,
          }}>
            sovereign technology.
          </span>
        </div>

        {/* Stats row */}
        <div className="vi-a2" style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          background:'rgba(255,255,255,.05)',
          border:'1px solid rgba(255,255,255,.08)',
          borderRadius:14, overflow:'hidden',
          marginBottom:18, width:'100%',
        }}>
          {[
            { v:'54+', l:'Nations' },
            { v:'1B',  l:'Africans' },
            { v:'20',  l:'Villages' },
            { v:'∞',   l:'Purpose' },
          ].map((s, i, arr) => (
            <div key={i} style={{
              padding:'11px 4px', textAlign:'center',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
            }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:'#f0f7f0' }}>{s.v}</div>
              <div style={{ fontSize:9, fontWeight:600, color:'#7da882', letterSpacing:'.06em', textTransform:'uppercase', marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Proverb strip */}
        <div className="vi-a3" style={{
          background:'rgba(212,160,23,.08)',
          border:'1px solid rgba(212,160,23,.2)',
          borderRadius:12, padding:'12px 16px',
          textAlign:'center', marginBottom:22, width:'100%',
        }}>
          <div style={{ fontSize:12, fontStyle:'italic', color:'#d4a017', lineHeight:1.6 }}>
            &ldquo;Ubuntu: I am because we are&rdquo;
          </div>
          <div style={{ fontSize:9, color:'rgba(212,160,23,.4)', marginTop:3, textTransform:'uppercase', letterSpacing:'.07em' }}>
            — African Proverb
          </div>
        </div>

        {/* Primary CTA */}
        <div className="vi-a4" style={{ width:'100%', marginBottom:10 }}>
          <button className="btn-grad-main" onClick={() => router.push('/ceremony')}>
            <span style={{ position:'relative', zIndex:1 }}>Begin the Naming Ceremony →</span>
          </button>
        </div>

        {/* Divider */}
        <div className="vi-a5" style={{ display:'flex', alignItems:'center', gap:10, width:'100%', marginBottom:10 }}>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.08)' }} />
          <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.25)', letterSpacing:'.08em', textTransform:'uppercase' }}>
            Already a citizen?
          </span>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.08)' }} />
        </div>

        {/* Return / Login CTA — preserved exactly from prototype */}
        <div className="vi-a5" style={{ width:'100%', marginBottom:20 }}>
          <button className="btn-ghost-main" onClick={() => router.push('/login')}>
            Return to Your Village
          </button>
        </div>

        {/* Feature pills */}
        <div className="vi-a5" style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:24 }}>
          {['🆔 AfroID','🏘️ 20 Villages','₵ Cowries','📺 Jollof TV','🌳 Family Tree','🦅 Griot AI'].map(f => (
            <span key={f} style={{
              padding:'6px 13px', borderRadius:99,
              background:'rgba(255,255,255,.05)',
              border:'1px solid rgba(255,255,255,.1)',
              fontSize:11, fontWeight:600, color:'#a7f3d0',
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* Trust row */}
        <div style={{ display:'flex', alignItems:'center', gap:14, fontSize:11, color:'#7da882' }}>
          <span>🔒 E2E Encrypted</span>
          <span style={{ opacity:.3 }}>·</span>
          <span>🌍 Africa-first</span>
          <span style={{ opacity:.3 }}>·</span>
          <span>⚡ Low bandwidth</span>
        </div>
      </div>
    </main>
  )
}
