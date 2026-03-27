'use client'
// ══════════════════════════════════════════════════════════════════════
// EVENT DETAIL — Buy tickets · Waiting Compound · Event info
// ══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
@keyframes edFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes edPulse{0%,100%{opacity:1}50%{opacity:.4}}
.ed-fade{animation:edFade .3s ease both}
.ed-blip{animation:edPulse 1.2s ease-in-out infinite}
@keyframes ticketIn{from{transform:translateY(100%)}to{transform:translateY(0)}}
.ticket-drawer{animation:ticketIn .35s cubic-bezier(.32,1.25,.32,1) both}
`
const CSS_ID = 'event-detail-css'

interface EventTier {
  id: string; name: string; price: number; supply: number; sold: number
  resaleAllowed: boolean; gateLayer: string; perks: string[]
}
interface WaitingListing { id: string; tierName: string; askPrice: number; queuePosition: number; sellerAfroId: string }
interface EventDetail {
  id: string; title: string; eventType: string; date: string; endDate: string
  venueName: string; description: string; villageId: string; village: string
  villageEmoji: string; villageColor: string; coverEmoji: string; status: string
  isHospitalityTier: boolean; drumScope: string
  tiers: EventTier[]
  coHosts: string[]; sponsors: { name: string; tier: string }[]
  waitingCompound: WaitingListing[]
}

// PLACEHOLDER — will be overwritten in the main edit below
const GATE_LAYER_META: Record<string, { label: string; color: string }> = {
  ONE:   { label: 'QR Scan',              color: '#4ade80' },
  TWO:   { label: 'QR + Face Match',      color: '#fbbf24' },
  THREE: { label: 'QR + Face + Voice',    color: '#a78bfa' },
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams<{ eventId: string }>()
  const [ev, setEv] = React.useState<EventDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [buyingTier, setBuyingTier]   = React.useState<EventTier | null>(null)
  const [tab,        setTab]          = React.useState<'info'|'tickets'|'waiting'>('info')
  const [buying,     setBuying]       = React.useState(false)
  const [bought,     setBought]       = React.useState<{tierId:string;ticketHash:string}|null>(null)
  const [drumScope,  setDrumScope]    = React.useState<'VILLAGE'|'NATION'|'JOLLOF_TV'>('VILLAGE')
  const [drumming,   setDrumming]     = React.useState(false)
  const [drumDone,   setDrumDone]     = React.useState(false)
  const [showDrumSheet, setShowDrumSheet] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    if (!params.eventId) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/events/${params.eventId}`)
        if (res.ok) { setEv(await res.json()) }
      } catch { /* show not-found */ }
      finally { setLoading(false) }
    })()
  }, [params.eventId])

  if (loading) {
    return (
      <div style={{ background:'#060d08', minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(74,222,128,.3)', borderTopColor:'#4ade80', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
          <div style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>Loading event…</div>
        </div>
      </div>
    )
  }

  if (!ev) {
    return (
      <div style={{ background:'#060d08', minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
        <div style={{ fontSize:40 }}>🎟</div>
        <div style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,.5)' }}>Event not found</div>
        <button onClick={() => window.history.back()} style={{ padding:'10px 20px', borderRadius:10, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.5)', cursor:'pointer' }}>← Go back</button>
      </div>
    )
  }

  async function handleBuy(tier: EventTier) {
    if (!ev) return
    setBuying(true)
    await new Promise(r => setTimeout(r, 1500))
    setBuying(false)
    setBuyingTier(null)
    setBought({ tierId: tier.id, ticketHash: 'CTKT-' + Math.random().toString(36).slice(2,10).toUpperCase() })
  }

  async function handleDrumToFeed() {
    if (!ev) return
    setDrumming(true)
    const scopeInt = drumScope === 'VILLAGE' ? 1 : drumScope === 'NATION' ? 2 : 3
    const eventPayload = JSON.stringify({
      __type: 'event_drum',
      eventId: ev.id,
      title: ev.title,
      eventType: ev.eventType,
      date: ev.date,
      venueName: ev.venueName,
      villageId: ev.villageId,
      village: ev.village,
      villageEmoji: ev.villageEmoji,
      villageColor: ev.villageColor,
      coverEmoji: ev.coverEmoji,
      drumScope,
      tiers: ev.tiers.map(t => ({ name: t.name, price: t.price, available: t.supply - t.sold })),
      isHospitalityTier: ev.isHospitalityTier,
      description: ev.description.split('\n')[0],
    })
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: eventPayload, villageId: ev.villageId, drumScope: scopeInt }),
      })
    } catch { /* offline fallback — drum still counts locally */ }
    setDrumming(false)
    setDrumDone(true)
    setShowDrumSheet(false)
  }

  const dateObj = new Date(ev.date)

  // Bought confirmation screen
  if (bought) {
    const tier = ev.tiers.find(t => t.id === bought.tierId)!
    return (
      <div style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🎟</div>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg,#4ade80,#1a7c3e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
          CowrieTicket Minted!
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', maxWidth: 300, lineHeight: 1.6, marginBottom: 20 }}>
          Your <strong style={{ color:'#4ade80' }}>{tier.name}</strong> ticket is now in your Cowrie Pot as a CowrieChain NFT.
        </p>

        {/* Ticket visual */}
        <div style={{ width: '100%', maxWidth: 280, marginBottom: 24 }}>
          <div style={{ background: `linear-gradient(135deg, ${ev.villageColor}20, #0d1020)`, border: `1px solid ${ev.villageColor}30`, borderRadius: 20, padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', marginBottom: 4 }}>COWRIE TICKET</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f0f7f0', fontFamily: 'Sora,sans-serif', marginBottom: 2 }}>{ev.title}</div>
            <div style={{ fontSize: 11, color: ev.villageColor, marginBottom: 12 }}>{tier.name}</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>DATE</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f7f0' }}>{dateObj.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)' }}>VENUE</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f7f0' }}>{ev.venueName.split(',')[0]}</div>
              </div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#4ade80', letterSpacing: '.06em', fontWeight: 900 }}>{bought.ticketHash}</div>
            {tier.perks.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {tier.perks.map(p => <span key={p} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 99, background: `${ev.villageColor}20`, color: ev.villageColor }}>{p}</span>)}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 300 }}>
          <button onClick={() => router.push('/dashboard/cowrie-pot')} style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Sora,sans-serif', cursor: 'pointer' }}>
            🐚 View in Cowrie Pot
          </button>
          <button onClick={() => router.push('/dashboard/calendar')} style={{ padding: '13px', borderRadius: 12, border: '1px solid rgba(74,222,128,.2)', background: 'rgba(74,222,128,.05)', color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            📅 Add to Calendar
          </button>
          <button onClick={() => setBought(null)} style={{ padding: '12px', borderRadius: 12, border: 'none', background: 'none', color: 'rgba(255,255,255,.3)', fontSize: 11, cursor: 'pointer' }}>← Back to Event</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', paddingBottom: 120 }}>

      {/* ── Cover Hero ─────────────────────────────────────────────── */}
      <div style={{
        height: 200, background: `linear-gradient(135deg, ${ev.villageColor}22, #0d1020)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80,
        position: 'relative', borderBottom: '1px solid rgba(255,255,255,.05)',
      }}>
        {ev.coverEmoji}
        <button onClick={() => router.back()} style={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', fontSize: 16, cursor: 'pointer' }}>←</button>
        {ev.drumScope === 'JOLLOF_TV' && (
          <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 10px', borderRadius: 99, fontSize: 9, fontWeight: 800, background: 'rgba(239,68,68,.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,.3)' }}>
            📺 JOLLOF TV
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 12, left: 16, display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: 'rgba(239,68,68,.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="ed-blip" style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />LIVE
          </span>
          {ev.isHospitalityTier && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'rgba(212,160,23,.1)', color: '#d4a017' }}>🏛 Hospitality</span>}
        </div>
      </div>

      {/* ── Title Block ────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 20, fontWeight: 900, color: '#f0f7f0', marginBottom: 4 }}>{ev.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 12 }}>{ev.villageEmoji}</span>
          <span style={{ fontSize: 11, color: ev.villageColor, fontWeight: 700 }}>{ev.village}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>📅 {dateObj.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>⏰ {dateObj.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>📍 {ev.venueName}</span>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)', margin: '0 0' }}>
        {(['info','tickets','waiting'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: 'none', border: 'none',
            color: tab === t ? '#4ade80' : 'rgba(255,255,255,.35)',
            borderBottom: `2px solid ${tab === t ? '#4ade80' : 'transparent'}`,
            transition: 'all .15s',
          }}>
            {t === 'info' ? '📋 Info' : t === 'tickets' ? '🎟 Tickets' : '⏳ Waiting'}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px' }} className="ed-fade" key={tab}>

        {/* INFO TAB */}
        {tab === 'info' && (
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
              {ev.description}
            </p>
            {ev.sponsors.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.07em', marginBottom: 8 }}>SPONSORS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ev.sponsors.map(sp => (
                    <span key={sp.name} style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', fontSize: 10, fontWeight: 700, color: sp.tier === 'gold' ? '#fbbf24' : 'rgba(255,255,255,.5)' }}>
                      {sp.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {ev.coHosts.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.07em', marginBottom: 8 }}>CO-HOSTS</div>
                {ev.coHosts.map(h => (
                  <div key={h} style={{ fontSize: 11, color: '#4ade80', marginBottom: 4 }}>{h}</div>
                ))}
              </div>
            )}
            {/* Gate info */}
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.07em', marginBottom: 8 }}>GATE ENTRY</div>
              {ev.tiers.map(t => {
                const gl = GATE_LAYER_META[t.gateLayer]
                return (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{t.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: gl.color }}>{gl.label}</span>
                  </div>
                )
              })}
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 6 }}>
                Works offline · syncs to CowrieChain when reconnected
              </div>
            </div>
          </div>
        )}

        {/* TICKETS TAB */}
        {tab === 'tickets' && (
          <div>
            {ev.tiers.map(tier => {
              const available = tier.supply - tier.sold
              const soldOut   = available === 0
              return (
                <div key={tier.id} style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${soldOut ? 'rgba(107,114,128,.2)' : 'rgba(74,222,128,.15)'}`, borderRadius: 16, padding: '14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f7f0', fontFamily: 'Sora,sans-serif' }}>{tier.name}</div>
                      <div style={{ fontSize: 10, color: soldOut ? '#6b7280' : '#4ade80', marginTop: 2 }}>
                        {soldOut ? 'Sold Out' : `${available} of ${tier.supply} remaining`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora,sans-serif' }}>
                        {tier.price === 0 ? 'FREE' : `🐚 ${tier.price.toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {tier.perks.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {tier.perks.map(p => (
                        <span key={p} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: `${ev.villageColor}15`, color: ev.villageColor, border: `1px solid ${ev.villageColor}25` }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: `${GATE_LAYER_META[tier.gateLayer].color}15`, color: GATE_LAYER_META[tier.gateLayer].color }}>
                      🔐 {GATE_LAYER_META[tier.gateLayer].label}
                    </span>
                    {tier.resaleAllowed && (
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: 'rgba(139,92,246,.1)', color: '#a78bfa' }}>
                        🔁 Resale Drum enabled
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => !soldOut && setBuyingTier(tier)}
                    disabled={soldOut}
                    style={{
                      width: '100%', padding: '11px', borderRadius: 12, border: 'none',
                      background: soldOut ? 'rgba(107,114,128,.12)' : 'linear-gradient(135deg,#1a7c3e,#0f5028)',
                      color: soldOut ? '#6b7280' : '#fff', fontSize: 13, fontWeight: 800,
                      fontFamily: 'Sora,sans-serif', cursor: soldOut ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {soldOut ? 'Sold Out — Join Waiting Compound →' : `🎟 Buy ${tier.name} Ticket`}
                  </button>
                </div>
              )
            })}

            <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.15)', fontSize: 10, color: 'rgba(139,92,246,.7)', lineHeight: 1.6, marginTop: 4 }}>
              🔗 All tickets are CowrieTicket NFTs on CowrieChain. They live in your Cowrie Pot.
              If you can't attend, list on the Resale Drum — first in Waiting Compound gets it.
            </div>
          </div>
        )}

        {/* WAITING COMPOUND TAB */}
        {tab === 'waiting' && (
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14, lineHeight: 1.6 }}>
              The Waiting Compound is a fair resale queue. No scalping — first in line gets the ticket. Price capped at 150% of face value.
            </div>
            {ev.waitingCompound.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,.2)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div>No resale listings yet</div>
              </div>
            ) : (
              ev.waitingCompound.map((listing, i) => (
                <div key={listing.id} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>#{listing.queuePosition} in queue · {listing.tierName}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Seller: {listing.sellerAfroId.slice(0,12)}…</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#fbbf24' }}>🐚 {listing.askPrice.toLocaleString()}</div>
                  </div>
                  {i === 0 && (
                    <button style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#fbbf24,#d97706)', color: '#1a0a00', fontSize: 12, fontWeight: 800, fontFamily: 'Sora,sans-serif', cursor: 'pointer' }}>
                      🥇 You're Next — Buy from Waiting Compound
                    </button>
                  )}
                </div>
              ))
            )}

            <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px dashed rgba(255,255,255,.15)', background: 'none', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
              + Join Waiting Compound
            </button>
          </div>
        )}
      </div>

      {/* ── Buy Drawer ─────────────────────────────────────────────── */}
      {buyingTier && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={() => setBuyingTier(null)} style={{ flex: 1, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)' }} />
          <div className="ticket-drawer" style={{ background: '#080f09', border: '1px solid rgba(26,124,62,.2)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 900, color: '#f0f7f0', marginBottom: 4 }}>
              🎟 Buy {buyingTier.name} Ticket
            </h2>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginBottom: 16 }}>{ev.title}</p>

            {/* Price breakdown */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
              {[
                { label: `${buyingTier.name} ticket`,    value: buyingTier.price },
                { label: 'Processing fee (2%)',           value: Math.round(buyingTier.price * 0.02), neg: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: row.neg ? '#ef4444' : '#f0f7f0' }}>
                    {row.neg ? '-' : ''}🐚 {Math.abs(row.value).toLocaleString()}
                  </span>
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f7f0' }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#4ade80' }}>🐚 {Math.round(buyingTier.price * 1.02).toLocaleString()}</span>
              </div>
            </div>

            {buyingTier.perks.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,.6)', letterSpacing: '.06em', marginBottom: 6 }}>INCLUDED PERKS</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {buyingTier.perks.map(p => <span key={p} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: `${ev.villageColor}15`, color: ev.villageColor }}>✓ {p}</span>)}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 14, padding: '10px', borderRadius: 10, background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.15)', fontSize: 10, color: 'rgba(139,92,246,.7)', lineHeight: 1.5 }}>
              🔐 Gate: {GATE_LAYER_META[buyingTier.gateLayer].label} · After purchase, your face photo will be required for entry.
            </div>

            <button onClick={() => handleBuy(buyingTier)} disabled={buying} style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff',
              fontSize: 14, fontWeight: 800, fontFamily: 'Sora,sans-serif', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(26,124,62,.3)',
            }}>
              {buying ? '⏳ Minting to CowrieChain…' : `🎟 Confirm — 🐚 ${Math.round(buyingTier.price * 1.02).toLocaleString()}`}
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky CTA ──────────────────────────────────────────────── */}
      {!buyingTier && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '10px 16px 28px', background: 'linear-gradient(180deg,transparent 0%,#060d08 40%)', maxWidth: 480, margin: '0 auto', zIndex: 50 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={() => setTab('tickets')} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Sora,sans-serif', cursor: 'pointer' }}>
              🎟 Get Tickets
            </button>
            <button onClick={() => router.push(`/dashboard/events/${params.eventId}/gate`)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              🚪 Gate
            </button>
          </div>
          <button
            onClick={() => drumDone ? undefined : setShowDrumSheet(true)}
            disabled={drumming}
            style={{
              width: '100%', padding: '11px', borderRadius: 12, border: 'none', cursor: drumDone ? 'default' : 'pointer',
              background: drumDone ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.06)',
              color: drumDone ? '#4ade80' : 'rgba(255,255,255,.5)',
              fontSize: 12, fontWeight: 700, transition: 'all .15s',
            }}
          >
            {drumming ? '⏳ Drumming…' : drumDone ? '✅ Drummed to the Feed!' : '🥁 Drum to Village Feed'}
          </button>
        </div>
      )}

      {/* ── Drum Scope Sheet ─────────────────────────────────────────── */}
      {showDrumSheet && (
        <div
          onClick={() => setShowDrumSheet(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="ed-fade"
            style={{ background: '#0f1a10', borderRadius: '20px 20px 0 0', padding: '20px 16px 36px', width: '100%', maxWidth: 480, margin: '0 auto' }}
          >
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 16, fontWeight: 900, color: '#f0f7f0', marginBottom: 6 }}>
              🥁 Drum to the Feed
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 16, lineHeight: 1.5 }}>
              Choose how far your drum reaches. The wider the scope, the more people hear of your event.
            </p>

            {(['VILLAGE', 'NATION', 'JOLLOF_TV'] as const).map(scope => {
              const meta = {
                VILLAGE:   { emoji: '🏘', label: 'Village Drum', desc: 'Only members of your village see this post', color: '#9ca3af' },
                NATION:    { emoji: '🌍', label: 'Nation-wide',   desc: 'All 20 villages — the full Nation hears the drum', color: '#4ade80' },
                JOLLOF_TV: { emoji: '📺', label: 'Global · Jollof TV', desc: 'Across the world — livestreamed globally', color: '#ef4444' },
              }[scope]
              const active = drumScope === scope
              return (
                <button
                  key={scope}
                  onClick={() => setDrumScope(scope)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px',
                    borderRadius: 14, border: `1.5px solid ${active ? meta.color : 'rgba(255,255,255,.08)'}`,
                    background: active ? `${meta.color}12` : 'rgba(255,255,255,.03)',
                    cursor: 'pointer', marginBottom: 8, textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: active ? meta.color : '#f0f7f0', fontFamily: 'Sora,sans-serif' }}>{meta.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{meta.desc}</div>
                  </div>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${active ? meta.color : 'rgba(255,255,255,.2)'}`, background: active ? meta.color : 'none', display: 'inline-block', flexShrink: 0 }} />
                </button>
              )
            })}

            <button
              onClick={handleDrumToFeed}
              disabled={drumming}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer', marginTop: 4,
                background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff',
                fontSize: 14, fontWeight: 800, fontFamily: 'Sora,sans-serif',
                boxShadow: '0 4px 20px rgba(26,124,62,.3)',
              }}
            >
              {drumming ? '⏳ Drumming…' : '🥁 Beat the Drum Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
