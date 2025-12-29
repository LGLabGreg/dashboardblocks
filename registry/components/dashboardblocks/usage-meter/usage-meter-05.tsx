'use client'
import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import {
  SegmentedProgressBar,
  SegmentedProgressBarProps,
} from '@/registry/components/dashboardblocks/progress-bar'
import { UsageMeterValue } from '@/registry/components/dashboardblocks/usage-meter'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

export const UsageMeter5 = ({
  segments = [
    { label: 'Documents', value: 12.4, color: 'hsl(221 83% 53%)' },
    { label: 'Images', value: 28.6, color: 'hsl(262 83% 58%)' },
    { label: 'Videos', value: 18.2, color: 'hsl(330 81% 60%)' },
    { label: 'Other', value: 8.3, color: 'hsl(35 91% 50%)' },
  ],
  title = 'Storage Breakdown',
  total = 100,
  unit = 'GB',
}: {
  segments?: SegmentedProgressBarProps['segments']
  title?: string
  total?: number
  unit?: string
} = {}) => {
  const used = segments.reduce((acc, s) => acc + s.value, 0)
  const free = total - used

  return (
    <Card>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-medium'>{title}</CardTitle>
          <CardDescription>
            {free.toFixed(1)} {unit} free
          </CardDescription>
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline justify-between'>
            <UsageMeterValue>
              <AnimatedNumber value={used} formatter={(value) => value.toFixed(1)} />{' '}
              {unit}
            </UsageMeterValue>
            <span className='text-sm text-muted-foreground'>
              of {total} {unit}
            </span>
          </div>
          <SegmentedProgressBar segments={segments} total={total} />
        </div>
        <div className='grid grid-cols-2 gap-x-3 gap-y-2'>
          {segments.map((segment) => (
            <div key={segment.label} className='flex items-center gap-2'>
              <div
                className='h-2.5 w-2.5 rounded-full'
                style={{ backgroundColor: segment.color }}
              />
              <span className='text-sm text-muted-foreground'>{segment.label}</span>
              <span className='ml-auto text-sm font-medium'>
                <AnimatedNumber
                  value={segment.value}
                  formatter={(value) => value.toFixed(1)}
                />{' '}
                {unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
