'use client'
// ═══════════════════════════════════════════════════════════════════
// NEW GROUP CHAT — World-Class Group Creation Flow
// 4-step wizard: Select contacts → Group name & avatar → Permissions → Launch
// Africa-first: village-scoped groups, elder roles, quorum governance
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

const STYLES = `
@keyframes ng-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes ng-check{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes ng-pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes ng-launch{0%{transform:scale(1)}50%{transform:scale(.95)}100%{transform:scale(1)}}
.ng-fade{animation:ng-fade .3s ease both}
.ng-check{animation:ng-check .25s cubic-bezier(.34,1.56,.64,1) both}
.ng-pulse{animation:ng-pulse 2s ease infinite}
.ng-no-scroll::-webkit-scrollbar{display:none}
.ng-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

const C = {
  bg: '#050a06', bgCard: '#0a140c', bgEl: '#0f1d10',
  green: '#1a7c3e', greenL: '#4ade80',
  gold: '#d4a017', goldL: '#fbbf24',
  purple: '#7c3aed', purpleL: '#c084fc',
  red: '#dc2626', redL: '#f87171',
  text: '#f0f7f0', textDim: 'rgba(255,255,255,.45)', textDim2: 'rgba(255,255,255,.25)',
  border: 'rgba(255,255,255,.07)',
}

type Step = 1 | 2 | 3 | 4
type GroupType = 'village_circle' | 'trade' | 'family_extended' | 'community' | 'announcement' | 'voice_room'
type Permission = 'everyone' | 'admins_only' | 'elders_only'

interface Contact {
  id: string; name: string; handle: string; emoji: string; village: string
  tier: string; online: boolean; crest: string
}

const CONTACTS: Contact[] = [
  { id: '1', name: 'Chioma Adeyemi',   handle: '@Chioma_Deals',    emoji: '🧺', village: 'Commerce',    tier: '🔥 Inner Fire',    online: true,  crest: 'II'  },
  { id: '2', name: 'Kofi Brong',        handle: '@KofiBrong_Farms', emoji: '🌾', village: 'Agriculture', tier: '🏘 Village Circle', online: true,  crest: 'II'  },
  { id: '3', name: 'Dr. Ngozi Eze',     handle: '@DrNgozi_Health',  emoji: '⚕',  village: 'Health',      tier: '👑 Kingdom',       online: false, crest: 'III' },
  { id: '4', name: 'Kwame Asante',      handle: '@Kwame_Gold',      emoji: '🌾', village: 'Agriculture', tier: '🏘 Village Circle', online: true,  crest: 'I'   },
  { id: '5', name: 'Amara Eze',         handle: '@Amara_Teach',     emoji: '🎓', village: 'Education',   tier: '🏘 Village Circle', online: false, crest: 'II'  },
  { id: '6', name: 'Bello Musa',        handle: '@BelloRunner',     emoji: '🏃', village: 'Commerce',    tier: '🔥 Inner Fire',    online: true,  crest: 'I'   },
  { id: '7', name: 'Mama Adaeze',       handle: '@MamaAdaeze',      emoji: '👩', village: 'Family',      tier: '🔐 Ìdílé',        online: false, crest: 'IV'  },
  { id: '8', name: 'Olu Fashola',       handle: '@OluBuilder',      emoji: '🏗', village: 'Builders',    tier: '🏘 Village Circle', online: true,  crest: 'II'  },
  { id: '9', name: 'Fatima Al-Hassan',  handle: '@Fatima_Justice',  emoji: '⚖',  village: 'Justice',     tier: '👑 Kingdom',       online: false, crest: 'III' },
  { id: '10', name: 'Nnamdi Okafor',   handle: '@Nnamdi_Tech',     emoji: '💻', village: 'Technology',  tier: '🏘 Village Circle', online: true,  crest: 'I'   },
]

const GROUP_TYPES: { id: GroupType; icon: string; label: string; sub: string; color: string }[] = [
  { id: 'village_circle', icon: '🏘', label: 'Village Circle',   sub: 'Community discussion, open to all village members', color: C.greenL  },
  { id: 'trade',          icon: '🤝', label: 'Trade Circle',     sub: 'Escrow-enabled commerce with business sessions',     color: C.goldL   },
  { id: 'family_extended',icon: '🌳', label: 'Extended Family',  sub: 'Family-gated, quorum governance, vault access',      color: C.purpleL },
  { id: 'community',      icon: '🌍', label: 'Community Space',  sub: 'Neighbourhood, SACCO, civic groups',                color: '#22d3ee' },
  { id: 'announcement',   icon: '📢', label: 'Announcement',     sub: 'Only admins can post — broadcast channel',          color: C.goldL   },
  { id: 'voice_room',     icon: '🎙', label: 'Voice Room',       sub: 'Start a live Talking Drum audio space',             color: C.redL    },
]

const GROUP_EMOJIS = ['🌍','🏘','🌾','🤝','🎓','⚕','🌳','🥁','🏗','💻','🛡','🌱','🌊','🔥','👑','🦅']

export default function NewGroupPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [search, setSearch] = React.useState('')
  const [groupName, setGroupName] = React.useState('')
  const [groupEmoji, setGroupEmoji] = React.useState('🌍')
  const [groupType, setGroupType] = React.useState<GroupType>('village_circle')
  const [groupDesc, setGroupDesc] = React.useState('')
  const [whoPost, setWhoPost] = React.useState<Permission>('everyone')
  const [whoInvite, setWhoInvite] = React.useState<Permission>('admins_only')
  const [slowMode, setSlowMode] = React.useState(false)
  const [slowSec, setSlowSec] = React.useState(30)
  const [launching, setLaunching] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('ng-styles')) {
      const s = document.createElement('style'); s.id = 'ng-styles'; s.textContent = STYLES
      document.head.appendChild(s)
    }
  }, [])

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase()) ||
    c.village.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => router.push('/dashboard/chat/g-new-group-001'), 1200)
  }

  const stepLabels = ['Contacts', 'Details', 'Permissions', 'Launch']

  // ── Progress bar ─────────────────────────────────────────────────
  const ProgressBar = () => (
    <div style={{ display: 'flex', gap: 4, padding: '0 18px 14px' }}>
      {stepLabels.map((label, i) => {
        const idx = i + 1
        const done = step > idx
        const active = step === idx
        return (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <div style={{ width: '100%', height: 3, borderRadius: 99, background: done || active ? C.greenL : 'rgba(255,255,255,.1)', transition: 'all .3s' }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: active ? C.greenL : done ? 'rgba(74,222,128,.6)' : C.textDim2 }}>{label}</span>
          </div>
        )
      })}
    </div>
  )

  // ── STEP 1: SELECT CONTACTS ─────────────────────────────────────
  if (step === 1) return (
    <div className="ng-no-scroll" style={{ height: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 17, fontWeight: 900, color: C.text }}>🏘 New Group</div>
            <div style={{ fontSize: 11, color: C.textDim }}>Select participants · {selected.size} selected</div>
          </div>
          {selected.size >= 2 && (
            <button onClick={() => setStep(2)} className="ng-check" style={{ padding: '8px 16px', borderRadius: 12, background: `linear-gradient(135deg, ${C.green}, #145f30)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Next ›
            </button>
          )}
        </div>
        <ProgressBar />

        {/* Selected chips */}
        {selected.size > 0 && (
          <div className="ng-no-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {[...selected].map(id => {
              const c = CONTACTS.find(x => x.id === id)!
              return (
                <div key={id} onClick={() => toggle(id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px 5px 7px', borderRadius: 99, background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.3)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 15 }}>{c.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.greenL }}>{c.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 12, color: C.textDim }}>×</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginTop: 8 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.textDim }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts by name or village..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Contact list */}
      <div className="ng-no-scroll ng-fade" style={{ flex: 1, overflowY: 'auto' }}>
        {['Commerce', 'Agriculture', 'Health', 'Education', 'Technology', 'Builders', 'Justice', 'Family'].map(village => {
          const villageContacts = filtered.filter(c => c.village === village)
          if (!villageContacts.length) return null
          return (
            <div key={village}>
              <div style={{ padding: '10px 18px 4px', fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.1em' }}>{village} Village</div>
              {villageContacts.map(c => {
                const isSelected = selected.has(c.id)
                return (
                  <div key={c.id} onClick={() => toggle(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: isSelected ? 'rgba(26,124,62,.05)' : 'transparent', transition: 'background .15s' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 46, height: 46, borderRadius: 14, background: isSelected ? 'rgba(26,124,62,.15)' : 'rgba(255,255,255,.05)', border: `2px solid ${isSelected ? C.greenL : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'all .2s' }}>{c.emoji}</div>
                      {c.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: C.greenL, border: `2px solid ${C.bg}` }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,160,23,.1)', border: '1px solid rgba(212,160,23,.2)', color: C.goldL }}>Crest {c.crest}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{c.tier} · {c.handle}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: isSelected ? C.greenL : 'rgba(255,255,255,.08)', border: `2px solid ${isSelected ? C.greenL : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#050a06', transition: 'all .2s', flexShrink: 0 }}>
                      {isSelected && <span className="ng-check">✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── STEP 2: GROUP DETAILS ──────────────────────────────────────────
  if (step === 2) return (
    <div className="ng-no-scroll" style={{ height: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setStep(1)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 17, fontWeight: 900, color: C.text }}>Group Details</div>
            <div style={{ fontSize: 11, color: C.textDim }}>{selected.size} participants selected</div>
          </div>
          {groupName.trim().length >= 3 && (
            <button onClick={() => setStep(3)} style={{ padding: '8px 16px', borderRadius: 12, background: `linear-gradient(135deg, ${C.green}, #145f30)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Next ›</button>
          )}
        </div>
        <ProgressBar />
      </div>

      <div className="ng-no-scroll ng-fade" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
        {/* Avatar picker */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(26,124,62,.15)', border: '2px dashed rgba(26,124,62,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 8px', cursor: 'pointer' }}>
              {groupEmoji}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', maxWidth: 240 }}>
              {GROUP_EMOJIS.map(e => (
                <button key={e} onClick={() => setGroupEmoji(e)} style={{ width: 32, height: 32, borderRadius: 8, background: groupEmoji === e ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.04)', border: `1.5px solid ${groupEmoji === e ? C.greenL : C.border}`, fontSize: 16, cursor: 'pointer', transition: 'all .15s' }}>{e}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Group name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 6 }}>Group Name *</label>
          <input value={groupName} onChange={e => setGroupName(e.target.value.slice(0, 50))} placeholder="e.g. Lagos Commerce Circle"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: `1.5px solid ${groupName.trim().length >= 3 ? 'rgba(74,222,128,.5)' : C.border}`, color: C.text, fontSize: 15, outline: 'none', fontFamily: 'Sora,sans-serif', fontWeight: 700, boxSizing: 'border-box' }} />
          <div style={{ fontSize: 10, color: C.textDim2, marginTop: 4, textAlign: 'right' }}>{groupName.length}/50</div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 6 }}>Description (Optional)</label>
          <textarea value={groupDesc} onChange={e => setGroupDesc(e.target.value.slice(0, 200))} placeholder="What is this group about?"
            rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 10, color: C.textDim2, marginTop: 4, textAlign: 'right' }}>{groupDesc.length}/200</div>
        </div>

        {/* Group type */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 10 }}>Group Type</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GROUP_TYPES.map(gt => (
              <button key={gt.id} onClick={() => setGroupType(gt.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: groupType === gt.id ? `${gt.color}0f` : 'rgba(255,255,255,.03)', border: `1.5px solid ${groupType === gt.id ? `${gt.color}40` : C.border}`, cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{gt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: groupType === gt.id ? gt.color : C.text }}>{gt.label}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{gt.sub}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: groupType === gt.id ? gt.color : 'rgba(255,255,255,.08)', border: `2px solid ${groupType === gt.id ? gt.color : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#050a06', flexShrink: 0 }}>
                  {groupType === gt.id && '✓'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── STEP 3: PERMISSIONS ───────────────────────────────────────────
  if (step === 3) return (
    <div className="ng-no-scroll" style={{ height: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setStep(2)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 17, fontWeight: 900, color: C.text }}>Permissions</div>
            <div style={{ fontSize: 11, color: C.textDim }}>Who can do what in this group</div>
          </div>
          <button onClick={() => setStep(4)} style={{ padding: '8px 16px', borderRadius: 12, background: `linear-gradient(135deg, ${C.green}, #145f30)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Review ›</button>
        </div>
        <ProgressBar />
      </div>

      <div className="ng-no-scroll ng-fade" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
        {[
          { label: 'Who can send messages', state: whoPost,   setState: setWhoPost   },
          { label: 'Who can invite members', state: whoInvite, setState: setWhoInvite },
        ].map(({ label, state, setState }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{label}</div>
            {(['everyone', 'admins_only', 'elders_only'] as Permission[]).map(p => (
              <button key={p} onClick={() => setState(p)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', borderRadius: 12, background: state === p ? 'rgba(26,124,62,.08)' : 'rgba(255,255,255,.02)', border: `1px solid ${state === p ? 'rgba(26,124,62,.3)' : C.border}`, marginBottom: 6, cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: state === p ? C.greenL : 'rgba(255,255,255,.08)', border: `2px solid ${state === p ? C.greenL : C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#050a06' }}>
                  {state === p && '✓'}
                </div>
                <span style={{ fontSize: 13, color: state === p ? C.greenL : C.textDim, fontWeight: state === p ? 700 : 500 }}>
                  {p === 'everyone' ? '👥 Everyone' : p === 'admins_only' ? '⚙ Admins only' : '🧓 Elders only'}
                </span>
              </button>
            ))}
          </div>
        ))}

        {/* Slow mode */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: slowMode ? 12 : 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🐢 Slow Mode</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>Limit how often members can post</div>
            </div>
            <button onClick={() => setSlowMode(!slowMode)} style={{ width: 46, height: 26, borderRadius: 13, padding: 3, background: slowMode ? C.greenL : 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', transition: 'background .25s', display: 'flex', alignItems: 'center', justifyContent: slowMode ? 'flex-end' : 'flex-start' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: slowMode ? '#050a06' : 'rgba(255,255,255,.5)', transition: 'all .25s' }} />
            </button>
          </div>
          {slowMode && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[10, 30, 60, 300].map(s => (
                <button key={s} onClick={() => setSlowSec(s)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: slowSec === s ? C.green : 'rgba(255,255,255,.04)', border: `1px solid ${slowSec === s ? C.greenL : C.border}`, color: slowSec === s ? '#fff' : C.textDim, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  {s < 60 ? `${s}s` : `${s/60}m`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Approval required */}
        <div style={{ padding: 14, borderRadius: 14, background: 'rgba(212,160,23,.05)', border: '1px solid rgba(212,160,23,.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.goldL, marginBottom: 6 }}>🛡 Village Covenant</div>
          <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>
            All group members consent to the Village Covenant. Scam attempts flagged to Nkisi Shield. Elders hold dispute resolution authority.
          </div>
        </div>
      </div>
    </div>
  )

  // ── STEP 4: REVIEW & LAUNCH ────────────────────────────────────────
  return (
    <div className="ng-no-scroll" style={{ height: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => setStep(3)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 17, fontWeight: 900, color: C.text }}>Review & Launch</div>
        </div>
        <ProgressBar />
      </div>

      <div className="ng-no-scroll ng-fade" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
        {/* Group preview card */}
        <div style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,.03)', border: `1px solid ${C.border}`, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(26,124,62,.15)', border: '2px solid rgba(26,124,62,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 12px' }}>{groupEmoji}</div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 20, fontWeight: 900, color: C.text }}>{groupName || 'Unnamed Group'}</div>
          {groupDesc && <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>{groupDesc}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(26,124,62,.1)', border: '1px solid rgba(26,124,62,.2)', color: C.greenL }}>{GROUP_TYPES.find(g => g.id === groupType)?.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim }}>{selected.size + 1} members (you + {selected.size})</span>
          </div>
        </div>

        {/* Members preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Participants ({selected.size + 1})</div>
          <div style={{ display: 'flex', gap: -4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(212,160,23,.15)', border: `2px solid ${C.goldL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginRight: -8 }}>✦</div>
            {[...selected].slice(0, 6).map(id => {
              const c = CONTACTS.find(x => x.id === id)!
              return <div key={id} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.05)', border: `2px solid ${C.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginRight: -8 }}>{c.emoji}</div>
            })}
            {selected.size > 6 && <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.08)', border: `2px solid ${C.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: C.textDim }}>+{selected.size - 6}</div>}
          </div>
        </div>

        {/* Permission summary */}
        <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,.03)', border: `1px solid ${C.border}`, marginBottom: 24 }}>
          {[
            { label: 'Send messages', value: whoPost === 'everyone' ? 'Everyone' : whoPost === 'admins_only' ? 'Admins only' : 'Elders only' },
            { label: 'Invite members', value: whoInvite === 'everyone' ? 'Everyone' : whoInvite === 'admins_only' ? 'Admins only' : 'Elders only' },
            { label: 'Slow mode', value: slowMode ? `${slowSec < 60 ? slowSec + 's' : slowSec/60 + 'm'} delay` : 'Off' },
            { label: 'Encryption', value: 'AES-256-GCM + Kyber-512' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <span style={{ fontSize: 12, color: C.textDim }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Launch button */}
        <button onClick={handleLaunch} disabled={launching} style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: `linear-gradient(135deg, ${C.green}, #145f30)`,
          border: '1px solid rgba(74,222,128,.3)',
          color: '#fff', fontSize: 15, fontWeight: 900,
          fontFamily: 'Sora,sans-serif', cursor: launching ? 'wait' : 'pointer',
          boxShadow: '0 8px 32px rgba(26,124,62,.3)', textTransform: 'uppercase', letterSpacing: '.06em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all .3s',
        }}>
          {launching ? <><span className="ng-pulse">⏳</span> Launching...</> : '🥁 Launch Group'}
        </button>
      </div>
    </div>
  )
}
