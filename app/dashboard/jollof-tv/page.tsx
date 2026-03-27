'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect legacy /dashboard/jollof-tv → /dashboard/jollof
export default function JollofTVLegacyRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/jollof') }, [router])
  return (
    <div style={{ minHeight: '100dvh', background: '#0d0804', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 32, animation: 'pulse 1s infinite' }}>🔥</div>
    </div>
  )
}
