'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const KPI3 = ({
  change = -2.1,
  description = 'Compared to last month',
  title = 'Conversion Rate',
  trend = 'down',
  value = 3.24,
}: {
  change?: number
  description?: string
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: number
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-2'>
        <CardDescription>{title}</CardDescription>
        <KPIValue>
          <AnimatedNumber
            value={value}
            formatter={(value) => `${value.toLocaleString()}%`}
          />
        </KPIValue>
        <div className='flex items-center justify-between border-t pt-2 mt-3'>
          <CardDescription>{description}</CardDescription>
          <Trend
            value={
              <AnimatedNumber
                value={change}
                formatter={(value) => `${value.toLocaleString()}%`}
              />
            }
            trend={trend}
            variant='badge'
          />
        </div>
      </CardContent>
    </Card>
  )
}
