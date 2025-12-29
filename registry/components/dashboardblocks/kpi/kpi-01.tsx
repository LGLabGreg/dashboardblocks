'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const KPI1 = ({
  change = 20.1,
  title = 'Total Revenue',
  trend = 'up',
  value = 45231,
}: {
  change?: number
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: number
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1'>
          <KPIValue>
            <AnimatedNumber
              value={value}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
          </KPIValue>
          <Trend
            value={
              <AnimatedNumber
                value={change}
                formatter={(value) => `+${value.toLocaleString()}%`}
              />
            }
            trend={trend}
          />
        </div>
      </CardContent>
    </Card>
  )
}
