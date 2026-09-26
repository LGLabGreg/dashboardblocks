'use client'

import {
  type ConfidenceLevel,
  ForecastBadge,
  ForecastLegend,
  fitLinear,
  forecastColors,
  getDeadlineStatus,
  solveForTarget,
} from '@/registry/components/dashboardblocks/forecast'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Forecast2Props {
  /** Running totals so far, oldest first, one step apart. */
  actuals: number[]
  deadline: Date
  formatter?: (value: number) => string
  /** The date of the last actual. */
  lastDate: Date
  /** @default 0.8 */
  level?: ConfidenceLevel
  /** What the target counts, in the plural. */
  metric: string
  /** Where the timeline starts. */
  now: Date
  /** Days between values. @default 7 */
  stepDays?: number
  target: number
  title: string
}

const exampleProps: Forecast2Props = {
  actuals: Array.from({ length: 12 }, (_, week) =>
    Math.round(
      7_320 + week * 155 + Math.sin(week / 1.3) * 110 - (week % 4 === 1 ? 80 : 0),
    ),
  ),
  deadline: new Date(Date.UTC(2026, 11, 31)),
  formatter: (value) => Math.round(value).toLocaleString('en-US'),
  lastDate: new Date(Date.UTC(2026, 8, 20)),
  metric: 'paying customers',
  now: new Date(Date.UTC(2026, 8, 26)),
  target: 10_000,
  title: 'Paying customers goal',
}

const DAY = 86_400_000
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const Forecast2 = (props: Forecast2Props) => {
  const {
    actuals,
    deadline,
    formatter = (value) => Math.round(value).toLocaleString(),
    lastDate,
    level = 0.8,
    metric,
    now,
    stepDays = 7,
    target,
    title,
  } = props

  const stepMs = stepDays * DAY
  const deadlineSteps = (deadline.getTime() - lastDate.getTime()) / stepMs
  const forecast = solveForTarget(actuals, target, {
    level,
    // Look well past the deadline, a day at a time.
    maxSteps: Math.max(52, deadlineSteps * 2),
    resolution: 1 / stepDays,
  })
  const status = getDeadlineStatus(forecast, deadlineSteps)
  const toDate = (steps: number) =>
    new Date(lastDate.getTime() + Math.ceil(steps * stepDays) * DAY)
  const expected = forecast.expected !== null ? toDate(forecast.expected) : null
  const earliest = forecast.earliest !== null ? toDate(forecast.earliest) : null
  const latest = forecast.latest !== null ? toDate(forecast.latest) : null

  const current = actuals[actuals.length - 1] ?? 0
  const trend = fitLinear(actuals).slope
  const stepsLeft = Math.max(0, (deadline.getTime() - now.getTime()) / stepMs)
  const needed = stepsLeft > 0 ? Math.max(0, (target - current) / stepsLeft) : 0
  const unit = stepDays === 7 ? 'week' : `${stepDays} days`
  const margin = expected
    ? Math.round((deadline.getTime() - expected.getTime()) / DAY)
    : null

  // The timeline runs from today to a little past the later of the deadline and the range.
  const start = now.getTime()
  const finish =
    Math.max(deadline.getTime(), (latest ?? earliest ?? deadline).getTime()) + 14 * DAY
  const position = (date: Date) =>
    Math.min(100, Math.max(0, ((date.getTime() - start) / (finish - start)) * 100))
  const percent = `${level * 100}%`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {formatter(target)} {metric} by {dateFormatter.format(deadline)}
        </CardDescription>
        <CardAction>
          <ForecastBadge status={status} />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1'>
          <p className='text-xl font-semibold tracking-tight text-balance'>
            {forecast.reached
              ? `Reached ${formatter(target)} ${metric}`
              : expected
                ? `Projected to reach ${formatter(target)} by ${dateFormatter.format(expected)}`
                : `Not projected to reach ${formatter(target)} at the current trend`}
          </p>
          {!forecast.reached && margin !== null && (
            <p className='text-muted-foreground text-sm'>
              {margin === 0
                ? 'On the deadline'
                : `${Math.abs(margin)} ${Math.abs(margin) === 1 ? 'day' : 'days'} ${margin > 0 ? 'before' : 'after'} the deadline`}
              , with {formatter(current)} {metric} now.
            </p>
          )}
        </div>
        {!forecast.reached && (
          <div className='flex flex-col gap-2'>
            <div aria-hidden className='relative h-8'>
              <div className='bg-muted absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full' />
              {earliest && (
                <div
                  className='absolute top-1/2 h-4 -translate-y-1/2 rounded-full border border-dashed border-chart-1'
                  style={{
                    backgroundColor: forecastColors.band,
                    left: `${position(earliest)}%`,
                    right: `${100 - (latest ? position(latest) : 100)}%`,
                  }}
                />
              )}
              {expected && (
                <span
                  className='ring-card absolute top-1/2 size-3 -translate-1/2 rounded-full ring-2'
                  style={{
                    backgroundColor: forecastColors.forecast,
                    left: `${position(expected)}%`,
                  }}
                />
              )}
              <span
                className='bg-foreground ring-card absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full ring-2'
                style={{ left: `${position(deadline)}%` }}
              />
            </div>
            <div
              aria-hidden
              className='text-muted-foreground relative flex h-4 justify-between text-xs'
            >
              <span>Today</span>
              <span
                className='absolute -translate-x-full pr-1 whitespace-nowrap'
                style={{ left: `${position(deadline)}%` }}
              >
                Deadline
              </span>
            </div>
            <ForecastLegend
              items={[
                { label: 'Projected date', shape: 'dot' },
                { label: `${percent} range`, shape: 'band' },
                { label: 'Deadline', shape: 'marker' },
              ]}
            />
          </div>
        )}
        <dl className='grid grid-cols-2 gap-4 border-t pt-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Projected date</dt>
            <dd className='text-sm font-medium'>
              {expected ? dateFormatter.format(expected) : 'Not in view'}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>{percent} range</dt>
            <dd className='text-sm font-medium'>
              {earliest
                ? latest
                  ? dateFormatter.formatRange(earliest, latest)
                  : `${dateFormatter.format(earliest)} or later`
                : 'Not in view'}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Current trend</dt>
            <dd className='text-sm font-medium'>
              {trend >= 0 ? '+' : '−'}
              {formatter(Math.abs(trend))} per {unit}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Needed to hit the deadline</dt>
            <dd className='text-sm font-medium'>
              +{formatter(needed)} per {unit}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export { Forecast2, exampleProps as forecast2ExampleProps, type Forecast2Props }
