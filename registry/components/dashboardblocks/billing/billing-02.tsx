'use client'

import {
  formatBillingDate,
  formatCurrency,
  getDaysUntil,
} from '@/registry/components/dashboardblocks/billing'
import { CircleCheckIcon, CreditCardIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface PaymentMethod {
  brand: string
  /** Month and year, e.g. "08/2028". */
  expires: string
  last4: string
}

interface Billing2Props {
  /** The subscription ends at the renewal date instead of renewing. */
  cancelsAtPeriodEnd?: boolean
  /** @default 'USD' */
  currency?: string
  interval: 'month' | 'year'
  /** The amount of the next invoice, if it differs from the plan price. */
  nextInvoiceAmount?: number
  /** The time the renewal countdown is measured from. */
  now: Date
  onManage?: () => void
  onUpdatePaymentMethod?: () => void
  paymentMethod?: PaymentMethod
  plan: string
  price: number
  renewsAt: Date
  /** e.g. "12 seats" or "Up to 50,000 events a month". */
  summary?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 26, 12, 0)

const exampleProps: Billing2Props = {
  interval: 'month',
  nextInvoiceAmount: 612,
  now: new Date(NOW),
  paymentMethod: { brand: 'Visa', expires: '08/2028', last4: '4242' },
  plan: 'Growth',
  price: 588,
  renewsAt: new Date(Date.UTC(2026, 9, 14)),
  summary: '12 seats at $49 each, plus usage',
  title: 'Current plan',
}

const Billing2 = (props: Billing2Props) => {
  const {
    cancelsAtPeriodEnd = false,
    currency = 'USD',
    interval,
    nextInvoiceAmount,
    now,
    onManage,
    onUpdatePaymentMethod,
    paymentMethod,
    plan,
    price,
    renewsAt,
    summary,
    title,
  } = props
  const days = getDaysUntil(renewsAt, now)
  const StatusIcon = cancelsAtPeriodEnd ? TriangleAlertIcon : CircleCheckIcon

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Billed {interval === 'month' ? 'monthly' : 'yearly'}
        </CardDescription>
        <CardAction>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
              cancelsAtPeriodEnd
                ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
            )}
          >
            <StatusIcon aria-hidden className='size-3.5' />
            {cancelsAtPeriodEnd ? 'Cancels at period end' : 'Active'}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1'>
          <p className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
            <span className='text-2xl font-semibold tracking-tight'>{plan}</span>
            <span className='text-muted-foreground text-sm tabular-nums'>
              <span className='text-foreground font-medium'>
                {formatCurrency(price, { currency })}
              </span>{' '}
              / {interval}
            </span>
          </p>
          {summary && <p className='text-muted-foreground text-sm'>{summary}</p>}
        </div>
        <dl className='grid gap-4 border-t pt-5 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              {cancelsAtPeriodEnd ? 'Ends on' : 'Renews on'}
            </dt>
            <dd className='text-sm font-medium'>
              <time dateTime={renewsAt.toISOString()}>{formatBillingDate(renewsAt)}</time>
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {days > 1 ? `In ${days} days` : days === 1 ? 'Tomorrow' : 'Today'}
            </dd>
          </div>
          {!cancelsAtPeriodEnd && (
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>Next invoice</dt>
              <dd className='text-sm font-medium tabular-nums'>
                {formatCurrency(nextInvoiceAmount ?? price, {
                  currency,
                  fractionDigits: 2,
                })}
              </dd>
              <dd className='text-muted-foreground text-xs'>Before tax</dd>
            </div>
          )}
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Payment method</dt>
            {paymentMethod ? (
              <>
                <dd className='flex items-center gap-1.5 text-sm font-medium'>
                  <CreditCardIcon aria-hidden className='text-muted-foreground size-4' />
                  {paymentMethod.brand}{' '}
                  <span className='tabular-nums'>
                    <span aria-hidden>•••• </span>
                    <span className='sr-only'>ending in </span>
                    {paymentMethod.last4}
                  </span>
                </dd>
                <dd className='text-muted-foreground text-xs tabular-nums'>
                  Expires {paymentMethod.expires}
                </dd>
              </>
            ) : (
              <dd className='text-sm font-medium'>None on file</dd>
            )}
          </div>
        </dl>
      </CardContent>
      <CardFooter className='flex flex-wrap gap-2 border-t'>
        <Button size='sm' onClick={onManage}>
          Manage subscription
        </Button>
        <Button variant='outline' size='sm' onClick={onUpdatePaymentMethod}>
          {paymentMethod ? 'Update payment method' : 'Add payment method'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export { Billing2, exampleProps as billing2ExampleProps, type Billing2Props }
