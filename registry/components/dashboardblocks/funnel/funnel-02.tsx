'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartAxisProps,
  chartBarCursor,
  chartFadedColor,
  chartGridProps,
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
  FUNNEL_COLOR,
  type FunnelStage,
  formatRate,
  getBiggestDropIndex,
  getFunnelSteps,
} from '@/registry/components/dashboardblocks/funnel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Funnel2Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  stages?: FunnelStage[]
  status?: BlockStatus
  title: string
}

const exampleProps: Funnel2Props = {
  description: 'Sessions that reached each checkout step, last 7 days.',
  stages: [
    { label: 'Cart', value: 12_480 },
    { label: 'Shipping', value: 7_730 },
    { label: 'Payment', value: 5_910 },
    { label: 'Review', value: 5_120 },
    { label: 'Purchase', value: 4_380 },
  ],
  title: 'Checkout funnel',
}

const DROPPED_COLOR = chartFadedColor(FUNNEL_COLOR)

const Funnel2 = (props: Funnel2Props) => {
  const { description, stages = [], status, title } = props
  const state = getBlockState(status, stages.length === 0)
  const steps = getFunnelSteps(stages)
  const first = steps[0]
  const last = steps.at(-1)
  const biggestDrop = steps[getBiggestDropIndex(steps)]
  const previousOfBiggest = steps[getBiggestDropIndex(steps) - 1]
  const rows = steps.map((step, index) => ({
    ...step,
    lost: index === 0 ? 0 : steps[index - 1].fromStart - step.fromStart,
    reached: step.fromStart,
  }))

  return (
    <BlockStateProvider status={status} empty={stages.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='flex flex-wrap items-end gap-x-10 gap-y-3 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground text-sm'>
              {first && last ? `${first.label} to ${last.label}` : 'Overall'}
            </dt>
            <dd>
              <KPIValue value={last?.fromStart} format={(value) => formatRate(value)} />
            </dd>
          </div>
          {(state === 'loading' || (!state && biggestDrop && previousOfBiggest)) && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Biggest drop</dt>
              <dd>
                <KPIValue
                  className='text-2xl'
                  value={biggestDrop ? 1 - biggestDrop.fromPrevious : undefined}
                  format={(value) => formatRate(value, 0)}
                />
              </dd>
              <BlockReady className='text-xs'>
                <dd className='text-muted-foreground text-xs'>
                  left between {previousOfBiggest?.label} and {biggestDrop?.label}
                </dd>
              </BlockReady>
            </div>
          )}
        </dl>
        <ChartPanelLegend
          items={[
            { color: FUNNEL_COLOR, label: 'Reached the step' },
            { color: DROPPED_COLOR, label: 'Left at the step' },
          ]}
        />
        <ChartPanelFigure className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              aria-label={`${title} chart`}
              data={rows}
              margin={{ top: 20, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis {...chartAxisProps} dataKey='label' interval={0} />
              <YAxis
                {...chartAxisProps}
                domain={[0, 1]}
                tickFormatter={(value: number) => formatRate(value, 0)}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                width={chartValueAxisWidth}
              />
              <Tooltip
                content={({ active, payload }) => {
                  const row = payload?.[0]?.payload as (typeof rows)[number] | undefined
                  if (!active || !row) return null
                  return (
                    <ChartTooltipFrame>
                      <span className='font-medium'>{row.label}</span>
                      <ChartTooltipItem
                        color={FUNNEL_COLOR}
                        name='Reached'
                        value={formatNumber(row.value)}
                      />
                      {row.dropped > 0 && (
                        <ChartTooltipItem
                          color={DROPPED_COLOR}
                          name='Left'
                          value={formatNumber(row.dropped)}
                        />
                      )}
                    </ChartTooltipFrame>
                  )
                }}
                cursor={chartBarCursor}
              />
              <Bar dataKey='reached' fill={FUNNEL_COLOR} maxBarSize={56} stackId='funnel'>
                <LabelList
                  dataKey='reached'
                  content={({ x, y, width, index }) => {
                    const row = index === undefined ? undefined : rows[index]
                    if (!row) return null
                    return (
                      <text
                        x={Number(x) + Number(width) / 2}
                        y={Number(y) - 6}
                        textAnchor='middle'
                        fontSize={11}
                        fontWeight={500}
                        fill='var(--color-foreground)'
                      >
                        {formatRate(row.fromStart, 0)}
                      </text>
                    )
                  }}
                />
              </Bar>
              <Bar
                dataKey='lost'
                fill={DROPPED_COLOR}
                maxBarSize={56}
                radius={[4, 4, 0, 0]}
                stackId='funnel'
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Step' },
            { key: 'value', label: 'Sessions' },
            { key: 'share', label: 'Share of first step' },
            { key: 'left', label: 'Left at this step' },
          ]}
          rows={steps.map((step) => ({
            label: step.label,
            left: formatNumber(step.dropped),
            share: formatRate(step.fromStart),
            value: formatNumber(step.value),
          }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Funnel2, exampleProps as funnel2ExampleProps, type Funnel2Props }
