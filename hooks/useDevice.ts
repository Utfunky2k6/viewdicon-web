'use client'
import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────
// useDevice — SSR-safe device detection
// Returns null on server / first render (default → MobileShell)
// After mount, returns the correct device class based on viewport
//
// Breakpoints (aligned with design spec):
//  mobile  : 0–767px
//  tablet  : 768–1023px
//  desktop : 1024–1919px
//  wide    : 1920px+
// ─────────────────────────────────────────────────────────────
export type Device = 'mobile' | 'tablet' | 'desktop' | 'wide'

function getDevice(width: number): Device {
  if (width < 768)  return 'mobile'
  if (width < 1024) return 'tablet'
  if (width < 1920) return 'desktop'
  return 'wide'
}

export function useDevice(): Device | null {
  const [device, setDevice] = useState<Device | null>(null)

  useEffect(() => {
    function detect() {
      setDevice(getDevice(window.innerWidth))
    }
    detect()
    window.addEventListener('resize', detect)
    return () => window.removeEventListener('resize', detect)
  }, [])

  return device
}
