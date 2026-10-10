'use client'

import {
  formatBillingDate,
  formatCurrency,
} from '@/registry/components/dashboardblocks/billing'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type BillingInterval = 'month' | 'year'

interface Plan {
  description: string
  features: string[]
  highlight?: string
  id: string
  name: string
  /** The price per seat per month, billed monthly and billed yearly. */
  price?: Record<BillingInterval, number>
}

interface PlanChange {
  interval: BillingInterval
  planId: string
  seats: number
}

interface Billing5Props {
  /** @default 'USD' */
  currency?: string
  current: PlanChange
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onConfirm?: (change: PlanChange) => void
  onContactSales?: (planId: string) => void
  periodStart: Date
  plans: Plan[]
  renewsAt: Date
  seatsInUse: number
  title: string
}

const exampleProps: Billing5Props = {
  current: { interval: 'month', planId: 'growth', seats: 12 },
  description: 'Pick a plan and the number of seats. Upgrades start today.',
  now: new Date(Date.UTC(2026, 8, 26, 12, 0)),
  periodStart: new Date(Date.UTC(2026, 8, 14)),
  plans: [
    {
      description: 'For small teams getting started.',
      features: ['5 dashboards', '3 data sources', '30 days of history', 'Email support'],
      id: 'starter',
      name: 'Starter',
      price: { month: 19, year: 15 },
    },
    {
      description: 'For teams that run on their data.',
      features: [
        'Unlimited dashboards',
        '20 data sources',
        '2 years of history',
        'Scheduled reports',
        'Email support',
      ],
      highlight: 'Most popular',
      id: 'growth',
      name: 'Growth',
      price: { month: 49, year: 39 },
    },
    {
      description: 'For companies with many teams.',
      features: [
        'Unlimited dashboards',
        'Unlimited data sources',
        'Unlimited history',
        'Scheduled reports',
        'SSO and audit log',
        'Priority support',
      ],
      id: 'scale',
      name: 'Scale',
      price: { month: 89, year: 72 },
    },
    {
      description: 'Custom contracts, security reviews and an account manager.',
      features: ['Everything in Scale', 'Custom data retention', 'Uptime SLA'],
      id: 'enterprise',
      name: 'Enterprise',
    },
  ],
  renewsAt: new Date(Date.UTC(2026, 9, 14)),
  seatsInUse: 11,
  title: 'Change plan',
}

function periodTotal(plan: Plan | undefined, interval: BillingInterval, seats: number) {
  if (!plan?.price) return 0
  return plan.price[interval] * seats * (interval === 'year' ? 12 : 1)
}

function addInterval(date: Date, interval: BillingInterval) {
  const next = new Date(date)
  if (interval === 'year') next.setUTCFullYear(next.getUTCFullYear() + 1)
  else next.setUTCMonth(next.getUTCMonth() + 1)
  return next
}

const Billing5 = (props: Billing5Props) => {
  const {
    currency = 'USD',
    current,
    description,
    now,
    onConfirm,
    onContactSales,
    periodStart,
    plans,
    renewsAt,
    seatsInUse,
    title,
  } = props
  const id = useId()
  const [active, setActive] = useState(current)
  const [interval, setBillingInterval] = useState(current.interval)
  const [planId, setPlanId] = useState(current.planId)
  const [seats, setSeats] = useState(current.seats)
  const [seatsText, setSeatsText] = useState(String(current.seats))
  const [scheduled, setScheduled] = useState<PlanChange | null>(null)
  const [confirmed, setConfirmed] = useState('')

  const money = (value: number) =>
    formatCurrency(value, { currency, fractionDigits: Number.isInteger(value) ? 0 : 2 })

  const plan = plans.find((item) => item.id === planId)
  const activePlan = plans.find((item) => item.id === active.planId)
  const currentTotal = periodTotal(activePlan, active.interval, active.seats)
  const nextTotal = periodTotal(plan, interval, seats)

  const unchanged =
    planId === active.planId && interval === active.interval && seats === active.seats
  const remaining = Math.min(
    1,
    Math.max(
      0,
      (renewsAt.getTime() - now.getTime()) / (renewsAt.getTime() - periodStart.getTime()),
    ),
  )
  const switchesToYearly = interval === 'year' && active.interval === 'month'
  const upgrade =
    !unchanged &&
    (switchesToYearly || (interval === active.interval && nextTotal > currentTotal))
  const dueToday = !upgrade
    ? 0
    : switchesToYearly
      ? Math.max(0, nextTotal - currentTotal * remaining)
      : (nextTotal - currentTotal) * remaining
  const startsAt = upgrade ? now : renewsAt
  const nextRenewal = switchesToYearly ? addInterval(now, 'year') : renewsAt
  const isDowngrade =
    !!plan?.price && !!activePlan?.price && plan.price.month < activePlan.price.month
  const lost = isDowngrade
    ? activePlan.features.filter((feature) => !plan.features.includes(feature))
    : []
  const isScheduled =
    scheduled?.planId === planId &&
    scheduled.interval === interval &&
    scheduled.seats === seats

  const setSeatCount = (value: number) => {
    const next = Math.max(seatsInUse, Math.round(value) || seatsInUse)
    setSeats(next)
    setSeatsText(String(next))
    setConfirmed('')
  }

  const action = unchanged
    ? 'No changes'
    : isScheduled
      ? 'Scheduled'
      : planId === active.planId
        ? 'Update subscription'
        : upgrade
          ? `Upgrade to ${plan?.name}`
          : `Switch to ${plan?.name}`

  const yearlySaving = plan?.price
    ? 1 - plan.price.year / plan.price.month
    : plans.reduce(
        (best, item) =>
          item.price ? Math.max(best, 1 - item.price.year / item.price.month) : best,
        0,
      )

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <fieldset className='bg-muted inline-flex w-fit gap-1 rounded-lg p-1'>
          <legend className='sr-only'>Billing period</legend>
          {(['month', 'year'] as const).map((value) => (
            <label
              key={value}
              className='has-checked:bg-background has-checked:text-foreground text-muted-foreground has-focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium has-checked:shadow-sm has-focus-visible:ring-3'
            >
              <input
                type='radio'
                name={`${id}-interval`}
                value={value}
                checked={interval === value}
                onChange={() => {
                  setBillingInterval(value)
                  setConfirmed('')
                }}
                className='sr-only'
              />
              {value === 'month' ? 'Monthly' : 'Yearly'}
              {value === 'year' && yearlySaving > 0 && (
                <span className='rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-emerald-700 dark:text-emerald-400'>
                  Save {!plan?.price && 'up to '}
                  {Math.round(yearlySaving * 100)}%
                </span>
              )}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend className='sr-only'>Plan</legend>
          <div className='grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4'>
            {plans.map((item) => {
              const isCurrent = item.id === active.planId
              return (
                <label
                  key={item.id}
                  className='has-checked:border-primary has-checked:ring-primary has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 has-checked:ring-1 has-focus-visible:ring-3'
                >
                  <input
                    type='radio'
                    name={`${id}-plan`}
                    value={item.id}
                    checked={planId === item.id}
                    onChange={() => {
                      setPlanId(item.id)
                      setConfirmed('')
                    }}
                    aria-describedby={`${id}-${item.id}-description`}
                    className='sr-only'
                  />
                  <span className='flex flex-wrap items-center gap-2'>
                    <span className='font-medium'>{item.name}</span>
                    {isCurrent ? (
                      <Badge variant='secondary'>Current plan</Badge>
                    ) : scheduled?.planId === item.id ? (
                      <Badge variant='outline'>From {formatBillingDate(renewsAt)}</Badge>
                    ) : (
                      item.highlight && <Badge variant='outline'>{item.highlight}</Badge>
                    )}
                  </span>
                  <span className='flex items-baseline gap-1'>
                    {item.price ? (
                      <>
                        <span className='text-2xl font-semibold tracking-tight tabular-nums'>
                          {money(item.price[interval])}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          per seat / month
                          {interval === 'year' && ', billed yearly'}
                        </span>
                      </>
                    ) : (
                      <span className='text-2xl font-semibold tracking-tight'>
                        Custom
                      </span>
                    )}
                  </span>
                  <span
                    id={`${id}-${item.id}-description`}
                    className='text-muted-foreground text-sm'
                  >
                    {item.description}
                  </span>
                  <ul className='flex flex-col gap-1.5 border-t pt-3 text-sm'>
                    {item.features.map((feature) => (
                      <li key={feature} className='flex items-start gap-2'>
                        <IconPlaceholder
                          lucide='CheckIcon'
                          tabler='IconCheck'
                          hugeicons='Tick02Icon'
                          phosphor='CheckIcon'
                          remixicon='RiCheckLine'
                          aria-hidden
                          className='text-muted-foreground mt-0.5 size-4 shrink-0'
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </label>
              )
            })}
          </div>
        </fieldset>

        {plan?.price ? (
          <div className='grid gap-6 border-t pt-6 @lg:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <label htmlFor={`${id}-seats`} className='text-sm font-medium'>
                Seats
              </label>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  aria-label='Remove a seat'
                  disabled={seats <= seatsInUse}
                  onClick={() => setSeatCount(seats - 1)}
                >
                  <IconPlaceholder
                    lucide='MinusIcon'
                    tabler='IconMinus'
                    hugeicons='MinusSignIcon'
                    phosphor='MinusIcon'
                    remixicon='RiSubtractLine'
                    aria-hidden
                  />
                </Button>
                <Input
                  id={`${id}-seats`}
                  type='number'
                  inputMode='numeric'
                  min={seatsInUse}
                  value={seatsText}
                  onChange={(event) => setSeatsText(event.target.value)}
                  onBlur={() => setSeatCount(Number(seatsText))}
                  aria-describedby={`${id}-seats-hint`}
                  className='w-20 text-center tabular-nums'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  aria-label='Add a seat'
                  onClick={() => setSeatCount(seats + 1)}
                >
                  <IconPlaceholder
                    lucide='PlusIcon'
                    tabler='IconPlus'
                    hugeicons='PlusSignIcon'
                    phosphor='PlusIcon'
                    remixicon='RiAddLine'
                    aria-hidden
                  />
                </Button>
              </div>
              <p id={`${id}-seats-hint`} className='text-muted-foreground text-sm'>
                {seatsInUse} in use by members and invites.
              </p>
            </div>

            <dl className='flex flex-col gap-2 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>
                  {plan.name}, {seats} {seats === 1 ? 'seat' : 'seats'}
                </dt>
                <dd className='font-medium tabular-nums'>
                  {money(nextTotal)} / {interval}
                </dd>
              </div>
              {!unchanged && (
                <>
                  <div className='flex justify-between gap-4'>
                    <dt className='text-muted-foreground'>Now</dt>
                    <dd className='tabular-nums'>
                      {money(currentTotal)} / {active.interval}
                    </dd>
                  </div>
                  <div className='flex justify-between gap-4 border-t pt-2'>
                    <dt className='font-medium'>Due today</dt>
                    <dd className='font-medium tabular-nums'>
                      {money(Math.round(dueToday * 100) / 100)}
                    </dd>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {upgrade ? (
                      <>
                        Starts today, with credit for the unused part of this period. Then{' '}
                        {money(nextTotal)} on{' '}
                        <time dateTime={nextRenewal.toISOString()}>
                          {formatBillingDate(nextRenewal)}
                        </time>
                        .
                      </>
                    ) : (
                      <>
                        Starts on{' '}
                        <time dateTime={startsAt.toISOString()}>
                          {formatBillingDate(startsAt)}
                        </time>
                        , when this period ends. Nothing changes until then.
                      </>
                    )}{' '}
                    Before tax.
                  </p>
                </>
              )}
            </dl>
          </div>
        ) : (
          <p className='text-muted-foreground border-t pt-6 text-sm'>
            {plan?.name} is priced for your team. Talk to us about seats, contract length
            and security reviews.
          </p>
        )}

        {plan?.price && lost.length > 0 && !unchanged && (
          <div className='flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm'>
            <IconPlaceholder
              lucide='TriangleAlertIcon'
              tabler='IconAlertTriangle'
              hugeicons='Alert02Icon'
              phosphor='WarningIcon'
              remixicon='RiErrorWarningLine'
              aria-hidden
              className='mt-0.5 size-4 shrink-0 text-amber-800 dark:text-amber-400'
            />
            <div className='flex flex-col gap-1'>
              <p className='font-medium'>{plan.name} doesn’t include:</p>
              <ul className='text-muted-foreground list-disc pl-4'>
                {lost.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-wrap items-center justify-end gap-2 border-t'>
        <p role='status' className='text-muted-foreground mr-auto text-sm'>
          {confirmed}
        </p>
        {plan?.price ? (
          <Button
            disabled={unchanged || isScheduled}
            onClick={() => {
              const change = { interval, planId, seats }
              if (upgrade) {
                setActive(change)
                setScheduled(null)
                setConfirmed(`You’re on ${plan.name}.`)
              } else {
                setScheduled(change)
                setConfirmed(`Changes on ${formatBillingDate(startsAt)}.`)
              }
              onConfirm?.(change)
            }}
          >
            {action}
          </Button>
        ) : (
          <Button onClick={() => plan && onContactSales?.(plan.id)}>Contact sales</Button>
        )}
      </CardFooter>
    </Card>
  )
}

export {
  Billing5,
  exampleProps as billing5ExampleProps,
  type BillingInterval,
  type Billing5Props,
  type Plan,
  type PlanChange,
}
