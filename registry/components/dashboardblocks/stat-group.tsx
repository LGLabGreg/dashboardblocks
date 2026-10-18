'use client'

import {
  BlockStateText,
  SkeletonText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { TinyAreaChart } from '@/registry/components/dashboardblocks/chart'
import { KPIChange, getKPIChange } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import {
  formatNumber,
  formatPoints,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type StatFormatter = (value: number) => string

interface StatMetric {
  /** @default 'percent' */
  changeType?: 'percent' | 'points'
  formatter?: StatFormatter
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  key: string
  label: string
  previous?: number
  value: number
}

const defaultFormatter: StatFormatter = (value) => formatNumber(value)

const formatSignedPoints: StatFormatter = (value) =>
  formatSigned(value, (points) => formatPoints(points))

function formatStatValue(metric: Pick<StatMetric, 'formatter' | 'value'>) {
  return (metric.formatter ?? defaultFormatter)(metric.value)
}

function getStatPlaceholders(count: number): StatMetric[] {
  return Array.from({ length: count }, (_, index) => ({
    key: `placeholder-${index}`,
    label: '',
    value: 0,
  }))
}

function StatGroup({ className, ...props }: ComponentProps<'dl'>) {
  const state = useBlockState()

  if (state === 'error' || state === 'empty') {
    return (
      <div data-slot='stat-group' className='border-t pt-3'>
        <BlockStateText className='text-4xl font-light tracking-tight' variant='short' />
      </div>
    )
  }

  return (
    <dl
      data-slot='stat-group'
      className={cn('grid gap-x-6 gap-y-5', className)}
      {...props}
    />
  )
}

function Stat({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex min-w-0 flex-col gap-1 border-t pt-3', className)}
      {...props}
    />
  )
}

function StatLabel({ children, className, ...props }: ComponentProps<'dt'>) {
  const state = useBlockState()

  return (
    <dt className={cn('text-muted-foreground text-sm', className)} {...props}>
      {state === 'loading' ? (
        <>
          <SkeletonText className='w-20' />
          <span className='sr-only'>Loading</span>
        </>
      ) : (
        children
      )}
    </dt>
  )
}

function StatValue({ children, className, ...props }: ComponentProps<'dd'>) {
  const state = useBlockState()

  return (
    <dd
      className={cn(
        'text-4xl font-light tracking-tight whitespace-nowrap tabular-nums',
        className,
      )}
      {...props}
    >
      {state === 'loading' ? <SkeletonText className='w-[4em]' /> : children}
    </dd>
  )
}

interface StatChangeProps {
  className?: string
  /** Follows the previous value in the sentence, such as `last month`. */
  comparison?: string
  metric: StatMetric
  /** With `variant='arrow'`, shows the previous value after the change. @default true */
  showPrevious?: boolean
  /** `short` shows only the change, such as `Up 12.4%`, and gives screen readers the rest. @default 'sentence' */
  variant?: 'sentence' | 'short' | 'arrow'
}

function StatChangeContent({
  className,
  comparison = 'the previous period',
  metric,
  showPrevious = true,
  variant = 'sentence',
}: StatChangeProps) {
  const state = useBlockState()
  const change = getKPIChange(metric)

  if (state === 'loading') {
    return (
      <span className={cn('block text-sm', className)}>
        <SkeletonText className={variant === 'sentence' ? 'w-48' : 'w-16'} />
      </span>
    )
  }
  if (change === undefined) return null

  if (variant === 'arrow') {
    return (
      <span
        className={cn(
          'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs',
          className,
        )}
      >
        <Trend
          className='text-xs [&_svg]:size-3.5'
          formatter={metric.changeType === 'points' ? formatSignedPoints : undefined}
          goodDirection={metric.goodDirection}
          trend={change}
          trendIcon='arrow'
        />
        {showPrevious && metric.previous !== undefined ? (
          <span className='text-muted-foreground whitespace-nowrap'>
            vs {(metric.formatter ?? defaultFormatter)(metric.previous)}
          </span>
        ) : (
          <span className='sr-only'>compared with {comparison}</span>
        )}
      </span>
    )
  }

  return (
    <KPIChange
      inline
      changeType={metric.changeType}
      className={className}
      comparison={comparison}
      format={metric.formatter ?? defaultFormatter}
      goodDirection={metric.goodDirection}
      previous={metric.previous}
      value={metric.value}
      variant={variant}
    />
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
  /** @default 'var(--color-chart-2)' */
  color?: string
  data: number[]
  /** Formats a point's value in the tooltip. */
  formatter?: StatFormatter
  label: string
  /** Names each point in the tooltip, in the same order as `data`. */
  labels?: string[]
}

function StatSparkline({
  animated = true,
  className,
  color = 'var(--color-chart-2)',
  data,
  formatter = defaultFormatter,
  label,
  labels,
}: StatSparklineProps) {
  const state = useBlockState()
  if (state === 'loading') {
    return (
      <div
        aria-hidden
        className={cn(
          'bg-muted h-8 w-full animate-pulse rounded-md motion-reduce:animate-none',
          className,
        )}
      />
    )
  }
  if (data.length < 2) return null

  return (
    <div role='img' aria-label={label} className={cn('h-8 w-full', className)}>
      <TinyAreaChart
        accessibilityLayer={false}
        areas={[
          {
            dataKey: 'value',
            fill: color,
            fillOpacity: 0.2,
            isAnimationActive: animated,
            stroke: color,
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

export {
  Stat,
  StatChange,
  StatChangeContent,
  StatGroup,
  StatLabel,
  StatSparkline,
  StatValue,
  formatStatValue,
  getStatPlaceholders,
}

export type { StatChangeProps, StatFormatter, StatMetric, StatSparklineProps }
