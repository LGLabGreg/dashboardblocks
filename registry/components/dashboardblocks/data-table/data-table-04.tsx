'use client'

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableRow,
  DataTableSortHead,
  DataTableSortMenu,
  useTableSort,
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

/** Worst first when sorted high to low. */
const STATUS_RANK: Record<StatusLevel, number> = {
  major: 5,
  partial: 4,
  degraded: 3,
  maintenance: 2,
  operational: 1,
  unknown: 0,
}

type SortKey = 'errorRate' | 'latency' | 'name' | 'status'

const COLUMNS: { align?: 'end'; key: SortKey; label: string }[] = [
  { key: 'name', label: 'Service' },
  { key: 'status', label: 'Status' },
  { align: 'end', key: 'latency', label: 'p95 latency' },
  { align: 'end', key: 'errorRate', label: 'Error rate' },
]

const DataTable4 = (props: DataTable4Props) => {
  const { rows, title } = props
  const { setSort, sort, sorted, toggleSort } = useTableSort<ServiceRow, SortKey>(
    rows,
    {
      errorRate: (row) => row.errorRate,
      latency: (row) => row.latency,
      name: (row) => row.name,
      status: (row) => STATUS_RANK[row.status],
    },
    { direction: 'descending', key: 'status' },
  )
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
          <DataTableSortMenu
            className='@2xl/data-table:hidden'
            columns={COLUMNS}
            onSortChange={setSort}
            sort={sort}
          />
        </CardAction>
      </CardHeader>
      <DataTable>
        <caption className='sr-only'>{title}</caption>
        <DataTableHeader>
          <DataTableRow>
            {COLUMNS.map((column) => (
              <DataTableSortHead
                key={column.key}
                align={column.align}
                label={column.label}
                onSort={toggleSort}
                sort={sort}
                sortKey={column.key}
              />
            ))}
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {sorted.map((row) => {
            const measured = row.status !== 'maintenance'
            return (
              <DataTableRow key={row.name}>
                <DataTableCell primary truncate>
                  <span className='block truncate'>{row.name}</span>
                  <span className='text-muted-foreground block text-xs font-normal'>
                    {row.region}
                  </span>
                </DataTableCell>
                <DataTableCell label='Status' className='@max-2xl/data-table:col-span-2'>
                  <StatusBadge status={row.status} />
                </DataTableCell>
                <DataTableCell align='end' label='p95 latency'>
                  {measured ? `${row.latency.toLocaleString()} ms` : '—'}
                </DataTableCell>
                <DataTableCell align='end' label='Error rate'>
                  {measured ? `${row.errorRate}%` : '—'}
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { DataTable4, exampleProps as dataTable4ExampleProps, type DataTable4Props }
