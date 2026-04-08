/**
 * Redirect to unified Love World → ÀJỌ CONNECT realm
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AjoConnectRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/love/ajo') }, [router])
  return null
}
