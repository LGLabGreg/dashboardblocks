'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const KPI2 = ({
  change = 12.5,
  title = 'Active Users',
  trend = 'up',
  value = 2420,
}: {
  change?: number
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: number
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-2'>
        <div className='flex items-center justify-between'>
          <CardDescription>{title}</CardDescription>
          <Trend
            value={
              <AnimatedNumber
                value={change}
                formatter={(value) => `+${value.toLocaleString()}%`}
              />
            }
            trend={trend}
            variant='badge'
          />
        </div>
        <KPIValue>
          <AnimatedNumber value={value} />
        </KPIValue>
      </CardContent>
    </Card>
  )
}
