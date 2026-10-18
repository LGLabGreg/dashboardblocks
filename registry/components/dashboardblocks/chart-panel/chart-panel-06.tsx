'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
  type ChartValueFormatter,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatCompact, formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Percentile {
  key: string
  label: string
}

interface ChartPanel6Props {
  /** Follows `previous` in the change sentence. @default 'the previous period' */
  comparison?: string
  /** Leave out, or pass none, to show the empty state. */
  data?: Array<Record<string, number | string> & { label: string }>
  description: string
  formatter?: ChartValueFormatter
  /** The percentile key shown as the headline number and checked against `limit`. */
  headline: string
  labelHeading?: string
  /** A target for the headline percentile, such as an SLO, drawn as a line. */
  limit?: { label: string; value: number }
  percentiles: Percentile[]
  /** The headline percentile's value at the start of the comparison. */
  previous?: number
  status?: BlockStatus
  title: string
}

const exampleProps: ChartPanel6Props = {
  data: Array.from({ length: 24 }, (_, hour) => {
    const load = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5
    const spike = hour === 14 ? 1.6 : 1
    return {
      label: `${String(hour).padStart(2, '0')}:00`,
      p50: Math.round(62 + load * 18),
      p95: Math.round((140 + load * 60) * (spike > 1 ? 1.25 : 1)),
      p99: Math.round((260 + load * 120) * spike),
    }
  }),
  comparison: 'this time yesterday',
  description: 'Response time percentiles for each hour of the last 24.',
  formatter: (value) => `${formatNumber(value)} ms`,
  headline: 'p95',
  limit: { label: 'SLO', value: 240 },
  percentiles: [
    { key: 'p50', label: 'p50' },
    { key: 'p95', label: 'p95' },
    { key: 'p99', label: 'p99' },
  ],
  previous: 151,
  title: 'API latency',
}

const rampColor = (index: number, count: number) => {
  const strength = count <= 1 ? 100 : Math.round(45 + (55 * index) / (count - 1))
  return `color-mix(in oklab, var(--color-chart-2) ${strength}%, var(--color-background))`
}

const ChartPanel6 = (props: ChartPanel6Props) => {
  const {
    comparison = 'the previous period',
    data = [],
    description,
    formatter = (value) => formatNumber(value),
    headline,
    labelHeading = 'Hour',
    limit,
    percentiles,
    previous,
    status,
    title,
  } = props
  const lastIndex = data.length - 1
  const headlineValue = Number(data[lastIndex]?.[headline] ?? 0)
  const over = limit
    ? data.filter((point) => Number(point[headline] ?? 0) > limit.value).length
    : 0

  return (
    <BlockStateProvider status={status} empty={data.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <p className='text-muted-foreground text-sm'>{headline} now</p>
            <KPIValue value={headlineValue} format={formatter} />
            <KPIChange
              comparison={comparison}
              format={formatter}
              goodDirection='down'
              previous={previous}
              value={headlineValue}
            />
            {limit && (
              <BlockReady className='text-sm'>
                <p className='text-muted-foreground text-sm'>
                  {over === 0
                    ? `Under the ${formatter(limit.value)} ${limit.label} all ${data.length} ${labelHeading.toLowerCase()}s.`
                    : `Over the ${formatter(limit.value)} ${limit.label} in ${over} of ${data.length} ${labelHeading.toLowerCase()}s.`}
                </p>
              </BlockReady>
            )}
          </div>
          <ChartPanelLegend
            items={percentiles.map((item, index) => ({
              color: rampColor(index, percentiles.length),
              label: item.label,
              shape: 'line',
            }))}
          />
        </div>
        <ChartPanelFigure className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              aria-label={`${title} chart`}
              data={data}
              margin={{ top: 8, right: 40, bottom: 0, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={40}
              />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(value: number) => formatCompact(value)}
                width={chartValueAxisWidth}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartTooltipContent {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={chartLineCursor}
                itemSorter={(item) =>
                  -percentiles.findIndex((percentile) => percentile.key === item.dataKey)
                }
              />
              {limit && (
                <ReferenceLine
                  {...chartReferenceProps}
                  y={limit.value}
                  label={{
                    ...chartReferenceLabel,
                    value: `${limit.label} ${formatter(limit.value)}`,
                    position: 'insideBottomLeft',
                    dy: -4,
                  }}
                />
              )}
              {percentiles.map((item, index) => (
                <Line
                  key={item.key}
                  activeDot={chartActiveDot}
                  dataKey={item.key}
                  dot={false}
                  name={item.label}
                  stroke={rampColor(index, percentiles.length)}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={item.key === headline ? 2.5 : 1.5}
                  type='monotone'
                >
                  <LabelList
                    dataKey={item.key}
                    content={({ index: pointIndex, x, y }) =>
                      pointIndex === lastIndex ? (
                        <text
                          x={Number(x) + 8}
                          y={Number(y)}
                          dominantBaseline='middle'
                          fontSize={11}
                          fontWeight={item.key === headline ? 500 : 400}
                          fill={
                            item.key === headline
                              ? 'var(--color-foreground)'
                              : 'var(--color-muted-foreground)'
                          }
                        >
                          {item.label}
                        </text>
                      ) : null
                    }
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}${limit ? ` ${limit.label}: ${formatter(limit.value)}.` : ''}`}
          columns={[
            { key: 'label', label: labelHeading },
            ...percentiles.map((item) => ({
              format: formatter,
              key: item.key,
              label: item.label,
            })),
          ]}
          rows={data}
        />
      </section>
    </BlockStateProvider>
  )
}

export { ChartPanel6, exampleProps as chartPanel6ExampleProps, type ChartPanel6Props }
