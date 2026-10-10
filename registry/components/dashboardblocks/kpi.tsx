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
   * How the change is measured.
   * @default 'percent'
   */
  changeType?: 'percent' | 'points'
  previous?: number
  value: number
}

const round = (value: number) => Math.round(value * 10) / 10

function getKPIChange({ changeType = 'percent', previous, value }: KPIChangeInput) {
  if (previous === undefined) return undefined
  if (changeType === 'points') return round(value - previous)
  if (previous === 0) return 0
  return round(((value - previous) / Math.abs(previous)) * 100)
}

const formatChange = (unit: '%' | ' pts') => (value: number) =>
  `${value > 0 ? '+' : ''}${numberFormatter.format(value)}${unit}`

function KPI(props: ComponentProps<typeof Card>) {
  return <Card {...props} />
}

function KPIContent({ className, ...props }: ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      className={cn('flex flex-1 flex-col justify-between', className)}
      {...props}
    />
  )
}

interface KPIValueProps {
  animated?: boolean
  className?: string
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
  comparison: string
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  showComparison?: boolean
  /** @default 'badge' */
  variant?: 'default' | 'badge'
}

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
  label: string
}

function KPIChart({ children, className, label }: KPIChartProps) {
  return (
    <div role='img' aria-label={label} className={cn('w-full', className)}>
      {children}
    </div>
  )
}

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
