'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  StatusIndicator,
  type StatusLevel,
  getWorstStatus,
  statusConfig,
} from '@/registry/components/dashboardblocks/status'
import {
  DataTable,
  DataTableBar,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Region {
  code: string
  /** Share of requests that failed, as a percentage. */
  errorRate: number
  /** p95, in milliseconds. */
  latency: number
  name: string
  status: StatusLevel
}

interface Status4Props extends BlockStateProps {
  /** Defaults to a sentence counting the healthy regions and naming the worst. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  regions?: Region[]
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
  const { regions = [], errorMessage, status, title } = props
  const { description = summarize(regions) } = props
  const state = getBlockState(status, regions)
  const slowest = Math.max(...regions.map((region) => region.latency), 0)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container/data-table flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <DataTable caption={title} className='border-t'>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Region</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead>p95 latency</DataTableHead>
              <DataTableHead align='end'>Errors</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableStateRows colSpan={4} rows={5} />
            {!state &&
              regions.map((region) => (
                <DataTableRow key={region.code}>
                  <DataTableRowHead primary>
                    <span className='block'>{region.name}</span>
                    <span className='text-muted-foreground block font-mono text-xs font-normal'>
                      {region.code}
                    </span>
                  </DataTableRowHead>
                  <DataTableCell>
                    <StatusIndicator status={region.status} />
                  </DataTableCell>
                  <DataTableCell className='w-2/5'>
                    <span className='flex w-full items-center gap-3'>
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
                      <span className='w-14 shrink-0 text-end tabular-nums'>
                        {region.latency > 0 ? `${formatNumber(region.latency)} ms` : '—'}
                      </span>
                    </span>
                  </DataTableCell>
                  <DataTableCell align='end'>
                    {formatErrors(region.errorRate)}
                  </DataTableCell>
                </DataTableRow>
              ))}
          </DataTableBody>
        </DataTable>
      </section>
    </BlockStateProvider>
  )
}

export { Status4, exampleProps as status4ExampleProps, type Status4Props }
