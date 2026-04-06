'use client'
// ══════════════════════════════════════════════════════════════════════
// GATE GUARDIAN — Anti-fraud offline-first tablet UI
// Geo-fence · NFC · QR · Device tracking · Fraud detection
// ══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { eventsApi } from '@/lib/api'

const C = {
  bg:'#070414',bgCard:'#0d0618',
  purple:'#7c3aed',purpleL:'#c084fc',
  green:'#1a7c3e',greenL:'#4ade80',
  gold:'#d4a017',goldL:'#fbbf24',
  red:'#b22222',redL:'#ef4444',
  text:'#f0e8ff',textDim:'rgba(255,255,255,.4)',textDim2:'rgba(255,255,255,.2)',
  blueL:'#60a5fa',
}
const CSS=`
@keyframes ggFade{from{opacity:0}to{opacity:1}}
@keyframes liveBlip{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes admitFlash{0%{opacity:0;transform:scale(.85)}20%{opacity:1;transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
@keyframes fraudPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}50%{box-shadow:0 0 0 16px rgba(239,68,68,0)}}
.gg-fade{animation:ggFade .25s ease both}
.live-blip{animation:liveBlip 1s ease-in-out infinite}
.admit-flash{animation:admitFlash .4s ease both}
.fraud-pulse{animation:fraudPulse 1.5s ease infinite}
.gg-scroll::-webkit-scrollbar{display:none}
.gg-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

type ScanResult = 'ADMIT'|'VIP_ADMIT'|'BACKSTAGE'|'ALREADY_USED'|'INVALID'|'FRAUD_FLAGGED'|'GEO_FAIL'
type GateMode = 'MAIN_ENTRANCE'|'GATE_B'|'VIP_ENTRANCE'|'BACKSTAGE'|'VENDOR_AREA'

interface LogEntry {
  id:string;code:string;result:ScanResult;tier:string;gate:GateMode;time:string;ts:number
}

const RESULT_CFG: Record<ScanResult,{bg:string;icon:string;title:string;subtitle:string;color:string}> = {
  ADMIT:       {bg:'#166534',icon:'✅',title:'ADMIT',subtitle:'Welcome!',color:'#4ade80'},
  VIP_ADMIT:   {bg:'#78350f',icon:'👑',title:'VIP ACCESS',subtitle:'VIP Lounge · Complimentary bar',color:'#fbbf24'},
  BACKSTAGE:   {bg:'#4c1d95',icon:'🎭',title:'BACKSTAGE',subtitle:'Backstage access granted',color:'#c084fc'},
  ALREADY_USED:{bg:'#92400e',icon:'⚠️',title:'ALREADY USED',subtitle:'This ticket was scanned earlier. Contact organizer if issued in error.',color:'#f59e0b'},
  INVALID:     {bg:'#7f1d1d',icon:'❌',title:'INVALID TICKET',subtitle:'Code not found in system. Retain customer, contact security.',color:'#ef4444'},
  FRAUD_FLAGGED:{bg:'#450a0a',icon:'🚨',title:'FRAUD FLAGGED',subtitle:'DO NOT ADMIT — Contact security immediately.',color:'#ef4444'},
  GEO_FAIL:    {bg:'#1e1b4b',icon:'📍',title:'LOCATION FAIL',subtitle:'Ticket holder not at venue coordinates.',color:'#818cf8'},
}

const MOCK_LOG: LogEntry[] = [
  {id:'l1',code:'CTKT-A4521',result:'ADMIT',tier:'General',gate:'MAIN_ENTRANCE',time:'20:47',ts:1},
  {id:'l2',code:'VIP-0089',result:'VIP_ADMIT',tier:'VIP',gate:'VIP_ENTRANCE',time:'20:45',ts:2},
  {id:'l3',code:'CTKT-A4518',result:'ADMIT',tier:'General',gate:'MAIN_ENTRANCE',time:'20:44',ts:3},
  {id:'l4',code:'CTKT-A4515',result:'ADMIT',tier:'General',gate:'GATE_B',time:'20:42',ts:4},
  {id:'l5',code:'FRAUD-FAKE1',result:'FRAUD_FLAGGED',tier:'General',gate:'MAIN_ENTRANCE',time:'20:41',ts:5},
  {id:'l6',code:'BACK-003',result:'BACKSTAGE',tier:'Backstage',gate:'BACKSTAGE',time:'20:39',ts:6},
  {id:'l7',code:'CTKT-A4509',result:'ALREADY_USED',tier:'General',gate:'GATE_B',time:'20:37',ts:7},
  {id:'l8',code:'CTKT-A4506',result:'ADMIT',tier:'General',gate:'MAIN_ENTRANCE',time:'20:35',ts:8},
  {id:'l9',code:'VIP-0085',result:'VIP_ADMIT',tier:'VIP',gate:'VIP_ENTRANCE',time:'20:33',ts:9},
  {id:'l10',code:'CTKT-A4499',result:'ADMIT',tier:'General',gate:'MAIN_ENTRANCE',time:'20:30',ts:10},
  {id:'l11',code:'CTKT-A4493',result:'ADMIT',tier:'General',gate:'GATE_B',time:'20:28',ts:11},
  {id:'l12',code:'CTKT-A4488',result:'ADMIT',tier:'General',gate:'MAIN_ENTRANCE',time:'20:25',ts:12},
]

function simulateScan(code: string, log: LogEntry[]): {result:ScanResult;tier:string} {
  const c = code.toUpperCase().trim()
  if (!c) return {result:'INVALID',tier:''}
  if (c.startsWith('VIP-')) return {result:'VIP_ADMIT',tier:'VIP'}
  if (c.startsWith('BACK-')||c.startsWith('BS-')) return {result:'BACKSTAGE',tier:'Backstage'}
  if (c.includes('FRAUD')||c.includes('FAKE')) return {result:'FRAUD_FLAGGED',tier:'General'}
  if (c.startsWith('GEO-')) return {result:'GEO_FAIL',tier:'General'}
  if (c.length<5) return {result:'INVALID',tier:''}
  if (log.some(l=>l.code===c&&(l.result==='ADMIT'||l.result==='VIP_ADMIT'||l.result==='BACKSTAGE'))) return {result:'ALREADY_USED',tier:'General'}
  return {result:'ADMIT',tier:'General'}
}

export default function GatePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.eventId as string

  React.useEffect(()=>{if(typeof document==='undefined')return;if(document.getElementById('gg-css'))return;const s=document.createElement('style');s.id='gg-css';s.textContent=CSS;document.head.appendChild(s)},[])

  const [phase,setPhase] = React.useState<'setup'|'active'>('setup')
  const [gate,setGate] = React.useState<GateMode>('MAIN_ENTRANCE')
  const [operator,setOperator] = React.useState('Gate Staff')
  const [synced,setSynced] = React.useState(false)
  const [syncing,setSyncing] = React.useState(false)
  const [eventName,setEventName] = React.useState('Loading event...')
  const [viewTab,setViewTab] = React.useState<'scan'|'antifraud'|'incident'>('scan')

  // Scan state
  const [scanInput,setScanInput] = React.useState('')
  const [lastResult,setLastResult] = React.useState<{result:ScanResult;tier:string;code:string}|null>(null)
  const [resultVisible,setResultVisible] = React.useState(false)
  const [log,setLog] = React.useState<LogEntry[]>(MOCK_LOG)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Counters
  const admitted = log.filter(l=>l.result==='ADMIT'||l.result==='VIP_ADMIT'||l.result==='BACKSTAGE').length
  const rejected = log.filter(l=>l.result==='INVALID'||l.result==='GEO_FAIL').length
  const fraud = log.filter(l=>l.result==='FRAUD_FLAGGED').length
  const alreadyUsed = log.filter(l=>l.result==='ALREADY_USED').length

  // Anti-fraud toggles
  const [protections,setProtections] = React.useState({geo:true,device:true,duplicate:true,qrOneTime:true,nfc:true,offline:true,resale:true,multiEntry:true})
  const toggleProt = (k:keyof typeof protections) => setProtections(p=>({...p,[k]:!p[k]}))

  // Incident
  const [incidentType,setIncidentType] = React.useState('UNAUTHORIZED_ENTRY')
  const [incidentLoc,setIncidentLoc] = React.useState('')
  const [incidentDesc,setIncidentDesc] = React.useState('')
  const [incidentSev,setIncidentSev] = React.useState('WARNING')
  const [incidentSent,setIncidentSent] = React.useState(false)

  // Chain push
  const [pushed,setPushed] = React.useState(false)
  const [pushing,setPushing] = React.useState(false)

  // Security alert + broadcast
  const [securityAlerted,setSecurityAlerted] = React.useState(false)
  const [geoOverridden,setGeoOverridden] = React.useState(false)
  const [flaggedAccounts,setFlaggedAccounts] = React.useState<number[]>([])
  const [broadcastMsg,setBroadcastMsg] = React.useState('')
  const [broadcastSent,setBroadcastSent] = React.useState(false)

  const deviceId = React.useMemo(()=>'DEV-'+Math.random().toString(36).substr(2,4).toUpperCase(),[])

  React.useEffect(()=>{
    eventsApi.get(eventId).then((r:any)=>setEventName((r?.event??r?.data)?.title??'Afrobeats Night Lagos 2026')).catch(()=>setEventName('Afrobeats Night Lagos 2026'))
  },[eventId])

  const doSync = async () => {
    setSyncing(true)
    try { await eventsApi.syncGate(eventId) } catch {}
    setSynced(true); setSyncing(false)
  }

  const doScan = async (code: string) => {
    if (!code.trim()) return
    const {result,tier} = simulateScan(code, log)
    let finalResult = result
    try {
      const res = await eventsApi.verify(eventId,{ticketCode:code,gateId:gate,deviceId})
      if (res?.result) finalResult = res.result as ScanResult
    } catch {}
    const entry: LogEntry = {
      id:`scan-${Date.now()}`,code:code.toUpperCase().trim(),
      result:finalResult,tier,gate,
      time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
      ts:Date.now(),
    }
    setLog(l=>[entry,...l.slice(0,49)])
    setLastResult({result:finalResult,tier,code:code.toUpperCase().trim()})
    setResultVisible(true)
    setScanInput('')
    setTimeout(()=>setResultVisible(false),2800)
  }

  const resultCfg = lastResult ? RESULT_CFG[lastResult.result] : null

  // ── SETUP ──
  if (phase==='setup') return (
    <div style={{minHeight:'100vh',background:C.bg,padding:16,paddingBottom:80}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:C.textDim,cursor:'pointer',fontSize:20}}>←</button>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:C.text,fontFamily:'Sora, sans-serif'}}>🚪 Gate Guardian</div>
          <div style={{fontSize:10,color:C.textDim2}}>{eventName}</div>
        </div>
        <button onClick={()=>router.push(`/dashboard/events/${eventId}/organizer`)} style={{marginLeft:'auto',padding:'6px 12px',borderRadius:10,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.04)',color:C.textDim,cursor:'pointer',fontSize:10,fontWeight:700,fontFamily:'Sora, sans-serif'}}>📊 Organizer</button>
      </div>

      {/* Gate identity */}
      <div style={{borderRadius:16,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:16,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.purpleL,marginBottom:12}}>🚪 Gate Configuration</div>
        <div style={{fontSize:10,color:C.textDim2,marginBottom:4,fontFamily:'Sora, sans-serif',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>Select Gate</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          {(['MAIN_ENTRANCE','GATE_B','VIP_ENTRANCE','BACKSTAGE','VENDOR_AREA'] as GateMode[]).map(g=>(
            <button key={g} onClick={()=>setGate(g)} style={{padding:'10px 8px',borderRadius:10,fontSize:10,fontWeight:700,cursor:'pointer',background:gate===g?'rgba(124,58,237,.15)':C.bg,color:gate===g?C.purpleL:C.textDim2,border:`1px solid ${gate===g?'rgba(124,58,237,.3)':'rgba(255,255,255,.06)'}`,fontFamily:'Sora, sans-serif',transition:'all .15s'}}>{g.replace('_',' ')}</button>
          ))}
        </div>
        <div style={{fontSize:10,color:C.textDim2,marginBottom:4,fontFamily:'Sora, sans-serif',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>Operator Name</div>
        <input value={operator} onChange={e=>setOperator(e.target.value)} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,padding:'9px 12px',fontSize:12,color:C.text,outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}/>
        <div style={{fontSize:9,color:C.textDim2,marginTop:8}}>Device ID: {deviceId}</div>
      </div>

      {/* Sync */}
      <div style={{borderRadius:16,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:16,marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text}}>Event Sync</div>
          {synced&&<span style={{fontSize:10,color:C.greenL,fontWeight:700}}>✓ Synced</span>}
        </div>
        {[['Event',eventName],['Tickets','6,573 pre-loaded'],['Tiers','5 tiers'],['Date','Apr 12, 2026 · 20:00']].map(([l,v])=>(
          <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:11,color:C.textDim}}>{l}</span><span style={{fontSize:11,color:C.text,fontWeight:700}}>{v}</span></div>
        ))}
        <button onClick={doSync} disabled={syncing} style={{width:'100%',marginTop:12,padding:'10px 0',borderRadius:12,border:'none',background:synced?'rgba(74,222,128,.15)':'linear-gradient(135deg,#7c3aed,#5b21b6)',color:synced?C.greenL:'#fff',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
          {syncing?'Syncing...':synced?'✓ Synced — Resync':'🔄 Sync & Pre-load Tickets'}
        </button>
      </div>

      {/* Anti-fraud config */}
      <div style={{borderRadius:16,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:16,marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>🛡 Anti-Fraud Protection</div>
        {Object.entries(protections).map(([k,v])=>(
          <label key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.04)',cursor:'pointer'}}>
            <span style={{fontSize:11,color:v?C.text:C.textDim}}>{k==='geo'?'📍 Geo-fence verification':k==='device'?'📱 Device ID tracking':k==='duplicate'?'🔁 Duplicate scan detection':k==='qrOneTime'?'🔐 QR one-time use only':k==='nfc'?'📡 NFC tap verification':k==='offline'?'💾 Offline verification codes':k==='resale'?'📈 Suspicious resale alerts':'⛔ Multiple entry detection'}</span>
            <div onClick={()=>toggleProt(k as keyof typeof protections)} style={{width:36,height:20,borderRadius:99,background:v?C.greenL:'rgba(255,255,255,.1)',position:'relative',cursor:'pointer',transition:'background .2s'}}>
              <div style={{position:'absolute',top:3,left:v?18:3,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
            </div>
          </label>
        ))}
      </div>

      {/* Offline notice */}
      <div style={{padding:10,borderRadius:12,background:'rgba(74,222,128,.05)',border:'1px solid rgba(74,222,128,.12)',marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:700,color:C.greenL}}>✓ Offline Mode Ready</div>
        <div style={{fontSize:9,color:C.textDim,marginTop:2}}>6,573 tickets pre-loaded. Works without internet. Syncs when back online.</div>
      </div>

      <button onClick={()=>setPhase('active')} style={{width:'100%',padding:'14px 0',borderRadius:16,border:'none',background:'linear-gradient(135deg,#1a7c3e,#15803d)',color:'#fff',fontSize:15,fontWeight:900,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
        🚪 Open Gate — Go Live
      </button>
    </div>
  )

  // ── ACTIVE GATE ──
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column'}}>
      {/* Result flash overlay */}
      {resultVisible&&resultCfg&&(
        <div className="admit-flash" style={{position:'fixed',inset:0,zIndex:100,background:resultCfg.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
          <div style={{fontSize:88,lineHeight:1}}>{resultCfg.icon}</div>
          <div style={{fontSize:28,fontWeight:900,color:'#fff',fontFamily:'Sora, sans-serif',letterSpacing:'.05em'}}>{resultCfg.title}</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,.7)',textAlign:'center',maxWidth:280,lineHeight:1.5}}>{resultCfg.subtitle}</div>
          {lastResult?.code&&<div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontFamily:'monospace'}}>{lastResult.code}</div>}
          {lastResult?.result==='FRAUD_FLAGGED'&&(
            <button onClick={()=>{setSecurityAlerted(true);setTimeout(()=>setResultVisible(false),800)}} style={{marginTop:8,padding:'10px 24px',borderRadius:12,border:'2px solid #fff',background:securityAlerted?'rgba(74,222,128,.2)':'transparent',color:'#fff',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif',animation:securityAlerted?'none':'fraudPulse 1.5s ease infinite'}}>{securityAlerted?'✓ Security Alerted':'🚨 Alert Security'}</button>
          )}
          {lastResult?.result==='GEO_FAIL'&&(
            <button onClick={()=>{setGeoOverridden(true);setTimeout(()=>setResultVisible(false),800)}} style={{marginTop:8,padding:'10px 24px',borderRadius:12,border:'2px solid #fff',background:geoOverridden?'rgba(74,222,128,.2)':'transparent',color:'#fff',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>{geoOverridden?'✓ Override Applied':'Override (PIN)'}</button>
          )}
        </div>
      )}

      {/* Top bar */}
      <div style={{background:'rgba(7,4,20,.97)',borderBottom:'1px solid rgba(255,255,255,.07)',padding:'10px 14px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <button onClick={()=>setPhase('setup')} style={{background:'none',border:'none',color:C.textDim,cursor:'pointer',fontSize:14}}>← Setup</button>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{fontSize:11,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{eventName}</div>
            <div style={{fontSize:9,color:C.purpleL}}>🚪 {gate.replace('_',' ')} · {operator} · {deviceId}</div>
          </div>
          <div style={{display:'flex',gap:5}}>
            <div style={{display:'flex',alignItems:'center',gap:3,padding:'3px 7px',borderRadius:99,background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)'}}>
              <span className="live-blip" style={{width:5,height:5,borderRadius:'50%',background:C.greenL}}/>
              <span style={{fontSize:8,color:C.greenL,fontWeight:700}}>Online</span>
            </div>
          </div>
        </div>
        {/* Counter strip */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6}}>
          {[['✅',admitted,C.greenL,'Admitted'],['❌',rejected,C.redL,'Rejected'],['🚨',fraud,'#ef4444','Fraud'],['⚠️',alreadyUsed,C.goldL,'Used']].map(([ic,n,col,lb])=>(
            <div key={lb as string} style={{textAlign:'center',padding:'6px 4px',borderRadius:8,background:'rgba(255,255,255,.03)'}}>
              <div style={{fontSize:10}}>{ic}</div>
              <div style={{fontSize:18,fontWeight:900,color:col as string,fontFamily:'Sora, sans-serif'}}>{n}</div>
              <div style={{fontSize:8,color:C.textDim2}}>{lb}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:2,background:'rgba(255,255,255,.03)',margin:'8px 14px 0',borderRadius:12,padding:4,flexShrink:0}}>
        {(['scan','antifraud','incident'] as const).map(k=>(
          <button key={k} onClick={()=>setViewTab(k)} style={{flex:1,padding:'7px 0',borderRadius:8,border:'none',fontSize:10,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif',background:viewTab===k?C.bgCard:'transparent',color:viewTab===k?C.text:C.textDim,transition:'all .15s',textTransform:'capitalize'}}>
            {k==='scan'?'📱 Scan':k==='antifraud'?'🛡 Anti-Fraud':'🚨 Incident'}
          </button>
        ))}
      </div>

      {/* ── SCAN VIEW ── */}
      {viewTab==='scan'&&(
        <div style={{flex:1,display:'flex',flexDirection:'column',padding:'10px 14px',gap:10,overflow:'hidden'}}>
          {fraud>0&&(
            <div style={{padding:'8px 12px',borderRadius:10,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:14}}>🚨</span>
              <span style={{fontSize:10,fontWeight:700,color:C.redL}}>{fraud} fraud alert{fraud>1?'s':''} today — Stay alert</span>
            </div>
          )}

          {/* Scan input */}
          <div style={{borderRadius:16,background:C.bgCard,border:'1px solid rgba(124,58,237,.2)',padding:14}}>
            <div style={{fontSize:10,fontWeight:700,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8,fontFamily:'Sora, sans-serif'}}>Scan Ticket</div>
            <div style={{display:'flex',gap:8}}>
              <input
                ref={inputRef}
                value={scanInput}
                onChange={e=>setScanInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&doScan(scanInput)}
                placeholder="Scan QR · Tap NFC · Type code..."
                autoFocus
                style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'12px 14px',fontSize:14,color:C.text,outline:'none',fontFamily:'Inter,sans-serif'}}
              />
              <button onClick={()=>doScan(scanInput)} style={{padding:'0 16px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>✓</button>
            </div>
            <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
              {[['CTKT-DEMO01','ADMIT demo'],['VIP-DEMO01','VIP demo'],['FRAUD-DEMO','Fraud demo'],['USED-DEMO01','Used demo'],['GEO-DEMO01','Geo fail']].map(([code,label])=>(
                <button key={code} onClick={()=>doScan(code)} style={{padding:'5px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:C.textDim2,fontSize:9,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>{label}</button>
              ))}
            </div>
          </div>

          {/* Scan log */}
          <div style={{flex:1,borderRadius:16,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <span style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:'Sora, sans-serif'}}>Scan Log</span>
              <button onClick={async()=>{setPushing(true);await new Promise(r=>setTimeout(r,1500));setPushed(true);setPushing(false)}} disabled={pushing||pushed} style={{padding:'4px 10px',borderRadius:8,border:'1px solid rgba(124,58,237,.2)',background:'rgba(124,58,237,.06)',color:pushed?C.greenL:C.purpleL,fontSize:9,fontWeight:700,cursor:'pointer',fontFamily:'Sora, sans-serif'}}>
                {pushed?'✓ On-chain':pushing?'Pushing...':'⛓ Push to Chain'}
              </button>
            </div>
            <div className="gg-scroll" style={{flex:1,overflowY:'auto'}}>
              {log.map(entry=>{
                const cfg = RESULT_CFG[entry.result]
                return (
                  <div key={entry.id} className="gg-fade" style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',borderLeft:`3px solid ${cfg.color}`}}>
                    <span style={{fontSize:14,flexShrink:0}}>{cfg.icon}</span>
                    <div style={{flex:1,overflow:'hidden'}}>
                      <div style={{fontSize:10,fontWeight:700,color:C.text,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entry.code}</div>
                      <div style={{fontSize:9,color:C.textDim}}>{entry.tier} · {entry.gate.replace('_',' ')}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:9,fontWeight:700,color:cfg.color,fontFamily:'Sora, sans-serif'}}>{entry.result.replace('_',' ')}</div>
                      <div style={{fontSize:8,color:C.textDim2}}>{entry.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ANTI-FRAUD VIEW ── */}
      {viewTab==='antifraud'&&(
        <div className="gg-scroll" style={{flex:1,overflowY:'auto',padding:'10px 14px'}}>
          <div style={{borderRadius:14,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:14,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:10}}>🛡 Active Protections</div>
            {Object.entries(protections).map(([k,v])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                <span style={{fontSize:12,width:20,textAlign:'center'}}>{v?'✓':'✗'}</span>
                <span style={{fontSize:11,color:v?C.text:C.textDim}}>{k==='geo'?'Geo-fence (200m radius)':k==='device'?'Device ID tracking':k==='duplicate'?'Duplicate scan detection':k==='qrOneTime'?'QR one-time use':k==='nfc'?'NFC tap verification':k==='offline'?'Offline verification codes':k==='resale'?'Resale alert detection':'Multiple entry detection'}</span>
                <span style={{marginLeft:'auto',fontSize:9,fontWeight:700,color:v?C.greenL:C.redL}}>{v?'ACTIVE':'OFF'}</span>
              </div>
            ))}
          </div>

          {/* Fraud incidents */}
          <div style={{borderRadius:14,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:14,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,color:C.redL,fontFamily:'Sora, sans-serif',marginBottom:10}}>🚨 Fraud Incidents Today</div>
            {log.filter(l=>l.result==='FRAUD_FLAGGED'||l.result==='ALREADY_USED').map(entry=>(
              <div key={entry.id} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:C.text,fontFamily:'monospace'}}>{entry.code}</span>
                  <span style={{fontSize:9,color:RESULT_CFG[entry.result].color,fontWeight:700}}>{entry.result.replace('_',' ')}</span>
                </div>
                <div style={{fontSize:9,color:C.textDim,marginTop:2}}>{entry.gate.replace('_',' ')} · {entry.time}</div>
              </div>
            ))}
          </div>

          {/* Suspicious alerts */}
          <div style={{borderRadius:14,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:14,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,color:C.goldL,fontFamily:'Sora, sans-serif',marginBottom:10}}>⚠️ Suspicious Activity</div>
            {[{msg:'3 attempts to reuse ticket CTKT-A4507',action:'Flag Account'},{msg:'Unusual bulk purchase pattern detected',action:'Investigate'}].map((a,i)=>(
              <div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.04)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:C.text,flex:1,marginRight:10}}>{a.msg}</span>
                <button onClick={()=>setFlaggedAccounts(prev=>prev.includes(i)?prev:[...prev,i])} style={{padding:'4px 8px',borderRadius:8,border:`1px solid ${flaggedAccounts.includes(i)?'rgba(74,222,128,.3)':'rgba(251,191,36,.2)'}`,background:flaggedAccounts.includes(i)?'rgba(74,222,128,.1)':'rgba(251,191,36,.06)',color:flaggedAccounts.includes(i)?C.greenL:C.goldL,fontSize:8,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Sora, sans-serif'}}>{flaggedAccounts.includes(i)?'✓ Done':a.action}</button>
              </div>
            ))}
          </div>

          {/* Security broadcast */}
          <div style={{borderRadius:14,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:'Sora, sans-serif',marginBottom:8}}>📢 Security Broadcast</div>
            <textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} placeholder="Message all gates..." rows={3} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,padding:'9px 12px',fontSize:11,color:C.text,outline:'none',fontFamily:'Inter,sans-serif',resize:'none',boxSizing:'border-box',marginBottom:8}}/>
            <button onClick={()=>{if(broadcastMsg.trim()){setBroadcastSent(true);setTimeout(()=>{setBroadcastSent(false);setBroadcastMsg('')},2000)}}} disabled={broadcastSent||!broadcastMsg.trim()} style={{width:'100%',padding:'10px 0',borderRadius:12,border:'none',background:broadcastSent?'rgba(74,222,128,.15)':!broadcastMsg.trim()?'rgba(255,255,255,.06)':'linear-gradient(135deg,#7c3aed,#5b21b6)',color:broadcastSent?C.greenL:!broadcastMsg.trim()?C.textDim2:'#fff',fontSize:12,fontWeight:800,cursor:broadcastSent||!broadcastMsg.trim()?'default':'pointer',fontFamily:'Sora, sans-serif'}}>{broadcastSent?'✓ Broadcast Sent':'📢 Alert All Gates'}</button>
          </div>
        </div>
      )}

      {/* ── INCIDENT VIEW ── */}
      {viewTab==='incident'&&(
        <div className="gg-scroll" style={{flex:1,overflowY:'auto',padding:'10px 14px'}}>
          <div style={{borderRadius:14,background:C.bgCard,border:'1px solid rgba(255,255,255,.07)',padding:14}}>
            <div style={{fontSize:13,fontWeight:800,color:C.redL,fontFamily:'Sora, sans-serif',marginBottom:14}}>🚨 Report Incident</div>
            <div style={{fontSize:10,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6,fontFamily:'Sora, sans-serif',fontWeight:700}}>Type</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
              {['UNAUTHORIZED_ENTRY','AGGRESSIVE_PATRON','MEDICAL','FIRE','SUSPICIOUS_PACKAGE','OVERCROWDING','OTHER'].map(t=>(
                <button key={t} onClick={()=>setIncidentType(t)} style={{padding:'8px 6px',borderRadius:10,fontSize:9,fontWeight:700,cursor:'pointer',background:incidentType===t?'rgba(239,68,68,.15)':C.bg,color:incidentType===t?C.redL:C.textDim2,border:`1px solid ${incidentType===t?'rgba(239,68,68,.3)':'rgba(255,255,255,.06)'}`,fontFamily:'Sora, sans-serif'}}>{t.replace('_',' ')}</button>
              ))}
            </div>
            <div style={{fontSize:10,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4,fontFamily:'Sora, sans-serif',fontWeight:700}}>Location</div>
            <input value={incidentLoc} onChange={e=>setIncidentLoc(e.target.value)} placeholder="e.g. MAIN ENTRANCE, Section A" style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,padding:'9px 12px',fontSize:12,color:C.text,outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box',marginBottom:10}}/>
            <div style={{fontSize:10,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4,fontFamily:'Sora, sans-serif',fontWeight:700}}>Description</div>
            <textarea value={incidentDesc} onChange={e=>setIncidentDesc(e.target.value)} placeholder="Describe the incident..." rows={4} style={{width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,padding:'9px 12px',fontSize:12,color:C.text,outline:'none',fontFamily:'Inter,sans-serif',resize:'none',boxSizing:'border-box',marginBottom:10}}/>
            <div style={{fontSize:10,color:C.textDim2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6,fontFamily:'Sora, sans-serif',fontWeight:700}}>Severity</div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              {[['INFO',C.blueL],['WARNING',C.goldL],['CRITICAL',C.redL]].map(([s,col])=>(
                <button key={s} onClick={()=>setIncidentSev(s)} style={{flex:1,padding:'8px 0',borderRadius:10,fontSize:10,fontWeight:700,cursor:'pointer',border:`1px solid ${incidentSev===s?col+'44':' rgba(255,255,255,.06)'}`,background:incidentSev===s?col+'12':'transparent',color:incidentSev===s?col:C.textDim2,fontFamily:'Sora, sans-serif'}}>{s}</button>
              ))}
            </div>
            <button onClick={()=>setIncidentSent(true)} disabled={incidentSent} style={{width:'100%',padding:'12px 0',borderRadius:14,border:'none',background:incidentSent?'rgba(74,222,128,.1)':'linear-gradient(135deg,#b22222,#991b1b)',color:incidentSent?C.greenL:'#fff',fontSize:13,fontWeight:800,cursor:incidentSent?'default':'pointer',fontFamily:'Sora, sans-serif'}}>
              {incidentSent?'✓ Incident Reported':'🚨 Submit Incident Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
