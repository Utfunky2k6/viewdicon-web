/**
 * UFÈ 200-Question Interface
 * Chat-style question flow within the station system.
 * Banking-grade UI. No swipe. Deliberate answers.
 */
'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav, LWBadge,
  LWProgress, LWSheet, LWTextarea, Spinner,
} from '@/components/love-world/primitives'
import { QUESTIONS, CATEGORIES, getStationQuestions, type Question } from '@/lib/questions'
import { STATIONS, formatTimeRemaining, type StationId } from '@/lib/progression'

const T = REALM.ufe

/* ─── Types ─── */
interface Answer {
  questionId: number
  selectedOption: string
  textResponse?: string
  answeredAt: string
}

/* ─── Main Page ─── */
export default function QuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const station = (parseInt(searchParams.get('station') || '1') || 1) as StationId
  const matchId = searchParams.get('matchId') || ''

  const stationDef = STATIONS[station - 1]
  const questions = React.useMemo(() => getStationQuestions(station), [station])

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<Answer[]>([])
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)
  const [textResponse, setTextResponse] = React.useState('')
  const [showConditional, setShowConditional] = React.useState(false)
  const [conditionalText, setConditionalText] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [showSummary, setShowSummary] = React.useState(false)
  const [startTime] = React.useState(Date.now())

  const currentQ = questions[currentIndex]
  const progress = answers.length
  const total = questions.length
  const isComplete = currentIndex >= total
  const categoryInfo = CATEGORIES.find(c => c.key === currentQ?.category)

  /* ─── Submit answer ─── */
  const handleSubmit = React.useCallback(async () => {
    if (!currentQ) return
    if (currentQ.answerType === 'TEXT' && !textResponse.trim()) return
    if (currentQ.answerType === 'MCQ' && !selectedOption) return

    // Check if "It depends" was selected and needs conditional explanation
    if (currentQ.hasConditional && selectedOption === 'C' && !showConditional) {
      setShowConditional(true)
      return
    }

    setSubmitting(true)

    const answer: Answer = {
      questionId: currentQ.id,
      selectedOption: currentQ.answerType === 'TEXT' ? 'TEXT' : selectedOption!,
      textResponse: currentQ.answerType === 'TEXT'
        ? textResponse
        : (showConditional ? conditionalText : undefined),
      answeredAt: new Date().toISOString(),
    }

    setAnswers(prev => [...prev, answer])

    // Reset for next question
    setSelectedOption(null)
    setTextResponse('')
    setShowConditional(false)
    setConditionalText('')
    setSubmitting(false)

    if (currentIndex + 1 >= total) {
      setShowSummary(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentQ, selectedOption, textResponse, showConditional, conditionalText, currentIndex, total])

  /* ─── Skip (only non-deal-breakers) ─── */
  const handleSkip = () => {
    if (!currentQ || currentQ.dealBreaker) return
    setSelectedOption(null)
    setTextResponse('')
    setShowConditional(false)
    setConditionalText('')
    if (currentIndex + 1 >= total) {
      setShowSummary(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (showSummary || isComplete) {
    return (
      <RealmProvider realm="ufe">
        <LWNav title="Complete" backHref={`/dashboard/love/ufe`} backLabel="UFÈ" />
        <div style={{ padding: `${SPACE[10]}px ${SPACE[4]}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACE[5], textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: RADIUS.full, background: `${COLOR.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={COLOR.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <LWText scale="h1" as="h1">Station {station} Complete</LWText>
          <LWText scale="body" color="secondary">{answers.length} of {total} questions answered</LWText>
          <LWCard padding={SPACE[5]} style={{ width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
              {CATEGORIES.filter(c => {
                const qs = questions.filter(q => q.category === c.key)
                return qs.length > 0
              }).map(c => {
                const catQs = questions.filter(q => q.category === c.key)
                const catAnswered = answers.filter(a => catQs.find(q => q.id === a.questionId)).length
                return (
                  <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <LWText scale="caption" as="span">{c.icon} {c.label}</LWText>
                    <LWBadge variant={catAnswered === catQs.length ? 'success' : 'default'}>{catAnswered}/{catQs.length}</LWBadge>
                  </div>
                )
              })}
            </div>
          </LWCard>
          <LWButton variant="primary" onClick={() => router.push('/dashboard/love/ufe')} style={{ width: '100%', maxWidth: 400 }}>
            Return to UFÈ
          </LWButton>
        </div>
      </RealmProvider>
    )
  }

  if (!currentQ) return null

  const elapsed = Date.now() - startTime
  const isDealBreaker = currentQ.dealBreaker

  return (
    <RealmProvider realm="ufe">
      <LWNav
        title={`Station ${station}`}
        backHref="/dashboard/love/ufe"
        backLabel="UFÈ"
        right={<LWBadge variant="accent">{progress + 1}/{total}</LWBadge>}
      />

      <div style={{ padding: `${SPACE[4]}px ${SPACE[4]}px ${SPACE[16]}px`, maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
        {/* Progress bar */}
        <LWProgress value={progress} max={total} height={3} />

        {/* Category indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
          <LWText scale="micro" color="muted" as="span" transform="uppercase">
            {categoryInfo?.icon} {categoryInfo?.label}
          </LWText>
          {isDealBreaker && (
            <LWBadge variant="danger">Deal Breaker</LWBadge>
          )}
        </div>

        {/* Question card */}
        <LWCard padding={SPACE[5]} style={{ borderColor: isDealBreaker ? `${COLOR.danger}40` : COLOR.border }}>
          <LWText scale="micro" color="muted" as="div" style={{ marginBottom: SPACE[2] }}>
            Question {currentQ.id} of 200
          </LWText>
          <LWText scale="h3" as="h2" style={{ marginBottom: SPACE[4], lineHeight: '1.6' }}>
            {currentQ.question}
          </LWText>

          {/* MCQ Options */}
          {currentQ.answerType === 'MCQ' && currentQ.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
              {currentQ.options.map(opt => {
                const isSelected = selectedOption === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSelectedOption(opt.key)
                      setShowConditional(false)
                      setConditionalText('')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: SPACE[3],
                      padding: `${SPACE[3]}px ${SPACE[4]}px`,
                      background: isSelected ? T.accentMuted : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isSelected ? T.accent : COLOR.border}`,
                      borderRadius: RADIUS.lg,
                      color: isSelected ? T.accent : COLOR.textPrimary,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: TYPE.body.fontSize,
                      lineHeight: TYPE.body.lineHeight,
                      transition: `all ${DURATION.fast} ${EASE.default}`,
                      width: '100%',
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: RADIUS.full,
                      border: `2px solid ${isSelected ? T.accent : COLOR.borderStrong}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: `all ${DURATION.fast} ${EASE.default}`,
                      background: isSelected ? T.accent : 'transparent',
                    }}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-6" stroke={COLOR.textInverse} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Text answer */}
          {currentQ.answerType === 'TEXT' && (
            <LWTextarea
              value={textResponse}
              onChange={e => setTextResponse(e.target.value)}
              placeholder="Type your answer..."
              maxChars={500}
              style={{ minHeight: 100 }}
            />
          )}
        </LWCard>

        {/* Conditional explanation sheet */}
        {showConditional && currentQ.hasConditional && (
          <LWCard padding={SPACE[4]} style={{ borderColor: `${COLOR.warning}30` }}>
            <LWText scale="caption" color="secondary" style={{ marginBottom: SPACE[2] }}>
              {currentQ.conditionalPrompt || 'Please explain your conditions:'}
            </LWText>
            <LWTextarea
              value={conditionalText}
              onChange={e => setConditionalText(e.target.value)}
              placeholder="Kindly state the specific condition(s)..."
              maxChars={300}
              style={{ minHeight: 80 }}
            />
          </LWCard>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: SPACE[3], marginTop: SPACE[2] }}>
          {!isDealBreaker && (
            <LWButton variant="ghost" size="md" onClick={handleSkip} style={{ flex: 1 }}>
              Skip
            </LWButton>
          )}
          <LWButton
            variant="primary"
            size="md"
            loading={submitting}
            onClick={handleSubmit}
            disabled={
              (currentQ.answerType === 'MCQ' && !selectedOption) ||
              (currentQ.answerType === 'TEXT' && !textResponse.trim()) ||
              (showConditional && !conditionalText.trim())
            }
            style={{ flex: isDealBreaker ? 1 : 2 }}
          >
            {showConditional ? 'Confirm' : currentIndex + 1 >= total ? 'Finish' : 'Next'}
          </LWButton>
        </div>

        {isDealBreaker && (
          <LWText scale="micro" color="danger" align="center" style={{ marginTop: -SPACE[2] }}>
            This question cannot be skipped — it is a deal breaker.
          </LWText>
        )}
      </div>
    </RealmProvider>
  )
}
