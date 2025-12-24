import { KPIBarChart, KPITrend, KPIValue } from '@/registry/dashboardblocks/kpi'
import type { Props as BarProps } from 'recharts/types/cartesian/Bar'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface BarChartKPIProps {
  bars?: BarProps[]
  change?: string
  data?: unknown[]
  height?: number
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: string
}

export const BarChartKPI2 = ({
  bars = [
    {
      dataKey: 'value',
      fill: 'var(--color-chart-1)',
    },
    {
      dataKey: 'goal',
      fill: 'var(--color-chart-2)',
    },
  ],
  change = '+7.5%',
  data = [
    {
      label: 'Monday',
      value: 32,
      goal: 38,
      displayValues: {
        value: '$12,345',
        goal: '$14,620',
      },
    },
    {
      label: 'Tuesday',
      value: 45,
      goal: 42,
      displayValues: {
        value: '$10,234',
        goal: '$9,980',
      },
    },
    {
      label: 'Wednesday',
      value: 28,
      goal: 34,
      displayValues: {
        value: '$8,765',
        goal: '$10,500',
      },
    },
    {
      label: 'Thursday',
      value: 52,
      goal: 48,
      displayValues: {
        value: '$6,543',
        goal: '$6,050',
      },
    },
    {
      label: 'Friday',
      value: 61,
      goal: 64,
      displayValues: {
        value: '$4,321',
        goal: '$4,765',
      },
    },
    {
      label: 'Saturday',
      value: 48,
      goal: 52,
      displayValues: {
        value: '$2,109',
        goal: '$2,356',
      },
    },
    {
      label: 'Sunday',
      value: 57,
      goal: 60,
      displayValues: {
        value: '$1,234',
        goal: '$1,420',
      },
    },
  ],
  height = 160,
  title = 'Revenue',
  trend = 'up',
  value = '$87,500',
}: BarChartKPIProps) => {
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <KPITrend value={change} trend={trend} variant='badge' />
          </div>
          <KPIValue>{value}</KPIValue>
        </div>
        <KPIBarChart data={data} bars={bars} height={height} />
      </CardContent>
    </Card>
  )
}
