'use client'
// ═══════════════════════════════════════════════════════════════════════════
// JOLLOF TV — Multi-Stakeholder Royalty Split Engine
// Mandatory splits before publish | Blockchain ledger | Smart contract templates
// ═══════════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS } from '@/lib/flags'
import UnderConstruction from '@/components/ui/UnderConstruction'

/* ── inject-once CSS (ry- prefix) ── */
const CSS_ID = 'ry-css-v2'
const CSS = `
@keyframes ryFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes ryPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.4)}50%{box-shadow:0 0 18px 6px rgba(212,160,23,0)}}
@keyframes rySlide{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
@keyframes ryShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes ryGlow{0%,100%{box-shadow:0 0 6px rgba(212,160,23,.3)}50%{box-shadow:0 0 20px rgba(212,160,23,.6)}}
@keyframes ryPie{from{transform:rotate(-90deg)}to{transform:rotate(270deg)}}
@keyframes ryBarGrow{from{width:0}to{width:var(--bar-w)}}
@keyframes ryCountdown{from{opacity:.5;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
.ry-fade{animation:ryFade .35s ease both}
.ry-slide{animation:rySlide .3s ease both}
.ry-pulse{animation:ryPulse 1.8s ease-in-out infinite}
.ry-glow{animation:ryGlow 2s ease-in-out infinite}
.ry-shimmer{background:linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 75%);background-size:200% 100%;animation:ryShimmer 1.5s linear infinite}
.ry-bar{animation:ryBarGrow .7s ease both}
.ry-countdown{animation:ryCountdown .3s ease}
`
function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

/* ── design tokens ── */
const F = { body: 'Inter, system-ui, sans-serif', head: 'Sora, sans-serif' }
const GOLD = '#d4a017'
const GREEN = '#18a05e'
const DANGER = '#c94040'
const BG = '#0d0804'
const TEXT = '#f0f7f0'
const CARD_BG = 'rgba(255,255,255,.04)'
const CARD_BORDER = '1px solid rgba(255,255,255,.08)'

/* ── types ── */
type Tab = 'splits' | 'ledger' | 'templates'
type ContentType = 'Movie' | 'Series' | 'Music' | 'Podcast' | 'Documentary' | 'Short Film'
type PayFreq = 'Per-View' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly'
type StakeholderRole = 'Director' | 'Producer' | 'Writer' | 'Actor/Actress' | 'Cinematographer' | 'Editor' | 'Music Composer' | 'Sound Engineer' | 'Costume Designer' | 'Distributor' | 'Village Treasury' | 'Platform Fee'
type SplitStatus = 'Active' | 'Pending' | 'Complete'
type LedgerFilter = 'All' | 'Incoming' | 'Outgoing' | 'Pending' | 'Disputed'
type TxStatus = 'Confirmed' | 'Pending' | 'Disputed'

interface Stakeholder { id: string; name: string; afroId: string; role: StakeholderRole; percent: number; earned: number; lastPayout: string; locked?: boolean }
interface ContentSplit { id: string; title: string; type: ContentType; origin: string; status: SplitStatus; totalRevenue: number; stakeholders: Stakeholder[]; createdAt: string; boostActive?: boolean; boostExtraEarned?: number; boostEndsAt?: string }
interface LedgerTx { id: string; emoji: string; title: string; amount: number; from: string; to: string; timestamp: string; status: TxStatus; chainHash: string; contentId: string }
interface Template { id: string; name: string; icon: string; stakeholderCount: number; splits: { role: string; percent: number }[] }

/* ── stakeholder palette ── */
const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#818cf8','#a855f7','#ec4899','#14b8a6','#f43f5e','#84cc16','#fb923c']

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════════ */
const MOCK_SPLITS: ContentSplit[] = [
  { id:'s1', title:'Blood of Lagos', type:'Movie', origin:'Nigeria', status:'Active', totalRevenue:8_450_000, createdAt:'2026-03-15', boostActive:true, boostExtraEarned:2_450, boostEndsAt:'2026-04-07T18:30:00Z',
    stakeholders:[
      { id:'h1', name:'Chidera Okafor', afroId:'AFR-NGA-ART-001204', role:'Director', percent:18, earned:1_521_000, lastPayout:'2026-04-06' },
      { id:'h2', name:'Amina Bello', afroId:'AFR-NGA-MED-003891', role:'Producer', percent:22, earned:1_859_000, lastPayout:'2026-04-06' },
      { id:'h3', name:'Kwame Asante', afroId:'AFR-GHA-ART-000412', role:'Writer', percent:12, earned:1_014_000, lastPayout:'2026-04-05' },
      { id:'h4', name:'Ngozi Eze', afroId:'AFR-NGA-ART-007200', role:'Actor/Actress', percent:15, earned:1_267_500, lastPayout:'2026-04-06' },
      { id:'h5', name:'Segun Adeyemi', afroId:'AFR-NGA-MED-005500', role:'Cinematographer', percent:8, earned:676_000, lastPayout:'2026-04-05' },
      { id:'h6', name:'Fatou Diop', afroId:'AFR-SEN-ART-002100', role:'Music Composer', percent:7, earned:591_500, lastPayout:'2026-04-04' },
      { id:'h7', name:'Kojo Mensah', afroId:'AFR-GHA-COM-001900', role:'Distributor', percent:10, earned:845_000, lastPayout:'2026-04-06' },
      { id:'h8', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:253_500, lastPayout:'2026-04-06', locked:true },
      { id:'h9', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:422_500, lastPayout:'2026-04-06', locked:true },
    ]},
  { id:'s2', title:'Motherland Frequencies Vol. 3', type:'Music', origin:'Ghana', status:'Active', totalRevenue:3_780_000, createdAt:'2026-03-28',
    stakeholders:[
      { id:'h10', name:'Yemi Alade Jr.', afroId:'AFR-GHA-ART-004521', role:'Director', percent:40, earned:1_512_000, lastPayout:'2026-04-06' },
      { id:'h11', name:'Kofi Beats', afroId:'AFR-GHA-ART-002300', role:'Producer', percent:22, earned:831_600, lastPayout:'2026-04-05' },
      { id:'h12', name:'Ama Darko', afroId:'AFR-GHA-MED-003200', role:'Writer', percent:15, earned:567_000, lastPayout:'2026-04-05' },
      { id:'h13', name:'Fatima Records', afroId:'AFR-NGA-COM-008800', role:'Distributor', percent:12, earned:453_600, lastPayout:'2026-04-04' },
      { id:'h14', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:113_400, lastPayout:'2026-04-06', locked:true },
      { id:'h15', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:189_000, lastPayout:'2026-04-06', locked:true },
      { id:'h16', name:'Reserve Fund', afroId:'AFR-GHA-FIN-000100', role:'Editor', percent:3, earned:113_400, lastPayout:'2026-04-03' },
    ]},
  { id:'s3', title:'Silicon Savannah S2', type:'Series', origin:'Kenya', status:'Active', totalRevenue:6_120_000, createdAt:'2026-02-10',
    stakeholders:[
      { id:'h17', name:'Wanjiku Mwangi', afroId:'AFR-KEN-EDU-001100', role:'Director', percent:12, earned:734_400, lastPayout:'2026-04-06' },
      { id:'h18', name:'Kamau Njoroge', afroId:'AFR-KEN-TEC-003300', role:'Producer', percent:18, earned:1_101_600, lastPayout:'2026-04-06' },
      { id:'h19', name:'Akinyi Odhiambo', afroId:'AFR-KEN-ART-002800', role:'Writer', percent:15, earned:918_000, lastPayout:'2026-04-05' },
      { id:'h20', name:'Jabari Kimathi', afroId:'AFR-KEN-ART-004400', role:'Actor/Actress', percent:20, earned:1_224_000, lastPayout:'2026-04-06' },
      { id:'h21', name:'Nairobi Studios', afroId:'AFR-KEN-MED-009000', role:'Distributor', percent:15, earned:918_000, lastPayout:'2026-04-05' },
      { id:'h22', name:'Sound of Kenya', afroId:'AFR-KEN-ART-005500', role:'Sound Engineer', percent:7, earned:428_400, lastPayout:'2026-04-04' },
      { id:'h23', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:183_600, lastPayout:'2026-04-06', locked:true },
      { id:'h24', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:306_000, lastPayout:'2026-04-06', locked:true },
      { id:'h25', name:'Production Reserve', afroId:'AFR-KEN-FIN-001200', role:'Costume Designer', percent:5, earned:306_000, lastPayout:'2026-04-03' },
    ]},
  { id:'s4', title:'Drums of Destiny', type:'Documentary', origin:'Mali', status:'Pending', totalRevenue:1_240_000, createdAt:'2026-04-01',
    stakeholders:[
      { id:'h26', name:'Ousmane Traore', afroId:'AFR-MLI-ART-001100', role:'Director', percent:25, earned:310_000, lastPayout:'2026-04-05' },
      { id:'h27', name:'Aminata Keita', afroId:'AFR-MLI-EDU-002200', role:'Producer', percent:20, earned:248_000, lastPayout:'2026-04-04' },
      { id:'h28', name:'Bakary Sangare', afroId:'AFR-MLI-ART-003300', role:'Cinematographer', percent:12, earned:148_800, lastPayout:'2026-04-03' },
      { id:'h29', name:'Fatoumata Diarra', afroId:'AFR-MLI-ART-004400', role:'Music Composer', percent:10, earned:124_000, lastPayout:'2026-04-03' },
      { id:'h30', name:'Mali Cultural Fund', afroId:'AFR-MLI-GOV-000100', role:'Distributor', percent:15, earned:186_000, lastPayout:'2026-04-04' },
      { id:'h31', name:'Editor Team', afroId:'AFR-MLI-MED-005500', role:'Editor', percent:7, earned:86_800, lastPayout:'2026-04-02' },
      { id:'h32', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:37_200, lastPayout:'2026-04-05', locked:true },
      { id:'h33', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:62_000, lastPayout:'2026-04-05', locked:true },
      { id:'h34', name:'Archive Reserve', afroId:'AFR-MLI-ART-006600', role:'Writer', percent:3, earned:37_200, lastPayout:'2026-04-01' },
    ]},
  { id:'s5', title:'The Oracle Podcast', type:'Podcast', origin:'Senegal', status:'Active', totalRevenue:920_000, createdAt:'2026-01-20',
    stakeholders:[
      { id:'h35', name:'Ibrahima Sow', afroId:'AFR-SEN-MED-001100', role:'Director', percent:45, earned:414_000, lastPayout:'2026-04-06' },
      { id:'h36', name:'Mariama Ba', afroId:'AFR-SEN-ART-002200', role:'Producer', percent:18, earned:165_600, lastPayout:'2026-04-05' },
      { id:'h37', name:'Cheikh Diallo', afroId:'AFR-SEN-MED-003300', role:'Editor', percent:12, earned:110_400, lastPayout:'2026-04-04' },
      { id:'h38', name:'Guest Reserve', afroId:'AFR-SEN-EDU-004400', role:'Writer', percent:10, earned:92_000, lastPayout:'2026-04-03' },
      { id:'h39', name:'Sponsor Pool', afroId:'AFR-SEN-COM-005500', role:'Distributor', percent:7, earned:64_400, lastPayout:'2026-04-02' },
      { id:'h40', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:27_600, lastPayout:'2026-04-06', locked:true },
      { id:'h41', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:46_000, lastPayout:'2026-04-06', locked:true },
    ]},
  { id:'s6', title:'Midnight in Nairobi', type:'Short Film', origin:'Kenya', status:'Complete', totalRevenue:2_340_000, createdAt:'2026-01-05',
    stakeholders:[
      { id:'h42', name:'Tunde Fashola', afroId:'AFR-KEN-ART-007700', role:'Director', percent:25, earned:585_000, lastPayout:'2026-03-30' },
      { id:'h43', name:'Adaeze Nwosu', afroId:'AFR-NGA-ART-006600', role:'Producer', percent:20, earned:468_000, lastPayout:'2026-03-30' },
      { id:'h44', name:'Blessing Okoro', afroId:'AFR-NGA-ART-008800', role:'Writer', percent:15, earned:351_000, lastPayout:'2026-03-30' },
      { id:'h45', name:'Cast Ensemble', afroId:'AFR-KEN-ART-009900', role:'Actor/Actress', percent:15, earned:351_000, lastPayout:'2026-03-30' },
      { id:'h46', name:'Crew Pool', afroId:'AFR-KEN-ART-010100', role:'Cinematographer', percent:12, earned:280_800, lastPayout:'2026-03-30' },
      { id:'h47', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:70_200, lastPayout:'2026-03-30', locked:true },
      { id:'h48', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:117_000, lastPayout:'2026-03-30', locked:true },
      { id:'h49', name:'Festival Reserve', afroId:'AFR-KEN-ART-011200', role:'Distributor', percent:5, earned:117_000, lastPayout:'2026-03-28' },
    ]},
  { id:'s7', title:'Jewels of the Niger', type:'Movie', origin:'Niger', status:'Active', totalRevenue:4_680_000, createdAt:'2026-03-01',
    stakeholders:[
      { id:'h50', name:'Moussa Abdou', afroId:'AFR-NER-ART-001100', role:'Director', percent:18, earned:842_400, lastPayout:'2026-04-06' },
      { id:'h51', name:'Hadiza Ibrahim', afroId:'AFR-NER-MED-002200', role:'Producer', percent:20, earned:936_000, lastPayout:'2026-04-06' },
      { id:'h52', name:'Boubacar Sidi', afroId:'AFR-NER-ART-003300', role:'Writer', percent:12, earned:561_600, lastPayout:'2026-04-05' },
      { id:'h53', name:'Aissatou Maiga', afroId:'AFR-NER-ART-004400', role:'Actor/Actress', percent:17, earned:795_600, lastPayout:'2026-04-06' },
      { id:'h54', name:'Sahel Studios', afroId:'AFR-NER-MED-005500', role:'Distributor', percent:13, earned:608_400, lastPayout:'2026-04-05' },
      { id:'h55', name:'Crew Collective', afroId:'AFR-NER-ART-006600', role:'Cinematographer', percent:7, earned:327_600, lastPayout:'2026-04-04' },
      { id:'h56', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:140_400, lastPayout:'2026-04-06', locked:true },
      { id:'h57', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:234_000, lastPayout:'2026-04-06', locked:true },
      { id:'h58', name:'Sound Team', afroId:'AFR-NER-ART-007700', role:'Sound Engineer', percent:5, earned:234_000, lastPayout:'2026-04-03' },
    ]},
  { id:'s8', title:'Afrobeats Academy', type:'Music', origin:'Nigeria', status:'Pending', totalRevenue:1_890_000, createdAt:'2026-04-03',
    stakeholders:[
      { id:'h59', name:'Davido Adeleke Jr.', afroId:'AFR-NGA-ART-009100', role:'Director', percent:35, earned:661_500, lastPayout:'2026-04-06' },
      { id:'h60', name:'Wizkid Productions', afroId:'AFR-NGA-MED-010200', role:'Producer', percent:20, earned:378_000, lastPayout:'2026-04-05' },
      { id:'h61', name:'Tiwa Savage Co.', afroId:'AFR-NGA-ART-011300', role:'Writer', percent:15, earned:283_500, lastPayout:'2026-04-05' },
      { id:'h62', name:'Burna Sound', afroId:'AFR-NGA-ART-012400', role:'Sound Engineer', percent:10, earned:189_000, lastPayout:'2026-04-04' },
      { id:'h63', name:'Afro Label', afroId:'AFR-NGA-COM-013500', role:'Distributor', percent:9, earned:170_100, lastPayout:'2026-04-04' },
      { id:'h64', name:'Village Treasury', afroId:'TREASURY', role:'Village Treasury', percent:3, earned:56_700, lastPayout:'2026-04-06', locked:true },
      { id:'h65', name:'AFRO Platform', afroId:'PLATFORM', role:'Platform Fee', percent:5, earned:94_500, lastPayout:'2026-04-06', locked:true },
      { id:'h66', name:'Marketing Pool', afroId:'AFR-NGA-COM-014600', role:'Costume Designer', percent:3, earned:56_700, lastPayout:'2026-04-02' },
    ]},
]

const MOCK_LEDGER: LedgerTx[] = [
  { id:'tx1', emoji:'🎬', title:'Blood of Lagos', amount:15_200, from:'AFR-NGA-...4521', to:'AFR-NGA-...1204', timestamp:'2026-04-07T09:58:00Z', status:'Confirmed', chainHash:'0xaf3e8b21c4d9...c891f2a0', contentId:'s1' },
  { id:'tx2', emoji:'🎵', title:'Motherland Frequencies Vol. 3', amount:8_750, from:'AFR-GHA-...2300', to:'AFR-GHA-...4521', timestamp:'2026-04-07T09:42:00Z', status:'Confirmed', chainHash:'0xb7d14f02e8a3...4f025bc1', contentId:'s2' },
  { id:'tx3', emoji:'📺', title:'Silicon Savannah S2', amount:22_400, from:'AFR-KEN-...3300', to:'AFR-KEN-...1100', timestamp:'2026-04-07T09:15:00Z', status:'Confirmed', chainHash:'0xc4a87e33f1b2...7e33d4a0', contentId:'s3' },
  { id:'tx4', emoji:'🎭', title:'Drums of Destiny', amount:3_200, from:'AFR-MLI-...1100', to:'AFR-MLI-...2200', timestamp:'2026-04-07T08:51:00Z', status:'Pending', chainHash:'0xd5b92a14c7e6...2a14f8b3', contentId:'s4' },
  { id:'tx5', emoji:'🎬', title:'Blood of Lagos', amount:45_000, from:'AFR-NGA-...8800', to:'AFR-NGA-...3891', timestamp:'2026-04-07T08:30:00Z', status:'Confirmed', chainHash:'0xe6ca8b55d3f4...8b55c2d1', contentId:'s1' },
  { id:'tx6', emoji:'🎙', title:'The Oracle Podcast', amount:5_600, from:'AFR-SEN-...2200', to:'AFR-SEN-...1100', timestamp:'2026-04-07T07:45:00Z', status:'Confirmed', chainHash:'0xf7db9c66e4a5...9c66d3e2', contentId:'s5' },
  { id:'tx7', emoji:'🎬', title:'Midnight in Nairobi', amount:12_300, from:'AFR-KEN-...7700', to:'AFR-NGA-...6600', timestamp:'2026-04-07T06:20:00Z', status:'Confirmed', chainHash:'0xa1ec3d77f5b6...3d77e4f3', contentId:'s6' },
  { id:'tx8', emoji:'🎬', title:'Jewels of the Niger', amount:18_900, from:'AFR-NER-...2200', to:'AFR-NER-...1100', timestamp:'2026-04-07T05:10:00Z', status:'Confirmed', chainHash:'0xb2fd4e88a6c7...4e88f5a4', contentId:'s7' },
  { id:'tx9', emoji:'🎵', title:'Afrobeats Academy', amount:9_400, from:'AFR-NGA-...10200', to:'AFR-NGA-...9100', timestamp:'2026-04-07T04:00:00Z', status:'Pending', chainHash:'0xc30e5f99b7d8...5f99a6b5', contentId:'s8' },
  { id:'tx10', emoji:'📺', title:'Silicon Savannah S2', amount:31_200, from:'AFR-KEN-...4400', to:'AFR-KEN-...3300', timestamp:'2026-04-07T02:30:00Z', status:'Confirmed', chainHash:'0xd41f6a00c8e9...6a00b7c6', contentId:'s3' },
  { id:'tx11', emoji:'🎬', title:'Blood of Lagos', amount:7_800, from:'AFR-NGA-...1204', to:'AFR-GHA-...0412', timestamp:'2026-04-06T23:15:00Z', status:'Confirmed', chainHash:'0xe52a7b11d9fa...7b11c8d7', contentId:'s1' },
  { id:'tx12', emoji:'🎵', title:'Motherland Frequencies Vol. 3', amount:14_600, from:'AFR-GHA-...4521', to:'AFR-GHA-...3200', timestamp:'2026-04-06T21:00:00Z', status:'Disputed', chainHash:'0xf63b8c22eafb...8c22d9e8', contentId:'s2' },
  { id:'tx13', emoji:'🎭', title:'Drums of Destiny', amount:6_100, from:'AFR-MLI-...3300', to:'AFR-MLI-...4400', timestamp:'2026-04-06T19:45:00Z', status:'Confirmed', chainHash:'0xa74c9d33fb0c...9d33eaf9', contentId:'s4' },
  { id:'tx14', emoji:'🎙', title:'The Oracle Podcast', amount:2_800, from:'AFR-SEN-...1100', to:'AFR-SEN-...3300', timestamp:'2026-04-06T17:30:00Z', status:'Confirmed', chainHash:'0xb85dae44ac1d...ae44fb0a', contentId:'s5' },
  { id:'tx15', emoji:'🎬', title:'Jewels of the Niger', amount:25_700, from:'AFR-NER-...1100', to:'AFR-NER-...4400', timestamp:'2026-04-06T15:00:00Z', status:'Confirmed', chainHash:'0xc96ebf55bd2e...bf55ac1b', contentId:'s7' },
  { id:'tx16', emoji:'🎵', title:'Afrobeats Academy', amount:4_300, from:'AFR-NGA-...11300', to:'AFR-NGA-...9100', timestamp:'2026-04-06T12:00:00Z', status:'Pending', chainHash:'0xda7fc066ce3f...c066bd2c', contentId:'s8' },
  { id:'tx17', emoji:'🎬', title:'Blood of Lagos', amount:52_000, from:'PLATFORM', to:'AFR-NGA-...1204', timestamp:'2026-04-06T09:00:00Z', status:'Confirmed', chainHash:'0xeb80d177df40...d177ce3d', contentId:'s1' },
  { id:'tx18', emoji:'📺', title:'Silicon Savannah S2', amount:19_500, from:'AFR-KEN-...2800', to:'AFR-KEN-...9000', timestamp:'2026-04-06T06:30:00Z', status:'Confirmed', chainHash:'0xfc91e288ea51...e288df4e', contentId:'s3' },
  { id:'tx19', emoji:'🎬', title:'Midnight in Nairobi', amount:8_200, from:'AFR-NGA-...8800', to:'AFR-KEN-...7700', timestamp:'2026-04-05T22:00:00Z', status:'Disputed', chainHash:'0xada2f399fb62...f399ea5f', contentId:'s6' },
  { id:'tx20', emoji:'🎵', title:'Motherland Frequencies Vol. 3', amount:11_100, from:'AFR-GHA-...2300', to:'TREASURY', timestamp:'2026-04-05T18:00:00Z', status:'Confirmed', chainHash:'0xbeb30400ac73...0400fb60', contentId:'s2' },
]

const MOCK_DISPUTES = [
  { id:'d1', title:'Motherland Frequencies Vol. 3', claimant:'Ama Darko', reason:'Missing writer credit for Track 7', amount:14_600, filedAt:'2026-04-06T21:00:00Z', deadlineAt:'2026-04-13T21:00:00Z' },
  { id:'d2', title:'Midnight in Nairobi', claimant:'Blessing Okoro', reason:'Percentage recalculation after re-edit', amount:8_200, filedAt:'2026-04-05T22:00:00Z', deadlineAt:'2026-04-12T22:00:00Z' },
]

const TEMPLATES: Template[] = [
  { id:'t1', name:'Feature Film (60+ min)', icon:'🎬', stakeholderCount:10,
    splits:[{role:'Director',percent:15},{role:'Producer',percent:20},{role:'Writers',percent:10},{role:'Cast',percent:15},{role:'Crew',percent:12},{role:'Music',percent:5},{role:'Distributor',percent:8},{role:'Village Treasury',percent:3},{role:'Platform Fee',percent:5},{role:'Reserve',percent:7}] },
  { id:'t2', name:'Music Album', icon:'🎵', stakeholderCount:7,
    splits:[{role:'Artist',percent:40},{role:'Producer',percent:20},{role:'Writers',percent:15},{role:'Label',percent:10},{role:'Village Treasury',percent:3},{role:'Platform Fee',percent:5},{role:'Marketing',percent:7}] },
  { id:'t3', name:'Series / Season', icon:'📺', stakeholderCount:9,
    splits:[{role:'Showrunner',percent:12},{role:'Director',percent:10},{role:'Writers',percent:15},{role:'Cast',percent:20},{role:'Crew',percent:10},{role:'Studio',percent:15},{role:'Village Treasury',percent:3},{role:'Platform Fee',percent:5},{role:'Reserve',percent:10}] },
  { id:'t4', name:'Documentary', icon:'🎭', stakeholderCount:11,
    splits:[{role:'Director',percent:25},{role:'Producer',percent:20},{role:'Research',percent:10},{role:'Camera',percent:8},{role:'Editor',percent:7},{role:'Narrator',percent:5},{role:'Music',percent:5},{role:'Distributor',percent:8},{role:'Village Treasury',percent:3},{role:'Platform Fee',percent:5},{role:'Reserve',percent:4}] },
  { id:'t5', name:'Podcast', icon:'🎙', stakeholderCount:8,
    splits:[{role:'Host',percent:45},{role:'Producer',percent:15},{role:'Editor',percent:10},{role:'Guest',percent:10},{role:'Sponsor',percent:5},{role:'Village Treasury',percent:3},{role:'Platform Fee',percent:5},{role:'Reserve',percent:7}] },
  { id:'t6', name:'Short Film', icon:'🎞', stakeholderCount:8,
    splits:[{role:'Director',percent:25},{role:'Producer',percent:20},{role:'Writer',percent:15},{role:'Cast',percent:15},{role:'Crew',percent:10},{role:'Village Treasury',percent:3},{role:'Platform Fee',percent:5},{role:'Reserve',percent:7}] },
]

/* ── helpers ── */
function cowrieFmt(n: number): string { return `₡${n.toLocaleString('en')}` }
function relativeTime(iso: string, now: number): string {
  if (!now) return ''
  const diff = now - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
function truncId(id: string): string { return id.length > 16 ? id.slice(0,12) + '...' + id.slice(-4) : id }
function countdownStr(iso: string, now: number): string {
  if (!now) return '...'
  const diff = new Date(iso).getTime() - now
  if (diff <= 0) return 'Expired'
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hrs}h ${mins}m`
}

/* ═══════════════════════════════════════════════════════════════════
   UI ATOMS
═══════════════════════════════════════════════════════════════════ */
function Card({ children, style, onClick, className }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; className?: string }) {
  return <div className={className} onClick={onClick} style={{ background: CARD_BG, borderRadius: 14, padding: 16, border: CARD_BORDER, cursor: onClick ? 'pointer' : undefined, ...style }}>{children}</div>
}

function Btn({ label, onClick, color = GREEN, disabled, style }: { label: string; onClick?: () => void; color?: string; disabled?: boolean; style?: React.CSSProperties }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: disabled ? 'rgba(255,255,255,.06)' : color, color: disabled ? 'rgba(255,255,255,.25)' : '#fff', fontSize: 13, fontWeight: 700, fontFamily: F.body, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'opacity .15s', ...style }}>{label}</button>
}

function Input({ value, onChange, placeholder, type = 'text', disabled, style }: { value: string; onChange: (v: string) => void; placeholder: string; type?: string; disabled?: boolean; style?: React.CSSProperties }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} disabled={disabled} style={{ width: '100%', boxSizing: 'border-box', background: disabled ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', color: disabled ? 'rgba(255,255,255,.35)' : '#fff', fontSize: 13, fontFamily: F.body, outline: 'none', ...style }} />
}

function Dropdown({ value, onChange, options, disabled, style }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean; style?: React.CSSProperties }) {
  return <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} style={{ width: '100%', boxSizing: 'border-box', background: disabled ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', color: disabled ? 'rgba(255,255,255,.35)' : '#fff', fontSize: 13, fontFamily: F.body, outline: 'none', appearance: 'none', ...style }}>
    {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1a1008' }}>{o.label}</option>)}
  </select>
}

/* ── CSS pie chart ── */
function PieChart({ data, size = 120 }: { data: { percent: number; color: string; label: string }[]; size?: number }) {
  let acc = 0
  const stops = data.map(d => { const start = acc; acc += d.percent; return `${d.color} ${start * 3.6}deg ${acc * 3.6}deg` }).join(', ')
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${stops})` }} />
      <div style={{ position: 'absolute', top: size * .22, left: size * .22, width: size * .56, height: size * .56, borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * .16, fontWeight: 800, color: GOLD, fontFamily: F.head }}>{data.length}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SPLIT DETAIL OVERLAY
═══════════════════════════════════════════════════════════════════ */
function SplitDetail({ split, onClose }: { split: ContentSplit; onClose: () => void }) {
  const pieData = split.stakeholders.map((s, i) => ({ percent: s.percent, color: COLORS[i % COLORS.length], label: s.name }))
  const dailyRevenue = [
    { label: 'Mon', value: Math.round(split.totalRevenue * .12) },
    { label: 'Tue', value: Math.round(split.totalRevenue * .18) },
    { label: 'Wed', value: Math.round(split.totalRevenue * .15) },
    { label: 'Thu', value: Math.round(split.totalRevenue * .22) },
    { label: 'Fri', value: Math.round(split.totalRevenue * .14) },
    { label: 'Sat', value: Math.round(split.totalRevenue * .11) },
    { label: 'Sun', value: Math.round(split.totalRevenue * .08) },
  ]
  const maxRev = Math.max(...dailyRevenue.map(d => d.value))
  const platformFee = split.stakeholders.find(s => s.role === 'Platform Fee')
  const villageTreasury = split.stakeholders.find(s => s.role === 'Village Treasury')
  const creatorStakes = split.stakeholders.filter(s => !s.locked)
  const lockedStakes = split.stakeholders.filter(s => s.locked)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)' }} />
      <div className="ry-fade" style={{ position: 'relative', background: '#1a1008', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '90vh', overflowY: 'auto', padding: '20px 16px 36px', border: '1px solid rgba(212,160,23,.12)', borderBottom: 'none' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />

        {/* title */}
        <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, fontFamily: F.head, marginBottom: 2 }}>{split.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F.body, background: 'rgba(212,160,23,.1)', color: GOLD }}>{split.type}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontFamily: F.body }}>{split.origin}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', fontFamily: F.body }}>Created {split.createdAt}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F.body, background: split.status === 'Active' ? 'rgba(34,197,94,.12)' : split.status === 'Pending' ? 'rgba(234,179,8,.12)' : 'rgba(255,255,255,.06)', color: split.status === 'Active' ? '#22c55e' : split.status === 'Pending' ? '#eab308' : 'rgba(255,255,255,.35)' }}>{split.status}</span>
          {split.boostActive && <span className="ry-pulse" style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F.body, background: 'rgba(239,68,68,.12)', color: '#ef4444' }}>2x Boost</span>}
        </div>

        {/* pie + total */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
          <PieChart data={pieData} size={130} />
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 4 }}>Total Revenue</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, fontFamily: F.head }}>{cowrieFmt(split.totalRevenue)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginTop: 4 }}>{split.stakeholders.length} stakeholders</div>
          </div>
        </div>

        {/* contract info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          <div style={{ padding: 10, background: CARD_BG, borderRadius: 10, border: CARD_BORDER, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Platform Fee</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: GOLD, fontFamily: F.head }}>{platformFee?.percent || 5}%</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{cowrieFmt(platformFee?.earned || 0)}</div>
          </div>
          <div style={{ padding: 10, background: CARD_BG, borderRadius: 10, border: CARD_BORDER, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Village Tax</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: GREEN, fontFamily: F.head }}>{villageTreasury?.percent || 3}%</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{cowrieFmt(villageTreasury?.earned || 0)}</div>
          </div>
          <div style={{ padding: 10, background: CARD_BG, borderRadius: 10, border: CARD_BORDER, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Creators</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, fontFamily: F.head }}>{creatorStakes.reduce((s, c) => s + c.percent, 0)}%</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{creatorStakes.length} people</div>
          </div>
        </div>

        {/* boost tiers info */}
        {split.boostActive && (
          <Card style={{ marginBottom: 20, background: 'rgba(212,160,23,.04)', border: '1px solid rgba(212,160,23,.1)', padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 8 }}>ROYALTY BOOST TIERS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { tier: 'First 24 Hours', mult: '2.0x', color: '#ef4444', active: true },
                { tier: 'First 48 Hours', mult: '1.5x', color: '#f97316', active: false },
                { tier: 'First 7 Days', mult: '1.2x', color: '#eab308', active: false },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, background: b.active ? `${b.color}10` : 'transparent' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: b.active ? b.color : 'rgba(255,255,255,.15)' }} />
                  <span style={{ fontSize: 12, color: b.active ? b.color : 'rgba(255,255,255,.35)', fontFamily: F.body, fontWeight: b.active ? 700 : 400, flex: 1 }}>{b.tier}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: b.active ? b.color : 'rgba(255,255,255,.25)', fontFamily: F.head }}>{b.mult}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* stakeholder breakdown */}
        <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 10 }}>STAKEHOLDER BREAKDOWN</div>

        {/* Locked stakeholders (Platform + Village) */}
        {lockedStakes.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>Mandatory Allocations</div>
            {lockedStakes.map((sh, i) => {
              const idx = split.stakeholders.indexOf(sh)
              return (
                <div key={sh.id} className="ry-slide" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4, background: 'rgba(212,160,23,.03)', borderRadius: 8, border: '1px solid rgba(212,160,23,.06)', animationDelay: `${i * .04}s` }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx % COLORS.length], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', fontFamily: F.body }}>{sh.name} <span style={{ fontSize: 10, color: GOLD }}>LOCKED</span></div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: GOLD, fontFamily: F.head }}>{sh.percent}%</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{cowrieFmt(sh.earned)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Creator stakeholders */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>Creator Allocations</div>
        {creatorStakes.map((sh, i) => {
          const idx = split.stakeholders.indexOf(sh)
          return (
            <div key={sh.id} className="ry-slide" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)', animationDelay: `${(i + lockedStakes.length) * .04}s` }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx % COLORS.length], flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F.body }}>{sh.name} <span style={{ color: 'rgba(255,255,255,.3)', fontWeight: 400, fontSize: 11 }}>{sh.role}</span></div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{truncId(sh.afroId)} -- Last payout: {sh.lastPayout}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: GOLD, fontFamily: F.head }}>{sh.percent}%</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: F.body }}>{cowrieFmt(sh.earned)}</div>
              </div>
            </div>
          )
        })}

        {/* revenue timeline */}
        <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, fontFamily: F.head, margin: '20px 0 10px' }}>WEEKLY REVENUE</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
          {dailyRevenue.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className="ry-bar" style={{ width: '100%', borderRadius: 4, background: `linear-gradient(to top, ${GOLD}40, ${GOLD})`, '--bar-w': `${Math.max((d.value / maxRev) * 80, 4)}px`, height: `${Math.max((d.value / maxRev) * 80, 4)}px` } as React.CSSProperties} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: F.body }}>{d.label}</span>
            </div>
          ))}
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <Btn label="Pause Payouts" color={DANGER} style={{ flex: 1 }} />
          <Btn label="Edit Split" color="rgba(255,255,255,.1)" style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CREATE NEW SPLIT SHEET
═══════════════════════════════════════════════════════════════════ */
function CreateSplitSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ROLES: StakeholderRole[] = ['Director','Producer','Writer','Actor/Actress','Cinematographer','Editor','Music Composer','Sound Engineer','Costume Designer','Distributor','Village Treasury','Platform Fee']
  const CONTENT_TYPES: ContentType[] = ['Movie','Series','Music','Podcast','Documentary','Short Film']
  const PAY_FREQS: PayFreq[] = ['Per-View','Hourly','Daily','Weekly','Monthly']

  const [title, setTitle] = React.useState('')
  const [contentType, setContentType] = React.useState<ContentType>('Movie')
  const [payFreq, setPayFreq] = React.useState<PayFreq>('Per-View')
  const [minPayout, setMinPayout] = React.useState('100')
  const [boostEnabled, setBoostEnabled] = React.useState(true)
  const [rows, setRows] = React.useState<{ role: StakeholderRole; name: string; afroId: string; percent: number; locked: boolean }[]>([
    { role: 'Platform Fee', name: 'AFRO Platform', afroId: 'PLATFORM', percent: 5, locked: true },
    { role: 'Village Treasury', name: 'Village Treasury', afroId: 'TREASURY', percent: 3, locked: true },
    { role: 'Director', name: '', afroId: '', percent: 0, locked: false },
  ])

  const total = rows.reduce((s, r) => s + r.percent, 0)
  const totalColor = total === 100 ? '#22c55e' : total > 100 ? '#ef4444' : '#eab308'
  const minStakeholders = rows.filter(r => !r.locked).length >= 3
  const valid = title.trim().length > 0 && total === 100 && minStakeholders && rows.filter(r => !r.locked).every(r => r.name.trim() && r.percent > 0)

  function addRow() { setRows(p => [...p, { role: 'Producer', name: '', afroId: '', percent: 0, locked: false }]) }
  function removeRow(i: number) { if (rows[i].locked) return; setRows(p => p.filter((_, idx) => idx !== i)) }
  function updateRow(i: number, field: string, val: string | number) { setRows(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r)) }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)' }} />
      <div className="ry-fade" style={{ position: 'relative', background: '#1a1008', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '92vh', overflowY: 'auto', padding: '20px 16px 36px', border: '1px solid rgba(212,160,23,.12)', borderBottom: 'none' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, fontFamily: F.head, marginBottom: 4 }}>New Royalty Split</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 20 }}>Configure mandatory royalty distribution before publishing</div>

        {/* Content info */}
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 8 }}>CONTENT INFO</div>
        <Input value={title} onChange={setTitle} placeholder="Content title (e.g. Blood of Lagos)" style={{ marginBottom: 10 }} />
        <Dropdown value={contentType} onChange={v => setContentType(v as ContentType)} options={CONTENT_TYPES.map(t => ({ value: t, label: t }))} style={{ marginBottom: 20 }} />

        {/* Stakeholder Registry */}
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 8 }}>STAKEHOLDER REGISTRY</div>

        {/* Running total bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: totalColor, fontFamily: F.body }}>{total}% / 100%</span>
            <span style={{ fontSize: 11, color: total === 100 ? '#22c55e' : 'rgba(255,255,255,.35)', fontFamily: F.body }}>
              {total === 100 ? 'Fully allocated' : total > 100 ? `Over by ${total - 100}%` : `${100 - total}% remaining`}
            </span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(total, 100)}%`, background: totalColor, borderRadius: 4, transition: 'width .3s, background .3s' }} />
          </div>
        </div>

        {rows.map((row, i) => (
          <Card key={i} style={{ marginBottom: 10, padding: 12, position: 'relative', background: row.locked ? 'rgba(212,160,23,.04)' : CARD_BG, border: row.locked ? '1px solid rgba(212,160,23,.12)' : CARD_BORDER }}>
            {row.locked && <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 10, color: GOLD, fontFamily: F.body, fontWeight: 700 }}>LOCKED</div>}
            {!row.locked && rows.filter(r => !r.locked).length > 1 && (
              <button onClick={() => removeRow(i)} style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(201,64,64,.12)', color: DANGER, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <Dropdown value={row.role} onChange={v => updateRow(i, 'role', v)} options={ROLES.map(r => ({ value: r, label: r }))} disabled={row.locked} />
              <Input value={row.name} onChange={v => updateRow(i, 'name', v)} placeholder="Full name" disabled={row.locked} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
              <Input value={row.afroId} onChange={v => updateRow(i, 'afroId', v)} placeholder="AfroID (AFR-...)" disabled={row.locked} />
              <div style={{ position: 'relative' }}>
                <Input value={row.locked ? String(row.percent) : String(row.percent || '')} onChange={v => updateRow(i, 'percent', Math.max(0, Math.min(100, parseInt(v) || 0)))} placeholder="%" type="number" disabled={row.locked} style={{ textAlign: 'center', paddingRight: 22 }} />
                <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', fontSize: 12 }}>%</span>
              </div>
            </div>
          </Card>
        ))}

        <button onClick={addRow} style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: '1px dashed rgba(255,255,255,.15)', background: 'transparent', color: 'rgba(255,255,255,.4)', fontSize: 13, fontFamily: F.body, cursor: 'pointer', marginBottom: 20 }}>+ Add Stakeholder</button>

        {!minStakeholders && <div style={{ fontSize: 11, color: DANGER, fontFamily: F.body, marginBottom: 12 }}>Minimum 3 additional stakeholders required (Director + Producer + 1 other)</div>}

        {/* Smart Contract Terms */}
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 8 }}>SMART CONTRACT TERMS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 4 }}>Payment Frequency</div>
            <Dropdown value={payFreq} onChange={v => setPayFreq(v as PayFreq)} options={PAY_FREQS.map(f => ({ value: f, label: f }))} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 4 }}>Min Payout Threshold</div>
            <Input value={minPayout} onChange={setMinPayout} placeholder="100" type="number" />
          </div>
        </div>

        {/* Time-based royalty boost toggle */}
        <div onClick={() => setBoostEnabled(!boostEnabled)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: boostEnabled ? 'rgba(212,160,23,.08)' : 'rgba(255,255,255,.03)', border: boostEnabled ? '1px solid rgba(212,160,23,.15)' : CARD_BORDER, cursor: 'pointer', marginBottom: 20 }}>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: boostEnabled ? GOLD : 'rgba(255,255,255,.1)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: boostEnabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F.body }}>Time-Based Royalty Boost</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: F.body }}>First 24hr = 2x | First 48hr = 1.5x | First 7d = 1.2x</div>
          </div>
        </div>

        {/* Deploy */}
        <div style={{ marginBottom: 12 }}>
          <Btn label="Deploy Contract" color={GOLD} disabled={!valid} onClick={onClose} style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 800 }} />
        </div>

        {valid && (
          <Card className="ry-fade" style={{ background: 'rgba(24,160,94,.04)', border: '1px solid rgba(24,160,94,.1)', padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, fontFamily: F.head, marginBottom: 4 }}>READY TO DEPLOY</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: F.body, lineHeight: 1.6 }}>
              This contract will be deployed to the AFRO blockchain. All stakeholders will be notified and payouts will begin automatically based on the selected frequency ({payFreq}). Minimum payout: {cowrieFmt(parseInt(minPayout) || 100)}.
            </div>
          </Card>
        )}

        {!valid && total < 100 && rows.filter(r => !r.locked).length >= 3 && title.trim().length > 0 && (
          <div className="ry-shimmer" style={{ height: 48, borderRadius: 10, marginBottom: 12 }} />
        )}

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', fontFamily: F.body, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
          Deployed contracts are immutable and recorded on-chain.
          Platform Fee (5%) and Village Treasury (3%) are mandatory.
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function RoyaltySplitEngine() {
  if (!USE_MOCKS) return <UnderConstruction module="Royalties" />
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [tab, setTab] = React.useState<Tab>('splits')
  const [selectedSplit, setSelectedSplit] = React.useState<ContentSplit | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [ledgerFilter, setLedgerFilter] = React.useState<LedgerFilter>('All')
  const [expandedTx, setExpandedTx] = React.useState<string | null>(null)
  const [now, setNow] = React.useState(0)

  React.useEffect(() => { injectCSS() }, [])
  React.useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])

  const TABS: { key: Tab; label: string }[] = [{ key: 'splits', label: 'My Splits' }, { key: 'ledger', label: 'Ledger' }, { key: 'templates', label: 'Templates' }]

  const filteredTx = MOCK_LEDGER.filter(tx => {
    if (ledgerFilter === 'All') return true
    if (ledgerFilter === 'Incoming') return tx.to.includes('1204') || tx.to.includes('PLATFORM')
    if (ledgerFilter === 'Outgoing') return tx.from.includes('1204') || tx.from.includes('PLATFORM')
    if (ledgerFilter === 'Pending') return tx.status === 'Pending'
    if (ledgerFilter === 'Disputed') return tx.status === 'Disputed'
    return true
  })

  const totalDistributed = MOCK_LEDGER.filter(t => t.status === 'Confirmed').reduce((s, t) => s + t.amount, 0)
  const totalPending = MOCK_LEDGER.filter(t => t.status === 'Pending').reduce((s, t) => s + t.amount, 0)
  const activeContracts = MOCK_SPLITS.filter(s => s.status === 'Active').length

  const STATUS_COLORS: Record<SplitStatus, string> = { Active: '#22c55e', Pending: '#eab308', Complete: 'rgba(255,255,255,.35)' }
  const TX_STATUS: Record<TxStatus, { color: string; icon: string }> = { Confirmed: { color: '#22c55e', icon: '\u2713' }, Pending: { color: '#eab308', icon: '\u23f3' }, Disputed: { color: '#ef4444', icon: '\u26a0' } }
  const FILTERS: LedgerFilter[] = ['All','Incoming','Outgoing','Pending','Disputed']

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: TEXT, fontFamily: F.body, paddingBottom: 100 }}>
      {/* ── Fixed Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,8,4,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: TEXT, fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1 }}>{'\u2190'}</button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: F.head }}>Royalty Split Engine</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: F.body }}>Multi-Stakeholder Revenue Distribution</div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: 0, padding: '0 16px', marginTop: 12, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '10px 0', border: 'none', borderBottom: tab === t.key ? `2px solid ${GOLD}` : '2px solid transparent', background: 'none', color: tab === t.key ? GOLD : 'rgba(255,255,255,.4)', fontSize: 13, fontWeight: tab === t.key ? 700 : 500, fontFamily: F.body, cursor: 'pointer', transition: 'color .2s' }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* ════════════════════════ TAB 1: MY SPLITS ════════════════════════ */}
        {tab === 'splits' && (
          <div className="ry-fade">
            {/* Revenue Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <Card style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Total Lifetime Revenue</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: GOLD, fontFamily: F.head }}>{cowrieFmt(MOCK_SPLITS.reduce((s, c) => s + c.totalRevenue, 0))}</div>
                <div style={{ fontSize: 10, color: '#22c55e', fontFamily: F.body, marginTop: 4 }}>+12.4% this week</div>
              </Card>
              <Card style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Active Contracts</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: TEXT, fontFamily: F.head }}>{MOCK_SPLITS.filter(s => s.status === 'Active').length}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginTop: 4 }}>{MOCK_SPLITS.reduce((s, c) => s + c.stakeholders.length, 0)} total stakeholders</div>
              </Card>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              <Card style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Movies</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', fontFamily: F.head }}>{MOCK_SPLITS.filter(s => s.type === 'Movie').length}</div>
              </Card>
              <Card style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Music</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#818cf8', fontFamily: F.head }}>{MOCK_SPLITS.filter(s => s.type === 'Music').length}</div>
              </Card>
              <Card style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Other</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', fontFamily: F.head }}>{MOCK_SPLITS.filter(s => s.type !== 'Movie' && s.type !== 'Music').length}</div>
              </Card>
            </div>

            {/* Time-Based Royalty Boost Banner */}
            {MOCK_SPLITS.some(s => s.boostActive) && (() => {
              const boosted = MOCK_SPLITS.find(s => s.boostActive)!
              const hoursLeft = boosted.boostEndsAt ? Math.max(0, (new Date(boosted.boostEndsAt).getTime() - now) / 3600000) : 0
              const progressPct = Math.max(0, Math.min(100, (1 - hoursLeft / 24) * 100))
              return (
                <Card className="ry-pulse" style={{ marginBottom: 16, background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.15)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: GOLD, fontFamily: F.head }}>First 24 Hours: 2x Royalty Rate</div>
                    <span className="ry-countdown" style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', fontFamily: F.head }}>{countdownStr(boosted.boostEndsAt!, now)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontFamily: F.body, marginBottom: 8 }}>
                    &quot;{boosted.title}&quot; is in its boost window
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg, ${GOLD}, #ef4444)`, borderRadius: 3, transition: 'width .5s' }} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: GOLD, fontFamily: F.head }}>
                    {cowrieFmt(boosted.boostExtraEarned || 0)} <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.4)' }}>extra earned from boost</span>
                  </div>
                </Card>
              )
            })()}

            {/* Active Splits */}
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 10 }}>ACTIVE SPLITS ({MOCK_SPLITS.length})</div>
            {MOCK_SPLITS.map((split, i) => (
              <Card key={split.id} className="ry-slide" onClick={() => setSelectedSplit(split)} style={{ marginBottom: 12, cursor: 'pointer', animationDelay: `${i * .05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, fontFamily: F.head, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{split.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: F.body }}>{split.type}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: F.body }}>{split.origin}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.2)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>Since {split.createdAt}</span>
                    </div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F.body, background: `${STATUS_COLORS[split.status]}15`, color: STATUS_COLORS[split.status], flexShrink: 0 }}>{split.status}</span>
                </div>
                {/* Stakeholder color strip preview */}
                <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10, gap: 1 }}>
                  {split.stakeholders.map((sh, j) => (
                    <div key={sh.id} style={{ flex: sh.percent, background: COLORS[j % COLORS.length], borderRadius: 1, transition: 'flex .3s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: GOLD, fontFamily: F.head }}>{cowrieFmt(split.totalRevenue)}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{split.stakeholders.length} stakeholders {split.boostActive ? ' -- 2x Boost Active' : ''}</div>
                  </div>
                  <PieChart data={split.stakeholders.map((s, j) => ({ percent: s.percent, color: COLORS[j % COLORS.length], label: s.name }))} size={54} />
                </div>
              </Card>
            ))}

            {/* Create New Split Button */}
            <button className="ry-glow" onClick={() => setCreateOpen(true)} style={{ width: '100%', padding: '16px 0', borderRadius: 14, border: '1px dashed rgba(212,160,23,.3)', background: 'rgba(212,160,23,.04)', color: GOLD, fontSize: 15, fontWeight: 800, fontFamily: F.head, cursor: 'pointer', marginTop: 8 }}>+ Create New Split</button>
          </div>
        )}

        {/* ════════════════════════ TAB 2: LEDGER ════════════════════════ */}
        {tab === 'ledger' && (
          <div className="ry-fade">
            {/* Summary header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'Total Distributed', value: cowrieFmt(totalDistributed), color: '#22c55e' },
                { label: 'Total Pending', value: cowrieFmt(totalPending), color: '#eab308' },
                { label: 'Active Contracts', value: String(activeContracts), color: GOLD },
              ].map((s, i) => (
                <Card key={i} style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: F.head }}>{s.value}</div>
                </Card>
              ))}
            </div>

            {/* Monthly trend */}
            <Card style={{ marginBottom: 16, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 10 }}>WEEKLY DISTRIBUTION TREND</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                {[65, 82, 45, 91, 73, 88, 56].map((pct, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div className="ry-bar" style={{ width: '100%', borderRadius: 3, background: `linear-gradient(to top, ${GREEN}40, ${GREEN})`, height: `${pct * .6}px`, '--bar-w': `${pct * .6}px` } as React.CSSProperties} />
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>7-day volume</span>
                <span style={{ fontSize: 10, color: GREEN, fontFamily: F.body, fontWeight: 700 }}>{cowrieFmt(totalDistributed + totalPending)}</span>
              </div>
            </Card>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setLedgerFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: ledgerFilter === f ? GOLD : 'rgba(255,255,255,.06)', color: ledgerFilter === f ? '#000' : 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 600, fontFamily: F.body, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .2s' }}>{f}</button>
              ))}
            </div>

            {/* Transaction list */}
            {filteredTx.map((tx, i) => {
              const st = TX_STATUS[tx.status]
              const expanded = expandedTx === tx.id
              return (
                <Card key={tx.id} className="ry-slide" onClick={() => setExpandedTx(expanded ? null : tx.id)} style={{ marginBottom: 10, cursor: 'pointer', animationDelay: `${i * .03}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{tx.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{tx.from} {'\u2192'} {tx.to}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: GOLD, fontFamily: F.head }}>{cowrieFmt(tx.amount)}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>{relativeTime(tx.timestamp, now)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F.body, background: `${st.color}15`, color: st.color }}>{st.icon} {tx.status}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontFamily: 'monospace' }}>{tx.chainHash}</span>
                  </div>
                  {expanded && (
                    <div className="ry-fade" style={{ marginTop: 12, padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Full Chain Hash</div>
                          <div style={{ fontSize: 10, color: GOLD, fontFamily: 'monospace', wordBreak: 'break-all' }}>{tx.chainHash}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Content ID</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: 'monospace' }}>{tx.contentId}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Timestamp</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: F.body }}>{new Date(tx.timestamp).toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Network</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: F.body }}>AFRO Substrate L1</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Block Confirmations</div>
                          <div style={{ fontSize: 10, color: tx.status === 'Confirmed' ? '#22c55e' : '#eab308', fontFamily: F.body }}>{tx.status === 'Confirmed' ? '12 / 12' : '3 / 12'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: F.body, marginBottom: 2, textTransform: 'uppercase' }}>Gas Fee</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: F.body }}>{cowrieFmt(Math.round(tx.amount * .001))}</div>
                        </div>
                      </div>
                      <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${GOLD}40`, background: 'transparent', color: GOLD, fontSize: 11, fontFamily: F.body, cursor: 'pointer', width: '100%' }}>View on AFRO Chain Explorer {'\u2197'}</button>
                    </div>
                  )}
                </Card>
              )
            })}

            {/* Dispute Section */}
            {MOCK_DISPUTES.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: F.head, margin: '20px 0 10px' }}>ACTIVE DISPUTES ({MOCK_DISPUTES.length})</div>
                {MOCK_DISPUTES.map(d => {
                  const timeLeft = countdownStr(d.deadlineAt, now)
                  return (
                    <Card key={d.id} style={{ marginBottom: 10, background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: F.body }}>{d.title}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: F.body }}>Filed by {d.claimant}</div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', fontFamily: F.head }}>{cowrieFmt(d.amount)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontFamily: F.body, marginBottom: 10, padding: '8px 10px', background: 'rgba(239,68,68,.04)', borderRadius: 8, borderLeft: '3px solid rgba(239,68,68,.3)' }}>{d.reason}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>Filed: {new Date(d.filedAt).toLocaleDateString()}</div>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)' }} />
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: F.body }}>Deadline: {new Date(d.deadlineAt).toLocaleDateString()}</div>
                      </div>
                      {/* Resolution progress bar */}
                      <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${now ? Math.min(100, Math.max(0, (1 - (new Date(d.deadlineAt).getTime() - now) / (7 * 86400000)) * 100)) : 0}%`, background: 'linear-gradient(90deg, #eab308, #ef4444)', borderRadius: 2 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#eab308', fontFamily: F.body, fontWeight: 600 }}>Resolution timer: {timeLeft}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Btn label="Resolve" color={GREEN} style={{ padding: '6px 14px', fontSize: 11 }} />
                          <Btn label="Review" color="rgba(255,255,255,.1)" style={{ padding: '6px 14px', fontSize: 11 }} />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ════════════════════════ TAB 3: TEMPLATES ════════════════════════ */}
        {tab === 'templates' && (
          <div className="ry-fade">
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, fontFamily: F.head, marginBottom: 4 }}>SMART CONTRACT TEMPLATES</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 16 }}>Pre-built royalty configurations for common content types. Each template includes mandatory Platform Fee (5%) and Village Treasury (3%) allocations.</div>

            {/* template stats summary */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { label: 'Total Templates', value: String(TEMPLATES.length), color: GOLD },
                { label: 'Avg Stakeholders', value: String(Math.round(TEMPLATES.reduce((s, t) => s + t.stakeholderCount, 0) / TEMPLATES.length)), color: '#818cf8' },
                { label: 'Platform + Village', value: '8% locked', color: GREEN },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '8px 14px', borderRadius: 10, background: CARD_BG, border: CARD_BORDER, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: F.body, textTransform: 'uppercase', marginBottom: 2 }}>{stat.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: stat.color, fontFamily: F.head }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {TEMPLATES.map((tmpl, i) => {
              const creatorPct = tmpl.splits.filter(s => s.role !== 'Village Treasury' && s.role !== 'Platform Fee' && s.role !== 'Reserve').reduce((s, sp) => s + sp.percent, 0)
              const reservePct = tmpl.splits.find(s => s.role === 'Reserve')?.percent || 0
              return (
                <Card key={tmpl.id} className="ry-slide" style={{ marginBottom: 12, animationDelay: `${i * .06}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{tmpl.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, fontFamily: F.head }}>{tmpl.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: F.body }}>{tmpl.stakeholderCount} stakeholders -- {creatorPct}% to creators{reservePct > 0 ? ` -- ${reservePct}% reserve` : ''}</div>
                    </div>
                    <Btn label="Use Template" color={GOLD} style={{ padding: '8px 14px', fontSize: 11 }} onClick={() => setCreateOpen(true)} />
                  </div>

                  {/* Full split color strip */}
                  <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10, gap: 1 }}>
                    {tmpl.splits.map((sp, j) => (
                      <div key={j} style={{ flex: sp.percent, background: COLORS[j % COLORS.length], borderRadius: 1 }} />
                    ))}
                  </div>

                  {/* Split bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tmpl.splits.map((sp, j) => {
                      const isLocked = sp.role === 'Village Treasury' || sp.role === 'Platform Fee'
                      return (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[j % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: isLocked ? GOLD : 'rgba(255,255,255,.5)', fontFamily: F.body, width: 110, flexShrink: 0, fontWeight: isLocked ? 700 : 400 }}>{sp.role}{isLocked ? ' *' : ''}</span>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.04)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${sp.percent}%`, background: COLORS[j % COLORS.length], borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', fontFamily: F.body, width: 32, textAlign: 'right', flexShrink: 0 }}>{sp.percent}%</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Locked notice */}
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: F.body, marginTop: 8 }}>* Mandatory allocation -- cannot be removed or reduced</div>
                </Card>
              )
            })}

            {/* Custom Template Builder */}
            <Card className="ry-glow" onClick={() => setCreateOpen(true)} style={{ marginBottom: 12, cursor: 'pointer', border: '1px dashed rgba(212,160,23,.2)', background: 'rgba(212,160,23,.03)', textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: GOLD, fontFamily: F.head, marginBottom: 4 }}>Create Custom Template</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontFamily: F.body, marginBottom: 8 }}>Build your own royalty split template from scratch</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontFamily: F.body }}>Custom templates are saved to your profile and can be reused across all content</div>
            </Card>

            {/* Blockchain Contract Notice */}
            <Card style={{ marginBottom: 12, background: 'rgba(24,160,94,.03)', border: '1px solid rgba(24,160,94,.1)', padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, fontFamily: F.head, marginBottom: 6 }}>ON-CHAIN ENFORCEMENT</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', fontFamily: F.body, lineHeight: 1.7 }}>
                All royalty splits deployed through Jollof TV are recorded as immutable smart contracts on the AFRO Substrate blockchain. Every view, tip, purchase, and subscription triggers an automatic split calculation and payout to all stakeholders. Platform Fee (5%) and Village Treasury (3%) are mandatory and cannot be removed.
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {[
                  { label: 'Immutable', icon: '\uD83D\uDD12' },
                  { label: 'Automatic', icon: '\u26A1' },
                  { label: 'Transparent', icon: '\uD83D\uDC41' },
                ].map((badge, i) => (
                  <div key={i} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'rgba(24,160,94,.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{badge.icon}</div>
                    <div style={{ fontSize: 10, color: GREEN, fontFamily: F.body, fontWeight: 600 }}>{badge.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── Overlays ── */}
      {selectedSplit && <SplitDetail split={selectedSplit} onClose={() => setSelectedSplit(null)} />}
      <CreateSplitSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
