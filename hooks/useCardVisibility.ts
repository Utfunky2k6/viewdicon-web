'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * IntersectionObserver hook — tracks whether a card is ≥60% visible.
 * Used by MotionFeed to autoplay/pause video and audio when scrolled
 * into or out of the viewport.
 */
export function useCardVisibility(threshold = 0.6) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

/**
 * Tracks which card index is currently most visible in a snap-scroll container.
 * Returns the active index for progress indicators.
 */
export function useActiveCardIndex() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const cardHeight = container.clientHeight
    if (cardHeight > 0) {
      setActiveIndex(Math.round(scrollTop / cardHeight))
    }
  }, [])

  return { activeIndex, handleScroll }
}
