'use client'

import { TinyBarChart, ValueFormatter } from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import type { Props as BarProps } from 'recharts/types/cartesian/Bar'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface BarChartKPI1Props {
  bars: BarProps[]
  trend: number
  data: unknown[]
  formatter?: ValueFormatter
  height: number
  title: string
  value: number
}

const exampleProps: BarChartKPI1Props = {
  bars: [
    {
      dataKey: 'value',
      fill: 'var(--color-primary)',
    },
  ],
  trend: 7.5,
  data: [
    {
      label: 'Monday',
      value: 3200,
    },
    {
      label: 'Tuesday',
      value: 4500,
    },
    {
      label: 'Wednesday',
      value: 2800,
    },
    {
      label: 'Thursday',
      value: 5200,
    },
    {
      label: 'Friday',
      value: 6100,
    },
    {
      label: 'Saturday',
      value: 4800,
    },
    {
      label: 'Sunday',
      value: 5700,
    },
  ],
  formatter: (value) => `$${value.toLocaleString()}`,
  height: 160,
  title: 'Revenue',
  value: 87500,
}

const BarChartKPI1 = (props: BarChartKPI1Props) => {
  const { bars, trend, data, formatter, height, title, value } = props
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <Trend trend={trend} trendIcon='arrow' variant='badge' />
          </div>
          <KPIValue value={value} formatter={formatter} animated />
        </div>
        <TinyBarChart data={data} bars={bars} formatter={formatter} height={height} />
      </CardContent>
    </Card>
  )
}

export { BarChartKPI1, exampleProps as barChartKpi1ExampleProps, type BarChartKPI1Props }
