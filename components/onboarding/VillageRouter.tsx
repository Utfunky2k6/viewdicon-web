'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VILLAGE_MAP, CanonicalVillage } from '@/constants/villages'
import { routeToVillage } from '@/lib/village-routing'

// ── CSS Keyframes (module-level, parsed once) ─────────────────
const GRIOT_CSS = `
@keyframes griotPulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.45)}50%{box-shadow:0 0 0 10px rgba(74,222,128,0)}}
@keyframes griotGlow{0%,100%{box-shadow:0 0 12px rgba(26,124,62,.4)}50%{box-shadow:0 0 24px rgba(26,124,62,.7)}}
@keyframes dotBounce1{0%,80%,100%{transform:scale(0);opacity:.4}40%{transform:scale(1);opacity:1}}
@keyframes dotBounce2{0%,80%,100%{transform:scale(0);opacity:.4}50%{transform:scale(1);opacity:1}}
@keyframes dotBounce3{0%,80%,100%{transform:scale(0);opacity:.4}60%{transform:scale(1);opacity:1}}
@keyframes ringRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes breathScale{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
`

// ── Types ─────────────────────────────────────────────────────
interface VillageRouterProps {
  onSelect: (village: CanonicalVillage) => void
  onCancel: () => void
  theme: any
}

interface ChatMessage {
  id: string
  role: 'griot' | 'user'
  yorubaIntro?: string
  text: string
}

// ── Questions (conversational Griot style) ────────────────────
const QUESTIONS = [
  {
    yorubaIntro: '\u1EB8 nl\u00E9 o...',
    q: 'Tell me, child \u2014 what work do you do to feed yourself and your people?',
    options: [
      { text: 'A Plow or Hoe (The Soil)', value: 'plow farm soil agbe' },
      { text: 'A Pen or Book (The Mind)', value: 'pen book school akowe' },
      { text: 'A Digital Screen (The Future)', value: 'code tech data app ijinle' },
      { text: 'A Gavel or Scales (The Law)', value: 'gavel law justice idajo' },
      { text: 'A Shield or Badge (Protection)', value: 'shield badge protect ologun' },
    ],
  },
  {
    yorubaIntro: 'Mm-hmm...',
    q: 'And where does your spirit beat strongest when the sun is high?',
    options: [
      { text: 'The Bustling Market (Trade)', value: 'market trade aje exchange' },
      { text: 'The Quiet, Deep Forest (Nature)', value: 'forest nature ode animals' },
      { text: 'The Healing Temple (Restoration)', value: 'heal medicine hospital iwosan' },
      { text: "The Master's Workshop (Creation)", value: 'create art workshop ona' },
      { text: 'The Great Council Hall (Leading)', value: 'lead govern oyegun public' },
    ],
  },
  {
    yorubaIntro: 'Ah, I see...',
    q: 'If your life were a song on the Kora, what song would it sing?',
    options: [
      { text: 'Feeding the Hungry (Agbe/Aje)', value: 'feed food agricultural retail' },
      { text: 'Building the Walls (Ikole)', value: 'build construct infrastructure mason' },
      { text: 'Protecting the Gates (Ologun)', value: 'defend guard security ologun' },
      { text: 'Telling the Truth (Ikede)', value: 'news story media ikede truth' },
      { text: 'Guiding the Spirit (Esin)', value: 'spirit faith esin ritual' },
    ],
  },
  {
    yorubaIntro: 'The ancestors nod...',
    q: 'Who do you build this legacy for first?',
    options: [
      { text: 'The Children yet unborn (Youth)', value: 'youth child future omodun' },
      { text: 'The Ancestors who watch (Heritage)', value: 'ancestor heritage history iran' },
      { text: "The Nation's Power (Energy)", value: 'power energy light infrastructure' },
      { text: 'The Waters that surround us (Ocean)', value: 'ocean water sea ship olokun' },
      { text: 'The Traveler seeking home (Hospitality)', value: 'welcome hotel guest hospitality alejo' },
    ],
  },
  {
    yorubaIntro: 'One final question...',
    q: 'Which element of the Motherland speaks to your calling?',
    options: [
      { text: 'Earth (Solid Roots)', value: 'earth roots soil architecture' },
      { text: 'Fire (Creative Spark)', value: 'fire create spark forge' },
      { text: 'Water (Healing Flow)', value: 'water sea flow spirit' },
      { text: 'Wind (Message Carrier)', value: 'wind news talk communication' },
      { text: 'Iron (The Strength of Sovereignty)', value: 'iron metal logic strength finance' },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────
export default function VillageRouter({ onSelect, onCancel, theme }: VillageRouterProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [answers, setAnswers] = React.useState<string[]>([])
  const [showChips, setShowChips] = React.useState(false)
  const [isTyping, setIsTyping] = React.useState(false)
  const [isRouting, setIsRouting] = React.useState(false)
  const [result, setResult] = React.useState<any>(null)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever chat state changes
  const scrollToBottom = React.useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }, [])

  // Show first Griot question on mount
  React.useEffect(() => {
    setIsTyping(true)
    const timer = setTimeout(() => {
      setIsTyping(false)
      setMessages([
        {
          id: 'griot-0',
          role: 'griot',
          yorubaIntro: QUESTIONS[0].yorubaIntro,
          text: QUESTIONS[0].q,
        },
      ])
      setTimeout(() => setShowChips(true), 200)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, showChips, scrollToBottom])

  // Handle user selecting a quick-reply chip
  const handleOption = (optionText: string, optionValue: string) => {
    setShowChips(false)
    const newAnswers = [...answers, optionValue]
    setAnswers(newAnswers)

    // Add user message bubble
    setMessages((prev) => [
      ...prev,
      { id: `user-${currentQuestion}`, role: 'user', text: optionText },
    ])

    if (currentQuestion < QUESTIONS.length - 1) {
      // Show typing indicator, then next question
      const nextQ = currentQuestion + 1
      setCurrentQuestion(nextQ)
      setIsTyping(true)

      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            id: `griot-${nextQ}`,
            role: 'griot',
            yorubaIntro: QUESTIONS[nextQ].yorubaIntro,
            text: QUESTIONS[nextQ].q,
          },
        ])
        setTimeout(() => setShowChips(true), 200)
      }, 800)
    } else {
      // All questions answered -- divination phase
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            id: 'griot-divining',
            role: 'griot',
            text: 'The ancestors are speaking... I am reading the signs...',
          },
        ])
        processRouting(newAnswers)
      }, 800)
    }
  }

  // API call with local fallback
  const processRouting = async (finalAnswers: string[]) => {
    setIsRouting(true)
    await new Promise((r) => setTimeout(r, 2000))

    try {
      const res = await fetch('/api/v1/griot/village-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      showResultCard(data)
    } catch {
      console.warn('Griot Service offline - using local wisdom')
      const localResult = routeToVillage(finalAnswers)
      showResultCard(localResult)
    }
  }

  const showResultCard = (data: any) => {
    setIsRouting(false)
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const village = VILLAGE_MAP[data.villageId]
      setMessages((prev) => [
        ...prev,
        {
          id: 'griot-reveal',
          role: 'griot',
          text: `The path is clear! The ancestors have spoken. You belong in ${village?.ancientName || village?.name || 'a great village'}...`,
        },
      ])
      setResult(data)
    }, 600)
  }

  const reset = () => {
    setMessages([])
    setCurrentQuestion(0)
    setAnswers([])
    setShowChips(false)
    setIsTyping(false)
    setIsRouting(false)
    setResult(null)

    // Restart conversation after brief pause
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages([
          {
            id: 'griot-0',
            role: 'griot',
            yorubaIntro: QUESTIONS[0].yorubaIntro,
            text: QUESTIONS[0].q,
          },
        ])
        setTimeout(() => setShowChips(true), 200)
      }, 800)
    }, 100)
  }

  const villageColor = result
    ? VILLAGE_MAP[result.villageId]?.color || '#1a7c3e'
    : '#1a7c3e'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: theme.bg || '#060b07',
        color: theme.text || '#f0f7f0',
      }}
    >
      <style>{GRIOT_CSS}</style>

      {/* Texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          pointerEvents: 'none',
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
        }}
      />

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Griot avatar */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a7c3e 0%, #0d4a24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              position: 'relative',
              animation:
                isTyping || isRouting
                  ? 'griotPulse 1.5s ease-in-out infinite'
                  : 'griotGlow 3s ease-in-out infinite',
              border: '2px solid rgba(74,222,128,0.3)',
              flexShrink: 0,
            }}
          >
            <span role="img" aria-label="griot">
              &#x1F985;
            </span>
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              The Griot&apos;s Hut
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#7da882',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.12em',
                marginTop: 2,
              }}
            >
              {isRouting
                ? 'Divining your village...'
                : isTyping
                  ? 'Typing...'
                  : `Pathfinder AI \u00B7 Step ${Math.min(currentQuestion + 1, 5)} of 5`}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onCancel}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 16,
            fontWeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          &#x2715;
        </button>
      </div>

      {/* ── CHAT AREA ───────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 8px',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Message list */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'griot' ? 'flex-start' : 'flex-end',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                {/* Griot mini avatar */}
                {msg.role === 'griot' && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, #1a7c3e, #0d4a24)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      flexShrink: 0,
                      marginBottom: 2,
                      border: '1px solid rgba(74,222,128,0.2)',
                    }}
                  >
                    &#x1F985;
                  </div>
                )}

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: '82%',
                    padding:
                      msg.role === 'griot' ? '12px 16px' : '10px 16px',
                    borderRadius:
                      msg.role === 'griot'
                        ? '2px 16px 16px 16px'
                        : '16px 2px 16px 16px',
                    background:
                      msg.role === 'griot'
                        ? 'rgba(255,255,255,0.04)'
                        : 'linear-gradient(135deg, #1a7c3e 0%, #16652f 100%)',
                    border:
                      msg.role === 'griot'
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(74,222,128,0.2)',
                    borderLeft:
                      msg.role === 'griot'
                        ? '3px solid #1a7c3e'
                        : undefined,
                  }}
                >
                  {/* Yoruba intro */}
                  {msg.role === 'griot' && msg.yorubaIntro && (
                    <div
                      style={{
                        fontSize: 11,
                        fontStyle: 'italic',
                        color: '#d4a017',
                        marginBottom: 4,
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {msg.yorubaIntro}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.55,
                      fontWeight: msg.role === 'griot' ? 600 : 500,
                      color:
                        msg.role === 'griot'
                          ? 'rgba(255,255,255,0.88)'
                          : 'rgba(255,255,255,0.95)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #1a7c3e, #0d4a24)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    flexShrink: 0,
                    marginBottom: 2,
                    border: '1px solid rgba(74,222,128,0.2)',
                    animation: 'griotPulse 1.5s ease-in-out infinite',
                  }}
                >
                  &#x1F985;
                </div>
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '2px 16px 16px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: '3px solid #1a7c3e',
                    display: 'flex',
                    gap: 5,
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#4ade80',
                      display: 'inline-block',
                      animation:
                        'dotBounce1 1.4s infinite ease-in-out both',
                    }}
                  />
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#4ade80',
                      display: 'inline-block',
                      animation:
                        'dotBounce2 1.4s infinite ease-in-out both',
                    }}
                  />
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#4ade80',
                      display: 'inline-block',
                      animation:
                        'dotBounce3 1.4s infinite ease-in-out both',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading / Divination spinner */}
          <AnimatePresence>
            {isRouting && (
              <motion.div
                key="routing-spinner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 0 16px',
                  gap: 20,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 96,
                    height: 96,
                  }}
                >
                  {/* Rotating dashed ring */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: '2px dashed rgba(212,160,23,0.3)',
                      borderRadius: '50%',
                      animation: 'ringRotate 4s linear infinite',
                    }}
                  />
                  {/* Inner orb */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 16,
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, #1a7c3e, #b22222)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      boxShadow: '0 0 30px rgba(26,124,62,0.4)',
                      animation: 'breathScale 2s ease-in-out infinite',
                    }}
                  >
                    &#x1F985;
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: 6,
                    }}
                  >
                    The Griot is Divining...
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#7da882',
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;Consulting the ancestors and the marketplace
                    spirits&rdquo;
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── RESULT CARD ───────────────────────────────────── */}
          <AnimatePresence>
            {result && (
              <motion.div
                key="result-card"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2,
                }}
                style={{ marginTop: 8 }}
              >
                {/* Village reveal card */}
                <div
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Color top bar + emoji */}
                  <div
                    style={{
                      height: 96,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 52,
                      position: 'relative',
                      backgroundColor: `${villageColor}18`,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${villageColor}, ${villageColor}88)`,
                        borderRadius: '0 0 2px 2px',
                      }}
                    />
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 12,
                        delay: 0.4,
                      }}
                    >
                      {VILLAGE_MAP[result.villageId]?.emoji || '\uD83C\uDF0D'}
                    </motion.span>
                  </div>

                  <div style={{ padding: '20px 20px 24px' }}>
                    {/* Village name */}
                    <div
                      style={{
                        textAlign: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#d4a017',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.2em',
                          marginBottom: 6,
                        }}
                      >
                        The Griot&apos;s Recommendation
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 900,
                          fontFamily: '"Cinzel","Palatino",serif',
                          letterSpacing: '0.06em',
                          color: `${villageColor}`,
                          lineHeight: 1.2,
                          textShadow: `0 0 20px ${villageColor}60`,
                        }}
                      >
                        {VILLAGE_MAP[result.villageId]?.ancientName ||
                          VILLAGE_MAP[result.villageId]?.name ||
                          'Unknown Village'}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.5)',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.16em',
                          marginTop: 4,
                        }}
                      >
                        {VILLAGE_MAP[result.villageId]?.nationFull?.split('·')[0]?.trim() || ''}
                      </div>
                    </div>

                    {/* Griot explanation */}
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        padding: '14px 16px',
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          lineHeight: 1.65,
                          color: 'rgba(255,255,255,0.65)',
                          fontStyle: 'italic',
                        }}
                      >
                        &ldquo;{result.griotExplanation}&rdquo;
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '0 2px',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.35)',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.06em',
                        }}
                      >
                        Griot Confidence
                      </span>
                      <span style={{ color: '#4ade80' }}>
                        {result.confidence}% Match
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 99,
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${result.confidence}%`,
                        }}
                        transition={{
                          duration: 1.2,
                          ease: 'easeOut',
                          delay: 0.5,
                        }}
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, #1a7c3e, ${villageColor})`,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Action buttons ──────────────────────────── */}
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Primary: Enter Village */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      onSelect(
                        VILLAGE_MAP[result.villageId] ||
                          VILLAGE_MAP.holdings
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      borderRadius: 14,
                      border: 'none',
                      background: `linear-gradient(135deg, #1a7c3e 0%, ${villageColor} 100%)`,
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 16px rgba(26,124,62,0.3)',
                      letterSpacing: '0.01em',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 6px 24px rgba(26,124,62,0.45)'
                      e.currentTarget.style.transform =
                        'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 4px 16px rgba(26,124,62,0.3)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    Enter This Village &#x2192;
                  </motion.button>

                  {/* Secondary: Choose Manually */}
                  <button
                    onClick={onCancel}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      letterSpacing: '0.02em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color =
                        'rgba(255,255,255,0.6)'
                      e.currentTarget.style.borderColor =
                        'rgba(255,255,255,0.14)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        'rgba(255,255,255,0.03)'
                      e.currentTarget.style.color =
                        'rgba(255,255,255,0.4)'
                      e.currentTarget.style.borderColor =
                        'rgba(255,255,255,0.08)'
                    }}
                  >
                    Choose Manually Instead
                  </button>

                  {/* Retry link */}
                  <button
                    onClick={reset}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.25)',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.16em',
                      cursor: 'pointer',
                      padding: '8px 0',
                      transition: 'color 0.2s ease',
                      textAlign: 'center' as const,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#d4a017'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        'rgba(255,255,255,0.25)'
                    }}
                  >
                    &#x21BB; Start Over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={chatEndRef} style={{ height: 1 }} />
        </div>

        {/* ── QUICK-REPLY CHIPS ──────────────────────────────── */}
        <AnimatePresence>
          {showChips && !result && !isRouting && !isTyping && (
            <motion.div
              key={`chips-${currentQuestion}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                paddingTop: 20,
                paddingBottom: 8,
                position: 'sticky',
                bottom: 0,
                background: `linear-gradient(to top, ${theme.bg || '#060b07'} 70%, transparent 100%)`,
              }}
            >
              {QUESTIONS[currentQuestion]?.options.map((opt, i) => (
                <motion.button
                  key={`${currentQuestion}-${i}`}
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOption(opt.text, opt.value)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.78)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    lineHeight: 1.3,
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap' as const,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'rgba(74,222,128,0.12)'
                    e.currentTarget.style.borderColor =
                      'rgba(74,222,128,0.4)'
                    e.currentTarget.style.color = '#4ade80'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255,255,255,0.06)'
                    e.currentTarget.style.borderColor =
                      'rgba(255,255,255,0.12)'
                    e.currentTarget.style.color =
                      'rgba(255,255,255,0.78)'
                  }}
                >
                  {opt.text}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER QUOTE ────────────────────────────────────── */}
      {!result && (
        <div
          style={{
            padding: '12px 24px 16px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.18)',
              fontStyle: 'italic',
              fontWeight: 500,
              lineHeight: 1.6,
              maxWidth: 240,
              margin: '0 auto',
            }}
          >
            &ldquo;A person who does not know their path is a guest in
            every village.&rdquo;
          </div>
        </div>
      )}
    </div>
  )
}
