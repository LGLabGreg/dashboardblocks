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
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface PageRow {
  bounceRate: number
  /** Average time on page, in seconds. */
  duration: number
  path: string
  views: number
  visitors: number
}

interface DataTable1Props {
  description: string
  rows: PageRow[]
  title: string
}

const exampleProps: DataTable1Props = {
  description: 'Last 30 days',
  rows: [
    { bounceRate: 38, duration: 102, path: '/', views: 61_240, visitors: 18_420 },
    { bounceRate: 29, duration: 148, path: '/pricing', views: 21_860, visitors: 9_312 },
    {
      bounceRate: 22,
      duration: 263,
      path: '/docs/getting-started',
      views: 19_470,
      visitors: 7_845,
    },
    {
      bounceRate: 61,
      duration: 71,
      path: '/blog/launch-week',
      views: 8_930,
      visitors: 5_127,
    },
    {
      bounceRate: 34,
      duration: 184,
      path: '/docs/components',
      views: 12_310,
      visitors: 4_906,
    },
    { bounceRate: 47, duration: 95, path: '/changelog', views: 6_120, visitors: 3_284 },
    { bounceRate: 18, duration: 52, path: '/signup', views: 4_410, visitors: 2_971 },
  ],
  title: 'Top pages',
}

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`

type SortKey = 'bounceRate' | 'duration' | 'path' | 'views' | 'visitors'

const COLUMNS: { align?: 'end'; key: SortKey; label: string }[] = [
  { key: 'path', label: 'Page' },
  { align: 'end', key: 'visitors', label: 'Visitors' },
  { align: 'end', key: 'views', label: 'Views' },
  { align: 'end', key: 'bounceRate', label: 'Bounce rate' },
  { align: 'end', key: 'duration', label: 'Avg time' },
]

const DataTable1 = (props: DataTable1Props) => {
  const { description, rows, title } = props
  const { setSort, sort, sorted, toggleSort } = useTableSort<PageRow, SortKey>(
    rows,
    {
      bounceRate: (row) => row.bounceRate,
      duration: (row) => row.duration,
      path: (row) => row.path,
      views: (row) => row.views,
      visitors: (row) => row.visitors,
    },
    { direction: 'descending', key: 'visitors' },
  )

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
        <caption className='sr-only'>
          {title}, {description.toLowerCase()}
        </caption>
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
          {sorted.map((row) => (
            <DataTableRow key={row.path}>
              <DataTableCell primary truncate>
                {row.path}
              </DataTableCell>
              <DataTableCell align='end' label='Visitors'>
                {row.visitors.toLocaleString()}
              </DataTableCell>
              <DataTableCell align='end' label='Views'>
                {row.views.toLocaleString()}
              </DataTableCell>
              <DataTableCell align='end' label='Bounce rate'>
                {row.bounceRate}%
              </DataTableCell>
              <DataTableCell align='end' label='Avg time'>
                {formatDuration(row.duration)}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { DataTable1, exampleProps as dataTable1ExampleProps, type DataTable1Props }
