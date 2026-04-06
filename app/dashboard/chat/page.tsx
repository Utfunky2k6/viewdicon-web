'use client'
// ═══════════════════════════════════════════════════════════════════
// SESO CHAT — Whisper Inbox with Family Gate
// Consent-gated messaging, Trust Tiers, Spirit Voice, Business Sessions
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import FamilyTreeBuilder from '@/components/onboarding/FamilyTreeBuilder'
import { VOCAB } from '@/constants/vocabulary'
import { sesoChatApi, identityApi, connectionApi } from '@/lib/api'
import { SKINS } from '@/components/feed/FeedPostCard'
import { FamilyCircle } from '@/components/chat/FamilyCircle'

/* ── inject-once CSS ── */
const INJECT_ID = 'seso-chat-styles'
const STYLES = `
@keyframes sesoPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}
@keyframes sesoFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes sesoSlide{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes toastIn{0%{opacity:0;transform:translateY(40px) scale(.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes toastOut{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(40px) scale(.9)}}
.seso-pulse{animation:sesoPulse 1.8s ease-in-out infinite}
.seso-fade{animation:sesoFade .35s ease both}
.seso-slide{animation:sesoSlide .25s ease both}
.seso-toast-in{animation:toastIn .3s ease both}
.seso-toast-out{animation:toastOut .3s ease both}
.seso-no-scroll::-webkit-scrollbar{display:none}
.seso-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

/* ── colors ── */
const C = {
  earth:    '#0a0f08',
  earthD:   '#060d07',
  green:    '#1a7c3e',
  greenL:   '#4ade80',
  gold:     '#d4a017',
  goldL:    '#fbbf24',
  purple:   '#7c3aed',
  purpleL:  '#c084fc',
  red:      '#b22222',
  amber:    '#e07b00',
  text:     '#f0f7f0',
  textDim:  'rgba(255,255,255,0.4)',
  textDim2: 'rgba(255,255,255,0.25)',
}

/* ── types ── */
type Tab = 'all' | 'requests' | 'trusted' | 'business' | 'family'
type TrustTier = 'inner_fire' | 'village_circle' | 'kingdom'
type Lang = 'EN' | 'YO' | 'IG' | 'HA' | 'SW' | 'ZU' | 'AR'

interface OnlineContact {
  emoji: string; name: string; status: 'live' | 'away'; color: string
}

interface ChatItem {
  id: string; icon: string; name: string; nameColor?: string
  lastMsg: string; unread: number; unreadColor?: string; unreadLabel?: string
  tier?: string; badge?: string; time: string
}

interface RequestCard {
  handle: string; emoji: string; village: string; crest: string
  nkisi: string; ago: string; message: string
}

interface BusinessCard {
  emoji: string; product: string; sessionId: string; village: string
  status: string; statusColor: string; parties: string; amount: string
}

/* ── data ── */
const ONLINE: OnlineContact[] = [
  { emoji: '🧺', name: 'Chioma',   status: 'live', color: '#e07b00' },
  { emoji: '🌾', name: 'Kofi',     status: 'live', color: C.greenL },
  { emoji: '⚕',  name: 'Dr.Ngozi', status: 'live', color: '#60a5fa' },
  { emoji: '🌳', name: 'Family',   status: 'live', color: C.purpleL },
  { emoji: '⚽', name: 'Bello',    status: 'live', color: '#f472b6' },
  { emoji: '🎓', name: 'Amara',    status: 'away', color: '#818cf8' },
]

const ALL_CHATS: ChatItem[] = [
  {
    id: 'p-chioma', icon: '🧺', name: 'Chioma Adeyemi',
    lastMsg: '🔊 Voice note \u00b7 0:47', unread: 2, unreadColor: C.greenL,
    tier: '🔥 Inner Fire', badge: '🧺 Commerce \u00b7 II \u00b7 🛡 GREEN', time: '2m',
  },
  {
    id: 'b-ankara', icon: '🤝', name: 'Trade \u00b7 BS-2026-A4K9',
    lastMsg: '🔒 ₡42,000 locked \u00b7 Runner en route', unread: 1,
    unreadColor: C.goldL, unreadLabel: '!',
    tier: '🏘 Village Circle', badge: 'Ankara Fabric \u00b7 IN TRANSIT', time: '14m',
  },
  {
    id: 'g-lagos', icon: '🏘', name: 'Commerce \u00b7 Lagos Circle',
    lastMsg: 'Kofi: 50 bags of fresh tomatoes ready...', unread: 14, unreadColor: C.greenL,
    badge: '🧺 \u00ccl\u00fa On\u00ed\u1e63\u00f2w\u00f2 \u00b7 247 members', time: '32m',
  },
  {
    id: 'f-okonkwo', icon: '🌳', name: 'Okonkwo Family Circle', nameColor: C.purpleL,
    lastMsg: '🔐 Papa: Voice note \u2014 0:47', unread: 3, unreadColor: C.purpleL,
    tier: '🔐 \u00ccd\u00edl\u00e9 \u00b7 7 verified', time: '1h',
  },
  {
    id: 'p-ngozi', icon: '⚕', name: 'Dr. Ngozi Eze',
    lastMsg: 'Your appointment confirmed for Friday', unread: 0,
    tier: '👑 Kingdom', badge: '⚕ Health Village', time: '3h',
  },
]

const REQUESTS: RequestCard[] = [
  {
    handle: 'Agriculture Villager · Crest II', emoji: '🌾', village: 'Agriculture',
    crest: 'Crest II', nkisi: 'GREEN', ago: '2h ago',
    message: 'I saw your ankara listing in the Commerce feed. I grow the raw cotton — could we discuss bulk supply?',
  },
  {
    handle: 'Health Practitioner · Crest III', emoji: '⚕', village: 'Health',
    crest: 'Crest III', nkisi: 'GREEN', ago: '5h ago',
    message: 'Referred by a mutual contact in Commerce Village. I offer telemedicine consultations.',
  },
  {
    handle: 'Technology Builder · Crest I', emoji: '💻', village: 'Technology',
    crest: 'Crest I', nkisi: 'GREEN', ago: '1d ago',
    message: 'Saw your market tools session — I can build a POS integration for your shop.',
  },
]

const TIER_INFO: Record<TrustTier, { icon: string; label: string; count: number; color: string; perks: string[] }> = {
  inner_fire: {
    icon: '🔥', label: 'Inner Fire', count: 3, color: C.red,
    perks: [
      'DM without request',
      '₡5K no escrow',
      'Video call',
      'Vault docs',
      'Blood-call',
    ],
  },
  village_circle: {
    icon: '🏘', label: 'Village Circle', count: 12, color: C.green,
    perks: [
      'After whisper accepted',
      'Escrow only',
      'Voice after 3 interactions',
      'Public handle only',
    ],
  },
  kingdom: {
    icon: '👑', label: 'Kingdom', count: 7, color: C.gold,
    perks: [
      'Village context required',
      'Business session only',
      'No direct cowrie',
      'Public handle+village only',
    ],
  },
}

const TRUSTED_CHATS: Record<TrustTier, { icon: string; name: string; village: string; status: string }[]> = {
  inner_fire: [
    { icon: '🧺', name: 'Chioma Adeyemi', village: '🧺 Commerce', status: 'live' },
    { icon: '🌾', name: 'Papa Emeka Okonkwo', village: '🌾 Agriculture', status: 'Family' },
    { icon: '🏃', name: 'Bello Musa \u00b7 Runner', village: '', status: 'live, 4.9\u2605' },
  ],
  village_circle: [
    { icon: '🏘', name: 'Lagos Commerce Circle', village: '🧺 Commerce', status: '247 members' },
    { icon: '🎓', name: 'Amara Eze', village: '🎓 Education', status: 'away' },
  ],
  kingdom: [
    { icon: '⚕', name: 'Dr. Ngozi Eze', village: '⚕ Health', status: 'live' },
    { icon: '🌾', name: 'Kwame Asante', village: '🌾 Agriculture', status: 'live' },
  ],
}

const BIZ_ACTIVE: BusinessCard[] = [
  {
    emoji: '🧺', product: 'Ankara Fabric \u00b7 10 yards', sessionId: 'BS-2026-A4K9',
    village: 'Commerce Village', status: 'IN TRANSIT', statusColor: C.amber,
    parties: 'Buyer\u2194Seller+Runner', amount: '₡42,000',
  },
  {
    emoji: '🌾', product: 'Tomatoes \u00b7 20 bags', sessionId: 'BS-2026-B2N7',
    village: 'Agriculture\u2192Commerce', status: 'LOCKED', statusColor: C.greenL,
    parties: 'Buyer\u2194Seller', amount: '₡64,000',
  },
  {
    emoji: '⚕', product: 'Health Consultation', sessionId: 'BS-2026-C5R1',
    village: 'Health Village', status: 'NEGOTIATING', statusColor: '#60a5fa',
    parties: 'Client\u2194Doctor', amount: '₡8,000',
  },
]

/* ═══════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                     */
/* ═══════════════════════════════════════════════════════════════════ */
export default function ChatInboxPage() {
  const router = useRouter()

  /* state */
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [showGate, setShowGate] = React.useState(false)
  const [showLoginBtn, setShowLoginBtn] = React.useState(false)
  const [tab, setTab] = React.useState<Tab>('all')
  const [activeLang, setActiveLang] = React.useState<Lang>('EN')
  const [search, setSearch] = React.useState('')
  const [activeTier, setActiveTier] = React.useState<TrustTier>('inner_fire')
  const [toast, setToast] = React.useState<string | null>(null)
  const [toastOut, setToastOut] = React.useState(false)

  const [chats, setChats] = React.useState<any[]>([])
  const [requests, setRequests] = React.useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = React.useState<any[]>([])
  const [chatLoading, setChatLoading] = React.useState(true)
  const [showWhisper, setShowWhisper] = React.useState(false)
  const [showHandshake, setShowHandshake] = React.useState(false)
  const [handshakeId, setHandshakeId] = React.useState('')
  const [handshakeStep, setHandshakeStep] = React.useState<'enter' | 'sending' | 'sent' | 'error'>('enter')
  const [handshakeError, setHandshakeError] = React.useState('')

  /* inject CSS once */
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(INJECT_ID)) return
    const s = document.createElement('style')
    s.id = INJECT_ID
    s.textContent = STYLES
    document.head.appendChild(s)
  }, [])

  /* fetch live chat data on mount */
  React.useEffect(() => {
    setChatLoading(true)
    Promise.all([
      sesoChatApi.listChats().catch(() => ({ ok: false, data: [] })),
      fetch('/api/seso/requests').then(r => r.ok ? r.json() : { requests: [] }).catch(() => ({ requests: [] })),
      sesoChatApi.listConnections().catch(() => ({ connections: [] })),
    ]).then(([chatsRes, requestsRes, connectionsRes]: any[]) => {
      setChats(chatsRes.data ?? [])
      setRequests(requestsRes.requests ?? requestsRes.data ?? [])
      setOnlineUsers(connectionsRes.connections ?? connectionsRes.data ?? [])
    }).finally(() => setChatLoading(false))
  }, [])

  /* family gate check — require at least 3 members, then show login button */
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('afk_family_members')
      const arr = raw ? JSON.parse(raw) : []
      if (Array.isArray(arr) && arr.length < 3) {
        setShowGate(true)
      } else if (Array.isArray(arr) && arr.length >= 3) {
        // Members added but needs login confirmation
        const loggedIn = localStorage.getItem('afk_chat_logged_in')
        if (!loggedIn) {
          setShowGate(false)
          setShowLoginBtn(true)
        }
      }
    } catch { setShowGate(true) }
    setIsLoaded(true)
  }, [])

  /* toast helper */
  const flash = React.useCallback((msg: string) => {
    setToast(msg)
    setToastOut(false)
    setTimeout(() => { setToastOut(true) }, 1800)
    setTimeout(() => { setToast(null); setToastOut(false) }, 2200)
  }, [])

  /* handshake handler */
  const handleHandshake = async () => {
    if (!handshakeId.trim()) return
    setHandshakeStep('sending')
    setHandshakeError('')
    try {
      await identityApi.initiateHandshake(handshakeId.trim())
      setHandshakeStep('sent')
      flash('Trust Handshake sent!')
      setTimeout(() => { setShowHandshake(false); setHandshakeStep('enter'); setHandshakeId('') }, 2000)
    } catch (err: unknown) {
      setHandshakeStep('error')
      setHandshakeError((err as Error)?.message || 'Could not reach this AfroID')
    }
  }

  /* ── render guards ── */
  if (!isLoaded) return null

  if (showGate) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#050a06', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px', borderBottom: `1px solid rgba(26,124,62,0.15)`,
          background: 'rgba(26,124,62,0.05)', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(26,124,62,0.2)', border: '1px solid rgba(26,124,62,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 0 15px rgba(26,124,62,0.2)',
          }}>🌳</div>
          <div>
            <h2 style={{
              fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 900,
              color: C.text, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
            }}>Kinship Guard</h2>
            <p style={{
              fontSize: 10, color: 'rgba(74,222,128,0.6)', fontWeight: 700, margin: 0,
            }}>Register at least 3 family members to unlock Seso</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <FamilyTreeBuilder onComplete={() => {
            setShowGate(false)
            // After completing tree builder with 3+ members, show login button
            setShowLoginBtn(true)
          }} />
        </div>
      </div>
    )
  }

  if (showLoginBtn) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#050a06', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'rgba(26,124,62,0.15)', border: '2px solid rgba(26,124,62,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 24, boxShadow: '0 0 40px rgba(26,124,62,0.2)',
        }}>💬</div>
        <h2 style={{
          fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900,
          color: '#f0f7f0', textAlign: 'center', margin: 0, marginBottom: 8,
        }}>Kinship Circle Ready</h2>
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center',
          lineHeight: 1.6, marginBottom: 8, maxWidth: 320,
        }}>
          Your family tree has been registered. You now have access to Seso Chat — consent-gated messaging with Spirit Voice.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32,
          padding: '6px 14px', borderRadius: 99,
          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>3+ Blood Line members verified</span>
        </div>
        <button
          onClick={() => {
            if (typeof localStorage !== 'undefined') localStorage.setItem('afk_chat_logged_in', 'true')
            setShowLoginBtn(false)
          }}
          style={{
            width: '100%', maxWidth: 320, padding: '16px 0', borderRadius: 16,
            background: 'linear-gradient(135deg, #1a7c3e, #145f30)',
            border: '1px solid rgba(74,222,128,0.3)',
            color: '#fff', fontSize: 15, fontWeight: 800,
            fontFamily: 'Sora, sans-serif', cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(26,124,62,0.3)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          🔓 Login to Seso Chat
        </button>
        <p style={{
          fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center',
          marginTop: 16, lineHeight: 1.5,
        }}>
          By entering, you agree to the Village Covenant.<br/>All messages are encrypted. Spirit Voice translates in real time.
        </p>
      </div>
    )
  }

  /* ── tab config ── */
  const TABS: { key: Tab; label: string; count?: number; countColor: string }[] = [
    { key: 'all',      label: 'All',      count: (chats.length > 0 ? chats : ALL_CHATS).length,            countColor: C.greenL },
    { key: 'requests', label: 'Requests', count: (requests.length > 0 ? requests : REQUESTS).length,       countColor: '#ef4444' },
    { key: 'trusted',  label: 'Trusted',  countColor: C.greenL },
    { key: 'business', label: 'Business', count: BIZ_ACTIVE.length,                                        countColor: C.goldL },
    { key: 'family',   label: '🌳 Family',                                                                  countColor: C.purpleL },
  ]

  const displayChats = (chats.length > 0 ? chats : ALL_CHATS).filter((c: any) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMsg?.toLowerCase().includes(search.toLowerCase())
  )

  const displayRequests = (requests.length > 0 ? requests : REQUESTS).filter((r: any) =>
    !search ||
    r.handle?.toLowerCase().includes(search.toLowerCase()) ||
    r.message?.toLowerCase().includes(search.toLowerCase())
  )

  const LANGS: Lang[] = ['EN', 'YO', 'IG', 'HA', 'SW', 'ZU', 'AR']

  /* ═══════════════════════════════════════════════════════ */
  /* RENDER                                                  */
  /* ═══════════════════════════════════════════════════════ */
  return (
    <div className="seso-fade seso-no-scroll" style={{
      minHeight: '100vh', background: C.earthD, color: C.text,
      fontFamily: 'DM Sans, Inter, sans-serif', maxWidth: 480, margin: '0 auto',
      borderLeft: '1px solid rgba(255,255,255,0.04)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* ── Adinkra Gye Nyame overlay ── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.02, backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '100px 100px', backgroundRepeat: 'repeat' }} />
      {/* ── Pan-African Kente top stripe ── */}
      <div aria-hidden="true" style={{ height: 3, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)', flexShrink: 0, position: 'relative', zIndex: 1 }} />

      {/* ── HEADER ── */}
      <div style={{
        padding: '18px 18px 0 18px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900,
            color: C.greenL, fontStyle: 'italic', margin: 0, lineHeight: 1.2,
          }}>{VOCAB.chat.replace('💬 ', '')} Chat</h1>
          <p style={{
            fontSize: 11, color: C.textDim, fontWeight: 500, margin: '3px 0 0 0',
          }}>Spirit Voice active \u00b7 7 languages</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <button onClick={() => setShowHandshake(true)} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(26,124,62,0.12)', border: '1px solid rgba(26,124,62,0.25)',
            color: C.greenL, fontSize: 15, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
          }} title="Connect by AfroID">🤝</button>
          {[
            { icon: '🎙', label: 'Voice Room', href: '/dashboard/chat/voice-room' },
            { icon: '✏', label: 'New Group', href: '/dashboard/chat/new-group' },
            { icon: '⚙', label: 'Settings', href: '/dashboard/chat/settings' },
          ].map((btn, i) => (
            <button key={i} onClick={() => router.push(btn.href)} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              color: C.textDim, fontSize: 15, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}>{btn.icon}</button>
          ))}
        </div>
      </div>

      {/* ── SPIRIT VOICE BAR ── */}
      <div style={{
        margin: '14px 18px 0 18px', padding: '10px 14px', borderRadius: 14,
        background: `linear-gradient(135deg, rgba(26,124,62,0.2), rgba(26,124,62,0.08))`,
        border: `1px solid rgba(26,124,62,0.25)`,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        {/* pulsing dot + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span className="seso-pulse" style={{
            width: 8, height: 8, borderRadius: '50%', background: C.greenL,
            display: 'inline-block', boxShadow: `0 0 6px ${C.greenL}`,
          }} />
          <span style={{
            fontSize: 10, fontWeight: 800, color: C.greenL, letterSpacing: '0.08em',
            textTransform: 'uppercase', fontFamily: 'Sora, sans-serif',
          }}>SPIRIT VOICE LIVE</span>
        </div>

        {/* separator */}
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* language pills */}
        <div style={{
          display: 'flex', gap: 5, flex: 1, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {LANGS.map(lang => {
            const active = lang === activeLang
            return (
              <button key={lang} onClick={() => setActiveLang(lang)} style={{
                padding: '4px 10px', borderRadius: 99,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer',
                background: active ? C.green : 'rgba(255,255,255,0.06)',
                color: active ? '#fff' : C.textDim,
                border: active ? `1px solid ${C.greenL}` : '1px solid rgba(255,255,255,0.06)',
                transition: 'all .2s',
              }}>{lang}</button>
            )
          })}
        </div>

        {/* mic icon */}
        <span onClick={() => flash('Spirit Voice activated — tap a language to switch')} style={{ fontSize: 18, flexShrink: 0, cursor: 'pointer' }}>🎙</span>
      </div>

      {/* ── SEARCH BAR ── */}
      <div style={{
        margin: '12px 18px 0 18px', position: 'relative',
      }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 14, color: C.textDim, pointerEvents: 'none',
        }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search whispers, villages, sessions..."
          style={{
            width: '100%', padding: '12px 14px 12px 40px', borderRadius: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: C.text, fontSize: 13, fontWeight: 500, outline: 'none',
            fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', margin: '14px 18px 0 18px', gap: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {TABS.map(t => {
          const active = tab === t.key
          const isFamily = t.key === 'family'
          const tabAccent = isFamily ? C.purpleL : C.greenL
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '12px 0 10px 0', cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: active ? `2px solid ${tabAccent}` : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all .2s',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: active ? tabAccent : C.textDim,
                fontFamily: 'Sora, sans-serif',
              }}>{t.label}</span>
              {t.count != null && (
                <span style={{
                  fontSize: 10, fontWeight: 800, minWidth: 20, height: 18,
                  borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 6px',
                  background: active ? t.countColor : 'rgba(255,255,255,0.08)',
                  color: active ? (t.key === 'requests' || t.key === 'business' ? '#fff' : '#000') : C.textDim2,
                }}>{t.count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── QUICK CONTACTS ONLINE STRIP ── */}
      <div style={{ overflowX:'auto', display:'flex', gap:10, padding:'8px 14px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        {[{n:'Adaeze',av:'👩🏾',c:'#4ade80'},{n:'Kofi',av:'👨🏿',c:'#fb923c'},{n:'Fatima',av:'👩🏾‍🦱',c:'#c084fc'},{n:'Emeka',av:'👨🏾',c:'#4ade80'},{n:'Zara',av:'👩🏾',c:'#fb923c'},{n:'Kwame',av:'👨🏿‍🦱',c:'#a3e635'}].map(p=>(
          <div key={p.n} onClick={() => router.push('/dashboard/chat/p-' + p.n.toLowerCase())} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0,cursor:'pointer'}}>
            <div style={{position:'relative',width:44,height:44}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{p.av}</div>
              <div style={{position:'absolute',bottom:1,right:1,width:10,height:10,borderRadius:'50%',background:p.c,border:'2px solid #0c1009'}}/>
            </div>
            <span style={{fontSize:8,color:'rgba(255,255,255,.4)',maxWidth:44,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.n}</span>
          </div>
        ))}
      </div>

      {/* ── COMPACT SEARCH (below tabs) ── */}
      <div style={{padding:'8px 14px 0'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search messages..."
          style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'8px 12px',color:'#f0f5ee',fontSize:12,outline:'none',boxSizing:'border-box'}} />
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="seso-no-scroll" style={{
        flex: 1, overflowY: 'auto', paddingBottom: 100,
      }}>

        {/* ════════════════════════════ TAB 0: ALL ════════════════════════════ */}
        {tab === 'all' && (
          <div className="seso-fade">
            {/* Online Strip */}
            <div className="seso-no-scroll" style={{
              display: 'flex', gap: 14, padding: '16px 18px 6px 18px',
              overflowX: 'auto',
            }}>
              {(onlineUsers.length > 0 ? onlineUsers : ONLINE).map((c, i) => (
                <div key={i} onClick={() => router.push('/dashboard/chat/' + ((c as any).id ?? 'p-' + ((c as any).name ?? '').toLowerCase().replace(/\s+/g, '-')))} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  flexShrink: 0, cursor: 'pointer',
                }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: `rgba(${c.status === 'live' ? '26,124,62' : '224,123,0'},0.12)`,
                      border: `2px solid ${c.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>{c.emoji}</div>
                    {/* status dot */}
                    <div style={{
                      position: 'absolute', bottom: 1, right: 1,
                      width: 12, height: 12, borderRadius: '50%',
                      background: c.status === 'live' ? C.greenL : C.amber,
                      border: `2px solid ${C.earthD}`,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: C.textDim,
                    maxWidth: 56, textAlign: 'center', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{c.name}</span>
                </div>
              ))}
            </div>

            {/* Section divider */}
            <div style={{
              padding: '14px 18px 8px 18px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 800, color: C.textDim2,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                fontFamily: 'Sora, sans-serif',
              }}>Recent Whispers</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>

            {/* Chat items */}
            {displayChats.map(ch => (
              <div key={ch.id} onClick={() => router.push(`/dashboard/chat/${ch.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: ch.nameColor
                    ? `rgba(124,58,237,0.12)`
                    : ch.id.startsWith('b-')
                      ? `rgba(212,160,23,0.12)`
                      : ch.id.startsWith('g-')
                        ? `rgba(26,124,62,0.12)`
                        : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${ch.nameColor
                    ? 'rgba(124,58,237,0.3)'
                    : ch.id.startsWith('b-')
                      ? 'rgba(212,160,23,0.3)'
                      : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>{ch.icon}</div>

                {/* body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: ch.nameColor || C.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      maxWidth: '70%',
                    }}>{ch.name}</span>
                    <span style={{ fontSize: 10, color: C.textDim2, fontWeight: 600, flexShrink: 0 }}>{ch.time}</span>
                  </div>

                  <p style={{
                    fontSize: 12, color: C.textDim, fontWeight: 500,
                    margin: '3px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{ch.lastMsg}</p>

                  {/* meta row: tier + badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap',
                  }}>
                    {ch.tier && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                        background: ch.tier.includes('Inner') ? 'rgba(178,34,34,0.12)'
                          : ch.tier.includes('Village') ? 'rgba(26,124,62,0.12)'
                          : ch.tier.includes('Kingdom') ? 'rgba(212,160,23,0.12)'
                          : ch.tier.includes('Ìdílé') ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.05)',
                        color: ch.tier.includes('Inner') ? '#ff6b6b'
                          : ch.tier.includes('Village') ? C.greenL
                          : ch.tier.includes('Kingdom') ? C.goldL
                          : ch.tier.includes('Ìdílé') ? C.purpleL : C.textDim,
                        border: `1px solid ${ch.tier.includes('Inner') ? 'rgba(178,34,34,0.3)'
                          : ch.tier.includes('Village') ? 'rgba(26,124,62,0.25)'
                          : ch.tier.includes('Kingdom') ? 'rgba(212,160,23,0.25)'
                          : ch.tier.includes('Ìdílé') ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      }}>{ch.tier}</span>
                    )}
                    {ch.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 600, color: C.textDim2,
                      }}>{ch.badge}</span>
                    )}
                  </div>
                </div>

                {/* unread badge */}
                {ch.unread > 0 && (
                  <div style={{
                    minWidth: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: ch.unreadColor || C.greenL,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800,
                    color: ch.unreadColor === C.goldL ? '#000' : '#000',
                  }}>{ch.unreadLabel || ch.unread}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════ TAB 1: REQUESTS ════════════════════════════ */}
        {tab === 'requests' && (
          <div className="seso-fade" style={{ padding: '0 18px' }}>
            {/* Info banner */}
            <div style={{
              margin: '16px 0 16px 0', padding: '14px 16px', borderRadius: 14,
              background: 'rgba(224,123,0,0.08)', border: '1px solid rgba(224,123,0,0.2)',
            }}>
              <p style={{
                fontSize: 12, color: C.amber, fontWeight: 600, margin: 0, lineHeight: 1.6,
              }}>
                People request to whisper you. You see their village and Nkisi score
                &mdash; not their real name or phone. Accept to open chat.
              </p>
            </div>

            {/* Request cards */}
            {displayRequests.map((r, i) => {
              const trustScore = Math.floor(60 + Math.random() * 35) // compatibility score
              const mutualVillagers = Math.floor(1 + Math.random() * 5)
              return (
              <div key={i} className="seso-slide" style={{
                padding: 16, borderRadius: 14, marginBottom: 12,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
                animationDelay: `${i * 0.1}s`,
              }}>
                {/* Anonymous identity header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(26,124,62,0.08)', border: '1.5px solid rgba(26,124,62,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    position: 'relative',
                  }}>
                    {r.emoji}
                    {/* Nkisi shield dot */}
                    <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: '50%', background: r.nkisi === 'GREEN' ? '#166534' : '#92400e', border: '2px solid #0a0f08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>🛡</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.handle}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(26,124,62,0.1)', border: '1px solid rgba(26,124,62,0.2)', color: C.greenL }}>{r.emoji} {r.village}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: r.nkisi === 'GREEN' ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,.1)', color: r.nkisi === 'GREEN' ? C.greenL : '#f59e0b', border: `1px solid ${r.nkisi === 'GREEN' ? 'rgba(74,222,128,0.2)' : 'rgba(245,158,11,.2)'}` }}>🛡 {r.nkisi}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,160,23,0.08)', color: '#fbbf24' }}>✦ {r.crest}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: C.textDim2, fontWeight: 600 }}>{r.ago}</span>
                </div>

                {/* Trust compatibility bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(26,124,62,0.04)', border: '1px solid rgba(26,124,62,0.1)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Trust Compatibility</div>
                    <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: trustScore > 80 ? C.greenL : trustScore > 60 ? '#eab308' : C.amber, width: `${trustScore}%`, transition: 'width .4s' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: trustScore > 80 ? C.greenL : '#eab308' }}>{trustScore}%</span>
                </div>

                {/* Context clues — who is this person? */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: C.textDim, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.04)' }}>👥 {mutualVillagers} mutual villager{mutualVillagers > 1 ? 's' : ''}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: C.textDim, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.04)' }}>📅 Joined {Math.floor(3 + Math.random() * 18)} months ago</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: C.textDim, padding: '3px 8px', borderRadius: 99, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.04)' }}>🔥 {Math.floor(5 + Math.random() * 40)} sessions completed</span>
                </div>

                {/* message */}
                <div style={{
                  padding: '10px 14px', borderRadius: 12, marginBottom: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                  fontSize: 12, color: C.textDim, fontWeight: 500, fontStyle: 'italic', lineHeight: 1.5,
                }}>"{r.message}"</div>

                {/* action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    sesoChatApi.respondToWhisper(r.id, 'accept')
                      .then(() => setRequests(prev => prev.filter(req => req.id !== r.id)))
                      .catch(() => {})
                    flash('Whisper accepted — identity revealed')
                  }} style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                    background: C.green, border: `1px solid ${C.greenL}`,
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    fontFamily: 'Sora, sans-serif',
                  }}>✓ Accept Whisper</button>
                  <button onClick={() => {
                    sesoChatApi.respondToWhisper(r.id, 'decline')
                      .then(() => setRequests(prev => prev.filter(req => req.id !== r.id)))
                      .catch(() => {})
                    flash('Request declined')
                  }} style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: C.textDim, fontSize: 12, fontWeight: 700,
                    fontFamily: 'Sora, sans-serif',
                  }}>Decline</button>
                  <button onClick={() => {
                    sesoChatApi.blockUser(r.id)
                      .then(() => setRequests(prev => prev.filter(req => req.id !== r.id)))
                      .catch(() => {})
                    flash('User blocked and reported to Nkisi Shield')
                  }} style={{
                    padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                    background: 'rgba(178,34,34,0.1)', border: '1px solid rgba(178,34,34,0.25)',
                    color: '#ef4444', fontSize: 12, fontWeight: 700,
                    fontFamily: 'Sora, sans-serif',
                  }}>🚫</button>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* ════════════════════════════ TAB 2: TRUSTED ════════════════════════════ */}
        {tab === 'trusted' && (
          <div className="seso-fade" style={{ padding: '0 18px' }}>
            {/* Tier cards (horizontal) */}
            <div style={{
              display: 'flex', gap: 8, padding: '16px 0 12px 0',
            }}>
              {(Object.keys(TIER_INFO) as TrustTier[]).map(tier => {
                const t = TIER_INFO[tier]
                const active = tier === activeTier
                return (
                  <button key={tier} onClick={() => setActiveTier(tier)} style={{
                    flex: 1, padding: '12px 8px', borderRadius: 14, cursor: 'pointer',
                    background: active ? `rgba(${tier === 'inner_fire' ? '178,34,34' : tier === 'village_circle' ? '26,124,62' : '212,160,23'},0.12)` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? `rgba(${tier === 'inner_fire' ? '178,34,34' : tier === 'village_circle' ? '26,124,62' : '212,160,23'},0.35)` : 'rgba(255,255,255,0.05)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all .2s',
                  }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif',
                      color: active ? (tier === 'inner_fire' ? '#ff6b6b' : tier === 'village_circle' ? C.greenL : C.goldL) : C.textDim,
                    }}>{t.label}</span>
                    <span style={{
                      fontSize: 16, fontWeight: 900, color: active ? C.text : C.textDim2,
                    }}>{t.count}</span>
                  </button>
                )
              })}
            </div>

            {/* Tier info box */}
            {(() => {
              const t = TIER_INFO[activeTier]
              const tColor = activeTier === 'inner_fire' ? 'rgba(178,34,34'
                : activeTier === 'village_circle' ? 'rgba(26,124,62' : 'rgba(212,160,23'
              const tTextColor = activeTier === 'inner_fire' ? '#ff6b6b'
                : activeTier === 'village_circle' ? C.greenL : C.goldL
              return (
                <div key={activeTier} className="seso-slide" style={{
                  padding: 14, borderRadius: 14, marginBottom: 16,
                  background: `${tColor},0.06)`,
                  border: `1px solid ${tColor},0.2)`,
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, color: tTextColor,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    fontFamily: 'Sora, sans-serif', marginBottom: 10,
                  }}>{t.icon} {t.label} Privileges</div>
                  {t.perks.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 0', fontSize: 12, color: C.textDim, fontWeight: 500,
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%', background: tTextColor, flexShrink: 0,
                      }} />
                      {p}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Chat items for selected tier */}
            {(TRUSTED_CHATS[activeTier] || []).map((ch, i) => (
              <div key={i} className="seso-slide" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
                animationDelay: `${i * 0.08}s`, cursor: 'pointer',
              }} onClick={() => router.push('/dashboard/chat/p-trusted-' + i)}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{ch.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{ch.name}</div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginTop: 3,
                  }}>
                    {ch.village && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: C.textDim,
                      }}>{ch.village}</span>
                    )}
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                      background: ch.status === 'live' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                      color: ch.status === 'live' ? C.greenL : ch.status === 'Family' ? C.purpleL : C.textDim,
                      border: `1px solid ${ch.status === 'live' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>{ch.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════ TAB 3: BUSINESS ════════════════════════════ */}
        {tab === 'business' && (
          <div className="seso-fade" style={{ padding: '0 18px' }}>
            {/* Section: Active Sessions */}
            <div style={{
              padding: '16px 0 10px 0', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 800, color: C.textDim2,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                fontFamily: 'Sora, sans-serif',
              }}>Active Sessions (3)</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>

            {/* Business cards */}
            {BIZ_ACTIVE.map((b, i) => (
              <div key={i} className="seso-slide" style={{
                padding: 14, borderRadius: 14, marginBottom: 10,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
                animationDelay: `${i * 0.1}s`, cursor: 'pointer',
              }} onClick={() => router.push(`/dashboard/chat/b-session-${i}`)}>
                {/* top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{b.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{b.product}</div>
                      <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 600, marginTop: 2 }}>{b.sessionId}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                    background: `${b.statusColor}18`,
                    color: b.statusColor,
                    border: `1px solid ${b.statusColor}40`,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{b.status}</span>
                </div>

                {/* details */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 600 }}>{b.village}</div>
                    <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, marginTop: 2 }}>{b.parties}</div>
                  </div>
                  <div style={{
                    fontSize: 15, fontWeight: 800, color: C.goldL,
                    fontFamily: 'Sora, sans-serif',
                  }}>{b.amount}</div>
                </div>
              </div>
            ))}

            {/* Section: Escrow History */}
            <div style={{
              padding: '16px 0 10px 0', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 800, color: C.textDim2,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                fontFamily: 'Sora, sans-serif',
              }}>Escrow History</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>

            {/* History item */}
            <div style={{
              padding: 14, borderRadius: 14,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: C.greenL,
              }}>✓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  Palm Oil \u00b7 100L
                </div>
                <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 600, marginTop: 2 }}>
                  Nov 30 \u00b7 SEALED \u00b7 ₡180,000 released
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                background: 'rgba(74,222,128,0.08)', color: C.greenL,
                border: '1px solid rgba(74,222,128,0.2)',
              }}>DONE ✓</span>
            </div>
          </div>
        )}

        {/* ════════════════════════════ TAB 4: FAMILY ════════════════════════════ */}
        {tab === 'family' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <FamilyCircle />
          </div>
        )}

      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={toastOut ? 'seso-toast-out' : 'seso-toast-in'} style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 14, zIndex: 999,
          background: 'rgba(26,124,62,0.95)', border: `1px solid ${C.greenL}`,
          color: '#fff', fontSize: 13, fontWeight: 700,
          fontFamily: 'Sora, sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}

      {/* ── AFROID TRUST HANDSHAKE SHEET ── */}
      {showHandshake && (
        <div onClick={() => { setShowHandshake(false); setHandshakeStep('enter'); setHandshakeId(''); setHandshakeError('') }} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', background: '#0a1a0e', borderRadius: '24px 24px 0 0',
            padding: '20px 20px 36px', border: '1px solid rgba(26,124,62,.2)',
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, margin: '0 auto 16px', background: 'rgba(255,255,255,.15)' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤝</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.greenL, fontFamily: 'Sora, sans-serif' }}>Trust Handshake</div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>Connect using their AfroID — like BBM PIN</div>
              </div>
            </div>

            {/* Info banner */}
            <div style={{ margin: '14px 0', padding: '10px 14px', borderRadius: 12, background: 'rgba(26,124,62,.06)', border: '1px solid rgba(26,124,62,.15)' }}>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
                Enter someone&apos;s <span style={{ color: C.greenL, fontWeight: 700 }}>AfroID</span> to send a Trust Handshake request. Once accepted, you can chat directly — no phone number needed.
              </div>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 6 }}>THEIR AFRO-ID</label>
              <input
                value={handshakeId}
                onChange={e => setHandshakeId(e.target.value.toUpperCase())}
                placeholder="AFR-NGA-COM-001234"
                disabled={handshakeStep === 'sending' || handshakeStep === 'sent'}
                style={{
                  width: '100%', padding: '13px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,.05)', border: '1.5px solid rgba(26,124,62,.25)',
                  color: '#f0f7f0', fontSize: 16, fontFamily: "'Courier New', monospace",
                  fontWeight: 700, letterSpacing: '.08em', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error */}
            {handshakeError && (
              <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{handshakeError}</div>
            )}

            {/* Success */}
            {handshakeStep === 'sent' && (
              <div style={{ textAlign: 'center', padding: '12px 0', marginBottom: 12 }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.greenL }}>Handshake Sent!</div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>They will see your request in their inbox</div>
              </div>
            )}

            {/* Send button */}
            {handshakeStep !== 'sent' && (
              <button
                onClick={handleHandshake}
                disabled={!handshakeId.trim() || handshakeStep === 'sending'}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                  fontSize: 14, fontWeight: 800, cursor: handshakeId.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'Sora, sans-serif', transition: 'all .3s',
                  background: handshakeStep === 'sending'
                    ? 'rgba(26,124,62,.3)'
                    : handshakeId.trim()
                      ? 'linear-gradient(135deg, #1a7c3e, #145f30)'
                      : 'rgba(255,255,255,.06)',
                  color: handshakeId.trim() ? '#fff' : 'rgba(255,255,255,.25)',
                  boxShadow: handshakeId.trim() ? '0 4px 20px rgba(26,124,62,.3)' : 'none',
                }}
              >
                {handshakeStep === 'sending' ? '🔄 Sending...' : '🤝 Send Trust Handshake'}
              </button>
            )}

            {/* How it works */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.25)', letterSpacing: '.1em', marginBottom: 8 }}>HOW IT WORKS</div>
              {[
                { step: '1', text: 'You enter their AfroID (they share it with you in person or by voice)' },
                { step: '2', text: 'They receive your Trust Handshake request in their inbox' },
                { step: '3', text: 'Once accepted, a direct Seso Chat channel opens between you' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(26,124,62,.15)', border: '1px solid rgba(26,124,62,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: C.greenL, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
