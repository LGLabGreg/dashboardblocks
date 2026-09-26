'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { Ring } from '@/registry/components/dashboardblocks/ring'
import {
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusBadge,
  formatUsage,
  getUsageShare,
  getUsageStatus,
  usageStatusConfig,
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
  used: 78.4,
}

const UsageMeter2 = (props: UsageMeter2Props) => {
  const { limit, title, unit, used } = props
  const share = getUsageShare(used, limit)
  const status = getUsageStatus(used, limit)
  const free = Math.max(0, limit - used)

  return (
    <Card>
      <CardContent className='flex items-center gap-6'>
        <Ring
          ariaLabel={`${Math.round(share)}% of ${title.toLowerCase()} used`}
          className='size-24'
          percentage={Math.min(100, share)}
          ringColor={usageStatusConfig[status].color}
          strokeWidth={10}
        >
          <AnimatedNumber
            className='text-lg font-semibold tabular-nums'
            value={Math.round(share)}
            formatter={(value) => `${Math.round(value)}%`}
          />
        </Ring>
        <div className='flex min-w-0 flex-col gap-1'>
          <CardTitle>{title}</CardTitle>
          <div className='flex flex-wrap items-baseline gap-x-1'>
            <UsageMeterValue>{formatUsage(used, unit)}</UsageMeterValue>
            <UsageMeterLimit>of {formatUsage(limit, unit)}</UsageMeterLimit>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm tabular-nums'>
              {formatUsage(free, unit)} free
            </span>
            {status !== 'ok' && <UsageStatusBadge status={status} />}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { UsageMeter2, exampleProps as usageMeter2ExampleProps, type UsageMeter2Props }
