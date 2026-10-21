'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
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
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { getRunway } from '@/registry/components/dashboardblocks/spend'
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from '@/registry/lib/dashboardblocks/format'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Spend4Props {
  /** Month-end cash balances, oldest first, one month apart. Leave out, or pass none, to show the empty state. */
  balances?: number[]
  /** @default 'USD' */
  currency?: string
  description: string
  lastMonth: Date
  status?: BlockStatus
  /** Months of change to average for the burn. */
  trailing?: number
  title: string
}

const exampleProps: Spend4Props = {
  balances: [4_820_000, 4_610_000, 4_430_000, 4_190_000, 3_980_000, 3_740_000],
  description: 'Cash balance, with the runway at the average burn of the last 3 months.',
  lastMonth: new Date(Date.UTC(2026, 7, 1)),
  title: 'Burn and runway',
}

const formatMonth = (date: Date) =>
  `${formatDate(date, 'month')} '${String(date.getUTCFullYear()).slice(2)}`

const Spend4 = (props: Spend4Props) => {
  const {
    balances = [],
    currency = 'USD',
    description,
    lastMonth,
    status,
    title,
    trailing = 3,
  } = props
  const state = getBlockState(status, balances)
  const gradient = useChartId()
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

  const today = rows[balances.length - 1]
  const empty = rows.find((row) => row.projected === 0)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>Cash</dt>
            <dd>
              <KPIValue className='whitespace-nowrap' value={cash} format={compact} />
            </dd>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>
                  {monthlyNet < 0 ? 'Net burn' : 'Net gain'} a month
                </dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={Math.abs(monthlyNet)}
                    format={compact}
                  />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Runway</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={runway.months}
                    format={(months) =>
                      Number.isFinite(months)
                        ? `${formatNumber(months, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} months`
                        : 'Not burning'
                    }
                  />
                </dd>
                {runway.date && (
                  <dd className='text-muted-foreground text-xs'>
                    <BlockReady className='text-xs'>
                      Cash runs out around {formatDate(runway.date, 'month-long-year')}
                    </BlockReady>
                  </dd>
                )}
              </div>
            </>
          )}
        </dl>
        {state !== 'empty' && state !== 'error' && (
          <ChartPanelLegend
            items={[
              { color: 'var(--color-chart-2)', label: 'Cash balance', shape: 'line' },
              {
                color: 'var(--color-muted-foreground)',
                label: 'At the current burn',
                shape: 'line',
              },
            ]}
          />
        )}
        {state ? (
          <ChartPlaceholder height={240} />
        ) : (
          <ChartPanelFigure className='h-60'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart
                aria-label={`${title} chart`}
                data={rows}
                margin={{ top: 20, right: 16, bottom: 0, left: 0 }}
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
                  minTickGap={20}
                />
                <YAxis
                  {...chartAxisProps}
                  domain={[0, 'auto']}
                  tickFormatter={compact}
                  width={chartValueAxisWidth}
                />
                <Tooltip
                  content={(tooltipProps) => (
                    <ChartTooltipContent
                      {...tooltipProps}
                      payload={tooltipProps.payload
                        ?.filter(
                          (item) => item.value !== null && item.value !== undefined,
                        )
                        .slice(0, 1)}
                      valueFormatter={format}
                    />
                  )}
                  cursor={chartLineCursor}
                />
                {today && (
                  <ReferenceLine
                    x={today.label}
                    stroke='var(--color-border)'
                    label={{ ...chartReferenceLabel, position: 'top', value: 'Now' }}
                  />
                )}
                <Area
                  activeDot={chartActiveDot}
                  dataKey='actual'
                  dot={chartLastDot(balances.length, 'var(--color-chart-2)')}
                  fill={`url(#${gradient})`}
                  name='Cash balance'
                  stroke='var(--color-chart-2)'
                  strokeWidth={2}
                  type='monotone'
                />
                <Line
                  activeDot={chartActiveDot}
                  dataKey='projected'
                  dot={false}
                  name='At the current burn'
                  stroke='var(--color-muted-foreground)'
                  strokeDasharray='5 4'
                  strokeWidth={2}
                  type='linear'
                />
                {empty && (
                  <ReferenceLine
                    {...chartReferenceProps}
                    x={empty.label}
                    stroke='var(--color-red-500)'
                    strokeOpacity={1}
                    label={{
                      ...chartReferenceLabel,
                      fill: 'var(--color-foreground)',
                      fontWeight: 500,
                      position: 'insideTopRight',
                      value: 'Out of cash',
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        )}
        {!state && (
          <ChartPanelTable
            caption={`${title}: ${description}`}
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
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Spend4, exampleProps as spend4ExampleProps, type Spend4Props }
