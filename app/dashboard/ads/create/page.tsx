'use client'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type AdType = 'market_cry' | 'drum_announcement' | 'billboard' | 'night_market' | 'heat_boost' | 'tv_commercial' | 'griot_story' | 'tool_sponsor'

const AD_TYPES: { key: AdType; emoji: string; label: string; desc: string; price: string; color: string }[] = [
  { key: 'market_cry',        emoji: '🥁', label: 'Market Cry',        desc: 'Appear in the village feed like a real post. Users can Kila, Stir, and interact.', price: '₡200/day or ₡50/1K views', color: '#d4a017' },
  { key: 'drum_announcement', emoji: '📢', label: 'Drum Announcement', desc: 'One-time broadcast to an entire village. Like the traditional town crier.', price: '₡1,000 flat', color: '#ef4444' },
  { key: 'billboard',         emoji: '🏗', label: 'Village Billboard',  desc: 'Top banner in a village for 1 week. Highest bidder wins the auction.', price: 'Auction (min ₡5,000)', color: '#8b5cf6' },
  { key: 'night_market',      emoji: '🏮', label: 'Night Market Slot',  desc: 'Featured during Night Market hours (6pm-midnight). Lantern glow.', price: '₡300/night', color: '#f59e0b' },
  { key: 'heat_boost',        emoji: '🔥', label: 'Heat Boost',         desc: 'Boost your own post heat score by +30 for 24 hours.', price: '₡500-₡5,000', color: '#f97316' },
  { key: 'tv_commercial',     emoji: '📺', label: 'TV Commercial',      desc: 'Play during Jollof TV commercial breaks. Streamer + viewer earn cowrie.', price: '₡100/break', color: '#06b6d4' },
  { key: 'griot_story',       emoji: '🎙', label: 'Griot Story Ad',     desc: 'The village AI Griot weaves your product into a cultural narrative.', price: '₡2,000/week', color: '#10b981' },
  { key: 'tool_sponsor',      emoji: '🛠', label: 'Tool Sponsorship',   desc: 'Your brand appears when users open a sponsored tool.', price: '₡10,000/month', color: '#6366f1' },
]

const VILLAGES = ['health','agriculture','education','justice','finance','builders','technology','arts','media','commerce','security','spirituality','fashion','family','transport','energy','hospitality','government','sports','holdings']

const CTA_OPTIONS = ['🫙 Add to Pot', '🌳 Plant Your Root', 'Explore →', 'Learn More', '🥁 Drum Now', '🔥 Join the Fire']

function CreateCampaignContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preType = searchParams.get('type') as AdType | null

  const [step, setStep] = React.useState(preType ? 2 : 1)
  const [adType, setAdType] = React.useState<AdType>(preType ?? 'market_cry')
  const [headline, setHeadline] = React.useState('')
  const [body, setBody] = React.useState('')
  const [cta, setCta] = React.useState(CTA_OPTIONS[0])
  const [selectedVillages, setSelectedVillages] = React.useState<string[]>([])
  const [skinTarget, setSkinTarget] = React.useState<'all' | 'ise' | 'egbe' | 'idile'>('all')
  const [geoScope, setGeoScope] = React.useState<'village' | 'state' | 'country' | 'continent' | 'global'>('village')
  const [crestMin, setCrestMin] = React.useState(0)
  const [budget, setBudget] = React.useState(1000)
  const [pricingModel, setPricingModel] = React.useState<'per_day' | 'per_1k_views' | 'flat'>('per_day')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [launched, setLaunched] = React.useState(false)

  const typeCfg = AD_TYPES.find(t => t.key === adType)!
  const estimatedReach = pricingModel === 'per_day' ? budget * 2.5 : pricingModel === 'per_1k_views' ? (budget / 50) * 1000 : budget * 18

  const toggleVillage = (v: string) => setSelectedVillages(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const STEPS = ['Type', 'Content', 'Target', 'Budget', 'Launch']

  if (launched) {
    return (
      <div style={{ minHeight: '100dvh', background: '#07090a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ fontSize: 72, marginBottom: 20, animation: 'pulse 1s ease-in-out infinite' }}>🥁</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg,#d4a017,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', marginBottom: 8 }}>Drum Campaign Launched!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textAlign: 'center', maxWidth: 320, marginBottom: 8 }}>Your {typeCfg.label} is now being heard across {selectedVillages.length || 20} villages</div>
        <div style={{ fontSize: 11, color: 'rgba(212,160,23,.6)', marginBottom: 32 }}>Estimated reach: {Math.round(estimatedReach).toLocaleString()} ears</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/dashboard/ads')} style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(212,160,23,.15)', border: '1px solid rgba(212,160,23,.4)', color: '#fbbf24', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>📊 View Campaigns</button>
          <button onClick={() => { setLaunched(false); setStep(1) }} style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Create Another</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#07090a', color: '#f0f5ee', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: .02, backgroundImage: 'repeating-linear-gradient(45deg,#d4a017 0px,#d4a017 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 100px' }}>
        {/* Back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/dashboard/ads')} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#f0f5ee' }}>Create Drum Campaign</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Step {step} of 5 — {STEPS[step - 1]}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: 4, borderRadius: 99, background: i + 1 <= step ? 'linear-gradient(90deg,#d4a017,#fbbf24)' : 'rgba(255,255,255,.08)', transition: 'all .3s' }} />
              <div style={{ fontSize: 8, fontWeight: 700, color: i + 1 <= step ? '#fbbf24' : 'rgba(255,255,255,.2)' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>What type of Market Cry do you want?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {AD_TYPES.map(t => (
                <div key={t.key} onClick={() => { setAdType(t.key); setStep(2) }} style={{ background: adType === t.key ? `${t.color}15` : 'rgba(255,255,255,.04)', border: `1px solid ${adType === t.key ? `${t.color}50` : 'rgba(255,255,255,.08)'}`, borderRadius: 14, padding: '14px 12px', cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{t.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: t.color, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', lineHeight: 1.4, marginBottom: 6 }}>{t.desc}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.5)', background: 'rgba(255,255,255,.06)', borderRadius: 6, padding: '3px 7px', display: 'inline-block' }}>{t.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>Craft your message</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Headline (max 60 chars)</div>
                <input value={headline} onChange={e => setHeadline(e.target.value.slice(0, 60))} placeholder="Premium Palm Oil — Direct from Lagos" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f5ee', fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', textAlign: 'right', marginTop: 4 }}>{headline.length}/60</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Body (max 280 chars)</div>
                <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 280))} placeholder="Fresh from the farm to your pot. Our 5L cold-pressed palm oil is trusted by 200+ families across Lagos. Taste the difference." rows={4} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f5ee', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box' }} />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', textAlign: 'right', marginTop: 4 }}>{body.length}/280</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Call to Action</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CTA_OPTIONS.map(c => (
                    <div key={c} onClick={() => setCta(c)} style={{ padding: '7px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: cta === c ? 'rgba(212,160,23,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${cta === c ? 'rgba(212,160,23,.4)' : 'rgba(255,255,255,.08)'}`, color: cta === c ? '#fbbf24' : 'rgba(255,255,255,.4)', transition: 'all .2s' }}>{c}</div>
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Preview</div>
                <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,160,23,.2)', borderRadius: 16, padding: '14px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: `linear-gradient(90deg, ${typeCfg.color}, ${typeCfg.color}66)` }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 8, fontWeight: 800, background: `${typeCfg.color}20`, color: typeCfg.color }}>{typeCfg.emoji} MARKET CRY</span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,.25)' }}>Sponsored</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f5ee', marginBottom: 6, fontFamily: 'Sora, sans-serif' }}>{headline || 'Your headline here...'}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, marginBottom: 10 }}>{body || 'Your message body will appear here...'}</div>
                  <button onClick={() => setStep(s => Math.min(s + 1, 4))} style={{ padding: '8px 16px', borderRadius: 10, background: `linear-gradient(135deg, ${typeCfg.color}, ${typeCfg.color}aa)`, border: 'none', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>{cta}</button>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 16 }}>Next → Targeting</button>
          </div>
        )}

        {/* Step 3: Targeting */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>Who should hear your drum?</div>
            {/* Villages */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase' }}>Target Villages ({selectedVillages.length || 'All 20'})</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {VILLAGES.map(v => (
                  <div key={v} onClick={() => toggleVillage(v)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: selectedVillages.includes(v) ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${selectedVillages.includes(v) ? 'rgba(74,222,128,.4)' : 'rgba(255,255,255,.07)'}`, color: selectedVillages.includes(v) ? '#4ade80' : 'rgba(255,255,255,.35)', transition: 'all .15s', textTransform: 'capitalize' }}>{v}</div>
                ))}
              </div>
            </div>
            {/* Skin */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase' }}>Skin Context</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([['all','🌐 All Skins'],['ise','⚒ ISE · Work'],['egbe','⭕ EGBE · Social'],['idile','🌳 IDILE · Clan']] as [typeof skinTarget, string][]).map(([k, l]) => (
                  <div key={k} onClick={() => setSkinTarget(k)} style={{ flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: skinTarget === k ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${skinTarget === k ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.07)'}`, color: skinTarget === k ? '#fbbf24' : 'rgba(255,255,255,.35)', transition: 'all .2s' }}>{l}</div>
                ))}
              </div>
            </div>
            {/* Geo scope */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase' }}>Geographic Scope</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {([['village','🏘 Village'],['state','🏙 State'],['country','🌍 Country'],['continent','🌐 Africa'],['global','⭐ Global']] as [typeof geoScope, string][]).map(([k, l]) => (
                  <div key={k} onClick={() => setGeoScope(k)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: geoScope === k ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${geoScope === k ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.07)'}`, color: geoScope === k ? '#fbbf24' : 'rgba(255,255,255,.3)', transition: 'all .2s' }}>{l}</div>
                ))}
              </div>
            </div>
            {/* Crest minimum */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase' }}>Minimum Audience Crest</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([[0,'All'],[2,'Crest II+'],[4,'Crest IV+ (Elder\'s Choice)']] as [number, string][]).map(([k, l]) => (
                  <div key={k} onClick={() => setCrestMin(k)} style={{ flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: crestMin === k ? (k >= 4 ? 'rgba(212,160,23,.15)' : 'rgba(74,222,128,.1)') : 'rgba(255,255,255,.04)', border: `1px solid ${crestMin === k ? (k >= 4 ? 'rgba(212,160,23,.4)' : 'rgba(74,222,128,.3)') : 'rgba(255,255,255,.07)'}`, color: crestMin === k ? (k >= 4 ? '#fbbf24' : '#4ade80') : 'rgba(255,255,255,.35)', transition: 'all .2s' }}>{l}</div>
                ))}
              </div>
              {crestMin >= 4 && <div style={{ fontSize: 9, color: '#d4a017', marginTop: 6, fontStyle: 'italic' }}>👑 Elder&apos;s Choice ads get a gold border and higher trust signals</div>}
            </div>
            <button onClick={() => setStep(4)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, color: '#fff' }}>Next → Budget &amp; Schedule</button>
          </div>
        )}

        {/* Step 4: Budget & Schedule */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>Set your Cowrie Purse</div>
            {/* Budget */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase' }}>Budget (Cowrie ₡)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fbbf24', fontSize: 20, fontWeight: 900, fontFamily: 'DM Mono, monospace', outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', minWidth: 60 }}>₡ Cowrie</div>
              </div>
              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[500, 1000, 2500, 5000, 10000].map(a => (
                  <div key={a} onClick={() => setBudget(a)} style={{ flex: 1, padding: '6px', borderRadius: 8, textAlign: 'center', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: budget === a ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${budget === a ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.07)'}`, color: budget === a ? '#fbbf24' : 'rgba(255,255,255,.3)' }}>₡{a >= 1000 ? `${a / 1000}K` : a}</div>
                ))}
              </div>
            </div>
            {/* Pricing model */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase' }}>Pricing Model</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([['per_day','₡/Day','Pay daily'],['per_1k_views','₡/1K Views','Pay per reach'],['flat','Flat Rate','One-time']] as [typeof pricingModel, string, string][]).map(([k, l, d]) => (
                  <div key={k} onClick={() => setPricingModel(k)} style={{ flex: 1, padding: '10px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: pricingModel === k ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${pricingModel === k ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.07)'}`, transition: 'all .2s' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: pricingModel === k ? '#fbbf24' : 'rgba(255,255,255,.5)' }}>{l}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Date range */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Start Date</div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f5ee', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>End Date</div>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f5ee', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>
            {/* Estimated reach */}
            <div style={{ background: 'linear-gradient(135deg,rgba(74,222,128,.06),rgba(26,124,62,.04))', border: '1px solid rgba(74,222,128,.2)', borderRadius: 14, padding: '14px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,.6)', textTransform: 'uppercase', marginBottom: 4 }}>Estimated Reach</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>{Math.round(estimatedReach).toLocaleString()} ears</div>
              <div style={{ fontSize: 9, color: 'rgba(74,222,128,.4)', marginTop: 2 }}>Based on ₡{budget.toLocaleString()} budget · {pricingModel.replace(/_/g, ' ')}</div>
            </div>
            <button onClick={() => setStep(5)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, color: '#fff' }}>Next → Review &amp; Launch</button>
          </div>
        )}

        {/* Step 5: Review & Launch */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>Review your Drum Campaign</div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Type */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>TYPE</div>
                <div style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, background: `${typeCfg.color}20`, color: typeCfg.color }}>{typeCfg.emoji} {typeCfg.label}</div>
              </div>
              {/* Content */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>CONTENT</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f5ee' }}>{headline || '(No headline)'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{body || '(No body)'}</div>
                <div style={{ fontSize: 10, color: typeCfg.color, fontWeight: 700, marginTop: 4 }}>CTA: {cta}</div>
              </div>
              {/* Targeting */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>TARGETING</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: 'rgba(74,222,128,.1)', color: '#4ade80' }}>🌍 {geoScope}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: 'rgba(212,160,23,.1)', color: '#fbbf24' }}>Skin: {skinTarget}</span>
                  {crestMin > 0 && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: 'rgba(212,160,23,.15)', color: '#d4a017' }}>Crest {crestMin}+</span>}
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)' }}>{selectedVillages.length || 20} villages</span>
                </div>
              </div>
              {/* Budget */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>COWRIE PURSE</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24', fontFamily: 'DM Mono, monospace' }}>₡{budget.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,.5)' }}>EST. REACH</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora, sans-serif' }}>{Math.round(estimatedReach).toLocaleString()}</div>
                </div>
              </div>
              {/* Schedule */}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                📅 {startDate || 'Start immediately'} → {endDate || 'Until budget spent'} · {pricingModel.replace(/_/g, ' ')}
              </div>
            </div>

            <button onClick={() => setLaunched(true)} style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,#d4a017,#b8860b)', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 900, color: '#000', fontFamily: 'Sora, sans-serif', marginTop: 16, boxShadow: '0 4px 20px rgba(212,160,23,.4)' }}>🥁 Launch Drum Campaign</button>

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,.25)' }}>Cowries will be deducted from your wallet upon launch</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreateCampaignPage() {
  return (
    <React.Suspense fallback={<div style={{ minHeight: '100dvh', background: '#07090a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)', fontFamily: 'DM Sans, sans-serif' }}>Loading...</div>}>
      <CreateCampaignContent />
    </React.Suspense>
  )
}
