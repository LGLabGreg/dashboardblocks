'use client'

import { formatCurrency } from '@/registry/components/dashboardblocks/billing'
import {
  BudgetBar,
  BudgetStatusBadge,
  SpendKey,
  getBudgetPace,
  getElapsed,
} from '@/registry/components/dashboardblocks/spend'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Spend1Props {
  budget: number
  /** @default 'USD' */
  currency?: string
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  periodEnd: Date
  periodStart: Date
  spent: number
  title: string
}

const exampleProps: Spend1Props = {
  budget: 48_000,
  description: 'Cloud infrastructure, September 2026',
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
    spent,
    title,
  } = props
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-muted-foreground text-xs'>Spent so far</span>
            <span className='text-3xl font-semibold tracking-tight tabular-nums'>
              {format(spent)}
            </span>
            <span className='text-muted-foreground text-sm tabular-nums'>
              {Math.round(share * 100)}% of {format(budget)}
            </span>
          </div>
          <BudgetStatusBadge status={pace.status} />
        </div>
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
            <dt className='text-muted-foreground text-xs'>Projected month end</dt>
            <dd className='text-lg font-semibold tabular-nums'>
              {format(pace.projected)}
            </dd>
            <dd className='text-muted-foreground text-xs tabular-nums'>
              {pace.projected > budget
                ? `${format(pace.projected - budget)} over budget`
                : `${format(budget - pace.projected)} under budget`}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              {pace.remaining >= 0 ? 'Left to spend' : 'Over budget by'}
            </dt>
            <dd className='text-lg font-semibold tabular-nums'>
              {format(Math.abs(pace.remaining))}
            </dd>
            <dd className='text-muted-foreground text-xs tabular-nums'>
              {pace.remaining > 0 && daysLeft > 0
                ? `${format(perDay)} a day for ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`
                : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export { Spend1, exampleProps as spend1ExampleProps, type Spend1Props }
