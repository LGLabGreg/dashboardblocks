'use client'

import { TinyAreaChart } from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import { AreaProps } from 'recharts'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

interface AreaChartKPI2Props {
  trend: number
  data: unknown[]
  description: string
  height: number
  areas: AreaProps[]
  title: string
  value: number
}

const exampleProps: AreaChartKPI2Props = {
  trend: 18.4,
  data: [
    {
      label: 'Monday',
      value: 4200,
      displayValues: {
        value: '$4,200',
      },
    },
    {
      label: 'Tuesday',
      value: 5100,
      displayValues: {
        value: '$5,100',
      },
    },
    {
      label: 'Wednesday',
      value: 2800,
      displayValues: {
        value: '$4,800',
      },
    },
    {
      label: 'Thursday',
      value: 5600,
      displayValues: {
        value: '$5,600',
      },
    },
    {
      label: 'Friday',
      value: 6300,
      displayValues: {
        value: '$6,300',
      },
    },
    {
      label: 'Saturday',
      value: 5400,
      displayValues: {
        value: '$5,400',
      },
    },
    {
      label: 'Sunday',
      value: 6900,
      displayValues: {
        value: '$4,900',
      },
    },
  ],
  description: '+23.8K this week',
  height: 160,
  areas: [
    {
      dataKey: 'value',
      fill: 'var(--color-chart-2)',
      stroke: 'var(--color-chart-2)',
    },
  ],
  title: 'Total Transactions',
  value: 128400,
}

const AreaChartKPI2 = (props: AreaChartKPI2Props) => {
  const { trend, data, description, height, areas, title, value } = props
  return (
    <Card className='relative overflow-hidden'>
      <CardContent>
        <div className='relative z-10 space-y-12'>
          <div className='flex items-center justify-between'>
            <CardTitle>{title}</CardTitle>
            <Trend trend={trend} variant='badge' />
          </div>
          <div className='space-y-1'>
            <KPIValue value={value} animated />
            <CardDescription className='text-foreground'>{description}</CardDescription>
          </div>
        </div>
        <div className='absolute -bottom-4 -left-4 opacity-75 pointer-events-none w-[calc(100%+2rem)]'>
          <TinyAreaChart data={data} areas={areas} height={height} />
        </div>
      </CardContent>
    </Card>
  )
}

export {
  AreaChartKPI2,
  exampleProps as areaChartKpi2ExampleProps,
  type AreaChartKPI2Props,
}
