'use client'
// ════════════════════════════════════════════════════════════════
// PROVERB BATTLE — Africa's wisdom duel
// Two traditions meet — which proverb carries more truth today?
// Submit a proverb from any African language · Earn Kíla · Rise as a Griot
// ════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { sorosokeApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'

const INJECT_ID = 'proverb-battle-css'
const CSS = `
@keyframes pbFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pbGlow{0%,100%{box-shadow:0 0 12px rgba(212,160,23,.15)}50%{box-shadow:0 0 28px rgba(212,160,23,.4)}}
@keyframes pbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes pbSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pbSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.pb-fade{animation:pbFade .4s ease both}
.pb-glow{animation:pbGlow 3s ease-in-out infinite}
.pb-pulse{animation:pbPulse .6s ease-in-out}
.pb-slide{animation:pbSlide .3s ease both}
`

// ── African languages with flag codes ─────────────────────────
const AFRICAN_LANGS = [
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬', sample: 'Àgbà kì í wà lójà kí orí ọmọ títún wó' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬', sample: 'Onye wetara oji wetara ndụ' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', sample: 'Duk mai gari kwari ne' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', sample: 'Haraka haraka haina baraka' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦', sample: 'Umuntu ngumuntu ngabantu' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭', sample: 'Onipa na ohia onipa' },
  { code: 'wo', name: 'Wolof', flag: '🇸🇳', sample: 'Lu dëkk dëkk, dëkk na ci yoon' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹', sample: 'ቀስ በቀስ እንቁላል በእግሩ ይሄዳል' },
  { code: 'so', name: 'Somali', flag: '🇸🇴', sample: 'Nin waa la yaqaan, laakiin la ma garankaraan' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼', sample: 'Chimodzi chisadole nkhalamba, ayi mzimu' },
  { code: 'ln', name: 'Lingala', flag: '🇨🇩', sample: 'Moto na moto azali na motuya na ye' },
  { code: 'Other', name: 'Other Language', flag: '🌍', sample: '' },
]

// ── Seed battles (shown when no real posts exist) ──────────────
const SEED_BATTLES = [
  {
    id: 'seed-1',
    topic: 'Patience vs Speed: which builds lasting wealth?',
    branches: [
      { id: 'b1', text: 'Haraka haraka haina baraka', lang: 'Kiswahili', flag: '🇰🇪', translation: 'Hurry hurry has no blessings', kilaCount: 45, authorId: 'a1', authorName: 'Kofi A.' },
      { id: 'b2', text: 'Àgbà kì í wà lójà kí orí ọmọ títún wó', lang: 'Yoruba', flag: '🇳🇬', translation: 'An elder does not stay in the market while a child\'s head falls', kilaCount: 38, authorId: 'a2', authorName: 'Amara B.' },
      { id: 'b3', text: 'Umuntu ngumuntu ngabantu', lang: 'Zulu', flag: '🇿🇦', translation: 'A person is a person through other persons', kilaCount: 31, authorId: 'a3', authorName: 'Thabo M.' },
    ],
    postId: 'seed-post-1',
    totalKila: 114,
  },
  {
    id: 'seed-2',
    topic: 'Village community vs individual freedom — what shapes destiny?',
    branches: [
      { id: 'b4', text: 'Onipa na ohia onipa', lang: 'Twi', flag: '🇬🇭', translation: 'A human being needs a human being', kilaCount: 67, authorId: 'a4', authorName: 'Ama K.' },
      { id: 'b5', text: 'Lu dëkk dëkk, dëkk na ci yoon', lang: 'Wolof', flag: '🇸🇳', translation: 'What is meant to be, finds its own path', kilaCount: 52, authorId: 'a5', authorName: 'Fatou D.' },
    ],
    postId: 'seed-post-2',
    totalKila: 119,
  },
]

interface Branch {
  id: string; text: string; lang: string; flag: string
  translation?: string; kilaCount: number; authorName?: string
}
interface BattlePost {
  id: string; topic: string; branches: Branch[]; postId: string; totalKila: number
}

export default function ProverbBattlePage() {
  const router = useRouter()
  const [battles] = React.useState<BattlePost[]>(SEED_BATTLES)
  const [activeBattle, setActiveBattle] = React.useState<BattlePost>(SEED_BATTLES[0])
  const [kilaed, setKilaed] = React.useState<Set<string>>(new Set())
  const [kilaFlash, setKilaFlash] = React.useState<string | null>(null)
  const [submitOpen, setSubmitOpen] = React.useState(false)
  const [form, setForm] = React.useState({ text: '', lang: 'yo', flag: '🇳🇬', translation: '' })
  const [submitting, setSubmitting] = React.useState(false)
  const [submittedMsg, setSubmittedMsg] = React.useState('')

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(INJECT_ID)) return
    const s = document.createElement('style'); s.id = INJECT_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const handleKila = async (branch: Branch) => {
    if (kilaed.has(branch.id)) return
    setKilaed(prev => new Set([...prev, branch.id]))
    setKilaFlash(branch.id)
    setTimeout(() => setKilaFlash(null), 700)
    // Optimistic update
    setActiveBattle(prev => ({
      ...prev,
      branches: prev.branches.map(b => b.id === branch.id ? { ...b, kilaCount: b.kilaCount + 1 } : b),
      totalKila: prev.totalKila + 1,
    }))
    // Fire real API if not a seed post
    if (!activeBattle.postId.startsWith('seed-')) {
      sorosokeApi.kilaProverb(activeBattle.postId, branch.id).catch((e) => logApiFailure('proverb-battle/kila', e))
    }
  }

  const handleSubmit = async () => {
    if (!form.text.trim() || form.text.length < 5) return
    setSubmitting(true)
    try {
      const langObj = AFRICAN_LANGS.find(l => l.code === form.lang)
      const flag = langObj?.flag || '🌍'
      if (!activeBattle.postId.startsWith('seed-')) {
        await sorosokeApi.addProverb(activeBattle.postId, { text: form.text, lang: form.lang, flag })
      }
      // Optimistic add
      setActiveBattle(prev => ({
        ...prev,
        branches: [...prev.branches, {
          id: `new-${Date.now()}`,
          text: form.text,
          lang: langObj?.name || form.lang,
          flag,
          translation: form.translation,
          kilaCount: 0,
          authorName: 'You',
        }],
      }))
      setSubmittedMsg('Your proverb enters the battle!')
      setForm({ text: '', lang: 'yo', flag: '🇳🇬', translation: '' })
      setSubmitOpen(false)
      setTimeout(() => setSubmittedMsg(''), 3000)
    } catch (e) {
      logApiFailure('proverb-battle/submit', e)
      setSubmittedMsg('Could not submit. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const sortedBranches = [...activeBattle.branches].sort((a, b) => b.kilaCount - a.kilaCount)
  const winner = sortedBranches[0]
  const maxKila = winner?.kilaCount || 1

  return (
    <div style={{ minHeight: '100dvh', background: '#07090a', color: '#f0f5ee', fontFamily: 'DM Sans, sans-serif', paddingBottom: 100 }}>
      {/* Kente stripe */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%)', flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg,#ffd700,#d4a017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Proverb Battle
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontStyle: 'italic' }}>Wisdom across tongues · Africa's deepest truths compete</div>
        </div>
      </div>

      {/* Battle topic selector */}
      <div style={{ display: 'flex', overflowX: 'auto', padding: '0 14px 10px', gap: 8 }}>
        {battles.map((b, i) => (
          <div
            key={b.id}
            onClick={() => setActiveBattle(b)}
            className={activeBattle.id === b.id ? 'pb-glow' : ''}
            style={{
              flexShrink: 0, maxWidth: 200, padding: '8px 12px', borderRadius: 12, cursor: 'pointer',
              background: activeBattle.id === b.id ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)',
              border: `1.5px solid ${activeBattle.id === b.id ? 'rgba(212,160,23,.4)' : 'rgba(255,255,255,.08)'}`,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, color: activeBattle.id === b.id ? '#fbbf24' : 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>
              Battle {i + 1}
            </div>
            <div style={{ fontSize: 10, color: activeBattle.id === b.id ? '#f0f5ee' : 'rgba(255,255,255,.4)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {b.topic}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', marginTop: 4 }}>⭐ {b.totalKila} Kíla · {b.branches.length} proverbs</div>
          </div>
        ))}
      </div>

      {/* Active battle */}
      <div style={{ padding: '0 14px' }}>
        {/* Topic */}
        <div className="pb-fade" style={{ padding: '14px 16px', borderRadius: 18, background: 'linear-gradient(135deg,rgba(212,160,23,.08),rgba(212,160,23,.03))', border: '1px solid rgba(212,160,23,.2)', marginBottom: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(212,160,23,.6)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>⚔️ Today's Battle Topic</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 800, color: '#fbbf24', lineHeight: 1.5 }}>{activeBattle.topic}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 9, color: 'rgba(255,255,255,.3)' }}>
            <span>📜 {activeBattle.branches.length} proverbs submitted</span>
            <span>⭐ {activeBattle.totalKila} total Kíla</span>
          </div>
        </div>

        {/* Success message */}
        {submittedMsg && (
          <div className="pb-slide" style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', fontSize: 12, color: '#4ade80', marginBottom: 10, textAlign: 'center', fontWeight: 700 }}>
            🥁 {submittedMsg}
          </div>
        )}

        {/* Proverbs ranking */}
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 8 }}>
          📊 Live Rankings
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {sortedBranches.map((branch, idx) => {
            const isWinner = idx === 0
            const barWidth = Math.round((branch.kilaCount / maxKila) * 100)
            const hasKilaed = kilaed.has(branch.id)
            const isFlashing = kilaFlash === branch.id

            return (
              <div
                key={branch.id}
                className={`pb-fade${isFlashing ? ' pb-pulse' : ''}`}
                style={{
                  padding: '14px 16px', borderRadius: 18, cursor: 'pointer',
                  background: isWinner
                    ? 'linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,140,0,.04))'
                    : 'rgba(255,255,255,.03)',
                  border: `1.5px solid ${isWinner ? 'rgba(255,215,0,.25)' : 'rgba(255,255,255,.07)'}`,
                  animationDelay: `${idx * 0.08}s`,
                  position: 'relative', overflow: 'hidden',
                }}
                onClick={() => handleKila(branch)}
              >
                {/* Rank + winner badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}</span>
                  <span style={{ fontSize: 13 }}>{branch.flag}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{branch.lang}</span>
                    {branch.authorName && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', marginLeft: 6 }}>· {branch.authorName}</span>}
                  </div>
                  {isWinner && (
                    <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: 'rgba(255,215,0,.15)', color: '#ffd700' }}>
                      🏆 LEADING
                    </span>
                  )}
                </div>

                {/* Proverb text */}
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 700, color: isWinner ? '#ffd700' : '#e8e8e8', lineHeight: 1.6, marginBottom: branch.translation ? 6 : 10, fontStyle: 'italic' }}>
                  "{branch.text}"
                </div>
                {branch.translation && (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 10, lineHeight: 1.5 }}>
                    {branch.translation}
                  </div>
                )}

                {/* Heat bar */}
                <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,.06)', marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${barWidth}%`, borderRadius: 99, transition: 'width .5s ease',
                    background: isWinner ? 'linear-gradient(to right,#d4a017,#ffd700)' : 'linear-gradient(to right,#1a7c3e,#4ade80)',
                  }} />
                </div>

                {/* Kila button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); handleKila(branch) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 99,
                      fontSize: 11, fontWeight: 700, cursor: hasKilaed ? 'default' : 'pointer',
                      background: hasKilaed ? 'rgba(255,215,0,.15)' : 'rgba(255,255,255,.06)',
                      border: `1px solid ${hasKilaed ? 'rgba(255,215,0,.35)' : 'rgba(255,255,255,.1)'}`,
                      color: hasKilaed ? '#ffd700' : 'rgba(255,255,255,.5)',
                      transition: 'all .2s',
                    }}
                  >
                    <span style={{ fontSize: 13 }}>⭐</span>
                    <span>{branch.kilaCount} Kíla</span>
                    {!hasKilaed && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>· tap to vote</span>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit your proverb CTA */}
        {!submitOpen ? (
          <button
            onClick={() => setSubmitOpen(true)}
            style={{
              width: '100%', padding: '14px', borderRadius: 16, fontSize: 13, fontWeight: 800, cursor: 'pointer',
              background: 'linear-gradient(135deg,rgba(212,160,23,.12),rgba(212,160,23,.06))',
              border: '1.5px dashed rgba(212,160,23,.35)', color: '#fbbf24',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            📜 Add Your Proverb
            <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,.35)' }}>in any African language</span>
          </button>
        ) : (
          <div className="pb-fade" style={{ padding: '16px', borderRadius: 18, background: 'rgba(212,160,23,.06)', border: '1.5px solid rgba(212,160,23,.25)' }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 800, color: '#fbbf24', marginBottom: 12 }}>📜 Submit Your Proverb</div>

            {/* Language selector */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.07em' }}>Language</div>
              <div style={{ display: 'flex', overflowX: 'auto', gap: 6 }}>
                {AFRICAN_LANGS.map(l => (
                  <div
                    key={l.code}
                    onClick={() => setForm(f => ({ ...f, lang: l.code, flag: l.flag }))}
                    style={{
                      flexShrink: 0, padding: '5px 10px', borderRadius: 99, cursor: 'pointer', fontSize: 10, fontWeight: 700,
                      background: form.lang === l.code ? 'rgba(212,160,23,.15)' : 'rgba(255,255,255,.05)',
                      border: `1px solid ${form.lang === l.code ? 'rgba(212,160,23,.4)' : 'rgba(255,255,255,.08)'}`,
                      color: form.lang === l.code ? '#fbbf24' : 'rgba(255,255,255,.4)',
                    }}
                  >
                    {l.flag} {l.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Proverb text */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Proverb in {AFRICAN_LANGS.find(l => l.code === form.lang)?.name}
              </div>
              <textarea
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder={AFRICAN_LANGS.find(l => l.code === form.lang)?.sample || 'Enter the proverb...'}
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 12,
                  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                  color: '#f0f5ee', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                  fontStyle: 'italic', outline: 'none', resize: 'none', lineHeight: 1.6,
                }}
              />
            </div>

            {/* Optional translation */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Translation (optional but encouraged)
              </div>
              <input
                value={form.translation}
                onChange={e => setForm(f => ({ ...f, translation: e.target.value }))}
                placeholder="English meaning..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 12,
                  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                  color: '#f0f5ee', fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSubmit}
                disabled={submitting || form.text.trim().length < 5}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  background: 'rgba(212,160,23,.2)', border: '1.5px solid rgba(212,160,23,.4)', color: '#fbbf24',
                  opacity: form.text.trim().length < 5 ? .4 : 1,
                }}
              >
                {submitting ? '⏳ Submitting…' : '⚔️ Enter Battle'}
              </button>
              <button
                onClick={() => setSubmitOpen(false)}
                style={{ padding: '11px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>How It Works</div>
          {[
            { icon: '📜', text: 'Submit a proverb from any African language' },
            { icon: '⭐', text: 'Kíla votes the wisest truth — 1 vote per person' },
            { icon: '🏆', text: 'The leading proverb becomes the Village Griot wisdom of the day' },
            { icon: '🎙', text: 'Top proverbs earn XP and get broadcast to the wider village' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
