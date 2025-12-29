'use client'
import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { AnimatedWave } from '@/registry/components/dashboardblocks/animated-wave'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import { Database, LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export const UsageMeter8 = ({
  daysLeft = 27,
  icon: IconComponent = Database,
  limit = 1500,
  onUpgrade,
  title = 'Storage',
  unit = 'MB',
  used = 430,
}: {
  daysLeft?: number
  icon?: LucideIcon
  limit?: number
  onUpgrade?: () => void
  title?: string
  unit?: string
  used?: number
} = {}) => {
  const remaining = limit - used
  const availablePercentage = Math.round((remaining / limit) * 100)

  return (
    <Card>
      <CardHeader className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon icon={IconComponent} size='sm' />
          <CardTitle>{title}</CardTitle>
        </div>
        {onUpgrade && (
          <Button variant='outline' size='sm' onClick={onUpgrade}>
            Upgrade
          </Button>
        )}
      </CardHeader>
      <div className='space-y-6 pb-6'>
        <div className='flex justify-center'>
          <div className='relative size-[200px] overflow-hidden rounded-full bg-muted shadow-md'>
            <AnimatedWave percentage={85} />
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center space-y-2 text-center text-primary-foreground'>
              <div className='space-y-1'>
                <div className='text-sm font-medium tracking-wider'>REMAINING</div>
                <div className='flex items-start gap-1 text-4xl font-bold leading-none'>
                  <AnimatedNumber
                    value={remaining}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <span className='text-sm font-medium'>{unit}</span>
                </div>
              </div>
              <div className='text-xs'>
                {used} {unit} / {limit} {unit} used
              </div>
            </div>
          </div>
        </div>
        <div
          className={`grid gap-4 px-6 ${daysLeft !== undefined ? 'grid-cols-3' : 'grid-cols-2'}`}
        >
          <div className='flex flex-col items-center space-y-1.5'>
            <div className='h-[2px] w-12 bg-purple-500' />
            <div className='text-xs text-muted-foreground'>USED ({unit})</div>
            <div className='text-2xl font-semibold leading-none'>
              <AnimatedNumber
                value={used}
                formatter={(value) => value.toLocaleString()}
              />
            </div>
          </div>
          <div className='flex flex-col items-center space-y-1.5'>
            <div className='h-[2px] w-12 bg-blue-500' />
            <div className='text-xs text-muted-foreground'>AVAILABLE</div>
            <div className='text-2xl font-semibold leading-none'>
              <AnimatedNumber
                value={availablePercentage}
                formatter={(value) => `${value}%`}
              />
            </div>
          </div>
          {daysLeft !== undefined && (
            <div className='flex flex-col items-center space-y-1.5'>
              <div className='h-[2px] w-12 bg-green-500' />
              <div className='text-xs text-muted-foreground'>DAYS LEFT</div>
              <div className='text-2xl font-semibold leading-none'>
                <AnimatedNumber
                  value={daysLeft}
                  formatter={(value) => value.toLocaleString()}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
