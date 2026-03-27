import * as React from 'react'

export default function TalkingDrum() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3, height:18 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          className="db-bar"
          style={{
            width: 3,
            borderRadius: 99,
            background: '#1a7c3e',
          }}
        />
      ))}
    </div>
  )
}
