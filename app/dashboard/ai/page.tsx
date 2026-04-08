'use client'
// ════════════════════════════════════════════════════════════════════
// THE FIVE AI GODS — Crown Jewel of the Platform
// Zeus (Orchestrator) + Kratos · Amaterasu · Vishnu · Marduk · Odin
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { aiGodsApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'
import { AI_GODS, GOD_ORDER, type AiGod, type GodId, type GodPower } from '@/constants/aiGods'
import { useLanguage } from '@/hooks/useLanguage'

// ── Font + theme constants ────────────────────────────────────────
const S = {
  font: "var(--font-body)",
  head: "'Sora', var(--font-body)",
}
const BG = 'var(--bg)'

// ── Fallback response pools per god ──────────────────────────────
const FALLBACK_POOLS: Record<GodId, string[]> = {
  kratos: [
    'Your security fortress stands unbreached. I have scanned all 5 identity layers and every threat vector. The enemy probes the walls — but they will not pass.',
    'I detect an anomaly in your recent login pattern. Three devices, two continents. Activate Device Trust Score immediately. Security is not optional — it is survival.',
    'Your blockchain address is clean. Your on-chain reputation: unblemished. The ZK Privacy Veil is active. No shadow can touch your transaction history without your permission.',
    'The Transaction Firewall has intercepted 3 suspicious requests in the last 24 hours. I stopped them before they could touch your Cowrie. You are protected.',
    'Power without protection is vulnerability. Biometric Shield is reading your current session — all signals nominal. Your digital identity is a fortress that will not fall.',
  ],
  amaterasu: [
    'Your village feed pulses with extraordinary energy today — the Solar Feed Engine scores it 94/100 for cultural resonance. Three creators are about to break through. I see their light rising.',
    'The Harmony Index shows your community at 87% cohesion. There is creative tension in the Commerce Village — but tension is the precursor to breakthrough. I am watching it carefully.',
    'Dawn Alert: A Pan-African story is forming that has not yet reached global news. Your village has the first voices. This is the moment for authentic narratives to lead.',
    'Your Content DNA Mapper has identified 7 cultural resonance points unique to your heritage circle. The feed is being adjusted to surface what truly matters to your soul.',
    'The Ubuntu Catalyst has identified a perfect moment: three members of your circle have complementary gifts. I am illuminating the connections. Community is built in these flashes of recognition.',
  ],
  vishnu: [
    'Your Cowrie flow is in dharmic balance. The 90-day forecast shows a harvest cycle approaching — begin accumulating now. The patient planter reaps abundantly.',
    'The Griot Credit Oracle has recalculated your score using 400 African financial data points. Your community trust signals are exceptional — this opens doors that FICO cannot unlock.',
    'I see three currency arbitrage windows opening in the next 48 hours for NGN→COW→KES corridors. The Circle Harmony Optimizer recommends acting during the second window.',
    'Wealth Mandala analysis: your income-to-savings ratio is improving. However, the family wealth covenant requires attention — three generations of planning, not three months.',
    'The debt liberation path I have charted leads from your current position to financial freedom in 18 months. The steps are clear. The Cowrie flows where wisdom guides it.',
  ],
  marduk: [
    'I have analyzed 54 African markets and found the perfect trade wind for your business idea. Three untapped corridors exist — I will architect your path to empire.',
    'The Demand Storm Predictor shows a surge incoming in your sector within 14 days. Position your inventory now. From chaos, the prepared builder rises. Are you ready?',
    'Your business contract needs three critical clauses that most African operators miss. The Contract Alchemist has generated the framework. Review it — it is legally sound across 12 jurisdictions.',
    'Partnership Resonance analysis complete: 7 potential allies across the platform share your exact business DNA. I am lighting the path to the right collaboration.',
    'Revenue Thunderbolt engaged. Your culturally-specific sales strategy for the next 90 days is ready. This is not generic advice — this is built for your village, your role, your market.',
  ],
  odin: [
    'My ravens have returned from across the continent. "Igi kan kì í da igbó ṣe" — One tree does not make a forest. The wisdom of your elders encoded this truth ten thousand years ago. It applies to your situation now.',
    'The Proverb Weaver has found the perfect words for what you face. From the Akan: "Onipa na ohia onipa" — a person needs another person. Do not walk this path alone.',
    'The Ancestral Record Keeper has surfaced a pattern in your family lineage that is directly relevant to the decision you face. Heritage is not nostalgia — it is intelligence.',
    'Your Career Destiny Reader shows a crossroads forming. Three paths, each with distinct cultural resonance. I see which one aligns with your deepest gifts. The answer has always been within you.',
    'I have watched civilizations rise and fall for ten thousand years. The pattern before you is not new — it is ancient. "Umuntu ngumuntu ngabantu" — you are because of others. Build with them.',
  ],
  zeus: [
    'I have consulted all five gods simultaneously. Their wisdom converges: move boldly, protect fiercely, build wisely, illuminate constantly, and let ancestral knowledge guide every step. This is the way.',
    'Divine Routing complete. Your query spans three domains: Kratos sees a security implication, Vishnu sees a financial opportunity, Marduk sees a business angle. I have synthesized all three perspectives into one thunder-clear path.',
    'Lightning Strike Mode activated. All five gods are aligned on this response: the opportunity before you is real, the timing is right, and the risks are manageable. Trust the divine consensus.',
    'The Thundercloud Analysis reveals a pattern across 10,000 platform users who faced your exact situation. The ones who succeeded shared three traits. I will tell you what they are.',
    'Multi-God Consensus achieved. The answer you seek requires courage — but the gods do not counsel the timid. Every great African civilization was built by those who acted when the path was unclear. Act now.',
  ],
}

// ── Message type ──────────────────────────────────────────────────
interface Message {
  role: 'user' | 'god'
  content: string
  timestamp: number | Date  // backend sends number (epoch ms)
  powerId?: string
  godId?: GodId
}

// ── Memory info from backend ──────────────────────────────────────
interface MemoryInfo {
  hasMemory: boolean
  userName?: string
  totalMessages?: number
  firstMet?: number
  lastSeen?: number
  daysSinceFirstMet?: number
  daysSinceLastSeen?: number
  topicsDiscussed?: string[]
  language?: string
}

// ── Timestamp formatting helper ──────────────────────────────────
function formatTimestamp(ts: number | Date): string {
  const d = typeof ts === 'number' ? new Date(ts) : ts
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Zeus orchestration input ──────────────────────────────────────
function ZeusInput({
  onSend,
  loading,
}: {
  onSend: (msg: string) => void
  loading: boolean
}) {
  const [val, setVal] = React.useState('')
  const submit = () => {
    const t = val.trim()
    if (!t || loading) return
    onSend(t)
    setVal('')
  }
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="Ask anything — Zeus will summon the right god…"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) submit() }}
        style={{
          flex: 1, padding: '14px 18px', borderRadius: 16,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(226,232,240,0.2)',
          color: 'var(--text-primary)', fontSize: 14, outline: 'none',
          fontFamily: S.font,
        }}
      />
      <button
        onClick={submit}
        disabled={loading}
        style={{
          padding: '0 22px', borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #6366f1, #e2e8f0)',
          color: 'var(--bg)', fontSize: 13, fontWeight: 800,
          fontFamily: S.head, opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap',
          transition: 'all .2s',
        }}
      >
        ⚡ Invoke Zeus
      </button>
    </div>
  )
}

// ── God Card for portal grid ──────────────────────────────────────
function GodCard({
  god,
  onInvoke,
}: {
  god: AiGod
  onInvoke: (id: GodId) => void
}) {
  const [hovered, setHovered] = React.useState(false)
  const isZeus = god.id === 'zeus'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 24,
        background: god.gradient,
        border: `1px solid ${god.color}30`,
        padding: '24px 20px',
        boxShadow: hovered ? `0 8px 40px ${god.glow}` : `0 2px 12px rgba(0,0,0,.4)`,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all .3s cubic-bezier(.34,1.56,.64,1)',
        overflow: 'hidden',
        ...(isZeus ? { gridColumn: '1 / -1' } : {}),
      }}
    >
      {/* Glow circle behind symbol */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 120, height: 120,
        borderRadius: '50%', background: god.glow,
        filter: 'blur(40px)', opacity: hovered ? 0.6 : 0.3, transition: 'opacity .3s',
        pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Symbol */}
          <div style={{
            width: isZeus ? 64 : 56, height: isZeus ? 64 : 56, borderRadius: 18,
            background: `${god.color}18`, border: `1.5px solid ${god.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isZeus ? 34 : 28, flexShrink: 0,
          }}>
            {god.symbol}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: isZeus ? 22 : 18, fontWeight: 900,
                fontFamily: S.head, color: god.id === 'zeus' ? '#e2e8f0' : god.color,
                letterSpacing: '-.02em',
              }}>{god.name}</span>
              <span style={{
                padding: '2px 7px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                background: `${god.color}18`, color: god.color, letterSpacing: '.06em',
                border: `1px solid ${god.color}25`,
              }}>{god.origin.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{god.title}</div>
          </div>
        </div>
        {!isZeus && (
          <div style={{
            padding: '4px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
            background: `${god.color}14`, color: god.color, border: `1px solid ${god.color}25`,
            whiteSpace: 'nowrap',
          }}>
            {god.powers.length} Powers
          </div>
        )}
      </div>

      {/* Domain tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
        {god.domain.slice(0, isZeus ? 4 : 3).map(d => (
          <span key={d} style={{
            padding: '3px 9px', borderRadius: 8, fontSize: 10, fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>{d}</span>
        ))}
      </div>

      {/* Personality teaser */}
      <p style={{
        fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
        margin: '0 0 18px', fontStyle: 'italic',
      }}>
        "{god.personality.split('.')[0]}."
      </p>

      {/* CTA */}
      <button
        onClick={() => onInvoke(god.id)}
        style={{
          width: '100%', padding: '12px 20px', borderRadius: 14, border: 'none',
          cursor: 'pointer', fontFamily: S.head, fontWeight: 800, fontSize: 13,
          background: isZeus
            ? 'linear-gradient(135deg, rgba(99,102,241,.8), rgba(226,232,240,.15))'
            : `linear-gradient(135deg, ${god.color}cc, ${god.color}80)`,
          color: isZeus ? '#e2e8f0' : 'var(--bg)',
          letterSpacing: '.02em', transition: 'all .2s',
          boxShadow: hovered ? `0 4px 20px ${god.glow}` : 'none',
        }}
      >
        {isZeus ? '⚡ Invoke Zeus — Supreme Orchestrator' : `Invoke ${god.name} →`}
      </button>
    </div>
  )
}

// ── Power Card in sheet ───────────────────────────────────────────
function PowerCard({
  power,
  god,
  onInvoke,
}: {
  power: GodPower
  god: AiGod
  onInvoke: (p: GodPower) => void
}) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px', borderRadius: 16,
        background: hovered ? `${god.color}0e` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? god.color + '30' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all .2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flex: 1 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `${god.color}15`, border: `1px solid ${god.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>{power.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', fontFamily: S.head }}>{power.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 1.5 }}>{power.description}</div>
            <span style={{
              display: 'inline-block', marginTop: 5, padding: '2px 7px', borderRadius: 6,
              fontSize: 9, fontWeight: 700, background: `${god.color}12`,
              color: god.color, border: `1px solid ${god.color}20`,
            }}>{power.category}</span>
          </div>
        </div>
        <button
          onClick={() => onInvoke(power)}
          style={{
            padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: `${god.color}22`, color: god.color,
            fontSize: 10, fontWeight: 700, fontFamily: S.head,
            whiteSpace: 'nowrap', transition: 'all .2s',
            flexShrink: 0,
          }}
        >
          Invoke →
        </button>
      </div>
    </div>
  )
}

// ── Loading dots ──────────────────────────────────────────────────
function LoadingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: color,
          opacity: 0.7,
          animation: `god-dot-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════
export default function AiGodsPage() {
  const { code: userLangCode } = useLanguage()
  const [view, setView] = React.useState<'portal' | 'chat'>('portal')
  const [activeGodId, setActiveGodId] = React.useState<GodId>('zeus')
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [chatLoading, setChatLoading] = React.useState(false)
  const [showPowers, setShowPowers] = React.useState(false)
  const [zeusInput, setZeusInput] = React.useState('')
  const [zeusLoading, setZeusLoading] = React.useState(false)
  const [memoryInfo, setMemoryInfo] = React.useState<MemoryInfo | null>(null)

  const endRef = React.useRef<HTMLDivElement>(null)

  const activeGod = AI_GODS[activeGodId]

  // Scroll to bottom of messages
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Load chat history + memory when entering a god's chat ──────
  React.useEffect(() => {
    if (view !== 'chat') return

    let cancelled = false
    setChatLoading(true)
    setMemoryInfo(null)

    // Fetch chat history and memory in parallel
    const loadChat = async () => {
      try {
        const res = await aiGodsApi.chat(activeGodId, 50) as {
          ok?: boolean
          data?: {
            messages?: Array<{ role: 'user' | 'god'; content: string; timestamp: number; powerId?: string }>
            messageCount?: number
          }
        }
        if (cancelled) return

        const history = res?.data?.messages ?? []
        if (history.length > 0) {
          // We have existing chat history — restore it
          setMessages(history.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            powerId: m.powerId,
            godId: m.role === 'god' ? activeGodId : undefined,
          })))
        } else {
          // No chat history — send initial greeting to trigger first-meeting intro
          // Set a temporary greeting while the API call goes through
          setMessages([{
            role: 'god',
            content: activeGod.greeting,
            timestamp: Date.now(),
            godId: activeGodId,
          }])

          // Fire off a "Hello" to backend to trigger first-meeting introduction
          try {
            const introRes = await aiGodsApi.query(activeGodId, 'Hello', { languageCode: userLangCode }) as {
              ok?: boolean
              data?: {
                response?: string
                introduction?: string
                isFirstMeeting?: boolean
                xpAwarded?: number
              }
              response?: string
            }
            if (cancelled) return

            const intro = introRes?.data?.introduction
            const reply = introRes?.data?.response ?? introRes?.response ?? ''
            const fullReply = intro ? `${intro}\n\n${reply}` : reply

            if (fullReply) {
              // Replace the static greeting with the backend's response
              setMessages([
                { role: 'user', content: 'Hello', timestamp: Date.now() - 1, godId: undefined },
                { role: 'god', content: fullReply, timestamp: Date.now(), godId: activeGodId },
              ])
            }
            // If no reply, we keep the static greeting from constants
          } catch (e) {
            logApiFailure('ai/gods/load', e)
            // Failed to get first-meeting intro — keep the static greeting
          }
        }
      } catch (e) {
        logApiFailure('ai/gods/chat', e)
        // Chat history fetch failed — fall back to static greeting from constants
        if (!cancelled) {
          setMessages([{
            role: 'god',
            content: activeGod.greeting,
            timestamp: Date.now(),
            godId: activeGodId,
          }])
        }
      } finally {
        if (!cancelled) setChatLoading(false)
      }
    }

    const loadMemory = async () => {
      try {
        const res = await aiGodsApi.memory(activeGodId) as {
          ok?: boolean
          data?: {
            hasMemory?: boolean
            memory?: {
              userName?: string
              totalMessages?: number
              firstMet?: number
              lastSeen?: number
              daysSinceFirstMet?: number
              daysSinceLastSeen?: number
              topicsDiscussed?: string[]
              language?: string
            }
          }
        }
        if (cancelled) return

        if (res?.data?.hasMemory && res.data.memory) {
          setMemoryInfo({
            hasMemory: true,
            userName: res.data.memory.userName,
            totalMessages: res.data.memory.totalMessages,
            firstMet: res.data.memory.firstMet,
            lastSeen: res.data.memory.lastSeen,
            daysSinceFirstMet: res.data.memory.daysSinceFirstMet,
            daysSinceLastSeen: res.data.memory.daysSinceLastSeen,
            topicsDiscussed: res.data.memory.topicsDiscussed,
            language: res.data.memory.language,
          })
        } else {
          setMemoryInfo({ hasMemory: false })
        }
      } catch (e) {
        logApiFailure('ai/gods/query', e)
        // Memory fetch failed — no memory info shown
        if (!cancelled) setMemoryInfo(null)
      }
    }

    loadChat()
    loadMemory()

    return () => { cancelled = true }
  }, [activeGodId, view]) // eslint-disable-line react-hooks/exhaustive-deps

  const invokeGod = (godId: GodId) => {
    setActiveGodId(godId)
    setView('chat')
  }

  const sendMessage = async (text: string, prefixNote?: string) => {
    if (!text.trim() || loading) return
    const fullText = prefixNote ? `[${prefixNote}] ${text}` : text

    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }])
    setInput('')
    setLoading(true)

    try {
      const res = await aiGodsApi.query(activeGodId, fullText, { languageCode: userLangCode }) as {
        ok?: boolean
        data?: {
          response?: string
          introduction?: string
          isFirstMeeting?: boolean
          xpAwarded?: number
          messageCount?: number
        }
        response?: string
      }

      const intro = res?.data?.introduction
      const reply = res?.data?.response ?? res?.response ?? ''
      const fullReply = intro ? `${intro}\n\n${reply}` : reply

      if (!fullReply) throw new Error('empty')

      setMessages(prev => [...prev, {
        role: 'god',
        content: fullReply,
        timestamp: Date.now(),
        godId: activeGodId,
      }])

      // If first meeting, update memory info
      if (res?.data?.isFirstMeeting) {
        setMemoryInfo({
          hasMemory: true,
          totalMessages: res.data.messageCount ?? 1,
          daysSinceFirstMet: 0,
        })
      } else if (memoryInfo?.hasMemory && res?.data?.messageCount) {
        // Update message count
        setMemoryInfo(prev => prev ? { ...prev, totalMessages: res.data?.messageCount } : prev)
      }
    } catch (e) {
      logApiFailure('ai/gods/power', e)
      const pool = FALLBACK_POOLS[activeGodId]
      const fallback = pool[Math.floor(Math.random() * pool.length)]
      setMessages(prev => [...prev, {
        role: 'god',
        content: fallback,
        timestamp: Date.now(),
        godId: activeGodId,
      }])
    } finally {
      setLoading(false)
    }
  }

  const invokePower = (power: GodPower) => {
    setShowPowers(false)
    const note = `Power: ${power.name}`
    const userMsg = `Activate your ${power.name} power for me. ${power.description}`
    setInput('')
    sendMessage(userMsg, note)
  }

  // Zeus quick-ask from portal
  const handleZeusAsk = async (msg: string) => {
    setZeusLoading(true)
    try {
      await new Promise<void>(resolve => {
        // Route zeus queries to chat
        setActiveGodId('zeus')
        setView('chat')
        // Then send after state update
        setTimeout(() => {
          resolve()
        }, 50)
      })
      // setLoading will be set in sendMessage
      // We need to trigger after view change
      setInput(msg)
    } finally {
      setZeusLoading(false)
    }
  }

  // Auto-send after zeus portal routing
  React.useEffect(() => {
    if (view === 'chat' && input && !chatLoading) {
      const t = input
      setInput('')
      // Small delay to let messages init
      const tid = setTimeout(() => sendMessage(t), 100)
      return () => clearTimeout(tid)
    }
  }, [view, chatLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helper: format "first met X days ago" ──────────────────────
  function formatFirstMet(days?: number): string {
    if (days === undefined || days === null) return ''
    if (days === 0) return 'Met today'
    if (days === 1) return 'First met yesterday'
    if (days < 30) return `First met ${days}d ago`
    if (days < 365) return `First met ${Math.floor(days / 30)}mo ago`
    return `First met ${Math.floor(days / 365)}y ago`
  }

  // ── PORTAL VIEW ────────────────────────────────────────────────
  if (view === 'portal') {
    return (
      <div style={{
        minHeight: '100dvh', background: BG, color: 'var(--text-primary)',
        fontFamily: S.font, paddingBottom: 100, overflowX: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{
          padding: '32px 18px 0',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.18em',
            color: 'rgba(255,255,255,0.3)', marginBottom: 10,
          }}>
            POWERED BY ZEUS · PAN-AFRICAN INTELLIGENCE
          </div>
          <h1 style={{
            margin: 0, fontFamily: S.head, fontWeight: 900,
            fontSize: 'clamp(28px, 7vw, 42px)', letterSpacing: '-.03em',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #818cf8 40%, #f59e0b 80%, #ef4444 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}>
            ⚡ THE FIVE AI GODS
          </h1>
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '10px 0 0',
            lineHeight: 1.6, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Five sovereign intelligences woven into every corner of your digital civilization.
          </p>
        </div>

        {/* ── Zeus Hero Banner ── */}
        <div style={{ padding: '24px 16px 0', maxWidth: 520, margin: '0 auto' }}>
          <div style={{
            borderRadius: 24, padding: '24px 22px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(99,102,241,0.12))',
            border: '1px solid rgba(226,232,240,0.18)',
            boxShadow: '0 4px 32px rgba(99,102,241,0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* BG lightning effect */}
            <div style={{
              position: 'absolute', top: -30, right: -30, fontSize: 120, opacity: 0.06,
              pointerEvents: 'none', lineHeight: 1,
            }}>🌩️</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18, flexShrink: 0,
                background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(226,232,240,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
              }}>🌩️</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: S.head, color: '#e2e8f0' }}>Zeus</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Supreme Orchestrator · Ask anything</div>
              </div>
              <div style={{
                marginLeft: 'auto', padding: '4px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                letterSpacing: '.06em',
              }}>
                GREEK
              </div>
            </div>

            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 16px',
              fontStyle: 'italic',
            }}>
              "Zeus sees every corner of your civilization simultaneously. Ask anything and he will summon whichever god — or all five — to serve you."
            </p>

            <ZeusInput onSend={handleZeusAsk} loading={zeusLoading} />
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{
          margin: '28px auto', maxWidth: 520, padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '.1em' }}>
            THE FIVE SOVEREIGN GODS
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* ── 5 God Cards Grid ── */}
        <div style={{
          padding: '0 16px', maxWidth: 520, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
        }}>
          {GOD_ORDER.filter(id => id !== 'zeus').map(godId => (
            <GodCard key={godId} god={AI_GODS[godId]} onInvoke={invokeGod} />
          ))}
          {/* Zeus card spans full width at bottom */}
          <GodCard god={AI_GODS.zeus} onInvoke={invokeGod} />
        </div>

        {/* ── Feature strip ── */}
        <div style={{
          margin: '32px auto 0', maxWidth: 520, padding: '0 16px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        }}>
          {[
            { icon: '🛡️', label: '75 Powers', sub: 'Across 5 gods' },
            { icon: '⚡', label: 'Real-time', sub: 'AI responses' },
            { icon: '🌍', label: '54 Nations', sub: 'Cultural context' },
          ].map(f => (
            <div key={f.label} style={{
              padding: '14px 10px', borderRadius: 14, textAlign: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', fontFamily: S.head }}>{f.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{f.sub}</div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes god-dot-bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-6px); }
          }
        `}</style>
      </div>
    )
  }

  // ── CHAT VIEW ────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 68px)',
      background: BG, color: 'var(--text-primary)', fontFamily: S.font,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ── God header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: `linear-gradient(180deg, ${activeGod.color}12 0%, transparent 100%)`,
        borderBottom: `1px solid ${activeGod.color}25`,
        flexShrink: 0,
      }}>
        {/* Back */}
        <button
          onClick={() => setView('portal')}
          style={{
            width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            flexShrink: 0,
          }}
        >←</button>

        {/* Symbol */}
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: `${activeGod.color}18`, border: `1.5px solid ${activeGod.color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
          boxShadow: `0 0 16px ${activeGod.glow}`,
        }}>
          {activeGod.symbol}
        </div>

        {/* Info + memory tags */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 900, fontFamily: S.head,
            color: activeGod.id === 'zeus' ? '#e2e8f0' : activeGod.color,
            letterSpacing: '-.01em',
          }}>{activeGod.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeGod.title}
          </div>
          {/* Memory stat tags */}
          {memoryInfo?.hasMemory && (
            <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
              {memoryInfo.totalMessages != null && memoryInfo.totalMessages > 0 && (
                <span style={{
                  padding: '1px 6px', borderRadius: 5, fontSize: 8, fontWeight: 700,
                  background: `${activeGod.color}12`, color: `${activeGod.color}cc`,
                  border: `1px solid ${activeGod.color}20`, whiteSpace: 'nowrap',
                }}>
                  {memoryInfo.totalMessages} messages
                </span>
              )}
              {memoryInfo.daysSinceFirstMet != null && (
                <span style={{
                  padding: '1px 6px', borderRadius: 5, fontSize: 8, fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap',
                }}>
                  {formatFirstMet(memoryInfo.daysSinceFirstMet)}
                </span>
              )}
              {memoryInfo.userName && (
                <span style={{
                  padding: '1px 6px', borderRadius: 5, fontSize: 8, fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap',
                }}>
                  Knows you as {memoryInfo.userName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Powers button */}
        <button
          onClick={() => setShowPowers(true)}
          style={{
            padding: '7px 12px', borderRadius: 10, border: `1px solid ${activeGod.color}30`,
            cursor: 'pointer', background: `${activeGod.color}14`,
            color: activeGod.color, fontSize: 11, fontWeight: 700,
            fontFamily: S.head, whiteSpace: 'nowrap',
          }}
        >
          ⚡ Powers
        </button>
      </div>

      {/* ── God switcher tabs ── */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflowX: 'auto', flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        {GOD_ORDER.map(godId => {
          const g = AI_GODS[godId]
          const isActive = activeGodId === godId
          return (
            <button
              key={godId}
              onClick={() => setActiveGodId(godId)}
              style={{
                padding: '5px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                background: isActive ? `${g.color}22` : 'rgba(255,255,255,0.04)',
                color: isActive ? (g.id === 'zeus' ? '#e2e8f0' : g.color) : 'rgba(255,255,255,0.3)',
                outline: isActive ? `1.5px solid ${g.color}40` : 'none',
                transition: 'all .2s',
              }}
            >
              {g.symbol} {g.name}
            </button>
          )
        })}
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 14px',
        display: 'flex', flexDirection: 'column', gap: 14,
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.08) transparent',
      }}>
        {/* Chat loading spinner */}
        {chatLoading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '48px 20px', gap: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: `${activeGod.color}18`, border: `1.5px solid ${activeGod.color}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
              boxShadow: `0 0 24px ${activeGod.glow}`,
              animation: 'god-dot-bounce 1.5s ease-in-out infinite',
            }}>
              {activeGod.symbol}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: S.head, fontWeight: 700 }}>
              Loading conversation with {activeGod.name}...
            </div>
          </div>
        )}

        {/* Messages */}
        {!chatLoading && messages.map((msg, idx) => {
          const isUser = msg.role === 'user'
          const msgGod = msg.godId ? AI_GODS[msg.godId] : activeGod
          return (
            <div
              key={idx}
              style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17,
                background: isUser ? 'rgba(255,255,255,0.07)' : `${msgGod.color}18`,
                border: isUser
                  ? '1px solid rgba(255,255,255,0.1)'
                  : `1px solid ${msgGod.color}30`,
              }}>
                {isUser ? '👤' : msgGod.symbol}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '78%', padding: '12px 16px', borderRadius: 18, fontSize: 13, lineHeight: 1.65,
                background: isUser
                  ? 'rgba(245,158,11,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: isUser
                  ? '1px solid rgba(245,158,11,0.22)'
                  : `1px solid rgba(255,255,255,0.07)`,
                borderTopRightRadius: isUser ? 4 : 18,
                borderTopLeftRadius: isUser ? 18 : 4,
                color: isUser ? '#fde68a' : '#e8f0e8',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 6, textAlign: isUser ? 'right' : 'left' }}>
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          )
        })}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
              background: `${activeGod.color}18`, border: `1px solid ${activeGod.color}30`,
            }}>
              {activeGod.symbol}
            </div>
            <div style={{
              padding: '14px 18px', borderRadius: 18, borderTopLeftRadius: 4,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <LoadingDots color={activeGod.id === 'zeus' ? '#818cf8' : activeGod.color} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: '10px 14px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        background: `linear-gradient(0deg, ${activeGod.color}08 0%, transparent 100%)`,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder={`Ask ${activeGod.name}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                sendMessage(input)
              }
            }}
            style={{
              flex: 1, padding: '13px 18px', borderRadius: 16,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: S.font,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 48, height: 48, borderRadius: 14, border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              background: loading || !input.trim()
                ? 'rgba(255,255,255,0.06)'
                : `linear-gradient(135deg, ${activeGod.color}, ${activeGod.color}bb)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, opacity: loading || !input.trim() ? 0.4 : 1,
              transition: 'all .2s',
              boxShadow: !loading && input.trim() ? `0 4px 16px ${activeGod.glow}` : 'none',
            }}
          >
            {activeGod.symbol}
          </button>
        </div>
      </div>

      {/* ── Powers Sheet (slide-up overlay) ── */}
      {showPowers && (
        <div
          onClick={() => setShowPowers(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 100, backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'var(--bg-card)',
              borderRadius: '24px 24px 0 0',
              border: `1px solid ${activeGod.color}25`,
              borderBottom: 'none',
              maxHeight: '82dvh', display: 'flex', flexDirection: 'column',
              boxShadow: `0 -8px 48px ${activeGod.glow}`,
            }}
          >
            {/* Sheet header */}
            <div style={{
              padding: '16px 20px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid rgba(255,255,255,0.07)`,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{activeGod.symbol}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, fontFamily: S.head, color: activeGod.color }}>
                    {activeGod.name}&apos;s Powers
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                    {activeGod.powers.length} sovereign capabilities
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPowers(false)}
                style={{
                  width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}
              >✕</button>
            </div>

            {/* Powers scrollable list */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '12px 16px 24px',
              display: 'flex', flexDirection: 'column', gap: 8,
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.06) transparent',
            }}>
              {activeGod.powers.map(power => (
                <PowerCard
                  key={power.id}
                  power={power}
                  god={activeGod}
                  onInvoke={invokePower}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes god-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
