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
  ForecastTooltip,
  buildForecast,
  forecastColors,
  forecastDash,
  getForecastAxis,
} from '@/registry/components/dashboardblocks/forecast'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCompact,
  formatNumber,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Forecast1Props {
  /** Values so far, oldest first, one step apart. Leave out, or pass none, to show the empty state. */
  actuals?: number[]
  description: string
  formatter?: (value: number) => string
  horizon: number
  lastDate: Date
  /** @default 0.8 */
  level?: ConfidenceLevel
  now: Date
  status?: BlockStatus
  stepDays?: number
  title: string
}

const exampleProps: Forecast1Props = {
  actuals: Array.from({ length: 20 }, (_, week) =>
    Math.round(
      18_400 + week * 240 + Math.sin(week / 1.6) * 380 - (week % 5 === 2 ? 260 : 0),
    ),
  ),
  description: 'Weekly active users, with a forecast for the rest of the year.',
  formatter: (value) => formatNumber(value, { maximumFractionDigits: 0 }),
  horizon: 12,
  lastDate: new Date(Date.UTC(2026, 8, 20)),
  now: new Date(Date.UTC(2026, 8, 26)),
  title: 'Active users forecast',
}

const DAY = 86_400_000
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const formatDate = (value: number) => dateFormatter.format(value)

const Forecast1 = (props: Forecast1Props) => {
  const {
    actuals = [],
    description,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    horizon,
    lastDate,
    level = 0.8,
    now,
    status,
    stepDays = 7,
    title,
  } = props
  const state = getBlockState(status, actuals.length === 0)

  const { fit, rows: forecastRows } = buildForecast(actuals, horizon, level)
  const last = actuals.length - 1
  const rows = forecastRows.map((row, index) => ({
    ...row,
    date: lastDate.getTime() + (index - last) * stepDays * DAY,
  }))
  const current = last >= 0 ? rows[last] : undefined
  const end = last >= 0 ? rows[rows.length - 1] : undefined
  const percent = `${level * 100}%`
  const ticks = rows.filter((_, index) => (rows.length - 1 - index) % 4 === 0)
  const yAxis = getForecastAxis(rows.flatMap((row) => [row.actual, row.low, row.high]))
  const gradientId = useChartId()
  const unit = stepDays === 7 ? 'week' : `${stepDays} days`

  return (
    <BlockStateProvider status={status} empty={actuals.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3 @lg:items-start'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>
              {current && !state ? `Latest, ${formatDate(current.date)}` : 'Latest'}
            </dt>
            <dd>
              <KPIValue
                className='whitespace-nowrap'
                value={current?.actual ?? undefined}
                format={formatter}
              />
            </dd>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>
                  {end && !state ? `Forecast, ${formatDate(end.date)}` : 'Forecast'}
                </dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={end?.forecast ?? 0}
                    format={formatter}
                  />
                </dd>
                <dd className='text-muted-foreground text-xs tabular-nums'>
                  <BlockReady className='text-xs'>
                    {percent} range {formatter(end?.low ?? 0)} to{' '}
                    {formatter(end?.high ?? 0)}
                  </BlockReady>
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Trend</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={fit.slope}
                    format={(value) => formatSigned(value, formatter)}
                  />
                </dd>
                <dd className='text-muted-foreground text-xs'>
                  <BlockReady className='text-xs'>a {unit}</BlockReady>
                </dd>
              </div>
            </>
          )}
        </dl>
        <ForecastLegend
          items={[
            { label: 'Actual', shape: 'line' },
            { label: 'Forecast', shape: 'dashed' },
            { label: `${percent} range`, shape: 'band' },
            { label: 'Today', shape: 'marker' },
          ]}
        />
        {!current || !end || state ? (
          <ChartPlaceholder height={240} />
        ) : (
          <ChartPanelFigure className='h-60'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart
                aria-label={title}
                data={rows}
                margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
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
                  tickFormatter={formatDate}
                  ticks={ticks.map((row) => row.date)}
                  type='number'
                />
                <YAxis
                  {...chartAxisProps}
                  domain={yAxis.domain}
                  tickFormatter={(value: number) => formatCompact(value)}
                  ticks={yAxis.ticks}
                  width={chartValueAxisWidth}
                />
                <ReferenceArea
                  x1={current.date}
                  x2={end.date}
                  fill='var(--color-muted)'
                  fillOpacity={0.5}
                  ifOverflow='hidden'
                  label={{
                    ...chartReferenceLabel,
                    position: 'insideBottomRight',
                    value: 'Forecast',
                  }}
                />
                <ReferenceLine
                  x={now.getTime()}
                  stroke={forecastColors.marker}
                  strokeWidth={1}
                  label={{
                    fill: 'var(--color-foreground)',
                    fontSize: 11,
                    position: 'top',
                    value: 'Today',
                  }}
                />
                <Tooltip
                  content={(tooltipProps) => (
                    <ForecastTooltip
                      {...tooltipProps}
                      formatLabel={(label) => formatDate(Number(label))}
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
                  dot={chartLastDot(actuals.length, forecastColors.actual)}
                  fill={`url(#${gradientId})`}
                  fillOpacity={1}
                  name='Actual'
                  stroke={forecastColors.actual}
                  strokeLinecap='round'
                  strokeWidth={2}
                  type='monotone'
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        )}
        {!state && (
          <ChartPanelTable
            caption={`${title}: ${description} The forecast is a straight-line fit with a ${percent} range.`}
            columns={[
              { key: 'label', label: 'Week ending' },
              { format: formatter, key: 'actual', label: 'Actual' },
              { format: formatter, key: 'forecast', label: 'Forecast' },
              { format: formatter, key: 'low', label: `Low (${percent})` },
              { format: formatter, key: 'high', label: `High (${percent})` },
            ]}
            rows={rows.map((row, index) => {
              const isForecast = index > last
              return {
                actual: row.actual ?? '—',
                forecast: isForecast ? (row.forecast ?? '—') : '—',
                high: isForecast ? (row.high ?? '—') : '—',
                label: formatDate(row.date),
                low: isForecast ? (row.low ?? '—') : '—',
              }
            })}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Forecast1, exampleProps as forecast1ExampleProps, type Forecast1Props }
