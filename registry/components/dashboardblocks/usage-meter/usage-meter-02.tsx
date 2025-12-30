'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { Ring } from '@/registry/components/dashboardblocks/ring'
import {
  UsageMeterLimit,
  UsageMeterValue,
} from '@/registry/components/dashboardblocks/usage-meter'

import { Card, CardContent, CardTitle } from '@/components/ui/card'

interface UsageMeter2Props {
  limit: number
  title: string
  unit: string
  used: number
}

const exampleProps: UsageMeter2Props = {
  limit: 120,
  title: 'Storage',
  unit: 'GB',
  used: 78,
}

const UsageMeter2 = (props: UsageMeter2Props) => {
  const { limit, title, unit, used } = props
  const percentage = (used / limit) * 100
  const isCritical = percentage >= 95
  const isWarning = percentage >= 80

  const ringColor = isCritical
    ? 'hsl(var(--destructive))'
    : isWarning
      ? 'hsl(38 92% 50%)'
      : 'var(--color-primary)'

  return (
    <Card>
      <CardContent>
        <div className='flex items-center gap-6'>
          <Ring
            className='h-24 w-24'
            percentage={percentage}
            ringColor={ringColor}
            strokeWidth={10}
          >
            <AnimatedNumber
              className='text-lg font-bold'
              value={percentage}
              formatter={(value) => `${value.toLocaleString()}%`}
            />
          </Ring>
          <div className='space-y-1'>
            <CardTitle className='text-base font-medium'>{title}</CardTitle>
            <div className='flex items-baseline gap-1'>
              <UsageMeterValue>
                <AnimatedNumber
                  value={used}
                  formatter={(value) => value.toLocaleString()}
                />
              </UsageMeterValue>
              <UsageMeterLimit className='block'>
                of {limit.toLocaleString()} {unit} used
              </UsageMeterLimit>
            </div>
            <p className='text-sm text-muted-foreground'>
              <AnimatedNumber
                value={limit - used}
                formatter={(value) => value.toLocaleString()}
              />{' '}
              {unit} available
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { UsageMeter2, exampleProps as usageMeter2ExampleProps, type UsageMeter2Props }
