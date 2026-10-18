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
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface PageRow {
  bounceRate: number
  /** Average time on page, in seconds. */
  duration: number
  path: string
  views: number
  visitors: number
}

interface DataTable1Props {
  /** Defaults to a sentence counting page views and the top page's share. */
  description?: string
  /** Follows the page view count in the default description. */
  period?: string
  /** Leave out, or pass none, to show the empty state. */
  rows?: PageRow[]
  status?: BlockStatus
  title: string
}

const exampleProps: DataTable1Props = {
  period: 'in the last 30 days',
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

const summarize = (rows: PageRow[], period?: string) => {
  const views = rows.reduce((sum, row) => sum + row.views, 0)
  const top = rows.reduce<PageRow | undefined>(
    (best, row) => (best && best.views >= row.views ? best : row),
    undefined,
  )
  if (!top || views === 0) return `No page views${period ? ` ${period}` : ''}.`
  return `${formatNumber(views)} page views${period ? ` ${period}` : ''}; the top page, ${top.path}, gets ${formatPercent(top.views / views, { maximumFractionDigits: 0 })} of them.`
}

const noRows: PageRow[] = []

const columnHelper = createDataTableColumnHelper<PageRow>()

const columns = columnHelper.columns([
  columnHelper.accessor('path', {
    header: 'Page',
    meta: { primary: true, truncate: true },
  }),
  columnHelper.accessor('visitors', {
    cell: ({ getValue }) => formatNumber(getValue()),
    header: 'Visitors',
    meta: { align: 'end' },
  }),
  columnHelper.accessor('views', {
    cell: ({ getValue }) => formatNumber(getValue()),
    header: 'Views',
    meta: { align: 'end' },
  }),
  columnHelper.accessor('bounceRate', {
    cell: ({ getValue }) => formatPercent(getValue() / 100, { maximumFractionDigits: 0 }),
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
  const { period, rows = noRows, status, title } = props
  const { description = summarize(rows, period) } = props
  const table = useDataTable({
    columns,
    data: rows,
    initialState: { sorting: [{ desc: true, id: 'visitors' }] },
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
        <DataTableContent caption={`${title}: ${description}`} table={table} />
      </section>
    </BlockStateProvider>
  )
}

export { DataTable1, exampleProps as dataTable1ExampleProps, type DataTable1Props }
