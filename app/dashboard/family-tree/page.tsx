'use client'
import * as React from 'react'
import Link from 'next/link'
import { KINSHIP_CATS, KINSHIP_OPTIONS, TIER_COLORS, TIER_LABELS, type KinshipOption } from '@/constants/family-kinship'

type VerifStatus = 'verified' | 'pending' | 'deceased' | 'self'
interface TreeNode {
  id: string; x: number; y: number; label: string; firstName: string
  rel: string; af: string; emoji: string; tier: 0|1|2|3; status: VerifStatus
  generation: 0|1|2|3; phone?: string; afroId?: string; birthYear?: number; deathYear?: number
  isNew?: boolean
}
interface MarriageLine { a: string; b: string }

// ── Growth stages — the tree evolves as members are added ──
const GROWTH_STAGES = [
  { min: 0,  label: '🌱 Seed',        color: '#6b7280', desc: 'Plant your first kinship'    },
  { min: 1,  label: '🌿 Sprout',      color: '#fbbf24', desc: 'Your tree is sprouting'       },
  { min: 3,  label: '🪴 Sapling',     color: '#4ade80', desc: 'Growing stronger'              },
  { min: 5,  label: '🌳 Young Tree',  color: '#22c55e', desc: 'Roots reaching deep'           },
  { min: 8,  label: '🌳 Strong Tree', color: '#16a34a', desc: 'A pillar in the village'       },
  { min: 12, label: '🏛 Baobab',      color: '#d4a017', desc: 'An ancestral Baobab — eternal' },
]

function getGrowthStage(count: number) {
  let stage = GROWTH_STAGES[0]
  for (const s of GROWTH_STAGES) { if (count >= s.min) stage = s }
  return stage
}

const TREE_CSS = `
@keyframes ft-node-appear{0%{transform:scale(0);opacity:0}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes ft-pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}
@keyframes ft-grow-bar{from{width:0}to{width:var(--target-w)}}
@keyframes ft-leaf-float{0%{opacity:0;transform:translate(0,0) rotate(0deg)}30%{opacity:1}100%{opacity:0;transform:translate(var(--lx),var(--ly)) rotate(var(--lr))}}
.ft-node-new{animation:ft-node-appear .6s cubic-bezier(.34,1.56,.64,1) both}
.ft-pulse-ring{animation:ft-pulse-ring 1.5s ease-out infinite}
.ft-leaf{animation:ft-leaf-float 2s ease-out forwards}
`

const NODES: TreeNode[] = [
  { id:'self', x:190, y:120, label:'Me', firstName:'You', rel:'Self', af:'Ìwọ', emoji:'✦', tier:0, status:'self', generation:2 },
]
const EDGES: [string,string][] = []
const MARRIAGES: MarriageLine[] = []
const STATUS_CFG: Record<VerifStatus,{ color:string; label:string }> = {
  verified: { color:'#4ade80', label:'Verified' },
  pending:  { color:'#fbbf24', label:'Pending'  },
  deceased: { color:'#6b7280', label:'Ancestor' },
  self:     { color:'#d4a017', label:'You'       },
}

function AddSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, phone: string, opt: KinshipOption) => void }) {
  const [step, setStep] = React.useState<'cats'|'opts'|'form'>('cats')
  const [catId, setCatId] = React.useState<string|null>(null)
  const [opt, setOpt]     = React.useState<KinshipOption|null>(null)
  const [name, setName]   = React.useState('')
  const [phone, setPhone] = React.useState('')
  const cat = KINSHIP_CATS.find(c => c.id === catId)
  const opts = catId ? (KINSHIP_OPTIONS[catId] ?? []) : []
  return (
    <div style={{ position:'fixed',inset:0,zIndex:60,background:'rgba(0,0,0,.72)',display:'flex',alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%',background:'#0a1a0e',borderRadius:'20px 20px 0 0',padding:'20px 20px 32px',maxHeight:'80vh',overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:36,height:4,borderRadius:2,background:'rgba(255,255,255,.2)',margin:'0 auto 20px' }} />
        <div style={{ fontFamily:'Sora, sans-serif',fontSize:17,fontWeight:900,color:'#f0f7f0',marginBottom:16 }}>
          {step==='cats'?'Add Family Member':step==='opts'?(cat?.label??''):(opt?.en??'')}
        </div>
        {step==='cats' && (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {KINSHIP_CATS.map(c=>(
              <button key={c.id} onClick={()=>{setCatId(c.id);setStep('opts')}}
                style={{ padding:'14px 10px',borderRadius:14,border:`1.5px solid ${c.color}33`,background:`${c.color}08`,display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer' }}>
                <span style={{ fontSize:22 }}>{c.emoji}</span>
                <span style={{ fontSize:12,fontWeight:700,color:'#f0f7f0' }}>{c.label}</span>
              </button>
            ))}
          </div>
        )}
        {step==='opts' && (
          <>
            <button onClick={()=>setStep('cats')} style={{ background:'none',border:'none',color:'rgba(240,247,240,.5)',fontSize:12,cursor:'pointer',marginBottom:12,padding:0 }}>← Back</button>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {opts.map(o=>(
                <button key={o.type} onClick={()=>{setOpt(o);setStep('form')}}
                  style={{ padding:'12px 14px',borderRadius:14,border:`1.5px solid ${cat?.color??'#1a7c3e'}33`,background:'rgba(255,255,255,.03)',display:'flex',alignItems:'center',gap:12,cursor:'pointer',textAlign:'left' }}>
                  <span style={{ fontSize:20 }}>{o.emoji}</span>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:'#f0f7f0' }}>{o.en}</div>
                    <div style={{ fontSize:10,color:cat?.color??'#4ade80',fontWeight:600 }}>{o.af}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {step==='form' && opt && (
          <>
            <button onClick={()=>setStep('opts')} style={{ background:'none',border:'none',color:'rgba(240,247,240,.5)',fontSize:12,cursor:'pointer',marginBottom:12,padding:0 }}>← Change</button>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:9,fontWeight:800,color:'rgba(240,247,240,.5)',textTransform:'uppercase',letterSpacing:'.1em',display:'block',marginBottom:5 }}>Full Name *</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Amara Okafor" autoFocus
                style={{ width:'100%',padding:'11px 14px',borderRadius:12,background:'rgba(255,255,255,.05)',border:`1.5px solid ${name?'#4ade8066':'rgba(255,255,255,.12)'}`,color:'#f0f7f0',fontSize:14,outline:'none',boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:9,fontWeight:800,color:'rgba(240,247,240,.5)',textTransform:'uppercase',letterSpacing:'.1em',display:'block',marginBottom:5 }}>Phone Number *</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+234 800 000 0000"
                style={{ width:'100%',padding:'11px 14px',borderRadius:12,background:'rgba(255,255,255,.05)',border:`1.5px solid ${phone.length>=7?'#4ade8066':'rgba(255,255,255,.12)'}`,color:'#f0f7f0',fontSize:14,outline:'none',boxSizing:'border-box' }} />
            </div>
            <button onClick={() => { if(name.trim()&&phone.length>=7&&opt){ onAdd(name.trim(),phone,opt); onClose() } }} disabled={!name.trim()||phone.length<7} style={{ width:'100%',padding:'13px 0',borderRadius:14,background:name.trim()&&phone.length>=7?'linear-gradient(135deg,#1a7c3e,#145f30)':'rgba(255,255,255,.08)',border:'none',color:name.trim()&&phone.length>=7?'#fff':'rgba(255,255,255,.3)',fontSize:14,fontWeight:800,cursor:name.trim()&&phone.length>=7?'pointer':'not-allowed' }}>
              🌳 Add to Kinship Circle
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Edit Sheet ────────────────────────────────────────────────────
function EditSheet({ node, onClose, onSave }: { node: TreeNode; onClose: () => void; onSave: (id: string, name: string, phone: string, year: string) => void }) {
  const [name,  setName]  = React.useState(node.label)
  const [phone, setPhone] = React.useState(node.phone ?? '')
  const [year,  setYear]  = React.useState(node.birthYear ? String(node.birthYear) : '')
  const [saved, setSaved] = React.useState(false)
  const handleSave = () => {
    if (!name.trim()) return
    setSaved(true)
    setTimeout(() => { onSave(node.id, name.trim(), phone, year); onClose() }, 900)
  }
  return (
    <div style={{ position:'fixed',inset:0,zIndex:70,background:'rgba(0,0,0,.72)',display:'flex',alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%',background:'#0a1a0e',borderRadius:'20px 20px 0 0',padding:'20px 20px 36px' }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:36,height:4,borderRadius:2,background:'rgba(255,255,255,.2)',margin:'0 auto 18px' }} />
        <div style={{ fontFamily:'Sora, sans-serif',fontSize:16,fontWeight:900,color:'#f0f7f0',marginBottom:6 }}>✏️ Update Member Details</div>
        <div style={{ fontSize:11,color:'rgba(240,247,240,.4)',marginBottom:20 }}>{node.rel} · {node.af}</div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:9,fontWeight:800,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',display:'block',marginBottom:5 }}>Full Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Chief Adewale Jnr"
            style={{ width:'100%',padding:'11px 14px',borderRadius:12,background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.12)',color:'#f0f7f0',fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'inherit' }} />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:9,fontWeight:800,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',display:'block',marginBottom:5 }}>Phone Number</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+234 800 000 0000"
            style={{ width:'100%',padding:'11px 14px',borderRadius:12,background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.12)',color:'#f0f7f0',fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'inherit' }} />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:9,fontWeight:800,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',display:'block',marginBottom:5 }}>Birth Year</label>
          <input value={year} onChange={e=>setYear(e.target.value)} placeholder="e.g. 1965"
            style={{ width:'100%',padding:'11px 14px',borderRadius:12,background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.12)',color:'#f0f7f0',fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'inherit' }} />
        </div>
        <button onClick={handleSave} disabled={!name.trim()}
          style={{ width:'100%',padding:'13px 0',borderRadius:14,border:'none',fontSize:14,fontWeight:800,cursor:name.trim()?'pointer':'not-allowed',background:saved?'#145f30':'linear-gradient(135deg,#1a7c3e,#145f30)',color:'#fff',opacity:name.trim()?1:0.4,transition:'all .3s' }}>
          {saved?'✅ Saved!':'💾 Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default function FamilyTreePage() {
  const [tab,    setTab]    = React.useState<'TREE'|'LIST'|'QUORUM'|'GROWTH'>('TREE')
  const [selId,  setSelId]  = React.useState<string|null>(null)
  const [showAdd,setShowAdd]= React.useState(false)
  const [showEdit,setShowEdit]= React.useState(false)
  const [bcSent, setBcSent] = React.useState<string|null>(null)
  const [addedToast, setAddedToast] = React.useState<string|null>(null)
  const [dynamicNodes, setDynamicNodes] = React.useState<TreeNode[]>([])
  const [celebLeaves, setCelebLeaves] = React.useState<{ id: number; lx: number; ly: number; lr: number }[]>([])

  // Inject CSS
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('ft-tree-css')) {
      const s = document.createElement('style')
      s.id = 'ft-tree-css'
      s.textContent = TREE_CSS
      document.head.appendChild(s)
    }
  }, [])

  // Load dynamic members from localStorage
  React.useEffect(() => {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem('afk_family_members')
    if (!raw) return
    try {
      const arr = JSON.parse(raw)
      if (!Array.isArray(arr)) return
      const newNodes: TreeNode[] = arr.map((m: any, i: number) => ({
        id: `dyn_${m.id || i}`,
        x: 80 + (i % 4) * 85,
        y: 220 + Math.floor(i / 4) * 90,
        label: m.name || m.fullName || 'Unknown',
        firstName: (m.name || m.fullName || 'Unknown').split(' ')[0],
        rel: m.en || m.kinshipType || 'Kin',
        af: m.af || m.localName || '',
        emoji: m.emoji || '🧑',
        tier: (m.kinshipTier || 1) as 0|1|2|3,
        status: 'pending' as VerifStatus,
        generation: 3 as 0|1|2|3,
        isNew: true,
      }))
      setDynamicNodes(newNodes)
    } catch {}
  }, [addedToast]) // Re-read after adding

  const handleAdd = (name: string, phone: string, opt: KinshipOption) => {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('afk_family_members') : '[]'
    const existing = JSON.parse(raw ?? '[]')
    existing.push({ id: Date.now().toString(), name, kinshipType: opt.type, kinshipTier: opt.tier, en: opt.en, af: opt.af, phone, emoji: opt.emoji, verificationStatus: 'PENDING', addedAt: new Date().toISOString() })
    if (typeof localStorage !== 'undefined') localStorage.setItem('afk_family_members', JSON.stringify(existing))
    setAddedToast(`${opt.emoji} ${name} added as ${opt.en}`)
    // Celebration leaves
    const leaves = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      lx: (Math.random() - 0.5) * 120,
      ly: -(40 + Math.random() * 60),
      lr: (Math.random() - 0.5) * 360,
    }))
    setCelebLeaves(leaves)
    setTimeout(() => setCelebLeaves([]), 2500)
    setTimeout(() => setAddedToast(null), 3000)
  }

  const handleEditSave = (_id: string, name: string, phone: string, _year: string) => {
    setAddedToast(`✏️ ${name} updated${phone ? ' · ' + phone : ''}`)
    setTimeout(() => setAddedToast(null), 3000)
  }

  const allNodes = React.useMemo(() => [...NODES, ...dynamicNodes], [dynamicNodes])
  const nodeMap  = React.useMemo(()=>Object.fromEntries(allNodes.map(n=>[n.id,n])),[allNodes])
  const selNode  = selId ? nodeMap[selId] : null
  const verified = allNodes.filter(n=>n.status==='verified').length
  const t1Nodes  = allNodes.filter(n=>n.tier===1&&n.status!=='self')
  const t1Ver    = t1Nodes.filter(n=>n.status==='verified')
  const totalMembers = allNodes.length - 1 // exclude self
  const growthStage = getGrowthStage(totalMembers)
  const svgHeight = 280 + Math.ceil(dynamicNodes.length / 4) * 90

  const fireBloodCall = (id:string)=>{ setBcSent(id); setTimeout(()=>setBcSent(null),2500) }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'#050a06',position:'relative' }}>

      {/* Header */}
      <div style={{ padding:'14px 16px 10px',borderBottom:'1px solid rgba(255,255,255,.07)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
          <div>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:17,fontWeight:900,color:'#f0f7f0' }}>🌳 Ancestor Tree</div>
            <div style={{ fontSize:10,color:'rgba(240,247,240,.45)',marginTop:1 }}>{totalMembers} members · {verified} verified</div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{ padding:'7px 14px',borderRadius:10,background:'linear-gradient(135deg,#1a7c3e,#145f30)',border:'none',color:'#fff',fontSize:12,fontWeight:800,cursor:'pointer' }}>+ Add</button>
        </div>

        {/* Growth Stage Indicator */}
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8,padding:'8px 10px',borderRadius:12,background:`${growthStage.color}08`,border:`1px solid ${growthStage.color}25` }}>
          <span style={{ fontSize:22 }}>{growthStage.label.split(' ')[0]}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12,fontWeight:800,color:growthStage.color }}>{growthStage.label.split(' ').slice(1).join(' ')}</div>
            <div style={{ fontSize:10,color:'rgba(255,255,255,.4)' }}>{growthStage.desc}</div>
          </div>
          <div style={{ fontSize:16,fontWeight:900,color:growthStage.color,fontFamily:'Sora, sans-serif' }}>{totalMembers}</div>
        </div>

        {/* Growth progress bar */}
        <div style={{ height:6,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden',marginBottom:8 }}>
          <div style={{ height:'100%',borderRadius:99,background:`linear-gradient(to right, #6b7280, ${growthStage.color})`,width:`${Math.min(100,(totalMembers/12)*100)}%`,transition:'width .8s cubic-bezier(.34,1.56,.64,1)' }} />
        </div>

        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ fontSize:9,fontWeight:800,color:t1Ver.length>=2?'#4ade80':'#fbbf24',whiteSpace:'nowrap' }}>
            {t1Ver.length>=2?'🛡 Recovery Ready':'⚠ Quorum Low'}
          </div>
          <div style={{ flex:1,height:4,background:'rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden' }}>
            <div style={{ width:`${Math.min(100,(t1Ver.length/Math.max(2,t1Nodes.length))*100)}%`,height:'100%',background:t1Ver.length>=2?'linear-gradient(to right,#1a7c3e,#4ade80)':'linear-gradient(to right,#92400e,#fbbf24)',borderRadius:4,transition:'width .5s' }} />
          </div>
          <div style={{ fontSize:9,color:'rgba(255,255,255,.4)',whiteSpace:'nowrap' }}>{t1Ver.length}/{t1Nodes.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:'1px solid rgba(255,255,255,.07)' }}>
        {(['TREE','LIST','GROWTH','QUORUM'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:'10px 0',fontSize:10,fontWeight:800,background:'none',border:'none',borderBottom:`2px solid ${tab===t?'#4ade80':'transparent'}`,color:tab===t?'#4ade80':'rgba(255,255,255,.4)',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.06em',transition:'all .2s' }}>
            {t==='TREE'?'🌳 Tree':t==='LIST'?'📋 List':t==='GROWTH'?'📈 Growth':'🛡 Quorum'}
          </button>
        ))}
      </div>

      {/* TREE TAB */}
      {tab==='TREE' && (
        <div style={{ flex:1,overflowY:'auto',position:'relative' }}>
          {/* Empty state — encourage user to add family */}
          {dynamicNodes.length === 0 && (
            <div style={{ textAlign:'center',padding:'24px 20px 0' }}>
              <div style={{ fontSize:13,color:'rgba(255,255,255,.45)',lineHeight:1.7 }}>
                Your family tree is waiting for its first branch.<br/>
                Tap <strong style={{ color:'#4ade80' }}>+ Add</strong> to plant your kinship roots.
              </div>
            </div>
          )}
          {/* Celebration leaves burst */}
          {celebLeaves.length > 0 && (
            <div style={{ position:'fixed',top:'40%',left:'50%',zIndex:200,pointerEvents:'none' }}>
              {celebLeaves.map(leaf=>(
                <div key={leaf.id} className="ft-leaf" style={{
                  position:'absolute', fontSize:20,
                  '--lx':`${leaf.lx}px`, '--ly':`${leaf.ly}px`, '--lr':`${leaf.lr}deg`,
                } as React.CSSProperties}>🍃</div>
              ))}
            </div>
          )}
          <svg viewBox={`0 0 380 ${svgHeight}`} width="100%" style={{ display:'block',minHeight:440 }}>
            {/* Marriage lines */}
            {MARRIAGES.map(({a,b})=>{
              const na=nodeMap[a]; const nb=nodeMap[b]; if(!na||!nb) return null
              return (
                <g key={`m${a}${b}`}>
                  <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(255,255,255,.18)" strokeWidth={1.2} />
                  <circle cx={(na.x+nb.x)/2} cy={na.y} r={3} fill="rgba(212,160,23,.45)" />
                </g>
              )
            })}
            {/* Dynamic node connectors — link to 'self' */}
            {dynamicNodes.map(node=>{
              const selfNode=nodeMap['self']
              if(!selfNode) return null
              const mid=(selfNode.y+node.y)/2
              const d=`M ${selfNode.x},${selfNode.y+22} C ${selfNode.x},${mid} ${node.x},${mid} ${node.x},${node.y-18}`
              return <path key={`dynEdge${node.id}`} d={d} stroke="rgba(212,160,23,.18)" strokeWidth={1.2} fill="none" strokeDasharray="4 3" />
            })}
            {/* Parent–child bezier paths */}
            {EDGES.map(([from,to])=>{
              const pn=nodeMap[from]; const cn=nodeMap[to]; if(!pn||!cn) return null
              const mid=(pn.y+cn.y)/2
              const d=`M ${pn.x},${pn.y+20} C ${pn.x},${mid} ${cn.x},${mid} ${cn.x},${cn.y-20}`
              const lit=(pn.status==='verified'||pn.status==='self')&&(cn.status==='verified'||cn.status==='self')
              return <path key={`e${from}${to}`} d={d} stroke={lit?'rgba(74,222,128,.35)':'rgba(255,255,255,.1)'} strokeWidth={1.5} fill="none" strokeDasharray={lit?'0':'5 4'} />
            })}
            {/* Static nodes */}
            {NODES.map(node=>{
              const cfg=STATUS_CFG[node.status]
              const r=node.status==='self'?22:18
              const isDead=node.status==='deceased'
              const isSel=selId===node.id
              return (
                <g key={node.id} onClick={()=>node.status!=='self'&&setSelId(selId===node.id?null:node.id)} style={{ cursor:node.status==='self'?'default':'pointer' }}>
                  {cfg.color!=='#6b7280'&&<circle cx={node.x} cy={node.y} r={r+5} fill={cfg.color+'10'} stroke={cfg.color+'28'} strokeWidth={1} />}
                  {isSel&&<circle cx={node.x} cy={node.y} r={r+8} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />}
                  <circle cx={node.x} cy={node.y} r={r} fill={isDead?'#1a1a1a':cfg.color+'18'} stroke={cfg.color} strokeWidth={isSel?2.5:1.8} opacity={isDead?0.65:1} />
                  {node.status==='self'
                    ? <text x={node.x} y={node.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#d4a017" fontWeight="bold">✦</text>
                    : <text x={node.x} y={node.y+1} textAnchor="middle" dominantBaseline="middle" fontSize={isDead?'11':'13'} opacity={isDead?0.5:1}>{node.emoji}</text>}
                  {isDead&&<text x={node.x+r-2} y={node.y-r+2} textAnchor="middle" dominantBaseline="middle" fontSize="7">🕊</text>}
                  {node.afroId&&node.status!=='self'&&<>
                    <circle cx={node.x+r-2} cy={node.y+r-2} r={5} fill="#4ade80" />
                    <text x={node.x+r-2} y={node.y+r-1} textAnchor="middle" dominantBaseline="middle" fontSize="5" fill="#050a06" fontWeight="bold">V</text>
                  </>}
                  <text x={node.x} y={node.y+r+10} textAnchor="middle" dominantBaseline="hanging" fontSize="7.5" fill={isDead?'#6b7280':'#f0f7f0'} fontWeight={isSel?'800':'600'} style={{ fontFamily:'Sora, sans-serif' }}>{node.firstName}</text>
                </g>
              )
            })}
            {/* Dynamic nodes — newly added members */}
            {dynamicNodes.map((node, idx)=>{
              const cfg=STATUS_CFG[node.status]
              const r=16
              const isSel=selId===node.id
              return (
                <g key={node.id} className="ft-node-new" style={{ animationDelay:`${idx*0.12}s` }}
                  onClick={()=>setSelId(selId===node.id?null:node.id)}>
                  {/* Pulse ring for new nodes */}
                  <circle cx={node.x} cy={node.y} r={r+8} fill="none" stroke="#fbbf24" strokeWidth={1}
                    opacity={0.4} className="ft-pulse-ring" />
                  <circle cx={node.x} cy={node.y} r={r+5} fill="#fbbf2408" stroke="#fbbf2428" strokeWidth={1} />
                  {isSel&&<circle cx={node.x} cy={node.y} r={r+9} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />}
                  <circle cx={node.x} cy={node.y} r={r} fill={cfg.color+'14'} stroke={cfg.color} strokeWidth={isSel?2.5:1.8} />
                  <text x={node.x} y={node.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="13">{node.emoji}</text>
                  {/* NEW badge */}
                  <rect x={node.x+r-10} y={node.y-r-8} width={18} height={10} rx={5} fill="#d4a017" />
                  <text x={node.x+r-1} y={node.y-r-3} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#050a06" fontWeight="800">NEW</text>
                  <text x={node.x} y={node.y+r+10} textAnchor="middle" dominantBaseline="hanging" fontSize="7.5" fill="#fbbf24" fontWeight="700" style={{ fontFamily:'Sora, sans-serif' }}>{node.firstName}</text>
                </g>
              )
            })}
            {/* "Add member" slot — always visible at the bottom */}
            <g onClick={()=>setShowAdd(true)} style={{ cursor:'pointer' }}>
              <circle cx={190} cy={svgHeight-40} r={22} fill="rgba(26,124,62,.06)" stroke="rgba(26,124,62,.3)" strokeWidth={1.5} strokeDasharray="5 4" />
              <text x={190} y={svgHeight-40} textAnchor="middle" dominantBaseline="middle" fontSize="18" opacity={0.5}>+</text>
              <text x={190} y={svgHeight-14} textAnchor="middle" dominantBaseline="hanging" fontSize="7" fill="rgba(74,222,128,.5)" fontWeight="700" style={{ fontFamily:'Sora, sans-serif' }}>Add Member</text>
            </g>
          </svg>
          {/* Legend */}
          <div style={{ display:'flex',gap:14,padding:'4px 16px 16px',flexWrap:'wrap' }}>
            {[{c:'#4ade80',l:'Verified'},{c:'#fbbf24',l:'Pending / New'},{c:'#6b7280',l:'Ancestor'},{c:'#d4a017',l:'You'}].map(({c,l})=>(
              <div key={l} style={{ display:'flex',alignItems:'center',gap:5 }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:c,boxShadow:c==='#4ade80'?`0 0 5px ${c}55`:undefined }} />
                <span style={{ fontSize:9,color:'rgba(255,255,255,.4)',fontWeight:600 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIST TAB */}
      {tab==='LIST' && (
        <div style={{ flex:1,overflowY:'auto' }}>
          {allNodes.filter(n=>n.status!=='self').map(n=>{
            const cfg=STATUS_CFG[n.status]
            return (
              <div key={n.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,.05)',opacity:n.status==='deceased'?0.65:1 }}>
                <div style={{ width:44,height:44,borderRadius:13,background:n.status==='deceased'?'#1a1a1a':cfg.color+'18',border:`2px solid ${cfg.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,filter:n.status==='deceased'?'grayscale(1)':'none' }}>{n.emoji}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                    <span style={{ fontSize:14,fontWeight:800,color:'#f0f7f0' }}>{n.label}</span>
                    {n.afroId&&<span style={{ width:8,height:8,borderRadius:'50%',background:'#4ade80',display:'inline-block',flexShrink:0 }} />}
                  </div>
                  <div style={{ fontSize:10,color:(n.tier===1||n.tier===2||n.tier===3)?TIER_COLORS[n.tier]:'#888',fontWeight:700,marginTop:2 }}>{n.rel} <span style={{ color:'rgba(255,255,255,.35)',fontStyle:'italic',fontWeight:400 }}>{n.af}</span></div>
                  <div style={{ fontSize:9,color:'rgba(255,255,255,.3)',marginTop:1 }}>{n.status==='deceased'&&n.birthYear?`${n.birthYear}–${n.deathYear??'?'} · `:''}
                    {(n.tier===1||n.tier===2||n.tier===3)?TIER_LABELS[n.tier]:''}</div>
                </div>
                <div style={{ padding:'3px 9px',borderRadius:99,background:cfg.color+'18',border:`1px solid ${cfg.color}33`,fontSize:9,fontWeight:800,color:cfg.color,whiteSpace:'nowrap' }}>
                  {n.status==='deceased'?'🕊 Ancestor':cfg.label}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* GROWTH TAB */}
      {tab==='GROWTH' && (
        <div style={{ flex:1,overflowY:'auto',padding:16 }}>

          {/* Current stage hero */}
          <div style={{ textAlign:'center',padding:'24px 0 20px',borderBottom:'1px solid rgba(255,255,255,.06)',marginBottom:20 }}>
            <div style={{ fontSize:56,marginBottom:8,lineHeight:1 }}>{growthStage.label.split(' ')[0]}</div>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:20,fontWeight:900,color:growthStage.color,marginBottom:4 }}>
              {growthStage.label.split(' ').slice(1).join(' ')}
            </div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,.5)',marginBottom:12 }}>{growthStage.desc}</div>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:36,fontWeight:900,color:'#f0f7f0',lineHeight:1 }}>
              {totalMembers} <span style={{ fontSize:14,color:'rgba(255,255,255,.4)',fontWeight:500 }}>members</span>
            </div>
          </div>

          {/* Journey timeline — each growth stage */}
          <div style={{ fontSize:11,fontWeight:800,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12 }}>
            Ancestral Journey
          </div>
          <div style={{ position:'relative',padding:'0 0 0 28px' }}>
            {/* Vertical spine */}
            <div style={{ position:'absolute',left:11,top:14,bottom:14,width:2,background:'rgba(255,255,255,.07)',borderRadius:2 }} />
            {GROWTH_STAGES.map((stage, idx) => {
              const reached = totalMembers >= stage.min
              const isCurrent = growthStage.min === stage.min
              const nextMin = GROWTH_STAGES[idx + 1]?.min ?? Infinity
              const countInStage = Math.min(
                Math.max(0, totalMembers - stage.min),
                nextMin - stage.min
              )
              const progress = nextMin === Infinity ? 1 : countInStage / (nextMin - stage.min)
              return (
                <div key={stage.min} style={{ marginBottom:20,position:'relative' }}>
                  {/* Stage dot on spine */}
                  <div style={{
                    position:'absolute',left:-28,top:10,width:22,height:22,borderRadius:'50%',
                    background:reached?stage.color:'rgba(255,255,255,.06)',
                    border:`2px solid ${reached?stage.color:'rgba(255,255,255,.1)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,
                    boxShadow:isCurrent?`0 0 12px ${stage.color}66`:undefined,
                    transition:'all .4s',
                  }}>
                    {reached ? '✓' : ''}
                  </div>
                  <div style={{
                    padding:'12px 14px',borderRadius:14,
                    background:isCurrent?`${stage.color}08`:'rgba(255,255,255,.02)',
                    border:`1px solid ${isCurrent?stage.color+'25':'rgba(255,255,255,.05)'}`,
                    opacity:reached?1:0.45,
                  }}>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <span style={{ fontSize:18 }}>{stage.label.split(' ')[0]}</span>
                        <div>
                          <div style={{ fontSize:12,fontWeight:800,color:reached?stage.color:'rgba(255,255,255,.4)' }}>
                            {stage.label.split(' ').slice(1).join(' ')}
                          </div>
                          <div style={{ fontSize:10,color:'rgba(255,255,255,.3)' }}>{stage.min}+ members</div>
                        </div>
                      </div>
                      {isCurrent && (
                        <div style={{ fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:99,background:`${stage.color}18`,border:`1px solid ${stage.color}35`,color:stage.color }}>
                          CURRENT
                        </div>
                      )}
                    </div>
                    {isCurrent && nextMin !== Infinity && (
                      <>
                        <div style={{ fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:5 }}>
                          {nextMin - totalMembers} more to reach the next stage
                        </div>
                        <div style={{ height:4,background:'rgba(255,255,255,.06)',borderRadius:4,overflow:'hidden' }}>
                          <div style={{ height:'100%',borderRadius:4,background:stage.color,width:`${Math.min(100,progress*100)}%`,transition:'width .6s' }} />
                        </div>
                      </>
                    )}
                    {isCurrent && nextMin === Infinity && (
                      <div style={{ fontSize:11,color:stage.color,fontWeight:700 }}>
                        ✦ You have reached the highest stage — the eternal Baobab
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Village visibility note */}
          <div style={{ padding:'12px 14px',borderRadius:14,background:'rgba(26,124,62,.06)',border:'1px solid rgba(26,124,62,.2)',marginBottom:16 }}>
            <div style={{ fontSize:11,fontWeight:800,color:'#4ade80',marginBottom:5 }}>🌍 Live for the Village</div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.7 }}>
              Every time a family member is added, your tree grows and the village sees it. Your growth is part of the communal record — an ancestral wall visible to all who are connected to your circle.
            </div>
          </div>

          <button onClick={()=>{setShowAdd(true);setTab('TREE')}} style={{ width:'100%',padding:'14px 0',borderRadius:14,background:'linear-gradient(135deg,#1a7c3e,#145f30)',border:'none',color:'#fff',fontFamily:'Sora, sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 8px 24px rgba(26,124,62,.25)' }}>
            🌱 Grow Your Tree
          </button>
        </div>
      )}

      {/* QUORUM TAB */}
      {tab==='QUORUM' && (
        <div style={{ flex:1,overflowY:'auto',padding:16 }}>
          <div style={{ display:'flex',justifyContent:'center',marginBottom:20 }}>
            <div style={{ position:'relative',width:120,height:120 }}>
              <svg width={120} height={120} style={{ transform:'rotate(-90deg)' }}>
                <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={8} />
                <circle cx={60} cy={60} r={50} fill="none" stroke={t1Ver.length>=2?'#4ade80':t1Ver.length===1?'#fbbf24':'#ef4444'}
                  strokeWidth={8} strokeLinecap="round"
                  strokeDasharray={2*Math.PI*50}
                  strokeDashoffset={2*Math.PI*50*(1-t1Ver.length/Math.max(t1Nodes.length,2))}
                  style={{ transition:'stroke-dashoffset .6s' }} />
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                <span style={{ fontFamily:'Sora, sans-serif',fontSize:28,fontWeight:900,color:t1Ver.length>=2?'#4ade80':'#fbbf24',lineHeight:1 }}>{t1Ver.length}</span>
                <span style={{ fontSize:10,color:'rgba(255,255,255,.4)',fontWeight:700 }}>of {t1Nodes.length}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign:'center',marginBottom:20 }}>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:16,fontWeight:900,color:t1Ver.length>=2?'#4ade80':'#fbbf24' }}>{t1Ver.length>=2?'🛡 Recovery Quorum Active':'⚠ Quorum Not Ready'}</div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,.45)',marginTop:4 }}>{t1Ver.length>=2?`${t1Ver.length} Blood Line members can restore your Afro-ID`:`Need ${2-t1Ver.length} more verified Blood Line member${t1Ver.length===1?'':'s'}`}</div>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10,fontWeight:800,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10 }}>Blood Line Members (Tier 1)</div>
            {t1Nodes.map(n=>(
              <div key={n.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',marginBottom:8 }}>
                <span style={{ fontSize:18 }}>{n.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:'#f0f7f0' }}>{n.label}</div>
                  <div style={{ fontSize:10,color:'rgba(255,255,255,.4)' }}>{n.rel} · {n.af}</div>
                </div>
                <div style={{ padding:'3px 9px',borderRadius:99,background:STATUS_CFG[n.status].color+'18',border:`1px solid ${STATUS_CFG[n.status].color}33`,fontSize:9,fontWeight:800,color:STATUS_CFG[n.status].color }}>
                  {n.status==='deceased'?'🕊 Ancestor':STATUS_CFG[n.status].label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:'12px 14px',borderRadius:14,background:'rgba(212,160,23,.06)',border:'1px solid rgba(212,160,23,.2)',marginBottom:16 }}>
            <div style={{ fontSize:10,fontWeight:800,color:'#d4a017',marginBottom:6 }}>🏛 Ancestral Vault Keys</div>
            <div style={{ fontSize:10,color:'rgba(255,255,255,.45)',lineHeight:1.7 }}>Vault key holders form a 2-of-5 Shamir quorum to unlock ancestral documents. Assign keys after family members verify their identity.</div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{ width:'100%',padding:'14px 0',borderRadius:14,background:'linear-gradient(135deg,#1a7c3e,#145f30)',border:'none',color:'#fff',fontFamily:'Sora, sans-serif',fontSize:14,fontWeight:800,cursor:'pointer' }}>+ Add Blood Line Member</button>
        </div>
      )}

      {/* Node detail panel */}
      {selNode && (
        <div style={{ position:'fixed',right:0,top:0,bottom:0,width:272,background:'#0a1a0e',borderLeft:'1px solid rgba(26,124,62,.2)',zIndex:50,display:'flex',flexDirection:'column',overflowY:'auto',boxShadow:'-8px 0 32px rgba(0,0,0,.45)' }}>
          <div style={{ padding:'14px 14px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div style={{ fontFamily:'Sora, sans-serif',fontSize:12,fontWeight:900,color:'#f0f7f0' }}>Family Member</div>
            <button onClick={()=>setSelId(null)} style={{ width:28,height:28,borderRadius:8,background:'rgba(255,255,255,.06)',border:'none',color:'rgba(255,255,255,.6)',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
          </div>
          <div style={{ padding:'18px 14px',flex:1 }}>
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:18 }}>
              <div style={{ width:60,height:60,borderRadius:18,background:`${STATUS_CFG[selNode.status].color}18`,border:`2px solid ${STATUS_CFG[selNode.status].color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:8,filter:selNode.status==='deceased'?'grayscale(1)':'none',opacity:selNode.status==='deceased'?0.7:1 }}>{selNode.emoji}</div>
              <div style={{ fontFamily:'Sora, sans-serif',fontSize:15,fontWeight:900,color:'#f0f7f0',textAlign:'center' }}>{selNode.label}</div>
              <div style={{ fontSize:11,color:(selNode.tier===1||selNode.tier===2||selNode.tier===3)?TIER_COLORS[selNode.tier]:'#888',fontWeight:700,marginTop:2 }}>{selNode.rel}</div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,.4)',fontStyle:'italic',marginTop:1 }}>{selNode.af}</div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:10,background:`${STATUS_CFG[selNode.status].color}10`,border:`1px solid ${STATUS_CFG[selNode.status].color}25`,marginBottom:14 }}>
              <div style={{ width:7,height:7,borderRadius:'50%',background:STATUS_CFG[selNode.status].color }} />
              <span style={{ fontSize:11,fontWeight:700,color:STATUS_CFG[selNode.status].color }}>{selNode.status==='deceased'?'🕊 Ancestor':STATUS_CFG[selNode.status].label}</span>
            </div>
            {selNode.afroId&&<div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9,fontWeight:800,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3 }}>Afro-ID</div>
              <div style={{ fontFamily:'monospace',fontSize:11,color:'#4ade80',background:'rgba(74,222,128,.06)',padding:'5px 8px',borderRadius:8,border:'1px solid rgba(74,222,128,.15)',wordBreak:'break-all' }}>{selNode.afroId.replace(/(\w{2}-\w{3}-\d{2})\d+(-\d+)/,'$1**$2')}</div>
            </div>}
            {selNode.birthYear&&<div style={{ fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:12 }}>
              {selNode.status==='deceased'?`${selNode.birthYear} – ${selNode.deathYear??'?'} · May they rest with the ancestors`:`Born ${selNode.birthYear}`}
            </div>}
            {selNode.phone&&<div style={{ fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:12,fontFamily:'monospace' }}>{selNode.phone}</div>}
            {selNode.status==='deceased'&&(
              <div style={{ padding:'10px 12px',borderRadius:12,background:'rgba(107,114,128,.08)',border:'1px solid rgba(107,114,128,.2)',marginBottom:14,textAlign:'center' }}>
                <div style={{ fontSize:18,marginBottom:4 }}>🕊</div>
                <div style={{ fontSize:10,color:'rgba(255,255,255,.45)',lineHeight:1.6,fontStyle:'italic' }}>May {selNode.firstName} rest with the ancestors. Their memory lives in the eternal tree.</div>
              </div>
            )}
            {selNode.status!=='deceased'&&(
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                <Link href={`/dashboard/chat/family/${selNode.id}`} style={{ display:'block',padding:'10px 12px',borderRadius:12,background:'rgba(124,58,237,.15)',border:'1px solid rgba(167,139,250,.25)',color:'#a78bfa',fontSize:12,fontWeight:700,textDecoration:'none',textAlign:'center' }}>💬 Message in Family Chat</Link>
                <button onClick={()=>fireBloodCall(selNode.id)} style={{ padding:'10px 12px',borderRadius:12,background:'rgba(178,34,34,.12)',border:'1px solid rgba(248,113,113,.25)',color:bcSent===selNode.id?'#4ade80':'#f87171',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all .2s' }}>
                  {bcSent===selNode.id?'✅ Test Sent!':'🥁 Blood-Call Test'}
                </button>
                <button onClick={()=>setShowEdit(true)} style={{ padding:'10px 12px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.6)',fontSize:12,fontWeight:700,cursor:'pointer' }}>✏️ Update Details</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAdd&&<AddSheet onClose={()=>setShowAdd(false)} onAdd={handleAdd} />}
      {showEdit&&selNode&&<EditSheet node={selNode} onClose={()=>setShowEdit(false)} onSave={handleEditSave} />}

      {/* Success toast */}
      {addedToast && (
        <div style={{ position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#0a1a0e',border:'1px solid rgba(74,222,128,.35)',borderRadius:12,padding:'10px 18px',zIndex:70,fontSize:12,fontWeight:700,color:'#4ade80',boxShadow:'0 4px 20px rgba(0,0,0,.4)',whiteSpace:'nowrap' }}>
          ✅ {addedToast}
        </div>
      )}
    </div>
  )
}
