'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { VILLAGE_BY_ID, type Village } from '@/lib/villages-data'
import { selectQuizQuestions, scoreQuiz, type QuizQuestion, type QuizResult } from '@/lib/african-knowledge-quiz'
import { villageApplicationApi } from '@/lib/api'

// ── Constants ────────────────────────────────────────────────────
const BG = '#060b07'
const TEXT = '#f0f7f0'
const TEXT_DIM = 'rgba(240,247,240,.45)'
const TEXT_MID = 'rgba(240,247,240,.65)'
const ACCENT = '#4ade80'
const GOLD = '#d4a017'
const RED = '#b22222'
const CARD_BG = 'rgba(255,255,255,.04)'
const CARD_BORDER = 'rgba(255,255,255,.08)'

const SECTIONS = ['connection', 'quiz', 'contribution', 'review'] as const
type Section = typeof SECTIONS[number]

const SECTION_LABELS: Record<Section, string> = {
  connection: 'Personal Connection',
  quiz: 'African Knowledge Quiz',
  contribution: 'Contribution Plan',
  review: 'Review & Submit',
}

// ── Page Component ───────────────────────────────────────────────
export default function VillageApplyPage() {
  const params = useParams()
  const router = useRouter()
  const villageId = params.villageId as string
  const village: Village | undefined = VILLAGE_BY_ID[villageId]

  // ── Section state ────────────────────────────────────────────
  const [currentSection, setCurrentSection] = React.useState(0)

  // ── Section 1: Personal Connection ───────────────────────────
  const [personalConnection, setPersonalConnection] = React.useState('')

  // ── Section 2: Quiz ──────────────────────────────────────────
  const [questions] = React.useState<QuizQuestion[]>(() => selectQuizQuestions(10))
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [quizResult, setQuizResult] = React.useState<QuizResult | null>(null)
  const [quizFinished, setQuizFinished] = React.useState(false)

  // ── Section 3: Contribution ──────────────────────────────────
  const [contributionPlan, setContributionPlan] = React.useState('')

  // ── Section 4: Submit ────────────────────────────────────────
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [applicationId, setApplicationId] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // ── Helpers ──────────────────────────────────────────────────
  const section = SECTIONS[currentSection]

  const canAdvance = (): boolean => {
    switch (section) {
      case 'connection':
        return personalConnection.trim().length >= 200
      case 'quiz':
        return quizFinished && (quizResult?.passed ?? false)
      case 'contribution':
        return contributionPlan.trim().length >= 150
      case 'review':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1)
    }
  }

  // ── Quiz answer handler ──────────────────────────────────────
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1)
    } else {
      // Finish quiz
      const answerArray = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? -1,
      }))
      const result = scoreQuiz(answerArray)
      setQuizResult(result)
      setQuizFinished(true)
    }
  }

  // ── Submit handler ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!quizResult) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const answerArray = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? -1,
      }))

      const res = await villageApplicationApi.submit({
        villageId,
        personalConnection: personalConnection.trim(),
        quizScore: quizResult.percentage,
        quizAnswers: answerArray,
        contributionPlan: contributionPlan.trim(),
      })
      setApplicationId(res.applicationId)
      setSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed. Please try again.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── If village not found ─────────────────────────────────────
  if (!village) {
    return (
      <div style={{ background: BG, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🏘️</div>
        <div style={{ color: TEXT, fontSize: 16, fontWeight: 700 }}>Village not found</div>
        <button
          onClick={() => router.push('/dashboard/villages')}
          style={{
            padding: '10px 24px', borderRadius: 14, border: 'none',
            background: ACCENT, color: '#060b07', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Back to Villages
        </button>
      </div>
    )
  }

  // ── Success state ────────────────────────────────────────────
  if (submitted && applicationId) {
    return (
      <div style={{ background: BG, minHeight: '100dvh', padding: '40px 16px' }}>
        <div style={{
          maxWidth: 520, margin: '0 auto',
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16,
          padding: '32px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{village.emoji}</div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800, color: ACCENT, margin: '0 0 8px' }}>
            Application Submitted
          </h2>
          <p style={{ fontSize: 13, color: TEXT_MID, lineHeight: 1.6, margin: '0 0 20px' }}>
            Your application to join <strong style={{ color: village.color }}>{village.name}</strong> has been received.
          </p>

          <div style={{
            background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.2)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
              Application ID
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: ACCENT, fontFamily: 'monospace' }}>
              {applicationId}
            </div>
          </div>

          <div style={{
            background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.2)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 24,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 6 }}>
              What happens next?
            </div>
            <p style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.6, margin: 0 }}>
              Your application will be reviewed by the village elders. You need at least <strong style={{ color: GOLD }}>2 endorsements</strong> from existing village members to strengthen your application. Share your application ID with members who can vouch for you.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/dashboard/villages')}
              style={{
                padding: '10px 20px', borderRadius: 14,
                background: 'rgba(255,255,255,.06)', border: `1px solid ${CARD_BORDER}`,
                color: TEXT_MID, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Back to Villages
            </button>
            <button
              onClick={() => router.push(`/dashboard/villages/${villageId}`)}
              style={{
                padding: '10px 20px', borderRadius: 14, border: 'none',
                background: `linear-gradient(135deg, ${village.color}, ${village.color}cc)`,
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              View Village
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Category label helper ────────────────────────────────────
  const categoryEmoji: Record<string, string> = {
    geography: '🌍', culture: '🎭', proverbs: '📜', history: '📚',
    food: '🍲', music: '🎵', language: '🗣️', current_affairs: '📰',
  }
  const categoryLabel = (cat: string) => cat.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  // ── Main render ──────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100dvh', paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div style={{
        padding: '18px 16px 14px',
        background: `linear-gradient(180deg, ${village.color}18 0%, transparent 100%)`,
        borderBottom: `1px solid ${CARD_BORDER}`,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none', color: TEXT_MID, fontSize: 13,
            cursor: 'pointer', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>&#8592;</span> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg,${village.color}cc,${village.color}55)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            boxShadow: `0 4px 12px ${village.color}33`,
          }}>
            {village.emoji}
          </div>
          <div>
            <h1 style={{ fontFamily: '"Cinzel","Palatino",serif', fontSize: 18, fontWeight: 800, color: village.color, margin: 0, letterSpacing: '0.04em' }}>
              {village.ancientName}
            </h1>
            <p style={{ fontSize: 11, color: TEXT, fontWeight: 600, margin: '2px 0 0' }}>
              Apply · {village.nationFull?.split('·')[0]?.trim() || village.category}
            </p>
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          {SECTIONS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1, height: 4, borderRadius: 99,
                background: i <= currentSection
                  ? (i < currentSection ? ACCENT : `${ACCENT}88`)
                  : 'rgba(255,255,255,.08)',
                transition: 'background .3s',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>
            Step {currentSection + 1} of {SECTIONS.length}
          </span>
          <span style={{ fontSize: 11, color: TEXT_DIM }}>
            {SECTION_LABELS[section]}
          </span>
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ padding: '20px 16px', maxWidth: 560, margin: '0 auto' }}>

        {/* ────────────── SECTION 1: Personal Connection ────────────── */}
        {section === 'connection' && (
          <div style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16,
            padding: '24px 20px',
          }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>
              Your Connection to Africa
            </h2>
            <p style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.6, margin: '0 0 20px' }}>
              Tell us why you want to join <strong style={{ color: village.color }}>{village.name}</strong> and describe your connection to Africa. What draws you to this community? What experiences have shaped your understanding of African culture?
            </p>

            <textarea
              value={personalConnection}
              onChange={(e) => setPersonalConnection(e.target.value)}
              placeholder="Share your story... Why does this village call to you? What is your connection to Africa and her people?"
              style={{
                width: '100%', minHeight: 200, padding: '14px 16px',
                background: 'rgba(255,255,255,.03)', border: `1px solid ${personalConnection.length >= 200 ? `${ACCENT}40` : CARD_BORDER}`,
                borderRadius: 14, color: TEXT, fontSize: 13, lineHeight: 1.7,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `${village.color}60`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = personalConnection.length >= 200 ? `${ACCENT}40` : CARD_BORDER
              }}
            />

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: personalConnection.length >= 200 ? ACCENT : (personalConnection.length >= 150 ? GOLD : TEXT_DIM),
              }}>
                {personalConnection.length} / 200 min characters
              </span>
              {personalConnection.length >= 200 && (
                <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Ready</span>
              )}
            </div>
          </div>
        )}

        {/* ────────────── SECTION 2: African Knowledge Quiz ────────────── */}
        {section === 'quiz' && !quizFinished && (
          <div style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16,
            padding: '24px 20px',
          }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>
              African Knowledge Quiz
            </h2>
            <p style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.6, margin: '0 0 16px' }}>
              Answer 10 questions about African culture, history, geography, and more. You need at least 60% to pass.
            </p>

            {/* Mini circles progress */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
              {questions.map((_, i) => {
                const answered = answers[questions[i].id] !== undefined
                const isCurrent = i === currentQuestion
                return (
                  <div
                    key={i}
                    style={{
                      width: isCurrent ? 28 : 20, height: 20, borderRadius: 99,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCurrent
                        ? `${village.color}30`
                        : answered
                          ? `${ACCENT}22`
                          : 'rgba(255,255,255,.06)',
                      border: `1.5px solid ${isCurrent ? village.color : answered ? `${ACCENT}50` : 'rgba(255,255,255,.1)'}`,
                      transition: 'all .2s',
                    }}
                  >
                    <span style={{
                      fontSize: 9, fontWeight: 800,
                      color: isCurrent ? village.color : answered ? ACCENT : TEXT_DIM,
                    }}>
                      {answered && !isCurrent ? '\u2713' : i + 1}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Current question */}
            {(() => {
              const q = questions[currentQuestion]
              const selectedIdx = answers[q.id]
              return (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                  }}>
                    <span style={{ fontSize: 14 }}>{categoryEmoji[q.category] ?? '?'}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: village.color,
                      textTransform: 'uppercase', letterSpacing: '.06em',
                    }}>
                      {categoryLabel(q.category)}
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 9, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 99,
                      background: q.difficulty === 'hard' ? 'rgba(178,34,34,.15)' : q.difficulty === 'medium' ? 'rgba(212,160,23,.15)' : 'rgba(74,222,128,.1)',
                      color: q.difficulty === 'hard' ? RED : q.difficulty === 'medium' ? GOLD : ACCENT,
                      border: `1px solid ${q.difficulty === 'hard' ? 'rgba(178,34,34,.3)' : q.difficulty === 'medium' ? 'rgba(212,160,23,.3)' : 'rgba(74,222,128,.2)'}`,
                      textTransform: 'uppercase',
                    }}>
                      {q.difficulty}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.6, margin: '0 0 16px' }}>
                    {q.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = selectedIdx === oi
                      return (
                        <button
                          key={oi}
                          onClick={() => handleSelectAnswer(q.id, oi)}
                          style={{
                            width: '100%', textAlign: 'left',
                            padding: '12px 14px', borderRadius: 14,
                            background: isSelected ? `${village.color}15` : 'rgba(255,255,255,.03)',
                            border: `1.5px solid ${isSelected ? `${village.color}60` : 'rgba(255,255,255,.08)'}`,
                            color: isSelected ? TEXT : TEXT_MID,
                            fontSize: 13, fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer', transition: 'all .15s',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                            border: `2px solid ${isSelected ? village.color : 'rgba(255,255,255,.15)'}`,
                            background: isSelected ? village.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .15s',
                          }}>
                            {isSelected && (
                              <div style={{ width: 8, height: 8, borderRadius: 99, background: '#fff' }} />
                            )}
                          </div>
                          {opt}
                        </button>
                      )
                    })}
                  </div>

                  {/* Next question button */}
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedIdx === undefined}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 14,
                      marginTop: 20, border: 'none',
                      background: selectedIdx !== undefined
                        ? `linear-gradient(135deg, ${village.color}, ${village.color}cc)`
                        : 'rgba(255,255,255,.06)',
                      color: selectedIdx !== undefined ? '#fff' : TEXT_DIM,
                      fontSize: 14, fontWeight: 800, cursor: selectedIdx !== undefined ? 'pointer' : 'default',
                      opacity: selectedIdx !== undefined ? 1 : 0.5,
                      transition: 'all .2s',
                    }}
                  >
                    {currentQuestion < questions.length - 1 ? `Next Question (${currentQuestion + 1}/${questions.length})` : 'Finish Quiz'}
                  </button>
                </div>
              )
            })()}
          </div>
        )}

        {/* ── Quiz Results ── */}
        {section === 'quiz' && quizFinished && quizResult && (
          <div style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16,
            padding: '24px 20px',
          }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>
              Quiz Results
            </h2>

            {/* Score circle */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{
                width: 120, height: 120, borderRadius: 99,
                border: `4px solid ${quizResult.passed ? ACCENT : RED}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: quizResult.passed ? 'rgba(74,222,128,.06)' : 'rgba(178,34,34,.06)',
              }}>
                <div style={{
                  fontSize: 32, fontWeight: 900,
                  color: quizResult.passed ? ACCENT : RED,
                  fontFamily: 'Sora, sans-serif',
                }}>
                  {quizResult.percentage}%
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: quizResult.passed ? ACCENT : RED }}>
                  {quizResult.score}/{quizResult.total}
                </div>
              </div>
            </div>

            {/* Pass/Fail message */}
            <div style={{
              textAlign: 'center', marginBottom: 20,
              padding: '12px 16px', borderRadius: 14,
              background: quizResult.passed ? 'rgba(74,222,128,.06)' : 'rgba(178,34,34,.06)',
              border: `1px solid ${quizResult.passed ? 'rgba(74,222,128,.2)' : 'rgba(178,34,34,.2)'}`,
            }}>
              <div style={{
                fontSize: 14, fontWeight: 800,
                color: quizResult.passed ? ACCENT : RED,
                marginBottom: 4,
              }}>
                {quizResult.passed ? 'Congratulations! You passed.' : 'Quiz Not Passed'}
              </div>
              <div style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.5 }}>
                {quizResult.passed
                  ? 'Your knowledge of Africa has been verified. You may proceed with your application.'
                  : 'You did not meet the minimum threshold. Study and try again in 30 days.'}
              </div>
            </div>

            {/* Category breakdown */}
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
              Score by Category
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(quizResult.categoryScores).map(([cat, score]) => {
                const passed = score.correct > 0
                return (
                  <div key={cat} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 10,
                    background: 'rgba(255,255,255,.02)', border: `1px solid ${CARD_BORDER}`,
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{categoryEmoji[cat] ?? '?'}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_MID, flex: 1 }}>
                      {categoryLabel(cat)}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 800,
                      color: passed ? ACCENT : RED,
                    }}>
                      {score.correct}/{score.total}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: passed ? 'rgba(74,222,128,.1)' : 'rgba(178,34,34,.1)',
                      color: passed ? ACCENT : RED,
                    }}>
                      {passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Retry button if failed */}
            {!quizResult.passed && (
              <button
                onClick={() => router.push('/dashboard/villages')}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 14,
                  marginTop: 20, border: 'none',
                  background: 'rgba(255,255,255,.06)', color: TEXT_MID,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Return to Villages
              </button>
            )}
          </div>
        )}

        {/* ────────────── SECTION 3: Professional Contribution ────────────── */}
        {section === 'contribution' && (
          <div style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16,
            padding: '24px 20px',
          }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>
              What Will You Bring?
            </h2>
            <p style={{ fontSize: 12, color: TEXT_MID, lineHeight: 1.6, margin: '0 0 20px' }}>
              Describe the skills, knowledge, or resources you will contribute to <strong style={{ color: village.color }}>{village.name}</strong>. How will your participation strengthen the village?
            </p>

            <textarea
              value={contributionPlan}
              onChange={(e) => setContributionPlan(e.target.value)}
              placeholder="What professional skills, cultural knowledge, or unique perspective will you bring to this village? How do you plan to contribute to its growth?"
              style={{
                width: '100%', minHeight: 180, padding: '14px 16px',
                background: 'rgba(255,255,255,.03)', border: `1px solid ${contributionPlan.length >= 150 ? `${ACCENT}40` : CARD_BORDER}`,
                borderRadius: 14, color: TEXT, fontSize: 13, lineHeight: 1.7,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color .2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `${village.color}60`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = contributionPlan.length >= 150 ? `${ACCENT}40` : CARD_BORDER
              }}
            />

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: contributionPlan.length >= 150 ? ACCENT : (contributionPlan.length >= 100 ? GOLD : TEXT_DIM),
              }}>
                {contributionPlan.length} / 150 min characters
              </span>
              {contributionPlan.length >= 150 && (
                <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Ready</span>
              )}
            </div>
          </div>
        )}

        {/* ────────────── SECTION 4: Review & Submit ────────────── */}
        {section === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16,
              padding: '20px 20px',
            }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: TEXT, margin: '0 0 16px' }}>
                Review Your Application
              </h2>

              {/* Personal Connection preview */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 99, flexShrink: 0,
                    background: `${ACCENT}18`, border: `1.5px solid ${ACCENT}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: ACCENT,
                  }}>1</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Personal Connection</span>
                  <span style={{ fontSize: 10, color: ACCENT, fontWeight: 700, marginLeft: 'auto' }}>{personalConnection.length} chars</span>
                </div>
                <p style={{
                  fontSize: 12, color: TEXT_MID, lineHeight: 1.6, margin: 0,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,.02)', border: `1px solid ${CARD_BORDER}`,
                  maxHeight: 80, overflow: 'hidden',
                }}>
                  {personalConnection.slice(0, 200)}{personalConnection.length > 200 ? '...' : ''}
                </p>
              </div>

              {/* Quiz score preview */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 99, flexShrink: 0,
                    background: `${ACCENT}18`, border: `1.5px solid ${ACCENT}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: ACCENT,
                  }}>2</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>African Knowledge Quiz</span>
                </div>
                <div style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,.02)', border: `1px solid ${CARD_BORDER}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 99,
                    border: `3px solid ${ACCENT}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(74,222,128,.06)',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: ACCENT }}>
                      {quizResult?.percentage ?? 0}%
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>
                      Passed ({quizResult?.score ?? 0}/{quizResult?.total ?? 10} correct)
                    </div>
                    <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>
                      {Object.keys(quizResult?.categoryScores ?? {}).length} categories tested
                    </div>
                  </div>
                </div>
              </div>

              {/* Contribution preview */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 99, flexShrink: 0,
                    background: `${ACCENT}18`, border: `1.5px solid ${ACCENT}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: ACCENT,
                  }}>3</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Contribution Plan</span>
                  <span style={{ fontSize: 10, color: ACCENT, fontWeight: 700, marginLeft: 'auto' }}>{contributionPlan.length} chars</span>
                </div>
                <p style={{
                  fontSize: 12, color: TEXT_MID, lineHeight: 1.6, margin: 0,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,.02)', border: `1px solid ${CARD_BORDER}`,
                  maxHeight: 80, overflow: 'hidden',
                }}>
                  {contributionPlan.slice(0, 200)}{contributionPlan.length > 200 ? '...' : ''}
                </p>
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div style={{
                padding: '12px 16px', borderRadius: 14,
                background: 'rgba(178,34,34,.08)', border: '1px solid rgba(178,34,34,.25)',
                color: RED, fontSize: 12, fontWeight: 600, lineHeight: 1.5,
              }}>
                {submitError}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 14, border: 'none',
                background: submitting
                  ? 'rgba(255,255,255,.06)'
                  : `linear-gradient(135deg, ${village.color}, ${ACCENT})`,
                color: submitting ? TEXT_DIM : '#060b07',
                fontSize: 15, fontWeight: 900, cursor: submitting ? 'default' : 'pointer',
                fontFamily: 'Sora, sans-serif',
                boxShadow: submitting ? 'none' : `0 4px 20px ${village.color}44`,
                transition: 'all .2s',
              }}
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        {!(section === 'quiz' && quizFinished && quizResult && !quizResult.passed) && (
          <div style={{
            display: 'flex', gap: 10, marginTop: 20,
            justifyContent: section === 'review' ? 'flex-start' : 'space-between',
          }}>
            {currentSection > 0 && section !== 'review' && (
              <button
                onClick={handleBack}
                style={{
                  padding: '12px 24px', borderRadius: 14,
                  background: 'rgba(255,255,255,.04)', border: `1px solid ${CARD_BORDER}`,
                  color: TEXT_MID, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Back
              </button>
            )}
            {section !== 'review' && (
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                style={{
                  flex: 1, padding: '12px 24px', borderRadius: 14, border: 'none',
                  marginLeft: currentSection === 0 ? 'auto' : undefined,
                  background: canAdvance()
                    ? `linear-gradient(135deg, ${village.color}, ${village.color}cc)`
                    : 'rgba(255,255,255,.06)',
                  color: canAdvance() ? '#fff' : TEXT_DIM,
                  fontSize: 13, fontWeight: 800, cursor: canAdvance() ? 'pointer' : 'default',
                  opacity: canAdvance() ? 1 : 0.5,
                  transition: 'all .2s',
                  maxWidth: 240,
                }}
              >
                {section === 'contribution' ? 'Review Application' : 'Continue'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
