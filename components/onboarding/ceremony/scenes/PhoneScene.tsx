'use client'
import * as React from 'react'
import { GradBtn } from '../atoms/GradBtn'
import { isAfricanDialCode, AFRICAN_DIAL_CODES, WORLD_DIAL_CODES } from '@/lib/dial-codes'

interface PhoneSceneProps {
  onSendDrum: (dial: string, phone: string) => void
  theme: any
}

export function PhoneScene({ onSendDrum, theme }: PhoneSceneProps) {
  const [phone, setPhone] = React.useState('')
  const [selected, setSelected] = React.useState(AFRICAN_DIAL_CODES[0])
  const [showPicker, setShowPicker] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const isAfrican = isAfricanDialCode(selected.dial)

  const filteredAfrican = AFRICAN_DIAL_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  )
  const filteredWorld = WORLD_DIAL_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, background: theme.bg }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🥁</div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 24, fontWeight: 900, color: theme.text, marginBottom: 6 }}>Digital Talking Drum</div>
        <div style={{ fontSize: 14, color: theme.subText, lineHeight: 1.5 }}>Your phone number is your sacred link. No passwords needed.</div>
      </div>

      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: theme.subText, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Select Your Nation</div>
        <div onClick={() => setShowPicker(true)} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: theme.muted,
          borderRadius: 12, border: `1.5px solid ${isAfrican ? theme.accent : theme.border}`,
          cursor: 'pointer', marginBottom: 18, transition: 'border-color .2s'
        }}>
          <span style={{ fontSize: 22 }}>{selected.flag}</span>
          <span style={{ fontSize: 15, fontWeight: 700, flex: 1, color: theme.text }}>{selected.name}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ color: theme.subText, fontSize: 13 }}>{selected.dial} ▾</span>
            {isAfrican && <span style={{ fontSize: 9, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: '.06em' }}>🌍 African SIM</span>}
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 800, color: theme.subText, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Phone Number</div>
        <input
          type="tel" placeholder="812 345 6789" value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          style={{ width: '100%', padding: 14, background: theme.muted, border: `1.5px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 18, fontWeight: 700, outline: 'none' }}
        />
      </div>

      {/* Heritage notice — only for non-African numbers */}
      {!isAfrican && (
        <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 14, padding: 12, fontSize: 11, color: '#93c5fd', lineHeight: 1.6, marginBottom: 14 }}>
          🌍 <b>Non-African SIM detected.</b> You will be asked to choose your connection to the Motherland in the next step.
        </div>
      )}
      {isAfrican && (
        <div style={{ background: 'rgba(26,124,62,.08)', border: '1px solid rgba(26,124,62,.3)', borderRadius: 14, padding: 12, fontSize: 11, color: theme.accent, lineHeight: 1.6, marginBottom: 14 }}>
          ✅ <b>African SIM verified.</b> You will enter the Motherland directly as a Child of the Soil.
        </div>
      )}

      <div style={{ background: 'rgba(212,160,23,.05)', border: '1px solid rgba(212,160,23,.2)', borderRadius: 16, padding: 12, color: '#d4a017', fontSize: 11, lineHeight: 1.6, marginBottom: 'auto' }}>
        🛡 <b>SIM Sovereignty:</b> Your SIM is the strongest identity signal. No passwords, no emails.
      </div>

      <GradBtn onClick={() => onSendDrum(selected.dial, phone)} style={phone.length < 7 ? { opacity: .4, pointerEvents: 'none', marginTop: 16 } : { height: 56, marginTop: 16 }}>Send Magic Drum Code 🥁</GradBtn>

      {showPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: theme.bg, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '16px 20px 10px', background: theme.card, borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: theme.text }}>Select Country</div>
              <button onClick={() => { setShowPicker(false); setSearch('') }} style={{ background: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '7px 12px', color: theme.text, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <input
              type="text" placeholder="Search country name or +code..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: theme.muted, border: `1.5px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 13, outline: 'none' }}
            />
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 40px' }}>
            {/* Africa section */}
            {filteredAfrican.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 900, color: theme.accent, textTransform: 'uppercase', letterSpacing: '.1em', padding: '10px 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🌍</span> Africa — 54 Nations
                  <span style={{ fontSize: 9, background: 'rgba(26,124,62,.15)', color: theme.accent, padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>AUTOMATIC CIRCLE 1</span>
                </div>
                {filteredAfrican.map(c => (
                  <div key={c.name} onClick={() => { setSelected(c); setShowPicker(false); setSearch('') }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                    <span style={{ fontSize: 22 }}>{c.flag}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, flex: 1, color: theme.text }}>{c.name}</span>
                    <span style={{ fontSize: 13, color: theme.accent, fontWeight: 800 }}>{c.dial}</span>
                  </div>
                ))}
              </>
            )}

            {/* World section */}
            {filteredWorld.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 900, color: theme.subText, textTransform: 'uppercase', letterSpacing: '.1em', padding: '18px 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🌐</span> Rest of the World
                  <span style={{ fontSize: 9, background: 'rgba(59,130,246,.15)', color: '#93c5fd', padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>HERITAGE CHECK REQUIRED</span>
                </div>
                {filteredWorld.map(c => (
                  <div key={c.name} onClick={() => { setSelected(c); setShowPicker(false); setSearch('') }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                    <span style={{ fontSize: 22 }}>{c.flag}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, flex: 1, color: theme.text }}>{c.name}</span>
                    <span style={{ fontSize: 13, color: theme.subText }}>{c.dial}</span>
                  </div>
                ))}
              </>
            )}

            {filteredAfrican.length === 0 && filteredWorld.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: theme.subText }}>No countries match "{search}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
