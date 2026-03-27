'use client'
// ============================================================
// ProverbChainCard — African Oral Tradition in Digital Form
// Tree of interlinking wisdom from across the continent
// ============================================================
import * as React from 'react'
import type { Post, ProverbBranch } from './feedTypes'
import { InteractionBar } from './InteractionBar'
import { DrumScopeIndicator } from './DrumScopeIndicator'

interface ProverbChainCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
}

const CSS_ID = 'proverb-card-css'
const CSS = `
@keyframes goldShimmer{0%,100%{border-color:rgba(212,160,23,.3)}50%{border-color:rgba(212,160,23,.7)}}
@keyframes branchIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
.proverb-gold{animation:goldShimmer 2s ease-in-out infinite}
.branch-in{animation:branchIn .3s ease both}
`

// Branches (initially empty -- populated from post data)
const DEFAULT_BRANCHES: ProverbBranch[] = []

function ProverbBranchRow({ branch, isTop, index }: { branch: ProverbBranch; isTop: boolean; index: number }) {
  const [kilaed, setKilaed] = React.useState(false)
  const [count, setCount] = React.useState(branch.kilaCount)

  return (
    <div
      className="branch-in"
      style={{
        display: 'flex', gap: 8, alignItems: 'flex-start',
        padding: '8px 10px', borderRadius: 10,
        background: isTop ? 'rgba(212,160,23,.06)' : 'rgba(255,255,255,.02)',
        border: isTop ? '1.5px solid rgba(212,160,23,.25)' : '1px solid rgba(255,255,255,.05)',
        animationDelay: `${index * 0.08}s`,
        position: 'relative',
      }}
    >
      {isTop && (
        <div style={{
          position: 'absolute', left: -1, top: 0, bottom: 0, width: 3,
          borderRadius: '10px 0 0 10px',
          background: 'linear-gradient(180deg, #d4a017, #f59e0b)',
        }} />
      )}
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{branch.flag}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#f0f7f0', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 4 }}>
          "{branch.text}"
        </div>
        <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)', display: 'flex', gap: 6 }}>
          <span>{branch.lang}</span>
          <span>·</span>
          <span>{branch.author}</span>
          {isTop && (
            <span style={{ color: '#d4a017', fontWeight: 700 }}>← Most Kíla'd</span>
          )}
        </div>
      </div>
      <button
        onClick={() => { if (!kilaed) { setKilaed(true); setCount(n => n + 1) } }}
        disabled={kilaed}
        style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 8px', borderRadius: 6, border: 'none', cursor: kilaed ? 'default' : 'pointer',
          background: kilaed ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.05)',
          fontSize: 10, color: kilaed ? '#d4a017' : 'rgba(240,247,240,.4)', fontWeight: 700,
        }}
      >
        ⭐ {count}
      </button>
    </div>
  )
}

export function ProverbChainCard({ post, onInteract }: ProverbChainCardProps) {
  const [showChainInput, setShowChainInput] = React.useState(false)
  const [chainText, setChainText] = React.useState('')
  const [chainFlag, setChainFlag] = React.useState('🌍')
  const [chainLang, setChainLang] = React.useState('')
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [ubuntud, setUbuntud] = React.useState(false)
  const [kilaCount, setKilaCount] = React.useState(post.kilaCount)
  const [stirCount, setStirCount] = React.useState(post.stirCount)
  const [ubuntuCount, setUbuntuCount] = React.useState(post.ubuntuCount)
  const [branches, setBranches] = React.useState<ProverbBranch[]>(post.proverbBranches ?? DEFAULT_BRANCHES)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const sortedBranches = [...branches].sort((a, b) => b.kilaCount - a.kilaCount)
  const topBranchIdx = 0 // highest kila

  const handleAddChain = () => {
    if (!chainText.trim()) return
    const newBranch: ProverbBranch = {
      author: 'You', text: chainText, lang: chainLang || 'Unknown', flag: chainFlag, kilaCount: 0,
    }
    setBranches(prev => [...prev, newBranch])
    setChainText(''); setChainFlag('🌍'); setChainLang(''); setShowChainInput(false)
  }

  return (
    <div style={{
      background: 'rgba(212,160,23,.03)',
      border: '1.5px solid rgba(212,160,23,.15)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${post.avatarColor}, #d4a017)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff',
          }}>
            {post.author.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>{post.author}</div>
            <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>{post.villageEmoji} {post.village} · {post.time}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: '#d4a017', padding: '2px 6px', borderRadius: 5, background: 'rgba(212,160,23,.1)' }}>📿 PROVERB CHAIN</span>
            <DrumScopeIndicator scope={post.drumScope} />
          </div>
        </div>

        {/* Root proverb */}
        <div
          className="proverb-gold"
          style={{
            background: 'rgba(212,160,23,.05)',
            border: '1.5px solid rgba(212,160,23,.3)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 15, fontStyle: 'italic', fontWeight: 600, color: '#f5d78a', lineHeight: 1.5, marginBottom: 6 }}>
            "{post.content}"
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 10, color: 'rgba(240,247,240,.4)' }}>
            <span>{post.proverbOrigin ? `📍 ${post.proverbOrigin}` : ''}</span>
            {post.proverbLang && <><span>·</span><span>{post.proverbLang}</span></>}
          </div>
        </div>

        {/* Branches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(240,247,240,.35)', letterSpacing: '.06em', marginBottom: 2 }}>
            WISDOM CHAINS — {branches.length} voices across Africa
          </div>
          {sortedBranches.slice(0, 3).map((branch, i) => (
            <ProverbBranchRow key={i} branch={branch} isTop={i === topBranchIdx} index={i} />
          ))}
          {branches.length > 3 && (
            <div style={{ fontSize: 10, color: 'rgba(240,247,240,.35)', textAlign: 'center', padding: '4px 0' }}>
              +{branches.length - 3} more wisdom chains...
            </div>
          )}
        </div>

        {/* Chain input */}
        {showChainInput ? (
          <div style={{
            background: 'rgba(0,0,0,.3)', borderRadius: 12, padding: 12, marginBottom: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#d4a017', marginBottom: 8 }}>
              ✍️ Add Your Wisdom
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              {['🌍', '🇳🇬', '🇬🇭', '🇿🇦', '🇰🇪', '🇪🇹', '🇲🇱', '🇸🇳'].map(flag => (
                <button
                  key={flag} onClick={() => setChainFlag(flag)}
                  style={{
                    width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: chainFlag === flag ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.05)',
                    fontSize: 14,
                  }}
                >{flag}</button>
              ))}
            </div>
            <input
              value={chainLang} onChange={e => setChainLang(e.target.value)}
              placeholder="Language (e.g. Yoruba, Zulu, Akan...)"
              style={{
                width: '100%', padding: '8px 10px', marginBottom: 6, borderRadius: 8, border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.04)', color: '#f0f7f0', fontSize: 11, outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
            <textarea
              value={chainText} onChange={e => setChainText(e.target.value)}
              placeholder="Your proverb in your language..."
              rows={2}
              style={{
                width: '100%', padding: '8px 10px', marginBottom: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.04)', color: '#f0f7f0', fontSize: 12, outline: 'none',
                fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleAddChain}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #d4a017, #f59e0b)', color: '#000',
                  fontSize: 12, fontWeight: 800,
                }}
              >
                ✦ Chain this Wisdom
              </button>
              <button
                onClick={() => setShowChainInput(false)}
                style={{
                  padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.08)', color: '#f0f7f0', fontSize: 12, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowChainInput(true)}
            style={{
              width: '100%', padding: '10px 0', marginBottom: 10, borderRadius: 10,
              background: 'rgba(212,160,23,.06)', border: '1.5px solid rgba(212,160,23,.2)',
              color: '#d4a017', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            📿 Chain Your Wisdom
          </button>
        )}

        <InteractionBar
          post={{ ...post, kilaCount, stirCount, ubuntuCount }}
          onKila={() => { if (!kilaed) { setKilaed(true); setKilaCount(n => n + 1) } }}
          onStir={() => { setStirred(!stirred); setStirCount(n => stirred ? n - 1 : n + 1) }}
          onUbuntu={() => { setUbuntud(!ubuntud); setUbuntuCount(n => ubuntud ? n - 1 : n + 1) }}
          kilaed={kilaed} stirred={stirred} ubuntud={ubuntud}
          onGriotAsk={() => onInteract?.('griot', post.id)}
          onDrum={() => onInteract?.('drum', post.id)}
        />
      </div>
    </div>
  )
}
