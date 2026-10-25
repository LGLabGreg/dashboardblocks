'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  ChartTooltipFrame,
  ChartTooltipItem,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  type InsightDriver,
  InsightDrivers,
  InsightLabel,
  type InsightSegment,
  InsightText,
  insightKindConfig,
} from '@/registry/components/dashboardblocks/insights'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button, buttonVariants } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface Reading {
  high: number
  label: string
  low: number
  value: number
}

interface Insights2Props extends BlockStateProps {
  description: string
  drivers?: InsightDriver[]
  explanation: InsightSegment[]
  formatter?: (value: number) => string
  href?: string
  metric: string
  onMarkExpected?: () => void
  /** Leave out, or pass none, to show the empty state. */
  readings?: Reading[]
  title: string
}

const DAY = 86_400_000
const NOW = Date.UTC(2026, 8, 25)
const OUTAGE: Record<number, number> = { 24: 212, 25: 281 }

const exampleProps: Insights2Props = {
  description:
    'Daily checkout conversions over the last 28 days, against the range they usually fall in.',
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
      label: formatDate(date, 'day'),
      low: Math.round(expected * 0.92),
      value: OUTAGE[index] ?? Math.round(expected + Math.sin(index * 1.7) * 13),
    }
  }),
  title: 'Unusual drop in checkout conversions',
}

const SERIES_COLOR = 'var(--color-chart-2)'
const BAND_COLOR = 'var(--color-muted-foreground)'
const ANOMALY_COLOR = insightKindConfig.anomaly.fill

const formatChange = (value: number) =>
  formatSigned(value, (magnitude) => formatPercent(magnitude / 100))

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
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    href,
    metric,
    onMarkExpected,
    readings = [],
    errorMessage,
    status,
    title,
  } = props
  const [markedExpected, setMarkedExpected] = useState(false)
  const state = getBlockState(status, readings)

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
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {!state && (
            <InsightLabel
              className='mt-0.5'
              kind={markedExpected ? 'neutral' : 'anomaly'}
              label={markedExpected ? 'Expected' : undefined}
            />
          )}
        </header>
        {state && (
          <dl className='grid grid-cols-3 gap-4 border-t pt-4'>
            <div className='col-span-3 flex min-w-0 flex-col gap-1 @md:col-span-1'>
              <dt className='text-muted-foreground text-sm'>{metric}</dt>
              <dd>
                <KPIValue className='text-3xl @2xl:text-4xl' value={undefined} />
              </dd>
            </div>
            {state === 'loading' && (
              <>
                <div className='hidden min-w-0 flex-col gap-1 @md:flex'>
                  <dt className='text-muted-foreground text-sm'>Expected</dt>
                  <dd>
                    <KPIValue className='text-2xl' value={undefined} />
                  </dd>
                </div>
                <div className='hidden min-w-0 flex-col gap-1 @md:flex'>
                  <dt className='text-muted-foreground text-sm'>Difference</dt>
                  <dd>
                    <KPIValue className='text-2xl' value={undefined} />
                  </dd>
                </div>
              </>
            )}
          </dl>
        )}
        {!state && worst && (
          <dl className='grid grid-cols-3 gap-4 border-t pt-4'>
            <div className='flex min-w-0 flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>{worst.label}</dt>
              <dd className='text-3xl font-light tracking-tight whitespace-nowrap tabular-nums @2xl:text-4xl'>
                {formatter(worst.value)}
              </dd>
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Expected</dt>
              <dd className='text-2xl font-light tracking-tight whitespace-nowrap tabular-nums'>
                {formatter(worst.low)}–{formatter(worst.high)}
              </dd>
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Difference</dt>
              <dd
                className={cn(
                  'text-2xl font-light tracking-tight whitespace-nowrap tabular-nums',
                  worstChange < 0 && 'text-red-700 dark:text-red-400',
                )}
              >
                {formatChange(worstChange)}
              </dd>
            </div>
          </dl>
        )}
        <div className='flex flex-col gap-3'>
          {(!state || state === 'loading') && (
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
          )}
          {state ? (
            <ChartPlaceholder height={208} />
          ) : (
            <>
              <ChartPanelFigure className='h-52'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart
                    aria-label={`${title} chart`}
                    data={data}
                    margin={{ top: 20, right: 8, bottom: 0, left: 0 }}
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
                      width={chartValueAxisWidth}
                    />
                    {ranges.map((range) => (
                      <ReferenceArea
                        key={range.start}
                        fill={ANOMALY_COLOR}
                        fillOpacity={0.14}
                        ifOverflow='hidden'
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
                          <ChartTooltipFrame>
                            <span className='font-medium'>{point.label}</span>
                            <ChartTooltipItem
                              color={SERIES_COLOR}
                              name={metric}
                              value={formatter(point.value)}
                            />
                            <span className='text-muted-foreground tabular-nums'>
                              Expected {formatter(point.low)}–{formatter(point.high)}
                            </span>
                            {point.anomalous && (
                              <InsightLabel className='text-xs' kind='anomaly' />
                            )}
                          </ChartTooltipFrame>
                        )
                      }}
                      cursor={chartLineCursor}
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
                      activeDot={chartActiveDot}
                      dataKey='value'
                      dot={({ cx, cy, index, payload }) =>
                        (payload as (typeof data)[number]).anomalous ? (
                          <circle
                            key={index}
                            cx={cx}
                            cy={cy}
                            fill={ANOMALY_COLOR}
                            r={4.5}
                            stroke='var(--color-background)'
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
                    {worst && (
                      <ReferenceDot
                        x={worst.index}
                        y={worst.value}
                        r={0}
                        label={{
                          fill: 'var(--color-foreground)',
                          fontSize: 11,
                          fontWeight: 500,
                          position: worst.index > last * 0.75 ? 'left' : 'right',
                          value: `${formatChange(worstChange)} vs expected`,
                        }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartPanelFigure>
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
            </>
          )}
        </div>
        {(!state || state === 'loading') && (
          <div className='flex flex-col gap-3 border-t pt-4'>
            <BlockReady className='text-sm'>
              <InsightText segments={explanation} />
              {drivers && <InsightDrivers drivers={drivers} label='Likely causes' />}
            </BlockReady>
          </div>
        )}
        <div className='flex flex-wrap gap-2'>
          {href && !state && (
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
            disabled={markedExpected || state !== undefined}
            onClick={() => {
              setMarkedExpected(true)
              onMarkExpected?.()
            }}
          >
            {markedExpected ? 'Marked as expected' : 'Mark as expected'}
          </Button>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Insights2, exampleProps as insights2ExampleProps, type Insights2Props }
