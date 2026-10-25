'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { TinyBarChart } from '@/registry/components/dashboardblocks/chart'
import { KPIChart } from '@/registry/components/dashboardblocks/kpi'
import {
  UsageBar,
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusLabel,
  type UsageStatus,
  formatUsage,
  getDaysLeft,
} from '@/registry/components/dashboardblocks/usage-meter'
import { formatDate } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'

interface UsageMeter4Props extends BlockStateProps {
  /** Leave out to show the empty state. */
  balance?: number
  /** Credits used each day, oldest first; the last is today. */
  dailyUsage?: number[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onTopUp?: () => void
  purchased: number
  timeZone?: string
  title: string
}

const DAY = 86_400_000

const exampleProps: UsageMeter4Props = {
  balance: 45_750,
  dailyUsage: [
    1_080, 1_210, 990, 1_340, 1_420, 1_150, 870, 1_260, 1_390, 1_310, 1_480, 1_220, 1_160,
    1_430,
  ],
  now: new Date(Date.UTC(2026, 8, 26)),
  onTopUp: () => {},
  purchased: 100_000,
  title: 'Credits',
}

const CRITICAL_RUNWAY_DAYS = 7
const WARNING_RUNWAY_DAYS = 14

function getRunwayStatus(days: number): UsageStatus {
  if (days < CRITICAL_RUNWAY_DAYS) return 'critical'
  if (days < WARNING_RUNWAY_DAYS) return 'warning'
  return 'ok'
}

const UsageMeter4 = (props: UsageMeter4Props) => {
  const {
    balance = 0,
    dailyUsage = [],
    now,
    onTopUp,
    purchased,
    errorMessage,
    status: blockStatus,
    timeZone = 'UTC',
    title,
  } = props
  const state = getBlockState(blockStatus, props.balance)
  const burn =
    dailyUsage.length > 0
      ? dailyUsage.reduce((sum, value) => sum + value, 0) / dailyUsage.length
      : 0
  const daysLeft = getDaysLeft(balance, burn)
  const status = getRunwayStatus(daysLeft)
  const runsOut = Number.isFinite(daysLeft)
    ? new Date(now.getTime() + daysLeft * DAY)
    : null
  const days = dailyUsage.map((value, index) => ({
    label: formatDate(
      new Date(now.getTime() - (dailyUsage.length - 1 - index) * DAY),
      'day',
      timeZone,
    ),
    value,
  }))
  const latest = days[days.length - 1]

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-3 border-t pt-3'>
        <header className='flex min-h-8 items-center justify-between gap-3'>
          <p className='text-muted-foreground text-sm'>{title}</p>
          {onTopUp && (
            <Button variant='outline' size='sm' onClick={onTopUp}>
              Buy credits
            </Button>
          )}
        </header>
        <div className='flex flex-col gap-1'>
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <UsageMeterValue>
              <span aria-hidden>
                <AnimatedNumber
                  value={balance}
                  formatter={(value) => formatUsage(Math.round(value))}
                />
              </span>
              <span className='sr-only'>{formatUsage(balance)}</span>
            </UsageMeterValue>
            <UsageMeterLimit>of {formatUsage(purchased)} left</UsageMeterLimit>
          </div>
          {state === 'loading' ? (
            <BlockStateText className='text-sm' />
          ) : state ? null : (
            <p className='text-muted-foreground text-sm'>
              {runsOut ? (
                <>
                  <UsageStatusLabel
                    variant='text'
                    label={`${Math.floor(daysLeft)} ${Math.floor(daysLeft) === 1 ? 'day' : 'days'} left`}
                    status={status}
                  />
                  , running out around{' '}
                  <time dateTime={runsOut.toISOString()}>
                    {formatDate(runsOut, 'day', timeZone)}
                  </time>
                </>
              ) : (
                'No recent use, so they won’t run out at this rate'
              )}
            </p>
          )}
        </div>
        <UsageBar
          color='var(--color-chart-2)'
          limit={purchased}
          size='sm'
          used={balance}
        />
        {(state || latest) && (
          <KPIChart
            className='mt-2'
            label={
              latest
                ? `Credits used per day, last ${days.length} days: from ${formatUsage(days[0].value)} on ${days[0].label} to ${formatUsage(latest.value)} on ${latest.label}, ${formatUsage(Math.round(burn))} a day on average`
                : 'Credits used per day'
            }
          >
            <TinyBarChart
              accessibilityLayer={false}
              bars={[{ dataKey: 'value', fill: 'var(--color-chart-2)' }]}
              data={days}
              formatter={(value) => formatUsage(value, undefined, { compact: true })}
              height={88}
              highlightIndex={days.length - 1}
              reference={{
                label: `avg ${formatUsage(Math.round(burn))}`,
                value: burn,
              }}
            />
          </KPIChart>
        )}
        {latest && (
          <BlockReady className='text-xs'>
            <p className='text-muted-foreground text-xs'>
              Today used {formatUsage(latest.value)},{' '}
              {latest.value > burn ? 'above' : 'below'} the {days.length}-day average of{' '}
              {formatUsage(Math.round(burn))}.
            </p>
          </BlockReady>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { UsageMeter4, exampleProps as usageMeter4ExampleProps, type UsageMeter4Props }
