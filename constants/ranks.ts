// ── Honor Rank System — 100 African Tiers ────────────────────────────────────
// 9 groups: Seed → Trader → Warrior → Elder → Chief → Oba → Orisha → Legend → Eternal

export interface RankTier {
  level: number
  name: string          // Yoruba/Igbo/Hausa/Akan name
  subtitle: string      // English sub-title
  emoji: string
  color: string         // Hex accent color
  xpRequired: number    // Cumulative XP to reach this tier
  perk: string          // Unlocked perk/benefit
  group: RankGroup
}

export type RankGroup =
  | 'Seed'
  | 'Trader'
  | 'Warrior'
  | 'Elder'
  | 'Chief'
  | 'Oba'
  | 'Orisha'
  | 'Legend'
  | 'Eternal'

export const RANK_GROUP_META: Record<RankGroup, { color: string; emoji: string; description: string }> = {
  Seed:    { color: '#78716c', emoji: '🌱', description: 'New arrivals, finding their roots' },
  Trader:  { color: '#16a34a', emoji: '🧺', description: 'Active in the village marketplace' },
  Warrior: { color: '#2563eb', emoji: '⚔️', description: 'Proven contributors and builders' },
  Elder:   { color: '#d97706', emoji: '🦅', description: 'Trusted voices and village guides' },
  Chief:   { color: '#dc2626', emoji: '👑', description: 'Leaders who shape the compound' },
  Oba:     { color: '#7c3aed', emoji: '🏛', description: 'Sovereign pillars of the nation' },
  Orisha:  { color: '#0891b2', emoji: '✨', description: 'Legendary builders of civilization' },
  Legend:  { color: '#db2777', emoji: '🔥', description: 'Immortal names in the village drum' },
  Eternal: { color: '#d4a017', emoji: '⭐', description: 'One with the Ancestors — the highest' },
}

export const XP_SOURCES = [
  { action: 'Seal a Trade (Escrow)',      xp: 200,  emoji: '🔒' },
  { action: 'Kíla post received',         xp: 15,   emoji: '⭐' },
  { action: 'Drum a post to village',     xp: 50,   emoji: '🥁' },
  { action: 'Go Live on Jollof TV',       xp: 300,  emoji: '🔥' },
  { action: 'Root Planted in you',        xp: 100,  emoji: '🌳' },
  { action: 'Event ticket sold',          xp: 75,   emoji: '🎟' },
  { action: '7-Day Activity Streak',      xp: 500,  emoji: '🗓' },
  { action: 'Referred a new member',      xp: 250,  emoji: '🤝' },
  { action: 'Oracle Debate hosted',       xp: 120,  emoji: '🗣' },
  { action: 'Village Tool Session',       xp: 30,   emoji: '⚒' },
] as const

// ── 100 Tiers ─────────────────────────────────────────────────────────────────
export const RANK_TIERS: RankTier[] = [
  // ── GROUP 1: SEED (1-10) ─────────────────────────────────────────────────
  { level: 1,  group: 'Seed',    name: 'Àrọ̀mọ',       subtitle: 'The Seedling',         emoji: '🌱',  color: '#78716c', xpRequired: 0,      perk: 'Access to Village Drum feed' },
  { level: 2,  group: 'Seed',    name: 'Ọmọ Tuntun',   subtitle: 'New Child',            emoji: '🌿',  color: '#78716c', xpRequired: 100,    perk: 'Send direct messages (Seso)' },
  { level: 3,  group: 'Seed',    name: 'Àlejò',        subtitle: 'The Visitor',          emoji: '👣',  color: '#78716c', xpRequired: 250,    perk: 'Join 1 Ajo circle' },
  { level: 4,  group: 'Seed',    name: 'Ìmọ̀lè Kékeré', subtitle: 'Small Light',         emoji: '🕯',  color: '#78716c', xpRequired: 450,    perk: 'Custom Afro-ID display name' },
  { level: 5,  group: 'Seed',    name: 'Gbé Ẹsẹ',      subtitle: 'First Steps',          emoji: '🦶',  color: '#78716c', xpRequired: 700,    perk: 'Post Voice Stories' },
  { level: 6,  group: 'Seed',    name: 'Ẹbí Tuntun',   subtitle: 'New Kin',              emoji: '🏠',  color: '#78716c', xpRequired: 1000,   perk: 'Join a Village guild' },
  { level: 7,  group: 'Seed',    name: 'Ẹni Wá',       subtitle: 'One Who Comes',        emoji: '🌾',  color: '#78716c', xpRequired: 1400,   perk: 'Plant Roots in 3 creators' },
  { level: 8,  group: 'Seed',    name: 'Ewé Àgbàdo',   subtitle: 'Corn Leaf',            emoji: '🌽',  color: '#78716c', xpRequired: 1900,   perk: 'Unlock Night Market feed' },
  { level: 9,  group: 'Seed',    name: 'Àáyán',        subtitle: 'Tender Shoot',         emoji: '🪴',  color: '#78716c', xpRequired: 2500,   perk: 'Echo Drum (repost) enabled' },
  { level: 10, group: 'Seed',    name: 'Ọ̀pẹ Kékeré',   subtitle: 'Small Palm Tree',      emoji: '🌴',  color: '#78716c', xpRequired: 3200,   perk: 'Soro Soke badge on profile' },

  // ── GROUP 2: TRADER (11-20) ──────────────────────────────────────────────
  { level: 11, group: 'Trader',  name: 'Alátagba',     subtitle: 'Small Trader',         emoji: '🧺',  color: '#16a34a', xpRequired: 4000,   perk: 'Open a Market Listing' },
  { level: 12, group: 'Trader',  name: 'Oníṣòwò',      subtitle: 'One Who Trades',       emoji: '🪙',  color: '#16a34a', xpRequired: 5000,   perk: 'Escrow lock up to ₡10,000' },
  { level: 13, group: 'Trader',  name: 'Aṣòwò Ilé',    subtitle: 'House Trader',         emoji: '🏪',  color: '#16a34a', xpRequired: 6200,   perk: 'Schedule posts 24h ahead' },
  { level: 14, group: 'Trader',  name: 'Arìnà',        subtitle: 'Market Walker',        emoji: '🚶',  color: '#16a34a', xpRequired: 7600,   perk: 'Bid in live auctions' },
  { level: 15, group: 'Trader',  name: 'Àjọ Ẹni',      subtitle: 'Circle Member',        emoji: '⭕',  color: '#16a34a', xpRequired: 9200,   perk: 'Create your own Ajo circle' },
  { level: 16, group: 'Trader',  name: 'Olùdarí',      subtitle: 'One Who Directs',      emoji: '🗺',  color: '#16a34a', xpRequired: 11000,  perk: 'Unlock Village Tool suite' },
  { level: 17, group: 'Trader',  name: 'Àṣà Oníṣòwò',  subtitle: 'Trade Tradition',      emoji: '📜',  color: '#16a34a', xpRequired: 13200,  perk: 'Proverb Chain posts' },
  { level: 18, group: 'Trader',  name: 'Olólà',        subtitle: 'Person of Honour',     emoji: '🎖',  color: '#16a34a', xpRequired: 15600,  perk: 'Custom feed algorithm weight' },
  { level: 19, group: 'Trader',  name: 'Ayédèrò',      subtitle: 'Life\'s Ease',          emoji: '🌊',  color: '#16a34a', xpRequired: 18400,  perk: 'Reduced platform fees (8%)' },
  { level: 20, group: 'Trader',  name: 'Ọ̀pẹlẹ Owó',   subtitle: 'Thread of Cowrie',     emoji: '💸',  color: '#16a34a', xpRequired: 21600,  perk: 'Trader crest on all posts' },

  // ── GROUP 3: WARRIOR (21-35) ─────────────────────────────────────────────
  { level: 21, group: 'Warrior', name: 'Ọmọ Ogun',     subtitle: 'Child of Iron',        emoji: '⚔️',  color: '#2563eb', xpRequired: 25200,  perk: 'Go Live on Jollof TV' },
  { level: 22, group: 'Warrior', name: 'Aláàgbọn',     subtitle: 'One With Strength',    emoji: '💪',  color: '#2563eb', xpRequired: 29200,  perk: 'Dual-village role membership' },
  { level: 23, group: 'Warrior', name: 'Jagunjagun',   subtitle: 'Warrior Fighter',      emoji: '🛡',  color: '#2563eb', xpRequired: 33600,  perk: 'Dispute arbitration access' },
  { level: 24, group: 'Warrior', name: 'Ọ̀tẹlẹmùọ̀',   subtitle: 'Iron Grip',            emoji: '🔩',  color: '#2563eb', xpRequired: 38400,  perk: 'Post to Nation Square' },
  { level: 25, group: 'Warrior', name: 'Aṣọjú Egbé',   subtitle: 'Guild Representative', emoji: '🏅',  color: '#2563eb', xpRequired: 43600,  perk: 'Warrior badge unlocks' },
  { level: 26, group: 'Warrior', name: 'Olùdarí Ogun', subtitle: 'Iron Commander',       emoji: '⚙️',  color: '#2563eb', xpRequired: 49200,  perk: 'Village Notice posts' },
  { level: 27, group: 'Warrior', name: 'Àgbàdo Irin',  subtitle: 'Iron Corn — Tough',    emoji: '🌾',  color: '#2563eb', xpRequired: 55200,  perk: 'Host Oracle Debates' },
  { level: 28, group: 'Warrior', name: 'Ẹ̀gún Ogun',    subtitle: 'Iron Ancestor',        emoji: '🦴',  color: '#2563eb', xpRequired: 61600,  perk: 'Escrow up to ₡100,000' },
  { level: 29, group: 'Warrior', name: 'Olómọ Ogun',   subtitle: 'Iron Parent',          emoji: '🔱',  color: '#2563eb', xpRequired: 68400,  perk: 'Multi-village broadcast' },
  { level: 30, group: 'Warrior', name: 'Àáyán Irin',   subtitle: 'Iron Sapling',         emoji: '🌿',  color: '#2563eb', xpRequired: 75600,  perk: 'Spray split 90/10 (creator 90%)' },
  { level: 31, group: 'Warrior', name: 'Okunrin Ogun', subtitle: 'Man of Iron',          emoji: '🗡',  color: '#2563eb', xpRequired: 83200,  perk: 'Event ticket resale enabled' },
  { level: 32, group: 'Warrior', name: 'Àgídán',       subtitle: 'The Bold One',         emoji: '⚡',  color: '#2563eb', xpRequired: 91200,  perk: 'Group ticket pool creation' },
  { level: 33, group: 'Warrior', name: 'Okùnkùn Ogun', subtitle: 'Iron Darkness',        emoji: '🌑',  color: '#2563eb', xpRequired: 99600,  perk: 'Custom stream thumbnail' },
  { level: 34, group: 'Warrior', name: 'Ògún Bíbọ̀',   subtitle: 'Ogun Returned',        emoji: '🏹',  color: '#2563eb', xpRequired: 108400, perk: 'Crest III badge unlocks' },
  { level: 35, group: 'Warrior', name: 'Àgbárígi',     subtitle: 'The Hard Wood Tree',   emoji: '🌳',  color: '#2563eb', xpRequired: 117600, perk: 'Warrior crest on all posts' },

  // ── GROUP 4: ELDER (36-50) ────────────────────────────────────────────────
  { level: 36, group: 'Elder',   name: 'Ìyá àgbà',     subtitle: 'Grandmother',          emoji: '🧓',  color: '#d97706', xpRequired: 127200, perk: 'Elder council access' },
  { level: 37, group: 'Elder',   name: 'Bàbáàgbà',     subtitle: 'Grandfather Wisdom',   emoji: '🧑‍🦳', color: '#d97706', xpRequired: 137200, perk: 'Mediate village disputes' },
  { level: 38, group: 'Elder',   name: 'Àgbà Ilé',     subtitle: 'House Elder',          emoji: '🏚',  color: '#d97706', xpRequired: 147600, perk: 'Pin 3 posts to profile' },
  { level: 39, group: 'Elder',   name: 'Irúnmọlẹ',     subtitle: 'Sacred Force',         emoji: '✦',   color: '#d97706', xpRequired: 158400, perk: 'Commission on referral trades (2%)' },
  { level: 40, group: 'Elder',   name: 'Olúwafẹ́mi',    subtitle: 'Beloved of God',       emoji: '🌟',  color: '#d97706', xpRequired: 169600, perk: 'Elder badge on public posts' },
  { level: 41, group: 'Elder',   name: 'Àbímọ Àgbà',   subtitle: 'Born to the Elders',   emoji: '👴',  color: '#d97706', xpRequired: 181200, perk: 'View all village analytics' },
  { level: 42, group: 'Elder',   name: 'Ẹlẹ́jọ́',        subtitle: 'Judge — The Arbiter',  emoji: '⚖️',  color: '#d97706', xpRequired: 193200, perk: 'Reduced Cowrie fees (5%)' },
  { level: 43, group: 'Elder',   name: 'Olúwakẹ́mi',    subtitle: 'God Pampers Me',       emoji: '💛',  color: '#d97706', xpRequired: 205600, perk: 'Elder-only feed digest' },
  { level: 44, group: 'Elder',   name: 'Ẹgbẹ́ Àgbà',   subtitle: 'Elder Circle',         emoji: '🔵',  color: '#d97706', xpRequired: 218400, perk: 'Custom Afro-ID display name' },
  { level: 45, group: 'Elder',   name: 'Ìmọ̀ Àgbà',    subtitle: 'Elder Knowledge',      emoji: '📖',  color: '#d97706', xpRequired: 231600, perk: 'Content scheduling 72h ahead' },
  { level: 46, group: 'Elder',   name: 'Olùkọ́',        subtitle: 'The Teacher',          emoji: '📚',  color: '#d97706', xpRequired: 245200, perk: 'Teach a Village Workshop' },
  { level: 47, group: 'Elder',   name: 'Àṣà Àgbà',     subtitle: 'Elder Tradition',      emoji: '🏺',  color: '#d97706', xpRequired: 259200, perk: 'Early access to new features' },
  { level: 48, group: 'Elder',   name: 'Olúṣọ Ìwà',    subtitle: 'Guardian of Character', emoji: '🦅',  color: '#d97706', xpRequired: 273600, perk: 'Elder crest on profile' },
  { level: 49, group: 'Elder',   name: 'Olóye',        subtitle: 'Title Holder',          emoji: '🎗',  color: '#d97706', xpRequired: 288400, perk: 'Appear in Elder listings' },
  { level: 50, group: 'Elder',   name: 'Àgbà Àfọn',   subtitle: 'Elder of the River',    emoji: '🌊',  color: '#d97706', xpRequired: 303600, perk: 'Platform Elder forever badge' },

  // ── GROUP 5: CHIEF (51-65) ────────────────────────────────────────────────
  { level: 51, group: 'Chief',   name: 'Olórí Egbé',   subtitle: 'Guild Chief',           emoji: '👑',  color: '#dc2626', xpRequired: 325000, perk: 'Create a Village sub-council' },
  { level: 52, group: 'Chief',   name: 'Onílé',        subtitle: 'Owner of the Land',     emoji: '🏡',  color: '#dc2626', xpRequired: 347000, perk: 'Named on Village Hall of Fame' },
  { level: 53, group: 'Chief',   name: 'Aláṣe',        subtitle: 'One Who Commands',      emoji: '🌶',  color: '#dc2626', xpRequired: 370000, perk: 'Commission on village commerce (1%)' },
  { level: 54, group: 'Chief',   name: 'Olórí Àwọn',   subtitle: 'Head of Many',          emoji: '👥',  color: '#dc2626', xpRequired: 394000, perk: 'Private Chief-only channel' },
  { level: 55, group: 'Chief',   name: 'Ọ̀pẹ Àgbà',    subtitle: 'Elder Palm',            emoji: '🌴',  color: '#dc2626', xpRequired: 419000, perk: 'Host events with Cowrie gate' },
  { level: 56, group: 'Chief',   name: 'Bàbálóde',     subtitle: 'Father of the Outskirts', emoji: '🗺', color: '#dc2626', xpRequired: 445000, perk: 'Geo-restrict your broadcasts' },
  { level: 57, group: 'Chief',   name: 'Olórí Oja',    subtitle: 'Market Chief',           emoji: '🏬', color: '#dc2626', xpRequired: 472000, perk: 'Commission on sponsored posts (3%)' },
  { level: 58, group: 'Chief',   name: 'Ẹlẹ́gbẹ̀pàdé',  subtitle: 'Meeting Lord',          emoji: '🤝',  color: '#dc2626', xpRequired: 500000, perk: 'Chief badge on all platforms' },
  { level: 59, group: 'Chief',   name: 'Olójú Ọ̀nà',   subtitle: 'Path Keeper',           emoji: '🛤',  color: '#dc2626', xpRequired: 529000, perk: 'Treasury view for your village' },
  { level: 60, group: 'Chief',   name: 'Àgbàlagba',    subtitle: 'The Senior One',        emoji: '🧿',  color: '#dc2626', xpRequired: 559000, perk: 'Annual Chief Assembly invite' },
  { level: 61, group: 'Chief',   name: 'Ọmọ Àdá',     subtitle: 'Child of the Sword',     emoji: '🗡',  color: '#dc2626', xpRequired: 590000, perk: 'Crest IV unlocked' },
  { level: 62, group: 'Chief',   name: 'Olúṣọ Ẹgbé',  subtitle: 'Guild Guardian',         emoji: '🧱',  color: '#dc2626', xpRequired: 622000, perk: 'Village land allocation seat' },
  { level: 63, group: 'Chief',   name: 'Aṣójú Ìlú',   subtitle: 'City Ambassador',        emoji: '🏙',  color: '#dc2626', xpRequired: 655000, perk: 'National broadcast auto-boost' },
  { level: 64, group: 'Chief',   name: 'Àmọ̀tẹ́kùn',   subtitle: 'The Leopard',           emoji: '🐆',  color: '#dc2626', xpRequired: 689000, perk: 'All platform fees waived' },
  { level: 65, group: 'Chief',   name: 'Adé Ìpele',    subtitle: 'Crown Level',            emoji: '👑',  color: '#dc2626', xpRequired: 724000, perk: 'Chief crown crest forever' },

  // ── GROUP 6: OBA (66-80) ─────────────────────────────────────────────────
  { level: 66, group: 'Oba',     name: 'Ọba Kékeré',   subtitle: 'Young King',            emoji: '🏛',  color: '#7c3aed', xpRequired: 780000, perk: 'Oba sovereignty tier' },
  { level: 67, group: 'Oba',     name: 'Ọba Ìbílẹ̀',   subtitle: 'Traditional King',      emoji: '🪖',  color: '#7c3aed', xpRequired: 840000, perk: 'Royal purple username color' },
  { level: 68, group: 'Oba',     name: 'Kàbíyèsí',     subtitle: 'Unquestionable One',    emoji: '⚜️',  color: '#7c3aed', xpRequired: 903000, perk: 'Sovereign Griot AI access' },
  { level: 69, group: 'Oba',     name: 'Olóyè Àárọ̀',  subtitle: 'Dawn Title Keeper',     emoji: '🌄',  color: '#7c3aed', xpRequired: 969000, perk: 'Own a sub-village economy' },
  { level: 70, group: 'Oba',     name: 'Ọba Tó Dára',  subtitle: 'The Good King',         emoji: '✨',  color: '#7c3aed', xpRequired: 1040000, perk: '0% platform commission on trades' },
  { level: 71, group: 'Oba',     name: 'Ẹni Ọlọrun',   subtitle: 'God\'s Person',          emoji: '🙏',  color: '#7c3aed', xpRequired: 1115000, perk: 'Verified "✦ Oba" tick on profile' },
  { level: 72, group: 'Oba',     name: 'Àṣà Ọba',      subtitle: 'Kingly Tradition',       emoji: '📿',  color: '#7c3aed', xpRequired: 1193000, perk: 'Annual harvest distribution bonus' },
  { level: 73, group: 'Oba',     name: 'Ọba Ìjà',      subtitle: 'King of Battles',        emoji: '⚔️',  color: '#7c3aed', xpRequired: 1275000, perk: 'Create multi-village alliance' },
  { level: 74, group: 'Oba',     name: 'Olúwapẹ̀lú',    subtitle: 'God Pleads on my Behalf', emoji: '🕊', color: '#7c3aed', xpRequired: 1360000, perk: 'Oba council voting rights' },
  { level: 75, group: 'Oba',     name: 'Ọba Àná',       subtitle: 'King of Yesterday',     emoji: '📜',  color: '#7c3aed', xpRequired: 1450000, perk: 'Ancestral record signing' },
  { level: 76, group: 'Oba',     name: 'Asiwaju',       subtitle: 'The One Who Leads',     emoji: '🚀',  color: '#7c3aed', xpRequired: 1545000, perk: 'Nations-Square pinned post slot' },
  { level: 77, group: 'Oba',     name: 'Ọba Aláàfin',   subtitle: 'King of Inner Palace',   emoji: '🗝',  color: '#7c3aed', xpRequired: 1644000, perk: 'Platform governance vote' },
  { level: 78, group: 'Oba',     name: 'Ọba Àlùfáà',   subtitle: 'Priestly King',          emoji: '🙌',  color: '#7c3aed', xpRequired: 1748000, perk: 'Oba ring on avatar forever' },
  { level: 79, group: 'Oba',     name: 'Kíngàbé',      subtitle: 'Sovereign Above All',    emoji: '🌐',  color: '#7c3aed', xpRequired: 1858000, perk: 'Cross-village treasury bridge' },
  { level: 80, group: 'Oba',     name: 'Olóyè Ọba',    subtitle: 'Title King',             emoji: '👁',  color: '#7c3aed', xpRequired: 1974000, perk: 'Oba palace profile banner' },

  // ── GROUP 7: ORISHA (81-90) ──────────────────────────────────────────────
  { level: 81, group: 'Orisha',  name: 'Ìmọ̀lẹ Tuntun', subtitle: 'New Light Being',      emoji: '✨',  color: '#0891b2', xpRequired: 2200000, perk: 'Orisha status granted' },
  { level: 82, group: 'Orisha',  name: 'Ọ̀ṣun Bíbọ̀',   subtitle: 'Oshun Reborn',         emoji: '💛',  color: '#0891b2', xpRequired: 2440000, perk: 'Free ₡500 monthly creator fund' },
  { level: 83, group: 'Orisha',  name: 'Ṣàngó Tó Wá',  subtitle: 'Thunder Has Come',     emoji: '⚡',  color: '#0891b2', xpRequired: 2695000, perk: 'Custom village API access' },
  { level: 84, group: 'Orisha',  name: 'Ọba Àlà',      subtitle: 'King of the White Cloth', emoji: '🤍', color: '#0891b2', xpRequired: 2965000, perk: 'Platform board advisor status' },
  { level: 85, group: 'Orisha',  name: 'Ẹgúngún',      subtitle: 'Voice of the Ancestors', emoji: '🎭',  color: '#0891b2', xpRequired: 3252000, perk: 'Orisha golden badge + all platform access' },
  { level: 86, group: 'Orisha',  name: 'Ọ̀rúnmìlà',    subtitle: 'Witness of Fate',       emoji: '📿',  color: '#0891b2', xpRequired: 3555000, perk: 'AI Griot priority response (1s SLA)' },
  { level: 87, group: 'Orisha',  name: 'Olódùmarè',    subtitle: 'Supreme Creator',       emoji: '🌌',  color: '#0891b2', xpRequired: 3876000, perk: 'Revenue share from referred villages (0.5%)' },
  { level: 88, group: 'Orisha',  name: 'Àṣà Ọ̀rún',    subtitle: 'Celestial Tradition',   emoji: '🌠',  color: '#0891b2', xpRequired: 4215000, perk: 'Orisha council seat' },
  { level: 89, group: 'Orisha',  name: 'Ẹ̀jọ Ọ̀rún',   subtitle: 'Celestial Judgment',   emoji: '⚖️',  color: '#0891b2', xpRequired: 4572000, perk: 'Orisha portrait hall entry' },
  { level: 90, group: 'Orisha',  name: 'Ìmọ̀lẹ Ìpele', subtitle: 'Tier of Light',         emoji: '💫',  color: '#0891b2', xpRequired: 4947000, perk: 'Permanent Orisha aura on avatar' },

  // ── GROUP 8: LEGEND (91-99) ──────────────────────────────────────────────
  { level: 91, group: 'Legend',  name: 'Àría Ayé',      subtitle: 'Earthly Legend',       emoji: '🔥',  color: '#db2777', xpRequired: 5500000, perk: 'Legend status — immortal tier' },
  { level: 92, group: 'Legend',  name: 'Ọmọ Ìtàn',     subtitle: 'Child of History',      emoji: '📖',  color: '#db2777', xpRequired: 6100000, perk: 'Written into village annals forever' },
  { level: 93, group: 'Legend',  name: 'Olórin Àgbà',   subtitle: 'Melody of the Elders',  emoji: '🎶',  color: '#db2777', xpRequired: 6750000, perk: 'Legend monthly stipend (₡1,000)' },
  { level: 94, group: 'Legend',  name: 'Ọba Ìtàn',     subtitle: 'King of Stories',        emoji: '👑',  color: '#db2777', xpRequired: 7450000, perk: 'Endorse any village initiative' },
  { level: 95, group: 'Legend',  name: 'Aṣání Ìtàn',   subtitle: 'History Carver',         emoji: '🪓',  color: '#db2777', xpRequired: 8200000, perk: 'Legend flame on all content' },
  { level: 96, group: 'Legend',  name: 'Ọlọ́jọ́',       subtitle: 'Master of Days',         emoji: '🗓',  color: '#db2777', xpRequired: 9000000, perk: 'Control village market schedule' },
  { level: 97, group: 'Legend',  name: 'Onítẹ̀wọ̀gbẹ̀', subtitle: 'One Who Subdues',       emoji: '🦁',  color: '#db2777', xpRequired: 9850000, perk: 'Crest V — the final crest' },
  { level: 98, group: 'Legend',  name: 'Àgbàdo Ìtàn',  subtitle: 'Seed of Legend',         emoji: '🌽',  color: '#db2777', xpRequired: 10750000, perk: 'Legend hall of fame plaque' },
  { level: 99, group: 'Legend',  name: 'Ṣùbọmi',       subtitle: 'I Bow to You',           emoji: '🙇',  color: '#db2777', xpRequired: 11700000, perk: 'Pre-access to all new platform features' },

  // ── GROUP 9: ETERNAL (100) ───────────────────────────────────────────────
  { level: 100, group: 'Eternal', name: 'Àṣà Àtọ̀runwá', subtitle: 'The Eternal Tradition', emoji: '⭐', color: '#d4a017', xpRequired: 15000000, perk: 'Eternal — all platform privileges, forever' },
]

// ── Helper functions ──────────────────────────────────────────────────────────

/** Get rank tier by level (1-100) */
export function getRankByLevel(level: number): RankTier {
  return RANK_TIERS.find(r => r.level === level) ?? RANK_TIERS[0]
}

/** Calculate rank level from XP */
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

/** XP progress to next tier (0.0–1.0) */
export function getXPProgress(xp: number): { current: RankTier; next: RankTier | null; progress: number; xpNeeded: number } {
  const current = getRankFromXP(xp)
  if (current.level === 100) return { current, next: null, progress: 1, xpNeeded: 0 }
  const next = RANK_TIERS[current.level]  // level is 1-indexed, array is 0-indexed → next is at [level]
  const rangeStart = current.xpRequired
  const rangeEnd   = next.xpRequired
  const progress   = Math.min((xp - rangeStart) / (rangeEnd - rangeStart), 1)
  return { current, next, progress, xpNeeded: rangeEnd - xp }
}

/** Get all tiers in a group */
export function getTiersByGroup(group: RankGroup): RankTier[] {
  return RANK_TIERS.filter(r => r.group === group)
}
