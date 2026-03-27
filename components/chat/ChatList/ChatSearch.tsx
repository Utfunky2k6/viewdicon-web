'use client'
import * as React from 'react'

export function ChatSearch() {
  return (
    <div className="bg-[#060d07] px-3 py-2 flex-shrink-0 relative">
      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm text-white/20 pointer-events-none">🔍</span>
      <input
        type="text"
        placeholder="Search whispers, villages, sessions..."
        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-[#f0f7f0] placeholder:text-white/20 outline-none focus:border-[#1a7c3e]/40 transition-all font-['Inter']"
      />
    </div>
  )
}
