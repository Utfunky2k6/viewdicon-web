'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ALL_VILLAGES, VILLAGE_BY_ID, type Village } from '@/lib/villages-data'
import VillageRouter from '@/components/onboarding/VillageRouter'
import { useVillageStore } from '@/stores/villageStore'
import { type CanonicalVillage } from '@/constants/villages'
import { VillageFlagBg } from '@/components/village/VillageFlagBg'

// ── Category filter ────────────────────────────────────────────
type Cat = 'all' | 'economy' | 'people' | 'creative' | 'civic' | 'spirit'
const CAT_FILTERS: { id: Cat; label: string; emoji: string }[] = [
  { id: 'all',      label: 'All 20',  emoji: '🌍' },
  { id: 'economy',  label: 'Economy', emoji: '₵' },
  { id: 'people',   label: 'People',  emoji: '🤝' },
  { id: 'creative', label: 'Creative',emoji: '🎨' },
  { id: 'civic',    label: 'Civic',   emoji: '🏛️' },
  { id: 'spirit',   label: 'Spirit',  emoji: '🌿' },
]

// ── Role emoji lookup per role key ─────────────────────────────
const ROLE_EMOJI: Record<string, string> = {
  market_vendor:'📦', import_export:'🌍', mobile_money:'📱', wholesale:'🏭', ecommerce:'🛒', forex:'💱', second_hand:'♻️', auctioneer:'🔨',
  crop_farmer:'🌱', livestock:'🐄', fisher:'🎣', agro_processor:'⚙️', irrigation:'💧', seed_guardian:'🌿', rain_watcher:'🌦️', farm_logistics:'🚜',
  doctor:'👨‍⚕️', nurse:'👩‍⚕️', herbalist:'🌿', community_health:'🏃', pharmacist:'💊', mental_health:'🧘', lab_tech:'🔬', midwife:'👶',
  teacher:'👨‍🏫', lecturer:'🎓', edtech:'💻', librarian:'📚', vocational:'🔧', tutor:'✏️', researcher:'📜', school_admin:'📋',
  musician:'🎵', visual_artist:'🎨', filmmaker:'🎬', performer:'💃', writer:'✒️', craftsman:'🧵', fashion_designer:'👗', cultural:'🎭',
  mason:'🧱', architect:'🏛️', electrician:'⚡', plumber:'🔧', carpenter:'🪵', surveyor:'📐', civil_eng:'🏗️', heavy_machinery:'🔩',
  solar_tech:'☀️', electrical_eng:'⚡', oil_gas:'🛢️', renewable:'🌬️', utility:'🔌', biogas:'🌿', nuclear:'💧', mini_grid:'📡',
  driver:'🚗', boda_boda:'🏍️', pilot:'✈️', marine:'🚢', rail:'🚂', logistics:'📦', mechanic:'🔧', fleet_manager:'🗺️',
  developer:'💻', data_scientist:'🤖', cybersecurity:'🔐', cloud_eng:'☁️', network_eng:'📡', mobile_dev:'📱', ux_designer:'🎨', tech_support:'🛠️',
  journalist:'📰', broadcaster:'📺', photographer:'📸', social_media:'🎙️', pr_officer:'📣', radio_host:'🎤', video_editor:'🎬', ad_creative:'✨',
  banker:'🏦', investment:'📊', microfinance:'🤝', fintech:'💳', accountant:'🧾', insurance:'📋', tax_agent:'💡', ajo_keeper:'🔮',
  lawyer:'⚖️', magistrate:'👨‍⚖️', paralegal:'🔍', mediator:'🤝', human_rights:'🛡️', traditional:'🌿', notary:'📜', prison_reform:'🔗',
  legislator:'🏛️', civil_servant:'📋', diplomat:'🤝', urban_planner:'🗺️', policy:'📊', tax_collector:'📋', registrar:'📜', elections:'🗳️',
  officer:'🛡️', cybersec:'🔐', fire_safety:'🚒', border:'🚧', private_sec:'👁️', forensic:'🔍', community_watch:'👥', disaster:'⚡',
  imam:'🌙', pastor:'✝️', traditional_priest:'🔮', counselor:'🧘', healer:'🌿', meditation:'🏛️', charity:'💚', funeral:'🙏',
  designer:'👗', tailor:'🧵', textile:'🧶', stylist:'💄', shoe_maker:'👟', model:'📸', beauty:'🛍️', jewelry:'💍',
  elder:'👴', marriage:'💒', child_care:'👶', genealogist:'📜', adoption:'🏠', homemaker:'🌱', youth_mentor:'🌟',
  hotel_manager:'🏨', chef:'🍲', tour_guide:'🗺️', event_planner:'🎉', bartender:'☕', travel_agent:'✈️', resort_manage:'🌴', camp_host:'⛺',
  athlete:'⚽', coach:'🏋️', referee:'🏅', gym_owner:'💪', scout:'🔭', physio:'⚕️', esports:'🎮', sports_media:'📡',
  explorer:'🗺️', career_changer:'🔄', new_graduate:'🎓', entrepreneur:'💡', volunteer:'🤝', multi_skilled:'⚡', navigator:'🧭', returning_citizen:'🚪',
}


// ── Village Card ───────────────────────────────────────────────
function VillageCard({
  village, joined, active, onJoin, onOpen, griotSuggested, memberCount,
}: {
  village: Village
  joined: boolean
  active: boolean
  onJoin: () => void
  onOpen: () => void
  griotSuggested?: boolean
  memberCount?: number
}) {
  const [rolesOpen, setRolesOpen] = React.useState(false)
  const vc = village.color
  const isHolding = village.holding === true

  // ── ADULIS — full-width sovereign gate ──────────────────────
  if (isHolding) {
    return (
      <div style={{
        borderRadius: 18, overflow: 'hidden', position: 'relative',
        background: '#06080a',
        border: `1.5px solid ${active ? '#d4a01760' : '#d4a01730'}`,
        boxShadow: active ? '0 6px 32px rgba(212,160,23,.18)' : '0 2px 10px rgba(0,0,0,.4)',
      }}>
        {/* Flag hero */}
        <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
          <VillageFlagBg id={village.id} color={vc} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(6,8,10,.95) 100%)' }} />
          {/* Ancient name — centre stage */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 10 }}>
            <div style={{ fontSize: 30, marginBottom: 4 }}>{village.emoji}</div>
            <div style={{ fontFamily: '"Cinzel","Palatino","Georgia",serif', fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '0.08em', textShadow: '0 0 30px rgba(212,160,23,.8), 0 2px 12px rgba(0,0,0,.95)', textAlign: 'center' }}>{village.ancientName}</div>
            <div style={{ fontSize: 9, color: '#d4a017', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 5 }}>{village.nationFull}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{village.era}</div>
          </div>
          {active && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: '#d4a017', color: '#0a0a0a', letterSpacing: '.05em' }}>● ACTIVE</div>}
        </div>
        {/* Body */}
        <div style={{ padding: '12px 14px 14px' }}>
          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, margin: '0 0 6px', fontStyle: 'italic' }}>{village.meaning.split('—')[0].trim()}</p>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Guardian: <span style={{ color: '#d4a017', fontWeight: 700 }}>{village.guardian}</span></div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button onClick={onJoin} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #d4a017, #a07210)', color: '#0a0a0a', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>{joined ? '✓ In Path' : '🦅 Ask Griot'}</button>
            <button onClick={onOpen} style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: 'rgba(212,160,23,.08)', border: '1px solid rgba(212,160,23,.3)', color: '#d4a017', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Enter Gate →</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Standard village card — ancient name IS the hero ──────────
  return (
    <div
      onClick={() => setRolesOpen(o => !o)}
      style={{
        borderRadius: 16, overflow: 'hidden', position: 'relative',
        background: '#070a07', cursor: 'pointer',
        border: `1.5px solid ${active ? vc + '70' : joined ? vc + '40' : 'rgba(255,255,255,.07)'}`,
        boxShadow: active ? `0 0 0 1px ${vc}30, 0 6px 24px ${vc}28` : joined ? `0 2px 12px ${vc}16` : 'none',
        transition: 'border-color .2s, box-shadow .2s',
      }}
    >
      {/* ── FLAG HERO — 120px ───────────────────────────────── */}
      <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
        <VillageFlagBg id={village.id} color={vc} />
        {/* Dark gradient — heavier at bottom so name reads clearly */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(7,10,7,.82) 55%, #070a07 100%)` }} />

        {/* Top badges row */}
        <div style={{ position: 'absolute', top: 7, left: 7, right: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Active or Griot badge */}
          {active && <div style={{ fontSize: 7.5, fontWeight: 900, padding: '3px 7px', borderRadius: 99, background: vc, color: '#fff', letterSpacing: '.06em' }}>● ACTIVE</div>}
          {!active && griotSuggested && <div style={{ fontSize: 7.5, fontWeight: 900, padding: '3px 7px', borderRadius: 99, background: '#d4a017', color: '#0a0a0a', letterSpacing: '.06em' }}>🦅 GRIOT PICK</div>}
          {!active && !griotSuggested && <div />}
          {/* Member count */}
          {memberCount != null && <div style={{ fontSize: 7.5, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'rgba(0,0,0,.6)', color: 'rgba(255,255,255,.6)', backdropFilter: 'blur(4px)' }}>{memberCount.toLocaleString()} members</div>}
        </div>

        {/* ── ANCIENT NAME — the real hero ── */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 10px 10px' }}>
          {/* Nation flags */}
          <div style={{ fontSize: 10, marginBottom: 2, letterSpacing: 1 }}>{village.nation.split('').slice(0,6).join('')}</div>
          {/* The NAME — large, Cinzel, glowing */}
          <div style={{
            fontFamily: '"Cinzel","Palatino","Georgia",serif',
            fontSize: 20, fontWeight: 900, color: '#fff',
            letterSpacing: '0.07em', lineHeight: 1,
            textShadow: `0 0 24px ${vc}, 0 0 6px ${vc}80, 0 2px 10px rgba(0,0,0,.98)`,
          }}>{village.ancientName}</div>
          {/* Era */}
          <div style={{ fontSize: 8, color: vc, fontWeight: 700, letterSpacing: '0.08em', marginTop: 3, opacity: 0.9 }}>{village.era}</div>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div style={{ padding: '8px 10px 10px' }}>
        {/* Civilisation full name */}
        <div style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,.42)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>{village.nationFull}</div>

        {/* Meaning — italic, the soul of the name */}
        <div style={{ fontSize: 9, color: vc, fontStyle: 'italic', lineHeight: 1.45, marginBottom: 6, opacity: 0.85 }}>
          {village.meaning.split('—')[0].trim().slice(0, 60)}
        </div>

        {/* Guardian + sector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,.28)' }}>⚡ {village.guardian}</span>
          <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: `${vc}18`, color: vc, border: `1px solid ${vc}28`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{village.category}</span>
        </div>

        {/* Role emoji strip */}
        <div style={{ fontSize: 12, letterSpacing: 3, marginBottom: 7, color: 'rgba(255,255,255,.35)' }}>
          {village.roles.slice(0,4).map(r => ROLE_EMOJI[r.key] ?? '◆').join('')}
          <span style={{ fontSize: 8, marginLeft: 2, color: 'rgba(255,255,255,.22)' }}>+{village.roles.length - 4} roles</span>
        </div>

        {/* Expanded roles list */}
        {rolesOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 7, marginBottom: 7 }}>
            {village.roles.map(r => (
              <div key={r.key} style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>{ROLE_EMOJI[r.key] ?? '◆'}</span>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.75)' }}>{r.name}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,.28)', lineHeight: 1.4, marginTop: 1 }}>{r.desc.slice(0, 72)}…</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={e => { e.stopPropagation(); onJoin() }}
            style={{
              flex: '0 0 auto', padding: '8px 11px', borderRadius: 10,
              border: `1.5px solid ${joined ? vc + '60' : 'rgba(255,255,255,.1)'}`,
              background: joined ? `${vc}22` : 'rgba(255,255,255,.04)',
              color: joined ? vc : 'rgba(255,255,255,.45)',
              fontSize: 10, fontWeight: 800, cursor: 'pointer', minHeight: 'unset',
            }}
          >{joined ? '✓ Joined' : '+ Join'}</button>
          <button
            onClick={e => { e.stopPropagation(); onOpen() }}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              background: `linear-gradient(135deg, ${vc}30, ${vc}10)`,
              border: `1.5px solid ${vc}45`, color: vc,
              fontSize: 10, fontWeight: 800, cursor: 'pointer', minHeight: 'unset',
            }}
          >Enter {village.ancientName} →</button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function VillagesPage() {
  const router = useRouter()
  const [cat, setCat] = React.useState<Cat>('all')
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set(['holdings']))
  const [showGriot, setShowGriot] = React.useState(false)
  const [griotVillageId, setGriotVillageId] = React.useState<string | null>(null)
  const [memberCounts, setMemberCounts] = React.useState<Record<string, number>>({})
  const [registryLive, setRegistryLive] = React.useState(false)

  // Zustand village store
  const { activeVillageId, setActiveVillage } = useVillageStore(s => ({
    activeVillageId: s.activeVillageId,
    setActiveVillage: s.setActiveVillage,
  }))

  // Fetch live member counts
  React.useEffect(() => {
    fetch('/api/villages')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        const arr: any[] = Array.isArray(d) ? d : (d.data ?? d.villages ?? [])
        const counts: Record<string, number> = {}
        arr.forEach((v: any) => {
          if (v.id && typeof v.memberCount === 'number') counts[v.id] = v.memberCount
          else if (v.id && typeof v._count?.members === 'number') counts[v.id] = v._count.members
        })
        if (Object.keys(counts).length > 0) { setMemberCounts(counts); setRegistryLive(true) }
      })
      .catch(() => {})
  }, [])

  // Sync joined state with active village from store
  React.useEffect(() => {
    if (activeVillageId) {
      setJoinedIds(prev => {
        if (prev.has(activeVillageId)) return prev
        const next = new Set(prev); next.add(activeVillageId); return next
      })
    }
  }, [activeVillageId])

  const mainVillages = ALL_VILLAGES.filter(v => !v.holding)
  const holdings = ALL_VILLAGES.filter(v => v.holding)
  const filtered = cat === 'all' ? mainVillages : mainVillages.filter(v => v.category === cat)

  // Join / transfer logic
  const handleJoin = (id: string) => {
    const currentNonHoldings = [...joinedIds].filter(jid => jid !== 'holdings')
    const alreadyIn = joinedIds.has(id)

    if (alreadyIn) {
      setJoinedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      if (activeVillageId === id) setActiveVillage(null)
      return
    }

    if (currentNonHoldings.length > 0) {
      router.push(`/dashboard/villages/transfer?from=${currentNonHoldings[0]}&to=${id}`)
      return
    }

    setJoinedIds(prev => { const n = new Set(prev); n.add(id); return n })
    setActiveVillage(id)
  }

  const handleOpen = (id: string) => {
    // Opening a village sets it as active
    setActiveVillage(id)
    if (id !== 'holdings' && !joinedIds.has(id)) {
      setJoinedIds(prev => { const n = new Set(prev); n.add(id); return n })
    }
    router.push(`/dashboard/villages/${id}`)
  }

  const handleGriotSelect = (village: CanonicalVillage) => {
    setShowGriot(false)
    setGriotVillageId(village.id)
    setJoinedIds(prev => { const n = new Set(prev); n.add(village.id); n.add('holdings'); return n })
    setActiveVillage(village.id)
  }

  const activeVillage = activeVillageId ? VILLAGE_BY_ID[activeVillageId] : null

  return (
    <div style={{ background: '#050608', minHeight: '100dvh', paddingBottom: 28 }}>

      {/* ── Griot overlay ── */}
      {showGriot && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#060b07' }}>
          <VillageRouter onSelect={handleGriotSelect} onCancel={() => setShowGriot(false)} theme={{ bg: '#060b07', text: '#f0f7f0', accent: '#1a7c3e' }} />
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        padding: '18px 14px 14px',
        background: 'linear-gradient(180deg, rgba(26,124,62,.14) 0%, rgba(26,124,62,.03) 60%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,.055)',
      }}>
        {/* Active village banner */}
        {activeVillage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 12px', borderRadius: 12, background: `${activeVillage.color}12`, border: `1px solid ${activeVillage.color}30` }}>
            <span style={{ fontSize: 22 }}>{activeVillage.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, fontWeight: 900, color: activeVillage.color, letterSpacing: '0.06em' }}>{activeVillage.ancientName}</div>
              <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{activeVillage.name} · Guardian: {activeVillage.guardian}</div>
            </div>
            <button onClick={() => router.push(`/dashboard/villages/${activeVillage.id}`)} style={{ padding: '5px 10px', borderRadius: 8, background: `${activeVillage.color}25`, border: `1px solid ${activeVillage.color}45`, color: activeVillage.color, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              Open →
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: '"Cinzel", "Palatino", serif', fontSize: 22, fontWeight: 900, color: '#f0f7f0', margin: 0, letterSpacing: '0.04em' }}>
              🌍 Villages
            </h1>
            <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.32)', marginTop: 4, fontStyle: 'italic' }}>
              20 Ancient Civilisations · Pan-African Sovereignty
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', margin: '3px 0 0' }}>
              {joinedIds.size} joined · {ALL_VILLAGES.length} villages
              {registryLive && <span style={{ marginLeft: 6, fontSize: 8, padding: '1px 5px', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 10, color: '#4ade80', fontWeight: 700 }}>● LIVE</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            {[...joinedIds].filter(jid => jid !== 'holdings').length > 0 && (
              <button onClick={() => { const p = [...joinedIds].filter(jid => jid !== 'holdings')[0]; router.push(`/dashboard/villages/transfer?from=${p}`) }}
                style={{ padding: '8px 12px', borderRadius: 11, background: 'rgba(212,160,23,.12)', border: '1px solid rgba(212,160,23,.28)', color: '#d4a017', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                🦅 Transfer
              </button>
            )}
            <button onClick={() => alert('Village creation coming soon.')} style={{ padding: '8px 12px', borderRadius: 11, background: 'linear-gradient(135deg, #1a7c3e, #145f30)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              + New
            </button>
          </div>
        </div>

        {/* Pan-African Naming Principle */}
        <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(212,160,23,.05)', border: '1px solid rgba(212,160,23,.12)' }}>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 10, fontWeight: 700, color: '#d4a017', marginBottom: 4 }}>The Pan-African Naming Principle</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.35)', lineHeight: 1.65 }}>
            Every village name is from documented African history: WANGARA (Mali gold guild, 800 CE) · KEMET (Ancient Egypt) · NOK (Nigeria 1500 BCE) · GACACA (Rwanda) · AGOJIE (Dahomey women's army) · ADULIS (Eritrea, Red Sea port). These are Africa's actual legacy — running as software.
          </div>
        </div>
      </div>

      {/* ── Category filter chips ── */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 7, padding: '12px 14px 10px', scrollbarWidth: 'none' }}>
        {CAT_FILTERS.map(({ id, label, emoji }) => (
          <button key={id} onClick={() => setCat(id)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 20,
            border: `1.5px solid ${cat === id ? '#1a7c3e' : 'rgba(255,255,255,.1)'}`,
            background: cat === id ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.04)',
            color: cat === id ? '#4ade80' : 'rgba(255,255,255,.45)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* ── Village grid — 2 columns ── */}
      <div style={{ padding: '0 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        {filtered.map(v => (
          <VillageCard
            key={v.id}
            village={v}
            joined={joinedIds.has(v.id)}
            active={activeVillageId === v.id}
            onJoin={() => handleJoin(v.id)}
            onOpen={() => handleOpen(v.id)}
            griotSuggested={v.id === griotVillageId}
            memberCount={memberCounts[v.id]}
          />
        ))}
      </div>

      {/* ── Holdings ── */}
      {holdings.length > 0 && (
        <div style={{ padding: '16px 12px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
            🏛️ Sovereign Holdings — Intake Gate
          </div>
          {holdings.map(v => (
            <VillageCard
              key={v.id}
              village={v}
              joined={joinedIds.has(v.id)}
              active={activeVillageId === v.id}
              onJoin={() => setShowGriot(true)}
              onOpen={() => handleOpen(v.id)}
              memberCount={memberCounts[v.id]}
            />
          ))}
          {griotVillageId && (
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 13, background: 'linear-gradient(135deg, rgba(212,160,23,.08), rgba(26,124,62,.06))', border: '1px solid rgba(212,160,23,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{VILLAGE_BY_ID[griotVillageId]?.emoji ?? '🌍'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#d4a017' }}>
                  Griot sent you to {VILLAGE_BY_ID[griotVillageId]?.ancientName ?? 'a village'}
                </div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>
                  {VILLAGE_BY_ID[griotVillageId]?.name} — scroll up to find it
                </div>
              </div>
              <button onClick={() => setShowGriot(true)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(212,160,23,.3)', background: 'rgba(212,160,23,.1)', color: '#d4a017', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,.3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏘️</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No villages in this category</div>
        </div>
      )}

    </div>
  )
}
