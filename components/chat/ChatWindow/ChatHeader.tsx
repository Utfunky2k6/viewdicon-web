'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

interface ChatHeaderProps {
  name: string
  emoji: string
  color: string
  trustTier: string
  type: string
}

export function ChatHeader({ name, emoji, color, trustTier, type }: ChatHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="bg-[#060d07] px-3.5 py-3 flex items-center gap-3 border-b border-white/5">
        <button 
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
        >
          ←
        </button>
        
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: color }}
        >
          {emoji}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-['Sora'] text-sm font-bold text-[#f0f7f0] truncate">{name}</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            <span className="text-[9px] font-bold text-[#4ade80]/60 uppercase tracking-widest leading-none">
              Presence Active
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {['📞', '📹', '⋮'].map((icon, i) => (
            <button key={i} className="text-lg opacity-40 hover:opacity-100 transition-opacity">
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Context Bar */}
      <div className="bg-white/5 px-4 py-1.5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">Security:</span>
          <span className="text-[9px] font-black text-[#1a7c3e] border border-[#1a7c3e]/20 bg-[#1a7c3e]/5 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
            {trustTier.replace('_', ' ')}
          </span>
          {type === 'BUSINESS_SESSION' && (
            <span className="text-[9px] font-black text-[#d48117] border border-[#d48117]/20 bg-[#d48117]/5 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
              TRADE ESCROW ACTIVE
            </span>
          )}
        </div>
        <div className="text-[10px] text-white/20 font-bold">
          E2E {Math.random() > 0.5 ? 'AES-256' : 'KYBER-512'}
        </div>
      </div>
    </div>
  )
}
