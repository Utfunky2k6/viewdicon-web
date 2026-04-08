'use client'
// ════════════════════════════════════════════════════════════════
// NKISI TRUST SCORE — Community truth-checking across the village
// Nkisi is the Kongo spirit that guards truth and protects the village
// Elders and validators mark posts as Certified · Trusted · Disputed
// ════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { USE_MOCKS } from '@/lib/flags'
import UnderConstruction from '@/components/ui/UnderConstruction'

const INJECT_ID = 'nkisi-css'
const CSS = `
@keyframes nkFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes nkGlow{0%,100%{box-shadow:0 0 0 0 rgba(26,124,62,.15)}50%{box-shadow:0 0 16px 3px rgba(26,124,62,.1)}}
@keyframes nkBar{from{width:0}to{width:var(--tw)}}
@keyframes nkPot{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.06) rotate(3deg)}}
.nk-fade{animation:nkFade .4s ease both}
.nk-glow{animation:nkGlow 3s ease-in-out infinite}
.nk-bar{animation:nkBar .8s ease both}
.nk-pot{animation:nkPot 3.5s ease-in-out infinite}
`

const KENTE = ['#d4a017','#1a7c3e','#b22222','#d4a017','#1a7c3e','#b22222','#d4a017','#1a7c3e']

const TRUST_LEVELS = [
  { min:90, max:100, label:'CERTIFIED', icon:'⭐', color:'#d4a017' },
  { min:70, max:89,  label:'TRUSTED',   icon:'🟢', color:'#1a7c3e' },
  { min:50, max:69,  label:'NEUTRAL',   icon:'🟡', color:'#ca8a04' },
  { min:30, max:49,  label:'DISPUTED',  icon:'🟠', color:'#ea580c' },
  { min:0,  max:29,  label:'CHALLENGED',icon:'🔴', color:'#b22222' },
]

function getTrustLevel(score: number) {
  return TRUST_LEVELS.find(t => score >= t.min && score <= t.max) ?? TRUST_LEVELS[2]
}

const MOCK_REVIEWS = [
  { id:'r1', excerpt:'The Obi river basin holds 40% of West Africa\'s underground fresh water — verified by ECOWAS hydrologists', authorName:'Chinonso Ibe', villageName:'Education', villageIcon:'📚', villageColor:'#3b82f6', trustScore:94, validators:38, village:'education' },
  { id:'r2', excerpt:'New cassava strain from IITA triples yield with 30% less rainfall — available to all farmers in Oyo State', authorName:'Funke Adeleke', villageName:'Agriculture', villageIcon:'🌾', villageColor:'#84cc16', trustScore:82, validators:21, village:'agriculture' },
  { id:'r3', excerpt:'Cowrie balance transfers now complete in under 12 seconds across all 47 corridor banks in 6 countries', authorName:'Tech Council', villageName:'Technology', villageIcon:'💻', villageColor:'#06b6d4', trustScore:76, validators:15, village:'technology' },
  { id:'r4', excerpt:'Village elder says moon planting calendar increases yam harvest by 70% — traditional knowledge being lost', authorName:'Baba Osei', villageName:'Arts', villageIcon:'🎨', villageColor:'#ec4899', trustScore:43, validators:29, village:'arts' },
  { id:'r5', excerpt:'Local health clinic in Kano administered 12,000 malaria vaccines last month with 0 adverse events recorded', authorName:'Dr. Hauwa Sani', villageName:'Health', villageIcon:'⚕', villageColor:'#10b981', trustScore:91, validators:52, village:'health' },
  { id:'r6', excerpt:'Artisan leather market in Marrakech now accepts Cowrie payments — first North African village to join', authorName:'Fatima Zahra', villageName:'Commerce', villageIcon:'🛒', villageColor:'#eab308', trustScore:57, validators:11, village:'commerce' },
]

const MOCK_LEADERBOARD = [
  { rank:1,  name:'Elder Adewale Okonkwo', village:'Health',      villageIcon:'⚕',  count:342, score:98.4 },
  { rank:2,  name:'Dr. Hauwa Sani',        village:'Health',      villageIcon:'⚕',  count:298, score:97.1 },
  { rank:3,  name:'Prof. Kwesi Mensah',    village:'Education',   villageIcon:'📚', count:241, score:96.8 },
  { rank:4,  name:'Amara Bangura',         village:'Agriculture', villageIcon:'🌾', count:189, score:95.2 },
  { rank:5,  name:'Chioma Nwachukwu',      village:'Commerce',    villageIcon:'🛒', count:167, score:94.7 },
  { rank:6,  name:'Tech Council',          village:'Technology',  villageIcon:'💻', count:154, score:93.9 },
  { rank:7,  name:'Fatima Diallo',         village:'Agriculture', villageIcon:'🌾', count:143, score:93.1 },
  { rank:8,  name:'Seun Adeyemi',          village:'Finance',     villageIcon:'₵',  count:121, score:91.5 },
  { rank:9,  name:'Elder Babatunde',       village:'Arts',        villageIcon:'🎨', count:108, score:90.2 },
  { rank:10, name:'Nkechi Eze',            village:'Family',      villageIcon:'🏡', count:94,  score:88.7 },
]

function TrustBar({ score }: { score: number }) {
  const level = getTrustLevel(score)
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:11, color:level.color, fontWeight:600 }}>{level.icon} {level.label}</span>
        <span style={{ fontSize:11, color:'#9aa3b0', fontWeight:600 }}>{score}/100</span>
      </div>
      <div style={{ background:'#1e2630', borderRadius:4, height:6, overflow:'hidden' }}>
        <div
          className="nk-bar"
          style={{
            height:'100%',
            borderRadius:4,
            background:`linear-gradient(90deg, ${level.color}88, ${level.color})`,
            width:`${score}%`,
          } as React.CSSProperties}
        />
      </div>
    </div>
  )
}

function ReviewCard({ item, voted, onVote }: any) {
  const userVote = voted.get(item.id) as 'validate' | 'dispute' | undefined
  return (
    <div className="nk-fade nk-glow" style={{ background:'#101418', border:'1px solid #1e2630', borderRadius:14, padding:'14px 16px', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ background:item.villageColor+'22', color:item.villageColor, borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:600 }}>
          {item.villageIcon} {item.villageName}
        </span>
        <span style={{ color:'#4b5563', fontSize:12, marginLeft:'auto' }}>👤 {item.authorName}</span>
      </div>
      <p style={{ color:'#d1cdc7', fontSize:13, margin:'0 0 12px', lineHeight:1.55, fontStyle:'italic' }}>"{item.excerpt}"</p>
      <TrustBar score={item.trustScore} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ color:'#6b7280', fontSize:12 }}>🏛 {item.validators} validators</span>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button
          onClick={() => !userVote && onVote(item.id, 'validate')}
          style={{
            flex:1,
            background: userVote === 'validate' ? '#1a7c3e' : '#1a7c3e22',
            border:`1px solid #1a7c3e`,
            borderRadius:10,
            padding:'9px',
            color: userVote === 'validate' ? '#fff' : '#1a7c3e',
            fontWeight:600,
            fontSize:13,
            cursor: userVote ? 'default' : 'pointer',
            fontFamily:'Sora,sans-serif',
            opacity: userVote && userVote !== 'validate' ? 0.4 : 1,
            transition:'all .2s',
          }}
        >
          ✅ Validate
        </button>
        <button
          onClick={() => !userVote && onVote(item.id, 'dispute')}
          style={{
            flex:1,
            background: userVote === 'dispute' ? '#ea580c' : '#ea580c22',
            border:`1px solid #ea580c`,
            borderRadius:10,
            padding:'9px',
            color: userVote === 'dispute' ? '#fff' : '#ea580c',
            fontWeight:600,
            fontSize:13,
            cursor: userVote ? 'default' : 'pointer',
            fontFamily:'Sora,sans-serif',
            opacity: userVote && userVote !== 'dispute' ? 0.4 : 1,
            transition:'all .2s',
          }}
        >
          ⚠️ Dispute
        </button>
      </div>
    </div>
  )
}

type TabType = 'reviews' | 'leaderboard'

export default function NkisiTrustPage() {
  if (!USE_MOCKS) return <UnderConstruction module="Nkisi Trust Score" />
  const router = useRouter()
  const [tab, setTab] = React.useState<TabType>('reviews')
  const [voted, setVoted] = React.useState<Map<string, 'validate' | 'dispute'>>(new Map())

  React.useEffect(() => {
    if (document.getElementById(INJECT_ID)) return
    const s = document.createElement('style')
    s.id = INJECT_ID
    s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  function castVote(postId: string, vote: 'validate' | 'dispute') {
    setVoted(m => new Map(m).set(postId, vote))
  }

  const tabStyle = (t: TabType) => ({
    flex:1,
    padding:'10px',
    background: tab === t ? '#1a7c3e' : 'transparent',
    border:'none',
    borderRadius:10,
    color: tab === t ? '#fff' : '#6b7280',
    fontWeight:600,
    fontSize:13,
    cursor:'pointer',
    fontFamily:'Sora,sans-serif',
    transition:'all .2s',
  })

  return (
    <div style={{ background:'#07090a', minHeight:'100vh', color:'#f0ece4', fontFamily:'Sora,sans-serif', paddingBottom:24 }}>

      {/* Kente stripe */}
      <div style={{ height:6, display:'flex' }}>
        {KENTE.map((c, i) => <div key={i} style={{ flex:1, background:c }} />)}
      </div>

      {/* Header */}
      <div style={{ padding:'14px 16px 0' }}>
        <button
          onClick={() => router.back()}
          style={{ background:'none', border:'none', color:'#9aa3b0', cursor:'pointer', fontSize:13, marginBottom:10, padding:0, fontFamily:'Sora,sans-serif' }}
        >
          ← Back
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <span className="nk-pot" style={{ fontSize:28, display:'inline-block' }}>🏺</span>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, letterSpacing:'-0.3px' }}>Nkisi Trust Score</h1>
        </div>
        <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 16px', paddingLeft:38 }}>Community truth-checking across the village</p>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:0, margin:'0 16px 18px', background:'#101418', borderRadius:12, border:'1px solid #1e2630', overflow:'hidden' }}>
        {[
          { label:'Posts Reviewed', value:'247' },
          { label:'Validators',     value:'89'  },
          { label:'Accuracy',       value:'94%' },
        ].map((s, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', padding:'12px 8px', borderRight: i < 2 ? '1px solid #1e2630' : 'none' }}>
            <div style={{ color:'#d4a017', fontWeight:700, fontSize:18 }}>{s.value}</div>
            <div style={{ color:'#6b7280', fontSize:11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trust level legend */}
      <div style={{ display:'flex', gap:6, padding:'0 16px', marginBottom:18, flexWrap:'wrap' }}>
        {TRUST_LEVELS.map(t => (
          <span key={t.label} style={{ background:t.color+'22', color:t.color, borderRadius:6, padding:'3px 8px', fontSize:11, fontWeight:600 }}>
            {t.icon} {t.label}
          </span>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:6, background:'#101418', margin:'0 16px 16px', borderRadius:12, padding:'6px' }}>
        <button style={tabStyle('reviews')} onClick={() => setTab('reviews')}>Active Reviews</button>
        <button style={tabStyle('leaderboard')} onClick={() => setTab('leaderboard')}>Leaderboard</button>
      </div>

      {/* Content */}
      <div style={{ padding:'0 16px' }}>

        {tab === 'reviews' && (
          <>
            {MOCK_REVIEWS.map((item, i) => (
              <div key={item.id} style={{ animationDelay:`${i * 0.07}s` }}>
                <ReviewCard item={item} voted={voted} onVote={castVote} />
              </div>
            ))}
          </>
        )}

        {tab === 'leaderboard' && (
          <div style={{ background:'#101418', border:'1px solid #1e2630', borderRadius:14, overflow:'hidden' }}>
            {MOCK_LEADERBOARD.map((v, i) => (
              <div
                key={v.rank}
                className="nk-fade"
                style={{
                  display:'flex',
                  alignItems:'center',
                  gap:12,
                  padding:'12px 16px',
                  borderBottom: i < MOCK_LEADERBOARD.length - 1 ? '1px solid #1e2630' : 'none',
                  animationDelay:`${i * 0.05}s`,
                }}
              >
                <span style={{
                  width:28, height:28, borderRadius:'50%',
                  background: v.rank === 1 ? '#d4a01733' : v.rank === 2 ? '#9ca3af22' : v.rank === 3 ? '#92400e22' : '#1e2630',
                  color: v.rank === 1 ? '#d4a017' : v.rank === 2 ? '#9ca3af' : v.rank === 3 ? '#d97706' : '#6b7280',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, fontSize:13, flexShrink:0,
                }}>
                  {v.rank}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#f0ece4', fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.name}</div>
                  <span style={{ color:'#6b7280', fontSize:11 }}>{v.villageIcon} {v.village}</span>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ color:'#1a7c3e', fontWeight:700, fontSize:14 }}>{v.count}</div>
                  <div style={{ color:'#6b7280', fontSize:10 }}>validations</div>
                </div>
                <div style={{ background:'#d4a01722', color:'#d4a017', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:700, flexShrink:0 }}>
                  {v.score}%
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  )
}
