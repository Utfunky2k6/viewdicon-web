/**
 * Redirect to unified Love World → KÈRÉWÀ realm
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function KerawaRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/love/kerawa') }, [router])
  return null
}
