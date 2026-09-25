'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  StatChangeContent,
  type StatMetric,
  formatStatValue,
} from '@/registry/components/dashboardblocks/stat-group'
import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card } from '@/components/ui/card'
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
  metrics: ChartMetric[]
  previousLabel?: string
  title: string
}

/** Thirty days of example values for the current and previous period. */
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

/** Sums or averages the daily values into the period's value and previous value. */
const exampleTotals = (daily: DailyValue[], mode: 'mean' | 'sum', digits = 0) => {
  const total = (key: 'current' | 'previous') => {
    const sum = daily.reduce((acc, day) => acc + day[key], 0)
    return Number((mode === 'sum' ? sum : sum / daily.length).toFixed(digits))
  }
  return { daily, previous: total('previous'), value: total('current') }
}

const currency = (value: number) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const exampleProps: StatGroup3Props = {
  currentLabel: 'Sep 1 – 30',
  metrics: [
    {
      ...exampleTotals(exampleDaily(1_420, 12, 160, 0.92), 'sum'),
      formatter: currency,
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
      formatter: (value) => `$${value.toFixed(2)}`,
      key: 'aov',
      label: 'Avg order value',
    },
    {
      ...exampleTotals(exampleDaily(2.1, -0.02, 0.25, 1.1, 1), 'mean', 1),
      changeType: 'points',
      formatter: (value) => `${value}%`,
      goodDirection: 'down',
      key: 'refundRate',
      label: 'Refund rate',
    },
  ],
  previousLabel: 'Aug 2 – 31',
  title: 'Sales',
}

const CURRENT_COLOR = 'var(--chart-1)'
const PREVIOUS_COLOR = 'color-mix(in oklab, var(--muted-foreground) 55%, transparent)'

const StatGroup3 = (props: StatGroup3Props) => {
  const {
    currentLabel = 'This period',
    metrics,
    previousLabel = 'Previous period',
    title,
  } = props
  const [active, setActive] = useState(metrics[0]?.key)

  return (
    <Card className='@container gap-0 py-0'>
      <Tabs
        value={active}
        onValueChange={(value) => setActive(String(value))}
        className='gap-0'
      >
        <TabsList
          aria-label={`${title} metrics`}
          className='bg-border grid h-auto w-full grid-cols-2 items-stretch gap-px rounded-none border-b p-0 group-data-horizontal/tabs:h-auto @[44rem]:grid-cols-4'
        >
          {metrics.map((metric) => (
            <TabsTrigger
              key={metric.key}
              value={metric.key}
              className='bg-card data-active:bg-card dark:data-active:bg-card h-auto min-w-0 flex-col items-start justify-start gap-1 rounded-none border-0 px-4 py-4 text-left font-normal whitespace-normal hover:bg-[color-mix(in_oklab,var(--muted)_50%,var(--card))] data-active:shadow-[inset_0_-2px_0_var(--color-foreground)]! dark:data-active:border-transparent @md:px-6 @md:py-5 @[44rem]:px-5'
            >
              <span className='text-muted-foreground text-sm'>{metric.label}</span>
              <span className='text-foreground text-2xl font-semibold tracking-tight whitespace-nowrap @md:text-3xl'>
                {formatStatValue(metric)}
              </span>
              <StatChangeContent metric={metric} />
            </TabsTrigger>
          ))}
        </TabsList>
        {metrics.map((metric) => {
          const format = metric.formatter ?? ((value: number) => value.toLocaleString())
          return (
            <TabsContent
              key={metric.key}
              value={metric.key}
              className='flex flex-col gap-4 px-4 pt-5 pb-4 @md:px-6'
            >
              <ChartPanelLegend
                items={[
                  { color: CURRENT_COLOR, label: currentLabel, shape: 'line' },
                  { color: PREVIOUS_COLOR, label: previousLabel, shape: 'line' },
                ]}
              />
              <ChartPanelFigure className='h-56'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={metric.daily}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
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
                      width={44}
                    />
                    <Tooltip
                      content={(tooltipProps) => (
                        <ChartPanelTooltip {...tooltipProps} valueFormatter={format} />
                      )}
                      cursor={{ stroke: 'var(--color-border)' }}
                      itemSorter={(item) => (item.dataKey === 'current' ? 0 : 1)}
                    />
                    <Line
                      activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                      dataKey='previous'
                      dot={false}
                      name={previousLabel}
                      stroke={PREVIOUS_COLOR}
                      strokeLinecap='round'
                      strokeWidth={2}
                      type='monotone'
                    />
                    <Line
                      activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                      dataKey='current'
                      dot={false}
                      name={currentLabel}
                      stroke={CURRENT_COLOR}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      type='monotone'
                    />
                  </LineChart>
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
    </Card>
  )
}

export { StatGroup3, exampleProps as statGroup3ExampleProps, type StatGroup3Props }
