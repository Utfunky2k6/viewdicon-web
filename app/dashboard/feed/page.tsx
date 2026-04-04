'use client'
// ═══════════════════════════════════════════════════════════════════
// SÒRÒ SÓKÈ — The Voice of the Village
// Faithful React implementation of the prototype HTML
// 3 Skins · 5 Geo · 3 Layers · 7 Post Types · 7 Interactions
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import StoriesRow from '@/components/feed/StoriesRow'
import { CommentSheet } from '@/components/feed/CommentSheet'
import { sorosokeApi } from '@/lib/api'
import { MotionFeed } from '@/components/feed/MotionFeed'
import { FeedProgressBar } from '@/components/feed/FeedProgressBar'
import type { Post as MotionPost } from '@/components/feed/feedTypes'

/* ── inject-once CSS ── */
const INJECT_ID = 'soro-styles'
const STYLES = `
@keyframes ssFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes adinkra{0%,100%{opacity:.025}50%{opacity:.04}}
@keyframes nmBreathe{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.1)}50%{box-shadow:0 0 20px 3px rgba(212,160,23,.08)}}
@keyframes wvBar{0%,100%{scaleY:.4}50%{scaleY:1}}
@keyframes shellFly{0%{opacity:1;transform:translateY(0) rotate(0deg) scale(1)}70%{opacity:.9;transform:translateY(-280px) rotate(180deg) scale(1.3)}100%{opacity:0;transform:translateY(-420px) rotate(360deg) scale(.3)}}
@keyframes cfIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes iOrb{0%,100%{box-shadow:0 0 0 0 rgba(255,215,0,.2)}50%{box-shadow:0 0 14px 3px rgba(255,215,0,.12)}}
.ss-fade{animation:ssFade .35s ease both}
.nm-banner{animation:nmBreathe 3s ease-in-out infinite}
.shell-fly{position:absolute;font-size:22px;animation:shellFly 2s ease-out forwards;pointer-events:none}
.wv-bar{border-radius:2px;transition:height .1s;flex:1;max-width:4px}
.cf-in{animation:cfIn .25s ease}
`

/* ── types ── */
type Skin   = 'ise'|'egbe'|'idile'
type Geo    = 'village'|'state'|'country'|'continent'|'global'
type Layer  = 'drum'|'nation'|'motion'
type PostT  = 'text'|'voice'|'market'|'proverb'|'oracle'|'proof'|'notice'|'event'
type Heat   = 'COLD'|'EMBER'|'SIMMER'|'BOIL'|'FEAST'

interface Post {
  id:string; type:PostT; skin:Skin
  authorName:string; village:string; av:string; avBg:string; avBorder:string
  crest?:string; verified?:boolean; time:string; heat:number
  content?:string; duration?:string; translation?:string
  productName?:string; price?:string; productEmoji?:string; pricePos?:number
  marketLow?:string; marketMid?:string; marketHigh?:string; location?:string
  proverbRoot?:string; proverbLang?:string
  oracleContent?:string; oracleAgree?:number
  tradeProduct?:string; tradeLocation?:string; tradeAmount?:string; tradeBuyer?:string; tradeSeller?:string
  noticeContent?:string
  eventPayload?:string
  kila:number; stir:number; drum:number; ubuntu?:number; spray?:number
  scope:'village'|'region'|'nation'
  /** Narrowest geo level at which this post is visible */
  geoMin: Geo
}

/* ── skin config ── */
const SKINS = {
  ise:   { label:'⚒ ISE',   color:'#1a7c3e', light:'#4ade80', bg:'rgba(26,124,62,.15)',  border:'rgba(26,124,62,.4)',  pill:'⚒ ISE',   pillBg:'rgba(26,124,62,.2)',  pillC:'#4ade80',  pillBorder:'rgba(26,124,62,.35)' },
  egbe:  { label:'⭕ EGBE',  color:'#e07b00', light:'#fb923c', bg:'rgba(224,123,0,.15)',  border:'rgba(224,123,0,.4)',  pill:'⭕ EGBE',  pillBg:'rgba(224,123,0,.2)',  pillC:'#fb923c',  pillBorder:'rgba(224,123,0,.35)' },
  idile: { label:'🌳 ÌDÍLÉ',color:'#7c3aed', light:'#c084fc', bg:'rgba(124,58,237,.15)', border:'rgba(124,58,237,.4)', pill:'🌳 ÌDÍLÉ', pillBg:'rgba(124,58,237,.2)', pillC:'#c084fc',  pillBorder:'rgba(124,58,237,.35)' },
}

/* ── heat ── */
const HEAT_STAGES: Record<Heat,{label:string;color:string;fill:string}> = {
  COLD:   { label:'❄ COLD',   color:'rgba(255,255,255,.3)', fill:'rgba(255,255,255,.1)' },
  EMBER:  { label:'🌑 EMBER', color:'#8b4513',              fill:'linear-gradient(to right,#2a1a08,#8b4513)' },
  SIMMER: { label:'♨ SIMMER', color:'#e07b00',              fill:'linear-gradient(to right,#8b4513,#e07b00)' },
  BOIL:   { label:'🌊 BOIL',  color:'#ff4500',              fill:'linear-gradient(to right,#e07b00,#ff4500)' },
  FEAST:  { label:'🔥 FEAST', color:'#ffd700',              fill:'linear-gradient(to right,#ff4500,#ffd700)' },
}
function heatFromPct(p:number): Heat {
  return p>=85?'FEAST':p>=65?'BOIL':p>=40?'SIMMER':p>=20?'EMBER':'COLD'
}

/* ── posts data ── */
const ALL_POSTS: Post[] = [
  // ── ISE skin – village level ──
  { id:'td1',type:'text',skin:'ise',authorName:'Mama Ngozi',village:'🧺 Ìlú Oníṣòwò',av:'🧺',avBg:'rgba(224,123,0,.15)',avBorder:'rgba(224,123,0,.4)',crest:'IV',verified:true,time:'38m ago',heat:72,content:'Good morning traders! Tomato price at Mile 12: ₡3,200/bag. Farm gate ₡2,400 — excellent margin. Who has stock ready for Friday market?',kila:47,stir:12,drum:8,scope:'region',geoMin:'village' },
  { id:'ml1',type:'market',skin:'ise',authorName:'Chioma Obi',village:'🧺 Ìlú Oníṣòwò',av:'🧺',avBg:'rgba(224,123,0,.15)',avBorder:'rgba(224,123,0,.4)',crest:'II',verified:true,time:'1h ago',heat:58,productName:'Fresh Tomatoes · 5 bags',price:'₡ 2,400',productEmoji:'🍅',pricePos:38,marketLow:'2,200',marketMid:'2,500',marketHigh:'2,800',location:'Lagos, Oshodi',kila:23,stir:5,drum:3,scope:'village',geoMin:'village' },
  { id:'tp1',type:'proof',skin:'ise',authorName:'SYSTEM',village:'🧺 Ìlú Oníṣòwò',av:'✅',avBg:'rgba(74,222,128,.15)',avBorder:'rgba(74,222,128,.4)',crest:'',time:'3h ago',heat:88,tradeProduct:'50 bags Fresh Tomatoes',tradeLocation:'Lagos → Abuja',tradeAmount:'120,000',tradeBuyer:'Chioma O.',tradeSeller:'Kofi M.',kila:89,stir:0,drum:24,scope:'village',geoMin:'village' },
  { id:'td2',type:'text',skin:'ise',authorName:'Kwame Mensah',village:'🌾 Ìlú Àgbẹ̀',av:'🌾',avBg:'rgba(26,124,62,.15)',avBorder:'rgba(26,124,62,.4)',crest:'III',verified:true,time:'4h ago',heat:65,content:'Cocoa harvest ready — 200 bags dried and graded. Looking for Commerce Village buyers. Export price: $2,580/MT. Village members get priority.',kila:34,stir:8,drum:15,scope:'region',geoMin:'village' },
  // ── ISE skin – state level ──
  { id:'ise-st1',type:'market',skin:'ise',authorName:'Bola Akins',village:'🧺 Ìlú Oníṣòwò · Ibadan',av:'🏙',avBg:'rgba(224,123,0,.15)',avBorder:'rgba(224,123,0,.3)',crest:'III',verified:true,time:'2h ago',heat:63,productName:'Cassava Flour · 80 bags premium grade',price:'₡ 1,850',productEmoji:'🌾',pricePos:30,marketLow:'1,600',marketMid:'1,900',marketHigh:'2,200',location:'Ibadan, Oyo State',kila:41,stir:7,drum:9,scope:'region',geoMin:'state' },
  { id:'ise-st2',type:'text',skin:'ise',authorName:'Yetunde Falola',village:'🧺 Ìlú Oníṣòwò · Abeokuta',av:'🧺',avBg:'rgba(224,123,0,.15)',avBorder:'rgba(224,123,0,.4)',crest:'II',verified:true,time:'5h ago',heat:51,content:'State-wide price alert: Garri (white) is up 18% across Ogun and Lagos. Arbitrage opportunity — buy in Abeokuta at ₡800 and sell in Lagos at ₡1,050. Traders — move fast before others spot this.',kila:28,stir:14,drum:6,scope:'region',geoMin:'state' },
  { id:'ise-st3',type:'proof',skin:'ise',authorName:'SYSTEM',village:'🏙 Lagos–Ogun Trade Corridor',av:'✅',avBg:'rgba(74,222,128,.15)',avBorder:'rgba(74,222,128,.4)',crest:'',time:'1h ago',heat:74,tradeProduct:'200 bags Cassava',tradeLocation:'Abeokuta → Lagos Island',tradeAmount:'370,000',tradeBuyer:'Mama Folake',tradeSeller:'Adewale Farms',kila:55,stir:0,drum:12,scope:'region',geoMin:'state' },
  // ── ISE skin – country level ──
  { id:'ise-ng1',type:'oracle',skin:'ise',authorName:'Commerce Elder Council',village:'🌍 National Trade Forum',av:'⚡',avBg:'rgba(212,160,23,.15)',avBorder:'rgba(212,160,23,.4)',crest:'V',time:'LIVE',heat:88,oracleContent:'Motion before the Nation: Should Viewdicon adopt a unified price index for all 20 villages? This would make arbitrage transparent and protect small farmers.',oracleAgree:72,kila:634,stir:201,drum:143,scope:'nation',geoMin:'country' },
  { id:'ise-ng2',type:'text',skin:'ise',authorName:'Griot Orunmila · Nigeria',village:'🌍 Nation Drum',av:'🦅',avBg:'rgba(212,160,23,.15)',avBorder:'rgba(212,160,23,.4)',crest:'V',verified:true,time:'1h ago',heat:84,content:'🇳🇬 National Market Report: Tomatoes surging 22% across South-West. Cocoa export receipts hit ₡14.2M this week — highest since harvest began. Agriculture Village hit 1,200 active traders. Commerce is the heartbeat of the Nation.',kila:312,stir:18,drum:89,scope:'nation',geoMin:'country' },
  // ── ISE skin – continent level ──
  { id:'ise-af1',type:'proverb',skin:'ise',authorName:'Pan-African Elder Circle',village:'🌐 Africa Drum',av:'🌍',avBg:'rgba(212,160,23,.12)',avBorder:'rgba(212,160,23,.35)',crest:'V',time:'3h ago',heat:79,proverbRoot:'"Nchi bila watu ni msitu — A land without people is a forest"',proverbLang:'🇹🇿 Swahili · Shared across 6 nations',kila:891,stir:44,drum:267,scope:'nation',geoMin:'continent' },
  { id:'ise-af2',type:'market',skin:'ise',authorName:'Kofi Asante · Ghana',village:'🌾 Ìlú Àgbẹ̀ · Kumasi',av:'🌾',avBg:'rgba(26,124,62,.15)',avBorder:'rgba(26,124,62,.4)',crest:'IV',verified:true,time:'4h ago',heat:70,productName:'Premium Cocoa · 500MT export grade',price:'₡ 28,400',productEmoji:'🫘',pricePos:42,marketLow:'26,000',marketMid:'28,000',marketHigh:'31,000',location:'Kumasi, Ghana',kila:178,stir:23,drum:54,scope:'nation',geoMin:'continent' },
  // ── ISE skin – global level ──
  { id:'ise-gl1',type:'text',skin:'ise',authorName:'Diaspora Commerce Hub',village:'⭐ Global Village',av:'⭐',avBg:'rgba(255,215,0,.1)',avBorder:'rgba(255,215,0,.3)',crest:'V',verified:true,time:'6h ago',heat:91,content:'🌍 Diaspora Bridge: UK-based traders seeking genuine West African cocoa and shea butter directly from farm. No middlemen. Verified buyers only. 3 trade sessions opened in the last 24h through Viewdicon. Direct commerce. Sovereign trade.',kila:1240,stir:67,drum:389,scope:'nation',geoMin:'global' },
  // ── EGBE skin – village level ──
  { id:'pc1',type:'proverb',skin:'egbe',authorName:'Elder Adaeze',village:'🧺 Ìlú Oníṣòwò',av:'👵',avBg:'rgba(212,160,23,.15)',avBorder:'rgba(212,160,23,.4)',crest:'V',time:'5h ago',heat:91,proverbRoot:'"Agbado tí a bá jẹ papọ̀ ní dun"',proverbLang:'🇳🇬 Yoruba · Shared by Elder Adaeze',kila:112,stir:8,drum:44,scope:'nation',geoMin:'village' },
  { id:'vs1',type:'voice',skin:'egbe',authorName:'Griot Seun',village:'🎙 Ìlú Ìtàn',av:'🎙',avBg:'rgba(79,70,229,.15)',avBorder:'rgba(79,70,229,.4)',crest:'IV',verified:true,time:'2h ago',heat:95,duration:'3:00',translation:'"I tell you today the story of the first market at Ile-Ife — where Oduduwa planted the first yam, and all the Orisha gathered to trade their gifts. This is why our market is sacred. Commerce is not greed — it is community."',kila:203,stir:0,drum:67,spray:45,scope:'nation',geoMin:'village' },
  { id:'or1',type:'oracle',skin:'egbe',authorName:'Oracle Council',village:'🏛 Ìlú Ìgbìmọ',av:'⚡',avBg:'rgba(212,160,23,.15)',avBorder:'rgba(212,160,23,.4)',crest:'III',time:'LIVE',heat:96,oracleContent:'Should the Agriculture Village set a minimum price floor for cocoa farmers in West Africa?',oracleAgree:68,kila:450,stir:180,drum:89,scope:'nation',geoMin:'village' },
  // ── EGBE skin – state level ──
  { id:'egbe-st1',type:'voice',skin:'egbe',authorName:'Griot Yemi · Ogun',village:'🎙 Ìlú Ìtàn · Abeokuta',av:'🎙',avBg:'rgba(79,70,229,.15)',avBorder:'rgba(79,70,229,.4)',crest:'III',verified:true,time:'3h ago',heat:77,duration:'2:14',translation:'"The masquerade that dances for the whole state must know the language of every town. When Ogun speaks, Osun listens. This is why Abeokuta and Lagos are one voice."',kila:89,stir:12,drum:27,scope:'region',geoMin:'state' },
  // ── EGBE skin – country level ──
  { id:'egbe-ng1',type:'proverb',skin:'egbe',authorName:'National Griot Assembly',village:'🌍 Nation Drum',av:'🦅',avBg:'rgba(212,160,23,.15)',avBorder:'rgba(212,160,23,.4)',crest:'V',time:'2h ago',heat:89,proverbRoot:'"Onye wetara oji wetara ndụ" — He who brings kola brings life',proverbLang:'🇳🇬 Igbo · National Proverb · 12 villages agreed',kila:445,stir:27,drum:132,scope:'nation',geoMin:'country' },
  // ── EGBE skin – continent level ──
  { id:'egbe-af1',type:'oracle',skin:'egbe',authorName:'Pan-African Oracle',village:'🌐 Africa Drum',av:'🌍',avBg:'rgba(212,160,23,.1)',avBorder:'rgba(212,160,23,.35)',crest:'V',time:'LIVE',heat:93,oracleContent:'Pan-African Motion: Should Viewdicon expand to all 54 African nations by 2027 or focus on West Africa first?',oracleAgree:61,kila:2340,stir:890,drum:560,scope:'nation',geoMin:'continent' },
  // ── EGBE skin – global level ──
  { id:'egbe-gl1',type:'voice',skin:'egbe',authorName:'Griot Diaspora · London',village:'⭐ Global Village',av:'🌍',avBg:'rgba(255,215,0,.1)',avBorder:'rgba(255,215,0,.3)',crest:'IV',verified:true,time:'8h ago',heat:88,duration:'4:22',translation:'"To all our brothers and sisters in the diaspora — your homeland speaks to you through these drums. Commerce, identity, family. You are not cut off from the root. Plant your root here, on this sovereign soil."',kila:3201,stir:144,drum:891,spray:234,scope:'nation',geoMin:'global' },
  // ── ÌDÍLÉ skin – village level ──
  { id:'td3',type:'text',skin:'idile',authorName:'Papa Emeka',village:'🌳 Family Circle',av:'🧔',avBg:'rgba(124,58,237,.15)',avBorder:'rgba(124,58,237,.4)',crest:'IV',time:'1h ago',heat:55,content:'My children — the Okonkwo compound land title has been uploaded to the Ancestral Vault. Five signatures required. Papa Chidi and your mother have signed. Three more needed. This is your inheritance. Guard it.',kila:12,stir:0,drum:2,ubuntu:8,scope:'village',geoMin:'village' },
  { id:'vn1',type:'notice',skin:'idile',authorName:'Elder Council',village:'🏛 Village Council',av:'📯',avBg:'rgba(212,160,23,.15)',avBorder:'rgba(212,160,23,.4)',crest:'V',time:'30m ago',heat:78,noticeContent:'VILLAGE NOTICE: The Night Market opens at 6PM today. Crest III+ market vendors may pin products to Jollof TV streams and receive a 20% algorithm boost. Community initiative to boost village commerce.',kila:56,stir:0,drum:18,scope:'village',geoMin:'village' },
  // ── ÌDÍLÉ skin – state level ──
  { id:'idile-st1',type:'notice',skin:'idile',authorName:'Oyo State Family Council',village:'🏙 Àgbájọ Ìdílé · Oyo',av:'📯',avBg:'rgba(124,58,237,.15)',avBorder:'rgba(124,58,237,.4)',crest:'IV',time:'4h ago',heat:62,noticeContent:'STATE FAMILY NOTICE: The Oyo State naming ceremony registry is now live. Families can document ceremonies on-chain and share with verified relatives across all villages. First 500 families receive Elder Root status free for 6 months.',kila:34,stir:0,drum:8,scope:'region',geoMin:'state' },
  // ── ÌDÍLÉ skin – country level ──
  { id:'idile-ng1',type:'text',skin:'idile',authorName:'National Ancestral Council',village:'🌍 Ìdílé Nigeria',av:'🌍',avBg:'rgba(124,58,237,.1)',avBorder:'rgba(124,58,237,.35)',crest:'V',verified:true,time:'6h ago',heat:81,content:'🇳🇬 National Family Registry milestone: 50,000 verified family trees across Nigeria. The largest digital lineage record on the African continent. Every family\'s Ancestral Vault is now portable — carry your heritage anywhere.',kila:892,stir:23,drum:201,ubuntu:340,scope:'nation',geoMin:'country' },
  // ── ÌDÍLÉ skin – continent level ──
  { id:'idile-af1',type:'proverb',skin:'idile',authorName:'African Elders Collective',village:'🌐 Pan-African Elders',av:'👑',avBg:'rgba(212,160,23,.12)',avBorder:'rgba(212,160,23,.35)',crest:'V',time:'12h ago',heat:85,proverbRoot:'"Mtu ni watu — A person is people"',proverbLang:'🌍 Pan-African · 6 language translations active',kila:4120,stir:89,drum:1240,scope:'nation',geoMin:'continent' },
  // ── ÌDÍLÉ skin – global level ──
  { id:'idile-gl1',type:'text',skin:'idile',authorName:'Diaspora Family Network',village:'⭐ Global Ìdílé',av:'⭐',avBg:'rgba(255,215,0,.1)',avBorder:'rgba(255,215,0,.3)',crest:'V',verified:true,time:'1d ago',heat:90,content:'🌍 To African families scattered across the globe — your roots are not lost. The Ancestral Vault crosses borders. Your children born in London, Houston, and Paris can still know their grandfather\'s name in Yoruba, their grandmother\'s village in Igbo. Plant your root here.',kila:5670,stir:234,drum:1890,ubuntu:2100,scope:'nation',geoMin:'global' },
  // ── Event Drum Posts ────────────────────────────────────────────────
  { id:'ev-001',type:'event',skin:'ise',authorName:'AfriTech Lagos',village:'⚡ Technology Village',av:'⚡',avBg:'rgba(59,130,246,.15)',avBorder:'rgba(59,130,246,.4)',crest:'V',verified:true,time:'2h ago',heat:88,kila:412,stir:67,drum:189,scope:'nation',geoMin:'country',
    eventPayload:'{"__type":"event_drum","eventId":"evt-001","title":"AfriTech Summit 2026","eventType":"CONFERENCE","date":"2026-04-12T09:00:00","venueName":"Eko Convention Centre, Lagos","villageId":"technology","village":"Technology Village","villageEmoji":"⚡","villageColor":"#3b82f6","coverEmoji":"🖥️","drumScope":"NATION","tiers":[{"name":"General","price":5000,"available":230},{"name":"VIP","price":15000,"available":12}],"isHospitalityTier":true,"description":"The biggest Pan-African tech summit. 3 stages, 80 speakers, startup pitch battle."}' },
  { id:'ev-002',type:'event',skin:'egbe',authorName:'Arts Village Connector',village:'🎨 Arts Village',av:'🎨',avBg:'rgba(139,92,246,.15)',avBorder:'rgba(139,92,246,.4)',crest:'IV',verified:true,time:'5h ago',heat:82,kila:289,stir:54,drum:98,scope:'nation',geoMin:'country',
    eventPayload:'{"__type":"event_drum","eventId":"evt-003","title":"Moonrise Music Festival","eventType":"FESTIVAL","date":"2026-05-20T18:00:00","venueName":"Eko Atlantic Beach, Lagos","villageId":"arts","village":"Arts Village","villageEmoji":"🎨","villageColor":"#8b5cf6","coverEmoji":"🌕","drumScope":"JOLLOF_TV","tiers":[{"name":"Early Bird","price":8000,"available":0},{"name":"General","price":12000,"available":180},{"name":"VIP Lounge","price":35000,"available":8}],"isHospitalityTier":true,"description":"3-day outdoor music and arts festival celebrating Pan-African sounds. Over 40 artists."}' },
  { id:'ev-003',type:'event',skin:'idile',authorName:'Sports Village',village:'🏅 Sports Village',av:'🏅',avBg:'rgba(239,68,68,.15)',avBorder:'rgba(239,68,68,.4)',crest:'III',verified:true,time:'8h ago',heat:79,kila:334,stir:45,drum:122,scope:'village',geoMin:'village',
    eventPayload:'{"__type":"event_drum","eventId":"evt-006","title":"Pan-African Football Day","eventType":"SPORTS","date":"2026-04-25T14:00:00","venueName":"Teslim Balogun Stadium, Lagos","villageId":"sports","village":"Sports Village","villageEmoji":"🏅","villageColor":"#ef4444","coverEmoji":"⚽","drumScope":"NATION","tiers":[{"name":"Terrace","price":3000,"available":1200},{"name":"VIP Box","price":20000,"available":24}],"isHospitalityTier":true,"description":"5-a-side tournament followed by a 11v11 final. Live Jollof TV broadcast."}' },
]

/* ── motion feed mock posts (MotionPost type from feedTypes.ts) ── */
const MOTION_POSTS: MotionPost[] = [
  {
    id:'m1', type:'VIDEO_STORY', author:'Mama Kemi', afroId:'AFR-NGA-COM-010201',
    avatarColor:'rgba(224,123,0,.3)', village:'Commerce', villageEmoji:'🧺', role:'Market Queen',
    skinContext:'ise', content:'Fresh tomatoes arriving at Mile 12 market — watch the quality check live! 🍅', tags:['market','tomatoes','commerce'],
    time:'2m ago', kilaCount:142, stirCount:33, ubuntuCount:18, commentCount:27, drumScope:1,
    heatScore:88, crestTier:4, nkisi:'GREEN', videoUrl:'', videoDurationSec:45,
  },
  {
    id:'m2', type:'IMAGE_JOURNAL', author:'Adaeze Obi', afroId:'AFR-NGA-ART-010334',
    avatarColor:'rgba(124,58,237,.3)', village:'Arts', villageEmoji:'🎨', role:'Visual Storyteller',
    skinContext:'egbe', content:'My journey through 30 days of Adinkra pattern design — swipe to see the evolution of each symbol 🖌', tags:['art','adinkra','design'],
    time:'18m ago', kilaCount:289, stirCount:67, ubuntuCount:44, commentCount:51, drumScope:2,
    heatScore:95, crestTier:3, nkisi:'GREEN', imageUrls:[], captionLocale:'en',
  },
  {
    id:'m3', type:'AUDIO_LETTER', author:'Griot Seun Kuti', afroId:'AFR-NGA-MED-010089',
    avatarColor:'rgba(79,70,229,.3)', village:'Media', villageEmoji:'🎙', role:'Griot Storyteller',
    skinContext:'egbe', content:'A letter to the diaspora — "Your roots run deeper than the ocean that separates us. Come home." 🌍', tags:['griot','diaspora','heritage'],
    time:'1h ago', kilaCount:534, stirCount:12, ubuntuCount:201, commentCount:89, drumScope:3,
    heatScore:96, crestTier:5, nkisi:'GREEN', audioDurationSec:180, spiritVoiceEnabled:true,
  },
  {
    id:'m4', type:'VIDEO_STORY', author:'Chef Tolu', afroId:'AFR-NGA-HSP-010452',
    avatarColor:'rgba(178,34,34,.3)', village:'Hospitality', villageEmoji:'🍽', role:'Master Chef',
    skinContext:'ise', content:'Making Jollof Rice the traditional way — fire, iron pot, wooden spoon. No shortcuts. 🍚🔥', tags:['jollof','cooking','tradition'],
    time:'3h ago', kilaCount:891, stirCount:234, ubuntuCount:67, commentCount:156, drumScope:2,
    heatScore:92, crestTier:3, nkisi:'GREEN', videoUrl:'', videoDurationSec:120,
  },
  {
    id:'m5', type:'TEXT_DRUM', author:'Elder Council', afroId:'AFR-NGA-GOV-010001',
    avatarColor:'rgba(212,160,23,.3)', village:'Government', villageEmoji:'🏛', role:'Elder Speaker',
    skinContext:'egbe', content:'"Ẹni tó ń ta ìbon sókè, ìbẹ̀ ni ó ti bọ̀ sílẹ̀" — He who shoots bullets into the sky will have them rain down on his own head.\n\nLet us build, not destroy. The village remembers everything.', tags:['proverb','wisdom','governance'],
    time:'5h ago', kilaCount:1247, stirCount:34, ubuntuCount:456, commentCount:201, drumScope:3,
    heatScore:97, crestTier:5, nkisi:'GREEN',
  },
  {
    id:'m6', type:'IMAGE_JOURNAL', author:'Zara Fashions', afroId:'AFR-NGA-FSH-010567',
    avatarColor:'rgba(236,72,153,.3)', village:'Fashion', villageEmoji:'👗', role:'Designer',
    skinContext:'ise', content:'New Ankara collection dropping this week — each piece tells a story of our ancestors 🧵', tags:['fashion','ankara','heritage'],
    time:'6h ago', kilaCount:678, stirCount:145, ubuntuCount:89, commentCount:92, drumScope:2,
    heatScore:84, crestTier:2, nkisi:'GREEN', imageUrls:[], captionLocale:'en',
  },
  {
    id:'m7', type:'AUDIO_LETTER', author:'DJ Blackstar', afroId:'AFR-GHA-ART-010789',
    avatarColor:'rgba(26,124,62,.3)', village:'Arts', villageEmoji:'🎨', role:'Sound Architect',
    skinContext:'idile', content:'Pan-African beats mixtape — blending Afrobeats, Highlife, Amapiano, and Soukous into one ancestral rhythm 🥁🎶', tags:['music','panAfrican','mix'],
    time:'8h ago', kilaCount:423, stirCount:89, ubuntuCount:167, commentCount:45, drumScope:3,
    heatScore:79, crestTier:3, nkisi:'GREEN', audioDurationSec:240, spiritVoiceEnabled:false,
  },
  {
    id:'m8', type:'VIDEO_STORY', author:'Kwame Builder', afroId:'AFR-GHA-BLD-010123',
    avatarColor:'rgba(26,124,62,.3)', village:'Builders', villageEmoji:'🏗', role:'Architect',
    skinContext:'ise', content:'Building Africa\'s first 3D-printed school in Kumasi — watch the walls rise in real time 🏫', tags:['building','innovation','education'],
    time:'12h ago', kilaCount:1034, stirCount:278, ubuntuCount:345, commentCount:187, drumScope:3,
    heatScore:99, crestTier:4, nkisi:'GREEN', videoUrl:'', videoDurationSec:90,
  },
]
const WAVE_HEIGHTS = [12,24,36,20,44,16,32,28,12,36,20,28,24,40,18,32,14,28,36,22,30,16,42,24,18,34,20,26,38,14]

function Waveform({ color, playing }: { color:string; playing:boolean }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:2,height:44,flex:1 }}>
      {WAVE_HEIGHTS.map((h,i) => (
        <div key={i} className="wv-bar" style={{
          height: playing ? h : h*0.4,
          background: color,
          opacity: playing ? 0.7 : 0.3,
          borderRadius: 2,
          transition: `height ${0.1 + i*0.02}s ease`,
          animationDelay: `${i*0.05}s`,
        }} />
      ))}
    </div>
  )
}

/* ── heat bar ── */
function HeatBar({ pct }: { pct:number }) {
  const stage = heatFromPct(pct)
  const cfg = HEAT_STAGES[stage]
  return (
    <div style={{ padding:'7px 14px 0' }}>
      <div style={{ display:'flex',alignItems:'center',gap:9 }}>
        <div style={{ flex:1 }}>
          <div style={{ height:5,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${pct}%`,background:cfg.fill,borderRadius:99,transition:'width .5s ease' }} />
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',marginTop:2 }}>
            {(['Cold','Ember','Simmer','Boil','FEAST'] as const).map(l => (
              <span key={l} style={{ fontSize:7,color:'rgba(255,255,255,.2)' }}>{l}</span>
            ))}
          </div>
        </div>
        <span style={{ fontSize:10,fontWeight:700,color:cfg.color,flexShrink:0 }}>{cfg.label}</span>
      </div>
    </div>
  )
}

/* ── village square ── */
const VSQ_TABS = ['📯 Notices','🛒 Market','🥁 Drum','🏛 Wisdom'] as const
function VillageSquare() {
  const [tab,setTab] = React.useState(0)
  const content = [
    [ // Notices
      { ico:'📯', txt:'Elder Ngozi: Friday market at 7AM. Traders confirm stock Thursday.', val:'👑 Official', vc:'#fbbf24' },
      { ico:'🔒', txt:'New rule: All trades above ₡50,000 require Runner service.', val:'Crest V', vc:'#fbbf24' },
    ],
    [ // Market
      { ico:'🍅', txt:'Tomatoes · 5 bags · ₡2,400 · Oshodi', val:'₡2,400', vc:'#4ade80' },
      { ico:'👗', txt:'Ankara Fabric · 6 yards · ₡4,500 · Island', val:'₡4,500', vc:'#4ade80' },
    ],
    'drum' as const,
    [ // Wisdom
      { ico:'🏛', txt:'"Agbado tí a bá jẹ papọ̀" — reached FEAST stage. Now Village History.', val:'FEAST ✓', vc:'#fbbf24' },
    ],
  ]
  return (
    <div style={{ margin:'8px 12px',borderRadius:14,overflow:'hidden',border:'1px solid rgba(26,124,62,.2)' }}>
      <div style={{ background:'linear-gradient(135deg,#0e2a14,#162810)',padding:'10px 14px',display:'flex',alignItems:'center',gap:8 }}>
        <span style={{ fontSize:18 }}>🏛</span>
        <span style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:800,color:'#4ade80',flex:1 }}>Village Square · Ìlú Oníṣòwò</span>
        <span style={{ fontSize:9,color:'rgba(74,222,128,.5)' }}>● Live</span>
      </div>
      {/* tabs */}
      <div style={{ display:'flex',background:'rgba(0,0,0,.3)' }}>
        {VSQ_TABS.map((t,i) => (
          <div key={i} onClick={() => setTab(i)} style={{ flex:1,padding:'6px 3px',textAlign:'center',fontSize:9,fontWeight:700,cursor:'pointer',color:tab===i?'#4ade80':'rgba(255,255,255,.3)',borderBottom:`2px solid ${tab===i?'#1a7c3e':'transparent'}`,transition:'all .2s' }}>{t}</div>
        ))}
      </div>
      {/* content */}
      <div style={{ background:'rgba(0,0,0,.2)',padding:'10px 14px',minHeight:60 }}>
        {tab === 2 ? (
          <div>
            <div style={{ fontSize:11,color:'rgba(74,222,128,.7)',fontStyle:'italic',marginBottom:4 }}><span style={{ color:'#4ade80',fontStyle:'normal',fontWeight:700 }}>Mama Ngozi</span> posted a Voice Story</div>
            <div style={{ fontSize:11,color:'rgba(74,222,128,.7)',fontStyle:'italic',marginBottom:4 }}>Trade sealed: <span style={{ color:'#4ade80',fontStyle:'normal',fontWeight:700 }}>Kwame → Chioma</span> ₡120,000</div>
            <div style={{ fontSize:11,color:'rgba(74,222,128,.7)',fontStyle:'italic' }}><span style={{ color:'#4ade80',fontStyle:'normal',fontWeight:700 }}>3 new members</span> joined today</div>
          </div>
        ) : (
          (content[tab] as {ico:string;txt:string;val:string;vc:string}[]).map((item, i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:i<(content[tab] as any[]).length-1?'1px solid rgba(255,255,255,.06)':'none' }}>
              <span style={{ fontSize:16 }}>{item.ico}</span>
              <span style={{ fontSize:11,color:'rgba(240,245,238,.8)',flex:1,lineHeight:1.5 }}>{item.txt}</span>
              <span style={{ fontSize:10,fontWeight:700,color:item.vc,flexShrink:0 }}>{item.val}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ── griot card (nation layer) ── */
function GriotCard() {
  return (
    <div style={{ margin:'8px 12px',background:'linear-gradient(135deg,#1a1400,#2a2000)',border:'1px solid rgba(212,160,23,.2)',borderRadius:14,overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderBottom:'1px solid rgba(212,160,23,.1)' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(212,160,23,.15)',border:'1.5px solid rgba(212,160,23,.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>🦅</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:800,color:'#fbbf24' }}>Griot Orunmila · Village Elder AI</div>
          <div style={{ fontSize:9,color:'rgba(212,160,23,.5)',marginTop:2 }}>🤖 AI-generated · Position 1 in Nation Square</div>
        </div>
      </div>
      <div style={{ padding:'12px 14px',fontSize:12,color:'rgba(212,160,23,.85)',lineHeight:1.7,fontStyle:'italic' }}>
        "Good morning, children of the village. The cocoa price floor debate reached FEAST stage — 450 Kíla in 30 days. Mama Adaeze's Jollof TV stream broke 1,400 viewers with 23 trade sessions opened. The village is alive and trading."
      </div>
      <div style={{ padding:'8px 14px',borderTop:'1px solid rgba(212,160,23,.1)',fontSize:10,color:'rgba(212,160,23,.45)',fontStyle:'italic' }}>
        ✦ "Ẹni tó bá sunwọ̀n gba àṣà, àṣà á tún padà sí i" — One who cultivates culture, culture returns · Yoruba
      </div>
    </div>
  )
}

/* ── geo context data ── */
const GEO_ORDER: Geo[] = ['village','state','country','continent','global']

const GEO_CTX: Record<Geo, {
  emoji:string; name:string; subtitle:string; members:string; traded:string
  accentColor:string; accentBg:string; tag:string
  widget?: 'state-index'|'national-bulletin'|'continental-map'|'diaspora-bridge'
}> = {
  village: {
    emoji:'🏘', name:'Commerce Village · Lagos', subtitle:'Ìlú Oníṣòwò',
    members:'847 active today', traded:'₡2.4M this week',
    accentColor:'#4ade80', accentBg:'rgba(26,124,62,.12)', tag:'Village Only',
    widget: undefined,
  },
  state: {
    emoji:'🏙', name:'Lagos State', subtitle:'47 villages · 12,400 traders online',
    members:'12.4K active', traded:'₡47M this week',
    accentColor:'#fb923c', accentBg:'rgba(224,123,0,.12)', tag:'My State',
    widget:'state-index',
  },
  country: {
    emoji:'🌍', name:'Nigeria', subtitle:'892 villages · 3.2M active members',
    members:'3.2M members', traded:'₡1.4B this month',
    accentColor:'#34d399', accentBg:'rgba(16,185,129,.12)', tag:'Nigeria',
    widget:'national-bulletin',
  },
  continent: {
    emoji:'🌐', name:'West Africa', subtitle:'6 nations · 28,000 villages active',
    members:'14M traders', traded:'₡9.2B this quarter',
    accentColor:'#60a5fa', accentBg:'rgba(59,130,246,.12)', tag:'Africa',
    widget:'continental-map',
  },
  global: {
    emoji:'⭐', name:'African Diaspora · Global', subtitle:'94 countries · 47K connected',
    members:'47K diaspora', traded:'₡28B total volume',
    accentColor:'#fbbf24', accentBg:'rgba(251,191,36,.1)', tag:'Global',
    widget:'diaspora-bridge',
  },
}

function GeoContextBanner({ geo, villageOverride }: { geo:Geo; villageOverride?:{name:string;emoji:string;ancientName?:string;memberCount?:number} }) {
  const ctx = React.useMemo(() => {
    if (geo === 'village' && villageOverride) {
      return {
        ...GEO_CTX.village,
        emoji: villageOverride.emoji,
        name: villageOverride.name,
        subtitle: villageOverride.ancientName ?? GEO_CTX.village.subtitle,
        members: villageOverride.memberCount != null ? `${villageOverride.memberCount.toLocaleString()} members` : GEO_CTX.village.members,
      }
    }
    return GEO_CTX[geo]
  }, [geo, villageOverride])
  return (
    <div style={{
      margin:'8px 12px 4px', borderRadius:14, overflow:'hidden',
      background:`linear-gradient(135deg, ${ctx.accentBg}, rgba(0,0,0,.2))`,
      border:`1px solid ${ctx.accentColor}28`,
    }}>
      <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:ctx.accentBg, border:`1.5px solid ${ctx.accentColor}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{ctx.emoji}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Sora,sans-serif', fontSize:13, fontWeight:800, color:ctx.accentColor, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ctx.name}</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,.4)', marginTop:2 }}>{ctx.subtitle}</div>
        </div>
        <span style={{ fontSize:8, fontWeight:800, padding:'2px 8px', borderRadius:4, background:ctx.accentBg, color:ctx.accentColor, border:`1px solid ${ctx.accentColor}40`, textTransform:'uppercase', letterSpacing:'.06em', flexShrink:0 }}>{ctx.tag}</span>
      </div>
      <div style={{ display:'flex', borderTop:`1px solid ${ctx.accentColor}18` }}>
        {[['👥',ctx.members,'Members'],['💰',ctx.traded,'Traded']].map(([ico,val,lbl],i)=>(
          <div key={i} style={{ flex:1, padding:'8px 12px', textAlign:'center', borderRight:i===0?`1px solid ${ctx.accentColor}18`:'none' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{ico} {lbl}</div>
            <div style={{ fontFamily:'Sora,sans-serif', fontSize:13, fontWeight:900, color:ctx.accentColor }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StateIndexWidget() {
  const rows = [
    { name:'Tomatoes',    low:'₡2,100', avg:'₡2,450', high:'₡2,800', trend:'+8%',  up:true  },
    { name:'Garri (White)', low:'₡800',  avg:'₡950',  high:'₡1,100', trend:'+18%', up:true  },
    { name:'Cassava Flour',  low:'₡1,600', avg:'₡1,850', high:'₡2,100', trend:'-3%', up:false },
    { name:'Palm Oil · 25L', low:'₡6,200', avg:'₡6,800', high:'₡7,400', trend:'+5%', up:true  },
  ]
  return (
    <div style={{ margin:'4px 12px 8px', borderRadius:14, overflow:'hidden', border:'1px solid rgba(224,123,0,.2)', background:'rgba(0,0,0,.25)' }}>
      <div style={{ padding:'9px 14px', background:'rgba(224,123,0,.08)', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(224,123,0,.1)' }}>
        <span style={{ fontSize:16 }}>🏙</span>
        <span style={{ fontFamily:'Sora,sans-serif', fontSize:12, fontWeight:800, color:'#fb923c' }}>Lagos State Market Index</span>
        <span style={{ marginLeft:'auto', fontSize:9, color:'rgba(251,146,60,.5)', fontWeight:700 }}>● Live</span>
      </div>
      <div style={{ padding:'6px 0' }}>
        {rows.map((r,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 14px', borderBottom:i<rows.length-1?'1px solid rgba(255,255,255,.04)':'none' }}>
            <span style={{ fontSize:10, fontWeight:600, color:'rgba(240,245,238,.7)', flex:1 }}>{r.name}</span>
            <span style={{ fontSize:9, color:'rgba(255,255,255,.3)' }}>{r.low}–{r.high}</span>
            <span style={{ fontSize:11, fontWeight:800, color:r.up?'#4ade80':'#f87171', minWidth:35, textAlign:'right' }}>{r.trend}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NationalBulletinWidget() {
  return (
    <div style={{ margin:'4px 12px 8px', borderRadius:14, overflow:'hidden', border:'1px solid rgba(16,185,129,.2)', background:'rgba(0,0,0,.25)' }}>
      <div style={{ padding:'9px 14px', background:'rgba(16,185,129,.08)', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(16,185,129,.1)' }}>
        <span style={{ fontSize:16 }}>📡</span>
        <span style={{ fontFamily:'Sora,sans-serif', fontSize:12, fontWeight:800, color:'#34d399' }}>Nigeria Market Bulletin</span>
        <span style={{ marginLeft:'auto', fontSize:9, color:'rgba(52,211,153,.5)', fontWeight:700 }}>Daily</span>
      </div>
      <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        {[
          { icon:'🍅', headline:'Tomato surge 22% South-West', sub:'Blight reducing supply from Plateau State farms' },
          { icon:'🫘', headline:'Cocoa receipts hit ₡14.2M', sub:'Best week since harvest — Kwame Mensah leads trades' },
          { icon:'🌾', headline:'Agriculture Village: 1,200 traders', sub:'Highest activity in 6 months — Oracle Session tonight' },
        ].map((b,i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', paddingBottom:i<2?'8px':'0', borderBottom:i<2?'1px solid rgba(255,255,255,.04)':'none' }}>
            <span style={{ fontSize:18, flexShrink:0 }}>{b.icon}</span>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(240,245,238,.9)', lineHeight:1.4 }}>{b.headline}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContinentalMapWidget() {
  const nations = [
    { flag:'🇳🇬', name:'Nigeria',   villages:892, active:true  },
    { flag:'🇬🇭', name:'Ghana',     villages:234, active:true  },
    { flag:'🇸🇳', name:'Senegal',   villages:78,  active:true  },
    { flag:'🇮🇻', name:"Côte d'Ivoire", villages:112, active:true },
    { flag:'🇰🇪', name:'Kenya',     villages:156, active:false },
    { flag:'🇿🇦', name:'South Africa', villages:89, active:false },
  ]
  return (
    <div style={{ margin:'4px 12px 8px', borderRadius:14, overflow:'hidden', border:'1px solid rgba(59,130,246,.2)', background:'rgba(0,0,0,.25)' }}>
      <div style={{ padding:'9px 14px', background:'rgba(59,130,246,.08)', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(59,130,246,.1)' }}>
        <span style={{ fontSize:16 }}>🌐</span>
        <span style={{ fontFamily:'Sora,sans-serif', fontSize:12, fontWeight:800, color:'#60a5fa' }}>Pan-African Village Network</span>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', padding:'10px 14px', gap:8 }}>
        {nations.map((n,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:10, background:n.active?'rgba(59,130,246,.1)':'rgba(255,255,255,.03)', border:`1px solid ${n.active?'rgba(59,130,246,.25)':'rgba(255,255,255,.06)'}`, flex:'1 1 140px' }}>
            <span style={{ fontSize:18 }}>{n.flag}</span>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:n.active?'rgba(240,245,238,.9)':'rgba(255,255,255,.3)' }}>{n.name}</div>
              <div style={{ fontSize:9, color:n.active?'#60a5fa':'rgba(255,255,255,.2)', fontWeight:600 }}>{n.villages} villages{n.active?' · Live':' · Coming'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiasporaBridgeWidget() {
  return (
    <div style={{ margin:'4px 12px 8px', borderRadius:14, overflow:'hidden', border:'1px solid rgba(251,191,36,.2)', background:'linear-gradient(135deg,rgba(30,20,0,.6),rgba(0,0,0,.3))' }}>
      <div style={{ padding:'9px 14px', background:'rgba(251,191,36,.06)', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(251,191,36,.1)' }}>
        <span style={{ fontSize:16 }}>⭐</span>
        <span style={{ fontFamily:'Sora,sans-serif', fontSize:12, fontWeight:800, color:'#fbbf24' }}>Diaspora Bridge</span>
        <span style={{ marginLeft:'auto', fontSize:9, color:'rgba(251,191,36,.5)', fontWeight:700 }}>94 countries</span>
      </div>
      <div style={{ display:'flex', gap:6, padding:'10px 14px', overflowX:'auto' }}>
        {[
          { flag:'🇬🇧', city:'London', traders:1240, trending:'Shea Butter' },
          { flag:'🇺🇸', city:'Houston', traders:890,  trending:'Ankara Fabric' },
          { flag:'🇨🇦', city:'Toronto', traders:456,  trending:'Palm Oil' },
          { flag:'🇩🇪', city:'Berlin',  traders:234,  trending:'Cocoa' },
        ].map((d,i) => (
          <div key={i} style={{ flexShrink:0, padding:'8px 12px', borderRadius:12, background:'rgba(251,191,36,.06)', border:'1px solid rgba(251,191,36,.15)', minWidth:110, textAlign:'center' }}>
            <div style={{ fontSize:24 }}>{d.flag}</div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(240,245,238,.8)', marginTop:4 }}>{d.city}</div>
            <div style={{ fontSize:9, color:'rgba(251,191,36,.7)', fontWeight:600, marginTop:2 }}>{d.traders.toLocaleString()} traders</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.4)', marginTop:1 }}>↑ {d.trending}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── individual post ── */
function PostCard({ post }: { post:Post }) {
  const [kilaN, setKilaN] = React.useState(post.kila)
  const [kilaLit, setKilaLit] = React.useState(false)
  const [agree, setAgree] = React.useState(post.oracleAgree ?? 68)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [svLang, setSvLang] = React.useState('EN')
  const [sprays, setSprays] = React.useState<{id:number;x:number}[]>([])
  const [toast, setToast] = React.useState('')
  const [commentOpen, setCommentOpen] = React.useState(false)
  const [bookmarked, setBookmarked] = React.useState(false)
  const intervalRef = React.useRef<ReturnType<typeof setInterval>|null>(null)

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(''),2500) }

  const handleKila = () => {
    setKilaLit(!kilaLit)
    setKilaN(k => kilaLit ? k-1 : k+1)
    sorosokeApi.kila(post.id).catch(() => {})
    showToast(kilaLit ? '⭐ Kíla removed' : '⭐ Kíla given! This honour will carry far.')
  }

  const handleSpray = () => {
    const newSprays = Array.from({length:6},(_,i)=>({id:Date.now()+i, x:10+Math.random()*80}))
    setSprays(s => [...s,...newSprays])
    setTimeout(()=>setSprays([]),2200)
    sorosokeApi.spray(post.id, { amount: 1 }).catch(() => {})
    showToast('💸 ₡500 Sprayed! Cowrie shells flying 🪙')
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
      showToast('↗ Link copied to clipboard!')
    } else {
      showToast('↗ Share link generated')
    }
  }

  const handleBookmark = () => {
    setBookmarked(b => !b)
    showToast(bookmarked ? '🏷 Removed from saved' : '🔖 Saved to your collection!')
  }

  const handlePlay = () => {
    if(playing) {
      setPlaying(false)
      if(intervalRef.current) clearInterval(intervalRef.current)
    } else {
      setPlaying(true)
      intervalRef.current = setInterval(()=>{
        setProgress(p=>{
          if(p>=100){ setPlaying(false); clearInterval(intervalRef.current!); return 0 }
          return p+0.6
        })
      },100)
    }
  }

  React.useEffect(()=>()=>{ if(intervalRef.current) clearInterval(intervalRef.current) },[])

  const SV_LANGS = ['EN','YO','IG','HA','SW']
  const SV_TRANS: Record<string,string> = {
    EN: post.translation ?? '',
    YO: '"Mo sọ fun yín ìtàn ọjà àkọ́kọ́ ní Ilé-Ifẹ̀ — níbi tí Odùduwà gbìn ẹpa àkọ́kọ́, àti gbogbo Òrìṣà kojọ pọ̀ láti ṣòwò ẹ̀bùn wọn."',
    IG: '"A na-asụ ụmụ amụ ọnụ ihe mere n\'ahịa nke ọbu na Ile-Ife — ebe Oduduwa kụrụ ji nke mbu, Orisha niile zokotara azụ ahịa."',
    HA: '"Na gaya muku labarin kasuwa na farko a Ile-Ife — inda Oduduwa ya shuka doya ta farko, kuma dukkan Orisha suka taru cikin kasuwanci."',
    SW: '"Ninawaambia hadithi ya soko la kwanza Ile-Ife — ambapo Oduduwa alipanda yam ya kwanza, na Orisha wote walikusanyika kufanya biashara."',
  }

  const accentColor: Record<PostT,string> = {
    text:'#1a7c3e', voice:'#4f46e5', market:'#e07b00', proverb:'#d4a017',
    notice:'#d4a017', oracle:'#d4a017', proof:'#4ade80', event:'#ef4444',
  }

  const cardBg: Record<PostT,string> = {
    text:'linear-gradient(160deg,#0c1009,#111a0d)',
    voice:'linear-gradient(160deg,#0d1a08,#162810)',
    market:'linear-gradient(160deg,#0d1a08,#1a1200)',
    proverb:'linear-gradient(160deg,#0d1208,#1a1808)',
    notice:'linear-gradient(160deg,#1a1800,#1a1200)',
    oracle:'linear-gradient(160deg,#1a1200,#1a0d00)',
    proof:'linear-gradient(160deg,#081a0d,#0e2810)',
    event:'linear-gradient(160deg,#180808,#1a0a0a)',
  }

  const typeTag: Record<PostT,string|null> = {
    text:null, voice:null, market:null, proverb:null,
    notice:'Village Notice', oracle:null, proof:'Trade Proof', event:'Event Drum',
  }

  const scopeLabel = { village:'🏘 Village', region:'🏙 Region', nation:'🌍 Nation' }[post.scope]
  const geoReachLabel: Record<Geo,string> = { village:'🏘', state:'🏙', country:'🌍', continent:'🌐', global:'⭐' }

  return (
    <div className="ss-fade" style={{ margin:'0 12px 12px',borderRadius:16,background:cardBg[post.type],border:`1px solid ${post.type==='proof'?'rgba(74,222,128,.15)':post.type==='notice'||post.type==='oracle'?'rgba(212,160,23,.2)':post.type==='event'?'rgba(239,68,68,.15)':'rgba(255,255,255,.06)'}`,overflow:'hidden',position:'relative' }}>
      {/* accent top bar */}
      <div style={{ height:3,background:accentColor[post.type] }} />

      {/* spray container */}
      <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:10,overflow:'hidden' }}>
        {sprays.map(s => <div key={s.id} className="shell-fly" style={{ left:`${s.x}%`,bottom:60,animationDelay:`${Math.random()*.3}s` }}>🪙</div>)}
      </div>

      {/* inline toast */}
      {toast && <div style={{ position:'absolute',top:8,left:'50%',transform:'translateX(-50%)',background:'#151e12',border:'1px solid rgba(74,222,128,.2)',borderRadius:10,padding:'6px 12px',fontSize:11,fontWeight:600,color:'#f0f5ee',zIndex:20,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.6)' }}>{toast}</div>}

      {/* header */}
      <div style={{ padding:'11px 14px 0',display:'flex',alignItems:'flex-start',gap:10 }}>
        <div style={{ width:42,height:42,borderRadius:'50%',background:post.avBg,border:`2px solid ${post.avBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0,position:'relative' }}>
          {post.av}
          {post.crest && <div style={{ position:'absolute',bottom:-2,right:-2,fontSize:9,background:'#0c1009',borderRadius:'50%',width:16,height:16,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.1)' }}>{post.crest}</div>}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:700,color:'#f0f5ee',display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',lineHeight:1.3 }}>
            {post.authorName}
            {post.verified && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(74,222,128,.1)',color:'#4ade80',border:'1px solid rgba(74,222,128,.2)' }}>🛡 GREEN</span>}
            {typeTag[post.type] && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(212,160,23,.1)',color:'#fbbf24',border:'1px solid rgba(212,160,23,.2)' }}>👑 {typeTag[post.type]}</span>}
            {post.type==='proof' && <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(74,222,128,.1)',color:'#4ade80',border:'1px solid rgba(74,222,128,.2)' }}>✓ SEALED</span>}
          </div>
          <div style={{ fontSize:10,color:'rgba(240,245,238,.45)',marginTop:3,display:'flex',alignItems:'center',gap:5 }}>
            <span>{post.village}</span><span>·</span><span>{post.time}</span>
            <span>·</span>
            <span style={{ fontSize:9,fontWeight:700,color:GEO_CTX[post.geoMin].accentColor,opacity:.7 }}>{geoReachLabel[post.geoMin]} {GEO_CTX[post.geoMin].tag}</span>
          </div>
        </div>
        <div style={{ fontSize:18,color:'rgba(255,255,255,.3)',cursor:'pointer',padding:'0 4px',flexShrink:0 }}>⋮</div>
      </div>

      {/* ── body by type ── */}
      {/* TEXT */}
      {post.type==='text' && <div style={{ padding:'10px 14px 0',fontSize:13,lineHeight:1.65,color:'rgba(240,245,238,.9)' }}>{post.content}</div>}

      {/* VOICE */}
      {post.type==='voice' && (
        <div style={{ margin:'10px 14px 0',background:'rgba(0,0,0,.25)',borderRadius:12,padding:'12px 14px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
            <div onClick={handlePlay} style={{ width:36,height:36,borderRadius:'50%',background:'rgba(79,70,229,.3)',border:'2px solid rgba(79,70,229,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,cursor:'pointer',flexShrink:0 }}>{playing?'⏸':'▶'}</div>
            <Waveform color="#4f46e5" playing={playing} />
            <span style={{ fontSize:10,color:'rgba(255,255,255,.4)',flexShrink:0 }}>{post.duration}</span>
          </div>
          <div style={{ height:4,borderRadius:99,background:'rgba(255,255,255,.1)',overflow:'hidden',marginBottom:10 }}>
            <div style={{ height:'100%',width:`${progress}%`,background:'#4f46e5',borderRadius:99,transition:'width .3s linear' }} />
          </div>
          {/* Spirit Voice */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,.06)',paddingTop:8 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:6 }}>
              <span style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em' }}>🌍 Spirit Voice</span>
              <div style={{ display:'flex',gap:3 }}>
                {SV_LANGS.map(l => (
                  <span key={l} onClick={()=>setSvLang(l)} style={{ fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:4,cursor:'pointer',background:svLang===l?'#1a7c3e':'rgba(255,255,255,.05)',color:svLang===l?'#fff':'rgba(255,255,255,.3)',transition:'all .15s' }}>{l}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize:11,fontStyle:'italic',color:'rgba(200,230,200,.8)',lineHeight:1.55,padding:'6px 9px',background:'rgba(0,0,0,.2)',borderRadius:8,borderLeft:'2px solid #1a7c3e' }}>{SV_TRANS[svLang]||SV_TRANS.EN}</div>
          </div>
        </div>
      )}

      {/* MARKET */}
      {post.type==='market' && (
        <div>
          <div style={{ height:180,background:'linear-gradient(135deg,#1a2808,#2a2000)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60,position:'relative' }}>
            {post.productEmoji}
            <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'8px 12px',background:'linear-gradient(transparent,rgba(0,0,0,.8))' }}>
              <span style={{ fontSize:8,fontWeight:700,borderRadius:99,padding:'2px 7px',background:'rgba(224,123,0,.2)',color:'#fb923c',border:'1px solid rgba(224,123,0,.3)' }}>🧺 {post.location}</span>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:22,fontWeight:900,color:'#fbbf24',marginTop:2 }}>₡ {post.price?.replace('₡ ','')}</div>
              <div style={{ fontSize:10,color:'rgba(212,160,23,.6)' }}>{post.productName}</div>
            </div>
          </div>
          <div style={{ padding:'8px 14px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.05em' }}>
              <span>Price vs Market</span>
              <span style={{ color:(post.pricePos??45)<40?'#4ade80':'#f87171' }}>{(post.pricePos??45)<40?'Below market ✓':'Fair market'}</span>
            </div>
            <div style={{ height:8,borderRadius:99,background:'linear-gradient(to right,#1a7c3e,#d4a017,#b22222)',position:'relative',marginBottom:4 }}>
              <div style={{ position:'absolute',top:-3,left:`${post.pricePos??45}%`,transform:'translateX(-50%)',width:3,height:14,background:'#fff',borderRadius:99,boxShadow:'0 0 6px rgba(255,255,255,.6)' }} />
            </div>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:9 }}>
              <span style={{ color:'#4ade80' }}>Below ₡{post.marketLow}</span>
              <span style={{ color:'#fbbf24' }}>Market ₡{post.marketMid}</span>
              <span style={{ color:'#f87171' }}>Above ₡{post.marketHigh}</span>
            </div>
          </div>
          <div style={{ display:'flex',gap:6,padding:'0 14px 10px' }}>
            <button onClick={()=>showToast('🤝 Opening Trade Session...')} style={{ flex:1,padding:11,borderRadius:11,background:'#1a7c3e',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif' }}>🤝 Open Trade Session</button>
            <button onClick={()=>showToast('🦅 Griot is reading this post...')} style={{ flex:1,padding:11,borderRadius:11,background:'rgba(212,160,23,.15)',border:'1px solid rgba(212,160,23,.25)',color:'#fbbf24',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif' }}>🦅 Ask Griot</button>
          </div>
        </div>
      )}

      {/* PROVERB CHAIN */}
      {post.type==='proverb' && (
        <div>
          <div style={{ padding:'12px 14px',background:'rgba(212,160,23,.05)',borderLeft:'3px solid #d4a017',margin:'10px 14px 0' }}>
            <div style={{ fontSize:13,fontStyle:'italic',color:'rgba(240,245,238,.9)',lineHeight:1.7,marginBottom:4 }}>{post.proverbRoot}</div>
            <div style={{ fontSize:10,color:'#fbbf24',fontWeight:700 }}>{post.proverbLang}</div>
          </div>
          <div style={{ padding:'8px 14px 0' }}>
            {[
              { flag:'🇬🇭',wisdom:'"Biribi wo soro na ema" — There is something above us all',lang:'Twi · Akan',hot:true },
              { flag:'🇰🇪',wisdom:'"Mkono mmoja haulei mwana" — One hand cannot raise a child',lang:'Swahili',hot:false },
              { flag:'🇿🇦',wisdom:'"Umuntu ngumuntu ngabantu" — A person is a person through others',lang:'Zulu',hot:false },
            ].map((c,i) => (
              <div key={i} style={{ display:'flex',gap:8,marginBottom:8,paddingLeft:16,borderLeft:`1px solid ${c.hot?'#fbbf24':'rgba(255,255,255,.08)'}` }}>
                <span style={{ fontSize:14,flexShrink:0,marginTop:2 }}>{c.flag}</span>
                <div>
                  <div style={{ fontSize:11,fontStyle:'italic',color:c.hot?'#fbbf24':'rgba(200,220,190,.8)',lineHeight:1.6 }}>{c.wisdom}</div>
                  <div style={{ fontSize:9,color:'#fbbf24',fontWeight:700,marginTop:2 }}>{c.lang}{c.hot?' · 🌟 Most Kíla\'d':''}</div>
                </div>
              </div>
            ))}
            <div onClick={()=>showToast('📿 Adding your proverb to the chain...')} style={{ padding:'9px 14px',background:'rgba(212,160,23,.08)',border:'1px dashed rgba(212,160,23,.2)',borderRadius:10,textAlign:'center',fontSize:11,fontWeight:700,color:'rgba(212,160,23,.6)',cursor:'pointer',marginBottom:8 }}>
              + Chain Your Wisdom
            </div>
          </div>
        </div>
      )}

      {/* ORACLE */}
      {post.type==='oracle' && (
        <div style={{ padding:'10px 14px 0' }}>
          <div style={{ display:'flex',gap:8,marginBottom:8,overflowX:'auto',paddingBottom:4 }}>
            {[{av:'👤',name:'Ayo Abara',speaking:true},{av:'👤',name:'Fatima D.',speaking:false},{av:'👤',name:'Kwame B.',speaking:false},{av:'🤚',name:'+312',speaking:false}].map((s,i)=>(
              <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0 }}>
                <div style={{ width:44,height:44,borderRadius:'50%',background:'rgba(212,160,23,.1)',border:`2px solid ${s.speaking?'#4ade80':'rgba(255,255,255,.15)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,boxShadow:s.speaking?'0 0 12px rgba(74,222,128,.4)':'none' }}>{s.av}</div>
                <span style={{ fontSize:9,color:'rgba(255,255,255,.5)',textAlign:'center',maxWidth:50,lineHeight:1.2 }}>{s.name}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize:13,color:'rgba(240,245,238,.8)',lineHeight:1.6,marginBottom:8,fontStyle:'italic' }}>"{post.oracleContent}"</div>
          <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.4)',marginBottom:6 }}>Audience Pulse · 4.8K listening</div>
          <div style={{ height:10,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden',display:'flex',marginBottom:4 }}>
            <div style={{ width:`${agree}%`,background:'#4ade80',borderRadius:99,transition:'width .5s ease' }} />
            <div style={{ flex:1,background:'#f87171',borderRadius:99 }} />
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:700,marginBottom:8 }}>
            <span style={{ color:'#4ade80' }}>Agree {agree}%</span>
            <span style={{ color:'#f87171' }}>Disagree {100-agree}%</span>
          </div>
          <div style={{ display:'flex',gap:6,marginBottom:8 }}>
            {[['🤚 Raise Hand','rgba(26,124,62,.2)','#4ade80','rgba(26,124,62,.3)'],['✓ Agree','rgba(212,160,23,.15)','#fbbf24','rgba(212,160,23,.25)'],['✗ Disagree','rgba(224,123,0,.15)','#fb923c','rgba(224,123,0,.25)']].map(([l,bg,c,b],i)=>(
              <button key={i} onClick={()=>{ if(i===1)setAgree(a=>Math.min(95,a+2)); if(i===2)setAgree(a=>Math.max(5,a-2)); showToast(i===0?'🤚 Hand raised — queue: 4':i===1?`✓ Agree — ${agree+2}%`:`✗ Disagree — ${agree-2}% agree`) }} style={{ flex:1,padding:9,borderRadius:10,border:`1px solid ${b}`,background:bg,color:c,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif' }}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* TRADE PROOF */}
      {post.type==='proof' && (
        <div style={{ padding:'12px 14px',textAlign:'center' }}>
          <div style={{ fontSize:36,marginBottom:6 }}>🎉</div>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:800,color:'#4ade80',marginBottom:4 }}>Trade Sealed Successfully!</div>
          <div style={{ fontSize:12,color:'rgba(255,255,255,.6)',lineHeight:1.6 }}>{post.tradeProduct} · {post.tradeLocation}</div>
          <div style={{ fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:900,color:'#fbbf24',margin:'6px 0' }}>₡ {post.tradeAmount} ✓</div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:8 }}>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:20 }}>🧺</div><div style={{ fontSize:11,fontWeight:700,color:'#f0f5ee' }}>{post.tradeBuyer}</div><div style={{ fontSize:9,color:'rgba(255,255,255,.4)' }}>Buyer</div></div>
            <span style={{ fontSize:20,color:'rgba(74,222,128,.4)' }}>→</span>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:20 }}>🌾</div><div style={{ fontSize:11,fontWeight:700,color:'#f0f5ee' }}>{post.tradeSeller}</div><div style={{ fontSize:9,color:'rgba(255,255,255,.4)' }}>Seller</div></div>
          </div>
        </div>
      )}

      {/* NOTICE */}
      {post.type==='notice' && (
        <div>
          <div style={{ background:'linear-gradient(135deg,#2a2000,#1a1800)',padding:'10px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(212,160,23,.15)' }}>
            <span style={{ fontSize:22 }}>📯</span>
            <div>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:11,fontWeight:700,color:'#fbbf24',textTransform:'uppercase',letterSpacing:'.06em' }}>Village Notice</div>
              <div style={{ fontSize:10,color:'rgba(212,160,23,.6)',marginTop:1 }}>From {post.authorName} · Crest {post.crest}</div>
            </div>
          </div>
          <div style={{ padding:'10px 14px 0',fontSize:13,lineHeight:1.65,color:'rgba(240,245,238,.85)' }}>{post.noticeContent}</div>
        </div>
      )}

      {/* EVENT DRUM */}
      {post.type==='event' && (() => {
        let ev: Record<string,any> | null = null
        try { ev = post.eventPayload ? JSON.parse(post.eventPayload) : null } catch {}
        if (!ev) return null
        const lowestPrice = Math.min(...(ev.tiers as any[]).map((t:any) => t.price))
        const totalAvail  = (ev.tiers as any[]).reduce((s:number,t:any) => s+t.available, 0)
        const isSoldOut   = totalAvail === 0
        const dateObj     = new Date(ev.date)
        return (
          <div>
            {/* Event banner */}
            <div style={{ height:130,background:`linear-gradient(135deg,${ev.villageColor}25,${ev.villageColor}08)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:58,position:'relative',borderTop:'1px solid rgba(255,255,255,.04)' }}>
              {ev.coverEmoji}
              <div style={{ position:'absolute',top:9,left:11,padding:'3px 9px',borderRadius:99,fontSize:9,fontWeight:800,background:'rgba(239,68,68,.18)',color:'#ef4444',border:'1px solid rgba(239,68,68,.3)',display:'flex',alignItems:'center',gap:4 }}>
                <span style={{ width:5,height:5,borderRadius:'50%',background:'#ef4444',display:'inline-block' }} />LIVE
              </div>
              {ev.drumScope==='JOLLOF_TV' && (
                <div style={{ position:'absolute',top:9,right:11,padding:'3px 8px',borderRadius:99,fontSize:9,fontWeight:700,background:'rgba(239,68,68,.15)',color:'#ef4444',border:'1px solid rgba(239,68,68,.25)' }}>📺 JOLLOF TV</div>
              )}
              {ev.drumScope==='NATION' && (
                <div style={{ position:'absolute',top:9,right:11,padding:'3px 8px',borderRadius:99,fontSize:9,fontWeight:700,background:'rgba(74,222,128,.12)',color:'#4ade80',border:'1px solid rgba(74,222,128,.2)' }}>🌍 Nation-wide</div>
              )}
            </div>
            {/* Event body */}
            <div style={{ padding:'12px 14px 6px' }}>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:900,color:'#f0f7f0',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ev.title}</div>
              <div style={{ display:'flex',gap:8,fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:8,flexWrap:'wrap' }}>
                <span>📅 {dateObj.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                <span style={{ color:'rgba(255,255,255,.2)' }}>·</span>
                <span>📍 {ev.venueName?.split(',')[0]}</span>
                <span style={{ color:'rgba(255,255,255,.2)' }}>·</span>
                <span style={{ color:`${ev.villageColor}` }}>{ev.villageEmoji} {ev.village}</span>
              </div>
              {/* Tiers */}
              <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginBottom:10 }}>
                {(ev.tiers as any[]).map((t:any) => (
                  <span key={t.name} style={{ fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:99,background:t.available===0?'rgba(107,114,128,.12)':'rgba(74,222,128,.08)',color:t.available===0?'#6b7280':'#4ade80',border:`1px solid ${t.available===0?'rgba(107,114,128,.2)':'rgba(74,222,128,.2)'}` }}>
                    {t.name}: {t.price===0?'FREE':`🐚 ${t.price.toLocaleString()}`}{t.available===0?' · SOLD OUT':` · ${t.available} left`}
                  </span>
                ))}
              </div>
              {/* CTA */}
              <div style={{ display:'flex',gap:7,marginBottom:4 }}>
                <button onClick={()=>{ if(typeof window!=='undefined') window.location.href=`/dashboard/events/${ev.eventId}` }} style={{ flex:2,padding:'10px',borderRadius:11,border:'none',cursor:'pointer',background:isSoldOut?'rgba(107,114,128,.15)':`linear-gradient(135deg,${ev.villageColor}cc,${ev.villageColor}88)`,color:isSoldOut?'#6b7280':'#fff',fontSize:11,fontWeight:800,fontFamily:'Sora,sans-serif' }}>
                  {isSoldOut?'⏳ Join Waiting Compound':`🎟 Get Tickets — ${lowestPrice===0?'FREE':`from 🐚 ${lowestPrice.toLocaleString()}`}`}
                </button>
                <button onClick={()=>{ if(typeof window!=='undefined') window.location.href=`/dashboard/events/${ev.eventId}` }} style={{ flex:1,padding:'10px',borderRadius:11,border:`1px solid ${ev.villageColor}35`,background:'none',color:ev.villageColor,fontSize:11,fontWeight:700,cursor:'pointer' }}>
                  Info →
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── heat bar ── */}
      <HeatBar pct={post.heat} />

      {/* ── drum scope ── */}
      <div style={{ display:'flex',alignItems:'center',gap:5,padding:'4px 14px 8px',fontSize:10,color:'rgba(255,255,255,.4)' }}>
        <span>Reach:</span>
        <span style={{ fontWeight:700,color:'#fbbf24',background:'rgba(212,160,23,.1)',borderRadius:99,padding:'2px 8px' }}>{scopeLabel}</span>
      </div>

      {/* ── 7 interactions ── */}
      <div style={{ display:'flex',gap:4,padding:'0 14px 8px',overflowX:'auto',flexWrap:'nowrap' }}>
        {[
          { key:'kila',  label:`⭐ Kíla ${kilaN}`,  lit:kilaLit, litBg:'rgba(255,215,0,.12)',  litC:'#fbbf24', litBorder:'rgba(255,215,0,.25)',   action:handleKila },
          { key:'stir',  label:`🔥 Stir ${post.stir}`,  lit:false, action:()=>{ sorosokeApi.stir(post.id).catch(()=>{}); showToast('🔥 Stirred! Heat rising.') } },
          { key:'drum',  label:`🥁 Drum ${post.drum}`,  lit:false, action:()=>{ sorosokeApi.drum(post.id, { content: '' }).catch(()=>{}); showToast('🥁 Drum sent! Author must approve.') } },
          { key:'ubuntu',label:'🤝 Ubuntu',               lit:false, action:()=>{ sorosokeApi.ubuntu(post.id).catch(()=>{}); showToast('🤝 Ubuntu — "I am because we are"') } },
          { key:'spray', label:`💸 Spray ${post.spray??0}`, lit:false, action:handleSpray },
          { key:'trade', label:'🛒 Trade',                 lit:false, action:()=>showToast('🤝 Opening Trade Session...') },
          { key:'griot', label:'🦅 Griot',                 lit:false, action:()=>showToast('🦅 "The wisdom here speaks to village unity."') },
        ].map(({key,label,lit,litBg,litC,litBorder,action})=>(
          <button key={key} onClick={action} style={{
            display:'flex',alignItems:'center',gap:4,padding:'6px 9px',borderRadius:99,
            fontSize:10,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',
            border:`1px solid ${lit&&litBorder?litBorder:'rgba(255,255,255,.08)'}`,
            background:lit&&litBg?litBg:'rgba(255,255,255,.03)',
            color:lit&&litC?litC:'rgba(240,245,238,.5)',
            transition:'all .18s',
            flexShrink:0,
          }}>{label}</button>
        ))}
      </div>
      {/* Comment · Share · Bookmark row */}
      <div style={{ display:'flex',alignItems:'center',gap:6,padding:'0 14px 11px' }}>
        <button onClick={()=>setCommentOpen(true)} style={{ display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.45)' }}>
          💬 Comment
        </button>
        <button onClick={handleShare} style={{ display:'flex',alignItems:'center',gap:3,padding:'5px 8px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'rgba(255,255,255,.35)' }}>
          ↗ Share
        </button>
        <button onClick={handleBookmark} style={{ display:'flex',alignItems:'center',gap:3,padding:'5px 8px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:`1px solid ${bookmarked?'rgba(251,191,36,.35)':'rgba(255,255,255,.08)'}`,background:bookmarked?'rgba(251,191,36,.12)':'rgba(255,255,255,.03)',color:bookmarked?'#fbbf24':'rgba(255,255,255,.3)' }}>
          {bookmarked?'🔖 Saved':'🏷 Save'}
        </button>
        <span style={{ marginLeft:'auto',fontSize:9,color:'rgba(255,255,255,.2)' }}>🔥 {post.heat}</span>
      </div>
      {/* Comment sheet */}
      <CommentSheet open={commentOpen} onClose={()=>setCommentOpen(false)} postId={post.id} postPreview={post.content || post.proverbRoot || post.noticeContent} />
    </div>
  )
}

/* ── create post sheet ── */
type CreatePostT = 'text'|'voice'|'market'|'proverb'|'golive'
function CreateSheet({ open, onClose, onPosted }: { open:boolean; onClose:()=>void; onPosted?:(p:Post)=>void }) {
  const [postType, setPostType] = React.useState<CreatePostT>('text')
  const [text, setText] = React.useState('')
  const [scope, setScope] = React.useState<'village'|'region'|'nation'>('village')
  const [isRecording, setIsRecording] = React.useState(false)
  const [recSecs, setRecSecs] = React.useState(0)
  const [posting, setPosting] = React.useState(false)
  const recRef = React.useRef<ReturnType<typeof setInterval>|null>(null)

  const heatPct = Math.min(90, 20 + text.length * 0.8)

  const toggleRecord = () => {
    if(isRecording) {
      setIsRecording(false)
      clearInterval(recRef.current!)
    } else {
      setIsRecording(true)
      recRef.current = setInterval(()=>setRecSecs(s=>{ if(s>=179){ setIsRecording(false); clearInterval(recRef.current!); return s } return s+1 }),1000)
    }
  }
  const fmtRec = (s:number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  const POST_TYPES: {t:CreatePostT;emoji:string;label:string}[] = [
    {t:'text',emoji:'🥁',label:'Text Drum'},{t:'voice',emoji:'🎙',label:'Voice Story'},
    {t:'market',emoji:'🛒',label:'Market Listing'},{t:'proverb',emoji:'📿',label:'Proverb Chain'},
    {t:'golive',emoji:'🔴',label:'Go Live'},
  ]

  if(!open) return null
  return (
    <div style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)',display:'flex',flexDirection:'column' }} onClick={onClose}>
      <div style={{ flex:1 }} />
      <div onClick={e=>e.stopPropagation()} style={{ background:'#111a0d',borderRadius:'28px 28px 0 0',padding:'0 0 40px',transform:open?'translateY(0)':'translateY(100%)',transition:'transform .35s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ width:40,height:4,borderRadius:99,background:'rgba(255,255,255,.2)',margin:'12px auto 16px' }} />
        <div style={{ padding:'0 16px 10px',fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:900,color:'#f0f5ee',display:'flex',alignItems:'center',gap:10 }}>
          What do you want to say?
          <span style={{ fontSize:13,color:'rgba(255,255,255,.4)',fontWeight:400 }}>{SKINS.ise.pill}</span>
        </div>
        {/* type scroll */}
        <div style={{ display:'flex',gap:10,overflowX:'auto',padding:'0 16px 12px',borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          {POST_TYPES.map(({t,emoji,label})=>(
            <div key={t} onClick={()=>setPostType(t)} style={{ flexShrink:0,width:80,background:postType===t?'rgba(74,222,128,.07)':'rgba(255,255,255,.04)',border:`1.5px solid ${postType===t?'#4ade80':'rgba(255,255,255,.08)'}`,borderRadius:14,padding:'12px 8px',textAlign:'center',cursor:'pointer' }}>
              <div style={{ fontSize:24,marginBottom:6 }}>{emoji}</div>
              <div style={{ fontSize:10,fontWeight:700,color:postType===t?'#4ade80':'rgba(255,255,255,.4)',lineHeight:1.3 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* voice recorder */}
        {postType==='voice' ? (
          <div style={{ padding:'20px 16px' }}>
            <div onClick={toggleRecord} style={{ width:80,height:80,borderRadius:'50%',background:isRecording?'rgba(178,34,34,.2)':'rgba(26,124,62,.2)',border:`2px solid ${isRecording?'rgba(178,34,34,.5)':'rgba(26,124,62,.4)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,cursor:'pointer',margin:'0 auto 12px',boxShadow:isRecording?'0 0 0 15px rgba(178,34,34,0)':'none',transition:'all .3s' }}>{isRecording?'⏹':'🎙'}</div>
            <div style={{ fontFamily:'Sora,sans-serif',fontSize:24,fontWeight:900,textAlign:'center',color:'#f0f5ee' }}>{fmtRec(recSecs)}</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,.4)',textAlign:'center',marginTop:6 }}>{isRecording?'Recording... tap to stop':'Tap to record (max 3:00)'}</div>
          </div>
        ) : postType==='golive' ? (
          <div style={{ padding:'20px 16px',textAlign:'center' }}>
            <div style={{ width:88,height:88,borderRadius:'50%',background:'radial-gradient(circle,rgba(239,68,68,.25),rgba(239,68,68,.05))',border:'3px solid rgba(239,68,68,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 14px',boxShadow:'0 0 30px rgba(239,68,68,.2)' }}>🔴</div>
            <div style={{ fontFamily:'Sora,sans-serif',fontSize:18,fontWeight:900,color:'#f87171',marginBottom:6 }}>Light the Fire</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:14 }}>Go live to your village — your stream will appear in Jollof TV and the Village Drum feed</div>
            <input placeholder="Stream title — e.g. Market Talk, Cooking Show..." style={{ width:'100%',background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.1)',borderRadius:12,padding:'12px 16px',fontSize:13,color:'#f0f5ee',outline:'none',marginBottom:10,boxSizing:'border-box' }} />
            <div style={{ display:'flex',gap:8 }}>
              <button style={{ flex:1,padding:10,background:'rgba(239,68,68,.15)',border:'1.5px solid rgba(239,68,68,.3)',borderRadius:10,fontSize:11,fontWeight:700,color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>📹 Camera</button>
              <button style={{ flex:1,padding:10,background:'rgba(74,222,128,.1)',border:'1.5px solid rgba(74,222,128,.3)',borderRadius:10,fontSize:11,fontWeight:700,color:'#4ade80',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>🎙 Audio Only</button>
              <button style={{ flex:1,padding:10,background:'rgba(96,165,250,.1)',border:'1.5px solid rgba(96,165,250,.3)',borderRadius:10,fontSize:11,fontWeight:700,color:'#60a5fa',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>🖥 Screen</button>
            </div>
          </div>
        ) : (
          <div style={{ padding:'12px 16px' }}>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={postType==='market'?'Describe your product — quantity, quality, location...':'What do you want to say to your village?'} style={{ width:'100%',background:'rgba(255,255,255,.05)',border:'1.5px solid rgba(255,255,255,.08)',borderRadius:14,padding:'14px 16px',fontSize:14,color:'#f0f5ee',outline:'none',fontFamily:'DM Sans,sans-serif',resize:'none',minHeight:100,lineHeight:1.6,boxSizing:'border-box' }} />
            <div style={{ marginTop:10,padding:'10px 14px',background:'rgba(0,0,0,.3)',borderRadius:10 }}>
              <div style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6 }}>Heat Prediction</div>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <div style={{ flex:1,height:6,borderRadius:99,background:'rgba(255,255,255,.06)',overflow:'hidden' }}>
                  <div style={{ height:'100%',width:`${heatPct}%`,background:'linear-gradient(to right,#2a1a08,#d4a017,#ff4500)',borderRadius:99,transition:'width .5s ease' }} />
                </div>
                <span style={{ fontSize:11,fontWeight:700,color:'#fbbf24',flexShrink:0 }}>{Math.round(heatPct)}%</span>
              </div>
              <div style={{ fontSize:10,color:'rgba(255,255,255,.4)',marginTop:4,fontStyle:'italic' }}>{heatPct<30?'Village only — write more to earn wider reach':heatPct<50?'Could reach Region if Drummed':'Strong post — may earn Nation scope!'}</div>
            </div>
          </div>
        )}
        {/* scope */}
        <div style={{ display:'flex',gap:7,margin:'0 16px 12px' }}>
          {(['village','region','nation'] as const).map(s=>(
            <div key={s} onClick={()=>setScope(s)} style={{ flex:1,padding:9,borderRadius:10,border:`1px solid ${scope===s?'rgba(26,124,62,.3)':'rgba(255,255,255,.08)'}`,background:scope===s?'rgba(26,124,62,.15)':'rgba(255,255,255,.03)',textAlign:'center',cursor:'pointer' }}>
              <div style={{ fontSize:16,marginBottom:4 }}>{s==='village'?'🏘':s==='region'?'🏙':'🌍'}</div>
              <div style={{ fontSize:9,fontWeight:700,color:scope===s?'#4ade80':'rgba(255,255,255,.4)',textTransform:'capitalize' }}>{s}{s==='nation'?' *':''}</div>
            </div>
          ))}
        </div>
        <button
          disabled={posting || (postType !== 'voice' && postType !== 'golive' && text.trim().length < 3)}
          onClick={async () => {
            if (posting) return
            setPosting(true)
            try {
              let token: string | null = null
              let villageId: string | null = null
              try {
                const stored = localStorage.getItem('afk-auth')
                token = stored ? JSON.parse(stored)?.state?.accessToken ?? null : null
              } catch {}
              try {
                const vs = localStorage.getItem('afk-village')
                villageId = vs ? JSON.parse(vs)?.state?.activeVillageId ?? null : null
              } catch {}
              if (token && villageId && text.trim()) {
                await fetch('/api/posts', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ body: text.trim(), villageId, skin: 'ise' }),
                })
              }
            } catch {}
            finally { setPosting(false) }
            setText(''); onClose()
          }}
          style={{ margin:'0 16px',width:'calc(100% - 32px)',padding:14,background:posting?'rgba(26,124,62,.4)':'#1a7c3e',border:'none',borderRadius:14,fontSize:14,fontWeight:700,color:'#fff',cursor:posting?'wait':'pointer',fontFamily:'Sora,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}
        >
          {posting ? '⏳ Drumming…' : '🥁 Drum This to Your Village'}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const GEO_TABS = [['village','🏘 My Village'],['state','🏙 My State'],['country','🌍 Nigeria'],['continent','🌐 Africa'],['global','⭐ Global']] as const
const LAYER_TABS = [['drum','🥁 Village Drum'],['nation','🌍 Nation Square'],['motion','📺 Motion']] as const

export default function SoroFeedPage() {
  const [skin, setSkin] = React.useState<Skin>('ise')
  const [geo,  setGeo]  = React.useState<Geo>('village')
  const [layer,setLayer] = React.useState<Layer>('drum')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [feedLive, setFeedLive] = React.useState(false)
  const [livePosts, setLivePosts] = React.useState<Post[]>(ALL_POSTS)
  const [villageInfo, setVillageInfo] = React.useState<{name:string;emoji:string;ancientName?:string;memberCount?:number}|undefined>(undefined)

  // ── Fetch live posts from soro-soke-feed ────────────────
  React.useEffect(() => {
    // Read token + villageId from persisted auth store
    let token: string | null = null
    let villageId: string | null = null
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('afk-auth') : null
      const state = stored ? JSON.parse(stored)?.state : null
      token = state?.accessToken ?? state?.token ?? null
    } catch {}
    try {
      const vs = typeof window !== 'undefined' ? localStorage.getItem('afk-village') : null
      villageId = vs ? JSON.parse(vs)?.state?.activeVillageId ?? null : null
    } catch {}

    // ── Fetch village info for context banner ──────────────
    if (villageId) {
      fetch(`/api/v1/villages/${villageId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          const v = d?.data ?? d
          if (v?.name) setVillageInfo({ name: v.name, emoji: v.emoji ?? v.badgeEmoji ?? '🏘', ancientName: v.ancientName ?? undefined, memberCount: v._count?.memberships ?? v.memberCount ?? undefined })
        })
        .catch(() => {})
    }

    const params = new URLSearchParams({ limit: '30', sort: 'hot', skin })
    if (villageId) params.set('villageId', villageId)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(`/api/feed?${params.toString()}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || !Array.isArray(d.data) || d.data.length === 0) return
        // Merge: dedupe by id, live posts first, then local mock
        const liveIds = new Set(d.data.map((p: any) => p.id))
        const merged = [
          ...d.data.map((p: any) => ({
            id: p.id,
            type: (p.type ?? p.postType ?? 'text').toLowerCase().replace('_drum','').replace('text_',''),
            skin: (p.skinContext ?? p.skin ?? skin) as Skin,
            geoMin: (p.geoMin ?? p.geoLayer ?? 'village') as Geo,
            authorName: p.author?.displayName ?? p.author?.handle ?? 'Villager',
            village: p.village?.name ?? p.villageId ?? villageId ?? 'village',
            av: p.author?.avatarEmoji ?? '👤',
            avBg: 'rgba(26,124,62,.15)', avBorder: 'rgba(26,124,62,.4)',
            time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'now',
            heat: p.heatScore ?? 50,
            content: p.body ?? p.content ?? '',
            kila: p.kilaCount ?? 0, stir: p.stirCount ?? 0, drum: p.drumCount ?? 0,
            ubuntu: p.ubuntuCount ?? 0, spray: p.sprayTotal ?? 0,
            scope: 'village' as const,
          })),
          ...ALL_POSTS.filter(p => !liveIds.has(p.id)),
        ] as Post[]
        setLivePosts(merged)
        setFeedLive(true)
      })
      .catch(() => {})
  }, [skin, geo])

  const hour = new Date().getHours()
  const isNightMarket = hour >= 18

  const skinCfg = SKINS[skin]

  /* geo-aware filter: post appears at its geoMin AND all wider scopes */
  const geoIdx = GEO_ORDER.indexOf(geo)
  const posts = livePosts.filter(p =>
    p.skin === skin &&
    GEO_ORDER.indexOf(p.geoMin) <= geoIdx
  )

  React.useEffect(()=>{
    if(typeof document==='undefined' || document.getElementById(INJECT_ID)) return
    const s = document.createElement('style'); s.id=INJECT_ID; s.textContent=STYLES
    document.head.appendChild(s)
  },[])

  return (
    <div style={{ minHeight:'100dvh',background:'#07090a',color:'#f0f5ee',fontFamily:'DM Sans,sans-serif',display:'flex',flexDirection:'column' }}>

      {/* ── Adinkra bg ── */}
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:0,opacity:.025,backgroundImage:'repeating-linear-gradient(45deg,#d4a017 0px,#d4a017 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px' }} />

      {/* ── Header ── */}
      <div style={{ position:'sticky',top:0,zIndex:40,background:'#0c1009',flexShrink:0 }}>
        {/* top row */}
        <div style={{ padding:'10px 16px 6px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:900,background:'linear-gradient(135deg,#4ade80,#d4a017)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Sòrò Sókè</div>
            {feedLive && <span style={{ fontSize:9, padding:'2px 6px', background:'rgba(74,222,128,.12)', border:'1px solid rgba(74,222,128,.25)', borderRadius:20, color:'#4ade80', fontWeight:700 }}>● LIVE</span>}
            <div style={{ fontSize:11,color:'rgba(255,255,255,.4)',marginTop:-2,fontStyle:'italic' }}>The Voice of the Village</div>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <div onClick={()=>{setCreateOpen(true)}} style={{ padding:'5px 10px',borderRadius:20,background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',display:'flex',alignItems:'center',gap:4,cursor:'pointer' }}>
              <span style={{ fontSize:10 }}>🔴</span>
              <span style={{ fontSize:10,fontWeight:700,color:'#f87171' }}>LIVE</span>
            </div>
            {['✏','🔔','🔍'].map((ico,i)=>(
              <div key={i} onClick={i===0?()=>setCreateOpen(true):undefined} style={{ width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,cursor:'pointer' }}>{ico}</div>
            ))}
          </div>
        </div>
        {/* skin bar */}
        <div style={{ padding:'6px 16px',display:'flex',alignItems:'center',gap:7,borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          <span style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.07em' }}>Skin:</span>
          <div style={{ display:'flex',gap:5 }}>
            {(['ise','egbe','idile'] as Skin[]).map(s=>(
              <div key={s} onClick={()=>setSkin(s)} style={{ padding:'4px 11px',borderRadius:99,fontSize:10,fontWeight:700,cursor:'pointer',border:`1px solid ${skin===s?SKINS[s].border:'transparent'}`,background:skin===s?SKINS[s].bg:'rgba(255,255,255,.05)',color:skin===s?SKINS[s].light:'rgba(255,255,255,.4)',transition:'all .22s' }}>{SKINS[s].label}</div>
            ))}
          </div>
        </div>
        {/* geo tabs */}
        <div style={{ display:'flex',overflowX:'auto',padding:'0 14px',borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          {GEO_TABS.map(([k,l])=>(
            <div key={k} onClick={()=>setGeo(k as Geo)} style={{ padding:'7px 12px',fontSize:10,fontWeight:700,color:geo===k?'#4ade80':'rgba(255,255,255,.3)',cursor:'pointer',whiteSpace:'nowrap',borderBottom:`2px solid ${geo===k?'#1a7c3e':'transparent'}`,transition:'all .2s' }}>{l}</div>
          ))}
        </div>
        {/* layer tabs */}
        <div style={{ display:'flex',background:'#0c1009',borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          {LAYER_TABS.map(([k,l])=>(
            <div key={k} onClick={()=>setLayer(k as Layer)} style={{ flex:1,padding:'9px 4px',textAlign:'center',fontSize:11,fontWeight:700,color:layer===k?'#4ade80':'rgba(255,255,255,.3)',cursor:'pointer',borderBottom:`2px solid ${layer===k?'#1a7c3e':'transparent'}`,transition:'all .2s' }}>{l}</div>
          ))}
        </div>
      </div>

      {/* ── Stories Row ── */}
      <StoriesRow />

      {/* ── Feed ── */}
      <div style={{ flex:1,overflowY:'auto',position:'relative',zIndex:5 }}>
        {/* geo context banner */}
        <GeoContextBanner geo={geo} villageOverride={geo === 'village' ? villageInfo : undefined} />

        {/* geo-specific widget */}
        {GEO_CTX[geo].widget === 'state-index'     && <StateIndexWidget />}
        {GEO_CTX[geo].widget === 'national-bulletin'&& <NationalBulletinWidget />}
        {GEO_CTX[geo].widget === 'continental-map' && <ContinentalMapWidget />}
        {GEO_CTX[geo].widget === 'diaspora-bridge' && <DiasporaBridgeWidget />}

        {/* night market */}
        {isNightMarket && (
          <div className="nm-banner" onClick={()=>{}} style={{ margin:'8px 12px',background:'linear-gradient(135deg,#2a1a00,#1a1000)',border:'1px solid rgba(212,160,23,.3)',borderRadius:14,padding:'11px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
            <span style={{ fontSize:26,flexShrink:0 }}>🏮</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:800,color:'#fbbf24' }}>Night Market Open</div>
              <div style={{ fontSize:10,color:'rgba(212,160,23,.6)',marginTop:2 }}>Commerce posts get +15 heat · Until midnight</div>
            </div>
            <div style={{ fontFamily:'Sora,sans-serif',fontSize:18,fontWeight:900,color:'#fbbf24',flexShrink:0 }}>5h 12m</div>
          </div>
        )}

        {/* village square (drum layer) */}
        {layer==='drum' && <VillageSquare />}

        {/* griot card (nation layer) */}
        {layer==='nation' && <GriotCard />}

        {/* motion feed layer — TikTok-style full-screen vertical scroll */}
        {layer==='motion' && (
          <MotionFeed posts={MOTION_POSTS} onInteract={(type, id) => { sorosokeApi[type as 'kila'|'stir']?.(id).catch(()=>{}) }} />
        )}

        {/* section label — geo aware */}
        <div style={{ padding:'6px 16px',fontSize:9,fontWeight:700,color:'rgba(255,255,255,.2)',textTransform:'uppercase',letterSpacing:'.09em',display:'flex',alignItems:'center',gap:8 }}>
          <span>{GEO_CTX[geo].emoji} {GEO_CTX[geo].tag} · {skin.toUpperCase()} · {posts.length} posts</span>
          <div style={{ flex:1,height:1,background:'rgba(255,255,255,.06)' }} />
          <span style={{ fontSize:8,color:`${GEO_CTX[geo].accentColor}80` }}>Jollof Score ↑</span>
        </div>

        {/* empty state */}
        {posts.length === 0 && (
          <div style={{ padding:'32px 24px',textAlign:'center' }}>
            <div style={{ fontSize:40,marginBottom:12 }}>{GEO_CTX[geo].emoji}</div>
            <div style={{ fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'rgba(255,255,255,.6)',marginBottom:6 }}>No posts yet at this level</div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,.3)' }}>Switch skin or post something to {GEO_CTX[geo].name}.</div>
          </div>
        )}

        {/* posts */}
        {posts.map(p => <PostCard key={p.id} post={p} />)}

        <div style={{ height:100 }} />
      </div>

      {/* ── FAB ── */}
      <button onClick={()=>setCreateOpen(true)} style={{ position:'fixed',bottom:90,right:18,zIndex:100,width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#1a7c3e,#0f5028)',border:'none',cursor:'pointer',fontSize:24,boxShadow:'0 4px 20px rgba(26,124,62,.5)',display:'flex',alignItems:'center',justifyContent:'center' }}>✏</button>

      {/* ── Create Sheet ── */}
      <CreateSheet open={createOpen} onClose={()=>setCreateOpen(false)} />
    </div>
  )
}
