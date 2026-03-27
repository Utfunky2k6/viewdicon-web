import routingKeywordSource from '../shared/village-routing-keywords.json'
import { VILLAGE_MAP } from '@/constants/villages'

export interface RouteResult {
  villageId: string
  villageName: string
  villageEmoji: string
  villageYorubaName: string
  confidence: number
  griotExplanation: string
}

export const ROUTING_KEYWORDS = routingKeywordSource as Record<string, string[]>

export function routeToVillage(answers: string[]): RouteResult {
  const combined = answers.join(' ').toLowerCase()
  const scores: Record<string, number> = {}

  for (const [village, keywords] of Object.entries(ROUTING_KEYWORDS)) {
    scores[village] = keywords.filter((keyword) => combined.includes(keyword)).length
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [topVillage = 'holdings', topScore = 0] = sorted[0] ?? []
  const villageId = topScore > 0 ? topVillage : 'holdings'
  const confidence = Math.min(100, Math.round((topScore / 5) * 100))
  const village = VILLAGE_MAP[villageId] ?? VILLAGE_MAP.holdings

  return {
    villageId,
    villageName: village.name,
    villageEmoji: village.emoji,
    villageYorubaName: village.yorubaName,
    confidence,
    griotExplanation: topScore > 0
      ? `Based on what you shared, your work aligns with the ${village.name}.`
      : 'Your path is unique. The Griot needs more time to find your village. You will be placed in Holdings Village while we learn more about you.',
  }
}
