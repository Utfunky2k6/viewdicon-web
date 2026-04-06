'use client'
// ══════════════════════════════════════════════════════════════════════
// EVENT DETAIL — Full ticketing, escrow, platform fee display, streaming
// ══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { eventsApi } from '@/lib/api'
import type { PlatformEvent, EventTierDraft, EventTicket } from '@/types'
import { TIER_CONFIG, calcPlatformFee, calcOrganizerReceives } from '@/types'

const C = {
  bg:'#070414',bgCard:'#0d0618',
  purple:'#7c3aed',purpleL:'#c084fc',
  green:'#1a7c3e',greenL:'#4ade80',
  gold:'#d4a017',goldL:'#fbbf24',
  red:'#b22222',redL:'#ef4444',
  blueL:'#7dd3fc',
  text:'#f0e8ff',textDim:'rgba(255,255,255,.4)',textDim2:'rgba(255,255,255,.2)',
}
const CSS=`
@keyframes edFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes liveBlip{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes qrPulse{0%,100%{opacity:.7}50%{opacity:1}}
.ed-fade{animation:edFade .3s ease both}
.live-blip{animation:liveBlip 1.2s ease-in-out infinite}
.qr-pulse{animation:qrPulse 2s ease infinite}
.ed-scroll::-webkit-scrollbar{display:none}
.ed-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

const MOCK_EVENT: PlatformEvent = {
  id:'EVT-001',title:'Afrobeats Night Lagos 2026',
  description:'The biggest Afrobeats concert of the year, featuring top artists from across Africa. Experience the best of Nigerian and Pan-African music in one epic night. Live performances, DJ sets, cultural experiences.',
  tierLevel:'ADVANCED',eventType:'LARGE_CONCERT',status:'PUBLISHED',
  coverEmoji:'🎵',date:'2026-04-12',time:'20:00',venueName:'Eko Convention Centre',venueAddress:'Plot 1415 Ozumba Mbadiwe Ave, Victoria Island, Lagos',
  villageId:'media',villageName:'Media Village',villageEmoji:'🎙',villageColor:'#7c3aed',
  hostAfroId:'dj-king',hostName:'DJ King Afro',hostEmoji:'🎧',drumScope:'JOLLOF_TV',isVerified:true,
  isStreaming:false,streamViewerCount:0,escrowStatus:'COLLECTING',escrowBalance:68827500,attendeeCount:1854,
  tiers:[
    {name:'General',type:'GENERAL',price:15000,supply:2000,sold:1647,available:353,perks:['Full access to main stage'],gateLayer:'QR',resaleAllowed:true},
    {name:'VIP',type:'VIP',price:45000,supply:200,sold:189,available:11,perks:['VIP Lounge','Free bar all night','Front stage access','Gift bag'],gateLayer:'NFC',resaleAllowed:true},
    {name:'Backstage Pass',type:'BACKSTAGE',price:120000,supply:20,sold:18,available:2,perks:['Artist meet & greet','Backstage access','Dinner with artists','Collector NFT'],gateLayer:'FACE',resaleAllowed:false},
    {name:'Stream Ticket',type:'STREAM',price:3500,supply:10000,sold:4231,available:5769,perks:['HD live stream','7-day replay access','Private stream chat'],gateLayer:'QR',resaleAllowed:false},
    {name:'Parking',type:'PARKING',price:2000,supply:500,sold:234,available:266,perks:['Secure parking pass'],gateLayer:'QR',resaleAllowed:false},
  ],
  sponsors:[{id:'sp1',name:'MTN Nigeria',tier:'TITLE',amount:5000000},{id:'sp2',name:'Pepsi',tier:'GOLD',amount:2000000},{id:'sp3',name:'Flutterwave',tier:'SILVER',amount:1000000}],
  staff:[{id:'st1',role:'STAGE_MANAGER',afroId:'sm1',name:'Tunde Adeyemi',status:'CONFIRMED'},{id:'st2',role:'SECURITY',afroId:'sec1',name:'Emeka Nwosu',status:'CONFIRMED'}],
}

const MOCK_RESALE = [
  {id:'R1',tier:'General',originalPrice:15000,askingPrice:18000,sellerMask:'A****3421',listedAt:'2h ago'},
  {id:'R2',tier:'VIP',originalPrice:45000,askingPrice:52000,sellerMask:'B****7829',listedAt:'5h ago'},
  {id:'R3',tier:'General',originalPrice:15000,askingPrice:16500,sellerMask:'C****1104',listedAt:'1d ago'},
]

/* ── QR Ticket Card ── */
function QRTicketCard({ticket,onClose}:{ticket:EventTicket;onClose:()=>void}) {
  const cells = Array.from({length:49},(_,i)=>!!((i*7+i%7+Math.floor(i/7)*3)%3))
  return (
    <div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,.88)',backdropFilter:'blur(14px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="ed-fade" style={{background:'#0d0618',borderRadius:22,padding:24,maxWidth:320,width:'100%',border:'1px solid rgba(124,58,237,.3)'}}>
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:800,color:C.purpleL,textTransform:'uppercase',letterSpacing:'.12em',fontFamily:'Sora, sans-serif'}}>CowrieTicket™</div>
          <div style={{fontSize:17,fontWeight:900,color:C.text,fontFamily:'Sora, sans-serif',marginTop:4,lineHeight:1.2}}>{ticket.eventTitle}</div>
          <div style={{fontSize:10,color:C.textDim,marginTop:2}}>{ticket.tierName} · {new Date(ticket.eventDate).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>
        </div>
        <div className="qr-pulse" style={{width:110,height:110,margin:'0 auto 16px',background:'rgba(124,58,237,.08)',borderRadius:12,border:`2px solid ${C.purpleL}`,padding:8,display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1.5}}>
          {cells.map((on,i)=><div key={i} style={{borderRadius:1,background:on?C.purpleL:'transparent'}}/>)}
        </div>
        <div style={{textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:9,color:C.textDim2,fontFamily:'monospace',letterSpacing:'.08em'}}>{ticket.qrCode}</div>
          <div style={{fontSize:9,color:C.textDim2,marginTop:1}}>NFC: {ticket.nfcCode}</div>
          <div style={{marginTop:8,padding:'5px 12px',borderRadius:8,background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',display:'inline-block'}}>
            <span style={{fontSize:10,fontWeight:800,color:C.greenL}}>✓ ACTIVE</span>
          </div>
        </div>
        <div style={{borderTop:'1px dashed rgba(255,255,255,.08)',paddingTop:12,marginBottom:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[['Venue',ticket.venueName],['Gate',ticket.tierName.includes('Stream')?'Online':'QR'],['Price',`₡${ticket.price.toLocaleString()}`],['Platform Fee',`₡${Math.round(ticket.platformFee).toLocaleString()}`],['Offline Code',ticket.offlineCode],['Fraud Protected','✓ Yes']].map(([l,v])=>(
              <div key={l}><div style={{fontSize:8,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>{l}</div><div style={{fontSize:9,color:C.text,fontWeight:700,marginTop:1}}>{v}</div></div>
            ))}
          </div>
        </div>
        <button onClick={onClose} style={{width:'100%',padding:'10px 0',borderRadius:12,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>Done</button>
        <div style={{textAlign:'center',marginTop:8,fontSize:8,color:C.textDim2}}>Powered by CowrieChain · Anti-fraud protected · One-time QR use</div>
      </div>
    </div>
  )
}

/* ── Buy Drawer ── */
function BuyDrawer({tier,event,onClose}:{tier:EventTierDraft;event:PlatformEvent;onClose:(t?:EventTicket)=>void}) {
  const [qty,setQty] = React.useState(1)
  const [loading,setLoading] = React.useState(false)
  const fee = calcPlatformFee(tier.price, event.tierLevel)
  const net = calcOrganizerReceives(tier.price, event.tierLevel)

  const buy = async () => {
    setLoading(true)
    try {
      await eventsApi.buyTicket(event.id,{tierName:tier.name,quantity:qty,buyerAfroId:'me'})
      const ticket: EventTicket = {
        id:`TKT-${Date.now()}`,
        qrCode:`CTKT-${Math.random().toString(36).substr(2,10).toUpperCase()}`,
        nfcCode:`NFC-${Math.random().toString(36).substr(2,8).toUpperCase()}`,
        ownerUserId:'me',eventId:event.id,eventTitle:event.title,
        ticketType:tier.type,tierName:tier.name,status:'ACTIVE',resaleStatus:'NOT_LISTED',
        price:tier.price,platformFee:fee,purchasedAt:new Date().toISOString(),
        offlineCode:`OFF-${Math.random().toString(36).substr(2,6).toUpperCase()}`,
        transferHistory:[],eventDate:event.date??event.startDate??'',venueName:event.venueName,
      }
      onClose(ticket)
    } catch { onClose() }
    setLoading(false)
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:90,background:'rgba(0,0,0,.7)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div className="ed-fade" style={{background:C.bgCard,borderRadius:'22px 22px 0 0',padding:20,width:'100%',maxWidth:480,borderTop:'1px solid rgba(255,255,255,.08)'}}>
        <div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,.15)',margin:'0 auto 16px'}}/>
        <div style={{fontSize:17,fontWeight:900,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:2}}>{tier.name}</div>
        {tier.perks.length>0&&<div style={{fontSize:10,color:C.textDim,marginBottom:14}}>{tier.perks.join(' · ')}</div>}

        {/* Qty */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderRadius:14,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',marginBottom:14}}>
          <span style={{fontSize:13,color:C.text,fontWeight:700}}>Quantity</span>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {['−','+'].map((btn,bi)=><button key={btn} onClick={()=>setQty(q=>bi===0?Math.max(1,q-1):Math.min(tier.available??10,q+1))} style={{width:32,height:32,borderRadius:8,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.06)',color:C.text,cursor:'pointer',fontSize:16,fontFamily:'Sora, sans-serif'}}>{btn}</button>)}
          </div>
          <span style={{fontSize:18,fontWeight:900,color:C.text,minWidth:32,textAlign:'center',fontFamily:'Sora, sans-serif'}}>{qty}</span>
        </div>

        {/* Price breakdown */}
        <div style={{borderRadius:14,background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',padding:14,marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10,fontFamily:'Sora, sans-serif'}}>Price Breakdown</div>
          {[
            {l:`₡${tier.price.toLocaleString()} × ${qty} ticket${qty>1?'s':''}`,v:`₡${(tier.price*qty).toLocaleString()}`,c:C.text},
            ...(event.tierLevel!=='COMMUNITY'&&tier.price>0?[
              {l:`Platform fee (${event.tierLevel==='STANDARD'?'5%':'10%'})`,v:`−₡${Math.round(fee*qty).toLocaleString()}`,c:C.redL},
              {l:'Organizer receives',v:`₡${Math.round(net*qty).toLocaleString()}`,c:C.greenL},
            ]:[]),
          ].map(r=>(
            <div key={r.l} style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:11,color:C.textDim}}>{r.l}</span><span style={{fontSize:11,fontWeight:700,color:r.c}}>{r.v}</span></div>
          ))}
          <div style={{height:1,background:'rgba(255,255,255,.06)',margin:'8px 0'}}/>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:14,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif'}}>You Pay</span>
            <span style={{fontSize:17,fontWeight:900,color:tier.price===0?C.greenL:C.goldL,fontFamily:'Sora, sans-serif'}}>{tier.price===0?'FREE':`₡${(tier.price*qty).toLocaleString()}`}</span>
          </div>
        </div>

        {/* Escrow notice */}
        <div style={{padding:10,borderRadius:12,background:'rgba(251,191,36,.05)',border:'1px solid rgba(251,191,36,.12)',marginBottom:14}}>
          <div style={{fontSize:10,color:C.goldL,fontWeight:700}}>🔒 Escrow Protected · QR + NFC issued instantly</div>
          <div style={{fontSize:9,color:C.textDim,marginTop:2}}>Your payment is held safely in escrow. Full refund if event is cancelled.</div>
        </div>

        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>onClose()} style={{flex:1,padding:'12px 0',borderRadius:14,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:C.text,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>Cancel</button>
          <button onClick={buy} disabled={loading} style={{flex:2,padding:'12px 0',borderRadius:14,border:'none',background:loading?'rgba(255,255,255,.06)':'linear-gradient(135deg,#1a7c3e,#15803d)',color:'#fff',fontSize:13,fontWeight:800,cursor:loading?'wait':'pointer',fontFamily:'Sora, sans-serif'}}>
            {loading?'Processing...':'🎫 Buy Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.eventId as string

  React.useEffect(()=>{if(typeof document==='undefined')return;if(document.getElementById('ed-css'))return;const s=document.createElement('style');s.id='ed-css';s.textContent=CSS;document.head.appendChild(s)},[])

  const [ev,setEv] = React.useState<PlatformEvent|null>(null)
  const [loading,setLoading] = React.useState(true)
  const [tab,setTab] = React.useState<'tickets'|'info'|'waiting'>('tickets')
  const [buyingTier,setBuyingTier] = React.useState<EventTierDraft|null>(null)
  const [ticket,setTicket] = React.useState<EventTicket|null>(null)
  const [drummed,setDrummed] = React.useState(false)
  const [donateAmt,setDonateAmt] = React.useState(5000)
  const [donated,setDonated] = React.useState(false)

  React.useEffect(()=>{
    eventsApi.get(eventId).then((r:any)=>setEv(r?.event??r?.data??MOCK_EVENT)).catch(()=>setEv(MOCK_EVENT)).finally(()=>setLoading(false))
  },[eventId])

  if(loading||!ev) return <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontSize:40}}>🥁</div></div>

  const tierCfg = TIER_CONFIG[ev.tierLevel]
  const isFree = ev.tierLevel==='COMMUNITY'
  const totalSold = ev.tiers.reduce((s,t)=>s+(t.sold??0),0)
  const totalSupply = ev.tiers.reduce((s,t)=>s+t.supply,0)
  const soldPct = totalSupply?Math.round((totalSold/totalSupply)*100):0
  const lowestPaid = Math.min(...ev.tiers.filter(t=>t.price>0).map(t=>t.price))

  return (
    <div style={{minHeight:'100vh',background:C.bg,paddingBottom:100}}>
      {ticket&&<QRTicketCard ticket={ticket} onClose={()=>setTicket(null)}/>}
      {buyingTier&&<BuyDrawer tier={buyingTier} event={ev} onClose={(t)=>{setBuyingTier(null);if(t)setTicket(t)}}/>}

      {/* Hero */}
      <div style={{height:170,background:`linear-gradient(135deg,${ev.villageColor??C.purple}35,${ev.villageColor??C.purple}06)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:78,position:'relative'}}>
        {ev.coverEmoji}
        <button onClick={()=>router.back()} style={{position:'absolute',top:14,left:14,width:36,height:36,borderRadius:10,border:'1px solid rgba(255,255,255,.12)',background:'rgba(7,4,20,.6)',color:C.text,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <button onClick={()=>router.push(`/dashboard/events/${eventId}/organizer`)} style={{position:'absolute',top:14,right:14,padding:'6px 12px',borderRadius:10,border:'1px solid rgba(255,255,255,.1)',background:'rgba(7,4,20,.6)',color:C.textDim,cursor:'pointer',fontSize:10,fontWeight:700,fontFamily:'Sora, sans-serif'}}>📊 Manage</button>
        {ev.isStreaming&&<div style={{position:'absolute',bottom:10,right:12,padding:'4px 10px',borderRadius:99,fontSize:9,fontWeight:800,background:'rgba(239,68,68,.2)',color:C.redL,border:'1px solid rgba(239,68,68,.3)',display:'flex',alignItems:'center',gap:5,fontFamily:'Sora, sans-serif'}}><span className="live-blip" style={{width:5,height:5,borderRadius:'50%',background:C.redL}}/>LIVE · {(ev.streamViewerCount??0).toLocaleString()}</div>}
      </div>

      <div style={{padding:'14px 16px 0'}}>
        {/* Title */}
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6,flexWrap:'wrap'}}>
            <div style={{padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:800,background:tierCfg.bg,color:tierCfg.color,border:`1px solid ${tierCfg.border}`,fontFamily:'Sora, sans-serif'}}>{tierCfg.emoji} {tierCfg.label}</div>
            {ev.isVerified&&<span style={{fontSize:10}}>🛡</span>}
            <div style={{padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:800,background:ev.status==='LIVE'?'rgba(239,68,68,.1)':'rgba(74,222,128,.1)',color:ev.status==='LIVE'?C.redL:C.greenL,border:`1px solid ${ev.status==='LIVE'?'rgba(239,68,68,.2)':'rgba(74,222,128,.2)'}`,display:'flex',alignItems:'center',gap:4,fontFamily:'Sora, sans-serif'}}>
              {ev.status==='LIVE'&&<span className="live-blip" style={{width:5,height:5,borderRadius:'50%',background:C.redL}}/>}{ev.status}
            </div>
          </div>
          <div style={{fontSize:20,fontWeight:900,color:C.text,fontFamily:'Sora, sans-serif',lineHeight:1.2,marginBottom:4}}>{ev.title}</div>
          <div style={{fontSize:11,color:C.textDim}}>{ev.hostEmoji} {ev.hostName} · {ev.villageEmoji} {ev.villageName}</div>
        </div>

        {/* Escrow bar */}
        {ev.escrowStatus==='COLLECTING'&&(
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:12,background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.15)',marginBottom:12}}>
            <span style={{fontSize:14}}>🔒</span>
            <div><div style={{fontSize:10,fontWeight:700,color:C.goldL}}>₡{(ev.escrowBalance??0).toLocaleString()} in Escrow</div><div style={{fontSize:9,color:C.textDim}}>Released to organizer 48h after event · Auto-refund if cancelled</div></div>
          </div>
        )}

        {/* Info pills */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['📅',new Date(ev.date??ev.startDate??'').toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short'})+' · '+(ev.time??'')],['📍',ev.venueName],['👥',(ev.attendeeCount??0).toLocaleString()+' attending'],['🥁',(ev.drumScope??'VILLAGE')==='VILLAGE'?'Village':(ev.drumScope??'')==='NATION'?'Nation-wide':'Jollof TV']].map(([e,l])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderRadius:10,background:C.bgCard,border:'1px solid rgba(255,255,255,.05)'}}>
              <span style={{fontSize:13}}>{e}</span><span style={{fontSize:10,color:C.textDim,lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Action row */}
        <div className="ed-scroll" style={{display:'flex',gap:8,marginBottom:16,overflowX:'auto'}}>
          {[
            {icon:'🥁',label:drummed?'Drummed!':'Drum',fn:async()=>{try{await eventsApi.drumToFeed(eventId)}catch{}setDrummed(true)},c:C.purpleL,bg:'rgba(124,58,237,.1)',b:'rgba(124,58,237,.2)'},
            {icon:'🔗',label:'Share',fn:()=>navigator.clipboard?.writeText(window.location.href).catch(()=>{}),c:C.blueL,bg:'rgba(14,165,233,.1)',b:'rgba(14,165,233,.2)'},
            {icon:'🚪',label:'Gate',fn:()=>router.push(`/dashboard/events/${eventId}/gate`),c:C.greenL,bg:'rgba(74,222,128,.1)',b:'rgba(74,222,128,.2)'},
            {icon:'📊',label:'Analytics',fn:()=>router.push(`/dashboard/events/${eventId}/organizer`),c:C.goldL,bg:'rgba(251,191,36,.1)',b:'rgba(251,191,36,.2)'},
          ].map(a=>(
            <button key={a.label} onClick={a.fn} style={{padding:'8px 14px',borderRadius:99,fontSize:10,fontWeight:700,border:`1px solid ${a.b}`,cursor:'pointer',whiteSpace:'nowrap',background:a.bg,color:a.c,fontFamily:'Sora, sans-serif',display:'flex',alignItems:'center',gap:5}}>{a.icon} {a.label}</button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:2,marginBottom:16,background:'rgba(255,255,255,.03)',borderRadius:14,padding:4}}>
          {(['tickets','info','waiting'] as const).map(k=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:'8px 0',borderRadius:10,border:'none',fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif',background:tab===k?C.bgCard:'transparent',color:tab===k?C.text:C.textDim,transition:'all .15s',textTransform:'capitalize'}}>{k==='tickets'?'🎫 Tickets':k==='info'?'ℹ️ Info':'⏳ Waiting'}</button>
          ))}
        </div>

        {/* ── TICKETS TAB ── */}
        {tab==='tickets'&&(
          <div className="ed-fade">
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,color:C.textDim}}>{totalSold.toLocaleString()} / {totalSupply.toLocaleString()} sold</span>
                <span style={{fontSize:11,fontWeight:800,color:soldPct>90?C.redL:soldPct>70?C.goldL:C.greenL}}>{soldPct}% sold</span>
              </div>
              <div style={{height:5,borderRadius:99,background:'rgba(255,255,255,.06)'}}><div style={{height:'100%',borderRadius:99,background:soldPct>90?C.redL:soldPct>70?C.goldL:C.greenL,width:`${soldPct}%`,transition:'width .8s'}}/></div>
            </div>

            {ev.tiers.map(t=>{
              const avail = t.available??(t.supply-(t.sold??0))
              const full = avail<=0
              const fee = calcPlatformFee(t.price, ev.tierLevel)
              const pct = t.supply?Math.round(((t.sold??0)/t.supply)*100):0
              return (
                <div key={t.name} style={{borderRadius:16,border:`1px solid rgba(255,255,255,${full?.05:.09})`,background:C.bgCard,marginBottom:12,overflow:'hidden',opacity:full?.75:1}}>
                  <div style={{padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:18}}>{t.type==='VIP'?'👑':t.type==='BACKSTAGE'?'🎭':t.type==='STREAM'?'📺':t.type==='PARKING'?'🅿':t.type==='FREE'?'🎟':'🎫'}</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:800,color:full?C.textDim:C.text,fontFamily:'Sora, sans-serif'}}>{t.name}</div>
                          {t.perks.length>0&&<div style={{fontSize:9,color:C.textDim,marginTop:1}}>{t.perks.slice(0,2).join(' · ')}</div>}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:17,fontWeight:900,color:full?C.textDim:t.price===0?C.greenL:C.goldL,fontFamily:'Sora, sans-serif'}}>{t.price===0?'FREE':`₡${t.price.toLocaleString()}`}</div>
                        {t.price>0&&!isFree&&<div style={{fontSize:9,color:C.textDim2}}>+₡{Math.round(fee).toLocaleString()} fee</div>}
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,height:2,borderRadius:99,background:'rgba(255,255,255,.06)'}}><div style={{height:'100%',borderRadius:99,background:full?C.redL:pct>70?C.goldL:C.greenL,width:`${pct}%`}}/></div>
                      <span style={{fontSize:9,color:C.textDim2,whiteSpace:'nowrap'}}>{avail} left</span>
                    </div>
                  </div>
                  <div style={{padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                      <span style={{fontSize:9,padding:'2px 7px',borderRadius:99,background:'rgba(255,255,255,.04)',color:C.textDim2,border:'1px solid rgba(255,255,255,.06)',fontFamily:'Sora, sans-serif'}}>{t.gateLayer}</span>
                      {t.resaleAllowed&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:99,background:'rgba(251,191,36,.06)',color:C.goldL,border:'1px solid rgba(251,191,36,.15)',fontFamily:'Sora, sans-serif'}}>📈 Resale</span>}
                    </div>
                    {full
                      ?<button onClick={()=>eventsApi.joinWaiting(eventId,t.name).catch(()=>{})} style={{padding:'7px 14px',borderRadius:10,border:'1px solid rgba(124,58,237,.25)',background:'rgba(124,58,237,.1)',color:C.purpleL,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>⏳ Queue</button>
                      :<button onClick={()=>setBuyingTier(t)} style={{padding:'7px 18px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>Buy →</button>
                    }
                  </div>
                </div>
              )
            })}

            {/* Resale marketplace */}
            <div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:8}}>📈 Resale Marketplace</div>
              <div style={{padding:9,borderRadius:11,background:'rgba(251,191,36,.04)',border:'1px solid rgba(251,191,36,.1)',marginBottom:10}}>
                <div style={{fontSize:9,color:C.goldL,fontWeight:700}}>Platform takes 15% per resale · Escrow protected · Anti-fraud verified</div>
              </div>
              {MOCK_RESALE.map(r=>(
                <div key={r.id} style={{borderRadius:12,border:'1px solid rgba(255,255,255,.06)',background:C.bgCard,padding:'10px 12px',marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text}}>{r.tier}</div>
                    <div style={{fontSize:9,color:C.textDim}}>Seller: {r.sellerMask} · {r.listedAt}</div>
                    <div style={{fontSize:9,color:C.textDim2}}>Original: ₡{r.originalPrice.toLocaleString()}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:14,fontWeight:900,color:C.goldL,fontFamily:'Sora, sans-serif'}}>₡{r.askingPrice.toLocaleString()}</div>
                    <div style={{fontSize:9,color:C.redL}}>+{Math.round((r.askingPrice/r.originalPrice-1)*100)}% markup</div>
                    <button onClick={()=>eventsApi.buyResale(r.id,'me').catch(()=>{})} style={{marginTop:4,padding:'4px 10px',borderRadius:8,border:'none',background:'rgba(124,58,237,.15)',color:C.purpleL,fontSize:9,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>Buy Resale</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Donate (community) */}
            {isFree&&(
              <div style={{marginTop:16,padding:14,borderRadius:14,background:'rgba(74,222,128,.05)',border:'1px solid rgba(74,222,128,.15)'}}>
                <div style={{fontSize:13,fontWeight:800,color:C.greenL,fontFamily:'Sora, sans-serif',marginBottom:8}}>🤲 Support this Event</div>
                <div style={{display:'flex',gap:5,marginBottom:8}}>
                  {[1000,2000,5000,10000].map(a=><button key={a} onClick={()=>setDonateAmt(a)} style={{flex:1,padding:'6px 0',borderRadius:8,border:`1px solid ${donateAmt===a?'rgba(74,222,128,.3)':'rgba(255,255,255,.08)'}`,background:donateAmt===a?'rgba(74,222,128,.1)':C.bgCard,color:donateAmt===a?C.greenL:C.textDim,fontSize:9,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>₡{a>=1000?a/1000+'K':a}</button>)}
                </div>
                <button onClick={async()=>{try{await eventsApi.donate(eventId,donateAmt)}catch{}setDonated(true)}} disabled={donated} style={{width:'100%',padding:'10px 0',borderRadius:12,border:'none',background:donated?'rgba(74,222,128,.1)':'linear-gradient(135deg,#1a7c3e,#15803d)',color:'#fff',fontSize:12,fontWeight:800,cursor:donated?'default':'pointer',fontFamily:'Sora, sans-serif'}}>
                  {donated?'🙏 Thank you!':'🤲 Donate ₡'+donateAmt.toLocaleString()}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── INFO TAB ── */}
        {tab==='info'&&(
          <div className="ed-fade">
            <div style={{fontSize:13,color:C.text,lineHeight:1.75,marginBottom:16,fontFamily:'Inter,sans-serif'}}>{ev.description}</div>
            {(ev.sponsors?.length??0)>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8,fontFamily:'Sora, sans-serif'}}>Sponsors</div>
                {ev.sponsors!.map(s=>(
                  <div key={s.name} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:10,background:C.bgCard,border:'1px solid rgba(255,255,255,.05)',marginBottom:6}}>
                    <span style={{fontSize:12}}>{s.tier==='TITLE'?'🏆':s.tier==='GOLD'?'🥇':'🥈'}</span>
                    <span style={{fontSize:12,fontWeight:700,color:C.text}}>{s.name}</span>
                    <span style={{marginLeft:'auto',fontSize:9,color:C.goldL,padding:'2px 6px',borderRadius:99,background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.15)',fontWeight:700}}>{s.tier}</span>
                  </div>
                ))}
              </div>
            )}
            {(ev.staff?.length??0)>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8,fontFamily:'Sora, sans-serif'}}>Event Team</div>
                {ev.staff!.map(s=>(
                  <div key={s.name} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:10,background:C.bgCard,border:'1px solid rgba(255,255,255,.05)',marginBottom:6}}>
                    <span style={{fontSize:16}}>👤</span>
                    <div><div style={{fontSize:11,fontWeight:700,color:C.text}}>{s.name}</div><div style={{fontSize:9,color:C.purpleL}}>{s.role}</div></div>
                  </div>
                ))}
              </div>
            )}
            {ev.tierLevel==='ADVANCED'&&(
              <div style={{padding:12,borderRadius:14,background:'rgba(192,132,252,.05)',border:'1px solid rgba(192,132,252,.15)',marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:800,color:C.purpleL,marginBottom:5}}>📺 Streaming</div>
                <div style={{fontSize:10,color:C.textDim}}>This event streams live on Jollof TV. Buy a Stream Ticket for online access. 7-day replay available after event.</div>
              </div>
            )}
            {!isFree&&(
              <div style={{padding:12,borderRadius:14,background:'rgba(251,191,36,.04)',border:'1px solid rgba(251,191,36,.1)'}}>
                <div style={{fontSize:11,fontWeight:700,color:C.goldL,marginBottom:5}}>💰 Platform Revenue</div>
                <div style={{fontSize:9,color:C.textDim,lineHeight:1.7}}>
                  Ticket fee: {ev.tierLevel==='STANDARD'?'5%':'10%'} · Resale fee: 15% · Vendor booth: 10%{ev.tierLevel==='ADVANCED'?' · Streaming: 10% · Ads: 40/60 split':''}{'\n'}
                  All payments → escrow → released 48h after event ends.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WAITING TAB ── */}
        {tab==='waiting'&&(
          <div className="ed-fade">
            <div style={{textAlign:'center',padding:'24px 0 16px'}}>
              <div style={{fontSize:44,marginBottom:10}}>⏳</div>
              <div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif'}}>Waiting Compound</div>
              <div style={{fontSize:11,color:C.textDim,marginTop:5}}>Join the queue for sold-out tiers. You'll be notified when tickets become available.</div>
            </div>
            {ev.tiers.filter(t=>(t.available??1)<=0).map(t=>(
              <div key={t.name} style={{borderRadius:14,border:'1px solid rgba(124,58,237,.2)',background:'rgba(124,58,237,.04)',padding:'12px 14px',marginBottom:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div><div style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif'}}>{t.name}</div><div style={{fontSize:10,color:C.textDim}}>₡{t.price.toLocaleString()} · SOLD OUT</div></div>
                <button onClick={()=>eventsApi.joinWaiting(eventId,t.name).catch(()=>{})} style={{padding:'8px 16px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>⏳ Queue</button>
              </div>
            ))}
            {ev.tiers.every(t=>(t.available??1)>0)&&<div style={{textAlign:'center',padding:20,color:C.textDim,fontSize:12}}>🎉 Tickets available — no waiting needed!</div>}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      {tab==='tickets'&&ev.tiers.some(t=>(t.available??1)>0)&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'10px 16px',background:'rgba(7,4,20,.97)',borderTop:'1px solid rgba(255,255,255,.07)',zIndex:50}}>
          <button onClick={()=>setBuyingTier(ev.tiers.find(t=>(t.available??1)>0)??null)} style={{width:'100%',padding:'13px 0',borderRadius:14,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
            🎫 Get Tickets{!isFree&&lowestPaid?` — from ₡${lowestPaid.toLocaleString()}`:''}
          </button>
        </div>
      )}
    </div>
  )
}
