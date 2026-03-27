// ── Canonical 20 Villages — single source of truth ────────────────────────
// All pages import from here. Never hard-code village data elsewhere.

export interface VillageRole {
  key: string
  name: string
  desc: string
}

export interface Village {
  id: string
  name: string
  ancientName: string      // Ancient African name (WANGARA, KEMET, etc.)
  nation: string           // Country flag emoji(s)
  nationFull: string       // Full country/empire name
  language: string         // Primary ancient language
  era: string              // Historical period
  meaning: string          // Meaning of the ancient name
  history: string          // Brief historical context
  guardianDesc: string     // Description of the guardian deity/spirit
  yoruba: string
  emoji: string
  color: string
  guardian: string
  category: 'economy' | 'people' | 'creative' | 'civic' | 'spirit'
  tagline: string
  roles: VillageRole[]
  holding?: boolean
  // computed gradient (generated below)
  gradient?: string
}

export const ALL_VILLAGES: Village[] = [
  {
    id: 'commerce', name: 'Commerce Village', yoruba: 'Ìlú Oníṣòwò',
    ancientName: 'WANGARA', nation: '🇲🇱🇬🇭🇸🇳', nationFull: 'Mali Empire · Ghana Empire · Senegambia',
    language: 'Manding / Dyula', era: '1200–1600 CE',
    meaning: 'The travelling merchants — the gold and salt traders who connected all of West Africa',
    history: 'The Wangara were a diaspora of Mande-speaking traders who created a vast commercial network across West Africa. Their expertise in gold trading from Bambuk and Bure made them indispensable intermediaries in the trans-Saharan trade. They established trade colonies across the region, bringing Islam and literacy alongside commerce.',
    guardianDesc: 'Anansi the Spider is the Akan deity of commerce, stories, and cunning intelligence from Ghana. He wove the first trade web across West Africa — outwitting gods to give stories and commerce to humanity. Every market stall carries his invisible thread.',
    emoji: '🧺', color: '#e07b00', guardian: 'Anansi', category: 'economy',
    tagline: 'The market that feeds the nation. Every trade, every stall, every deal.',
    roles: [
      { key:'market_vendor',  name:'Market Vendor / Mama Put Seller',       desc:'Physical market stall, roadside food seller, neighbourhood market trader across all 54 nations' },
      { key:'import_export',  name:'Import / Export Agent',                  desc:'Cross-border trade, customs clearing, freight forwarding, container logistics' },
      { key:'mobile_money',   name:'Mobile Money & POS Agent',               desc:'M-Pesa agent, POS operator, airtime vendor, cash transfer service, mobile wallet agent' },
      { key:'wholesale',      name:'Wholesaler / Bulk Distributor',          desc:'Bulk commodity trading, warehouse operations, supply to retailers across regions' },
      { key:'ecommerce',      name:'E-Commerce & Social Seller',             desc:'Jumia/Konga seller, TikTok shop, Instagram commerce, WhatsApp business trader' },
      { key:'forex',          name:'Bureau de Change / Forex Trader',        desc:'Currency exchange, international remittance, forex trading, hawala operations' },
      { key:'second_hand',    name:'Second-Hand Goods Dealer',               desc:'Bend-down boutique, Gikomba trader, mitumba clothing, refurbished electronics reseller' },
      { key:'auctioneer',     name:'Auctioneer / Commodity Broker',          desc:'Livestock auctioneer, grain broker, commodity exchange trader, real estate auction' },
    ]
  },
  {
    id: 'agriculture', name: 'Agriculture Village', yoruba: 'Ìlú Àgbẹ̀',
    ancientName: 'KEMET', nation: '🇪🇬🇸🇩🇪🇹', nationFull: 'Ancient Egypt · Nubia · Nile Valley',
    language: 'Ancient Egyptian / Coptic', era: '3100–30 BCE',
    meaning: 'The Black Land — named for the rich, dark fertile soil of the Nile Delta that sustained civilisation',
    history: 'Kemet, the ancient Egyptian name for their land, celebrated the black fertile soil of the Nile floods. Egypt pioneered systematic agriculture — irrigation canals, grain storage, crop rotation. The Nile Delta was the breadbasket of the ancient world, feeding empires from Rome to Persia.',
    guardianDesc: 'Osiris is the Ancient Egyptian god of agriculture, death, and resurrection. He is killed each year and rises again — like every harvest. He taught humanity to farm, to wait for the season, and to trust the soil. The Nile floods in his name.',
    emoji: '🌾', color: '#1a7c3e', guardian: 'Osiris', category: 'economy',
    tagline: 'The soil that feeds 1.4 billion souls.',
    roles: [
      { key:'crop_farmer',     name:'Crop Farmer',                           desc:'Smallholder and commercial farmer — maize, cassava, yam, sorghum, millet, rice, cocoa, coffee, tea, khat' },
      { key:'livestock',       name:'Pastoralist / Livestock Keeper',        desc:'Cattle herder (Fulani/Maasai), goat farmer, poultry farmer, dairy farmer, pig farmer, camel herder' },
      { key:'fisher',          name:'Artisanal Fisher / Aquaculture',        desc:'Lake Victoria fisher, Atlantic coastal fisherman, fish farmer, shrimp farmer, oyster grower' },
      { key:'agro_processor',  name:'Agro-Processor',                        desc:'Palm oil processor, cassava flour miller, groundnut paste maker, dairy processor, juice bottler' },
      { key:'irrigation',      name:'Irrigation & Water Engineer',           desc:'Borehole driller, canal builder, drip irrigation installer, dam maintenance, water harvesting' },
      { key:'seed_guardian',   name:'Seed Bank Guardian / Agronomist',       desc:'Heritage seed keeper, soil scientist, crop geneticist, agricultural extension officer' },
      { key:'rain_watcher',    name:'Rain Watcher / Weather Monitor',        desc:'Community climate observer, flood early warning officer, drought response coordinator, NDVI analyst' },
      { key:'farm_logistics',  name:'Farm-to-Market Coordinator',            desc:'Produce aggregator, cold chain manager, rural transport coordinator, warehouse receipt manager' },
    ]
  },
  {
    id: 'health', name: 'Health Village', yoruba: 'Ìlú Aláwọ̀ṣan',
    ancientName: 'WABET', nation: '🇪🇬🇸🇩🇰🇲', nationFull: 'Ancient Egypt · Nubia · Kingdom of Kush',
    language: 'Ancient Egyptian / Meroitic', era: '2000–400 BCE',
    meaning: 'The Pure Place — sacred healing sanctuaries where priests practiced medicine and performed purification rites',
    history: 'Wabet were the sacred purification chambers of ancient Egyptian temples, where healing priests performed rituals. Ancient Egypt produced the world\'s first medical papyri — the Ebers Papyrus (1550 BCE) describes over 700 remedies. African healers understood anatomy, surgery, and herbal medicine millennia before other civilisations.',
    guardianDesc: 'Sekhmet is the Ancient Egyptian lioness goddess of medicine and surgery. She causes disease and cures it — the divine paradox of healing. Her temple complexes were the world\'s first hospitals. She is the original healer — the patron of all who fight illness with knowledge.',
    emoji: '⚕️', color: '#0369a1', guardian: 'Sekhmet', category: 'people',
    tagline: 'Where bodies are healed and lives are saved.',
    roles: [
      { key:'doctor',          name:'Medical Doctor / Physician',          desc:'GP, specialist surgeon, gynaecologist, paediatrician, psychiatrist, oncologist, cardiologist across all African health systems' },
      { key:'nurse',           name:'Nurse / Birth Attendant',             desc:'Registered nurse, enrolled nurse, auxiliary nurse, skilled birth attendant, ward nurse, theatre nurse' },
      { key:'herbalist',       name:'Traditional Healer / Herbalist',      desc:'Sangoma (South Africa), Babalawo (Yoruba), Nganga (Bantu), Dibia (Igbo), Fetish priest (Ghana) — licensed practitioners' },
      { key:'community_health',name:'Community Health Worker',             desc:'Village health volunteer, vaccination outreach worker, malaria net distributor, HIV counsellor, nutrition educator' },
      { key:'pharmacist',      name:'Pharmacist / Drug Dispenser',         desc:'Hospital pharmacist, community pharmacy owner, NAFDAC agent, drug distribution officer, pharmaceutical rep' },
      { key:'mental_health',   name:'Mental Health Practitioner',          desc:'Clinical psychologist, trauma counsellor, substance abuse counsellor, safe-house guardian, social psychiatry worker' },
      { key:'lab_tech',        name:'Lab Scientist / Diagnostician',       desc:'Medical laboratory scientist, pathologist, radiology technician, haematologist, molecular diagnostics specialist' },
      { key:'midwife',         name:'Midwife / Certified Birth Attendant', desc:'Certified midwife, traditional birth attendant (TBA), postnatal care specialist, antenatal educator, maternal care coordinator' },
    ]
  },
  {
    id: 'education', name: 'Education Village', yoruba: 'Ìlú Ọmọ́wé',
    ancientName: 'SANKORE', nation: '🇲🇱🇳🇪🇸🇳', nationFull: 'Mali Empire · Songhai Empire · Senegambia',
    language: 'Arabic / Tamasheq / Bambara', era: '989–1600 CE',
    meaning: 'The Great Mosque-University of Timbuktu — one of the world\'s first universities with 25,000 students',
    history: 'Sankore Mosque in Timbuktu was one of three universities that made the city the intellectual capital of Africa. At its height it housed 25,000 students and 700,000 manuscripts. Scholars studied astronomy, mathematics, theology, law, medicine, and philosophy. It proves that African higher education preceded Oxford by centuries.',
    guardianDesc: 'Thoth is the Ancient Egyptian god of knowledge, writing, and wisdom. He invented hieroglyphics and gave writing to humanity. The scribe of the gods. The divine librarian who maintains all records of existence. All who transmit knowledge work under his gaze.',
    emoji: '🎓', color: '#4f46e5', guardian: 'Thoth', category: 'people',
    tagline: 'The village where minds are sharpened for Africa.',
    roles: [
      { key:'teacher',         name:'Classroom Teacher',                    desc:'Primary, secondary, and vocational school teacher across all 54 African nations including madrasas, mission schools, public and private' },
      { key:'lecturer',        name:'University Lecturer / Researcher',     desc:'Professor, associate lecturer, research fellow, PhD candidate, academic journal publisher, curriculum developer' },
      { key:'edtech',          name:'EdTech Developer / Digital Educator',  desc:'Learning app builder, online tutor, YouTube teacher, USSD learning system operator, radio school presenter' },
      { key:'librarian',       name:'Language Keeper / Linguist',           desc:'Mother tongue teacher, indigenous language preservationist, Swahili/Hausa/Amharic/Arabic language instructor, translator' },
      { key:'vocational',      name:'Vocational & Skills Trainer',          desc:'Artisan master, apprenticeship supervisor, TVET instructor, trade skills facilitator, entrepreneurship coach' },
      { key:'tutor',           name:'Community Tutor / Literacy Worker',    desc:'Adult literacy teacher, after-school programme operator, non-formal education facilitator, refugee camp educator' },
      { key:'researcher',      name:'Cultural Historian / Oral Archivist',  desc:'Griot, storyteller, museum educator, cultural practices analyst, oral tradition archivist, folklore documenter' },
      { key:'school_admin',    name:'School Administrator / Special Needs', desc:'School principal, special needs educator, inclusive education specialist, sign language interpreter, school office manager' },
    ]
  },
  {
    id: 'arts', name: 'Arts Village', yoruba: 'Ìlú Akéwì',
    ancientName: 'NOK', nation: '🇳🇬🇨🇲🇧🇯', nationFull: 'Nigeria · Cameroon · Benin · Ancient Niger Valley',
    language: 'Proto-Afroasiatic / Nok languages', era: '1500 BCE–500 CE',
    meaning: 'The ancient terracotta-making civilisation of central Nigeria — Africa\'s earliest known figurative sculpture tradition',
    history: 'The Nok culture of central Nigeria produced some of Africa\'s oldest and most sophisticated art — terracotta figurines of extraordinary detail dated to 1500 BCE. Their artistry laid the foundation for the great bronze traditions of Ife and Benin. The Nok were the ancestors of African artistic mastery.',
    guardianDesc: 'Oya is the Yoruba goddess of storms, transformation, and creative power from Nigeria. She tears down old forms to make space for new creation. She destroys convention to build something new. The patron of all artists who refuse to produce what is expected.',
    emoji: '🎨', color: '#7c3aed', guardian: 'Oya', category: 'creative',
    tagline: 'Where Africa speaks in colour, rhythm, sound, and story.',
    roles: [
      { key:'musician',        name:'Musician / Griot / Oral Poet',         desc:'Afrobeats, highlife, makossa, bongo flava, soukous, ndombolo, mbalax, jùjú music, gnawa, kora player, mbira player, griot storyteller' },
      { key:'visual_artist',   name:'Visual Artist / Sculptor',             desc:'Painter, muralist, Oshogbo artist, Tingatinga artist, digital artist, traditional bronze caster, wood carver, stone sculptor' },
      { key:'filmmaker',       name:'Filmmaker / Animator',                 desc:'Nollywood director, Ghallywood producer, African animation creator, documentary filmmaker, short film director, TikTok filmmaker' },
      { key:'performer',       name:'Dancer / Choreographer',               desc:'Kpanlogo dancer, Adumu jumper (Maasai), Agbadza dancer, pantsula, gwara gwara, azonto, sabar, traditional court dancer' },
      { key:'writer',          name:'Author / Poet / Playwright',           desc:"Novelist, short story writer, spoken word artist, playwright, screenwriter, comic book creator, children's book author in African languages" },
      { key:'craftsman',       name:'Master Artisan / Craft Maker',         desc:'Kente weaver, adinkra stamper, beadwork artist, calabash carver, bogolan (mudcloth) maker, Moroccan zellige craftsman, Maasai bead worker' },
      { key:'fashion_designer',name:'Photographer / Visual Journalist',     desc:'Portrait photographer, documentary photographer, wedding photographer, fashion photographer, photojournalist, drone aerial photographer' },
      { key:'cultural',        name:'Theatre Practitioner / Cultural Worker',desc:'Stage actor, community theatre director, puppet theatre maker, Koteba performer (Mali), theatre for development practitioner' },
    ]
  },
  {
    id: 'builders', name: 'Builders Village', yoruba: 'Ìlú Ọ̀nà',
    ancientName: 'MEROE', nation: '🇸🇩🇪🇹🇪🇷', nationFull: 'Kingdom of Kush · Nubia · Upper Sudan',
    language: 'Meroitic', era: '800 BCE–350 CE',
    meaning: 'The Iron City — capital of the Kingdom of Kush, builders of more pyramids than Egypt',
    history: 'Meroe was the capital of the Kingdom of Kush, which built over 200 pyramids — more than ancient Egypt. The Meroites were master iron smelters, with furnaces that supplied iron tools and weapons across sub-Saharan Africa. Their engineers built cities, temples, and monuments along the Nile that rivalled anything in the ancient world.',
    guardianDesc: 'Dedwen is the Ancient Nubian god of prosperity and construction from the Kingdom of Kush. The first patron of builders — he provided the incense burned when a new structure is consecrated. Every pyramid at Meroe was raised in his name. He blesses every foundation stone.',
    emoji: '🏗️', color: '#b45309', guardian: 'Dedwen', category: 'economy',
    tagline: 'The hands that raise the cities of tomorrow.',
    roles: [
      { key:'mason',           name:'Mason / Construction Labourer',        desc:'Site worker, bricklayer, concrete mixer, block moulder, foundation digger — the majority workforce building African cities' },
      { key:'architect',       name:'Architect / Building Designer',        desc:'Building designer, structural engineer, housing architect, residential planner, commercial building architect' },
      { key:'electrician',     name:'Electrician / Solar Installer',        desc:'Building wiring, generator installation, solar panel mounting, transformer technician, street light installer' },
      { key:'plumber',         name:'Plumber / Water Technician',           desc:'Water pipe fitter, sanitation system builder, borehole pump installer, sewage treatment technician' },
      { key:'carpenter',       name:'Carpenter / Welder / Metalworker',     desc:'Furniture maker, steel fabricator, aluminium door and window maker, roofing contractor, iron bender' },
      { key:'surveyor',        name:'Interior Designer / Quantity Surveyor',desc:'Home decoration, office fit-out, hotel interior design, tiling specialist, painting contractor, quantity surveyor' },
      { key:'civil_eng',       name:'Civil Engineer / Infrastructure',      desc:'Road grading, tarmac laying, bridge construction, culvert installation, urban planning, dam builder, rural road maintenance' },
      { key:'heavy_machinery', name:'Heavy Machinery Operator / Developer', desc:'Bulldozer operator, crane operator, housing developer, affordable housing developer, estate developer, facility manager' },
    ]
  },
  {
    id: 'energy', name: 'Energy Village', yoruba: 'Ìlú Àṣẹ Iná',
    ancientName: 'INGA', nation: '🇨🇩🇨🇬🇦🇴', nationFull: 'Democratic Republic of Congo · Congo-Brazzaville · Angola',
    language: 'Lingala / Kikongo / Tshiluba', era: 'Ancient–Present',
    meaning: 'The great Inga Falls on the Congo River — the world\'s largest hydroelectric potential, enough to power all of Africa',
    history: 'The Inga Falls on the Congo River represents Africa\'s greatest energy reserve — with potential to generate 100,000 MW of electricity, enough to power the entire continent. The Congo River itself is the second most powerful river on Earth by discharge. Grand Inga is Africa\'s most ambitious infrastructure dream — the village that will light the continent.',
    guardianDesc: 'Nzambi Mpungu is the supreme creator of the Bakongo people of Congo DRC — the force that set the universe in motion. The original energy. The first power before time. The Congo River — the most powerful river on Earth — flows as his spine through the continent.',
    emoji: '⚡', color: '#b91c1c', guardian: 'Nzambi Mpungu', category: 'civic',
    tagline: "Powering Africa's sovereign future — from the grid to the sun.",
    roles: [
      { key:'solar_tech',      name:'Solar Installer / Off-Grid Technician', desc:'Rooftop solar, solar home system installer, mini-grid operator, pay-as-you-go solar agent (M-KOPA, d.light agents)' },
      { key:'electrical_eng',  name:'Power Grid Engineer / Utility Worker',  desc:'National grid maintenance, transformer installation, rural electrification engineer, KPLC/NEPA/ENEO utility worker' },
      { key:'oil_gas',         name:'Petroleum Engineer / Upstream Worker',  desc:'Oil and gas exploration, refinery operator, pipeline technician, drilling engineer, LPG distribution worker' },
      { key:'renewable',       name:'Battery Tech / Renewable Energy',       desc:'Battery bank installer, mini-grid storage manager, EV battery technician, wind turbine operator, renewable energy analyst' },
      { key:'utility',         name:'Energy Auditor / Efficiency Consultant',desc:'Building energy auditor, industrial energy efficiency consultant, carbon credit analyst, green building certifier' },
      { key:'biogas',          name:'Biomass / Biogas Practitioner',         desc:'Biogas plant operator, charcoal alternative producer, bioethanol producer, waste-to-energy plant worker, biomass cookstove distributor' },
      { key:'nuclear',         name:'Hydro Power Operator',                  desc:'Large dam operator (Akosombo, Kariba, Aswan), micro-hydro installer, run-of-river operator, tidal energy technician' },
      { key:'mini_grid',       name:'Mini-Grid Operator / Energy Policy',    desc:'NERC regulator, IRENA expert, energy ministry official, rural energy access planner, mini-grid development operator' },
    ]
  },
  {
    id: 'transport', name: 'Transport Village', yoruba: 'Ìlú Gbígbe',
    ancientName: 'KILWA', nation: '🇹🇿🇰🇪🇲🇿', nationFull: 'Kilwa Sultanate · Swahili Coast · East Africa',
    language: 'Swahili / Arabic', era: '900–1505 CE',
    meaning: 'The greatest trading port of medieval East Africa — hub of the Indian Ocean trade network connecting Africa to Arabia, India, and China',
    history: 'Kilwa Kisiwani was described by Ibn Battuta in 1331 as one of the most beautiful cities in the world. The Kilwa Sultanate controlled the gold trade from Zimbabwe to the Indian Ocean, creating a maritime trade empire. Its merchants connected Africa to Arabia, Persia, India, and China — the original global logistics network.',
    guardianDesc: 'Mami Wata is the Pan-African water spirit worshipped from West Africa to East Africa to the Caribbean Diaspora. Lady of the deep waters and all journeys between peoples. Every journey begins with her blessing. She rules all waters, all trade routes, all paths between markets.',
    emoji: '🚛', color: '#0891b2', guardian: 'Mami Wata', category: 'economy',
    tagline: 'Every road, every route, every sky, every sea.',
    roles: [
      { key:'driver',          name:'Road Driver / Commercial Haulier',     desc:'Danfo driver, matatu operator, tro-tro driver, inter-city bus driver, long-haul truck driver, tanker driver, school bus driver' },
      { key:'boda_boda',       name:'Motorcycle Taxi / Last-Mile Rider',    desc:'Okada (Nigeria), boda-boda (Uganda/Kenya), zemidjan (Benin), moto-taxi rider, bajaj tuk-tuk driver, delivery rider' },
      { key:'pilot',           name:'Aviation Professional',                desc:'Commercial pilot, air traffic controller, aircraft mechanic, flight attendant, cargo loader, airport ground crew, drone pilot' },
      { key:'marine',          name:'Marine Crew / River Transport',        desc:'Ferry operator, river boat captain, fishing vessel crew, lake transport worker, coastal cargo ship crew, port stevedore' },
      { key:'rail',            name:'Railway Crew / Train Operator',        desc:'Train driver, station master, ticket collector, railway maintenance engineer, SGR operator, heritage railway crew' },
      { key:'logistics',       name:'Logistics Coordinator / Dispatcher',   desc:'Fleet manager, route planner, warehouse logistics coordinator, supply chain analyst, last-mile delivery dispatcher' },
      { key:'mechanic',        name:'Vehicle Mechanic / Auto Technician',   desc:'Auto mechanic, truck fitter, motorcycle repairer, tyre fixer, roadside recovery operator, panel beater, auto electrician' },
      { key:'fleet_manager',   name:'Traffic Marshal / Fleet Manager',      desc:'LASTMA officer (Nigeria), traffic warden, road safety inspector, NTSA enforcement officer, fleet operations manager' },
    ]
  },
  {
    id: 'technology', name: 'Technology Village', yoruba: 'Ìlú Ìmọ̀ẹ̀rọ',
    ancientName: 'ALEXANDRIA', nation: '🇪🇬🇱🇾🇬🇷', nationFull: 'Ptolemaic Egypt · North Africa · Mediterranean',
    language: 'Ancient Greek / Coptic / Arabic', era: '300 BCE–642 CE',
    meaning: 'The Great Library of Alexandria — the ancient world\'s greatest repository of human knowledge and scientific discovery',
    history: 'The Library of Alexandria held an estimated 700,000 scrolls — the collected knowledge of the ancient world. It attracted the greatest minds of antiquity: Euclid, Archimedes, Eratosthenes (who calculated the Earth\'s circumference in 240 BCE). Alexandria was the original Silicon Valley — where African scholarship drove the world\'s technological advancement.',
    guardianDesc: 'Thoth is the Ancient Egyptian god of science, mathematics, and all systems of knowledge. The divine engineer — the first coder. He calculated the stars, invented mathematics, and designed the calendar. Every algorithm, every network, every system echoes his original cosmic architecture.',
    emoji: '💻', color: '#0f766e', guardian: 'Thoth', category: 'creative',
    tagline: "Africa's silicon savannahs. Code is the new cowrie.",
    roles: [
      { key:'developer',       name:'Software Developer / Engineer',        desc:'Frontend, backend, fullstack, mobile app developer — building African platforms, fintech, agritech, healthtech, edtech' },
      { key:'data_scientist',  name:'AI / ML / Data Scientist',             desc:'Machine learning engineer, data scientist, NLP researcher, computer vision expert, AI product builder for African markets' },
      { key:'cybersecurity',   name:'Cybersecurity Analyst / Ethical Hacker', desc:'Network security engineer, penetration tester, data protection officer, SIEM analyst, digital forensics expert' },
      { key:'cloud_eng',       name:'Cloud Engineer / DevOps',              desc:'AWS/Azure/GCP architect, Kubernetes engineer, CI/CD pipeline builder, site reliability engineer, infrastructure-as-code specialist' },
      { key:'network_eng',     name:'Telecom Engineer / Network Specialist',desc:'Mobile network engineer, fibre rollout technician, ISP operations engineer, BTS tower technician, spectrum engineer' },
      { key:'mobile_dev',      name:'Mobile / Blockchain Developer',        desc:'Smart contract developer, DeFi protocol builder, NFT platform creator, CBDC technical advisor, mobile app developer' },
      { key:'ux_designer',     name:'UX Designer / Hardware Engineer',      desc:'UX/UI designer, user researcher, electronics engineer, IoT device maker, embedded systems developer, robotics engineer' },
      { key:'tech_support',    name:'Tech Support / Product Manager',       desc:'Product manager for African tech products, tech support specialist, digital accessibility specialist, helpdesk operator' },
    ]
  },
  {
    id: 'media', name: 'Media Village', yoruba: 'Ìlú Ọ̀rọ̀',
    ancientName: 'TIMBUKTU', nation: '🇲🇱🇳🇪🇲🇷', nationFull: 'Mali Empire · Songhai Empire · Saharan Africa',
    language: 'Arabic / Bambara / Fulfulde / Tamasheq', era: '1000–1600 CE',
    meaning: 'The City of 333 Saints — the legendary centre of Islamic scholarship, manuscripts, and knowledge dissemination in Africa',
    history: 'Timbuktu held over 700,000 manuscripts on subjects ranging from astronomy and mathematics to history and music theory. The city was the printing press of medieval Africa, copying and distributing knowledge across the continent. Griots — the oral journalists of West Africa — preserved entire histories in memory and song for thousands of years.',
    guardianDesc: 'Kouyaté the Griot is the Mandinka royal genealogist from Guinea — the Kouyaté lineage has memorised and recited the oral history of the Mali Empire for 800 years without a written record. Can recite 700 years of dynasty from memory. The living newspaper. The walking archive. The voice that never dies.',
    emoji: '📰', color: '#6d28d9', guardian: 'Kouyaté the Griot', category: 'creative',
    tagline: 'The voice of the Motherland. Truth before power.',
    roles: [
      { key:'journalist',      name:'Print / Digital Journalist',           desc:'Newspaper reporter, online journalist, investigative journalist, data journalist, solutions journalist, press freedom advocate' },
      { key:'broadcaster',     name:'Radio / TV Broadcaster',               desc:'FM radio host, community radio presenter, television news anchor, talk show host, sports commentator, weather presenter' },
      { key:'photographer',    name:'Video Content Creator / Photographer', desc:'YouTube creator, TikTok creator, Instagram Reels producer, Jollof TV original creator, documentary photographer, photojournalist' },
      { key:'social_media',    name:'Podcaster / Social Media Specialist',  desc:'Podcast host, audio documentary maker, social media manager, Instagram/TikTok content strategist, Spotify Africa creator' },
      { key:'pr_officer',      name:'PR Officer / Visual Storyteller',      desc:'Public relations consultant, news photographer, documentary photographer, conflict zone visual journalist, brand communications director' },
      { key:'radio_host',      name:'Editor / Radio Host / Publisher',      desc:'News editor, sub-editor, fact-checker, media house publisher, digital news curator, newsletter publisher' },
      { key:'video_editor',    name:'Citizen Reporter / Video Editor',      desc:'Witness streamer, community blogger, WhatsApp broadcast journalist, video editor, post-production specialist, local news gatherer' },
      { key:'ad_creative',     name:'Advertising / Creative Director',      desc:'Brand manager, advertising creative, digital marketing specialist, media buyer, campaign manager, ad film director' },
    ]
  },
  {
    id: 'finance', name: 'Finance Village', yoruba: 'Ìlú Owó',
    ancientName: 'SIJILMASA', nation: '🇲🇦🇩🇿🇲🇷', nationFull: 'Morocco · Maghreb · Trans-Saharan Empire',
    language: 'Tamazight / Arabic', era: '757–1393 CE',
    meaning: 'The golden terminus of the trans-Saharan trade — where West African gold was exchanged for Mediterranean silver, the financial hub of medieval Africa',
    history: 'Sijilmasa was the northern terminus of the most profitable trade route in the medieval world. Gold from Ghana and Mali arrived here to be exchanged for salt, cloth, and Mediterranean goods. It was the bank of the ancient world — where African gold backed European economies. The cowrie shell traded here became Africa\'s first universal currency.',
    guardianDesc: 'Aje is the Yoruba goddess of wealth and marketplace fortune from Nigeria. She inhabits the marketplace and decides who prospers. She rewards those who treat money as a communal responsibility. She flows where commerce is honest and trade routes are protected.',
    emoji: '💰', color: '#047857', guardian: 'Aje', category: 'economy',
    tagline: 'The Cowrie flows where trust is earned.',
    roles: [
      { key:'banker',          name:'Bank Officer / Branch Manager',        desc:'Retail banking officer, SME lending manager, microfinance loan officer, bank teller, credit analyst — across African banking systems' },
      { key:'investment',      name:'Financial Analyst / Investment Manager',desc:'Equity analyst, portfolio manager, investment banker, asset manager, pension fund manager, stock broker, securities trader' },
      { key:'microfinance',    name:'Microfinance / VSLA Facilitator',      desc:'Susu collector (Ghana), esusu organiser (Nigeria), chama coordinator (Kenya), tontine facilitator (Francophone Africa), VSLA group leader' },
      { key:'fintech',         name:'Fintech Entrepreneur / Payment Specialist', desc:'Mobile money operator, payment gateway builder, digital lending platform founder, insurtech developer, remittance service operator' },
      { key:'accountant',      name:'Accountant / Auditor / Tax Consultant',desc:'Chartered accountant, management accountant, external auditor, tax practitioner, IFRS specialist, forensic accountant' },
      { key:'insurance',       name:'Insurance Agent / Actuary',            desc:'Life insurance agent, health insurance broker, crop insurance officer, microinsurance distributor, actuarial analyst' },
      { key:'tax_agent',       name:'Tax Agent / Crypto Expert',            desc:'Tax practitioner, cryptocurrency trader, DeFi yield farmer, CBDC implementation specialist, stablecoin economist' },
      { key:'ajo_keeper',      name:'Ajo Circle Keeper / Real Estate Finance', desc:'Ajo/esusu/chama organiser, mortgage banker, real estate investment trust manager, land valuation officer, property finance consultant' },
    ]
  },
  {
    id: 'justice', name: 'Justice Village', yoruba: 'Ìlú Ìdájọ́',
    ancientName: 'GACACA', nation: '🇷🇼🇧🇮🇨🇩', nationFull: 'Rwanda · Great Lakes Region · Central Africa',
    language: 'Kinyarwanda / Kirundi', era: 'Pre-colonial–2012 CE',
    meaning: 'Justice on the grass — the ancient Rwandan community court system where elders gathered on the grass to resolve disputes',
    history: 'Gacaca courts are one of Africa\'s most powerful examples of indigenous justice. Dating back centuries, this community-based system brought neighbours together to confess, confront, and reconcile. After the 1994 genocide, Rwanda revived Gacaca to process over 1.9 million cases — healing a nation through African restorative justice, not foreign court systems.',
    guardianDesc: 'Imana is the supreme moral authority in Rwandan spiritual tradition — the source of all goodness, truth, and justice. He cannot be bribed. He does not sleep. He sees every act of justice and injustice equally. He is present wherever people gather in good faith to resolve conflict.',
    emoji: '⚖️', color: '#4338ca', guardian: 'Imana', category: 'civic',
    tagline: 'Truth before power. The law serves the people.',
    roles: [
      { key:'lawyer',          name:'Lawyer / Advocate / Barrister',        desc:'Civil litigator, criminal defence lawyer, human rights lawyer, corporate lawyer, pro bono advocate, public interest lawyer across African jurisdictions' },
      { key:'magistrate',      name:'Judge / Magistrate / Arbitrator',      desc:'High court judge, magistrate court officer, traditional court chief, commercial arbitrator, family court judge, ECOWAS court official' },
      { key:'paralegal',       name:'Investigator / Anti-Corruption Officer',desc:'EFCC officer, ICPC investigator, SARS special agent, forensic investigator, financial crimes detective, Interpol African liaison' },
      { key:'mediator',        name:'Legal Aid Worker / Mediator',          desc:'Legal aid clinic worker, paralegal, access to justice advocate, community legal educator, court companion, legal literacy trainer' },
      { key:'human_rights',    name:'Human Rights Defender',                desc:"Human rights activist, NGO legal advocate, UN treaty body expert, refugee rights lawyer, press freedom defender, women's rights campaigner" },
      { key:'traditional',     name:'Traditional Justice Keeper',           desc:'Gacaca facilitator (Rwanda), community mediator, elder dispute resolver, ubuntu circle facilitator, customary law practitioner' },
      { key:'notary',          name:'Court Administrator / Notary',         desc:'Court registrar, judicial secretary, case management officer, court interpreter, notary public, process server' },
      { key:'prison_reform',   name:'Prison Reform / Corrections Officer',  desc:'Correctional officer, prison welfare worker, rehabilitation programme facilitator, re-entry support worker, juvenile justice officer' },
    ]
  },
  {
    id: 'government', name: 'Government Village', yoruba: 'Ìlú Aláṣẹ',
    ancientName: 'AKSUM', nation: '🇪🇹🇪🇷🇸🇩', nationFull: 'Aksumite Empire · Ethiopia · Horn of Africa',
    language: 'Ge\'ez / Amharic / Tigrinya', era: '100–960 CE',
    meaning: 'The great empire of the Horn of Africa — one of the four greatest civilisations of the ancient world alongside Rome, Persia, and China',
    history: 'The Aksumite Empire was described by a Persian writer as one of the four greatest powers on Earth. Aksum minted its own gold currency, built towering obelisks (stelae), controlled trade from the Red Sea to India, and was the first major empire to adopt Christianity as a state religion in 330 CE. It was the seat of African sovereign governance.',
    guardianDesc: 'Negus Negusti means "King of Kings" in Ge\'ez — the title of every Aksumite emperor of Ethiopia. Not a person but a principle: sovereign African governance that answers to no foreign power. The ruler who serves the people. The spirit that kept Ethiopia forever sovereign and uncolonised.',
    emoji: '🏛️', color: '#1e3a5f', guardian: 'Negus Negusti', category: 'civic',
    tagline: "The people's power, held in trust for all.",
    roles: [
      { key:'legislator',      name:'Elected Official / Political Leader',  desc:'Councillor, senator, member of parliament, governor, mayor, ward representative, continental union official, traditional ruler' },
      { key:'civil_servant',   name:'Civil Servant / Public Administrator', desc:'Ministry official, local government officer, district administrator, public sector manager, government secretary, permanent secretary' },
      { key:'diplomat',        name:'Diplomat / International Relations Officer', desc:'Ambassador, high commissioner, consular officer, AU representative, ECOWAS official, bilateral trade attaché, protocol officer' },
      { key:'urban_planner',   name:'Community Organiser / Urban Planner',  desc:"Ward development committee chair, urban planner, community development officer, civil society leader, budget analyst" },
      { key:'policy',          name:'Policy Analyst / Technocrat',          desc:'Government policy researcher, think-tank expert, ministerial advisor, national planning commission officer, statistics officer' },
      { key:'tax_collector',   name:'Traditional Ruler / Revenue Officer',  desc:'Oba, Emir, Chief, Okyenhene, revenue authority officer, tax collection specialist, customary governance custodian' },
      { key:'registrar',       name:'Public Finance Officer / Registrar',   desc:'Treasury officer, budget director, revenue authority officer, customs commissioner, public debt manager, registrar general' },
      { key:'elections',       name:'Electoral Officer / Democracy Worker', desc:'INEC/IEC/NEC officer, election observer, voter registration officer, returning officer, ballot processor, democracy watchdog' },
    ]
  },
  {
    id: 'security', name: 'Security Village', yoruba: 'Ìlú Jagunjagun',
    ancientName: 'AGOJIE', nation: '🇧🇯🇹🇬🇬🇭', nationFull: 'Kingdom of Dahomey · Benin · West Africa',
    language: 'Fon / Ewe / Yoruba', era: '1600–1900 CE',
    meaning: 'The Agojie — the all-female royal warriors of Dahomey, the world\'s most elite and feared military force of their era',
    history: 'The Agojie were the royal bodyguard and shock troops of the Kingdom of Dahomey. An all-female army of 6,000 warriors, they were the fiercest fighters in West Africa. Armed with machetes, muskets, and iron resolve, they fought in every Dahomean military campaign. European colonial armies feared them. They were the original warriors who proved African women were born to protect.',
    guardianDesc: 'Ogun is the Yoruba-Fon god of iron, war, and protection — worshipped from Nigeria to Cuba to Brazil to Haiti. The patron of soldiers, surgeons, police, and all who work with metal. He protects those who fight for what is right. He does not protect cowards. The Agojie invoked him before every battle.',
    emoji: '🛡️', color: '#374151', guardian: 'Ogun', category: 'civic',
    tagline: 'The guardian at every gate. Africa protects her own.',
    roles: [
      { key:'officer',         name:'Police Officer / Detective',           desc:'Community policing officer, CID detective, anti-robbery squad, SWAT operative, police reservist, neighbourhood watch commander' },
      { key:'cybersec',        name:'Military / Cyber Operations',          desc:'Army soldier, naval officer, air force pilot, peacekeeping operative (AMISOM, ECOMOG), military intelligence and cyber operations' },
      { key:'fire_safety',     name:'Fire & Rescue / Paramedic',            desc:'Firefighter, emergency medical technician, search and rescue operative, disaster response team member, ambulance crew' },
      { key:'border',          name:'Border Guard / Customs Officer',       desc:'Immigration officer, customs inspector, port security officer, border patrol agent, anti-smuggling officer, passport control officer' },
      { key:'private_sec',     name:'Private Security Agent / Guard',       desc:'Estate guard, bank security officer, event security, VIP protection agent, close protection officer, CCTV monitoring operator' },
      { key:'forensic',        name:'National Cybersecurity / Forensic',    desc:'National CERT officer, government cybersecurity analyst, digital crime investigator, critical infrastructure protector, forensic analyst' },
      { key:'community_watch', name:'Wildlife Ranger / Community Watch',    desc:'Anti-poaching ranger, national park warden, marine conservation officer, CITES enforcement officer, community game guard' },
      { key:'disaster',        name:'Emergency Management Officer',         desc:'NEMA officer, disaster risk reduction coordinator, flood relief manager, drought response officer, civil protection officer' },
    ]
  },
  {
    id: 'spirituality', name: 'Spirituality Village', yoruba: 'Ìlú Àwọn Amọ́nà',
    ancientName: 'KARNAK', nation: '🇪🇬🇸🇩🇪🇹', nationFull: 'Ancient Egypt · Nubia · Nile Valley',
    language: 'Ancient Egyptian / Coptic / Ge\'ez', era: '2055 BCE–400 CE',
    meaning: 'The Great Temple of Karnak — the largest religious complex ever built, centre of African spiritual life for over 2,000 years',
    history: 'Karnak was the most important temple complex in ancient Egypt — built over 2,000 years by 30 pharaohs. Its Hypostyle Hall with 134 massive columns remains one of humanity\'s greatest architectural achievements. The Temple of Karnak was the Vatican of the ancient African world — the spiritual heart of a civilisation that understood the divine more deeply than any that followed.',
    guardianDesc: 'Ifa / Orunmila is the Yoruba oracle system and deity of divination and destiny — declared a UNESCO Masterpiece of Oral Heritage. The 256 Odù form a body of oral literature larger than the Bible. Orunmila witnessed the creation of the world and knows every destiny that will unfold within it. Pan-African in reach.',
    emoji: '🙏', color: '#5b21b6', guardian: 'Ifa / Orunmila', category: 'spirit',
    tagline: 'Where the ancestors speak and the spirit is fed.',
    roles: [
      { key:'imam',             name:'Islamic Scholar / Imam / Marabout',   desc:'Mosque imam, Quran teacher, Islamic jurist, Sufi sheikh, marabout (West Africa), mufti, waqf administrator, Islamic finance scholar' },
      { key:'pastor',           name:'Christian Minister / Pastor / Priest',desc:'Pentecostal pastor, Catholic priest, Orthodox priest (Ethiopia/Egypt), Anglican minister, mission church leader, healing minister, apostle' },
      { key:'traditional_priest',name:'Traditional Priest / Spirit Medium', desc:"Babalawo (Yoruba), Sangoma (Zulu/Xhosa), Dibia (Igbo), Fetish priest (Ghana), Svikiro (Shona), N'anga (Zimbabwe), Wadaad (Somali)" },
      { key:'counselor',        name:'Spiritual Counsellor / Educator',     desc:'Religious counsellor, madrasa teacher, seminary lecturer, catechism instructor, pastoral care worker, spiritual direction minister' },
      { key:'healer',           name:'Spiritual Herbalist / Medicine Keeper',desc:'Sacred plant medicine keeper, ancestral healing practitioner, ritual cleansing specialist, protection charm maker, spiritual bath preparer' },
      { key:'meditation',       name:'Shrine Keeper / Sacred Site Guardian',desc:'Sacred grove keeper, ancestral shrine guardian, ritual ceremony facilitator, feast day organiser, libation pour master' },
      { key:'charity',          name:'Interfaith Peace Worker / Charity',   desc:'Interfaith dialogue facilitator, religious tolerance educator, faith-based conflict mediator, Salam/Shalom peace builder, faith charity coordinator' },
      { key:'funeral',          name:'Worship Leader / Funeral Minister',   desc:'Gospel musician, choir director, praise and worship leader, Islamic nasheed artist, funeral rites minister, liturgical music director' },
    ]
  },
  {
    id: 'sports', name: 'Sports Village', yoruba: 'Ìlú Eré',
    ancientName: 'NANDI', nation: '🇰🇪🇺🇬🇹🇿', nationFull: 'Nandi District · Kenya · East Africa',
    language: 'Nandi / Kalenjin', era: 'Pre-colonial–Present',
    meaning: 'The Nandi people of Kenya\'s Rift Valley — the greatest long-distance running community in human history',
    history: 'The Nandi and broader Kalenjin people of Kenya\'s Rift Valley have produced more world-class distance runners than any other community on Earth. At their peak, Nandi District alone produced more sub-2:10 marathon runners than the entire United States. Their dominance spans from Kipchoge to Kiptanui, from Komen to Cheruiyot — Africa\'s proof that human excellence is African excellence.',
    guardianDesc: 'Sango is the Yoruba-Fon god of thunder, lightning, and explosive athletic power — worshipped from Nigeria to Cuba to Brazil to Trinidad. The patron of athletes and warriors. His lightning is the speed of the sprint. His thunder is the crowd\'s roar at the finish line. He strikes fast. He never misses.',
    emoji: '⚽', color: '#9d174d', guardian: 'Sango', category: 'creative',
    tagline: 'Africa runs. Africa wins. Africa rises.',
    roles: [
      { key:'athlete',         name:'Footballer / Track & Field Athlete',   desc:'Professional football player, sprinter, marathon runner, long-distance runner (Ethiopian/Kenyan tradition), beach soccer player' },
      { key:'coach',           name:'Sports Coach / Physical Trainer',      desc:'Football coach, athletics coach, strength and conditioning coach, sports scientist, performance analyst, youth academy coach' },
      { key:'referee',         name:'Referee / Combat Athlete',             desc:'Match official, referee, boxer, wrestler (Senegalese laamb wrestling), MMA fighter, taekwondo, traditional African combat sports' },
      { key:'gym_owner',       name:'Team Sport Athlete / Gym Owner',       desc:'Basketball player, volleyball player, rugby player, gym owner, fitness centre manager, personal training studio operator' },
      { key:'scout',           name:'Sports Administrator / Scout',         desc:'Football association official, talent scout, national sports council officer, AFCON logistics coordinator, sports lawyer' },
      { key:'physio',          name:'Sports Physiotherapist / Medic',       desc:'Sports physiotherapist, team doctor, sports massage therapist, rehabilitation specialist, performance medicine practitioner' },
      { key:'esports',         name:'Esports Player / Gaming Creator',      desc:'Competitive gamer, game streamer, esports team manager, mobile gaming champion, African gaming tournament organiser' },
      { key:'sports_media',    name:'Sports Journalist / Commentator',      desc:'Sports broadcaster, match commentator, football analyst, sports writer, podcast host, social media sports content creator' },
    ]
  },
  {
    id: 'fashion', name: 'Fashion Village', yoruba: 'Ìlú Oníṣẹ́-Ọ̀wọ́',
    ancientName: 'BIDA', nation: '🇳🇬🇳🇪🇧🇯', nationFull: 'Nupe Kingdom · Nigeria · West Africa',
    language: 'Nupe / Hausa', era: '1000–1900 CE',
    meaning: 'The city of master craftsmen — Bida was renowned across West Africa for its extraordinary glass beadwork, brasswork, and hand-woven textiles',
    history: 'Bida, capital of the Nupe Kingdom in central Nigeria, was famous throughout West Africa for its artisans. Nupe glassworkers produced unique glass beads and vessels. Nupe brass-casters created the finest metalwork in the region. Their hand-woven strip cloth and embroidered robes were the fashion standard of the Sahel. Bida was the fashion capital of medieval West Africa.',
    guardianDesc: 'Osun is the Yoruba goddess of beauty, gold, honey, rivers, and all beautiful things — worshipped from Nigeria to Cuba to Brazil. Patron of fashion, jewellery, and everything that makes life beautiful rather than merely functional. She dresses in the finest things. All artisans of beauty answer to her.',
    emoji: '👗', color: '#c2410c', guardian: 'Osun', category: 'creative',
    tagline: 'Dressing Africa in its own glory — from kente to kitenge.',
    roles: [
      { key:'designer',        name:'Fashion Designer / Couturier',         desc:'High fashion designer, ready-to-wear label founder, traditional attire designer (agbada, boubou, kitenge suit, kaftan, shweshwe, kanga designer)' },
      { key:'tailor',          name:'Tailor / Seamstress / Fundi',          desc:'Custom clothing tailor, alterations expert, traditional garment maker, wedding dress maker, school uniform supplier, market tailor' },
      { key:'textile',         name:'Fabric Merchant / Textile Trader',     desc:'Ankara trader, kente cloth seller, adire tie-dye maker, bogolan mudcloth producer, kitenge importer, lace and aso-oke distributor' },
      { key:'stylist',         name:'Hair Stylist / Beauty Practitioner',   desc:'Natural hair stylist, loctician, braider, barber, MUA (makeup artist), nail technician, skincare specialist, waxing practitioner' },
      { key:'shoe_maker',      name:'Shoe Maker / Accessories Designer',    desc:'Cobbler, leather sandal maker, beaded jewellery designer, handbag maker, head wrap designer, traditional bead artist (Maasai, Zulu, Yoruba)' },
      { key:'model',           name:'Model / Fashion Photographer',         desc:'Editorial fashion photographer, runway model, fashion stylist, lookbook director, runway photographer, magazine cover photographer' },
      { key:'beauty',          name:'Fashion Retailer / Boutique Owner',    desc:'Boutique owner, online fashion store operator, thrift/vintage shop owner, fashion curator, mall fashion outlet manager' },
      { key:'jewelry',         name:'Jewellery Designer / Fashion Tech',    desc:'Sustainable textile innovator, jewellery designer, African fashion app developer, recycled fabric designer, fashion logistics operator' },
    ]
  },
  {
    id: 'family', name: 'Family Village', yoruba: 'Ìlú Ìdílé',
    ancientName: 'UBUNTU', nation: '🇿🇦🇿🇼🇿🇲', nationFull: 'Southern Africa · Nguni Peoples · Pan-Africa',
    language: 'Nguni / Zulu / Xhosa / Ndebele', era: 'Ancient–Present',
    meaning: 'Umuntu ngumuntu ngabantu — I am because we are. The philosophy that defines African humanity through relationship and community',
    history: 'Ubuntu is not just a word — it is the operating system of African civilisation. This ancient Nguni philosophy holds that personhood is achieved only through other people. Every African institution, from the village council to the extended family system, from communal land tenure to rotating savings clubs, runs on the Ubuntu principle that no one rises alone.',
    guardianDesc: 'Nana Buluku is the supreme androgynous creator in Fon/Ewe tradition from Benin Republic and Togo. Both mother and father. Both ancestor and descendant. The original parent of all — she birthed the divine twins who created the world. Every family circle that has ever existed is in her care.',
    emoji: '🏠', color: '#065f46', guardian: 'Nana Buluku', category: 'spirit',
    tagline: 'The root of every village is the family circle.',
    roles: [
      { key:'mediator',        name:'Family Counsellor / Mediator',         desc:'Marriage guidance counsellor, family therapist, divorce mediator, lobola/bride price negotiation facilitator, family conflict resolver' },
      { key:'child_care',      name:'Child Welfare Worker / Social Worker', desc:'Child protection officer, orphan care worker, foster care coordinator, street children outreach worker, child labour inspector' },
      { key:'adoption',        name:'Elderly Care Provider / Adoption',     desc:'Old age home staff, community elder support worker, dementia care specialist, adoption coordinator, foster care specialist' },
      { key:'homemaker',       name:'Early Childhood Educator / Homemaker', desc:'Crèche/ECD centre operator, nursery school teacher, play therapist, childminder, baby day care manager, homemaker' },
      { key:'elder',           name:"Women's Rights Advocate / Elder",      desc:"GBV prevention officer, femicide campaigner, FGM eradication worker, village elder, women's economic empowerment facilitator" },
      { key:'genealogist',     name:'Genealogist / Family Historian',       desc:'DNA ancestry researcher, oral family history keeper, clan tree documenter, African diaspora roots tracer, lineage verification specialist' },
      { key:'marriage',        name:'Marriage Coordinator / Dowry Negotiator', desc:'Traditional wedding planner, lobola/bride price negotiator, introduction ceremony coordinator, white wedding planner, nikah/church ceremony organiser' },
      { key:'youth_mentor',    name:'Youth Worker / Mentorship Leader',     desc:'Youth centre coordinator, boys/girls club leader, school counsellor, after-school mentor, gang diversion worker, youth entrepreneurship trainer' },
    ]
  },
  {
    id: 'hospitality', name: 'Hospitality Village', yoruba: 'Ìlú Àlejò',
    ancientName: 'TERANGA', nation: '🇸🇳🇬🇲🇬🇼', nationFull: 'Senegal · Gambia · Guinea-Bissau · Senegambia',
    language: 'Wolof / Fulfulde / Mandinka', era: 'Ancient–Present',
    meaning: 'The Wolof concept of hospitality — the sacred duty to welcome all strangers as honoured guests, feeding them before asking their name',
    history: 'Teranga is the soul of Senegalese culture — the practice of opening your home, your table, and your resources to any visitor without condition. In Wolof culture, a guest must be fed before being asked why they came. This ancient principle of radical generosity shaped all of West Africa\'s trade networks, built trust across ethnic lines, and is why Dakar became one of Africa\'s great cosmopolitan cities.',
    guardianDesc: 'Osun is the Yoruba river goddess of abundance and the open door — her rivers flow to every village. No one who arrives at her banks leaves thirsty or hungry. The spirit of the welcome that costs the host everything and enriches both giver and receiver. She is the divine hostess of the universe.',
    emoji: '🍽️', color: '#92400e', guardian: 'Osun', category: 'economy',
    tagline: 'No visitor leaves an African home hungry. Hospitality is our birthright.',
    roles: [
      { key:'hotel_manager',   name:'Hotel Manager / Lodge Operator',       desc:'Hotel general manager, guesthouse owner, safari lodge manager, Airbnb superhost, camping site operator, resort operations director' },
      { key:'chef',            name:'Chef / Cook / Street Food Vendor',     desc:'Restaurant chef, hotel executive chef, street food seller (suya, jollof, injera, bunny chow, thieboudienne), catering company cook, palace chef' },
      { key:'tour_guide',      name:'Tour Guide / Safari Guide',            desc:'Cultural heritage tour guide, game drive ranger, gorilla trekking guide, city walking tour guide, historical site interpreter, adventure tourism guide' },
      { key:'event_planner',   name:'Events Coordinator / Wedding Planner', desc:'Corporate events planner, wedding coordinator, festival organiser, conference manager, trade fair organiser, cultural event producer' },
      { key:'bartender',       name:'Bartender / Drink Specialist',         desc:'Hotel bar manager, craft spirits bartender, palm wine tapper, tej (Ethiopian honey wine) maker, cocktail innovator with African ingredients' },
      { key:'travel_agent',    name:'Travel Agent / Tourism Operator',      desc:'Package holiday designer, airline ticketing agent, visa facilitation officer, African diaspora roots tour operator, cruise booking specialist' },
      { key:'resort_manage',   name:'Hotel Receptionist / Resort Manager',  desc:'Front desk officer, guest relations manager, concierge, reservations specialist, hospitality customer service professional' },
      { key:'camp_host',       name:'Housekeeping Supervisor / Camp Host',  desc:'Hotel housekeeper, lodge facilities manager, cleaning supervisor, linen manager, property maintenance coordinator, camp host' },
    ]
  },
  {
    id: 'holdings', name: 'Holdings Village', yoruba: 'Ìlú Àbọ̀rìná',
    ancientName: 'ADULIS', nation: '🇪🇷🇪🇹🇩🇯', nationFull: 'Eritrea · Aksumite Empire · Red Sea Coast',
    language: 'Ge\'ez / Tigrinya / Afar', era: '600 BCE–700 CE',
    meaning: 'The great port of the Red Sea — gateway between Africa, Arabia, and India. The place where all paths converge before continuing their journey',
    history: 'Adulis was the most important port on the African Red Sea coast — the gateway through which goods, people, and ideas flowed between Africa, Arabia, Persia, and India. Every merchant, pilgrim, and traveller passed through Adulis before finding their ultimate destination. It was the original holding point — where the undecided rested before their journey revealed itself. A place of infinite possibility.',
    guardianDesc: 'Esu / Elegba is the Yoruba keeper of all crossroads and doorways — Pan-African, known as Legba in Fon tradition and Papa Legba in Haitian Vodou. Must be propitiated before any prayer reaches any other deity. He is the first spirit and the last — the one who opens every door and decides which journey begins. He guides all who stand at the threshold.',
    emoji: '🚪', color: '#6b7280', guardian: 'Esu / Elegba', category: 'spirit',
    tagline: 'The gate for those still finding their path. The Griot will guide you home.',
    holding: true,
    roles: [
      { key:'explorer',          name:'Explorer',                           desc:'Still discovering your craft and calling — the Griot AI is mapping your journey' },
      { key:'career_changer',    name:'Career Changer',                     desc:'Transitioning between industries — your new village is being identified' },
      { key:'new_graduate',      name:'New Graduate',                       desc:'Fresh from education — building skills before declaring a village' },
      { key:'entrepreneur',      name:'Entrepreneur in Formation',          desc:'Building an idea that does not yet fit one village — you may span multiple' },
      { key:'volunteer',         name:'Community Volunteer',                desc:'Serving the community while your craft finds its village' },
      { key:'multi_skilled',     name:'Multi-Skilled Worker',               desc:'Your work spans more than one village — the Griot will help you find your primary home' },
      { key:'navigator',         name:'Navigator',                          desc:'Using Griot AI guidance to find the right village match through conversation' },
      { key:'returning_citizen', name:'Returning Citizen',                  desc:'Re-entering the workforce or returning from abroad — your village assignment is being recalibrated' },
    ]
  },
]

// Village lookup by ID
export const VILLAGE_BY_ID = Object.fromEntries(ALL_VILLAGES.map(v => [v.id, v]))
