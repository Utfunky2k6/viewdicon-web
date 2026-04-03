'use client'

import React from 'react'

interface UbuntuRingProps {
  score?: number
}

export default function UbuntuRing({ score = 72 }: UbuntuRingProps) {
  // SVG circumference: 2 * Math.PI * 34 ≈ 213.63
  const circumference = 213.63
  const offset = (circumference * (100 - score)) / 100

  return (
    <div style={{ position:'relative', width:100, height:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle 
          cx="50" cy="50" r="34" fill="none" 
          stroke="url(#umojaGrad)" strokeWidth="6" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          transform="rotate(-90 50 50)" 
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        <defs>
          <linearGradient id="umojaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f7e1ad" />
            <stop offset="100%" stopColor="#d4a373" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position:'absolute', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ fontSize:20, fontWeight:800, color:'#f0f7f0', lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:8, opacity:0.6, textTransform:'uppercase', letterSpacing:0.5, marginTop:2, color:'#f0f7f0' }}>Score</div>
      </div>
    </div>
  )
}
