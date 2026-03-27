'use client'
import * as React from 'react'
import { formatRelativeTime } from '@/lib/utils'

interface MessageProps {
  id: string
  senderAfroId: string
  isMe: boolean
  type: 'TEXT' | 'VOICE_NOTE' | 'COWRIE_TRANSFER' | 'TRADE_SESSION_CARD' | 'PHOTO' | 'SYSTEM_EVENT'
  content?: string
  audioUrl?: string
  audioDuration?: number
  transcript?: string
  translations?: { [key: string]: string }
  cowrieAmount?: number
  cowrieStatus?: string
  sentAt: string
  senderRole?: 'BUYER' | 'SELLER' | 'RUNNER' | 'ELDER'
  skin?: 'default' | 'idile'
}

export function MessageBubble(props: MessageProps) {
  const { isMe, type, content, sentAt, senderRole, translations } = props
  const [showTranslation, setShowTranslation] = React.useState(false)

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'BUYER': return 'bg-[#1a7c3e]/10 text-[#1a7c3e] border-[#1a7c3e]/20'
      case 'SELLER': return 'bg-[#d48117]/10 text-[#d48117] border-[#d48117]/20'
      case 'RUNNER': return 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20'
      case 'ELDER': return 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20'
      default: return 'bg-white/5 text-white/40 border-white/10'
    }
  }

  if (type === 'SYSTEM_EVENT') {
    return (
      <div className="flex justify-center my-4 px-10 text-center">
        <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/40 font-bold uppercase tracking-widest">
          {content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 mb-5 ${isMe ? 'items-end' : 'items-start'}`}>
      {!isMe && senderRole && (
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm border uppercase tracking-tighter ml-2 ${getRoleBadge(senderRole)}`}>
          {senderRole}
        </span>
      )}
      
      <div className={`max-w-[85%] rounded-[20px] px-3.5 py-3.5 relative overflow-hidden group border transition-all duration-500 ${
        isMe 
          ? props.skin === 'idile' 
            ? 'bg-[#fbbf24] border-[#fbbf24]/20 text-[#2a1a00] rounded-tr-none shadow-[0_4px_15px_rgba(251,191,36,0.3)]'
            : 'bg-[#1a7c3e] border-[#1a7c3e]/20 text-[#f0f7f0] rounded-tr-none shadow-[0_4px_15px_rgba(26,124,62,0.15)]' 
          : props.skin === 'idile'
            ? 'bg-[#2a1033] border-[#fbbf24]/20 text-white rounded-tl-none'
            : 'bg-[#0d140e] border-white/10 text-white rounded-tl-none'
      }`}>
        {/* Type Specific Rendering */}
        {type === 'TEXT' && (
          <p className="text-[14px] leading-[1.55] font-['Inter'] font-medium whitespace-pre-wrap">
            {content}
          </p>
        )}

        {type === 'VOICE_NOTE' && (
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-sm">
              ▶️
            </button>
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-4 flex items-center gap-0.5">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-[#4ade80]/40 rounded-full" style={{ height: Math.random() * 100 + '%' }} />
                ))}
              </div>
              <span className="text-[9px] font-bold opacity-60 uppercase">{props.audioDuration}s · Spirit Voice Ready</span>
            </div>
          </div>
        )}

        {type === 'COWRIE_TRANSFER' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-black/20 rounded-xl p-3 border border-white/5">
              <span className="text-2xl">🐚</span>
              <div>
                <div className="text-[16px] font-black text-white">{props.cowrieAmount} Cowries</div>
                <div className="text-[9px] font-bold text-[#4ade80] uppercase tracking-wider">{props.cowrieStatus}</div>
              </div>
            </div>
          </div>
        )}

        {/* Translation Trigger */}
        {translations && !isMe && (
          <div className="mt-2.5 pt-2.5 border-t border-white/10">
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-[9px] font-black text-[#4ade80] uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {showTranslation ? 'Hide Original' : 'Translate with Spirit Voice'} 🎙️
            </button>
            {showTranslation && (
              <p className="mt-2 text-[13px] text-[#4ade80] font-medium leading-relaxed italic animate-slide-up">
                &ldquo;{translations.yo || translations.sw || 'Translation pending...'}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Timestamp & Status */}
        <div className={`mt-2 flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[9px] font-bold opacity-30 uppercase">{formatRelativeTime(sentAt)}</span>
          {isMe && <span className="text-[9px] opacity-30">✓✓</span>}
        </div>
      </div>
    </div>
  )
}
