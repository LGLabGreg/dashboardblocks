'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  UsageBar,
  UsageKey,
  UsageMeterValue,
  formatUsage,
} from '@/registry/components/dashboardblocks/usage-meter'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'

interface MeteredItem {
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
  /** When the overage is billed, such as `Oct 1`. */
  billedOn: string
  /** Defaults to a sentence naming the meters past what the plan includes. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  items?: MeteredItem[]
  status?: BlockStatus
  title: string
}

const exampleProps: UsageMeter3Props = {
  billedOn: 'Oct 1',
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

const OVERAGE_COLOR = 'var(--color-orange-500)'

const formatMoney = (value: number) => formatCurrency(value, { precision: 'exact' })

function formatPrice(item: MeteredItem) {
  const per = item.per ?? 1
  const unit = per === 1 ? item.unit.replace(/s$/, '') : item.unit
  return `${formatMoney(item.price)} per ${per === 1 ? '' : `${formatUsage(per, undefined, { compact: true })} `}${unit}`
}

function getOverageCost(item: MeteredItem) {
  const over = Math.max(0, item.used - item.included)
  return Math.ceil(over / (item.per ?? 1)) * item.price
}

function joinNames(names: string[]) {
  if (names.length < 2) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function describe(items: MeteredItem[]) {
  const over = items.filter((item) => item.used > item.included).map((item) => item.name)
  if (over.length === 0) return 'Every meter is within what your plan includes.'
  return `${joinNames(over)} ${over.length === 1 ? 'is' : 'are'} past what your plan includes.`
}

const UsageMeter3 = (props: UsageMeter3Props) => {
  const { billedOn, items = [], status, title } = props
  const { description = describe(items) } = props
  const state = getBlockState(status, items)
  const total = items.reduce((sum, item) => sum + getOverageCost(item), 0)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <UsageMeterValue>{formatMoney(total)}</UsageMeterValue>
          {state === 'loading' ? (
            <BlockStateText className='text-sm' />
          ) : state ? null : (
            <p className='text-muted-foreground text-sm'>
              Estimated overage, billed {billedOn}
            </p>
          )}
        </div>
        {state === 'loading' && <BlockStateRows className='border-t' rows={3} />}
        {!state && (
          <>
            <ul className='flex flex-col border-t'>
              {items.map((item) => {
                const over = Math.max(0, item.used - item.included)
                const cost = getOverageCost(item)
                return (
                  <li key={item.name} className='flex flex-col gap-2 border-b py-3'>
                    <div className='flex items-baseline justify-between gap-3 text-sm'>
                      <span className='font-medium'>{item.name}</span>
                      <span className='text-muted-foreground tabular-nums'>
                        <span className='text-foreground font-medium'>
                          {formatUsage(item.used, undefined, { compact: true })}
                        </span>{' '}
                        of {formatUsage(item.included, item.unit, { compact: true })}
                      </span>
                    </div>
                    <UsageBar
                      color='var(--color-chart-2)'
                      limit={item.included}
                      overColor={OVERAGE_COLOR}
                      size='sm'
                      used={item.used}
                    />
                    <div className='text-muted-foreground flex items-baseline justify-between gap-3 text-xs'>
                      <span>{formatPrice(item)}</span>
                      {over > 0 ? (
                        <span className='flex items-baseline gap-3 tabular-nums'>
                          <span className='font-medium text-orange-700 dark:text-orange-400'>
                            {formatUsage(over, item.unit, { compact: true })} over
                          </span>
                          <span className='text-foreground min-w-16 text-right font-medium'>
                            {formatMoney(cost)}
                          </span>
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
          </>
        )}
        {state !== 'empty' && state !== 'error' && (
          <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
            <li className='inline-flex items-center gap-1.5'>
              <UsageKey shape='used' />
              Included
            </li>
            <li className='inline-flex items-center gap-1.5'>
              <UsageKey color={OVERAGE_COLOR} shape='over' />
              Overage
            </li>
            <li className='inline-flex items-center gap-1.5'>
              <UsageKey shape='limit' />
              Plan limit
            </li>
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  UsageMeter3,
  exampleProps as usageMeter3ExampleProps,
  type MeteredItem,
  type UsageMeter3Props,
}
