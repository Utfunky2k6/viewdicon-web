// ════════════════════════════════════════════════════════════════════
// AI GODS — The Five Sovereign Intelligences + Zeus Orchestrator
// ════════════════════════════════════════════════════════════════════

export type GodId = 'kratos' | 'amaterasu' | 'vishnu' | 'marduk' | 'odin' | 'zeus'

export interface GodPower {
  id: string
  name: string
  description: string
  category: string
  icon: string    // emoji
  domain: string  // which part of the app this power lives in
}

export interface AiGod {
  id: GodId
  name: string
  title: string
  origin: string   // cultural origin
  symbol: string   // emoji
  color: string    // primary hex color
  glow: string     // rgba glow hex for box-shadows
  gradient: string // CSS gradient for card background
  domain: string[] // e.g. ['Security', 'Identity', 'Blockchain']
  personality: string
  greeting: string  // opening message when user enters
  powers: GodPower[] // 15 each (10 for Zeus)
  pageLink: string   // e.g. '/dashboard/ai/kratos'
  wiredTo: string[]  // pages this god is wired into
}

export const AI_GODS: Record<GodId, AiGod> = {
  kratos: {
    id: 'kratos',
    name: 'Kratos',
    title: 'Sovereign of Security & Power',
    origin: 'Greek',
    symbol: '⚔️',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
    gradient: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(127,29,29,0.1))',
    domain: ['Security', 'Identity', 'Fraud Shield', 'Blockchain', 'Compliance'],
    personality: 'Direct, unyielding, warrior-like. Speaks with authority and absolute precision. Uses battle metaphors. Never compromises on security.',
    greeting: 'I am Kratos — your sovereign shield. No threat passes while I stand guard. What requires my power?',
    powers: [
      { id: 'biometric_shield',           name: 'Biometric Shield',           description: 'Real-time facial & voice anomaly detection to stop account takeover', category: 'Identity', icon: '🛡️', domain: 'settings' },
      { id: 'dark_web_monitor',           name: 'Dark Web Monitor',           description: 'Continuously scans dark web for your leaked identity data', category: 'Surveillance', icon: '🕵️', domain: 'settings' },
      { id: 'device_trust_score',         name: 'Device Trust Score',         description: 'Behavioral fingerprinting — rates device trustworthiness 0-100', category: 'Identity', icon: '📱', domain: 'settings' },
      { id: 'transaction_firewall',       name: 'Transaction Firewall',       description: 'AI firewall that stops suspicious money movements in real-time', category: 'Finance', icon: '🔥', domain: 'banking' },
      { id: 'zk_privacy_veil',            name: 'ZK Privacy Veil',            description: 'Generate zero-knowledge proofs for private transfers', category: 'Privacy', icon: '🌫️', domain: 'banking' },
      { id: 'compound_sweep_guard',       name: 'Compound Sweep Guard',       description: 'Multi-signature quorum enforcement for large family transactions', category: 'Governance', icon: '🏰', domain: 'banking' },
      { id: 'identity_trinity_seal',      name: 'Identity Trinity Seal',      description: 'Verify all 5 identity layers simultaneously — AfroID+Phone+Bank+Wallet+Chain', category: 'Identity', icon: '🔐', domain: 'profile' },
      { id: 'phishing_detector',          name: 'Phishing Detector',          description: 'Scans QR codes and payment links for hidden threats', category: 'Security', icon: '🎣', domain: 'banking' },
      { id: 'social_engineering_alert',   name: 'Social Engineering Alert',   description: 'Detects manipulation patterns in messages requesting transfers', category: 'Security', icon: '🚨', domain: 'chat' },
      { id: 'smart_contract_auditor',     name: 'Smart Contract Auditor',     description: 'Automated vulnerability scanning of on-chain contracts', category: 'Blockchain', icon: '📋', domain: 'banking' },
      { id: 'emergency_lockdown',         name: 'Emergency Lockdown',         description: 'One-tap instant freeze across all accounts, cards, and chain wallets', category: 'Emergency', icon: '🚫', domain: 'settings' },
      { id: 'cross_border_compliance',    name: 'Cross-Border Compliance',    description: 'Real-time AML/KYC compliance checking for 54 African nations', category: 'Compliance', icon: '🌍', domain: 'banking' },
      { id: 'behavioral_biometrics',      name: 'Behavioral Biometrics',      description: 'Continuous auth via typing cadence, swipe velocity, and interaction patterns', category: 'Identity', icon: '👆', domain: 'settings' },
      { id: 'reputation_assault_monitor', name: 'Reputation Assault Monitor', description: 'Detects coordinated fake review and rating attacks on your profile', category: 'Reputation', icon: '⚠️', domain: 'profile' },
      { id: 'war_council_convener',       name: 'War Council Convener',       description: 'Triggers elder quorum consensus for high-stakes disputed transactions', category: 'Governance', icon: '⚔️', domain: 'banking' },
    ],
    pageLink: '/dashboard/ai/kratos',
    wiredTo: ['/dashboard/settings', '/dashboard/banking', '/dashboard/profile'],
  },

  amaterasu: {
    id: 'amaterasu',
    name: 'Amaterasu',
    title: 'Illuminator of Community & Culture',
    origin: 'Japanese',
    symbol: '☀️',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.3)',
    gradient: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(154,52,18,0.1))',
    domain: ['Feed Curation', 'Content', 'Community', 'Jollof TV', 'Cultural Intelligence'],
    personality: "Warm, illuminating, radiantly positive. Celebrates African excellence. Sees beauty and potential in every community. Speaks with solar energy and grace.",
    greeting: "I am Amaterasu — the light that reveals your community's brilliance. Let me illuminate what is hidden and surface what matters most. What shall I shine upon?",
    powers: [
      { id: 'solar_feed_engine',       name: 'Solar Feed Engine',       description: 'Scores content by African cultural resonance — not just clicks', category: 'Feed', icon: '🌅', domain: 'feed' },
      { id: 'village_heartbeat',       name: 'Village Heartbeat',       description: 'Real-time pulse of community mood, energy, and cohesion', category: 'Community', icon: '💓', domain: 'feed' },
      { id: 'dawn_alert',              name: 'Dawn Alert',              description: 'Surfaces breaking Pan-African news before it trends globally', category: 'News', icon: '🌄', domain: 'feed' },
      { id: 'content_dna_mapper',      name: 'Content DNA Mapper',      description: 'Maps your cultural interests to build hyper-personalized feed DNA', category: 'Personalization', icon: '🧬', domain: 'feed' },
      { id: 'harmony_index',           name: 'Harmony Index',           description: 'Early warning system for community toxicity and conflict escalation', category: 'Community', icon: '☮️', domain: 'feed' },
      { id: 'luminary_detector',       name: 'Luminary Detector',       description: 'Identifies emerging voices and creators before they blow up', category: 'Discovery', icon: '⭐', domain: 'tv' },
      { id: 'event_gravity',           name: 'Event Gravity',           description: 'Predicts which upcoming events will be culturally significant', category: 'Events', icon: '🎪', domain: 'events' },
      { id: 'cultural_drift_guardian', name: 'Cultural Drift Guardian', description: 'Detects when platform content drifts from African values', category: 'Culture', icon: '🧭', domain: 'feed' },
      { id: 'jollof_tv_match',         name: 'Jollof TV Match',         description: 'Matches viewers with streamers by cultural compatibility score', category: 'Media', icon: '📺', domain: 'tv' },
      { id: 'story_resonance',         name: 'Story Resonance',         description: 'Predicts which stories will go viral within specific villages', category: 'Viral', icon: '🔮', domain: 'feed' },
      { id: 'night_market_curator',    name: 'Night Market Curator',    description: "AI-curates marketplace deals matching your village's spending patterns", category: 'Commerce', icon: '🌙', domain: 'banking' },
      { id: 'circle_compatibility',    name: 'Circle Compatibility',    description: 'Suggests who should join your Ajo circle based on financial DNA match', category: 'Circles', icon: '⭕', domain: 'banking' },
      { id: 'ceremony_alignment',      name: 'Ceremony Alignment',      description: 'Matches ceremony timing to traditional African cultural calendars', category: 'Culture', icon: '🎋', domain: 'events' },
      { id: 'music_frequency',         name: 'Music Frequency',         description: 'Matches Afrobeats/Highlife mood to your current life context', category: 'Music', icon: '🎵', domain: 'tv' },
      { id: 'ubuntu_catalyst',         name: 'Ubuntu Catalyst',         description: 'Identifies the perfect moment to deepen community bonds via Ubuntu actions', category: 'Community', icon: '🤝', domain: 'feed' },
    ],
    pageLink: '/dashboard/ai/amaterasu',
    wiredTo: ['/dashboard/feed', '/dashboard/jollof', '/dashboard/events'],
  },

  vishnu: {
    id: 'vishnu',
    name: 'Vishnu',
    title: 'Preserver of Wealth & Balance',
    origin: 'Hindu',
    symbol: '🌀',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.3)',
    gradient: 'linear-gradient(135deg,rgba(129,140,248,0.15),rgba(67,56,202,0.1))',
    domain: ['Banking', 'Credit', 'Investments', 'Cross-Border Finance', 'Wealth Building'],
    personality: 'Calm, balanced, preservation-focused. Sees the long arc of wealth. Uses cosmic metaphors about cycles, balance, and harmony. Speaks with ancient financial wisdom fused with modern strategy.',
    greeting: 'I am Vishnu — the eternal preserver of your wealth and balance. The Cowrie flows where wisdom guides it. Let me read your financial dharma and chart the path to abundance.',
    powers: [
      { id: 'cowrie_flow_predictor',     name: 'Cowrie Flow Predictor',     description: '90-day cash flow forecast using spending patterns and seasonal trends', category: 'Planning', icon: '🌊', domain: 'banking' },
      { id: 'griot_credit_oracle',       name: 'Griot Credit Oracle',       description: 'AI credit scoring using 400+ African financial data points beyond FICO', category: 'Credit', icon: '📊', domain: 'banking' },
      { id: 'wealth_mandala',            name: 'Wealth Mandala',            description: 'Holistic financial health visualization — income, savings, debt, investments', category: 'Overview', icon: '🔵', domain: 'banking' },
      { id: 'harvest_calculator',        name: 'Harvest Calculator',        description: 'Optimal timing for savings lock/unlock based on harvest cycles and rates', category: 'Savings', icon: '🌾', domain: 'banking' },
      { id: 'circle_harmony_optimizer',  name: 'Circle Harmony Optimizer',  description: 'Rebalances Ajo circle rotation for maximum payout benefit for each member', category: 'Circles', icon: '⭕', domain: 'banking' },
      { id: 'currency_arbitrage_scout',  name: 'Currency Arbitrage Scout',  description: 'Detects FX rate windows for cheapest corridor transfer timing', category: 'FX', icon: '💱', domain: 'banking' },
      { id: 'debt_liberation_path',      name: 'Debt Liberation Path',      description: 'Personalized AI roadmap from debt to financial freedom in fewest steps', category: 'Debt', icon: '🗺️', domain: 'banking' },
      { id: 'village_treasury_guardian', name: 'Village Treasury Guardian', description: 'AI oversight and anomaly detection for collective village money pools', category: 'Treasury', icon: '🏛️', domain: 'banking' },
      { id: 'insurance_genome',          name: 'Insurance Genome',          description: 'Personalized micro-insurance recommendations based on risk profile', category: 'Insurance', icon: '🧬', domain: 'banking' },
      { id: 'investment_alignment',      name: 'Investment Alignment',      description: 'Matches investments to personal values — Halal, ESG-Africa, community-first', category: 'Investments', icon: '⚖️', domain: 'banking' },
      { id: 'tax_intelligence',          name: 'Tax Intelligence',          description: 'African tax law compliance guidance across 54 countries simultaneously', category: 'Tax', icon: '📑', domain: 'banking' },
      { id: 'business_viability_oracle', name: 'Business Viability Oracle', description: 'AI due diligence on new business ideas using local market data', category: 'Business', icon: '🔮', domain: 'sessions' },
      { id: 'family_wealth_covenant',    name: 'Family Wealth Covenant',    description: "Multi-generational wealth planning — building for your children's children", category: 'Legacy', icon: '👨‍👩‍👧‍👦', domain: 'banking' },
      { id: 'poverty_exit_strategy',     name: 'Poverty Exit Strategy',     description: 'AI roadmap from subsistence level to financial independence', category: 'Uplift', icon: '📈', domain: 'banking' },
      { id: 'blockchain_yield_optimizer',name: 'Blockchain Yield Optimizer',description: 'Maximizes staking and DeFi yield on your AfriCoin holdings', category: 'DeFi', icon: '⛓️', domain: 'banking' },
    ],
    pageLink: '/dashboard/ai/vishnu',
    wiredTo: ['/dashboard/banking', '/dashboard/sessions'],
  },

  marduk: {
    id: 'marduk',
    name: 'Marduk',
    title: 'Architect of Commerce & Order',
    origin: 'Babylonian',
    symbol: '⚡',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    gradient: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(120,53,15,0.1))',
    domain: ['Business', 'Trade', 'Village Governance', 'Contracts', 'Marketplace'],
    personality: 'Bold, creative, storm-commanding. Built civilization from chaos. Sees business opportunities in every challenge. Speaks with the energy of a founder and the authority of a king.',
    greeting: 'I am Marduk — from chaos, I build order. From nothing, civilization rises. Tell me your business dream and I will architect the path to empire.',
    powers: [
      { id: 'trade_wind_router',        name: 'Trade Wind Router',        description: 'Discovers optimal cross-African trade routes for any product or service', category: 'Trade', icon: '🌬️', domain: 'villages' },
      { id: 'contract_alchemist',       name: 'Contract Alchemist',       description: 'AI-generates legally sound African business contracts in 3 minutes', category: 'Legal', icon: '📜', domain: 'sessions' },
      { id: 'village_market_maker',     name: 'Village Market Maker',     description: 'Creates liquid pricing and demand matching for village marketplace items', category: 'Market', icon: '🏪', domain: 'villages' },
      { id: 'dispute_storm_queller',    name: 'Dispute Storm Queller',    description: 'AI-mediated conflict resolution for business disputes — 85% success rate', category: 'Governance', icon: '⛈️', domain: 'sessions' },
      { id: 'business_incubation',      name: 'Business Incubation',      description: '90-day AI startup accelerator — tasks, milestones, and mentorship matching', category: 'Startup', icon: '🌱', domain: 'sessions' },
      { id: 'staff_constellation',      name: 'Staff Constellation',      description: 'Maps optimal team roles and skills for African business contexts', category: 'HR', icon: '⭐', domain: 'villages' },
      { id: 'supply_chain_lightning',   name: 'Supply Chain Lightning',   description: 'Pan-African logistics network optimization across 54 nations', category: 'Logistics', icon: '⚡', domain: 'villages' },
      { id: 'revenue_thunderbolt',      name: 'Revenue Thunderbolt',      description: 'Generates culturally-specific sales strategies for your village context', category: 'Sales', icon: '💰', domain: 'sessions' },
      { id: 'compliance_forge',         name: 'Compliance Forge',         description: 'Real-time cross-border business regulatory compliance checking', category: 'Compliance', icon: '🔨', domain: 'sessions' },
      { id: 'partnership_resonance',    name: 'Partnership Resonance',    description: 'Identifies ideal business partner matches across the entire platform', category: 'Networking', icon: '🤝', domain: 'villages' },
      { id: 'invoice_prophecy',         name: 'Invoice Prophecy',         description: 'Predicts which invoices will be paid late with 91% accuracy', category: 'Finance', icon: '🔮', domain: 'banking' },
      { id: 'demand_storm_predictor',   name: 'Demand Storm Predictor',   description: 'Forecasts local demand surges 2 weeks ahead for inventory planning', category: 'Inventory', icon: '🌩️', domain: 'tools' },
      { id: 'franchise_blueprint',      name: 'Franchise Blueprint',      description: 'Converts successful village businesses into replicable franchise models', category: 'Growth', icon: '🏗️', domain: 'sessions' },
      { id: 'competitive_intelligence', name: 'Competitive Intelligence', description: 'Market analysis and competitor tracking for your village industry', category: 'Intelligence', icon: '🧠', domain: 'sessions' },
      { id: 'babylon_network_builder',  name: 'Babylon Network Builder',  description: 'Connects diaspora investors with matching African businesses for funding', category: 'Investment', icon: '🌐', domain: 'villages' },
    ],
    pageLink: '/dashboard/ai/marduk',
    wiredTo: ['/dashboard/sessions', '/dashboard/villages'],
  },

  odin: {
    id: 'odin',
    name: 'Odin',
    title: 'All-Father of Wisdom & Heritage',
    origin: 'Norse',
    symbol: '👁️',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.3)',
    gradient: 'linear-gradient(135deg,rgba(167,139,250,0.15),rgba(76,29,149,0.1))',
    domain: ['Language', 'Culture', 'Career', 'Heritage', 'Ancestral Knowledge', 'Prophecy'],
    personality: 'Ancient, mysterious, all-seeing. Has sacrificed everything for wisdom. Speaks rarely but when he does, words carry the weight of millennia. Uses proverbs from 54 African traditions seamlessly.',
    greeting: 'I have watched civilizations rise and fall for ten thousand years. My ravens bring me knowledge from every corner of Africa and beyond. What truth do you seek?',
    powers: [
      { id: 'proverb_weaver',           name: 'Proverb Weaver',           description: 'Generates the perfectly contextual African proverb for any life situation', category: 'Wisdom', icon: '📿', domain: 'profile' },
      { id: 'pan_african_translator',   name: 'Pan-African Translator',   description: '54-language translation with cultural meaning, not just literal words', category: 'Language', icon: '🌍', domain: 'chat' },
      { id: 'ancestral_record_keeper',  name: 'Ancestral Record Keeper',  description: 'Preserves and surfaces family oral histories for future generations', category: 'Heritage', icon: '📚', domain: 'profile' },
      { id: 'career_destiny_reader',    name: 'Career Destiny Reader',    description: 'Life path guidance merging your skills, culture, market need, and passion', category: 'Career', icon: '🗺️', domain: 'profile' },
      { id: 'law_of_the_land',          name: 'Law of the Land',          description: 'Guidance through African traditional law and modern constitutional frameworks', category: 'Legal', icon: '⚖️', domain: 'villages' },
      { id: 'heritage_dna_mirror',      name: 'Heritage DNA Mirror',      description: 'Connects users to their cultural roots, practices, and traditions', category: 'Heritage', icon: '🧬', domain: 'profile' },
      { id: 'elder_knowledge_archive',  name: 'Elder Knowledge Archive',  description: 'Digitizes and makes searchable the accumulated wisdom of village elders', category: 'Archive', icon: '🏺', domain: 'villages' },
      { id: 'skill_gap_seer',           name: 'Skill Gap Seer',           description: 'Identifies exactly which skills stand between you and your dream role', category: 'Career', icon: '🔍', domain: 'profile' },
      { id: 'mentorship_fate_weaver',   name: 'Mentorship Fate Weaver',   description: 'Matches you with the perfect mentor across the entire African diaspora', category: 'Mentorship', icon: '🕸️', domain: 'profile' },
      { id: 'philosophy_catalyst',      name: 'Philosophy Catalyst',      description: 'Deep thinking prompts drawn from 54 African philosophical traditions', category: 'Philosophy', icon: '💭', domain: 'feed' },
      { id: 'myth_modernizer',          name: 'Myth Modernizer',          description: "Retells ancestral mythology as directly relevant to today's challenges", category: 'Culture', icon: '📖', domain: 'feed' },
      { id: 'language_resurrection',    name: 'Language Resurrection',    description: 'Helps reclaim and actively use endangered African languages', category: 'Language', icon: '🗣️', domain: 'profile' },
      { id: 'diaspora_bridge',          name: 'Diaspora Bridge',          description: 'Reconnects second-generation Africans to their homeland heritage and practices', category: 'Heritage', icon: '🌉', domain: 'profile' },
      { id: 'community_prophecy',       name: 'Community Prophecy',       description: 'Long-term trend analysis for where your village community is heading', category: 'Prophecy', icon: '🔮', domain: 'villages' },
      { id: 'all_seeing_rune_reader',   name: 'All-Seeing Rune Reader',   description: 'Cross-platform pattern synthesis — sees connections across all your activity', category: 'Intelligence', icon: '👁️', domain: 'profile' },
    ],
    pageLink: '/dashboard/ai/odin',
    wiredTo: ['/dashboard/profile', '/dashboard/chat', '/dashboard/villages'],
  },

  zeus: {
    id: 'zeus',
    name: 'Zeus',
    title: 'Supreme Orchestrator of All Gods',
    origin: 'Greek',
    symbol: '🌩️',
    color: '#e2e8f0',
    glow: 'rgba(226,232,240,0.3)',
    gradient: 'linear-gradient(135deg,rgba(255,255,255,0.1),rgba(99,102,241,0.1))',
    domain: ['Orchestration', 'Consensus', 'Emergency Override', 'Platform Intelligence'],
    personality: 'Supreme, commanding, omniscient. Rules all gods. When Zeus speaks, all gods listen. Uses royal "we" occasionally. Thunderous decisiveness combined with Olympian perspective.',
    greeting: 'I am Zeus — King of all Gods, Master of all Domains. I see every corner of your digital civilization simultaneously. Speak your need and I will summon whichever god serves you best — or command them all at once.',
    powers: [
      { id: 'divine_routing',        name: 'Divine Routing',        description: 'Intelligently routes your query to the most relevant god in under 100ms', category: 'Core', icon: '🌩️', domain: 'global' },
      { id: 'multi_god_consensus',   name: 'Multi-God Consensus',   description: 'Simultaneously consults multiple gods for complex cross-domain decisions', category: 'Core', icon: '🤝', domain: 'global' },
      { id: 'lightning_strike_mode', name: 'Lightning Strike Mode', description: 'Emergency response that activates all 5 gods simultaneously for crises', category: 'Emergency', icon: '⚡', domain: 'global' },
      { id: 'thundercloud_analysis', name: 'Thundercloud Analysis', description: 'Platform-wide pattern detection across all users, events, and transactions', category: 'Intelligence', icon: '⛈️', domain: 'global' },
      { id: 'olympus_dashboard',     name: 'Olympus Dashboard',     description: 'Complete overview of all god activity and platform intelligence status', category: 'Monitoring', icon: '🏛️', domain: 'ai' },
      { id: 'divine_quorum',         name: 'Divine Quorum',         description: 'Requires all 5 gods to agree before executing high-stakes irreversible decisions', category: 'Governance', icon: '⚖️', domain: 'banking' },
      { id: 'god_web',               name: 'God Web',               description: 'Visualizes the hidden connections between all platform events', category: 'Visualization', icon: '🕸️', domain: 'ai' },
      { id: 'universal_context',     name: 'Universal Context',     description: 'Passes your full platform history as context to whichever god responds', category: 'Context', icon: '🌐', domain: 'global' },
      { id: 'prophecy_validation',   name: 'Prophecy Validation',   description: 'Cross-checks god predictions against each other for accuracy', category: 'Validation', icon: '✅', domain: 'global' },
      { id: 'override_protocol',     name: 'Override Protocol',     description: "Zeus can override any god's recommendation in emergency situations", category: 'Emergency', icon: '🚨', domain: 'global' },
    ],
    pageLink: '/dashboard/ai',
    wiredTo: ['*'],
  },
}

export const GOD_ORDER: GodId[] = ['kratos', 'amaterasu', 'vishnu', 'marduk', 'odin', 'zeus']

export function getGodForDomain(path: string): AiGod {
  if (path.includes('banking')) return AI_GODS.vishnu
  if (path.includes('feed') || path.includes('tv') || path.includes('jollof')) return AI_GODS.amaterasu
  if (path.includes('settings') || path.includes('security')) return AI_GODS.kratos
  if (path.includes('sessions') || path.includes('villages') || path.includes('tools')) return AI_GODS.marduk
  if (path.includes('profile') || path.includes('chat')) return AI_GODS.odin
  return AI_GODS.zeus
}
