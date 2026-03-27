// Pan-African Ceremony Configuration — source of truth for all naming ceremonies
export interface CeremonyConfig {
  ceremonyName: string
  ceremonyNameTranslation: string
  welcomePhrase: string
  welcomeLanguage: string
  namingProverb: string
  proverbOrigin: string
  namingRitual: string
  elderTitle: string
}

export const CEREMONY_CONFIG: Record<string, CeremonyConfig> = {
  YORUBA: { ceremonyName:'Ìsọmọlórúkọ', ceremonyNameTranslation:'The Giving of the Name', welcomePhrase:'Ẹ káàbọ̀ sí ilé wa', welcomeLanguage:'Yoruba', namingProverb:'Orúkọ rere sàn ju wúrà àti fàdákà lọ', proverbOrigin:'A good name is worth more than gold and silver — Yoruba', namingRitual:'On the eighth day the child is named. The name carries the spirit of the ancestor who is being reborn.', elderTitle:'Babaláwo' },
  IGBO: { ceremonyName:'Igu Afa', ceremonyNameTranslation:'The Reading of the Name', welcomePhrase:"Nnọọ n'ụlọ anyị", welcomeLanguage:'Igbo', namingProverb:'Aha ọma ka ego', proverbOrigin:'A good name is greater than wealth — Igbo', namingRitual:'The dibia reads the chi of the child and gives a name that aligns with their destiny path.', elderTitle:'Dibia' },
  HAUSA: { ceremonyName:'Wali', ceremonyNameTranslation:'The Naming', welcomePhrase:'Barka da zuwa gidanmu', welcomeLanguage:'Hausa', namingProverb:'Suna nagari ya fi zinari', proverbOrigin:'A good name is better than gold — Hausa', namingRitual:"On the seventh day after birth, the imam whispers the name into the child's ear before anyone else hears it.", elderTitle:'Malam' },
  AKAN: { ceremonyName:'Din To', ceremonyNameTranslation:'The Outdooring', welcomePhrase:'Akwaaba', welcomeLanguage:'Twi / Akan', namingProverb:'Onipa na ohyira onipa', proverbOrigin:'It is a person who blesses a person — Akan', namingRitual:"On the eighth day the child is carried outdoors for the first time. The elder touches water and wine to the child's lips before giving the name.", elderTitle:'Okyeame' },
  EWE: { ceremonyName:'Vinyawo', ceremonyNameTranslation:'The Child Arrival Ceremony', welcomePhrase:'Woezo', welcomeLanguage:'Ewe', namingProverb:'Ŋutsu aɖe mele ɖoɖo me o', proverbOrigin:'No person stands alone — Ewe', namingRitual:"The family gathers and the eldest woman announces the child's name to the sun at dawn.", elderTitle:'Togbui' },
  WOLOF: { ceremonyName:'Ngente', ceremonyNameTranslation:'The Naming Ceremony', welcomePhrase:'Dalal ak jamm', welcomeLanguage:'Wolof', namingProverb:'Nit, nit ay garabam', proverbOrigin:"A person's remedy is another person — Wolof", namingRitual:"On the eighth day, the marabout shaves the child's head and whispers the name. The weight of the hair in gold or grain is given to the poor.", elderTitle:'Serin' },
  FULANI: { ceremonyName:'Innde', ceremonyNameTranslation:'The Name Giving', welcomePhrase:'Jam waali', welcomeLanguage:'Fulfulde', namingProverb:'Ko innde woni neɗɗo', proverbOrigin:'A name is what makes a person — Fulani', namingRitual:'The father whispers the name into the ear of the child while facing east at sunrise.', elderTitle:'Modibbo' },
  MANDINKA: { ceremonyName:'Kuyateh', ceremonyNameTranslation:'The Griot Naming', welcomePhrase:'I be tolo', welcomeLanguage:'Mandinka', namingProverb:"Tolo tè mògo ye, a tè mògo sigi", proverbOrigin:'A name does not make a person, but it seats them among the people — Mandinka', namingRitual:'The griot announces the name with song and drum so the ancestors hear it first and the community bears witness.', elderTitle:'Jali' },
  ASHANTI: { ceremonyName:'Abadinto', ceremonyNameTranslation:'The Day Name Giving', welcomePhrase:'Akwaaba', welcomeLanguage:'Twi', namingProverb:'Yentua wo din ho ka biara', proverbOrigin:'We pay no debt for your name — Ashanti', namingRitual:'Every Ashanti child receives a day name based on the day of birth. The full name is given by the grandfather at the Abadinto feast.', elderTitle:'Okyeame' },
  ARABIC_NORTH: { ceremonyName:'Aqeeqah / السابع', ceremonyNameTranslation:'The Seventh Day Ceremony', welcomePhrase:'أهلاً وسهلاً', welcomeLanguage:'Arabic', namingProverb:'الاسم الحسن نعمة من الله', proverbOrigin:'A beautiful name is a blessing from God — Arab proverb', namingRitual:"On the seventh day, the head is shaved, a sacrifice is made, and the name is announced to the community at the mosque.", elderTitle:'Sheikh' },
  AMAZIGH: { ceremonyName:'Isem', ceremonyNameTranslation:'The Identity Giving', welcomePhrase:'Azul fellak', welcomeLanguage:'Tamazight', namingProverb:'Isem n yiwen d tamart-is', proverbOrigin:"A person's name is their identity — Amazigh", namingRitual:"The eldest grandmother of the family gives the name, chosen to honour the ancestor whose spirit is seen in the child.", elderTitle:'Amghar' },
  NUBIAN: { ceremonyName:'Ism Ceremony', ceremonyNameTranslation:'The Name Ceremony', welcomePhrase:'Ahlan wa sahlan', welcomeLanguage:'Nobiin', namingProverb:"Al ism 'ala al musamma", proverbOrigin:'The name belongs to the named — Nubian', namingRitual:'The elder reads from ancient Nubian ancestry records and selects a name that honours the river, the sun, and the lineage of the child.', elderTitle:'Agakor' },
  SWAHILI: { ceremonyName:'Sadaka ya Jina', ceremonyNameTranslation:'The Gift of the Name', welcomePhrase:'Karibu nyumbani', welcomeLanguage:'Swahili', namingProverb:'Jina jema ni bora kuliko mali', proverbOrigin:'A good name is better than wealth — Swahili', namingRitual:'On the seventh day an Aqiqah is held. The imam gives the name and the family feasts. The name must have meaning the child can grow into.', elderTitle:'Sheikh' },
  OROMO: { ceremonyName:'Maqaa Kenna', ceremonyNameTranslation:'The Name Offering', welcomePhrase:'Baga nagaan dhuftan', welcomeLanguage:'Oromo', namingProverb:'Maqaan namaa seenaa isaa', proverbOrigin:"A person's name is their history — Oromo", namingRitual:'The Abba Gada elder reads the Gadaa calendar to determine the birth cycle, then gives a name aligned with that cycle.', elderTitle:'Abba Gadaa' },
  AMHARA: { ceremonyName:'Yesim Iqad / የስም ቀን', ceremonyNameTranslation:'The Name Day', welcomePhrase:'እንኳን ደህና መጣህ', welcomeLanguage:'Amharic', namingProverb:'ስም ከምንም ይበልጣል', proverbOrigin:'A name surpasses everything — Amharic', namingRitual:"The priest gives the child a saint's name at baptism. The family holds a feast. The name day is celebrated annually as a second birthday.", elderTitle:'Qes' },
  SOMALI: { ceremonyName:'Saqiiqo', ceremonyNameTranslation:'The Seventh Day', welcomePhrase:'Soo dhawoow gurigayaga', welcomeLanguage:'Somali', namingProverb:'Magaca waa iftiin', proverbOrigin:'A name is light — Somali', namingRitual:"On the seventh day the child is named. The father announces the name three times. A goat is slaughtered and distributed to neighbours.", elderTitle:'Wadaad' },
  KIKUYU: { ceremonyName:'Gucokia Riitwa', ceremonyNameTranslation:'The Return of the Name', welcomePhrase:'Nĩwega gũkũ', welcomeLanguage:'Kikuyu', namingProverb:'Riitwa nĩ mwĩrĩ wa mũndũ', proverbOrigin:'A name is the body of a person — Kikuyu', namingRitual:"The child is named after a grandparent, bringing the ancestor's spirit back. The naming connects the living to the dead across generations.", elderTitle:'Mzee' },
  LUO: { ceremonyName:'Nying Keto', ceremonyNameTranslation:'The Placing of the Name', welcomePhrase:'Oriti', welcomeLanguage:'Dholuo', namingProverb:'Nying en riem mar dhano', proverbOrigin:'A name is the blood of a person — Luo', namingRitual:'The name reflects the circumstances of birth — time of day, season, events. A child born during rain is named differently than one born at harvest.', elderTitle:'Jaodong' },
  LUGANDA: { ceremonyName:'Okutaasa Omwana', ceremonyNameTranslation:'The Introduction of the Child', welcomePhrase:'Tukusanyukidde', welcomeLanguage:'Luganda', namingProverb:'Erinnya erirungi liruta amaanyi', proverbOrigin:'A good name surpasses strength — Luganda', namingRitual:"The paternal grandmother names the child. The clan name connects the child to the ancestral lineage that predates living memory.", elderTitle:'Jjajja' },
  MAASAI: { ceremonyName:'Enkiama', ceremonyNameTranslation:'The Naming Ceremony', welcomePhrase:'Sopa', welcomeLanguage:'Maa', namingProverb:'Oltau nteresho openy enkarna', proverbOrigin:'A good name opens the kraal gate — Maasai', namingRitual:"The father shaves the child's head on the naming day. The elder gives a name that reflects a great event or ancestor seen in the child's face.", elderTitle:'Laibon' },
  LINGALA: { ceremonyName:'Kopesa Nkombo', ceremonyNameTranslation:'The Giving of the Identity', welcomePhrase:'Boyei bolamu', welcomeLanguage:'Lingala', namingProverb:'Nkombo malamu ezali eloko ya ntalo mingi', proverbOrigin:'A good name is a precious thing — Lingala', namingRitual:"The family elder gives a name that carries the spirit of the most honoured ancestor visible in the child's features or behaviour.", elderTitle:'Nkulutu' },
  ZULU: { ceremonyName:'Umcimbi Wokuqanjwa', ceremonyNameTranslation:'The Naming Ceremony', welcomePhrase:'Sawubona', welcomeLanguage:'Zulu', namingProverb:'Igama elihle lingcono kunenotho', proverbOrigin:'A good name is better than wealth — Zulu', namingRitual:'The isangoma divines the name by communicating with the ancestors. The name reveals which ancestor has returned through the child.', elderTitle:'Isangoma' },
  XHOSA: { ceremonyName:'Ukuhlanjwa', ceremonyNameTranslation:'The Cleansing Ceremony', welcomePhrase:'Wamkelekile', welcomeLanguage:'Xhosa', namingProverb:'Igama elihle ligcina umntu', proverbOrigin:'A good name preserves a person — Xhosa', namingRitual:'The child is cleansed with water from a sacred river. The ancestors are asked to reveal the name through a dream to the eldest family member.', elderTitle:'Umkhwetha' },
  SOTHO: { ceremonyName:'Ketso ya Lebitso', ceremonyNameTranslation:'The Act of Naming', welcomePhrase:'Rea leboga', welcomeLanguage:'Sesotho', namingProverb:'Lebitso le letlhano le feta leruo', proverbOrigin:'A good name surpasses wealth — Sotho', namingRitual:"The grandmother on the father's side is first to name the child. The name is announced to the community at a feast where the child is presented.", elderTitle:'Moruti' },
  SHONA: { ceremonyName:'Kutumidza Zita', ceremonyNameTranslation:'The Sending of the Name', welcomePhrase:'Mauya', welcomeLanguage:'Shona', namingProverb:'Zita rakanaka rinopfuura fuma', proverbOrigin:'A good name surpasses wealth — Shona', namingRitual:'The spirit medium (svikiro) communicates with the family ancestor to confirm which spirit has returned, and the name reflects that ancestor.', elderTitle:'Svikiro' },
}

// ── Default Pan-African Ubuntu fallback ──────────────────────
export const UBUNTU_CEREMONY: CeremonyConfig = {
  ceremonyName: 'Ubuntu Ukubekwa Kwegama',
  ceremonyNameTranslation: 'The Pan-African Naming',
  welcomePhrase: 'Akwaaba · Karibu · Sawubona · Bienvenue',
  welcomeLanguage: 'Pan-African',
  namingProverb: 'Umuntu ngumuntu ngabantu',
  proverbOrigin: 'A person is a person through other people — Ubuntu (Pan-African)',
  namingRitual: 'You are named today before all 54 nations of the Motherland. Your name is heard from Cairo to Cape Town, from Dakar to Djibouti. The ancestors of all Africa bear witness.',
  elderTitle: 'Elder of the Motherland',
}

// ── Heritage group ID → CEREMONY_CONFIG key ──────────────────
// Maps the IDs used in HERITAGE_GROUPS (ceremony page) to keys in CEREMONY_CONFIG.
// Heritage IDs that don't have a direct uppercase match need explicit aliases.
const HERITAGE_ALIAS: Record<string, string> = {
  hausa_fulani: 'HAUSA',
  berber:       'AMAZIGH',
  arabic:       'ARABIC_NORTH',
  ndebele:      'SHONA',      // closest Southern African match
  hutu_tutsi:   'LINGALA',   // Great Lakes → Central Africa
  mixed:        '__UBUNTU__',
  diaspora:     '__UBUNTU__',
}

export function getCeremonyConfig(heritageGroupId: string): CeremonyConfig {
  if (!heritageGroupId) return UBUNTU_CEREMONY
  const key = HERITAGE_ALIAS[heritageGroupId] ?? heritageGroupId.toUpperCase()
  if (key === '__UBUNTU__') return UBUNTU_CEREMONY
  return CEREMONY_CONFIG[key] ?? UBUNTU_CEREMONY
}
