'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

import { ThemeMode, t, SectionLabel } from '@/components/dashboard/shared'
import { useAuthStore } from '@/stores/authStore'
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
// ── Village Compound v3 — Integrated Professional Dashboard ──────────────────

const DASH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
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

// ── Village name map ──────────────────────────────────────────
const VILLAGE_NAMES: Record<string, { en: string; local: string }> = {
  commerce:     { en: 'Commerce Village',     local: 'Ìlú Oníṣòwò'     },
  health:       { en: 'Health Village',       local: 'Ìlú Ìwòsàn'      },
  agriculture:  { en: 'Agriculture Village',  local: 'Ìlú Àgbẹ̀'        },
  education:    { en: 'Education Village',    local: 'Ilé Ìwé'          },
  justice:      { en: 'Justice Village',      local: 'Ìlú Ìdájọ́'       },
  finance:      { en: 'Finance Village',      local: 'Ìlú Owó'         },
  builders:     { en: 'Builders Village',     local: 'Ìlú Oníṣẹ́'       },
  technology:   { en: 'Technology Village',   local: 'Ìlú Ìmọ̀-ẹ̀rọ'    },
  arts:         { en: 'Arts Village',         local: 'Ìlú Oníṣọnà'     },
  media:        { en: 'Media Village',        local: 'Ìlú Ìròyìn'      },
  security:     { en: 'Security Village',     local: 'Ìlú Aṣọ́jú'       },
  spirituality: { en: 'Spirituality Village', local: 'Ìlú Ìmọ̀lè'      },
  fashion:      { en: 'Fashion Village',      local: 'Ìlú Aṣọ'         },
  family:       { en: 'Family Village',       local: 'Ìlú Ìdílé'       },
  transport:    { en: 'Transport Village',    local: 'Ìlú Ọkọ̀'         },
  energy:       { en: 'Energy Village',       local: 'Ìlú Agbára'      },
  hospitality:  { en: 'Hospitality Village',  local: 'Ìlú Àlejò'       },
  government:   { en: 'Government Village',   local: 'Ìlú Ìjọba'       },
  sports:       { en: 'Sports Village',       local: 'Ìlú Eré-Ìdárayá' },
  holdings:     { en: 'Holdings Village',     local: 'Ìlú Ohun Ìní'    },
}

export default function DashboardPage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<ThemeMode>('dark')
  const [showSOS, setShowSOS] = React.useState(false)
  const [sosResponded, setSosResponded] = React.useState(false)
  const [vitality, setVitality] = React.useState({ cowrie:'₡4.2K', kila:'52', jobs:'147', live:'🔴 4', isLive:false })
  const activeVillageId = useVillageStore(s => s.activeVillageId)
  const user = useAuthStore(s => s.user)
  const greeting = React.useMemo(() => getTimeGreeting(), [])
  const africanGreeting = React.useMemo(() => getAfricanGreeting(), [])
  const villageName = (activeVillageId && VILLAGE_NAMES[activeVillageId]) || VILLAGE_NAMES['commerce']
  // Active village full data — for ancient name, color, emoji, guardian
  const activeVillage = activeVillageId ? VILLAGE_BY_ID[activeVillageId] : null
  const villageColor = activeVillage?.color ?? '#1a7c3e'
  const villageEmoji = activeVillage?.emoji ?? '🧺'

  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('dash-css')) {
      const s = document.createElement('style')
      s.id = 'dash-css'
      s.textContent = DASH_CSS
      document.head.appendChild(s)
    }
    const t = setTimeout(() => setShowSOS(true), 4000)
    // Fetch live vitality from BFF
    fetch('/api/v1/home/vitality')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.data) return
        const v = d.data
        const bal = v.cowrieBalance ?? 0
        setVitality({
          cowrie: bal >= 1000 ? `₡${(bal/1000).toFixed(1)}K` : `₡${bal}`,
          kila:   String(v.kilaEarned ?? 52),
          jobs:   String(v.activePosts ?? 147),
          live:   `🔴 ${v.activeCircles ?? 4}`,
          isLive: !!d.live,
        })
      })
      .catch(() => {})
    return () => clearTimeout(t)
  }, [])

  const isDark = mode === 'dark'

  return (
    <main style={{ minHeight:'100dvh', background:t('bg',mode), color:t('text',mode), fontFamily:'Inter, system-ui, sans-serif', overflowX:'hidden', maxWidth:480, margin:'0 auto', paddingBottom:100 }}>

      {/* STATUS BAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 18px', background: isDark ? '#060d08' : '#fff', fontSize:11, fontWeight:700, color: isDark ? '#4ade80' : '#1a7c3e' }}>
        <span>9:41</span>
        <span style={{ padding:'2px 8px', borderRadius:99, background: isDark ? 'rgba(26,124,62,.25)' : 'rgba(26,124,62,.1)', fontSize:10, fontWeight:700 }}>⚒ ISE · WORK</span>
        <span>🔋</span>
      </div>

      {/* APP HEADER */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background: isDark ? '#0a1a0b' : '#fff', borderBottom: isDark ? 'none' : `1px solid ${t('border',mode)}` }}>
        <div
          onClick={() => router.push('/dashboard/villages')}
          style={{ width:36, height:36, borderRadius:10, background: villageColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, cursor:'pointer', boxShadow: `0 2px 10px ${villageColor}50` }}
        >{villageEmoji}</div>
        <div style={{ flex:1, minWidth:0 }}>
          {activeVillage ? (
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
          <div onClick={() => router.push('/dashboard/explore')} style={{ width:30, height:30, borderRadius:'50%', background:t('muted',mode), border:`1px solid ${t('border',mode)}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, cursor:'pointer', position:'relative' }}>🔍</div>
          <div onClick={() => router.push('/dashboard/notifications')} style={{ width:30, height:30, borderRadius:'50%', background:t('muted',mode), border:`1px solid ${t('border',mode)}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, cursor:'pointer', position:'relative' }}>
            🔔
            <span style={{ position:'absolute', top:-3, right:-3, width:14, height:14, borderRadius:'50%', background:'#1a7c3e', border:`2px solid ${isDark?'#0a1a0b':'#fff'}`, fontSize:8, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>5</span>
          </div>
        </div>
      </div>

      {/* ZONE 1: HERO */}
      <div style={{ padding:14, background: isDark ? `linear-gradient(180deg, ${villageColor}18 0%, #091608 40%, #0a1a0b 100%)` : 'linear-gradient(180deg,#0f2d14 0%,#1a4a1f 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize:'22px 22px', pointerEvents:'none' }}/>

        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12, position:'relative', zIndex:1 }}>
          <UbuntuRing />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#7da882', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:3 }}>{greeting.english}, {user?.displayName || 'Traveller'} {greeting.emoji}</div>
            <div style={{ fontFamily:'Sora,sans-serif', fontSize:22, fontWeight:800, color:'#f0f7f0', lineHeight:1.1, marginBottom:4 }}>Welcome Home.</div>
            {activeVillage ? (
              <div style={{ marginBottom:4 }}>
                <div style={{ fontFamily:'"Cinzel","Palatino",serif', fontSize:14, fontWeight:900, color: villageColor, letterSpacing:'0.05em', lineHeight:1.2 }}>
                  📍 {activeVillage.ancientName}
                </div>
                <div style={{ fontSize:9.5, color:'rgba(255,255,255,.38)', marginTop:2 }}>
                  {activeVillage.name} · {activeVillage.nationFull} · {activeVillage.era}
                </div>
                <div style={{ fontSize:9.5, color: villageColor, marginTop:2, opacity:0.7, fontStyle:'italic' }}>
                  Guardian: {activeVillage.guardian}
                </div>
              </div>
            ) : (
              <div style={{ fontSize:10, color:'rgba(74,222,128,.6)', fontWeight:600, marginBottom:2, cursor:'pointer' }} onClick={() => router.push('/dashboard/villages')}>
                📍 No village yet — tap to choose your path →
              </div>
            )}
            <div style={{ fontSize:11, color:'rgba(212,160,23,.7)', fontStyle:'italic', marginBottom:4 }}>"{africanGreeting.text}" — <span style={{ fontSize:10, color:'rgba(212,160,23,.45)' }}>{africanGreeting.language}</span></div>
            <div style={{ fontSize:12, color:'#a7f3d0', lineHeight:1.55, marginBottom:8 }}>The village is alive. 3 new opportunities are waiting.</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {[['🛡 Nkisi GREEN','rgba(26,124,62,.25)','rgba(26,124,62,.5)','#4ade80'],['✦ Crest III','rgba(212,160,23,.15)','rgba(212,160,23,.4)','#fbbf24'],['🌍 Akan','rgba(255,255,255,.08)','rgba(255,255,255,.15)','#f0f7f0']].map(([lbl,bg,bd,col])=>(
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
        <div onClick={() => router.push('/dashboard/feed')} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', cursor:'pointer', position:'relative', zIndex:1 }}>
          <TalkingDrum />
          <div style={{ fontSize:11, color:'#a7f3d0', flex:1, lineHeight:1.4 }}><strong>2 Kíla</strong> received · Fatima D. needs a runner · Ajo circle collects Friday</div>
          <span style={{ background:'#1a7c3e', color:'#fff', borderRadius:99, padding:'2px 8px', fontSize:10, fontWeight:700 }}>5</span>
        </div>
      </div>

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

      <CowrieWallet mode={mode} onAction={(a) => { if (a === 'earnings' || a === 'history') router.push('/dashboard/cowrie-flow'); else console.log('Wallet Action:', a) }} />

      {/* ── CALENDAR — Quick Access ─────────────────── */}
      <div onClick={() => router.push('/dashboard/calendar')} style={{ margin:'8px 12px 0', borderRadius:14, padding:'12px 16px', cursor:'pointer', background:'linear-gradient(135deg,#0d1020,#1a1040)', border:'1px solid rgba(251,191,36,.15)', display:'flex', alignItems:'center', gap:14, transition:'all .2s' }}>
        <div style={{ fontSize:32, flexShrink:0 }}>📅</div>
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
            <div style={{ fontFamily:'Sora,sans-serif', fontSize:16, fontWeight:900, background:'linear-gradient(135deg,#4ade80,#1a7c3e)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:2 }}>BAOBAB</div>
            <div style={{ fontSize:10, color:'rgba(74,222,128,.5)', fontWeight:600 }}>Bank · Marketplace · Calendar · Villages · 17 more apps</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:12, background:'rgba(26,124,62,.15)', border:'1px solid rgba(26,124,62,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#4ade80', fontWeight:900 }}>→</div>
        </div>
      </div>

      <SectionLabel label="🔴 Live Now · Jollof TV" more="All channels" mode={mode} />
      <div onClick={() => router.push('/dashboard/tv')} style={{ cursor: 'pointer' }}>
        <JollofTVCard />
      </div>

      <NationFires mode={mode} />

      {/* BLOOD-CALL SOS */}
      {showSOS && (
        <div className="sos-card fade-up" onClick={() => { setSosResponded(true); router.push('/dashboard/chat') }} style={{ margin:'8px 12px', borderRadius:12, padding:'11px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:'linear-gradient(135deg,#7f1d1d,#b22222)' }}>
          <div style={{ fontSize:26, flexShrink:0 }}>🥁</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2 }}>{sosResponded ? 'Response sent to Mma Utibe' : 'Blood-Call from Mma Utibe'}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.75)', lineHeight:1.4 }}>{sosResponded ? 'Your family circle has been alerted' : 'Your mother sent a distress signal — 14 min ago · Lagos'}</div>
          </div>
          <div style={{ background:'rgba(255,255,255,.2)', border:'1px solid rgba(255,255,255,.3)', borderRadius:99, padding:'5px 12px', fontSize:11, fontWeight:700, color:'#fff', whiteSpace:'nowrap' }}>{sosResponded ? '✓ Sent' : 'Respond →'}</div>
        </div>
      )}

      <SectionLabel label="⚒ Your Village Tools" more="All tools" mode={mode} />
      <VillageTools mode={mode} />

      <NkisiShield mode={mode} />

      <WorkLedger mode={mode} />

      <AjoCard mode={mode} />

      {/* DAILY PROVERB */}
      <div style={{ margin:'8px 12px 16px', borderRadius:14, padding:14, cursor:'pointer', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#1a0a00,#2d1500)' }}>
        <div style={{ position:'absolute', right:-6, bottom:-6, width:60, height:60, borderRadius:'50%', background:'rgba(212,160,23,.08)' }}/>
        <div style={{ fontSize:10, fontWeight:700, color:'#d4a017', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>✦ Daily Wisdom — shared by the Griot</div>
        <div style={{ fontSize:13, fontStyle:'italic', color:'#d4a017', lineHeight:1.65, marginBottom:5, fontWeight:600 }}>&ldquo;Agbado t&iacute; a b&aacute; jẹ papọ̀ n&iacute; dun&rdquo;</div>
        <div style={{ fontSize:10, color:'rgba(212,160,23,.5)' }}>Corn eaten together always tastes sweeter · Yoruba proverb</div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:8, background: 'rgba(212,160,23,.12)', border: '1px solid rgba(212,160,23,.25)', borderRadius:99, padding:'4px 10px', fontSize:10, color: '#d4a017', fontWeight:700, cursor:'pointer' }}>
          🥁 Drum this proverb to your village
        </div>
      </div>

    </main>
  )
}
