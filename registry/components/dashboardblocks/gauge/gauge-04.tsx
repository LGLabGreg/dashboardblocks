'use client'

import {
  Gauge,
  GaugeTargetKey,
  GaugeToneBadge,
} from '@/registry/components/dashboardblocks/gauge'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Gauge4Props {
  description: string
  /** How the score is measured, shown under the numbers. */
  footnote?: string
  formatter?: (value: number) => string
  /** @default 100 */
  max?: number
  /** @default 0 */
  min?: number
  /** Last period's score. */
  previous: number
  /** Formats the ends of the scale. Defaults to `formatter`. */
  scaleFormatter?: (value: number) => string
  target: number
  title: string
  value: number
}

const exampleProps: Gauge4Props = {
  description: 'September vs August',
  footnote: 'Share of 4 and 5 star ratings, from 2,318 surveys',
  formatter: (value) => `${value.toFixed(1)}%`,
  previous: 81.2,
  scaleFormatter: (value) => `${value}%`,
  target: 85,
  title: 'Customer satisfaction',
  value: 83.6,
}

const formatPoints = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(1)} pts`

const Gauge4 = (props: Gauge4Props) => {
  const {
    description,
    footnote,
    formatter = (value) => value.toLocaleString(),
    max = 100,
    min = 0,
    previous,
    scaleFormatter = formatter,
    target,
    title,
    value,
  } = props
  const gap = value - target
  const met = gap >= 0

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <GaugeToneBadge
            label={met ? 'Target met' : 'Below target'}
            tone={met ? 'positive' : 'caution'}
          />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-6 @md:flex-row @md:items-end'>
        <Gauge
          className='w-full max-w-56 @md:w-52'
          formatScale={scaleFormatter}
          label={title}
          max={max}
          min={min}
          target={target}
          value={value}
          valueText={`${formatter(value)}, target ${formatter(target)}`}
        >
          <span className='text-3xl font-semibold tracking-tight tabular-nums'>
            {formatter(value)}
          </span>
        </Gauge>
        <div className='flex w-full min-w-0 flex-col gap-3'>
          <dl className='grid grid-cols-2 gap-4 @md:grid-cols-1 @md:gap-3'>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>Change vs last period</dt>
              <dd className='flex flex-wrap items-center gap-x-2'>
                <Trend trend={value - previous} formatter={formatPoints} />
                <span className='text-muted-foreground text-xs tabular-nums'>
                  from {formatter(previous)}
                </span>
              </dd>
            </div>
            <div className='flex flex-col gap-0.5'>
              <dt>
                <GaugeTargetKey />
              </dt>
              <dd className='text-sm font-medium tabular-nums'>
                {formatter(target)}
                <span className='text-muted-foreground font-normal'>
                  {' '}
                  · {Math.abs(gap).toFixed(1)} pts {met ? 'above' : 'to go'}
                </span>
              </dd>
            </div>
          </dl>
          {footnote && (
            <p className='text-muted-foreground border-t pt-3 text-xs'>{footnote}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { Gauge4, exampleProps as gauge4ExampleProps, type Gauge4Props }
