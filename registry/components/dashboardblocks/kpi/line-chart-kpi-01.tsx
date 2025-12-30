'use client'

import { TinyLineChart } from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import { LineProps } from 'recharts'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface LineChartKPI1Props {
  trend: number
  data: unknown[]
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
      displayValues: {
        value: '4.2k visits',
      },
    },
    {
      label: 'Tuesday',
      value: 5100,
      displayValues: {
        value: '5.1k visits',
      },
    },
    {
      label: 'Wednesday',
      value: 2800,
      displayValues: {
        value: '4.8k visits',
      },
    },
    {
      label: 'Thursday',
      value: 5600,
      displayValues: {
        value: '5.6k visits',
      },
    },
    {
      label: 'Friday',
      value: 6300,
      displayValues: {
        value: '6.3k visits',
      },
    },
    {
      label: 'Saturday',
      value: 5400,
      displayValues: {
        value: '5.4k visits',
      },
    },
    {
      label: 'Sunday',
      value: 6900,
      displayValues: {
        value: '4.9k visits',
      },
    },
  ],
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
  const { trend, data, height, lines, title, value } = props
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
        <TinyLineChart data={data} lines={lines} height={height} />
      </CardContent>
    </Card>
  )
}

export {
  LineChartKPI1,
  exampleProps as lineChartKpi1ExampleProps,
  type LineChartKPI1Props,
}
