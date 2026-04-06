'use client'
// ═══════════════════════════════════════════════════════════════════
// ÌDÍLÉ FAMILY CIRCLE — Separate Family Experience
// 4 Tabs: 🌳 Tree · 💬 Chat · 🏛 Vault · 💰 Cowrie
// Kinship-encrypted, PIN-gated, SVG generational tree
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { ringsApi, masqueradeApi, sesoChatApi } from '@/lib/api'

/* ── inject CSS ── */
const CSS_ID = 'idile-family-circle-css'
const CSS = `
@keyframes idlPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.5}}
@keyframes idlFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes idlSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes idlBlood{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.5)}50%{box-shadow:0 0 0 10px rgba(220,38,38,0)}}
@keyframes idlWave{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
@keyframes idlSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes idlSpinR{from{transform:rotate(360deg)}to{transform:rotate(0)}}
.idl-pulse{animation:idlPulse 2s ease-in-out infinite}
.idl-fade{animation:idlFade .35s ease both}
.idl-slide{animation:idlSlide .25s ease both}
.idl-blood{animation:idlBlood 1.5s ease infinite}
.idl-spin{animation:idlSpin 30s linear infinite}
.idl-spin-r{animation:idlSpinR 25s linear infinite}
.idl-scroll::-webkit-scrollbar{display:none}
.idl-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

/* palette */
const C = {
  bg: '#070414', bgCard: '#0d0618',
  purple: '#7c3aed', purpleL: '#c084fc', purpleD: '#4c1d95',
  green: '#1a7c3e', greenL: '#4ade80',
  gold: '#d4a017', goldL: '#fbbf24',
  red: '#b22222', redL: '#ef4444',
  blueL: '#7dd3fc',
  text: '#f0e8ff', textDim: 'rgba(255,255,255,.4)', textDim2: 'rgba(255,255,255,.2)',
}

type FamilyTab = 'tree' | 'chat' | 'vault' | 'cowrie'
type Lang = 'EN' | 'YO' | 'IG' | 'HA' | 'SW' | 'ZU'

interface FamilyMember {
  id: string; emoji: string; name: string; kinship: string; localName: string
  generation: number; status: 'verified' | 'pending' | 'deceased' | 'self'
  village?: string; nkisi?: string; crest?: string; isKeyHolder?: boolean
  online?: boolean; lastSeen?: string; x: number; y: number; parentIds?: string[]
}

interface FamilyMsg {
  id: string
  type: 'text' | 'voice' | 'cowrie' | 'blood_call' | 'vault_doc' | 'recovery' | 'system' | 'griot'
  sender: string; senderEmoji: string; senderKin: string
  isMe: boolean; content?: string
  voiceSec?: number; voiceTranslation?: string
  cowrieAmount?: number; cowrieFrom?: string; cowrieTo?: string; cowrieConfirmed?: boolean
  vaultDocName?: string; vaultDocMeta?: string; vaultSigs?: string
  bloodLocation?: string; bloodReason?: string
  recoverDevice?: string; recoverLocation?: string; recoverQuestion?: string
  time: string
}

/* ── mock data ── */
const FAMILY: FamilyMember[] = [
  { id: 'gf', emoji: '👴', name: 'Baba Àgbà', kinship: 'Grandfather', localName: 'Baba Àgbà', generation: 0, status: 'deceased', x: 85, y: 42 },
  { id: 'gm', emoji: '👵', name: 'Ìyá Àgbà', kinship: 'Grandmother', localName: 'Ìyá Àgbà', generation: 0, status: 'deceased', x: 245, y: 42 },
  { id: 'father', emoji: '🧔', name: 'Papa Emeka', kinship: 'Father', localName: 'Baba', generation: 1, status: 'verified', village: '🌾 Agriculture', nkisi: 'GREEN', crest: 'IV', isKeyHolder: true, online: true, lastSeen: 'now', x: 95, y: 175, parentIds: ['gf', 'gm'] },
  { id: 'mother', emoji: '👩', name: 'Mama Ada', kinship: 'Mother', localName: 'Ìyá', generation: 1, status: 'verified', village: '🍽 Hospitality', nkisi: 'GREEN', crest: 'III', isKeyHolder: true, online: true, lastSeen: 'now', x: 235, y: 175, parentIds: ['gf', 'gm'] },
  { id: 'brother', emoji: '👦', name: 'Chidi', kinship: 'Older Brother', localName: 'Egbon', generation: 2, status: 'verified', village: '💻 Technology', nkisi: 'GREEN', crest: 'II', online: true, lastSeen: 'now', x: 55, y: 310, parentIds: ['father', 'mother'] },
  { id: 'self', emoji: '👤', name: 'You', kinship: 'Self', localName: 'Iwo Ni', generation: 2, status: 'self', x: 165, y: 310, parentIds: ['father', 'mother'] },
  { id: 'sister', emoji: '👧', name: 'Ngozi', kinship: 'Younger Sister', localName: 'Abúrò', generation: 2, status: 'pending', village: '🎓 Education', crest: '—', online: false, lastSeen: '3d', x: 275, y: 310, parentIds: ['father', 'mother'] },
  { id: 'child', emoji: '👶', name: 'Add Child', kinship: 'Son/Daughter', localName: '—', generation: 3, status: 'pending', x: 165, y: 455, parentIds: ['self'] },
]

const MOCK_FAMILY_MSGS: FamilyMsg[] = [
  { id: 'fs1', type: 'system', sender: '', senderEmoji: '', senderKin: '', isMe: false, content: '🔐 This conversation is kinship-encrypted. Only verified family members can read.', time: '' },
  { id: 'fg1', type: 'griot', sender: 'Griot', senderEmoji: '🦅', senderKin: '', isMe: false, content: '"A family is like a forest — when you are outside it is dense, when you are inside you see that each tree has its place." — Akan proverb', time: '08:30' },
  { id: 'fm1', type: 'voice', sender: 'Papa Emeka', senderEmoji: '🧔', senderKin: 'Baba · Father', isMe: false, voiceSec: 47, voiceTranslation: '"My children, the farm harvest has been plentiful this season. I am sending the farm money to your mother now. Stay together."', time: '09:30' },
  { id: 'fm2', type: 'cowrie', sender: 'Papa Emeka', senderEmoji: '🧔', senderKin: 'Baba', isMe: false, cowrieAmount: 50000, cowrieFrom: 'Papa Emeka', cowrieTo: 'Mama Ada', cowrieConfirmed: true, time: '09:31' },
  { id: 'fm3', type: 'text', sender: 'Mama Ada', senderEmoji: '👩', senderKin: 'Ìyá · Mother', isMe: false, content: 'Ẹ ṣé baba ❤️ Children, we should plan our family gathering for Christmas. Who can come to Enugu?', time: '09:33' },
  { id: 'fm4', type: 'blood_call', sender: 'Ngozi', senderEmoji: '👧', senderKin: 'Abúrò · Sister', isMe: false, bloodLocation: 'Abuja', bloodReason: 'Please call me urgent, I need help', time: '09:38' },
  { id: 'fm5', type: 'text', sender: 'You', senderEmoji: '👤', senderKin: '', isMe: true, content: "I'll go to Enugu! Ngozi - calling you now. Is everyone okay?", time: '09:40' },
  { id: 'fm6', type: 'recovery', sender: 'System', senderEmoji: '🔐', senderKin: '', isMe: false, recoverDevice: 'Samsung S24', recoverLocation: 'Lagos, Nigeria', recoverQuestion: "What is Umoh's childhood nickname?", time: '09:41' },
  { id: 'fm7', type: 'vault_doc', sender: 'Papa Emeka', senderEmoji: '🧔', senderKin: 'Baba · Father', isMe: false, vaultDocName: 'Land Title · Okonkwo Compound, Enugu', vaultDocMeta: 'PDF · 2.3MB', vaultSigs: '2/5 family signatures to unlock', time: '09:42' },
]

const VAULT_DOCS = [
  { icon: '📜', name: 'Land Title · Okonkwo Compound, Enugu', meta: 'Added by Papa · Nov 2024 · 2/5 signatures', lock: '🔑' },
  { icon: '📋', name: 'Family Last Will & Testament', meta: 'Sealed · Requires 3/5 to unlock · 5 signatures', lock: '🔒' },
  { icon: '💳', name: 'Bank Account Details · Access Bank', meta: 'Added by Papa · Requires 2/5 to view', lock: '🔑' },
  { icon: '🎙', name: "Papa's Voice Recording · Family History", meta: '30min oral history · Translated EN/YO/IG', lock: '▶' },
  { icon: '🌳', name: 'Family Tree Certificate · Afro-ID Registry', meta: 'Verified by Viewdicon · Permanent record', lock: '✓' },
]

const FML_TXS = [
  { icon: '🧔', name: 'Papa → Mama Ada', meta: 'Farm income · Family transfer · Nov 30', amt: '+₡50,000', type: 'in' },
  { icon: '👤', name: 'You → Family Ajo', meta: 'Monthly contribution · Dec 1', amt: '−₡5,000', type: 'out' },
  { icon: '👩', name: 'Mama → Ngozi', meta: 'School fees support · Nov 15', amt: '−₡30,000', type: 'out' },
  { icon: '👦', name: 'Chidi → You', meta: 'Business repayment · Nov 10', amt: '+₡15,000', type: 'in' },
  { icon: '⭕', name: 'Ajo payout → Papa', meta: 'October rotation beneficiary', amt: '+₡35,000', type: 'in' },
]

const KEY_HOLDERS = [
  { emoji: '🧔', name: 'Papa Emeka', kin: 'Father · Key #1', active: true },
  { emoji: '👩', name: 'Mama Ada', kin: 'Mother · Key #2', active: true },
  { emoji: '👦', name: 'Chidi', kin: 'Brother · Key #3', active: true },
  { emoji: '👧', name: 'Ngozi', kin: 'Sister · Key #4', active: false },
  { emoji: '👤', name: 'You', kin: 'Self · Key #5', active: true },
]

/* ═══════════════════════════════════════════════════════════════════ */
export function FamilyCircle() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [tab, setTab] = React.useState<FamilyTab>('tree')
  const [selectedMember, setSelectedMember] = React.useState<FamilyMember | null>(null)
  const [lang, setLang] = React.useState<Lang>('EN')
  const [chatInput, setChatInput] = React.useState('')
  const [messages, setMessages] = React.useState<FamilyMsg[]>(MOCK_FAMILY_MSGS)
  const [members, setMembers] = React.useState<FamilyMember[]>(FAMILY)
  const [showAddSheet, setShowAddSheet] = React.useState(false)
  const [addName, setAddName] = React.useState('')
  const [addKinship, setAddKinship] = React.useState('Brother')
  const [toast, setToast] = React.useState<string | null>(null)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  /* inject CSS */
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS; document.head.appendChild(s)
  }, [])

  /* load bonds from backend */
  React.useEffect(() => {
    if (!user?.id) return
    ringsApi.getBonds(user.id).then((res: any) => {
      const bonds = res?.data ?? res?.bonds
      if (Array.isArray(bonds) && bonds.length > 0) {
        const mapped: FamilyMember[] = bonds.map((b: any, i: number) => ({
          id: b.id || `bond-${i}`,
          emoji: b.relationship === 'mother' || b.relationship === 'sister' || b.relationship === 'daughter' ? '👩' : b.relationship === 'father' ? '🧔' : b.relationship === 'son' ? '👦' : '🧑',
          name: b.targetName || b.name || 'Family',
          kinship: b.relationship || 'Relative',
          localName: b.localName || b.relationship || '',
          generation: b.generation ?? 2,
          status: b.status === 'VERIFIED' ? 'verified' as const : 'pending' as const,
          village: b.village, nkisi: b.nkisi, crest: b.crest,
          online: b.online ?? false, lastSeen: b.lastSeen,
          x: 55 + (i % 3) * 110, y: 175 + Math.floor(i / 3) * 135,
          parentIds: [],
        }))
        setMembers(m => [...m.filter(mm => mm.status === 'self'), ...mapped])
      }
    }).catch(() => {})
  }, [user?.id])

  /* auto-scroll chat */
  React.useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const verified = members.filter(m => m.status === 'verified')
  const onlineCount = members.filter(m => m.online).length

  const handleSend = () => {
    if (!chatInput.trim()) return
    const msg: FamilyMsg = {
      id: `u-${Date.now()}`, type: 'text', sender: 'You', senderEmoji: '👤', senderKin: '',
      isMe: true, content: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(m => [...m, msg])
    setChatInput('')
    sesoChatApi.sendMessage(`f-family`, { body: chatInput }).catch(() => {})
  }

  const handleAddMember = () => {
    if (!addName.trim()) return
    ringsApi.sendInvite({ name: addName, relationship: addKinship, targetIdentifier: addName } as any).catch(() => {})
    const newMember: FamilyMember = {
      id: `new-${Date.now()}`, emoji: '🧑', name: addName, kinship: addKinship, localName: addKinship,
      generation: 2, status: 'pending', x: 55 + (members.length % 3) * 110, y: 310, parentIds: [],
    }
    setMembers(m => [...m, newMember])
    setShowAddSheet(false)
    setAddName('')
    flash(`Kinship invite sent to ${addName}`)
  }

  const LANGS: Lang[] = ['EN', 'YO', 'IG', 'HA', 'SW', 'ZU']
  const TABS: { key: FamilyTab; emoji: string; label: string }[] = [
    { key: 'tree', emoji: '🌳', label: 'Tree' },
    { key: 'chat', emoji: '💬', label: 'Chat' },
    { key: 'vault', emoji: '🏛', label: 'Vault' },
    { key: 'cowrie', emoji: '💰', label: 'Cowrie' },
  ]

  /* ── SVG tree connectors ── */
  function renderConnectors() {
    const lines: React.ReactNode[] = []
    // grandparent marriage
    lines.push(<line key="gp-m" x1="85" y1="65" x2="245" y2="65" stroke="rgba(124,58,237,.3)" strokeWidth="1.5" strokeDasharray="4,2" />)
    lines.push(<circle key="gp-ring" cx="165" cy="65" r="5" fill={C.purple} opacity=".5" />)
    lines.push(<text key="gp-heart" x="165" y="69" textAnchor="middle" fontSize="7" fill="white">♥</text>)
    // grandparent to parent
    lines.push(<line key="gp-p" x1="165" y1="70" x2="165" y2="145" stroke="rgba(124,58,237,.3)" strokeWidth="1.5" />)
    // parent marriage
    lines.push(<line key="p-m" x1="95" y1="205" x2="235" y2="205" stroke="rgba(124,58,237,.4)" strokeWidth="1.5" strokeDasharray="4,2" />)
    lines.push(<circle key="p-ring" cx="165" cy="205" r="5" fill={C.purple} opacity=".5" />)
    lines.push(<text key="p-heart" x="165" y="209" textAnchor="middle" fontSize="7" fill="white">♥</text>)
    // parent to children
    lines.push(<line key="p-c" x1="165" y1="210" x2="165" y2="280" stroke="rgba(124,58,237,.4)" strokeWidth="1.5" />)
    lines.push(<line key="sib" x1="55" y1="280" x2="275" y2="280" stroke="rgba(124,58,237,.25)" strokeWidth="1.5" />)
    lines.push(<line key="sib-l" x1="55" y1="280" x2="55" y2="290" stroke="rgba(124,58,237,.25)" strokeWidth="1.5" />)
    lines.push(<line key="sib-c" x1="165" y1="280" x2="165" y2="290" stroke="rgba(124,58,237,.4)" strokeWidth="2" />)
    lines.push(<line key="sib-r" x1="275" y1="280" x2="275" y2="290" stroke="rgba(124,58,237,.25)" strokeWidth="1.5" />)
    // self to child
    lines.push(<line key="s-ch" x1="165" y1="345" x2="165" y2="430" stroke="rgba(124,58,237,.2)" strokeWidth="1.5" strokeDasharray="4,2" />)
    return lines
  }

  function renderTreeNode(m: FamilyMember) {
    const r = m.status === 'self' ? 28 : m.generation === 0 ? 24 : 26
    const strokeColor = m.status === 'self' ? C.greenL : m.status === 'verified' ? C.purple : m.status === 'deceased' ? '#6b7280' : '#f59e0b'
    const strokeW = m.status === 'self' ? 3 : 2
    const strokeDash = m.status === 'pending' ? '5,2' : undefined
    const opacity = m.status === 'deceased' ? 0.5 : 1
    return (
      <g key={m.id} style={{ cursor: 'pointer', opacity }} onClick={() => m.status !== 'self' && setSelectedMember(m)}>
        <circle cx={m.x} cy={m.y} r={r} fill={C.bgCard} stroke={strokeColor} strokeWidth={strokeW} strokeDasharray={strokeDash} />
        {m.status === 'self' && <circle cx={m.x} cy={m.y} r={r - 5} fill="rgba(74,222,128,.08)" />}
        <text x={m.x} y={m.y + 7} textAnchor="middle" fontSize="20">{m.emoji}</text>
        <text x={m.x} y={m.y + r + 14} textAnchor="middle" fontSize="9" fill={m.status === 'self' ? C.greenL : C.text} fontFamily="Inter,sans-serif" fontWeight="700">{m.name}</text>
        <text x={m.x} y={m.y + r + 25} textAnchor="middle" fontSize="8" fill={m.status === 'pending' ? '#f59e0b' : C.purpleL} fontFamily="Inter,sans-serif">{m.localName} · {m.kinship}</text>
        {m.status === 'self' && (
          <><rect x={m.x - 20} y={m.y - r - 10} width="40" height="12" rx="6" fill={C.greenL} />
          <text x={m.x} y={m.y - r - 1} textAnchor="middle" fontSize="7" fill="#0d1a10" fontFamily="Inter,sans-serif" fontWeight="900">● ACTIVE</text></>
        )}
        {m.status === 'verified' && (
          <><circle cx={m.x + r - 4} cy={m.y - r + 6} r="6" fill={C.purple} />
          <text x={m.x + r - 4} y={m.y - r + 10} textAnchor="middle" fontSize="8" fill="white">✓</text></>
        )}
        {m.status === 'pending' && (
          <><rect x={m.x - 16} y={m.y - r - 8} width="32" height="11" rx="5" fill="rgba(245,158,11,.15)" stroke="rgba(245,158,11,.4)" />
          <text x={m.x} y={m.y - r + 1} textAnchor="middle" fontSize="7" fill="#f59e0b" fontFamily="Inter,sans-serif" fontWeight="700">PENDING</text></>
        )}
        {m.isKeyHolder && (
          <><circle cx={m.x - r + 4} cy={m.y - r + 6} r="6" fill={C.gold} />
          <text x={m.x - r + 4} y={m.y - r + 10} textAnchor="middle" fontSize="7" fill="white">🔑</text></>
        )}
      </g>
    )
  }

  /* ── render message bubble ── */
  function renderMsg(msg: FamilyMsg) {
    if (msg.type === 'system') return (
      <div key={msg.id} style={{ textAlign: 'center', fontSize: 10, fontStyle: 'italic', color: 'rgba(124,58,237,.5)', padding: '4px 12px', margin: '4px 0' }}>{msg.content}</div>
    )
    if (msg.type === 'griot') return (
      <div key={msg.id} className="idl-fade" style={{ margin: '8px 14px', padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(91,33,182,.06))', border: '1px solid rgba(124,58,237,.2)', textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: C.purpleL, fontStyle: 'italic', lineHeight: 1.6 }}>🦅 {msg.content}</span>
      </div>
    )
    const align = msg.isMe ? 'flex-end' : 'flex-start'
    return (
      <div key={msg.id} className="idl-slide" style={{ display: 'flex', gap: 8, alignSelf: align, maxWidth: msg.type === 'blood_call' || msg.type === 'recovery' ? '100%' : '85%', flexDirection: msg.isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, border: `1.5px solid ${msg.isMe ? C.greenL + '66' : C.purple + '66'}`, background: msg.isMe ? 'rgba(74,222,128,.1)' : 'rgba(124,58,237,.1)' }}>{msg.senderEmoji}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: msg.isMe ? 'flex-end' : 'flex-start' }}>
          {!msg.isMe && msg.sender && (
            <div style={{ fontSize: 9, fontWeight: 700, color: C.purpleL, display: 'flex', alignItems: 'center', gap: 5 }}>
              {msg.sender}
              {msg.senderKin && <span style={{ fontSize: 8, background: 'rgba(124,58,237,.12)', color: C.purpleL, borderRadius: 99, padding: '1px 6px', fontStyle: 'italic' }}>{msg.senderKin}</span>}
            </div>
          )}
          {/* message body by type */}
          {msg.type === 'text' && (
            <div style={{ padding: '9px 12px', borderRadius: msg.isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: msg.isMe ? `linear-gradient(135deg,${C.purpleD},#5b21b6)` : '#1a0d2e', color: C.text, fontSize: 12, lineHeight: 1.6, borderLeft: msg.isMe ? undefined : `2px solid ${C.purple}66` }}>{msg.content}</div>
          )}
          {msg.type === 'voice' && (
            <div style={{ padding: '9px 12px', borderRadius: '4px 14px 14px 14px', background: '#1a0d2e', borderLeft: `2px solid ${C.purple}66` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>▶</div>
                <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {Array.from({ length: 15 }, (_, i) => <div key={i} style={{ width: 2, height: Math.random() * 16 + 4, borderRadius: 99, background: i < 8 ? C.purpleL : `${C.purpleL}66`, transition: 'height .1s', flex: 1, maxWidth: 4 }} />)}
                </div>
                <span style={{ fontSize: 10, color: C.purpleL, flexShrink: 0 }}>0:{String(msg.voiceSec || 0).padStart(2, '0')}</span>
              </div>
              {msg.voiceTranslation && (
                <div style={{ fontSize: 10, fontStyle: 'italic', color: C.purpleL, marginTop: 6, background: 'rgba(255,255,255,.03)', borderRadius: 6, padding: '4px 8px', borderLeft: `2px solid ${C.purple}` }}>🌍 {msg.voiceTranslation}</div>
              )}
            </div>
          )}
          {msg.type === 'cowrie' && (
            <div style={{ padding: '10px 14px', borderRadius: 14, background: 'linear-gradient(135deg,#1a1500,#2a1f00)', border: '1px solid rgba(212,160,23,.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🪙</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.goldL, fontFamily: 'Sora, sans-serif' }}>₡{(msg.cowrieAmount || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: 'rgba(212,160,23,.5)', marginTop: 1 }}>Family Transfer · {msg.cowrieFrom} → {msg.cowrieTo}</div>
                </div>
                {msg.cowrieConfirmed && <span style={{ fontSize: 9, background: 'rgba(74,222,128,.12)', color: C.greenL, borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>✓ Confirmed</span>}
              </div>
            </div>
          )}
          {msg.type === 'blood_call' && (
            <div className="idl-blood" style={{ padding: '12px 14px', borderRadius: 14, background: 'linear-gradient(135deg,#450a0a,#7f1d1d)', border: '1px solid rgba(239,68,68,.4)', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.redL, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Sora, sans-serif' }}>🥁 BLOOD-CALL · {msg.sender}</div>
              <div style={{ fontSize: 11, color: 'rgba(248,113,113,.8)', lineHeight: 1.6, marginBottom: 8 }}>📍 {msg.bloodLocation} · 14 minutes ago<br /><strong>"{msg.bloodReason}"</strong></div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                <button onClick={() => { setTab('chat'); flash('Calling family member...') }} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: C.red, color: '#fff', fontFamily: 'Sora, sans-serif' }}>📞 Call Now</button>
                <button onClick={() => { setTab('chat'); flash('Opening whisper...') }} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', fontFamily: 'Sora, sans-serif' }}>💬 Whisper</button>
                <button onClick={() => {
                  if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(() => flash('Location shared with family'), () => flash('Location permission denied')) }
                  else { flash('Geolocation not available') }
                }} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', fontFamily: 'Sora, sans-serif' }}>🗺 Locate</button>
              </div>
            </div>
          )}
          {msg.type === 'recovery' && (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'linear-gradient(135deg,#0c2340,#164e63)', border: '1px solid rgba(14,165,233,.3)', width: '100%' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blueL, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Sora, sans-serif' }}>🔐 Account Recovery Request</div>
              <div style={{ fontSize: 11, color: 'rgba(125,211,252,.8)', lineHeight: 1.6, marginBottom: 8 }}>Device: <strong>{msg.recoverDevice}</strong> · {msg.recoverLocation}</div>
              <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: 8, fontSize: 11, color: C.text, marginBottom: 8, borderLeft: `2px solid ${C.blueL}` }}>Security Question: <em>"{msg.recoverQuestion}"</em></div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => {
                  sesoChatApi.sendMessage('family-circle', { body: 'Recovery approved by family member', type: 'RECOVERY_APPROVE' }).catch(() => {})
                  flash('Recovery approved. Waiting for 1 more Bloodline member.')
                }} style={{ flex: 1, padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: C.green, color: '#fff', fontFamily: 'Sora, sans-serif' }}>✓ Answer & Approve</button>
                <button onClick={() => {
                  sesoChatApi.sendMessage('family-circle', { body: 'Recovery reported as suspicious', type: 'RECOVERY_REPORT' }).catch(() => {})
                  flash('Suspicious activity reported to Nkisi Shield')
                }} style={{ flex: 1, padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'rgba(178,34,34,.2)', color: C.redL, fontFamily: 'Sora, sans-serif' }}>🚨 Report</button>
              </div>
            </div>
          )}
          {msg.type === 'vault_doc' && (
            <div style={{ padding: '10px 14px', borderRadius: 14, background: 'linear-gradient(135deg,#1a1f0d,#283618)', border: '1px solid rgba(132,204,22,.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🏛</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#a3e635', lineHeight: 1.3 }}>{msg.vaultDocName}</div>
                  <div style={{ fontSize: 10, color: 'rgba(163,230,53,.5)', marginTop: 1 }}>Added to Ancestral Vault · {msg.vaultDocMeta}</div>
                  <div style={{ fontSize: 10, color: 'rgba(163,230,53,.7)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>🔑 {msg.vaultSigs}</div>
                </div>
              </div>
            </div>
          )}
          <div style={{ fontSize: 9, color: C.textDim2, display: 'flex', alignItems: 'center', gap: 4 }}>
            {msg.time}
            {msg.isMe && <span style={{ color: C.purple, fontSize: 10 }}>✓✓</span>}
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div style={{ minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: 'Inter,system-ui,sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(180deg,#0d0618,#110820)', padding: '10px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button onClick={() => router.back()} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: 'none', cursor: 'pointer', color: '#fff' }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'Sora, sans-serif' }}>🌳 {user?.clanLineage || 'Okonkwo'} Family Circle</div>
            <div style={{ fontSize: 10, color: C.purpleL, marginTop: 1 }}>{verified.length} verified · {members.length - verified.length} pending · 🔐 Kinship encrypted</div>
          </div>
          <button onClick={() => setShowAddSheet(true)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, border: 'none', cursor: 'pointer', color: '#fff' }}>➕</button>
          <button onClick={() => {
            const shareData = { title: 'Family Circle Invite', text: 'Join our Family Circle on Seso', url: window.location.href }
            if (navigator.share) { navigator.share(shareData).catch(() => {}) } else { navigator.clipboard?.writeText(window.location.href); flash('Link copied to clipboard') }
          }} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, border: 'none', cursor: 'pointer', color: '#fff' }}>📤</button>
        </div>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid rgba(255,255,255,.06)` }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
              fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
              color: tab === t.key ? C.purpleL : C.textDim2,
              borderBottom: tab === t.key ? `2px solid ${C.purple}` : '2px solid transparent',
              transition: 'all .2s', background: 'none', border: 'none',
              borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.key ? C.purple : 'transparent',
              fontFamily: 'Inter,sans-serif',
            }}>{t.emoji} {t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Encryption banner ── */}
      <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(91,33,182,.06))', borderBottom: '1px solid rgba(124,58,237,.18)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div className="idl-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: C.purple, boxShadow: `0 0 6px ${C.purple}cc`, flexShrink: 0 }} />
        <div style={{ fontSize: 10, color: C.purpleL, lineHeight: 1.4 }}><strong style={{ color: C.purpleL }}>Kinship-encrypted</strong> · Only {verified.length} verified members can see. PIN required.</div>
      </div>

      {/* ══════════════ TAB: TREE ══════════════ */}
      {tab === 'tree' && (
        <div className="idl-scroll" style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {/* Translator strip */}
          <div style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.18)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div className="idl-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenL }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.greenL }}>LIVE</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,.08)', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 4, flex: 1 }}>
              {LANGS.map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '3px 7px', borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                  background: l === lang ? C.purple : 'rgba(255,255,255,.04)', color: l === lang ? '#fff' : C.textDim2,
                  border: 'none', transition: 'all .15s',
                }}>{l}</button>
              ))}
            </div>
            <span style={{ fontSize: 13, cursor: 'pointer' }}>🎙</span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {[
              { color: C.purple, shadow: true, label: 'Verified' },
              { color: '#f59e0b', dashed: true, label: 'Pending' },
              { color: C.greenL, shadow: true, label: 'You' },
              { color: '#6b7280', label: 'Ancestor' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.03)', borderRadius: 6, padding: '4px 8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.dashed ? 'transparent' : l.color, border: l.dashed ? `1px dashed ${l.color}` : 'none', boxShadow: l.shadow ? `0 0 6px ${l.color}66` : 'none', flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: C.textDim }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* SVG Family Tree */}
          <svg viewBox="0 0 330 520" style={{ width: '100%', overflow: 'visible' }}>
            {renderConnectors()}
            {/* Generation labels */}
            {[{ y: 45, label: 'GEN I' }, { y: 180, label: 'GEN II' }, { y: 315, label: 'GEN III' }, { y: 460, label: 'GEN IV' }].map(g => (
              <text key={g.label} x="5" y={g.y} transform={`rotate(-90,5,${g.y})`} fontSize="8" fill="rgba(255,255,255,.12)" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing=".05em">{g.label}</text>
            ))}
            {members.map(renderTreeNode)}
          </svg>

          {/* Selected person detail sheet */}
          {selectedMember && (
            <div className="idl-fade" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(124,58,237,.18)', borderRadius: 16, padding: 14, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(124,58,237,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `2px solid ${C.purple}` }}>{selectedMember.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'Sora, sans-serif' }}>{selectedMember.name}</div>
                  <div style={{ fontSize: 11, color: C.purpleL, fontStyle: 'italic' }}>{selectedMember.kinship} · {selectedMember.localName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {selectedMember.status === 'verified' && <span style={{ fontSize: 9, background: 'rgba(74,222,128,.12)', color: C.greenL, borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>🛡 Verified</span>}
                    {selectedMember.isKeyHolder && <span style={{ fontSize: 9, background: 'rgba(212,160,23,.12)', color: C.goldL, borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>🔑 Key Holder</span>}
                    {selectedMember.status === 'pending' && <span style={{ fontSize: 9, background: 'rgba(245,158,11,.12)', color: '#f59e0b', borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>⏳ Pending</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', color: C.textDim2, cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {[
                  { icon: '💬', label: 'Whisper', bg: 'rgba(26,124,62,.15)', color: C.greenL, border: 'rgba(26,124,62,.25)', act: () => { setTab('chat'); setSelectedMember(null); flash('Whisper to ' + selectedMember.name) } },
                  { icon: '📞', label: 'Call', bg: 'rgba(3,105,161,.15)', color: C.blueL, border: 'rgba(3,105,161,.25)', act: () => flash('Calling ' + selectedMember.name + '...') },
                  { icon: '💸', label: 'Send ₡', bg: 'rgba(124,58,237,.15)', color: C.purpleL, border: 'rgba(124,58,237,.25)', act: () => { setTab('cowrie'); setSelectedMember(null) } },
                  { icon: '🥁', label: 'Blood-Call', bg: 'rgba(178,34,34,.12)', color: C.redL, border: 'rgba(178,34,34,.25)', act: () => {
                    try { navigator.vibrate?.([200,100,200,100,200]) } catch {}
                    flash('Blood-Call sent to entire family!')
                  } },
                ].map(a => (
                  <button key={a.label} onClick={a.act} style={{ padding: '8px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700, border: `1px solid ${a.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Sora, sans-serif', background: a.bg, color: a.color }}>{a.icon} {a.label}</button>
                ))}
              </div>
              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { l: 'Village', v: selectedMember.village || '—' },
                  { l: 'Nkisi Shield', v: `🛡 ${selectedMember.nkisi || '—'}`, color: C.greenL },
                  { l: 'Crest Tier', v: `✦ Crest ${selectedMember.crest || '—'}`, color: C.goldL },
                  { l: 'Last Seen', v: selectedMember.online ? '🟢 Online' : selectedMember.lastSeen || '—', color: selectedMember.online ? C.greenL : C.purpleL },
                ].map(m => (
                  <div key={m.l} style={{ background: 'rgba(255,255,255,.02)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 9, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, fontWeight: 700 }}>{m.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: m.color || C.text }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB: CHAT ══════════════ */}
      {tab === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg }}>
          {/* Spirit Voice translator bar */}
          <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(91,33,182,.06))', border: '1px solid rgba(124,58,237,.2)', borderRadius: 0, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>🌍</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.purpleL, flex: 1 }}>Spirit Voice · Live Translator</span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {LANGS.map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  background: l === lang ? C.purple : 'rgba(255,255,255,.03)', color: l === lang ? '#fff' : C.textDim,
                  border: l === lang ? `1px solid ${C.purple}` : '1px solid rgba(255,255,255,.08)', transition: 'all .15s',
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Online strip */}
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,.04)', flexShrink: 0, overflowX: 'auto' }} className="idl-scroll">
            <div className="idl-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenL, flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: C.greenL, flexShrink: 0 }}>{onlineCount} online</span>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,.06)', flexShrink: 0 }} />
            {members.filter(m => m.online).map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, cursor: 'pointer' }} onClick={() => setSelectedMember(m)}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: `1.5px solid ${C.greenL}`, background: 'rgba(74,222,128,.08)' }}>{m.emoji}</div>
                <span style={{ fontSize: 8, color: C.textDim, maxWidth: 36, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div className="idl-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
            {/* decorative spinning rings */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.04 }}>
              <div className="idl-spin" style={{ width: 260, height: 260, border: `2px solid ${C.goldL}`, borderRadius: '50%', position: 'absolute' }} />
              <div className="idl-spin-r" style={{ width: 200, height: 200, border: `1px solid ${C.goldL}`, borderRadius: '50%', position: 'absolute' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map(renderMsg)}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Composer */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid rgba(124,58,237,.08)`, background: C.bg, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 20, cursor: 'pointer' }}>📎</span>
              <input
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Whisper to your family..."
                style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(124,58,237,.18)', borderRadius: 99, padding: '10px 14px', fontSize: 13, color: C.text, outline: 'none', fontFamily: 'Inter,sans-serif' }}
              />
              <button onClick={handleSend} style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${C.purple},#5b21b6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', border: 'none', color: '#fff', flexShrink: 0 }}>🎙</button>
            </div>
            <div className="idl-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
              {[
                { icon: '🪙', label: 'Send ₡', bg: 'rgba(212,160,23,.12)', color: C.goldL, border: 'rgba(212,160,23,.2)', act: () => router.push('/dashboard/banking') },
                { icon: '🥁', label: 'Blood-Call', bg: 'rgba(178,34,34,.12)', color: C.redL, border: 'rgba(178,34,34,.2)', act: () => {
                  try { navigator.vibrate?.([200,100,200,100,200]) } catch {}
                  sesoChatApi.sendMessage('family-circle', { body: 'BLOOD-CALL SOS', type: 'BLOOD_CALL' }).catch(() => {})
                  flash('Blood-Call sent to entire family!')
                } },
                { icon: '🏛', label: 'Vault Doc', bg: 'rgba(163,230,53,.08)', color: '#a3e635', border: 'rgba(163,230,53,.18)', act: () => { setTab('vault'); flash('Opening Vault...') } },
                { icon: '📢', label: 'Share to Feed', bg: 'rgba(26,124,62,.12)', color: C.greenL, border: 'rgba(26,124,62,.2)', act: () => router.push('/dashboard/feed') },
                { icon: '🔐', label: 'Recovery', bg: 'rgba(14,165,233,.08)', color: C.blueL, border: 'rgba(14,165,233,.18)', act: () => flash('Recovery request initiated for family quorum') },
              ].map(a => (
                <button key={a.label} onClick={a.act} style={{ padding: '7px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, border: `1px solid ${a.border}`, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Sora, sans-serif', background: a.bg, color: a.color }}>{a.icon} {a.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: VAULT ══════════════ */}
      {tab === 'vault' && (
        <div className="idl-scroll" style={{ flex: 1, overflowY: 'auto', padding: 12, background: C.bg }}>
          {/* Quorum Health */}
          <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(91,33,182,.06))', border: '1px solid rgba(124,58,237,.2)', borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>🔐</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.purpleL, fontFamily: 'Sora, sans-serif' }}>Vault Quorum Health</div>
                <div style={{ fontSize: 10, color: C.purpleL, marginTop: 2 }}>2 of 5 key holders required to unlock any document</div>
              </div>
            </div>
            {/* Health bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'rgba(255,255,255,.04)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(to right,${C.purple},${C.greenL})`, width: '60%' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.greenL }}>{KEY_HOLDERS.filter(k => k.active).length}/{KEY_HOLDERS.length} Active</span>
            </div>
            {/* Key holders grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {KEY_HOLDERS.map(k => (
                <div key={k.name} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{k.name}</div>
                    <div style={{ fontSize: 9, color: C.purpleL, fontStyle: 'italic' }}>{k.kin}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: k.active ? C.greenL : '#f59e0b', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>{k.active ? '✓ Active' : '⏳ Pending'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vault documents */}
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Vault Documents</div>
          {VAULT_DOCS.map((d, i) => (
            <div key={i} onClick={() => flash(`Opening ${d.name}...`)} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8, transition: 'background .15s' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: 'rgba(124,58,237,.08)', flexShrink: 0 }}>{d.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{d.name}</div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{d.meta}</div>
              </div>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{d.lock}</span>
            </div>
          ))}
          {/* Add document */}
          <button onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.pdf,.doc,.docx,.jpg,.png'
            input.onchange = () => flash('Document added to Vault')
            input.click()
          }} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px dashed rgba(124,58,237,.25)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginTop: 4 }}>
            <span style={{ fontSize: 20 }}>➕</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.textDim2 }}>Add Document to Vault</span>
          </button>
        </div>
      )}

      {/* ══════════════ TAB: COWRIE ══════════════ */}
      {tab === 'cowrie' && (
        <div className="idl-scroll" style={{ flex: 1, overflowY: 'auto', padding: 12, background: C.bg }}>
          {/* Family balance */}
          <div style={{ background: 'linear-gradient(135deg,#2d1c00,#1a1500)', border: '1px solid rgba(212,160,23,.2)', borderRadius: 14, padding: 14, marginBottom: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(212,160,23,.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Family Circle Balance</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.goldL, fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>₡ 284,500</div>
            <div style={{ fontSize: 11, color: 'rgba(212,160,23,.4)', marginTop: 4 }}>Across {verified.length} verified members · Updated live</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[
                { label: 'Send to Family', bg: C.green, color: '#fff', act: () => router.push('/dashboard/banking') },
                { label: 'Receive', bg: 'rgba(255,255,255,.06)', color: C.text, act: () => flash('Your family receive address copied') },
                { label: 'Family Ajo', bg: 'rgba(124,58,237,.15)', color: C.purpleL, act: () => router.push('/dashboard/banking') },
              ].map(b => (
                <button key={b.label} onClick={b.act} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif', background: b.bg, color: b.color }}>{b.label}</button>
              ))}
            </div>
          </div>

          {/* Family Ajo */}
          <div style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)', borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.purpleL, fontFamily: 'Sora, sans-serif' }}>⭕ Family Ajo</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.goldL }}>₡5,000/month</div>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,.04)', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(to right,${C.purple},${C.purpleL})`, width: '71%' }} />
            </div>
            <div style={{ fontSize: 10, color: C.purpleL, display: 'flex', justifyContent: 'space-between' }}>
              <span>5 of 7 paid this month</span>
              <span>₡25,000 of ₡35,000</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: C.purpleL }}>Next collection: Dec 31 · Beneficiary: Ngozi (education)</div>
          </div>

          {/* Transaction list */}
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Recent Family Transfers</div>
          {FML_TXS.map((tx, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10, padding: 10, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18, width: 32, textAlign: 'center', flexShrink: 0 }}>{tx.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{tx.name}</div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>{tx.meta}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: tx.type === 'in' ? C.greenL : C.redL }}>{tx.amt}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Member Sheet ── */}
      {showAddSheet && (
        <div onClick={() => setShowAddSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} className="idl-fade" style={{ width: '100%', background: C.bgCard, borderRadius: '24px 24px 0 0', padding: '18px 18px 32px' }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, margin: '0 auto 14px', background: 'rgba(255,255,255,.12)' }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, textAlign: 'center', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>➕ Add Family Member</div>
            <div style={{ fontSize: 11, color: C.textDim, textAlign: 'center', marginBottom: 16 }}>Send a kinship invite to grow your family tree</div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Full Name</label>
              <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Enter their name..." style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(124,58,237,.18)', color: C.text, fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Relationship</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Uncle', 'Aunt', 'Cousin', 'Grandparent', 'Spouse'].map(r => (
                  <button key={r} onClick={() => setAddKinship(r)} style={{
                    padding: '8px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: addKinship === r ? C.purple : 'rgba(255,255,255,.04)',
                    color: addKinship === r ? '#fff' : C.textDim,
                    border: addKinship === r ? `1px solid ${C.purpleL}` : '1px solid rgba(255,255,255,.08)',
                    transition: 'all .15s',
                  }}>{r}</button>
                ))}
              </div>
            </div>
            <button onClick={handleAddMember} disabled={!addName.trim()} style={{
              width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: addName.trim() ? 'pointer' : 'not-allowed',
              background: addName.trim() ? `linear-gradient(135deg,${C.purple},#5b21b6)` : 'rgba(255,255,255,.04)',
              color: addName.trim() ? '#fff' : C.textDim2, fontSize: 14, fontWeight: 800, fontFamily: 'Sora, sans-serif',
            }}>🌳 Send Kinship Invite</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="idl-fade" style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', borderRadius: 14, background: C.purple, color: '#fff', fontSize: 12, fontWeight: 700, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,.5)', whiteSpace: 'nowrap', fontFamily: 'Sora, sans-serif' }}>{toast}</div>
      )}
    </div>
  )
}
