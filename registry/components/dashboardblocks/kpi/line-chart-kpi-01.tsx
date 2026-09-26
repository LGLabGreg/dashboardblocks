'use client'

import { TinyLineChart } from '@/registry/components/dashboardblocks/chart'
import {
  KPI,
  KPIChange,
  KPIChart,
  KPIContent,
  type KPIFormat,
  KPIValue,
  describeSeries,
  getKPIFormatter,
} from '@/registry/components/dashboardblocks/kpi'

import { CardDescription } from '@/components/ui/card'

interface DailyComparison {
  label: string
  /** The same day in the previous period. */
  previous: number
  value: number
}

interface LineChartKPI1Props {
  /** What the change is measured against, e.g. "vs last week". */
  comparison: string
  /** One point per period. The headline is their total. */
  data: DailyComparison[]
  format?: KPIFormat
  /** @default 120 */
  height?: number
  title: string
}

const exampleProps: LineChartKPI1Props = {
  comparison: 'vs last week',
  data: [
    { label: 'Mon', previous: 6_100, value: 6_420 },
    { label: 'Tue', previous: 6_650, value: 7_180 },
    { label: 'Wed', previous: 6_020, value: 5_890 },
    { label: 'Thu', previous: 6_900, value: 7_560 },
    { label: 'Fri', previous: 7_240, value: 8_030 },
    { label: 'Sat', previous: 5_310, value: 5_720 },
    { label: 'Sun', previous: 4_880, value: 5_430 },
  ],
  format: 'compact',
  title: 'Visitors',
}

const LineChartKPI1 = (props: LineChartKPI1Props) => {
  const { comparison, data, format, height = 120, title } = props
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const previous = data.reduce((sum, point) => sum + point.previous, 0)

  return (
    <KPI>
      <KPIContent className='gap-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center justify-between gap-2'>
            <CardDescription>{title}</CardDescription>
            <KPIChange comparison={comparison} previous={previous} value={total} />
          </div>
          <KPIValue value={total} format={format} animated />
        </div>
        <div className='flex flex-col gap-2'>
          <KPIChart label={describeSeries(`${title} by day`, data, format)}>
            <TinyLineChart
              data={data}
              formatter={getKPIFormatter(format)}
              height={height}
              lines={[
                {
                  dataKey: 'previous',
                  dot: false,
                  name: 'Previous',
                  stroke: 'var(--color-muted-foreground)',
                  strokeDasharray: '4 4',
                  strokeOpacity: 0.6,
                },
                {
                  dataKey: 'value',
                  dot: false,
                  name: 'Current',
                  stroke: 'var(--color-chart-1)',
                },
              ]}
            />
          </KPIChart>
          <div className='text-muted-foreground flex items-center gap-4 text-xs'>
            <span className='inline-flex items-center gap-1.5'>
              <span aria-hidden className='bg-chart-1 h-0.5 w-3 rounded-full' />
              This period
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <span
                aria-hidden
                className='border-muted-foreground w-3 border-t-2 border-dashed'
              />
              Previous
            </span>
          </div>
        </div>
      </KPIContent>
    </KPI>
  )
}

export {
  LineChartKPI1,
  exampleProps as lineChartKpi1ExampleProps,
  type DailyComparison,
  type LineChartKPI1Props,
}
