'use client'
// ═══════════════════════════════════════════════════════════════════
// JOLLOF TV — AI Content Amplification + Cultural Certification Hub
// Powered by Amaterasu AI God (Content · Community · Feed · Social)
// Tabs: Amplify | Certification | Translate
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS } from '@/lib/flags'
import UnderConstruction from '@/components/ui/UnderConstruction'

/* ── inject-once CSS (prefix am-) ── */
const CSS_ID = 'am-amplify-css'
const CSS = `
@keyframes amFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes amPulse{0%,100%{opacity:.6;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
@keyframes amGlow{0%{box-shadow:0 0 8px rgba(249,115,22,.25)}50%{box-shadow:0 0 28px rgba(249,115,22,.55)}100%{box-shadow:0 0 8px rgba(249,115,22,.25)}}
@keyframes amSlide{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@keyframes amShimmer{0%{left:-120%}100%{left:220%}}
@keyframes amSunrise{0%{opacity:0;transform:scale(.3);filter:brightness(2)}40%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1);filter:brightness(1)}}
.am-fade{animation:amFade .4s ease both}
.am-pulse{animation:amPulse 2s ease-in-out infinite}
.am-glow{animation:amGlow 2.5s ease-in-out infinite}
.am-slide{animation:amSlide .35s ease both}
.am-sunrise{animation:amSunrise .7s ease-out both}
.am-shimmer{position:relative;overflow:hidden}
.am-shimmer::after{content:'';position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(249,115,22,.12),transparent);animation:amShimmer 3s ease-in-out infinite}
`
function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

/* ── types ── */
type Tab = 'amplify' | 'certification' | 'translate'
type AudioPreset = 'cinema' | 'music' | 'podcast'
type CertTier = 'verified' | 'guardian' | 'keeper' | 'master'

interface ThumbnailVariant {
  id: number; gradient: string; ctr: number; label: string
}
interface Language {
  code: string; name: string; flag: string; status: 'ready' | 'generating' | 'queued'
}
interface TimeZone {
  zone: string; label: string; heat: number; bestTime: string
}
interface CertRequirement {
  label: string; done: boolean; detail: string
}
interface CertifiedItem {
  id: string; title: string; creator: string; tier: CertTier; score: number; badge: string
}
interface ReviewItem {
  id: string; title: string; status: 'under_review' | 'approved' | 'needs_changes'; griotScore: number; votes: number
}
interface VoiceActor {
  id: string; name: string; language: string; accent: string; rating: number; pricePerMin: number; avatar: string
}
interface CountryCell {
  code: string; name: string; coverage: number; color: string
}

/* ── constants ── */
const AMATERASU_COLOR = '#f97316'
const GOLD = '#d4a017'
const BG = '#0d0804'
const TEXT = '#f0f7f0'
const CARD_BG = 'rgba(255,255,255,.04)'
const CARD_BORDER = '1px solid rgba(255,255,255,.08)'
const FONT_HEAD = "'Sora', sans-serif"
const FONT_BODY = "'Inter', system-ui, sans-serif"

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'amplify', label: 'Amplify', icon: '🚀' },
  { key: 'certification', label: 'Certification', icon: '🏅' },
  { key: 'translate', label: 'Translate', icon: '🌍' },
]

const THUMBNAILS: ThumbnailVariant[] = [
  { id: 1, gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)', ctr: 2.1, label: 'Warm Fire' },
  { id: 2, gradient: 'linear-gradient(135deg, #d4a017 0%, #f97316 100%)', ctr: 3.4, label: 'Golden Hour' },
  { id: 3, gradient: 'linear-gradient(135deg, #7c3aed 0%, #f97316 100%)', ctr: 4.8, label: 'Sunset Crown' },
  { id: 4, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', ctr: 1.9, label: 'Ocean Dusk' },
]

const LANGUAGES: Language[] = [
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬', status: 'ready' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬', status: 'ready' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', status: 'generating' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', status: 'ready' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹', status: 'queued' },
  { code: 'wo', name: 'Wolof', flag: '🇸🇳', status: 'ready' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦', status: 'generating' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭', status: 'queued' },
  { code: 'fr', name: 'French', flag: '🇫🇷', status: 'ready' },
  { code: 'en', name: 'English', flag: '🇬🇧', status: 'ready' },
]

const TIME_ZONES: TimeZone[] = [
  { zone: 'WAT', label: 'West Africa (WAT)', heat: 92, bestTime: '18:30' },
  { zone: 'CAT', label: 'Central Africa (CAT)', heat: 78, bestTime: '19:00' },
  { zone: 'EAT', label: 'East Africa (EAT)', heat: 85, bestTime: '20:00' },
  { zone: 'SAST', label: 'South Africa (SAST)', heat: 71, bestTime: '19:30' },
  { zone: 'GMT', label: 'Diaspora West (GMT)', heat: 64, bestTime: '21:00' },
]

const CERT_TIERS: { tier: CertTier; label: string; badge: string; color: string; requirements: CertRequirement[] }[] = [
  {
    tier: 'verified', label: 'Verified Creator', badge: '🟢', color: '#22c55e',
    requirements: [
      { label: '10+ uploads', done: true, detail: '14 / 10 uploads' },
      { label: 'AfroID verified', done: true, detail: 'AFR-NGA-HLT-000239' },
      { label: '100+ followers', done: true, detail: '247 followers' },
    ],
  },
  {
    tier: 'guardian', label: 'Cultural Guardian', badge: '🟡', color: '#eab308',
    requirements: [
      { label: '50+ uploads', done: false, detail: '14 / 50 uploads' },
      { label: 'Content in 3+ African languages', done: false, detail: '2 / 3 languages' },
      { label: 'Community endorsements', done: false, detail: '0 / 5 endorsements' },
    ],
  },
  {
    tier: 'keeper', label: 'Heritage Keeper', badge: '🟣', color: '#a855f7',
    requirements: [
      { label: '200+ uploads', done: false, detail: '14 / 200 uploads' },
      { label: 'Cultural preservation contributions', done: false, detail: 'Not started' },
      { label: 'Elder endorsements', done: false, detail: '0 / 3 endorsements' },
      { label: 'Village council approval', done: false, detail: 'Pending' },
    ],
  },
  {
    tier: 'master', label: 'Master Griot', badge: '👑', color: '#d4a017',
    requirements: [
      { label: '500+ uploads', done: false, detail: '14 / 500 uploads' },
      { label: 'Pan-African distribution', done: false, detail: 'Not started' },
      { label: 'Generational content', done: false, detail: 'Not started' },
      { label: 'UNESCO-level cultural impact', done: false, detail: 'Not started' },
    ],
  },
]

const MOCK_REVIEWS: ReviewItem[] = [
  { id: 'rv1', title: 'Yoruba Naming Ceremony — Full Documentary', status: 'approved', griotScore: 94, votes: 47 },
  { id: 'rv2', title: 'Igbo Masquerade Dance at Harvest Festival', status: 'under_review', griotScore: 82, votes: 23 },
  { id: 'rv3', title: 'Modern Afrobeats: Roots & Evolution', status: 'needs_changes', griotScore: 61, votes: 12 },
]

const MOCK_CERTIFIED: CertifiedItem[] = [
  { id: 'c1', title: 'The Art of Kente Weaving', creator: 'Kofi Mensah', tier: 'master', score: 98, badge: '👑' },
  { id: 'c2', title: 'Swahili Poetry Recital', creator: 'Amina Osei', tier: 'keeper', score: 91, badge: '🟣' },
  { id: 'c3', title: 'Zulu War Dance History', creator: 'Sipho Ndlovu', tier: 'guardian', score: 87, badge: '🟡' },
  { id: 'c4', title: 'Hausa Calligraphy Masterclass', creator: 'Ibrahim Danladi', tier: 'keeper', score: 93, badge: '🟣' },
  { id: 'c5', title: 'Afrobeats Production Workshop', creator: 'Tunde Adeyemi', tier: 'verified', score: 79, badge: '🟢' },
  { id: 'c6', title: 'Ethiopian Coffee Ceremony', creator: 'Desta Bekele', tier: 'guardian', score: 85, badge: '🟡' },
  { id: 'c7', title: 'West African Drum Patterns', creator: 'Mamadou Diallo', tier: 'master', score: 96, badge: '👑' },
  { id: 'c8', title: 'Ankara Fashion Evolution', creator: 'Ngozi Okafor', tier: 'verified', score: 76, badge: '🟢' },
]

const VOICE_ACTORS: VoiceActor[] = [
  { id: 'va1', name: 'Adunni Ade', language: 'Yoruba', accent: 'Lagos', rating: 4.9, pricePerMin: 100, avatar: '👩🏾' },
  { id: 'va2', name: 'Chidi Okonkwo', language: 'Igbo', accent: 'Enugu', rating: 4.7, pricePerMin: 85, avatar: '👨🏾' },
  { id: 'va3', name: 'Fatima Bello', language: 'Hausa', accent: 'Kano', rating: 4.8, pricePerMin: 90, avatar: '👩🏾' },
  { id: 'va4', name: 'Jabari Mwangi', language: 'Swahili', accent: 'Nairobi', rating: 4.6, pricePerMin: 80, avatar: '👨🏿' },
  { id: 'va5', name: 'Amara Diop', language: 'Wolof', accent: 'Dakar', rating: 4.5, pricePerMin: 75, avatar: '👩🏿' },
  { id: 'va6', name: 'Tendai Moyo', language: 'Zulu', accent: 'Johannesburg', rating: 4.8, pricePerMin: 95, avatar: '👨🏾' },
  { id: 'va7', name: 'Kofi Asante', language: 'Twi', accent: 'Kumasi', rating: 4.4, pricePerMin: 70, avatar: '👨🏿' },
  { id: 'va8', name: 'Yaa Mensah', language: 'French', accent: 'Abidjan', rating: 4.7, pricePerMin: 88, avatar: '👩🏿' },
]

const COUNTRY_CELLS: CountryCell[] = [
  { code: 'NG', name: 'Nigeria', coverage: 95, color: '#22c55e' },
  { code: 'GH', name: 'Ghana', coverage: 78, color: '#84cc16' },
  { code: 'KE', name: 'Kenya', coverage: 82, color: '#22c55e' },
  { code: 'ZA', name: 'S. Africa', coverage: 65, color: '#eab308' },
  { code: 'ET', name: 'Ethiopia', coverage: 45, color: '#f97316' },
  { code: 'SN', name: 'Senegal', coverage: 58, color: '#eab308' },
  { code: 'TZ', name: 'Tanzania', coverage: 72, color: '#84cc16' },
  { code: 'CM', name: 'Cameroon', coverage: 41, color: '#f97316' },
  { code: 'CI', name: 'Ivory Coast', coverage: 53, color: '#eab308' },
  { code: 'UG', name: 'Uganda', coverage: 62, color: '#eab308' },
  { code: 'RW', name: 'Rwanda', coverage: 38, color: '#ef4444' },
  { code: 'ML', name: 'Mali', coverage: 32, color: '#ef4444' },
  { code: 'ZW', name: 'Zimbabwe', coverage: 48, color: '#f97316' },
  { code: 'MW', name: 'Malawi', coverage: 29, color: '#ef4444' },
  { code: 'BJ', name: 'Benin', coverage: 55, color: '#eab308' },
  { code: 'TG', name: 'Togo', coverage: 36, color: '#ef4444' },
  { code: 'NE', name: 'Niger', coverage: 22, color: '#ef4444' },
  { code: 'BF', name: 'Burkina Faso', coverage: 27, color: '#ef4444' },
  { code: 'MZ', name: 'Mozambique', coverage: 44, color: '#f97316' },
  { code: 'CD', name: 'Congo', coverage: 35, color: '#ef4444' },
]

const CULTURAL_NOTES = [
  { lang: 'Yoruba', note: "In the Yoruba version, 'my brother' should be '\u1EB8\u0300gb\u1ECDn mi' (older) or '\u00C0b\u00FAr\u00F2 mi' (younger) based on context. Age hierarchy matters in every pronoun." },
  { lang: 'Zulu', note: "The greeting 'Sawubona' literally means 'I see you' \u2014 it acknowledges the person's existence. Never replace with a casual 'Hi' in translations." },
  { lang: 'Amharic', note: "Amharic uses Ge'ez script. Ensure your font stack includes Nyala or Abyssinica SIL for proper rendering of \u12A5\u1295\u12F3\u121D\u1295." },
  { lang: 'Swahili', note: "'Harambee' (pulling together) carries deep communal weight. In financial contexts, translate as cooperative contribution, not just 'fundraising'." },
  { lang: 'Wolof', note: "'Teranga' (hospitality) is a core Senegalese value. When translating welcome messages, use 'Teranga' as the cultural anchor, not a literal translation." },
]

const SEO_BEFORE = {
  title: 'How to Cook Jollof Rice',
  desc: 'A recipe video showing how to make jollof rice at home.',
  tags: ['#cooking', '#rice', '#food'],
}
const SEO_AFTER = {
  title: 'The REAL Jollof Rice Recipe \u2014 West African Kitchen Secrets',
  desc: 'Master the authentic West African jollof with smoky party-style flavour. Passed down from Mama Sade in Lagos \u2014 3 generations of fire.',
  tags: ['#JollofWars', '#AfricanCuisine', '#WestAfricanFood', '#NaijaKitchen', '#PartyJollof', '#AfroFoodie'],
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function AmplifyPage() {
  if (!USE_MOCKS) return <UnderConstruction module="AI Content Amplification" />
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab] = React.useState<Tab>('amplify')

  // Amplify tab state
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({
    thumbnails: true, captions: true, audio: false, seo: true, posting: true,
  })
  const [selectedThumb, setSelectedThumb] = React.useState<number>(3)
  const [audioPreset, setAudioPreset] = React.useState<AudioPreset>('cinema')
  const [showSeoAfter, setShowSeoAfter] = React.useState(false)
  const [amplifying, setAmplifying] = React.useState(false)

  // Certification tab state
  const [certExpanded, setCertExpanded] = React.useState<CertTier | null>('verified')

  // Translate tab state
  const [sourceLang, setSourceLang] = React.useState('en')
  const [targetLangs, setTargetLangs] = React.useState<Set<string>>(new Set(['yo', 'sw', 'ha']))
  const [translating, setTranslating] = React.useState(false)
  const [translateProgress, setTranslateProgress] = React.useState<Record<string, number>>({
    yo: 100, sw: 100, ha: 67, ig: 0, am: 0, wo: 0, zu: 0, tw: 0, fr: 0,
  })

  React.useEffect(() => { injectCSS() }, [])

  function toggle(key: string) {
    setToggles((p) => ({ ...p, [key]: !p[key] }))
  }

  function toggleTargetLang(code: string) {
    setTargetLangs((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code); else next.add(code)
      return next
    })
  }

  function handleAmplify() {
    setAmplifying(true)
    setTimeout(() => setAmplifying(false), 2200)
  }

  function handleTranslate() {
    setTranslating(true)
    const interval = setInterval(() => {
      setTranslateProgress((prev) => {
        const next = { ...prev }
        let allDone = true
        targetLangs.forEach((code) => {
          if (next[code] === undefined) next[code] = 0
          if (next[code] < 100) { next[code] = Math.min(100, next[code] + Math.floor(Math.random() * 18) + 5); allDone = false }
        })
        if (allDone) { clearInterval(interval); setTranslating(false) }
        return next
      })
    }, 400)
  }

  /* ── style helpers ── */
  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: CARD_BG, border: CARD_BORDER, borderRadius: 14, padding: 16, ...extra,
  })

  const pillBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: FONT_HEAD,
    fontSize: 13, fontWeight: 600, transition: 'all .2s',
    background: active ? AMATERASU_COLOR : 'rgba(255,255,255,.06)',
    color: active ? '#000' : 'rgba(255,255,255,.6)',
  })

  const goldBtn = (disabled?: boolean): React.CSSProperties => ({
    padding: '12px 28px', borderRadius: 12, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'rgba(212,160,23,.3)' : `linear-gradient(135deg, ${GOLD}, ${AMATERASU_COLOR})`,
    color: '#000', fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700,
    opacity: disabled ? 0.5 : 1, transition: 'all .2s',
  })

  const toggleSwitch = (on: boolean): React.CSSProperties => ({
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative' as const,
    background: on ? AMATERASU_COLOR : 'rgba(255,255,255,.12)', transition: 'background .2s', flexShrink: 0,
  })

  const toggleKnob = (on: boolean): React.CSSProperties => ({
    width: 18, height: 18, borderRadius: 9, background: '#fff', position: 'absolute' as const,
    top: 3, left: on ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
  })

  const sectionTitle = (text: string, icon: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 700, color: TEXT }}>{text}</span>
    </div>
  )

  /* ── progress bar helper ── */
  const progressBar = (pct: number, color: string, height = 6) => (
    <div style={{ width: '100%', height, borderRadius: height / 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: height / 2, background: color, transition: 'width .5s ease' }} />
    </div>
  )

  /* ════════════════════════════════════════════════════════════════
     TAB 1: AMPLIFY
  ════════════════════════════════════════════════════════════════ */
  function renderAmplifyTab() {
    return (
      <div className="am-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Amaterasu Hero ── */}
        <div className="am-glow" style={{
          ...card(), textAlign: 'center' as const, padding: 28,
          background: 'linear-gradient(135deg, rgba(249,115,22,.12) 0%, rgba(212,160,23,.06) 100%)',
          border: `1px solid rgba(249,115,22,.2)`,
        }}>
          <div className="am-sunrise" style={{ fontSize: 52, marginBottom: 8, filter: 'drop-shadow(0 0 16px rgba(249,115,22,.5))' }}>
            &#9728;&#65039;
          </div>
          <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 800, color: AMATERASU_COLOR, margin: '0 0 6px' }}>
            Amaterasu Content Engine
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: 'rgba(255,255,255,.6)', margin: 0 }}>
            AI-powered amplification for African creators
          </p>
        </div>

        {/* ── 1. Smart Thumbnails ── */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎬</span>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700 }}>Smart Thumbnails</span>
            </div>
            <div style={toggleSwitch(toggles.thumbnails)} onClick={() => toggle('thumbnails')}>
              <div style={toggleKnob(toggles.thumbnails)} />
            </div>
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 12px' }}>
            AI generates 4 thumbnail variations — pick the best performer
          </p>
          {toggles.thumbnails && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {THUMBNAILS.map((t) => (
                <div key={t.id} onClick={() => setSelectedThumb(t.id)} style={{
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative' as const,
                  border: selectedThumb === t.id ? `2px solid ${AMATERASU_COLOR}` : '2px solid transparent',
                  transition: 'border .2s',
                }}>
                  <div style={{ background: t.gradient, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.4))' }}>&#9728;&#65039;</span>
                  </div>
                  <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.7)' }}>{t.label}</span>
                    <span style={{
                      fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700,
                      color: t.ctr >= 4 ? '#22c55e' : t.ctr >= 3 ? '#eab308' : 'rgba(255,255,255,.5)',
                    }}>
                      {t.ctr}% CTR
                    </span>
                  </div>
                  {selectedThumb === t.id && (
                    <div style={{
                      position: 'absolute' as const, top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
                      background: AMATERASU_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#000', fontWeight: 700,
                    }}>&#10003;</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 2. Caption & Subtitle Generator ── */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📝</span>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700 }}>Caption & Subtitle Generator</span>
            </div>
            <div style={toggleSwitch(toggles.captions)} onClick={() => toggle('captions')}>
              <div style={toggleKnob(toggles.captions)} />
            </div>
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 12px' }}>
            Auto-generates captions in 10 African languages
          </p>
          {toggles.captions && (
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {LANGUAGES.map((l) => (
                <div key={l.code} className="am-slide" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
                  background: l.status === 'ready' ? 'rgba(34,197,94,.12)' : l.status === 'generating' ? 'rgba(249,115,22,.12)' : 'rgba(255,255,255,.05)',
                  border: `1px solid ${l.status === 'ready' ? 'rgba(34,197,94,.25)' : l.status === 'generating' ? 'rgba(249,115,22,.25)' : 'rgba(255,255,255,.08)'}`,
                }}>
                  <span style={{ fontSize: 13 }}>{l.flag}</span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: TEXT }}>{l.name}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: l.status === 'ready' ? '#22c55e' : l.status === 'generating' ? AMATERASU_COLOR : 'rgba(255,255,255,.2)',
                    ...(l.status === 'generating' ? { animation: 'amPulse 1.5s ease-in-out infinite' } : {}),
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Audio Enhancement ── */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎵</span>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700 }}>Audio Enhancement</span>
            </div>
            <div style={toggleSwitch(toggles.audio)} onClick={() => toggle('audio')}>
              <div style={toggleKnob(toggles.audio)} />
            </div>
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 12px' }}>
            AI noise reduction, volume normalization, background music suggestion
          </p>
          {toggles.audio && (
            <div style={{ display: 'flex', gap: 8 }}>
              {(['cinema', 'music', 'podcast'] as AudioPreset[]).map((p) => (
                <button key={p} onClick={() => setAudioPreset(p)} style={{
                  ...pillBtn(audioPreset === p), flex: 1, textTransform: 'capitalize' as const,
                }}>
                  {p === 'cinema' ? '🎬' : p === 'music' ? '🎵' : '🎙️'} {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── 4. SEO Optimizer ── */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📊</span>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700 }}>SEO Optimizer</span>
            </div>
            <div style={toggleSwitch(toggles.seo)} onClick={() => toggle('seo')}>
              <div style={toggleKnob(toggles.seo)} />
            </div>
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 12px' }}>
            Hashtag suggestions, title optimization, description rewrite
          </p>
          {toggles.seo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <button onClick={() => setShowSeoAfter(false)} style={pillBtn(!showSeoAfter)}>Before</button>
                <button onClick={() => setShowSeoAfter(true)} style={pillBtn(showSeoAfter)}>After ✨</button>
              </div>
              <div className="am-shimmer" style={{
                padding: 12, borderRadius: 10,
                background: showSeoAfter ? 'rgba(34,197,94,.06)' : 'rgba(255,255,255,.03)',
                border: `1px solid ${showSeoAfter ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)'}`,
              }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: showSeoAfter ? '#22c55e' : 'rgba(255,255,255,.7)', marginBottom: 6 }}>
                  {showSeoAfter ? SEO_AFTER.title : SEO_BEFORE.title}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 8, lineHeight: 1.5 }}>
                  {showSeoAfter ? SEO_AFTER.desc : SEO_BEFORE.desc}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                  {(showSeoAfter ? SEO_AFTER.tags : SEO_BEFORE.tags).map((tag) => (
                    <span key={tag} style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontFamily: FONT_BODY,
                      background: showSeoAfter ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)',
                      color: showSeoAfter ? '#4ade80' : 'rgba(255,255,255,.5)',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. Optimal Posting Time ── */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🕐</span>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700 }}>Optimal Posting Time</span>
            </div>
            <div style={toggleSwitch(toggles.posting)} onClick={() => toggle('posting')}>
              <div style={toggleKnob(toggles.posting)} />
            </div>
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 12px' }}>
            AI analyzes audience data to suggest best upload time per geo zone
          </p>
          {toggles.posting && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TIME_ZONES.map((tz) => (
                <div key={tz.zone} className="am-slide" style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{tz.label}</div>
                    {progressBar(tz.heat, tz.heat >= 85 ? '#22c55e' : tz.heat >= 70 ? '#eab308' : AMATERASU_COLOR)}
                  </div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: tz.heat >= 85 ? '#22c55e' : GOLD }}>{tz.bestTime}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{tz.heat}% activity</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Amplification Dashboard ── */}
        <div className="am-glow" style={{
          ...card({ padding: 20 }),
          background: 'linear-gradient(135deg, rgba(249,115,22,.08) 0%, rgba(212,160,23,.04) 100%)',
          border: `1px solid rgba(249,115,22,.15)`,
        }}>
          {sectionTitle('Amplification Dashboard', '📡')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Views', value: '12,847', icon: '👁️' },
              { label: 'Shares', value: '1,203', icon: '🔁' },
              { label: 'Engagement', value: '8.4%', icon: '💬' },
            ].map((stat) => (
              <div key={stat.label} style={{
                textAlign: 'center' as const, padding: '12px 8px', borderRadius: 10,
                background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.06)',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: AMATERASU_COLOR }}>{stat.value}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: 12, borderRadius: 10, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.15)', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span className="am-pulse" style={{ fontSize: 20 }}>🤖</span>
            <div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: '#4ade80' }}>AI Recommendation</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>
                Boost reach by <strong style={{ color: '#22c55e' }}>47%</strong> — switch to thumbnail #3 &amp; post at 18:30 WAT
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={handleAmplify} disabled={amplifying} style={goldBtn(amplifying)}>
              {amplifying ? '⏳ Amplifying...' : '⚡ Apply All Recommendations'}
            </button>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Cost: ₡50</span>
          </div>
        </div>
      </div>
    )
  }

  /* ════════════════════════════════════════════════════════════════
     TAB 2: CERTIFICATION
  ════════════════════════════════════════════════════════════════ */
  function renderCertificationTab() {
    const currentTier = 'verified' as CertTier
    const xpEarned = 2450
    const xpNeeded = 5000

    return (
      <div className="am-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── 4 Certification Tiers ── */}
        {sectionTitle('Certification Tiers', '🏅')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CERT_TIERS.map((ct) => {
            const isExpanded = certExpanded === ct.tier
            const isCurrent = ct.tier === currentTier
            return (
              <div key={ct.tier} className="am-slide" style={{
                ...card(),
                border: isCurrent ? `1px solid ${ct.color}` : CARD_BORDER,
                cursor: 'pointer',
              }} onClick={() => setCertExpanded(isExpanded ? null : ct.tier)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{ct.badge}</span>
                    <div>
                      <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: ct.color }}>{ct.label}</div>
                      {isCurrent && (
                        <span style={{
                          fontFamily: FONT_BODY, fontSize: 9, color: '#000', background: ct.color,
                          padding: '1px 6px', borderRadius: 6, fontWeight: 700, marginTop: 2, display: 'inline-block',
                        }}>CURRENT</span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 14, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    &#9660;
                  </span>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ct.requirements.map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: req.done ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.06)',
                          border: `1px solid ${req.done ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.1)'}`,
                          fontSize: 10, color: req.done ? '#22c55e' : 'rgba(255,255,255,.3)',
                        }}>
                          {req.done ? '✓' : '○'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: req.done ? TEXT : 'rgba(255,255,255,.5)' }}>{req.label}</div>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{req.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── My Certification Progress ── */}
        <div style={{
          ...card({ padding: 20 }),
          background: 'linear-gradient(135deg, rgba(34,197,94,.06) 0%, rgba(249,115,22,.04) 100%)',
          border: '1px solid rgba(34,197,94,.15)',
        }}>
          {sectionTitle('My Certification Progress', '📈')}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 32 }}>🟢</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: '#22c55e' }}>Verified Creator</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                Next: Cultural Guardian
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.5)' }}>XP Progress</span>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: GOLD }}>{xpEarned.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
            </div>
            {progressBar((xpEarned / xpNeeded) * 100, GOLD, 8)}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.4)', textAlign: 'center' as const, marginTop: 8 }}>
            {Math.round((xpEarned / xpNeeded) * 100)}% to Cultural Guardian — keep creating!
          </div>
        </div>

        {/* ── Cultural Review Queue ── */}
        <div style={card()}>
          {sectionTitle('Cultural Review Queue', '📋')}
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 12px' }}>
            Submit content for cultural certification review
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_REVIEWS.map((rv) => (
              <div key={rv.id} className="am-slide" style={{
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                  background: rv.status === 'approved' ? '#22c55e' : rv.status === 'under_review' ? '#eab308' : '#ef4444',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 600, color: TEXT, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rv.title}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                    {rv.status === 'approved' ? '✅ Approved' : rv.status === 'under_review' ? '⏳ Under Review' : '🔄 Needs Changes'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                  <div style={{
                    fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800,
                    color: rv.griotScore >= 80 ? '#22c55e' : rv.griotScore >= 60 ? '#eab308' : '#ef4444',
                  }}>{rv.griotScore}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Griot Score</div>
                </div>
                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>👥 {rv.votes}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: 'rgba(255,255,255,.3)' }}>votes</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Certified Content Wall ── */}
        <div style={card()}>
          {sectionTitle('Certified Content Wall', '🏛️')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {MOCK_CERTIFIED.map((item) => {
              const tierInfo = CERT_TIERS.find((ct) => ct.tier === item.tier)
              return (
                <div key={item.id} className="am-shimmer" style={{
                  padding: 10, borderRadius: 10,
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                  position: 'relative' as const,
                }}>
                  <div style={{
                    position: 'absolute' as const, top: 6, right: 6, fontSize: 14,
                    animation: 'amPulse 2s ease-in-out infinite',
                  }}>{item.badge}</div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 700, color: TEXT, marginBottom: 4, paddingRight: 22, lineHeight: 1.3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>
                    {item.creator}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: 9, padding: '1px 6px', borderRadius: 4,
                      background: `${tierInfo?.color || '#666'}22`, color: tierInfo?.color || '#666',
                      textTransform: 'capitalize' as const, fontWeight: 600,
                    }}>{item.tier.replace('_', ' ')}</span>
                    <span style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 700, color: item.score >= 90 ? '#22c55e' : '#eab308' }}>
                      {item.score}/100
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ════════════════════════════════════════════════════════════════
     TAB 3: TRANSLATE
  ════════════════════════════════════════════════════════════════ */
  function renderTranslateTab() {
    const coveredCount = Object.values(translateProgress).filter((v) => v === 100).length

    return (
      <div className="am-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Translation Dashboard ── */}
        <div style={{
          ...card({ padding: 20 }),
          background: 'linear-gradient(135deg, rgba(249,115,22,.06) 0%, rgba(34,197,94,.04) 100%)',
          border: '1px solid rgba(249,115,22,.12)',
        }}>
          {sectionTitle('Translation Dashboard', '🗺️')}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Your content's language reach</span>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800, color: AMATERASU_COLOR }}>
              {coveredCount} / 10 covered
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {COUNTRY_CELLS.map((c) => (
              <div key={c.code} style={{
                padding: '8px 4px', borderRadius: 8, textAlign: 'center' as const,
                background: `${c.color}12`, border: `1px solid ${c.color}22`,
              }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 700, color: c.color }}>{c.code}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{c.name}</div>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 10, fontWeight: 700, color: c.color, marginTop: 2 }}>{c.coverage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Translation Engine ── */}
        <div style={card()}>
          {sectionTitle('AI Translation Engine', '🤖')}

          {/* Source language */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>Source Language</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => setSourceLang(l.code)} style={{
                  ...pillBtn(sourceLang === l.code), fontSize: 11, padding: '5px 12px',
                }}>
                  {l.flag} {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target languages */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>Target Languages</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {LANGUAGES.filter((l) => l.code !== sourceLang).map((l) => {
                const selected = targetLangs.has(l.code)
                return (
                  <button key={l.code} onClick={() => toggleTargetLang(l.code)} style={{
                    padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11,
                    fontFamily: FONT_BODY, transition: 'all .2s',
                    background: selected ? 'rgba(249,115,22,.2)' : 'rgba(255,255,255,.06)',
                    color: selected ? AMATERASU_COLOR : 'rgba(255,255,255,.5)',
                    outline: selected ? `1px solid ${AMATERASU_COLOR}` : '1px solid transparent',
                  }}>
                    {selected ? '☑' : '☐'} {l.flag} {l.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progress bars */}
          {targetLangs.size > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {Array.from(targetLangs).map((code) => {
                const lang = LANGUAGES.find((l) => l.code === code)
                const pct = translateProgress[code] || 0
                return (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.6)', width: 70, flexShrink: 0 }}>
                      {lang?.flag} {lang?.name}
                    </span>
                    <div style={{ flex: 1 }}>{progressBar(pct, pct === 100 ? '#22c55e' : AMATERASU_COLOR)}</div>
                    <span style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 700, color: pct === 100 ? '#22c55e' : AMATERASU_COLOR, width: 36, textAlign: 'right' as const }}>
                      {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={handleTranslate} disabled={translating || targetLangs.size === 0} style={goldBtn(translating || targetLangs.size === 0)}>
              {translating ? '⏳ Translating...' : '🌍 Translate Content'}
            </button>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
              ₡25 per language pair
            </span>
          </div>
        </div>

        {/* ── Dubbing Studio ── */}
        <div style={card()}>
          {sectionTitle('Dubbing Studio', '🎙️')}

          {/* AI vs Human dub comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{
              padding: 12, borderRadius: 10, background: 'rgba(249,115,22,.06)',
              border: '1px solid rgba(249,115,22,.15)', textAlign: 'center' as const,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>🤖</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: AMATERASU_COLOR }}>AI Auto-Dub</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: GOLD, margin: '6px 0 2px' }}>₡10/min</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Fast turnaround</div>
              <div style={{ marginTop: 6 }}>
                {progressBar(75, AMATERASU_COLOR, 4)}
                <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>Quality: 75%</div>
              </div>
            </div>
            <div style={{
              padding: 12, borderRadius: 10, background: 'rgba(168,85,247,.06)',
              border: '1px solid rgba(168,85,247,.15)', textAlign: 'center' as const,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>👨🏾‍🎤</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: '#a855f7' }}>Human Dub</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: GOLD, margin: '6px 0 2px' }}>₡100/min</div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: 10, padding: '1px 6px', borderRadius: 4, display: 'inline-block',
                background: 'rgba(168,85,247,.15)', color: '#c084fc',
              }}>Premium Quality</div>
              <div style={{ marginTop: 6 }}>
                {progressBar(98, '#a855f7', 4)}
                <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>Quality: 98%</div>
              </div>
            </div>
          </div>

          {/* Voice Actor Marketplace */}
          <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
            Voice Actor Marketplace
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {VOICE_ACTORS.map((va) => (
              <div key={va.id} className="am-slide" style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10,
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
              }}>
                <span style={{ fontSize: 24 }}>{va.avatar}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: TEXT }}>{va.name}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                    {va.language} &middot; {va.accent} accent
                  </div>
                </div>
                <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: GOLD }}>₡{va.pricePerMin}/min</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: '#eab308' }}>
                    {'★'.repeat(Math.floor(va.rating))} <span style={{ color: 'rgba(255,255,255,.3)' }}>{va.rating}</span>
                  </div>
                </div>
                <button style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10,
                  fontFamily: FONT_HEAD, fontWeight: 700, background: 'rgba(249,115,22,.15)', color: AMATERASU_COLOR,
                }}>
                  Hire
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cultural Context Notes ── */}
        <div style={card()}>
          {sectionTitle('Cultural Context Notes', '📖')}
          <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '0 0 12px' }}>
            AI generates cultural adaptation notes for each translation
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CULTURAL_NOTES.map((cn, i) => (
              <div key={i} className="am-slide" style={{
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(249,115,22,.04)', border: '1px solid rgba(249,115,22,.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: FONT_HEAD, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                    background: 'rgba(249,115,22,.15)', color: AMATERASU_COLOR,
                  }}>{cn.lang}</span>
                  <span style={{ fontSize: 12 }}>💡</span>
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.55 }}>
                  {cn.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100dvh', background: BG, color: TEXT, fontFamily: FONT_BODY, paddingBottom: 100 }}>
      {/* ── Header ── */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{
          width: 36, height: 36, borderRadius: 18, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,.06)', color: TEXT, fontSize: 18, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>&#8592;</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 800, color: TEXT, margin: 0 }}>
            <span style={{ color: AMATERASU_COLOR }}>&#9728;&#65039;</span> Amplify Hub
          </h1>
          <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            Powered by Amaterasu &middot; Content AI God
          </p>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 8, background: 'rgba(249,115,22,.12)',
          border: '1px solid rgba(249,115,22,.2)', fontFamily: FONT_HEAD, fontSize: 11,
          fontWeight: 700, color: AMATERASU_COLOR,
        }}>
          ₡ 2,340
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        display: 'flex', gap: 4, padding: '14px 16px 10px', position: 'sticky' as const, top: 0,
        zIndex: 10, background: BG,
      }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, transition: 'all .2s',
            background: tab === t.key ? AMATERASU_COLOR : 'rgba(255,255,255,.06)',
            color: tab === t.key ? '#000' : 'rgba(255,255,255,.5)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: '0 16px' }}>
        {tab === 'amplify' && renderAmplifyTab()}
        {tab === 'certification' && renderCertificationTab()}
        {tab === 'translate' && renderTranslateTab()}
      </div>
    </div>
  )
}
