'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  createDataTableColumnHelper,
  DataTableContent,
  DataTableSortMenu,
  useDataTable,
} from '@/registry/components/dashboardblocks/data-table'
import type { StatusLevel } from '@/registry/components/dashboardblocks/status'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

interface ServiceRow {
  errorRate: number
  /** p95 latency in milliseconds. */
  latency: number
  name: string
  region: string
  status: StatusLevel
}

interface DataTable4Props {
  /** Defaults to a sentence naming the services with issues. */
  description?: string
  /** An error rate above this, in percent, shows in red. @default 1 */
  errorRateLimit?: number
  /** A p95 latency above this, in milliseconds, shows in red. @default 500 */
  latencyLimit?: number
  /** Leave out, or pass none, to show the empty state. */
  rows?: ServiceRow[]
  status?: BlockStatus
  title: string
}

const exampleProps: DataTable4Props = {
  rows: [
    {
      errorRate: 0.02,
      latency: 118,
      name: 'API gateway',
      region: 'us-east-1',
      status: 'operational',
    },
    {
      errorRate: 1.84,
      latency: 642,
      name: 'Search',
      region: 'eu-west-1',
      status: 'degraded',
    },
    {
      errorRate: 0.05,
      latency: 96,
      name: 'Auth',
      region: 'us-east-1',
      status: 'operational',
    },
    {
      errorRate: 12.6,
      latency: 2_310,
      name: 'Webhooks',
      region: 'ap-southeast-2',
      status: 'partial',
    },
    {
      errorRate: 0,
      latency: 0,
      name: 'Billing',
      region: 'us-west-2',
      status: 'maintenance',
    },
    {
      errorRate: 0.11,
      latency: 184,
      name: 'Media uploads',
      region: 'eu-central-1',
      status: 'operational',
    },
  ],
  title: 'Services',
}

const STATUS: Record<StatusLevel, { label: string; tone: StatusTone }> = {
  degraded: { label: 'Degraded', tone: 'warning' },
  maintenance: { label: 'Maintenance', tone: 'info' },
  major: { label: 'Major outage', tone: 'bad' },
  operational: { label: 'Operational', tone: 'good' },
  partial: { label: 'Partial outage', tone: 'bad' },
  unknown: { label: 'No data', tone: 'neutral' },
}

const STATUS_RANK: Record<StatusLevel, number> = {
  major: 5,
  partial: 4,
  degraded: 3,
  maintenance: 2,
  operational: 1,
  unknown: 0,
}

const AFFECTED: StatusLevel[] = ['degraded', 'partial', 'major']

const summarize = (rows: ServiceRow[]) => {
  const affected = rows
    .filter((row) => AFFECTED.includes(row.status))
    .sort((a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status])
  const worst = affected[0]
  if (!worst) return `All ${rows.length} services are running normally.`
  return `${affected.length} of ${rows.length} services with issues; ${worst.name} is failing ${formatPercent(worst.errorRate / 100)} of requests.`
}

const overLimit = 'font-medium text-red-700 dark:text-red-400'

const noRows: ServiceRow[] = []

const columnHelper = createDataTableColumnHelper<ServiceRow>()

const getColumns = (latencyLimit: number, errorRateLimit: number) =>
  columnHelper.columns([
    columnHelper.accessor('name', {
      cell: ({ row }) => (
        <>
          <span className='block truncate'>{row.original.name}</span>
          <span className='text-muted-foreground block text-xs font-normal'>
            {row.original.region}
          </span>
        </>
      ),
      header: 'Service',
      meta: { primary: true, truncate: true },
    }),
    columnHelper.accessor((row) => STATUS_RANK[row.status], {
      cell: ({ row }) => {
        const status = STATUS[row.original.status]
        return <StatusLabel tone={status.tone}>{status.label}</StatusLabel>
      },
      header: 'Status',
      id: 'status',
      meta: { cellClassName: '@max-2xl/data-table:col-span-2' },
    }),
    columnHelper.accessor('latency', {
      cell: ({ getValue, row }) =>
        row.original.status === 'maintenance' ? (
          '—'
        ) : (
          <span className={cn(getValue() > latencyLimit && overLimit)}>
            {formatNumber(getValue())} ms
          </span>
        ),
      header: 'p95 latency',
      meta: { align: 'end' },
    }),
    columnHelper.accessor('errorRate', {
      cell: ({ getValue, row }) =>
        row.original.status === 'maintenance' ? (
          '—'
        ) : (
          <span className={cn(getValue() > errorRateLimit && overLimit)}>
            {formatPercent(getValue() / 100, { maximumFractionDigits: 2 })}
          </span>
        ),
      header: 'Error rate',
      meta: { align: 'end' },
    }),
  ])

const DataTable4 = (props: DataTable4Props) => {
  const { errorRateLimit = 1, latencyLimit = 500, rows = noRows, status, title } = props
  const { description = summarize(rows) } = props
  const columns = useMemo(
    () => getColumns(latencyLimit, errorRateLimit),
    [latencyLimit, errorRateLimit],
  )
  const table = useDataTable({
    columns,
    data: rows,
    initialState: { sorting: [{ desc: true, id: 'status' }] },
  })

  return (
    <BlockStateProvider status={status} empty={rows.length === 0}>
      <section className='@container/data-table flex flex-col gap-3 [--data-table-inset:0px]'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          <DataTableSortMenu className='@2xl/data-table:hidden' table={table} />
        </header>
        <DataTableContent
          caption={`${title}: ${description}`}
          loadingRows={6}
          table={table}
        />
      </section>
    </BlockStateProvider>
  )
}

export { DataTable4, exampleProps as dataTable4ExampleProps, type DataTable4Props }
