'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { Icon } from '@/registry/components/dashboardblocks/icon'
import {
  UsageBar,
  UsageMeterValue,
  UsageStatusBadge,
  type UsageStatus,
  formatUsage,
  getDaysLeft,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface UsageMeter4Props {
  /** Credits left. */
  balance: number
  /** Credits used each day, oldest first. The average sets the burn rate. */
  dailyUsage: number[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onTopUp?: () => void
  /** Credits in the last top-up, the top of the bar. */
  purchased: number
  /** Time zone for dates. @default 'UTC' */
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
  purchased: 100_000,
  title: 'Credits',
}

/** Warn two weeks out, and again in the last week. */
function getRunwayStatus(days: number): UsageStatus {
  if (days < 7) return 'critical'
  if (days < 14) return 'warning'
  return 'ok'
}

const UsageMeter4 = (props: UsageMeter4Props) => {
  const { balance, dailyUsage, now, onTopUp, purchased, timeZone = 'UTC', title } = props
  const burn =
    dailyUsage.length > 0
      ? dailyUsage.reduce((sum, value) => sum + value, 0) / dailyUsage.length
      : 0
  const daysLeft = getDaysLeft(balance, burn)
  const status = getRunwayStatus(daysLeft)
  const runsOut = Number.isFinite(daysLeft)
    ? new Date(now.getTime() + daysLeft * DAY)
    : null
  const peak = Math.max(...dailyUsage, 1)
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone,
  })
  const formatDate = (date: Date) => dateFormatter.format(date)

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Icon
            icon={
              <IconPlaceholder
                lucide='CoinsIcon'
                tabler='IconCoins'
                hugeicons='Coins01Icon'
                phosphor='CoinsIcon'
                remixicon='RiCoinsLine'
              />
            }
            size='sm'
            variant='secondary'
          />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardAction>
          <UsageStatusBadge
            label={
              Number.isFinite(daysLeft) ? `${Math.floor(daysLeft)} days left` : undefined
            }
            status={status}
          />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-baseline justify-between gap-2'>
            <UsageMeterValue>
              <span aria-hidden>
                <AnimatedNumber
                  value={balance}
                  formatter={(value) => formatUsage(Math.round(value))}
                />
              </span>
              <span className='sr-only'>{formatUsage(balance)}</span>
            </UsageMeterValue>
            <span className='text-muted-foreground text-sm'>
              of {formatUsage(purchased)} remaining
            </span>
          </div>
          <UsageBar color='var(--color-chart-2)' limit={purchased} used={balance} />
        </div>
        <div className='flex items-end justify-between gap-4'>
          <dl className='grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs'>
            <dt className='text-muted-foreground'>Avg per day</dt>
            <dt className='text-muted-foreground'>Runs out</dt>
            <dd className='text-sm font-medium tabular-nums'>
              {formatUsage(Math.round(burn))}
            </dd>
            <dd className='text-sm font-medium'>
              {runsOut ? (
                <time dateTime={runsOut.toISOString()}>~{formatDate(runsOut)}</time>
              ) : (
                'Not at this rate'
              )}
            </dd>
          </dl>
          <div
            role='img'
            aria-label={`Credits used per day, last ${dailyUsage.length} days: from ${formatUsage(dailyUsage[0] ?? 0)} to ${formatUsage(dailyUsage[dailyUsage.length - 1] ?? 0)}`}
            className='flex h-10 w-28 shrink-0 items-end gap-0.5'
          >
            {dailyUsage.map((value, index) => (
              <span
                key={index}
                className='bg-chart-2/60 flex-1 rounded-t-[2px]'
                style={{ height: `${Math.max(8, (value / peak) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className='border-t'>
        <Button variant='outline' className='w-full' onClick={onTopUp}>
          Buy credits
        </Button>
      </CardFooter>
    </Card>
  )
}

export { UsageMeter4, exampleProps as usageMeter4ExampleProps, type UsageMeter4Props }
