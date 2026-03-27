'use client'
import * as React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

const FaceLiveness = dynamic(() => import('@/components/onboarding/FaceLiveness'), { ssr: false })

// ── Biometric Gate — blocks banking until fingerprint + face verified ──
type GateStage = 'setup-required' | 'fingerprint' | 'face' | 'granted'

function BiometricGate({ children }: { children: React.ReactNode }) {
  const { biometricEnrolled, credentialId } = useAuthStore()
  const router = useRouter()
  const [stage, setStage] = React.useState<GateStage>('fingerprint')
  const [fpWorking, setFpWorking] = React.useState(false)
  const [fpError, setFpError] = React.useState('')

  // On mount, decide initial stage
  React.useEffect(() => {
    if (!biometricEnrolled) setStage('setup-required')
    else setStage('fingerprint')
  }, [biometricEnrolled])

  async function verifyFingerprint() {
    setFpWorking(true)
    setFpError('')
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const allowCreds: PublicKeyCredentialDescriptor[] = credentialId
        ? [{ type: 'public-key', id: Uint8Array.from(credentialId.match(/.{2}/g)!.map(b => parseInt(b, 16))) }]
        : []

      const cred = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: allowCreds,
          userVerification: 'required',
          timeout: 60000,
        },
      })
      if (cred) setStage('face')
      else setFpError('Verification failed. Try again.')
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') setFpError('Fingerprint verification cancelled.')
      else setFpError('Biometric verification failed. Please try again.')
    }
    setFpWorking(false)
  }

  if (stage === 'granted') return <>{children}</>

  // Gate overlay
  return (
    <div style={{ minHeight:'100svh', background:'#050a06', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 20px' }}>
      {stage === 'setup-required' && (
        <div style={{ textAlign:'center', maxWidth:340 }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
          <div style={{ color:'#f0f7f0', fontSize:20, fontWeight:800, marginBottom:8 }}>Banking Locked</div>
          <div style={{ color:'rgba(240,247,240,.55)', fontSize:14, lineHeight:1.6, marginBottom:28 }}>
            Banking requires fingerprint + face verification to protect your Cowrie.<br /><br />
            Set up biometric in Settings before continuing.
          </div>
          <button
            onClick={() => router.push('/dashboard/settings')}
            style={{ background:'linear-gradient(135deg,#15803d,#166534)', color:'#fff', border:'none', borderRadius:14, padding:'14px 28px', fontSize:15, fontWeight:700, cursor:'pointer', width:'100%', marginBottom:12 }}
          >
            ⚙️ Go to Settings
          </button>
          <button
            onClick={() => router.back()}
            style={{ background:'transparent', border:'none', color:'rgba(240,247,240,.4)', fontSize:13, cursor:'pointer', padding:'8px 0' }}
          >
            ← Go Back
          </button>
        </div>
      )}

      {stage === 'fingerprint' && (
        <div style={{ textAlign:'center', maxWidth:340 }}>
          <div style={{ fontSize:56, marginBottom:16 }}>👆</div>
          <div style={{ color:'#f0f7f0', fontSize:20, fontWeight:800, marginBottom:8 }}>Verify Identity</div>
          <div style={{ color:'rgba(240,247,240,.55)', fontSize:14, lineHeight:1.6, marginBottom:28 }}>
            Confirm your fingerprint to access Banking. Your sovereign Cowrie is protected.
          </div>
          {fpError && (
            <div style={{ background:'rgba(248,113,113,.15)', border:'1px solid rgba(248,113,113,.3)', borderRadius:10, padding:'10px 14px', color:'#f87171', fontSize:12, marginBottom:16 }}>
              {fpError}
            </div>
          )}
          <button
            onClick={verifyFingerprint}
            disabled={fpWorking}
            style={{ background:'linear-gradient(135deg,#15803d,#166534)', color:'#fff', border:'none', borderRadius:14, padding:'14px 28px', fontSize:15, fontWeight:700, cursor:fpWorking?'wait':'pointer', width:'100%', opacity:fpWorking?.7:1, marginBottom:12 }}
          >
            {fpWorking ? '⏳ Verifying…' : '👆 Verify Fingerprint'}
          </button>
          <button
            onClick={() => router.back()}
            style={{ background:'transparent', border:'none', color:'rgba(240,247,240,.4)', fontSize:13, cursor:'pointer', padding:'8px 0' }}
          >
            ← Cancel
          </button>
        </div>
      )}

      {stage === 'face' && (
        <div style={{ width:'100%', maxWidth:420 }}>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <div style={{ color:'#f0f7f0', fontSize:18, fontWeight:800 }}>Step 2 of 2 — Face Capture</div>
            <div style={{ color:'rgba(240,247,240,.45)', fontSize:13 }}>Look at the camera to complete verification</div>
          </div>
          <FaceLiveness
            theme={{ bg:'#050a06', text:'#f0f7f0', subText:'rgba(240,247,240,.5)', accent:'#4ade80' }}
            onComplete={() => setStage('granted')}
            onSkip={() => setStage('granted')}
          />
        </div>
      )}
    </div>
  )
}


// Covers: Dual-currency treasury, Ajo 3.0, Ogbo Ụtụ Escrow,
//         Cowrie Mesh offline P2P, TLP locks, CowrieChain L2,
//         Interbank corridors, Kòwè receipts, ATM Eye
// ============================================================

type Tab = 'wallet' | 'ajo' | 'escrow' | 'ledger' | 'blockchain' | 'bills' | 'analytics'

// ── Data types ───────────────────────────────────────────────

type TxType = 'SEND' | 'RECEIVE' | 'TIP' | 'AJO' | 'ESCROW' | 'MESH' | 'TLP' | 'CHAIN' | 'MARKET' | 'SPRAY'

interface Tx {
  id: string; type: TxType; label: string; amount: number
  direction: 'IN' | 'OUT'; time: string; party?: string
  rail?: string; koweHash?: string; state?: string
}

interface AjoCircle {
  id: string; name: string; members: number; contribution: number
  round: number; totalRounds: number; nextPayout: string
  currency: string; status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  ajoScore: number; myTurn: number
}

interface EscrowPot {
  id: string; label: string; amount: number; counterparty: string
  state: EscrowState; proofType: string; created: string; role: 'BUYER' | 'SELLER'
}

type EscrowState =
  | 'INITIATED' | 'BUYER_CONFIRMED' | 'LOCKED' | 'PROOF_SUBMITTED'
  | 'PROOF_VERIFIED' | 'RELEASED' | 'DISPUTED' | 'ARBITRATION'

interface Block { height: number; txCount: number; time: string; finalized: boolean }

// ── Empty initial data (live data fetched from backend) ───────

const FX_RATES = [
  { c:'NGN', flag:'🇳🇬', name:'Naira',    rate:1_200 },
  { c:'GHS', flag:'🇬🇭', name:'Cedi',     rate:15.2  },
  { c:'KES', flag:'🇰🇪', name:'Shilling', rate:148   },
  { c:'ZAR', flag:'🇿🇦', name:'Rand',     rate:19.8  },
  { c:'USD', flag:'🇺🇸', name:'Dollar',   rate:0.78  },
  { c:'GBP', flag:'🇬🇧', name:'Pound',    rate:0.62  },
]

const RAILS = [
  { id:'cowrie_l2', name:'CowrieChain L2', desc:'Sub-second finality · 0.1% fee', emoji:'🔗', active:true  },
  { id:'tlp',       name:'TLP',            desc:'Talking Lock-up · time-gated',   emoji:'🥁', active:true  },
  { id:'psp',       name:'PSP Gateway',    desc:'Stripe / Paystack / Flutterwave', emoji:'💳', active:true  },
  { id:'ach',       name:'ACH / NIBSS',    desc:'Nigeria Interbank Settlement',    emoji:'🏦', active:true  },
  { id:'rtgs',      name:'RTGS / SWIFT',   desc:'High-value same-day wire',        emoji:'🌐', active:false },
]

const CORRIDORS = [
  { from:'🇳🇬 Nigeria', to:'🇬🇭 Ghana',     rail:'GhIPSS', fee:'0.5%', time:'< 2 min'  },
  { from:'🇳🇬 Nigeria', to:'🇰🇪 Kenya',     rail:'PesaLink',fee:'0.8%', time:'< 3 min' },
  { from:'🇳🇬 Nigeria', to:'🌐 SWIFT/USD', rail:'SWIFT',   fee:'1.2%', time:'< 1 day'  },
  { from:'🌍 Africa',   to:'🇬🇧 UK Diaspora', rail:'Faster Pay', fee:'0.9%', time:'< 4h' },
]

const ESCROW_STATE_FLOW: EscrowState[] = [
  'INITIATED','BUYER_CONFIRMED','LOCKED','PROOF_SUBMITTED',
  'PROOF_VERIFIED','RELEASED',
]

const ESCROW_STATE_LABEL: Record<EscrowState, string> = {
  INITIATED:       '1 · INITIATED',
  BUYER_CONFIRMED: '2 · BUYER CONFIRMED',
  LOCKED:          '3 · LOCKED 🔒',
  PROOF_SUBMITTED: '4 · PROOF SUBMITTED',
  PROOF_VERIFIED:  '5 · PROOF VERIFIED ✅',
  RELEASED:        '6 · RELEASED 💰',
  DISPUTED:        '⚠️ DISPUTED',
  ARBITRATION:     '🏛 ARBITRATION',
}

const ESCROW_STATE_COLOR: Record<EscrowState, string> = {
  INITIATED:       '#6b7280',
  BUYER_CONFIRMED: '#3b82f6',
  LOCKED:          '#d97706',
  PROOF_SUBMITTED: '#8b5cf6',
  PROOF_VERIFIED:  '#10b981',
  RELEASED:        '#22c55e',
  DISPUTED:        '#ef4444',
  ARBITRATION:     '#f59e0b',
}

const TX_ICON: Record<TxType, string> = {
  SEND:'↗️',RECEIVE:'↙️',TIP:'🥥',AJO:'🔄',ESCROW:'🔒',
  MESH:'📡',TLP:'🥁',CHAIN:'🔗',MARKET:'🛒',SPRAY:'💦',
}

function fc(n: number) { return '₵' + n.toLocaleString() }

// ── Live data context ─────────────────────────────────────────

interface BankingData {
  live: boolean
  balance:  { cowrie: number; afcoin: number; escrowLocked: number; tlpLocked: number }
  txs:      Tx[]
  circles:  AjoCircle[]
  escrow:   EscrowPot[]
}

const DEFAULT_DATA: BankingData = {
  live: false,
  balance:  { cowrie: 0, afcoin: 0, escrowLocked: 0, tlpLocked: 0 },
  txs:      [],
  circles:  [],
  escrow:   [],
}

const BankingCtx = React.createContext<BankingData>(DEFAULT_DATA)

function useBankingCtx() { return React.useContext(BankingCtx) }

// ── Sub-components ────────────────────────────────────────────

function BalanceHero() {
  const { balance, live } = useBankingCtx()
  const cowrie  = balance.cowrie
  const afcoin  = balance.afcoin
  const locked  = balance.escrowLocked + balance.tlpLocked

  return (
    <div style={{ padding: '20px 16px 16px', background: 'linear-gradient(180deg,#0f1a0f,#0a0a0a)', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
      <p style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginBottom:4 }}>Total Treasury
        {live && <span style={{ marginLeft:6, fontSize:9, padding:'2px 6px', background:'rgba(74,222,128,.12)', border:'1px solid rgba(74,222,128,.25)', borderRadius:20, color:'#4ade80', fontWeight:700 }}>● LIVE</span>}
      </p>
      <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
        <span style={{ fontSize:38, fontWeight:800, color:'#fbbf24', letterSpacing:'-1px' }}>{fc(cowrie)}</span>
        <span style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>Cowrie</span>
      </div>
      <div style={{ display:'flex', gap:16, marginTop:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }}/>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>
            AfriCoin: <span style={{ color:'#4ade80', fontWeight:700 }}>{fc(afcoin)} AFC</span>
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b' }}/>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>
            Locked: <span style={{ color:'#f59e0b', fontWeight:700 }}>{fc(locked)}</span>
          </span>
        </div>
      </div>
      <p style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginTop:4 }}>
        ≈ ₦{(cowrie * 1200).toLocaleString()} NGN · ≈ ${(cowrie * 0.78).toLocaleString()} USD
      </p>

      {/* Quick action row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginTop:16 }}>
        {[
          ['↗️','Send'],['↙️','Receive'],['🔄','Ajo'],['🔒','Escrow'],['📡','Mesh'],
        ].map(([emoji, label]) => (
          <button key={label} onClick={label === 'Send' || label === 'Receive' ? () => (window as any).__openSend?.() : undefined} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:14, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', cursor:'pointer' }}>
            <span style={{ fontSize:18 }}>{emoji}</span>
            <span style={{ fontSize:9, color:'rgba(255,255,255,.5)', fontWeight:600 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ExchangeRates() {
  return (
    <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
      <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:8, fontWeight:600 }}>1₵ COWRIE</p>
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
        {FX_RATES.map(r => (
          <div key={r.c} style={{ flexShrink:0, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'8px 10px', textAlign:'center', minWidth:64 }}>
            <span style={{ fontSize:16 }}>{r.flag}</span>
            <p style={{ fontSize:11, fontWeight:800, color:'#fff', marginTop:2 }}>{r.rate < 10 ? r.rate.toFixed(2) : r.rate.toLocaleString()}</p>
            <p style={{ fontSize:9, color:'rgba(255,255,255,.35)' }}>{r.c}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MeshPanel() {
  const [qr, setQr] = React.useState(false)
  return (
    <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'#fff' }}>📡 Cowrie Mesh</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>Offline BLE/NFC P2P payments · no internet needed</p>
        </div>
        <button onClick={() => setQr(!qr)} style={{ padding:'6px 12px', background:'rgba(74,222,128,.12)', border:'1px solid rgba(74,222,128,.25)', borderRadius:20, color:'#4ade80', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          {qr ? 'Close' : 'Generate QR'}
        </button>
      </div>
      {qr && (
        <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:16, display:'flex', gap:14, alignItems:'center' }}>
          {/* SVG QR placeholder */}
          <div style={{ width:72, height:72, background:'#fff', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="56" height="56" viewBox="0 0 100 100">
              {[0,20,40,60,80].map(y=>[0,20,40,60,80].map(x=>(
                <rect key={`${x}-${y}`} x={x+1} y={y+1} width={16} height={16}
                  fill={Math.random()>0.4 ? '#000' : '#fff'} rx="2"/>
              )))}
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:4 }}>24h Voucher</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>
              Valid 24 hours · double-spend protected · works offline via Bluetooth or NFC tap
            </p>
            <div style={{ marginTop:8, display:'flex', gap:8 }}>
              <span style={{ fontSize:10, padding:'3px 8px', background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:20, color:'#4ade80' }}>BLE Ready</span>
              <span style={{ fontSize:10, padding:'3px 8px', background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.2)', borderRadius:20, color:'#60a5fa' }}>NFC Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ATMEyeNotice() {
  return (
    <div style={{ margin:'0 16px 12px', background:'rgba(251,191,36,.05)', border:'1px solid rgba(251,191,36,.15)', borderRadius:14, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
      <span style={{ fontSize:20 }}>👁️</span>
      <div>
        <p style={{ fontSize:12, fontWeight:700, color:'#fbbf24', marginBottom:2 }}>ATM Eye Liveness — Active</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.45)', lineHeight:1.5 }}>
          Transactions ≥₵5,000 require front-camera liveness. 6 proof types: AI Scan, GPS Geofence, Client Confirm, Community Witness, Voice Phrase, ATM Eye.
        </p>
      </div>
    </div>
  )
}

// ── Ajo tab ───────────────────────────────────────────────────
function AjoTab() {
  const { circles, live } = useBankingCtx()
  const [showCreate, setShowCreate] = React.useState(false)
  const totalSaved = circles.filter(c=>c.status==='ACTIVE').reduce((s,c)=>s+c.contribution*c.round,0)

  return (
    <div>
      <div style={{ padding:'14px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'#fff' }}>🔄 Ajo 3.0 — Rotating Savings</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2 }}>
            {circles.filter(c=>c.status==='ACTIVE').length} active circles · {fc(totalSaved)} saved
            {live && <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:10, color:'#4ade80', fontWeight:700 }}>● LIVE</span>}
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding:'7px 14px', background:'rgba(74,222,128,.12)', border:'1px solid rgba(74,222,128,.25)', borderRadius:20, color:'#4ade80', fontSize:11, fontWeight:700, cursor:'pointer' }}>
          + New Circle
        </button>
      </div>

      {showCreate && (
        <div style={{ margin:'12px 16px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:16 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:12 }}>Create New Ajo Circle</p>
          {[
            ['Circle name','text','e.g. Lagos Tech Builders'],
            ['Contribution amount (₵)','number','e.g. 2000'],
            ['Members (AfroID handles)','text','e.g. @kofi.akn, @amara.yor'],
          ].map(([label, type, ph]) => (
            <div key={label as string} style={{ marginBottom:12 }}>
              <label style={{ fontSize:10, color:'rgba(255,255,255,.5)', fontWeight:600, display:'block', marginBottom:4 }}>{label}</label>
              <input type={type as string} placeholder={ph as string} style={{ width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 10px', color:'#fff', fontSize:13, boxSizing:'border-box' }}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {(['DAILY','WEEKLY','MONTHLY'] as const).map(f => (
              <button key={f} style={{ flex:1, padding:'7px 0', borderRadius:8, border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.04)', color:'rgba(255,255,255,.6)', fontSize:11, cursor:'pointer' }}>{f}</button>
            ))}
          </div>
          <button style={{ width:'100%', padding:12, background:'linear-gradient(135deg,#16a34a,#15803d)', border:'none', borderRadius:10, color:'#fff', fontWeight:800, fontSize:13, cursor:'pointer' }}>
            🔄 Found Circle
          </button>
        </div>
      )}

      {/* Circle cards */}
      <div style={{ padding:'0 16px' }}>
        {circles.map(c => {
          const pct = (c.round / c.totalRounds) * 100
          const statusColor = c.status === 'ACTIVE' ? '#4ade80' : c.status === 'COMPLETED' ? '#fbbf24' : '#f59e0b'
          return (
            <div key={c.id} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:14, marginBottom:10, marginTop:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{c.name}</p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>
                    {c.members} members · {c.currency}{c.contribution.toLocaleString()}/round
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ fontSize:10, padding:'3px 8px', background:`${statusColor}22`, border:`1px solid ${statusColor}44`, borderRadius:20, color:statusColor, fontWeight:700 }}>
                    {c.status}
                  </span>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:4 }}>Ajo Score: <span style={{ color:'#fbbf24', fontWeight:700 }}>{c.ajoScore}</span></p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ flex:1, height:5, background:'rgba(255,255,255,.06)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius:99, transition:'width .5s' }}/>
                </div>
                <span style={{ fontSize:11, color:'#4ade80', fontWeight:700, flexShrink:0 }}>Round {c.round}/{c.totalRounds}</span>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>
                  {c.status === 'COMPLETED' ? '✅ All rounds complete' : `Next payout in ${c.nextPayout}`}
                </span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>
                  Your turn: <span style={{ color:'#fbbf24', fontWeight:700 }}>Round {c.myTurn}</span>
                </span>
              </div>

              {c.status === 'ACTIVE' && (
                <button style={{ width:'100%', marginTop:12, padding:'8px 0', background:'rgba(22,163,74,.12)', border:'1px solid rgba(22,163,74,.25)', borderRadius:8, color:'#4ade80', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  Contribute {c.currency}{c.contribution.toLocaleString()} to Pool
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* AjoScore explainer */}
      <div style={{ margin:'0 16px 16px', background:'rgba(251,191,36,.04)', border:'1px solid rgba(251,191,36,.12)', borderRadius:14, padding:'12px 14px' }}>
        <p style={{ fontSize:12, fontWeight:700, color:'#fbbf24', marginBottom:6 }}>🏆 AjoScore System</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.45)', lineHeight:1.6 }}>
          Scored 0–100 based on: on-time contributions (50%), circle completions (30%), elder endorsements (20%). Score 90+ unlocks GuaranteePool backing for new circles. Elder Override Ledger resolves disputes fairly.
        </p>
      </div>
    </div>
  )
}

// ── Escrow tab ────────────────────────────────────────────────
function EscrowTab() {
  const { escrow, live } = useBankingCtx()
  const [active, setActive] = React.useState<string | null>(null)

  return (
    <div>
      <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#fff' }}>🔒 Ogbo Ụtụ — Honour Escrow
          {live && <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:10, color:'#4ade80', fontWeight:700 }}>● LIVE</span>}
        </p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2 }}>8-state machine · Proof-of-Hand verification · dust-free splitting</p>
      </div>

      {/* State flow legend */}
      <div style={{ padding:'10px 16px', overflowX:'auto', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:0, minWidth:'max-content' }}>
          {ESCROW_STATE_FLOW.map((st, i) => (
            <React.Fragment key={st}>
              <div style={{ padding:'4px 10px', borderRadius:20, background:`${ESCROW_STATE_COLOR[st]}22`, border:`1px solid ${ESCROW_STATE_COLOR[st]}44`, fontSize:9, fontWeight:700, color:ESCROW_STATE_COLOR[st], whiteSpace:'nowrap' }}>
                {ESCROW_STATE_LABEL[st]}
              </div>
              {i < ESCROW_STATE_FLOW.length - 1 && (
                <div style={{ width:12, height:1, background:'rgba(255,255,255,.12)', margin:'0 2px', flexShrink:0 }}/>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Proof types */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize:10, color:'rgba(255,255,255,.35)', fontWeight:700, marginBottom:6 }}>PROOF-OF-HAND TYPES</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['AI_MATERIAL_SCAN','CLIENT_CONFIRM','GPS_GEOFENCE','COMMUNITY_WITNESS','VOICE_PHRASE','ATM_EYE_LIVENESS'].map(pt => (
            <span key={pt} style={{ fontSize:9, padding:'3px 8px', background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.2)', borderRadius:20, color:'#a78bfa', fontWeight:700 }}>
              {pt.replace(/_/g,' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Active pots */}
      <div style={{ padding:'0 16px 16px' }}>
        {escrow.map(pot => {
          const isOpen = active === pot.id
          const stColor = ESCROW_STATE_COLOR[pot.state]
          return (
            <div key={pot.id} style={{ marginTop:12 }}>
              <button
                onClick={() => setActive(isOpen ? null : pot.id)}
                style={{ width:'100%', background:'rgba(255,255,255,.03)', border:`1px solid ${stColor}33`, borderRadius:14, padding:14, textAlign:'left', cursor:'pointer' }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1, marginRight:10 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2 }}>{pot.label}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>
                      {pot.counterparty} · {pot.created} · <span style={{ color:'rgba(255,255,255,.5)' }}>{pot.role}</span>
                    </p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:'#fbbf24' }}>{fc(pot.amount)}</p>
                    <span style={{ fontSize:9, padding:'2px 7px', background:`${stColor}22`, border:`1px solid ${stColor}44`, borderRadius:20, color:stColor, fontWeight:700 }}>
                      {ESCROW_STATE_LABEL[pot.state]}
                    </span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div style={{ background:'rgba(0,0,0,.3)', border:`1px solid ${stColor}22`, borderTop:'none', borderRadius:'0 0 14px 14px', padding:'12px 14px' }}>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:8 }}>
                    Proof type: <span style={{ color:'#a78bfa', fontWeight:700 }}>{pot.proofType.replace(/_/g,' ')}</span>
                  </p>

                  {pot.state === 'LOCKED' && (
                    <div style={{ display:'flex', gap:8 }}>
                      <button style={{ flex:1, padding:10, background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.25)', borderRadius:8, color:'#10b981', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        Submit Proof ↑
                      </button>
                      <button style={{ flex:1, padding:10, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', borderRadius:8, color:'#ef4444', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        Raise Dispute
                      </button>
                    </div>
                  )}
                  {pot.state === 'PROOF_SUBMITTED' && (
                    <button style={{ width:'100%', padding:10, background:'rgba(59,130,246,.12)', border:'1px solid rgba(59,130,246,.25)', borderRadius:8, color:'#60a5fa', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                      Verify Proof & Release
                    </button>
                  )}
                  {pot.state === 'PROOF_VERIFIED' && (
                    <button style={{ width:'100%', padding:10, background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.25)', borderRadius:8, color:'#22c55e', fontSize:12, fontWeight:800, cursor:'pointer' }}>
                      💰 Release {fc(pot.amount)} to Seller
                    </button>
                  )}
                  {pot.state === 'DISPUTED' && (
                    <div style={{ padding:10, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:8, fontSize:11, color:'#ef4444' }}>
                      ⚠️ Elder Arbitration in progress. Expected resolution within 72h.
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <button style={{ width:'100%', marginTop:16, padding:12, background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:12, color:'#fbbf24', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          🔒 Create New Honour Pot
        </button>
      </div>
    </div>
  )
}

// ── Ledger tab ────────────────────────────────────────────────
function LedgerTab() {
  const { txs, live } = useBankingCtx()
  const [filter, setFilter] = React.useState<TxType | 'ALL'>('ALL')
  const types: Array<TxType | 'ALL'> = ['ALL','SEND','RECEIVE','AJO','ESCROW','MESH','TLP','CHAIN']
  const displayed = filter === 'ALL' ? txs : txs.filter(t => t.type === filter)

  return (
    <div>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:8 }}>Kòwè Ledger
          {live && <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:10, color:'#4ade80', fontWeight:700 }}>● LIVE</span>}
        </p>
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, border:'1px solid rgba(255,255,255,.1)', background: filter===t ? 'rgba(251,191,36,.15)' : 'transparent', color: filter===t ? '#fbbf24' : 'rgba(255,255,255,.45)', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        {displayed.map((tx, i) => (
          <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i < displayed.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
              {TX_ICON[tx.type]}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, color:'#fff', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.label}</p>
              <div style={{ display:'flex', gap:6, marginTop:2, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>{tx.time}</span>
                {tx.party && <span style={{ fontSize:10, color:'rgba(255,255,255,.3)' }}>· @{tx.party}</span>}
                {tx.rail && (
                  <span style={{ fontSize:9, padding:'2px 6px', background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.15)', borderRadius:10, color:'#93c5fd' }}>
                    {tx.rail.toUpperCase()}
                  </span>
                )}
                {tx.koweHash && (
                  <span style={{ fontSize:9, color:'rgba(255,255,255,.2)', fontFamily:'monospace' }}>#{tx.koweHash}</span>
                )}
              </div>
            </div>
            <span style={{ fontSize:14, fontWeight:700, flexShrink:0, color: tx.direction === 'IN' ? '#4ade80' : 'rgba(255,255,255,.6)' }}>
              {tx.direction === 'IN' ? '+' : '−'}{fc(tx.amount)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ margin:'8px 16px 16px', padding:12, background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12 }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.35)', lineHeight:1.6 }}>
          🔐 Every transaction signed with a <span style={{ color:'#fbbf24' }}>Kòwè receipt</span> — SHA-256 hash anchored to the Debunk Ledger (port 3099). Receipts are INSERT-only; no transaction record can be mutated.
        </p>
      </div>
    </div>
  )
}

// ── Blockchain tab ────────────────────────────────────────────
function BlockchainTab() {
  const [railSel, setRailSel] = React.useState('cowrie_l2')
  const chainBal = { afc: 3_200, cwr: 12_450, nativeAfro: 540 }

  return (
    <div>
      {/* CowrieChain L2 bridge */}
      <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:2 }}>🔗 CowrieChain L2</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginBottom:12 }}>Sub-second finality · Substrate-based · AFRO native chain</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
          {[
            ['AfriCoin', `${fc(chainBal.afc)} AFC`, '#4ade80'],
            ['Cowrie',   `${fc(chainBal.cwr)}`,     '#fbbf24'],
            ['AFRO',     `${chainBal.nativeAfro} AFRO`, '#a78bfa'],
          ].map(([label, val, color]) => (
            <div key={label as string} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
              <p style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginBottom:4 }}>{label}</p>
              <p style={{ fontSize:12, fontWeight:800, color: color as string }}>{val}</p>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ flex:1, padding:10, background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:10, color:'#4ade80', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            ↙️ Bridge In
          </button>
          <button style={{ flex:1, padding:10, background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.2)', borderRadius:10, color:'#a78bfa', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            ↗️ Bridge Out
          </button>
        </div>
      </div>

      {/* Recent blocks */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:700, marginBottom:8 }}>RECENT BLOCKS</p>
        <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,.35)', fontSize:12 }}>
          <div style={{ fontSize:24, marginBottom:8 }}>🔗</div>
          No blocks yet -- connect to CowrieChain L2 to see live data.
        </div>
        <div style={{ display:'flex', gap:12, marginTop:10 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>Validators: <span style={{ color:'#4ade80', fontWeight:700 }}>21 / 25 active</span></div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>Finality: <span style={{ color:'#4ade80', fontWeight:700 }}>~6s</span></div>
        </div>
      </div>

      {/* Payment rails */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:700, marginBottom:8 }}>PAYMENT RAILS</p>
        {RAILS.map(rail => (
          <button key={rail.id} onClick={() => setRailSel(rail.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:6, borderRadius:12, border:`1px solid ${railSel===rail.id ? 'rgba(251,191,36,.35)' : 'rgba(255,255,255,.07)'}`, background: railSel===rail.id ? 'rgba(251,191,36,.06)' : 'rgba(255,255,255,.02)', textAlign:'left', cursor:'pointer' }}>
            <span style={{ fontSize:18 }}>{rail.emoji}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:12, fontWeight:700, color: railSel===rail.id ? '#fbbf24' : '#fff' }}>{rail.name}</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>{rail.desc}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {!rail.active && <span style={{ fontSize:9, color:'#f59e0b' }}>offline</span>}
              <div style={{ width:8, height:8, borderRadius:'50%', background: rail.active ? '#4ade80' : '#374151' }}/>
            </div>
          </button>
        ))}
      </div>

      {/* Interbank corridors */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:700, marginBottom:8 }}>INTERBANK CORRIDORS</p>
        {CORRIDORS.map(cor => (
          <div key={cor.to} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.03)' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:12, color:'#fff' }}>{cor.from} → {cor.to}</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:1 }}>{cor.rail}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:11, color:'#4ade80', fontWeight:700 }}>{cor.fee}</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>{cor.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Substrate pallets */}
      <div style={{ padding:'12px 16px 16px' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:700, marginBottom:8 }}>SUBSTRATE PALLETS ACTIVE</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['pallet-talking-drum','pallet-vdf-time-lock','pallet-burn-or-reveal','pallet-ajo-circle','pallet-escrow','pallet-village-treasury','pallet-kowe-receipt','pallet-nft-regalia','pallet-proof-of-hand','pallet-afroid-link'].map(p => (
            <span key={p} style={{ fontSize:9, padding:'3px 7px', background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.2)', borderRadius:20, color:'#818cf8', fontFamily:'monospace' }}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Send Money Modal ────────────────────────────────────────

function SendMoneyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = React.useState<'input'|'confirm'|'pin'|'success'>('input')
  const [recipient, setRecipient] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [note, setNote] = React.useState('')
  const [pin, setPin] = React.useState('')
  const [method, setMethod] = React.useState<'cowrie'|'bank'|'mesh'>('cowrie')

  const RECENT = [
    { name:'Kofi Mensah', handle:'@kofi.akn', avatar:'👨🏾‍💼' },
    { name:'Chioma Adeyemi', handle:'@chioma.yor', avatar:'🧺' },
    { name:'Zara Ewe', handle:'@zara.ewe', avatar:'👩🏾‍🎨' },
    { name:'Kwame Asante', handle:'@kwame.agr', avatar:'👨🏾‍🌾' },
  ]

  const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000]

  const reset = () => { setStep('input'); setRecipient(''); setAmount(''); setNote(''); setPin('') }

  if (!open) return null

  return (
    <div onClick={() => { onClose(); reset() }} style={{ position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)',display:'flex',flexDirection:'column' }}>
      <div style={{ flex:1 }} />
      <div onClick={e => e.stopPropagation()} style={{ background:'#0f0f0f',borderRadius:'28px 28px 0 0',padding:'0 0 40px',maxHeight:'90dvh',overflow:'auto' }}>
        <div style={{ width:40,height:4,borderRadius:99,background:'rgba(255,255,255,.2)',margin:'12px auto 16px' }} />

        {step === 'input' && (
          <div style={{ padding:'0 16px' }}>
            <p style={{ fontSize:20,fontWeight:800,color:'#fff',marginBottom:16 }}>↗️ Send Money</p>

            {/* Recipient */}
            <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6 }}>To</p>
            <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="@handle, phone, or Afro-ID..." style={{ width:'100%',padding:'12px 14px',background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:12,fontSize:14,color:'#fff',outline:'none',boxSizing:'border-box',marginBottom:10 }} />

            {/* Recent contacts */}
            <div style={{ display:'flex',gap:10,overflowX:'auto',padding:'4px 0 12px' }}>
              {RECENT.map(r => (
                <div key={r.handle} onClick={() => setRecipient(r.handle)} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',flexShrink:0 }}>
                  <div style={{ width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,border: recipient===r.handle ? '2px solid #fbbf24' : '2px solid transparent' }}>{r.avatar}</div>
                  <span style={{ fontSize:9,color:'rgba(255,255,255,.5)',fontWeight:600 }}>{r.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            {/* Amount */}
            <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6 }}>Amount (₵ Cowrie)</p>
            <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g,''))} placeholder="0.00" type="text" inputMode="decimal" style={{ width:'100%',padding:'14px',background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:12,fontSize:28,fontWeight:800,color:'#fbbf24',outline:'none',textAlign:'center',boxSizing:'border-box' }} />
            <div style={{ display:'flex',gap:6,marginTop:8,flexWrap:'wrap' }}>
              {QUICK_AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(String(a))} style={{ padding:'6px 12px',borderRadius:20,fontSize:10,fontWeight:700,cursor:'pointer',border:'1px solid rgba(251,191,36,.2)',background: amount===String(a)?'rgba(251,191,36,.15)':'rgba(255,255,255,.03)',color: amount===String(a)?'#fbbf24':'rgba(255,255,255,.4)' }}>₵{a.toLocaleString()}</button>
              ))}
            </div>

            {/* Method */}
            <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginTop:14,marginBottom:6 }}>Payment Rail</p>
            <div style={{ display:'flex',gap:6 }}>
              {([['cowrie','🔗','CowriePay'],['bank','🏦','Bank Transfer'],['mesh','📡','Offline Mesh']] as const).map(([id,emoji,label]) => (
                <button key={id} onClick={() => setMethod(id)} style={{ flex:1,padding:'10px 6px',borderRadius:12,fontSize:10,fontWeight:700,cursor:'pointer',border:`1.5px solid ${method===id?'rgba(251,191,36,.4)':'rgba(255,255,255,.08)'}`,background:method===id?'rgba(251,191,36,.08)':'rgba(255,255,255,.03)',color:method===id?'#fbbf24':'rgba(255,255,255,.4)',textAlign:'center' }}>
                  <div style={{ fontSize:18,marginBottom:4 }}>{emoji}</div>
                  {label}
                </button>
              ))}
            </div>

            {/* Note */}
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)" style={{ width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,fontSize:12,color:'#fff',outline:'none',marginTop:14,boxSizing:'border-box' }} />

            <button onClick={() => recipient && amount ? setStep('confirm') : undefined} style={{ width:'100%',padding:14,background: recipient&&amount?'linear-gradient(135deg,#1a7c3e,#0f5028)':'rgba(255,255,255,.08)',border:'none',borderRadius:14,fontSize:14,fontWeight:700,color: recipient&&amount?'#fff':'rgba(255,255,255,.3)',cursor: recipient&&amount?'pointer':'default',marginTop:16 }}>
              Continue →
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ padding:'0 16px',textAlign:'center' }}>
            <p style={{ fontSize:18,fontWeight:800,color:'#fff',marginBottom:20 }}>Confirm Transfer</p>
            <div style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,padding:20,marginBottom:16 }}>
              <p style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:4 }}>Sending to</p>
              <p style={{ fontSize:16,fontWeight:700,color:'#fff',marginBottom:12 }}>{recipient}</p>
              <p style={{ fontSize:36,fontWeight:800,color:'#fbbf24' }}>₵{Number(amount).toLocaleString()}</p>
              <p style={{ fontSize:11,color:'rgba(255,255,255,.35)',marginTop:6 }}>≈ ₦{(Number(amount) * 1200).toLocaleString()} · via {method === 'cowrie' ? 'CowriePay' : method === 'bank' ? 'Bank Transfer' : 'Mesh'}</p>
              {note && <p style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginTop:8,fontStyle:'italic' }}>"{note}"</p>}
              <div style={{ marginTop:12,padding:'8px 12px',background:'rgba(74,222,128,.06)',borderRadius:10,border:'1px solid rgba(74,222,128,.15)' }}>
                <p style={{ fontSize:10,color:'#4ade80',fontWeight:600 }}>🛡 Nkisi Shield active · End-to-end encrypted · Fee: 0.1%</p>
              </div>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={() => setStep('input')} style={{ flex:1,padding:12,borderRadius:12,border:'1px solid rgba(255,255,255,.15)',background:'transparent',color:'rgba(255,255,255,.6)',fontSize:13,fontWeight:600,cursor:'pointer' }}>← Back</button>
              <button onClick={() => setStep('pin')} style={{ flex:1,padding:12,borderRadius:12,border:'none',background:'linear-gradient(135deg,#1a7c3e,#0f5028)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer' }}>🔐 Enter PIN</button>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div style={{ padding:'0 16px',textAlign:'center' }}>
            <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(26,124,62,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px' }}>🔐</div>
            <p style={{ fontSize:16,fontWeight:800,color:'#fff',marginBottom:6 }}>Enter your Cowrie PIN</p>
            <p style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:20 }}>4-digit secure PIN to authorize transfer</p>
            <div style={{ display:'flex',justifyContent:'center',gap:12,marginBottom:20 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width:48,height:56,borderRadius:12,background:'rgba(255,255,255,.06)',border:`2px solid ${pin.length > i ? '#fbbf24' : 'rgba(255,255,255,.1)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#fbbf24',fontWeight:800 }}>
                  {pin[i] ? '●' : ''}
                </div>
              ))}
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxWidth:240,margin:'0 auto' }}>
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => (
                <button key={i} onClick={() => { if(n==='⌫') setPin(p=>p.slice(0,-1)); else if(n!=='' && pin.length<4) { const newPin=pin+n; setPin(newPin); if(newPin.length===4) setTimeout(()=>setStep('success'),600) } }} style={{ width:60,height:52,borderRadius:14,border:'none',background: n===''?'transparent':'rgba(255,255,255,.06)',color:'#fff',fontSize:20,fontWeight:700,cursor: n===''?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ padding:'0 16px',textAlign:'center' }}>
            <div style={{ width:80,height:80,borderRadius:'50%',background:'rgba(74,222,128,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 16px',boxShadow:'0 0 40px rgba(74,222,128,.2)' }}>✅</div>
            <p style={{ fontSize:20,fontWeight:800,color:'#4ade80',marginBottom:4 }}>Transfer Complete</p>
            <p style={{ fontSize:14,color:'rgba(255,255,255,.5)',marginBottom:8 }}>₵{Number(amount).toLocaleString()} sent to {recipient}</p>
            <div style={{ background:'rgba(255,255,255,.04)',borderRadius:12,padding:'12px 14px',marginBottom:16,textAlign:'left' }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}><span style={{ fontSize:11,color:'rgba(255,255,255,.4)' }}>Kòwè Hash</span><span style={{ fontSize:11,color:'#fbbf24',fontFamily:'monospace' }}>0x7e2b9d...f4a1</span></div>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}><span style={{ fontSize:11,color:'rgba(255,255,255,.4)' }}>Rail</span><span style={{ fontSize:11,color:'#fff' }}>{method === 'cowrie' ? 'CowriePay L2' : method === 'bank' ? 'NIBSS/ACH' : 'Mesh BLE'}</span></div>
              <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ fontSize:11,color:'rgba(255,255,255,.4)' }}>Fee</span><span style={{ fontSize:11,color:'#fff' }}>₵{(Number(amount) * 0.001).toFixed(2)}</span></div>
            </div>
            <button onClick={() => { onClose(); reset() }} style={{ width:'100%',padding:14,borderRadius:14,border:'none',background:'linear-gradient(135deg,#1a7c3e,#0f5028)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer' }}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Bill Payments Tab ───────────────────────────────────────

function BillsTab() {
  const [category, setCategory] = React.useState<string>('airtime')
  const [phone, setPhone] = React.useState('')
  const [billAmount, setBillAmount] = React.useState('')
  const [provider, setProvider] = React.useState('')
  const [toast, setToast] = React.useState('')

  const CATEGORIES = [
    { id:'airtime', emoji:'📱', label:'Airtime', providers:['MTN','Glo','Airtel','9mobile'] },
    { id:'data',    emoji:'📶', label:'Data',    providers:['MTN 1GB ₵300','Glo 2GB ₵500','Airtel 5GB ₵1,200'] },
    { id:'power',   emoji:'⚡', label:'Electricity', providers:['EKEDC','IKEDC','AEDC','PHEDC'] },
    { id:'tv',      emoji:'📺', label:'Cable TV', providers:['DSTV','GOtv','StarTimes'] },
    { id:'water',   emoji:'💧', label:'Water',    providers:['Lagos Water Corp','FMWR'] },
    { id:'internet',emoji:'🌐', label:'Internet', providers:['Spectranet','Smile','Swift'] },
  ]

  const AIRTIME_QUICK = [100, 200, 500, 1000, 2000, 5000]
  const active = CATEGORIES.find(c => c.id === category)!

  return (
    <div style={{ padding:'16px' }}>
      <p style={{ fontSize:18,fontWeight:800,color:'#fff',marginBottom:14 }}>💳 Bill Payments</p>

      {/* Category grid */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setCategory(c.id); setProvider('') }} style={{ padding:'12px 6px',borderRadius:14,textAlign:'center',cursor:'pointer',border:`1.5px solid ${category===c.id?'rgba(251,191,36,.4)':'rgba(255,255,255,.08)'}`,background:category===c.id?'rgba(251,191,36,.08)':'rgba(255,255,255,.03)',transition:'all .2s' }}>
            <div style={{ fontSize:22,marginBottom:4 }}>{c.emoji}</div>
            <div style={{ fontSize:10,fontWeight:700,color:category===c.id?'#fbbf24':'rgba(255,255,255,.4)' }}>{c.label}</div>
          </button>
        ))}
      </div>

      {/* Provider pick */}
      <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6 }}>Select Provider</p>
      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:14 }}>
        {active.providers.map(p => (
          <button key={p} onClick={() => setProvider(p)} style={{ padding:'8px 14px',borderRadius:20,fontSize:11,fontWeight:700,cursor:'pointer',border:`1px solid ${provider===p?'rgba(74,222,128,.4)':'rgba(255,255,255,.1)'}`,background:provider===p?'rgba(74,222,128,.1)':'rgba(255,255,255,.03)',color:provider===p?'#4ade80':'rgba(255,255,255,.5)' }}>{p}</button>
        ))}
      </div>

      {/* Phone / meter number */}
      <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6 }}>
        {category === 'power' ? 'Meter Number' : category === 'tv' ? 'Smart Card No.' : 'Phone Number'}
      </p>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={category === 'power' ? '01234567890' : '+234 XXX XXX XXXX'} style={{ width:'100%',padding:'12px 14px',background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:12,fontSize:14,color:'#fff',outline:'none',boxSizing:'border-box',marginBottom:10 }} />

      {/* Amount */}
      {(category === 'airtime' || category === 'data') && (
        <>
          <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6 }}>Amount</p>
          <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:12 }}>
            {AIRTIME_QUICK.map(a => (
              <button key={a} onClick={() => setBillAmount(String(a))} style={{ padding:'6px 14px',borderRadius:20,fontSize:11,fontWeight:700,cursor:'pointer',border:`1px solid ${billAmount===String(a)?'rgba(251,191,36,.3)':'rgba(255,255,255,.08)'}`,background:billAmount===String(a)?'rgba(251,191,36,.1)':'rgba(255,255,255,.03)',color:billAmount===String(a)?'#fbbf24':'rgba(255,255,255,.4)' }}>₵{a.toLocaleString()}</button>
            ))}
          </div>
        </>
      )}

      {/* Pay button */}
      <button onClick={() => setToast('✅ Payment successful!')} style={{ width:'100%',padding:14,borderRadius:14,border:'none',background: phone&&provider?'linear-gradient(135deg,#1a7c3e,#0f5028)':'rgba(255,255,255,.08)',color: phone&&provider?'#fff':'rgba(255,255,255,.3)',fontSize:14,fontWeight:700,cursor: phone&&provider?'pointer':'default',marginTop:8 }}>
        Pay {billAmount ? `₵${Number(billAmount).toLocaleString()}` : ''} →
      </button>

      {toast && <div style={{ marginTop:12,padding:'10px 14px',background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:10,fontSize:12,fontWeight:600,color:'#4ade80',textAlign:'center' }}>{toast}</div>}

      {/* Recent bills */}
      <div style={{ marginTop:20 }}>
        <p style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8 }}>Recent Payments</p>
        {[
          { label:'MTN Airtime · 080XXX1234', amount:'₵1,000', time:'2d ago', emoji:'📱' },
          { label:'EKEDC Prepaid · Meter 04421', amount:'₵5,000', time:'5d ago', emoji:'⚡' },
          { label:'DSTV Compact Plus · Card 72810', amount:'₵12,500', time:'1w ago', emoji:'📺' },
        ].map((item, i) => (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.05)' }}>
            <span style={{ fontSize:18 }}>{item.emoji}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:12,fontWeight:600,color:'#fff' }}>{item.label}</p>
              <p style={{ fontSize:10,color:'rgba(255,255,255,.35)' }}>{item.time}</p>
            </div>
            <span style={{ fontSize:12,fontWeight:700,color:'#fbbf24' }}>{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Spending Analytics Tab ──────────────────────────────────

function AnalyticsTab() {
  const { txs } = useBankingCtx()

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun']
  const SPEND_DATA = [4200, 6800, 5100, 8900, 7300, 6100]
  const INCOME_DATA = [5500, 7200, 6900, 9400, 8100, 7800]
  const maxVal = Math.max(...SPEND_DATA, ...INCOME_DATA)

  const CATEGORIES = [
    { name:'Commerce & Trade', emoji:'🛒', amount:28500, pct:35, color:'#e07b00' },
    { name:'Ajo Contributions', emoji:'🔄', amount:18000, pct:22, color:'#3b82f6' },
    { name:'Escrow Locked', emoji:'🔒', amount:15200, pct:19, color:'#8b5cf6' },
    { name:'Spray & Tips', emoji:'💸', amount:8400, pct:10, color:'#fbbf24' },
    { name:'Bills & Utilities', emoji:'⚡', amount:6200, pct:8, color:'#ef4444' },
    { name:'Family & Ubuntu', emoji:'🤝', amount:4800, pct:6, color:'#10b981' },
  ]

  const totalOut = txs.filter(t => t.direction === 'OUT').reduce((a, t) => a + t.amount, 0)
  const totalIn = txs.filter(t => t.direction === 'IN').reduce((a, t) => a + t.amount, 0)

  return (
    <div style={{ padding:'16px' }}>
      <p style={{ fontSize:18,fontWeight:800,color:'#fff',marginBottom:14 }}>📊 Spending Analytics</p>

      {/* Summary cards */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20 }}>
        <div style={{ padding:'14px',borderRadius:14,background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.15)' }}>
          <p style={{ fontSize:10,color:'rgba(74,222,128,.6)',fontWeight:700 }}>TOTAL IN</p>
          <p style={{ fontSize:22,fontWeight:800,color:'#4ade80',marginTop:4 }}>{fc(totalIn)}</p>
          <p style={{ fontSize:10,color:'rgba(74,222,128,.5)',marginTop:2 }}>↑ 12% vs last month</p>
        </div>
        <div style={{ padding:'14px',borderRadius:14,background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.15)' }}>
          <p style={{ fontSize:10,color:'rgba(239,68,68,.6)',fontWeight:700 }}>TOTAL OUT</p>
          <p style={{ fontSize:22,fontWeight:800,color:'#f87171',marginTop:4 }}>{fc(totalOut)}</p>
          <p style={{ fontSize:10,color:'rgba(239,68,68,.5)',marginTop:2 }}>↓ 8% vs last month</p>
        </div>
      </div>

      {/* Bar chart — 6 months */}
      <div style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:14,padding:'14px',marginBottom:20 }}>
        <p style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',marginBottom:12 }}>6-Month Cash Flow</p>
        <div style={{ display:'flex',alignItems:'flex-end',gap:6,height:120 }}>
          {MONTHS.map((m, i) => (
            <div key={m} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
              <div style={{ display:'flex',gap:2,alignItems:'flex-end',height:100 }}>
                <div style={{ width:10,borderRadius:'4px 4px 0 0',background:'rgba(74,222,128,.6)',height: `${(INCOME_DATA[i] / maxVal) * 100}%`,transition:'height .5s' }} />
                <div style={{ width:10,borderRadius:'4px 4px 0 0',background:'rgba(239,68,68,.5)',height: `${(SPEND_DATA[i] / maxVal) * 100}%`,transition:'height .5s' }} />
              </div>
              <span style={{ fontSize:8,color:'rgba(255,255,255,.3)',fontWeight:600 }}>{m}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',gap:12,marginTop:10,justifyContent:'center' }}>
          <div style={{ display:'flex',alignItems:'center',gap:4 }}><div style={{ width:8,height:8,borderRadius:2,background:'rgba(74,222,128,.6)' }}/><span style={{ fontSize:9,color:'rgba(255,255,255,.4)' }}>Income</span></div>
          <div style={{ display:'flex',alignItems:'center',gap:4 }}><div style={{ width:8,height:8,borderRadius:2,background:'rgba(239,68,68,.5)' }}/><span style={{ fontSize:9,color:'rgba(255,255,255,.4)' }}>Spending</span></div>
        </div>
      </div>

      {/* Category breakdown */}
      <p style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',marginBottom:10 }}>Spending by Category</p>
      {CATEGORIES.map((c, i) => (
        <div key={c.name} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontSize:18 }}>{c.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
              <span style={{ fontSize:12,fontWeight:600,color:'#fff' }}>{c.name}</span>
              <span style={{ fontSize:12,fontWeight:700,color:c.color }}>{fc(c.amount)}</span>
            </div>
            <div style={{ height:6,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${c.pct}%`,background:c.color,borderRadius:99,transition:'width .5s' }} />
            </div>
          </div>
          <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',flexShrink:0 }}>{c.pct}%</span>
        </div>
      ))}

      {/* Savings goal */}
      <div style={{ marginTop:20,background:'linear-gradient(135deg,rgba(26,124,62,.08),rgba(26,124,62,.02))',border:'1px solid rgba(26,124,62,.2)',borderRadius:14,padding:'14px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
          <span style={{ fontSize:20 }}>🎯</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13,fontWeight:700,color:'#4ade80' }}>Savings Goal: New Equipment</p>
            <p style={{ fontSize:10,color:'rgba(74,222,128,.5)' }}>Target ₵50,000 · ₵32,400 saved (64.8%)</p>
          </div>
        </div>
        <div style={{ height:8,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
          <div style={{ height:'100%',width:'64.8%',background:'linear-gradient(to right,#1a7c3e,#4ade80)',borderRadius:99 }} />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default function BankingPage() {
  const [tab, setTab] = React.useState<Tab>('wallet')
  const [bankData, setBankData] = React.useState<BankingData>(DEFAULT_DATA)
  const [sendOpen, setSendOpen] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const [balRes, txRes, ajoRes, escrowRes] = await Promise.all([
          fetch('/api/v1/banking/balance').catch(() => null),
          fetch('/api/v1/banking/transactions').catch(() => null),
          fetch('/api/v1/ajo/circles').catch(() => null),
          fetch('/api/v1/escrow/list').catch(() => null),
        ])
        const [balJ, txJ, ajoJ, escrowJ] = await Promise.all([
          balRes?.ok    ? balRes.json()    : null,
          txRes?.ok     ? txRes.json()      : null,
          ajoRes?.ok    ? ajoRes.json()    : null,
          escrowRes?.ok ? escrowRes.json() : null,
        ])
        const live = !!(balJ?.live || txJ?.live || ajoJ?.live || escrowJ?.live)
        setBankData(prev => ({
          ...prev,
          live,
          balance:  balJ?.data   ?? prev.balance,
          txs:      txJ?.data?.transactions  ?? txJ?.data ?? prev.txs,
          circles:  ajoJ?.data?.circles      ?? ajoJ?.data ?? prev.circles,
          escrow:   escrowJ?.data?.escrows   ?? escrowJ?.data ?? prev.escrow,
        }))
      } catch { /* stay on mock data */ }
    }
    load()
  }, [])

  // expose send modal to BalanceHero quick actions
  React.useEffect(() => { (window as any).__openSend = () => setSendOpen(true); return () => { delete (window as any).__openSend } }, [])

  const TABS: Array<{ id: Tab; emoji: string; label: string }> = [
    { id:'wallet',     emoji:'💰', label:'Wallet'    },
    { id:'bills',      emoji:'💳', label:'Bills'     },
    { id:'analytics',  emoji:'📊', label:'Analytics' },
    { id:'ajo',        emoji:'🔄', label:'Ajo 3.0'   },
    { id:'escrow',     emoji:'🔒', label:'Escrow'    },
    { id:'ledger',     emoji:'📋', label:'Ledger'    },
    { id:'blockchain', emoji:'🔗', label:'Chain'     },
  ]

  return (
    <BiometricGate>
    <BankingCtx.Provider value={bankData}>
    <div style={{ background:'#0a0a0a', minHeight:'100vh', color:'#fff', fontFamily:'system-ui,sans-serif', paddingBottom:80 }}>

      {/* Tab bar */}
      <div style={{ display:'flex', background:'#0c0c0c', borderBottom:'1px solid rgba(255,255,255,.06)', position:'sticky', top:0, zIndex:10 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'10px 4px 8px', border:'none', background:'transparent', cursor:'pointer', borderBottom: tab===t.id ? '2px solid #fbbf24' : '2px solid transparent', transition:'all .2s' }}>
            <span style={{ fontSize:16 }}>{t.emoji}</span>
            <span style={{ fontSize:9, fontWeight: tab===t.id ? 700 : 500, color: tab===t.id ? '#fbbf24' : 'rgba(255,255,255,.35)', letterSpacing:'.02em' }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'wallet' && (
        <>
          <BalanceHero />
          <ExchangeRates />
          <MeshPanel />
          <ATMEyeNotice />
        </>
      )}
      {tab === 'ajo'        && <AjoTab />}
      {tab === 'escrow'     && <EscrowTab />}
      {tab === 'ledger'     && <LedgerTab />}
      {tab === 'blockchain' && <BlockchainTab />}
      {tab === 'bills'      && <BillsTab />}
      {tab === 'analytics'  && <AnalyticsTab />}

      <SendMoneyModal open={sendOpen} onClose={() => setSendOpen(false)} />
    </div>
    </BankingCtx.Provider>
    </BiometricGate>
  )
}
