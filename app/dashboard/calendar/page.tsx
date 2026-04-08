'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useVillageStore } from '@/stores/villageStore'
import { VILLAGE_MAP } from '@/constants/villages'
import { buildTodaySchedule, getLiveSlots, TIER_META, type TVSlot } from '@/lib/tv-schedule'

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

type CalView = 'month' | 'moon' | 'village' | 'family' | 'griot' | 'tv'
type EventType = 'personal' | 'family' | 'village' | 'cultural' | 'business' | 'post' | 'ancestor' | 'ai'
type RepeatCycle = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'moon' | 'market'

interface CalEvent {
  id: string
  title: string
  date: string     // 'YYYY-MM-DD'
  time?: string    // 'HH:MM'
  endTime?: string
  type: EventType
  skin: 'ise' | 'egbe' | 'idile' | 'all'
  villageId?: string
  toolKey?: string
  familyMemberId?: string
  note?: string
  repeat: RepeatCycle
  aiSuggested?: boolean
  orishaSpirit?: string
  geoScope?: 'village' | 'state' | 'country' | 'continent' | 'global'
  cowrieAmount?: number
}

interface FamilyMember {
  id: string; name: string; kinship: string; emoji: string
  birthday?: string; isDeceased?: boolean; namingDay?: string
}

// ─────────────────────────────────────────────────────────────
//  AFRICAN CONSTANTS
// ─────────────────────────────────────────────────────────────

// Igbo 4-day market week (known anchor: Jan 1 2026 = Eke day index 0)
const IGBO_MARKET_DAYS = ['Eke', 'Orie', 'Afo', 'Nkwo'] as const
const IGBO_MARKET_COLORS = ['#e07b00', '#1a7c3e', '#8b5cf6', '#ef4444'] as const
const ANCHOR_DATE = new Date('2026-01-01')

function getMarketDay(dateStr: string) {
  const d = new Date(dateStr)
  const diff = Math.floor((d.getTime() - ANCHOR_DATE.getTime()) / 86400000)
  const idx = ((diff % 4) + 4) % 4
  return { name: IGBO_MARKET_DAYS[idx], color: IGBO_MARKET_COLORS[idx], idx }
}

// Moon phase calculation (simple approximation)
// Known new moon: Jan 29, 2026
const KNOWN_NEW_MOON = new Date('2026-01-29').getTime()
const LUNAR_CYCLE = 29.53058867 * 24 * 60 * 60 * 1000

function getMoonPhase(dateStr: string): { emoji: string; name: string; pct: number } {
  const d = new Date(dateStr).getTime()
  const elapsed = ((d - KNOWN_NEW_MOON) % LUNAR_CYCLE + LUNAR_CYCLE) % LUNAR_CYCLE
  const pct = elapsed / LUNAR_CYCLE
  if (pct < 0.03 || pct > 0.97)  return { emoji: '🌑', name: 'New Moon · Oṣùpá Tuntun', pct }
  if (pct < 0.22)                 return { emoji: '🌒', name: 'Waxing Crescent · Ìmọ̀lẹ̀ Jíjẹ', pct }
  if (pct < 0.28)                 return { emoji: '🌓', name: 'First Quarter · Idajì Àkọ́kọ́', pct }
  if (pct < 0.47)                 return { emoji: '🌔', name: 'Waxing Gibbous · Ìmọ̀lẹ̀ Pípọ̀', pct }
  if (pct < 0.53)                 return { emoji: '🌕', name: 'Full Moon · Oṣùpá Kíkún', pct }
  if (pct < 0.72)                 return { emoji: '🌖', name: 'Waning Gibbous · Ìdinku Bẹ̀rẹ̀', pct }
  if (pct < 0.78)                 return { emoji: '🌗', name: 'Last Quarter · Idajì Ìkẹyìn', pct }
  return                                  { emoji: '🌘', name: 'Waning Crescent · Ìrọlẹ Oṣùpá', pct }
}

function isMoonMilestone(dateStr: string): boolean {
  const { pct } = getMoonPhase(dateStr)
  return pct < 0.05 || pct > 0.95 || Math.abs(pct - 0.5) < 0.03 ||
         Math.abs(pct - 0.25) < 0.03 || Math.abs(pct - 0.75) < 0.03
}

// Pan-African cultural calendar (M-D keys)
const CULTURAL_FESTIVALS: Record<string, { name: string; yoruba: string; emoji: string; color: string; desc: string }> = {
  '01-01': { name: 'African Founders Day', yoruba: 'Ọdún Tuntun', emoji: '🌍', color: '#1a7c3e', desc: 'Pan-African new year & founders celebration' },
  '01-07': { name: 'Timket', yoruba: 'Ìmọtara Omi', emoji: '💧', color: '#3b82f6', desc: 'Ethiopian Epiphany — blessing of waters' },
  '01-15': { name: 'Martin Luther King Day', yoruba: 'Ọjọ Ọdọdó', emoji: '✊', color: '#8b5cf6', desc: 'African diaspora liberation remembrance' },
  '02-02': { name: 'Imbolc / Purification', yoruba: 'Ọjọ Ìsọ́di', emoji: '🕯', color: '#fbbf24', desc: 'North African spring purification rites' },
  '03-20': { name: 'Spring Equinox · Osun Begins', yoruba: 'Ìbẹ̀rẹ̀ Ọ̀sún', emoji: '🌸', color: '#ec4899', desc: 'Osun river goddess purification season opens' },
  '03-21': { name: 'Human Rights Day (SA)', yoruba: 'Ọjọ Ẹ̀tọ́ Ènìyàn', emoji: '🕊', color: '#ef4444', desc: 'Sharpeville massacre remembrance, South Africa' },
  '04-18': { name: 'Africa Heritage Day', yoruba: 'Ọjọ Ìnápadà', emoji: '🏺', color: '#e07b00', desc: 'Celebrating roots across the continent' },
  '05-25': { name: 'Africa Day · OAU', yoruba: 'Ọjọ Àforítì', emoji: '✊', color: '#1a7c3e', desc: 'Foundation of the Organisation of African Unity, 1963' },
  '06-16': { name: 'Soweto Youth Uprising', yoruba: 'Ọjọ Ọ̀dọ́', emoji: '✊', color: '#ef4444', desc: 'Pan-African youth resistance remembrance, 1976' },
  '06-21': { name: 'Solstice · Griot Night', yoruba: 'Òru Àlọ́', emoji: '🌙', color: '#9333ea', desc: 'The Night of Long Stories — Griot storytelling season' },
  '07-04': { name: 'Homowo Festival', yoruba: 'Ìdájọ́ Ebi', emoji: '🌽', color: '#d4a017', desc: 'Ga people (Ghana) — "Hooting at hunger", harvest feast' },
  '07-25': { name: 'Karibu Jamii Day', yoruba: 'Ọjọ Àbẹ̀wò', emoji: '🤝', color: '#1a7c3e', desc: 'Pan-African hospitality and community day' },
  '08-09': { name: 'Indigenous Peoples Day', yoruba: 'Ọjọ Ìbẹ̀rẹ̀', emoji: '🌿', color: '#4ade80', desc: 'World Indigenous Peoples — honouring African roots' },
  '08-15': { name: 'Osun-Osogbo Festival', yoruba: 'Ẹ̀sìn Ọ̀sún', emoji: '🌊', color: '#fbbf24', desc: 'Yoruba sacred river festival — UNESCO heritage' },
  '09-21': { name: 'Harvest Moon · Kumbuka', yoruba: 'Oṣùpá Ikore', emoji: '🌾', color: '#e07b00', desc: 'First harvest remembrance and thanksgiving' },
  '10-11': { name: 'African Women Day', yoruba: 'Ọjọ Obìnrin Áfríkà', emoji: '👑', color: '#ec4899', desc: 'Celebrating African women in leadership' },
  '11-01': { name: 'Ancestor Month Begins', yoruba: 'Oṣù Àwọn Baba', emoji: '🕯', color: '#6b7280', desc: 'Ubuntu ancestor veneration month opens' },
  '12-26': { name: 'Kwanzaa Begins', yoruba: 'Ọjọ Àkọ́kọ́ Kwanzaa', emoji: '🕯', color: '#4ade80', desc: '7 principles of African heritage — Umoja (Unity)' },
}

// Orisha AI spirits for calendar suggestions
const ORISHA_SPIRITS = {
  Obatala:  { color: '#e0e0ff', emoji: '🤍', domain: 'Creation & Clarity', bg: '#1e1e3f' },
  Ogun:     { color: '#4ade80', emoji: '⚒',  domain: 'Work & Iron',        bg: '#0a2a1a' },
  Shango:   { color: '#ff6b6b', emoji: '⚡',  domain: 'Justice & Thunder',  bg: '#2a0a0a' },
  Oshun:    { color: '#fde68a', emoji: '🌊', domain: 'Wealth & Beauty',    bg: '#2a2000' },
  Esu:      { color: '#c084fc', emoji: '🔀', domain: 'Crossroads & Chance',bg: '#1a0a2a' },
}

// Type labels & colors
const EVENT_META: Record<EventType, { icon: string; label: string; color: string; ring: string }> = {
  personal:  { icon: '👤', label: 'Personal',        color: '#3b82f6', ring: '#1d4ed8' },
  family:    { icon: '🌳', label: 'Ìdílé · Family',  color: '#1a7c3e', ring: '#166534' },
  village:   { icon: '🏘', label: 'Village Pulse',   color: '#e07b00', ring: '#b45309' },
  cultural:  { icon: '🌍', label: 'Culture · Àṣà',   color: '#9333ea', ring: '#7c3aed' },
  business:  { icon: '💼', label: 'Ìṣẹ́ · Business',  color: '#0891b2', ring: '#0e7490' },
  post:      { icon: '🥁', label: 'Drum · Scheduled', color: '#ec4899', ring: '#be185d' },
  ancestor:  { icon: '🕯', label: 'Àwọn Baba',       color: '#6b7280', ring: '#4b5563' },
  ai:        { icon: '🦅', label: 'Griot Suggests',  color: '#fbbf24', ring: '#d97706' },
}

// Moon phase activities/recommendations
const MOON_ACTIVITIES: Record<string, string[]> = {
  '🌑': ['Begin new business sessions', 'Plant intentions in Ìdílé chat', 'Ideal for launching new tools', 'Set Cowrie earning goals'],
  '🌒': ['Build momentum — reach out to new connections', 'Draft market listings', 'Approach elders for guidance'],
  '🌓': ['Negotiate trade deals', 'Hold village community sessions', 'Great day for tool sessions: price_checker, buyer_scout'],
  '🌔': ['Finalise contracts and trust agreements', 'Post voice stories — energy is rising', 'Family council meetings'],
  '🌕': ['Full community gathering — Nation Square', 'Launch live streams on Jollof TV', 'Send Cowrie to family roots', 'Ancestors are listening'],
  '🌖': ['Review and complete open trade sessions', 'Settle disputes through the Elder Circle', 'Harvest payments due'],
  '🌗': ['Release unprofitable sessions', 'Archive seasonal market data', 'Prepare next season plans'],
  '🌘': ['Rest, reflect, consult your Griot', 'Tend to family tree — add new members', 'Cleanse your Cowrie Flow goals'],
}

// ─────────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────────

function today() {
  return '2026-04-08'
}

function dateOffset(days: number) {
  const d = new Date('2026-04-08T00:00:00Z')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Family members (initially empty -- fetched from family-service backend)
const INITIAL_FAMILY: FamilyMember[] = []

const INITIAL_EVENTS: CalEvent[] = [
  { id: 'e1',  title: 'Commerce Village Market Day',       date: dateOffset(0),  time: '09:00', type: 'village',   skin: 'ise',   repeat: 'market',  villageId: 'commerce',  orishaSpirit: 'Oshun' },
  { id: 'e2',  title: 'Bàbá Emmanuel Birthday 🎂',          date: '2026-04-15',    type: 'family',    skin: 'idile',  repeat: 'yearly',  familyMemberId: 'f1' },
  { id: 'e3',  title: 'Àgbà Cornelius Remembrance 🕯',       date: dateOffset(5),   type: 'ancestor',  skin: 'idile',  repeat: 'yearly',  familyMemberId: 'f4', note: 'Light a candle. Speak his name.' },
  { id: 'e4',  title: 'Trade Session — Fabric Wholesale',   date: dateOffset(2),  time: '10:00', type: 'business',  skin: 'ise',   repeat: 'none',    toolKey: 'buyer_scout', cowrieAmount: 4500 },
  { id: 'e5',  title: 'Post: Harvest Season Thread',        date: dateOffset(1),  time: '08:00', type: 'post',      skin: 'egbe',  repeat: 'none',    note: 'Schedule drum to Commerce Village' },
  { id: 'e6',  title: 'Family Tree Council — Zoom',         date: dateOffset(3),  time: '19:00', type: 'family',    skin: 'idile', repeat: 'monthly', note: 'All Tier 1 Ẹjẹ members invited' },
  { id: 'e7',  title: 'Damilola Naming Ceremony 🌟',         date: dateOffset(22), time: '10:00', type: 'family',    skin: 'idile', repeat: 'none',    familyMemberId: 'f6', orishaSpirit: 'Obatala' },
  { id: 'e8',  title: 'Health Village Tool Session',        date: dateOffset(4),  time: '14:00', type: 'business',  skin: 'ise',   repeat: 'weekly',  villageId: 'health', toolKey: 'symptom_checker' },
  { id: 'e9',  title: '🦅 Griot: Best Day to Launch Post',  date: dateOffset(1),  type: 'ai',        skin: 'all',   repeat: 'none', aiSuggested: true, orishaSpirit: 'Esu',  note: 'Esu says: crossroads are open — high engagement expected' },
  { id: 'e10', title: 'Osun-Osogbo Festival',               date: '2026-08-15',    type: 'cultural',  skin: 'egbe',  repeat: 'yearly', orishaSpirit: 'Oshun', geoScope: 'global' },
  { id: 'e11', title: 'Africa Day Celebration',             date: '2026-05-25',    type: 'cultural',  skin: 'all',   repeat: 'yearly', geoScope: 'global' },
  { id: 'e12', title: 'Cowrie Goal Review',                 date: dateOffset(6),  time: '08:00', type: 'personal',  skin: 'ise',   repeat: 'weekly',  note: 'Review weekly Cowrie Flow targets', orishaSpirit: 'Oshun' },
  { id: 'e13', title: '🦅 Ogun: Forge New Partnership',     date: dateOffset(7),  type: 'ai',        skin: 'ise',   repeat: 'none', aiSuggested: true, orishaSpirit: 'Ogun', note: 'Ogun sees iron in the fire — meet your builders alliance now' },
  { id: 'e14', title: 'Village Drum — Weekly Strategy',     date: dateOffset(0),  time: '07:00', type: 'village',   skin: 'ise',   repeat: 'weekly',  villageId: 'commerce' },
  { id: 'e15', title: 'Ìyá Grace Birthday 🎂',              date: '2026-07-22',    type: 'family',    skin: 'idile', repeat: 'yearly', familyMemberId: 'f2' },
]

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

function buildCalendarGrid(year: number, month: number): { date: string; inMonth: boolean }[] {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid: { date: string; inMonth: boolean }[] = []

  // Pad from previous month
  const prevMonth = new Date(year, month, 0)
  const prevDays = prevMonth.getDate()
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i
    const dt = new Date(year, month - 1, d)
    grid.push({ date: dt.toISOString().slice(0, 10), inMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d)
    grid.push({ date: dt.toISOString().slice(0, 10), inMonth: true })
  }

  // Pad to complete last row (6 rows = 42 cells)
  let next = 1
  while (grid.length < 42) {
    const dt = new Date(year, month + 1, next++)
    grid.push({ date: dt.toISOString().slice(0, 10), inMonth: false })
  }
  return grid
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtMonthYear(year: number, month: number) {
  return new Date(year, month).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
}

const MD_RE = /^\d{4}-(\d{2}-\d{2})$/
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ─────────────────────────────────────────────────────────────
//  CSS INJECTION
// ─────────────────────────────────────────────────────────────

const INJECT_ID = 'afro-cal-styles'
const STYLES = `
.cal-page { min-height:100vh; background:#0a0a0f; color:#f5f5f0; font-family:system-ui,sans-serif; padding-bottom:90px; }
.cal-header { background:linear-gradient(180deg,#111118 0%,#0a0a0f 100%); padding:16px 16px 0; }
.cal-nav-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.cal-month-btn { background:none; border:none; color:#a0a0b0; font-size:22px; cursor:pointer; padding:6px 12px; }
.cal-month-title { color:#f5f5f0; font-size:18px; font-weight:700; }
.cal-view-tabs { display:flex; gap:4px; overflow-x:auto; padding-bottom:0; scrollbar-width:none; }
.cal-view-tabs::-webkit-scrollbar { display:none; }
.cal-tab { background:#18181f; border:1px solid #28283a; color:#a0a0b0; padding:8px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; transition:all .2s; }
.cal-tab.active { color:#f5f5f0; border-color:var(--vcol,#e07b00); background:rgba(var(--vcol-r,224),var(--vcol-g,123),var(--vcol-b,0),0.15); }
.cal-dow { display:grid; grid-template-columns:repeat(7,1fr); background:#0f0f16; padding:6px 8px; gap:2px; }
.cal-dow-cell { text-align:center; font-size:10px; font-weight:700; color:#6b7280; padding:4px 0; }
.cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; padding:4px 8px 0; background:#0a0a0f; }
.cal-day { background:#12121a; border-radius:8px; padding:4px; min-height:72px; cursor:pointer; position:relative; border:1px solid transparent; transition:all .15s; }
.cal-day:hover { border-color:#28283a; }
.cal-day.not-in-month { opacity:.35; }
.cal-day.is-today { border-color:var(--vcol,#e07b00) !important; background:rgba(224,123,0,.06); }
.cal-day.selected { border-color:#a0a0b0; }
.cal-day-num { font-size:13px; font-weight:700; color:#d0d0e0; margin-bottom:2px; }
.cal-day.is-today .cal-day-num { color:var(--vcol,#e07b00); }
.cal-market-badge { font-size:8px; font-weight:800; border-radius:3px; padding:1px 4px; display:inline-block; margin-bottom:2px; }
.cal-moon { font-size:11px; position:absolute; top:4px; right:4px; line-height:1; }
.cal-dots { display:flex; flex-wrap:wrap; gap:2px; margin-top:2px; }
.cal-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.cal-fest-badge { font-size:7px; font-weight:700; color:#fff; background:rgba(147,51,234,.6); border-radius:3px; padding:1px 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; margin-top:2px; }
.cal-section { padding:12px 16px; }
.cal-section-title { font-size:13px; font-weight:700; color:#a0a0b0; text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }
.ev-card { background:#13131b; border-radius:12px; padding:12px 14px; margin-bottom:8px; border-left:3px solid; display:flex; align-items:flex-start; gap:12px; cursor:pointer; transition:background .15s; }
.ev-card:hover { background:#1a1a24; }
.ev-icon { font-size:22px; flex-shrink:0; margin-top:2px; }
.ev-title { font-size:14px; font-weight:700; color:#e8e8f0; margin-bottom:3px; }
.ev-meta { font-size:11px; color:#7b7b90; display:flex; flex-wrap:wrap; gap:8px; }
.ev-badge { font-size:10px; font-weight:700; border-radius:20px; padding:2px 8px; display:inline-block; }
.orisha-chip { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; display:inline-flex; align-items:center; gap:4px; }
.fab { position:fixed; bottom:80px; right:20px; z-index:50; width:52px; height:52px; border-radius:50%; border:none; font-size:22px; cursor:pointer; box-shadow:0 4px 20px rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; transition:transform .15s; }
.fab:hover { transform:scale(1.08); }
.drawer { position:fixed; inset:0; z-index:100; display:flex; flex-direction:column; justify-content:flex-end; }
.drawer-bg { position:absolute; inset:0; background:rgba(0,0,0,.7); }
.drawer-panel { position:relative; background:#13131b; border-radius:20px 20px 0 0; max-height:92vh; overflow-y:auto; padding:20px; padding-bottom:40px; }
.drawer-handle { width:40px; height:4px; background:#28283a; border-radius:4px; margin:0 auto 16px; }
.drawer-title { font-size:18px; font-weight:800; color:#f5f5f0; margin-bottom:4px; }
.drawer-sub { font-size:12px; color:#7b7b90; margin-bottom:16px; }
.field-label { font-size:11px; font-weight:700; color:#a0a0b0; margin-bottom:6px; margin-top:12px; }
.field-input { width:100%; background:#1e1e2a; border:1px solid #28283a; border-radius:10px; color:#f5f5f0; padding:10px 12px; font-size:14px; outline:none; box-sizing:border-box; }
.field-input:focus { border-color:#e07b00; }
.seg { display:grid; gap:6px; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); }
.seg-btn { background:#1e1e2a; border:1px solid #28283a; color:#a0a0b0; border-radius:8px; padding:8px 4px; font-size:11px; font-weight:700; cursor:pointer; text-align:center; transition:all .15s; }
.seg-btn.sel { color:#f5f5f0; border-color:var(--vcol,#e07b00); background:rgba(224,123,0,.15); }
.btn-primary { width:100%; background:var(--vcol,#e07b00); color:#fff; border:none; border-radius:12px; padding:14px; font-size:15px; font-weight:800; cursor:pointer; margin-top:16px; transition:opacity .15s; }
.btn-primary:hover { opacity:.9; }
.btn-secondary { background:#1e1e2a; border:1px solid #28283a; color:#d0d0e0; border-radius:10px; padding:10px 20px; font-size:13px; font-weight:700; cursor:pointer; transition:background .15s; }
.btn-secondary:hover { background:#28283a; }
.moon-view { padding:16px; }
.moon-big { text-align:center; font-size:80px; margin:16px 0 8px; }
.moon-name { text-align:center; font-size:16px; font-weight:800; color:#f5f5f0; margin-bottom:4px; }
.moon-sub { text-align:center; font-size:12px; color:#7b7b90; margin-bottom:20px; }
.moon-act-list { list-style:none; padding:0; margin:0; }
.moon-act-list li { background:#13131b; border-radius:10px; padding:10px 14px; margin-bottom:8px; font-size:13px; color:#d0d0e0; display:flex; align-items:center; gap:10px; }
.moon-strip { display:flex; gap:4px; margin:16px 0; overflow-x:auto; padding-bottom:4px; }
.moon-strip::-webkit-scrollbar { display:none; }
.moon-strip-day { display:flex; flex-direction:column; align-items:center; gap:2px; flex-shrink:0; cursor:pointer; padding:6px; border-radius:8px; transition:background .15s; }
.moon-strip-day:hover { background:#1a1a24; }
.moon-strip-day .ms-emoji { font-size:16px; }
.moon-strip-day .ms-date { font-size:9px; color:#6b7280; }
.griot-card { background:linear-gradient(135deg,#1a0a2a 0%,#0d1a2a 100%); border-radius:16px; padding:16px; margin-bottom:12px; border:1px solid #2a1a4a; }
.griot-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.griot-img { font-size:24px; }
.griot-name { font-size:14px; font-weight:800; }
.griot-domain { font-size:11px; opacity:.7; }
.griot-message { font-size:13px; color:#d0d0e0; line-height:1.5; font-style:italic; }
.griot-action { margin-top:10px; }
.fam-row { background:#13131b; border-radius:12px; padding:12px 14px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.fam-left { display:flex; align-items:center; gap:10px; }
.fam-emoji { font-size:24px; }
.fam-name { font-size:14px; font-weight:700; color:#e8e8f0; }
.fam-kinship { font-size:11px; color:#7b7b90; }
.fam-right { text-align:right; }
.fam-days { font-size:12px; font-weight:700; }
.countdown-pill { font-size:10px; font-weight:700; border-radius:20px; padding:3px 10px; display:inline-block; }
.stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:12px 16px; }
.stat-box { background:#13131b; border-radius:10px; padding:10px; text-align:center; }
.stat-num { font-size:18px; font-weight:800; color:#f5f5f0; }
.stat-label { font-size:9px; color:#7b7b90; font-weight:700; margin-top:2px; }
.village-pulse-card { background:#13131b; border-radius:14px; padding:14px 16px; margin-bottom:10px; border:1px solid #1e1e2a; }
.vp-village-name { font-size:15px; font-weight:800; color:#f5f5f0; margin-bottom:2px; }
.vp-meta { font-size:11px; color:#7b7b90; margin-bottom:10px; }
.vp-tools { display:flex; flex-wrap:wrap; gap:6px; }
.vp-tool-chip { font-size:10px; font-weight:700; background:#1e1e2a; border:1px solid #28283a; border-radius:20px; padding:4px 10px; color:#d0d0e0; }
.ai-suggest { background:#1e1a0a; border:1px solid #4a3a0a; border-radius:12px; padding:12px 14px; margin-bottom:8px; display:flex; gap:12px; align-items:flex-start; }
.ai-suggest-text { font-size:13px; color:#fde68a; flex:1; }
.ai-suggest-add { background:#d97706; border:none; color:#fff; border-radius:8px; padding:6px 12px; font-size:11px; font-weight:700; cursor:pointer; flex-shrink:0; }
`

// ─────────────────────────────────────────────────────────────
//  GRIOT AI SUGGESTIONS
// ─────────────────────────────────────────────────────────────

const GRIOT_SUGGESTIONS = [
  { orisha: 'Esu',     emoji: '🔀', title: 'Open the Crossroads',   message: 'A new Afo market day approaches — Esu sees two trade paths crossing. Your price_checker session on this day will yield rare intelligence. Book it now before the crossroads close.', date: dateOffset(2) },
  { orisha: 'Oshun',   emoji: '🌊', title: 'Cowrie Flows on Full Moon', message: 'Oshun\'s waters are full — the full moon in 4 days is the highest-engagement send time of the lunar cycle. Schedule your Cowrie Flow post and market listing then.', date: dateOffset(4) },
  { orisha: 'Ogun',    emoji: '⚒',  title: 'Forge Your Alliance',   message: 'Builders Village has 3 active members in your trade network. Ogun says: "Strike while the iron is hot." Schedule a joint session this Eke day.', date: dateOffset(1) },
  { orisha: 'Shango',  emoji: '⚡',  title: 'Justice Pending',       message: 'Shango counts 2 unresolved escrow sessions from last month. The thunder will not wait — resolve before next Orie day or face a Nkisi rating drop.', date: dateOffset(3) },
  { orisha: 'Obatala', emoji: '🤍', title: 'Naming Day Approaches', message: 'Damilola\'s 8th-day naming ceremony is near. Obatala, creator of bodies, asks you to invite Tier 1 Ẹjẹ now and prepare the family vault blessing.', date: dateOffset(8) },
]

// ─────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function EventDot({ type }: { type: EventType }) {
  return <div className="cal-dot" style={{ background: EVENT_META[type].color }} title={EVENT_META[type].label} />
}

function EventCard({ ev, onClick }: { ev: CalEvent; onClick: () => void }) {
  const meta = EVENT_META[ev.type]
  const orisha = ev.orishaSpirit ? ORISHA_SPIRITS[ev.orishaSpirit as keyof typeof ORISHA_SPIRITS] : null
  return (
    <div className="ev-card" style={{ borderLeftColor: meta.color }} onClick={onClick}>
      <div className="ev-icon">{meta.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ev-title">{ev.title}</div>
        <div className="ev-meta">
          {ev.time && <span>⏰ {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>}
          {ev.villageId && <span>🏘 {VILLAGE_MAP[ev.villageId]?.name || ev.villageId}</span>}
          {ev.cowrieAmount && <span>🌊 {ev.cowrieAmount.toLocaleString()} Cowrie</span>}
          {ev.repeat !== 'none' && <span>🔄 {ev.repeat}</span>}
          {orisha && (
            <span className="orisha-chip" style={{ background: orisha.bg, color: orisha.color }}>
              {orisha.emoji} {ev.orishaSpirit}
            </span>
          )}
        </div>
        {ev.note && <div style={{ fontSize: 11, color: '#a0a0b0', marginTop: 4, fontStyle: 'italic' }}>{ev.note}</div>}
      </div>
      <div>
        <span className="ev-badge" style={{ background: meta.color + '30', color: meta.color }}>{meta.label}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  TV SLOT CARD (used in TV Sked view)
// ─────────────────────────────────────────────────────────────

function TVSlotCard({ slot, onBook, onWatch }: { slot: TVSlot; onBook: () => void; onWatch: () => void }) {
  const tier = TIER_META[slot.tier]
  const statusBadge = {
    LIVE:      { label: '🔴 LIVE',     color: '#ef4444' },
    UPCOMING:  { label: '⏰ UPCOMING', color: '#fbbf24' },
    BOOKABLE:  { label: '📝 OPEN',     color: '#4ade80' },
    BOOKED:    { label: '✅ BOOKED',   color: '#6b7280' },
    COMPLETED: { label: '✓ AIRED',    color: '#374151' },
  }[slot.status]

  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12, marginBottom: 8,
      background: 'rgba(255,255,255,.03)', border: `1px solid rgba(255,255,255,.07)`,
      borderLeft: `3px solid ${slot.villageColor}`,
    }}>
      {/* Time */}
      <div style={{ flexShrink: 0, width: 44, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: tier.color }}>{slot.startTime}</div>
        <div style={{ fontSize: 9, color: '#7b7b90' }}>{slot.endTime}</div>
        <div style={{ fontSize: 9, color: slot.villageColor, marginTop: 2 }}>{slot.villageEmoji}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f5f5f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {slot.status === 'BOOKABLE' ? `${slot.villageEmoji} ${slot.villageName} — Available` : slot.program?.title ?? ''}
          </span>
          <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: `${statusBadge.color}20`, color: statusBadge.color }}>
            {statusBadge.label}
          </span>
        </div>
        <div style={{ fontSize: 10, color: '#7b7b90' }}>
          {slot.villageName} · {tier.label} · {slot.durationHours}h
          {slot.program?.viewers ? ` · 👁 ${slot.program.viewers.toLocaleString()}` : ''}
          {slot.status === 'BOOKABLE' ? ` · 🐚 ${slot.cowriePrice.toLocaleString()}` : ''}
        </div>
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>
        {slot.status === 'LIVE' ? (
          <button onClick={onWatch} style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>
            Watch
          </button>
        ) : slot.status === 'BOOKABLE' ? (
          <button onClick={onBook} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(74,222,128,.3)', background: 'rgba(74,222,128,.1)', color: '#4ade80', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
            Book
          </button>
        ) : null}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const router = useRouter()
  const { activeVillageId, activeVillageColor } = useVillageStore()
  const vcol = activeVillageColor || '#e07b00'

  // Inject styles
  useEffect(() => {
    if (document.getElementById(INJECT_ID)) return
    const s = document.createElement('style')
    s.id = INJECT_ID
    s.textContent = STYLES
    document.head.appendChild(s)
  }, [])

  // Calendar state
  const [year,  setYear]  = useState(2026)
  const [month, setMonth] = useState(3)
  const [view,  setView]  = useState<CalView>('month')
  const [selectedDate, setSelectedDate] = useState(today())
  const [events, setEvents] = useState<CalEvent[]>(INITIAL_EVENTS)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)

  // Hydrate real date after mount to avoid SSR mismatch
  useEffect(() => {
    const n = new Date()
    setYear(n.getFullYear())
    setMonth(n.getMonth())
  }, [])

  // New event form state
  const [newTitle, setNewTitle]         = useState('')
  const [newDate, setNewDate]           = useState(today())
  const [newTime, setNewTime]           = useState('')
  const [newType, setNewType]           = useState<EventType>('personal')
  const [newSkin, setNewSkin]           = useState<'ise' | 'egbe' | 'idile' | 'all'>('all')
  const [newRepeat, setNewRepeat]       = useState<RepeatCycle>('none')
  const [newNote, setNewNote]           = useState('')
  const [newVillage, setNewVillage]     = useState('')

  // Navigation
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Event lookup helpers
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {}
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    })
    return map
  }, [events])

  const selectedEvents = useMemo(() => eventsByDate[selectedDate] || [], [eventsByDate, selectedDate])

  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month])

  // Upcoming family events (next 60 days)
  const upcomingFamily = useMemo(() => {
    const resultDates: { member: FamilyMember; label: string; date: string; daysAway: number; isAncestor: boolean }[] = []
    const todayTs = new Date(today()).getTime()
    INITIAL_FAMILY.forEach(fm => {
      if (fm.birthday) {
        const bd = fm.birthday.slice(5) // MM-DD
        const thisYear = `${year}-${bd}`
        const ts = new Date(thisYear).getTime()
        const days = Math.round((ts - todayTs) / 86400000)
        if (days >= -1 && days <= 60) {
          resultDates.push({ member: fm, label: fm.isDeceased ? `🕯 ${fm.name} Remembrance` : `🎂 ${fm.name} Birthday`, date: thisYear, daysAway: days, isAncestor: !!fm.isDeceased })
        }
      }
      if (fm.namingDay) {
        const ts = new Date(fm.namingDay).getTime()
        const days = Math.round((ts - todayTs) / 86400000)
        if (days >= 0 && days <= 60) {
          resultDates.push({ member: fm, label: `🌟 ${fm.name} Naming Ceremony`, date: fm.namingDay, daysAway: days, isAncestor: false })
        }
      }
    })
    return resultDates.sort((a, b) => a.daysAway - b.daysAway)
  }, [year])

  function addEvent() {
    if (!newTitle.trim()) return
    const ev: CalEvent = {
      id: `user-${Date.now()}`,
      title: newTitle,
      date: newDate,
      time: newTime || undefined,
      type: newType,
      skin: newSkin,
      repeat: newRepeat,
      note: newNote || undefined,
      villageId: newVillage || undefined,
    }
    setEvents(prev => [...prev, ev])
    setShowAdd(false)
    setNewTitle(''); setNewDate(today()); setNewTime(''); setNewNote(''); setNewVillage('')
    setNewType('personal'); setNewSkin('all'); setNewRepeat('none')
  }

  const todayStr = today()

  // CSS variable for village color
  const cssVars = { '--vcol': vcol } as React.CSSProperties

  return (
    <div className="cal-page" style={cssVars}>
      {/* ── Header ── */}
      <div className="cal-header">
        <div className="cal-nav-row">
          <button className="cal-month-btn" onClick={prevMonth}>‹</button>
          <div>
            <div className="cal-month-title">{fmtMonthYear(year, month)}</div>
            <div style={{ fontSize: 11, color: '#7b7b90', textAlign: 'center' }}>
              {getMarketDay(todayStr).name} · {getMoonPhase(todayStr).emoji} · {MONTH_NAMES[month]}
            </div>
          </div>
          <button className="cal-month-btn" onClick={nextMonth}>›</button>
        </div>

        {/* View Tabs */}
        <div className="cal-view-tabs" style={{ paddingBottom: 12 }}>
          {([
            ['month',   '📅 Ọdún'],
            ['moon',    '🌙 Oṣùpá'],
            ['village', '🏘 Village'],
            ['family',  '🌳 Ìdílé'],
            ['griot',   '🦅 Griot AI'],
            ['tv',      '📺 TV Sked'],
          ] as [CalView, string][]).map(([v, label]) => (
            <button key={v} className={`cal-tab${view === v ? ' active' : ''}`} onClick={() => setView(v)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ─── MONTH VIEW ─── */}
      {view === 'month' && (<>
        <div className="cal-dow">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="cal-dow-cell">{d}</div>
          ))}
        </div>

        <div className="cal-grid">
          {grid.map(cell => {
            const cellEvents = eventsByDate[cell.date] || []
            const market = getMarketDay(cell.date)
            const moon = getMoonPhase(cell.date)
            const mdKey = cell.date.slice(5)
            const fest = CULTURAL_FESTIVALS[mdKey]
            const isMoon = isMoonMilestone(cell.date)
            const isToday = cell.date === todayStr
            const isSel = cell.date === selectedDate

            return (
              <div
                key={cell.date}
                className={`cal-day${!cell.inMonth ? ' not-in-month' : ''}${isToday ? ' is-today' : ''}${isSel ? ' selected' : ''}`}
                onClick={() => { setSelectedDate(cell.date); if (!cell.inMonth) { /* navigate */ } }}
              >
                {isMoon && <div className="cal-moon">{moon.emoji}</div>}
                <div className="cal-day-num">{parseInt(cell.date.slice(8))}</div>
                <div className="cal-market-badge" style={{ background: market.color + '30', color: market.color }}>
                  {market.name}
                </div>
                {fest && <div className="cal-fest-badge">{fest.emoji} {fest.name}</div>}
                <div className="cal-dots">
                  {cellEvents.slice(0, 5).map(ev => <EventDot key={ev.id} type={ev.type} />)}
                  {cellEvents.length > 5 && <div style={{ fontSize: 8, color: '#7b7b90', alignSelf: 'center' }}>+{cellEvents.length - 5}</div>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected day events */}
        <div className="cal-section" style={{ marginTop: 8 }}>
          <div className="cal-section-title">
            {fmtDate(selectedDate)} · {getMarketDay(selectedDate).name} day
          </div>

          {/* Festival notice */}
          {CULTURAL_FESTIVALS[selectedDate.slice(5)] && (() => {
            const fest = CULTURAL_FESTIVALS[selectedDate.slice(5)]
            return (
              <div style={{ background: '#1a0a2a', border: '1px solid #3a1a6a', borderRadius: 12, padding: '10px 14px', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#c084fc' }}>{fest.emoji} {fest.name} · {fest.yoruba}</div>
                <div style={{ fontSize: 11, color: '#a0a0b0', marginTop: 4 }}>{fest.desc}</div>
              </div>
            )
          })()}

          {selectedEvents.length === 0 ? (
            <div style={{ background: '#13131b', borderRadius: 12, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌑</div>
              <div style={{ fontSize: 13, color: '#7b7b90' }}>No events this day — the drum is silent</div>
              <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => { setNewDate(selectedDate); setShowAdd(true) }}>
                + Add Event
              </button>
            </div>
          ) : (
            selectedEvents.map(ev => (
              <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
            ))
          )}
        </div>

        {/* Legend */}
        <div className="cal-section">
          <div className="cal-section-title">Legend</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.entries(EVENT_META) as [EventType, typeof EVENT_META[EventType]][]).map(([type, m]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#a0a0b0' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                {m.label}
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* ─── MOON VIEW ─── */}
      {view === 'moon' && (() => {
        const { emoji, name, pct } = getMoonPhase(selectedDate)
        const activities = MOON_ACTIVITIES[emoji] || []
        const illumination = Math.round(Math.sin(pct * Math.PI) * 100)
        return (
          <div className="moon-view">
            <div className="moon-big">{emoji}</div>
            <div className="moon-name">{name}</div>
            <div className="moon-sub">{illumination}% illumination · {fmtDate(selectedDate)}</div>

            {/* Moon strip for next 14 days */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7b7b90', marginBottom: 8 }}>14-Day Moon Strip</div>
            <div className="moon-strip">
              {Array.from({ length: 14 }, (_, i) => {
                const d = dateOffset(i)
                const ph = getMoonPhase(d)
                return (
                  <div key={d} className="moon-strip-day" onClick={() => setSelectedDate(d)}>
                    <div className="ms-emoji">{ph.emoji}</div>
                    <div className="ms-date">{d.slice(8)}</div>
                    <div style={{ fontSize: 8, color: getMarketDay(d).color }}>{getMarketDay(d).name}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ margin: '16px 0 8px', fontWeight: 700, fontSize: 13, color: '#a0a0b0' }}>
              🌿 Orisha Activity Guide for {name.split(' · ')[0]}
            </div>
            <ul className="moon-act-list">
              {activities.map((act, i) => (
                <li key={i}>
                  <span style={{ fontSize: 16 }}>{['✦','🌾','💼','🥁','🌊','🔑','🦅','⚒'][i % 8]}</span>
                  {act}
                </li>
              ))}
            </ul>

            {/* Moon phase table */}
            <div style={{ marginTop: 20, fontWeight: 700, fontSize: 13, color: '#a0a0b0', marginBottom: 8 }}>
              🌕 Lunar Calendar — {MONTH_NAMES[month]}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
              {grid.filter(c => c.inMonth).map(cell => {
                const ph = getMoonPhase(cell.date)
                const mk = getMarketDay(cell.date)
                return (
                  <div key={cell.date} onClick={() => setSelectedDate(cell.date)}
                    style={{ background: '#13131b', borderRadius: 8, padding: '6px 4px', textAlign: 'center', cursor: 'pointer', border: cell.date === selectedDate ? `1px solid ${vcol}` : '1px solid transparent' }}>
                    <div style={{ fontSize: 16 }}>{ph.emoji}</div>
                    <div style={{ fontSize: 10, color: '#d0d0e0', fontWeight: 700 }}>{parseInt(cell.date.slice(8))}</div>
                    <div style={{ fontSize: 7, color: mk.color, fontWeight: 800 }}>{mk.name[0]}</div>
                  </div>
                )
              })}
            </div>

            {/* Traditional moon names */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#a0a0b0', marginBottom: 10 }}>🌙 African Moon Names — {MONTH_NAMES[month]}</div>
              {[
                { culture: 'Yoruba', name: 'Oṣùpá Ẹ̀jọ̀', meaning: 'The Moon of Ancestral Return' },
                { culture: 'Igbo',   name: 'Ọnwa Ọzọ',   meaning: 'Moon of the Title Holders' },
                { culture: 'Zulu',   name: 'iNyanga',     meaning: 'Moon & Healer — same word' },
                { culture: 'Hausa',  name: 'Watan Daji',  meaning: 'Bush Moon — harvest begins' },
                { culture: 'Akan',   name: 'Bosome',      meaning: 'Spirit of Celestial Time' },
              ].map(mn => (
                <div key={mn.culture} style={{ background: '#13131b', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }}>{mn.name}</div>
                    <div style={{ fontSize: 11, color: '#7b7b90' }}>{mn.meaning}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: vcol }}>{mn.culture}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ─── VILLAGE PULSE VIEW ─── */}
      {view === 'village' && (
        <div style={{ padding: 16 }}>
          {activeVillageId && VILLAGE_MAP[activeVillageId] ? (() => {
            const v = VILLAGE_MAP[activeVillageId]
            const todayMarket = getMarketDay(todayStr)
            const isMarketDay = todayMarket.idx === 0 // Eke = market day for most villages
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 14px', background: '#13131b', borderRadius: 14, border: `1px solid ${v.color}40` }}>
                  <div style={{ fontSize: 32 }}>{v.emoji}</div>
                  <div>
                    <div style={{ fontFamily: '"Cinzel","Palatino",serif', fontSize: 16, fontWeight: 800, color: v.color, letterSpacing: '0.04em' }}>{v.ancientName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{v.nationFull?.split('·')[0]?.trim() || v.category}</div>
                    {isMarketDay && <div style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>⚡ ACTIVE MARKET DAY</div>}
                  </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                  {[
                    { num: events.filter(e => e.villageId === activeVillageId).length, label: 'Village Events' },
                    { num: events.filter(e => e.type === 'business').length, label: 'Sessions' },
                    { num: '4', label: 'Members Active' },
                    { num: '12K', label: 'Cowrie Flow' },
                  ].map(s => (
                    <div key={s.label} className="stat-box">
                      <div className="stat-num" style={{ color: v.color }}>{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Market day schedule */}
                <div style={{ marginTop: 16 }}>
                  <div className="cal-section-title">Market Day Cycle — Next 8 Days</div>
                  {Array.from({ length: 8 }, (_, i) => {
                    const d = dateOffset(i)
                    const mk = getMarketDay(d)
                    const dayEvs = eventsByDate[d]?.filter(e => e.villageId === activeVillageId) || []
                    return (
                      <div key={d} onClick={() => { setSelectedDate(d); setView('month') }}
                        style={{ background: '#13131b', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: mk.name === 'Eke' ? `1px solid ${mk.color}40` : '1px solid transparent' }}>
                        <div style={{ fontSize: 20 }}>{mk.name === 'Eke' ? '🏪' : '📅'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }}>{fmtDate(d).split(',')[0]}  {parseInt(d.slice(8))}</div>
                          <div style={{ fontSize: 11, color: mk.color, fontWeight: 700 }}>{mk.name} Day</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {dayEvs.length > 0 ? (
                            <div style={{ fontSize: 11, color: v.color, fontWeight: 700 }}>{dayEvs.length} event{dayEvs.length > 1 ? 's' : ''}</div>
                          ) : (
                            <div style={{ fontSize: 10, color: '#4b5563' }}>Free</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Village events this month */}
                <div style={{ marginTop: 8 }}>
                  <div className="cal-section-title">All Village Events</div>
                  {events.filter(e => e.villageId === activeVillageId || e.type === 'village').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#6b7280', fontSize: 13 }}>No village events yet</div>
                  ) : (
                    events.filter(e => e.villageId === activeVillageId || e.type === 'village').map(ev => (
                      <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
                    ))
                  )}
                </div>
              </div>
            )
          })() : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏘</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f0', marginBottom: 8 }}>No Village Selected</div>
              <div style={{ fontSize: 13, color: '#7b7b90', marginBottom: 16 }}>Enter a village to see its market calendar and community pulse</div>
              <button className="btn-secondary" onClick={() => router.push('/dashboard/villages')}>Browse Villages</button>
            </div>
          )}
        </div>
      )}

      {/* ─── FAMILY VIEW ─── */}
      {view === 'family' && (
        <div style={{ padding: 16 }}>
          <div className="stats-row">
            {[
              { num: INITIAL_FAMILY.length,                                    label: 'Family Members' },
              { num: INITIAL_FAMILY.filter(f => f.isDeceased).length,          label: 'With Ancestors' },
              { num: upcomingFamily.filter(u => u.daysAway <= 30).length,   label: 'Events (30d)' },
              { num: upcomingFamily.filter(u => !u.isAncestor).length,      label: 'Celebrations' },
            ].map(s => (
              <div key={s.label} className="stat-box">
                <div className="stat-num" style={{ color: '#1a7c3e' }}>{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming family events */}
          <div style={{ marginTop: 16 }}>
            <div className="cal-section-title">Upcoming Ìdílé Events</div>
            {upcomingFamily.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#6b7280', fontSize: 13 }}>No family events in next 60 days</div>
            ) : (
              upcomingFamily.map((item, i) => {
                const daysLabel = item.daysAway === 0 ? 'TODAY' : item.daysAway === 1 ? 'TOMORROW' : `${item.daysAway} days`
                const pillColor = item.isAncestor ? '#4b5563' : item.daysAway <= 3 ? '#ef4444' : item.daysAway <= 7 ? '#e07b00' : '#1a7c3e'
                return (
                  <div key={i} className="fam-row">
                    <div className="fam-left">
                      <div className="fam-emoji">{item.member.emoji}</div>
                      <div>
                        <div className="fam-name">{item.label}</div>
                        <div className="fam-kinship">{item.member.kinship} · {fmtDate(item.date)}</div>
                      </div>
                    </div>
                    <div className="fam-right">
                      <div className="countdown-pill" style={{ background: pillColor + '25', color: pillColor }}>{daysLabel}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Ancestor flame */}
          <div style={{ marginTop: 16 }}>
            <div className="cal-section-title">🕯 The Ancestor Flame</div>
            <div style={{ background: 'linear-gradient(135deg,#1a1000,#0a0a10)', borderRadius: 14, padding: 16, border: '1px solid #3a2a0a', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fde68a', marginBottom: 8 }}>Those who walk beside us</div>
              {INITIAL_FAMILY.filter(f => f.isDeceased).map(fm => (
                <div key={fm.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '8px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: 20 }}>🕯</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }}>{fm.name}</div>
                    <div style={{ fontSize: 11, color: '#7b7b90' }}>{fm.kinship}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 10, color: '#7b7b90' }}>
                    Remembrance: {fm.birthday?.slice(5)}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#a0a0b0', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
                "Those who die are never gone — they are in the shadow that grows brighter with the rising sun." — Birago Diop, Senegalese poet
              </div>
            </div>
          </div>

          {/* Family events this month */}
          <div style={{ marginTop: 8 }}>
            <div className="cal-section-title">Family Events · {MONTH_NAMES[month]}</div>
            {events.filter(e => e.type === 'family' || e.type === 'ancestor').map(ev => (
              <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
            ))}
          </div>

          <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => router.push('/dashboard/family-tree')}>
            🌳 Open Family Tree
          </button>
        </div>
      )}

      {/* ─── GRIOT AI VIEW ─── */}
      {view === 'griot' && (
        <div style={{ padding: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🦅</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f0' }}>The 5 Orisha Speak</div>
            <div style={{ fontSize: 12, color: '#7b7b90' }}>AI spirits reading your calendar energy for the week</div>
          </div>

          {/* Griot AI suggestions */}
          <div className="cal-section-title">🌟 Spirit Revelations</div>
          {GRIOT_SUGGESTIONS.map((sug, i) => {
            const spirit = ORISHA_SPIRITS[sug.orisha as keyof typeof ORISHA_SPIRITS]
            return (
              <div key={i} className="griot-card" style={{ borderColor: spirit.color + '40' }}>
                <div className="griot-header">
                  <div className="griot-img" style={{ color: spirit.color }}>{sug.emoji}</div>
                  <div>
                    <div className="griot-name" style={{ color: spirit.color }}>{sug.orisha} says: {sug.title}</div>
                    <div className="griot-domain">{spirit.domain} · {fmtDate(sug.date).split(',')[0]}</div>
                  </div>
                </div>
                <div className="griot-message">"{sug.message}"</div>
                <div className="griot-action" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="ai-suggest-add" onClick={() => {
                    const ev: CalEvent = { id: `ai-${Date.now()}`, title: `🦅 ${sug.orisha}: ${sug.title}`, date: sug.date, type: 'ai', skin: 'all', repeat: 'none', aiSuggested: true, orishaSpirit: sug.orisha, note: sug.message }
                    setEvents(prev => [...prev, ev])
                    setSelectedDate(sug.date)
                    setView('month')
                  }}>+ Add to Calendar</button>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: '6px 10px' }} onClick={() => { setSelectedDate(sug.date); setView('month') }}>
                    View Day
                  </button>
                </div>
              </div>
            )
          })}

          {/* Pattern insights */}
          <div style={{ marginTop: 20 }}>
            <div className="cal-section-title">📊 Griot Pattern Intelligence</div>
            {[
              { icon: '⚡', insight: 'Your Eke market days have 3× more trade sessions than any other day', action: 'Schedule price_checker' },
              { icon: '🌕', insight: 'Full moon periods see 2× higher engagement on your Drum posts', action: 'Schedule a post on full moon' },
              { icon: '🌳', insight: 'Your family events cluster in April — consider spreading across year', action: 'Check April calendar' },
              { icon: '🌙', insight: 'You tend to be most active at 07:00–09:00 — Griot recommends scheduling here', action: 'Set morning events' },
              { icon: '🔴', insight: '2 business sessions have no follow-up scheduled — revenue risk', action: 'Add follow-up sessions' },
            ].map((p, i) => (
              <div key={i} className="ai-suggest">
                <div style={{ fontSize: 22 }}>{p.icon}</div>
                <div className="ai-suggest-text">{p.insight}</div>
                <button onClick={() => router.push('/dashboard/sessions/new')} className="ai-suggest-add" style={{ fontSize: 10, padding: '4px 8px' }}>{p.action} →</button>
              </div>
            ))}
          </div>

          {/* AI events in calendar */}
          <div style={{ marginTop: 16 }}>
            <div className="cal-section-title">🦅 AI Events Added to Your Calendar</div>
            {events.filter(e => e.type === 'ai').length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#6b7280', fontSize: 13 }}>Accept a spirit suggestion above to add your first AI event</div>
            ) : (
              events.filter(e => e.type === 'ai').map(ev => (
                <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEvent(ev)} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TV SCHEDULE VIEW ─── */}
      {view === 'tv' && (() => {
        const schedule = buildTodaySchedule()
        const liveNow  = getLiveSlots(schedule)
        const upcoming = schedule.filter(s => s.status === 'UPCOMING').slice(0, 10)
        const bookable = schedule.filter(s => s.status === 'BOOKABLE')
        return (
          <div style={{ padding: 16 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 42, marginBottom: 6 }}>📺</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f0', fontFamily: 'Sora, sans-serif' }}>Village Airwaves</div>
              <div style={{ fontSize: 12, color: '#7b7b90', marginBottom: 12 }}>Today's schedule · 20 Village Channels</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: `🔴 ${liveNow.length} LIVE`, color: '#ef4444' },
                  { label: `📅 ${upcoming.length} Coming Up`, color: '#fbbf24' },
                  { label: `📝 ${bookable.length} Bookable`, color: '#4ade80' },
                ].map(p => (
                  <span key={p.label} style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}>
                    {p.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Now */}
            {liveNow.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="cal-section-title" style={{ color: '#ef4444' }}>🔴 LIVE NOW</div>
                {liveNow.map(slot => (
                  <TVSlotCard key={slot.id} slot={slot} onBook={() => router.push('/dashboard/tv/schedule')} onWatch={() => router.push('/dashboard/tv')} />
                ))}
              </div>
            )}

            {/* Coming Up */}
            <div style={{ marginBottom: 16 }}>
              <div className="cal-section-title">⏰ Coming Up Today</div>
              {upcoming.map(slot => (
                <TVSlotCard key={slot.id} slot={slot} onBook={() => router.push('/dashboard/tv/schedule')} onWatch={() => router.push('/dashboard/tv')} />
              ))}
            </div>

            {/* Bookable slots */}
            <div style={{ marginBottom: 16 }}>
              <div className="cal-section-title" style={{ color: '#4ade80' }}>📝 Open for Booking</div>
              <div style={{ fontSize: 11, color: '#7b7b90', marginBottom: 8 }}>
                Broadcast on a village channel. Cowrie-priced by daypart.
              </div>
              {bookable.slice(0, 5).map(slot => (
                <TVSlotCard key={slot.id} slot={slot} onBook={() => router.push('/dashboard/tv/schedule')} onWatch={() => router.push('/dashboard/tv')} />
              ))}
              {bookable.length > 5 && (
                <button
                  onClick={() => router.push('/dashboard/tv/schedule')}
                  style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid rgba(74,222,128,.2)', background: 'rgba(74,222,128,.05)', color: '#4ade80', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}
                >
                  + {bookable.length - 5} more bookable slots →
                </button>
              )}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => router.push('/dashboard/tv/schedule')}
                style={{ padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Sora, sans-serif', cursor: 'pointer' }}
              >
                📅 Full TV Schedule & Booking
              </button>
              <button
                onClick={() => router.push('/dashboard/tv/apply')}
                style={{ padding: '12px', borderRadius: 12, border: '1px solid rgba(74,222,128,.2)', background: 'rgba(74,222,128,.05)', color: '#4ade80', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                🎙 Apply to Broadcast
              </button>
            </div>
          </div>
        )
      })()}

      {/* ── FAB ── */}
      <button className="fab" style={{ background: vcol }} onClick={() => { setNewDate(selectedDate); setShowAdd(true) }}>
        ＋
      </button>

      {/* ── ADD EVENT DRAWER ── */}
      {showAdd && (
        <div className="drawer">
          <div className="drawer-bg" onClick={() => setShowAdd(false)} />
          <div className="drawer-panel">
            <div className="drawer-handle" />
            <div className="drawer-title">🗓 New Event</div>
            <div className="drawer-sub">Drum a moment onto the calendar</div>

            <div className="field-label">EVENT TITLE</div>
            <input className="field-input" placeholder="What is happening?" value={newTitle} onChange={e => setNewTitle(e.target.value)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div className="field-label">DATE</div>
                <input className="field-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <div>
                <div className="field-label">TIME</div>
                <input className="field-input" type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
              </div>
            </div>

            <div className="field-label">EVENT TYPE</div>
            <div className="seg">
              {(Object.entries(EVENT_META) as [EventType, typeof EVENT_META[EventType]][]).map(([type, m]) => (
                <button key={type} className={`seg-btn${newType === type ? ' sel' : ''}`} onClick={() => setNewType(type)}>
                  {m.icon} {m.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="field-label">SKIN CONTEXT</div>
            <div className="seg">
              {[['all','🎭 All Skins'],['ise','⚒ Ìṣẹ́'],['egbe','⭕ Egbé'],['idile','🌳 Ìdílé']] .map(([v, l]) => (
                <button key={v} className={`seg-btn${newSkin === v ? ' sel' : ''}`} onClick={() => setNewSkin(v as any)}>{l}</button>
              ))}
            </div>

            <div className="field-label">REPEAT</div>
            <div className="seg">
              {[['none','Once'],['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['yearly','Yearly'],['moon','Moon Cycle'],['market','Market Cycle']].map(([v, l]) => (
                <button key={v} className={`seg-btn${newRepeat === v ? ' sel' : ''}`} onClick={() => setNewRepeat(v as RepeatCycle)}>{l}</button>
              ))}
            </div>

            <div className="field-label">VILLAGE (OPTIONAL)</div>
            <select className="field-input" value={newVillage} onChange={e => setNewVillage(e.target.value)}>
              <option value="">No village</option>
              {Object.values(VILLAGE_MAP).map(v => (
                <option key={v.id} value={v.id}>{v.emoji} {v.name}</option>
              ))}
            </select>

            <div className="field-label">NOTE / DESCRIPTION</div>
            <textarea className="field-input" rows={3} placeholder="Any notes for the Griot..." value={newNote} onChange={e => setNewNote(e.target.value)} style={{ resize: 'none' }} />

            {/* AI time suggestion */}
            <div style={{ background: '#1e1a0a', borderRadius: 10, padding: '10px 14px', marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 18 }}>🦅</div>
              <div style={{ flex: 1, fontSize: 12, color: '#fde68a' }}>
                Oshun suggests: <strong>Next {getMoonPhase(newDate).name.split(' · ')[0]} at 08:00</strong> for max Cowrie engagement
              </div>
              <button style={{ background: '#d97706', border: 'none', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setNewTime('08:00')}>Use</button>
            </div>

            <button className="btn-primary" style={{ background: vcol }} onClick={addEvent}>
              🥁 Drum to Calendar
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── EVENT DETAIL DRAWER ── */}
      {selectedEvent && (
        <div className="drawer">
          <div className="drawer-bg" onClick={() => setSelectedEvent(null)} />
          <div className="drawer-panel">
            <div className="drawer-handle" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 36 }}>{EVENT_META[selectedEvent.type].icon}</div>
              <div style={{ flex: 1 }}>
                <div className="drawer-title" style={{ fontSize: 16, marginBottom: 4 }}>{selectedEvent.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span className="ev-badge" style={{ background: EVENT_META[selectedEvent.type].color + '30', color: EVENT_META[selectedEvent.type].color }}>{EVENT_META[selectedEvent.type].label}</span>
                  {selectedEvent.aiSuggested && <span className="ev-badge" style={{ background: '#fbbf2430', color: '#fbbf24' }}>🦅 Griot</span>}
                </div>
              </div>
            </div>

            <div style={{ background: '#1a1a24', borderRadius: 12, padding: '12px 14px' }}>
              {[
                ['📅 Date',    fmtDate(selectedEvent.date)],
                selectedEvent.time      ? ['⏰ Time',    selectedEvent.time + (selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : '')] : null,
                selectedEvent.villageId ? ['🏘 Village', VILLAGE_MAP[selectedEvent.villageId]?.name || selectedEvent.villageId] : null,
                ['🔄 Repeat',  selectedEvent.repeat === 'none' ? 'One-time' : selectedEvent.repeat],
                ['🎭 Skin',    selectedEvent.skin === 'all' ? 'All skins' : selectedEvent.skin ],
                selectedEvent.orishaSpirit ? ['🦅 Spirit', selectedEvent.orishaSpirit] : null,
                selectedEvent.cowrieAmount ? ['🌊 Cowrie', `${selectedEvent.cowrieAmount.toLocaleString()} Cowrie`] : null,
                selectedEvent.geoScope    ? ['🌍 Scope',  selectedEvent.geoScope] : null,
              ].filter((x): x is string[] => x !== null).map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #28283a', fontSize: 13 }}>
                  <span style={{ color: '#7b7b90' }}>{label}</span>
                  <span style={{ color: '#e8e8f0', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {selectedEvent.note && (
              <div style={{ borderRadius: 10, padding: '10px 14px', background: '#1e2a1e', marginTop: 12, fontSize: 13, color: '#d0d0e0', fontStyle: 'italic', lineHeight: 1.5 }}>
                💬 {selectedEvent.note}
              </div>
            )}

            {/* Orisha spirit message */}
            {selectedEvent.orishaSpirit && (() => {
              const spirit = ORISHA_SPIRITS[selectedEvent.orishaSpirit as keyof typeof ORISHA_SPIRITS]
              if (!spirit) return null
              return (
                <div style={{ background: spirit.bg, borderRadius: 12, padding: '12px 14px', marginTop: 12, border: `1px solid ${spirit.color}40` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: spirit.color }}>
                    {spirit.emoji} {selectedEvent.orishaSpirit} · Spirit Guide
                  </div>
                  <div style={{ fontSize: 12, color: '#c0c0d0', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{spirit.domain} — this event aligns with the {selectedEvent.orishaSpirit} energy. Proceed with intention."
                  </div>
                </div>
              )
            })()}

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
              {selectedEvent.villageId && (
                <button className="btn-secondary" onClick={() => { setSelectedEvent(null); router.push(`/dashboard/villages/${selectedEvent.villageId}`) }}>
                  🏘 Open Village
                </button>
              )}
              {selectedEvent.toolKey && (
                <button className="btn-secondary" onClick={() => { setSelectedEvent(null); router.push(`/dashboard/sessions/new?tool=${selectedEvent.toolKey}`) }}>
                  🛠 Launch Tool
                </button>
              )}
              <button className="btn-secondary" onClick={() => {
                setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
                setSelectedEvent(null)
              }} style={{ color: '#ef4444', borderColor: '#ef444430' }}>
                🗑 Remove
              </button>
            </div>

            <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => setSelectedEvent(null)}>
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
