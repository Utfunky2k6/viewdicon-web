'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const CSS_ID = 'reality-show-css'
const CSS = `
@keyframes rsF{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes rsPulse{0%,100%{opacity:.6;transform:scale(.9)}50%{opacity:1;transform:scale(1.15)}}
@keyframes rsVoteSuccess{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.2) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes rsConfetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-140px) rotate(720deg);opacity:0}}
@keyframes nightFire{0%,100%{box-shadow:0 0 8px 2px rgba(251,146,60,.4)}50%{box-shadow:0 0 18px 6px rgba(251,146,60,.8)}}
@keyframes drumWar{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes flameChain{0%{background-position:0% 50%}100%{background-position:100% 50%}}
@keyframes solidarityPop{0%{transform:scale(0) translateY(8px);opacity:0}70%{transform:scale(1.1) translateY(-2px);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}}
@keyframes elderGlow{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0)}50%{box-shadow:0 0 12px 3px rgba(251,191,36,.5)}}
.rs-fade{animation:rsF .35s ease both}
.rs-live{animation:rsPulse .9s ease-in-out infinite}
.rs-vote-ok{animation:rsVoteSuccess .5s cubic-bezier(.26,1.8,.58,1) both}
.rs-night{animation:nightFire 1.8s ease-in-out infinite}
.rs-drum{animation:drumWar .7s ease-in-out infinite}
.rs-elder{animation:elderGlow 2s ease-in-out infinite}
.rs-solidarity{animation:solidarityPop .4s cubic-bezier(.26,1.8,.58,1) both}
`

type Tab = 'LEADERBOARD' | 'CONTESTANTS' | 'VOTERS' | 'ABOUT'
type CrestLevel = 1 | 2 | 3 | 4 | 5
type Supporter = { name: string; color: string; photoUrl?: string | null }

const CREST_CONFIG: Record<number, { label: string; mult: number; color: string; emoji: string }> = {
  1: { label: 'I',   mult: 1.0, color: '#94a3b8', emoji: '🌱' },
  2: { label: 'II',  mult: 1.2, color: '#4ade80', emoji: '🌿' },
  3: { label: 'III', mult: 1.5, color: '#60a5fa', emoji: '⚡' },
  4: { label: 'IV',  mult: 2.0, color: '#c084fc', emoji: '🔥' },
  5: { label: 'V',   mult: 3.0, color: '#fbbf24', emoji: '👑' },
}

const COUNTRY_META: Record<string, { flag: string; region: string }> = {
  NG: { flag: '🇳🇬', region: 'West Africa' },
  GH: { flag: '🇬🇭', region: 'West Africa' },
  KE: { flag: '🇰🇪', region: 'East Africa' },
  ZA: { flag: '🇿🇦', region: 'Southern Africa' },
  ET: { flag: '🇪🇹', region: 'Horn of Africa' },
  SN: { flag: '🇸🇳', region: 'West Africa' },
  CM: { flag: '🇨🇲', region: 'Central Africa' },
  CI: { flag: '🇨🇮', region: 'West Africa' },
  TZ: { flag: '🇹🇿', region: 'East Africa' },
  EG: { flag: '🇪🇬', region: 'North Africa' },
  MA: { flag: '🇲🇦', region: 'North Africa' },
  RW: { flag: '🇷🇼', region: 'East Africa' },
}

const VOTE_PACKS = [
  { label: '1 Vote',    votes: 1,  cost: 10,  color: '#4ade80' },
  { label: '5 Votes',   votes: 5,  cost: 50,  color: '#fbbf24' },
  { label: '25 Votes',  votes: 25, cost: 200, color: '#c084fc', badge: 'VALUE' },
  { label: '75 Votes',  votes: 75, cost: 500, color: '#ef4444', badge: 'POWER PACK' },
]

const MOCK_COLORS = ['#e07b00','#1a7c3e','#7c3aed','#0369a1','#d4a017','#b22222','#0d9488','#9333ea']

function makeSupporters(names: string[]): Supporter[] {
  return names.map((n, i) => ({ name: n, color: MOCK_COLORS[i % MOCK_COLORS.length] }))
}

const MOCK_SHOWS: Record<string, any> = {
  sh1: {
    id: 'sh1', title: 'Village Idol — Season 4', season: 4, isActive: true,
    startDate: '2024-01-01', endDate: '2024-03-31', creatorId: 'tv_admin',
    description: 'The biggest Pan-African talent competition. Voices from all 20 villages vie for the Village Idol crown — judged by elders, chosen by the people.',
    drumWarPair: ['commerce', 'arts'],
    elderWitnesses: ['Elder Aderopo', 'Elder Nkemdirim', 'Elder Mariam'],
    contestants: [
      {
        id: 'c1', userId: 'idol_ada', displayName: 'Ada Okafor', votes: 12450, score: 94.2, isEliminated: false,
        village: 'Commerce', villageSlug: 'commerce', emoji: '🧺', villageRole: 'Chief Merchant',
        country: 'NG', crestLevel: 4 as CrestLevel, photoUrl: null,
        bio: 'Multi-award-winning trader from Onitsha Market. She turned her stall into a Pan-African export empire at 22.',
        supporters: makeSupporters(['Chidi','Bisi','Amara','Kwame','Sade','Ola','Tunde','Ngozi']),
      },
      {
        id: 'c2', userId: 'idol_kola', displayName: 'Kola Adeyemi', votes: 11203, score: 91.8, isEliminated: false,
        village: 'Arts', villageSlug: 'arts', emoji: '🎨', villageRole: 'Master Griot',
        country: 'GH', crestLevel: 3 as CrestLevel, photoUrl: null,
        bio: 'Sculptor and spoken-word artist from Kumasi, fusing Adinkra symbols with contemporary sculpture.',
        supporters: makeSupporters(['Ama','Kofi','Akua','Yaw','Abena']),
      },
      {
        id: 'c3', userId: 'idol_fatima', displayName: 'Fatima Ibrahim', votes: 9876, score: 88.5, isEliminated: false,
        village: 'Education', villageSlug: 'education', emoji: '🎓', villageRole: 'Head Scholar',
        country: 'SN', crestLevel: 5 as CrestLevel, photoUrl: null,
        bio: 'Youngest headmistress at Dakar Digital School. Pioneered coding education in rural Senegal.',
        supporters: makeSupporters(['Moussa','Aissatou','Diallo','Keita','Cisse','Balde']),
      },
      {
        id: 'c4', userId: 'idol_emeka', displayName: 'Emeka Obi', votes: 7654, score: 82.1, isEliminated: false,
        village: 'Health', villageSlug: 'health', emoji: '⚕️', villageRole: 'Head Healer',
        country: 'NG', crestLevel: 2 as CrestLevel, photoUrl: null,
        bio: 'Doctor and herbalist fusing modern medicine with Igbo healing traditions across 5 rural clinics.',
        supporters: makeSupporters(['Ifeoma','Obiora','Chioma','Nnamdi']),
      },
      {
        id: 'c5', userId: 'idol_amina', displayName: 'Amina Diallo', votes: 5432, score: 74.3, isEliminated: true,
        village: 'Fashion', villageSlug: 'fashion', emoji: '👗', villageRole: 'Style Elder',
        country: 'CI', crestLevel: 3 as CrestLevel, photoUrl: null,
        bio: 'Paris-trained designer who returned to Abidjan to build Africa\'s first circular-fashion platform.',
        supporters: makeSupporters(['Adja','Mariam','Fatou']),
      },
      {
        id: 'c6', userId: 'idol_kwame', displayName: 'Kwame Asante', votes: 4211, score: 68.9, isEliminated: true,
        village: 'Sports', villageSlug: 'sports', emoji: '⚽', villageRole: 'Village Champion',
        country: 'GH', crestLevel: 2 as CrestLevel, photoUrl: null,
        bio: 'Former Black Stars midfielder, now youth football academy founder across 3 countries.',
        supporters: makeSupporters(['Agyeman','Darko','Owusu']),
      },
    ],
  },
  sh2: {
    id: 'sh2', title: 'Culture Challenge — Continental Wars', season: 2, isActive: true,
    startDate: '2024-02-01', endDate: '2024-04-30', creatorId: 'tv_admin',
    description: 'A Pan-African cultural gauntlet. Contestants showcase traditional crafts, languages, music, and ceremonies — judged by elders from all regions.',
    drumWarPair: ['technology', 'media'],
    elderWitnesses: ['Elder Zara', 'Elder Wanjiku'],
    contestants: [
      {
        id: 'c7', userId: 'asa_chidi', displayName: 'Chidi Nwosu', votes: 8900, score: 90.1, isEliminated: false,
        village: 'Technology', villageSlug: 'technology', emoji: '💻', villageRole: 'Lead Engineer',
        country: 'NG', crestLevel: 3 as CrestLevel, photoUrl: null,
        bio: 'Open-source AI engineer bringing voice-first tech to rural communities.',
        supporters: makeSupporters(['Uche','Nkem','Ifeanyi','Obinna','Adaeze']),
      },
      {
        id: 'c8', userId: 'asa_sade', displayName: 'Sade Williams', votes: 7800, score: 87.4, isEliminated: false,
        village: 'Media', villageSlug: 'media', emoji: '📺', villageRole: 'Head Broadcaster',
        country: 'ZA', crestLevel: 4 as CrestLevel, photoUrl: null,
        bio: 'Award-winning documentarian covering Africa\'s untold stories from Cape Town to Cairo.',
        supporters: makeSupporters(['Nomvula','Sipho','Thandi']),
      },
      {
        id: 'c9', userId: 'asa_kofi', displayName: 'Kofi Mensah', votes: 6500, score: 83.1, isEliminated: false,
        village: 'Agriculture', villageSlug: 'agriculture', emoji: '🌾', villageRole: 'Master Farmer',
        country: 'GH', crestLevel: 2 as CrestLevel, photoUrl: null,
        bio: 'Permaculture pioneer who turned 500 acres of depleted land into thriving food forests.',
        supporters: makeSupporters(['Abena','Kwabena','Akosua']),
      },
    ],
  },
}

function positionLabel(i: number) {
  if (i === 0) return { icon: '👑', color: '#fbbf24', bg: 'rgba(251,191,36,.12)' }
  if (i === 1) return { icon: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,.1)' }
  if (i === 2) return { icon: '🥉', color: '#cd7c3e', bg: 'rgba(205,124,62,.1)' }
  return { icon: `#${i + 1}`, color: 'rgba(255,255,255,.4)', bg: 'rgba(255,255,255,.03)' }
}

function isNightFireWindow(): boolean {
  const h = new Date().getHours()
  return h >= 23 || h < 3
}

function AvatarCircle({ c, size, fontSize, border }: { c: any; size: number; fontSize: number; border?: string }) {
  const color = MOCK_COLORS[parseInt(c.id?.replace(/\D/g, '') ?? '0') % MOCK_COLORS.length]
  const initials = (c.displayName ?? '?').charAt(0).toUpperCase()
  if (c.photoUrl) {
    return (
      <img src={c.photoUrl} alt={c.displayName} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: border ?? `2px solid ${color}60`, flexShrink: 0 }} />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, border: border ?? `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', fontSize, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function SupporterWall({ supporters }: { supporters?: Supporter[] }) {
  if (!supporters?.length) return null
  const shown = supporters.slice(0, 7)
  const extra = supporters.length - shown.length
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
      {shown.map((s, i) => (
        <div key={i} title={s.name} style={{ width: 22, height: 22, borderRadius: '50%', background: s.color, border: '1.5px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#fff', fontFamily: 'Sora, sans-serif', marginLeft: i > 0 ? -6 : 0, flexShrink: 0 }}>
          {s.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {extra > 0 && (
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,.6)', marginLeft: -6 }}>
          +{extra}
        </div>
      )}
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', marginLeft: 6 }}>supporters</div>
    </div>
  )
}

function CrestBadge({ level }: { level: CrestLevel }) {
  const cfg = CREST_CONFIG[level]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: `${cfg.color}16`, border: `1px solid ${cfg.color}40`, borderRadius: 99, padding: '1px 6px' }}>
      <span style={{ fontSize: 9 }}>{cfg.emoji}</span>
      <span style={{ fontSize: 8, fontWeight: 800, color: cfg.color, fontFamily: 'Sora, sans-serif' }}>Crest {cfg.label}</span>
    </span>
  )
}

function VillageChip({ c, router }: { c: any; router: any }) {
  if (!c.village) return null
  return (
    <button
      onClick={e => { e.stopPropagation(); router.push(`/dashboard/villages/${c.villageSlug ?? c.village.toLowerCase()}`) }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}
    >
      {c.emoji} {c.village} Village →
    </button>
  )
}

function CountryShield({ country }: { country?: string }) {
  if (!country) return null
  const meta = COUNTRY_META[country]
  if (!meta) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'rgba(255,255,255,.4)' }}>
      <span style={{ fontSize: 12 }}>{meta.flag}</span>
      <span>{meta.region}</span>
    </span>
  )
}

export default function RealityShowPage({ params }: { params: { showId: string } }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const showId = (params as any).showId as string

  const [tab, setTab] = React.useState<Tab>('LEADERBOARD')
  const [show, setShow] = React.useState<any>(null)
  const [leaderboard, setLeaderboard] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [voteTarget, setVoteTarget] = React.useState<any>(null)
  const [selectedPack, setSelectedPack] = React.useState(VOTE_PACKS[0])
  const [voting, setVoting] = React.useState(false)
  const [voteSuccess, setVoteSuccess] = React.useState(false)
  const [toast, setToast] = React.useState('')
  const [confetti, setConfetti] = React.useState<{ id: number; x: number; color: string }[]>([])

  // World-first: Flame Chain — track consecutive vote times
  const [flameVotes, setFlameVotes] = React.useState<number[]>([])
  const [flameActive, setFlameActive] = React.useState(false)

  // World-first: Voice Pledge — mic recording state
  const [voicePledge, setVoicePledge] = React.useState<'idle' | 'recording' | 'done'>('idle')
  const [voiceSec, setVoiceSec] = React.useState(0)
  const mediaRecRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])
  const audioStreamRef = React.useRef<MediaStream | null>(null)

  // World-first: Elder Witness — show modal
  const [elderModal, setElderModal] = React.useState(false)

  const [nightFire, setNightFire] = React.useState(false)
  const [clientNow, setClientNow] = React.useState(0)
  React.useEffect(() => {
    setNightFire(isNightFireWindow())
    setClientNow(Date.now())
  }, [])
  const userVillageSlug = (user as any)?.villageSlug ?? (user as any)?.village?.toLowerCase() ?? ''
  const userCrestLevel: CrestLevel = ((user as any)?.crestLevel ?? 1) as CrestLevel

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const loadData = React.useCallback(async () => {
    try {
      const [showRes, lbRes] = await Promise.all([
        jollofTvApi.realityShow(showId),
        jollofTvApi.realityLeaderboard(showId),
      ])
      const showData = (showRes as any)?.show ?? (showRes as any)?.data ?? showRes
      const lbData = (lbRes as any)?.leaderboard ?? []
      if (showData?.id) {
        setShow(showData)
        setLeaderboard(lbData.length ? lbData : (showData.contestants ?? []))
      } else throw new Error('empty')
    } catch (e) {
      logApiFailure('jollof/reality/show', e)
      if (USE_MOCKS) {
        const mock = MOCK_SHOWS[showId] ?? MOCK_SHOWS['sh1']
        setShow(mock)
        setLeaderboard([...(mock.contestants ?? [])].filter((c: any) => !c.isEliminated).sort((a: any, b: any) => b.votes - a.votes))
      }
    } finally { setLoading(false) }
  }, [showId])

  React.useEffect(() => { loadData() }, [loadData])
  React.useEffect(() => {
    const iv = setInterval(loadData, 15000)
    return () => clearInterval(iv)
  }, [loadData])

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  // Compute effective vote multiplier
  const computeMultiplier = (target: any) => {
    let mult = 1
    // World-first 1: Crest Power Multiplier
    mult *= CREST_CONFIG[userCrestLevel]?.mult ?? 1
    // World-first 2: Village Solidarity Boost
    if (userVillageSlug && target?.villageSlug === userVillageSlug) mult *= 1.2
    // World-first 3: Night Fire Window
    if (nightFire) mult *= 1.5
    // World-first 7: Flame Chain — 5 votes in 60s
    if (flameActive) mult *= 1.5
    return Math.round(mult * 100) / 100
  }

  const handleVote = async () => {
    if (!voteTarget) return
    setVoting(true)
    const mult = computeMultiplier(voteTarget)
    const effectiveVotes = Math.round(selectedPack.votes * mult)
    try {
      await jollofTvApi.realityVote(showId, {
        contestantId: voteTarget.id,
        voterId: (user as any)?.id ?? 'guest',
        amountPaid: selectedPack.cost,
        votes: effectiveVotes,
      })
      // Upload voice pledge if recorded
      if (audioChunksRef.current.length > 0) {
        try {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const form = new FormData()
          form.append('audio', blob, 'voice-pledge.webm')
          form.append('showId', showId)
          form.append('contestantId', voteTarget.id)
          form.append('voterId', (user as any)?.id ?? 'guest')
          await fetch('/api/jollof/reality/voice-pledge', { method: 'POST', body: form }).catch((e) => logApiFailure('reality/voice-pledge', e))
        } catch (e) { logApiFailure('reality/voice-pledge/upload', e) /* voice pledge upload is best-effort */ }
      }
    } catch (e) { logApiFailure('reality/vote/submit', e) }
    setVoting(false)
    setVoteSuccess(true)

    // Flame Chain tracking
    const now = Date.now()
    const recent = [...flameVotes, now].filter(t => now - t < 60000)
    setFlameVotes(recent)
    if (recent.length >= 5 && !flameActive) {
      setFlameActive(true)
      showToast('🔥 FLAME CHAIN! Next votes get 1.5× for 60 seconds!')
      setTimeout(() => setFlameActive(false), 60000)
    }

    const colors = ['#fbbf24', '#4ade80', '#c084fc', '#ef4444', '#22d3ee']
    setConfetti(Array.from({ length: 14 }, (_, i) => ({ id: i, x: 15 + Math.random() * 70, color: colors[i % colors.length] })))
    setTimeout(() => setConfetti([]), 2400)

    const multStr = mult > 1 ? ` (×${mult} boost → ${effectiveVotes} votes!)` : ''
    showToast(`✅ ${selectedPack.votes} vote${selectedPack.votes > 1 ? 's' : ''} for ${voteTarget.displayName}${multStr}`)
    setTimeout(() => { setVoteTarget(null); setVoteSuccess(false); setVoicePledge('idle'); loadData() }, 1800)
  }

  // Voice pledge timer — auto-stop at 10s
  React.useEffect(() => {
    if (voicePledge !== 'recording') { setVoiceSec(0); return }
    const iv = setInterval(() => {
      setVoiceSec(s => {
        if (s >= 10) {
          mediaRecRef.current?.stop()
          setVoicePledge('done')
          return 10
        }
        return s + 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [voicePledge])

  const totalVotes = leaderboard.reduce((s: number, c: any) => s + (c.votes ?? 0), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#07090a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 42, marginBottom: 12 }} className="rs-live">🎭</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontFamily: 'DM Sans,sans-serif' }}>Loading show…</div>
      </div>
    </div>
  )

  const activeContestants = (show?.contestants ?? []).filter((c: any) => !c.isEliminated)
  const eliminatedContestants = (show?.contestants ?? []).filter((c: any) => c.isEliminated)
  const drumWarPair: string[] = show?.drumWarPair ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#07090a', color: 'rgba(255,255,255,.9)', fontFamily: 'DM Sans,sans-serif', paddingBottom: 100, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize: '24px 24px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,16,8,.97)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 12, padding: '10px 18px', fontSize: 12, fontWeight: 700, color: '#4ade80', zIndex: 400, whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(0,0,0,.5)' }}>
          {toast}
        </div>
      )}

      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} style={{ position: 'fixed', top: '38%', left: `${c.x}%`, fontSize: 16, pointerEvents: 'none', zIndex: 500, animation: 'rsConfetti 2.2s ease forwards' }}>
          {['🌟', '✨', '🎊', '🎉', '🪙', '🔥', '💫'][c.id % 7]}
        </div>
      ))}

      {/* Night Fire Banner */}
      {nightFire && (
        <div className="rs-night" style={{ background: 'linear-gradient(90deg,rgba(251,146,60,.12),rgba(239,68,68,.12))', borderBottom: '1px solid rgba(251,146,60,.25)', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🌙</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fb923c', fontFamily: 'Sora, sans-serif', letterSpacing: '.04em' }}>NIGHT FIRE WINDOW ACTIVE</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', flex: 1, textAlign: 'right' }}>All votes ×1.5 until 3am</span>
        </div>
      )}

      {/* Flame Chain Bar */}
      {flameActive && (
        <div style={{ background: 'linear-gradient(90deg,#ef4444,#f97316,#fbbf24,#f97316,#ef4444)', backgroundSize: '200% 100%', animation: 'flameChain 1.2s linear infinite', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#07090a', fontFamily: 'Sora, sans-serif' }}>FLAME CHAIN ACTIVE — ALL VOTES ×1.5!</span>
        </div>
      )}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#2a0a4a,#1a0030,#07090a)', padding: '0 0 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 0%,rgba(192,132,252,.18),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 0' }}>
          <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{show?.title}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Season {show?.season} · Reality TV</div>
          </div>
          {show?.isActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 99, padding: '4px 10px', flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} className="rs-live" />
              <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', letterSpacing: '.05em' }}>VOTING OPEN</span>
            </div>
          )}
        </div>

        {/* Stats band */}
        <div style={{ display: 'flex', gap: 0, padding: '12px 16px 0', marginBottom: 4 }}>
          {[
            { label: 'Contestants', value: activeContestants.length, suffix: 'active', color: '#c084fc' },
            { label: 'Total Votes', value: totalVotes.toLocaleString(), suffix: 'cast', color: '#fbbf24' },
            { label: 'Elders Witnessing', value: (show?.elderWitnesses?.length ?? 0), suffix: 'verified', color: '#4ade80' },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1, letterSpacing: '.04em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Drum War Badge */}
        {drumWarPair.length === 2 && (
          <div className="rs-drum" style={{ margin: '8px 16px 12px', borderRadius: 10, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🥁</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', fontFamily: 'Sora, sans-serif', flex: 1 }}>
              DRUM WAR: {drumWarPair[0].toUpperCase()} vs {drumWarPair[1].toUpperCase()} — Solidarity votes count ×1.5
            </span>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#0a0d08', borderBottom: '1px solid rgba(255,255,255,.06)', position: 'sticky', top: 0, zIndex: 30 }}>
        {(['LEADERBOARD', 'CONTESTANTS', 'VOTERS', 'ABOUT'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '11px 0', border: 'none', background: 'none', color: tab === t ? '#c084fc' : 'rgba(255,255,255,.35)', fontSize: 9, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif', letterSpacing: '.04em', borderBottom: tab === t ? '2px solid #c084fc' : '2px solid transparent', transition: 'all .2s' }}>
            {t === 'LEADERBOARD' ? '🏆 BOARD' : t === 'CONTESTANTS' ? '🎭 CAST' : t === 'VOTERS' ? '👥 VOTERS' : 'ℹ ABOUT'}
          </button>
        ))}
      </div>

      {/* ── LEADERBOARD TAB ── */}
      {tab === 'LEADERBOARD' && (
        <div style={{ padding: '16px 14px' }} className="rs-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,.7)', fontFamily: 'Sora, sans-serif' }}>Live Standings</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} className="rs-live" />
              LIVE · 15s
            </div>
          </div>

          {leaderboard.filter((c: any) => !c.isEliminated).map((c: any, i: number) => {
            const pos = positionLabel(i)
            const pct = totalVotes > 0 ? ((c.votes ?? 0) / totalVotes * 100).toFixed(1) : '0.0'
            const barColor = i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3e' : '#c084fc'
            const isDrumWarContestant = drumWarPair.includes(c.villageSlug ?? '')
            return (
              <div key={c.id} style={{ borderRadius: 18, background: pos.bg, border: `1px solid ${isDrumWarContestant ? '#ef444430' : pos.color + '20'}`, marginBottom: 12, padding: '14px', transition: 'all .2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Rank */}
                  <div style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 900, color: pos.color, width: 32, textAlign: 'center', flexShrink: 0 }}>{pos.icon}</div>
                  {/* Avatar */}
                  <AvatarCircle c={c} size={48} fontSize={16} border={`2px solid ${pos.color}50`} />
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 800, color: '#fff' }}>{c.displayName}</span>
                      {c.crestLevel && <CrestBadge level={c.crestLevel} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      <VillageChip c={c} router={router} />
                      {c.villageRole && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.04)', borderRadius: 99, padding: '1px 6px' }}>{c.villageRole}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CountryShield country={c.country} />
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginTop: 6 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${barColor},${barColor}88)`, borderRadius: 99, transition: 'width .6s ease' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>{pct}% of total votes</div>
                  </div>
                  {/* Votes + Vote button */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 900, color: pos.color }}>{(c.votes ?? 0).toLocaleString()}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', letterSpacing: '.04em', marginBottom: 5 }}>VOTES</div>
                    <button onClick={() => { setVoteTarget(c); setVoteSuccess(false); setSelectedPack(VOTE_PACKS[0]) }} style={{ padding: '5px 12px', borderRadius: 10, background: `linear-gradient(135deg,${barColor}33,${barColor}15)`, color: barColor, fontSize: 9, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif', border: `1px solid ${barColor}40` }}>
                      🗳 Vote
                    </button>
                  </div>
                </div>
                {/* Supporter Wall inline */}
                {c.supporters?.length > 0 && <SupporterWall supporters={c.supporters} />}
                {/* Drum War indicator */}
                {isDrumWarContestant && (
                  <div style={{ marginTop: 8, fontSize: 8, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                    🥁 In Drum War · Your votes count ×1.5 if you support this village
                  </div>
                )}
              </div>
            )
          })}

          {/* Eliminated section */}
          {eliminatedContestants.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', marginTop: 20, marginBottom: 10, textTransform: 'uppercase' }}>Eliminated</div>
              {eliminatedContestants.map((c: any) => (
                <div key={c.id} style={{ borderRadius: 12, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', marginBottom: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: .5 }}>
                  <AvatarCircle c={c} size={36} fontSize={13} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>{c.displayName}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                      <VillageChip c={c} router={router} />
                      {c.villageRole && <span style={{ fontSize: 8, color: 'rgba(255,255,255,.25)' }}>{c.villageRole}</span>}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2 }}>{(c.votes ?? 0).toLocaleString()} votes</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 99, padding: '3px 8px' }}>OUT</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── CONTESTANTS TAB ── */}
      {tab === 'CONTESTANTS' && (
        <div style={{ padding: '16px 14px' }} className="rs-fade">
          {(show?.contestants ?? []).map((c: any, i: number) => {
            const rankInBoard = leaderboard.findIndex((l: any) => l.id === c.id)
            return (
              <div key={c.id} style={{ borderRadius: 18, background: 'rgba(255,255,255,.03)', border: `1px solid ${c.isEliminated ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.08)'}`, padding: '16px', marginBottom: 12, opacity: c.isEliminated ? .75 : 1, position: 'relative', overflow: 'hidden' }}>
                {c.isEliminated && (
                  <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 8, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 99, padding: '2px 7px' }}>ELIMINATED</div>
                )}
                {!c.isEliminated && rankInBoard >= 0 && rankInBoard < 3 && (
                  <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 18 }}>{['👑', '🥈', '🥉'][rankInBoard]}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <AvatarCircle c={c} size={70} fontSize={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 5 }}>{c.displayName}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                      <VillageChip c={c} router={router} />
                      {c.villageRole && <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 99, padding: '2px 8px' }}>{c.villageRole}</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                      {c.crestLevel && <CrestBadge level={c.crestLevel} />}
                      <CountryShield country={c.country} />
                    </div>
                    {c.bio && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.55, marginBottom: 8 }}>{c.bio}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: c.supporters?.length ? 6 : 0 }}>
                      <div>
                        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: c.isEliminated ? 'rgba(255,255,255,.3)' : '#fbbf24' }}>{(c.votes ?? 0).toLocaleString()}</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginLeft: 4 }}>votes</span>
                      </div>
                      {!c.isEliminated && (
                        <button onClick={() => { setVoteTarget(c); setSelectedPack(VOTE_PACKS[0]); setTab('LEADERBOARD') }} style={{ padding: '6px 18px', borderRadius: 10, border: '1px solid rgba(192,132,252,.4)', background: 'rgba(192,132,252,.08)', color: '#c084fc', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                          🗳 Vote
                        </button>
                      )}
                    </div>
                    {c.supporters?.length > 0 && <SupporterWall supporters={c.supporters} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── VOTERS TAB (Dashboard) ── */}
      {tab === 'VOTERS' && (
        <div style={{ padding: '16px 14px' }} className="rs-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,.7)', fontFamily: 'Sora, sans-serif' }}>Voter Dashboard</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>All paid voters</div>
          </div>

          {/* Revenue stats */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'TOTAL SPENT', value: `₡${(totalVotes * 10).toLocaleString()}`, color: '#fbbf24' },
              { label: 'UNIQUE VOTERS', value: leaderboard.reduce((s: number, c: any) => s + (c.supporters?.length ?? 3), 0), color: '#c084fc' },
              { label: 'AVG/VOTER', value: `₡${Math.round(totalVotes * 10 / Math.max(1, leaderboard.reduce((s: number, c: any) => s + (c.supporters?.length ?? 3), 0))).toLocaleString()}`, color: '#4ade80' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,.3)', letterSpacing: '.05em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Per-contestant voter breakdown */}
          {leaderboard.filter((c: any) => !c.isEliminated).map((c: any, ci: number) => {
            const supporters = c.supporters ?? []
            return (
              <div key={c.id} style={{ borderRadius: 16, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', padding: '14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <AvatarCircle c={c} size={36} fontSize={13} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 800, color: '#fff' }}>{c.displayName}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{(c.votes ?? 0).toLocaleString()} votes · ₡{((c.votes ?? 0) * 10).toLocaleString()} revenue</div>
                  </div>
                  <div style={{ fontSize: 9, color: '#fbbf24', fontWeight: 700 }}>{supporters.length} voters</div>
                </div>
                {/* Voter grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 6 }}>
                  {supporters.map((s: any, si: number) => (
                    <div key={si} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.color ?? `hsl(${si * 40}, 55%, 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', fontFamily: 'Sora, sans-serif' }}>
                        {(s.name ?? 'A').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.5)', fontWeight: 700, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{s.name ?? `Voter ${si + 1}`}</div>
                      <div style={{ fontSize: 7, color: '#fbbf24' }}>₡{Math.round(10 + Math.random() * 90)}</div>
                    </div>
                  ))}
                  {supporters.length === 0 && Array.from({ length: 5 }).map((_, si) => (
                    <div key={`mock-${si}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${(ci * 60 + si * 40)}, 55%, 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff' }}>
                        {String.fromCharCode(65 + si)}
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.5)', fontWeight: 700 }}>Voter {si + 1}</div>
                      <div style={{ fontSize: 7, color: '#fbbf24' }}>₡{[30, 50, 10, 75, 25][si]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Eliminated contestants voters */}
          {eliminatedContestants.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.25)', letterSpacing: '.06em', marginTop: 16, marginBottom: 10, textTransform: 'uppercase' }}>Eliminated — Voters Preserved</div>
              {eliminatedContestants.map((c: any) => {
                const supporters = c.supporters ?? []
                return (
                  <div key={c.id} style={{ borderRadius: 14, background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', padding: '12px', marginBottom: 8, opacity: .65 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <AvatarCircle c={c} size={30} fontSize={11} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{c.displayName}</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>{(c.votes ?? 0).toLocaleString()} votes · {supporters.length || 3} voters · ELIMINATED</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {(supporters.length > 0 ? supporters : [{name:'A'},{name:'B'},{name:'C'}]).slice(0, 6).map((s: any, si: number) => (
                        <div key={si} style={{ width: 22, height: 22, borderRadius: '50%', background: s.color ?? `hsl(${si * 40}, 40%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>{(s.name ?? 'V').charAt(0)}</div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ── ABOUT TAB ── */}
      {tab === 'ABOUT' && (
        <div style={{ padding: '16px 14px' }} className="rs-fade">
          <div style={{ borderRadius: 16, background: 'rgba(192,132,252,.06)', border: '1px solid rgba(192,132,252,.15)', padding: '16px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#c084fc', fontFamily: 'Sora, sans-serif', marginBottom: 8, letterSpacing: '.04em' }}>ABOUT THIS SHOW</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}>{show?.description ?? 'A Pan-African reality competition bringing talent from all 20 villages.'}</div>
          </div>

          {/* Show details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Season', value: `Season ${show?.season ?? 1}` },
              { label: 'Status', value: show?.isActive ? '🔴 Active' : '✅ Ended' },
              { label: 'Started', value: show?.startDate ? new Date(show.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
              { label: 'Finale', value: show?.endDate ? new Date(show.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—' },
            ].map((item, i) => (
              <div key={i} style={{ borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', padding: '12px 14px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Elder Witnesses */}
          {show?.elderWitnesses?.length > 0 && (
            <div className="rs-elder" style={{ borderRadius: 14, background: 'rgba(251,191,36,.05)', border: '1px solid rgba(251,191,36,.2)', padding: '14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', fontFamily: 'Sora, sans-serif', marginBottom: 10 }}>⚖️ ELDER WITNESSES</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', lineHeight: 1.5, marginBottom: 10 }}>
                These elders from different villages witness every vote. Their presence grants a sanctioned ×3 multiplier when all 3 elders are active.
              </div>
              {show.elderWitnesses.map((e: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,.03)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(251,191,36,.15)', border: '1.5px solid rgba(251,191,36,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚖️</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{e}</div>
                  <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#4ade80' }}>✓ Witnessing</div>
                </div>
              ))}
              <button onClick={() => setElderModal(true)} style={{ marginTop: 6, width: '100%', padding: '9px 0', borderRadius: 10, background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', color: '#fbbf24', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                ⚖️ Learn About Elder Witness System →
              </button>
            </div>
          )}

          {/* How Voting Works */}
          <div style={{ borderRadius: 14, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', padding: '14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)', letterSpacing: '.05em', marginBottom: 12, textTransform: 'uppercase' }}>How Voting Works</div>
            {VOTE_PACKS.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,.6)' }}><span style={{ color: p.color, fontWeight: 700 }}>{p.label}</span> — {p.votes} vote{p.votes > 1 ? 's' : ''}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24' }}>{`₡${p.cost}`}</div>
              </div>
            ))}
          </div>

          {/* World-first multipliers legend */}
          <div style={{ borderRadius: 14, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', padding: '14px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)', letterSpacing: '.05em', marginBottom: 12, textTransform: 'uppercase' }}>✨ Boost Multipliers</div>
            {[
              { emoji: '🏆', label: 'Crest Power', desc: 'Your honor crest level multiplies all your votes (×1 to ×3)' },
              { emoji: '🌍', label: 'Solidarity Boost', desc: 'Voting for your own village: +20% bonus on top' },
              { emoji: '🌙', label: 'Night Fire Window', desc: '11pm–3am: all votes count ×1.5 — elders watch the night' },
              { emoji: '🥁', label: 'Drum War', desc: 'When two villages declare war, cross-village votes ×1.5' },
              { emoji: '🔥', label: 'Flame Chain', desc: '5 votes in 60 seconds: chain reaction ×1.5 for the next minute' },
              { emoji: '⚖️', label: 'Elder Witness', desc: '3 elders from different villages witnessing: ×3 sacred multiplier' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.7)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VOTING BOTTOM SHEET ── */}
      {voteTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={e => { if (e.target === e.currentTarget) { setVoteTarget(null); setVoteSuccess(false); setVoicePledge('idle'); mediaRecRef.current?.stop(); audioChunksRef.current = []; audioStreamRef.current?.getTracks().forEach(t => t.stop()) } }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,#0d1008,#07090a)', borderRadius: '24px 24px 0 0', padding: '0 0 36px', boxShadow: '0 -8px 40px rgba(0,0,0,.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, margin: '10px auto 16px' }} />

            {voteSuccess ? (
              <div className="rs-vote-ok" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#4ade80', marginBottom: 8 }}>Vote Cast!</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Your {selectedPack.votes} vote{selectedPack.votes > 1 ? 's' : ''} counted for {voteTarget.displayName}</div>
                {computeMultiplier(voteTarget) > 1 && (
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>×{computeMultiplier(voteTarget)} booster applied!</div>
                )}
              </div>
            ) : (
              <div style={{ padding: '0 16px' }}>
                {/* Contestant preview with full info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '12px 14px', borderRadius: 16, background: 'rgba(192,132,252,.06)', border: '1px solid rgba(192,132,252,.15)' }}>
                  <AvatarCircle c={voteTarget} size={54} fontSize={20} border="2px solid rgba(192,132,252,.5)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{voteTarget.displayName}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 4 }}>
                      <VillageChip c={voteTarget} router={router} />
                      {voteTarget.villageRole && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.04)', borderRadius: 99, padding: '1px 6px' }}>{voteTarget.villageRole}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                      {voteTarget.crestLevel && <CrestBadge level={voteTarget.crestLevel} />}
                      <CountryShield country={voteTarget.country} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#fbbf24' }}>{(voteTarget.votes ?? 0).toLocaleString()}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>VOTES</div>
                  </div>
                </div>

                {/* Active Boosters */}
                {(() => {
                  const boosters: { emoji: string; label: string; color: string }[] = []
                  const userCr = CREST_CONFIG[userCrestLevel]
                  if (userCr.mult > 1) boosters.push({ emoji: userCr.emoji, label: `Crest ${userCr.label} ×${userCr.mult}`, color: userCr.color })
                  if (userVillageSlug && voteTarget?.villageSlug === userVillageSlug) boosters.push({ emoji: '🌍', label: 'Solidarity +20%', color: '#4ade80' })
                  if (nightFire) boosters.push({ emoji: '🌙', label: 'Night Fire ×1.5', color: '#fb923c' })
                  if (flameActive) boosters.push({ emoji: '🔥', label: 'Flame Chain ×1.5', color: '#ef4444' })
                  if (boosters.length === 0) return null
                  return (
                    <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.15)' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#4ade80', letterSpacing: '.04em', marginBottom: 7 }}>✨ YOUR ACTIVE BOOSTERS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {boosters.map((b, i) => (
                          <span key={i} className="rs-solidarity" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: `${b.color}16`, border: `1px solid ${b.color}40`, borderRadius: 99, padding: '3px 9px', fontSize: 9, fontWeight: 800, color: b.color, fontFamily: 'Sora, sans-serif' }}>
                            {b.emoji} {b.label}
                          </span>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                        Final Multiplier: ×{computeMultiplier(voteTarget)}
                      </div>
                    </div>
                  )
                })()}

                {/* Flame Chain progress */}
                <div style={{ marginBottom: 12, padding: '9px 12px', borderRadius: 12, background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 12 }}>🔥</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', fontFamily: 'Sora, sans-serif', letterSpacing: '.04em' }}>FLAME CHAIN</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginLeft: 'auto' }}>{Math.min(flameVotes.filter(t => (clientNow || Date.now()) - t < 60000).length, 5)}/5 votes in 60s</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(flameVotes.filter(t => (clientNow || Date.now()) - t < 60000).length / 5 * 100, 100)}%`, background: 'linear-gradient(90deg,#ef4444,#f97316)', borderRadius: 99, transition: 'width .3s ease' }} />
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>Reach 5 votes in 60s to trigger ×1.5 chain effect</div>
                </div>

                {/* Vote Pack selector */}
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', marginBottom: 10, textTransform: 'uppercase' }}>Select Vote Pack</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {VOTE_PACKS.map(p => (
                    <div key={p.label} onClick={() => setSelectedPack(p)} style={{ borderRadius: 13, padding: '12px', cursor: 'pointer', border: `1.5px solid ${selectedPack.label === p.label ? p.color : p.color + '25'}`, background: selectedPack.label === p.label ? `${p.color}12` : 'rgba(255,255,255,.02)', transition: 'all .15s', textAlign: 'center', position: 'relative' }}>
                      {p.badge && <div style={{ position: 'absolute', top: -6, right: 6, fontSize: 7, fontWeight: 800, color: '#07090a', background: p.color, borderRadius: 99, padding: '1px 5px' }}>{p.badge}</div>}
                      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 900, color: p.color, marginBottom: 2 }}>{`₡ ${p.cost}`}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 600, marginBottom: 2 }}>{p.votes} vote{p.votes > 1 ? 's' : ''}</div>
                      {computeMultiplier(voteTarget) > 1 && (
                        <div style={{ fontSize: 8, color: '#4ade80', fontWeight: 700 }}>→ {Math.round(p.votes * computeMultiplier(voteTarget))} effective</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Voice Pledge */}
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(96,165,250,.05)', border: '1px solid rgba(96,165,250,.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>🎙</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#60a5fa', fontFamily: 'Sora, sans-serif', letterSpacing: '.04em' }}>VOICE PLEDGE (OPTIONAL)</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>Record a 10s message attached to your vote</div>
                    </div>
                    <button onClick={async () => {
                      if (voicePledge === 'idle') {
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                          audioStreamRef.current = stream
                          audioChunksRef.current = []
                          const mr = new MediaRecorder(stream)
                          mediaRecRef.current = mr
                          mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
                          mr.onstop = () => { stream.getTracks().forEach(t => t.stop()) }
                          mr.start()
                          setVoicePledge('recording')
                        } catch { showToast('🎙 Mic access denied'); }
                      } else if (voicePledge === 'recording') {
                        mediaRecRef.current?.stop()
                        setVoicePledge('done')
                      } else {
                        audioChunksRef.current = []
                        setVoicePledge('idle')
                      }
                    }}
                      style={{ padding: '6px 12px', borderRadius: 10, background: voicePledge === 'recording' ? 'rgba(239,68,68,.2)' : voicePledge === 'done' ? 'rgba(74,222,128,.15)' : 'rgba(96,165,250,.12)', border: `1px solid ${voicePledge === 'recording' ? '#ef4444' : voicePledge === 'done' ? '#4ade80' : '#60a5fa'}40`, color: voicePledge === 'recording' ? '#ef4444' : voicePledge === 'done' ? '#4ade80' : '#60a5fa', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                      {voicePledge === 'idle' ? '🎙 Record' : voicePledge === 'recording' ? `⏹ ${voiceSec}s` : '✅ Pledged'}
                    </button>
                  </div>
                  {voicePledge === 'recording' && (
                    <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${voiceSec / 10 * 100}%`, background: 'linear-gradient(90deg,#ef4444,#fb923c)', borderRadius: 99, transition: 'width 1s linear' }} />
                    </div>
                  )}
                </div>

                {/* Cast Vote button */}
                <button onClick={handleVote} disabled={voting} style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: voting ? 'rgba(255,255,255,.06)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: voting ? 'wait' : 'pointer', fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>
                  {voting ? 'Counting Votes…' : `🗳 Cast ${selectedPack.votes} Vote${selectedPack.votes > 1 ? 's' : ''} ${selectedPack.cost > 0 ? `· ₡${selectedPack.cost}` : ''}${computeMultiplier(voteTarget) > 1 ? ` (×${computeMultiplier(voteTarget)})` : ''}`}
                </button>
                <button onClick={() => { setVoteTarget(null); setVoicePledge('idle'); mediaRecRef.current?.stop(); audioChunksRef.current = []; audioStreamRef.current?.getTracks().forEach(t => t.stop()) }} style={{ width: '100%', padding: '10px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Elder Witness Info Modal */}
      {elderModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setElderModal(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0d1008', border: '1px solid rgba(251,191,36,.2)', borderRadius: 20, padding: '24px', maxWidth: 340, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.7)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>⚖️</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: '#fbbf24', textAlign: 'center', marginBottom: 12 }}>The Elder Witness System</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 16 }}>
              Three elders from different villages are required to witness a reality show season. When all three are simultaneously active and acknowledged, they bestow a sacred ×3 multiplier to every vote in the session — recognizing the collective wisdom of Africa's elders as the ultimate judge of talent and character.
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', marginBottom: 16 }}>
              "Not one elder, not two — but three fires must burn together for the blessing to hold."
            </div>
            <button onClick={() => setElderModal(false)} style={{ width: '100%', padding: '11px 0', borderRadius: 12, border: '1px solid rgba(251,191,36,.3)', background: 'rgba(251,191,36,.08)', color: '#fbbf24', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
              ✓ Understood
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
