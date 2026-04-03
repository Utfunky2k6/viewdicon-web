'use client'
// ══════════════════════════════════════════════════════════════════════
// CREATE EVENT — Two-path wizard: Basic (4 steps) vs Hospitality (8 steps)
// ══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

const CSS = `
@keyframes ceFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes cePulse{0%,100%{box-shadow:0 0 0 0 rgba(26,124,62,.4)}50%{box-shadow:0 0 0 8px rgba(26,124,62,0)}}
.ce-fade{animation:ceFade .3s ease both}
.ce-pulse{animation:cePulse 2s ease-in-out infinite}
`
const CSS_ID = 'create-event-css'

const EVENT_TYPES = [
  { id:'WEDDING',    emoji:'💍', label:'Wedding',    desc:'Traditional or modern ceremony' },
  { id:'CONCERT',    emoji:'🎵', label:'Concert',    desc:'Live music performance' },
  { id:'FESTIVAL',   emoji:'🥁', label:'Festival',   desc:'Multi-day cultural celebration' },
  { id:'CEREMONY',   emoji:'🕯', label:'Ceremony',   desc:'Cultural or spiritual ritual' },
  { id:'CONFERENCE', emoji:'🎙', label:'Conference', desc:'Professional summit or seminar' },
  { id:'MARKET',     emoji:'🧺', label:'Market',     desc:'Trade, commerce, craft fair' },
  { id:'SPORTS',     emoji:'⚽', label:'Sports',     desc:'Tournament or sporting event' },
  { id:'COMMUNITY',  emoji:'🌳', label:'Community',  desc:'Village gathering or social' },
]

const DRUM_SCOPES = [
  { id:'VILLAGE',  emoji:'🏘', label:'Village Only',     desc:'Visible to your village members' },
  { id:'NATION',   emoji:'🌍', label:'All 20 Villages',  desc:'Pushed to Nation Square' },
  { id:'JOLLOF_TV',emoji:'📺', label:'Jollof TV Broadcast', desc:'Live segment on Jollof TV + Nation' },
]

const GATE_LAYERS = [
  { id:'ONE',   emoji:'📱', label:'QR/NFC Only',         desc:'Fast scan at gate' },
  { id:'TWO',   emoji:'👤', label:'QR + Face Match',      desc:'Biometric identity check' },
  { id:'THREE', emoji:'🎙', label:'QR + Face + Voice',    desc:'Full 3-layer sovereign gate' },
]

const PERKS_OPTIONS = [
  'Backstage access', 'Merch bundle', 'VIP food & drinks', 'Artist meet & greet',
  'Priority entry', 'Event programme booklet', 'After-party pass', 'Front-row seating',
]

interface TierDraft {
  id:   string; name: string; price: number; supply: number
  resaleAllowed: boolean; resaleCapPct: number; gateLayer: string; perks: string[]
}

function newTier(n: number): TierDraft {
  return {
    id:            `tier-${Date.now()}-${n}`,
    name:          n === 0 ? 'General' : n === 1 ? 'VIP' : 'Early Bird',
    price:         n === 0 ? 5000 : n === 1 ? 15000 : 3000,
    supply:        n === 0 ? 200  : n === 1 ? 20    : 50,
    resaleAllowed: true, resaleCapPct: 150, gateLayer: 'ONE', perks: [],
  }
}

function StepDot({ step, current, total }: { step: number; current: number; total: number }) {
  const done   = current > step
  const active = current === step
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: step < total - 1 ? 1 : 'none' }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? '#1a7c3e' : active ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.05)',
        border: `2px solid ${done ? '#1a7c3e' : active ? '#4ade80' : 'rgba(255,255,255,.1)'}`,
        fontSize: 9, fontWeight: 900, color: done ? '#fff' : active ? '#4ade80' : 'rgba(255,255,255,.25)',
        flexShrink: 0, transition: 'all .25s',
      }}>
        {done ? '✓' : step + 1}
      </div>
      {step < total - 1 && (
        <div style={{ flex: 1, height: 1, background: done ? '#1a7c3e' : 'rgba(255,255,255,.07)', margin: '0 2px', minWidth: 10 }} />
      )}
    </div>
  )
}

export default function CreateEventPage() {
  const router = useRouter()

  const [mode,   setMode]   = React.useState<'pick'|'basic'|'hospitality'>('pick')
  const [step,   setStep]   = React.useState(0)
  const [saving, setSaving] = React.useState(false)
  const [done,   setDone]   = React.useState(false)
  const [eventId,setEventId]= React.useState('')

  // Shared fields
  const [eventType,     setEventType]     = React.useState('')
  const [title,         setTitle]         = React.useState('')
  const [description,   setDescription]   = React.useState('')
  const [date,          setDate]          = React.useState('')
  const [time,          setTime]          = React.useState('18:00')
  const [endDate,       setEndDate]       = React.useState('')
  const [venueName,     setVenueName]     = React.useState('')
  const [venueCapacity, setVenueCapacity] = React.useState(0)
  const [drumScope,     setDrumScope]     = React.useState('VILLAGE')
  const [voiceNote,     setVoiceNote]     = React.useState('')

  // Tiers
  const [tiers, setTiers] = React.useState<TierDraft[]>([newTier(0)])

  // Hospitality extras
  const [coHosts,  setCoHosts]  = React.useState<string[]>([])
  const [coHostIn, setCoHostIn] = React.useState('')
  const [sponsors, setSponsors] = React.useState<{name:string;tier:string}[]>([])
  const [offlineGate, setOfflineGate] = React.useState(true)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  const basicSteps   = ['Type','Tickets','Voice','Drum']
  const hospSteps    = ['Type','Tickets','Gate','Perks','Resale','Co-Hosts','Sponsors','Drum']
  const steps        = mode === 'basic' ? basicSteps : hospSteps
  const totalSteps   = steps.length

  function addTier() {
    setTiers(t => [...t, newTier(t.length)])
  }
  function removeTier(id: string) {
    setTiers(t => t.filter(x => x.id !== id))
  }
  function updateTier(id: string, patch: Partial<TierDraft>) {
    setTiers(t => t.map(x => x.id === id ? { ...x, ...patch } : x))
  }

  const canContinue: boolean[] = mode === 'basic' ? [
    !!eventType && !!title && !!date && !!venueName,   // step 0
    tiers.every(t => t.name && t.supply > 0),          // step 1
    true,                                               // step 2 voice (optional)
    !!drumScope,                                        // step 3
  ] : [
    !!eventType && !!title && !!date && !!venueName,
    tiers.every(t => t.name && t.supply > 0),
    tiers.every(t => t.gateLayer),
    true,
    true,
    true,
    true,
    !!drumScope,
  ]

  async function handleSubmit() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1400))
    setEventId('EVT-' + Math.random().toString(36).slice(2,8).toUpperCase())
    setSaving(false)
    setDone(true)
    // In production: POST /api/events/create
  }

  // ── Mode picker ──────────────────────────────────────────────────────
  if (mode === 'pick') {
    return (
      <div style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.35)', fontSize: 20, marginBottom: 20, padding: 0, textAlign: 'left' }}>←</button>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎟</div>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg,#4ade80,#1a7c3e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>Create an Event</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 28, lineHeight: 1.6 }}>Choose the right creation path for your event.</p>

        {[
          {
            mode: 'basic' as const,
            emoji: '🏘', label: 'Basic',
            desc: 'For community events, ceremonies, local gatherings.',
            steps: '4 simple steps · Any village · Fast setup',
            color: '#4ade80',
          },
          {
            mode: 'hospitality' as const,
            emoji: '🏛', label: 'Hospitality Tier',
            desc: 'For concerts, festivals, conferences, and paid events at scale.',
            steps: '8 steps · VIP tiers · Multi-layer gate · Sponsors',
            color: '#fbbf24',
          },
        ].map(opt => (
          <button
            key={opt.mode}
            onClick={() => { setMode(opt.mode); setStep(0) }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 16, marginBottom: 12,
              background: `${opt.color}08`, border: `1.5px solid ${opt.color}25`,
              cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
            }}
          >
            <div style={{ fontSize: 28, flexShrink: 0 }}>{opt.emoji}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: opt.color, fontFamily: 'Sora,sans-serif', marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 4, lineHeight: 1.5 }}>{opt.desc}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{opt.steps}</div>
            </div>
          </button>
        ))}
      </div>
    )
  }

  // ── Success Screen ───────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🥁</div>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg,#4ade80,#1a7c3e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
          Drum Sent to the Village!
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', maxWidth: 300, lineHeight: 1.6, marginBottom: 20 }}>
          Your event is live and has been drummed to <strong style={{ color: '#4ade80' }}>{drumScope === 'VILLAGE' ? 'your village' : drumScope === 'NATION' ? 'all 20 villages' : 'Jollof TV + all villages'}</strong>.
          Tickets are now available in the CowrieChain.
        </p>

        <div style={{ background: 'rgba(26,124,62,.08)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 14, padding: '12px 20px', marginBottom: 20, fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: '#4ade80', letterSpacing: '.06em' }}>
          {eventId}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
          <button onClick={() => router.push('/dashboard/events')} style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Sora,sans-serif', cursor: 'pointer' }}>
            🎟 View All Events
          </button>
          <button onClick={() => router.push('/dashboard/calendar')} style={{ padding: '13px', borderRadius: 12, border: '1px solid rgba(74,222,128,.2)', background: 'rgba(74,222,128,.05)', color: '#4ade80', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            📅 Add to Calendar
          </button>
          <button onClick={() => { setMode('pick'); setStep(0); setDone(false) }} style={{ padding: '12px', borderRadius: 12, border: 'none', background: 'none', color: 'rgba(255,255,255,.3)', fontSize: 12, cursor: 'pointer' }}>
            + Create Another
          </button>
        </div>
      </div>
    )
  }

  // ── Wizard ───────────────────────────────────────────────────────────
  const isLast = step === totalSteps - 1

  return (
    <div style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', paddingBottom: 100, fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg,#091608,#060d08)', padding: '20px 16px 16px' }}>
        <button onClick={() => step === 0 ? setMode('pick') : setStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.35)', fontSize: 20, marginBottom: 14, padding: 0 }}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#f0f7f0', fontFamily: 'Sora,sans-serif' }}>
            {mode === 'basic' ? '🏘 Basic Event' : '🏛 Hospitality Tier'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>Step {step + 1} of {totalSteps}</div>
        </div>
        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((_, i) => <StepDot key={i} step={i} current={step} total={totalSteps} />)}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {steps[step]}
        </div>
      </div>

      {/* Step content */}
      <div style={{ padding: '16px 14px' }} className="ce-fade" key={step}>

        {/* STEP 0 — Event type + basic info */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 12 }}>What kind of event are you organizing?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {EVENT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setEventType(t.id)} style={{
                    padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    background: eventType === t.id ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${eventType === t.id ? '#4ade80' : 'rgba(255,255,255,.07)'}`,
                    color: eventType === t.id ? '#4ade80' : 'rgba(255,255,255,.45)',
                  }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label:'EVENT TITLE *', value:title, onChange:(v:string)=>setTitle(v), placeholder:'e.g. "Moonrise Festival 2026"', maxLength:80 },
              { label:'VENUE NAME *', value:venueName, onChange:(v:string)=>setVenueName(v), placeholder:'e.g. "Eko Convention Centre, Lagos"', maxLength:100 },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} maxLength={f.maxLength}
                  style={{ width: '100%', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell the village about your event…" rows={3}
                style={{ width: '100%', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>DATE *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>START TIME *</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  style={{ width: '100%', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {mode === 'hospitality' && (
              <div style={{ marginBottom: 6 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>VENUE CAPACITY</label>
                <input type="number" value={venueCapacity || ''} onChange={e => setVenueCapacity(Number(e.target.value))} placeholder="500"
                  style={{ width: '100%', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>
        )}

        {/* STEP 1 — Ticket Tiers */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
              Set up your ticket tiers. Add as many as you need.
            </p>
            {tiers.map((tier, i) => (
              <div key={tier.id} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0' }}>Tier {i + 1}</span>
                  {tiers.length > 1 && (
                    <button onClick={() => removeTier(tier.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>TIER NAME</label>
                    <input type="text" value={tier.name} onChange={e => updateTier(tier.id, { name: e.target.value })} placeholder="General / VIP / USSD-only"
                      style={{ width: '100%', padding: '9px 11px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>🐚 PRICE</label>
                    <input type="number" value={tier.price || ''} onChange={e => updateTier(tier.id, { price: Number(e.target.value) })} placeholder="5000"
                      style={{ width: '100%', padding: '9px 11px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>SUPPLY</label>
                    <input type="number" value={tier.supply || ''} onChange={e => updateTier(tier.id, { supply: Number(e.target.value) })} placeholder="200"
                      style={{ width: '100%', padding: '9px 11px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                {mode === 'hospitality' && (
                  <button onClick={() => updateTier(tier.id, { resaleAllowed: !tier.resaleAllowed })} style={{
                    padding: '5px 10px', borderRadius: 8, border: `1px solid ${tier.resaleAllowed ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.1)'}`,
                    background: tier.resaleAllowed ? 'rgba(74,222,128,.08)' : 'rgba(255,255,255,.03)',
                    color: tier.resaleAllowed ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 9, fontWeight: 700, cursor: 'pointer',
                  }}>
                    {tier.resaleAllowed ? '✓ Resale Allowed' : '✗ Resale Disabled'}
                  </button>
                )}
              </div>
            ))}
            <button onClick={addTier} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px dashed rgba(255,255,255,.15)', background: 'none', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              + Add Tier
            </button>
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(251,191,36,.05)', border: '1px solid rgba(251,191,36,.1)', fontSize: 10, color: 'rgba(251,191,36,.6)', lineHeight: 1.5 }}>
              💡 Set price to 0 for free tickets. USSD-only tiers let offline users buy via feature phone.
            </div>
          </div>
        )}

        {/* STEP 2 (hospitality) — Gate Layer per tier */}
        {step === 2 && mode === 'hospitality' && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>Set gate security level for each tier. Higher layers = more secure entry.</p>
            {tiers.map(tier => (
              <div key={tier.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0', marginBottom: 8 }}>🎟 {tier.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {GATE_LAYERS.map(gl => (
                    <button key={gl.id} onClick={() => updateTier(tier.id, { gateLayer: gl.id })} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      background: tier.gateLayer === gl.id ? 'rgba(26,124,62,.12)' : 'rgba(255,255,255,.03)',
                      border: `1px solid ${tier.gateLayer === gl.id ? '#4ade80' : 'rgba(255,255,255,.07)'}`,
                      transition: 'all .15s',
                    }}>
                      <span style={{ fontSize: 18 }}>{gl.emoji}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: tier.gateLayer === gl.id ? '#4ade80' : '#f0f7f0' }}>{gl.label}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{gl.desc}</div>
                      </div>
                      {tier.gateLayer === gl.id && <div style={{ marginLeft: 'auto', color: '#4ade80', fontSize: 12 }}>✓</div>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 (basic) — Voice announcement */}
        {step === 2 && mode === 'basic' && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>Record or paste a voice announcement to drum your event to the village (optional, max 30s).</p>
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 16, textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎙</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>Speak in your language — Spirit Voice will translate it for all listeners.</div>
              <button style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(239,68,68,.4)', background: 'rgba(239,68,68,.08)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                🔴 Record Voice Announcement
              </button>
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.07em', display: 'block', marginBottom: 6 }}>OR PASTE IPFS LINK (optional)</label>
              <input type="url" value={voiceNote} onChange={e => setVoiceNote(e.target.value)} placeholder="ipfs://Qm…"
                style={{ width: '100%', padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        )}

        {/* STEP 3 (hospitality) — Perks per tier */}
        {step === 3 && mode === 'hospitality' && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>Add perks to each tier to make them more desirable.</p>
            {tiers.map(tier => (
              <div key={tier.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0', marginBottom: 8 }}>🎟 {tier.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PERKS_OPTIONS.map(perk => {
                    const has = tier.perks.includes(perk)
                    return (
                      <button key={perk} onClick={() => updateTier(tier.id, { perks: has ? tier.perks.filter(p => p !== perk) : [...tier.perks, perk] })} style={{
                        padding: '5px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        background: has ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.04)',
                        border: `1px solid ${has ? '#4ade80' : 'rgba(255,255,255,.08)'}`,
                        color: has ? '#4ade80' : 'rgba(255,255,255,.4)',
                      }}>
                        {has ? '✓ ' : ''}{perk}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 4 (hospitality) — Resale rules */}
        {step === 4 && mode === 'hospitality' && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
              Configure resale rules per tier. Viewdicon enforces the price cap via smart contract.
            </p>
            {tiers.filter(t => t.resaleAllowed).map(tier => (
              <div key={tier.id} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f7f0', marginBottom: 10 }}>🎟 {tier.name}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>MAX RESALE % (face)</label>
                    <input type="number" value={tier.resaleCapPct} onChange={e => updateTier(tier.id, { resaleCapPct: Number(e.target.value) })}
                      style={{ width: '100%', padding: '9px 11px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', marginTop: 3 }}>e.g. 150 = max 1.5× face value</div>
                  </div>
                </div>
              </div>
            ))}
            {tiers.filter(t => !t.resaleAllowed).length > 0 && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>
                {tiers.filter(t => !t.resaleAllowed).map(t => t.name).join(', ')} — resale disabled
              </div>
            )}
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.15)', fontSize: 10, color: 'rgba(139,92,246,.7)', lineHeight: 1.5 }}>
              🔗 Resale royalties: 60% seller · 20% you (host) · 10% village treasury · 10% burned.
            </div>
          </div>
        )}

        {/* STEP 5 (hospitality) — Co-hosts */}
        {step === 5 && mode === 'hospitality' && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
              Add co-hosts by AfroID. They can manage tickets, access check-in data, and communicate with attendees.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input type="text" value={coHostIn} onChange={e => setCoHostIn(e.target.value)} placeholder="Paste AfroID hash…"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f7f0', fontSize: 12, outline: 'none' }} />
              <button onClick={() => { if (coHostIn.trim()) { setCoHosts(c => [...c, coHostIn.trim()]); setCoHostIn('') } }} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: '#1a7c3e', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
            </div>
            {coHosts.map((id, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#4ade80', fontFamily: 'monospace' }}>{id}</span>
                <button onClick={() => setCoHosts(c => c.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ))}
            {coHosts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,.2)', fontSize: 11 }}>No co-hosts yet · skip to continue</div>
            )}
          </div>
        )}

        {/* STEP 6 (hospitality) — Sponsors */}
        {step === 6 && mode === 'hospitality' && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>
              Add sponsors. Their logos appear on event materials and the Jollof TV broadcast.
            </p>
            {sponsors.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ flex: 1, fontSize: 12, color: '#f0f7f0' }}>{s.name}</span>
                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: 'rgba(251,191,36,.1)', color: '#fbbf24' }}>{s.tier}</span>
                <button onClick={() => setSponsors(sp => sp.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ))}
            <button onClick={() => setSponsors(sp => [...sp, { name: 'Sponsor ' + (sp.length + 1), tier: 'silver' }])} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px dashed rgba(255,255,255,.15)', background: 'none', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              + Add Sponsor Slot
            </button>
          </div>
        )}

        {/* LAST STEP — Drum scope + review */}
        {step === totalSteps - 1 && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>How far should your event drum travel?</p>
            {DRUM_SCOPES.map(ds => (
              <button key={ds.id} onClick={() => setDrumScope(ds.id)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 8, cursor: 'pointer', width: '100%', textAlign: 'left',
                background: drumScope === ds.id ? 'rgba(26,124,62,.12)' : 'rgba(255,255,255,.03)',
                border: `1.5px solid ${drumScope === ds.id ? '#4ade80' : 'rgba(255,255,255,.07)'}`,
                transition: 'all .15s',
              }}>
                <span style={{ fontSize: 22 }}>{ds.emoji}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: drumScope === ds.id ? '#4ade80' : '#f0f7f0' }}>{ds.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{ds.desc}</div>
                </div>
                {drumScope === ds.id && <div style={{ marginLeft: 'auto', color: '#4ade80', fontSize: 14 }}>✓</div>}
              </button>
            ))}

            {/* Summary */}
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', marginBottom: 10 }}>EVENT SUMMARY</div>
              {[
                { label:'Title',   value: title || '—' },
                { label:'Type',    value: eventType || '—' },
                { label:'Date',    value: date ? new Date(`${date}T${time}`).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—' },
                { label:'Venue',   value: venueName || '—' },
                { label:'Tiers',   value: tiers.map(t => `${t.name} (🐚${t.price} × ${t.supply})`).join(' · ') },
                { label:'Drum',    value: drumScope },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', width: 50, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 11, color: '#f0f7f0' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Offline gate toggle */}
            <button onClick={() => setOfflineGate(!offlineGate)} style={{
              display: 'flex', alignItems: 'center', gap: 10, marginTop: 12,
              padding: '10px 14px', borderRadius: 12, cursor: 'pointer', width: '100%', textAlign: 'left',
              background: offlineGate ? 'rgba(74,222,128,.07)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${offlineGate ? 'rgba(74,222,128,.25)' : 'rgba(255,255,255,.08)'}`,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: offlineGate ? '#1a7c3e' : 'rgba(255,255,255,.08)', border: `2px solid ${offlineGate ? '#4ade80' : 'rgba(255,255,255,.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>
                {offlineGate ? '✓' : ''}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: offlineGate ? '#4ade80' : 'rgba(255,255,255,.5)' }}>Offline Gate Mode</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Gate device works without internet (syncs when reconnected)</div>
              </div>
            </button>
          </div>
        )}

        {/* Voice step only in basic mode */}
        {step === 2 && mode === 'basic' && null /* already handled above */}

      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 14px 28px', background: 'linear-gradient(180deg,transparent 0%,#060d08 40%)', maxWidth: 480, margin: '0 auto', zIndex: 50 }}>
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={saving || !canContinue[step]}
            className={!saving && canContinue[step] ? 'ce-pulse' : ''}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: canContinue[step] ? 'linear-gradient(135deg,#1a7c3e,#0f5028)' : 'rgba(255,255,255,.06)',
              color: canContinue[step] ? '#fff' : 'rgba(255,255,255,.25)', fontSize: 14, fontWeight: 800, fontFamily: 'Sora,sans-serif',
            }}
          >
            {saving ? '⏳ Drumming…' : '🥁 Drum to Village'}
          </button>
        ) : (
          <button
            onClick={() => canContinue[step] && setStep(s => s + 1)}
            disabled={!canContinue[step]}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: canContinue[step] ? 'pointer' : 'not-allowed',
              background: canContinue[step] ? 'linear-gradient(135deg,#1a7c3e,#0f5028)' : 'rgba(255,255,255,.06)',
              color: canContinue[step] ? '#fff' : 'rgba(255,255,255,.25)', fontSize: 14, fontWeight: 800, fontFamily: 'Sora,sans-serif',
              boxShadow: canContinue[step] ? '0 4px 20px rgba(26,124,62,.25)' : 'none', transition: 'all .2s',
            }}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}
