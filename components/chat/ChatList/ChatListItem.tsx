'use client'
import * as React from 'react'
import { formatRelativeTime } from '@/lib/utils'

interface ChatListItemProps {
  id: string
  name: string
  lastMessage: string
  lastAt: string
  unread: number
  type: string
  trustTier: string
  avatarEmoji: string
  avatarColor: string
  onClick: (id: string) => void
}

export function ChatListItem({
  id,
  name,
  lastMessage,
  lastAt,
  unread,
  type,
  trustTier,
  avatarEmoji,
  avatarColor,
  onClick
}: ChatListItemProps) {
  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'INNER_FIRE': return 'text-[#ef4444] border-[#ef4444]/20 bg-[#ef4444]/5'
      case 'VILLAGE_CIRCLE': return 'text-[#1a7c3e] border-[#1a7c3e]/20 bg-[#1a7c3e]/5'
      case 'KINGDOM': return 'text-[#d4a017] border-[#d4a017]/20 bg-[#d4a017]/5'
      default: return 'text-white/40 border-white/5 bg-white/5'
    }
  }

  return (
    <div 
      onClick={() => onClick(id)}
      className="px-3 py-3.5 flex items-start gap-3 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors border-b border-white/5 last:border-none group"
    >
      <div 
        className="w-13 h-13 rounded-[15px] flex items-center justify-center text-2xl relative flex-shrink-0"
        style={{ 
          background: avatarColor,
          boxShadow: unread > 0 ? `0 0 15px ${avatarColor.replace('0.1', '0.3')}` : 'none'
        }}
      >
        {avatarEmoji}
        {unread > 0 && (
          <div className="absolute -top-1 -right-1 bg-[#1a7c3e] text-white text-[9px] font-black h-4.5 min-w-[18px] flex items-center justify-center rounded-full border-2 border-[#060d07] px-1">
            {unread}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="font-['Sora'] text-[14px] font-bold text-[#f0f7f0] group-hover:text-white transition-colors truncate">
            {name}
          </span>
          <span className="text-[9px] text-white/25 font-semibold">
            {formatRelativeTime(lastAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[8px] font-black tracking-tighter uppercase px-1.5 py-0.5 rounded-sm border whitespace-nowrap ${getTierColor(trustTier)}`}>
            {trustTier.replace('_', ' ')}
          </span>
          {type === 'BUSINESS_SESSION' && (
            <span className="text-[8px] font-black tracking-tighter uppercase px-1.5 py-0.5 rounded-sm border border-[#d48117]/20 bg-[#d48117]/5 text-[#d48117]">
              TRADE SESSION
            </span>
          )}
          {type === 'FAMILY_CIRCLE' && (
            <span className="text-[8px] font-black tracking-tighter uppercase px-1.5 py-0.5 rounded-sm border border-[#124b8f]/20 bg-[#124b8f]/5 text-[#4287f5]">
              KINSHIP SEALED
            </span>
          )}
        </div>

        <p className={`text-[12px] truncate transition-colors ${unread > 0 ? 'text-[#f0f7f0] font-medium' : 'text-white/40'}`}>
          {lastMessage}
        </p>
      </div>
    </div>
  )
}
