'use client'

import { formatCurrency } from '@/registry/components/dashboardblocks/billing'
import {
  BudgetBar,
  BudgetStatusBadge,
  SpendKey,
  getBudgetPace,
} from '@/registry/components/dashboardblocks/spend'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SpendLine {
  budget: number
  label: string
  spent: number
}

interface Spend2Props {
  /** @default 'USD' */
  currency?: string
  description: string
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  lines: SpendLine[]
  title: string
}

const exampleProps: Spend2Props = {
  description: 'Month to date against each budget, 26 of 30 days',
  elapsed: 25 / 30,
  lines: [
    { budget: 18_000, label: 'Compute', spent: 16_940 },
    { budget: 9_500, label: 'Database', spent: 8_120 },
    { budget: 6_000, label: 'Storage', spent: 4_310 },
    { budget: 4_500, label: 'Network', spent: 4_870 },
    { budget: 3_000, label: 'Observability', spent: 2_280 },
  ],
  title: 'Spend by service',
}

const Spend2 = (props: Spend2Props) => {
  const { currency = 'USD', description, elapsed, lines, title } = props
  const format = (value: number) =>
    formatCurrency(value, { compact: value >= 10_000, currency })
  const totals = lines.reduce(
    (sum, line) => ({ budget: sum.budget + line.budget, spent: sum.spent + line.spent }),
    { budget: 0, spent: 0 },
  )
  const total = getBudgetPace({ ...totals, elapsed })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <ul className='flex flex-col gap-4'>
          {lines.map((line) => {
            const pace = getBudgetPace({
              budget: line.budget,
              elapsed,
              spent: line.spent,
            })
            return (
              <li key={line.label} className='flex flex-col gap-2'>
                <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
                  <span className='flex items-center gap-2 text-sm font-medium'>
                    {line.label}
                    <BudgetStatusBadge status={pace.status} />
                  </span>
                  <span className='text-muted-foreground text-sm tabular-nums'>
                    <span className='text-foreground font-medium'>
                      {format(line.spent)}
                    </span>{' '}
                    of {format(line.budget)}
                  </span>
                </div>
                <BudgetBar
                  budget={line.budget}
                  projected={pace.projected}
                  size='sm'
                  spent={line.spent}
                />
              </li>
            )
          })}
        </ul>
        <div className='flex flex-col gap-3 border-t pt-4'>
          <div className='flex flex-wrap items-baseline justify-between gap-2 text-sm'>
            <span className='font-medium'>Total</span>
            <span className='text-muted-foreground tabular-nums'>
              <span className='text-foreground font-medium'>{format(totals.spent)}</span>{' '}
              of {format(totals.budget)}, projected {format(total.projected)}
            </span>
          </div>
          <ul className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
            <li className='flex items-center gap-1.5'>
              <SpendKey shape='spent' />
              Spent
            </li>
            <li className='flex items-center gap-1.5'>
              <SpendKey shape='over' />
              Over budget
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
      </CardContent>
    </Card>
  )
}

export { Spend2, exampleProps as spend2ExampleProps, type Spend2Props, type SpendLine }
