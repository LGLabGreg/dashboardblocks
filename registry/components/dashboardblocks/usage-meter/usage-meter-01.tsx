'use client'

import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  UsageBar,
  UsageKey,
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusBadge,
  formatUsage,
  getDaysLeft,
  getUsageStatus,
  projectUsage,
  usageStatusConfig,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface UsageMeter1Props {
  limit: number
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** When the quota resets. */
  periodEnd: Date
  periodStart: Date
  /** Time zone for dates. @default 'UTC' */
  timeZone?: string
  title: string
  unit: string
  used: number
}

const DAY = 86_400_000

const exampleProps: UsageMeter1Props = {
  limit: 10_000,
  now: new Date(Date.UTC(2026, 8, 26)),
  periodEnd: new Date(Date.UTC(2026, 9, 1)),
  periodStart: new Date(Date.UTC(2026, 8, 1)),
  title: 'API requests',
  unit: 'requests',
  used: 8_420,
}

const UsageMeter1 = (props: UsageMeter1Props) => {
  const {
    limit,
    now,
    periodEnd,
    periodStart,
    timeZone = 'UTC',
    title,
    unit,
    used,
  } = props
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone,
  })
  const formatDate = (date: Date) => dateFormatter.format(date)

  const daysElapsed = (now.getTime() - periodStart.getTime()) / DAY
  const daysInPeriod = (periodEnd.getTime() - periodStart.getTime()) / DAY
  const daysToReset = Math.ceil((periodEnd.getTime() - now.getTime()) / DAY)
  const projected = projectUsage({ daysElapsed, daysInPeriod, used })
  const status = getUsageStatus(used, limit)
  const dailyRate = daysElapsed > 0 ? used / daysElapsed : 0
  const daysToLimit = getDaysLeft(limit - used, dailyRate)
  const hitsLimit = daysToLimit < daysToReset
  const limitDate = new Date(now.getTime() + daysToLimit * DAY)

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Icon
            icon={
              <IconPlaceholder
                lucide='ActivityIcon'
                tabler='IconActivity'
                hugeicons='ActivityIcon'
                phosphor='ActivityIcon'
                remixicon='RiPulseLine'
              />
            }
            size='sm'
            variant='secondary'
          />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardAction>
          <UsageStatusBadge status={status} />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex items-baseline justify-between gap-2'>
          <UsageMeterValue>{formatUsage(used)}</UsageMeterValue>
          <UsageMeterLimit>
            of {formatUsage(limit)} {unit}
          </UsageMeterLimit>
        </div>
        <UsageBar limit={limit} projected={projected} used={used} />
        <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs'>
          <span className='tabular-nums'>
            {formatUsage(Math.max(0, limit - used))} left
          </span>
          <span>
            Resets <time dateTime={periodEnd.toISOString()}>{formatDate(periodEnd)}</time>
            , in {daysToReset} {daysToReset === 1 ? 'day' : 'days'}
          </span>
        </div>
        <p className='bg-muted/50 flex items-start gap-2 rounded-md p-3 text-xs'>
          <UsageKey
            className='mt-0.5'
            color={usageStatusConfig[hitsLimit ? 'over' : status].color}
            shape='projected'
          />
          <span className='text-muted-foreground'>
            On pace for{' '}
            <span
              className={cn(
                'font-medium tabular-nums',
                hitsLimit ? usageStatusConfig.over.text : 'text-foreground',
              )}
            >
              {formatUsage(Math.round(projected))} {unit}
            </span>{' '}
            by the reset.
            {hitsLimit && (
              <>
                {' '}
                At this rate you reach the limit around{' '}
                <time dateTime={limitDate.toISOString()}>{formatDate(limitDate)}</time>.
              </>
            )}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}

export { UsageMeter1, exampleProps as usageMeter1ExampleProps, type UsageMeter1Props }
