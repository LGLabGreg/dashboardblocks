'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { statusToneClasses } from '@/registry/components/dashboardblocks/status-label'
import {
  UsageBar,
  UsageKey,
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusLabel,
  formatUsage,
  getDaysLeft,
  getUsageStatus,
  projectUsage,
  usageStatusConfig,
} from '@/registry/components/dashboardblocks/usage-meter'

import { cn } from '@/lib/utils'

interface UsageMeter1Props {
  limit: number
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  periodEnd: Date
  periodStart: Date
  status?: BlockStatus
  timeZone?: string
  title: string
  unit: string
  /** Leave out to show the empty state. */
  used?: number
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
    status: blockStatus,
    timeZone = 'UTC',
    title,
    unit,
    used = 0,
  } = props
  const state = getBlockState(blockStatus, props.used)
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
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-3 border-t pt-3'>
        <header className='flex items-baseline justify-between gap-3'>
          <p className='text-muted-foreground text-sm'>{title}</p>
          <UsageStatusLabel status={status} />
        </header>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <UsageMeterValue>{formatUsage(used)}</UsageMeterValue>
          <UsageMeterLimit>
            of {formatUsage(limit)} {unit}
          </UsageMeterLimit>
        </div>
        <UsageBar limit={limit} projected={projected} used={used} />
        <BlockReady className='text-xs'>
          <p className='text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs'>
            <span className='tabular-nums'>
              {formatUsage(Math.max(0, limit - used))} left
            </span>
            <span>
              Resets{' '}
              <time dateTime={periodEnd.toISOString()}>{formatDate(periodEnd)}</time>, in{' '}
              {daysToReset} {daysToReset === 1 ? 'day' : 'days'}
            </span>
          </p>
        </BlockReady>
        {state !== 'empty' && state !== 'error' && (
          <div className='border-t pt-3'>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>
                <UsageKey
                  className='mr-2'
                  color={usageStatusConfig[hitsLimit ? 'over' : status].color}
                  shape='projected'
                />
                On pace for{' '}
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    hitsLimit
                      ? statusToneClasses[usageStatusConfig.over.tone]
                      : 'text-foreground',
                  )}
                >
                  {formatUsage(Math.round(projected))} {unit}
                </span>{' '}
                by the reset.
                {hitsLimit && (
                  <>
                    {' '}
                    At this rate you reach the limit around{' '}
                    <time dateTime={limitDate.toISOString()}>
                      {formatDate(limitDate)}
                    </time>
                    .
                  </>
                )}
              </p>
            </BlockReady>
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { UsageMeter1, exampleProps as usageMeter1ExampleProps, type UsageMeter1Props }
