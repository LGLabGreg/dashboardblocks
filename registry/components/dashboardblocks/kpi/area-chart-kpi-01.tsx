import { TinyAreaChart } from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import { AreaProps } from 'recharts'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface AreaChartKPIProps {
  change?: string
  data?: unknown[]
  height?: number
  areas?: AreaProps[]
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
}

export const AreaChartKPI1 = ({
  change = '+3.7%',
  data = [
    {
      label: 'Monday',
      revenue: 4200,
      profit: 1200,
      displayValues: {
        revenue: '$4,200',
        profit: '$1,200',
      },
    },
    {
      label: 'Tuesday',
      revenue: 5100,
      profit: 1500,
      displayValues: {
        revenue: '$5,100',
        profit: '$1,500',
      },
    },
    {
      label: 'Wednesday',
      revenue: 2800,
      profit: 800,
      displayValues: {
        revenue: '$4,800',
        profit: '$800',
      },
    },
    {
      label: 'Thursday',
      revenue: 5600,
      profit: 1600,
      displayValues: {
        revenue: '$5,600',
        profit: '$1,600',
      },
    },
    {
      label: 'Friday',
      revenue: 6300,
      profit: 1800,
      displayValues: {
        revenue: '$6,300',
        profit: '$1,800',
      },
    },
    {
      label: 'Saturday',
      revenue: 5400,
      profit: 1400,
      displayValues: {
        revenue: '$5,400',
        profit: '$1,400',
      },
    },
    {
      label: 'Sunday',
      revenue: 6900,
      profit: 2000,
      displayValues: {
        revenue: '$4,900',
        profit: '$2,000',
      },
    },
  ],
  height = 120,
  areas = [
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
  title = 'Profit Margin',
  trend = 'up',
  value = '42.3%',
}: AreaChartKPIProps) => {
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <Trend value={change} trend={trend} variant='badge' />
          </div>
          <KPIValue>{value}</KPIValue>
        </div>
        <TinyAreaChart data={data} areas={areas} height={height} />
      </CardContent>
    </Card>
  )
}
