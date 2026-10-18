'use client'

import {
  BlockMessage,
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { FilterChip } from '@/registry/components/dashboardblocks/dashboard-header'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/data-table'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

type OrderStatus = 'Paid' | 'Pending' | 'Refunded'

interface Order {
  amount: number
  customer: string
  id: string
  region: string
  status: OrderStatus
}

interface Filter {
  field: 'region' | 'status'
  label: string
  value: string
}

interface States3Props {
  defaultFilters: Filter[]
  /** Leave out, or pass none, to show the empty state. */
  orders?: Order[]
  status?: BlockStatus
  title: string
}

const exampleProps: States3Props = {
  defaultFilters: [
    { field: 'status', label: 'Status', value: 'Refunded' },
    { field: 'region', label: 'Region', value: 'Asia Pacific' },
  ],
  orders: [
    {
      amount: 184.5,
      customer: 'Ava Thompson',
      id: '#4821',
      region: 'Europe',
      status: 'Paid',
    },
    {
      amount: 62,
      customer: 'Leo Martins',
      id: '#4820',
      region: 'Asia Pacific',
      status: 'Paid',
    },
    {
      amount: 311.2,
      customer: 'Maya Chen',
      id: '#4819',
      region: 'North America',
      status: 'Refunded',
    },
    {
      amount: 94.99,
      customer: 'Noah Patel',
      id: '#4818',
      region: 'Asia Pacific',
      status: 'Pending',
    },
    {
      amount: 48,
      customer: 'Zoe Williams',
      id: '#4817',
      region: 'Europe',
      status: 'Refunded',
    },
  ],
  title: 'Orders',
}

const STATUS_TONES: Record<OrderStatus, StatusTone> = {
  Paid: 'good',
  Pending: 'warning',
  Refunded: 'neutral',
}

const currency = (value: number) =>
  formatCurrency(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

function describe(shown: number, total: number, filters: Filter[]) {
  const orders = `${total} ${total === 1 ? 'order' : 'orders'}`
  if (filters.length === 0) return `All ${orders}, newest first.`
  const matching = filters
    .map((filter) => `${filter.label.toLowerCase()} ${filter.value}`)
    .join(' and ')
  return `${shown} of ${orders} with ${matching}.`
}

const States3 = (props: States3Props) => {
  const { defaultFilters, orders = [], status, title } = props
  const [filters, setFilters] = useState(defaultFilters)
  const state = getBlockState(status, orders.length === 0)
  const rows = orders.filter((order) =>
    filters.every((filter) => order[filter.field] === filter.value),
  )

  return (
    <BlockStateProvider status={status} empty={orders.length === 0}>
      <section className='@container/data-table flex flex-col gap-3 [--data-table-inset:0px]'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p aria-live='polite' className='text-muted-foreground text-sm'>
              {describe(rows.length, orders.length, filters)}
            </p>
          </BlockReady>
        </header>
        {filters.length > 0 && (
          <ul aria-label='Active filters' className='flex flex-wrap gap-2'>
            {filters.map((filter) => (
              <li key={filter.field} className='flex'>
                <FilterChip
                  field={filter.label}
                  value={filter.value}
                  onRemove={() =>
                    setFilters((current) => current.filter((item) => item !== filter))
                  }
                />
              </li>
            ))}
          </ul>
        )}
        {!state && rows.length === 0 ? (
          <BlockMessage
            icon={
              <IconPlaceholder
                lucide='SearchXIcon'
                tabler='IconZoomCancel'
                hugeicons='SearchRemoveIcon'
                phosphor='MagnifyingGlassMinusIcon'
                remixicon='RiSearchLine'
              />
            }
            className='border-y'
            title='No orders match these filters'
            description='Remove a filter, or clear them all to see every order.'
            action={
              <Button variant='outline' size='sm' onClick={() => setFilters([])}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <DataTable>
            <caption className='sr-only'>{title}</caption>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Customer</DataTableHead>
                <DataTableHead>Region</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead align='end'>Amount</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              <DataTableStateRows colSpan={4} rows={5} />
              {!state &&
                rows.map((order) => (
                  <DataTableRow key={order.id}>
                    <DataTableCell primary truncate>
                      <span className='block truncate'>{order.customer}</span>
                      <span className='text-muted-foreground block text-xs font-normal tabular-nums'>
                        {order.id}
                      </span>
                    </DataTableCell>
                    <DataTableCell label='Region'>{order.region}</DataTableCell>
                    <DataTableCell label='Status'>
                      <StatusLabel tone={STATUS_TONES[order.status]}>
                        {order.status}
                      </StatusLabel>
                    </DataTableCell>
                    <DataTableCell align='end' label='Amount'>
                      {currency(order.amount)}
                    </DataTableCell>
                  </DataTableRow>
                ))}
            </DataTableBody>
          </DataTable>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { States3, exampleProps as states3ExampleProps, type States3Props }
