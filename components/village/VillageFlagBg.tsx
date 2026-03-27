'use client'
// ── Village Flag SVG Backgrounds — one per ancient civilisation ─
// Each pattern draws from its civilisation's visual vocabulary.
// Used on village list cards and village detail hero.

import React from 'react'

export function VillageFlagBg({
  id, color, style,
}: {
  id: string
  color: string
  style?: React.CSSProperties
}) {
  const r = parseInt(color.replace('#', '').slice(0, 2), 16)
  const g = parseInt(color.replace('#', '').slice(2, 4), 16)
  const b = parseInt(color.replace('#', '').slice(4, 6), 16)
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`
  const c = color
  const base: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }

  switch (id) {
    case 'commerce': // WANGARA — Mandé diamond trade network
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#1a0800"/>
        <rect y="36" width="320" height="48" fill={rgba(0.28)}/>
        {[0,1,2,3,4].map(i=><path key={i} d={`M${28+i*56},72 L${44+i*56},46 L${60+i*56},72 L${44+i*56},98 Z`} fill={c} opacity={0.45-i*0.06}/>)}
        <circle cx="160" cy="60" r="28" fill="none" stroke={c} strokeWidth="1.5" opacity=".6"/>
        <circle cx="160" cy="60" r="13" fill={c} opacity=".5"/>
      </svg>

    case 'agriculture': // KEMET — Pyramid silhouettes + Nile gradient
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <defs><linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a2a00"/><stop offset="1" stopColor="#1a5000"/></linearGradient></defs>
        <rect width="320" height="120" fill="url(#kg)"/>
        <path d="M50,5 L80,68 L20,68 Z" fill={c} opacity=".82"/>
        <path d="M140,12 L170,68 L110,68 Z" fill={c} opacity=".58"/>
        <path d="M230,18 L258,68 L202,68 Z" fill={c} opacity=".36"/>
        <rect y="72" width="320" height="48" fill={rgba(0.22)}/>
      </svg>

    case 'health': // WABET — Sacred healing circles + Sekhmet lioness
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#020e1a"/>
        {[0,1,2,3].map(i=><rect key={i} y={i*30} width="320" height="18" fill={rgba(0.07)}/>)}
        <circle cx="160" cy="54" r="44" fill={rgba(0.18)} stroke={c} strokeWidth="1.5" opacity=".6"/>
        <circle cx="160" cy="54" r="25" fill={rgba(0.35)}/>
        <text x="160" y="64" textAnchor="middle" fontSize="26" opacity=".82">🦁</text>
      </svg>

    case 'education': // SANKORE — Mosque minaret triangles
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#120825"/>
        <rect y="0" width="320" height="38" fill={rgba(0.22)}/>
        <rect y="82" width="320" height="38" fill={rgba(0.16)}/>
        {[0,1,2,3].map(i=><path key={i} d={`M${28+i*82},86 L${48+i*82},14 L${68+i*82},86 Z`} fill={c} opacity={0.7-i*0.14}/>)}
      </svg>

    case 'arts': // NOK — Terracotta diamonds + creative ellipse
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#1a0800"/>
        {[0,1,2,3,4].map(i=><path key={i} d={`M${28+i*56},72 L${44+i*56},46 L${60+i*56},72 L${44+i*56},98 Z`} fill={c} opacity={0.4-i*0.05}/>)}
        <ellipse cx="160" cy="60" rx="54" ry="32" fill="none" stroke={c} strokeWidth="2" opacity=".5"/>
        <circle cx="160" cy="60" r="15" fill={c} opacity=".7"/>
      </svg>

    case 'builders': // MEROE — Steep Nubian pyramid silhouettes
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#0d0500"/>
        <rect y="80" width="320" height="40" fill={rgba(0.2)}/>
        <path d="M20,86 L50,10 L80,86 Z" fill={c} opacity=".82" stroke={c} strokeWidth="0.5"/>
        <path d="M100,86 L130,10 L160,86 Z" fill={c} opacity=".58"/>
        <path d="M180,86 L210,10 L240,86 Z" fill={c} opacity=".36"/>
        <path d="M248,86 L268,32 L288,86 Z" fill={c} opacity=".2"/>
      </svg>

    case 'energy': // INGA — Congo River waves + lightning bolt
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050000"/><stop offset="1" stopColor="#1a0000"/></linearGradient></defs>
        <rect width="320" height="120" fill="url(#ig)"/>
        <path d="M0,72 Q80,32 160,72 T320,72 L320,120 L0,120 Z" fill={rgba(0.32)}/>
        <path d="M0,82 Q80,42 160,82 T320,82 L320,120 L0,120 Z" fill={rgba(0.52)}/>
        <text x="160" y="55" textAnchor="middle" fontSize="30" opacity=".88">⚡</text>
      </svg>

    case 'transport': // KILWA — Dhow sail + Indian Ocean monsoon waves
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#020a1a"/>
        <path d="M0,90 Q80,45 160,90 T320,90" stroke={c} strokeWidth="3" fill="none" opacity=".5"/>
        <path d="M0,70 Q80,25 160,70 T320,70" stroke={c} strokeWidth="2" fill="none" opacity=".3"/>
        <path d="M145,90 L160,22 L175,90 Z" fill={c} opacity=".82"/>
        <line x1="160" y1="22" x2="160" y2="92" stroke={c} strokeWidth="2" opacity=".6"/>
      </svg>

    case 'technology': // ALEXANDRIA — Library rays + scroll circles
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#050520"/>
        {[0,1,2,3,4,5].map(i=><line key={i} x1="160" y1="120" x2={40+i*50} y2="0" stroke={c} strokeWidth="0.6" opacity=".1"/>)}
        <rect x="60" y="26" width="200" height="58" fill="none" stroke={c} strokeWidth="1.5" opacity=".42" rx="3"/>
        <line x1="60" y1="55" x2="260" y2="55" stroke={c} strokeWidth="1" opacity=".3"/>
        {[0,1,2,3,4].map(i=><circle key={i} cx={70+i*46} cy="55" r={8-i} fill={c} opacity={0.7-i*0.1}/>)}
      </svg>

    case 'media': // TIMBUKTU — Manuscript stripes + Griot mic
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#1a0f00"/>
        <rect y="0" width="320" height="38" fill={rgba(0.32)}/>
        <rect y="82" width="320" height="38" fill={rgba(0.24)}/>
        <circle cx="160" cy="60" r="26" fill="none" stroke={c} strokeWidth="2" opacity=".7"/>
        <text x="160" y="70" textAnchor="middle" fontSize="20" opacity=".9">🎙</text>
      </svg>

    case 'finance': // SIJILMASA — Trans-Saharan gold stripes + crescent star
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#001a0a"/>
        <rect y="0" width="320" height="40" fill={rgba(0.28)}/>
        <rect y="40" width="320" height="40" fill="#001a0a"/>
        <rect y="80" width="320" height="40" fill={rgba(0.2)}/>
        <polygon points="148,8 178,62 118,62" fill={c} opacity=".72"/>
        <circle cx="220" cy="38" r="15" fill="none" stroke={c} strokeWidth="1.5" opacity=".5"/>
      </svg>

    case 'justice': // GACACA — Grass court + scales of truth
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#00121a"/>
        <rect y="0" width="320" height="60" fill={rgba(0.14)}/>
        <circle cx="160" cy="62" r="34" fill="none" stroke={c} strokeWidth="2" opacity=".55"/>
        <text x="160" y="74" textAnchor="middle" fontSize="28" opacity=".9">⚖</text>
      </svg>

    case 'government': // AKSUM — Obelisk + empire stripes
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#030820"/>
        {[0,1,2,3].map(i=><rect key={i} y={i*28} width="320" height="22" fill={c} opacity={0.05+i*0.03}/>)}
        <rect x="148" y="8" width="24" height="92" fill={c} opacity=".55" rx="2"/>
        <rect x="128" y="38" width="64" height="12" fill={c} opacity=".42" rx="2"/>
        <polygon points="160,4 172,16 148,16" fill="#d4a017" opacity=".85"/>
      </svg>

    case 'security': // AGOJIE — Warrior formation triangles + crossed swords
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#1a0000"/>
        <rect y="0" width="320" height="60" fill={rgba(0.14)}/>
        <path d="M95,10 L126,86 L64,86 Z" fill={c} opacity=".78"/>
        <path d="M162,10 L193,86 L131,86 Z" fill={c} opacity=".52"/>
        <path d="M228,22 L252,86 L204,86 Z" fill={c} opacity=".3"/>
        <line x1="125" y1="18" x2="188" y2="82" stroke={c} strokeWidth="1.5" opacity=".28"/>
        <line x1="188" y1="18" x2="125" y2="82" stroke={c} strokeWidth="1.5" opacity=".28"/>
      </svg>

    case 'spirituality': // KARNAK — Great temple column rows
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#0a0520"/>
        {[0,1,2,3,4,5,6].map(i=>(
          <rect key={i} x={14+i*44} y="16" width="18" height="88" fill={c} opacity={Math.max(0.12, 0.68-i*0.09)} rx="3"/>
        ))}
        <rect y="0" width="320" height="10" fill={rgba(0.28)}/>
        <rect y="108" width="320" height="12" fill={rgba(0.28)}/>
      </svg>

    case 'fashion': // BIDA — Nupe glass bead diamonds + flower circle
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#1a0010"/>
        {[0,1,2,3,4].map(i=><path key={i} d={`M${28+i*56},72 L${44+i*56},46 L${60+i*56},72 L${44+i*56},98 Z`} fill={c} opacity={0.35-i*0.04}/>)}
        <circle cx="160" cy="60" r="28" fill={rgba(0.42)}/>
        <text x="160" y="72" textAnchor="middle" fontSize="24" opacity=".85">🌸</text>
      </svg>

    case 'family': // UBUNTU — Three interconnected circles (family triad)
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#001a16"/>
        <circle cx="160" cy="60" r="52" fill={rgba(0.16)} stroke={c} strokeWidth="2" opacity=".42"/>
        <circle cx="134" cy="46" r="14" fill={c} opacity=".68"/>
        <circle cx="186" cy="46" r="14" fill={c} opacity=".68"/>
        <circle cx="160" cy="76" r="14" fill={c} opacity=".55"/>
        <line x1="134" y1="46" x2="186" y2="46" stroke={c} strokeWidth="1" opacity=".35"/>
        <line x1="134" y1="46" x2="160" y2="76" stroke={c} strokeWidth="1" opacity=".35"/>
        <line x1="186" y1="46" x2="160" y2="76" stroke={c} strokeWidth="1" opacity=".35"/>
      </svg>

    case 'hospitality': // TERANGA — Wolof sharing bowl + welcoming colours
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#1a0800"/>
        <rect y="0" width="320" height="40" fill="#cc4b0028"/>
        <rect y="40" width="320" height="40" fill="#ffd70018"/>
        <rect y="80" width="320" height="40" fill="#00640025"/>
        <circle cx="160" cy="60" r="24" fill={c} opacity=".72"/>
        <text x="160" y="70" textAnchor="middle" fontSize="15" opacity=".9">🍲</text>
      </svg>

    case 'sports': // NANDI — Rift Valley colours + speed runner
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#000a00"/>
        <rect y="0" width="320" height="40" fill="#cc000028"/>
        <rect y="80" width="320" height="40" fill="#00640028"/>
        {[0,1,2,3].map(i=><line key={i} x1={35+i*28} y1={24+i*8} x2={70+i*28} y2={24+i*8} stroke={c} strokeWidth="1.5" opacity=".22"/>)}
        <circle cx="160" cy="60" r="26" fill={c} opacity=".75"/>
        <text x="160" y="72" textAnchor="middle" fontSize="20" opacity=".9">🏃</text>
      </svg>

    default: // ADULIS — crossroads gateway + key
      return <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" style={base}>
        <rect width="320" height="120" fill="#0a0a08"/>
        <rect y="0" width="320" height="60" fill="rgba(212,160,23,.08)"/>
        <line x1="0" y1="60" x2="320" y2="60" stroke="#d4a017" strokeWidth="1" opacity=".18"/>
        <line x1="160" y1="0" x2="160" y2="120" stroke="#d4a017" strokeWidth="1" opacity=".18"/>
        <circle cx="160" cy="60" r="34" fill="none" stroke="#d4a017" strokeWidth="2" opacity=".42"/>
        <text x="160" y="74" textAnchor="middle" fontSize="28" opacity=".72">🔑</text>
      </svg>
  }
}
