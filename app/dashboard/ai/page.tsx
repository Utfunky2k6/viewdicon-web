'use client'
// ════════════════════════════════════════════════════════════════════
// GRIOT 5 AI GOD — The Oracle of the Village
// Five Orisha advisors: Sàngó · Ògún · Òrúnmìlà · Ọbatálá · Yemọja
// GriotSymbol placed at the centre as the user requested.
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { GriotSymbol } from '@/components/dashboard/GriotAI/GriotSymbol'
import { orishaApi } from '@/lib/api'
import { VOCAB } from '@/constants/vocabulary'

type OrishaId = 'SANGO' | 'OGUN' | 'ORUNMILA' | 'OBATALA' | 'YEMOJA'

interface Orisha {
  id: OrishaId
  name: string
  emoji: string
  domain: string
  color: string
  persona: string
  greeting: string
}

const ORISHAS: Orisha[] = [
  { id: 'OBATALA',   name: 'Ọbatálá',   emoji: '🕊️', domain: 'Creation · Clarity',    color: '#ffffff', persona: 'Calm, nurturing, healing',              greeting: 'Breathe. Clarity comes to those who are still. What troubles you?' },
  { id: 'OGUN',      name: 'Ògún',       emoji: '⚒️', domain: 'Technology · Forge',    color: '#1a7c3e', persona: 'Technical, precise, no-nonsense',       greeting: 'Forge it right or not at all. What are you building?' },
  { id: 'SANGO',     name: 'Sàngó',      emoji: '⚡',  domain: 'Justice · Thunder',     color: '#ef4444', persona: 'Bold, direct, cuts through noise',      greeting: 'The thunder speaks. Ask your question and I will cut to the truth.' },
  { id: 'ORUNMILA',  name: 'Òrúnmìlà',  emoji: '📿',  domain: 'Wisdom · Divination',   color: '#d4a017', persona: 'Ancient wisdom, nuanced perspective',   greeting: 'The oracle is open. What question weighs on your spirit?' },
  { id: 'YEMOJA',    name: 'Yemọja',     emoji: '🌊',  domain: 'Community · Rivers',    color: '#0ea5e9', persona: 'Empathetic, community-focused, deep',   greeting: 'The waters carry all emotions. Tell me what flows in your heart.' },
]

interface Message { role: 'user' | 'orisha'; content: string; timestamp: Date }

const DAILY_PROVERBS = [
  { text: 'Agbado tí a bá jẹ papọ̀ ní dun', translation: 'Corn eaten together tastes sweeter', lang: 'Yorùbá', flag: '🇳🇬' },
  { text: 'Umuntu ngumuntu ngabantu', translation: 'A person is a person through others', lang: 'Zulu', flag: '🇿🇦' },
  { text: 'Onipa na ohia onipa', translation: 'A person needs another person', lang: 'Akan', flag: '🇬🇭' },
  { text: 'Mtu ni watu', translation: 'One person is all people', lang: 'Swahili', flag: '🇰🇪' },
  { text: 'Biribi wo soro na ema', translation: 'There is something above us all', lang: 'Twi', flag: '🇬🇭' },
  { text: 'Igi kan kì í da igbó ṣe', translation: 'One tree does not make a forest', lang: 'Yorùbá', flag: '🇳🇬' },
  { text: 'Mkono mmoja haulezi mtoto', translation: 'One hand cannot raise a child', lang: 'Swahili', flag: '🇰🇪' },
]

// Fallback responses when API is unavailable
const FALLBACK_RESPONSES: Record<OrishaId, string[]> = {
  OBATALA:  ['In stillness, answers arise. What does your intuition say?', 'Peace is not the absence of conflict — it is the presence of clarity.', 'Your spirit already knows the answer. Be still and listen.'],
  OGUN:     ['Build first, theorize later. Ship the simplest version.', 'The forge does not care about your feelings — it cares about the heat. Apply pressure.', 'Iron sharpens iron. Find someone who will challenge your work.'],
  SANGO:    ['Power without purpose is wasted thunder. Focus.', 'Justice is not revenge — it is balance restored. What balance do you seek?', 'Strike once, strike true. Do not scatter your energy.'],
  ORUNMILA: ['Wisdom comes from asking the right question. Consider what lies beneath.', 'The Ifá says: your path is not straight, but it is correct. Trust it.', 'Every crossroad is a blessing — it means you have choices.'],
  YEMOJA:   ['Community holds the answer. Have you asked your circle?', 'The river does not fight the rock — it flows around it. Be like water.', 'Your emotions are valid, but they are not facts. Separate the two.'],
}

export default function GriotAIPage() {
  const [active, setActive] = React.useState<Orisha>(ORISHAS[3]) // Default: Òrúnmìlà
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [view, setView] = React.useState<'oracle' | 'chat'>('oracle')
  const endRef = React.useRef<HTMLDivElement>(null)

  const proverb = DAILY_PROVERBS[new Date().getDay() % DAILY_PROVERBS.length]

  React.useEffect(() => {
    setMessages([{ role: 'orisha', content: active.greeting, timestamp: new Date() }])
  }, [active])

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }])
    setInput('')
    setLoading(true)

    try {
      const res = await orishaApi.query(active.id, text) as { response?: string }
      setMessages(prev => [...prev, {
        role: 'orisha',
        content: res?.response ?? 'The oracle is silent. Try again.',
        timestamp: new Date(),
      }])
    } catch {
      const pool = FALLBACK_RESPONSES[active.id]
      setMessages(prev => [...prev, {
        role: 'orisha',
        content: pool[Math.floor(Math.random() * pool.length)],
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const startChat = (orisha: Orisha) => {
    setActive(orisha)
    setView('chat')
  }

  // ── Oracle Home (GriotSymbol hero + 5 gods) ───────────────────
  if (view === 'oracle') {
    return (
      <div style={{
        minHeight: '100dvh', background: '#060a06',
        color: '#f0f5ee', fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
        paddingBottom: 90, display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Hero — GriotSymbol centered */}
        <div style={{
          paddingTop: 30, paddingBottom: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212,160,23,.06) 0%, transparent 70%)',
          width: '100%',
        }}>
          <GriotSymbol size={140} animated glowing />
          <div style={{
            marginTop: 12, fontSize: 22, fontWeight: 900, fontFamily: "'Sora', sans-serif",
            background: 'linear-gradient(90deg, #fbbf24, #ffffff, #fbbf24)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em',
          }}>
            GRIOT 5
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.12em', marginTop: 2, fontWeight: 600 }}>
            AI GOD · FIVE ORISHA · ONE ORACLE
          </div>
        </div>

        {/* Daily Proverb */}
        <div style={{
          margin: '16px 14px 0', padding: '14px 16px',
          background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.15)',
          borderRadius: 16, width: 'calc(100% - 28px)', maxWidth: 440,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', marginBottom: 6 }}>
            {VOCAB.dailyBriefing.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, fontStyle: 'italic', color: '#fbbf24', lineHeight: 1.5 }}>
            "{proverb.text}"
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
            {proverb.translation} — {proverb.flag} {proverb.lang}
          </div>
        </div>

        {/* 5 Orisha Gods */}
        <div style={{
          margin: '20px 14px 0', width: 'calc(100% - 28px)', maxWidth: 440,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em', marginBottom: 10 }}>
            CHOOSE YOUR ORISHA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ORISHAS.map(o => (
              <button
                key={o.id}
                onClick={() => startChat(o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  background: `${o.color}08`, border: `1px solid ${o.color}20`,
                  color: '#f0f5ee', textAlign: 'left', width: '100%',
                  transition: 'all .2s',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${o.color}15`, border: `1px solid ${o.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {o.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: o.color === '#ffffff' ? '#e0e0e0' : o.color }}>
                    {o.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>
                    {o.domain}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontStyle: 'italic', marginTop: 2 }}>
                    {o.persona}
                  </div>
                </div>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,.2)' }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Ask bar at bottom */}
        <div style={{
          position: 'fixed', bottom: 68, left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 28px)', maxWidth: 440, zIndex: 45,
        }}>
          <div style={{
            display: 'flex', gap: 8, padding: '8px 10px',
            background: 'rgba(10,15,10,.95)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212,160,23,.15)', borderRadius: 20,
          }}>
            <input
              placeholder="Ask the Griot anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { startChat(active); } }}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 14,
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
                color: '#f0f5ee', fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={() => startChat(active)}
              style={{
                width: 42, height: 42, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}
            >
              🦅
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Chat View (immersive conversation) ──────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 68px)',
      background: '#060a06', color: '#f0f5ee',
      fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
    }}>
      {/* Chat header with Orisha + back */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderBottom: `1px solid ${active.color}20`,
        background: `${active.color}06`,
      }}>
        <button onClick={() => setView('oracle')} style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,.06)', color: '#f0f5ee', fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${active.color}15`, border: `1px solid ${active.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {active.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: active.color === '#ffffff' ? '#e0e0e0' : active.color }}>
            {active.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{active.domain}</div>
        </div>
        <GriotSymbol size={32} animated={false} glowing={false} />
      </div>

      {/* Orisha tabs (compact horizontal) */}
      <div style={{
        display: 'flex', gap: 4, padding: '6px 12px',
        borderBottom: '1px solid rgba(255,255,255,.04)', overflowX: 'auto',
      }}>
        {ORISHAS.map(o => (
          <button
            key={o.id}
            onClick={() => setActive(o)}
            style={{
              padding: '4px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
              background: active.id === o.id ? `${o.color}20` : 'rgba(255,255,255,.04)',
              color: active.id === o.id ? (o.color === '#ffffff' ? '#e0e0e0' : o.color) : 'rgba(255,255,255,.35)',
              outline: active.id === o.id ? `1.5px solid ${o.color}40` : 'none',
              transition: 'all .2s',
            }}
          >
            {o.emoji} {o.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              background: msg.role === 'orisha' ? `${active.color}18` : 'rgba(255,255,255,.06)',
              border: msg.role === 'orisha' ? `1px solid ${active.color}30` : '1px solid rgba(255,255,255,.1)',
            }}>
              {msg.role === 'orisha' ? active.emoji : '👤'}
            </div>
            <div style={{
              maxWidth: '78%', padding: '10px 14px', borderRadius: 16,
              fontSize: 13, lineHeight: 1.6,
              background: msg.role === 'user' ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)',
              border: msg.role === 'user' ? '1px solid rgba(212,160,23,.2)' : '1px solid rgba(255,255,255,.06)',
              borderTopRightRadius: msg.role === 'user' ? 4 : 16,
              borderTopLeftRadius: msg.role === 'orisha' ? 4 : 16,
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              background: `${active.color}18`, border: `1px solid ${active.color}30`,
            }}>
              {active.emoji}
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4,
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)',
              display: 'flex', gap: 4,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: active.color === '#ffffff' ? '#ccc' : active.color,
                  opacity: 0.6,
                  animation: `griot-dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '8px 12px 12px', borderTop: '1px solid rgba(255,255,255,.06)',
        display: 'flex', gap: 8,
      }}>
        <input
          placeholder={`Ask ${active.name}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend() }}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 16,
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            color: '#f0f5ee', fontSize: 14, outline: 'none',
            fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            width: 46, height: 46, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: loading ? 'rgba(255,255,255,.08)' : `linear-gradient(135deg, ${active.color === '#ffffff' ? '#aaa' : active.color}, ${active.color === '#ffffff' ? '#888' : active.color}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            opacity: loading ? 0.5 : 1, transition: 'all .2s',
          }}
        >
          {active.emoji}
        </button>
      </div>

      <style>{`
        @keyframes griot-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
