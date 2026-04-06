'use client'
// ═══════════════════════════════════════════════════════════════════
// VILLAGE DETAIL — Role Selection + Tool Grid + AI Village Brain
// /dashboard/villages/[villageId]
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { VILLAGE_BY_ID } from '@/lib/villages-data'
import { TOOL_REGISTRY, type ToolDefinition } from '@/constants/tools'
import { ROLE_REGISTRY } from '@/constants/role-registry'

/* ── Village-specific default tools — supplement roles that only have the 3 generic tools ── */
// ── Canonical 8 tools per village — first role's tools from spec ──
const VILLAGE_DEFAULT_TOOLS: Record<string, string[]> = {
  commerce:     ['quick_invoice','price_checker','pos_dashboard','stock_tracker','runner_dispatch','bulk_order_manager','review_tracker','community_board'],
  agriculture:  ['price_checker','forecast_share','community_board','alert_system','inventory_tracker','quick_invoice','cold_chain_tracker','delivery_tracker'],
  health:       ['appointment_book','telemedicine','billing_dashboard','client_tracker','prescription_vault','referral_generator','analytics_report','community_alert'],
  education:    ['attendance_tracker','content_calendar','report_generator','project_tracker','community_board','client_tracker','daily_target_tracker','alert_system'],
  arts:         ['portfolio_vault','content_calendar','payment_link','analytics_report','social_shop','review_tracker','recording_vault','community_board'],
  builders:     ['site_survey','project_tracker','technical_docs','blueprint_vault','compliance_checker','client_tracker','billing_dashboard','portfolio_vault'],
  energy:       ['work_order','site_survey','parts_finder','safety_checklist','client_tracker','quick_invoice','maintenance_log','review_tracker'],
  transport:    ['daily_route','fuel_tracker','route_planner','safety_checklist','delivery_tracker','community_board','quick_invoice','alert_system'],
  technology:   ['code_project','api_tester','ticket_system','debug_log','audit_log','project_tracker','analytics_report','community_board'],
  media:        ['article_vault','content_calendar','publication_vault','source_log','analytics_report','community_board','campaign_manager','outreach_planner'],
  finance:      ['transaction_log','daily_settlement','compliance_checker','audit_report','client_tracker','billing_dashboard','risk_calculator','document_vault'],
  justice:      ['case_log','document_vault','billing_dashboard','research_vault','client_tracker','compliance_checker','booking_calendar','analytics_report'],
  government:   ['document_vault','compliance_checker','report_generator','queue_manager','daily_target_tracker','attendance_tracker','alert_system','community_board'],
  security:     ['territory_map','alert_system','community_alert','incident_log','report_generator','compliance_checker','daily_target_tracker','route_planner'],
  spirituality: ['community_board','attendance_tracker','outreach_planner','content_calendar','booking_calendar','community_connect','alert_system','report_generator'],
  sports:       ['content_calendar','portfolio_vault','payment_link','analytics_report','community_board','social_shop','booking_calendar','review_tracker'],
  fashion:      ['design_brief','portfolio_vault','product_listing','client_tracker','social_shop','review_tracker','payment_link','content_calendar'],
  family:       ['community_board','document_vault','alert_system','community_connect','session_log','outreach_planner','impact_tracker','report_generator'],
  hospitality:  ['booking_calendar','staff_manager','daily_settlement','quality_log','review_tracker','analytics_report','alert_system','community_board'],
  holdings:     ['analytics_report','community_board','daily_target_tracker','portfolio_vault','risk_calculator','outreach_planner','community_connect','content_calendar'],
}

function enrichRoleTools(villageId: string, staticKeys: string[]): ToolDefinition[] {
  const defaults = VILLAGE_DEFAULT_TOOLS[villageId] ?? []
  const allKeys = staticKeys.length <= 3
    ? [...new Set([...staticKeys, ...defaults])].slice(0, 8)
    : staticKeys
  return allKeys.map(k => TOOL_REGISTRY[k]).filter(Boolean) as ToolDefinition[]
}
import { useVillageStore } from '@/stores/villageStore'
import { VillageFlagBg } from '@/components/village/VillageFlagBg'
import { VILLAGE_TOOL_MAP } from '@/lib/village-tool-map'

/* ── All 20 village metadata for the Exchange tab ── */
const ALL_VILLAGE_META: { id: string; name: string; emoji: string; color: string }[] = [
  { id: 'commerce',     name: 'Wangara',    emoji: '💰', color: '#e07b00' },
  { id: 'agriculture',  name: 'Kemet',      emoji: '🌾', color: '#1a7c3e' },
  { id: 'health',       name: 'Wabet',      emoji: '🌿', color: '#0369a1' },
  { id: 'education',    name: 'Sankore',    emoji: '📚', color: '#4f46e5' },
  { id: 'arts',         name: 'Nok',        emoji: '🎭', color: '#7c3aed' },
  { id: 'builders',     name: 'Meroe',      emoji: '🏗️', color: '#b45309' },
  { id: 'energy',       name: 'Inga',       emoji: '⚡', color: '#b91c1c' },
  { id: 'transport',    name: 'Kilwa',      emoji: '🚛', color: '#0891b2' },
  { id: 'technology',   name: 'Alexandria', emoji: '💻', color: '#0f766e' },
  { id: 'media',        name: 'Timbuktu',   emoji: '📰', color: '#6b21a8' },
  { id: 'finance',      name: 'Sijilmasa',  emoji: '₵',  color: '#065f46' },
  { id: 'justice',      name: 'Gacaca',     emoji: '⚖️', color: '#1e3a5f' },
  { id: 'government',   name: 'Aksum',      emoji: '🏛️', color: '#1e40af' },
  { id: 'security',     name: 'Agojie',     emoji: '🛡️', color: '#991b1b' },
  { id: 'spirituality', name: 'Karnak',     emoji: '🙏', color: '#7c3aed' },
  { id: 'sports',       name: 'Nandi',      emoji: '⚽', color: '#047857' },
  { id: 'fashion',      name: 'Bida',       emoji: '👗', color: '#db2777' },
  { id: 'family',       name: 'Ubuntu',     emoji: '🏠', color: '#4d7c0f' },
  { id: 'hospitality',  name: 'Teranga',    emoji: '🍽️', color: '#c2410c' },
  { id: 'holdings',     name: 'Adulis',     emoji: '🚪', color: '#d4a017' },
]

/* ── Featured cross-village tools shown in the Exchange tab ── */
const FEATURED_CROSS_VILLAGE_TOOLS = [
  { toolKey: 'afroflix',    villageId: 'media',       roleKey: 'broadcaster',   name: 'AfroFlix',     icon: '🎬', desc: 'Watch Pan-African films & content' },
  { toolKey: 'night_market', villageId: 'hospitality', roleKey: 'hotel_manager', name: 'Night Market', icon: '🌙', desc: 'Buy & sell across villages at night' },
  { toolKey: 'watch_party',  villageId: 'media',       roleKey: 'broadcaster',   name: 'Watch Party',  icon: '🍿', desc: 'Watch together with any village' },
  { toolKey: 'talent_stage', villageId: 'arts',        roleKey: 'performer',     name: 'Talent Stage', icon: '🎤', desc: 'Perform for the whole community' },
  { toolKey: 'ajo_circle',   villageId: 'finance',     roleKey: 'ajo_keeper',    name: 'Ajo Circle',   icon: '🔮', desc: 'Join a savings circle from any village' },
  { toolKey: 'live_auction', villageId: 'commerce',    roleKey: 'auctioneer',    name: 'Live Auction', icon: '🔨', desc: 'Bid on goods across villages' },
]

type ApiRoleTool = {
  id: string; villageId: string; roleKey: string; toolKey: string
  toolName: string; earnsCowrie: boolean; opensSession: boolean
}

/* ── CSS ── */
const INJ = 'vd-village-detail-css'
const CSS = `
@keyframes vdFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes vdPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.15)}}
@keyframes vdSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes vdPop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
@keyframes vdGlow{0%,100%{box-shadow:0 0 0 0 var(--vc,rgba(26,124,62,.4))}50%{box-shadow:0 0 20px 4px var(--vc,rgba(26,124,62,.2))}}
@keyframes vdSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes vdShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.vd-fade{animation:vdFade .4s ease both}.vd-slide{animation:vdSlide .3s ease both}
.vd-pop{animation:vdPop .25s cubic-bezier(.34,1.56,.64,1) both}
.vd-glow{animation:vdGlow 2s ease-in-out infinite}
.vd-pulse{animation:vdPulse 2s ease-in-out infinite}
.vd-no-sb::-webkit-scrollbar{display:none}.vd-no-sb{-ms-overflow-style:none;scrollbar-width:none}
.vd-shimmer{background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);background-size:200% 100%;animation:vdShimmer 2s linear infinite}
.vd-tool-card:active{transform:scale(.96);opacity:.85}
.vd-role-section{transition:all .2s ease}
/* Ndebele stepped-rectangle section headers */
.vd-ndebele-header{border-left:4px solid;border-image:linear-gradient(to bottom,#d4a017,#1a7c3e,#b22222) 1;padding-left:12px}
/* Bogolan section divider */
.vd-bogolan-divider{height:2px;background:repeating-linear-gradient(90deg,rgba(139,105,20,.4) 0,rgba(139,105,20,.4) 8px,transparent 8px,transparent 16px)}
`

/* ── Village Innovations — 6 unique ideas per village ── */
interface Innovation { icon: string; title: string; desc: string; tag: string; cowrieTag?: string }
const VILLAGE_INNOVATIONS: Record<string, Innovation[]> = {
  commerce: [
    { icon: '🌙', title: 'Night Flash Market', desc: 'Hourly flash sales 6pm–midnight. Prices drop 30–70% as the moon rises.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '📦', title: 'Group Buy Caravan', desc: 'Pool orders with 5+ villagers for wholesale prices without a middleman.', tag: 'SAVES ₡' },
    { icon: '🤝', title: 'Trust Escrow', desc: 'Platform-verified escrow for large peer-to-peer trades. Funds released on confirmation.', tag: 'SECURE' },
    { icon: '🔊', title: 'Market Crier AI', desc: 'Get alerted when demand surges for your product across all 20 villages.', tag: 'AI' },
    { icon: '📊', title: 'Village Price Index', desc: 'Real-time crowdsourced prices for 500+ goods, updated every hour by members.', tag: 'LIVE' },
    { icon: '🎯', title: 'Auction Thursday', desc: 'Weekly themed live auctions where any of the 20 villages can bid and win.', tag: 'WEEKLY' },
  ],
  agriculture: [
    { icon: '🌧️', title: 'Rain Circle', desc: 'Community rainfall network. Get 48-hour planting windows based on village sensor data.', tag: 'LIVE' },
    { icon: '🌱', title: 'Seed Library', desc: 'Borrow and share rare African heirloom seeds with verified village neighbors.', tag: 'FREE' },
    { icon: '🚜', title: 'Equipment Share', desc: 'Rent farming equipment from neighbors by the hour. Reduce idle asset time.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '📱', title: 'Crop Doctor', desc: 'Photo your sick plant. AI identifies the disease and recommends a remedy within 60 seconds.', tag: 'AI' },
    { icon: '🛒', title: 'Farm-to-Table Direct', desc: 'Connect directly with restaurants and families. Skip middlemen. Earn 40% more.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🌿', title: 'Harvest Feast', desc: 'Communal harvest celebration with automated profit-sharing among contributing members.', tag: 'COMMUNITY' },
  ],
  health: [
    { icon: '🩸', title: 'Blood Circle', desc: 'Emergency blood type network. Verified donors respond within 15 minutes inside 5km.', tag: 'EMERGENCY' },
    { icon: '🌿', title: 'Herb Map', desc: 'Community-sourced map of medicinal plants in your area, verified by herbalists.', tag: 'LIVE MAP' },
    { icon: '👵', title: 'Elder Protocol', desc: 'Record and preserve traditional healing knowledge from village elders before it is lost.', tag: 'HERITAGE' },
    { icon: '🦟', title: 'Disease Watch', desc: 'Real-time community disease tracking with protocol alerts and prevention guidance.', tag: 'LIVE' },
    { icon: '📋', title: 'Health Passport', desc: 'Encrypted portable medical record living in your AfroID. Shareable with any provider.', tag: 'SECURE' },
    { icon: '💊', title: 'Medicine Share', desc: 'Safely redistribute unexpired unused medications within the village health network.', tag: 'FREE' },
  ],
  education: [
    { icon: '📚', title: 'Griot Library', desc: 'Community knowledge base in 40 African languages. Anyone can contribute and curate.', tag: 'OPEN' },
    { icon: '🎓', title: 'Skills Exchange', desc: 'Barter skills peer-to-peer: I teach you Python, you teach me Yoruba weaving.', tag: 'FREE' },
    { icon: '🏆', title: 'Knowledge Olympics', desc: 'Weekly cross-village quiz battles with cowrie prize pools and leaderboards.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '📜', title: 'Certificate NFT', desc: 'Village-verified skill certificates stored in your AfroID. Trusted across the platform.', tag: 'VERIFIED' },
    { icon: '🌍', title: 'African Curriculum', desc: 'Pan-African history, science, mathematics, and culture taught from an African lens.', tag: 'FREE' },
    { icon: '👨‍🏫', title: 'Village Tutor Market', desc: 'Any village member can offer tutoring sessions. Set your rate, earn in cowries.', tag: 'EARNS ₡', cowrieTag: 'earns' },
  ],
  arts: [
    { icon: '🎵', title: 'Spray Wall', desc: 'Live virtual tip jar while you perform. Audience members spray cowries in real-time.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🎬', title: 'Village Cinema', desc: 'Screen your film simultaneously across all 20 villages. Earn per second watched.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🎨', title: 'Art Auction Ring', desc: 'Monthly digital art auctions with AfroID-verified provenance and ownership transfer.', tag: 'MONTHLY' },
    { icon: '🎤', title: 'Freestyle Friday', desc: 'Weekly cross-village rap and spoken-word battle with community voting and prizes.', tag: 'WEEKLY' },
    { icon: '🌍', title: 'Cultural Archive', desc: 'AI-tagged repository of African artistic heritage. Searchable by civilisation and era.', tag: 'HERITAGE' },
    { icon: '🤝', title: 'Collab Finder', desc: 'Match musicians with producers, writers with illustrators, directors with cinematographers.', tag: 'CONNECT' },
  ],
  builders: [
    { icon: '🏗️', title: 'Site Safety AI', desc: 'Real-time construction site safety monitoring with hazard alerts and incident log.', tag: 'AI SAFETY' },
    { icon: '🔧', title: 'Tool Library', desc: 'Borrow construction tools from verified village members by the day. Insured rentals.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '📐', title: 'Blueprint Vault', desc: 'Encrypted storage for architectural drawings with role-based access control.', tag: 'SECURE' },
    { icon: '🌍', title: 'Build Together', desc: 'Pool village resources to fund community infrastructure projects with shared equity.', tag: 'COMMUNITY' },
    { icon: '💧', title: 'Water Hive', desc: 'Collectively map, maintain, and protect village water sources. Alert on contamination.', tag: 'LIVE' },
    { icon: '🏠', title: 'Housing Queue', desc: 'Priority housing allocation system for village members in need, governed transparently.', tag: 'CIVIC' },
  ],
  energy: [
    { icon: '☀️', title: 'Solar Circle', desc: 'Community solar installation with shared electricity billing via cowrie micropayments.', tag: 'SHARED' },
    { icon: '⚡', title: 'Power Hour', desc: 'Buy and sell excess solar energy with neighbours by the kilowatt-hour.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🔋', title: 'Battery Bank', desc: 'Village battery storage pooled for outage resilience. Priority access for elders.', tag: 'COMMUNITY' },
    { icon: '🌿', title: 'Biogas Together', desc: 'Convert communal organic waste into cooking gas shared among participating households.', tag: 'GREEN' },
    { icon: '💡', title: 'Light the Night', desc: 'Crowdfund street lighting for your village area. Track progress live on the community map.', tag: 'CROWDFUND' },
    { icon: '📡', title: 'Grid Watch', desc: 'Real-time electricity availability map with outage predictions and duration estimates.', tag: 'LIVE' },
  ],
  transport: [
    { icon: '🏍️', title: 'Okada Pool', desc: 'Share boda-boda trips with neighbours going the same route. Split cost automatically.', tag: 'SAVES ₡' },
    { icon: '🚌', title: 'Village Shuttle', desc: 'Scheduled inter-village transport with real seat reservations and cowrie ticketing.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '📦', title: 'Caravan Route', desc: 'Group cargo shipments for lower freight rates. Organise and track across villages.', tag: 'SAVES ₡' },
    { icon: '🗺️', title: 'Road Hazard Map', desc: 'Community-reported road conditions, potholes, and hazards updated every 15 minutes.', tag: 'LIVE' },
    { icon: '🚗', title: 'Rent My Ride', desc: 'Peer-to-peer vehicle rental within your trusted village network. Insurance included.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '⛽', title: 'Fuel Collective', desc: 'Pool fuel purchases for bulk station pricing. Save up to 15% per litre as a group.', tag: 'SAVES ₡' },
  ],
  technology: [
    { icon: '💻', title: 'Code Bazaar', desc: 'Sell and buy custom scripts, bots, and tools built specifically for African markets.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🤖', title: 'Village AI Co-Pilot', desc: 'A personal AI tuned to your role and village. Gets smarter as you use your tools.', tag: 'AI' },
    { icon: '📱', title: 'App Store Africa', desc: 'Curated African-built apps with cowrie micropayment licensing. Devs earn per install.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🌐', title: 'Zero-Rating Hub', desc: 'Telecom-partnered data-free access to essential village tools. Work offline-first.', tag: 'FREE DATA' },
    { icon: '🛠️', title: 'Fix-It Friday', desc: 'Weekly tech-support marketplace where village techies solve problems for cowries.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🔐', title: 'Village VPN', desc: 'Community-managed encrypted internet access with digital rights protection.', tag: 'SECURE' },
  ],
  media: [
    { icon: '📻', title: 'Village Radio', desc: 'Live community radio stream from any member, any time. Earn from listener tips.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🎬', title: 'AfroFlix Studio', desc: 'Upload your film. Earn cowries for every second watched across all 20 villages.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🎵', title: 'Stream & Earn', desc: 'Upload music. Earn ₡1 per 30 seconds streamed. Spotify model, African-owned.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '📰', title: "People's Newspaper", desc: 'Community-edited daily newsletter in local languages. Top contributor earns monthly.', tag: 'COMMUNITY' },
    { icon: '🎙️', title: 'Podcast Circle', desc: 'Group podcast recording with automatic multi-village distribution and sponsorship.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🏆', title: 'Griot Award', desc: 'Annual community vote for best content creators. Winners get platform-wide visibility.', tag: 'ANNUAL' },
  ],
  finance: [
    { icon: '🔮', title: 'Prediction Market', desc: 'Stake cowries on village economic outcomes. Winners collect the entire pot.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🤝', title: 'Ajo 3.0', desc: 'Smart-contract savings circles with automatic scheduled payouts and transparency.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '💳', title: 'Village Credit', desc: 'Community-vouched micro-credit with rates 60% lower than traditional banks.', tag: 'COMMUNITY' },
    { icon: '📊', title: 'Wealth Tracker', desc: 'Real-time net worth in cowries, local currency, and USD. Know where you stand.', tag: 'LIVE' },
    { icon: '🌍', title: 'Diaspora Remittance', desc: 'Send value home instantly at 0.5% fee. Western Union charges 5–8%.', tag: 'SAVES ₡' },
    { icon: '🏦', title: 'Village Treasury', desc: 'Community investment fund. Members vote on allocations. Returns shared quarterly.', tag: 'EARNS ₡', cowrieTag: 'earns' },
  ],
  justice: [
    { icon: '⚖️', title: 'Village Mediation', desc: 'Resolve disputes with community-appointed mediators in 48 hours. No lawyers required.', tag: 'FREE' },
    { icon: '📜', title: 'Know Your Rights', desc: 'AI-powered legal information in 40 African languages. Free, private, accurate.', tag: 'AI' },
    { icon: '🤝', title: 'Restorative Circle', desc: 'Gacaca-inspired community reconciliation process. Healing over punishment.', tag: 'HERITAGE' },
    { icon: '🛡️', title: 'Legal Shield', desc: 'Pool resources for collective legal defence. Strength in numbers against injustice.', tag: 'COLLECTIVE' },
    { icon: '📱', title: 'Law Phone', desc: 'Connect to a qualified lawyer for 15 minutes via video call at ₡50.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🗺️', title: 'Court Navigator', desc: 'AI-guided step-by-step support for navigating any court system across Africa.', tag: 'AI' },
  ],
  government: [
    { icon: '🗳️', title: 'Community Poll', desc: 'Non-partisan village-wide votes on local issues. Every AfroID gets one vote.', tag: 'CIVIC' },
    { icon: '📋', title: 'Project Watch', desc: 'Track government projects in your area with photo evidence and progress reports.', tag: 'ACCOUNTABILITY' },
    { icon: '💰', title: 'Budget Tracker', desc: 'Community-sourced tracking of public spending. Know where your taxes go.', tag: 'LIVE' },
    { icon: '🏛️', title: 'Council Seat', desc: 'Earn a village council seat through XP milestones and community vote.', tag: 'GOVERNANCE' },
    { icon: '📄', title: 'Document Registry', desc: 'Store certified copies of all official documents in your AfroID. Verify in seconds.', tag: 'SECURE' },
    { icon: '🌍', title: 'Village Diplomacy', desc: 'Formalise inter-village cooperation agreements. Share resources, knowledge, skills.', tag: 'CONNECT' },
  ],
  security: [
    { icon: '🚨', title: 'Emergency Pulse', desc: 'One tap sends your GPS location + emergency alert to the entire village network.', tag: 'EMERGENCY' },
    { icon: '👁️', title: 'Neighbourhood Watch', desc: 'Verified community security rotation with coverage tracking and incident log.', tag: 'COMMUNITY' },
    { icon: '🔐', title: 'Digital Guard', desc: 'Personal cybersecurity health score with step-by-step hardening checklist.', tag: 'SECURE' },
    { icon: '🗺️', title: 'Safety Map', desc: 'Real-time community safety ratings for village zones, updated by members.', tag: 'LIVE' },
    { icon: '📹', title: 'Evidence Vault', desc: 'Tamper-proof encrypted storage for incident documentation with timestamp seal.', tag: 'LEGAL' },
    { icon: '🤝', title: 'Elder Guard', desc: 'Dedicated verified security network protecting village elders. 24-hour coverage.', tag: 'PRIORITY' },
  ],
  spirituality: [
    { icon: '🌙', title: 'Village Shrine', desc: 'Digital sacred space for daily affirmations and communal prayer across all 20 villages.', tag: 'DAILY' },
    { icon: '🎵', title: 'Praise Circle', desc: 'Live worship sessions any member can join. Host earns cowrie tips from participants.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🌿', title: 'Healing Garden', desc: 'Community herb cultivation map for traditional spiritual and medicinal practices.', tag: 'COMMUNITY' },
    { icon: '📜', title: 'Wisdom Library', desc: 'All 256 Ifá Odù and other African spiritual texts, translated and searchable.', tag: 'HERITAGE' },
    { icon: '🤝', title: 'Covenant Circle', desc: 'Make binding spiritual agreements with community witnesses as signatories.', tag: 'SACRED' },
    { icon: '🙏', title: 'Gratitude Chain', desc: 'Daily gratitude practice that grows into a visible community chain across villages.', tag: 'DAILY' },
  ],
  sports: [
    { icon: '⚽', title: 'Village League', desc: 'Cross-village sports tournaments with cowrie prize pools and real trophies.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🏋️', title: 'Training Log AI', desc: 'AI-powered fitness tracking tuned for African athletes. Adapts to your environment.', tag: 'AI' },
    { icon: '🏆', title: 'Talent Scout Portal', desc: 'Upload your performance video. Get discovered by verified coaches and scouts.', tag: 'CAREER' },
    { icon: '🎮', title: 'Esports Arena', desc: 'Cross-village gaming tournaments with real cowrie prize pools and live spectating.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🏃', title: 'Run with the Village', desc: 'Group fitness challenges with accountability partners across all 20 villages.', tag: 'COMMUNITY' },
    { icon: '📊', title: 'Performance DNA', desc: 'Track your athletic arc from beginner to elite. Export verified stats to scouts.', tag: 'CAREER' },
  ],
  fashion: [
    { icon: '👗', title: 'Style Oracle', desc: 'AI fashion advisor that understands African aesthetics, body types, and traditions.', tag: 'AI' },
    { icon: '🪡', title: 'Fabric Exchange', desc: 'Buy, sell, and trade African fabrics with verified fashion village members.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '👟', title: 'Village Runway', desc: 'Weekly digital fashion show with community voting. Winner gets platform-wide feature.', tag: 'WEEKLY' },
    { icon: '📸', title: 'Lookbook Builder', desc: 'Create a professional lookbook and earn from brand partnerships and licensing.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🧵', title: 'Made-to-Order Circle', desc: 'Pool custom fabric orders for bulk artisan pricing. Minimum 10 pieces.', tag: 'SAVES ₡' },
    { icon: '🌍', title: 'AfroStylist Match', desc: 'Get matched with a personal stylist from the Fashion village for your next event.', tag: 'CONNECT' },
  ],
  family: [
    { icon: '🌳', title: 'Ubuntu Web', desc: 'Map your extended family across all 54 African nations. Connect lost branches.', tag: 'HERITAGE' },
    { icon: '💌', title: 'Elder Voice', desc: 'Record and preserve life stories of family elders in video before they are lost forever.', tag: 'HERITAGE' },
    { icon: '🏠', title: 'Family Bank', desc: 'Shared family savings pool with full transparency and member-voted withdrawals.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🧬', title: 'Heritage DNA', desc: 'Connect your ancestral origins to specific African civilisations and kingdoms.', tag: 'DISCOVERY' },
    { icon: '🎊', title: 'Ceremony Planner', desc: 'Full planning suite for naming ceremonies, weddings, and funerals with vendor matching.', tag: 'CONNECT' },
    { icon: '👶', title: 'Child Registry', desc: 'Register a new child into the village network from birth. AfroID assigned at naming.', tag: 'OFFICIAL' },
  ],
  hospitality: [
    { icon: '🌍', title: 'Guest Circle', desc: 'Host verified travellers from other villages. Earn cowries for every night hosted.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🍽️', title: 'Village Table', desc: 'Communal dining events where hosts earn and guests discover authentic culture.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🎵', title: 'Live Table', desc: 'Dine with live performance — musicians earn sprays, restaurants earn bookings.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '🗺️', title: 'Culture Tour', desc: 'Village members guide visitors to authentic local experiences. Set your own rate.', tag: 'EARNS ₡', cowrieTag: 'earns' },
    { icon: '☕', title: 'Teranga Karma', desc: 'Earn points for exceptional hospitality. Unlock travel perks and village upgrades.', tag: 'LOYALTY' },
    { icon: '🌙', title: 'Night Market Hub', desc: 'Coordinated evening marketplace 6pm–midnight. Host the market, earn a cut of sales.', tag: 'EARNS ₡', cowrieTag: 'earns' },
  ],
  holdings: [
    { icon: '🧭', title: 'Village Compass', desc: 'AI-powered village recommendation based on your skills, personality, and ambitions.', tag: 'AI' },
    { icon: '🌱', title: 'Green Path', desc: '30-day guided onboarding with a dedicated mentor from your recommended village.', tag: 'FREE' },
    { icon: '🤝', title: 'Village Trial', desc: '7-day visitor pass to any village before you commit. Explore without obligation.', tag: 'FREE' },
    { icon: '📊', title: 'Skills DNA Map', desc: 'Map your skills to the optimal village and role combination with precision.', tag: 'AI' },
    { icon: '🎯', title: 'Purpose Finder', desc: 'Deep interview with the Griot AI to discover your true professional village alignment.', tag: 'AI' },
    { icon: '🌍', title: 'Pan-African Navigator', desc: 'See which African nation\'s economy most closely aligns with your professional goals.', tag: 'DISCOVER' },
  ],
}

/* ── palette ── */
const C = {
  earth: '#0a0f08', earthD: '#060d07',
  green: '#1a7c3e', greenL: '#4ade80',
  gold: '#d4a017', goldL: '#fbbf24',
  purple: '#7c3aed', purpleL: '#c084fc',
  red: '#b22222', redL: '#ef4444',
  amber: '#e07b00', blue: '#3b82f6', blueL: '#60a5fa',
  text: '#f0f7f0', textDim: 'rgba(255,255,255,0.4)', textDim2: 'rgba(255,255,255,0.25)',
}

/* ── crest gate: some advanced tools need higher crest level ── */
const CREST_REQUIRED: Record<string, number> = {
  // Finance / commerce advanced tools need II+
  risk_calculator: 2, credit_book: 2, escrow_release: 2, cowrie_exchange: 2,
  buyer_shadow_score: 2, live_auction: 2, settlement_manager: 2,
  // Tech specialist tools need II+
  api_tester: 2, code_project: 2,
  // Executive / governance tools need III+
  grant_tracker: 3, impact_tracker: 3, publication_vault: 3, case_log: 3,
  compliance_checker: 3, campaign_manager: 3,
  // Elite tools need IV+
  value_calculator: 4, territory_map: 4, bulk_order_manager: 4,
}
const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('afk-auth') : null
const parsedAuth = storedAuth ? (() => { try { return JSON.parse(storedAuth) } catch { return null } })() : null
const USER_CREST: number = parsedAuth?.state?.user?.crestLevel ?? parsedAuth?.state?.user?.crest ?? 2

/* ── AI features per village — guardian spirits from canonical Pan-African spec ── */
const VILLAGE_AI: Record<string, { name: string; powers: string[] }> = {
  commerce:    { name: 'Anansi · Akan · Ghana', powers: ['Price prediction alerts', 'Demand surge detector', 'Supplier match AI', 'Fraud pattern scanner'] },
  agriculture: { name: 'Osiris · Ancient Egypt', powers: ['Crop disease image scanner', 'Weather-yield predictor', 'Market price optimizer', 'Soil analysis advisor'] },
  health:      { name: 'Sekhmet · Ancient Egypt', powers: ['Symptom triage assistant', 'Drug interaction checker', 'Patient risk scorer', 'Telemedicine AI translator'] },
  education:   { name: 'Thoth · Ancient Egypt', powers: ['Curriculum AI planner', 'Student progress predictor', 'Exam question generator', 'Learning gap detector'] },
  technology:  { name: 'Thoth · Ancient Egypt', powers: ['Code review assistant', 'Bug prediction AI', 'Security vulnerability scanner', 'Architecture advisor'] },
  finance:     { name: 'Aje · Yoruba · Nigeria', powers: ['Credit scoring AI', 'Fraud detection engine', 'Investment risk analyzer', 'Cash flow predictor'] },
  builders:    { name: 'Dedwen · Nubia · Kush', powers: ['Material cost estimator', 'Safety hazard detector', 'Project timeline optimizer', 'Quality defect scanner'] },
  arts:        { name: 'Oya · Yoruba · Nigeria', powers: ['Style transfer AI', 'Music composition assist', 'Trend prediction engine', 'Audience sentiment analyzer'] },
  media:       { name: 'Kouyaté · Mandinka · Guinea', powers: ['Fake news detector', 'Engagement optimizer', 'Content calendar AI', 'Audience growth predictor'] },
  justice:     { name: 'Imana · Kinyarwanda · Rwanda', powers: ['Case law research AI', 'Contract clause analyzer', 'Dispute resolution advisor', 'Compliance checker AI'] },
  security:    { name: 'Ogun · Pan-African · West Africa', powers: ['Threat pattern analyzer', 'Anomaly detection engine', 'Incident response advisor', 'Risk assessment AI'] },
  government:  { name: 'Negus Negusti · Ge\'ez · Ethiopia', powers: ['Policy impact simulator', 'Budget optimization AI', 'Public sentiment analyzer', 'Resource allocation advisor'] },
  spirituality:{ name: 'Ifa / Orunmila · Pan-African', powers: ['Community mood analyzer', 'Event attendance predictor', 'Donation optimizer', 'Volunteer match AI'] },
  fashion:     { name: 'Osun · Yoruba · Nigeria', powers: ['Trend forecasting AI', 'Color palette generator', 'Body fit recommender', 'Style match engine'] },
  family:      { name: 'Nana Buluku · Fon · Benin Republic', powers: ['Family conflict mediator', 'Heritage document scanner', 'Kinship mapper AI', 'Elder care advisor'] },
  transport:   { name: 'Mami Wata · Pan-African', powers: ['Route optimization AI', 'Fuel consumption predictor', 'Demand surge calculator', 'Maintenance predictor'] },
  energy:      { name: 'Nzambi Mpungu · Kikongo · Congo', powers: ['Load forecasting AI', 'Solar yield optimizer', 'Grid stability analyzer', 'Consumption pattern detector'] },
  hospitality: { name: 'Osun · Yoruba · Nigeria', powers: ['Occupancy predictor', 'Review sentiment analyzer', 'Dynamic pricing AI', 'Guest preference engine'] },
  sports:      { name: 'Sango · Yoruba/Fon · Pan-African', powers: ['Performance analytics AI', 'Injury risk predictor', 'Training plan optimizer', 'Opponent analysis engine'] },
  holdings:    { name: 'Esu / Elegba · Pan-African', powers: ['Village match analyzer', 'Role alignment predictor', 'Migration path optimizer', 'Community fit scorer'] },
}

/* ── single tool card ── */
function ToolCard({
  tool, vc, roleKey, villageId, onLaunch,
}: {
  tool: ToolDefinition; vc: string; roleKey: string; villageId: string; onLaunch: (tool: ToolDefinition, roleKey: string) => void
}) {
  const req = CREST_REQUIRED[tool.key] ?? 1
  const locked = req > USER_CREST
  return (
    <div
      className="vd-tool-card"
      onClick={() => !locked && onLaunch(tool, roleKey)}
      style={{
        padding: 14, borderRadius: 14, textAlign: 'left',
        background: locked ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${locked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
        position: 'relative', overflow: 'hidden',
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.6 : 1,
        transition: 'all .15s',
      }}
    >
      {/* crest lock badge */}
      {locked && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.45)', borderRadius: 14,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4, zIndex: 2,
        }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Crest {req === 4 ? 'IV' : req === 3 ? 'III' : 'II'} Required</span>
          <span style={{ fontSize: 8, color: C.textDim, fontWeight: 600 }}>Level Up to Unlock</span>
        </div>
      )}
      {/* session badge */}
      {tool.opensBusinessSession && !locked && (
        <span style={{
          position: 'absolute', top: 8, right: 8, fontSize: 8, fontWeight: 800,
          padding: '2px 6px', borderRadius: 4, background: `${vc}18`,
          color: vc, border: `1px solid ${vc}30`, textTransform: 'uppercase',
        }}>SESSION</span>
      )}
      <div style={{ fontSize: 22, marginBottom: 7 }}>{tool.icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2, lineHeight: 1.3 }}>{tool.name}</div>
      <div style={{ fontSize: 9.5, color: C.textDim, lineHeight: 1.4, marginBottom: 8 }}>{tool.description}</div>
      {/* cowrie indicator */}
      <div style={{
        fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3,
        color: tool.cowrieFlow === 'earns' ? '#4ade80' : tool.cowrieFlow === 'spends' ? '#fbbf24' : C.textDim2,
      }}>
        <span>{tool.cowrieFlow === 'earns' ? '🐚↑' : tool.cowrieFlow === 'spends' ? '🐚↓' : '🐚='}</span>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {tool.cowrieFlow === 'earns' ? 'EARNS' : tool.cowrieFlow === 'spends' ? 'SPENDS' : 'FREE'}
        </span>
      </div>
      {/* launch button */}
      {!locked && (
        <div style={{
          marginTop: 8, padding: '6px 0', borderRadius: 8, textAlign: 'center',
          background: `${vc}14`, border: `1px solid ${vc}30`,
          fontSize: 10, fontWeight: 700, color: vc,
        }}>🚀 Launch</div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                 */
/* ══════════════════════════════════════════════════════════════ */
export default function VillageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const villageId = (params.villageId as string) || ''
  const village = VILLAGE_BY_ID[villageId]
  const { setActiveVillage, setActiveRole } = useVillageStore()

  const [selectedRole, setSelectedRole] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<'tools' | 'ai' | 'activity' | 'exchange'>('tools')
  const [toast, setToast] = React.useState<string | null>(null)
  const [toolSearch, setToolSearch] = React.useState('')
  const [aiChat, setAiChat] = React.useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [aiInput, setAiInput] = React.useState('')
  const [joined, setJoined] = React.useState(false)
  const [currentVillage, setCurrentVillage] = React.useState<string | null>(null)
  // accordion: track which role sections are collapsed
  const [collapsedRoles, setCollapsedRoles] = React.useState<Set<string>>(new Set())
  const [exchangeVillage, setExchangeVillage] = React.useState<string | null>(null)
  // live API data
  const [apiToolMap, setApiToolMap] = React.useState<Record<string, ApiRoleTool[]>>({})
  const [liveStats, setLiveStats] = React.useState<{ memberCount: number; toolCount: number; activeSessionCount: number } | null>(null)
  const [liveVillage, setLiveVillage] = React.useState<{
    ancientName?: string; meaning?: string; nationFlag?: string
    historicalContext?: string; whyThisName?: string
    guardianDescription?: string; guardianOrigin?: string
    sourceCivilisation?: string; historicalEra?: string
    memberCount?: number
  } | null>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(INJ)) return
    const s = document.createElement('style')
    s.id = INJ; s.textContent = CSS; document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    const j = localStorage.getItem('afk_joined_villages')
    if (j) {
      try {
        const arr: string[] = JSON.parse(j)
        setJoined(arr.includes(villageId))
        // currentVillage = first village in the list (if any)
        setCurrentVillage(arr.length > 0 ? arr[0] : null)
      } catch {}
    }
  }, [villageId])

  // Load tools + stats from village-registry
  React.useEffect(() => {
    if (!villageId) return
    fetch(`/api/v1/villages/${villageId}/tools`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { ok: boolean; data: ApiRoleTool[] } | null) => {
        if (!data?.data) return
        const map: Record<string, ApiRoleTool[]> = {}
        for (const t of data.data) {
          if (!map[t.roleKey]) map[t.roleKey] = []
          map[t.roleKey].push(t)
        }
        setApiToolMap(map)
      })
      .catch(() => {})

    fetch(`/api/v1/villages/${villageId}/stats`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { ok: boolean; data: { memberCount: number; toolCount: number; activeSessionCount: number } } | null) => {
        if (data?.data) setLiveStats(data.data)
      })
      .catch(() => {})

    // Fetch full village cultural data
    fetch(`/api/v1/villages/${villageId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { ok: boolean; data: Record<string, unknown> } | null) => {
        if (data?.data) setLiveVillage(data.data as any)
      })
      .catch(() => {})
  }, [villageId])

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  if (!village) {
    return (
      <div style={{ minHeight: '100vh', background: C.earthD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 48 }}>🏘</span>
        <p style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>Village not found</p>
        <button onClick={() => router.push('/dashboard/villages')} style={{ padding: '10px 24px', borderRadius: 10, background: C.green, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Back to Villages</button>
      </div>
    )
  }

  const ai = VILLAGE_AI[villageId] || { name: 'Village Oracle', powers: [] }
  /* ── Roles: ROLE_REGISTRY is primary (50 per village, works offline + on Vercel)
        API tools enrich when backend is reachable ── */
  const roles = (ROLE_REGISTRY[villageId] || village.roles || []) as Array<{ key: string; name: string; desc: string; tools?: string[] }>
  const hasApiTools = Object.keys(apiToolMap).length > 0

  /* ── Build tool list per role: API data first, static TOOL_REGISTRY fallback ── */
  const allRoleTools = React.useMemo(() => {
    return roles.map(role => {
      // API path (when backend is reachable)
      const apiEntries = apiToolMap[role.key] || []
      if (apiEntries.length > 0) {
        const tools: ToolDefinition[] = apiEntries.map(at => {
          const base = TOOL_REGISTRY[at.toolKey]
          if (base) return { ...base, cowrieFlow: at.earnsCowrie ? 'earns' : 'neutral', opensBusinessSession: at.opensSession } as ToolDefinition
          return { key: at.toolKey, name: at.toolName, icon: '🛠', description: `${at.toolName} tool`, category: 'professional' as const, opensBusinessSession: at.opensSession, cowrieFlow: at.earnsCowrie ? 'earns' : 'neutral' } as ToolDefinition
        })
        return { role, tools }
      }
      // Static fallback: use tools from ROLE_REGISTRY, enriched with village defaults
      const staticToolKeys: string[] = (role as any).tools ?? []
      const tools: ToolDefinition[] = enrichRoleTools(villageId, staticToolKeys)
      return { role, tools }
    })
  }, [roles, apiToolMap])

  const totalToolCount = React.useMemo(() => {
    if (liveStats) return liveStats.toolCount
    const s = new Set<string>()
    Object.values(apiToolMap).forEach((arr) => arr.forEach(t => s.add(t.toolKey)))
    return s.size
  }, [apiToolMap, liveStats])

  const stats = {
    members: liveStats?.memberCount ?? liveVillage?.memberCount ?? 0,
    sessions: liveStats?.activeSessionCount ?? 0,
    cowrie: '₡0',
  }

  /* ── flat search across all roles ── */
  const searchResults = React.useMemo(() => {
    if (!toolSearch.trim()) return []
    const q = toolSearch.toLowerCase()
    return allRoleTools.flatMap(({ role, tools }) =>
      tools
        .filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
        .map(t => ({ tool: t, roleKey: role.key, roleName: role.name }))
    )
  }, [toolSearch, allRoleTools])

  const handleJoin = () => {
    const j = localStorage.getItem('afk_joined_villages')
    let arr: string[] = []
    try { arr = j ? JSON.parse(j) : [] } catch {}

    // Already in this village — just show the member note
    if (joined) return

    // User is already in a different village → route to transfer page
    if (currentVillage && currentVillage !== villageId) {
      router.push(`/dashboard/villages/transfer?from=${currentVillage}&to=${villageId}`)
      return
    }

    // First join — no existing village, immediate join
    arr.push(villageId)
    localStorage.setItem('afk_joined_villages', JSON.stringify(arr))
    setJoined(true)
    setCurrentVillage(villageId)
    setActiveVillage(villageId, village.category)
    flash(`Joined ${village.name}!`)

    // Persist to village-registry (fire-and-forget)
    const stored = typeof window !== 'undefined' ? localStorage.getItem('afk-auth') : null
    const parsed = stored ? (() => { try { return JSON.parse(stored) } catch { return null } })() : null
    const token = parsed?.state?.accessToken ?? parsed?.state?.token ?? ''
    if (token) {
      fetch('/api/v1/village-memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ villageId, roleKey: 'citizen', isPrimary: true }),
      }).catch(() => {})
    }
  }

  const handleApplyTransfer = () => {
    router.push(`/dashboard/villages/transfer?from=${currentVillage}&to=${villageId}`)
  }

  const handleSelectRole = (roleKey: string) => {
    setSelectedRole(prev => prev === roleKey ? null : roleKey)
    setActiveRole(roleKey)
    // Scroll to that role section
    const el = document.getElementById(`role-section-${roleKey}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    flash(`📍 ${roles.find(r => r.key === roleKey)?.name || roleKey}`)
  }

  /* ── route to the tool shell ── */
  const handleLaunchTool = (tool: ToolDefinition, roleKey: string) => {
    const p = new URLSearchParams({ village: villageId, role: roleKey })
    // Fire-and-forget: start a tool session in the background if tool opens sessions
    if (tool.opensBusinessSession) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('afk-auth') : null
      const parsed = stored ? JSON.parse(stored) : null
      const token = parsed?.state?.token ?? ''
      const userAfroId = parsed?.state?.user?.afroId ?? ''
      fetch('/api/v1/tool-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          userAfroId,
          villageId, roleKey, toolKey: tool.key,
        }),
      }).catch(() => {})
    }
    router.push(`/dashboard/tools/${tool.key}?${p.toString()}`)
  }

  const toggleRoleCollapse = (roleKey: string) => {
    setCollapsedRoles(prev => {
      const next = new Set(prev)
      if (next.has(roleKey)) { next.delete(roleKey) } else { next.add(roleKey) }
      return next
    })
  }

  const handleAiSend = () => {
    if (!aiInput.trim()) return
    const q = aiInput.trim()
    setAiChat(prev => [...prev, { role: 'user', text: q }])
    setAiInput('')
    setTimeout(() => {
      const responses: Record<string, string> = {
        price: `Based on current market data in the ${village.name}, the average price trend is showing a 12% increase this quarter. The AI recommends reviewing your pricing strategy.`,
        help: `I am ${ai.name}, the AI spirit of ${village.name}. I can help with: ${ai.powers.join(', ')}. Ask me anything about your work!`,
        weather: `The forecast for your region shows favorable conditions. ${villageId === 'agriculture' ? 'Planting window optimal for next 14 days.' : 'Clear skies ahead.'}`,
        demand: `Demand analysis shows peak activity between 10am-2pm in your village. Consider scheduling sessions during these hours for maximum engagement.`,
      }
      const key = Object.keys(responses).find(k => q.toLowerCase().includes(k))
      const reply = key ? responses[key] : `${ai.name} has analyzed your question. Based on village intelligence across ${stats.members.toLocaleString()} members and ${stats.sessions.toLocaleString()} sessions: I recommend consulting the relevant tool from your toolkit. Your village has unique strengths in this area. Ask me something more specific!`
      setAiChat(prev => [...prev, { role: 'ai', text: reply }])
    }, 800 + Math.random() * 700)
  }

  const vc = village.color

  return (
    <div className="vd-no-sb" style={{
      minHeight: '100vh', background: C.earthD, color: C.text,
      fontFamily: 'DM Sans, Inter, sans-serif', maxWidth: 480, margin: '0 auto',
      borderLeft: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* ═══ HERO ═══ */}
      <div className="vd-fade" style={{
        position: 'relative', padding: '20px 18px 24px', overflow: 'hidden',
      }}>
        {/* SVG flag background — civilisation visual identity */}
        <VillageFlagBg id={villageId} color={vc} style={{ height: 160 }} />
        {/* dark gradient overlay so text stays readable */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.earthD}99 0%, ${C.earthD} 72%)`, pointerEvents: 'none' }} />
        {/* Adinkra Gye Nyame — sovereign pattern overlay at low opacity */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='${encodeURIComponent(vc)}' fill='none' stroke-linecap='round'%3E%3Cpath d='M40 6 L74 40 L40 74 L6 40 Z' stroke-width='1'/%3E%3Cpath d='M40 18 L62 40 L40 62 L18 40 Z' stroke-width='0.7'/%3E%3Cellipse cx='40' cy='40' rx='6' ry='9' stroke-width='0.8'/%3E%3Cellipse cx='40' cy='40' rx='6' ry='9' stroke-width='0.8' transform='rotate(90 40 40)'/%3E%3Ccircle cx='40' cy='40' r='2.5' fill='${encodeURIComponent(vc)}' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px', backgroundRepeat: 'repeat',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 120, opacity: 0.04 }}>{village.emoji}</div>
        <button onClick={() => router.push('/dashboard/villages')} style={{
          width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, cursor: 'pointer', color: C.text, marginBottom: 14,
        }}>←</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="vd-glow" style={{
            '--vc': `${vc}60`, width: 64, height: 64, borderRadius: 20,
            background: `${vc}18`, border: `2px solid ${vc}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          } as React.CSSProperties}>{village.emoji}</div>
          <div style={{ flex: 1 }}>
            {/* Ancient name — most prominent */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <h1 style={{ fontFamily: '"Cinzel","Palatino",serif', fontSize: 22, fontWeight: 900, margin: 0, color: vc, letterSpacing: '0.06em', textShadow: `0 0 20px ${vc}60` }}>{village.ancientName}</h1>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{village.nation}</span>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.55)', margin: 0 }}>{village.nationFull}</div>
            <div style={{ fontSize: 9.5, color: vc, fontWeight: 600, margin: '2px 0 0', opacity: 0.8 }}>{village.language}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: `${vc}18`, color: vc, border: `1px solid ${vc}30`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{village.era}</span>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: C.textDim, border: '1px solid rgba(255,255,255,0.08)', textTransform: 'uppercase' }}>{village.category}</span>
            </div>
          </div>
        </div>

        {/* Ancient name meaning */}
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: `${vc}0d`, border: `1px solid ${vc}20` }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: vc, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>📜 Ancient Origin</div>
          <p style={{ fontSize: 11, color: C.textDim, fontWeight: 500, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{village.meaning}</p>
        </div>

        <p style={{ fontSize: 12, color: C.textDim, fontWeight: 500, marginTop: 10, lineHeight: 1.6, fontStyle: 'italic' }}>{village.tagline}</p>

        {/* stats */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[
            { label: 'Members', value: stats.members.toLocaleString(), icon: '👥' },
            { label: 'Sessions', value: stats.sessions.toLocaleString(), icon: '🔥' },
            { label: 'Cowrie Flow', value: stats.cowrie, icon: '🐚' },
            { label: 'Tools', value: String(totalToolCount), icon: '🛠' },
          ].map((s, i) => (
            <div key={i} className="vd-fade" style={{
              flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              animationDelay: `${i * 0.08}s`,
            }}>
              <div style={{ fontSize: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: vc, fontFamily: 'Sora, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Source Civilisation badge */}
        {liveVillage?.sourceCivilisation && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: `${vc}08`, border: `1px solid ${vc}18`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{liveVillage.nationFlag || village.nation?.slice(0,4)}</span>
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: vc, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{liveVillage.historicalEra}</div>
              <div style={{ fontSize: 10, color: C.textDim, fontWeight: 500, marginTop: 1 }}>{liveVillage.sourceCivilisation}</div>
            </div>
          </div>
        )}

        {/* History */}
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🏛️ History</div>
          <p style={{ fontSize: 10.5, color: C.textDim, fontWeight: 500, margin: 0, lineHeight: 1.65 }}>
            {liveVillage?.historicalContext || village.history}
          </p>
        </div>

        {/* Why This Name */}
        {liveVillage?.whyThisName && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: `${vc}08`, border: `1px solid ${vc}20` }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: vc, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🌍 Why This Name?</div>
            <p style={{ fontSize: 10.5, color: C.textDim, fontWeight: 500, margin: 0, lineHeight: 1.65 }}>{liveVillage.whyThisName}</p>
          </div>
        )}

        {/* Guardian */}
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            ⚡ Guardian Spirit · {village.guardian}
            {liveVillage?.guardianOrigin && <span style={{ color: C.textDim2, fontWeight: 500 }}> · {liveVillage.guardianOrigin}</span>}
          </div>
          <p style={{ fontSize: 10.5, color: C.textDim, fontWeight: 500, margin: 0, lineHeight: 1.65 }}>
            {liveVillage?.guardianDescription || village.guardianDesc}
          </p>
        </div>

        {/* ── Village Join / Transfer Button ── */}
        {joined ? (
          <div style={{ marginTop: 16 }}>
            <div style={{
              width: '100%', padding: '12px 14px', borderRadius: 12, boxSizing: 'border-box',
              background: `${vc}12`, border: `1.5px solid ${vc}40`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: vc, fontFamily: '"Cinzel","Palatino",serif' }}>
                  You are a member of this village.
                </div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 2, lineHeight: 1.4 }}>
                  Village transfers require elder approval.
                </div>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard/villages/applications')} style={{
              width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box',
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)',
              color: C.textDim, fontWeight: 700, fontSize: 11, cursor: 'pointer',
              fontFamily: 'DM Sans, Inter, sans-serif',
            }}>📋 View My Transfer Applications</button>
          </div>
        ) : currentVillage && currentVillage !== villageId ? (
          <div style={{ marginTop: 16 }}>
            <button onClick={handleApplyTransfer} style={{
              width: '100%', padding: '12px 14px', borderRadius: 12, boxSizing: 'border-box',
              background: `${vc}18`, border: `1.5px solid ${vc}50`,
              color: vc, fontWeight: 800, fontSize: 13, cursor: 'pointer',
              fontFamily: '"Cinzel","Palatino",serif',
            }}>📋 Apply to Join {village.name}</button>
            <div style={{
              marginTop: 8, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.2)',
              fontSize: 10, color: '#d4a017', fontWeight: 600, lineHeight: 1.5, textAlign: 'center',
            }}>
              Changing villages requires a 90–180 day review process.{' '}
              <span
                onClick={handleApplyTransfer}
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                Start your application →
              </span>
            </div>
          </div>
        ) : (
          <button onClick={handleJoin} style={{
            width: '100%', marginTop: 16, padding: 12, borderRadius: 12, boxSizing: 'border-box',
            background: vc, border: `1px solid ${vc}`,
            color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            fontFamily: '"Cinzel","Palatino",serif',
          }}>🔥 Join {village.name}</button>
        )}
        </div>{/* end zIndex wrapper */}
      </div>

      {/* ── Kente Divider — Pan-African strip between hero and content ── */}
      <div aria-hidden="true" style={{
        height: 4, flexShrink: 0,
        background: `linear-gradient(90deg, ${vc} 0%, ${vc} 25%, #d4a017 25%, #d4a017 50%, #b22222 50%, #b22222 75%, #1a1a1a 75%, #1a1a1a 100%)`,
      }} />

      {/* ═══ ROLE CHIP STRIP ═══ */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🧑‍💼 Roles
          </span>
          <span style={{ fontSize: 9, color: C.textDim2, fontWeight: 600 }}>· tap to jump</span>
        </div>
        <div className="vd-no-sb" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 8 }}>
          {roles.map((role, i) => (
            <button key={role.key} onClick={() => handleSelectRole(role.key)} className="vd-fade" style={{
              animationDelay: `${i * 0.04}s`,
              padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
              background: selectedRole === role.key ? `${vc}22` : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${selectedRole === role.key ? vc : 'rgba(255,255,255,0.06)'}`,
              color: selectedRole === role.key ? vc : C.text,
              whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{role.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
        margin: '10px 18px 0', position: 'sticky', top: 0, zIndex: 10,
        background: C.earthD,
      }}>
        {([
          { key: 'tools' as const,    label: `🛠 Tools (${totalToolCount})` },
          { key: 'ai'   as const,    label: `🧠 ${ai.name.split('(')[0].trim()}` },
          { key: 'activity' as const, label: '📊 Activity' },
          { key: 'exchange' as const, label: '🌍 Exchange' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '12px 0', cursor: 'pointer', background: 'none', border: 'none',
            borderBottom: tab === t.key ? `2px solid ${vc}` : '2px solid transparent',
            fontSize: 11, fontWeight: 700, color: tab === t.key ? vc : C.textDim,
            fontFamily: 'Sora, sans-serif', transition: 'all .15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <div style={{ padding: '16px 18px 100px' }}>

        {/* ── TOOLS TAB ── */}
        {tab === 'tools' && (
          <div className="vd-fade">
            {/* ── global search bar ── */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input
                value={toolSearch}
                onChange={e => setToolSearch(e.target.value)}
                placeholder={`Search all ${totalToolCount} tools…`}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  color: C.text, fontSize: 13, outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.textDim2 }}>🔍</span>
              {toolSearch && (
                <button onClick={() => setToolSearch('')} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 14,
                }}>✕</button>
              )}
            </div>

            {/* ── search results mode ── */}
            {toolSearch && (
              <>
                {searchResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                    <p style={{ color: C.textDim, fontSize: 13 }}>No tools matching &ldquo;{toolSearch}&rdquo;</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {searchResults.map(({ tool, roleKey, roleName }, i) => (
                        <div key={`${tool.key}-${roleKey}-${i}`} style={{ position: 'relative' }}>
                          {/* role badge */}
                          <div style={{
                            position: 'absolute', top: -6, left: 10, zIndex: 3,
                            fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                            background: vc, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em',
                          }}>{roleName}</div>
                          <div style={{ paddingTop: 8 }}>
                            <ToolCard tool={tool} vc={vc} roleKey={roleKey} villageId={villageId} onLaunch={handleLaunchTool} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── accordion mode (no search) ── */}
            {!toolSearch && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {allRoleTools.map(({ role, tools }, ri) => {
                  const isCollapsed = collapsedRoles.has(role.key)
                  const isHighlighted = selectedRole === role.key
                  const lockedCount = tools.filter(t => (CREST_REQUIRED[t.key] ?? 1) > USER_CREST).length
                  return (
                    <div
                      key={role.key}
                      id={`role-section-${role.key}`}
                      className="vd-role-section"
                      style={{
                        borderRadius: 16,
                        border: `1.5px solid ${isHighlighted ? vc + '50' : 'rgba(255,255,255,0.06)'}`,
                        background: isHighlighted ? `${vc}08` : 'rgba(255,255,255,0.015)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* role header */}
                      <button
                        onClick={() => toggleRoleCollapse(role.key)}
                        style={{
                          width: '100%', padding: '13px 14px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10,
                          borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: `${vc}18`, border: `1px solid ${vc}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 800, color: vc,
                        }}>
                          {['🧑‍💼', '🏗', '📊', '🔧', '🌾', '💊', '🎓', '🔐'][ri % 8]}
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{role.name}</div>
                          <div style={{ fontSize: 10, color: C.textDim, fontWeight: 500, marginTop: 1 }}>
                            {tools.length} tools
                            {lockedCount > 0 && <span style={{ color: C.gold, marginLeft: 6 }}>· {lockedCount} locked</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: C.textDim2, fontWeight: 700 }}>
                          {isCollapsed ? '▸ Show' : '▾ Hide'}
                        </div>
                      </button>

                      {/* role description */}
                      {!isCollapsed && (
                        <div style={{ padding: '8px 14px 4px' }}>
                          <p style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                            {role.desc}
                          </p>
                        </div>
                      )}

                      {/* tool grid */}
                      {!isCollapsed && (
                        <div style={{ padding: '10px 12px 14px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 9 }}>
                          {tools.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px 10px', color: C.textDim2, fontSize: 12 }}>
                              Tools coming soon for this role
                            </div>
                          )}
                          {tools.map((tool, ti) => (
                            <div key={tool.key} className="vd-fade" style={{ animationDelay: `${ti * 0.03}s` }}>
                              <ToolCard
                                tool={tool}
                                vc={vc}
                                roleKey={role.key}
                                villageId={villageId}
                                onLaunch={handleLaunchTool}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* crest legend */}
                <div style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(212,160,23,0.05)', border: '1px solid rgba(212,160,23,0.15)',
                }}>
                  <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, margin: '0 0 6px' }}>🔒 Crest Locking</p>
                  <p style={{ fontSize: 9.5, color: C.textDim, lineHeight: 1.5, margin: 0 }}>
                    Some advanced tools require <strong style={{ color: C.text }}>Crest II, III or IV</strong>. Keep earning Cowrie, completing sessions, and rising in your village to unlock them. Your current level: <strong style={{ color: C.goldL }}>Crest {USER_CREST === 1 ? 'I' : USER_CREST === 2 ? 'II' : USER_CREST === 3 ? 'III' : 'IV'}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI TAB ── */}
        {tab === 'ai' && (
          <div className="vd-fade">
            {/* AI hero */}
            <div style={{
              padding: 18, borderRadius: 16, marginBottom: 16,
              background: `linear-gradient(135deg, ${vc}12, rgba(255,255,255,0.02))`,
              border: `1px solid ${vc}25`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="vd-pulse" style={{
                  width: 48, height: 48, borderRadius: '50%', background: `${vc}20`,
                  border: `2px solid ${vc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>🧠</div>
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 14, color: C.text, margin: 0 }}>{ai.name}</h3>
                  <p style={{ fontSize: 10, color: vc, fontWeight: 600, margin: 0 }}>Village AI Spirit · Always Active</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ai.powers.map((p, i) => (
                  <span key={i} className="vd-fade" style={{
                    animationDelay: `${i * 0.08}s`,
                    fontSize: 10, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
                    background: `${vc}10`, border: `1px solid ${vc}20`, color: vc,
                  }}>⚡ {p}</span>
                ))}
              </div>
            </div>

            {/* AI chat */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  💬 Ask {ai.name.split('(')[0].trim()}
                </span>
              </div>

              <div style={{ maxHeight: 300, overflowY: 'auto', padding: 14 }} className="vd-no-sb">
                {aiChat.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                    <p style={{ fontSize: 12, color: C.textDim }}>Ask me about prices, demand, trends, or anything about {village.name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 10 }}>
                      {['What are the prices?', 'Help me understand', 'Show demand trends'].map((q, i) => (
                        <button key={i} onClick={() => { setAiInput(q); setTimeout(() => { setAiChat(prev => [...prev, { role: 'user', text: q }]); setTimeout(() => { const responses: Record<string, string> = { price: `Based on current market data in the ${village.name}, the average price trend is showing a 12% increase this quarter. The AI recommends reviewing your pricing strategy.`, help: `I am ${ai.name}, the AI spirit of ${village.name}. I can help with: ${ai.powers.join(', ')}. Ask me anything about your work!`, demand: `Demand analysis shows peak activity between 10am-2pm in your village. Consider scheduling sessions during these hours for maximum engagement.` }; const key = Object.keys(responses).find(k => q.toLowerCase().includes(k)); const reply = key ? responses[key] : `${ai.name} has analyzed your question. Based on village intelligence: I recommend consulting the relevant tool from your toolkit.`; setAiChat(prev2 => [...prev2, { role: 'ai', text: reply }]); setAiInput('') }, 800 + Math.random() * 700) }, 50) }} style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                          background: `${vc}10`, border: `1px solid ${vc}20`, color: vc, cursor: 'pointer',
                        }}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {aiChat.map((msg, i) => (
                  <div key={i} className="vd-slide" style={{
                    animationDelay: `${i * 0.05}s`,
                    display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 8,
                  }}>
                    <div style={{
                      maxWidth: '85%', padding: '10px 14px', borderRadius: 14,
                      borderTopLeftRadius: msg.role === 'user' ? 14 : 4,
                      borderTopRightRadius: msg.role === 'user' ? 4 : 14,
                      background: msg.role === 'user' ? vc : 'rgba(255,255,255,0.04)',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {msg.role === 'ai' && <p style={{ fontSize: 9, fontWeight: 800, color: vc, margin: '0 0 4px', textTransform: 'uppercase' }}>🧠 {ai.name.split('(')[0].trim()}</p>}
                      <p style={{ fontSize: 13, color: msg.role === 'user' ? '#fff' : C.text, margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAiSend() }}
                  placeholder={`Ask ${ai.name.split('(')[0].trim()}…`}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    color: C.text, fontSize: 13, outline: 'none',
                  }}
                />
                <button onClick={handleAiSend} style={{
                  padding: '10px 16px', borderRadius: 10, background: vc,
                  border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>🏹</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ── */}
        {tab === 'activity' && (
          <div className="vd-fade">
            {/* live ticker */}
            <div style={{ marginBottom: 16 }}>
              <div className="vd-shimmer" style={{
                padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
                background: `${vc}08`, border: `1px solid ${vc}15`,
              }}>
                <div className="vd-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>
                  {stats.members > 1000 ? Math.floor(stats.members * 0.12) : 24} members active right now
                </span>
              </div>
            </div>

            {/* recent sessions */}
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Recent Sessions</h4>
            {[
              { user: 'Chioma A.', tool: 'Quick Invoice', amount: '₡12,500', time: '2m ago', status: 'COMPLETED' },
              { user: 'Kofi B.', tool: 'Price Checker', amount: '—', time: '5m ago', status: 'ACTIVE' },
              { user: 'Fatima O.', tool: 'Runner Dispatch', amount: '₡8,200', time: '12m ago', status: 'IN TRANSIT' },
              { user: 'Kwame M.', tool: 'Ajo Circle', amount: '₡50,000', time: '18m ago', status: 'LOCKED' },
              { user: 'Amaka N.', tool: 'Inventory Tracker', amount: '—', time: '25m ago', status: 'ACTIVE' },
              { user: 'Bello D.', tool: 'Social Shop', amount: '₡3,400', time: '31m ago', status: 'COMPLETED' },
            ].map((s, i) => (
              <div key={i} className="vd-fade" style={{
                animationDelay: `${i * 0.06}s`,
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)', marginBottom: 6,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: `${vc}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: vc,
                }}>{s.user[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{s.user} — {s.tool}</div>
                  <div style={{ fontSize: 10, color: C.textDim, fontWeight: 500, marginTop: 1 }}>{s.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {s.amount !== '—' && <div style={{ fontSize: 12, fontWeight: 800, color: C.goldL }}>{s.amount}</div>}
                  <span style={{
                    fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                    background: s.status === 'COMPLETED' ? 'rgba(74,222,128,0.1)' : s.status === 'IN TRANSIT' ? 'rgba(59,130,246,0.1)' : s.status === 'LOCKED' ? 'rgba(212,160,23,0.1)' : 'rgba(255,255,255,0.05)',
                    color: s.status === 'COMPLETED' ? '#4ade80' : s.status === 'IN TRANSIT' ? '#60a5fa' : s.status === 'LOCKED' ? '#fbbf24' : C.textDim,
                    border: `1px solid ${s.status === 'COMPLETED' ? 'rgba(74,222,128,0.2)' : s.status === 'IN TRANSIT' ? 'rgba(59,130,246,0.2)' : s.status === 'LOCKED' ? 'rgba(212,160,23,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    textTransform: 'uppercase', letterSpacing: '0.03em',
                  }}>{s.status}</span>
                </div>
              </div>
            ))}

            {/* leaderboard */}
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 10px' }}>Top Earners This Week</h4>
            {[
              { rank: 1, name: 'Chioma Adeyemi', cowrie: '₡245,000', crest: 'IV', medal: '🥇' },
              { rank: 2, name: 'Kofi Brong', cowrie: '₡189,000', crest: 'III', medal: '🥈' },
              { rank: 3, name: 'Fatima Okonkwo', cowrie: '₡156,000', crest: 'III', medal: '🥉' },
              { rank: 4, name: 'Kwame Mensah', cowrie: '₡98,000', crest: 'II', medal: '' },
              { rank: 5, name: 'Amaka Nwosu', cowrie: '₡87,000', crest: 'II', medal: '' },
            ].map((l, i) => (
              <div key={i} className="vd-fade" style={{
                animationDelay: `${i * 0.06}s`,
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 12, background: i === 0 ? `${vc}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? `${vc}20` : 'rgba(255,255,255,0.04)'}`,
                marginBottom: 5,
              }}>
                <span style={{ fontSize: 14, width: 24, textAlign: 'center', fontWeight: 800, color: i < 3 ? vc : C.textDim }}>{l.medal || l.rank}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{l.name}</div>
                  <div style={{ fontSize: 9, color: C.textDim, fontWeight: 600 }}>Crest Level {l.crest}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 900, color: C.goldL, fontFamily: 'Sora, sans-serif' }}>{l.cowrie}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── EXCHANGE TAB ── */}
        {tab === 'exchange' && (
          <div className="vd-fade">
            {/* Header with Kente stripe */}
            <div style={{ marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              {/* Mini Kente stripe — green/gold/red */}
              <div style={{ height: 3, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 33%,#d4a017 33%,#d4a017 66%,#b22222 66%,#b22222 100%)', marginBottom: 10, borderRadius: 2 }} />
              <h2 className="vd-ndebele-header" style={{ borderLeftColor: vc, fontFamily: '"Cinzel","Palatino",serif', fontSize: 17, fontWeight: 900, color: C.text, margin: '0 0 6px', letterSpacing: '0.04em' }}>
                🌍 Village Exchange — Tools from Other Villages
              </h2>
              <p style={{ fontSize: 11, color: C.textDim, margin: 0, lineHeight: 1.5, paddingLeft: 16 }}>
                Your AfroID works everywhere. Access tools from any of the 20 villages.
              </p>
            </div>

            {/* Featured cross-village tools */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                ⚡ Quick Access
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {FEATURED_CROSS_VILLAGE_TOOLS.map((ft, i) => {
                  const villageMeta = ALL_VILLAGE_META.find(v => v.id === ft.villageId)
                  return (
                    <div key={ft.toolKey} className="vd-fade" style={{
                      animationDelay: `${i * 0.05}s`,
                      padding: 14, borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{ft.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 3 }}>{ft.name}</div>
                      <div style={{ fontSize: 9.5, color: C.textDim, lineHeight: 1.4, marginBottom: 8 }}>{ft.desc}</div>
                      {/* village badge */}
                      {villageMeta && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 9, fontWeight: 700,
                          padding: '3px 8px', borderRadius: 6, marginBottom: 8,
                          background: `${villageMeta.color}18`,
                          border: `1px solid ${villageMeta.color}35`,
                          color: villageMeta.color,
                        }}>
                          {villageMeta.emoji} {villageMeta.name}
                        </div>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/tools/${ft.toolKey}?village=${ft.villageId}&role=${ft.roleKey}`)}
                        style={{
                          display: 'block', width: '100%',
                          padding: '6px 0', borderRadius: 8, textAlign: 'center',
                          background: villageMeta ? `${villageMeta.color}18` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${villageMeta ? `${villageMeta.color}35` : 'rgba(255,255,255,0.08)'}`,
                          fontSize: 10, fontWeight: 700,
                          color: villageMeta ? villageMeta.color : C.text,
                          cursor: 'pointer',
                        }}
                      >🚀 Access</button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Village browse row */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                🏘 Browse Villages
              </div>
              <div className="vd-no-sb" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 8 }}>
                {ALL_VILLAGE_META.map(v => {
                  const isSelected = exchangeVillage === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => setExchangeVillage(isSelected ? null : v.id)}
                      style={{
                        flexShrink: 0, padding: '6px 12px', borderRadius: 99,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: isSelected ? `${v.color}33` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isSelected ? v.color : 'rgba(255,255,255,0.06)'}`,
                        color: isSelected ? v.color : C.text,
                        transition: 'all .15s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v.emoji} {v.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected village tools */}
            {exchangeVillage && (() => {
              const selectedMeta = ALL_VILLAGE_META.find(v => v.id === exchangeVillage)
              const villageRoles = VILLAGE_TOOL_MAP[exchangeVillage] ?? {}
              const firstRoleKey = Object.keys(villageRoles)[0]
              const firstRoleTools = firstRoleKey ? (villageRoles[firstRoleKey] ?? []) : []
              if (!selectedMeta || firstRoleTools.length === 0) return null
              return (
                <div className="vd-fade">
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, color: selectedMeta.color }}>
                    {selectedMeta.emoji} {selectedMeta.name} — Tools
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 9 }}>
                    {firstRoleTools.map((toolKey, i) => {
                      const toolDef = TOOL_REGISTRY[toolKey]
                      const displayName = toolDef?.name ?? toolKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                      const displayIcon = toolDef?.icon ?? '🛠'
                      return (
                        <div key={toolKey} className="vd-fade" style={{
                          animationDelay: `${i * 0.04}s`,
                          padding: 12, borderRadius: 12,
                          background: 'rgba(255,255,255,0.025)',
                          border: `1px solid rgba(255,255,255,0.07)`,
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 5 }}>{displayIcon}</div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.text, marginBottom: 7, lineHeight: 1.3 }}>{displayName}</div>
                          <button
                            onClick={() => router.push(`/dashboard/tools/${toolKey}?village=${exchangeVillage}&role=${firstRoleKey}`)}
                            style={{
                              display: 'block', width: '100%',
                              padding: '5px 0', borderRadius: 7, textAlign: 'center',
                              background: `${selectedMeta.color}18`,
                              border: `1px solid ${selectedMeta.color}35`,
                              fontSize: 9.5, fontWeight: 700, color: selectedMeta.color,
                              cursor: 'pointer',
                            }}
                          >Access</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* ═══ VILLAGE INNOVATIONS ═══ */}
      {(() => {
        const innovations = VILLAGE_INNOVATIONS[villageId] ?? []
        if (!innovations.length) return null
        return (
          <div style={{ padding: '20px 18px 0' }}>
            {/* Bogolan (Malian mudcloth) divider — earthy crosshatch */}
            <div className="vd-bogolan-divider" style={{ marginBottom: 14 }} />
            <div className="vd-ndebele-header" style={{ borderLeftColor: vc, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 800, color: C.text }}>Village Innovations</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 4 }}>· Unique to {village.ancientName}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {innovations.map((inn, i) => (
                <div
                  key={i}
                  className="vd-tool-card"
                  onClick={() => flash(`${inn.title} — coming soon in your village workspace`)}
                  style={{
                    padding: 14, borderRadius: 14, cursor: 'pointer',
                    background: `${vc}08`,
                    border: `1px solid ${vc}20`,
                    position: 'relative', overflow: 'hidden',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                      background: inn.cowrieTag === 'earns' ? 'rgba(74,222,128,.12)' : `${vc}12`,
                      color: inn.cowrieTag === 'earns' ? '#4ade80' : vc,
                      border: `1px solid ${inn.cowrieTag === 'earns' ? 'rgba(74,222,128,.25)' : `${vc}25`}`,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>{inn.tag}</span>
                  </div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{inn.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 4, lineHeight: 1.3, paddingRight: 8 }}>{inn.title}</div>
                  <div style={{ fontSize: 9.5, color: C.textDim, lineHeight: 1.5 }}>{inn.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className="vd-pop" style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 14, zIndex: 999,
          background: `${vc}ee`, border: `1px solid ${vc}`,
          color: '#fff', fontSize: 13, fontWeight: 700,
          fontFamily: 'Sora, sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}
    </div>
  )
}
