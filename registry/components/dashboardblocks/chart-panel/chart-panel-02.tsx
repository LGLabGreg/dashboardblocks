'use client'

import {
  BlockStateProvider,
  type BlockStatus,
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
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ChartPanel2Props {
  /** Follows the previous value in each change, such as `the previous 14 days`. @default 'the previous period' */
  comparison?: string
  /** Leave out, or pass no days, to show the empty state. */
  data?: Array<Record<string, number | string> & { label: string }>
  description: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: StatMetric[]
  /** How many metrics to sketch while loading. @default 3 */
  placeholders?: number
  status?: BlockStatus
  title: string
}

const exampleProps: ChartPanel2Props = {
  comparison: 'the previous 14 days',
  data: Array.from({ length: 14 }, (_, day) => {
    const weekend = day % 7 > 4
    const visitors = Math.round(
      1650 + day * 22 + Math.sin(day / 1.6) * 260 - (weekend ? 420 : 0),
    )
    return {
      bounceRate: Math.round(
        44 - day * 0.3 + Math.cos(day / 1.8) * 3 + (weekend ? 4 : 0),
      ),
      label: `Sep ${day + 17}`,
      pageviews: Math.round(visitors * (3.1 + Math.sin(day / 3) * 0.3)),
      visitors,
    }
  }),
  description: 'Sep 17 to 30, by day. Pick a metric to chart it.',
  metrics: [
    { key: 'visitors', label: 'Visitors', previous: 21_635, value: 24_318 },
    { key: 'pageviews', label: 'Page views', previous: 75_119, value: 81_204 },
    {
      changeType: 'points',
      formatter: (value) => formatPercent(value / 100),
      goodDirection: 'down',
      key: 'bounceRate',
      label: 'Bounce rate',
      previous: 44.2,
      value: 41,
    },
  ],
  title: 'Traffic',
}

const SERIES_COLOR = 'var(--color-chart-2)'

const ChartPanel2 = (props: ChartPanel2Props) => {
  const {
    comparison = 'the previous period',
    data = [],
    description,
    metrics = [],
    placeholders = 3,
    status,
    title,
  } = props
  const gradient = useChartId()
  const [active, setActive] = useState<string>()
  const empty = metrics.length === 0 || data.length === 0
  const state = status ?? (empty ? 'empty' : undefined)

  const header = (
    <header className='flex flex-col gap-0.5'>
      <h2 className='font-semibold tracking-tight'>{title}</h2>
      <p className='text-muted-foreground text-sm'>{description}</p>
    </header>
  )

  if (state) {
    return (
      <BlockStateProvider state={state}>
        <section className='@container flex flex-col gap-4'>
          {header}
          <StatGroup className='grid-cols-2 gap-x-6 gap-y-3 @xl:grid-cols-3'>
            {getStatPlaceholders(placeholders).map((metric) => (
              <Stat key={metric.key}>
                <StatLabel />
                <StatValue className='text-3xl @2xl:text-4xl' />
                <StatChange className='text-xs' metric={metric} variant='short' />
              </Stat>
            ))}
          </StatGroup>
          <ChartPlaceholder className='mt-1' height={240} />
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
          className='grid h-auto w-full grid-cols-2 items-stretch gap-x-6 gap-y-3 rounded-none border-t p-0 group-data-horizontal/tabs:h-auto @xl:grid-cols-3'
        >
          {metrics.map((metric) => (
            <TabsTrigger
              key={metric.key}
              value={metric.key}
              className='h-auto min-w-0 flex-col items-start justify-start gap-1 rounded-none px-0 pt-3 pb-3 text-left font-normal whitespace-normal'
            >
              <span className='text-muted-foreground text-sm'>{metric.label}</span>
              <span className='text-3xl font-light tracking-tight whitespace-nowrap tabular-nums @2xl:text-4xl'>
                {formatStatValue(metric)}
              </span>
              <StatChangeContent
                className='text-xs'
                comparison={comparison}
                metric={metric}
                variant='short'
              />
            </TabsTrigger>
          ))}
        </TabsList>
        {metrics.map((metric) => {
          const format = metric.formatter ?? ((value: number) => formatNumber(value))
          const values = data.map((point) => Number(point[metric.key] ?? 0))
          const average =
            values.length > 0
              ? values.reduce((sum, value) => sum + value, 0) / values.length
              : 0
          return (
            <TabsContent
              key={metric.key}
              value={metric.key}
              className='mt-1 flex flex-col gap-3 border-t pt-4'
            >
              <ChartPanelFigure className='h-56'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    aria-label={`${title}: ${metric.label} chart`}
                    data={data}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id={gradient} x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={SERIES_COLOR} stopOpacity={0.3} />
                        <stop offset='100%' stopColor={SERIES_COLOR} stopOpacity={0} />
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
                        metric.formatter ? metric.formatter(value) : formatCompact(value)
                      }
                      width={chartValueAxisWidth}
                    />
                    <Tooltip
                      content={(tooltipProps) => (
                        <ChartTooltipContent {...tooltipProps} valueFormatter={format} />
                      )}
                      cursor={chartLineCursor}
                    />
                    <ReferenceLine
                      {...chartReferenceProps}
                      y={average}
                      label={{
                        ...chartReferenceLabel,
                        value: `avg ${format(Math.round(average))}`,
                        position: 'insideBottomLeft',
                        dy: -4,
                      }}
                    />
                    <Area
                      activeDot={chartActiveDot}
                      dataKey={metric.key}
                      dot={chartLastDot(data.length, SERIES_COLOR)}
                      fill={`url(#${gradient})`}
                      name={metric.label}
                      stroke={SERIES_COLOR}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      type='monotone'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanelFigure>
              <ChartPanelTable
                caption={`${title}: ${metric.label} by day`}
                columns={[
                  { key: 'label', label: 'Day' },
                  { format, key: metric.key, label: metric.label },
                ]}
                rows={data}
              />
            </TabsContent>
          )
        })}
      </Tabs>
    </section>
  )
}

export { ChartPanel2, exampleProps as chartPanel2ExampleProps, type ChartPanel2Props }
