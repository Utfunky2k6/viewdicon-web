'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const red = '#e05a4e'

interface Review {
  id: string
  name: string
  initials: string
  rating: number
  body: string
  date: string
  replied: boolean
}

const REVIEWS: Review[] = [
  { id: 'r1', name: 'Ngozi Okonkwo', initials: 'NO', rating: 5, body: 'Absolutely loved the Ankara fabric! Arrived quickly and the quality is top-notch. Will definitely order again.', date: 'Mar 25', replied: false },
  { id: 'r2', name: 'Chukwu Eze', initials: 'CE', rating: 5, body: 'Fast delivery and very well packaged. Mama Ngozi is reliable as always!', date: 'Mar 24', replied: true },
  { id: 'r3', name: 'Fatima Diallo', initials: 'FD', rating: 4, body: 'Great product, slight delay in dispatch but resolved quickly. Shea butter is pure quality.', date: 'Mar 23', replied: false },
  { id: 'r4', name: 'Kwame Asante', initials: 'KA', rating: 3, body: 'Color was slightly different from photos but still good value overall.', date: 'Mar 22', replied: false },
  { id: 'r5', name: 'Amina Bello', initials: 'AB', rating: 5, body: 'Best seller in the village! My beads necklace is the star of every gathering.', date: 'Mar 21', replied: true },
]

const STARS = [5, 4, 3, 2, 1]
const STAR_PCTS = [68, 22, 7, 2, 1]

const SENTIMENTS = [
  { label: 'Fast delivery 🚀', count: 112 },
  { label: 'Quality product ✅', count: 89 },
  { label: 'Good value 💰', count: 74 },
  { label: 'Reliable seller 🤝', count: 61 },
]

function StarRow({ n }: { n: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? gold : border, fontSize: 14 }}>★</span>
      ))}
    </span>
  )
}

export default function ReviewTracker({ villageId, roleKey }: ToolProps) {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [allReplied, setAllReplied] = useState(false)

  function submitReply(id: string) {
    if (!replyText.trim()) return
    setReviews(prev => prev.map(r => r.id === id ? { ...r, replied: true } : r))
    setReplyingTo(null)
    setReplyText('')
  }

  function respondAll() {
    setReviews(prev => prev.map(r => ({ ...r, replied: true })))
    setAllReplied(true)
  }

  const unread = reviews.filter(r => !r.replied).length

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>CUSTOMER REVIEWS</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Review Tracker</div>

      {/* Overall rating */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: gold, lineHeight: 1 }}>4.7</div>
            <div style={{ fontSize: 18, color: gold }}>★★★★★</div>
            <div style={{ fontSize: 11, color: muted }}>284 reviews</div>
          </div>
          <div style={{ flex: 1 }}>
            {STARS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ fontSize: 11, color: muted, width: 14 }}>{s}★</div>
                <div style={{ flex: 1, background: border, borderRadius: 4, height: 7 }}>
                  <div style={{ width: `${STAR_PCTS[i]}%`, background: gold, height: '100%', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: muted, width: 26, textAlign: 'right' }}>{STAR_PCTS[i]}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SENTIMENTS.map(s => (
            <div key={s.label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: '5px 12px', fontSize: 12 }}>
              {s.label} <span style={{ color: muted }}>({s.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Respond all */}
      {unread > 0 && !allReplied && (
        <button
          onClick={respondAll}
          style={{
            width: '100%', background: '#1a4d2e', color: green,
            border: `1px solid ${green}`, borderRadius: 10,
            padding: '11px 0', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', marginBottom: 16,
          }}
        >
          Respond to All Unread ({unread})
        </button>
      )}

      {/* Reviews list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews.map(r => (
          <div key={r.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: `linear-gradient(135deg, ${green}, ${gold})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0,
              }}>{r.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</span>
                  <span style={{ fontSize: 11, color: muted }}>{r.date}</span>
                </div>
                <StarRow n={r.rating} />
              </div>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: 13, color: text, lineHeight: 1.5 }}>{r.body}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {r.replied
                ? <span style={{ fontSize: 11, color: green }}>✓ Replied</span>
                : <button onClick={() => setReplyingTo(r.id)} style={{ border: `1px solid ${border}`, background: 'transparent', color: muted, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Reply</button>
              }
            </div>
            {replyingTo === r.id && (
              <div style={{ marginTop: 10 }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={2}
                  style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 10px', color: text, fontSize: 13, resize: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={() => setReplyingTo(null)} style={{ flex: 1, border: `1px solid ${border}`, background: 'transparent', color: muted, borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                  <button onClick={() => submitReply(r.id)} style={{ flex: 2, border: 'none', background: green, color: '#000', borderRadius: 6, padding: '6px 0', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Send Reply</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
