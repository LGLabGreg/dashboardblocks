'use client'

import { Trend } from '@/registry/components/dashboardblocks/trend'
import { useInView } from '@/registry/hooks/use-in-view'
import { CircleCheckIcon, CircleXIcon, TriangleAlertIcon } from 'lucide-react'
import { type ComponentProps, type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type MetricFormatter = (value: number) => string

type MetricFormat =
  | 'number'
  | 'compact'
  | 'currency'
  | 'currency-compact'
  | 'percent'
  | 'duration'
  | 'milliseconds'

interface Metric {
  /**
   * How the change is measured. Use `points` for rates, so 2.1% → 1.8%
   * reads as −0.3 pts instead of −14.3%.
   * @default 'percent'
   */
  changeType?: 'percent' | 'points'
  /** A named format or a formatter of your own. @default 'number' */
  format?: MetricFormat | MetricFormatter
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  /** Values over the period, oldest first, for the sparkline. */
  history?: number[]
  key: string
  label: string
  previous?: number
  value: number
}

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const compactFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
  notation: 'compact',
})
const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})
const currencyCompactFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
  notation: 'compact',
  style: 'currency',
})
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

/** "42s", "3m 05s", "1h 12m". Takes seconds. */
function formatDuration(seconds: number) {
  const total = Math.round(Math.abs(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`
  if (minutes > 0) return `${minutes}m ${String(rest).padStart(2, '0')}s`
  return `${rest}s`
}

/**
 * Named formats, all in en-US so the server and the browser render the same.
 * `percent` takes a value that is already a percentage (3.4 → "3.4%").
 */
const metricFormats: Record<MetricFormat, MetricFormatter> = {
  compact: (value) => compactFormatter.format(value),
  currency: (value) => currencyFormatter.format(value),
  'currency-compact': (value) => currencyCompactFormatter.format(value),
  duration: formatDuration,
  milliseconds: (value) => `${numberFormatter.format(Math.round(value))} ms`,
  number: (value) => numberFormatter.format(value),
  percent: (value) => `${percentFormatter.format(value)}%`,
}

function getMetricFormatter(format: Metric['format'] = 'number'): MetricFormatter {
  return typeof format === 'function' ? format : metricFormats[format]
}

function formatMetricValue(metric: Pick<Metric, 'format'>, value: number) {
  return getMetricFormatter(metric.format)(value)
}

const round = (value: number) => Math.round(value * 10) / 10

/** Change vs the previous value, in percent or percentage points. */
function getMetricChange({
  changeType = 'percent',
  previous,
  value,
}: Pick<Metric, 'changeType' | 'previous' | 'value'>) {
  if (previous === undefined) return undefined
  if (changeType === 'points') return round(value - previous)
  if (previous === 0) return 0
  return round(((value - previous) / Math.abs(previous)) * 100)
}

const formatChange = (unit: '%' | ' pts') => (value: number) =>
  `${value > 0 ? '+' : ''}${numberFormatter.format(value)}${unit}`

/** "Visitors, last 14 days: up from 1,620 to 1,910", for the sparkline's text alternative. */
function describeHistory(
  metric: Pick<Metric, 'format' | 'history' | 'label'>,
  period = '',
) {
  const history = metric.history ?? []
  if (history.length < 2) return metric.label
  const first = history[0]
  const last = history[history.length - 1]
  const direction = last > first ? 'up' : last < first ? 'down' : 'flat'
  const format = getMetricFormatter(metric.format)
  return `${metric.label}${period ? `, ${period}` : ''}: ${direction} from ${format(first)} to ${format(last)}`
}

/** Flips to true once the element scrolls into view, after the first paint. */
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

/** A list of metrics. Rows are divided by hairlines and share their column widths. */
function MetricList({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-col divide-y', className)} {...props} />
}

interface MetricChangeProps {
  className?: string
  metric: Pick<Metric, 'changeType' | 'goodDirection' | 'previous' | 'value'>
  /** Read after the change by screen readers. @default 'vs previous period' */
  comparison?: string
}

/**
 * The change vs the previous value with an arrow. Green and red follow
 * `goodDirection`, so a drop in latency reads as good.
 */
function MetricChange({
  className,
  comparison = 'vs previous period',
  metric,
}: MetricChangeProps) {
  const change = getMetricChange(metric)
  if (change === undefined) return null

  return (
    <div className={cn('flex items-center justify-end whitespace-nowrap', className)}>
      <Trend
        className='text-xs tabular-nums [&_svg]:size-3.5'
        formatter={formatChange(metric.changeType === 'points' ? ' pts' : '%')}
        goodDirection={metric.goodDirection}
        trend={change}
        trendIcon='arrow'
      />
      <span className='sr-only'> {comparison}</span>
    </div>
  )
}

interface MetricSparklineProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  data: number[]
  /** Describes the trend for screen readers. See `describeHistory`. */
  label: string
}

const SPARKLINE_WIDTH = 64
const SPARKLINE_HEIGHT = 24

/** A small line with a dot on the latest value, sized to sit in a row. Reveals left to right. */
function MetricSparkline({
  animated = true,
  className,
  color = 'var(--chart-1)',
  data,
  label,
}: MetricSparklineProps) {
  const { ref, revealed } = useReveal(animated)

  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  // Keep a 2px inset so the stroke is never clipped at the extremes.
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * SPARKLINE_WIDTH,
    y: 2 + (1 - (value - min) / range) * (SPARKLINE_HEIGHT - 4),
  }))
  const line = points.map(({ x, y }, index) => `${index ? 'L' : 'M'}${x},${y}`).join('')
  const last = points[points.length - 1]

  return (
    <div
      ref={ref}
      role='img'
      aria-label={label}
      className={cn('relative h-6 w-16', className)}
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
        <path
          d={line}
          fill='none'
          stroke={color}
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1.5}
          vectorEffect='non-scaling-stroke'
        />
      </svg>
      <span
        aria-hidden
        className='ring-card absolute size-1.5 -translate-1/2 rounded-full ring-2 transition-opacity delay-700 duration-300 motion-reduce:transition-none motion-reduce:delay-0'
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

interface MetricRowProps extends Omit<ComponentProps<'li'>, 'children'> {
  /** Read after the change by screen readers. */
  comparison?: string
  metric: Metric
  /** Names the sparkline's period for screen readers, for example "last 14 days". */
  period?: string
  /** @default true when the metric has a history */
  showSparkline?: boolean
  sparklineColor?: string
}

/**
 * One metric: label, sparkline, value and change. On narrow cards the value
 * and change stack at the end of the row; from `@md` each gets its own column.
 */
function MetricRow({
  className,
  comparison,
  metric,
  period,
  showSparkline = (metric.history?.length ?? 0) > 1,
  sparklineColor,
  ...props
}: MetricRowProps) {
  return (
    <li
      className={cn(
        'grid items-center gap-x-3 py-3 @md:gap-x-4',
        showSparkline
          ? 'grid-cols-[minmax(0,1fr)_3rem_5.5rem] @md:grid-cols-[minmax(0,1fr)_5rem_6rem_5rem]'
          : 'grid-cols-[minmax(0,1fr)_5.5rem] @md:grid-cols-[minmax(0,1fr)_6rem_5rem]',
        className,
      )}
      {...props}
    >
      <span className='text-sm'>{metric.label}</span>
      {/* Keeps its grid cell when there's no history, so the columns stay aligned. */}
      {showSparkline && (
        <div className='min-w-0'>
          {metric.history && (
            <MetricSparkline
              className='w-full'
              color={sparklineColor}
              data={metric.history}
              label={describeHistory(metric, period)}
            />
          )}
        </div>
      )}
      <div className='flex flex-col items-end gap-0.5 @md:contents'>
        <span className='text-sm font-medium whitespace-nowrap tabular-nums @md:justify-self-end'>
          {formatMetricValue(metric, metric.value)}
        </span>
        <MetricChange comparison={comparison} metric={metric} />
      </div>
    </li>
  )
}

type TargetStatus = 'met' | 'near' | 'missed'

interface TargetInput {
  /** Use `down` when the target is a ceiling, like churn or latency. @default 'up' */
  goodDirection?: 'up' | 'down'
  target: number
  /**
   * How far short of the target, as a share of it, still counts as near.
   * @default 0.05
   */
  tolerance?: number
  value: number
}

/** Whether the value meets its target, is within `tolerance` of it, or misses it. */
function getTargetStatus({
  goodDirection = 'up',
  target,
  tolerance = 0.05,
  value,
}: TargetInput): TargetStatus {
  const gap = goodDirection === 'up' ? target - value : value - target
  if (gap <= 0) return 'met'
  return gap <= Math.abs(target) * tolerance ? 'near' : 'missed'
}

const targetStatusConfig: Record<
  TargetStatus,
  { className: string; icon: typeof CircleCheckIcon; label: string }
> = {
  met: {
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: CircleCheckIcon,
    label: 'On target',
  },
  missed: {
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: CircleXIcon,
    label: 'Off target',
  },
  near: {
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    icon: TriangleAlertIcon,
    label: 'Near target',
  },
}

/** The target status with its icon and label. Colour never carries it alone. */
function TargetStatusBadge({
  className,
  status,
}: {
  className?: string
  status: TargetStatus
}) {
  const config = targetStatusConfig[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        config.className,
        className,
      )}
    >
      <Icon aria-hidden className='size-3.5' />
      {config.label}
    </span>
  )
}

interface MetricTargetBarProps {
  animated?: boolean
  className?: string
  /** @default 'var(--chart-1)' */
  color?: string
  /**
   * The range the bar covers. Narrow it for values that sit close together,
   * like uptime. @default [0, 1.25 × the larger of value and target]
   */
  domain?: [number, number]
  target: number
  value: number
}

/**
 * A thin bar for the value with a tick at the target. Decorative: show the
 * value, the target and the status as text beside it.
 */
function MetricTargetBar({
  animated = true,
  className,
  color = 'var(--chart-1)',
  domain,
  target,
  value,
}: MetricTargetBarProps) {
  const { ref, revealed } = useReveal(animated)
  const [min, max] = domain ?? [0, Math.max(value, target) * 1.25]
  const span = max - min || 1
  const share = (input: number) => Math.min(1, Math.max(0, (input - min) / span))

  return (
    <div ref={ref} aria-hidden className={cn('relative h-1.5 w-full', className)}>
      <div className='bg-muted h-full w-full overflow-hidden rounded-full'>
        <div
          className='h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
          style={{
            backgroundColor: color,
            width: `${(revealed ? share(value) : 0) * 100}%`,
          }}
        />
      </div>
      <span
        className='bg-foreground ring-card absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
        style={{ left: `${share(target) * 100}%` }}
      />
    </div>
  )
}

/** A short legend for the target tick. */
function MetricTargetKey({
  className,
  label = 'Target',
}: {
  className?: string
  label?: string
}) {
  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
      {label}
    </span>
  )
}

export {
  MetricChange,
  MetricList,
  MetricRow,
  MetricSparkline,
  MetricTargetBar,
  MetricTargetKey,
  TargetStatusBadge,
  describeHistory,
  formatDuration,
  formatMetricValue,
  getMetricChange,
  getMetricFormatter,
  getTargetStatus,
  metricFormats,
  targetStatusConfig,
}

export type {
  Metric,
  MetricChangeProps,
  MetricFormat,
  MetricFormatter,
  MetricRowProps,
  MetricSparklineProps,
  MetricTargetBarProps,
  TargetInput,
  TargetStatus,
}
