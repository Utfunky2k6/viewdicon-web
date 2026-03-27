'use client'
// ════════════════════════════════════════════════════════════════════
// APPLY TO BROADCAST — 5-Step Village Airwaves Application
// Village → Show Concept → Time Slot → Cowrie Deposit → Review
// ════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { TV_VILLAGE_META, SLOT_PRICES, TIER_META, type SlotTier, type ShowCategory, SHOW_CATEGORY_META } from '@/lib/tv-schedule'

// ── CSS ──────────────────────────────────────────────────────────────
const CSS_ID = 'apply-css'
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
@keyframes applyFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes applyPulse{0%,100%{box-shadow:0 0 0 0 rgba(26,124,62,.4)}50%{box-shadow:0 0 0 8px rgba(26,124,62,0)}}
@keyframes spinIn{from{transform:rotate(-180deg) scale(0)}to{transform:rotate(0) scale(1)}}
@keyframes successBounce{0%{transform:scale(.5)}60%{transform:scale(1.1)}100%{transform:scale(1)}}
.ap-fade{animation:applyFade .35s ease both}
.ap-pulse{animation:applyPulse 2s ease-in-out infinite}
.ap-spin{animation:spinIn .5s ease both}
.ap-bounce{animation:successBounce .6s ease both}
`

// ── Constants ─────────────────────────────────────────────────────────
const VILLAGE_LIST = Object.entries(TV_VILLAGE_META).map(([id, meta]) => ({ id, ...meta }))

const SHOW_CATEGORIES: ShowCategory[] = ['market','wellness','education','music','talk','craft','news','sport','spirit','business','culture','tech']

const SLOT_TIERS: SlotTier[] = ['DAWN','MORNING','MIDDAY','PRIME','NIGHT']

const PREFERRED_DAYS = [
  { id:'mon', label:'Mon' }, { id:'tue', label:'Tue' }, { id:'wed', label:'Wed' },
  { id:'thu', label:'Thu' }, { id:'fri', label:'Fri' }, { id:'sat', label:'Sat' },
  { id:'sun', label:'Sun' },
]

const FORMAT_OPTIONS = [
  { id:'solo',  emoji:'🎙', label:'Solo Host',       desc:'Just you and the camera' },
  { id:'panel', emoji:'👥', label:'Panel Discussion', desc:'2–5 guests debating a topic' },
  { id:'demo',  emoji:'🛠', label:'Live Demo',        desc:'Product, craft, or skill showcase' },
  { id:'class', emoji:'📚', label:'Masterclass',      desc:'Teach your audience step-by-step' },
  { id:'news',  emoji:'📰', label:'News Bulletin',    desc:'Village or national news briefing' },
  { id:'music', emoji:'🎵', label:'Live Performance', desc:'Music, poetry, spoken word' },
]

const DURATION_OPTIONS = [
  { value: 1, label: '1 hour', cowrieMultiplier: 1 },
  { value: 2, label: '2 hours', cowrieMultiplier: 1.8 },
  { value: 3, label: '3 hours', cowrieMultiplier: 2.5 },
]

const DEPOSIT_PERCENT = 0.2  // 20% deposit upfront, remainder on air date

type Step = 1 | 2 | 3 | 4 | 5

// ── Step indicator ─────────────────────────────────────────────────────
function StepBar({ step }: { step: Step }) {
  const labels = ['Village','Concept','Slot','Deposit','Review']
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, padding:'0 4px' }}>
      {labels.map((label, i) => {
        const n = (i + 1) as Step
        const done = step > n
        const active = step === n
        return (
          <React.Fragment key={n}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{
                width: 28, height: 28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                background: done ? '#1a7c3e' : active ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.05)',
                border: `2px solid ${done ? '#1a7c3e' : active ? '#4ade80' : 'rgba(255,255,255,.1)'}`,
                fontSize: 10, fontWeight: 900,
                color: done ? '#fff' : active ? '#4ade80' : 'rgba(255,255,255,.25)',
                transition: 'all .25s',
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 7, fontWeight: active ? 700 : 500, color: active ? '#4ade80' : 'rgba(255,255,255,.25)', letterSpacing:'.03em', whiteSpace:'nowrap' }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex:1, height:1, background: done ? '#1a7c3e' : 'rgba(255,255,255,.06)', margin:'0 4px', marginBottom:14, transition:'all .25s' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Village Card ────────────────────────────────────────────────────────
function VillageCard({ id, name, emoji, color, selected, onSelect }: {
  id: string; name: string; emoji: string; color: string; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'12px 14px', borderRadius:14, cursor:'pointer', width:'100%', textAlign:'left',
        background: selected ? `${color}18` : 'rgba(255,255,255,.03)',
        border: `1.5px solid ${selected ? color : 'rgba(255,255,255,.07)'}`,
        transition: 'all .2s',
      }}
    >
      <div style={{
        width:40, height:40, borderRadius:12, flexShrink:0,
        background: `${color}20`, border:`1px solid ${color}30`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
      }}>
        {emoji}
      </div>
      <span style={{ fontSize:13, fontWeight:700, color: selected ? color : '#f0f7f0', fontFamily:'Sora,sans-serif' }}>
        {name}
      </span>
      {selected && <div style={{ marginLeft:'auto', width:18, height:18, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>✓</div>}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════
export default function ApplyToBroadcastPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>(1)

  // Form state
  const [villageId, setVillageId]             = React.useState('')
  const [showTitle, setShowTitle]             = React.useState('')
  const [showDesc, setShowDesc]               = React.useState('')
  const [category, setCategory]               = React.useState<ShowCategory | ''>('')
  const [format, setFormat]                   = React.useState('')
  const [duration, setDuration]               = React.useState(2)
  const [preferredTier, setPreferredTier]     = React.useState<SlotTier | ''>('')
  const [preferredDays, setPreferredDays]     = React.useState<string[]>([])
  const [startDate, setStartDate]             = React.useState('')
  const [hostBio, setHostBio]                 = React.useState('')
  const [sampleLink, setSampleLink]           = React.useState('')
  const [agreeTerms, setAgreeTerms]           = React.useState(false)

  // UI state
  const [submitting, setSubmitting]           = React.useState(false)
  const [submitted, setSubmitted]             = React.useState(false)
  const [appId]                               = React.useState('APP-' + Math.random().toString(36).slice(2,8).toUpperCase())

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Computed
  const village     = villageId ? TV_VILLAGE_META[villageId] : null
  const durMeta     = DURATION_OPTIONS.find(d => d.value === duration)!
  const tierPrice   = preferredTier ? SLOT_PRICES[preferredTier] : 0
  const totalCowrie = Math.round(tierPrice * durMeta.cowrieMultiplier)
  const deposit     = Math.round(totalCowrie * DEPOSIT_PERCENT)
  const remaining   = totalCowrie - deposit

  // Validation per step
  const canProceed: Record<Step, boolean> = {
    1: !!villageId,
    2: !!showTitle.trim() && !!category && !!format,
    3: !!preferredTier && preferredDays.length > 0 && !!startDate,
    4: agreeTerms,
    5: true,
  }

  function toggleDay(id: string) {
    setPreferredDays(days => days.includes(id) ? days.filter(d => d !== id) : [...days, id])
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1800))
    setSubmitting(false)
    setSubmitted(true)
  }

  // ── Success Screen ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight:'100dvh', background:'#060d08', color:'#f0f7f0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
        <div className="ap-bounce" style={{ fontSize:64, marginBottom:16 }}>🎙</div>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontSize:26, fontWeight:900, background:'linear-gradient(135deg,#4ade80,#1a7c3e)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8 }}>
          Application Submitted!
        </h1>
        <p style={{ fontSize:13, color:'rgba(255,255,255,.55)', maxWidth:320, lineHeight:1.6, marginBottom:24 }}>
          Your broadcast application has been received by the <strong style={{ color: village?.color }}>{village?.emoji} {village?.name}</strong> Village elders. You will receive a decision within 3 market days.
        </p>

        {/* App ID */}
        <div style={{ background:'rgba(26,124,62,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:14, padding:'14px 20px', marginBottom:24, width:'100%', maxWidth:320 }}>
          <div style={{ fontSize:10, color:'rgba(74,222,128,.6)', letterSpacing:'.1em', marginBottom:4 }}>APPLICATION ID</div>
          <div style={{ fontFamily:'monospace', fontSize:16, fontWeight:900, color:'#4ade80', letterSpacing:'.08em' }}>{appId}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:4 }}>Save this for your records</div>
        </div>

        {/* Summary pills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:28 }}>
          {[
            { label:'Village', value:`${village?.emoji} ${village?.name}` },
            { label:'Show', value:showTitle },
            { label:'Tier', value: preferredTier ? TIER_META[preferredTier].label : '' },
            { label:'Deposit Paid', value:`🐚 ${deposit.toLocaleString()} Cowrie` },
          ].map(p => (
            <div key={p.label} style={{ padding:'6px 12px', borderRadius:99, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', fontSize:10, color:'rgba(255,255,255,.7)' }}>
              <span style={{ color:'rgba(255,255,255,.35)' }}>{p.label}:</span> {p.value}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:320 }}>
          <button
            onClick={() => router.push('/dashboard/tv/schedule')}
            style={{ padding:'14px 20px', borderRadius:14, border:'none', cursor:'pointer', fontWeight:800, fontSize:13, fontFamily:'Sora,sans-serif', background:'linear-gradient(135deg,#1a7c3e,#0f5028)', color:'#fff' }}
          >
            📺 View TV Schedule
          </button>
          <button
            onClick={() => router.push('/dashboard/calendar')}
            style={{ padding:'14px 20px', borderRadius:14, cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'Sora,sans-serif', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)' }}
          >
            📅 Open My Calendar
          </button>
          <button
            onClick={() => router.push('/dashboard/tv')}
            style={{ padding:'14px 20px', borderRadius:14, cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'Sora,sans-serif', background:'transparent', border:'none', color:'rgba(255,255,255,.3)' }}
          >
            Back to Jollof TV
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100dvh', background:'#060d08', color:'#f0f7f0', fontFamily:'Inter,system-ui,sans-serif', paddingBottom:100 }}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ background:'linear-gradient(180deg,#091608 0%,#060d08 100%)', padding:'20px 16px 16px' }}>
        <button
          onClick={() => step === 1 ? router.back() : setStep(s => (s - 1) as Step)}
          style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.4)', fontSize:20, marginBottom:12, padding:0 }}
        >
          ←
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:'rgba(26,124,62,.2)', border:'1px solid rgba(74,222,128,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
            🎙
          </div>
          <div>
            <h1 style={{ fontFamily:'Sora,sans-serif', fontSize:20, fontWeight:900, color:'#f0f7f0', margin:0 }}>Apply to Broadcast</h1>
            <p style={{ fontSize:11, color:'rgba(74,222,128,.6)', margin:0 }}>Village Airwaves · Cowrie-powered slots</p>
          </div>
        </div>

        <StepBar step={step} />
      </div>

      {/* ── Step Content ───────────────────────────── */}
      <div style={{ padding:'16px 14px' }}>

        {/* STEP 1 — Village Selection */}
        {step === 1 && (
          <div className="ap-fade">
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:16, fontWeight:800, color:'#f0f7f0', marginBottom:4 }}>Choose Your Village Channel</h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>
                Each village runs its own broadcast channel. Your show will air under that village's brand and reach its audience.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {VILLAGE_LIST.map(v => (
                <VillageCard
                  key={v.id} id={v.id} name={v.name} emoji={v.emoji} color={v.color}
                  selected={villageId === v.id} onSelect={() => setVillageId(v.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Show Concept */}
        {step === 2 && (
          <div className="ap-fade">
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:16, fontWeight:800, color:'#f0f7f0', marginBottom:4 }}>
                {village?.emoji} Your Show Concept
              </h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>
                Tell the village elders what your show is about. A clear concept gets faster approval.
              </p>
            </div>

            {/* Show Title */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:6 }}>SHOW TITLE *</label>
              <input
                type="text"
                placeholder="e.g. 'Ọjà Morning Market' or 'Tech in Africa'"
                value={showTitle}
                onChange={e => setShowTitle(e.target.value)}
                maxLength={60}
                style={{ width:'100%', padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#f0f7f0', fontSize:13, outline:'none', boxSizing:'border-box' }}
              />
              <div style={{ fontSize:9, color:'rgba(255,255,255,.25)', textAlign:'right', marginTop:3 }}>{showTitle.length}/60</div>
            </div>

            {/* Description */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:6 }}>SHOW DESCRIPTION *</label>
              <textarea
                placeholder="Describe your show, its audience, and what value it brings to the village…"
                value={showDesc}
                onChange={e => setShowDesc(e.target.value)}
                maxLength={280}
                rows={4}
                style={{ width:'100%', padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#f0f7f0', fontSize:12, outline:'none', resize:'none', lineHeight:1.5, boxSizing:'border-box' }}
              />
              <div style={{ fontSize:9, color:'rgba(255,255,255,.25)', textAlign:'right', marginTop:3 }}>{showDesc.length}/280</div>
            </div>

            {/* Category */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:8 }}>SHOW CATEGORY *</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {SHOW_CATEGORIES.map(cat => {
                  const meta = SHOW_CATEGORY_META[cat]
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding:'8px 12px', borderRadius:99, cursor:'pointer', fontSize:11, fontWeight:700,
                        background: category === cat ? `${meta.color}25` : 'rgba(255,255,255,.04)',
                        border: `1px solid ${category === cat ? meta.color : 'rgba(255,255,255,.08)'}`,
                        color: category === cat ? meta.color : 'rgba(255,255,255,.45)',
                        transition:'all .15s',
                      }}
                    >
                      {meta.emoji} {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Format */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:8 }}>SHOW FORMAT *</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {FORMAT_OPTIONS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'12px 14px', borderRadius:12, cursor:'pointer', textAlign:'left',
                      background: format === f.id ? 'rgba(26,124,62,.15)' : 'rgba(255,255,255,.03)',
                      border: `1px solid ${format === f.id ? '#4ade80' : 'rgba(255,255,255,.07)'}`,
                      transition:'all .15s',
                    }}
                  >
                    <span style={{ fontSize:20 }}>{f.emoji}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color: format === f.id ? '#4ade80' : '#f0f7f0' }}>{f.label}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>{f.desc}</div>
                    </div>
                    {format === f.id && <div style={{ marginLeft:'auto', fontSize:14, color:'#4ade80' }}>✓</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:8 }}>SHOW DURATION</label>
              <div style={{ display:'flex', gap:8 }}>
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    style={{
                      flex:1, padding:'10px 6px', borderRadius:12, cursor:'pointer',
                      background: duration === d.value ? 'rgba(26,124,62,.15)' : 'rgba(255,255,255,.03)',
                      border: `1px solid ${duration === d.value ? '#4ade80' : 'rgba(255,255,255,.08)'}`,
                      color: duration === d.value ? '#4ade80' : 'rgba(255,255,255,.5)',
                      fontSize:11, fontWeight:700, transition:'all .15s',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Host Bio */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:6 }}>HOST BIO (optional)</label>
              <textarea
                placeholder="Tell us about yourself — your expertise, experience, village role…"
                value={hostBio}
                onChange={e => setHostBio(e.target.value)}
                maxLength={200}
                rows={3}
                style={{ width:'100%', padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#f0f7f0', fontSize:12, outline:'none', resize:'none', lineHeight:1.5, boxSizing:'border-box' }}
              />
            </div>

            {/* Sample Link */}
            <div style={{ marginBottom:6 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:6 }}>SAMPLE CONTENT LINK (optional)</label>
              <input
                type="url"
                placeholder="Paste a link to your previous work or demo…"
                value={sampleLink}
                onChange={e => setSampleLink(e.target.value)}
                style={{ width:'100%', padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#f0f7f0', fontSize:12, outline:'none', boxSizing:'border-box' }}
              />
            </div>
          </div>
        )}

        {/* STEP 3 — Time Slot Preference */}
        {step === 3 && (
          <div className="ap-fade">
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:16, fontWeight:800, color:'#f0f7f0', marginBottom:4 }}>Choose Your Air Time</h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>
                Select your preferred daypart and days. The village schedule master will confirm your slot upon approval.
              </p>
            </div>

            {/* Tier Selection */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:10 }}>PREFERRED DAYPART *</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {SLOT_TIERS.map(tier => {
                  const meta = TIER_META[tier]
                  const price = Math.round(SLOT_PRICES[tier] * durMeta.cowrieMultiplier)
                  return (
                    <button
                      key={tier}
                      onClick={() => setPreferredTier(tier)}
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'12px 14px', borderRadius:14, cursor:'pointer', textAlign:'left',
                        background: preferredTier === tier ? `${meta.color}18` : 'rgba(255,255,255,.03)',
                        border: `1.5px solid ${preferredTier === tier ? meta.color : 'rgba(255,255,255,.07)'}`,
                        transition:'all .15s',
                      }}
                    >
                      <div>
                        <div style={{ fontSize:13, fontWeight:800, color: preferredTier === tier ? meta.color : '#f0f7f0', fontFamily:'Sora,sans-serif' }}>
                          {meta.label}
                          {tier === 'PRIME' && <span style={{ marginLeft:6, fontSize:9, padding:'2px 6px', borderRadius:99, background:'#ef4444', color:'#fff', fontWeight:700 }}>PEAK</span>}
                        </div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:2 }}>{meta.desc}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                        <div style={{ fontSize:13, fontWeight:800, color: preferredTier === tier ? meta.color : 'rgba(255,255,255,.4)' }}>
                          🐚 {price.toLocaleString()}
                        </div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,.25)' }}>for {duration}h</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Days Selection */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:10 }}>PREFERRED DAYS * (select all that apply)</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {PREFERRED_DAYS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => toggleDay(d.id)}
                    style={{
                      padding:'10px 14px', borderRadius:10, cursor:'pointer', fontSize:11, fontWeight:700,
                      background: preferredDays.includes(d.id) ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${preferredDays.includes(d.id) ? '#4ade80' : 'rgba(255,255,255,.08)'}`,
                      color: preferredDays.includes(d.id) ? '#4ade80' : 'rgba(255,255,255,.45)',
                      transition:'all .15s',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Date */}
            <div style={{ marginBottom:6 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.06em', display:'block', marginBottom:6 }}>EARLIEST START DATE *</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width:'100%', padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'#f0f7f0', fontSize:13, outline:'none', boxSizing:'border-box' }}
              />
            </div>

            {/* Info note */}
            <div style={{ marginTop:14, padding:'10px 12px', borderRadius:12, background:'rgba(251,191,36,.05)', border:'1px solid rgba(251,191,36,.12)', fontSize:10, color:'rgba(251,191,36,.6)', lineHeight:1.6 }}>
              ⚡ Prime Time slots (17:00–21:00) attract 3–8× more viewers but are the most competitive. If your preferred slot is taken, the schedule master will offer the next best option.
            </div>
          </div>
        )}

        {/* STEP 4 — Cowrie Deposit */}
        {step === 4 && (
          <div className="ap-fade">
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:16, fontWeight:800, color:'#f0f7f0', marginBottom:4 }}>Lock Your Slot with Cowrie</h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>
                A {Math.round(DEPOSIT_PERCENT * 100)}% refundable deposit holds your application. The remainder is released from escrow on your first air date.
              </p>
            </div>

            {/* Price breakdown */}
            <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'.06em', marginBottom:10 }}>COST BREAKDOWN</div>
              {[
                { label:`${TIER_META[preferredTier as SlotTier]?.label ?? '–'} Slot (${duration}h)`, value: totalCowrie },
                { label:'Village broadcast tax (5%)', value: -Math.round(totalCowrie * 0.05), neg: true },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>{row.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: row.neg ? '#ef4444' : 'rgba(255,255,255,.7)' }}>
                    {row.neg ? '-' : ''}🐚 {Math.abs(row.value).toLocaleString()}
                  </span>
                </div>
              ))}
              <div style={{ height:1, background:'rgba(255,255,255,.08)', marginBottom:8 }} />
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#f0f7f0' }}>Total per session</span>
                <span style={{ fontSize:13, fontWeight:900, color:'#4ade80' }}>🐚 {Math.round(totalCowrie * 0.95).toLocaleString()}</span>
              </div>

              {/* Deposit highlight */}
              <div style={{ background:'rgba(26,124,62,.12)', border:'1px solid rgba(74,222,128,.2)', borderRadius:12, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#4ade80' }}>Deposit Now (20%)</span>
                  <span style={{ fontSize:18, fontWeight:900, color:'#4ade80', fontFamily:'Sora,sans-serif' }}>🐚 {deposit.toLocaleString()}</span>
                </div>
                <div style={{ fontSize:10, color:'rgba(74,222,128,.5)' }}>Held in escrow · Returned if declined</div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>Remaining (due on air date)</span>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.35)' }}>🐚 {remaining.toLocaleString()}</span>
              </div>
            </div>

            {/* Cowrie balance mock */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:12, background:'rgba(251,191,36,.06)', border:'1px solid rgba(251,191,36,.1)', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:10, color:'rgba(251,191,36,.5)', letterSpacing:'.06em' }}>YOUR COWRIE BALANCE</div>
                <div style={{ fontSize:16, fontWeight:900, color:'#fbbf24' }}>🐚 12,450</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:10, color: deposit <= 12450 ? '#4ade80' : '#ef4444' }}>
                  {deposit <= 12450 ? '✓ Sufficient' : '✗ Insufficient'}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.25)' }}>After: 🐚 {(12450 - deposit).toLocaleString()}</div>
              </div>
            </div>

            {/* Terms */}
            <button
              onClick={() => setAgreeTerms(!agreeTerms)}
              style={{
                display:'flex', alignItems:'flex-start', gap:10, width:'100%',
                padding:'12px 14px', borderRadius:12, cursor:'pointer', textAlign:'left',
                background: agreeTerms ? 'rgba(74,222,128,.07)' : 'rgba(255,255,255,.03)',
                border: `1px solid ${agreeTerms ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.08)'}`,
                transition:'all .15s',
              }}
            >
              <div style={{
                width:20, height:20, borderRadius:6, flexShrink:0,
                background: agreeTerms ? '#1a7c3e' : 'rgba(255,255,255,.08)',
                border: `2px solid ${agreeTerms ? '#4ade80' : 'rgba(255,255,255,.15)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, color:'#fff', marginTop:1, transition:'all .2s',
              }}>
                {agreeTerms ? '✓' : ''}
              </div>
              <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', lineHeight:1.5 }}>
                I agree to the Village Airwaves Broadcast Terms. I understand this deposit is held in escrow and returned if my application is declined. Content must uphold village values and Pan-African sovereignty.
              </span>
            </button>
          </div>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <div className="ap-fade">
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:16, fontWeight:800, color:'#f0f7f0', marginBottom:4 }}>Review Your Application</h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>
                Once submitted, the village elders will review your application within 3 market days.
              </p>
            </div>

            {/* Village */}
            <ReviewSection title="Village Channel">
              {village && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${village.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{village.emoji}</div>
                  <span style={{ fontSize:13, fontWeight:700, color:`${village.color}` }}>{village.name} Village</span>
                </div>
              )}
            </ReviewSection>

            {/* Concept */}
            <ReviewSection title="Show Concept">
              <div style={{ fontSize:14, fontWeight:800, color:'#f0f7f0', marginBottom:4, fontFamily:'Sora,sans-serif' }}>{showTitle}</div>
              {showDesc && <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', lineHeight:1.5, marginBottom:8 }}>{showDesc}</div>}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {category && <Pill label={SHOW_CATEGORY_META[category].emoji + ' ' + SHOW_CATEGORY_META[category].label} color='#1a7c3e' />}
                {format && <Pill label={FORMAT_OPTIONS.find(f=>f.id===format)?.label ?? format} color='#0891b2' />}
                <Pill label={`${duration}h show`} color='#6b7280' />
              </div>
            </ReviewSection>

            {/* Time Slot */}
            <ReviewSection title="Time Slot Preference">
              {preferredTier && (
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color: TIER_META[preferredTier].color, marginBottom:4 }}>
                    {TIER_META[preferredTier].label} · {TIER_META[preferredTier].desc}
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:4 }}>
                    {preferredDays.map(d => <Pill key={d} label={PREFERRED_DAYS.find(pd=>pd.id===d)?.label ?? d} color='#fbbf24' />)}
                  </div>
                  {startDate && <div style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>Starting from {new Date(startDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</div>}
                </div>
              )}
            </ReviewSection>

            {/* Deposit */}
            <ReviewSection title="Cowrie Deposit">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,.5)' }}>Deposit (20%) from escrow</span>
                <span style={{ fontSize:16, fontWeight:900, color:'#4ade80' }}>🐚 {deposit.toLocaleString()}</span>
              </div>
            </ReviewSection>
          </div>
        )}

      </div>

      {/* ── Bottom CTA ─────────────────────────────── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, padding:'12px 14px 24px', background:'linear-gradient(180deg,transparent 0%,#060d08 40%)', maxWidth:480, margin:'0 auto' }}>
        {step < 5 ? (
          <button
            onClick={() => canProceed[step] && setStep(s => (s + 1) as Step)}
            disabled={!canProceed[step]}
            style={{
              width:'100%', padding:'15px', borderRadius:14, border:'none', cursor: canProceed[step] ? 'pointer' : 'not-allowed',
              background: canProceed[step] ? 'linear-gradient(135deg,#1a7c3e,#0f5028)' : 'rgba(255,255,255,.06)',
              color: canProceed[step] ? '#fff' : 'rgba(255,255,255,.25)',
              fontSize:14, fontWeight:800, fontFamily:'Sora,sans-serif', transition:'all .2s',
              boxShadow: canProceed[step] ? '0 4px 20px rgba(26,124,62,.3)' : 'none',
            }}
          >
            {step === 4 ? `Lock Deposit · 🐚 ${deposit.toLocaleString()} Cowrie` : 'Continue →'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={submitting ? '' : 'ap-pulse'}
            style={{
              width:'100%', padding:'15px', borderRadius:14, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#1a7c3e,#0f5028)',
              color:'#fff', fontSize:14, fontWeight:800, fontFamily:'Sora,sans-serif',
              boxShadow:'0 4px 24px rgba(26,124,62,.4)',
            }}
          >
            {submitting ? '⏳ Submitting to Village Elders…' : '🎙 Submit Application'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Small helper components ───────────────────────────────────────────
function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:12, padding:'12px 14px', borderRadius:14, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)' }}>
      <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,.25)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>{title}</div>
      {children}
    </div>
  )
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ padding:'4px 10px', borderRadius:99, fontSize:10, fontWeight:700, background:`${color}20`, color: color, border:`1px solid ${color}30` }}>
      {label}
    </span>
  )
}
