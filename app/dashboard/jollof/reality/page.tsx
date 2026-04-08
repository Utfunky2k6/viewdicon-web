'use client'
// ═══════════════════════════════════════════════════════════════════
// MASQUERADE STAGE — Reality TV Hub
// Pan-African Reality TV: Create, Vote, Compete
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const CSS_ID = 'masquerade-stage-css'
const CSS = `
@keyframes msFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes msVotingPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.75;transform:scale(.97)} }
@keyframes msSkeletonPulse { 0%,100%{opacity:.35} 50%{opacity:.6} }
@keyframes msDotBlink { 0%,100%{opacity:1} 50%{opacity:.2} }
@keyframes msGradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes msSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes msVoteOk { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2);opacity:1} 100%{transform:scale(1)} }
.ms-fade { animation: msFadeIn .4s ease both }
.ms-voting-badge { animation: msVotingPulse 1.8s ease-in-out infinite }
.ms-skeleton { animation: msSkeletonPulse 1.5s ease-in-out infinite; background: rgba(255,255,255,.06); border-radius: 10px }
.ms-dot { animation: msDotBlink .9s ease-in-out infinite }
.ms-sheet { animation: msSheetUp .3s cubic-bezier(.16,1,.3,1) both }
.ms-vote-ok { animation: msVoteOk .5s cubic-bezier(.26,1.8,.58,1) both }
`

// ── Show Categories ─────────────────────────────────────────────
const SHOW_CATEGORIES = [
  { key: 'all',        label: 'All Shows',        emoji: '🎭' },
  { key: 'talent',     label: 'Village Idol',      emoji: '🎤' },
  { key: 'fashion',    label: 'Asọ Ẹbì',          emoji: '👗' },
  { key: 'acting',     label: 'Nollywood Star',    emoji: '🎬' },
  { key: 'cooking',    label: 'Jollof Wars',       emoji: '🍲' },
  { key: 'dance',      label: 'Azonto Dance',      emoji: '💃' },
  { key: 'business',   label: "Mogul\u2019s Table", emoji: '💼' },
  { key: 'building',   label: 'Master Builder',    emoji: '🏗' },
  { key: 'agriculture',label: 'Harvest Heroes',    emoji: '🌾' },
  { key: 'arts',       label: 'Adinkra Arts',      emoji: '🎨' },
  { key: 'warrior',    label: 'Warrior Games',     emoji: '⚔️' },
]

// ── Time Slot Pricing ────────────────────────────────────────────
const TIME_SLOTS = [
  { days: 7,   price: 500,  label: '1 Week',    popular: false },
  { days: 14,  price: 900,  label: '2 Weeks',   popular: false },
  { days: 30,  price: 1500, label: '1 Month',   popular: true },
  { days: 60,  price: 2500, label: '2 Months',  popular: false },
  { days: 100, price: 4000, label: '100 Days',  popular: false },
]

interface Contestant {
  id: string; displayName: string; votes: number; isEliminated: boolean
  photoUrl?: string | null; village?: string; villageRole?: string; country?: string; bio?: string
}
interface Show {
  id: string; title: string; category: string; season: number; isActive: boolean
  startDate: string; endDate: string; contestants: Contestant[]; description?: string
  pricePerVote: number; durationDays: number; creatorId: string
  totalRevenue?: number; totalVotes?: number
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  talent:      'linear-gradient(135deg,#3b0764,#7c3aed,#c084fc)',
  fashion:     'linear-gradient(135deg,#831843,#be185d,#f472b6)',
  acting:      'linear-gradient(135deg,#450a0a,#991b1b,#ef4444)',
  cooking:     'linear-gradient(135deg,#713f12,#a16207,#fbbf24)',
  dance:       'linear-gradient(135deg,#064e3b,#065f46,#34d399)',
  business:    'linear-gradient(135deg,#1e3a5f,#1d4ed8,#60a5fa)',
  building:    'linear-gradient(135deg,#44403c,#78716c,#a8a29e)',
  agriculture: 'linear-gradient(135deg,#14532d,#166534,#4ade80)',
  arts:        'linear-gradient(135deg,#4c1d95,#6d28d9,#a78bfa)',
  warrior:     'linear-gradient(135deg,#7f1d1d,#b91c1c,#f87171)',
}

// ── Mock Shows (enriched with categories + pricing) ──────────────
const MOCK_SHOWS: Show[] = [
  {
    id: 'sh1', title: 'Village Idol — Season 4', category: 'talent', season: 4, isActive: true,
    startDate: '2026-03-01', endDate: '2026-05-31', creatorId: 'tv_admin',
    description: 'The biggest Pan-African talent competition. Voices from all 20 villages vie for the crown.',
    pricePerVote: 10, durationDays: 90, totalRevenue: 245000, totalVotes: 46613,
    contestants: [
      { id: 'c1', displayName: 'Ada Okafor', votes: 12450, isEliminated: false, village: 'Commerce', villageRole: 'Chief Merchant', country: 'NG', bio: 'Multi-award trader from Onitsha Market.' },
      { id: 'c2', displayName: 'Kola Adeyemi', votes: 11203, isEliminated: false, village: 'Arts', villageRole: 'Master Griot', country: 'GH', bio: 'Sculptor fusing Adinkra symbols with contemporary art.' },
      { id: 'c3', displayName: 'Fatima Ibrahim', votes: 9876, isEliminated: false, village: 'Education', villageRole: 'Head Scholar', country: 'SN', bio: 'Youngest headmistress at Dakar Digital School.' },
      { id: 'c4', displayName: 'Emeka Obi', votes: 7654, isEliminated: false, village: 'Health', villageRole: 'Head Healer', country: 'NG', bio: 'Doctor and herbalist healing rural communities.' },
      { id: 'c5', displayName: 'Amina Diallo', votes: 5432, isEliminated: true, village: 'Fashion', villageRole: 'Style Elder', country: 'CI', bio: 'Paris-trained designer building circular fashion.' },
    ],
  },
  {
    id: 'sh2', title: 'Jollof Wars — The Continental Cook-Off', category: 'cooking', season: 1, isActive: true,
    startDate: '2026-03-15', endDate: '2026-04-15', creatorId: 'chef_admin',
    description: 'Who makes the best jollof? Nigeria, Ghana, Senegal — settle it once and for all. Chefs compete across 8 rounds.',
    pricePerVote: 25, durationDays: 30, totalRevenue: 180000, totalVotes: 7200,
    contestants: [
      { id: 'c6', displayName: 'Chef Ngozi Eze', votes: 8900, isEliminated: false, village: 'Commerce', villageRole: 'Master Chef', country: 'NG', bio: 'Lagos street-food queen turned restaurateur.' },
      { id: 'c7', displayName: 'Mamadou Sow', votes: 7800, isEliminated: false, village: 'Agriculture', villageRole: 'Harvest Elder', country: 'SN', bio: 'Thiéboudienne master from Saint-Louis.' },
      { id: 'c8', displayName: 'Akua Mensah', votes: 6500, isEliminated: false, village: 'Hospitality', villageRole: 'Inn Keeper', country: 'GH', bio: 'Cape Coast flavor alchemist.' },
    ],
  },
  {
    id: 'sh3', title: 'Asọ Ẹbì — Pan-African Fashion Wars', category: 'fashion', season: 2, isActive: true,
    startDate: '2026-02-14', endDate: '2026-04-14', creatorId: 'fashion_admin',
    description: 'Designers from 15 African nations create wearable art from local textiles. Who will be crowned the Continental Style Icon?',
    pricePerVote: 15, durationDays: 60, totalRevenue: 320000, totalVotes: 21333,
    contestants: [
      { id: 'c9', displayName: 'Zainab Bello', votes: 9200, isEliminated: false, village: 'Fashion', villageRole: 'Lead Designer', country: 'NG', bio: 'Adire textile innovator from Abeokuta.' },
      { id: 'c10', displayName: 'Nana Osei', votes: 7100, isEliminated: false, village: 'Arts', villageRole: 'Master Weaver', country: 'GH', bio: 'Kente revival artist and educator.' },
    ],
  },
  {
    id: 'sh4', title: "Mogul\u2019s Table — African Business Titans", category: 'business', season: 1, isActive: true,
    startDate: '2026-03-01', endDate: '2026-06-01', creatorId: 'biz_admin',
    description: 'Young African entrepreneurs pitch to a panel of continental investors. ₡1M Ògbó Pot for the winner.',
    pricePerVote: 50, durationDays: 90, totalRevenue: 890000, totalVotes: 17800,
    contestants: [
      { id: 'c11', displayName: 'Chidi Nwosu', votes: 6300, isEliminated: false, village: 'Technology', villageRole: 'Lead Engineer', country: 'NG', bio: 'AI startup founder bringing voice-tech to rural Africa.' },
      { id: 'c12', displayName: 'Sade Williams', votes: 5800, isEliminated: false, village: 'Media', villageRole: 'Head Broadcaster', country: 'ZA', bio: 'Pan-African media platform builder.' },
      { id: 'c13', displayName: 'Kofi Asante', votes: 4900, isEliminated: false, village: 'Finance', villageRole: 'Treasury Elder', country: 'GH', bio: 'Remittance fintech disrupting the corridor.' },
    ],
  },
  {
    id: 'sh5', title: 'Warrior Games — Season 3', category: 'warrior', season: 3, isActive: false,
    startDate: '2025-10-01', endDate: '2025-12-31', creatorId: 'sports_admin',
    description: 'Pan-African athletic gauntlet. Traditional sports, modern endurance, pure grit.',
    pricePerVote: 20, durationDays: 90, totalRevenue: 540000, totalVotes: 27000,
    contestants: [
      { id: 'c14', displayName: 'Kwame Asante', votes: 14200, isEliminated: false, village: 'Sports', villageRole: 'Village Champion', country: 'GH', bio: 'Former Black Stars midfielder.' },
      { id: 'c15', displayName: 'Imani Wanjiku', votes: 12800, isEliminated: false, village: 'Sports', villageRole: 'Track Elder', country: 'KE', bio: 'Marathon champion from the Rift Valley.' },
    ],
  },
  {
    id: 'sh6', title: 'Azonto Dance — Moves of the Continent', category: 'dance', season: 1, isActive: true,
    startDate: '2026-03-20', endDate: '2026-04-20', creatorId: 'dance_admin',
    description: 'Traditional meets contemporary. Dancers from 12 countries battle through Afrobeats, Amapiano, and traditional choreography.',
    pricePerVote: 10, durationDays: 30, totalRevenue: 95000, totalVotes: 9500,
    contestants: [
      { id: 'c16', displayName: 'Chiamaka Eze', votes: 4500, isEliminated: false, village: 'Arts', villageRole: 'Dance Elder', country: 'NG', bio: 'Afrobeats choreographer with 2M followers.' },
      { id: 'c17', displayName: 'Thandi Moyo', votes: 3800, isEliminated: false, village: 'Media', villageRole: 'Content Elder', country: 'ZA', bio: 'Amapiano dancer from Johannesburg.' },
    ],
  },
]

// ── Helpers ──────────────────────────────────────────────────────
function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  return `${Math.ceil(diff / 86400000)}d left`
}

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toLocaleString()
}

// ── Show Card ────────────────────────────────────────────────────
function ShowCard({ show, idx, onClick, onVote }: { show: Show; idx: number; onClick: () => void; onVote: () => void }) {
  const grad = CATEGORY_GRADIENTS[show.category] ?? 'linear-gradient(135deg,#3b0764,#7c3aed,#c084fc)'
  const catInfo = SHOW_CATEGORIES.find(c => c.key === show.category)
  const activeCount = show.contestants.filter(c => !c.isEliminated).length
  const totalVotes = show.contestants.reduce((s, c) => s + c.votes, 0)

  return (
    <div className="ms-fade" onClick={onClick} style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', background: '#0d1008', animationDelay: `${idx * 0.06}s` }}>
      <div style={{ height: 100, background: grad, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '10px 12px' }}>
        {show.isActive && (
          <div className="ms-voting-badge" style={{ position: 'absolute', top: 8, left: 10, fontSize: 8, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,.18)', borderRadius: 12, padding: '2px 8px', border: '1px solid rgba(74,222,128,.35)', letterSpacing: '.05em' }}>
            🗳 VOTING OPEN
          </div>
        )}
        {!show.isActive && (
          <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '2px 8px', border: '1px solid rgba(255,255,255,.15)' }}>
            COMPLETED
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 8, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,.15)', borderRadius: 12, padding: '2px 8px', border: '1px solid rgba(251,191,36,.25)' }}>
          ₡{show.pricePerVote}/vote
        </div>
        {/* Category emoji large */}
        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 32, opacity: .3 }}>{catInfo?.emoji ?? '🎭'}</div>
      </div>
      <div style={{ padding: '12px 12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <span style={{ fontSize: 10 }}>{catInfo?.emoji}</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{catInfo?.label}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'rgba(255,255,255,.9)', marginBottom: 5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {show.title}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>
          S{show.season} · {activeCount} contestants · {show.isActive ? daysLeft(show.endDate) : 'Completed'}
        </div>
        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 9, color: '#fbbf24', background: 'rgba(251,191,36,.08)', borderRadius: 99, padding: '2px 6px' }}>🗳 {formatNum(totalVotes)}</span>
          {show.totalRevenue && <span style={{ fontSize: 9, color: '#4ade80', background: 'rgba(74,222,128,.08)', borderRadius: 99, padding: '2px 6px' }}>₡{formatNum(show.totalRevenue)}</span>}
        </div>
        {/* Contestant previews */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          {show.contestants.filter(c => !c.isEliminated).slice(0, 4).map((c, i) => (
            <div key={c.id} style={{ width: 26, height: 26, borderRadius: '50%', background: `hsl(${(i * 60 + 20) % 360}, 55%, 45%)`, border: '2px solid #0d1008', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }}>
              {c.displayName.charAt(0)}
            </div>
          ))}
          {activeCount > 4 && <span style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', marginLeft: 4 }}>+{activeCount - 4}</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); show.isActive ? onVote() : onClick() }} style={{ width: '100%', padding: '8px 0', borderRadius: 10, background: show.isActive ? 'linear-gradient(90deg,#7c3aed,#c084fc)' : 'rgba(255,255,255,.05)', border: show.isActive ? 'none' : '1px solid rgba(255,255,255,.1)', color: show.isActive ? '#fff' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
          {show.isActive ? '🗳 Vote Now →' : 'View Results →'}
        </button>
      </div>
    </div>
  )
}

// ── Featured Banner ──────────────────────────────────────────────
function FeaturedBanner({ show, onClick, onVote }: { show: Show; onClick: () => void; onVote: () => void }) {
  const [timeLeft, setTimeLeft] = React.useState('')
  React.useEffect(() => {
    function tick() {
      const diff = new Date(show.endDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Voting closed'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      setTimeLeft(`${d}d ${h}h`)
    }
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [show.endDate])

  const totalVotes = show.contestants.reduce((s, c) => s + c.votes, 0)

  return (
    <div onClick={onClick} className="ms-fade" style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer', background: CATEGORY_GRADIENTS[show.category] ?? 'linear-gradient(135deg,#3b0764,#7c3aed)', position: 'relative', marginBottom: 20, border: '1px solid rgba(192,132,252,.25)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.15),rgba(0,0,0,.65))' }} />
      <div style={{ position: 'relative', padding: '22px 18px 18px' }}>
        <div className="ms-voting-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,.2)', borderRadius: 20, padding: '4px 12px', border: '1px solid rgba(74,222,128,.4)', marginBottom: 10 }}>
          <span className="ms-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '.06em' }}>VOTING OPEN · ₡{show.pricePerVote}/vote</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: '#fff', lineHeight: 1.2, marginBottom: 5 }}>{show.title}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: 12 }}>
          Closes in <span style={{ color: '#fbbf24', fontWeight: 700 }}>{timeLeft}</span> · {formatNum(totalVotes)} votes · ₡{formatNum(show.totalRevenue ?? 0)} earned
        </div>
        {/* Top 3 leaderboard */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {show.contestants.filter(c => !c.isEliminated).slice(0, 3).map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 14 }}>{['👑', '🥈', '🥉'][i]}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{c.displayName}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{formatNum(c.votes)}</span>
            </div>
          ))}
        </div>
        <button onClick={e => { e.stopPropagation(); onVote() }} style={{ padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(90deg,#7c3aed,#c084fc)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
          🗳 Vote Now →
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,.02)' }}>
      <div className="ms-skeleton" style={{ height: 100 }} />
      <div style={{ padding: '12px 14px 14px' }}>
        <div className="ms-skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
        <div className="ms-skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
        <div className="ms-skeleton" style={{ height: 10, width: '60%', marginBottom: 14 }} />
        <div className="ms-skeleton" style={{ height: 34, borderRadius: 10 }} />
      </div>
    </div>
  )
}

// ── Vote Packs ──────────────────────────────────────────────────
const VOTE_PACKS = [
  { votes: 1,  cost: 10,  label: '1 Vote',   color: '#4ade80' },
  { votes: 5,  cost: 50,  label: '5 Votes',  color: '#60a5fa' },
  { votes: 25, cost: 200, label: '25 Votes', color: '#c084fc' },
  { votes: 75, cost: 500, label: '75 Votes', color: '#fbbf24' },
]

// ── Inline Vote Sheet ────────────────────────────────────────────
function VoteSheet({ show, onClose, onVoted }: { show: Show; onClose: () => void; onVoted: (contestantId: string, votes: number) => void }) {
  const [selectedContestant, setSelectedContestant] = React.useState<string | null>(null)
  const [selectedPack, setSelectedPack] = React.useState(0)
  const [voting, setVoting] = React.useState(false)
  const [voteSuccess, setVoteSuccess] = React.useState(false)
  const catInfo = SHOW_CATEGORIES.find(c => c.key === show.category)
  const activeContestants = show.contestants.filter(c => !c.isEliminated)

  async function submitVote() {
    if (!selectedContestant || voting) return
    setVoting(true)
    try {
      await (jollofTvApi as any).realityVote?.({
        showId: show.id,
        contestantId: selectedContestant,
        votes: VOTE_PACKS[selectedPack].votes,
        amount: VOTE_PACKS[selectedPack].cost,
      })
    } catch (e) { logApiFailure('reality/vote', e) }
    setVoteSuccess(true)
    onVoted(selectedContestant, VOTE_PACKS[selectedPack].votes)
    setTimeout(() => { setVoteSuccess(false); onClose() }, 1600)
    setVoting(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ms-sheet" style={{ width: '100%', maxWidth: 480, background: '#0d1008', borderRadius: '22px 22px 0 0', padding: '16px 18px 40px', border: '1px solid rgba(255,255,255,.1)', maxHeight: '85vh', overflowY: 'auto' }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, margin: '0 auto 14px' }} />

        {voteSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div className="ms-vote-ok" style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>Vote Cast!</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>{VOTE_PACKS[selectedPack].votes} vote{VOTE_PACKS[selectedPack].votes > 1 ? 's' : ''} for {activeContestants.find(c => c.id === selectedContestant)?.displayName}</div>
          </div>
        ) : (
          <>
            {/* Show header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>{catInfo?.emoji ?? '🎭'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif' }}>{show.title}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{catInfo?.label} · ₡{show.pricePerVote}/vote · S{show.season}</div>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.06)', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 14, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Step 1: Select contestant */}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', marginBottom: 10 }}>
              🎭 SELECT WHO TO VOTE FOR
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {activeContestants.map((c, i) => {
                const sel = selectedContestant === c.id
                return (
                  <button key={c.id} onClick={() => setSelectedContestant(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: sel ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.025)', border: `1.5px solid ${sel ? '#c084fc' : 'rgba(255,255,255,.06)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `hsl(${(i * 55 + 30) % 360},55%,42%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0, border: sel ? '2px solid #c084fc' : '2px solid transparent' }}>
                      {c.displayName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: sel ? '#c084fc' : 'rgba(255,255,255,.8)' }}>{c.displayName}</span>
                        {c.country && <span style={{ fontSize: 10 }}>{{'NG':'🇳🇬','GH':'🇬🇭','KE':'🇰🇪','ZA':'🇿🇦','SN':'🇸🇳','CI':'🇨🇮','ET':'🇪🇹','CM':'🇨🇲'}[c.country] ?? ''}</span>}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.village && `${c.village} Village`}{c.villageRole && ` · ${c.villageRole}`}{c.bio && ` — ${c.bio}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24', fontFamily: 'Sora, sans-serif' }}>{formatNum(c.votes)}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)' }}>votes</div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Eliminated contestants (greyed out) */}
            {show.contestants.filter(c => c.isEliminated).length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', letterSpacing: '.06em', marginBottom: 6 }}>
                  🕯 ELIMINATED
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  {show.contestants.filter(c => c.isEliminated).map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 99, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', opacity: .5 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: 'rgba(255,255,255,.4)' }}>{c.displayName.charAt(0)}</div>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{c.displayName}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Choose vote pack */}
            {selectedContestant && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', marginBottom: 10 }}>
                  🗳 CHOOSE VOTE PACK
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                  {VOTE_PACKS.map((pack, i) => {
                    const sel = selectedPack === i
                    return (
                      <button key={i} onClick={() => setSelectedPack(i)} style={{ padding: '12px 8px', borderRadius: 14, background: sel ? `${pack.color}15` : 'rgba(255,255,255,.025)', border: `1.5px solid ${sel ? pack.color : 'rgba(255,255,255,.06)'}`, cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: sel ? pack.color : 'rgba(255,255,255,.6)', fontFamily: 'Sora, sans-serif' }}>{pack.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>₡{pack.cost}</div>
                      </button>
                    )
                  })}
                </div>

                {/* Pay & Vote button */}
                <button onClick={submitVote} disabled={voting} style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: 'linear-gradient(90deg,#7c3aed,#c084fc)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'Sora, sans-serif', opacity: voting ? .6 : 1 }}>
                  {voting ? 'Casting vote…' : `🗳 Pay ₡${VOTE_PACKS[selectedPack].cost} & Vote →`}
                </button>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', textAlign: 'center', marginTop: 8 }}>
                  {VOTE_PACKS[selectedPack].votes} vote{VOTE_PACKS[selectedPack].votes > 1 ? 's' : ''} for {activeContestants.find(c => c.id === selectedContestant)?.displayName} · Paid via Cowrie
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function MasqueradeStage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  const [shows, setShows] = React.useState<Show[]>([])
  const [loading, setLoading] = React.useState(true)
  const [category, setCategory] = React.useState('all')
  const [voteShow, setVoteShow] = React.useState<Show | null>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await jollofTvApi.realityShows()
        const data = (res as any)?.shows || []
        if (mounted) setShows(data.length > 0 ? data : (USE_MOCKS ? MOCK_SHOWS : []))
      } catch (e) {
        logApiFailure('reality/shows/load', e)
        if (mounted) setShows(USE_MOCKS ? MOCK_SHOWS : [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = React.useMemo(() => {
    if (category === 'all') return shows
    return shows.filter(s => s.category === category)
  }, [shows, category])

  const activeShows = filtered.filter(s => s.isActive)
  const pastShows = filtered.filter(s => !s.isActive)
  const featuredShow = activeShows.find(s => s.contestants.length > 0) ?? null
  const totalPlatformRevenue = shows.reduce((s, sh) => s + (sh.totalRevenue ?? 0), 0)
  const totalPlatformVotes = shows.reduce((s, sh) => s + sh.contestants.reduce((a, c) => a + c.votes, 0), 0)

  function handleVoted(contestantId: string, votes: number) {
    setShows(prev => prev.map(s => ({
      ...s,
      contestants: s.contestants.map(c => c.id === contestantId ? { ...c, votes: c.votes + votes } : c),
    })))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07090a', backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize: '24px 24px', fontFamily: 'DM Sans,sans-serif', paddingBottom: 110 }}>

      {/* Hero */}
      <div style={{ height: 130, background: 'linear-gradient(135deg,#1a0533 0%,#3b0764 50%,#450a0a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
        <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(255,255,255,.8)', fontSize: 16 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Sora, sans-serif', background: 'linear-gradient(90deg,#c084fc,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
              Masquerade Stage 🎭
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
              Reality TV · Create · Vote · Earn
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Platform stats */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 0 12px' }}>
          {[
            { label: 'ACTIVE SHOWS', value: shows.filter(s => s.isActive).length, color: '#c084fc' },
            { label: 'TOTAL VOTES', value: formatNum(totalPlatformVotes), color: '#fbbf24' },
            { label: 'REVENUE', value: `₡${formatNum(totalPlatformRevenue)}`, color: '#4ade80' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', letterSpacing: '.05em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category scroll */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 12, marginBottom: 6 } as React.CSSProperties}>
          {SHOW_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', background: category === cat.key ? 'linear-gradient(90deg,#7c3aed,#c084fc)' : 'rgba(255,255,255,.04)', border: category === cat.key ? 'none' : '1px solid rgba(255,255,255,.08)', color: category === cat.key ? '#fff' : 'rgba(255,255,255,.4)', fontSize: 10, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', flexShrink: 0 }}>
              <span style={{ fontSize: 12 }}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Create Show CTA */}
        <button onClick={() => router.push('/dashboard/jollof/reality/create')} style={{ width: '100%', padding: '14px 18px', borderRadius: 16, background: 'linear-gradient(135deg,rgba(192,132,252,.08),rgba(251,191,36,.08))', border: '1.5px dashed rgba(192,132,252,.35)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🎬</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc', fontFamily: 'Sora, sans-serif' }}>Create Your Reality Show</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Book time slots from ₡500 · Add contestants · Earn from votes</div>
          </div>
          <span style={{ color: '#c084fc', fontSize: 18 }}>→</span>
        </button>

        {/* Time slot pricing banner */}
        <div style={{ borderRadius: 14, background: 'rgba(251,191,36,.04)', border: '1px solid rgba(251,191,36,.15)', padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', letterSpacing: '.04em', marginBottom: 8 }}>📅 TIME SLOT PRICING</div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
            {TIME_SLOTS.map(sl => (
              <div key={sl.days} style={{ padding: '8px 12px', borderRadius: 10, background: sl.popular ? 'rgba(74,222,128,.08)' : 'rgba(255,255,255,.03)', border: `1px solid ${sl.popular ? 'rgba(74,222,128,.25)' : 'rgba(255,255,255,.06)'}`, minWidth: 80, textAlign: 'center', flexShrink: 0, position: 'relative' }}>
                {sl.popular && <div style={{ position: 'absolute', top: -5, right: 4, fontSize: 6, fontWeight: 800, color: '#07090a', background: '#4ade80', borderRadius: 99, padding: '1px 5px' }}>POPULAR</div>}
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 900, color: '#fbbf24' }}>₡{sl.price.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{sl.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured show */}
        {!loading && featuredShow && category === 'all' && (
          <FeaturedBanner show={featuredShow} onClick={() => router.push(`/dashboard/jollof/reality/${featuredShow.id}`)} onVote={() => setVoteShow(featuredShow)} />
        )}

        {/* Active Shows Section */}
        {!loading && activeShows.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em' }}>
                🔴 ACTIVE SHOWS <span style={{ color: 'rgba(255,255,255,.2)' }}>({activeShows.length})</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {activeShows.map((s, i) => (
                <ShowCard key={s.id} show={s} idx={i} onClick={() => router.push(`/dashboard/jollof/reality/${s.id}`)} onVote={() => setVoteShow(s)} />
              ))}
            </div>
          </>
        )}

        {/* Past Shows */}
        {!loading && pastShows.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', marginBottom: 12 }}>
              📁 PAST SEASONS <span style={{ color: 'rgba(255,255,255,.15)' }}>({pastShows.length})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {pastShows.map((s, i) => (
                <ShowCard key={s.id} show={s} idx={i} onClick={() => router.push(`/dashboard/jollof/reality/${s.id}`)} onVote={() => setVoteShow(s)} />
              ))}
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🎭</div>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'rgba(255,255,255,.55)', marginBottom: 8 }}>No shows in this category</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginBottom: 20 }}>Be the first to create one!</div>
            <button onClick={() => router.push('/dashboard/jollof/reality/create')} style={{ padding: '12px 28px', borderRadius: 24, background: 'linear-gradient(90deg,#7c3aed,#c084fc)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Sora, sans-serif' }}>
              🎬 Create Reality Show
            </button>
          </div>
        )}
      </div>

      {/* Inline Vote Sheet */}
      {voteShow && (
        <VoteSheet
          show={voteShow}
          onClose={() => setVoteShow(null)}
          onVoted={handleVoted}
        />
      )}
    </div>
  )
}
