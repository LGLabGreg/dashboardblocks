'use client'

import {
  formatBillingDate,
  formatDaysUntil,
  getDaysUntil,
} from '@/registry/components/dashboardblocks/billing'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'
import { type ReactNode, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PaymentMethod {
  brand: string
  expires: string
  last4: string
}

interface Billing2Props extends BlockStateProps {
  cancelsAtPeriodEnd?: boolean
  /** @default 'USD' */
  currency?: string
  interval: 'month' | 'year'
  nextInvoiceAmount?: number
  now: Date
  /** Opens where the plan is changed, such as your payment provider's billing page. A promise shows Opening… until it settles; show its errors yourself. */
  onManage?: () => void | Promise<void>
  /** Opens where the card is changed. A promise shows Opening… until it settles. */
  onUpdatePaymentMethod?: () => void | Promise<void>
  /** A renewal that wasn't paid, as your payment provider's `past_due`: what's owed and when the charge failed. */
  pastDue?: { amount: number; failedOn: Date }
  paymentMethod?: PaymentMethod
  plan?: string
  /** Leave out to show the empty state. */
  price?: number
  renewsAt: Date
  summary?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 26, 12, 0)

interface OpenButtonProps {
  children: ReactNode
  icon?: ReactNode
  onOpen?: () => void | Promise<void>
  unavailable?: boolean
  variant: 'default' | 'ghost' | 'outline'
}

function OpenButton({ children, icon, onOpen, unavailable, variant }: OpenButtonProps) {
  const [pending, startOpening] = useTransition()
  return (
    <Button
      type='button'
      variant={variant}
      size='sm'
      disabled={unavailable}
      className='aria-disabled:opacity-50'
      aria-disabled={pending ? true : undefined}
      onClick={() => {
        if (pending) return
        startOpening(async () => {
          try {
            await onOpen?.()
          } catch {
            // React sends an error thrown in a transition to the error boundary, which replaces the page.
          }
        })
      }}
    >
      {icon}
      {pending ? 'Opening…' : children}
    </Button>
  )
}

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
    pastDue,
    paymentMethod,
    plan,
    price = 0,
    renewsAt,
    errorMessage,
    status,
    summary,
    title,
  } = props
  const state = getBlockState(status, props.price)
  const unavailable = status !== undefined
  const days = getDaysUntil(renewsAt, now)
  const renewal = formatBillingDate(renewsAt)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <Card>
        <CardContent>
          <section className='@container flex flex-col gap-4'>
            <header className='flex flex-wrap items-start justify-between gap-3'>
              <div className='flex min-w-0 flex-1 basis-56 flex-col gap-0.5'>
                <h2 className='font-semibold tracking-tight'>{title}</h2>
                <BlockReady className='text-sm'>
                  <Details className='text-muted-foreground block text-sm'>
                    <StatusLabel
                      variant='text'
                      tone={pastDue ? 'bad' : cancelsAtPeriodEnd ? 'warning' : 'good'}
                    >
                      {pastDue ? 'Past due' : cancelsAtPeriodEnd ? 'Cancels' : 'Active'}
                    </StatusLabel>
                    {pastDue ? (
                      <span>Payment failed {formatBillingDate(pastDue.failedOn)}</span>
                    ) : (
                      <span>
                        {cancelsAtPeriodEnd ? 'Ends' : 'Renews'} {formatDaysUntil(days)}
                      </span>
                    )}
                  </Details>
                </BlockReady>
              </div>
              <div className='flex shrink-0 gap-2'>
                <OpenButton
                  variant={pastDue && !unavailable ? 'default' : 'ghost'}
                  unavailable={unavailable}
                  icon={
                    <IconPlaceholder
                      lucide='CreditCardIcon'
                      tabler='IconCreditCard'
                      hugeicons='CreditCardIcon'
                      phosphor='CreditCardIcon'
                      remixicon='RiBankCardLine'
                      data-icon='inline-start'
                    />
                  }
                  onOpen={onUpdatePaymentMethod}
                >
                  {paymentMethod ? 'Update card' : 'Add a card'}
                </OpenButton>
                <OpenButton variant='outline' unavailable={unavailable} onOpen={onManage}>
                  Manage
                </OpenButton>
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
                    <dt className='text-muted-foreground text-sm'>
                      {pastDue ? 'Amount due' : 'Next invoice'}
                    </dt>
                    <dd>
                      <KPIValue
                        className='text-2xl'
                        value={pastDue?.amount ?? nextInvoiceAmount ?? price}
                        format={(value) =>
                          formatCurrency(value, { currency, precision: 'exact' })
                        }
                      />
                    </dd>
                    {!pastDue && (
                      <dd className='text-muted-foreground text-xs'>
                        <BlockReady className='text-xs'>Before tax</BlockReady>
                      </dd>
                    )}
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
        </CardContent>
      </Card>
    </BlockStateProvider>
  )
}

export { Billing2, exampleProps as billing2ExampleProps, type Billing2Props }
