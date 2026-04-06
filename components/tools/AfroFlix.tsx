'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Content {
  id: string
  type: 'movie' | 'series' | 'music' | 'standup' | 'cultural' | 'documentary'
  title: string
  creatorId: string
  creatorName: string
  creatorVillage: string
  description: string
  duration: string
  language: string
  accessType: 'free' | 'paid_5' | 'paid_10' | 'subscription'
  views: number
  streams: number
  cowriesEarned: number
  uploadedAt: number
  color: string
  tags: string[]
}

interface Artist {
  id: string
  name: string
  village: string
  genre: string
  followers: number
  monthlyStreams: number
  color: string
  tracks: Track[]
}

interface Track {
  id: string
  title: string
  artistId: string
  artistName: string
  village: string
  duration: string
  durationSecs: number
  genre: string
  color: string
}

interface DailyEarning {
  day: string
  amount: number
}

type TabKey = 'browse' | 'stream' | 'create' | 'foryou'
type CategoryFilter = 'All' | 'Movies' | 'Series' | 'Music' | 'Stand-Up' | 'Cultural' | 'Documentaries'
type Playlist = 'Pan-African Hits' | 'Afrobeats' | 'Highlife' | 'Afrosoul' | 'Gospel'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'afroflix_v2'

const C = {
  bg: '#050a06',
  card: '#0d1a0e',
  card2: '#111f12',
  border: '#1a2e1a',
  text: '#f0f7f0',
  sub: '#6b8f6b',
  muted: '#0a140b',
  green: '#4ade80',
  gold: '#d4a017',
  red: '#ef4444',
  purple: '#a855f7',
}

const CATEGORY_ICONS: Record<string, string> = {
  All: '🎞️', Movies: '🎬', Series: '📺', Music: '🎵',
  'Stand-Up': '🎤', Cultural: '🎭', Documentaries: '📽️',
}

const TYPE_LABEL: Record<Content['type'], string> = {
  movie: 'Movies', series: 'Series', music: 'Music',
  standup: 'Stand-Up', cultural: 'Cultural', documentary: 'Documentaries',
}

const VILLAGE_FLAGS: Record<string, string> = {
  'Nok Village': '🎭',
  'Kemet Village': '🌾',
  'Yoruba Quarter': '🥁',
  'Nairobi-East': '🦁',
  'Jamestown-Accra': '🌊',
  'Lagos-Island': '🌆',
  'Oyo-North': '🌀',
  'Kigali-Heights': '🦅',
  'Abidjan-Sud': '🌺',
  'Zanzibar-Coast': '⛵',
}

const vFlag = (v: string) => VILLAGE_FLAGS[v] || '🏘️'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CONTENT: Content[] = [
  {
    id: 'c1', type: 'movie', title: 'Nneka the Pretty Serpent',
    creatorId: 'nkiru_01', creatorName: 'Nkiru Okafor', creatorVillage: 'Nok Village',
    description: 'A timeless Nollywood masterpiece — a tale of beauty, betrayal and ancestral spirits in the Eastern forests.',
    duration: '1h 45m', language: 'Igbo', accessType: 'free',
    views: 8421, streams: 0, cowriesEarned: 168, uploadedAt: Date.now() - 86400000 * 3,
    color: '#7c3aed', tags: ['nollywood', 'igbo', 'folklore'],
  },
  {
    id: 'c2', type: 'series', title: 'Accra Street Kings S1',
    creatorId: 'ghfilms_01', creatorName: 'Kofi Mensah', creatorVillage: 'Jamestown-Accra',
    description: 'Street hustlers navigate life in Accra\'s Jamestown district. 8 episodes of raw, unfiltered Ghanaian drama.',
    duration: '45m / ep', language: 'Twi', accessType: 'subscription',
    views: 5900, streams: 0, cowriesEarned: 118, uploadedAt: Date.now() - 86400000 * 5,
    color: '#d97706', tags: ['ghana', 'drama', 'twi'],
  },
  {
    id: 'c3', type: 'standup', title: 'Basketmouth Live: Africa Laughs',
    creatorId: 'comedy_ng', creatorName: 'Bright Okpocha', creatorVillage: 'Lagos-Island',
    description: 'A hilarious 90-minute stand-up special about African family life, jollof wars, and the village WhatsApp group.',
    duration: '1h 32m', language: 'Pidgin', accessType: 'paid_5',
    views: 11050, streams: 0, cowriesEarned: 8840, uploadedAt: Date.now() - 86400000 * 2,
    color: '#059669', tags: ['comedy', 'nigeria', 'pidgin'],
  },
  {
    id: 'c4', type: 'cultural', title: 'Egungun Masquerade Ceremony',
    creatorId: 'oyo_kingdom', creatorName: 'Alhaji Suleiman', creatorVillage: 'Oyo-North',
    description: 'Rare footage of the annual Egungun ancestral masquerade festival. Shot over 3 days in sacred forest groves.',
    duration: '58m', language: 'Yoruba', accessType: 'free',
    views: 3200, streams: 0, cowriesEarned: 64, uploadedAt: Date.now() - 86400000 * 7,
    color: '#db2777', tags: ['yoruba', 'ceremony', 'ancestral'],
  },
  {
    id: 'c5', type: 'series', title: 'Nairobi Nights S2',
    creatorId: 'nairobi_studio', creatorName: 'Aisha Wanjiru', creatorVillage: 'Nairobi-East',
    description: 'Four women in modern-day Nairobi navigate love, ambition, and betrayal. Season 2 is darker and bolder.',
    duration: '50m / ep', language: 'Swahili', accessType: 'subscription',
    views: 7830, streams: 0, cowriesEarned: 157, uploadedAt: Date.now() - 86400000 * 4,
    color: '#2563eb', tags: ['kenya', 'drama', 'swahili'],
  },
  {
    id: 'c6', type: 'documentary', title: 'The Last Griots of Mali',
    creatorId: 'mali_docs', creatorName: 'Fatoumata Diallo', creatorVillage: 'Kemet Village',
    description: 'An intimate portrait of the vanishing Griot tradition — oral historians who carry 800 years of African memory.',
    duration: '1h 22m', language: 'Bambara', accessType: 'free',
    views: 4100, streams: 0, cowriesEarned: 82, uploadedAt: Date.now() - 86400000 * 10,
    color: '#854d0e', tags: ['mali', 'history', 'griot'],
  },
  {
    id: 'c7', type: 'movie', title: 'Sankofa Rising',
    creatorId: 'kigali_film', creatorName: 'Emmanuel Habimana', creatorVillage: 'Kigali-Heights',
    description: 'A young Rwandan architect discovers her grandfather\'s blueprints for a utopian village that was never built.',
    duration: '2h 05m', language: 'Kinyarwanda', accessType: 'paid_10',
    views: 6200, streams: 0, cowriesEarned: 4960, uploadedAt: Date.now() - 86400000 * 6,
    color: '#0891b2', tags: ['rwanda', 'afrofuturism', 'architecture'],
  },
  {
    id: 'c8', type: 'standup', title: 'Woli Agba: Village Problems',
    creatorId: 'woli_a', creatorName: 'Bayegun Titus', creatorVillage: 'Yoruba Quarter',
    description: 'Prophet Woli Agba brings his signature style: prophecy, prayer and punching up on village life. NEPA must go!',
    duration: '1h 15m', language: 'Yoruba', accessType: 'free',
    views: 9800, streams: 0, cowriesEarned: 196, uploadedAt: Date.now() - 86400000 * 1,
    color: '#16a34a', tags: ['yoruba', 'comedy', 'religion'],
  },
  {
    id: 'c9', type: 'documentary', title: 'Akosua: Volta River Queen',
    creatorId: 'gh_docs', creatorName: 'Akua Asante', creatorVillage: 'Jamestown-Accra',
    description: 'The story of Akosua, a fisherwoman who leads a movement to reclaim ancestral waters from foreign corporations.',
    duration: '1h 10m', language: 'Akan', accessType: 'paid_5',
    views: 2700, streams: 0, cowriesEarned: 2160, uploadedAt: Date.now() - 86400000 * 8,
    color: '#0369a1', tags: ['ghana', 'activism', 'documentary'],
  },
  {
    id: 'c10', type: 'series', title: 'Abuja Affairs S3',
    creatorId: 'abuja_tv', creatorName: 'Chidinma Eze', creatorVillage: 'Nok Village',
    description: 'Political intrigue, romance and betrayal at the highest levels of Nigerian government. Everybody has a price.',
    duration: '55m / ep', language: 'Hausa/English', accessType: 'subscription',
    views: 13400, streams: 0, cowriesEarned: 268, uploadedAt: Date.now() - 86400000 * 2,
    color: '#9333ea', tags: ['nigeria', 'politics', 'thriller'],
  },
  {
    id: 'c11', type: 'movie', title: 'Sango: Lord of Thunder',
    creatorId: 'yoruba_epic', creatorName: 'Adekola Adewale', creatorVillage: 'Yoruba Quarter',
    description: 'An epic retelling of the Sango myth, the Orisha of lightning, with breathtaking practical effects.',
    duration: '2h 20m', language: 'Yoruba', accessType: 'paid_10',
    views: 18900, streams: 0, cowriesEarned: 15120, uploadedAt: Date.now() - 86400000 * 14,
    color: '#dc2626', tags: ['yoruba', 'mythology', 'epic'],
  },
  {
    id: 'c12', type: 'cultural', title: 'Adae Kese: Golden Festival',
    creatorId: 'ashanti_royal', creatorName: 'Nana Boateng', creatorVillage: 'Jamestown-Accra',
    description: 'Full ceremony footage from the Ashanti\'s Adae Kese — the grandest festival of the Asantehene, shot in 4K.',
    duration: '3h 10m', language: 'Twi', accessType: 'free',
    views: 5500, streams: 0, cowriesEarned: 110, uploadedAt: Date.now() - 86400000 * 20,
    color: '#b45309', tags: ['ghana', 'ashanti', 'royalty'],
  },
]

const MOCK_ARTISTS: Artist[] = [
  {
    id: 'a1', name: 'Tems', village: 'Lagos-Island', genre: 'Afrosoul',
    followers: 142000, monthlyStreams: 28400, color: '#9333ea',
    tracks: [
      { id: 't1', title: 'Free Mind', artistId: 'a1', artistName: 'Tems', village: 'Lagos-Island', duration: '4:12', durationSecs: 252, genre: 'Afrosoul', color: '#9333ea' },
      { id: 't2', title: 'Higher (feat. Burna Boy)', artistId: 'a1', artistName: 'Tems', village: 'Lagos-Island', duration: '3:58', durationSecs: 238, genre: 'Afrosoul', color: '#7c3aed' },
    ],
  },
  {
    id: 'a2', name: 'Stonebwoy', village: 'Jamestown-Accra', genre: 'Reggae/Afrobeats',
    followers: 89000, monthlyStreams: 19200, color: '#059669',
    tracks: [
      { id: 't3', title: 'Anloga Junction', artistId: 'a2', artistName: 'Stonebwoy', village: 'Jamestown-Accra', duration: '3:45', durationSecs: 225, genre: 'Reggae', color: '#059669' },
      { id: 't4', title: 'Activate', artistId: 'a2', artistName: 'Stonebwoy', village: 'Jamestown-Accra', duration: '4:02', durationSecs: 242, genre: 'Afrobeats', color: '#16a34a' },
    ],
  },
  {
    id: 'a3', name: 'Yemi Alade', village: 'Yoruba Quarter', genre: 'Afropop',
    followers: 210000, monthlyStreams: 45000, color: '#dc2626',
    tracks: [
      { id: 't5', title: 'Johnny', artistId: 'a3', artistName: 'Yemi Alade', village: 'Yoruba Quarter', duration: '4:30', durationSecs: 270, genre: 'Afropop', color: '#dc2626' },
      { id: 't6', title: 'Boyz', artistId: 'a3', artistName: 'Yemi Alade', village: 'Yoruba Quarter', duration: '3:55', durationSecs: 235, genre: 'Afropop', color: '#b91c1c' },
    ],
  },
  {
    id: 'a4', name: 'Diamond Platnumz', village: 'Zanzibar-Coast', genre: 'Bongo Flava',
    followers: 175000, monthlyStreams: 38700, color: '#2563eb',
    tracks: [
      { id: 't7', title: 'Jeje', artistId: 'a4', artistName: 'Diamond Platnumz', village: 'Zanzibar-Coast', duration: '4:18', durationSecs: 258, genre: 'Bongo Flava', color: '#2563eb' },
      { id: 't8', title: 'Waah!', artistId: 'a4', artistName: 'Diamond Platnumz', village: 'Zanzibar-Coast', duration: '3:42', durationSecs: 222, genre: 'Bongo Flava', color: '#1d4ed8' },
    ],
  },
  {
    id: 'a5', name: 'Cina Soul', village: 'Jamestown-Accra', genre: 'Highlife',
    followers: 52000, monthlyStreams: 11200, color: '#d97706',
    tracks: [
      { id: 't9', title: 'Odo', artistId: 'a5', artistName: 'Cina Soul', village: 'Jamestown-Accra', duration: '3:38', durationSecs: 218, genre: 'Highlife', color: '#d97706' },
      { id: 't10', title: 'For My Guys', artistId: 'a5', artistName: 'Cina Soul', village: 'Jamestown-Accra', duration: '4:05', durationSecs: 245, genre: 'Highlife', color: '#b45309' },
    ],
  },
  {
    id: 'a6', name: 'Sauti Sol', village: 'Nairobi-East', genre: 'Afro-Pop/Soul',
    followers: 130000, monthlyStreams: 27900, color: '#0891b2',
    tracks: [
      { id: 't11', title: 'Extravaganza', artistId: 'a6', artistName: 'Sauti Sol', village: 'Nairobi-East', duration: '4:50', durationSecs: 290, genre: 'Afro-Pop', color: '#0891b2' },
      { id: 't12', title: 'Midnight Train', artistId: 'a6', artistName: 'Sauti Sol', village: 'Nairobi-East', duration: '3:55', durationSecs: 235, genre: 'Soul', color: '#0369a1' },
    ],
  },
  {
    id: 'a7', name: 'Asa', village: 'Abidjan-Sud', genre: 'Neo-Soul',
    followers: 78000, monthlyStreams: 16400, color: '#db2777',
    tracks: [
      { id: 't13', title: 'Beautiful Imperfection', artistId: 'a7', artistName: 'Asa', village: 'Abidjan-Sud', duration: '5:02', durationSecs: 302, genre: 'Neo-Soul', color: '#db2777' },
      { id: 't14', title: 'Jailer', artistId: 'a7', artistName: 'Asa', village: 'Abidjan-Sud', duration: '3:30', durationSecs: 210, genre: 'Folk-Soul', color: '#be185d' },
    ],
  },
  {
    id: 'a8', name: 'Joe Mettle', village: 'Jamestown-Accra', genre: 'Gospel',
    followers: 95000, monthlyStreams: 22100, color: '#65a30d',
    tracks: [
      { id: 't15', title: 'Bo Noo Ni', artistId: 'a8', artistName: 'Joe Mettle', village: 'Jamestown-Accra', duration: '5:20', durationSecs: 320, genre: 'Gospel', color: '#65a30d' },
      { id: 't16', title: 'Turning Around for Me', artistId: 'a8', artistName: 'Joe Mettle', village: 'Jamestown-Accra', duration: '4:44', durationSecs: 284, genre: 'Gospel', color: '#4d7c0f' },
    ],
  },
]

const PLAYLIST_MAP: Record<Playlist, string[]> = {
  'Pan-African Hits': ['t1', 't5', 't3', 't11', 't7', 't13'],
  'Afrobeats': ['t4', 't6', 't2', 't8'],
  'Highlife': ['t9', 't10', 't3'],
  'Afrosoul': ['t1', 't2', 't13', 't14', 't11', 't12'],
  'Gospel': ['t15', 't16'],
}

const ALL_TRACKS: Track[] = MOCK_ARTISTS.flatMap(a => a.tracks)

const trackById = (id: string) => ALL_TRACKS.find(t => t.id === id)

function generateDailyEarnings(): DailyEarning[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(d => ({ day: d, amount: Math.floor(Math.random() * 80) + 10 }))
}

const ACCESS_LABEL: Record<Content['accessType'], string> = {
  free: 'FREE',
  paid_5: '₡5',
  paid_10: '₡10',
  subscription: 'SUB',
}

const ACCESS_COLOR: Record<Content['accessType'], string> = {
  free: C.green,
  paid_5: C.gold,
  paid_10: '#f97316',
  subscription: C.purple,
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const WaveAnim = ({ active, color = C.green }: { active: boolean; color?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{
        width: 3, background: color, borderRadius: 2,
        height: active ? `${8 + (i % 3) * 6}px` : '4px',
        transition: 'height 0.3s ease',
        animation: active ? `wave${i} 0.6s ${i * 0.1}s infinite alternate ease-in-out` : 'none',
      }} />
    ))}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AfroFlix({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const userVillage = villageId || 'Kemet Village'

  // Tabs
  const [tab, setTab] = useState<TabKey>('browse')

  // Browse state
  const [category, setCategory] = useState<CategoryFilter>('All')
  const [watchModal, setWatchModal] = useState<Content | null>(null)
  const [heroIdx, setHeroIdx] = useState(0)
  const [sessionEarned, setSessionEarned] = useState(0)
  const [playingContent, setPlayingContent] = useState<string | null>(null)
  const [contentProgress, setContentProgress] = useState(0)
  const [tippedIds, setTippedIds] = useState<Set<string>>(new Set())

  // Stream state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>('Pan-African Hits')
  const [streamElapsed, setStreamElapsed] = useState(0)
  const [artistCowries, setArtistCowries] = useState(0)
  const streamTickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Create state
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState<Content['type']>('movie')
  const [uploadLang, setUploadLang] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadDuration, setUploadDuration] = useState('')
  const [uploadAccess, setUploadAccess] = useState<Content['accessType']>('free')
  const [myContent, setMyContent] = useState<Content[]>([])
  const [dailyEarnings] = useState<DailyEarning[]>(generateDailyEarnings)

  // Content store
  const [contentStore, setContentStore] = useState<Content[]>(() => {
    if (typeof window === 'undefined') return MOCK_CONTENT
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s ? JSON.parse(s) as Content[] : MOCK_CONTENT
    } catch { return MOCK_CONTENT }
  })

  // Persist
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(contentStore))
  }, [contentStore])

  // My content
  useEffect(() => {
    setMyContent(contentStore.filter(c => c.creatorId === 'me'))
  }, [contentStore])

  // Hero rotation
  useEffect(() => {
    const iv = setInterval(() => setHeroIdx(i => (i + 1) % Math.min(4, contentStore.length)), 5000)
    return () => clearInterval(iv)
  }, [contentStore.length])

  // Content progress while playing
  useEffect(() => {
    if (!playingContent) return
    const iv = setInterval(() => {
      setContentProgress(p => {
        const next = p + 0.3
        if (next >= 100) { clearInterval(iv); return 100 }
        return next
      })
      // ad revenue: 2 cowries per 100 views → simulate earning every ~8s
      if (Math.random() < 0.05) setSessionEarned(s => s + 1)
    }, 500)
    return () => clearInterval(iv)
  }, [playingContent])

  // Music stream tick
  const startStream = useCallback((track: Track) => {
    if (streamTickRef.current) clearInterval(streamTickRef.current)
    setCurrentTrack(track)
    setIsPlaying(true)
    setStreamElapsed(0)
    streamTickRef.current = setInterval(() => {
      setStreamElapsed(e => {
        const next = e + 1
        // 1 cowrie per 30 seconds
        if (next % 30 === 0) {
          setArtistCowries(c => c + 1)
          setSessionEarned(s => s + 1)
        }
        return next
      })
    }, 1000)
  }, [])

  const togglePlay = useCallback(() => {
    if (!currentTrack) return
    setIsPlaying(p => {
      if (p) {
        if (streamTickRef.current) clearInterval(streamTickRef.current)
      } else {
        streamTickRef.current = setInterval(() => {
          setStreamElapsed(e => {
            const next = e + 1
            if (next % 30 === 0) {
              setArtistCowries(c => c + 1)
              setSessionEarned(s => s + 1)
            }
            return next
          })
        }, 1000)
      }
      return !p
    })
  }, [currentTrack])

  useEffect(() => () => { if (streamTickRef.current) clearInterval(streamTickRef.current) }, [])

  const watchContent = (c: Content) => {
    setContentStore(cs => cs.map(x => x.id === c.id ? { ...x, views: x.views + 1 } : x))
    setWatchModal(c)
    setPlayingContent(c.id)
    setContentProgress(0)
  }

  const closeWatch = () => {
    setWatchModal(null)
    setPlayingContent(null)
  }

  const tipCreator = (id: string, amt: number) => {
    setSessionEarned(s => s + amt)
    setTippedIds(s => new Set(s).add(id))
  }

  const handleUpload = () => {
    if (!uploadTitle.trim()) return
    const c: Content = {
      id: `me_${Date.now()}`, type: uploadType, title: uploadTitle,
      creatorId: 'me', creatorName: 'You', creatorVillage: userVillage,
      description: uploadDesc, duration: uploadDuration || 'Unknown',
      language: uploadLang || 'English', accessType: uploadAccess,
      views: 0, streams: 0, cowriesEarned: 0, uploadedAt: Date.now(),
      color: ['#7c3aed', '#dc2626', '#059669', '#d97706', '#2563eb', '#db2777'][Math.floor(Math.random() * 6)],
      tags: [],
    }
    setContentStore(cs => [c, ...cs])
    setUploadTitle(''); setUploadLang(''); setUploadDesc(''); setUploadDuration('')
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'browse', label: '🎬 Browse' },
    { key: 'stream', label: '🎵 Stream' },
    { key: 'create', label: '📤 Create' },
    { key: 'foryou', label: '💫 For You' },
  ]

  const CATEGORIES: CategoryFilter[] = ['All', 'Movies', 'Series', 'Music', 'Stand-Up', 'Cultural', 'Documentaries']

  const filteredContent = category === 'All'
    ? contentStore
    : contentStore.filter(c => TYPE_LABEL[c.type] === category)

  const heroContent = contentStore.slice(0, 4)
  const hero = heroContent[heroIdx % heroContent.length]
  const trending = [...contentStore].sort((a, b) => b.views - a.views).slice(0, 4)

  const playlistTracks = PLAYLIST_MAP[selectedPlaylist]
    .map(id => trackById(id))
    .filter((t): t is Track => Boolean(t))

  const myTotalViews = myContent.reduce((s, c) => s + c.views, 0)
  const myTotalCowries = myContent.reduce((s, c) => s + c.cowriesEarned, 0)
  const maxEarning = Math.max(...dailyEarnings.map(d => d.amount), 1)

  const villageContent = contentStore.filter(c => c.creatorVillage === userVillage)
  const otherContent = contentStore.filter(c => c.creatorVillage !== userVillage)
  const griотPicks = [...contentStore].sort(() => Math.random() - 0.5).slice(0, 3)

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif', maxWidth: 480, position: 'relative', paddingBottom: currentTrack ? 90 : 0 }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.green, letterSpacing: -1 }}>AfroFlix</div>
          <div style={{ fontSize: 11, color: C.sub }}>Creator Economy Platform</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 10px', fontSize: 12, color: C.gold, fontWeight: 700 }}>
            ₡{sessionEarned} this session
          </div>
          <div style={{ fontSize: 11, color: C.sub }}>{vFlag(userVillage)} {userVillage.split(' ')[0]}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 16px 0', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flexShrink: 0, padding: '8px 12px',
            border: `1px solid ${tab === t.key ? C.green : C.border}`,
            borderRadius: 20, background: tab === t.key ? '#0a2a0a' : C.card,
            color: tab === t.key ? C.green : C.sub, cursor: 'pointer',
            fontSize: 12, fontWeight: tab === t.key ? 700 : 400, whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: BROWSE ──────────────────────────────────────────────────── */}
      {tab === 'browse' && (
        <div style={{ padding: '12px 16px' }}>
          {/* Hero Banner */}
          {hero && (
            <div style={{
              borderRadius: 14, overflow: 'hidden', marginBottom: 16, position: 'relative', cursor: 'pointer',
              background: `linear-gradient(135deg, ${hero.color}dd, ${hero.color}44)`,
            }} onClick={() => watchContent(hero)}>
              <div style={{ height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16, background: 'linear-gradient(to top, #050a06cc, transparent)' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  {heroContent.map((_, i) => (
                    <div key={i} style={{ height: 3, borderRadius: 3, flex: 1, background: i === heroIdx % heroContent.length ? C.green : '#ffffff44' }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginBottom: 3 }}>
                  {CATEGORY_ICONS[TYPE_LABEL[hero.type]]} FEATURED
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{hero.title}</div>
                <div style={{ fontSize: 12, color: '#ffffffbb', marginTop: 4 }}>
                  by {hero.creatorName} · {vFlag(hero.creatorVillage)} {hero.creatorVillage} · {hero.language}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <button onClick={() => setWatchModal(hero)} style={{ padding: '6px 18px', background: C.green, border: 'none', borderRadius: 8, color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>
                    ▶ Watch
                  </button>
                  <span style={{
                    background: ACCESS_COLOR[hero.accessType] + '33',
                    border: `1px solid ${ACCESS_COLOR[hero.accessType]}`,
                    borderRadius: 20, padding: '3px 10px', fontSize: 11,
                    color: ACCESS_COLOR[hero.accessType], fontWeight: 700,
                  }}>
                    {ACCESS_LABEL[hero.accessType]}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                flexShrink: 0, padding: '5px 12px',
                border: `1px solid ${category === cat ? C.green : C.border}`,
                borderRadius: 20, background: category === cat ? '#0a2a0a' : C.card,
                color: category === cat ? C.green : C.sub, cursor: 'pointer',
                fontSize: 11, fontWeight: category === cat ? 700 : 400,
              }}>
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>

          {/* Content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {filteredContent.map(c => (
              <div key={c.id} onClick={() => watchContent(c)} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                overflow: 'hidden', cursor: 'pointer',
              }}>
                <div style={{
                  height: 90, background: `linear-gradient(135deg, ${c.color}cc, ${c.color}44)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}>
                  <span style={{ fontSize: 36 }}>{CATEGORY_ICONS[TYPE_LABEL[c.type]]}</span>
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    background: ACCESS_COLOR[c.accessType] + '33',
                    border: `1px solid ${ACCESS_COLOR[c.accessType]}`,
                    borderRadius: 20, padding: '2px 6px', fontSize: 9,
                    color: ACCESS_COLOR[c.accessType], fontWeight: 700,
                  }}>
                    {ACCESS_LABEL[c.accessType]}
                  </div>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: C.sub, marginBottom: 2 }}>{c.creatorName} · {vFlag(c.creatorVillage)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.sub }}>
                    <span>👁 {c.views.toLocaleString()}</span>
                    <span>{c.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trending row */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 10 }}>🔥 Trending Now</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {trending.map((c, i) => (
                <div key={c.id} onClick={() => watchContent(c)} style={{
                  flexShrink: 0, width: 130, background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                }}>
                  <div style={{ height: 70, background: `linear-gradient(135deg, ${c.color}cc, ${c.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32 }}>{CATEGORY_ICONS[TYPE_LABEL[c.type]]}</span>
                    <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 18, fontWeight: 900, color: i === 0 ? C.gold : C.sub }}>#{i + 1}</div>
                  </div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: 9, color: C.sub }}>👁 {c.views.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: STREAM ──────────────────────────────────────────────────── */}
      {tab === 'stream' && (
        <div style={{ padding: '12px 16px' }}>
          {/* Artists row */}
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🎤 Artists</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
            {MOCK_ARTISTS.map(a => (
              <div key={a.id} style={{
                flexShrink: 0, width: 100, background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 10, textAlign: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${a.color}cc, ${a.color}44)`,
                  margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>🎵</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                <div style={{ fontSize: 9, color: C.sub, marginBottom: 2 }}>{vFlag(a.village)}</div>
                <div style={{ fontSize: 9, color: C.sub }}>{a.genre}</div>
                <div style={{ fontSize: 9, color: C.green, marginTop: 3 }}>{(a.followers / 1000).toFixed(0)}k fans</div>
              </div>
            ))}
          </div>

          {/* Playlist tabs */}
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🎼 Playlists</div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
            {(Object.keys(PLAYLIST_MAP) as Playlist[]).map(pl => (
              <button key={pl} onClick={() => setSelectedPlaylist(pl)} style={{
                flexShrink: 0, padding: '5px 12px',
                border: `1px solid ${selectedPlaylist === pl ? C.green : C.border}`,
                borderRadius: 20, background: selectedPlaylist === pl ? '#0a2a0a' : C.card,
                color: selectedPlaylist === pl ? C.green : C.sub,
                cursor: 'pointer', fontSize: 11, fontWeight: selectedPlaylist === pl ? 700 : 400,
              }}>
                {pl}
              </button>
            ))}
          </div>

          {/* Track list */}
          <div>
            {playlistTracks.map((track, i) => {
              const active = currentTrack?.id === track.id
              return (
                <div key={track.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: active ? '#0a2a0a' : C.card,
                  border: `1px solid ${active ? C.green : C.border}`,
                  borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                }} onClick={() => startStream(track)}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `linear-gradient(135deg, ${track.color}cc, ${track.color}44)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16,
                  }}>
                    {active && isPlaying ? <WaveAnim active={true} color={C.green} /> : <span>{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: active ? C.green : C.text }}>{track.title}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{track.artistName} · {vFlag(track.village)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: C.sub }}>{track.duration}</div>
                    <div style={{ fontSize: 9, color: C.gold }}>₡{Math.ceil(track.durationSecs / 30)} earned</div>
                  </div>
                </div>
              )
            })}
          </div>

          {currentTrack && (
            <div style={{ marginTop: 12, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 8 }}>🐚 Supporting {currentTrack.artistName}</div>
              <div style={{ fontSize: 11, color: C.sub }}>Artist has earned <span style={{ color: C.green, fontWeight: 700 }}>₡{artistCowries}</span> from your stream</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>Streaming for {Math.floor(streamElapsed / 60)}m {streamElapsed % 60}s</div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CREATE ──────────────────────────────────────────────────── */}
      {tab === 'create' && (
        <div style={{ padding: '12px 16px' }}>
          {/* Earnings summary */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 12 }}>📊 Creator Dashboard</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Total Views', val: myTotalViews.toLocaleString(), icon: '👁' },
                { label: 'Cowries', val: `₡${myTotalCowries}`, icon: '🐚' },
                { label: 'Content', val: String(myContent.length), icon: '📁' },
              ].map(stat => (
                <div key={stat.label} style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.green }}>{stat.val}</div>
                  <div style={{ fontSize: 9, color: C.sub }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 8 }}>Daily Cowrie Earnings (7 days)</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
              {dailyEarnings.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{
                    width: '100%', background: C.green, borderRadius: '3px 3px 0 0',
                    height: `${(d.amount / maxEarning) * 50}px`,
                    minHeight: 3,
                  }} />
                  <div style={{ fontSize: 8, color: C.sub }}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How you earn */}
          <div style={{ background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 10 }}>💰 How You Earn</div>
            {[
              { icon: '🆓', label: 'Free content', detail: '₡2 per 100 views (ad revenue)' },
              { icon: '₡5', label: 'Pay-per-view ₡5', detail: 'You keep ₡4 (80%), platform ₡1' },
              { icon: '₡10', label: 'Pay-per-view ₡10', detail: 'You keep ₡8 (80%), platform ₡2' },
              { icon: '🎵', label: 'Music streams', detail: '₡1 per 30 seconds streamed' },
            ].map(e => (
              <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 28, textAlign: 'center', fontSize: 14 }}>{e.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{e.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload form */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📤 Upload Content</div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Title *</div>
              <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. My Village Documentary"
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Type</div>
                <select value={uploadType} onChange={e => setUploadType(e.target.value as Content['type'])}
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 12 }}>
                  {(['movie', 'series', 'music', 'standup', 'cultural', 'documentary'] as Content['type'][]).map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Access</div>
                <select value={uploadAccess} onChange={e => setUploadAccess(e.target.value as Content['accessType'])}
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 12 }}>
                  <option value="free">Free</option>
                  <option value="paid_5">Pay-per-view ₡5</option>
                  <option value="paid_10">Pay-per-view ₡10</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Language</div>
                <input value={uploadLang} onChange={e => setUploadLang(e.target.value)} placeholder="e.g. Yoruba"
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Duration</div>
                <input value={uploadDuration} onChange={e => setUploadDuration(e.target.value)} placeholder="e.g. 1h 30m"
                  style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Description</div>
              <textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} placeholder="Tell the village what this is about..."
                style={{ width: '100%', background: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, minHeight: 60, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleUpload}
                style={{ flex: 1, padding: 10, background: C.green, border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Upload to AfroFlix
              </button>
              <button onClick={() => { window.location.href = '/dashboard/jollof/studio' }} style={{ padding: '10px 16px', background: '#dc262622', border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                🔴 Go Live
              </button>
            </div>
          </div>

          {/* My content list */}
          {myContent.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📁 My Content</div>
              {myContent.map(c => (
                <div key={c.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: `linear-gradient(135deg, ${c.color}cc, ${c.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {CATEGORY_ICONS[TYPE_LABEL[c.type]]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: 10, color: C.sub }}>👁 {c.views} views · 🐚 ₡{c.cowriesEarned} earned</div>
                  </div>
                  <div style={{ fontSize: 10, color: ACCESS_COLOR[c.accessType], fontWeight: 700 }}>{ACCESS_LABEL[c.accessType]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: FOR YOU ─────────────────────────────────────────────────── */}
      {tab === 'foryou' && (
        <div style={{ padding: '12px 16px' }}>
          {/* Village section */}
          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 10 }}>
            {vFlag(userVillage)} What's popular in {userVillage}
          </div>
          {villageContent.length === 0 && (
            <div style={{ color: C.sub, fontSize: 12, marginBottom: 16, padding: '12px 0' }}>No content from your village yet — be the first to upload!</div>
          )}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
            {(villageContent.length > 0 ? villageContent : contentStore.slice(0, 3)).map(c => (
              <div key={c.id} onClick={() => watchContent(c)} style={{
                flexShrink: 0, width: 140, background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
              }}>
                <div style={{ height: 80, background: `linear-gradient(135deg, ${c.color}cc, ${c.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  {CATEGORY_ICONS[TYPE_LABEL[c.type]]}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: C.sub }}>{c.language} · {c.duration}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Griot picks */}
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 10 }}>🧙 Recommended by the Griot</div>
          <div style={{ background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 10, fontStyle: 'italic' }}>"I have seen many sunsets and heard many stories. These are worth your cowries."</div>
            {griотPicks.map(c => (
              <div key={c.id} onClick={() => watchContent(c)} style={{
                display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0',
                borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${c.color}cc, ${c.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {CATEGORY_ICONS[TYPE_LABEL[c.type]]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: C.sub }}>{c.creatorName} · {vFlag(c.creatorVillage)} {c.creatorVillage}</div>
                </div>
                <div style={{ fontSize: 10, color: ACCESS_COLOR[c.accessType], fontWeight: 700, flexShrink: 0 }}>{ACCESS_LABEL[c.accessType]}</div>
              </div>
            ))}
          </div>

          {/* Cross-village section */}
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🌍 Across the Villages</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {otherContent.slice(0, 6).map(c => (
              <div key={c.id} onClick={() => watchContent(c)} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                overflow: 'hidden', cursor: 'pointer',
              }}>
                <div style={{ height: 70, background: `linear-gradient(135deg, ${c.color}cc, ${c.color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'relative' }}>
                  {CATEGORY_ICONS[TYPE_LABEL[c.type]]}
                  <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 10 }}>{vFlag(c.creatorVillage)}</div>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: C.sub }}>{c.creatorVillage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WATCH MODAL ───────────────────────────────────────────────────── */}
      {watchModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#000000dd', zIndex: 1000,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={closeWatch}>
          <div style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: '20px 20px 0 0',
            width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            {/* Player area */}
            <div style={{
              height: 200, background: `linear-gradient(135deg, ${watchModal.color}cc, ${watchModal.color}44)`,
              borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              <button onClick={closeWatch} style={{ position: 'absolute', top: 14, right: 14, background: '#00000066', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', fontSize: 16 }}>×</button>
              <span style={{ fontSize: 56 }}>{CATEGORY_ICONS[TYPE_LABEL[watchModal.type]]}</span>
              <div style={{ fontSize: 11, color: '#ffffffbb', marginTop: 8 }}>
                Watching from {vFlag(userVillage)} {userVillage}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: '#1a2e1a' }}>
              <div style={{ height: '100%', background: C.green, width: `${playingContent === watchModal.id ? contentProgress : 0}%`, transition: 'width 0.5s linear' }} />
            </div>

            <div style={{ padding: 16 }}>
              {/* Title & creator */}
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{watchModal.title}</div>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>
                By {watchModal.creatorName} · {vFlag(watchModal.creatorVillage)} {watchModal.creatorVillage} · {watchModal.language}
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 20, padding: '3px 8px', fontSize: 10, color: C.sub }}>{watchModal.duration}</span>
                <span style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 20, padding: '3px 8px', fontSize: 10, color: C.sub }}>👁 {watchModal.views.toLocaleString()} views</span>
                <span style={{
                  background: ACCESS_COLOR[watchModal.accessType] + '22',
                  border: `1px solid ${ACCESS_COLOR[watchModal.accessType]}`,
                  borderRadius: 20, padding: '3px 8px', fontSize: 10,
                  color: ACCESS_COLOR[watchModal.accessType], fontWeight: 700,
                }}>
                  {ACCESS_LABEL[watchModal.accessType]}
                </span>
              </div>

              {/* Pay button if paid */}
              {watchModal.accessType !== 'free' && (
                <div style={{ background: '#0a1a0a', border: `1px solid ${C.gold}`, borderRadius: 10, padding: 12, marginBottom: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginBottom: 6 }}>
                    {watchModal.accessType === 'subscription' ? '🔐 Subscription Required' : `🐚 Pay ${ACCESS_LABEL[watchModal.accessType]} Cowries to Watch`}
                  </div>
                  <button onClick={() => { closeWatch(); alert(`✅ ${watchModal?.accessType === 'subscription' ? 'Subscribed!' : `Paid ${ACCESS_LABEL[watchModal?.accessType ?? 'free']} Cowries`} — Enjoy the content!`) }} style={{ padding: '8px 24px', background: C.gold, border: 'none', borderRadius: 8, color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>
                    {watchModal.accessType === 'subscription' ? 'Subscribe' : `Pay ${ACCESS_LABEL[watchModal.accessType]}`}
                  </button>
                </div>
              )}

              {/* Description */}
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 16 }}>{watchModal.description}</div>

              {/* Tip creator */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 8 }}>
                  💰 Tip Creator from {vFlag(watchModal.creatorVillage)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[10, 50, 100].map(amt => (
                    <button key={amt} onClick={() => tipCreator(watchModal.id, amt)} style={{
                      flex: 1, padding: '8px 4px',
                      background: tippedIds.has(watchModal.id) ? '#0a2a0a' : '#1a1000',
                      border: `1px solid ${C.gold}`,
                      borderRadius: 10, color: C.gold, fontWeight: 700, cursor: 'pointer', fontSize: 13,
                    }}>
                      ₡{amt}
                    </button>
                  ))}
                </div>
                {tippedIds.has(watchModal.id) && (
                  <div style={{ fontSize: 11, color: C.green, marginTop: 8, textAlign: 'center' }}>
                    Asante sana! Your tip supports cross-village creativity.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MINI MUSIC PLAYER ─────────────────────────────────────────────── */}
      {currentTrack && (
        <div style={{
          position: 'sticky', bottom: 0, left: 0, right: 0,
          background: '#0d1a0e', borderTop: `2px solid ${C.green}`,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 100,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${currentTrack.color}cc, ${currentTrack.color}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🎵</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
            <div style={{ fontSize: 10, color: C.gold }}>🐚 Supporting {currentTrack.artistName}</div>
          </div>
          <WaveAnim active={isPlaying} color={C.green} />
          <button onClick={togglePlay} style={{
            width: 36, height: 36, borderRadius: '50%', background: C.green, border: 'none',
            color: '#000', cursor: 'pointer', fontWeight: 900, fontSize: 16, flexShrink: 0,
          }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      )}

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes wave1 { from { height: 6px } to { height: 18px } }
        @keyframes wave2 { from { height: 10px } to { height: 22px } }
        @keyframes wave3 { from { height: 14px } to { height: 8px } }
        @keyframes wave4 { from { height: 8px } to { height: 20px } }
        @keyframes wave5 { from { height: 12px } to { height: 6px } }
      `}</style>
    </div>
  )
}
