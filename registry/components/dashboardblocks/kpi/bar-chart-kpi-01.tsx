'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { TinyBarChart } from '@/registry/components/dashboardblocks/chart'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import type { Props as BarProps } from 'recharts/types/cartesian/Bar'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface BarChartKPIProps {
  bars?: BarProps[]
  change?: string
  data?: unknown[]
  height?: number
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: number
}

export const BarChartKPI1 = ({
  bars = [
    {
      dataKey: 'value',
      fill: 'var(--color-primary)',
    },
  ],
  change = '+7.5%',
  data = [
    {
      label: 'Monday',
      value: 32,
      displayValues: {
        value: '$12,345',
      },
    },
    {
      label: 'Tuesday',
      value: 45,
      displayValues: {
        value: '$10,234',
      },
    },
    {
      label: 'Wednesday',
      value: 28,
      displayValues: {
        value: '$8,765',
      },
    },
    {
      label: 'Thursday',
      value: 52,
      displayValues: {
        value: '$6,543',
      },
    },
    {
      label: 'Friday',
      value: 61,
      displayValues: {
        value: '$4,321',
      },
    },
    {
      label: 'Saturday',
      value: 48,
      displayValues: {
        value: '$2,109',
      },
    },
    {
      label: 'Sunday',
      value: 57,
      displayValues: {
        value: '$1,234',
      },
    },
  ],
  height = 160,
  title = 'Revenue',
  trend = 'up',
  value = 87500,
}: BarChartKPIProps) => {
  return (
    <Card>
      <CardContent>
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <CardDescription>{title}</CardDescription>
            <Trend value={change} trend={trend} trendIcon='arrow' variant='badge' />
          </div>
          <KPIValue>
            <AnimatedNumber
              value={value}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
          </KPIValue>
        </div>
        <TinyBarChart data={data} bars={bars} height={height} />
      </CardContent>
    </Card>
  )
}
