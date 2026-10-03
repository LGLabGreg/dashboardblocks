'use client'

import {
  createDataTableColumnHelper,
  DataTableContent,
  DataTableSortMenu,
  useDataTable,
} from '@/registry/components/dashboardblocks/data-table'
import {
  StatusBadge,
  type StatusLevel,
} from '@/registry/components/dashboardblocks/status'

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ServiceRow {
  errorRate: number
  /** p95 latency in milliseconds. */
  latency: number
  name: string
  region: string
  status: StatusLevel
}

interface DataTable4Props {
  rows: ServiceRow[]
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

const STATUS_RANK: Record<StatusLevel, number> = {
  major: 5,
  partial: 4,
  degraded: 3,
  maintenance: 2,
  operational: 1,
  unknown: 0,
}

const columnHelper = createDataTableColumnHelper<ServiceRow>()

const columns = columnHelper.columns([
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
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    header: 'Status',
    id: 'status',
    meta: { cellClassName: '@max-2xl/data-table:col-span-2' },
  }),
  columnHelper.accessor('latency', {
    cell: ({ getValue, row }) =>
      row.original.status === 'maintenance' ? '—' : `${getValue().toLocaleString()} ms`,
    header: 'p95 latency',
    meta: { align: 'end' },
  }),
  columnHelper.accessor('errorRate', {
    cell: ({ getValue, row }) =>
      row.original.status === 'maintenance' ? '—' : `${getValue()}%`,
    header: 'Error rate',
    meta: { align: 'end' },
  }),
])

const DataTable4 = (props: DataTable4Props) => {
  const { rows, title } = props
  const table = useDataTable({
    columns,
    data: rows,
    initialState: { sorting: [{ desc: true, id: 'status' }] },
  })
  const affected = rows.filter((row) =>
    ['degraded', 'partial', 'major'].includes(row.status),
  ).length

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {affected === 0
            ? 'No services with issues'
            : `${affected} of ${rows.length} services with issues`}
        </CardDescription>
        <CardAction>
          <DataTableSortMenu className='@2xl/data-table:hidden' table={table} />
        </CardAction>
      </CardHeader>
      <DataTableContent caption={title} table={table} />
    </Card>
  )
}

export { DataTable4, exampleProps as dataTable4ExampleProps, type DataTable4Props }
