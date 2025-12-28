import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  UsageMeterBar,
  UsageMeterLimit,
  UsageMeterStatus,
  UsageMeterValue,
} from '@/registry/components/dashboardblocks/usage-meter'
import { Activity } from 'lucide-react'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

export const UsageMeter1 = ({
  className = '',
  limit = 10000,
  title = 'API Requests',
  unit = 'requests',
  used = 7234,
}: {
  className?: string
  limit?: number
  title?: string
  unit?: string
  used?: number
} = {}) => {
  const percentage = (used / limit) * 100

  return (
    <Card className={className}>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon icon={Activity} variant='muted' />
            <CardTitle className='text-base font-medium'>{title}</CardTitle>
          </div>
          <UsageMeterStatus percentage={percentage} />
        </div>
        <div className='space-y-2'>
          <div className='flex items-baseline justify-between'>
            <UsageMeterValue>{used.toLocaleString()}</UsageMeterValue>
            <UsageMeterLimit>
              of {limit.toLocaleString()} {unit}
            </UsageMeterLimit>
          </div>
          <UsageMeterBar percentage={percentage} />
        </div>
        <CardDescription>
          {(limit - used).toLocaleString()} {unit} remaining this month
        </CardDescription>
      </CardContent>
    </Card>
  )
}
