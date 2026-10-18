'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
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
} from '@/registry/components/dashboardblocks/spend'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'

interface SpendLine {
  budget: number
  label: string
  spent: number
}

interface Spend2Props {
  /** @default 'USD' */
  currency?: string
  /** Defaults to a sentence naming the services over budget, or on pace to go over. */
  description?: string
  /** Share of the period that has passed, 0–1. */
  elapsed: number
  /** Leave out, or pass none, to show the empty state. */
  lines?: SpendLine[]
  status?: BlockStatus
  title: string
}

const exampleProps: Spend2Props = {
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

const joinNames = (names: string[]) =>
  names.length < 2
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

const describe = (lines: SpendLine[], elapsed: number) => {
  const over = lines
    .filter((line) => getBudgetPace({ ...line, elapsed }).status === 'over')
    .map((line) => line.label)
  const atRisk = lines
    .filter((line) => getBudgetPace({ ...line, elapsed }).status === 'at-risk')
    .map((line) => line.label)
  const parts = [
    over.length > 0 &&
      `${joinNames(over)} ${over.length === 1 ? 'is' : 'are'} over budget`,
    atRisk.length > 0 &&
      `${joinNames(atRisk)} ${atRisk.length === 1 ? 'is' : 'are'} on pace to go over`,
  ].filter(Boolean)
  if (parts.length > 0) return `${parts.join(', and ')}.`
  return 'Every service is on pace to stay within budget.'
}

const Spend2 = (props: Spend2Props) => {
  const { currency = 'USD', elapsed, lines = [], status, title } = props
  const { description = describe(lines, elapsed) } = props
  const state = getBlockState(status, lines.length === 0)
  const format = (value: number) =>
    formatCurrency(value, { compact: value >= 10_000, currency })
  const totals = lines.reduce(
    (sum, line) => ({ budget: sum.budget + line.budget, spent: sum.spent + line.spent }),
    { budget: 0, spent: 0 },
  )
  const total = getBudgetPace({ ...totals, elapsed })

  return (
    <BlockStateProvider status={status} empty={lines.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <KPIValue
            value={totals.spent}
            format={(value) => formatCurrency(value, { currency })}
          />
          {state === 'loading' ? (
            <BlockStateText className='text-sm' />
          ) : state ? null : (
            <p className='text-muted-foreground text-sm'>
              Spent of <span className='tabular-nums'>{format(totals.budget)}</span>, on
              pace for{' '}
              <span className='text-foreground font-medium tabular-nums'>
                {format(total.projected)}
              </span>{' '}
              by the end of the month.
            </p>
          )}
        </div>
        {state === 'loading' && <BlockStateRows className='border-t' rows={5} />}
        {!state && (
          <>
            <ul className='flex flex-col border-t'>
              {lines.map((line) => {
                const pace = getBudgetPace({
                  budget: line.budget,
                  elapsed,
                  spent: line.spent,
                })
                return (
                  <li key={line.label} className='flex flex-col gap-2 border-b py-3'>
                    <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'>
                      <span className='flex items-baseline gap-2 text-sm'>
                        <span className='font-medium'>{line.label}</span>
                        {pace.status !== 'on-track' && pace.status !== 'under' && (
                          <BudgetStatusLabel className='text-xs' status={pace.status} />
                        )}
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
          </>
        )}
        {state !== 'empty' && state !== 'error' && (
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
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Spend2, exampleProps as spend2ExampleProps, type Spend2Props, type SpendLine }
