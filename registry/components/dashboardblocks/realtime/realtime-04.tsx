'use client'

import {
  LiveBadge,
  LiveNumber,
  RollingBars,
  createRandom,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import { useRef, useState } from 'react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface TodayMetric {
  format?: (value: number) => string
  id: string
  label: string
  today: number
  /** The same metric yesterday, up to the same time of day. */
  yesterday: number
}

interface Realtime4Props {
  description: string
  /** Orders (or any count) per hour so far today, from midnight. */
  hourly: number[]
  /** Names what `hourly` counts. @default 'Orders' */
  hourlyLabel?: string
  metrics: TodayMetric[]
  /** Makes up updates every few seconds, for demos. Replace with your own feed. */
  simulate?: boolean
  title: string
}

const seed = createRandom(3)
const HOURLY = [12, 7, 4, 3, 4, 9, 22, 41, 63, 78, 86, 91, 88, 84, 57]

const exampleProps: Realtime4Props = {
  description: 'Since midnight, against yesterday at the same time',
  hourly: HOURLY.map((value) => Math.round(value * (0.9 + seed() * 0.2))),
  hourlyLabel: 'Orders',
  metrics: [
    { id: 'orders', label: 'Orders', today: 647, yesterday: 588 },
    {
      format: (value) => `$${(value / 1_000).toFixed(1)}K`,
      id: 'revenue',
      label: 'Revenue',
      today: 48_215,
      yesterday: 49_870,
    },
    { id: 'signups', label: 'Sign-ups', today: 132, yesterday: 104 },
  ],
  simulate: true,
  title: 'Today so far',
}

const Realtime4 = (props: Realtime4Props) => {
  const { description, hourlyLabel = 'Orders', simulate = false, title } = props
  const [metrics, setMetrics] = useState(props.metrics)
  const [hourly, setHourly] = useState(props.hourly)
  const random = useRef(createRandom(21))

  useInterval(
    () => {
      const next = random.current
      const orders = next() > 0.35 ? 1 + Math.floor(next() * 3) : 0
      setMetrics((list) =>
        list.map((metric) => {
          const bump =
            metric.id === 'orders'
              ? orders
              : metric.id === 'revenue'
                ? orders * (40 + next() * 80)
                : next() > 0.8
                  ? 1
                  : 0
          // Yesterday keeps pace too, so the comparison stays like-for-like.
          return {
            ...metric,
            today: metric.today + bump,
            yesterday: metric.yesterday + bump * (0.85 + next() * 0.2),
          }
        }),
      )
      if (orders) {
        setHourly((values) => [
          ...values.slice(0, -1),
          (values[values.length - 1] ?? 0) + orders,
        ])
      }
    },
    simulate ? 2_000 : null,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <LiveBadge />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-3 divide-x rounded-lg border'>
          {metrics.map((metric) => {
            const change = metric.yesterday > 0 ? metric.today / metric.yesterday - 1 : 0
            return (
              <div key={metric.id} className='flex min-w-0 flex-col gap-0.5 p-3'>
                <dt className='text-muted-foreground truncate text-xs'>{metric.label}</dt>
                <dd className='truncate text-xl font-semibold tracking-tight'>
                  <LiveNumber format={metric.format} value={metric.today} />
                </dd>
                <dd
                  className={cn(
                    'text-xs font-medium tabular-nums',
                    change >= 0
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400',
                  )}
                >
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change * 100).toFixed(0)}%
                  <span className='sr-only'>
                    {change >= 0 ? ' up' : ' down'} on yesterday at this time
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>
        <div className='flex flex-col gap-1.5'>
          <span className='text-muted-foreground text-xs'>{hourlyLabel} per hour</span>
          <RollingBars
            className='h-20'
            values={[
              ...hourly,
              ...Array.from({ length: Math.max(0, 24 - hourly.length) }, () => 0),
            ]}
            highlightLatest={false}
          />
          <div
            aria-hidden
            className='text-muted-foreground flex justify-between text-[11px]'
          >
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>12am</span>
          </div>
          <p className='sr-only'>
            {`${hourlyLabel} per hour today: ${hourly.join(', ')}. The current hour is still counting.`}
          </p>
        </div>
        <p className='text-muted-foreground text-xs'>
          Arrows compare with yesterday up to the same time.
        </p>
      </CardContent>
    </Card>
  )
}

export {
  Realtime4,
  exampleProps as realtime4ExampleProps,
  type Realtime4Props,
  type TodayMetric,
}
