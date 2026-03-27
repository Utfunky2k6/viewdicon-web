'use client'
import * as React from 'react'

interface OnlineParticipant {
  id: string
  name: string
  emoji: string
  status: 'live' | 'away' | 'offline'
  color: string
}

export function OnlineStrip() {
  const participants: OnlineParticipant[] = [
    { id: '1', name: 'Chioma', emoji: '🧺', status: 'live', color: 'rgba(224,123,0,0.15)' },
    { id: '2', name: 'Kofi', emoji: '🌾', status: 'live', color: 'rgba(26,124,62,0.15)' },
    { id: '3', name: 'Dr.Ngozi', emoji: '⚕️', status: 'live', color: 'rgba(3,105,161,0.15)' },
    { id: '4', name: 'Family', emoji: '🌳', status: 'live', color: 'rgba(124,58,237,0.15)' },
    { id: '5', name: 'Amara', emoji: '🎓', status: 'away', color: 'rgba(79,70,229,0.15)' },
    { id: '6', name: 'Bello', emoji: '⚽', status: 'live', color: 'rgba(157,23,77,0.15)' }
  ]

  return (
    <div className="flex gap-2.5 px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-white/5 flex-shrink-0">
      {participants.map(p => (
        <div key={p.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 group">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl relative border-[1.5px] transition-transform group-hover:scale-105"
            style={{ 
              background: p.color, 
              borderColor: p.color.replace('0.15', '0.4') 
            }}
          >
            {p.emoji}
            {p.status !== 'offline' && (
              <div 
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#060d07] ${
                  p.status === 'live' ? 'bg-[#4ade80]' : 'bg-[#f59e0b]'
                }`}
              />
            )}
          </div>
          <span className="text-[9px] text-white/45 max-w-[52px] text-center leading-tight font-semibold truncate">
            {p.name}
          </span>
        </div>
      ))}
    </div>
  )
}
