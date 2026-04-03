// ── 500-Tier Pan-African Honor System ──────────────────────────────────────────
// 11 groups: Seed > Sprout > Trader > Warrior > Elder > Chief > Oba > Orisha > Legend > Ancestor > Eternal
// ~70 anchor tiers with hand-crafted Yoruba/Igbo/Swahili/Hausa names
// Interpolation function fills all 500 tiers from anchors + name banks
// XP curve: polynomial, level 1 = 0 XP, level 500 ~ 50,000,000 XP

// ── Types ──────────────────────────────────────────────────────────────────────

export type RankGroup =
  | 'Seed'
  | 'Sprout'
  | 'Trader'
  | 'Warrior'
  | 'Elder'
  | 'Chief'
  | 'Oba'
  | 'Orisha'
  | 'Legend'
  | 'Ancestor'
  | 'Eternal'

export interface RankTier {
  level: number
  name: string
  subtitle: string
  emoji: string
  color: string
  xpRequired: number
  perk: string
  group: RankGroup
}

export interface FeatureUnlock {
  level: number
  category: 'social' | 'commerce' | 'governance' | 'media' | 'identity' | 'village'
  name: string
  description: string
  emoji: string
}

// ── Group Meta ─────────────────────────────────────────────────────────────────

export const RANK_GROUP_META: Record<RankGroup, { color: string; emoji: string; description: string }> = {
  Seed:     { color: '#78716c', emoji: '\u{1F331}', description: 'New arrivals \u2014 finding their roots' },
  Sprout:   { color: '#22c55e', emoji: '\u{1F33F}', description: 'Growing roots \u2014 building connections' },
  Trader:   { color: '#16a34a', emoji: '\u{1F9FA}', description: 'Active in the village marketplace' },
  Warrior:  { color: '#2563eb', emoji: '\u2694\uFE0F', description: 'Proven contributors and builders' },
  Elder:    { color: '#d97706', emoji: '\u{1F985}', description: 'Trusted voices and village guides' },
  Chief:    { color: '#dc2626', emoji: '\u{1F451}', description: 'Leaders who shape the compound' },
  Oba:      { color: '#7c3aed', emoji: '\u{1F3DB}', description: 'Sovereign pillars of the nation' },
  Orisha:   { color: '#0891b2', emoji: '\u2728', description: 'Legendary builders of civilization' },
  Legend:   { color: '#db2777', emoji: '\u{1F525}', description: 'Immortal names in the village drum' },
  Ancestor: { color: '#d4a017', emoji: '\u2B50', description: 'One with the Ancestors \u2014 the highest honor' },
  Eternal:  { color: '#ffd700', emoji: '\u{1F48E}', description: 'The Eternal Tradition \u2014 beyond time' },
}

// ── Group Boundaries ───────────────────────────────────────────────────────────

const GROUP_RANGES: ReadonlyArray<{ group: RankGroup; min: number; max: number }> = [
  { group: 'Seed',     min: 1,   max: 25 },
  { group: 'Sprout',   min: 26,  max: 60 },
  { group: 'Trader',   min: 61,  max: 100 },
  { group: 'Warrior',  min: 101, max: 150 },
  { group: 'Elder',    min: 151, max: 200 },
  { group: 'Chief',    min: 201, max: 260 },
  { group: 'Oba',      min: 261, max: 320 },
  { group: 'Orisha',   min: 321, max: 380 },
  { group: 'Legend',    min: 381, max: 440 },
  { group: 'Ancestor', min: 441, max: 490 },
  { group: 'Eternal',  min: 491, max: 500 },
]

function getGroupForLevel(level: number): RankGroup {
  for (const range of GROUP_RANGES) {
    if (level >= range.min && level <= range.max) return range.group
  }
  return 'Eternal'
}

// ── XP Curve ───────────────────────────────────────────────────────────────────
// Formula: xp = floor(0.372 * n^3 + 15 * n^2 + 50 * n) where n = level - 1
// Calibrated: Level 1 = 0 XP, Level 500 = ~49,981,522 XP (~50M)
//
// Sample XP values:
//   Lv   1 =          0  |  Lv  10 =      1,936  |  Lv  25 =     14,982
//   Lv  50 =     82,230  |  Lv 100 =    512,916  |  Lv 200 =  3,535,547
//   Lv 300 = 11,299,859  |  Lv 400 = 26,037,850  |  Lv 500 = 49,981,522

function calculateXP(level: number): number {
  if (level <= 1) return 0
  const n = level - 1
  return Math.floor(0.372 * n * n * n + 15 * n * n + 50 * n)
}

// ── Anchor Tiers (~70 hand-crafted) ────────────────────────────────────────────
// Key milestones with authentic African names and specific feature-unlocking perks.
// XP is calculated by the formula above, not hardcoded in anchors.

interface AnchorDef {
  level: number
  group: RankGroup
  name: string
  subtitle: string
  emoji: string
  perk: string
}

const ANCHOR_DEFS: AnchorDef[] = [
  // ── SEED (Lv 1-25) ─────────────────────────────────────────────────────────
  { level: 1,   group: 'Seed',     name: 'Aromo',            subtitle: 'The Seedling',               emoji: '\u{1F331}', perk: 'Access Village Drum feed' },
  { level: 2,   group: 'Seed',     name: 'Omo Tuntun',       subtitle: 'New Child',                  emoji: '\u{1F33F}', perk: 'Send direct messages (Seso)' },
  { level: 3,   group: 'Seed',     name: 'Alejo',            subtitle: 'The Visitor',                emoji: '\u{1F463}', perk: 'Join 1 Ajo circle' },
  { level: 5,   group: 'Seed',     name: 'Gbe Ese',          subtitle: 'First Steps',                emoji: '\u{1F9B6}', perk: 'Post Voice Stories' },
  { level: 8,   group: 'Seed',     name: 'Ewe Agbado',       subtitle: 'Corn Leaf',                  emoji: '\u{1F33D}', perk: 'Unlock Night Market feed' },
  { level: 10,  group: 'Seed',     name: 'Ope Kekere',       subtitle: 'Small Palm Tree',            emoji: '\u{1F334}', perk: 'Soro Soke badge on profile' },
  { level: 15,  group: 'Seed',     name: 'Mwanzo Mpya',      subtitle: 'New Beginning',              emoji: '\u2B55',    perk: 'Create your own Ajo circle' },
  { level: 20,  group: 'Seed',     name: 'Ife Kekere',       subtitle: 'Small Love',                 emoji: '\u{1F49A}', perk: 'Custom Afro-ID display name' },
  { level: 25,  group: 'Seed',     name: 'Igi Gbongbo',      subtitle: 'Deep Root',                  emoji: '\u{1F333}', perk: 'Seed graduation \u2014 Sprout awaits' },

  // ── SPROUT (Lv 26-60) ──────────────────────────────────────────────────────
  { level: 26,  group: 'Sprout',   name: 'Isipho',           subtitle: 'The Gift',                   emoji: '\u{1F33F}', perk: 'Sprout tier unlocked' },
  { level: 30,  group: 'Sprout',   name: 'Omo Oke',          subtitle: 'Hill Child',                 emoji: '\u26F0\uFE0F', perk: 'Spray split 90/10' },
  { level: 35,  group: 'Sprout',   name: 'Irugbin',          subtitle: 'Planted Seed',               emoji: '\u{1F331}', perk: 'Schedule posts 24h ahead' },
  { level: 40,  group: 'Sprout',   name: 'Abike',            subtitle: 'Born to Be Cherished',       emoji: '\u{1F31F}', perk: 'Elder badge on posts' },
  { level: 45,  group: 'Sprout',   name: 'Ayo Nla',          subtitle: 'Great Joy',                  emoji: '\u{1F389}', perk: 'Content scheduling 72h ahead' },
  { level: 50,  group: 'Sprout',   name: 'Nkem',             subtitle: 'My Own',                     emoji: '\u{1F3C6}', perk: 'Platform Elder forever badge' },
  { level: 55,  group: 'Sprout',   name: 'Ifeoma',           subtitle: 'Beautiful Thing',            emoji: '\u{1F48E}', perk: 'Early access to new features' },
  { level: 60,  group: 'Sprout',   name: 'Omo Iya',          subtitle: 'Mother\'s Child',            emoji: '\u{1F30A}', perk: 'Sprout graduation \u2014 Trader awaits' },

  // ── TRADER (Lv 61-100) ─────────────────────────────────────────────────────
  { level: 61,  group: 'Trader',   name: 'Alatagba',         subtitle: 'Small Trader',               emoji: '\u{1F9FA}', perk: 'Crest IV unlocked' },
  { level: 65,  group: 'Trader',   name: 'Onisowo',          subtitle: 'One Who Trades',             emoji: '\u{1FA99}', perk: 'Open marketplace listings' },
  { level: 70,  group: 'Trader',   name: 'Arina',            subtitle: 'Market Walker',              emoji: '\u{1F6B6}', perk: 'Bid in live auctions' },
  { level: 75,  group: 'Trader',   name: 'Ajo Eni',          subtitle: 'Circle Member',              emoji: '\u2B55',    perk: 'Ancestral record signing' },
  { level: 80,  group: 'Trader',   name: 'Asowo Nla',        subtitle: 'Great Trader',               emoji: '\u{1F3EA}', perk: 'Oba palace profile banner' },
  { level: 85,  group: 'Trader',   name: 'Oyelowo',          subtitle: 'Honor Befits Chieftaincy',   emoji: '\u{1F396}', perk: 'Orisha golden badge' },
  { level: 90,  group: 'Trader',   name: 'Olu Oja',          subtitle: 'Market Lord',                emoji: '\u{1F3DB}', perk: 'Orisha council seat' },
  { level: 95,  group: 'Trader',   name: 'Oba Onisowo',      subtitle: 'Trade Sovereign',            emoji: '\u{1F451}', perk: 'Crest V \u2014 the final crest' },
  { level: 100, group: 'Trader',   name: 'Oba Oja',          subtitle: 'King of the Market',         emoji: '\u{1F525}', perk: 'Legend status \u2014 immortal' },

  // ── WARRIOR (Lv 101-150) ───────────────────────────────────────────────────
  { level: 101, group: 'Warrior',  name: 'Omo Ogun',         subtitle: 'Child of Iron',              emoji: '\u2694\uFE0F', perk: 'Warrior tier unlocked \u2014 iron badge' },
  { level: 110, group: 'Warrior',  name: 'Jagunjagun',       subtitle: 'Warrior Fighter',            emoji: '\u{1F6E1}', perk: 'Escrow up to \u20A1100,000' },
  { level: 120, group: 'Warrior',  name: 'Akinkanju',        subtitle: 'Brave Heart',                emoji: '\u{1F4AA}', perk: 'Host Oracle Debates' },
  { level: 130, group: 'Warrior',  name: 'Ogun Bibo',        subtitle: 'Ogun Returned',              emoji: '\u{1F3F9}', perk: 'Multi-village broadcast' },
  { level: 140, group: 'Warrior',  name: 'Agbarigi',         subtitle: 'The Hard Wood Tree',         emoji: '\u{1F333}', perk: 'Host events with Cowrie gate' },
  { level: 150, group: 'Warrior',  name: 'Ologun Irin',      subtitle: 'Iron Warrior Lord',          emoji: '\u2694\uFE0F', perk: 'Sovereign Griot AI' },

  // ── ELDER (Lv 151-200) ────────────────────────────────────────────────────
  { level: 151, group: 'Elder',    name: 'Iya Agba',         subtitle: 'Grandmother Wisdom',         emoji: '\u{1F985}', perk: 'Elder council access' },
  { level: 160, group: 'Elder',    name: 'Babaagba',         subtitle: 'Grandfather Wisdom',         emoji: '\u{1F9D3}', perk: 'Mediate village disputes' },
  { level: 170, group: 'Elder',    name: 'Agba Ile',         subtitle: 'House Elder',                emoji: '\u{1F3DA}', perk: 'Commission on referral trades (2%)' },
  { level: 180, group: 'Elder',    name: 'Oluwafemi',        subtitle: 'Beloved of God',             emoji: '\u{1F31F}', perk: 'View all village analytics' },
  { level: 190, group: 'Elder',    name: 'Oloye',            subtitle: 'Title Holder',               emoji: '\u{1F397}', perk: 'Elder-only feed digest' },
  { level: 200, group: 'Elder',    name: 'Agba Afon',        subtitle: 'Elder of the River',         emoji: '\u{1F30A}', perk: 'Village governance seat' },

  // ── CHIEF (Lv 201-260) ────────────────────────────────────────────────────
  { level: 201, group: 'Chief',    name: 'Olori Egbe',       subtitle: 'Guild Chief',                emoji: '\u{1F451}', perk: 'Create a Village sub-council' },
  { level: 210, group: 'Chief',    name: 'Onile',            subtitle: 'Owner of the Land',          emoji: '\u{1F3E1}', perk: 'Named on Village Hall of Fame' },
  { level: 220, group: 'Chief',    name: 'Alase',            subtitle: 'One Who Commands',           emoji: '\u{1F336}', perk: 'Commission on village commerce (1%)' },
  { level: 230, group: 'Chief',    name: 'Babalode',         subtitle: 'Father of the Outskirts',    emoji: '\u{1F5FA}', perk: 'Geo-restrict your broadcasts' },
  { level: 240, group: 'Chief',    name: 'Olori Oja',        subtitle: 'Market Chief',               emoji: '\u{1F3EC}', perk: 'Annual Chief Assembly invite' },
  { level: 250, group: 'Chief',    name: 'Amotekun',         subtitle: 'The Leopard',                emoji: '\u{1F406}', perk: 'Territorial rights' },
  { level: 260, group: 'Chief',    name: 'Ade Ipele',        subtitle: 'Crown Level',                emoji: '\u{1F451}', perk: 'Chief crown crest forever' },

  // ── OBA (Lv 261-320) ─────────────────────────────────────────────────────
  { level: 261, group: 'Oba',      name: 'Oba Kekere',       subtitle: 'Young King',                 emoji: '\u{1F3DB}', perk: 'Oba sovereignty tier' },
  { level: 270, group: 'Oba',      name: 'Kabiyesi',         subtitle: 'Unquestionable One',         emoji: '\u269C\uFE0F', perk: 'Royal purple username color' },
  { level: 280, group: 'Oba',      name: 'Oba To Dara',      subtitle: 'The Good King',              emoji: '\u2728',    perk: '0% platform commission on trades' },
  { level: 290, group: 'Oba',      name: 'Asa Oba',          subtitle: 'Kingly Tradition',           emoji: '\u{1F4FF}', perk: 'Annual harvest distribution bonus' },
  { level: 300, group: 'Oba',      name: 'Oba Ija',          subtitle: 'King of Battles',            emoji: '\u2694\uFE0F', perk: 'Multi-village alliance' },
  { level: 310, group: 'Oba',      name: 'Asiwaju',          subtitle: 'The One Who Leads',          emoji: '\u{1F680}', perk: 'Platform governance vote' },
  { level: 320, group: 'Oba',      name: 'Oloye Oba',        subtitle: 'Title King',                 emoji: '\u{1F441}', perk: 'Oba palace banner forever' },

  // ── ORISHA (Lv 321-380) ───────────────────────────────────────────────────
  { level: 321, group: 'Orisha',   name: 'Imole Tuntun',     subtitle: 'New Light Being',            emoji: '\u2728',    perk: 'Orisha status granted' },
  { level: 330, group: 'Orisha',   name: 'Osun Bibo',        subtitle: 'Oshun Reborn',               emoji: '\u{1F49B}', perk: 'Free \u20A1500 monthly creator fund' },
  { level: 340, group: 'Orisha',   name: 'Sango To Wa',      subtitle: 'Thunder Has Come',           emoji: '\u26A1',    perk: 'Custom village API access' },
  { level: 350, group: 'Orisha',   name: 'Oba Ala',          subtitle: 'King of the White Cloth',    emoji: '\u{1F90D}', perk: 'Revenue share from villages' },
  { level: 360, group: 'Orisha',   name: 'Egungun',          subtitle: 'Voice of the Ancestors',     emoji: '\u{1F3AD}', perk: 'Golden badge + all platform access' },
  { level: 370, group: 'Orisha',   name: 'Orunmila',         subtitle: 'Witness of Fate',            emoji: '\u{1F4FF}', perk: 'AI Griot priority response (1s SLA)' },
  { level: 380, group: 'Orisha',   name: 'Asa Orun',         subtitle: 'Celestial Tradition',        emoji: '\u{1F320}', perk: 'Orisha council seat \u2014 permanent' },

  // ── LEGEND (Lv 381-440) ───────────────────────────────────────────────────
  { level: 381, group: 'Legend',   name: 'Aria Aye',          subtitle: 'Earthly Legend',             emoji: '\u{1F525}', perk: 'Legend status \u2014 immortal tier' },
  { level: 390, group: 'Legend',   name: 'Omo Itan',          subtitle: 'Child of History',           emoji: '\u{1F4D6}', perk: 'Written into village annals forever' },
  { level: 400, group: 'Legend',   name: 'Olorin Agba',       subtitle: 'Melody of the Elders',       emoji: '\u{1F3B6}', perk: 'Platform board advisor' },
  { level: 410, group: 'Legend',   name: 'Oba Itan',          subtitle: 'King of Stories',            emoji: '\u{1F451}', perk: 'Endorse any village initiative' },
  { level: 420, group: 'Legend',   name: 'Asani Itan',        subtitle: 'History Carver',             emoji: '\u{1FA93}', perk: 'Legend flame on all content' },
  { level: 430, group: 'Legend',   name: 'Olojo',             subtitle: 'Master of Days',             emoji: '\u{1F5D3}', perk: 'Control village market schedule' },
  { level: 440, group: 'Legend',   name: 'Onitewogbe',        subtitle: 'One Who Subdues',            emoji: '\u{1F981}', perk: 'Legend crown crest forever' },

  // ── ANCESTOR (Lv 441-490) ─────────────────────────────────────────────────
  { level: 441, group: 'Ancestor', name: 'Baba Nla',         subtitle: 'Great Ancestor',             emoji: '\u2B50',    perk: 'Ancestor tier unlocked' },
  { level: 450, group: 'Ancestor', name: 'Iya Nla',          subtitle: 'Great Mother',               emoji: '\u{1F319}', perk: 'Eternal council member' },
  { level: 460, group: 'Ancestor', name: 'Oduduwa',          subtitle: 'Origin Father',              emoji: '\u{1F30D}', perk: 'Shape platform policy directly' },
  { level: 470, group: 'Ancestor', name: 'Yemoja',           subtitle: 'Mother of Waters',           emoji: '\u{1F30A}', perk: 'Revenue share 1% from all villages' },
  { level: 480, group: 'Ancestor', name: 'Obatala',          subtitle: 'King of the White Cloth',    emoji: '\u{1F90D}', perk: 'Ancestor ring on avatar forever' },
  { level: 490, group: 'Ancestor', name: 'Olodumare Ase',    subtitle: 'Supreme Authority',          emoji: '\u2726',    perk: 'All Ancestor privileges \u2014 complete' },

  // ── ETERNAL (Lv 491-500) ──────────────────────────────────────────────────
  { level: 491, group: 'Eternal',  name: 'Asa Aiye',         subtitle: 'Tradition of the World',     emoji: '\u{1F48E}', perk: 'Eternal tier unlocked' },
  { level: 495, group: 'Eternal',  name: 'Orun Ati Aye',     subtitle: 'Heaven and Earth',           emoji: '\u{1F30C}', perk: 'Infinite platform access' },
  { level: 498, group: 'Eternal',  name: 'Ase Pataki',       subtitle: 'Sacred Authority',           emoji: '\u269C\uFE0F', perk: 'Supreme governance \u2014 all votes' },
  { level: 500, group: 'Eternal',  name: 'Asa Atorunwa',     subtitle: 'The Eternal Tradition',      emoji: '\u{1F48E}', perk: 'The Eternal Tradition \u2014 all privileges forever' },
]

// ── Name Generation (prefix + suffix per group) ───────────────────────────────
// 8 prefixes x 8 suffixes = 64 unique combinations per group.
// Used for interpolated (non-anchor) tiers.

type NamePair = [string, string] // [african_word, english_meaning]

const GROUP_NAMES: Record<RankGroup, { prefixes: NamePair[]; suffixes: NamePair[] }> = {
  Seed: {
    prefixes: [
      ['Omo', 'Child'],       ['Ewe', 'Leaf'],        ['Ireti', 'Hope'],       ['Nwa', 'Young One'],
      ['Bibi', 'Birth'],      ['Ojo', 'Day'],         ['Eni', 'Person'],       ['Aba', 'Seed'],
    ],
    suffixes: [
      ['Tuntun', 'of Newness'],    ['Dara', 'of Goodness'],    ['Mimo', 'of Purity'],      ['Ire', 'of Blessing'],
      ['Alafia', 'of Peace'],      ['Ayo', 'of Joy'],          ['Imole', 'of Light'],      ['Oro', 'of Wisdom'],
    ],
  },
  Sprout: {
    prefixes: [
      ['Igi', 'Tree'],        ['Odo', 'River'],       ['Omi', 'Water'],        ['Ile', 'Earth'],
      ['Oke', 'Hill'],        ['Afefe', 'Wind'],      ['Osan', 'Noon'],        ['Oru', 'Night'],
    ],
    suffixes: [
      ['Tobi', 'of Greatness'],    ['Dara', 'of Beauty'],      ['Gbigbo', 'of Growth'],    ['Ofe', 'of Freedom'],
      ['Ase', 'of Authority'],      ['Ilera', 'of Health'],     ['Ewa', 'of Grace'],        ['Agbara', 'of Power'],
    ],
  },
  Trader: {
    prefixes: [
      ['Oja', 'Market'],      ['Owo', 'Cowrie'],      ['Ajo', 'Circle'],       ['Eru', 'Goods'],
      ['Isowo', 'Trade'],     ['Ori', 'Fortune'],     ['Ona', 'Path'],         ['Igba', 'Harvest'],
    ],
    suffixes: [
      ['Rere', 'of Prosperity'],   ['Nla', 'of Grandeur'],     ['Gidi', 'of Authenticity'], ['Aanu', 'of Mercy'],
      ['Afikun', 'of Abundance'],  ['Irole', 'of Plenty'],     ['Pipo', 'of Multitude'],   ['Duro', 'of Endurance'],
    ],
  },
  Warrior: {
    prefixes: [
      ['Ogun', 'War'],        ['Irin', 'Iron'],       ['Ina', 'Fire'],         ['Agbara', 'Power'],
      ['Okun', 'Strength'],   ['Ade', 'Crown'],       ['Akin', 'Brave'],       ['Ija', 'Battle'],
    ],
    suffixes: [
      ['Bibo', 'Reborn'],         ['Duro', 'Standing Firm'],  ['Jaye', 'of Life'],        ['Tobi', 'of Greatness'],
      ['Lagbara', 'of Might'],    ['Aiku', 'Undying'],        ['Egun', 'Ancestral'],      ['Titi', 'Everlasting'],
    ],
  },
  Elder: {
    prefixes: [
      ['Imo', 'Knowledge'],   ['Ogbon', 'Wisdom'],    ['Agba', 'Elder'],       ['Iwa', 'Character'],
      ['Asa', 'Tradition'],   ['Itosona', 'Guide'],   ['Iriri', 'Experience'], ['Suuru', 'Patience'],
    ],
    suffixes: [
      ['Jinle', 'of Depth'],      ['Atijo', 'of Antiquity'],  ['Pataki', 'of Import'],    ['Lori', 'of the Head'],
      ['Eko', 'of Lessons'],       ['Itan', 'of History'],     ['Olola', 'Honored'],       ['Mimo', 'Sacred'],
    ],
  },
  Chief: {
    prefixes: [
      ['Alase', 'Authority'], ['Olori', 'Chief'],     ['Ade', 'Crown'],        ['Ijoba', 'Governance'],
      ['Oludari', 'Leader'],  ['Ilu', 'Nation'],       ['Baba', 'Father'],      ['Oye', 'Title'],
    ],
    suffixes: [
      ['Agbaye', 'of the World'],  ['Oba', 'of Kings'],        ['Ijeris', 'Proven'],       ['Sise', 'of Action'],
      ['Gbogbo', 'of All'],        ['Itoju', 'of Care'],       ['Abaja', 'Commanding'],    ['Egbe', 'of the Guild'],
    ],
  },
  Oba: {
    prefixes: [
      ['Oba', 'King'],        ['Aafin', 'Palace'],    ['Ade', 'Crown'],        ['Oyo', 'Dynasty'],
      ['Ola', 'Honor'],       ['Ijoba', 'Kingdom'],   ['Ase', 'Authority'],    ['Eso', 'Guardian'],
    ],
    suffixes: [
      ['Orun', 'of Heaven'],      ['Aye', 'of Earth'],        ['Ile', 'of the Land'],     ['Gbogbo', 'of All'],
      ['Titobi', 'of Grandeur'],  ['Ailopin', 'Infinite'],    ['Ope', 'of Gratitude'],    ['Aara', 'of Wonder'],
    ],
  },
  Orisha: {
    prefixes: [
      ['Orisa', 'Deity'],     ['Ase', 'Divinity'],    ['Emi', 'Spirit'],       ['Iya', 'Essence'],
      ['Imole', 'Light'],     ['Orun', 'Heaven'],     ['Ala', 'Vision'],       ['Iwon', 'Measure'],
    ],
    suffixes: [
      ['Ayanmo', 'of Destiny'],   ['Mimo', 'the Sacred'],     ['Aini', 'Eternal'],        ['Oga', 'Supreme'],
      ['Gbele', 'Transcendent'],  ['Kikun', 'Complete'],      ['Abami', 'Wondrous'],      ['Otun', 'Renewed'],
    ],
  },
  Legend: {
    prefixes: [
      ['Itan', 'History'],    ['Aiku', 'Immortal'],   ['Ola', 'Honor'],        ['Iro', 'Echo'],
      ['Ilu', 'Drum'],        ['Idi', 'Foundation'],  ['Oro', 'Story'],        ['Ijo', 'Dance'],
    ],
    suffixes: [
      ['Atijo', 'of Antiquity'],  ['Ailopin', 'Unending'],    ['Aye', 'of the World'],    ['Orun', 'of Heaven'],
      ['Gbogbo', 'of All'],       ['Titobi', 'of Grandeur'],  ['Kikun', 'Complete'],      ['Jinle', 'of Depth'],
    ],
  },
  Ancestor: {
    prefixes: [
      ['Eso', 'Guardian'],    ['Baba', 'Father'],     ['Iya', 'Mother'],       ['Orun', 'Heaven'],
      ['Asa', 'Tradition'],   ['Idile', 'Lineage'],   ['Ori', 'Destiny'],      ['Eda', 'Creation'],
    ],
    suffixes: [
      ['Atorunwa', 'from Heaven'], ['Lalai', 'of Forever'],    ['Aini', 'Without End'],    ['Pataki', 'Paramount'],
      ['Omo', 'of Progeny'],       ['Gbogbo', 'of All'],       ['Jijin', 'of the Deep'],  ['Awon', 'Collective'],
    ],
  },
  Eternal: {
    prefixes: [
      ['Asa', 'Tradition'],   ['Aiku', 'Deathless'],  ['Orun', 'Heaven'],      ['Aini', 'Eternal'],
      ['Ailopin', 'Infinite'],['Gbogbo', 'All'],
    ],
    suffixes: [
      ['Ayeraye', 'Forever'],     ['Titi', 'Until Forever'],  ['Laelae', 'Eternally'],    ['Oro', 'of Truth'],
      ['Ase', 'of Authority'],    ['Pipe', 'of Completion'],
    ],
  },
}

function generateName(group: RankGroup, interpolationIndex: number): { name: string; subtitle: string } {
  const { prefixes, suffixes } = GROUP_NAMES[group]
  const pi = interpolationIndex % prefixes.length
  const si = Math.floor(interpolationIndex / prefixes.length) % suffixes.length
  const prefix = prefixes[pi]
  const suffix = suffixes[si]
  return {
    name: `${prefix[0]} ${suffix[0]}`,
    subtitle: `${prefix[1]} ${suffix[1]}`,
  }
}

// ── Perk Pools (per group) ─────────────────────────────────────────────────────
// Cycled through for interpolated (non-anchor) tiers.

const GROUP_PERKS: Record<RankGroup, string[]> = {
  Seed: [
    'Profile border customization',
    'Basic village analytics access',
    'Unlock emoji reactions',
    'Join village events as spectator',
    'View extended trader profiles',
    'Basic Cowrie wallet activated',
    'Unlock village chat channels',
    'Set custom status message',
    'View Night Market highlights',
    'Pin 1 post to profile',
    'Access learning workshops',
    'Receive daily proverb notification',
    'Unlock voice message sending',
    'View extended feed history',
    'Basic trust rating visible',
    'Access community marketplace',
  ],
  Sprout: [
    'Expanded Ajo circle membership (3)',
    'Custom profile theme colors',
    'Extended post scheduling (48h)',
    'Unlock advanced emoji set',
    'Join multiple village guilds',
    'View trader reputation scores',
    'Access Sprout-only events',
    'Reduced platform fees (9%)',
    'Priority in village queue',
    'Extended voice story duration (5min)',
    'Custom notification sounds',
    'Access seasonal market previews',
    'Unlock group broadcast messages',
    'Enhanced profile visibility',
    'View village growth metrics',
    'Create public Ajo circles',
    'Access mentorship program',
    'Extended Night Market access',
    'Custom feed algorithm weight',
    'View community leaderboard',
    'Proverb Chain post access',
    'Unlock village event RSVP',
    'Pin 2 posts to profile',
    'Access trade dispute tools',
    'View extended analytics dashboard',
    'Custom Seso chat themes',
    'Unlock gift Cowrie feature',
  ],
  Trader: [
    'Escrow lock up to \u20A125,000',
    'Reduced marketplace fees (7%)',
    'Advanced trade analytics',
    'Custom marketplace banner',
    'Bulk listing upload enabled',
    'Priority trade matching',
    'Extended escrow duration (30 days)',
    'Access wholesale marketplace',
    'Trade insurance eligible',
    'Custom invoice generation',
    'Multi-currency trade support',
    'Automated trade reminders',
    'Escrow lock up to \u20A150,000',
    'Trade certification badge',
    'Access premium trade tools',
    'Reduced escrow fees (5%)',
    'Priority dispute resolution',
    'Cross-village trade access',
    'Extended marketplace visibility',
    'Custom trade receipt templates',
    'Bulk escrow management',
    'Trade mentor program access',
    'Advanced pricing analytics',
    'Marketplace spotlight listing',
    'Premium trade notifications',
    'Expanded Ajo circle limit (5)',
    'Cross-marketplace search',
    'Trade history export',
    'Automated trade reports',
    'Extended warranty tools',
    'Premium buyer verification',
  ],
  Warrior: [
    'Iron badge on profile',
    'Dispute arbitration access',
    'Post to Nation Square',
    'Village Notice posts enabled',
    'Custom stream thumbnail',
    'Crest III badge unlocks',
    'Event ticket resale enabled',
    'Group ticket pool creation',
    'Multi-village broadcast rights',
    'Warrior mentorship program',
    'Extended escrow (\u20A1250,000)',
    'Combat training session access',
    'Warrior-only guild channels',
    'Priority event hosting',
    'Custom war name display',
    'Iron forge session hosting',
    'Warrior challenge creation',
    'Extended broadcast duration',
    'Village defense vote access',
    'Warrior alliance formation',
    'Custom battle banner',
    'Priority Oracle Debate slots',
    'Extended tool session duration',
    'Warrior crest customization',
    'Access restricted trading zones',
    'Warrior hall of valor entry',
    'Iron oath binding ceremonies',
    'Cross-village warrior alliance',
    'Priority Griot AI access',
    'Warrior seasonal rewards bonus',
    'Extended multi-village access',
    'Warrior council participation',
    'Custom iron badge design',
    'Priority village resource access',
    'Warrior apprenticeship hosting',
    'Extended challenge tournament',
    'Warrior legacy preservation',
    'Priority dispute mediation',
    'Custom warrior signature',
    'Village guard rotation access',
    'Extended iron forge access',
    'Warrior tradition ceremonies',
    'Priority village defense',
    'Custom warrior crest design',
  ],
  Elder: [
    'Mediate minor disputes',
    'Pin 3 posts to profile',
    'Commission on referral trades (1%)',
    'Reduced Cowrie fees (5%)',
    'Elder-only feed digest access',
    'Custom elder display name',
    'Content scheduling 7 days ahead',
    'Teach a Village Workshop',
    'Early access to platform features',
    'Elder crest on profile',
    'Appear in Elder listings',
    'View all village economy stats',
    'Elder mentorship badge',
    'Priority customer support',
    'Elder seasonal ceremony access',
    'Custom elder notification tone',
    'Extended elder analytics panel',
    'Elder gift Cowrie matching (+10%)',
    'Elder archive access',
    'Priority feature beta testing',
    'Extended mediation rights',
    'Elder cross-village influence',
    'Custom elder proverb display',
    'Elder governance nomination rights',
    'Priority workshop scheduling',
    'Extended village history access',
    'Elder ancestor tree display',
    'Village heritage preservation role',
    'Elder council voting on minor issues',
    'Extended mentorship program access',
    'Custom elder profile frame',
    'Elder trade verification stamp',
    'Priority elder event seating',
    'Extended elder resource access',
    'Elder wisdom badge progression',
    'Village tradition keeper role',
    'Elder seasonal harvest bonus',
    'Extended elder broadcast rights',
    'Elder community awards access',
    'Custom elder aura effect',
    'Elder legacy recording access',
    'Village elder chronicle entry',
    'Extended elder influence radius',
    'Elder supreme counsel access',
  ],
  Chief: [
    'Chief-only private channel',
    'Host events with Cowrie gate',
    'Geo-restrict your broadcasts',
    'Commission on sponsored posts (3%)',
    'Chief badge on all platforms',
    'Treasury view for your village',
    'Create village sub-groups',
    'Annual Chief Assembly invitation',
    'Village land allocation seat',
    'National broadcast auto-boost',
    'All platform fees waived',
    'Chief crown customization',
    'Cross-village chief alliance',
    'Chief mentorship fund (+15%)',
    'Priority governance proposals',
    'Custom chief banner design',
    'Chief quarterly stipend (\u20A1200)',
    'Extended chief council access',
    'Chief seasonal ceremony hosting',
    'Village economy oversight panel',
    'Chief emergency broadcast rights',
    'Cross-village treaty signing',
    'Chief legacy inscription',
    'Extended governance influence',
    'Chief heritage site access',
    'Priority chief event hosting',
    'Custom chief seal design',
    'Chief annual review leadership',
    'Extended village policy access',
    'Chief trade route establishment',
    'Chief cultural preservation fund',
    'Extended chief arbitration rights',
    'Chief seasonal festival hosting',
    'Cross-village resource allocation',
    'Chief diplomatic immunity',
    'Extended chief influence zone',
    'Chief village expansion rights',
    'Priority chief assembly seating',
    'Custom chief crown jewel',
    'Chief sovereign decree power',
    'Extended chief territory view',
    'Chief alliance treaty formation',
    'Chief trade agreement signing',
    'Custom chief palace decoration',
    'Chief supreme governance access',
    'Extended chief legacy preservation',
    'Chief ancestral council access',
    'Chief eternal flame ceremony',
    'Chief final authority badge',
    'Custom chief dynasty crest',
    'Chief complete sovereignty mark',
    'Extended chief cross-village power',
    'Chief ultimate authority emblem',
  ],
  Oba: [
    'Royal purple username color',
    'Own a sub-village economy',
    '0% platform commission',
    'Verified Oba tick on profile',
    'Annual harvest distribution bonus',
    'Create multi-village alliance',
    'Oba council voting rights',
    'Ancestral record signing rights',
    'Nations-Square pinned post slot',
    'Platform governance vote',
    'Oba ring on avatar',
    'Cross-village treasury bridge',
    'Oba palace profile banner',
    'Royal decree broadcast power',
    'Oba quarterly royal stipend',
    'Extended sovereignty zone',
    'Custom royal seal design',
    'Oba coronation ceremony hosting',
    'Royal trade agreement rights',
    'Oba military command access',
    'Cross-kingdom alliance forming',
    'Royal cultural fund management',
    'Oba heritage monument access',
    'Extended royal influence sphere',
    'Custom Oba regalia design',
    'Royal court private channel',
    'Oba seasonal festival patronage',
    'Cross-territory economic planning',
    'Royal archive preservation rights',
    'Oba dynasty chronicle entry',
    'Extended royal authority zone',
    'Custom Oba palace grounds',
    'Royal diplomatic envoy sending',
    'Oba sovereign decree power',
    'Extended Oba governance reach',
    'Royal heritage fund matching (+20%)',
    'Oba cross-nation treaty rights',
    'Custom royal banner flight',
    'Oba supreme palace access',
    'Extended royal legacy preservation',
    'Oba ancestral communion access',
    'Royal eternal flame guardianship',
    'Oba complete sovereignty badge',
    'Custom dynasty sigil design',
    'Oba ultimate authority mark',
    'Extended Oba territorial rights',
    'Royal supreme council seat',
    'Oba immortal chronicle inscription',
    'Custom Oba celestial emblem',
    'Oba final sovereignty crown',
    'Extended Oba eternal authority',
    'Royal complete dominion access',
    'Oba transcendent authority badge',
  ],
  Orisha: [
    'Free \u20A1250 monthly creator fund',
    'Custom village API access',
    'Platform board observer status',
    'Revenue share from referred villages (0.5%)',
    'Orisha portrait hall entry',
    'Permanent Orisha aura on avatar',
    'AI Griot priority response (2s SLA)',
    'Orisha divine blessing ceremony hosting',
    'Cross-platform celestial broadcast',
    'Orisha sacred grove access',
    'Custom divine emblem design',
    'Orisha quarterly celestial stipend',
    'Extended divine influence sphere',
    'Sacred ceremony patronage rights',
    'Orisha heritage monument creation',
    'Cross-realm alliance formation',
    'Divine archive preservation',
    'Orisha celestial court access',
    'Custom sacred regalia design',
    'Orisha eternal flame ceremony hosting',
    'Extended celestial governance rights',
    'Sacred trade blessing power',
    'Orisha divine broadcast rights',
    'Custom celestial palace grounds',
    'Orisha supreme council nomination',
    'Extended divine mentor matching',
    'Sacred heritage fund (+25%)',
    'Orisha cross-dimension access',
    'Custom divine aura effects',
    'Orisha celestial chronicle entry',
    'Extended sacred authority zone',
    'Divine legacy preservation rights',
    'Orisha transcendent badge upgrade',
    'Custom divine seal of approval',
    'Orisha supreme divination access',
    'Extended celestial influence reach',
    'Sacred sovereign decree power',
    'Orisha complete divine access',
    'Custom celestial crown design',
    'Orisha eternal divinity mark',
    'Extended divine territorial rights',
    'Orisha supreme sacred authority',
    'Celestial complete dominion badge',
    'Orisha transcendent legacy emblem',
    'Custom divine dynasty crest',
    'Orisha ultimate celestial power',
    'Extended divine forever access',
    'Orisha complete celestial badge',
    'Sacred eternal chronicle entry',
    'Orisha supreme transcendence mark',
    'Custom celestial eternity emblem',
    'Orisha divine completion mark',
    'Celestial ultimate authority badge',
  ],
  Legend: [
    'Written into village annals',
    'Legend monthly stipend (\u20A11,000)',
    'Endorse any village initiative',
    'Legend flame on all content',
    'Control village market schedule',
    'Legend hall of fame plaque',
    'Pre-access to all new features',
    'Legend decree broadcast rights',
    'Custom legendary emblem design',
    'Legend eternal flame guardianship',
    'Cross-village legendary influence',
    'Legend supreme chronicle entry',
    'Extended legendary authority zone',
    'Custom legend palace grounds',
    'Legend seasonal festival naming',
    'Cross-nation legendary alliance',
    'Legend heritage fund (+30%)',
    'Custom legendary aura design',
    'Legend divine governance access',
    'Extended legendary mentor matching',
    'Legend sacred ceremony hosting',
    'Custom legendary crown jewels',
    'Legend cross-dimension influence',
    'Extended legendary broadcast reach',
    'Legend supreme arbitration rights',
    'Custom legendary dynasty sigil',
    'Legend eternal inscription access',
    'Extended legendary governance power',
    'Legend celestial decree rights',
    'Custom legendary sovereign seal',
    'Legend transcendent authority badge',
    'Extended legendary forever access',
    'Legend complete dominion badge',
    'Custom legendary eternity emblem',
    'Legend supreme legacy preservation',
    'Extended legendary celestial reach',
    'Legend ultimate transcendence mark',
    'Custom legendary divine crest',
    'Legend complete authority emblem',
    'Extended legendary eternal power',
    'Legend supreme sovereign badge',
    'Custom legendary complete seal',
    'Legend ultimate forever access',
    'Extended legendary complete power',
    'Legend divine sovereignty mark',
    'Custom legendary ultimate crest',
    'Legend eternal complete badge',
    'Extended legendary supreme reach',
    'Legend transcendent forever emblem',
    'Custom legendary divine seal',
    'Legend ultimate authority badge',
    'Extended legendary divine power',
    'Legend supreme eternity mark',
  ],
  Ancestor: [
    'Ancestor chronicle inscription',
    'Shape platform policy directly',
    'Revenue share 0.8% from all villages',
    'Ancestor ring on avatar',
    'Ancestor supreme council access',
    'Custom ancestor emblem design',
    'Ancestor quarterly divine stipend',
    'Extended ancestor influence sphere',
    'Sacred ancestor ceremony hosting',
    'Ancestor heritage monument creation',
    'Cross-realm ancestor alliance',
    'Ancestor archive preservation',
    'Custom ancestor regalia design',
    'Ancestor eternal flame ceremony',
    'Extended ancestor governance rights',
    'Ancestor sacred trade blessing',
    'Ancestor divine broadcast rights',
    'Custom ancestor palace grounds',
    'Ancestor supreme nomination power',
    'Extended ancestor mentor matching',
    'Ancestor heritage fund (+35%)',
    'Custom ancestor aura effects',
    'Ancestor celestial chronicle entry',
    'Extended ancestor authority zone',
    'Ancestor legacy preservation rights',
    'Ancestor transcendent badge upgrade',
    'Custom ancestor seal of eternity',
    'Ancestor supreme divination access',
    'Extended ancestor influence reach',
    'Ancestor sovereign decree power',
    'Ancestor complete divine access',
    'Custom ancestor crown design',
    'Ancestor eternal divinity mark',
    'Extended ancestor territorial rights',
    'Ancestor supreme sacred authority',
    'Ancestor complete dominion badge',
    'Custom ancestor dynasty crest',
    'Ancestor ultimate celestial power',
    'Extended ancestor forever access',
    'Ancestor complete celestial badge',
    'Ancestor sacred eternal chronicle',
    'Ancestor supreme transcendence mark',
    'Custom ancestor eternity emblem',
    'Ancestor divine completion access',
  ],
  Eternal: [
    'Eternal celestial gateway access',
    'Custom eternal divine emblem',
    'Eternal supreme forever badge',
    'Eternal complete authority access',
    'Eternal transcendent divinity mark',
    'Eternal ultimate sovereign power',
  ],
}

// ── Tier Builder ───────────────────────────────────────────────────────────────
// Builds all 500 tiers: uses anchors where defined, interpolates the rest.

function buildAllTiers(): RankTier[] {
  const anchorMap = new Map<number, AnchorDef>()
  for (const a of ANCHOR_DEFS) {
    anchorMap.set(a.level, a)
  }

  // Track interpolation index per group (for unique name/perk cycling)
  const groupInterpolationIndex: Partial<Record<RankGroup, number>> = {}
  const tiers: RankTier[] = []

  for (let level = 1; level <= 500; level++) {
    const group = getGroupForLevel(level)
    const meta = RANK_GROUP_META[group]
    const xpRequired = calculateXP(level)
    const anchor = anchorMap.get(level)

    if (anchor) {
      tiers.push({
        level,
        name: anchor.name,
        subtitle: anchor.subtitle,
        emoji: anchor.emoji,
        color: meta.color,
        xpRequired,
        perk: anchor.perk,
        group,
      })
    } else {
      const idx = groupInterpolationIndex[group] ?? 0
      groupInterpolationIndex[group] = idx + 1

      const { name, subtitle } = generateName(group, idx)
      const perks = GROUP_PERKS[group]
      const perk = perks[idx % perks.length]

      tiers.push({
        level,
        name,
        subtitle,
        emoji: meta.emoji,
        color: meta.color,
        xpRequired,
        perk,
        group,
      })
    }
  }

  return tiers
}

// ── Exported Tier Array (500 entries, built once) ──────────────────────────────

export const RANK_TIERS: RankTier[] = buildAllTiers()

// ── Helper Functions (backward-compatible with ranks.ts) ───────────────────────

/** Get rank tier by level (1-500). Clamps to valid range. */
export function getRankByLevel(level: number): RankTier {
  const clamped = Math.max(1, Math.min(500, level))
  return RANK_TIERS[clamped - 1]
}

/** Calculate rank tier from cumulative XP. */
export function getRankFromXP(xp: number): RankTier {
  let current = RANK_TIERS[0]
  for (const tier of RANK_TIERS) {
    if (xp >= tier.xpRequired) {
      current = tier
    } else {
      break
    }
  }
  return current
}

/** XP progress toward next tier: returns 0.0 to 1.0 progress and XP needed. */
export function getXPProgress(xp: number): {
  current: RankTier
  next: RankTier | null
  progress: number
  xpNeeded: number
} {
  const current = getRankFromXP(xp)
  if (current.level === 500) {
    return { current, next: null, progress: 1, xpNeeded: 0 }
  }
  // level is 1-indexed, array is 0-indexed => next tier is at index [current.level]
  const next = RANK_TIERS[current.level]
  const rangeStart = current.xpRequired
  const rangeEnd = next.xpRequired
  const progress = rangeEnd > rangeStart
    ? Math.min((xp - rangeStart) / (rangeEnd - rangeStart), 1)
    : 1
  return { current, next, progress, xpNeeded: Math.max(rangeEnd - xp, 0) }
}

/** Get all tiers belonging to a specific group. */
export function getTiersByGroup(group: RankGroup): RankTier[] {
  return RANK_TIERS.filter(r => r.group === group)
}

/** Get the XP required for a specific level (1-500). */
export function getXPForLevel(level: number): number {
  return calculateXP(level)
}

/** Get the group name for a given level. */
export function getGroupForLevelPublic(level: number): RankGroup {
  return getGroupForLevel(level)
}

// ── Feature Unlocks (42 total across 6 categories) ────────────────────────────

export const FEATURE_UNLOCKS: FeatureUnlock[] = [
  // ── social (5) ──
  { level: 1,   category: 'social',     name: 'Village Drum Feed',             description: 'Access the Village Drum social feed',                           emoji: '\u{1F941}' },
  { level: 2,   category: 'social',     name: 'Direct Messages',              description: 'Send direct messages through Seso chat',                        emoji: '\u{1F4AC}' },
  { level: 6,   category: 'social',     name: 'Village Events',               description: 'Join village events as a spectator',                            emoji: '\u{1F389}' },
  { level: 30,  category: 'social',     name: 'Spray Split 90/10',            description: 'Creator receives 90% of all Spray sent to your content',         emoji: '\u{1F4B8}' },
  { level: 55,  category: 'social',     name: 'Custom Feed Algorithm',        description: 'Customize your Soro Soke feed algorithm weights',                emoji: '\u2699\uFE0F' },

  // ── commerce (9) ──
  { level: 3,   category: 'commerce',   name: 'Ajo Circle',                   description: 'Join 1 Ajo savings circle',                                     emoji: '\u2B55' },
  { level: 4,   category: 'commerce',   name: 'Cowrie Wallet',                description: 'Basic Cowrie wallet activated for trading',                      emoji: '\u{1FA99}' },
  { level: 8,   category: 'commerce',   name: 'Night Market',                 description: 'Unlock the Night Market feed for after-hours trading',           emoji: '\u{1F319}' },
  { level: 12,  category: 'commerce',   name: 'Marketplace Browse',           description: 'Open marketplace browsing and basic listings',                   emoji: '\u{1F6D2}' },
  { level: 15,  category: 'commerce',   name: 'Create Ajo Circle',            description: 'Create and manage your own Ajo savings circle',                  emoji: '\u{1F4B0}' },
  { level: 70,  category: 'commerce',   name: 'Live Auctions',                description: 'Bid in live marketplace auctions',                               emoji: '\u{1F528}' },
  { level: 110, category: 'commerce',   name: 'Extended Escrow',              description: 'Escrow lock up to \u20A1100,000 Cowrie',                         emoji: '\u{1F512}' },
  { level: 225, category: 'commerce',   name: 'Village Commerce Commission',  description: 'Earn commission on village commerce (1%)',                       emoji: '\u{1F4B9}' },
  { level: 350, category: 'commerce',   name: 'Revenue Share',                description: 'Revenue share from referred villages',                           emoji: '\u{1F4C8}' },

  // ── governance (6) ──
  { level: 90,  category: 'governance', name: 'Orisha Council Seat',          description: 'Claim a seat on the Orisha governing council',                   emoji: '\u{1F3DB}' },
  { level: 120, category: 'governance', name: 'Oracle Debates',               description: 'Host and moderate Oracle Debate sessions',                       emoji: '\u{1F5E3}' },
  { level: 200, category: 'governance', name: 'Village Governance Seat',      description: 'Claim a permanent seat in village governance',                    emoji: '\u{1F3DB}' },
  { level: 400, category: 'governance', name: 'Platform Board Advisor',       description: 'Advisory role on the platform governing board',                   emoji: '\u{1F4CB}' },
  { level: 450, category: 'governance', name: 'Eternal Council Member',       description: 'Permanent seat on the Eternal governing council',                 emoji: '\u{1F3DB}' },
  { level: 475, category: 'governance', name: 'Platform Policy Shaping',      description: 'Direct influence on platform policy decisions',                   emoji: '\u{1F5F3}' },

  // ── media (5) ──
  { level: 5,   category: 'media',      name: 'Voice Stories',                description: 'Post Voice Stories to the feed',                                 emoji: '\u{1F399}' },
  { level: 21,  category: 'media',      name: 'Go Live on Jollof TV',         description: 'Start live streaming on Jollof TV',                              emoji: '\u{1F4F9}' },
  { level: 35,  category: 'media',      name: 'Post Scheduling',              description: 'Schedule posts up to 24 hours in advance',                       emoji: '\u{1F4C5}' },
  { level: 45,  category: 'media',      name: 'Extended Voice Stories',        description: 'Extended voice story length (up to 10 minutes)',                  emoji: '\u{1F3A4}' },
  { level: 150, category: 'media',      name: 'Sovereign Griot AI',           description: 'Access the Sovereign Griot AI assistant',                         emoji: '\u{1F9E0}' },

  // ── identity (14) ──
  { level: 10,  category: 'identity',   name: 'Soro Soke Badge',             description: 'Soro Soke badge displayed on your profile',                       emoji: '\u{1F3C5}' },
  { level: 18,  category: 'identity',   name: 'Custom Profile Theme',        description: 'Customize your profile color theme',                              emoji: '\u{1F3A8}' },
  { level: 25,  category: 'identity',   name: 'Warrior Badge',               description: 'Warrior badge unlocked for profile display',                      emoji: '\u2694\uFE0F' },
  { level: 40,  category: 'identity',   name: 'Elder Badge',                 description: 'Elder badge displayed on all your posts',                          emoji: '\u{1F985}' },
  { level: 50,  category: 'identity',   name: 'Elder Forever Badge',         description: 'Platform Elder forever badge \u2014 never expires',                emoji: '\u{1F3C6}' },
  { level: 61,  category: 'identity',   name: 'Crest IV',                    description: 'Crest IV unlocked \u2014 advanced tool gating',                    emoji: '\u{1F6E1}' },
  { level: 75,  category: 'identity',   name: 'Ancestral Record Signing',    description: 'Sign and verify ancestral records on-chain',                       emoji: '\u{1F4DC}' },
  { level: 80,  category: 'identity',   name: 'Oba Palace Banner',           description: 'Oba palace profile banner unlocked',                               emoji: '\u{1F3DB}' },
  { level: 85,  category: 'identity',   name: 'Orisha Golden Badge',         description: 'Orisha golden badge on profile and posts',                         emoji: '\u2728' },
  { level: 95,  category: 'identity',   name: 'Crest V',                     description: 'Crest V \u2014 the final crest. Supreme tier unlocked',            emoji: '\u{1F451}' },
  { level: 100, category: 'identity',   name: 'Legend Status',               description: 'Legend status \u2014 immortal. Your name lives forever',            emoji: '\u{1F525}' },
  { level: 275, category: 'identity',   name: 'Royal Purple Username',       description: 'Royal purple username color across all platforms',                  emoji: '\u{1F7E3}' },
  { level: 325, category: 'identity',   name: 'Orisha Status',               description: 'Orisha divine status granted with celestial aura',                 emoji: '\u2728' },
  { level: 500, category: 'identity',   name: 'The Eternal Tradition',       description: 'The Eternal Tradition \u2014 all privileges forever',              emoji: '\u{1F48E}' },

  // ── village (3) ──
  { level: 175, category: 'village',    name: 'Elder Mentorship',            description: 'Access the Elder mentorship program to guide Seeds',                emoji: '\u{1F4DA}' },
  { level: 250, category: 'village',    name: 'Territorial Rights',          description: 'Claim territorial rights within your village zone',                 emoji: '\u{1F5FA}' },
  { level: 300, category: 'village',    name: 'Multi-Village Alliance',      description: 'Form alliances spanning multiple villages',                         emoji: '\u{1F91D}' },
]

// ── Village Life Conditions (8) ────────────────────────────────────────────────

export const VILLAGE_LIFE_CONDITIONS = [
  { condition: 'Must trade at least once per moon cycle',     emoji: '\u{1F319}', violationPenalty: '-100 XP' },
  { condition: 'Must attend village square monthly',          emoji: '\u{1F3DB}', violationPenalty: '-200 XP' },
  { condition: 'Must plant roots in at least 2 creators',     emoji: '\u{1F333}', violationPenalty: '-50 XP' },
  { condition: 'Zero tolerance for trade fraud',              emoji: '\u2696\uFE0F', violationPenalty: 'Immediate demotion 5 levels' },
  { condition: 'Must maintain minimum 3.0 trust rating',      emoji: '\u{1F6E1}', violationPenalty: 'Crest freeze' },
  { condition: 'Elders must mentor 1 Seed per quarter',       emoji: '\u{1F4DA}', violationPenalty: '-300 XP', minLevel: 151 },
  { condition: 'Chiefs must host 1 event per season',         emoji: '\u{1F3DF}', violationPenalty: '-500 XP', minLevel: 201 },
  { condition: 'Oba must vote on all governance proposals',   emoji: '\u{1F5F3}', violationPenalty: 'Temporary demotion', minLevel: 261 },
] as const

// ── Go Live Stream Types (8) ───────────────────────────────────────────────────

export const GO_LIVE_TYPES = [
  { id: 'marketplace', name: 'Marketplace Stream',     emoji: '\u{1F3EA}', minLevel: 21 },
  { id: 'teaching',    name: 'Teaching Session',       emoji: '\u{1F4DA}', minLevel: 30 },
  { id: 'concert',     name: 'Concert / Performance',  emoji: '\u{1F3B5}', minLevel: 50 },
  { id: 'debate',      name: 'Oracle Debate',          emoji: '\u{1F5E3}', minLevel: 60 },
  { id: 'auction',     name: 'Live Auction',           emoji: '\u{1F528}', minLevel: 75 },
  { id: 'ceremony',    name: 'Ceremony Broadcast',     emoji: '\u{1F525}', minLevel: 100 },
  { id: 'governance',  name: 'Governance Session',     emoji: '\u{1F3DB}', minLevel: 200 },
  { id: 'coronation',  name: 'Coronation Stream',      emoji: '\u{1F451}', minLevel: 300 },
] as const

// ── Naming Ceremony Milestones (7) ─────────────────────────────────────────────

export const NAMING_MILESTONES = [
  { level: 1,   event: 'First Breath \u2014 Name Given',                emoji: '\u{1F331}' },
  { level: 25,  event: 'Root Ceremony \u2014 Name Strengthened',        emoji: '\u{1F33F}' },
  { level: 100, event: 'Iron Forge \u2014 War Name Earned',             emoji: '\u2694\uFE0F' },
  { level: 200, event: 'Elder Naming \u2014 Wisdom Title',              emoji: '\u{1F985}' },
  { level: 300, event: 'Coronation \u2014 Crown Name Bestowed',         emoji: '\u{1F451}' },
  { level: 400, event: 'Legendary Fire \u2014 Eternal Name Carved',     emoji: '\u{1F525}' },
  { level: 500, event: 'Ancestor Calling \u2014 Name Immortalized',     emoji: '\u2B50' },
] as const

// ── XP Sources / Daily Addiction Loop (15) ─────────────────────────────────────

export const XP_SOURCES = [
  { action: 'Seal a Trade (Escrow)',      xp: 200,  emoji: '\u{1F512}', category: 'commerce' },
  { action: 'K\u00edla post received',    xp: 15,   emoji: '\u2B50',    category: 'social' },
  { action: 'Drum a post to village',     xp: 50,   emoji: '\u{1F941}', category: 'social' },
  { action: 'Go Live on Jollof TV',       xp: 300,  emoji: '\u{1F525}', category: 'media' },
  { action: 'Root Planted in you',        xp: 100,  emoji: '\u{1F333}', category: 'social' },
  { action: 'Event ticket sold',          xp: 75,   emoji: '\u{1F39F}', category: 'commerce' },
  { action: '7-Day Activity Streak',      xp: 500,  emoji: '\u{1F5D3}', category: 'identity' },
  { action: 'Referred a new member',      xp: 250,  emoji: '\u{1F91D}', category: 'village' },
  { action: 'Oracle Debate hosted',       xp: 120,  emoji: '\u{1F5E3}', category: 'governance' },
  { action: 'Village Tool Session',       xp: 30,   emoji: '\u2692',    category: 'village' },
  { action: 'Mentored a Seed',            xp: 150,  emoji: '\u{1F4DA}', category: 'village' },
  { action: 'Dispute resolved fairly',    xp: 180,  emoji: '\u2696\uFE0F', category: 'governance' },
  { action: 'Workshop taught',            xp: 200,  emoji: '\u{1F3EB}', category: 'village' },
  { action: 'Daily login',                xp: 10,   emoji: '\u2600\uFE0F', category: 'identity' },
  { action: 'Profile completion bonus',   xp: 500,  emoji: '\u2705',    category: 'identity' },
] as const

// ── Violation Consequences (6) ─────────────────────────────────────────────────

export const VIOLATION_CONSEQUENCES = [
  { violation: 'Spam / Bot behavior',       penalty: 'XP freeze 7 days',                          severity: 'minor' as const },
  { violation: 'Trade fraud',               penalty: 'Demotion 5 levels + escrow freeze',         severity: 'major' as const },
  { violation: 'Hate speech',               penalty: 'Demotion 10 levels + 30-day mute',          severity: 'major' as const },
  { violation: 'Account manipulation',      penalty: 'Permanent ban + Cowrie forfeit',             severity: 'critical' as const },
  { violation: 'Clan boundary violation',   penalty: 'IDILE access revoked 90 days',              severity: 'major' as const },
  { violation: 'Elder duty neglect',        penalty: '-300 XP + title suspension',                severity: 'minor' as const },
] as const
