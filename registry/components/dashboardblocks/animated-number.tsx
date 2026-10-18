'use client'

import { useAnimatedNumber } from '@/registry/hooks/use-animated-number'
import type { ReactNode } from 'react'

interface AnimatedNumberProps {
  value: number
  /** Milliseconds, 1000 by default. */
  duration?: number
  /** @default 'easeOut' */
  easing?: 'linear' | 'easeOut' | 'easeIn' | 'easeInOut' | 'spring'
  /** @default 0 */
  from?: number
  /** Milliseconds, 0 by default. */
  delay?: number
  formatter?: (value: number) => ReactNode
  className?: string
}

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

  const displayValue = formatter ? formatter(value) : value.toLocaleString('en-US')

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {displayValue}
    </span>
  )
}
