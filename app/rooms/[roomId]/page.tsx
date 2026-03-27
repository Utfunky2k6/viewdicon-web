'use client'
import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Fire Circle live room — voice + co-creation

const MOCK_ROOM = {
  id: 'r1',
  title: 'AfriTech Builders Standup',
  type: 'VOICE',
  village: 'Code Forge Lagos',
  topic: 'Shipping the mobile SDK this week',
  speakers: [
    { name: 'Amara Okonkwo', isSpeaking: true,  isMuted: false, emoji: '⚒️' },
    { name: 'Kofi Mensah',   isSpeaking: false, isMuted: false, emoji: '💻' },
    { name: 'Emeka Eze',     isSpeaking: false, isMuted: true,  emoji: '🎙️' },
  ],
  listeners: ['Zara', 'Fatima', 'Elder Taiwo', '+11 more'],
}

export default function RoomPage() {
  const params  = useParams()
  const router  = useRouter()
  const [muted, setMuted]         = React.useState(true)
  const [handRaised, setHandRaised] = React.useState(false)
  const [tipped, setTipped]       = React.useState(false)

  return (
    <div className="min-h-screen bg-bg-default flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white p-2"
        >
          ←
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-500">{MOCK_ROOM.village}</p>
          <h1 className="text-sm font-bold">{MOCK_ROOM.title}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-gray-400">
            {MOCK_ROOM.speakers.length + MOCK_ROOM.listeners.length} here
          </span>
        </div>
      </div>

      {/* Topic */}
      <div className="px-4 py-3 border-b border-border bg-bg-elevated">
        <p className="text-xs text-gray-400">Topic</p>
        <p className="text-sm text-white mt-0.5">{MOCK_ROOM.topic}</p>
      </div>

      {/* Speakers */}
      <div className="flex-1 px-4 py-6">
        <p className="text-xs font-medium text-gray-400 mb-4">🎙️ SPEAKERS</p>
        <div className="flex flex-wrap gap-4">
          {MOCK_ROOM.speakers.map((speaker) => (
            <div key={speaker.name} className="flex flex-col items-center gap-2 w-[80px]">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    speaker.isSpeaking
                      ? 'ring-2 ring-kente-gold ring-offset-2 ring-offset-bg-default'
                      : 'bg-bg-elevated border border-border'
                  }`}
                  style={speaker.isSpeaking ? { background: 'rgba(215,168,95,0.1)' } : {}}
                >
                  <Avatar name={speaker.name} size="xl" />
                </div>
                {speaker.isMuted && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px]">
                    🔇
                  </div>
                )}
                {speaker.isSpeaking && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-kente-gold flex items-center justify-center text-[10px] animate-pulse">
                    🎙️
                  </div>
                )}
              </div>
              <p className="text-[10px] text-white text-center leading-tight">
                {speaker.name.split(' ')[0]}
              </p>
            </div>
          ))}
        </div>

        {/* Listeners */}
        <div className="mt-8">
          <p className="text-xs font-medium text-gray-400 mb-3">👥 LISTENERS</p>
          <div className="flex flex-wrap gap-2">
            {MOCK_ROOM.listeners.map((name) => (
              <div key={name} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-elevated border border-border rounded-xl">
                {!name.startsWith('+') && <Avatar name={name} size="xs" />}
                <span className="text-xs text-gray-300">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-4 border-t border-border bg-bg-surface">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setMuted((m) => !m)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
              muted
                ? 'bg-red-600/20 text-red-400'
                : 'bg-bg-elevated text-white'
            }`}
          >
            <span className="text-2xl">{muted ? '🔇' : '🎙️'}</span>
            <span className="text-[10px]">{muted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setHandRaised((h) => !h)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
              handRaised ? 'bg-kente-gold/20 text-kente-gold' : 'bg-bg-elevated text-gray-400'
            }`}
          >
            <span className="text-2xl">✋</span>
            <span className="text-[10px]">{handRaised ? 'Lower hand' : 'Raise hand'}</span>
          </button>

          <button
            onClick={() => setTipped(true)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
              tipped ? 'bg-kente-gold/20 text-kente-gold' : 'bg-bg-elevated text-gray-400'
            }`}
          >
            <span className="text-2xl">🥥</span>
            <span className="text-[10px]">Kalabash</span>
          </button>

          <button
            onClick={() => router.back()}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-900/40 text-red-400"
          >
            <span className="text-2xl">🚪</span>
            <span className="text-[10px]">Leave quietly</span>
          </button>
        </div>
      </div>
    </div>
  )
}
