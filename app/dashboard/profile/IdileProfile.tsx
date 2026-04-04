'use client'
import * as React from 'react'
import { useSkinStore } from '@/stores/skinStore'
import { useAuthStore } from '@/stores/authStore'
import { ringsApi } from '@/lib/api'

const IDILE_TABS = ['Profile', 'Ancestor Tree', 'Vault'] as const
type IdileTab = typeof IDILE_TABS[number]

type RingBond = { id: string; name?: string; status?: string; ringType?: string; emoji?: string }

export function IdileProfile() {
  const { activeSkin, pinConfirmed, requestSkin } = useSkinStore()
  const user = useAuthStore(s => s.user)
  const [tab, setTab] = React.useState<IdileTab>('Profile')
  const [bonds, setBonds] = React.useState<RingBond[]>([])

  // Guard: redirect to PIN if not confirmed
  React.useEffect(() => {
    if (activeSkin === 'CLAN' && !pinConfirmed) {
      requestSkin('CLAN')
    }
  }, [activeSkin, pinConfirmed, requestSkin])

  // Fetch family bonds
  React.useEffect(() => {
    if (!user?.id) return
    ringsApi.getBonds(user.id)
      .then((r: unknown) => {
        const raw = (r as { bonds?: unknown[]; data?: unknown[] })
        const rows = raw?.bonds ?? raw?.data ?? []
        if (Array.isArray(rows)) setBonds(rows as RingBond[])
      })
      .catch(() => {})
  }, [user?.id])

  if (activeSkin !== 'CLAN' || !pinConfirmed) return null

  const activeBonds  = bonds.filter(b => b.status === 'ACTIVE' || b.status === 'ACCEPTED')
  const familyCircle = bonds.length || 7
  const quorumActive = activeBonds.length || 3

  return (
    <>
      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {IDILE_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '9px 4px', fontSize: 10, fontWeight: 700,
              textAlign: 'center', cursor: 'pointer',
              color: tab === t ? '#7c3aed' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid #7c3aed' : '2px solid transparent',
              background: 'transparent', transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profile' && <IdileProfileTab familyCircle={familyCircle} quorumActive={quorumActive} total={familyCircle} />}
      {tab === 'Ancestor Tree' && <IdileTreeTab bonds={bonds} quorumActive={quorumActive} total={familyCircle} />}
      {tab === 'Vault' && <IdileVaultTab />}
    </>
  )
}

function IdileProfileTab({ familyCircle, quorumActive, total }: { familyCircle:number; quorumActive:number; total:number }) {
  return (
    <>
      {/* Purple hero */}
      <div style={{ background: 'linear-gradient(135deg, #12062a, #7c3aed)', padding: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', fontSize: 80, opacity: 0.1 }}>🏛</div>
        {/* Ghost avatar */}
        <div style={{ width: 60, height: 60, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', background: '#7c3aed', border: '2.5px solid #a78bfa', marginBottom: 10, filter: 'blur(2px) brightness(0.7)' }}>🏛</div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.4)', borderRadius: 99, padding: '3px 10px', fontSize: 10, color: '#a78bfa', fontWeight: 600, marginBottom: 8 }}>🌫 Ghost Power Active</span>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,.5)', filter: 'blur(0.5px)', marginBottom: 2 }}>■■■■■■■■</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Hidden from the world · Clan only</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {['🏛 Clan Member', '🔮 Elder Standing'].map((tag) => (
            <span key={tag} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 99, padding: '3px 10px', fontSize: 11, color: '#fff', fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ v: String(familyCircle), l: 'Family\nCircle' }, { v: `${quorumActive} of ${total}`, l: 'Quorum\nActive' }, { v: 'Secure', l: 'Vault\nStatus' }].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>{v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', whiteSpace: 'pre-line' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What others see */}
      <div style={{ margin: '8px 12px', background: '#12062a', border: '1px solid #7c3aed', borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 6 }}>🏛 What Others See in IDILE Mode</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>Nothing. You are invisible to the world. Only your pre-approved Family Circle members can see you or reach you here. Your name is hidden. Your voice is shifted. This is sacred space.</div>
      </div>
      <div style={{ height: 16 }} />
    </>
  )
}

function IdileTreeTab({ bonds, quorumActive, total }: { bonds: RingBond[]; quorumActive: number; total: number }) {
  const QUORUM_MEMBERS = bonds.length > 0
    ? bonds.slice(0, 7).map(b => ({
        name: b.name ?? 'Family Member',
        emoji: b.emoji ?? '👤',
        approved: b.status === 'ACTIVE' || b.status === 'ACCEPTED',
      }))
    : [
        { name: 'Mama',   emoji: '👩', approved: true  },
        { name: 'Brother', emoji: '👨', approved: true  },
        { name: 'Sister', emoji: '👧', approved: true  },
        { name: 'Cousin', emoji: '👦', approved: false },
        { name: 'Uncle',  emoji: '👴', approved: false },
      ]

  const LINEAGE = bonds.length > 0
    ? bonds.slice(0, 3).map(b => ({
        name: b.name ?? '■■■■■■',
        rel: b.ringType ?? 'Family · Clan',
        emoji: b.emoji ?? '👤',
        ghost: b.status === 'GHOST',
        online: b.status === 'ACTIVE',
        status: b.status === 'ACTIVE' ? '🟢 Online' : '✦',
      }))
    : [
        { name: 'Utibe Senior', rel: 'Grandfather · Akwa Ibom', emoji: '👴', ghost: false, online: false, status: '✦'       },
        { name: 'Mma Utibe',    rel: 'Mother · Akwa Ibom',      emoji: '👩', ghost: false, online: true,  status: '🟢 Online' },
        { name: '■■■■■■',       rel: 'Sister · Ghost mode',     emoji: '🌫', ghost: true,  online: false, status: '👻'       },
      ]

  const quorumNeeded = Math.ceil(total * 0.57)
  const quorumPct    = total > 0 ? Math.round((quorumActive / total) * 100) : 43

  return (
    <>
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your Ancestor Tree · Family Circle</div>

      {/* Quorum card */}
      <div style={{ background: '#12062a', border: '1px solid #7c3aed', borderRadius: 12, padding: 12, margin: '8px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>🛡 Recovery Quorum · {quorumActive} of {total} active</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>If you ever lose access, 4 family members must approve your recovery. This is your communal safety net.</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {QUORUM_MEMBERS.map((m) => (
            <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${m.approved ? '#1a7c3e' : '#374151'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', opacity: m.approved ? 1 : 0.5 }}>{m.emoji}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{m.name}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 4, background: '#1e1e2e', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', borderRadius: 99, background: '#7c3aed', width: `${quorumPct}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{quorumActive} of {total} approvals needed · {Math.max(0, quorumNeeded - quorumActive)} more to secure</div>
      </div>

      {/* Lineage tree */}
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Lineage · Your Blood Tree</div>
      <div style={{ padding: '0 12px' }}>
        {LINEAGE.map((node, i) => (
          <div key={node.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 6, position: 'relative' }}>
            {i > 0 && <div style={{ position: 'absolute', left: 22, top: -6, width: 1, height: 6, background: '#a78bfa', opacity: 0.4 }} />}
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${node.ghost ? '#a78bfa' : '#7c3aed'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, filter: node.ghost ? 'blur(1.5px)' : undefined }}>{node.emoji}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', filter: node.ghost ? 'blur(0.5px)' : undefined }}>{node.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{node.rel}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11 }}>{node.status}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 16 }} />
    </>
  )
}

function IdileVaultTab() {
  const [playing, setPlaying] = React.useState(false)
  const [playProgress, setPlayProgress] = React.useState(0)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [sharedWith, setSharedWith] = React.useState<Set<string>>(new Set())
  const [viewDoc, setViewDoc] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [addType, setAddType] = React.useState<string|null>(null)
  const [addTitle, setAddTitle] = React.useState('')
  const [addSaved, setAddSaved] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setInterval>|null>(null)

  const KIN = [
    { id:'mama', name:'Mma Utibe', emoji:'👩', rel:'Mother' },
    { id:'bro',  name:'Utibe Jr',  emoji:'👨', rel:'Brother' },
    { id:'sis',  name:'Ada Utibe', emoji:'👧', rel:'Sister' },
  ]

  const togglePlay = () => {
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current)
      setPlaying(false)
    } else {
      setPlaying(true)
      setPlayProgress(0)
      timerRef.current = setInterval(() => {
        setPlayProgress(p => { if (p >= 100) { clearInterval(timerRef.current!); setPlaying(false); return 0 } return p + 2 })
      }, 300)
    }
  }

  const handleAddSave = () => {
    if (!addTitle.trim() || !addType) return
    setAddSaved(true)
    setTimeout(() => { setAddOpen(false); setAddSaved(false); setAddTitle(''); setAddType(null) }, 1200)
  }

  return (
    <>
      <div style={{ padding: '10px 14px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ancestral Vault · Sacred Storage</div>

      {/* Voice recording */}
      <div style={{ background: 'var(--bg-card)', margin: '8px 12px', borderRadius: 12, border: '1px solid #2e1265', padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#a78bfa', fontWeight: 700, marginBottom: 8 }}>🔒 Clan Private · Voice recording · 2 days ago</div>
        <div style={{ fontSize: 12, color: '#6b46c1', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;Grandmother&apos;s story about the great migration of 1962 — recorded before she passed. Sealed for the bloodline only.&rdquo;</div>
        {/* Waveform + progress */}
        {playing && (
          <div style={{ margin: '8px 0 4px', height: 4, background: '#1e1e2e', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 99, width: `${playProgress}%`, transition: 'width .3s linear' }} />
          </div>
        )}
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <button onClick={togglePlay}
            style={{ padding: '6px 12px', background: playing ? '#2e1265' : '#12062a', border: `1px solid ${playing ? '#a78bfa' : '#7c3aed'}`, borderRadius: 99, fontSize: 10, color: '#a78bfa', fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
            {playing ? `⏸ Playing... ${playProgress}%` : '▶ Play (Clan only)'}
          </button>
          <button onClick={() => setShareOpen(true)}
            style={{ padding: '6px 12px', background: '#12062a', border: '1px solid #333', borderRadius: 99, fontSize: 10, color: '#666', fontWeight: 700, cursor: 'pointer' }}>🔒 Share with Kin</button>
        </div>
      </div>

      {/* Land document */}
      <div style={{ background: 'var(--bg-card)', margin: '8px 12px', borderRadius: 12, border: '1px solid #2e1265', padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#a78bfa', fontWeight: 700, marginBottom: 8 }}>🔒 Clan Private · Land document · Scanned</div>
        <div style={{ fontSize: 12, color: '#6b46c1', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;Certificate of Occupancy — Utibe family compound. Stored under Shamir Secret Sharing. 4 family members hold the keys.&rdquo;</div>
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setViewDoc(true)}
            style={{ padding: '6px 12px', background: '#12062a', border: '1px solid #7c3aed', borderRadius: 99, fontSize: 10, color: '#a78bfa', fontWeight: 700, cursor: 'pointer', display: 'inline-flex' }}>👁 View (Clan only)</button>
        </div>
      </div>

      {/* Add to vault */}
      <div onClick={() => setAddOpen(true)}
        style={{ margin: '8px 12px 16px', background: '#12062a', border: '1px dashed #7c3aed', borderRadius: 12, padding: 12, textAlign: 'center', cursor: 'pointer', transition: 'background .2s' }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>+ Add to Vault</div>
        <div style={{ fontSize: 11, color: '#6b46c1' }}>Voice recording · Document · Photo · Story</div>
      </div>

      {/* ── Share with Kin Sheet ── */}
      {shareOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(0,0,0,.72)', display:'flex', alignItems:'flex-end' }} onClick={() => setShareOpen(false)}>
          <div style={{ width:'100%', background:'#0a0a1a', borderRadius:'20px 20px 0 0', padding:'20px 20px 32px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,.15)', margin:'0 auto 18px' }} />
            <div style={{ fontSize:16, fontWeight:900, color:'#a78bfa', marginBottom:4 }}>🔒 Share with Kin</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:16 }}>Select family members who can access this recording</div>
            {KIN.map(k => (
              <button key={k.id} onClick={() => setSharedWith(s => { const n = new Set(s); n.has(k.id) ? n.delete(k.id) : n.add(k.id); return n })}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:12, background: sharedWith.has(k.id) ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.03)', border:`1px solid ${sharedWith.has(k.id) ? '#7c3aed' : 'rgba(255,255,255,.08)'}`, marginBottom:8, cursor:'pointer', transition:'all .2s' }}>
                <span style={{ fontSize:20 }}>{k.emoji}</span>
                <div style={{ flex:1, textAlign:'left' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#f0f7f0' }}>{k.name}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)' }}>{k.rel}</div>
                </div>
                <span style={{ fontSize:14, color: sharedWith.has(k.id) ? '#4ade80' : 'rgba(255,255,255,.15)' }}>{sharedWith.has(k.id) ? '✓' : '○'}</span>
              </button>
            ))}
            <button onClick={() => { if (sharedWith.size > 0) setShareOpen(false) }} disabled={sharedWith.size === 0}
              style={{ width:'100%', padding:'13px 0', borderRadius:14, border:'none', fontSize:14, fontWeight:800, background: sharedWith.size > 0 ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,.06)', color: sharedWith.size > 0 ? '#fff' : 'rgba(255,255,255,.25)', cursor: sharedWith.size > 0 ? 'pointer' : 'not-allowed', marginTop:8, transition:'all .3s' }}>
              {sharedWith.size > 0 ? `🔓 Grant Access to ${sharedWith.size} Kin` : 'Select at least 1 member'}
            </button>
          </div>
        </div>
      )}

      {/* ── Document Viewer ── */}
      {viewDoc && (
        <div style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(0,0,0,.85)', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(124,58,237,.2)' }}>
            <div style={{ fontSize:13, fontWeight:900, color:'#a78bfa' }}>📜 Certificate of Occupancy</div>
            <button onClick={() => setViewDoc(false)} style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,.06)', border:'none', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
            <div style={{ width:'100%', maxWidth:340, background:'#fef9ef', borderRadius:8, padding:24, color:'#1a0f00', position:'relative' }}>
              <div style={{ position:'absolute', top:12, right:12, fontSize:9, color:'#7c3aed', fontWeight:800, background:'rgba(124,58,237,.1)', padding:'2px 8px', borderRadius:99 }}>SEALED</div>
              <div style={{ fontSize:10, color:'#92400e', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:12 }}>Federal Republic of Nigeria</div>
              <div style={{ fontSize:16, fontWeight:900, textAlign:'center', marginBottom:8, color:'#1a0f00' }}>Certificate of Occupancy</div>
              <div style={{ height:1, background:'#d4a017', margin:'8px 0 12px' }} />
              <div style={{ fontSize:11, lineHeight:1.8, color:'#3d2200' }}>
                <strong>Holder:</strong> Utibe Family Compound<br/>
                <strong>Location:</strong> Eket, Akwa Ibom State<br/>
                <strong>Plot:</strong> 2.4 hectares · Survey Plan #AKS/EK/1947<br/>
                <strong>Registered:</strong> 12 March 1962<br/>
                <strong>Shamir Keys:</strong> 4 of 7 family members hold access
              </div>
              <div style={{ textAlign:'center', marginTop:16, fontSize:9, color:'#92400e', fontWeight:700 }}>🛡 Protected by Ancestral Vault · Shamir 4-of-7</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add to Vault Sheet ── */}
      {addOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(0,0,0,.72)', display:'flex', alignItems:'flex-end' }} onClick={() => setAddOpen(false)}>
          <div style={{ width:'100%', background:'#0a0a1a', borderRadius:'20px 20px 0 0', padding:'20px 20px 32px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,.15)', margin:'0 auto 18px' }} />
            <div style={{ fontSize:16, fontWeight:900, color:'#a78bfa', marginBottom:4 }}>+ Add to Ancestral Vault</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:16 }}>Select what you want to preserve for your bloodline</div>
            {!addType ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[{id:'voice',emoji:'🎙',label:'Voice Recording'},{id:'doc',emoji:'📄',label:'Document'},{id:'photo',emoji:'📸',label:'Photo'},{id:'story',emoji:'📖',label:'Written Story'}].map(t => (
                  <button key={t.id} onClick={() => setAddType(t.id)}
                    style={{ padding:'16px 10px', borderRadius:14, border:'1.5px solid rgba(124,58,237,.25)', background:'rgba(124,58,237,.06)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer' }}>
                    <span style={{ fontSize:24 }}>{t.emoji}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'#a78bfa' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <button onClick={() => setAddType(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.4)', fontSize:11, cursor:'pointer', padding:0, marginBottom:12 }}>← Back</button>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', display:'block', marginBottom:5 }}>Title / Description *</label>
                  <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder={addType === 'voice' ? 'e.g. Grandmother\'s migration story' : addType === 'doc' ? 'e.g. Land certificate' : addType === 'photo' ? 'e.g. Family reunion 1985' : 'e.g. How our clan got its name'}
                    style={{ width:'100%', padding:'11px 14px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1.5px solid rgba(124,58,237,.25)', color:'#f0f7f0', fontSize:14, outline:'none', boxSizing:'border-box' }} />
                </div>
                <div style={{ padding:14, borderRadius:12, border:'1px dashed rgba(124,58,237,.3)', background:'rgba(124,58,237,.04)', textAlign:'center', marginBottom:16 }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{addType === 'voice' ? '🎙' : addType === 'doc' ? '📄' : addType === 'photo' ? '📸' : '📖'}</div>
                  <div style={{ fontSize:11, color:'#a78bfa', fontWeight:700 }}>{addType === 'voice' ? 'Tap to start recording' : addType === 'story' ? 'Tap to start writing' : 'Tap to upload file'}</div>
                </div>
                <button onClick={handleAddSave} disabled={!addTitle.trim()}
                  style={{ width:'100%', padding:'13px 0', borderRadius:14, border:'none', fontSize:14, fontWeight:800, background: addSaved ? '#5b21b6' : addTitle.trim() ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,.06)', color: addTitle.trim() ? '#fff' : 'rgba(255,255,255,.25)', cursor: addTitle.trim() ? 'pointer' : 'not-allowed', transition:'all .3s' }}>
                  {addSaved ? '✅ Sealed in Vault!' : '🔒 Seal in Vault'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
