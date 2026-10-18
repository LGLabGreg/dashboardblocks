'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartAxisProps,
  chartBarCursor,
  chartGridProps,
  ChartTooltipContent,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { spendColors } from '@/registry/components/dashboardblocks/spend'
import { formatCurrency, formatSigned } from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'

interface SpendPeriod {
  budget: number
  label: string
  spent: number
}

interface Spend3Props {
  /** @default 'USD' */
  currency?: string
  description: string
  /** Leave out, or pass none, to show the empty state. */
  periods?: SpendPeriod[]
  status?: BlockStatus
  title: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const SPENT = [31_200, 30_850, 33_900, 35_120, 38_460, 36_980, 41_720, 43_050, 44_380]
const BUDGET = [34_000, 34_000, 34_000, 38_000, 38_000, 38_000, 42_000, 42_000, 42_000]

const exampleProps: Spend3Props = {
  description: 'Cloud spend against the monthly budget, January to September 2026.',
  periods: MONTHS.map((label, index) => ({
    budget: BUDGET[index],
    label,
    spent: SPENT[index],
  })),
  title: 'Spend vs budget',
}

const MIN_LABELLED_BAR_WIDTH = 30

const Spend3 = (props: Spend3Props) => {
  const { currency = 'USD', description, periods = [], status, title } = props
  const state = getBlockState(status, periods)
  const format = (value: number) => formatCurrency(value, { currency })
  const compact = (value: number) => formatCurrency(value, { compact: true, currency })
  const spent = periods.reduce((sum, period) => sum + period.spent, 0)
  const budget = periods.reduce((sum, period) => sum + period.budget, 0)
  const variance = spent - budget
  const overMonths = periods.filter((period) => period.spent > period.budget).length

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3 @lg:items-start'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>Spent, year to date</dt>
            <dd>
              <KPIValue className='whitespace-nowrap' value={spent} format={format} />
            </dd>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Budget</dt>
                <dd>
                  <KPIValue className='text-2xl' value={budget} format={format} />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>
                  {variance > 0 ? 'Over budget' : 'Under budget'}
                </dt>
                <dd>
                  <KPIValue
                    className={cn(
                      'text-2xl',
                      variance > 0 && 'text-red-700 dark:text-red-400',
                    )}
                    value={Math.abs(variance)}
                    format={format}
                  />
                </dd>
                <dd className='text-muted-foreground text-xs'>
                  <BlockReady className='text-xs'>
                    {overMonths} of {periods.length} months over
                  </BlockReady>
                </dd>
              </div>
            </>
          )}
        </dl>
        {state !== 'empty' && state !== 'error' && (
          <ChartPanelLegend
            items={[
              { color: spendColors.spent, label: 'Within budget' },
              { color: spendColors.over, label: 'Over budget' },
              { color: 'var(--color-muted-foreground)', label: 'Budget', shape: 'line' },
            ]}
          />
        )}
        {state ? (
          <ChartPlaceholder height={256} />
        ) : (
          <ChartPanelFigure className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart
                aria-label={`${title} chart`}
                data={periods}
                margin={{ top: 20, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis {...chartAxisProps} dataKey='label' />
                <YAxis
                  {...chartAxisProps}
                  tickFormatter={compact}
                  width={chartValueAxisWidth}
                />
                <Tooltip
                  content={(tooltipProps) => (
                    <ChartTooltipContent {...tooltipProps} valueFormatter={format} />
                  )}
                  cursor={chartBarCursor}
                />
                <Bar dataKey='spent' maxBarSize={36} name='Spent' radius={[4, 4, 0, 0]}>
                  {periods.map((period) => (
                    <Cell
                      key={period.label}
                      fill={
                        period.spent > period.budget
                          ? spendColors.over
                          : spendColors.spent
                      }
                    />
                  ))}
                  <LabelList
                    dataKey='spent'
                    content={({ x, y, width, index }) => {
                      const period = index === undefined ? undefined : periods[index]
                      if (!period || period.spent <= period.budget) return null
                      if (Number(width) < MIN_LABELLED_BAR_WIDTH) return null
                      return (
                        <text
                          x={Number(x) + Number(width) / 2}
                          y={Number(y) - 6}
                          textAnchor='middle'
                          fontSize={11}
                          fontWeight={500}
                          fill='var(--color-foreground)'
                        >
                          {formatSigned(period.spent - period.budget, compact)}
                        </text>
                      )
                    }}
                  />
                </Bar>
                <Line
                  activeDot={false}
                  dataKey='budget'
                  dot={false}
                  name='Budget'
                  stroke='var(--color-muted-foreground)'
                  strokeDasharray='5 4'
                  strokeWidth={1.5}
                  type='step'
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        )}
        {!state && (
          <ChartPanelTable
            caption={`${title}: ${description}`}
            columns={[
              { key: 'label', label: 'Month' },
              { format, key: 'spent', label: 'Spent' },
              { format, key: 'budget', label: 'Budget' },
              { key: 'status', label: 'Status' },
            ]}
            rows={periods.map((period) => ({
              ...period,
              status: period.spent > period.budget ? 'Over budget' : 'Within budget',
            }))}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Spend3, exampleProps as spend3ExampleProps, type Spend3Props, type SpendPeriod }
