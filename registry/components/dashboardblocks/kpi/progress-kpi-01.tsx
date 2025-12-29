'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

export const ProgressKPI1 = ({
  change = 7.5,
  percentage = 55,
  title = 'Revenue',
  trend = 'up',
  value = 87500,
}: {
  change?: number
  percentage?: number
  title?: string
  trend?: 'up' | 'down' | 'neutral'
  value?: number
} = {}) => {
  return (
    <Card>
      <CardContent className='space-y-1'>
        <div className='flex items-center justify-between'>
          <CardDescription>{title}</CardDescription>
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
        <KPIValue>
          <AnimatedNumber
            value={value}
            formatter={(value) => `$${value.toLocaleString()}`}
          />
        </KPIValue>
        <div className='mt-4 space-y-1 text-sm text-muted-foreground'>
          <div className='flex items-center justify-between'>
            <span>
              <span className='font-semibold text-foreground'>
                <AnimatedNumber
                  value={percentage}
                  formatter={(value) => `${value.toLocaleString()}%`}
                />
              </span>{' '}
              of monthly target
            </span>
            <span className='font-semibold text-foreground'>$100k</span>
          </div>
          <ProgressBar percentage={percentage} />
        </div>
      </CardContent>
    </Card>
  )
}
