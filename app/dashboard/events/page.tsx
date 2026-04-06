'use client'
// ═══════════════════════════════════════════════════════════════════════════
// 🥁 ÀṢÀ EVENTS — The Village Stage
// Geo-scope discovery · 5-level Drum-to-everywhere boost · 3-tier ticketing
// COMMUNITY (free) · STANDARD (5%) · ADVANCED (10% + streaming)
// ═══════════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { eventsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { PlatformEvent, EventTierLevel } from '@/types'
import { TIER_CONFIG } from '@/types'

// ── One-time CSS injection ──────────────────────────────────────────────────
const INJECT_ID = 'asa-events-styles'
const STYLES = `
@keyframes asaFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes asaPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.85)}}
@keyframes asaGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 18px 4px rgba(239,68,68,.15)}}
@keyframes asaSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes asaRipple{0%{transform:scale(.6);opacity:.8}100%{transform:scale(2.4);opacity:0}}
@keyframes asaAdinkra{0%,100%{opacity:.018}50%{opacity:.034}}
@keyframes asaDrum{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
@keyframes asaScopeIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
.asa-fade{animation:asaFade .32s cubic-bezier(.22,1,.36,1) both}
.asa-pulse{animation:asaPulse 1.4s ease-in-out infinite}
.asa-glow-live{animation:asaGlow 2s ease-in-out infinite}
.asa-drum-bar{animation:asaDrum .15s ease both;border-radius:2px;flex:1;max-width:3px}
.asa-slide-up{animation:asaSlideUp .38s cubic-bezier(.22,1,.36,1) both}
.asa-scope-in{animation:asaScopeIn .2s ease both}
.asa-card{transition:transform .18s ease,box-shadow .18s ease}
.asa-card:active{transform:scale(.985)}
.asa-scroll::-webkit-scrollbar{display:none}
.asa-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

// ── Design tokens — exactly match the feed's palette ───────────────────────
const T = {
  bg:     '#07090a',
  card:   '#0d1008',
  card2:  '#111a0d',
  border: 'rgba(255,255,255,.07)',
  borderX:'rgba(255,255,255,.12)',
  green:  '#4ade80', greenD:'#1a7c3e', greenDD:'#14532d',
  gold:   '#fbbf24', goldD:'#d4a017',
  purple: '#7c3aed', purpleL:'#c084fc',
  red:    '#ef4444',
  blue:   '#60a5fa',
  cyan:   '#22d3ee',
  pink:   '#f472b6',
  text:   '#f0f5ee',
  dim:    'rgba(255,255,255,.42)',
  dim2:   'rgba(255,255,255,.22)',
  dim3:   'rgba(255,255,255,.10)',
}

// ── Geo scope — mirrors 5-level feed architecture ──────────────────────────
type GeoScope = 'village'|'state'|'country'|'continent'|'global'
const GEO_TABS: {key:GeoScope;label:string;reach:string;boostCost:number;color:string}[] = [
  {key:'village',   label:'🏘 Village',  reach:'Your village only',   boostCost:0,      color:'#4ade80'},
  {key:'state',     label:'🏙 State',    reach:'~50K people',         boostCost:2500,   color:'#22d3ee'},
  {key:'country',   label:'🌍 Nigeria',  reach:'~500K people',        boostCost:7500,   color:'#60a5fa'},
  {key:'continent', label:'🌐 Africa',   reach:'~5M people',          boostCost:25000,  color:'#c084fc'},
  {key:'global',    label:'⭐ Global',   reach:'Unrestricted reach',  boostCost:75000,  color:'#fbbf24'},
]

// ── Status styling ──────────────────────────────────────────────────────────
const STATUS: Record<string,{color:string;bg:string;label:string}> = {
  LIVE:      {color:'#ef4444',bg:'rgba(239,68,68,.15)',   label:'● LIVE'},
  PUBLISHED: {color:'#4ade80',bg:'rgba(74,222,128,.10)',  label:'UPCOMING'},
  DRAFT:     {color:'#6b7280',bg:'rgba(107,114,128,.10)', label:'DRAFT'},
  SOLD_OUT:  {color:'#f59e0b',bg:'rgba(245,158,11,.12)',  label:'SOLD OUT'},
  COMPLETED: {color:'#475569',bg:'rgba(71,85,105,.10)',   label:'ENDED'},
  CANCELLED: {color:'#991b1b',bg:'rgba(153,27,27,.10)',   label:'CANCELLED'},
}

const TYPE_PILLS = [
  {id:'ALL',e:'✦'},  {id:'LARGE_CONCERT',e:'🎵'},{id:'FESTIVAL',e:'🥁'},
  {id:'CONFERENCE',e:'🎙'},{id:'WEDDING',e:'💍'},{id:'BIRTHDAY',e:'🎂'},
  {id:'PARTY',e:'🎉'},{id:'COMEDY_SHOW',e:'🎭'},{id:'FASHION_SHOW',e:'👗'},
  {id:'RELIGIOUS',e:'⛪'},{id:'SPORTS_EVENT',e:'⚽'},{id:'FUNDRAISER',e:'🤲'},
]

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK: PlatformEvent[] = [
  {id:'E1',title:'Afrobeats Night Lagos 2026',description:'The biggest Afrobeats concert in West Africa',tierLevel:'ADVANCED',eventType:'LARGE_CONCERT',status:'LIVE',coverEmoji:'🎵',date:'2026-04-05',time:'20:00',venueName:'Eko Convention Centre, Lagos',villageId:'media',villageName:'Media',villageEmoji:'🎙',villageColor:'#7c3aed',hostAfroId:'dj-king',hostName:'DJ King Afro',hostEmoji:'🎧',drumScope:'JOLLOF_TV',isVerified:true,isStreaming:true,streamViewerCount:4231,escrowStatus:'COLLECTING',escrowBalance:68827500,attendeeCount:1854,tiers:[
    {name:'General',type:'GENERAL',price:15000,supply:2000,sold:1647,available:353,perks:[],gateLayer:'QR',resaleAllowed:true},
    {name:'VIP',type:'VIP',price:45000,supply:200,sold:189,available:11,perks:['VIP Lounge','Free Bar'],gateLayer:'NFC',resaleAllowed:true},
    {name:'Backstage',type:'BACKSTAGE',price:120000,supply:20,sold:18,available:2,perks:['Artist Meet','Dinner'],gateLayer:'FACE',resaleAllowed:false},
    {name:'LiveStream',type:'STREAM',price:3500,supply:10000,sold:4231,available:5769,perks:['HD Stream'],gateLayer:'QR',resaleAllowed:false},
  ]},
  {id:'E2',title:'Naija Fashion Week 2026',description:'African fashion meets global innovation — 3 days, 40 designers',tierLevel:'ADVANCED',eventType:'FASHION_SHOW',status:'PUBLISHED',coverEmoji:'👗',date:'2026-04-15',time:'18:00',venueName:'Eko Hotel & Suites, Lagos',villageId:'fashion',villageName:'Fashion',villageEmoji:'👗',villageColor:'#ec4899',hostAfroId:'fw-ng',hostName:'FW Nigeria',hostEmoji:'✨',drumScope:'JOLLOF_TV',isVerified:true,escrowStatus:'COLLECTING',escrowBalance:14425200,attendeeCount:350,tiers:[
    {name:'Front Row',type:'VIP',price:80000,supply:50,sold:48,available:2,perks:['Front Row','Champagne'],gateLayer:'NFC',resaleAllowed:true},
    {name:'Premium',type:'GENERAL',price:25000,supply:300,sold:267,available:33,perks:['Premium Seat'],gateLayer:'QR',resaleAllowed:true},
    {name:'LiveStream',type:'STREAM',price:2000,supply:5000,sold:3892,available:1108,perks:['Live HD'],gateLayer:'QR',resaleAllowed:false},
  ]},
  {id:'E3',title:'Lagos Tech Summit 2026',description:'Pan-African technology summit — AI, Web3, FinTech',tierLevel:'STANDARD',eventType:'CONFERENCE',status:'PUBLISHED',coverEmoji:'💻',date:'2026-04-18',time:'09:00',venueName:'Landmark Centre, Victoria Island',villageId:'technology',villageName:'Technology',villageEmoji:'💻',villageColor:'#0ea5e9',hostAfroId:'techguild',hostName:'Tech Guild NG',hostEmoji:'🏛',drumScope:'NATION',isVerified:true,escrowStatus:'COLLECTING',escrowBalance:8293500,attendeeCount:550,tiers:[
    {name:'Early Bird',type:'EARLY_BIRD',price:8000,supply:200,sold:200,available:0,perks:['Full access'],gateLayer:'QR',resaleAllowed:false},
    {name:'Standard',type:'GENERAL',price:15000,supply:500,sold:312,available:188,perks:['Full access','Lunch'],gateLayer:'QR',resaleAllowed:true},
    {name:'VIP Delegate',type:'VIP',price:35000,supply:50,sold:38,available:12,perks:['VIP Lounge','Front Row'],gateLayer:'NFC',resaleAllowed:false},
  ]},
  {id:'E4',title:"Chief Adeyemi's 70th Celebration",description:'Join us to celebrate a pillar of the community',tierLevel:'COMMUNITY',eventType:'BIRTHDAY',status:'PUBLISHED',coverEmoji:'🎂',date:'2026-04-08',time:'14:00',venueName:'Adeyemi Compound, Ibadan',villageId:'family',villageName:'Family',villageEmoji:'👨‍👩‍👧',villageColor:'#4ade80',hostAfroId:'adeyemi-fam',hostName:'Adeyemi Family',hostEmoji:'👑',drumScope:'VILLAGE',attendeeCount:287,tiers:[
    {name:'Open Entry',type:'FREE',price:0,supply:500,sold:287,available:213,perks:['Food & Music'],gateLayer:'QR',resaleAllowed:false},
  ]},
  {id:'E5',title:'Village Harvest Festival',description:'Annual harvest — music, food, blessings for all',tierLevel:'COMMUNITY',eventType:'FESTIVAL',status:'PUBLISHED',coverEmoji:'🌾',date:'2026-04-20',time:'10:00',venueName:'Village Square, Abeokuta',villageId:'agriculture',villageName:'Agriculture',villageEmoji:'🌾',villageColor:'#84cc16',hostAfroId:'agri-v',hostName:'Agriculture Village',hostEmoji:'🌾',drumScope:'VILLAGE',attendeeCount:545,tiers:[
    {name:'Free',type:'FREE',price:0,supply:1000,sold:456,available:544,perks:[],gateLayer:'QR',resaleAllowed:false},
    {name:'Donor',type:'DONATION',price:2000,supply:200,sold:89,available:111,perks:['Thank-you gift'],gateLayer:'QR',resaleAllowed:false},
  ]},
  {id:'E6',title:'Abuja Business Expo 2026',description:'500+ businesses · 3 days · Africa meets the world',tierLevel:'STANDARD',eventType:'CONFERENCE',status:'PUBLISHED',coverEmoji:'🏛',date:'2026-05-02',time:'09:00',venueName:'ICC Abuja',villageId:'commerce',villageName:'Commerce',villageEmoji:'🧺',villageColor:'#f59e0b',hostAfroId:'biz-ng',hostName:'Business Nigeria',hostEmoji:'💼',drumScope:'NATION',isVerified:true,escrowStatus:'COLLECTING',escrowBalance:14995750,attendeeCount:844,tiers:[
    {name:'Attendee',type:'GENERAL',price:10000,supply:1000,sold:743,available:257,perks:['Access'],gateLayer:'QR',resaleAllowed:true},
    {name:'Exhibitor',type:'VENDOR_BOOTH',price:150000,supply:50,sold:34,available:16,perks:['3×3m Booth'],gateLayer:'NFC',resaleAllowed:false},
    {name:'VIP',type:'VIP',price:50000,supply:100,sold:67,available:33,perks:['Lounge','Dinner'],gateLayer:'NFC',resaleAllowed:false},
  ]},
  {id:'E7',title:'African Comedy Night — The Big One',description:"Nigeria's biggest stand-up show returns",tierLevel:'ADVANCED',eventType:'COMEDY_SHOW',status:'PUBLISHED',coverEmoji:'🎭',date:'2026-04-26',time:'20:00',venueName:'Tafawa Balewa Square, Lagos',villageId:'arts',villageName:'Arts',villageEmoji:'🎭',villageColor:'#f97316',hostAfroId:'afrocomedy',hostName:'Afro Comedy HQ',hostEmoji:'🎤',drumScope:'JOLLOF_TV',isVerified:true,escrowStatus:'COLLECTING',escrowBalance:41244750,attendeeCount:2212,tiers:[
    {name:'Regular',type:'GENERAL',price:12000,supply:3000,sold:2134,available:866,perks:[],gateLayer:'QR',resaleAllowed:true},
    {name:'Table of 6',type:'TABLE',price:60000,supply:100,sold:78,available:22,perks:['Reserved Table','Drinks'],gateLayer:'NFC',resaleAllowed:false},
    {name:'LiveStream',type:'STREAM',price:2500,supply:8000,sold:5621,available:2379,perks:['HD','Replay 7d'],gateLayer:'QR',resaleAllowed:false},
  ]},
  {id:'E8',title:'Sunday Thanksgiving — Victory Chapel',description:'Quarterly thanksgiving service — all welcome',tierLevel:'COMMUNITY',eventType:'RELIGIOUS',status:'PUBLISHED',coverEmoji:'⛪',date:'2026-04-06',time:'08:00',venueName:'Victory Chapel, Lagos Island',villageId:'spirituality',villageName:'Spirituality',villageEmoji:'🌿',villageColor:'#a78bfa',hostAfroId:'victorychapel',hostName:'Victory Chapel',hostEmoji:'⛪',drumScope:'VILLAGE',attendeeCount:1234,tiers:[
    {name:'Open',type:'FREE',price:0,supply:2000,sold:1234,available:766,perks:[],gateLayer:'QR',resaleAllowed:false},
  ]},
]

// ── Drum Sheet — multi-scope post + boost algorithm ────────────────────────
function DrumSheet({ ev, onClose }: { ev: PlatformEvent; onClose: () => void }) {
  const [scope, setScope] = React.useState<GeoScope>('village')
  const [drumming, setDrumming] = React.useState(false)
  const [drummed, setDrummed] = React.useState(false)
  const activeGeo = GEO_TABS.find(g => g.key === scope)!
  const tc = TIER_CONFIG[ev.tierLevel]

  const handleDrum = async () => {
    setDrumming(true)
    await new Promise(r => setTimeout(r, 1200))
    setDrummed(true)
    setDrumming(false)
    setTimeout(onClose, 1600)
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,.72)',backdropFilter:'blur(8px)',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div className="asa-slide-up" onClick={e=>e.stopPropagation()} style={{background:'#0d1008',borderRadius:'28px 28px 0 0',padding:'20px 20px 48px',borderTop:'1px solid rgba(255,255,255,.1)',maxHeight:'88vh',overflowY:'auto'}}>

        {/* Handle */}
        <div style={{width:40,height:4,borderRadius:99,background:'rgba(255,255,255,.18)',margin:'0 auto 20px'}} />

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${ev.villageColor??T.purple}44,${ev.villageColor??T.purple}18)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,border:`1px solid ${ev.villageColor??T.purple}33`}}>
            {ev.coverEmoji}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:800,color:T.text,fontFamily:'Sora, sans-serif',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.title}</div>
            <div style={{fontSize:11,color:T.dim,marginTop:1}}>{tc.emoji} {tc.label} · {ev.venueName}</div>
          </div>
        </div>

        {/* Section title */}
        <div style={{fontSize:11,fontWeight:800,color:T.dim2,letterSpacing:'.1em',textTransform:'uppercase',fontFamily:'Sora, sans-serif',marginBottom:14}}>
          🥁 Drum It — Choose Your Reach
        </div>

        {/* Geo scope selector */}
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
          {GEO_TABS.map((g, i) => {
            const active = scope === g.key
            return (
              <button key={g.key} onClick={() => setScope(g.key)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:16,border:`1px solid ${active ? g.color+'66' : 'rgba(255,255,255,.06)'}`,background:active ? `${g.color}12` : 'rgba(255,255,255,.02)',cursor:'pointer',transition:'all .18s',textAlign:'left',position:'relative',overflow:'hidden'}}>
                {/* ripple effect behind active */}
                {active && <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 20% 50%,${g.color}08 0%,transparent 70%)`}} />}
                {/* scope icon */}
                <div style={{width:44,height:44,borderRadius:12,background:active?`${g.color}22`:'rgba(255,255,255,.04)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,border:`1px solid ${active?g.color+'33':'rgba(255,255,255,.05)'}`,flexShrink:0}}>
                  {g.label.split(' ')[0]}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontSize:14,fontWeight:700,color:active?g.color:T.text,fontFamily:'Sora, sans-serif'}}>{g.label.split(' ').slice(1).join(' ')}</span>
                    {i === 0 && <span style={{fontSize:9,color:T.green,background:'rgba(74,222,128,.12)',padding:'2px 6px',borderRadius:4,fontWeight:700,border:'1px solid rgba(74,222,128,.2)'}}>FREE</span>}
                    {g.boostCost > 0 && !active && <span style={{fontSize:9,color:T.dim2}}>₦{g.boostCost.toLocaleString()}</span>}
                    {g.boostCost > 0 && active && <span style={{fontSize:9,color:g.color,fontWeight:700,background:`${g.color}18`,padding:'2px 6px',borderRadius:4,border:`1px solid ${g.color}30`}}>₦{g.boostCost.toLocaleString()}</span>}
                  </div>
                  <div style={{fontSize:11,color:T.dim}}>{g.reach}</div>
                  {active && <div className="asa-scope-in" style={{fontSize:10,color:g.color,marginTop:4,fontWeight:600}}>
                    {i===0 ? '✓ Drums to your village feed — free, instant' :
                     i===1 ? '✓ State feed boost · algo amplification × 4' :
                     i===2 ? '✓ National feed · heat-score multiplier × 12' :
                     i===3 ? '✓ Pan-African reach · continental algo push × 40' :
                              '✓ Global stage · unrestricted worldwide distribution'}
                  </div>}
                </div>
                {active && <div style={{width:8,height:8,borderRadius:'50%',background:g.color,boxShadow:`0 0 10px ${g.color}`,flexShrink:0}} />}
              </button>
            )
          })}
        </div>

        {/* Boost algorithm explainer */}
        <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:'14px 16px',marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:800,color:T.dim2,letterSpacing:'.08em',textTransform:'uppercase',fontFamily:'Sora, sans-serif',marginBottom:10}}>📡 Boost Algorithm</div>
          <div style={{display:'flex',alignItems:'center',gap:0}}>
            {GEO_TABS.map((g, i) => {
              const reached = GEO_TABS.findIndex(x => x.key === scope) >= i
              return (
                <React.Fragment key={g.key}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:reached?`${g.color}22`:'rgba(255,255,255,.04)',border:`2px solid ${reached?g.color:'rgba(255,255,255,.08)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,transition:'all .3s',position:'relative'}}>
                      {g.label.split(' ')[0]}
                      {reached && <div style={{position:'absolute',inset:-3,borderRadius:'50%',border:`1px solid ${g.color}44`}} />}
                    </div>
                    <div style={{fontSize:7,color:reached?g.color:T.dim2,fontWeight:reached?700:400,textAlign:'center',maxWidth:40,lineHeight:1.2}}>
                      {g.label.split(' ').slice(1).join(' ')}
                    </div>
                  </div>
                  {i < GEO_TABS.length - 1 && (
                    <div style={{flex:1,height:2,background:GEO_TABS.findIndex(x=>x.key===scope)>i?activeGeo.color:`rgba(255,255,255,.06)`,margin:'0 2px',marginBottom:16,transition:'background .3s'}} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
          <div style={{fontSize:10,color:T.dim,marginTop:12,lineHeight:1.6}}>
            Each level amplifies your heat score. Village drums land in community feeds. State, national, continental and global drums trigger the algo to surface your event to broader audiences based on interest graph, past attendance, and village affinity.
          </div>
        </div>

        {/* Also post to feed section */}
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:16,padding:'14px 16px',marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:800,color:T.dim2,letterSpacing:'.08em',textTransform:'uppercase',fontFamily:'Sora, sans-serif',marginBottom:10}}>📢 Also Post To</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[
              {id:'soro',label:'Sòrò Sókè Feed',icon:'🗣',desc:'Post to the main village drum feed'},
              {id:'jollof',label:'Jollof TV',icon:'📺',desc:'Feature on the live TV platform'},
              {id:'village',label:'Village Board',icon:'🏘',desc:"Pin to your village's notice board"},
              {id:'seso',label:'Seso Chat',icon:'💬',desc:'Share to trusted contacts'},
              {id:'idile',label:'Ìdílé Circle',icon:'👨‍👩‍👧',desc:'Share with family circle'},
            ].map(ch => (
              <AlsoPostChip key={ch.id} {...ch} />
            ))}
          </div>
        </div>

        {/* Drum CTA */}
        {!drummed ? (
          <button onClick={handleDrum} disabled={drumming} style={{width:'100%',padding:'17px 0',borderRadius:18,border:'none',background:drumming?T.card:`linear-gradient(135deg,${activeGeo.color}cc,${activeGeo.color}88)`,color:drumming?T.dim:'#000',fontWeight:900,fontSize:16,cursor:drumming?'default':'pointer',fontFamily:'Sora, sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all .2s',boxShadow:!drumming?`0 8px 32px ${activeGeo.color}44`:undefined}}>
            {drumming ? (
              <>
                <span style={{display:'flex',gap:3,alignItems:'flex-end',height:20}}>
                  {[0,1,2,3,4].map(i=><span key={i} className="asa-drum-bar" style={{background:T.dim,width:3,height:8+i*3,animationDelay:`${i*0.06}s`}} />)}
                </span>
                Drumming…
              </>
            ) : (
              <>🥁 Drum It {scope !== 'village' && `— ${activeGeo.label}`}</>
            )}
          </button>
        ) : (
          <div className="asa-fade" style={{width:'100%',padding:'17px 0',borderRadius:18,background:`${T.greenDD}`,color:T.green,fontWeight:900,fontSize:16,fontFamily:'Sora, sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:8,border:`1px solid ${T.green}44`}}>
            ✓ Drummed to {activeGeo.label.split(' ').slice(1).join(' ')}!
          </div>
        )}
      </div>
    </div>
  )
}

function AlsoPostChip({ id, label, icon, desc }: {id:string;label:string;icon:string;desc:string}) {
  const [on, setOn] = React.useState(false)
  return (
    <button onClick={()=>setOn(v=>!v)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:12,border:`1px solid ${on?'rgba(74,222,128,.4)':'rgba(255,255,255,.07)'}`,background:on?'rgba(74,222,128,.08)':'rgba(255,255,255,.02)',cursor:'pointer',transition:'all .15s'}}>
      <span style={{fontSize:16}}>{icon}</span>
      <div style={{textAlign:'left'}}>
        <div style={{fontSize:11,fontWeight:700,color:on?T.green:T.text,fontFamily:'Sora, sans-serif'}}>{label}</div>
        <div style={{fontSize:9,color:T.dim}}>{desc}</div>
      </div>
      <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${on?T.green:'rgba(255,255,255,.2)'}`,background:on?T.greenDD:'transparent',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:4,flexShrink:0}}>
        {on && <div style={{width:6,height:6,borderRadius:'50%',background:T.green}} />}
      </div>
    </button>
  )
}

// ── Hero Live Card ─────────────────────────────────────────────────────────
function HeroCard({ ev, onClick, onDrum, onManage }: {ev:PlatformEvent;onClick:()=>void;onDrum:()=>void;onManage:()=>void}) {
  const streamers = ev.tiers.find(t=>t.type==='STREAM')
  const totalSold = ev.tiers.reduce((s,t)=>s+(t.sold??0),0)
  const totalCap  = ev.tiers.reduce((s,t)=>s+t.supply,0)
  const soldPct   = totalCap ? Math.round((totalSold/totalCap)*100) : 0
  const col = ev.villageColor ?? T.purple

  return (
    <div className="asa-fade asa-glow-live asa-card" style={{borderRadius:22,overflow:'hidden',marginBottom:20,cursor:'pointer',position:'relative',border:`1px solid ${col}30`}}>
      {/* Gradient banner */}
      <div onClick={onClick} style={{height:180,background:`linear-gradient(160deg,${col}55 0%,${col}18 50%,#07090a 100%)`,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {/* Adinkra-style bg pattern */}
        <div style={{position:'absolute',inset:0,backgroundImage:`radial-gradient(${col}18 1px,transparent 1px)`,backgroundSize:'24px 24px',opacity:.4}} />
        <div style={{fontSize:72,filter:`drop-shadow(0 0 24px ${col}88)`,zIndex:1}}>{ev.coverEmoji}</div>
        {/* LIVE pill */}
        <div style={{position:'absolute',top:14,left:14,display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:99,background:'rgba(239,68,68,.85)',backdropFilter:'blur(6px)',border:'1px solid rgba(239,68,68,.5)'}}>
          <span className="asa-pulse" style={{width:7,height:7,borderRadius:'50%',background:'#fff'}} />
          <span style={{fontSize:10,fontWeight:900,color:'#fff',fontFamily:'Sora, sans-serif',letterSpacing:'.06em'}}>LIVE NOW</span>
        </div>
        {/* Viewer count */}
        {ev.streamViewerCount && ev.streamViewerCount > 0 && (
          <div style={{position:'absolute',top:14,right:14,padding:'5px 10px',borderRadius:99,background:'rgba(0,0,0,.6)',backdropFilter:'blur(6px)',border:'1px solid rgba(255,255,255,.12)'}}>
            <span style={{fontSize:10,color:'#fff',fontWeight:700}}>👁 {ev.streamViewerCount.toLocaleString()} watching</span>
          </div>
        )}
        {/* Tier badge */}
        <div style={{position:'absolute',bottom:14,left:14,padding:'4px 10px',borderRadius:99,background:`${TIER_CONFIG[ev.tierLevel].color}22`,backdropFilter:'blur(6px)',border:`1px solid ${TIER_CONFIG[ev.tierLevel].color}44`}}>
          <span style={{fontSize:9,color:TIER_CONFIG[ev.tierLevel].color,fontWeight:800,fontFamily:'Sora, sans-serif'}}>{TIER_CONFIG[ev.tierLevel].emoji} {TIER_CONFIG[ev.tierLevel].label}</span>
        </div>
        {ev.isVerified && <div style={{position:'absolute',bottom:14,right:14,fontSize:18}}>🛡</div>}
      </div>

      {/* Body */}
      <div onClick={onClick} style={{padding:'16px 18px 12px',background:'linear-gradient(180deg,#0d1008,#07090a)'}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
          <span style={{fontSize:10,color:col,fontWeight:600}}>{ev.villageEmoji} {ev.villageName}</span>
          <span style={{width:3,height:3,borderRadius:'50%',background:T.dim2}} />
          <span style={{fontSize:10,color:T.dim}}>{ev.hostEmoji} {ev.hostName}</span>
          {ev.isVerified && <span style={{fontSize:10,color:T.blue,marginLeft:2}}>✓</span>}
        </div>
        <div style={{fontSize:20,fontWeight:900,color:T.text,fontFamily:'Sora, sans-serif',lineHeight:1.25,marginBottom:8}}>{ev.title}</div>
        <div style={{fontSize:12,color:T.dim,lineHeight:1.5,marginBottom:12}}>{ev.description}</div>
        <div style={{display:'flex',gap:12,marginBottom:14,flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:T.dim}}>📍 {ev.venueName}</span>
          {streamers && <span style={{fontSize:11,color:T.cyan}}>📺 {streamers.sold?.toLocaleString()} streaming</span>}
        </div>
        {/* Sold bar */}
        <div style={{marginBottom:4}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:10,color:T.dim}}>{totalSold.toLocaleString()} attending</span>
            <span style={{fontSize:10,fontWeight:700,color:soldPct>90?T.red:soldPct>70?T.gold:T.green}}>{soldPct}% sold</span>
          </div>
          <div style={{height:4,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${soldPct}%`,borderRadius:99,background:`linear-gradient(90deg,${col},${col}aa)`,transition:'width .6s'}} />
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,padding:'0 18px 18px'}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClick} style={{padding:'13px 0',borderRadius:14,border:'none',background:`linear-gradient(135deg,${col}dd,${col}88)`,color:'#000',fontWeight:900,fontSize:13,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
          ▶ Watch Live
        </button>
        <button onClick={onDrum} style={{padding:'13px 0',borderRadius:14,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:T.text,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
          🥁 Drum
        </button>
        <button onClick={onManage} style={{padding:'13px 0',borderRadius:14,background:T.goldD+'22',border:`1px solid ${T.gold}33`,color:T.gold,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
          📊
        </button>
      </div>
    </div>
  )
}

// ── Standard Event Card ────────────────────────────────────────────────────
function EventCard({ ev, onClick, onDrum, onManage }:{ev:PlatformEvent;onClick:()=>void;onDrum:()=>void;onManage:()=>void}) {
  const tc   = TIER_CONFIG[ev.tierLevel]
  const st   = STATUS[ev.status] ?? STATUS.DRAFT
  const col  = ev.villageColor ?? T.purple
  const totalSold   = ev.tiers.reduce((s,t)=>s+(t.sold??0),0)
  const totalSupply = ev.tiers.reduce((s,t)=>s+t.supply,0)
  const soldPct     = totalSupply ? Math.round((totalSold/totalSupply)*100) : 0
  const lowestPaid  = ev.tiers.filter(t=>t.price>0).map(t=>t.price)
  const minPrice    = lowestPaid.length ? Math.min(...lowestPaid) : 0
  const hasFree     = ev.tiers.some(t=>t.price===0)
  const available   = ev.tiers.reduce((s,t)=>s+(t.available??(t.supply-(t.sold??0))),0)

  return (
    <div className="asa-fade asa-card" onClick={onClick} style={{borderRadius:20,overflow:'hidden',background:T.card,border:`1px solid ${T.border}`,marginBottom:14,cursor:'pointer',position:'relative'}}>
      {/* Colour accent strip */}
      <div style={{height:3,background:`linear-gradient(90deg,${col},${col}44,transparent)`}} />

      {/* Banner area */}
      <div style={{height:96,background:`linear-gradient(135deg,${col}28 0%,${col}0a 60%,transparent 100%)`,position:'relative',display:'flex',alignItems:'center',padding:'0 18px',borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontSize:42,filter:`drop-shadow(0 2px 8px ${col}66)`}}>{ev.coverEmoji}</div>
        <div style={{flex:1,minWidth:0,paddingLeft:14}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
            <span style={{fontSize:9,color:col,fontWeight:600,background:`${col}18`,padding:'2px 7px',borderRadius:4,border:`1px solid ${col}30`}}>{ev.villageEmoji} {ev.villageName}</span>
            {ev.isVerified && <span style={{fontSize:9,color:T.blue}}>✓ Verified</span>}
          </div>
          <div style={{fontSize:15,fontWeight:800,color:T.text,fontFamily:'Sora, sans-serif',lineHeight:1.25,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{ev.title}</div>
        </div>
        {/* Status badge */}
        <div style={{position:'absolute',top:10,right:12,padding:'3px 9px',borderRadius:99,background:st.bg,border:`1px solid ${st.color}40`,display:'flex',alignItems:'center',gap:4}}>
          {ev.status==='LIVE' && <span className="asa-pulse" style={{width:5,height:5,borderRadius:'50%',background:st.color}} />}
          <span style={{fontSize:9,fontWeight:800,color:st.color,fontFamily:'Sora, sans-serif'}}>{st.label}</span>
        </div>
        {/* Tier badge */}
        <div style={{position:'absolute',bottom:10,right:12,padding:'3px 8px',borderRadius:99,background:tc.bg,border:`1px solid ${tc.border}`}}>
          <span style={{fontSize:9,color:tc.color,fontWeight:700,fontFamily:'Sora, sans-serif'}}>{tc.emoji} {tc.label}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{padding:'12px 18px 0'}}>
        {/* Date + venue */}
        <div style={{display:'flex',gap:14,marginBottom:8}}>
          <span style={{fontSize:11,color:T.dim}}>📅 {new Date(ev.date??ev.startDate??'').toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short'})}</span>
          <span style={{fontSize:11,color:T.dim,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>📍 {ev.venueName}</span>
        </div>

        {/* Ticket tier pills */}
        <div className="asa-scroll" style={{display:'flex',gap:5,overflowX:'auto',marginBottom:10}}>
          {ev.tiers.slice(0,4).map(t=>{
            const avail = t.available??(t.supply-(t.sold??0))
            const full  = avail <= 0
            return (
              <div key={t.name} style={{padding:'3px 9px',borderRadius:99,fontSize:9,fontWeight:700,whiteSpace:'nowrap',background:full?'rgba(239,68,68,.08)':t.price===0?`${T.green}0f`:`${T.gold}0f`,color:full?T.red:t.price===0?T.green:T.gold,border:`1px solid ${full?'rgba(239,68,68,.22)':t.price===0?T.green+'33':T.gold+'33'}`,fontFamily:'Sora, sans-serif'}}>
                {t.name} {t.price>0?`· ₦${t.price.toLocaleString()}`:'· FREE'}{full?' · SOLD OUT':''}
              </div>
            )})}
        </div>

        {/* Sold progress */}
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:9,color:T.dim}}>{available.toLocaleString()} seats left{ev.attendeeCount?` · 👥 ${ev.attendeeCount.toLocaleString()} going`:''}</span>
            <span style={{fontSize:9,fontWeight:700,color:soldPct>92?T.red:soldPct>75?T.gold:T.green}}>{soldPct}%</span>
          </div>
          <div style={{height:3,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:99,background:`linear-gradient(90deg,${soldPct>92?T.red:soldPct>75?T.gold:col},${col}88)`,width:`${soldPct}%`,transition:'width .5s ease'}} />
          </div>
        </div>

        {/* Price + stats row */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div>
            {hasFree && minPrice===0
              ? <span style={{fontSize:16,fontWeight:900,color:T.green,fontFamily:'Sora, sans-serif'}}>FREE</span>
              : hasFree
                ? <span style={{fontSize:14,fontWeight:800,fontFamily:'Sora, sans-serif'}}><span style={{color:T.green}}>Free</span> <span style={{color:T.dim2,fontSize:11}}>+ from</span> <span style={{color:T.gold}}>₦{minPrice.toLocaleString()}</span></span>
                : <span style={{fontSize:16,fontWeight:900,color:T.gold,fontFamily:'Sora, sans-serif'}}>from ₦{minPrice.toLocaleString()}</span>
            }
            {ev.tierLevel!=='COMMUNITY' && minPrice>0 && <div style={{fontSize:9,color:T.dim2,marginTop:1}}>{ev.tierLevel==='STANDARD'?'5%':'10%'} platform fee</div>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {ev.isStreaming && <span style={{fontSize:10,color:T.red,fontWeight:700}}>📺 Live</span>}
            {ev.escrowStatus==='COLLECTING' && <span style={{fontSize:9,padding:'3px 7px',borderRadius:99,background:`${T.gold}12`,color:T.gold,border:`1px solid ${T.gold}30`,fontWeight:700,fontFamily:'Sora, sans-serif'}}>🔒 Escrow</span>}
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,padding:'0 18px 18px'}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClick} style={{padding:'12px 0',borderRadius:14,border:'none',background:`linear-gradient(135deg,${T.greenD},${T.greenDD})`,color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer',fontFamily:'Sora, sans-serif',boxShadow:`0 4px 16px ${T.greenD}44`}}>
          {ev.status==='LIVE'?'▶ Watch Live':hasFree&&minPrice===0?'🎉 RSVP Free':'🎫 Get Tickets'}
        </button>
        <button onClick={onDrum} style={{padding:'12px 0',borderRadius:14,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:T.text,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
          🥁 Drum
        </button>
        <button onClick={onManage} style={{padding:'12px 0',borderRadius:14,background:`${T.goldD}18`,border:`1px solid ${T.gold}30`,color:T.gold,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
          📊
        </button>
      </div>
    </div>
  )
}

// ── My Events organizer strip ───────────────────────────────────────────────
function MyEventsStrip({ events, onNav }: {events:PlatformEvent[];onNav:(id:string)=>void}) {
  if (!events.length) return null
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div>
          <span style={{fontSize:14,fontWeight:800,color:T.gold,fontFamily:'Sora, sans-serif'}}>📊 My Events</span>
          <span style={{fontSize:11,color:T.dim,marginLeft:8}}>{events.length} organizing</span>
        </div>
      </div>
      <div className="asa-scroll" style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:4}}>
        {events.map(ev=>{
          const tc   = TIER_CONFIG[ev.tierLevel]
          const col  = ev.villageColor ?? T.purple
          const sold = ev.tiers.reduce((a,t)=>a+(t.sold??0),0)
          const cap  = ev.tiers.reduce((a,t)=>a+t.supply,0)
          const pct  = cap>0 ? Math.round((sold/cap)*100) : 0
          const rev  = ev.revenue?.gross ?? ev.tiers.reduce((a,t)=>a+t.price*(t.sold??0),0)
          return (
            <div key={ev.id} onClick={()=>onNav(ev.id)} style={{minWidth:196,flexShrink:0,background:T.card,border:`1px solid ${col}30`,borderRadius:18,overflow:'hidden',cursor:'pointer'}}>
              <div style={{height:3,background:`linear-gradient(90deg,${col},${col}44,transparent)`}} />
              <div style={{padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <span style={{fontSize:22}}>{ev.coverEmoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'Sora, sans-serif'}}>{ev.title}</div>
                    <div style={{fontSize:9,color:T.dim,marginTop:1}}>{tc.emoji} {tc.label}</div>
                  </div>
                </div>
                <div style={{height:3,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden',marginBottom:8}}>
                  <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${col},${col}88)`,borderRadius:99}} />
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:T.green}}>₦{(rev/1000).toFixed(0)}K</div>
                    <div style={{fontSize:9,color:T.dim}}>{sold}/{cap} sold · {pct}%</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:99,background:`${col}18`,border:`1px solid ${col}33`}}>
                    <span style={{fontSize:9,color:col,fontWeight:700,fontFamily:'Sora, sans-serif'}}>Manage →</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
type ViewMode = 'discover' | 'mine'

export default function EventsPage() {
  const router = useRouter()

  // CSS inject
  React.useEffect(() => {
    if (typeof document==='undefined' || document.getElementById(INJECT_ID)) return
    const s = document.createElement('style'); s.id=INJECT_ID; s.textContent=STYLES
    document.head.appendChild(s)
  }, [])

  const [geo,       setGeo]       = React.useState<GeoScope>('village')
  const [viewMode,  setViewMode]  = React.useState<ViewMode>('discover')
  const [typeFilter,setTypeFilter]= React.useState('ALL')
  const [search,    setSearch]    = React.useState('')
  const [events,    setEvents]    = React.useState<PlatformEvent[]>([])
  const [loading,   setLoading]   = React.useState(true)
  const [drumTarget,setDrumTarget]= React.useState<PlatformEvent|null>(null)

  const authUser  = useAuthStore(s => s.user)
  const myAfroId  = React.useMemo(() => (authUser as any)?.afroId?.raw ?? (authUser as any)?.afroId ?? '', [authUser])

  React.useEffect(() => {
    eventsApi.list({limit:50})
      .then((r:any)=>{ const arr=r?.events??r?.data??[]; setEvents(Array.isArray(arr)&&arr.length?arr:MOCK) })
      .catch(()=>setEvents(MOCK))
      .finally(()=>setLoading(false))
  }, [])

  const myEvents = React.useMemo(()=>events.filter(e=>e.hostAfroId===myAfroId||e.organizerAfroId===myAfroId),[events,myAfroId])

  const GEO_SCOPE_FILTER: Record<GeoScope,string[]> = {
    village:['VILLAGE'], state:['VILLAGE','NATION'], country:['VILLAGE','NATION'],
    continent:['VILLAGE','NATION','JOLLOF_TV'], global:['VILLAGE','NATION','JOLLOF_TV'],
  }

  const filtered = React.useMemo(() => {
    let ev = events
    if (viewMode === 'mine') ev = myEvents
    else {
      const allowed = GEO_SCOPE_FILTER[geo]
      ev = ev.filter(e => allowed.includes(e.drumScope ?? 'VILLAGE'))
    }
    if (search) ev = ev.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.venueName.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'ALL') ev = ev.filter(e => e.eventType === typeFilter)
    return ev
  }, [events, myEvents, viewMode, geo, search, typeFilter])

  const liveEvents     = React.useMemo(()=>filtered.filter(e=>e.status==='LIVE'), [filtered])
  const upcomingEvents = React.useMemo(()=>filtered.filter(e=>e.status==='PUBLISHED'), [filtered])
  const totalGoers     = React.useMemo(()=>events.reduce((s,e)=>s+(e.attendeeCount??0),0), [events])

  const goToDetail  = (id:string) => router.push(`/dashboard/events/${id}`)
  const goToManage  = (id:string) => router.push(`/dashboard/events/${id}/organizer`)

  return (
    <div style={{minHeight:'100dvh',background:T.bg,color:T.text,fontFamily:'DM Sans,sans-serif',position:'relative'}}>

      {/* Adinkra background */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,opacity:.022,backgroundImage:'repeating-linear-gradient(45deg,#fbbf24 0,#fbbf24 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px'}} />

      {/* ── STICKY HEADER ── */}
      <div style={{position:'sticky',top:0,zIndex:40,background:'rgba(7,9,10,.92)',backdropFilter:'blur(18px)',borderBottom:'1px solid rgba(255,255,255,.06)',flexShrink:0}}>

        {/* Top row */}
        <div style={{padding:'12px 16px 8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontFamily:'Sora, sans-serif',fontSize:21,fontWeight:900,background:'linear-gradient(135deg,#fbbf24,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1}}>
              Àṣà Events
            </div>
            <div style={{fontSize:10,color:T.dim,marginTop:1}}>{totalGoers.toLocaleString()} people going · {events.length} events</div>
          </div>
          <button onClick={()=>router.push('/dashboard/events/create')} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 16px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer',fontFamily:'Sora, sans-serif',boxShadow:'0 4px 20px rgba(124,58,237,.4)'}}>
            <span style={{fontSize:15}}>+</span> Create
          </button>
        </div>

        {/* Search */}
        <div style={{padding:'0 16px 8px',position:'relative'}}>
          <span style={{position:'absolute',left:28,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none',color:T.dim}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events, venues, artists…" style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:14,padding:'10px 14px 10px 38px',fontSize:13,color:T.text,outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box',transition:'border-color .15s'}} />
        </div>

        {/* Mode toggle — DISCOVER | MY EVENTS */}
        <div style={{padding:'0 16px 8px'}}>
          <div style={{display:'inline-flex',background:'rgba(255,255,255,.04)',borderRadius:12,padding:3,position:'relative'}}>
            {(['discover','mine'] as ViewMode[]).map(m=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{padding:'6px 18px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:700,fontSize:11,fontFamily:'Sora, sans-serif',background:viewMode===m?'rgba(255,255,255,.1)':'transparent',color:viewMode===m?T.text:T.dim,transition:'all .18s',position:'relative',zIndex:1}}>
                {m==='discover'?'🌍 Discover':'📊 My Events'}
              </button>
            ))}
          </div>
        </div>

        {/* Geo scope bar — only in discover mode, matches feed exactly */}
        {viewMode === 'discover' && (
          <div className="asa-scroll" style={{display:'flex',gap:5,overflowX:'auto',padding:'0 16px 10px'}}>
            {GEO_TABS.map(g=>(
              <button key={g.key} onClick={()=>setGeo(g.key)} style={{padding:'5px 14px',borderRadius:99,fontSize:11,fontWeight:geo===g.key?800:500,cursor:'pointer',whiteSpace:'nowrap',background:geo===g.key?`${g.color}18`:'rgba(255,255,255,.03)',color:geo===g.key?g.color:T.dim,border:geo===g.key?`1px solid ${g.color}44`:'1px solid rgba(255,255,255,.06)',fontFamily:'Sora, sans-serif',transition:'all .15s'}}>
                {g.label}
              </button>
            ))}
          </div>
        )}

        {/* Type filter pills */}
        <div className="asa-scroll" style={{display:'flex',gap:5,overflowX:'auto',padding:'0 16px 12px'}}>
          {TYPE_PILLS.map(t=>(
            <button key={t.id} onClick={()=>setTypeFilter(t.id)} style={{padding:'4px 11px',borderRadius:99,fontSize:11,fontWeight:typeFilter===t.id?700:400,cursor:'pointer',whiteSpace:'nowrap',background:typeFilter===t.id?'rgba(124,58,237,.14)':'rgba(255,255,255,.02)',color:typeFilter===t.id?T.purpleL:T.dim2,border:typeFilter===t.id?'1px solid rgba(124,58,237,.28)':'1px solid rgba(255,255,255,.05)',fontFamily:'Sora, sans-serif',transition:'all .15s'}}>
              {t.e} {t.id==='ALL'?'All':t.id.replace(/_/g,' ').replace('LARGE ','').toLowerCase().replace(/^\w/,c=>c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:'16px 16px 0',position:'relative',zIndex:1}}>

        {/* Skeleton */}
        {loading && [0,1,2].map(i=>(
          <div key={i} style={{height:240,borderRadius:20,background:'rgba(255,255,255,.03)',marginBottom:14,border:'1px solid rgba(255,255,255,.05)',overflow:'hidden'}}>
            <div style={{height:3,background:'rgba(255,255,255,.08)'}} />
          </div>
        ))}

        {!loading && (
          <>
            {/* My Events strip */}
            {viewMode==='discover' && <MyEventsStrip events={myEvents} onNav={goToManage} />}

            {/* Live hero cards */}
            {liveEvents.length > 0 && (
              <div style={{marginBottom:4}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                  <span className="asa-pulse" style={{width:8,height:8,borderRadius:'50%',background:T.red,display:'inline-block'}} />
                  <span style={{fontSize:13,fontWeight:800,color:T.red,fontFamily:'Sora, sans-serif',letterSpacing:'.04em'}}>LIVE NOW</span>
                  <span style={{fontSize:11,color:T.dim}}>({liveEvents.length})</span>
                </div>
                {liveEvents.map(ev=>(
                  <HeroCard key={ev.id} ev={ev} onClick={()=>goToDetail(ev.id)} onDrum={()=>setDrumTarget(ev)} onManage={()=>goToManage(ev.id)} />
                ))}
              </div>
            )}

            {/* Upcoming events */}
            {upcomingEvents.length > 0 && (
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <span style={{fontSize:13,fontWeight:800,color:T.text,fontFamily:'Sora, sans-serif'}}>
                    {viewMode==='mine' ? '📋 My Events' : geo==='village' ? '🏘 In Your Village' : geo==='state' ? '🏙 Across Your State' : geo==='country' ? '🌍 Across Nigeria' : geo==='continent' ? '🌐 Across Africa' : '⭐ Worldwide'}
                  </span>
                  <span style={{fontSize:11,color:T.dim}}>{upcomingEvents.length} events</span>
                </div>
                {upcomingEvents.map(ev=>(
                  <EventCard key={ev.id} ev={ev} onClick={()=>goToDetail(ev.id)} onDrum={()=>setDrumTarget(ev)} onManage={()=>goToManage(ev.id)} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{textAlign:'center',padding:'64px 24px'}}>
                <div style={{fontSize:52,marginBottom:16}}>🥁</div>
                <div style={{fontSize:17,fontWeight:800,color:T.text,fontFamily:'Sora, sans-serif',marginBottom:8}}>No events found</div>
                <div style={{fontSize:13,color:T.dim,marginBottom:24,lineHeight:1.6}}>
                  {viewMode==='mine' ? "You haven't created any events yet. Start drumming!" : "No events in your scope. Widen your reach or create one."}
                </div>
                <button onClick={()=>router.push('/dashboard/events/create')} style={{padding:'14px 28px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif',boxShadow:'0 6px 24px rgba(124,58,237,.4)'}}>
                  + Create Event
                </button>
              </div>
            )}

            <div style={{height:80}} />
          </>
        )}
      </div>

      {/* Drum Sheet overlay */}
      {drumTarget && <DrumSheet ev={drumTarget} onClose={()=>setDrumTarget(null)} />}
    </div>
  )
}
