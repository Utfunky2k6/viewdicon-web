import { ThemeMode } from './shared'

export default function GriotCard({ mode, onAction }: { mode: ThemeMode, onAction?: (action: string) => void }) {
  const isDark = mode === 'dark'
  
  return (
    <div style={{ margin:'8px 12px', borderRadius:14, padding:13, cursor:'pointer', position:'relative', overflow:'hidden', background: isDark ? 'linear-gradient(135deg,#0a2e14,#155c28)' : 'linear-gradient(135deg,#0f5028,#1a7c3e)' }}>
      <div style={{ position:'absolute', right:-8, bottom:-8, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,.06)' }}/>
      
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, border:'1.5px solid rgba(255,255,255,.25)' }}>🦅</div>
        <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.07em' }}>Griot · Your AI Elder</span>
        <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginLeft:'auto' }}>9:41 AM</span>
      </div>
      
      <div style={{ fontSize:12, color:'#d1fae5', lineHeight:1.65, fontStyle:'italic', marginBottom:8 }}>
        "Umoh, grain prices are up 12% in Lagos market this morning. Two Agriculture Village buyers are looking for a Market Vendor with your Crest tier. Your Ajo circle collects this Friday — ₡800 coming to you. A good morning to trade."
      </div>
      
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {['🌾 View grain prices','🤝 See buyer requests','💬 Ask Griot'].map(chip => (
          <span key={chip} onClick={() => onAction?.(chip)} style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:99, padding:'4px 10px', fontSize:10, color:'#fff', fontWeight:600, cursor:'pointer' }}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
