'use client'
import * as React from 'react'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

const CATEGORIES = ['Announcement', 'Poll', 'Event', 'Urgent']
const CAT_COLORS: Record<string, string> = { Announcement: '#3b82f6', Poll: '#8b5cf6', Event: '#1a7c3e', Urgent: '#ef4444' }

interface Post { title: string; message: string; cat: string; author: string; time: string; reactions: number; pinned?: boolean }

const INITIAL: Post[] = [
  { title: 'Market closes early Friday', message: 'Due to the village gathering, the market will close at 14:00 on Friday. Plan accordingly.', cat: 'Announcement', author: 'NG-YOR-••••-1234', time: '2h ago', reactions: 18, pinned: true },
  { title: 'Poll: New Market Hours', message: 'Should we extend market hours to 8pm? Vote below.', cat: 'Poll', author: 'GH-TWI-••••-5678', time: '5h ago', reactions: 42 },
  { title: 'Monthly Ajo Collection', message: 'Monthly Ajo collection is this Saturday at 10am. All members must attend.', cat: 'Event', author: 'SN-WOL-••••-9012', time: '1d ago', reactions: 9 },
]

export default function CommunityBoard() {
  const [posts, setPosts] = React.useState<Post[]>(INITIAL)
  const [title, setTitle] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [cat, setCat] = React.useState('Announcement')
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const post = () => {
    if (!title || !message) return
    setPosts(p => [{ title, message, cat, author: 'NG-YOR-••••-••••', time: 'now', reactions: 0 }, ...p])
    setTitle(''); setMessage('')
    showToast('✓ Post published to village board')
  }

  const pinned = posts.filter(p => p.pinned)
  const rest = posts.filter(p => !p.pinned)

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {/* Post form */}
      <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Post Announcement</div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." style={{ width: '100%', background: '#060d07', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." rows={3} style={{ width: '100%', background: '#060d07', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 12, outline: 'none', resize: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', background: cat === c ? CAT_COLORS[c] : C.muted, color: cat === c ? '#fff' : C.sub }}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={post} style={{ width: '100%', padding: 10, borderRadius: 10, background: C.green, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
          Post to Village Board
        </button>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>📌 Pinned</div>
          {pinned.map((p, i) => <PostCard key={i} post={p} />)}
        </div>
      )}

      <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Recent Posts</div>
      {rest.map((p, i) => <PostCard key={i} post={p} />)}
    </div>
  )
}

function PostCard({ post }: { post: { title: string; message: string; cat: string; author: string; time: string; reactions: number; pinned?: boolean } }) {
  const [reacted, setReacted] = React.useState(false)
  const [count, setCount] = React.useState(post.reactions)
  const PC: Record<string, string> = { Announcement: '#3b82f6', Poll: '#8b5cf6', Event: '#1a7c3e', Urgent: '#ef4444' }
  const color = PC[post.cat] ?? '#3b82f6'

  return (
    <div style={{ background: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{post.title}</div>
        <span style={{ fontSize: 9, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 99, padding: '2px 8px', marginLeft: 8, whiteSpace: 'nowrap' }}>{post.cat}</span>
      </div>
      <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.5, marginBottom: 8 }}>{post.message}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 9, color: C.sub }}>{post.author} · {post.time}</div>
        <button onClick={() => { if (!reacted) { setReacted(true); setCount(c => c + 1) } }} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: reacted ? 'rgba(26,124,62,.15)' : C.muted, border: `1px solid ${reacted ? 'rgba(26,124,62,.3)' : C.border}`, color: reacted ? '#4ade80' : C.sub, cursor: 'pointer', fontWeight: 700 }}>
          👍 {count}
        </button>
      </div>
    </div>
  )
}
