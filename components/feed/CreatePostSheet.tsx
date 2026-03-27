'use client'
// ============================================================
// CreatePostSheet — Full-screen bottom sheet compose experience
// Phase 1: type selector · Phase 2: type-specific form
// ============================================================
import * as React from 'react'
import { VOCAB, POST_TYPE_LABEL } from '@/constants/vocabulary'

interface CreatePostSheetProps {
  onClose: () => void
  crestTier?: number
}

type PostType =
  | 'TEXT_DRUM' | 'VOICE_STORY' | 'MARKET_LISTING'
  | 'VIDEO_REEL' | 'PROVERB_CHAIN' | 'VILLAGE_NOTICE' | 'ORACLE_SESSION'

type DrumScope = 1 | 2 | 3
type SkinContext = 'ise' | 'egbe' | 'idile'

// Strip leading emoji token from a VOCAB string → pure text label
const tl = (s: string) => s.replace(/^\S+\s/, '')

const TYPE_CONFIG: Array<{
  id: PostType; emoji: string; label: string; desc: string
  minCrest?: number; color: string; bg: string
}> = [
  { id: 'TEXT_DRUM',      emoji: '🥁', label: tl(VOCAB.postTypeText),    desc: 'Speak your truth',           color: '#1a7c3e', bg: 'rgba(26,124,62,.1)' },
  { id: 'VOICE_STORY',    emoji: '🎙', label: tl(VOCAB.postTypeVoice),   desc: 'Let your voice be heard',    color: '#7c3aed', bg: 'rgba(124,58,237,.1)' },
  { id: 'MARKET_LISTING', emoji: '🛒', label: tl(VOCAB.postTypeMarket),  desc: 'Sell to your village',       color: '#e07b00', bg: 'rgba(224,123,0,.1)' },
  { id: 'VIDEO_REEL',     emoji: '📹', label: 'Video Reel',              desc: 'Show your craft',            color: '#b22222', bg: 'rgba(178,34,34,.1)' },
  { id: 'PROVERB_CHAIN',  emoji: '📿', label: tl(VOCAB.postTypeProverb), desc: 'Share ancient wisdom',       color: '#d4a017', bg: 'rgba(212,160,23,.1)' },
  { id: 'VILLAGE_NOTICE', emoji: '📯', label: tl(VOCAB.postTypeNotice),  desc: 'Official announcement',      color: '#d4a017', bg: 'rgba(212,160,23,.1)', minCrest: 3 },
  { id: 'ORACLE_SESSION', emoji: '⚖️', label: tl(VOCAB.postTypeOracle),  desc: 'Open a discussion',          color: '#0ea5e9', bg: 'rgba(14,165,233,.1)', minCrest: 2 },
]

const SKIN_CONFIG = {
  ise:   { label: tl(VOCAB.skinIse),   emoji: '⚒',  color: '#1a7c3e', note: 'professional network' },
  egbe:  { label: tl(VOCAB.skinEgbe),  emoji: '🎭', color: '#d97706', note: 'public social' },
  idile: { label: tl(VOCAB.skinIdile), emoji: '🏛',  color: '#7c3aed', note: 'family & clan only' },
}

const SCOPE_CONFIG: Array<{ scope: DrumScope; icon: string; label: string; minCrest: number; color: string }> = [
  { scope: 1, icon: '🏘', label: tl(VOCAB.geoVillage), minCrest: 0, color: '#1a7c3e' },
  { scope: 2, icon: '🌍', label: tl(VOCAB.geoCountry), minCrest: 2, color: '#3b82f6' },
  { scope: 3, icon: '📡', label: tl(VOCAB.geoGlobal),  minCrest: 4, color: '#b22222' },
]

const LANGS = [
  { code: 'en', flag: '🇳🇬', label: 'English' },
  { code: 'yo', flag: '🇳🇬', label: 'Yoruba' },
  { code: 'ha', flag: '🇳🇬', label: 'Hausa' },
  { code: 'sw', flag: '🇰🇪', label: 'Swahili' },
  { code: 'am', flag: '🇪🇹', label: 'Amharic' },
]

const DELIVERY_OPTS = [
  { id: 'collection', label: '🏪 Collection Only' },
  { id: 'runner',     label: '🚚 Runner Delivery' },
  { id: 'buyer',      label: '📦 Buyer Arranges' },
]

const CSS = `
@keyframes cps-rise{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes cps-type-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes cps-mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.4)}50%{box-shadow:0 0 0 18px rgba(124,58,237,0)}}
@keyframes cps-mic-ring{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes cps-wave-bar{0%,100%{height:30%}50%{height:100%}}
@keyframes cps-send{0%{transform:scale(1)}50%{transform:scale(.9)}100%{transform:scale(1)}}
@keyframes cps-heat-glow{0%,100%{opacity:.5}50%{opacity:1}}
`

export function CreatePostSheet({ onClose, crestTier = 1 }: CreatePostSheetProps) {
  const [phase, setPhase] = React.useState<1 | 2>(1)
  const [postType, setPostType] = React.useState<PostType | null>(null)
  const [body, setBody] = React.useState('')
  const [scope, setScope] = React.useState<DrumScope>(1)
  const [skin, setSkin] = React.useState<SkinContext>('egbe')
  const [recording, setRecording] = React.useState(false)
  const [recSeconds, setRecSeconds] = React.useState(0)
  const [productEmoji, setProductEmoji] = React.useState('🛒')
  const [productTitle, setProductTitle] = React.useState('')
  const [productPrice, setProductPrice] = React.useState('')
  const [delivery, setDelivery] = React.useState('collection')
  const [postLang, setPostLang] = React.useState('en')
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [waveBars] = React.useState(() => Array.from({ length: 28 }, () => Math.random()))

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('cps-css')) {
      const s = document.createElement('style')
      s.id = 'cps-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  React.useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setRecSeconds(s => {
      if (s >= 179) { setRecording(false); clearInterval(t); return 180 }
      return s + 1
    }), 1000)
    return () => clearInterval(t)
  }, [recording])

  const handleTypeSelect = (t: PostType) => {
    setPostType(t)
    setPhase(2)
  }

  const handleSend = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSending(false)
    setSent(true)
    setTimeout(onClose, 1000)
  }

  const fmtTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

  const activeSkinCfg = SKIN_CONFIG[skin]

  // Estimated heat score from content
  const estHeat = Math.min(95, 10 + body.split(' ').filter(w => w.startsWith('#')).length * 8 + Math.min(body.length / 20, 40))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#0a0f0b',
        borderTop: '1px solid rgba(212,160,23,.25)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '95vh', overflowY: 'auto',
        animation: 'cps-rise .35s ease both',
        boxShadow: '0 -8px 40px rgba(0,0,0,.6)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 8px' }}>
          {phase === 2 && (
            <button onClick={() => setPhase(1)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,.5)',
              fontSize: 20, cursor: 'pointer', padding: '0 8px 0 0',
            }}>
              ←
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: '#fff' }}>
              {phase === 1 ? 'What do you want to say to your village?' : `New ${TYPE_CONFIG.find(t => t.id === postType)?.label}`}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.6)',
            width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 16, lineHeight: 1,
          }}>
            ×
          </button>
        </div>

        {/* ── PHASE 1: Type selector ── */}
        {phase === 1 && (
          <div style={{ padding: '8px 16px 32px', animation: 'cps-type-in .2s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TYPE_CONFIG.map(t => {
                const locked = t.minCrest !== undefined && crestTier < t.minCrest
                return (
                  <button
                    key={t.id}
                    onClick={() => !locked && handleTypeSelect(t.id)}
                    disabled={locked}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 14,
                      background: t.bg, border: `1px solid ${t.color}30`,
                      cursor: locked ? 'not-allowed' : 'pointer',
                      opacity: locked ? 0.45 : 1,
                      transition: 'all .15s', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{t.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: t.color }}>
                        {t.label}
                        {locked && <span style={{ fontSize: 10, marginLeft: 8, color: '#d4a017' }}>Crest {t.minCrest}+ required</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
                        {t.desc}
                      </div>
                    </div>
                    {!locked && <span style={{ color: t.color, fontSize: 16 }}>›</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PHASE 2: Type-specific forms ── */}
        {phase === 2 && postType && (
          <div style={{ padding: '8px 16px 40px', animation: 'cps-type-in .2s ease' }}>

            {/* TEXT DRUM */}
            {postType === 'TEXT_DRUM' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <textarea
                  placeholder="Speak to your village..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  maxLength={5000}
                  rows={7}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.1)', borderRadius: 12,
                    color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: 15,
                    padding: 14, resize: 'none', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.3)' }}>
                  <span>{body.length}/5000</span>
                  {body.length > 10 && (
                    <span style={{ color: '#1a7c3e', animation: 'cps-heat-glow 2s ease-in-out infinite' }}>
                      Est. heat: {Math.round(estHeat)}°
                    </span>
                  )}
                </div>

                {/* Drum Scope */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>
                    DRUM SCOPE
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {SCOPE_CONFIG.map(sc => {
                      const locked = crestTier < sc.minCrest
                      const active = scope === sc.scope
                      return (
                        <button key={sc.scope} onClick={() => !locked && setScope(sc.scope)}
                          disabled={locked}
                          style={{
                            flex: 1, padding: '8px 4px', borderRadius: 10,
                            border: `1px solid ${active ? sc.color : 'rgba(255,255,255,.1)'}`,
                            background: active ? `${sc.color}18` : 'transparent',
                            color: active ? sc.color : 'rgba(255,255,255,.4)',
                            cursor: locked ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 700,
                            opacity: locked ? 0.4 : 1, fontFamily: "'Sora', sans-serif",
                          }}>
                          {sc.icon} {sc.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VOICE STORY */}
            {postType === 'VOICE_STORY' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                {/* Mic circle */}
                <button
                  onClick={() => { if (!recording) { setRecording(true); setRecSeconds(0) } else setRecording(false) }}
                  style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: recording ? 'rgba(178,34,34,.25)' : 'rgba(124,58,237,.15)',
                    border: `3px solid ${recording ? '#b22222' : '#7c3aed'}`,
                    fontSize: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: recording ? 'cps-mic-pulse 1.2s ease-in-out infinite, cps-mic-ring 1.2s ease-in-out infinite' : 'none',
                    boxShadow: recording ? '0 0 30px rgba(178,34,34,.3)' : 'none',
                    transition: 'all .2s',
                  }}>
                  {recording ? '⏹' : '🎙'}
                </button>
                {recording && (
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#b22222', fontFamily: "'Sora', sans-serif" }}>
                    {fmtTime(recSeconds)} / 3:00
                  </div>
                )}
                {!recording && recSeconds === 0 && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>
                    Tap the microphone to start recording<br />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Max 3 minutes</span>
                  </div>
                )}

                {/* Waveform preview */}
                {(recording || recSeconds > 0) && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    height: 48, width: '100%', padding: '0 10px',
                    background: 'rgba(124,58,237,.08)', borderRadius: 12,
                  }}>
                    {waveBars.map((h, i) => (
                      <div key={i} style={{
                        width: 3, borderRadius: 2,
                        background: recording ? '#7c3aed' : 'rgba(124,58,237,.5)',
                        minHeight: 4,
                        height: `${Math.max(8, h * 100)}%`,
                        animation: recording ? `cps-wave-bar ${0.5 + Math.random() * .8}s ease-in-out ${i * 0.03}s infinite` : 'none',
                      }} />
                    ))}
                  </div>
                )}

                {/* Language */}
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>
                    LANGUAGE (for Spirit Voice translation)
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => setPostLang(l.code)} style={{
                        padding: '5px 10px', borderRadius: 99,
                        border: `1px solid ${postLang === l.code ? '#7c3aed' : 'rgba(255,255,255,.1)'}`,
                        background: postLang === l.code ? 'rgba(124,58,237,.18)' : 'transparent',
                        color: postLang === l.code ? '#a78bfa' : 'rgba(255,255,255,.4)',
                        cursor: 'pointer', fontSize: 10, fontWeight: 700,
                      }}>
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MARKET LISTING */}
            {postType === 'MARKET_LISTING' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Product photo area */}
                <div style={{
                  height: 120, borderRadius: 14,
                  background: 'rgba(224,123,0,.08)', border: '2px dashed rgba(224,123,0,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexDirection: 'column', gap: 6,
                }}>
                  <span style={{ fontSize: 48 }}>{productEmoji}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: "'Inter', sans-serif" }}>
                    Tap to upload photo · or choose emoji
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['🥬', '🍅', '🌾', '👗', '⚡', '🫙', '🥁', '🎨', '🏺', '💡'].map(e => (
                      <button key={e} onClick={() => setProductEmoji(e)} style={{
                        background: 'none', border: 'none', fontSize: 16, cursor: 'pointer',
                        opacity: productEmoji === e ? 1 : 0.5,
                      }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  placeholder="Product title..."
                  value={productTitle}
                  onChange={e => setProductTitle(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 10, color: '#fff', fontFamily: "'Inter', sans-serif",
                    fontSize: 14, padding: '12px 14px', outline: 'none',
                  }}
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>
                      PRICE (₡ Cowrie)
                    </div>
                    <input
                      placeholder="e.g. 2400"
                      value={productPrice}
                      onChange={e => setProductPrice(e.target.value)}
                      type="number"
                      style={{
                        width: '100%', background: 'rgba(255,255,255,.04)',
                        border: '1px solid rgba(255,255,255,.1)', borderRadius: 10,
                        color: '#e07b00', fontFamily: "'Sora', sans-serif", fontSize: 16,
                        fontWeight: 800, padding: '12px 14px', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {productPrice && (
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>
                        MARKET PREVIEW
                      </div>
                      <div style={{
                        padding: '12px 14px', borderRadius: 10,
                        background: 'rgba(26,124,62,.08)', border: '1px solid rgba(26,124,62,.2)',
                        fontSize: 11, color: '#1a7c3e', fontWeight: 700, fontFamily: "'Sora', sans-serif",
                      }}>
                        ~8% below market 🎉
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>
                    DELIVERY METHOD
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {DELIVERY_OPTS.map(d => (
                      <button key={d.id} onClick={() => setDelivery(d.id)} style={{
                        padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                        border: `1px solid ${delivery === d.id ? '#e07b00' : 'rgba(255,255,255,.1)'}`,
                        background: delivery === d.id ? 'rgba(224,123,0,.12)' : 'transparent',
                        color: delivery === d.id ? '#e07b00' : 'rgba(255,255,255,.5)',
                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ORACLE SESSION / VILLAGE NOTICE / PROVERB CHAIN — simple textarea */}
            {(postType === 'ORACLE_SESSION' || postType === 'VILLAGE_NOTICE' || postType === 'PROVERB_CHAIN' || postType === 'VIDEO_REEL') && (
              <div>
                <textarea
                  placeholder={
                    postType === 'ORACLE_SESSION' ? 'What topic should the village discuss?...'
                    : postType === 'VILLAGE_NOTICE' ? 'Official announcement for the village...'
                    : postType === 'PROVERB_CHAIN' ? 'Share an ancient proverb from your people...'
                    : 'Describe your video reel...'
                  }
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.1)', borderRadius: 12,
                    color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: 14,
                    padding: 14, resize: 'none', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Skin reminder */}
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 10,
              background: `${activeSkinCfg.color}0f`,
              border: `1px solid ${activeSkinCfg.color}25`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>{activeSkinCfg.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: activeSkinCfg.color, fontFamily: "'Sora', sans-serif" }}>
                  Posting in {activeSkinCfg.label}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: "'Inter', sans-serif" }}>
                  This post will only appear to people in your {activeSkinCfg.note}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['ise', 'egbe', 'idile'] as SkinContext[]).map(s => (
                  <button key={s} onClick={() => setSkin(s)} style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: SKIN_CONFIG[s].color,
                    border: skin === s ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {SKIN_CONFIG[s].emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Post button */}
            <button
              onClick={handleSend}
              disabled={sending || sent}
              style={{
                marginTop: 16, width: '100%', padding: '15px', borderRadius: 14,
                background: sent ? '#1a7c3e' : 'linear-gradient(135deg, #1a7c3e, #0f5028)',
                border: 'none', color: '#fff', fontWeight: 800, fontSize: 15,
                fontFamily: "'Sora', sans-serif", cursor: sending ? 'wait' : 'pointer',
                animation: sending ? 'cps-send .4s ease infinite' : 'none',
                boxShadow: '0 4px 20px rgba(26,124,62,.4)',
                transition: 'background .3s',
              }}
            >
              {sent ? `✓ ${VOCAB.done}` : sending ? `${VOCAB.stir}…` : VOCAB.drumToVillage}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatePostSheet
