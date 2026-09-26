'use client'

import {
  ChartPanelFigure,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  type Metric,
  MetricChange,
  MetricSparkline,
  describeHistory,
  formatMetricValue,
  getMetricFormatter,
} from '@/registry/components/dashboardblocks/metric-list'
import { useId, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface WatchedMetric extends Metric {
  /** One value per entry in `labels`, oldest first. */
  history: number[]
}

interface MetricList4Props {
  /** Read after each change, for example "vs 30 days ago". */
  comparison: string
  defaultSelected?: string
  description: string
  /** Labels for the chart's x-axis, one per history value. */
  labels: string[]
  metrics: WatchedMetric[]
  onSelectedChange?: (key: string) => void
  title: string
}

const NOW = Date.UTC(2026, 8, 25)
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

/** Thirty days of example values that end on `end`, with a dip at weekends. */
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

/** The latest value, compared with the first value in the window. */
const fromHistory = (history: number[]) => ({
  history,
  previous: history[0],
  value: history[history.length - 1],
})

const exampleProps: MetricList4Props = {
  comparison: 'vs 30 days ago',
  description: 'Daily, last 30 days',
  labels: Array.from({ length: 30 }, (_, day) =>
    dayFormatter.format(new Date(NOW - (29 - day) * 86_400_000)),
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
    metrics,
    onSelectedChange,
    title,
  } = props
  const id = useId()
  const [selected, setSelected] = useState(defaultSelected ?? metrics[0]?.key)
  const metric = metrics.find((item) => item.key === selected) ?? metrics[0]

  if (!metric) return null

  const format = getMetricFormatter(metric.format)
  const data = metric.history.map((value, index) => ({
    label: labels[index] ?? String(index + 1),
    value,
  }))

  return (
    <Card className='@container gap-0 py-0'>
      <CardHeader className='border-b pt-6'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className='grid @2xl:grid-cols-[20rem_minmax(0,1fr)]'>
        <fieldset className='min-w-0 border-b @2xl:border-r @2xl:border-b-0'>
          <legend className='sr-only'>Metric to chart</legend>
          <ul className='divide-y @2xl:border-b'>
            {metrics.map((item) => (
              <li key={item.key}>
                <label className='hover:bg-muted/50 has-checked:bg-muted/60 has-focus-visible:outline-ring relative grid cursor-pointer grid-cols-[minmax(0,1fr)_3rem_5.5rem] items-center gap-x-3 px-6 py-3 transition-colors has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 motion-reduce:transition-none'>
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
                    className={cn('text-sm', item.key === metric.key && 'font-medium')}
                  >
                    {item.label}
                  </span>
                  {/* The chart beside the list is the text alternative. */}
                  <span aria-hidden>
                    <MetricSparkline
                      animated={false}
                      className='w-full'
                      color='var(--color-muted-foreground)'
                      data={item.history}
                      label={describeHistory(item)}
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
        </fieldset>
        <section
          aria-labelledby={`${id}-heading`}
          className='flex min-w-0 flex-col gap-4 px-6 pt-5 pb-6'
        >
          <div className='flex flex-col gap-0.5'>
            <h3 id={`${id}-heading`} className='text-muted-foreground text-sm'>
              {metric.label}
            </h3>
            <p className='text-3xl font-semibold tracking-tight tabular-nums'>
              {format(metric.value)}
            </p>
            <div className='flex flex-wrap items-center gap-x-1.5 text-xs'>
              <MetricChange comparison={comparison} metric={metric} />
              <span aria-hidden className='text-muted-foreground'>
                {comparison}
              </span>
            </div>
          </div>
          <ChartPanelFigure className='h-48 @2xl:h-56'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
                  width={56}
                />
                <Tooltip
                  content={(tooltipProps) => (
                    <ChartPanelTooltip {...tooltipProps} valueFormatter={format} />
                  )}
                  cursor={{ stroke: 'var(--color-border)' }}
                />
                <Area
                  activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                  dataKey='value'
                  fill='var(--chart-1)'
                  fillOpacity={0.1}
                  name={metric.label}
                  stroke='var(--chart-1)'
                  strokeWidth={2}
                  type='monotone'
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
          <ChartPanelTable
            caption={`${metric.label}, ${description.toLowerCase()}`}
            columns={[
              { key: 'label', label: 'Day' },
              { format, key: 'value', label: metric.label },
            ]}
            rows={data}
          />
        </section>
      </div>
    </Card>
  )
}

export { MetricList4, exampleProps as metricList4ExampleProps, type MetricList4Props }
