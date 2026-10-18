'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  ChartTooltipContent,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { formatRate } from '@/registry/components/dashboardblocks/funnel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface FunnelSegment {
  color: string
  key: string
  label: string
}

interface ComparedStage {
  label: string
  values: Record<string, number>
}

interface Funnel4Props {
  description: string
  segments: FunnelSegment[]
  /** Leave out, or pass none, to show the empty state. */
  stages?: ComparedStage[]
  status?: BlockStatus
  title: string
}

const exampleProps: Funnel4Props = {
  description: 'Share of visitors reaching each step, by device.',
  segments: [
    { color: 'var(--color-chart-2)', key: 'desktop', label: 'Desktop' },
    { color: 'var(--color-chart-3)', key: 'mobile', label: 'Mobile' },
  ],
  stages: [
    { label: 'Viewed product', values: { desktop: 18_400, mobile: 26_900 } },
    { label: 'Added to cart', values: { desktop: 5_890, mobile: 6_190 } },
    { label: 'Started checkout', values: { desktop: 3_310, mobile: 2_690 } },
    { label: 'Purchased', values: { desktop: 2_020, mobile: 1_210 } },
  ],
  title: 'Conversion by device',
}

const GAP_COLOR = 'color-mix(in oklab, var(--color-chart-2) 12%, transparent)'

const Funnel4 = (props: Funnel4Props) => {
  const { description, segments, stages = [], status, title } = props
  const state = getBlockState(status, stages.length === 0)
  const first = stages[0]
  const rate = (stage: ComparedStage, key: string) => {
    const start = first?.values[key] ?? 0
    return start > 0 ? (stage.values[key] ?? 0) / start : 0
  }
  const rows = stages.map((stage) => {
    const rates = segments.map((segment) => rate(stage, segment.key))
    return {
      gap: rates.length > 1 ? [Math.min(...rates), Math.max(...rates)] : null,
      label: stage.label,
      ...Object.fromEntries(
        segments.map((segment, index) => [segment.key, rates[index]]),
      ),
    }
  })
  const lastStage = stages.at(-1)
  const lastIndex = stages.length - 1
  const topKey = lastStage
    ? segments.reduce<string | undefined>(
        (top, segment) =>
          top === undefined || rate(lastStage, segment.key) > rate(lastStage, top)
            ? segment.key
            : top,
        undefined,
      )
    : undefined

  return (
    <BlockStateProvider status={status} empty={stages.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {state === 'empty' || state === 'error' ? (
          <div className='border-t pt-4'>
            <KPIValue />
          </div>
        ) : (
          <dl className='flex flex-wrap items-end gap-x-10 gap-y-3 border-t pt-4'>
            {segments.map((segment) => (
              <div key={segment.key} className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>{segment.label}</dt>
                <dd>
                  <KPIValue
                    value={lastStage ? rate(lastStage, segment.key) : undefined}
                    format={(value) => formatRate(value)}
                  />
                </dd>
                <BlockReady className='text-xs'>
                  <dd className='text-muted-foreground text-xs tabular-nums'>
                    {formatNumber(lastStage?.values[segment.key] ?? 0)} of{' '}
                    {formatNumber(first?.values[segment.key] ?? 0)}
                  </dd>
                </BlockReady>
              </div>
            ))}
          </dl>
        )}
        <ChartPanelLegend
          items={[
            ...segments.map((segment) => ({
              color: segment.color,
              label: segment.label,
              shape: 'line' as const,
            })),
            ...(segments.length > 1 ? [{ color: GAP_COLOR, label: 'Gap' }] : []),
          ]}
        />
        <ChartPanelFigure className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              aria-label={`${title} chart`}
              data={rows}
              margin={{ top: 8, right: 96, bottom: 8, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={12}
              />
              <YAxis
                {...chartAxisProps}
                domain={[0, 1]}
                tickFormatter={(value: number) => formatRate(value, 0)}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                width={chartValueAxisWidth}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartTooltipContent
                    {...tooltipProps}
                    payload={tooltipProps.payload?.filter(
                      (item) => item.dataKey !== 'gap',
                    )}
                    valueFormatter={(value) => formatRate(value)}
                  />
                )}
                cursor={chartLineCursor}
              />
              {segments.length > 1 && (
                <Area
                  activeDot={false}
                  dataKey='gap'
                  fill={GAP_COLOR}
                  fillOpacity={1}
                  name='Gap'
                  stroke='none'
                  type='linear'
                />
              )}
              {segments.map((segment) => (
                <Line
                  key={segment.key}
                  activeDot={chartActiveDot}
                  dataKey={segment.key}
                  dot={{ fill: segment.color, r: 3, strokeWidth: 0 }}
                  name={segment.label}
                  stroke={segment.color}
                  strokeWidth={2}
                  type='linear'
                >
                  <LabelList
                    dataKey={segment.key}
                    content={({ index, value, x, y }) =>
                      index === lastIndex ? (
                        <text
                          x={Number(x) + 8}
                          y={Number(y) + (segment.key === topKey ? -7 : 7)}
                          dominantBaseline='middle'
                          fill='var(--color-foreground)'
                          fontSize={11}
                          fontWeight={500}
                        >
                          {segment.label} {formatRate(Number(value))}
                        </text>
                      ) : null
                    }
                  />
                </Line>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Stage' },
            ...segments.map((segment) => ({
              format: (value: number) => formatRate(value),
              key: segment.key,
              label: segment.label,
            })),
          ]}
          rows={rows}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Funnel4, exampleProps as funnel4ExampleProps, type Funnel4Props }
