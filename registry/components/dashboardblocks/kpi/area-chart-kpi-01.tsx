'use client'

import { TinyAreaChart } from '@/registry/components/dashboardblocks/chart'
import {
  KPI,
  KPIChange,
  KPIChart,
  KPIContent,
  type KPIFormat,
  KPIValue,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'

import { CardDescription } from '@/components/ui/card'

interface DailyProfit {
  label: string
  profit: number
  revenue: number
}

interface AreaChartKPI1Props {
  /** What the change is measured against, e.g. "vs last week". */
  comparison: string
  data: DailyProfit[]
  format?: KPIFormat
  /** @default 120 */
  height?: number
  /** Total profit for the previous period. */
  previous: number
  title: string
}

const exampleProps: AreaChartKPI1Props = {
  comparison: 'vs last week',
  data: [
    { label: 'Mon', profit: 1_200, revenue: 4_200 },
    { label: 'Tue', profit: 1_500, revenue: 5_100 },
    { label: 'Wed', profit: 800, revenue: 2_800 },
    { label: 'Thu', profit: 1_600, revenue: 5_600 },
    { label: 'Fri', profit: 1_800, revenue: 6_300 },
    { label: 'Sat', profit: 1_400, revenue: 5_400 },
    { label: 'Sun', profit: 2_000, revenue: 6_900 },
  ],
  format: 'currency',
  previous: 9_550,
  title: 'Gross profit',
}

const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

const AreaChartKPI1 = (props: AreaChartKPI1Props) => {
  const { comparison, data, format, height = 120, previous, title } = props
  const formatter = getKPIFormatter(format)
  const profit = data.reduce((sum, point) => sum + point.profit, 0)
  const revenue = data.reduce((sum, point) => sum + point.revenue, 0)
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  return (
    <KPI>
      <KPIContent className='gap-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center justify-between gap-2'>
            <CardDescription>{title}</CardDescription>
            <KPIChange comparison={comparison} previous={previous} value={profit} />
          </div>
          <KPIValue value={profit} format={format} animated />
          <p className='text-muted-foreground text-xs'>
            <span className='text-foreground font-medium tabular-nums'>
              {percentFormatter.format(margin)}%
            </span>{' '}
            margin on {formatter(revenue)} revenue
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <KPIChart
            label={`Revenue and profit by day: ${data
              .map(
                (point) =>
                  `${point.label} ${formatter(point.revenue)} revenue, ${formatter(point.profit)} profit`,
              )
              .join('; ')}`}
          >
            <TinyAreaChart
              areas={[
                {
                  dataKey: 'revenue',
                  fill: 'var(--color-chart-1)',
                  fillOpacity: 0.2,
                  name: 'Revenue',
                  stroke: 'var(--color-chart-1)',
                },
                {
                  dataKey: 'profit',
                  fill: 'var(--color-chart-2)',
                  fillOpacity: 0.4,
                  name: 'Profit',
                  stroke: 'var(--color-chart-2)',
                },
              ]}
              data={data}
              formatter={formatter}
              height={height}
            />
          </KPIChart>
          <div className='text-muted-foreground flex items-center gap-4 text-xs'>
            <span className='inline-flex items-center gap-1.5'>
              <span aria-hidden className='bg-chart-1 size-2.5 rounded-[2px]' />
              Revenue
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <span aria-hidden className='bg-chart-2 size-2.5 rounded-[2px]' />
              Profit
            </span>
          </div>
        </div>
      </KPIContent>
    </KPI>
  )
}

export {
  AreaChartKPI1,
  exampleProps as areaChartKpi1ExampleProps,
  type AreaChartKPI1Props,
  type DailyProfit,
}
