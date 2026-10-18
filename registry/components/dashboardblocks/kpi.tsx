'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import {
  BlockStateText,
  SkeletonText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatPoints,
} from '@/registry/lib/dashboardblocks/format'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type KPIFormatter = (value: number) => string

type KPIFormat = 'number' | 'compact' | 'currency' | 'currency-compact' | 'percent'

const kpiFormats: Record<KPIFormat, KPIFormatter> = {
  compact: formatCompact,
  currency: (value) => formatCurrency(value),
  'currency-compact': (value) => formatCurrency(value, { compact: true }),
  number: (value) => formatNumber(value),
  percent: (value) => formatPercent(value / 100, { maximumFractionDigits: 2 }),
}

function getKPIFormatter(format: KPIFormat | KPIFormatter = 'number'): KPIFormatter {
  return typeof format === 'function' ? format : kpiFormats[format]
}

interface KPIChangeInput {
  /** @default 'percent' */
  changeType?: 'percent' | 'points'
  previous?: number
  value?: number
}

const round = (value: number) => Math.round(value * 10) / 10 + 0

function getKPIChange({ changeType = 'percent', previous, value }: KPIChangeInput) {
  if (previous === undefined || value === undefined) return undefined
  if (changeType === 'points') return round(value - previous)
  if (previous === 0) return value === 0 ? 0 : undefined
  return round(((value - previous) / Math.abs(previous)) * 100)
}

function KPI({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='kpi'
      className={cn('flex flex-col border-t pt-3', className)}
      {...props}
    />
  )
}

function KPIContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='kpi-content'
      className={cn('flex flex-1 flex-col justify-between', className)}
      {...props}
    />
  )
}

function KPITitle({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='kpi-title'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

interface KPIValueProps {
  animated?: boolean
  className?: string
  format?: KPIFormat | KPIFormatter
  value?: number
}

function KPIValue({ animated = false, className, format, value }: KPIValueProps) {
  const state = useBlockState() ?? (value === undefined ? 'empty' : undefined)
  const formatter = getKPIFormatter(format)

  return (
    <div
      data-slot='kpi-value'
      className={cn('text-4xl font-light tracking-tight tabular-nums', className)}
    >
      {state === 'loading' ? (
        <SkeletonText className='w-[4.5em]' />
      ) : state || value === undefined ? (
        <BlockStateText state={state} variant='short' />
      ) : animated ? (
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
  /** Renders a `span` instead of a `p`, for inside a button or another line of text. */
  inline?: boolean
  /** Follows the previous value in the sentence, such as `last month`. */
  comparison: string
  /** Formats the previous value in the sentence; match the value's own format. */
  format?: KPIFormat | KPIFormatter
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  /** `short` shows only the change, such as `Up 12.5%`, and gives screen readers the rest. @default 'sentence' */
  variant?: 'sentence' | 'short'
}

function KPIChange({
  className,
  comparison,
  format,
  goodDirection,
  inline = false,
  variant = 'sentence',
  ...input
}: KPIChangeProps) {
  const state = useBlockState()
  const change = getKPIChange(input)

  if (state === 'loading') {
    return (
      <BlockStateText
        className={cn('text-sm', className)}
        variant={variant === 'short' ? 'short' : 'sentence'}
      />
    )
  }
  if (state || change === undefined) return null

  const good = goodDirection === 'down' ? change < 0 : change > 0
  const rest = (
    <>
      {' '}
      from{' '}
      <span className='tabular-nums'>
        {getKPIFormatter(format)(input.previous ?? 0)}
      </span>{' '}
      {comparison}
    </>
  )

  const Element = inline ? 'span' : 'p'
  const amount =
    input.changeType === 'points'
      ? formatPoints(Math.abs(change))
      : formatPercent(Math.abs(change) / 100)

  return (
    <Element
      data-slot='kpi-change'
      className={cn('text-muted-foreground text-sm', inline && 'block', className)}
    >
      <span
        className={cn(
          'font-medium tabular-nums',
          change !== 0 &&
            (good
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'),
        )}
      >
        {change === 0 ? 'No change' : `${change > 0 ? 'Up' : 'Down'} ${amount}`}
      </span>
      {variant === 'short' ? <span className='sr-only'>{rest}</span> : rest}
    </Element>
  )
}

interface KPIChartProps {
  children: ReactNode
  className?: string
  label: string
}

function KPIChart({ children, className, label }: KPIChartProps) {
  const state = useBlockState()

  return (
    <div
      role={state ? undefined : 'img'}
      aria-label={state ? undefined : label}
      className={cn('w-full', className)}
    >
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
  KPITitle,
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
