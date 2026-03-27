'use client'
import { create } from 'zustand'
import type { PotPost, PotState } from '@/types'

type FeedType = 'VILLAGE_HEARTH' | 'SORO_SOKE' | 'MARKET_CROSSROADS' | 'ANCESTOR_TREE'

interface FeedState {
  activeFeed: FeedType
  posts: PotPost[]
  isLoading: boolean
  setActiveFeed: (feed: FeedType) => void
  setPosts: (posts: PotPost[]) => void
  addPost: (post: PotPost) => void
  updatePostState: (postId: string, state: PotState, heatScore: number) => void
  reactToPost: (postId: string, action: 'KILA' | 'MWANGA') => void
}

export const useFeedStore = create<FeedState>()((set) => ({
  activeFeed: 'VILLAGE_HEARTH',
  posts: [],
  isLoading: false,
  setActiveFeed: (activeFeed) => set({ activeFeed }),
  setPosts:      (posts) => set({ posts }),
  addPost:       (post) => set((s) => ({ posts: [post, ...s.posts] })),
  updatePostState: (postId, state, heatScore) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, state, heatScore } : p
      ),
    })),
  reactToPost: (postId, action) =>
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p
        return {
          ...p,
          kilaCount:   action === 'KILA'   ? p.kilaCount   + 1 : p.kilaCount,
          mwangaCount: action === 'MWANGA' ? p.mwangaCount + 1 : p.mwangaCount,
        }
      }),
    })),
}))
