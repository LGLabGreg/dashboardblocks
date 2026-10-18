'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  BudgetBar,
  BudgetStatusLabel,
  SpendKey,
  getBudgetPace,
  getElapsed,
} from '@/registry/components/dashboardblocks/spend'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Spend1Props {
  budget: number
  /** @default 'USD' */
  currency?: string
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  periodEnd: Date
  periodStart: Date
  /** Leave out to show the empty state. */
  spent?: number
  status?: BlockStatus
  title: string
}

const exampleProps: Spend1Props = {
  budget: 48_000,
  description: 'Cloud infrastructure for September 2026.',
  now: new Date(Date.UTC(2026, 8, 26)),
  periodEnd: new Date(Date.UTC(2026, 9, 1)),
  periodStart: new Date(Date.UTC(2026, 8, 1)),
  spent: 42_860,
  title: 'Monthly budget',
}

const DAY = 86_400_000

const Spend1 = (props: Spend1Props) => {
  const {
    budget,
    currency = 'USD',
    description,
    now,
    periodEnd,
    periodStart,
    spent = 0,
    status,
    title,
  } = props
  const state = getBlockState(status, props.spent)
  const pace = getBudgetPace({
    budget,
    elapsed: getElapsed(periodStart, periodEnd, now),
    spent,
  })
  const daysLeft = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / DAY))
  const format = (value: number) => formatCurrency(value, { currency })
  const perDay = daysLeft > 0 ? Math.max(0, pace.remaining) / daysLeft : 0
  const share = budget > 0 ? spent / budget : 0

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          <BudgetStatusLabel className='mt-0.5' status={pace.status} />
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <KPIValue value={props.spent} format={format} />
          {state === 'loading' ? (
            <BlockStateText className='text-sm' />
          ) : state ? null : (
            <p className='text-muted-foreground text-sm'>
              Spent so far,{' '}
              <span className='text-foreground font-medium tabular-nums'>
                {formatPercent(share, { maximumFractionDigits: 0 })}
              </span>{' '}
              of the <span className='tabular-nums'>{format(budget)}</span> budget with{' '}
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} to go.
            </p>
          )}
        </div>
        {state !== 'empty' && state !== 'error' && (
          <>
            <div className='flex flex-col gap-2.5'>
              <BudgetBar budget={budget} projected={pace.projected} spent={spent} />
              <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
                <li className='flex items-center gap-1.5'>
                  <SpendKey shape='spent' />
                  Spent
                </li>
                <li className='flex items-center gap-1.5'>
                  <SpendKey shape='projected' />
                  Projected
                </li>
                <li className='flex items-center gap-1.5'>
                  <SpendKey shape='budget' />
                  Budget
                </li>
              </ul>
            </div>
            <dl className='grid grid-cols-2 gap-4 border-t pt-4'>
              <div className='flex flex-col gap-0.5'>
                <dt className='text-muted-foreground text-sm'>Projected month end</dt>
                <dd>
                  <KPIValue className='text-2xl' value={pace.projected} format={format} />
                </dd>
                <dd
                  className={cn(
                    'text-xs tabular-nums',
                    pace.projected > budget
                      ? 'font-medium text-red-700 dark:text-red-400'
                      : 'text-muted-foreground',
                  )}
                >
                  <BlockReady className='text-xs'>
                    {pace.projected > budget
                      ? `${format(pace.projected - budget)} over budget`
                      : `${format(budget - pace.projected)} under budget`}
                  </BlockReady>
                </dd>
              </div>
              <div className='flex flex-col gap-0.5'>
                <dt className='text-muted-foreground text-sm'>
                  {pace.remaining >= 0 ? 'Left to spend' : 'Over budget by'}
                </dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={Math.abs(pace.remaining)}
                    format={format}
                  />
                </dd>
                <dd className='text-muted-foreground text-xs tabular-nums'>
                  <BlockReady className='text-xs'>
                    {pace.remaining > 0 && daysLeft > 0
                      ? `${format(perDay)} a day to stay in budget`
                      : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                  </BlockReady>
                </dd>
              </div>
            </dl>
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Spend1, exampleProps as spend1ExampleProps, type Spend1Props }
