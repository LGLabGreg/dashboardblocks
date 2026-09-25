'use client'

import { Trend } from '@/registry/components/dashboardblocks/trend'
import { useInView } from '@/registry/hooks/use-in-view'
import { type ComponentProps, type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type StatFormatter = (value: number) => string

interface StatMetric {
  /**
   * How the change is measured. Use `points` for rates, so 2.1% → 1.8%
   * reads as −0.3 pts instead of −14.3%.
   * @default 'percent'
   */
  changeType?: 'percent' | 'points'
  formatter?: StatFormatter
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  key: string
  label: string
  previous?: number
  value: number
}

const defaultFormatter: StatFormatter = (value) => value.toLocaleString()

const formatPoints: StatFormatter = (value) =>
  `${value > 0 ? '+' : ''}${value.toLocaleString()} pts`

const round = (value: number) => Math.round(value * 10) / 10

/** Change vs the previous value, in percent or percentage points. */
function getStatChange({
  changeType = 'percent',
  previous,
  value,
}: Pick<StatMetric, 'changeType' | 'previous' | 'value'>) {
  if (previous === undefined) return undefined
  if (changeType === 'points') return round(value - previous)
  if (previous === 0) return 0
  return round(((value - previous) / Math.abs(previous)) * 100)
}

function formatStatValue(metric: Pick<StatMetric, 'formatter' | 'value'>) {
  return (metric.formatter ?? defaultFormatter)(metric.value)
}

/** A grid of stats. The 1px gaps show the border colour, so dividers follow any layout. */
function StatGroup({ className, ...props }: ComponentProps<'dl'>) {
  return <dl className={cn('bg-border grid gap-px', className)} {...props} />
}

function Stat({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('bg-card flex min-w-0 flex-col gap-1 p-6', className)}
      {...props}
    />
  )
}

function StatLabel({ className, ...props }: ComponentProps<'dt'>) {
  return <dt className={cn('text-muted-foreground text-sm', className)} {...props} />
}

function StatValue({ className, ...props }: ComponentProps<'dd'>) {
  return (
    <dd
      className={cn('text-3xl font-semibold tracking-tight whitespace-nowrap', className)}
      {...props}
    />
  )
}

interface StatChangeProps {
  className?: string
  metric: StatMetric
  /**
   * Shows the previous value after the change.
   * @default true
   */
  showPrevious?: boolean
  /** Badge style for the change. */
  variant?: 'default' | 'badge'
}

/** The change vs the previous period, with an arrow, and optionally the previous value. */
function StatChangeContent({
  className,
  metric,
  showPrevious = true,
  variant = 'default',
}: StatChangeProps) {
  const change = getStatChange(metric)
  if (change === undefined) return null

  return (
    <span
      className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs', className)}
    >
      <Trend
        className={variant === 'default' ? 'text-xs [&_svg]:size-3.5' : undefined}
        formatter={metric.changeType === 'points' ? formatPoints : undefined}
        goodDirection={metric.goodDirection}
        trend={change}
        trendIcon='arrow'
        variant={variant}
      />
      {showPrevious && metric.previous !== undefined ? (
        <span className='text-muted-foreground whitespace-nowrap'>
          vs {(metric.formatter ?? defaultFormatter)(metric.previous)}
        </span>
      ) : (
        <span className='sr-only'>compared with the previous period</span>
      )}
    </span>
  )
}

function StatChange(props: StatChangeProps) {
  return (
    <dd>
      <StatChangeContent {...props} />
    </dd>
  )
}

interface StatSparklineProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  data: number[]
  /** Describes the trend for screen readers, for example "Up from $2.1K to $3.4K". */
  label: string
}

const SPARKLINE_WIDTH = 100
const SPARKLINE_HEIGHT = 32

/** A sparkline with a soft fill and a dot on the latest value. Reveals left to right. */
function StatSparkline({
  animated = true,
  className,
  color = 'var(--chart-1)',
  data,
  label,
}: StatSparklineProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  // Keep a 2px inset so the 2px stroke is never clipped at the extremes.
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * SPARKLINE_WIDTH,
    y: 2 + (1 - (value - min) / range) * (SPARKLINE_HEIGHT - 4),
  }))
  const line = points.map(({ x, y }, index) => `${index ? 'L' : 'M'}${x},${y}`).join('')
  const area = `${line}L${SPARKLINE_WIDTH},${SPARKLINE_HEIGHT}L0,${SPARKLINE_HEIGHT}Z`
  const last = points[points.length - 1]

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      role='img'
      aria-label={label}
      className={cn('relative h-8 w-full', className)}
    >
      <svg
        aria-hidden
        className='size-full overflow-visible transition-[clip-path] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
        preserveAspectRatio='none'
        style={{
          clipPath: revealed
            ? 'inset(-4px -4px -4px -4px)'
            : 'inset(-4px 100% -4px -4px)',
        }}
        viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
      >
        <path d={area} fill={color} fillOpacity={0.1} />
        <path
          d={line}
          fill='none'
          stroke={color}
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          vectorEffect='non-scaling-stroke'
        />
      </svg>
      <span
        aria-hidden
        className='ring-card absolute size-2 -translate-1/2 rounded-full ring-2 transition-opacity delay-700 duration-300 motion-reduce:transition-none motion-reduce:delay-0'
        style={{
          backgroundColor: color,
          left: '100%',
          opacity: revealed ? 1 : 0,
          top: `${(last.y / SPARKLINE_HEIGHT) * 100}%`,
        }}
      />
    </div>
  )
}

export {
  Stat,
  StatChange,
  StatChangeContent,
  StatGroup,
  StatLabel,
  StatSparkline,
  StatValue,
  formatPoints,
  formatStatValue,
  getStatChange,
}

export type { StatChangeProps, StatFormatter, StatMetric, StatSparklineProps }
