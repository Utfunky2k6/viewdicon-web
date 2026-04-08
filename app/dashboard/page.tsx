'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

import { ThemeMode, t, SectionLabel } from '@/components/dashboard/shared'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'
import UbuntuRing from '@/components/dashboard/UbuntuRing'
import { useVillageStore } from '@/stores/villageStore'
import { VILLAGE_BY_ID } from '@/lib/villages-data'
import GriotCard from '@/components/dashboard/GriotCard'
import NationFires from '@/components/dashboard/NationFires'
import WorkLedger from '@/components/dashboard/WorkLedger'
import AjoCard from '@/components/dashboard/AjoCard'
import TalkingDrum from '@/components/dashboard/TalkingDrum'
import CowrieWallet from '@/components/dashboard/CowrieWallet'
import JollofTVCard from '@/components/dashboard/JollofTVCard'
import VillageTools from '@/components/dashboard/VillageTools'
import NkisiShield from '@/components/dashboard/NkisiShield'
import { GriotSymbol } from '@/components/dashboard/GriotAI/GriotSymbol'
import { GyeNyame, NkisiShield as NkisiIcon, DjembeIcon, KowrieIcon, Sankofa } from '@/components/ui/afro-icons'
// ── Village Compound v3 — Integrated Professional Dashboard ──────────────────

const DASH_CSS = `
@keyframes db{0%,100%{transform:scaleY(.4);opacity:.5}50%{transform:scaleY(1);opacity:1}}
@keyframes pulse-y{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
@keyframes pulse-r{0%,100%{transform:scale(1)}50%{transform:scale(1.6)}}
@keyframes sos-p{0%,100%{box-shadow:0 0 0 0 rgba(178,34,34,.5)}50%{box-shadow:0 0 0 12px rgba(178,34,34,0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.db-bar{width:3px;border-radius:99px;background:#1a7c3e;animation:db .8s ease-in-out infinite}
.db-bar:nth-child(1){height:6px;animation-delay:0s}
.db-bar:nth-child(2){height:14px;animation-delay:.1s}
.db-bar:nth-child(3){height:10px;animation-delay:.2s}
.db-bar:nth-child(4){height:18px;animation-delay:.15s}
.db-bar:nth-child(5){height:8px;animation-delay:.05s}
.db-bar:nth-child(6){height:14px;animation-delay:.25s}
.pulse-dot{animation:pulse-y 2s ease-in-out infinite}
.live-dot{animation:pulse-r .7s ease-in-out infinite}
.sos-card{animation:sos-p 2s ease-in-out infinite}
.fade-up{animation:fadeUp .4s ease both}
`

// ── Time-based African greetings ──────────────────────────────
const AFRICAN_GREETINGS: Record<string, { morning: string; afternoon: string; evening: string; night: string }> = {
  Yoruba:  { morning: 'E káàrọ̀',      afternoon: 'E káàsán',    evening: 'E kú ìrọ̀lẹ́',   night: 'O dàárọ̀'      },
  Igbo:    { morning: 'Ụtụtụ ọma',     afternoon: 'Ehihie ọma',  evening: 'Mgbede ọma',     night: 'Ka chi fọọ'    },
  Hausa:   { morning: 'Ina kwana',      afternoon: 'Ina wuni',    evening: 'Barka da yamma', night: 'Mu kwana lafiya'},
  Swahili: { morning: 'Habari ya asubuhi', afternoon: 'Habari ya mchana', evening: 'Habari ya jioni', night: 'Usiku mwema' },
  Zulu:    { morning: 'Sawubona',       afternoon: 'Sawubona',    evening: 'Sawubona',       night: 'Lala kahle'    },
  Akan:    { morning: 'Maakye',         afternoon: 'Maaha',       evening: 'Maadwo',         night: 'Da yie'        },
}

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12)  return { period: 'morning'  as const, english: 'Good morning',   emoji: '🌅' }
  if (hour >= 12 && hour < 17) return { period: 'afternoon' as const, english: 'Good afternoon', emoji: '☀️' }
  if (hour >= 17 && hour < 21) return { period: 'evening'  as const, english: 'Good evening',   emoji: '🌇' }
  return { period: 'night' as const, english: 'Good night', emoji: '🌙' }
}

function getAfricanGreeting() {
  const { period } = getTimeGreeting()
  const langs = Object.keys(AFRICAN_GREETINGS)
  // Rotate based on day of year so it changes daily
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const lang = langs[dayOfYear % langs.length]
  return { text: AFRICAN_GREETINGS[lang][period], language: lang }
}

// ── Village name map — multi-linguistic Pan-African names ────────
// Each village has names from different African language families,
// not just Yoruba. Names drawn from: Swahili, Akan/Twi, Amharic,
// Zulu, Wolof, Hausa, Arabic-North-African, Lingala traditions.
const VILLAGE_NAMES: Record<string, { en: string; local: string; lang: string }> = {
  commerce:     { en: 'Commerce Village',     local: 'Mji wa Biashara',   lang: 'Swahili'  },
  health:       { en: 'Health Village',       local: 'Kua ya Afya',       lang: 'Swahili'  },
  agriculture:  { en: 'Agriculture Village',  local: 'Aburokyire Kuro',   lang: 'Akan/Twi' },
  education:    { en: 'Education Village',    local: 'Bet Timhirt',       lang: 'Amharic'  },
  justice:      { en: 'Justice Village',      local: 'Indlu Yobulungisa', lang: 'Zulu'     },
  finance:      { en: 'Finance Village',      local: 'Dëkk bi Xaalis',   lang: 'Wolof'    },
  builders:     { en: 'Builders Village',     local: 'Gari Magina',       lang: 'Hausa'    },
  technology:   { en: 'Technology Village',   local: 'Mji wa Teknolojia', lang: 'Swahili'  },
  arts:         { en: 'Arts Village',         local: 'Abadwuma Kuro',     lang: 'Akan/Twi' },
  media:        { en: 'Media Village',        local: 'Mji wa Habari',     lang: 'Swahili'  },
  security:     { en: 'Security Village',     local: 'Indlu Yokuphepha',  lang: 'Zulu'     },
  spirituality: { en: 'Spirituality Village', local: 'Mji wa Roho',       lang: 'Swahili'  },
  fashion:      { en: 'Fashion Village',      local: 'Dëkk bi Ngom',     lang: 'Wolof'    },
  family:       { en: 'Family Village',       local: 'Umzi Womndeni',     lang: 'Xhosa'    },
  transport:    { en: 'Transport Village',    lang: 'Hausa', local: 'Gari Hanya'           },
  energy:       { en: 'Energy Village',       local: 'Mji wa Nguvu',      lang: 'Swahili'  },
  hospitality:  { en: 'Hospitality Village',  local: 'Bet Tesfa',         lang: 'Amharic'  },
  government:   { en: 'Government Village',   local: 'Kuo ya Serikali',   lang: 'Swahili'  },
  sports:       { en: 'Sports Village',       local: 'Abasa Kuro',        lang: 'Akan/Twi' },
  holdings:     { en: 'Holdings Village',     local: 'Mji wa Mali',       lang: 'Swahili'  },
}

export default function DashboardPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<ThemeMode>('dark')
  const [showSOS, setShowSOS] = React.useState(false)
  const [sosResponded, setSosResponded] = React.useState(false)
  const [vitality, setVitality] = React.useState({ cowrie:'₡0', kila:'0', jobs:'0', live:'🔴 0', isLive:false, notifCount:0 })
  const [devOtp, setDevOtp] = React.useState('')
  const [proverbDrummed, setProverbDrummed] = React.useState(false)
  // Welcome banner — shown when arriving from ceremony (?welcome=1)
  const [showWelcome, setShowWelcome] = React.useState(false)
  const { user, setUser, isNewCitizen, setNewCitizen } = useAuthStore()
  const activeVillageId = useVillageStore(s => s.activeVillageId)
  const setActiveVillage = useVillageStore(s => s.setActiveVillage)
  const setActiveRole = useVillageStore(s => s.setActiveRole)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('welcome') === '1' || isNewCitizen) {
        setShowWelcome(true)
        if (isNewCitizen) setNewCitizen(false)
      }
    }
  }, [isNewCitizen, setNewCitizen, setUser])

  // Refresh user profile from backend — merge with existing data (don't overwrite ceremony-hydrated fields)
  React.useEffect(() => {
    authApi.me().then(me => {
      if (me && typeof me === 'object') {
        const prev = useAuthStore.getState().user
        if (!prev) { setUser(me); return }
        // Only overwrite fields that the backend actually returns non-empty
        const merged: Record<string, unknown> = { ...prev }
        for (const [k, v] of Object.entries(me as Record<string, unknown>)) {
          if (v !== null && v !== undefined && v !== '') merged[k] = v
        }
        setUser(merged)
      }
    }).catch((e) => logApiFailure('dashboard/me', e))
  }, [setUser])

  // Sync user's village from auth profile into village store on first load
  React.useEffect(() => {
    if (!activeVillageId && user?.villageId) {
      setActiveVillage(user.villageId)
      if (user.roleKey) setActiveRole(user.roleKey)
    }
  }, [activeVillageId, user?.villageId, user?.roleKey, setActiveVillage, setActiveRole])
  const [greeting, setGreeting] = React.useState<{ period: string; english: string; emoji: string }>({ period: 'morning', english: 'Good morning', emoji: '🌅' })
  const [africanGreeting, setAfricanGreeting] = React.useState({ text: '', language: '' })
  React.useEffect(() => { setGreeting(getTimeGreeting()); setAfricanGreeting(getAfricanGreeting()) }, [])
  // Use activeVillageId from villageStore, fall back to user.villageId for immediate first-render hydration
  const resolvedVillageId = activeVillageId || user?.villageId || null
  const villageName = (resolvedVillageId && VILLAGE_NAMES[resolvedVillageId]) || VILLAGE_NAMES['commerce']
  // Active village full data — for ancient name, color, emoji, guardian
  const activeVillage = resolvedVillageId ? VILLAGE_BY_ID[resolvedVillageId] : null
  const villageColor = activeVillage?.color ?? '#1a7c3e'
  const villageEmoji = activeVillage?.emoji ?? '🧺'

  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('dash-css')) {
      const s = document.createElement('style')
      s.id = 'dash-css'
      s.textContent = DASH_CSS
      document.head.appendChild(s)
    }

    // Fetch live vitality from BFF
    fetch('/api/v1/home/vitality')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.data) return
        const v = d.data
        const bal = v.cowrieBalance ?? 0
        setVitality({
          cowrie: bal >= 1000 ? `₡${(bal/1000).toFixed(1)}K` : `₡${bal}`,
          kila:   String(v.kilaEarned ?? 0),
          jobs:   String(v.activePosts ?? 0),
          live:   `🔴 ${v.activeCircles ?? 0}`,
          isLive: !!d.live,
          notifCount: v.notifCount ?? v.unreadNotifications ?? 0,
        })
      })
      .catch((e) => logApiFailure('dashboard/vitality', e))
  }, [])

  const isDark = mode === 'dark'
  const [clockStr, setClockStr] = React.useState('--:--')
  React.useEffect(() => {
    const tick = () => { const d = new Date(); setClockStr(`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`) }
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])
  const activeSkinLabel = useVillageStore(s => s.activeSkin)?.toUpperCase() ?? 'ISE'

  const isAlly = user?.heritageCircle === 'ALLY'

  return (
    <main style={{ minHeight:'100dvh', background:t('bg',mode), color:t('text',mode), fontFamily:'Inter, system-ui, sans-serif', overflowX:'hidden', maxWidth:480, margin:'0 auto', paddingBottom:100 }}>

      {/* STATUS BAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 18px', background: isDark ? '#060d08' : '#fff', fontSize:11, fontWeight:700, color: isDark ? '#4ade80' : '#1a7c3e' }}>
        <span>{clockStr}</span>
        {devOtp && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'2px 8px', borderRadius:99, background:'rgba(212,160,23,.15)', border:'1px solid rgba(212,160,23,.3)', animation:'fadeUp .3s ease both' }}>
            <span style={{ fontSize:9 }}>🥁</span>
            <span style={{ fontSize:10, fontWeight:900, color:'#fbbf24', letterSpacing:'.04em' }}>CODE: {devOtp}</span>
            <button onClick={() => { setDevOtp(''); localStorage.removeItem('afk-latest-otp') }} style={{ background:'none', border:'none', color:'#fbbf24', fontSize:10, cursor:'pointer', padding:0, marginLeft:4 }}>✕</button>
          </div>
        )}
        <span style={{ padding:'2px 8px', borderRadius:99, background: isDark ? 'rgba(26,124,62,.25)' : 'rgba(26,124,62,.1)', fontSize:10, fontWeight:700 }}>{isAlly ? '🤝 ALLY' : `🌍 ${activeSkinLabel}`}</span>
      </div>

      {/* ── WELCOME BANNER — first-time citizen arrival from ceremony ── */}
      {showWelcome && (
        <div className="fade-up" style={{ margin:'8px 12px', borderRadius:20, padding:'18px 16px', background:'linear-gradient(135deg,#0a1f0c,#1a3a10,#0a1f0c)', border:'2px solid rgba(74,222,128,.35)', position:'relative', overflow:'hidden' }}>
          {/* Kente pattern bg */}
          <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'repeating-linear-gradient(45deg,#4ade80 0,#4ade80 1px,transparent 0,transparent 50%)', backgroundSize:'18px 18px', pointerEvents:'none' }}/>
          <button
            onClick={() => setShowWelcome(false)}
            style={{ position:'absolute', top:10, right:14, background:'none', border:'none', color:'rgba(255,255,255,.4)', fontSize:16, cursor:'pointer', lineHeight:1 }}
          >✕</button>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ transform: 'scale(1.5)', color:'#4ade80' }}><GyeNyame size={40} /></div>
              <div>
                <div style={{ fontFamily:'Sora, sans-serif', fontSize:16, fontWeight:900, color:'#4ade80', lineHeight:1.2 }}>
                  Welcome to the Motherland{user?.firstName ? `, ${user.firstName}` : ''}!
                </div>
                <div style={{ fontSize:10, color:'rgba(74,222,128,.6)', fontWeight:600, marginTop:2 }}>
                  You are now a citizen of the Digital African Renaissance
                </div>
              </div>
            </div>
            {user?.afroId?.raw && (
              <div style={{ background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.25)', borderRadius:12, padding:'10px 14px', marginBottom:10 }}>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:'.1em', color:'rgba(74,222,128,.5)', textTransform:'uppercase', marginBottom:4 }}>🛡 Your AfroID (keep it safe)</div>
                <div style={{ fontFamily:"'Courier New',monospace", fontSize:16, fontWeight:900, color:'#4ade80', letterSpacing:'.1em' }}>{user.afroId.raw}</div>
              </div>
            )}
            {activeVillage && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:villageColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{villageEmoji}</div>
                <div>
                  <div style={{ fontFamily:'"Cinzel","Palatino",serif', fontSize:12, fontWeight:900, color:villageColor }}>{activeVillage.ancientName}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)' }}>{activeVillage.name} · Your new home</div>
                </div>
              </div>
            )}
            <div style={{ fontSize:11, fontStyle:'italic', color:'rgba(212,160,23,.7)', lineHeight:1.6, marginBottom:10 }}>
              "A child who is not raised by the village will burn it down."
              <span style={{ fontSize:9, color:'rgba(212,160,23,.4)', display:'block', marginTop:2 }}>— African Proverb</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setShowWelcome(false); router.push('/dashboard/profile') }} style={{ flex:1, padding:'9px 0', borderRadius:12, background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.25)', color:'#4ade80', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                👤 View Profile
              </button>
              <button onClick={() => { setShowWelcome(false); router.push('/dashboard/villages') }} style={{ flex:1, padding:'9px 0', borderRadius:12, background:'rgba(26,124,62,.25)', border:'1px solid rgba(26,124,62,.4)', color:'#4ade80', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                🏡 Explore Village
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APP HEADER */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background: isDark ? '#0a1a0b' : '#fff', borderBottom: isDark ? 'none' : `1px solid ${t('border',mode)}` }}>
        <div
          onClick={() => router.push('/dashboard/villages')}
          style={{ width:36, height:36, borderRadius:10, background: isAlly ? '#2563eb' : villageColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, cursor:'pointer', boxShadow: `0 2px 10px ${isAlly ? '#2563eb' : villageColor}50` }}
        >{isAlly ? '🌎' : villageEmoji}</div>
        <div style={{ flex:1, minWidth:0 }}>
          {isAlly ? (
            <>
              <div style={{ fontSize:13, fontWeight:700, color:t('text',mode), lineHeight:1.2 }}>Cultural Ally</div>
              <div style={{ fontSize:10, color:t('sub',mode) }}>Supporting the African Renaissance</div>
            </>
          ) : activeVillage ? (
            <>
              <div style={{ fontFamily:'"Cinzel","Palatino",serif', fontSize:13, fontWeight:900, color: villageColor, lineHeight:1.1, letterSpacing:'0.04em' }}>{activeVillage.ancientName}</div>
              <div style={{ fontSize:9.5, color:t('sub',mode), marginTop:1 }}>{activeVillage.name} · {activeVillage.guardian}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize:13, fontWeight:700, color:t('text',mode), lineHeight:1.2 }}>No Village Yet</div>
              <div style={{ fontSize:10, color:t('sub',mode) }}>Tap to choose your village →</div>
            </>
          )}
        </div>
        <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
          <div onClick={() => router.push('/dashboard/explore')} style={{ width:30, height:30, borderRadius:'50%', background:t('muted',mode), border:`1px solid ${t('border',mode)}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, cursor:'pointer', position:'relative' }}><Sankofa size={16} /></div>
          <div onClick={() => router.push('/dashboard/notifications')} style={{ width:30, height:30, borderRadius:'50%', background:t('muted',mode), border:`1px solid ${t('border',mode)}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, cursor:'pointer', position:'relative' }}>
            <DjembeIcon size={18} />
            {vitality.notifCount > 0 && <span style={{ position:'absolute', top:-3, right:-3, width:14, height:14, borderRadius:'50%', background:'#1a7c3e', border:`2px solid ${isDark?'#0a1a0b':'#fff'}`, fontSize:8, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{vitality.notifCount > 9 ? '9+' : vitality.notifCount}</span>}
          </div>
        </div>
      </div>

      {/* ZONE 1: HERO */}
      <div style={{ padding:14, background: isDark ? `linear-gradient(180deg, ${isAlly ? '#1e3a8a' : villageColor}18 0%, #091608 40%, #0a1a0b 100%)` : 'linear-gradient(180deg,#0f2d14 0%,#1a4a1f 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize:'22px 22px', pointerEvents:'none' }}/>

        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12, position:'relative', zIndex:1 }}>
          <UbuntuRing score={user?.ubuntuScore ?? (isAlly ? 45 : 72)} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#7da882', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:3 }}>{greeting.english}, {user?.firstName || user?.displayName || 'Traveller'} {greeting.emoji}</div>
            <div style={{ fontFamily:'Sora, sans-serif', fontSize:22, fontWeight:800, color:'#f0f7f0', lineHeight:1.1, marginBottom:4 }}>{isAlly ? "Unity & Service." : user?.firstName ? `Welcome, ${user.firstName}.` : "Welcome Home."}</div>
            {isAlly ? (
              <div style={{ fontSize:11, color:'#a7f3d0', marginBottom:8 }}>Thank you for standing with the continent.</div>
            ) : activeVillage ? (
              <div style={{ marginBottom:4 }}>
                <div style={{ fontFamily:'"Cinzel","Palatino",serif', fontSize:14, fontWeight:900, color: villageColor, letterSpacing:'0.05em', lineHeight:1.2 }}>
                  📍 {activeVillage.ancientName}
                </div>
                <div style={{ fontSize:9.5, color:'rgba(255,255,255,.38)', marginTop:2 }}>
                  {activeVillage.name} · {activeVillage.nationFull} · {activeVillage.era}
                </div>
              </div>
            ) : (
              <div style={{ fontSize:10, color:'rgba(74,222,128,.6)', fontWeight:600, marginBottom:2, cursor:'pointer' }} onClick={() => router.push('/dashboard/villages')}>
                📍 No village yet — tap to choose your path →
              </div>
            )}
            {africanGreeting.text && <div style={{ fontSize:11, color:'rgba(212,160,23,.7)', fontStyle:'italic', marginBottom:4 }}>"{africanGreeting.text}" — <span style={{ fontSize:10, color:'rgba(212,160,23,.45)' }}>{africanGreeting.language}</span></div>}

            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {([
                [`🛡 Nkisi ${user?.nkisiState || 'GREEN'}`,'rgba(26,124,62,.25)','rgba(26,124,62,.5)','#4ade80'],
                ...(isAlly ? [[`🤝 Alliance Circle`,'rgba(37,99,235,.15)','rgba(37,99,235,.4)','#60a5fa']] : []),
                ...(user?.roleKey ? [[`✦ Crest I`,'rgba(212,160,23,.15)','rgba(212,160,23,.4)','#fbbf24']] : []),
                ...(user?.heritage ? [[`🌍 ${user.heritage}`,'rgba(255,255,255,.08)','rgba(255,255,255,.15)','#f0f7f0']] : []),
              ] as string[][]).map(([lbl,bg,bd,col])=>(
                <span key={lbl} style={{ borderRadius:99, padding:'3px 9px', fontSize:10, fontWeight:600, background:bg, border:`1px solid ${bd}`, color:col }}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display:'flex', gap:5, marginBottom:10, position:'relative', zIndex:1 }}>
          {[[vitality.jobs,'Jobs Done',''],[vitality.cowrie,'In Your Pot',''],[vitality.kila,'Kíla Earned',''],[vitality.live,'Live Now','red']].map(([v,l,red])=>(
            <div key={l} style={{ flex:1, borderRadius:10, padding:'8px 5px', textAlign:'center', background: red ? 'rgba(239,68,68,.1)' : 'rgba(255,255,255,.06)', border: `1px solid ${red ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.09)'}` }}>
              <div style={{ fontSize:15, fontWeight:800, color: red ? '#f87171' : '#f0f7f0', lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:9, color:'#7da882', marginTop:2, fontWeight:600, lineHeight:1.3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Talking drum */}
        {!isAlly && (
          <div onClick={() => router.push('/dashboard/feed')} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer', position:'relative', zIndex:1 }}>
            <TalkingDrum />
            <div style={{ fontSize:11, color:'#a7f3d0', flex:1, lineHeight:1.4 }}><strong>{vitality.kila} Kíla</strong> earned · New activity in your village · Tap to see the feed</div>
            <span style={{ background:'#1a7c3e', color:'#fff', borderRadius:99, padding:'2px 8px', fontSize:10, fontWeight:700 }}>→</span>
          </div>
        )}
      </div>

      {isAlly && (
        <div style={{ margin: '14px 12px', borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #1e3a8a, #1e1b4b)', border: '1px solid rgba(37,99,235,.3)', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🙌</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#60a5fa', marginBottom: 6 }}>Deepen Your Connection</div>
          <div style={{ fontSize: 12, color: 'rgba(96,165,250,.7)', marginBottom: 16, lineHeight: 1.5 }}>Circle 3 members can apply to join specific villages as Contributing Partners or Honored Guests.</div>
          <button
            onClick={() => router.push('/dashboard/villages')}
            style={{ padding: '10px 24px', borderRadius: 99, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
          >
            Explore Villages →
          </button>
        </div>
      )}

      {/* ZONE 2: TOOLS */}
      {!isAlly && (
        <>
          <SectionLabel label="⚒ Village Tools" more="Vault" onMore={() => router.push('/dashboard/sessions')} mode={mode} />
          <VillageTools mode={mode} />
        </>
      )}

      <GriotCard mode={mode} onAction={() => router.push('/dashboard/ai')} />

      <div className="flex flex-col items-center py-8 gap-4 bg-gradient-to-b from-transparent to-[#0a1a0b]/40">
        <GriotSymbol size={160} />
        <div className="text-center px-8">
          <h2 className="font-['Sora'] text-sm font-black text-[#fbbf24] uppercase tracking-widest mb-1">Griot AI Core</h2>
          <p className="text-[11px] text-[#fbbf24]/60 leading-relaxed italic">
            "I am the 5 AI Gods of Africa. I see the village, I hear the drum, I know the path. Talk to me to trade, to find kin, or to see the future."
          </p>
          <button
            onClick={() => router.push('/dashboard/ai')}
            className="mt-4 px-6 py-2 rounded-full bg-[#fbbf24] text-black text-[11px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]"
          >
            Enter the Sanctuary
          </button>
        </div>
      </div>

      <CowrieWallet mode={mode} onAction={(a) => {
        if (a === 'earnings' || a === 'history') router.push('/dashboard/cowrie-flow')
        else if (a === 'send' || a === 'transfer') router.push('/dashboard/banking')
        else if (a === 'receive' || a === 'add') router.push('/dashboard/banking')
        else if (a === 'withdraw') router.push('/dashboard/cowrie-flow')
        else router.push('/dashboard/cowrie-flow')
      }} />

      {/* ── CALENDAR — Quick Access ─────────────────── */}
      <div onClick={() => router.push('/dashboard/calendar')} style={{ margin:'8px 12px 0', borderRadius:14, padding:'12px 16px', cursor:'pointer', background:'linear-gradient(135deg,#0d1020,#1a1040)', border:'1px solid rgba(251,191,36,.15)', display:'flex', alignItems:'center', gap:14, transition:'all .2s' }}>
        <div style={{ fontSize:32, flexShrink:0 }}>🌙</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#fbbf24', marginBottom:2 }}>Ìṣẹ̀lẹ̀ · Calendar</div>
          <div style={{ fontSize:10, color:'rgba(251,191,36,.55)', fontWeight:600 }}>Moon cycles · Market days · Family events · Griot AI</div>
        </div>
        <div style={{ width:34, height:34, borderRadius:10, background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#fbbf24', fontWeight:900 }}>→</div>
      </div>

      {/* ── BAOBAB — App Ecosystem Entry ───────────── */}
      <div onClick={() => router.push('/dashboard/baobab')} style={{ margin:'8px 12px', borderRadius:16, padding:'14px 16px', cursor:'pointer', position:'relative', overflow:'hidden', background:'linear-gradient(135deg, #091608, #0d1f10, #091608)', border:'1px solid rgba(26,124,62,.2)', transition:'all .2s' }}>
        <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'repeating-linear-gradient(45deg,#1a7c3e 0,#1a7c3e 1px,transparent 0,transparent 50%)', backgroundSize:'16px 16px', pointerEvents:'none' }} />
        <div style={{ display:'flex', alignItems:'center', gap:14, position:'relative', zIndex:1 }}>
          <div style={{ fontSize:36, flexShrink:0 }}>🌳</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Sora, sans-serif', fontSize:16, fontWeight:900, background:'linear-gradient(135deg,#4ade80,#1a7c3e)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:2 }}>BAOBAB</div>
            <div style={{ fontSize:10, color:'rgba(74,222,128,.5)', fontWeight:600 }}>Bank · Marketplace · Love World · Villages · 20 more apps</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:12, background:'rgba(26,124,62,.15)', border:'1px solid rgba(26,124,62,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#4ade80', fontWeight:900 }}>→</div>
        </div>
      </div>

      <SectionLabel label="🔴 Live Now · Jollof TV" more="All channels" onMore={() => router.push('/dashboard/tv')} mode={mode} />
      <div onClick={() => router.push('/dashboard/tv')} style={{ cursor: 'pointer' }}>
        <JollofTVCard />
      </div>

      <NationFires mode={mode} />

      {/* BLOOD-CALL SOS */}
      {showSOS && (
        <div className="sos-card fade-up" onClick={() => { setSosResponded(true); router.push('/dashboard/chat') }} style={{ margin:'8px 12px', borderRadius:12, padding:'11px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:'linear-gradient(135deg,#7f1d1d,#b22222)' }}>
          <div style={{ fontSize:26, flexShrink:0 }}>🥁</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2 }}>{sosResponded ? 'Response sent to your family' : 'Blood-Call · Family Alert'}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.75)', lineHeight:1.4 }}>{sosResponded ? 'Your family circle has been alerted' : 'A family member sent a distress signal — tap to respond'}</div>
          </div>
          <div style={{ background:'rgba(255,255,255,.2)', border:'1px solid rgba(255,255,255,.3)', borderRadius:99, padding:'5px 12px', fontSize:11, fontWeight:700, color:'#fff', whiteSpace:'nowrap' }}>{sosResponded ? '✓ Sent' : 'Respond →'}</div>
        </div>
      )}

      <NkisiShield mode={mode} />

      <WorkLedger mode={mode} />

      <AjoCard mode={mode} />

      {/* DAILY PROVERB */}
      <div onClick={() => router.push('/dashboard/ai')} style={{ margin:'8px 12px 16px', borderRadius:14, padding:14, cursor:'pointer', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#1a0a00,#2d1500)' }}>
        <div style={{ position:'absolute', right:-6, bottom:-6, width:60, height:60, borderRadius:'50%', background:'rgba(212,160,23,.08)' }}/>
        <div style={{ fontSize:10, fontWeight:700, color:'#d4a017', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>✦ Daily Wisdom — shared by the Griot</div>
        <div style={{ fontSize:13, fontStyle:'italic', color:'#d4a017', lineHeight:1.65, marginBottom:5, fontWeight:600 }}>&ldquo;Agbado t&iacute; a b&aacute; jẹ papọ̀ n&iacute; dun&rdquo;</div>
        <div style={{ fontSize:10, color:'rgba(212,160,23,.5)' }}>Corn eaten together always tastes sweeter · Yoruba proverb</div>
        <div
          onClick={(e) => { e.stopPropagation(); setProverbDrummed(true); setTimeout(() => setProverbDrummed(false), 2500) }}
          style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:8, background: proverbDrummed ? 'rgba(74,222,128,.15)' : 'rgba(212,160,23,.12)', border: `1px solid ${proverbDrummed ? 'rgba(74,222,128,.35)' : 'rgba(212,160,23,.25)'}`, borderRadius:99, padding:'4px 10px', fontSize:10, color: proverbDrummed ? '#4ade80' : '#d4a017', fontWeight:700, cursor:'pointer', transition:'all .3s' }}
        >
          {proverbDrummed ? '✓ Drummed to village!' : '🥁 Drum this proverb to your village'}
        </div>
      </div>

    </main>
  )
}
