'use client'
// ═══════════════════════════════════════════════════════════════════
// AD MARKETPLACE — Community-Powered Advertising · Jollof TV
// People proclaim to the village. The village speaks back.
// Pan-African naming — represents the entire continent
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { jollofTvApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const CSS_ID = 'ad-market-css'
const CSS = `
@keyframes adFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes adSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes adBarFill{from{width:0}to{width:var(--w)}}
@keyframes adVoicePulse{0%,100%{opacity:.6;transform:scale(.9)}50%{opacity:1;transform:scale(1.05)}}
@keyframes adLiveDot{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
.ad-fade{animation:adFade .3s ease both}
.ad-sheet-up{animation:adSheetUp .35s cubic-bezier(.4,0,.2,1) both}
.ad-bar-fill{animation:adBarFill .8s cubic-bezier(.4,0,.2,1) both}
.ad-voice-pulse{animation:adVoicePulse .9s ease-in-out infinite}
.ad-live-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;animation:adLiveDot .7s ease-in-out infinite;display:inline-block}
`

/* ── Ad type labels (Pan-African / English) ── */
const AD_TYPE_NAMES: Record<string, string> = {
  PRE_ROLL:           'Opening Broadcast',
  MID_ROLL:           'Mid-Stream Spot',
  BANNER_OVERLAY:     'Banner Overlay',
  SPONSORED_PROGRAM:  'Sponsored Program',
  SCROLLING_TEXT:     'Scrolling Text',
}
const AD_TYPE_COLORS: Record<string, string> = {
  PRE_ROLL:'#ef4444', MID_ROLL:'#f97316', BANNER_OVERLAY:'#fbbf24', SPONSORED_PROGRAM:'#7c3aed', SCROLLING_TEXT:'#22d3ee',
}
const AD_TYPES = Object.keys(AD_TYPE_NAMES)

const CHANNELS_MAP: Record<string, string> = {
  MAIN_TV:'📺 Main TV', REALITY_TV:'🎭 Reality TV', VILLAGE_TV_RADIO:'📻 Village Radio',
}

const MOCK_CAMPAIGNS = [
  { id:'camp1', title:'Harvest Season Sale · Continental Promo', budgetCowrie:50000, spentCowrie:18750, startDate:'2026-01-01', endDate:'2026-03-31', isActive:true, ads:[
    { id:'ad1', adType:'PRE_ROLL', mediaUrl:'https://example.com/harvest.mp4', text:null },
    { id:'ad2', adType:'SCROLLING_TEXT', mediaUrl:null, text:'HARVEST SEASON — 30% off all farm supplies at GreenField Markets!' },
  ]},
  { id:'camp2', title:'Tech Bootcamp · Digital Skills Africa', budgetCowrie:25000, spentCowrie:25000, startDate:'2026-02-01', endDate:'2026-02-28', isActive:false, ads:[
    { id:'ad3', adType:'BANNER_OVERLAY', mediaUrl:'https://example.com/bootcamp.jpg', text:null },
  ]},
]

const MOCK_SLOTS = [
  { id:'sl1', channelId:'MAIN_TV',          startTime:'07:00', endTime:'07:05', basePrice:5000,  isBooked:false },
  { id:'sl2', channelId:'MAIN_TV',          startTime:'12:00', endTime:'12:05', basePrice:8000,  isBooked:true  },
  { id:'sl3', channelId:'MAIN_TV',          startTime:'20:00', endTime:'20:05', basePrice:15000, isBooked:false },
  { id:'sl4', channelId:'REALITY_TV',       startTime:'21:00', endTime:'21:05', basePrice:20000, isBooked:false },
  { id:'sl5', channelId:'VILLAGE_TV_RADIO', startTime:'19:00', endTime:'19:05', basePrice:4000,  isBooked:false },
]

const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const WEEK_VIEWS = [1200, 2100, 1800, 3400, 2900, 4100, 3700]

/* ── Community Voice Responses (unique feature) ── */
const MOCK_VOICES = [
  { id:'v1', avatar:'🌾', name:'Kofi Mensah', village:'🌾 Agriculture', role:'Farm Elder', message:'I tried their fertilizer last year, it doubled my yield! The whole compound benefited.', tier:'free', time:'2h ago', verified:true },
  { id:'v2', avatar:'👑', name:'Mama Adaeze', village:'🏛 Government', role:'Village Elder', message:'As a Village Elder, I endorse this product for our agriculture community. Let us support it.', tier:'paid', time:'3h ago', verified:true },
  { id:'v3', avatar:'🧺', name:'Musa Toure', village:'🧺 Commerce', role:'Merchant', message:'Price is fair. I\'ve been buying from them for 3 seasons now. Reliable market partner.', tier:'paid', time:'4h ago', verified:false },
  { id:'v4', avatar:'⚕', name:'Dr. Ngozi Obi', village:'⚕ Health', role:'Healer', message:'Health village recommends the organic range only. Conventional chemicals concern our community.', tier:'paid', time:'5h ago', verified:true },
  { id:'v5', avatar:'🎓', name:'Ayo Banda', village:'🎓 Education', role:'Student', message:'Learning about sustainable farming through this brand — great for student projects too.', tier:'free', time:'6h ago', verified:false },
  { id:'v6', avatar:'🏛', name:'Elder Council', village:'🏛 Village Council', role:'Representative', message:'Our village council has reviewed this merchant — trustworthy, pays fair Cowrie rates.', tier:'paid', time:'7h ago', verified:true },
]

/* ── Shared styles ── */
const S = {
  page:{ minHeight:'100vh', background:'#07090a', backgroundImage:'radial-gradient(circle,rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize:'24px 24px', fontFamily:'DM Sans, sans-serif', paddingBottom:100 } as React.CSSProperties,
  header:{ display:'flex', alignItems:'center', gap:12, padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'rgba(13,16,8,.9)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:100 } as React.CSSProperties,
  card:{ background:'#0d1008', border:'1px solid rgba(255,255,255,.07)', borderRadius:16 } as React.CSSProperties,
  overlay:{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:200, backdropFilter:'blur(4px)' } as React.CSSProperties,
  sheet:{ position:'fixed', bottom:0, left:0, right:0, background:'#0d1008', borderRadius:'20px 20px 0 0', border:'1px solid rgba(255,255,255,.1)', zIndex:201, padding:'20px 20px 48px', maxHeight:'92vh', overflowY:'auto' } as React.CSSProperties,
  input:{ width:'100%', padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.85)', fontSize:14, outline:'none', boxSizing:'border-box' as const, fontFamily:'DM Sans, sans-serif' },
  pill:(active:boolean,c='#fbbf24'):React.CSSProperties=>({ padding:'6px 16px', borderRadius:20, background:active?`${c}22`:'rgba(255,255,255,.05)', border:`1px solid ${active?c+'50':'rgba(255,255,255,.1)'}`, color:active?c:'rgba(255,255,255,.5)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:'DM Sans, sans-serif' }),
}

export default function OjaIkedePage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const userId = user?.id ?? ''

  const [tab, setTab] = React.useState<'campaigns'|'slots'|'analytics'|'tagba'>('campaigns')
  const [campaigns, setCampaigns] = React.useState(USE_MOCKS ? MOCK_CAMPAIGNS : [])
  const [slots, setSlots] = React.useState(USE_MOCKS ? MOCK_SLOTS : [])
  const [slotChannel, setSlotChannel] = React.useState('MAIN_TV')
  const [selectedCampaign, setSelectedCampaign] = React.useState<any>(null)
  const [showCreate, setShowCreate] = React.useState(false)
  const [bookingSlot, setBookingSlot] = React.useState<any>(null)
  const [bookingAdId, setBookingAdId] = React.useState('')
  const [bookingCampaignId, setBookingCampaignId] = React.useState('')
  const [bookingSuccess, setBookingSuccess] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [showVoiceSheet, setShowVoiceSheet] = React.useState(false)
  const [voiceText, setVoiceText] = React.useState('')
  const [voiceRole, setVoiceRole] = React.useState('Community Member')
  const [voiceSent, setVoiceSent] = React.useState(false)
  const [voiceCampaign, setVoiceCampaign] = React.useState('')
  const [voices, setVoices] = React.useState(USE_MOCKS ? MOCK_VOICES : [])
  const [likedVoices, setLikedVoices] = React.useState<Set<string>>(new Set())
  const [form, setForm] = React.useState({ title:'', budgetCowrie:'', startDate:'', endDate:'', adType:'PRE_ROLL', mediaUrl:'', text:'' })

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    jollofTvApi.adCampaigns({ creatorId: userId }).then(r => { if (r?.campaigns?.length) setCampaigns(r.campaigns) }).catch((e) => logApiFailure('ads/campaigns', e))
  }, [userId])

  React.useEffect(() => {
    jollofTvApi.channelAdSlots(slotChannel).then(r => { if (r?.slots?.length) setSlots(r.slots) }).catch((e) => logApiFailure('ads/slots', e))
  }, [slotChannel])

  const totalSpent = campaigns.reduce((a, c) => a + c.spentCowrie, 0)
  const activeCampaigns = campaigns.filter(c => c.isActive).length
  const totalBookings = slots.filter(s => s.isBooked).length
  const mockImpressions = campaigns.reduce((a, c) => a + Math.floor(c.spentCowrie * 2.4), 0)

  async function handleBookSlot() {
    if (!bookingSlot || !bookingAdId) return
    setLoading(true)
    try { await jollofTvApi.bookAd({ adId: bookingAdId, slotId: bookingSlot.id, costPaid: bookingSlot.basePrice, bookedBy: userId }) } catch (e) { logApiFailure('ads/book', e) }
    setSlots(prev => prev.map(s => s.id === bookingSlot.id ? { ...s, isBooked: true } : s))
    setBookingSuccess(true); setLoading(false)
    setTimeout(() => { setBookingSlot(null); setBookingSuccess(false); setBookingAdId(''); setBookingCampaignId('') }, 1800)
  }

  function handleCreate() {
    if (!form.title || !form.budgetCowrie) return
    const nc: typeof MOCK_CAMPAIGNS[number] = { id:`camp_${Date.now()}`, title:form.title, budgetCowrie:parseInt(form.budgetCowrie)||0, spentCowrie:0, startDate:form.startDate, endDate:form.endDate, isActive:true, ads:[{ id:`ad_${Date.now()}`, adType:form.adType, mediaUrl:form.mediaUrl||null as any, text:form.text||null as any }] }
    setCampaigns(prev => [nc, ...prev]); setShowCreate(false)
    setForm({ title:'', budgetCowrie:'', startDate:'', endDate:'', adType:'PRE_ROLL', mediaUrl:'', text:'' })
  }

  function sendVoice() {
    if (!voiceText.trim()) return
    const nv = { id:`v${Date.now()}`, avatar:'👤', name:'You', village:'🌍 Your Village', role:voiceRole, message:voiceText, tier:'paid', time:'just now', verified:false }
    setVoices(prev => [nv, ...prev]); setVoiceSent(true)
    setTimeout(() => { setShowVoiceSheet(false); setVoiceSent(false); setVoiceText('') }, 1800)
  }

  const ROLES_LIST = ['Community Member','Merchant','Village Elder','Healer','Student','Farmer','Representative']

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={() => router.back()} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,.7)', fontSize:16, flexShrink:0 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:'Sora, sans-serif', background:'linear-gradient(90deg,#fbbf24,#f97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>📢 Ad Marketplace</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:1 }}>Broadcast Your Message to the Village Square</div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding:'8px 16px', borderRadius:20, background:'linear-gradient(135deg,#fbbf24,#f97316)', border:'none', color:'#07090a', fontWeight:700, fontSize:12, cursor:'pointer' }}>+ Create</button>
      </div>

      {/* Stats */}
      <div style={{ padding:'16px 16px 8px', display:'flex', gap:10, overflowX:'auto', scrollbarWidth:'none' }}>
        {[
          { label:'Active Campaigns', value:activeCampaigns, color:'#4ade80' },
          { label:'Total Spent', value:`₡${totalSpent.toLocaleString()}`, color:'#fbbf24' },
          { label:'Impressions', value:mockImpressions.toLocaleString(), color:'#c084fc' },
          { label:'Slots Booked', value:totalBookings, color:'#22d3ee' },
        ].map(st => (
          <div key={st.label} className="oja-fade" style={{ ...S.card, padding:'12px 16px', minWidth:130, flexShrink:0 }}>
            <div style={{ fontSize:20, fontWeight:800, fontFamily:'Sora, sans-serif', color:st.color }}>{st.value}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ padding:'8px 16px 4px', display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none' }}>
        {(['campaigns','slots','analytics','tagba'] as const).map(t => (
          <button key={t} style={S.pill(tab===t, t==='tagba'?'#f97316':'#fbbf24')} onClick={() => setTab(t)}>
            {t==='campaigns'?'CAMPAIGNS':t==='slots'?'BOOK SLOTS':t==='analytics'?'INSIGHTS':'🗣 COMMUNITY VOICE'}
          </button>
        ))}
      </div>

      {/* ── ẸBỌ MO ── */}
      {tab==='campaigns' && (
        <div style={{ padding:'12px 16px' }} className="oja-fade">
          {campaigns.length === 0 ? (
            <div style={{ ...S.card, padding:'40px 20px', textAlign:'center', marginTop:20 }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🗣</div>
              <div style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>No campaigns yet.<br/>Create your first broadcast today!</div>
            </div>
          ) : campaigns.map(camp => {
            const pct = Math.round((camp.spentCowrie / camp.budgetCowrie) * 100)
            const isSel = selectedCampaign?.id === camp.id
            return (
              <div key={camp.id} style={{ marginBottom:12 }}>
                <div style={{ ...S.card, padding:16, cursor:'pointer', border:`1px solid ${isSel?'rgba(251,191,36,.3)':'rgba(255,255,255,.07)'}` }} onClick={() => setSelectedCampaign(isSel?null:camp)}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontFamily:'Sora, sans-serif', fontSize:14, color:'rgba(255,255,255,.9)' }}>{camp.title}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:3 }}>{camp.startDate} → {camp.endDate}</div>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:camp.isActive?'rgba(74,222,128,.15)':'rgba(255,255,255,.06)', color:camp.isActive?'#4ade80':'rgba(255,255,255,.35)', border:`1px solid ${camp.isActive?'rgba(74,222,128,.3)':'rgba(255,255,255,.1)'}` }}>
                        {camp.isActive?'ACTIVE':'ENDED'}
                      </span>
                      <span style={{ color:'rgba(255,255,255,.3)', fontSize:12 }}>{isSel?'▲':'▼'}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:5 }}>
                      <span style={{ color:'rgba(255,255,255,.5)' }}>₡{camp.spentCowrie.toLocaleString()} spent</span>
                      <span style={{ color:'rgba(255,255,255,.5)' }}>of ₡{camp.budgetCowrie.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div style={{ height:6, background:'rgba(255,255,255,.07)', borderRadius:4 }}>
                      <div className="oja-bar-fill" style={{ height:'100%', borderRadius:4, background:pct>=100?'#ef4444':'linear-gradient(90deg,#fbbf24,#f97316)', '--w':`${Math.min(pct,100)}%`, width:`${Math.min(pct,100)}%` } as React.CSSProperties} />
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>{camp.ads.length} ad{camp.ads.length===1?'':'s'} in this campaign</div>
                </div>
                {isSel && (
                  <div style={{ background:'rgba(251,191,36,.04)', border:'1px solid rgba(251,191,36,.12)', borderRadius:'0 0 12px 12px', padding:'14px 16px', marginTop:-4 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.5)', letterSpacing:1, marginBottom:10, fontFamily:'Sora, sans-serif' }}>ADS IN THIS CAMPAIGN</div>
                    {camp.ads.map((ad: any) => (
                      <div key={ad.id} style={{ ...S.card, padding:12, marginBottom:8, display:'flex', gap:10 }}>
                        <span style={{ padding:'3px 8px', borderRadius:20, background:`${AD_TYPE_COLORS[ad.adType]??'#fff'}22`, color:AD_TYPE_COLORS[ad.adType]??'#fff', fontSize:10, fontWeight:700, flexShrink:0, border:`1px solid ${AD_TYPE_COLORS[ad.adType]??'#fff'}40` }}>
                          {AD_TYPE_NAMES[ad.adType]??ad.adType}
                        </span>
                        <div style={{ flex:1 }}>
                          {ad.text && <div style={{ fontSize:12, color:'rgba(255,255,255,.7)', fontStyle:'italic' }}>"{ad.text}"</div>}
                          {ad.mediaUrl && <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>🎬 {ad.mediaUrl}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── GBA ÀGÒ ── */}
      {tab==='slots' && (
        <div style={{ padding:'12px 16px' }} className="oja-fade">
          <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto', scrollbarWidth:'none' }}>
            {Object.keys(CHANNELS_MAP).map(ch => (
              <button key={ch} style={S.pill(slotChannel===ch,'#22d3ee')} onClick={() => setSlotChannel(ch)}>{CHANNELS_MAP[ch]}</button>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {slots.filter(s => s.channelId===slotChannel).map(slot => (
              <div key={slot.id} style={{ ...S.card, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, opacity:slot.isBooked?.5:1 }}>
                <div style={{ background:'rgba(255,255,255,.05)', borderRadius:10, padding:'8px 12px', textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.9)', fontFamily:'Sora, sans-serif' }}>{slot.startTime}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)' }}>—</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.9)', fontFamily:'Sora, sans-serif' }}>{slot.endTime}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', textDecoration:slot.isBooked?'line-through':'none' }}>
                    {CHANNELS_MAP[slot.channelId]} · 5-min Ad Slot
                  </div>
                  <div style={{ fontSize:12, color:'#fbbf24', marginTop:3, fontWeight:600 }}>₡{slot.basePrice.toLocaleString()}</div>
                </div>
                {slot.isBooked ? (
                  <span style={{ padding:'6px 14px', borderRadius:20, fontSize:11, background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.3)', border:'1px solid rgba(255,255,255,.08)', fontWeight:600 }}>Booked</span>
                ) : (
                  <button onClick={() => { setBookingSlot(slot); setBookingSuccess(false) }} style={{ padding:'8px 16px', borderRadius:20, background:'linear-gradient(135deg,#22d3ee,#0891b2)', border:'none', color:'#07090a', fontWeight:700, fontSize:12, cursor:'pointer' }}>Book Slot</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ÌTẸ̀JÁDE ── */}
      {tab==='analytics' && (
        <div style={{ padding:'12px 16px' }} className="oja-fade">
          <div style={{ ...S.card, padding:'20px 16px', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.7)', marginBottom:16 }}>Community Views · This Week</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:100 }}>
              {WEEK_VIEWS.map((v, i) => {
                const pct = (v / Math.max(...WEEK_VIEWS)) * 100
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{ fontSize:10, color:'#fbbf24', fontWeight:700 }}>{v>=1000?`${(v/1000).toFixed(1)}k`:v}</div>
                    <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${pct}%`, background:`linear-gradient(180deg,#fbbf24 ${100-pct}%,#f97316 100%)`, minHeight:4 }} />
                    <div style={{ fontSize:9, color:'rgba(255,255,255,.4)' }}>{WEEK_DAYS[i]}</div>
                  </div>
                )
              })}
            </div>
          </div>
          {[
            { label:'Best Performing Channel', value:'📺 Main TV (Prime Time)' },
            { label:'Peak Viewing Time', value:'20:00 – 21:00 WAT' },
            { label:'Cost Per View', value:'₡0.42 average' },
          ].map(m => (
            <div key={m.label} style={{ ...S.card, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,.55)' }}>{m.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#fbbf24', fontFamily:'Sora, sans-serif' }}>{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── TÀGBÀ ỌJA — Community Voice Response (Unique Feature) ── */}
      {tab==='tagba' && (
        <div style={{ padding:'12px 16px' }} className="oja-fade">
          {/* Hero concept banner */}
          <div style={{ background:'linear-gradient(135deg,rgba(249,115,22,.12),rgba(212,160,23,.08))', border:'1px solid rgba(249,115,22,.25)', borderRadius:16, padding:'16px', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div className="oja-voice-pulse" style={{ width:10, height:10, borderRadius:'50%', background:'#f97316', flexShrink:0 }} />
              <div style={{ fontSize:14, fontWeight:800, fontFamily:'Sora, sans-serif', color:'#fbbf24' }}>Community Voice — Village Speaks</div>
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', lineHeight:1.6, marginBottom:12 }}>
              In African markets, the community doesn't just listen — <em style={{ color:'#fbbf24' }}>the village responds</em>. Leave your voice on any ad. The advertiser hears you directly.
              <br/><span style={{ fontSize:11, color:'rgba(255,255,255,.45)' }}>A world-first: real community feedback on every ad campaign. Unique to Viewdicon.</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex:1, background:'rgba(255,255,255,.05)', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:800, color:'#4ade80', fontFamily:'Sora, sans-serif' }}>2,847</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>Voices this week</div>
              </div>
              <div style={{ flex:1, background:'rgba(255,255,255,.05)', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:800, color:'#fbbf24', fontFamily:'Sora, sans-serif' }}>42%</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>Positive voices</div>
              </div>
              <div style={{ flex:1, background:'rgba(255,255,255,.05)', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:800, color:'#f97316', fontFamily:'Sora, sans-serif' }}>847</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>From Agriculture</div>
              </div>
            </div>
          </div>

          {/* Trust score bar */}
          <div style={{ ...S.card, padding:'12px 14px', marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.5)', marginBottom:10, fontFamily:'Sora, sans-serif' }}>COMMUNITY TRUST · Sentiment Breakdown</div>
            {[
              { label:'Positive Voices', pct:42, c:'#4ade80' },
              { label:'Neutral Voices', pct:31, c:'#fbbf24' },
              { label:'Questions Asked', pct:27, c:'#c084fc' },
            ].map(b => (
              <div key={b.label} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                  <span style={{ color:'rgba(255,255,255,.6)' }}>{b.label}</span>
                  <span style={{ color:b.c, fontWeight:700 }}>{b.pct}%</span>
                </div>
                <div style={{ height:5, background:'rgba(255,255,255,.07)', borderRadius:4 }}>
                  <div style={{ height:'100%', width:`${b.pct}%`, background:b.c, borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Voice responses */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.7)', fontFamily:'Sora, sans-serif' }}>Community Voices</div>
            <button onClick={() => setShowVoiceSheet(true)} style={{ padding:'7px 14px', borderRadius:20, background:'rgba(249,115,22,.15)', border:'1px solid rgba(249,115,22,.35)', color:'#f97316', fontSize:11, fontWeight:700, cursor:'pointer' }}>🎙 Share Your Voice · ₡150</button>
          </div>

          {voices.map((v, i) => (
            <div key={v.id} className="oja-fade" style={{ animationDelay:`${i*.05}s`, ...S.card, padding:'12px 14px', marginBottom:10 }}>
              <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{v.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.9)', fontFamily:'Sora, sans-serif' }}>{v.name}</span>
                    {v.verified && <span style={{ fontSize:9, background:'rgba(74,222,128,.15)', color:'#4ade80', border:'1px solid rgba(74,222,128,.25)', borderRadius:99, padding:'1px 6px', fontWeight:700 }}>Verified ✓</span>}
                  </div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:2 }}>{v.village} · {v.role} · {v.time}</div>
                </div>
                {v.tier === 'paid' && <span style={{ fontSize:9, background:'rgba(249,115,22,.12)', color:'#f97316', border:'1px solid rgba(249,115,22,.25)', borderRadius:99, padding:'2px 7px', fontWeight:700, height:'fit-content', flexShrink:0 }}>₡150</span>}
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', lineHeight:1.6, marginBottom:10, fontStyle:'italic' }}>"{v.message}"</div>
              <div style={{ display:'flex', gap:7 }}>
                <button onClick={() => setLikedVoices(prev => { const n=new Set(prev); n.has(v.id)?n.delete(v.id):n.add(v.id); return n })} style={{ padding:'4px 12px', borderRadius:8, background:likedVoices.has(v.id)?'rgba(74,222,128,.12)':'rgba(255,255,255,.05)', border:`1px solid ${likedVoices.has(v.id)?'rgba(74,222,128,.3)':'rgba(255,255,255,.1)'}`, color:likedVoices.has(v.id)?'#4ade80':'rgba(255,255,255,.5)', fontSize:10, cursor:'pointer' }}>👍 Agree</button>
                <button onClick={() => setShowVoiceSheet(true)} style={{ padding:'4px 12px', borderRadius:8, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.5)', fontSize:10, cursor:'pointer' }}>💬 Reply</button>
              </div>
            </div>
          ))}

          {/* CTA */}
          <div style={{ background:'linear-gradient(135deg,rgba(249,115,22,.1),rgba(212,160,23,.06))', border:'1px solid rgba(249,115,22,.2)', borderRadius:16, padding:'20px', textAlign:'center', marginTop:8 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>🗣</div>
            <div style={{ fontSize:15, fontWeight:800, color:'rgba(255,255,255,.9)', fontFamily:'Sora, sans-serif', marginBottom:6 }}>Share Your Voice</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', marginBottom:16 }}>Advertisers hear your voice directly · ₡150 per voice · Unique to Viewdicon</div>
            <button onClick={() => setShowVoiceSheet(true)} style={{ background:'rgba(249,115,22,.18)', border:'1px solid #f97316', borderRadius:12, padding:'11px 28px', color:'#f97316', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Sora, sans-serif' }}>🎙 Start Speaking</button>
          </div>
        </div>
      )}

      {/* ═══ BOOK SLOT SHEET ═══ */}
      {bookingSlot && (
        <>
          <div style={S.overlay} onClick={() => setBookingSlot(null)} />
          <div style={S.sheet} className="oja-sheet-up">
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,.15)', margin:'0 auto 20px' }} />
            {bookingSuccess ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:700, fontFamily:'Sora, sans-serif', color:'#4ade80' }}>Slot Booked!</div>
                <div style={{ color:'rgba(255,255,255,.5)', marginTop:6, fontSize:13 }}>Your ad is scheduled for this time slot.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize:17, fontWeight:800, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', marginBottom:4 }}>Book Ad Slot</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.45)', marginBottom:20 }}>
                  {CHANNELS_MAP[bookingSlot.channelId]} · {bookingSlot.startTime}–{bookingSlot.endTime} · <span style={{ color:'#fbbf24', fontWeight:700 }}>₡{bookingSlot.basePrice.toLocaleString()}</span>
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>SELECT CAMPAIGN</div>
                  <select value={bookingCampaignId} onChange={e => { setBookingCampaignId(e.target.value); setBookingAdId('') }} style={{ ...S.input }}>
                    <option value="">— Select campaign —</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                {bookingCampaignId && (
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>SELECT AD</div>
                    <select value={bookingAdId} onChange={e => setBookingAdId(e.target.value)} style={{ ...S.input }}>
                      <option value="">— Select ad —</option>
                      {campaigns.find(c => c.id===bookingCampaignId)?.ads.map((a: any) => (
                        <option key={a.id} value={a.id}>{AD_TYPE_NAMES[a.adType]??a.adType}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button onClick={handleBookSlot} disabled={!bookingAdId||loading} style={{ width:'100%', padding:14, borderRadius:14, background:bookingAdId?'linear-gradient(135deg,#fbbf24,#f97316)':'rgba(255,255,255,.08)', border:'none', color:bookingAdId?'#07090a':'rgba(255,255,255,.3)', fontWeight:700, fontSize:15, cursor:bookingAdId?'pointer':'not-allowed' }}>
                  {loading?'Booking…':`Book for ₡${bookingSlot.basePrice.toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ═══ CREATE CAMPAIGN SHEET ═══ */}
      {showCreate && (
        <>
          <div style={S.overlay} onClick={() => setShowCreate(false)} />
          <div style={S.sheet} className="oja-sheet-up">
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,.15)', margin:'0 auto 20px' }} />
            <div style={{ fontSize:17, fontWeight:800, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', marginBottom:20 }}>📢 Create Campaign</div>
            {[
              { label:'Campaign Title', key:'title', placeholder:'e.g. Harvest Season Promo' },
              { label:'Budget (₡)', key:'budgetCowrie', placeholder:'50000', type:'number' },
              { label:'Start Date', key:'startDate', type:'date', placeholder:'' },
              { label:'End Date', key:'endDate', type:'date', placeholder:'' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>{f.label}</div>
                <input type={f.type??'text'} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={S.input} />
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:8, fontWeight:600 }}>AD TYPE</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {AD_TYPES.map(t => (
                  <button key={t} onClick={() => setForm(p => ({...p,adType:t}))} style={{ padding:'6px 14px', borderRadius:20, fontSize:11, background:form.adType===t?`${AD_TYPE_COLORS[t]}22`:'rgba(255,255,255,.05)', border:`1px solid ${form.adType===t?(AD_TYPE_COLORS[t]+'50'):'rgba(255,255,255,.1)'}`, color:form.adType===t?(AD_TYPE_COLORS[t]):'rgba(255,255,255,.4)', cursor:'pointer', fontWeight:600 }}>
                    {AD_TYPE_NAMES[t]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>TEXT / MEDIA</div>
              {form.adType==='SCROLLING_TEXT' ? (
                <textarea value={form.text} onChange={e => setForm(p=>({...p,text:e.target.value}))} placeholder="Enter your scrolling text here…" rows={3} style={{ ...S.input, resize:'vertical' }} />
              ) : (
                <input type="url" value={form.mediaUrl} onChange={e => setForm(p=>({...p,mediaUrl:e.target.value}))} placeholder="https://…" style={S.input} />
              )}
            </div>
            <button onClick={handleCreate} disabled={!form.title||!form.budgetCowrie} style={{ width:'100%', padding:14, borderRadius:14, background:(form.title&&form.budgetCowrie)?'linear-gradient(135deg,#fbbf24,#f97316)':'rgba(255,255,255,.08)', border:'none', color:(form.title&&form.budgetCowrie)?'#07090a':'rgba(255,255,255,.3)', fontWeight:700, fontSize:15, cursor:(form.title&&form.budgetCowrie)?'pointer':'not-allowed' }}>
              🗣 Launch Campaign
            </button>
          </div>
        </>
      )}

      {/* ═══ KÉDE OHÙN RẸ SHEET (voice response) ═══ */}
      {showVoiceSheet && (
        <>
          <div style={S.overlay} onClick={() => setShowVoiceSheet(false)} />
          <div style={S.sheet} className="oja-sheet-up">
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,.15)', margin:'0 auto 20px' }} />
            {voiceSent ? (
              <div style={{ textAlign:'center', padding:'30px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:700, fontFamily:'Sora, sans-serif', color:'#4ade80', marginBottom:8 }}>Voice Sent!</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.5)' }}>The advertiser will hear your voice directly.<br/>The community can also see your response.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize:17, fontWeight:800, fontFamily:'Sora, sans-serif', color:'rgba(255,255,255,.9)', marginBottom:4 }}>🎙 Share Your Voice</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:20 }}>Your voice goes directly to the advertiser · ₡150 per voice</div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>SELECT CAMPAIGN TO RESPOND TO</div>
                  <select value={voiceCampaign} onChange={e => setVoiceCampaign(e.target.value)} style={S.input}>
                    <option value="">— Select campaign —</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>YOUR VILLAGE ROLE</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {ROLES_LIST.map(r => (
                      <button key={r} onClick={() => setVoiceRole(r)} style={{ padding:'5px 12px', borderRadius:20, fontSize:11, background:voiceRole===r?'rgba(249,115,22,.15)':'rgba(255,255,255,.05)', border:`1px solid ${voiceRole===r?'rgba(249,115,22,.4)':'rgba(255,255,255,.1)'}`, color:voiceRole===r?'#f97316':'rgba(255,255,255,.5)', cursor:'pointer', fontWeight:600 }}>{r}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:6, fontWeight:600 }}>YOUR MESSAGE (max 200)</div>
                  <textarea value={voiceText} onChange={e => setVoiceText(e.target.value.slice(0,200))} placeholder="Share your honest opinion with the community…" rows={4} style={{ ...S.input, resize:'none' }} />
                  <div style={{ textAlign:'right', fontSize:10, color:'rgba(255,255,255,.3)', marginTop:4 }}>{voiceText.length}/200</div>
                </div>
                <div style={{ background:'rgba(255,180,0,.07)', border:'1px solid rgba(255,180,0,.15)', borderRadius:10, padding:'10px 12px', marginBottom:16, fontSize:11, color:'rgba(255,255,255,.5)' }}>
                  💡 The advertiser can respond to your voice directly in a private chat. Your message is visible to the entire community.
                </div>
                <button onClick={sendVoice} disabled={!voiceText.trim()} style={{ width:'100%', padding:14, borderRadius:14, background:voiceText.trim()?'linear-gradient(135deg,#f97316,#d4a017)':'rgba(255,255,255,.08)', border:'none', color:voiceText.trim()?'#07090a':'rgba(255,255,255,.3)', fontWeight:700, fontSize:15, cursor:voiceText.trim()?'pointer':'not-allowed' }}>
                  🎙 Send Voice · ₡150
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
