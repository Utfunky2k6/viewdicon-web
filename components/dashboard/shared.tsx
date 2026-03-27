export type ThemeMode = 'dark' | 'light';

interface DarkLight<T> { dark: T; light: T }
const T: Record<string, DarkLight<string>> = {
  bg:      { dark:'#060d08',      light:'#f4f6f4'     },
  card:    { dark:'#0f1e11',      light:'#ffffff'      },
  border:  { dark:'#1e3a20',      light:'#e0e8e0'      },
  text:    { dark:'#f0f7f0',      light:'#0d1117'      },
  sub:     { dark:'#7da882',      light:'#6b7f6b'      },
  muted:   { dark:'rgba(255,255,255,.06)', light:'#f0f4f0' },
  heroEnd: { dark:'#0a1a0b',      light:'#1a4a1f'      },
};

export const t = (key: keyof typeof T, mode: ThemeMode) => T[key][mode];

export function SectionLabel({ label, more, onMore, mode }: { label:string; more?:string; onMore?:()=>void; mode:ThemeMode }) {
  return (
    <div style={{ padding:'10px 14px 5px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', color:t('sub',mode) }}>{label}</span>
      {more && <span onClick={onMore} style={{ fontSize:10, fontWeight:700, color:'#1a7c3e', cursor:'pointer' }}>{more} →</span>}
    </div>
  );
}
