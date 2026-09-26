'use client'

import { formatCurrency } from '@/registry/components/dashboardblocks/billing'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import { spendColors } from '@/registry/components/dashboardblocks/spend'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  periods: SpendPeriod[]
  title: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const SPENT = [31_200, 30_850, 33_900, 35_120, 38_460, 36_980, 41_720, 43_050, 44_380]
const BUDGET = [34_000, 34_000, 34_000, 38_000, 38_000, 38_000, 42_000, 42_000, 42_000]

const exampleProps: Spend3Props = {
  description: 'Cloud spend against the monthly budget, 2026',
  periods: MONTHS.map((label, index) => ({
    budget: BUDGET[index],
    label,
    spent: SPENT[index],
  })),
  title: 'Spend vs budget',
}

const Spend3 = (props: Spend3Props) => {
  const { currency = 'USD', description, periods, title } = props
  const format = (value: number) => formatCurrency(value, { currency })
  const compact = (value: number) => formatCurrency(value, { compact: true, currency })
  const spent = periods.reduce((sum, period) => sum + period.spent, 0)
  const budget = periods.reduce((sum, period) => sum + period.budget, 0)
  const variance = spent - budget
  const overMonths = periods.filter((period) => period.spent > period.budget).length

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Spent, year to date</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {format(spent)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Budget, year to date</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {format(budget)}
            </dd>
          </div>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>
              {variance > 0 ? 'Over budget' : 'Under budget'}
            </dt>
            <dd
              className={cn(
                'text-2xl font-semibold tracking-tight tabular-nums',
                variance > 0 && 'text-red-700 dark:text-red-400',
              )}
            >
              {format(Math.abs(variance))}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {overMonths} of {periods.length} months over
            </dd>
          </div>
        </dl>
        <ChartPanelLegend
          items={[
            { color: spendColors.spent, label: 'Within budget' },
            { color: spendColors.over, label: 'Over budget' },
            { color: 'var(--muted-foreground)', label: 'Budget', shape: 'line' },
          ]}
        />
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={periods}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis {...chartAxisProps} dataKey='label' />
              <YAxis {...chartAxisProps} tickFormatter={compact} width={52} />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={format} />
                )}
                cursor={{ fill: 'var(--color-muted)', fillOpacity: 0.5 }}
              />
              <Bar dataKey='spent' maxBarSize={36} name='Spent' radius={[4, 4, 0, 0]}>
                {periods.map((period) => (
                  <Cell
                    key={period.label}
                    fill={
                      period.spent > period.budget ? spendColors.over : spendColors.spent
                    }
                  />
                ))}
              </Bar>
              <Line
                activeDot={false}
                dataKey='budget'
                dot={false}
                name='Budget'
                stroke='var(--color-muted-foreground)'
                strokeWidth={2}
                type='step'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
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
      </CardContent>
    </Card>
  )
}

export { Spend3, exampleProps as spend3ExampleProps, type Spend3Props, type SpendPeriod }
