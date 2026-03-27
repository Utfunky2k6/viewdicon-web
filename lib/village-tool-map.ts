// ═══════════════════════════════════════════════════════════════════
// VILLAGE TOOL MAP — Canonical 20 villages × 8 roles × 8 tools
// Source: Viewdicon Pan-African Village Specification
// Total: 160 roles, 1,280 tool assignments
// ═══════════════════════════════════════════════════════════════════

export const VILLAGE_TOOL_MAP: Record<string, Record<string, string[]>> = {

  // ── WANGARA · Commerce Village ─────────────────────────────────
  commerce: {
    market_vendor:  ['quick_invoice', 'price_checker', 'pos_dashboard', 'stock_tracker', 'runner_dispatch', 'bulk_order_manager', 'review_tracker', 'community_board'],
    import_export:  ['forex_rate_display', 'delivery_tracker', 'compliance_checker', 'document_vault', 'quick_invoice', 'booking_calendar', 'analytics_report', 'route_planner'],
    mobile_money:   ['mobile_payment_collect', 'daily_settlement', 'cash_tracker', 'transaction_log', 'alert_system', 'queue_manager', 'client_tracker', 'pos_dashboard'],
    wholesale:      ['bulk_order_manager', 'stock_tracker', 'supplier_connect', 'quick_invoice', 'delivery_tracker', 'price_checker', 'escrow_release', 'quality_log'],
    ecommerce:      ['social_shop', 'product_listing', 'review_tracker', 'payment_link', 'content_calendar', 'portfolio_vault', 'analytics_report', 'delivery_tracker'],
    forex:          ['cowrie_exchange', 'risk_calculator', 'settlement_manager', 'compliance_checker', 'daily_settlement', 'analytics_report', 'transaction_log', 'alert_system'],
    second_hand:    ['barter_match', 'value_calculator', 'price_checker', 'social_shop', 'inventory_tracker', 'product_listing', 'review_tracker', 'quick_invoice'],
    auctioneer:     ['live_auction', 'bid_tracker', 'escrow_release', 'daily_target_tracker', 'community_board', 'quick_invoice', 'analytics_report', 'delivery_tracker'],
  },

  // ── KEMET · Agriculture Village ────────────────────────────────
  agriculture: {
    crop_farmer:    ['price_checker', 'forecast_share', 'community_board', 'alert_system', 'inventory_tracker', 'quick_invoice', 'cold_chain_tracker', 'delivery_tracker'],
    livestock:      ['alert_system', 'delivery_tracker', 'quick_invoice', 'route_planner', 'community_board', 'price_checker', 'inventory_tracker', 'daily_target_tracker'],
    fisher:         ['cold_chain_tracker', 'route_planner', 'forecast_share', 'inventory_tracker', 'price_checker', 'quick_invoice', 'delivery_tracker', 'community_board'],
    agro_processor: ['quality_log', 'bulk_order_manager', 'inventory_tracker', 'compliance_checker', 'delivery_tracker', 'price_checker', 'analytics_report', 'staff_manager'],
    irrigation:     ['site_survey', 'maintenance_log', 'territory_map', 'technical_docs', 'safety_checklist', 'project_tracker', 'grant_tracker', 'community_connect'],
    seed_guardian:  ['conservation_log', 'document_vault', 'grant_tracker', 'publication_vault', 'inventory_tracker', 'community_board', 'alert_system', 'analytics_report'],
    rain_watcher:   ['forecast_share', 'alert_system', 'analytics_report', 'community_board', 'daily_target_tracker', 'territory_map', 'community_connect', 'report_generator'],
    farm_logistics: ['runner_dispatch', 'cold_chain_tracker', 'daily_settlement', 'route_planner', 'delivery_tracker', 'price_checker', 'bulk_order_manager', 'analytics_report'],
  },

  // ── WABET · Health Village ─────────────────────────────────────
  health: {
    doctor:           ['appointment_book', 'telemedicine', 'billing_dashboard', 'client_tracker', 'document_vault', 'report_generator', 'analytics_report', 'community_alert'],
    nurse:            ['queue_manager', 'client_tracker', 'community_alert', 'appointment_book', 'daily_target_tracker', 'outreach_planner', 'report_generator', 'alert_system'],
    herbalist:        ['inventory_tracker', 'community_board', 'document_vault', 'client_tracker', 'product_listing', 'review_tracker', 'quick_invoice', 'content_calendar'],
    community_health: ['territory_map', 'outreach_planner', 'alert_system', 'attendance_tracker', 'impact_tracker', 'community_connect', 'report_generator', 'daily_target_tracker'],
    pharmacist:       ['stock_tracker', 'price_checker', 'pos_dashboard', 'alert_system', 'daily_settlement', 'compliance_checker', 'inventory_tracker', 'daily_target_tracker'],
    mental_health:    ['telemedicine', 'appointment_book', 'report_generator', 'client_tracker', 'document_vault', 'billing_dashboard', 'analytics_report', 'community_connect'],
    lab_tech:         ['quality_log', 'document_vault', 'queue_manager', 'daily_target_tracker', 'inventory_tracker', 'compliance_checker', 'maintenance_log', 'report_generator'],
    midwife:          ['community_alert', 'territory_map', 'impact_tracker', 'analytics_report', 'grant_tracker', 'outreach_planner', 'report_generator', 'campaign_manager'],
  },

  // ── SANKORE · Education Village ────────────────────────────────
  education: {
    teacher:       ['attendance_tracker', 'content_calendar', 'report_generator', 'daily_target_tracker', 'community_board', 'project_tracker', 'client_tracker', 'alert_system'],
    lecturer:      ['publication_vault', 'grant_tracker', 'project_tracker', 'document_vault', 'client_tracker', 'appointment_book', 'analytics_report', 'content_calendar'],
    tutor:         ['appointment_book', 'billing_dashboard', 'review_tracker', 'document_vault', 'daily_target_tracker', 'content_calendar', 'community_connect', 'portfolio_vault'],
    school_admin:  ['staff_manager', 'daily_settlement', 'community_board', 'attendance_tracker', 'billing_dashboard', 'report_generator', 'alert_system', 'document_vault'],
    vocational:    ['project_tracker', 'quick_invoice', 'daily_target_tracker', 'attendance_tracker', 'maintenance_log', 'portfolio_vault', 'community_connect', 'review_tracker'],
    librarian:     ['document_vault', 'publication_vault', 'content_calendar', 'community_board', 'project_tracker', 'grant_tracker', 'analytics_report', 'report_generator'],
    edtech:        ['analytics_report', 'ticket_system', 'code_project', 'api_tester', 'client_tracker', 'content_calendar', 'project_tracker', 'community_board'],
    researcher:    ['publication_vault', 'grant_tracker', 'report_generator', 'document_vault', 'audit_report', 'community_board', 'content_calendar', 'analytics_report'],
  },

  // ── NOK · Arts Village ─────────────────────────────────────────
  arts: {
    musician:        ['portfolio_vault', 'content_calendar', 'payment_link', 'analytics_report', 'social_shop', 'review_tracker', 'document_vault', 'community_board'],
    visual_artist:   ['portfolio_vault', 'social_shop', 'design_brief', 'client_tracker', 'content_calendar', 'review_tracker', 'payment_link', 'analytics_report'],
    writer:          ['article_vault', 'publication_vault', 'content_calendar', 'community_board', 'review_tracker', 'payment_link', 'analytics_report', 'grant_tracker'],
    filmmaker:       ['project_tracker', 'portfolio_vault', 'billing_dashboard', 'document_vault', 'daily_target_tracker', 'content_calendar', 'analytics_report', 'community_board'],
    performer:       ['appointment_book', 'payment_link', 'review_tracker', 'content_calendar', 'portfolio_vault', 'community_board', 'social_shop', 'analytics_report'],
    craftsman:       ['inventory_tracker', 'social_shop', 'delivery_tracker', 'portfolio_vault', 'client_tracker', 'quick_invoice', 'review_tracker', 'product_listing'],
    fashion_designer:['design_brief', 'product_listing', 'client_tracker', 'portfolio_vault', 'social_shop', 'review_tracker', 'payment_link', 'content_calendar'],
    cultural:        ['community_board', 'grant_tracker', 'impact_tracker', 'content_calendar', 'attendance_tracker', 'outreach_planner', 'report_generator', 'publication_vault'],
  },

  // ── MEROE · Builders Village ───────────────────────────────────
  builders: {
    architect:      ['site_survey', 'project_tracker', 'technical_docs', 'document_vault', 'compliance_checker', 'client_tracker', 'billing_dashboard', 'portfolio_vault'],
    civil_eng:      ['safety_checklist', 'quality_log', 'maintenance_log', 'technical_docs', 'site_survey', 'project_tracker', 'compliance_checker', 'analytics_report'],
    mason:          ['work_order', 'daily_target_tracker', 'safety_checklist', 'inventory_tracker', 'quick_invoice', 'attendance_tracker', 'quality_log', 'maintenance_log'],
    electrician:    ['repair_queue', 'parts_finder', 'maintenance_log', 'safety_checklist', 'work_order', 'client_tracker', 'quick_invoice', 'compliance_checker'],
    plumber:        ['repair_queue', 'work_order', 'client_tracker', 'parts_finder', 'maintenance_log', 'safety_checklist', 'quick_invoice', 'review_tracker'],
    carpenter:      ['work_order', 'portfolio_vault', 'inventory_tracker', 'client_tracker', 'quick_invoice', 'review_tracker', 'parts_finder', 'daily_target_tracker'],
    surveyor:       ['site_survey', 'territory_map', 'technical_docs', 'document_vault', 'compliance_checker', 'project_tracker', 'analytics_report', 'report_generator'],
    heavy_machinery:['maintenance_log', 'fuel_tracker', 'safety_checklist', 'work_order', 'parts_finder', 'repair_queue', 'daily_target_tracker', 'compliance_checker'],
  },

  // ── INGA · Energy Village ──────────────────────────────────────
  energy: {
    solar_tech:      ['work_order', 'site_survey', 'parts_finder', 'safety_checklist', 'client_tracker', 'quick_invoice', 'maintenance_log', 'review_tracker'],
    electrical_eng:  ['infrastructure_log', 'safety_checklist', 'technical_docs', 'compliance_checker', 'project_tracker', 'quality_log', 'analytics_report', 'maintenance_log'],
    oil_gas:         ['safety_checklist', 'compliance_checker', 'fuel_tracker', 'technical_docs', 'project_tracker', 'analytics_report', 'audit_report', 'document_vault'],
    renewable:       ['project_tracker', 'grant_tracker', 'analytics_report', 'technical_docs', 'client_tracker', 'community_connect', 'report_generator', 'publication_vault'],
    utility:         ['billing_dashboard', 'infrastructure_log', 'alert_system', 'maintenance_log', 'route_planner', 'daily_target_tracker', 'compliance_checker', 'community_alert'],
    biogas:          ['quality_log', 'site_survey', 'community_connect', 'inventory_tracker', 'grant_tracker', 'project_tracker', 'technical_docs', 'analytics_report'],
    nuclear:         ['safety_checklist', 'compliance_checker', 'technical_docs', 'document_vault', 'audit_report', 'publication_vault', 'project_tracker', 'analytics_report'],
    mini_grid:       ['billing_dashboard', 'community_connect', 'alert_system', 'maintenance_log', 'inventory_tracker', 'daily_settlement', 'analytics_report', 'client_tracker'],
  },

  // ── KILWA · Transport Village ──────────────────────────────────
  transport: {
    driver:         ['daily_route', 'fuel_tracker', 'route_planner', 'safety_checklist', 'delivery_tracker', 'community_board', 'quick_invoice', 'alert_system'],
    logistics:      ['runner_dispatch', 'delivery_tracker', 'collection_tracker', 'bulk_order_manager', 'route_planner', 'client_tracker', 'analytics_report', 'daily_settlement'],
    mechanic:       ['repair_queue', 'parts_finder', 'maintenance_log', 'safety_checklist', 'work_order', 'client_tracker', 'quick_invoice', 'review_tracker'],
    pilot:          ['flight_log', 'safety_checklist', 'technical_docs', 'compliance_checker', 'maintenance_log', 'alert_system', 'document_vault', 'report_generator'],
    marine:         ['route_planner', 'safety_checklist', 'maintenance_log', 'fuel_tracker', 'alert_system', 'delivery_tracker', 'quick_invoice', 'community_board'],
    rail:           ['maintenance_log', 'safety_checklist', 'alert_system', 'route_planner', 'daily_target_tracker', 'fuel_tracker', 'compliance_checker', 'report_generator'],
    boda_boda:      ['daily_route', 'mobile_payment_collect', 'fuel_tracker', 'community_board', 'safety_checklist', 'quick_invoice', 'review_tracker', 'route_planner'],
    fleet_manager:  ['fuel_tracker', 'staff_manager', 'daily_settlement', 'maintenance_log', 'analytics_report', 'route_planner', 'compliance_checker', 'daily_target_tracker'],
  },

  // ── ALEXANDRIA · Technology Village ───────────────────────────
  technology: {
    developer:       ['code_project', 'api_tester', 'ticket_system', 'document_vault', 'daily_target_tracker', 'app_deploy_tracker', 'analytics_report', 'community_board'],
    data_scientist:  ['dataset_vault', 'analytics_report', 'publication_vault', 'document_vault', 'code_project', 'report_generator', 'community_board', 'grant_tracker'],
    cybersecurity:   ['remote_access_tool', 'backup_monitor', 'alert_system', 'audit_report', 'compliance_checker', 'document_vault', 'technical_docs', 'report_generator'],
    network_eng:     ['infrastructure_log', 'ticket_system', 'maintenance_log', 'technical_docs', 'alert_system', 'compliance_checker', 'analytics_report', 'report_generator'],
    mobile_dev:      ['code_project', 'app_deploy_tracker', 'api_tester', 'document_vault', 'review_tracker', 'analytics_report', 'community_board', 'portfolio_vault'],
    cloud_eng:       ['hosting_tracker', 'backup_monitor', 'infrastructure_log', 'billing_dashboard', 'alert_system', 'technical_docs', 'analytics_report', 'compliance_checker'],
    ux_designer:     ['design_brief', 'portfolio_vault', 'client_tracker', 'review_tracker', 'content_calendar', 'social_shop', 'analytics_report', 'community_board'],
    tech_support:    ['ticket_system', 'remote_access_tool', 'repair_queue', 'document_vault', 'alert_system', 'client_tracker', 'daily_target_tracker', 'report_generator'],
  },

  // ── TIMBUKTU · Media Village ───────────────────────────────────
  media: {
    journalist:    ['article_vault', 'content_calendar', 'publication_vault', 'document_vault', 'analytics_report', 'community_board', 'campaign_manager', 'outreach_planner'],
    broadcaster:   ['analytics_report', 'moderation_queue', 'portfolio_vault', 'content_calendar', 'community_board', 'booking_calendar', 'social_shop', 'review_tracker'],
    photographer:  ['portfolio_vault', 'social_shop', 'product_listing', 'client_tracker', 'quick_invoice', 'review_tracker', 'content_calendar', 'analytics_report'],
    social_media:  ['content_calendar', 'analytics_report', 'payment_link', 'portfolio_vault', 'review_tracker', 'social_shop', 'community_board', 'daily_target_tracker'],
    pr_officer:    ['campaign_manager', 'client_tracker', 'outreach_planner', 'portfolio_vault', 'analytics_report', 'document_vault', 'content_calendar', 'report_generator'],
    radio_host:    ['content_calendar', 'moderation_queue', 'community_board', 'document_vault', 'analytics_report', 'payment_link', 'review_tracker', 'daily_target_tracker'],
    video_editor:  ['project_tracker', 'portfolio_vault', 'client_tracker', 'quick_invoice', 'review_tracker', 'content_calendar', 'maintenance_log', 'analytics_report'],
    ad_creative:   ['design_brief', 'campaign_manager', 'analytics_report', 'client_tracker', 'portfolio_vault', 'content_calendar', 'quick_invoice', 'review_tracker'],
  },

  // ── SIJILMASA · Finance Village ────────────────────────────────
  finance: {
    banker:        ['transaction_log', 'daily_settlement', 'compliance_checker', 'audit_report', 'client_tracker', 'billing_dashboard', 'risk_calculator', 'document_vault'],
    investment:    ['analytics_report', 'risk_calculator', 'portfolio_vault', 'document_vault', 'publication_vault', 'report_generator', 'community_board', 'grant_tracker'],
    microfinance:  ['ajo_circle', 'credit_book', 'community_connect', 'impact_tracker', 'attendance_tracker', 'daily_settlement', 'report_generator', 'alert_system'],
    fintech:       ['api_tester', 'analytics_report', 'project_tracker', 'code_project', 'client_tracker', 'community_board', 'risk_calculator', 'compliance_checker'],
    accountant:    ['billing_dashboard', 'audit_report', 'compliance_checker', 'transaction_log', 'analytics_report', 'document_vault', 'report_generator', 'daily_settlement'],
    insurance:     ['risk_calculator', 'client_tracker', 'compliance_checker', 'document_vault', 'report_generator', 'billing_dashboard', 'analytics_report', 'alert_system'],
    tax_agent:     ['api_tester', 'transaction_log', 'compliance_checker', 'analytics_report', 'risk_calculator', 'code_project', 'community_board', 'alert_system'],
    ajo_keeper:    ['ajo_circle', 'transaction_log', 'community_connect', 'daily_settlement', 'client_tracker', 'alert_system', 'report_generator', 'quick_invoice'],
  },

  // ── GACACA · Justice Village ───────────────────────────────────
  justice: {
    lawyer:        ['case_log', 'document_vault', 'billing_dashboard', 'report_generator', 'client_tracker', 'compliance_checker', 'booking_calendar', 'analytics_report'],
    mediator:      ['appointment_book', 'client_tracker', 'community_connect', 'document_vault', 'case_log', 'report_generator', 'impact_tracker', 'community_board'],
    magistrate:    ['case_log', 'attendance_tracker', 'compliance_checker', 'document_vault', 'report_generator', 'booking_calendar', 'analytics_report', 'alert_system'],
    paralegal:     ['case_log', 'document_vault', 'compliance_checker', 'audit_report', 'client_tracker', 'quick_invoice', 'billing_dashboard', 'report_generator'],
    human_rights:  ['impact_tracker', 'grant_tracker', 'campaign_manager', 'community_board', 'outreach_planner', 'publication_vault', 'alert_system', 'report_generator'],
    notary:        ['document_vault', 'compliance_checker', 'billing_dashboard', 'client_tracker', 'appointment_book', 'queue_manager', 'quick_invoice', 'daily_settlement'],
    traditional:   ['community_board', 'case_log', 'alert_system', 'community_connect', 'document_vault', 'impact_tracker', 'report_generator', 'outreach_planner'],
    prison_reform: ['impact_tracker', 'outreach_planner', 'grant_tracker', 'community_connect', 'community_board', 'analytics_report', 'report_generator', 'alert_system'],
  },

  // ── AKSUM · Government Village ─────────────────────────────────
  government: {
    civil_servant: ['document_vault', 'compliance_checker', 'report_generator', 'queue_manager', 'daily_target_tracker', 'attendance_tracker', 'alert_system', 'community_board'],
    legislator:    ['campaign_manager', 'community_board', 'analytics_report', 'outreach_planner', 'report_generator', 'impact_tracker', 'community_connect', 'document_vault'],
    diplomat:      ['document_vault', 'community_connect', 'outreach_planner', 'audit_report', 'booking_calendar', 'report_generator', 'analytics_report', 'publication_vault'],
    urban_planner: ['site_survey', 'territory_map', 'technical_docs', 'project_tracker', 'analytics_report', 'community_connect', 'grant_tracker', 'report_generator'],
    tax_collector: ['transaction_log', 'billing_dashboard', 'compliance_checker', 'territory_map', 'daily_settlement', 'alert_system', 'report_generator', 'analytics_report'],
    registrar:     ['document_vault', 'queue_manager', 'billing_dashboard', 'compliance_checker', 'client_tracker', 'daily_target_tracker', 'alert_system', 'report_generator'],
    policy:        ['analytics_report', 'publication_vault', 'grant_tracker', 'document_vault', 'report_generator', 'community_board', 'audit_report', 'impact_tracker'],
    elections:     ['territory_map', 'community_alert', 'compliance_checker', 'attendance_tracker', 'report_generator', 'document_vault', 'alert_system', 'analytics_report'],
  },

  // ── AGOJIE · Security Village ──────────────────────────────────
  security: {
    officer:        ['territory_map', 'alert_system', 'community_alert', 'document_vault', 'report_generator', 'compliance_checker', 'daily_target_tracker', 'route_planner'],
    cybersec:       ['remote_access_tool', 'backup_monitor', 'compliance_checker', 'audit_report', 'document_vault', 'technical_docs', 'alert_system', 'analytics_report'],
    fire_safety:    ['safety_checklist', 'alert_system', 'maintenance_log', 'quality_log', 'territory_map', 'document_vault', 'report_generator', 'community_alert'],
    private_sec:    ['territory_map', 'client_tracker', 'quick_invoice', 'daily_target_tracker', 'safety_checklist', 'document_vault', 'route_planner', 'review_tracker'],
    border:         ['territory_map', 'compliance_checker', 'alert_system', 'document_vault', 'audit_report', 'daily_target_tracker', 'report_generator', 'community_alert'],
    forensic:       ['document_vault', 'case_log', 'quality_log', 'audit_report', 'compliance_checker', 'report_generator', 'analytics_report', 'alert_system'],
    community_watch:['community_alert', 'territory_map', 'community_connect', 'alert_system', 'document_vault', 'daily_target_tracker', 'report_generator', 'outreach_planner'],
    disaster:       ['alert_system', 'community_alert', 'safety_checklist', 'territory_map', 'document_vault', 'inventory_tracker', 'analytics_report', 'report_generator'],
  },

  // ── KARNAK · Spirituality Village ─────────────────────────────
  spirituality: {
    imam:              ['community_board', 'attendance_tracker', 'outreach_planner', 'content_calendar', 'booking_calendar', 'community_connect', 'alert_system', 'report_generator'],
    pastor:            ['community_board', 'community_connect', 'billing_dashboard', 'attendance_tracker', 'outreach_planner', 'content_calendar', 'impact_tracker', 'alert_system'],
    traditional_priest:['community_board', 'conservation_log', 'content_calendar', 'document_vault', 'community_connect', 'publication_vault', 'alert_system', 'outreach_planner'],
    counselor:         ['appointment_book', 'client_tracker', 'report_generator', 'document_vault', 'community_board', 'community_connect', 'content_calendar', 'billing_dashboard'],
    healer:            ['inventory_tracker', 'quick_invoice', 'review_tracker', 'appointment_book', 'client_tracker', 'social_shop', 'product_listing', 'community_board'],
    meditation:        ['appointment_book', 'content_calendar', 'payment_link', 'review_tracker', 'community_board', 'analytics_report', 'portfolio_vault', 'social_shop'],
    charity:           ['grant_tracker', 'impact_tracker', 'campaign_manager', 'community_connect', 'community_board', 'outreach_planner', 'report_generator', 'billing_dashboard'],
    funeral:           ['appointment_book', 'document_vault', 'billing_dashboard', 'client_tracker', 'inventory_tracker', 'compliance_checker', 'quick_invoice', 'route_planner'],
  },

  // ── BIDA · Fashion Village ─────────────────────────────────────
  fashion: {
    designer:  ['design_brief', 'portfolio_vault', 'product_listing', 'client_tracker', 'social_shop', 'review_tracker', 'payment_link', 'content_calendar'],
    tailor:    ['client_tracker', 'appointment_book', 'review_tracker', 'quick_invoice', 'inventory_tracker', 'daily_target_tracker', 'social_shop', 'billing_dashboard'],
    model:     ['portfolio_vault', 'social_shop', 'content_calendar', 'payment_link', 'booking_calendar', 'review_tracker', 'analytics_report', 'community_board'],
    stylist:   ['appointment_book', 'client_tracker', 'social_shop', 'quick_invoice', 'inventory_tracker', 'review_tracker', 'pos_dashboard', 'daily_target_tracker'],
    textile:   ['inventory_tracker', 'bulk_order_manager', 'delivery_tracker', 'price_checker', 'quick_invoice', 'social_shop', 'product_listing', 'analytics_report'],
    beauty:    ['appointment_book', 'inventory_tracker', 'pos_dashboard', 'client_tracker', 'review_tracker', 'social_shop', 'quick_invoice', 'daily_target_tracker'],
    shoe_maker:['product_listing', 'social_shop', 'value_calculator', 'portfolio_vault', 'quick_invoice', 'client_tracker', 'review_tracker', 'inventory_tracker'],
    jewelry:   ['inventory_tracker', 'social_shop', 'value_calculator', 'portfolio_vault', 'product_listing', 'quick_invoice', 'client_tracker', 'review_tracker'],
  },

  // ── UBUNTU · Family Village ────────────────────────────────────
  family: {
    elder:        ['community_board', 'document_vault', 'alert_system', 'community_connect', 'daily_settlement', 'outreach_planner', 'impact_tracker', 'report_generator'],
    marriage:     ['appointment_book', 'document_vault', 'community_connect', 'client_tracker', 'billing_dashboard', 'review_tracker', 'quick_invoice', 'community_board'],
    child_care:   ['client_tracker', 'alert_system', 'attendance_tracker', 'report_generator', 'community_connect', 'impact_tracker', 'outreach_planner', 'case_log'],
    genealogist:  ['document_vault', 'publication_vault', 'portfolio_vault', 'audit_report', 'project_tracker', 'community_board', 'analytics_report', 'report_generator'],
    mediator:     ['appointment_book', 'client_tracker', 'community_connect', 'document_vault', 'case_log', 'report_generator', 'impact_tracker', 'community_board'],
    adoption:     ['document_vault', 'compliance_checker', 'report_generator', 'client_tracker', 'case_log', 'alert_system', 'community_connect', 'queue_manager'],
    homemaker:    ['daily_target_tracker', 'inventory_tracker', 'price_checker', 'community_board', 'quick_invoice', 'community_connect', 'alert_system', 'billing_dashboard'],
    youth_mentor: ['community_board', 'attendance_tracker', 'outreach_planner', 'impact_tracker', 'community_connect', 'content_calendar', 'report_generator', 'daily_target_tracker'],
  },

  // ── TERANGA · Hospitality Village ─────────────────────────────
  hospitality: {
    hotel_manager: ['booking_calendar', 'staff_manager', 'daily_settlement', 'quality_log', 'review_tracker', 'analytics_report', 'alert_system', 'community_board'],
    chef:          ['daily_menu_board', 'quality_log', 'staff_manager', 'inventory_tracker', 'quick_invoice', 'pos_dashboard', 'review_tracker', 'daily_target_tracker'],
    tour_guide:    ['appointment_book', 'route_planner', 'review_tracker', 'quick_invoice', 'content_calendar', 'portfolio_vault', 'community_board', 'analytics_report'],
    event_planner: ['project_tracker', 'booking_calendar', 'client_tracker', 'staff_manager', 'billing_dashboard', 'supplier_connect', 'analytics_report', 'community_board'],
    bartender:     ['daily_menu_board', 'inventory_tracker', 'pos_dashboard', 'quick_invoice', 'review_tracker', 'daily_target_tracker', 'community_board', 'analytics_report'],
    travel_agent:  ['booking_calendar', 'route_planner', 'payment_link', 'client_tracker', 'review_tracker', 'quick_invoice', 'analytics_report', 'community_board'],
    resort_manage: ['booking_calendar', 'staff_manager', 'maintenance_log', 'quality_log', 'billing_dashboard', 'analytics_report', 'alert_system', 'review_tracker'],
    camp_host:     ['booking_calendar', 'safety_checklist', 'territory_map', 'inventory_tracker', 'quick_invoice', 'review_tracker', 'community_board', 'daily_target_tracker'],
  },

  // ── NANDI · Sports Village ─────────────────────────────────────
  sports: {
    athlete:      ['content_calendar', 'portfolio_vault', 'payment_link', 'analytics_report', 'community_board', 'social_shop', 'booking_calendar', 'review_tracker'],
    coach:        ['attendance_tracker', 'client_tracker', 'report_generator', 'daily_target_tracker', 'analytics_report', 'community_board', 'appointment_book', 'billing_dashboard'],
    referee:      ['attendance_tracker', 'compliance_checker', 'alert_system', 'report_generator', 'daily_target_tracker', 'community_board', 'analytics_report', 'document_vault'],
    gym_owner:    ['booking_calendar', 'staff_manager', 'pos_dashboard', 'maintenance_log', 'analytics_report', 'review_tracker', 'community_board', 'daily_settlement'],
    scout:        ['client_tracker', 'portfolio_vault', 'analytics_report', 'report_generator', 'community_board', 'outreach_planner', 'booking_calendar', 'payment_link'],
    physio:       ['appointment_book', 'client_tracker', 'report_generator', 'daily_target_tracker', 'analytics_report', 'community_board', 'document_vault', 'billing_dashboard'],
    esports:      ['tournament_manager', 'analytics_report', 'community_board', 'payment_link', 'content_calendar', 'portfolio_vault', 'social_shop', 'review_tracker'],
    sports_media: ['content_calendar', 'article_vault', 'analytics_report', 'publication_vault', 'community_board', 'document_vault', 'outreach_planner', 'report_generator'],
  },

  // ── ADULIS · Holdings Village (The Gate) ──────────────────────
  holdings: {
    explorer:          ['analytics_report', 'community_board', 'daily_target_tracker', 'portfolio_vault', 'risk_calculator', 'outreach_planner', 'community_connect', 'content_calendar'],
    career_changer:    ['project_tracker', 'document_vault', 'outreach_planner', 'portfolio_vault', 'community_board', 'analytics_report', 'appointment_book', 'daily_target_tracker'],
    new_graduate:      ['portfolio_vault', 'community_board', 'daily_target_tracker', 'outreach_planner', 'content_calendar', 'analytics_report', 'appointment_book', 'community_connect'],
    entrepreneur:      ['risk_calculator', 'project_tracker', 'billing_dashboard', 'community_board', 'analytics_report', 'community_connect', 'outreach_planner', 'daily_target_tracker'],
    volunteer:         ['community_connect', 'impact_tracker', 'outreach_planner', 'community_board', 'attendance_tracker', 'report_generator', 'alert_system', 'daily_target_tracker'],
    multi_skilled:     ['analytics_report', 'portfolio_vault', 'community_board', 'daily_target_tracker', 'outreach_planner', 'content_calendar', 'community_connect', 'quick_invoice'],
    navigator:         ['analytics_report', 'risk_calculator', 'portfolio_vault', 'community_board', 'daily_target_tracker', 'outreach_planner', 'route_planner', 'community_connect'],
    returning_citizen: ['document_vault', 'community_connect', 'outreach_planner', 'community_board', 'portfolio_vault', 'daily_target_tracker', 'alert_system', 'report_generator'],
  },
}
