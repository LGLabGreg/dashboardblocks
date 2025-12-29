'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export interface RingProps {
  ariaLabel?: string
  children?: ReactNode
  className?: string
  percentage: number
  radius?: number
  ringColor?: string
  ringTrackColor?: string
  strokeWidth?: number
}

export const Ring = ({
  ariaLabel,
  children,
  className = '',
  percentage,
  radius = 40,
  ringColor = 'var(--color-primary)',
  ringTrackColor = 'var(--color-muted)',
  strokeWidth = 12,
}: RingProps) => {
  const [value, setValue] = useState(0)
  const { isInView, ref } = useInView()
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  useEffect(() => {
    if (isInView) {
      // Small delay to ensure the initial render happens at 0
      const timer = requestAnimationFrame(() => {
        setValue(percentage)
      })
      return () => cancelAnimationFrame(timer)
    }
  }, [isInView, percentage])

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={cn('relative shrink-0', className)}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      <svg className='h-full w-full -rotate-90' viewBox='0 0 100 100'>
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='none'
          stroke={ringTrackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='none'
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className='transition-all duration-1000 ease-out-expo'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>{children}</div>
    </div>
  )
}
