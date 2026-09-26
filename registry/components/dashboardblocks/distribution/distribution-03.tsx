'use client'

import {
  BoxPlot,
  DistributionAxis,
  DistributionKey,
  getNiceTicks,
  quantile,
  summarize,
} from '@/registry/components/dashboardblocks/distribution'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Distribution3Props {
  description: string
  formatter?: (value: number) => string
  title: string
  /** @default 'orders' */
  unit?: string
  /** Raw values, in any order. */
  values: number[]
}

const exampleProps: Distribution3Props = {
  description: 'Orders placed in the last 7 days',
  formatter: (value) =>
    value.toLocaleString('en-US', {
      currency: 'USD',
      maximumFractionDigits: 0,
      style: 'currency',
    }),
  title: 'Order value',
  unit: 'orders',
  // Most orders are small, and a long tail of large ones pulls the mean up.
  // Integer hashing, not Math.sin, so the server and the browser agree.
  values: Array.from({ length: 420 }, (_, index) => {
    const u = ((index * 2_654_435_761 + 12_345) % 4_294_967_296) / 4_294_967_296
    return Math.round(
      18 + 52 * Math.exp(1.05 * Math.sqrt(-2 * Math.log(1 - u * 0.999)) - 0.9),
    )
  }),
}

const PERCENTILES = [0.1, 0.25, 0.5, 0.75, 0.9]

const Distribution3 = (props: Distribution3Props) => {
  const {
    description,
    formatter = (value) => value.toLocaleString(),
    title,
    unit = 'orders',
    values,
  } = props

  const sorted = [...values].sort((a, b) => a - b)
  const summary = summarize(sorted)
  const [p10, p25, p50, p75, p90] = PERCENTILES.map((p) => quantile(sorted, p))
  const skew = summary.median > 0 ? summary.mean / summary.median - 1 : 0
  const ticks = getNiceTicks(0, Math.max(p90, summary.mean), 4)
  const domain: [number, number] = [ticks[0], ticks[ticks.length - 1]]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='flex flex-wrap gap-x-8 gap-y-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Median</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatter(summary.median)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Mean</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatter(summary.mean)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              {unit.charAt(0).toUpperCase()}
              {unit.slice(1)}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {summary.count.toLocaleString()}
            </dd>
          </div>
        </dl>
        <div className='flex flex-col gap-1.5'>
          <BoxPlot
            domain={domain}
            high={p90}
            low={p10}
            mean={summary.mean}
            median={p50}
            q1={p25}
            q3={p75}
          />
          <DistributionAxis domain={domain} format={formatter} ticks={ticks} />
        </div>
        <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='box' />
            Middle half
          </li>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='median' />
            Median
          </li>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='mean' />
            Mean
          </li>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='whisker' />
            10th–90th percentile
          </li>
        </ul>
        <dl className='grid grid-cols-5 divide-x rounded-lg border text-center'>
          {[p10, p25, p50, p75, p90].map((value, index) => (
            <div key={PERCENTILES[index]} className='flex flex-col gap-0.5 px-1 py-2'>
              <dt className='text-muted-foreground text-[11px]'>
                p{Math.round(PERCENTILES[index] * 100)}
              </dt>
              <dd className='text-sm font-medium tabular-nums'>{formatter(value)}</dd>
            </div>
          ))}
        </dl>
        <p className='text-muted-foreground text-sm'>
          {skew > 0.1
            ? `The mean is ${Math.round(skew * 100)}% above the median: a few large ${unit} pull it up, so the median is the typical one.`
            : skew < -0.1
              ? `The mean is ${Math.round(-skew * 100)}% below the median: a few small ${unit} pull it down, so the median is the typical one.`
              : 'The mean and median are close, so the spread is fairly even.'}
        </p>
      </CardContent>
    </Card>
  )
}

export {
  Distribution3,
  exampleProps as distribution3ExampleProps,
  type Distribution3Props,
}
