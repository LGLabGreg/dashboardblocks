'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import type { ComponentProps, ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

type KPIFormatter = (value: number) => string

type KPIFormat = 'number' | 'compact' | 'currency' | 'currency-compact' | 'percent'

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const compactFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
})
const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})
const currencyCompactFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact',
  style: 'currency',
})
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

/**
 * Named formats, all in en-US so the server and the browser render the same.
 * `percent` takes a value that is already a percentage (3.4 → "3.4%").
 */
const kpiFormats: Record<KPIFormat, KPIFormatter> = {
  compact: (value) => compactFormatter.format(value),
  currency: (value) => currencyFormatter.format(value),
  'currency-compact': (value) => currencyCompactFormatter.format(value),
  number: (value) => numberFormatter.format(value),
  percent: (value) => `${percentFormatter.format(value)}%`,
}

function getKPIFormatter(format: KPIFormat | KPIFormatter = 'number'): KPIFormatter {
  return typeof format === 'function' ? format : kpiFormats[format]
}

interface KPIChangeInput {
  /**
   * How the change is measured. Use `points` for rates, so 3.4% → 3.2%
   * reads as −0.2 pts instead of −5.9%.
   * @default 'percent'
   */
  changeType?: 'percent' | 'points'
  previous?: number
  value: number
}

const round = (value: number) => Math.round(value * 10) / 10

/** Change vs the previous value, in percent or percentage points. */
function getKPIChange({ changeType = 'percent', previous, value }: KPIChangeInput) {
  if (previous === undefined) return undefined
  if (changeType === 'points') return round(value - previous)
  if (previous === 0) return 0
  return round(((value - previous) / Math.abs(previous)) * 100)
}

const formatChange = (unit: '%' | ' pts') => (value: number) =>
  `${value > 0 ? '+' : ''}${numberFormatter.format(value)}${unit}`

/** The card. Pass `className` for the card, and put `KPIContent` inside. */
function KPI(props: ComponentProps<typeof Card>) {
  return <Card {...props} />
}

/** Stacks the label, value and extras, pushing the last child to the bottom. */
function KPIContent({ className, ...props }: ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      className={cn('flex flex-1 flex-col justify-between', className)}
      {...props}
    />
  )
}

interface KPIValueProps {
  /** Counts up from zero once in view. Screen readers get the final value. */
  animated?: boolean
  className?: string
  /** A named format or a formatter of your own. @default 'number' */
  format?: KPIFormat | KPIFormatter
  value: number
}

function KPIValue({ animated = false, className, format, value }: KPIValueProps) {
  const formatter = getKPIFormatter(format)

  return (
    <div className={cn('text-3xl font-semibold tracking-tight tabular-nums', className)}>
      {animated ? (
        <>
          <span aria-hidden>
            <AnimatedNumber value={value} formatter={formatter} />
          </span>
          <span className='sr-only'>{formatter(value)}</span>
        </>
      ) : (
        formatter(value)
      )}
    </div>
  )
}

interface KPIChangeProps extends KPIChangeInput {
  className?: string
  /** What the change is measured against, e.g. "vs last month". */
  comparison: string
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  /**
   * Shows the comparison next to the change. Hidden, it's still read out.
   * @default false
   */
  showComparison?: boolean
  /** @default 'badge' */
  variant?: 'default' | 'badge'
}

/**
 * The change vs the previous value, with an arrow and a sign, so colour never
 * carries it alone. Green and red follow `goodDirection`.
 */
function KPIChange({
  className,
  comparison,
  goodDirection,
  showComparison = false,
  variant = 'badge',
  ...input
}: KPIChangeProps) {
  const change = getKPIChange(input)
  if (change === undefined) return null

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      <Trend
        className={cn(
          'tabular-nums',
          variant === 'default' && 'text-xs [&_svg]:size-3.5',
        )}
        formatter={formatChange(input.changeType === 'points' ? ' pts' : '%')}
        goodDirection={goodDirection}
        trend={change}
        trendIcon='arrow'
        variant={variant}
      />
      <span className={cn('text-muted-foreground', !showComparison && 'sr-only')}>
        {comparison}
      </span>
    </div>
  )
}

interface KPIChartProps {
  children: ReactNode
  className?: string
  /** Describes the chart for screen readers. See `describeSeries`. */
  label: string
}

/** Wraps a small chart as a single image with a text alternative. */
function KPIChart({ children, className, label }: KPIChartProps) {
  return (
    <div role='img' aria-label={label} className={cn('w-full', className)}>
      {children}
    </div>
  )
}

/**
 * "Revenue by day: from $3,200 on Mon to $5,700 on Sun, highest $6,100 on Fri",
 * for a chart's text alternative.
 */
function describeSeries(
  title: string,
  points: { label: string; value: number }[],
  format?: KPIFormat | KPIFormatter,
) {
  if (points.length < 2) return title
  const formatter = getKPIFormatter(format)
  const first = points[0]
  const last = points[points.length - 1]
  const peak = points.reduce((max, point) => (point.value > max.value ? point : max))
  return `${title}: from ${formatter(first.value)} on ${first.label} to ${formatter(last.value)} on ${last.label}, highest ${formatter(peak.value)} on ${peak.label}`
}

export {
  KPI,
  KPIChange,
  KPIChart,
  KPIContent,
  KPIValue,
  describeSeries,
  getKPIChange,
  getKPIFormatter,
  kpiFormats,
}

export type {
  KPIChangeInput,
  KPIChangeProps,
  KPIChartProps,
  KPIFormat,
  KPIFormatter,
  KPIValueProps,
}
