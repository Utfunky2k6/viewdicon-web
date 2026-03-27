'use client'
import * as React from 'react'

export function ChatListHeader() {
  const languages = ['EN', 'YO', 'IG', 'HA', 'SW', 'ZU', 'AR']
  const [activeLang, setActiveLang] = React.useState('EN')

  return (
    <div className="flex flex-col flex-shrink-0">
      <div className="bg-[#060d07] px-3.5 py-3 flex items-center justify-between">
        <h1 className="font-['Sora'] text-[22px] font-black text-[#f0f7f0]">
          Seso <em className="text-[#1a7c3e] not-italic">Chat</em>
        </h1>
        <div className="flex gap-2">
          {['🔍', '✏️', '⋮'].map((icon, i) => (
            <button key={i} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm cursor-pointer hover:bg-white/10 transition-colors">
              {icon}
            </button>
          ))}
        </div>
      </div>
      
      {/* Translator Global Bar */}
      <div className="bg-[#1a7c3e]/5 border-b border-[#1a7c3e]/10 px-3 py-1.5 flex items-center gap-1.5 overflow-hidden">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
        <span className="text-[9px] font-bold text-[#4ade80] tracking-widest uppercase flex-shrink-0">
          Spirit Voice Live
        </span>
        <div className="w-[1px] h-3.5 bg-white/10 flex-shrink-0 mx-0.5" />
        <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-2 py-0.5 rounded-sm text-[9px] font-bold transition-all flex-shrink-0 ${
                activeLang === lang ? 'bg-[#1a7c3e] text-white' : 'bg-white/5 text-white/30 hover:text-white/50'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <button className="text-[13px] flex-shrink-0 ml-1">🎙️</button>
      </div>
    </div>
  )
}
