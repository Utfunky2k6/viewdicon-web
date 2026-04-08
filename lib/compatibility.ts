/**
 * UFÈ Compatibility Scoring Engine
 * 
 * Weights adjusted for African context:
 * Cultural Alignment        30%
 * Family Structure Values   20%
 * Genotype Compatibility    20%
 * Spiritual Alignment       15%
 * Economic Philosophy       10%
 * Personality Chemistry      5%
 */

export interface CompatibilityWeights {
  cultural: number
  family: number
  genotype: number
  spiritual: number
  economic: number
  personality: number
}

export const DEFAULT_WEIGHTS: CompatibilityWeights = {
  cultural: 0.30,
  family: 0.20,
  genotype: 0.20,
  spiritual: 0.15,
  economic: 0.10,
  personality: 0.05,
}

export interface QuestionResponse {
  questionId: number
  selectedOption: string
  textResponse?: string
  answeredAt: string
}

export interface CompatibilityResult {
  overall: number
  breakdown: {
    cultural: number
    family: number
    genotype: number
    spiritual: number
    economic: number
    personality: number
  }
  dealBreakers: number[]
  conflicts: number[]
  recommendation: 'PROCEED' | 'CONDITIONAL' | 'STOP'
}

// Category to weight mapping
const CATEGORY_WEIGHT_MAP: Record<string, keyof CompatibilityWeights> = {
  'identity_values': 'cultural',
  'family_inlaws': 'family',
  'children_parenting': 'family',
  'money_assets': 'economic',
  'conflict_discipline': 'personality',
  'religion_spirituality': 'spiritual',
  'intimacy_boundaries': 'personality',
  'lifestyle_roles': 'cultural',
  'crisis_handling': 'personality',
  'legacy_future': 'cultural',
}

/**
 * Compare two users' answers and produce a compatibility score.
 */
export function calculateCompatibility(
  userA: QuestionResponse[],
  userB: QuestionResponse[],
  questions: { id: number; category: string; dealBreaker?: boolean; conflictFlag?: boolean }[],
  weights = DEFAULT_WEIGHTS
): CompatibilityResult {
  const breakdown = { cultural: 0, family: 0, genotype: 0, spiritual: 0, economic: 0, personality: 0 }
  const counts = { cultural: 0, family: 0, genotype: 0, spiritual: 0, economic: 0, personality: 0 }
  const dealBreakers: number[] = []
  const conflicts: number[] = []

  const bMap = new Map(userB.map(r => [r.questionId, r]))

  for (const a of userA) {
    const b = bMap.get(a.questionId)
    if (!b) continue

    const q = questions.find(qq => qq.id === a.questionId)
    if (!q) continue

    const weightKey = CATEGORY_WEIGHT_MAP[q.category] || 'personality'
    const match = a.selectedOption === b.selectedOption ? 1 : 0

    breakdown[weightKey] += match
    counts[weightKey] += 1

    if (!match && q.dealBreaker) dealBreakers.push(q.id)
    if (!match && q.conflictFlag) conflicts.push(q.id)
  }

  // Normalize each category to 0-100
  for (const key of Object.keys(breakdown) as (keyof CompatibilityWeights)[]) {
    breakdown[key] = counts[key] > 0 ? Math.round((breakdown[key] / counts[key]) * 100) : 0
  }

  // Weighted overall score
  const overall = Math.round(
    breakdown.cultural * weights.cultural +
    breakdown.family * weights.family +
    breakdown.genotype * weights.genotype +
    breakdown.spiritual * weights.spiritual +
    breakdown.economic * weights.economic +
    breakdown.personality * weights.personality
  )

  let recommendation: CompatibilityResult['recommendation'] = 'PROCEED'
  if (dealBreakers.length > 0) recommendation = 'STOP'
  else if (conflicts.length >= 5 || overall < 60) recommendation = 'CONDITIONAL'

  return { overall, breakdown, dealBreakers, conflicts, recommendation }
}

/**
 * Genotype compatibility check (critical for sickle cell).
 */
export function checkGenotypeCompatibility(
  genotypeA: string,
  genotypeB: string
): { compatible: boolean; risk: 'NONE' | 'LOW' | 'HIGH'; message: string } {
  const a = genotypeA.toUpperCase()
  const b = genotypeB.toUpperCase()

  if (a === 'AA' && b === 'AA') return { compatible: true, risk: 'NONE', message: 'Both AA — no sickle cell risk.' }
  if ((a === 'AA' && b === 'AS') || (a === 'AS' && b === 'AA')) return { compatible: true, risk: 'LOW', message: 'AA + AS — children may be carriers but no sickle cell disease.' }
  if (a === 'AS' && b === 'AS') return { compatible: false, risk: 'HIGH', message: 'AS + AS — 25% chance of SS children. Genetic counseling strongly recommended.' }
  if (a === 'SS' || b === 'SS') return { compatible: false, risk: 'HIGH', message: 'One partner is SS — high risk. Medical consultation required.' }
  if ((a === 'AS' && b === 'SC') || (a === 'SC' && b === 'AS')) return { compatible: false, risk: 'HIGH', message: 'AS + SC — significant risk. Genetic counseling required.' }

  return { compatible: true, risk: 'LOW', message: 'Genotype combination requires further medical consultation.' }
}
