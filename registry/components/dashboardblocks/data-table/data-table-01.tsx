'use client'

import {
  createDataTableColumnHelper,
  DataTableContent,
  DataTableSortMenu,
  useDataTable,
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

const columnHelper = createDataTableColumnHelper<PageRow>()

const columns = columnHelper.columns([
  columnHelper.accessor('path', {
    header: 'Page',
    meta: { primary: true, truncate: true },
  }),
  columnHelper.accessor('visitors', {
    cell: ({ getValue }) => getValue().toLocaleString(),
    header: 'Visitors',
    meta: { align: 'end' },
  }),
  columnHelper.accessor('views', {
    cell: ({ getValue }) => getValue().toLocaleString(),
    header: 'Views',
    meta: { align: 'end' },
  }),
  columnHelper.accessor('bounceRate', {
    cell: ({ getValue }) => `${getValue()}%`,
    header: 'Bounce rate',
    meta: { align: 'end' },
  }),
  columnHelper.accessor('duration', {
    cell: ({ getValue }) => formatDuration(getValue()),
    header: 'Avg time',
    meta: { align: 'end' },
  }),
])

const DataTable1 = (props: DataTable1Props) => {
  const { description, rows, title } = props
  const table = useDataTable({
    columns,
    data: rows,
    initialState: { sorting: [{ desc: true, id: 'visitors' }] },
  })

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <DataTableSortMenu className='@2xl/data-table:hidden' table={table} />
        </CardAction>
      </CardHeader>
      <DataTableContent
        caption={`${title}, ${description.toLowerCase()}`}
        table={table}
      />
    </Card>
  )
}

export { DataTable1, exampleProps as dataTable1ExampleProps, type DataTable1Props }
