'use client'

import { TinyBarChart } from '@/registry/components/dashboardblocks/chart'
import {
  KPI,
  KPIChart,
  KPIContent,
  type KPIFormat,
  KPIValue,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'

import { CardDescription } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface DailyGoal {
  goal: number
  label: string
  value: number
}

interface BarChartKPI2Props {
  /** One pair of bars per period: the actual value and its goal. */
  data: DailyGoal[]
  format?: KPIFormat
  /** @default 160 */
  height?: number
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

const series = [
  { color: 'var(--color-chart-1)', key: 'value', label: 'Actual' },
  { color: 'var(--color-chart-2)', key: 'goal', label: 'Goal' },
] as const

const BarChartKPI2 = (props: BarChartKPI2Props) => {
  const { data, format, height = 160, title } = props
  const formatter = getKPIFormatter(format)
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const goal = data.reduce((sum, point) => sum + point.goal, 0)
  const share = goal > 0 ? Math.round((total / goal) * 100) : 0
  const daysMet = data.filter((point) => point.value >= point.goal).length

  return (
    <KPI>
      <KPIContent className='gap-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center justify-between gap-2'>
            <CardDescription>{title}</CardDescription>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                share >= 100
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
              )}
            >
              {share}% of goal
            </span>
          </div>
          <KPIValue value={total} format={format} animated />
          <p className='text-muted-foreground text-xs'>
            Goal {formatter(goal)} · met on {daysMet} of {data.length} days
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <KPIChart
            label={`${title} by day: ${data
              .map(
                (point) =>
                  `${point.label} ${formatter(point.value)} of ${formatter(point.goal)}`,
              )
              .join(', ')}`}
          >
            <TinyBarChart
              bars={series.map((item) => ({
                dataKey: item.key,
                fill: item.color,
                name: item.label,
              }))}
              data={data}
              formatter={formatter}
              height={height}
            />
          </KPIChart>
          <div className='text-muted-foreground flex items-center gap-4 text-xs'>
            {series.map((item) => (
              <span key={item.key} className='inline-flex items-center gap-1.5'>
                <span
                  aria-hidden
                  className='size-2.5 rounded-[2px]'
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </KPIContent>
    </KPI>
  )
}

export {
  BarChartKPI2,
  exampleProps as barChartKpi2ExampleProps,
  type BarChartKPI2Props,
  type DailyGoal,
}
