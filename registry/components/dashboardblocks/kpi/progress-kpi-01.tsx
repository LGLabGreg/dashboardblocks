'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardContent, CardDescription } from '@/components/ui/card'

interface ProgressKPI1Props {
  trend: number
  percentage: number
  title: string
  value: number
}

const exampleProps: ProgressKPI1Props = {
  trend: 7.5,
  percentage: 55,
  title: 'Revenue',
  value: 87500,
}

const ProgressKPI1 = (props: ProgressKPI1Props) => {
  const { trend, percentage, title, value } = props
  return (
    <Card>
      <CardContent className='space-y-1'>
        <div className='flex items-center justify-between'>
          <CardDescription>{title}</CardDescription>
          <Trend trend={trend} variant='badge' />
        </div>
        <KPIValue
          value={value}
          formatter={(value) => `$${value.toLocaleString()}`}
          animated
        />
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

export { ProgressKPI1, exampleProps as progressKpi1ExampleProps, type ProgressKPI1Props }
