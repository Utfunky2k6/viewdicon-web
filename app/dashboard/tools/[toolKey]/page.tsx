'use client'
import * as React from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { TOOL_REGISTRY } from '@/constants/tools'
import dynamic from 'next/dynamic'

// ── Existing tool microapps ───────────────────────────────────────────────────
const QuickInvoice        = dynamic(() => import('@/components/tools/QuickInvoice'))
const PriceChecker        = dynamic(() => import('@/components/tools/PriceChecker'))
const DailyTargetTracker  = dynamic(() => import('@/components/tools/DailyTargetTracker'))
const InventoryTracker    = dynamic(() => import('@/components/tools/InventoryTracker'))
const DocumentVault       = dynamic(() => import('@/components/tools/DocumentVault'))
const ReportGenerator     = dynamic(() => import('@/components/tools/ReportGenerator'))
const ClientTracker       = dynamic(() => import('@/components/tools/ClientTracker'))
const AppointmentBook     = dynamic(() => import('@/components/tools/AppointmentBook'))
const CommunityBoard      = dynamic(() => import('@/components/tools/CommunityBoard'))
const TransactionLog      = dynamic(() => import('@/components/tools/TransactionLog'))
const ProjectTracker      = dynamic(() => import('@/components/tools/ProjectTracker'))
const AlertSystem         = dynamic(() => import('@/components/tools/AlertSystem'))

// ── Batch 1: Commerce, Finance, Delivery ─────────────────────────────────────
const PosDashboard        = dynamic(() => import('@/components/tools/PosDashboard'))
const DailySettlement     = dynamic(() => import('@/components/tools/DailySettlement'))
const ForexRateDisplay    = dynamic(() => import('@/components/tools/ForexRateDisplay'))
const PaymentLink         = dynamic(() => import('@/components/tools/PaymentLink'))
const SocialShop          = dynamic(() => import('@/components/tools/SocialShop'))
const OrderDashboard      = dynamic(() => import('@/components/tools/OrderDashboard'))
const ReviewTracker       = dynamic(() => import('@/components/tools/ReviewTracker'))
const BillingDashboard    = dynamic(() => import('@/components/tools/BillingDashboard'))
const AjoCircle           = dynamic(() => import('@/components/tools/AjoCircle'))
const RunnerDispatch      = dynamic(() => import('@/components/tools/RunnerDispatch'))
const DeliveryTracker     = dynamic(() => import('@/components/tools/DeliveryTracker'))
const BookingCalendar     = dynamic(() => import('@/components/tools/BookingCalendar'))
const ContentCalendar     = dynamic(() => import('@/components/tools/ContentCalendar'))
const AnalyticsReport     = dynamic(() => import('@/components/tools/AnalyticsReport'))
const SafetyChecklist     = dynamic(() => import('@/components/tools/SafetyChecklist'))
const WorkOrder           = dynamic(() => import('@/components/tools/WorkOrder'))
const Portfolio           = dynamic(() => import('@/components/tools/Portfolio'))

// ── Batch 2: Logistics, Health, Community, Professional ──────────────────────
const Telemedicine        = dynamic(() => import('@/components/tools/Telemedicine'))
const QueueManager        = dynamic(() => import('@/components/tools/QueueManager'))
const RoutePlanner        = dynamic(() => import('@/components/tools/RoutePlanner'))
const FuelTracker         = dynamic(() => import('@/components/tools/FuelTracker'))
const FlightLog           = dynamic(() => import('@/components/tools/FlightLog'))
const SiteSurvey          = dynamic(() => import('@/components/tools/SiteSurvey'))
const MaintenanceLog      = dynamic(() => import('@/components/tools/MaintenanceLog'))
const CommunityAlert      = dynamic(() => import('@/components/tools/CommunityAlert'))
const TerritoryMap        = dynamic(() => import('@/components/tools/TerritoryMap'))
const StaffManager        = dynamic(() => import('@/components/tools/StaffManager'))
const QualityLog          = dynamic(() => import('@/components/tools/QualityLog'))
const ComplianceChecker   = dynamic(() => import('@/components/tools/ComplianceChecker'))
const CampaignManager     = dynamic(() => import('@/components/tools/CampaignManager'))
const GrantTracker        = dynamic(() => import('@/components/tools/GrantTracker'))
const ImpactTracker       = dynamic(() => import('@/components/tools/ImpactTracker'))
const PublicationVault    = dynamic(() => import('@/components/tools/PublicationVault'))
const CaseLog             = dynamic(() => import('@/components/tools/CaseLog'))
const TournamentManager   = dynamic(() => import('@/components/tools/TournamentManager'))
const CowrieExchange      = dynamic(() => import('@/components/tools/CowrieExchange'))

// ── Batch 3: Extended Commerce, Tech, Creative, Agriculture ──────────────────
const DailyMenuBoard      = dynamic(() => import('@/components/tools/DailyMenuBoard'))
const StockTracker        = dynamic(() => import('@/components/tools/StockTracker'))
const CreditBook          = dynamic(() => import('@/components/tools/CreditBook'))
const EscrowRelease       = dynamic(() => import('@/components/tools/EscrowRelease'))
const RiskCalculator      = dynamic(() => import('@/components/tools/RiskCalculator'))
const CashTracker         = dynamic(() => import('@/components/tools/CashTracker'))
const SettlementManager   = dynamic(() => import('@/components/tools/SettlementManager'))
const BulkOrderManager    = dynamic(() => import('@/components/tools/BulkOrderManager'))
const SupplierConnect     = dynamic(() => import('@/components/tools/SupplierConnect'))
const BuyerShadowScore    = dynamic(() => import('@/components/tools/BuyerShadowScore'))
const LiveAuction         = dynamic(() => import('@/components/tools/LiveAuction'))
const BidTracker          = dynamic(() => import('@/components/tools/BidTracker'))
const ValueCalculator     = dynamic(() => import('@/components/tools/ValueCalculator'))
const DailyRoute          = dynamic(() => import('@/components/tools/DailyRoute'))
const ColdChainTracker    = dynamic(() => import('@/components/tools/ColdChainTracker'))
const CollectionTracker   = dynamic(() => import('@/components/tools/CollectionTracker'))
const CodeProject         = dynamic(() => import('@/components/tools/CodeProject'))
const ApiTester           = dynamic(() => import('@/components/tools/ApiTester'))
const TicketSystem        = dynamic(() => import('@/components/tools/TicketSystem'))
const BackupMonitor       = dynamic(() => import('@/components/tools/BackupMonitor'))
const DesignBrief         = dynamic(() => import('@/components/tools/DesignBrief'))
const ArticleVault        = dynamic(() => import('@/components/tools/ArticleVault'))
const ConservationLog     = dynamic(() => import('@/components/tools/ConservationLog'))
const ForecastShare       = dynamic(() => import('@/components/tools/ForecastShare'))
const ModeratorQueue      = dynamic(() => import('@/components/tools/ModeratorQueue'))

// ── Batch 5: Media, Creative, Sports, Commerce, Finance ──────────────────────
const AfroFlix           = dynamic(() => import('@/components/tools/AfroFlix'))
const WatchParty         = dynamic(() => import('@/components/tools/WatchParty'))
const TalentStage        = dynamic(() => import('@/components/tools/TalentStage'))
const VoiceRoom          = dynamic(() => import('@/components/tools/VoiceRoom'))
const CoCreationStudio   = dynamic(() => import('@/components/tools/CoCreationStudio'))
const CompoundLeague     = dynamic(() => import('@/components/tools/CompoundLeague'))
const GamingStream       = dynamic(() => import('@/components/tools/GamingStream'))
const NightMarket        = dynamic(() => import('@/components/tools/NightMarket'))
const PredictionPot      = dynamic(() => import('@/components/tools/PredictionPot'))
const FinanceLedger      = dynamic(() => import('@/components/tools/FinanceLedger'))

// ── Batch 4: Missing 15 tools (all villages coverage) ──────────────────────────
const CommunityConnect    = dynamic(() => import('@/components/tools/CommunityConnect'))
const AttendanceTracker   = dynamic(() => import('@/components/tools/AttendanceTracker'))
const MobilePaymentCollect = dynamic(() => import('@/components/tools/MobilePaymentCollect'))
const OutreachPlanner     = dynamic(() => import('@/components/tools/OutreachPlanner'))
const TechnicalDocs       = dynamic(() => import('@/components/tools/TechnicalDocs'))
const ProductListing      = dynamic(() => import('@/components/tools/ProductListing'))
const RepairQueue         = dynamic(() => import('@/components/tools/RepairQueue'))
const PartsFinder         = dynamic(() => import('@/components/tools/PartsFinder'))
const InfrastructureLog   = dynamic(() => import('@/components/tools/InfrastructureLog'))
const RemoteAccessTool    = dynamic(() => import('@/components/tools/RemoteAccessTool'))
const HostingTracker      = dynamic(() => import('@/components/tools/HostingTracker'))
const DatasetVault        = dynamic(() => import('@/components/tools/DatasetVault'))
const AppDeployTracker    = dynamic(() => import('@/components/tools/AppDeployTracker'))
const AuditReport         = dynamic(() => import('@/components/tools/AuditReport'))
const BarterMatch         = dynamic(() => import('@/components/tools/BarterMatch'))

// ── Generic workspace fallback ────────────────────────────────────────────────
const ToolWorkspace       = dynamic(() => import('@/components/tools/ToolWorkspace'))

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#060d07', card: '#0f1e11', border: '#1e3a20',
  text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

// ── Village metadata ──────────────────────────────────────────────────────────
const VNAME: Record<string, string> = {
  commerce: 'Commerce Village', agriculture: 'Agriculture Village',
  health: 'Health Village',     education: 'Education Village',
  arts: 'Arts Village',         builders: 'Builders Village',
  energy: 'Energy Village',     transport: 'Transport Village',
  technology: 'Technology Village', finance: 'Finance Village',
  media: 'Media Village',       justice: 'Justice Village',
  government: 'Government Village', security: 'Security Village',
  spirituality: 'Spirituality Village', fashion: 'Fashion Village',
  family: 'Family Village',     hospitality: 'Hospitality Village',
  sports: 'Sports Village',     holdings: 'Holdings Village',
}

const VCOLOR: Record<string, string> = {
  commerce: '#e07b00', agriculture: '#1a7c3e', health: '#0369a1',
  education: '#4f46e5', arts: '#7c3aed',       builders: '#b45309',
  energy: '#b91c1c',   transport: '#0891b2',   technology: '#0f766e',
  finance: '#065f46',  media: '#6b21a8',        justice: '#1e3a5f',
  government: '#1e3a5f', security: '#1a1a2e',  spirituality: '#4c1d95',
  fashion: '#be185d',  family: '#064e3b',       hospitality: '#7c2d12',
  sports: '#1d4ed8',   holdings: '#d4a017',
}

// ── Cowrie Counter ─────────────────────────────────────────────────────────
function CowrieCounter() {
  const [count, setCount] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setCount(c => c + Math.floor(Math.random() * 5 + 1)), 3000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(212,160,23,.1)', border: '1px solid rgba(212,160,23,.3)', borderRadius: 99, padding: '5px 12px' }}>
      <span style={{ fontSize: 14 }}>🪙</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>₡{count}</span>
      <span style={{ fontSize: 9, color: 'rgba(212,160,23,.6)' }}>this session</span>
    </div>
  )
}

// ── Tool Content Router — 62 tools wired ────────────────────────────────────
function ToolContent({ toolKey, villageId, roleKey }: { toolKey: string; villageId: string; roleKey: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = { villageId, roleKey } as any
  switch (toolKey) {
    // ── Existing 12 ──────────────────────────────────────────────────────────
    case 'quick_invoice':         return <QuickInvoice villageId={villageId} roleKey={roleKey} />
    case 'price_checker':         return <PriceChecker {...p} />
    case 'daily_target_tracker':  return <DailyTargetTracker {...p} />
    case 'inventory_tracker':     return <InventoryTracker {...p} />
    case 'document_vault':        return <DocumentVault {...p} />
    case 'report_generator':      return <ReportGenerator {...p} />
    case 'client_tracker':        return <ClientTracker {...p} />
    case 'appointment_book':      return <AppointmentBook {...p} />
    case 'community_board':       return <CommunityBoard {...p} />
    case 'transaction_log':       return <TransactionLog {...p} />
    case 'project_tracker':       return <ProjectTracker {...p} />
    case 'alert_system':          return <AlertSystem {...p} />

    // ── Batch 1: Commerce & Finance ───────────────────────────────────────────
    case 'pos_dashboard':         return <PosDashboard {...p} />
    case 'daily_settlement':      return <DailySettlement {...p} />
    case 'forex_rate_display':    return <ForexRateDisplay {...p} />
    case 'payment_link':          return <PaymentLink {...p} />
    case 'social_shop':           return <SocialShop {...p} />
    case 'order_dashboard':       return <OrderDashboard {...p} />
    case 'review_tracker':        return <ReviewTracker {...p} />
    case 'billing_dashboard':     return <BillingDashboard {...p} />
    case 'ajo_circle':            return <AjoCircle {...p} />
    case 'runner_dispatch':       return <RunnerDispatch {...p} />
    case 'delivery_tracker':      return <DeliveryTracker {...p} />
    case 'booking_calendar':      return <BookingCalendar {...p} />
    case 'content_calendar':      return <ContentCalendar {...p} />
    case 'analytics_report':      return <AnalyticsReport {...p} />
    case 'safety_checklist':      return <SafetyChecklist {...p} />
    case 'work_order':            return <WorkOrder {...p} />
    case 'portfolio_vault':       return <Portfolio {...p} />

    // ── Batch 2: Logistics, Health, Community ─────────────────────────────────
    case 'telemedicine':          return <Telemedicine {...p} />
    case 'queue_manager':         return <QueueManager {...p} />
    case 'route_planner':         return <RoutePlanner {...p} />
    case 'fuel_tracker':          return <FuelTracker {...p} />
    case 'flight_log':            return <FlightLog {...p} />
    case 'site_survey':           return <SiteSurvey {...p} />
    case 'maintenance_log':       return <MaintenanceLog {...p} />
    case 'community_alert':       return <CommunityAlert {...p} />
    case 'territory_map':         return <TerritoryMap {...p} />
    case 'staff_manager':         return <StaffManager {...p} />
    case 'quality_log':           return <QualityLog {...p} />
    case 'compliance_checker':    return <ComplianceChecker {...p} />
    case 'campaign_manager':      return <CampaignManager {...p} />
    case 'grant_tracker':         return <GrantTracker {...p} />
    case 'impact_tracker':        return <ImpactTracker {...p} />
    case 'publication_vault':     return <PublicationVault {...p} />
    case 'case_log':              return <CaseLog {...p} />
    case 'tournament_manager':    return <TournamentManager {...p} />
    case 'cowrie_exchange':       return <CowrieExchange {...p} />

    // ── Batch 3: Extended Tools ────────────────────────────────────────────────
    case 'daily_menu_board':      return <DailyMenuBoard {...p} />
    case 'stock_tracker':         return <StockTracker {...p} />
    case 'credit_book':           return <CreditBook {...p} />
    case 'escrow_release':        return <EscrowRelease {...p} />
    case 'risk_calculator':       return <RiskCalculator {...p} />
    case 'cash_tracker':          return <CashTracker {...p} />
    case 'settlement_manager':    return <SettlementManager {...p} />
    case 'bulk_order_manager':    return <BulkOrderManager {...p} />
    case 'supplier_connect':      return <SupplierConnect {...p} />
    case 'buyer_shadow_score':    return <BuyerShadowScore {...p} />
    case 'live_auction':          return <LiveAuction {...p} />
    case 'bid_tracker':           return <BidTracker {...p} />
    case 'value_calculator':      return <ValueCalculator {...p} />
    case 'daily_route':           return <DailyRoute {...p} />
    case 'cold_chain_tracker':    return <ColdChainTracker {...p} />
    case 'collection_tracker':    return <CollectionTracker {...p} />
    case 'code_project':          return <CodeProject {...p} />
    case 'api_tester':            return <ApiTester {...p} />
    case 'ticket_system':         return <TicketSystem {...p} />
    case 'backup_monitor':        return <BackupMonitor {...p} />
    case 'design_brief':          return <DesignBrief {...p} />
    case 'article_vault':         return <ArticleVault {...p} />
    case 'conservation_log':      return <ConservationLog {...p} />
    case 'forecast_share':        return <ForecastShare {...p} />
    case 'moderation_queue':      return <ModeratorQueue {...p} />

    // ── Batch 4: Missing 15 — full village coverage ──────────────────────────────
    case 'community_connect':       return <CommunityConnect {...p} />
    case 'attendance_tracker':      return <AttendanceTracker {...p} />
    case 'mobile_payment_collect':  return <MobilePaymentCollect {...p} />
    case 'outreach_planner':        return <OutreachPlanner {...p} />
    case 'technical_docs':          return <TechnicalDocs {...p} />
    case 'product_listing':         return <ProductListing {...p} />
    case 'repair_queue':            return <RepairQueue {...p} />
    case 'parts_finder':            return <PartsFinder {...p} />
    case 'infrastructure_log':      return <InfrastructureLog {...p} />
    case 'remote_access_tool':      return <RemoteAccessTool {...p} />
    case 'hosting_tracker':         return <HostingTracker {...p} />
    case 'dataset_vault':           return <DatasetVault {...p} />
    case 'app_deploy_tracker':      return <AppDeployTracker {...p} />
    case 'audit_report':            return <AuditReport {...p} />
    case 'barter_match':            return <BarterMatch {...p} />

    // ── Batch 5: Media, Creative, Sports, Commerce, Finance ──────────────────
    case 'afroflix':           return <AfroFlix {...p} />
    case 'watch_party':        return <WatchParty {...p} />
    case 'talent_stage':       return <TalentStage {...p} />
    case 'voice_room':         return <VoiceRoom {...p} />
    case 'co_creation_studio': return <CoCreationStudio {...p} />
    case 'compound_league':    return <CompoundLeague {...p} />
    case 'gaming_stream':      return <GamingStream {...p} />
    case 'night_market':       return <NightMarket {...p} />
    case 'prediction_pot':     return <PredictionPot {...p} />
    case 'finance_ledger':     return <FinanceLedger {...p} />

    // ── Fallback for any remaining tools ──────────────────────────────────────
    default: {
      const tool = TOOL_REGISTRY[toolKey]
      if (!tool) return null
      return <ToolWorkspace tool={tool} />
    }
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ToolPage() {
  const params        = useParams()
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const [sessionOpen, setSessionOpen] = React.useState(false)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [cowrieEarned, setCowrieEarned] = React.useState(0)
  const [toast, setToast] = React.useState('')

  const toolKey   = String(params.toolKey ?? '')
  const villageId = searchParams.get('village') ?? ''
  const roleKey   = searchParams.get('role') ?? ''

  const tool   = TOOL_REGISTRY[toolKey]
  const vColor = VCOLOR[villageId] ?? C.green

  // Tick cowrie earned every 2 minutes during active session
  React.useEffect(() => {
    if (!sessionOpen || tool?.cowrieFlow !== 'earns') return
    const id = setInterval(() => setCowrieEarned(c => c + 1), 120_000)
    return () => clearInterval(id)
  }, [sessionOpen, tool?.cowrieFlow])

  const getAuth = () => {
    try {
      const s = JSON.parse(localStorage.getItem('vd-auth') || '{}')
      return { token: s?.state?.accessToken ?? '', afroId: s?.state?.user?.afroId ?? '' }
    } catch { return { token: '', afroId: '' } }
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleOpenSession = async () => {
    const { token, afroId } = getAuth()
    try {
      const res = await fetch('/api/v1/tool-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ userAfroId: afroId, villageId, roleKey, toolKey }),
      })
      const data = await res.json()
      if (res.ok && data.data?.id) setSessionId(data.data.id)
    } catch { /* offline — continue without session ID */ }
    setSessionOpen(true)
    showToast('✓ Business session opened')
  }

  const handleSaveExit = () => {
    if (sessionId) {
      fetch(`/api/v1/tool-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', cowrieEarned }),
      }).catch(() => {})
      showToast(`✓ Session saved · +₡${cowrieEarned}`)
    }
    setTimeout(() => {
      if (villageId) router.push(`/dashboard/villages/${villageId}`)
      else router.push('/dashboard')
    }, sessionId ? 400 : 0)
  }

  if (!tool) {
    return (
      <main style={{ minHeight: '100dvh', background: C.bg, color: C.text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Tool Not Found</div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 20 }}>"{toolKey}" is not in the tool registry.</div>
        <button onClick={() => router.back()} style={{ padding: '10px 24px', borderRadius: 99, background: C.green, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          ← Go Back
        </button>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: 'Inter,system-ui,sans-serif', maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.card, borderBottom: `2px solid ${vColor}30`, padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button
            onClick={() => villageId ? router.push(`/dashboard/villages/${villageId}`) : router.back()}
            style={{ width: 32, height: 32, borderRadius: 10, background: C.muted, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: C.text, flexShrink: 0 }}
          >←</button>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${vColor}22`, border: `1.5px solid ${vColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {tool.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{tool.name}</div>
            <div style={{ fontSize: 9, color: C.sub, lineHeight: 1.3 }}>{tool.description.slice(0, 55)}{tool.description.length > 55 ? '…' : ''}</div>
          </div>
        </div>

        {/* Context badges + Cowrie counter */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {villageId && (
            <span style={{ fontSize: 9, fontWeight: 700, color: vColor, background: `${vColor}15`, border: `1px solid ${vColor}30`, borderRadius: 99, padding: '3px 8px' }}>
              🏘 {VNAME[villageId] ?? villageId}
            </span>
          )}
          {roleKey && (
            <span style={{ fontSize: 9, fontWeight: 700, color: C.sub, background: C.muted, border: `1px solid ${C.border}`, borderRadius: 99, padding: '3px 8px' }}>
              🎭 {roleKey.replace(/_/g, ' ')}
            </span>
          )}
          {tool.opensBusinessSession && (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 99, padding: '3px 8px' }}>
              ⚡ Business Session
            </span>
          )}
          {tool.cowrieFlow === 'earns' && <CowrieCounter />}
          {tool.cowrieFlow === 'spends' && (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#f87171', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 99, padding: '3px 8px' }}>₡ Spends</span>
          )}
        </div>
      </div>

      {/* ── Business Session Banner ── */}
      {tool.opensBusinessSession && (
        <div style={{ margin: '10px 14px 0', borderRadius: 12, padding: '10px 14px', background: sessionOpen ? 'rgba(74,222,128,.08)' : 'rgba(212,160,23,.06)', border: `1px solid ${sessionOpen ? 'rgba(74,222,128,.3)' : 'rgba(212,160,23,.25)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20 }}>{sessionOpen ? '✅' : '⚡'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: sessionOpen ? '#4ade80' : C.gold }}>
              {sessionOpen ? 'Business Session Active' : 'Open Business Session'}
            </div>
            <div style={{ fontSize: 9, color: C.sub }}>
              {sessionOpen ? 'Transactions being recorded to the Cowrie ledger' : 'Track earnings and seal Cowrie transactions via Seso Chat'}
            </div>
          </div>
          {!sessionOpen && (
            <button
              onClick={handleOpenSession}
              style={{ padding: '7px 14px', borderRadius: 99, background: C.gold, color: '#000', fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >Open</button>
          )}
        </div>
      )}

      {/* ── Tool Content ── */}
      <div style={{ padding: '14px 14px 0' }}>
        <React.Suspense fallback={
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${vColor}30`, borderTopColor: vColor, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 12, color: C.sub }}>Loading tool…</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        }>
          <ToolContent toolKey={toolKey} villageId={villageId} roleKey={roleKey} />
        </React.Suspense>
      </div>

      {/* ── Footer ── */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: C.card, borderTop: `1px solid ${C.border}`, padding: '10px 14px', zIndex: 50 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { showToast('💬 Sharing via Seso Chat…') }}
            style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: `${vColor}15`, border: `1px solid ${vColor}30`, color: vColor, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >💬 Share</button>
          <button
            onClick={handleSaveExit}
            style={{ flex: 2, padding: '11px 0', borderRadius: 12, background: `linear-gradient(90deg, ${C.green}, #065f46)`, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            {sessionOpen ? `💾 Save & Exit${cowrieEarned > 0 ? ` (+₡${cowrieEarned})` : ''}` : '← Back to Village'}
          </button>
        </div>
      </div>
    </main>
  )
}
