'use client'

import {
  ChartPanelFigure,
  ChartPanelTable,
  chartAxisProps,
  chartGridProps,
  formatCompact,
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Forecast1Props {
  /** Values so far, oldest first, one step apart. */
  actuals: number[]
  description: string
  formatter?: (value: number) => string
  /** Steps to forecast after the last actual. */
  horizon: number
  /** The date of the last actual. */
  lastDate: Date
  /** @default 0.8 */
  level?: ConfidenceLevel
  /** Where the today marker goes. */
  now: Date
  /** Days between values. @default 7 */
  stepDays?: number
  title: string
}

const exampleProps: Forecast1Props = {
  actuals: Array.from({ length: 20 }, (_, week) =>
    Math.round(
      18_400 + week * 240 + Math.sin(week / 1.6) * 380 - (week % 5 === 2 ? 260 : 0),
    ),
  ),
  description: 'Weekly active users, with a forecast for the rest of the year',
  formatter: (value) => Math.round(value).toLocaleString('en-US'),
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
    actuals,
    description,
    formatter = (value) => Math.round(value).toLocaleString(),
    horizon,
    lastDate,
    level = 0.8,
    now,
    stepDays = 7,
    title,
  } = props

  const { fit, rows: forecastRows } = buildForecast(actuals, horizon, level)
  const last = actuals.length - 1
  const rows = forecastRows.map((row, index) => ({
    ...row,
    date: lastDate.getTime() + (index - last) * stepDays * DAY,
  }))
  const current = rows[last]
  const end = rows[rows.length - 1]
  const percent = `${level * 100}%`
  const ticks = rows.filter((_, index) => (rows.length - 1 - index) % 4 === 0)
  const yAxis = getForecastAxis(rows.flatMap((row) => [row.actual, row.low, row.high]))

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              Latest, {formatDate(current.date)}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {formatter(current.actual ?? 0)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              Forecast, {formatDate(end.date)}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {formatter(end.forecast ?? 0)}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {percent} range {formatter(end.low ?? 0)}–{formatter(end.high ?? 0)}
            </dd>
          </div>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Trend</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {fit.slope >= 0 ? '+' : '−'}
              {formatter(Math.abs(fit.slope))}
              <span className='text-muted-foreground ml-1 text-sm font-normal tracking-normal'>
                per {stepDays === 7 ? 'week' : `${stepDays} days`}
              </span>
            </dd>
          </div>
        </dl>
        <ForecastLegend
          items={[
            { label: 'Actual', shape: 'line' },
            { label: 'Forecast', shape: 'dashed' },
            { label: `${percent} range`, shape: 'band' },
            { label: 'Today', shape: 'marker' },
          ]}
        />
        <ChartPanelFigure className='h-60'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={rows}
              margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
            >
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
                width={40}
              />
              <ReferenceArea
                x1={current.date}
                x2={end.date}
                fill='var(--color-muted)'
                fillOpacity={0.5}
                ifOverflow='hidden'
                label={{
                  fill: 'var(--color-muted-foreground)',
                  fontSize: 11,
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
                cursor={{ stroke: 'var(--color-border)' }}
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
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='forecast'
                dot={false}
                name='Forecast'
                stroke={forecastColors.forecast}
                strokeDasharray={forecastDash.forecast}
                strokeWidth={2}
                type='linear'
              />
              <Line
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='actual'
                dot={false}
                name='Actual'
                stroke={forecastColors.actual}
                strokeLinecap='round'
                strokeWidth={2}
                type='monotone'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. The forecast is a straight-line fit with a ${percent} range.`}
          columns={[
            { key: 'label', label: 'Week ending' },
            { format: formatter, key: 'actual', label: 'Actual' },
            { format: formatter, key: 'forecast', label: 'Forecast' },
            { format: formatter, key: 'low', label: `Low (${percent})` },
            { format: formatter, key: 'high', label: `High (${percent})` },
          ]}
          rows={rows.map((row, index) => {
            // The last actual is where the forecast starts, not a forecast itself.
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
      </CardContent>
    </Card>
  )
}

export { Forecast1, exampleProps as forecast1ExampleProps, type Forecast1Props }
