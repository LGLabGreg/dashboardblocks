'use client'

import {
  ForecastBadge,
  ForecastLegend,
  ProjectionBar,
  getProjectionStatus,
  getRunRate,
} from '@/registry/components/dashboardblocks/forecast'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Forecast3Props {
  /** The total so far this period. */
  current: number
  description: string
  /** Days of the period that have passed. */
  elapsed: number
  formatter?: (value: number) => string
  target: number
  title: string
  /** Days in the period. */
  total: number
}

const exampleProps: Forecast3Props = {
  current: 38_420,
  description: 'Month to date through Sep 25, projected at the daily run-rate',
  elapsed: 25,
  formatter: (value) => `$${Math.round(value).toLocaleString('en-US')}`,
  target: 48_000,
  title: 'September revenue',
  total: 30,
}

const Forecast3 = (props: Forecast3Props) => {
  const {
    current,
    description,
    elapsed,
    formatter = (value) => Math.round(value).toLocaleString(),
    target,
    title,
    total,
  } = props

  const { projected, rate, remaining, required } = getRunRate({
    current,
    elapsed,
    target,
    total,
  })
  const status = current >= target ? 'reached' : getProjectionStatus(projected, target)
  const gap = projected - target
  const share = target > 0 ? Math.round((projected / target) * 100) : 0

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <ForecastBadge status={status} />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
          <p className='flex flex-wrap items-baseline gap-x-2'>
            <span className='text-3xl font-semibold tracking-tight'>
              {formatter(current)}
            </span>
            <span className='text-muted-foreground text-sm'>so far</span>
          </p>
          <span className='text-muted-foreground text-sm tabular-nums'>
            Day {elapsed} of {total}
          </span>
        </div>
        <div className='flex flex-col gap-2'>
          <ProjectionBar
            current={current}
            max={Math.max(projected, target) * 1.05}
            projected={projected}
            target={target}
          />
          <ForecastLegend
            items={[
              { label: 'So far', shape: 'bar' },
              { label: 'Projected', shape: 'striped' },
              { label: `Target ${formatter(target)}`, shape: 'marker' },
            ]}
          />
        </div>
        <dl className='grid grid-cols-2 gap-4 border-t pt-4 @md:grid-cols-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Projected total</dt>
            <dd className='text-sm font-medium'>{formatter(projected)}</dd>
            <dd className='text-muted-foreground text-xs'>{share}% of target</dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              {gap >= 0 ? 'Projected over' : 'Projected short'}
            </dt>
            <dd className='text-sm font-medium'>{formatter(Math.abs(gap))}</dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Daily run-rate</dt>
            <dd className='text-sm font-medium'>{formatter(rate)}</dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Needed per day</dt>
            <dd className='text-sm font-medium'>
              {required === null
                ? '—'
                : required === 0
                  ? 'Target met'
                  : formatter(required)}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {remaining} {remaining === 1 ? 'day' : 'days'} left
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export { Forecast3, exampleProps as forecast3ExampleProps, type Forecast3Props }
