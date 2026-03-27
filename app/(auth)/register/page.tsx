'use client'
// Register page is now a thin redirect to /ceremony
// The full onboarding flow (phone → OTP → naming → AfroID reveal)
// lives in /ceremony as a unified state machine.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DrumPulseScreen } from '@/components/ui/DrumPulse'

export default function RegisterPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/ceremony') }, [router])
  return <DrumPulseScreen label="Preparing your Naming Ceremony…" speed="medium" />
}
