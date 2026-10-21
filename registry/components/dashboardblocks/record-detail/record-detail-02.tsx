'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityIcon,
  ActivityTime,
  type ActivityTone,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  ActionsMenu,
  BackLink,
  PageHeader,
  PageHeaderActions,
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
} from '@/registry/components/dashboardblocks/table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface LineItem {
  name: string
  price: number
  quantity: number
  sku: string
}

interface OrderEvent {
  at: Date
  icon: ReactNode
  text: string
  tone: ActivityTone
}

type Fulfilment = 'Delivered' | 'Shipped' | 'Unfulfilled'
type PaymentStatus = 'Paid' | 'Pending' | 'Refunded'

interface RecordDetail2Props {
  customer?: { email: string; href: string; name: string; orders: number }
  events?: OrderEvent[]
  items?: LineItem[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onCancel?: () => void
  onPrint?: () => void
  onRefund?: () => void
  /** Leave out to show the empty state. */
  order?: {
    fulfilment: Fulfilment
    id: string
    payment: string
    placed: string
    shipping: number
    shippingAddress: string[]
    status: PaymentStatus
    taxRate: number
  }
  status?: BlockStatus
}

const FULFILMENT_TONE: Record<Fulfilment, StatusTone> = {
  Delivered: 'good',
  Shipped: 'info',
  Unfulfilled: 'warning',
}

const PAYMENT_TONE: Record<PaymentStatus, StatusTone> = {
  Paid: 'good',
  Pending: 'warning',
  Refunded: 'neutral',
}

const money = (value: number) => formatCurrency(value, { precision: 'exact' })

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const exampleProps: RecordDetail2Props = {
  customer: {
    email: 'jonas@northwind.io',
    href: '#',
    name: 'Jonas Weber',
    orders: 12,
  },
  events: [
    {
      at: hoursAgo(3),
      icon: (
        <IconPlaceholder
          lucide='TruckIcon'
          tabler='IconTruck'
          hugeicons='DeliveryTruck01Icon'
          phosphor='TruckIcon'
          remixicon='RiTruckLine'
        />
      ),
      text: 'Shipped with DHL, tracking 00340434161094042557',
      tone: 'info',
    },
    {
      at: hoursAgo(26),
      icon: (
        <IconPlaceholder
          lucide='PackageIcon'
          tabler='IconPackage'
          hugeicons='PackageIcon'
          phosphor='PackageIcon'
          remixicon='RiBox3Line'
        />
      ),
      text: 'Packed by Lena Fischer',
      tone: 'neutral',
    },
    {
      at: hoursAgo(45),
      icon: (
        <IconPlaceholder
          lucide='CreditCardIcon'
          tabler='IconCreditCard'
          hugeicons='CreditCardIcon'
          phosphor='CreditCardIcon'
          remixicon='RiBankCardLine'
        />
      ),
      text: 'Payment of $652.22 captured',
      tone: 'success',
    },
    {
      at: hoursAgo(46),
      icon: (
        <IconPlaceholder
          lucide='ShoppingCartIcon'
          tabler='IconShoppingCart'
          hugeicons='ShoppingCart01Icon'
          phosphor='ShoppingCartIcon'
          remixicon='RiShoppingCartLine'
        />
      ),
      text: 'Order placed on the web store',
      tone: 'neutral',
    },
  ],
  items: [
    { name: 'Oak desk organiser', price: 89, quantity: 2, sku: 'DSK-ORG-OAK' },
    { name: 'Linen notebook, A5', price: 18.5, quantity: 6, sku: 'NB-LIN-A5' },
    { name: 'Brass desk lamp', price: 249, quantity: 1, sku: 'LMP-BRS-01' },
  ],
  now: exampleNow,
  order: {
    fulfilment: 'Shipped',
    id: '#1042',
    payment: 'Visa ending 4242',
    placed: 'Placed Sep 24, 2026 at 14:32',
    shipping: 12,
    shippingAddress: ['Jonas Weber', 'Torstraße 140', '10119 Berlin', 'Germany'],
    status: 'Paid',
    taxRate: 0.19,
  },
}

const RecordDetail2 = (props: RecordDetail2Props) => {
  const {
    customer,
    events = [],
    items = [],
    now,
    onCancel = () => {},
    onPrint = () => {},
    onRefund = () => {},
    order,
    status,
  } = props
  const state = getBlockState(status, order)
  const ready = order !== undefined && state === undefined
  const taxRate = order?.taxRate ?? 0
  const shipping = order?.shipping ?? 0
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * taxRate
  const total = subtotal + shipping + tax
  const units = items.reduce((sum, item) => sum + item.quantity, 0)
  const totals = [
    { label: 'Subtotal', value: subtotal },
    { label: 'Shipping', value: shipping },
    {
      label: `Tax, ${formatPercent(taxRate, { maximumFractionDigits: 0 })}`,
      value: tax,
    },
  ]

  return (
    <BlockStateProvider state={state}>
      <div className='flex flex-col gap-8'>
        <PageHeader>
          <BackLink href='#'>Orders</BackLink>
          <PageHeaderRow className='@2xl/page-header:items-end'>
            {ready ? (
              <PageHeaderHeading
                title={`Order ${order.id}`}
                description={order.placed}
                badge={
                  <Details className='text-muted-foreground text-sm'>
                    <StatusLabel variant='text' tone={PAYMENT_TONE[order.status]}>
                      {order.status}
                    </StatusLabel>
                    <StatusLabel variant='text' tone={FULFILMENT_TONE[order.fulfilment]}>
                      {order.fulfilment}
                    </StatusLabel>
                  </Details>
                }
              />
            ) : (
              <PageHeaderHeading
                title={<BlockStateText variant='short' />}
                description={state === 'loading' && <SkeletonText className='w-48' />}
              />
            )}
            <PageHeaderActions>
              <Button variant='outline' disabled={!ready} onClick={onPrint}>
                Print
              </Button>
              <Button variant='outline' disabled={!ready} onClick={onRefund}>
                Refund
              </Button>
              <ActionsMenu
                disabled={!ready}
                items={[
                  { label: 'Cancel order', onSelect: onCancel, variant: 'destructive' },
                ]}
              />
            </PageHeaderActions>
          </PageHeaderRow>
        </PageHeader>
        <RecordPlaceholder
          aside={['Customer', 'Shipping and payment']}
          sections={['Items', 'Timeline']}
        />
        {ready && (
          <RecordLayout
            aside={
              <>
                {customer && (
                  <RecordSection title='Customer'>
                    <p className='flex flex-col gap-0.5 text-sm'>
                      <a
                        href={customer.href}
                        className='font-medium underline-offset-4 hover:underline'
                      >
                        {customer.name}
                      </a>
                      <span className='text-muted-foreground'>{customer.email}</span>
                      <span className='text-muted-foreground'>
                        {formatNumber(customer.orders)} orders
                      </span>
                    </p>
                  </RecordSection>
                )}
                <RecordSection title='Shipping and payment'>
                  <PropertyList>
                    <Property label='Ship to'>
                      <address className='not-italic'>
                        {order.shippingAddress.map((line) => (
                          <span key={line} className='block'>
                            {line}
                          </span>
                        ))}
                      </address>
                    </Property>
                    <Property label='Payment'>{order.payment}</Property>
                  </PropertyList>
                </RecordSection>
              </>
            }
          >
            <RecordSection
              description={`${formatNumber(units)} items from ${items.length} products, ${money(total)} with shipping and tax.`}
              title='Items'
            >
              <DataTable caption={`Items in order ${order.id}`}>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Product</DataTableHead>
                    <DataTableHead align='end'>Qty</DataTableHead>
                    <DataTableHead align='end'>Price</DataTableHead>
                    <DataTableHead align='end'>Total</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {items.map((item) => (
                    <DataTableRow key={item.sku}>
                      <DataTableCell primary>
                        <span className='block'>{item.name}</span>
                        <span className='text-muted-foreground block font-mono text-xs font-normal'>
                          {item.sku}
                        </span>
                      </DataTableCell>
                      <DataTableCell align='end'>
                        {formatNumber(item.quantity)}
                      </DataTableCell>
                      <DataTableCell align='end'>{money(item.price)}</DataTableCell>
                      <DataTableCell align='end'>
                        {money(item.price * item.quantity)}
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
              <dl className='ml-auto grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 border-t pt-3 text-sm tabular-nums'>
                {totals.map((row) => (
                  <div key={row.label} className='contents'>
                    <dt className='text-muted-foreground'>{row.label}</dt>
                    <dd className='text-right'>{money(row.value)}</dd>
                  </div>
                ))}
                <div className='contents'>
                  <dt className='pt-1.5 font-medium'>Total</dt>
                  <dd className='pt-1.5 text-right text-2xl font-light tracking-tight'>
                    {money(total)}
                  </dd>
                </div>
              </dl>
            </RecordSection>
            <RecordSection title='Timeline'>
              <ActivityFeed aria-label={`History of order ${order.id}`}>
                {events.map((event) => (
                  <ActivityFeedItem
                    key={event.at.getTime()}
                    className='pb-5 last:pb-0'
                    connector
                  >
                    <ActivityIcon
                      className='ring-background'
                      icon={event.icon}
                      tone={event.tone}
                    />
                    <div className='flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 pt-1.5'>
                      <p className='text-sm'>{event.text}</p>
                      <ActivityTime date={event.at} now={now} />
                    </div>
                  </ActivityFeedItem>
                ))}
              </ActivityFeed>
            </RecordSection>
          </RecordLayout>
        )}
      </div>
    </BlockStateProvider>
  )
}

export {
  RecordDetail2,
  exampleProps as recordDetail2ExampleProps,
  type RecordDetail2Props,
}
