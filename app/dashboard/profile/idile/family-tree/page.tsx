'use client'
import React, { useState } from 'react'

type NodeState = 'verified' | 'pending' | 'deceased'
interface TreeNode {
  id: string
  label: string
  sub: string
  state: NodeState
  cx: number
  cy: number
  isViewdicon?: boolean
}

export default function FamilyTreeSVG() {
  const [selected, setSelected] = useState<TreeNode | null>(null)

  // Hardcoded coordinate layout for the topological family tree
  const nodes: TreeNode[] = [
    { id: 'gf_pat', label: 'Baba Agba', sub: 'Grandfather', state: 'deceased', cx: 200, cy: 100 },
    { id: 'gm_pat', label: 'Iya Agba', sub: 'Grandmother', state: 'deceased', cx: 350, cy: 100 },
    { id: 'gf_mat', label: 'Baba Iya', sub: 'Grandfather', state: 'verified', cx: 650, cy: 100 },
    { id: 'gm_mat', label: 'Iya Iya', sub: 'Grandmother', state: 'verified', cx: 800, cy: 100 },
    
    { id: 'father', label: 'Umoh Snr', sub: 'Baba', state: 'verified', cx: 275, cy: 250, isViewdicon: true },
    { id: 'mother', label: 'Mma Utibe', sub: 'Iya', state: 'verified', cx: 725, cy: 250, isViewdicon: true },
    
    { id: 'bro', label: 'Kwame', sub: 'Egbon', state: 'pending', cx: 300, cy: 400, isViewdicon: true },
    { id: 'me', label: 'You', sub: 'ME', state: 'verified', cx: 500, cy: 400, isViewdicon: true },
    { id: 'sis', label: 'Chioma', sub: 'Aburo', state: 'verified', cx: 700, cy: 400 },
    
    { id: 'child', label: 'Ebenezer', sub: 'Son', state: 'pending', cx: 500, cy: 550 },
  ]

  const links = [
    // Paternal Grandparents union
    { x1: 200, y1: 100, x2: 350, y2: 100 },
    // Maternal Grandparents union
    { x1: 650, y1: 100, x2: 800, y2: 100 },
    // Descent to Father
    { x1: 275, y1: 100, x2: 275, y2: 250 },
    // Descent to Mother
    { x1: 725, y1: 100, x2: 725, y2: 250 },
    // Parents union
    { x1: 275, y1: 250, x2: 725, y2: 250 },
    // Descent to Children
    { x1: 500, y1: 250, x2: 500, y2: 400 },
    // Siblings line
    { x1: 300, y1: 400, x2: 700, y2: 400 },
    // Descent to Son
    { x1: 500, y1: 400, x2: 500, y2: 550 },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0510', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Topology Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ position: 'absolute', top: 40, left: 40, margin: 0, color: '#d8b4fe', fontSize: 24 }}>Ìdílé Family Tree</h2>
        
        <svg width="100%" height="100%" viewBox="0 0 1000 700" style={{ filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.1))' }}>
          {/* Animated Connecting Lines */}
          {links.map((l, i) => (
            <line 
              key={i} 
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} 
              stroke="rgba(168, 85, 247, 0.3)" 
              strokeWidth="3" 
              strokeDasharray="6 6"
            />
          ))}

          {/* SVG Nodes */}
          {nodes.map(node => {
            const isVerified = node.state === 'verified'
            const isDeceased = node.state === 'deceased'
            const strokeColor = isDeceased ? '#52525B' : isVerified ? '#22C55E' : '#F59E0B'
            const bgColor = isDeceased ? '#18181B' : '#2e1065'

            return (
              <g 
                key={node.id} 
                transform={`translate(${node.cx}, ${node.cy})`} 
                onClick={() => setSelected(node)} 
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                <circle r="40" fill={bgColor} stroke={strokeColor} strokeWidth="4" />
                
                {/* Vi Logo for Viewdicon users */}
                {node.isViewdicon && !isDeceased && (
                  <circle cx="28" cy="-28" r="12" fill="#7C3AED" stroke="#000" strokeWidth="2" />
                )}
                {node.isViewdicon && !isDeceased && (
                  <text x="28" y="-24" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Vi</text>
                )}

                {/* Deceased Dove */}
                {isDeceased && (
                  <text x="0" y="5" textAnchor="middle" fontSize="24">🕊️</text>
                )}
                {!isDeceased && (
                  <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="24">
                    {node.id.includes('pat') || node.id.includes('ather') || node.id.includes('bro') ? '👨🏾' : '👩🏾'}
                  </text>
                )}

                <text y="60" textAnchor="middle" fill="#e9d5ff" fontSize="14" fontWeight="bold">{node.label}</text>
                <text y="75" textAnchor="middle" fill="rgba(233,213,255,0.6)" fontSize="11">{node.sub}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Side Panel */}
      {selected && (
        <div style={{ width: 320, background: '#1e1030', borderLeft: '1px solid #3b0764', padding: 24, display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setSelected(null)} style={{ alignSelf: 'flex-end', background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>×</button>
          
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4c1d95', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
              {selected.state === 'deceased' ? '🕊️' : '📸'}
            </div>
            <h3 style={{ margin: 0, fontSize: 22, color: '#fff' }}>{selected.label}</h3>
            <p style={{ margin: '5px 0 20px', color: '#d8b4fe', fontSize: 14 }}>{selected.sub}</p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 15, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Status</span>
              <strong style={{ color: selected.state === 'verified' ? '#22c55e' : selected.state === 'deceased' ? '#71717a' : '#f59e0b', textTransform: 'capitalize' }}>
                {selected.state}
              </strong>
            </div>
            {selected.isViewdicon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Viewdicon ID</span>
                <strong style={{ color: '#fff' }}>AKN-4X9P</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <button disabled={selected.state === 'deceased'} style={{ padding: 14, borderRadius: 12, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 700, cursor: selected.state === 'deceased' ? 'not-allowed' : 'pointer', opacity: selected.state === 'deceased' ? 0.3 : 1 }}>
              💬 Message in Family Chat
            </button>
            <button disabled={selected.state === 'deceased'} style={{ padding: 14, borderRadius: 12, background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', border: '1px solid rgba(220, 38, 38, 0.3)', fontWeight: 700, cursor: selected.state === 'deceased' ? 'not-allowed' : 'pointer', opacity: selected.state === 'deceased' ? 0.3 : 1 }}>
              🚨 Send Blood-Call Test
            </button>
            <button style={{ padding: 14, borderRadius: 12, background: 'transparent', color: '#d8b4fe', border: '1px solid #5b21b6', fontWeight: 700, cursor: 'pointer' }}>
              ⚙️ Update Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
