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
  const [expanded, setExpanded] = React.useState(false)
  const vc = village.color
  const isHolding = village.holding === true

  // ── Holdings — full-width sovereign gate ─────────────────────
  if (isHolding) {
    return (
      <div style={{
        borderRadius: 16, overflow: 'hidden', position: 'relative',
        background: '#0a0a08',
        border: `1.5px solid ${active ? vc + '70' : vc + '35'}`,
        boxShadow: active ? `0 6px 28px ${vc}25` : 'none',
      }}>
        {/* Flag */}
        <div style={{ position: 'relative', height: 100, overflow: 'hidden' }}>
          <VillageFlagBg id={village.id} color={vc} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 25%, #0a0a08 100%)' }} />
          <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 40, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.7))' }}>{village.emoji}</div>
          <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 16 }}>{village.nation.split('').slice(0,4).join('')}</div>
          <div style={{ position: 'absolute', bottom: 6, left: 12 }}>
            <div style={{ fontFamily: '"Cinzel", "Palatino", "Georgia", serif', fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '0.06em', textShadow: `0 0 24px ${vc}, 0 2px 8px rgba(0,0,0,.9)` }}>{village.ancientName}</div>
            <div style={{ fontSize: 9, color: vc, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>{village.meaning.split('—')[0].trim()}</div>
          </div>
          {memberCount != null && (
            <div style={{ position: 'absolute', bottom: 28, right: 10, fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(0,0,0,.65)', border: '1px solid rgba(255,255,255,.15)', color: '#4ade80' }}>{memberCount.toLocaleString()}</div>
          )}
          {active && (
            <div style={{ position: 'absolute', top: 8, left: 55, fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: vc, color: '#fff', letterSpacing: '.05em' }}>● ACTIVE</div>
          )}
        </div>
        {/* Body */}
        <div style={{ padding: '10px 14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0' }}>{village.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{village.nationFull} · {village.era}</div>
            </div>
            <button onClick={onJoin} style={{ padding: '8px 14px', borderRadius: 12, border: 'none', background: joined ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg, #d4a017, #a07210)', color: joined ? '#fff' : '#0a0a0a', fontSize: 11, fontWeight: 800, cursor: 'pointer', boxShadow: joined ? 'none' : '0 2px 12px rgba(212,160,23,.4)' }}>
              {joined ? '✓ In Path' : '🦅 Ask Griot'}
            </button>
          </div>
          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.48)', lineHeight: 1.6, margin: '0 0 8px' }}>{village.tagline}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.28)' }}>Guardian:</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: vc }}>{village.guardian}</span>
          </div>
          <button onClick={onOpen} style={{ width: '100%', padding: '10px 0', borderRadius: 12, boxSizing: 'border-box', background: `linear-gradient(135deg, ${vc}25, ${vc}0c)`, border: `1px solid ${vc}45`, color: vc, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            🏛️ Enter ADULIS — Sovereignty Gate →
          </button>
        </div>
      </div>
    )
  }

  // ── Standard village card ─────────────────────────────────────
  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        borderRadius: 14, overflow: 'hidden', position: 'relative',
        background: '#0a0c0a', cursor: 'pointer',
        border: `1.5px solid ${active ? vc + '65' : joined ? vc + '35' : 'rgba(255,255,255,.07)'}`,
        boxShadow: active ? `0 4px 20px ${vc}30` : joined ? `0 2px 10px ${vc}14` : 'none',
        transition: 'border-color .18s, box-shadow .18s',
      }}
    >
      {/* ── Flag hero 72px ── */}
      <div style={{ position: 'relative', height: 72, overflow: 'hidden' }}>
        <VillageFlagBg id={village.id} color={vc} />
        {/* Gradient fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, #0a0c0a 100%)' }} />

        {/* Member count — top left */}
        {memberCount != null && (
          <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,.65)', borderRadius: 99, padding: '2px 7px', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.7)', backdropFilter: 'blur(4px)' }}>
            {memberCount.toLocaleString()}
          </div>
        )}

        {/* Nation flag — top right */}
        <div style={{ position: 'absolute', top: 5, right: 6, fontSize: 14, background: 'rgba(0,0,0,.5)', borderRadius: 4, padding: '1px 4px' }}>
          {village.nation.split('').slice(0,4).join('')}
        </div>

        {/* Griot suggestion badge */}
        {griotSuggested && (
          <div style={{ position: 'absolute', top: 6, left: memberCount != null ? 60 : 6, fontSize: 7.5, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,160,23,.9)', color: '#0a0a0a', letterSpacing: '.05em' }}>🦅 PICK</div>
        )}

        {/* Active badge */}
        {active && (
          <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 7, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: vc, color: '#fff', letterSpacing: '.05em' }}>● ACTIVE</div>
        )}

        {/* Ancient name — bleeds into body */}
        <div style={{ position: 'absolute', bottom: 3, left: 10, right: 8 }}>
          <div style={{
            fontFamily: '"Cinzel", "Palatino", "Georgia", serif',
            fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, color: '#fff',
            textShadow: `0 0 18px ${vc}, 0 1px 6px rgba(0,0,0,.95)`,
          }}>{village.ancientName}</div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '6px 10px 10px' }}>
        {/* English name + era */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{village.name}</div>
          <span style={{ fontSize: 7, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: `${vc}1e`, color: vc, border: `1px solid ${vc}32`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{village.era.split('–')[0].trim()}</span>
        </div>

        {/* Ancient meaning */}
        <div style={{ fontSize: 9, color: vc, fontStyle: 'italic', lineHeight: 1.35, marginBottom: 5, opacity: 0.82 }}>
          "{village.meaning.split('—')[0].replace(/^The /, '').trim().slice(0, 48)}"
        </div>

        {/* Role emoji preview */}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.22)', marginBottom: 6, letterSpacing: 2 }}>
          {village.roles.slice(0,4).map(r => ROLE_EMOJI[r.key] ?? '◆').join('')}
          <span style={{ fontSize: 8, marginLeft: 3 }}>+{village.roles.length - 4}</span>
        </div>

        {/* Expandable roles */}
        {expanded && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 6, marginBottom: 6 }}>
            {village.roles.map((r) => (
              <div key={r.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 4 }}>
                <span style={{ fontSize: 11, flexShrink: 0 }}>{ROLE_EMOJI[r.key] ?? '◆'}</span>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{r.name}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,.28)', lineHeight: 1.4 }}>{r.desc.slice(0,70)}…</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onJoin() }}
            style={{
              flex: '0 0 auto', padding: '7px 10px', borderRadius: 9,
              border: `1.5px solid ${joined ? vc + '55' : 'rgba(255,255,255,.12)'}`,
              background: joined ? `${vc}20` : 'rgba(255,255,255,.04)',
              color: joined ? vc : 'rgba(255,255,255,.5)',
              fontSize: 10, fontWeight: 800, cursor: 'pointer',
            }}
          >
            {joined ? '✓' : '+ Join'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen() }}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 9,
              background: `linear-gradient(135deg, ${vc}28, ${vc}0e)`,
              border: `1.5px solid ${vc}40`, color: vc,
              fontSize: 9.5, fontWeight: 800, cursor: 'pointer',
            }}
          >
            Enter Village →
          </button>
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
