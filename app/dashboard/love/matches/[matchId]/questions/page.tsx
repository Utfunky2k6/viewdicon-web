'use client'
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'
import { useAuthStore } from '@/stores/authStore'

// ═══════════════════════════════════════════════════════════════════════
// UFÈ — 200-QUESTION ENGINE
// Route: /dashboard/love/matches/[matchId]/questions
// The core compatibility engine — structured questions sealed until
// both partners answer, then revealed together with AI analysis.
// ═══════════════════════════════════════════════════════════════════════

const GOLD   = '#D4AF37'
const BG     = '#0A0A0F'
const CARD   = '#111118'
const CARD2  = '#1A1A25'
const GREEN  = '#00C853'
const RED    = '#FF3B30'
const WHITE  = '#FFFFFF'
const PURPLE = '#8B5CF6'
const SEALED = '#2D2D3A'

type AnswerType = 'MCQ' | 'TEXT' | 'SCALE'
type QuestionStatus = 'UNANSWERED' | 'AWAITING_PARTNER' | 'REVEALED'

interface Question {
  id: string
  category: string
  question: string
  answerType: AnswerType
  options?: string[]
  weight: number
  conflictFlag: boolean
  dealBreakerFlag: boolean
  sessionIndex: number
}

interface Answer {
  questionId: string
  myAnswer: string | null
  partnerAnswer: string | null
  status: QuestionStatus
  aiNote?: string
  conflictDetected?: boolean
}

interface DailySession {
  sessionId: string
  station: number
  dayNumber: number
  questions: Question[]
  totalAnswered: number
  totalInSession: number
  aiSummary?: string
  sessionComplete: boolean
}

interface Progress {
  station: number
  answeredStation1: number
  answeredStation2: number
  answeredStation3: number
  totalAnswered: number
  overallPercent: number
  currentStation: string
}

const STATION_META = {
  1: { label: 'Station 1 — Alignment',   color: GOLD,   desc: '72 hours · 40 questions · Basic compatibility', maxQ: 40  },
  2: { label: 'Station 2 — Truth',        color: '#60a5fa', desc: '5 days · 80 questions · Deeper truth & conflict', maxQ: 80  },
  3: { label: 'Station 3 — Commitment',   color: PURPLE, desc: '14 days · 80 questions · Family & future vision', maxQ: 80  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Identity & Values':         GOLD,
  'Family & In-laws':          '#f97316',
  'Children & Parenting':      GREEN,
  'Money & Assets':            '#22d3ee',
  'Conflict & Discipline':     RED,
  'Religion & Spirituality':   PURPLE,
  'Intimacy & Boundaries':     '#ec4899',
  'Lifestyle & Roles':         '#60a5fa',
  'Crisis Handling':           '#fb923c',
  'Legacy & Future Vision':    GOLD,
}

const SCALE_LABELS = ['Completely Disagree', 'Disagree', 'Neutral', 'Agree', 'Completely Agree']

const KEYFRAMES = `
@keyframes sealPulse {
  0%,100% { transform: scale(1); opacity: .8; }
  50%      { transform: scale(1.08); opacity: 1; }
}
@keyframes revealIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
`

export default function QuestionsPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router   = useRouter()
  const { user } = useAuthStore()

  const [session,   setSession]   = React.useState<DailySession | null>(null)
  const [answers,   setAnswers]   = React.useState<Record<string, Answer>>({})
  const [progress,  setProgress]  = React.useState<Progress | null>(null)
  const [activeQ,   setActiveQ]   = React.useState(0)        // index into session.questions
  const [loading,   setLoading]   = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [showSummary, setShowSummary] = React.useState(false)
  const [station,   setStation]   = React.useState(1)

  // Current answer input state
  const [mcqChoice,  setMcqChoice]  = React.useState<string | null>(null)
  const [textAnswer, setTextAnswer] = React.useState('')
  const [scaleValue, setScaleValue] = React.useState<number | null>(null)
  const [explanation, setExplanation] = React.useState('')

  const currentQ = session?.questions[activeQ] ?? null

  // ── Load session + progress ──────────────────────────────────────
  const loadData = React.useCallback(async (st: number) => {
    if (!matchId) return
    setLoading(true)
    try {
      const [sessionRes, progressRes, answersRes] = await Promise.all([
        loveWorldApi.startDailySession(matchId, st).catch((e) => { logApiFailure('love/questions/session', e); return null }),
        loveWorldApi.getQuestionProgress(matchId).catch((e) => { logApiFailure('love/questions/progress', e); return null }),
        loveWorldApi.getRevealedAnswers(matchId, st).catch((e) => { logApiFailure('love/questions/answers', e); return null }),
      ])

      if (sessionRes) {
        const s = sessionRes?.data ?? sessionRes
        setSession(s)
        if (s?.questions?.length && s.sessionComplete) {
          setShowSummary(true)
        }
      }

      if (progressRes) {
        const p = progressRes?.data ?? progressRes
        setProgress(p)
        if (p?.station) setStation(Math.min(3, p.station))
      }

      if (answersRes) {
        const arr: Answer[] = Array.isArray(answersRes) ? answersRes : answersRes?.data ?? []
        const map: Record<string, Answer> = {}
        arr.forEach(a => { map[a.questionId] = a })
        setAnswers(map)
      }
    } catch (e) { logApiFailure('love/questions/submit', e) } finally {
      setLoading(false)
    }
  }, [matchId])

  React.useEffect(() => { loadData(station) }, [loadData, station])

  // Reset input when moving to next question
  React.useEffect(() => {
    setMcqChoice(null)
    setTextAnswer('')
    setScaleValue(null)
    setExplanation('')
  }, [activeQ])

  // ── Submit an answer ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!currentQ || submitting) return
    if (currentQ.answerType === 'MCQ'   && !mcqChoice)       return
    if (currentQ.answerType === 'TEXT'  && !textAnswer.trim()) return
    if (currentQ.answerType === 'SCALE' && scaleValue === null) return

    setSubmitting(true)
    try {
      const res = await loveWorldApi.submitAnswer(matchId, {
        questionId:  currentQ.id,
        station,
        answerType:  currentQ.answerType,
        mcqChoice:   mcqChoice ?? undefined,
        textAnswer:  textAnswer.trim() || undefined,
        scaleValue:  scaleValue ?? undefined,
        explanation: explanation.trim() || undefined,
      })

      // Update local answer state
      const newAnswer: Answer = {
        questionId:      currentQ.id,
        myAnswer:        mcqChoice ?? textAnswer ?? String(scaleValue),
        partnerAnswer:   null,
        status:          'AWAITING_PARTNER',
        conflictDetected: res?.data?.conflictDetected ?? false,
        aiNote:          res?.data?.aiNote,
      }
      setAnswers(prev => ({ ...prev, [currentQ.id]: newAnswer }))

      // Move to next question if not last
      if (activeQ < (session?.questions.length ?? 1) - 1) {
        setActiveQ(prev => prev + 1)
      } else {
        // Session complete — refresh to get summary
        await loadData(station)
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to submit answer. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  const isAnswered = (qId: string) => {
    const a = answers[qId]
    return a && a.myAnswer !== null
  }

  const isRevealed = (qId: string) => {
    const a = answers[qId]
    return a?.status === 'REVEALED'
  }

  // ═ RENDER ══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{KEYFRAMES}</style>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 10, height: 20 + i * 10, background: GOLD, borderRadius: 4, margin: '0 6px', animation: `sealPulse ${0.6 + i * 0.1}s ease-in-out infinite` }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: WHITE, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{KEYFRAMES}</style>

      {/* ── Top Bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: BG, borderBottom: `1px solid ${SEALED}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: CARD2, border: 'none', color: WHITE, cursor: 'pointer', fontSize: 16 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: STATION_META[station as 1|2|3]?.color, fontFamily: "'Sora', sans-serif" }}>
            {STATION_META[station as 1|2|3]?.label}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{STATION_META[station as 1|2|3]?.desc}</div>
        </div>
        {/* Progress pill */}
        {progress && (
          <div style={{ padding: '4px 12px', borderRadius: 99, background: CARD2, fontSize: 10, fontWeight: 700, color: GOLD }}>
            {progress.totalAnswered}/200
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px 100px' }}>

        {/* ── Station Selector ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {([1,2,3] as const).map(s => (
            <button key={s} onClick={() => { setStation(s); setActiveQ(0) }} style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: `1px solid ${station === s ? STATION_META[s].color : SEALED}`,
              background: station === s ? `${STATION_META[s].color}18` : CARD, color: station === s ? STATION_META[s].color : 'rgba(255,255,255,.4)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}>
              {s === 1 ? 'Alignment' : s === 2 ? 'Truth' : 'Commitment'}
            </button>
          ))}
        </div>

        {/* ── Progress Bar ── */}
        {progress && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Overall Journey</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: GOLD }}>{progress.overallPercent ?? 0}% complete</span>
            </div>
            <div style={{ height: 6, background: SEALED, borderRadius: 99 }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${progress.overallPercent ?? 0}%`, background: `linear-gradient(90deg,${GOLD},${GREEN})`, transition: 'width .6s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {[
                { label: 'S1', answered: progress.answeredStation1, max: 40, color: GOLD },
                { label: 'S2', answered: progress.answeredStation2, max: 80, color: '#60a5fa' },
                { label: 'S3', answered: progress.answeredStation3, max: 80, color: PURPLE },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: CARD2, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.answered}/{s.max}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Session Summary (if complete) ── */}
        {showSummary && session?.aiSummary && (
          <div style={{ marginBottom: 20, padding: 16, borderRadius: 16, background: `${PURPLE}18`, border: `1px solid ${PURPLE}40` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: PURPLE, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🧠</span> AI Session Summary
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.7 }}>{session.aiSummary}</div>
          </div>
        )}

        {/* ── Question Queue (sidebar pills) ── */}
        {session?.questions && session.questions.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
              {session.questions.map((q, i) => {
                const answered = isAnswered(q.id)
                const revealed = isRevealed(q.id)
                return (
                  <button key={q.id} onClick={() => setActiveQ(i)} style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: `2px solid ${i === activeQ ? GOLD : answered ? GREEN : SEALED}`,
                    background: i === activeQ ? `${GOLD}20` : answered ? `${GREEN}15` : CARD2,
                    color: i === activeQ ? GOLD : answered ? GREEN : 'rgba(255,255,255,.35)',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {revealed ? '✓' : answered ? '⏳' : i + 1}
                  </button>
                )
              })}
            </div>

            {/* ── Active Question Card ── */}
            {currentQ && (
              <div style={{ borderRadius: 20, background: CARD, border: `1px solid ${SEALED}`, overflow: 'hidden', marginBottom: 16 }}>
                {/* Category header */}
                <div style={{ padding: '12px 16px', background: CARD2, borderBottom: `1px solid ${SEALED}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[currentQ.category] ?? GOLD }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: CATEGORY_COLORS[currentQ.category] ?? GOLD }}>{currentQ.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {currentQ.dealBreakerFlag && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: RED, padding: '2px 8px', borderRadius: 99, border: `1px solid ${RED}60`, background: `${RED}10` }}>Deal Breaker</span>
                    )}
                    {currentQ.conflictFlag && !currentQ.dealBreakerFlag && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#f97316', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(249,115,22,.4)', background: 'rgba(249,115,22,.08)' }}>Conflict Sensitive</span>
                    )}
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', padding: '2px 8px', borderRadius: 99, background: SEALED }}>
                      Weight: {currentQ.weight}/10
                    </span>
                  </div>
                </div>

                <div style={{ padding: 20 }}>
                  {/* Question text */}
                  <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, lineHeight: 1.6, marginBottom: 20 }}>
                    {currentQ.question}
                  </div>

                  {/* ── Already answered — show seal ── */}
                  {isAnswered(currentQ.id) ? (
                    <div>
                      {isRevealed(currentQ.id) ? (
                        /* REVEALED — show both answers */
                        <div style={{ animation: 'revealIn .4s ease' }}>
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: GREEN, marginBottom: 6 }}>✅ BOTH ANSWERED — REVEALED</div>
                            {[
                              { label: 'Your Answer', value: answers[currentQ.id]?.myAnswer, color: GOLD },
                              { label: "Partner's Answer", value: answers[currentQ.id]?.partnerAnswer, color: PURPLE },
                            ].map(a => (
                              <div key={a.label} style={{ padding: '10px 14px', borderRadius: 12, background: CARD2, border: `1px solid ${a.color}30`, marginBottom: 8 }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: a.color, marginBottom: 4 }}>{a.label}</div>
                                <div style={{ fontSize: 13, color: WHITE }}>{a.value ?? '—'}</div>
                              </div>
                            ))}
                          </div>
                          {answers[currentQ.id]?.conflictDetected && (
                            <div style={{ padding: 12, borderRadius: 12, background: `${RED}10`, border: `1px solid ${RED}40`, marginBottom: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: RED, marginBottom: 4 }}>⚠️ POTENTIAL CONFLICT DETECTED</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{answers[currentQ.id]?.aiNote ?? 'Your answers suggest different perspectives. Consider discussing this with your Journey Counselor.'}</div>
                            </div>
                          )}
                          {answers[currentQ.id]?.aiNote && !answers[currentQ.id]?.conflictDetected && (
                            <div style={{ padding: 12, borderRadius: 12, background: `${PURPLE}10`, border: `1px solid ${PURPLE}30` }}>
                              <div style={{ fontSize: 9, fontWeight: 800, color: PURPLE, marginBottom: 4 }}>🧠 AI INSIGHT</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{answers[currentQ.id]?.aiNote}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* AWAITING PARTNER */
                        <div style={{ textAlign: 'center', padding: '24px 16px', animation: 'sealPulse 2s ease-in-out infinite' }}>
                          <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 6 }}>Your answer is sealed</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>
                            Waiting for your partner to answer. Once they do, both answers will be revealed simultaneously.
                          </div>
                          <div style={{ marginTop: 12, padding: '8px 14px', borderRadius: 10, background: CARD2, display: 'inline-block' }}>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>Your sealed answer</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: WHITE, marginTop: 2 }}>
                              {answers[currentQ.id]?.myAnswer ?? '—'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Unanswered — show input ── */
                    <div>
                      {currentQ.answerType === 'MCQ' && currentQ.options && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                          {currentQ.options.map(opt => (
                            <button key={opt} onClick={() => setMcqChoice(opt)} style={{
                              padding: '12px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                              border: `1.5px solid ${mcqChoice === opt ? GOLD : SEALED}`,
                              background: mcqChoice === opt ? `${GOLD}15` : CARD2,
                              color: mcqChoice === opt ? GOLD : 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: mcqChoice === opt ? 700 : 500,
                              transition: 'all .15s',
                            }}>
                              {mcqChoice === opt && <span style={{ marginRight: 8 }}>✓</span>}{opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {currentQ.answerType === 'TEXT' && (
                        <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                          placeholder="Write your honest answer..." rows={4}
                          style={{ width: '100%', padding: 14, borderRadius: 12, background: CARD2, border: `1px solid ${SEALED}`, color: WHITE, fontSize: 13, lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' }}
                        />
                      )}

                      {currentQ.answerType === 'SCALE' && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                            {[1,2,3,4,5].map(v => (
                              <button key={v} onClick={() => setScaleValue(v)} style={{
                                flex: 1, padding: '14px 0', borderRadius: 10, cursor: 'pointer',
                                border: `1.5px solid ${scaleValue === v ? GOLD : SEALED}`,
                                background: scaleValue === v ? `${GOLD}20` : CARD2,
                                color: scaleValue === v ? GOLD : 'rgba(255,255,255,.4)',
                                fontSize: 16, fontWeight: 800, transition: 'all .15s',
                              }}>{v}</button>
                            ))}
                          </div>
                          {scaleValue && (
                            <div style={{ textAlign: 'center', fontSize: 11, color: GOLD, fontWeight: 700 }}>
                              {SCALE_LABELS[scaleValue - 1]}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Optional explanation for scale/MCQ */}
                      {(currentQ.answerType !== 'TEXT' && (mcqChoice || scaleValue !== null)) && (
                        <textarea value={explanation} onChange={e => setExplanation(e.target.value)}
                          placeholder="Optional: Add context or explanation to your answer..." rows={2}
                          style={{ width: '100%', padding: 12, borderRadius: 10, background: CARD2, border: `1px solid ${SEALED}`, color: 'rgba(255,255,255,.7)', fontSize: 12, lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' }}
                        />
                      )}

                      {/* Submit */}
                      <button onClick={handleSubmit} disabled={submitting || (!mcqChoice && !textAnswer.trim() && scaleValue === null)}
                        style={{
                          width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: 'pointer',
                          background: 'linear-gradient(135deg,#b8860b,#D4AF37)',
                          color: '#000', fontSize: 14, fontWeight: 800, fontFamily: "'Sora', sans-serif",
                          opacity: submitting || (!mcqChoice && !textAnswer.trim() && scaleValue === null) ? 0.5 : 1,
                          transition: 'opacity .2s',
                        }}
                      >
                        {submitting ? 'Sealing your answer...' : '🔒 Seal & Submit Answer'}
                      </button>

                      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,.3)', lineHeight: 1.6 }}>
                        Your answer is encrypted and sealed until your partner also answers. Neither will see the other's response until both have submitted.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Empty state — no session yet ── */}
        {!loading && !session?.questions?.length && (
          <div style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 20, background: CARD, border: `1px solid ${SEALED}` }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📜</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: WHITE, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
              No Active Session
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto 20px' }}>
              Your daily question session hasn't started yet. Sessions unlock daily throughout your station journey. Come back tomorrow if you've completed today's session.
            </div>
            <button onClick={() => loadData(station)} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,#b8860b,${GOLD})`, color: '#000', fontSize: 13, fontWeight: 800 }}>
              Check for New Session
            </button>
          </div>
        )}

        {/* ── Navigation ── */}
        {session?.questions && session.questions.length > 1 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={() => setActiveQ(Math.max(0, activeQ - 1))} disabled={activeQ === 0}
              style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${SEALED}`, background: CARD2, color: activeQ === 0 ? 'rgba(255,255,255,.2)' : WHITE, fontSize: 13, fontWeight: 700, cursor: activeQ === 0 ? 'not-allowed' : 'pointer' }}>
              ← Previous
            </button>
            <button onClick={() => setActiveQ(Math.min((session.questions.length) - 1, activeQ + 1))} disabled={activeQ === session.questions.length - 1}
              style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${SEALED}`, background: CARD2, color: activeQ === session.questions.length - 1 ? 'rgba(255,255,255,.2)' : WHITE, fontSize: 13, fontWeight: 700, cursor: activeQ === session.questions.length - 1 ? 'not-allowed' : 'pointer' }}>
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
