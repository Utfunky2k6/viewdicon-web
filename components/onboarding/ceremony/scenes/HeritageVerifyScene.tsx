'use client'
import * as React from 'react'
import { selectHeritageQuestions, scoreHeritageVerification } from '@/lib/heritage-verification'
import type { HeritageQuestion, HeritageAnswer } from '@/lib/heritage-verification'
import { GradBtn } from '../atoms/GradBtn'

interface HeritageVerifySceneProps {
  onPass: () => void
  onFail: () => void
  theme: any
}

export function HeritageVerifyScene({ onPass, onFail, theme }: HeritageVerifySceneProps) {
  const [questions] = React.useState<HeritageQuestion[]>(() => selectHeritageQuestions(7))
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [answers, setAnswers] = React.useState<HeritageAnswer[]>([])
  const [selected, setSelected] = React.useState<number[]>([])
  const [showResults, setShowResults] = React.useState(false)
  const [result, setResult] = React.useState<any | null>(null)

  const q = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  const handleSelect = (idx: number) => {
    if (q.type === 'multiple_choice') {
      setSelected([idx])
    } else {
      setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
    }
  }

  const handleNext = () => {
    const newAnswers = [...answers, { questionId: q.id, selectedIndices: selected }]
    setAnswers(newAnswers)
    setSelected([])
    if (isLast) {
      const scored = scoreHeritageVerification(newAnswers)
      setResult(scored)
      setShowResults(true)
      setTimeout(() => { scored.passed ? onPass() : onFail() }, 4000)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  if (showResults && result) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, background: theme.bg, overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{result.passed ? '✅' : '🕯'}</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 6 }}>
            {result.passed ? 'Heritage Verified' : 'Heritage Unverified'}
          </div>
          <div style={{ fontSize: 13, color: theme.subText, lineHeight: 1.55 }}>
            Score: {result.percentage}% — {result.passedCategories}/{result.totalCategories} categories passed
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {result.categoryScores.filter((c: any) => c.max > 0).map((c: any) => (
            <div key={c.category} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
              background: theme.card, border: `1.5px solid ${c.passed ? theme.accent : theme.border}`
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: c.passed ? theme.accent : '#f87171', width: 24 }}>{c.passed ? '✓' : '✗'}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: theme.text, textTransform: 'capitalize' }}>{c.category.replace('_', ' ')}</div>
              <div style={{ fontSize: 12, color: theme.subText, fontFamily: 'monospace' }}>{c.percentage}%</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: theme.subText, textAlign: 'center', lineHeight: 1.6 }}>
          {result.passed
            ? 'The Griot acknowledges your African roots. Welcome, child of the Diaspora.'
            : 'The Griot could not verify sufficient heritage connection. You will be welcomed as a Friend of the Motherland.'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, background: theme.bg, overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🦅</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900, color: theme.text, marginBottom: 6 }}>Griot Speaks</div>
        <div style={{ fontSize: 13, color: theme.subText, lineHeight: 1.55 }}>The Griot — keeper of living memory — asks 7 questions to verify your lineage.</div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {questions.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentIdx ? theme.accent : theme.border, transition: 'background .3s' }} />
        ))}
      </div>

      {/* Category + Question # */}
      <div style={{ fontSize: 10, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
        Q{currentIdx + 1} of {questions.length} — {q.category.replace('_', ' ')}
      </div>

      {/* Question */}
      <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, lineHeight: 1.55, marginBottom: 16 }}>{q.question}</div>

      {/* Hint for multi-select */}
      {q.type === 'multi_select' && (
        <div style={{ fontSize: 10, color: theme.subText, marginBottom: 10, fontStyle: 'italic' }}>Select all that apply</div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {q.options.map((opt, i) => (
          <div key={i} onClick={() => handleSelect(i)} style={{
            padding: '13px 14px', borderRadius: 13, cursor: 'pointer', fontSize: 13, lineHeight: 1.5,
            fontWeight: selected.includes(i) ? 800 : 400, color: theme.text, transition: 'all .2s',
            background: selected.includes(i) ? `${theme.accent}18` : theme.card,
            border: `1.5px solid ${selected.includes(i) ? theme.accent : theme.border}`,
          }}>
            {opt}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <GradBtn onClick={handleNext} style={selected.length === 0 ? { opacity: .4, pointerEvents: 'none' } : { height: 52 }}>
          {isLast ? 'Submit to the Griot' : `Next Question →`}
        </GradBtn>
      </div>
    </div>
  )
}
