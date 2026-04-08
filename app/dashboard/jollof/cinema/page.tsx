'use client'
// =====================================================================
// VILLAGE CINEMA NETWORK — Distributed African Netflix
// Each Village is a curated streaming hub with its own catalog
// =====================================================================
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/* ── inject-once CSS ── */
const CSS_ID = 'cinema-css'
const CSS = `
@keyframes cinFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes cinShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes cinPulse{0%,100%{opacity:.6;transform:scale(.9)}50%{opacity:1;transform:scale(1.05)}}
@keyframes cinGlow{0%,100%{box-shadow:0 0 12px rgba(212,160,23,.3)}50%{box-shadow:0 0 28px rgba(212,160,23,.6)}}
@keyframes cinSlide{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes cinFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cinSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes partyPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.4)}70%{box-shadow:0 0 0 14px rgba(212,160,23,0)}}
@keyframes reachRing{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.6);opacity:0}}
.cin-fade{animation:cinFade .4s ease both}
.cin-slide{animation:cinSlide .35s ease both}
.cin-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.06) 50%,transparent 100%);background-size:200% 100%;animation:cinShimmer 2.5s linear infinite}
.cin-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 8px 24px rgba(0,0,0,.5)}
.cin-scroll::-webkit-scrollbar{display:none}
`

function injectCSS() {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
  const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
  document.head.appendChild(s)
}

/* ═══════════════════════════════════════════════════════════════════
   VILLAGE DEFINITIONS
═══════════════════════════════════════════════════════════════════ */
interface Village {
  id: string; name: string; emoji: string; accent: string; films: number
}

const VILLAGES: Village[] = [
  { id: 'health',       name: 'Health',       emoji: '\u2695\uFE0F', accent: '#0ea5e9', films: 42 },
  { id: 'agriculture',  name: 'Agriculture',  emoji: '\uD83C\uDF3E', accent: '#16a34a', films: 38 },
  { id: 'education',    name: 'Education',    emoji: '\uD83C\uDF93', accent: '#8b5cf6', films: 55 },
  { id: 'justice',      name: 'Justice',      emoji: '\u2696\uFE0F', accent: '#dc2626', films: 27 },
  { id: 'finance',      name: 'Finance',      emoji: '\uD83D\uDCB0', accent: '#eab308', films: 31 },
  { id: 'builders',     name: 'Builders',     emoji: '\uD83C\uDFD7\uFE0F', accent: '#f97316', films: 34 },
  { id: 'technology',   name: 'Technology',   emoji: '\uD83D\uDCBB', accent: '#06b6d4', films: 48 },
  { id: 'arts',         name: 'Arts',         emoji: '\uD83C\uDFA8', accent: '#e879f9', films: 63 },
  { id: 'media',        name: 'Media',        emoji: '\uD83C\uDFA5', accent: '#fb923c', films: 57 },
  { id: 'commerce',     name: 'Commerce',     emoji: '\uD83E\uDDFA', accent: '#f43f5e', films: 36 },
  { id: 'security',     name: 'Security',     emoji: '\uD83D\uDEE1\uFE0F', accent: '#64748b', films: 22 },
  { id: 'spirituality', name: 'Spirituality', emoji: '\uD83D\uDD4A\uFE0F', accent: '#a78bfa', films: 29 },
  { id: 'fashion',      name: 'Fashion',      emoji: '\uD83D\uDC57', accent: '#ec4899', films: 44 },
  { id: 'family',       name: 'Family',       emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66', accent: '#14b8a6', films: 51 },
  { id: 'transport',    name: 'Transport',    emoji: '\uD83D\uDE9A', accent: '#78716c', films: 19 },
  { id: 'energy',       name: 'Energy',       emoji: '\u26A1',       accent: '#facc15', films: 26 },
  { id: 'hospitality',  name: 'Hospitality',  emoji: '\uD83C\uDFE8', accent: '#2dd4bf', films: 33 },
  { id: 'government',   name: 'Government',   emoji: '\uD83C\uDFDB\uFE0F', accent: '#94a3b8', films: 25 },
  { id: 'sports',       name: 'Sports',       emoji: '\u26BD',       accent: '#22c55e', films: 40 },
  { id: 'holdings',     name: 'Holdings',     emoji: '\uD83C\uDFF0', accent: '#d4a017', films: 18 },
]

/* ═══════════════════════════════════════════════════════════════════
   CONTENT TYPES & MOCK DATA
═══════════════════════════════════════════════════════════════════ */
type ContentType = 'FILM' | 'SERIES' | 'DOCUMENTARY' | 'SHORT' | 'MUSIC_VIDEO' | 'PODCAST_VIDEO'
type GeoLevel = 'village' | 'state' | 'country' | 'africa' | 'global'

interface CinemaContent {
  id: string
  title: string
  creator: string
  village: string
  type: ContentType
  duration: string
  episodes?: number
  rating: number
  viewers: number
  invested: number
  earned?: number
  geo: string
  geoFlag: string
  poster: string
  posterColor: string
  trending?: boolean
  newRelease?: boolean
  mostInvested?: boolean
  villagePick?: boolean
  panAfrican?: boolean
  description: string
}

const CONTENT: CinemaContent[] = [
  {
    id: 'c1', title: 'Ori: The Awakening', creator: 'Amara Okafor',
    village: 'arts', type: 'FILM', duration: '2h 14m', rating: 4.8,
    viewers: 142300, invested: 85000, geo: 'Nigeria', geoFlag: '\uD83C\uDDF3\uD83C\uDDEC',
    poster: '\uD83C\uDFA8', posterColor: '#7c3aed',
    trending: true, panAfrican: true,
    description: 'A young sculptor in Lagos discovers her ancestral gift of bringing clay to life, threatening the corporate art world.'
  },
  {
    id: 'c2', title: 'Roots of Fire', creator: 'Kwame Asante',
    village: 'agriculture', type: 'DOCUMENTARY', duration: '1h 48m', rating: 4.6,
    viewers: 89400, invested: 124000, geo: 'Ghana', geoFlag: '\uD83C\uDDEC\uD83C\uDDED',
    poster: '\uD83C\uDF3E', posterColor: '#16a34a',
    mostInvested: true, trending: true,
    description: 'How Ghanaian cocoa farmers are building cooperative empires using blockchain and traditional knowledge.'
  },
  {
    id: 'c3', title: 'Code of the Ancestors', creator: 'Fatima Al-Rashid',
    village: 'technology', type: 'SERIES', duration: '45m', episodes: 8, rating: 4.9,
    viewers: 231000, invested: 67000, earned: 2400, geo: 'Kenya', geoFlag: '\uD83C\uDDF0\uD83C\uDDEA',
    poster: '\uD83D\uDCBB', posterColor: '#06b6d4',
    trending: true, newRelease: true, panAfrican: true,
    description: 'A Nairobi AI researcher uncovers ancient mathematical systems encoded in Luo beadwork.'
  },
  {
    id: 'c4', title: 'The Healer\'s Path', creator: 'Dr. Ngozi Eze',
    village: 'health', type: 'DOCUMENTARY', duration: '1h 32m', rating: 4.7,
    viewers: 67800, invested: 45000, geo: 'Nigeria', geoFlag: '\uD83C\uDDF3\uD83C\uDDEC',
    poster: '\u2695\uFE0F', posterColor: '#0ea5e9',
    villagePick: true, newRelease: true,
    description: 'Traditional medicine meets modern science in the villages of Igboland.'
  },
  {
    id: 'c5', title: 'Mbira Dreams', creator: 'Tendai Moyo',
    village: 'arts', type: 'MUSIC_VIDEO', duration: '8m', rating: 4.5,
    viewers: 456000, invested: 12000, geo: 'Zimbabwe', geoFlag: '\uD83C\uDDFF\uD83C\uDDFC',
    poster: '\uD83C\uDFB6', posterColor: '#e879f9',
    trending: true,
    description: 'A cinematic journey through the spiritual world of the mbira instrument.'
  },
  {
    id: 'c6', title: 'Silk & Steel', creator: 'Aisha Diallo',
    village: 'fashion', type: 'SERIES', duration: '35m', episodes: 12, rating: 4.4,
    viewers: 178000, invested: 93000, earned: 1800, geo: 'Senegal', geoFlag: '\uD83C\uDDF8\uD83C\uDDF3',
    poster: '\uD83D\uDC57', posterColor: '#ec4899',
    newRelease: true, mostInvested: true,
    description: 'The cutthroat world of Dakar fashion, where tradition and haute couture collide.'
  },
  {
    id: 'c7', title: 'Ubuntu Court', creator: 'Justice Mpho Kgari',
    village: 'justice', type: 'SERIES', duration: '50m', episodes: 6, rating: 4.3,
    viewers: 54200, invested: 38000, geo: 'South Africa', geoFlag: '\uD83C\uDDFF\uD83C\uDDE6',
    poster: '\u2696\uFE0F', posterColor: '#dc2626',
    villagePick: true,
    description: 'A legal drama where disputes are settled through restorative justice and community wisdom.'
  },
  {
    id: 'c8', title: 'Cowrie Kings', creator: 'Emeka Obi',
    village: 'finance', type: 'DOCUMENTARY', duration: '1h 55m', rating: 4.6,
    viewers: 93100, invested: 210000, earned: 5600, geo: 'Nigeria', geoFlag: '\uD83C\uDDF3\uD83C\uDDEC',
    poster: '\uD83D\uDCB0', posterColor: '#eab308',
    mostInvested: true, panAfrican: true,
    description: 'The story of how cowrie shells shaped African economies for millennia, and why they are returning.'
  },
  {
    id: 'c9', title: 'The Last Griot', creator: 'Sekou Toure',
    village: 'education', type: 'FILM', duration: '2h 5m', rating: 4.9,
    viewers: 312000, invested: 156000, geo: 'Mali', geoFlag: '\uD83C\uDDF2\uD83C\uDDF1',
    poster: '\uD83C\uDF93', posterColor: '#8b5cf6',
    panAfrican: true, villagePick: true,
    description: 'A dying griot must find a successor before centuries of oral history are lost forever.'
  },
  {
    id: 'c10', title: 'Compound Warriors', creator: 'Bayo Adeyemi',
    village: 'sports', type: 'SERIES', duration: '40m', episodes: 10, rating: 4.2,
    viewers: 287000, invested: 72000, geo: 'Nigeria', geoFlag: '\uD83C\uDDF3\uD83C\uDDEC',
    poster: '\u26BD', posterColor: '#22c55e',
    trending: true, newRelease: true,
    description: 'Young athletes from Lagos compounds compete for a chance to play for top African clubs.'
  },
  {
    id: 'c11', title: 'Builders of Timbuktu', creator: 'Ibrahim Keita',
    village: 'builders', type: 'DOCUMENTARY', duration: '1h 40m', rating: 4.7,
    viewers: 76500, invested: 55000, geo: 'Mali', geoFlag: '\uD83C\uDDF2\uD83C\uDDF1',
    poster: '\uD83C\uDFD7\uFE0F', posterColor: '#f97316',
    villagePick: true,
    description: 'Architects restore the mud-brick libraries of Timbuktu using ancestral techniques and modern engineering.'
  },
  {
    id: 'c12', title: 'Signal Tower', creator: 'Grace Wanjiku',
    village: 'media', type: 'FILM', duration: '1h 52m', rating: 4.1,
    viewers: 118000, invested: 43000, geo: 'Kenya', geoFlag: '\uD83C\uDDF0\uD83C\uDDEA',
    poster: '\uD83C\uDFA5', posterColor: '#fb923c',
    newRelease: true,
    description: 'A Nairobi pirate radio operator becomes the voice of a movement during a media blackout.'
  },
  {
    id: 'c13', title: 'Mama Soko', creator: 'Amina Hassan',
    village: 'commerce', type: 'SHORT', duration: '22m', rating: 4.8,
    viewers: 203000, invested: 31000, geo: 'Tanzania', geoFlag: '\uD83C\uDDF9\uD83C\uDDFF',
    poster: '\uD83E\uDDFA', posterColor: '#f43f5e',
    trending: true, panAfrican: true,
    description: 'A short film about the legendary market women who control East Africa\'s spice trade.'
  },
  {
    id: 'c14', title: 'Solar Nation', creator: 'Kofi Mensah',
    village: 'energy', type: 'DOCUMENTARY', duration: '1h 28m', rating: 4.5,
    viewers: 61200, invested: 89000, geo: 'Ghana', geoFlag: '\uD83C\uDDEC\uD83C\uDDED',
    poster: '\u26A1', posterColor: '#facc15',
    mostInvested: true,
    description: 'How off-grid solar is transforming rural Ghana, one village at a time.'
  },
  {
    id: 'c15', title: 'The Night Market', creator: 'Chidinma Eze',
    village: 'hospitality', type: 'SERIES', duration: '30m', episodes: 16, rating: 4.6,
    viewers: 345000, invested: 147000, earned: 3200, geo: 'Nigeria', geoFlag: '\uD83C\uDDF3\uD83C\uDDEC',
    poster: '\uD83C\uDFE8', posterColor: '#2dd4bf',
    trending: true, villagePick: true,
    description: 'A food-and-travel series exploring the best night markets across West Africa.'
  },
  {
    id: 'c16', title: 'Ancestor Protocol', creator: 'Zainab Conteh',
    village: 'spirituality', type: 'FILM', duration: '2h 1m', rating: 4.4,
    viewers: 48700, invested: 27000, geo: 'Sierra Leone', geoFlag: '\uD83C\uDDF8\uD83C\uDDF1',
    poster: '\uD83D\uDD4A\uFE0F', posterColor: '#a78bfa',
    description: 'A woman returns to Freetown to perform her grandmother\'s unfinished ceremony.'
  },
  {
    id: 'c17', title: 'Caravan Routes', creator: 'Ahmed Bello',
    village: 'transport', type: 'PODCAST_VIDEO', duration: '55m', rating: 4.0,
    viewers: 33100, invested: 15000, geo: 'Niger', geoFlag: '\uD83C\uDDF3\uD83C\uDDEA',
    poster: '\uD83D\uDE9A', posterColor: '#78716c',
    description: 'A podcast exploring the ancient trade routes that still connect West African economies.'
  },
  {
    id: 'c18', title: 'The Shield', creator: 'Capt. Otieno Ruto',
    village: 'security', type: 'SERIES', duration: '48m', episodes: 8, rating: 4.3,
    viewers: 72400, invested: 51000, geo: 'Kenya', geoFlag: '\uD83C\uDDF0\uD83C\uDDEA',
    poster: '\uD83D\uDEE1\uFE0F', posterColor: '#64748b',
    newRelease: true,
    description: 'A cyber-security team protects African financial infrastructure from global threats.'
  },
  {
    id: 'c19', title: 'Idile: Our Bloodline', creator: 'Yemi Alade-Williams',
    village: 'family', type: 'DOCUMENTARY', duration: '1h 36m', rating: 4.8,
    viewers: 198000, invested: 112000, geo: 'Nigeria', geoFlag: '\uD83C\uDDF3\uD83C\uDDEC',
    poster: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66', posterColor: '#14b8a6',
    panAfrican: true, villagePick: true,
    description: 'Five families trace their lineage across the African diaspora using DNA and oral history.'
  },
  {
    id: 'c20', title: 'The Sovereign', creator: 'Nana Ama Boateng',
    village: 'holdings', type: 'FILM', duration: '2h 22m', rating: 4.7,
    viewers: 87300, invested: 340000, earned: 12000, geo: 'Ghana', geoFlag: '\uD83C\uDDEC\uD83C\uDDED',
    poster: '\uD83C\uDFF0', posterColor: '#d4a017',
    mostInvested: true, panAfrican: true,
    description: 'A Pan-African billionaire builds a sovereign city-state, but power reveals uncomfortable truths.'
  },
]

/* ── helpers ── */
const GEO_LEVELS: { key: GeoLevel; label: string; emoji: string }[] = [
  { key: 'village', label: 'Village', emoji: '\uD83C\uDFD8' },
  { key: 'state',   label: 'State',   emoji: '\uD83C\uDFD9' },
  { key: 'country', label: 'Country', emoji: '\uD83C\uDDEA' },
  { key: 'africa',  label: 'Africa',  emoji: '\uD83C\uDF0D' },
  { key: 'global',  label: 'Global',  emoji: '\u2B50' },
]

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span style={{ color: '#d4a017', fontSize: 13, letterSpacing: 1 }}>
      {'\u2605'.repeat(full)}{half ? '\u2606' : ''}{'\u2606'.repeat(empty)}
      <span style={{ color: '#a0a0a0', marginLeft: 4, fontSize: 11 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

function TypeBadge({ type }: { type: ContentType }) {
  const map: Record<ContentType, { label: string; bg: string }> = {
    FILM:          { label: 'Film',      bg: 'rgba(139,92,246,.3)' },
    SERIES:        { label: 'Series',    bg: 'rgba(6,182,212,.3)' },
    DOCUMENTARY:   { label: 'Doc',       bg: 'rgba(22,163,74,.3)' },
    SHORT:         { label: 'Short',     bg: 'rgba(244,63,94,.3)' },
    MUSIC_VIDEO:   { label: 'Music',     bg: 'rgba(232,121,249,.3)' },
    PODCAST_VIDEO: { label: 'Podcast',   bg: 'rgba(120,113,108,.3)' },
  }
  const m = map[type]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
      background: m.bg, color: '#fff', textTransform: 'uppercase', letterSpacing: .5,
    }}>{m.label}</span>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CONTENT CARD (reusable)
═══════════════════════════════════════════════════════════════════ */
function ContentCard({ c, style }: { c: CinemaContent; style?: React.CSSProperties }) {
  const v = VILLAGES.find(v => v.id === c.village)
  return (
    <div className="cin-card" style={{
      width: 172, minWidth: 172, borderRadius: 12, overflow: 'hidden',
      background: '#1a1410', border: '1px solid rgba(255,255,255,.08)',
      transition: 'transform .2s, box-shadow .2s', cursor: 'pointer',
      ...style,
    }}>
      {/* poster area */}
      <div style={{
        height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${c.posterColor}33, ${c.posterColor}11)`,
        position: 'relative',
      }}>
        <span style={{ fontSize: 42 }}>{c.poster}</span>
        <div style={{
          position: 'absolute', top: 6, left: 6,
          display: 'flex', gap: 4,
        }}>
          <TypeBadge type={c.type} />
        </div>
        <div style={{
          position: 'absolute', top: 6, right: 6,
          fontSize: 10, background: 'rgba(0,0,0,.6)', padding: '1px 5px',
          borderRadius: 4, color: '#fff',
        }}>
          {c.geoFlag}
        </div>
        {c.episodes && (
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            fontSize: 10, background: 'rgba(0,0,0,.7)', padding: '1px 6px',
            borderRadius: 4, color: '#ccc',
          }}>
            {c.episodes} eps
          </div>
        )}
      </div>
      {/* info */}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#f0f7f0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontFamily: 'Sora, sans-serif',
        }}>{c.title}</div>
        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{c.creator}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <Stars rating={c.rating} />
          <span style={{ fontSize: 10, color: '#777' }}>{c.duration}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 10, color: v?.accent || '#888' }}>
            {v?.emoji} {v?.name}
          </span>
          {c.earned != null && (
            <span style={{ fontSize: 10, color: '#d4a017', fontWeight: 700 }}>
              +\u20A1{fmtNum(c.earned)}
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, color: '#666', marginTop: 3 }}>
          {fmtNum(c.viewers)} viewers
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   HORIZONTAL SCROLL ROW
═══════════════════════════════════════════════════════════════════ */
function ScrollRow({ title, items, titleColor }: {
  title: string; items: CinemaContent[]; titleColor?: string
}) {
  if (!items.length) return null
  return (
    <div className="cin-fade" style={{ marginBottom: 28 }}>
      <h3 style={{
        fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700,
        color: titleColor || '#f0f7f0', margin: '0 0 12px 0',
      }}>{title}</h3>
      <div className="cin-scroll" style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
      }}>
        {items.map((c, i) => (
          <ContentCard key={c.id} c={c} style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   FEATURED HERO CARD
═══════════════════════════════════════════════════════════════════ */
function FeaturedHero({ content, onWatch, onWatchlist, onInvest }: {
  content: CinemaContent
  onWatch: () => void
  onWatchlist: () => void
  onInvest: () => void
}) {
  const v = VILLAGES.find(v => v.id === content.village)
  return (
    <div className="cin-fade" style={{
      borderRadius: 16, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(160deg, ${content.posterColor}44 0%, #0d080499 60%, #0d0804 100%)`,
      border: '1px solid rgba(255,255,255,.1)',
      marginBottom: 24,
    }}>
      <div className="cin-shimmer" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .3,
      }} />
      <div style={{ position: 'relative', padding: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* poster */}
          <div style={{
            width: 140, height: 180, borderRadius: 12,
            background: `linear-gradient(135deg, ${content.posterColor}55, ${content.posterColor}22)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64, flexShrink: 0,
            boxShadow: `0 8px 32px ${content.posterColor}44`,
          }}>
            {content.poster}
          </div>
          {/* info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
              <TypeBadge type={content.type} />
              <span style={{
                fontSize: 11, background: `${v?.accent || '#555'}33`,
                color: v?.accent, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
              }}>
                {v?.emoji} {v?.name} Village
              </span>
              <span style={{ fontSize: 11, color: '#999' }}>{content.geoFlag} {content.geo}</span>
            </div>
            <h2 style={{
              fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800,
              color: '#f0f7f0', margin: '4px 0 6px',
              textShadow: `0 2px 12px ${content.posterColor}66`,
            }}>{content.title}</h2>
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 4 }}>
              by <span style={{ color: '#d4a017', fontWeight: 600 }}>{content.creator}</span>
            </div>
            <div style={{ fontSize: 13, color: '#999', lineHeight: 1.5, marginBottom: 10, maxWidth: 460 }}>
              {content.description}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <Stars rating={content.rating} />
              <span style={{ fontSize: 12, color: '#999' }}>{content.duration}</span>
              {content.episodes && (
                <span style={{ fontSize: 12, color: '#999' }}>{content.episodes} episodes</span>
              )}
              <span style={{ fontSize: 12, color: '#aaa' }}>{fmtNum(content.viewers)} viewers</span>
              <span style={{ fontSize: 12, color: '#d4a017' }}>\u20A1{fmtNum(content.invested)} invested</span>
            </div>
            {/* action buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={onWatch} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#d4a017', color: '#0d0804', fontWeight: 800, fontSize: 14,
                fontFamily: 'Sora, sans-serif', animation: 'cinGlow 2s ease infinite',
              }}>
                \u25B6 Watch Now
              </button>
              <button onClick={onWatchlist} style={{
                padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,.2)',
                color: '#f0f7f0', fontWeight: 600, fontSize: 13,
              }}>
                + Watchlist
              </button>
              <button onClick={onInvest} style={{
                padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(212,160,23,.15)', border: '1px solid #d4a01744',
                color: '#d4a017', fontWeight: 700, fontSize: 13,
              }}>
                \u20A1 Invest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   METRICS BAR
═══════════════════════════════════════════════════════════════════ */
function MetricsBar() {
  const totalContent = CONTENT.length
  const totalVillages = new Set(CONTENT.map(c => c.village)).size
  const totalCreators = new Set(CONTENT.map(c => c.creator)).size
  const weekCowrie = CONTENT.reduce((sum, c) => sum + c.invested, 0)
  const stats = [
    { label: 'Total Content', value: `${totalContent * 31}+`, icon: '\uD83C\uDFAC' },
    { label: 'Active Villages', value: `${totalVillages}/20`, icon: '\uD83C\uDFD8' },
    { label: 'Creators', value: fmtNum(totalCreators * 84), icon: '\uD83C\uDFA8' },
    { label: 'Cowrie This Week', value: `\u20A1${fmtNum(weekCowrie)}`, icon: '\uD83D\uDCB0' },
  ]
  return (
    <div className="cin-fade" style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      marginBottom: 24,
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: '#1a1410', borderRadius: 10, padding: '12px 10px',
          textAlign: 'center', border: '1px solid rgba(255,255,255,.06)',
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
          <div style={{
            fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800,
            color: '#d4a017',
          }}>{s.value}</div>
          <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   GEO DISTRIBUTION LAYER
═══════════════════════════════════════════════════════════════════ */
function GeoDistribution({ selected, onChange, content }: {
  selected: GeoLevel
  onChange: (g: GeoLevel) => void
  content: CinemaContent
}) {
  const rings: { level: GeoLevel; radius: number; count: number; color: string }[] = [
    { level: 'village', radius: 24,  count: Math.round(content.viewers * 0.15), color: '#d4a017' },
    { level: 'state',   radius: 44,  count: Math.round(content.viewers * 0.30), color: '#f97316' },
    { level: 'country', radius: 64,  count: Math.round(content.viewers * 0.55), color: '#ef4444' },
    { level: 'africa',  radius: 86,  count: Math.round(content.viewers * 0.85), color: '#8b5cf6' },
    { level: 'global',  radius: 108, count: content.viewers, color: '#06b6d4' },
  ]
  return (
    <div className="cin-fade" style={{ marginBottom: 28 }}>
      <h3 style={{
        fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700,
        color: '#f0f7f0', margin: '0 0 14px 0',
      }}>Geo Distribution</h3>
      {/* filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {GEO_LEVELS.map(g => (
          <button key={g.key} onClick={() => onChange(g.key)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: selected === g.key ? '#d4a017' : 'rgba(255,255,255,.08)',
            color: selected === g.key ? '#0d0804' : '#ccc',
            fontWeight: selected === g.key ? 700 : 500, fontSize: 12,
            transition: 'all .2s',
          }}>
            {g.emoji} {g.label}
          </button>
        ))}
      </div>
      {/* reach visualization */}
      <div style={{
        background: '#1a1410', borderRadius: 14, padding: 20,
        border: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        {/* concentric circles */}
        <div style={{
          width: 240, height: 240, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {rings.map((r, i) => {
            const isActive = GEO_LEVELS.findIndex(g => g.key === selected) >= i
            return (
              <div key={r.level} style={{
                position: 'absolute',
                width: r.radius * 2, height: r.radius * 2,
                borderRadius: '50%',
                border: `2px solid ${isActive ? r.color : 'rgba(255,255,255,.08)'}`,
                background: isActive ? `${r.color}11` : 'transparent',
                transition: 'all .4s ease',
                opacity: isActive ? 1 : .3,
              }} />
            )
          })}
          <span style={{ fontSize: 28, zIndex: 1 }}>{content.poster}</span>
        </div>
        {/* stats column */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{
            fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700,
            color: '#f0f7f0', marginBottom: 12,
          }}>
            Reach for: {content.title}
          </div>
          {rings.map(r => {
            const geo = GEO_LEVELS.find(g => g.key === r.level)!
            const isActive = GEO_LEVELS.findIndex(g => g.key === selected) >= GEO_LEVELS.findIndex(g => g.key === r.level)
            const pct = Math.round((r.count / content.viewers) * 100)
            return (
              <div key={r.level} style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                opacity: isActive ? 1 : .4, transition: 'opacity .3s',
              }}>
                <span style={{ fontSize: 14, width: 20 }}>{geo.emoji}</span>
                <span style={{ fontSize: 12, color: '#ccc', width: 60 }}>{geo.label}</span>
                <div style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: 'rgba(255,255,255,.06)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: r.color, width: `${pct}%`,
                    transition: 'width .5s ease',
                  }} />
                </div>
                <span style={{ fontSize: 11, color: r.color, width: 50, textAlign: 'right', fontWeight: 600 }}>
                  {fmtNum(r.count)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   WATCH PARTY PANEL
═══════════════════════════════════════════════════════════════════ */
function WatchPartyPanel({ content, onClose }: { content: CinemaContent; onClose: () => void }) {
  const [inviteId, setInviteId] = React.useState('')
  const [guests, setGuests] = React.useState<string[]>([])
  const [sprayAmt, setSprayAmt] = React.useState(50)
  const [chatMsg, setChatMsg] = React.useState('')
  const [chatLog, setChatLog] = React.useState<{ from: string; msg: string; time: string }[]>([
    { from: 'System', msg: `Watch party for "${content.title}" created!`, time: 'now' },
  ])

  const addGuest = () => {
    if (inviteId.trim() && !guests.includes(inviteId.trim())) {
      setGuests(p => [...p, inviteId.trim()])
      setChatLog(p => [...p, { from: 'System', msg: `${inviteId.trim()} invited`, time: 'now' }])
      setInviteId('')
    }
  }

  const sendChat = () => {
    if (chatMsg.trim()) {
      setChatLog(p => [...p, { from: 'You', msg: chatMsg.trim(), time: 'now' }])
      setChatMsg('')
    }
  }

  const spray = () => {
    setChatLog(p => [...p, { from: 'You', msg: `Sprayed \u20A1${sprayAmt} on "${content.title}"!`, time: 'now' }])
  }

  return (
    <div className="cin-fade" style={{
      background: '#1a1410', borderRadius: 14, padding: 20,
      border: '1px solid rgba(212,160,23,.3)', marginBottom: 28,
      animation: 'partyPulse 2s ease infinite',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{
          fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700,
          color: '#d4a017', margin: 0,
        }}>Watch Party</h3>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#999', fontSize: 18, cursor: 'pointer',
        }}>X</button>
      </div>

      {/* now watching */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        background: 'rgba(212,160,23,.08)', borderRadius: 10, padding: 10,
      }}>
        <span style={{ fontSize: 32 }}>{content.poster}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f7f0', fontFamily: 'Sora, sans-serif' }}>
            {content.title}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>{content.creator} | {content.duration}</div>
        </div>
        <div style={{
          marginLeft: 'auto', background: '#ef4444', width: 8, height: 8,
          borderRadius: '50%', animation: 'cinPulse 1.2s ease infinite',
        }} />
      </div>

      {/* invite row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={inviteId} onChange={e => setInviteId(e.target.value)}
          placeholder="Invite by AfroID..."
          onKeyDown={e => e.key === 'Enter' && addGuest()}
          style={{
            flex: 1, background: '#0d0804', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '8px 12px', color: '#f0f7f0', fontSize: 13,
            outline: 'none',
          }}
        />
        <button onClick={addGuest} style={{
          background: '#d4a017', color: '#0d0804', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 12,
        }}>Invite</button>
      </div>

      {/* guest list */}
      {guests.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {guests.map(g => (
            <span key={g} style={{
              background: 'rgba(212,160,23,.15)', color: '#d4a017',
              padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
            }}>{g}</span>
          ))}
        </div>
      )}

      {/* chat sidebar */}
      <div style={{
        background: '#0d0804', borderRadius: 10, padding: 10,
        maxHeight: 160, overflowY: 'auto', marginBottom: 12,
        border: '1px solid rgba(255,255,255,.06)',
      }}>
        {chatLog.map((m, i) => (
          <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
            <span style={{
              color: m.from === 'System' ? '#d4a017' : m.from === 'You' ? '#4ade80' : '#ccc',
              fontWeight: 600,
            }}>{m.from}: </span>
            <span style={{ color: '#ccc' }}>{m.msg}</span>
          </div>
        ))}
      </div>

      {/* send + spray */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={chatMsg} onChange={e => setChatMsg(e.target.value)}
          placeholder="Say something..."
          onKeyDown={e => e.key === 'Enter' && sendChat()}
          style={{
            flex: 1, background: '#0d0804', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '8px 12px', color: '#f0f7f0', fontSize: 12,
            outline: 'none',
          }}
        />
        <button onClick={sendChat} style={{
          background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8,
          padding: '8px 12px', color: '#f0f7f0', cursor: 'pointer', fontSize: 12,
        }}>Send</button>
        <button onClick={spray} style={{
          background: 'rgba(212,160,23,.2)', border: '1px solid #d4a01744',
          borderRadius: 8, padding: '8px 12px', color: '#d4a017', cursor: 'pointer',
          fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
        }}>\u20A1{sprayAmt} Spray</button>
      </div>

      {/* spray slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#888' }}>Spray:</span>
        <input
          type="range" min={10} max={1000} step={10}
          value={sprayAmt} onChange={e => setSprayAmt(+e.target.value)}
          style={{ flex: 1, accentColor: '#d4a017' }}
        />
        <span style={{ fontSize: 12, color: '#d4a017', fontWeight: 700 }}>\u20A1{sprayAmt}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function CinemaPage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [selectedVillage, setSelectedVillage] = React.useState<string | null>(null)
  const [geoLevel, setGeoLevel] = React.useState<GeoLevel>('africa')
  const [showParty, setShowParty] = React.useState(false)
  const [watchlist, setWatchlist] = React.useState<Set<string>>(new Set())
  const [featuredIdx, setFeaturedIdx] = React.useState(0)

  React.useEffect(() => { injectCSS() }, [])

  // rotate featured every 8 seconds
  React.useEffect(() => {
    const iv = setInterval(() => {
      setFeaturedIdx(i => (i + 1) % CONTENT.length)
    }, 8000)
    return () => clearInterval(iv)
  }, [])

  // filter content by selected village
  const filteredContent = selectedVillage
    ? CONTENT.filter(c => c.village === selectedVillage)
    : CONTENT

  const featured = filteredContent[featuredIdx % filteredContent.length] || CONTENT[0]

  const trending = filteredContent.filter(c => c.trending)
  const newReleases = filteredContent.filter(c => c.newRelease)
  const mostInvested = filteredContent.filter(c => c.mostInvested)
  const villagePicks = filteredContent.filter(c => c.villagePick)
  const panAfrican = CONTENT.filter(c => c.panAfrican)

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const sv = selectedVillage ? VILLAGES.find(v => v.id === selectedVillage) : null

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0804', color: '#f0f7f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: 100,
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '16px 16px 0',
        background: 'linear-gradient(180deg, rgba(212,160,23,.08) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div>
            <h1 style={{
              fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 800,
              color: '#d4a017', margin: 0,
            }}>
              Village Cinema
            </h1>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              Distributed African Streaming Network
            </div>
          </div>
          <button onClick={() => router.push('/dashboard/jollof')} style={{
            background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 8,
            padding: '8px 14px', color: '#ccc', cursor: 'pointer', fontSize: 12,
          }}>
            \u2190 Jollof TV
          </button>
        </div>

        {/* ── Metrics Bar ── */}
        <MetricsBar />

        {/* ── Village Cinema Browser ── */}
        <div className="cin-scroll" style={{
          display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 14,
        }}>
          {/* All villages pill */}
          <button
            onClick={() => setSelectedVillage(null)}
            style={{
              minWidth: 80, padding: '10px 14px', borderRadius: 12, border: 'none',
              cursor: 'pointer', flexShrink: 0, textAlign: 'center',
              background: !selectedVillage
                ? 'linear-gradient(135deg, #d4a017, #b8860b)'
                : 'rgba(255,255,255,.06)',
              color: !selectedVillage ? '#0d0804' : '#ccc',
              fontWeight: !selectedVillage ? 800 : 500,
              transition: 'all .2s',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>\uD83C\uDF0D</div>
            <div style={{ fontSize: 11 }}>All</div>
            <div style={{ fontSize: 9, opacity: .7 }}>{CONTENT.length * 31} films</div>
          </button>
          {VILLAGES.map(v => {
            const isActive = selectedVillage === v.id
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVillage(v.id)}
                style={{
                  minWidth: 88, padding: '10px 14px', borderRadius: 12, border: 'none',
                  cursor: 'pointer', flexShrink: 0, textAlign: 'center',
                  background: isActive
                    ? `linear-gradient(135deg, ${v.accent}, ${v.accent}99)`
                    : 'rgba(255,255,255,.06)',
                  color: isActive ? '#fff' : '#ccc',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all .2s',
                  boxShadow: isActive ? `0 4px 16px ${v.accent}44` : 'none',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{v.emoji}</div>
                <div style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{v.name}</div>
                <div style={{ fontSize: 9, opacity: .7 }}>{v.films} films</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main content area ── */}
      <div style={{ padding: '0 16px' }}>

        {/* section label if filtered */}
        {sv && (
          <div className="cin-fade" style={{
            display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 12px',
            padding: '8px 14px', borderRadius: 10,
            background: `${sv.accent}15`, border: `1px solid ${sv.accent}33`,
          }}>
            <span style={{ fontSize: 20 }}>{sv.emoji}</span>
            <span style={{
              fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: sv.accent,
            }}>{sv.name} Village Cinema</span>
            <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>
              {sv.films} titles
            </span>
          </div>
        )}

        {/* ── Now Showing / Featured Hero ── */}
        <h3 style={{
          fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700,
          color: '#d4a017', margin: '16px 0 12px',
        }}>Now Showing</h3>
        <FeaturedHero
          content={featured}
          onWatch={() => {/* navigate to player */}}
          onWatchlist={() => toggleWatchlist(featured.id)}
          onInvest={() => {/* invest flow */}}
        />

        {/* ── Watch Party ── */}
        {showParty ? (
          <WatchPartyPanel content={featured} onClose={() => setShowParty(false)} />
        ) : (
          <div className="cin-fade" style={{ marginBottom: 24 }}>
            <button onClick={() => setShowParty(true)} style={{
              width: '100%', padding: '14px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(212,160,23,.12), rgba(212,160,23,.04))',
              border: '1px solid rgba(212,160,23,.25)', color: '#d4a017',
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20, animation: 'cinFloat 2s ease infinite' }}>\uD83C\uDF89</span>
              Start Watch Party
              <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>
                Synced viewing with friends
              </span>
            </button>
          </div>
        )}

        {/* ── Geo Distribution ── */}
        <GeoDistribution selected={geoLevel} onChange={setGeoLevel} content={featured} />

        {/* ── Trending ── */}
        <ScrollRow
          title={`Trending in ${sv ? sv.name + ' Village' : 'All Villages'}`}
          items={trending.length > 0 ? trending : filteredContent.slice(0, 5)}
          titleColor="#ef4444"
        />

        {/* ── New Releases ── */}
        <ScrollRow
          title="New Releases"
          items={newReleases.length > 0 ? newReleases : filteredContent.slice(2, 7)}
          titleColor="#4ade80"
        />

        {/* ── Most Invested ── */}
        <ScrollRow
          title="Most Invested"
          items={mostInvested.length > 0 ? mostInvested : filteredContent.slice(1, 6)}
          titleColor="#d4a017"
        />

        {/* ── Village Picks ── */}
        <ScrollRow
          title={sv ? `${sv.emoji} ${sv.name} Elder Picks` : 'Village Elder Picks'}
          items={villagePicks.length > 0 ? villagePicks : filteredContent.slice(3, 8)}
          titleColor="#a78bfa"
        />

        {/* ── Pan-African Spotlight ── */}
        {(!selectedVillage || panAfrican.some(c => c.village === selectedVillage)) && (
          <ScrollRow
            title="Pan-African Spotlight"
            items={panAfrican}
            titleColor="#06b6d4"
          />
        )}

        {/* ── Full Catalog Grid ── */}
        <div className="cin-fade" style={{ marginTop: 8 }}>
          <h3 style={{
            fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700,
            color: '#f0f7f0', margin: '0 0 14px 0',
          }}>
            {sv ? `All ${sv.name} Titles` : 'Full Catalog'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(164px, 1fr))',
            gap: 12,
          }}>
            {filteredContent.map(c => (
              <ContentCard key={c.id} c={c} style={{ width: '100%', minWidth: 0 }} />
            ))}
          </div>
        </div>

        {/* ── Watchlist ── */}
        {watchlist.size > 0 && (
          <div className="cin-fade" style={{ marginTop: 28 }}>
            <h3 style={{
              fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700,
              color: '#d4a017', margin: '0 0 14px 0',
            }}>Your Watchlist</h3>
            <div className="cin-scroll" style={{
              display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
            }}>
              {CONTENT.filter(c => watchlist.has(c.id)).map(c => (
                <ContentCard key={c.id} c={c} />
              ))}
            </div>
          </div>
        )}

        {/* ── Village Cinema Network Stats Footer ── */}
        <div className="cin-fade" style={{
          marginTop: 32, padding: 20, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(212,160,23,.06), rgba(212,160,23,.02))',
          border: '1px solid rgba(212,160,23,.15)',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700,
            color: '#d4a017', marginBottom: 8,
          }}>Village Cinema Network</div>
          <div style={{ fontSize: 12, color: '#999', lineHeight: 1.7 }}>
            Each village curates its own catalog. Invest in content you believe in.
            <br />
            Creators earn from views and community investment.
            <br />
            Content propagates through geo layers: Village to State to Country to Africa to Global.
          </div>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap',
          }}>
            {VILLAGES.slice(0, 8).map(v => (
              <span key={v.id} style={{ fontSize: 11, color: v.accent }}>
                {v.emoji} {v.name}
              </span>
            ))}
            <span style={{ fontSize: 11, color: '#666' }}>+12 more</span>
          </div>
        </div>
      </div>
    </div>
  )
}
