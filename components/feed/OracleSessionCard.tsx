'use client'
// ============================================================
// OracleSessionCard — Live voice room / scheduled discussion
// The village elder gathering around the fire
// ============================================================
import * as React from 'react'
import type { Post } from './feedTypes'
import { InteractionBar } from './InteractionBar'

interface OracleSessionCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
}

const CSS_ID = 'oracle-card-css'
const CSS = `
@keyframes speakerRing{0%{box-shadow:0 0 0 0 rgba(212,160,23,.5)}100%{box-shadow:0 0 0 8px rgba(212,160,23,0)}}
@keyframes liveBlip{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes pulse2{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.oracle-live-dot{animation:liveBlip 1s ease-in-out infinite}
.oracle-speaker{animation:speakerRing 1.2s ease-out infinite}
.oracle-pulse{animation:pulse2 2s ease-in-out infinite}
`

// Speakers (initially empty -- populated from oracle session data)
const DEFAULT_SPEAKERS: { name: string; speaking: boolean; color: string }[] = []

export function OracleSessionCard({ post, onInteract }: OracleSessionCardProps) {
  const [agreeVote, setAgreeVote] = React.useState<'agree' | 'disagree' | null>(null)
  const [agreePercent, setAgreePercent] = React.useState(68)
  const [handRaised, setHandRaised] = React.useState(false)
  const [kilaed, setKilaed] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [ubuntud, setUbuntud] = React.useState(false)
  const [kilaCount, setKilaCount] = React.useState(post.kilaCount)
  const [stirCount, setStirCount] = React.useState(post.stirCount)
  const [ubuntuCount, setUbuntuCount] = React.useState(post.ubuntuCount)
  const isLive = !post.oracleTopic?.includes('SCHEDULED')

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const handleVote = (side: 'agree' | 'disagree') => {
    setAgreeVote(side)
    setAgreePercent(side === 'agree' ? Math.min(98, agreePercent + 3) : Math.max(2, agreePercent - 3))
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
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
              {post.author} · Host
            </div>
            <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>
              {post.villageEmoji} {post.village} · {post.time}
            </div>
          </div>
          <div>
            {isLive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div className="oracle-live-dot" style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#ef4444',
                }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444' }}>LIVE</span>
              </div>
            ) : (
              <span style={{ fontSize: 9, fontWeight: 700, color: '#d4a017', padding: '2px 6px', borderRadius: 5, background: 'rgba(212,160,23,.1)' }}>
                📅 SCHEDULED
              </span>
            )}
          </div>
        </div>

        {/* Oracle badge */}
        <div style={{ fontSize: 9, fontWeight: 700, color: '#d4a017', letterSpacing: '.08em', marginBottom: 6 }}>
          🦅 ORACLE SESSION
        </div>

        {/* Topic */}
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#f0f7f0', lineHeight: 1.5,
          marginBottom: 12, fontFamily: 'Sora, sans-serif',
        }}>
          {post.oracleTopic ?? post.content}
        </div>

        {/* Speaker row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          {DEFAULT_SPEAKERS.map((speaker, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div
                className={speaker.speaking ? 'oracle-speaker' : ''}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${speaker.color}, ${speaker.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#fff', border: `2px solid ${speaker.speaking ? speaker.color : 'transparent'}`,
                  position: 'relative',
                }}
              >
                {speaker.name.charAt(0)}
                {speaker.speaking && (
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 12, height: 12, borderRadius: '50%',
                    background: '#22c55e', border: '2px solid #0a0f0b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 6,
                  }}>🔊</div>
                )}
              </div>
              <div style={{ fontSize: 7, color: 'rgba(240,247,240,.4)', textAlign: 'center', marginTop: 2 }}>
                {speaker.name}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: 'rgba(240,247,240,.35)', marginLeft: 4 }}>
            +{(post.speakerCount ?? 5) - 3} more
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(240,247,240,.4)' }}>
            👁 {(post.listenerCount ?? 4800).toLocaleString()} listening
          </div>
        </div>

        {/* Live pulse vote */}
        <div style={{
          background: 'rgba(0,0,0,.3)', borderRadius: 12, padding: '10px 12px', marginBottom: 10,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(240,247,240,.4)', marginBottom: 8, letterSpacing: '.05em' }}>
            AUDIENCE PULSE — live vote
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', width: 36 }}>
              {agreePercent}%
            </span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${agreePercent}%`,
                background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                borderRadius: 3, transition: 'width .5s ease',
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', width: 36, textAlign: 'right' }}>
              {100 - agreePercent}%
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleVote('agree')}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: agreeVote === 'agree' ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.05)',
                color: agreeVote === 'agree' ? '#22c55e' : 'rgba(240,247,240,.6)',
                fontSize: 11, fontWeight: 700,
                outline: agreeVote === 'agree' ? '1px solid rgba(34,197,94,.3)' : 'none',
              }}
            >
              ✓ Agree
            </button>
            <button
              onClick={() => handleVote('disagree')}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: agreeVote === 'disagree' ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.05)',
                color: agreeVote === 'disagree' ? '#ef4444' : 'rgba(240,247,240,.6)',
                fontSize: 11, fontWeight: 700,
                outline: agreeVote === 'disagree' ? '1px solid rgba(239,68,68,.3)' : 'none',
              }}
            >
              ✗ Disagree
            </button>
          </div>
        </div>

        {/* Join / Raise hand */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <button
            className={handRaised ? 'oracle-pulse' : ''}
            onClick={() => setHandRaised(!handRaised)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: handRaised ? 'rgba(212,160,23,.2)' : 'rgba(212,160,23,.08)',
              color: '#d4a017', fontSize: 12, fontWeight: 800,
              outline: handRaised ? '1px solid rgba(212,160,23,.4)' : 'none',
            }}
          >
            {handRaised ? '🤚 Hand Raised' : '🤚 Raise Hand'}
          </button>
          <button
            onClick={() => onInteract?.('drum', post.id)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,.05)', color: 'rgba(240,247,240,.6)',
              fontSize: 12, fontWeight: 700,
            }}
          >
            🥁 Drum this debate
          </button>
        </div>

        <InteractionBar
          post={{ ...post, kilaCount, stirCount, ubuntuCount }}
          onKila={() => { if (!kilaed) { setKilaed(true); setKilaCount(n => n + 1) } }}
          onStir={() => { setStirred(!stirred); setStirCount(n => stirred ? n - 1 : n + 1) }}
          onUbuntu={() => { setUbuntud(!ubuntud); setUbuntuCount(n => ubuntud ? n - 1 : n + 1) }}
          kilaed={kilaed} stirred={stirred} ubuntud={ubuntud}
          onGriotAsk={() => onInteract?.('griot', post.id)}
          onDrum={() => {}}
        />
      </div>
    </div>
  )
}
