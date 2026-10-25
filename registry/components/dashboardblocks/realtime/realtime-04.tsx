'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipContent,
  chartAxisProps,
  chartBarCursor,
  ChartHatch,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  LiveBadge,
  LiveNumber,
  createRandom,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  StatValue,
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import { formatCurrency, formatNumber } from '@/registry/lib/dashboardblocks/format'
import { useRef, useState } from 'react'
import {
  Bar,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

interface TodayMetric {
  format?: (value: number) => string
  id: string
  label: string
  today: number
  yesterday: number
}

interface Realtime4Props extends BlockStateProps {
  /** Defaults to a sentence about the first metric against yesterday. */
  description?: string
  /** Orders (or any count) per hour so far today, from midnight; the last hour is still counting. */
  hourly?: number[]
  hourlyLabel?: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: TodayMetric[]
  simulate?: boolean
  title: string
  /** The same count for each of yesterday's 24 hours, drawn as a dashed line. */
  yesterdayHourly?: number[]
}

const seed = createRandom(3)
const HOURLY = [12, 7, 4, 3, 4, 9, 22, 41, 63, 78, 86, 91, 88, 84, 57]
const YESTERDAY = [
  14, 8, 5, 3, 3, 8, 19, 36, 55, 70, 79, 83, 81, 77, 74, 72, 70, 66, 61, 54, 47, 38, 29,
  20,
]
const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => {
  const suffix = hour < 12 ? 'am' : 'pm'
  return `${hour % 12 === 0 ? 12 : hour % 12}${suffix}`
})
const HOUR_TICKS = [6, 12, 18]

const exampleProps: Realtime4Props = {
  hourly: HOURLY.map((value) => Math.round(value * (0.9 + seed() * 0.2))),
  hourlyLabel: 'Orders',
  metrics: [
    { id: 'orders', label: 'Orders', today: 647, yesterday: 588 },
    {
      format: (value) => formatCurrency(value, { compact: true }),
      id: 'revenue',
      label: 'Revenue',
      today: 48_215,
      yesterday: 49_870,
    },
    { id: 'signups', label: 'Sign-ups', today: 132, yesterday: 104 },
  ],
  simulate: true,
  title: 'Today so far',
  yesterdayHourly: YESTERDAY.map((value) => Math.round(value * (0.9 + seed() * 0.2))),
}

const CHART_HEIGHT = 128
const noMetrics: TodayMetric[] = []
const noHours: number[] = []

const Realtime4 = (props: Realtime4Props) => {
  const {
    hourly: loadedHourly = noHours,
    hourlyLabel = 'Orders',
    metrics: loadedMetrics = noMetrics,
    simulate = false,
    errorMessage,
    status,
    title,
    yesterdayHourly,
  } = props
  const id = useChartId()
  const [metrics, setMetrics] = useState(loadedMetrics)
  const [hourly, setHourly] = useState(loadedHourly)
  const [loaded, setLoaded] = useState({ hourly: loadedHourly, metrics: loadedMetrics })
  if (loaded.hourly !== loadedHourly || loaded.metrics !== loadedMetrics) {
    setLoaded({ hourly: loadedHourly, metrics: loadedMetrics })
    setMetrics(loadedMetrics)
    setHourly(loadedHourly)
  }
  const random = useRef(createRandom(21))
  const state = getBlockState(status, metrics)
  const shown: TodayMetric[] =
    status === 'loading'
      ? getStatPlaceholders(3).map((placeholder) => ({
          id: placeholder.key,
          label: placeholder.label,
          today: 0,
          yesterday: 0,
        }))
      : metrics

  useInterval(
    () => {
      const next = random.current
      const orders = next() > 0.35 ? 1 + Math.floor(next() * 3) : 0
      setMetrics((list) =>
        list.map((metric) => {
          const bump =
            metric.id === 'orders'
              ? orders
              : metric.id === 'revenue'
                ? orders * (40 + next() * 80)
                : next() > 0.8
                  ? 1
                  : 0
          return {
            ...metric,
            today: metric.today + bump,
            yesterday: metric.yesterday + bump * (0.85 + next() * 0.2),
          }
        }),
      )
      if (orders) {
        setHourly((values) => [
          ...values.slice(0, -1),
          (values[values.length - 1] ?? 0) + orders,
        ])
      }
    },
    simulate && !state ? 2_000 : null,
  )

  const lead = metrics[0]
  const leadChange = lead && lead.yesterday > 0 ? lead.today / lead.yesterday - 1 : 0
  const {
    description = lead
      ? `${formatNumber(Math.round(lead.today))} ${lead.label.toLowerCase()} since midnight, ${Math.abs(Math.round(leadChange * 100))}% ${leadChange >= 0 ? 'ahead of' : 'behind'} yesterday at this time.`
      : 'Since midnight, against yesterday at the same time.',
  } = props
  const current = hourly.length - 1
  const data = HOUR_LABELS.map((label, hour) => ({
    label,
    today: hour < hourly.length ? hourly[hour] : undefined,
    yesterday: yesterdayHourly?.[hour],
  }))
  const formatCount = (value: number) =>
    Number.isFinite(value) ? formatNumber(value) : 'Not yet'

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          {!state && <LiveBadge />}
        </header>
        <StatGroup className='grid-cols-3 gap-x-4'>
          {shown.map((metric) => (
            <Stat key={metric.id}>
              <StatLabel className='truncate'>{metric.label}</StatLabel>
              <StatValue className='text-2xl @md:text-3xl'>
                <LiveNumber format={metric.format} value={metric.today} />
              </StatValue>
              <StatChange
                comparison='yesterday at this time'
                metric={{
                  formatter: (value) =>
                    metric.format
                      ? metric.format(value)
                      : formatNumber(Math.round(value)),
                  key: metric.id,
                  label: metric.label,
                  previous: metric.yesterday,
                  value: metric.today,
                }}
                variant='short'
              />
            </Stat>
          ))}
        </StatGroup>
        <div className='flex flex-col gap-1.5'>
          <span className='text-muted-foreground text-sm'>{hourlyLabel} per hour</span>
          {state && <ChartPlaceholder height={CHART_HEIGHT} />}
          {!state && (
            <div
              aria-hidden
              className='w-full tabular-nums'
              style={{ height: CHART_HEIGHT }}
            >
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart
                  accessibilityLayer={false}
                  data={data}
                  margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
                >
                  <defs>
                    <ChartHatch color='var(--color-chart-2)' id={`${id}-counting`} />
                  </defs>
                  <XAxis
                    {...chartAxisProps}
                    dataKey='label'
                    interval={0}
                    tickFormatter={(value: string, index: number) =>
                      HOUR_TICKS.includes(index) ? value : ''
                    }
                  />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <ChartTooltipContent
                        active={active}
                        label={label === undefined ? undefined : String(label)}
                        payload={payload}
                        valueFormatter={formatCount}
                      />
                    )}
                    cursor={chartBarCursor}
                  />
                  <Bar
                    dataKey='today'
                    fill='var(--color-chart-2)'
                    isAnimationActive={false}
                    name='Today'
                    radius={[2, 2, 0, 0]}
                  >
                    {data.map((_, hour) => (
                      <Cell
                        key={hour}
                        fill={
                          hour === current
                            ? `url(#${id}-counting)`
                            : 'var(--color-chart-2)'
                        }
                      />
                    ))}
                  </Bar>
                  {yesterdayHourly && (
                    <Line
                      dataKey='yesterday'
                      dot={false}
                      isAnimationActive={false}
                      name='Yesterday'
                      stroke='var(--color-muted-foreground)'
                      strokeDasharray='4 3'
                      strokeWidth={1.5}
                      type='monotone'
                    >
                      <LabelList
                        content={({ index, x, y }) =>
                          index === data.length - 1 ? (
                            <text
                              x={Number(x)}
                              y={Number(y) - 8}
                              textAnchor='end'
                              fontSize={12}
                              fill='var(--color-muted-foreground)'
                            >
                              Yesterday
                            </text>
                          ) : null
                        }
                        dataKey='yesterday'
                      />
                    </Line>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
          {!state && (
            <p className='sr-only'>
              {`${hourlyLabel} per hour today: ${hourly.join(', ')}. The current hour is still counting.`}
            </p>
          )}
          {state !== 'error' && state !== 'empty' && (
            <p className='text-muted-foreground text-xs'>
              The hatched bar is the hour still counting. Changes compare with yesterday
              up to the same time.
            </p>
          )}
        </div>
      </section>
    </BlockStateProvider>
  )
}

export {
  Realtime4,
  exampleProps as realtime4ExampleProps,
  type Realtime4Props,
  type TodayMetric,
}
