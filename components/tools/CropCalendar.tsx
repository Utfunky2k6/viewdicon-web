'use client'
import { useState } from 'react'

const CROPS = [
  { name: 'Maize', plant: 'Mar–Apr', harvest: 'Jul–Aug', stage: 'growing', health: 92 },
  { name: 'Cassava', plant: 'Apr–May', harvest: 'Jan–Feb', stage: 'flowering', health: 87 },
  { name: 'Yam', plant: 'Feb–Mar', harvest: 'Oct–Nov', stage: 'dormant', health: 78 },
  { name: 'Tomato', plant: 'May', harvest: 'Aug', stage: 'harvesting', health: 95 },
  { name: 'Rice', plant: 'Jun', harvest: 'Oct', stage: 'seedling', health: 83 },
]

const STAGE_COLOR: Record<string, string> = {
  growing: '#16a34a',
  flowering: '#f59e0b',
  dormant: '#6b7280',
  harvesting: '#2563eb',
  seedling: '#84cc16',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function CropCalendar() {
  const [activeCrop, setActiveCrop] = useState(CROPS[0].name)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const current = new Date().getMonth()

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>📅 Crop Calendar</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['calendar','list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '5px 12px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                background: view === v ? '#1a7c3e' : '#f0f7f0', color: view === v ? '#fff' : '#3a5a3a' }}>
              {v === 'calendar' ? '📆' : '📋'} {v}
            </button>
          ))}
        </div>
      </div>

      {/* Season strip */}
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: '1px solid #bbf7d0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 8 }}>2026 Growing Season</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {MONTHS.map((m, i) => (
            <div key={m} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: '#6b7280', marginBottom: 3 }}>{m}</div>
              <div style={{ height: 20, borderRadius: 4,
                background: i === current ? '#1a7c3e' : i < current ? '#bbf7d0' : '#e5e7eb',
                border: i === current ? '2px solid #16a34a' : 'none' }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>Current month highlighted in green</div>
      </div>

      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CROPS.map(crop => (
            <div key={crop.name} onClick={() => setActiveCrop(crop.name)}
              style={{ background: activeCrop === crop.name ? '#f0fdf4' : '#fafafa',
                border: `1.5px solid ${activeCrop === crop.name ? '#86efac' : '#e5e7eb'}`,
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>🌱 {crop.name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px',
                  background: STAGE_COLOR[crop.stage] + '20', color: STAGE_COLOR[crop.stage] }}>
                  {crop.stage}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Plant: <b style={{ color: '#374151' }}>{crop.plant}</b></div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Harvest: <b style={{ color: '#374151' }}>{crop.harvest}</b></div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>Crop health</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: crop.health > 85 ? '#16a34a' : '#f59e0b' }}>{crop.health}%</span>
                </div>
                <div style={{ height: 5, background: '#e5e7eb', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${crop.health}%`,
                    background: crop.health > 85 ? '#16a34a' : '#f59e0b' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Gantt-style calendar */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Planting & Harvest Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CROPS.map(crop => {
              const startMonth = MONTHS.indexOf(crop.plant.split('–')[0].slice(0,3))
              const endMonth   = MONTHS.indexOf(crop.harvest.split('–')[0].slice(0,3))
              return (
                <div key={crop.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 64, fontSize: 11, fontWeight: 600, color: '#374151', flexShrink: 0 }}>{crop.name}</div>
                  <div style={{ flex: 1, display: 'flex', gap: 2 }}>
                    {MONTHS.map((_, i) => {
                      const isPlant = i >= startMonth && i <= startMonth + 1
                      const isHarvest = i >= endMonth && i <= endMonth + 1
                      const isGrow = i > startMonth + 1 && i < endMonth
                      return (
                        <div key={i} style={{ flex: 1, height: 16, borderRadius: 3,
                          background: isPlant ? '#84cc16' : isHarvest ? '#f59e0b' : isGrow ? '#bbf7d0' : '#f3f4f6' }} />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[['#84cc16','Planting'],['#bbf7d0','Growing'],['#f59e0b','Harvest']].map(([c,l]) => (
              <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c as string }} />
                <span style={{ fontSize: 10, color: '#6b7280' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#1a7c3e', color: '#fff',
          fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          + Add Crop
        </button>
        <button style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#f0fdf4', color: '#1a7c3e',
          fontWeight: 700, fontSize: 13, border: '1.5px solid #86efac', cursor: 'pointer' }}>
          Export Schedule
        </button>
      </div>
    </div>
  )
}
