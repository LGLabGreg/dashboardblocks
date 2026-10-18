'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartAxisProps,
  chartBarCursor,
  chartBarValueLabel,
  chartFadedColor,
  chartGridProps,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
  type ChartValueFormatter,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCompact,
  formatCurrency,
  formatNumber,
} from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface MonthValue {
  label: string
  value: number
}

interface ChartPanel4Props {
  /** Leave out, or pass no months, to show the empty state. */
  data?: MonthValue[]
  description: string
  formatter?: ChartValueFormatter
  /** A target drawn as a line across the bars, and said in words against the latest value. */
  goal?: { label: string; value: number }
  status?: BlockStatus
  title: string
}

const exampleProps: ChartPanel4Props = {
  data: [
    { label: 'Oct', value: 31_200 },
    { label: 'Nov', value: 33_900 },
    { label: 'Dec', value: 34_400 },
    { label: 'Jan', value: 37_100 },
    { label: 'Feb', value: 39_800 },
    { label: 'Mar', value: 41_300 },
    { label: 'Apr', value: 44_900 },
    { label: 'May', value: 46_200 },
    { label: 'Jun', value: 49_700 },
    { label: 'Jul', value: 52_100 },
    { label: 'Aug', value: 55_600 },
    { label: 'Sep', value: 59_400 },
  ],
  description: 'Monthly recurring revenue at the end of each of the last 12 months.',
  formatter: (value) => formatCurrency(value),
  goal: { label: 'Goal', value: 60_000 },
  title: 'MRR',
}

const HIGHLIGHT_COLOR = 'var(--color-chart-2)'
const MUTED_COLOR = chartFadedColor(HIGHLIGHT_COLOR)

const ChartPanel4 = (props: ChartPanel4Props) => {
  const {
    data = [],
    description,
    formatter = (value) => formatNumber(value),
    goal,
    status,
    title,
  } = props
  const lastIndex = data.length - 1
  const latest = data[lastIndex]
  const prior = data[lastIndex - 1]
  const gap = latest && goal ? goal.value - latest.value : 0

  return (
    <BlockStateProvider state={getBlockState(status, data)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <BlockReady className='w-16 text-sm'>
            <p className='text-muted-foreground text-sm'>{latest?.label}</p>
          </BlockReady>
          <KPIValue value={latest?.value} format={formatter} />
          <KPIChange
            comparison={`in ${prior?.label}`}
            format={formatter}
            previous={prior?.value}
            value={latest?.value}
          />
          {goal && (
            <BlockReady className='text-sm'>
              {latest && (
                <p className='text-muted-foreground text-sm'>
                  {gap > 0
                    ? `${formatter(gap)} short of the ${formatter(goal.value)} ${goal.label.toLowerCase()}.`
                    : `${formatter(-gap)} past the ${formatter(goal.value)} ${goal.label.toLowerCase()}.`}
                </p>
              )}
            </BlockReady>
          )}
        </div>
        <ChartPanelFigure className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              aria-label={`${title} chart`}
              data={data}
              margin={{ top: 24, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis {...chartAxisProps} dataKey='label' />
              <YAxis
                {...chartAxisProps}
                domain={[0, 'auto']}
                tickFormatter={(value: number) => formatCompact(value)}
                width={chartValueAxisWidth}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartTooltipContent {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={chartBarCursor}
              />
              <Bar dataKey='value' maxBarSize={28} name={title} radius={[4, 4, 0, 0]}>
                {data.map((point, index) => (
                  <Cell
                    key={point.label}
                    fill={index === lastIndex ? HIGHLIGHT_COLOR : MUTED_COLOR}
                  />
                ))}
                <LabelList
                  dataKey='value'
                  content={chartBarValueLabel(lastIndex, formatCompact)}
                />
              </Bar>
              {goal && (
                <ReferenceLine
                  {...chartReferenceProps}
                  ifOverflow='extendDomain'
                  y={goal.value}
                  label={{
                    ...chartReferenceLabel,
                    value: `${goal.label} ${formatCompact(goal.value)}`,
                    position: 'insideBottomLeft',
                    dy: -4,
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}${goal ? ` ${goal.label}: ${formatter(goal.value)}.` : ''}`}
          columns={[
            { key: 'label', label: 'Month' },
            { format: formatter, key: 'value', label: title },
          ]}
          rows={data}
        />
      </section>
    </BlockStateProvider>
  )
}

export { ChartPanel4, exampleProps as chartPanel4ExampleProps, type ChartPanel4Props }
