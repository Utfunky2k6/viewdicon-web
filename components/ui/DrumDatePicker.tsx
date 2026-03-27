'use client'
import * as React from 'react'

interface Props {
  value: string // 'YYYY-MM-DD' format
  onChange: (v: string) => void
  minYear?: number
  maxYear?: number
  accentColor?: string
  bgColor?: string    // background the picker sits on — used for fade gradient
  textColor?: string  // primary text color for selected item
}

export function DrumDatePicker({ value, onChange, minYear = 1914, maxYear, accentColor = '#1a7c3e', bgColor = '#060b07', textColor = '#ffffff' }: Props) {
  const thisYear = new Date().getFullYear()
  const maxY = maxYear ?? thisYear - 13

  const parsed = value ? new Date(value + 'T12:00:00') : null
  const [day, setDay] = React.useState(parsed?.getDate() ?? 1)
  const [month, setMonth] = React.useState(parsed ? parsed.getMonth() + 1 : 1)
  const [year, setYear] = React.useState(parsed?.getFullYear() ?? maxY)

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // Days in current month
  const daysInMonth = new Date(year, month, 0).getDate()
  React.useEffect(() => {
    if (day > daysInMonth) setDay(daysInMonth)
  }, [month, year, day, daysInMonth])

  // Emit value whenever day/month/year changes
  React.useEffect(() => {
    const mm = String(month).padStart(2,'0')
    const dd = String(Math.min(day, daysInMonth)).padStart(2,'0')
    onChange(`${year}-${mm}-${dd}`)
  }, [day, month, year, daysInMonth, onChange])

  // Derive fade-gradient color from bgColor.
  // Supports hex (#rrggbb / #rgb) and falls back to a solid fade.
  function fadeOf(color: string, opacity: number): string {
    const hex = color.trim()
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(1,3),16)
      const g = parseInt(hex.slice(3,5),16)
      const b = parseInt(hex.slice(5,7),16)
      return `rgba(${r},${g},${b},${opacity})`
    }
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      const r = parseInt(hex[1]+hex[1],16)
      const g = parseInt(hex[2]+hex[2],16)
      const b = parseInt(hex[3]+hex[3],16)
      return `rgba(${r},${g},${b},${opacity})`
    }
    // already rgba/rgb — can't easily re-alpha, return as-is
    return color
  }

  const fadeHigh  = fadeOf(bgColor, 0.96)
  const textMid   = fadeOf(textColor, 0.50)
  const textLow   = fadeOf(textColor, 0.20)

  function DrumColumn({ items, selected, onSelect, label }: {
    items: (string|number)[], selected: number, onSelect: (i: number) => void, label: string
  }) {
    const itemHeight = 44
    const visibleCount = 5
    const halfVisible = Math.floor(visibleCount / 2)
    const touchStart = React.useRef(0)

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: textMid, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{label}</div>
        <div
          style={{ position: 'relative', height: itemHeight * visibleCount, overflow: 'hidden', width: '100%' }}
          onTouchStart={e => { touchStart.current = e.touches[0].clientY }}
          onTouchEnd={e => {
            const dy = touchStart.current - e.changedTouches[0].clientY
            if (dy > 25) onSelect(Math.min(selected + 1, items.length - 1))
            else if (dy < -25) onSelect(Math.max(selected - 1, 0))
          }}
        >
          {/* Fade gradients */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: itemHeight * halfVisible, background: `linear-gradient(180deg, ${fadeHigh} 0%, transparent 100%)`, zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: itemHeight * halfVisible, background: `linear-gradient(0deg, ${fadeHigh} 0%, transparent 100%)`, zIndex: 2, pointerEvents: 'none' }} />
          {/* Selection highlight */}
          <div style={{ position: 'absolute', top: itemHeight * halfVisible, left: 4, right: 4, height: itemHeight, borderRadius: 10, background: `${accentColor}20`, border: `1.5px solid ${accentColor}50`, zIndex: 1, pointerEvents: 'none' }} />

          {/* Items — centered on selection */}
          <div style={{ transform: `translateY(${(halfVisible - selected) * itemHeight}px)`, transition: 'transform .2s cubic-bezier(.4,0,.2,1)' }}>
            {items.map((item, i) => {
              const dist = Math.abs(i - selected)
              return (
                <div
                  key={i}
                  onClick={() => onSelect(i)}
                  style={{
                    height: itemHeight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: dist === 0 ? 18 : dist === 1 ? 14 : 11,
                    fontWeight: dist === 0 ? 900 : dist === 1 ? 600 : 400,
                    color: dist === 0 ? textColor : dist === 1 ? textMid : textLow,
                    cursor: 'pointer', userSelect: 'none',
                    transition: 'all .15s',
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const months = MONTHS
  const years = Array.from({ length: maxY - minYear + 1 }, (_, i) => maxY - i) // newest first

  return (
    <div style={{ background: `${accentColor}08`, border: `1.5px solid ${accentColor}30`, borderRadius: 20, padding: '16px 8px', position: 'relative', overflow: 'hidden' }}>
      {/* Horizontal separator lines to enhance drum effect */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', marginTop: -22, height: 1, background: `${accentColor}20`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', marginTop: 21, height: 1, background: `${accentColor}20`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', gap: 4 }}>
        <DrumColumn items={days} selected={day - 1} onSelect={i => setDay(i + 1)} label="Day" />
        <div style={{ width: 1, background: `${accentColor}20`, alignSelf: 'stretch', margin: '0 2px' }} />
        <DrumColumn items={months} selected={month - 1} onSelect={i => setMonth(i + 1)} label="Month" />
        <div style={{ width: 1, background: `${accentColor}20`, alignSelf: 'stretch', margin: '0 2px' }} />
        <DrumColumn items={years} selected={years.indexOf(year)} onSelect={i => setYear(years[i])} label="Year" />
      </div>
    </div>
  )
}
