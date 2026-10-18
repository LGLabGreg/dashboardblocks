'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  BoxPlot,
  DistributionKey,
  getNiceTicks,
  quantile,
  summarize,
} from '@/registry/components/dashboardblocks/distribution'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

interface Distribution3Props {
  description: string
  formatter?: (value: number) => string
  status?: BlockStatus
  title: string
  /** @default 'orders' */
  unit?: string
  /** Raw values, in any order. Leave out, or pass none, to show the empty state. */
  values?: number[]
}

const exampleProps: Distribution3Props = {
  description: 'The value of every order placed in the last 7 days.',
  formatter: (value) => formatCurrency(value),
  title: 'Order value',
  unit: 'orders',
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
    formatter = (value) => formatNumber(value),
    status,
    title,
    unit = 'orders',
    values = [],
  } = props
  const state = getBlockState(status, values.length === 0)
  const blank = state === 'empty' || state === 'error'

  const sorted = [...values].sort((a, b) => a - b)
  const summary = summarize(sorted)
  const [p10, p25, p50, p75, p90] = PERCENTILES.map((p) => quantile(sorted, p))
  const skew = summary.median > 0 ? summary.mean / summary.median - 1 : 0
  const ticks = getNiceTicks(0, Math.max(p90, summary.mean), 4)
  const domain: [number, number] = [ticks[0], ticks[ticks.length - 1]]

  return (
    <BlockStateProvider status={status} empty={values.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-1 @md:col-span-1'>
            <dt className='text-muted-foreground text-sm'>Median</dt>
            <dd>
              <KPIValue value={summary.median} format={formatter} />
            </dd>
          </div>
          {!blank && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Mean</dt>
              <dd>
                <KPIValue className='text-2xl' value={summary.mean} format={formatter} />
              </dd>
            </div>
          )}
          {!blank && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>
                {unit.charAt(0).toUpperCase()}
                {unit.slice(1)}
              </dt>
              <dd>
                <KPIValue
                  className='text-2xl'
                  value={summary.count}
                  format={(value) => formatNumber(value)}
                />
              </dd>
            </div>
          )}
        </dl>
        <BlockReady className='text-sm'>
          <p className='text-muted-foreground text-sm'>
            {skew > 0.1
              ? `The mean is ${formatPercent(skew, { maximumFractionDigits: 0 })} above the median: a few large ${unit} pull it up, so the median is the typical one.`
              : skew < -0.1
                ? `The mean is ${formatPercent(-skew, { maximumFractionDigits: 0 })} below the median: a few small ${unit} pull it down, so the median is the typical one.`
                : 'The mean and median are close, so the spread is fairly even.'}
          </p>
        </BlockReady>
        {!blank && (
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
        )}
        <BoxPlot
          aria-label={`${title} chart`}
          domain={domain}
          format={formatter}
          rowHeight={56}
          rows={[
            {
              count: summary.count,
              high: p90,
              label: title,
              low: p10,
              mean: summary.mean,
              median: p50,
              q1: p25,
              q3: p75,
            },
          ]}
          ticks={ticks}
          unit={unit}
          whiskerLabel='10th–90th percentile'
        />
        {!blank && (
          <dl className='grid grid-cols-5 border-t pt-3'>
            {[p10, p25, p50, p75, p90].map((value, index) => (
              <div key={PERCENTILES[index]} className='flex flex-col gap-0.5'>
                <dt className='text-muted-foreground text-xs'>
                  p{Math.round(PERCENTILES[index] * 100)}
                </dt>
                <dd className='text-sm tabular-nums'>
                  {state ? <SkeletonText className='w-[3em]' /> : formatter(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Distribution3,
  exampleProps as distribution3ExampleProps,
  type Distribution3Props,
}
