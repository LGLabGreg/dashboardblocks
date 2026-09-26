'use client'

import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  type DistributionBin,
  DistributionKey,
  Histogram,
  quantileFromBins,
} from '@/registry/components/dashboardblocks/distribution'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Distribution4Props {
  /** Counts per bin now. */
  current: number[]
  /** @default 'This week' */
  currentLabel?: string
  description: string
  /** Bin edges, one more than the counts. */
  edges: number[]
  formatter?: (value: number) => string
  /** Whether lower values are better, as for load times. @default true */
  lowerIsBetter?: boolean
  /** Counts per bin before, in the same bins. */
  previous: number[]
  /** @default 'Last week' */
  previousLabel?: string
  title: string
}

const exampleProps: Distribution4Props = {
  current: [1_240, 6_820, 11_480, 9_360, 5_910, 3_120, 1_640, 910, 480, 260, 140, 90],
  currentLabel: 'This week',
  description: 'Largest contentful paint, this week against last',
  edges: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
  formatter: (value) =>
    `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })} s`,
  lowerIsBetter: true,
  previous: [620, 3_940, 8_210, 9_870, 7_630, 5_020, 3_110, 1_890, 1_050, 610, 340, 210],
  previousLabel: 'Last week',
  title: 'Page load time',
}

const Distribution4 = (props: Distribution4Props) => {
  const {
    current,
    currentLabel = 'This week',
    description,
    edges,
    formatter = (value) => value.toLocaleString(),
    lowerIsBetter = true,
    previous,
    previousLabel = 'Last week',
    title,
  } = props

  const toBins = (counts: number[]): DistributionBin[] =>
    counts.map((count, index) => ({ count, x0: edges[index], x1: edges[index + 1] }))
  const bins = toBins(current)
  const previousBins = toBins(previous)
  const currentTotal = current.reduce((sum, count) => sum + count, 0) || 1
  const previousTotal = previous.reduce((sum, count) => sum + count, 0) || 1
  const percent = (share: number) => `${(share * 100).toFixed(share < 0.01 ? 1 : 0)}%`

  const stats = [
    { label: 'Median', p: 0.5 },
    { label: 'p90', p: 0.9 },
  ].map(({ label, p }) => {
    const now = quantileFromBins(bins, p)
    const before = quantileFromBins(previousBins, p)
    const difference = now - before
    const better = lowerIsBetter ? difference < 0 : difference > 0
    return { before, better, difference, label, now }
  })
  const median = stats[0]

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='flex flex-wrap gap-x-10 gap-y-3'>
          {stats.map((stat) => (
            <div key={stat.label} className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>
                {stat.label}, {currentLabel.toLowerCase()}
              </dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {formatter(stat.now)}
              </dd>
              <dd
                className={cn(
                  'text-xs font-medium tabular-nums',
                  Math.abs(stat.difference) < 1e-9
                    ? 'text-muted-foreground'
                    : stat.better
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400',
                )}
              >
                {Math.abs(stat.difference) < 1e-9
                  ? `Same as ${previousLabel.toLowerCase()}`
                  : `${formatter(Math.abs(stat.difference))} ${stat.better ? 'better' : 'worse'} than ${previousLabel.toLowerCase()} (${formatter(stat.before)})`}
              </dd>
            </div>
          ))}
        </dl>
        <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='bar' />
            {currentLabel}
          </li>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='outline' />
            {previousLabel}
          </li>
          <li className='flex items-center gap-1.5'>
            <DistributionKey shape='median' />
            Medians
          </li>
        </ul>
        <Histogram
          bins={bins}
          className='h-60'
          compare={previous}
          describe={(index) =>
            `${formatter(edges[index])}–${formatter(edges[index + 1])}: ${percent(current[index] / currentTotal)} ${currentLabel.toLowerCase()}, ${percent((previous[index] ?? 0) / previousTotal)} ${previousLabel.toLowerCase()}`
          }
          formatEdge={formatter}
          markers={[
            { label: currentLabel, value: median.now },
            { label: previousLabel, value: median.before },
          ]}
          tickEvery={2}
        >
          Each bar is a share of its week, so weeks with more traffic compare fairly.
        </Histogram>
        <ChartPanelTable
          caption={`${title}: ${description}. Median ${formatter(median.now)} ${currentLabel.toLowerCase()}, ${formatter(median.before)} ${previousLabel.toLowerCase()}.`}
          columns={[
            { key: 'label', label: 'Range' },
            { key: 'current', label: currentLabel },
            { key: 'previous', label: previousLabel },
          ]}
          rows={current.map((count, index) => ({
            current: percent(count / currentTotal),
            label: `${formatter(edges[index])}–${formatter(edges[index + 1])}`,
            previous: percent((previous[index] ?? 0) / previousTotal),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export {
  Distribution4,
  exampleProps as distribution4ExampleProps,
  type Distribution4Props,
}
