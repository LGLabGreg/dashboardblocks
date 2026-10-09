'use client'

import {
  createDataTableColumnHelper,
  DataTableContent,
  DataTablePagination,
  useDataTable,
} from '@/registry/components/dashboardblocks/data-table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  description: string
  pageSize?: number
  rows: OrderRow[]
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
  description: 'Orders from the last 7 days',
  pageSize: 5,
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

const STATE_CONFIG: Record<
  OrderState,
  { destructive?: boolean; icon: React.ReactNode; label: string }
> = {
  failed: {
    destructive: true,
    icon: (
      <IconPlaceholder
        lucide='CircleXIcon'
        tabler='IconCircleX'
        hugeicons='CancelCircleIcon'
        phosphor='XCircleIcon'
        remixicon='RiCloseCircleLine'
        aria-hidden
      />
    ),
    label: 'Failed',
  },
  paid: {
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Paid',
  },
  pending: {
    icon: (
      <IconPlaceholder
        lucide='ClockIcon'
        tabler='IconClock'
        hugeicons='Clock01Icon'
        phosphor='ClockIcon'
        remixicon='RiTimeLine'
        aria-hidden
      />
    ),
    label: 'Pending',
  },
  refunded: {
    icon: (
      <IconPlaceholder
        lucide='Undo2Icon'
        tabler='IconArrowBackUp'
        hugeicons='Undo02Icon'
        phosphor='ArrowUUpLeftIcon'
        remixicon='RiArrowGoBackLine'
        aria-hidden
      />
    ),
    label: 'Refunded',
  },
}

const currency = (value: number) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`

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
      return (
        <Badge variant={state.destructive ? 'destructive' : 'outline'}>
          {state.icon}
          {state.label}
        </Badge>
      )
    },
    header: 'Status',
  }),
  columnHelper.accessor('amount', {
    cell: ({ getValue }) => currency(getValue()),
    header: 'Amount',
    meta: { align: 'end', cellClassName: 'font-medium' },
  }),
])

const DataTable5 = (props: DataTable5Props) => {
  const { description, pageSize = 5, rows, title } = props
  const table = useDataTable({
    columns,
    data: rows,
    enableSorting: false,
    pageSize,
  })
  const { pageIndex } = table.state.pagination

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <DataTableContent
        caption={`${title}, page ${pageIndex + 1} of ${table.getPageCount()}`}
        table={table}
      />
      <DataTablePagination className='border-t px-6 py-3' table={table} />
    </Card>
  )
}

export { DataTable5, exampleProps as dataTable5ExampleProps, type DataTable5Props }
