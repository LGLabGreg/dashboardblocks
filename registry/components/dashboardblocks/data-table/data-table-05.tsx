'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  createDataTableColumnHelper,
  DataTableContent,
  DataTablePagination,
  useDataTable,
} from '@/registry/components/dashboardblocks/data-table'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'

type OrderState = 'failed' | 'paid' | 'pending' | 'refunded'

interface OrderRow {
  amount: number
  customer: string
  date: string
  email: string
  id: string
  state: OrderState
}

interface DataTable5Props {
  /** Defaults to a sentence with the orders' total and any that failed. */
  description?: string
  pageSize?: number
  /** Follows the totals in the default description. */
  period?: string
  /** Leave out, or pass none, to show the empty state. */
  rows?: OrderRow[]
  status?: BlockStatus
  title: string
}

const CUSTOMERS = [
  ['Ava Thompson', 'ava@northwind.io'],
  ['Leo Martins', 'leo@brightpath.dev'],
  ['Maya Chen', 'maya@loop.studio'],
  ['Noah Patel', 'noah@fieldnotes.co'],
  ['Zoe Williams', 'zoe@harbor.app'],
  ['Ethan Brooks', 'ethan@quanta.ai'],
]

const STATES: OrderState[] = [
  'paid',
  'paid',
  'pending',
  'paid',
  'refunded',
  'paid',
  'failed',
]

const exampleProps: DataTable5Props = {
  pageSize: 5,
  period: 'in the last 7 days',
  rows: Array.from({ length: 18 }, (_, index) => {
    const [customer, email] = CUSTOMERS[(index * 5) % CUSTOMERS.length]
    return {
      amount: Math.round((42 + ((index * 73) % 380) + (index % 3) * 0.49) * 100) / 100,
      customer,
      date: `Sep ${25 - Math.floor(index / 3)}`,
      email,
      id: `#${(4_821 - index).toString()}`,
      state: STATES[index % STATES.length],
    }
  }),
  title: 'Recent orders',
}

const STATE_CONFIG: Record<OrderState, { label: string; tone: StatusTone }> = {
  failed: { label: 'Failed', tone: 'bad' },
  paid: { label: 'Paid', tone: 'good' },
  pending: { label: 'Pending', tone: 'warning' },
  refunded: { label: 'Refunded', tone: 'neutral' },
}

const money = (value: number) =>
  formatCurrency(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const summarize = (rows: OrderRow[], period?: string) => {
  const paid = rows.filter((row) => row.state === 'paid')
  const failed = rows.filter((row) => row.state === 'failed').length
  const total = paid.reduce((sum, row) => sum + row.amount, 0)
  const orders = `${rows.length} ${rows.length === 1 ? 'order' : 'orders'}${period ? ` ${period}` : ''}`
  const failures = failed > 0 ? `, ${failed} failed` : ''
  return `${orders}, ${money(total)} paid${failures}.`
}

const noRows: OrderRow[] = []

const columnHelper = createDataTableColumnHelper<OrderRow>()

const columns = columnHelper.columns([
  columnHelper.accessor('customer', {
    cell: ({ row }) => (
      <>
        <span className='block truncate'>{row.original.customer}</span>
        <span className='text-muted-foreground block truncate text-xs font-normal'>
          {row.original.email}
        </span>
      </>
    ),
    header: 'Customer',
    meta: { primary: true, truncate: true },
  }),
  columnHelper.accessor('id', {
    header: 'Order',
    meta: { cellClassName: 'tabular-nums' },
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    meta: { cellClassName: 'whitespace-nowrap' },
  }),
  columnHelper.accessor('state', {
    cell: ({ getValue }) => {
      const state = STATE_CONFIG[getValue()]
      return <StatusLabel tone={state.tone}>{state.label}</StatusLabel>
    },
    header: 'Status',
  }),
  columnHelper.accessor('amount', {
    cell: ({ getValue }) => money(getValue()),
    header: 'Amount',
    meta: { align: 'end' },
  }),
])

const DataTable5 = (props: DataTable5Props) => {
  const { pageSize = 5, period, rows = noRows, status, title } = props
  const { description = summarize(rows, period) } = props
  const table = useDataTable({
    columns,
    data: rows,
    enableSorting: false,
    pageSize,
  })
  const { pageIndex } = table.state.pagination

  return (
    <BlockStateProvider status={status} empty={rows.length === 0}>
      <section className='@container/data-table flex flex-col gap-3 [--data-table-inset:0px]'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <DataTableContent
          caption={`${title}: ${description} Page ${pageIndex + 1} of ${table.getPageCount()}.`}
          loadingRows={pageSize}
          table={table}
        />
        <DataTablePagination className='border-t pt-3' table={table} />
      </section>
    </BlockStateProvider>
  )
}

export { DataTable5, exampleProps as dataTable5ExampleProps, type DataTable5Props }
