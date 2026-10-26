'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ActionsMenu,
  BackLink,
  PageHeader,
  PageHeaderActions,
  type PageHeaderFact,
  PageHeaderFacts,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import {
  Property,
  PropertyList,
  RecordLayout,
  RecordPlaceholder,
  RecordSection,
} from '@/registry/components/dashboardblocks/record-detail'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowLink,
} from '@/registry/components/dashboardblocks/table'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency, joinDetails } from '@/registry/lib/dashboardblocks/format'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type OrderStatus = 'Delivered' | 'Refunded' | 'Shipped'

interface CustomerOrder {
  date: string
  href: string
  id: string
  status: OrderStatus
  total: number
}

interface RecordDetail1Props extends BlockStateProps {
  /** Leave out to show the empty state. */
  customer?: {
    avatar?: string
    email: string
    location: string
    name: string
    notes: string
    phone: string
    since: string
    status: 'Active' | 'At risk' | 'Churned'
    tags: string[]
  }
  onDelete?: () => void
  onEdit?: () => void
  onMerge?: () => void
  orders?: CustomerOrder[]
  stats?: PageHeaderFact[]
}

const exampleProps: RecordDetail1Props = {
  customer: {
    avatar: '/images/avatar-07.webp',
    email: 'jonas@northwind.io',
    location: 'Berlin, Germany',
    name: 'Jonas Weber',
    notes: 'Prefers invoices at the end of the month. Wholesale pricing agreed in May.',
    phone: '+49 30 901820',
    since: 'Mar 14, 2024',
    status: 'Active',
    tags: ['Wholesale', 'EU'],
  },
  orders: [
    { date: 'Sep 24, 2026', href: '#', id: '#1042', status: 'Shipped', total: 652.22 },
    { date: 'Aug 30, 2026', href: '#', id: '#0987', status: 'Delivered', total: 289 },
    { date: 'Aug 2, 2026', href: '#', id: '#0931', status: 'Refunded', total: 94.5 },
    { date: 'Jul 11, 2026', href: '#', id: '#0874', status: 'Delivered', total: 1_210 },
  ],
  stats: [
    { detail: 'Top 5% of customers', label: 'Lifetime value', value: '$4,820' },
    { detail: 'Since Mar 2024', label: 'Orders', value: '12' },
    { label: 'Average order', value: '$401.67' },
    { detail: 'Order #1042', label: 'Last order', value: '3 days ago' },
  ],
}

type CustomerStatus = NonNullable<RecordDetail1Props['customer']>['status']

const CUSTOMER_TONE: Record<CustomerStatus, StatusTone> = {
  Active: 'good',
  'At risk': 'warning',
  Churned: 'neutral',
}

const ORDER_TONE: Record<OrderStatus, StatusTone> = {
  Delivered: 'good',
  Refunded: 'neutral',
  Shipped: 'info',
}

const money = (value: number) => formatCurrency(value, { precision: 'exact' })

const RecordDetail1 = (props: RecordDetail1Props) => {
  const {
    customer,
    onDelete = () => {},
    onEdit = () => {},
    onMerge = () => {},
    orders = [],
    stats = [],
    errorMessage,
    status,
  } = props
  const state = getBlockState(status, customer)
  const ready = customer !== undefined && state === undefined
  const spent = orders
    .filter((order) => order.status !== 'Refunded')
    .reduce((sum, order) => sum + order.total, 0)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <div className='flex flex-col gap-8'>
        <PageHeader>
          <BackLink href='#'>Customers</BackLink>
          <PageHeaderRow className='@2xl/page-header:items-end'>
            {ready ? (
              <PageHeaderHeading
                title={customer.name}
                description={joinDetails(customer.email, customer.location)}
                badge={
                  <StatusLabel tone={CUSTOMER_TONE[customer.status]}>
                    {customer.status}
                  </StatusLabel>
                }
                media={<PersonAvatar className='size-12' person={customer} size='lg' />}
              />
            ) : (
              <PageHeaderHeading
                title={<BlockStateText variant='short' />}
                description={state === 'loading' && <SkeletonText className='w-56' />}
              />
            )}
            <PageHeaderActions>
              <Button variant='outline' disabled={!ready} onClick={onEdit}>
                <IconPlaceholder
                  lucide='PencilIcon'
                  tabler='IconPencil'
                  hugeicons='PencilEdit02Icon'
                  phosphor='PencilSimpleIcon'
                  remixicon='RiPencilLine'
                  data-icon='inline-start'
                />
                Edit
              </Button>
              <ActionsMenu
                disabled={!ready}
                items={[
                  { label: 'Merge with…', onSelect: onMerge },
                  {
                    label: 'Delete customer',
                    onSelect: onDelete,
                    variant: 'destructive',
                  },
                ]}
              />
            </PageHeaderActions>
          </PageHeaderRow>
          {ready && <PageHeaderFacts items={stats} />}
          {state === 'loading' && stats.length > 0 && (
            <PageHeaderFacts
              items={stats.map((fact) => ({
                label: fact.label,
                value: <SkeletonText className='w-16' />,
              }))}
            />
          )}
        </PageHeader>
        <RecordPlaceholder aside={['Details', 'Notes']} sections={['Recent orders']} />
        {ready && (
          <RecordLayout
            aside={
              <>
                <RecordSection title='Details'>
                  <PropertyList>
                    <Property label='Email'>
                      <a
                        href={`mailto:${customer.email}`}
                        className='underline-offset-4 hover:underline'
                      >
                        {customer.email}
                      </a>
                    </Property>
                    <Property label='Phone'>{customer.phone}</Property>
                    <Property label='Location'>{customer.location}</Property>
                    <Property label='Customer since'>{customer.since}</Property>
                    <Property label='Tags'>
                      <span className='flex flex-wrap gap-1'>
                        {customer.tags.map((tag) => (
                          <Badge key={tag} variant='outline'>
                            {tag}
                          </Badge>
                        ))}
                      </span>
                    </Property>
                  </PropertyList>
                </RecordSection>
                <RecordSection title='Notes'>
                  <p className='text-muted-foreground text-sm'>{customer.notes}</p>
                </RecordSection>
              </>
            }
          >
            <RecordSection
              description={`The last ${orders.length} orders, ${money(spent)} after refunds.`}
              title='Recent orders'
            >
              <DataTable caption='Recent orders'>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Order</DataTableHead>
                    <DataTableHead>Date</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                    <DataTableHead align='end'>Total</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {orders.map((order) => (
                    <DataTableRow key={order.id}>
                      <DataTableCell primary>
                        <DataTableRowLink href={order.href}>{order.id}</DataTableRowLink>
                      </DataTableCell>
                      <DataTableCell className='text-muted-foreground whitespace-nowrap'>
                        {order.date}
                      </DataTableCell>
                      <DataTableCell>
                        <StatusLabel tone={ORDER_TONE[order.status]}>
                          {order.status}
                        </StatusLabel>
                      </DataTableCell>
                      <DataTableCell align='end'>{money(order.total)}</DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </RecordSection>
          </RecordLayout>
        )}
      </div>
    </BlockStateProvider>
  )
}

export {
  RecordDetail1,
  exampleProps as recordDetail1ExampleProps,
  type RecordDetail1Props,
}
