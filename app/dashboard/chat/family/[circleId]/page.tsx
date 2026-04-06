'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function FamilyChatRoom() {
  const params = useParams()
  const router = useRouter()
  const circleId = params.circleId as string

  const [messages, setMessages] = useState<any[]>([
    { id: '1', type: 'family_update', content: '[System] Umoh Senior has been added to the Utibe Family Circle and verified via SMS.' },
    { id: '2', type: 'proverb', content: 'AI Griot: "A family is like a forest, when you are outside it is dense, when you are inside you see that each tree has its place." (Akan Proverb)', time: '09:00 AM' },
    { id: '3', type: 'text', author: 'Mma Utibe', localName: 'Iya', content: 'Are you both coming to the naming ceremony?', time: '09:30 AM', isMe: false },
    { id: '4', type: 'text', author: 'Kwame', localName: 'Egbon', content: 'Yes! Arriving on Friday.', time: '09:35 AM', isMe: false },
    { id: '5', type: 'text', author: 'You', localName: 'ME', content: 'I have arranged the transport proxy. See you soon.', time: '09:40 AM', isMe: true },
    { id: '6', type: 'blood_call', author: 'Fatima D.', localName: 'Aunt', location: 'Trade Fair, Lagos', time: '10:15 AM' },
    { id: '7', type: 'vault_request', author: 'You', localName: 'ME', reason: 'Unlocking Ancestral Land Deed', time: '11:00 AM', keeperCount: 3, approvers: 1 },
    { id: '8', type: 'recovery_request', author: 'Umoh Utibe', device: 'iPhone 14 Pro', location: 'Lagos, Nigeria', time: '11:45 AM' }
  ])

  // State for Recovery Form
  const [showRecoveryForm, setShowRecoveryForm] = useState(false)
  const [culturalAnswer, setCulturalAnswer] = useState('')
  const [recoveryStatus, setRecoveryStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [vaultApproved, setVaultApproved] = useState<Set<number>>(new Set())
  const [denied, setDenied] = useState<Set<number>>(new Set())
  const [reported, setReported] = useState<Set<number>>(new Set())
  const [inputMsg, setInputMsg] = useState('')

  const sendMsg = () => {
    if (!inputMsg.trim()) return
    setMessages(prev => [...prev, { id: String(Date.now()), type: 'text', author: 'You', localName: 'ME', content: inputMsg.trim(), time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }), isMe: true }])
    setInputMsg('')
  }

  const handleApproveRecovery = () => {
    // Simulated API call to POST /api/v1/family/recovery/approve
    if (culturalAnswer.trim().toLowerCase() === 'chops') {
      setRecoveryStatus('approved')
      setShowRecoveryForm(false)
    } else {
      alert("Incorrect cultural answer. You have 2 attempts remaining before the session is locked.")
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Chat Header */}
      <div style={{ padding: '15px 20px', background: '#111', borderBottom: '1px solid #262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🌳
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Utibe Family · 7 members</h2>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}/>
              5 Verified Bloodline Members
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
          <button onClick={() => router.push('/dashboard/profile/idile/family-tree')} style={{ background: 'transparent', border: 'none', color: '#7c3aed', fontSize: 20, cursor: 'pointer' }}>🌳</button>
          <button onClick={() => router.push('/dashboard/chat/voice-room')} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>📞</button>
        </div>
      </div>

      {/* Encryption Banner */}
      <div style={{ padding: 10, background: '#1e1030', textAlign: 'center', fontSize: 11, color: '#d8b4fe', borderBottom: '1px solid #3b0764' }}>
        🔒 Messages are end-to-end encrypted with keys derived from your verified Family Quorum.
      </div>

      {/* Message Feed */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => {

          if (msg.type === 'family_update') {
            return <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '10px 0' }}>{msg.content}</div>
          }

          if (msg.type === 'proverb') {
            return (
              <div key={i} style={{ alignSelf: 'center', maxWidth: '85%', background: 'rgba(212, 160, 23, 0.1)', border: '1px solid rgba(212, 160, 23, 0.3)', padding: 12, borderRadius: 12, color: '#fbbf24', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>
                {msg.content}
              </div>
            )
          }

          if (msg.type === 'blood_call') {
            return (
              <div key={i} style={{ alignSelf: 'center', width: '100%', maxWidth: 400, background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)', animation: 'pulse 2s infinite' }}>
                <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); } 70% { box-shadow: 0 0 0 15px rgba(220,38,38,0); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } }`}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 28 }}>🚨</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, textTransform: 'uppercase' }}>BLOOD-CALL SOS</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>{msg.author} ({msg.localName}) Needs Help</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 15 }}>
                  📍 Last known location: {msg.location}
                </div>
                <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(msg.location)}`, '_blank')} style={{ width: '100%', padding: 12, background: '#fff', color: '#b91c1c', border: 'none', borderRadius: 99, fontWeight: 800, cursor: 'pointer' }}>View Live GPS & Respond</button>
              </div>
            )
          }

          if (msg.type === 'vault_request') {
            return (
              <div key={i} style={{ alignSelf: 'center', width: '100%', maxWidth: 400, background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 24 }}>🏛</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Ancestral Vault Unlock Request</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Requested by {msg.author}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, marginBottom: 15, fontStyle: 'italic' }}>Reason: "{msg.reason}"</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                  <div style={{ flex: 1, height: 6, background: '#0f172a', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(msg.approvers / 2) * 100}%`, background: '#3b82f6', borderRadius: 99 }}/>
                  </div>
                  <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 700 }}>{msg.approvers} / 2 Keys</div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setVaultApproved(s => { const n = new Set(s); n.add(i); return n })} style={{ flex: 1, padding: 10, background: vaultApproved.has(i) ? '#22c55e' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{vaultApproved.has(i) ? '✅ Key Turned' : 'Turn Vault Key'}</button>
                  <button onClick={() => setDenied(s => { const n = new Set(s); n.add(i); return n })} disabled={denied.has(i)} style={{ flex: 1, padding: 10, background: '#0f172a', color: denied.has(i) ? 'rgba(255,255,255,.3)' : '#ef4444', border: '1px solid #334155', borderRadius: 8, fontWeight: 700, cursor: denied.has(i) ? 'default' : 'pointer' }}>{denied.has(i) ? '⛔ Denied' : 'Deny Access'}</button>
                </div>
              </div>
            )
          }

          if (msg.type === 'recovery_request') {
            return (
              <div key={i} style={{ alignSelf: 'center', width: '100%', maxWidth: 400, background: '#4c1d95', border: '1px solid #7c3aed', borderRadius: 16, padding: '16px 20px', boxShadow: '0 4px 20px rgba(124,58,237,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 24 }}>🥁</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, textTransform: 'uppercase' }}>RECOVERY REQUEST</div>
                    <div style={{ fontSize: 12, color: '#e9d5ff' }}>{msg.author} is requesting account recovery.</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, fontSize: 12, marginBottom: 15, color: '#d8b4fe' }}>
                  <div style={{ marginBottom: 4 }}>📱 Device: {msg.device}</div>
                  <div style={{ marginBottom: 4 }}>📍 Location: {msg.location}</div>
                  <div>🕒 Time: {msg.time}</div>
                </div>

                {recoveryStatus === 'pending' && !showRecoveryForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={() => setShowRecoveryForm(true)} style={{ padding: 12, background: '#fff', color: '#4c1d95', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>Answer Security Question</button>
                    <button onClick={() => setReported(s => { const n = new Set(s); n.add(i); return n })} style={{ padding: 12, background: reported.has(i) ? 'rgba(74,222,128,.15)' : 'rgba(220, 38, 38, 0.15)', color: reported.has(i) ? '#4ade80' : '#ef4444', border: `1px solid ${reported.has(i) ? 'rgba(74,222,128,.3)' : 'rgba(220, 38, 38, 0.3)'}`, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{reported.has(i) ? '✅ Reported' : 'Report Suspicious'}</button>
                  </div>
                )}

                {recoveryStatus === 'pending' && showRecoveryForm && (
                  <div style={{ background: '#2e1065', padding: 15, borderRadius: 12, marginTop: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#fff' }}>Security Challenge:</div>
                    <div style={{ fontSize: 13, marginBottom: 15, fontStyle: 'italic', color: '#d8b4fe' }}>"What is Umoh's childhood nickname?"</div>
                    <input
                      type="text"
                      placeholder="Type the answer here..."
                      value={culturalAnswer}
                      onChange={e => setCulturalAnswer(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#111', border: '1px solid #4c1d95', borderRadius: 6, color: '#fff', marginBottom: 10, fontSize: 14 }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={handleApproveRecovery} disabled={!culturalAnswer} style={{ flex: 1, padding: 10, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', opacity: !culturalAnswer ? 0.5 : 1 }}>Approve Recovery</button>
                      <button onClick={() => setShowRecoveryForm(false)} style={{ padding: 10, background: 'transparent', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {recoveryStatus === 'approved' && (
                  <div style={{ padding: 12, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: 8, textAlign: 'center', fontWeight: 700, fontSize: 13, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    ✅ You have approved this recovery. Waiting for 1 more Bloodline member.
                  </div>
                )}
              </div>
            )
          }

          // Regular Text Messages
          return (
            <div key={i} style={{ alignSelf: msg.isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', flexDirection: 'column' }}>
              {!msg.isMe && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4, marginLeft: 2 }}>
                  <strong style={{ color: '#fff' }}>{msg.author}</strong> · <span style={{ color: '#fbbf24' }}>{msg.localName}</span>
                </div>
              )}
              <div style={{ padding: '12px 16px', background: msg.isMe ? '#7c3aed' : '#1a1a1a', borderRadius: 16, borderBottomRightRadius: msg.isMe ? 4 : 16, borderBottomLeftRadius: msg.isMe ? 16 : 4, border: msg.isMe ? 'none' : '1px solid #262626', fontSize: 14, lineHeight: 1.4 }}>
                {msg.content}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, alignSelf: msg.isMe ? 'flex-end' : 'flex-start', marginRight: msg.isMe ? 2 : 0 }}>
                {msg.time}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chat Input */}
      <div style={{ padding: 20, background: '#111', borderTop: '1px solid #262626', display: 'flex', gap: 10 }}>
        <button onClick={() => router.push('/dashboard/profile')} style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1a1a', border: '1px solid #262626', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
        <input
          type="text"
          placeholder="Message Utibe Family..."
          value={inputMsg}
          onChange={e => setInputMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMsg() }}
          style={{ flex: 1, background: '#1a1a1a', border: '1px solid #262626', borderRadius: 99, padding: '0 20px', color: '#fff', fontSize: 14 }}
        />
        <button onClick={sendMsg} style={{ width: 44, height: 44, borderRadius: '50%', background: inputMsg.trim() ? '#7c3aed' : '#2a1a4a', border: 'none', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputMsg.trim() ? 'pointer' : 'default' }}>➤</button>
      </div>

    </div>
  )
}
