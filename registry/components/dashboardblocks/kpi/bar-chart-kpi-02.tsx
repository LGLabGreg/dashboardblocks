'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  ChartTooltipItem,
  chartAxisProps,
  chartBarCursor,
} from '@/registry/components/dashboardblocks/chart'
import {
  KPI,
  KPIChart,
  KPIContent,
  KPITitle,
  type KPIFormat,
  KPIValue,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { cn } from '@/lib/utils'

interface DailyGoal {
  goal: number
  label: string
  value: number
}

interface BarChartKPI2Props {
  /** Leave out, or pass no days, to show the empty state. */
  data?: DailyGoal[]
  format?: KPIFormat
  /** @default 144 */
  height?: number
  status?: BlockStatus
  title: string
}

const exampleProps: BarChartKPI2Props = {
  data: [
    { goal: 3_800, label: 'Mon', value: 3_200 },
    { goal: 4_200, label: 'Tue', value: 4_500 },
    { goal: 3_400, label: 'Wed', value: 2_800 },
    { goal: 4_800, label: 'Thu', value: 5_200 },
    { goal: 6_400, label: 'Fri', value: 6_100 },
    { goal: 5_200, label: 'Sat', value: 4_800 },
    { goal: 6_000, label: 'Sun', value: 5_700 },
  ],
  format: 'currency',
  title: 'Revenue vs goal',
}

const MISSED_COLOR = 'color-mix(in oklab, var(--color-chart-2) 30%, transparent)'

function BarWithGoal({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
}: {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: DailyGoal
}) {
  if (!payload) return null
  const met = payload.value >= payload.goal
  const base = y + height
  const goalY = payload.value > 0 ? base - (height * payload.goal) / payload.value : base
  const radius = Math.min(4, width / 2, height)

  return (
    <g>
      <path
        d={`M${x},${base}V${y + radius}a${radius},${radius} 0 0 1 ${radius},${-radius}H${x + width - radius}a${radius},${radius} 0 0 1 ${radius},${radius}V${base}Z`}
        fill={met ? 'var(--color-chart-2)' : MISSED_COLOR}
      />
      <rect
        x={x - 3}
        y={goalY - 1}
        width={width + 6}
        height={2}
        rx={1}
        fill='var(--color-foreground)'
      />
    </g>
  )
}

const BarChartKPI2 = (props: BarChartKPI2Props) => {
  const { data = [], format, height = 144, status, title } = props
  const state = getBlockState(status, data)
  const formatter = getKPIFormatter(format)
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const goal = data.reduce((sum, point) => sum + point.goal, 0)
  const share = goal > 0 ? total / goal : 0
  const daysMet = data.filter((point) => point.value >= point.goal).length

  return (
    <BlockStateProvider state={state}>
      <KPI>
        <KPIContent className='gap-3'>
          <div className='flex flex-col gap-1'>
            <KPITitle>{title}</KPITitle>
            <KPIValue value={total} format={format} animated />
            {state === 'loading' ? (
              <BlockStateText className='text-sm' />
            ) : state ? null : (
              <p className='text-muted-foreground text-sm'>
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    share >= 1
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-orange-700 dark:text-orange-400',
                  )}
                >
                  {formatPercent(share, { maximumFractionDigits: 0 })} of goal
                </span>{' '}
                of <span className='tabular-nums'>{formatter(goal)}</span>
              </p>
            )}
          </div>
          <KPIChart
            label={`${title} by day: ${data
              .map(
                (point) =>
                  `${point.label} ${formatter(point.value)} of ${formatter(point.goal)}`,
              )
              .join(', ')}`}
          >
            {state ? (
              <ChartPlaceholder height={height} />
            ) : (
              <div className='w-full' style={{ height }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    accessibilityLayer={false}
                    data={data}
                    barCategoryGap='28%'
                    margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
                  >
                    <XAxis
                      {...chartAxisProps}
                      dataKey='label'
                      tickFormatter={(value: string) => String(value).charAt(0)}
                      interval={0}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        const point = payload?.[0]?.payload as DailyGoal | undefined
                        if (!active || !point) return null
                        return (
                          <ChartTooltipFrame>
                            <span className='font-medium'>{point.label}</span>
                            <ChartTooltipItem
                              color={
                                point.value >= point.goal
                                  ? 'var(--color-chart-2)'
                                  : MISSED_COLOR
                              }
                              name='Actual'
                              value={formatter(point.value)}
                            />
                            <ChartTooltipItem
                              color='var(--color-foreground)'
                              name='Goal'
                              value={formatter(point.goal)}
                            />
                          </ChartTooltipFrame>
                        )
                      }}
                      cursor={chartBarCursor}
                    />
                    <YAxis
                      hide
                      domain={[
                        0,
                        Math.max(
                          ...data.map((point) => Math.max(point.value, point.goal)),
                        ),
                      ]}
                    />
                    <Bar dataKey='value' name='Actual' shape={BarWithGoal} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </KPIChart>
          <BlockReady className='text-xs'>
            <p className='text-muted-foreground text-xs'>
              Met the goal on {daysMet} of {data.length} days. Solid bars met it; the line
              on each bar is that day&apos;s goal.
            </p>
          </BlockReady>
        </KPIContent>
      </KPI>
    </BlockStateProvider>
  )
}

export {
  BarChartKPI2,
  exampleProps as barChartKpi2ExampleProps,
  type BarChartKPI2Props,
  type DailyGoal,
}
