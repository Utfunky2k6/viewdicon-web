'use client'
import * as React from 'react'

interface ComposerProps {
  onSend: (text: string) => void
  onVoice: () => void
  onMedia: () => void
  type: string
  skin?: 'default' | 'idile'
}

export function Composer({ onSend, onVoice, onMedia, type, skin = 'default' }: ComposerProps) {
  const [text, setText] = React.useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div className="bg-[#060d07] px-3.5 py-3.5 border-t border-white/5 flex flex-col gap-3 flex-shrink-0 pb-[calc(14px+env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-2.5">
        <button 
          onClick={onMedia}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition-colors mb-0.5"
        >
          📎
        </button>
        
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Whisper something..."
            rows={1}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-4 pr-10 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#1a7c3e]/40 transition-all font-['Inter'] resize-none max-h-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button className="absolute right-3 bottom-2.5 text-lg opacity-40 hover:opacity-100">
            😊
          </button>
        </div>

        <button 
          onClick={text.trim() ? handleSend : onVoice}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all mb-0.5 ${
            text.trim() 
              ? (skin === 'idile' ? 'bg-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-[#1a7c3e] shadow-[0_0_15px_rgba(26,124,62,0.3)]')
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          {text.trim() ? '🏹' : '🎙️'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 whitespace-nowrap hover:bg-[#1a7c3e]/10 hover:border-[#1a7c3e]/20 hover:text-[#4ade80] transition-all uppercase tracking-wider">
          💸 Send Cowrie
        </button>
        {type === 'BUSINESS_SESSION' && (
          <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 whitespace-nowrap hover:bg-[#d48117]/10 hover:border-[#d48117]/20 hover:text-[#d48117] transition-all uppercase tracking-wider">
            ⚖️ Propose Trade
          </button>
        )}
        <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 whitespace-nowrap hover:bg-[#b22222]/10 hover:border-[#b22222]/20 hover:text-[#b22222] transition-all uppercase tracking-wider">
          🚨 Blood-Call
        </button>
        <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 whitespace-nowrap hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/20 hover:text-[#3b82f6] transition-all uppercase tracking-wider">
          📍 Share Path
        </button>
      </div>
    </div>
  )
}
