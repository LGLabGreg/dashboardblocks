'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  HeatmapGrid,
  HeatmapLegend,
  getPeak,
} from '@/registry/components/dashboardblocks/heatmap'
import {
  Stat,
  StatGroup,
  StatLabel,
  StatValue,
} from '@/registry/components/dashboardblocks/stat-group'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Heatmap4Props {
  /** Defaults to a sentence about the windows over the target. */
  description?: string
  /** Leave out, with `values`, to show the empty state. */
  endpoints?: string[]
  status?: BlockStatus
  /** The p95 target in ms; windows over it get a dot. */
  target?: number
  title: string
  /** p95 latency in ms: one row per endpoint, one value per two-hour window. */
  values?: number[][]
}

const WINDOWS = Array.from({ length: 12 }, (_, index) =>
  String(index * 2).padStart(2, '0'),
)

const exampleProps: Heatmap4Props = {
  endpoints: [
    'GET /v1/products',
    'GET /v1/orders',
    'POST /v1/checkout',
    'POST /v1/search',
    'GET /v1/account',
    'POST /v1/webhooks',
  ],
  target: 800,
  title: 'Latency hot spots',
  values: [
    [110, 1.0],
    [160, 1.3],
    [420, 2.2],
    [260, 1.8],
    [90, 1.1],
    [210, 1.5],
  ].map(([base, load], row) =>
    WINDOWS.map((_, window) => {
      const traffic = Math.exp(-((window - 8) ** 2) / 6)
      const spike = row === 2 && window === 9 ? 1.6 : 1
      return Math.round(base * (1 + traffic * load) * spike)
    }),
  ),
}

const formatMs = (value: number) => `${formatNumber(value)} ms`
const windowRange = (index: number) =>
  `${WINDOWS[index]}:00–${String((index * 2 + 2) % 24).padStart(2, '0')}:00`

const Heatmap4 = (props: Heatmap4Props) => {
  const { endpoints = [], status, target, title, values = [] } = props
  const peak = getPeak(values)
  const windows = values.flat()
  const over = target === undefined ? [] : windows.filter((value) => value > target)
  const overEndpoints = values.filter((row) =>
    row.some((value) => target !== undefined && value > target),
  ).length
  const {
    description = target === undefined
      ? 'p95 latency by endpoint, in two-hour windows over the last 24 hours.'
      : `${formatNumber(over.length)} of ${formatNumber(windows.length)} two-hour windows went over the ${formatMs(target)} p95 target in the last 24 hours, across ${formatNumber(overEndpoints)} ${overEndpoints === 1 ? 'endpoint' : 'endpoints'}.`,
  } = props

  return (
    <BlockStateProvider state={getBlockState(status, peak)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <StatGroup className='grid-cols-1 @md:grid-cols-[2fr_1fr]'>
          <Stat>
            <StatLabel>Slowest window</StatLabel>
            <StatValue>
              {formatNumber(peak?.value ?? 0)}
              <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                ms
              </span>
            </StatValue>
            <BlockReady className='text-sm'>
              {peak && (
                <dd className='text-muted-foreground truncate text-sm'>
                  <span className='font-mono'>{endpoints[peak.row]}</span>,{' '}
                  {windowRange(peak.column)}
                </dd>
              )}
            </BlockReady>
          </Stat>
          {target !== undefined && (
            <Stat>
              <StatLabel>Over the target</StatLabel>
              <StatValue className='text-2xl'>
                {formatNumber(over.length)}
                <span className='text-muted-foreground ml-1 text-sm font-normal tracking-normal'>
                  of {formatNumber(windows.length)} windows
                </span>
              </StatValue>
            </Stat>
          )}
        </StatGroup>
        <HeatmapGrid
          cellClassName='h-7'
          cellName={({ column, row }) => `${endpoints[row]}, ${windowRange(column)}`}
          columnLabelEvery={2}
          columns={WINDOWS.map((window) => `${window}:00`)}
          describe={({ column, row }, value) =>
            `${endpoints[row]}, ${windowRange(column)}: ${value === null ? 'no data' : `${formatMs(value)} p95`}${value !== null && target !== undefined && value > target ? ', over target' : ''}`
          }
          flagged={target === undefined ? undefined : (_, value) => value > target}
          footer={
            <HeatmapLegend
              flag={target === undefined ? undefined : `Over ${formatMs(target)}`}
              high='Slower'
              low='Faster'
            />
          }
          format={formatMs}
          label={`${title}: p95 latency by endpoint, in two-hour windows over the last 24 hours`}
          minWidth='32rem'
          rowHeader='Endpoint'
          rowLabelClassName='font-mono'
          rows={endpoints}
          valueName='p95'
          values={values}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Heatmap4, exampleProps as heatmap4ExampleProps, type Heatmap4Props }
