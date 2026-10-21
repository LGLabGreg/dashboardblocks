'use client'

import {
  BlockStateProvider,
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
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  Stat,
  StatChange,
  StatChangeContent,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatValue,
  formatStatValue,
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DailyValue {
  current: number
  label: string
  previous: number
}

interface ChartMetric extends StatMetric {
  daily: DailyValue[]
}

interface StatGroup3Props {
  currentLabel?: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: ChartMetric[]
  /** How many metrics to sketch while loading. @default 4 */
  placeholders?: number
  previousLabel?: string
  status?: BlockStatus
  title: string
}

const exampleDaily = (
  base: number,
  slope: number,
  wobble: number,
  previousRatio: number,
  digits = 0,
): DailyValue[] =>
  Array.from({ length: 30 }, (_, day) => {
    const weekend = day % 7 > 4 ? 0.85 : 1
    const current = (base + day * slope + Math.sin(day / 2.2) * wobble) * weekend
    const previous =
      (base * previousRatio + day * slope * 0.5 + Math.sin(day / 2.8 + 1) * wobble) *
      weekend
    return {
      current: Number(current.toFixed(digits)),
      label: `Sep ${day + 1}`,
      previous: Number(previous.toFixed(digits)),
    }
  })

const exampleTotals = (daily: DailyValue[], mode: 'mean' | 'sum', digits = 0) => {
  const total = (key: 'current' | 'previous') => {
    const sum = daily.reduce((acc, day) => acc + day[key], 0)
    return Number((mode === 'sum' ? sum : sum / daily.length).toFixed(digits))
  }
  return { daily, previous: total('previous'), value: total('current') }
}

const exampleProps: StatGroup3Props = {
  currentLabel: 'Sep 1 – 30',
  metrics: [
    {
      ...exampleTotals(exampleDaily(1_420, 12, 160, 0.92), 'sum'),
      formatter: (value) => formatCurrency(value),
      key: 'revenue',
      label: 'Revenue',
    },
    {
      ...exampleTotals(exampleDaily(40, 0.2, 5, 0.95), 'sum'),
      key: 'orders',
      label: 'Orders',
    },
    {
      ...exampleTotals(exampleDaily(36.2, 0.08, 1.4, 0.96, 2), 'mean', 2),
      formatter: (value) => formatCurrency(value, { precision: 'exact' }),
      key: 'aov',
      label: 'Avg order value',
    },
    {
      ...exampleTotals(exampleDaily(2.1, -0.02, 0.25, 1.1, 1), 'mean', 1),
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      goodDirection: 'down',
      key: 'refundRate',
      label: 'Refund rate',
    },
  ],
  previousLabel: 'Aug 2 – 31',
  title: 'Sales',
}

const CURRENT_COLOR = 'var(--color-chart-2)'
const PREVIOUS_COLOR = 'var(--color-muted-foreground)'

const StatGroup3 = (props: StatGroup3Props) => {
  const {
    currentLabel = 'This period',
    metrics = [],
    placeholders = 4,
    previousLabel = 'Previous period',
    status,
    title,
  } = props
  const gradient = useChartId()
  const [active, setActive] = useState<string>()
  const state = getBlockState(status, metrics)

  const header = (
    <header className='flex flex-col gap-0.5'>
      <h2 className='font-semibold tracking-tight'>{title}</h2>
      <p className='text-muted-foreground text-sm'>
        {currentLabel} against {previousLabel}. Pick a metric to chart it by day.
      </p>
    </header>
  )

  if (state) {
    return (
      <BlockStateProvider state={state}>
        <section className='@container flex flex-col gap-4'>
          {header}
          <StatGroup className='grid-cols-2 gap-x-6 gap-y-3 @2xl:grid-cols-4'>
            {getStatPlaceholders(placeholders).map((metric) => (
              <Stat key={metric.key}>
                <StatLabel />
                <StatValue className='text-3xl @4xl:text-4xl' />
                <StatChange className='text-xs' metric={metric} variant='short' />
              </Stat>
            ))}
          </StatGroup>
          {state === 'loading' && <ChartPlaceholder className='mt-1' height={224} />}
        </section>
      </BlockStateProvider>
    )
  }

  return (
    <section className='@container flex flex-col gap-4'>
      {header}
      <Tabs
        value={active ?? metrics[0]?.key}
        onValueChange={(value) => setActive(String(value))}
        className='gap-0'
      >
        <TabsList
          aria-label={`${title} metrics`}
          variant='line'
          className='grid h-auto w-full grid-cols-2 items-stretch gap-x-6 gap-y-3 rounded-none border-t p-0 group-data-horizontal/tabs:h-auto @2xl:grid-cols-4'
        >
          {metrics.map((metric) => (
            <TabsTrigger
              key={metric.key}
              value={metric.key}
              className='h-auto min-w-0 flex-col items-start justify-start gap-1 rounded-none px-0 pt-3 pb-3 text-left font-normal whitespace-normal'
            >
              <span className='text-muted-foreground text-sm'>{metric.label}</span>
              <span className='text-3xl font-light tracking-tight whitespace-nowrap tabular-nums @4xl:text-4xl'>
                {formatStatValue(metric)}
              </span>
              <StatChangeContent
                className='text-xs'
                comparison={previousLabel}
                metric={metric}
                variant='short'
              />
            </TabsTrigger>
          ))}
        </TabsList>
        {metrics.map((metric) => {
          const format = metric.formatter ?? ((value: number) => formatNumber(value))
          return (
            <TabsContent
              key={metric.key}
              value={metric.key}
              className='mt-1 flex flex-col gap-3 border-t pt-4'
            >
              <ChartPanelLegend
                items={[
                  { color: CURRENT_COLOR, label: currentLabel, shape: 'line' },
                  {
                    color: PREVIOUS_COLOR,
                    label: previousLabel,
                    shape: 'line',
                  },
                ]}
              />
              <ChartPanelFigure className='h-56'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart
                    aria-label={`${metric.label} by day, ${currentLabel} against ${previousLabel}`}
                    data={metric.daily}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id={gradient} x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={CURRENT_COLOR} stopOpacity={0.3} />
                        <stop offset='100%' stopColor={CURRENT_COLOR} stopOpacity={0} />
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
                      tickFormatter={(value: number) =>
                        metric.changeType === 'points'
                          ? format(value)
                          : formatCompact(value)
                      }
                      width={chartValueAxisWidth}
                    />
                    <Tooltip
                      content={(tooltipProps) => (
                        <ChartTooltipContent {...tooltipProps} valueFormatter={format} />
                      )}
                      cursor={chartLineCursor}
                      itemSorter={(item) => (item.dataKey === 'current' ? 0 : 1)}
                    />
                    <Line
                      activeDot={chartActiveDot}
                      dataKey='previous'
                      dot={false}
                      name={previousLabel}
                      stroke={PREVIOUS_COLOR}
                      strokeDasharray='3 3'
                      strokeWidth={1.5}
                      type='monotone'
                    />
                    <Area
                      activeDot={chartActiveDot}
                      dataKey='current'
                      dot={chartLastDot(metric.daily.length, CURRENT_COLOR)}
                      fill={`url(#${gradient})`}
                      name={currentLabel}
                      stroke={CURRENT_COLOR}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      type='monotone'
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartPanelFigure>
              <ChartPanelTable
                caption={`${metric.label} by day, ${currentLabel} vs ${previousLabel}`}
                columns={[
                  { key: 'label', label: 'Day' },
                  { format, key: 'current', label: currentLabel },
                  { format, key: 'previous', label: previousLabel },
                ]}
                rows={metric.daily}
              />
            </TabsContent>
          )
        })}
      </Tabs>
    </section>
  )
}

export { StatGroup3, exampleProps as statGroup3ExampleProps, type StatGroup3Props }
