// ============================================================
// Heritage Verification Question Bank
// Used by Circle 2 (Diaspora African) onboarding to respectfully
// verify genuine African heritage through cultural knowledge.
// All facts are real and verified. Questions are designed to be
// passable by anyone with genuine African heritage or connection,
// not trivia buffs.
// ============================================================

export interface HeritageQuestion {
  id: string
  category: 'ancestry' | 'cultural_knowledge' | 'geographic' | 'linguistic' | 'historical' | 'culinary'
  question: string
  type: 'multiple_choice' | 'multi_select'
  options: string[]
  correctAnswers: number[]  // indices of correct options
  weight: number            // 5-20 points
  difficulty: 'easy' | 'medium' | 'hard'
}

// ── ANCESTRY QUESTIONS (self-reported connection — all answers score) ─────

const ANCESTRY_QUESTIONS: HeritageQuestion[] = [
  {
    id: 'anc-01',
    category: 'ancestry',
    question: 'How would you describe your connection to the African continent?',
    type: 'multiple_choice',
    options: [
      'Born and raised in Africa',
      'One or both parents are from Africa',
      'Grandparents or earlier generations from Africa',
      'Descended from the transatlantic diaspora (enslaved ancestors)',
      'Connected through marriage, adoption, or deep cultural immersion',
    ],
    correctAnswers: [0, 1, 2, 3, 4], // all valid — scored by weight
    weight: 15,
    difficulty: 'easy',
  },
  {
    id: 'anc-02',
    category: 'ancestry',
    question: 'Which regions of Africa do you trace your heritage to? (Select all that apply)',
    type: 'multi_select',
    options: [
      'West Africa (Nigeria, Ghana, Senegal, Mali, etc.)',
      'East Africa (Kenya, Ethiopia, Tanzania, Somalia, etc.)',
      'Southern Africa (South Africa, Zimbabwe, Mozambique, etc.)',
      'Central Africa (Congo, Cameroon, Gabon, etc.)',
      'North Africa (Egypt, Morocco, Tunisia, Algeria, etc.)',
      'I am not sure of the specific region',
    ],
    correctAnswers: [0, 1, 2, 3, 4, 5], // all valid
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'anc-03',
    category: 'ancestry',
    question: 'Have you participated in any African cultural practices or traditions?',
    type: 'multiple_choice',
    options: [
      'Yes, regularly — they are part of my daily or family life',
      'Yes, during family gatherings, holidays, or ceremonies',
      'Occasionally — I am reconnecting with my heritage',
      'Not yet, but I am actively learning and seeking connection',
      'I grew up with African cultural values passed down orally',
    ],
    correctAnswers: [0, 1, 2, 3, 4],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'anc-04',
    category: 'ancestry',
    question: 'What role does your African heritage play in your identity?',
    type: 'multiple_choice',
    options: [
      'It is the foundation of who I am',
      'It is a significant part of my identity alongside other influences',
      'I am rediscovering and reclaiming it',
      'I carry it through family stories, food, music, and values',
      'I feel a spiritual or ancestral pull that I am exploring',
    ],
    correctAnswers: [0, 1, 2, 3, 4],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'anc-05',
    category: 'ancestry',
    question: 'How was African heritage transmitted in your family?',
    type: 'multi_select',
    options: [
      'Through language — we speak an African language at home',
      'Through food — African dishes are part of our regular meals',
      'Through stories and oral history from elders',
      'Through music, dance, or artistic traditions',
      'Through religious or spiritual practices with African roots',
      'Through DNA testing or genealogy research',
    ],
    correctAnswers: [0, 1, 2, 3, 4, 5],
    weight: 10,
    difficulty: 'easy',
  },
]

// ── CULTURAL KNOWLEDGE QUESTIONS ─────────────────────────────

const CULTURAL_KNOWLEDGE_QUESTIONS: HeritageQuestion[] = [
  {
    id: 'cul-01',
    category: 'cultural_knowledge',
    question: 'What does "Ubuntu" mean in Southern African philosophy?',
    type: 'multiple_choice',
    options: [
      'A type of computer operating system',
      'I am because we are — a person is a person through other people',
      'The name of an ancient African kingdom',
      'A traditional harvest celebration',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'cul-02',
    category: 'cultural_knowledge',
    question: 'In many West African cultures, what typically happens on the naming day of a newborn child?',
    type: 'multiple_choice',
    options: [
      'The child is taken to a government office for registration',
      'An elder or spiritual leader gives the child a name with meaning, often honouring an ancestor',
      'The child chooses their own name at age seven',
      'Names are assigned randomly by the community chief',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'cul-03',
    category: 'cultural_knowledge',
    question: 'What is the significance of kola nut in many West African cultures?',
    type: 'multiple_choice',
    options: [
      'It is used exclusively as a cooking spice',
      'It is a symbol of hospitality and respect, often shared at gatherings and ceremonies',
      'It is a form of currency',
      'It is used only as medicine for fevers',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'medium',
  },
  {
    id: 'cul-04',
    category: 'cultural_knowledge',
    question: 'What are Adinkra symbols?',
    type: 'multiple_choice',
    options: [
      'Ancient Egyptian mathematical notation',
      'Visual symbols from the Akan people of Ghana that represent concepts and proverbs',
      'A writing system used across all of East Africa',
      'Decorative patterns with no particular meaning',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'medium',
  },
  {
    id: 'cul-05',
    category: 'cultural_knowledge',
    question: 'Which of these are traditional African spiritual or philosophical concepts? (Select all that apply)',
    type: 'multi_select',
    options: [
      'Ase / Ashe — the power to make things happen (Yoruba)',
      'Sankofa — learning from the past to move forward (Akan)',
      'Ujamaa — cooperative economics and familyhood (Swahili / Pan-African)',
      'Maat — truth, justice, and cosmic order (Kemetic / Ancient Egyptian)',
      'All of the above',
    ],
    correctAnswers: [0, 1, 2, 3],
    weight: 15,
    difficulty: 'medium',
  },
  {
    id: 'cul-06',
    category: 'cultural_knowledge',
    question: 'What is a "griot" in West African tradition?',
    type: 'multiple_choice',
    options: [
      'A type of drum used in ceremonies',
      'A hereditary storyteller, musician, and keeper of oral history',
      'A method of farming on river banks',
      'A martial art form from the Mandinka people',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
]

// ── GEOGRAPHIC QUESTIONS ─────────────────────────────────────

const GEOGRAPHIC_QUESTIONS: HeritageQuestion[] = [
  {
    id: 'geo-01',
    category: 'geographic',
    question: 'Which African river is the longest on the continent, flowing through northeastern Africa to the Mediterranean Sea?',
    type: 'multiple_choice',
    options: [
      'The Congo River',
      'The Niger River',
      'The Nile River',
      'The Zambezi River',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'geo-02',
    category: 'geographic',
    question: 'Mount Kilimanjaro, the tallest mountain in Africa, is located in which country?',
    type: 'multiple_choice',
    options: [
      'Kenya',
      'Tanzania',
      'Ethiopia',
      'Uganda',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'geo-03',
    category: 'geographic',
    question: 'Which body of water separates the African continent from the Arabian Peninsula?',
    type: 'multiple_choice',
    options: [
      'The Mediterranean Sea',
      'The Mozambique Channel',
      'The Red Sea',
      'Lake Victoria',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'medium',
  },
  {
    id: 'geo-04',
    category: 'geographic',
    question: 'Lagos, one of Africa\'s most populous cities, is located in which country?',
    type: 'multiple_choice',
    options: [
      'Ghana',
      'Nigeria',
      'Senegal',
      'Ivory Coast',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'geo-05',
    category: 'geographic',
    question: 'Which of these are landlocked African countries? (Select all that apply)',
    type: 'multi_select',
    options: [
      'Ethiopia',
      'Nigeria',
      'Rwanda',
      'Mali',
      'Kenya',
    ],
    correctAnswers: [0, 2, 3],
    weight: 15,
    difficulty: 'hard',
  },
]

// ── LINGUISTIC QUESTIONS ─────────────────────────────────────

const LINGUISTIC_QUESTIONS: HeritageQuestion[] = [
  {
    id: 'lng-01',
    category: 'linguistic',
    question: 'The greeting "Habari" (meaning "What is the news?") is associated with which widely spoken African language?',
    type: 'multiple_choice',
    options: [
      'Yoruba',
      'Swahili',
      'Zulu',
      'Amharic',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'lng-02',
    category: 'linguistic',
    question: 'What does "Sawubona" mean in Zulu?',
    type: 'multiple_choice',
    options: [
      'Goodbye',
      'Thank you',
      'I see you (a greeting of deep recognition)',
      'Welcome to my home',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'medium',
  },
  {
    id: 'lng-03',
    category: 'linguistic',
    question: 'Which of these is an African language family that includes Yoruba, Igbo, and Swahili?',
    type: 'multiple_choice',
    options: [
      'Indo-European',
      'Niger-Congo',
      'Sino-Tibetan',
      'Uralic',
    ],
    correctAnswers: [1],
    weight: 15,
    difficulty: 'hard',
  },
  {
    id: 'lng-04',
    category: 'linguistic',
    question: 'The greeting "Akwaaba" (meaning "Welcome") originates from which country?',
    type: 'multiple_choice',
    options: [
      'Nigeria',
      'South Africa',
      'Ghana',
      'Ethiopia',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'medium',
  },
  {
    id: 'lng-05',
    category: 'linguistic',
    question: 'Amharic, one of the few African languages with its own unique script (Ge\'ez), is the official language of which country?',
    type: 'multiple_choice',
    options: [
      'Somalia',
      'Eritrea',
      'Ethiopia',
      'Sudan',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'medium',
  },
]

// ── HISTORICAL QUESTIONS ─────────────────────────────────────

const HISTORICAL_QUESTIONS: HeritageQuestion[] = [
  {
    id: 'his-01',
    category: 'historical',
    question: 'The Mali Empire, one of the wealthiest in history, was founded by which legendary leader?',
    type: 'multiple_choice',
    options: [
      'Shaka Zulu',
      'Sundiata Keita',
      'Haile Selassie',
      'Mansa Musa',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'medium',
  },
  {
    id: 'his-02',
    category: 'historical',
    question: 'Which ancient African civilisation built the Great Pyramids of Giza?',
    type: 'multiple_choice',
    options: [
      'The Kingdom of Kush',
      'The Carthaginian Empire',
      'Ancient Egypt (Kemet)',
      'The Aksumite Empire',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'his-03',
    category: 'historical',
    question: 'Nelson Mandela spent 27 years in prison fighting against which system of racial segregation?',
    type: 'multiple_choice',
    options: [
      'Colonialism in Kenya',
      'Apartheid in South Africa',
      'The Biafran conflict',
      'Military rule in Nigeria',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'his-04',
    category: 'historical',
    question: 'The Organisation of African Unity (OAU), predecessor to the African Union, was founded in 1963 in which city?',
    type: 'multiple_choice',
    options: [
      'Nairobi, Kenya',
      'Accra, Ghana',
      'Addis Ababa, Ethiopia',
      'Cairo, Egypt',
    ],
    correctAnswers: [2],
    weight: 15,
    difficulty: 'hard',
  },
  {
    id: 'his-05',
    category: 'historical',
    question: 'Great Zimbabwe, the medieval stone city whose ruins still stand today, was built by ancestors of which people?',
    type: 'multiple_choice',
    options: [
      'The Zulu people',
      'The Shona people',
      'The Maasai people',
      'The Yoruba people',
    ],
    correctAnswers: [1],
    weight: 15,
    difficulty: 'hard',
  },
]

// ── CULINARY QUESTIONS ───────────────────────────────────────

const CULINARY_QUESTIONS: HeritageQuestion[] = [
  {
    id: 'cln-01',
    category: 'culinary',
    question: 'What is "fufu" traditionally made from?',
    type: 'multiple_choice',
    options: [
      'Rice and beans',
      'Pounded yam, cassava, or plantain — a starchy dough eaten with soup',
      'Ground peanuts and millet',
      'Wheat flour and water, like a flatbread',
    ],
    correctAnswers: [1],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'cln-02',
    category: 'culinary',
    question: 'Jollof rice, a beloved and widely debated dish, is most associated with which region of Africa?',
    type: 'multiple_choice',
    options: [
      'East Africa',
      'Southern Africa',
      'West Africa',
      'North Africa',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'cln-03',
    category: 'culinary',
    question: 'Injera, a spongy sourdough flatbread used as both plate and utensil, is a staple of which country\'s cuisine?',
    type: 'multiple_choice',
    options: [
      'Morocco',
      'Nigeria',
      'Ethiopia',
      'South Africa',
    ],
    correctAnswers: [2],
    weight: 10,
    difficulty: 'easy',
  },
  {
    id: 'cln-04',
    category: 'culinary',
    question: 'Which of these are traditional African foods or ingredients? (Select all that apply)',
    type: 'multi_select',
    options: [
      'Egusi (ground melon seeds used in West African soups)',
      'Biltong (dried cured meat from Southern Africa)',
      'Berbere (Ethiopian spice blend with chili, fenugreek, and more)',
      'Suya (spiced grilled meat skewers from West Africa)',
    ],
    correctAnswers: [0, 1, 2, 3],
    weight: 15,
    difficulty: 'medium',
  },
]

// ── COMBINED QUESTION BANK ───────────────────────────────────

export const HERITAGE_QUESTIONS: HeritageQuestion[] = [
  ...ANCESTRY_QUESTIONS,
  ...CULTURAL_KNOWLEDGE_QUESTIONS,
  ...GEOGRAPHIC_QUESTIONS,
  ...LINGUISTIC_QUESTIONS,
  ...HISTORICAL_QUESTIONS,
  ...CULINARY_QUESTIONS,
]

// ── CATEGORY HELPERS ─────────────────────────────────────────

type QuestionCategory = HeritageQuestion['category']

const ALL_CATEGORIES: QuestionCategory[] = [
  'ancestry',
  'cultural_knowledge',
  'geographic',
  'linguistic',
  'historical',
  'culinary',
]

function getQuestionsByCategory(category: QuestionCategory): HeritageQuestion[] {
  return HERITAGE_QUESTIONS.filter((q) => q.category === category)
}

/** Fisher-Yates shuffle (does not mutate original) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── QUESTION SELECTOR ────────────────────────────────────────

/**
 * Selects a balanced, randomised set of heritage questions.
 * Guarantees at least 1 question from each of the 6 categories,
 * then fills the remaining slots randomly from the full bank.
 *
 * @param count - Total questions to return (default 7, minimum 6)
 * @returns Array of HeritageQuestion
 */
export function selectHeritageQuestions(count = 7): HeritageQuestion[] {
  const target = Math.max(count, ALL_CATEGORIES.length)
  const selected: HeritageQuestion[] = []
  const usedIds = new Set<string>()

  // Phase 1: Guarantee one from each category
  for (const category of ALL_CATEGORIES) {
    const pool = shuffle(getQuestionsByCategory(category))
    const pick = pool[0]
    if (pick) {
      selected.push(pick)
      usedIds.add(pick.id)
    }
  }

  // Phase 2: Fill remaining slots from shuffled full bank
  if (selected.length < target) {
    const remaining = shuffle(
      HERITAGE_QUESTIONS.filter((q) => !usedIds.has(q.id))
    )
    for (const q of remaining) {
      if (selected.length >= target) break
      selected.push(q)
      usedIds.add(q.id)
    }
  }

  // Final shuffle so category order is not predictable
  return shuffle(selected)
}

// ── SCORING ──────────────────────────────────────────────────

export interface HeritageAnswer {
  questionId: string
  selectedIndices: number[]
}

export interface CategoryScore {
  category: QuestionCategory
  earned: number
  max: number
  percentage: number
  passed: boolean
}

export interface HeritageScoreResult {
  totalScore: number
  maxScore: number
  percentage: number
  categoryScores: CategoryScore[]
  passedCategories: number
  totalCategories: number
  passed: boolean
}

/**
 * Scores a set of heritage verification answers.
 *
 * Rules:
 * - ancestry questions ALWAYS award full weight (measuring connection, not correctness)
 * - multiple_choice: full weight if correct, 0 otherwise
 * - multi_select: proportional credit based on correct selections
 *   (each wrong selection deducts, but floor is 0)
 * - Passing: >= 55% total score AND at least 3 of 6 categories passed
 * - A category is "passed" if the user scores >= 50% within it
 */
export function scoreHeritageVerification(
  answers: HeritageAnswer[]
): HeritageScoreResult {
  const questionMap = new Map<string, HeritageQuestion>()
  for (const q of HERITAGE_QUESTIONS) {
    questionMap.set(q.id, q)
  }

  // Track per-category totals
  const categoryEarned: Record<string, number> = {}
  const categoryMax: Record<string, number> = {}
  for (const cat of ALL_CATEGORIES) {
    categoryEarned[cat] = 0
    categoryMax[cat] = 0
  }

  let totalScore = 0
  let maxScore = 0

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId)
    if (!question) continue

    const { weight, category } = question
    categoryMax[category] = (categoryMax[category] || 0) + weight
    maxScore += weight

    // Ancestry questions always award full weight
    if (category === 'ancestry') {
      totalScore += weight
      categoryEarned[category] = (categoryEarned[category] || 0) + weight
      continue
    }

    // Score knowledge-based questions
    const earned = scoreKnowledgeQuestion(question, answer.selectedIndices)
    totalScore += earned
    categoryEarned[category] = (categoryEarned[category] || 0) + earned
  }

  // Build per-category results
  const categoryScores: CategoryScore[] = ALL_CATEGORIES.map((cat) => {
    const earned = categoryEarned[cat] || 0
    const max = categoryMax[cat] || 0
    const pct = max > 0 ? Math.round((earned / max) * 100) : 0
    return {
      category: cat,
      earned,
      max,
      percentage: pct,
      passed: pct >= 50,
    }
  })

  const passedCategories = categoryScores.filter((c) => c.passed).length
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return {
    totalScore,
    maxScore,
    percentage,
    categoryScores,
    passedCategories,
    totalCategories: ALL_CATEGORIES.length,
    passed: percentage >= 55 && passedCategories >= 3,
  }
}

// ── INTERNAL: score a single knowledge question ──────────────

function scoreKnowledgeQuestion(
  question: HeritageQuestion,
  selectedIndices: number[]
): number {
  const { weight, type, correctAnswers } = question

  if (type === 'multiple_choice') {
    // Single selection: full points or nothing
    if (selectedIndices.length === 1 && correctAnswers.includes(selectedIndices[0])) {
      return weight
    }
    return 0
  }

  // multi_select: proportional scoring
  // +1 for each correct selection, -1 for each incorrect selection, floor 0
  const correctSet = new Set(correctAnswers)
  let hits = 0
  let misses = 0

  for (const idx of selectedIndices) {
    if (correctSet.has(idx)) {
      hits++
    } else {
      misses++
    }
  }

  const totalCorrect = correctAnswers.length
  if (totalCorrect === 0) return 0

  // Net score: proportion of correct answers found, penalised by wrong picks
  const netRatio = Math.max(0, (hits - misses) / totalCorrect)
  return Math.round(weight * netRatio)
}
