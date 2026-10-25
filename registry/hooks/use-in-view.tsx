'use client'

import { useLayoutEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  /** From 0 to 1, 1 by default. */
  threshold?: number
  /** @default '0px' */
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
      (entries) => {
        const latest = entries.at(-1)
        if (latest) setIsInView(latest.isIntersecting)
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
