'use client'

import {
  RechartsTooltipFormatter,
  TinyLineChart,
} from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import { LineProps } from 'recharts'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface LineChartKPI1Props {
  trend: number
  data: unknown[]
  formatter?: RechartsTooltipFormatter
  height: number
  lines: LineProps[]
  title: string
  value: number
}

const exampleProps: LineChartKPI1Props = {
  trend: 4.2,
  data: [
    {
      label: 'Monday',
      value: 4200,
    },
    {
      label: 'Tuesday',
      value: 5100,
    },
    {
      label: 'Wednesday',
      value: 2800,
    },
    {
      label: 'Thursday',
      value: 5600,
    },
    {
      label: 'Friday',
      value: 6300,
    },
    {
      label: 'Saturday',
      value: 5400,
    },
    {
      label: 'Sunday',
      value: 6900,
    },
  ],
  formatter: (value) => {
    const num = Number(value)
    const k = num / 1000
    return `${k.toFixed(1)}k visits`
  },
  height: 120,
  lines: [
    {
      dataKey: 'value',
      stroke: 'var(--color-primary)',
    },
  ],
  title: 'Daily visitors',
  value: 48230,
}

const LineChartKPI1 = (props: LineChartKPI1Props) => {
  const { trend, data, formatter, height, lines, title, value } = props
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <Trend trend={trend} variant='badge' />
          </div>
          <KPIValue value={value} animated />
        </div>
        <TinyLineChart data={data} lines={lines} formatter={formatter} height={height} />
      </CardContent>
    </Card>
  )
}

export {
  LineChartKPI1,
  exampleProps as lineChartKpi1ExampleProps,
  type LineChartKPI1Props,
}
