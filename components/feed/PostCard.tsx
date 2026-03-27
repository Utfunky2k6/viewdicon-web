'use client'
// ============================================================
// PostCard — Universal post card switch by PostType
// Routes to the correct card component per post type
// ============================================================
import * as React from 'react'
import type { Post } from './feedTypes'
import { TextDrumCard } from './TextDrumCard'
import { MarketListingCard } from './MarketListingCard'
import { VoiceStoryCard } from './VoiceStoryCard'
import { ProverbChainCard } from './ProverbChainCard'
import { TradeProofCard } from './TradeProofCard'
import { OracleSessionCard } from './OracleSessionCard'
import { EventDrumCard } from './EventDrumCard'

interface PostCardProps {
  post: Post
  onInteract?: (type: string, postId: string) => void
  isNightMarket?: boolean
  onOpenVoicePlayer?: (post: Post) => void
}

export function PostCard({ post, onInteract, isNightMarket, onOpenVoicePlayer }: PostCardProps) {
  switch (post.type) {
    case 'MARKET_LISTING':
      return <MarketListingCard post={post} onInteract={onInteract} isNightMarket={isNightMarket} />
    case 'VOICE_STORY':
      return <VoiceStoryCard post={post} onInteract={onInteract} onOpenPlayer={onOpenVoicePlayer} />
    case 'PROVERB_CHAIN':
      return <ProverbChainCard post={post} onInteract={onInteract} />
    case 'TRADE_PROOF':
      return <TradeProofCard post={post} onInteract={onInteract} />
    case 'ORACLE_SESSION':
      return <OracleSessionCard post={post} onInteract={onInteract} />
    case 'EVENT_DRUM':
      return <EventDrumCard post={post} onInteract={onInteract} />
    case 'TEXT_DRUM':
    case 'BLOOD_CALL':
    case 'VILLAGE_NOTICE':
    case 'KILA_MOMENT':
    case 'GRIOT_WISDOM':
    default:
      return <TextDrumCard post={post} onInteract={onInteract} />
  }
}
