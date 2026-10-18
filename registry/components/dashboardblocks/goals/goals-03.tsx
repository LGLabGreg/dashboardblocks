'use client'

import {
  BlockReady,
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
  chartReferenceLabel,
  chartReferenceProps,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { PaceLabel, getPace } from '@/registry/components/dashboardblocks/goals'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
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
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'

interface Goals3Props {
  /** Daily values so far, oldest first. Leave out, or pass none, to show the empty state. */
  daily?: number[]
  description: string
  /** Day labels for the whole period, including days still to come. */
  days: string[]
  formatter?: (value: number) => string
  status?: BlockStatus
  target: number
  title: string
}

const SEPTEMBER = Array.from({ length: 30 }, (_, day) => `Sep ${day + 1}`)

const exampleProps: Goals3Props = {
  daily: Array.from({ length: 25 }, (_, day) =>
    Math.round(1_500 + day * 14 + Math.sin(day / 2.3) * 260 - (day % 7 > 4 ? 380 : 0)),
  ),
  description: 'Revenue so far this month, and where the daily rate takes it.',
  days: SEPTEMBER,
  formatter: (value) => formatCurrency(value),
  target: 48_000,
  title: 'September revenue goal',
}

const ACTUAL_COLOR = 'var(--color-chart-2)'
const PROJECTED_COLOR = 'var(--color-muted-foreground)'

const Goals3 = (props: Goals3Props) => {
  const {
    daily = [],
    description,
    days,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    status,
    target,
    title,
  } = props
  const state = getBlockState(status, daily)
  const gradient = useChartId()

  const actual = daily.map((_, index) =>
    daily.slice(0, index + 1).reduce((sum, value) => sum + value, 0),
  )
  const today = actual.length - 1
  const current = actual[today] ?? 0
  const pace = getPace({ current, elapsed: daily.length / days.length, target })
  const rate = daily.length > 0 ? current / daily.length : 0
  const rows = days.map((label, index) => ({
    actual: index <= today ? actual[index] : null,
    label,
    projected: index >= today ? Math.round(current + rate * (index - today)) : null,
  }))
  const projected = rows[rows.length - 1]?.projected ?? current
  const crossing = rows.find(
    (row, index) => index > today && row.projected !== null && row.projected >= target,
  )
  const daysLeft = days.length - daily.length
  const needed = daysLeft > 0 ? Math.max(0, target - current) / daysLeft : 0
  const step = 10 ** Math.floor(Math.log10(Math.max(target, projected, 1)))
  const yMax = Math.ceil((Math.max(target, projected) * 1.1) / step) * step
  const shortfall = target - projected

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {!state && <PaceLabel className='mt-0.5' status={pace.status} />}
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>So far</dt>
            <dd>
              <KPIValue value={current} format={formatter} />
            </dd>
            {(!state || state === 'loading') && (
              <dd className='text-muted-foreground text-xs tabular-nums'>
                <BlockReady>{formatter(rate)} a day on average</BlockReady>
              </dd>
            )}
          </div>
          {(!state || state === 'loading') && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Projected</dt>
                <dd>
                  <KPIValue className='text-2xl' value={projected} format={formatter} />
                </dd>
                <dd
                  className={cn(
                    'text-xs font-medium tabular-nums',
                    shortfall > 0
                      ? 'text-amber-800 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400',
                  )}
                >
                  <BlockReady>
                    {shortfall > 0
                      ? `${formatter(shortfall)} short`
                      : `${formatter(-shortfall)} over`}
                  </BlockReady>
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Target</dt>
                <dd className='text-2xl font-light tracking-tight tabular-nums'>
                  {formatter(target)}
                </dd>
                <dd className='text-muted-foreground text-xs tabular-nums'>
                  <BlockReady>
                    {current >= target
                      ? 'Reached'
                      : daysLeft > 0
                        ? `Needs ${formatter(needed)} a day from here`
                        : 'Not reached'}
                  </BlockReady>
                </dd>
              </div>
            </>
          )}
        </dl>
        {(!state || state === 'loading') && (
          <ChartPanelLegend
            items={[
              { color: ACTUAL_COLOR, label: 'Revenue so far', shape: 'line' },
              { color: PROJECTED_COLOR, label: 'At the daily rate', shape: 'line' },
            ]}
          />
        )}
        {state ? (
          <ChartPlaceholder height={240} />
        ) : (
          <>
            <ChartPanelFigure className='h-60'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart
                  aria-label={`${title} by day, with the target and the daily rate projected to the end`}
                  data={rows}
                  margin={{ top: 20, right: 16, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id={gradient} x1='0' x2='0' y1='0' y2='1'>
                      <stop offset='0%' stopColor={ACTUAL_COLOR} stopOpacity={0.3} />
                      <stop offset='100%' stopColor={ACTUAL_COLOR} stopOpacity={0} />
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
                    domain={[0, yMax]}
                    tickFormatter={(value: number) => formatCompact(value)}
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
                        valueFormatter={formatter}
                      />
                    )}
                    cursor={chartLineCursor}
                  />
                  <ReferenceLine
                    {...chartReferenceProps}
                    y={target}
                    label={{
                      ...chartReferenceLabel,
                      position: 'insideTopLeft',
                      value: `Target ${formatCompact(target)}`,
                    }}
                  />
                  {rows[today] && (
                    <ReferenceLine
                      x={rows[today].label}
                      stroke='var(--color-border)'
                      label={{ ...chartReferenceLabel, position: 'top', value: 'Today' }}
                    />
                  )}
                  <Area
                    activeDot={chartActiveDot}
                    dataKey='actual'
                    dot={chartLastDot(today + 1, ACTUAL_COLOR)}
                    fill={`url(#${gradient})`}
                    name='Revenue so far'
                    stroke={ACTUAL_COLOR}
                    strokeWidth={2}
                    type='monotone'
                  />
                  <Line
                    activeDot={chartActiveDot}
                    dataKey='projected'
                    dot={false}
                    name='At the daily rate'
                    stroke={PROJECTED_COLOR}
                    strokeDasharray='5 4'
                    strokeWidth={2}
                    type='linear'
                  />
                  {crossing ? (
                    <ReferenceDot
                      x={crossing.label}
                      y={target}
                      r={4}
                      fill='var(--color-emerald-600)'
                      stroke='var(--color-background)'
                      strokeWidth={2}
                      label={{
                        fill: 'var(--color-foreground)',
                        fontSize: 11,
                        fontWeight: 500,
                        position:
                          rows.indexOf(crossing) > rows.length * 0.75 ? 'left' : 'top',
                        value: `Hits it ${crossing.label}`,
                      }}
                    />
                  ) : (
                    rows.length > today + 1 && (
                      <ReferenceDot
                        x={rows[rows.length - 1].label}
                        y={projected}
                        r={4}
                        fill={PROJECTED_COLOR}
                        stroke='var(--color-background)'
                        strokeWidth={2}
                        label={{
                          fill: 'var(--color-foreground)',
                          fontSize: 11,
                          fontWeight: 500,
                          position: 'left',
                          value: `${formatter(shortfall)} short`,
                        }}
                      />
                    )
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
            <ChartPanelTable
              caption={`${title}: ${description} Target ${formatter(target)}.`}
              columns={[
                { key: 'label', label: 'Day' },
                { key: 'actual', label: 'Revenue so far' },
                { key: 'projected', label: 'At the daily rate' },
              ]}
              rows={rows.map((row, index) => ({
                actual: row.actual === null ? '—' : formatter(row.actual),
                label: row.label,
                projected:
                  row.projected === null || index === today
                    ? '—'
                    : formatter(row.projected),
              }))}
            />
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Goals3, exampleProps as goals3ExampleProps, type Goals3Props }
