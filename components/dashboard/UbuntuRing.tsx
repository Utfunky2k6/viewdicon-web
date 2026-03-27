export default function UbuntuRing() {
  return (
    <div style={{ position:'relative', width:88, height:88, flexShrink:0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r="37" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7"/>
        <circle cx="44" cy="44" r="37" fill="none" stroke="#1a7c3e" strokeWidth="7" strokeDasharray="232" strokeDashoffset="55" strokeLinecap="round"/>
        <circle cx="44" cy="44" r="27" fill="none" stroke="rgba(212,160,23,.2)" strokeWidth="4"/>
        <circle cx="44" cy="44" r="27" fill="none" stroke="#d4a017" strokeWidth="4" strokeDasharray="170" strokeDashoffset="51" strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:20, fontWeight:800, color:'#f0f7f0', lineHeight:1 }}>94</div>
        <div style={{ fontSize:8, color:'#7da882', fontWeight:600, textAlign:'center', marginTop:2, lineHeight:1.2 }}>Ubuntu<br/>Score</div>
      </div>
    </div>
  )
}
