'use client'
import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { AnimatedWave } from '@/registry/components/dashboardblocks/animated-wave'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import { Database, LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export const UsageMeter7 = ({
  icon: IconComponent = Database,
  limit = 1500,
  onUpgrade,
  title = 'Storage',
  unit = 'MB',
  used = 430,
}: {
  icon?: LucideIcon
  limit?: number
  onUpgrade?: () => void
  title?: string
  unit?: string
  used?: number
} = {}) => {
  const remaining = limit - used

  return (
    <Card className='overflow-hidden pb-0'>
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
      <div className='relative h-[150px]'>
        <AnimatedWave percentage={100} />
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center space-y-3 text-center text-primary-foreground'>
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
          <div className='text-sm'>
            <AnimatedNumber value={used} formatter={(value) => value.toLocaleString()} />{' '}
            {unit} / {limit} {unit} used
          </div>
        </div>
      </div>
    </Card>
  )
}
