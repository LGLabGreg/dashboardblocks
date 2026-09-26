'use client'

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTablePagination,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

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
  { className?: string; icon: React.ReactNode; label: string }
> = {
  failed: {
    className: 'text-destructive',
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

const DataTable5 = (props: DataTable5Props) => {
  const { description, pageSize = 5, rows, title } = props
  const [page, setPage] = useState(0)
  const visible = rows.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <DataTable>
        <caption className='sr-only'>
          {`${title}, page ${page + 1} of ${Math.ceil(rows.length / pageSize)}`}
        </caption>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>Customer</DataTableHead>
            <DataTableHead>Order</DataTableHead>
            <DataTableHead>Date</DataTableHead>
            <DataTableHead>Status</DataTableHead>
            <DataTableHead align='end'>Amount</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {visible.map((row) => {
            const state = STATE_CONFIG[row.state]
            return (
              <DataTableRow key={row.id}>
                <DataTableCell primary truncate>
                  <span className='block truncate'>{row.customer}</span>
                  <span className='text-muted-foreground block truncate text-xs font-normal'>
                    {row.email}
                  </span>
                </DataTableCell>
                <DataTableCell label='Order' className='tabular-nums'>
                  {row.id}
                </DataTableCell>
                <DataTableCell label='Date' className='whitespace-nowrap'>
                  {row.date}
                </DataTableCell>
                <DataTableCell label='Status'>
                  <Badge variant='outline' className={state.className}>
                    {state.icon}
                    {state.label}
                  </Badge>
                </DataTableCell>
                <DataTableCell align='end' label='Amount' className='font-medium'>
                  {currency(row.amount)}
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
      <DataTablePagination
        className='border-t px-6 py-3'
        onPageChange={setPage}
        page={page}
        pageSize={pageSize}
        total={rows.length}
      />
    </Card>
  )
}

export { DataTable5, exampleProps as dataTable5ExampleProps, type DataTable5Props }
