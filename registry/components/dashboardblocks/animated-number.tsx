'use client'

import { useAnimatedNumber } from '@/registry/hooks/use-animated-number'
import { ReactNode } from 'react'

interface AnimatedNumberProps {
  /**
   * The target value to animate to
   */
  value: number
  /**
   * Duration of the animation in milliseconds
   * @default 1000
   */
  duration?: number
  /**
   * Easing function for the animation
   * @default 'easeOut'
   */
  easing?: 'linear' | 'easeOut' | 'easeIn' | 'easeInOut' | 'spring'
  /**
   * Starting value for the animation
   * @default 0
   */
  from?: number
  /**
   * Delay before starting animation in milliseconds
   * @default 0
   */
  delay?: number
  /**
   * Custom formatter function
   */
  formatter?: (value: number) => ReactNode
  /**
   * Additional className for the wrapper span
   */
  className?: string
}

/**
 * A component that animates a number from a start value to an end value,
 * with viewport detection to only animate when visible.
 */
export function AnimatedNumber({
  className,
  delay = 0,
  duration = 1000,
  easing = 'easeOut',
  formatter,
  from = 0,
  value: targetValue,
}: AnimatedNumberProps) {
  const { ref, value } = useAnimatedNumber(targetValue, {
    delay,
    duration,
    easing,
    from,
  })

  const displayValue = formatter ? formatter(value) : value.toLocaleString()

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {displayValue}
    </span>
  )
}
