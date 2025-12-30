'use client'

import { TinyBarChart, ValueFormatter } from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import type { Props as BarProps } from 'recharts/types/cartesian/Bar'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface BarChartKPI2Props {
  bars: BarProps[]
  trend: number
  data: unknown[]
  formatter?: ValueFormatter
  height: number
  title: string
  value: number
}

const exampleProps: BarChartKPI2Props = {
  bars: [
    {
      dataKey: 'value',
      fill: 'var(--color-chart-1)',
    },
    {
      dataKey: 'goal',
      fill: 'var(--color-chart-2)',
    },
  ],
  trend: 7.5,
  data: [
    {
      label: 'Monday',
      value: 3200,
      goal: 3800,
    },
    {
      label: 'Tuesday',
      value: 4500,
      goal: 4200,
    },
    {
      label: 'Wednesday',
      value: 2800,
      goal: 3400,
    },
    {
      label: 'Thursday',
      value: 5200,
      goal: 4800,
    },
    {
      label: 'Friday',
      value: 6100,
      goal: 6400,
    },
    {
      label: 'Saturday',
      value: 4800,
      goal: 5200,
    },
    {
      label: 'Sunday',
      value: 5700,
      goal: 6000,
    },
  ],
  formatter: (value) => `$${value.toLocaleString()}`,
  height: 160,
  title: 'Revenue',
  value: 87500,
}

const BarChartKPI2 = (props: BarChartKPI2Props) => {
  const { bars, trend, data, formatter, height, title, value } = props
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <Trend trend={trend} variant='badge' />
          </div>
          <KPIValue value={value} formatter={formatter} animated />
        </div>
        <TinyBarChart data={data} bars={bars} formatter={formatter} height={height} />
      </CardContent>
    </Card>
  )
}

export { BarChartKPI2, exampleProps as barChartKPI2ExampleProps, type BarChartKPI2Props }
