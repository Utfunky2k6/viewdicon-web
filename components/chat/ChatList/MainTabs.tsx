'use client'
import * as React from 'react'

export type ChatTab = 'all' | 'requests' | 'trusted' | 'business'

interface MainTabsProps {
  activeTab: ChatTab
  setActiveTab: (tab: ChatTab) => void
  counts?: { [key: string]: number }
}

export function MainTabs({ activeTab, setActiveTab, counts = {} }: MainTabsProps) {
  const tabs: { id: ChatTab, label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'requests', label: 'Requests' },
    { id: 'trusted', label: 'Trusted' },
    { id: 'business', label: 'Business' }
  ]

  return (
    <div className="bg-[#060d07] flex border-b border-white/5 flex-shrink-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`group flex-1 py-2 text-[10px] font-bold uppercase tracking-wider relative transition-all border-b-2 ${
            activeTab === tab.id ? 'text-[#4ade80] border-[#1a7c3e]' : 'text-white/30 border-transparent hover:text-white/50'
          }`}
        >
          {tab.label}
          {counts[tab.id] > 0 && (
            <span className={`absolute top-1.5 right-1 rounded-full h-3.5 min-w-[14px] flex items-center justify-center text-[8px] font-black px-1 transition-transform group-hover:scale-110 ${
              tab.id === 'requests' ? 'bg-[#b22222] text-white' : 
              tab.id === 'business' ? 'bg-[#d4a017] text-[#111]' : 
              'bg-[#1a7c3e] text-white'
            }`}>
              {counts[tab.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
