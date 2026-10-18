'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLastDot,
  chartLineCursor,
  ChartTooltipContent,
  chartValueAxisWidth,
  type ChartValueFormatter,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCompact,
  formatCurrency,
  formatNumber,
} from '@/registry/lib/dashboardblocks/format'
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

interface PeriodPoint {
  current: number
  label: string
  previous: number
}

interface ChartPanel1Props {
  /** Follows the previous total in the change sentence, such as `the previous 30 days`. @default 'the previous period' */
  comparison?: string
  currentLabel?: string
  /** Leave out, or pass none, to show the empty state. */
  data?: PeriodPoint[]
  description: string
  formatter?: ChartValueFormatter
  previousLabel?: string
  /** @default true */
  showPrevious?: boolean
  status?: BlockStatus
  title: string
}

const exampleProps: ChartPanel1Props = {
  comparison: 'the previous 30 days',
  currentLabel: 'September',
  data: Array.from({ length: 30 }, (_, day) => ({
    current: Math.round(
      3900 + day * 42 + Math.sin(day / 2.2) * 420 - (day % 7 > 4 ? 520 : 0),
    ),
    label: `Sep ${day + 1}`,
    previous: Math.round(
      3700 + day * 18 + Math.sin(day / 2.8 + 1) * 360 - (day % 7 > 4 ? 480 : 0),
    ),
  })),
  description: 'Daily revenue in September, against the 30 days before.',
  formatter: (value) => formatCurrency(value),
  previousLabel: 'Previous 30 days',
  title: 'Revenue',
}

const CURRENT_COLOR = 'var(--color-chart-2)'
const PREVIOUS_COLOR = 'var(--color-muted-foreground)'

const ChartPanel1 = (props: ChartPanel1Props) => {
  const {
    comparison = 'the previous period',
    currentLabel = 'This period',
    data = [],
    description,
    formatter = (value) => formatNumber(value),
    previousLabel = 'Previous period',
    showPrevious = true,
    status,
    title,
  } = props
  const gradient = useChartId()

  const currentTotal = data.reduce((sum, point) => sum + point.current, 0)
  const previousTotal = data.reduce((sum, point) => sum + point.previous, 0)

  return (
    <BlockStateProvider state={getBlockState(status, data)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <KPIValue value={currentTotal} format={formatter} />
            {showPrevious && (
              <KPIChange
                comparison={comparison}
                format={formatter}
                previous={previousTotal}
                value={currentTotal}
              />
            )}
          </div>
          {showPrevious && (
            <ChartPanelLegend
              items={[
                { color: CURRENT_COLOR, label: currentLabel, shape: 'line' },
                { color: PREVIOUS_COLOR, label: previousLabel, shape: 'line' },
              ]}
            />
          )}
        </div>
        <ChartPanelFigure className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              aria-label={`${title} chart`}
              data={data}
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
                tickFormatter={(value: number) => formatCompact(value)}
                width={chartValueAxisWidth}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartTooltipContent {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={chartLineCursor}
                itemSorter={(item) => (item.dataKey === 'current' ? 0 : 1)}
              />
              {showPrevious && (
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
              )}
              <Area
                activeDot={chartActiveDot}
                dataKey='current'
                dot={chartLastDot(data.length, CURRENT_COLOR)}
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
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Day' },
            { format: formatter, key: 'current', label: currentLabel },
            ...(showPrevious
              ? [{ format: formatter, key: 'previous', label: previousLabel }]
              : []),
          ]}
          rows={data}
        />
      </section>
    </BlockStateProvider>
  )
}

export { ChartPanel1, exampleProps as chartPanel1ExampleProps, type ChartPanel1Props }
