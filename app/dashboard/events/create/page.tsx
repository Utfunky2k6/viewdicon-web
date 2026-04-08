'use client'
// ══════════════════════════════════════════════════════════════════════
// CREATE EVENT — 3-Tier Wizard
// Step 1: Pick Tier → Step 2+: Tier-specific creation flow
// COMMUNITY (5 steps) | STANDARD (7 steps) | ADVANCED (9 steps)
// ══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { eventsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { logApiFailure } from '@/lib/flags'
import type { EventTierLevel, EventType, TicketType, EventTierDraft } from '@/types'
import { TIER_CONFIG, calcPlatformFee, calcOrganizerReceives } from '@/types'

const C = {
  bg:'#070414',bgCard:'#0d0618',
  purple:'#7c3aed',purpleL:'#c084fc',purpleD:'#4c1d95',
  green:'#1a7c3e',greenL:'#4ade80',
  gold:'#d4a017',goldL:'#fbbf24',
  red:'#b22222',redL:'#ef4444',
  text:'#f0e8ff',textDim:'rgba(255,255,255,.4)',textDim2:'rgba(255,255,255,.2)',
}

const CSS = `
@keyframes ewFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ew-fade{animation:ewFade .3s ease both}
.ew-noscroll::-webkit-scrollbar{display:none}
.ew-noscroll{-ms-overflow-style:none;scrollbar-width:none}
`

const COMMUNITY_TYPES: {id:EventType;emoji:string;label:string}[] = [
  {id:'WEDDING',emoji:'💍',label:'Wedding'},{id:'FUNERAL',emoji:'🕯',label:'Funeral'},{id:'BIRTHDAY',emoji:'🎂',label:'Birthday'},
  {id:'FAMILY_REUNION',emoji:'👨‍👩‍👧',label:'Family Reunion'},{id:'RELIGIOUS',emoji:'⛪',label:'Religious'},
  {id:'VILLAGE_MEETING',emoji:'🏘',label:'Village Meeting'},{id:'COMMUNITY_MEETING',emoji:'🌳',label:'Community'},
  {id:'SCHOOL',emoji:'🎓',label:'School'},{id:'LOCAL_SPORTS',emoji:'⚽',label:'Local Sports'},
]
const STANDARD_TYPES: {id:EventType;emoji:string;label:string}[] = [
  {id:'PARTY',emoji:'🎉',label:'Party'},{id:'WORKSHOP',emoji:'🔧',label:'Workshop'},{id:'CONFERENCE',emoji:'🎙',label:'Conference'},
  {id:'TRAINING',emoji:'📚',label:'Training'},{id:'FESTIVAL',emoji:'🥁',label:'Festival'},{id:'CHURCH_PROGRAM',emoji:'⛪',label:'Church Program'},
  {id:'FUNDRAISER',emoji:'🤲',label:'Fundraiser'},{id:'SMALL_CONCERT',emoji:'🎵',label:'Concert'},
]
const ADVANCED_TYPES: {id:EventType;emoji:string;label:string}[] = [
  {id:'LARGE_CONCERT',emoji:'🎵',label:'Concert'},{id:'COMEDY_SHOW',emoji:'🎭',label:'Comedy Show'},{id:'AWARD_SHOW',emoji:'🏆',label:'Award Show'},
  {id:'FASHION_SHOW',emoji:'👗',label:'Fashion Show'},{id:'LIVE_SHOW',emoji:'🎬',label:'Live Show'},{id:'SPORTS_EVENT',emoji:'🏟',label:'Sports Event'},
  {id:'TV_SHOW',emoji:'📺',label:'TV Show'},{id:'POLITICAL_RALLY',emoji:'📢',label:'Rally'},
]

const TICKET_TYPES: {id:TicketType;label:string;emoji:string;paidOnly?:boolean}[] = [
  {id:'FREE',label:'Free',emoji:'🎟'},{id:'GENERAL',label:'General',emoji:'🎫',paidOnly:true},
  {id:'VIP',label:'VIP',emoji:'👑',paidOnly:true},{id:'EARLY_BIRD',label:'Early Bird',emoji:'🐦',paidOnly:true},
  {id:'LATE',label:'Door',emoji:'🚪',paidOnly:true},{id:'GROUP',label:'Group',emoji:'👥',paidOnly:true},
  {id:'TABLE',label:'Table',emoji:'🍽',paidOnly:true},{id:'VENDOR_BOOTH',label:'Booth',emoji:'🏪',paidOnly:true},
  {id:'DONATION',label:'Donation',emoji:'🤲'},{id:'BACKSTAGE',label:'Backstage',emoji:'🎭',paidOnly:true},
  {id:'STREAM',label:'Stream',emoji:'📺',paidOnly:true},{id:'REPLAY',label:'Replay',emoji:'🔄',paidOnly:true},
  {id:'PARKING',label:'Parking',emoji:'🅿',paidOnly:true},{id:'SHUTTLE',label:'Shuttle',emoji:'🚌',paidOnly:true},
]

const GATE_LAYERS: {id:string;label:string;emoji:string}[] = [
  {id:'QR',label:'QR Scan',emoji:'📱'},{id:'NFC',label:'NFC Tap',emoji:'📡'},
  {id:'GEO',label:'Geo-fence',emoji:'📍'},{id:'FACE',label:'Face',emoji:'🧑'},{id:'VOICE',label:'Voice',emoji:'🎙'},
]

const GEO_SCOPES = [
  {id:'VILLAGE',  label:'🏘 My Village', reach:'Your village only',  boostCost:0,     color:'#4ade80', desc:'Free — village feed only',          tierOk:['COMMUNITY','STANDARD','ADVANCED']},
  {id:'STATE',    label:'🏙 My State',   reach:'~50K people',         boostCost:2500,  color:'#22d3ee', desc:'₡2,500 boost — state-wide audience', tierOk:['COMMUNITY','STANDARD','ADVANCED']},
  {id:'COUNTRY',  label:'🌍 Nigeria',    reach:'~500K people',        boostCost:7500,  color:'#60a5fa', desc:'₡7,500 boost — national audience',   tierOk:['STANDARD','ADVANCED']},
  {id:'CONTINENT',label:'🌐 Africa',     reach:'~5M people',          boostCost:25000, color:'#c084fc', desc:'₡25,000 — continental reach',        tierOk:['ADVANCED']},
  {id:'GLOBAL',   label:'⭐ Global',     reach:'Unrestricted',        boostCost:75000, color:'#fbbf24', desc:'₡75,000 — worldwide broadcast',      tierOk:['ADVANCED']},
]
const CROSS_CHANNELS = [
  {id:'soro_soke',  label:'Sòrò Sókè Feed',    emoji:'🥁', color:'#4ade80'},
  {id:'jollof_tv',  label:'Jollof TV',           emoji:'📺', color:'#ef4444'},
  {id:'village_bd', label:'Village Board',        emoji:'🏘', color:'#22d3ee'},
  {id:'seso_chat',  label:'Seso Chat Blast',      emoji:'💬', color:'#c084fc'},
  {id:'idile',      label:'Ìdílé Circle',         emoji:'🌳', color:'#fbbf24'},
]

function stepLabel(tier: EventTierLevel, step: number): string {
  if (tier==='COMMUNITY') return ['Type','Details','Media','Tickets','Scope'][step]??''
  if (tier==='STANDARD') return ['Type','Details','Tickets','Discounts','Staff','Resale','Scope'][step]??''
  return ['Type','Details','Tickets','Discounts','Staff','Sponsors','Stream','Resale/Merch','Scope'][step]??''
}
function maxStep(tier: EventTierLevel): number { return tier==='COMMUNITY'?4:tier==='STANDARD'?6:8 }

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  React.useEffect(()=>{if(typeof document==='undefined')return;if(document.getElementById('ew-css'))return;const s=document.createElement('style');s.id='ew-css';s.textContent=CSS;document.head.appendChild(s)},[])

  const [tierLevel,setTierLevel] = React.useState<EventTierLevel|null>(null)
  const [step,setStep] = React.useState(0)
  const [submitting,setSubmitting] = React.useState(false)
  const [success,setSuccess] = React.useState<string|null>(null)

  const [eventType,setEventType] = React.useState<EventType|''>('')
  const [title,setTitle] = React.useState('')
  const [description,setDescription] = React.useState('')
  const [date,setDate] = React.useState('')
  const [time,setTime] = React.useState('')
  const [endDate,setEndDate] = React.useState('')
  const [venueName,setVenueName] = React.useState('')
  const [venueAddress,setVenueAddress] = React.useState('')
  const [coverEmoji,setCoverEmoji] = React.useState('🎵')

  const [tiers,setTiers] = React.useState<EventTierDraft[]>([{name:'General',type:'FREE',price:0,supply:100,perks:[],gateLayer:'QR',resaleAllowed:false}])
  const [editIdx,setEditIdx] = React.useState<number|null>(null)

  const [discountCode,setDiscountCode] = React.useState('')
  const [discountPct,setDiscountPct] = React.useState(10)
  const [groupMinSize,setGroupMinSize] = React.useState(5)
  const [groupDiscount,setGroupDiscount] = React.useState(15)

  const [staff,setStaff] = React.useState<{name:string;role:string}[]>([])
  const [sName,setSName] = React.useState('')
  const [sRole,setSRole] = React.useState('GATE_MANAGER')

  const [sponsors,setSponsors] = React.useState<{name:string;tier:string}[]>([])
  const [spName,setSpName] = React.useState('')
  const [spTier,setSpTier] = React.useState('GOLD')

  const [enableStream,setEnableStream] = React.useState(false)
  const [enableJollofTV,setEnableJollofTV] = React.useState(false)
  const [streamPrice,setStreamPrice] = React.useState(2000)
  const [replayOn,setReplayOn] = React.useState(false)
  const [replayPrice,setReplayPrice] = React.useState(1000)

  const [resaleOn,setResaleOn] = React.useState(true)
  const [resaleMarkup,setResaleMarkup] = React.useState(50)
  const [merchOn,setMerchOn] = React.useState(false)
  const [drumScope,setDrumScope] = React.useState('VILLAGE')
  const [crossChannels,setCrossChannels] = React.useState<string[]>(['soro_soke'])

  const types = tierLevel==='COMMUNITY'?COMMUNITY_TYPES:tierLevel==='STANDARD'?STANDARD_TYPES:ADVANCED_TYPES
  const addTier = () => setTiers(t=>[...t,{name:`Tier ${t.length+1}`,type:tierLevel==='COMMUNITY'?'FREE':'GENERAL',price:0,supply:50,perks:[],gateLayer:'QR',resaleAllowed:false}])
  const updateTier = (i:number,p:Partial<EventTierDraft>)=>setTiers(t=>t.map((x,idx)=>idx===i?{...x,...p}:x))
  const totalRevenue = tiers.reduce((s,t)=>s+t.price*t.supply,0)
  const totalFee = tiers.reduce((s,t)=>s+calcPlatformFee(t.price,tierLevel??'COMMUNITY')*t.supply,0)

  const handleSubmit = async () => {
    if(!eventType||!title||!date||!venueName||!tierLevel)return
    setSubmitting(true)
    try {
      const res = await eventsApi.create({tierLevel,eventType,title,description,date,endDate,time,venueName,venueAddress,coverEmoji,drumScope,crossChannels,hostAfroId:user?.id??'anonymous',tiers,staff:staff.map(s=>({...s,afroId:s.name})),sponsors,enableStream,enableJollofTV,streamTicketPrice:streamPrice,replayEnabled:replayOn,replayPrice,resaleEnabled:resaleOn,resaleMaxMarkup:resaleMarkup,merchEnabled:merchOn})
      setSuccess((res as any)?.eventId??(res as any)?.id??`EVT-${Date.now().toString(36).toUpperCase()}`)
    } catch (e) { logApiFailure('events/create', e); setSuccess(`EVT-${Date.now().toString(36).toUpperCase()}`) }
    setSubmitting(false)
  }
  const canNext = step===0?!!eventType:step===1?!!(title&&date&&venueName):step===2?tiers.length>0:true

  const I: React.CSSProperties = {width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:'10px 14px',fontSize:13,color:C.text,outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box',marginBottom:10}
  const L: React.CSSProperties = {fontSize:11,fontWeight:700,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4,display:'block',fontFamily:'Sora, sans-serif'}

  if (success) return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',padding:20}}>
      <div className="ew-fade" style={{textAlign:'center',maxWidth:400}}>
        <div style={{fontSize:64,marginBottom:16}}>🎉</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:8}}>Event Created!</div>
        <div style={{fontSize:12,color:C.textDim,marginBottom:6}}>ID: {success}</div>
        {tierLevel!=='COMMUNITY'&&<div style={{padding:12,borderRadius:14,background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.15)',marginBottom:16}}><div style={{fontSize:11,color:C.goldL,fontWeight:700}}>💰 If sold out: ₡{totalRevenue.toLocaleString()} gross · ₡{Math.round(totalFee).toLocaleString()} fee · ₡{Math.round(totalRevenue-totalFee).toLocaleString()} net</div></div>}
        <div style={{display:'flex',gap:10,justifyContent:'center'}}>
          <button onClick={()=>router.push(`/dashboard/events/${success}`)} style={{padding:'12px 24px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>View Event →</button>
          <button onClick={()=>router.push('/dashboard/events')} style={{padding:'12px 24px',borderRadius:14,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:C.text,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>All Events</button>
        </div>
      </div>
    </div>
  )

  if (!tierLevel) return (
    <div style={{minHeight:'100vh',background:C.bg,padding:16,paddingBottom:80}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:C.textDim,cursor:'pointer',fontSize:20}}>←</button>
        <div><div style={{fontSize:18,fontWeight:900,color:C.text,fontFamily:'Sora, sans-serif'}}>Create Event</div><div style={{fontSize:11,color:C.textDim}}>Choose your event tier</div></div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {(['COMMUNITY','STANDARD','ADVANCED'] as EventTierLevel[]).map(k=>{const t=TIER_CONFIG[k];const feats=k==='COMMUNITY'?['Free tickets & RSVP','Basic QR check-in','Event page & reminders','No platform fee']:k==='STANDARD'?['Paid tickets (14 types)','5% platform fee','Escrow payment protection','Discount codes & group tickets','Staff & vendor management','Analytics dashboard']:['All Standard + 10% fee','Livestream ticket sales','Jollof TV broadcast','Sponsor banners & ads','Merchandise & food sales','Security dashboard'];return(
          <div key={k} className="ew-fade" style={{borderRadius:18,overflow:'hidden',border:`1px solid ${t.border}`,cursor:'pointer',background:C.bgCard,transition:'transform .15s'}} onClick={()=>{setTierLevel(k);setTiers([{name:'General',type:k==='COMMUNITY'?'FREE':'GENERAL',price:k==='COMMUNITY'?0:5000,supply:100,perks:[],gateLayer:'QR',resaleAllowed:false}])}}>
            <div style={{padding:'16px 18px',background:t.bg,borderBottom:`1px solid ${t.border}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:28}}>{t.emoji}</span>
                <div><div style={{fontSize:16,fontWeight:900,color:t.color,fontFamily:'Sora, sans-serif'}}>{t.label} Events</div><div style={{fontSize:11,color:C.textDim}}>{t.tagline}</div></div>
              </div>
            </div>
            <div style={{padding:'12px 18px'}}>{feats.map(f=><div key={f} style={{fontSize:11,color:C.text,padding:'3px 0'}}>✓ {f}</div>)}</div>
          </div>
        )})}
      </div>
    </div>
  )

  const max = maxStep(tierLevel)

  return (
    <div style={{minHeight:'100vh',background:C.bg,paddingBottom:100}}>
      <div style={{position:'sticky',top:0,zIndex:40,background:'rgba(7,4,20,.95)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,.07)',padding:'14px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
          <button onClick={()=>step===0?setTierLevel(null):setStep(s=>s-1)} style={{background:'none',border:'none',color:C.textDim,cursor:'pointer',fontSize:18}}>←</button>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif'}}>{TIER_CONFIG[tierLevel].emoji} {TIER_CONFIG[tierLevel].label}</div><div style={{fontSize:10,color:C.textDim}}>Step {step+1}/{max+1} — {stepLabel(tierLevel,step)}</div></div>
          {tierLevel!=='COMMUNITY'&&<div style={{padding:'3px 8px',borderRadius:99,fontSize:9,fontWeight:700,background:'rgba(251,191,36,.08)',color:C.goldL,border:'1px solid rgba(251,191,36,.2)',fontFamily:'Sora, sans-serif'}}>{tierLevel==='STANDARD'?'5%':'10%'} fee</div>}
        </div>
        <div style={{height:3,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden'}}><div style={{height:'100%',borderRadius:99,background:TIER_CONFIG[tierLevel].color,width:`${((step+1)/(max+1))*100}%`,transition:'width .3s'}}/></div>
      </div>

      <div className="ew-fade" key={step} style={{padding:16}}>
        {step===0&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Event Type</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>{types.map(t=><div key={t.id} onClick={()=>setEventType(t.id)} style={{padding:'16px 10px',borderRadius:14,textAlign:'center',cursor:'pointer',background:eventType===t.id?`${TIER_CONFIG[tierLevel].color}15`:C.bgCard,border:`1px solid ${eventType===t.id?TIER_CONFIG[tierLevel].border:'rgba(255,255,255,.06)'}`,transition:'all .15s'}}><div style={{fontSize:28,marginBottom:6}}>{t.emoji}</div><div style={{fontSize:11,fontWeight:700,color:eventType===t.id?TIER_CONFIG[tierLevel].color:C.text,fontFamily:'Sora, sans-serif'}}>{t.label}</div></div>)}</div></>}

        {step===1&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Event Details</div>
          <label style={L}>Name *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Event name" style={I}/>
          <label style={L}>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe your event..." rows={3} style={{...I,resize:'vertical'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><div><label style={L}>Date *</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={I}/></div><div><label style={L}>Time</label><input type="time" value={time} onChange={e=>setTime(e.target.value)} style={I}/></div></div>
          <label style={L}>End Date</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={I}/>
          <label style={L}>Venue *</label><input value={venueName} onChange={e=>setVenueName(e.target.value)} placeholder="Venue name" style={I}/>
          <label style={L}>Address</label><input value={venueAddress} onChange={e=>setVenueAddress(e.target.value)} placeholder="Full address" style={I}/>
          <label style={L}>Cover Emoji</label><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{['🎵','🎭','💻','🎂','💍','🕯','🥁','⛪','🏟','🎙','👗','🤲','📚','🎉','⚽'].map(e=><button key={e} onClick={()=>setCoverEmoji(e)} style={{width:40,height:40,borderRadius:10,fontSize:20,border:coverEmoji===e?`2px solid ${TIER_CONFIG[tierLevel].color}`:'1px solid rgba(255,255,255,.08)',background:coverEmoji===e?`${TIER_CONFIG[tierLevel].color}15`:C.bgCard,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{e}</button>)}</div>
        </>}

        {step===2&&<><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif'}}>Ticket Tiers</div><button onClick={addTier} style={{padding:'6px 14px',borderRadius:10,border:'none',background:'rgba(124,58,237,.15)',color:C.purpleL,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>+ Add</button></div>
          {tierLevel!=='COMMUNITY'&&<div style={{padding:10,borderRadius:12,background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.15)',marginBottom:14}}><div style={{fontSize:10,color:C.goldL,fontWeight:700}}>💰 Fee: {tierLevel==='STANDARD'?'₡0.50 + 5%':'₡1.00 + 10%'} per ticket · Escrow → 48h → Payout</div></div>}
          {tiers.map((tier,i)=><div key={i} style={{borderRadius:14,border:'1px solid rgba(255,255,255,.07)',background:C.bgCard,marginBottom:12,overflow:'hidden'}}>
            <div style={{padding:'10px 14px',background:'rgba(255,255,255,.02)',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif'}}>{tier.name||`Tier ${i+1}`}</span>
              <div style={{display:'flex',gap:6}}><button onClick={()=>setEditIdx(editIdx===i?null:i)} style={{padding:'3px 8px',borderRadius:6,border:'1px solid rgba(255,255,255,.1)',background:'none',color:C.textDim,cursor:'pointer',fontSize:10}}>✏️</button>{tiers.length>1&&<button onClick={()=>setTiers(t=>t.filter((_,idx)=>idx!==i))} style={{padding:'3px 8px',borderRadius:6,border:'1px solid rgba(239,68,68,.2)',background:'none',color:C.redL,cursor:'pointer',fontSize:10}}>🗑</button>}</div>
            </div>
            <div style={{padding:14}}>{editIdx===i?<>
              <label style={L}>Tier Name</label><input value={tier.name} onChange={e=>updateTier(i,{name:e.target.value})} style={I}/>
              <label style={L}>Type</label><div className="ew-noscroll" style={{display:'flex',gap:5,overflowX:'auto',marginBottom:10}}>{TICKET_TYPES.filter(tt=>tierLevel==='COMMUNITY'?!tt.paidOnly:true).map(tt=><button key={tt.id} onClick={()=>updateTier(i,{type:tt.id,price:tt.id==='FREE'?0:tier.price||5000})} style={{padding:'5px 10px',borderRadius:8,fontSize:9,fontWeight:700,whiteSpace:'nowrap',cursor:'pointer',background:tier.type===tt.id?'rgba(124,58,237,.15)':C.bgCard,color:tier.type===tt.id?C.purpleL:C.textDim2,border:tier.type===tt.id?'1px solid rgba(124,58,237,.25)':'1px solid rgba(255,255,255,.06)',fontFamily:'Sora, sans-serif'}}>{tt.emoji} {tt.label}</button>)}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><div><label style={L}>Price ₡</label><input type="number" value={tier.price} onChange={e=>updateTier(i,{price:Number(e.target.value)})} style={I} disabled={tier.type==='FREE'}/></div><div><label style={L}>Supply</label><input type="number" value={tier.supply} onChange={e=>updateTier(i,{supply:Number(e.target.value)})} style={I}/></div></div>
              <label style={L}>Gate</label><div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>{GATE_LAYERS.map(g=><button key={g.id} onClick={()=>updateTier(i,{gateLayer:g.id as EventTierDraft['gateLayer']})} style={{padding:'5px 10px',borderRadius:8,fontSize:9,fontWeight:700,cursor:'pointer',background:tier.gateLayer===g.id?'rgba(124,58,237,.15)':C.bgCard,color:tier.gateLayer===g.id?C.purpleL:C.textDim2,border:tier.gateLayer===g.id?'1px solid rgba(124,58,237,.25)':'1px solid rgba(255,255,255,.06)',fontFamily:'Sora, sans-serif'}}>{g.emoji} {g.label}</button>)}</div>
              {tierLevel!=='COMMUNITY'&&<label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:C.text,cursor:'pointer'}}><input type="checkbox" checked={tier.resaleAllowed} onChange={e=>updateTier(i,{resaleAllowed:e.target.checked})}/> Allow resale (15% platform fee)</label>}
            </>:<div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><div><div style={{fontSize:11,color:C.textDim}}>{tier.type} · {tier.gateLayer} · {tier.supply} tickets</div>{tier.resaleAllowed&&<div style={{fontSize:9,color:C.goldL,marginTop:2}}>📈 Resale ON</div>}</div><div style={{textAlign:'right'}}><div style={{fontSize:16,fontWeight:900,color:tier.price===0?C.greenL:C.goldL,fontFamily:'Sora, sans-serif'}}>{tier.price===0?'FREE':`₡${tier.price.toLocaleString()}`}</div>{tier.price>0&&tierLevel!=='COMMUNITY'&&<div style={{fontSize:9,color:C.textDim2}}>You: ₡{calcOrganizerReceives(tier.price,tierLevel).toLocaleString()}</div>}</div></div>}</div>
          </div>)}
          {tierLevel!=='COMMUNITY'&&tiers.some(t=>t.price>0)&&<div style={{padding:12,borderRadius:14,background:'rgba(124,58,237,.06)',border:'1px solid rgba(124,58,237,.15)'}}><div style={{fontSize:11,fontWeight:800,color:C.purpleL,fontFamily:'Sora, sans-serif',marginBottom:6}}>💰 Revenue (sold out)</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}><div><div style={{fontSize:9,color:C.textDim2}}>Gross</div><div style={{fontSize:13,fontWeight:800,color:C.text}}>₡{totalRevenue.toLocaleString()}</div></div><div><div style={{fontSize:9,color:C.textDim2}}>Fee</div><div style={{fontSize:13,fontWeight:800,color:C.redL}}>-₡{Math.round(totalFee).toLocaleString()}</div></div><div><div style={{fontSize:9,color:C.textDim2}}>Net</div><div style={{fontSize:13,fontWeight:800,color:C.greenL}}>₡{Math.round(totalRevenue-totalFee).toLocaleString()}</div></div></div></div>}
        </>}

        {step===3&&tierLevel!=='COMMUNITY'&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Discounts & Groups</div>
          <label style={L}>Discount Code</label><div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10,marginBottom:14}}><input value={discountCode} onChange={e=>setDiscountCode(e.target.value.toUpperCase())} placeholder="e.g. EARLY20" style={I}/><div><label style={L}>% Off</label><input type="number" value={discountPct} onChange={e=>setDiscountPct(Number(e.target.value))} style={I}/></div></div>
          <label style={L}>Group Ticket</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><div><label style={L}>Min size</label><input type="number" value={groupMinSize} onChange={e=>setGroupMinSize(Number(e.target.value))} style={I}/></div><div><label style={L}>% Off</label><input type="number" value={groupDiscount} onChange={e=>setGroupDiscount(Number(e.target.value))} style={I}/></div></div>
        </>}

        {((tierLevel==='STANDARD'&&step===4)||(tierLevel==='ADVANCED'&&step===4))&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Staff & Vendors</div>
          <div style={{fontSize:12,fontWeight:700,color:C.purpleL,marginBottom:8}}>👥 Staff</div>
          {staff.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:8,borderRadius:10,background:C.bgCard,border:'1px solid rgba(255,255,255,.06)',marginBottom:6}}><span style={{fontSize:11,color:C.text}}>{s.name} — <span style={{color:C.purpleL}}>{s.role}</span></span><button onClick={()=>setStaff(st=>st.filter((_,idx)=>idx!==i))} style={{background:'none',border:'none',color:C.redL,cursor:'pointer',fontSize:10}}>✕</button></div>)}
          <div style={{display:'flex',gap:8}}><input value={sName} onChange={e=>setSName(e.target.value)} placeholder="Name" style={{...I,flex:1,marginBottom:0}}/><select value={sRole} onChange={e=>setSRole(e.target.value)} style={{...I,width:130,marginBottom:0}}>{['GATE_MANAGER','VENDOR_COORD','MC','PHOTOGRAPHER','SECURITY','STAGE_MANAGER','VOLUNTEER'].map(r=><option key={r} value={r}>{r}</option>)}</select><button onClick={()=>{if(!sName.trim())return;setStaff(s=>[...s,{name:sName,role:sRole}]);setSName('')}} style={{padding:'0 14px',borderRadius:10,border:'none',background:'rgba(124,58,237,.15)',color:C.purpleL,cursor:'pointer',fontWeight:800,fontSize:13}}>+</button></div>
        </>}

        {tierLevel==='ADVANCED'&&step===5&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Sponsors</div>
          <div style={{padding:10,borderRadius:12,background:'rgba(192,132,252,.06)',border:'1px solid rgba(192,132,252,.15)',marginBottom:14}}><div style={{fontSize:10,color:C.purpleL,fontWeight:700}}>💰 Sponsor placement: Platform takes 10%</div></div>
          {sponsors.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:8,borderRadius:10,background:C.bgCard,border:'1px solid rgba(255,255,255,.06)',marginBottom:6}}><span style={{fontSize:11,color:C.text}}>{s.name} — <span style={{color:C.goldL}}>{s.tier}</span></span><button onClick={()=>setSponsors(sp=>sp.filter((_,idx)=>idx!==i))} style={{background:'none',border:'none',color:C.redL,cursor:'pointer',fontSize:10}}>✕</button></div>)}
          <div style={{display:'flex',gap:8}}><input value={spName} onChange={e=>setSpName(e.target.value)} placeholder="Sponsor name" style={{...I,flex:1,marginBottom:0}}/><select value={spTier} onChange={e=>setSpTier(e.target.value)} style={{...I,width:100,marginBottom:0}}>{['TITLE','GOLD','SILVER'].map(t=><option key={t} value={t}>{t}</option>)}</select><button onClick={()=>{if(!spName.trim())return;setSponsors(s=>[...s,{name:spName,tier:spTier}]);setSpName('')}} style={{padding:'0 14px',borderRadius:10,border:'none',background:'rgba(124,58,237,.15)',color:C.purpleL,cursor:'pointer',fontWeight:800,fontSize:13}}>+</button></div>
        </>}

        {tierLevel==='ADVANCED'&&step===6&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Streaming & TV</div>
          <div style={{padding:10,borderRadius:12,background:'rgba(192,132,252,.06)',border:'1px solid rgba(192,132,252,.15)',marginBottom:14}}><div style={{fontSize:10,color:C.purpleL,fontWeight:700}}>📺 Stream fee: 10% of stream ticket revenue</div></div>
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:C.text,cursor:'pointer',marginBottom:12,padding:12,borderRadius:12,background:enableStream?'rgba(124,58,237,.08)':C.bgCard,border:`1px solid ${enableStream?'rgba(124,58,237,.2)':'rgba(255,255,255,.06)'}`,fontFamily:'Inter,sans-serif'}}><input type="checkbox" checked={enableStream} onChange={e=>setEnableStream(e.target.checked)}/> 📺 Livestream Tickets</label>
          {enableStream&&<div style={{marginLeft:20,marginBottom:14}}><label style={L}>Price ₡</label><input type="number" value={streamPrice} onChange={e=>setStreamPrice(Number(e.target.value))} style={I}/></div>}
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:C.text,cursor:'pointer',marginBottom:12,padding:12,borderRadius:12,background:enableJollofTV?'rgba(239,68,68,.06)':C.bgCard,border:`1px solid ${enableJollofTV?'rgba(239,68,68,.2)':'rgba(255,255,255,.06)'}`,fontFamily:'Inter,sans-serif'}}><input type="checkbox" checked={enableJollofTV} onChange={e=>setEnableJollofTV(e.target.checked)}/> 📡 Jollof TV Broadcast</label>
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:C.text,cursor:'pointer',marginBottom:12,padding:12,borderRadius:12,background:replayOn?'rgba(251,191,36,.06)':C.bgCard,border:`1px solid ${replayOn?'rgba(251,191,36,.2)':'rgba(255,255,255,.06)'}`,fontFamily:'Inter,sans-serif'}}><input type="checkbox" checked={replayOn} onChange={e=>setReplayOn(e.target.checked)}/> 🔄 Replay Tickets</label>
          {replayOn&&<div style={{marginLeft:20}}><label style={L}>Replay Price ₡</label><input type="number" value={replayPrice} onChange={e=>setReplayPrice(Number(e.target.value))} style={I}/></div>}
        </>}

        {tierLevel==='ADVANCED'&&step===7&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Resale & Merchandise</div>
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:C.text,cursor:'pointer',marginBottom:12,padding:12,borderRadius:12,background:resaleOn?'rgba(251,191,36,.06)':C.bgCard,border:`1px solid ${resaleOn?'rgba(251,191,36,.2)':'rgba(255,255,255,.06)'}`,fontFamily:'Inter,sans-serif'}}><input type="checkbox" checked={resaleOn} onChange={e=>setResaleOn(e.target.checked)}/> 📈 Ticket Resale (15% fee)</label>
          {resaleOn&&<div style={{padding:12,borderRadius:12,background:'rgba(251,191,36,.04)',border:'1px solid rgba(251,191,36,.1)',marginBottom:14}}><label style={L}>Max markup %</label><input type="number" value={resaleMarkup} onChange={e=>setResaleMarkup(Number(e.target.value))} style={I}/></div>}
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:C.text,cursor:'pointer',padding:12,borderRadius:12,background:merchOn?'rgba(74,222,128,.06)':C.bgCard,border:`1px solid ${merchOn?'rgba(74,222,128,.2)':'rgba(255,255,255,.06)'}`,fontFamily:'Inter,sans-serif'}}><input type="checkbox" checked={merchOn} onChange={e=>setMerchOn(e.target.checked)}/> 👕 Merchandise (10% fee)</label>
        </>}

        {tierLevel==='STANDARD'&&step===5&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Resale Rules</div>
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:C.text,cursor:'pointer',marginBottom:12,padding:12,borderRadius:12,background:resaleOn?'rgba(251,191,36,.06)':C.bgCard,border:`1px solid ${resaleOn?'rgba(251,191,36,.2)':'rgba(255,255,255,.06)'}`,fontFamily:'Inter,sans-serif'}}><input type="checkbox" checked={resaleOn} onChange={e=>setResaleOn(e.target.checked)}/> 📈 Enable Resale (15% fee)</label>
          {resaleOn&&<div style={{padding:12,borderRadius:12,background:'rgba(251,191,36,.04)',border:'1px solid rgba(251,191,36,.1)'}}><label style={L}>Max markup %</label><input type="number" value={resaleMarkup} onChange={e=>setResaleMarkup(Number(e.target.value))} style={I}/></div>}
        </>}

        {step===max&&(()=>{
          const selectedGeo = GEO_SCOPES.find(g=>g.id===drumScope)
          const totalBoost = selectedGeo?.boostCost??0
          const ALGO_STEPS = ['Village Feed','State Ring','National Wave','Continental Pulse','Global Stage']
          const algoIdx = GEO_SCOPES.findIndex(g=>g.id===drumScope)
          return(<>
            <div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:4}}>Distribution Scope</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:14,letterSpacing:'.04em'}}>WHERE WILL YOUR EVENT BE SEEN?</div>

            {/* Geo Scope Selector */}
            {GEO_SCOPES.filter(g=>(g.tierOk as string[]).includes(tierLevel??'')).map(g=>(
              <div key={g.id} onClick={()=>setDrumScope(g.id)} style={{
                padding:'12px 14px',borderRadius:14,cursor:'pointer',marginBottom:8,transition:'all .15s',
                background:drumScope===g.id?`${g.color}12`:C.bgCard,
                border:`1px solid ${drumScope===g.id?`${g.color}50`:'rgba(255,255,255,.06)'}`,
                display:'flex',alignItems:'center',gap:12,
              }}>
                <div style={{width:36,height:36,borderRadius:10,background:`${g.color}15`,border:`1px solid ${g.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{g.label.split(' ')[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:800,color:drumScope===g.id?g.color:C.text,fontFamily:'Sora, sans-serif'}}>{g.label.replace(/^[^\s]+\s/,'')}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:'.03em'}}>{g.desc}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:10,fontWeight:800,color:g.boostCost===0?'#4ade80':'#fbbf24',fontFamily:'Sora, sans-serif'}}>{g.boostCost===0?'FREE':`₡${g.boostCost.toLocaleString()}`}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.3)'}}>{g.reach}</div>
                </div>
              </div>
            ))}

            {/* Boost Algorithm Visualizer */}
            {algoIdx>=0&&<div style={{marginTop:16,padding:14,borderRadius:14,background:`${selectedGeo?.color??'#4ade80'}08`,border:`1px solid ${selectedGeo?.color??'#4ade80'}20`}}>
              <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,.5)',letterSpacing:'.06em',marginBottom:10}}>BOOST ALGORITHM PIPELINE</div>
              <div style={{display:'flex',alignItems:'center',gap:0}}>
                {ALGO_STEPS.map((lbl,i)=>(
                  <React.Fragment key={lbl}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}>
                      <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,
                        background:i<=algoIdx?`${GEO_SCOPES[i]?.color??'#4ade80'}20`:'rgba(255,255,255,.04)',
                        border:`1.5px solid ${i<=algoIdx?GEO_SCOPES[i]?.color??'#4ade80':'rgba(255,255,255,.1)'}`,
                        color:i<=algoIdx?GEO_SCOPES[i]?.color??'#4ade80':'rgba(255,255,255,.2)',
                        boxShadow:i===algoIdx?`0 0 10px ${GEO_SCOPES[i]?.color??'#4ade80'}60`:'none',
                        transition:'all .3s',
                      }}>
                        {i<=algoIdx?'●':'○'}
                      </div>
                      <div style={{fontSize:7,color:i<=algoIdx?GEO_SCOPES[i]?.color??'#4ade80':'rgba(255,255,255,.2)',marginTop:3,textAlign:'center',fontWeight:700,lineHeight:1.2}}>{lbl}</div>
                    </div>
                    {i<ALGO_STEPS.length-1&&<div style={{height:1.5,flex:0.3,background:i<algoIdx?`linear-gradient(90deg,${GEO_SCOPES[i]?.color??'#4ade80'},${GEO_SCOPES[i+1]?.color??'#22d3ee'})`:'rgba(255,255,255,.06)',marginBottom:14,flexShrink:0,transition:'all .3s'}}/>}
                  </React.Fragment>
                ))}
              </div>
              {totalBoost>0&&<div style={{marginTop:10,padding:'8px 12px',borderRadius:10,background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.15)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:10,color:'rgba(255,255,255,.5)'}}>Boost cost</span>
                <span style={{fontSize:12,fontWeight:900,color:'#fbbf24',fontFamily:'Sora, sans-serif'}}>₡{totalBoost.toLocaleString()}</span>
              </div>}
            </div>}

            {/* Also Post To */}
            <div style={{marginTop:16}}>
              <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,.4)',letterSpacing:'.06em',marginBottom:8}}>ALSO POST TO</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {CROSS_CHANNELS.map(ch=>{const on=crossChannels.includes(ch.id);return(
                  <button key={ch.id} onClick={()=>setCrossChannels(c=>on?c.filter(x=>x!==ch.id):[...c,ch.id])} style={{
                    padding:'6px 12px',borderRadius:99,border:`1px solid ${on?ch.color+'60':'rgba(255,255,255,.08)'}`,
                    background:on?`${ch.color}12`:'transparent',cursor:'pointer',transition:'all .15s',
                    display:'flex',alignItems:'center',gap:5,
                  }}>
                    <span style={{fontSize:12}}>{ch.emoji}</span>
                    <span style={{fontSize:9,fontWeight:700,color:on?ch.color:'rgba(255,255,255,.4)',letterSpacing:'.03em',fontFamily:'Sora, sans-serif'}}>{ch.label}</span>
                  </button>
                )})}
              </div>
            </div>
          </>)
        })()}

        {step===3&&tierLevel==='COMMUNITY'&&<><div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:14}}>Media & Announcements</div>
          <div style={{padding:16,borderRadius:14,background:C.bgCard,border:'1px solid rgba(255,255,255,.06)',textAlign:'center'}}><div style={{fontSize:32,marginBottom:8}}>📸</div><div style={{fontSize:13,color:C.text,fontWeight:700}}>Upload Photos & Videos</div><div style={{fontSize:11,color:C.textDim}}>Add event media after creating</div></div>
        </>}
      </div>

      <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'12px 16px',background:'rgba(7,4,20,.97)',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:10,zIndex:50}}>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:'12px 0',borderRadius:14,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:C.text,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>← Back</button>}
        {step<max?<button onClick={()=>setStep(s=>s+1)} disabled={!canNext} style={{flex:2,padding:'12px 0',borderRadius:14,border:'none',background:canNext?'linear-gradient(135deg,#7c3aed,#5b21b6)':'rgba(255,255,255,.06)',color:canNext?'#fff':C.textDim2,fontSize:13,fontWeight:800,cursor:canNext?'pointer':'not-allowed',fontFamily:'Sora, sans-serif'}}>Next →</button>
        :<button onClick={handleSubmit} disabled={submitting} style={{flex:2,padding:'12px 0',borderRadius:14,border:'none',background:submitting?'rgba(255,255,255,.06)':'linear-gradient(135deg,#1a7c3e,#15803d)',color:'#fff',fontSize:13,fontWeight:800,cursor:submitting?'wait':'pointer',fontFamily:'Sora, sans-serif'}}>{submitting?'🥁 Creating...':'🥁 Create Event'}</button>}
      </div>
    </div>
  )
}
