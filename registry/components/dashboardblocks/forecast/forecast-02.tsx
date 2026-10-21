'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  type ConfidenceLevel,
  ForecastLegend,
  ForecastStatusLabel,
  ForecastTooltip,
  buildForecast,
  fitLinear,
  forecastColors,
  forecastDash,
  getDeadlineStatus,
  getForecastAxis,
  solveForTarget,
} from '@/registry/components/dashboardblocks/forecast'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCompact,
  formatDate,
  formatDateRange,
  formatNumber,
  formatPercent,
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

interface Forecast2Props {
  /** Running totals so far, oldest first, one step apart. Leave out, or pass none, to show the empty state. */
  actuals?: number[]
  deadline: Date
  formatter?: (value: number) => string
  lastDate: Date
  /** @default 0.8 */
  level?: ConfidenceLevel
  metric: string
  now: Date
  status?: BlockStatus
  stepDays?: number
  target: number
  title: string
}

const exampleProps: Forecast2Props = {
  actuals: Array.from({ length: 12 }, (_, week) =>
    Math.round(
      7_320 + week * 155 + Math.sin(week / 1.3) * 110 - (week % 4 === 1 ? 80 : 0),
    ),
  ),
  deadline: new Date(Date.UTC(2026, 11, 31)),
  formatter: (value) => formatNumber(value, { maximumFractionDigits: 0 }),
  lastDate: new Date(Date.UTC(2026, 8, 20)),
  metric: 'paying customers',
  now: new Date(Date.UTC(2026, 8, 26)),
  target: 10_000,
  title: 'Paying customers goal',
}

const DAY = 86_400_000

const Forecast2 = (props: Forecast2Props) => {
  const {
    actuals = [],
    deadline,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    lastDate,
    level = 0.8,
    metric,
    now,
    status: blockStatus,
    stepDays = 7,
    target,
    title,
  } = props
  const state = getBlockState(blockStatus, actuals)

  const gradientId = useChartId()
  const stepMs = stepDays * DAY
  const deadlineSteps = (deadline.getTime() - lastDate.getTime()) / stepMs
  const forecast = solveForTarget(actuals, target, {
    level,
    maxSteps: Math.max(52, deadlineSteps * 2),
    resolution: 1 / stepDays,
  })
  const status = getDeadlineStatus(forecast, deadlineSteps)
  const toDate = (steps: number) =>
    new Date(lastDate.getTime() + Math.ceil(steps * stepDays) * DAY)
  const expected = forecast.expected !== null ? toDate(forecast.expected) : null
  const earliest = forecast.earliest !== null ? toDate(forecast.earliest) : null
  const latest = forecast.latest !== null ? toDate(forecast.latest) : null

  const current = actuals[actuals.length - 1] ?? 0
  const trend = fitLinear(actuals).slope
  const stepsLeft = Math.max(0, (deadline.getTime() - now.getTime()) / stepMs)
  const needed = stepsLeft > 0 ? Math.max(0, (target - current) / stepsLeft) : 0
  const unit = stepDays === 7 ? 'week' : `${stepDays} days`
  const margin = expected
    ? Math.round((deadline.getTime() - expected.getTime()) / DAY)
    : null
  const percent = `${level * 100}%`

  const horizon = Math.max(
    1,
    Math.ceil(
      Math.min(Math.max(deadlineSteps, forecast.expected ?? 0), deadlineSteps * 1.5 + 4) +
        1,
    ),
  )
  const last = actuals.length - 1
  const rows = buildForecast(actuals, horizon, level).rows.map((row, index) => ({
    ...row,
    date: lastDate.getTime() + (index - last) * stepMs,
  }))
  const yAxis = getForecastAxis([
    ...rows.flatMap((row) => [row.actual, row.forecast]),
    target,
  ])
  const ticks = rows
    .filter((_, index) => (rows.length - 1 - index) % 4 === 0)
    .map((row) => row.date)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>
              {formatter(target)} {metric} by {formatDate(deadline, 'day')}.
            </p>
          </div>
          <ForecastStatusLabel status={status} />
        </header>
        <dl className='flex flex-wrap items-end gap-x-10 gap-y-3 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground text-sm'>
              {forecast.reached && !state
                ? `Reached ${formatter(target)}`
                : `Projected to reach ${formatter(target)}`}
            </dt>
            <dd className='text-4xl font-light tracking-tight tabular-nums'>
              {state === 'loading' ? (
                <SkeletonText className='w-[4.5em]' />
              ) : state ? (
                <BlockStateText variant='short' />
              ) : forecast.reached ? (
                formatter(current)
              ) : expected ? (
                formatDate(expected, 'day')
              ) : (
                'Not in view'
              )}
            </dd>
            {!state && !forecast.reached && margin !== null && (
              <dd className='text-muted-foreground text-xs'>
                {margin === 0
                  ? 'On the deadline'
                  : `${Math.abs(margin)} ${Math.abs(margin) === 1 ? 'day' : 'days'} ${margin > 0 ? 'before' : 'after'} the deadline`}
              </dd>
            )}
          </div>
          {state !== 'empty' && state !== 'error' && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Now</dt>
              <dd>
                <KPIValue className='text-2xl' value={current} format={formatter} />
              </dd>
              <dd className='text-muted-foreground text-xs tabular-nums'>
                <BlockReady className='text-xs'>
                  {formatPercent(current / (target || 1), { maximumFractionDigits: 0 })}{' '}
                  of the goal
                </BlockReady>
              </dd>
            </div>
          )}
        </dl>
        <ForecastLegend
          items={[
            { label: 'Actual', shape: 'line' },
            { label: 'Forecast', shape: 'dashed' },
            { label: `${percent} range`, shape: 'band' },
            { label: 'Goal', shape: 'dotted' },
          ]}
        />
        {state ? (
          <ChartPlaceholder height={208} />
        ) : (
          <ChartPanelFigure className='h-52'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart
                aria-label={title}
                data={rows}
                margin={{ top: 20, right: 12, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='0%'
                      stopColor={forecastColors.actual}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset='100%'
                      stopColor={forecastColors.actual}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <XAxis
                  {...chartAxisProps}
                  dataKey='date'
                  domain={['dataMin', 'dataMax']}
                  interval='preserveStartEnd'
                  minTickGap={24}
                  scale='time'
                  tickFormatter={(value: number) => formatDate(value, 'day')}
                  ticks={ticks}
                  type='number'
                />
                <YAxis
                  {...chartAxisProps}
                  domain={yAxis.domain}
                  tickFormatter={(value: number) => formatCompact(value)}
                  ticks={yAxis.ticks}
                  width={chartValueAxisWidth}
                />
                <ReferenceLine
                  {...chartReferenceProps}
                  y={target}
                  label={{
                    ...chartReferenceLabel,
                    position: 'insideTopLeft',
                    value: `Goal ${formatter(target)}`,
                  }}
                />
                <ReferenceLine
                  x={deadline.getTime()}
                  stroke={forecastColors.marker}
                  strokeWidth={1}
                  label={{
                    fill: 'var(--color-foreground)',
                    fontSize: 11,
                    position: 'top',
                    value: 'Deadline',
                  }}
                />
                <Tooltip
                  content={(tooltipProps) => (
                    <ForecastTooltip
                      {...tooltipProps}
                      formatLabel={(label) => formatDate(Number(label), 'day')}
                      level={level}
                      valueFormatter={formatter}
                    />
                  )}
                  cursor={chartLineCursor}
                />
                <Area
                  activeDot={false}
                  dataKey='band'
                  fill={forecastColors.band}
                  fillOpacity={1}
                  name={`${percent} range`}
                  stroke='none'
                  type='linear'
                />
                <Line
                  activeDot={chartActiveDot}
                  dataKey='forecast'
                  dot={false}
                  name='Forecast'
                  stroke={forecastColors.forecast}
                  strokeDasharray={forecastDash.forecast}
                  strokeWidth={2}
                  type='linear'
                />
                <Area
                  activeDot={chartActiveDot}
                  dataKey='actual'
                  dot={false}
                  fill={`url(#${gradientId})`}
                  fillOpacity={1}
                  name='Actual'
                  stroke={forecastColors.actual}
                  strokeLinecap='round'
                  strokeWidth={2}
                  type='monotone'
                />
                {expected && !forecast.reached && (
                  <ReferenceDot
                    x={expected.getTime()}
                    y={target}
                    r={5}
                    fill={forecastColors.forecast}
                    stroke='var(--color-background)'
                    strokeWidth={2}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        )}
        {!forecast.reached && (
          <BlockReady className='text-sm'>
            <p className='text-sm text-pretty'>
              {`Growing by ${formatter(Math.max(0, trend))} a ${unit}. Hitting the deadline takes ${formatter(needed)} a ${unit}`}
              {earliest
                ? latest
                  ? `, and the ${percent} range is ${formatDateRange({ end: latest, start: earliest })}.`
                  : `, and the ${percent} range starts on ${formatDate(earliest, 'day')}.`
                : '.'}
            </p>
          </BlockReady>
        )}
        {!state && (
          <ChartPanelTable
            caption={`${title}: ${formatter(target)} ${metric} by ${formatDate(deadline, 'day')}. The forecast is a straight-line fit with a ${percent} range.`}
            columns={[
              { key: 'label', label: 'Week ending' },
              { format: formatter, key: 'actual', label: 'Actual' },
              { format: formatter, key: 'forecast', label: 'Forecast' },
            ]}
            rows={rows.map((row, index) => ({
              actual: row.actual ?? '—',
              forecast: index > last ? (row.forecast ?? '—') : '—',
              label: formatDate(row.date, 'day'),
            }))}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forecast2, exampleProps as forecast2ExampleProps, type Forecast2Props }
