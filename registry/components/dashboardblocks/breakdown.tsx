'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface BreakdownSegment {
  color: string
  label: string
  value: number
}

/** Neutral fill for an "Other" segment that folds the long tail. */
const BREAKDOWN_OTHER_COLOR =
  'color-mix(in oklab, var(--muted-foreground) 35%, transparent)'

function getTotal(segments: BreakdownSegment[]) {
  return segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0)
}

function formatShare(value: number, total: number, fractionDigits = 0) {
  if (total <= 0) return '0%'
  return `${((value / total) * 100).toFixed(fractionDigits)}%`
}

/** Flips to true once the element scrolls into view, after the first paint. */
function useReveal<T extends HTMLElement>(animated: boolean) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  return { ref: ref as RefObject<T>, revealed }
}

interface BreakdownBarProps {
  animated?: boolean
  className?: string
  segments: BreakdownSegment[]
}

/** A 100% bar split into segments, separated by 2px surface gaps. */
function BreakdownBar({ animated = true, className, segments }: BreakdownBarProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>(animated)
  const total = getTotal(segments)

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('flex h-3 w-full gap-0.5 overflow-hidden rounded-full', className)}
    >
      {segments.map((segment) => {
        const share = total > 0 ? Math.max(0, segment.value) / total : 0
        return (
          <div
            key={segment.label}
            className='h-full min-w-0 transition-[flex-grow] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
            style={{
              backgroundColor: segment.color,
              flexBasis: 0,
              flexGrow: revealed ? share : 0,
            }}
          />
        )
      })}
    </div>
  )
}

interface BreakdownKeyProps {
  className?: string
  color: string
}

function BreakdownKey({ className, color }: BreakdownKeyProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-[3px]', className)}
      style={{ backgroundColor: color }}
    />
  )
}

interface BreakdownLegendProps {
  className?: string
  items: Pick<BreakdownSegment, 'color' | 'label'>[]
}

function BreakdownLegend({ className, items }: BreakdownLegendProps) {
  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.label} className='flex items-center gap-1.5'>
          <BreakdownKey color={item.color} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export {
  BREAKDOWN_OTHER_COLOR,
  BreakdownBar,
  BreakdownKey,
  BreakdownLegend,
  formatShare,
  getTotal,
  useReveal,
}

export type { BreakdownBarProps, BreakdownSegment }
