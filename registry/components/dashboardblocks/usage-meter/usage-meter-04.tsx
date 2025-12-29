import { Icon } from '@/registry/components/dashboardblocks/icon'
import { ProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import { Trend } from '@/registry/components/dashboardblocks/trend'
import { UsageMeterValue } from '@/registry/components/dashboardblocks/usage-meter'
import { Coins } from 'lucide-react'

import { Card, CardContent, CardTitle } from '@/components/ui/card'

export const UsageMeter4 = ({
  burnRate = '-1,250',
  remaining = 45750,
  title = 'Credits Remaining',
  total = 100000,
  trend = 'down',
}: {
  burnRate?: string
  remaining?: number
  title?: string
  total?: number
  trend?: 'up' | 'down' | 'neutral'
} = {}) => {
  const used = total - remaining
  const percentage = (used / total) * 100
  const daysRemaining = Math.round(
    remaining / Math.abs(parseInt(burnRate.replace(/[^0-9]/g, ''))),
  )

  return (
    <Card>
      <CardContent className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon icon={Coins} size='sm' />
            <CardTitle>{title}</CardTitle>
          </div>
          <Trend value={`${burnRate}/day`} trend={trend} />
        </div>
        <div className='space-y-1'>
          <UsageMeterValue>{remaining.toLocaleString()}</UsageMeterValue>
          <ProgressBar percentage={100 - percentage} fillClassName='bg-emerald-500' />
        </div>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>{used.toLocaleString()} used</span>
          <span>~{daysRemaining} days remaining</span>
        </div>
      </CardContent>
    </Card>
  )
}
