'use client'
// ═══════════════════════════════════════════════════════════════════
// SESO CHAT — Thread View (4 chat types)
// Detects type from threadId prefix: p- Personal, b- Business,
// g- Group (Village), f- Family Circle
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { VOCAB } from '@/constants/vocabulary'
import { sesoChatApi, orishaApi, sorosokeApi, escrowApi } from '@/lib/api'
import { useSkinStore, SKIN_META } from '@/stores/skinStore'
import { getRankFromXP } from '@/constants/ranks'

/* ── inject-once CSS ── */
const INJECT_ID = 'seso-thread-styles'
const STYLES = `
@keyframes stPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}
@keyframes stFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes stSlide{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes stShake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-3px)}20%,40%,60%,80%{transform:translateX(3px)}}
@keyframes stBreathe{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.7)}70%{box-shadow:0 0 0 15px rgba(220,38,38,0)}}
@keyframes stGlow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes stBubbleIn{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes stToast{0%{opacity:0;transform:translateY(40px) scale(.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes stToastOut{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(40px) scale(.9)}}
@keyframes stSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes stSpinR{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}
@keyframes stMenuIn{from{opacity:0;transform:scale(.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes stReactIn{from{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.25) rotate(5deg)}to{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes stAttachIn{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes stReplySlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
@keyframes stForwardIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
.st-menu-in{animation:stMenuIn .2s cubic-bezier(.34,1.56,.64,1) both}
.st-react-in{animation:stReactIn .35s cubic-bezier(.34,1.56,.64,1) both}
.st-attach-in{animation:stAttachIn .35s cubic-bezier(.16,1,.3,1) both}
.st-reply-slide{animation:stReplySlide .2s ease both}
.st-forward-in{animation:stForwardIn .25s ease both}
.st-pulse{animation:stPulse 1.8s ease-in-out infinite}
.st-fade{animation:stFade .35s ease both}
.st-slide{animation:stSlide .25s ease both}
.st-shake{animation:stShake .5s ease}
.st-glow{animation:stGlow 2s ease-in-out infinite}
.st-bubble{animation:stBubbleIn .3s ease both}
.st-toast-in{animation:stToast .3s ease both}
.st-toast-out{animation:stToastOut .3s ease both}
.st-no-scroll::-webkit-scrollbar{display:none}
.st-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
.st-spin-slow{animation:stSpin 30s linear infinite}
.st-spin-r-slow{animation:stSpinR 25s linear infinite}
@keyframes stRing{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.7}}
@keyframes stCallPulse{0%{box-shadow:0 0 0 0 rgba(74,222,128,.5)}70%{box-shadow:0 0 0 20px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}
@keyframes stCallSlide{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes stCallFade{from{opacity:0}to{opacity:1}}
@keyframes stWave{0%,100%{height:4px}50%{height:18px}}
.st-ring{animation:stRing 1.5s ease-in-out infinite}
.st-call-pulse{animation:stCallPulse 1.5s ease infinite}
.st-call-slide{animation:stCallSlide .35s ease both}
.st-call-fade{animation:stCallFade .25s ease both}
`

/* ── palette ── */
const C = {
  earth: '#0a0f08', earthD: '#060d07',
  green: '#1a7c3e', greenL: '#4ade80',
  gold: '#d4a017', goldL: '#fbbf24',
  purple: '#7c3aed', purpleL: '#c084fc',
  red: '#b22222', redL: '#ef4444',
  amber: '#e07b00', blue: '#3b82f6', blueL: '#60a5fa',
  text: '#f0f7f0', textDim: 'rgba(255,255,255,0.4)', textDim2: 'rgba(255,255,255,0.25)',
}

/* ── types ── */
type ChatType = 'personal' | 'business' | 'group' | 'family'
type Lang = 'EN' | 'YO' | 'IG' | 'HA' | 'SW' | 'ZU' | 'AR'
type FamilyTab = 'chat' | 'tree' | 'vault' | 'cowrie'

interface Msg {
  id: string
  type: 'text' | 'voice' | 'cowrie' | 'trade_card' | 'griot' | 'system' | 'poll' | 'blood_call' | 'vault_request' | 'recovery' | 'photo' | 'code_block' | 'cowrie_transfer' | 'location_pin' | 'feed_share' | 'griot_insight'
  sender: string
  senderRole?: 'BUYER' | 'SELLER' | 'RUNNER' | 'ELDER' | 'MEMBER'
  isMe: boolean
  content?: string
  localName?: string
  voiceSec?: number
  cowrieAmt?: number
  cowrieStatus?: string
  tradeProduct?: string
  tradeAmount?: string
  tradeStatus?: string
  pollOptions?: { label: string; votes: number }[]
  translations?: Record<string, string>
  time: string
  location?: string
  device?: string
  keeperCount?: number
  approvers?: number
  reason?: string
  /* new fields for enhanced features */
  codeLanguage?: string
  lat?: number
  lng?: number
  feedAuthor?: string
  feedPreview?: string
  feedHeat?: number
  translatedText?: string
  senderXp?: number
}

/* ═══════════════════════════════════════════════════════════════════ */
/* MOCK DATA — per chat type                                          */
/* ═══════════════════════════════════════════════════════════════════ */
function getContactInfo(type: ChatType): { name: string; emoji: string; subtitle: string; members?: number } {
  switch (type) {
    case 'personal': return { name: 'Chioma Adeyemi', emoji: '🧺', subtitle: '🔥 Inner Fire · 🛡 GREEN' }
    case 'business': return { name: 'Trade · BS-2026-A4K9', emoji: '🤝', subtitle: 'Ankara Fabric · 10 yards' }
    case 'group': return { name: 'Commerce · Lagos Circle', emoji: '🏘', subtitle: '🧺 Ìlú Oníṣòwò', members: 247 }
    case 'family': return { name: 'Okonkwo Family Circle', emoji: '🌳', subtitle: '🔐 Ìdílé · 7 verified' }
  }
}

function getMockMessages(type: ChatType): Msg[] {
  switch (type) {
    case 'personal': return [
      { id: 's1', type: 'system', sender: '', isMe: false, content: 'Sealed channel opened with Chioma Adeyemi 🛡️', time: '' },
      { id: 'p1', type: 'text', sender: 'Chioma', isMe: false, content: 'Great work on the last land dip. The lineage verification was spotless.', time: '09:14', translations: { yo: 'Iṣẹ́ ribiribi lórí ilẹ̀ tẹ́ ẹ fẹ́ rà kẹ́yìn. Ìmúdájú ìran náà kò lẹ́bi kankan.' } },
      { id: 'p2', type: 'text', sender: 'Me', isMe: true, content: 'Thanks Chioma! We should discuss the upcoming harvest trade session.', time: '09:16' },
      { id: 'p3', type: 'voice', sender: 'Chioma', isMe: false, voiceSec: 47, time: '09:20', translations: { yo: 'Mo ti ní àjọ ilẹ̀ kan tó dára fún ọ ní Badagry...' } },
      { id: 'p4', type: 'trade_card', sender: 'Chioma', isMe: false, tradeProduct: 'Ankara Fabric · 10 yards', tradeAmount: '₡42,000', tradeStatus: 'OPEN', time: '09:25' },
      { id: 'p5', type: 'griot', sender: 'Griot', isMe: false, content: '🦅 "When spider webs unite, they can tie up a lion." — Ethiopian proverb on partnership', time: '09:26' },
      { id: 'p6', type: 'cowrie', sender: 'Chioma', isMe: false, cowrieAmt: 250, cowrieStatus: 'CONFIRMED', time: '09:30' },
      { id: 'p7', type: 'text', sender: 'Me', isMe: true, content: 'Received! Let me lock the escrow now. 🔒', time: '09:31' },
    ]
    case 'business': return [
      { id: 's1', type: 'system', sender: '', isMe: false, content: '🔒 Escrow session opened · ₡42,000 locked', time: '' },
      { id: 's2', type: 'system', sender: '', isMe: false, content: 'Runner Bello Musa assigned · ETA 45min', time: '' },
      { id: 'b1', type: 'text', sender: 'Chioma (Seller)', senderRole: 'SELLER', isMe: false, content: 'The Ankara fabric is ready. 10 yards of Adire-dyed premium quality. I\'ve wrapped it for the runner.', time: '14:02' },
      { id: 'b2', type: 'text', sender: 'Me (Buyer)', senderRole: 'BUYER', isMe: true, content: 'Perfect. I\'ll confirm once Bello delivers. Is the indigo pattern the one from the market photos?', time: '14:05' },
      { id: 'b3', type: 'text', sender: 'Bello (Runner)', senderRole: 'RUNNER', isMe: false, content: 'Picked up from Chioma\'s shop. Heading to your compound now. ETA 35 minutes.', time: '14:12' },
      { id: 's3', type: 'system', sender: '', isMe: false, content: '📍 Runner location updated · In transit', time: '' },
      { id: 'b4', type: 'text', sender: 'Bello (Runner)', senderRole: 'RUNNER', isMe: false, content: 'Arrived at your gate. Please come out to inspect the goods.', time: '14:45' },
      { id: 'b5', type: 'text', sender: 'Me (Buyer)', senderRole: 'BUYER', isMe: true, content: 'Coming out now. The fabric looks excellent — confirming delivery.', time: '14:48' },
    ]
    case 'group': return [
      { id: 's1', type: 'system', sender: '', isMe: false, content: '🏘 Commerce · Lagos Circle — 247 members', time: '' },
      { id: 'g0', type: 'text', sender: 'Elder Adebayo', senderRole: 'ELDER', isMe: false, content: '📌 PINNED: Market day schedule for March — Tuesdays and Fridays. All commerce sessions must use escrow for amounts above ₡5,000.', time: '08:00' },
      { id: 'g1', type: 'text', sender: 'Kofi Brong', senderRole: 'MEMBER', isMe: false, content: '50 bags of fresh tomatoes ready for Lagos delivery. Competitive pricing. DM or open a trade session.', time: '10:22' },
      { id: 'g2', type: 'poll', sender: 'Amaka', senderRole: 'MEMBER', isMe: false, content: 'Should we extend market hours to evening?', pollOptions: [{ label: 'Yes, extend to 9pm', votes: 84 }, { label: 'Keep current hours', votes: 31 }, { label: 'Weekend only extension', votes: 52 }], time: '10:45' },
      { id: 'g3', type: 'text', sender: 'Me', isMe: true, content: 'I have Ankara fabrics arriving from the North. Anyone interested in bulk?', time: '11:02' },
      { id: 'g4', type: 'trade_card', sender: 'Bola', senderRole: 'MEMBER', isMe: false, tradeProduct: 'Shea Butter · 50kg', tradeAmount: '₡85,000', tradeStatus: 'OPEN', time: '11:15' },
      { id: 'g5', type: 'text', sender: 'Chukwuemeka', senderRole: 'MEMBER', isMe: false, content: 'Who has the best palm oil supplier in Lagos? Need 200L for next week.', time: '11:30' },
    ]
    case 'family': return [
      { id: 's1', type: 'system', sender: '', isMe: false, content: '🔐 Messages encrypted with Family Quorum keys', time: '' },
      { id: 'f0', type: 'griot', sender: 'Griot', isMe: false, content: '🦅 "A family is like a forest — when you are outside it is dense, when you are inside you see that each tree has its place." — Akan proverb', time: '08:30' },
      { id: 'f1', type: 'text', sender: 'Mama', localName: 'Iya', isMe: false, content: 'Are you both coming to the naming ceremony? Your aunt has been asking.', time: '09:30' },
      { id: 'f2', type: 'text', sender: 'Kwame', localName: 'Egbon', isMe: false, content: 'Yes! Arriving on Friday. I\'ll bring the kola nuts.', time: '09:35' },
      { id: 'f3', type: 'text', sender: 'Me', isMe: true, content: 'I have arranged the transport. See you all soon.', time: '09:40' },
      { id: 'f4', type: 'voice', sender: 'Papa', localName: 'Baba', isMe: false, voiceSec: 47, time: '09:50' },
      { id: 'f5', type: 'blood_call', sender: 'Fatima', isMe: false, content: 'BLOOD-CALL SOS', localName: 'Aunt', location: 'Trade Fair, Lagos', time: '10:15' },
      { id: 'f6', type: 'vault_request', sender: 'Me', isMe: true, content: 'Ancestral Vault Unlock Request', reason: 'Unlocking Ancestral Land Deed', keeperCount: 3, approvers: 1, time: '11:00' },
      { id: 'f7', type: 'recovery', sender: 'Umoh', isMe: false, content: 'Account recovery request', device: 'iPhone 14 Pro', location: 'Lagos, Nigeria', time: '11:45' },
    ]
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
export default function ChatThreadPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = (params.threadId as string) || ''

  /* detect chat type from prefix */
  const chatType: ChatType = threadId.startsWith('b-') ? 'business'
    : threadId.startsWith('g-') ? 'group'
    : threadId.startsWith('f-') ? 'family'
    : 'personal'

  const contact = getContactInfo(chatType)

  /* state */
  const [messages, setMessages] = React.useState<Msg[]>(() => getMockMessages(chatType))
  const [input, setInput] = React.useState('')
  const [activeLang, setActiveLang] = React.useState<Lang>('EN')
  const [showTranslation, setShowTranslation] = React.useState<Record<string, boolean>>({})
  const [toast, setToast] = React.useState<string | null>(null)
  const [toastOut, setToastOut] = React.useState(false)
  const [typing, setTyping] = React.useState(false)
  const [familyTab, setFamilyTab] = React.useState<FamilyTab>('chat')
  const [recoveryForm, setRecoveryForm] = React.useState(false)
  const [culturalAnswer, setCulturalAnswer] = React.useState('')
  const [recoveryApproved, setRecoveryApproved] = React.useState(false)
  const [callState, setCallState] = React.useState<'idle'|'ringing-out'|'ringing-in'|'video'|'audio'>('idle')
  const [callMuted, setCallMuted] = React.useState(false)
  const [callCamOff, setCallCamOff] = React.useState(false)
  const [callCamFacing, setCallCamFacing] = React.useState<'user'|'environment'>('user')
  const [callSpeaker, setCallSpeaker] = React.useState(false)
  const [callTimer, setCallTimer] = React.useState(0)
  const callIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  /* ── message actions ── */
  const [actionMsg, setActionMsg] = React.useState<Msg | null>(null)
  const [replyTo, setReplyTo] = React.useState<Msg | null>(null)
  const [reactions, setReactions] = React.useState<Record<string, string[]>>({})
  const [starred, setStarred] = React.useState<Set<string>>(new Set())
  const [showAttach, setShowAttach] = React.useState(false)
  const [forwardMsg, setForwardMsg] = React.useState<Msg | null>(null)
  const lpRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── new feature state ── */
  const { activeSkin } = useSkinStore()
  const skinMeta = SKIN_META[activeSkin]
  const [showHeaderMenu, setShowHeaderMenu] = React.useState(false)
  const [showCowrieInput, setShowCowrieInput] = React.useState(false)
  const [cowrieAmount, setCowrieAmount] = React.useState('')
  const [showPollCreator, setShowPollCreator] = React.useState(false)
  const [pollQuestion, setPollQuestion] = React.useState('')
  const [pollOpts, setPollOpts] = React.useState(['', '', '', ''])
  const [griotLoading, setGriotLoading] = React.useState(false)
  const [showTrustBanner, setShowTrustBanner] = React.useState(false)
  const [translatingId, setTranslatingId] = React.useState<string | null>(null)
  const [drumToVillageMsg, setDrumToVillageMsg] = React.useState<Msg | null>(null)

  /* ── business escrow state machine ── */
  type EscrowStatus = 'OPEN' | 'LOCKED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETE' | 'SEALED' | 'DISPUTED'
  const [escrowStatus, setEscrowStatus] = React.useState<EscrowStatus>(
    chatType === 'business' ? 'IN_TRANSIT' : 'OPEN'
  )
  const [escrowAmount] = React.useState(42000)
  const [escrowLoading, setEscrowLoading] = React.useState(false)

  /* inject CSS once */
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(INJECT_ID)) return
    const s = document.createElement('style')
    s.id = INJECT_ID
    s.textContent = STYLES
    document.head.appendChild(s)
  }, [])

  /* ── wire API: fetch messages from backend on mount ── */
  React.useEffect(() => {
    sesoChatApi.listMessages(threadId).then((res: any) => {
      const apiMsgs = res?.data
      if (Array.isArray(apiMsgs) && apiMsgs.length > 0) {
        const mapped: Msg[] = apiMsgs.map((m: any) => ({
          id: m.id || `api-${Date.now()}-${Math.random()}`,
          type: (m.type || 'text').toLowerCase().replace(/-/g, '_') as Msg['type'],
          sender: m.senderName || m.sender || 'Unknown',
          senderRole: m.senderRole,
          isMe: m.isMe ?? m.senderId === 'me',
          content: m.body || m.content || '',
          localName: m.localName,
          voiceSec: m.voiceSec || m.audioDuration,
          cowrieAmt: m.cowrieAmt || m.amount,
          cowrieStatus: m.cowrieStatus,
          tradeProduct: m.tradeProduct,
          tradeAmount: m.tradeAmount,
          tradeStatus: m.tradeStatus,
          pollOptions: m.pollOptions,
          translations: m.translations,
          time: m.time || new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: m.location,
          device: m.device,
          keeperCount: m.keeperCount,
          approvers: m.approvers,
          reason: m.reason,
          codeLanguage: m.codeLanguage,
          lat: m.lat,
          lng: m.lng,
          feedAuthor: m.feedAuthor,
          feedPreview: m.feedPreview,
          feedHeat: m.feedHeat,
        }))
        setMessages(mapped)
      }
      // If API returns empty/fails, keep mock messages (already set as initial state)
    }).catch(() => {
      // Keep mock messages as fallback — no-op
    })
  }, [threadId])

  /* ── trust tier upgrade: show banner after 20+ messages ── */
  React.useEffect(() => {
    if (chatType === 'personal' && messages.length >= 20) {
      setShowTrustBanner(true)
    }
  }, [messages.length, chatType])

  /* auto-scroll */
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* call timer */
  React.useEffect(() => {
    if (callState === 'video' || callState === 'audio') {
      callIntervalRef.current = setInterval(() => setCallTimer(t => t + 1), 1000)
    } else {
      setCallTimer(0)
      if (callIntervalRef.current) clearInterval(callIntervalRef.current)
    }
    return () => { if (callIntervalRef.current) clearInterval(callIntervalRef.current) }
  }, [callState])

  /* simulate incoming call after 8s (demo) */
  React.useEffect(() => {
    if (chatType !== 'personal' && chatType !== 'family') return
    const t = setTimeout(() => {
      if (callState === 'idle') setCallState('ringing-in')
    }, 8000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startCall = (type: 'video' | 'audio') => {
    setCallState('ringing-out')
    setTimeout(() => setCallState(type), 2500)
  }
  const endCall = () => { setCallState('idle'); setCallMuted(false); setCallCamOff(false); setCallSpeaker(false) }
  const acceptCall = (type: 'video' | 'audio') => setCallState(type)
  const fmtTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  /* toast helper */
  const flash = React.useCallback((msg: string) => {
    setToast(msg)
    setToastOut(false)
    setTimeout(() => setToastOut(true), 1800)
    setTimeout(() => { setToast(null); setToastOut(false) }, 2200)
  }, [])

  /* long-press / message actions */
  const openActions = (msg: Msg) => { if (msg.type === 'system') return; setActionMsg(msg) }
  const startLP = (msg: Msg) => {
    if (msg.type === 'system') return
    lpRef.current = setTimeout(() => openActions(msg), 480)
  }
  const cancelLP = () => { if (lpRef.current) clearTimeout(lpRef.current) }
  const addReact = (msgId: string, emoji: string) => {
    setReactions(prev => {
      const cur = prev[msgId] || []
      return cur.includes(emoji) ? { ...prev, [msgId]: cur.filter(e => e !== emoji) } : { ...prev, [msgId]: [...cur, emoji] }
    })
    setActionMsg(null)
  }
  const doStar = (msgId: string) => {
    setStarred(prev => { const s = new Set(prev); s.has(msgId) ? s.delete(msgId) : s.add(msgId); return s })
    setActionMsg(null)
    flash(starred.has(msgId) ? '⭐ Unstarred' : '⭐ Starred')
  }
  const doDelete = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId))
    setActionMsg(null)
    flash('🗑 Message deleted')
  }
  const doCopy = (content?: string) => {
    if (content) navigator.clipboard?.writeText(content).catch(() => {})
    setActionMsg(null)
    flash('📋 Copied')
  }

  /* send handler */
  const handleSend = () => {
    if (!input.trim()) return
    const body = replyTo ? `\u21a9 ${replyTo.sender}: "${replyTo.content?.slice(0, 40)}${(replyTo.content?.length ?? 0) > 40 ? '\u2026' : ''}"\n${input.trim()}` : input.trim()
    const newMsg: Msg = {
      id: `m-${Date.now()}`, type: 'text', sender: 'Me', isMe: true,
      content: body,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...(chatType === 'business' ? { senderRole: 'BUYER' as const } : {}),
    }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setReplyTo(null)

    /* wire API: send message to backend (fire-and-forget with fallback) */
    sesoChatApi.sendMessage(threadId, { body, type: 'text' }).catch(() => {
      // API failed — message already added locally, no-op
    })

    /* mock reply */
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const replies: Record<ChatType, Msg> = {
        personal: { id: `r-${Date.now()}`, type: 'text', sender: 'Chioma', isMe: false, content: 'I hear you. Let me check the trade ledger. 📜', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), translations: { yo: 'Mo gbọ́ ohun tẹ́ ẹ sọ. Ẹ jẹ́ kí n wo ìwé àkọsílẹ̀ òwò náà.' } },
        business: { id: `r-${Date.now()}`, type: 'text', sender: 'Chioma (Seller)', senderRole: 'SELLER', isMe: false, content: 'Noted. I\'ll prepare the goods for inspection.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        group: { id: `r-${Date.now()}`, type: 'text', sender: 'Kofi', senderRole: 'MEMBER', isMe: false, content: 'Interested! Let\'s open a trade session.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        family: { id: `r-${Date.now()}`, type: 'text', sender: 'Mama', localName: 'Iya', isMe: false, content: 'Thank you, my child. We are waiting for you. 🙏', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      }
      setMessages(prev => [...prev, replies[chatType]])
    }, 1500 + Math.random() * 1000)
  }

  /* theme colors per type */
  const theme = chatType === 'family'
    ? { bg: '#0f0212', accent: C.purple, accentL: C.purpleL, bubbleMe: C.purple, bubbleThem: '#2a1033', borderAccent: 'rgba(124,58,237,0.25)' }
    : chatType === 'business'
    ? { bg: C.earthD, accent: C.gold, accentL: C.goldL, bubbleMe: C.green, bubbleThem: '#0d140e', borderAccent: 'rgba(212,160,23,0.25)' }
    : chatType === 'group'
    ? { bg: C.earthD, accent: C.green, accentL: C.greenL, bubbleMe: C.green, bubbleThem: '#0d140e', borderAccent: 'rgba(26,124,62,0.25)' }
    : { bg: C.earthD, accent: C.green, accentL: C.greenL, bubbleMe: C.green, bubbleThem: '#0d140e', borderAccent: 'rgba(26,124,62,0.25)' }

  const LANGS: Lang[] = ['EN', 'YO', 'IG', 'HA', 'SW', 'ZU', 'AR']

  /* role colors for business */
  const roleColor = (role?: string) => {
    switch (role) {
      case 'BUYER': return { bg: 'rgba(26,124,62,0.12)', text: C.greenL, border: 'rgba(26,124,62,0.25)' }
      case 'SELLER': return { bg: 'rgba(224,123,0,0.12)', text: C.amber, border: 'rgba(224,123,0,0.25)' }
      case 'RUNNER': return { bg: 'rgba(59,130,246,0.12)', text: C.blueL, border: 'rgba(59,130,246,0.25)' }
      case 'ELDER': return { bg: 'rgba(124,58,237,0.12)', text: C.purpleL, border: 'rgba(124,58,237,0.25)' }
      default: return { bg: 'rgba(255,255,255,0.05)', text: C.textDim, border: 'rgba(255,255,255,0.08)' }
    }
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /* RENDER MESSAGE BUBBLE                                           */
  /* ═══════════════════════════════════════════════════════════════ */
  const renderMessage = (msg: Msg, idx: number) => {
    const delay = `${Math.min(idx * 0.04, 0.4)}s`

    /* system event */
    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="st-bubble" style={{ animationDelay: delay, textAlign: 'center', padding: '10px 20px', margin: '6px 0' }}>
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 99,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: 'Sora, sans-serif',
          }}>{msg.content}</span>
        </div>
      )
    }

    /* griot insight */
    if (msg.type === 'griot') {
      return (
        <div key={msg.id} className="st-bubble" style={{
          animationDelay: delay, alignSelf: 'center', maxWidth: '90%', margin: '8px 18px',
          padding: '12px 16px', borderRadius: 14,
          background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: C.goldL, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>🦅 Griot Insight</div>
          <p style={{ fontSize: 13, color: C.goldL, fontStyle: 'italic', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{msg.content}</p>
        </div>
      )
    }

    /* poll (group) */
    if (msg.type === 'poll' && msg.pollOptions) {
      const totalVotes = msg.pollOptions.reduce((s, o) => s + o.votes, 0)
      return (
        <div key={msg.id} className="st-bubble" style={{
          animationDelay: delay, margin: '8px 18px', padding: 16, borderRadius: 14,
          background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>📊</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{msg.sender}</span>
            <span style={{ fontSize: 10, color: C.textDim2, fontWeight: 600 }}>{msg.time}</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 12px 0' }}>{msg.content}</p>
          {msg.pollOptions.map((opt, i) => {
            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
            return (
              <div key={i} onClick={() => flash(`Voted: ${opt.label}`)} style={{
                position: 'relative', marginBottom: 8, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
                  background: 'rgba(26,124,62,0.1)', borderRadius: 10, transition: 'width .5s',
                }} />
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{opt.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.greenL }}>{pct}%</span>
                </div>
              </div>
            )
          })}
          <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 600, marginTop: 4 }}>{totalVotes} votes</div>
        </div>
      )
    }

    /* blood call (family) */
    if (msg.type === 'blood_call') {
      return (
        <div key={msg.id} className="st-bubble" style={{
          animationDelay: delay, margin: '12px 18px', padding: '16px 20px', borderRadius: 16,
          background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)',
          boxShadow: '0 0 20px rgba(220,38,38,0.3)', animation: 'stBreathe 2s infinite, stBubbleIn .3s ease both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>🚨</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', fontFamily: 'Sora, sans-serif', color: '#fff', letterSpacing: '0.05em' }}>BLOOD-CALL SOS</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{msg.sender} ({msg.localName}) Needs Help</div>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginBottom: 14, fontWeight: 500 }}>
            📍 Last known location: {msg.location}
          </div>
          <button onClick={() => flash('GPS tracking initiated')} style={{
            width: '100%', padding: 12, background: '#fff', color: '#b91c1c', border: 'none',
            borderRadius: 99, fontWeight: 800, fontSize: 13, cursor: 'pointer',
            fontFamily: 'Sora, sans-serif',
          }}>View Live GPS & Respond</button>
        </div>
      )
    }

    /* vault request (family) */
    if (msg.type === 'vault_request') {
      return (
        <div key={msg.id} className="st-bubble" style={{
          animationDelay: delay, margin: '12px 18px', padding: '16px 20px', borderRadius: 16,
          background: '#1e293b', border: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 24 }}>🏛</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.text, fontFamily: 'Sora, sans-serif' }}>Ancestral Vault Unlock</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Requested by {msg.sender}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, marginBottom: 14, fontStyle: 'italic', color: '#94a3b8' }}>Reason: &ldquo;{msg.reason}&rdquo;</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 6, background: '#0f172a', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((msg.approvers || 0) / 2) * 100}%`, background: C.blue, borderRadius: 99, transition: 'width .5s' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.blueL }}>{msg.approvers || 0} / 2 Keys</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => flash(VOCAB.vaultKey)} style={{
              flex: 1, padding: 10, background: C.blue, color: '#fff', border: 'none',
              borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>{VOCAB.vaultKey}</button>
            <button onClick={() => flash(VOCAB.denyKey)} style={{
              flex: 1, padding: 10, background: '#0f172a', color: C.redL, border: '1px solid #334155',
              borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>{VOCAB.denyKey}</button>
          </div>
        </div>
      )
    }

    /* recovery request (family) */
    if (msg.type === 'recovery') {
      return (
        <div key={msg.id} className="st-bubble" style={{
          animationDelay: delay, margin: '12px 18px', padding: '16px 20px', borderRadius: 16,
          background: '#4c1d95', border: '1px solid #7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 24 }}>🥁</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', fontFamily: 'Sora, sans-serif', color: '#fff', letterSpacing: '0.05em' }}>RECOVERY REQUEST</div>
              <div style={{ fontSize: 12, color: '#e9d5ff', fontWeight: 500 }}>{msg.sender} is requesting account recovery</div>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, fontSize: 12, color: '#d8b4fe', marginBottom: 14 }}>
            <div style={{ marginBottom: 4 }}>📱 Device: {msg.device}</div>
            <div style={{ marginBottom: 4 }}>📍 Location: {msg.location}</div>
            <div>🕒 Time: {msg.time}</div>
          </div>
          {!recoveryApproved && !recoveryForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => setRecoveryForm(true)} style={{
                padding: 12, background: '#fff', color: '#4c1d95', border: 'none',
                borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer',
              }}>Answer Security Question</button>
              <button onClick={() => flash(VOCAB.reportSuspect)} style={{
                padding: 12, background: 'rgba(220,38,38,0.15)', color: C.redL,
                border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}>{VOCAB.reportSuspect}</button>
            </div>
          )}
          {!recoveryApproved && recoveryForm && (
            <div style={{ background: '#2e1065', padding: 14, borderRadius: 12, marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Security Challenge:</div>
              <div style={{ fontSize: 12, fontStyle: 'italic', color: '#d8b4fe', marginBottom: 12 }}>&ldquo;What is {msg.sender}&apos;s childhood nickname?&rdquo;</div>
              <input
                value={culturalAnswer} onChange={e => setCulturalAnswer(e.target.value)}
                placeholder="Type the answer here..."
                style={{ width: '100%', padding: '10px 12px', background: '#111', border: '1px solid #4c1d95', borderRadius: 6, color: '#fff', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setRecoveryApproved(true); setRecoveryForm(false); flash(VOCAB.approveRecovery) }}
                  disabled={!culturalAnswer.trim()}
                  style={{ flex: 1, padding: 10, background: culturalAnswer.trim() ? '#22c55e' : 'rgba(34,197,94,0.3)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: culturalAnswer.trim() ? 'pointer' : 'default' }}
                >{VOCAB.approveRecovery}</button>
                <button onClick={() => setRecoveryForm(false)} style={{ padding: 10, background: 'transparent', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>{VOCAB.cancel}</button>
              </div>
            </div>
          )}
          {recoveryApproved && (
            <div style={{ padding: 12, background: 'rgba(34,197,94,0.15)', color: C.greenL, borderRadius: 8, textAlign: 'center', fontWeight: 700, fontSize: 12, border: '1px solid rgba(34,197,94,0.3)' }}>
              ✅ You approved this recovery. Waiting for 1 more Bloodline member.
            </div>
          )}
        </div>
      )
    }

    /* trade card */
    if (msg.type === 'trade_card') {
      return (
        <div key={msg.id} className="st-bubble" style={{
          animationDelay: delay, margin: '8px 18px', padding: 14, borderRadius: 14,
          background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🧺</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{msg.tradeProduct}</div>
                <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 600, marginTop: 2 }}>{msg.sender} · {msg.time}</div>
              </div>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
              background: msg.tradeStatus === 'OPEN' ? 'rgba(74,222,128,0.1)' : 'rgba(224,123,0,0.1)',
              color: msg.tradeStatus === 'OPEN' ? C.greenL : C.amber,
              border: `1px solid ${msg.tradeStatus === 'OPEN' ? 'rgba(74,222,128,0.2)' : 'rgba(224,123,0,0.2)'}`,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{msg.tradeStatus}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: C.goldL, fontFamily: 'Sora, sans-serif' }}>{msg.tradeAmount}</span>
            <button onClick={() => flash(VOCAB.openTrade)} style={{
              padding: '8px 16px', borderRadius: 10, background: C.green, border: `1px solid ${C.greenL}`,
              color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
            }}>{VOCAB.openTrade}</button>
          </div>
        </div>
      )
    }

    /* voice note — FEATURE 6: Voice Proverb Cards with kente-pattern border */
    if (msg.type === 'voice') {
      return (
        <div key={msg.id} className="st-bubble" style={{ animationDelay: delay, display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start', padding: '4px 18px' }}>
          <div style={{ maxWidth: '80%' }}>
            {!msg.isMe && chatType === 'family' && msg.localName && (
              <div style={{ fontSize: 10, color: C.purpleL, fontWeight: 700, marginBottom: 3, marginLeft: 4 }}>
                {msg.sender} · <span style={{ color: C.goldL }}>{msg.localName}</span>
              </div>
            )}
            {!msg.isMe && chatType !== 'family' && (
              <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, marginBottom: 3, marginLeft: 4 }}>{msg.sender}</div>
            )}
            <div style={{
              padding: '10px 14px', borderRadius: 18,
              borderTopLeftRadius: msg.isMe ? 18 : 4, borderTopRightRadius: msg.isMe ? 4 : 18,
              background: msg.isMe ? theme.bubbleMe : theme.bubbleThem,
              border: `1px solid ${msg.isMe ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
              /* Kente-pattern decorative border */
              borderImage: !msg.isMe ? 'repeating-linear-gradient(90deg, #d4a017 0px, #d4a017 4px, #1a7c3e 4px, #1a7c3e 8px, #b22222 8px, #b22222 12px, #fbbf24 12px, #fbbf24 16px) 2' : 'none',
              borderWidth: !msg.isMe ? '0 0 3px 0' : undefined,
              borderStyle: !msg.isMe ? 'solid' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => flash('Playing voice...')} style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, cursor: 'pointer', color: '#fff',
                }}>▶</button>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} style={{ width: 2, borderRadius: 1, background: msg.isMe ? 'rgba(255,255,255,0.5)' : `${theme.accentL}60`, height: `${15 + Math.random() * 85}%` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{msg.voiceSec}s · Spirit Voice Ready</span>
                </div>
              </div>
            </div>
            {/* auto-transcript area placeholder */}
            {!msg.isMe && (
              <div style={{ marginTop: 4, marginLeft: 4, padding: '6px 10px', borderRadius: 8, background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.1)', fontSize: 10, color: C.textDim, fontStyle: 'italic' }}>
                🎙 Tap to auto-transcribe with Spirit Voice
              </div>
            )}
            {/* translation toggle */}
            {!msg.isMe && msg.translations && (
              <div style={{ marginTop: 4, marginLeft: 4 }}>
                <button onClick={() => setShowTranslation(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))} style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 9, fontWeight: 800, color: theme.accentL, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{showTranslation[msg.id] ? 'Hide' : 'Translate'} 🎙</button>
                {showTranslation[msg.id] && (
                  <p className="st-slide" style={{ fontSize: 12, color: theme.accentL, fontStyle: 'italic', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    &ldquo;{Object.values(msg.translations)[0]}&rdquo;
                  </p>
                )}
              </div>
            )}
            <div style={{ fontSize: 9, color: C.textDim2, fontWeight: 600, marginTop: 4, textAlign: msg.isMe ? 'right' : 'left', marginLeft: msg.isMe ? 0 : 4, marginRight: msg.isMe ? 4 : 0 }}>{msg.time}</div>
          </div>
        </div>
      )
    }

    /* cowrie transfer */
    if (msg.type === 'cowrie') {
      return (
        <div key={msg.id} className="st-bubble" style={{ animationDelay: delay, display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start', padding: '4px 18px' }}>
          <div style={{
            padding: '12px 16px', borderRadius: 14,
            background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)',
            maxWidth: '75%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🐚</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.goldL, fontFamily: 'Sora, sans-serif' }}>₡{msg.cowrieAmt?.toLocaleString()}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.greenL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{msg.cowrieStatus}</div>
              </div>
            </div>
            <div style={{ fontSize: 9, color: C.textDim2, fontWeight: 600, marginTop: 6 }}>{msg.sender} · {msg.time}</div>
          </div>
        </div>
      )
    }

    /* ── FEATURE 1: Developer Drum Circle (CODE_BLOCK) ── */
    if (msg.type === 'code_block') {
      return (
        <div key={msg.id} className="st-bubble" style={{ animationDelay: delay, padding: '4px 18px', display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start' }}>
          <div style={{ maxWidth: '90%' }}>
            {!msg.isMe && <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, marginBottom: 3, marginLeft: 4 }}>{msg.sender}</div>}
            <div style={{
              padding: '4px 0', borderRadius: 14, overflow: 'hidden',
              background: '#1e1e2e', border: '1px solid rgba(139,233,253,0.15)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                padding: '6px 14px', background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 10 }}>💻</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#8be9fd', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
                  {msg.codeLanguage || 'Code'} Drum Circle
                </span>
                <div style={{ flex: 1 }} />
                <button onClick={() => { navigator.clipboard?.writeText(msg.content || ''); flash('📋 Code copied') }} style={{
                  background: 'none', border: 'none', fontSize: 10, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px 6px',
                }}>Copy</button>
              </div>
              <pre style={{
                margin: 0, padding: '12px 14px', fontSize: 12, lineHeight: 1.6,
                fontFamily: "'Fira Code', 'SF Mono', Monaco, monospace",
                color: '#f8f8f2', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {(msg.content || '').split('\n').map((line, li) => (
                  <div key={li}>
                    <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, marginRight: 12, userSelect: 'none' }}>{li + 1}</span>
                    {line.replace(/(\/\/.*$|#.*$)/gm, '\u001b[comment]$1').split(/(\b(?:const|let|var|function|return|if|else|import|export|from|async|await)\b)/g).map((part, pi) => (
                      <span key={pi} style={{
                        color: /^(const|let|var|function|return|if|else|import|export|from|async|await)$/.test(part) ? '#ff79c6'
                          : /^(\/\/|#)/.test(part) ? '#6272a4'
                          : /^['"`]/.test(part) ? '#f1fa8c'
                          : /^\d+$/.test(part) ? '#bd93f9'
                          : '#f8f8f2',
                      }}>{part}</span>
                    ))}
                  </div>
                ))}
              </pre>
            </div>
            <div style={{ fontSize: 9, color: C.textDim2, fontWeight: 600, marginTop: 4, textAlign: msg.isMe ? 'right' : 'left', marginLeft: msg.isMe ? 0 : 4 }}>{msg.time}</div>
          </div>
        </div>
      )
    }

    /* ── FEATURE 5: Cowrie Transfer message bubble ── */
    if (msg.type === 'cowrie_transfer') {
      return (
        <div key={msg.id} className="st-bubble" style={{ animationDelay: delay, display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start', padding: '4px 18px' }}>
          <div style={{
            padding: '14px 18px', borderRadius: 16, maxWidth: '75%',
            background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(251,191,36,0.08))',
            border: '2px solid rgba(212,160,23,0.35)',
            boxShadow: '0 4px 20px rgba(212,160,23,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>🐚</div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.goldL, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Sora, sans-serif' }}>Cowrie Transfer</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', fontFamily: 'Sora, sans-serif', marginTop: 2 }}>₡{msg.cowrieAmt?.toLocaleString()}</div>
              </div>
            </div>
            {msg.content && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8, fontStyle: 'italic' }}>{msg.content}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 9, color: C.textDim2, fontWeight: 600 }}>{msg.sender} · {msg.time}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: C.greenL, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>SENT</span>
            </div>
          </div>
        </div>
      )
    }

    /* ── FEATURE 8: Location Pin message bubble ── */
    if (msg.type === 'location_pin') {
      return (
        <div key={msg.id} className="st-bubble" style={{ animationDelay: delay, display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start', padding: '4px 18px' }}>
          <div style={{
            padding: '12px 16px', borderRadius: 14, maxWidth: '75%',
            background: msg.isMe ? 'rgba(26,124,62,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${msg.isMe ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.06)'}`,
          }}>
            {!msg.isMe && <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, marginBottom: 4 }}>{msg.sender}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>📍</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Location Shared</div>
                <div style={{ fontSize: 10, color: C.textDim, fontWeight: 500, marginTop: 2 }}>
                  {msg.lat ? `${msg.lat.toFixed(4)}, ${msg.lng?.toFixed(4)}` : msg.location || 'Position sent'}
                </div>
              </div>
            </div>
            {/* Map placeholder */}
            <div style={{
              marginTop: 8, height: 80, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(26,124,62,0.08), rgba(59,130,246,0.08))',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: C.textDim, fontWeight: 600,
            }}>Tap to open in Maps</div>
            <div style={{ fontSize: 9, color: C.textDim2, fontWeight: 600, marginTop: 4, textAlign: msg.isMe ? 'right' : 'left' }}>{msg.time}</div>
          </div>
        </div>
      )
    }

    /* ── FEATURE 9: Feed Post Sharing preview card ── */
    if (msg.type === 'feed_share') {
      const heat = msg.feedHeat ?? 50
      return (
        <div key={msg.id} className="st-bubble" style={{ animationDelay: delay, display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start', padding: '4px 18px' }}>
          <div style={{
            padding: '14px 16px', borderRadius: 14, maxWidth: '80%',
            background: 'rgba(26,124,62,0.06)', border: '1px solid rgba(26,124,62,0.2)',
          }}>
            {!msg.isMe && <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, marginBottom: 6 }}>{msg.sender} shared a post</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(26,124,62,0.15)', border: '1px solid rgba(26,124,62,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>🥁</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{msg.feedAuthor || 'Village Member'}</div>
                <div style={{ fontSize: 9, color: C.textDim2, fontWeight: 600 }}>Soro Soke Feed</div>
              </div>
            </div>
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              fontSize: 12, color: C.textDim, fontWeight: 500, lineHeight: 1.5,
              overflow: 'hidden', maxHeight: 60,
            }}>{msg.feedPreview || msg.content || 'Shared post'}</div>
            {/* Heat bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(heat, 100)}%`, height: '100%', background: heat > 75 ? '#ef4444' : heat > 40 ? C.goldL : C.greenL, borderRadius: 99, transition: 'width .5s' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, color: heat > 75 ? '#ef4444' : heat > 40 ? C.goldL : C.greenL }}>🔥 {heat}</span>
            </div>
            <div style={{ fontSize: 9, color: C.textDim2, fontWeight: 600, marginTop: 4, textAlign: msg.isMe ? 'right' : 'left' }}>{msg.time}</div>
          </div>
        </div>
      )
    }

    /* ── FEATURE 7: Griot AI Wisdom message bubble ── */
    if (msg.type === 'griot_insight') {
      return (
        <div key={msg.id} className="st-bubble" style={{
          animationDelay: delay, alignSelf: 'center', maxWidth: '90%', margin: '8px 18px',
          padding: '14px 18px', borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(212,160,23,0.06))',
          border: '1px solid rgba(124,58,237,0.25)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🧙</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: C.purpleL, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Sora, sans-serif' }}>Griot AI Wisdom</span>
          </div>
          <p style={{ fontSize: 13, color: '#e9d5ff', fontStyle: 'italic', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{msg.content}</p>
          <div style={{ fontSize: 9, color: C.textDim2, fontWeight: 600, marginTop: 6, textAlign: 'right' }}>{msg.time}</div>
        </div>
      )
    }

    /* ── regular text bubble ── */
    const msgReactions = reactions[msg.id] || []
    const isStarred = starred.has(msg.id)
    return (
      <div key={msg.id} className="st-bubble" style={{
        animationDelay: delay, display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start',
        padding: '4px 18px',
      }}>
        <div style={{ maxWidth: '80%' }}>
          {/* sender label */}
          {!msg.isMe && (
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 3, marginLeft: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {msg.senderRole && (
                <span style={{
                  fontSize: 8, fontWeight: 800, padding: '1px 6px', borderRadius: 4,
                  background: roleColor(msg.senderRole).bg,
                  color: roleColor(msg.senderRole).text,
                  border: `1px solid ${roleColor(msg.senderRole).border}`,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{msg.senderRole}</span>
              )}
              <span style={{ color: chatType === 'family' ? C.purpleL : C.textDim }}>{msg.sender}</span>
              {/* Tiny rank badge — emoji only (space is tight) */}
              {msg.senderXp != null
                ? <span title={getRankFromXP(msg.senderXp).name} style={{ fontSize: 11, lineHeight: 1 }}>{getRankFromXP(msg.senderXp).emoji}</span>
                : <span title="Rank unknown" style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', lineHeight: 1 }}>⬡</span>
              }
              {chatType === 'family' && msg.localName && (
                <span style={{ color: C.goldL, fontSize: 10 }}>· {msg.localName}</span>
              )}
            </div>
          )}

          {/* bubble — long press activates action menu */}
          <div
            onMouseDown={() => startLP(msg)}
            onMouseUp={cancelLP}
            onMouseLeave={cancelLP}
            onTouchStart={() => startLP(msg)}
            onTouchEnd={cancelLP}
            onContextMenu={e => { e.preventDefault(); openActions(msg) }}
            style={{
              padding: '10px 14px', borderRadius: 18,
              borderTopLeftRadius: msg.isMe ? 18 : 4, borderTopRightRadius: msg.isMe ? 4 : 18,
              background: msg.isMe ? theme.bubbleMe : theme.bubbleThem,
              border: `1px solid ${msg.isMe ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: msg.isMe ? `0 4px 12px rgba(0,0,0,0.15)` : 'none',
              cursor: 'pointer', userSelect: 'none',
              outline: isStarred ? `1.5px solid ${C.goldL}40` : 'none',
            }}
          >
            {isStarred && <span style={{ fontSize: 8, color: C.goldL, display: 'block', marginBottom: 3 }}>⭐ Starred</span>}
            <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, color: msg.isMe ? '#f0f7f0' : C.text, fontWeight: 500, fontFamily: 'Inter, sans-serif', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          </div>

          {/* reaction pills */}
          {msgReactions.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', justifyContent: msg.isMe ? 'flex-end' : 'flex-start' }}>
              {msgReactions.map((emoji, ei) => (
                <button key={ei} onClick={() => addReact(msg.id, emoji)} className="st-react-in" style={{
                  padding: '2px 8px', borderRadius: 99, fontSize: 13,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer', color: C.text,
                }}>{emoji}</button>
              ))}
            </div>
          )}

          {/* translation — FEATURE 14: Spirit Voice Translation wired to API */}
          {!msg.isMe && (
            <div style={{ marginTop: 4, marginLeft: 4 }}>
              {msg.translations ? (
                <>
                  <button onClick={() => setShowTranslation(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))} style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontSize: 9, fontWeight: 800, color: theme.accentL, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{showTranslation[msg.id] ? 'Hide Original' : 'Translate with Spirit Voice'} 🎙</button>
                  {showTranslation[msg.id] && (
                    <p className="st-slide" style={{ fontSize: 12, color: theme.accentL, fontStyle: 'italic', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      &ldquo;{Object.values(msg.translations)[0]}&rdquo;
                    </p>
                  )}
                </>
              ) : (
                <>
                  <button onClick={() => {
                    if (translatingId === msg.id) return
                    setTranslatingId(msg.id)
                    sesoChatApi.translate(msg.id, 'en').then((res: any) => {
                      const translated = res?.translatedText || res?.data?.translatedText || 'Translation unavailable'
                      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, translatedText: translated } : m))
                    }).catch(() => {
                      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, translatedText: '(Translation failed)' } : m))
                    }).finally(() => setTranslatingId(null))
                  }} style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontSize: 9, fontWeight: 800, color: theme.accentL, textTransform: 'uppercase', letterSpacing: '0.05em',
                    opacity: translatingId === msg.id ? 0.5 : 1,
                  }}>{translatingId === msg.id ? 'Translating...' : '🌍 Translate'}</button>
                  {msg.translatedText && (
                    <p className="st-slide" style={{ fontSize: 12, color: theme.accentL, fontStyle: 'italic', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      &ldquo;{msg.translatedText}&rdquo;
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* time + read receipt */}
          <div style={{
            fontSize: 9, color: C.textDim2, fontWeight: 600, marginTop: 4,
            textAlign: msg.isMe ? 'right' : 'left', marginLeft: msg.isMe ? 0 : 4, marginRight: msg.isMe ? 4 : 0,
            display: 'flex', alignItems: 'center', gap: 4, justifyContent: msg.isMe ? 'flex-end' : 'flex-start',
          }}>
            <span>{msg.time}</span>
            {msg.isMe && <span style={{ color: C.greenL, fontSize: 9 }}>✓✓</span>}
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /* FAMILY SUB-TABS                                                 */
  /* ═══════════════════════════════════════════════════════════════ */
  const renderFamilyTree = () => (
    <div className="st-fade" style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* mini SVG tree */}
      <div style={{ position: 'relative', width: 260, height: 280 }}>
        <svg viewBox="0 0 260 280" width="260" height="280" style={{ position: 'absolute', top: 0, left: 0 }}>
          <line x1="130" y1="40" x2="70" y2="120" stroke={C.purpleL} strokeWidth="1.5" opacity="0.3" />
          <line x1="130" y1="40" x2="190" y2="120" stroke={C.purpleL} strokeWidth="1.5" opacity="0.3" />
          <line x1="70" y1="120" x2="40" y2="200" stroke={C.purpleL} strokeWidth="1.5" opacity="0.3" />
          <line x1="70" y1="120" x2="100" y2="200" stroke={C.purpleL} strokeWidth="1.5" opacity="0.3" />
          <line x1="190" y1="120" x2="160" y2="200" stroke={C.purpleL} strokeWidth="1.5" opacity="0.3" />
          <line x1="190" y1="120" x2="220" y2="200" stroke={C.purpleL} strokeWidth="1.5" opacity="0.3" />
          <line x1="130" y1="40" x2="130" y2="250" stroke={C.goldL} strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />
        </svg>
        {/* nodes */}
        {[{ x: 110, y: 18, emoji: '👑', name: 'Grandpa', kin: 'Baba Ńlá' },
          { x: 50, y: 98, emoji: '👩', name: 'Mama', kin: 'Iya' },
          { x: 170, y: 98, emoji: '👨', name: 'Papa', kin: 'Baba' },
          { x: 20, y: 178, emoji: '👤', name: 'You', kin: 'Ọmọ' },
          { x: 80, y: 178, emoji: '👦', name: 'Kwame', kin: 'Egbon' },
          { x: 140, y: 178, emoji: '👧', name: 'Fatima', kin: 'Anti' },
          { x: 200, y: 178, emoji: '👶', name: 'Umoh', kin: 'Aburo' },
        ].map((n, i) => (
          <div key={i} style={{ position: 'absolute', left: n.x, top: n.y, textAlign: 'center', width: 40 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(124,58,237,0.12)', border: `2px solid ${i === 3 ? C.greenL : C.purpleL}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              boxShadow: i === 3 ? `0 0 12px ${C.greenL}30` : 'none',
            }}>{n.emoji}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.text, marginTop: 3 }}>{n.name}</div>
            <div style={{ fontSize: 8, fontWeight: 600, color: C.goldL }}>{n.kin}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 600, textAlign: 'center' }}>7 verified bloodline members · Quorum 2 of 3</div>
      <button onClick={() => router.push('/dashboard/family-tree')} style={{
        padding: '10px 24px', borderRadius: 12, background: C.purple, border: `1px solid ${C.purpleL}`,
        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
      }}>Edit Family Tree →</button>
    </div>
  )

  const renderFamilyVault = () => (
    <div className="st-fade" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* quorum status */}
      <div style={{ padding: 14, borderRadius: 14, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.purpleL, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>🔐 Vault Quorum Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '33%', background: C.purpleL, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.purpleL }}>1 / 3 Keys</span>
        </div>
      </div>

      {/* documents */}
      {[
        { icon: '📜', name: 'Ancestral Land Deed', status: 'LOCKED', date: 'Added Jan 2024' },
        { icon: '💍', name: 'Marriage Certificate', status: 'ACCESSIBLE', date: 'Added Mar 2023' },
        { icon: '🏠', name: 'Property Title', status: 'LOCKED', date: 'Added Sep 2024' },
      ].map((doc, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
          background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontSize: 22 }}>{doc.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{doc.name}</div>
            <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 600, marginTop: 2 }}>{doc.date}</div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
            background: doc.status === 'LOCKED' ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.08)',
            color: doc.status === 'LOCKED' ? C.redL : C.greenL,
            border: `1px solid ${doc.status === 'LOCKED' ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'}`,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{doc.status === 'LOCKED' ? '🔒' : '✓'} {doc.status}</span>
        </div>
      ))}
    </div>
  )

  const renderFamilyCowrie = () => (
    <div className="st-fade" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* balance card */}
      <div style={{
        padding: 20, borderRadius: 16, textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(212,160,23,0.1))',
        border: '1px solid rgba(124,58,237,0.25)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>Family Cowrie Pot</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: C.goldL, fontFamily: 'Sora, sans-serif' }}>₡847,500</div>
        <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginTop: 4 }}>Across 7 members · 3 Ajo circles active</div>
      </div>

      {/* ajo circles */}
      <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Sora, sans-serif' }}>Active Ajo Circles</div>
      {[
        { name: 'Monthly Savings', amount: '₡150,000 / month', members: 5, next: 'Your turn: April' },
        { name: 'Emergency Fund', amount: '₡50,000', members: 7, next: 'Pot: ₡350,000' },
        { name: 'Education Fund', amount: '₡75,000 / month', members: 4, next: 'Pot: ₡225,000' },
      ].map((ajo, i) => (
        <div key={i} style={{
          padding: 14, borderRadius: 14,
          background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{ajo.name}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.goldL }}>{ajo.amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: C.textDim2, fontWeight: 600 }}>{ajo.members} members</span>
            <span style={{ fontSize: 10, color: C.greenL, fontWeight: 600 }}>{ajo.next}</span>
          </div>
        </div>
      ))}
    </div>
  )

  /* ═══════════════════════════════════════════════════════════════ */
  /* RENDER                                                          */
  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="st-fade st-no-scroll" style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: theme.bg, color: C.text, fontFamily: 'DM Sans, Inter, sans-serif',
      maxWidth: 480, margin: '0 auto',
      borderLeft: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${theme.borderAccent}`,
        background: `linear-gradient(180deg, ${chatType === 'family' ? 'rgba(124,58,237,0.06)' : 'rgba(26,124,62,0.04)'}, transparent)`,
        flexShrink: 0,
      }}>
        <button onClick={() => router.back()} style={{
          width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, cursor: 'pointer', color: C.text, flexShrink: 0,
        }}>←</button>

        <div style={{
          width: 42, height: 42, borderRadius: 14, flexShrink: 0,
          background: chatType === 'family' ? 'rgba(124,58,237,0.15)' : chatType === 'business' ? 'rgba(212,160,23,0.12)' : 'rgba(26,124,62,0.12)',
          border: `1px solid ${theme.borderAccent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>{contact.emoji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 800, color: C.text,
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{contact.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <div className="st-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenL, boxShadow: `0 0 4px ${C.greenL}` }} />
            <span style={{ fontSize: 10, color: C.textDim, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.subtitle}{contact.members ? ` · ${contact.members} members` : ''}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {/* FEATURE 3: Blood Call button (family threads only) */}
          {chatType === 'family' && (
            <button onClick={() => {
              try { navigator.vibrate?.([200,100,200,100,200]) } catch {}
              const bcMsg: Msg = {
                id: `bc-${Date.now()}`, type: 'blood_call', sender: 'Me', isMe: true,
                content: 'BLOOD-CALL SOS', location: 'My current location',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
              setMessages(prev => [...prev, bcMsg])
              sesoChatApi.sendMessage(threadId, { body: 'BLOOD-CALL SOS', type: 'BLOOD_CALL' }).catch(() => {})
              flash('🩸 Blood Call sent to family')
            }} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(178,34,34,0.15)', border: '1px solid rgba(178,34,34,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, cursor: 'pointer', color: '#ef4444',
              animation: 'stBreathe 2s infinite',
            }}>🩸</button>
          )}
          {(chatType === 'personal' || chatType === 'family' ? [
            {ic:'📞',act:() => startCall('audio')},{ic:'📹',act:() => startCall('video')}
          ] : chatType === 'business' ? [
            {ic:'📍',act:()=>flash('Location shared')},{ic:'📋',act:()=>flash('Contract opened')}
          ] : [
            {ic:'👥',act:()=>flash('Members list')},{ic:'📌',act:()=>flash('Pinned messages')}
          ]).map((btn, i) => (
            <button key={i} onClick={btn.act} style={{
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, cursor: 'pointer', color: C.textDim,
            }}>{btn.ic}</button>
          ))}
          {/* 3-dot menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowHeaderMenu(v => !v)} style={{
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, cursor: 'pointer', color: C.textDim,
            }}>⋮</button>
            {showHeaderMenu && (
              <div className="st-menu-in" style={{
                position: 'absolute', top: 38, right: 0, width: 200, borderRadius: 14,
                background: '#1a1f1a', border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 50, overflow: 'hidden',
              }}>
                {/* FEATURE 2: Trade Session Quick-Launch */}
                <button onClick={() => {
                  setShowHeaderMenu(false)
                  const participantId = threadId.replace(/^[pbgf]-/, '')
                  sesoChatApi.startBusiness(participantId, 'trade').then((res: any) => {
                    const bizId = res?.chatId || res?.data?.chatId || `b-new-${Date.now()}`
                    router.push(`/dashboard/chat/${bizId}`)
                  }).catch(() => {
                    router.push(`/dashboard/chat/b-new-${Date.now()}`)
                  })
                  flash('🤝 Opening Trade Session...')
                }} style={{
                  width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer', color: C.goldL, fontSize: 13, fontWeight: 600,
                }}>🤝 Open Trade Session</button>
                <button onClick={() => { setShowHeaderMenu(false); flash('📌 Chat pinned') }} style={{
                  width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer', color: C.text, fontSize: 13, fontWeight: 600,
                }}>📌 Pin Chat</button>
                <button onClick={() => { setShowHeaderMenu(false); flash('🔇 Chat muted') }} style={{
                  width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer', color: C.text, fontSize: 13, fontWeight: 600,
                }}>🔇 Mute</button>
                <button onClick={() => { setShowHeaderMenu(false); router.push('/dashboard/chat/settings') }} style={{
                  width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: C.text, fontSize: 13, fontWeight: 600,
                }}>⚙ Settings</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CONTEXT BAR — FEATURE 12: Skin Context Display ═══ */}
      <div style={{
        padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Skin badge */}
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
            background: `${skinMeta.color}18`, color: skinMeta.color,
            border: `1px solid ${skinMeta.color}35`,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{skinMeta.emoji} {skinMeta.label.toUpperCase()}</span>
          {chatType === 'business' && (
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
              background: 'rgba(212,160,23,0.1)', color: C.goldL, border: '1px solid rgba(212,160,23,0.2)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>🔒 ESCROW ACTIVE · ₡42,000</span>
          )}
          {chatType === 'family' && (
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
              background: 'rgba(124,58,237,0.1)', color: C.purpleL, border: '1px solid rgba(124,58,237,0.2)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>🔐 KINSHIP ENCRYPTED</span>
          )}
          {chatType === 'group' && (
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
              background: 'rgba(26,124,62,0.1)', color: C.greenL, border: '1px solid rgba(26,124,62,0.2)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>🧺 COMMERCE VILLAGE</span>
          )}
        </div>
        <span style={{ fontSize: 9, color: C.textDim2, fontWeight: 600 }}>E2E AES-256</span>
      </div>
      {/* Skin accent bar */}
      <div style={{ height: 2, background: `linear-gradient(to right, ${skinMeta.color}, transparent)`, flexShrink: 0 }} />

      {/* ═══ SPIRIT VOICE BAR ═══ */}
      <div style={{
        padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.04)', background: `linear-gradient(135deg, ${theme.borderAccent}, transparent)`,
        flexShrink: 0, overflowX: 'auto',
      }} className="st-no-scroll">
        <span className="st-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenL, boxShadow: `0 0 4px ${C.greenL}`, flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: C.greenL, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif', flexShrink: 0 }}>SPIRIT VOICE</span>
        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {LANGS.map(lang => (
            <button key={lang} onClick={() => setActiveLang(lang)} style={{
              padding: '3px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700, cursor: 'pointer',
              background: lang === activeLang ? C.green : 'rgba(255,255,255,0.04)',
              color: lang === activeLang ? '#fff' : C.textDim2,
              border: lang === activeLang ? `1px solid ${C.greenL}` : '1px solid transparent',
              transition: 'all .15s', flexShrink: 0,
            }}>{lang}</button>
          ))}
        </div>
        <span style={{ fontSize: 15, cursor: 'pointer', flexShrink: 0 }}>🎙</span>
      </div>

      {/* ═══ FAMILY SUB-TABS (family type only) ═══ */}
      {chatType === 'family' && (
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0,
        }}>
          {([
            { key: 'chat' as FamilyTab, label: '💬 Chat' },
            { key: 'tree' as FamilyTab, label: '🌳 Tree' },
            { key: 'vault' as FamilyTab, label: '🏛 Vault' },
            { key: 'cowrie' as FamilyTab, label: '💰 Cowrie' },
          ]).map(t => (
            <button key={t.key} onClick={() => setFamilyTab(t.key)} style={{
              flex: 1, padding: '10px 0', cursor: 'pointer', background: 'none', border: 'none',
              borderBottom: familyTab === t.key ? `2px solid ${C.purpleL}` : '2px solid transparent',
              fontSize: 11, fontWeight: 700, color: familyTab === t.key ? C.purpleL : C.textDim,
              fontFamily: 'Sora, sans-serif', transition: 'all .15s',
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {/* ═══ BUSINESS ESCROW BAR ═══ */}
      {chatType === 'business' && (
        <div style={{
          padding: '10px 14px', background: 'rgba(212,160,23,0.06)',
          borderBottom: '1px solid rgba(212,160,23,0.15)', flexShrink: 0,
        }}>
          {/* Status pipeline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            {(['OPEN', 'LOCKED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETE', 'SEALED'] as EscrowStatus[]).map((step, i, arr) => {
              const statusIdx = arr.indexOf(escrowStatus)
              const stepIdx = i
              const done = stepIdx <= statusIdx
              const active = stepIdx === statusIdx
              return (
                <React.Fragment key={step}>
                  <div style={{
                    width: active ? 10 : 7, height: active ? 10 : 7, borderRadius: '50%',
                    background: done ? C.goldL : 'rgba(255,255,255,.1)',
                    border: active ? `2px solid ${C.goldL}` : 'none',
                    boxShadow: active ? `0 0 8px ${C.goldL}66` : 'none',
                    transition: 'all .3s',
                  }} />
                  {i < arr.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done && stepIdx < statusIdx ? C.goldL : 'rgba(255,255,255,.08)', transition: 'all .3s' }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.goldL, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
                {escrowStatus === 'DISPUTED' ? '⚖ DISPUTED' : escrowStatus.replace('_', ' ')}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.goldL, fontFamily: 'Sora, sans-serif' }}>₡{escrowAmount.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: C.textDim2 }}>Session BS-2026-A4K9</div>
              <div style={{ fontSize: 9, color: C.textDim2, marginTop: 2 }}>
                {escrowStatus === 'OPEN' ? 'Awaiting lock' :
                 escrowStatus === 'LOCKED' ? 'Cowries locked in escrow' :
                 escrowStatus === 'IN_TRANSIT' ? 'Runner delivering goods' :
                 escrowStatus === 'DELIVERED' ? 'Goods received — confirm?' :
                 escrowStatus === 'COMPLETE' ? 'Awaiting final release' :
                 escrowStatus === 'SEALED' ? 'Transaction complete' :
                 'Under elder review'}
              </div>
            </div>
          </div>
          {/* Action buttons — context-sensitive */}
          <div style={{ display: 'flex', gap: 6 }}>
            {escrowStatus === 'OPEN' && (
              <button onClick={async () => {
                setEscrowLoading(true)
                try { await escrowApi.create({ buyerAccountId: 'me', sellerAccountId: 'seller', amount: escrowAmount, currency: 'CWR', description: contact.subtitle, proofOfHandType: 'PHOTO' }) } catch {}
                setEscrowStatus('LOCKED')
                setMessages(m => [...m, { id: `sys-${Date.now()}`, type: 'system', sender: '', isMe: false, content: `🔒 ₡${escrowAmount.toLocaleString()} locked in escrow`, time: '' }])
                setEscrowLoading(false)
                flash('🔒 Escrow locked!')
              }} disabled={escrowLoading} style={{
                flex: 1, padding: '9px 14px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(212,160,23,.3), rgba(212,160,23,.15))', border: '1px solid rgba(212,160,23,.3)',
                color: C.goldL, fontSize: 11, fontWeight: 800, cursor: 'pointer',
              }}>{escrowLoading ? '...' : '🔒 Lock Escrow'}</button>
            )}
            {escrowStatus === 'IN_TRANSIT' && (
              <button onClick={() => flash('📍 Tracking runner...')} style={{
                padding: '9px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                color: C.blueL, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>📍 Track Runner</button>
            )}
            {(escrowStatus === 'IN_TRANSIT' || escrowStatus === 'DELIVERED') && (
              <button onClick={async () => {
                setEscrowLoading(true)
                try { await escrowApi.approve('session-escrow', 'buyer') } catch {}
                setEscrowStatus(escrowStatus === 'IN_TRANSIT' ? 'DELIVERED' : 'COMPLETE')
                setMessages(m => [...m, { id: `sys-${Date.now()}`, type: 'system', sender: '', isMe: false, content: escrowStatus === 'IN_TRANSIT' ? '📦 Delivery confirmed by buyer' : '✅ Session complete — releasing cowries', time: '' }])
                setEscrowLoading(false)
                flash(escrowStatus === 'IN_TRANSIT' ? '📦 Delivery confirmed!' : '✅ Session sealed!')
              }} disabled={escrowLoading} style={{
                flex: 1, padding: '9px 14px', borderRadius: 10, background: C.green, border: `1px solid ${C.greenL}`,
                color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer',
              }}>{escrowLoading ? '...' : escrowStatus === 'IN_TRANSIT' ? '✓ Confirm Delivery' : '✓ Release Cowries'}</button>
            )}
            {escrowStatus === 'COMPLETE' && (
              <button onClick={async () => {
                setEscrowLoading(true)
                try { await escrowApi.release('session-escrow') } catch {}
                setEscrowStatus('SEALED')
                setMessages(m => [...m, { id: `sys-${Date.now()}`, type: 'system', sender: '', isMe: false, content: `🏛 ₡${escrowAmount.toLocaleString()} released to seller. Session SEALED.`, time: '' }])
                setEscrowLoading(false)
                flash('🏛 Session sealed! Cowries released.')
              }} disabled={escrowLoading} style={{
                flex: 1, padding: '9px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #d4a017, #e07b00)', border: 'none',
                color: '#000', fontSize: 11, fontWeight: 800, cursor: 'pointer',
              }}>{escrowLoading ? '...' : '🏛 Seal & Release'}</button>
            )}
            {escrowStatus === 'SEALED' && (
              <div style={{ flex: 1, padding: '9px 14px', borderRadius: 10, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.greenL }}>✅ SEALED — ₡{escrowAmount.toLocaleString()} released</span>
              </div>
            )}
            {escrowStatus !== 'SEALED' && escrowStatus !== 'DISPUTED' && (
              <button onClick={async () => {
                try { await escrowApi.dispute('session-escrow', 'Goods not as described') } catch {}
                setEscrowStatus('DISPUTED')
                setMessages(m => [...m, { id: `sys-${Date.now()}`, type: 'system', sender: '', isMe: false, content: '⚖ Dispute opened — Elder review initiated', time: '' }])
                flash('⚖ Dispute filed')
              }} style={{
                padding: '9px 14px', borderRadius: 10, background: 'rgba(178,34,34,0.1)', border: '1px solid rgba(178,34,34,0.2)',
                color: C.redL, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>⚖</button>
            )}
          </div>
        </div>
      )}

      {/* ═══ MESSAGE AREA ═══ */}
      <div className="st-no-scroll" style={{
        flex: 1, overflowY: 'auto', paddingTop: 10, paddingBottom: 10,
        position: 'relative',
      }}>
        {/* FEATURE 11: Trust Tier Upgrade banner */}
        {showTrustBanner && chatType === 'personal' && (
          <div className="st-fade" style={{
            margin: '8px 18px', padding: '12px 16px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(26,124,62,0.1), rgba(74,222,128,0.06))',
            border: '1px solid rgba(74,222,128,0.25)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.greenL }}>You have exchanged many messages with {contact.name}</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>Upgrade trust to Inner Fire?</div>
            </div>
            <button onClick={() => {
              setShowTrustBanner(false)
              sesoChatApi.updateTrust(threadId, 'inner_fire').catch(() => {})
              flash('Trust upgraded to Inner Fire!')
            }} style={{
              padding: '6px 14px', borderRadius: 10, background: C.green, border: `1px solid ${C.greenL}`,
              color: '#fff', fontSize: 10, fontWeight: 800, cursor: 'pointer', flexShrink: 0,
            }}>Upgrade</button>
            <button onClick={() => setShowTrustBanner(false)} style={{
              background: 'none', border: 'none', color: C.textDim2, cursor: 'pointer', fontSize: 14, padding: 2,
            }}>✕</button>
          </div>
        )}
        {/* family decorative spinning rings */}
        {chatType === 'family' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.06 }}>
            <div className="st-spin-slow" style={{ width: 260, height: 260, border: `2px solid ${C.goldL}`, borderRadius: '50%', position: 'absolute' }} />
            <div className="st-spin-r-slow" style={{ width: 200, height: 200, border: `1px solid ${C.goldL}`, borderRadius: '50%', position: 'absolute' }} />
          </div>
        )}

        {/* render family sub-tabs or messages */}
        {chatType === 'family' && familyTab === 'tree' ? renderFamilyTree()
          : chatType === 'family' && familyTab === 'vault' ? renderFamilyVault()
          : chatType === 'family' && familyTab === 'cowrie' ? renderFamilyCowrie()
          : (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
              {messages.map((msg, i) => renderMessage(msg, i))}
              {/* typing indicator */}
              {typing && (
                <div className="st-fade" style={{ padding: '4px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    padding: '10px 16px', borderRadius: 18, borderTopLeftRadius: 4,
                    background: theme.bubbleThem, border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', gap: 4,
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: C.textDim,
                        animation: `stPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={scrollRef} style={{ height: 4 }} />
            </div>
          )}
      </div>

      {/* ═══ COMPOSER ═══ */}
      <div style={{
        padding: '10px 14px', borderTop: `1px solid ${theme.borderAccent}`,
        background: chatType === 'family' ? '#0f0212' : C.earthD, flexShrink: 0,
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      }}>
        {/* reply quote bar */}
        {replyTo && (
          <div className="st-reply-slide" style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${theme.accentL}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: theme.accentL, marginBottom: 2 }}>↩ {replyTo.sender}</div>
              <div style={{ fontSize: 12, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.content}</div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
          </div>
        )}
        {/* quick action pills — enhanced with Features 5, 7, 8, 10 */}
        <div className="st-no-scroll" style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {/* FEATURE 5: Cowrie Transfer */}
          <button onClick={() => setShowCowrieInput(true)} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
            background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.15)',
            color: C.goldL, whiteSpace: 'nowrap', flexShrink: 0,
          }}>₡ Send Cowrie</button>

          {/* FEATURE 7: Griot AI Wisdom */}
          <button onClick={() => {
            if (griotLoading) return
            setGriotLoading(true)
            orishaApi.query('griot', 'Generate a contextual African proverb for a chat conversation', { context: 'chat', chatType }).then((res: any) => {
              const wisdom = res?.response || res?.data?.response || '"When the music changes, so does the dance." -- African proverb'
              const wisdomMsg: Msg = {
                id: `gw-${Date.now()}`, type: 'griot_insight', sender: 'Griot AI', isMe: false,
                content: wisdom,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
              setMessages(prev => [...prev, wisdomMsg])
            }).catch(() => {
              const fallbackMsg: Msg = {
                id: `gw-${Date.now()}`, type: 'griot_insight', sender: 'Griot AI', isMe: false,
                content: '"If you want to go fast, go alone. If you want to go far, go together." -- African proverb',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
              setMessages(prev => [...prev, fallbackMsg])
            }).finally(() => setGriotLoading(false))
          }} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
            color: C.purpleL, whiteSpace: 'nowrap', flexShrink: 0,
            opacity: griotLoading ? 0.5 : 1,
          }}>{griotLoading ? '🧙 Loading...' : '🧙 Griot Wisdom'}</button>

          {/* FEATURE 8: Location Pin */}
          <button onClick={() => {
            if (!navigator.geolocation) { flash('Geolocation not supported'); return }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const locMsg: Msg = {
                  id: `loc-${Date.now()}`, type: 'location_pin', sender: 'Me', isMe: true,
                  lat: pos.coords.latitude, lng: pos.coords.longitude,
                  content: `Location: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
                setMessages(prev => [...prev, locMsg])
                sesoChatApi.sendMessage(threadId, { body: `📍 ${pos.coords.latitude},${pos.coords.longitude}`, type: 'LOCATION_PIN' }).catch(() => {})
                flash('📍 Location shared')
              },
              () => flash('📍 Location permission denied'),
              { enableHighAccuracy: true }
            )
          }} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: C.textDim, whiteSpace: 'nowrap', flexShrink: 0,
          }}>📍 Share Path</button>

          <button onClick={() => flash(VOCAB.tip)} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: C.textDim, whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0,
          }}>{VOCAB.tip}</button>

          {chatType === 'business' && (
            <button onClick={() => flash(VOCAB.negotiate)} style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(224,123,0,0.08)', border: '1px solid rgba(224,123,0,0.15)',
              color: C.amber, whiteSpace: 'nowrap', flexShrink: 0,
            }}>⚖ Propose Trade</button>
          )}

          {chatType === 'family' && (
            <button onClick={() => flash(VOCAB.sendBloodCall)} style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(178,34,34,0.08)', border: '1px solid rgba(178,34,34,0.15)',
              color: C.redL, whiteSpace: 'nowrap', flexShrink: 0,
            }}>{VOCAB.bloodCall}</button>
          )}

          {/* FEATURE 10: In-Chat Poll (group threads) */}
          {chatType === 'group' && (
            <button onClick={() => setShowPollCreator(true)} style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(26,124,62,0.08)', border: '1px solid rgba(26,124,62,0.15)',
              color: C.greenL, whiteSpace: 'nowrap', flexShrink: 0,
            }}>📊 Create Poll</button>
          )}
        </div>

        {/* input row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button onClick={() => setShowAttach(v => !v)} style={{
            width: 38, height: 38, borderRadius: '50%', background: showAttach ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showAttach ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, cursor: 'pointer', color: showAttach ? C.text : C.textDim, flexShrink: 0, transition: 'all .15s',
          }}>📎</button>

          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              placeholder={chatType === 'family' ? 'Message family...' : chatType === 'business' ? 'Message trade session...' : chatType === 'group' ? 'Message village...' : 'Whisper something...'}
              rows={1}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              style={{
                width: '100%', padding: '10px 40px 10px 14px', borderRadius: 20,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: C.text, fontSize: 14, fontWeight: 500, outline: 'none', resize: 'none', maxHeight: 80,
                fontFamily: 'Inter, DM Sans, sans-serif', boxSizing: 'border-box',
              }}
            />
            <button onClick={() => flash('😊 Emoji keyboard')} style={{
              position: 'absolute', right: 10, bottom: 8, background: 'none', border: 'none',
              fontSize: 16, cursor: 'pointer', color: C.textDim2,
            }}>😊</button>
          </div>

          <button onClick={input.trim() ? handleSend : () => flash('🎙 Recording...')} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: input.trim() ? theme.bubbleMe : 'rgba(255,255,255,0.05)',
            border: input.trim() ? 'none' : '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, cursor: 'pointer', color: '#fff', flexShrink: 0,
            boxShadow: input.trim() ? `0 0 15px ${theme.accent}40` : 'none',
            transition: 'all .2s',
          }}>{input.trim() ? '🏹' : '🎙'}</button>
        </div>
      </div>

      {/* ═══ MESSAGE ACTION MENU (long-press) ═══ */}
      {actionMsg && (
        <div onClick={() => setActionMsg(null)} style={{
          position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="st-menu-in" onClick={e => e.stopPropagation()} style={{
            width: 280, borderRadius: 18, overflow: 'hidden',
            background: '#1a1f1a', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}>
            {/* quick reactions row — FEATURE 13: Kila, Drum, Ubuntu */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '14px 16px 10px' }}>
              {[
                { emoji: '⭐', label: 'Kila' },
                { emoji: '🥁', label: 'Drum' },
                { emoji: '🤝', label: 'Ubuntu' },
                { emoji: '❤️', label: '' },
                { emoji: '😂', label: '' },
                { emoji: '🔥', label: '' },
              ].map((r, i) => (
                <button key={r.emoji} className="st-react-in" onClick={() => {
                  addReact(actionMsg.id, r.emoji)
                  /* FEATURE 13: Wire to sesoChatApi.react */
                  sesoChatApi.react(actionMsg.id, r.emoji).catch(() => {})
                }} style={{
                  width: 40, height: 40, borderRadius: '50%', fontSize: 20, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animationDelay: `${i * 0.04}s`,
                }}>{r.emoji}</button>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            {/* action buttons — FEATURE 4: Chat-to-Feed Bridge added */}
            {[
              { icon: '↩', label: 'Reply', act: () => { setReplyTo(actionMsg); setActionMsg(null) } },
              { icon: '➡', label: 'Forward', act: () => { setForwardMsg(actionMsg); setActionMsg(null) } },
              { icon: '🥁', label: 'Drum to Village', act: () => { setDrumToVillageMsg(actionMsg); setActionMsg(null) } },
              { icon: '📋', label: 'Copy', act: () => doCopy(actionMsg.content) },
              { icon: starred.has(actionMsg.id) ? '⭐' : '☆', label: starred.has(actionMsg.id) ? 'Unstar' : 'Star', act: () => doStar(actionMsg.id) },
              ...(actionMsg.isMe ? [{ icon: '✏', label: 'Edit', act: () => { setInput(actionMsg.content || ''); setActionMsg(null); flash('Editing message...') } }] : []),
              { icon: '🗑', label: 'Delete', act: () => doDelete(actionMsg.id), danger: true },
            ].map((item, i) => (
              <button key={i} onClick={item.act} style={{
                width: '100%', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12,
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                color: (item as { danger?: boolean }).danger ? C.redL : C.text,
              }}>
                <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ATTACHMENT PICKER SHEET ═══ */}
      {showAttach && (
        <div onClick={() => setShowAttach(false)} style={{
          position: 'fixed', inset: 0, zIndex: 890, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div className="st-attach-in" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 480, borderRadius: '20px 20px 0 0', padding: '16px 20px 28px',
            background: '#141a14', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { icon: '📷', label: 'Camera', color: '#22c55e' },
                { icon: '🖼', label: 'Gallery', color: '#3b82f6' },
                { icon: '📄', label: 'Document', color: '#a855f7' },
                { icon: '📍', label: 'Location', color: '#ef4444' },
                { icon: '👤', label: 'Contact', color: '#06b6d4' },
                { icon: '📊', label: 'Poll', color: '#f59e0b' },
                { icon: '🎵', label: 'Audio', color: '#ec4899' },
                { icon: '🐚', label: 'Cowrie', color: '#d4a017' },
              ].map((item, i) => (
                <button key={i} onClick={() => { setShowAttach(false); flash(`${item.icon} ${item.label} selected`) }} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 8,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, background: `${item.color}18`, border: `1px solid ${item.color}30`,
                  }}>{item.icon}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ FORWARD DIALOG ═══ */}
      {forwardMsg && (
        <div onClick={() => setForwardMsg(null)} style={{
          position: 'fixed', inset: 0, zIndex: 910, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="st-forward-in" onClick={e => e.stopPropagation()} style={{
            width: 310, borderRadius: 20, padding: 20,
            background: '#1a1f1a', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Forward Message</div>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              &ldquo;{forwardMsg.content?.slice(0, 50)}{(forwardMsg.content?.length ?? 0) > 50 ? '...' : ''}&rdquo;
            </div>
            {[
              { name: 'Chioma Adeyemi', emoji: '🧺', id: 'p-chioma' },
              { name: 'Commerce · Lagos', emoji: '🏘', id: 'g-commerce' },
              { name: 'Okonkwo Family', emoji: '🌳', id: 'f-family' },
              { name: 'Trade · BS-2026', emoji: '🤝', id: 'b-trade' },
            ].map((c, i) => (
              <button key={i} onClick={() => { setForwardMsg(null); flash(`➡ Forwarded to ${c.name}`) }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 6, cursor: 'pointer', color: C.text,
              }}>
                <span style={{ fontSize: 20 }}>{c.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
              </button>
            ))}
            <button onClick={() => setForwardMsg(null)} style={{
              width: '100%', marginTop: 8, padding: 10, borderRadius: 10,
              background: 'none', border: '1px solid rgba(255,255,255,0.08)',
              color: C.textDim, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ═══ FEATURE 5: COWRIE TRANSFER INPUT MODAL ═══ */}
      {showCowrieInput && (
        <div onClick={() => setShowCowrieInput(false)} style={{
          position: 'fixed', inset: 0, zIndex: 920, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="st-menu-in" onClick={e => e.stopPropagation()} style={{
            width: 300, borderRadius: 20, padding: 24,
            background: '#1a1f1a', border: '1px solid rgba(212,160,23,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 36 }}>🐚</span>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.goldL, fontFamily: 'Sora, sans-serif', marginTop: 8 }}>Send Cowrie</div>
            </div>
            <input
              value={cowrieAmount} onChange={e => setCowrieAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter amount..."
              style={{
                width: '100%', padding: '14px', borderRadius: 12, textAlign: 'center',
                background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.2)',
                color: C.goldL, fontSize: 22, fontWeight: 900, fontFamily: 'Sora, sans-serif',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => setShowCowrieInput(false)} style={{
                flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', color: C.textDim, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={() => {
                if (!cowrieAmount || parseInt(cowrieAmount) <= 0) return
                const amt = parseInt(cowrieAmount)
                const msg: Msg = {
                  id: `ct-${Date.now()}`, type: 'cowrie_transfer', sender: 'Me', isMe: true,
                  cowrieAmt: amt, content: `Sent ₡${amt.toLocaleString()}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
                setMessages(prev => [...prev, msg])
                sesoChatApi.sendMessage(threadId, { body: `COWRIE_TRANSFER:${amt}`, type: 'COWRIE_TRANSFER' }).catch(() => {})
                setShowCowrieInput(false)
                setCowrieAmount('')
                flash(`₡${amt.toLocaleString()} sent`)
              }} style={{
                flex: 1, padding: 12, borderRadius: 12,
                background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                opacity: cowrieAmount && parseInt(cowrieAmount) > 0 ? 1 : 0.4,
              }}>Send ₡</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FEATURE 10: POLL CREATOR MODAL ═══ */}
      {showPollCreator && (
        <div onClick={() => setShowPollCreator(false)} style={{
          position: 'fixed', inset: 0, zIndex: 920, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="st-menu-in" onClick={e => e.stopPropagation()} style={{
            width: 320, borderRadius: 20, padding: 20,
            background: '#1a1f1a', border: '1px solid rgba(26,124,62,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: 'Sora, sans-serif', marginBottom: 14 }}>📊 Create Poll</div>
            <input
              value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
              placeholder="Ask a question..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: C.text, fontSize: 13, fontWeight: 600, outline: 'none', boxSizing: 'border-box',
              }}
            />
            {pollOpts.map((opt, i) => (
              <input key={i}
                value={opt} onChange={e => { const next = [...pollOpts]; next[i] = e.target.value; setPollOpts(next) }}
                placeholder={`Option ${i + 1}`}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                  color: C.text, fontSize: 12, outline: 'none', boxSizing: 'border-box',
                }}
              />
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => { setShowPollCreator(false); setPollQuestion(''); setPollOpts(['', '', '', '']) }} style={{
                flex: 1, padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', color: C.textDim, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={() => {
                const validOpts = pollOpts.filter(o => o.trim())
                if (!pollQuestion.trim() || validOpts.length < 2) return
                const pollMsg: Msg = {
                  id: `poll-${Date.now()}`, type: 'poll', sender: 'Me', isMe: true,
                  content: pollQuestion, pollOptions: validOpts.map(o => ({ label: o, votes: 0 })),
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
                setMessages(prev => [...prev, pollMsg])
                sesoChatApi.sendMessage(threadId, { body: JSON.stringify({ question: pollQuestion, options: validOpts }), type: 'POLL' }).catch(() => {})
                setShowPollCreator(false)
                setPollQuestion('')
                setPollOpts(['', '', '', ''])
                flash('📊 Poll created')
              }} style={{
                flex: 1, padding: 10, borderRadius: 10, background: C.green, border: `1px solid ${C.greenL}`,
                color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FEATURE 4: DRUM TO VILLAGE CONFIRMATION ═══ */}
      {drumToVillageMsg && (
        <div onClick={() => setDrumToVillageMsg(null)} style={{
          position: 'fixed', inset: 0, zIndex: 920, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="st-menu-in" onClick={e => e.stopPropagation()} style={{
            width: 300, borderRadius: 20, padding: 20,
            background: '#1a1f1a', border: '1px solid rgba(26,124,62,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: 'Sora, sans-serif', marginBottom: 6 }}>🥁 Drum to Village</div>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14, lineHeight: 1.5 }}>Share this message to the Soro Soke Feed?</div>
            <div style={{
              padding: '10px 14px', borderRadius: 12, marginBottom: 14,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              fontSize: 12, color: C.textDim, fontStyle: 'italic', lineHeight: 1.5, maxHeight: 60, overflow: 'hidden',
            }}>&ldquo;{drumToVillageMsg.content?.slice(0, 120)}{(drumToVillageMsg.content?.length ?? 0) > 120 ? '...' : ''}&rdquo;</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDrumToVillageMsg(null)} style={{
                flex: 1, padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', color: C.textDim, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={() => {
                sorosokeApi.createPost({
                  body: drumToVillageMsg.content || '',
                  villageId: 'commerce',
                  skinContext: activeSkin,
                  type: 'TEXT_DRUM',
                }).catch(() => {})
                setDrumToVillageMsg(null)
                flash('🥁 Drummed to Village Feed!')
              }} style={{
                flex: 1, padding: 10, borderRadius: 10, background: C.green, border: `1px solid ${C.greenL}`,
                color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}>🥁 Drum It</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className={toastOut ? 'st-toast-out' : 'st-toast-in'} style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 14, zIndex: 999,
          background: `${theme.accent}ee`, border: `1px solid ${theme.accentL}`,
          color: '#fff', fontSize: 13, fontWeight: 700,
          fontFamily: 'Sora, sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}

      {/* ═══ INCOMING CALL OVERLAY ═══ */}
      {callState === 'ringing-in' && (
        <div className="st-call-fade" style={{
          position:'fixed', inset:0, zIndex:1000, background:'linear-gradient(180deg,#060d07 0%,#0a1a0b 40%,#091608 100%)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20,
        }}>
          <div style={{ position:'absolute', top:40, width:'100%', textAlign:'center' }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', fontWeight:600, letterSpacing:'.08em' }}>INCOMING CALL</p>
          </div>
          {/* Avatar pulse */}
          <div className="st-call-pulse" style={{
            width:110, height:110, borderRadius:'50%', background:`linear-gradient(135deg,${theme.accent},${theme.accentL})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:48,
            boxShadow:`0 0 40px ${theme.accent}44`,
          }}>
            {contact.emoji || '👤'}
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:22, fontWeight:800, color:'#f0f7f0', fontFamily:'Sora, sans-serif', marginBottom:4 }}>{contact.name}</p>
            <p className="st-ring" style={{ fontSize:13, color:C.greenL }}>Ringing...</p>
          </div>
          {/* Accept / Decline buttons */}
          <div style={{ display:'flex', gap:40, marginTop:30 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <button onClick={() => endCall()} style={{
                width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#ef4444,#dc2626)',
                border:'none', fontSize:26, cursor:'pointer', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 20px rgba(239,68,68,.4)',
              }}>✕</button>
              <span style={{ fontSize:11, color:'#ef4444', fontWeight:600 }}>Decline</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <button onClick={() => acceptCall('audio')} style={{
                width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#22c55e)',
                border:'none', fontSize:26, cursor:'pointer', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 20px rgba(74,222,128,.4)',
              }}>📞</button>
              <span style={{ fontSize:11, color:C.greenL, fontWeight:600 }}>Audio</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <button onClick={() => acceptCall('video')} style={{
                width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#3b82f6)',
                border:'none', fontSize:26, cursor:'pointer', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 20px rgba(59,130,246,.4)',
              }}>📹</button>
              <span style={{ fontSize:11, color:'#60a5fa', fontWeight:600 }}>Video</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ OUTBOUND RINGING ═══ */}
      {callState === 'ringing-out' && (
        <div className="st-call-fade" style={{
          position:'fixed', inset:0, zIndex:1000, background:'linear-gradient(180deg,#060d07,#0a1a0b)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
        }}>
          <div className="st-call-pulse" style={{
            width:100, height:100, borderRadius:'50%', background:`linear-gradient(135deg,${theme.accent},${theme.accentL})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:44,
          }}>{contact.emoji || '👤'}</div>
          <p style={{ fontSize:20, fontWeight:800, color:'#f0f7f0', fontFamily:'Sora, sans-serif' }}>{contact.name}</p>
          <p className="st-ring" style={{ fontSize:13, color:C.greenL }}>Calling...</p>
          <button onClick={endCall} style={{
            marginTop:40, width:60, height:60, borderRadius:'50%',
            background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none',
            fontSize:24, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 20px rgba(239,68,68,.4)',
          }}>✕</button>
          <span style={{ fontSize:11, color:'#ef4444', fontWeight:600 }}>Cancel</span>
        </div>
      )}

      {/* ═══ ACTIVE CALL (VIDEO / AUDIO) ═══ */}
      {(callState === 'video' || callState === 'audio') && (
        <div className="st-call-slide" style={{
          position:'fixed', inset:0, zIndex:1000,
          background: callState === 'video'
            ? 'linear-gradient(180deg,#0f2d14 0%,#091608 50%,#060d07 100%)'
            : 'linear-gradient(180deg,#060d07,#0a1a0b)',
          display:'flex', flexDirection:'column',
        }}>
          {/* Top bar */}
          <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.greenL }} />
              <span style={{ fontSize:12, color:C.greenL, fontWeight:700, fontFamily:'monospace' }}>{fmtTime(callTimer)}</span>
            </div>
            <span style={{
              fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20,
              background: callState === 'video' ? 'rgba(59,130,246,.15)' : 'rgba(74,222,128,.15)',
              border: `1px solid ${callState === 'video' ? 'rgba(59,130,246,.3)' : 'rgba(74,222,128,.3)'}`,
              color: callState === 'video' ? '#60a5fa' : C.greenL,
            }}>{callState === 'video' ? '📹 VIDEO' : '📞 AUDIO'} · ENCRYPTED</span>
          </div>

          {/* Main area */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
            {callState === 'video' ? (
              <>
                {/* Simulated video feed */}
                <div style={{
                  width:'90%', maxWidth:360, aspectRatio:'3/4', borderRadius:24,
                  background:'linear-gradient(135deg,#1a4a1f,#0f2d14)', border:'2px solid rgba(74,222,128,.15)',
                  display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden',
                }}>
                  <div style={{ fontSize:80, opacity:.3 }}>{contact.emoji || '👤'}</div>
                  <p style={{ position:'absolute', bottom:16, left:16, fontSize:14, fontWeight:700, color:'#f0f7f0' }}>{contact.name}</p>
                  {/* PiP (self cam) */}
                  {!callCamOff && (
                    <div style={{
                      position:'absolute', top:12, right:12, width:80, height:100, borderRadius:14,
                      background:'linear-gradient(135deg,#0a1a0b,#060d07)', border:'1px solid rgba(255,255,255,.1)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
                    }}>🙂</div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Audio call view */}
                <div style={{
                  width:120, height:120, borderRadius:'50%', background:`linear-gradient(135deg,${theme.accent},${theme.accentL})`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:52,
                  boxShadow:`0 0 50px ${theme.accent}33`,
                }}>{contact.emoji || '👤'}</div>
                <p style={{ fontSize:20, fontWeight:800, color:'#f0f7f0', fontFamily:'Sora, sans-serif' }}>{contact.name}</p>
                {/* Audio waveform */}
                <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:24 }}>
                  {Array.from({length:12}).map((_,i)=>(
                    <div key={i} style={{
                      width:3, borderRadius:2, background:C.greenL,
                      animation:`stWave ${0.3+Math.random()*0.5}s ease-in-out infinite alternate`,
                      animationDelay:`${i*0.08}s`, height:4,
                    }}/>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Call controls */}
          <div style={{
            padding:'24px 0 40px', display:'flex', justifyContent:'center', gap:16,
            background:'linear-gradient(transparent,rgba(0,0,0,.4))',
          }}>
            {/* Mute */}
            <button onClick={() => setCallMuted(!callMuted)} style={{
              width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
              background: callMuted ? '#ef4444' : 'rgba(255,255,255,.1)',
              color:'#fff', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center',
            }}>{callMuted ? '🔇' : '🎙'}</button>
            {/* Speaker */}
            <button onClick={() => setCallSpeaker(!callSpeaker)} style={{
              width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
              background: callSpeaker ? 'rgba(59,130,246,.3)' : 'rgba(255,255,255,.1)',
              color:'#fff', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center',
            }}>{callSpeaker ? '🔊' : '🔈'}</button>
            {callState === 'video' && (
              <>
                {/* Camera toggle */}
                <button onClick={() => setCallCamOff(!callCamOff)} style={{
                  width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
                  background: callCamOff ? '#ef4444' : 'rgba(255,255,255,.1)',
                  color:'#fff', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center',
                }}>📷</button>
                {/* Flip camera */}
                <button onClick={() => setCallCamFacing(f => f === 'user' ? 'environment' : 'user')} style={{
                  width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
                  background: callCamFacing === 'environment' ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.1)', color:'#fff', fontSize:20,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>🔄</button>
              </>
            )}
            {/* End call */}
            <button onClick={endCall} style={{
              width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', fontSize:22,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 20px rgba(239,68,68,.4)',
            }}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
