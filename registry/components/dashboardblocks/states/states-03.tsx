'use client'

import { BlockMessage } from '@/registry/components/dashboardblocks/block-state'
import { FilterChip } from '@/registry/components/dashboardblocks/dashboard-header'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Order {
  amount: number
  customer: string
  id: string
  region: string
  status: string
}

interface Filter {
  field: 'region' | 'status'
  label: string
  value: string
}

interface States3Props {
  defaultFilters: Filter[]
  orders: Order[]
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

const currency = (value: number) =>
  `$${value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`

const States3 = (props: States3Props) => {
  const { defaultFilters, orders, title } = props
  const [filters, setFilters] = useState(defaultFilters)
  const rows = orders.filter((order) =>
    filters.every((filter) => order[filter.field] === filter.value),
  )

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription aria-live='polite'>
          {rows.length} of {orders.length} orders
        </CardDescription>
        {filters.length > 0 && (
          <ul
            aria-label='Active filters'
            className='col-span-full mt-2 flex flex-wrap gap-2'
          >
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
      </CardHeader>
      {rows.length === 0 ? (
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
            {rows.map((order) => (
              <DataTableRow key={order.id}>
                <DataTableCell primary truncate>
                  <span className='block truncate'>{order.customer}</span>
                  <span className='text-muted-foreground block text-xs font-normal tabular-nums'>
                    {order.id}
                  </span>
                </DataTableCell>
                <DataTableCell label='Region'>{order.region}</DataTableCell>
                <DataTableCell label='Status'>{order.status}</DataTableCell>
                <DataTableCell align='end' label='Amount'>
                  {currency(order.amount)}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </Card>
  )
}

export { States3, exampleProps as states3ExampleProps, type States3Props }
