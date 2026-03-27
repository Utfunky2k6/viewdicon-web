/**
 * African Languages Registry
 * Comprehensive catalog of languages spoken across all 54 African nations.
 *
 * Sources: Ethnologue, UNESCO Atlas of the World's Languages in Danger,
 * ISO 639-1/639-3 language codes, national census data.
 *
 * Speaker counts are approximate (millions) and include L1 + L2 speakers
 * where data is available.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AfricanLanguage {
  /** ISO 639-1 (2-letter) or ISO 639-3 (3-letter) code */
  code: string
  /** English name */
  name: string
  /** Name in the language itself */
  nativeName: string
  /** ISO 3166-1 alpha-2 country codes where the language is spoken */
  countries: string[]
  /** Approximate number of speakers in millions (L1 + L2) */
  speakers: number
  /** Language family / branch */
  family: string
  /** Primary writing script */
  script: string
}

// ---------------------------------------------------------------------------
// AFRICAN_LANGUAGES — master list (175+ entries)
// ---------------------------------------------------------------------------

export const AFRICAN_LANGUAGES: AfricanLanguage[] = [

  // =========================================================================
  // WEST AFRICA — NIGERIA (NG)
  // =========================================================================
  {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Hausa',
    countries: ['NG', 'NE', 'GH', 'CM', 'TD', 'BF'],
    speakers: 80,
    family: 'Afro-Asiatic / Chadic',
    script: 'Latin / Ajami (Arabic)',
  },
  {
    code: 'yo',
    name: 'Yoruba',
    nativeName: 'Yoruba',
    countries: ['NG', 'BJ', 'TG'],
    speakers: 47,
    family: 'Niger-Congo / Atlantic-Congo / Volta-Niger',
    script: 'Latin',
  },
  {
    code: 'ig',
    name: 'Igbo',
    nativeName: 'Igbo',
    countries: ['NG', 'GQ'],
    speakers: 45,
    family: 'Niger-Congo / Atlantic-Congo / Volta-Niger',
    script: 'Latin',
  },
  {
    code: 'ff',
    name: 'Fula / Fulfulde',
    nativeName: 'Fulfulde',
    countries: ['NG', 'GN', 'SN', 'ML', 'NE', 'BF', 'CM', 'GM', 'GW', 'MR', 'SL', 'TD', 'CF', 'GH'],
    speakers: 40,
    family: 'Niger-Congo / Atlantic',
    script: 'Latin / Adlam',
  },
  {
    code: 'kr',
    name: 'Kanuri',
    nativeName: 'Kanuri',
    countries: ['NG', 'NE', 'TD', 'CM'],
    speakers: 10,
    family: 'Nilo-Saharan / Saharan',
    script: 'Latin / Ajami (Arabic)',
  },
  {
    code: 'tiv',
    name: 'Tiv',
    nativeName: 'Tiv',
    countries: ['NG'],
    speakers: 7,
    family: 'Niger-Congo / Benue-Congo / Tivoid',
    script: 'Latin',
  },
  {
    code: 'bin',
    name: 'Edo / Bini',
    nativeName: 'Edo',
    countries: ['NG'],
    speakers: 5,
    family: 'Niger-Congo / Atlantic-Congo / Volta-Niger / Edoid',
    script: 'Latin',
  },
  {
    code: 'efi',
    name: 'Efik',
    nativeName: 'Efik',
    countries: ['NG'],
    speakers: 3.5,
    family: 'Niger-Congo / Benue-Congo / Cross River',
    script: 'Latin',
  },
  {
    code: 'ibb',
    name: 'Ibibio',
    nativeName: 'Ibibio',
    countries: ['NG'],
    speakers: 4.5,
    family: 'Niger-Congo / Benue-Congo / Cross River',
    script: 'Latin',
  },
  {
    code: 'ijc',
    name: 'Izon / Ijaw',
    nativeName: 'Izon',
    countries: ['NG'],
    speakers: 2,
    family: 'Niger-Congo / Ijoid',
    script: 'Latin',
  },
  {
    code: 'nup',
    name: 'Nupe',
    nativeName: 'Nupe',
    countries: ['NG'],
    speakers: 3.5,
    family: 'Niger-Congo / Atlantic-Congo / Volta-Niger / Nupoid',
    script: 'Latin',
  },
  {
    code: 'urh',
    name: 'Urhobo',
    nativeName: 'Urhobo',
    countries: ['NG'],
    speakers: 2,
    family: 'Niger-Congo / Atlantic-Congo / Volta-Niger / Edoid',
    script: 'Latin',
  },
  {
    code: 'igl',
    name: 'Igala',
    nativeName: 'Igala',
    countries: ['NG'],
    speakers: 2,
    family: 'Niger-Congo / Atlantic-Congo / Volta-Niger / Yoruboid',
    script: 'Latin',
  },
  {
    code: 'pcm',
    name: 'Nigerian Pidgin',
    nativeName: 'Naija',
    countries: ['NG', 'CM', 'GH'],
    speakers: 100,
    family: 'English Creole / Atlantic',
    script: 'Latin',
  },
  {
    code: 'kcg',
    name: 'Tyap',
    nativeName: 'Tyap',
    countries: ['NG'],
    speakers: 0.5,
    family: 'Niger-Congo / Benue-Congo / Plateau',
    script: 'Latin',
  },
  {
    code: 'ann',
    name: 'Obolo',
    nativeName: 'Obolo',
    countries: ['NG'],
    speakers: 1,
    family: 'Niger-Congo / Benue-Congo / Cross River',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — GHANA (GH)
  // =========================================================================
  {
    code: 'ak',
    name: 'Akan',
    nativeName: 'Akan',
    countries: ['GH', 'CI'],
    speakers: 22,
    family: 'Niger-Congo / Atlantic-Congo / Kwa',
    script: 'Latin',
  },
  {
    code: 'ee',
    name: 'Ewe',
    nativeName: 'Eegbe',
    countries: ['GH', 'TG', 'BJ'],
    speakers: 7,
    family: 'Niger-Congo / Atlantic-Congo / Kwa / Gbe',
    script: 'Latin',
  },
  {
    code: 'gaa',
    name: 'Ga',
    nativeName: 'Ga',
    countries: ['GH'],
    speakers: 3,
    family: 'Niger-Congo / Atlantic-Congo / Kwa / Ga-Dangme',
    script: 'Latin',
  },
  {
    code: 'dag',
    name: 'Dagbani',
    nativeName: 'Dagbanli',
    countries: ['GH'],
    speakers: 3.2,
    family: 'Niger-Congo / Atlantic-Congo / Gur / Oti-Volta',
    script: 'Latin',
  },
  {
    code: 'fat',
    name: 'Fante',
    nativeName: 'Mfantse',
    countries: ['GH'],
    speakers: 2.5,
    family: 'Niger-Congo / Atlantic-Congo / Kwa',
    script: 'Latin',
  },
  {
    code: 'gur',
    name: 'Farefare',
    nativeName: 'Farefare',
    countries: ['GH', 'BF'],
    speakers: 1.2,
    family: 'Niger-Congo / Atlantic-Congo / Gur / Oti-Volta',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — SENEGAL (SN) / GAMBIA (GM)
  // =========================================================================
  {
    code: 'wo',
    name: 'Wolof',
    nativeName: 'Wolof',
    countries: ['SN', 'GM', 'MR'],
    speakers: 12,
    family: 'Niger-Congo / Atlantic',
    script: 'Latin / Wolofal (Arabic)',
  },
  {
    code: 'srr',
    name: 'Serer',
    nativeName: 'Seereer',
    countries: ['SN', 'GM'],
    speakers: 2,
    family: 'Niger-Congo / Atlantic',
    script: 'Latin',
  },
  {
    code: 'snk',
    name: 'Soninke',
    nativeName: 'Soninkanxanne',
    countries: ['SN', 'ML', 'MR', 'GM', 'GW'],
    speakers: 2.1,
    family: 'Niger-Congo / Mande / Western',
    script: 'Latin',
  },
  {
    code: 'dyo',
    name: 'Jola-Fonyi',
    nativeName: 'Joola',
    countries: ['SN', 'GM', 'GW'],
    speakers: 0.9,
    family: 'Niger-Congo / Atlantic / Bak',
    script: 'Latin',
  },
  {
    code: 'mnk',
    name: 'Mandinka',
    nativeName: 'Mandinka',
    countries: ['SN', 'GM', 'GW', 'GN', 'ML'],
    speakers: 7,
    family: 'Niger-Congo / Mande / Western / Manding',
    script: 'Latin / N\'Ko',
  },

  // =========================================================================
  // WEST AFRICA — MALI (ML)
  // =========================================================================
  {
    code: 'bm',
    name: 'Bambara',
    nativeName: 'Bamanankan',
    countries: ['ML', 'BF', 'CI', 'SN', 'GM'],
    speakers: 15,
    family: 'Niger-Congo / Mande / Western / Manding',
    script: 'Latin / N\'Ko',
  },
  {
    code: 'son',
    name: 'Songhai',
    nativeName: 'Songhoy',
    countries: ['ML', 'NE', 'BF'],
    speakers: 5,
    family: 'Nilo-Saharan / Songhai',
    script: 'Latin',
  },
  {
    code: 'taq',
    name: 'Tamasheq',
    nativeName: 'Tamasheq',
    countries: ['ML', 'NE', 'BF', 'DZ', 'LY'],
    speakers: 1.5,
    family: 'Afro-Asiatic / Berber / Tuareg',
    script: 'Tifinagh / Latin',
  },
  {
    code: 'dtm',
    name: 'Dogon (Toro So)',
    nativeName: 'Dogon',
    countries: ['ML', 'BF'],
    speakers: 0.8,
    family: 'Niger-Congo / Dogon',
    script: 'Latin',
  },
  {
    code: 'bze',
    name: 'Bozo',
    nativeName: 'Bozo',
    countries: ['ML'],
    speakers: 0.4,
    family: 'Niger-Congo / Mande / Western',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — BURKINA FASO (BF)
  // =========================================================================
  {
    code: 'mos',
    name: 'Moore',
    nativeName: 'Moore',
    countries: ['BF', 'GH', 'TG'],
    speakers: 8,
    family: 'Niger-Congo / Atlantic-Congo / Gur / Oti-Volta',
    script: 'Latin',
  },
  {
    code: 'dyu',
    name: 'Dyula / Jula',
    nativeName: 'Julakan',
    countries: ['BF', 'CI', 'ML', 'GH'],
    speakers: 4,
    family: 'Niger-Congo / Mande / Western / Manding',
    script: 'Latin / N\'Ko',
  },
  {
    code: 'gux',
    name: 'Gourmanchema',
    nativeName: 'Gulimancema',
    countries: ['BF', 'TG', 'NE', 'BJ'],
    speakers: 1.5,
    family: 'Niger-Congo / Atlantic-Congo / Gur / Oti-Volta',
    script: 'Latin',
  },
  {
    code: 'bib',
    name: 'Bissa',
    nativeName: 'Bisa',
    countries: ['BF', 'GH'],
    speakers: 0.7,
    family: 'Niger-Congo / Mande / Eastern',
    script: 'Latin',
  },
  {
    code: 'lob',
    name: 'Lobi',
    nativeName: 'Lobiri',
    countries: ['BF', 'CI'],
    speakers: 0.6,
    family: 'Niger-Congo / Atlantic-Congo / Gur',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — NIGER (NE)
  // =========================================================================
  {
    code: 'dje',
    name: 'Zarma',
    nativeName: 'Zarmaciine',
    countries: ['NE', 'NG', 'BJ'],
    speakers: 5,
    family: 'Nilo-Saharan / Songhai',
    script: 'Latin',
  },
  {
    code: 'tmh',
    name: 'Tamajaq',
    nativeName: 'Tamajaq',
    countries: ['NE', 'ML'],
    speakers: 0.8,
    family: 'Afro-Asiatic / Berber / Tuareg',
    script: 'Tifinagh / Latin',
  },
  {
    code: 'tub',
    name: 'Tubu / Tedaga',
    nativeName: 'Tubu',
    countries: ['NE', 'TD', 'LY'],
    speakers: 0.5,
    family: 'Nilo-Saharan / Saharan',
    script: 'Latin',
  },
  {
    code: 'gnn',
    name: 'Gurmana',
    nativeName: 'Gurmana',
    countries: ['NE'],
    speakers: 0.1,
    family: 'Niger-Congo / Atlantic-Congo / Gur',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — GUINEA (GN)
  // =========================================================================
  {
    code: 'sus',
    name: 'Susu',
    nativeName: 'Sosoxui',
    countries: ['GN', 'SL'],
    speakers: 2.5,
    family: 'Niger-Congo / Mande / Western',
    script: 'Latin',
  },
  {
    code: 'kpe',
    name: 'Kpelle',
    nativeName: 'Kpelle',
    countries: ['GN', 'LR'],
    speakers: 1.3,
    family: 'Niger-Congo / Mande / Western / South-Western',
    script: 'Latin',
  },
  {
    code: 'kqs',
    name: 'Kissi',
    nativeName: 'Kissi',
    countries: ['GN', 'SL', 'LR'],
    speakers: 0.6,
    family: 'Niger-Congo / Atlantic',
    script: 'Latin',
  },
  {
    code: 'man',
    name: 'Malinke',
    nativeName: 'Maninkakan',
    countries: ['GN', 'ML', 'SN', 'CI'],
    speakers: 6,
    family: 'Niger-Congo / Mande / Western / Manding',
    script: 'Latin / N\'Ko',
  },

  // =========================================================================
  // WEST AFRICA — COTE D'IVOIRE (CI)
  // =========================================================================
  {
    code: 'bci',
    name: 'Baoule',
    nativeName: 'Baule',
    countries: ['CI'],
    speakers: 5,
    family: 'Niger-Congo / Atlantic-Congo / Kwa',
    script: 'Latin',
  },
  {
    code: 'bet',
    name: 'Bete',
    nativeName: 'Bete',
    countries: ['CI'],
    speakers: 1.5,
    family: 'Niger-Congo / Atlantic-Congo / Kru',
    script: 'Latin',
  },
  {
    code: 'sef',
    name: 'Senufo (Cebaara)',
    nativeName: 'Senari',
    countries: ['CI', 'ML', 'BF'],
    speakers: 3,
    family: 'Niger-Congo / Atlantic-Congo / Gur / Senufo',
    script: 'Latin',
  },
  {
    code: 'dnj',
    name: 'Dan / Yacouba',
    nativeName: 'Dan',
    countries: ['CI', 'LR'],
    speakers: 1.5,
    family: 'Niger-Congo / Mande / Eastern / Dan',
    script: 'Latin',
  },
  {
    code: 'any',
    name: 'Anyin / Agni',
    nativeName: 'Anyin',
    countries: ['CI', 'GH'],
    speakers: 1.2,
    family: 'Niger-Congo / Atlantic-Congo / Kwa',
    script: 'Latin',
  },
  {
    code: 'abi',
    name: 'Abidji',
    nativeName: 'Abidji',
    countries: ['CI'],
    speakers: 0.1,
    family: 'Niger-Congo / Atlantic-Congo / Kwa',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — BENIN (BJ)
  // =========================================================================
  {
    code: 'fon',
    name: 'Fon',
    nativeName: 'Fongbe',
    countries: ['BJ', 'TG'],
    speakers: 4.1,
    family: 'Niger-Congo / Atlantic-Congo / Kwa / Gbe',
    script: 'Latin',
  },
  {
    code: 'bba',
    name: 'Bariba',
    nativeName: 'Baatonum',
    countries: ['BJ', 'NG'],
    speakers: 1.2,
    family: 'Niger-Congo / Atlantic-Congo / Gur',
    script: 'Latin',
  },
  {
    code: 'ddn',
    name: 'Dendi',
    nativeName: 'Dendi',
    countries: ['BJ', 'NE'],
    speakers: 0.5,
    family: 'Nilo-Saharan / Songhai',
    script: 'Latin',
  },
  {
    code: 'ajg',
    name: 'Aja',
    nativeName: 'Ajagbe',
    countries: ['BJ', 'TG'],
    speakers: 0.6,
    family: 'Niger-Congo / Atlantic-Congo / Kwa / Gbe',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — TOGO (TG)
  // =========================================================================
  {
    code: 'kbp',
    name: 'Kabiye',
    nativeName: 'Kabiye',
    countries: ['TG', 'GH'],
    speakers: 1.2,
    family: 'Niger-Congo / Atlantic-Congo / Gur',
    script: 'Latin',
  },
  {
    code: 'kdh',
    name: 'Tem / Kotokoli',
    nativeName: 'Tem',
    countries: ['TG', 'GH', 'BJ'],
    speakers: 0.4,
    family: 'Niger-Congo / Atlantic-Congo / Gur',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — SIERRA LEONE (SL)
  // =========================================================================
  {
    code: 'men',
    name: 'Mende',
    nativeName: 'Mende',
    countries: ['SL'],
    speakers: 2.5,
    family: 'Niger-Congo / Mande / Western / South-Western',
    script: 'Latin / Mende Kikakui',
  },
  {
    code: 'tem',
    name: 'Temne',
    nativeName: 'Temne',
    countries: ['SL'],
    speakers: 2.7,
    family: 'Niger-Congo / Atlantic / Mel',
    script: 'Latin',
  },
  {
    code: 'kri',
    name: 'Krio',
    nativeName: 'Krio',
    countries: ['SL'],
    speakers: 4.5,
    family: 'English Creole / Atlantic',
    script: 'Latin',
  },
  {
    code: 'lia',
    name: 'Limba',
    nativeName: 'Limba',
    countries: ['SL', 'GN'],
    speakers: 0.5,
    family: 'Niger-Congo / Atlantic',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — LIBERIA (LR)
  // =========================================================================
  {
    code: 'bsq',
    name: 'Bassa (Liberia)',
    nativeName: 'Bassa',
    countries: ['LR'],
    speakers: 0.8,
    family: 'Niger-Congo / Atlantic-Congo / Kru',
    script: 'Latin / Bassa Vah',
  },
  {
    code: 'grb',
    name: 'Grebo',
    nativeName: 'Grebo',
    countries: ['LR', 'CI'],
    speakers: 0.5,
    family: 'Niger-Congo / Atlantic-Congo / Kru',
    script: 'Latin',
  },
  {
    code: 'vai',
    name: 'Vai',
    nativeName: 'Vai',
    countries: ['LR', 'SL'],
    speakers: 0.2,
    family: 'Niger-Congo / Mande / Western',
    script: 'Vai / Latin',
  },
  {
    code: 'mev',
    name: 'Mano',
    nativeName: 'Mano',
    countries: ['LR', 'GN'],
    speakers: 0.4,
    family: 'Niger-Congo / Mande / Eastern',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — MAURITANIA (MR)
  // =========================================================================
  {
    code: 'mey',
    name: 'Hassaniya Arabic',
    nativeName: 'Hassaniya',
    countries: ['MR', 'MA', 'SN'],
    speakers: 4.2,
    family: 'Afro-Asiatic / Semitic / Arabic',
    script: 'Arabic',
  },
  {
    code: 'zen',
    name: 'Zenaga',
    nativeName: 'Tudhungiyya',
    countries: ['MR'],
    speakers: 0.005,
    family: 'Afro-Asiatic / Berber',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — GUINEA-BISSAU (GW)
  // =========================================================================
  {
    code: 'pov',
    name: 'Guinea-Bissau Creole',
    nativeName: 'Kriol',
    countries: ['GW'],
    speakers: 0.6,
    family: 'Portuguese Creole / Upper Guinea',
    script: 'Latin',
  },
  {
    code: 'ble',
    name: 'Balanta',
    nativeName: 'Balanta',
    countries: ['GW', 'SN'],
    speakers: 0.5,
    family: 'Niger-Congo / Atlantic / Bak',
    script: 'Latin',
  },
  {
    code: 'mfv',
    name: 'Manjak',
    nativeName: 'Manjaku',
    countries: ['GW', 'SN'],
    speakers: 0.3,
    family: 'Niger-Congo / Atlantic / Bak',
    script: 'Latin',
  },
  {
    code: 'pbo',
    name: 'Papel',
    nativeName: 'Papel',
    countries: ['GW'],
    speakers: 0.15,
    family: 'Niger-Congo / Atlantic / Bak',
    script: 'Latin',
  },

  // =========================================================================
  // WEST AFRICA — CABO VERDE (CV)
  // =========================================================================
  {
    code: 'kea',
    name: 'Cape Verdean Creole',
    nativeName: 'Kabuverdianu',
    countries: ['CV'],
    speakers: 0.9,
    family: 'Portuguese Creole / Upper Guinea',
    script: 'Latin',
  },

  // =========================================================================
  // EAST AFRICA — KENYA (KE)
  // =========================================================================
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    countries: ['KE', 'TZ', 'UG', 'CD', 'RW', 'BI', 'MZ', 'SO', 'KM'],
    speakers: 200,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'ki',
    name: 'Kikuyu',
    nativeName: 'Gikuyu',
    countries: ['KE'],
    speakers: 8.1,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'luo',
    name: 'Dholuo',
    nativeName: 'Dholuo',
    countries: ['KE', 'TZ'],
    speakers: 6,
    family: 'Nilo-Saharan / Nilotic / Western',
    script: 'Latin',
  },
  {
    code: 'kam',
    name: 'Kamba',
    nativeName: 'Kikamba',
    countries: ['KE'],
    speakers: 4.7,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'kln',
    name: 'Kalenjin',
    nativeName: 'Kalenjin',
    countries: ['KE'],
    speakers: 5,
    family: 'Nilo-Saharan / Nilotic / Southern',
    script: 'Latin',
  },
  {
    code: 'luy',
    name: 'Luhya',
    nativeName: 'Luhya',
    countries: ['KE'],
    speakers: 6.8,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'mer',
    name: 'Meru',
    nativeName: 'Kimeru',
    countries: ['KE'],
    speakers: 2.5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'mas',
    name: 'Maasai',
    nativeName: 'Maa',
    countries: ['KE', 'TZ'],
    speakers: 1.8,
    family: 'Nilo-Saharan / Nilotic / Eastern',
    script: 'Latin',
  },

  // =========================================================================
  // EAST AFRICA — TANZANIA (TZ)
  // =========================================================================
  {
    code: 'suk',
    name: 'Sukuma',
    nativeName: 'Kisukuma',
    countries: ['TZ'],
    speakers: 8.1,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'vun',
    name: 'Chagga',
    nativeName: 'Kivunjo',
    countries: ['TZ'],
    speakers: 1.2,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'hay',
    name: 'Haya',
    nativeName: 'Kihaya',
    countries: ['TZ'],
    speakers: 2,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'nym',
    name: 'Nyamwezi',
    nativeName: 'Kinyamwezi',
    countries: ['TZ'],
    speakers: 1.5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'kde',
    name: 'Makonde',
    nativeName: 'Shimakonde',
    countries: ['TZ', 'MZ'],
    speakers: 1.4,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'heh',
    name: 'Hehe',
    nativeName: 'Kihehe',
    countries: ['TZ'],
    speakers: 1,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'sad',
    name: 'Sandawe',
    nativeName: 'Sandawe',
    countries: ['TZ'],
    speakers: 0.06,
    family: 'Khoisan / Sandawe (isolate)',
    script: 'Latin',
  },
  {
    code: 'hts',
    name: 'Hadza',
    nativeName: 'Hadzane',
    countries: ['TZ'],
    speakers: 0.001,
    family: 'Khoisan / Hadza (isolate)',
    script: 'Latin',
  },

  // =========================================================================
  // EAST AFRICA — UGANDA (UG)
  // =========================================================================
  {
    code: 'lg',
    name: 'Luganda',
    nativeName: 'Luganda',
    countries: ['UG'],
    speakers: 11,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'ach',
    name: 'Acholi',
    nativeName: 'Acholi',
    countries: ['UG', 'SS'],
    speakers: 2,
    family: 'Nilo-Saharan / Nilotic / Western',
    script: 'Latin',
  },
  {
    code: 'laj',
    name: 'Lango',
    nativeName: 'Lango',
    countries: ['UG'],
    speakers: 2.1,
    family: 'Nilo-Saharan / Nilotic / Western',
    script: 'Latin',
  },
  {
    code: 'nyn',
    name: 'Runyankole',
    nativeName: 'Runyankole',
    countries: ['UG'],
    speakers: 3.4,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'xog',
    name: 'Lusoga',
    nativeName: 'Lusoga',
    countries: ['UG'],
    speakers: 3.1,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'teo',
    name: 'Ateso',
    nativeName: 'Ateso',
    countries: ['UG', 'KE'],
    speakers: 2.4,
    family: 'Nilo-Saharan / Nilotic / Eastern',
    script: 'Latin',
  },
  {
    code: 'lgg',
    name: 'Lugbara',
    nativeName: 'Lugbara',
    countries: ['UG', 'CD'],
    speakers: 2.2,
    family: 'Nilo-Saharan / Central Sudanic',
    script: 'Latin',
  },

  // =========================================================================
  // EAST AFRICA — RWANDA (RW) / BURUNDI (BI)
  // =========================================================================
  {
    code: 'rw',
    name: 'Kinyarwanda',
    nativeName: 'Ikinyarwanda',
    countries: ['RW', 'UG', 'CD'],
    speakers: 13,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'rn',
    name: 'Kirundi',
    nativeName: 'Ikirundi',
    countries: ['BI', 'RW', 'UG'],
    speakers: 12,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // EAST AFRICA — SOUTH SUDAN (SS)
  // =========================================================================
  {
    code: 'din',
    name: 'Dinka',
    nativeName: 'Thuongjang',
    countries: ['SS'],
    speakers: 4.4,
    family: 'Nilo-Saharan / Nilotic / Western',
    script: 'Latin',
  },
  {
    code: 'nus',
    name: 'Nuer',
    nativeName: 'Naath',
    countries: ['SS', 'ET'],
    speakers: 2.3,
    family: 'Nilo-Saharan / Nilotic / Western',
    script: 'Latin',
  },
  {
    code: 'bfa',
    name: 'Bari',
    nativeName: 'Bari',
    countries: ['SS'],
    speakers: 0.8,
    family: 'Nilo-Saharan / Nilotic / Eastern',
    script: 'Latin',
  },
  {
    code: 'zne',
    name: 'Zande',
    nativeName: 'Pazande',
    countries: ['SS', 'CD', 'CF'],
    speakers: 1.5,
    family: 'Niger-Congo / Ubangian',
    script: 'Latin',
  },
  {
    code: 'shk',
    name: 'Shilluk',
    nativeName: 'Dhocolo',
    countries: ['SS'],
    speakers: 0.35,
    family: 'Nilo-Saharan / Nilotic / Western',
    script: 'Latin',
  },

  // =========================================================================
  // HORN OF AFRICA — SOMALIA (SO) / DJIBOUTI (DJ)
  // =========================================================================
  {
    code: 'so',
    name: 'Somali',
    nativeName: 'Af Soomaali',
    countries: ['SO', 'ET', 'DJ', 'KE'],
    speakers: 22,
    family: 'Afro-Asiatic / Cushitic / Lowland East',
    script: 'Latin (Osmanya historic)',
  },
  {
    code: 'ymm',
    name: 'Maay',
    nativeName: 'Af Maay',
    countries: ['SO'],
    speakers: 2,
    family: 'Afro-Asiatic / Cushitic / Lowland East',
    script: 'Latin',
  },
  {
    code: 'aa',
    name: 'Afar',
    nativeName: 'Qafar af',
    countries: ['DJ', 'ER', 'ET'],
    speakers: 2,
    family: 'Afro-Asiatic / Cushitic / Lowland East',
    script: 'Latin',
  },

  // =========================================================================
  // HORN OF AFRICA — ERITREA (ER)
  // =========================================================================
  {
    code: 'ti',
    name: 'Tigrinya',
    nativeName: 'Tigrinya',
    countries: ['ER', 'ET'],
    speakers: 9.8,
    family: 'Afro-Asiatic / Semitic / Ethiopic',
    script: 'Ethiopic (Ge\'ez)',
  },
  {
    code: 'tig',
    name: 'Tigre',
    nativeName: 'Tigre',
    countries: ['ER'],
    speakers: 1.1,
    family: 'Afro-Asiatic / Semitic / Ethiopic',
    script: 'Ethiopic (Ge\'ez)',
  },
  {
    code: 'ssy',
    name: 'Saho',
    nativeName: 'Saho',
    countries: ['ER'],
    speakers: 0.25,
    family: 'Afro-Asiatic / Cushitic / Lowland East',
    script: 'Latin',
  },
  {
    code: 'byn',
    name: 'Bilen',
    nativeName: 'Bilen',
    countries: ['ER'],
    speakers: 0.1,
    family: 'Afro-Asiatic / Cushitic / Central',
    script: 'Ethiopic (Ge\'ez)',
  },
  {
    code: 'kun',
    name: 'Kunama',
    nativeName: 'Kunama',
    countries: ['ER', 'ET'],
    speakers: 0.25,
    family: 'Nilo-Saharan / Kunama',
    script: 'Latin',
  },
  {
    code: 'nrb',
    name: 'Nara',
    nativeName: 'Nara',
    countries: ['ER'],
    speakers: 0.065,
    family: 'Nilo-Saharan / Eastern Sudanic',
    script: 'Latin',
  },

  // =========================================================================
  // HORN OF AFRICA — ETHIOPIA (ET)
  // =========================================================================
  {
    code: 'am',
    name: 'Amharic',
    nativeName: 'Amaregna',
    countries: ['ET'],
    speakers: 57,
    family: 'Afro-Asiatic / Semitic / Ethiopic',
    script: 'Ethiopic (Ge\'ez)',
  },
  {
    code: 'om',
    name: 'Oromo',
    nativeName: 'Afaan Oromoo',
    countries: ['ET', 'KE'],
    speakers: 45,
    family: 'Afro-Asiatic / Cushitic / Lowland East',
    script: 'Latin (Qubee)',
  },
  {
    code: 'sid',
    name: 'Sidamo',
    nativeName: 'Sidaamu Afoo',
    countries: ['ET'],
    speakers: 4,
    family: 'Afro-Asiatic / Cushitic / Highland East',
    script: 'Latin / Ethiopic',
  },
  {
    code: 'wal',
    name: 'Wolaytta',
    nativeName: 'Wolaytta',
    countries: ['ET'],
    speakers: 2.4,
    family: 'Afro-Asiatic / Omotic / North',
    script: 'Latin / Ethiopic',
  },
  {
    code: 'sgw',
    name: 'Sebat Bet Gurage',
    nativeName: 'Guragegna',
    countries: ['ET'],
    speakers: 1.9,
    family: 'Afro-Asiatic / Semitic / Ethiopic',
    script: 'Ethiopic (Ge\'ez)',
  },
  {
    code: 'hdy',
    name: 'Hadiyya',
    nativeName: 'Hadiyyisa',
    countries: ['ET'],
    speakers: 1.7,
    family: 'Afro-Asiatic / Cushitic / Highland East',
    script: 'Latin',
  },
  {
    code: 'gez',
    name: 'Ge\'ez',
    nativeName: 'Ge\'ez',
    countries: ['ET', 'ER'],
    speakers: 0.01,
    family: 'Afro-Asiatic / Semitic / Ethiopic',
    script: 'Ethiopic (Ge\'ez)',
  },
  {
    code: 'kcf',
    name: 'Konso',
    nativeName: 'Af Konso',
    countries: ['ET'],
    speakers: 0.3,
    family: 'Afro-Asiatic / Cushitic / Lowland East',
    script: 'Latin',
  },
  {
    code: 'gmo',
    name: 'Gamo',
    nativeName: 'Gamotso',
    countries: ['ET'],
    speakers: 1.5,
    family: 'Afro-Asiatic / Omotic / North',
    script: 'Ethiopic (Ge\'ez)',
  },

  // =========================================================================
  // NORTH AFRICA — SUDAN (SD)
  // =========================================================================
  {
    code: 'fvr',
    name: 'Fur',
    nativeName: 'Fur',
    countries: ['SD', 'TD'],
    speakers: 0.9,
    family: 'Nilo-Saharan / Fur',
    script: 'Latin / Arabic',
  },
  {
    code: 'bej',
    name: 'Beja',
    nativeName: 'Bedawiyet',
    countries: ['SD', 'ER', 'EG'],
    speakers: 2.5,
    family: 'Afro-Asiatic / Cushitic / North',
    script: 'Latin / Arabic',
  },
  {
    code: 'fia',
    name: 'Nobiin',
    nativeName: 'Nobiin',
    countries: ['SD', 'EG'],
    speakers: 0.6,
    family: 'Nilo-Saharan / Eastern Sudanic / Nubian',
    script: 'Arabic / Latin',
  },
  {
    code: 'zag',
    name: 'Zaghawa',
    nativeName: 'Beria',
    countries: ['SD', 'TD'],
    speakers: 0.3,
    family: 'Nilo-Saharan / Saharan',
    script: 'Latin / Arabic',
  },
  {
    code: 'mls',
    name: 'Masalit',
    nativeName: 'Masalit',
    countries: ['SD', 'TD'],
    speakers: 0.35,
    family: 'Nilo-Saharan / Maban',
    script: 'Arabic / Latin',
  },

  // =========================================================================
  // NORTH AFRICA — EGYPT (EG)
  // =========================================================================
  {
    code: 'arz',
    name: 'Egyptian Arabic',
    nativeName: 'Masri',
    countries: ['EG'],
    speakers: 100,
    family: 'Afro-Asiatic / Semitic / Arabic',
    script: 'Arabic',
  },
  {
    code: 'cop',
    name: 'Coptic',
    nativeName: 'Remenkimi',
    countries: ['EG'],
    speakers: 0.001,
    family: 'Afro-Asiatic / Egyptian (liturgical)',
    script: 'Coptic',
  },
  {
    code: 'siz',
    name: 'Siwi',
    nativeName: 'Jlan n Isiwan',
    countries: ['EG'],
    speakers: 0.03,
    family: 'Afro-Asiatic / Berber / Eastern',
    script: 'Arabic',
  },

  // =========================================================================
  // NORTH AFRICA — LIBYA (LY)
  // =========================================================================
  {
    code: 'jbn',
    name: 'Nafusi',
    nativeName: 'Tanfusit',
    countries: ['LY'],
    speakers: 0.3,
    family: 'Afro-Asiatic / Berber / Eastern',
    script: 'Tifinagh / Latin / Arabic',
  },

  // =========================================================================
  // NORTH AFRICA — TUNISIA (TN)
  // =========================================================================
  {
    code: 'aeb',
    name: 'Tunisian Arabic',
    nativeName: 'Tounsi',
    countries: ['TN'],
    speakers: 12,
    family: 'Afro-Asiatic / Semitic / Arabic',
    script: 'Arabic',
  },

  // =========================================================================
  // NORTH AFRICA — ALGERIA (DZ)
  // =========================================================================
  {
    code: 'kab',
    name: 'Kabyle',
    nativeName: 'Taqbaylit',
    countries: ['DZ'],
    speakers: 6,
    family: 'Afro-Asiatic / Berber / Northern',
    script: 'Tifinagh / Latin',
  },
  {
    code: 'shi',
    name: 'Tachelhit',
    nativeName: 'Tashelhiyt',
    countries: ['MA', 'DZ'],
    speakers: 4,
    family: 'Afro-Asiatic / Berber / Northern',
    script: 'Tifinagh / Latin',
  },
  {
    code: 'tzm',
    name: 'Central Atlas Tamazight',
    nativeName: 'Tamazight',
    countries: ['MA', 'DZ'],
    speakers: 5,
    family: 'Afro-Asiatic / Berber / Northern',
    script: 'Tifinagh / Latin / Arabic',
  },
  {
    code: 'mzb',
    name: 'Mozabite',
    nativeName: 'Tumzabt',
    countries: ['DZ'],
    speakers: 0.2,
    family: 'Afro-Asiatic / Berber / Northern / Zenati',
    script: 'Tifinagh / Arabic',
  },
  {
    code: 'arq',
    name: 'Algerian Arabic',
    nativeName: 'Darja',
    countries: ['DZ'],
    speakers: 40,
    family: 'Afro-Asiatic / Semitic / Arabic',
    script: 'Arabic',
  },

  // =========================================================================
  // NORTH AFRICA — MOROCCO (MA)
  // =========================================================================
  {
    code: 'rif',
    name: 'Tarifit',
    nativeName: 'Tarifit',
    countries: ['MA'],
    speakers: 4,
    family: 'Afro-Asiatic / Berber / Northern / Zenati',
    script: 'Tifinagh / Latin',
  },
  {
    code: 'ary',
    name: 'Moroccan Arabic',
    nativeName: 'Darija',
    countries: ['MA'],
    speakers: 33,
    family: 'Afro-Asiatic / Semitic / Arabic',
    script: 'Arabic',
  },

  // =========================================================================
  // CENTRAL AFRICA — DR CONGO (CD)
  // =========================================================================
  {
    code: 'ln',
    name: 'Lingala',
    nativeName: 'Lingala',
    countries: ['CD', 'CG', 'CF'],
    speakers: 25,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'kg',
    name: 'Kikongo',
    nativeName: 'Kikongo',
    countries: ['CD', 'CG', 'AO'],
    speakers: 7.6,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'lu',
    name: 'Tshiluba',
    nativeName: 'Tshiluba',
    countries: ['CD'],
    speakers: 6.3,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'lol',
    name: 'Mongo',
    nativeName: 'Nkundo',
    countries: ['CD'],
    speakers: 5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'tll',
    name: 'Tetela',
    nativeName: 'Otetela',
    countries: ['CD'],
    speakers: 0.8,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // CENTRAL AFRICA — REPUBLIC OF CONGO (CG)
  // =========================================================================
  {
    code: 'ktu',
    name: 'Kituba',
    nativeName: 'Kituba',
    countries: ['CG', 'CD'],
    speakers: 5.4,
    family: 'Niger-Congo / Bantu (Creole)',
    script: 'Latin',
  },
  {
    code: 'teg',
    name: 'Teke',
    nativeName: 'Teke',
    countries: ['CG', 'CD', 'GA'],
    speakers: 0.5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'mdw',
    name: 'Mbosi',
    nativeName: 'Mbosi',
    countries: ['CG'],
    speakers: 0.2,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // CENTRAL AFRICA — CAMEROON (CM)
  // =========================================================================
  {
    code: 'ewo',
    name: 'Ewondo',
    nativeName: 'Ewondo',
    countries: ['CM'],
    speakers: 1.2,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'dua',
    name: 'Duala',
    nativeName: 'Duala',
    countries: ['CM'],
    speakers: 0.9,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'bbj',
    name: 'Ghomala',
    nativeName: 'Ghomala\'',
    countries: ['CM'],
    speakers: 1,
    family: 'Niger-Congo / Benue-Congo / Grassfields / Bamileke',
    script: 'Latin',
  },
  {
    code: 'bas',
    name: 'Basaa',
    nativeName: 'Basaa',
    countries: ['CM'],
    speakers: 0.8,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'wes',
    name: 'Cameroon Pidgin English',
    nativeName: 'Wes Cos',
    countries: ['CM'],
    speakers: 6,
    family: 'English Creole / Atlantic',
    script: 'Latin',
  },
  {
    code: 'bum',
    name: 'Bulu',
    nativeName: 'Bulu',
    countries: ['CM'],
    speakers: 0.9,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'mcp',
    name: 'Medumba',
    nativeName: 'Medumba',
    countries: ['CM'],
    speakers: 0.5,
    family: 'Niger-Congo / Benue-Congo / Grassfields / Bamileke',
    script: 'Latin',
  },
  {
    code: 'agq',
    name: 'Aghem',
    nativeName: 'Aghem',
    countries: ['CM'],
    speakers: 0.03,
    family: 'Niger-Congo / Benue-Congo / Grassfields',
    script: 'Latin',
  },

  // =========================================================================
  // CENTRAL AFRICA — GABON (GA)
  // =========================================================================
  {
    code: 'fan',
    name: 'Fang',
    nativeName: 'Fang',
    countries: ['GA', 'GQ', 'CM'],
    speakers: 1.4,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'mye',
    name: 'Myene',
    nativeName: 'Myene',
    countries: ['GA'],
    speakers: 0.06,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'nzb',
    name: 'Nzebi',
    nativeName: 'Inzebi',
    countries: ['GA', 'CG'],
    speakers: 0.15,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'puu',
    name: 'Punu',
    nativeName: 'Yipunu',
    countries: ['GA', 'CG'],
    speakers: 0.2,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // CENTRAL AFRICA — EQUATORIAL GUINEA (GQ)
  // =========================================================================
  {
    code: 'bvb',
    name: 'Bube',
    nativeName: 'Bobe',
    countries: ['GQ'],
    speakers: 0.04,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'fab',
    name: 'Annobonese',
    nativeName: 'Fa d\'Ambu',
    countries: ['GQ'],
    speakers: 0.006,
    family: 'Portuguese Creole / Gulf of Guinea',
    script: 'Latin',
  },

  // =========================================================================
  // CENTRAL AFRICA — CENTRAL AFRICAN REPUBLIC (CF)
  // =========================================================================
  {
    code: 'sg',
    name: 'Sango',
    nativeName: 'Sango',
    countries: ['CF'],
    speakers: 5.5,
    family: 'Niger-Congo / Ubangian (Creole)',
    script: 'Latin',
  },
  {
    code: 'gba',
    name: 'Gbaya',
    nativeName: 'Gbaya',
    countries: ['CF', 'CM'],
    speakers: 1.5,
    family: 'Niger-Congo / Ubangian',
    script: 'Latin',
  },
  {
    code: 'bnd',
    name: 'Banda',
    nativeName: 'Banda',
    countries: ['CF', 'CD'],
    speakers: 1.3,
    family: 'Niger-Congo / Ubangian',
    script: 'Latin',
  },
  {
    code: 'nga',
    name: 'Ngbaka',
    nativeName: 'Ngbaka',
    countries: ['CF', 'CD'],
    speakers: 1,
    family: 'Niger-Congo / Ubangian',
    script: 'Latin',
  },

  // =========================================================================
  // CENTRAL AFRICA — SAO TOME AND PRINCIPE (ST)
  // =========================================================================
  {
    code: 'cri',
    name: 'Forro',
    nativeName: 'Forro',
    countries: ['ST'],
    speakers: 0.07,
    family: 'Portuguese Creole / Gulf of Guinea',
    script: 'Latin',
  },
  {
    code: 'aoa',
    name: 'Angolar',
    nativeName: 'Ngola',
    countries: ['ST'],
    speakers: 0.01,
    family: 'Portuguese Creole / Gulf of Guinea',
    script: 'Latin',
  },

  // =========================================================================
  // CENTRAL AFRICA — CHAD (TD)
  // =========================================================================
  {
    code: 'sre',
    name: 'Sara',
    nativeName: 'Sara',
    countries: ['TD'],
    speakers: 3.5,
    family: 'Nilo-Saharan / Central Sudanic',
    script: 'Latin',
  },
  {
    code: 'kbl',
    name: 'Kanembu',
    nativeName: 'Kanembu',
    countries: ['TD', 'NE'],
    speakers: 0.7,
    family: 'Nilo-Saharan / Saharan',
    script: 'Latin / Arabic',
  },
  {
    code: 'mde',
    name: 'Maba',
    nativeName: 'Maba',
    countries: ['TD'],
    speakers: 0.4,
    family: 'Nilo-Saharan / Maban',
    script: 'Latin / Arabic',
  },
  {
    code: 'saa',
    name: 'Sara Kaba',
    nativeName: 'Sara Kaba',
    countries: ['TD'],
    speakers: 0.1,
    family: 'Nilo-Saharan / Central Sudanic',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — SOUTH AFRICA (ZA)
  // =========================================================================
  {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    countries: ['ZA', 'SZ', 'LS', 'MW'],
    speakers: 27,
    family: 'Niger-Congo / Bantu / Nguni',
    script: 'Latin',
  },
  {
    code: 'xh',
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    countries: ['ZA', 'LS'],
    speakers: 19,
    family: 'Niger-Congo / Bantu / Nguni',
    script: 'Latin',
  },
  {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    countries: ['ZA', 'NA', 'BW'],
    speakers: 16,
    family: 'Indo-European / Germanic / West (Africanized)',
    script: 'Latin',
  },
  {
    code: 'nso',
    name: 'Northern Sotho / Sepedi',
    nativeName: 'Sesotho sa Leboa',
    countries: ['ZA'],
    speakers: 4.7,
    family: 'Niger-Congo / Bantu / Sotho-Tswana',
    script: 'Latin',
  },
  {
    code: 'tn',
    name: 'Tswana',
    nativeName: 'Setswana',
    countries: ['BW', 'ZA', 'NA', 'ZW'],
    speakers: 8.2,
    family: 'Niger-Congo / Bantu / Sotho-Tswana',
    script: 'Latin',
  },
  {
    code: 'st',
    name: 'Southern Sotho',
    nativeName: 'Sesotho',
    countries: ['LS', 'ZA'],
    speakers: 5.6,
    family: 'Niger-Congo / Bantu / Sotho-Tswana',
    script: 'Latin',
  },
  {
    code: 'ts',
    name: 'Tsonga',
    nativeName: 'Xitsonga',
    countries: ['ZA', 'MZ', 'SZ'],
    speakers: 3.4,
    family: 'Niger-Congo / Bantu / Tswa-Ronga',
    script: 'Latin',
  },
  {
    code: 'ss',
    name: 'Swati',
    nativeName: 'siSwati',
    countries: ['SZ', 'ZA'],
    speakers: 2.4,
    family: 'Niger-Congo / Bantu / Nguni',
    script: 'Latin',
  },
  {
    code: 've',
    name: 'Venda',
    nativeName: 'Tshivenda',
    countries: ['ZA', 'ZW'],
    speakers: 1.7,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'nr',
    name: 'Southern Ndebele',
    nativeName: 'isiNdebele',
    countries: ['ZA'],
    speakers: 1.1,
    family: 'Niger-Congo / Bantu / Nguni',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — ZIMBABWE (ZW)
  // =========================================================================
  {
    code: 'sn',
    name: 'Shona',
    nativeName: 'chiShona',
    countries: ['ZW', 'MZ', 'BW'],
    speakers: 12,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'nd',
    name: 'Northern Ndebele',
    nativeName: 'isiNdebele',
    countries: ['ZW'],
    speakers: 2.5,
    family: 'Niger-Congo / Bantu / Nguni',
    script: 'Latin',
  },
  {
    code: 'toi',
    name: 'Tonga (Southern Africa)',
    nativeName: 'chiTonga',
    countries: ['ZM', 'ZW'],
    speakers: 1.5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — ZAMBIA (ZM)
  // =========================================================================
  {
    code: 'bem',
    name: 'Bemba',
    nativeName: 'Chibemba',
    countries: ['ZM', 'CD'],
    speakers: 10,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'ny',
    name: 'Chewa / Nyanja',
    nativeName: 'Chichewa',
    countries: ['MW', 'ZM', 'MZ', 'ZW'],
    speakers: 15,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'loz',
    name: 'Lozi',
    nativeName: 'Silozi',
    countries: ['ZM', 'NA', 'BW', 'ZW'],
    speakers: 0.7,
    family: 'Niger-Congo / Bantu / Sotho-Tswana',
    script: 'Latin',
  },
  {
    code: 'kqn',
    name: 'Kaonde',
    nativeName: 'Kaonde',
    countries: ['ZM'],
    speakers: 0.35,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'lun',
    name: 'Lunda',
    nativeName: 'Chilunda',
    countries: ['ZM', 'AO', 'CD'],
    speakers: 0.5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'lue',
    name: 'Luvale',
    nativeName: 'Chiluvale',
    countries: ['ZM', 'AO'],
    speakers: 0.6,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — MALAWI (MW)
  // =========================================================================
  {
    code: 'yao',
    name: 'Yao',
    nativeName: 'Chiyao',
    countries: ['MW', 'TZ', 'MZ'],
    speakers: 3,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'tum',
    name: 'Tumbuka',
    nativeName: 'Chitumbuka',
    countries: ['MW', 'ZM'],
    speakers: 2.5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'ngl',
    name: 'Lomwe',
    nativeName: 'Elomwe',
    countries: ['MW', 'MZ'],
    speakers: 2.4,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'seh',
    name: 'Sena',
    nativeName: 'Cisena',
    countries: ['MZ', 'MW'],
    speakers: 2.3,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — MOZAMBIQUE (MZ)
  // =========================================================================
  {
    code: 'vmw',
    name: 'Makhuwa',
    nativeName: 'Emakhuwa',
    countries: ['MZ'],
    speakers: 8,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'tso',
    name: 'Changana',
    nativeName: 'Xichangana',
    countries: ['MZ'],
    speakers: 4,
    family: 'Niger-Congo / Bantu / Tswa-Ronga',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — ANGOLA (AO)
  // =========================================================================
  {
    code: 'umb',
    name: 'Umbundu',
    nativeName: 'Umbundu',
    countries: ['AO'],
    speakers: 6,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'kmb',
    name: 'Kimbundu',
    nativeName: 'Kimbundu',
    countries: ['AO'],
    speakers: 4,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'cjk',
    name: 'Chokwe',
    nativeName: 'Uchokwe',
    countries: ['AO', 'CD', 'ZM'],
    speakers: 1.5,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'kj',
    name: 'Kwanyama / Oshiwambo',
    nativeName: 'Oshikwanyama',
    countries: ['NA', 'AO'],
    speakers: 1.3,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'ndo',
    name: 'Ndonga',
    nativeName: 'Oshindonga',
    countries: ['NA'],
    speakers: 0.8,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — BOTSWANA (BW)
  // =========================================================================
  {
    code: 'kck',
    name: 'Kalanga',
    nativeName: 'Ikalanga',
    countries: ['BW', 'ZW'],
    speakers: 0.4,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },

  // =========================================================================
  // SOUTHERN AFRICA — NAMIBIA (NA)
  // =========================================================================
  {
    code: 'naq',
    name: 'Khoekhoe / Nama',
    nativeName: 'Khoekhoegowab',
    countries: ['NA', 'BW', 'ZA'],
    speakers: 0.25,
    family: 'Khoisan / Khoe-Kwadi',
    script: 'Latin',
  },
  {
    code: 'hz',
    name: 'Herero',
    nativeName: 'Otjiherero',
    countries: ['NA', 'BW', 'AO'],
    speakers: 0.3,
    family: 'Niger-Congo / Bantu',
    script: 'Latin',
  },
  {
    code: 'ktz',
    name: 'Ju|\'hoan / !Kung',
    nativeName: 'Ju|\'hoansi',
    countries: ['NA', 'BW'],
    speakers: 0.03,
    family: 'Khoisan / Kx\'a',
    script: 'Latin',
  },
  {
    code: 'nmn',
    name: 'Taa / !Xoo',
    nativeName: 'Taa',
    countries: ['BW', 'NA'],
    speakers: 0.004,
    family: 'Khoisan / Tuu',
    script: 'Latin',
  },

  // =========================================================================
  // ISLAND NATIONS — MADAGASCAR (MG)
  // =========================================================================
  {
    code: 'mg',
    name: 'Malagasy',
    nativeName: 'Malagasy',
    countries: ['MG'],
    speakers: 25,
    family: 'Austronesian / Malayo-Polynesian / Barito',
    script: 'Latin',
  },

  // =========================================================================
  // ISLAND NATIONS — MAURITIUS (MU)
  // =========================================================================
  {
    code: 'mfe',
    name: 'Mauritian Creole',
    nativeName: 'Kreol Morisien',
    countries: ['MU'],
    speakers: 1.3,
    family: 'French Creole',
    script: 'Latin',
  },

  // =========================================================================
  // ISLAND NATIONS — COMOROS (KM)
  // =========================================================================
  {
    code: 'zdj',
    name: 'Comorian / Shingazidja',
    nativeName: 'Shikomori',
    countries: ['KM'],
    speakers: 0.7,
    family: 'Niger-Congo / Bantu',
    script: 'Latin / Arabic',
  },

  // =========================================================================
  // ISLAND NATIONS — SEYCHELLES (SC)
  // =========================================================================
  {
    code: 'crs',
    name: 'Seychellois Creole',
    nativeName: 'Seselwa',
    countries: ['SC'],
    speakers: 0.1,
    family: 'French Creole',
    script: 'Latin',
  },

  // =========================================================================
  // INTERNATIONAL BRIDGING LANGUAGES (used as official/national languages
  // across Africa — counted here as African languages due to deep adoption)
  // =========================================================================
  {
    code: 'ar',
    name: 'Arabic (Standard)',
    nativeName: 'al-Arabiyyah al-Fusha',
    countries: [
      'EG', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'TD',
      'DJ', 'SO', 'KM', 'ER',
    ],
    speakers: 250,
    family: 'Afro-Asiatic / Semitic / Arabic',
    script: 'Arabic',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Francais',
    countries: [
      'CD', 'CG', 'CI', 'SN', 'ML', 'BF', 'NE', 'GN', 'TG',
      'BJ', 'CM', 'GA', 'CF', 'TD', 'RW', 'BI', 'DJ', 'KM',
      'SC', 'MG', 'MU', 'GQ', 'MA', 'DZ', 'TN',
    ],
    speakers: 141,
    family: 'Indo-European / Romance',
    script: 'Latin',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    countries: [
      'NG', 'GH', 'KE', 'ZA', 'TZ', 'UG', 'RW', 'ZM', 'ZW',
      'BW', 'NA', 'LS', 'SZ', 'MW', 'MU', 'SC', 'SL', 'LR',
      'GM', 'CM', 'SS', 'ER', 'SO',
    ],
    speakers: 230,
    family: 'Indo-European / Germanic / West',
    script: 'Latin',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Portugues',
    countries: ['AO', 'MZ', 'GW', 'CV', 'ST', 'GQ'],
    speakers: 43,
    family: 'Indo-European / Romance',
    script: 'Latin',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Espanol',
    countries: ['GQ'],
    speakers: 1.2,
    family: 'Indo-European / Romance',
    script: 'Latin',
  },
]

// ---------------------------------------------------------------------------
// Derived indexes — auto-built from the master list
// ---------------------------------------------------------------------------

/**
 * All unique language family strings found in the registry.
 */
export const LANGUAGE_FAMILIES: string[] = [
  ...new Set(AFRICAN_LANGUAGES.map((l) => l.family)),
].sort()

/**
 * Lookup: country ISO code -> languages spoken there.
 * Auto-built from `AFRICAN_LANGUAGES`.
 */
export const COUNTRY_LANGUAGES: Record<string, AfricanLanguage[]> = (() => {
  const map: Record<string, AfricanLanguage[]> = {}
  for (const lang of AFRICAN_LANGUAGES) {
    for (const cc of lang.countries) {
      if (!map[cc]) map[cc] = []
      map[cc].push(lang)
    }
  }
  // Sort each country's languages by speaker count (descending)
  for (const cc of Object.keys(map)) {
    map[cc].sort((a, b) => b.speakers - a.speakers)
  }
  return map
})()

// ---------------------------------------------------------------------------
// Dial-code to country mapping (all 54 African nations)
// ---------------------------------------------------------------------------

const DIAL_TO_COUNTRY: Record<string, string> = {
  '+234': 'NG',
  '+233': 'GH',
  '+254': 'KE',
  '+27':  'ZA',
  '+251': 'ET',
  '+20':  'EG',
  '+255': 'TZ',
  '+256': 'UG',
  '+221': 'SN',
  '+237': 'CM',
  '+225': 'CI',
  '+212': 'MA',
  '+213': 'DZ',
  '+216': 'TN',
  '+250': 'RW',
  '+258': 'MZ',
  '+261': 'MG',
  '+260': 'ZM',
  '+263': 'ZW',
  '+223': 'ML',
  '+226': 'BF',
  '+227': 'NE',
  '+235': 'TD',
  '+224': 'GN',
  '+229': 'BJ',
  '+228': 'TG',
  '+232': 'SL',
  '+231': 'LR',
  '+222': 'MR',
  '+220': 'GM',
  '+245': 'GW',
  '+238': 'CV',
  '+243': 'CD',
  '+242': 'CG',
  '+241': 'GA',
  '+240': 'GQ',
  '+236': 'CF',
  '+239': 'ST',
  '+267': 'BW',
  '+264': 'NA',
  '+266': 'LS',
  '+268': 'SZ',
  '+265': 'MW',
  '+230': 'MU',
  '+269': 'KM',
  '+248': 'SC',
  '+253': 'DJ',
  '+291': 'ER',
  '+252': 'SO',
  '+257': 'BI',
  '+211': 'SS',
  '+249': 'SD',
  '+218': 'LY',
  '+244': 'AO',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Given a dial code (e.g. '+234'), return the languages spoken in that
 * country. Returns an empty array if the dial code is unrecognised.
 */
export function getCountryForDialCode(dialCode: string): string | undefined {
  return DIAL_TO_COUNTRY[dialCode]
}

export function getLanguagesForDialCode(dialCode: string): AfricanLanguage[] {
  const cc = DIAL_TO_COUNTRY[dialCode]
  if (!cc) return []
  return COUNTRY_LANGUAGES[cc] ?? []
}

/**
 * Find a single language by its ISO code.
 */
export function getLanguageByCode(code: string): AfricanLanguage | undefined {
  return AFRICAN_LANGUAGES.find((l) => l.code === code)
}

/**
 * Quick lookup index (code -> language) for O(1) access.
 */
export const LANGUAGE_BY_CODE: Record<string, AfricanLanguage> = Object.fromEntries(
  AFRICAN_LANGUAGES.map((l) => [l.code, l]),
)
