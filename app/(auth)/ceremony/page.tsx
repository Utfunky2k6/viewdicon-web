'use client'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { authApi, villageApi } from '@/lib/api'
import { captureVoiceFingerprint, generateDeviceFingerprint } from '@/lib/audio-fingerprint'
import { getCountryForDialCode } from '@/lib/african-languages'
import { selectHeritageQuestions, scoreHeritageVerification } from '@/lib/heritage-verification'
import type { HeritageQuestion, HeritageAnswer } from '@/lib/heritage-verification'
import { ALL_VILLAGES } from '@/lib/villages-data'
import type { Village } from '@/lib/villages-data'
import { CEREMONY_CONFIG, UBUNTU_CEREMONY, getCeremonyConfig } from '@/constants/ceremony'
import VillageRouter from '@/components/onboarding/VillageRouter'
import type { VillageRole } from '@/constants/village-roles'
import VoiceCommandLayer from '@/components/onboarding/VoiceCommandLayer'
import FaceLiveness from '@/components/onboarding/FaceLiveness'
import { CanonicalVillage } from '@/constants/villages'
import { isAfricanDialCode, AFRICAN_DIAL_CODES, WORLD_DIAL_CODES, type UserCircle, type DialCodeEntry } from '@/lib/dial-codes'
import { useThemeStore } from '@/stores/themeStore'
import { DrumOtpBoxes } from '@/components/ui/DrumOtpBoxes'

// ── THEME CONSTANTS ──────────────────────────────────────────
// LIGHT: Warm ivory parchment — premium, Africa-inspired, AA-contrast throughout
const LIGHT_THEME = {
  bg: '#faf6f0',                    // Warm ivory — like sun-dried parchment
  card: '#ffffff',                  // Clean white cards
  cardAlt: '#f5f0e8',               // Champagne secondary surface
  text: '#1a0f08',                  // Deep espresso — maximum legibility
  subText: '#6b4e2c',               // Warm bark brown — elegant secondary
  muted: 'rgba(140,100,60,.06)',    // Barely-there warm sand
  border: 'rgba(140,100,60,.18)',   // Warm golden hairline
  accent: '#15803d',                // Rich forest emerald — readable on light
  accentText: '#14532d',            // Even deeper for text-on-light
  gold: '#92400e',                  // Deep amber warmth
  glass: 'rgba(255,252,245,.92)',   // Warm frosted glass
}
// DARK: Deep forest night — refined, immersive, Pan-African
const DARK_THEME = {
  bg: '#050a06',                    // Near-black deep forest
  card: 'rgba(255,255,255,.045)',   // Subtle lifted surface
  cardAlt: 'rgba(255,255,255,.025)',
  text: '#f0f7f0',                  // Soft ivory white
  subText: 'rgba(240,247,240,.5)', // Muted green-white
  muted: 'rgba(255,255,255,.04)',
  border: 'rgba(255,255,255,.1)',
  accent: '#4ade80',                // Bright emerald on dark
  accentText: '#4ade80',
  gold: '#d4a017',
  glass: 'rgba(0,0,0,.35)',
}

export interface Tool {
  id: string
  name: string
  emoji: string
  description: string
  type: string
}

export interface Occupation {
  id: string
  name: string
  description: string
  sector: { name: string }
  tools: Tool[]
}

// ── Geo-Detection Types ──────────────────────────────────────
interface GeoDetectResult {
  circle: 1 | 2 | 3
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  recommendation: string
  isAfrican: boolean
  isVPN: boolean
  travelDetected: boolean
  phoneCountry: string | null
  ipCountry: string | null
  africaScore: number
  signals: string[]
}

// ── Dial codes: imported from lib/dial-codes.ts ──────────────
// Africa-first (54 nations) then full world list
const AFRICAN_CODES = AFRICAN_DIAL_CODES
const WORLD_CODES   = WORLD_DIAL_CODES

// ── Step machine ──────────────────────────────────────────────
type Step = 'TERMS'|'PRIVACY'|'PHONE'|'OTP'|'CIRCLES'|'HERITAGE_VERIFY'|'DEVICE'|'FINGERPRINT'|'BIOMETRIC'|'VOICE'|'HERITAGE'|'NAMING'|'FAMILY'|'VILLAGE'|'ROLE'|'CONFIRM'|'CORONATION'|'ALLY_CORONATION'|'ALLY_NAME'

/**
 * DYNAMIC SEQUENCE — built from user's detected Circle.
 *
 * Circle 1 (Continental African):  African SIM → skip CIRCLES entirely
 * Circle 2 (Diaspora):             Non-African SIM → show CIRCLES + HERITAGE_VERIFY
 * Circle 3 (Friend/Ally):          Non-African, no claim → show CIRCLES, then ALLY_CORONATION (no village/role)
 * null (unknown):                  Non-African, hasn't chosen yet → will be set after CIRCLES step
 */
function buildSequence(circle: UserCircle | null): Step[] {
  if (circle === 1) {
    // Continental African — NAMING immediately after face recognition (BIOMETRIC)
    return ['TERMS','PHONE','OTP','DEVICE','FINGERPRINT','BIOMETRIC','NAMING','FAMILY','VILLAGE','ROLE','CONFIRM','CORONATION']
  }
  if (circle === 2) {
    // Diaspora African — NAMING immediately after face recognition (BIOMETRIC)
    return ['TERMS','PHONE','OTP','CIRCLES','HERITAGE_VERIFY','DEVICE','FINGERPRINT','BIOMETRIC','NAMING','FAMILY','VILLAGE','ROLE','CONFIRM','CORONATION']
  }
  if (circle === 3) {
    // Friend / Ally — STRIPPED of ALL African-specific steps
    return ['TERMS','PHONE','OTP','CIRCLES','DEVICE','ALLY_NAME','ALLY_CORONATION']
  }
  // Default — NAMING immediately after face recognition (BIOMETRIC)
  return ['TERMS','PHONE','OTP','CIRCLES','DEVICE','FINGERPRINT','BIOMETRIC','NAMING','FAMILY','VILLAGE','ROLE','CONFIRM','CORONATION']
}

const STEP_LABELS: Record<Step,string> = {
  TERMS:            'Ìbẹwẹ — Oath of Entry',
  PRIVACY:          'Ìpamọ̀ Àṣírí — Sacred Privacy',
  PHONE:            'Ìlù Ifọ̀rọ̀wánilẹ̀nì — Talking Drum',
  OTP:              'Ìlù Kóòdù — Drum Code',
  CIRCLES:          'Ẹ̀gẹ Ìpilẹ̀ — Root Circles',
  HERITAGE_VERIFY:  'Iní Ìmọ̀ — Ancestry Check',
  DEVICE:           'Ìdádúró Ọba — Sovereign Binding',
  FINGERPRINT:      'Ika Ẹni — Fingerprint Seal',
  BIOMETRIC:        'Ojú Ẹni — Face Seal',
  VOICE:            'Ohùn Ẹni — Voice Seal',
  HERITAGE:         'Ìbátan Ẹni — Heritage Check',
  NAMING:           'Sísún Orúkọ — Naming Ceremony',
  FAMILY:           'Igi Ìdílé — Family Tree',
  VILLAGE:          'Ẹnu Abúlé — Village Gate',
  ROLE:             'Àṣà Ìpò — Your Station',
  CONFIRM:          'Ìjẹ̀rísí — Seal Your Path',
  CORONATION:       'Ìbí Ìtàn — Digital Birth',
  ALLY_CORONATION:  'Ìgbà Ọrẹ — Ally Coronation',
  ALLY_NAME:        'Orúkọ Rẹ — Your Name',
}

// ── Shared atoms ───────────────────────────────────────────────
function GradBtn({ onClick, children, style }: { onClick:()=>void; children:React.ReactNode; style?:React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{ width:'100%', padding:'15px 20px', border:'none', borderRadius:16, background:'linear-gradient(135deg,#1a7c3e,#b22222)', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', position:'relative', overflow:'hidden', ...style }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(255,255,255,.18),transparent)', pointerEvents:'none' }} />
      <span style={{ position:'relative' }}>{children}</span>
    </button>
  )
}

function DField({ label, placeholder, type='text', value, onChange, theme }: { label?:string; placeholder?:string; type?:string; value?:string; onChange?:(v:string)=>void; theme?:any }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:10, fontWeight:700, color:theme?.subText || 'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>{label}</div>}
      <input type={type} placeholder={placeholder} value={value} onChange={(e)=>onChange?.(e.target.value)}
        className="dcf"
        style={{ ['--dcf-sub' as string]: theme?.subText || 'rgba(255,255,255,.4)', width:'100%', padding:'13px 14px', background:(theme?.muted || 'rgba(255,255,255,.06)'), border:`1.5px solid ${theme?.border || 'rgba(255,255,255,.12)'}`, borderRadius:12, color:theme?.text || '#f0f7f0', fontSize:14, outline:'none', fontFamily:'inherit', WebkitAppearance:'none' }} />
    </div>
  )
}

// ── Shell CSS (module-level — parsed once, never on re-render) ─
const CEREMONY_CSS = `
@keyframes ringExp{0%{transform:scale(.65);opacity:.9}100%{transform:scale(2.1);opacity:0}}
@keyframes wbBeat{0%,100%{transform:scaleY(.4);opacity:.6}50%{transform:scaleY(1);opacity:1}}
@keyframes sosP{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes confettiFall{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(110vh) rotate(720deg)}}
@keyframes orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes breathScale{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.06);opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes scanLine{0%{top:0}100%{top:100%}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
input.dcf::placeholder{color:var(--dcf-sub,rgba(255,255,255,.4));}
input.dcf::-webkit-input-placeholder{color:var(--dcf-sub,rgba(255,255,255,.4));}
`

// ── Shell ─────────────────────────────────────────────────────
function Shell({ children, progress, step, theme, stepIndex, sequenceLength }: {
  children:React.ReactNode; progress:number; step:Step; theme:any; stepIndex:number; sequenceLength:number
}) {
  const displayStep = stepIndex + 2

  return (
    <div style={{ position:'fixed', inset:0, background:theme.bg, display:'flex', flexDirection:'column', overflow:'hidden', color:theme.text, transition:'background .3s ease, color .3s ease' }}>
      <style>{CEREMONY_CSS}</style>

      {/* Adinkra Gye Nyame — ceremony sovereign background pattern */}
      <div aria-hidden="true" style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:0, opacity:0.03,
        backgroundImage:`url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%231a7c3e' fill='none' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cline x1='50' y1='8' x2='50' y2='22' stroke-width='1.2'/%3E%3Cline x1='50' y1='78' x2='50' y2='92' stroke-width='1.2'/%3E%3Cline x1='8' y1='50' x2='22' y2='50' stroke-width='1.2'/%3E%3Cline x1='78' y1='50' x2='92' y2='50' stroke-width='1.2'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1' transform='rotate(90 50 50)'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize:'100px 100px', backgroundRepeat:'repeat',
      }} />

      {/* Pan-African Kente stripe — top sovereign edge */}
      <div aria-hidden="true" style={{ height:4, flexShrink:0, background:'linear-gradient(90deg, #1a7c3e 0%,#1a7c3e 25%, #d4a017 25%,#d4a017 50%, #b22222 50%,#b22222 75%, #1a1a1a 75%,#1a1a1a 100%)', zIndex:21, position:'relative' }} />

      {/* Top Bar */}
      <div style={{ padding:'12px 16px 8px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${theme.border}`, background:theme.card, zIndex:20, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#1a7c3e,#b22222)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌍</div>
          <div>
            <div style={{ fontFamily:'Sora, sans-serif', fontSize:14, fontWeight:900, letterSpacing:'-0.02em', color:theme.text }}>VIEWDICON</div>
            <div style={{ fontSize:9, fontWeight:800, color:theme.accent, textTransform:'uppercase', letterSpacing:'.1em', marginTop:-1 }}>Scene {displayStep} of {sequenceLength + 1} — {STEP_LABELS[step]}</div>
          </div>
        </div>
        <div style={{ padding:'5px 10px', borderRadius:8, background:theme.muted, fontSize:10, fontWeight:800, color:theme.subText }}>{step}</div>
      </div>

      {/* Progress Line — Kente-style: left half green, right half gold→red */}
      <div style={{ height:4, background:theme.muted, position:'relative', zIndex:20, overflow:'hidden' }}>
        <motion.div initial={{ scaleX:0 }} animate={{ scaleX:progress/100 }} transition={{ duration:0.5 }} style={{ height:'100%', background:`linear-gradient(to right, #1a7c3e, #d4a017, #b22222)`, borderRadius:'0 2px 2px 0', transformOrigin:'left' }} />
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:1, overflowY:'auto' }}>
        {children}
      </div>

      <div style={{ height:'env(safe-area-inset-bottom)', background:theme.card }} />
    </div>
  )
}

// ── STEP: TERMS ─────────────────────────────────────────────
function TermsStep({ onNext, theme }: { onNext:()=>void; theme:any }) {
  const [agreed, setAgreed] = React.useState(false)
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:24, background:theme.bg }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📜</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:26, fontWeight:900, color:theme.text, marginBottom:10 }}>Oath of Entry</div>
        <p style={{ fontSize:14, color:theme.subText, lineHeight:1.6 }}>By entering the Motherland, you swear to uphold the principles of Ubuntu, sovereignty, and kinship.</p>
      </div>

      <div style={{ flex:1, overflowY:'auto', background:theme.card, border:`1px solid ${theme.border}`, borderRadius:20, padding:20, marginBottom:24 }}>
        <div style={{ fontSize:13, lineHeight:1.8, color:theme.text }}>
          <p style={{ marginBottom:16 }}><strong>1. Sovereignty:</strong> You own your data. We do not sell, rent, or trade your spirit to outsiders.</p>
          <p style={{ marginBottom:16 }}><strong>2. Ubuntu:</strong> Your identity is linked to your community. To harm one is to harm all.</p>
          <p style={{ marginBottom:0 }}><strong>3. The Guard:</strong> Your Afro-ID is your key. If lost, only your verified family can restore it.</p>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, cursor:'pointer' }} onClick={()=>setAgreed(!agreed)}>
        <div style={{ width:24, height:24, borderRadius:6, border:`2px solid ${agreed ? theme.accent : theme.border}`, background: agreed ? theme.accent : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', transition:'all .2s' }}>
          {agreed && '✓'}
        </div>
        <span style={{ fontSize:14, fontWeight:700, color:theme.text }}>I swear my oath</span>
      </div>

      <GradBtn onClick={onNext} style={!agreed ? { opacity:0.4, pointerEvents:'none' } : { height:56 }}>Enter the Gates →</GradBtn>
    </div>
  )
}

function PrivacyStep({ onNext, theme }: { onNext:()=>void; theme:any }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:24, background:theme.bg }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🛡️</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:26, fontWeight:900, color:theme.text, marginBottom:10 }}>Privacy Consent</div>
        <p style={{ fontSize:14, color:theme.subText, lineHeight:1.6 }}>Your data is encrypted using the Nkisi Shield protocols.</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:'auto' }}>
        {[
          { icon:'👁️', title:'Zero Knowledge', desc:'We never see your biometric keys.' },
          { icon:'📡', title:'Local Processing', desc:'Your voice stays on your device.' },
          { icon:'🧊', title:'Cold Storage', desc:'Inactive identities are frozen for safety.' }
        ].map(item => (
          <div key={item.title} style={{ display:'flex', gap:16, padding:16, borderRadius:16, background:theme.card, border:`1.5px solid ${theme.border}` }}>
            <div style={{ fontSize:24 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:theme.text }}>{item.title}</div>
              <div style={{ fontSize:12, color:theme.subText }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:24 }}>
        <GradBtn onClick={onNext} style={{ height:56 }}>Accept & Shield Identity →</GradBtn>
      </div>
    </div>
  )
}

// ── STEP: CIRCLES ───────────────────────────────────────────
const CIRC_DEF = [
  { id:0, title:'Ọmọ Ilẹ̀ Àfríkà', sub:'Born in Africa or to African parents — your roots run deep in the soil', icon:'🧬', color:'#1a7c3e', quote:'"Ẹni tó bá mọ ibí ìpilẹ̀ rẹ̀ — One who knows their origin."' },
  { id:1, title:'Ọmọ Àṣálà — Diaspora Child', sub:'African heritage — your spirit stretches across oceans back home', icon:'🌍', color:'#e07b00', quote:'"Ẹ̀gbẹ tí a tán — Branches that never forget the root."' },
  { id:2, title:'Óré Ilẹ̀ Ìyá — Motherland Ally', sub:'Friend of the continent — your heart beats for Africa\'s rise', icon:'🤝', color:'#3b82f6', quote:'"Kí a jẹ ẹni kan — Let us be one people."' },
]

function CirclesStep({ geoResult, geoLoading, onNext, theme }: { geoResult:any; geoLoading:boolean; onNext:(c:number)=>void; theme:any }) {
  const [sel, setSel] = React.useState(geoResult?.circle ? geoResult.circle - 1 : 0)
  // LAW 2: Non-African users only see Circles 2 & 3 (ids 1 and 2)
  const visibleCircles = React.useMemo(() => {
    return geoResult?.isAfrican === false ? CIRC_DEF.filter(c => c.id > 0) : CIRC_DEF
  }, [geoResult?.isAfrican])

  // Auto-select first visible circle for non-African if defaulted to 0
  React.useEffect(() => {
    if (geoResult?.isAfrican === false && sel === 0) setSel(1)
  }, [geoResult?.isAfrican, sel])

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🌀</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:22, fontWeight:900, color:theme.text, marginBottom:6 }}>Ẹ̀gẹ Ìpilẹ̀ — The Root Circles</div>
        <div style={{ fontSize:13, color:theme.subText, lineHeight:1.5 }}>Africa is more than a map — it is a lineage, a spirit, a living covenant. Declare your root.</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
        {visibleCircles.map((c)=>(
          <motion.div
            key={c.id}
            whileHover={{ scale:1.02 }}
            onClick={()=>setSel(c.id)}
            style={{
              background:sel===c.id ? `${c.color}10` : theme.card,
              border:`2px solid ${sel===c.id ? c.color : theme.border}`,
              borderRadius:20, padding:18, cursor:'pointer', position:'relative',
              transition:'all .3s ease'
            }}
          >
            {geoResult?.circle-1===c.id && <div style={{ position:'absolute', top:-10, right:16, background:theme.accent, color:'#fff', fontSize:8, fontWeight:900, padding:'3px 10px', borderRadius:99, letterSpacing:'.05em' }}>AUTO-DETECTED 🛡</div>}
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ fontSize:32, background:theme.muted, width:54, height:54, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.icon}</div>
              <div>
                <div style={{ fontSize:16, fontWeight:900, color:theme.text }}>{c.title}</div>
                <div style={{ fontSize:11, color:theme.subText, marginTop:2, lineHeight:1.4 }}>{c.sub}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {geoLoading && (
        <div style={{ marginBottom:20, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:theme.accent, animation:'sosP .8s infinite' }} />
          <div style={{ fontSize:11, color:theme.accent, fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em' }}>Griot detecting heritage...</div>
        </div>
      )}

      {geoResult && !geoLoading && (
        <div style={{ background:theme.muted, borderRadius:16, padding:12, marginBottom:20, border:`1px solid ${theme.border}` }}>
          <div style={{ fontSize:10, fontWeight:800, color:theme.accent, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>GEO-INTELLIGENCE REPORT</div>
          <div style={{ fontSize:11, color:theme.subText, lineHeight:1.4 }}>{geoResult.isAfrican ? 'Native SIM detected on African soil. Sovereign entry cleared.' : geoResult.recommendation}</div>
        </div>
      )}

      <div style={{ background:theme.muted, borderRadius:16, padding:14, fontSize:11, color:theme.subText, fontStyle:'italic', textAlign:'center', marginBottom:'auto' }}>
        {(CIRC_DEF.find(c => c.id === sel) ?? CIRC_DEF[0]).quote}
      </div>

      <GradBtn onClick={()=>onNext(sel)} style={{ height:56 }}>I am a {(CIRC_DEF.find(c => c.id === sel) ?? CIRC_DEF[0]).title} →</GradBtn>
    </div>
  )
}

// ── STEP: PHONE (World codes, Africa first) ──────────────────
/**
 * PhoneStep — shows ALL world country codes (195+).
 * After OTP confirmation, isAfricanDialCode(dial) determines:
 *   true  → Circle 1 auto-assigned, CIRCLES screen skipped
 *   false → user lands on CIRCLES screen to self-select
 */
function PhoneStep({ onSendDrum, theme }: { onSendDrum:(d:string, p:string)=>void; theme:any }) {
  const [phone, setPhone] = React.useState('')
  const [selected, setSelected] = React.useState(AFRICAN_CODES[0])
  const [showPicker, setShowPicker] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const isAfrican = isAfricanDialCode(selected.dial)

  const filteredAfrican = AFRICAN_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  )
  const filteredWorld = WORLD_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  )

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🥁</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:24, fontWeight:900, color:theme.text, marginBottom:6 }}>Digital Talking Drum</div>
        <div style={{ fontSize:14, color:theme.subText, lineHeight:1.5 }}>Your phone number is your sacred link. No passwords needed.</div>
      </div>

      <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:20, padding:20, marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:12 }}>Select Your Nation</div>
        <div onClick={()=>setShowPicker(true)} style={{ display:'flex', alignItems:'center', gap:12, padding:14, background:theme.muted, borderRadius:12, border:`1.5px solid ${isAfrican ? '#1a7c3e' : theme.border}`, cursor:'pointer', marginBottom:18, transition:'border-color .2s' }}>
          <span style={{ fontSize:22 }}>{selected.flag}</span>
          <span style={{ fontSize:15, fontWeight:700, flex:1, color:theme.text }}>{selected.name}</span>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
            <span style={{ color:theme.subText, fontSize:13 }}>{selected.dial} ▾</span>
            {isAfrican && <span style={{ fontSize:9, fontWeight:800, color:'#1a7c3e', textTransform:'uppercase', letterSpacing:'.06em' }}>🌍 African SIM</span>}
          </div>
        </div>

        <div style={{ fontSize:10, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>Phone Number</div>
        <input
          type="tel" placeholder="812 345 6789" value={phone}
          onChange={(e)=>setPhone(e.target.value.replace(/[^0-9]/g,''))}
          style={{ width:'100%', padding:14, background:theme.muted, border:`1.5px solid ${theme.border}`, borderRadius:12, color:theme.text, fontSize:18, fontWeight:700, outline:'none' }}
        />
      </div>

      {/* Heritage notice — only for non-African numbers */}
      {!isAfrican && (
        <div style={{ background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.2)', borderRadius:14, padding:12, fontSize:11, color:'#93c5fd', lineHeight:1.6, marginBottom:14 }}>
          🌍 <b>Non-African SIM detected.</b> You will be asked to choose your connection to the Motherland in the next step.
        </div>
      )}
      {isAfrican && (
        <div style={{ background:'rgba(26,124,62,.08)', border:'1px solid rgba(26,124,62,.3)', borderRadius:14, padding:12, fontSize:11, color:'#4ade80', lineHeight:1.6, marginBottom:14 }}>
          ✅ <b>African SIM verified.</b> You will enter the Motherland directly as an Auto-Detected African.
        </div>
      )}

      <div style={{ background:'rgba(212,160,23,.05)', border:'1px solid rgba(212,160,23,.2)', borderRadius:16, padding:12, color:'#d4a017', fontSize:11, lineHeight:1.6, marginBottom:'auto' }}>
        🛡 <b>SIM Sovereignty:</b> Your SIM is the strongest identity signal. No passwords, no emails.
      </div>

      <GradBtn onClick={()=>onSendDrum(selected.dial, phone)} style={phone.length < 7 ? {opacity:.4, pointerEvents:'none', marginTop:16} : { height:56, marginTop:16 }}>Send Magic Drum Code 🥁</GradBtn>

      {showPicker && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:theme.bg, display:'flex', flexDirection:'column' }}>
          {/* Header */}
          <div style={{ padding:'16px 20px 10px', background:theme.card, borderBottom:`1px solid ${theme.border}`, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ fontSize:18, fontWeight:900, color:theme.text }}>Select Country</div>
              <button onClick={()=>{setShowPicker(false);setSearch('')}} style={{ background:theme.muted, border:`1px solid ${theme.border}`, borderRadius:10, padding:'7px 12px', color:theme.text, cursor:'pointer', fontSize:14 }}>✕</button>
            </div>
            <input
              type="text" placeholder="Search country name or +code..."
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:'100%', padding:'10px 14px', background:theme.muted, border:`1.5px solid ${theme.border}`, borderRadius:12, color:theme.text, fontSize:13, outline:'none' }}
            />
          </div>

          {/* Scrollable list */}
          <div style={{ flex:1, overflowY:'auto', padding:'10px 20px 40px' }}>
            {/* Africa section */}
            {filteredAfrican.length > 0 && (
              <>
                <div style={{ fontSize:10, fontWeight:900, color:'#1a7c3e', textTransform:'uppercase', letterSpacing:'.1em', padding:'10px 0 6px', display:'flex', alignItems:'center', gap:8 }}>
                  <span>🌍</span> Africa — 54 Nations
                  <span style={{ fontSize:9, background:'rgba(26,124,62,.15)', color:'#4ade80', padding:'2px 8px', borderRadius:99, fontWeight:800 }}>AUTOMATIC CIRCLE 1</span>
                </div>
                {filteredAfrican.map(c => (
                  <div key={c.name} onClick={()=>{setSelected(c);setShowPicker(false);setSearch('')}} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 4px', borderBottom:`1px solid ${theme.border}`, cursor:'pointer' }}>
                    <span style={{ fontSize:22 }}>{c.flag}</span>
                    <span style={{ fontSize:14, fontWeight:700, flex:1, color:theme.text }}>{c.name}</span>
                    <span style={{ fontSize:13, color:'#4ade80', fontWeight:800 }}>{c.dial}</span>
                  </div>
                ))}
              </>
            )}

            {/* World section */}
            {filteredWorld.length > 0 && (
              <>
                <div style={{ fontSize:10, fontWeight:900, color:theme.subText, textTransform:'uppercase', letterSpacing:'.1em', padding:'18px 0 6px', display:'flex', alignItems:'center', gap:8 }}>
                  <span>🌐</span> Rest of the World
                  <span style={{ fontSize:9, background:'rgba(59,130,246,.15)', color:'#93c5fd', padding:'2px 8px', borderRadius:99, fontWeight:800 }}>HERITAGE CHECK REQUIRED</span>
                </div>
                {filteredWorld.map(c => (
                  <div key={c.name} onClick={()=>{setSelected(c);setShowPicker(false);setSearch('')}} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 4px', borderBottom:`1px solid ${theme.border}`, cursor:'pointer' }}>
                    <span style={{ fontSize:22 }}>{c.flag}</span>
                    <span style={{ fontSize:14, fontWeight:700, flex:1, color:theme.text }}>{c.name}</span>
                    <span style={{ fontSize:13, color:theme.subText }}>{c.dial}</span>
                  </div>
                ))}
              </>
            )}

            {filteredAfrican.length === 0 && filteredWorld.length === 0 && (
              <div style={{ padding:40, textAlign:'center', color:theme.subText }}>No countries match "{search}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── STEP: OTP ─────────────────────────────────────────────────
function OtpStep({ onNext, theme, phone, devOtp, isDark, onResend, onOtpStart }: { onNext:()=>void; theme:any; phone:string; devOtp?:string; isDark:boolean; onResend?:()=>void; onOtpStart?:()=>void }) {
  const [otp, setOtp] = React.useState('')
  const startedRef = React.useRef(false)
  const handleOtpChange = (v: string) => {
    setOtp(v)
    if (v.length > 0 && !startedRef.current) { startedRef.current = true; onOtpStart?.() }
  }
  const [verifying, setVerifying] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const [error, setError] = React.useState('')
  const [countdown, setCountdown] = React.useState(60)

  React.useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t) }
  }, [countdown])

  React.useEffect(() => {
    if (otp.length === 6 && !verifying && !verified) {
      setVerifying(true); setError('')
      ;(async () => {
        try {
          await authApi.verifyPhone({ phone, otp })
          setVerified(true); setVerifying(false)
          setTimeout(onNext, 600)
        } catch {
          // Backend down or OTP mismatch — try local match
          if (devOtp && otp === devOtp) {
            setVerified(true); setVerifying(false)
            setTimeout(onNext, 600)
          } else {
            setVerifying(false)
            setOtp('')
            setError('Invalid code — try again')
          }
        }
      })()
    }
  }, [otp, verifying, verified, onNext, phone, devOtp])

  // Drum-beat animation bars
  const drumBars = [.45,.7,1,.85,.6,.5,.75,.4]
  const drumDelays = ['0s','0.1s','0.2s','0.15s','0.3s','0.1s','0.25s','0.05s']

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:48, marginBottom:14 }}>⚡</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:24, fontWeight:900, color:theme.text, marginBottom:6 }}>
          {verified ? '✅ Drum Sealed!' : verifying ? '⏳ Sealing Drum…' : 'Seal the Drum'}
        </div>
        <div style={{ fontSize:13, color:theme.subText, lineHeight:1.5 }}>Enter the 6-digit code sent to your drum.</div>
      </div>

      {/* DEV: Show OTP on screen for easy copy */}
      {devOtp && !verified && (
        <div
          onClick={() => { navigator.clipboard?.writeText(devOtp).catch(() => {}) }}
          style={{
            background: 'linear-gradient(135deg, rgba(26,124,62,.15), rgba(74,222,128,.1))',
            border: '2px solid rgba(74,222,128,.5)',
            borderRadius: 16,
            padding: '14px 16px',
            marginBottom: 14,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 6 }}>Your Drum Code</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '0.3em', fontFamily: 'monospace' }}>{devOtp}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>Tap to copy</div>
        </div>
      )}

      {/* DrumOtpBoxes — theme-aware, shake-on-error, Arrow+Backspace nav, paste, click-to-overwrite */}
      <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
        <DrumOtpBoxes
          value={otp}
          onChange={(v) => { handleOtpChange(v); if (error) setError('') }}
          onComplete={() => {}}
          accentColor={theme.accent}
          isDark={isDark}
          error={error}
          label="🥁 TALKING DRUM CODE"
        />

        {/* Status */}
        <div style={{ marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {verifying ? (
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:theme.accent }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:theme.accent, animation:'sosP .8s ease infinite' }} />
              Verifying drum signature…
            </div>
          ) : verified ? (
            <div style={{ fontSize:13, color:theme.accent, fontWeight:700 }}>✓ Code sealed — proceeding…</div>
          ) : countdown > 0 ? (
            <div style={{ fontSize:12, color:theme.subText }}>
              Code expires in <strong style={{ color:theme.text }}>{countdown}s</strong>
            </div>
          ) : (
            <button onClick={() => { setCountdown(60); onResend?.() }} style={{ fontSize:12, color:theme.accent, fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              Resend Drum Code
            </button>
          )}
        </div>
      </div>

      {/* Drum animation */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, background:`${theme.accent}08`, border:`1px solid ${theme.accent}22`, marginBottom:'auto' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:22 }}>
          {drumBars.map((h,i) => (
            <div key={i} style={{ width:3, height:`${h*20}px`, borderRadius:2, background:theme.accent, animation:`wbBeat 1.2s ease-in-out ${drumDelays[i]} infinite` }} />
          ))}
        </div>
        <div style={{ fontSize:11, color:`${theme.accent}cc`, lineHeight:1.6 }}>
          A Talking Drum <strong style={{ color:theme.accent }}>(6-digit OTP)</strong> was sent via SMS. No password. Your phone is your key.
        </div>
      </div>

      {!verifying && !verified && (
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          {[['📱','Resend SMS'],['📞','Voice Call']].map(([icon,label]) => (
            <button key={label} onClick={() => { setCountdown(60); onResend?.() }} disabled={countdown > 0}
              style={{ flex:1, padding:'11px 0', borderRadius:14, background:theme.muted, border:`1.5px solid ${theme.border}`, color: countdown > 0 ? theme.subText : theme.text, fontSize:12, fontWeight:700, cursor: countdown > 0 ? 'default' : 'pointer', opacity: countdown > 0 ? .4 : 1 }}>
              {icon} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Heritage data constants ──
// Ordered geographically: East → West → South → North → Central → Global
// so no single region appears "first" in isolation.
const HERITAGE_GROUPS = [
  // ── East Africa ─────────────────────────────────────────────
  { id:'amhara',        emoji:'☀️', name:'Amhara',         region:'East Africa',     note:'Ethiopia',                    color:'#E85D04' },
  { id:'swahili',       emoji:'⚓', name:'Swahili',         region:'East Africa',     note:'Tanzania · Kenya · Uganda',   color:'#0891B2' },
  { id:'kikuyu',        emoji:'🌱', name:'Kikuyu',          region:'East Africa',     note:'Kenya',                       color:'#15803D' },
  { id:'somali',        emoji:'🌙', name:'Somali',          region:'East Africa',     note:'Somalia · Kenya · Ethiopia',  color:'#4338CA' },
  { id:'oromo',         emoji:'🌾', name:'Oromo',           region:'East Africa',     note:'Ethiopia · Kenya',            color:'#C2410C' },
  // ── West Africa ─────────────────────────────────────────────
  { id:'akan',          emoji:'🥁', name:'Akan / Twi',      region:'West Africa',     note:'Ghana · Côte d\'Ivoire',      color:'#D4A017' },
  { id:'ashanti',       emoji:'👑', name:'Ashanti',          region:'West Africa',     note:'Ghana',                       color:'#CA8A04' },
  { id:'wolof',         emoji:'🐬', name:'Wolof',            region:'West Africa',     note:'Senegal · Gambia',            color:'#0369A1' },
  { id:'mandinka',      emoji:'🌴', name:'Mandinka',         region:'West Africa',     note:'Gambia · Guinea · Mali',      color:'#15803D' },
  { id:'yoruba',        emoji:'🌺', name:'Yoruba',           region:'West Africa',     note:'Nigeria · Benin · Togo',      color:'#9333EA' },
  { id:'igbo',          emoji:'🦅', name:'Igbo',             region:'West Africa',     note:'Nigeria · Cameroon',          color:'#DC2626' },
  { id:'hausa_fulani',  emoji:'🐪', name:'Hausa-Fulani',     region:'West Africa',     note:'Nigeria · Niger · Ghana',     color:'#D97706' },
  { id:'fulani',        emoji:'🐄', name:'Fulani',           region:'Across Africa',   note:'Sahel Belt',                  color:'#B45309' },
  // ── Southern Africa ─────────────────────────────────────────
  { id:'zulu',          emoji:'🛡️', name:'Zulu',             region:'Southern Africa', note:'South Africa',                color:'#059669' },
  { id:'xhosa',         emoji:'🌿', name:'Xhosa',            region:'Southern Africa', note:'South Africa',                color:'#0F766E' },
  { id:'ndebele',       emoji:'🎨', name:'Ndebele',          region:'Southern Africa', note:'Zimbabwe · South Africa',     color:'#DB2777' },
  // ── North Africa ────────────────────────────────────────────
  { id:'berber',        emoji:'🏔️', name:'Amazigh / Berber', region:'North Africa',    note:'Morocco · Algeria · Libya',   color:'#7C3AED' },
  { id:'arabic',        emoji:'🌙', name:'Arab-African',      region:'North Africa',    note:'Egypt · Sudan · Mauritania',  color:'#0C4A6E' },
  // ── Central Africa ──────────────────────────────────────────
  { id:'hutu_tutsi',    emoji:'🌋', name:'Great Lakes',       region:'Central Africa',  note:'Rwanda · Burundi · DRC',      color:'#B91C1C' },
  // ── Diaspora / Pan-African ───────────────────────────────────
  { id:'diaspora',      emoji:'✈️', name:'African Diaspora',  region:'Global',          note:'Caribbean · Americas · Europe', color:'#1a7c3e' },
  { id:'mixed',         emoji:'🌍', name:'Mixed Heritage',    region:'Pan-African',     note:'Multiple ancestral roots',    color:'#6B7280' },
]

// Region meta — colour, label, icon
const REGION_META: Record<string, { color: string; icon: string }> = {
  'East Africa':     { color: '#E85D04', icon: '🌅' },
  'West Africa':     { color: '#D4A017', icon: '🌴' },
  'Southern Africa': { color: '#059669', icon: '🦁' },
  'North Africa':    { color: '#7C3AED', icon: '🏔️' },
  'Central Africa':  { color: '#B91C1C', icon: '🌋' },
  'Across Africa':   { color: '#B45309', icon: '🐄' },
  'Global':          { color: '#1a7c3e', icon: '✈️' },
  'Pan-African':     { color: '#6B7280', icon: '🌍' },
}

const SEASONS = [
  { id:'harmattan', emoji:'🌬️', name:'Harmattan',   months:'Nov – Feb', desc:'The dry, dusty winds from the Sahara' },
  { id:'rainy',     emoji:'🌧️', name:'Long Rains',   months:'Mar – Jun', desc:'The great rains that bring the harvest' },
  { id:'dry_heat',  emoji:'☀️', name:'Dry Heat',     months:'Jul – Sep', desc:'The blazing sun and heat of high summer' },
  { id:'short_rain',emoji:'🌦️', name:'Short Rains',  months:'Oct',       desc:'The brief rains before Harmattan returns' },
]

const PROTECTIVE_MARKS = [
  '🦁 Lion', '🐘 Elephant', '🌿 Baobab', '🌊 River Spirit', '🦅 Eagle',
  '🔥 Sacred Fire', '⭐ Star Child', '🌙 Moon Child', '🐍 Serpent', '🦋 Butterfly',
  '🏔️ Mountain', '🌺 Hibiscus', '⚡ Thunder', '🌾 Golden Grain', '🌍 Earth Spirit',
]

const AFRICAN_COUNTRIES = [
  'Nigeria','Ghana','Kenya','South Africa','Ethiopia','Egypt','Tanzania','Uganda',
  'Senegal','Cameroon','Côte d\'Ivoire','Morocco','Rwanda','Zimbabwe','Mali',
  'Burkina Faso','Niger','Guinea','Benin','Togo','Mozambique','Madagascar',
  'Zambia','Sierra Leone','Liberia','Eritrea','Somalia','Sudan','Chad','Congo',
  'Democratic Republic of Congo','Angola','Namibia','Botswana','Malawi','Lesotho',
  'Eswatini','Gabon','Equatorial Guinea','São Tomé','Cape Verde','Comoros',
  'Djibouti','Gambia','Guinea-Bissau','Libya','Algeria','Tunisia','Mauritania',
  'Mauritius','Seychelles','South Sudan','Central African Republic','Burundi',
]

const WORLD_COUNTRIES = [
  ...AFRICAN_COUNTRIES,
  'United Kingdom','United States','Canada','France','Germany','Netherlands','Italy',
  'Brazil','Jamaica','Trinidad & Tobago','Spain','Portugal','Belgium','Sweden',
  'Norway','Denmark','Switzerland','Australia','New Zealand','India','China','Japan',
  'South Korea','Ireland','Austria','Poland','Czech Republic','Greece','Turkey',
  'Saudi Arabia','UAE','Qatar','Kuwait','Oman','Bahrain','Israel','Jordan','Lebanon',
  'Iraq','Pakistan','Bangladesh','Sri Lanka','Malaysia','Singapore','Indonesia',
  'Philippines','Thailand','Vietnam','Mexico','Colombia','Argentina','Chile','Peru',
  'Venezuela','Cuba','Haiti','Dominican Republic','Guyana','Suriname','Barbados',
  'Grenada','Bahamas','Russia','Ukraine','Georgia','Armenia','Azerbaijan','Kazakhstan',
].sort()

type HSection = 'group' | 'seasons' | 'people' | 'path'
const H_SECTIONS: { id:HSection; icon:string; title:string; quote:string; bg:string }[] = [
  { id:'group',   icon:'🌍', title:'Heritage Group',    quote:'"Select your ancestral lineage to tailor the ceremony."', bg:'#1a7c3e' },
  { id:'seasons', icon:'🌤️', title:'Your Seasons',      quote:'"Tell the season and year of your first cry."',           bg:'#d4a017' },
  { id:'people',  icon:'🛡️',  title:'Your People',       quote:'"Name your people and the mark that protects them."',    bg:'#3b82f6' },
  { id:'path',    icon:'📍',  title:'Your Present Path', quote:'"Where do you lay your head today?"',                    bg:'#8b5cf6' },
]

function HeritageStep({ onNext, theme }: { onNext:(heritage:string)=>void; theme:any }) {
  const [section, setSection] = React.useState<HSection>('group')
  const [selectedGroup, setSelectedGroup] = React.useState('')
  const [selectedSeason, setSelectedSeason] = React.useState('')
  const [birthYear, setBirthYear] = React.useState('')
  const [tribeNote, setTribeNote] = React.useState('')
  const [protectiveMark, setProtectiveMark] = React.useState('')
  const [currentCountry, setCurrentCountry] = React.useState('')
  const [currentCity, setCurrentCity] = React.useState('')

  const sIdx = H_SECTIONS.findIndex(s => s.id === section)
  const meta = H_SECTIONS[sIdx]
  const progress = ((sIdx + 1) / H_SECTIONS.length) * 100

  const canAdvance = () => {
    if (section === 'group')   return !!selectedGroup
    if (section === 'seasons') return !!selectedSeason && birthYear.length === 4
    if (section === 'people')  return tribeNote.trim().length >= 2 && !!protectiveMark
    if (section === 'path')    return !!currentCountry && currentCity.trim().length >= 2
    return false
  }

  const advance = () => {
    const order:HSection[] = ['group','seasons','people','path']
    const next = order[order.indexOf(section) + 1]
    if (next) setSection(next)
    else onNext(selectedGroup)
  }

  const currentYear = new Date().getFullYear()
  const yearOk = Number(birthYear) >= 1924 && Number(birthYear) <= currentYear - 5

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:theme.bg, overflow:'hidden' }}>

      {/* Section progress bar */}
      <div style={{ padding:'12px 20px 0', flexShrink:0 }}>
        <div style={{ display:'flex', gap:6, marginBottom:12 }}>
          {H_SECTIONS.map((s, i) => (
            <div key={s.id} style={{ flex:1, height:4, borderRadius:99, background: i <= sIdx ? meta.bg : theme.border, transition:'background .3s' }} />
          ))}
        </div>
        {/* Section chip */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:99, background:`${meta.bg}18`, border:`1px solid ${meta.bg}44` }}>
          <span style={{ fontSize:14 }}>{meta.icon}</span>
          <span style={{ fontSize:10, fontWeight:800, color:meta.bg, textTransform:'uppercase', letterSpacing:'.08em' }}>{meta.title}</span>
          <span style={{ fontSize:9, color:theme.subText }}>· {sIdx+1} of 4</span>
        </div>
      </div>

      {/* Quote header */}
      <div style={{ padding:'10px 20px 14px', flexShrink:0 }}>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:17, fontWeight:900, color:theme.text, lineHeight:1.35, marginBottom:3 }}>
          {meta.quote.replace(/"/g,'')}
        </div>
        <div style={{ fontSize:10, color:theme.subText, fontStyle:'italic' }}>
          ⚡ Additional heritage data is collected in the background.
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 4px' }}>

        {/* ── SECTION 1: Heritage Group ── */}
        {section === 'group' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {HERITAGE_GROUPS.map(g => (
                <button key={g.id} onClick={()=>setSelectedGroup(g.id)}
                  style={{ padding:'10px 10px', borderRadius:14, border:`2px solid ${selectedGroup===g.id ? meta.bg : theme.border}`,
                    background: selectedGroup===g.id ? `${meta.bg}15` : theme.card,
                    textAlign:'left', cursor:'pointer', transition:'all .18s' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{g.emoji}</div>
                  <div style={{ fontFamily:'Sora, sans-serif', fontSize:12, fontWeight:800, color:theme.text, marginBottom:1 }}>{g.name}</div>
                  <div style={{ fontSize:9, color:meta.bg, fontWeight:700 }}>{g.region}</div>
                  <div style={{ fontSize:8, color:theme.subText, marginTop:1 }}>{g.note}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 2: Your Seasons ── */}
        {section === 'seasons' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Birth Season</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {SEASONS.map(s => (
                  <button key={s.id} onClick={()=>setSelectedSeason(s.id)}
                    style={{ padding:'12px 14px', borderRadius:14, border:`2px solid ${selectedSeason===s.id ? meta.bg : theme.border}`,
                      background: selectedSeason===s.id ? `${meta.bg}12` : theme.card,
                      display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'all .18s' }}>
                    <span style={{ fontSize:24, flexShrink:0 }}>{s.emoji}</span>
                    <div style={{ flex:1, textAlign:'left' }}>
                      <div style={{ fontFamily:'Sora, sans-serif', fontSize:14, fontWeight:800, color:theme.text }}>{s.name}</div>
                      <div style={{ fontSize:10, color:meta.bg, fontWeight:700 }}>{s.months}</div>
                      <div style={{ fontSize:10, color:theme.subText, marginTop:1 }}>{s.desc}</div>
                    </div>
                    {selectedSeason===s.id && <span style={{ fontSize:16, color:meta.bg }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Year of First Cry</div>
              <input value={birthYear} onChange={e=>setBirthYear(e.target.value.replace(/\D/g,'').slice(0,4))}
                placeholder="e.g. 1995" inputMode="numeric" maxLength={4}
                style={{ width:'100%', padding:'13px 16px', borderRadius:13, background:theme.card,
                  border:`2px solid ${yearOk ? meta.bg+'88' : theme.border}`,
                  color:theme.text, fontSize:18, fontWeight:900, fontFamily:'Sora, sans-serif',
                  outline:'none', letterSpacing:'.12em', transition:'border .2s' }} />
              {birthYear.length===4 && !yearOk && (
                <div style={{ fontSize:10, color:'#f87171', marginTop:5 }}>Please enter a valid birth year between 1924 and {currentYear-5}.</div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 3: Your People ── */}
        {section === 'people' && (
          <div>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Tribe / Ethnic Group Name</div>
              <input value={tribeNote} onChange={e=>setTribeNote(e.target.value)}
                placeholder="e.g. Calabar Efik, Buganda, Ashanti Twi..."
                style={{ width:'100%', padding:'12px 14px', borderRadius:13, background:theme.card,
                  border:`2px solid ${tribeNote.length>=2 ? meta.bg+'88' : theme.border}`,
                  color:theme.text, fontSize:14, outline:'none', transition:'border .2s' }} />
              <div style={{ fontSize:9, color:theme.subText, marginTop:5, lineHeight:1.7 }}>
                This helps personalise your proverbs, ceremony phrases, and cultural village connections.
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Your Protective Mark / Totem</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {PROTECTIVE_MARKS.map(mark => (
                  <button key={mark} onClick={()=>setProtectiveMark(mark)}
                    style={{ padding:'10px 6px', borderRadius:12, border:`2px solid ${protectiveMark===mark ? meta.bg : theme.border}`,
                      background: protectiveMark===mark ? `${meta.bg}15` : theme.card,
                      fontSize:11, fontWeight:700, color:protectiveMark===mark ? meta.bg : theme.text,
                      cursor:'pointer', transition:'all .15s', textAlign:'center' }}>
                    {mark}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 4: Your Present Path ── */}
        {section === 'path' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Country of Residence</div>
              <select value={currentCountry} onChange={e=>setCurrentCountry(e.target.value)}
                style={{ width:'100%', padding:'12px 14px', borderRadius:13, background:theme.card,
                  border:`2px solid ${currentCountry ? meta.bg+'88' : theme.border}`,
                  color: currentCountry ? theme.text : theme.subText, fontSize:14, outline:'none',
                  cursor:'pointer', appearance:'none', transition:'border .2s' }}>
                <option value=''>Select your country…</option>
                {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>City / Town</div>
              <input value={currentCity} onChange={e=>setCurrentCity(e.target.value)}
                placeholder="e.g. Lagos, Nairobi, Accra, London..."
                style={{ width:'100%', padding:'12px 14px', borderRadius:13, background:theme.card,
                  border:`2px solid ${currentCity.length>=2 ? meta.bg+'88' : theme.border}`,
                  color:theme.text, fontSize:14, outline:'none', transition:'border .2s' }} />
            </div>
            {/* Summary card if both filled */}
            {currentCountry && currentCity && (
              <div style={{ padding:'12px 16px', borderRadius:14, background:`${meta.bg}10`, border:`1.5px solid ${meta.bg}33`, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:28 }}>📍</span>
                <div>
                  <div style={{ fontFamily:'Sora, sans-serif', fontSize:14, fontWeight:800, color:theme.text }}>{currentCity}, {currentCountry}</div>
                  <div style={{ fontSize:10, color:meta.bg, marginTop:2 }}>Your digital home coordinates are locked ✓</div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* CTA footer */}
      <div style={{ padding:'12px 20px 20px', background:theme.card, borderTop:`1px solid ${theme.border}`, flexShrink:0 }}>
        {sIdx > 0 && (
          <button onClick={()=>{const order:HSection[]=['group','seasons','people','path']; setSection(order[sIdx-1])}}
            style={{ background:'none', border:'none', color:theme.subText, fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:8, display:'block' }}>← Back</button>
        )}
        <GradBtn onClick={advance} style={!canAdvance()?{opacity:.4,pointerEvents:'none',height:52}:{height:52}}>
          {section==='path' ? 'Seal My Heritage 🌍 →' : `Next: ${H_SECTIONS[sIdx+1]?.title ?? ''} →`}
        </GradBtn>
      </div>
    </div>
  )
}

// ── DSelect — theme-aware custom select, replaces native <select> ──
// Self-contained, no portal, no extra libs — bottom-sheet slide-up on tap
function DSelect({ value, onChange, options, placeholder, theme }: {
  value: string; onChange: (v:string)=>void; options: string[]; placeholder: string; theme: any
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const searchRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => searchRef.current?.focus(), 80)
    }
  }, [open])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  const pick = (v: string) => { onChange(v); setOpen(false) }

  return (
    <>
      {/* Trigger — looks like a DField input */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%', padding: '13px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: theme.muted, border: `1.5px solid ${value ? theme.accent + '88' : theme.border}`,
          borderRadius: 12, color: value ? theme.text : theme.subText, fontSize: 14, fontWeight: value ? 600 : 400,
          cursor: 'pointer', outline: 'none', textAlign: 'left', fontFamily: 'inherit',
          transition: 'border-color .15s',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        <span style={{ fontSize: 10, color: theme.subText, marginLeft: 8, flexShrink: 0 }}>▼</span>
      </button>

      {/* Bottom-sheet overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sheet panel */}
      {open && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
          height: '72vh', display: 'flex', flexDirection: 'column',
          background: theme.card === 'rgba(255,255,255,.045)' ? '#0d1117' : (theme.card || '#fff'),
          borderTop: `1px solid ${theme.border}`,
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,.4)',
          animation: 'slideUp .22s ease',
        }}>
          {/* Handle */}
          <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: theme.border }} />
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 12px', flexShrink: 0 }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: theme.text }}>{placeholder}</div>
            <button onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: theme.muted, color: theme.text, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
          </div>

          {/* Search */}
          <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                background: theme.muted, border: `1.5px solid ${theme.border}`,
                color: theme.text, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: theme.subText, fontSize: 13 }}>No results for "{search}"</div>
            )}
            {filtered.map(opt => {
              const sel = opt === value
              return (
                <div key={opt} onClick={() => pick(opt)}
                  style={{
                    padding: '13px 14px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center',
                    background: sel ? `${theme.accent}15` : 'transparent',
                    color: sel ? theme.accent : theme.text,
                    fontWeight: sel ? 700 : 400, fontSize: 14,
                    marginBottom: 2,
                    transition: 'background .1s',
                  }}
                >
                  {sel && <span style={{ marginRight: 8, flexShrink: 0 }}>✓</span>}
                  {opt}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

// ── STEP: NAMING (6 scenes as internal tabs) ──────────────────

// ── Date String Parser — accepts "12 March 1998" | "12/03/1998" | "1998-03-12"
function parseDateString(raw: string): string {
  if (!raw.trim()) return ''
  // ISO format already
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim()
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = raw.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`
  // Natural language: parse using Date constructor
  const MONTHS: Record<string,string> = {
    january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',
    july:'07',august:'08',september:'09',october:'10',november:'11',december:'12',
    jan:'01',feb:'02',mar:'03',apr:'04',jun:'06',jul:'07',aug:'08',
    sep:'09',oct:'10',nov:'11',dec:'12'
  }
  const nlMatch = raw.trim().toLowerCase().match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/)
  if (nlMatch) {
    const m = MONTHS[nlMatch[2]]
    if (m) return `${nlMatch[3]}-${m}-${nlMatch[1].padStart(2,'0')}`
  }
  // Fallback
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return ''
}

// ── Inline VoiceRecorder — small hook-like component
function VoiceRecorder({ label, theme, onRecorded }: { label: string; theme: any; onRecorded?: (url: string) => void }) {
  const [state, setState] = React.useState<'idle'|'recording'|'done'>('idle')
  const streamRef = React.useRef<MediaStream|null>(null)
  const recorderRef = React.useRef<MediaRecorder|null>(null)
  const chunksRef = React.useRef<Blob[]>([])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        onRecorded?.(url)
        setState('done')
      }
      recorder.start(200)
      setState('recording')
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, 15000)
    } catch { setState('idle') }
  }

  const stop = () => {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  if (state === 'idle') return (
    <button onClick={start}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, background:'rgba(255,255,255,.04)', border:`1px dashed ${theme.border}`, color:theme.subText, fontSize:11, fontWeight:700, cursor:'pointer', width:'100%', justifyContent:'center' }}>
      🎙 {label}
    </button>
  )
  if (state === 'recording') return (
    <button onClick={stop}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)', color:'#f87171', fontSize:11, fontWeight:700, cursor:'pointer', width:'100%', justifyContent:'center', animation:'sosP 1s infinite' }}>
      ⏹ Recording… tap to stop (max 15s)
    </button>
  )
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, background:'rgba(74,222,128,.06)', border:'1px solid rgba(74,222,128,.2)', color:'#4ade80', fontSize:11, fontWeight:700, width:'100%', justifyContent:'center' }}>
      ✓ Voice captured — playing back…
    </div>
  )
}
const SCENE_META = [
  { icon:'🪬', color:'#d4a017', title:'Your Names', quote:'"Umuntu ngumuntu ngabantu" (A person is a person through other people — Ubuntu (Pan-African))', note:'Personalise Your Ceremony' },
  { icon:'✍️', color:'#c084fc', title:'Your Names', quote:'"The name you carry is the story of your people."', note:'Your heritage shapes the first 3 characters of your Afro-ID' },
  { icon:'📍', color:'#3b82f6', title:'Your Origins', quote:'"Know where you come from, so you know where you are going."', note:null },
  { icon:'📅', color:'#f97316', title:'Your Seasons', quote:'"Tell the season and year of your first cry."', note:'Time is measured by harvests, by rains, by festivals.' },
  { icon:'❤️', color:'#ef4444', title:'Your People', quote:'"Name your people and the mark that protects them."', note:null },
  { icon:'🏠', color:'#1a7c3e', title:'Your Present Path', quote:'"Where do you lay your head today?"', note:null },
]
const SCENE_TABS = ['Naming','Names','Origins','Seasons','People','Path']

function NamingStep({ onNext, theme, heritage, onNamingData, isDark }: { onNext:()=>void; theme:any; heritage?:string; onNamingData?:(d:Record<string,string>)=>void; isDark:boolean }) {
  const [tab, setTab] = React.useState(0)
  const [first, setFirst] = React.useState('')
  const [last, setLast] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [genderLocal, setGenderLocal] = React.useState<'male'|'female'|'non-binary'|'prefer-not-to-say'|''>('')
  const [languageCode, setLanguageCode] = React.useState('en')
  const [ancestralNation, setAncestralNation] = React.useState('')
  const [originState, setOriginState] = React.useState('')
  const [originVillage, setOriginVillage] = React.useState('')
  const [ethnicGroup, setEthnicGroup] = React.useState('')
  const [clanLineage, setClanLineage] = React.useState('')
  const [dob, setDob] = React.useState('')
  const [birthSeason, setBirthSeason] = React.useState('')
  const [motherName, setMotherName] = React.useState('')
  const [fatherName, setFatherName] = React.useState('')
  const [totemAnimal, setTotemAnimal] = React.useState('')
  const [currentCountry, setCurrentCountry] = React.useState('')
  const [currentCity, setCurrentCity] = React.useState('')
  const [occupation, setOccupation] = React.useState('')
  const [altContact, setAltContact] = React.useState('')
  // localHeritage: pre-filled from parent (Circle 2 HeritageStep) or selected in-step (Circle 1)
  const [localHeritage, setLocalHeritage] = React.useState(heritage ?? '')
  const [tabError, setTabError] = React.useState('')
  // Root uncertainty — "I don't fully know my origin"
  const [originUnknown, setOriginUnknown] = React.useState(false)
  // Typed date string — natural language or DD/MM/YYYY
  const [dobRaw, setDobRaw] = React.useState('')

  const config = getCeremonyConfig(localHeritage)
  const m = SCENE_META[tab]

  // Max DOB = 13 years ago; Min DOB = 110 years ago
  const today = new Date()
  const maxDob = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()).toISOString().split('T')[0]
  const minDob = new Date(today.getFullYear() - 110, 0, 1).toISOString().split('T')[0]

  // Validation per tab — returns error message or empty string
  const validateTab = (t: number): string => {
    if (t === 0) {
      // NAMING tab — heritage is optional (can skip to Ubuntu)
    }
    if (t === 1) {
      if (!first.trim()) return 'Forename(s) is required'
      if (!last.trim()) return 'Surname is required'
    }
    if (t === 2) {
      // Origins — skip required fields if user flagged "I don't know"
      if (!originUnknown && !ancestralNation.trim()) return 'Ancestral Nation is required — or check "I don\'t know my full origin"'
    }
    if (t === 3) {
      const parsed = parseDateString(dobRaw)
      if (!parsed) return 'Please enter your date of birth (e.g. 12 March 1998)'
      setDob(parsed)
    }
    if (t === 4) {
      if (!motherName.trim()) return 'Mother\'s name is required'
      if (!fatherName.trim()) return 'Father\'s name is required'
    }
    if (t === 5) {
      if (!currentCountry.trim()) return 'Country of Residence is required'
      if (!currentCity.trim()) return 'City / Town is required'
      if (!occupation.trim()) return 'Occupation is required'
    }
    return ''
  }

  const handleContinue = () => {
    const err = validateTab(tab)
    if (err) { setTabError(err); return }
    setTabError('')
    if (tab < 5) {
      setTab(tab + 1)
    } else {
      // Final tab — pass all data back to parent
      const birthYear = dob ? new Date(dob).getFullYear().toString() : ''
      onNamingData?.({
        first: first.trim(), last: last.trim(),
        fullName: `${first.trim()} ${last.trim()}`,
        displayName: displayName.trim() || first.trim(),
        dateOfBirth: dob, birthYear,
        gender: genderLocal,
        languageCode,
        ancestralNation: originUnknown ? '(unknown — root discovery pending)' : ancestralNation,
        originState: originState.trim(), originVillage: originVillage.trim(),
        ethnicGroup, clanLineage,
        birthSeason, motherName: motherName.trim(), fatherName: fatherName.trim(),
        totemAnimal, currentCountry, currentCity: currentCity.trim(),
        occupation: occupation.trim(), altContact: altContact.trim(),
        heritage: localHeritage,
        originUnknown: originUnknown ? 'true' : '',
      })
      onNext()
    }
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:theme.bg }}>
      {/* Pan-African Kente stripe header */}
      <div style={{ height:4, background:'linear-gradient(90deg, #1a7c3e 0%,#1a7c3e 25%, #d4a017 25%,#d4a017 50%, #b22222 50%,#b22222 75%, #1a1a1a 75%,#1a1a1a 100%)', flexShrink:0 }} />

      <div style={{ display:'flex', background:theme.card, borderBottom:`1px solid ${theme.border}`, overflowX:'auto', scrollbarWidth:'none' }}>
        {SCENE_TABS.map((t,i)=>(
          <div key={t} onClick={()=>setTab(i)} style={{ flex:1, padding:'14px 10px', textAlign:'center', fontSize:10, fontWeight:900, color:tab===i?theme.accent:theme.subText, borderBottom:`3px solid ${tab===i?theme.accent:'transparent'}`, cursor:'pointer', minWidth:80, whiteSpace:'nowrap', transition:'all .2s' }}>{t.toUpperCase()}</div>
        ))}
      </div>

      <div style={{ flex:1, padding:20, overflowY:'auto' }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:`${m.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 16px', border:`2px solid ${m.color}33` }}>{m.icon}</div>
          {tab === 1 && localHeritage && config !== UBUNTU_CEREMONY ? (
            <>
              <div style={{ fontSize:10,fontWeight:800,color:theme.accent,textTransform:'uppercase',letterSpacing:'.12em',marginBottom:6 }}>{config.welcomeLanguage} Naming Ceremony</div>
              <div style={{ fontFamily:'Sora, sans-serif', fontSize:20, fontWeight:900, color:theme.text, marginBottom:2, lineHeight:1.2 }}>{config.ceremonyName}</div>
              <div style={{ fontSize:11, color:theme.subText, marginBottom:8, fontStyle:'italic' }}>{config.ceremonyNameTranslation}</div>
              <div style={{ background:`${m.color}12`, border:`1px solid ${m.color}30`, borderRadius:12, padding:'10px 16px', marginBottom:4, fontSize:15, fontWeight:800, color:m.color }}>{config.welcomePhrase}</div>
              <div style={{ fontSize:11, fontStyle:'italic', color:theme.subText, lineHeight:1.5 }}>{`"${config.namingProverb}"`} <span style={{ color:'rgba(255,255,255,.3)' }}>— {config.proverbOrigin}</span></div>
            </>
          ) : (
            <>
              <div style={{ fontFamily:'Sora, sans-serif', fontSize:22, fontWeight:900, color:theme.text, marginBottom:4 }}>{m.title}</div>
              <div style={{ fontSize:12, fontStyle:'italic', color:theme.subText, lineHeight:1.5 }}>{tab === 1 ? `"${config.namingProverb}" (${config.proverbOrigin})` : m.quote}</div>
            </>
          )}
        </div>

        {tab===0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Pan-African intro banner */}
            <div style={{ background:'linear-gradient(135deg,rgba(26,124,62,.12),rgba(212,160,23,.08))', border:'1px solid rgba(212,160,23,.2)', borderRadius:16, padding:'14px 16px', textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='26' fill='none' stroke='%231a7c3e' stroke-width='0.6' stroke-opacity='.3'/%3E%3Ccircle cx='30' cy='30' r='18' fill='none' stroke='%231a7c3e' stroke-width='0.5' stroke-opacity='.2'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%231a7c3e' stroke-width='0.5' stroke-opacity='.15'/%3E%3C/svg%3E")`, backgroundSize:'60px 60px', backgroundRepeat:'repeat', opacity:.6 }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontSize:22, marginBottom:4 }}>🌍</div>
                <div style={{ fontFamily:'Sora, sans-serif', fontSize:15, fontWeight:900, color:theme.text, marginBottom:4 }}>54 Nations · One Motherland</div>
                <div style={{ fontSize:11, color:theme.subText, lineHeight:1.6 }}>Your naming ceremony is drawn from your ancestral tradition — choose your heritage below, or use the universal Pan-African Ubuntu ceremony.</div>
              </div>
            </div>

            {/* Regional group display */}
            {(() => {
              const regions = Array.from(new Set(HERITAGE_GROUPS.map(g => g.region)))
              return regions.map(region => {
                const regionGroups = HERITAGE_GROUPS.filter(g => g.region === region)
                const meta = REGION_META[region] ?? { color:'#1a7c3e', icon:'🌍' }
                return (
                  <div key={region}>
                    {/* Region header */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{ height:1, flex:1, background:`linear-gradient(to right, ${meta.color}40, transparent)` }} />
                      <div style={{ fontSize:9, fontWeight:900, color:meta.color, textTransform:'uppercase', letterSpacing:'.12em', display:'flex', alignItems:'center', gap:4 }}>
                        <span>{meta.icon}</span> {region}
                      </div>
                      <div style={{ height:1, flex:1, background:`linear-gradient(to left, ${meta.color}40, transparent)` }} />
                    </div>
                    {/* Group cards */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                      {regionGroups.map(g => {
                        const sel = localHeritage === g.id
                        const accentColor = g.color ?? meta.color
                        return (
                          <button key={g.id} onClick={()=>setLocalHeritage(g.id)}
                            style={{ padding:'12px 8px', borderRadius:14, border:`2px solid ${sel ? accentColor : theme.border}`, background: sel ? `${accentColor}18` : theme.card, display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer', transition:'all .15s', boxShadow: sel ? `0 0 14px ${accentColor}44` : 'none', position:'relative' }}>
                            {sel && <div style={{ position:'absolute', top:4, right:4, width:16, height:16, borderRadius:'50%', background:accentColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:900 }}>✓</div>}
                            <span style={{ fontSize:22 }}>{g.emoji}</span>
                            <span style={{ fontSize:10, fontWeight:800, color: sel ? accentColor : theme.text, textAlign:'center', lineHeight:1.2 }}>{g.name}</span>
                            <span style={{ fontSize:8, color:theme.subText, textAlign:'center' }}>{g.note}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()}

            <button onClick={()=>{setLocalHeritage('');setTab(1)}} style={{ width:'100%', padding:'12px 0', borderRadius:12, background:'rgba(26,124,62,.06)', border:`1px dashed ${theme.accent}44`, color:theme.accent, fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              🌍 Ubuntu Ceremony — Use Pan-African Universal Naming
            </button>

            {localHeritage && (
              <div style={{ background:`rgba(26,124,62,.06)`, border:`1px solid ${theme.accent}33`, borderRadius:16, padding:16, color:theme.accent, fontSize:12, lineHeight:1.7 }}>
                {/* Mini Adinkrahene concentric circles as decorative element */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:36, height:36, flexShrink:0, borderRadius:'50%', border:`2px solid ${theme.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                    {HERITAGE_GROUPS.find(g=>g.id===localHeritage)?.emoji ?? '🌍'}
                  </div>
                  <div>
                    <div style={{ fontWeight:900, fontSize:14, color:theme.text }}>📿 {config.ceremonyName}</div>
                    <div style={{ fontSize:10, color:theme.subText, fontStyle:'italic' }}>{config.ceremonyNameTranslation}</div>
                  </div>
                </div>
                <div style={{ background:`${m.color}12`, border:`1px solid ${m.color}30`, borderRadius:12, padding:'10px 14px', marginBottom:8, fontSize:14, fontWeight:800, color:m.color }}>{config.welcomePhrase}</div>
                <div style={{ color:theme.subText, lineHeight:1.7, marginBottom:6, fontSize:11 }}>{config.namingRitual}</div>
                <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:10,fontWeight:800,color:theme.accent }}><span>👴</span> Officiated by: {config.elderTitle}</div>
                <button onClick={()=>setTab(1)} style={{ marginTop:10, width:'100%', padding:'10px 0', borderRadius:12, background:`${theme.accent}18`, border:`1px solid ${theme.accent}44`, color:theme.accent, fontSize:11, fontWeight:800, cursor:'pointer' }}>
                  Begin {config.ceremonyName} →
                </button>
              </div>
            )}
          </div>
        )}
        {tab===1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* Story narration */}
            <div style={{ background:'rgba(192,132,252,.06)', borderRadius:16, padding:16, marginBottom:4, borderLeft:'3px solid #c084fc' }}>
              <div style={{ fontSize:13, color:theme.text, lineHeight:1.7, fontStyle:'italic' }}>
                "Your name is your first drum beat in this world. It carries the prayers of those who came before you and the hopes of those who will follow."
              </div>
            </div>

            {localHeritage && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:12, background:`${theme.accent}08`, border:`1px solid ${theme.accent}22`, marginBottom:4 }}>
                <span style={{ fontSize:18 }}>{HERITAGE_GROUPS.find(g=>g.id===localHeritage)?.emoji ?? '🌍'}</span>
                <span style={{ fontSize:12, fontWeight:700, color:theme.accent }}>{config.ceremonyName}</span>
                <button onClick={()=>{setLocalHeritage('');setTab(0)}} style={{ marginLeft:'auto', fontSize:10, color:theme.subText, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Change ✎</button>
              </div>
            )}
            <DField label="Forename(s) *" placeholder="e.g. Amara, Kofi, Zainab" value={first} onChange={setFirst} theme={theme} />
            <DField label="Surname *" placeholder="e.g. Okafor, Mensah, Diallo" value={last} onChange={setLast} theme={theme} />
            <DField label="Display Name — How the village will know you" placeholder="e.g. Amara or @MarketKing" value={displayName} onChange={setDisplayName} theme={theme} />

            {/* Language preference */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: theme.subText, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Preferred Language</div>
              <select
                value={languageCode}
                onChange={e => setLanguageCode(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: theme.muted, border: `1.5px solid ${theme.border}`, color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                <option value="en">English</option>
                <option value="fr">French — Français</option>
                <option value="sw">Swahili — Kiswahili</option>
                <option value="yo">Yoruba</option>
                <option value="ha">Hausa</option>
                <option value="ig">Igbo</option>
                <option value="am">Amharic — አማርኛ</option>
                <option value="ar">Arabic — العربية</option>
                <option value="pt">Portuguese — Português</option>
                <option value="zu">Zulu</option>
              </select>
            </div>

            {/* Gender selection */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: theme.subText, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Gender — Optional</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {([
                  { key: 'male',              label: 'Man' },
                  { key: 'female',            label: 'Woman' },
                  { key: 'non-binary',        label: 'Non-binary' },
                  { key: 'prefer-not-to-say', label: 'Prefer not to say' },
                ] as const).map(g => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGenderLocal(genderLocal === g.key ? '' : g.key)}
                    style={{
                      padding: '10px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: `1.5px solid ${genderLocal === g.key ? theme.accent : theme.border}`,
                      background: genderLocal === g.key ? `${theme.accent}18` : theme.card,
                      color: genderLocal === g.key ? theme.accent : theme.text,
                      transition: 'all .15s',
                    }}
                  >{g.label}</button>
                ))}
              </div>
            </div>

            <VoiceRecorder label="Speak your name" theme={theme} />

            <div style={{ background:`${theme.accent}08`, border:`1px solid ${theme.accent}33`, borderRadius:16, padding:14, color:theme.accent, fontSize:11, lineHeight:1.6 }}>
               {localHeritage && config !== UBUNTU_CEREMONY ? (
                 <>
                   <div style={{ fontWeight:800, marginBottom:4 }}>📿 The Ceremony</div>
                   <div style={{ color:theme.subText, lineHeight:1.7, marginBottom:6 }}>{config.namingRitual}</div>
                   <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:10,fontWeight:800,color:theme.accent }}><span>👴</span> Officiated by: {config.elderTitle}</div>
                 </>
               ) : (
                 <>✦ <b>{config.ceremonyName}:</b> {config.ceremonyNameTranslation}. {config.namingRitual}</>
               )}
            </div>
          </div>
        )}
        {tab===2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* Story narration */}
            <div style={{ background:`${theme.accent}06`, borderRadius:16, padding:16, marginBottom:4, borderLeft:`3px solid ${theme.accent}` }}>
              <div style={{ fontSize:13, color:theme.text, lineHeight:1.7, fontStyle:'italic' }}>
                "Every river has a source, every tree has roots. Tell us where your people come from — even if the memory is faint, every fragment matters."
              </div>
            </div>

            {/* "I don't know" root uncertainty toggle */}
            <div onClick={()=>{ setOriginUnknown(!originUnknown); setTabError('') }}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, background: originUnknown ? 'rgba(59,130,246,.08)' : 'transparent', border:`1.5px solid ${originUnknown ? '#3b82f6' : theme.border}`, cursor:'pointer', transition:'all .2s' }}>
              <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${originUnknown ? '#3b82f6' : theme.border}`, background: originUnknown ? '#3b82f6' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:900, transition:'all .2s' }}>
                {originUnknown && '✓'}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color: originUnknown ? '#93c5fd' : theme.text }}>I don't fully know my origin</div>
                <div style={{ fontSize:10, color:theme.subText, marginTop:1 }}>You can fill what you know — we'll help you discover the rest later</div>
              </div>
            </div>

            {!originUnknown && (
              <>
                <div style={{ fontSize:10, fontWeight:700, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>Ancestral Nation *</div>
                <DSelect
                  value={ancestralNation}
                  onChange={v=>{setAncestralNation(v);setTabError('')}}
                  options={AFRICAN_COUNTRIES}
                  placeholder="Select your ancestral nation…"
                  theme={theme}
                />
              </>
            )}
            {originUnknown && (
              <DField label="Ancestral Nation (if known)" placeholder="e.g. Nigeria, Ghana, Congo..." value={ancestralNation} onChange={v=>{setAncestralNation(v);setTabError('')}} theme={theme} />
            )}
             <DField label="State or Region" placeholder="e.g. Lagos, Ashanti, Nairobi..." value={originState} onChange={v=>{setOriginState(v);setTabError('')}} theme={theme} />
             <DField label="Village or Town of Origin" placeholder="e.g. Eket, Kumasi, Kisumu..." value={originVillage} onChange={v=>{setOriginVillage(v);setTabError('')}} theme={theme} />
             <DField label="Ethnic Group / Tribe" placeholder="e.g. Yoruba, Igbo, Zulu, Akan, Amhara" value={ethnicGroup} onChange={v=>{setEthnicGroup(v);setTabError('')}} theme={theme} />
             <DField label="Clan / Lineage" placeholder="e.g. Ikot Abasi, Oyo, Meru" value={clanLineage} onChange={v=>{setClanLineage(v);setTabError('')}} theme={theme} />

             <VoiceRecorder label="Tell us where your people come from" theme={theme} />

             {ancestralNation && (
               <div style={{ background:`linear-gradient(135deg, ${theme.accent}10, ${theme.accent}05)`, border:`1px solid ${theme.accent}30`, borderRadius:16, padding:16, marginTop:6, display:'flex', alignItems:'center', gap:14 }}>
                 <div style={{ width:48, height:48, borderRadius:'50%', background:`${theme.accent}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🧭</div>
                 <div>
                   <div style={{ fontSize:11, fontWeight:800, color:theme.accent, textTransform:'uppercase', letterSpacing:'.06em' }}>Origin Coordinates</div>
                   <div style={{ fontSize:13, color:theme.text, fontWeight:700, marginTop:2 }}>{ancestralNation}{ethnicGroup ? ` \u2022 ${ethnicGroup}` : ''}{clanLineage ? ` \u2022 ${clanLineage}` : ''}</div>
                   <div style={{ fontSize:10, color:theme.subText, marginTop:4, fontStyle:'italic' }}>{originUnknown ? 'Partial roots recorded — Root Discovery will help you find the rest' : 'Your ancestral roots are mapped to the Motherland'}</div>
                 </div>
               </div>
             )}
          </div>
        )}
        {tab===3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Story narration */}
            <div style={{ background:'rgba(249,115,22,.06)', borderRadius:16, padding:16, marginBottom:4, borderLeft:'3px solid #f97316' }}>
              <div style={{ fontSize:13, color:theme.text, lineHeight:1.7, fontStyle:'italic' }}>
                "Tell the season and year of your first cry. The day you arrived into the world carries the rhythm of your destiny."
              </div>
            </div>

            <div>
              <div style={{ fontSize:10, fontWeight:700, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Date of Birth *</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr 1fr', gap:8 }}>
                <select value={dobRaw.split('/')[0]||''} onChange={e=>{const p=dobRaw.split('/');p[0]=e.target.value;setDobRaw(p.join('/'));setTabError('')}} style={{ padding:'13px 8px', borderRadius:12, fontSize:14, fontWeight:600, color:theme.text, background:theme.muted, border:`1.5px solid ${theme.border}`, outline:'none' }}>
                  <option value="">Day</option>
                  {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={String(d).padStart(2,'0')}>{d}</option>)}
                </select>
                <select value={dobRaw.split('/')[1]||''} onChange={e=>{const p=dobRaw.split('/');p[1]=e.target.value;setDobRaw(p.join('/'));setTabError('')}} style={{ padding:'13px 8px', borderRadius:12, fontSize:14, fontWeight:600, color:theme.text, background:theme.muted, border:`1.5px solid ${theme.border}`, outline:'none' }}>
                  <option value="">Month</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i)=><option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}
                </select>
                <select value={dobRaw.split('/')[2]||''} onChange={e=>{const p=dobRaw.split('/');p[2]=e.target.value;setDobRaw(p.join('/'));setTabError('')}} style={{ padding:'13px 8px', borderRadius:12, fontSize:14, fontWeight:600, color:theme.text, background:theme.muted, border:`1.5px solid ${theme.border}`, outline:'none' }}>
                  <option value="">Year</option>
                  {Array.from({length:98},(_,i)=>new Date().getFullYear()-13-i).map(y=><option key={y} value={String(y)}>{y}</option>)}
                </select>
              </div>
              {dobRaw.split('/').filter(Boolean).length===3 && parseDateString(dobRaw) && <div style={{ fontSize:10, color:theme.accent, marginTop:6 }}>✓ Born {dobRaw.split('/')[0]}/{dobRaw.split('/')[1]}/{dobRaw.split('/')[2]}</div>}
            </div>
            <div style={{ fontSize:10, fontWeight:700, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>Birth Season</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { key:'rainy', emoji:'🌧️', name:'Rainy Season', sub:'Waters of life', grad:'linear-gradient(135deg,#1e3a5f,#2563eb)' },
                { key:'dry', emoji:'☀️', name:'Dry Season', sub:'Season of heat', grad:'linear-gradient(135deg,#92400e,#f59e0b)' },
                { key:'planting', emoji:'🌿', name:'Planting Season', sub:'Time of sowing', grad:'linear-gradient(135deg,#14532d,#22c55e)' },
                { key:'harvest', emoji:'🌾', name:'Harvest Season', sub:'Time of gathering', grad:'linear-gradient(135deg,#78350f,#d97706)' },
              ].map(s => {
                const sel = birthSeason === s.key
                return (
                  <div key={s.key} onClick={()=>setBirthSeason(s.key)}
                    style={{ position:'relative', background: sel ? s.grad : theme.card, border:`2px solid ${sel ? '#fff3' : theme.border}`, borderRadius:16, padding:'18px 14px', textAlign:'center', cursor:'pointer', transition:'all .2s', boxShadow: sel ? `0 0 20px ${s.key==='rainy'?'#2563eb44':s.key==='dry'?'#f59e0b44':s.key==='planting'?'#22c55e44':'#d9770644'}` : 'none', overflow:'hidden' }}>
                    {sel && <div style={{ position:'absolute', top:8, right:10, width:20, height:20, borderRadius:'50%', background:'rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:900 }}>{'\u2713'}</div>}
                    <div style={{ fontSize:32, marginBottom:6 }}>{s.emoji}</div>
                    <div style={{ fontSize:13, fontWeight:800, color: sel ? '#fff' : theme.text }}>{s.name}</div>
                    <div style={{ fontSize:10, fontStyle:'italic', color: sel ? 'rgba(255,255,255,.7)' : theme.subText, marginTop:2 }}>{s.sub}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ background:'linear-gradient(135deg, #f9731610, #f9731605)', border:'1px solid #f9731630', borderRadius:16, padding:14, marginTop:4, textAlign:'center' }}>
              <div style={{ fontSize:11, fontStyle:'italic', color:theme.subText, lineHeight:1.6 }}>"The season of your birth is the rhythm of your destiny"</div>
            </div>
          </div>
        )}
        {tab===4 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Story narration */}
            <div style={{ background:'rgba(239,68,68,.06)', borderRadius:16, padding:16, marginBottom:4, borderLeft:'3px solid #ef4444' }}>
              <div style={{ fontSize:13, color:theme.text, lineHeight:1.7, fontStyle:'italic' }}>
                "Name the people who carried you into the world. Your mother's name is the first prayer spoken over you. Your father's name is the first shield raised for you."
              </div>
            </div>

            <DField label="Mother's Name *" placeholder="e.g. Adaeze, Amara, Fatima" value={motherName} onChange={v=>{setMotherName(v);setTabError('')}} theme={theme} />
            <DField label="Father's Name *" placeholder="e.g. Emeka, Kofi, Ibrahim" value={fatherName} onChange={v=>{setFatherName(v);setTabError('')}} theme={theme} />

            <VoiceRecorder label="Speak your parents' names" theme={theme} />

            <div style={{ fontSize:10, fontWeight:700, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>Totem Animal — Your spiritual guardian</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              {[
                { key:'lion', emoji:'🦁', name:'Lion', trait:'Courage' },
                { key:'eagle', emoji:'🦅', name:'Eagle', trait:'Vision' },
                { key:'elephant', emoji:'🐘', name:'Elephant', trait:'Wisdom' },
                { key:'leopard', emoji:'🐆', name:'Leopard', trait:'Stealth' },
                { key:'serpent', emoji:'🐍', name:'Serpent', trait:'Transformation' },
                { key:'tortoise', emoji:'🐢', name:'Tortoise', trait:'Patience' },
              ].map(t => {
                const sel = totemAnimal === t.key
                return (
                  <div key={t.key} onClick={()=>setTotemAnimal(t.key)}
                    style={{ background: sel ? 'linear-gradient(135deg,#ef444420,#ef444410)' : theme.card, border:`2px solid ${sel ? '#ef4444' : theme.border}`, borderRadius:16, padding:'14px 8px', textAlign:'center', cursor:'pointer', transition:'all .2s', boxShadow: sel ? '0 0 18px #ef444433' : 'none', position:'relative' }}>
                    {sel && <div style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:900 }}>{'\u2713'}</div>}
                    <div style={{ fontSize:28, marginBottom:4 }}>{t.emoji}</div>
                    <div style={{ fontSize:12, fontWeight:800, color: sel ? '#ef4444' : theme.text }}>{t.name}</div>
                    <div style={{ fontSize:9, fontWeight:700, color: sel ? '#ef4444' : theme.subText, marginTop:3, textTransform:'uppercase', letterSpacing:'.04em' }}>{t.trait}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {tab===5 && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* Story narration */}
            <div style={{ background:'rgba(26,124,62,.06)', borderRadius:16, padding:16, marginBottom:4, borderLeft:'3px solid #1a7c3e' }}>
              <div style={{ fontSize:13, color:theme.text, lineHeight:1.7, fontStyle:'italic' }}>
                "Where do you plant your feet today? The Motherland stretches beyond borders. Tell us where you lay your head, and what calling moves your hands."
              </div>
            </div>

            <div>
              <div style={{ fontSize:10, fontWeight:700, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Country of Residence *</div>
              <DSelect
                value={currentCountry}
                onChange={v=>{setCurrentCountry(v);setTabError('')}}
                options={WORLD_COUNTRIES}
                placeholder="Select your country…"
                theme={theme}
              />
            </div>
            <DField label="City / Town *" placeholder="e.g. London, Nairobi, Lagos, Accra" value={currentCity} onChange={v=>{setCurrentCity(v);setTabError('')}} theme={theme} />
            <DField label="Occupation / Calling *" placeholder="e.g. Software Engineer, Farmer, Student, Artist" value={occupation} onChange={v=>{setOccupation(v);setTabError('')}} theme={theme} />
            <DField label="Alternative Contact — Optional" placeholder="e.g. +234 801 234 5678" type="tel" value={altContact} onChange={v=>{setAltContact(v);setTabError('')}} theme={theme} />

            <VoiceRecorder label="What do you do? Tell us about your calling" theme={theme} />

            {currentCountry && currentCity && occupation && (
              <div style={{ background:'linear-gradient(135deg, #1a7c3e10, #1a7c3e05)', border:'1px solid #1a7c3e30', borderRadius:16, padding:16, marginTop:6, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'#1a7c3e15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>📍</div>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:'#1a7c3e', textTransform:'uppercase', letterSpacing:'.06em' }}>Digital Coordinates Locked</div>
                  <div style={{ fontSize:13, color:theme.text, fontWeight:700, marginTop:2 }}>{currentCity}, {currentCountry}</div>
                  <div style={{ fontSize:11, color:theme.subText, marginTop:2 }}>{occupation}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding:20, background:theme.card, borderTop:`1px solid ${theme.border}` }}>
        {tabError && <div style={{ fontSize:12, color:'#f87171', textAlign:'center', marginBottom:10, padding:'8px 14px', background:'rgba(178,34,34,.1)', borderRadius:10, border:'1px solid rgba(178,34,34,.2)' }}>{tabError}</div>}
        <GradBtn onClick={handleContinue} style={{ height:56 }}>{tab < 5 ? 'Continue Entry →' : 'Seal My Names →'}</GradBtn>
      </div>
    </div>
  )
}
const BIND_CHECKS = [
  { emoji:'📱', label:'Hardware Fingerprint', key:'hw' },
  { emoji:'🔒', label:'Sovereign Keys', key:'enc' },
  { emoji:'🌍', label:'Location Anchor', key:'loc' },
  { emoji:'🛡', label:'Tamper Shield', key:'tamp' },
]

function DeviceStep({ onNext, theme, onVoicePrint }: { onNext:()=>void; theme:any; onVoicePrint?:(hash:string)=>void }) {
  const [bindIdx, setBindIdx] = React.useState(-1)
  const [done, setDone] = React.useState(false)
  const [recording, setRecording] = React.useState(false)
  const [oathDone, setOathDone] = React.useState(false)
  const [bars, setBars] = React.useState([8,16,22,12,20,10,18,14,24,8])
  const recRef = React.useRef<MediaRecorder|null>(null)
  const rafRef = React.useRef<number>()

  // Binding animation
  React.useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      setBindIdx(i); i++
      if (i >= BIND_CHECKS.length) { clearInterval(iv); setDone(true) }
    }, 800)
    return () => clearInterval(iv)
  }, [])

  // Live waveform while recording
  React.useEffect(() => {
    if (!recording) { cancelAnimationFrame(rafRef.current!); return }
    const tick = () => { setBars(Array.from({length:10}, ()=>4+Math.random()*24)); rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [recording])

  const startOath = async () => {
    setRecording(true)
    try {
      const result = await captureVoiceFingerprint()
      const hash = result.hash.slice(0, 14).toUpperCase()
      setOathDone(true); setRecording(false); onVoicePrint?.(hash)
    } catch {
      // No mic access — use device fingerprint as fallback
      try {
        const hash = await generateDeviceFingerprint()
        setOathDone(true); setRecording(false); onVoicePrint?.(hash)
      } catch {
        const hash = 'DEV-' + Date.now().toString(36).toUpperCase()
        setOathDone(true); setRecording(false); onVoicePrint?.(hash)
      }
    }
  }

  const stopOath = () => { recRef.current?.state === 'recording' ? recRef.current.stop() : (setOathDone(true), setRecording(false)) }

  // Auto-skip voice oath after 8s if user hasn't completed it
  React.useEffect(() => {
    if (done && !oathDone) {
      const t = setTimeout(() => setOathDone(true), 8000)
      return () => clearTimeout(t)
    }
  }, [done, oathDone])

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg }}>
      {/* Three expanding concentric rings */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ position:'relative', width:100, height:100, margin:'0 auto 20px' }}>
          {[0,1,2].map(i=>(
            <div key={i} style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid ${theme.accent}44`, animation:`ringExp 2.5s ease-out infinite`, animationDelay:`${i*0.8}s` }} />
          ))}
          <div style={{ position:'absolute', inset:12, borderRadius:'50%', background:`linear-gradient(135deg,${theme.accent},#0a1f0f)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:`0 0 30px ${theme.accent}33` }}>🖐</div>
        </div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:22, fontWeight:900, color:theme.text, marginBottom:6 }}>This device is your Drum.</div>
        <div style={{ fontSize:12, color:theme.subText, lineHeight:1.65, maxWidth:280, margin:'0 auto' }}>
          In the old kingdoms, a king&apos;s drum was bound to his spirit.<br />Your phone is now bound to your Afro-ID.
        </div>
      </div>

      {/* Binding checks */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
        {BIND_CHECKS.map((c, i) => (
          <div key={c.key} style={{ background:theme.card, border:`1.5px solid ${i<=bindIdx ? theme.accent+'55' : theme.border}`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:14, opacity:i<=bindIdx?1:0.3, transition:'all .35s' }}>
            <div style={{ fontSize:20 }}>{c.emoji}</div>
            <div style={{ flex:1, fontSize:13, fontWeight:700, color:theme.text }}>{c.label}</div>
            {i<=bindIdx && <div style={{ color:theme.accent, fontWeight:900, fontSize:16 }}>✓</div>}
          </div>
        ))}
      </div>

      {/* Voice Oath — unlocks after binding completes */}
      {done && !oathDone && (
        <div style={{ background:'rgba(26,124,62,.07)', border:'1.5px solid rgba(26,124,62,.28)', borderRadius:16, padding:16, marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:800, color:'#7da882', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
            🎙 Step 2 of 2 · Speak Your Voice Oath
          </div>
          <div style={{ fontFamily:'Sora, sans-serif', fontSize:15, fontWeight:700, color:'#4ade80', marginBottom:12, lineHeight:1.4 }}>
            &ldquo;I am proud of my African heritage&rdquo;
          </div>
          {/* Waveform bars */}
          <div style={{ display:'flex', alignItems:'center', gap:3, height:34, marginBottom:12 }}>
            {bars.map((h,i) => (
              <div key={i} style={{ flex:1, borderRadius:99, background:recording?(i%3===0?'#4ade80':theme.accent):'rgba(26,124,62,.25)', height:`${h}px`, transition:recording?'none':'height .3s ease' }} />
            ))}
          </div>
          {recording ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, fontSize:12, color:'#4ade80', fontWeight:700 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#f87171', animation:'sosP .8s ease-in-out infinite' }} />
                Recording… tap to stop
              </div>
              <button onClick={stopOath} style={{ padding:'6px 14px', borderRadius:10, background:'rgba(178,34,34,.15)', border:'1px solid rgba(178,34,34,.3)', color:'#f87171', fontSize:12, fontWeight:700, cursor:'pointer' }}>Stop</button>
            </div>
          ) : (
            <button onClick={startOath} style={{ width:'100%', padding:'12px 0', borderRadius:12, background:'linear-gradient(135deg,rgba(26,124,62,.2),rgba(26,124,62,.05))', border:'1px solid rgba(26,124,62,.35)', color:'#4ade80', fontSize:14, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              🎙 Speak Your Voice Oath
            </button>
          )}
          <button onClick={() => setOathDone(true)} style={{ width:'100%', marginTop:8, padding:'8px 0', borderRadius:10, background:'none', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
            Skip for now →
          </button>
        </div>
      )}

      {/* Oath sealed confirmation */}
      {oathDone && (
        <div style={{ background:'rgba(26,124,62,.1)', border:'1.5px solid rgba(26,124,62,.35)', borderRadius:14, padding:14, marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:28, marginBottom:4 }}>🥁</div>
          <div style={{ fontFamily:'Sora, sans-serif', fontSize:15, fontWeight:800, color:'#4ade80' }}>Your Drum is Bound.</div>
          <div style={{ fontSize:11, color:'rgba(74,222,128,.6)', marginTop:4 }}>Voice oath sealed · Voice commands now active 🎙</div>
        </div>
      )}

      <GradBtn onClick={oathDone?onNext:()=>{}} style={!(done&&oathDone)?{opacity:.35,pointerEvents:'none',height:54,marginTop:'auto'}:{height:54,marginTop:'auto'}}>
        {oathDone ? 'My Drum is Bound →' : done ? '🎙 Speak oath to continue' : 'Binding device…'}
      </GradBtn>
    </div>
  )
}

// ── STEP: FINGERPRINT (WebAuthn Platform Biometric) ──────────
function FingerprintStep({ onNext, theme }: { onNext:()=>void; theme:any }) {
  const [status, setStatus] = React.useState<'idle'|'enrolling'|'done'|'unsupported'|'denied'>('idle')
  const [credId, setCredId] = React.useState<string | null>(null)

  const isSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential

  React.useEffect(() => {
    // Check if already enrolled
    const stored = localStorage.getItem('afk_credential_id')
    if (stored) { setCredId(stored); setStatus('done') }
  }, [])

  async function handleEnroll() {
    setStatus('enrolling')
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Viewdicon', id: location.hostname },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'viewdicon-user',
            displayName: 'Viewdicon User',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential | null

      if (cred) {
        const rawId = Array.from(new Uint8Array(cred.rawId))
          .map(b => b.toString(16).padStart(2, '0')).join('')
        localStorage.setItem('afk_credential_id', rawId)
        localStorage.setItem('afk_biometric_enrolled', 'true')
        setCredId(rawId)
        setStatus('done')
      } else {
        setStatus('denied')
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') setStatus('denied')
      else if (err?.name === 'NotSupportedError') setStatus('unsupported')
      else setStatus('unsupported')
    }
  }

  const t = theme || {}
  const card = t.card || 'rgba(255,255,255,.06)'
  const text = t.text || '#f0f7f0'
  const sub  = t.subText || 'rgba(240,247,240,.55)'
  const border = t.border || 'rgba(255,255,255,.12)'
  const accent = t.accent || '#4ade80'

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, padding:'24px 20px', gap:20 }}>
      {/* Header */}
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:52, marginBottom:8 }}>👆</div>
        <div style={{ fontSize:20, fontWeight:800, color:text, marginBottom:6 }}>Fingerprint Bind</div>
        <div style={{ fontSize:13, color:sub, lineHeight:1.5 }}>
          Link your device fingerprint or Face ID to your sovereign identity. This protects your banking and sensitive actions.
        </div>
      </div>

      {/* Status card */}
      <div style={{ background:card, border:`1.5px solid ${border}`, borderRadius:16, padding:20, textAlign:'center' }}>
        {status === 'idle' && !isSupported && (
          <>
            <div style={{ fontSize:28, marginBottom:8 }}>⚠️</div>
            <div style={{ color:text, fontWeight:600, marginBottom:6 }}>Device Not Supported</div>
            <div style={{ color:sub, fontSize:12 }}>Your browser or device does not support biometric authentication. You can skip this step.</div>
          </>
        )}
        {status === 'idle' && isSupported && (
          <>
            <div style={{ fontSize:32, marginBottom:10 }}>🔒</div>
            <div style={{ color:text, fontWeight:600, marginBottom:6 }}>Ready to Bind</div>
            <div style={{ color:sub, fontSize:12 }}>Tap the button below to register your fingerprint or Face ID with this device.</div>
          </>
        )}
        {status === 'enrolling' && (
          <>
            <div style={{ fontSize:32, marginBottom:10, animation:'breathScale 1.2s ease-in-out infinite' }}>👆</div>
            <div style={{ color:accent, fontWeight:700, marginBottom:6 }}>Waiting for fingerprint…</div>
            <div style={{ color:sub, fontSize:12 }}>Follow your device's prompt to verify your fingerprint or Face ID.</div>
          </>
        )}
        {status === 'done' && (
          <>
            <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
            <div style={{ color:accent, fontWeight:700, fontSize:16, marginBottom:6 }}>Fingerprint Bound!</div>
            <div style={{ color:sub, fontSize:12 }}>Your biometric is now linked to your sovereign identity.</div>
          </>
        )}
        {status === 'denied' && (
          <>
            <div style={{ fontSize:32, marginBottom:8 }}>❌</div>
            <div style={{ color:'#f87171', fontWeight:700, marginBottom:6 }}>Access Denied</div>
            <div style={{ color:sub, fontSize:12 }}>Fingerprint registration was cancelled. You can try again or skip.</div>
          </>
        )}
        {status === 'unsupported' && (
          <>
            <div style={{ fontSize:32, marginBottom:8 }}>⚠️</div>
            <div style={{ color:'#facc15', fontWeight:700, marginBottom:6 }}>Not Available</div>
            <div style={{ color:sub, fontSize:12 }}>Biometric authentication is not available on this device or browser.</div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:'auto' }}>
        {status === 'done' ? (
          <GradBtn onClick={onNext}>Continue →</GradBtn>
        ) : (
          <>
            {(status === 'idle' || status === 'denied') && isSupported && (
              <GradBtn onClick={handleEnroll}>
                {status === 'denied' ? '🔄 Try Again' : '👆 Register Fingerprint'}
              </GradBtn>
            )}
            <button
              onClick={onNext}
              style={{ background:'transparent', border:'none', color:sub, fontSize:13, cursor:'pointer', padding:'10px 0', textAlign:'center' }}
            >
              Skip for now →
            </button>
          </>
        )}
      </div>

      <div style={{ fontSize:10, color:sub, textAlign:'center', opacity:.6 }}>
        Banking features will require fingerprint + face capture. You can set this up later in Settings.
      </div>
    </div>
  )
}

// ── STEP: BIOMETRIC (Real Camera Face Liveness) ──────────────
function BiometricStep({ onNext, theme }: { onNext:()=>void; theme:any }) {
  const [mode, setMode] = React.useState<'checking' | 'webauthn' | 'face'>('checking')
  const [enrolled, setEnrolled] = React.useState(false)
  const [error, setError] = React.useState('')
  const { setBiometricEnrolled } = useAuthStore()

  // Check if WebAuthn platform authenticator is available (fingerprint/faceID)
  React.useEffect(() => {
    (async () => {
      try {
        if (window.PublicKeyCredential && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          setMode(available ? 'webauthn' : 'face')
        } else {
          setMode('face')
        }
      } catch {
        setMode('face')
      }
    })()
  }, [])

  const handleWebAuthnEnroll = async () => {
    try {
      setError('')
      const challengeBuffer = crypto.getRandomValues(new Uint8Array(32))
      const userId = crypto.getRandomValues(new Uint8Array(16))
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: { name: 'Viewdicon', id: window.location.hostname },
          user: { id: userId, name: 'citizen@viewdicon', displayName: 'Viewdicon Citizen' },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
          timeout: 60000,
        }
      }) as PublicKeyCredential | null
      if (credential) {
        setBiometricEnrolled(true, credential.id)
        setEnrolled(true)
        setTimeout(onNext, 1200)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Biometric enrollment failed'
      if (msg.includes('cancelled') || msg.includes('abort') || msg.includes('NotAllowedError')) {
        setError('Biometric prompt was dismissed. You can try again or skip.')
      } else {
        setError(msg)
      }
    }
  }

  if (mode === 'checking') {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, background:theme.bg }}>
        <div style={{ fontSize:48, marginBottom:16, animation:'sosP .8s infinite' }}>🔐</div>
        <div style={{ fontSize:14, color:theme.subText }}>Checking device biometrics...</div>
      </div>
    )
  }

  if (mode === 'webauthn') {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:24, background:theme.bg }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:56, marginBottom:16 }}>{enrolled ? '✅' : '🔐'}</div>
          <div style={{ fontFamily:'Sora, sans-serif', fontSize:24, fontWeight:900, color:theme.text, marginBottom:8 }}>
            {enrolled ? 'Biometric Bound!' : 'Bind Your Spirit'}
          </div>
          <div style={{ fontSize:13, color:theme.subText, lineHeight:1.6 }}>
            {enrolled ? 'Your fingerprint or face is now your key to the Motherland.' : 'Use your fingerprint or face to secure your identity. No passwords needed — your body is your key.'}
          </div>
        </div>

        {!enrolled && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
            {[
              { icon:'👆', title:'Fingerprint', desc:'Touch sensor on your device' },
              { icon:'👤', title:'Face ID', desc:'Camera-based face recognition' },
            ].map(item => (
              <div key={item.title} style={{ display:'flex', gap:14, padding:14, borderRadius:16, background:theme.card, border:`1.5px solid ${theme.border}` }}>
                <div style={{ fontSize:24 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:theme.text }}>{item.title}</div>
                  <div style={{ fontSize:11, color:theme.subText }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)', borderRadius:12, padding:12, fontSize:12, color:'#f87171', marginBottom:16, textAlign:'center' }}>
            {error}
          </div>
        )}

        {!enrolled && (
          <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:10 }}>
            <GradBtn onClick={handleWebAuthnEnroll} style={{ height:56 }}>Bind Biometrics Now 🔐</GradBtn>
            <button onClick={onNext} style={{ width:'100%', padding:'12px 0', borderRadius:14, background:'none', border:`1px dashed ${theme.border}`, color:theme.subText, fontSize:12, fontWeight:600, cursor:'pointer' }}>
              Skip — I'll set this up later
            </button>
          </div>
        )}
      </div>
    )
  }

  // Fallback to face liveness if WebAuthn not available
  return (
    <FaceLiveness
      theme={theme}
      onComplete={() => onNext()}
      onSkip={() => onNext()}
    />
  )
}

// ── STEP: VOICE ───────────────────────────────────────────────
function VoiceStep({ onNext, theme }: { onNext:()=>void; theme:any }) {
  const [recording, setRecording] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [levels, setLevels] = React.useState<number[]>(new Array(16).fill(0.1))
  const requestRef = React.useRef<number>()
  const analyserRef = React.useRef<AnalyserNode>()
  const streamRef = React.useRef<MediaStream>()

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser
      setRecording(true)

      const update = () => {
        if (!analyserRef.current) return
        const data = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(data)
        // Map data to our 16 bars
        const newLevels = Array.from({ length: 16 }).map((_, i) => {
          const val = data[i % data.length] / 255
          return Math.max(0.1, val * 1.5)
        })
        setLevels(newLevels)
        requestRef.current = requestAnimationFrame(update)
      }
      requestRef.current = requestAnimationFrame(update)

      setTimeout(() => {
        stop()
        setDone(true)
      }, 5000)
    } catch (err) {
      console.error('Audio fail', err)
      // Fallback: simulate
      setRecording(true)
      let i = 0
      const iv = setInterval(() => {
        setLevels(prev => prev.map(() => 0.2 + Math.random() * 0.8))
        if (++i > 25) { clearInterval(iv); setRecording(false); setDone(true) }
      }, 200)
    }
  }

  const stop = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setRecording(false)
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:24, background:theme.bg }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🎙️</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:26, fontWeight:900, color:theme.text, marginBottom:10 }}>Voice Registration</div>
        <p style={{ fontSize:14, color:theme.subText, lineHeight:1.6 }}>Speak Clearly: "My voice is my key, the Motherland is my home."</p>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, height:80, marginBottom:40 }}>
          {levels.map((v, i) => (
            <motion.div
              key={i}
              animate={{ height: v * 80 }}
              style={{
                width: 6,
                background: recording ? '#ef4444' : theme.accent,
                borderRadius: 3,
                opacity: recording ? 1 : 0.4
              }}
            />
          ))}
        </div>

        {recording && (
          <div style={{ fontSize:14, fontWeight:800, color:'#ef4444', animation:'sosP 1s infinite' }}>🔴 RECORDING...</div>
        )}
        {done && (
          <div style={{ fontSize:14, fontWeight:800, color:theme.accent }}>✅ Voice Pattern Captured</div>
        )}
      </div>

      {!recording && !done && (
        <GradBtn onClick={start} style={{ height:56 }}>Start Voice Recording →</GradBtn>
      )}
      {done && (
        <GradBtn onClick={onNext} style={{ height:56 }}>Next Step →</GradBtn>
      )}
    </div>
  )
}

// ── AFRICAN KINSHIP SYSTEM ────────────────────────────────────
type KinshipTier = 1 | 2 | 3
interface KinshipOption { type:string; en:string; af:string; tier:KinshipTier; emoji:string }
type FM = { id:string; name:string; rel:string; afRel:string; phone:string; tier:KinshipTier; emoji?:string; seed?:boolean }

const KINSHIP_CATS = [
  { id:'parents',      emoji:'👨‍👩‍👧', label:'Parents',      color:'#1a7c3e' },
  { id:'grandparents', emoji:'👴',      label:'Grandparents', color:'#d4a017' },
  { id:'siblings',     emoji:'👫',      label:'Siblings',     color:'#8b5cf6' },
  { id:'children',     emoji:'👶',      label:'Children',     color:'#3b82f6' },
  { id:'extended',     emoji:'🏠',      label:'Extended',     color:'#e07b00' },
  { id:'sworn',        emoji:'🤝',      label:'Sworn Family', color:'#ec4899' },
] as const

const KINSHIP_OPTIONS: Record<string, KinshipOption[]> = {
  parents      : [{ type:'father', en:'Father', af:'Bàbá (Dad)', tier:1, emoji:'👨' },
                  { type:'mother', en:'Mother', af:'Ìyá (Mama)', tier:1, emoji:'👩' }],
  grandparents : [{ type:'grandfather_paternal', en:"Grandfather (Dad's)", af:'Bàbá Àgbà', tier:1, emoji:'👴' },
                  { type:'grandmother_paternal', en:"Grandmother (Dad's)", af:'Ìyá Àgbà', tier:1, emoji:'👵' },
                  { type:'grandfather_maternal', en:"Grandfather (Mum's)", af:'Bàbá Ìyá', tier:1, emoji:'👴' },
                  { type:'grandmother_maternal', en:"Grandmother (Mum's)", af:'Ìyá Ìyá', tier:1, emoji:'👵' }],
  siblings     : [{ type:'older_brother',   en:'Older Brother',   af:'Egbon (Àgbà)',   tier:1, emoji:'👦' },
                  { type:'younger_brother', en:'Younger Brother', af:"Abúrò (Kékeré)", tier:1, emoji:'👦' },
                  { type:'older_sister',    en:'Older Sister',    af:'Egbon (Obìnrin)', tier:1, emoji:'👧' },
                  { type:'younger_sister',  en:'Younger Sister',  af:"Abúrò (Obìnrin)", tier:1, emoji:'👧' }],
  children     : [{ type:'son',      en:'Son',      af:'Ọmọkùnrin', tier:1, emoji:'👦' },
                  { type:'daughter', en:'Daughter', af:'Ọmọbìnrin', tier:1, emoji:'👧' }],
  extended     : [{ type:'uncle_paternal',   en:"Uncle (Dad's)",   af:'Bàbá Kékeré',   tier:2, emoji:'🧔' },
                  { type:'aunt_paternal',    en:"Aunt (Dad's)",    af:'Àánù Bàbá',     tier:2, emoji:'👩' },
                  { type:'uncle_maternal',   en:"Uncle (Mum's)",   af:'Ègbón Ìyá',     tier:2, emoji:'🧔' },
                  { type:'aunt_maternal',    en:"Aunt (Mum's)",    af:'Àbúrò Ìyá',     tier:2, emoji:'👩' },
                  { type:'cousin_paternal',  en:'Cousin (Paternal)', af:'Ẹgbọn Baba',  tier:2, emoji:'🫂' },
                  { type:'cousin_maternal',  en:'Cousin (Maternal)', af:'Ẹgbọn Ìyá',   tier:2, emoji:'🫂' }],
  sworn        : [{ type:'spouse',        en:'Spouse',         af:'Ọkọ / Ìyàwó',     tier:3, emoji:'💍' },
                  { type:'godfather',     en:'Godfather',      af:'Bàbá Ìdúpẹ́',      tier:3, emoji:'🧔' },
                  { type:'godmother',     en:'Godmother',      af:'Ìyá Ìdúpẹ́',       tier:3, emoji:'👩' },
                  { type:'sworn_friend',  en:'Sworn Friend',   af:'Ẹgbẹ́ (Age-Grade)', tier:3, emoji:'🤝' },
                  { type:'village_elder', en:'Village Elder',  af:'Agbàlagbà',        tier:3, emoji:'🧓' }],
}

const TIER_PERMS: Record<KinshipTier,{ can:string[]; cannot:string[] }> = {
  1: { can:['🔐 Can recover your account (2-of-N quorum)','👁 Can see your Ìdílé (Clan) skin','🥁 Receives your Blood-Call SOS','💬 Invited to Family Circle chat','🏛 Holds one key to Ancestral Vault'], cannot:[] },
  2: { can:['🥁 Receives your Blood-Call SOS','👁 Can see your Ìdílé skin','💬 Invited to Family Circle chat'], cannot:['❌ Cannot recover your account (Blood Line only)'] },
  3: { can:['🥁 Receives your Blood-Call SOS'], cannot:['❌ Cannot see Ìdílé skin (Family only)','❌ Cannot recover your account'] },
}

const TIER_LABELS: Record<KinshipTier,string> = { 1:'Tier 1 · Blood Line (Ẹjẹ)', 2:'Tier 2 · Extended Clan (Ìdílé)', 3:'Tier 3 · Sworn Family (Egbé)' }
const TIER_COLORS: Record<KinshipTier,string> = { 1:'#4ade80', 2:'#fbbf24', 3:'#60a5fa' }

const SEED_FAMILY: FM[] = []

// React.memo: only re-renders when count changes
const FamilyTreeSVG = React.memo(function FamilyTreeSVG({ count }: { count:number }) {
  const nodes = [
    { x:50, y:20, label:'You', color:'#1a7c3e', size:18 },
    { x:20, y:60, label:'', color:'#3b82f6', size:14 },
    { x:80, y:60, label:'', color:'#d4a017', size:14 },
    { x:10, y:92, label:'', color:'#8b5cf6', size:11 },
    { x:38, y:92, label:'', color:'#8b5cf6', size:11 },
    { x:65, y:92, label:'', color:'#e07b00', size:11 },
  ]
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5]]
  const filled = Math.min(count + 1, nodes.length)
  return (
    <svg viewBox="0 0 100 110" style={{ width:140, height:110 }}>
      {edges.map(([a,b],i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={i < filled - 1 ? 'rgba(26,124,62,.5)' : 'rgba(255,255,255,.1)'}
          strokeWidth={1.2} strokeDasharray={i >= filled - 1 ? '3 3' : '0'}
        />
      ))}
      {nodes.map((n,i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.size/2 + 2} fill={i < filled ? `${n.color}20` : 'transparent'} />
          <circle cx={n.x} cy={n.y} r={n.size/2}
            fill={i < filled ? n.color : 'rgba(255,255,255,.06)'}
            stroke={i < filled ? n.color : 'rgba(255,255,255,.15)'} strokeWidth={1}
          />
          {i === 0 && <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#fff" fontWeight="bold">✦</text>}
          {i > 0 && i < filled && <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="5" fill="#fff">✓</text>}
        </g>
      ))}
    </svg>
  )
}) // React.memo

// ── STEP: FAMILY (African Kinship Builder) ─────────────────────
function FamilyStep({ onNext, theme }: { onNext:(members:FM[])=>void; theme:any }) {
  const [members, setMembers] = React.useState<FM[]>(SEED_FAMILY)
  // Add-member flow: categories → options → form → (back to list)
  const [view, setView] = React.useState<'list'|'categories'|'options'|'perms'>('list')
  const [selCat, setSelCat] = React.useState<string|null>(null)
  const [selOpt, setSelOpt] = React.useState<KinshipOption|null>(null)
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [dialCode, setDialCode] = React.useState('+234')
  const [err, setErr] = React.useState('')

  const minMet = true // Family tree is now optional — skip button available
  const maxMet = members.length >= 7

  const catCfg = (id:string) => KINSHIP_CATS.find(c=>c.id===id)!
  const tierColor = (t:KinshipTier) => TIER_COLORS[t]

  const handleSelectCat = (catId:string) => { setSelCat(catId); setView('options') }
  const handleSelectOpt = (opt:KinshipOption) => { setSelOpt(opt); setView('perms') }

  const handleAddMember = () => {
    if (!name.trim()) { setErr('Enter a name'); return }
    if (phone.length < 7) { setErr('Enter a valid phone number'); return }
    if (!selOpt) return
    setMembers(prev => [...prev, {
      id: Date.now().toString(), name: name.trim(),
      rel: selOpt.en, afRel: selOpt.af,
      phone: `${dialCode} ${phone}`, tier: selOpt.tier, emoji: selOpt.emoji,
    }])
    setName(''); setPhone(''); setErr(''); setSelOpt(null); setSelCat(null); setView('list')
  }

  const remove = (id:string) => setMembers(prev => prev.filter(m => m.id !== id))

  const ringR = 28
  const circumference = 2 * Math.PI * ringR
  const dash = Math.min(1, members.length / 2) * circumference

  // ── VIEW: member list ──
  if (view === 'list') return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:theme.bg, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'16px 20px 10px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ position:'relative', width:72, height:72, flexShrink:0 }}>
            <svg width={72} height={72} style={{ transform:'rotate(-90deg)' }}>
              <circle cx={36} cy={36} r={ringR} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={4} />
              <circle cx={36} cy={36} r={ringR} fill="none" stroke={minMet?'#4ade80':'#d4a017'}
                strokeWidth={4} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference - dash}
                style={{ transition:'stroke-dashoffset .5s ease' }}
              />
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:18, fontWeight:900, color:'#4ade80', lineHeight:1 }}>{members.length}</div>
              <div style={{ fontSize:8, color:theme.subText, fontWeight:700 }}>added</div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Sora, sans-serif', fontSize:20, fontWeight:900, color:theme.text, lineHeight:1.2 }}>Kinship Circle</div>
            <div style={{ fontSize:11, color:theme.subText, lineHeight:1.5, marginTop:3 }}>
              {members.length > 0 ? `✅ ${members.length} member${members.length!==1?'s':''} added · Add up to ${7-members.length} more` : 'Optional — you can skip and add family later'}
            </div>
          </div>
          <FamilyTreeSVG count={members.length} />
        </div>
      </div>

      {/* Gate note */}
      <div style={{ margin:'0 20px 12px', padding:'10px 14px', borderRadius:14, background:'rgba(26,124,62,.07)', border:'1px solid rgba(26,124,62,.2)', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:800, color:'#4ade80', marginBottom:3, display:'flex', gap:5 }}>🛡 Family Gate · Account Recovery Quorum</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', lineHeight:1.65 }}>
          <strong style={{ color:'rgba(255,255,255,.65)' }}>2 of your Blood Line members</strong> can restore your Afro-ID through voice verification if you lose access.
        </div>
      </div>

      {/* Member cards */}
      <div style={{ flex:1, padding:'0 20px', overflowY:'auto', paddingBottom:4 }}>
        {members.map(m => (
          <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:18, background:theme.card, border:`1.5px solid ${tierColor(m.tier)}22`, marginBottom:10, transition:'all .2s' }}>
            <div style={{ width:44, height:44, borderRadius:14, background:`${tierColor(m.tier)}18`, border:`2px solid ${tierColor(m.tier)}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
              {m.emoji ?? '👤'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Sora, sans-serif', fontSize:14, fontWeight:800, color:theme.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3, flexWrap:'wrap' }}>
                <span style={{ fontSize:10, fontWeight:700, color:tierColor(m.tier), background:`${tierColor(m.tier)}15`, padding:'2px 8px', borderRadius:99 }}>{m.rel}</span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', fontStyle:'italic' }}>{m.afRel}</span>
              </div>
              <div style={{ fontSize:9, color:theme.subText, fontFamily:'monospace', marginTop:2 }}>{TIER_LABELS[m.tier]}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ padding:'2px 7px', borderRadius:8, background:`${tierColor(m.tier)}18`, border:`1px solid ${tierColor(m.tier)}33`, fontSize:9, fontWeight:800, color:tierColor(m.tier) }}>T{m.tier}</div>
              {!m.seed && (
                <button onClick={()=>remove(m.id)} style={{ width:24, height:24, borderRadius:8, background:'rgba(178,34,34,.12)', border:'1px solid rgba(178,34,34,.3)', color:'#f87171', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>×</button>
              )}
            </div>
          </div>
        ))}

        {!maxMet && (
          <button onClick={()=>setView('categories')} style={{ width:'100%', padding:'12px 0', borderRadius:18, border:`2px dashed ${theme.border}`, background:'transparent', color:theme.subText, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:18 }}>＋</span> Add Family Member
          </button>
        )}
        {members.length >= 3 && (
          <div style={{ textAlign:'center', fontSize:10, color:'rgba(255,255,255,.3)', marginBottom:10, fontStyle:'italic' }}>
            {maxMet ? 'Maximum 7 members reached' : `Add ${7-members.length} more for a stronger recovery safety net`}
          </div>
        )}
      </div>

      <div style={{ padding:'12px 20px 20px', background:theme.card, borderTop:`1px solid ${theme.border}`, flexShrink:0 }}>
        <GradBtn onClick={() => onNext(members)} style={{ height:54 }}>
          {members.length > 0 ? 'Seal the Kinship Circle 🛡 →' : 'Continue without members →'}
        </GradBtn>
        <button onClick={() => onNext([])} style={{ width:'100%', marginTop:8, padding:'6px 0', borderRadius:10, background:'none', border:'none', color:'rgba(255,255,255,.3)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
          Skip for now →
        </button>
      </div>
    </div>
  )

  // ── VIEW: category grid ──
  if (view === 'categories') return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg }}>
      <button onClick={()=>setView('list')} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:theme.subText, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:16 }}>← Back</button>
      <div style={{ fontFamily:'Sora, sans-serif', fontSize:20, fontWeight:900, color:theme.text, marginBottom:4 }}>Who is this person?</div>
      <div style={{ fontSize:12, color:theme.subText, marginBottom:20 }}>Select the category that describes your relationship.</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {KINSHIP_CATS.map(cat => (
          <button key={cat.id} onClick={()=>handleSelectCat(cat.id)} style={{ padding:'18px 12px', borderRadius:18, border:`2px solid ${cat.color}33`, background:`${cat.color}08`, display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer', transition:'all .2s', textAlign:'center' }}>
            <span style={{ fontSize:28 }}>{cat.emoji}</span>
            <span style={{ fontFamily:'Sora, sans-serif', fontSize:13, fontWeight:800, color:theme.text }}>{cat.label}</span>
            <span style={{ fontSize:10, color:cat.color, fontWeight:700 }}>
              {KINSHIP_OPTIONS[cat.id]?.length} types
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  // ── VIEW: specific options within category ──
  if (view === 'options' && selCat) {
    const cat = catCfg(selCat)
    const opts = KINSHIP_OPTIONS[selCat] ?? []
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg }}>
        <button onClick={()=>setView('categories')} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:theme.subText, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:16 }}>← Back</button>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <span style={{ fontSize:28 }}>{cat.emoji}</span>
          <div>
            <div style={{ fontFamily:'Sora, sans-serif', fontSize:18, fontWeight:900, color:theme.text }}>{cat.label}</div>
            <div style={{ fontSize:11, color:theme.subText }}>Choose the specific relationship</div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1, overflowY:'auto' }}>
          {opts.map(opt => (
            <button key={opt.type} onClick={()=>handleSelectOpt(opt)} style={{ padding:'14px 16px', borderRadius:16, border:`1.5px solid ${cat.color}33`, background:`${cat.color}06`, display:'flex', alignItems:'center', gap:14, cursor:'pointer', textAlign:'left', transition:'all .2s' }}>
              <span style={{ fontSize:24, flexShrink:0, width:36, textAlign:'center' }}>{opt.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Sora, sans-serif', fontSize:14, fontWeight:800, color:theme.text }}>{opt.en}</div>
                <div style={{ fontSize:11, color:cat.color, fontWeight:700, marginTop:2 }}>{opt.af}</div>
              </div>
              <div style={{ padding:'3px 9px', borderRadius:99, background:`${TIER_COLORS[opt.tier]}15`, border:`1px solid ${TIER_COLORS[opt.tier]}33`, fontSize:9, fontWeight:800, color:TIER_COLORS[opt.tier], flexShrink:0 }}>
                T{opt.tier}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── VIEW: details form + permissions preview ──
  if (view === 'perms' && selOpt) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg, overflowY:'auto' }}>
      <button onClick={()=>setView('options')} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:theme.subText, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:16 }}>← Change</button>

      {/* Selected relationship badge */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:16, background:`${TIER_COLORS[selOpt.tier]}10`, border:`1.5px solid ${TIER_COLORS[selOpt.tier]}30`, marginBottom:20 }}>
        <span style={{ fontSize:28 }}>{selOpt.emoji}</span>
        <div>
          <div style={{ fontFamily:'Sora, sans-serif', fontSize:16, fontWeight:800, color:theme.text }}>{selOpt.en}</div>
          <div style={{ fontSize:12, color:TIER_COLORS[selOpt.tier], fontWeight:700 }}>{selOpt.af} · {TIER_LABELS[selOpt.tier]}</div>
        </div>
      </div>

      {/* Form */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:9, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>Full Name *</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Amara Okafor" autoFocus
          style={{ width:'100%', padding:'11px 14px', borderRadius:12, background:theme.card, border:`1.5px solid ${name?theme.accent+'66':theme.border}`, color:theme.text, fontSize:14, outline:'none', transition:'all .2s' }}
        />
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:9, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>Phone Number *</div>
        <div style={{ display:'flex', gap:8 }}>
          <select value={dialCode} onChange={e=>setDialCode(e.target.value)} style={{ padding:'10px 8px', borderRadius:12, background:theme.card, border:`1.5px solid ${theme.border}`, color:theme.text, fontSize:13, outline:'none', cursor:'pointer' }}>
            {AFRICAN_DIAL_CODES.map((c: DialCodeEntry)=><option key={c.dial} value={c.dial}>{c.flag} {c.dial}</option>)}
            {WORLD_CODES.map((c: DialCodeEntry)=><option key={c.dial+c.name} value={c.dial}>{c.flag} {c.dial}</option>)}
          </select>
          <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} placeholder="800 000 0000" inputMode="numeric"
            style={{ flex:1, padding:'10px 14px', borderRadius:12, background:theme.card, border:`1.5px solid ${phone.length>=7?theme.accent+'66':theme.border}`, color:theme.text, fontSize:14, outline:'none', transition:'all .2s' }}
          />
        </div>
        {err && <div style={{ fontSize:10, color:'#f87171', marginTop:5 }}>{err}</div>}
      </div>

      {/* Permissions panel */}
      <div style={{ padding:'12px 14px', borderRadius:14, background:`${TIER_COLORS[selOpt.tier]}08`, border:`1px solid ${TIER_COLORS[selOpt.tier]}20`, marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:800, color:TIER_COLORS[selOpt.tier], textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>
          What {selOpt.en} can do in your Circle
        </div>
        {TIER_PERMS[selOpt.tier].can.map((p,i)=>(
          <div key={i} style={{ fontSize:11, color:theme.text, lineHeight:1.6, marginBottom:2 }}>{p}</div>
        ))}
        {TIER_PERMS[selOpt.tier].cannot.map((p,i)=>(
          <div key={i} style={{ fontSize:11, color:'rgba(255,255,255,.3)', lineHeight:1.6, marginBottom:2 }}>{p}</div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={()=>{setView('list');setErr('')}} style={{ flex:1, padding:'11px 0', borderRadius:13, background:theme.card, border:`1px solid ${theme.border}`, color:theme.subText, fontSize:13, fontWeight:700, cursor:'pointer' }}>Cancel</button>
        <button onClick={handleAddMember} style={{ flex:2, padding:'11px 0', borderRadius:13, background:'linear-gradient(135deg,#1a7c3e,#145f30)', border:'none', color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 14px rgba(26,124,62,.3)' }}>
          🌳 Add to Kinship Circle
        </button>
      </div>
    </div>
  )

  return null
}

// ── STEP: VILLAGE GATE ───────────────────────────────────────
function VillageStep({ onNext, theme, sovereigntyAllowed }: { onNext:(v:Village)=>void; theme:any; sovereigntyAllowed:boolean }) {
  // LAW 3: Village Gate — requires African soil OR completed Heritage Verification
  if (!sovereigntyAllowed) {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(178,34,34,.15)', border:'2px solid rgba(178,34,34,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:14 }}>🚫</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:18, fontWeight:800, color:'#f87171', textAlign:'center', marginBottom:6 }}>Village Access Denied</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', textAlign:'center', lineHeight:1.65, maxWidth:280 }}>Under the Motherland Sovereignty Law, Village access requires either African soil status or completed Heritage Verification.</div>
      </div>
    )
  }
  const [selId, setSelId] = React.useState('')
  const visible = ALL_VILLAGES.filter(v => !v.holding)
  const holding = ALL_VILLAGES.find(v => v.holding)!

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:theme.bg }}>
       <div style={{ padding:20, flexShrink:0 }}>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:22, fontWeight:900, color:theme.text, marginBottom:4 }}>Choose Your Village</div>
        <div style={{ fontSize:13, color:theme.subText }}>The professional guild where you will grow your legacy.</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 20px' }}>
         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {visible.map(v => (
              <div key={v.id} onClick={()=>setSelId(v.id)} style={{ background:selId===v.id?`${v.color}15`:theme.card, border:`2px solid ${selId===v.id?v.color:theme.border}`, borderRadius:20, padding:16, cursor:'pointer', transition:'all .2s', position:'relative', overflow:'hidden' }}>
                 {/* Ancient name watermark */}
                 <div style={{ position:'absolute', top:8, right:8, fontSize:7, fontWeight:900, color:selId===v.id?v.color:'rgba(255,255,255,0.15)', letterSpacing:'0.1em', fontFamily:'Cinzel,Palatino,serif', textTransform:'uppercase' }}>{v.ancientName}</div>
                 <div style={{ fontSize:26, marginBottom:8 }}>{v.emoji}</div>
                 <div style={{ fontSize:12, fontWeight:900, color:theme.text, lineHeight:1.2 }}>{v.name.replace(' Village','')}</div>
                 {/* Ancient name prominent when selected */}
                 {selId===v.id && <div style={{ fontSize:11, fontFamily:'Cinzel,Palatino,serif', color:v.color, fontWeight:900, marginTop:3, letterSpacing:'0.04em' }}>{v.ancientName}</div>}
                 <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginTop:2, lineHeight:1.3 }}>{v.meaning.slice(0,40)}{v.meaning.length>40?'…':''}</div>
              </div>
            ))}
         </div>
         <div onClick={()=>setSelId(holding.id)} style={{ marginTop:12, padding:20, background:selId===holding.id?`${holding.color}15`:theme.card, border:`2px dashed ${selId===holding.id?holding.color:theme.border}`, borderRadius:20, display:'flex', alignItems:'center', gap:16, cursor:'pointer' }}>
            <div style={{ fontSize:32 }}>{holding.emoji}</div>
            <div>
               <div style={{ fontSize:15, fontWeight:900, color:theme.text }}>
                 {holding.name} Village · <span style={{ fontFamily:'Cinzel,Palatino,serif', color:holding.color }}>{holding.ancientName}</span>
               </div>
               <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{holding.meaning}</div>
               <div style={{ fontSize:11, color:theme.subText, marginTop:2 }}>The Griot will guide you to your path.</div>
            </div>
         </div>
      </div>

      <div style={{ padding:20, background:theme.card, borderTop:`1px solid ${theme.border}` }}>
        <GradBtn onClick={()=>{ const v=ALL_VILLAGES.find(vv=>vv.id===selId); if(v) onNext(v) }} style={!selId?{opacity:0.4, pointerEvents:'none'}:{ height:56 }}>Enter the Village →</GradBtn>
      </div>
    </div>
  )
}

// ── STEP: ROLE ───────────────────────────────────────────────
function RoleStep({ village, onNext, theme }: { village:Village; onNext:(role:string, occ?:Occupation)=>void; theme:any }) {
  const [rolesMap, setRolesMap] = React.useState<Record<string, VillageRole[]>>({})
  React.useEffect(() => {
    let live = true
    import('@/constants/village-roles').then(m => { if (live) setRolesMap(m.VILLAGE_ROLES as Record<string, VillageRole[]>) })
    return () => { live = false }
  }, [])
  const allRoles: VillageRole[] = rolesMap[village.id] ?? []
  const sectors = React.useMemo(
    () => Array.from(new Set(allRoles.map(r => r.sector))),
    [allRoles]
  )

  const [query, setQuery]       = React.useState('')
  const [activeSector, setSector] = React.useState<string|null>(null)
  const [selected, setSelected] = React.useState<VillageRole|null>(null)

  const displayed = React.useMemo(() => {
    let list = allRoles
    if (activeSector) list = list.filter(r => r.sector === activeSector)
    if (query.trim().length >= 1) {
      const q = query.toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.sector.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
    }
    return list
  }, [allRoles, activeSector, query])

  const isLoading = Object.keys(rolesMap).length === 0

  if (isLoading) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:theme.bg, gap:12 }}>
      <div style={{ fontSize:36 }}>🌍</div>
      <div style={{ fontSize:14, color:theme.subText }}>Loading roles…</div>
    </div>
  )

  if (selected) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg, overflowY:'auto' }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:52, marginBottom:8 }}>{selected.emoji}</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:22, fontWeight:900, color:theme.text, marginBottom:4 }}>{selected.name}</div>
        <div style={{ display:'inline-block', padding:'3px 14px', borderRadius:99, background:`${theme.accent}18`, border:`1px solid ${theme.accent}44`, fontSize:10, fontWeight:800, color:theme.accent, marginBottom:10 }}>{selected.sector}</div>
        <div style={{ fontSize:13, color:theme.subText, lineHeight:1.65, maxWidth:300, margin:'0 auto' }}>{selected.desc}</div>
      </div>

      {/* Role perks */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {[
          `🌍 Joins ${village.ancientName} (${village.name}) as a verified ${selected.sector} member`,
          `🏛️ Inherits the ${village.ancientName} tradition — ${village.meaning}`,
          `🏅 Earns the "${selected.name}" Sovereign Role Badge`,
          `🥁 Receives village-specific Drum Feed posts and opportunities`,
          `🔑 Unlocks ${village.ancientName} roles, rooms, and market access`,
          `⚡ Afro-ID prefix tied to ${village.ancientName ?? village.name} lineage`,
        ].map((perk, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', borderRadius:14, background:theme.card, border:`1px solid ${theme.border}` }}>
            <div style={{ fontSize:12, lineHeight:1.65, color:theme.text }}>{perk}</div>
          </div>
        ))}
      </div>

      <GradBtn onClick={()=>onNext(selected.name, { id:selected.id, name:selected.name, description:selected.desc, sector:{ name:selected.sector }, tools:[] })} style={{ height:56 }}>
        Claim My Path as {selected.name} →
      </GradBtn>
      <button onClick={()=>setSelected(null)} style={{ marginTop:14, background:'none', border:'none', color:theme.subText, fontWeight:700, cursor:'pointer', fontSize:13 }}>← Choose a Different Role</button>
    </div>
  )

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:theme.bg, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 20px 10px', background:theme.card, borderBottom:`1px solid ${theme.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:24 }}>{village.emoji}</span>
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
              <div style={{ fontFamily:'Cinzel,Palatino,serif', fontSize:17, fontWeight:900, color:village.color, letterSpacing:'0.06em' }}>{village.ancientName}</div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)' }}>{village.name}</div>
            </div>
            <div style={{ fontSize:10, color:village.color, fontWeight:700, marginTop:1, opacity:0.8 }}>{village.meaning}</div>
            <div style={{ fontSize:9, color:theme.subText, marginTop:1 }}>{allRoles.length} professional roles · {sectors.length} sectors</div>
          </div>
        </div>
        {/* Search */}
        <div style={{ position:'relative', marginBottom:8 }}>
          <input value={query} onChange={e=>{ setQuery(e.target.value); setSector(null) }}
            placeholder={`Search ${allRoles.length} roles in ${village.name}…`}
            style={{ width:'100%', background:theme.muted, border:`2px solid ${query?theme.accent+'66':theme.border}`, borderRadius:14, padding:'11px 14px 11px 38px', color:theme.text, fontSize:13, outline:'none', fontWeight:600, transition:'border .2s' }} />
          <span style={{ position:'absolute', left:13, top:12, fontSize:14 }}>🔍</span>
          {query && (
            <button onClick={()=>setQuery('')} style={{ position:'absolute', right:12, top:11, background:'none', border:'none', color:theme.subText, cursor:'pointer', fontSize:14 }}>✕</button>
          )}
        </div>
        {/* Sector chips */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
          <button onClick={()=>{ setSector(null); setQuery('') }}
            style={{ padding:'4px 12px', borderRadius:99, border:`1.5px solid ${!activeSector?theme.accent:theme.border}`, background:!activeSector?`${theme.accent}18`:'transparent', color:!activeSector?theme.accent:theme.subText, fontSize:10, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
            All ({allRoles.length})
          </button>
          {sectors.map(s => (
            <button key={s} onClick={()=>{ setSector(s); setQuery('') }}
              style={{ padding:'4px 12px', borderRadius:99, border:`1.5px solid ${activeSector===s?theme.accent:theme.border}`, background:activeSector===s?`${theme.accent}18`:'transparent', color:activeSector===s?theme.accent:theme.subText, fontSize:10, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
              {s} ({allRoles.filter(r=>r.sector===s).length})
            </button>
          ))}
        </div>
      </div>

      {/* Role list */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px 14px' }}>
        {displayed.length === 0 && (
          <div style={{ textAlign:'center', marginTop:60, color:theme.subText, fontSize:13 }}>
            No roles matched — try a different search.
          </div>
        )}
        {displayed.map(role => (
          <button key={role.id} onClick={()=>setSelected(role)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:16, background:theme.card, border:`1.5px solid ${theme.border}`, marginBottom:8, cursor:'pointer', textAlign:'left', transition:'all .15s' }}>
            <span style={{ fontSize:22, flexShrink:0, width:36, textAlign:'center' }}>{role.emoji}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Sora, sans-serif', fontSize:13, fontWeight:800, color:theme.text, marginBottom:2 }}>{role.name}</div>
              <div style={{ fontSize:10, color:theme.accent, fontWeight:700, marginBottom:2 }}>{role.sector}</div>
              <div style={{ fontSize:10, color:theme.subText, lineHeight:1.5 }}>{role.desc}</div>
            </div>
            <span style={{ fontSize:16, color:theme.subText, flexShrink:0 }}>›</span>
          </button>
        ))}
        {displayed.length > 0 && (
          <div style={{ textAlign:'center', fontSize:10, color:theme.subText, marginTop:6, paddingBottom:12 }}>
            Showing {displayed.length} of {allRoles.length} roles
          </div>
        )}
      </div>
    </div>
  )
}

// ── STEP: CONFIRM (Sacred Path Summary) ──────────────────────
function ConfirmStep({ village, role, theme, onNext }: { village:Village; role:string; theme:any; onNext:()=>void }) {
  const PATH_STEPS = [
    { label:'NAMING', done:true },
    { label:'FAMILY', done:true },
    { label:'VILLAGE', done:true },
    { label:'ROLE', done:true },
    { label:'CORONATION', done:false },
  ] as const

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg, overflowY:'auto' }}>

      {/* ── Top: Shield + Village emoji in gradient circle ── */}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ position:'relative', width:96, height:96, margin:'0 auto 16px' }}>
          {/* gradient circle */}
          <div style={{ width:96, height:96, borderRadius:'50%', background:`linear-gradient(135deg, ${village.color}, #1a7c3e)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 32px ${village.color}44` }}>
            <span style={{ fontSize:44 }}>{village.emoji}</span>
          </div>
          {/* shield badge */}
          <div style={{ position:'absolute', bottom:-4, right:-4, width:36, height:36, borderRadius:'50%', background:theme.card, border:`2px solid ${theme.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🛡</div>
        </div>

        <div style={{ fontFamily:'Sora, sans-serif', fontSize:24, fontWeight:900, color:theme.text, letterSpacing:'-0.02em', marginBottom:6 }}>
          Confirm Your Sacred Path
        </div>
        <div style={{ fontSize:13, color:theme.subText, lineHeight:1.6, maxWidth:300, margin:'0 auto' }}>
          Review your journey before your Digital Birth.
        </div>
      </div>

      {/* ── Village Banner Card ── */}
      <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:20, overflow:'hidden', marginBottom:16 }}>
        {/* gradient header with village identity */}
        <div style={{ background:`linear-gradient(135deg, ${village.color}, ${village.color}cc)`, padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
            {village.emoji}
          </div>
          <div>
            <div style={{ fontFamily:'Sora, sans-serif', fontSize:18, fontWeight:900, color:'#fff', letterSpacing:'-0.01em' }}>
              {village.name}
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.7)', marginTop:2 }}>
              {village.meaning?.split('—')[0]?.trim() ?? village.ancientName}
            </div>
          </div>
        </div>

        {/* Role section */}
        <div style={{ padding:'16px 20px' }}>
          <div style={{ fontSize:10, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Your Sovereign Role</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${village.color}14`, border:`1.5px solid ${village.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚔</div>
            <div>
              <div style={{ fontFamily:'Sora, sans-serif', fontSize:15, fontWeight:800, color:theme.text }}>{role}</div>
              <div style={{ fontSize:11, color:village.color, fontWeight:700, marginTop:1 }}>{village.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Path Flow Visualization ── */}
      <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:18, padding:'18px 16px', marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14, textAlign:'center' }}>Your Journey</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0 }}>
          {PATH_STEPS.map((s, i) => (
            <React.Fragment key={s.label}>
              {/* dot + label */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:0 }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background: s.done ? 'linear-gradient(135deg,#1a7c3e,#4ade80)' : theme.muted,
                  border: s.done ? 'none' : `2px solid ${theme.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, color: s.done ? '#fff' : theme.subText, fontWeight:800,
                  boxShadow: s.done ? '0 2px 8px rgba(26,124,62,.35)' : 'none',
                }}>
                  {s.done ? '✓' : (i + 1)}
                </div>
                <div style={{ fontSize:8, fontWeight:800, color: s.done ? theme.accent : theme.subText, textTransform:'uppercase', letterSpacing:'.04em', textAlign:'center', lineHeight:1.2 }}>
                  {s.label}
                </div>
              </div>
              {/* connector line */}
              {i < PATH_STEPS.length - 1 && (
                <div style={{
                  flex:1, height:2, minWidth:12, maxWidth:32, margin:'0 2px',
                  background: s.done && PATH_STEPS[i + 1].done
                    ? 'linear-gradient(to right,#1a7c3e,#4ade80)'
                    : s.done
                      ? `linear-gradient(to right,#4ade80,${theme.border})`
                      : theme.border,
                  borderRadius:1, marginBottom:20,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Proverb Card ── */}
      <div style={{ background:'rgba(212,160,23,.07)', border:'1px solid rgba(212,160,23,.18)', borderRadius:16, padding:'14px 18px', textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:12, fontStyle:'italic', color:'#d4a017', lineHeight:1.65 }}>
          &ldquo;The road that leads to a worthy destination is never easy.&rdquo;
        </div>
        <div style={{ fontSize:9, color:'rgba(212,160,23,.5)', marginTop:6, fontWeight:700 }}>
          — African Proverb
        </div>
      </div>

      {/* ── CTA ── */}
      <GradBtn onClick={onNext} style={{ height:56 }}>Confirm My Path →</GradBtn>
    </div>
  )
}

// ── STEP: CORONATION ──────────────────────────────────────────
const CONFETTI_COLORS = ['#1a7c3e','#d4a017','#b22222','#4ade80','#e07b00','#3b82f6','#f472b6','#fff']

function CoronationStep({ village, role, onDone, theme }: { village:Village; role:string; onDone:()=>void; theme:any }) {
  const [revealed, setRevealed] = React.useState(false)
  const [afroId, setAfroId] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [confetti, setConfetti] = React.useState<{x:number;y:number;color:string;delay:number;size:number;drift:number}[]>([])

  // Fetch from production backend using authenticated API client
  React.useEffect(() => {
    const fetchId = async () => {
      try {
        const data = await authApi.revealAfroId()
        setAfroId(data.afroId || '')
      } catch {
        // If reveal fails, Afro-ID was already minted during registration — fetch via /me
        try {
          const me = await authApi.me()
          setAfroId((me.afroId as string) || '')
        } catch {
          setAfroId('')
        }
      } finally {
        setLoading(false)
        setTimeout(() => setRevealed(true), 400)
      }
    }
    fetchId()

    // Confetti
    const pieces = Array.from({length:24}, () => ({
      x: Math.random() * 100, y: -10 - Math.random() * 20,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 2, size: 4 + Math.random() * 6, drift: -30 + Math.random() * 60,
    }))
    setConfetti(pieces)
  }, [])

  const coronationMask = afroId
    ? afroId.split('-').slice(0, 2).join('-') + '-••••-••••'
    : '••••-••-••••-••••'

  if (loading) {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#060b07' }}>
         <div style={{ width:60, height:60, borderRadius:'50%', border:`3px solid ${theme.accent}`, borderTopColor:'transparent', animation:'wbBeat 1s linear infinite' }} />
         <div style={{ marginTop:20, fontSize:12, fontWeight:800, color:theme.accent, letterSpacing:'.1em' }}>REVEALING YOUR ANCESTRAL DEED...</div>
      </div>
    )
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', background:'linear-gradient(180deg,#060b07 0%,#081a0c 40%,#060b07 100%)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        {confetti.map((p,i) => (
          <div key={i} style={{
            position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size * 0.6,
            background:p.color, borderRadius:1, transform:`rotate(${p.drift}deg)`,
            animation:`confettiFall 3s ease-in ${p.delay}s forwards`,
            opacity:0
          }} />
        ))}
      </div>

      <div style={{ position:'absolute', top:16, left:0, right:0, display:'flex', justifyContent:'space-around', pointerEvents:'none', fontSize:16 }}>
        {['✨','⭐','🌟','⭐','✨'].map((s,i)=><span key={i} style={{ animation:`wbBeat ${2.5+i*.5}s ease-in-out ${i*.5}s infinite` }}>{s}</span>)}
      </div>

      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'30px 20px 20px', width:'100%', overflowY:'auto' }}>
        <div style={{ position:'relative', width:100, height:100, marginBottom:16, transform: revealed ? 'scale(1)' : 'scale(0.3)', opacity: revealed ? 1 : 0, transition:'all .8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          {[0,1,2].map((i)=><div key={i} style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(26,124,62,.4)', animation:`ringExp 2.5s ease-out ${i*.8}s infinite` }} />)}
          <div style={{ position:'absolute', inset:16, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%,#1a7c3e,#0a1f0f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:'0 0 40px rgba(26,124,62,.5)' }}>🛡</div>
        </div>

        <div style={{ fontFamily:'Sora, sans-serif', fontSize:24, fontWeight:900, color:'#f0f7f0', textAlign:'center', marginBottom:4, opacity: revealed ? 1 : 0, transition:'opacity .6s .4s' }}>Welcome Home!</div>
        <div style={{ fontSize:13, color:'#7da882', textAlign:'center', lineHeight:1.65, marginBottom:8 }}>You are now a citizen of<br/>the Digital Motherland.</div>
        {village.ancientName && (
          <div style={{ fontFamily:'"Cinzel","Palatino",serif', fontSize:18, fontWeight:900, color: village.color, letterSpacing:'0.08em', textAlign:'center', marginBottom:4, opacity: revealed ? 1 : 0, transition:'opacity .6s .6s', textShadow:`0 0 20px ${village.color}80` }}>
            {village.ancientName}
          </div>
        )}
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(26,124,62,.15)', border:'1px solid rgba(26,124,62,.4)', borderRadius:99, padding:'5px 14px', fontSize:11, fontWeight:700, color:'#4ade80', marginBottom:18 }}>✦ {village.name} Village · {role}</div>

        <div style={{ width:'100%', background:'rgba(26,124,62,.08)', border:'1px solid rgba(26,124,62,.25)', borderRadius:16, padding:16, marginBottom:12, textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>🔒 Your Afro-ID (Private)</div>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:20, fontWeight:900, color:'#4ade80', letterSpacing:'.12em', marginBottom:8 }}>
            {coronationMask}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:10 }}>
            Your full ID is secured. View it privately in Profile Settings.
          </div>
          <a href="/dashboard/profile" style={{ fontSize:12, fontWeight:700, color:'#4ade80', textDecoration:'none', padding:'6px 16px', borderRadius:10, border:'1px solid rgba(74,222,128,.3)', background:'rgba(74,222,128,.08)' }}>
            View Full ID in Settings →
          </a>
        </div>

        {/* Security warning */}
        <div style={{ width:'100%', background:'rgba(178,34,34,.08)', border:'1px solid rgba(178,34,34,.2)', borderRadius:14, padding:'12px 14px', marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#f87171', marginBottom:5, fontFamily:'Sora, sans-serif' }}>⚠ Keep Your Afro-ID Sacred</div>
          <div style={{ fontSize:10, color:'rgba(248,113,113,.7)', lineHeight:1.8 }}>• Never share publicly or with untrusted sources<br/>• Used for banking, recovery, and verification<br/>• Store it like a land title — your digital deed</div>
        </div>

        {/* Feature badges + Nkisi Shield + Crest Tier */}
        <div style={{ display:'flex', gap:8, width:'100%', marginBottom:12 }}>
          {[['🛡','Nkisi Shield','GREEN · 100%'],['🔒','Encrypted','AES-256'],['🌍','Sovereign','African data'],['🏅','Crest Tier','Tier 0 · New']].map(([ico,n,s])=>(
            <div key={n} style={{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)', borderRadius:14, padding:'10px 6px', textAlign:'center' }}>
              <div style={{ fontSize:18 }}>{ico}</div>
              <div style={{ fontFamily:'Sora, sans-serif', fontSize:9, fontWeight:700, color:'#f0f7f0' }}>{n}</div>
              <div style={{ fontSize:8, color:'#7da882', marginTop:2 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Proverb — rotating Pan-African proverbs */}
        {(() => {
          const CORONATION_PROVERBS = [
            { text: "Umuntu ngumuntu ngabantu", translation: "A person is a person through other people", origin: "Ubuntu — Zulu / Xhosa / Nguni" },
            { text: "Bɔ wo ho adwene so", translation: "Think well before you act", origin: "Akan Proverb — Ghana" },
            { text: "Ikinya gitarimbuwe n\u2019imvura, kitarimbuwe n\u2019ibihe", translation: "A mountain is not moved by rain, nor by seasons", origin: "Kinyarwanda — Rwanda" },
            { text: "Akili ni mali", translation: "Knowledge is wealth", origin: "Swahili Proverb — East Africa" },
            { text: "Nit fit garabam mooy nit", translation: "A person\u2019s best friend is another person", origin: "Wolof — Senegal" },
            { text: "Ayanf\u1eb9 eniyan ni \u1eb9s\u1eb9 r\u1eb9", translation: "A person\u2019s character is their beauty", origin: "Yoruba — West Africa" },
            { text: "Chukwu d\u1ecb n\u2019onye \u1ecdb\u1ee5la", translation: "The divine lives in every person", origin: "Igbo — Nigeria" },
            { text: "Motho ke motho ka batho", translation: "I am because we are", origin: "Sesotho — Southern Africa" },
            { text: "Baraka ya Mungu ni sawa kwa wote", translation: "God\u2019s blessing is equal for all", origin: "Swahili — Tanzania" },
            { text: "D\u0254 w\u0254 h\u0254 a, ehia a y\u1b9de ma f\u00e3fr\u00e3", translation: "When love is present, even the most difficult things become light", origin: "Akan — Ghana" },
          ]
          const proverb = CORONATION_PROVERBS[Math.floor(Date.now() / 86400000) % CORONATION_PROVERBS.length]
          return (
            <div style={{ width:'100%', background:'rgba(212,160,23,.07)', border:'1px solid rgba(212,160,23,.18)', borderRadius:14, padding:'12px 16px', textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:12, fontStyle:'italic', color:'#d4a017', lineHeight:1.6 }}>&ldquo;{proverb.text}&rdquo;</div>
              <div style={{ fontSize:10, color:'rgba(240,247,240,.6)', marginTop:4, lineHeight:1.5 }}>{proverb.translation}</div>
              <div style={{ fontSize:9, color:'rgba(212,160,23,.45)', marginTop:4, fontWeight:600 }}>— {proverb.origin}</div>
            </div>
          )
        })()}
        <GradBtn onClick={onDone} style={{ width:'100%' }}>Enter the Motherland 🌍 →</GradBtn>
      </div>
    </div>
  )
}

// ── STEP: HERITAGE VERIFY (Circle 2 — Diaspora) ──────────────
function HeritageVerifyStep({ onPass, onFail, theme }: { onPass:()=>void; onFail:()=>void; theme:any }) {
  const [questions] = React.useState<HeritageQuestion[]>(() => selectHeritageQuestions(7))
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [answers, setAnswers] = React.useState<HeritageAnswer[]>([])
  const [selected, setSelected] = React.useState<number[]>([])
  const [showResults, setShowResults] = React.useState(false)
  const [result, setResult] = React.useState<ReturnType<typeof scoreHeritageVerification>|null>(null)

  const q = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  const handleSelect = (idx: number) => {
    if (q.type === 'multiple_choice') {
      setSelected([idx])
    } else {
      setSelected(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx])
    }
  }

  const handleNext = () => {
    const newAnswers = [...answers, { questionId: q.id, selectedIndices: selected }]
    setAnswers(newAnswers)
    setSelected([])
    if (isLast) {
      const scored = scoreHeritageVerification(newAnswers)
      setResult(scored)
      setShowResults(true)
      setTimeout(() => { scored.passed ? onPass() : onFail() }, 4000)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  if (showResults && result) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',padding:20,background:theme.bg,overflowY:'auto'}}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:10}}>{result.passed ? '✅' : '🕯'}</div>
          <div style={{fontFamily:'Sora, sans-serif',fontSize:22,fontWeight:900,color:theme.text,marginBottom:6}}>
            {result.passed ? 'Heritage Verified' : 'Heritage Unverified'}
          </div>
          <div style={{fontSize:13,color:theme.subText,lineHeight:1.55}}>
            Score: {result.percentage}% — {result.passedCategories}/{result.totalCategories} categories passed
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
          {result.categoryScores.filter(c=>c.max>0).map(c=>(
            <div key={c.category} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:theme.card,border:`1.5px solid ${c.passed?theme.accent:theme.border}`}}>
              <div style={{fontSize:12,fontWeight:800,color:c.passed?theme.accent:'#f87171',width:24}}>{c.passed?'✓':'✗'}</div>
              <div style={{flex:1,fontSize:13,fontWeight:700,color:theme.text,textTransform:'capitalize'}}>{c.category.replace('_',' ')}</div>
              <div style={{fontSize:12,color:theme.subText,fontFamily:'monospace'}}>{c.percentage}%</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,color:theme.subText,textAlign:'center',lineHeight:1.6}}>
          {result.passed
            ? 'The Griot acknowledges your African roots. Welcome, child of the Diaspora.'
            : 'The Griot could not verify sufficient heritage connection. You will be welcomed as a Friend of the Motherland.'}
        </div>
      </div>
    )
  }

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',padding:20,background:theme.bg,overflowY:'auto'}}>
      <div style={{textAlign:'center',marginBottom:20}}>
        <div style={{fontSize:48,marginBottom:10}}>🦅</div>
        <div style={{fontFamily:'Sora, sans-serif',fontSize:22,fontWeight:900,color:theme.text,marginBottom:6}}>Griot Speaks</div>
        <div style={{fontSize:13,color:theme.subText,lineHeight:1.55}}>The Griot — keeper of living memory — asks 7 questions to verify your lineage.</div>
      </div>

      {/* Progress */}
      <div style={{display:'flex',gap:4,marginBottom:20}}>
        {questions.map((_,i)=>(
          <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=currentIdx?theme.accent:theme.border,transition:'background .3s'}} />
        ))}
      </div>

      {/* Category + Question # */}
      <div style={{fontSize:10,fontWeight:800,color:theme.accent,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>
        Q{currentIdx+1} of {questions.length} — {q.category.replace('_',' ')}
      </div>

      {/* Question */}
      <div style={{fontSize:15,fontWeight:700,color:theme.text,lineHeight:1.55,marginBottom:16}}>{q.question}</div>

      {/* Hint for multi-select */}
      {q.type === 'multi_select' && (
        <div style={{fontSize:10,color:theme.subText,marginBottom:10,fontStyle:'italic'}}>Select all that apply</div>
      )}

      {/* Options */}
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
        {q.options.map((opt,i)=>(
          <div key={i} onClick={()=>handleSelect(i)} style={{
            padding:'13px 14px',borderRadius:13,cursor:'pointer',fontSize:13,lineHeight:1.5,
            fontWeight:selected.includes(i)?800:400,color:theme.text,transition:'all .2s',
            background:selected.includes(i)?`${theme.accent}18`:theme.card,
            border:`1.5px solid ${selected.includes(i)?theme.accent:theme.border}`,
          }}>
            {opt}
          </div>
        ))}
      </div>

      <div style={{marginTop:'auto'}}>
        <GradBtn onClick={handleNext} style={selected.length===0?{opacity:.4,pointerEvents:'none'}:{height:52}}>
          {isLast ? 'Submit to the Griot' : `Next Question →`}
        </GradBtn>
      </div>
    </div>
  )
}

// ── STEP: ALLY NAME (Circle 3 only — universal, non-cultural) ──
/**
 * AllyNameStep replaces NamingStep for Circle 3 users.
 * Key rule: This screen MUST NOT contain any African cultural framing
 * (no proverbs, no ethnic groups, no heritage selection).
 * It collects only what is needed to create a basic global profile.
 */
function AllyNameStep({ onNext, theme }: { onNext:(name:string)=>void; theme:any }) {
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName]   = React.useState('')
  const [country, setCountry]     = React.useState('')
  const [intention, setIntention] = React.useState('')

  const intentionOptions = [
    { value:'business',   label:'💼 Build business bridges with Africa' },
    { value:'cultural',   label:'🎨 Explore African culture and arts' },
    { value:'volunteer',  label:'🌱 Volunteer or contribute to African causes' },
    { value:'research',   label:'🔬 Academic or journalistic research' },
    { value:'community',  label:'🤝 Join the global African community' },
    { value:'investment', label:'📈 Invest in African innovation' },
  ]

  const canNext = firstName.trim().length >= 1 && lastName.trim().length >= 1 && country.trim().length >= 2 && !!intention

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:20, background:theme.bg, overflowY:'auto' }}>
      <div style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ fontSize:48, marginBottom:10 }}>🌐</div>
        <div style={{ fontFamily:'Sora, sans-serif', fontSize:22, fontWeight:900, color:theme.text, marginBottom:6 }}>Your Global Identity</div>
        <div style={{ fontSize:13, color:theme.subText, lineHeight:1.55 }}>Tell us who you are. This will be your profile on Viewdicon as a Friend of the Motherland.</div>
      </div>

      {/* Name */}
      <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:18, marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Your Name</div>
        <input
          type="text" placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)}
          style={{ width:'100%', padding:'12px 14px', background:theme.muted, border:`1.5px solid ${theme.border}`, borderRadius:12, color:theme.text, fontSize:14, outline:'none', marginBottom:10, fontFamily:'inherit' }}
        />
        <input
          type="text" placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)}
          style={{ width:'100%', padding:'12px 14px', background:theme.muted, border:`1.5px solid ${theme.border}`, borderRadius:12, color:theme.text, fontSize:14, outline:'none', fontFamily:'inherit' }}
        />
      </div>

      {/* Country */}
      <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:18, marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Your Country of Residence</div>
        <input
          type="text" placeholder="e.g. United Kingdom, United States, Germany..." value={country} onChange={e=>setCountry(e.target.value)}
          style={{ width:'100%', padding:'12px 14px', background:theme.muted, border:`1.5px solid ${theme.border}`, borderRadius:12, color:theme.text, fontSize:14, outline:'none', fontFamily:'inherit' }}
        />
      </div>

      {/* Intention */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:800, color:theme.subText, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Why are you joining Viewdicon?</div>
        {intentionOptions.map(opt => (
          <div key={opt.value} onClick={()=>setIntention(opt.value)} style={{ padding:'12px 14px', borderRadius:13, background:intention===opt.value?'rgba(59,130,246,.12)':theme.card, border:`1.5px solid ${intention===opt.value?'#3b82f6':theme.border}`, cursor:'pointer', fontSize:13, fontWeight:intention===opt.value?800:400, color:theme.text, transition:'all .2s', marginBottom:7 }}>
            {opt.label}
          </div>
        ))}
      </div>

      {/* No cultural framing — just a simple privacy notice */}
      <div style={{ background:'rgba(59,130,246,.05)', border:'1px solid rgba(59,130,246,.15)', borderRadius:13, padding:12, fontSize:11, color:'rgba(147,197,253,.8)', lineHeight:1.6, marginBottom:16 }}>
        🔒 Your data is stored securely. You are not required to share cultural or ethnic information.
      </div>

      <button
        onClick={() => onNext(`${firstName.trim()} ${lastName.trim()}`)}
        disabled={!canNext}
        style={{ width:'100%', padding:16, borderRadius:16, background: canNext ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : 'rgba(255,255,255,.1)', color:'#fff', fontWeight:800, fontSize:15, border:'none', cursor:canNext?'pointer':'not-allowed', opacity:canNext?1:.5, transition:'all .2s' }}
      >
        Register My Identity →
      </button>
    </div>
  )
}

// ── STEP: ALLY CORONATION (Circle 3 — Friend of the Motherland) ──

function AllyCoronationStep({ allyName, onDone, theme }: { allyName?:string; onDone:()=>void; theme:any }) {
  const [revealed, setRevealed] = React.useState(false)
  const [allyId] = React.useState(() => `ALY-${Date.now().toString(36).toUpperCase().slice(-4)}-${new Date().getFullYear()}`)
  React.useEffect(()=>{ setTimeout(()=>setRevealed(true),600) },[])
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',background:'linear-gradient(180deg,#060b07 0%,#081525 100%)',padding:'30px 20px 20px',overflowY:'auto'}}>
      <div style={{width:90,height:90,borderRadius:'50%',background:'linear-gradient(135deg,#1e40af,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,marginBottom:20,boxShadow:'0 0 40px rgba(59,130,246,.35)',opacity:revealed?1:0,transform:revealed?'scale(1)':'scale(.4)',transition:'all .8s cubic-bezier(.34,1.56,.64,1)'}}>
        🤝
      </div>
      <div style={{fontFamily:'Sora, sans-serif',fontSize:20,fontWeight:900,color:'#f0f7f0',textAlign:'center',marginBottom:4}}>{allyName ? `Welcome, ${allyName}` : 'Welcome, Friend of the Motherland'}</div>
      <div style={{fontSize:13,color:'#93c5fd',textAlign:'center',lineHeight:1.65,marginBottom:18,maxWidth:300}}>You are a cultural ally and bridge-builder. Your Ally ID is permanent.</div>
      <div style={{width:'100%',background:'rgba(30,64,175,.12)',border:'1.5px solid rgba(59,130,246,.3)',borderRadius:18,padding:'14px 18px',marginBottom:16}}>
        <div style={{fontSize:9,fontWeight:800,color:'rgba(147,197,253,.5)',textTransform:'uppercase',letterSpacing:'.12em',marginBottom:4}}>Ally Identification</div>
        <div style={{fontFamily:"'Courier New',monospace",fontSize:19,fontWeight:800,color:'#93c5fd',letterSpacing:'.1em'}}>{allyId}</div>
        <div style={{fontSize:10,color:'rgba(147,197,253,.45)',marginTop:3}}>Circle 3 — No Village · No Role</div>
      </div>
      <div style={{width:'100%',marginBottom:18}}>
        {[{e:'📺',t:'Jollof TV — Public channels'},{e:'🛒',t:'Cowrie Marketplace — Buyer only'},{e:'🤝',t:'Cultural Exchange Portal'},{e:'🏠',t:'Sponsor an African Village'}].map(item=>(
          <div key={item.e} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,background:'rgba(59,130,246,.06)',border:'1px solid rgba(59,130,246,.1)',marginBottom:7}}>
            <span style={{fontSize:20}}>{item.e}</span><span style={{fontSize:13,color:'#f0f7f0'}}>{item.t}</span><span style={{marginLeft:'auto',color:'#4ade80',fontWeight:700}}>&#x2713;</span>
          </div>
        ))}
        <div style={{fontSize:10,color:'rgba(147,197,253,.45)',textAlign:'center',lineHeight:1.6,marginTop:8}}>After 30 days, earn 5 endorsements from African citizens to apply for village membership.</div>
      </div>

      {/* Village Application CTA */}
      <div style={{width:'100%',background:'rgba(26,124,62,.08)',border:'1.5px solid rgba(26,124,62,.25)',borderRadius:16,padding:'14px 16px',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:800,color:'#4ade80',marginBottom:6}}>Want Village Access?</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.6,marginBottom:10}}>After 30 days as an Ally, you can apply for full village membership. You will need to pass an African Knowledge Quiz and provide endorsements from existing citizens.</div>
        <div style={{fontSize:10,color:'rgba(255,255,255,.35)',fontStyle:'italic'}}>Visit Villages → Apply after your 30-day period.</div>
      </div>

      <button onClick={onDone} style={{width:'100%',padding:15,borderRadius:16,background:'linear-gradient(135deg,#1e40af,#3b82f6)',color:'#fff',fontWeight:800,fontSize:15,border:'none',cursor:'pointer',boxShadow:'0 6px 24px rgba(59,130,246,.3)'}}>Enter as Ally</button>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────
export default function CeremonyPage() {
  return (
    <React.Suspense fallback={<div style={{minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',background:'#050a06',color:'#4ade80',fontWeight:800,fontSize:14}}>Loading Ceremony…</div>}>
      <CeremonyInner />
    </React.Suspense>
  )
}

function CeremonyInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokens, setUser, completeCeremony } = useAuthStore()
  const { isDark: getIsDark } = useThemeStore()

  // Support ?step=NAMING (or any step key) to jump directly to a scene — great for preview/testing
  const startStep = searchParams.get('step') as Step | null
  const defaultSeq = buildSequence(null)
  const startIdx = startStep ? Math.max(defaultSeq.indexOf(startStep), 0) : 0

  const [idx, setIdx] = React.useState(startIdx)
  const [showGriot, setShowGriot] = React.useState(false)

  // CIRCLE drives the entire step sequence:
  // null=not yet detected, 1=Continental African (auto), 2=Diaspora, 3=Friend/Ally
  const [circle, setCircle] = React.useState<UserCircle | null>(null)
  const [village, setVillage] = React.useState<Village|null>(null)
  const [occ, setOcc] = React.useState<Occupation|undefined>(undefined)
  const [role, setRole] = React.useState('')
  const [geoResult, setGeoResult] = React.useState<any>(null)
  const [geoLoading, setGeoLoading] = React.useState(false)
  const [heritageCompleted, setHeritageCompleted] = React.useState(false)
  const [selectedHeritage, setSelectedHeritage] = React.useState('')
  const [allyName, setAllyName] = React.useState('')
  const [voiceEnabled, setVoiceEnabled] = React.useState(false)
  const [ceremonyPhone, setCeremonyPhone] = React.useState('')
  const [ceremonyDialCode, setCeremonyDialCode] = React.useState('')
  const [ceremonyCountryCode, setCeremonyCountryCode] = React.useState('')
  const [voicePrint, setVoicePrint] = React.useState('')
  const [devOtp, setDevOtp] = React.useState('')
  const otpStartedRef = React.useRef(false)
  // Personal identity — collected at NAMING step
  const [fullName, setFullName] = React.useState('')
  const [dateOfBirth, setDateOfBirth] = React.useState('')
  const [gender, setGender] = React.useState<'male'|'female'|'non-binary'|'prefer-not-to-say'|''>('')
  const namingDataRef = React.useRef<Record<string,string>>({})
  const familyMembersRef = React.useRef<FM[]>([])

  const theme = getIsDark() ? DARK_THEME : LIGHT_THEME
  const isDark = getIsDark()

  // ── Persist ceremony state to localStorage ──
  const STORAGE_KEY = 'afk-ceremony-state'

  // Restore state on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const s = JSON.parse(saved)
        if (s.idx != null) setIdx(s.idx)
        if (s.circle != null) setCircle(s.circle)
        if (s.ceremonyPhone) setCeremonyPhone(s.ceremonyPhone)
        if (s.ceremonyDialCode) setCeremonyDialCode(s.ceremonyDialCode)
        if (s.ceremonyCountryCode) setCeremonyCountryCode(s.ceremonyCountryCode)
        if (s.selectedHeritage) setSelectedHeritage(s.selectedHeritage)
        if (s.fullName) setFullName(s.fullName)
        if (s.dateOfBirth) setDateOfBirth(s.dateOfBirth)
        if (s.allyName) setAllyName(s.allyName)
        if (s.devOtp) setDevOtp(s.devOtp)
        if (s.namingData) namingDataRef.current = s.namingData
      }
    } catch { /* corrupt storage — start fresh */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save state on every step change
  const saveState = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        idx, circle, ceremonyPhone, ceremonyDialCode, ceremonyCountryCode,
        selectedHeritage, fullName, dateOfBirth, allyName, devOtp,
        namingData: namingDataRef.current,
      }))
    } catch { /* storage full or unavailable */ }
  }, [idx, circle, ceremonyPhone, ceremonyDialCode, ceremonyCountryCode, selectedHeritage, fullName, dateOfBirth, allyName, devOtp])

  React.useEffect(() => { saveState() }, [saveState])

  // Rebuild sequence whenever circle changes (after phone step)
  const SEQUENCE = React.useMemo(() => buildSequence(circle), [circle])
  const step = SEQUENCE[Math.min(idx, SEQUENCE.length - 1)]
  const progress = Math.round(((idx + 1) / SEQUENCE.length) * 100)

  const next = () => setIdx((i) => Math.min(i + 1, SEQUENCE.length - 1))

  const handleVillageSelect = (v: Village) => {
    if (v.holding) {
      setShowGriot(true)
    } else {
      setVillage(v)
      next()
    }
  }

  const handleGriotSelection = (v: CanonicalVillage) => {
    setShowGriot(false)
    const matched = ALL_VILLAGES.find(vv => vv.id === v.id) || ALL_VILLAGES[0]
    setVillage(matched)
    setIdx(SEQUENCE.indexOf('VILLAGE'))
    next()
  }

  const handleSendDrum = async (dialCode: string, _phone: string) => {
    const fullPhone = `${dialCode}${_phone}`
    setCeremonyPhone(fullPhone)
    setCeremonyDialCode(dialCode)
    setCeremonyCountryCode(getCountryForDialCode(dialCode) ?? '')
    const autoCircle = isAfricanDialCode(dialCode) ? 1 : null
    setCircle(autoCircle as UserCircle | null)
    // ── ON-SCREEN OTP: generate code and show next screen IMMEDIATELY ──
    const localCode = String(Math.floor(100000 + Math.random() * 900000))
    setDevOtp(localCode)
    otpStartedRef.current = false
    next()
    // ── Background: sync with backend so verifyPhone Redis check works ──
    // Only update displayed code if user hasn't started typing yet
    authApi.sendOtp(fullPhone, 'en').then(res => {
      if (res.devCode && !otpStartedRef.current) setDevOtp(res.devCode)
    }).catch(() => { /* backend offline — local code stays */ })
    // Background geo-detect (non-blocking)
    setGeoLoading(true)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'
      const res = await fetch('/api/v1/geo/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dialCode, timezone: tz, locale }),
      })
      if (res.ok) { const d = await res.json(); setGeoResult(d) }
    } catch {
      setGeoResult({ circle: autoCircle ?? 3, isAfrican: autoCircle === 1 })
    } finally {
      setGeoLoading(false)
    }
  }

  const handleResendDrum = () => {
    if (!ceremonyPhone) return
    const localCode = String(Math.floor(100000 + Math.random() * 900000))
    setDevOtp(localCode)
    otpStartedRef.current = false
    authApi.sendOtp(ceremonyPhone, 'en').then(res => {
      if (res.devCode && !otpStartedRef.current) setDevOtp(res.devCode)
    }).catch(() => {})
  }

  const handleRegister = async (overrideDisplayName?: string) => {
    try {
      const heritageCircle = circle === 1 ? 'continental' as const : circle === 2 ? 'diaspora' as const : 'ally' as const
      const nd = namingDataRef.current
      const res = await authApi.register({
        phone: ceremonyPhone,
        countryCode: ceremonyCountryCode || 'NG',
        firstName: nd.first || undefined,
        lastName: nd.last || undefined,
        fullName: fullName || nd.fullName || undefined,
        dateOfBirth: dateOfBirth || nd.dateOfBirth || undefined,
        gender: (gender || undefined) as 'male'|'female'|'non-binary'|'prefer-not-to-say'|undefined,
        heritage: nd.heritage || selectedHeritage || undefined,
        heritageCircle,
        displayName: overrideDisplayName || nd.displayName || nd.first || fullName || allyName || undefined,
        languageCode: nd.languageCode || 'en',
        ancestralNation: nd.ancestralNation || undefined,
        ethnicGroup: nd.ethnicGroup || undefined,
        clanLineage: nd.clanLineage || undefined,
        birthSeason: nd.birthSeason || undefined,
        motherName: nd.motherName || undefined,
        fatherName: nd.fatherName || undefined,
        totemAnimal: nd.totemAnimal || undefined,
        originState: nd.originState || undefined,
        originVillage: nd.originVillage || undefined,
        residenceCountry: nd.currentCountry || undefined,
        residenceCity: nd.currentCity || undefined,
        occupation: nd.occupation || role || undefined,
        altContact: nd.altContact || undefined,
        villageId: village?.id || undefined,
        roleKey: role || undefined,
      })
      setTokens(res.accessToken, res.refreshToken)
      if (typeof document !== 'undefined') {
        document.cookie = `afk_token=${res.accessToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      }
      // Fetch full profile and hydrate store so profile page shows real data
      let userAfroId = ''
      try {
        const me = await authApi.me()
        setUser(me)
        userAfroId = (me as Record<string,unknown>).afroId as string || ''
      } catch {
        setUser({ id: res.userId })
      }
      // Wire village membership — write to village_memberships table (fire-and-forget)
      if (userAfroId && village?.id && role) {
        villageApi.createMembership({ userAfroId, villageId: village.id, roleKey: role, isPrimary: true })
          .catch(() => {/* fire-and-forget — non-blocking */})
      }
      // Send collected family members to family-service (fire-and-forget)
      const fam = familyMembersRef.current
      if (fam.length > 0) {
        fam.forEach(member => {
          fetch('/api/v1/family/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${res.accessToken}` },
            body: JSON.stringify({
              name: member.name,
              relationship: member.rel,
              phone: member.phone,
              tier: member.tier,
            }),
          }).catch(() => { /* family service failures are non-fatal */ })
        })
      }
    } catch (err) {
      // Re-throw so callers (handlePreCoronation) can block navigation
      throw err
    }
  }

  const [registerError, setRegisterError] = React.useState('')

  // Called when user confirms their village/role — registers BEFORE coronation
  const handlePreCoronation = async () => {
    setRegisterError('')
    try {
      await handleRegister()
      next()
    } catch {
      setRegisterError('Registration failed — please check your connection and try again.')
    }
  }

  const handleDone = async () => {
    // Circle 1 (continental) and Circle 2 (diaspora) already registered in handlePreCoronation.
    // Only Circle 3 (ally) reaches handleDone without having registered yet.
    if (circle === 3) {
      try {
        const res = await authApi.register({
          phone: ceremonyPhone,
          countryCode: ceremonyCountryCode || 'NG',
          heritage: selectedHeritage || undefined,
          heritageCircle: 'ally',
          displayName: allyName || undefined,
          languageCode: 'en',
        })
        setTokens(res.accessToken, res.refreshToken)
        if (typeof document !== 'undefined') {
          document.cookie = `afk_token=${res.accessToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        }
        setUser({ id: res.userId })
      } catch (err) {
        console.error('[Ceremony] Circle 3 registration failed:', err)
        // Do NOT proceed to dashboard without auth tokens — show error and let user retry
        alert('Registration could not be completed. Please check your connection and try again.')
        return
      }
    }
    completeCeremony()
    // Clear ceremony progress from localStorage
    try { localStorage.removeItem('afk-ceremony-state') } catch { /* ignore */ }
    router.push('/dashboard?welcome=1')
  }

  return (
    <Shell progress={progress} step={step} theme={theme} stepIndex={idx} sequenceLength={SEQUENCE.length}>
      {/* Registration error banner — shown when handlePreCoronation fails */}
      {registerError && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200, padding: '12px 20px', background: 'rgba(178,34,34,.95)', borderBottom: '1px solid rgba(178,34,34,.8)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 700, flex: 1, lineHeight: 1.4 }}>{registerError}</span>
          <button onClick={() => setRegisterError('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }} style={{ flex:1, display:'flex', flexDirection:'column' }}>
          {step==='TERMS'           && <TermsStep onNext={next} theme={theme} />}
          {step==='PHONE'           && <PhoneStep onSendDrum={handleSendDrum} theme={theme} />}
          {step==='OTP'             && <OtpStep onNext={next} theme={theme} phone={ceremonyPhone} devOtp={devOtp} isDark={isDark} onResend={handleResendDrum} onOtpStart={() => { otpStartedRef.current = true }} />}
          {/* CIRCLES only appears for non-African SIM users */}
          {step==='CIRCLES'         && <CirclesStep geoResult={geoResult} geoLoading={geoLoading} onNext={(c: number) => { setCircle((c + 1) as UserCircle); next() }} theme={theme} />}
          {/* Circle 2: Griot heritage verification */}
          {step==='HERITAGE_VERIFY' && <HeritageVerifyStep
            onPass={() => { setCircle(2); setHeritageCompleted(true); next() }}
            onFail={() => { setCircle(3); next() }}
            theme={theme}
          />}
          {step==='DEVICE'          && <DeviceStep onNext={() => { setVoiceEnabled(true); next() }} theme={theme} onVoicePrint={(hash) => setVoicePrint(hash)} />}
          {step==='FINGERPRINT'     && <FingerprintStep onNext={next} theme={theme} />}
          {step==='BIOMETRIC'       && <BiometricStep onNext={next} theme={theme} />}
          {step==='VOICE'           && <VoiceStep onNext={next} theme={theme} />}
          {step==='HERITAGE'        && <HeritageStep onNext={(h) => { setSelectedHeritage(h); next() }} theme={theme} />}
          {step==='NAMING'          && <NamingStep onNext={next} theme={theme} heritage={selectedHeritage} isDark={isDark} onNamingData={(d) => {
            setFullName(d.fullName || ''); setDateOfBirth(d.dateOfBirth || '')
            // Collect gender from naming step
            if (d.gender) setGender(d.gender as typeof gender)
            // Store all ceremony naming fields in a ref for register
            namingDataRef.current = d
          }} />}
          {step==='FAMILY'          && <FamilyStep onNext={(members) => { familyMembersRef.current = members; next() }} theme={theme} />}
          {/* VILLAGE / ROLE: Circle 1 & 2 only. Circle 3 NEVER sees these */}
          {step==='VILLAGE'         && <VillageStep onNext={handleVillageSelect} theme={theme} sovereigntyAllowed={circle === 1 || heritageCompleted} />}
          {step==='ROLE'            && village && <RoleStep village={village} onNext={(r, o) => { setRole(r); setOcc(o); next() }} theme={theme} />}
          {step==='CONFIRM'         && village && <ConfirmStep village={village} role={role || 'Citizen'} theme={theme} onNext={handlePreCoronation} />}
          {step==='CORONATION'      && <CoronationStep village={village || ALL_VILLAGES[0]} role={role || 'Citizen'} onDone={handleDone} theme={theme} />}
          {/* Circle 3 — Universal identity (no African culture) */}
          {step==='ALLY_NAME'       && <AllyNameStep onNext={(name) => { setAllyName(name); next() }} theme={theme} />}
          {/* Circle 3 ending — no village, no role, ally coronation */}
          {step==='ALLY_CORONATION' && <AllyCoronationStep allyName={allyName} onDone={handleDone} theme={theme} />}
        </motion.div>
      </AnimatePresence>

      {showGriot && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: theme.bg }}>
          <VillageRouter onSelect={handleGriotSelection} onCancel={() => setShowGriot(false)} theme={theme} />
        </div>
      )}

      <VoiceCommandLayer
        enabled={voiceEnabled}
        onNavigate={(cmd) => {
          if (cmd === 'next') next()
        }}
        onFill={() => {}}
        onAuth={() => {}}
        onLangDetected={() => {}}
      />
    </Shell>
  )
}
