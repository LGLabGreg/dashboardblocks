'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipContent,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLastDot,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  type Metric,
  MetricChange,
  MetricSparkline,
  describeHistory,
  formatMetricValue,
  getMetricFormatter,
} from '@/registry/components/dashboardblocks/metric-list'
import { formatDate } from '@/registry/lib/dashboardblocks/format'
import { useId, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'

interface WatchedMetric extends Metric {
  /** One value per entry in `labels`, oldest first. */
  history: number[]
}

interface MetricList4Props {
  /** Follows the previous value in each change, such as `30 days ago`. */
  comparison: string
  defaultSelected?: string
  description: string
  labels: string[]
  /** Leave out, or pass none, to show the empty state. */
  metrics?: WatchedMetric[]
  onSelectedChange?: (key: string) => void
  status?: BlockStatus
  title: string
}

const NOW = Date.UTC(2026, 8, 25)

const exampleDaily = (
  end: number,
  slope: number,
  wobble: number,
  weekendDip = wobble,
  digits = 0,
) =>
  Array.from({ length: 30 }, (_, day) => {
    const weekly = day % 7 === 5 || day % 7 === 6 ? -weekendDip : 0
    const value = end - (29 - day) * slope + Math.sin(day / 2.1) * wobble * 0.6 + weekly
    return Number(value.toFixed(digits))
  })

const fromHistory = (history: number[]) => ({
  history,
  previous: history[0],
  value: history[history.length - 1],
})

const exampleProps: MetricList4Props = {
  comparison: '30 days ago',
  description: 'Daily over the last 30 days. Pick a metric to chart it.',
  labels: Array.from({ length: 30 }, (_, day) =>
    formatDate(new Date(NOW - (29 - day) * 86_400_000), 'day'),
  ),
  metrics: [
    {
      ...fromHistory(exampleDaily(13_310, 38, 420)),
      format: 'compact',
      key: 'dau',
      label: 'Active users',
    },
    {
      ...fromHistory(exampleDaily(196_750, 420, 500, 0)),
      format: 'currency-compact',
      key: 'mrr',
      label: 'MRR',
    },
    {
      ...fromHistory(exampleDaily(142, 0.6, 18)),
      key: 'signups',
      label: 'Sign-ups',
    },
    {
      ...fromHistory(exampleDaily(0.42, -0.006, 0.06, -0.04, 2)),
      changeType: 'points',
      format: 'percent',
      goodDirection: 'down',
      key: 'errors',
      label: 'Error rate',
    },
    {
      ...fromHistory(exampleDaily(412, 1.8, 16)),
      format: 'milliseconds',
      goodDirection: 'down',
      key: 'latency',
      label: 'p95 API latency',
    },
  ],
  title: 'Watchlist',
}

const MetricList4 = (props: MetricList4Props) => {
  const {
    comparison,
    defaultSelected,
    description,
    labels,
    metrics = [],
    onSelectedChange,
    status,
    title,
  } = props
  const id = useId()
  const gradient = useChartId()
  const [selected, setSelected] = useState(defaultSelected ?? metrics[0]?.key)
  const metric = metrics.find((item) => item.key === selected) ?? metrics[0]
  const state = getBlockState(status, metric)
  const showHeading = state === undefined || state === 'loading'

  const format = getMetricFormatter(metric?.format)
  const data = (metric?.history ?? []).map((value, index) => ({
    label: labels[index] ?? String(index + 1),
    value,
  }))
  const average =
    data.reduce((sum, point) => sum + point.value, 0) / Math.max(1, data.length)
  const last = data.length - 1

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='grid border-t @2xl:grid-cols-[19rem_minmax(0,1fr)] @2xl:gap-8'>
          <fieldset className='min-w-0'>
            <legend className='sr-only'>Metric to chart</legend>
            {state === 'loading' && (
              <BlockStateRows className='border-b' rows={Math.max(metrics.length, 5)} />
            )}
            {!state && metric && (
              <ul className='divide-y border-b'>
                {metrics.map((item) => (
                  <li key={item.key}>
                    <label className='hover:bg-muted/50 has-checked:bg-muted/60 has-focus-visible:outline-ring relative grid cursor-pointer grid-cols-[minmax(0,1fr)_3rem_5.5rem] items-center gap-x-3 py-2.5 pr-2 pl-3 transition-colors has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 motion-reduce:transition-none'>
                      <input
                        type='radio'
                        name={id}
                        value={item.key}
                        checked={item.key === metric.key}
                        onChange={() => {
                          setSelected(item.key)
                          onSelectedChange?.(item.key)
                        }}
                        className='sr-only'
                      />
                      <span
                        aria-hidden
                        className={cn(
                          'bg-foreground absolute inset-y-0 left-0 w-0.5',
                          item.key !== metric.key && 'hidden',
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm',
                          item.key === metric.key && 'font-medium',
                        )}
                      >
                        {item.label}
                      </span>
                      <span aria-hidden>
                        <MetricSparkline
                          animated={false}
                          className='w-full'
                          color={
                            item.key === metric.key
                              ? 'var(--color-chart-2)'
                              : 'var(--color-muted-foreground)'
                          }
                          data={item.history}
                          formatter={getMetricFormatter(item.format)}
                          label={describeHistory(item)}
                          labels={labels}
                        />
                      </span>
                      <span className='flex flex-col items-end gap-0.5'>
                        <span className='text-sm font-medium whitespace-nowrap tabular-nums'>
                          {formatMetricValue(item, item.value)}
                        </span>
                        <MetricChange comparison={comparison} metric={item} />
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
          <section
            aria-labelledby={showHeading ? `${id}-heading` : undefined}
            className='flex min-w-0 flex-col gap-4 pt-5'
          >
            <div className='flex flex-col gap-1'>
              {showHeading && (
                <h3 id={`${id}-heading`} className='text-sm font-medium'>
                  <BlockReady className='text-sm'>{metric?.label}</BlockReady>
                </h3>
              )}
              <KPIValue format={format} value={metric?.value} />
              {metric && (
                <MetricChange
                  comparison={comparison}
                  metric={metric}
                  variant='sentence'
                />
              )}
            </div>
            {state || !metric ? (
              <ChartPanelFigure className='h-48 @2xl:h-56'>
                <ChartPlaceholder height='100%' />
              </ChartPanelFigure>
            ) : (
              <>
                <ChartPanelFigure className='h-48 @2xl:h-56'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart
                      aria-label={metric.label}
                      data={data}
                      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id={gradient} x1='0' x2='0' y1='0' y2='1'>
                          <stop
                            offset='0%'
                            stopColor='var(--color-chart-2)'
                            stopOpacity={0.3}
                          />
                          <stop
                            offset='100%'
                            stopColor='var(--color-chart-2)'
                            stopOpacity={0}
                          />
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
                        domain={['auto', 'auto']}
                        tickFormatter={(value: number) => format(value)}
                        width={chartValueAxisWidth}
                      />
                      <Tooltip
                        content={(tooltipProps) => (
                          <ChartTooltipContent
                            {...tooltipProps}
                            valueFormatter={format}
                          />
                        )}
                        cursor={chartLineCursor}
                      />
                      <ReferenceLine
                        {...chartReferenceProps}
                        y={average}
                        label={{
                          ...chartReferenceLabel,
                          position: 'insideBottomLeft',
                          value: `30-day average ${format(average)}`,
                        }}
                      />
                      <Area
                        key={metric.key}
                        activeDot={chartActiveDot}
                        dataKey='value'
                        dot={chartLastDot(data.length, 'var(--color-chart-2)')}
                        fill={`url(#${gradient})`}
                        name={metric.label}
                        stroke='var(--color-chart-2)'
                        strokeWidth={2}
                        type='monotone'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartPanelFigure>
                <ChartPanelTable
                  caption={`${metric.label} by day, ${data[0]?.label ?? ''} to ${data[last]?.label ?? ''}`}
                  columns={[
                    { key: 'label', label: 'Day' },
                    { format, key: 'value', label: metric.label },
                  ]}
                  rows={data}
                />
              </>
            )}
          </section>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { MetricList4, exampleProps as metricList4ExampleProps, type MetricList4Props }
