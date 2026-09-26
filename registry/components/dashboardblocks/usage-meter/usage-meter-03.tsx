'use client'

import {
  UsageBar,
  UsageKey,
  formatUsage,
} from '@/registry/components/dashboardblocks/usage-meter'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MeteredItem {
  /** Units included in the plan. */
  included: number
  name: string
  /** Price of each block of `per` units past what's included. */
  price: number
  /** @default 1 */
  per?: number
  unit: string
  used: number
}

interface UsageMeter3Props {
  description: string
  items: MeteredItem[]
  title: string
}

const exampleProps: UsageMeter3Props = {
  description: 'Usage past your plan is billed on Oct 1',
  items: [
    {
      included: 1_000_000,
      name: 'Events',
      per: 1_000,
      price: 0.5,
      unit: 'events',
      used: 1_240_000,
    },
    { included: 10, name: 'Seats', price: 15, unit: 'seats', used: 12 },
    { included: 500, name: 'Bandwidth', price: 0.08, unit: 'GB', used: 312 },
  ],
  title: 'Metered usage',
}

const OVERAGE_COLOR = 'var(--color-amber-500)'

const currency = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' })

/** "$0.50 per 1K events", "$15.00 per seat". */
function formatPrice(item: MeteredItem) {
  const per = item.per ?? 1
  const unit = per === 1 ? item.unit.replace(/s$/, '') : item.unit
  return `${currency.format(item.price)} per ${per === 1 ? '' : `${formatUsage(per, undefined, { compact: true })} `}${unit}`
}

function getOverageCost(item: MeteredItem) {
  const over = Math.max(0, item.used - item.included)
  return Math.ceil(over / (item.per ?? 1)) * item.price
}

const UsageMeter3 = (props: UsageMeter3Props) => {
  const { description, items, title } = props
  const total = items.reduce((sum, item) => sum + getOverageCost(item), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='flex flex-col gap-4'>
          {items.map((item) => {
            const over = Math.max(0, item.used - item.included)
            const cost = getOverageCost(item)
            return (
              <li key={item.name} className='flex flex-col gap-1.5'>
                <div className='flex items-baseline justify-between gap-3 text-sm'>
                  <span className='font-medium'>{item.name}</span>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    <span className='text-foreground font-medium'>
                      {formatUsage(item.used, undefined, { compact: true })}
                    </span>{' '}
                    of {formatUsage(item.included, item.unit, { compact: true })} included
                  </span>
                </div>
                <UsageBar
                  color='var(--primary)'
                  limit={item.included}
                  overColor={OVERAGE_COLOR}
                  size='sm'
                  used={item.used}
                />
                <div className='text-muted-foreground flex items-baseline justify-between gap-3 text-xs'>
                  <span>{formatPrice(item)}</span>
                  {over > 0 ? (
                    <span className='font-medium text-amber-800 tabular-nums dark:text-amber-400'>
                      +{formatUsage(over, item.unit, { compact: true })} ·{' '}
                      {currency.format(cost)}
                    </span>
                  ) : (
                    <span className='tabular-nums'>
                      {formatUsage(item.included - item.used, item.unit, {
                        compact: true,
                      })}{' '}
                      left
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
          <span className='inline-flex items-center gap-1.5'>
            <UsageKey shape='used' />
            Included
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <UsageKey color={OVERAGE_COLOR} shape='over' />
            Overage
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <UsageKey shape='limit' />
            Plan limit
          </span>
        </div>
      </CardContent>
      <CardFooter className='justify-between gap-3 border-t'>
        <span className='text-muted-foreground text-sm'>Estimated overage</span>
        <span className='text-lg font-semibold tabular-nums'>
          {currency.format(total)}
        </span>
      </CardFooter>
    </Card>
  )
}

export {
  UsageMeter3,
  exampleProps as usageMeter3ExampleProps,
  type MeteredItem,
  type UsageMeter3Props,
}
