'use client'

import {
  GoalProgress,
  GoalProgressKey,
  PaceBadge,
  getElapsed,
  getPace,
} from '@/registry/components/dashboardblocks/goals'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Goals1Props {
  current: number
  /** The last day of the period. */
  end: Date
  formatter?: (value: number) => string
  start: Date
  target: number
  title: string
  today: Date
}

const exampleProps: Goals1Props = {
  current: 412_300,
  end: new Date(Date.UTC(2026, 8, 30)),
  formatter: (value) => `$${Math.round(value).toLocaleString('en-US')}`,
  start: new Date(Date.UTC(2026, 6, 1)),
  target: 500_000,
  title: 'Q3 revenue target',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DAY = 86_400_000
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const Goals1 = (props: Goals1Props) => {
  const {
    current,
    end,
    formatter = (value) => Math.round(value).toLocaleString(),
    start,
    target,
    title,
    today,
  } = props
  // Count the last day in full, so the period ends at the end of `end`.
  const periodEnd = new Date(end.getTime() + DAY)
  const pace = getPace({ current, elapsed: getElapsed(start, periodEnd, today), target })
  const daysLeft = Math.max(
    0,
    Math.ceil((periodEnd.getTime() - today.getTime()) / DAY) - 1,
  )
  const share = target > 0 ? (current / target) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {dateFormatter.formatRange(start, end)}, {daysLeft}{' '}
          {daysLeft === 1 ? 'day' : 'days'} left
        </CardDescription>
        <CardAction>
          <PaceBadge status={pace.status} />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
          <p className='flex flex-wrap items-baseline gap-x-2'>
            <span className='text-3xl font-semibold tracking-tight'>
              {formatter(current)}
            </span>
            <span className='text-muted-foreground text-sm'>of {formatter(target)}</span>
          </p>
          <span className='text-sm font-medium tabular-nums'>{share.toFixed(0)}%</span>
        </div>
        <div className='flex flex-col gap-2'>
          <GoalProgress current={current} expected={pace.expected} target={target} />
          <GoalProgressKey label={`Expected by today: ${formatter(pace.expected)}`} />
        </div>
        <dl className='grid grid-cols-2 gap-4 border-t pt-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Remaining</dt>
            <dd className='text-sm font-medium'>
              {formatter(Math.max(0, target - current))}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Projected at current pace</dt>
            <dd className='text-sm font-medium'>{formatter(pace.projected)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export { Goals1, exampleProps as goals1ExampleProps, type Goals1Props }
