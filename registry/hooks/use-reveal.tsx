'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { type RefObject, useEffect, useState } from 'react'

/** `revealed` turns true the frame after the element scrolls into view, so a bar can animate from zero; it starts true when `animated` is off. */
function useReveal<T extends HTMLElement = HTMLDivElement>(animated: boolean) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  return { ref: ref as RefObject<T>, revealed }
}

export { useReveal }
