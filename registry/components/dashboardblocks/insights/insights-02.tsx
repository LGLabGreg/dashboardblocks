'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  InsightBadge,
  type InsightDriver,
  InsightDrivers,
  type InsightSegment,
  InsightText,
  formatSigned,
  insightKindConfig,
} from '@/registry/components/dashboardblocks/insights'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/** One reading with the range it was expected to fall in. Outside the range counts as an anomaly. */
interface Reading {
  high: number
  label: string
  low: number
  value: number
}

interface Insights2Props {
  description: string
  drivers?: InsightDriver[]
  explanation: InsightSegment[]
  formatter?: (value: number) => string
  href?: string
  metric: string
  onMarkExpected?: () => void
  readings: Reading[]
  title: string
}

const DAY = 86_400_000
const NOW = Date.UTC(2026, 8, 25)
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
/** Conversions on the two days checkout payments failed. */
const OUTAGE: Record<number, number> = { 24: 212, 25: 281 }

const exampleProps: Insights2Props = {
  description: 'Daily checkout conversions, last 28 days',
  drivers: [
    { label: 'Card payment errors', tone: 'negative', value: '+4.2 pp' },
    { label: 'iOS app', tone: 'negative', value: '−51%' },
    { label: 'Sessions', value: '+1%' },
  ],
  explanation: [
    'Conversions fell to ',
    { text: '212', tone: 'negative' },
    ' on Tuesday and stayed low on Wednesday. Sessions and add-to-cart were ',
    { text: 'normal' },
    ', so the drop happened at payment, where card errors ',
    { text: 'rose 4.2 points', tone: 'negative' },
    '.',
  ],
  href: '#',
  metric: 'Conversions',
  readings: Array.from({ length: 28 }, (_, index) => {
    const date = new Date(NOW - (27 - index) * DAY)
    const weekend = date.getUTCDay() % 6 === 0
    const expected = (weekend ? 286 : 342) + index * 0.9
    return {
      high: Math.round(expected * 1.08),
      label: dayFormatter.format(date),
      low: Math.round(expected * 0.92),
      value: OUTAGE[index] ?? Math.round(expected + Math.sin(index * 1.7) * 13),
    }
  }),
  title: 'Unusual drop in checkout conversions',
}

const SERIES_COLOR = 'var(--chart-1)'
const BAND_COLOR = 'var(--color-muted-foreground)'
const ANOMALY_COLOR = insightKindConfig.anomaly.fill

/** Runs of consecutive anomalous readings, as index ranges. */
function getAnomalyRanges(anomalous: boolean[]) {
  const ranges: Array<{ end: number; start: number }> = []
  anomalous.forEach((isAnomalous, index) => {
    if (!isAnomalous) return
    const last = ranges[ranges.length - 1]
    if (last && last.end === index - 1) last.end = index
    else ranges.push({ end: index, start: index })
  })
  return ranges
}

const Insights2 = (props: Insights2Props) => {
  const {
    description,
    drivers,
    explanation,
    formatter = (value) => Math.round(value).toLocaleString('en-US'),
    href,
    metric,
    onMarkExpected,
    readings,
    title,
  } = props
  const [markedExpected, setMarkedExpected] = useState(false)

  const data = readings.map((reading, index) => {
    const anomalous = reading.value < reading.low || reading.value > reading.high
    return {
      ...reading,
      anomalous,
      band: [reading.low, reading.high],
      index,
      note: anomalous ? 'Anomaly' : '',
    }
  })
  const ranges = getAnomalyRanges(data.map((point) => point.anomalous))
  const anomalies = data.filter((point) => point.anomalous)
  const expectedOf = (point: Reading) => (point.low + point.high) / 2
  const deviation = (point: Reading) =>
    Math.abs(point.value - expectedOf(point)) / expectedOf(point)
  // The reading furthest from the middle of its expected range.
  const worst = anomalies.reduce<(typeof data)[number] | undefined>(
    (current, point) =>
      !current || deviation(point) > deviation(current) ? point : current,
    undefined,
  )
  const worstChange = worst
    ? Math.round(((worst.value - expectedOf(worst)) / expectedOf(worst)) * 100)
    : 0
  const yMax =
    Math.ceil(
      (Math.max(...data.map((point) => Math.max(point.value, point.high))) * 1.1) / 50,
    ) * 50
  const last = data.length - 1
  const ticks = data
    .filter((point) => (last - point.index) % 7 === 0)
    .map((point) => point.index)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <InsightBadge
            kind={markedExpected ? 'neutral' : 'anomaly'}
            label={markedExpected ? 'Expected' : undefined}
          />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <InsightText segments={explanation} />
        {worst && (
          <dl className='grid grid-cols-3 gap-4'>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>{worst.label}</dt>
              <dd className='text-lg font-semibold tracking-tight whitespace-nowrap tabular-nums @md:text-2xl'>
                {formatter(worst.value)}
              </dd>
            </div>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>Expected</dt>
              <dd className='text-lg font-semibold tracking-tight whitespace-nowrap tabular-nums @md:text-2xl'>
                {formatter(worst.low)}–{formatter(worst.high)}
              </dd>
            </div>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>Difference</dt>
              <dd className='text-lg font-semibold tracking-tight whitespace-nowrap tabular-nums @md:text-2xl'>
                {formatSigned(worstChange, (value) => `${value}%`)}
              </dd>
            </div>
          </dl>
        )}
        <div className='flex flex-col gap-3'>
          <ChartPanelFigure className='h-44'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis
                  {...chartAxisProps}
                  dataKey='index'
                  domain={[0, last]}
                  tickFormatter={(index: number) => data[index]?.label ?? ''}
                  ticks={ticks}
                  type='number'
                />
                <YAxis
                  {...chartAxisProps}
                  domain={[0, yMax]}
                  tickFormatter={(value: number) => formatter(value)}
                  width={40}
                />
                {ranges.map((range) => (
                  <ReferenceArea
                    key={range.start}
                    fill={ANOMALY_COLOR}
                    fillOpacity={0.16}
                    ifOverflow='hidden'
                    label={{
                      fill: 'var(--color-muted-foreground)',
                      fontSize: 11,
                      position: 'insideTop',
                      value: 'Anomaly',
                    }}
                    x1={range.start - 0.5}
                    x2={range.end + 0.5}
                  />
                ))}
                <Tooltip
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as
                      | (typeof data)[number]
                      | undefined
                    if (!active || !point) return null
                    return (
                      <div className='bg-popover text-popover-foreground grid min-w-36 gap-1.5 rounded-lg px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10'>
                        <span className='text-muted-foreground'>{point.label}</span>
                        <span className='flex items-center gap-2'>
                          <span
                            aria-hidden
                            className='h-0.5 w-3 rounded-full'
                            style={{ backgroundColor: SERIES_COLOR }}
                          />
                          <span className='font-medium tabular-nums'>
                            {formatter(point.value)}
                          </span>
                          <span className='text-muted-foreground ml-auto pl-3'>
                            {metric}
                          </span>
                        </span>
                        <span className='text-muted-foreground tabular-nums'>
                          Expected {formatter(point.low)}–{formatter(point.high)}
                        </span>
                        {point.anomalous && (
                          <span className={insightKindConfig.anomaly.text}>Anomaly</span>
                        )}
                      </div>
                    )
                  }}
                  cursor={{ stroke: 'var(--color-border)' }}
                />
                <Area
                  activeDot={false}
                  dataKey='band'
                  fill={BAND_COLOR}
                  fillOpacity={0.14}
                  name='Expected range'
                  stroke='none'
                  type='monotone'
                />
                <Line
                  activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                  dataKey='value'
                  dot={({ cx, cy, index, payload }) =>
                    (payload as (typeof data)[number]).anomalous ? (
                      <circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        fill={ANOMALY_COLOR}
                        r={4.5}
                        stroke='var(--color-card)'
                        strokeWidth={2}
                      />
                    ) : (
                      <g key={index} />
                    )
                  }
                  name={metric}
                  stroke={SERIES_COLOR}
                  strokeLinecap='round'
                  strokeWidth={2}
                  type='monotone'
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
          <ChartPanelLegend
            items={[
              { color: SERIES_COLOR, label: metric, shape: 'line' },
              {
                color:
                  'color-mix(in oklab, var(--color-muted-foreground) 30%, transparent)',
                label: 'Expected range',
              },
              { color: ANOMALY_COLOR, label: 'Anomaly' },
            ]}
          />
          <ChartPanelTable
            caption={`${metric} by day against the expected range. ${anomalies.length} ${anomalies.length === 1 ? 'day was' : 'days were'} outside it.`}
            columns={[
              { key: 'label', label: 'Day' },
              { format: formatter, key: 'value', label: metric },
              { format: formatter, key: 'low', label: 'Expected low' },
              { format: formatter, key: 'high', label: 'Expected high' },
              { key: 'note', label: 'Note' },
            ]}
            rows={data}
          />
        </div>
        {drivers && <InsightDrivers drivers={drivers} label='Likely causes' />}
      </CardContent>
      <CardFooter className='flex flex-wrap gap-2 border-t'>
        {href && (
          <a href={href} className={buttonVariants({ size: 'sm' })}>
            Investigate
            <IconPlaceholder
              lucide='ArrowRightIcon'
              tabler='IconArrowRight'
              hugeicons='ArrowRight01Icon'
              phosphor='ArrowRightIcon'
              remixicon='RiArrowRightLine'
              data-icon='inline-end'
            />
          </a>
        )}
        <Button
          variant='outline'
          size='sm'
          disabled={markedExpected}
          onClick={() => {
            setMarkedExpected(true)
            onMarkExpected?.()
          }}
        >
          {markedExpected ? 'Marked as expected' : 'Mark as expected'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export { Insights2, exampleProps as insights2ExampleProps, type Insights2Props }
