'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { useCallback, useEffect, useRef, useState } from 'react'

type EasingFunction = (t: number) => number

const easings: Record<string, EasingFunction> = {
  linear: (t) => t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeIn: (t) => t * t * t,
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: (t) => 1 - Math.pow(Math.cos(t * Math.PI * 0.5), 3),
}

interface UseAnimatedNumberOptions {
  /**
   * Duration of the animation in milliseconds
   * @default 1000
   */
  duration?: number
  /**
   * Easing function for the animation
   * @default 'easeOut'
   */
  easing?: keyof typeof easings | EasingFunction
  /**
   * Starting value for the animation
   * @default 0
   */
  from?: number
  /**
   * Intersection Observer threshold (0-1)
   * @default 0.1
   */
  threshold?: number
  /**
   * Intersection Observer root margin
   * @default '0px'
   */
  rootMargin?: string
  /**
   * Delay before starting animation in milliseconds
   * @default 0
   */
  delay?: number
  /**
   * Whether to re-animate when element comes back into view
   * @default false
   */
  reanimateOnView?: boolean
}

export function useAnimatedNumber(to: number, options: UseAnimatedNumberOptions = {}) {
  const {
    delay = 0,
    duration = 1000,
    easing = 'easeOut',
    from = 0,
    reanimateOnView = false,
    rootMargin = '0px',
    threshold = 1.0,
  } = options

  const [value, setValue] = useState(from)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasAnimated = useRef(false)
  // Mirrors the displayed value so a new target animates from where it is now
  const valueRef = useRef(from)
  const previousTo = useRef(to)
  const animationRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { isInView, ref } = useInView({ rootMargin, threshold })

  const decimals = to.toString().split('.')[1]?.length || 0

  const easingFn =
    typeof easing === 'function' ? easing : easings[easing] || easings.easeOut

  const cancel = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const animate = useCallback(
    (startValue: number = valueRef.current) => {
      cancel()

      const startTime = performance.now()

      setIsAnimating(true)

      const tick = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easingFn(progress)
        const currentValue = startValue + (to - startValue) * easedProgress
        const rounded =
          decimals > 0 ? Number(currentValue.toFixed(decimals)) : Math.round(currentValue)

        valueRef.current = rounded
        setValue(rounded)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick)
        } else {
          setIsAnimating(false)
          animationRef.current = null
        }
      }

      animationRef.current = requestAnimationFrame(tick)
    },
    [cancel, to, duration, easingFn, decimals],
  )

  const reset = useCallback(() => {
    cancel()
    valueRef.current = from
    setValue(from)
    setIsAnimating(false)
    hasAnimated.current = false
  }, [cancel, from])

  const startAnimation = useCallback(
    (startValue?: number) => {
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => animate(startValue), delay)
      } else {
        animate(startValue)
      }
    },
    [animate, delay],
  )

  // Latest callbacks, read by the in-view effect without re-running it on every change
  const startAnimationRef = useRef(startAnimation)
  useEffect(() => {
    startAnimationRef.current = startAnimation
  }, [startAnimation])

  // Trigger animation when element comes into view
  useEffect(() => {
    if (!isInView) return
    if (hasAnimated.current && !reanimateOnView) return

    // Defer to the next frame so the initial value paints first
    const frame = requestAnimationFrame(() => {
      hasAnimated.current = true
      startAnimationRef.current(reanimateOnView ? from : valueRef.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [isInView, reanimateOnView, from])

  // Retarget from the current value when the target changes after the first run
  useEffect(() => {
    if (previousTo.current === to) return
    previousTo.current = to
    if (hasAnimated.current) animate(valueRef.current)
  }, [to, animate])

  // Cleanup animations and timeouts on unmount
  useEffect(() => cancel, [cancel])

  return {
    animate,
    isAnimating,
    isInView,
    ref,
    reset,
    value,
  }
}
