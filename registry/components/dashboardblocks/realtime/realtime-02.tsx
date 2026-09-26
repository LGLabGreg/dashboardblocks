'use client'

import {
  ChartPanelFigure,
  chartAxisProps,
  chartGridProps,
  formatCompact,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  LiveBadge,
  LiveNumber,
  RollingBars,
  createRandom,
  pushWindow,
  useInterval,
} from '@/registry/components/dashboardblocks/realtime'
import { useRef, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, YAxis } from 'recharts'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ThroughputSample {
  errors: number
  requests: number
}

interface Realtime2Props {
  description: string
  /** One sample per interval, oldest first. */
  samples: ThroughputSample[]
  /** Seconds between samples. @default 5 */
  interval?: number
  /** Makes up a new sample every interval, for demos. Replace with your own feed. */
  simulate?: boolean
  title: string
}

const seed = createRandom(11)
const makeSample = (random: () => number, index: number): ThroughputSample => {
  // A slow triangle wave, not Math.sin, so the server and browser agree.
  const wave = index % 28 < 14 ? index % 14 : 14 - (index % 14)
  const requests = Math.round(780 + wave * 16 + random() * 90)
  const spike = random() > 0.93
  return {
    errors: Math.round(requests * (spike ? 0.02 + random() * 0.02 : random() * 0.004)),
    requests,
  }
}

const exampleProps: Realtime2Props = {
  description: 'Requests per second across all regions, last 5 minutes',
  samples: Array.from({ length: 60 }, (_, index) => makeSample(seed, index)),
  simulate: true,
  title: 'Throughput',
}

const Realtime2 = (props: Realtime2Props) => {
  const { description, interval = 5, simulate = false, title } = props
  const [samples, setSamples] = useState(props.samples)
  const random = useRef(createRandom(99))
  const tick = useRef(props.samples.length)

  useInterval(
    () => {
      tick.current += 1
      setSamples((values) =>
        pushWindow(values, makeSample(random.current, tick.current), values.length),
      )
    },
    // Faster than real time in the demo, so the change is visible.
    simulate ? 1_500 : null,
  )

  const latest = samples[samples.length - 1] ?? { errors: 0, requests: 0 }
  const peak = Math.max(0, ...samples.map((sample) => sample.requests))
  const totals = samples.reduce(
    (sum, sample) => ({
      errors: sum.errors + sample.errors,
      requests: sum.requests + sample.requests,
    }),
    { errors: 0, requests: 0 },
  )
  const errorRate = totals.requests > 0 ? totals.errors / totals.requests : 0
  const rows = samples.map((sample, index) => ({ ...sample, index }))
  const minutes = Math.round((samples.length * interval) / 60)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <LiveBadge />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-3 gap-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Requests/s</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              <LiveNumber value={latest.requests} />
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Peak, {minutes} min</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              <LiveNumber value={peak} />
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Error rate</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              <LiveNumber
                format={(value) => `${value.toFixed(2)}%`}
                value={errorRate * 100}
              />
            </dd>
          </div>
        </dl>
        <div className='flex flex-col gap-1'>
          <span className='text-muted-foreground text-xs'>Requests per second</span>
          <ChartPanelFigure className='h-40'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={rows} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id='realtime-2-fill' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='var(--chart-1)' stopOpacity={0.35} />
                    <stop offset='100%' stopColor='var(--chart-1)' stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGridProps} />
                <YAxis
                  {...chartAxisProps}
                  domain={[0, 'auto']}
                  tickFormatter={formatCompact}
                  width={44}
                />
                <Area
                  dataKey='requests'
                  fill='url(#realtime-2-fill)'
                  isAnimationActive={false}
                  stroke='var(--chart-1)'
                  strokeWidth={2}
                  type='monotone'
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-muted-foreground text-xs'>Errors per second</span>
          <RollingBars
            className='h-8 pl-[52px]'
            color='var(--destructive)'
            highlightLatest={false}
            values={samples.map((sample) => sample.errors)}
          />
          <div
            aria-hidden
            className='text-muted-foreground flex justify-between pl-[52px] text-[11px]'
          >
            <span>{minutes} min ago</span>
            <span>now</span>
          </div>
        </div>
        <p className='sr-only'>
          {`Latest: ${latest.requests} requests and ${latest.errors} errors per second. Peak ${peak} requests per second in the last ${minutes} minutes.`}
        </p>
      </CardContent>
    </Card>
  )
}

export {
  Realtime2,
  exampleProps as realtime2ExampleProps,
  type Realtime2Props,
  type ThroughputSample,
}
