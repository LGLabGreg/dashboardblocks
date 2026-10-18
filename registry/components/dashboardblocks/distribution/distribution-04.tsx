'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  type DistributionBin,
  DistributionKey,
  Histogram,
  formatDistributionShare,
  quantileFromBins,
} from '@/registry/components/dashboardblocks/distribution'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Distribution4Props {
  /** Leave out, or pass none, to show the empty state. */
  current?: number[]
  /** @default 'This week' */
  currentLabel?: string
  description: string
  /** Bin edges, one more than the counts. */
  edges: number[]
  formatter?: (value: number) => string
  lowerIsBetter?: boolean
  previous?: number[]
  /** @default 'Last week' */
  previousLabel?: string
  status?: BlockStatus
  title: string
}

const exampleProps: Distribution4Props = {
  current: [1_240, 6_820, 11_480, 9_360, 5_910, 3_120, 1_640, 910, 480, 260, 140, 90],
  currentLabel: 'This week',
  description:
    'Largest contentful paint this week against last, as a share of each week.',
  edges: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
  formatter: (value) => `${formatNumber(value)} s`,
  lowerIsBetter: true,
  previous: [620, 3_940, 8_210, 9_870, 7_630, 5_020, 3_110, 1_890, 1_050, 610, 340, 210],
  previousLabel: 'Last week',
  title: 'Page load time',
}

const Distribution4 = (props: Distribution4Props) => {
  const {
    current = [],
    currentLabel = 'This week',
    description,
    edges,
    formatter = (value) => formatNumber(value),
    lowerIsBetter = true,
    previous = [],
    previousLabel = 'Last week',
    status,
    title,
  } = props
  const state = getBlockState(status, current.length === 0)

  const toBins = (counts: number[]): DistributionBin[] =>
    counts.map((count, index) => ({ count, x0: edges[index], x1: edges[index + 1] }))
  const bins = toBins(current)
  const previousBins = toBins(previous)
  const currentTotal = current.reduce((sum, count) => sum + count, 0) || 1
  const previousTotal = previous.reduce((sum, count) => sum + count, 0) || 1

  const stats = [
    { label: 'Median', p: 0.5 },
    { label: 'p90', p: 0.9 },
  ].map(({ label, p }) => ({
    before: quantileFromBins(previousBins, p),
    label,
    now: quantileFromBins(bins, p),
  }))
  const median = stats[0]

  return (
    <BlockStateProvider status={status} empty={current.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-1 gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-2'>
          {stats.map(
            (stat, index) =>
              (index === 0 || (state !== 'empty' && state !== 'error')) && (
                <div key={stat.label} className='flex flex-col gap-1'>
                  <dt className='text-muted-foreground text-sm'>
                    {stat.label}, {currentLabel.toLowerCase()}
                  </dt>
                  <dd>
                    <KPIValue
                      className={index === 0 ? undefined : 'text-2xl'}
                      value={stat.now}
                      format={formatter}
                    />
                  </dd>
                  <dd>
                    <KPIChange
                      comparison={previousLabel.toLowerCase()}
                      format={formatter}
                      goodDirection={lowerIsBetter ? 'down' : 'up'}
                      previous={stat.before}
                      value={stat.now}
                    />
                  </dd>
                </div>
              ),
          )}
        </dl>
        {state !== 'empty' && state !== 'error' && (
          <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
            <li className='flex items-center gap-1.5'>
              <DistributionKey shape='bar' />
              {currentLabel}
            </li>
            <li className='flex items-center gap-1.5'>
              <DistributionKey color='var(--color-muted-foreground)' shape='line' />
              {previousLabel}
            </li>
            <li className='flex items-center gap-1.5'>
              <DistributionKey shape='median' />
              Medians
            </li>
          </ul>
        )}
        <Histogram
          aria-label={`${title} chart`}
          bins={bins}
          className='h-60'
          compare={previous}
          compareLabel={previousLabel}
          formatEdge={formatter}
          label={currentLabel}
          markers={[
            { label: currentLabel, value: median.now },
            { label: previousLabel, value: median.before },
          ]}
          tickEvery={2}
        />
        <ChartPanelTable
          caption={`${title}: ${description} Median ${formatter(median.now)} ${currentLabel.toLowerCase()}, ${formatter(median.before)} ${previousLabel.toLowerCase()}.`}
          columns={[
            { key: 'label', label: 'Range' },
            { key: 'current', label: currentLabel },
            { key: 'previous', label: previousLabel },
          ]}
          rows={current.map((count, index) => ({
            current: formatDistributionShare(count / currentTotal),
            label: `${formatter(edges[index])}–${formatter(edges[index + 1])}`,
            previous: formatDistributionShare((previous[index] ?? 0) / previousTotal),
          }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export {
  Distribution4,
  exampleProps as distribution4ExampleProps,
  type Distribution4Props,
}
