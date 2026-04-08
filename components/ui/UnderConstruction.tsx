'use client'

export default function UnderConstruction({ module }: { module: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20" style={{ minHeight: '60vh' }}>
      <div className="text-5xl mb-4">🏗</div>
      <div className="text-lg font-extrabold" style={{ color: 'var(--text-primary, #f0f7f0)' }}>
        Module Under Construction
      </div>
      <div className="text-sm mt-2 max-w-xs leading-relaxed" style={{ color: 'var(--text-muted, rgba(240,247,240,.4))' }}>
        <strong>{module}</strong> is being built. This module will be available
        when its backend service is connected.
      </div>
    </div>
  )
}
