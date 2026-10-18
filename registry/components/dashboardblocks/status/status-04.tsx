'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { DataTableBar } from '@/registry/components/dashboardblocks/data-table'
import {
  StatusIndicator,
  type StatusLevel,
  getWorstStatus,
  statusConfig,
} from '@/registry/components/dashboardblocks/status'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Region {
  code: string
  /** Share of requests that failed, as a percentage. */
  errorRate: number
  /** p95, in milliseconds. */
  latency: number
  name: string
  status: StatusLevel
}

interface Status4Props {
  /** Defaults to a sentence counting the healthy regions and naming the worst. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  regions?: Region[]
  status?: BlockStatus
  title: string
}

const exampleProps: Status4Props = {
  regions: [
    {
      code: 'us-east-1',
      errorRate: 0.02,
      latency: 48,
      name: 'N. Virginia',
      status: 'operational',
    },
    {
      code: 'us-west-2',
      errorRate: 0.03,
      latency: 61,
      name: 'Oregon',
      status: 'operational',
    },
    {
      code: 'eu-west-1',
      errorRate: 0.41,
      latency: 212,
      name: 'Ireland',
      status: 'degraded',
    },
    {
      code: 'eu-central-1',
      errorRate: 0.01,
      latency: 57,
      name: 'Frankfurt',
      status: 'operational',
    },
    {
      code: 'ap-south-1',
      errorRate: 4.8,
      latency: 890,
      name: 'Mumbai',
      status: 'partial',
    },
    {
      code: 'ap-northeast-1',
      errorRate: 0.02,
      latency: 73,
      name: 'Tokyo',
      status: 'operational',
    },
  ],
  title: 'Region health',
}

const ROW =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1.5 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_4rem]'

const formatErrors = (percent: number) =>
  formatPercent(percent / 100, { maximumFractionDigits: 2 })

const summarize = (regions: Region[]) => {
  const healthy = regions.filter((region) => region.status === 'operational').length
  const count = `${healthy} of ${regions.length} regions healthy.`
  const worstStatus = getWorstStatus(regions.map((region) => region.status))
  const worst = regions
    .filter((region) => region.status === worstStatus)
    .sort((a, b) => b.errorRate - a.errorRate)[0]
  if (!worst || worstStatus === 'operational') return count
  return `${count} ${worst.name} ${statusConfig[worst.status].phrase}, with ${formatErrors(worst.errorRate)} of requests failing.`
}

const Status4 = (props: Status4Props) => {
  const { regions = [], status, title } = props
  const { description = summarize(regions) } = props
  const state = getBlockState(status, regions)
  const slowest = Math.max(...regions.map((region) => region.latency), 0)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div
          aria-hidden
          className={cn(
            ROW,
            'text-muted-foreground hidden border-t pt-2 text-xs @xl:grid',
          )}
        >
          <span>Region</span>
          <span>Status</span>
          <span>p95 latency</span>
          <span className='text-right'>Errors</span>
        </div>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={5} />
          </div>
        )}
        {!state && (
          <ul className='flex flex-col border-t'>
            {regions.map((region) => (
              <li key={region.code} className={cn(ROW, 'border-b py-2.5')}>
                <div className='flex min-w-0 flex-col'>
                  <span className='truncate text-sm font-medium'>{region.name}</span>
                  <span className='text-muted-foreground truncate font-mono text-xs'>
                    {region.code}
                  </span>
                </div>
                <StatusIndicator
                  className='justify-self-end @xl:justify-self-start'
                  status={region.status}
                />
                <div className='flex min-w-0 items-center gap-3'>
                  <DataTableBar
                    className='flex-1'
                    color={
                      region.status === 'operational'
                        ? undefined
                        : statusConfig[region.status].color
                    }
                    max={slowest}
                    value={region.latency}
                  />
                  <span className='w-14 shrink-0 text-right text-sm tabular-nums'>
                    <span className='sr-only'>p95 latency </span>
                    {region.latency > 0 ? `${formatNumber(region.latency)} ms` : '—'}
                  </span>
                </div>
                <span className='text-muted-foreground text-right text-sm tabular-nums'>
                  <span className='text-foreground'>
                    {formatErrors(region.errorRate)}
                  </span>
                  <span className='@xl:sr-only'> errors</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Status4, exampleProps as status4ExampleProps, type Status4Props }
