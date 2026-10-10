'use client'

import { useLayoutEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  /**
   * Intersection Observer threshold (0-1)
   * @default 1.0
   */
  threshold?: number
  /**
   * Intersection Observer root margin
   * @default '0px'
   */
  rootMargin?: string
}

export function useInView(options: UseInViewOptions = {}) {
  const { rootMargin = '0px', threshold = 1.0 } = options

  const ref = useRef<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, threshold])

  return {
    isInView,
    ref,
  }
}
