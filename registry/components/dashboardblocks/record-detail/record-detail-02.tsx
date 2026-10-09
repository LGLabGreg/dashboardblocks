'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityIcon,
  ActivityTime,
  type ActivityTone,
} from '@/registry/components/dashboardblocks/activity-feed'
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
} from '@/registry/components/dashboardblocks/record-detail'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

interface RecordDetail2Props {
  customer: { email: string; href: string; name: string; orders: number }
  events: OrderEvent[]
  items: LineItem[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onCancel?: () => void
  onPrint?: () => void
  onRefund?: () => void
  order: {
    fulfilment: string
    id: string
    payment: string
    placed: string
    shipping: number
    shippingAddress: string[]
    status: string
    taxRate: number
  }
}

const currency = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' })

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

const head = 'h-10 px-2 font-medium whitespace-nowrap'
const amount = 'p-2 text-end whitespace-nowrap tabular-nums'

const RecordDetail2 = (props: RecordDetail2Props) => {
  const {
    customer,
    events,
    items,
    now,
    onCancel = () => {},
    onPrint = () => {},
    onRefund = () => {},
    order,
  } = props
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * order.taxRate

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader>
        <BackLink href='#'>Orders</BackLink>
        <PageHeaderRow>
          <PageHeaderHeading
            title={`Order ${order.id}`}
            description={order.placed}
            badge={
              <span className='flex gap-1.5'>
                <Badge variant='secondary'>{order.status}</Badge>
                <Badge variant='outline'>{order.fulfilment}</Badge>
              </span>
            }
          />
          <PageHeaderActions>
            <Button variant='outline' onClick={onPrint}>
              Print
            </Button>
            <Button variant='outline' onClick={onRefund}>
              Refund
            </Button>
            <ActionsMenu
              items={[
                { label: 'Cancel order', onSelect: onCancel, variant: 'destructive' },
              ]}
            />
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>
      <RecordLayout
        aside={
          <>
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-1 text-sm'>
                <a
                  href={customer.href}
                  className='font-medium underline-offset-4 hover:underline'
                >
                  {customer.name}
                </a>
                <span className='text-muted-foreground'>{customer.email}</span>
                <span className='text-muted-foreground'>{customer.orders} orders</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shipping and payment</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              role='region'
              aria-label='Items'
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
              tabIndex={0}
              className='focus-visible:ring-ring/50 w-full overflow-x-auto outline-none focus-visible:ring-3'
            >
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th scope='col' className={`${head} text-start`}>
                      Product
                    </th>
                    <th scope='col' className={`${head} text-end`}>
                      Qty
                    </th>
                    <th scope='col' className={`${head} text-end`}>
                      Price
                    </th>
                    <th scope='col' className={`${head} text-end`}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.sku} className='border-b last:border-0'>
                      <td className='p-2 whitespace-nowrap'>
                        <span className='block font-medium'>{item.name}</span>
                        <span className='text-muted-foreground text-xs'>{item.sku}</span>
                      </td>
                      <td className={amount}>{item.quantity}</td>
                      <td className={amount}>{currency.format(item.price)}</td>
                      <td className={amount}>
                        {currency.format(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className='bg-muted/50 border-t font-medium'>
                  <tr className='border-b'>
                    <td colSpan={3} className='p-2'>
                      Subtotal
                    </td>
                    <td className={amount}>{currency.format(subtotal)}</td>
                  </tr>
                  <tr className='border-b'>
                    <td colSpan={3} className='p-2'>
                      Shipping
                    </td>
                    <td className={amount}>{currency.format(order.shipping)}</td>
                  </tr>
                  <tr className='border-b'>
                    <td colSpan={3} className='p-2'>
                      Tax ({Math.round(order.taxRate * 100)}%)
                    </td>
                    <td className={amount}>{currency.format(tax)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className='p-2 font-semibold'>
                      Total
                    </td>
                    <td className={`${amount} font-semibold`}>
                      {currency.format(subtotal + order.shipping + tax)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed aria-label={`History of order ${order.id}`}>
              {events.map((event) => (
                <ActivityFeedItem
                  key={event.at.getTime()}
                  className='pb-5 last:pb-0'
                  connector
                >
                  <ActivityIcon icon={event.icon} tone={event.tone} />
                  <div className='flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 pt-1.5'>
                    <p className='text-sm'>{event.text}</p>
                    <ActivityTime date={event.at} now={now} />
                  </div>
                </ActivityFeedItem>
              ))}
            </ActivityFeed>
          </CardContent>
        </Card>
      </RecordLayout>
    </div>
  )
}

export {
  RecordDetail2,
  exampleProps as recordDetail2ExampleProps,
  type RecordDetail2Props,
}
