'use client'

import { TinyAreaChart } from '@/registry/components/dashboardblocks/chart'
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

import { CardDescription, CardTitle } from '@/components/ui/card'

interface DailyValue {
  label: string
  value: number
}

interface AreaChartKPI2Props {
  /** What the change is measured against, e.g. "vs last week". */
  comparison: string
  /** One point per period, drawn behind the value. The headline is their total. */
  data: DailyValue[]
  format?: KPIFormat
  /** @default 96 */
  height?: number
  /** The total for the previous period. */
  previous: number
  title: string
}

const exampleProps: AreaChartKPI2Props = {
  comparison: 'vs last week',
  data: [
    { label: 'Mon', value: 14_200 },
    { label: 'Tue', value: 17_100 },
    { label: 'Wed', value: 12_800 },
    { label: 'Thu', value: 19_600 },
    { label: 'Fri', value: 22_300 },
    { label: 'Sat', value: 18_400 },
    { label: 'Sun', value: 24_000 },
  ],
  format: 'currency',
  previous: 108_450,
  title: 'Transaction volume',
}

const AreaChartKPI2 = (props: AreaChartKPI2Props) => {
  const { comparison, data, format, height = 96, previous, title } = props
  const formatter = getKPIFormatter(format)
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const difference = total - previous

  return (
    <KPI className='relative overflow-hidden'>
      <KPIContent className='gap-12'>
        <div className='relative z-10 flex items-center justify-between gap-2'>
          <CardTitle>{title}</CardTitle>
          <KPIChange comparison={comparison} previous={previous} value={total} />
        </div>
        <div className='relative z-10 flex flex-col gap-1'>
          <KPIValue value={total} format={format} animated />
          <CardDescription>
            {difference >= 0 ? '+' : '−'}
            {formatter(Math.abs(difference))} {comparison}
          </CardDescription>
        </div>
        <KPIChart
          className='pointer-events-none absolute inset-x-0 bottom-0 opacity-50'
          label={describeSeries(`${title} by day`, data, format)}
        >
          <TinyAreaChart
            areas={[
              {
                dataKey: 'value',
                fill: 'var(--color-chart-2)',
                fillOpacity: 0.3,
                stroke: 'var(--color-chart-2)',
              },
            ]}
            data={data}
            formatter={formatter}
            height={height}
          />
        </KPIChart>
      </KPIContent>
    </KPI>
  )
}

export {
  AreaChartKPI2,
  exampleProps as areaChartKpi2ExampleProps,
  type AreaChartKPI2Props,
  type DailyValue,
}
