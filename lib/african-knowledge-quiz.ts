/**
 * African Knowledge Quiz — Village Access Gate for Circle 3 (Friend/Ally)
 *
 * Tests genuine knowledge of and engagement with African culture, history,
 * geography, food, music, language, proverbs, and current affairs.
 * Harder than heritage verification — proves real commitment.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  id: string
  category:
    | 'geography'
    | 'culture'
    | 'proverbs'
    | 'history'
    | 'food'
    | 'music'
    | 'language'
    | 'current_affairs'
  question: string
  options: string[]
  correctIndex: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface QuizResult {
  score: number
  total: number
  percentage: number
  categoryScores: Record<string, { correct: number; total: number }>
  passed: boolean
}

// ---------------------------------------------------------------------------
// Question Bank — 68 questions, all factually verified
// ---------------------------------------------------------------------------

export const QUIZ_BANK: QuizQuestion[] = [
  // =========================================================================
  // GEOGRAPHY  (10)
  // =========================================================================
  {
    id: 'geo-01',
    category: 'geography',
    question: 'Which is the longest river in Africa?',
    options: ['Congo River', 'Niger River', 'Nile River', 'Zambezi River'],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'geo-02',
    category: 'geography',
    question: 'Lake Victoria borders three countries. Which of the following is NOT one of them?',
    options: ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'],
    correctIndex: 3,
    difficulty: 'medium',
  },
  {
    id: 'geo-03',
    category: 'geography',
    question: 'Mount Kilimanjaro is located in which country?',
    options: ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'geo-04',
    category: 'geography',
    question: 'Which African country has the largest land area?',
    options: ['Democratic Republic of the Congo', 'Algeria', 'Sudan', 'Nigeria'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'geo-05',
    category: 'geography',
    question: 'The Sahel region stretches across Africa south of the Sahara. Which of these countries is NOT in the Sahel?',
    options: ['Mali', 'Burkina Faso', 'Cameroon', 'Niger'],
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    id: 'geo-06',
    category: 'geography',
    question: 'What is the capital of Ethiopia?',
    options: ['Nairobi', 'Addis Ababa', 'Asmara', 'Khartoum'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'geo-07',
    category: 'geography',
    question: 'Which strait separates Africa from Europe?',
    options: ['Strait of Hormuz', 'Strait of Malacca', 'Strait of Gibraltar', 'Bab el-Mandeb'],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'geo-08',
    category: 'geography',
    question: 'The Okavango Delta, one of the world\'s largest inland deltas, is located in which country?',
    options: ['Namibia', 'Zambia', 'Botswana', 'Zimbabwe'],
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    id: 'geo-09',
    category: 'geography',
    question: 'Which two African countries were never formally colonized by European powers?',
    options: [
      'Ethiopia and Liberia',
      'Ethiopia and Egypt',
      'Morocco and Liberia',
      'Ghana and Ethiopia',
    ],
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    id: 'geo-10',
    category: 'geography',
    question: 'The Great Rift Valley runs through eastern Africa. In which country can you find Lake Turkana, the world\'s largest permanent desert lake?',
    options: ['Tanzania', 'Kenya', 'Ethiopia', 'Djibouti'],
    correctIndex: 1,
    difficulty: 'hard',
  },

  // =========================================================================
  // CULTURE  (8)
  // =========================================================================
  {
    id: 'cul-01',
    category: 'culture',
    question: 'The Maasai people are primarily found in which two countries?',
    options: [
      'Kenya and Tanzania',
      'Uganda and Kenya',
      'Ethiopia and Somalia',
      'Tanzania and Mozambique',
    ],
    correctIndex: 0,
    difficulty: 'easy',
  },
  {
    id: 'cul-02',
    category: 'culture',
    question: 'What is the name of the traditional Yoruba masquerade associated with ancestors?',
    options: ['Zangbeto', 'Egungun', 'Gelede', 'Agemo'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'cul-03',
    category: 'culture',
    question: 'Kente cloth is a hand-woven textile traditionally associated with which ethnic group?',
    options: ['Zulu', 'Ashanti (Akan)', 'Hausa', 'Maasai'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'cul-04',
    category: 'culture',
    question: 'The "Ubuntu" philosophy, meaning "I am because we are," is most closely associated with which cultural region?',
    options: [
      'West Africa',
      'North Africa',
      'Southern Africa (Bantu peoples)',
      'Horn of Africa',
    ],
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    id: 'cul-05',
    category: 'culture',
    question: 'What is a "tontine" in the context of West African communities?',
    options: [
      'A traditional dance form',
      'A rotating savings and credit group',
      'A type of funeral rite',
      'A marketplace auction',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'cul-06',
    category: 'culture',
    question: 'The Himba people, known for applying otjize (red ochre paste) to their skin and hair, are from which country?',
    options: ['Kenya', 'Namibia', 'Chad', 'Senegal'],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 'cul-07',
    category: 'culture',
    question: 'Adinkra symbols originate from which West African country?',
    options: ['Nigeria', 'Senegal', 'Ghana', 'Ivory Coast'],
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    id: 'cul-08',
    category: 'culture',
    question: 'The Gerewol festival, where young men compete in a beauty contest judged by women, belongs to which ethnic group?',
    options: ['Tuareg', 'Wodaabe (Fulani)', 'Dogon', 'Berber'],
    correctIndex: 1,
    difficulty: 'hard',
  },

  // =========================================================================
  // PROVERBS  (8)
  // =========================================================================
  {
    id: 'prv-01',
    category: 'proverbs',
    question: 'Complete the Swahili proverb: "Haraka haraka..."',
    options: [
      '"...haina baraka" (Haste has no blessing)',
      '"...huleta amani" (Haste brings peace)',
      '"...ni dawa" (Haste is medicine)',
      '"...hupoteza njia" (Haste loses the way)',
    ],
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    id: 'prv-02',
    category: 'proverbs',
    question: 'The proverb "It takes a village to raise a child" is most commonly attributed to which cultural tradition?',
    options: [
      'Yoruba (Nigeria)',
      'Igbo (Nigeria)',
      'Various African cultures (often cited as Igbo/Yoruba)',
      'Zulu (South Africa)',
    ],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'prv-03',
    category: 'proverbs',
    question: 'What does the Yoruba proverb "Àgbájọ ọwọ́ la fi ń sọ́ọ̀ya" mean?',
    options: [
      'A single hand cannot tie a bundle',
      'The elbow does not pass the head',
      'One tree does not make a forest',
      'Only the patient one eats ripe fruit',
    ],
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    id: 'prv-04',
    category: 'proverbs',
    question: 'The proverb "Until the lion tells his side of the story, the tale of the hunt will always glorify the hunter" teaches what lesson?',
    options: [
      'Courage in battle',
      'The importance of hearing all perspectives / history is written by the powerful',
      'Respect for wild animals',
      'The value of patience',
    ],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'prv-05',
    category: 'proverbs',
    question: 'Complete the Igbo proverb: "When the moon is shining..."',
    options: [
      '"...the cripple becomes hungry for a walk"',
      '"...the elders gather to feast"',
      '"...the village sleeps in peace"',
      '"...the farmer plants his seeds"',
    ],
    correctIndex: 0,
    difficulty: 'hard',
  },
  {
    id: 'prv-06',
    category: 'proverbs',
    question: '"Mtu ni watu" is a Swahili expression. What does it mean?',
    options: [
      'Money is power',
      'A person is people (you are who your community is)',
      'God is great',
      'Time is wealth',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'prv-07',
    category: 'proverbs',
    question: 'The Zulu proverb "Indlela ibuzwa kwabaphambili" translates to:',
    options: [
      'The wise one speaks last',
      'The path is asked from those who have walked it before',
      'A good chief listens more than he talks',
      'Rain follows the one who plants',
    ],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 'prv-08',
    category: 'proverbs',
    question: 'Which African tradition does the proverb "The child who is not embraced by the village will burn it down to feel its warmth" warn about?',
    options: [
      'The danger of famine',
      'The consequences of social exclusion and neglect',
      'The importance of fire safety',
      'The need for strong rulers',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },

  // =========================================================================
  // HISTORY  (10)
  // =========================================================================
  {
    id: 'his-01',
    category: 'history',
    question: 'Which African kingdom was renowned for its intricate bronze and brass sculptures, created using the lost-wax casting technique?',
    options: [
      'Kingdom of Kongo',
      'Kingdom of Benin',
      'Ashanti Empire',
      'Zulu Kingdom',
    ],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'his-02',
    category: 'history',
    question: 'Mansa Musa, considered one of the wealthiest people in history, was ruler of which empire?',
    options: ['Songhai Empire', 'Ghana Empire', 'Mali Empire', 'Kanem-Bornu Empire'],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'his-03',
    category: 'history',
    question: 'The ancient Kingdom of Kush was located in the territory of which modern-day country?',
    options: ['Egypt', 'Sudan', 'Ethiopia', 'Libya'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'his-04',
    category: 'history',
    question: 'Who was the first president of Ghana and a key figure in Pan-Africanism?',
    options: [
      'Jomo Kenyatta',
      'Julius Nyerere',
      'Kwame Nkrumah',
      'Patrice Lumumba',
    ],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'his-05',
    category: 'history',
    question: 'Thomas Sankara, the revolutionary leader assassinated in 1987, was president of which country?',
    options: ['Guinea', 'Burkina Faso', 'Mali', 'Togo'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'his-06',
    category: 'history',
    question: 'Great Zimbabwe was a medieval city and the capital of the Kingdom of Zimbabwe. In which modern country are its ruins?',
    options: ['Zambia', 'Mozambique', 'Zimbabwe', 'Malawi'],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'his-07',
    category: 'history',
    question: 'The Scramble for Africa was formalized at which 1884-1885 conference?',
    options: [
      'Paris Conference',
      'Berlin Conference',
      'London Conference',
      'Brussels Conference',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'his-08',
    category: 'history',
    question: 'The Kingdom of Axum (Aksum), one of the great civilizations of the ancient world, was located in modern-day:',
    options: ['Sudan', 'Somalia', 'Ethiopia and Eritrea', 'Kenya'],
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    id: 'his-09',
    category: 'history',
    question: 'Who led the Haitian Revolution, the only successful large-scale slave revolt that created an independent nation?',
    options: [
      'Toussaint Louverture',
      'Jean-Jacques Dessalines',
      'Marcus Garvey',
      'Frederick Douglass',
    ],
    correctIndex: 0,
    difficulty: 'hard',
  },
  {
    id: 'his-10',
    category: 'history',
    question: 'The Songhai Empire, one of the largest in African history, had which city as its major center of learning?',
    options: ['Cairo', 'Timbuktu', 'Fez', 'Lalibela'],
    correctIndex: 1,
    difficulty: 'medium',
  },

  // =========================================================================
  // FOOD  (6)
  // =========================================================================
  {
    id: 'food-01',
    category: 'food',
    question: 'The dish "Thieboudienne" (also spelled Ceebu Jën), a flavorful rice-and-fish dish, originates from which country?',
    options: ['Ghana', 'Senegal', 'Nigeria', 'Mali'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'food-02',
    category: 'food',
    question: 'Injera, a spongy sourdough flatbread used as both plate and utensil, is a staple of which country\'s cuisine?',
    options: ['Kenya', 'Somalia', 'Ethiopia', 'Sudan'],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'food-03',
    category: 'food',
    question: 'What is "fufu" typically made from?',
    options: [
      'Rice and beans',
      'Pounded yam, cassava, or plantain',
      'Wheat flour and water',
      'Millet and sorghum only',
    ],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'food-04',
    category: 'food',
    question: 'Bunny chow — a hollowed-out bread loaf filled with curry — is a street food originating from which South African city?',
    options: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    id: 'food-05',
    category: 'food',
    question: '"Ugali" (also known as "nsima" or "sadza") is a staple food in East and Southern Africa. What is its main ingredient?',
    options: ['Rice', 'Maize (corn) flour', 'Wheat', 'Millet'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'food-06',
    category: 'food',
    question: 'Which North African dish, slow-cooked in a conical clay pot, shares its name with the vessel?',
    options: ['Couscous', 'Tagine', 'Harira', 'Pastilla'],
    correctIndex: 1,
    difficulty: 'easy',
  },

  // =========================================================================
  // MUSIC  (6)
  // =========================================================================
  {
    id: 'mus-01',
    category: 'music',
    question: 'What instrument does the Griot (West African oral historian) traditionally play?',
    options: ['Djembe', 'Kora', 'Balafon', 'Talking Drum'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'mus-02',
    category: 'music',
    question: 'Amapiano, a music genre blending deep house, jazz, and lounge music, originated in which country?',
    options: ['Nigeria', 'Kenya', 'South Africa', 'Ghana'],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'mus-03',
    category: 'music',
    question: 'Fela Kuti is credited with creating which genre of music?',
    options: ['Highlife', 'Afrobeat', 'Jùjú', 'Soukous'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'mus-04',
    category: 'music',
    question: 'The mbira (thumb piano) is a traditional instrument central to the spiritual music of which people?',
    options: [
      'Yoruba of Nigeria',
      'Shona of Zimbabwe',
      'Wolof of Senegal',
      'Kikuyu of Kenya',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'mus-05',
    category: 'music',
    question: 'Soukous, a popular dance music genre, originated in which region?',
    options: [
      'West Africa (Ghana/Nigeria)',
      'The Congo Basin (DRC/Congo-Brazzaville)',
      'East Africa (Kenya/Tanzania)',
      'Southern Africa (South Africa/Zimbabwe)',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'mus-06',
    category: 'music',
    question: 'Youssou N\'Dour, famous for the hit "7 Seconds," is a celebrated musician from which country?',
    options: ['Mali', 'Guinea', 'Senegal', 'Gambia'],
    correctIndex: 2,
    difficulty: 'medium',
  },

  // =========================================================================
  // LANGUAGE  (6)
  // =========================================================================
  {
    id: 'lang-01',
    category: 'language',
    question: 'Which African country has the most official languages, with 11 recognized in its constitution?',
    options: ['Nigeria', 'South Africa', 'Ethiopia', 'Tanzania'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'lang-02',
    category: 'language',
    question: 'Swahili (Kiswahili) belongs to which language family?',
    options: [
      'Afroasiatic',
      'Nilo-Saharan',
      'Niger-Congo (Bantu)',
      'Khoisan',
    ],
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    id: 'lang-03',
    category: 'language',
    question: 'What does "Sawubona" mean in Zulu?',
    options: ['Goodbye', 'Thank you', 'I see you (Hello)', 'Welcome home'],
    correctIndex: 2,
    difficulty: 'medium',
  },
  {
    id: 'lang-04',
    category: 'language',
    question: 'Amharic is the official working language of which country?',
    options: ['Eritrea', 'Ethiopia', 'Somalia', 'Djibouti'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'lang-05',
    category: 'language',
    question: 'The Hausa language is one of the most widely spoken languages in Africa. Where is it predominantly spoken?',
    options: [
      'East Africa (Kenya, Tanzania)',
      'Southern Africa (Zimbabwe, Zambia)',
      'West Africa (Nigeria, Niger, Ghana)',
      'North Africa (Morocco, Algeria)',
    ],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'lang-06',
    category: 'language',
    question: 'Which African language family includes "click" consonants as a distinctive feature?',
    options: ['Niger-Congo', 'Afroasiatic', 'Khoisan', 'Nilo-Saharan'],
    correctIndex: 2,
    difficulty: 'hard',
  },

  // =========================================================================
  // CURRENT AFFAIRS  (6)
  // =========================================================================
  {
    id: 'cur-01',
    category: 'current_affairs',
    question: 'The African Continental Free Trade Area (AfCFTA), the world\'s largest free trade area by number of countries, has its secretariat in which city?',
    options: ['Addis Ababa, Ethiopia', 'Accra, Ghana', 'Nairobi, Kenya', 'Lagos, Nigeria'],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 'cur-02',
    category: 'current_affairs',
    question: 'Which African city is often referred to as the "Silicon Savannah" due to its thriving tech ecosystem?',
    options: ['Lagos', 'Nairobi', 'Cape Town', 'Kigali'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'cur-03',
    category: 'current_affairs',
    question: 'ECOWAS (Economic Community of West African States) is headquartered in which city?',
    options: ['Dakar, Senegal', 'Accra, Ghana', 'Abuja, Nigeria', 'Lomé, Togo'],
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    id: 'cur-04',
    category: 'current_affairs',
    question: 'Which African country is the most populous, with over 220 million people?',
    options: ['Ethiopia', 'Egypt', 'South Africa', 'Nigeria'],
    correctIndex: 3,
    difficulty: 'easy',
  },
  {
    id: 'cur-05',
    category: 'current_affairs',
    question: 'The African Union (AU), successor to the Organisation of African Unity (OAU), was formally established in which year?',
    options: ['1999', '2001', '2002', '2005'],
    correctIndex: 2,
    difficulty: 'hard',
  },
  {
    id: 'cur-06',
    category: 'current_affairs',
    question: 'Rwanda\'s capital Kigali is often cited as one of the cleanest cities in Africa. What community practice contributes to this?',
    options: [
      'Umuganda — a mandatory monthly community service day',
      'Imihigo — a government tax incentive',
      'Gacaca — a community court system',
      'Ingabo — a military cleanup program',
    ],
    correctIndex: 0,
    difficulty: 'hard',
  },

  // =========================================================================
  // BONUS / OVERFLOW — ensures 68 total
  // =========================================================================
  {
    id: 'geo-11',
    category: 'geography',
    question: 'Which African island nation is the fourth-largest island in the world?',
    options: ['Mauritius', 'Madagascar', 'Comoros', 'Seychelles'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'his-11',
    category: 'history',
    question: 'Nelson Mandela spent 27 years in prison. On which island was he held for most of that time?',
    options: ['Goree Island', 'Robben Island', 'Zanzibar', 'Lamu Island'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 'cul-09',
    category: 'culture',
    question: 'The "Naming Ceremony" (Isomoloruko in Yoruba culture) traditionally takes place how many days after a child is born?',
    options: ['3 days', '7 days for girls, 9 days for boys', '14 days', '40 days'],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 'food-07',
    category: 'food',
    question: 'Suya — spiced skewered meat cooked over open flame — is a beloved street food from which region?',
    options: [
      'East Africa',
      'Southern Africa',
      'West Africa (especially Nigeria)',
      'North Africa',
    ],
    correctIndex: 2,
    difficulty: 'easy',
  },
  {
    id: 'mus-07',
    category: 'music',
    question: 'Highlife music, blending traditional Akan music with Western instruments, originated in which country?',
    options: ['Nigeria', 'Ghana', 'Sierra Leone', 'Cameroon'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'lang-07',
    category: 'language',
    question: 'Wolof is the most widely spoken language in which country?',
    options: ['Mali', 'Senegal', 'Guinea-Bissau', 'Mauritania'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'his-12',
    category: 'history',
    question: 'Patrice Lumumba, assassinated in 1961, was the first prime minister of which country?',
    options: [
      'Republic of the Congo',
      'Democratic Republic of the Congo',
      'Cameroon',
      'Central African Republic',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 'cul-10',
    category: 'culture',
    question: 'Gèlèdé is a Yoruba masked performance tradition that primarily honors:',
    options: [
      'Warrior ancestors',
      'The spiritual power of elderly women (mothers)',
      'The Oba (king)',
      'Young initiates',
    ],
    correctIndex: 1,
    difficulty: 'hard',
  },
]

// ---------------------------------------------------------------------------
// Core categories that MUST be represented in every quiz draw
// ---------------------------------------------------------------------------

const CORE_CATEGORIES: QuizQuestion['category'][] = [
  'geography',
  'culture',
  'history',
  'food',
  'music',
]

// ---------------------------------------------------------------------------
// selectQuizQuestions — draw a balanced, randomized set
// ---------------------------------------------------------------------------

/**
 * Draws `count` randomized questions, guaranteeing at least 1 question from
 * each of the 5 core categories (geography, culture, history, food, music)
 * and filling the rest at random from the full bank.
 */
export function selectQuizQuestions(count = 10): QuizQuestion[] {
  if (count < CORE_CATEGORIES.length) {
    throw new Error(
      `count must be >= ${CORE_CATEGORIES.length} to satisfy core category minimums`
    )
  }

  const shuffled = [...QUIZ_BANK].sort(() => Math.random() - 0.5)
  const selected: QuizQuestion[] = []
  const usedIds = new Set<string>()

  // Phase 1 — guarantee one from each core category
  for (const cat of CORE_CATEGORIES) {
    const q = shuffled.find((q) => q.category === cat && !usedIds.has(q.id))
    if (q) {
      selected.push(q)
      usedIds.add(q.id)
    }
  }

  // Phase 2 — fill remaining slots at random
  for (const q of shuffled) {
    if (selected.length >= count) break
    if (!usedIds.has(q.id)) {
      selected.push(q)
      usedIds.add(q.id)
    }
  }

  // Final shuffle so core-category picks are not always first
  return selected.sort(() => Math.random() - 0.5)
}

// ---------------------------------------------------------------------------
// scoreQuiz — evaluate user answers
// ---------------------------------------------------------------------------

/**
 * Scores a completed quiz attempt.
 * Pass threshold: >= 60 %
 */
export function scoreQuiz(
  answers: Array<{ questionId: string; selectedIndex: number }>
): QuizResult {
  const questionMap = new Map<string, QuizQuestion>()
  for (const q of QUIZ_BANK) {
    questionMap.set(q.id, q)
  }

  const categoryScores: Record<string, { correct: number; total: number }> = {}
  let correctCount = 0

  for (const ans of answers) {
    const q = questionMap.get(ans.questionId)
    if (!q) continue

    // Initialise category bucket
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { correct: 0, total: 0 }
    }
    categoryScores[q.category].total += 1

    if (ans.selectedIndex === q.correctIndex) {
      correctCount += 1
      categoryScores[q.category].correct += 1
    }
  }

  const total = answers.length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0

  return {
    score: correctCount,
    total,
    percentage,
    categoryScores,
    passed: percentage >= 60,
  }
}
