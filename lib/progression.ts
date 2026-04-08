/**
 * UFÈ Stage Progression Engine
 *
 * Station 1 — Alignment (72h): 40 questions, basic compatibility
 * Station 2 — Truth (5 days): 80 deeper questions, conflict detection
 * Station 3 — Commitment (14 days): Final 80 questions, family & future
 *
 * Failure at any stage = automatic exit.
 */

export type StationId = 1 | 2 | 3
export type StationStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED'

export interface StationDef {
  id: StationId
  name: string
  description: string
  questionRange: [number, number]
  questionCount: number
  durationHours: number
  durationLabel: string
  minCompatibility: number
  maxConflicts: number
  icon: string
}

export const STATIONS: StationDef[] = [
  {
    id: 1,
    name: 'Cultural Wall',
    description: 'Share cultural identity. Content-first discovery. Alignment check.',
    questionRange: [1, 40],
    questionCount: 40,
    durationHours: 72,
    durationLabel: '72 hours',
    minCompatibility: 50,
    maxConflicts: 3,
    icon: '🏛',
  },
  {
    id: 2,
    name: 'Guided Chat',
    description: 'Structured conversations. Deeper truth. Conflict detection.',
    questionRange: [41, 120],
    questionCount: 80,
    durationHours: 120,
    durationLabel: '5 days',
    minCompatibility: 65,
    maxConflicts: 5,
    icon: '💬',
  },
  {
    id: 3,
    name: 'Experience Layer',
    description: 'Virtual + real-world integration. Family & future planning.',
    questionRange: [121, 200],
    questionCount: 80,
    durationHours: 336,
    durationLabel: '14 days',
    minCompatibility: 75,
    maxConflicts: 3,
    icon: '💍',
  },
]

export interface StationState {
  stationId: StationId
  status: StationStatus
  startedAt: string | null
  completedAt: string | null
  questionsAnswered: number
  compatibilityScore: number
  conflictsDetected: number
  dealBreakersFound: number
  timeRemainingMs: number
}

export function getStationDef(id: StationId): StationDef {
  return STATIONS[id - 1]
}

export function calculateTimeRemaining(startedAt: string, durationHours: number): number {
  const start = new Date(startedAt).getTime()
  const end = start + durationHours * 60 * 60 * 1000
  return Math.max(0, end - Date.now())
}

export function evaluateStationProgress(state: StationState): StationStatus {
  const def = getStationDef(state.stationId)

  // Time expired?
  if (state.startedAt && state.timeRemainingMs <= 0 && state.status === 'ACTIVE') {
    return 'EXPIRED'
  }

  // Deal breakers found?
  if (state.dealBreakersFound > 0) return 'FAILED'

  // Too many conflicts?
  if (state.conflictsDetected > def.maxConflicts) return 'FAILED'

  // All questions answered and score meets threshold?
  if (state.questionsAnswered >= def.questionCount) {
    if (state.compatibilityScore >= def.minCompatibility) return 'COMPLETED'
    return 'FAILED'
  }

  return state.status
}

export function canAdvanceToStation(
  currentStation: StationId,
  states: StationState[]
): boolean {
  if (currentStation === 1) return true
  const prev = states.find(s => s.stationId === (currentStation - 1) as StationId)
  return prev?.status === 'COMPLETED'
}

export function getQuestionsForStation(stationId: StationId): [number, number] {
  return getStationDef(stationId).questionRange
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Expired'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  if (days > 0) return `${days}d ${remainingHours}h`
  if (hours > 0) return `${hours}h`
  const minutes = Math.floor(ms / (1000 * 60))
  return `${minutes}m`
}
