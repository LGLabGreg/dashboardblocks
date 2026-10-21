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
  BreakdownBar,
  BreakdownTable,
  getTotal,
} from '@/registry/components/dashboardblocks/breakdown'
import { ChartPlaceholder } from '@/registry/components/dashboardblocks/chart'
import {
  type StockStatus,
  stockStatusConfig,
} from '@/registry/components/dashboardblocks/inventory'
import { formatCurrency, formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Inventory3Props {
  annualCogs?: number
  /** Leave out, with `value`, to show the empty state. */
  counts?: Record<StockStatus, number>
  /** @default 'USD' */
  currency?: string
  /** Defaults to a sentence counting the SKUs that need ordering. */
  description?: string
  status?: BlockStatus
  title: string
  /** Leave out, with `counts`, to show the empty state. */
  value?: number
}

const exampleProps: Inventory3Props = {
  annualCogs: 9_860_000,
  counts: { low: 64, ok: 1_182, out: 17, over: 93 },
  title: 'Stock health',
  value: 2_340_000,
}

const ORDER: StockStatus[] = ['ok', 'low', 'out', 'over']

const noCounts: Record<StockStatus, number> = { low: 0, ok: 0, out: 0, over: 0 }

const Inventory3 = (props: Inventory3Props) => {
  const { annualCogs, counts = noCounts, currency = 'USD', status, title, value } = props
  const state = getBlockState(status, value)
  const segments = ORDER.map((stock) => ({
    color: stockStatusConfig[stock].color,
    label: stockStatusConfig[stock].label,
    value: counts[stock],
  }))
  const total = getTotal(segments)
  const reorder = counts.low + counts.out
  const turnover =
    annualCogs !== undefined && value !== undefined && value > 0
      ? annualCogs / value
      : null
  const {
    description = `${formatNumber(total)} SKUs across every warehouse; ${formatNumber(reorder)} of them are low or out and need ordering.`,
  } = props

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
          <p className='text-4xl font-light tracking-tight tabular-nums'>
            {state || value === undefined ? (
              <BlockStateText variant='short' />
            ) : (
              <>
                {formatCurrency(value, { compact: true, currency })}
                <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                  in stock
                </span>
              </>
            )}
          </p>
          <BlockReady className='text-sm'>
            {turnover !== null && (
              <p className='text-muted-foreground text-sm'>
                Turns over{' '}
                <span className='text-foreground font-medium tabular-nums'>
                  {formatNumber(turnover)}
                </span>{' '}
                times a year, about {Math.round(365 / turnover)} days of stock.
              </p>
            )}
          </BlockReady>
        </div>
        {state === 'loading' && (
          <>
            <ChartPlaceholder className='rounded-full' height={12} />
            <BlockStateRows rows={4} />
          </>
        )}
        {!state && (
          <>
            <BreakdownBar segments={segments} />
            <BreakdownTable
              caption={`${title}: ${description}`}
              labels={['Status', 'SKUs', 'Share']}
              segments={segments}
            />
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Inventory3, exampleProps as inventory3ExampleProps, type Inventory3Props }
