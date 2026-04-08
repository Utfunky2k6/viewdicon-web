// ============================================================
// Platform Monetization Tiers — Source of Truth
// All tier definitions, tool gating, and Cowrie drop campaigns
// ============================================================

// Platform membership tiers
export const PLATFORM_TIERS = {
  OMIDAN: {
    // Free — "Young person learning / Seeker"
    name: 'Ọmọdán',
    nameEn: 'Seeker',
    cowrie: 0,
    usd: 0,
    features: [
      'Basic profile',
      'Feed reading',
      '3 tools free',
      '1 village join',
      'Basic chat',
    ],
    color: '#6b7280',
    icon: '🌱',
    description: 'Start your journey — free forever',
  },
  ALAWE: {
    // Starter — "One who is growing / Flourishing"
    name: 'Àlàáfíà',
    nameEn: 'Flourishing',
    cowrie: 500,
    usd: 5,
    features: [
      'All free features',
      'All 20 villages',
      '20 tools',
      'Voice recording',
      'Photo upload',
      'Radio listening',
    ],
    color: '#22c55e',
    icon: '🌿',
    description: 'Grow your presence across all villages',
  },
  ODE: {
    // Creator — "Hunter / Achiever"
    name: 'Ọdẹ',
    nameEn: 'Creator',
    cowrie: 2000,
    usd: 15,
    features: [
      'All Àlàáfíà features',
      'Go Live streaming',
      'Create radio station',
      'Marketplace selling',
      'Analytics dashboard',
      'Creator tools',
      'AI Gods full access',
    ],
    color: '#f59e0b',
    icon: '🎯',
    description: 'Create, broadcast and earn on the platform',
    popular: true,
  },
  OBA: {
    // Pro — "Chief / Leader / Sovereign"
    name: 'Ọba',
    nameEn: 'Sovereign',
    cowrie: 5000,
    usd: 35,
    features: [
      'All Ọdẹ features',
      'Unlimited tools',
      'Business sessions',
      'Village treasury',
      'Priority support',
      'Custom AfroID',
      'Verified badge',
      'Fan economy',
    ],
    color: '#8b5cf6',
    icon: '👑',
    description: 'Lead your community with sovereign power',
  },
} as const

// Tool gating — which tier unlocks which tools
export const TOOL_TIER_MAP: Record<string, keyof typeof PLATFORM_TIERS> = {
  // ── Free tools (Ọmọdán) ──
  weather_radar:           'OMIDAN',
  crop_calendar:           'OMIDAN',
  market_price_checker:    'OMIDAN',
  daily_price_checker:     'OMIDAN',
  disease_tracker:         'OMIDAN',
  health_log:              'OMIDAN',

  // ── Àlàáfíà tools ──
  patient_records:         'ALAWE',
  invoice_generator:       'ALAWE',
  staff_manager:           'ALAWE',
  client_tracker:          'ALAWE',
  inventory_tracker:       'ALAWE',
  order_dashboard:         'ALAWE',
  time_tracker:            'ALAWE',
  delivery_log:            'ALAWE',
  pos_dashboard:           'ALAWE',
  quick_invoice:           'ALAWE',
  payment_link:            'ALAWE',

  // ── Ọdẹ Creator tools ──
  escrow_monitor:          'ODE',
  bulk_payment_tool:       'ODE',
  legal_document_vault:    'ODE',
  recording_vault:         'ODE',
  talent_stage:            'ODE',
  co_creation_studio:      'ODE',
  report_generator:        'ODE',
  press_kit_vault:         'ODE',
  game_project:            'ODE',
  gaming_stream:           'ODE',
  watch_party:             'ODE',

  // ── Ọba Sovereign tools ──
  village_treasury:        'OBA',
  smart_contract_tool:     'OBA',
  compliance_dashboard:    'OBA',
  fraud_alert:             'OBA',
  moderator_queue:         'OBA',
  settlement_tracker:      'OBA',
  nda_generator:           'OBA',
  audit_log:               'OBA',
}

// Cowrie drop campaigns — actions that reward Cowries
export const COWRIE_DROPS = [
  { id: 'DAILY_LOGIN',       amount: 10,  description: 'Daily login bonus',                   icon: '🌅' },
  { id: 'FIRST_POST',        amount: 50,  description: 'First post on the feed',              icon: '📣' },
  { id: 'FIRST_STREAM',      amount: 200, description: 'First live stream',                   icon: '📡' },
  { id: 'VILLAGE_JOIN',      amount: 100, description: 'Join your first village',             icon: '🏘' },
  { id: 'PROFILE_COMPLETE',  amount: 150, description: 'Complete your profile',               icon: '✨' },
  { id: 'REFERRAL',          amount: 500, description: 'Refer a friend who signs up',         icon: '🤝' },
  { id: 'CEREMONY_COMPLETE', amount: 300, description: 'Complete the full naming ceremony',   icon: '🥁' },
  { id: 'FIRST_TOOL',        amount: 75,  description: 'Use a village tool for the first time', icon: '🛠' },
  { id: 'FIRST_TRADE',       amount: 100, description: 'Complete your first trade session',   icon: '⚖️' },
] as const

export type PlatformTier = keyof typeof PLATFORM_TIERS
export type CowrieDropId = typeof COWRIE_DROPS[number]['id']

// Annual discount multiplier — pay 10 months, get 12
export const ANNUAL_DISCOUNT_MONTHS = 2

// Helper — get next tier above current
export function getNextTier(current: PlatformTier): PlatformTier | null {
  const order: PlatformTier[] = ['OMIDAN', 'ALAWE', 'ODE', 'OBA']
  const idx = order.indexOf(current)
  return idx < order.length - 1 ? order[idx + 1] : null
}

// Helper — cowrie shortfall to reach a tier
export function cowrieShortfall(balance: number, tier: PlatformTier): number {
  return Math.max(0, PLATFORM_TIERS[tier].cowrie - balance)
}
