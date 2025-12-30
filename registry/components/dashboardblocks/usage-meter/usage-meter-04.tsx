'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import { UsageMeterValue } from '@/registry/components/dashboardblocks/usage-meter'
import { Coins } from 'lucide-react'

import { Card, CardContent, CardTitle } from '@/components/ui/card'

interface UsageMeter4Props {
  remaining: number
  title: string
  total: number
  trend: number
}

const exampleProps: UsageMeter4Props = {
  remaining: 45750,
  title: 'Credits Remaining',
  total: 100000,
  trend: -1250,
}

const UsageMeter4 = (props: UsageMeter4Props) => {
  const { remaining, title, total, trend } = props
  const used = total - remaining
  const percentage = (used / total) * 100
  const daysRemaining = Math.round(remaining / Math.abs(trend))

  return (
    <Card>
      <CardContent className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon icon={Coins} size='sm' />
            <CardTitle>{title}</CardTitle>
          </div>
          <Trend
            trend={trend}
            formatter={(value) => `${value > 0 ? '+' : ''}${value.toLocaleString()}/day`}
          />
        </div>
        <div>
          <UsageMeterValue>
            <AnimatedNumber
              value={remaining}
              formatter={(value) => value.toLocaleString()}
            />
          </UsageMeterValue>
          <ProgressBar percentage={100 - percentage} fillClassName='bg-emerald-500' />
        </div>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            <AnimatedNumber value={used} formatter={(value) => value.toLocaleString()} />{' '}
            used
          </span>
          <span>~{daysRemaining} days remaining</span>
        </div>
      </CardContent>
    </Card>
  )
}

export { UsageMeter4, exampleProps as usageMeter4ExampleProps, type UsageMeter4Props }
