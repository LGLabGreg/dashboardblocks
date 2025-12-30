'use client'

import {
  RechartsTooltipFormatter,
  TinyAreaChart,
} from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import { AreaProps } from 'recharts'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface AreaChartKPI1Props {
  trend: number
  data: unknown[]
  formatter?: RechartsTooltipFormatter
  height: number
  areas: AreaProps[]
  title: string
  value: number
}

const exampleProps: AreaChartKPI1Props = {
  trend: 3.7,
  data: [
    {
      label: 'Monday',
      revenue: 4200,
      profit: 1200,
    },
    {
      label: 'Tuesday',
      revenue: 5100,
      profit: 1500,
    },
    {
      label: 'Wednesday',
      revenue: 2800,
      profit: 800,
    },
    {
      label: 'Thursday',
      revenue: 5600,
      profit: 1600,
    },
    {
      label: 'Friday',
      revenue: 6300,
      profit: 1800,
    },
    {
      label: 'Saturday',
      revenue: 5400,
      profit: 1400,
    },
    {
      label: 'Sunday',
      revenue: 6900,
      profit: 2000,
    },
  ],
  formatter: (value) => `$${Number(value).toLocaleString()}`,
  height: 120,
  areas: [
    {
      dataKey: 'revenue',
      fill: 'var(--color-chart-1)',
      stroke: 'var(--color-chart-1)',
    },
    {
      dataKey: 'profit',
      fill: 'var(--color-chart-2)',
      stroke: 'var(--color-chart-2)',
    },
  ],
  title: 'Profit Margin',
  value: 42.3,
}

const AreaChartKPI1 = (props: AreaChartKPI1Props) => {
  const { trend, data, formatter, height, areas, title, value } = props
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <Trend trend={trend} variant='badge' />
          </div>
          <KPIValue
            value={value}
            formatter={(value) => `${value.toLocaleString()}%`}
            animated
          />
        </div>
        <TinyAreaChart data={data} areas={areas} formatter={formatter} height={height} />
      </CardContent>
    </Card>
  )
}

export {
  AreaChartKPI1,
  exampleProps as areaChartKpi1ExampleProps,
  type AreaChartKPI1Props,
}
