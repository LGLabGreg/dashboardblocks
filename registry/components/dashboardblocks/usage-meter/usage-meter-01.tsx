import { Icon } from '@/registry/components/dashboardblocks/icon'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import {
  UsageMeterLimit,
  UsageMeterStatus,
  UsageMeterValue,
} from '@/registry/components/dashboardblocks/usage-meter'
import { Activity } from 'lucide-react'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

export const UsageMeter1 = ({
  limit = 10000,
  title = 'API Requests',
  unit = 'requests',
  used = 7234,
}: {
  limit?: number
  title?: string
  unit?: string
  used?: number
} = {}) => {
  const percentage = (used / limit) * 100
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))
  const fillClassName =
    normalized >= 95 ? 'bg-destructive' : normalized >= 80 ? 'bg-amber-500' : undefined

  return (
    <Card>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon icon={Activity} variant='secondary' size='sm' />
            <CardTitle className='text-base font-medium'>{title}</CardTitle>
          </div>
          <UsageMeterStatus percentage={percentage} />
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline justify-between'>
            <UsageMeterValue>{used.toLocaleString()}</UsageMeterValue>
            <UsageMeterLimit>
              of {limit.toLocaleString()} {unit}
            </UsageMeterLimit>
          </div>
          <ProgressBar percentage={percentage} fillClassName={fillClassName} />
        </div>
        <CardDescription>
          {(limit - used).toLocaleString()} {unit} remaining this month
        </CardDescription>
      </CardContent>
    </Card>
  )
}
