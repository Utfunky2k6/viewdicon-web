/**
 * Universal Constants for the AFRO Ceremony
 * Includes heritage groups, seasons, and country lists.
 */

export const HERITAGE_GROUPS = [
  { id:'yoruba',        emoji:'🌺', name:'Yoruba',        region:'West Africa',       note:'Nigeria · Benin · Togo' },
  { id:'igbo',          emoji:'🦅', name:'Igbo',          region:'West Africa',       note:'Nigeria · Cameroon' },
  { id:'hausa_fulani',  emoji:'🐪', name:'Hausa-Fulani',  region:'West Africa',       note:'Nigeria · Niger · Ghana' },
  { id:'akan',          emoji:'🥁', name:'Akan',          region:'West Africa',       note:'Ghana · Côte d\'Ivoire' },
  { id:'zulu',          emoji:'🛡️',  name:'Zulu',          region:'Southern Africa',   note:'South Africa' },
  { id:'xhosa',         emoji:'🌿', name:'Xhosa',         region:'Southern Africa',   note:'South Africa' },
  { id:'amhara',        emoji:'☀️', name:'Amhara',        region:'East Africa',       note:'Ethiopia' },
  { id:'somali',        emoji:'🌙', name:'Somali',        region:'East Africa',       note:'Somalia · Kenya · Ethiopia' },
  { id:'kikuyu',        emoji:'🌱', name:'Kikuyu',        region:'East Africa',       note:'Kenya' },
  { id:'wolof',         emoji:'🐬', name:'Wolof',         region:'West Africa',       note:'Senegal · Gambia' },
  { id:'mandinka',      emoji:'🌴', name:'Mandinka',      region:'West Africa',       note:'Gambia · Guinea · Mali' },
  { id:'ashanti',       emoji:'👑', name:'Ashanti',       region:'West Africa',       note:'Ghana' },
  { id:'ndebele',       emoji:'🎨', name:'Ndebele',       region:'Southern Africa',   note:'Zimbabwe · South Africa' },
  { id:'fulani',        emoji:'🐄', name:'Fulani',        region:'Across Africa',     note:'Sahel Belt' },
  { id:'swahili',       emoji:'⚓', name:'Swahili',       region:'East Africa',       note:'Tanzania · Kenya · Uganda' },
  { id:'hutu_tutsi',    emoji:'🌋', name:'Great Lakes',   region:'Central Africa',    note:'Rwanda · Burundi · DRC' },
  { id:'berber',        emoji:'🏔️', name:'Amazigh/Berber', region:'North Africa',    note:'Morocco · Algeria · Libya' },
  { id:'arabic',        emoji:'🌙', name:'Arab-African',  region:'North Africa',      note:'Egypt · Sudan · Mauritania' },
  { id:'diaspora',      emoji:'✈️', name:'African Diaspora', region:'Global',        note:'Caribbean · Americas · Europe' },
  { id:'mixed',         emoji:'🌍', name:'Mixed Heritage', region:'Pan-African',     note:'Multiple ancestral roots' },
]

export const SEASONS = [
  { id:'harmattan', emoji:'🌬️', name:'Harmattan',   months:'Nov – Feb', desc:'The dry, dusty winds from the Sahara' },
  { id:'rainy',     emoji:'🌧️', name:'Long Rains',   months:'Mar – Jun', desc:'The great rains that bring the harvest' },
  { id:'dry_heat',  emoji:'☀️', name:'Dry Heat',     months:'Jul – Sep', desc:'The blazing sun and heat of high summer' },
  { id:'short_rain',emoji:'🌦️', name:'Short Rains',  months:'Oct',       desc:'The brief rains before Harmattan returns' },
]

export const PROTECTIVE_MARKS = [
  '🦁 Lion', '🐘 Elephant', '🌿 Baobab', '🌊 River Spirit', '🦅 Eagle',
  '🔥 Sacred Fire', '⭐ Star Child', '🌙 Moon Child', '🐍 Serpent', '🦋 Butterfly',
  '🏔️ Mountain', '🌺 Hibiscus', '⚡ Thunder', '🌾 Golden Grain', '🌍 Earth Spirit',
]

export const AFRICAN_COUNTRIES = [
  'Nigeria','Ghana','Kenya','South Africa','Ethiopia','Egypt','Tanzania','Uganda',
  'Senegal','Cameroon','Côte d\'Ivoire','Morocco','Rwanda','Zimbabwe','Mali',
  'Burkina Faso','Niger','Guinea','Benin','Togo','Mozambique','Madagascar',
  'Zambia','Sierra Leone','Liberia','Eritrea','Somalia','Sudan','Chad','Congo',
  'Democratic Republic of Congo','Angola','Namibia','Botswana','Malawi','Lesotho',
  'Eswatini','Gabon','Equatorial Guinea','São Tomé','Cape Verde','Comoros',
  'Djibouti','Gambia','Guinea-Bissau','Libya','Algeria','Tunisia','Mauritania',
  'Mauritius','Seychelles','South Sudan','Central African Republic','Burundi',
]

export const WORLD_COUNTRIES = [
  ...AFRICAN_COUNTRIES,
  'United Kingdom','United States','Canada','France','Germany','Netherlands','Italy',
  'Brazil','Jamaica','Trinidad & Tobago','Spain','Portugal','Belgium','Sweden',
  'Norway','Denmark','Switzerland','Australia','New Zealand','India','China','Japan',
  'South Korea','Ireland','Austria','Poland','Czech Republic','Greece','Turkey',
  'Saudi Arabia','UAE','Qatar','Kuwait','Oman','Bahrain','Israel','Jordan','Lebanon',
  'Iraq','Pakistan','Bangladesh','Sri Lanka','Malaysia','Singapore','Indonesia',
  'Philippines','Thailand','Vietnam','Mexico','Colombia','Argentina','Chile','Peru',
  'Venezuela','Cuba','Haiti','Dominican Republic','Guyana','Suriname','Barbados',
  'Grenada','Bahamas','Russia','Ukraine','Georgia','Armenia','Azerbaijan','Kazakhstan',
].sort()

export type HSection = 'group' | 'seasons' | 'people' | 'path'

export const H_SECTIONS: { id:HSection; icon:string; title:string; quote:string; bg:string }[] = [
  { id:'group',   icon:'🌍', title:'Heritage Group',    quote:'"Select your ancestral lineage to tailor the ceremony."', bg:'#1a7c3e' },
  { id:'seasons', icon:'🌤️', title:'Your Seasons',      quote:'"Tell the season and year of your first cry."',           bg:'#d4a017' },
  { id:'people',  icon:'🛡️',  title:'Your People',       quote:'"Name your people and the mark that protects them."',    bg:'#3b82f6' },
  { id:'path',    icon:'📍',  title:'Your Present Path', quote:'"Where do you lay your head today?"',                    bg:'#8b5cf6' },
]

export const BIND_CHECKS = [
  { emoji:'📱', label:'Hardware Fingerprint', key:'hw' },
  { emoji:'🔒', label:'Sovereign Keys', key:'enc' },
  { emoji:'🌍', label:'Location Anchor', key:'loc' },
  { emoji:'🛡', label:'Tamper Shield', key:'tamp' },
]

export const CONFETTI_COLORS = ['#1a7c3e','#d4a017','#b22222','#4ade80','#e07b00','#3b82f6','#f472b6','#fff']
