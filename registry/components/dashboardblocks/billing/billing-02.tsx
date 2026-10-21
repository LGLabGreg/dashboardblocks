'use client'

import {
  formatBillingDate,
  formatDaysUntil,
  getDaysUntil,
} from '@/registry/components/dashboardblocks/billing'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'

interface PaymentMethod {
  brand: string
  expires: string
  last4: string
}

interface Billing2Props {
  cancelsAtPeriodEnd?: boolean
  /** @default 'USD' */
  currency?: string
  interval: 'month' | 'year'
  nextInvoiceAmount?: number
  now: Date
  onManage?: () => void
  onUpdatePaymentMethod?: () => void
  paymentMethod?: PaymentMethod
  plan?: string
  /** Leave out to show the empty state. */
  price?: number
  renewsAt: Date
  status?: BlockStatus
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
    price = 0,
    renewsAt,
    status,
    summary,
    title,
  } = props
  const state = getBlockState(status, props.price)
  const unavailable = status !== undefined
  const days = getDaysUntil(renewsAt, now)
  const renewal = formatBillingDate(renewsAt)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-1 basis-56 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <Details className='text-muted-foreground block text-sm'>
                <StatusLabel
                  variant='text'
                  tone={cancelsAtPeriodEnd ? 'warning' : 'good'}
                >
                  {cancelsAtPeriodEnd ? 'Cancels' : 'Active'}
                </StatusLabel>
                <span>
                  {cancelsAtPeriodEnd ? 'Ends' : 'Renews'} {formatDaysUntil(days)}
                </span>
              </Details>
            </BlockReady>
          </div>
          <div className='flex shrink-0 gap-2'>
            <Button
              variant='ghost'
              size='sm'
              disabled={unavailable}
              onClick={onUpdatePaymentMethod}
            >
              {paymentMethod ? 'Update card' : 'Add a card'}
            </Button>
            <Button variant='outline' size='sm' disabled={unavailable} onClick={onManage}>
              Manage
            </Button>
          </div>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{plan}</p>
          </BlockReady>
          {state ? (
            <KPIValue />
          ) : (
            <p className='text-4xl font-light tracking-tight tabular-nums'>
              {formatCurrency(price, { currency })}
              <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                / {interval}
              </span>
            </p>
          )}
          {summary && (
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{summary}</p>
            </BlockReady>
          )}
        </div>
        {state !== 'empty' && state !== 'error' && (
          <dl className='grid gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-3'>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-sm'>
                {cancelsAtPeriodEnd ? 'Ends on' : 'Renews on'}
              </dt>
              <dd className='text-2xl font-light tracking-tight tabular-nums'>
                {state ? (
                  <SkeletonText className='w-[4em]' />
                ) : (
                  <time dateTime={renewsAt.toISOString()}>{renewal}</time>
                )}
              </dd>
            </div>
            {!cancelsAtPeriodEnd && (
              <div className='flex flex-col gap-0.5'>
                <dt className='text-muted-foreground text-sm'>Next invoice</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={nextInvoiceAmount ?? price}
                    format={(value) =>
                      formatCurrency(value, {
                        currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    }
                  />
                </dd>
                <dd className='text-muted-foreground text-xs'>
                  <BlockReady className='text-xs'>Before tax</BlockReady>
                </dd>
              </div>
            )}
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-sm'>Payment method</dt>
              <dd className='text-2xl font-light tracking-tight whitespace-nowrap tabular-nums'>
                {state ? (
                  <SkeletonText className='w-[5em]' />
                ) : paymentMethod ? (
                  <>
                    {paymentMethod.brand} <span aria-hidden>•••• </span>
                    <span className='sr-only'>ending in </span>
                    {paymentMethod.last4}
                  </>
                ) : (
                  'None on file'
                )}
              </dd>
              {paymentMethod && (
                <dd className='text-muted-foreground text-xs tabular-nums'>
                  <BlockReady className='text-xs'>
                    Expires {paymentMethod.expires}
                  </BlockReady>
                </dd>
              )}
            </div>
          </dl>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Billing2, exampleProps as billing2ExampleProps, type Billing2Props }
