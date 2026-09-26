'use client'

import { TinyBarChart } from '@/registry/components/dashboardblocks/chart'
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

interface DailyValue {
  label: string
  value: number
}

interface BarChartKPI1Props {
  /** What the change is measured against, e.g. "vs last week". */
  comparison: string
  /** One bar per period. The headline is their total. */
  data: DailyValue[]
  format?: KPIFormat
  /** @default 160 */
  height?: number
  /** The total for the previous period. */
  previous: number
  title: string
}

const exampleProps: BarChartKPI1Props = {
  comparison: 'vs last week',
  data: [
    { label: 'Mon', value: 3_200 },
    { label: 'Tue', value: 4_500 },
    { label: 'Wed', value: 2_800 },
    { label: 'Thu', value: 5_200 },
    { label: 'Fri', value: 6_100 },
    { label: 'Sat', value: 4_800 },
    { label: 'Sun', value: 5_700 },
  ],
  format: 'currency',
  previous: 30_050,
  title: 'Revenue this week',
}

const BarChartKPI1 = (props: BarChartKPI1Props) => {
  const { comparison, data, format, height = 160, previous, title } = props
  const total = data.reduce((sum, point) => sum + point.value, 0)

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
        <KPIChart label={describeSeries(`${title} by day`, data, format)}>
          <TinyBarChart
            bars={[{ dataKey: 'value', fill: 'var(--color-chart-1)' }]}
            data={data}
            formatter={getKPIFormatter(format)}
            height={height}
          />
        </KPIChart>
      </KPIContent>
    </KPI>
  )
}

export {
  BarChartKPI1,
  exampleProps as barChartKpi1ExampleProps,
  type BarChartKPI1Props,
  type DailyValue,
}
