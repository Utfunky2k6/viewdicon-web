'use client'
import { create } from 'zustand'

interface NotifState {
  unreadCount: number
  unreadChat: number
  setUnreadCount: (n: number) => void
  setUnreadChat: (n: number) => void
  decrementUnread: () => void
}

export const useNotifStore = create<NotifState>()((set) => ({
  unreadCount: 3,
  unreadChat:  1,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setUnreadChat:  (unreadChat)  => set({ unreadChat }),
  decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
}))
