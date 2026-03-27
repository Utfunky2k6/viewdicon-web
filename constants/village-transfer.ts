// ============================================================
// Village Transfer Rules & Constants
// ============================================================
// A villager cannot simply hop between villages at will.
// Every transfer requires a report, a cooling period, and —
// in some cases — elder review. The system honours the weight
// of belonging: you earned your place, and leaving must be
// deliberate. Students and Griot-guided transfers are lighter;
// multi-village operators carry the heaviest proof burden.
// ============================================================

export type TransferStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DENIED'
  | 'COOLING'
  | 'COMPLETED'

export type TransferReason =
  | 'CAREER_CHANGE'
  | 'SKILL_EVOLUTION'
  | 'LIFE_EVENT'
  | 'EDUCATION'
  | 'RETURNING_CITIZEN'
  | 'GRIOT_GUIDANCE'
  | 'MULTI_VILLAGE'
  | 'OTHER'

export interface TransferRule {
  reason: TransferReason
  label: string
  emoji: string
  minWaitDays: number
  expeditedDays: number
  requiresElder: boolean
  requiresReport: boolean
  description: string
}

// ── Transfer rules matrix ────────────────────────────────────
export const TRANSFER_RULES: TransferRule[] = [
  {
    reason: 'CAREER_CHANGE',
    label: 'Career Change',
    emoji: '\u{1F504}',
    minWaitDays: 180,
    expeditedDays: 30,
    requiresElder: true,
    requiresReport: true,
    description:
      'Your profession has changed and your current village no longer serves your craft.',
  },
  {
    reason: 'SKILL_EVOLUTION',
    label: 'Skill Evolution',
    emoji: '\u{1F4C8}',
    minWaitDays: 180,
    expeditedDays: 60,
    requiresElder: true,
    requiresReport: true,
    description:
      'Your skills have grown beyond what your current village offers. Time for a new home.',
  },
  {
    reason: 'LIFE_EVENT',
    label: 'Life Event',
    emoji: '\u{1F305}',
    minWaitDays: 180,
    expeditedDays: 14,
    requiresElder: false,
    requiresReport: true,
    description:
      'A major life change \u2014 marriage, relocation, health \u2014 requires a new village.',
  },
  {
    reason: 'EDUCATION',
    label: 'Education Complete',
    emoji: '\u{1F393}',
    minWaitDays: 0,
    expeditedDays: 0,
    requiresElder: false,
    requiresReport: true,
    description:
      'You completed studies or training and are ready to join the village of your new craft.',
  },
  {
    reason: 'RETURNING_CITIZEN',
    label: 'Returning Citizen',
    emoji: '\u{1F3E0}',
    minWaitDays: 90,
    expeditedDays: 14,
    requiresElder: false,
    requiresReport: true,
    description:
      'Returning from abroad or re-entering the workforce after a break.',
  },
  {
    reason: 'GRIOT_GUIDANCE',
    label: 'Griot AI Recommendation',
    emoji: '\u{1F985}',
    minWaitDays: 90,
    expeditedDays: 7,
    requiresElder: false,
    requiresReport: false,
    description:
      'The Griot AI has analyzed your activity and recommends a different village.',
  },
  {
    reason: 'MULTI_VILLAGE',
    label: 'Multi-Village Operator',
    emoji: '\u{1F310}',
    minWaitDays: 365,
    expeditedDays: 180,
    requiresElder: true,
    requiresReport: true,
    description:
      'Your work spans multiple villages. Request secondary village access.',
  },
  {
    reason: 'OTHER',
    label: 'Other Reason',
    emoji: '\u{1F4DD}',
    minWaitDays: 180,
    expeditedDays: 60,
    requiresElder: true,
    requiresReport: true,
    description: 'A unique circumstance not covered above.',
  },
]

// ── Transfer report template questions ───────────────────────
export const REPORT_QUESTIONS = [
  {
    key: 'current_experience',
    label: 'What have you achieved in your current village?',
    placeholder:
      'Describe your work, tools used, sessions completed, and impact\u2026',
    required: true,
    minLength: 50,
  },
  {
    key: 'reason_detail',
    label: 'Why do you want to join the new village?',
    placeholder:
      'Be specific about what draws you to this village and how it aligns with your path\u2026',
    required: true,
    minLength: 100,
  },
  {
    key: 'skills_transfer',
    label: 'What skills will you bring from your current village?',
    placeholder:
      'Cross-village skills are valued. How will your experience benefit the new village?',
    required: true,
    minLength: 30,
  },
  {
    key: 'commitment',
    label: 'What is your commitment plan for the new village?',
    placeholder:
      'Which roles interest you? Which tools will you use? How will you contribute?',
    required: false,
    minLength: 0,
  },
] as const

// ── Cooldown display labels ──────────────────────────────────
export const COOLDOWN_DISPLAY = {
  standard: {
    days: 180,
    label: '6 Moons',
    desc: 'Standard cooling period \u2014 6 months of reflection before transfer',
  },
  expedited: {
    days: 30,
    label: '1 Moon',
    desc: 'Fast-track for approved circumstances \u2014 1 month cooling',
  },
  student: {
    days: 0,
    label: 'Immediate',
    desc: 'Students with completed education can transfer without waiting',
  },
  griot: {
    days: 7,
    label: '7 Sunsets',
    desc: 'Griot AI recommendations take 7 days for village alignment',
  },
} as const

// ── Crest level bonuses ──────────────────────────────────────
// Higher crest = smoother transfer. Crest V elders auto-approve.
export const CREST_TRANSFER_BONUS: Record<
  string,
  { reduceDays: number; autoApprove: boolean }
> = {
  I: { reduceDays: 0, autoApprove: false },
  II: { reduceDays: 7, autoApprove: false },
  III: { reduceDays: 14, autoApprove: false },
  IV: { reduceDays: 30, autoApprove: false },
  V: { reduceDays: 60, autoApprove: true },
}

// ── Mock transfer history ────────────────────────────────────
export const MOCK_TRANSFERS = [
  {
    id: 'tr-001',
    from: { id: 'commerce', name: 'Commerce Village', emoji: '\u{1F9FA}' },
    to: { id: 'technology', name: 'Technology Village', emoji: '\u{1F4BB}' },
    reason: 'SKILL_EVOLUTION' as TransferReason,
    status: 'COMPLETED' as TransferStatus,
    submittedAt: '2025-08-15',
    completedAt: '2026-02-15',
    reportSummary:
      'After 2 years in Commerce, my coding skills became my primary income. The Griot confirmed technology is my true path.',
  },
  {
    id: 'tr-002',
    from: { id: 'education', name: 'Education Village', emoji: '\u{1F393}' },
    to: { id: 'health', name: 'Health Village', emoji: '\u2695' },
    reason: 'EDUCATION' as TransferReason,
    status: 'COMPLETED' as TransferStatus,
    submittedAt: '2026-01-10',
    completedAt: '2026-01-10',
    reportSummary:
      'Completed medical training. Transferred immediately as a student graduate.',
  },
]

// ── Helpers ──────────────────────────────────────────────────

export function getTransferRule(reason: TransferReason): TransferRule {
  return (
    TRANSFER_RULES.find((r) => r.reason === reason) ||
    TRANSFER_RULES[TRANSFER_RULES.length - 1]
  )
}

export function calculateCooldown(
  reason: TransferReason,
  crestLevel: string,
  isExpedited: boolean,
): { days: number; label: string } {
  const rule = getTransferRule(reason)
  const baseDays = isExpedited ? rule.expeditedDays : rule.minWaitDays
  const bonus = CREST_TRANSFER_BONUS[crestLevel] || CREST_TRANSFER_BONUS['I']
  const finalDays = Math.max(0, baseDays - bonus.reduceDays)

  if (finalDays === 0) return { days: 0, label: 'Immediate' }
  if (finalDays <= 7) return { days: finalDays, label: `${finalDays} Sunsets` }
  if (finalDays <= 30) return { days: finalDays, label: '1 Moon' }
  return { days: finalDays, label: `${Math.ceil(finalDays / 30)} Moons` }
}
