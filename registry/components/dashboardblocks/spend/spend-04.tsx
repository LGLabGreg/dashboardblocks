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
import { getRunway } from '@/registry/components/dashboardblocks/spend'
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Spend4Props {
  /** Month-end cash balances, oldest first, one month apart. */
  balances: number[]
  /** @default 'USD' */
  currency?: string
  description: string
  /** The month of the last balance. */
  lastMonth: Date
  /** Months of change to average for the burn. @default 3 */
  trailing?: number
  title: string
}

const exampleProps: Spend4Props = {
  balances: [4_820_000, 4_610_000, 4_430_000, 4_190_000, 3_980_000, 3_740_000],
  description: 'Cash balance, with the runway at the average burn of the last 3 months',
  lastMonth: new Date(Date.UTC(2026, 7, 1)),
  title: 'Burn and runway',
}

const shortMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})
// "Mar '26", so the year doesn't read as a day of the month.
const formatMonth = (date: Date) =>
  `${shortMonthFormatter.format(date)} '${String(date.getUTCFullYear()).slice(2)}`
const longMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
})

const Spend4 = (props: Spend4Props) => {
  const {
    balances,
    currency = 'USD',
    description,
    lastMonth,
    title,
    trailing = 3,
  } = props
  const format = (value: number) => formatCurrency(value, { currency })
  const compact = (value: number) => formatCurrency(value, { compact: true, currency })

  const cash = balances[balances.length - 1] ?? 0
  const span = Math.min(trailing, balances.length - 1)
  const monthlyNet = span > 0 ? (cash - balances[balances.length - 1 - span]) / span : 0
  const runway = getRunway({ cash, monthlyNet, now: lastMonth })

  const monthAt = (offset: number) => {
    const date = new Date(lastMonth.getTime())
    date.setUTCMonth(date.getUTCMonth() + offset)
    return date
  }
  // Project month by month until cash runs out, up to two years ahead.
  const ahead = Number.isFinite(runway.months)
    ? Math.min(24, Math.ceil(runway.months))
    : 6
  const rows = [
    ...balances.map((balance, index) => ({
      actual: balance,
      label: formatMonth(monthAt(index - balances.length + 1)),
      projected: index === balances.length - 1 ? balance : null,
    })),
    ...Array.from({ length: ahead }, (_, index) => ({
      actual: null,
      label: formatMonth(monthAt(index + 1)),
      projected: Math.max(0, cash + monthlyNet * (index + 1)),
    })),
  ]

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Cash</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {compact(cash)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              {monthlyNet < 0 ? 'Net burn' : 'Net gain'}, per month
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {compact(Math.abs(monthlyNet))}
            </dd>
          </div>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Runway</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {Number.isFinite(runway.months)
                ? `${runway.months.toFixed(1)} months`
                : 'Not burning'}
            </dd>
            {runway.date && (
              <dd className='text-muted-foreground text-xs'>
                Cash runs out around {longMonthFormatter.format(runway.date)}
              </dd>
            )}
          </div>
        </dl>
        <ChartPanelLegend
          items={[
            { color: 'var(--chart-1)', label: 'Cash balance', shape: 'line' },
            {
              color: 'var(--muted-foreground)',
              label: 'At the current burn',
              shape: 'line',
            },
          ]}
        />
        <ChartPanelFigure className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id='spend-4-fill' x1='0' x2='0' y1='0' y2='1'>
                  <stop offset='0%' stopColor='var(--chart-1)' stopOpacity={0.3} />
                  <stop offset='100%' stopColor='var(--chart-1)' stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={20}
              />
              <YAxis
                {...chartAxisProps}
                domain={[0, 'auto']}
                tickFormatter={compact}
                width={52}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip
                    {...tooltipProps}
                    // Where the projection starts, show the actual balance only.
                    payload={tooltipProps.payload
                      ?.filter((item) => item.value !== null && item.value !== undefined)
                      .slice(0, 1)}
                    valueFormatter={format}
                  />
                )}
                cursor={{ stroke: 'var(--color-border)' }}
              />
              <Area
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='actual'
                fill='url(#spend-4-fill)'
                name='Cash balance'
                stroke='var(--chart-1)'
                strokeWidth={2}
                type='monotone'
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='projected'
                dot={false}
                name='At the current burn'
                stroke='var(--color-muted-foreground)'
                strokeDasharray='5 4'
                strokeWidth={2}
                type='linear'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
          columns={[
            { key: 'label', label: 'Month' },
            { key: 'actual', label: 'Cash balance' },
            { key: 'projected', label: 'Projected' },
          ]}
          rows={rows.map((row, index) => ({
            actual: row.actual === null ? '—' : format(row.actual),
            label: row.label,
            projected:
              row.projected === null || index < balances.length
                ? '—'
                : format(row.projected),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export { Spend4, exampleProps as spend4ExampleProps, type Spend4Props }
