'use client'

import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  type DistributionBin,
  DistributionKey,
  Histogram,
  getShareAbove,
  quantileFromBins,
} from '@/registry/components/dashboardblocks/distribution'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Distribution1Props {
  /** Counts per bucket, e.g. from a metrics backend. Buckets can be uneven. */
  bins: DistributionBin[]
  description: string
  /** Formats a value in the unit, e.g. 240 → "240 ms". */
  formatter?: (value: number) => string
  /** A target the slowest requests are measured against. */
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
  description: 'API response times, last 24 hours',
  formatter: (value) =>
    value >= 1_000
      ? `${(value / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 })} s`
      : `${Math.round(value)} ms`,
  limit: { label: 'SLO', value: 800 },
  title: 'Response time distribution',
  unit: 'requests',
}

const Distribution1 = (props: Distribution1Props) => {
  const {
    bins,
    description,
    formatter = (value) => Math.round(value).toLocaleString(),
    limit,
    title,
    unit = 'requests',
  } = props

  const total = bins.reduce((sum, bin) => sum + bin.count, 0)
  const percentiles = [
    { label: 'p50', value: quantileFromBins(bins, 0.5) },
    { label: 'p95', value: quantileFromBins(bins, 0.95) },
    { label: 'p99', value: quantileFromBins(bins, 0.99) },
  ]
  const over = limit ? getShareAbove(bins, limit.value) : 0
  const share = (count: number) =>
    `${((count / (total || 1)) * 100).toFixed(count / (total || 1) < 0.01 ? 1 : 0)}%`
  const range = (bin: DistributionBin) => `${formatter(bin.x0)}–${formatter(bin.x1)}`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-4'>
          {percentiles.map((percentile) => (
            <div key={percentile.label} className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>{percentile.label}</dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {formatter(percentile.value)}
              </dd>
            </div>
          ))}
          {limit && (
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>
                Over {limit.label}, {formatter(limit.value)}
              </dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {(over * 100).toFixed(1)}%
              </dd>
            </div>
          )}
        </dl>
        <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='bar' />
            {unit.charAt(0).toUpperCase()}
            {unit.slice(1)}
          </li>
          {limit && (
            <li className='flex items-center gap-1.5'>
              <DistributionKey
                color='color-mix(in oklab, var(--destructive) 70%, var(--card))'
                shape='bar'
              />
              Over {limit.label}
            </li>
          )}
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='median' />
            Percentiles
          </li>
        </ul>
        <Histogram
          bins={bins}
          className='h-64'
          describe={(index) =>
            `${range(bins[index])}: ${bins[index].count.toLocaleString()} ${unit} (${share(bins[index].count)})`
          }
          formatEdge={formatter}
          markers={percentiles.map((percentile) => ({
            label: percentile.label,
            value: percentile.value,
          }))}
          threshold={
            limit
              ? { label: `${limit.label} ${formatter(limit.value)}`, value: limit.value }
              : undefined
          }
          tickEvery={2}
        >
          {`${total.toLocaleString()} ${unit}. Buckets widen as times grow, so the axis is uneven.`}
        </Histogram>
        <ChartPanelTable
          caption={`${title}: ${description}. p50 ${formatter(percentiles[0].value)}, p95 ${formatter(percentiles[1].value)}, p99 ${formatter(percentiles[2].value)}.`}
          columns={[
            { key: 'label', label: 'Response time' },
            { key: 'count', label: unit.charAt(0).toUpperCase() + unit.slice(1) },
            { key: 'share', label: 'Share' },
          ]}
          rows={bins.map((bin) => ({
            count: bin.count.toLocaleString(),
            label: range(bin),
            share: share(bin.count),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export {
  Distribution1,
  exampleProps as distribution1ExampleProps,
  type Distribution1Props,
}
