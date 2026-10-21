'use client'

import { TinyAreaChart } from '@/registry/components/dashboardblocks/chart'
import { KPIChange, getKPIChange } from '@/registry/components/dashboardblocks/kpi'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { useReveal } from '@/registry/hooks/use-reveal'
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import type { ComponentProps } from 'react'

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
  /** @default 'percent' */
  changeType?: 'percent' | 'points'
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

function formatDuration(seconds: number) {
  const total = Math.round(Math.abs(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`
  if (minutes > 0) return `${minutes}m ${String(rest).padStart(2, '0')}s`
  return `${rest}s`
}

const metricFormats: Record<MetricFormat, MetricFormatter> = {
  compact: formatCompact,
  currency: (value) => formatCurrency(value, { precision: 'exact' }),
  'currency-compact': (value) => formatCurrency(value, { compact: true }),
  duration: formatDuration,
  milliseconds: (value) => `${formatNumber(value, { maximumFractionDigits: 0 })} ms`,
  number: (value) => formatNumber(value),
  percent: (value) => formatPercent(value / 100, { maximumFractionDigits: 2 }),
}

function getMetricFormatter(format: Metric['format'] = 'number'): MetricFormatter {
  return typeof format === 'function' ? format : metricFormats[format]
}

function formatMetricValue(metric: Pick<Metric, 'format'>, value: number) {
  return getMetricFormatter(metric.format)(value)
}

function getMetricChange({
  changeType,
  previous,
  value,
}: Pick<Metric, 'changeType' | 'previous' | 'value'>) {
  return getKPIChange({ changeType, previous, value })
}

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

function MetricList({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-col divide-y', className)} {...props} />
}

interface MetricChangeProps {
  className?: string
  metric: Pick<Metric, 'changeType' | 'format' | 'goodDirection' | 'previous' | 'value'>
  /** Follows the previous value, such as `last month`. @default 'the period before' */
  comparison?: string
  /** `sentence` also shows the previous value and the comparison. @default 'short' */
  variant?: 'sentence' | 'short'
}

function MetricChange({
  className,
  comparison = 'the period before',
  metric,
  variant = 'short',
}: MetricChangeProps) {
  if (metric.previous === undefined) return null

  return (
    <KPIChange
      changeType={metric.changeType}
      className={cn(variant === 'short' && 'text-xs whitespace-nowrap', className)}
      comparison={comparison}
      format={getMetricFormatter(metric.format)}
      goodDirection={metric.goodDirection}
      previous={metric.previous}
      value={metric.value}
      variant={variant}
    />
  )
}

interface MetricSparklineProps {
  animated?: boolean
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  data: number[]
  /** Formats a point's value in the tooltip. */
  formatter?: MetricFormatter
  label: string
  /** Names each point in the tooltip, in the same order as `data`. */
  labels?: string[]
}

function MetricSparkline({
  animated = true,
  className,
  color = 'var(--color-chart-2)',
  data,
  formatter = metricFormats.number,
  label,
  labels,
}: MetricSparklineProps) {
  if (data.length < 2) return null

  return (
    <div role='img' aria-label={label} className={cn('h-7 w-16', className)}>
      <TinyAreaChart
        accessibilityLayer={false}
        areas={[
          {
            dataKey: 'value',
            fill: color,
            isAnimationActive: animated,
            stroke: color,
            strokeWidth: 1.5,
          },
        ]}
        data={data.map((value, index) => ({ label: labels?.[index], value }))}
        formatter={formatter}
        height='100%'
        markLast='value'
        scale='data'
      />
    </div>
  )
}

interface MetricRowProps extends Omit<ComponentProps<'li'>, 'children'> {
  comparison?: string
  /** Names each point of the history in the sparkline's tooltip. */
  labels?: string[]
  metric: Metric
  period?: string
  /** @default true when the metric has a history */
  showSparkline?: boolean
  sparklineColor?: string
}

function MetricRow({
  className,
  comparison,
  labels,
  metric,
  period,
  showSparkline = (metric.history?.length ?? 0) > 1,
  sparklineColor,
  ...props
}: MetricRowProps) {
  return (
    <li
      className={cn(
        'grid items-center gap-x-3 py-2.5 @md:gap-x-4',
        showSparkline
          ? 'grid-cols-[minmax(0,1fr)_3rem_5.5rem] @md:grid-cols-[minmax(0,1fr)_5rem_6rem_5rem]'
          : 'grid-cols-[minmax(0,1fr)_5.5rem] @md:grid-cols-[minmax(0,1fr)_6rem_5rem]',
        className,
      )}
      {...props}
    >
      <span className='text-sm'>{metric.label}</span>
      {showSparkline && (
        <div className='min-w-0'>
          {metric.history && (
            <MetricSparkline
              className='w-full'
              color={sparklineColor}
              data={metric.history}
              formatter={getMetricFormatter(metric.format)}
              label={describeHistory(metric, period)}
              labels={labels}
            />
          )}
        </div>
      )}
      <div className='flex flex-col items-end gap-0.5 @md:contents'>
        <span className='text-sm font-medium whitespace-nowrap tabular-nums @md:justify-self-end'>
          {formatMetricValue(metric, metric.value)}
        </span>
        <MetricChange
          className='@md:justify-self-end'
          comparison={comparison}
          metric={metric}
        />
      </div>
    </li>
  )
}

type TargetStatus = 'met' | 'near' | 'missed'

interface TargetInput {
  /** Use `down` when the target is a ceiling, like churn or latency. */
  goodDirection?: 'up' | 'down'
  target: number
  /** How far short of the target, as a share of it, still counts as near, 0.05 by default. */
  tolerance?: number
  value: number
}

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

const targetStatusConfig: Record<TargetStatus, { label: string; tone: StatusTone }> = {
  met: { label: 'On target', tone: 'good' },
  missed: { label: 'Off target', tone: 'bad' },
  near: { label: 'Near target', tone: 'warning' },
}

function TargetStatusLabel({
  className,
  status,
}: {
  className?: string
  status: TargetStatus
}) {
  const config = targetStatusConfig[status]
  return (
    <StatusLabel className={className} tone={config.tone}>
      {config.label}
    </StatusLabel>
  )
}

interface MetricTargetBarProps {
  animated?: boolean
  className?: string
  /** @default 'var(--color-chart-2)' */
  color?: string
  domain?: [number, number]
  target: number
  value: number
}

function MetricTargetBar({
  animated = true,
  className,
  color = 'var(--color-chart-2)',
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
        className='bg-foreground ring-background absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
        style={{ left: `${share(target) * 100}%` }}
      />
    </div>
  )
}

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
  TargetStatusLabel,
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
