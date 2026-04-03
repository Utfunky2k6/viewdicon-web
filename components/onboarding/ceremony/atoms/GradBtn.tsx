'use client'
import * as React from 'react'

interface GradBtnProps {
  onClick: () => void
  children: React.ReactNode
  style?: React.CSSProperties
  disabled?: boolean
}

export function GradBtn({ onClick, children, style, disabled }: GradBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '15px 20px',
        border: 'none',
        borderRadius: 16,
        background: disabled ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg,#1a7c3e,#b22222)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        transition: 'all .2s ease',
        ...style
      }}
    >
      {!disabled && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(255,255,255,.18),transparent)', pointerEvents: 'none' }} />
      )}
      <span style={{ position: 'relative' }}>{children}</span>
    </button>
  )
}
