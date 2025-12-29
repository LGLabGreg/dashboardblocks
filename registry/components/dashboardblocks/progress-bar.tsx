'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  className?: string
  fillClassName?: string
  percentage: number
}

export const ProgressBar = ({
  className,
  percentage,
  fillClassName,
}: ProgressBarProps) => {
  const [width, setWidth] = useState(0)
  const { isInView, ref } = useInView()

  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))

  useEffect(() => {
    if (isInView) {
      // Small delay to ensure the initial render happens at 0
      const timer = requestAnimationFrame(() => {
        setWidth(normalized)
      })
      return () => cancelAnimationFrame(timer)
    }
  }, [isInView, normalized])

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn('h-2 w-full rounded-full bg-muted', className)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-primary transition-width! duration-1000 ease-out-expo',
          fillClassName,
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export interface SegmentedProgressBarProps {
  className?: string
  segments: Array<{
    color?: string
    label?: string
    value: number
  }>
  total: number
}

export const SegmentedProgressBar = ({
  className,
  segments,
  total,
}: SegmentedProgressBarProps) => {
  const safeTotal = total > 0 ? total : 1

  return (
    <div
      className={cn('flex h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      {segments.map((segment, index) => {
        const percentage = (segment.value / safeTotal) * 100
        return (
          <div
            key={segment.label || index}
            className='h-full transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full'
            style={{
              width: `${Math.max(0, percentage)}%`,
              backgroundColor: segment.color || 'hsl(var(--primary))',
            }}
            title={segment.label ? `${segment.label}: ${segment.value}` : undefined}
          />
        )
      })}
    </div>
  )
}
