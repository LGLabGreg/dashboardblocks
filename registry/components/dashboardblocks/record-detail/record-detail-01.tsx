'use client'

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
  type RecordStat,
  RecordStats,
} from '@/registry/components/dashboardblocks/record-detail'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CustomerOrder {
  date: string
  href: string
  id: string
  status: 'Delivered' | 'Refunded' | 'Shipped'
  total: number
}

interface RecordDetail1Props {
  customer: {
    email: string
    location: string
    name: string
    notes: string
    phone: string
    since: string
    status: string
    tags: string[]
  }
  onDelete?: () => void
  onEdit?: () => void
  onMerge?: () => void
  orders: CustomerOrder[]
  stats: RecordStat[]
}

const currency = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' })

const exampleProps: RecordDetail1Props = {
  customer: {
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
    { date: 'Aug 02, 2026', href: '#', id: '#0931', status: 'Refunded', total: 94.5 },
    { date: 'Jul 11, 2026', href: '#', id: '#0874', status: 'Delivered', total: 1_210 },
  ],
  stats: [
    { label: 'Lifetime value', note: 'Top 5% of customers', value: '$4,820' },
    { label: 'Orders', value: '12' },
    { label: 'Average order', value: '$401.67' },
    { label: 'Last order', value: '3 days ago' },
  ],
}

const head = 'h-10 px-2 font-medium whitespace-nowrap'

const statusVariant = {
  Delivered: 'secondary',
  Refunded: 'outline',
  Shipped: 'default',
} as const

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const RecordDetail1 = (props: RecordDetail1Props) => {
  const {
    customer,
    onDelete = () => {},
    onEdit = () => {},
    onMerge = () => {},
    orders,
    stats,
  } = props

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader>
        <BackLink href='#'>Customers</BackLink>
        <PageHeaderRow>
          <PageHeaderHeading
            title={customer.name}
            description={customer.email}
            badge={<Badge variant='secondary'>{customer.status}</Badge>}
            media={
              <Avatar className='size-12'>
                <AvatarFallback>{initials(customer.name)}</AvatarFallback>
              </Avatar>
            }
          />
          <PageHeaderActions>
            <Button variant='outline' onClick={onEdit}>
              Edit
            </Button>
            <ActionsMenu
              items={[
                { label: 'Merge with…', onSelect: onMerge },
                { label: 'Delete customer', onSelect: onDelete, variant: 'destructive' },
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
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm'>{customer.notes}</p>
              </CardContent>
            </Card>
          </>
        }
      >
        <RecordStats items={stats} />
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='w-full overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th scope='col' className={`${head} text-start`}>
                      Order
                    </th>
                    <th scope='col' className={`${head} text-start`}>
                      Date
                    </th>
                    <th scope='col' className={`${head} text-start`}>
                      Status
                    </th>
                    <th scope='col' className={`${head} text-end`}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className='border-b last:border-0'>
                      <td className='p-2 font-medium whitespace-nowrap'>
                        <a
                          href={order.href}
                          className='underline-offset-4 hover:underline'
                        >
                          {order.id}
                        </a>
                      </td>
                      <td className='text-muted-foreground p-2 whitespace-nowrap'>
                        {order.date}
                      </td>
                      <td className='p-2'>
                        <Badge variant={statusVariant[order.status]}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className='p-2 text-end whitespace-nowrap tabular-nums'>
                        {currency.format(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </RecordLayout>
    </div>
  )
}

export {
  RecordDetail1,
  exampleProps as recordDetail1ExampleProps,
  type RecordDetail1Props,
}
