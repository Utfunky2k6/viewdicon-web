'use client'
import * as React from 'react'

// ═══════════════════════════════════════════════════════════════
// Stories Row + Fullscreen Viewer — Instagram-style stories
// with African cultural identity
// ═══════════════════════════════════════════════════════════════

interface Story {
  id: string; name: string; avatar: string; viewed: boolean
  slides: Array<{ bg: string; text: string; type: 'text'|'market'|'proverb' }>
}

const STORIES: Story[] = [
  { id:'s0', name:'Your Story', avatar:'➕', viewed:false, slides:[] },
  { id:'s1', name:'Kofi', avatar:'👨🏾‍💼', viewed:false, slides:[
    { bg:'linear-gradient(135deg,#1a7c3e,#0f2d14)', text:'Just closed my first international trade via the Commerce Village. The pot system is genius! 🔥', type:'text' },
    { bg:'linear-gradient(135deg,#d4a017,#8b6914)', text:'₵12,400 — biggest week yet. The grind pays.', type:'text' },
  ]},
  { id:'s2', name:'Amara', avatar:'👩🏾‍🎤', viewed:false, slides:[
    { bg:'linear-gradient(135deg,#7c3aed,#4c1d95)', text:'"Ẹni tó bá jẹ́ owó alágbára, á jẹ ìyà oníṣẹ́." — The one who eats the money of the powerful will suffer the labor of the worker.', type:'proverb' },
    { bg:'linear-gradient(135deg,#ec4899,#be185d)', text:'New voice story recorded — 92 seconds of pure fire 🎙', type:'text' },
  ]},
  { id:'s3', name:'Zara', avatar:'👩🏾‍🎨', viewed:true, slides:[
    { bg:'linear-gradient(135deg,#e07b00,#92400e)', text:'Hand-woven Kente · 50 yards\n₵15,000 — Trust escrow accepted', type:'market' },
  ]},
  { id:'s4', name:'Elder Ade', avatar:'👴🏾', viewed:false, slides:[
    { bg:'linear-gradient(135deg,#0369a1,#0c4a6e)', text:'"Àgbà kì í wà lọ́jà kí orí ọmọ títún wọ́." — An elder does not stand in the market and let a child\'s head go crooked.', type:'proverb' },
  ]},
  { id:'s5', name:'Tunde', avatar:'👨🏾‍💻', viewed:false, slides:[
    { bg:'linear-gradient(135deg,#16a34a,#15803d)', text:'Sprint complete! Tech Village hackathon — 3 days, 12 teams, ₵50K prize. We won. 💻🏆', type:'text' },
    { bg:'linear-gradient(135deg,#0891b2,#155e75)', text:'Building Africa\'s future, one commit at a time.', type:'text' },
  ]},
  { id:'s6', name:'Adaeze', avatar:'👩🏾‍⚕️', viewed:true, slides:[
    { bg:'linear-gradient(135deg,#059669,#047857)', text:'Health Village outreach — 200 patients seen today. Ubuntu in action. ⚕️', type:'text' },
  ]},
  { id:'s7', name:'Kwame', avatar:'👨🏾‍🌾', viewed:false, slides:[
    { bg:'linear-gradient(135deg,#65a30d,#3f6212)', text:'Harvest season! 10 tonnes of cassava heading to the market via farm-to-pot logistics 🌾', type:'text' },
  ]},
  { id:'s8', name:'Fatima', avatar:'👩🏾‍🏫', viewed:true, slides:[
    { bg:'linear-gradient(135deg,#ca8a04,#854d0e)', text:'"Ilimi shi ne haske." — Education is the light. Teaching 40 students today. 📚', type:'proverb' },
  ]},
]

export default function StoriesRow() {
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [activeStory, setActiveStory] = React.useState(0)
  const [activeSlide, setActiveSlide] = React.useState(0)
  const [viewed, setViewed] = React.useState<Set<string>>(new Set(STORIES.filter(s=>s.viewed).map(s=>s.id)))
  const timerRef = React.useRef<ReturnType<typeof setTimeout>|null>(null)

  const openStory = (idx: number) => {
    if (idx === 0) return // "Your Story" — would open creation flow
    setActiveStory(idx)
    setActiveSlide(0)
    setViewerOpen(true)
    setViewed(prev => new Set(prev).add(STORIES[idx].id))
  }

  const story = STORIES[activeStory]
  const totalSlides = story?.slides.length || 0

  const goNext = React.useCallback(() => {
    if (activeSlide < totalSlides - 1) {
      setActiveSlide(s => s + 1)
    } else if (activeStory < STORIES.length - 1) {
      const next = activeStory + 1
      if (next === 0) { setViewerOpen(false); return }
      setActiveStory(next)
      setActiveSlide(0)
      setViewed(prev => new Set(prev).add(STORIES[next].id))
    } else {
      setViewerOpen(false)
    }
  }, [activeSlide, activeStory, totalSlides])

  const goPrev = () => {
    if (activeSlide > 0) setActiveSlide(s => s - 1)
    else if (activeStory > 1) {
      setActiveStory(activeStory - 1)
      setActiveSlide(STORIES[activeStory - 1].slides.length - 1)
    }
  }

  // Auto-advance 5s
  React.useEffect(() => {
    if (!viewerOpen) return
    timerRef.current = setTimeout(goNext, 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [viewerOpen, activeStory, activeSlide, goNext])

  return (
    <>
      {/* ── Scrollable row ── */}
      <div style={{
        display:'flex', gap:12, padding:'12px 14px', overflowX:'auto',
        borderBottom:'1px solid rgba(255,255,255,.05)',
        msOverflowStyle:'none', scrollbarWidth:'none',
      }}>
        {STORIES.map((s, i) => {
          const isYou = i === 0
          const isViewed = viewed.has(s.id) && !isYou
          return (
            <div key={s.id} onClick={() => openStory(i)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              cursor:'pointer', flexShrink:0, width:62,
            }}>
              <div style={{
                width:56, height:56, borderRadius:'50%', padding:2,
                background: isYou
                  ? 'rgba(255,255,255,.08)'
                  : isViewed
                    ? 'rgba(255,255,255,.12)'
                    : 'linear-gradient(135deg,#4ade80,#fbbf24,#4ade80)',
              }}>
                <div style={{
                  width:'100%', height:'100%', borderRadius:'50%', background:'#0a0a0a',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: isYou ? 20 : 24,
                  opacity: isViewed ? 0.5 : 1,
                }}>
                  {s.avatar}
                </div>
              </div>
              <span style={{
                fontSize:10, color: isViewed ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.7)',
                fontWeight:600, maxWidth:56, overflow:'hidden', textOverflow:'ellipsis',
                whiteSpace:'nowrap', textAlign:'center',
              }}>{s.name}</span>
            </div>
          )
        })}
      </div>

      {/* ── Fullscreen story viewer ── */}
      {viewerOpen && story && totalSlides > 0 && (
        <div style={{
          position:'fixed', inset:0, zIndex:500, background:'#000',
          display:'flex', flexDirection:'column',
        }}>
          {/* Progress bars */}
          <div style={{ display:'flex', gap:3, padding:'10px 10px 0' }}>
            {story.slides.map((_, i) => (
              <div key={i} style={{
                flex:1, height:2.5, borderRadius:2, background:'rgba(255,255,255,.2)', overflow:'hidden',
              }}>
                <div style={{
                  height:'100%', borderRadius:2, background:'#fff',
                  width: i < activeSlide ? '100%' : i === activeSlide ? '100%' : '0%',
                  animation: i === activeSlide ? 'storyProgress 5s linear forwards' : 'none',
                }}/>
              </div>
            ))}
          </div>

          {/* User info */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
              {story.avatar}
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:'#fff', flex:1 }}>{story.name}</span>
            <button onClick={() => setViewerOpen(false)} style={{
              width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.15)',
              border:'none', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>
          </div>

          {/* Slide content */}
          <div
            style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center',
              background: story.slides[activeSlide]?.bg || '#111',
              padding:24, position:'relative',
              overflow:'hidden',
            }}
            onTouchStart={e => {
              (e.currentTarget as HTMLDivElement).dataset.touchX = String(e.touches[0].clientX)
              ;(e.currentTarget as HTMLDivElement).dataset.touchY = String(e.touches[0].clientY)
            }}
            onTouchEnd={e => {
              const startX = Number((e.currentTarget as HTMLDivElement).dataset.touchX ?? 0)
              const startY = Number((e.currentTarget as HTMLDivElement).dataset.touchY ?? 0)
              const dx = e.changedTouches[0].clientX - startX
              const dy = e.changedTouches[0].clientY - startY
              // Only trigger if horizontal swipe is dominant
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                dx < 0 ? goNext() : goPrev()
              }
            }}
          >
            {/* Tap zones */}
            <div onClick={goPrev} style={{ position:'absolute', left:0, top:0, bottom:0, width:'30%', cursor:'pointer', zIndex:2 }}/>
            <div onClick={goNext} style={{ position:'absolute', right:0, top:0, bottom:0, width:'70%', cursor:'pointer', zIndex:2 }}/>

            <div style={{ textAlign:'center', maxWidth:320, zIndex:1, animation:'storySlideIn .3s ease both' }}>
              {story.slides[activeSlide]?.type === 'proverb' && (
                <span style={{ fontSize:28, display:'block', marginBottom:12 }}>📜</span>
              )}
              {story.slides[activeSlide]?.type === 'market' && (
                <span style={{ fontSize:28, display:'block', marginBottom:12 }}>🧺</span>
              )}
              <p style={{
                fontSize: story.slides[activeSlide]?.type === 'proverb' ? 18 : 20,
                fontWeight:700, color:'#fff', lineHeight:1.6,
                fontFamily: story.slides[activeSlide]?.type === 'proverb' ? 'Georgia,serif' : 'system-ui,sans-serif',
                fontStyle: story.slides[activeSlide]?.type === 'proverb' ? 'italic' : 'normal',
                textShadow:'0 2px 8px rgba(0,0,0,.4)', whiteSpace:'pre-line',
              }}>
                {story.slides[activeSlide]?.text}
              </p>
            </div>
          </div>

          {/* Reply bar */}
          <div style={{ padding:'12px 14px', background:'rgba(0,0,0,.6)', display:'flex', gap:8 }}>
            <input placeholder="Reply to story..." style={{
              flex:1, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)',
              borderRadius:24, padding:'10px 16px', color:'#fff', fontSize:13, outline:'none',
            }}/>
            <button style={{
              width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.1)',
              border:'none', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>❤️</button>
          </div>

          {/* Inject progress + slide keyframes */}
          <style>{`@keyframes storyProgress{from{width:0}to{width:100%}}@keyframes storySlideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}`}</style>
        </div>
      )}
    </>
  )
}
