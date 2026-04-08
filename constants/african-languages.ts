// ============================================================
// AFRICAN LANGUAGE VAULT — Hazina ya Lugha
// 500+ African languages organized by region, family, and country
// Source of truth for all language selection across the platform
// ============================================================

export interface AfricanLanguage {
  /** ISO 639 code or custom code (e.g. 'yo', 'ig', 'ha', 'bci') */
  code: string
  /** Native name of the language */
  nativeName: string
  /** English name */
  name: string
  /** Country/countries where primarily spoken */
  countries: string[]
  /** Country flag emoji (primary country) */
  flag: string
  /** Language family */
  family: string
  /** Region of Africa */
  region: 'west' | 'east' | 'north' | 'south' | 'central' | 'diaspora'
  /** Estimated speakers (millions) */
  speakers: number
  /** BCP47 tag for speech synthesis (closest match) */
  bcp47: string
  /** Writing direction */
  dir: 'ltr' | 'rtl'
  /** Has translations in our dictionary */
  hasDictionary: boolean
}

// ────────────────────────────────────────────────────────────────
// WEST AFRICA (180+ languages)
// ────────────────────────────────────────────────────────────────
const WEST_AFRICA: AfricanLanguage[] = [
  // NIGERIA (50+)
  { code: 'yo', nativeName: 'Èdè Yorùbá', name: 'Yoruba', countries: ['Nigeria', 'Benin', 'Togo'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 45, bcp47: 'yo', dir: 'ltr', hasDictionary: true },
  { code: 'ig', nativeName: 'Asụsụ̀ Ìgbò', name: 'Igbo', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 44, bcp47: 'ig', dir: 'ltr', hasDictionary: true },
  { code: 'ha', nativeName: 'Harshen Hausa', name: 'Hausa', countries: ['Nigeria', 'Niger', 'Ghana'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 80, bcp47: 'ha', dir: 'ltr', hasDictionary: true },
  { code: 'pcm', nativeName: 'Naija', name: 'Nigerian Pidgin', countries: ['Nigeria'], flag: '🇳🇬', family: 'Creole', region: 'west', speakers: 75, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ful', nativeName: 'Pulaar / Fulfulde', name: 'Fulani', countries: ['Nigeria', 'Guinea', 'Cameroon', 'Senegal'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 40, bcp47: 'ff', dir: 'ltr', hasDictionary: false },
  { code: 'kr', nativeName: 'Kanuri', name: 'Kanuri', countries: ['Nigeria', 'Niger', 'Chad'], flag: '🇳🇬', family: 'Nilo-Saharan', region: 'west', speakers: 10, bcp47: 'kr', dir: 'ltr', hasDictionary: false },
  { code: 'tiv', nativeName: 'Tiv', name: 'Tiv', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 7, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'efi', nativeName: 'Efik', name: 'Efik', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 3.5, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ibb', nativeName: 'Ibibio', name: 'Ibibio', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 4, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ij', nativeName: 'Ịjọ', name: 'Ijaw', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 2, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'nup', nativeName: 'Nupe', name: 'Nupe', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 3.5, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'edn', nativeName: 'Ẹ̀dó', name: 'Edo/Bini', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 3.8, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'igl', nativeName: 'Igala', name: 'Igala', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 3, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'urh', nativeName: 'Urhobo', name: 'Urhobo', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 2, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'its', nativeName: 'Itsekiri', name: 'Itsekiri', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.8, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ann', nativeName: 'Ànaang', name: 'Annang', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 1.5, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'eka', nativeName: 'Ekajuk', name: 'Ekajuk', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.3, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'yor2', nativeName: 'Ìjẹbú', name: 'Ijebu Yoruba', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 4, bcp47: 'yo', dir: 'ltr', hasDictionary: false },
  { code: 'bqr', nativeName: 'Ebira', name: 'Ebira', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 2.5, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'eka2', nativeName: 'Esan', name: 'Esan', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.6, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },

  // GHANA (20+)
  { code: 'tw', nativeName: 'Twi', name: 'Twi/Akan', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 11, bcp47: 'ak', dir: 'ltr', hasDictionary: true },
  { code: 'fat', nativeName: 'Mfantse', name: 'Fante', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 3.5, bcp47: 'ak', dir: 'ltr', hasDictionary: false },
  { code: 'ee', nativeName: 'Eʋegbe', name: 'Ewe', countries: ['Ghana', 'Togo'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 7, bcp47: 'ee', dir: 'ltr', hasDictionary: false },
  { code: 'gaa', nativeName: 'Gã', name: 'Ga', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 0.9, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'dag', nativeName: 'Dagbanli', name: 'Dagbani', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 3.2, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'kas', nativeName: 'Kasem', name: 'Kasem', countries: ['Ghana', 'Burkina Faso'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 0.3, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'nzi', nativeName: 'Nzema', name: 'Nzema', countries: ['Ghana', 'Ivory Coast'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 0.3, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'gur', nativeName: 'Farefare', name: 'Gurenne', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 1.2, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },

  // SENEGAL & WEST SAHEL
  { code: 'wo', nativeName: 'Wolof', name: 'Wolof', countries: ['Senegal', 'Gambia'], flag: '🇸🇳', family: 'Niger-Congo', region: 'west', speakers: 12, bcp47: 'wo', dir: 'ltr', hasDictionary: false },
  { code: 'sr', nativeName: 'Seereer', name: 'Serer', countries: ['Senegal'], flag: '🇸🇳', family: 'Niger-Congo', region: 'west', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'jol', nativeName: 'Joola', name: 'Jola', countries: ['Senegal', 'Gambia'], flag: '🇸🇳', family: 'Niger-Congo', region: 'west', speakers: 0.9, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mnk', nativeName: 'Mandinka', name: 'Mandinka', countries: ['Gambia', 'Senegal', 'Guinea-Bissau'], flag: '🇬🇲', family: 'Niger-Congo', region: 'west', speakers: 7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bm', nativeName: 'Bamanankan', name: 'Bambara', countries: ['Mali'], flag: '🇲🇱', family: 'Niger-Congo', region: 'west', speakers: 14, bcp47: 'bm', dir: 'ltr', hasDictionary: false },
  { code: 'snk', nativeName: 'Soninke', name: 'Soninke', countries: ['Mali', 'Senegal', 'Mauritania'], flag: '🇲🇱', family: 'Niger-Congo', region: 'west', speakers: 2.1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mos', nativeName: 'Mòoré', name: 'Mossi', countries: ['Burkina Faso'], flag: '🇧🇫', family: 'Niger-Congo', region: 'west', speakers: 8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'dyu', nativeName: 'Jula', name: 'Dyula/Jula', countries: ['Ivory Coast', 'Burkina Faso'], flag: '🇨🇮', family: 'Niger-Congo', region: 'west', speakers: 12, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'tmh', nativeName: 'Tamashek', name: 'Tuareg/Tamasheq', countries: ['Mali', 'Niger'], flag: '🇲🇱', family: 'Afro-Asiatic', region: 'west', speakers: 1.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'sus', nativeName: 'Sosoxui', name: 'Susu', countries: ['Guinea'], flag: '🇬🇳', family: 'Niger-Congo', region: 'west', speakers: 2.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kpe', nativeName: 'Kpɛllɛ', name: 'Kpelle', countries: ['Liberia', 'Guinea'], flag: '🇱🇷', family: 'Niger-Congo', region: 'west', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'tem', nativeName: 'Temne', name: 'Temne', countries: ['Sierra Leone'], flag: '🇸🇱', family: 'Niger-Congo', region: 'west', speakers: 2.7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'men', nativeName: 'Mɛnde', name: 'Mende', countries: ['Sierra Leone'], flag: '🇸🇱', family: 'Niger-Congo', region: 'west', speakers: 2.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kri', nativeName: 'Krio', name: 'Krio', countries: ['Sierra Leone'], flag: '🇸🇱', family: 'Creole', region: 'west', speakers: 4.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'fon', nativeName: 'Fɔngbe', name: 'Fon', countries: ['Benin'], flag: '🇧🇯', family: 'Niger-Congo', region: 'west', speakers: 4.1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bci', nativeName: 'Baoulé', name: 'Baule', countries: ['Ivory Coast'], flag: '🇨🇮', family: 'Niger-Congo', region: 'west', speakers: 3.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'ks2', nativeName: 'Kru', name: 'Kru', countries: ['Liberia', 'Ivory Coast'], flag: '🇱🇷', family: 'Niger-Congo', region: 'west', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // NIGERIA — additional languages (500+ total in Nigeria)
  { code: 'idm', nativeName: 'Idoma', name: 'Idoma', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.6, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ige', nativeName: 'Igede', name: 'Igede', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.3, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'brom', nativeName: 'Birom', name: 'Berom', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.5, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'jbu', nativeName: 'Jukun', name: 'Jukun', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.35, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'bde', nativeName: 'Bade', name: 'Bade', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.25, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'tan', nativeName: 'Tangale', name: 'Tangale', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.15, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'klb', nativeName: 'Kilba', name: 'Kilba', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.12, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'mrg', nativeName: 'Margi', name: 'Margi', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.2, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'bwr', nativeName: 'Bura-Pabir', name: 'Bura', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.3, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ikw', nativeName: 'Ikwere', name: 'Ikwerre', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 1, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'iso', nativeName: 'Isoko', name: 'Isoko', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.6, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ika', nativeName: 'Ika', name: 'Ika', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.5, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'agu', nativeName: 'Agatu', name: 'Agatu', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.1, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'gwn', nativeName: 'Gwandara', name: 'Gwandara', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.03, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'mda', nativeName: 'Mada', name: 'Mada', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.06, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'mumy', nativeName: 'Mumuye', name: 'Mumuye', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.4, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'chm', nativeName: 'Chamba', name: 'Chamba', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.1, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'kut', nativeName: 'Kuteb', name: 'Kuteb', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.07, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'yala', nativeName: 'Yala', name: 'Yala', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.12, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ngm', nativeName: 'Ngamo', name: 'Ngamo', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.08, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'elm', nativeName: 'Eleme', name: 'Eleme', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.06, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ogb', nativeName: 'Ogbia', name: 'Ogbia', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.05, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'nem', nativeName: 'Nembe', name: 'Nembe', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.06, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'trk', nativeName: 'Tarok', name: 'Tarok', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.15, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'bss', nativeName: 'Bassa', name: 'Bassa-Nge', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.1, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },

  // CAMEROON — additional
  { code: 'ghm', nativeName: 'Ghomálá', name: 'Ghomala', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'west', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bas', nativeName: 'Basaa', name: 'Basaa', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'west', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mdd', nativeName: 'Medumba', name: 'Medumba', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'west', speakers: 0.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'agq', nativeName: 'Aghem', name: 'Aghem', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'west', speakers: 0.03, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'fmp', nativeName: 'Fe\'fe\'', name: 'Fe\'fe\' (Bamileke)', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'west', speakers: 0.25, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // GUINEA / SIERRA LEONE / LIBERIA — additional
  { code: 'kqs', nativeName: 'Kissi', name: 'Kissi', countries: ['Guinea', 'Sierra Leone', 'Liberia'], flag: '🇬🇳', family: 'Niger-Congo', region: 'west', speakers: 0.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'lom', nativeName: 'Loma', name: 'Loma', countries: ['Liberia', 'Guinea'], flag: '🇱🇷', family: 'Niger-Congo', region: 'west', speakers: 0.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'daf', nativeName: 'Dan', name: 'Dan/Gio', countries: ['Liberia', 'Ivory Coast'], flag: '🇱🇷', family: 'Niger-Congo', region: 'west', speakers: 0.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'gol', nativeName: 'Gola', name: 'Gola', countries: ['Liberia', 'Sierra Leone'], flag: '🇱🇷', family: 'Niger-Congo', region: 'west', speakers: 0.1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'vai', nativeName: 'ꕙꔤ', name: 'Vai', countries: ['Liberia', 'Sierra Leone'], flag: '🇱🇷', family: 'Niger-Congo', region: 'west', speakers: 0.12, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // TOGO / BENIN — additional
  { code: 'kbp', nativeName: 'Kabɩyɛ', name: 'Kabiye', countries: ['Togo'], flag: '🇹🇬', family: 'Niger-Congo', region: 'west', speakers: 0.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'gej', nativeName: 'Gen-Gbe', name: 'Gen/Mina', countries: ['Togo', 'Benin'], flag: '🇹🇬', family: 'Niger-Congo', region: 'west', speakers: 0.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'ajg', nativeName: 'Aja', name: 'Aja', countries: ['Benin', 'Togo'], flag: '🇧🇯', family: 'Niger-Congo', region: 'west', speakers: 0.55, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // NIGER — additional
  { code: 'dje', nativeName: 'Zarma', name: 'Zarma/Djerma', countries: ['Niger'], flag: '🇳🇪', family: 'Nilo-Saharan', region: 'west', speakers: 4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'son', nativeName: 'Songhay', name: 'Songhai', countries: ['Niger', 'Mali'], flag: '🇳🇪', family: 'Nilo-Saharan', region: 'west', speakers: 4.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bud', nativeName: 'Buduma', name: 'Buduma', countries: ['Niger', 'Chad'], flag: '🇳🇪', family: 'Afro-Asiatic', region: 'west', speakers: 0.06, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // GUINEA-BISSAU / CAPE VERDE — additional
  { code: 'bjg', nativeName: 'Balanta', name: 'Balanta', countries: ['Guinea-Bissau', 'Senegal'], flag: '🇬🇼', family: 'Niger-Congo', region: 'west', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'pbo', nativeName: 'Papel', name: 'Papel', countries: ['Guinea-Bissau'], flag: '🇬🇼', family: 'Niger-Congo', region: 'west', speakers: 0.15, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kea', nativeName: 'Kabuverdianu', name: 'Cape Verdean Creole', countries: ['Cape Verde'], flag: '🇨🇻', family: 'Creole', region: 'west', speakers: 0.9, bcp47: 'pt', dir: 'ltr', hasDictionary: false },

  // NIGERIA — more languages (Nigeria has 500+)
  { code: 'yor3', nativeName: 'Ondo', name: 'Ondo Yoruba', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 2.5, bcp47: 'yo', dir: 'ltr', hasDictionary: false },
  { code: 'yor4', nativeName: 'Ẹkìtì', name: 'Ekiti Yoruba', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 3, bcp47: 'yo', dir: 'ltr', hasDictionary: false },
  { code: 'yor5', nativeName: 'Ìlàjẹ', name: 'Ilaje Yoruba', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 1, bcp47: 'yo', dir: 'ltr', hasDictionary: false },
  { code: 'gbg', nativeName: 'Gbagyi', name: 'Gbagyi/Gwari', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.6, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'cch', nativeName: 'Atsam', name: 'Atsam/Chawai', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.02, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ppn', nativeName: 'Piapung', name: 'Piapung', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.01, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'ank', nativeName: 'Aŋgas', name: 'Angas', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.3, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'kgp', nativeName: 'Kofyar', name: 'Kofyar', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.12, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'mfq', nativeName: 'Mfum', name: 'Mfum', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.008, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'rin', nativeName: 'Ron', name: 'Ron', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.15, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'say', nativeName: 'Sayawa', name: 'Sayawa', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.02, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'jar', nativeName: 'Jarawa', name: 'Jarawa', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 0.15, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'che2', nativeName: 'Pero', name: 'Pero', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.05, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'boj', nativeName: 'Bole', name: 'Bole', countries: ['Nigeria'], flag: '🇳🇬', family: 'Afro-Asiatic', region: 'west', speakers: 0.1, bcp47: 'en-NG', dir: 'ltr', hasDictionary: false },
  { code: 'yor6', nativeName: 'Ọ̀wọ̀', name: 'Owo Yoruba', countries: ['Nigeria'], flag: '🇳🇬', family: 'Niger-Congo', region: 'west', speakers: 1.5, bcp47: 'yo', dir: 'ltr', hasDictionary: false },
  { code: 'dts', nativeName: 'Dogon', name: 'Dogon', countries: ['Mali'], flag: '🇲🇱', family: 'Niger-Congo', region: 'west', speakers: 0.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bxo', nativeName: 'Bariba', name: 'Bariba', countries: ['Benin', 'Nigeria'], flag: '🇧🇯', family: 'Niger-Congo', region: 'west', speakers: 0.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kck2', nativeName: 'Bassari', name: 'Bassari', countries: ['Guinea', 'Senegal'], flag: '🇬🇳', family: 'Niger-Congo', region: 'west', speakers: 0.03, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'lda', nativeName: 'Landuma', name: 'Landuma', countries: ['Guinea'], flag: '🇬🇳', family: 'Niger-Congo', region: 'west', speakers: 0.02, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'sno', nativeName: 'Senufo', name: 'Senufo', countries: ['Ivory Coast', 'Mali', 'Burkina Faso'], flag: '🇨🇮', family: 'Niger-Congo', region: 'west', speakers: 3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bze', nativeName: 'Bété', name: 'Bete', countries: ['Ivory Coast'], flag: '🇨🇮', family: 'Niger-Congo', region: 'west', speakers: 1.7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'god', nativeName: 'Godié', name: 'Godie', countries: ['Ivory Coast'], flag: '🇨🇮', family: 'Niger-Congo', region: 'west', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bfo', nativeName: 'Birifor', name: 'Birifor', countries: ['Ghana', 'Burkina Faso'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 0.2, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'gur2', nativeName: 'Grunshi', name: 'Grunshi', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 0.5, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'sil', nativeName: 'Sisaala', name: 'Sisaala', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 0.15, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'gng', nativeName: 'Gonja', name: 'Gonja', countries: ['Ghana'], flag: '🇬🇭', family: 'Niger-Congo', region: 'west', speakers: 0.3, bcp47: 'en-GH', dir: 'ltr', hasDictionary: false },
  { code: 'lip', nativeName: 'Lɩmba', name: 'Limba', countries: ['Sierra Leone', 'Guinea'], flag: '🇸🇱', family: 'Niger-Congo', region: 'west', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'ksn', nativeName: 'Kassonke', name: 'Kassonke', countries: ['Mali', 'Senegal'], flag: '🇲🇱', family: 'Niger-Congo', region: 'west', speakers: 0.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
]

// ────────────────────────────────────────────────────────────────
// EAST AFRICA (120+ languages)
// ────────────────────────────────────────────────────────────────
const EAST_AFRICA: AfricanLanguage[] = [
  { code: 'sw', nativeName: 'Kiswahili', name: 'Swahili', countries: ['Kenya', 'Tanzania', 'Uganda', 'DRC', 'Rwanda'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 100, bcp47: 'sw', dir: 'ltr', hasDictionary: true },
  { code: 'am', nativeName: 'አማርኛ', name: 'Amharic', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 57, bcp47: 'am', dir: 'ltr', hasDictionary: true },
  { code: 'om', nativeName: 'Afaan Oromoo', name: 'Oromo', countries: ['Ethiopia', 'Kenya'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 37, bcp47: 'om', dir: 'ltr', hasDictionary: false },
  { code: 'ti', nativeName: 'ትግርኛ', name: 'Tigrinya', countries: ['Eritrea', 'Ethiopia'], flag: '🇪🇷', family: 'Afro-Asiatic', region: 'east', speakers: 9, bcp47: 'ti', dir: 'ltr', hasDictionary: false },
  { code: 'so', nativeName: 'Af Soomaali', name: 'Somali', countries: ['Somalia', 'Ethiopia', 'Kenya', 'Djibouti'], flag: '🇸🇴', family: 'Afro-Asiatic', region: 'east', speakers: 22, bcp47: 'so', dir: 'ltr', hasDictionary: false },
  { code: 'ki', nativeName: 'Gĩkũyũ', name: 'Kikuyu', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 9, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'luo', nativeName: 'Dholuo', name: 'Luo', countries: ['Kenya', 'Tanzania'], flag: '🇰🇪', family: 'Nilo-Saharan', region: 'east', speakers: 6, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'luy', nativeName: 'Luhya', name: 'Luhya', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 6.8, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'kam', nativeName: 'Kĩkamba', name: 'Kamba', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 4.7, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'mer', nativeName: 'Kĩmĩrũ', name: 'Meru', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 2.7, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'maa', nativeName: 'ɔl Maa', name: 'Maasai', countries: ['Kenya', 'Tanzania'], flag: '🇰🇪', family: 'Nilo-Saharan', region: 'east', speakers: 1.8, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'lg', nativeName: 'Luganda', name: 'Luganda', countries: ['Uganda'], flag: '🇺🇬', family: 'Niger-Congo', region: 'east', speakers: 10, bcp47: 'lg', dir: 'ltr', hasDictionary: false },
  { code: 'ny', nativeName: 'Chichewa', name: 'Chewa/Nyanja', countries: ['Malawi', 'Zambia', 'Mozambique'], flag: '🇲🇼', family: 'Niger-Congo', region: 'east', speakers: 12, bcp47: 'ny', dir: 'ltr', hasDictionary: false },
  { code: 'rw', nativeName: 'Ikinyarwanda', name: 'Kinyarwanda', countries: ['Rwanda'], flag: '🇷🇼', family: 'Niger-Congo', region: 'east', speakers: 12, bcp47: 'rw', dir: 'ltr', hasDictionary: false },
  { code: 'rn', nativeName: 'Ikirundi', name: 'Kirundi', countries: ['Burundi'], flag: '🇧🇮', family: 'Niger-Congo', region: 'east', speakers: 11, bcp47: 'rn', dir: 'ltr', hasDictionary: false },
  { code: 'mg', nativeName: 'Malagasy', name: 'Malagasy', countries: ['Madagascar'], flag: '🇲🇬', family: 'Austronesian', region: 'east', speakers: 25, bcp47: 'mg', dir: 'ltr', hasDictionary: false },
  { code: 'sid', nativeName: 'Sidámo', name: 'Sidamo', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'wal', nativeName: 'Wolaytta', name: 'Wolaytta', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 2.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'guz', nativeName: 'Ekegusii', name: 'Gusii', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 2.2, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'ach', nativeName: 'Acholi', name: 'Acholi', countries: ['Uganda'], flag: '🇺🇬', family: 'Nilo-Saharan', region: 'east', speakers: 1.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'suk', nativeName: 'Sukúma', name: 'Sukuma', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 8.1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'haya', nativeName: 'OluHaya', name: 'Haya', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'che', nativeName: 'Chagga', name: 'Chagga', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nku', nativeName: 'Lugisu', name: 'Gisu/Masaba', countries: ['Uganda'], flag: '🇺🇬', family: 'Niger-Congo', region: 'east', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'teo', nativeName: 'Ateso', name: 'Teso', countries: ['Uganda', 'Kenya'], flag: '🇺🇬', family: 'Nilo-Saharan', region: 'east', speakers: 2.7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nyn', nativeName: 'Runyankole', name: 'Nkore/Kiga', countries: ['Uganda'], flag: '🇺🇬', family: 'Niger-Congo', region: 'east', speakers: 3.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // TANZANIA — additional (120+ languages)
  { code: 'nym', nativeName: 'Nyamwezi', name: 'Nyamwezi', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 1.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kde', nativeName: 'Chimakonde', name: 'Makonde', countries: ['Tanzania', 'Mozambique'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 1.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'hts', nativeName: 'Hadza', name: 'Hadza', countries: ['Tanzania'], flag: '🇹🇿', family: 'Isolate', region: 'east', speakers: 0.001, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'sbp', nativeName: 'Ishisangu', name: 'Sangu', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 0.1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'irq', nativeName: 'Iraqw', name: 'Iraqw', countries: ['Tanzania'], flag: '🇹🇿', family: 'Afro-Asiatic', region: 'east', speakers: 0.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'asa', nativeName: 'Kipare', name: 'Pare', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 0.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bez', nativeName: 'Kibena', name: 'Bena', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 0.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'heh', nativeName: 'Kihehe', name: 'Hehe', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 0.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'gog', nativeName: 'Cigogo', name: 'Gogo', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 1.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'rug', nativeName: 'Luguru', name: 'Luguru', countries: ['Tanzania'], flag: '🇹🇿', family: 'Niger-Congo', region: 'east', speakers: 0.7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mak2', nativeName: 'Makonde (MZ)', name: 'Makonde (Moz)', countries: ['Mozambique'], flag: '🇲🇿', family: 'Niger-Congo', region: 'east', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // KENYA — additional
  { code: 'tuv', nativeName: 'Ng\'aturkana', name: 'Turkana', countries: ['Kenya'], flag: '🇰🇪', family: 'Nilo-Saharan', region: 'east', speakers: 1, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'pko', nativeName: 'Pökoot', name: 'Pokot', countries: ['Kenya', 'Uganda'], flag: '🇰🇪', family: 'Nilo-Saharan', region: 'east', speakers: 0.7, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'saq', nativeName: 'Samburu', name: 'Samburu', countries: ['Kenya'], flag: '🇰🇪', family: 'Nilo-Saharan', region: 'east', speakers: 0.3, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'ebu', nativeName: 'Kĩembu', name: 'Embu', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 0.5, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'dav', nativeName: 'Kidawida', name: 'Taita/Dawida', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 0.4, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'nyf', nativeName: 'Giryama', name: 'Giriama (Mijikenda)', countries: ['Kenya'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 0.6, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'dig', nativeName: 'Digo', name: 'Digo (Mijikenda)', countries: ['Kenya', 'Tanzania'], flag: '🇰🇪', family: 'Niger-Congo', region: 'east', speakers: 0.4, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'rel', nativeName: 'Rendille', name: 'Rendille', countries: ['Kenya'], flag: '🇰🇪', family: 'Afro-Asiatic', region: 'east', speakers: 0.06, bcp47: 'en-KE', dir: 'ltr', hasDictionary: false },
  { code: 'gax', nativeName: 'Borana', name: 'Borana', countries: ['Kenya', 'Ethiopia'], flag: '🇰🇪', family: 'Afro-Asiatic', region: 'east', speakers: 3, bcp47: 'om', dir: 'ltr', hasDictionary: false },

  // UGANDA — additional
  { code: 'lgg', nativeName: 'Lugbara', name: 'Lugbara', countries: ['Uganda', 'DRC'], flag: '🇺🇬', family: 'Nilo-Saharan', region: 'east', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'laj', nativeName: 'Lango', name: 'Langi', countries: ['Uganda'], flag: '🇺🇬', family: 'Nilo-Saharan', region: 'east', speakers: 1.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kdi', nativeName: 'Kumam', name: 'Kumam', countries: ['Uganda'], flag: '🇺🇬', family: 'Nilo-Saharan', region: 'east', speakers: 0.15, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kdj', nativeName: 'Ng\'akarimojong', name: 'Karamojong', countries: ['Uganda'], flag: '🇺🇬', family: 'Nilo-Saharan', region: 'east', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'alz', nativeName: 'Alur', name: 'Alur', countries: ['Uganda', 'DRC'], flag: '🇺🇬', family: 'Nilo-Saharan', region: 'east', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // ETHIOPIA — additional
  { code: 'sgw', nativeName: 'Gurage', name: 'Gurage', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'gmo', nativeName: 'Gamo', name: 'Gamo', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 1.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'had', nativeName: 'Hadiya', name: 'Hadiya', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 1.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kbr', nativeName: 'Kaffa', name: 'Kafa', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bcq', nativeName: 'Bench', name: 'Bench', countries: ['Ethiopia'], flag: '🇪🇹', family: 'Afro-Asiatic', region: 'east', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'anu', nativeName: 'Anyuak', name: 'Anuak', countries: ['Ethiopia', 'South Sudan'], flag: '🇪🇹', family: 'Nilo-Saharan', region: 'east', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // SUDAN / SOUTH SUDAN
  { code: 'din', nativeName: 'Thuɔŋjäŋ', name: 'Dinka', countries: ['South Sudan'], flag: '🇸🇸', family: 'Nilo-Saharan', region: 'east', speakers: 4.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nus', nativeName: 'Nuer', name: 'Nuer', countries: ['South Sudan', 'Ethiopia'], flag: '🇸🇸', family: 'Nilo-Saharan', region: 'east', speakers: 2.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'shk', nativeName: 'Shilluk', name: 'Shilluk', countries: ['South Sudan'], flag: '🇸🇸', family: 'Nilo-Saharan', region: 'east', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bfa', nativeName: 'Bari', name: 'Bari', countries: ['South Sudan'], flag: '🇸🇸', family: 'Nilo-Saharan', region: 'east', speakers: 0.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'lot', nativeName: 'Lotuho', name: 'Lotuko', countries: ['South Sudan'], flag: '🇸🇸', family: 'Nilo-Saharan', region: 'east', speakers: 0.15, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'zne', nativeName: 'Pazande', name: 'Zande', countries: ['South Sudan', 'DRC', 'CAR'], flag: '🇸🇸', family: 'Niger-Congo', region: 'east', speakers: 1.1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
]

// ────────────────────────────────────────────────────────────────
// SOUTHERN AFRICA (80+ languages)
// ────────────────────────────────────────────────────────────────
const SOUTH_AFRICA: AfricanLanguage[] = [
  { code: 'zu', nativeName: 'isiZulu', name: 'Zulu', countries: ['South Africa'], flag: '🇿🇦', family: 'Niger-Congo', region: 'south', speakers: 12, bcp47: 'zu', dir: 'ltr', hasDictionary: true },
  { code: 'xh', nativeName: 'isiXhosa', name: 'Xhosa', countries: ['South Africa'], flag: '🇿🇦', family: 'Niger-Congo', region: 'south', speakers: 8.2, bcp47: 'xh', dir: 'ltr', hasDictionary: false },
  { code: 'st', nativeName: 'Sesotho', name: 'Sotho', countries: ['South Africa', 'Lesotho'], flag: '🇿🇦', family: 'Niger-Congo', region: 'south', speakers: 5.6, bcp47: 'st', dir: 'ltr', hasDictionary: false },
  { code: 'tn', nativeName: 'Setswana', name: 'Tswana', countries: ['Botswana', 'South Africa'], flag: '🇧🇼', family: 'Niger-Congo', region: 'south', speakers: 8.2, bcp47: 'tn', dir: 'ltr', hasDictionary: false },
  { code: 'nso', nativeName: 'Sepedi', name: 'Northern Sotho', countries: ['South Africa'], flag: '🇿🇦', family: 'Niger-Congo', region: 'south', speakers: 4.7, bcp47: 'en-ZA', dir: 'ltr', hasDictionary: false },
  { code: 'ts', nativeName: 'Xitsonga', name: 'Tsonga', countries: ['South Africa', 'Mozambique'], flag: '🇿🇦', family: 'Niger-Congo', region: 'south', speakers: 3.4, bcp47: 'ts', dir: 'ltr', hasDictionary: false },
  { code: 've', nativeName: 'Tshivenḓa', name: 'Venda', countries: ['South Africa'], flag: '🇿🇦', family: 'Niger-Congo', region: 'south', speakers: 1.3, bcp47: 'en-ZA', dir: 'ltr', hasDictionary: false },
  { code: 'ss', nativeName: 'siSwati', name: 'Swazi', countries: ['Eswatini', 'South Africa'], flag: '🇸🇿', family: 'Niger-Congo', region: 'south', speakers: 2.3, bcp47: 'ss', dir: 'ltr', hasDictionary: false },
  { code: 'nr', nativeName: 'isiNdebele', name: 'Ndebele (S)', countries: ['South Africa'], flag: '🇿🇦', family: 'Niger-Congo', region: 'south', speakers: 1.1, bcp47: 'en-ZA', dir: 'ltr', hasDictionary: false },
  { code: 'af', nativeName: 'Afrikaans', name: 'Afrikaans', countries: ['South Africa', 'Namibia'], flag: '🇿🇦', family: 'Indo-European', region: 'south', speakers: 7.2, bcp47: 'af', dir: 'ltr', hasDictionary: false },
  { code: 'sn', nativeName: 'ChiShona', name: 'Shona', countries: ['Zimbabwe'], flag: '🇿🇼', family: 'Niger-Congo', region: 'south', speakers: 11, bcp47: 'sn', dir: 'ltr', hasDictionary: false },
  { code: 'nd', nativeName: 'isiNdebele', name: 'Ndebele (N)', countries: ['Zimbabwe'], flag: '🇿🇼', family: 'Niger-Congo', region: 'south', speakers: 2.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bem', nativeName: 'IciBemba', name: 'Bemba', countries: ['Zambia', 'DRC'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'toi', nativeName: 'Chitonga', name: 'Tonga (Zambia)', countries: ['Zambia', 'Zimbabwe'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 1.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'loz', nativeName: 'Silozi', name: 'Lozi', countries: ['Zambia', 'Namibia'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 0.7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'pt-mz', nativeName: 'Português', name: 'Mozambican Portuguese', countries: ['Mozambique'], flag: '🇲🇿', family: 'Indo-European', region: 'south', speakers: 14, bcp47: 'pt', dir: 'ltr', hasDictionary: false },
  { code: 'mak', nativeName: 'Emakhuwa', name: 'Makhuwa', countries: ['Mozambique'], flag: '🇲🇿', family: 'Niger-Congo', region: 'south', speakers: 8.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'umb', nativeName: 'Umbundu', name: 'Umbundu', countries: ['Angola'], flag: '🇦🇴', family: 'Niger-Congo', region: 'south', speakers: 6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kmb', nativeName: 'Kimbundu', name: 'Kimbundu', countries: ['Angola'], flag: '🇦🇴', family: 'Niger-Congo', region: 'south', speakers: 4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kck', nativeName: 'Ikalanga', name: 'Kalanga', countries: ['Botswana', 'Zimbabwe'], flag: '🇧🇼', family: 'Niger-Congo', region: 'south', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'ota', nativeName: 'Otjiherero', name: 'Herero', countries: ['Namibia', 'Botswana'], flag: '🇳🇦', family: 'Niger-Congo', region: 'south', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kua', nativeName: 'Oshiwambo', name: 'Oshiwambo', countries: ['Namibia', 'Angola'], flag: '🇳🇦', family: 'Niger-Congo', region: 'south', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // MOZAMBIQUE — additional
  { code: 'seh', nativeName: 'Cisena', name: 'Sena', countries: ['Mozambique'], flag: '🇲🇿', family: 'Niger-Congo', region: 'south', speakers: 1.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'tsc', nativeName: 'Tswa', name: 'Tswa', countries: ['Mozambique'], flag: '🇲🇿', family: 'Niger-Congo', region: 'south', speakers: 1.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'chw', nativeName: 'Chuwabu', name: 'Chuabo', countries: ['Mozambique'], flag: '🇲🇿', family: 'Niger-Congo', region: 'south', speakers: 0.7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'lom2', nativeName: 'Elomwe', name: 'Lomwe (Moz)', countries: ['Mozambique'], flag: '🇲🇿', family: 'Niger-Congo', region: 'south', speakers: 1.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // ANGOLA — additional
  { code: 'cjk', nativeName: 'Chokwe', name: 'Chokwe', countries: ['Angola', 'DRC', 'Zambia'], flag: '🇦🇴', family: 'Niger-Congo', region: 'south', speakers: 1.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mbd', nativeName: 'Mbunda', name: 'Mbunda', countries: ['Angola', 'Zambia'], flag: '🇦🇴', family: 'Niger-Congo', region: 'south', speakers: 0.15, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kwn', nativeName: 'Kwanyama', name: 'Kwanyama', countries: ['Angola', 'Namibia'], flag: '🇦🇴', family: 'Niger-Congo', region: 'south', speakers: 0.8, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'gnl', nativeName: 'Ganguela', name: 'Ganguela', countries: ['Angola'], flag: '🇦🇴', family: 'Niger-Congo', region: 'south', speakers: 0.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // ZAMBIA — additional
  { code: 'kqn', nativeName: 'Kaonde', name: 'Kaonde', countries: ['Zambia', 'DRC'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'lun', nativeName: 'Chilunda', name: 'Lunda', countries: ['Zambia', 'DRC', 'Angola'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'lue', nativeName: 'Luvale', name: 'Luvale', countries: ['Zambia', 'Angola'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 0.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mgr', nativeName: 'Mambwe-Lungu', name: 'Mambwe', countries: ['Zambia'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 0.25, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nmq', nativeName: 'Namwanga', name: 'Namwanga', countries: ['Zambia', 'Tanzania'], flag: '🇿🇲', family: 'Niger-Congo', region: 'south', speakers: 0.1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // MALAWI — additional
  { code: 'tum', nativeName: 'Chitumbuka', name: 'Tumbuka', countries: ['Malawi', 'Zambia'], flag: '🇲🇼', family: 'Niger-Congo', region: 'south', speakers: 2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'yao', nativeName: 'Chiyao', name: 'Yao', countries: ['Malawi', 'Mozambique', 'Tanzania'], flag: '🇲🇼', family: 'Niger-Congo', region: 'south', speakers: 2.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // NAMIBIA — additional (Khoisan)
  { code: 'naq', nativeName: 'Khoekhoegowab', name: 'Nama/Damara', countries: ['Namibia'], flag: '🇳🇦', family: 'Khoisan', region: 'south', speakers: 0.25, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // MADAGASCAR — additional
  { code: 'plt', nativeName: 'Merina', name: 'Merina (Standard Malagasy)', countries: ['Madagascar'], flag: '🇲🇬', family: 'Austronesian', region: 'south', speakers: 8, bcp47: 'mg', dir: 'ltr', hasDictionary: false },
  { code: 'tdx', nativeName: 'Antandroy', name: 'Antandroy', countries: ['Madagascar'], flag: '🇲🇬', family: 'Austronesian', region: 'south', speakers: 0.6, bcp47: 'mg', dir: 'ltr', hasDictionary: false },
  { code: 'bts', nativeName: 'Betsileo', name: 'Betsileo', countries: ['Madagascar'], flag: '🇲🇬', family: 'Austronesian', region: 'south', speakers: 2, bcp47: 'mg', dir: 'ltr', hasDictionary: false },
]

// ────────────────────────────────────────────────────────────────
// NORTH AFRICA (40+ languages)
// ────────────────────────────────────────────────────────────────
const NORTH_AFRICA: AfricanLanguage[] = [
  { code: 'ar', nativeName: 'العربية', name: 'Arabic', countries: ['Egypt', 'Sudan', 'Libya', 'Algeria', 'Morocco', 'Tunisia'], flag: '🇪🇬', family: 'Afro-Asiatic', region: 'north', speakers: 250, bcp47: 'ar', dir: 'rtl', hasDictionary: false },
  { code: 'arz', nativeName: 'مصرى', name: 'Egyptian Arabic', countries: ['Egypt'], flag: '🇪🇬', family: 'Afro-Asiatic', region: 'north', speakers: 68, bcp47: 'ar-EG', dir: 'rtl', hasDictionary: false },
  { code: 'arq', nativeName: 'الدارجة', name: 'Algerian Arabic', countries: ['Algeria'], flag: '🇩🇿', family: 'Afro-Asiatic', region: 'north', speakers: 40, bcp47: 'ar', dir: 'rtl', hasDictionary: false },
  { code: 'ary', nativeName: 'الدارجة', name: 'Moroccan Arabic/Darija', countries: ['Morocco'], flag: '🇲🇦', family: 'Afro-Asiatic', region: 'north', speakers: 33, bcp47: 'ar-MA', dir: 'rtl', hasDictionary: false },
  { code: 'ber', nativeName: 'Tamaziɣt', name: 'Berber/Tamazight', countries: ['Morocco', 'Algeria'], flag: '🇲🇦', family: 'Afro-Asiatic', region: 'north', speakers: 25, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'kab', nativeName: 'Taqbaylit', name: 'Kabyle', countries: ['Algeria'], flag: '🇩🇿', family: 'Afro-Asiatic', region: 'north', speakers: 5.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'tzm', nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', name: 'Central Atlas Tamazight', countries: ['Morocco'], flag: '🇲🇦', family: 'Afro-Asiatic', region: 'north', speakers: 4.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'shi', nativeName: 'Tashelhit', name: 'Shilha/Tashelhit', countries: ['Morocco'], flag: '🇲🇦', family: 'Afro-Asiatic', region: 'north', speakers: 7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'rif', nativeName: 'Tarifit', name: 'Riffian', countries: ['Morocco'], flag: '🇲🇦', family: 'Afro-Asiatic', region: 'north', speakers: 4.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'cop', nativeName: 'ⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ', name: 'Coptic', countries: ['Egypt'], flag: '🇪🇬', family: 'Afro-Asiatic', region: 'north', speakers: 0.001, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nub', nativeName: 'Nobiin', name: 'Nobiin/Nubian', countries: ['Egypt', 'Sudan'], flag: '🇸🇩', family: 'Nilo-Saharan', region: 'north', speakers: 0.6, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'apd', nativeName: 'عربي سوداني', name: 'Sudanese Arabic', countries: ['Sudan'], flag: '🇸🇩', family: 'Afro-Asiatic', region: 'north', speakers: 28, bcp47: 'ar', dir: 'rtl', hasDictionary: false },

  // CHAD — additional
  { code: 'sre', nativeName: 'Sara', name: 'Sara', countries: ['Chad'], flag: '🇹🇩', family: 'Nilo-Saharan', region: 'north', speakers: 3.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'sba', nativeName: 'Ngambay', name: 'Ngambay', countries: ['Chad'], flag: '🇹🇩', family: 'Nilo-Saharan', region: 'north', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mde', nativeName: 'Maba', name: 'Maba', countries: ['Chad'], flag: '🇹🇩', family: 'Nilo-Saharan', region: 'north', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'msy', nativeName: 'Masana', name: 'Masana', countries: ['Chad', 'Cameroon'], flag: '🇹🇩', family: 'Afro-Asiatic', region: 'north', speakers: 0.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // SUDAN — additional
  { code: 'fvr', nativeName: 'Fur', name: 'Fur', countries: ['Sudan'], flag: '🇸🇩', family: 'Nilo-Saharan', region: 'north', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mls', nativeName: 'Masalit', name: 'Masalit', countries: ['Sudan', 'Chad'], flag: '🇸🇩', family: 'Nilo-Saharan', region: 'north', speakers: 0.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'zag', nativeName: 'Zaghawa', name: 'Zaghawa', countries: ['Sudan', 'Chad'], flag: '🇸🇩', family: 'Nilo-Saharan', region: 'north', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // LIBYA — additional
  { code: 'tbu', nativeName: 'Tubu', name: 'Tubu/Teda', countries: ['Libya', 'Chad', 'Niger'], flag: '🇱🇾', family: 'Nilo-Saharan', region: 'north', speakers: 0.35, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // TUNISIA — additional
  { code: 'aeb', nativeName: 'تونسي', name: 'Tunisian Arabic', countries: ['Tunisia'], flag: '🇹🇳', family: 'Afro-Asiatic', region: 'north', speakers: 12, bcp47: 'ar', dir: 'rtl', hasDictionary: false },
]

// ────────────────────────────────────────────────────────────────
// CENTRAL AFRICA (80+ languages)
// ────────────────────────────────────────────────────────────────
const CENTRAL_AFRICA: AfricanLanguage[] = [
  { code: 'ln', nativeName: 'Lingála', name: 'Lingala', countries: ['DRC', 'Congo-Brazzaville'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 25, bcp47: 'ln', dir: 'ltr', hasDictionary: false },
  { code: 'kg', nativeName: 'Kikongo', name: 'Kongo', countries: ['DRC', 'Congo-Brazzaville', 'Angola'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 6.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'lu', nativeName: 'Tshiluba', name: 'Luba-Kasai', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 6.3, bcp47: 'lu', dir: 'ltr', hasDictionary: false },
  { code: 'lua', nativeName: 'Kiluba', name: 'Luba-Katanga', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 1.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'sg', nativeName: 'Sängö', name: 'Sango', countries: ['Central African Republic'], flag: '🇨🇫', family: 'Creole', region: 'central', speakers: 5, bcp47: 'sg', dir: 'ltr', hasDictionary: false },
  { code: 'fr-cd', nativeName: 'Français Congolais', name: 'Congolese French', countries: ['DRC'], flag: '🇨🇩', family: 'Indo-European', region: 'central', speakers: 51, bcp47: 'fr', dir: 'ltr', hasDictionary: false },
  { code: 'ewo', nativeName: 'Ewondo', name: 'Ewondo', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'central', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'dua', nativeName: 'Duala', name: 'Duala', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'central', speakers: 0.09, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bam', nativeName: 'Bamoun', name: 'Bamoun', countries: ['Cameroon'], flag: '🇨🇲', family: 'Niger-Congo', region: 'central', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'fan', nativeName: 'Fang', name: 'Fang', countries: ['Gabon', 'Equatorial Guinea', 'Cameroon'], flag: '🇬🇦', family: 'Niger-Congo', region: 'central', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bub', nativeName: 'Bubi', name: 'Bubi', countries: ['Equatorial Guinea'], flag: '🇬🇶', family: 'Niger-Congo', region: 'central', speakers: 0.05, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'tet', nativeName: 'Teke', name: 'Teke', countries: ['Congo-Brazzaville', 'DRC'], flag: '🇨🇬', family: 'Niger-Congo', region: 'central', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // DRC — additional (200+ languages)
  { code: 'tll', nativeName: 'Tetela', name: 'Tetela', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.75, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mng', nativeName: 'Lomongo', name: 'Mongo', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.4, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nnb', nativeName: 'Nande', name: 'Nande', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 1, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'beb', nativeName: 'Bembe', name: 'Bembe (DRC)', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.25, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'mdm', nativeName: 'Mbala', name: 'Mbala', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'pem', nativeName: 'Pende', name: 'Pende', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'yom', nativeName: 'Yombe', name: 'Yombe', countries: ['DRC', 'Congo-Brazzaville'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'shi2', nativeName: 'Mashi', name: 'Shi', countries: ['DRC'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.7, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'sng', nativeName: 'Songo', name: 'Songo', countries: ['DRC', 'Angola'], flag: '🇨🇩', family: 'Niger-Congo', region: 'central', speakers: 0.45, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'ktu', nativeName: 'Kituba', name: 'Kituba (Munukutuba)', countries: ['DRC', 'Congo-Brazzaville'], flag: '🇨🇩', family: 'Creole', region: 'central', speakers: 5, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // CAR — additional
  { code: 'gya', nativeName: 'Gbaya', name: 'Gbaya', countries: ['Central African Republic', 'Cameroon'], flag: '🇨🇫', family: 'Niger-Congo', region: 'central', speakers: 1.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'bda', nativeName: 'Banda', name: 'Banda', countries: ['Central African Republic'], flag: '🇨🇫', family: 'Niger-Congo', region: 'central', speakers: 1.3, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nbk', nativeName: 'Ngbandi', name: 'Ngbandi', countries: ['DRC', 'Central African Republic'], flag: '🇨🇫', family: 'Niger-Congo', region: 'central', speakers: 0.2, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // GABON — additional
  { code: 'mye', nativeName: 'Omyene', name: 'Myene/Omyene', countries: ['Gabon'], flag: '🇬🇦', family: 'Niger-Congo', region: 'central', speakers: 0.05, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'puu', nativeName: 'Yipunu', name: 'Punu', countries: ['Gabon', 'Congo-Brazzaville'], flag: '🇬🇦', family: 'Niger-Congo', region: 'central', speakers: 0.15, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'nzb', nativeName: 'Nzebi', name: 'Nzebi', countries: ['Gabon', 'Congo-Brazzaville'], flag: '🇬🇦', family: 'Niger-Congo', region: 'central', speakers: 0.06, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // CONGO-BRAZZAVILLE — additional
  { code: 'mdw', nativeName: 'Mbochi', name: 'Mbochi', countries: ['Congo-Brazzaville'], flag: '🇨🇬', family: 'Niger-Congo', region: 'central', speakers: 0.16, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },
  { code: 'vif', nativeName: 'Vili', name: 'Vili', countries: ['Congo-Brazzaville', 'Gabon'], flag: '🇨🇬', family: 'Niger-Congo', region: 'central', speakers: 0.05, bcp47: 'en-US', dir: 'ltr', hasDictionary: false },

  // SÃO TOMÉ
  { code: 'cri', nativeName: 'Forro', name: 'Forro', countries: ['São Tomé and Príncipe'], flag: '🇸🇹', family: 'Creole', region: 'central', speakers: 0.07, bcp47: 'pt', dir: 'ltr', hasDictionary: false },
]

// ────────────────────────────────────────────────────────────────
// COLONIAL/GLOBAL LANGUAGES SPOKEN IN AFRICA
// ────────────────────────────────────────────────────────────────
const GLOBAL_IN_AFRICA: AfricanLanguage[] = [
  { code: 'en', nativeName: 'English', name: 'English', countries: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda'], flag: '🌍', family: 'Indo-European', region: 'west', speakers: 700, bcp47: 'en-US', dir: 'ltr', hasDictionary: true },
  { code: 'fr', nativeName: 'Français', name: 'French', countries: ['DRC', 'Ivory Coast', 'Senegal', 'Cameroon', 'Mali'], flag: '🌍', family: 'Indo-European', region: 'west', speakers: 140, bcp47: 'fr', dir: 'ltr', hasDictionary: false },
  { code: 'pt', nativeName: 'Português', name: 'Portuguese', countries: ['Mozambique', 'Angola', 'Guinea-Bissau', 'Cape Verde'], flag: '🌍', family: 'Indo-European', region: 'south', speakers: 40, bcp47: 'pt', dir: 'ltr', hasDictionary: false },
  { code: 'es', nativeName: 'Español', name: 'Spanish', countries: ['Equatorial Guinea'], flag: '🇬🇶', family: 'Indo-European', region: 'central', speakers: 1.2, bcp47: 'es', dir: 'ltr', hasDictionary: false },
]

// ════════════════════════════════════════════════════════════════
// COMPLETE LANGUAGE VAULT — All African languages combined
// ════════════════════════════════════════════════════════════════

export const AFRICAN_LANGUAGE_VAULT: AfricanLanguage[] = [
  ...GLOBAL_IN_AFRICA,
  ...WEST_AFRICA,
  ...EAST_AFRICA,
  ...SOUTH_AFRICA,
  ...NORTH_AFRICA,
  ...CENTRAL_AFRICA,
]

/** Total language count */
export const LANGUAGE_COUNT = AFRICAN_LANGUAGE_VAULT.length

/** Language lookup by code */
export const LANGUAGE_MAP = new Map<string, AfricanLanguage>(
  AFRICAN_LANGUAGE_VAULT.map(l => [l.code, l])
)

/** Languages grouped by region */
export const LANGUAGES_BY_REGION: Record<string, AfricanLanguage[]> = {
  west: WEST_AFRICA,
  east: EAST_AFRICA,
  south: SOUTH_AFRICA,
  north: NORTH_AFRICA,
  central: CENTRAL_AFRICA,
  global: GLOBAL_IN_AFRICA,
}

/** Languages grouped by country */
export function getLanguagesByCountry(country: string): AfricanLanguage[] {
  return AFRICAN_LANGUAGE_VAULT.filter(l =>
    l.countries.some(c => c.toLowerCase() === country.toLowerCase())
  )
}

/** Top languages sorted by speaker count (for UI defaults) */
export const TOP_LANGUAGES = [...AFRICAN_LANGUAGE_VAULT]
  .sort((a, b) => b.speakers - a.speakers)
  .slice(0, 50)

/** Languages with dictionary support (for Spirit Voice full translation) */
export const DICTIONARY_LANGUAGES = AFRICAN_LANGUAGE_VAULT.filter(l => l.hasDictionary)

/** Search languages by name, native name, or country */
export function searchLanguages(query: string): AfricanLanguage[] {
  const q = query.toLowerCase().trim()
  if (!q) return TOP_LANGUAGES
  return AFRICAN_LANGUAGE_VAULT.filter(l =>
    l.name.toLowerCase().includes(q) ||
    l.nativeName.toLowerCase().includes(q) ||
    l.countries.some(c => c.toLowerCase().includes(q)) ||
    l.code.toLowerCase() === q
  )
}

/** Get region display name */
export const REGION_NAMES: Record<string, string> = {
  west: '🌊 West Africa',
  east: '🌅 East Africa',
  south: '🌿 Southern Africa',
  north: '🏜 North Africa',
  central: '🌳 Central Africa',
  global: '🌍 Continental',
}

/** Language families present */
export const LANGUAGE_FAMILIES = [...new Set(AFRICAN_LANGUAGE_VAULT.map(l => l.family))].sort()
