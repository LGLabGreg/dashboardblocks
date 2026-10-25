'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  DISTRIBUTION_THRESHOLD_COLOR,
  type DistributionBin,
  DistributionKey,
  Histogram,
  formatDistributionShare,
  getShareAbove,
  quantileFromBins,
} from '@/registry/components/dashboardblocks/distribution'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Distribution1Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  bins?: DistributionBin[]
  description: string
  formatter?: (value: number) => string
  limit?: { label: string; value: number }
  title: string
  /** @default 'requests' */
  unit?: string
}

const EDGES = [0, 25, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1_200, 1_600, 2_400]
const COUNTS = [
  1_820, 6_940, 11_260, 12_480, 18_950, 12_310, 11_870, 5_240, 3_120, 1_140, 620, 290,
  105,
]

const exampleProps: Distribution1Props = {
  bins: COUNTS.map((count, index) => ({ count, x0: EDGES[index], x1: EDGES[index + 1] })),
  description: 'API response times over the last 24 hours. Buckets widen as times grow.',
  formatter: (value) =>
    value >= 1_000
      ? `${formatNumber(value / 1_000)} s`
      : `${formatNumber(value, { maximumFractionDigits: 0 })} ms`,
  limit: { label: 'SLO', value: 800 },
  title: 'Response time distribution',
  unit: 'requests',
}

const Distribution1 = (props: Distribution1Props) => {
  const {
    bins = [],
    description,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    limit,
    errorMessage,
    status,
    title,
    unit = 'requests',
  } = props
  const state = getBlockState(status, bins)
  const blank = state === 'empty' || state === 'error'

  const total = bins.reduce((sum, bin) => sum + bin.count, 0)
  const percentiles = [
    { label: 'p50', value: quantileFromBins(bins, 0.5) },
    { label: 'p95', value: quantileFromBins(bins, 0.95) },
    { label: 'p99', value: quantileFromBins(bins, 0.99) },
  ]
  const over = limit ? getShareAbove(bins, limit.value) : 0
  const range = (bin: DistributionBin) => `${formatter(bin.x0)}–${formatter(bin.x1)}`

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-3 gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-4'>
          {limit && (
            <div className='col-span-3 flex flex-col gap-1 @md:col-span-1'>
              <dt className='text-muted-foreground text-sm'>Over the {limit.label}</dt>
              <dd>
                <KPIValue
                  value={over}
                  format={(value) => formatPercent(value, { minimumFractionDigits: 1 })}
                />
              </dd>
              <BlockReady className='text-xs'>
                <dd className='text-muted-foreground text-xs'>
                  of {formatNumber(total)} {unit} took over {formatter(limit.value)}
                </dd>
              </BlockReady>
            </div>
          )}
          {percentiles.map(
            (percentile, index) =>
              (!blank || (!limit && index === 0)) && (
                <div key={percentile.label} className='flex flex-col gap-1'>
                  <dt className='text-muted-foreground text-sm'>{percentile.label}</dt>
                  <dd>
                    <KPIValue
                      className={limit || index > 0 ? 'text-2xl' : undefined}
                      value={percentile.value}
                      format={formatter}
                    />
                  </dd>
                </div>
              ),
          )}
        </dl>
        {!blank && (
          <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
            <li className='flex items-center gap-1.5'>
              <DistributionKey shape='bar' />
              {unit.charAt(0).toUpperCase()}
              {unit.slice(1)}
            </li>
            {limit && (
              <li className='flex items-center gap-1.5'>
                <DistributionKey color={DISTRIBUTION_THRESHOLD_COLOR} shape='bar' />
                Over the {limit.label}
              </li>
            )}
            <li className='flex items-center gap-1.5'>
              <DistributionKey shape='median' />
              Percentiles
            </li>
          </ul>
        )}
        <Histogram
          aria-label={`${title} chart`}
          bins={bins}
          className='h-64'
          formatEdge={formatter}
          markers={percentiles}
          threshold={
            limit
              ? { label: `${limit.label} ${formatter(limit.value)}`, value: limit.value }
              : undefined
          }
          tickEvery={2}
          unit={unit}
        />
        <ChartPanelTable
          caption={`${title}: ${description} p50 ${formatter(percentiles[0].value)}, p95 ${formatter(percentiles[1].value)}, p99 ${formatter(percentiles[2].value)}.`}
          columns={[
            { key: 'label', label: 'Response time' },
            { key: 'count', label: unit.charAt(0).toUpperCase() + unit.slice(1) },
            { key: 'share', label: 'Share' },
          ]}
          rows={bins.map((bin) => ({
            count: formatNumber(bin.count),
            label: range(bin),
            share: formatDistributionShare(bin.count / (total || 1)),
          }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export {
  Distribution1,
  exampleProps as distribution1ExampleProps,
  type Distribution1Props,
}
