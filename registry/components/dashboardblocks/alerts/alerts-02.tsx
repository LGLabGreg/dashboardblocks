'use client'

import {
  SeverityLabel,
  type AlertSeverity,
} from '@/registry/components/dashboardblocks/alerts'
import {
  BlockStateProvider,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLastDot,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button, buttonVariants } from '@/components/ui/button'

interface Reading {
  label: string
  value: number
}

interface Alerts2Props {
  description: string
  formatter?: (value: number) => string
  metric: string
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  readings?: Reading[]
  runbookHref?: string
  severity: AlertSeverity
  status?: BlockStatus
  threshold: number
  title: string
}

const exampleProps: Alerts2Props = {
  description: 'checkout-api in eu-west-1, firing for 12 minutes.',
  formatter: (value) => formatPercent(value / 100, { minimumFractionDigits: 1 }),
  metric: 'Error rate',
  readings: Array.from({ length: 30 }, (_, index) => {
    const minute = 14 * 60 + index * 2
    const spike = index >= 23 ? 3.6 + Math.sin(index) * 0.8 + (index - 23) * 0.35 : 0
    return {
      label: `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, '0')}`,
      value: Number((1.1 + Math.sin(index / 2.4) * 0.35 + spike).toFixed(2)),
    }
  }),
  runbookHref: '#',
  severity: 'critical',
  threshold: 5,
  title: 'Error rate above threshold',
}

const BREACH_COLOR = 'var(--color-red-500)'

const Alerts2 = (props: Alerts2Props) => {
  const {
    description,
    formatter = (value) => formatNumber(value),
    metric,
    readings = [],
    runbookHref,
    severity,
    status,
    threshold,
    title,
  } = props
  const id = useChartId()
  const [acknowledged, setAcknowledged] = useState(false)
  const state = getBlockState(status, readings)
  const values = readings.map((reading) => reading.value)
  const current = values[values.length - 1] ?? 0
  const highest = Math.max(...values, 0)
  const lowest = Math.min(...values, highest)
  const peak = Math.max(highest, threshold)
  const yMax = Math.ceil(peak * 1.15)
  const breached = current > threshold
  const strokeSplit = highest === lowest ? 0 : (highest - threshold) / (highest - lowest)
  const fillSplit = highest === 0 ? 0 : (highest - threshold) / highest
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  const gap = formatter(Math.abs(current - threshold))

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <div className='flex flex-wrap items-baseline gap-x-2'>
              <h2 className='font-semibold tracking-tight'>{title}</h2>
              {!state && (
                <SeverityLabel severity={acknowledged ? 'resolved' : severity}>
                  {acknowledged ? 'Acknowledged' : undefined}
                </SeverityLabel>
              )}
            </div>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {runbookHref && (
              <a
                href={runbookHref}
                className={buttonVariants({ size: 'sm', variant: 'ghost' })}
              >
                <IconPlaceholder
                  lucide='BookOpenIcon'
                  tabler='IconBook'
                  hugeicons='BookOpen02Icon'
                  phosphor='BookOpenIcon'
                  remixicon='RiBookOpenLine'
                />
                Runbook
              </a>
            )}
            <Button
              variant='outline'
              size='sm'
              disabled={Boolean(state) || acknowledged}
              onClick={() => setAcknowledged(true)}
            >
              {acknowledged ? 'Acknowledged' : 'Acknowledge'}
            </Button>
          </div>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-[1fr_auto_auto]'>
          <div className='col-span-2 flex flex-col gap-1 @md:col-span-1'>
            <dt className='text-muted-foreground text-sm'>{metric} now</dt>
            <dd>
              <KPIValue format={formatter} value={current} />
            </dd>
            {state === 'loading' && (
              <dd className='text-sm'>
                <SkeletonText className='w-48' />
              </dd>
            )}
            {!state && (
              <dd className='text-muted-foreground text-sm'>
                <span
                  className={
                    breached
                      ? 'font-medium text-red-700 dark:text-red-400'
                      : 'font-medium text-emerald-700 dark:text-emerald-400'
                  }
                >
                  {gap} {breached ? 'above' : 'below'}
                </span>{' '}
                the {formatter(threshold)} threshold
              </dd>
            )}
          </div>
          {state !== 'error' && state !== 'empty' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Peak</dt>
                <dd>
                  <KPIValue className='text-2xl' format={formatter} value={highest} />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Threshold</dt>
                <dd>
                  <KPIValue className='text-2xl' format={formatter} value={threshold} />
                </dd>
              </div>
            </>
          )}
        </dl>
        {state && <ChartPlaceholder height={208} />}
        {!state && (
          <ChartPanelFigure className='h-52'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart
                aria-label={`${metric} over the last hour`}
                data={readings}
                margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id={`${id}-stroke`} x1='0' x2='0' y1='0' y2='1'>
                    <stop offset={clamp(strokeSplit)} stopColor={BREACH_COLOR} />
                    <stop
                      offset={clamp(strokeSplit)}
                      stopColor={BREACH_COLOR}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id={`${id}-fill`} x1='0' x2='0' y1='0' y2='1'>
                    <stop offset={0} stopColor={BREACH_COLOR} stopOpacity={0.3} />
                    <stop
                      offset={clamp(fillSplit)}
                      stopColor={BREACH_COLOR}
                      stopOpacity={0.15}
                    />
                    <stop
                      offset={clamp(fillSplit)}
                      stopColor='var(--color-chart-2)'
                      stopOpacity={0.2}
                    />
                    <stop offset={1} stopColor='var(--color-chart-2)' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis
                  {...chartAxisProps}
                  dataKey='label'
                  interval='preserveStartEnd'
                  minTickGap={40}
                />
                <YAxis
                  {...chartAxisProps}
                  domain={[0, yMax]}
                  tickFormatter={(value: number) => formatter(value)}
                  width={chartValueAxisWidth}
                />
                <ReferenceArea
                  y1={threshold}
                  y2={yMax}
                  fill={BREACH_COLOR}
                  fillOpacity={0.05}
                  ifOverflow='hidden'
                />
                <ReferenceLine
                  {...chartReferenceProps}
                  y={threshold}
                  stroke={BREACH_COLOR}
                  strokeOpacity={1}
                  label={{
                    ...chartReferenceLabel,
                    position: 'insideTopLeft',
                    value: `Threshold ${formatter(threshold)}`,
                  }}
                />
                <Tooltip
                  content={(tooltipProps) => (
                    <ChartTooltipContent {...tooltipProps} valueFormatter={formatter} />
                  )}
                  cursor={chartLineCursor}
                />
                <Area
                  activeDot={chartActiveDot}
                  dataKey='value'
                  dot={chartLastDot(
                    readings.length,
                    breached ? BREACH_COLOR : 'var(--color-chart-2)',
                  )}
                  fill={`url(#${id}-fill)`}
                  name={metric}
                  stroke='var(--color-chart-2)'
                  strokeWidth={2}
                  type='monotone'
                />
                <Line
                  activeDot={false}
                  dataKey='value'
                  dot={false}
                  stroke={`url(#${id}-stroke)`}
                  strokeWidth={2}
                  tooltipType='none'
                  type='monotone'
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        )}
        {!state && (
          <ChartPanelTable
            caption={`${metric} over the last hour. Threshold ${formatter(threshold)}.`}
            columns={[
              { key: 'label', label: 'Time' },
              { format: formatter, key: 'value', label: metric },
            ]}
            rows={readings}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Alerts2, exampleProps as alerts2ExampleProps, type Alerts2Props }
