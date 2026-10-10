'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

function getDelta(current: number, previous: number) {
  const difference = current - previous
  const percent = previous === 0 ? 0 : (difference / Math.abs(previous)) * 100
  return { difference, percent: Math.round(percent * 10) / 10 }
}

interface ProportionTest {
  /** Absolute difference in rate (b − a), with its 95% interval. */
  difference: number
  high: number
  /** Relative lift of b over a, with its 95% interval, as fractions. */
  lift: number
  liftHigh: number
  liftLow: number
  low: number
  rateA: number
  rateB: number
  significant: boolean
}

function compareProportions(
  a: { conversions: number; visitors: number },
  b: { conversions: number; visitors: number },
): ProportionTest {
  const rateA = a.visitors > 0 ? a.conversions / a.visitors : 0
  const rateB = b.visitors > 0 ? b.conversions / b.visitors : 0
  const se = Math.sqrt(
    (a.visitors > 0 ? (rateA * (1 - rateA)) / a.visitors : 0) +
      (b.visitors > 0 ? (rateB * (1 - rateB)) / b.visitors : 0),
  )
  const difference = rateB - rateA
  const low = difference - 1.96 * se
  const high = difference + 1.96 * se
  return {
    difference,
    high,
    lift: rateA > 0 ? difference / rateA : 0,
    liftHigh: rateA > 0 ? high / rateA : 0,
    liftLow: rateA > 0 ? low / rateA : 0,
    low,
    rateA,
    rateB,
    significant: low > 0 || high < 0,
  }
}

function useReveal(animated: boolean) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  return { ref: ref as RefObject<HTMLDivElement>, revealed }
}

interface DivergingBarProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-2)' */
  color?: string
  max: number
  value: number
}

function DivergingBar({
  animated = true,
  className,
  color = 'var(--chart-2)',
  max,
  value,
}: DivergingBarProps) {
  const { ref, revealed } = useReveal(animated)
  const share = max > 0 ? Math.min(1, Math.abs(value) / max) : 0
  const width = `${(revealed ? share : 0) * 50}%`

  return (
    <div ref={ref} aria-hidden className={cn('relative h-3 w-full', className)}>
      <span className='bg-border absolute top-[-4px] bottom-[-4px] left-1/2 w-px' />
      <span
        className={cn(
          'absolute top-0 h-full transition-[width] duration-700 ease-out motion-reduce:transition-none',
          value < 0 ? 'right-1/2 rounded-l-[3px]' : 'left-1/2 rounded-r-[3px]',
        )}
        style={{ backgroundColor: color, width }}
      />
    </div>
  )
}

interface DumbbellProps {
  after: number
  before: number
  className?: string
  /** @default 'var(--chart-2)' */
  color?: string
  max: number
  /** @default 0 */
  min?: number
}

function Dumbbell({
  after,
  before,
  className,
  color = 'var(--chart-2)',
  max,
  min = 0,
}: DumbbellProps) {
  const range = max - min || 1
  const position = (value: number) => `${((value - min) / range) * 100}%`
  const left = Math.min(before, after)
  const right = Math.max(before, after)

  return (
    <div aria-hidden className={cn('relative h-4 w-full', className)}>
      <span className='bg-muted absolute top-1/2 h-px w-full -translate-y-1/2' />
      <span
        className='absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full'
        style={{
          backgroundColor: color,
          left: position(left),
          width: `${((right - left) / range) * 100}%`,
        }}
      />
      <span
        className='bg-card absolute top-1/2 size-3 -translate-1/2 rounded-full border-2'
        style={{ borderColor: color, left: position(before) }}
      />
      <span
        className='ring-card absolute top-1/2 size-3 -translate-1/2 rounded-full ring-2'
        style={{ backgroundColor: color, left: position(after) }}
      />
    </div>
  )
}

function DumbbellLegend({
  afterLabel,
  beforeLabel,
  className,
  color = 'var(--chart-2)',
}: {
  afterLabel: string
  beforeLabel: string
  className?: string
  color?: string
}) {
  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs',
        className,
      )}
    >
      <li className='flex items-center gap-1.5'>
        <span
          aria-hidden
          className='size-2.5 rounded-full border-2'
          style={{ borderColor: color }}
        />
        {beforeLabel}
      </li>
      <li className='flex items-center gap-1.5'>
        <span
          aria-hidden
          className='size-2.5 rounded-full'
          style={{ backgroundColor: color }}
        />
        {afterLabel}
      </li>
    </ul>
  )
}

interface IntervalBarProps {
  className?: string
  /** @default 'var(--chart-2)' */
  color?: string
  estimate: number
  high: number
  low: number
  /** The axis runs from −extent to +extent, with zero in the middle. */
  extent: number
}

function IntervalBar({
  className,
  color = 'var(--chart-2)',
  estimate,
  extent,
  high,
  low,
}: IntervalBarProps) {
  const position = (value: number) =>
    `${Math.min(100, Math.max(0, ((value + extent) / (2 * extent)) * 100))}%`

  return (
    <div aria-hidden className={cn('relative h-6 w-full', className)}>
      <span className='bg-border absolute top-1/2 h-px w-full -translate-y-1/2' />
      <span className='bg-foreground/60 absolute top-0 bottom-0 left-1/2 w-px' />
      <span
        className='absolute top-1/2 h-2 -translate-y-1/2 rounded-full opacity-30'
        style={{
          backgroundColor: color,
          left: position(low),
          width: `calc(${position(high)} - ${position(low)})`,
        }}
      />
      <span
        className='ring-card absolute top-1/2 size-3 -translate-1/2 rounded-full ring-2'
        style={{ backgroundColor: color, left: position(estimate) }}
      />
    </div>
  )
}

export {
  DivergingBar,
  Dumbbell,
  DumbbellLegend,
  IntervalBar,
  compareProportions,
  getDelta,
}

export type { DivergingBarProps, DumbbellProps, IntervalBarProps, ProportionTest }
