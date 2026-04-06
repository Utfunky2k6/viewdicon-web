'use client'
// ════════════════════════════════════════════════════════════════════
// Jollof TV — Full-screen Stream Viewer
// Immersive live stream with type-specific overlays + commerce
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AddToPotSheet } from '@/components/jollof/stream-viewer/AddToPotSheet'
import { jollofTvApi, sesoChatApi } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────
type StreamType = 'market' | 'healing' | 'craft' | 'farm' | 'knowledge' | 'oracle'
type NkisiLevel = 'GREEN' | 'AMBER' | 'RED'

interface Speaker {
  name: string
  speaking: boolean
  color: string
}

interface ChatMessage {
  id: string
  author: string
  crestTier: number
  text: string
  isSpray?: boolean
  sprayAmount?: number
  time: string
}

interface StreamData {
  id: string; type: StreamType; isLive: boolean
  viewerCount: number; title: string
  streamerName: string; streamerRole: string
  village: string; villageEmoji: string
  city: string; country: string
  kilaCount: number; stirCount: number
  sprayCount: number; sprayCowrieTotal: number
  nkisi: NkisiLevel
  pinnedProduct?: { id?: string; name: string; price: number; soldCount: number; marketPercent: number }
  craftProgress?: number; craftTitle?: string
  agreePercent?: number; speakers?: Speaker[]
  harvestCrop?: string; harvestBags?: number
  topBid?: number; marketPrice?: number
  lessonTitle?: string; availableLangs?: string[]
  questionCount?: number; appointmentCount?: number
}

// ── CSS Keyframes ────────────────────────────────────────────────
const CSS_ID = 'jollof-viewer-css'
const CSS = `
@keyframes liveBlink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes cowrieUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(1.3);opacity:0}}
@keyframes messageIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes speakerPulse{0%{box-shadow:0 0 0 0 rgba(212,160,23,.5)}100%{box-shadow:0 0 0 10px rgba(212,160,23,0)}}
@keyframes bidEnter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes progressGlow{0%,100%{box-shadow:0 0 6px rgba(124,58,237,.3)}50%{box-shadow:0 0 14px rgba(124,58,237,.6)}}
@keyframes knotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes heartFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-50px) scale(1.4)}}
.jv-live{animation:liveBlink 1s ease-in-out infinite}
.jv-msg{animation:messageIn .25s ease both}
.jv-speaker{animation:speakerPulse 1.2s ease infinite}
.jv-bid{animation:bidEnter .3s ease both}
.jv-progress{animation:progressGlow 2s ease-in-out infinite}
.jv-knot{animation:knotPulse 2s ease-in-out infinite}
`

// ── Type Config ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<StreamType, { label: string; emoji: string; accent: string; bgGrad: string; bg: string }> = {
  market:    { label: 'Market',    emoji: '🛒', accent: '#e07b00', bgGrad: 'linear-gradient(170deg, #1a1005 0%, #0d0804 100%)', bg: '#1a1005' },
  healing:   { label: 'Healing',   emoji: '⚕️', accent: '#0369a1', bgGrad: 'linear-gradient(170deg, #04121a 0%, #0d0804 100%)', bg: '#04121a' },
  craft:     { label: 'Craft',     emoji: '🎨', accent: '#7c3aed', bgGrad: 'linear-gradient(170deg, #120a1f 0%, #0d0804 100%)', bg: '#120a1f' },
  farm:      { label: 'Farm',      emoji: '🌾', accent: '#1a7c3e', bgGrad: 'linear-gradient(170deg, #071a0e 0%, #0d0804 100%)', bg: '#071a0e' },
  knowledge: { label: 'Knowledge', emoji: '🎓', accent: '#4f46e5', bgGrad: 'linear-gradient(170deg, #0a0a1f 0%, #0d0804 100%)', bg: '#0a0a1f' },
  oracle:    { label: 'Oracle',    emoji: '🦅', accent: '#d4a017', bgGrad: 'linear-gradient(170deg, #1a1505 0%, #0d0804 100%)', bg: '#1a1505' },
}

const INITIAL_CHAT: ChatMessage[] = []

/** Map raw API response to typed StreamData */
function mapApiStream(raw: Record<string, unknown>): StreamData {
  const type = (['market','healing','craft','farm','knowledge','oracle'].includes(String(raw.type))
    ? raw.type : 'market') as StreamType
  return {
    id:               String(raw.id ?? raw.streamId ?? ''),
    type,
    isLive:           Boolean(raw.isLive ?? raw.status === 'LIVE'),
    viewerCount:      Number(raw.viewerCount ?? raw.viewers ?? 0),
    title:            String(raw.title ?? 'Live Stream'),
    streamerName:     String(raw.streamerName ?? raw.hostName ?? 'Streamer'),
    streamerRole:     String(raw.streamerRole ?? raw.hostRole ?? ''),
    village:          String(raw.village ?? raw.villageName ?? 'Village'),
    villageEmoji:     String(raw.villageEmoji ?? '🏘'),
    city:             String(raw.city ?? ''),
    country:          String(raw.country ?? ''),
    kilaCount:        Number(raw.kilaCount ?? 0),
    stirCount:        Number(raw.stirCount ?? 0),
    sprayCount:       Number(raw.sprayCount ?? 0),
    sprayCowrieTotal: Number(raw.sprayCowrieTotal ?? 0),
    nkisi:            (['GREEN','AMBER','RED'].includes(String(raw.nkisi)) ? raw.nkisi : 'GREEN') as NkisiLevel,
    pinnedProduct:    raw.pinnedProduct as StreamData['pinnedProduct'],
    craftProgress:    raw.craftProgress as number | undefined,
    craftTitle:       raw.craftTitle as string | undefined,
    agreePercent:     raw.agreePercent as number | undefined,
    speakers:         raw.speakers as Speaker[] | undefined,
    harvestCrop:      raw.harvestCrop as string | undefined,
    harvestBags:      raw.harvestBags as number | undefined,
    topBid:           raw.topBid as number | undefined,
    marketPrice:      raw.marketPrice as number | undefined,
    lessonTitle:      raw.lessonTitle as string | undefined,
    availableLangs:   raw.availableLangs as string[] | undefined,
    questionCount:    raw.questionCount as number | undefined,
    appointmentCount: raw.appointmentCount as number | undefined,
  }
}

/** Dev fallback mock so stream page is never empty */
function mockStream(id: string): StreamData {
  return {
    id, type: 'market', isLive: true, viewerCount: 1247,
    title: 'Lagos Market — Fresh Palm Oil & Spices',
    streamerName: 'Mama Ngozi', streamerRole: 'Market Vendor',
    village: 'Commerce', villageEmoji: '🧺', city: 'Lagos', country: 'NG',
    kilaCount: 892, stirCount: 234, sprayCount: 56, sprayCowrieTotal: 8400,
    nkisi: 'GREEN',
    pinnedProduct: { name: 'Premium Palm Oil · 5L', price: 4200, soldCount: 31, marketPercent: 12 },
  }
}

// ── Crest tiers (compact) ───────────────────────────────────────
const CREST = ['', '🌱', '🌿', '🌳', '⭐', '👑', '🏛', '🦅']

// ── Sub-components ───────────────────────────────────────────────

function MarketProductRail({ products, streamId: _streamId, myAfroId: _myAfroId, accent, onAddToPot }: {
  products: Array<{id?: string; name: string; price: number; soldCount?: number; marketPercent?: number}>
  streamId: string; myAfroId: string; accent: string
  onAddToPot: (productId: string, productName: string, price: number) => void
}) {
  return (
    <div style={{ height:'100%', overflowY:'auto', scrollbarWidth:'none', padding:'12px 8px', display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.08em', padding:'0 4px 4px' }}>
        🧺 {products.length} Products Live
      </div>
      {products.map((p, i) => {
        const pid = p.id ?? p.name
        const pct = p.marketPercent ?? 0
        return (
          <div key={i} style={{ background:'rgba(255,255,255,.05)', borderRadius:14, padding:'12px 11px', border:'1px solid rgba(255,255,255,.1)', display:'flex', flexDirection:'column', gap:8 }}>
            {/* Product name */}
            <div style={{ fontSize:13, fontWeight:700, color:'#f0f5ee', lineHeight:1.3 }}>{p.name}</div>
            {/* Price row */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:18, fontWeight:900, color: accent, fontFamily:'DM Mono,monospace' }}>₡{p.price.toLocaleString()}</div>
              {(p.soldCount ?? 0) > 0 && (
                <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,.4)', background:'rgba(255,255,255,.08)', borderRadius:99, padding:'3px 8px' }}>
                  {p.soldCount} sold
                </div>
              )}
            </div>
            {/* Market price vs seller bar */}
            {pct !== 0 && (
              <div style={{ fontSize:9, color: pct < 0 ? '#4ade80' : '#f87171', fontWeight:700 }}>
                {pct < 0 ? `↓ ${Math.abs(pct)}% below market` : `↑ ${pct}% above market`}
              </div>
            )}
            {/* Add to Pot button */}
            <button onClick={() => onAddToPot(pid, p.name, p.price)} style={{
              width:'100%', padding:'9px', borderRadius:10, border:'none', cursor:'pointer',
              background: `linear-gradient(135deg,${accent}cc,${accent}88)`,
              fontSize:11, fontWeight:800, color:'#fff',
            }}>
              🫙 Add to Pot
            </button>
          </div>
        )
      })}
      {products.length === 0 && (
        <div style={{ textAlign:'center', padding:'24px 12px', color:'rgba(255,255,255,.3)', fontSize:12 }}>
          No products listed yet
        </div>
      )}
    </div>
  )
}

function OracleVoteBar({ agree, setAgree, accent }: { agree: number; setAgree: (n: number) => void; accent: string }) {
  const disagree = 100 - agree
  return (
    <div style={{ padding:'14px 16px', background:'rgba(0,0,0,.6)', backdropFilter:'blur(10px)', borderTop:'1px solid rgba(255,255,255,.08)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#4ade80' }}>✅ AGREE  {agree}%</div>
        <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.4)' }}>LIVE VOTE</div>
        <div style={{ fontSize:11, fontWeight:700, color:'#f87171' }}>{disagree}%  DISAGREE ❌</div>
      </div>
      {/* Bar */}
      <div style={{ height:8, borderRadius:99, background:'rgba(255,255,255,.1)', overflow:'hidden', marginBottom:10 }}>
        <div style={{ height:'100%', width:`${agree}%`, background:'linear-gradient(90deg,#1a7c3e,#4ade80)', borderRadius:99, transition:'width .6s ease' }} />
      </div>
      {/* Vote buttons */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => setAgree(Math.min(99, agree + 3))} style={{
          flex:1, padding:'12px', borderRadius:12, border:'2px solid rgba(74,222,128,.4)',
          background:'rgba(74,222,128,.12)', color:'#4ade80', fontSize:13, fontWeight:800, cursor:'pointer'
        }}>✅ Agree</button>
        <button onClick={() => setAgree(Math.max(1, agree - 3))} style={{
          flex:1, padding:'12px', borderRadius:12, border:'2px solid rgba(248,113,113,.4)',
          background:'rgba(248,113,113,.12)', color:'#f87171', fontSize:13, fontWeight:800, cursor:'pointer'
        }}>❌ Disagree</button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════
export default function JollofStreamViewer() {
  const router = useRouter()
  const params = useParams()
  const streamId = params.streamId as string

  const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('afk-auth') : null
  const authState = storedAuth ? (() => { try { return JSON.parse(storedAuth) } catch { return null } })() : null
  const myAfroId = authState?.state?.user?.afroId ?? 'guest'

  const [stream, setStream] = React.useState<StreamData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!streamId) return
    jollofTvApi.get(streamId)
      .then((res) => {
        const data = (res as { ok?: boolean; data?: unknown }).data
        if (data && typeof data === 'object') {
          setStream(mapApiStream(data as Record<string, unknown>))
        } else {
          setStream(mockStream(streamId))
        }
      })
      .catch(() => setStream(mockStream(streamId)))
      .finally(() => setLoading(false))
  }, [streamId])

  const [showChat, setShowChat] = React.useState(true)
  const [showSpraySheet, setShowSpraySheet] = React.useState(false)
  const [sprayAmount, setSprayAmount] = React.useState(200)
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>(INITIAL_CHAT)
  const [chatInput, setChatInput] = React.useState('')
  const [kilaed, setKilaed] = React.useState(false)
  const [hearts, setHearts] = React.useState<Array<{ id: number; x: number }>>([])
  const [agreeVote, setAgreeVote] = React.useState<'agree' | 'disagree' | null>(null)
  const [handRaised, setHandRaised] = React.useState(false)
  const [stirred, setStirred] = React.useState(false)
  const [questionAsked, setQuestionAsked] = React.useState(false)
  const [addToPotOpen, setAddToPotOpen] = React.useState(false)
  const [addToPotProduct, setAddToPotProduct] = React.useState<{id:string; name:string; price:number} | null>(null)
  const [oracleAgree, setOracleAgree] = React.useState(67)
  const [bidAmount, setBidAmount] = React.useState('')
  const [activeLang, setActiveLang] = React.useState('EN')
  const [showProductSheet, setShowProductSheet] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  /* ── derives products list from stream or mock ── */
  const products = React.useMemo(() => {
    if (!stream) return []
    // market stream has products array on the stream object; fall back to pinnedProduct as array of 1
    const raw = (stream as unknown as Record<string, unknown>).products
    if (Array.isArray(raw) && raw.length > 0) return raw as Array<{id?: string; name: string; price: number; soldCount?: number; marketPercent?: number}>
    if (stream.pinnedProduct) return [{ ...stream.pinnedProduct, id: stream.pinnedProduct.id ?? stream.pinnedProduct.name }]
    return []
  }, [stream])

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0d0804', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12, animation: 'heartFloat 1.5s ease-in-out infinite' }}>📺</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(240,247,240,.5)', fontFamily: 'Sora, sans-serif' }}>
            Tuning in…
          </div>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0d0804', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f7f0', fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>
            Stream Not Found
          </div>
          <div style={{ fontSize: 12, color: 'rgba(240,247,240,.4)', marginBottom: 24 }}>
            This fire has gone cold. Return to the village.
          </div>
          <button
            onClick={() => router.push('/dashboard/jollof')}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #d4a017, #e07b00)',
              color: '#000', fontWeight: 800, fontSize: 13, fontFamily: 'Sora, sans-serif',
            }}
          >
            Back to Jollof TV
          </button>
        </div>
      </div>
    )
  }

  const tc = TYPE_CONFIG[stream.type]
  const cfg = tc

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const msg: ChatMessage = {
      id: `c-${Date.now()}`, author: 'You', crestTier: 3,
      text: chatInput, time: 'now',
    }
    setChatMessages(prev => [...prev, msg])
    setChatInput('')
  }

  const handleSpray = () => {
    const msg: ChatMessage = {
      id: `sp-${Date.now()}`, author: 'You', crestTier: 3,
      text: '', isSpray: true, sprayAmount, time: 'now',
    }
    setChatMessages(prev => [...prev, msg])
    setShowSpraySheet(false)
    jollofTvApi.spray(streamId, sprayAmount).catch(() => {})
  }

  const handleKila = () => {
    if (kilaed) return
    setKilaed(true)
    const newHeart = { id: Date.now(), x: 20 + Math.random() * 60 }
    setHearts(prev => [...prev, newHeart])
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 2000)
    jollofTvApi.kila(streamId).catch(() => {})
  }

  const handleStir = () => {
    if (stirred) return
    setStirred(true)
    setStream(prev => prev ? { ...prev, stirCount: prev.stirCount + 1 } : prev)
    jollofTvApi.kila(streamId).catch(() => {})
  }

  const handleAddToPotFromRail = (productId: string, productName: string, price: number) => {
    setAddToPotProduct({ id: productId, name: productName, price })
    setAddToPotOpen(true)
  }

  // ── Type-specific overlay ─────────────────────────────────────
  const renderTypeOverlay = () => {
    switch (stream.type) {
      case 'market':
        return stream.pinnedProduct ? (
          <div
            onClick={() => setShowProductSheet(true)}
            style={{
              position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
              background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
              borderRadius: 14, padding: '10px 12px',
              border: '1px solid rgba(224,123,0,.3)', cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'linear-gradient(135deg, #e07b00, #d4a017)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>🛒</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
                  {stream.pinnedProduct.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                    ₡{stream.pinnedProduct.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>
                    {stream.pinnedProduct.soldCount} sold
                  </span>
                </div>
              </div>
              <div style={{
                padding: '8px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #e07b00, #d4a017)',
                color: '#000', fontSize: 11, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              }}>
                🫙 Add to Pot
              </div>
            </div>
          </div>
        ) : null

      case 'craft':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(124,58,237,.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em' }}>
                🎨 CRAFT PROGRESS — {stream.craftTitle}
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#a78bfa', fontFamily: 'Sora, sans-serif' }}>
                {stream.craftProgress}%
              </div>
            </div>
            <div className="jv-progress" style={{
              height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${stream.craftProgress}%`, borderRadius: 4,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                transition: 'width .5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                onClick={() => router.push('/dashboard/villages/arts')}
                style={{
                flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'rgba(124,58,237,.15)', color: '#a78bfa', fontSize: 11, fontWeight: 700,
              }}>
                🎨 Commission Similar
              </button>
              <button
                onClick={handleKila}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: kilaed ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.06)',
                  color: kilaed ? '#d4a017' : 'rgba(240,247,240,.6)', fontSize: 11, fontWeight: 700,
                }}
              >
                ⭐ Kila
              </button>
            </div>
          </div>
        )

      case 'farm':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(26,124,62,.3)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em', marginBottom: 8 }}>
              🌾 LIVE AUCTION — {stream.harvestCrop} · {stream.harvestBags} bags
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Top Bid</div>
                <div className="jv-bid" style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                  ₡{(stream.topBid ?? 0).toLocaleString()}
                </div>
              </div>
              <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.08)' }} />
              <div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Market Price</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(240,247,240,.5)' }}>
                  ₡{(stream.marketPrice ?? 0).toLocaleString()}
                </div>
              </div>
              <div style={{
                marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: (stream.topBid ?? 0) > (stream.marketPrice ?? 0) ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
                color: (stream.topBid ?? 0) > (stream.marketPrice ?? 0) ? '#22c55e' : '#ef4444',
              }}>
                {(stream.topBid ?? 0) > (stream.marketPrice ?? 0) ? '↑ Above market' : '↓ Below market'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder="Your bid (₡)"
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: 10,
                  border: '1px solid rgba(26,124,62,.3)', background: 'rgba(255,255,255,.04)',
                  color: '#f0f7f0', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => setHandRaised(true)}
                style={{
                padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: handRaised ? 'rgba(34,197,94,.3)' : 'linear-gradient(135deg, #1a7c3e, #22c55e)',
                color: '#fff', fontWeight: 800, fontSize: 12,
              }}>
                {handRaised ? '✋ Hand Raised' : '🗣 Raise Voice'}
              </button>
            </div>
          </div>
        )

      case 'oracle':
        return <OracleVoteBar agree={oracleAgree} setAgree={setOracleAgree} accent={tc.accent} />

      case 'knowledge':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(79,70,229,.3)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)', letterSpacing: '.05em', marginBottom: 6 }}>
              🎓 {stream.lessonTitle}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(240,247,240,.3)', marginBottom: 8 }}>
              🌍 SPIRIT VOICE — SELECT LANGUAGE
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(stream.availableLangs ?? ['EN']).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: activeLang === lang ? 'rgba(79,70,229,.25)' : 'rgba(255,255,255,.05)',
                    color: activeLang === lang ? '#818cf8' : 'rgba(240,247,240,.4)',
                    fontSize: 11, fontWeight: 700,
                    outline: activeLang === lang ? '1px solid rgba(79,70,229,.4)' : 'none',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )

      case 'healing':
        return (
          <div style={{
            position: 'absolute', bottom: showChat ? 340 : 180, left: 14, right: 14,
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px',
            border: '1px solid rgba(3,105,161,.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,247,240,.4)' }}>
                ⚕️ HEALTH SESSION
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, color: '#22c55e', padding: '2px 6px', borderRadius: 5,
                background: 'rgba(34,197,94,.12)',
              }}>
                🛡 NKISI VERIFIED
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{
                flex: 1, padding: '8px 10px', borderRadius: 10,
                background: 'rgba(3,105,161,.1)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#38bdf8', fontFamily: 'Sora, sans-serif' }}>
                  {stream.questionCount ?? 0}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Questions</div>
              </div>
              <div style={{
                flex: 1, padding: '8px 10px', borderRadius: 10,
                background: 'rgba(34,197,94,.08)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>
                  {stream.appointmentCount ?? 0}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(240,247,240,.4)' }}>Appointments</div>
              </div>
            </div>
            <button
              onClick={() => setQuestionAsked(true)}
              style={{
              width: '100%', padding: '8px 0', marginTop: 10, borderRadius: 10,
              background: questionAsked ? 'rgba(34,197,94,.15)' : 'rgba(3,105,161,.15)',
              border: `1px solid ${questionAsked ? 'rgba(34,197,94,.3)' : 'rgba(3,105,161,.3)'}`,
              color: questionAsked ? '#4ade80' : '#38bdf8', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              {questionAsked ? '✅ Question Submitted' : '❓ Ask a Question'}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  /* ── MARKET STREAM: split layout — products left, video right ── */
  if (stream.type === 'market') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: tc.bgGrad,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}>
        {/* Adinkra bg */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none', backgroundImage: `repeating-linear-gradient(45deg, ${tc.accent} 0px, transparent 1px, transparent 20px, ${tc.accent} 21px)`, backgroundSize: '28px 28px' }} />

        {/* ── Compact HUD ── */}
        <div style={{ flexShrink: 0, padding: '10px 14px', paddingTop: 'max(env(safe-area-inset-top), 10px)', background: 'rgba(0,0,0,.55)', borderBottom: '1px solid rgba(255,255,255,.07)', position: 'relative', zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => router.push('/dashboard/jollof')} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${tc.accent}, ${tc.accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff' }}>{stream.streamerName.charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stream.streamerName} · {stream.title}</div>
              <div style={{ fontSize: 9, color: 'rgba(240,247,240,.5)' }}>{stream.villageEmoji} {stream.village} · {products.length} products listed</div>
            </div>
            {stream.isLive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,.2)', flexShrink: 0 }}>
                <div className="jv-live" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444' }}>LIVE</span>
              </div>
            )}
            <div style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,.08)', fontSize: 9, fontWeight: 700, color: '#f0f7f0', flexShrink: 0 }}>👁 {stream.viewerCount.toLocaleString()}</div>
          </div>
        </div>

        {/* ── Body: split view ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

          {/* LEFT PANEL: scrollable product rail — like an e-commerce shop */}
          <div style={{ width: '42%', borderRight: '1px solid rgba(255,255,255,.07)', overflowY: 'auto', scrollbarWidth: 'none', flexShrink: 0, background: 'rgba(0,0,0,.2)' }}>
            {/* Market header */}
            <div style={{ padding: '10px 12px 6px', background: `linear-gradient(135deg, ${tc.accent}18, transparent)`, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: tc.accent, textTransform: 'uppercase', letterSpacing: '.06em' }}>🧺 Live Market</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{products.length} items · Tap to buy</div>
            </div>
            {/* Products */}
            <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {products.length === 0 && (
                <div style={{ padding: '20px 12px', textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 11 }}>No products listed yet</div>
              )}
              {products.map((p, i) => {
                const pid = (p as {id?:string; name:string; price:number; soldCount?:number; marketPercent?:number}).id ?? (p as {name:string}).name
                const pct = (p as {marketPercent?:number}).marketPercent ?? 0
                const sold = (p as {soldCount?:number}).soldCount ?? 0
                const price = (p as {price:number}).price
                const name = (p as {name:string}).name
                return (
                  <div key={i} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '10px', border: '1px solid rgba(255,255,255,.09)', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {/* Product image placeholder */}
                    <div style={{ height: 80, borderRadius: 8, background: `linear-gradient(135deg, ${tc.accent}30, ${tc.accent}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🛒</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f5ee', lineHeight: 1.3 }}>{name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: tc.accent, fontFamily: 'DM Mono, monospace' }}>₡{price.toLocaleString()}</div>
                      {sold > 0 && <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.07)', borderRadius: 99, padding: '2px 6px' }}>{sold} sold</div>}
                    </div>
                    {pct !== 0 && <div style={{ fontSize: 9, color: pct < 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>{pct < 0 ? `↓ ${Math.abs(pct)}% below market` : `↑ ${pct}% above market`}</div>}
                    <button onClick={() => handleAddToPotFromRail(pid, name, price)} style={{ width: '100%', padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${tc.accent}cc, ${tc.accent}88)`, fontSize: 11, fontWeight: 800, color: '#fff' }}>🫙 Add to Pot</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT PANEL: live video stream */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.35)' }}>
            {/* Video placeholder — big type emoji */}
            <div style={{ fontSize: 72, color: 'rgba(255,255,255,.05)', fontWeight: 900, userSelect: 'none' }}>{tc.emoji}</div>
            {/* Viewer overlay at top of video */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
              <div style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,.5)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>🔴 {stream.viewerCount.toLocaleString()} watching</div>
            </div>
            {/* Floating hearts */}
            {hearts.map(h => (
              <div key={h.id} style={{ position: 'absolute', bottom: '40%', left: `${h.x}%`, fontSize: 20, animation: 'heartFloat 2s ease-out forwards', pointerEvents: 'none' }}>⭐</div>
            ))}
            {/* Side action bar */}
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <button onClick={handleKila} style={{ width: 42, height: 42, borderRadius: '50%', background: kilaed ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>⭐</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: kilaed ? '#d4a017' : 'rgba(255,255,255,.5)' }}>{stream.kilaCount}</span>
              </button>
              <button onClick={handleStir} style={{ width: 42, height: 42, borderRadius: '50%', background: stirred ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>🔥</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: stirred ? '#ef4444' : 'rgba(255,255,255,.5)' }}>{stream.stirCount}</span>
              </button>
              <button onClick={() => setShowSpraySheet(true)} style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(212,160,23,.2)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>🐚</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#d4a017' }}>{stream.sprayCount}</span>
              </button>
              <button onClick={() => setShowChat(!showChat)} style={{ width: 42, height: 42, borderRadius: '50%', background: showChat ? `${tc.accent}30` : 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💬</button>
            </div>
          </div>
        </div>

        {/* ── Live Chat Panel ── */}
        {showChat && (
          <div style={{ height: 190, background: 'rgba(0,0,0,.88)', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative', zIndex: 5 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 5, scrollbarWidth: 'none' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} className="jv-msg" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  {msg.isSpray ? (
                    <div style={{ fontSize: 11, color: '#d4a017', fontWeight: 700 }}><span style={{ color: '#f0f7f0', fontWeight: 800 }}>{msg.author}</span> sprayed 🐚 ₡{msg.sprayAmount}</div>
                  ) : (
                    <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                      <span style={{ color: tc.accent, fontWeight: 800 }}>{CREST[msg.crestTier] ?? ''} {msg.author}</span>
                      <span style={{ color: 'rgba(240,247,240,.7)', marginLeft: 4 }}>{msg.text}</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '6px 12px', paddingBottom: 'max(env(safe-area-inset-bottom), 10px)', display: 'flex', gap: 6 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Ask about products..." style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={handleSendChat} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `${tc.accent}30`, color: tc.accent, fontWeight: 800, fontSize: 13 }}>↑</button>
            </div>
          </div>
        )}

        {/* ── Spray Sheet ── */}
        {showSpraySheet && (
          <div onClick={() => setShowSpraySheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#1a1005', border: '1px solid rgba(212,160,23,.2)', borderRadius: '24px 24px 0 0', padding: '18px 18px 28px' }}>
              <div style={{ width: 38, height: 4, borderRadius: 2, margin: '0 auto 14px', background: 'rgba(255,255,255,.15)' }} />
              <div style={{ fontSize: 15, fontWeight: 900, color: '#f0f7f0', textAlign: 'center', fontFamily: 'Sora, sans-serif', marginBottom: 3 }}>🐚 Spray Cowries</div>
              <div style={{ fontSize: 10, color: 'rgba(240,247,240,.4)', textAlign: 'center', marginBottom: 14 }}>Show appreciation to {stream.streamerName}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[50, 200, 500, 1000].map(amt => (
                  <button key={amt} onClick={() => setSprayAmount(amt)} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: sprayAmount === amt ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.05)', color: sprayAmount === amt ? '#d4a017' : 'rgba(240,247,240,.5)', fontSize: 13, fontWeight: 800 }}>₡{amt}</button>
                ))}
              </div>
              <button onClick={handleSpray} style={{ width: '100%', padding: '13px', borderRadius: 13, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #d4a017, #e07b00)', color: '#000', fontSize: 13, fontWeight: 800 }}>🐚 Spray ₡{sprayAmount}</button>
            </div>
          </div>
        )}

        {/* ── Add to Pot commerce bridge ── */}
        {addToPotOpen && addToPotProduct && (
          <AddToPotSheet
            streamId={streamId}
            product={{ id: addToPotProduct.id, name: addToPotProduct.name, price: addToPotProduct.price, soldCount: 0, marketPercent: 0 }}
            streamerName={stream.streamerName}
            buyerAfroId={myAfroId}
            onClose={() => setAddToPotOpen(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: tc.bgGrad,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Adinkra pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(45deg, ${tc.accent} 0px, transparent 1px, transparent 20px, ${tc.accent} 21px)`,
        backgroundSize: '28px 28px',
      }} />

      {/* ── Top HUD ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
        padding: '12px 14px', paddingTop: 'max(env(safe-area-inset-top), 12px)',
        background: 'linear-gradient(180deg, rgba(0,0,0,.7) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Back */}
          <button
            onClick={() => router.push('/dashboard/jollof')}
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ←
          </button>

          {/* Streamer info */}
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${tc.accent}, ${tc.accent}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff',
          }}>
            {stream.streamerName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
              {stream.streamerName}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(240,247,240,.5)' }}>
              {stream.streamerRole} · {stream.villageEmoji} {stream.village}
            </div>
          </div>

          {/* LIVE badge */}
          {stream.isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,.2)' }}>
              <div className="jv-live" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444' }}>LIVE</span>
            </div>
          )}

          {/* Viewer count */}
          <div style={{
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,.1)',
            fontSize: 10, fontWeight: 700, color: '#f0f7f0',
          }}>
            👁 {stream.viewerCount.toLocaleString()}
          </div>
        </div>

        {/* Title */}
        <div style={{
          marginTop: 8, fontSize: 14, fontWeight: 700, color: '#f0f7f0',
          fontFamily: 'Sora, sans-serif', lineHeight: 1.4,
        }}>
          {stream.title}
        </div>

        {/* Type badge + nkisi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 800,
            background: `${tc.accent}20`, color: tc.accent,
          }}>
            {tc.emoji} {tc.label.toUpperCase()}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
            background: stream.nkisi === 'GREEN' ? 'rgba(34,197,94,.12)' : 'rgba(234,179,8,.12)',
            color: stream.nkisi === 'GREEN' ? '#22c55e' : '#eab308',
          }}>
            🛡 {stream.nkisi}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(240,247,240,.35)', marginLeft: 'auto' }}>
            {stream.city}, {stream.country}
          </span>
        </div>
      </div>

      {/* ── Video Area (placeholder) ──────────────────────────── */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 48, color: 'rgba(255,255,255,.08)',
          fontFamily: 'Sora, sans-serif', fontWeight: 900,
        }}>
          {tc.emoji}
        </div>

        {/* Floating hearts */}
        {hearts.map(h => (
          <div
            key={h.id}
            style={{
              position: 'absolute', bottom: '50%', left: `${h.x}%`,
              fontSize: 24, animation: 'heartFloat 2s ease-out forwards',
              pointerEvents: 'none',
            }}
          >
            ⭐
          </div>
        ))}

        {/* ── Type overlay ────────────────────────────────────── */}
        {renderTypeOverlay()}
      </div>

      {/* ── Side action bar ───────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: 12, bottom: showChat ? 360 : 200,
        display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', zIndex: 10,
      }}>
        {/* Kila */}
        <button
          onClick={handleKila}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: kilaed ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: kilaed ? '#d4a017' : 'rgba(255,255,255,.6)' }}>
            {stream.kilaCount}
          </span>
        </button>

        {/* Stir */}
        <button
          onClick={handleStir}
          style={{
          width: 44, height: 44, borderRadius: '50%',
          background: stirred ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)',
          border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: stirred ? '#ef4444' : 'rgba(255,255,255,.6)' }}>{stream.stirCount}</span>
        </button>

        {/* Spray */}
        <button
          onClick={() => setShowSpraySheet(true)}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(212,160,23,.2)', backdropFilter: 'blur(8px)',
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18 }}>🐚</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: '#d4a017' }}>{stream.sprayCount}</span>
        </button>

        {/* Chat toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: showChat ? `${tc.accent}30` : 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}
        >
          💬
        </button>

        {/* Book This Person */}
        <button
          onClick={async () => {
            try {
              const res = await sesoChatApi.startBusiness(stream.id, `Booking: ${stream.streamerName} — ${stream.title}`)
              const chatId = (res as any)?.chatId ?? (res as any)?.data?.chatId ?? `b-${stream.id}`
              router.push(`/dashboard/chat/${chatId}`)
            } catch {
              router.push(`/dashboard/chat/b-${stream.id}`)
            }
          }}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(212,160,23,.2)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212,160,23,.3)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: '#d4a017' }}>Book</span>
        </button>
      </div>

      {/* ── Live Chat Panel ───────────────────────────────────── */}
      {showChat && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 280, zIndex: 6,
          background: 'linear-gradient(0deg, rgba(0,0,0,.85) 70%, transparent 100%)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '40px 14px 8px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {chatMessages.map(msg => (
              <div key={msg.id} className="jv-msg" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                {msg.isSpray ? (
                  <div style={{ fontSize: 12, color: '#d4a017', fontWeight: 700 }}>
                    <span style={{ color: '#f0f7f0', fontWeight: 800 }}>{msg.author}</span>
                    <span style={{ marginLeft: 4 }}>sprayed 🐚 ₡{msg.sprayAmount}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    <span style={{ color: tc.accent, fontWeight: 800 }}>
                      {CREST[msg.crestTier] ?? ''} {msg.author}
                    </span>
                    <span style={{ color: 'rgba(240,247,240,.7)', marginLeft: 5 }}>{msg.text}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 14px', paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
            display: 'flex', gap: 6,
          }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder="Say something..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
                color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSendChat}
              style={{
                padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: `${tc.accent}30`, color: tc.accent, fontWeight: 800, fontSize: 13,
              }}
            >
              ↑
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await sesoChatApi.startBusiness(stream.id, `Booking: ${stream.streamerName} — ${stream.title}`)
                  const chatId = (res as any)?.chatId ?? (res as any)?.data?.chatId ?? `b-${stream.id}`
                  router.push(`/dashboard/chat/${chatId}`)
                } catch {
                  router.push(`/dashboard/chat/b-${stream.id}`)
                }
              }}
              style={{
                padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(212,160,23,.3), rgba(212,160,23,.15))',
                outline: '1px solid rgba(212,160,23,.3)',
                color: '#d4a017', fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              📋 Book
            </button>
          </div>
        </div>
      )}

      {/* ── Spray Amount Sheet ────────────────────────────────── */}
      {showSpraySheet && (
        <div
          onClick={() => setShowSpraySheet(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,.6)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: '#1a1005',
              border: '1px solid rgba(212,160,23,.2)',
              borderRadius: '24px 24px 0 0', padding: '20px 20px 32px',
            }}
          >
            <div style={{
              width: 40, height: 4, borderRadius: 2, margin: '0 auto 16px',
              background: 'rgba(255,255,255,.15)',
            }} />
            <div style={{
              fontSize: 16, fontWeight: 900, color: '#f0f7f0', textAlign: 'center',
              fontFamily: 'Sora, sans-serif', marginBottom: 4,
            }}>
              🐚 Spray Cowries
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,247,240,.4)', textAlign: 'center', marginBottom: 16 }}>
              Show appreciation to {stream.streamerName}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[50, 200, 500, 1000].map(amt => (
                <button
                  key={amt} onClick={() => setSprayAmount(amt)}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: sprayAmount === amt ? 'rgba(212,160,23,.2)' : 'rgba(255,255,255,.05)',
                    outline: sprayAmount === amt ? '2px solid rgba(212,160,23,.5)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>🐚</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: sprayAmount === amt ? '#d4a017' : '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
                    ₡{amt}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleSpray}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #d4a017, #e07b00)',
                color: '#000', fontWeight: 900, fontSize: 15, fontFamily: 'Sora, sans-serif',
              }}
            >
              Spray ₡{sprayAmount}
            </button>
          </div>
        </div>
      )}

      {/* ── Add to Pot Sheet (Commerce Bridge) ───────────────── */}
      {showProductSheet && stream.pinnedProduct && (
        <AddToPotSheet
          streamId={streamId}
          product={{
            id:            stream.pinnedProduct.id ?? stream.pinnedProduct.name,
            name:          stream.pinnedProduct.name,
            price:         stream.pinnedProduct.price,
            soldCount:     stream.pinnedProduct.soldCount,
            marketPercent: stream.pinnedProduct.marketPercent,
          }}
          streamerName={stream.streamerName}
          buyerAfroId={myAfroId}
          onClose={() => setShowProductSheet(false)}
        />
      )}
    </div>
  )
}
