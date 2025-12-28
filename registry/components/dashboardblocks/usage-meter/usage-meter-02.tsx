import { Ring } from '@/registry/components/dashboardblocks/ring'
import {
  UsageMeterLimit,
  UsageMeterValue,
} from '@/registry/components/dashboardblocks/usage-meter'

import { Card, CardContent, CardTitle } from '@/components/ui/card'

export const UsageMeter2 = ({
  className = '',
  limit = 100,
  title = 'Storage',
  unit = 'GB',
  used = 67.5,
}: {
  className?: string
  limit?: number
  title?: string
  unit?: string
  used?: number
} = {}) => {
  const percentage = (used / limit) * 100
  const isCritical = percentage >= 95
  const isWarning = percentage >= 80

  const ringColor = isCritical
    ? 'hsl(var(--destructive))'
    : isWarning
      ? 'hsl(38 92% 50%)'
      : 'var(--color-primary)'

  return (
    <Card className={className}>
      <CardContent>
        <div className='flex items-center gap-6'>
          <Ring
            className='h-24 w-24'
            percentage={percentage}
            ringColor={ringColor}
            strokeWidth={10}
          >
            <span className='text-lg font-bold'>{Math.round(percentage)}%</span>
          </Ring>
          <div className='space-y-1'>
            <CardTitle className='text-base font-medium'>{title}</CardTitle>
            <div className='space-y-0.5'>
              <UsageMeterValue>
                {used.toLocaleString()} {unit}
              </UsageMeterValue>
              <UsageMeterLimit className='block'>
                of {limit.toLocaleString()} {unit} used
              </UsageMeterLimit>
            </div>
            <p className='text-sm text-muted-foreground'>
              {(limit - used).toLocaleString()} {unit} available
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
